import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

const MonthlySpendChart = ({ usageData }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const labels = usageData.map((data) => data.date);
    const gpt35Spend = usageData.map((data) => data.gpt_35_price);
    const gpt4Spend = usageData.map((data) => data.gpt_4_price);
    const whisperSpend = usageData.map((data) => data.whisper_price);

    setChartData({
      labels,
      series: [
        {
          label: 'GPT-3.5-Turbo',
          data: gpt35Spend,
        },
        {
          label: 'GPT-4o',
          data: gpt4Spend,
        },
        {
          label: 'Whisper',
          data: whisperSpend,
        },
      ],
    });
  }, [usageData]);

  if (!chartData) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="w-full h-full bg-white rounded-xl flex flex-col">
      <div className="flex flex-row justify-between bg-headerBlack text-white rounded-t-xl py-2 px-4 gap-4 text-lg">
        近30天計費
        <span>USD</span>
      </div>
      <div className="flex-grow">
        <BarChart
          xAxis={[{ scaleType: 'band', data: chartData.labels }]}
          yAxis={[
            {
              valueFormatter: (value) => `$${value}`,
            },
          ]}
          series={[
            { data: chartData.series[0].data, label: chartData.series[0].label },
            { data: chartData.series[1].data, label: chartData.series[1].label },
            { data: chartData.series[2].data, label: chartData.series[2].label },
          ]}
        />
      </div>
    </div>
  );
};

export default MonthlySpendChart;
