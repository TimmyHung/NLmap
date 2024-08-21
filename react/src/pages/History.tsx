import React, { useState, useEffect } from 'react';
import HistoryRecord from '@/components/layout/HistoryRecord';

const History = () => {
    const [recordsSet, setRecordsSet] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const devData = [
                {
                    title: '一公里內的餐廳',
                    records: [
                        {
                            name: '餐廳 A',
                            address: '台北市信義區松仁路123號',
                            mapUrl: 'https://example.com/mapA',
                        },
                        {
                            name: '餐廳 B',
                            address: '台北市大安區復興南路456號',
                            mapUrl: 'https://example.com/mapB',
                        },
                        {
                            name: '餐廳 B',
                            address: '桃園市蘆竹區中興路',
                            mapUrl: 'https://example.com/mapB',
                        },
                        {
                            name: '餐廳 B',
                            address: '新北市淡水區水源街二段177向43弄6-2號',
                            mapUrl: 'https://example.com/mapB',
                        },
                        {
                            name: '餐廳 B',
                            address: '超吉長的文字超吉長的文字超吉長的文字超吉長的文字超吉長的文字超吉長的文字超吉長的文字超吉長的文字超吉長的文字超吉長的文字',
                            mapUrl: 'https://example.com/mapB',
                        },
                        {
                            name: '餐廳 B',
                            address: '台北市大安區復興南路456號',
                            mapUrl: 'https://example.com/mapB',
                        },
                        {
                            name: '餐廳 B',
                            address: '台北市大安區復興南路456號',
                            mapUrl: 'https://example.com/mapB',
                        },
                        {
                            name: '餐廳 B',
                            address: '台北市大安區復興南路456號',
                            mapUrl: 'https://example.com/mapB',
                        },
                    ],
                },
                {
                    title: '台灣的大學大學大學大學大學大學大學大學大學',
                    records: [
                        {
                            name: '國立台灣大學',
                            address: '台北市大安區羅斯福路四段1號',
                            mapUrl: 'https://example.com/mapNTU',
                        },
                        {
                            name: '國立清華大學',
                            address: '新竹市光復路二段101號',
                            mapUrl: 'https://example.com/mapNTHU',
                        },
                    ],
                },
            ];

            setRecordsSet(devData);
            setLoading(false);
            // try {
            //     const response = await fetch('/api/getHistoryRecords');
            //     const data = await response.json();
            //     setRecordsSet(data);
            // } catch (error) {
            //     console.error('資料獲取失敗:', error);
            // } finally {
            //     setLoading(false);
            // }
        };

        fetchData();
    }, []);

    if (loading) {
        return <>
            <div className="flex justify-center items-center h-full gap-4">
                <img
                    className="h-11 md:h-16"
                    src="https://i.ibb.co/Nt7CckY/image.png"
                />
                <p className="text-3xl md:text-5xl text-[#909090]">載入中...</p>
            </div>
        </>
    }

    if(recordsSet.length === 0){
        return <>
            <div className="flex justify-center items-center h-full gap-4">
                <img
                    className="h-11 md:h-16"
                    src="https://i.ibb.co/Nt7CckY/image.png"
                />
                <p className="text-3xl md:text-5xl text-[#909090]">暫無歷史紀錄</p>
            </div>
        </>        
    }

    return (
        <div className="h-full">
            {recordsSet.map((recordSet, index) => (
                <HistoryRecord key={index} title={recordSet.title} records={recordSet.records} />
            ))}
        </div>
    );
};

export default History;
