import React, { useEffect, useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

const QuerySuccessRatePieChart = ({ pie_data }: { pie_data: any}) => {
    const [queryData, setQueryData] = useState({ valid_count: 0, invalid_count: 0 });

    useEffect(() => {
        setQueryData(pie_data.query);
    }, [pie_data]);

    // 計算總數和百分比
    const totalQueries = queryData.valid_count + queryData.invalid_count;
    const validRatio = totalQueries > 0 ? Math.round((queryData.valid_count / totalQueries) * 100) : 0;
    const invalidRatio = totalQueries > 0 ? 100 - validRatio : 0;

    const data = [
        { id: 'Invalid', value: invalidRatio, label: '無效'},
        { id: 'Valid', value: validRatio, label: '有效'},
    ];

    return (
        <div className="h-full bg-white rounded-xl flex flex-col">
            <div className="flex flex-row bg-headerBlack text-white rounded-t-xl py-2 px-4 gap-4 justify-center">
                近30天查詢成功/失敗比
            </div>
            <PieChart
                series={[
                    {
                        data,
                        innerRadius: 50,
                        outerRadius: 90,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        valueFormatter: (item: { value: number }) => `${item.value}%`
                    },
                ]}
                width={300}
                height={200}
            />
        </div>
    );
};

export default QuerySuccessRatePieChart;
