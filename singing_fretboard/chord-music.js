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
    const vis = f => f >= sf && f < sf + F;
    const vc = { ...c, dots: c.dots.filter(d => vis(d.f)), barres: c.barres.filter(b => vis(b.f)) };
    const isRoot = (s, f) => !!p && (O[s] + f) % 12 === p.pc;
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
    if (p && sf > 1) { const sd = soundingFrets(vc); for (let s = 0; s < 6; s++) if (sd[s] >= sf && isRoot(s, sd[s])) { rf = sd[s]; break; } }
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
    ['maj13', '1 3 (5) 7 (9) 13'], ['maj7♯11', '1 3 (5) 7 ♯11']
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

  root.HYCH_MUSIC = { SHARP, FLAT, OPEN, DEG, FRET_OPTS, MAX_START, normF, segsOf, fixAcc, splitSlash, parseName, nameParts, degLabel, hasFretted, hasHigher, labShown, diagramModel, shiftChord, wrapLines, paginate, recognize, soundingFrets, suggestNames };
})(typeof window !== 'undefined' ? window : globalThis);
