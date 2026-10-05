// 和弦編輯器的音樂計算（和弦名稱、級數、圖面資料、格位移動、換行、分頁）。只放純計算，不碰畫面和存檔。
(function (root) {
  const SHARP = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
  const FLAT = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
  const OPEN = [4, 9, 2, 7, 11, 4];
  const LETTER = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const QALIAS = { '': '', maj: '', M: '', m: 'm', min: 'm', '-': 'm', dim: 'dim', '°': 'dim', o: 'dim', aug: 'aug', '+': 'aug',
    sus: 'sus4', sus2: 'sus2', sus4: 'sus4', '7': '7', maj7: 'maj7', M7: 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7', m7: 'm7', min7: 'm7', '-7': 'm7',
    m7b5: 'm7b5', 'ø': 'm7b5', 'ø7': 'm7b5', dim7: 'dim7', '°7': 'dim7', o7: 'dim7', '7sus4': '7sus4', '7sus': '7sus4', '6': '6', m6: 'm6',
    add9: 'add9', madd9: 'madd9', '9': '9', maj9: 'maj9', M9: 'maj9', m9: 'm9', '11': '11', m11: 'm11', '13': '13', maj13: 'maj13', M13: 'maj13', m13: 'm13',
    '7b9': '7b9', '7#9': '7#9', '7b5': '7b5', '7#5': '7#5' };
  const QDISP = { '': '', m: 'm', dim: 'dim', aug: 'aug', sus2: 'sus2', sus4: 'sus4', '7': '7', maj7: 'maj7', m7: 'm7', m7b5: 'm7♭5', dim7: 'dim7', '7sus4': '7sus4', '6': '6', m6: 'm6', add9: 'add9', madd9: 'madd9', '9': '9', maj9: 'maj9', m9: 'm9', '11': '11', m11: 'm11', '13': '13', maj13: 'maj13', m13: 'm13', '7b9': '7♭9', '7#9': '7♯9', '7b5': '7♭5', '7#5': '7♯5' };
  const DEG = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
  const FRET_OPTS = [3, 4, 5];
  const MAX_START = 15;
  const normF = f => FRET_OPTS.includes(f) ? f : f < 4 ? 3 : f > 4 ? 5 : 4;

  function segsOf(t) {
    const out = []; let buf = '';
    for (const ch of String(t || '')) {
      if (ch === '♯' || ch === '♭') { if (buf) out.push({ t: buf, sup: false, txt: true }); buf = ''; out.push({ t: ch, sup: true, txt: false }); }
      else buf += ch;
    }
    if (buf) out.push({ t: buf, sup: false, txt: true });
    return out;
  }
  function fixAcc(v) {
    return String(v).replace(/^([A-Ga-g])#/, '$1♯').replace(/^([A-Ga-g])b/, '$1♭')
      .replace(/\/([A-Ga-g])#/, '/$1♯').replace(/\/([A-Ga-g])b/, '/$1♭')
      .replace(/b(?=\d)/g, '♭').replace(/#(?=\d)/g, '♯');
  }
  // 斜線和弦：斜線後面是一個音名（例如 D/F♯）才算，C6/9 這類不算。
  function splitSlash(raw) {
    const s = String(raw || '').trim(), i = s.lastIndexOf('/');
    if (i > 0) { const b = s.slice(i + 1).trim(); if (/^[A-Ga-g][#b♯♭]?$/.test(b)) return { main: s.slice(0, i).trim(), bass: b }; }
    return { main: s, bass: '' };
  }
  function pcOf(letter, acc) { return (LETTER[letter.toUpperCase()] + (acc === '#' || acc === '♯' ? 1 : acc === 'b' || acc === '♭' ? -1 : 0) + 12) % 12; }
  function parseName(raw) {
    const sp = splitSlash(raw);
    const s = sp.main.replace(/♯/g, '#').replace(/♭/g, 'b');
    const m = s.match(/^([A-Ga-g])([#b]?)(.*)$/);
    if (!m) return null;
    const pc = pcOf(m[1], m[2]);
    const qr = m[3].replace(/\s+/g, '');
    let q = Object.prototype.hasOwnProperty.call(QALIAS, qr) ? QALIAS[qr] : null;
    if (q === null && qr.length > 2 && Object.prototype.hasOwnProperty.call(QALIAS, qr.toLowerCase())) q = QALIAS[qr.toLowerCase()];
    const bass = sp.bass ? pcOf(sp.bass[0], sp.bass.slice(1)) : null;
    return { pc, q, rest: m[3], bass };
  }
  function nameParts(raw) {
    const sp = splitSlash(raw), s = sp.main;
    const m = s.match(/^([A-Ga-g])([#b♯♭]?)(.*)$/);
    if (!m) return { l: String(raw || '').trim(), acc: '', segs: [] };
    const acc = m[2] === '#' || m[2] === '♯' ? '♯' : m[2] === 'b' || m[2] === '♭' ? '♭' : '';
    const p = parseName(s);
    const q = p && p.q !== null ? QDISP[p.q] : fixAcc('x' + m[3]).slice(1);
    const segs = [];
    let buf = '', sub = false;
    const flush = () => { if (buf) segs.push({ t: buf, sup: false, txt: sub, big: !sub, bacc: false }); buf = ''; };
    for (const ch of q) {
      if (ch === '♯' || ch === '♭') { flush(); sub = true; segs.push({ t: ch, sup: true, txt: false, big: false, bacc: false }); }
      else { if (!sub && !/[a-zA-Z]/.test(ch)) { flush(); sub = true; } buf += ch; }
    }
    flush();
    if (sp.bass) {
      segs.push({ t: '/' + sp.bass[0].toUpperCase(), sup: false, txt: false, big: true, bacc: false });
      const ba = sp.bass.slice(1);
      if (ba) segs.push({ t: ba === '#' || ba === '♯' ? '♯' : '♭', sup: false, txt: false, big: false, bacc: true });
    }
    return { l: m[1].toUpperCase(), acc, segs };
  }
  function degLabel(iv, q) {
    if (q == null) return DEG[iv];
    if (iv === 2 && /9|11|13/.test(q)) return '9';
    if (iv === 1 && q === '7b9') return '♭9';
    if (iv === 3 && q === '7#9') return '♯9';
    if (iv === 5 && /11/.test(q)) return '11';
    if (iv === 9 && /13/.test(q)) return '13';
    if (iv === 9 && q === 'dim7') return '♭♭7';
    if ((iv === 8 && q === 'aug') || (iv === 8 && q === '7#5')) return '♯5';
    return DEG[iv];
  }
  function hasFretted(c, s) { return c.dots.some(d => d.s === s) || c.barres.some(b => s >= b.from && s <= b.to); }
  function hasHigher(c, s, f) { return c.dots.some(d => d.s === s && d.f > f) || c.barres.some(b => s >= b.from && s <= b.to && b.f > f); }
  function labShown(c, s, f, dot, barre) {
    if (dot) return dot.lab !== undefined && dot.lab !== null ? !!dot.lab : !hasHigher(c, s, f);
    const ov = barre && barre.lab ? barre.lab[s] : undefined;
    return ov !== undefined && ov !== null ? !!ov : !hasHigher(c, s, f);
  }
  // 圖面資料：只算目前看得到的格位。open 是空弦音（沒給就用標準調弦）（看不到的圓點不影響空弦和右側標示）。
  function diagramModel(c, doc, open) {
    const O = open || OPEN;
    const F = normF(c.frets), sf = c.startFret;
    const names = doc.spelling === 'flat' ? FLAT : SHARP;
    const p = parseName(c.name);
    const dotMode = c.dotMode || doc.dotMode || 'finger';
    const sideMode = c.sideMode || doc.sideMode || 'note';
    const rootOn = (c.rootMode || doc.rootMode || 'on') !== 'off'; // 顯示根音：關掉時根音跟一般圓點同色
    const vis = f => f >= sf && f < sf + F;
    const vc = { ...c, dots: c.dots.filter(d => vis(d.f)), barres: c.barres.filter(b => vis(b.f)) };
    const isPc = (s, f) => !!p && (O[s] + f) % 12 === p.pc;
    const isRoot = (s, f) => rootOn && isPc(s, f);
    const labText = (s, f) => { const pc = (O[s] + f) % 12; return sideMode === 'note' ? names[pc] : sideMode === 'degree' && p ? degLabel((pc - p.pc + 12) % 12, p.q) : ''; };
    const dots = vc.dots.map(d => ({ s: d.s, col: d.f - sf, root: isRoot(d.s, d.f), t: dotMode === 'finger' ? (d.finger || '') : '' }));
    const barres = vc.barres.map(b => {
      const roots = [];
      for (let s = b.from; s <= b.to; s++) if (isRoot(s, b.f)) roots.push(s);
      return { col: b.f - sf, from: b.from, to: b.to, t: dotMode === 'finger' ? (b.finger || '') : '', roots };
    });
    const side = [[], [], [], [], [], []];
    if (sideMode !== 'none' && (c.name || '').trim()) {
      vc.dots.forEach(d => { if (labShown(vc, d.s, d.f, d)) side[d.s].push({ f: d.f, t: labText(d.s, d.f), root: isRoot(d.s, d.f) }); });
      vc.barres.forEach(b => { for (let s = b.from; s <= b.to; s++) if (labShown(vc, s, b.f, null, b)) side[s].push({ f: b.f, t: labText(s, b.f), root: isRoot(s, b.f) }); });
      for (let s = 0; s < 6; s++) if (c.marks[s] !== 'x' && !hasFretted(vc, s)) side[s].push({ f: 0, t: labText(s, 0), root: isRoot(s, 0) });
      side.forEach(a => a.sort((x, y) => x.f - y.f));
    }
    const marks = [];
    for (let s = 0; s < 6; s++) marks.push({ s, type: c.marks[s] || '' });
    // 格數標籤：標在根音那格旁、寫根音的格數（以最低音那條弦上的根音為準）；沒有名稱或看不到根音時標第一格。
    let rf = sf;
    if (p && sf > 1) { const sd = soundingFrets(vc); for (let s = 0; s < 6; s++) if (sd[s] >= sf && isPc(s, sd[s])) { rf = sd[s]; break; } }
    return { F, sf, dots, barres, marks, side, frLabel: sf > 1 ? rf + 'fr' : '', frCol: rf - sf };
  }
  // 起始格移動時，圓點和封閉跟著一起移（像移調夾），空弦 O／× 不動。超出範圍回傳 null。
  function shiftChord(c, delta) {
    const sf = c.startFret + delta;
    if (sf < 1 || sf > MAX_START) return null;
    const out = JSON.parse(JSON.stringify(c));
    out.startFret = sf;
    out.dots = out.dots.map(d => ({ ...d, f: d.f + delta })).filter(d => d.f >= 1);
    out.barres = out.barres.map(b => ({ ...b, f: b.f + delta })).filter(b => b.f >= 1);
    return out;
  }
  // 自動換行：英文、數字整個字不拆開，中文一個字一個字排；標點不放在行首。measure(text) 回傳寬度。
  const NO_START = /^[，。、；：？！）」』】〕,.;:!?)\]]/;
  function wrapLines(text, measure, maxW) {
    const src = String(text || '').trim();
    if (!src) return [];
    const toks = src.match(/[A-Za-z0-9♯♭#'’.\-]+|\s+|./gu) || [];
    const lines = [];
    let cur = '';
    const push = () => { lines.push(cur.replace(/\s+$/, '')); cur = ''; };
    for (const tk of toks) {
      if (/^\s+$/.test(tk)) { if (cur) cur += ' '; continue; }
      if (measure(cur + tk) <= maxW || !cur) {
        if (!cur && measure(tk) > maxW && tk.length > 1) {
          for (const ch of tk) { if (cur && measure(cur + ch) > maxW) push(); cur += ch; }
        } else cur += tk;
      } else if (NO_START.test(tk)) cur += tk;
      else { push(); cur = tk; }
    }
    if (cur) push();
    return lines.filter(l => l !== '');
  }
  // PDF 分頁：rowHs 是每一排的高度，第一頁可用高度 firstCap（扣掉標題），之後每頁 nextCap。回傳每頁有哪幾排。
  function paginate(rowHs, firstCap, nextCap, gap) {
    const pages = [];
    let cur = [], used = 0, cap = firstCap;
    rowHs.forEach((h, i) => {
      const need = cur.length ? gap + h : h;
      if (cur.length && used + need > cap) { pages.push(cur); cur = []; used = 0; cap = nextCap; }
      used += cur.length ? gap + h : h;
      cur.push(i);
    });
    if (cur.length || !pages.length) pages.push(cur);
    return pages;
  }

  // 和弦辨識：由按格反推和弦名稱。主音拼法用常用混合（C♯、E♭、F♯、A♭、B♭）。
  const RN = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const RLBL = { '1': 0, '♭9': 1, '2': 2, '9': 2, '♯9': 3, '♭3': 3, '3': 4, '4': 5, '11': 5, '♯11': 6, '♭5': 6, '5': 7, '♯5': 8, '6': 9, '13': 9, '♭♭7': 9, '♭7': 10, '7': 11 };
  // 減和弦一族習慣寫升記號（G♯dim），小和弦 G♯m 比 A♭m 常見。
  const rootName = (r, q) => /dim|♭5/.test(q) ? SHARP[r] : r === 8 && /^m(?!aj)/.test(q) ? 'G♯' : RN[r];
  // 斜線低音跟著主音的拼法：主音是升記號調就寫升，降記號調就寫降。
  const bassName = (b, rn) => /♯/.test(rn) || /^[GDAEB]$/.test(rn) ? SHARP[b] : /♭/.test(rn) || rn === 'F' ? FLAT[b] : RN[b];
  // 括號裡的音可以省略（6、m6 的 5 不能省，不然會跟轉位三和弦搞混）。
  const RTPL = [['', '1 3 (5)'], ['m', '1 ♭3 (5)'], ['5', '1 5'], ['dim', '1 ♭3 ♭5'], ['aug', '1 3 ♯5'], ['sus2', '1 2 5'], ['sus4', '1 4 5'],
    ['7', '1 3 (5) ♭7'], ['maj7', '1 3 (5) 7'], ['m7', '1 ♭3 (5) ♭7'], ['m7♭5', '1 ♭3 ♭5 ♭7'], ['dim7', '1 ♭3 ♭5 ♭♭7'], ['7sus4', '1 4 (5) ♭7'],
    ['6', '1 3 5 6'], ['m6', '1 ♭3 5 6'], ['add9', '1 3 (5) 9'], ['madd9', '1 ♭3 (5) 9'], ['6/9', '1 3 (5) 6 9'], ['mmaj7', '1 ♭3 (5) 7'],
    ['9', '1 3 (5) ♭7 9'], ['maj9', '1 3 (5) 7 9'], ['m9', '1 ♭3 (5) ♭7 9'], ['7♭9', '1 3 (5) ♭7 ♭9'], ['7♯9', '1 3 (5) ♭7 ♯9'],
    ['7♭5', '1 3 ♭5 ♭7'], ['7♯5', '1 3 ♯5 ♭7'], ['11', '1 (5) ♭7 (9) 11'], ['m11', '1 ♭3 (5) ♭7 (9) 11'], ['13', '1 3 (5) ♭7 (9) 13'],
    ['maj13', '1 3 (5) 7 (9) 13'], ['maj♯11', '1 3 (5) 7 ♯11']
  ].map(([q, s]) => ({ q, items: s.split(' ').map(t => { const opt = t[0] === '('; const l = opt ? t.slice(1, -1) : t; return { l, iv: RLBL[l], opt }; }) }));
  // 分數越小越前面。省略一個音扣 0.25、和弦越複雜扣越多、斜線和弦扣 1.2（優先原位和弦）。
  const R_OMIT = 0.25, R_EXT = 0.15, R_SLASH = 1.2;
  // frets：六條弦（第 6 弦到第 1 弦）的格數，-1 表示不彈，0 表示空弦。
  // open：六條空弦音（第 6 弦到第 1 弦），沒給就用標準調弦。
  function recognize(frets, open) {
    const O = open || OPEN;
    const snd = frets.map((f, s) => f == null || f < 0 ? null : (O[s] + f) % 12);
    const pcs = [...new Set(snd.filter(p => p !== null))];
    if (pcs.length < 2) return [];
    const bass = snd.find(p => p !== null);
    const out = [], seen = new Set();
    pcs.forEach(r => {
      const ivs = pcs.map(p => (p - r + 12) % 12);
      RTPL.forEach(t => {
        const tiv = t.items.map(i => i.iv);
        if (!ivs.every(v => tiv.includes(v))) return;
        const miss = t.items.filter(i => !ivs.includes(i.iv));
        if (miss.some(i => !i.opt)) return;
        const slash = bass !== r;
        const rn = rootName(r, t.q), name = rn + t.q + (slash ? '/' + bassName(bass, rn) : '');
        if (seen.has(name)) return;
        seen.add(name);
        out.push({ name, score: miss.length * R_OMIT + (t.items.length - 3) * R_EXT + (slash ? R_SLASH : 0), omit: miss.map(i => i.l) });
      });
    });
    return out.sort((a, b) => a.score - b.score);
  }
  // 編輯器裡的和弦 → 六條弦實際彈的格數。按了格就用最高的那格；沒按格時標 O 才算空弦，其他都算不彈。
  function soundingFrets(c) {
    const out = [];
    for (let s = 0; s < 6; s++) {
      let f = -1;
      (c.dots || []).forEach(d => { if (d.s === s && d.f > f) f = d.f; });
      (c.barres || []).forEach(b => { if (s >= b.from && s <= b.to && b.f > f) f = b.f; });
      if (f < 0 && c.marks && c.marks[s] === 'o') f = 0;
      out.push(f);
    }
    return out;
  }
  // 右側面板用：第一建議＋最多 n 個其他可能。
  function suggestNames(c, n, open) {
    return recognize(soundingFrets(c), open).slice(0, 1 + (n == null ? 2 : n)).map(r => r.name);
  }

  // 查和弦按法（v2.4.2）：和弦辨識倒過來。名稱 → 同一份 RTPL 公式 → 在標準調弦指板上找按得到的組合。
  const LQ = { '': '', maj: '', M: '', m: 'm', min: 'm', '-': 'm', '5': '5', dim: 'dim', '°': 'dim', o: 'dim', aug: 'aug', '+': 'aug',
    sus2: 'sus2', sus4: 'sus4', sus: 'sus4', '7': '7', maj7: 'maj7', M7: 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7', m7: 'm7', min7: 'm7', '-7': 'm7',
    'm7♭5': 'm7♭5', 'ø': 'm7♭5', 'ø7': 'm7♭5', 'm7-5': 'm7♭5', dim7: 'dim7', '°7': 'dim7', o7: 'dim7', '7sus4': '7sus4', '7sus': '7sus4',
    '6': '6', m6: 'm6', add9: 'add9', add2: 'add9', madd9: 'madd9', madd2: 'madd9', '6/9': '6/9', '69': '6/9', mmaj7: 'mmaj7', mM7: 'mmaj7', 'm(maj7)': 'mmaj7', minmaj7: 'mmaj7',
    '9': '9', maj9: 'maj9', M9: 'maj9', m9: 'm9', '7♭9': '7♭9', '7♯9': '7♯9', '7♭5': '7♭5', '7♯5': '7♯5', '7+5': '7♯5',
    '11': '11', m11: 'm11', '13': '13', maj13: 'maj13', M13: 'maj13', 'maj♯11': 'maj♯11', 'maj7♯11': 'maj♯11' };
  const hasK = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  // 名稱 → { root, bass, tpl, key }；看不懂回傳 null。
  function chordSpec(raw) {
    const sp = splitSlash(raw), m = sp.main.trim().match(/^([A-Ga-g])([#b♯♭]?)(.*)$/);
    if (!m) return null;
    const qr = m[3].replace(/\s+/g, '').replace(/#/g, '♯').replace(/b/g, '♭');
    const look = k => hasK(LQ, k) ? LQ[k] : k.length > 2 && hasK(LQ, k.toLowerCase()) ? LQ[k.toLowerCase()] : null;
    // 先照原樣找（C+＝增、C-＝小、C-7＝m7）；找不到再把 + 當 ♯、- 當 ♭（C7+5＝C7♯5、C7-9＝C7♭9）。
    let q = look(qr);
    if (q === null) q = look(qr.replace(/\+/g, '♯').replace(/-/g, '♭'));
    if (q === null) return null;
    const tpl = RTPL.find(t => t.q === q);
    if (!tpl) return null;
    const root = pcOf(m[1], m[2]), bass = sp.bass ? pcOf(sp.bass[0], sp.bass.slice(1)) : root;
    return { root, bass, tpl, key: root + '|' + q + '|' + bass };
  }
  // 封閉：最低那格橫跨 2 條弦以上，中間的弦都有按格（不是空弦、不是不彈）。
  function barreOf(fr) {
    const fs = fr.filter(f => f > 0);
    if (!fs.length) return null;
    const f0 = Math.min(...fs), on = [];
    fr.forEach((f, s) => { if (f === f0) on.push(s); });
    if (on.length < 2) return null;
    const from = on[0], to = on[on.length - 1];
    for (let s = from; s <= to; s++) if (!(fr[s] >= f0)) return null;
    return { f: f0, from, to };
  }
  // 規則：最低音＝根音（斜線和弦＝斜線後的音）、至少 4 弦發聲、中間不夾不彈弦、必要音都要有、
  // 按格最多跨 4 格（五格圖放得下）、最多 4 指（封閉算 1 指）。
  // 排序（2026-09-28）：① 0～4 格內有空弦的開放和弦（最多 3 個）→ ② 5 格內的封閉和弦（最多 3 個）→ ③ 5 格以後的 A 型、E 型封閉。
  // 斜線和弦只找 ①。lib：和弦庫清單，同名的按法排在所屬那一組最前面。回傳 null＝看不懂名稱；[]＝找不到。
  const LOOKUP_MAX = 8, OPEN_MAX = 3, BARRE5_MAX = 3;
  // A 型、E 型樣板：相對根音那格的位移（-1＝不彈）。E 型根音在第 6 弦，A 型根音在第 5 弦。
  const SHAPE_E = { '': [0, 2, 2, 1, 0, 0], m: [0, 2, 2, 0, 0, 0], '7': [0, 2, 0, 1, 0, 0], m7: [0, 2, 0, 0, 0, 0], maj7: [0, 2, 1, 1, 0, 0],
    sus4: [0, 2, 2, 2, 0, 0], '7sus4': [0, 2, 0, 2, 0, 0], m6: [0, 2, 2, 0, 2, 0], '9': [0, 2, 0, 1, 0, 2] };
  const SHAPE_A = { '': [-1, 0, 2, 2, 2, 0], m: [-1, 0, 2, 2, 1, 0], '7': [-1, 0, 2, 0, 2, 0], m7: [-1, 0, 2, 0, 1, 0], maj7: [-1, 0, 2, 1, 2, 0],
    sus4: [-1, 0, 2, 2, 3, 0], sus2: [-1, 0, 2, 2, 0, 0], '7sus4': [-1, 0, 2, 0, 3, 0], 'm7♭5': [-1, 0, 1, 0, 1, -1] };
  // 非開放延伸和弦的可移動按法（2026-09-28 使用者在「查和弦按法 篩選」頁挑過）：相對最低按格的位移，-1＝不彈，最低發聲弦＝根音。
  // 有這個表的和弦種類，封閉按法只用這張表（不再自動找、不用 A／E 型樣板），而且可以中間夾不彈弦。
  // 使用者手動設定的特例（吉他上按不出完整組成音，交給把位或編曲補）：名稱照查詢的名稱，不看辨識；結果帶 `special: true`，自動測試跳過。
  const MOVE_SP = { add9: ['-1,0,2,2,0,0'], maj9: ['-1,-1,0,2,2,0'], 'maj♯11': ['-1,1,0,0,1,0'], '9': ['1,-1,1,0,1,-1', '-1,-1,0,2,1,0'] };
  const MOVE = {
    add9: [[-1, 0, 2, 2, 0, 0]],
    maj7: [[-1, 0, 2, 1, 2, 0], [0, -1, 1, 1, 0, -1], [-1, -1, 0, 2, 2, 2]],
    maj9: [[-1, 1, 0, 2, 1, -1], [-1, -1, 0, 2, 2, 0]],
    maj13: [[0, -1, 1, 1, 2, -1], [-1, 0, -1, 1, 2, 2], [1, 0, 0, 0, 1, 0]],
    'maj♯11': [[1, -1, 2, 2, 0, -1], [-1, 1, 0, 0, 1, 0]],
    mmaj7: [[-1, 0, 2, 1, 1, 0], [0, -1, 1, 0, 0, 0]],
    m7: [[-1, 0, 2, 0, 1, 0], [0, 2, 0, 0, 0, 0], [0, -1, 0, 0, 0, -1]],
    m9: [[0, 2, 0, 0, 0, 2], [-1, 2, 0, 2, 2, -1]],
    m11: [[-1, 2, 0, 2, 2, 0], [2, -1, 2, 2, 0, -1]],
    'm7♭5': [[1, -1, 1, 1, 0, -1], [-1, 0, 1, 0, 1, -1], [-1, -1, 0, 1, 1, 1]],
    dim7: [[1, -1, 0, 1, 0, -1], [-1, 1, 2, 0, 2, -1], [-1, -1, 0, 1, 0, 1]],
    '7': [[-1, 0, 2, 0, 2, 0], [0, 2, 0, 1, 0, 0], [-1, -1, 0, 2, 1, 2]],
    '7sus4': [[0, 2, 0, 2, 0, 0], [-1, 0, 2, 0, 3, 0], [-1, -1, 0, 2, 1, 3]],
    '9': [[-1, 1, 0, 1, 1, -1], [1, -1, 1, 0, 1, -1], [-1, -1, 0, 2, 1, 0]],
    '11': [[-1, 0, 0, 0, 0, 0], [2, -1, 2, 1, 0, -1]],
    '13': [[-1, 0, 2, 0, 2, 2], [0, -1, 0, 1, 2, -1]],
    '7♭9': [[-1, 1, 0, 1, 0, -1], [0, -1, 0, 1, 0, 1]],
    '7♯9': [[-1, 1, 0, 1, 2, -1]],
    '7♭5': [[1, -1, 1, 2, 0, -1], [-1, 0, 1, 0, 2, -1]],
    '7♯5': [[0, -1, 0, 1, 1, -1], [-1, 0, -1, 0, 2, 1]]
  };
  const TRI_IV = [0, 3, 4, 6, 7, 8];
  // 使用者逐一指定的按法（2026-09-28）：del＝拿掉、add＝加在最前面、only＝整組換掉。寫法 6 弦→1 弦，x＝不彈。結果帶 lib、special（自動規則測試跳過）。
  const FIX = {
    Eadd9: { del: ['0 2 2 1 0 2'], add: ['0 2 4 1 0 0'] },
    Aadd9: { only: ['x 0 2 2 0 0', '5 7 7 6 0 0', 'x 0 7 6 0 0'] },
    Fadd9: { del: ['1 0 3 0 1 1'], add: ['1 0 3 0 1 x'] },
    Fmaj9: { del: ['1 0 2 0 1 1'] },
    Fdim: { del: ['x x 3 1 0 1'], add: ['x x 3 1 0 x'] },
    Cmaj7: { only: ['x 3 2 0 0 0', 'x 3 5 4 5 3', '8 x 9 9 8 x', 'x x 10 12 12 12'] },
    Gm: { del: ['3 1 0 0 3 3'] },
    Em7: { only: ['0 2 0 0 0 0', '0 2 2 0 3 0', '0 2 2 0 3 3', 'x 7 9 7 8 7'] },
    G: { only: ['3 2 0 0 0 3', '3 2 0 0 3 3', '3 5 5 4 3 3', 'x 10 12 12 12 10'] },
    Am: { only: ['x 0 2 2 1 0', '5 7 7 5 5 5'] },
    Bm: { only: ['x 2 4 4 3 2', '7 9 9 7 7 7'] },
    Bm7: { only: ['x 2 0 2 3 x', 'x 2 4 2 3 2', '7 9 7 7 7 7', '7 x 7 7 7 x'] },
    'F♯m': { only: ['2 4 4 2 2 2', 'x 9 11 11 10 9'] },
    'G♯m': { only: ['4 2 1 1 4 x', '4 6 6 4 4 4', 'x 11 13 13 12 11'] },
    Amaj9: { add: ['x 0 2 1 0 0'] },
    Gadd9: { only: ['3 x 0 2 0 3', '3 x 0 2 3 x', 'x 10 12 12 10 10'] },
    Fmaj13: { only: ['x x 3 2 3 0', '1 0 0 0 1 0', '1 x 0 2 1 0', '1 x 2 2 3 x', 'x 8 x 9 10 10'] },
    'E/G♯': { only: ['4 x 2 1 0 0', '4 x 2 4 0 0'] },
    'G/B': { only: ['x 2 0 0 3 x', 'x 2 0 0 3 3'] },
    'Am7/G': { only: ['3 x 2 0 1 0', '3 x 2 0 1 3'] },
    'B♭maj9': { del: ['x 1 0 2 1 1'], add: ['x 1 0 2 1 x'] },
    'E♭': { del: ['x x 1 0 4 3'], add: ['x x 1 3 4 3'] },
    'E♭maj7': { del: ['x x 1 0 3 3'], add: ['x x 1 3 3 3'] },
    'E♭maj9': { del: ['x x 1 0 3 1'], add: ['x x 1 3 3 1'] }
  };
  // 開放和弦確認表（2026-10-01）：使用者逐一刪／加的開放按法，疊在 FIX 之後。
  const OPEN_FIX = {"E":{"del":["0 2 2 4 0 4","0 2 2 1 0 4"],"add":[]},"A♯":{"del":["x 1 0 3 3 1"],"add":[]},"B":{"del":["x 2 1 4 0 2"],"add":[]},"Cm":{"del":["x 3 1 0 1 3","x 3 1 0 4 3"],"add":["x 3 1 0 1 x","x 3 x 0 4 3"]},"C♯m":{"del":["x 4 2 1 2 0"],"add":[]},"Em":{"del":["0 2 2 4 0 3"],"add":[]},"Gm":{"del":["3 1 0 3 3 x"],"add":[]},"C♯7":{"del":["x 4 3 1 0 1","x 4 3 1 0 4"],"add":[]},"D♯7":{"del":["x x 1 0 2 3"],"add":[]},"F7":{"del":["1 0 1 2 4 x","1 0 3 2 4 x"],"add":[]},"F♯7":{"del":["2 4 2 3 2 0","2 4 4 3 2 0"],"add":[]},"G7":{"del":["3 2 3 0 3 x"],"add":[]},"A♯7":{"del":["x 1 0 1 3 1","x 1 0 1 3 4","x 1 0 3 3 4"],"add":[]},"C♯m7":{"del":["x 4 2 4 0 4","x 4 2 1 0 4"],"add":[]},"Gm7":{"del":["3 1 0 0 3 1","3 1 3 0 3 x"],"add":[]},"G♯m7":{"del":["4 2 4 1 0 x"],"add":[]},"Emaj7":{"del":["0 2 1 1 0 4"],"add":[]},"Gmaj7":{"del":["3 2 0 0 0 2","3 2 0 0 3 2","3 2 0 4 0 2"],"add":["3 x 0 0 0 2","3 x 0 4 3 2","3 x 4 0 0 x","3 x 4 0 3 x"]},"G♯maj7":{"del":["4 3 1 0 1 x","4 3 1 0 4 x"],"add":[]},"A♯maj7":{"del":["x 1 0 2 3 1"],"add":[]},"Bmaj7":{"del":["x 2 1 3 0 2"],"add":[]},"Cmaj7":{"del":[],"add":["x 3 5 5 0 0"]},"F♯sus4":{"del":["2 4 4 4 0 x"],"add":[]},"Csus4":{"del":[],"add":["x 3 3 0 1 x","x 3 3 0 1 1","x 3 3 0 1 3"]},"Gsus4":{"del":[],"add":["3 2 0 0 1 3"]},"Esus2":{"del":["0 2 4 4 0 0","0 2 2 4 0 2","0 2 4 4 0 2"],"add":[]},"Csus2":{"del":[],"add":["x 3 0 0 1 x"]},"Gsus2":{"del":[],"add":["3 x 0 2 3 3"]},"D♯add9":{"del":["x x 1 0 4 1"],"add":[]},"Eadd9":{"del":["0 2 4 4 0 4"],"add":[]},"E6":{"del":["0 2 2 4 2 4"],"add":[]},"F6":{"del":["1 3 0 2 1 x","1 3 0 2 3 x"],"add":[]},"A♯6":{"del":["x 1 0 0 3 1","x 1 3 0 3 1","x 1 3 0 3 3"],"add":[]},"B6":{"del":["x 2 1 1 0 2"],"add":[]},"C6":{"del":[],"add":["x 3 2 2 1 0"]},"Em6":{"del":["0 2 2 0 2 3","0 2 2 4 2 3"],"add":[]},"Fm6":{"del":["1 3 0 1 1 x","1 3 0 1 3 x"],"add":["1 x 0 1 1 x"]},"Gm6":{"del":["3 1 0 0 3 0","3 1 0 3 3 0","3 1 2 0 3 0"],"add":[]},"A♯m6":{"del":["x 1 3 0 2 1","x 1 3 0 2 3"],"add":[]},"Bm6":{"del":["x 2 0 1 0 2","x 2 0 1 3 2"],"add":[]},"Cm6":{"del":[],"add":["x 3 x 5 4 5"]},"D♯9":{"del":["x x 1 0 2 1"],"add":[]},"E9":{"del":["0 2 0 1 3 2","0 2 4 1 3 0"],"add":[]},"F9":{"del":["1 0 1 0 1 3","1 0 1 0 4 x"],"add":[]},"F♯9":{"del":["2 1 2 1 2 0","2 1 4 1 2 0"],"add":[]},"G9":{"del":["3 2 0 2 0 1","3 2 3 2 0 3"],"add":[]},"A♯9":{"del":["x 1 0 1 1 1","x 1 0 1 1 4","x 1 0 3 1 4"],"add":[]},"Em9":{"del":["0 2 2 0 3 2"],"add":[]},"Fm9":{"del":["x x 3 0 4 4","1 3 1 0 4 4"],"add":[]},"F♯m9":{"del":["2 0 2 1 2 0","2 0 4 1 2 0"],"add":[]},"G♯m9":{"del":["4 2 4 3 0 x"],"add":[]},"Am9":{"del":["x 0 2 4 1 3"],"add":["x 0 2 4 1 0","x 0 2 4 1 3"]},"Bm9":{"del":["x 2 0 2 2 2"],"add":["x 2 0 2 2 x"]},"Dm9":{"del":[],"add":["x x 0 2 1 0"]},"Gmaj9":{"del":["3 2 0 2 0 2","3 2 4 2 0 3"],"add":["3 2 4 2 0 x","3 x 4 2 0 x"]},"A♯maj9":{"del":["x 1 0 2 1 x"],"add":[]},"D7sus4":{"del":["x x 0 0 1 3"],"add":[]},"F♯7sus4":{"del":["2 4 2 4 2 0","2 4 2 4 0 0","2 4 4 4 0 0"],"add":[]},"A7sus4":{"del":["x 0 2 2 3 3"],"add":[]},"C♯dim":{"del":["x 4 2 0 2 3"],"add":[]},"Fdim":{"del":["1 2 3 1 0 4"],"add":[]},"F♯dim":{"del":["2 0 4 2 1 x"],"add":[]},"G♯dim":{"del":["4 2 0 4 0 4","4 2 0 1 0 4","4 2 0 4 3 x"],"add":[]},"A♯dim":{"del":["x 1 2 3 2 0"],"add":[]},"Bdim":{"del":["x 2 0 4 0 1","x 2 0 4 3 1"],"add":[]},"D♯aug":{"del":["x x 1 0 0 3","x x 1 4 0 3"],"add":[]},"Faug":{"del":["1 0 3 2 2 x"],"add":[]},"F♯aug":{"del":["2 1 0 3 3 x"],"add":[]},"Gaug":{"del":["3 2 1 0 4 x","3 2 1 4 0 x"],"add":[]},"Aaug":{"del":["x 0 3 2 2 1"],"add":["x 0 3 2 2 0"]},"A♯aug":{"del":["x 1 0 3 3 2"],"add":[]},"Baug":{"del":["x 2 1 0 0 3","x 2 1 0 4 3","x 2 1 4 0 3"],"add":[]},"C♯m7♭5":{"del":["x 4 2 0 0 3","x 4 2 4 0 3"],"add":[]},"Em7♭5":{"del":["0 1 0 0 3 0","0 1 0 0 3 3","0 1 2 0 3 0"],"add":[]},"Fm7♭5":{"del":["1 2 1 1 0 4","1 2 1 4 0 4"],"add":["1 2 1 1 0 x"]},"Gm7♭5":{"del":["3 1 3 0 2 x"],"add":[]},"G♯m7♭5":{"del":["4 2 0 4 0 2","4 2 0 1 0 2"],"add":[]},"Bm7♭5":{"del":["x 2 0 2 0 1"],"add":[]}};
  // Power chord（2026-10-04）：只有根音＋5 度（＋八度），不套用「至少 4 弦」等規則。
  // 順序：開放（E5、A5、D5）→ 根音在第 6 弦 → 根音在第 5 弦；每種先三弦（含八度）再兩弦。斜線不另外處理。
  function powerShapes(r) {
    const out = [], mk = fr => ({ frets: fr, barre: null, lib: false, power: true, special: true });
    const OP = { 4: [[0, 2, 2, -1, -1, -1], [0, 2, -1, -1, -1, -1]], 9: [[-1, 0, 2, 2, -1, -1], [-1, 0, 2, -1, -1, -1]], 2: [[-1, -1, 0, 2, 3, -1], [-1, -1, 0, 2, -1, -1]] };
    (OP[r] || []).forEach(fr => out.push(mk(fr)));
    [0, 1].forEach(s => {
      const f = (r - OPEN[s] + 12) % 12;
      if (f < 1) return;
      const a = [-1, -1, -1, -1, -1, -1], b = a.slice();
      a[s] = b[s] = f; a[s + 1] = b[s + 1] = f + 2; a[s + 2] = f + 2;
      out.push(mk(a), mk(b));
    });
    return out;
  }
  function findShapes(raw, lib) {
    const sp = chordSpec(raw);
    if (!sp) return null;
    if (sp.tpl.q === '5' && sp.bass === sp.root) return powerShapes(sp.root);
    const O = OPEN, pcOfIv = i => (sp.root + i.iv) % 12;
    const allow = new Set(sp.tpl.items.map(pcOfIv)); allow.add(sp.bass);
    const need = sp.tpl.items.filter(i => !i.opt).map(pcOfIv), opt = sp.tpl.items.filter(i => i.opt).map(pcOfIv);
    const found = new Map();
    const test = (fr) => {
      let lo = -1, hi = -1;
      fr.forEach((f, s) => { if (f >= 0) { if (lo < 0) lo = s; hi = s; } });
      if (lo < 0 || hi - lo + 1 < 4) return;
      for (let s = lo; s <= hi; s++) if (fr[s] < 0) return;
      if ((O[lo] + fr[lo]) % 12 !== sp.bass) return;
      const pcs = new Set(); fr.forEach((f, s) => { if (f >= 0) pcs.add((O[s] + f) % 12); });
      if (need.some(p => !pcs.has(p))) return;
      const fs = fr.filter(f => f > 0), open = fr.includes(0);
      const minF = fs.length ? Math.min(...fs) : 0, maxF = fs.length ? Math.max(...fs) : 0;
      if (fs.length && maxF - minF > 3) return;
      if (open && maxF > 4) return;
      const sounding = hi - lo + 1;
      if (!open && sounding < 5 && maxF > 5) return;
      const b = barreOf(fr);
      let fingers = fs.length, barre = null;
      if (fingers > 4) { if (!b) return; barre = b; fingers = 1 + fs.filter(f => f > b.f).length; if (fingers > 4) return; }
      const code = fr.map(f => f < 0 ? 'x' : f).join(' ');
      if (found.has(code)) return;
      const omit = opt.filter(p => !pcs.has(p)).length;
      // 有空弦但按到第 4、5 格的比較少見；整排封閉（E 型、A 型）是常用封閉，往前排。
      const fullBarre = !!barre && sounding >= 5 && barre.from === lo && (barre.to === hi || barre.to === 5);
      const score = omit * 1.5 + fingers * 0.4 + (6 - sounding) * 0.5 + (open ? Math.max(0, maxF - 3) : 1) + minF * 0.2 + (fs.length ? maxF - minF : 0) * 0.3 - (fullBarre ? 1.2 : 0);
      found.set(code, { frets: fr.slice(), barre, score, sounding, code });
    };
    for (let w = 1; w <= 10; w++) {
      const opts = O.map(o => { const a = [-1]; if (w <= 2 && allow.has(o)) a.push(0); for (let f = w; f < w + 4; f++) if (allow.has((o + f) % 12)) a.push(f); return a; });
      const fr = [0, 0, 0, 0, 0, 0];
      const rec = s => { if (s === 6) { test(fr); return; } for (const v of opts[s]) { fr[s] = v; rec(s + 1); } };
      rec(0);
    }
    // 只差幾條可彈可不彈的弦：留發聲弦多的那個。
    let list = Array.from(found.values());
    list = list.filter(a => !list.some(b => b !== a && b.sounding > a.sounding && a.frets.every((f, s) => f < 0 || b.frets[s] === f)));
    list.sort((a, b) => a.score - b.score);
    const slash = sp.bass !== sp.root;
    const G = [[], [], []], seen = new Set(), key = fr => fr.map(f => f < 0 ? 'x' : f).join(',');
    const grp = fr => { const fs = fr.filter(f => f > 0), mx = fs.length ? Math.max(...fs) : 0; return fr.includes(0) ? (mx <= 4 ? 0 : -1) : mx <= 5 ? 1 : 2; };
    // 2026-09-28：開放和弦第 1 弦只是重複根音、又要另外用手指按（不在封閉裡）時，改成不彈。只套用在根音 F。
    const dropTop = a => { const fr = a.frets; if (sp.root !== 5 || !fr.includes(0) || !(fr[5] > 0) || (O[5] + fr[5]) % 12 !== sp.root) return a; const b = a.barre; if (b && b.f === fr[5] && b.to >= 5) return a; const n = fr.slice(); n[5] = -1; if (n.filter(f => f >= 0).length < 4) return a; return { ...a, frets: n, barre: barreOf(n) }; };
    const add = (g, it) => { const c = key(it.frets); if (seen.has(c)) return; seen.add(c); G[g].push(it); };
    (lib || []).forEach(e => {
      const s2 = chordSpec(e.name);
      if (!s2 || s2.key !== sp.key) return;
      const fs = e.frets.filter(f => f > 0);
      if (fs.length && Math.max(...fs) - Math.min(...fs) > 4) return;
      const g = e.frets.includes(0) ? 0 : grp(e.frets);
      if (slash && g !== 0) return;
      add(g, { frets: e.frets.slice(), barre: e.barre ? { ...e.barre } : null, lib: true });
    });
    const mv = hasK(MOVE, sp.tpl.q);
    // 2026-09-28：電腦找的開放和弦，三和弦以外的音（含 6、♭♭7、♭7、7、9、11、13…）不能放在低音弦：根音在第 6 弦→不放第 5、6 弦；根音在第 5 弦→不放第 4～6 弦。和弦庫的按法不受影響。
    const ext = new Set(sp.tpl.items.filter(i => !TRI_IV.includes(i.iv % 12)).map(pcOfIv));
    const extLow = fr => { const lo = fr.findIndex(f => f >= 0), ban = lo === 0 ? [0, 1] : lo === 1 ? [0, 1, 2] : []; return ban.some(s => fr[s] >= 0 && ext.has((O[s] + fr[s]) % 12)); };
    list = list.map(dropTop);
    list.forEach(a => { const g = grp(a.frets); if (g === 0 && extLow(a.frets)) return; if (g === 0 || (g === 1 && !slash && !mv && a.barre)) add(g, { frets: a.frets, barre: a.barre, lib: false }); });
    if (!slash && mv) {
      MOVE[sp.tpl.q].map(rel => {
        const lo = rel.findIndex(f => f >= 0);
        // 2026-10-04：base 0＝開放把位的形狀，不列高八度（第 12 格）版本。
        const base = ((sp.root - O[lo] - rel[lo]) % 12 + 12) % 12;
        if (base < 1) return null;
        const fr = rel.map(f => f < 0 ? -1 : base + f);
        return { base, frets: fr, barre: barreOf(fr), special: (MOVE_SP[sp.tpl.q] || []).includes(rel.join(',')) };
      }).filter(Boolean).sort((a, b) => a.base - b.base).forEach(x => add(Math.max(...x.frets) <= 5 ? 1 : 2, { frets: x.frets, barre: x.barre, lib: false, move: true, special: x.special }));
    } else if (!slash) {
      const q = sp.tpl.q, sh = [];
      [[SHAPE_E, 0], [SHAPE_A, 1]].forEach(([T, s]) => {
        if (!hasK(T, q)) return;
        const r = (sp.root - O[s] + 12) % 12;
        if (r < 1) return;
        const fr = T[q].map(d => d < 0 ? -1 : r + d);
        sh.push({ r, frets: fr, barre: barreOf(fr) });
      });
      sh.sort((a, b) => a.r - b.r).forEach(x => add(x.r <= 5 ? 1 : 2, { frets: x.frets, barre: x.barre, lib: false }));
    }
    let out = G[0].slice(0, OPEN_MAX).concat(G[1].slice(0, BARRE5_MAX), G[2]);
    // 2026-09-28：dim7 只列可移動形狀（MOVE），不列開放和弦。
    if (sp.tpl.q === 'dim7' && !slash) out = out.filter(it => it.move);
    const fk = Object.keys(FIX).find(k => { const s2 = chordSpec(k); return s2 && s2.key === sp.key; });
    if (fk) {
      const fx = FIX[fk], P = s => s.trim().split(/\s+/).map(t => t === 'x' ? -1 : +t);
      const mk = s => { const fr = P(s); return { frets: fr, barre: barreOf(fr), lib: true, special: true, fix: true }; };
      if (fx.only) out = fx.only.map(mk);
      else {
        const add = (fx.add || []).map(mk), drop = new Set((fx.del || []).concat(fx.add || []).map(s => P(s).join(',')));
        out = add.concat(out.filter(it => !drop.has(it.frets.join(','))));
      }
    }
    {
      const ok = Object.keys(OPEN_FIX).find(k => { const s2 = chordSpec(k); return s2 && s2.key === sp.key; });
      if (ok) {
        const ox = OPEN_FIX[ok], P2 = s => s.trim().split(/\s+/).map(t => t === 'x' ? -1 : +t);
        const dr = new Set(ox.del.concat(ox.add).map(s => P2(s).join(',')));
        out = ox.add.map(s => { const fr = P2(s); return { frets: fr, barre: barreOf(fr), lib: true, special: true, fix: true }; }).concat(out.filter(it => !dr.has(it.frets.join(','))));
      }
    }
    // 2026-09-28：根音 F 的和弦，最前面放一個根音在第 4 弦（第 3 格）、4 格內的按法（如 F＝xx3211、Fmaj7＝xx3210）。
    if (sp.root === 5 && !slash && !/dim/.test(sp.tpl.q)) {
      const r4 = Array.from(found.values()).filter(a => a.frets[0] < 0 && a.frets[1] < 0 && a.frets[2] === 3 && a.frets.slice(3).every(f => f >= 0) && Math.max(...a.frets) <= 4).sort((a, b) => a.score - b.score)[0];
      if (r4) { const k4 = r4.frets.join(','); out = [{ frets: r4.frets, barre: r4.barre, lib: false, r4: true }].concat(out.filter(it => it.frets.join(',') !== k4)); }
    }
    // 2026-09-28：不能有一根手指按兩根弦（只橫跨 2 弦的小封閉）。按格 4 個以內就改成每指各按一弦；超過 4 個又只能靠 2 弦封閉的按法拿掉。FIX（使用者指定）也套用，但只拿掉封閉線、不刪按法。
    out = out.map(it => {
      if (!it.barre || it.barre.to - it.barre.from + 1 !== 2) return it;
      if (it.fix || it.frets.filter(f => f > 0).length <= 4) return { ...it, barre: null };
      return null;
    }).filter(Boolean);
    // 2026-10-04：大三和弦另外平移出完整的 C、G、D 指型（不含空弦），跟搜尋找到的同形狀一起排到最後（依格數），不受 8 個上限。
    if (sp.tpl.q === '' && !slash) {
      const SH = [[-1, 3, 2, 0, 1, 0], [3, 2, 0, 0, 0, 3], [-1, -1, 0, 2, 3, 2]];
      const late = it => { const fr = it.frets; if (it.fix || fr.includes(0)) return false; const b = Math.min(...fr.filter(f => f > 0)); return SH.some(T => T.every((d, i) => d < 0 ? fr[i] < 0 : fr[i] === b + d)); };
      const has = new Set(out.map(it => it.frets.join(',')));
      SH.forEach(T => {
        const s = T.findIndex(d => d >= 0);
        const b = ((sp.root - O[s] - T[s]) % 12 + 12) % 12; if (b < 1) return;
        const fr = T.map(d => d < 0 ? -1 : b + d);
        if (!has.has(fr.join(','))) { has.add(fr.join(',')); out.push({ frets: fr, barre: barreOf(fr), lib: false, caged: true }); }
      });
      const lo = it => Math.min(...it.frets.filter(f => f > 0));
      const head = out.filter(it => !late(it)).slice(0, LOOKUP_MAX);
      return head.concat(out.filter(late).sort((a, b) => lo(a) - lo(b)));
    }
    return out.slice(0, LOOKUP_MAX);
  }

  root.HYCH_MUSIC = { FIX, SHARP, FLAT, OPEN, DEG, FRET_OPTS, MAX_START, normF, segsOf, fixAcc, splitSlash, parseName, nameParts, degLabel, hasFretted, hasHigher, labShown, diagramModel, shiftChord, wrapLines, paginate, recognize, soundingFrets, suggestNames, chordSpec, findShapes, LOOKUP_MAX, OPEN_MAX, MOVE, TRI_IV };
})(typeof window !== 'undefined' ? window : globalThis);
