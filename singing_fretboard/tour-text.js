// 導覽的預設文字。在「導覽文字 Tour Text.dc.html」修改後會存在瀏覽器（hy-tour-text），導覽優先用那份。
window.HYTOUR_TEXT = {
  fb: [
    { title: "主音和音階", body: "先選擇主音和音階。\n之後按「套入音階」，指板就會顯示出對應音階。" },
    { title: "調弦", body: "如果要使用特殊調弦，可以在這裡分別修改空弦音。  \n音階位置會跟著自動修改。" },
    { title: "顏色和形狀、整組上色", body: "選擇填充「顏色」，右鍵點擊該顏色可以「選擇形狀」。  \n注意！「小」類別形狀不會顯示音名及級數。  \n   \n「整組上色」功能，可以把「選擇的級數」整組換成同一個顏色。" },
    { title: "框選局部編輯", body: "在指板上選取後點擊右鍵，可以框選局部編輯。\n" },
    { title: "快速切換 A／B", body: "想比較兩組音階的時候，我會分別存進 A 和 B，使用「空白鍵」就能來回切換。" },
    { title: "存檔和匯出", body: "最後是存檔。「檔案」是儲存專案檔。\n開啟專案繼續編輯，也可以傳給別人使用。  \n「匯出圖片」可以把筆記輸出成圖片檔。" },
    { title: "恭喜，完成導覽！", body: "學會了嗎？\n開始製作專屬自己的吉他練習筆記吧！  \n    \n別忘記左下角訂閱我的電子報唷。\n也歡迎寄信給我分享你的使用心得。" },
  ],
  ch: [
    { title: "整頁設定", body: "這裡的設定會套用到右方整頁和弦圖。\n個別和弦可以單獨選取修改。" },
    { title: "新增和弦", body: "按這裡加一張空白和弦圖。\napp 會自動辨識和弦，歡迎考考它。" },
    { title: "編輯和弦圖", body: "左鍵先選取和弦，可以「新增及刪除」圓點。\n拖曳可以畫封閉指型，按右鍵可以設定指法。" },
    { title: "編輯和弦", body: "選取和弦後會跳出「編輯和弦」視窗。\n可以修改和弦名稱、註解、起始格和格數，也能單獨設定這個和弦的指法和音名級數。" },
    { title: "排列順序、選擇多組圖", body: "拖曳和弦圖可以換順序。\n拖曳選取，可以一次框選複數圖片處理。" },
    { title: "存檔和匯出", body: "「檔案」功能和指板頁面相同，儲存的檔案包含和弦區跟指板區。\n「匯出圖片」可以選輸出格式、排版...等。" },
    { title: "恭喜，完成導覽！", body: "很耐心地完成導覽了呢，太棒了！\n有耐心是學吉他最重要的特質。\n「弦吟指板」會在學吉他的路上一直陪著你✨" },
  ],
  // 左下角的提示文字。對話框裡用 [ ] 框起來的字會加藍色底線。
  ui: { bubble: "嗨，我是[桓吟]。第一次來需要介紹，我隨時可以帶你導覽唷！", sub: "訂閱弦吟，領取免費樂譜。" },
};
window.HYTOUR_LS = 'hy-tour-text';
// 每一步的代號（存檔用代號對應，之後插入新步驟也不會錯位）。
window.HYTOUR_IDS = { fb: ['key', 'tuning', 'color', 'chord', 'ab', 'save', 'end'], ch: ['page', 'add', 'edit', 'pop', 'order', 'save', 'end'] };
// 舊格式（陣列、沒有代號）當時的步驟順序。
var HYTOUR_OLD = { fb: ['key', 'tuning', 'color', 'chord', 'ab', 'save', 'end'], ch: ['page', 'add', 'edit', 'order', 'save', 'end'] };
window.HYTOUR_get = function () {
  const base = window.HYTOUR_TEXT, IDS = window.HYTOUR_IDS;
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(window.HYTOUR_LS) || 'null'); } catch (e) {}
  const map = { fb: {}, ch: {} }, ui = (saved && saved.ui) || {};
  if (saved) ['fb', 'ch'].forEach(k => {
    const v = saved[k];
    if (Array.isArray(v)) v.forEach((x, i) => { if (HYTOUR_OLD[k][i]) map[k][HYTOUR_OLD[k][i]] = x; });
    else if (v && typeof v === 'object') map[k] = v;
  });
  const out = {};
  ['fb', 'ch'].forEach(k => {
    out[k] = base[k].map((s, i) => {
      const v = map[k][IDS[k][i]];
      return { title: v && typeof v.title === 'string' && (v.title || !s.title) ? v.title : s.title, body: (v && v.body) || s.body };
    });
  });
  out.ui = { bubble: typeof ui.bubble === 'string' && ui.bubble.trim() ? ui.bubble : base.ui.bubble, sub: typeof ui.sub === 'string' && ui.sub.trim() ? ui.sub : base.ui.sub };
  return out;
};
window.HYTOUR_save = function (text) {
  const IDS = window.HYTOUR_IDS, o = { v: 2, fb: {}, ch: {}, ui: text.ui || {} };
  ['fb', 'ch'].forEach(k => (text[k] || []).forEach((x, i) => { if (IDS[k][i]) o[k][IDS[k][i]] = x; }));
  try { localStorage.setItem(window.HYTOUR_LS, JSON.stringify(o)); return true; } catch (e) { return false; }
};
