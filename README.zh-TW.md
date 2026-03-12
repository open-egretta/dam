# DAM — 數位資產管理系統

自架、開源的數位資產管理系統，專為圖片的整理、儲存與存取而設計。基於 TanStack Start 與 SQLite 打造，無需額外基礎建設。

[English](README.md) | 繁體中文

## 功能特色

- **使用者驗證** — 第一位訪客自動註冊為管理員，後續需登入才能使用
- **媒體上傳** — 拖放介面，支援 JPEG、PNG、WebP、GIF（最大 20 MB）
- **自動縮圖** — 上傳時透過 Sharp 自動產生 400 px WebP 縮圖
- **分類管理** — 建立、重新命名（自動同步至所有媒體）、刪除分類
- **媒體瀏覽** — 依分類切換的媒體庫，支援詳情 Modal
- **媒體資訊** — 儲存尺寸、檔案大小、MIME 類型與上傳日期
- **管理後台** — 儀表板、上傳頁、媒體管理、分類管理
- **下載 API** — 以正確的 UTF-8 編碼提供檔案下載

## 技術棧

| 層級 | 技術 |
|---|---|
| 框架 | TanStack Start（React 19，檔案式路由） |
| 路由 / 資料 | TanStack Router + TanStack Query |
| 驗證 | better-auth v1（email & password） |
| 資料庫 | better-sqlite3（本地 SQLite，零設定） |
| 樣式 | Tailwind CSS v4 |
| 圖片處理 | Sharp |
| 建置工具 | Vite 7 + TypeScript |

## 環境需求

- Node.js 24+
- npm

## 安裝步驟

```bash
# 1. 複製專案
git clone https://github.com/your-org/dam.git
cd dam

# 2. 安裝相依套件
npm install

# 3. 設定環境變數
cp .env.example .env
# 用編輯器開啟 .env 並填入對應的值

# 4. 啟動開發伺服器
npm run dev
```

應用程式將在 `http://localhost:3000` 啟動。

SQLite 資料庫與上傳目錄會在第一次執行時自動建立。

## 環境變數

在專案根目錄建立 `.env` 檔案：

```env
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=http://localhost:3000
VITE_APP_URL=http://localhost:3000
```

| 變數 | 說明 |
|---|---|
| `BETTER_AUTH_SECRET` | 用於簽署 auth session 的隨機字串，請設定為足夠長且隨機的值 |
| `BETTER_AUTH_URL` | 應用程式的 Base URL（伺服器端使用） |
| `VITE_APP_URL` | 同上，提供給前端使用 |

## 可用指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 在 port 3000 啟動開發伺服器 |
| `npm run build` | 建置正式版本 |
| `npm start` | 執行已建置的正式版本 |
| `npm test` | 執行 Vitest 測試 |

## 專案結構

```
src/
├── routes/
│   ├── login.tsx             # 登入 / 註冊頁面
│   ├── admin/                # 受保護的管理後台
│   │   ├── index.tsx         # 儀表板
│   │   ├── upload.tsx        # 媒體上傳
│   │   ├── media.tsx         # 媒體管理（編輯 / 刪除）
│   │   └── categories.tsx    # 分類管理
│   └── media/
│       └── index.tsx         # 公開媒體庫
├── lib/
│   ├── db.ts                 # SQLite 連線與 Schema 初始化
│   ├── auth.ts               # better-auth 設定
│   └── auth-client.ts        # 前端驗證輔助函式
└── utils/
    ├── media.server.ts       # 上傳、縮圖、資料庫操作
    └── categories.server.ts  # 分類 CRUD 操作
```

上傳的檔案存放於 `./uploads/`，縮圖存放於 `./uploads/thumbs/`。

## 授權條款

MIT
