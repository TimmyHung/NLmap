import { IconContext } from "react-icons";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { FiCpu } from "react-icons/fi";
import { HiMiniCpuChip } from "react-icons/hi2";
import { FaMicrophone } from "react-icons/fa";


const SpendCard_openai = ({ usageData }: { usageData: any }) => {
    return (
        <div className="grid gap-4 w-full py-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            <TotalSpendCard usageData={usageData} />
            <Gpt35SpendCard usageData={usageData} />
            <Gpt4SpendCard usageData={usageData} />
            <WhisperSpendCard usageData={usageData} />
        </div>
    );
};

export default SpendCard_openai;

// 通用的增長計算和顯示格式函數
const calculateGrowth = (yesterday: number, today: number) => {
    const growthPercentage = yesterday ? ((today - yesterday) / yesterday) * 100 : 0;
    const growthSign = growthPercentage >= 0 ? "+" : "";
    return { growthPercentage: Math.round(growthPercentage), growthSign };  // 取整數
};

// 用於顯示金額的函數，若金額小於0.01則顯示 "<0.01"
const formatAmount = (amount: number) => {
    return amount == 0 ? "$0.00" : amount <  0.01 ? "$<0.01" : `$${amount.toFixed(2)}`;
};

// Total Spend Card
const TotalSpendCard = ({ usageData }: { usageData: any }) => {
    const gpt35Spend = usageData.map((data) => data.gpt_35_price);
    const gpt4Spend = usageData.map((data) => data.gpt_4_price);
    const whisperSpend = usageData.map((data) => data.whisper_price);

    const totalGpt35Spend = gpt35Spend.reduce((acc, curr) => acc + curr, 0);
    const totalGpt4Spend = gpt4Spend.reduce((acc, curr) => acc + curr, 0);
    const totalWhisperSpend = whisperSpend.reduce((acc, curr) => acc + curr, 0);

    const totalSpend = totalGpt35Spend + totalGpt4Spend + totalWhisperSpend;

    const yesterday = usageData[usageData.length - 2];
    const today = usageData[usageData.length - 1];
    const yesterdaySpend = (yesterday.gpt_35_price || 0) + (yesterday.gpt_4_price || 0) + (yesterday.whisper_price || 0);
    const todaySpend = (today.gpt_35_price || 0) + (today.gpt_4_price || 0) + (today.whisper_price || 0);

    const { growthPercentage, growthSign } = calculateGrowth(yesterdaySpend, todaySpend);

    return (
        <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col space-y-5">
            <div className="flex items-start justify-between">
                <div className="bg-gray-800 p-2 rounded-md mt-[-40px] shadow-lg">
                    <IconContext.Provider value={{ size: '46px', color: 'white' }}>
                        <FaMoneyCheckDollar />
                    </IconContext.Provider>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-lg">30天內總支出</p>
                    <h2 className="text-3xl font-bold">{formatAmount(totalSpend)}</h2>
                </div>
            </div>
            <hr />
            <div className="flex justify-between items-center text-base font-semibold gap-1">
                <span className="text-gray-500 ml-1">
                    與昨天相比
                    <span className={growthPercentage <= 0 ? 'text-green-500' : 'text-red-500'}>
                        {growthSign}{growthPercentage}%
                    </span>
                </span>
                {/* <span className="text-gray-500 text-sm">今日花費: {formatAmount(todaySpend)}</span> */}
            </div>
        </div>
    );
};

// GPT-3.5 Spend Card
const Gpt35SpendCard = ({ usageData }: { usageData: any }) => {
    const gpt35Spend = usageData.map((data) => data.gpt_35_price);
    const yesterday = gpt35Spend[gpt35Spend.length - 2] || 0;
    const today = gpt35Spend[gpt35Spend.length - 1] || 0;

    const { growthPercentage, growthSign } = calculateGrowth(yesterday, today);

    return (
        <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col space-y-5">
            <div className="flex items-start justify-between">
                <div className="bg-[#06b2af] p-2 rounded-md mt-[-40px] shadow-lg">
                    <IconContext.Provider value={{ size: '46px', color: 'white' }}>
                        <FiCpu />
                    </IconContext.Provider>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-lg">今日GPT-3.5費用</p>
                    <h2 className="text-3xl font-bold">{formatAmount(today)}</h2>
                </div>
            </div>
            <hr />
            <div className="flex justify-between items-center text-base font-semibold gap-1">
                <span className="text-gray-500 ml-1">
                    與昨天相比
                    <span className={growthPercentage <= 0 ? 'text-green-500' : 'text-red-500'}>
                        {growthSign}{growthPercentage}%
                    </span>
                </span>
            </div>
        </div>
    );
};

// GPT-4o Spend Card
const Gpt4SpendCard = ({ usageData }: { usageData: any }) => {
    const gpt4Spend = usageData.map((data) => data.gpt_4_price);
    const yesterday = gpt4Spend[gpt4Spend.length - 2] || 0;
    const today = gpt4Spend[gpt4Spend.length - 1] || 0;

    const { growthPercentage, growthSign } = calculateGrowth(yesterday, today);

    return (
        <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col space-y-5">
            <div className="flex items-start justify-between">
                <div className="bg-[#2d96ff] p-2 rounded-md mt-[-40px] shadow-lg">
                    <IconContext.Provider value={{ size: '46px', color: 'white' }}>
                        <HiMiniCpuChip />
                    </IconContext.Provider>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-lg">今日GPT-4o花費</p>
                    <h2 className="text-3xl font-bold">{formatAmount(today)}</h2>
                </div>
            </div>
            <hr />
            <div className="flex justify-between items-center text-base font-semibold gap-1">
                <span className="text-gray-500 ml-1">
                    與昨天相比
                    <span className={growthPercentage <= 0 ? 'text-green-500' : 'text-red-500'}>
                        {growthSign}{growthPercentage}%
                    </span>
                </span>
            </div>
        </div>
    );
};

// Whisper Spend Card
const WhisperSpendCard = ({ usageData }: { usageData: any }) => {
    const whisperSpend = usageData.map((data) => data.whisper_price);
    const yesterday = whisperSpend[whisperSpend.length - 2] || 0;
    const today = whisperSpend[whisperSpend.length - 1] || 0;

    const { growthPercentage, growthSign } = calculateGrowth(yesterday, today);

    return (
        <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col space-y-5">
            <div className="flex items-start justify-between">
                <div className="bg-[#b900d8] p-2 rounded-md mt-[-40px] shadow-lg">
                    <IconContext.Provider value={{ size: '46px', color: 'white' }}>
                        <FaMicrophone />
                    </IconContext.Provider>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-lg">今日Whisper費用</p>
                    <h2 className="text-3xl font-bold">{formatAmount(today)}</h2>
                </div>
            </div>
            <hr />
            <div className="flex justify-between items-center text-base font-semibold gap-1">
                <span className="text-gray-500 ml-1">
                    與昨天相比
                    <span className={growthPercentage <= 0 ? 'text-green-500' : 'text-red-500'}>
                        {growthSign}{growthPercentage}%
                    </span>
                </span>
            </div>
        </div>
    );
};