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
    const [recordSet, setRecordSet] = useState(favoriteList.recordset);
    const geoJsonData = favoriteList.recordset.elements ? osmtogeojson(favoriteList.recordset) : {};
    const titleRef = useRef(null);
    const navigate = useNavigate();

    // 開啟介面時的初始化 && 搜尋功能：根據搜尋欄位即時篩選清單中的項目
    useEffect(() => {
        if (recordSet.elements) {
            const filtered = recordSet.elements.filter(item => {
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
            showDenyButton: true,
            showConfirmButton: false,
            cancelButtonColor: "rgb(20, 69, 131)",
            denyButtonText: "是的，刪除它",
            cancelButtonText: "取消",
        }).then((result) => {
            if (result.isDenied) {
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
            showDenyButton: true,
            showConfirmButton: false,
            cancelButtonColor: "#3085d6",
            denyButtonText: "是的，刪除它",
            cancelButtonText: "取消"
        }).then(async (result) => {
            if (result.isDenied) {
                // 從 filteredItems 中移除選取的記錄
                const updatedItems = filteredItems.filter(item => item.id !== record.id);
                setFilteredItems(updatedItems); // 更新前端顯示的紀錄
    
                // 更新 favoriteList.recordset 並傳給後端
                const updatedRecordset = {
                    ...recordSet,
                    elements: updatedItems, // 使用更新後的紀錄
                };

                setRecordSet(updatedRecordset)
    
                // 將更新後的 recordset 傳給後端 API
                const response = await updateFavorite(JWTtoken, favoriteList.id, { new_recordset: updatedRecordset });
    
                if (response.statusCode === 200) {
                    Toast.fire({
                        icon: "success",
                        text: "紀錄已成功刪除"
                    })
                } else {
                    Swal.fire("刪除失敗", response.message, "error");
                }
            }
        });
    };


    // 保存修改的紀錄
    const handleSaveEdit = async (updatedRecord) => {
        // 找到目標元素的原始索引
        const targetIndex = recordSet.elements.findIndex((item) => item.id === updatedRecord.id);
    
        // 如果找不到該元素，直接返回
        if (targetIndex === -1) return;
    
        // 複製該元素並更新 displayName 和 displayAddress
        const targetElement = recordSet.elements[targetIndex]
        if(targetElement.displayName == updatedRecord.displayName && targetElement.displayAddress == updatedRecord.displayAddress){
            setIsEditModalVisible(false);
            return;
        }
        targetElement.displayName = updatedRecord.displayName
        targetElement.displayAddress = updatedRecord.displayAddress

        // 建立一個更新後的元素陣列，保證 targetElement 保持在原來的位置
        const updatedElements = [
            ...recordSet.elements.slice(0, targetIndex), // 保留 targetElement 之前的元素
            targetElement, // 插入更新後的 targetElement
            ...recordSet.elements.slice(targetIndex + 1) // 保留 targetElement 之後的元素
        ];
    
        // 更新前端的 filteredItems 和 recordset，同步更新
        setFilteredItems(updatedElements.filter((item) => item.displayName != null));
    
        // 更新 favoriteList.recordset 並同步到後端
        const updatedRecordset = {
            ...recordSet,
            elements: updatedElements,
        };

        setRecordSet(updatedRecordset)
    
        // 調用 API 傳送更新的記錄到後端
        const response = await updateFavorite(JWTtoken, favoriteList.id, { new_recordset: updatedRecordset });
    
        if (response.statusCode === 200) {
            setIsEditModalVisible(false);
        } else {
            Swal.fire("更新失敗", response.message, "error");
        }
    };
    
    
    
    //下載KML格式
    const handleDownload = () => {
        if (recordSet && Array.isArray(recordSet.elements)) {
            // 過濾掉名稱為 "Unnamed" 的項目
            const filteredElements = recordSet.elements.filter(element => element.displayName && element.displayName !== "未命名");
    
            // 開始生成 KML
            let kmlData = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            kmlData += `<kml xmlns="http://www.opengis.net/kml/2.2">\n`;
            kmlData += `<Document>\n`;
            kmlData += `<name>${favoriteList.title}</name>\n`;
    
            filteredElements.forEach((element) => {
                const name = element.displayName;
    
                // 確保 lats 和 lons 存在且為陣列
                if (Array.isArray(element.lats) && Array.isArray(element.lons) && element.lats.length > 0 && element.lons.length > 0) {
                    const coordinates = element.lons.map((lon, index) => `${lon},${element.lats[index]}`).join(" ");
                    
                    kmlData += `<Placemark>\n`;
                    kmlData += `<name>${name}</name>\n`;
                    kmlData += `<Point>\n<coordinates>${coordinates}</coordinates>\n</Point>\n`;
                    kmlData += `</Placemark>\n`;
                } else if (element.lat && element.lon) { 
                    // 處理只有單一經緯度的 node
                    kmlData += `<Placemark>\n`;
                    kmlData += `<name>${name}</name>\n`;
                    kmlData += `<Point>\n<coordinates>${element.lon},${element.lat}</coordinates>\n</Point>\n`;
                    kmlData += `</Placemark>\n`;
                }
            });
    
            kmlData += `</Document>\n</kml>`;
    
            // 創建 Blob 以便下載
            const blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${favoriteList.title}.kml`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            Toast.fire({
                icon: 'error',
                text: '無可下載的資料',
            });
        }
    };

    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseModal}>
            <div className="bg-white rounded-xl h-[90%] sm:h-[80%] w-11/12 lg:w-3/4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black pb-2">
                    <div className="flex flex-row justify-center items-center text-xl gap-1 sm:gap-2">
                        <h2 className="font-semibold cursor-pointer text-xl">
                            <i className="fa-solid fa-list mr-2"/> 
                            <span 
                                ref={titleRef}
                                onBlur={handleTitleChange}
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                            >
                            {title}        
                            </span>
                        </h2>
                        <span className="text-sm sm:text-xl">[{filteredItems.length}個地點]</span>
                    </div>
                    <div className="flex flex-row gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                        <button className="text-black hover:bg-red-700" onClick={handleDeleteList}>
                            <i className="fa-solid fa-trash sm:text-2xl"></i>
                        </button>
                        <button className="text-black" onClick={handleDownload}>
                            <i className="fa-solid fa-download sm:text-2xl"></i>
                        </button>
                        <button className="text-black" onClick={handleCloseModal}>
                            <i className="fa-solid fa-times sm:text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row w-full h-[94%]">
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
                        favoriteListID={favoriteList.id}
                        recordSet={recordSet}
                        setRecordSet={setRecordSet}
                        JWTtoken={JWTtoken}
                        setSearchTerm={setSearchTerm}
                        searchTerm={searchTerm}
                        filteredItems={filteredItems}
                        setFilteredItems={setFilteredItems}
                        selectedRecord={selectedRecord}
                        setSelectedRecord={setSelectedRecord}
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

const RightSide = ({ favoriteListID, recordSet, setRecordSet, JWTtoken, setSearchTerm, searchTerm, filteredItems, setFilteredItems, selectedRecord, setSelectedRecord }) => {

    // 當項目排序結束後的回調函數
    const handleOnDragEnd = async (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        // 確保不可變數據處理：創建 filteredItems 的副本
        let items = Array.from(filteredItems);

        // 把被拖動的元素從原位置移除
        const [reorderedItem] = items.splice(result.source.index, 1);

        // 在新位置插入被拖動的元素
        items.splice(result.destination.index, 0, reorderedItem);

        // 更新前端狀態，這將觸發重渲染
        setFilteredItems(items); 

        const childElements = recordSet.elements.filter((items) => items.displayName == null);
        items = [...items, ...childElements];

        const updatedRecordset = {
            ...recordSet,
            elements: items,
        };

        setRecordSet(updatedRecordset);

        // 將更新後的 recordset 傳給後端 API 同步到資料庫
        const response = await updateFavorite(JWTtoken, favoriteListID, { new_recordset: updatedRecordset });
    
        if (response.statusCode !== 200) {
            Toast.fire({
                icon: "error",
                text: "更新順序失敗: " + response.message
            });
        }
    };
    

    return (
        <div className="w-full lg:w-[30%] h-[70%] lg:h-full flex flex-col pt-4 lg:pl-4 lg:border-l overflow-y-auto">
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
                        <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-1 overflow-y-auto pt-2 max-h-[20vh] sm:max-h-full">
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
        <div className="w-full h-[70%] sm:h-full overflow-y-auto pt-2 flex justify-center items-center">
            <div className="w-full h-full flex flex-col justify-center">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col items-start">
                        <div className="flex flex-row items-center text-base sm:text-xl gap-2">
                            <i className="fa-solid fa-location-dot"></i>
                            <span>{selectedRecord.displayName}</span>
                        </div>
                        <div className="flex flex-row items-center text-sm sm:text-xl gap-2">
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

    const handleSave = () => {
        const updatedRecord = { ...record, displayName, displayAddress};
        onSave(updatedRecord);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl md:w-1/3 shadow-lg animate__animated animate__bounceIn"
                onClick={(e)=>{e.stopPropagation()}}
            >
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
                <div className="flex justify-center gap-4">
                    <button onClick={handleSave} className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded">保存</button>
                    <button onClick={onClose} className="bg-slateBlue text-white hover:bg-darkSlateBlue px-4 py-2 rounded">取消</button>
                </div>
            </div>
        </div>
    );
};
