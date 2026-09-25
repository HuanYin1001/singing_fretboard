// 弦吟指板 v2.2｜指板 ↔ 和弦連動
// 指板和和弦是同一個專案：瀏覽器裡各存一份（指板狀態、和弦本），存成專案檔（.json）時合在一起。
// 只放資料規則（調弦、拼法、檔案格式），不碰畫面。規則寫在專案的 CLAUDE.md。
(function (root) {
  var NS = 'hy-fb-v2_2-';                // v2.2 的倉庫名稱（從空白開始，不搬舊資料）
  var PROJ_V = 2;                        // 合併後的專案檔版本（v1 = 只有指板）
  var FB_SCHEMA_V = 1;                   // 指板「目前狀態」的格式版本，要跟 fretboard-storage.js 的 LS_SCHEMA_V 一樣
  var KEYS = { fb: NS + 'current', chord: NS + 'chord-doc', chordSig: NS + 'chord-savedSig', chordPrev: NS + 'chord-prev', chordNew: NS + 'chord-new' };
  var SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  var FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  var FLATKEYS = [1, 3, 5, 8, 10];
  var STD = [4, 11, 7, 2, 9, 4];         // 指板的順序：第 1 弦 → 第 6 弦
  var STD_NAME = 'Standard　E A D G B E';
  var LET = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function store(s) { return s || root.localStorage; }
  function read(key, s) { try { var v = store(s).getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function write(key, val, s) { try { if (val === null || val === undefined) store(s).removeItem(key); else store(s).setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; } }

  // 指板的狀態 → 和弦編輯器要用的空弦音（和弦的順序：第 6 弦 → 第 1 弦）。
  function chordOpen(fb) {
    var pc = fb && fb.d && fb.d.tuningPc;
    return (Array.isArray(pc) && pc.length === 6 ? pc : STD).slice().reverse();
  }
  // 調弦標籤：第 6 弦到第 1 弦的音名（例如 E A D G B E、D A D G A D），拼法跟著指板。
  function tuningLetters(fb) { var n = spellingOf(fb) === 'flat' ? FLAT : SHARP; return chordOpen(fb).map(function (pc) { return n[pc]; }).join(' '); }
  function tuningName(fb) { return (fb && fb.d && fb.d.tuningName) || STD_NAME; }
  // 拼法跟著指板的調：指板強制升／降就照它，否則看主音（F、B♭、E♭、A♭、D♭ 用降記號）。
  function spellingOf(fb) {
    var d = fb && fb.d;
    if (!d) return 'sharp';
    if (d.acc === -1) return 'flat';
    if (d.acc === 1) return 'sharp';
    return FLATKEYS.indexOf(d.keyPc) >= 0 ? 'flat' : 'sharp';
  }

  // 換拼法：只換有升降記號的音（C♯ ↔ D♭），本位音和 E♯ 這類換了會變本位的不動。
  function respellNote(n, sp) {
    var m = /^([A-G])([♯♭])$/.exec(n);
    if (!m) return n;
    var t = (sp === 'flat' ? FLAT : SHARP)[(LET[m[1]] + (m[2] === '♯' ? 1 : -1) + 12) % 12];
    return t.length === 1 ? n : t;
  }
  function respellName(name, sp) {
    var m = /^([A-G][♯♭]?)(.*)$/.exec(String(name || ''));
    if (!m) return String(name || '');
    var rest = m[2], bass = null, i = rest.lastIndexOf('/');
    if (i >= 0 && /^[A-G][♯♭]?$/.test(rest.slice(i + 1))) { bass = rest.slice(i + 1); rest = rest.slice(0, i); }
    return respellNote(m[1], sp) + rest + (bass !== null ? '/' + respellNote(bass, sp) : '');
  }
  function respellDoc(doc, sp) {
    if (!doc || doc.spelling === sp) return doc;
    var out = Object.assign({}, doc, { spelling: sp });
    out.chords = (doc.chords || []).map(function (c) { return Object.assign({}, c, { name: respellName(c.name, sp) }); });
    return out;
  }

  // 用來判斷「存過檔之後有沒有再改」。
  function sig(o) { var t = JSON.stringify(o); var h = 5381; for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h.toString(36) + t.length; }

  function fileName(title) {
    var t = String(title || '').replace(/[\\/:*?"<>|]/g, '').trim();
    return (t || 'fretboard') + '.fretboard.json';
  }

  // 專案檔 = 指板的部分（fb）＋和弦本（chords）。
  function buildProject(fb, chords, now) {
    fb = fb || {};
    return {
      app: 'singing-fretboard', v: PROJ_V, savedAt: now || new Date().toISOString(),
      d: fb.d || null, colorNames: fb.colorNames, slotA: fb.slotA || null, slotB: fb.slotB || null,
      active: fb.active || null, legendOrder: fb.legendOrder, shapes: fb.shapes,
      chords: chords || null
    };
  }

  function userError(m) { var e = new Error(m); e.userMsg = m; return e; }
  // 打開任何一種專案檔。全部檢查通過才回傳，不會套用一半。
  // 回傳 { fb, fbMode: 'replace'|'keep', chords, chordsMode: 'replace'|'keep' }
  function parseAny(text) {
    var o;
    try { o = JSON.parse(text); } catch (e) { throw userError('這份檔案讀不進來，請確認是專案檔（.json）。'); }
    if (o && o.app === 'singing-chord') throw userError('這是舊版和弦編輯器的檔案，目前版本無法開啟。');
    if (!o || o.app !== 'singing-fretboard') throw userError('這份檔案不是弦吟指板的專案檔。');
    if (typeof o.v !== 'number' || o.v < 1) throw userError('這份專案檔是舊版格式，目前版本無法開啟。');
    if (o.v > PROJ_V) throw userError('這份專案檔來自較新的版本，請更新 app 後再開啟。');
    if (o.v === 1) {
      if (!o.d) throw userError('這份檔案不是弦吟指板的專案檔。');
      return { fb: fbPart(o), fbMode: 'replace', chords: null, chordsMode: 'replace' }; // 舊的只有指板：和弦本清空
    }
    if (o.chords && !Array.isArray(o.chords.chords)) throw userError('這份檔案內容不完整，讀不進來。');
    return { fb: o.d ? fbPart(o) : null, fbMode: o.d ? 'replace' : 'keep', chords: o.chords || null, chordsMode: 'replace' };
  }
  function fbPart(o) {
    return { d: o.d, colorNames: o.colorNames, slotA: o.slotA || null, slotB: o.slotB || null, active: o.active || null, legendOrder: o.legendOrder, shapes: o.shapes };
  }

  // 瀏覽器裡的指板狀態（格式跟指板自動存檔一樣）。
  function readFb(s) { var v = read(KEYS.fb, s); return v && v.v === FB_SCHEMA_V && v.d ? v : null; }
  function writeFb(fb, s) { return write(KEYS.fb, fb ? Object.assign({ v: FB_SCHEMA_V }, fbPart(fb)) : null, s); }
  function readChords(s) { var v = read(KEYS.chord, s); return v && Array.isArray(v.chords) ? v : null; }
  // 換掉和弦本時，把原本的留一份，和弦編輯器打開時可以按「上一步」找回。
  function replaceChords(doc, s) {
    var cur = read(KEYS.chord, s);
    if (cur) write(KEYS.chordPrev, cur, s);
    return write(KEYS.chord, doc || null, s);
  }
  function markChordsSaved(doc, s) { return write(KEYS.chordSig, doc ? sig(doc) : null, s); }

  // 框選轉和弦：框了幾格（有框到空弦那欄時不算空弦）。
  function selFretCount(sel) { return sel ? (sel.f0 === 0 ? sel.f1 : sel.f1 - sel.f0 + 1) : 0; }
  // 指板上框選的範圍 → 一個和弦圖。notes 的 key 是「弦-格」，指板弦的順序是第 1 弦 → 第 6 弦，和弦是第 6 弦 → 第 1 弦。
  // 同一條弦有好幾個音取最低格；沒按格的弦：空弦有音標 ○、沒有標 ×（有框到空弦那欄時只看框到的弦）。格數不是 3～5 回傳 null。
  // skip：不要加入的圓點顏色（指板的顏色編號，例如 空白 0、淡 7），當成那格沒有圓點。
  function selToChord(notes, sel, id, skip) {
    var n = selFretCount(sel);
    if (n < 3 || n > 5) return null;
    var src = notes || {};
    notes = {};
    Object.keys(src).forEach(function (k) { if (!skip || skip.indexOf(src[k]) < 0) notes[k] = src[k]; });
    var sf = sel.f0 === 0 ? 1 : sel.f0, marks = {}, list = [];
    for (var i = 0; i < 6; i++) {
      var s = 5 - i, rowIn = i >= sel.s0 && i <= sel.s1, low = -1;
      if (rowIn) for (var f = sf; f <= sel.f1; f++) if ((i + '-' + f) in notes) { low = f; break; }
      if (low > 0) list.push({ s: s, f: low });
      else marks[s] = ((i + '-0') in notes && (sel.f0 > 0 || rowIn)) ? 'o' : 'x';
    }
    list.sort(function (a, b) { return a.f - b.f || a.s - b.s; });
    var base = list.length ? list[0].f : sf, k = 1;
    var dots = list.map(function (d) { var fg = Math.min(4, Math.max(k, d.f - base + 1)); k = fg + 1; return { s: d.s, f: d.f, finger: String(fg) }; });
    return { id: id || ('c' + Date.now().toString(36) + 'fb'), name: '', note: '', startFret: sf, frets: n, dots: dots, barres: [], marks: marks, dotMode: null, sideMode: null };
  }
  function isBlankChord(c) { return !c.name && !c.note && !(c.dots || []).length && !(c.barres || []).length && !Object.keys(c.marks || {}).length; }
  // 把指板轉好的和弦加到和弦本最後面（和弦本只有一張空白和弦時直接取代它），並記下是哪一個，和弦編輯器打開時選取它。
  function addChord(chord, sp, s) {
    var doc = readChords(s) || { title: '', dotMode: 'finger', sideMode: 'note', spelling: sp || 'sharp', defFrets: 4, chords: [] };
    var keep = doc.chords.length === 1 && isBlankChord(doc.chords[0]) ? [] : doc.chords;
    var out = Object.assign({}, doc, { chords: keep.concat([chord]) });
    var ok = replaceChords(out, s);
    write(KEYS.chordNew, chord.id, s);
    return ok ? out : null;
  }

  root.HYLINK = {
    NS: NS, PROJ_V: PROJ_V, FB_SCHEMA_V: FB_SCHEMA_V, KEYS: KEYS, STD: STD, STD_NAME: STD_NAME,
    chordOpen: chordOpen, tuningLetters: tuningLetters, tuningName: tuningName, spellingOf: spellingOf,
    respellNote: respellNote, respellName: respellName, respellDoc: respellDoc, sig: sig, fileName: fileName,
    buildProject: buildProject, parseAny: parseAny, fbPart: fbPart,
    read: read, write: write, readFb: readFb, writeFb: writeFb, readChords: readChords, replaceChords: replaceChords, markChordsSaved: markChordsSaved,
    selFretCount: selFretCount, selToChord: selToChord, addChord: addChord
  };
})(typeof window !== 'undefined' ? window : globalThis);
