// import css from '../css/About.module.css';

import css from '../css/About.module.css';
import logo from "@/assets/logo2.png";

export default function About() {
    return (
        <div className={css.container}>
          <div className={css.aboutUs}>
            <h1>關於我們</h1>
            <br/>
            <br/>
              <div className={css.aboutContent}>
                  <img className={css.logo} src={logo} alt="Logo" />
                  <p>
                  歡迎來到NLMap！我們是一群<br/>
                  來自淡江大學資訊管理系的學生，參<br/>
                  加畢業專題競賽時共同開發了這款名<br/>
                  為NLMap的程式。我們的目標是創<br/>
                  造一個簡單、高效的地理資訊查詢工<br/>
                  具，讓使用者能夠輕鬆地通過自然語<br/>
                  言進行地理位置的檢索和驗證。
                  </p>
              </div>
              <br/>
              <br/>
              <br/>
              <br/>
              <hr/>
          </div>

        <div className={css.section}>
          <h1>專題成員</h1>
          <ul>
            1. 專題教授:<strong>魏世杰</strong><br />
            <strong>2. 陳姿樺: </strong>組長、負責UI設計，包括歷史紀錄、收藏及手機版網頁的設計<br />
            <strong>3. 洪廷樺: </strong>負責前端網頁開發及後端伺服器程式設計<br />
            <strong>4. 梁明業: </strong>負責中文資料分類，並設計了資料庫的ER圖<br />
            <strong>5. 廖啟成: </strong>負責中文資料分類<br />
            <strong>6. 徐明献: </strong>負責主視覺設計及UI設計，包括首頁、帳號登入和註冊、使用教學和"關於我們"頁面的設計，並整理了1000筆原始資料<br />
            <strong>7. 楊舒宇: </strong>負責原始資料的分類，並將手機版多做的介面補充改成電腦版的設計<br />
            <strong>8. 賴美妍: </strong> 負責原始資料的分類、UI設計關於我們、管理員後台介面
          </ul>
          <br/>
          <hr/>
        </div>
        
        <div className={css.section}>
        <h1>具備哪些功能</h1>
        <ul>
        <strong>1. 自然語言查詢：</strong>允許用戶通過自然語言進行OpenStreetMap數據的查詢，例如查找特定類型的地點或特定地點附近的設施。<br />
          <strong>2. 地理位置檢索：</strong>用戶可以通過查詢OpenStreetMap數據來驗證地理位置的信息，例如確認某個地點是否存在或特定地點附近是否有特定設施。<br />
          <strong>3. 地圖展示：</strong>將查詢結果以地理地圖的形式呈現給用戶，以直觀地顯示搜尋結果。<br />
        </ul>
        <br/>
        <hr/>
      </div>

      <div className={css.section}>
        <h1>設計架構</h1>
        <ul>
        <strong>1. Langchain結構：</strong>將每個固定單位的自然語言問句和答案進行編碼，讓使用者能夠查詢新的案例並匹配之前編的案例。<br />
          <strong>2. GPT API整合：</strong>使用GPT API輸入提示字串，並依據Langchain查詢出最接近的幾個案例，整理出應有的答案。<br />
          <strong>3. Overpass指令傳輸：</strong>將得到的Overpass指令轉換為搜尋結果並呈現在地圖上。<br />
        </ul>
        <br/>
        <hr/>
      </div>

      <div className={css.section}>
        <h1>應用場景</h1>
        <ul>
          <strong>1. 旅遊指南應用：</strong>幫助用戶通過自然語言描述需求，例如“找到附近的餐廳”或“顯示附近的公園”，在地圖上顯示出符合條件的地點。<br />
          <strong>2. 城市規劃與建設：</strong>幫助城市規劃者查詢特定區域的地理特徵和設施，例如“查詢在市中心範圍內的公共交通站點”或“檢索市區內的綠化空間”。<br />
          <strong>3. 地理教育應用：</strong>幫助地理教育者教導學生如何查詢地理信息，例如“顯示鄰近的河流”或“查找周圍的山脈”。<br />
          <strong>4. 交通規劃：</strong>幫助交通規劃者查詢交通設施和路線，例如“檢索周圍的公車站牌”或“找到附近的自行車道”，以優化城市交通系統。<br />
          <strong>5. 環境保護和監測：</strong>幫助環境保護人士查詢特定區域的環境特徵，例如“找到附近的自然保護區”或“顯示周邊的河流”，以進行環境監測和保護工作。<br />
        </ul>
        <br/>
        <hr/>
      </div>
        
      <div className={css.final}>
        
        <p>
        我們希望通過NLMap，為使用者提供一個高效、便捷的
        地理資訊查詢工具，讓傳統的地理數據查詢變得更加直觀和
        簡單。感謝您的支持與關注！
        </p>
      </div>

        
      </div>
    );
}