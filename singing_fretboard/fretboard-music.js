// 弦吟指板｜音樂計算
// 只放「跟畫面無關」的音樂邏輯：音名、音階、調弦、級數、琴格位置、Capo 換算。
// 這個檔案不碰畫面也不碰存檔，所以可以單獨測試，也能給未來的 app／講義產生器共用。
// 弦的編號：0 = 第 1 弦（高音 E），5 = 第 6 弦（低音 E）。音高用 pitch class：C=0, C♯=1 … B=11。
(function () {
  var SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  var FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  var FLATKEYS = [1, 3, 5, 8, 10];

  var SCALES = [
    { t: '自然大調 Major', iv: [0, 2, 4, 5, 7, 9, 11], dg: ['1', '2', '3', '4', '5', '6', '7'] },
    { t: '自然小調 Minor', iv: [0, 2, 3, 5, 7, 8, 10], dg: ['1', '2', '♭3', '4', '5', '♭6', '♭7'] },
    { t: '大調五聲 Major Pent.', iv: [0, 2, 4, 7, 9], dg: ['1', '2', '3', '5', '6'] },
    { t: '小調五聲 Minor Pent.', iv: [0, 3, 5, 7, 10], dg: ['1', '♭3', '4', '5', '♭7'] },
    { t: '小調藍調 Minor Blues', iv: [0, 3, 5, 6, 10], dg: ['1', '♭3', '4', '♭5', '♭7'] },
    { t: '大調藍調 Major Blues', iv: [0, 2, 3, 7, 9], dg: ['1', '2', '♭3', '5', '6'] },
    { t: '多利安 Dorian', iv: [0, 2, 3, 5, 7, 9, 10], dg: ['1', '2', '♭3', '4', '5', '6', '♭7'] },
    { t: '弗里吉安 Phrygian', iv: [0, 1, 3, 5, 7, 8, 10], dg: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'] },
    { t: '利底安 Lydian', iv: [0, 2, 4, 6, 7, 9, 11], dg: ['1', '2', '3', '♯4', '5', '6', '7'] },
    { t: '米索利地安 Mixolydian', iv: [0, 2, 4, 5, 7, 9, 10], dg: ['1', '2', '3', '4', '5', '6', '♭7'] },
    { t: '洛克里安 Locrian', iv: [0, 1, 3, 5, 6, 8, 10], dg: ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7'] },
    { t: '和聲小調 Harmonic Minor', iv: [0, 2, 3, 5, 7, 8, 11], dg: ['1', '2', '♭3', '4', '5', '♭6', '7'] },
    { t: '旋律小調 Melodic Minor', iv: [0, 2, 3, 5, 7, 9, 11], dg: ['1', '2', '♭3', '4', '5', '6', '7'] },
    { t: '變化音階 Altered', iv: [0, 1, 3, 4, 6, 8, 10], dg: ['1', '♭9', '♯9', '3', '♭5', '♭13', '♭7'] },
    { t: '利底安屬 Lydian Dominant', iv: [0, 2, 4, 6, 7, 9, 10], dg: ['1', '2', '3', '♯4', '5', '6', '♭7'] },
    { t: '全音音階 Whole Tone', iv: [0, 2, 4, 6, 8, 10], dg: ['1', '2', '3', '♯4', '♯5', '♭7'] },
    { t: '半全減音階 H-W Dim.', iv: [0, 1, 3, 4, 6, 7, 9, 10], dg: ['1', '♭9', '♯9', '3', '♯11', '5', '13', '♭7'] },
    { t: '全半減音階 W-H Dim.', iv: [0, 2, 3, 5, 6, 8, 9, 11], dg: ['1', '2', '♭3', '4', '♭5', '♭6', '6', '7'] }
  ];

  var TUNINGS = [
    { t: 'Standard　E A D G B E', pc: [4, 11, 7, 2, 9, 4] },
    { t: 'Drop D　D A D G B E', pc: [4, 11, 7, 2, 9, 2] },
    { t: 'DADGAD', pc: [2, 9, 7, 2, 9, 2] },
    { t: 'Open G　D G D G B D', pc: [2, 11, 7, 2, 7, 2] },
    { t: 'Open D　D A D F♯ A D', pc: [2, 9, 6, 2, 9, 2] },
    { t: 'Open C　C G C G C E', pc: [4, 0, 7, 0, 7, 0] },
    { t: '半音降　E♭ A♭ D♭ G♭ B♭ E♭', pc: [3, 10, 6, 1, 8, 3] },
    { t: '全音降　D G C F A D', pc: [2, 9, 5, 0, 7, 2] }
  ];

  var CHROM_DEG = ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];
  var NAT = [0, 2, 4, 5, 7, 9, 11];
  var NATL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  var MARK1 = [3, 5, 7, 9, 15, 17, 19, 21];
  var MARK2 = [12, 24];

  // 琴格位置（真實吉他 fret 公式）。回傳每條琴格線、每格中點在指板上的百分比。
  function geo(n) {
    var r = function (k) { return 1 - Math.pow(2, -k / 12); };
    var tot = r(n), wire = [], mid = [];
    for (var f = 1; f <= n; f++) {
      wire.push(100 * r(f) / tot);
      mid.push(100 * (r(f - 1) + r(f)) / 2 / tot);
    }
    return { wire: wire, mid: mid };
  }

  // 音名拼法：acc = -1 強制降記號、1 強制升記號、0 依主音自動決定。
  function spelling(keyPc, acc) {
    if (acc === -1) return FLAT;
    if (acc === 1) return SHARP;
    return FLATKEYS.indexOf(keyPc) >= 0 ? FLAT : SHARP;
  }

  // 某調某音階：pitch class → 級數文字。
  function degMap(keyPc, scaleId) {
    var sc = SCALES[scaleId], m = {};
    sc.iv.forEach(function (iv, k) { m[(keyPc + iv) % 12] = sc.dg[k]; });
    return m;
  }

  // 任一音的級數；音階外的音用半音級數（例如 ♭2）。
  function degLabel(deg, ekey, apc) {
    if (deg[apc] !== undefined) return deg[apc];
    return CHROM_DEG[((apc - ekey) % 12 + 12) % 12];
  }

  // Capo 之後實際聽到的主音。
  function ekeyOf(keyPc, shift) {
    return (keyPc + (shift || 0)) % 12;
  }

  // 自動填滿音階：回傳 { '弦-格': 1（主音）或 0（其他音階音） }。
  function fillT(keyPc, scaleId, tun, frets, shift) {
    var ekey = ekeyOf(keyPc, shift);
    var deg = degMap(ekey, scaleId), notes = {};
    for (var i = 0; i < 6; i++) {
      for (var f = 0; f <= frets; f++) {
        var pc = (tun[i] + f) % 12;
        if (deg[pc] !== undefined) notes[i + '-' + f] = pc === ekey ? 1 : 0;
      }
    }
    return notes;
  }

  // 琴格變少時，把超出範圍的音拿掉。
  function prune(notes, frets) {
    var out = {};
    Object.keys(notes).forEach(function (k) {
      if (+k.split('-')[1] <= frets) out[k] = notes[k];
    });
    return out;
  }

  window.HYFB_MUSIC = {
    SHARP: SHARP, FLAT: FLAT, FLATKEYS: FLATKEYS, SCALES: SCALES, TUNINGS: TUNINGS,
    CHROM_DEG: CHROM_DEG, NAT: NAT, NATL: NATL, MARK1: MARK1, MARK2: MARK2,
    geo: geo, spelling: spelling, degMap: degMap, degLabel: degLabel, ekeyOf: ekeyOf, fillT: fillT, prune: prune
  };
})();
