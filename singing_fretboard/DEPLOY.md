# Singing Fretboard — 部署說明

這個資料夾就是完整的 App。把 **`app/` 裡的所有檔案**放到一個 GitHub repo，用 Vercel 部署，就會得到一個可安裝的網頁 App。

---

## 一、資料夾裡有什麼

| 檔案 | 用途 |
|---|---|
| `index.html` | **App 本體**。單一自含檔案（約 7 MB，字體、樣式、程式都已內嵌）。 |
| `manifest.webmanifest` | App 的名稱、圖示、顯示方式。安裝後 Dock 上顯示 **Singing Fretboard**，橫式、獨立視窗。 |
| `sw.js` | 離線快取（Service Worker）。第一次開啟後，之後沒網路也能用。 |
| `icons/` | App 圖示，由你的 logo 產生：192、512、512 maskable、Apple touch 180。 |
| `assets/huanyin_logo.jpg` | 匯出圖片右上角的 logo 浮水印會讀這個檔，**不要刪**。 |
| `vercel.json` | 讓 `sw.js` 與 `index.html` 不被過度快取，改版後使用者才會拿到新版。 |

這個部署版本已預設**匯出時加入 Logo**（匯出面板裡的「加入 Logo」開啟）。

---

## 二、部署到 Vercel（用你現有的免費帳號）

1. GitHub 新建一個 repo，例如 `singing-fretboard`（Private 或 Public 都可以）。
2. 把 `app/` 裡的檔案**放到 repo 的根目錄**（也就是 `index.html` 要在最上層；不要多一層 `app/` 資料夾）。
   如果你想保留 `app/` 這層，那就在 Vercel 匯入時把 **Root Directory 設成 `app`**。
3. Vercel → **Add New → Project → Import** 那個 repo。
   - Framework Preset：**Other**
   - Build Command：留空
   - Output Directory：留空
4. 按 Deploy。完成後會拿到一個 `xxx.vercel.app` 的網址，先用它測試。

### 綁你自己的子網域（不用再買網域）

1. Vercel 專案 → **Settings → Domains → Add**，輸入 `fretboard.huanyin.com`（名字可自訂）。
2. Vercel 會給你一筆 DNS 紀錄，到你網域的 DNS 設定加上：
   `CNAME` ｜ 名稱 `fretboard` ｜ 值 `cname.vercel-dns.com`
3. 等 DNS 生效（通常幾分鐘），HTTPS 憑證 Vercel 會自動處理。

> Vercel 免費版（Hobby）可以有 200 個專案、每天 100 次部署，再多一個專案沒問題。唯一限制是「個人、非商業用途」——自己用、給學生用都可以；若日後要在同一個網址上收費販售，需升級付費方案。

---

## 三、安裝到本機

**Mac Chrome / Edge**：打開網址 → 網址列右側的「安裝」圖示 → 安裝。之後在 Launchpad／Dock 就有獨立圖示與視窗。

**Mac Safari**：打開網址 → 選單「檔案 → 加入 Dock」。

**iPad / iPhone Safari**：分享 → 加入主畫面。

**學生**：不必安裝，直接打開網址就能用。

---

## 四、之後要更新

1. 我修改編輯器 → 重新產生 `index.html`。
2. 你把新的 `index.html` push 到 repo，Vercel 自動重新部署。
3. **重要**：如果同時改了 `sw.js` 以外的檔案而使用者拿到舊版，把 `sw.js` 裡的
   `const VERSION = 'sf-v1';` 改成 `'sf-v2'`（依序遞增）再 push，所有裝置就會重新下載。

### 本次更新（v1.9，`sf-v12`）

- 改用「弦吟指板 v1.9_拆分與測試 Split Tests」重新產生 `index.html`。
- 新增 `fretboard-music.js`、`fretboard-storage.js`，要跟 `index.html` 一起 push。
- 資料改存在 `hy-fb-v1_8-`。第一次打開會自動把舊的 `hy-fb-v1_1-` 資料複製過來，舊資料不會刪。
- 舊版 index.html 備份在專案的「部署備份 backup/v1.4 index.html」，出問題時可以換回去。

### 前次更新（v1.4 修正，`sf-v11`）

- 抖動：逐格分析實機錄影，指板每約 0.1 秒上下跳 1–2px。原因是指板高度量測在小數進位時來回差 1px，連帶置中邊距跟著變。現在差距 3px 以內沿用舊值，不再重畫。

### 前次更新（v1.4 修正，`sf-v10`）

- 音階／調弦／琴格／顯示／匯出：再按一次同一顆按鈕就關閉面板。
- 手機長按不再出現文字圈選藍框與拷貝選單（輸入欄不受影響）。

### 前次更新（v1.4 修正，`sf-v9`）

- 抖動根本修正：標題大小和指板倍率原本互相牽動、來回拉扯；現在標題倍率只在畫面尺寸改變時更新一次。

### 前次更新（v1.4 修正，`sf-v8`）

- 直式：調弦法／Capo 標籤移到標題下一行，不再和長標題重疊。
- 圓點命名圖例改一行四個，間距縮小。
- 橫放：旋轉時等尺寸穩定才重算一次，指板不再抖動。
- 修正視窗縮放時畫面不跟著調整的錯誤。

### 前次更新（v1.4，`sf-v6`）

- 改用「弦吟指板 v1.4_手機觸控介面 iOS Touch」重新產生 `index.html`（手機觸控介面）。
- `sw.js` 版本號升到 `sf-v6`，已安裝的裝置會重新下載。

### 前次更新（v1.2，`sf-v5`）

- 手機直式時改為滿版提示層：置中的「請橫放手機，以獲得最佳使用體驗。」與一顆「知道了，不再提示」按鈕；原本的細長提示條已移除。
- 「不再提示」會記在瀏覽器（localStorage 鍵值 `hy-fb-v1_1-rotateHintOff`），下次進來不會再出現。
- 手機模式字級放大：主標 23px、英文副標 13px、eyebrow 10px、調弦／Capo 標籤與面板小標一律加大。
- 裝置判斷回到 auto（依視窗短邊≤500px 判定為手機）。

---

## 五、資料存在哪裡

- **存檔庫（儲存進度）**：存在瀏覽器本機（同一個網址、同一台裝置才看得到），換電腦不會同步。
- **專案檔（.json）**：面板上的「開啟… / 儲存 / 另存新檔」，可以存到 iCloud、雲端硬碟或任何資料夾，換電腦、備份、寄給別人都用這個。
  - 快捷鍵：`⌘S` 儲存、`⇧⌘S` 另存新檔、`⌘O` 開啟。
  - 從網址開啟（部署後）時，Chrome／Edge 可以真正「覆寫原檔」；Safari 會改成匯出到下載夾。
- **指板圖圖片**：右上「匯出圖片」，PNG／JPG，可選去背與尺寸。

---

## 六、視窗尺寸

App 有三種固定橫式格式，只做等比縮放，不會再有拉動視窗時排版跑掉的情況：

- 視窗寬 1200px 以上 → **1440 × 900**
- 900–1200px → **1200 × 860**
- 900px 以下 → **960 × 1100**

縮放下限 0.5 倍，再小就出現捲軸；切換門檻有 ±40px 緩衝，避免在邊界來回跳動。
