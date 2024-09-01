import React, { useState, useEffect } from 'react';
import HistoryRecord from '@/components/layout/HistoryRecord';
import { deleteHistoryRecords, getHistoryRecords } from '@/components/lib/API';
import { useAuth } from '@/components/lib/AuthProvider';
import { debounce } from 'lodash';

const History = () => {
    const { JWTtoken } = useAuth();
    const [recordsSet, setRecordsSet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [recordPerPage, setRecordPerPage] = useState(3);

    const fetchHistoryRecords = async (currentPage, recordsToFetch) => {
        if (isFetching) return;  // 防止重複加載
        setIsFetching(true);

        try {
            const data = await getHistoryRecords(JWTtoken, currentPage, recordsToFetch);

            if (data.statusCode === 200) {
                setRecordsSet(prevRecords => {
                    const newRecords = data.data.filter(record => 
                        !prevRecords.some(prevRecord => prevRecord.title === record.title && prevRecord.timestamp === record.timestamp)
                    );
                    return [...prevRecords, ...newRecords];
                });
                setHasMore(currentPage < data.total_pages);
            } else {
                console.error('資料獲取失敗:', data.message);
            }
        } catch (error) {
            console.error('資料獲取失敗:', error);
        } finally {
            setIsFetching(false);
            setLoading(false);
        }
    };

    const handleDeleteRecord = async (recordToDelete) => {
        const response = await deleteHistoryRecords(JWTtoken, recordToDelete.id);

        setRecordsSet((prevRecords) =>
            prevRecords.filter(
                (record) =>
                    record.title !== recordToDelete.title ||
                    record.timestamp !== recordToDelete.timestamp
            )
        );
    };

    useEffect(() => {
        // 初次加載
        const recordHeight = 250; 
        const availableHeight = window.innerHeight;
        const recordsToShow = Math.floor(availableHeight / recordHeight);
        setRecordPerPage(recordsToShow);
        fetchHistoryRecords(page, recordsToShow);
    }, []);

    const loadMoreRecords = () => {
        if (!hasMore || loading || isFetching) return;
        setPage(prevPage => {
            const newPage = prevPage + 1;
            fetchHistoryRecords(newPage, recordPerPage);
            return newPage;
        });
    };

    useEffect(() => {
        const handleScroll = debounce(() => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 5) {
                loadMoreRecords();
            }
        }, 200);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, isFetching]);

    if (loading && recordsSet.length === 0) {
        return (
            <div className="flex justify-center items-center h-full gap-4">
                <img
                    className="h-11 md:h-16"
                    src="https://i.ibb.co/Nt7CckY/image.png"
                />
                <p className="text-3xl md:text-5xl text-[#909090]">載入中...</p>
            </div>
        );
    }

    if(recordsSet.length === 0){
        return (
            <div className="flex justify-center items-center h-full gap-4">
                <img
                    className="h-11 md:h-16"
                    src="https://i.ibb.co/Nt7CckY/image.png"
                />
                <p className="text-3xl md:text-5xl text-[#909090]">暫無歷史紀錄</p>
            </div>
        );
    }

    return (
        <>
            {recordsSet.map((recordSet) => (
                <HistoryRecord
                    key={`${recordSet.title}-${recordSet.timestamp}`}
                    recordSet={recordSet}
                    onDelete={handleDeleteRecord}
                />
            ))}
            {hasMore && (
                <div className="flex justify-center items-center py-4">
                    <p className="text-2xl text-[#909090]">下滑載入更多...</p>
                </div>
            )}
            <div className="w-full h-1" />
        </>
    );
};

export default History;
