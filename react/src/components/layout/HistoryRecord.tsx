import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import clockIcon from "@/assets/clock.png";
import location_icon from '@/assets/location_icon.svg';
import MapModal from '@/components/layout/MapModal';
import { osmToGeoJson, record_getDisplayAddress, record_getDisplayName } from "@/components/lib/Utils";
import Toast from '../ui/Toast';
import Swal from 'sweetalert2';
import { useAuth } from "@/components/lib/AuthProvider";
import { FavoriteAndResultModal } from './FavoriteSelectionModal';
import { editQueryHistoryRecords } from '../lib/API';


const HistoryRecord = ({ batchSize = 15, onDelete, recordSet }) => {
    const { JWTtoken } = useAuth();
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
    const [isFavoriteModalVisible, setIsFavoriteModalVisible] = useState(false);
    const [selectedGeoJson, setSelectedGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
    const [selectedDisplayName, setSelectedDisplayName] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>([120.55, 23.67]);
    const [mapZoom, setMapZoom] = useState<number>(12);
    const [selectedRecordList, setSelectedRecordList] = useState([]);
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

    // 透過國土鑑測API取得大略縣市、鄉鎮市區
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

    // 替換文字
    const standardizeCityName = (cityName) => {
        if (cityName != null)
            return cityName.replace(/台/g, '臺');
    };

    // 在Node、Way、Relations內取得經緯度
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
    
    //整理每一筆Record資訊(設置標籤、取得大概位置、經緯度)
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
                    record.displayName = record_getDisplayName(record);
                    
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
                    record.displayAddress = record_getDisplayAddress(record);
                    
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

    // 監聽到滑動時的判定
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
    
    // 載入更多紀錄
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

    // 監聽滑鼠滾動事件
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

    // 刪除紀錄
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

    // 點擊"地圖顯示"後的邏輯
    const handleMapShow = (records) => {
        if (!Array.isArray(records)) {
            records = [records]; // 若只傳入單筆資料，將其轉為陣列
        }
    
        const features = records.map(record => {
            return geoJsonData.features.find(f => f.id === `${record.type}/${record.id}`);
        }).filter(f => f !== undefined); // 過濾掉找不到地圖數據的紀錄
    
        if (features.length > 0) {
            const filteredGeoJson: GeoJSON.FeatureCollection = {
                type: "FeatureCollection",
                features: features as GeoJSON.Feature<GeoJSON.Geometry>[]
            };
    
            // 計算所有選取紀錄的經緯度範圍
            const lats = records.flatMap(record => record.lats);
            const lons = records.flatMap(record => record.lons);
    
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
    
            const latDiff = maxLat - minLat;
            const lonDiff = maxLon - minLon;
            const maxDiff = Math.max(latDiff, lonDiff);
    
            const baseZoomLevel = 14;
            const maxZoomLevel = 17.5;
            const minZoomLevel = 6.5;
            const zoomLevel = Math.min(Math.max(baseZoomLevel - Math.log2(maxDiff * 200), minZoomLevel), maxZoomLevel);
    
            const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
    
            setSelectedGeoJson(filteredGeoJson);
            setSelectedDisplayName(records.length > 1 ? `批量顯示 ${records.length} 筆紀錄` : records[0].displayName);
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
    

    // 處理點擊事件，選取紀錄並變更邊框顏色
    const handleRecordClick = (record) => {
        setSelectedRecordList(prevSelected => {
            if (prevSelected.includes(record)) {
                return prevSelected.filter(r => r !== record); // 如果已選取，則取消選取
            } else {
                return [...prevSelected, record]; // 否則加入選取列表
            }
        });
    };

    // 用於檢查是否該紀錄已選取
    const isSelected = (record) => selectedRecordList.includes(record);

    // 處理批次作業
    const handleMultiTask = (event) => {
        const value = event.target.value;
    
        switch (value) {
            case "全選": {
                setSelectedRecordList(filteredRecords);
                break;
            }
            case "取消全選": {
                setSelectedRecordList([]);
                break;
            }
            case "加入收藏": {
                setIsFavoriteModalVisible(true);
                break;
            }
            case "地圖顯示": {
                if (selectedRecordList.length > 0) {
                    handleMapShow(selectedRecordList);
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "請先選擇紀錄",
                    });
                }
                break;
            }
            case "移除": {
                Swal.fire({
                    title: `你確定要刪除這 ${selectedRecordList.length} 筆紀錄嗎？`,
                    text: "此操作將無法復原！",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "是的，刪除！",
                    cancelButtonText: "取消"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const updatedRecordSet = generateUpdatedRecordSet(recordSet, selectedRecordList, false);
                        const updatedRecordElements = updatedRecordSet.records.elements;
                        let tempRecordSet = recordSet;
                
                        if(updatedRecordElements.length === 0){
                            onDelete(recordSet);
                        } else {
                            tempRecordSet.records.elements = updatedRecordElements;
                            const response = await editQueryHistoryRecords(JWTtoken, recordSet.id, tempRecordSet.records);
                            if(response.statusCode != 200){
                                Toast.fire({
                                    icon: "error",
                                    text: response.message
                                });
                                return;
                            }
                        }
                        
                        recordSet.records.elements = updatedRecordElements;
                        setFilteredRecords(updatedRecordElements);
                        setDisplayedRecords(new Set(updatedRecordElements.slice(0, batchSize)));
                        setSelectedRecordList([]);
                        
                        Swal.fire({
                            icon: "success",
                            title: "刪除成功",
                            text: `${selectedRecordList.length} 筆紀錄已刪除`,
                        });
                    }
                });
                break;
            }
            case "匯出": {
                // 開始生成 KML
                let kmlData = `<?xml version="1.0" encoding="UTF-8"?>\n`;
                kmlData += `<kml xmlns="http://www.opengis.net/kml/2.2">\n`;
                kmlData += `<Document>\n`;
                kmlData += `<name>${recordSet.title || 'Exported Records'}</name>\n`;
    
                selectedRecordList.forEach((record) => {
                    const name = record.displayName || "未命名";
                    // 確保有經緯度
                    if (record.lats !== undefined && record.lons !== undefined) {
                        const tempLat = record.lat = record.lats.reduce((acc, lat) => acc + lat, 0)/record.lats.length;
                        const tempLon = record.lon = record.lons.reduce((acc, lon) => acc + lon, 0)/record.lons.length;
                        kmlData += `<Placemark>\n`;
                        kmlData += `<name>${name}</name>\n`;
                        kmlData += `<Point>\n<coordinates>${tempLon},${tempLat}</coordinates>\n</Point>\n`;
                        kmlData += `</Placemark>\n`;
                    }
                });
    
                kmlData += `</Document>\n</kml>`;
    
                // 建立一個 Blob，並設置類型為 KML
                const blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
    
                // 使用 URL.createObjectURL 生成下載連結
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${recordSet.title || "recordSet"}.kml`;
    
                // 模擬點擊下載連結
                link.click();
    
                // 釋放 URL.createObjectURL 所佔用的記憶體
                URL.revokeObjectURL(link.href);
                break;
            }
        }
    
        event.target.value = "批量操作";
    };
    

    //將選擇的record轉換成新的recordSet並返回
    const generateUpdatedRecordSet = (recordSet, selectedRecordList, whitelist = true) => {
        const nodesToInclude = new Set();
        const selectedIds = new Set();
    
        // 收集選中的 way 或 relation 及其相關的節點
        selectedRecordList.forEach(record => {
            selectedIds.add(record.id);  // 儲存當前選中的 way 或 relation 的 ID
    
            if (record.type === 'way' || record.type === 'relation') {
                // 如果是 way 或 relation，將其節點一併加入
                record.nodes?.forEach(nodeId => nodesToInclude.add(nodeId));
    
                // 若為 relation，處理其子 relation 或 ways
                if (record.type === 'relation') {
                    record.members?.forEach(member => {
                        if (member.type === 'node') {
                            nodesToInclude.add(member.ref);
                        } else {
                            selectedIds.add(member.ref);  // 處理 relation 中的 members
                        }
                    });
                }
            }
        });
    
        // 使用 `whitelist` 來決定是保留選中的項目還是排除選中的項目
        const updatedRecords = recordSet.records.elements.filter(record => {
            const isSelected = selectedIds.has(record.id) || nodesToInclude.has(record.id);
            return whitelist ? isSelected : !isSelected;
        });
    
        return {
            ...recordSet,
            records: {
                ...recordSet.records,
                elements: updatedRecords,
            },
        };
    };

    // 一些用來判定篩選下拉選單是否顯示的變數
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
                            {title} ({loading ? `${processedCount}/${records.length}筆資料處理中...請稍後` : selectedRecordList.length > 0 ? `已選取${selectedRecordList.length}/${filteredRecords.length}筆` : `${filteredRecords.length}筆`})
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 relative h-8 w-full md:w-auto overflow-x-auto whitespace-nowrap"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                          }}
                    >
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

                        {selectedRecordList.length > 0 && (
                            <select className="text-center bg-gray-200 border border-black rounded-xl text-xl px-1 cursor-pointer h-full"
                                onChange={(e)=>handleMultiTask(e)}
                                value="批量操作"
                            >
                                <option disabled>批量操作</option>
                                {selectedRecordList.length !== filteredRecords.length ? <option value="全選">全選</option> : <option value="取消全選">取消全選</option>}
                                <option value="加入收藏">加入收藏</option>
                                <option value="地圖顯示">地圖顯示</option>
                                <option value="移除">移除</option>
                                <option value="匯出">匯出</option>
                            </select>
                        )}

                        <div className="hover:bg-red-700 border border-black rounded-xl h-full flex justify-center items-center bg-gray-200 cursor-pointer"
                            onClick={() => handleDeleteRecord()}
                        >
                            <i className="fa-solid fa-x px-4 hover:text-white"></i>
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
                            <HistoryRecordComponent
                                key={record.id}
                                index={index}
                                handleRecordClick={handleRecordClick}
                                record={record}
                                isSelected={isSelected}
                                handleMapShow={handleMapShow}
                            />
                        ))
                    )}
                    <MapModal
                        isVisible={isMapModalVisible}
                        textTitle={selectedDisplayName}
                        onClose={()=>{setIsMapModalVisible(false);setSelectedGeoJson(null);}}
                        geoJsonData={selectedGeoJson}
                        center={mapCenter}
                        zoom={mapZoom}
                        ChildComponent={true}
                    />
                    <FavoriteAndResultModal
                        isVisible={isFavoriteModalVisible}
                        JWTtoken={JWTtoken}
                        recordToAppend={generateUpdatedRecordSet(recordSet, selectedRecordList, true)}
                        onClose={() => { setIsFavoriteModalVisible(false); }}
                        onSuccessAppendFavorite={() => setSelectedRecordList([])}
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

export const HistoryRecordComponent = ({index, handleRecordClick, record, isSelected, handleMapShow}) => {
    return(
        <article
            key={index}
            className={`rounded-xl shadow-lg flex flex-col w-auto min-h-[150px] max-h-40 box-border border-4 flex-shrink-0 ${isSelected(record) ? 'border-[#888888] ' : 'border-white '}`}
            onClick={() => handleRecordClick(record)}
        >
            <h3 className="bg-darkBlueGrey text-white text-xl rounded-t-lg flex box-border relative px-2 py-2">
                {index + 1}. {record.displayName}
            </h3>
            <div className={`flex flex-col text-2xl px-4 py-2 flex-grow justify-between rounded-b-xl`}>
                <div className="flex gap-2 text-lg cursor-pointer" title="點擊複製地址" onClick={() => navigator.clipboard.writeText(record.displayAddress)}>
                    <img className="h-7 self-start" src={location_icon} />
                    <p>{record.displayAddress}</p>
                </div>
                {
                    handleMapShow &&
                    <div className="flex flex-row justify-end">
                        <a className="text-[#144583] text-lg underline font-bold underline-offset-4 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMapShow(record);
                            }}>
                            地圖顯示
                        </a>
                    </div>
                }
            </div>
        </article>
    )
}

interface RecordType {
    displayName: string;
    displayAddress: string;
    [key: string]: any;
}