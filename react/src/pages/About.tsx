// import css from '../css/About.module.css';

import css from '../css/About.module.css';
import logo from "@/assets/logo2.png";

export default function About() {
    return (
        <>
        <div className="about-us">
          <h1>關於我們</h1>
          <br/>
          <br/>
            <div className="about-content">
                <img className={css.logo} src={logo} alt="Logo" />
                <p>
                  我們的程式旨在提供一個強大而靈活的平台，使<br/>
                  用戶能夠輕鬆地查詢和驗證地理位置數據，並以<br/>
                  直觀的地圖形式展示結果。該系統基於<br/>
                  OpenStreetMap數據，結合了自然語言處理技<br/>
                  術和先進的查詢工具，適用於多種應用場景。
                </p>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
            <hr/>
        </div>
        <div className="section＿authors">
          <h1>作者群</h1>
          <div className="content">
            <img src="https://i.imgur.com/O1CjAG8.jpg" alt="Team Meeting"/>
            <ul>
              <li><strong>教授：</strong>魏世杰</li>
              <li><strong>組長：</strong>陳姿樺 410631625</li>
              <li><strong>組員：</strong>洪廷樺 410631203<br/>
                                        梁明業 410636095<br/>
                                        廖啟成 410636038<br/>
                                        徐明献 410630304<br/>
                                        賴美妍 410631591<br/>
                                        楊舒宇 410630544</li>
            </ul>
          </div>
        </div>
      </>
    );
}