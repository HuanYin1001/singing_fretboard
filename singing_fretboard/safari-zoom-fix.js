// Safari 縮放校正：Safari 量「有 zoom 的元素」位置時會偏掉，這裡改成跟 Chrome 一樣的畫面座標。
// 其他瀏覽器自動偵測為正常，不做任何事。上線版打包檔 <head> 裡是同一段。
(function () {
  const P = Element.prototype, nat = P.getBoundingClientRect;
  let cal = null;
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
