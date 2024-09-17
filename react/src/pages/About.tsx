import css from '../css/About.module.css';
import logo from "@/assets/logo.png";

export default function About() {
    return (
        <div className={`bg-darkBlueGrey ${css.About}`}>
            <section className={css.About_section}>
                <div className={css.text2}>
                    <h2>關於我們</h2>
                </div>
                <div className={css.container}>
                    
                    <div className={css.leftSide}>
                        <div className={css.logo}>
                            <img src={logo} />
                        </div>
                        <div className={css.logo_name}>
                            <p>NLmap</p>
                        </div>
                    </div>

                    <div className={css.rightSide}>
                        <div className={css.text1}>
                            <ol>&emsp;&emsp;歡迎來到NLmap！我們是一群來自淡江大學資訊管理學系的學生，因為畢業專題競賽而共同開發了這款名為NLmap的網站。我們的目標是創造一個簡單、高效的地理資訊查詢工具，讓使用者能夠輕鬆地通過自然語言進行地理位置的檢索。</ol>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className={css.text2}>
                    <h2>專題組員</h2>
                    <ul>
                        <li>指導教授：<strong>魏世杰</strong></li>
                        <li>1.<strong>陳姿樺：</strong>組長，負責 UI 設計，包括「歷史紀錄」、「收藏」及手機版介面，並協助 RAG 資料集建立與文書資料製作。</li>
                        <li>2.<strong>洪廷樺：</strong>新鮮的肝、全端開發，專注於整個專案的程式開發及技術支援。</li>
                        <li>3.<strong>徐明献：</strong>主視覺與 UI 設計，負責「首頁」、「登入」、「註冊」頁面設計、「使用教學」及「關於我們」頁面開發，並協助 RAG 資料集建立。</li>
                        <li>4.<strong>楊舒宇：</strong>負責文書資料製作與 RAG 資料集建立。</li>
                        <li>5.<strong>賴美妍：</strong>負責「關於我們」、「控制台」首面部分的 UI 設計與簡報製作。</li>
                    </ul>
                    <hr/>
                    <h2>具備功能</h2>
                    <ol>
                        <li>1.<strong>自然語言查詢：</strong>允許用戶通過自然語言進行OpenStreetMap數據的查詢，例如查找特定類型的地點或特定地點附近的設施。</li>
                        <li>2.<strong>地理位置：</strong>用戶可以通過查詢OpenStreetMap數據來驗證地理位置的信息，例如確認某個地點是否存在或特定地點附近是否有特定設施。</li>
                        <li>3.<strong>地圖展示：</strong>將查詢結果以地理地圖的形式呈現給用戶，以直觀地顯示搜尋結果。</li>
                        <li>3.<strong>收藏：</strong>將喜好的地點加入收藏，需要時可以匯出為KML格式應用在其他地圖軟體。</li>
                    </ol>
                    <hr/>
                    <h2>設計架構</h2>
                    <ol>
                        <li>1.<strong>擷取增強生成(RAG)：</strong>將自然語言問句轉換為文本嵌入向量，使使用者在輸入提示詞後，能夠透過 FAISS 框架查詢相似的幾筆資料。</li>
                        <li>2.<strong>GPT生成結果：</strong>將 FAISS 框架返回後的資料與使用者輸入的自然語言問句傳給GPT，生成最終的結果。</li>
                        <li>3.<strong>Overpass查詢語言轉換：</strong>將得到的Overpass查詢語言轉換為geoJson並呈現在地圖上。</li>
                    </ol>
                    <hr/>
                    <h2>應用場景</h2>
                    <ol>
                        <li>1.<strong>旅遊指南應用：</strong>幫助用戶通過自然語言描述需求，例如“找到附近的餐廳”或“顯示附近的公園”，在地圖上顯示出符合條件的地點。</li>
                        <li>2.<strong>城市規劃與建設：</strong>幫助城市規劃者查詢特定區域的地理特徵和設施，例如“查詢在市中心範圍內的公共交通站點”或“檢索市區內的綠化空間”。</li>
                        <li>3.<strong>地理教育應用：</strong>幫助地理教育者教導學生如何查詢地理信息，例如“顯示鄰近的河流”或“查找周圍的山脈”。</li>
                        <li>4.<strong>交通規劃：</strong>幫助交通規劃者查詢交通設施和路線，例如“檢索周圍的公車站牌”或“找到附近的自行車道”，以優化城市交通系統。</li>
                        <li>5.<strong>環境保護和監測：</strong>幫助環境保護人士查詢特定區域的環境特徵，例如“找到附近的自然保護區”或“顯示周邊的河流”，以進行環境監測和保護工作。</li>
                    </ol>
                    <hr/>
                    <ol>我們希望通過NLMap，為使用者提供一個高效、便捷的地理資訊查詢工具，讓傳統的地理數據查詢變得更加直觀和簡單。感謝您的支持與關注！</ol>
                </div>
                
            </section>
        </div>
            
            
    );
};