import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styles from '/src/css/History.module.css';
import clockIcon from "@/assets/clock.png";
import location_icon from '@/assets/location_icon.svg';


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
    const containerRef = useRef(null);
    const filterCities = true;
    const hideUnknownRecords = true;

    const title = recordSet.title;
    const records = recordSet.records;

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
        const findLatLonInWay = (way) => {
            for (const nodeId of way.nodes) {
                const nodeRecord = allRecords.find(r => r.id === nodeId && r.type === 'node');
                if (nodeRecord) {
                    return { lat: nodeRecord.lat, lon: nodeRecord.lon };
                }
            }
            return null;
        };

        const findLatLonInRelation = (relation) => {
            for (const member of relation.members) {
                if (member.role === 'inner' && member.type === 'way') {
                    const wayRecord = allRecords.find(r => r.id === member.ref && r.type === 'way');
                    if (wayRecord) {
                        const latLon = findLatLonInWay(wayRecord);
                        if (latLon) return latLon;
                    }
                }
            }

            for (const member of relation.members) {
                if (member.role === 'outer' && member.type === 'way') {
                    const wayRecord = allRecords.find(r => r.id === member.ref && r.type === 'way');
                    if (wayRecord) {
                        const latLon = findLatLonInWay(wayRecord);
                        if (latLon) return latLon;
                    }
                } else if (member.type === 'relation') {
                    const subRelation = allRecords.find(r => r.id === member.ref && r.type === 'relation');
                    if (subRelation) {
                        const latLon = findLatLonInRelation(subRelation);
                        if (latLon) return latLon;
                    }
                }
            }

            return null;
        };

        if (record.lat && record.lon) {
            return { lat: record.lat, lon: record.lon };
        }

        if (record.type === 'relation') {
            return findLatLonInRelation(record);
        } else if (record.type === 'way') {
            return findLatLonInWay(record);
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
                    let ctyName = standardizeCityName(record.tags["addr:city"]);
                    let townName = record.tags["addr:district"];
                    record.displayName = getDisplayName(record);
    
                    if (hideUnknownRecords && record.displayName === '未命名紀錄') {
                        setProcessedCount(prevCount => prevCount + 1);
                        continue;
                    }
    
                    if (!ctyName || !townName) {
                        const location = getLatLon(record, records);
                        if (location) {
                            const locationInfo = await fetchLocationInfo(location.lon, location.lat);
                            ctyName = standardizeCityName(locationInfo[0]);
                            townName = locationInfo[1];
                        }
                    }
    
                    if (ctyName === "未知" || townName === "未知") {
                        setProcessedCount(prevCount => prevCount + 1);
                        continue;
                    }
    
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
            setDisplayedRecords(new Set(filtered.slice(0, batchSize))); // 初始加載第一批
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
        if (record.townName) parts.push(record.townName);
        if (streetName) parts.push(streetName);
        if (housenumber) parts.push(housenumber + "號");
        if (floor) parts.push(floor + "樓");

        return parts.length > 0 ? parts.join('') : "未知";
    }

    const handleDeleteRecord = async () => {
        const confirmDelete = window.confirm(`確定要刪除這條紀錄嗎？`);
        if (!confirmDelete) return;

        onDelete(recordSet);
    };

    const showCitySelector = availableCities.length > 1;
    const showDistrictSelector = (availableCities.length === 1 && availableDistricts.length > 1) || (availableCities.length > 1 && selectedCity);

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
                        Array.from(displayedRecords).map((record, index) => (
                            <article key={index} className="rounded-xl shadow-lg flex flex-col w-auto h-auto min-h-40 box-border border-4 border-white flex-shrink-0">
                                <h3 className="bg-darkBlueGrey text-white text-xl rounded-t-xl flex box-border relative px-2 py-2">
                                    {index + 1}. {record.displayName}
                                </h3>
                                <div className="bg-gray-200 flex flex-col text-2xl px-4 py-2 flex-grow justify-between rounded-b-xl">
                                    <div className="flex gap-2 text-lg cursor-pointer" title="點擊複製地址" onClick={() => navigator.clipboard.writeText(record.displayAddress)}>
                                        <img className="h-7 self-start" src={location_icon} />
                                        <p>{record.displayAddress}</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <a className="text-[#144583] text-lg underline font-bold underline-offset-4 cursor-pointer"
                                            onClick={() => {
                                                console.log(record)
                                                console.log(record.tags)
                                            }}
                                        >
                                            地圖顯示
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
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