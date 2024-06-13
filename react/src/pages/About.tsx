// import css from '../css/About.module.css';

import css from '../css/About.module.css';
import logo from "@/assets/logo.png";
export default function About() {
    return (
        <div className={css.about}>
            <section className={css.about_section}>
                <h2>關於我們</h2>
                        <div className={css.logo_section}>
                            <img className={css.logo} src={logo} alt="Logo" />
                            <span>NLmap</span>
                        </div>

                        <p>我們的程式旨在提供一個強大而靈活的平台，使用戶能夠輕鬆地查詢和驗證地理位置數據，並以直觀的地圖形式展示結果。該系統基於OpenStreetMap數據，結合了自然語言處理技術和先進的查詢工具，適用於多種應用場景。</p>
                        
                        
                    <h3>作者群</h3>
                        <div className={css.author_image}>
                            <img src="https://images.theconversation.com/files/521751/original/file-20230419-18-hg9dc3.jpg?ixlib=rb-4.1.0&rect=398%2C2%2C1206%2C991&q=20&auto=format&w=320&fit=clip&dpr=2&usm=12&cs=strip" alt="地圖查詢步驟1" />
                            <p>
                                教授 : 魏世杰
                                組長 : 陳姿樺 410631625
                                組員 : 洪廷樺 410631203
                                      梁明業 410636095
                                      廖啟成 410636038
                                      徐明献 410630304
                                      賴美妍 410631591
                                      楊舒宇 410630544
                            </p>
                        </div>
            </section>
        </div>
    );
}