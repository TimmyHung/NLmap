import { IconContext } from 'react-icons';
import { TiUserAdd } from 'react-icons/ti';
import { IoIosToday } from "react-icons/io";
import { FaSearchLocation } from "react-icons/fa";
import { FaUser } from "react-icons/fa";

const StateCardList = ({ statsData: statsData }: { statsData: any }) => {
    return (
        <div className="grid gap-4 w-full py-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            <TotalUserCard statsData={statsData} />
            <ActiveUserCard statsData={statsData} />
            <TodayQueryCard statsData={statsData} />
            <VisitorCard statsData={statsData} />
        </div>
    );
};

export default StateCardList;

const TotalUserCard = ({ statsData }: { statsData: any }) => {
    return (
        <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col space-y-5">
            <div className="flex items-start justify-between">
                <div className="bg-headerBlack p-2 rounded-md mt-[-40px] shadow-lg">
                    <IconContext.Provider value={{ size: '46px', color: 'white' }}>
                        <FaUser />
                    </IconContext.Provider>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-lg">用戶總數</p>
                    <h2 className="text-3xl font-bold">{statsData.total_users}</h2>
                </div>
            </div>
            <hr />
            <div className="flex justify-between items-center text-base font-semibold gap-1">
                <span className="text-gray-500 ml-1">過去七天<span className="text-green-500">+{statsData.new_users_last_week}</span></span>
                <span className="text-gray-500 text-sm">+{Math.round(statsData.new_users_last_week/statsData.total_users*100)}%</span>
            </div>
        </div>
    );
};

const ActiveUserCard = ({ statsData }: { statsData: any }) => {
    return (
        <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col space-y-5">
            <div className="flex items-start justify-between">
                <div className="bg-headerBlack p-2 rounded-md mt-[-40px] shadow-lg">
                    <IconContext.Provider value={{ size: '46px', color: 'white' }}>
                        <IoIosToday  />
                    </IconContext.Provider>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-lg">今日活躍用戶</p>
                    <h2 className="text-3xl font-bold">{statsData.today_logins}</h2>
                </div>
            </div>
            <hr />
            <div className="flex justify-between items-center text-base font-semibold gap-1">
                <span className="text-gray-500 ml-1">過去七天 <span className="text-green-500">{statsData.last_week_logins}位</span></span>
                <span className="text-gray-500 text-sm">佔總數{Math.round(statsData.last_week_logins/statsData.total_users*100)}%</span>
            </div>
        </div>
    );
};

const TodayQueryCard = ({ statsData }: { statsData: any }) => {
    // 計算與昨天相比的增長百分比
    const todayQueries = statsData.today_queries || 0;
    const yesterdayQueries = statsData.yesterday_queries || 0;
    const growthPercentage = yesterdayQueries ? Math.round(((todayQueries - yesterdayQueries) / yesterdayQueries) * 100) : 0;
    const growthCount = todayQueries - yesterdayQueries;
    const growthSign = growthPercentage >= 0 ? "+" : "";

    return (
        <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col space-y-5">
            <div className="flex items-start justify-between">
                <div className="bg-headerBlack p-2 rounded-md mt-[-40px] shadow-lg">
                    <IconContext.Provider value={{ size: '46px', color: 'white' }}>
                        <FaSearchLocation />
                    </IconContext.Provider>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-lg">今日查詢次數</p>
                    <h2 className="text-3xl font-bold">{todayQueries}</h2>
                </div>
            </div>
            <hr />
            <div className="flex justify-between items-center text-base font-semibold gap-1">
                <span className="text-gray-500 ml-1">跟昨天相比<span className={growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>{growthSign}{growthCount}</span></span>
                <span className="text-gray-500 text-sm">{growthSign}{growthPercentage}%</span>
            </div>
        </div>
    );
};

const VisitorCard = ({ statsData }: { statsData: any }) => {
    const todayVisitors = statsData.today_visitors || 0;
    const yesterdayVisitors = statsData.yesterday_visitors || 1;

    // 計算與昨天相比的增長數量和百分比
    const growthCount = todayVisitors - yesterdayVisitors;
    const growthPercentage = yesterdayVisitors ? Math.round(((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100) : 0;
    const growthSign = growthCount >= 0 ? "+" : "";

    return (
        <div className="w-full h-full bg-white rounded-xl p-6 flex flex-col space-y-5">
            <div className="flex items-start justify-between">
                <div className="bg-headerBlack p-2 rounded-md mt-[-40px] shadow-lg">
                    <IconContext.Provider value={{ size: '46px', color: 'white' }}>
                        <TiUserAdd />
                    </IconContext.Provider>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-lg">今日不重複訪客數</p>
                    <h2 className="text-3xl font-bold">{todayVisitors}</h2>
                </div>
            </div>
            <hr />
            <div className="flex justify-between items-center text-base font-semibold gap-1">
                <span className="text-gray-500 ml-1">
                    跟昨天相比 
                    <span className={growthCount >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {growthSign}{growthCount}
                    </span>
                </span>
                <span className="text-gray-500 text-sm">{growthSign}{growthPercentage}%</span>
            </div>
        </div>
    );
};

