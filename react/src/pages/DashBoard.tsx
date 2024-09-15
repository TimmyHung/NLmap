import StateCardList from "@/components/dashboard/StateCardList";
import SystemStatsChart from "@/components/dashboard/SystemStatsChart";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/lib/AuthProvider";
import Swal from "sweetalert2";
import { deleteAccount, getDashboardStats, updateUserRole } from "@/components/lib/API";
import Toast from "@/components/ui/Toast";
import MonthlySpendChart from "@/components/dashboard/MonthlySpendChart_openai";
import SpendCard_openai from "@/components/dashboard/SpendCard_openai";
import WhisperPlatformPieChart from "@/components/dashboard/WhisperPlatformPieChart";
import QuerySuccessRatePieChart from "@/components/dashboard/QuerySuccessRatePieChart";
import TopFavoriteList, {TopFavoriteHeat} from "@/components/dashboard/TopFavoriteList";

export default function DashBoard(): JSX.Element {
    const [selectedPage, setSelectedPage] = useState<string>("Home");
    const [dashboardData, setDashboardData] = useState<any>(null);
    const { JWTtoken } = useAuth();


    const fetchDashboardData = async () => {
        try {
            const response = await getDashboardStats(JWTtoken);
            setDashboardData(response);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (!dashboardData) {
        return <div></div>;
    }

    return (
        <div className="flex w-full h-full p-4 md:p-6 gap-4">
            <LeftSide setSelectedPage={setSelectedPage} selectedPage={selectedPage} />
            <RightSide setSelectedPage={setSelectedPage} selectedPage={selectedPage} dashboardData={dashboardData} JWTtoken={JWTtoken}/>
        </div>
    );
}

const menuItems = [
    { label: "首頁", icon: "fa-solid fa-signal", page: "Home" },
    // { label: "分析", icon: "fa-solid fa-chart-simple", page: "Analytics" },
    { label: "用量與計費", icon: "fa-solid fa-money-check-dollar", page: "Usage" },
    { label: "用戶管理", icon: "fa-solid fa-user", page: "Account" },
];

const LeftSide = ({setSelectedPage,selectedPage,}: {setSelectedPage: (page: string) => void;selectedPage: string;}) => {
    return (
        <div className="hidden xl:block flex flex-col items-center w-[400px] bg-headerBlack rounded-lg">
            <div className="flex justify-center items-center text-white w-full text-xl py-4">
                歡迎回來
            </div>
            <hr className="w-full border-t border-gray-500"/>
            <ul className="flex flex-col gap-1 text-[1.1rem] text-white w-full px-6 py-4">
                {menuItems.map((item, index) => (
                    <li
                        key={index}
                        onClick={() => setSelectedPage(item.page)}
                        className={`flex flex-row gap-2 justify-start items-center cursor-pointer py-3 px-6 rounded-md ${selectedPage === item.page && "bg-black"}`}
                    >
                        <div className="w-5 h-5 flex justify-center items-center">
                            <i className={`${item.icon}`}></i>
                        </div>
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const RightSide = ({setSelectedPage,selectedPage,dashboardData,JWTtoken}: {setSelectedPage: (page: string) => void; selectedPage: string; dashboardData: any; JWTtoken: string;}) => {
    return (
        <div className="w-full h-full">
             <div className="block xl:hidden flex flex-row justify-center mb-4 overflow-x-auto bg-headerBlack rounded-xl p-4 whitespace-nowrap">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedPage(item.page)}
                        className={`flex flex-row gap-2 justify-start items-center cursor-pointer py-2 px-6 rounded-md ${selectedPage === item.page && "bg-black"} text-white`}
                    >
                        <div className="w-5 h-5 flex justify-center items-center">
                            <i className={`${item.icon}`}></i>
                        </div>
                        {item.label}
                    </div>
                ))}
            </div>
            <div className="w-full h-full overflow-y-auto flex flex-col justify-start items-center">
                {selectedPage === "Home" && <Home dashboardData={dashboardData} JWTtoken={JWTtoken} />}
                {selectedPage === "Usage" && <Usage dashboardData={dashboardData}/>}
                {selectedPage === "Account" && <Account dashboardData={dashboardData}/>}
            </div>
        </div>
    );
};

const Home = ({ dashboardData, JWTtoken }: { dashboardData: any, JWTtoken: string }) => {
    return (
        <div className="w-full h-full flex flex-col md:px-4">
            <div className="w-full">
                <StateCardList statsData={dashboardData.stats_data} />
            </div>
            <div className="h-full grid lg:flex lg:flex-row gap-4 w-full grid-cols-1">
                
                <div className="w-full h-full flex flex-col md:flex-row gap-4">
                    <div className="h-[400px] md:h-auto w-full">
                        <SystemStatsChart JWTtoken={JWTtoken}/>
                    </div>
                    <div className="h-full">
                        <TopFavoriteList top_favoritesList={dashboardData.top_favorites}/>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row lg:flex-col gap-4 h-full">
                    <div className="w-full h-[400px] md:h-full">
                        <TopFavoriteHeat top_favoritesList={dashboardData.top_favorites}/>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-center gap-4">
                        <QuerySuccessRatePieChart pie_data={dashboardData.pie_data}/>
                        <WhisperPlatformPieChart pie_data={dashboardData.pie_data}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 用量與計費頁面
const Usage = ({ dashboardData }) => {
    const [usageData, setUsageData] = useState([]);
  
    useEffect(() => {
      setUsageData(dashboardData.usage_data);
    }, [dashboardData]);
  
    if (!usageData.length) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className="w-full h-full flex flex-col md:px-4">
        <SpendCard_openai usageData={usageData}/>
        <div className="h-[400px] lg:h-full flex flex-row gap-4">
            <MonthlySpendChart usageData={usageData} />
        </div>
      </div>
    );
  };
  
// 用戶管理頁面
const Account = ({ dashboardData }: { dashboardData: any }) => {
    const { JWTtoken, userID } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("username");
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        setUsers(dashboardData.users);
        setFilteredUsers(dashboardData.users);
    }, [dashboardData.users]);

    useEffect(() => {
        let results = [];
        switch (searchType) {
            case "userID":
                results = users.filter(user =>
                    user.userID.toString().includes(searchTerm)
                );
                break;
            case "email":
                results = users.filter(user =>
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                );
                break;
            case "username":
            default:
                results = users.filter(user =>
                    user.username.toLowerCase().includes(searchTerm.toLowerCase())
                );
                break;
        }
        setFilteredUsers(results);
    }, [searchTerm, users, searchType]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
    };

    const handleDeleteAccounnt = (delete_userID, username, account_type) => {
        if(userID == delete_userID){
            Toast.fire({
                title: "你不能在後台刪除自己的帳號",
                icon: "error"
            })
            return
        }
        Swal.fire({
            title: "這項動作不可復原",
            text: "確定要刪除 " + delete_userID + "-" + username,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "是的，請刪除！",
            cancelButtonText: "我再考慮一下"
        }).then(async (result) => {
        if (result.isConfirmed) {
            const response = await deleteAccount(JWTtoken, delete_userID, account_type);
            if(response.statusCode == 200){
                Toast.fire({
                    title: response.message,
                    icon: "success"
                })
                setUsers(prevUsers => prevUsers.filter(user => user.userID !== delete_userID));
                setFilteredUsers(prevUsers => prevUsers.filter(user => user.userID !== delete_userID));
            }else{
                Swal.fire({
                    icon: "error",
                    title: "帳號刪除失敗",
                    text: response.message,
                    footer: '如果你認為這是一項錯誤，請聯絡網站管理員。',
                    showConfirmButton: false,
                    showCloseButton: true
                });
            }
        }
        });
    }

    const handleRoleChange = (targetUserID, currentRole) => {
        if(userID == targetUserID){
            Toast.fire({
                title: "你不能調整自己的帳號身分組",
                icon: "error"
            })
            return
        }
        Swal.fire({
            title: currentRole === "Admin" ? "確定要移除管理員權限？" : "確定要提升為管理員？",
            text: currentRole === "Admin" ? "此操作將移除此使用者的管理員權限" : "此操作將提升此使用者為管理員",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: currentRole === "Admin" ? "是的，移除！" : "是的，提升！",
            cancelButtonText: "取消"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const newRole = currentRole === "Admin" ? "User" : "Admin";
                    const response = await updateUserRole(JWTtoken, targetUserID, newRole);
                    
                    if(response.statusCode === 200) {
                        Toast.fire({
                            title: response.message,
                            icon: "success"
                        });
    
                        setUsers(prevUsers =>
                            prevUsers.map(user =>
                                user.userID === targetUserID ? { ...user, role: newRole } : user
                            )
                        );
                        setFilteredUsers(prevUsers =>
                            prevUsers.map(user =>
                                user.userID === targetUserID ? { ...user, role: newRole } : user
                            )
                        );
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "更新失敗",
                            text: response.message,
                            footer: '如果你認為這是一項錯誤，請聯絡網站管理員。',
                            showConfirmButton: false,
                            showCloseButton: true
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "更新失敗",
                        text: "無法更新使用者身分組，請稍後再試。",
                        footer: '如果問題持續存在，請聯絡網站管理員。',
                        showConfirmButton: false,
                        showCloseButton: true
                    });
                }
            }
        });
    };

    return (
        <div className="flex flex-col w-full h-full justify-start">
            {/* 搜尋欄位和類型選擇 */}
            <div className="flex w-full justify-between items-center gap-x-2">
                <div className="relative h-12 flex-1">
                    <input
                        placeholder="尋找使用者"
                        className="flex h-full w-full items-center rounded-xl border border-base-600 bg-base-950 pl-12 pr-4 text-main/lg outline-none focus:border-base-400"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                        className="absolute left-4 top-[50%] h-5 w-5 translate-y-[-50%] text-main/lg transition-all"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* 搜尋類型選擇 */}
                <select
                    className="h-12 border border-base-600 bg-base-950 text-main/lg rounded-xl pl-3 pr-8 outline-none"
                    value={searchType}
                    onChange={handleSearchTypeChange}
                >
                    <option value="username">名稱</option>
                    <option value="email">信箱</option>
                    <option value="userID">用戶ID</option>
                </select>
            </div>

            {/* 顯示使用者列表 */}
            <div className="mt-4 overflow-x-auto rounded-xl"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                {filteredUsers.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-headerBlack text-white" style={{ position: 'sticky', top: -1, zIndex: 1 }}>
                            <tr>
                                <th className="border px-4 py-2 whitespace-nowrap">用戶ID</th>
                                <th className="border px-4 py-2 whitespace-nowrap">名稱</th>
                                <th className="border px-4 py-2 whitespace-nowrap">信箱</th>
                                <th className="border px-4 py-2 whitespace-nowrap">身分</th>
                                <th className="border px-4 py-2 whitespace-nowrap">帳戶類型</th>
                                <th className="border px-4 py-2 whitespace-nowrap">操作</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {filteredUsers.map((user) => (
                                <tr key={user.userID} className="bg-white">
                                    <td className="border px-4 py-2 text-center whitespace-nowrap">{user.userID}</td>
                                    <td className="border px-4 py-2 whitespace-nowrap">{user.username}</td>
                                    <td className="border px-4 py-2 whitespace-nowrap">{user.email}</td>
                                    <td className={`border px-4 py-2 text-center whitespace-nowrap ${user.role == "Admin" && "text-red-600"} ${userID == user.userID ? "cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={() => handleRoleChange(user.userID, user.role)}
                                    >{user.role == "Admin" ? "管理員" : "使用者"}</td>
                                    <td className="border px-4 py-2 text-center whitespace-nowrap">{user.account_type == "Native" ? "一般帳號" : user.account_type}</td>
                                    <td className="border px-4 py-2 text-center whitespace-nowrap"><i className={`fa-solid fa-trash fa-lg ${userID == user.userID ? "cursor-not-allowed" : "cursor-pointer"}`} onClick={()=>{handleDeleteAccounnt(user.userID, user.username, user.account_type);}}></i></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="w-full flex flex-col justify-center items-center text-4xl">
                        <i className="fa-solid fa-question text-[60px] p-4"></i>查無搜尋結果
                    </div>
                )}
            </div>
        </div>
    );
};
