var x={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var j=Symbol.for("react.transitional.element"),u=Symbol.for("react.fragment");function l(a,t,r){var e=null;if(r!==void 0&&(e=""+r),t.key!==void 0&&(e=""+t.key),"key"in t){r={};for(var o in t)o!=="key"&&(r[o]=t[o])}else r=t;return t=r.ref,{$$typeof:j,type:a,key:e,ref:t!==void 0?t:null,props:r}}s.Fragment=u;s.jsx=l;s.jsxs=l;x.exports=s;var n=x.exports;const v=n.Fragment,E=n.jsx,_=n.jsxs,i=Object.freeze(Object.defineProperty({__proto__:null,Fragment:v,jsx:E,jsxs:_},Symbol.toStringTag,{value:"Module"}));export{_ as a,i as b,E as j};
