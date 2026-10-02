# Code 修改紀錄：Claude Code 與 Design

這份文件給 Design 看：說明 Claude Code 在本機改了什麼、為什麼這樣改，以及 Design 之後要注意什麼。

## 時間軸

| 時間（台灣） | 誰 | 做了什麼 |
|---|---|---|
| 2026-10-02 23:10 | Design | 產生並打包 v3.0.8 |
| 2026-10-03 約 00:58 | 使用者 | 開啟 Claude Code，詢問協作方式 |
| 2026-10-03 約 01:00–01:05 | Claude Code | 唯讀檢查 v3.0.8（解壓到暫存區，原檔未動）：GA4 現況、網站評價 |
| 2026-10-03 01:08 | Claude Code | 建立 v3.0.9（以 v3.0.8 為基礎），修改設定與文件 |

## Claude Code 的做法

1. 把 `弦吟指板編輯器v3.0.8.zip` 解壓到暫存區閱讀，**不修改 v3.0.8 的任何檔案**。
2. 解開 `index.html` 打包檔的 manifest，確認內嵌的導覽元件有沒有送出 GA4 事件。
3. 複製出新資料夾 `弦吟指板編輯器v3.0.9`，只改設定與文件。
4. 這一版刻意**不碰 HTML 打包檔與 .js 程式**，避免和 Design 端的原始編輯器分叉。

## v3.0.9 修改了哪裡

| 檔案 | 修改 |
|---|---|
| `sw.js` 第 3 行 | `VERSION` `sf-v50` → `sf-v51` |
| `sitemap.xml` | 兩個網址的 `lastmod` `2026-09-30` → `2026-10-03` |
| `DEPLOY.md` | 新增 v3.0.9 更新段；GA4 事件表的 `tour_complete` 補上說明 |
| `code.md` | 新增（本檔） |

## 更正

Claude Code 第一次檢查時說「`tour_complete` 沒有送出」，這個判斷**是錯的**。事件寫在壓縮內嵌的導覽元件 `pkgtour` 的 `go()` 裡（走到最後一步時送出），主程式碼搜尋不到，所以先前誤判。指板、和弦兩頁都有送。

## 給 Design 的注意事項

- v3.0.9 的 HTML 與 JS 和 v3.0.8 **完全相同**，Design 可以直接以 v3.0.8 或 v3.0.9 為基礎。
- 請**不要改動**：外層 `<head>` 的 GA4 程式碼、`hy-shell.js` 的 `hyTrack` 與事件名稱、導覽元件裡的 `hyTrack('tour_complete')`。
- 重新打包後，請把 `sw.js` 的 `VERSION` 再遞增（下一個是 `sf-v52`）。

## 尚未處理、待使用者決定

- GA4 後台：把 huanyinliu.com 加入「不計入的參照網域」；把 `export_image`、`save_project` 標為關鍵事件。
- Cookie 同意機制（視是否有歐盟／英國使用者）。
- 新增「真的開始編輯」的事件（需要改編輯器原始碼，等 Design 端確認原始檔）。
- Google Search Console 是否已驗證。
- 舊版資料夾與 zip 封存。

## v3.0.10（2026-10-03，在 v3.0.9 基礎上）

新增 GA4 事件 `first_edit`：使用者在一次頁面載入中第一次編輯（放音符、改主音、改音階等，導覽示範不算）時送出一次。

| 位置 | 修改 |
|---|---|
| `index.html`、`chord.html` 的編輯器程式 | 在原本「第一次編輯 → `_editSeen = true`」判斷處加 `_hyFE` 旗標，送出 `hyTrack('first_edit')` |
| `hy-shell.js`（HTML 內嵌那份與外部副本） | `hyTrack` 白名單加入 `first_edit: {}` |
| `sw.js` | `VERSION` 改為 `sf-v52` |

測試：指板頁沒編輯時不送；連點兩次主音只送一次；啟動導覽只送 `tour_start`，不送 `first_edit`。**和弦頁、導覽點到最後一步尚未測。**
注意：Design 重新打包時請保留上述修改，並在 DEPLOY.md 的 GA4 事件表登記 `first_edit`。
