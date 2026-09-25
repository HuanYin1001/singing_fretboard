// 弦吟指板：兩個編輯器共用的「外殼」功能——左下導覽按鈕滑入與發光、訂閱信封搖晃、提示叮聲、⌘M 靜音、導覽結束還原畫面。
// 用法：在編輯器 constructor 裡 HYSHELL.install(this, { fabDelay: 350 })；componentWillUnmount 裡呼叫 this.shellCleanup()。
(function () {
  const M = {
    // 使用導覽按鈕：畫面顯示後滑入；第一次使用時慢慢呼吸發光，直到開始編輯或按下導覽。
    armFab() {
      if (this._fabArmed) return; this._fabArmed = true;
      this._fabT = setTimeout(() => { this.setState({ fabIn: true }); this._fabT2 = setTimeout(() => this.tourGlow(), 1500); this.subPulse(); }, this._shellOpts.fabDelay);
    },
    // 訂閱按鈕：每 60 秒信封放大搖晃一次（3 秒）；前景使用滿 20 分鐘響一聲輕叮，之後每 20 分鐘一次（兩頁共用計時）。⌘M／Ctrl+M 切換提示音。
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
        if (!(e.metaKey || e.ctrlKey) || e.altKey || e.code !== 'KeyM') return;
        e.preventDefault();
        if (e.shiftKey) { this.envShake(true, true); return; }
        const m = !this.subMuted();
        try { localStorage.setItem('hy-sub-mute', m ? '1' : '0'); } catch (er) {}
        clearTimeout(this._toastT);
        this.setState({ subToast: m ? '提示音已關閉' : '提示音已開啟' });
        this._toastT = setTimeout(() => this.setState({ subToast: '' }), 1600);
      };
      window.addEventListener('keydown', this._muteKey);
    },
    subBusy() { const s = this.state; return !!(s.tourOn || !s.fabIn || s.subOffer || s.intro); },
    subMuted() { try { return localStorage.getItem('hy-sub-mute') === '1'; } catch (e) { return false; } },
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
    tourGlow() {
      let seen = false; try { seen = localStorage.getItem('hy-tour-hinted') === '1'; } catch (e) {}
      if (seen || this._tgT) return;
      this.setState({ tourGlow: true });
      this._tgT = setInterval(() => this.setState(s => ({ tourGlow: !s.tourGlow })), 1200);
    },
    stopGlow() {
      if (this._tgT) { clearInterval(this._tgT); this._tgT = null; }
      try { localStorage.setItem('hy-tour-hinted', '1'); } catch (e) {}
      if (this.state.tourGlow) this.setState({ tourGlow: false });
    },
    // Tweaks「測試」用：清掉提示記憶，從頭播一次開場、按鈕滑入與發光。不碰使用者資料。
    replayHints() {
      try { localStorage.removeItem('hy-tour-hinted'); } catch (e) {}
      if (this._tgT) { clearInterval(this._tgT); this._tgT = null; }
      clearTimeout(this._introT); clearTimeout(this._fabT); clearTimeout(this._fabT2);
      this._fabArmed = false;
      this.setState({ fabIn: false, tourGlow: false, intro: true });
      this._introT = setTimeout(() => this.setState({ intro: false }), 5000);
    },
    // 畫面關閉時：停掉所有計時器、移除快捷鍵、停止叮聲。
    shellCleanup() {
      ['_spT', '_dingT', '_dingFade', '_tgT'].forEach(k => { if (this[k]) clearInterval(this[k]); this[k] = null; });
      ['_fabT', '_fabT2', '_envT', '_dingSndT', '_toastT', '_introT'].forEach(k => { if (this[k]) clearTimeout(this[k]); this[k] = null; });
      if (this._muteKey) { window.removeEventListener('keydown', this._muteKey); this._muteKey = null; }
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
