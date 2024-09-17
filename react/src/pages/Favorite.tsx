import React, { useState, useEffect } from 'react';
import { createFavoriteList, getFavoriteLists, deleteFavoriteList } from '@/components/lib/API';
import { useAuth } from '@/components/lib/AuthProvider';
import Swal from "sweetalert2";
import Toast from '@/components/ui/Toast';
import FavoriteDetail from '@/components/layout/FavoriteDetail';

const Favorite = () => {
  const { JWTtoken } = useAuth();
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [filteredFavoriteLists, setFilteredFavoriteLists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFavorite, setSelectedFavorite] = useState(null);

  // 獲取收藏清單及其項目
  const fetchFavoriteLists = async () => {
    const response = await getFavoriteLists(JWTtoken);
    if (response.statusCode == 200) {
      setFavoriteLists(response.data);
      setFilteredFavoriteLists(response.data);
    } else {
      console.error("無法獲取收藏清單", response.message);
    }
  };

  // 搜尋功能：根據搜尋欄位即時篩選收藏清單
  useEffect(() => {
    const filteredLists = favoriteLists.filter(favoriteList =>
      favoriteList.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFavoriteLists(filteredLists);
  }, [searchTerm, favoriteLists]);

  // 創建新的收藏清單
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

  // 刪除收藏清單
  const handleDeleteFavoriteList = async (favorite_id: number) => {
    const response = await deleteFavoriteList(JWTtoken, favorite_id);
    if (response.statusCode == 200) {
      fetchFavoriteLists(); // 刪除成功後重新獲取收藏清單
    } else {
      console.error("無法刪除收藏清單", response.message);
    }
  };

  const handleCloseModal = (updateData) =>{
    setSelectedFavorite(null)
    if(updateData){
        fetchFavoriteLists();
    }
  }

  useEffect(() => {
    fetchFavoriteLists();
  }, []);

  return (
    <div className="flex h-full w-full max-w-screen-8xl flex-col items-center py-8 px-8 md:px-16 lg:px-22 xl:px-26 2xl:px-32">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onCreate={handleCreateFavoriteList} />
      <div className="grid gap-4 w-full py-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
        {
          filteredFavoriteLists.length === 0 && searchTerm.length === 0 ?
            <CreateNewComponent onCreate={handleCreateFavoriteList} />
            :
            filteredFavoriteLists.map((favoriteList, index) => (
              <FavoriteComponent
                key={index}
                favoriteList={favoriteList}
                onClick={() => setSelectedFavorite(favoriteList)}  // 當點擊時設置選中的收藏清單
              />
            ))
        }
      </div>
      {selectedFavorite && (
        <FavoriteDetail
            JWTtoken={JWTtoken}
            favoriteList={selectedFavorite}
            onClose={handleCloseModal}
            onDelete={handleDeleteFavoriteList}
        />
      )}
    </div>
  );
};

export default Favorite;

const CreateNewComponent = ({ onCreate }) => {
  return (
    <div className="flex flex-col h-[136px] gap-2 bg-gray-200 hover:bg-[#dfe1e5] w-full rounded-2xl pb-4 border-4 border-white cursor-pointer"
      onClick={onCreate}
    >
      <div className="flex items-center w-full font-normal gap-2 text-gray-100 text-base md:text-lg mb-2 bg-darkBlueGrey rounded-t-xl pl-4 py-2">
        <i className="fa-solid fa-list"></i>空空如也
      </div>
      <div className="flex flex-row w-full h-full items-center justify-center items-center gap-2">
        <i className="fa-solid fa-plus text-2xl"></i>
        <p className="text-lg">創建第一個收藏清單</p>
      </div>
    </div>
  );
};

export const FavoriteComponent = ({ favoriteList, onClick }) => {
  const [itemLength, setItemLength] = useState(0);

  useEffect(() => {
    if (favoriteList?.recordset?.elements) {
        const filtered = favoriteList.recordset.elements.filter(item => item?.displayName);
        setItemLength(filtered.length);
    } else {
        setItemLength(0); // 當 elements 不存在時，設置 itemLength 為 0
    }
  }, [favoriteList]);

  return (
    <div
      className="flex flex-col gap-2 bg-gray-200 hover:bg-[#dfe1e5] w-full rounded-2xl pb-4 border-4 border-white cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center w-full font-normal gap-2 text-gray-100 text-base md:text-lg mb-2 bg-darkBlueGrey rounded-t-xl pl-4 py-2 truncate">
        <i className="fa-solid fa-list"></i>
        {favoriteList.title}
      </div>
      <div className="px-4">
        <div className="flex w-full items-center justify-start">
          <div className="flex w-1/2 flex-col items-start">
            <p className="text-base font-normal">收藏</p>
            <p className="text-lg ">{itemLength} 個地點</p>
          </div>
          {/* <div className="flex w-1/2 flex-col items-start">
            <p className="text-base font-normal">暫定</p>
            <p className="text-lg ">保留欄位</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export const SearchBar = ({ searchTerm, setSearchTerm, onCreate }) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex w-full justify-between items-center gap-x-2 md:gap-x-6">
      <div className="relative h-12 flex-1">
        <input
          placeholder="尋找收藏清單"
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
      <button className="flex h-12 max-w-[148px] items-center justify-center rounded-xl bg-primary/lg px-4 font-medium text-main transition-all hover:bg-primary bg-slateBlue hover:bg-darkSlateBlue" onClick={onCreate}>
        <div className="flex items-center gap-x-2">
          <i className="fa-solid fa-plus"></i>
          <span className="hidden sm:block">創建收藏</span>
        </div>
      </button>
    </div>
  );
};
