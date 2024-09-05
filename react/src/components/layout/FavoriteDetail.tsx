import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { updateFavorite } from '../lib/API';
import osmtogeojson from 'osmtogeojson';
import MapLibreMap from './MapLibreMap';
import Toast from '../ui/Toast';
import draggableIcon from '@/assets/draggableIcon.svg';

const FavoriteDetail = ({ JWTtoken, favoriteList, onClose, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [title, setTitle] = useState(favoriteList.title);
    const [isTitleEdit, setIsTitleEdit] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const geoJsonData = favoriteList.recordset.elements ? osmtogeojson(favoriteList.recordset) : {};
    const titleRef = useRef(null);
    const navigate = useNavigate();

    // 開啟介面時的初始化 && 搜尋功能：根據搜尋欄位即時篩選清單中的項目
    useEffect(() => {
        if (favoriteList.recordset.elements) {
            const filtered = favoriteList.recordset.elements.filter(item => {
                const searchLower = searchTerm.toLowerCase().trim();
                const itemNameLower = item.displayName != null ? item.displayName.toLowerCase() : '';
    
                // 移除所有的注音符號，只保留文字部分
                const cleanedSearchTerm = searchLower.replace(/[ㄅ-ㄩ˙ˊˇˋ]/g, '');
                
                if(searchTerm === ""){
                    return item.displayName != null;
                }else{
                    return itemNameLower.includes(cleanedSearchTerm);
                }
            });
    
            if (filtered.length > 0) {
                setSelectedRecord(filtered[0]);
            }
            setFilteredItems(filtered);
        }
    }, [searchTerm, favoriteList]);

    const handleDeleteList = () => {
        Swal.fire({
            title: "確定要刪除這個收藏清單嗎？",
            text: "此操作將無法復原",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "rgb(20, 69, 131)",
            confirmButtonText: "是的，刪除它",
            cancelButtonText: "取消",
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(favoriteList.id);
                onClose();
            }
        });
    };

    const handleTitleChange = () => {
        const newTitle = titleRef.current.innerText;
        if (newTitle !== title) {
            setTitle(newTitle);
            setIsTitleEdit(true);
        }
    };

    const handleCloseModal = async () => {
        if(isTitleEdit){
            const response = await updateFavorite(JWTtoken, favoriteList.id, { new_title: title });
            if (response.statusCode === 200) {
                onClose(true);
            } else {
                Toast.fire({
                    icon: "error",
                    text: response.message,
                })
            }
        }else{
            onClose(true);
        }
    };

    // 刪除紀錄
    const handleDeleteRecord = async (record) => {
        Swal.fire({
            title: `你確定要刪除 "${record.displayName}" 嗎？`,
            text: "此操作將無法復原",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "是的，刪除",
            cancelButtonText: "取消"
        }).then(async (result) => {
            if (result.isConfirmed) {
                // 從 filteredItems 中移除選取的記錄
                const updatedItems = filteredItems.filter(item => item.id !== record.id);
                setFilteredItems(updatedItems); // 更新前端顯示的紀錄
    
                // 更新 favoriteList.recordset 並傳給後端
                const updatedRecordset = {
                    ...favoriteList.recordset,
                    elements: updatedItems, // 使用更新後的紀錄
                };
    
                // 將更新後的 recordset 傳給後端 API
                const response = await updateFavorite(JWTtoken, favoriteList.id, { new_recordset: updatedRecordset });
    
                if (response.statusCode === 200) {
                    Swal.fire("刪除成功", "紀錄已成功刪除", "success");
                } else {
                    Swal.fire("刪除失敗", response.message, "error");
                }
            }
        });
    };

    // 保存排序變更到本地端跟資料庫
    const handleSaveOrder = async (newItems) => {
        const updatedRecordset = {
            ...favoriteList.recordset,
            elements: newItems,
        };

        const response = await updateFavorite(JWTtoken, favoriteList.id, { new_recordset: updatedRecordset });
        if (response.statusCode !== 200) {
            Toast.fire({
                icon: "error",
                text: "更新順序失敗: " +  response.message
            })
        }
    };

    // 保存修改的紀錄
    const handleSaveEdit = async (updatedRecord) => {
        // 更新 filteredItems 中的相應紀錄
        const updatedItems = filteredItems.map((item) =>
            item.id === updatedRecord.id
                ? { ...item, displayName: updatedRecord.displayName, displayAddress: updatedRecord.displayAddress }
                : item
        );
    
        setFilteredItems(updatedItems); // 更新前端的顯示狀態
    
        // 更新 favoriteList.recordset 並傳給後端
        const updatedRecordset = {
            ...favoriteList.recordset,
            elements: updatedItems, // 使用更新後的紀錄
        };
    
        // 將更新後的 recordset 傳給後端 API
        const response = await updateFavorite(JWTtoken, favoriteList.id, { new_recordset: updatedRecordset });
    
        if (response.statusCode === 200) {
            Swal.fire("更新成功", "收藏清單成功更新", "success");
            setIsEditModalVisible(false); // 隱藏編輯對話框
        } else {
            Swal.fire("更新失敗", response.message, "error");
        }
    };
    

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseModal}>
            <div className="bg-white rounded-xl h-[80%] w-11/12 md:w-3/4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-black pb-2">
                    <div className="flex flex-row items-center text-xl gap-2">
                        <i className="fa-solid fa-list"></i>
                        <h2
                            className="font-semibold cursor-pointer"
                            ref={titleRef}
                            onBlur={handleTitleChange}
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                        >
                            {title}
                        </h2>
                        [{filteredItems.length}個地點]
                    </div>
                    <div className="flex flex-row gap-2">
                        <button className="text-black hover:bg-red-700" onClick={handleDeleteList}>
                            <i className="fa-solid fa-trash text-2xl"></i>
                        </button>
                        <button className="text-black" onClick={handleCloseModal}>
                            <i className="fa-solid fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div className="flex w-full h-[94%]">
                    <LeftSide
                        ItemLength={filteredItems.length}
                        navigate={navigate}
                        searchTerm={searchTerm}
                        selectedRecord={selectedRecord}
                        geoJsonData={geoJsonData}
                        handleEditRecord={()=>setIsEditModalVisible(true)}
                        handleDeleteRecord={handleDeleteRecord}
                    />
                    <RightSide
                        setSearchTerm={setSearchTerm}
                        searchTerm={searchTerm}
                        filteredItems={filteredItems}
                        setFilteredItems={setFilteredItems}
                        selectedRecord={selectedRecord}
                        setSelectedRecord={setSelectedRecord}
                        handleSaveOrder={handleSaveOrder}
                    />
                </div>
                {isEditModalVisible && (
                    <EditRecordModal
                        record={selectedRecord}
                        onClose={() => setIsEditModalVisible(false)}
                        onSave={handleSaveEdit}
                    />
                )}
            </div>
        </div>
    );
};

export default FavoriteDetail;

const RightSide = ({ setSearchTerm, searchTerm, filteredItems, setFilteredItems, selectedRecord, setSelectedRecord, handleSaveOrder }) => {
    
    // 當項目排序結束後的回調函數
    const handleOnDragEnd = (result) => {
        if (!result.destination) return; // 如果拖放到無效位置，返回

        const items = Array.from(filteredItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFilteredItems(items); // 更新本地狀態
        handleSaveOrder(items); // 將更新後的順序同步到後端
    };

    return (
        <div className="w-[30%] h-full flex flex-col pt-4 pl-4 border-l overflow-y-auto">
            <div className="gap-x-2 md:gap-x-6">
                <div className="relative h-12 flex-1">
                    <input
                        placeholder="搜尋"
                        className="flex h-full w-full items-center rounded-md border border-base-600 bg-base-950 pl-9 pr-4 a outline-none focus:border-base-400 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                        className="absolute left-3 top-[50%] h-5 w-5 translate-y-[-50%] text-lg transition-all"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="records">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-1 overflow-y-auto pt-2">
                            {filteredItems.length !== 0 && (
                                filteredItems.map((record, index) => (
                                    record.displayName != null && (
                                        <Draggable key={record.id} draggableId={record.id.toString()} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`flex items-center p-2 border-b rounded-md hover:bg-gray-300 cursor-pointer 
                                                    ${selectedRecord == record && "bg-gray-300"}`}
                                                    onClick={() => setSelectedRecord(record)}
                                                >
                                                    <img 
                                                        src={draggableIcon} 
                                                        alt="." 
                                                        className="h-5 mr-2 cursor-grab" 
                                                        {...provided.dragHandleProps} 
                                                    />
                                                    <span>{record.displayName}</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    )
                                ))
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};


const LeftSide = ({ ItemLength, navigate, searchTerm, selectedRecord, geoJsonData, handleEditRecord, handleDeleteRecord }) => {

    // 計算地圖中心和縮放等級
    const { center, zoom } = useMemo(() => {
        if (!selectedRecord) {
            return { center: [120.76, 23.80] as [number, number], zoom: 7 };  // 預設的中心和縮放等級
        }

        // 取得所有經緯度
        const lats = selectedRecord.lats || [];
        const lons = selectedRecord.lons || [];

        if (lats.length === 0 || lons.length === 0) {
            return { center: [120.76, 23.80] as [number, number], zoom: 7 };  // 如果沒有經緯度資料，回傳預設值
        }

        // 計算最小和最大的經緯度
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);

        // 計算中心點
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;

        // 計算適當的縮放等級，根據經緯度範圍調整
        const latDiff = maxLat - minLat;
        const lonDiff = maxLon - minLon;
        const maxDiff = Math.max(latDiff, lonDiff);
        const baseZoomLevel = 14;
        const maxZoomLevel = 17.5;
        const minZoomLevel = 6.5;
        const zoomLevel = Math.min(Math.max(baseZoomLevel - Math.log2(maxDiff * 300), minZoomLevel), maxZoomLevel);

        return { center: [centerLon, centerLat] as [number, number], zoom: Math.round(zoomLevel) };
    }, [selectedRecord]);

    //過濾GeoJsonData只留下SelectedRecord
    const filteredGeoJsonData = useMemo(() => {
        if (!geoJsonData || !selectedRecord) return null;

        //根據選取的記錄（selectedRecord）的 id 和 type 過濾出對應的地圖特徵
        const feature = geoJsonData.features.find(f => f.id === `${selectedRecord.type}/${selectedRecord.id}`);

        if (feature) {
            return {
                type: "FeatureCollection",
                features: [feature],
            } as GeoJSON.FeatureCollection<GeoJSON.Geometry>;;
        }

        return null;
    }, [geoJsonData, selectedRecord]);

    if (ItemLength === 0 && searchTerm.length === 0)
        return (
            <div className="w-full h-full overflow-y-auto pt-2 flex justify-center items-center">
                <div className="flex flex-col justify-center items-center text-4xl text-gray-500 gap-2">
                    <p><i className="fa-solid fa-list mr-4"></i>沒有項目</p>
                    <button
                        className="w-full text-black bg-white hover:bg-darkSlateBlue"
                        onClick={() => navigate("/")}
                    >
                        快去新增一筆
                    </button>
                </div>
            </div>
        );

    if (ItemLength === 0 && searchTerm.length !== 0)
        return (
            <div className="w-full flex flex-col justify-center items-center text-4xl">
                <i className="fa-solid fa-question text-[60px] p-4"></i>查無搜尋結果
            </div>
        );

    return (
        <div className="w-full h-full overflow-y-auto pt-2 flex justify-center items-center">
            <div className="w-full h-full flex flex-col justify-center">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col items-start">
                        <div className="flex flex-row items-center text-xl gap-2">
                            <i className="fa-solid fa-location-dot"></i>
                            <span>{selectedRecord.displayName}</span>
                        </div>
                        <div className="flex flex-row items-center text-xl gap-2">
                            <span>{selectedRecord.displayAddress}</span>
                        </div>
                    </div>
                    <div className="px-3 flex flex-row gap-4 text-black text-xl cursor-pointer">
                        <i className="fa-solid fa-pencil" onClick={handleEditRecord}></i>
                        <i className="fa-solid fa-trash" onClick={() => handleDeleteRecord(selectedRecord)}></i>
                    </div>
                </div>
                <div className="w-full h-full border-4 border-grey-500">
                    <MapLibreMap
                        geoJsonDataArray={[{ id: 'modalMap', data: filteredGeoJsonData }]}
                        onBoundsChange={() => { }}
                        initialCenter={center}
                        initialZoom={zoom}
                        showInfo={false}
                        ChildComponent={true}
                    />
                </div>
            </div>
        </div>
    );
};


const EditRecordModal = ({ record, onClose, onSave }) => {
    const [displayName, setDisplayName] = useState(record.displayName);
    const [displayAddress, setDisplayAddress] = useState(record.displayAddress);
    const [tags, setTags] = useState(Object.entries(record.tags || {})); // 將 tags 轉換為 key-value 陣列

    const handleSave = () => {
        // 將 tags 陣列轉換回物件
        const updatedTags = tags.reduce((acc, [key, value]) => {
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const updatedRecord = { ...record, displayName, displayAddress, tags: updatedTags };
        onSave(updatedRecord);
    };

    const handleTagChange = (index, key, value) => {
        const updatedTags = [...tags];
        updatedTags[index] = [key, value]; // 更新對應索引的 key 和 value
        setTags(updatedTags);
    };

    const handleAddTag = () => {
        setTags([...tags, ['', '']]); // 添加新的空標籤行
    };

    const handleRemoveTag = (index) => {
        const updatedTags = tags.filter((_, i) => i !== index); // 移除指定索引的標籤
        setTags(updatedTags);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl md:w-1/3 shadow-lg animate__animated animate__bounceIn">
                <h2 className="text-2xl mb-4">修改地點資訊</h2>
                <div className="mb-4">
                    <label>顯示名稱</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="border p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label>顯示地址</label>
                    <input
                        type="text"
                        value={displayAddress}
                        onChange={(e) => setDisplayAddress(e.target.value)}
                        className="border p-2 w-full"
                    />
                </div>

                {/* 表格顯示標籤 */}
                {/* <div className="mb-4 max-h-[400px] overflow-y-auto">
                    <label>標籤</label>
                    <table className="min-w-full border-collapse border border-gray-200">
                        <thead>
                            <tr>
                                <th className="border p-2">Key</th>
                                <th className="border p-2">Value</th>
                                <th className="border p-2">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map(([key, value], index) => (
                                <tr key={index}>
                                    <td className="border p-2">
                                        <input
                                            type="text"
                                            value={key}
                                            onChange={(e) => handleTagChange(index, e.target.value, value)}
                                            className="border p-1 w-full"
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="text"
                                            value={value as string}
                                            onChange={(e) => handleTagChange(index, key, e.target.value)}
                                            className="border p-1 w-full"
                                        />
                                    </td>
                                    <td className="border p-2 text-center">
                                        <button
                                            onClick={() => handleRemoveTag(index)}
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            刪除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={handleAddTag}
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        添加標籤
                    </button>
                </div> */}

                <div className="flex justify-center gap-4">
                    <button onClick={handleSave} className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded">保存</button>
                    <button onClick={onClose} className="bg-slateBlue text-white hover:bg-darkSlateBlue px-4 py-2 rounded">取消</button>
                </div>
            </div>
        </div>
    );
};
