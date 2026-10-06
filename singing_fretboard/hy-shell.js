// 弦吟指板：兩個編輯器共用的「外殼」功能——左下導覽按鈕滑入與發光、導覽對話框、⌘E 匯出視窗、⌘⇧G 重播提示、⌘⇧L 匯出 Logo 開關、訂閱信封搖晃、提示叮聲、導覽結束還原畫面。
// 用法：在編輯器 constructor 裡 HYSHELL.install(this, { fabDelay: 350 })；componentWillUnmount 裡呼叫 this.shellCleanup()。
// Safari 修正：畫面用 CSS zoom 縮小時，Safari 回報的元素位置是「沒縮小前」的數字，導覽亮框、編輯視窗、框選都會錯位。
// 這裡第一次量位置時先做一次小測試：瀏覽器會算錯才換算，Chrome 等正常的瀏覽器完全不受影響。
(function () {
  if (window.__hyZoomFix) return; window.__hyZoomFix = 1;
  const P = Element.prototype, nat = P.getBoundingClientRect;
  let cal = null;
  // 2026-10-02：測試結果只在「量得到、數字合理」時才記住；視窗大小／瀏覽器縮放改變、頁面切回前景、載入完成後都重測。
  // 以前第一次量就永久記住：如果剛好量在畫面還沒排好的瞬間，之後所有有 zoom 的小視窗（調弦、框選選單）位置都會被算錯，連 Chrome 也會。
  const reset = () => { cal = null; };
  ['resize', 'load', 'pageshow', 'visibilitychange'].forEach(n => window.addEventListener(n, reset));
  window.addEventListener('load', () => setTimeout(reset, 1500));
  function calibrate() {
    if (cal) return cal;
    if (!document.body) return { ok: true };
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:300px;top:200px;width:100px;height:100px;zoom:0.5;visibility:hidden;pointer-events:none;';
    const a = document.createElement('div'), b = document.createElement('div');
    a.style.cssText = 'position:absolute;left:40px;top:40px;width:10px;height:10px;';
    b.style.cssText = 'position:absolute;left:200px;top:200px;width:10px;height:10px;';
    box.appendChild(a); box.appendChild(b); document.body.appendChild(box);
    const ra = nat.call(a), rb = nat.call(b), rx = nat.call(box);
    box.remove();
    // 真正位置：a 在 (300+20, 200+20)，b 在 (300+100, 200+100)，寬 5。
    const Ax = (rb.left - ra.left) / 80, Ay = (rb.top - ra.top) / 80;
    // 量不到（畫面還沒排好、被藏起來）或數字不合理：這次先當作正常，不記住，下次再測。
    if (!(rx.width > 1) || !(Ax > 0.3 && Ax < 3.5) || !(Ay > 0.3 && Ay < 3.5)) return { ok: true };
    if (Math.abs(Ax - 1) < 0.05 && Math.abs(Ay - 1) < 0.05) return (cal = { ok: true });
    const Bx = ra.left - Ax * 320, By = ra.top - Ay * 220;
    const k = Math.log(Ax) / Math.log(2);
    cal = { ok: false, k: k > 0.05 ? k : 1, ox: Math.abs(1 - Ax) > 1e-6 ? Bx / (1 - Ax) : 0, oy: Math.abs(1 - Ay) > 1e-6 ? By / (1 - Ay) : 0, self: Math.abs(rx.width - 50) > 2 };
    return cal;
  }
  P.getBoundingClientRect = function () {
    const r = nat.call(this), c = calibrate();
    if (c.ok) return r;
    let z = 1, el = c.self ? this : this.parentElement;
    while (el && el.nodeType === 1) { const v = parseFloat(getComputedStyle(el).zoom); if (v && v !== 1) z *= v; el = el.parentElement; }
    if (Math.abs(z - 1) < 0.001) return r;
    z = Math.pow(z, c.k);
    const x = (r.left - c.ox) * z + c.ox, y = (r.top - c.oy) * z + c.oy;
    return new DOMRect(x, y, r.width * z, r.height * z);
  };
})();
// 字體載入：等 Barlow／Barlow Condensed 真的載入完成（Google 樣式表可能還沒到，最多等約 6 秒）。畫指板、匯出前用 window.HY_FONTS_READY。
window.HY_FONTS_READY = (function () {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const specs = ['400 16px "Barlow"', '600 16px "Barlow"', '700 16px "Barlow"', '600 16px "Barlow Condensed"', '700 16px "Barlow Condensed"'];
  return new Promise(res => {
    let n = 0;
    (function go() {
      Promise.all(specs.map(s => document.fonts.load(s, 'Aa1\u266f\u266d'))).then(r => {
        if (r.every(a => a && a.length) || ++n > 20) res(); else setTimeout(go, 300);
      }).catch(res);
    })();
  });
})();
/*HYTRACK-START*/
// GA4 送出函式（兩頁共用）。只在正式網址送出；window.gtag 不存在（Design 預覽、離線、被擋）時安靜跳過。
// 事件名稱固定，不要改名；新增事件要先加進 DEPLOY.md「GA4 規則」的表。不送任何個人資料（標題、檔名、輸入的文字）。
(function () {
  if (window.hyTrack) return;
  var HOST = 'fretboard.huanyinliu.com';
  var OK = {
    export_image: { format: ['png', 'jpg'] },
    save_project: { method: ['save', 'save_as'] },
    open_project: {},
    new_project: {},
    chord_lookup: { chord_name: 20 },
    first_edit: {},
    tour_start: {},
    tour_complete: {},
    subscribe_click: {}
  };
  function hyTrack(name, p) {
    try {
      if (!OK[name] || location.hostname !== HOST || typeof window.gtag !== 'function') return;
      var o = { editor: /chord/.test(location.pathname) ? 'chord' : 'fretboard' }, spec = OK[name];
      p = p || {};
      Object.keys(spec).forEach(function (k) {
        var v = p[k], r = spec[k];
        if (Array.isArray(r)) { if (r.indexOf(v) >= 0) o[k] = v; }
        else if (typeof v === 'string' && v) o[k] = v.slice(0, r);
      });
      window.gtag('event', name, o);
    } catch (e) {}
  }
  hyTrack.events = Object.keys(OK);
  window.hyTrack = hyTrack;
})();
/*HYTRACK-END*/
// 空白鍵不按按鈕（2026-09-30）：瀏覽器預設「按鈕被點過後按 Space＝再按一次」，會跟指板的 Space 快速切換 A／B 搞混。
// 所有按鈕一律改用 Enter 觸發（Enter 本來就可以）；打字的地方不受影響。指板自己的 Space 切換 A／B 照常。
(function () {
  if (window.__hySpaceGuard) return; window.__hySpaceGuard = true;
  const guard = (e) => {
    if (e.code !== 'Space' && e.key !== ' ') return;
    const t = e.target, tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (tag === 'button' || tag === 'summary' || (t && t.getAttribute && t.getAttribute('role') === 'button') || (tag === 'input' && /^(button|submit|reset|checkbox|radio)$/i.test(t.type || ''))) e.preventDefault();
  };
  window.addEventListener('keydown', guard, true);
  window.addEventListener('keyup', guard, true);
})();
(function () {
  const M = {
    // 使用導覽按鈕：畫面顯示後滑入，第一次使用時馬上開始呼吸發光，直到開始編輯或按下導覽。
    // 同時頭像上方冒出對話框：先「…」1 秒，再換成整句話；10 秒後淡出（按鈕繼續發光），開始編輯或按 × 就收起。
    armFab() {
      if (this._fabArmed) return; this._fabArmed = true;
      this._fabT = setTimeout(() => { this.setState({ fabIn: true }); this.tourGlow(); this.subPulse(); }, this._shellOpts.fabDelay);
      this._fabFitI = setInterval(() => this.fabFit(), 700);
    },
    // 訂閱按鈕：每 60 秒信封放大搖晃一次（3 秒）；前景使用滿 20 分鐘響一聲輕叮，之後每 20 分鐘一次（兩頁共用計時）。
    subPulse() {
      if (this._spT) return;
      this._spT = setInterval(() => this.envShake(false), 60000);
      this._dingT = setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        let ms = 0; try { ms = +sessionStorage.getItem('hy-sub-use-ms') || 0; } catch (e) {}
        ms += 5000;
        if (ms >= 1200000 && !this.subBusy()) { ms = 0; this.envShake(true); }
        try { sessionStorage.setItem('hy-sub-use-ms', String(ms)); } catch (e) {}
      }, 5000);
      this._muteKey = (e) => {
        if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
        // ⌘⇧L／Ctrl+Shift+L：匯出視窗開著時取消／加回 Logo（每次打開匯出視窗都重設成有 Logo）。
        if (e.code === 'KeyL' && e.shiftKey) {
          if (!this.state.exportOpen) return;
          e.preventDefault();
          const on = this.state.exportLogo === false;
          this.setState({ exportLogo: on });
          this.shellToast(on ? '已加回 Logo' : '已取消 Logo');
          return;
        }
        // ⌘E／Ctrl+E：打開匯出圖片視窗（每次打開都重設成有 Logo）。
        if (e.code === 'KeyE' && !e.shiftKey) {
          e.preventDefault();
          if (this.state.tourOn || this.state.exportOpen) return;
          this.setState({ exportOpen: true, exportLogo: true });
          return;
        }
        // ⌘⇧M／Ctrl+Shift+M：圓點音效開／關（記在瀏覽器 hy-note-sound，兩頁共用，預設關）。
        if (e.code === 'KeyM' && e.shiftKey) { e.preventDefault(); e.stopPropagation(); this.setSound(!this.soundOn()); return; }
        // ⌘⇧G／Ctrl+Shift+G（G＝Glow 發光）：導覽按鈕重新發光＋對話框，訂閱信封搖晃＋叮聲。只播一次，不動原本的計時。
        if (e.code === 'KeyG' && e.shiftKey) { e.preventDefault(); e.stopPropagation(); this.replayGlow(); this.envShake(true, true); return; }
        // ⌘⇧X／Ctrl+Shift+X：重播開場動畫（導覽中不播）。
        if (e.code === 'KeyX' && e.shiftKey) { e.preventDefault(); e.stopPropagation(); this.replayIntro(); return; }
      };
      window.addEventListener('keydown', this._muteKey, true);
    },
    replayIntro() {
      if (this.state.tourOn) return;
      // 看過開場的分頁會在 <head> 加一段隱藏開場的樣式，重播前先拿掉。
      document.querySelectorAll('style').forEach(s => { if (s.textContent.indexOf('[data-hy-intro] > *') >= 0) s.remove(); });
      clearTimeout(this._introT);
      this.setState({ intro: false, exportOpen: false }, () => requestAnimationFrame(() => {
        this.setState({ intro: true });
        this._introT = setTimeout(() => this.setState({ intro: false }), 5000);
      }));
    },
    soundOn() { try { return localStorage.getItem('hy-note-sound') === '1'; } catch (e) { return false; } },
    setSound(on) {
      try { localStorage.setItem('hy-note-sound', on ? '1' : '0'); } catch (e) {}
      this.setState({ noteSoundOn: on });
      this.shellToast(on ? '已開啟圓點音效' : '已關閉圓點音效');
    },
    shellToast(msg) {
      clearTimeout(this._toastT);
      this.setState({ subToast: msg });
      this._toastT = setTimeout(() => this.setState({ subToast: '' }), 1600);
    },
    subBusy() { const s = this.state; return !!(s.tourOn || !s.fabIn || s.subOffer || s.intro); },
    subMuted() { return false; }, // ⌘M 靜音已拿掉（2026-09-26）
    envShake(ding, force) {
      if (!force && this.subBusy()) return;
      clearTimeout(this._envT);
      this.setState({ envOn: false }, () => requestAnimationFrame(() => { this.setState({ envOn: true }); this._envT = setTimeout(() => this.setState({ envOn: false }), 3100); }));
      if (ding && (force || !this.subMuted())) { clearTimeout(this._dingSndT); this._dingSndT = setTimeout(() => this.playDing(), 400); }
    },
    // 鈴聲降低音高播放（預設低 3 個半音）：前四聲原音量，後四聲慢慢變小，約 1.05 秒停。
    playDing() {
      try {
        const a = this._ding || (this._ding = new Audio('assets/sfx/sub-ding.mp3'));
        a.volume = 0.35; a.currentTime = 0;
        const semi = +(this.props.dingPitch ?? -3) || 0;
        a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false;
        a.playbackRate = Math.pow(2, semi / 12);
        const p = a.play(); if (p && p.catch) p.catch(() => {});
        clearInterval(this._dingFade); const t0 = performance.now();
        this._dingFade = setInterval(() => { const t = performance.now() - t0; if (t < 350) return; const k = Math.max(0, 1 - (t - 350) / 700), v = 0.35 * k * k; a.volume = v; if (v <= 0) { clearInterval(this._dingFade); this._dingFade = null; a.pause(); } }, 20);
      } catch (e) {}
    },
    // 圓點音效（2026-10-06）：放入音或改顏色／形狀時發出該音。kind：'A'＝合成撥弦（Karplus-Strong）、'B'＝柔和電子音（音樂盒／電鋼琴）、其他＝不出聲。
    playNote(midi, kind) {
      if (!/^[A-G]$/.test(kind || '')) return;
      try {
        const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
        const ac = window.__hyAC || (window.__hyAC = new C());
        if (ac.state === 'suspended') ac.resume();
        const t = ac.currentTime + 0.01, hz = 440 * Math.pow(2, (midi - 69) / 12);
        const out = ac.createGain(); out.connect(ac.destination);
        if (kind === 'C' || kind === 'D' || kind === 'E') {
          // C 木琴／馬林巴：短、溫暖；D 鋼片琴：亮、音尾長；E 弦樂墊：慢慢浮出。
          const P = kind === 'C' ? { a: 0.003, g: 0.4, d: 0.55, cut: 6, parts: [[1, 1, 0.55], [4, 0.22, 0.12], [9.9, 0.05, 0.05]] }
            : kind === 'D' ? { a: 0.002, g: 0.26, d: 2.2, cut: 9, parts: [[1, 1, 2.2], [3, 0.3, 0.9], [5.4, 0.08, 0.35], [8.2, 0.03, 0.15]] }
            : { a: 0.18, g: 0.16, d: 1.8, cut: 3, parts: [[1, 1, 1.8], [2.003, 0.35, 1.8], [0.998, 0.6, 1.8]], saw: true };
          const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(6000, hz * P.cut); lp.connect(out);
          out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(P.g, t + P.a); out.gain.exponentialRampToValueAtTime(0.0001, t + P.a + P.d);
          P.parts.forEach(([m, g, dur]) => {
            const o = ac.createOscillator(), og = ac.createGain(); o.type = P.saw ? 'triangle' : 'sine'; o.frequency.value = hz * m;
            og.gain.setValueAtTime(g, t); if (!P.saw) og.gain.exponentialRampToValueAtTime(0.0001, t + P.a + dur);
            o.connect(og); og.connect(lp); o.start(t); o.stop(t + P.a + P.d + 0.1);
          });
        } else if (kind === 'A' || kind === 'F' || kind === 'G') {
          const soft = kind === 'G', cache = soft ? (window.__hyKS2 || (window.__hyKS2 = {})) : (window.__hyKS || (window.__hyKS = {}));
          let buf = cache[midi];
          if (!buf) {
            const sr = ac.sampleRate, len = Math.floor(sr * 2.2), N = Math.max(2, Math.round(sr / hz)), d = new Float32Array(len), ring = new Float32Array(N);
            let prev = 0; for (let k = 0; k < N; k++) { const w = Math.random() * 2 - 1; prev = prev * (soft ? 0.82 : 0.55) + w * (soft ? 0.18 : 0.45); ring[k] = prev; }
            const decay = 0.996 - Math.max(0, midi - 60) * 0.0004;
            for (let n = 0, p = 0; n < len; n++) { const a = ring[p], b = ring[(p + 1) % N], v = decay * 0.5 * (a + b); d[n] = a; ring[p] = v; p = (p + 1) % N; }
            buf = ac.createBuffer(1, len, sr); buf.copyToChannel ? buf.copyToChannel(d, 0) : buf.getChannelData(0).set(d); cache[midi] = buf;
          }
          const src = ac.createBufferSource(); src.buffer = buf;
          const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(5200, hz * 7); lp.Q.value = 0.3;
          out.gain.setValueAtTime(0.55, t); out.gain.setTargetAtTime(0, t + 1.4, 0.25);
          if (soft) {
            // G 柔撥弦：用指腹撥的感覺——音頭慢 8ms、高音更少、音尾稍短。
            lp.frequency.value = Math.min(2200, hz * 3.2);
            out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.75, t + 0.008); out.gain.setTargetAtTime(0, t + 1.1, 0.3);
          }
          src.connect(lp);
          if (kind === 'F') {
            // 尼龍弦：再柔一點，加兩個琴身共鳴（約 110Hz、220Hz）。
            lp.frequency.value = Math.min(3000, hz * 4.5);
            const b1 = ac.createBiquadFilter(); b1.type = 'peaking'; b1.frequency.value = 110; b1.Q.value = 1.2; b1.gain.value = 6;
            const b2 = ac.createBiquadFilter(); b2.type = 'peaking'; b2.frequency.value = 230; b2.Q.value = 1.4; b2.gain.value = 4;
            lp.connect(b1); b1.connect(b2); b2.connect(out); out.gain.setValueAtTime(0.5, t);
          } else lp.connect(out);
          src.start(t); src.stop(t + 2.3);
        } else {
          const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(4200, hz * 6); lp.connect(out);
          out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.32, t + 0.006); out.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
          [[1, 1, 1.6], [2, 0.18, 0.7], [3.01, 0.05, 0.35]].forEach(([m, g, dur]) => {
            const o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine'; o.frequency.value = hz * m;
            og.gain.setValueAtTime(g, t); og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(og); og.connect(lp); o.start(t); o.stop(t + 1.7);
          });
        }
      } catch (e) {}
    },
    // 左下兩顆浮動按鈕蓋到畫面內容時，縮成精簡版（導覽＝只有大頭貼、訂閱＝信封＋「訂閱」）。用「完整尺寸」判斷，視窗放大不再蓋到時就恢復。
    fabFit() {
      const s = this.state;
      if (!s.fabIn || s.tourOn || s.intro) return;
      const els = [document.querySelector('button[title="使用導覽 Tour"]'), document.querySelector('a[title="訂閱弦吟 Subscribe"]')];
      if (!els[0] || !els[1] || !els[0].offsetWidth) return;
      const fw = this._fabW || (this._fabW = []);
      const isContent = (e) => {
        if (e === document.documentElement || e === document.body) return false;
        if (e instanceof SVGElement || /^(BUTTON|A|INPUT|IMG|CANVAS|SELECT|TEXTAREA)$/.test(e.tagName)) return true;
        if (e.getBoundingClientRect().width >= window.innerWidth * 0.9) return false;
        const bg = getComputedStyle(e).backgroundColor;
        if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return true;
        for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
        return false;
      };
      // 寬容度：每顆按鈕取 6×3＝18 個點，被蓋到的點達 FAB_TOL（約三分之一）才縮小；邊緣內縮 6px，擦邊不算。
      const FAB_TOL = 6;
      let hit = false;
      els.forEach((el, j) => {
        if (hit) return;
        const r = el.getBoundingClientRect();
        if (!s.fabMini) fw[j] = r.width;
        const w = fw[j] || r.width;
        let n = 0;
        for (let a = 0; a < 6; a++) for (let b = 0; b < 3; b++) {
          const x = r.left + 6 + (w - 12) * a / 5, y = r.top + 6 + (r.height - 12) * b / 2;
          if (document.elementsFromPoint(x, y).some(e => !els.some(f => f === e || f.contains(e)) && !(e.closest && e.closest('[data-tour-root]')) && isContent(e))) n++;
        }
        if (n >= FAB_TOL) hit = true;
      });
      if (hit !== !!s.fabMini) this.setState({ fabMini: hit });
    },
    fabMiniVals() {
      const m = !!this.state.fabMini;
      return { tourFabPad: m ? '0 4px' : '0 20px 0 4px', tourTxtDisp: m ? 'none' : 'inline', subFabPad: m ? '0 14px 0 12px' : '0 20px 0 16px', subMiniDisp: m ? 'inline' : 'none', subFullDisp: m ? 'none' : 'inline' };
    },
    tourGlow() {
      let seen = false; try { seen = localStorage.getItem('hy-tour-hinted') === '1'; } catch (e) {}
      if (seen || this._tgT) return;
      this.setState({ tourGlow: true, tourBub: 'dots' });
      this._tgT = setInterval(() => this.setState(s => ({ tourGlow: !s.tourGlow })), 1200);
      clearTimeout(this._bubT);
      this._bubT = setTimeout(() => {
        this.setState({ tourBub: 'text' });
        this._bubT = setTimeout(() => this.closeBub(), 10000);
      }, 1000);
    },
    replayGlow() {
      if (!this.state.fabIn || this.state.tourOn) return;
      if (this._tgT) clearInterval(this._tgT);
      clearTimeout(this._bubT);
      this._editSeen = false;
      this.setState({ tourGlow: true, tourBub: 'dots' });
      this._tgT = setInterval(() => this.setState(s => ({ tourGlow: !s.tourGlow })), 1200);
      this._bubT = setTimeout(() => { this.setState({ tourBub: 'text' }); this._bubT = setTimeout(() => this.closeBub(), 10000); }, 1000);
    },
    closeBub() {
      clearTimeout(this._bubT); this._bubT = null;
      if (!this.state.tourBub) return;
      if (this.state.tourBub === 'dots') { this.setState({ tourBub: '' }); return; }
      this.setState({ tourBub: 'out' });
      this._bubT = setTimeout(() => { this._bubT = null; this.setState({ tourBub: '' }); }, 320);
    },
    stopGlow() {
      if (this._tgT) { clearInterval(this._tgT); this._tgT = null; }
      try { localStorage.setItem('hy-tour-hinted', '1'); } catch (e) {}
      if (this.state.tourGlow) this.setState({ tourGlow: false });
      this.closeBub();
    },
    // Tweaks「測試」用：清掉提示記憶，從頭播一次開場、按鈕滑入與發光。不碰使用者資料。
    replayHints() {
      try { localStorage.removeItem('hy-tour-hinted'); } catch (e) {}
      if (this._tgT) { clearInterval(this._tgT); this._tgT = null; }
      clearTimeout(this._introT); clearTimeout(this._fabT); clearTimeout(this._fabT2); clearTimeout(this._bubT); this._bubT = null;
      this._fabArmed = false; this._editSeen = false;
      this.setState({ fabIn: false, tourGlow: false, tourBub: '', intro: true });
      this._introT = setTimeout(() => this.setState({ intro: false }), 5000);
    },
    // 畫面關閉時：停掉所有計時器、移除快捷鍵、停止叮聲。
    shellCleanup() {
      ['_spT', '_dingT', '_dingFade', '_tgT', '_fabFitI'].forEach(k => { if (this[k]) clearInterval(this[k]); this[k] = null; });
      ['_fabT', '_fabT2', '_envT', '_dingSndT', '_toastT', '_introT', '_bubT'].forEach(k => { if (this[k]) clearTimeout(this[k]); this[k] = null; });
      if (this._muteKey) { window.removeEventListener('keydown', this._muteKey, true); this._muteKey = null; }
      if (this._ding) { try { this._ding.pause(); } catch (e) {} }
    }
  };

  // 導覽結束時要換回的畫面狀態：導覽中才出現的欄位清成 undefined，其餘換回導覽前的值。
  function restoreState(saved, current) {
    const out = {};
    Object.keys(current || {}).forEach(k => { if (!(k in saved)) out[k] = undefined; });
    return Object.assign(out, saved);
  }

  function install(inst, opts) {
    Object.keys(M).forEach(k => { inst[k] = M[k]; });
    inst._shellOpts = Object.assign({ fabDelay: 350 }, opts);
  }

  window.HYSHELL = { install, restoreState, METHODS: Object.keys(M) };
})();
