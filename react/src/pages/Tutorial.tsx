import css from '../css/Tutorial.module.css';

export default function Tutorial() {
    return (
        <div className={css.tutorial}>
            <section className={css.tutorial_section}>
                <h2>圖片都是暫放</h2>
                <div className={css.tutorial_step}>
                    <h3>1. 建立帳號</h3>
                    <div className={css.step_content}>
                        <div className={css.step_image}>
                            <img src="https://i.redd.it/ux74bsifrpda1.jpg" alt="建立帳號步驟1" />
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa9jA-wskBw3vxTFYXbBoyh46Icq4VFVOIvg&s" alt="建立帳號步驟2" />
                            <img src="https://preview.redd.it/wy925k0hmvk51.png?auto=webp&s=82a042d28b9ac65e3f3daac30c7cc2dc6490c7eb" alt="建立帳號步驟3" />
                        </div>
                        <p>需建立完成帳號才能使用歷史紀錄及收藏的功能，方便下次的查詢</p>
                    </div>
                </div>

                <div className={css.tutorial_step}>
                    <h3>2. 地圖查詢</h3>
                    <div className={css.step_content}>
                        <div className={css.step_image}>
                            <img src="https://images.theconversation.com/files/521751/original/file-20230419-18-hg9dc3.jpg?ixlib=rb-4.1.0&rect=398%2C2%2C1206%2C991&q=20&auto=format&w=320&fit=clip&dpr=2&usm=12&cs=strip" alt="地圖查詢步驟1" />
                            <ol>
                            <li>利用旁邊的搜尋欄輸入自然語言，稍待程式執行（搜尋結果會以地圖形式顯示）</li>
                            <li>地圖上方的搜尋欄則是輸入地名，它能夠幫你找到你想搜尋的地方</li>
                            <li>地圖左邊的搜尋按鈕，它能夠讓你輸入完自然語言，縮放到資料點位置</li>
                            <li>建立完成帳號後的使用收藏功能，按一下搜尋欄右上方的愛心即可收藏</li>
                        </ol>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};