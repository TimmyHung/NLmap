import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from '/src/css/History.module.css';
import clockIcon from "@/assets/clock.png";
import location_icon from '@/assets/location_icon.svg';


const HistoryRecord = ({ title, records }) => {
    const [selectedMapUrl, setSelectedMapUrl] = useState<string | null>(null);

    const removeHistoryRecord = useCallback((event) => {
        
    }, []);

    const handleMapClick = useCallback((event, mapUrl) => {
        event.preventDefault();
        setSelectedMapUrl(mapUrl);
    }, []);

    const closePopup = useCallback(() => {
        setSelectedMapUrl(null);
    }, []);

    return (
        <section className="mx-6 md:mx-10 my-8">
            <main className="flex flex-col box-border overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <img
                            src={clockIcon}
                            className="w-6 md:w-8 ml-1"
                        />
                        <div className='text-lg md:text-2xl max-w-xs md:max-w-full break-all mr-4'>{title}</div>
                    </div>
                    <div className="flex items-center gap-4 relative h-8">
                        <select id="citySelect" name="city" className="text-center bg-gray-200 border border-black rounded-md text-xl px-1 cursor-pointer h-full">
                            <option value="keelung">基隆市</option>
                            <option value="taipei">台北市</option>
                            <option value="newtaipei">新北市</option>
                            <option value="taoyuan">桃園市</option>
                            <option value="hsinchu">新竹市</option>
                            <option value="hsinchucounty">新竹縣</option>
                            <option value="yilan">宜蘭縣</option>
                            <option value="miaoli">苗栗縣</option>
                            <option value="taichung">台中市</option>
                            <option value="changhua">彰化縣</option>
                            <option value="nantou">南投縣</option>
                            <option value="yunlin">雲林縣</option>
                            <option value="chiayi">嘉義市</option>
                            <option value="chiayicounty">嘉義縣</option>
                            <option value="tainan">台南市</option>
                            <option value="kaohsiung">高雄市</option>
                            <option value="pingtung">屏東縣</option>
                            <option value="penghu">澎湖縣</option>
                            <option value="hualien">花蓮縣</option>
                            <option value="taitung">台東縣</option>
                            <option value="kinmen">金門縣</option>
                            <option value="lienchiang">連江縣</option>
                        </select>
                        <div className="hover:bg-red-700 border border-black rounded-md h-full flex justify-center items-center bg-gray-200" onClick={(e)=>removeHistoryRecord(e)}>
                            <i className="fa-solid fa-x cursor-pointer px-2 py-1 hover:text-white"></i>
                        </div>
                    </div>
                </div>

                <div className="flex flex-nowrap overflow-x-auto pb-4 ml-2 gap-6">
                    {records.map((record, index) => (
                        <article key={index} className="rounded-md shadow-lg flex flex-col w-auto max-w-xs h-auto min-h-40 box-border border-4 border-white flex-shrink-0">
                            <h3 className="bg-darkSlateBlue text-white text-xl rounded-t-sm flex box-border relative py-2 pl-4">
                                {record.name}
                            </h3>
                            <div className="bg-gray-200 flex flex-col text-2xl px-6 py-2 flex-grow justify-between rounded-md">
                                <div className="flex items-center gap-2 text-lg  ">
                                    <img
                                        className="h-7 self-start"
                                        src={location_icon}
                                    />
                                    <p>{record.address}</p>
                                </div>
                                <div className="flex justify-end">
                                    <a href="#" className="text-[#144583] text-lg underline font-bold underline-offset-4 cursor-pointer" onClick={(e) => handleMapClick(e, record.mapUrl)}>地圖顯示</a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            {selectedMapUrl && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out" onClick={closePopup}>
                    <div className="relative w-4/5 max-w-3xl h-4/5 max-h-3xl bg-white rounded-md flex justify-center items-center shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedMapUrl} alt="地圖顯示" className="w-full h-full object-cover rounded-md" />
                        <button className="absolute top-2.5 right-2.5 w-26 h-12 bg-white bg-opacity-50 border border-black text-black text-2xl cursor-pointer p-2.5 rounded-md transition-colors duration-300 ease-in-out hover:bg-opacity-70 hover:border-gray-800" onClick={closePopup}>
                            關閉
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

HistoryRecord.propTypes = {
    title: PropTypes.string.isRequired,
    records: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            address: PropTypes.string.isRequired,
            mapUrl: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default HistoryRecord;
