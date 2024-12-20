import { useEffect, useState } from "react";
import { addFavoriteItem, createFavoriteList, getFavoriteLists } from "../lib/API";
import { FavoriteComponent, SearchBar } from "@/pages/Favorite";
import Swal from "sweetalert2";
import Toast from "../ui/Toast";
import { HistoryRecordComponent } from "./HistoryRecord";

export const FavoriteAndResultModal = ({ 
    isVisible,
    onClose,
    JWTtoken,
    recordToAppend,
    onSuccessAppendFavorite,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [favoriteLists, setFavoriteLists] = useState([]);
    const [filteredFavoriteLists, setFilteredFavoriteLists] = useState([]);
    const [isResultVisible, setIsResultVisible] = useState(false);
    const [duplicatedItems, setDupblicatedItems] = useState([]);

    useEffect(() => {
        if (isVisible) {
            fetchFavoriteLists();
        }
    }, [isVisible, JWTtoken]);

    // 取得收藏清單
    async function fetchFavoriteLists() {
        try {
            const response = await getFavoriteLists(JWTtoken);
            if (response.statusCode === 200) {
                setFavoriteLists(response.data);
                setFilteredFavoriteLists(response.data);
            } else {
                console.error("無法獲取收藏清單", response.message);
            }
        } catch (error) {
            console.error("獲取收藏清單時出錯", error);
        }
    }

    // 創建收藏清單
    const handleCreateFavoriteList = async () => {
        Swal.fire({
            title: "創建收藏清單",
            text: "請輸入收藏清單名稱",
            input: "text",
            showCancelButton: true,
            showLoaderOnConfirm: true,
            confirmButtonText: "創建",
            cancelButtonText: "取消",
            confirmButtonColor: "rgb(20, 69, 131)",
            preConfirm: async (newFavoriteTitle) => {
              try {
                const response = await createFavoriteList(JWTtoken, newFavoriteTitle);
                if (response.statusCode == 200) {
                    fetchFavoriteLists();
                } else {
                    Toast.fire({
                        icon: "error",
                        text: response.message,
                    });
                }
              } catch (error) {
                Toast.fire({
                  icon: "error",
                  text: error
                })
              }
            },
        });
    };
    
    // 過濾收藏清單
    useEffect(() => {
        const filteredLists = favoriteLists.filter(favoriteList =>
          favoriteList.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFavoriteLists(filteredLists);
    }, [searchTerm, favoriteLists]);

    const handleClickinside = (e) => {
        e.stopPropagation();
    };

    // 向收藏清單添加項目
    const handleAddFavoriteItem = async (favorite_id: number, recordSet: Record<string, any>) => {
        const response = await addFavoriteItem(JWTtoken, favorite_id, recordSet.records);
        if (response.statusCode == 200) {
            setDupblicatedItems(response.duplicatedItems);
            
            setIsResultVisible(true);
            onSuccessAppendFavorite();
        } else {
            console.error("無法添加收藏項目", response.message);
        }
    };

    const handleClose = () => {
        setIsResultVisible(false);
        onClose();
    }

    if (!isVisible) return null;

    return (
        <div>
            {
                !isResultVisible &&
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50" onClick={handleClose}>
                    <div className="flex flex-col gap-2 bg-gray-200 p-5 rounded-lg shadow-lg w-4/5 h-4/5 relative" onClick={handleClickinside}>
                            <div className="w-full flex justify-between items-center relative break-words border-b pb-2 border-black">
                                <p className="text-lg md:text-2xl">新增至收藏列表</p>
                                <div className="max-h-8 hover:bg-red-700 border border-black rounded-xl h-full flex justify-center items-center bg-gray-200 cursor-pointer" onClick={handleClose}>
                                    <i className="fa-solid fa-x px-4 hover:text-white"></i>
                                </div>
                            </div>
                            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onCreate={handleCreateFavoriteList} />
                            <div className="flex flex-col gap-2 w-full h-full overflow-x-auto">
                                {
                                    filteredFavoriteLists.length === 0 &&
                                    <div className="flex flex-col h-[136px] gap-2 bg-gray-200 hover:bg-[#dfe1e5] w-full rounded-2xl pb-4 border-4 border-white cursor-pointer"
                                        onClick={handleCreateFavoriteList}
                                    >
                                    <div className="flex items-center w-full font-normal gap-2 text-gray-100 text-base md:text-lg mb-2 bg-darkBlueGrey rounded-t-xl pl-4 py-2">
                                        <i className="fa-solid fa-list"></i>空空如也
                                    </div>
                                    <div className="flex flex-row w-full h-full items-center justify-center items-center gap-2">
                                        <i className="fa-solid fa-plus text-2xl"></i>
                                        <p className="text-lg">創建第一個收藏清單</p>
                                    </div>
                                    </div>

                                }
                                {filteredFavoriteLists.map((favoriteList, index) => (
                                    <FavoriteComponent
                                        key={index}
                                        favoriteList={favoriteList}
                                        onClick={() => handleAddFavoriteItem(favoriteList.id, recordToAppend)}
                                    />
                                ))}
                            </div>
                    </div>
                </div>
            }
            {
                isResultVisible &&
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50" onClick={handleClose}>
                    <div
                        className={`flex flex-col gap-2 bg-gray-200 p-5 rounded-lg shadow-lg justify-center ${duplicatedItems.length > 0 && "w-[90%] md:w-3/5"} animate__animated animate__bounceIn`}
                        onClick={handleClickinside}
                        style={{ animationDuration: '0.5s' }}
                    >
                        <div className={`flex flex-col w-full justify-center items-center ${duplicatedItems.length > 0 && "border-b border-black"} `}>
                            {duplicatedItems.length === 0 &&
                                <div className="flex justify-center items-center mb-8 border-4 border-green-500 rounded-full w-[100px] h-[100px]">
                                    <i className="fa-solid fa-check fa-5x text-green-500"></i>
                                </div>
                            }
                            <p className="text-xl md:text-4xl pb-2">成功新增至收藏清單</p>
                            {duplicatedItems.length > 0 && (
                                <p className="text-base md:text-2xl">
                                    跳過以下已經存在於收藏列表中的紀錄
                                </p>
                            )}
                        </div>
                        {duplicatedItems.length > 0 && (
                            <div className="flex flex-row gap-2 overflow-x-auto h-[180px] mb-4">
                                {duplicatedItems.map((items, index) => (
                                    <HistoryRecordComponent
                                        key={items.id}
                                        index={index}
                                        handleRecordClick={()=>{}}
                                        record={items}
                                        isSelected={()=>{false}}
                                        handleMapShow={null}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="flex justify-center w-full">
                            <button className="w-full bg-slateBlue max-w-[150px] text-lg" onClick={handleClose}>
                                知道了
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};
