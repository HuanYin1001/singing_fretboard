// 弦吟指板｜存檔讀檔
// 管三件事：瀏覽器本機儲存（localStorage）、專案檔（.json）的版本檢查、倉庫改名時的資料搬家。
// 規則寫在專案的 CLAUDE.md：舊版格式不轉換，請使用者重做；較新版本請使用者更新 app。
(function () {
  var CFG = window.HYFB_CONFIG || {};   // v2.2 起在 <head> 先設定自己的倉庫名稱（見 project-link.js）
  var LS_NS = CFG.ns || 'hy-fb-v1_8-';            // 現在的倉庫名稱
  var LS_PREV_NS = CFG.prevNs || ['hy-fb-v1_1-'];     // 以前用過的倉庫名稱（正式版 v1.4 就存在這裡）。之後改名要把舊名加進來，不能刪。
  var PROJ_V = 1;                        // 專案檔（.json）格式版本
  var LS_SCHEMA_V = 1;                   // 本機「目前狀態」存檔格式版本
  var KEYS = { fav: LS_NS + 'favs', save: LS_NS + 'saves', state: LS_NS + 'current', exp: LS_NS + 'export' };

  // 導覽示範（網址帶 ?tour=1）：改用只在記憶體裡的暫存，不讀也不寫使用者的資料。
  var TOUR = (function () { try { return new URLSearchParams(location.search).get('tour') === '1'; } catch (e) { return false; } })();
  var MEM = { _d: {}, get length() { return Object.keys(this._d).length; }, key: function (i) { return Object.keys(this._d)[i] || null; }, getItem: function (k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; }, setItem: function (k, v) { this._d[k] = String(v); }, removeItem: function (k) { delete this._d[k]; } };
  function store(s) { return s || (TOUR ? MEM : window.localStorage); }

  // 第一次開新版時，把舊倉庫的資料「複製」到新倉庫；舊資料原地保留，新倉庫已有的不覆蓋。
  function migrateNS(s) {
    try {
      s = store(s);
      if (s.getItem(LS_NS + '_init')) return false;
      var keys = [];
      for (var i = 0; i < s.length; i++) keys.push(s.key(i));
      LS_PREV_NS.forEach(function (old) {
        keys.forEach(function (k) {
          if (!k || k.indexOf(old) !== 0) return;
          var nk = LS_NS + k.slice(old.length);
          if (s.getItem(nk) === null) s.setItem(nk, s.getItem(k));
        });
      });
      s.setItem(LS_NS + '_init', '1');
      return true;
    } catch (e) { return false; }
  }

  // 讀取：沒有資料或資料壞掉時回傳 fallback，不會讓畫面當掉。
  function read(key, fallback, s) {
    try { var v = store(s).getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }

  // 寫入：空間不足時安靜失敗，回傳 false。
  function write(key, val, s) {
    try { store(s).setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  function userError(m) { var e = new Error(m); e.userMsg = m; return e; }

  // 打開專案檔：先檢查，全部通過才回傳內容；任何一項不符就丟出給使用者看的訊息，不會套用一半。
  function parseProject(text) {
    var o;
    try { o = JSON.parse(text); } catch (e) { throw userError('這份檔案讀不進來，請確認是專案檔（.json）。'); }
    if (o && o.app === 'singing-chord') throw userError('這是和弦的專案檔，請切換到「和弦」再開啟。');
    if (!o || o.app !== 'singing-fretboard' || !o.d) throw userError('這份檔案不是弦吟指板的專案檔。');
    if (typeof o.v !== 'number' || o.v < PROJ_V) throw userError('這份專案檔是舊版格式，目前版本無法開啟。');
    if (o.v > PROJ_V) throw userError('這份專案檔來自較新的版本，請更新 app 後再開啟。');
    return o;
  }

  window.HYFB_STORE = {
    LS_NS: LS_NS, LS_PREV_NS: LS_PREV_NS, PROJ_V: PROJ_V, LS_SCHEMA_V: LS_SCHEMA_V, KEYS: KEYS,
    migrateNS: migrateNS, read: read, write: write, parseProject: parseProject
  };
})();
