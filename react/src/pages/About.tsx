import css from '../css/About.module.css';

export default function About() {
    return (
        <div className={css.About}>
            <section className={css.About_section}>
                <div className={css.container}>
                    <div className={css.leftSide}>
                        <div className={css.logo}>
                            <img src="src/assets/logo.png" />
                        </div>
                        <div className={css.logo_name}>
                            <p>NLmap</p>
                        </div>
                    </div>
                    <div className={css.rightSide}>
                        <div className={css.text1}>
                            <h2>關於我們</h2>
                            <ol>&emsp;歡迎來到NLMap！我們是一群來自淡江大學資訊管理系的學生，參加畢業專題競賽時共同開發了這款名為NLMap的網站。我們的目標是創造一個簡單、高效的地理資訊查詢工具，讓使用者能夠輕鬆地通過自然語言進行地理位置的檢索和驗證。</ol>
                        </div>
                    </div>
                </div>
                <br/>
                <hr/>
                <div className={css.text2}>
                    <h2>專題成員</h2>
                    <ul>
                        <li>1.專題教授 : <strong>魏世杰</strong></li>
                        <li>2.<strong>陳姿樺：</strong>組長、負責UI設計，包括歷史紀錄、收藏及手機版網頁的設計</li>
                        <li>3.<strong>洪廷樺 :</strong> 負責前端網頁開發及後端伺服器程式設計</li>
                        <li>4.<strong>徐明献 : </strong> 負責主視覺設計及UI設計，包括首頁、帳號登入和註冊、使用教學和"關於我們"頁面的設計，並整理了1000筆原始資料</li>
                        <li>5.<strong>楊舒宇 :</strong> 負責原始資料的分類，並將手機版多做的介面補充改成電腦版的設計</li>
                        <li>6.<strong>賴美妍 : </strong>負責原始資料的分類、UI設計關於我們、管理員後台介面</li>
                    </ul>
                    <hr/>
                    <h2>具備功能</h2>
                    <ol>
                        <li>1.<strong>自然語言查詢：</strong>允許用戶通過自然語言進行OpenStreetMap數據的查詢，例如查找特定類型的地點或特定地點附近的設施。</li>
                        <li>2.<strong>地理位置驗證：</strong>用戶可以通過查詢OpenStreetMap數據來驗證地理位置的信息，例如確認某個地點是否存在或特定地點附近是否有特定設施。</li>
                        <li>3.<strong>地圖展示：</strong>將查詢結果以地理地圖的形式呈現給用戶，以直觀地顯示搜尋結果。</li>
                    </ol>
                    <hr/>
                    <h2>設計架構</h2>
                    <ol>
                        <li>1.<strong>Langchain編碼：</strong>將每個固定單位的自然語言問句和答案進行編碼，讓使用者能夠查詢新的案例並匹配之前編的案例。</li>
                        <li>2.<strong>GPT API整合：</strong>使用GPT API輸入提示字串，並依據Langchain查詢出最接近的幾個案例，整理出應有的答案。</li>
                        <li>3.<strong>Overpass指令轉換：</strong>將得到的Overpass指令轉換為搜尋結果並呈現在地圖上。</li>
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