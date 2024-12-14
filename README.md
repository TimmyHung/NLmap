# **歡迎來到 NLmap 的程式碼儲存庫**

 我們是一群來自資訊管理學系的學生，因為畢業專題競賽而共同開發了NLmap。
 
 我們的目標是創造一個簡單、高效的地理資訊查詢工具，讓使用者能夠輕鬆地通過自然語言進行地理位置的檢索。

### 📁 **檔案結構**
- `react/`：前端程式碼
- `flask/`：後端程式碼
- `schema_nodata.sql`：資料庫大綱
- `系統文件書.pdf`：關於這個項目的相關資訊

### 🚀 **快速開始**
```bash
git clone https://github.com/TimmyHung/NLmap.git
cd NLmap

# 安裝前端依賴
cd react
npm install
npm run build

# 將打包後的網頁遷移到Apache目錄下，記得將"目錄名稱"替換成實際的名稱
cp -r /dist/* /var/www/目錄名稱/

# 安裝後端依賴
cd ../flask
pip install -r requirements.txt
python main.py
```


### 🌐 **Apache設定**
記得將`yourdomain.com`替換為實際的網域名稱
```apache
<VirtualHost *:80>
    ServerName yourdomain.com

    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteBase /
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [L]
    </Directory>

    ProxyPreserveHost On
    ProxyPass "/api" "http://localhost:3000/api"
    ProxyPassReverse "/api" "http://localhost:3000/api"

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

### ⚙️ **環境變數與資料庫**
- 將schema_nodata.sql匯入MySQL資料庫  
- 將`.env(SAMPEL)`更改名稱為`.env`並填妥要求的資訊

### 🌱 **大功告成**
- 前端網頁：透過 `http://localhost` 連線。  
- 後端伺服器：API 請求將透過 `http://localhost/api` 自動代理到 `http://localhost:3000`。

### 👑 **預設管理員帳號**
- 帳號：`admin@nlmap.com`  
- 密碼：`password`