import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import clockIcon from "@/assets/clock.png";
import location_icon from '@/assets/location_icon.svg';
import MapModal from '@/components/layout/MapModal';
import { osmToGeoJson } from "@/components/lib/Utils";
import Toast from '../ui/Toast';
import Swal from 'sweetalert2';


const HistoryRecord = ({ batchSize = 15, onDelete, recordSet }) => {
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [displayedRecords, setDisplayedRecords] = useState(new Set());
    const [currentBatch, setCurrentBatch] = useState(1);
    const [selectedCity, setSelectedCity] = useState('');
    const [availableCities, setAvailableCities] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processedCount, setProcessedCount] = useState(0);
    const [isMapModalVisible, setIsMapModalVisible] = useState(false);
    const [selectedGeoJson, setSelectedGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
    const [selectedDisplayName, setSelectedDisplayName] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>([120.55, 23.67]);
    const [mapZoom, setMapZoom] = useState<number>(12);
    const geoJsonData = osmToGeoJson(recordSet.records);
    const containerRef = useRef(null);

    //Custom Settings
    const filterCities = true;
    const hideUnknownRecords = true;
    const skipFetchLocationInfo = true;

    const title = recordSet.title;
    const records = recordSet.records.elements;


    const cities = useMemo(() => [
        { value: "基隆市", label: "基隆市" },
        { value: "臺北市", label: "臺北市" },
        { value: "新北市", label: "新北市" },
        { value: "桃園市", label: "桃園市" },
        { value: "新竹市", label: "新竹市" },
        { value: "新竹縣", label: "新竹縣" },
        { value: "宜蘭縣", label: "宜蘭縣" },
        { value: "苗栗縣", label: "苗栗縣" },
        { value: "臺中市", label: "臺中市" },
        { value: "彰化縣", label: "彰化縣" },
        { value: "南投縣", label: "南投縣" },
        { value: "雲林縣", label: "雲林縣" },
        { value: "嘉義市", label: "嘉義市" },
        { value: "嘉義縣", label: "嘉義縣" },
        { value: "臺東縣", label: "臺東縣" },
        { value: "臺南市", label: "臺南市" },
        { value: "高雄市", label: "高雄市" },
        { value: "屏東縣", label: "屏東縣" },
        { value: "澎湖縣", label: "澎湖縣" },
        { value: "花蓮縣", label: "花蓮縣" },
        { value: "金門縣", label: "金門縣" },
        { value: "連江縣", label: "連江縣" },
        { value: "未知", label: "未歸類"}
    ], []);

    const fetchLocationInfo = async (lng, lat) => {
        try {
            const requestURL = `https://api.nlsc.gov.tw/other/TownVillagePointQuery1/${lng}/${lat}`;
            const response = await axios.get(requestURL);
            const ctyName = response.data.ctyName || "未知";
            const townName = response.data.townName || "未知";
            return [ctyName, townName];
        } catch (error) {
            console.error("Failed to fetch location info:", error);
            return ["未知", "未知"];
        }
    };

    const standardizeCityName = (cityName) => {
        if (cityName != null)
            return cityName.replace(/台/g, '臺');
    };

    const getLatLon = (record, allRecords) => {
        const calculateAverageLatLon = (latLonArray) => {
            const total = latLonArray.length;
            const sumLatLon = latLonArray.reduce(
                (acc, latLon) => {
                    acc.lat += latLon.lat;
                    acc.lon += latLon.lon;
                    return acc;
                },
                { lat: 0, lon: 0 }
            );
            return {
                lat: sumLatLon.lat / total,
                lon: sumLatLon.lon / total
            };
        };
    
        const findLatLonInWay = (way) => {
            const latLonArray = [];
            for (const nodeId of way.nodes) {
                const nodeRecord = allRecords.find(r => r.id === nodeId && r.type === 'node');
                if (nodeRecord && nodeRecord.lat !== undefined && nodeRecord.lon !== undefined) {
                    latLonArray.push({ lat: nodeRecord.lat, lon: nodeRecord.lon });
                }
            }
            return latLonArray;
        };
    
        const findLatLonInRelation = (relation) => {
            const latLonArray = [];
            for (const member of relation.members) {
                if (member.type === 'way') {
                    const wayRecord = allRecords.find(r => r.id === member.ref && r.type === 'way');
                    if (wayRecord) {
                        const wayLatLon = findLatLonInWay(wayRecord);
                        latLonArray.push(...wayLatLon);
                    }
                } else if (member.type === 'relation') {
                    const subRelation = allRecords.find(r => r.id === member.ref && r.type === 'relation');
                    if (subRelation) {
                        const subRelationLatLon = findLatLonInRelation(subRelation);
                        latLonArray.push(...subRelationLatLon);
                    }
                }
            }
            return latLonArray;
        };
    
        // 初始化 lats 和 lons 作為空數組
        record.lats = [];
        record.lons = [];
    
        // 如果 record 自己有經緯度，直接添加到 lats 和 lons
        if (record.lat !== undefined && record.lon !== undefined) {
            record.lats.push(record.lat);
            record.lons.push(record.lon);
            return { lat: record.lat, lon: record.lon };
        }
    
        let latLonArray = [];
        
        // 如果是 relation，找出其所有經緯度並計算平均值
        if (record.type === 'relation') {
            latLonArray = findLatLonInRelation(record);
        } 
        // 如果是 way，找出其所有經緯度並計算平均值
        else if (record.type === 'way') {
            latLonArray = findLatLonInWay(record);
        }
    
        if (latLonArray.length > 0) {
            record.lats = latLonArray.map(coord => coord.lat);
            record.lons = latLonArray.map(coord => coord.lon);
            const avgLatLon = calculateAverageLatLon(latLonArray);
            return avgLatLon;
        }
    
        return null;
    };
    

    useEffect(() => {
        const filterRecordsByCityAndDistrict = async () => {
            setLoading(true);
            const filtered = [];
            const citySet = new Set();
            const districtSet = new Set();
    
            for (const record of records) {
                if (record?.tags && Object.keys(record.tags).length > 0) {
                    let ctyName = standardizeCityName(record.tags["addr:city"]) || "未知";
                    let townName = record.tags["addr:district"] || "未知";
                    record.displayName = getDisplayName(record);
                    
                    // 優先過濾掉未命名紀錄(如果有開啟設定)
                    if (hideUnknownRecords && record.displayName === '未命名紀錄') {
                        setProcessedCount(prevCount => prevCount + 1);
                        continue;
                    }
                    
                    // 替每一個搜尋結果設定經緯度
                    const location = getLatLon(record, records);

                    // 透過國土鑑測API根據經緯度去取得大概地理位置
                    if ((ctyName === "未知" || townName === "未知") && !skipFetchLocationInfo) {
                        const locationInfo = await fetchLocationInfo(location.lon, location.lat);
                        ctyName = standardizeCityName(locationInfo[0]);
                        townName = locationInfo[1];
                    }

                    // 透過國土鑑測API根據經緯度去取得大概地理位置(有部分地址的額外請求)
                    if ((ctyName === "未知" || townName === "未知") && record.tags["addr:street"]) {
                        const locationInfo = await fetchLocationInfo(location.lon, location.lat);
                        ctyName = standardizeCityName(locationInfo[0]);
                        townName = locationInfo[1];
                    }
                    

                    // if (ctyName === "未知" || townName === "未知") {
                    //     setProcessedCount(prevCount => prevCount + 1);
                    //     continue;
                    // }

                    record.ctyName = ctyName;
                    record.townName = townName;
                    record.displayAddress = getDisplayAddress(record);
                    
                    citySet.add(ctyName);
                    if (ctyName === selectedCity || !selectedCity) {
                        districtSet.add(townName);
                        if (!selectedDistrict || selectedDistrict === townName) {
                            filtered.push(record);
                        }
                    }
    
                    setProcessedCount(prevCount => prevCount + 1);
                }
            }
    
            filtered.sort((a, b) => {
                if (a.tags.branch && !b.tags.branch) return -1;
                if (!a.tags.branch && b.tags.branch) return 1;
    
                if (a.tags.is_in && !b.tags.is_in) return -1;
                if (!a.tags.is_in && b.tags.is_in) return 1;
    
                if (a.tags.name && !b.tags.name) return -1;
                if (!a.tags.name && b.tags.name) return 1;
    
                return Object.keys(b.tags).length - Object.keys(a.tags).length;
            });
    
            setFilteredRecords(filtered);
            setDisplayedRecords(new Set(filtered.slice(0, batchSize)));
            setAvailableCities([...citySet]);
            setAvailableDistricts([...districtSet]);
            setLoading(false);
        };
    
        setProcessedCount(0);
        filterRecordsByCityAndDistrict();
    }, [records, batchSize, selectedCity, selectedDistrict]);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        const scrollTolerance = 10;

        const hasMoreRecords = currentBatch * batchSize < filteredRecords.length;
        
        const isAtEnd = container.scrollWidth - container.scrollLeft - container.clientWidth <= scrollTolerance;

        if (isAtEnd && hasMoreRecords) {
            container.scrollLeft = container.scrollLeft - 1;
            loadMoreRecords();
        }
    }, [currentBatch, filteredRecords]);

    const loadMoreRecords = useCallback(() => {
        const newBatch = currentBatch + 1;
        const newRecords = filteredRecords.slice(batchSize * (newBatch - 1), batchSize * newBatch);
        setDisplayedRecords(prevRecords => {
            const updatedRecords = new Set(prevRecords);
            newRecords.forEach(record => updatedRecords.add(record));
            return updatedRecords;
        });
        setCurrentBatch(newBatch);
    }, [currentBatch, filteredRecords, batchSize]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    function getDisplayName(record) {
        if (record?.tags["brand:zh"] && record?.tags?.branch) {
            return `${record.tags["brand:zh"]}-${record.tags.branch}`;
        }
        
        if (record?.tags?.name && record?.tags?.branch) {
            return `${record.tags.name}-${record.tags.branch}`;
        }

        if (record?.tags?.brand && record?.tags?.branch) {
            return `${record.tags.brand}-${record.tags.branch}`;
        }

        if (record?.tags?.full_name) {
            return record.tags.full_name;
        }

        if (record?.tags?.name) {
            return record.tags.name;
        }

        if (record?.tags["name:en"]) {
            return record.tags["name:en"];
        }

        if (record?.tags?.is_in) {
            return record.tags.is_in;
        }

        return '未命名紀錄';
    }

    function getDisplayAddress(record) {
        if (record.tags["addr:full"] != null) {
            const fullAddress = record.tags["addr:full"].replace(/^\d+/, "");
            return fullAddress;
        }

        const parts = [];
        let streetName = record.tags["addr:street"] || "";
        let housenumber = record.tags["addr:housenumber"] || "";
        let floor = record.tags["addr:floor"] || "";
        
        if (record.ctyName) parts.push(record.ctyName);
        if (record.townName && record.ctyName != "未知") parts.push(record.townName);
        if (streetName) parts.push(streetName);
        if (housenumber) parts.push(housenumber + "號");
        if (floor) parts.push(floor + "樓");

        return parts.length > 0 ? parts.join('') : "未知";
    }

    const handleDeleteRecord = async () => {
        Swal.fire({
            title: "這項動作不可復原",
            text: "確定要刪除 " + title + " 嗎?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "是的，請刪除！",
            cancelButtonText: "我再考慮一下"
          }).then(async (result) => {
            if (result.isConfirmed) {
                onDelete(recordSet);
            }
          });
    };

    const handleMapShow = async (record) => {
        
        console.log(record);
        const feature = geoJsonData.features.find(f => f.id === `${record.type}/${record.id}`);
        
        if (feature) {
            const filteredGeoJson: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: [feature as GeoJSON.Feature<GeoJSON.Geometry>]
            };
    
            const lats = record.lats;
            const lons = record.lons;
    
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);

            const latDiff = maxLat - minLat;
            const lonDiff = maxLon - minLon;
    
            const maxDiff = Math.max(latDiff, lonDiff);
            
            const baseZoomLevel = 14
            const maxZoomLevel = 17.5;
            const minZoomLevel = 6.5;
            const zoomLevel = Math.min(Math.max(baseZoomLevel - Math.log2(maxDiff * 200), minZoomLevel), maxZoomLevel);

            const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
    
            setSelectedGeoJson(filteredGeoJson);
            setSelectedDisplayName(record.displayName);
            setIsMapModalVisible(true);
            setMapCenter(center);
            setMapZoom(Math.round(zoomLevel));
        } else {
            Toast.fire({
                icon: 'error',
                title: "無法找到對應的地圖資料",
            });
        }
    };
    

    const handleCloseModal = () => {
        setIsMapModalVisible(false);
        setSelectedGeoJson(null);
    };

    const showCitySelector = availableCities.length > 1;
    const showDistrictSelector = (availableCities.length === 1 && availableDistricts.length > 1) || (availableDistricts.length > 1 && selectedCity);


    return (
        <section className="mx-6 md:mx-10 my-8">
            <main className="flex flex-col box-border overflow-x-auto">
                <div className="flex items-start flex-col sm:flex-row justify-between mb-4 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                        <img
                            src={clockIcon}
                            className="w-7 sm:w-8 ml-1"
                        />
                        <div className='text-xl sm:text-2xl md:max-w-full break-all mr-4'>
                            {title} ({loading ? `${processedCount}/${records.length}筆資料處理中...請稍後` : `${filteredRecords.length}筆`})
                        </div>
                    </div>
                    <div className="w-full sm:w-0 flex items-center justify-end gap-2 md:gap-4 relative h-8">
                        {showCitySelector && (
                            <select
                                id="citySelect"
                                name="city"
                                className="text-center bg-gray-200 border border-black rounded-xl text-xl px-1 cursor-pointer h-full"
                                value={selectedCity}
                                onChange={(e) => {
                                    setSelectedCity(e.target.value);
                                    setSelectedDistrict('');
                                }}
                            >
                                <option value="">縣市篩選</option>
                                {cities
                                    .filter(city => !filterCities || availableCities.includes(city.value))
                                    .map((city) => (
                                        <option key={city.value} value={city.value}>
                                            {city.label}
                                        </option>
                                    ))}
                            </select>
                        )}

                        {showDistrictSelector && (
                            <select
                                id="districtSelect"
                                name="district"
                                className="text-center bg-gray-200 border border-black rounded-xl text-xl px-1 cursor-pointer h-full"
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                            >
                                <option value="">行政區篩選</option>
                                {availableDistricts.map((district, index) => (
                                    <option key={index} value={district}>
                                        {district}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="hover:bg-red-700 border border-black rounded-xl h-full flex justify-center items-center bg-gray-200"
                            onClick={() => handleDeleteRecord()}
                        >
                            <i className="fa-solid fa-x cursor-pointer px-4 hover:text-white"></i>
                        </div>
                    </div>
                </div>

                <div ref={containerRef} className="flex flex-nowrap overflow-x-auto pb-4 gap-6 scroll-container">
                    {loading && displayedRecords.size === 0 ? (
                        Array.from({ length: batchSize }).map((_, index) => (
                            <Skeleton key={index} />
                        ))
                    ) : (
                        Array.from(displayedRecords).map((record: RecordType, index) => (
                            <article key={index} className="rounded-xl shadow-lg flex flex-col w-auto h-auto min-h-40 box-border border-4 border-white flex-shrink-0">
                                <h3 className="bg-darkBlueGrey text-white text-xl rounded-t-xl flex box-border relative px-2 py-2">
                                    {index + 1}. {record.displayName}
                                </h3>
                                <div className="bg-gray-200 flex flex-col text-2xl px-4 py-2 flex-grow justify-between rounded-b-xl">
                                    <div className="flex gap-2 text-lg cursor-pointer" title="點擊複製地址" onClick={() => navigator.clipboard.writeText(record.displayAddress)}>
                                        <img className="h-7 self-start" src={location_icon} />
                                        <p>{record.displayAddress}</p>
                                    </div>
                                    <div className="flex flex-row justify-end">
                                        <a className="text-[#144583] text-lg underline font-bold underline-offset-4 cursor-pointer"
                                            onClick={() => handleMapShow(record)}>
                                            地圖顯示
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                    <MapModal
                        isVisible={isMapModalVisible}
                        textTitle={selectedDisplayName}
                        onClose={handleCloseModal}
                        geoJsonData={selectedGeoJson}
                        center={mapCenter}
                        zoom={mapZoom}
                    />
                </div>
            </main>
        </section>
    );
};

export default HistoryRecord;

const Skeleton = () => {
    return (
        <div className="rounded-xl shadow-lg flex flex-col w-[246px] h-auto min-h-40 box-border border-4 border-white flex-shrink-0 bg-gray-300 animate-pulse">
            <div className="bg-darkBlueGrey h-[44px] rounded-t-xl"></div>
            <div className="flex-grow bg-gray-200 p-4"></div>
        </div>
    );
};

interface RecordType {
    displayName: string;
    displayAddress: string;
    [key: string]: any;
}