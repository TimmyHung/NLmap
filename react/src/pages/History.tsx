import React, { useState } from 'react';
import styles from '/src/css/History.module.css';

const HistoryRecord = () => {
    const [isEmpty, setIsEmpty] = useState(false);
    const [popupAddress, setPopupAddress] = useState<string | null>(null);

    const [selectedMapUrl, setSelectedMapUrl] = useState<string | null>(null);

    const removeSectionContent = (event) => {
        const button = event.target.closest('button');
        if (button) {
            const main = button.closest('main');
            if (main) {
                main.innerHTML = '';
                const mains = document.querySelectorAll('main');
                const allEmpty = Array.from(mains).every(main => main.innerHTML.trim() === '');
                if (allEmpty) {
                    setIsEmpty(true);
                }
            }
        }
    };

    const handleMapClick = (event, mapUrl) => {
        event.preventDefault();
        setSelectedMapUrl(mapUrl); 
    };

    const closePopup = () => {
        setSelectedMapUrl(null); 
    };

    return (
        <section className={styles.historyRecord}>
            <main className={styles.mainContent}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/158042f24122477ddd53308d228db29b8b2f08d616466a53faac0edf6c231ca8?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                            alt="Restaurant icon"
                            className={styles.sectionIcon}
                        />
                        <h2>一公里內的餐廳</h2>
                    </div>
                    <div className={styles.scrollIndicator}>
                        <button className={styles.scrollIcon} onClick={(e) => removeSectionContent(e)}>
                            <img
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/a714add5a66be14af01eb25e150cb63a324d804bcd0626f0d2ede0016676fa35?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                alt="Scroll down indicator"
                            />
                        </button>
                    </div>
                </div>

                <div className={styles.cardContainer}>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>餐廳名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>

                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>餐廳名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>餐廳名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>餐廳名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>餐廳名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>餐廳名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                </div>
            </main>

            <main className={styles.mainContent}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/158042f24122477ddd53308d228db29b8b2f08d616466a53faac0edf6c231ca8?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                            alt="Restaurant icon"
                            className={styles.sectionIcon}
                        />
                        <h2>台灣的大學</h2>
                    </div>
                    <div className={styles.scrollIndicator}>
                    <label htmlFor="citySelect" className={styles.visuallyHidden}>
                            選擇城市
                        </label>
                        <select id="citySelect" name="city" className="citySelect">
                            <option value="taipei">台北市</option>
                            <option value="newtaipei">新北市</option>
                            <option value="keelung">基隆市</option>
                            <option value="hsinchu">新竹市</option>
                            <option value="taoyuan">桃園市</option>
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

                        <button className={styles.scrollIcon} onClick={(e) => removeSectionContent(e)}>
                            <img
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/a714add5a66be14af01eb25e150cb63a324d804bcd0626f0d2ede0016676fa35?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                alt="Scroll down indicator"
                            />
                        </button>
                    </div>
                </div>

                <div className={styles.cardContainer}>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>國立臺灣大學</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>台北市大安區羅斯福路四段1號</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>

                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>國立臺北科技大學</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>台北市大安區忠孝東路三段1號</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>東吳大學</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>台北市士林區臨溪路70號</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>國防醫學院</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>台北市內湖區民權東路六段161號</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>國立臺北商業大學</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>台北市中正區濟南路一段321號</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                </div>
            </main>

            <main className={styles.mainContent}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/158042f24122477ddd53308d228db29b8b2f08d616466a53faac0edf6c231ca8?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                            alt="Restaurant icon"
                            className={styles.sectionIcon}
                        />
                        <h2>附近的景點</h2>
                    </div>
                    <div className={styles.scrollIndicator}>
                        <button className={styles.scrollIcon} onClick={(e) => removeSectionContent(e)}>
                            <img
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/a714add5a66be14af01eb25e150cb63a324d804bcd0626f0d2ede0016676fa35?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                alt="Scroll down indicator"
                            />
                        </button>
                    </div>
                </div>

                <div className={styles.cardContainer}>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>

                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                    <article className={styles.card}>
                        <h3 className={styles.cardHeader}>名稱</h3>
                        <div className={styles.cardContent}>
                            <div className={styles.cardAddress}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/625cfd741c05d7a2b885edb8e6a1c38a0fb0aa368d864fa4bc08130e597e74da?placeholderIfAbsent=true&apiKey=a48edfbf646f445aa05de2ba0565552a"
                                    alt="Location icon"
                                    className={styles.addressIcon}
                                />
                                <p>地址</p>
                            </div>
                            <a href="#" className={styles.mapLink} onClick={(e) => handleMapClick(e, 'https://i.ibb.co/bmTKnX6/message-Image-1724144839134.jpg')}>
                                地圖顯示
                            </a>
                        </div>
                    </article>
                </div>
            </main>

            {selectedMapUrl && (
                <div className={styles.popupOverlay} onClick={closePopup}>
                    <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                        <img src={selectedMapUrl} alt="地圖顯示" className={styles.popupImage} />
                        <button className={styles.closeButton} onClick={closePopup}>關閉</button>
                    </div>
                </div>
            )}

            {isEmpty && (
                <div className={styles.noRecords}>
                    <img
                        src="https://i.ibb.co/Nt7CckY/image.png"
                        alt="No Records"
                        className={styles.noRecordsImage}
                    />
                    <p className={styles.noRecordsText}>暫無歷史紀錄</p>
                </div>
            )}
        </section>
    );
};

export default HistoryRecord;
