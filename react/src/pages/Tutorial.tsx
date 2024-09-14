import css from '../css/Tutorial.module.css';
import Home_page from "@/assets/主頁.mov";
import Login from "@/assets/登入.png";
import history1 from "@/assets/歷史紀錄1.png";
import history2 from "@/assets/歷史紀錄2.png";
import history4 from "@/assets/歷史紀錄4.mov";
import collect1 from "@/assets/收藏1.png";
import collect2 from "@/assets/收藏2.mov";
import forget from "@/assets/忘記密碼.png";


export default function Tutorial() {
    return (
        <section className="p-4 md:p-16 font-sans bg-darkBlueGrey">
            <div className="bg-[#F2F0F0] p-7 rounded-[28px]">
                <h2 className="text-center font-black text-[35px] ">使用教學</h2>
                <br/>
                <h3 className="font-black text-xl md:text-3xl">(一)註冊及登入畫面</h3>
                <br/>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <p className="flex flex-col justify-center text-base md:text-2xl mt-1 md:mt-4 text-left">
                        1. 打開NLmap網頁後可以從右上角按「註冊 | 登入」進入註冊或登入畫面，登入後即可保留使用者客製化資料。需要先註冊帳號才能登入，亦可直接連結Google、Apple或Discord登入。
                        </p>
                        <br/>
                        <img src={Login} alt="建立帳號" className="w-full h-auto rounded-lg border border-gray-300" />
                    </div>
                </div>
                <br/>
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <p className="flex flex-col justify-center text-base md:text-2xl mt-1 md:mt-4 space-y-2 text-left">
                        2. 在登入頁面中有忘記密碼功能，輸入電子郵件後會發送一封帳戶重置驗證碼的信件，即可設定新密碼來做更動。
                        </p>
                        <br/>
                        <img src={forget} alt="忘記密碼" className="w-full h-auto rounded-lg border border-gray-300" />
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />

                <h3 className="font-black text-xl md:text-3xl">(二)首頁</h3>
                <br/>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">1. 右下角的白色搜尋欄可以透過自然語言的方式進行<strong>文字或語音</strong>查詢，或是<strong>自行輸入Overpass Query Language手動查詢</strong>，例：「附近的公車站」。</li>
                            <li className="text-base md:text-2xl">2. 點擊搜尋欄上方<strong>熱門搜尋詞</strong>可直接查看其結果。</li>
                            <li className="text-base md:text-2xl">3. 點選<strong>地圖上的標記點</strong>可以查看其資訊，或將結果加入收藏。</li>
                            <li className="text-base md:text-2xl">4. 右上角的頭貼標誌可以<strong>設定資料及登出帳號</strong>。</li>
                        </ol>
                        <br/>
                        <video controls className="w-full h-auto rounded-lg border border-gray-300">
                            <source src={Home_page} type="video/mp4" />
                            您的瀏覽器不支援HTML5影片標籤。
                        </video>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />
                <h3 className="font-black text-xl md:text-3xl">(三)歷史紀錄</h3>
                <br/>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">1. <strong>已登入的使用者</strong>，網站會記錄使用者的搜尋資訊並將其顯示在歷史紀錄中，用戶可以直接點選上方「歷史紀錄」查看。</li><br/>
                            <li className="text-base md:text-2xl">2. 在歷史紀錄裡可以看到之前的搜尋資訊，若為全臺灣之條件則可依<strong>縣市篩選</strong>，亦可再根據<strong>行政區篩選</strong>，讓用戶能夠快速瀏覽結果，例:臺灣的大學，點選「新北市」即可跑出相對應的結果。</li>
                        </ol>
                        <br/>
                        <img src={history1} alt="縣市和行政區篩選" className="w-full h-auto rounded-lg border border-gray-300" />
                        <br/>
                        <img src={history2} alt="地圖顯示(單筆資料)" className="w-full h-auto rounded-lg border border-gray-300" />
                    </div>
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">3. 您可以點選其中一個或多個搜尋結果（例如：淡江大學）進行<strong>「批量操作」</strong>，包含全選、收藏、移除、地圖顯示等功能。若點選「匯出」則會將結果以<strong>KML格式</strong>下載，方便匯入Google Maps或其他QGIS等應用程式使用。</li>
                        </ol>
                        <br/>
                        <video controls className="w-full h-auto rounded-lg border border-gray-300">
                            <source src={history4} type="video/mp4" />
                            您的瀏覽器不支援HTML5影片標籤。
                        </video>
                    </div>
                </div>

                <hr className="bg-black my-5 md:my-10 h-[2px]" />
                <h3 className="font-black text-xl md:text-3xl">(四)收藏</h3>
                <br/>
                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">1. <strong>已登入的使用者</strong>可在查詢後點選地圖上的標記點，或在歷史紀錄的批量操作中選擇「加入收藏」，將結果保存至收藏，用戶可隨時點選上方的「收藏」進行查看。</li><br/>
                            <li className="text-base md:text-2xl">2. 使用者可以根據需求自行<strong>創建收藏清單</strong>，客製化儲存搜尋結果。</li>
                        </ol>
                        <br/>
                        <img src={collect1} alt="建立收藏清單" className="w-full h-auto rounded-lg border border-gray-300" />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center ">
                    <div className="w-full max-w-[900px] flex flex-col items-center">
                        <ol className="flex flex-col justify-center mt-1 md:mt-4 text-left space-y-2">
                            <li className="text-base md:text-2xl">3. 點選收藏清單可以查看各項目的地理位置與資訊，點擊右上角的下載圖示可將整份清單匯出為 KML 檔案；點擊鉛筆圖示可編輯地點資訊；點選收藏名稱可以進行更改。</li><br/>
                            <li className="text-base md:text-2xl">4. 拖動地點名稱左側的六點圖示可自行調整順序。</li>
                        </ol>
                        <br/>
                        <video controls className="w-full h-auto rounded-lg border border-gray-300">
                            <source src={collect2} type="video/mp4" />
                            您的瀏覽器不支援HTML5影片標籤。
                        </video>
                    </div>
                </div>
            </div>
        </section>
    );
}
