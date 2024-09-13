import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

const SystemStatsChart = (height) => {

    const [chartData, setChartData] = useState<any>(null);
    const [range, setRange] = useState('hourly');

    const rangeOptions = [
        { value: 'hourly', label: '本小時' },
        { value: 'daily', label: '本日' },
        { value: 'weekly', label: '本周' },
        { value: 'monthly', label: '本月' },
        { value: 'yearly', label: '今年' },
    ];

    const fetchData = async () => {
        try {
            const response = await fetch(`https://timmyhungback.pettw.online/api/dashboard/systemInfo?range=${range}`);
            const result = await response.json();
            
            const formatDateLabel = (timestamp) => {
                const date = new Date(timestamp);
                
                if (range === 'hourly') {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else if (range === 'daily') {
                    return date.toLocaleString([], { hour: '2-digit' });
                } else if (range === 'weekly' || range === 'monthly') {
                    return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
                } else if (range === 'yearly') {
                    return date.toLocaleDateString([], { year: 'numeric', month: '2-digit' });
                } else {
                    return date.toLocaleDateString();
                }
            };

            const labels = result.map((entry) => formatDateLabel(entry.period));
            const cpuUsage = result.map((entry) => entry.cpu_usage);
            const ramUsage = result.map((entry) => entry.ram_usage);
            const diskUsage = result.map((entry) => entry.disk_usage);
    
            setChartData({
                labels,
                datasets: [
                    {
                        label: 'CPU 使用率 (%)',
                        data: cpuUsage,
                    },
                    {
                        label: 'RAM 使用率 (%)',
                        data: ramUsage,
                    },
                    {
                        label: '磁碟使用率 (%)',
                        data: diskUsage,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [range]);

    if (!chartData) {
        return <div>加載中...</div>;
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-xl">
            <div className="flex flex-row bg-headerBlack text-white rounded-t-xl py-2 px-4 gap-4 justify-center ">
                {rangeOptions.map((option) => (
                    <div
                        key={option.value}
                        className={`cursor-pointer ${range === option.value ? 'text-[#2e96ff] font-bold' : ''}`}
                        onClick={() => setRange(option.value)}
                    >
                        {option.label}
                    </div>
                ))}
            </div>

            <LineChart
                // height={500}
                series={[
                    { data: chartData.datasets[0].data, label: chartData.datasets[0].label, showMark: false},
                    { data: chartData.datasets[1].data, label: chartData.datasets[1].label, showMark: false},
                    { data: chartData.datasets[2].data, label: chartData.datasets[2].label, showMark: false}
                ]}
                xAxis={[
                    { scaleType: 'point', data: chartData.labels }
                ]}
                
            />
        </div>
    );
};
export default SystemStatsChart;
