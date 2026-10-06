/* @ds-bundle: {"format":4,"namespace":"HuanYinDesignSystem_d6f86f","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"BracketSlot","sourcePath":"components/core/BracketSlot.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"SpotStage","sourcePath":"components/core/SpotStage.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"6006df005bcf","components/core/BracketSlot.jsx":"4917c7a9c324","components/core/Button.jsx":"5a8b4b2ae7ae","components/core/Card.jsx":"05cf1da5f56d","components/core/Icon.jsx":"67c70ee24657","components/core/SpotStage.jsx":"6db5870cb7e3","components/core/Tag.jsx":"3811325dcc9d","components/feedback/Alert.jsx":"d7a91c92b8cf","components/forms/Checkbox.jsx":"03868e6a0256","components/forms/Input.jsx":"fa11f0eaf446","components/forms/Select.jsx":"5130fd789be4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HuanYinDesignSystem_d6f86f = window.HuanYinDesignSystem_d6f86f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Status marker: 已上架 / 售完 / 新增. Squarer and heavier than Tag — state, not category. */
function Badge({
  children,
  tone = 'neutral',
  style,
  ...rest
}) {
  const tones = {
    neutral: {
      fg: 'var(--body)',
      bg: 'var(--surface-bone)'
    },
    success: {
      fg: 'var(--success-deep)',
      bg: 'var(--success-tint)'
    },
    danger: {
      fg: 'var(--on-dark)',
      bg: 'var(--danger)'
    },
    primary: {
      fg: 'var(--on-dark)',
      bg: 'var(--primary)'
    },
    accent: {
      fg: 'var(--ink)',
      bg: 'var(--accent)'
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-block',
      padding: '3px 8px',
      color: t.fg,
      background: t.bg,
      borderRadius: 'var(--radius-xs)',
      font: 'var(--type-label)',
      fontSize: 'var(--text-2xs)',
      letterSpacing: '0.12em',
      whiteSpace: 'nowrap',
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/BracketSlot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** 〔　〕 placeholder slot. The brand's own convention for unfilled facts
 *  (日期、票價、課程細節) on draft posters and pages — replace before publishing. */
function BracketSlot({
  children,
  tone = 'mute',
  style,
  ...rest
}) {
  const fg = tone === 'onDark' ? 'var(--on-dark-mute)' : tone === 'accent' ? 'var(--accent-deep)' : 'var(--mute)';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      color: fg,
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      ...style
    }
  }), "\u3014", children || '\u3000', "\u3015");
}
Object.assign(__ds_scope, { BracketSlot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/BracketSlot.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  primary: {
    bg: 'var(--primary)',
    hover: 'var(--primary-deep)',
    fg: 'var(--on-dark)',
    border: 'transparent'
  },
  secondary: {
    bg: 'var(--secondary)',
    hover: 'var(--secondary-deep)',
    fg: 'var(--on-dark)',
    border: 'transparent'
  },
  accent: {
    bg: 'var(--accent)',
    hover: 'var(--accent-deep)',
    fg: 'var(--ink)',
    border: 'transparent'
  },
  danger: {
    bg: 'var(--danger)',
    hover: 'var(--danger-deep)',
    fg: 'var(--on-dark)',
    border: 'transparent'
  },
  outline: {
    bg: 'transparent',
    hover: 'var(--surface-bone)',
    fg: 'var(--primary)',
    border: 'var(--primary)'
  },
  ghost: {
    bg: 'transparent',
    hover: 'var(--surface-bone)',
    fg: 'var(--body)',
    border: 'transparent'
  },
  onDark: {
    bg: 'transparent',
    hover: 'rgba(250,246,239,0.10)',
    fg: 'var(--on-dark)',
    border: 'var(--border-on-dark)'
  }
};
const SIZES = {
  sm: {
    padding: '6px 14px',
    fontSize: 'var(--text-xs)',
    gap: 'var(--space-3)'
  },
  md: {
    padding: '10px 20px',
    fontSize: 'var(--text-sm)',
    gap: 'var(--space-4)'
  },
  lg: {
    padding: '14px 28px',
    fontSize: 'var(--text-base)',
    gap: 'var(--space-5)'
  }
};
function Button({
  children,
  tone = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  as = 'button',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const t = TONES[tone] || TONES.primary;
  const s = SIZES[size] || SIZES.md;
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({}, rest, {
    disabled: as === 'button' ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: block ? 'flex' : 'inline-flex',
      width: block ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      padding: s.padding,
      fontFamily: 'var(--font-ui)',
      fontSize: s.fontSize,
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1.2,
      letterSpacing: '0.02em',
      color: t.fg,
      background: hover && !disabled ? t.hover : t.bg,
      border: '1px solid ' + t.border,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      textDecoration: 'none',
      transform: press && !disabled ? 'var(--lift-press)' : 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }), iconLeft, /*#__PURE__*/React.createElement("span", null, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Paper card: white on canvas, hairline border, 4px radius, no shadow at rest.
 *  cover: a flat colour block (課程封面色塊) or any node. */
function Card({
  children,
  cover = null,
  coverTone = 'primary',
  coverHeight = 160,
  interactive = false,
  padding = 'var(--space-8)',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const coverBg = coverTone === 'primary' ? 'var(--primary)' : coverTone === 'secondary' ? 'var(--secondary)' : coverTone === 'dark' ? 'var(--surface-dark)' : coverTone === 'bone' ? 'var(--surface-bone)' : 'var(--accent)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    onMouseEnter: interactive ? () => setHover(true) : undefined,
    onMouseLeave: interactive ? () => setHover(false) : undefined,
    style: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      border: 'var(--rule-hairline)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      boxShadow: interactive && hover ? 'var(--shadow-md)' : 'var(--shadow-none)',
      transform: interactive && hover ? 'translateY(-2px)' : 'none',
      transition: 'box-shadow var(--duration-base) var(--ease-out),transform var(--duration-base) var(--ease-out)',
      ...style
    }
  }), cover !== null && /*#__PURE__*/React.createElement("div", {
    style: {
      height: coverHeight,
      background: coverBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, cover), /*#__PURE__*/React.createElement("div", {
    style: {
      padding,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)'
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Lucide icon rendered as a tintable CSS mask. Lucide is a documented SUBSTITUTION —
 *  the brand source shipped no icon set. 1.5px stroke, 20px default, currentColor. */
const BASE = 'https://unpkg.com/lucide-static@0.436.0/icons/';
function Icon({
  name = 'music-2',
  size = 20,
  color = 'currentColor',
  label,
  style,
  ...rest
}) {
  const url = BASE + name + '.svg';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    role: label ? 'img' : undefined,
    "aria-label": label || undefined,
    "aria-hidden": label ? undefined : 'true',
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      flexShrink: 0,
      backgroundColor: color,
      WebkitMaskImage: 'url(' + url + ')',
      maskImage: 'url(' + url + ')',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/SpotStage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Flat dark panel — the stage/night surface. No gradient, no glow: a plain colour field,
 *  matching the source deck's own flat backgrounds. */
function SpotStage({
  children,
  tone = 'dark',
  minHeight = 320,
  radius = 'var(--radius-sm)',
  style,
  ...rest
}) {
  const bg = tone === 'deep' ? 'var(--surface-deep)' : tone === 'primary' ? 'var(--primary)' : tone === 'secondary' ? 'var(--secondary)' : 'var(--surface-dark)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: 'relative',
      minHeight,
      background: bg,
      color: 'var(--on-dark)',
      borderRadius: radius,
      overflow: 'hidden',
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { SpotStage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SpotStage.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Signature-colour content label: 曲目難度 / Capo / 指彈 / 場次. Pill, hairline, no fill by default. */
function Tag({
  children,
  tone = 'accent',
  mono = false,
  size = 'md',
  style,
  ...rest
}) {
  const tones = {
    accent: {
      fg: 'var(--accent-deep)',
      border: 'rgba(201,138,42,0.55)',
      bg: 'transparent'
    },
    primary: {
      fg: 'var(--primary)',
      border: 'rgba(217,119,6,0.35)',
      bg: 'transparent'
    },
    secondary: {
      fg: 'var(--secondary)',
      border: 'rgba(194,65,12,0.35)',
      bg: 'transparent'
    },
    neutral: {
      fg: 'var(--mute)',
      border: 'var(--hairline)',
      bg: 'transparent'
    },
    solid: {
      fg: 'var(--ink)',
      border: 'transparent',
      bg: 'var(--accent)'
    },
    onDark: {
      fg: 'var(--on-dark-mute)',
      border: 'var(--border-on-dark)',
      bg: 'transparent'
    }
  };
  const t = tones[tone] || tones.accent;
  const pad = size === 'sm' ? '3px 8px' : '5px 12px';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: pad,
      color: t.fg,
      background: t.bg,
      border: '1px solid ' + t.border,
      borderRadius: 'var(--radius-pill)',
      font: mono ? 'var(--type-mono)' : 'var(--type-label)',
      fontSize: size === 'sm' ? 'var(--text-2xs)' : 'var(--text-xs)',
      letterSpacing: mono ? 'var(--tracking-mono)' : '0.1em',
      whiteSpace: 'nowrap',
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Transaction feedback. Only success and danger exist — the brand deliberately has no
 *  warning or info colour (see uploads/HuanYin Design.md). */
function Alert({
  tone = 'success',
  title,
  children,
  icon = true,
  style,
  ...rest
}) {
  const map = {
    success: {
      fg: 'var(--success-deep)',
      bg: 'var(--success-tint)',
      border: 'rgba(44,122,123,0.35)',
      glyph: 'check-circle'
    },
    danger: {
      fg: 'var(--danger-deep)',
      bg: '#f6e3e0',
      border: 'rgba(166,54,54,0.30)',
      glyph: 'alert-circle'
    }
  };
  const t = map[tone] || map.success;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: tone === 'danger' ? 'alert' : 'status',
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      padding: 'var(--space-6) var(--space-7)',
      background: t.bg,
      border: '1px solid ' + t.border,
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-body)',
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.glyph,
    size: 18,
    color: t.fg,
    style: {
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      font: 'var(--type-h3)',
      fontSize: 'var(--text-base)',
      color: t.fg
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-small)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const boxId = id || 'cb-' + React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: boxId,
    style: {
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: 'var(--space-5)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      font: 'var(--type-body)',
      color: 'var(--text-body)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    id: boxId,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  })), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 18,
      height: 18,
      marginTop: 3,
      flexShrink: 0,
      display: 'grid',
      placeItems: 'center',
      background: checked ? 'var(--primary)' : 'var(--surface-card)',
      border: '1px solid ' + (checked ? 'var(--primary)' : 'var(--border-strong)'),
      borderRadius: 'var(--radius-xs)',
      transition: 'var(--transition-control)'
    }
  }, checked && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    color: "var(--on-dark)"
  })), /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  id,
  type = 'text',
  mono = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || 'in-' + React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-mute)',
      textTransform: 'uppercase'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    id: inputId,
    type: type,
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      font: mono ? 'var(--type-mono)' : 'var(--type-body)',
      color: 'var(--text-strong)',
      background: 'var(--surface-card)',
      padding: '10px 12px',
      border: '1px solid ' + (error ? 'var(--danger)' : focus ? 'var(--secondary)' : 'var(--hairline)'),
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? 'var(--focus-ring)' : 'none',
      outline: 'none',
      transition: 'var(--transition-control)'
    }
  })), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-small)',
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--danger)' : 'var(--text-mute)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  options = [],
  value,
  onChange,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const selId = id || 'sel-' + React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selId,
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-mute)',
      textTransform: 'uppercase'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    id: selId,
    value: value,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      width: '100%',
      font: 'var(--type-body)',
      color: 'var(--text-strong)',
      background: 'var(--surface-card)',
      padding: '10px 38px 10px 12px',
      border: '1px solid ' + (focus ? 'var(--secondary)' : 'var(--hairline)'),
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? 'var(--focus-ring)' : 'none',
      outline: 'none',
      transition: 'var(--transition-control)'
    }
  }), options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16,
    color: "var(--text-mute)",
    style: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.BracketSlot = __ds_scope.BracketSlot;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.SpotStage = __ds_scope.SpotStage;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

})();
