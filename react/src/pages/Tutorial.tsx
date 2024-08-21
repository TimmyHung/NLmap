import css from '../css/Tutorial.module.css';
import Home_page from "@/assets/主頁.png";
import Login from "@/assets/登入.png";

export default function Tutorial() {
    return (
        <section className="p-4 md:p-16 font-sans bg-[#344851]">
            <div className="bg-[#F2F0F0] p-7 rounded-[28px]">
                <h2 className="text-center text-black text-[35px]">使用教學</h2>

                <h3 className="text-black text-xl md:text-3xl">建立帳號</h3>
                <div className="flex flex-col items-center justify-center  w-auto">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={Login} alt="建立帳號步驟1" className="w-full h-auto rounded-lg" />
                        <p className="flex flex-col justify-center text-base md:text-2xl mt-1 md:mt-4 text-left">
                            建立帳號啟用歷史紀錄及收藏的功能，方便下次的查詢。
                        </p>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />

                <h3 className="text-black text-xl md:text-3xl">地圖查詢</h3>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={Home_page} alt="地圖查詢步驟1" className="w-full h-auto rounded-lg" />
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">1.利用旁邊的搜尋欄輸入自然語言，稍待程式執行（搜尋結果會以地圖形式顯示）。</li>
                            <li className="text-base md:text-2xl">2.地圖上方的搜尋欄則是輸入地名，它能夠幫你找到你想搜尋的地方。</li>
                            <li className="text-base md:text-2xl">3.地圖左邊的搜尋按鈕，它能夠讓你輸入完自然語言，縮放到資料點位置。</li>
                            <li className="text-base md:text-2xl">4.建立完成帳號後的使用收藏功能，按一下搜尋欄右上方的愛心即可收藏。</li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    );
}
