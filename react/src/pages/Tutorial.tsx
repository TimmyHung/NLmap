import css from '../css/Tutorial.module.css';
import Home_page from "@/assets/主頁.png";
import Login from "@/assets/登入.png";
import Search from "@/assets/搜尋匡.png";
import history1 from "@/assets/歷史紀錄1.png";
import history2 from "@/assets/歷史紀錄2.png";
import history3 from "@/assets/歷史紀錄3.png";
import collect1 from "@/assets/收藏1.png";
import collect2 from "@/assets/收藏2.png";

export default function Tutorial() {
    return (
        <section className="p-4 md:p-16 font-sans bg-darkBlueGrey">
            <div className="bg-[#F2F0F0] p-7 rounded-[28px]">
                <h2 className="text-center text-black text-[35px]">使用教學</h2>

                <h3 className="text-black text-xl md:text-3xl">建立帳號</h3>
                <div className="flex flex-col items-center justify-center  w-auto">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={Login} alt="建立帳號步驟1" className="w-full h-auto rounded-lg border border-gray-300" />
                        <p className="flex flex-col justify-center text-base md:text-2xl mt-1 md:mt-4 text-left">
                            建立帳號啟用歷史紀錄及收藏的功能，方便下次的查詢。
                        </p>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />

                <h3 className="text-black text-xl md:text-3xl">地圖查詢</h3>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={Home_page} alt="地圖查詢步驟2" className="w-full h-auto rounded-lg border border-gray-300" />
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">利用旁邊的搜尋欄輸入自然語言，稍待程式執行(搜尋結果會以地圖形式顯示)。</li>
                        </ol>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />
                <h3 className="text-black text-xl md:text-3xl">查詢</h3>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={Search} alt="地圖查詢步驟3" className="w-full h-auto rounded-lg border border-gray-300" />
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">1.使用搜尋有分為GPT-3.5和GPT-4，他們的差別在於理解、生成能力及準確性。</li>
                            <li className="text-base md:text-2xl">2.我們提供快速搜尋的提示詞。</li>
                            <li className="text-base md:text-2xl">3.手動查訊是給對Overpass語法熟悉的用戶，能夠自己創立屬於自己的查詢。</li>
                        </ol>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />
                <h3 className="text-black text-xl md:text-3xl">歷史紀錄</h3>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={history1} alt="地圖查詢步驟4" className="w-full h-auto rounded-lg border border-gray-300" />
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">1.在登入後，你可以發現輸入完成的字詞，會被儲存到歷史紀錄裡。</li>
                            <li className="text-base md:text-2xl">2.並且可以注意到，你不僅可以篩選縣市，還可以篩選該縣市的行政區，以便縮小範圍。</li>
                            <li className="text-base md:text-2xl">3.此時如果你又多新增一個搜尋，可以上滑，讓你的搜尋詞載入到歷史紀錄中。</li>
                        </ol>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />
                <h3 className="text-black text-xl md:text-3xl">歷史紀錄-地圖顯示</h3>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={history2} alt="地圖查詢步驟5" className="w-full h-auto rounded-lg border border-gray-300" />
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">在你搜尋的紀錄裡，可以查看該位置的地圖顯示。</li>
                        </ol>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />
                <h3 className="text-black text-xl md:text-3xl">歷史紀錄-加入收藏</h3>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={history3} alt="地圖查詢步驟6" className="w-full h-auto rounded-lg border border-gray-300" />
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">在歷史紀錄裡，可以點選你要的位置，加入到收藏。</li>
                        </ol>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />
                <h3 className="text-black text-xl md:text-3xl">收藏-創建收藏</h3>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={collect1} alt="地圖查詢步驟7" className="w-full h-auto rounded-lg border border-gray-300" />
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">你可以任意的創建收藏清單，裡面可以放你想存放的地點。</li>
                        </ol>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />
                <h3 className="text-black text-xl md:text-3xl">收藏-查看</h3>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <img src={collect2} alt="地圖查詢步驟8" className="w-full h-auto rounded-lg border border-gray-300" />
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">你所存放的地點將在這邊展示，另外還可以修改這個地點的名字。</li>
                        </ol>
                    </div>
                </div>          
            </div>
        </section>
    );
}
