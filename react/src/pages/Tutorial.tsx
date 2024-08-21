import css from '../css/Tutorial.module.css';
import Home_page from "@/assets/主頁.png";
import Login from "@/assets/登入.png";

export default function Tutorial() {
    return (
        <div className={css.tutorial}>
            <section className={css.tutorial_section}>
                <h2>使用教學</h2>
                <div className={css.tutorial_step}>
                    <h3> 建立帳號</h3>
                    <div className={css.container}>
                        <div className={css.step_content}>
                            <div className={css.step_image}>
                                <img src={Login} alt="建立帳號步驟1" />
                                <p>需建立完成帳號才能使用歷史紀錄及收藏的功能，方便下次的查詢</p>
                            </div>
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <hr/>
                    <h3>地圖查詢</h3>
                    <div className={css.container}>
                        <div className={css.step_content}>
                            <div className={css.step_image}>
                                <img src={Home_page} alt="地圖查詢步驟1" />
                                <ol>
                                    <li>1.利用旁邊的搜尋欄輸入自然語言，稍待程式執行（搜尋結果會以地圖形式顯示）</li>
                                    <li>2.地圖上方的搜尋欄則是輸入地名，它能夠幫你找到你想搜尋的地方</li>
                                    <li>3.地圖左邊的搜尋按鈕，它能夠讓你輸入完自然語言，縮放到資料點位置</li>
                                    <li>4.建立完成帳號後的使用收藏功能，按一下搜尋欄右上方的愛心即可收藏</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <hr/>
                </div>
            </section>
        </div>
    );
}