import React, { useEffect, useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

const WhisperPlatformPieChart = ({ pie_data }: { pie_data: any}) => {
    const [platformData, setPlatformData] = useState({ PC: 0, mobile: 0 });
    const total = platformData.PC + platformData.mobile
    const pc_ratio = total > 0 ? Math.round((platformData.PC / total) * 100) : 0;
    const mobile_ratio = total > 0 ? 100 - pc_ratio : 0;

    useEffect(() => {
        setPlatformData(pie_data.whisper);
    }, [pie_data]);

    const data = [
        { id: 'PC', value: pc_ratio , label: "電腦" },
        { id: 'Mobile', value: mobile_ratio, label: "移動端"},
    ];

    return (
        <div className="h-full bg-white rounded-xl flex flex-col">
            <div className="flex flex-row bg-headerBlack text-white rounded-t-xl py-2 px-4 gap-4 justify-center">
                語音輸入使用平台比例
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

export default WhisperPlatformPieChart;
