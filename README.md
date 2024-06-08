#**歡迎來到 NLmap 的程式碼儲存庫**

協作開發以下幾點請注意並遵守：
1. 禁止**直接**推送或提交任何版本到main分支。
2. 請善用分支功能提交自己寫的code在自己的分支上。
3. 確認code測試無誤後可以提出pull request，確認沒問題後會合併到main分支上。

關於要怎麼操作：
1. 可以`git clone https://github.com/TimmyHung/Graduation-Project.git` 到你的桌面
2. react為前端使用TypeScript撰寫、flask為後端使用Python撰寫
3. 右鍵使用vscode開啟資料夾後可以在終端機上 cd react進到react資料夾
   ```
   npm install
   npm run dev
   ```
   當你看到下面圖片的畫面
   
   <img width="285" alt="image" src="https://github.com/TimmyHung/Graduation-Project/assets/58425985/542bff18-4c5d-47ed-b569-0666de807fdf">
   
   代表網頁在`http://localhost:80/`本地端開啟了
4. cd flask到flask的後端網站
   ```
   python3 main.py
   ```
   可以開啟後端
   但可能需要自行查看程式碼有引入哪些套件
   使用`pip install xxx`自行安裝
   
   <img width="675" alt="image" src="https://github.com/TimmyHung/Graduation-Project/assets/58425985/00c35fc9-295f-40a7-9fd3-f4ce78ab0242">

   舉個例子如上面圖片他寫`No module named 'dotenv'`代表你要使用`pip install dotenv`安裝相關套件

   記得在flask的資料夾內新增.env檔案
   <img width="125" alt="image" src="https://github.com/TimmyHung/Graduation-Project/assets/58425985/3e7e9309-6b6b-4084-9b22-25392af4e2aa">
   檔案內容如下：
   ```
    DATABASE_HOST=
    DATABASE_USER=
    DATABASE_PASSWORD=
    DATABASE_SCHEMA=
    
    DISCORD_CLIENT_ID=1248966248859963505
    DISCORD_CLIENT_SECRET=Ul3SztDMDKRljfqAt1uk0V-KS7zMbzc3
    
    JWT_SECRET_KEY=3dc6d7c8521a4af36476633c151472e2b680b16febabd4052508722ebd980df2
    OPENAI_API_KEY=
    ```
   Ｑ：為什麼要.env檔案？
   Ａ：資訊安全考量不會把敏感資訊直接寫在程式碼內
   
   1. DATABASE開頭的為資料庫連線相關
   2. DISCORD開頭的為Discord登入使用
   3. JWT開頭的為驗證使用者登入身份是否遭竄改所使用(外流就完了)
6. 資料庫的部分可以架設本地端的Ｍysql至於怎麼安裝請上網查詢
7. 登入、查詢一開始不會運作很正常，因為前後端的IP在本地跑不一樣，這部分可能要根據你自己的localhost網址去調整，至於哪邊改熟讀程式碼就知道了：>
8. 第三方登入(Google、Apple、Discord)基本上都不能在本地端跑他有一些嚴格要求，所以遇到不能使用不要問我。


**最後的最後，遇到問題請先嘗試自行上網查詢解決，真的真的沒有辦法了再詢問，只怕你不問。**
