# 弦吟指板筆記 Singing Fretboard Notes — 部署說明（v3.1.0 靜態網站）

這個資料夾就是完整的 App。把 **`app/` 裡的所有檔案**放到一個 GitHub repo，用 Vercel 部署，就會得到一個可安裝的網頁 App。

---

## 一、資料夾裡有什麼（v3.1.0 起是靜態網站：每個檔案分開放，不用解壓）

| 檔案 | 用途 |
|---|---|
| `index.html` | 指板編輯器。 |
| `chord.html` | 和弦編輯器。 |
| `tour.dc.html` | 使用導覽（兩頁共用）。 |
| `support.js`、`vendor/` | 讓畫面跑起來的程式（React 放在 `vendor/`，離線也能用）。 |
| `ds/` | 設計系統的顏色、字體、樣式。 |
| `*.js`（`fretboard-music.js` 等 8 個） | 音樂計算、存檔、連動、導覽文字、共用外殼、Safari 縮放校正。 |
| `manifest.webmanifest`、`icons/` | App 名稱與圖示。 |
| `sw.js` | 離線快取。**每一個檔案都要列在裡面的 CORE 清單**。只在正式網址和 `*.vercel.app` 啟用。 |
| `assets/` | logo、導覽頭像、提示音、分享預覽圖。 |
| `vercel.json`、`robots.txt`、`sitemap.xml` | 快取設定、搜尋引擎設定。 |

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

1. 我修改編輯器 → 重新產生整個資料夾。
2. 你把整個資料夾的內容上傳到 repo（同檔名會直接取代），Vercel 自動重新部署。
3. **重要**：如果同時改了 `sw.js` 以外的檔案而使用者拿到舊版，把 `sw.js` 裡的
   `const VERSION = 'sf-v1';` 改成 `'sf-v2'`（依序遞增）再 push，所有裝置就會重新下載。

### 本次更新（v3.1.0 靜態網站，`sf-v58`，2026-10-06）

- 改成靜態網站：檔案分開放，打開時不用先解壓，米色等待時間變短。畫面、功能、資料跟 v3.0.14 一樣。
- 新增 `support.js`、`tour.dc.html`、`vendor/`、`ds/`；`sw.js` 改列出全部檔案。
- 存檔名稱沒變（`hy-fb-v2_2-`），舊使用者的資料照常讀到。
- 離線快取只在 `fretboard.huanyinliu.com` 和 `*.vercel.app` 啟用。
- **這次要上傳**：整個資料夾。原本 repo 裡的檔案都還用得到，**沒有要刪的檔**；同檔名會被取代。
- 改版前的單檔打包版（v3.0.14，`sf-v57`）備份在專案的「部署備份 backup/v3.0.14 app 單檔打包 sf-v57」。

### 前次更新（v3.0.14，`sf-v57`，2026-10-06）

- 從現行編輯器（v3.0.14）重新打包 `index.html`、`chord.html`。
- 左下「使用導覽」「訂閱」按鈕蓋到畫面內容時自動縮成精簡版（只有大頭貼／信封＋「訂閱」）；每顆按鈕約三分之一被蓋到才縮，視窗放大後恢復。指板、和弦兩頁都有。
- 指板圓點音效：放入音或改顏色／形狀時發出該音（柔撥弦），預設關，開關在檔案視窗最下面，快捷鍵 ⌘⇧M／Ctrl+Shift+M。
- 分頁標題只顯示完整名稱。
- `sitemap.xml` lastmod 改 2026-10-06。GA4、SEO、米色讀取畫面、Safari 縮放校正沿用。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`hy-shell.js`、`sitemap.xml`、`DEPLOY.md`。

### 前次更新（v3.0.13，`sf-v56`，2026-10-05）

- 從現行編輯器（v3.0.13）重新打包 `index.html`、`chord.html`。
- 指板分頁名稱：最多顯示 8 個中文字寬（英數字較窄可多放），超過用「…」；整排超過指板卡片寬度時，每頁一起少顯示幾個字（最少 2 個）。滑鼠移上去仍顯示完整名稱。
- 查和弦按法：
  - 新增 power chord（如 E5、A5、C5）：開放 E5／A5／D5，以及根音在第 6、5 弦的三弦（含八度）與兩弦按法。
  - 大三和弦另外列出完整的 C、G、D 指型（平移，不含空弦），排在最後，不佔 8 個的上限。
  - 開放把位形狀不再另列高八度（第 12 格起）的版本。
  - 個別調整：Aadd9 第三個改 x 0 7 6 0 0；Em7 拿掉第 12 格兩個；Fmaj13 拿掉 13 12 12 12 13 12。
- Safari 修正：開啟專案檔時選了檔案沒反應（選檔按鈕改放進網頁裡，同時聽 change／input），指板、和弦兩頁都改。
- `sitemap.xml` lastmod 改 2026-10-05。GA4、SEO、米色讀取畫面、Safari 縮放校正沿用。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`chord-music.js`、`sitemap.xml`、`DEPLOY.md`。

### 前次更新（v3.0.12，`sf-v54`，2026-10-03）

- 從現行編輯器（v3.0.12）重新打包 `index.html`、`chord.html`。
- 指板分頁（v3.0.12 新功能）：原本右側的「儲存進度」改成指板上方的分頁（最多 10 頁，雙擊改名、右鍵複製／刪除、拖曳排序），專案檔一起存所有分頁；第一次打開時舊的儲存進度自動搬成分頁。開啟專案前，目前修改沒存檔會先問要不要儲存。
- 分頁樣式：選中的分頁左下角多一條淡咖啡色半圓弧線，像活頁扣環連到下方指板；分頁和指板卡片的間距從 10px 縮成 4px（指板大小不變）。
- 和弦頁：調弦旁顯示目前連動的指板分頁名稱。
- GA4、SEO、米色讀取畫面、Safari 縮放校正沿用。`app/` 裡的 .js 跟編輯器同步。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`DEPLOY.md`、`project-link.js`（其餘 .js 一併覆蓋）。

### 前次更新（v3.0.11，`sf-v53`，2026-10-03）

- 從現行編輯器（v3.0.11）重新打包 `index.html`、`chord.html`。包含 Claude Code 在 v3.0.10 加的 GA4 事件 `first_edit`（第一次真的編輯時送一次，導覽示範不算）；指板「快捷鍵」改名「快捷鍵列表」並貼在版權左邊。
- GA4 事件表登記 `first_edit`；`tour_complete` 由導覽元件在走到最後一步時送出（兩頁都有）。
- `sitemap.xml` 的 lastmod 改 2026-10-03。GA4、SEO、米色讀取畫面、Safari 縮放校正沿用。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`hy-shell.js`、`sitemap.xml`、`DEPLOY.md`。

### 前次更新（v3.0.8，`sf-v50`，2026-10-02）

- 導覽：調弦（3/7）、框選後「套入音階」（4/7）的游標改用小視窗的真正位置對準；檔案視窗打開後游標先上下滑過按鈕再點「匯出圖片」（6/7）；和弦導覽畫封閉時封閉跟著游標長出來（4/8）。
- Safari 縮放校正：測試結果量不準時不記住，視窗大小／縮放改變、切回頁面、載入完成後重測（`safari-zoom-fix.js`、`hy-shell.js`、打包檔外層三處同步）。
- 和弦頁：框選多張時放開滑鼠才出現編輯視窗，且不蓋到選到的和弦；第 3 排以後、右邊是「新增和弦」的和弦，編輯視窗放左邊。
- 防抖：指板整頁縮放、和弦紙排版在特定視窗尺寸來回跳時會固定下來（操作或改視窗大小就解除）；和弦頁保留捲軸位置。
- 編輯器檔名改為 v3.0.8。GA4、SEO、米色讀取畫面沿用。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`DEPLOY.md`、`hy-shell.js`、`safari-zoom-fix.js`（其餘 .js 一併覆蓋）。

### 前次更新（v3.0.7，`sf-v49`，2026-10-02）

- 從現行編輯器（v3.0.7，由 v3.0.6 改名）重新打包 `index.html`、`chord.html`，補上之前沒打包的修改：空白指板選主音／音階不自動填滿（要按「套入音階」）、⌘＋右鍵設為主音、新音階「弗里吉安屬 Phrygian Dominant」、大調藍調組成音修正與藍調音標記。
- GA4（`G-0HR4FRCV72`）、SEO、米色讀取畫面沿用。`app/` 裡的 .js 跟編輯器同步。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`DEPLOY.md`、`fretboard-music.js`（其餘 .js 一併覆蓋）。

### 前次更新（v3.0.6 GA4 啟用，`sf-v48`，2026-10-02）

- GA4 換成正式評估 ID `G-0HR4FRCV72`（跟個人網站 huanyinliu.com 同一個資源）。只在 `fretboard.huanyinliu.com` 送出資料；GA4 報表用「主機名稱」篩選即可只看指板編輯器。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`DEPLOY.md`。

### 前次更新（v3.0.6，`sf-v47`，2026-10-02）

- 開場動畫改版：底色換成編輯器的筆記網格；左邊 logo、右邊「弦吟指板筆記」＋ Singing Fretboard Notes，文字出現後五顆深色圓點散落在文字周圍（原本的六條線拿掉）。指板、和弦兩頁一樣。
- 從現行編輯器（v3.0.6）重新打包 `index.html`、`chord.html`；GA4、SEO、米色讀取畫面沿用。v3.0.5 的打包檔備份在「部署備份 backup」。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`DEPLOY.md`。

### 上一次更新（v3.0.5，`sf-v46`，2026-10-02）

- 分享預覽介紹文字更新（兩頁 description、og:description、twitter:description）：
  - 指板頁：最全能的免費指板筆記工具，免安裝網頁版。支援全指板、和弦圖，以及圖片匯出功能。
  - 和弦頁：最全能的免費指板筆記工具，免安裝網頁版。支援全指板編輯、和弦圖，以及圖片匯出功能。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`DEPLOY.md`。

### 上一次更新（v3.0.5 正式上線，`sf-v45`，2026-10-02）

- 從現行編輯器（v3.0.5 指板／和弦／導覽）重新打包 `index.html`、`chord.html`，包含 `sf-v44` 之後在編輯器裡做的修改。
- 指板頁 PWA 設定原本重複兩份，整理成一份。
- GA4、SEO 標籤、米色讀取畫面、Safari 縮放校正沿用 `sf-v44` 的設定。
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`、`DEPLOY.md`。

### 上一次更新（v3.0.5，`sf-v44`）

- 搜尋引擎標籤：兩頁「頁面本身」的 `<head>`（打包檔展開後留下的那份）都有 title、description、canonical、og、twitter。外層原本那份保留。和弦頁改用自己的標題「和弦圖編輯器｜弦吟指板筆記 Singing Fretboard Notes」與介紹，`document.title` 也一致。
- GA4 使用量追蹤：追蹤碼只放在打包檔**外層** `<head>`（`<meta charset>` 後面）。ID 已於 `sf-v48` 換成正式的 `G-0HR4FRCV72`。換法：兩頁外層搜尋 `G-XXXXXXXXXX` 各改一處。只在 `fretboard.huanyinliu.com` 送出。事件由 `hy-shell.js` 的 `hyTrack` 送出。
- 匯出圖片後的訂閱視窗下方加一行小字：「本網站使用 Google Analytics 統計匿名使用數據，用於改善工具。」
- **這次要上傳**：`index.html`、`chord.html`、`sw.js`。`hy-shell.js` 也有更新，一併覆蓋（但頁面實際讀的是內嵌在 HTML 裡的那份）。
- **注意**：資料夾裡其他 `.js` 檔目前都是內嵌在 HTML 裡的副本，只改這些檔案不會生效，一定要重新打包 `index.html`、`chord.html`。
- 導覽文字改成從外部 `tour-text.js` 讀取、`sw.js` 文字檔網路優先：這次還沒做。

### GA4 規則

- 追蹤碼只放外層 `<head>`，緊接在 `<meta charset>` 後面，**不要刪除**；template 裡不要放，否則同一次瀏覽會被算兩次。
- 只在 `fretboard.huanyinliu.com` 送出；Design 預覽、本機、其他網址一律不送。
- 事件名稱固定，**不要改名**（改名會讓前後數據接不起來）。新增事件要先把名稱加進下表，再改 `hy-shell.js` 的 `hyTrack`。
- 不送任何個人資料：不送專案標題、檔名、輸入的文字。

| 事件名稱 | 什麼時候送 | 參數 |
|---|---|---|
| `export_image` | 匯出圖片成功 | editor、format（png／jpg） |
| `save_project` | 儲存或另存專案檔 | editor、method（save／save_as） |
| `open_project` | 成功開啟專案檔 | editor |
| `new_project` | 執行開新專案 | editor |
| `chord_lookup` | 查和弦按法且查得到 | editor、chord_name（最多 20 字） |
| `tour_start` | 開始使用導覽 | editor |
| `tour_complete` | 導覽走到最後一步（寫在導覽元件的 `go()` 裡，不在主程式碼） | editor |
| `subscribe_click` | 點擊左下「訂閱」按鈕 | editor |
| `first_edit` | 一次載入中第一次真的編輯（導覽示範不算），只送一次 | editor |

瀏覽量（`page_view`）由 GA4 自動記錄。

### 前次更新（v3.0.5 第一版，`sf-v43`）

- 讀取畫面：打包檔載入時只顯示米色底。「Unpacking...」文字藏起來，中間的小圖（六條線加琥珀圓點）整個刪除，不再留在檔案裡。**以後每次打包都要照做**（測試頁「打包版」組會檢查）。
- 字體：打包版載入時等 Barlow、Barlow Condensed 真的載入完成才重畫（`HY_FONTS_READY`）。導覽元件拿掉會 404 的 `_ds/…/styles.css` 連結（樣式本來就內嵌在頁面裡）。
- Safari 縮放校正：外層、`safari-zoom-fix.js`、`hy-shell.js` 三處都加「只執行一次」保護。
- 更新 `index.html`、`chord.html`、`sw.js`、`hy-shell.js`、`safari-zoom-fix.js`。

### 前次更新（v3.0.4，`sf-v42`）

- 修正：Barlow、Barlow Condensed 字體從 v2.4.0 起沒有成功從 Google Fonts 載入（網址用了可變字體寫法，Google 會略過 Barlow）。改成逐一列出字重的寫法。電腦上沒有安裝 Barlow 的使用者（多數學生、手機）之前看到的是替代字體，這版起會看到正確字體。
- `lang="zh-Hant"` 維持拿掉（v3.0.3）。要加回去必須先修 Design System 的 `:lang(zh)` 行高規則，否則圓點文字會跑掉。

### 前次更新（救急版 v3.0.3，`sf-v41`）

- 修正：圓點文字位置跑掉（Chrome、Safari 都會）。原因是 v3.0.1 加了 `lang="zh-Hant"`，而 Barlow 字體一直沒載入成功，瀏覽器改用中文字體顯示英文字母。暫時拿掉兩頁的 `lang="zh-Hant"`（外層與打包內容各一處）。
- 根本修正（Google Fonts 網址讓 Barlow 真的載入、再加回 `lang`）留給下一版。
- 更新 `index.html`、`chord.html`、`sw.js`。

### 前次更新（打包版 v3.0.1，`sf-v40`）

- 查和弦按法：改用 ↑ ↓ 鍵切換建議和弦，← → 留給輸入框打字。
- 開放和弦按法依「開放和弦確認表」整理（刪除不用的、加入新的，涵蓋大三、小三、七、小七、大七、sus、add9、六、九、減、增、半減七等）。
- 修正：打包檔漏掉 Safari 縮放校正，導致 Safari 指板比例、圓點文字位置不對；兩頁 `<head>` 補上。
- 更新 `index.html`、`chord.html`、`chord-music.js`、`sw.js`，其他 `.js` 內容沒變，一併覆蓋即可。

### 前次更新（打包版 v3 SEO 補充，`sf-v38`）

- 搜尋引擎基本設定：兩頁加上語言標記 `lang="zh-Hant"`、正式網址（canonical）；`index.html` 的分享網址改成網域根目錄 `https://fretboard.huanyinliu.com/`。
- 新增 `robots.txt`、`sitemap.xml`，要一起上傳（不用列進 `sw.js` 離線清單）。
- 編輯器內容沒有改變。更新 `index.html`、`chord.html`、`sw.js`，新增 `robots.txt`、`sitemap.xml`。
- 上線後到 Google Search Console 用 DNS 驗證 `huanyinliu.com`，再送出 `https://fretboard.huanyinliu.com/sitemap.xml`。

### 前次更新（打包版 v3，編輯器 v3，`sf-v37`）

- 指板介面簡化：調弦收到指板右上角按鈕、音階下方一顆「套入音階／清空音階」鍵、快速切換 A／B 預設收起、音階和儲存清單改成自己的下拉選單、整頁會等比縮小。
- 檔案視窗：兩頁都有「開新專案」（先問要不要儲存）、「目前的修改還沒存成專案檔」提示；和弦的「匯出圖片」移進檔案視窗。和弦頁調弦按鈕和小視窗改成跟指板一樣。
- 使用導覽重做：示範更準（Safari 縮放也不會點錯）、可以同時亮好幾塊、新增查和弦按法和 A／B 空白鍵示範；導覽文字更新。
- 空白鍵不會再誤按到按鈕（指板的 A／B 切換照常）。
- 和弦圖右鍵的指法小視窗：拿掉「刪除圓點」，「清除指法」和「標示音名級數」排成一行。
- 新增 `safari-zoom-fix.js`，要一起上傳。更新 `index.html`、`chord.html`、`sw.js`、`tour-text.js`、`hy-shell.js`，其他 `.js` 一併覆蓋。

### 前次更新（打包版 v2.4.4，`sf-v36`）

- 查和弦按法：不再出現「一根手指按兩根弦」的按法（例如 Em7 第 5、4 弦改成兩指各按一弦）。一定要一指按兩弦才按得出來的就拿掉。橫跨 3 弦以上的封閉照舊。
- Gm 拿掉開放把位的 3 1 0 0 3 3。
- 更新 `chord.html`、`chord-music.js`、`sw.js`、`DEPLOY.md`。（v2.4.3 小修 `sf-v35` 只換了 `chord-music.js`，但 `chord.html` 裡有自己一份，所以沒生效，這版補上。）

### 前次更新（打包版 v2.4.3，編輯器 v2.4.3，`sf-v34`）

- 瘦身：`chord.html` 從約 1.2 MB 減到約 0.5 MB。原本把只在測試用的 Nunito、Quicksand、Lora 字體整包塞進檔案；現在不放了，和弦圖旁的襯線字（Source Serif 4）改成開啟時從 Google Fonts 載入。畫面看起來不變。
- 包含 v2.4.2 打包之後的查和弦按法調整，以及導覽文字、連動程式的小修改。
- 更新 `index.html`、`chord.html`、`sw.js`、`chord-music.js`、`project-link.js`、`tour-text.js`，其他 `.js` 一併覆蓋。

### 前次更新（打包版 v2.4.2，編輯器 v2.4.2，`sf-v33`）

- 指板「套入音階」「清空音階」改成按一下做一次，按鈕不會一直亮著。清空之後換主音／音階，指板保持空白；調 Capo 只移動現有圓點。上一步可以還原。
- 和弦編輯器新增「查和弦按法」（左側「整頁設定」上方）：輸入和弦名稱，列出開放和弦、封閉和弦與可移動按法，一次看一張，可以「加入」或「套用到選取」。目前只支援標準調弦。
- 更新 `index.html`、`chord.html`、`sw.js`、`chord-music.js`，其他 `.js` 一併覆蓋。

### 前次更新（打包版 v2.4.1，編輯器 v2.4.1，`sf-v32`）

- 產品改名為「弦吟指板筆記」（英文 Singing Fretboard Notes）：網頁標題、分享預覽標題與介紹都換成新名稱。
- 兩個編輯器左上 logo 旁、開場動畫、匯出圖片上的名稱也改成「弦吟指板筆記」／ Singing Fretboard Notes。
- 裝到手機或電腦桌面時，圖示下面顯示短名稱「弦吟指板」。已經安裝的人要刪掉重新加入主畫面，名稱才會換。
- 功能沒有改變。
- 更新 `index.html`、`chord.html`、`manifest.webmanifest`、`sw.js`、`tour-text.js`、`hy-shell.js`，其他 `.js` 一併覆蓋。

### 前次更新（打包版 v2.4.0，編輯器 v2.4.0，`sf-v30`）

- 手機介面更新：功能鍵固定在上方工具列（按鈕放大、圓角加大）、「全覽」移到工具列「下一步」右邊、工具列和指板中間的線拿掉。
- 手機指板卡片：圓角加大；標題、英文副標、圓點命名、調弦法標籤縮小一點；標題往右挪；Capo 標籤不顯示在指板上；還沒輸入標題時顯示淡灰色「輸入標題」。
- 導覽對話框文字改成「嗨，我是桓吟。第一次來需要介紹嗎？」換行「我隨時可以帶你導覽唷！」。
- 網頁版畫面沒有改變。
- 更新 `index.html`、`chord.html`、`sw.js`、`tour-text.js`，其他 `.js` 一併覆蓋。

### 前次更新（打包版 v2.3.9，編輯器 v2.3.9，`sf-v29`）

- 和弦拖曳排序：拖曳時整張和弦圖跟著游標，琥珀色直線標出插入位置，拖到畫面邊緣自動捲動。
- 和弦編輯：「名稱」輸入格縮小，建議和弦放在輸入格右邊。
- 指板框選右鍵視窗重新排版：套入音階／清空音階放最上面，儲存成和弦圖移到下方，取消鈕拿掉。
- 指板／和弦切換時畫面中央顯示三個琥珀色小點，讀取中不能點選。
- 減重：`index.html` 13 MB → 0.5 MB、`chord.html` 14 MB → 1.2 MB。Logo 縮成 512px、導覽頭像縮成 256×384；介面字體改成開啟時從 Google Fonts 載入（第一次開過後離線也能用）。
- 更新 `index.html`、`chord.html`、`sw.js`、`assets/huanyin_logo.jpg`、`assets/tour-avatar.jpg`，其他 `.js` 一併覆蓋。

### 前次更新（打包版 v2.3.8，編輯器 v2.3.2 修正，`sf-v28`）

- 和弦紙縮放改用 transform，Safari 導覽亮框不再錯位。
- 只需更新 `index.html`、`chord.html`、`sw.js`。

### 前次更新（打包版 v2.3.7，編輯器 v2.3.2 修正，`sf-v27`）

- 導覽中改變視窗大小時，亮框、對話框和游標會等畫面縮放完再重新對齊（和弦編輯器原本會錯位）。
- 只需更新 `index.html`、`chord.html`、`sw.js`。

### 前次更新（v2.3.2 修正，`sf-v26`）

- 重新用目前的 v2.3.2 打包：「使用導覽」淺藍發光＋頭像對話框、匯出一律帶 Logo（匯出視窗開著時 ⌘⇧L／Ctrl+Shift+L 取消／加回）。
- 開始編輯（放圓點、改形狀、改主音／音階／調弦／標題、改和弦）後，「使用導覽」按鈕確實停止發光；開場時就先編輯的話，之後也不會再發光。
- 只需更新 `index.html`、`chord.html`、`hy-shell.js`、`sw.js`。

### 前次更新（v2.3.2 修正，`sf-v24`）

- Safari：和弦紙縮小時，導覽亮框、對話框、示範游標、編輯視窗和框選位置不再錯位（`hy-shell.js` 也更新了）。

### 前次更新（v2.3.2 修正，`sf-v23`）

- 指板和和弦互切時，載入中不再閃出「已選取 {{ selLabel }}」小視窗，和弦頁也不再閃開場動畫。
- 整頁在準備好之前一律只顯示米色（Chrome 會提早畫出未完成畫面）；8 秒後無論如何都會顯示，避免卡住。
- 只需更新 `index.html`、`chord.html`、`sw.js`。

### 前次更新（v2.3.2 修正，`sf-v21`）

- 同一個分頁裡，指板和和弦互切不再閃出開場動畫；開新分頁才會播。
- 只需更新 `index.html`、`chord.html`、`sw.js`。

### 前次更新（v2.3.2 精簡，`sf-v19`）

- 功能沒有改變：刪掉舊程式、把兩頁共用的按鈕動畫和提示音拆到 `hy-shell.js`、導覽對話框不再被編輯視窗蓋住。
- 新增 `hy-shell.js`，要一起上傳；`index.html`、`chord.html`、`sw.js` 也要更新。

### 前次更新（v2.3.2，`sf-v18`）

- 和弦頁也有開場動畫；同一個分頁只播一次，兩頁互切不再播。
- 訂閱按鈕每 60 秒信封放大搖晃、一道光掃過（3 秒）；前景使用滿 20 分鐘響一聲提示音，之後每 20 分鐘一次。⌘M／Ctrl+M 切換提示音。
- 新增 `assets/sfx/sub-ding.mp3`，要一起上傳。

### 前次更新（v2.3.2 初版，`sf-v17`）

- 開場前不再閃出英文進度字和零散素材，改成米色空白直接接開場動畫。
- 頁面顯示後，左下「使用導覽」「訂閱」依序往右滑入（每次開啟都播）。
- 「使用導覽」第一次使用時持續呼吸發光，開始編輯（放圓點、改主音／音階、改和弦）或按下導覽後停止，兩頁共用紀錄。
- 只需更新 `index.html`、`chord.html`、`sw.js`。

### 前次更新（v2.3.1，`sf-v16`）

- 新增使用導覽：兩個編輯器左下角「使用導覽」按鈕，直接在編輯器上示範，結束後畫面原封不動還原。
- 新增 `tour-text.js`、`assets/tour-avatar.jpg`，要一起上傳。
- 資料格式沒變，沿用 `hy-fb-v2_2-`。

### 前次更新（v2.2.1，`sf-v14`）

- 分享連結預覽：`index.html`、`chord.html` 加上標題、介紹和圖片（`assets/og-image.jpg`，600×600），貼到 LINE、Messenger 等會顯示預覽。
  - 標題：弦吟指板編輯器｜Singing Fretboard
  - 介紹：指彈吉他手劉桓吟製作的吉他指板編輯工具，可以編輯指板和和弦圖，適合自學筆記與教學備課，打開網頁就能用。
- 功能沒有改變。

### 前次更新（v2.2，`sf-v13`）

- 指板和和弦連動：`index.html` 是指板編輯器，新增 `chord.html` 是和弦編輯器。
- 新增 `project-link.js`、`chord-music.js`、`chord-library.js`，要一起上傳。
- 資料改存在 `hy-fb-v2_2-`。第一次打開會把 v1.9 的 `hy-fb-v1_8-`（再更舊的 `hy-fb-v1_1-`）複製過來，舊資料不刪。
- v1.9 的 index.html 備份在「部署備份 backup/v1.9 index.html」。

### 前次更新（v1.9，`sf-v12`）

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
