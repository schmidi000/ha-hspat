/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t=>t,s$1=t$1.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$2=`lit$${Math.random().toFixed(9).slice(2)}$`,n$1="?"+o$2,r$2=`<${n$1}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$2+x):s+o$2+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$2),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$2)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$2),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$1)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$2,t+1));)d.push({type:7,index:l}),t+=o$2.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.2");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer(()=>{customElements.define(t,e);}):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

/**
 * Run-Length Encoding for the 2D grid array.
 * Format: "<count>x<value>,<count>x<value>,..."
 * Example: [0,0,0,3] → "3x0,1x3"
 */
function encodeRLE(flat) {
    if (flat.length === 0)
        return '';
    const runs = [];
    let current = flat[0];
    let count = 1;
    for (let i = 1; i < flat.length; i++) {
        if (flat[i] === current) {
            count++;
        }
        else {
            runs.push(`${count}x${current}`);
            current = flat[i];
            count = 1;
        }
    }
    runs.push(`${count}x${current}`);
    return runs.join(',');
}
function decodeRLE(encoded) {
    if (encoded === '')
        return [];
    const result = [];
    const parts = encoded.split(',');
    for (const part of parts) {
        const sep = part.indexOf('x');
        const count = parseInt(part.slice(0, sep), 10);
        const value = parseInt(part.slice(sep + 1), 10);
        for (let i = 0; i < count; i++) {
            result.push(value);
        }
    }
    return result;
}
function flatten(grid) {
    const result = [];
    for (const row of grid) {
        for (const cell of row) {
            result.push(cell);
        }
    }
    return result;
}
function unflatten(flat, cols) {
    if (flat.length === 0)
        return [];
    const rows = [];
    for (let i = 0; i < flat.length; i += cols) {
        rows.push(flat.slice(i, i + cols));
    }
    return rows;
}

// ─── Traversal Costs ─────────────────────────────────────────────────────────
const BASE_COST = {
    [0 /* TileType.Open */]: 1,
    [1 /* TileType.Window */]: 10,
    [2 /* TileType.Door */]: 30,
    [3 /* TileType.Wall */]: 9999, // impassable
    [6 /* TileType.Stair */]: 1, // base cost for stair tile itself; cross-floor penalty applied separately
};
const SENSOR_PENALTY = 100;
const OPEN_TILE_COST = 1;
const NOISE_FACTOR = 0.15; // ±15% per Monte Carlo iteration
const SIMULATION_ITERS = 150;
const LOW_BATTERY_PCT = 5;
/** Flat cost added when traversing a stair connection between floors. */
const STAIR_COST = 50;
// ─── Tile Colours (Canvas RGBA) ───────────────────────────────────────────────
const TILE_COLOURS = {
    [0 /* TileType.Open */]: 'rgba(0, 200, 0, 0.1)',
    [1 /* TileType.Window */]: 'rgba(0, 100, 255, 0.4)',
    [2 /* TileType.Door */]: 'rgba(255, 165, 0, 0.5)',
    [3 /* TileType.Wall */]: 'rgba(50, 50, 50, 1.0)',
    [4 /* TileType.Perimeter */]: 'rgba(255, 0, 0, 0.3)',
    [5 /* TileType.Valuable */]: 'rgba(255, 215, 0, 0.5)',
    [6 /* TileType.Stair */]: 'rgba(139, 92, 246, 0.75)', // purple
};
const COVERAGE_COLOUR = 'rgba(0, 255, 120, 0.3)';
// ─── Grid Defaults ────────────────────────────────────────────────────────────
const DEFAULT_GRID_COLS = 50;
const DEFAULT_GRID_ROWS = 50;
const DEFAULT_SHOW_GRID = true;

function getEntityState(hass, entity_id) {
    return hass.states[entity_id]?.state ?? 'unknown';
}
function takeSnapshot(hass, areaSensors, pointSensors) {
    const results = [];
    const sensors = [
        ...areaSensors,
        ...pointSensors,
    ];
    for (const sensor of sensors) {
        const state = getEntityState(hass, sensor.entity_id);
        let health = 'active';
        let reason;
        if (state === 'unavailable' || state === 'unknown') {
            health = 'offline';
            reason = state;
        }
        else if (sensor.battery_entity_id) {
            const battState = getEntityState(hass, sensor.battery_entity_id);
            if (battState === 'unavailable' || battState === 'unknown') {
                health = 'offline';
                reason = `battery ${battState}`;
            }
            else {
                const pct = parseFloat(battState);
                if (!isNaN(pct) && pct < LOW_BATTERY_PCT) {
                    health = 'offline';
                    reason = `battery ${pct}%`;
                }
            }
        }
        results.push({ sensor_id: sensor.id, health, reason });
    }
    return results;
}

/**
 * Build a traversal cost matrix from the semantic grid, applying live HA entity
 * states and sensor health to produce the runtime cost surface for pathfinding.
 *
 * Area sensor FOV costs are NOT applied here — they are added in shadowcast.ts
 * after the FOV computation.
 */
function buildCostMatrix(grid, hass, config, snapshots) {
    // 1. Initialise a new matrix from base tile costs (never mutate the grid)
    const matrix = grid.map(row => row.map(tile => BASE_COST[tile] ?? 9999));
    // 2. Apply point sensor dynamic modification
    for (const ps of config.point_sensors) {
        // Skip sensors that haven't been placed on the map yet
        if (ps.tile_x < 0 || ps.tile_y < 0)
            continue;
        const snap = snapshots.find(s => s.sensor_id === ps.id);
        const isOnline = snap?.health === 'active';
        const rawState = getEntityState(hass, ps.entity_id);
        if (rawState === 'on') {
            // Physically open door/window → treat as open space, no sensor benefit
            matrix[ps.tile_y][ps.tile_x] = OPEN_TILE_COST;
        }
        else if (rawState === 'off' && isOnline) {
            // Closed + sensor active → base cost + detection penalty
            matrix[ps.tile_y][ps.tile_x] += SENSOR_PENALTY;
        }
        // offline or unknown state → no change from base cost
    }
    return matrix;
}

/**
 * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
 * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
 */
const FRAC = 2.3283064365386963e-10; /* 2^-32 */
class RNG {
    constructor() {
        this._seed = 0;
        this._s0 = 0;
        this._s1 = 0;
        this._s2 = 0;
        this._c = 0;
    }
    getSeed() { return this._seed; }
    /**
     * Seed the number generator
     */
    setSeed(seed) {
        seed = (seed < 1 ? 1 / seed : seed);
        this._seed = seed;
        this._s0 = (seed >>> 0) * FRAC;
        seed = (seed * 69069 + 1) >>> 0;
        this._s1 = seed * FRAC;
        seed = (seed * 69069 + 1) >>> 0;
        this._s2 = seed * FRAC;
        this._c = 1;
        return this;
    }
    /**
     * @returns Pseudorandom value [0,1), uniformly distributed
     */
    getUniform() {
        let t = 2091639 * this._s0 + this._c * FRAC;
        this._s0 = this._s1;
        this._s1 = this._s2;
        this._c = t | 0;
        this._s2 = t - this._c;
        return this._s2;
    }
    /**
     * @param lowerBound The lower end of the range to return a value from, inclusive
     * @param upperBound The upper end of the range to return a value from, inclusive
     * @returns Pseudorandom value [lowerBound, upperBound], using ROT.RNG.getUniform() to distribute the value
     */
    getUniformInt(lowerBound, upperBound) {
        let max = Math.max(lowerBound, upperBound);
        let min = Math.min(lowerBound, upperBound);
        return Math.floor(this.getUniform() * (max - min + 1)) + min;
    }
    /**
     * @param mean Mean value
     * @param stddev Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
     * @returns A normally distributed pseudorandom value
     */
    getNormal(mean = 0, stddev = 1) {
        let u, v, r;
        do {
            u = 2 * this.getUniform() - 1;
            v = 2 * this.getUniform() - 1;
            r = u * u + v * v;
        } while (r > 1 || r == 0);
        let gauss = u * Math.sqrt(-2 * Math.log(r) / r);
        return mean + gauss * stddev;
    }
    /**
     * @returns Pseudorandom value [1,100] inclusive, uniformly distributed
     */
    getPercentage() {
        return 1 + Math.floor(this.getUniform() * 100);
    }
    /**
     * @returns Randomly picked item, null when length=0
     */
    getItem(array) {
        if (!array.length) {
            return null;
        }
        return array[Math.floor(this.getUniform() * array.length)];
    }
    /**
     * @returns New array with randomized items
     */
    shuffle(array) {
        let result = [];
        let clone = array.slice();
        while (clone.length) {
            let index = clone.indexOf(this.getItem(clone));
            result.push(clone.splice(index, 1)[0]);
        }
        return result;
    }
    /**
     * @param data key=whatever, value=weight (relative probability)
     * @returns whatever
     */
    getWeightedValue(data) {
        let total = 0;
        for (let id in data) {
            total += data[id];
        }
        let random = this.getUniform() * total;
        let id, part = 0;
        for (id in data) {
            part += data[id];
            if (random < part) {
                return id;
            }
        }
        // If by some floating-point annoyance we have
        // random >= total, just return the last id.
        return id;
    }
    /**
     * Get RNG state. Useful for storing the state and re-setting it via setState.
     * @returns Internal state
     */
    getState() { return [this._s0, this._s1, this._s2, this._c]; }
    /**
     * Set a previously retrieved state.
     */
    setState(state) {
        this._s0 = state[0];
        this._s1 = state[1];
        this._s2 = state[2];
        this._c = state[3];
        return this;
    }
    /**
     * Returns a cloned RNG
     */
    clone() {
        let clone = new RNG();
        return clone.setState(this.getState());
    }
}
new RNG().setSeed(Date.now());

/**
 * @class Abstract display backend module
 * @private
 */
class Backend {
    getContainer() { return null; }
    setOptions(options) { this._options = options; }
}

class Canvas extends Backend {
    constructor() {
        super();
        this._ctx = document.createElement("canvas").getContext("2d");
    }
    schedule(cb) { requestAnimationFrame(cb); }
    getContainer() { return this._ctx.canvas; }
    setOptions(opts) {
        super.setOptions(opts);
        const style = (opts.fontStyle ? `${opts.fontStyle} ` : ``);
        const font = `${style} ${opts.fontSize}px ${opts.fontFamily}`;
        this._ctx.font = font;
        this._updateSize();
        this._ctx.font = font;
        this._ctx.textAlign = "center";
        this._ctx.textBaseline = "middle";
    }
    clear() {
        const oldComposite = this._ctx.globalCompositeOperation;
        this._ctx.globalCompositeOperation = "copy";
        this._ctx.fillStyle = this._options.bg;
        this._ctx.fillRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
        this._ctx.globalCompositeOperation = oldComposite;
    }
    eventToPosition(x, y) {
        let canvas = this._ctx.canvas;
        let rect = canvas.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;
        x *= canvas.width / rect.width;
        y *= canvas.height / rect.height;
        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
            return [-1, -1];
        }
        return this._normalizedEventToPosition(x, y);
    }
}

/**
 * @class Rectangular backend
 * @private
 */
class Rect extends Canvas {
    constructor() {
        super();
        this._spacingX = 0;
        this._spacingY = 0;
        this._canvasCache = {};
    }
    setOptions(options) {
        super.setOptions(options);
        this._canvasCache = {};
    }
    draw(data, clearBefore) {
        if (Rect.cache) {
            this._drawWithCache(data);
        }
        else {
            this._drawNoCache(data, clearBefore);
        }
    }
    _drawWithCache(data) {
        let [x, y, ch, fg, bg] = data;
        let hash = "" + ch + fg + bg;
        let canvas;
        if (hash in this._canvasCache) {
            canvas = this._canvasCache[hash];
        }
        else {
            let b = this._options.border;
            canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            canvas.width = this._spacingX;
            canvas.height = this._spacingY;
            ctx.fillStyle = bg;
            ctx.fillRect(b, b, canvas.width - b, canvas.height - b);
            if (ch) {
                ctx.fillStyle = fg;
                ctx.font = this._ctx.font;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                let chars = [].concat(ch);
                for (let i = 0; i < chars.length; i++) {
                    ctx.fillText(chars[i], this._spacingX / 2, Math.ceil(this._spacingY / 2));
                }
            }
            this._canvasCache[hash] = canvas;
        }
        this._ctx.drawImage(canvas, x * this._spacingX, y * this._spacingY);
    }
    _drawNoCache(data, clearBefore) {
        let [x, y, ch, fg, bg] = data;
        if (clearBefore) {
            let b = this._options.border;
            this._ctx.fillStyle = bg;
            this._ctx.fillRect(x * this._spacingX + b, y * this._spacingY + b, this._spacingX - b, this._spacingY - b);
        }
        if (!ch) {
            return;
        }
        this._ctx.fillStyle = fg;
        let chars = [].concat(ch);
        for (let i = 0; i < chars.length; i++) {
            this._ctx.fillText(chars[i], (x + 0.5) * this._spacingX, Math.ceil((y + 0.5) * this._spacingY));
        }
    }
    computeSize(availWidth, availHeight) {
        let width = Math.floor(availWidth / this._spacingX);
        let height = Math.floor(availHeight / this._spacingY);
        return [width, height];
    }
    computeFontSize(availWidth, availHeight) {
        let boxWidth = Math.floor(availWidth / this._options.width);
        let boxHeight = Math.floor(availHeight / this._options.height);
        /* compute char ratio */
        let oldFont = this._ctx.font;
        this._ctx.font = "100px " + this._options.fontFamily;
        let width = Math.ceil(this._ctx.measureText("W").width);
        this._ctx.font = oldFont;
        let ratio = width / 100;
        let widthFraction = ratio * boxHeight / boxWidth;
        if (widthFraction > 1) { /* too wide with current aspect ratio */
            boxHeight = Math.floor(boxHeight / widthFraction);
        }
        return Math.floor(boxHeight / this._options.spacing);
    }
    _normalizedEventToPosition(x, y) {
        return [Math.floor(x / this._spacingX), Math.floor(y / this._spacingY)];
    }
    _updateSize() {
        const opts = this._options;
        const charWidth = Math.ceil(this._ctx.measureText("W").width);
        this._spacingX = Math.ceil(opts.spacing * charWidth);
        this._spacingY = Math.ceil(opts.spacing * opts.fontSize);
        if (opts.forceSquareRatio) {
            this._spacingX = this._spacingY = Math.max(this._spacingX, this._spacingY);
        }
        this._ctx.canvas.width = opts.width * this._spacingX;
        this._ctx.canvas.height = opts.height * this._spacingY;
    }
}
Rect.cache = false;

/** Default with for display and map generators */
const DIRS = {
    4: [[0, -1], [1, 0], [0, 1], [-1, 0]],
    8: [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
    6: [[-1, -1], [1, -1], [2, 0], [1, 1], [-1, 1], [-2, 0]]
};

class FOV {
    /**
     * @class Abstract FOV algorithm
     * @param {function} lightPassesCallback Does the light pass through x,y?
     * @param {object} [options]
     * @param {int} [options.topology=8] 4/6/8
     */
    constructor(lightPassesCallback, options = {}) {
        this._lightPasses = lightPassesCallback;
        this._options = Object.assign({ topology: 8 }, options);
    }
    /**
     * Return all neighbors in a concentric ring
     * @param {int} cx center-x
     * @param {int} cy center-y
     * @param {int} r range
     */
    _getCircle(cx, cy, r) {
        let result = [];
        let dirs, countFactor, startOffset;
        switch (this._options.topology) {
            case 4:
                countFactor = 1;
                startOffset = [0, 1];
                dirs = [
                    DIRS[8][7],
                    DIRS[8][1],
                    DIRS[8][3],
                    DIRS[8][5]
                ];
                break;
            case 6:
                dirs = DIRS[6];
                countFactor = 1;
                startOffset = [-1, 1];
                break;
            case 8:
                dirs = DIRS[4];
                countFactor = 2;
                startOffset = [-1, 1];
                break;
            default:
                throw new Error("Incorrect topology for FOV computation");
        }
        /* starting neighbor */
        let x = cx + startOffset[0] * r;
        let y = cy + startOffset[1] * r;
        /* circle */
        for (let i = 0; i < dirs.length; i++) {
            for (let j = 0; j < r * countFactor; j++) {
                result.push([x, y]);
                x += dirs[i][0];
                y += dirs[i][1];
            }
        }
        return result;
    }
}

/**
 * @class Precise shadowcasting algorithm
 * @augments ROT.FOV
 */
class PreciseShadowcasting extends FOV {
    compute(x, y, R, callback) {
        /* this place is always visible */
        callback(x, y, 0, 1);
        /* standing in a dark place. FIXME is this a good idea?  */
        if (!this._lightPasses(x, y)) {
            return;
        }
        /* list of all shadows */
        let SHADOWS = [];
        let cx, cy, blocks, A1, A2, visibility;
        /* analyze surrounding cells in concentric rings, starting from the center */
        for (let r = 1; r <= R; r++) {
            let neighbors = this._getCircle(x, y, r);
            let neighborCount = neighbors.length;
            for (let i = 0; i < neighborCount; i++) {
                cx = neighbors[i][0];
                cy = neighbors[i][1];
                /* shift half-an-angle backwards to maintain consistency of 0-th cells */
                A1 = [i ? 2 * i - 1 : 2 * neighborCount - 1, 2 * neighborCount];
                A2 = [2 * i + 1, 2 * neighborCount];
                blocks = !this._lightPasses(cx, cy);
                visibility = this._checkVisibility(A1, A2, blocks, SHADOWS);
                if (visibility) {
                    callback(cx, cy, r, visibility);
                }
                if (SHADOWS.length == 2 && SHADOWS[0][0] == 0 && SHADOWS[1][0] == SHADOWS[1][1]) {
                    return;
                } /* cutoff? */
            } /* for all cells in this ring */
        } /* for all rings */
    }
    /**
     * @param {int[2]} A1 arc start
     * @param {int[2]} A2 arc end
     * @param {bool} blocks Does current arc block visibility?
     * @param {int[][]} SHADOWS list of active shadows
     */
    _checkVisibility(A1, A2, blocks, SHADOWS) {
        if (A1[0] > A2[0]) { /* split into two sub-arcs */
            let v1 = this._checkVisibility(A1, [A1[1], A1[1]], blocks, SHADOWS);
            let v2 = this._checkVisibility([0, 1], A2, blocks, SHADOWS);
            return (v1 + v2) / 2;
        }
        /* index1: first shadow >= A1 */
        let index1 = 0, edge1 = false;
        while (index1 < SHADOWS.length) {
            let old = SHADOWS[index1];
            let diff = old[0] * A1[1] - A1[0] * old[1];
            if (diff >= 0) { /* old >= A1 */
                if (diff == 0 && !(index1 % 2)) {
                    edge1 = true;
                }
                break;
            }
            index1++;
        }
        /* index2: last shadow <= A2 */
        let index2 = SHADOWS.length, edge2 = false;
        while (index2--) {
            let old = SHADOWS[index2];
            let diff = A2[0] * old[1] - old[0] * A2[1];
            if (diff >= 0) { /* old <= A2 */
                if (diff == 0 && (index2 % 2)) {
                    edge2 = true;
                }
                break;
            }
        }
        let visible = true;
        if (index1 == index2 && (edge1 || edge2)) { /* subset of existing shadow, one of the edges match */
            visible = false;
        }
        else if (edge1 && edge2 && index1 + 1 == index2 && (index2 % 2)) { /* completely equivalent with existing shadow */
            visible = false;
        }
        else if (index1 > index2 && (index1 % 2)) { /* subset of existing shadow, not touching */
            visible = false;
        }
        if (!visible) {
            return 0;
        } /* fast case: not visible */
        let visibleLength;
        /* compute the length of visible arc, adjust list of shadows (if blocking) */
        let remove = index2 - index1 + 1;
        if (remove % 2) {
            if (index1 % 2) { /* first edge within existing shadow, second outside */
                let P = SHADOWS[index1];
                visibleLength = (A2[0] * P[1] - P[0] * A2[1]) / (P[1] * A2[1]);
                if (blocks) {
                    SHADOWS.splice(index1, remove, A2);
                }
            }
            else { /* second edge within existing shadow, first outside */
                let P = SHADOWS[index2];
                visibleLength = (P[0] * A1[1] - A1[0] * P[1]) / (A1[1] * P[1]);
                if (blocks) {
                    SHADOWS.splice(index1, remove, A1);
                }
            }
        }
        else {
            if (index1 % 2) { /* both edges within existing shadows */
                let P1 = SHADOWS[index1];
                let P2 = SHADOWS[index2];
                visibleLength = (P2[0] * P1[1] - P1[0] * P2[1]) / (P1[1] * P2[1]);
                if (blocks) {
                    SHADOWS.splice(index1, remove);
                }
            }
            else { /* both edges outside existing shadows */
                if (blocks) {
                    SHADOWS.splice(index1, remove, A1, A2);
                }
                return 1; /* whole arc visible! */
            }
        }
        let arcLength = (A2[0] * A1[1] - A1[0] * A2[1]) / (A1[1] * A2[1]);
        return visibleLength / arcLength;
    }
}

var index = { PreciseShadowcasting};

/**
 * Compute directional FOV for a single area sensor.
 *
 * Uses rot.js PreciseShadowcasting for 360° sweep, then applies a post-processing
 * directional mask to restrict to the sensor's configured cone.
 *
 * Angle convention: 0° = East (right), 90° = South (down) — matches Math.atan2
 * with canvas y-axis increasing downward.
 */
function computeSensorFov(grid, sensor) {
    const visibleTiles = [];
    const lightPasses = (x, y) => {
        const tile = grid[y]?.[x] ?? 3 /* TileType.Wall */;
        return tile === 0 /* TileType.Open */ || tile === 1 /* TileType.Window */ || tile === 6 /* TileType.Stair */;
    };
    const fov = new index.PreciseShadowcasting(lightPasses);
    fov.compute(sensor.grid_x, sensor.grid_y, sensor.max_range, (x, y, _r, _visibility) => {
        // Post-processing directional mask
        const dx = x - sensor.grid_x;
        const dy = y - sensor.grid_y;
        // Skip sensor's own tile — it's always "visible" but not part of FOV cone
        if (dx === 0 && dy === 0)
            return;
        const angleDeg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        const facing = (sensor.facing_angle + 360) % 360;
        const half = sensor.fov_angle / 2;
        // Modular angular distance — handles wraparound at 0°/360°
        let diff = Math.abs(angleDeg - facing);
        if (diff > 180)
            diff = 360 - diff;
        if (diff <= half) {
            visibleTiles.push({ x, y });
        }
    });
    return visibleTiles;
}
/**
 * Compute the union of FOV tiles for all active area sensors.
 * Returns a Set of "x,y" string keys.
 */
function computeAllFov(grid, sensors, snapshots) {
    const coverage = new Set();
    for (const sensor of sensors) {
        // Skip sensors that haven't been placed on the map yet
        if (sensor.grid_x < 0 || sensor.grid_y < 0)
            continue;
        const snap = snapshots.find(s => s.sensor_id === sensor.id);
        if (snap?.health !== 'active')
            continue;
        for (const tile of computeSensorFov(grid, sensor)) {
            coverage.add(`${tile.x},${tile.y}`);
        }
    }
    return coverage;
}
/**
 * Add point sensor tile positions to the coverage set.
 * A placed, active point sensor "covers" its own tile (the door or window it monitors).
 */
function addPointSensorCoverage(sensors, snapshots, coverage) {
    for (const ps of sensors) {
        if (ps.tile_x < 0 || ps.tile_y < 0)
            continue;
        const snap = snapshots.find(s => s.sensor_id === ps.id);
        if (snap?.health !== 'active')
            continue;
        coverage.add(`${ps.tile_x},${ps.tile_y}`);
    }
}
/**
 * Apply area sensor traversal cost penalties to the cost matrix in-place.
 * Must be called AFTER buildCostMatrix (Phase 6) and AFTER computeAllFov.
 */
function applyAreaSensorCosts(matrix, grid, sensors, snapshots) {
    for (const sensor of sensors) {
        // Skip sensors that haven't been placed on the map yet
        if (sensor.grid_x < 0 || sensor.grid_y < 0)
            continue;
        const snap = snapshots.find(s => s.sensor_id === sensor.id);
        if (snap?.health !== 'active')
            continue;
        for (const tile of computeSensorFov(grid, sensor)) {
            matrix[tile.y][tile.x] += SENSOR_PENALTY;
        }
    }
}

/**
 * Compute a CSS rgba colour for a normalised heatmap value t ∈ [0, 1].
 * Interpolates from yellow (low) to dark red (high).
 * Fixed alpha of 0.55 for overlay readability.
 */
function heatColour(t) {
    const clamped = Math.max(0, Math.min(1, t));
    // Yellow: (255, 255, 0) → Orange: (255, 128, 0) → Dark red: (139, 0, 0)
    let r, g, b;
    if (clamped <= 0.5) {
        // Yellow → Orange
        const s = clamped / 0.5;
        r = 255;
        g = Math.round(255 - s * (255 - 128));
        b = 0;
    }
    else {
        // Orange → Dark red
        const s = (clamped - 0.5) / 0.5;
        r = Math.round(255 - s * (255 - 139));
        g = Math.round(128 - s * 128);
        b = 0;
    }
    return `rgba(${r},${g},${b},0.55)`;
}
/**
 * Generate neutral, non-alarmist insight strings from coverage and heatmap data.
 * Detects blind spots: high-traffic tiles that are not covered by any sensor.
 *
 * Returns an empty array when no heatmap data is available.
 */
function generateInsights(coverageTiles, heatmap) {
    if (heatmap.size === 0)
        return [];
    const insights = [
        'Simulated Intrusion Path heatmap is displayed on the map above.',
    ];
    const maxCount = Math.max(...heatmap.values());
    const threshold = maxCount * 0.5;
    // High-traffic tiles that lie outside sensor coverage
    const blindSpots = [...heatmap.entries()]
        .filter(([key, count]) => count >= threshold && !coverageTiles.has(key))
        .map(([key]) => key);
    if (blindSpots.length > 0) {
        insights.push(`${blindSpots.length} high-traffic area${blindSpots.length === 1 ? '' : 's'} ` +
            `appear unmonitored — consider reviewing sensor placement in these zones.`);
    }
    return insights;
}

/**
 * Convert a canvas pixel coordinate to a grid tile index.
 * Clamps to valid tile range.
 */
function pixelToTile(pixelX, pixelY, canvasWidth, canvasHeight, gridCols, gridRows) {
    const rawX = Math.floor((pixelX / canvasWidth) * gridCols);
    const rawY = Math.floor((pixelY / canvasHeight) * gridRows);
    return {
        x: Math.max(0, Math.min(gridCols - 1, rawX)),
        y: Math.max(0, Math.min(gridRows - 1, rawY)),
    };
}
/**
 * Normalise a raw heatmap (count values) to [0, 1].
 * If only one unique value exists, it is mapped to 1.
 */
function normalisedHeatmap(heatmap) {
    if (heatmap.size === 0)
        return new Map();
    const max = Math.max(...heatmap.values());
    if (max === 0)
        return new Map([...heatmap].map(([k]) => [k, 0]));
    return new Map([...heatmap].map(([k, v]) => [k, v / max]));
}
/**
 * Paint the full grid canvas:
 *  1. Clear
 *  2. Floorplan image (if available)
 *  3. Non-wall tiles first pass
 *  4. Perimeter / Valuable overlays (skip on wall tiles)
 *  5. Coverage overlay
 *  6. Heatmap overlay
 *  7. Wall tiles second pass (on top)
 *  8. Grid lines (optional)
 *  9. Stair glyphs
 * 10. Sensor markers + hover highlight
 * 11. Placement cursor (when placing a sensor)
 */
function paintGrid(ctx, config, grid, coverageTiles, heatmap, floorplanImg, placing = null, showGrid = true, hoverTile = null) {
    const { grid_cols, grid_rows } = config;
    const { width, height } = ctx.canvas;
    const tileW = width / grid_cols;
    const tileH = height / grid_rows;
    ctx.clearRect(0, 0, width, height);
    // 1. Floorplan background
    if (floorplanImg?.complete) {
        ctx.globalAlpha = 0.6;
        ctx.drawImage(floorplanImg, 0, 0, width, height);
        ctx.globalAlpha = 1;
    }
    // 2. Non-wall tiles (first pass)
    for (let row = 0; row < grid_rows; row++) {
        for (let col = 0; col < grid_cols; col++) {
            const tile = grid[row]?.[col] ?? 3 /* TileType.Wall */;
            if (tile === 3 /* TileType.Wall */)
                continue;
            ctx.fillStyle = TILE_COLOURS[tile] ?? 'rgba(0,200,0,0.1)';
            ctx.fillRect(col * tileW, row * tileH, tileW, tileH);
        }
    }
    // 3. Perimeter / Valuable config overlays (skip on wall tiles)
    for (const t of config.perimeter ?? []) {
        if ((grid[t.y]?.[t.x] ?? 3 /* TileType.Wall */) === 3 /* TileType.Wall */)
            continue;
        ctx.fillStyle = TILE_COLOURS[4 /* TileType.Perimeter */];
        ctx.fillRect(t.x * tileW, t.y * tileH, tileW, tileH);
        ctx.strokeStyle = 'rgba(255,0,0,0.8)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(t.x * tileW + 1, t.y * tileH + 1, tileW - 2, tileH - 2);
    }
    for (const t of config.valuables ?? []) {
        if ((grid[t.y]?.[t.x] ?? 3 /* TileType.Wall */) === 3 /* TileType.Wall */)
            continue;
        ctx.fillStyle = TILE_COLOURS[5 /* TileType.Valuable */];
        ctx.fillRect(t.x * tileW, t.y * tileH, tileW, tileH);
        ctx.strokeStyle = 'rgba(255,180,0,0.9)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(t.x * tileW + 1, t.y * tileH + 1, tileW - 2, tileH - 2);
    }
    // 4. Coverage overlay
    if (coverageTiles.size > 0) {
        ctx.fillStyle = COVERAGE_COLOUR;
        for (const key of coverageTiles) {
            const [xs, ys] = key.split(',');
            const x = parseInt(xs, 10);
            const y = parseInt(ys, 10);
            ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
        }
    }
    // 5. Heatmap overlay
    if (heatmap.size > 0) {
        const normed = normalisedHeatmap(heatmap);
        for (const [key, t] of normed) {
            const [xs, ys] = key.split(',');
            const x = parseInt(xs, 10);
            const y = parseInt(ys, 10);
            ctx.fillStyle = heatColour(t);
            ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
        }
    }
    // 6. Wall tiles (second pass — drawn on top for full opacity)
    for (let row = 0; row < grid_rows; row++) {
        for (let col = 0; col < grid_cols; col++) {
            const tile = grid[row]?.[col] ?? 3 /* TileType.Wall */;
            if (tile !== 3 /* TileType.Wall */)
                continue;
            ctx.fillStyle = TILE_COLOURS[3 /* TileType.Wall */];
            ctx.fillRect(col * tileW, row * tileH, tileW, tileH);
        }
    }
    // 7. Grid lines (optional)
    if (showGrid) {
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;
        for (let col = 0; col <= grid_cols; col++) {
            ctx.beginPath();
            ctx.moveTo(col * tileW, 0);
            ctx.lineTo(col * tileW, height);
            ctx.stroke();
        }
        for (let row = 0; row <= grid_rows; row++) {
            ctx.beginPath();
            ctx.moveTo(0, row * tileH);
            ctx.lineTo(width, row * tileH);
            ctx.stroke();
        }
    }
    // 8. Stair glyphs
    {
        const fontSize = Math.max(8, Math.min(tileW, tileH) * 0.65);
        ctx.save();
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        for (let row = 0; row < grid_rows; row++) {
            for (let col = 0; col < grid_cols; col++) {
                if ((grid[row]?.[col] ?? -1) === 6 /* TileType.Stair */) {
                    ctx.fillText('\u2195', (col + 0.5) * tileW, (row + 0.5) * tileH);
                }
            }
        }
        ctx.restore();
    }
    // 9. Sensor markers
    const r = Math.min(tileW, tileH) * 0.38;
    for (const s of config.area_sensors ?? []) {
        if (s.grid_x < 0 || s.grid_y < 0)
            continue;
        const cx = (s.grid_x + 0.5) * tileW;
        const cy = (s.grid_y + 0.5) * tileH;
        const isHovered = hoverTile?.x === s.grid_x && hoverTile?.y === s.grid_y;
        ctx.fillStyle = placing?.id === s.id ? 'rgba(0,220,255,0.6)' : 'rgba(0,180,255,0.85)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (isHovered) {
            ctx.strokeStyle = 'rgba(255,80,80,0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    for (const s of config.point_sensors ?? []) {
        if (s.tile_x < 0 || s.tile_y < 0)
            continue;
        const cx = (s.tile_x + 0.5) * tileW;
        const cy = (s.tile_y + 0.5) * tileH;
        const isHovered = hoverTile?.x === s.tile_x && hoverTile?.y === s.tile_y;
        ctx.fillStyle = placing?.id === s.id ? 'rgba(255,160,0,0.6)' : 'rgba(255,100,0,0.85)';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (isHovered) {
            ctx.strokeStyle = 'rgba(255,80,80,0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.8 + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    // 10. Placement cursor hint
    if (placing) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(12, tileH * 1.2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Click to place sensor', width / 2, height / 2);
    }
}

/**
 * Migrate a legacy single-floor HspatConfig to the multi-floor format.
 *
 * - If `floors` is already present the config is returned as-is (idempotent).
 * - Sensors whose `floor_id` is unset are stamped with the root floor's id.
 * - The original config object is never mutated.
 */
function migrateToMultiFloor(config) {
    if (config.floors && config.floors.length > 0) {
        // Already multi-floor — only backfill floor_id on sensors that lack one
        return backfillFloorIds(config);
    }
    const floorId = 'floor-0';
    const area_sensors = (config.area_sensors ?? []).map(s => ({
        ...s,
        floor_id: s.floor_id ?? floorId,
    }));
    const point_sensors = (config.point_sensors ?? []).map(s => ({
        ...s,
        floor_id: s.floor_id ?? floorId,
    }));
    const valuables = (config.valuables ?? []).map(v => ({
        ...v,
        floor_id: v.floor_id ?? floorId,
    }));
    const perimeter = (config.perimeter ?? []).map(p => ({
        ...p,
        floor_id: p.floor_id ?? floorId,
    }));
    const floor = {
        id: floorId,
        name: 'Ground Floor',
        grid_cols: config.grid_cols ?? DEFAULT_GRID_COLS,
        grid_rows: config.grid_rows ?? DEFAULT_GRID_ROWS,
        grid_rle: config.grid_rle ?? '',
        floorplan_url: config.floorplan_url,
        area_sensors,
        point_sensors,
        valuables,
        perimeter,
        stair_tiles: [],
        svg_shapes: [],
    };
    return {
        ...config,
        floors: [floor],
        active_floor_id: floorId,
        // Keep legacy flat fields intact for backward compatibility with HA YAML
        area_sensors,
        point_sensors,
        valuables,
        perimeter,
    };
}
/** Stamp floor_id onto sensors that are missing it, without adding new floors. */
function backfillFloorIds(config) {
    if (!config.floors)
        return config;
    const firstFloorId = config.floors[0]?.id ?? 'floor-0';
    const floors = config.floors.map(floor => ({
        ...floor,
        area_sensors: floor.area_sensors.map(s => ({
            ...s,
            floor_id: s.floor_id ?? floor.id,
        })),
        point_sensors: floor.point_sensors.map(s => ({
            ...s,
            floor_id: s.floor_id ?? floor.id,
        })),
        valuables: floor.valuables.map(v => ({
            ...v,
            floor_id: v.floor_id ?? floor.id,
        })),
        perimeter: floor.perimeter.map(p => ({
            ...p,
            floor_id: p.floor_id ?? floor.id,
        })),
    }));
    return {
        ...config,
        floors,
        active_floor_id: config.active_floor_id ?? firstFloorId,
    };
}

/**
 * Generates a display label for a stair tile shown in dropdowns and lists.
 */
function stairLabel(stair, floor) {
    if (stair.name)
        return `${stair.name} (${floor.name})`;
    return `Stair at (${stair.tile_x}, ${stair.tile_y}) on ${floor.name}`;
}
/**
 * Build the reciprocal StairTile so that a stair connection is bi-directional.
 * Given stair A on floor `fromFloorId` pointing to floor B at (tx, ty),
 * returns a StairTile suitable for insertion into floor B's `stair_tiles`.
 */
function buildReciprocalStair(source, fromFloorId) {
    if (source.target_tile_x === undefined || source.target_tile_y === undefined) {
        throw new Error('buildReciprocalStair: source stair has no target coordinates');
    }
    return {
        tile_x: source.target_tile_x,
        tile_y: source.target_tile_y,
        name: source.name,
        target_floor_id: fromFloorId,
        target_tile_x: source.tile_x,
        target_tile_y: source.tile_y,
        traversal_cost: source.traversal_cost,
    };
}
/**
 * Upsert a stair tile into a floor's stair_tiles array.
 * Matches by tile position. Returns the updated array (immutable).
 */
function upsertStairTile(tiles, stair) {
    const idx = tiles.findIndex(s => s.tile_x === stair.tile_x && s.tile_y === stair.tile_y);
    return idx >= 0
        ? tiles.map((s, i) => (i === idx ? stair : s))
        : [...tiles, stair];
}

/**
 * Simple undo/redo manager for grid snapshots.
 * Maintains two stacks (undo and redo) with a maximum depth of 50.
 * Pushing a new snapshot clears the redo stack.
 */
class UndoManager {
    constructor() {
        this._undoStack = [];
        this._redoStack = [];
    }
    get canUndo() {
        return this._undoStack.length > 0;
    }
    get canRedo() {
        return this._redoStack.length > 0;
    }
    /** Push a snapshot before a grid-modifying action. Clears the redo stack. */
    push(snapshot) {
        this._undoStack = [
            ...this._undoStack.slice(-50 + 1),
            snapshot,
        ];
        this._redoStack = [];
    }
    /** Undo: pop from undo stack, push to redo stack, return the snapshot. */
    undo(currentSnapshot) {
        if (this._undoStack.length === 0)
            return null;
        const prev = this._undoStack[this._undoStack.length - 1];
        this._undoStack = this._undoStack.slice(0, -1);
        this._redoStack = [...this._redoStack, currentSnapshot];
        return prev;
    }
    /** Redo: pop from redo stack, push to undo stack, return the snapshot. */
    redo(currentSnapshot) {
        if (this._redoStack.length === 0)
            return null;
        const next = this._redoStack[this._redoStack.length - 1];
        this._redoStack = this._redoStack.slice(0, -1);
        this._undoStack = [...this._undoStack, currentSnapshot];
        return next;
    }
    /** Clear both stacks. */
    clear() {
        this._undoStack = [];
        this._redoStack = [];
    }
}

let DisclaimerModal = class DisclaimerModal extends i {
    _accept() {
        this.dispatchEvent(new CustomEvent('config-changed', {
            bubbles: true,
            composed: true,
            detail: { config: { ...this.config, disclaimer_accepted: true } },
        }));
    }
    render() {
        return b `
      <div class="modal">
        <h2>Home Security Posture &amp; Auditing Tool</h2>
        <p>
          This tool is for <strong>educational and planning purposes only</strong>.
          It provides a theoretical simulation of security coverage gaps based on your
          floor plan and sensor configuration.
        </p>
        <p>
          Results are <strong>not a guarantee</strong> of actual security performance.
          No real-time threat detection is performed. The simulated intrusion paths
          shown are theoretical illustrations to help identify potential coverage gaps.
        </p>
        <p>
          Always consult a qualified security professional for safety-critical decisions.
        </p>
        <button @click=${this._accept}>I Understand</button>
      </div>
    `;
    }
};
DisclaimerModal.styles = i$3 `
    :host {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      z-index: 100;
    }
    .modal {
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      padding: 24px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    h2 {
      margin: 0 0 12px;
      font-size: 1.1rem;
      color: var(--primary-text-color, #000);
    }
    p {
      font-size: 0.9rem;
      color: var(--secondary-text-color, #555);
      line-height: 1.5;
      margin: 0 0 16px;
    }
    button {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      font-size: 0.95rem;
      cursor: pointer;
      width: 100%;
    }
    button:hover { opacity: 0.9; }
  `;
__decorate([
    n({ attribute: false })
], DisclaimerModal.prototype, "config", void 0);
DisclaimerModal = __decorate([
    t('hspat-disclaimer-modal')
], DisclaimerModal);

let Toolbar = class Toolbar extends i {
    constructor() {
        super(...arguments);
        this.mode = 'setup';
        this.brush = 0 /* TileType.Open */;
        this.floors = [];
        this.activeFloorId = '';
        this.showGrid = true;
        this.canUndo = false;
        this.canRedo = false;
        this._modeLabels = {
            setup: '\u2699 Setup',
            paint: '\u270F Draw',
            hardware: '\uD83D\uDCE1 Sensors',
            audit: '\uD83D\uDEE1 Audit',
        };
    }
    _setMode(m) {
        this.mode = m;
        this.dispatchEvent(new CustomEvent('mode-change', { detail: m, bubbles: true, composed: true }));
    }
    _setBrush(b) {
        this.brush = b;
        this.dispatchEvent(new CustomEvent('brush-change', { detail: b, bubbles: true, composed: true }));
    }
    _switchFloor(id) {
        this.activeFloorId = id;
        this.dispatchEvent(new CustomEvent('floor-change', { detail: id, bubbles: true, composed: true }));
    }
    _addFloor() {
        this.dispatchEvent(new CustomEvent('floor-add', { bubbles: true, composed: true }));
    }
    _deleteFloor() {
        if (this.floors.length <= 1)
            return;
        this.dispatchEvent(new CustomEvent('floor-delete', { detail: this.activeFloorId, bubbles: true, composed: true }));
    }
    _toggleGrid() {
        const next = !this.showGrid;
        this.showGrid = next;
        this.dispatchEvent(new CustomEvent('grid-toggle', { detail: next, bubbles: true, composed: true }));
    }
    _undo() {
        this.dispatchEvent(new CustomEvent('undo-action', { bubbles: true, composed: true }));
    }
    _redo() {
        this.dispatchEvent(new CustomEvent('redo-action', { bubbles: true, composed: true }));
    }
    get _brushes() {
        return [
            { type: 0 /* TileType.Open */, label: 'Open', colour: 'rgba(0,160,0,0.7)', tip: 'Interior walkable space (e.g. rooms, corridors). Intruders can move freely through these tiles.' },
            { type: 3 /* TileType.Wall */, label: 'Wall', colour: 'rgba(50,50,50,0.85)', tip: 'Solid wall — impassable to intruders and blocks sensor line-of-sight.' },
            { type: 2 /* TileType.Door */, label: 'Door', colour: 'rgba(255,140,0,0.85)', tip: 'Door tile — a passage point that costs more to move through. Attach a door sensor here.' },
            { type: 1 /* TileType.Window */, label: 'Window', colour: 'rgba(0,100,255,0.75)', tip: 'Window tile — a breach point, easier to enter than a door. Attach a window sensor here.' },
            { type: 4 /* TileType.Perimeter */, label: 'Perimeter', colour: 'rgba(200,0,0,0.8)', tip: 'Exterior boundary tile — marks where an intruder could enter from outside (e.g. an exterior wall face, garden edge). Unlike Open, these are potential starting points for the intruder simulation.' },
            { type: 5 /* TileType.Valuable */, label: 'Valuable', colour: 'rgba(200,160,0,0.85)', tip: "High-value target tile (e.g. safe, server, jewellery). The simulation models intruders heading here from Perimeter tiles." },
            { type: 6 /* TileType.Stair */, label: 'Stairs', colour: 'rgba(139,92,246,0.85)', tip: 'Staircase — connects this floor to another floor. After placing, link it to a stair on another floor.' },
        ];
    }
    render() {
        const modes = ['setup', 'paint', 'hardware', 'audit'];
        return b `
      <!-- Row 1: mode tabs + grid toggle -->
      <div class="row">
        <div class="mode-tabs">
          ${modes.map(m => b `
            <button class=${m === this.mode ? 'active' : ''} @click=${() => this._setMode(m)}>
              ${this._modeLabels[m]}
            </button>
          `)}
        </div>
        <div class="separator"></div>
        <button
          class="toggle-btn ${this.showGrid ? 'on' : ''}"
          title="Toggle grid overlay"
          @click=${this._toggleGrid}
        >Grid: ${this.showGrid ? 'ON' : 'OFF'}</button>
      </div>

      <!-- Row 2: floor tabs (always shown) -->
      <div class="row">
        <div class="floor-tabs">
          ${this.floors.map(f => b `
            <button
              class="floor-tab ${f.id === this.activeFloorId ? 'active' : ''}"
              @click=${() => this._switchFloor(f.id)}
            >${f.name}</button>
          `)}
          <button @click=${this._addFloor} title="Add a new floor">+ Floor</button>
          ${this.floors.length > 1 ? b `
            <button class="danger" @click=${this._deleteFloor} title="Delete current floor">Delete</button>
          ` : ''}
        </div>
      </div>

      <!-- Row 3: brush row (paint mode only) -->
      ${this.mode === 'paint' ? b `
        <div class="row">
          <div class="undo-row">
            <button
              title="Undo (Ctrl+Z)"
              ?disabled=${!this.canUndo}
              @click=${this._undo}
            >&#8617; Undo</button>
            <button
              title="Redo (Ctrl+Shift+Z)"
              ?disabled=${!this.canRedo}
              @click=${this._redo}
            >&#8618; Redo</button>
          </div>
          <div class="separator"></div>
          <div class="brush-row">
            ${this._brushes.map(b$1 => b `
              <button
                class="brush-btn ${b$1.type === this.brush ? 'selected' : ''}"
                title=${b$1.tip}
                style="background:${b$1.colour}"
                @click=${() => this._setBrush(b$1.type)}
              >${b$1.label}</button>
            `)}
          </div>
        </div>
        <div class="row">
          <span class="brush-tooltip">
            ${this._brushes.find(b => b.type === this.brush)?.tip ?? ''}
          </span>
        </div>
      ` : ''}
    `;
    }
};
Toolbar.styles = i$3 `
    :host {
      display: flex;
      flex-direction: column;
      background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }
    .row {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 8px;
      flex-wrap: wrap;
    }
    .row + .row {
      padding-top: 0;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    .mode-tabs {
      display: flex;
      gap: 4px;
    }
    button {
      padding: 6px 12px;
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 4px;
      background: transparent;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 0.85rem;
    }
    button.active {
      background: var(--primary-color, #03a9f4);
      color: #fff;
    }
    button.danger {
      border-color: #f44336;
      color: #f44336;
    }
    button.danger:hover {
      background: #f44336;
      color: #fff;
    }
    .brush-row {
      display: flex;
      gap: 4px;
      margin-left: 8px;
    }
    .brush-btn {
      padding: 4px 8px;
      border-radius: 4px;
      border: 2px solid transparent;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      white-space: nowrap;
    }
    .brush-btn.selected {
      border-color: #000;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.3);
    }
    .brush-legend {
      font-size: 0.72rem;
      color: var(--secondary-text-color, #888);
      margin-left: 4px;
      align-self: center;
    }
    .floor-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      align-items: center;
    }
    .floor-tab {
      padding: 4px 10px;
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 4px;
      background: transparent;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 0.82rem;
    }
    .floor-tab.active {
      background: var(--primary-color, #03a9f4);
      color: #fff;
    }
    .separator {
      width: 1px;
      height: 20px;
      background: var(--divider-color, #e0e0e0);
      margin: 0 4px;
    }
    .toggle-btn {
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
      background: transparent;
      cursor: pointer;
      font-size: 0.78rem;
      color: var(--secondary-text-color, #666);
    }
    .toggle-btn.on {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }
    .brush-tooltip {
      font-size: 0.72rem;
      color: var(--secondary-text-color, #888);
      margin-top: 4px;
      padding: 2px 4px;
      line-height: 1.35;
    }
    .undo-row {
      display: flex;
      gap: 4px;
    }
  `;
__decorate([
    n()
], Toolbar.prototype, "mode", void 0);
__decorate([
    n({ type: Number })
], Toolbar.prototype, "brush", void 0);
__decorate([
    n({ type: Array })
], Toolbar.prototype, "floors", void 0);
__decorate([
    n()
], Toolbar.prototype, "activeFloorId", void 0);
__decorate([
    n({ type: Boolean })
], Toolbar.prototype, "showGrid", void 0);
__decorate([
    n({ type: Boolean })
], Toolbar.prototype, "canUndo", void 0);
__decorate([
    n({ type: Boolean })
], Toolbar.prototype, "canRedo", void 0);
Toolbar = __decorate([
    t('hspat-toolbar')
], Toolbar);

/** Sentinel value meaning "sensor not yet placed on the map". */
const UNPLACED = -1;
let SensorForm = class SensorForm extends i {
    constructor() {
        super(...arguments);
        this._tab = 'area';
        // Area sensor draft
        this._aEntityId = '';
        this._aBatteryId = '';
        this._aFacing = 0;
        this._aFov = 110;
        this._aRange = 6;
        this._aError = '';
        // Point sensor draft
        this._pEntityId = '';
        this._pBatteryId = '';
        this._pTileType = 2 /* TileType.Door */;
        this._pError = '';
    }
    _addAreaSensor() {
        if (!this._aEntityId.trim()) {
            this._aError = 'Entity ID is required. Find it in HA under Developer Tools → States.';
            return;
        }
        this._aError = '';
        const newSensor = {
            id: `area_${Date.now()}`,
            entity_id: this._aEntityId.trim(),
            battery_entity_id: this._aBatteryId.trim() || undefined,
            grid_x: UNPLACED,
            grid_y: UNPLACED,
            facing_angle: this._aFacing,
            fov_angle: this._aFov,
            max_range: this._aRange,
        };
        this._fireConfigChange({
            area_sensors: [...this.config.area_sensors, newSensor],
        });
        // Auto-enter placement mode so the user immediately clicks to place it
        this._startPlacement(newSensor.id, 'area');
        this._aEntityId = '';
        this._aBatteryId = '';
    }
    _removeAreaSensor(id) {
        this._fireConfigChange({
            area_sensors: this.config.area_sensors.filter(s => s.id !== id),
        });
    }
    _addPointSensor() {
        if (!this._pEntityId.trim()) {
            this._pError = 'Entity ID is required. Find it in HA under Developer Tools → States.';
            return;
        }
        this._pError = '';
        const newSensor = {
            id: `point_${Date.now()}`,
            entity_id: this._pEntityId.trim(),
            battery_entity_id: this._pBatteryId.trim() || undefined,
            tile_x: UNPLACED,
            tile_y: UNPLACED,
            tile_type: this._pTileType,
        };
        this._fireConfigChange({
            point_sensors: [...this.config.point_sensors, newSensor],
        });
        // Auto-enter placement mode
        this._startPlacement(newSensor.id, 'point');
        this._pEntityId = '';
        this._pBatteryId = '';
    }
    _removePointSensor(id) {
        this._fireConfigChange({
            point_sensors: this.config.point_sensors.filter(s => s.id !== id),
        });
    }
    _fireConfigChange(patch) {
        this.dispatchEvent(new CustomEvent('config-changed', {
            bubbles: true,
            composed: true,
            detail: { config: { ...this.config, ...patch } },
        }));
    }
    _startPlacement(id, sensorType) {
        this.dispatchEvent(new CustomEvent('place-sensor', {
            bubbles: true,
            composed: true,
            detail: { id, sensorType },
        }));
    }
    render() {
        return b `
      <div class="tabs">
        <button class=${this._tab === 'area' ? 'active' : ''} @click=${() => { this._tab = 'area'; }}>
          Area Sensors
        </button>
        <button class=${this._tab === 'point' ? 'active' : ''} @click=${() => { this._tab = 'point'; }}>
          Point Sensors
        </button>
      </div>
      <p class="hint">
        ${this._tab === 'area'
            ? 'Area sensors (motion detectors, cameras) watch a cone-shaped zone. After adding, click the map to place the sensor.'
            : 'Point sensors (door/window contacts) are attached to a single door or window tile. After adding, click the map to place the sensor.'}
      </p>

      ${this._tab === 'area' ? this._renderAreaForm() : this._renderPointForm()}
    `;
    }
    _renderAreaForm() {
        return b `
      <label>Entity ID
        <input .value=${this._aEntityId}
          @input=${(e) => { this._aEntityId = e.target.value; this._aError = ''; }}
          placeholder="binary_sensor.motion_hallway" />
      </label>
      <p class="field-help">The Home Assistant entity ID of the motion or camera sensor (e.g. <em>binary_sensor.hallway_motion</em>). Find it under Developer Tools → States.</p>

      <label>Battery Entity ID <em style="font-weight:normal;opacity:0.7">(optional)</em>
        <input .value=${this._aBatteryId}
          @input=${(e) => { this._aBatteryId = e.target.value; }}
          placeholder="sensor.camera_battery" />
      </label>
      <p class="field-help">If set, this sensor is treated as offline during the audit when battery drops below 5%.</p>

      <div class="numeric-row">
        <div class="numeric-field">
          <label>Facing °
            <input type="number" min="0" max="359" .value=${String(this._aFacing)}
              title="Direction the sensor faces: 0°=East, 90°=South, 180°=West, 270°=North"
              @change=${(e) => { this._aFacing = parseInt(e.target.value, 10); }} />
          </label>
        </div>
        <div class="numeric-field">
          <label>FOV °
            <input type="number" min="1" max="360" .value=${String(this._aFov)}
              title="Total cone width. Most PIR sensors are 90°–120°."
              @change=${(e) => { this._aFov = parseInt(e.target.value, 10); }} />
          </label>
        </div>
        <div class="numeric-field">
          <label>Range (tiles)
            <input type="number" min="1" max="50" .value=${String(this._aRange)}
              title="Detection distance in grid tiles (~0.5–1 m each)"
              @change=${(e) => { this._aRange = parseInt(e.target.value, 10); }} />
          </label>
        </div>
      </div>
      <p class="field-help">Facing: 0°=East · 90°=South · FOV: cone width (PIR = 90°–120°) · Range: tiles (~0.5–1 m each)</p>

      ${this._aError ? b `<p class="error-msg">${this._aError}</p>` : ''}
      <button class="add-btn" @click=${this._addAreaSensor}>Add Area Sensor</button>

      <div class="sensor-list">
        ${this.config.area_sensors.map(s => b `
          <div class="sensor-item">
            <div class="sensor-info">
              <div class="sensor-name">
                ${s.entity_id}
                ${s.grid_x < 0 ? b `<span class="unplaced-badge">Not placed</span>` : b `<span style="opacity:0.6;font-size:0.75rem"> (${s.grid_x},${s.grid_y})</span>`}
              </div>
              <div style="opacity:0.6;font-size:0.75rem">${s.fov_angle}° FOV · range ${s.max_range}</div>
            </div>
            <button class="place-btn" @click=${() => this._startPlacement(s.id, 'area')}>Place on map</button>
            <button class="remove-btn" aria-label="Remove sensor ${s.entity_id}" @click=${() => this._removeAreaSensor(s.id)}>×</button>
          </div>
        `)}
      </div>
    `;
    }
    _renderPointForm() {
        return b `
      <label>Entity ID
        <input .value=${this._pEntityId}
          @input=${(e) => { this._pEntityId = e.target.value; this._pError = ''; }}
          placeholder="binary_sensor.front_door" />
      </label>
      <p class="field-help">The Home Assistant entity ID of the door/window contact sensor. It reports <em>on</em> when open, <em>off</em> when closed.</p>

      <label>Battery Entity ID <em style="font-weight:normal;opacity:0.7">(optional)</em>
        <input .value=${this._pBatteryId}
          @input=${(e) => { this._pBatteryId = e.target.value; }}
          placeholder="sensor.front_door_battery" />
      </label>
      <p class="field-help">If set, the sensor is treated as offline during the audit when battery drops below 5%.</p>

      <label>Sensor Type
        <select @change=${(e) => { this._pTileType = parseInt(e.target.value, 10); }}>
          <option value=${2 /* TileType.Door */} ?selected=${this._pTileType === 2 /* TileType.Door */}>Door</option>
          <option value=${1 /* TileType.Window */} ?selected=${this._pTileType === 1 /* TileType.Window */}>Window</option>
        </select>
      </label>
      <p class="field-help">Whether this sensor is attached to a door tile or a window tile on the map.</p>

      ${this._pError ? b `<p class="error-msg">${this._pError}</p>` : ''}
      <button class="add-btn" @click=${this._addPointSensor}>Add Point Sensor</button>

      <div class="sensor-list">
        ${this.config.point_sensors.map(s => b `
          <div class="sensor-item">
            <div class="sensor-info">
              <div class="sensor-name">
                ${s.entity_id}
                ${s.tile_x < 0 ? b `<span class="unplaced-badge">Not placed</span>` : b `<span style="opacity:0.6;font-size:0.75rem"> (${s.tile_x},${s.tile_y})</span>`}
              </div>
              <div style="opacity:0.6;font-size:0.75rem">${s.tile_type === 2 /* TileType.Door */ ? 'Door' : 'Window'}</div>
            </div>
            <button class="place-btn" @click=${() => this._startPlacement(s.id, 'point')}>Place on map</button>
            <button class="remove-btn" aria-label="Remove sensor ${s.entity_id}" @click=${() => this._removePointSensor(s.id)}>×</button>
          </div>
        `)}
      </div>
    `;
    }
};
SensorForm.styles = i$3 `
    :host { display: block; padding: 12px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 8px; }
    .hint {
      font-size: 0.78rem;
      color: var(--secondary-text-color, #888);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    button {
      padding: 6px 12px;
      border: 1px solid var(--primary-color, #03a9f4);
      border-radius: 4px;
      background: transparent;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      font-size: 0.85rem;
    }
    button.active { background: var(--primary-color, #03a9f4); color: #fff; }
    label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 4px;
      color: var(--primary-text-color);
    }
    .field-help {
      font-size: 0.75rem;
      color: var(--secondary-text-color, #888);
      margin: -6px 0 8px;
      line-height: 1.35;
    }
    input, select {
      width: 100%;
      padding: 6px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      margin-bottom: 4px;
      box-sizing: border-box;
      font-size: 0.85rem;
    }
    .error-msg {
      font-size: 0.78rem;
      color: #f44336;
      margin: 0 0 10px;
    }
    .add-btn {
      width: 100%;
      padding: 8px;
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .numeric-row {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
    }
    .numeric-row .numeric-field {
      flex: 1;
      min-width: 0;
    }
    .numeric-row label {
      margin-bottom: 2px;
    }
    .numeric-row input {
      margin-bottom: 0;
    }
    .sensor-list { margin-top: 12px; }
    .sensor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid var(--divider-color, #eee);
      font-size: 0.82rem;
      gap: 6px;
    }
    .sensor-info { flex: 1; min-width: 0; }
    .sensor-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .unplaced-badge {
      display: inline-block;
      font-size: 0.7rem;
      background: #ff9800;
      color: #fff;
      border-radius: 3px;
      padding: 1px 5px;
      margin-left: 4px;
    }
    .place-btn {
      background: var(--primary-color, #03a9f4);
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: 0.78rem;
      white-space: nowrap;
    }
    .remove-btn {
      background: none;
      border: none;
      color: #f44336;
      cursor: pointer;
      font-size: 1rem;
      padding: 0 4px;
    }
  `;
__decorate([
    n({ attribute: false })
], SensorForm.prototype, "config", void 0);
__decorate([
    r()
], SensorForm.prototype, "_tab", void 0);
__decorate([
    r()
], SensorForm.prototype, "_aEntityId", void 0);
__decorate([
    r()
], SensorForm.prototype, "_aBatteryId", void 0);
__decorate([
    r()
], SensorForm.prototype, "_aFacing", void 0);
__decorate([
    r()
], SensorForm.prototype, "_aFov", void 0);
__decorate([
    r()
], SensorForm.prototype, "_aRange", void 0);
__decorate([
    r()
], SensorForm.prototype, "_aError", void 0);
__decorate([
    r()
], SensorForm.prototype, "_pEntityId", void 0);
__decorate([
    r()
], SensorForm.prototype, "_pBatteryId", void 0);
__decorate([
    r()
], SensorForm.prototype, "_pTileType", void 0);
__decorate([
    r()
], SensorForm.prototype, "_pError", void 0);
SensorForm = __decorate([
    t('hspat-sensor-form')
], SensorForm);

let ResultsPanel = class ResultsPanel extends i {
    constructor() {
        super(...arguments);
        this.result = null;
        this.floors = [];
    }
    render() {
        if (!this.result) {
            return b `<p>Run an audit to see results.</p>`;
        }
        const { coverage_tiles, sensor_snapshots, insights, per_floor } = this.result;
        const isMultiFloor = this.floors.length > 1;
        return b `
      <h3>Audit Results</h3>

      ${isMultiFloor ? b `
        <h3>Per-Floor Coverage</h3>
        <div>
          ${this.floors.map(f => {
            const fd = per_floor.get(f.id);
            const count = fd?.coverage_tiles.size ?? 0;
            return b `
              <div class="floor-row">
                <span>${f.name}</span>
                <span>${count} tile${count === 1 ? '' : 's'}</span>
              </div>
            `;
        })}
        </div>
      ` : b `
        <p><strong>Coverage:</strong> ${coverage_tiles.size} tile${coverage_tiles.size === 1 ? '' : 's'} monitored</p>
      `}

      <h3>Sensor Status</h3>
      <div>
        ${sensor_snapshots.map(s => b `
          <div class="sensor-row">
            <div class="dot ${s.health}"></div>
            <span>${s.sensor_id} — ${s.health}${s.reason ? ` (${s.reason})` : ''}</span>
          </div>
        `)}
      </div>

      ${insights.length > 0 ? b `
        <h3>Insights</h3>
        <ul>
          ${insights.map(i => b `<li>${i}</li>`)}
        </ul>
      ` : ''}

      <p class="disclaimer">
        Simulated Intrusion Path heatmap is displayed on the map above.
        Results are theoretical only — not a guarantee of security performance.
      </p>
    `;
    }
};
ResultsPanel.styles = i$3 `
    :host {
      display: block;
      padding: 12px;
      font-size: 0.9rem;
      color: var(--primary-text-color, #000);
    }
    h3 { margin: 0 0 8px; font-size: 1rem; }
    ul { margin: 0; padding-left: 18px; }
    li { margin-bottom: 4px; }
    .sensor-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .active { background: #4caf50; }
    .offline { background: #f44336; }
    .floor-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-size: 0.85rem;
    }
    .disclaimer {
      margin-top: 12px;
      font-size: 0.78rem;
      color: var(--secondary-text-color, #888);
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 8px;
    }
  `;
__decorate([
    n({ attribute: false })
], ResultsPanel.prototype, "result", void 0);
__decorate([
    n({ attribute: false })
], ResultsPanel.prototype, "floors", void 0);
ResultsPanel = __decorate([
    t('hspat-results-panel')
], ResultsPanel);

/**
 * Modal dialog for configuring a stair connection.
 *
 * The user gives the stair a name, sets the traversal cost, and optionally
 * picks which existing stair on another floor this stair connects to.
 * When a connection is selected the reciprocal entry is created automatically
 * by the parent (hspat-card).
 *
 * Fires 'stair-configured' with StairModalResult on confirm,
 * or 'stair-cancelled' when dismissed.
 */
let StairModal = class StairModal extends i {
    constructor() {
        super(...arguments);
        this.floors = [];
        this.fromFloorId = '';
        this.tileX = 0;
        this.tileY = 0;
        this._name = '';
        this._cost = 50;
        /** Encoded as "floorId|tileX|tileY" or "" for no connection. */
        this._selectedTarget = '';
    }
    /** All stair tiles that exist on floors other than the source floor. */
    get _availableTargets() {
        const targets = [];
        for (const floor of this.floors) {
            if (floor.id === this.fromFloorId)
                continue;
            for (const stair of floor.stair_tiles) {
                // Don't show the stair that already points back here (already connected)
                if (stair.target_floor_id === this.fromFloorId
                    && stair.target_tile_x === this.tileX
                    && stair.target_tile_y === this.tileY)
                    continue;
                const key = `${floor.id}|${stair.tile_x}|${stair.tile_y}`;
                targets.push({ key, label: stairLabel(stair, floor) });
            }
        }
        return targets;
    }
    _confirm() {
        let target = {};
        if (this._selectedTarget) {
            const [floorId, tx, ty] = this._selectedTarget.split('|');
            target = {
                target_floor_id: floorId,
                target_tile_x: Number(tx),
                target_tile_y: Number(ty),
            };
        }
        const stairTile = {
            tile_x: this.tileX,
            tile_y: this.tileY,
            name: this._name.trim() || undefined,
            traversal_cost: this._cost,
            ...target,
        };
        this.dispatchEvent(new CustomEvent('stair-configured', {
            detail: { stairTile, fromFloorId: this.fromFloorId },
            bubbles: true,
            composed: true,
        }));
    }
    _cancel() {
        this.dispatchEvent(new CustomEvent('stair-cancelled', { bubbles: true, composed: true }));
    }
    render() {
        const targets = this._availableTargets;
        const hasOtherFloors = this.floors.some(f => f.id !== this.fromFloorId);
        return b `
      <div class="modal">
        <h3>Configure Staircase</h3>
        <p class="subtitle">
          Stair tile at column ${this.tileX}, row ${this.tileY}
          on ${this.floors.find(f => f.id === this.fromFloorId)?.name ?? 'this floor'}
        </p>

        <label>
          <span>Name <em style="font-weight:normal;opacity:0.7">(optional)</em></span>
          <input
            type="text"
            .value=${this._name}
            placeholder="e.g. Hallway stairs, Basement entrance"
            @input=${(e) => { this._name = e.target.value; }}
          />
          <span class="hint">A name makes it easier to identify this stair in the connections list.</span>
        </label>

        <label>
          <span>Traversal cost</span>
          <input
            type="number"
            min="1"
            .value=${String(this._cost)}
            @input=${(e) => { this._cost = Number(e.target.value); }}
          />
          <span class="hint">How much extra effort it takes to use this staircase (higher = harder for an intruder). Default is 50.</span>
        </label>

        ${!hasOtherFloors ? b `
          <div class="no-stairs-hint">
            No other floors exist yet. Add another floor first, then place a stair there
            to create a connection.
          </div>
        ` : targets.length === 0 ? b `
          <div class="no-stairs-hint">
            No unconnected stairs found on other floors. Place a stair tile on another
            floor first — it will then appear in this list so you can link them.
          </div>
          <label>
            <span>Connects to</span>
            <select disabled>
              <option>No stairs available on other floors</option>
            </select>
          </label>
        ` : b `
          <label>
            <span>Connects to</span>
            <select @change=${(e) => { this._selectedTarget = e.target.value; }}>
              <option value="">— Not connected yet —</option>
              ${targets.map(t => b `
                <option value=${t.key} ?selected=${this._selectedTarget === t.key}>
                  ${t.label}
                </option>
              `)}
            </select>
            <span class="hint">
              Select which stair on another floor this staircase exits on.
              The connection will be created automatically in both directions.
            </span>
          </label>
        `}

        <div class="actions">
          <button class="cancel" @click=${this._cancel}>Cancel</button>
          <button class="confirm" @click=${this._confirm}>Save</button>
        </div>
      </div>
    `;
    }
};
StairModal.styles = i$3 `
    :host {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    }
    .modal {
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      padding: 24px;
      min-width: 340px;
      max-width: 480px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.3);
    }
    h3 { margin: 0 0 8px; font-size: 1rem; }
    .subtitle {
      font-size: 0.8rem;
      color: var(--secondary-text-color, #888);
      margin: 0 0 16px;
    }
    label { display: block; margin-bottom: 12px; font-size: 0.85rem; }
    label span { display: block; margin-bottom: 4px; color: var(--secondary-text-color, #666); }
    label .hint {
      display: block;
      font-size: 0.75rem;
      color: var(--secondary-text-color, #888);
      margin-top: 2px;
    }
    input, select {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 0.9rem;
    }
    .no-stairs-hint {
      font-size: 0.8rem;
      color: #ff9800;
      background: rgba(255,152,0,0.1);
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 12px;
    }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .actions button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .confirm { background: var(--primary-color, #03a9f4); color: #fff; }
    .cancel  { background: transparent; border: 1px solid var(--divider-color, #ccc) !important; }
  `;
__decorate([
    n({ type: Array })
], StairModal.prototype, "floors", void 0);
__decorate([
    n()
], StairModal.prototype, "fromFloorId", void 0);
__decorate([
    n({ type: Number })
], StairModal.prototype, "tileX", void 0);
__decorate([
    n({ type: Number })
], StairModal.prototype, "tileY", void 0);
__decorate([
    r()
], StairModal.prototype, "_name", void 0);
__decorate([
    r()
], StairModal.prototype, "_cost", void 0);
__decorate([
    r()
], StairModal.prototype, "_selectedTarget", void 0);
StairModal = __decorate([
    t('hspat-stair-modal')
], StairModal);

let HspatCard = class HspatCard extends i {
    constructor() {
        super(...arguments);
        this._mode = 'setup';
        this._brush = 0 /* TileType.Open */;
        this._auditResult = null;
        this._running = false;
        this._placing = null;
        this._activeFloorId = '';
        this._showGrid = DEFAULT_SHOW_GRID;
        this._showStairModal = false;
        this._pendingStairCoords = { x: 0, y: 0 };
        this._hoverTile = null;
        this._grid = [];
        this._canvas = null;
        this._ctx = null;
        this._floorplanImg = null;
        this._paintActive = false;
        this._gridDirty = false;
        this._worker = null;
        this._resizeObserver = null;
        this._undoManager = new UndoManager();
    }
    set hass(hass) {
        this._hass = hass;
        if (this._mode === 'audit' && this._auditResult) {
            this._redraw();
        }
    }
    setConfig(config) {
        if (config.disclaimer_accepted === undefined) {
            throw new Error('Invalid HSPAT config');
        }
        const withDefaults = {
            ...config,
            grid_cols: config.grid_cols ?? DEFAULT_GRID_COLS,
            grid_rows: config.grid_rows ?? DEFAULT_GRID_ROWS,
            grid_rle: config.grid_rle ?? '',
            area_sensors: config.area_sensors ?? [],
            point_sensors: config.point_sensors ?? [],
            valuables: config.valuables ?? [],
            perimeter: config.perimeter ?? [],
            disclaimer_accepted: config.disclaimer_accepted ?? false,
        };
        this._config = migrateToMultiFloor(withDefaults);
        this._activeFloorId = this._config.active_floor_id ?? this._config.floors?.[0]?.id ?? '';
        this._showGrid = this._config.show_grid ?? DEFAULT_SHOW_GRID;
        this._rebuildGrid();
        const floor = this._activeFloor;
        if (floor?.floorplan_url) {
            this._loadFloorplan(floor.floorplan_url);
        }
        else if (config.floorplan_url) {
            this._loadFloorplan(config.floorplan_url);
        }
    }
    getCardSize() { return 6; }
    getLayoutOptions() {
        return { grid_columns: 4, grid_min_columns: 3, grid_rows: 'auto' };
    }
    // ─── Active floor helpers ──────────────────────────────────────────────────
    get _activeFloor() {
        return this._config?.floors?.find(f => f.id === this._activeFloorId);
    }
    _rebuildGrid() {
        const floor = this._activeFloor;
        if (!floor) {
            // Legacy fallback — no floors array
            const { grid_cols, grid_rows, grid_rle } = this._config;
            const flat = grid_rle
                ? decodeRLE(grid_rle)
                : new Array(grid_cols * grid_rows).fill(0 /* TileType.Open */);
            this._grid = unflatten(flat, grid_cols);
            while (this._grid.length < grid_rows) {
                this._grid.push(new Array(grid_cols).fill(0 /* TileType.Open */));
            }
            return;
        }
        const flat = floor.grid_rle
            ? decodeRLE(floor.grid_rle)
            : new Array(floor.grid_cols * floor.grid_rows).fill(0 /* TileType.Open */);
        this._grid = unflatten(flat, floor.grid_cols);
        while (this._grid.length < floor.grid_rows) {
            this._grid.push(new Array(floor.grid_cols).fill(0 /* TileType.Open */));
        }
    }
    /** Encodes current in-memory grid back to RLE and updates the active floor. Does NOT emit. */
    _saveGridToFloor() {
        const floor = this._activeFloor;
        if (!floor || !this._config.floors)
            return;
        const rle = encodeRLE(flatten(this._grid));
        const updatedFloor = { ...floor, grid_rle: rle };
        const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
        this._config = { ...this._config, floors, grid_rle: rle };
    }
    _emitConfigChanged() {
        this.dispatchEvent(new CustomEvent('config-changed', {
            bubbles: true, composed: true, detail: { config: this._config },
        }));
    }
    /**
     * Syncs top-level area_sensors / point_sensors / valuables / perimeter
     * back into the active floor object so that both views stay consistent.
     */
    _syncSensorsToActiveFloor() {
        const floor = this._activeFloor;
        if (!floor || !this._config.floors)
            return;
        const updatedFloor = {
            ...floor,
            area_sensors: this._config.area_sensors,
            point_sensors: this._config.point_sensors,
            valuables: this._config.valuables,
            perimeter: this._config.perimeter,
        };
        const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
        this._config = { ...this._config, floors };
    }
    _loadFloorplan(url) {
        const img = new Image();
        img.onload = () => {
            this._floorplanImg = img;
            this._redraw();
        };
        img.src = url;
    }
    firstUpdated(_changed) {
        this._canvas = this.shadowRoot.querySelector('canvas');
        if (!this._canvas)
            return;
        this._ctx = this._canvas.getContext('2d');
        this._resizeCanvas();
        this._resizeObserver = new ResizeObserver(() => {
            this._resizeCanvas();
            this._redraw();
        });
        this._resizeObserver.observe(this);
        // Undo/redo keyboard shortcuts
        this.addEventListener('keydown', (e) => this._onKeyDown(e));
        this.setAttribute('tabindex', '0');
    }
    _resizeCanvas() {
        if (!this._canvas)
            return;
        const floor = this._activeFloor;
        const cols = floor?.grid_cols ?? this._config?.grid_cols ?? DEFAULT_GRID_COLS;
        const rows = floor?.grid_rows ?? this._config?.grid_rows ?? DEFAULT_GRID_ROWS;
        const w = Math.min(this._canvas.offsetWidth, 1200);
        const h = Math.round(w * rows / cols);
        this._canvas.width = w;
        this._canvas.height = h;
        this._canvas.style.height = `${h}px`;
    }
    _redraw() {
        if (!this._ctx || !this._config)
            return;
        // Prefer per-floor audit data for the active floor so switching floors
        // after an audit shows the correct coverage + heatmap.
        const floorAudit = this._auditResult?.per_floor.get(this._activeFloorId);
        const coverage = floorAudit?.coverage_tiles ?? this._auditResult?.coverage_tiles ?? new Set();
        const heatmap = floorAudit?.heatmap ?? this._auditResult?.heatmap ?? new Map();
        paintGrid(this._ctx, this._config, this._grid, coverage, heatmap, this._floorplanImg, this._placing, this._showGrid, this._hoverTile);
    }
    // ─── Floor management ─────────────────────────────────────────────────────
    _switchFloor(id) {
        if (!this._config.floors || id === this._activeFloorId)
            return;
        // Persist current grid before switching
        this._saveGridToFloor();
        this._activeFloorId = id;
        this._config = { ...this._config, active_floor_id: id };
        // Sync top-level arrays from the new floor
        const floor = this._activeFloor;
        if (floor) {
            this._config = {
                ...this._config,
                area_sensors: floor.area_sensors,
                point_sensors: floor.point_sensors,
                valuables: floor.valuables,
                perimeter: floor.perimeter,
                grid_cols: floor.grid_cols,
                grid_rows: floor.grid_rows,
                grid_rle: floor.grid_rle,
            };
            if (floor.floorplan_url) {
                this._loadFloorplan(floor.floorplan_url);
            }
            else {
                this._floorplanImg = null;
            }
        }
        this._rebuildGrid();
        this._resizeCanvas();
        // Phase 3: update top-level audit data to the new floor's per-floor data
        if (this._auditResult?.per_floor) {
            const floorData = this._auditResult.per_floor.get(id);
            if (floorData) {
                this._auditResult = {
                    ...this._auditResult,
                    coverage_tiles: floorData.coverage_tiles,
                    heatmap: floorData.heatmap,
                };
            }
        }
        this._redraw();
        this._emitConfigChanged();
    }
    _addFloor() {
        if (!this._config.floors)
            return;
        this._saveGridToFloor();
        const currentFloor = this._activeFloor;
        const groundFloor = this._config.floors[0];
        const newId = `floor-${Date.now()}`;
        const newFloor = {
            id: newId,
            name: `Floor ${this._config.floors.length + 1}`,
            grid_cols: groundFloor?.grid_cols ?? currentFloor?.grid_cols ?? DEFAULT_GRID_COLS,
            grid_rows: groundFloor?.grid_rows ?? currentFloor?.grid_rows ?? DEFAULT_GRID_ROWS,
            grid_rle: groundFloor?.grid_rle ?? '',
            area_sensors: [],
            point_sensors: [],
            valuables: [],
            perimeter: [],
            stair_tiles: [],
            svg_shapes: [],
        };
        this._config = { ...this._config, floors: [...this._config.floors, newFloor] };
        this._switchFloor(newId);
    }
    _deleteFloor(id) {
        if (!this._config.floors || this._config.floors.length <= 1)
            return;
        const floors = this._config.floors.filter(f => f.id !== id);
        const switchTo = id === this._activeFloorId ? floors[0].id : this._activeFloorId;
        this._config = { ...this._config, floors };
        // _switchFloor handles active_floor_id, top-level sync, grid rebuild and emit
        this._activeFloorId = ''; // force re-switch even if switchTo === current
        this._switchFloor(switchTo);
    }
    // ─── Undo / Redo ─────────────────────────────────────────────────────────
    _captureSnapshot() {
        const floor = this._activeFloor;
        return {
            grid_rle: encodeRLE(flatten(this._grid)),
            perimeter: floor?.perimeter ?? this._config.perimeter ?? [],
            valuables: floor?.valuables ?? this._config.valuables ?? [],
        };
    }
    _applySnapshot(snapshot) {
        const floor = this._activeFloor;
        if (!floor || !this._config.floors)
            return;
        const flat = snapshot.grid_rle ? decodeRLE(snapshot.grid_rle) : new Array(floor.grid_cols * floor.grid_rows).fill(0 /* TileType.Open */);
        this._grid = unflatten(flat, floor.grid_cols);
        const updatedFloor = {
            ...floor,
            grid_rle: snapshot.grid_rle,
            perimeter: snapshot.perimeter,
            valuables: snapshot.valuables,
        };
        const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
        this._config = {
            ...this._config,
            floors,
            grid_rle: snapshot.grid_rle,
            perimeter: snapshot.perimeter,
            valuables: snapshot.valuables,
        };
    }
    _undo() {
        const current = this._captureSnapshot();
        const prev = this._undoManager.undo(current);
        if (!prev)
            return;
        this._applySnapshot(prev);
        this._emitConfigChanged();
        this._redraw();
        this.requestUpdate();
    }
    _redo() {
        const current = this._captureSnapshot();
        const next = this._undoManager.redo(current);
        if (!next)
            return;
        this._applySnapshot(next);
        this._emitConfigChanged();
        this._redraw();
        this.requestUpdate();
    }
    _onKeyDown(e) {
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this._undo();
        }
        else if (e.ctrlKey && (e.key === 'Z' || (e.shiftKey && e.key === 'z'))) {
            e.preventDefault();
            this._redo();
        }
    }
    // ─── Paint mode event handlers ───────────────────────────────────────────
    _onPointerDown(e) {
        if (this._mode === 'hardware' && this._placing) {
            this._placeSelectedSensor(e);
            return;
        }
        if (this._mode !== 'paint')
            return;
        if (this._brush === 6 /* TileType.Stair */) {
            const { x, y } = this._canvasTile(e);
            this._undoManager.push(this._captureSnapshot());
            this._pendingStairCoords = { x, y };
            this._showStairModal = true;
            return;
        }
        this._undoManager.push(this._captureSnapshot());
        this._paintActive = true;
        this._applyBrush(e);
    }
    _onPointerMove(e) {
        if (this._mode === 'hardware') {
            this._hoverTile = this._canvasTile(e);
            this._redraw();
            return;
        }
        if (!this._paintActive || this._mode !== 'paint')
            return;
        this._applyBrush(e);
    }
    _onPointerUp() {
        if (this._paintActive && this._gridDirty) {
            this._gridDirty = false;
            this._saveGridToFloor();
            this._emitConfigChanged();
        }
        this._paintActive = false;
        this.requestUpdate(); // update undo/redo button state
    }
    _onPointerLeave() {
        this._hoverTile = null;
        this._onPointerUp();
    }
    // ─── Phase 2: Right-click sensor deletion ─────────────────────────────────
    _onContextMenu(e) {
        if (this._mode !== 'hardware')
            return;
        e.preventDefault();
        const { x, y } = this._canvasTile(e);
        this._tryDeleteSensorAt(x, y);
    }
    _tryDeleteSensorAt(x, y) {
        const areaSensor = this._config.area_sensors.find(s => s.grid_x === x && s.grid_y === y);
        if (areaSensor) {
            if (!window.confirm(`Delete sensor "${areaSensor.entity_id}" at (${x}, ${y})?`))
                return;
            this._config = {
                ...this._config,
                area_sensors: this._config.area_sensors.filter(s => s.id !== areaSensor.id),
            };
            this._syncSensorsToActiveFloor();
            this._emitConfigChanged();
            this._redraw();
            return;
        }
        const pointSensor = this._config.point_sensors.find(s => s.tile_x === x && s.tile_y === y);
        if (pointSensor) {
            if (!window.confirm(`Delete sensor "${pointSensor.entity_id}" at (${x}, ${y})?`))
                return;
            this._config = {
                ...this._config,
                point_sensors: this._config.point_sensors.filter(s => s.id !== pointSensor.id),
            };
            this._syncSensorsToActiveFloor();
            this._emitConfigChanged();
            this._redraw();
        }
    }
    _canvasTile(e) {
        const rect = this._canvas.getBoundingClientRect();
        const floor = this._activeFloor;
        return pixelToTile(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height, floor?.grid_cols ?? this._config.grid_cols, floor?.grid_rows ?? this._config.grid_rows);
    }
    _applyBrush(e) {
        if (!this._canvas)
            return;
        const { x, y } = this._canvasTile(e);
        const tile = this._brush;
        if (tile <= 3 /* TileType.Wall */) {
            // Structural tile — write to grid, will persist on pointerup
            if (this._grid[y])
                this._grid[y][x] = tile;
            this._gridDirty = true;
        }
        else if (tile === 4 /* TileType.Perimeter */) {
            // Bug 1 fix: toggle perimeter overlay
            this._toggleOverlay('perimeter', x, y);
        }
        else if (tile === 5 /* TileType.Valuable */) {
            // Bug 1 fix: toggle valuable overlay
            this._toggleOverlay('valuables', x, y);
        }
        // Stair is handled in _onPointerDown — skip here
        this._redraw();
    }
    _toggleOverlay(key, x, y) {
        const floor = this._activeFloor;
        if (floor && this._config.floors) {
            // Per-floor storage
            const list = floor[key];
            const idx = list.findIndex(t => t.x === x && t.y === y);
            const updated = idx >= 0 ? list.filter((_, i) => i !== idx) : [...list, { x, y }];
            const updatedFloor = { ...floor, [key]: updated };
            const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
            // Mirror to top-level for legacy audit pipeline
            this._config = { ...this._config, floors, [key]: updated };
        }
        else {
            // Legacy path
            const list = this._config[key];
            const idx = list.findIndex(t => t.x === x && t.y === y);
            const updated = idx >= 0 ? list.filter((_, i) => i !== idx) : [...list, { x, y }];
            this._config = { ...this._config, [key]: updated };
        }
        this._emitConfigChanged();
    }
    // ─── Stair modal handlers ─────────────────────────────────────────────────
    _onStairConfigured(e) {
        const { stairTile, fromFloorId } = e.detail;
        if (!this._config.floors)
            return;
        const floor = this._config.floors.find(f => f.id === fromFloorId);
        if (!floor)
            return;
        // Paint the stair tile in the in-memory grid
        if (this._grid[stairTile.tile_y]) {
            this._grid[stairTile.tile_y][stairTile.tile_x] = 6 /* TileType.Stair */;
        }
        // Upsert the stair record and persist grid_rle atomically
        const rle = encodeRLE(flatten(this._grid));
        const updatedFloor = {
            ...floor,
            grid_rle: rle,
            stair_tiles: upsertStairTile(floor.stair_tiles, stairTile),
        };
        let floors = this._config.floors.map(f => f.id === fromFloorId ? updatedFloor : f);
        // Auto-create the reciprocal stair on the target floor so pathfinding is
        // bi-directional without the user having to manually configure both ends.
        if (stairTile.target_floor_id !== undefined
            && stairTile.target_tile_x !== undefined
            && stairTile.target_tile_y !== undefined) {
            const targetFloor = floors.find(f => f.id === stairTile.target_floor_id);
            if (targetFloor) {
                const reciprocal = buildReciprocalStair(stairTile, fromFloorId);
                const updatedTarget = {
                    ...targetFloor,
                    stair_tiles: upsertStairTile(targetFloor.stair_tiles, reciprocal),
                };
                floors = floors.map(f => f.id === stairTile.target_floor_id ? updatedTarget : f);
            }
        }
        this._config = { ...this._config, floors, grid_rle: rle };
        this._emitConfigChanged();
        this._showStairModal = false;
        this._redraw();
    }
    _onStairCancelled() {
        this._showStairModal = false;
    }
    // ─── Hardware mode sensor placement ──────────────────────────────────────
    _onPlaceSensor(e) {
        this._placing = e.detail;
        this._redraw();
    }
    _placeSelectedSensor(e) {
        if (!this._canvas || !this._placing)
            return;
        const { x, y } = this._canvasTile(e);
        const { id, sensorType } = this._placing;
        if (sensorType === 'area') {
            this._config = {
                ...this._config,
                area_sensors: this._config.area_sensors.map(s => s.id === id ? { ...s, grid_x: x, grid_y: y } : s),
            };
        }
        else {
            this._config = {
                ...this._config,
                point_sensors: this._config.point_sensors.map(s => s.id === id ? { ...s, tile_x: x, tile_y: y } : s),
            };
        }
        this._syncSensorsToActiveFloor();
        this._placing = null;
        this._emitConfigChanged();
        this._redraw();
    }
    // ─── Audit ────────────────────────────────────────────────────────────────
    _buildAuditBaseline(snapshots) {
        const costMatrix = buildCostMatrix(this._grid, this._hass, this._config, snapshots);
        applyAreaSensorCosts(costMatrix, this._grid, this._config.area_sensors, snapshots);
        const coverageTiles = computeAllFov(this._grid, this._config.area_sensors, snapshots);
        addPointSensorCoverage(this._config.point_sensors, snapshots, coverageTiles);
        return { costMatrix, coverageTiles };
    }
    async _runMultiFloorAudit(snapshots, coverageTiles) {
        const floors = this._config.floors;
        const matrices = {};
        const perFloor = new Map();
        for (const floor of floors) {
            const floorGrid = unflatten(decodeRLE(floor.grid_rle), floor.grid_cols);
            const floorMatrix = buildCostMatrix(floorGrid, this._hass, { ...this._config, point_sensors: floor.point_sensors }, snapshots);
            applyAreaSensorCosts(floorMatrix, floorGrid, floor.area_sensors, snapshots);
            matrices[floor.id] = floorMatrix;
            const floorCoverage = computeAllFov(floorGrid, floor.area_sensors, snapshots);
            addPointSensorCoverage(floor.point_sensors, snapshots, floorCoverage);
            perFloor.set(floor.id, { coverage_tiles: floorCoverage, heatmap: new Map() });
        }
        const rawHeatmap = await this._runMultiFloorWorker({
            type: 'multi_floor',
            floors: matrices,
            stair_connections: this._buildStairConnections(floors),
            perimeter: floors.flatMap(f => f.perimeter.map(p => ({ floor_id: f.id, x: p.x, y: p.y }))),
            valuables: floors.flatMap(f => f.valuables.map(v => ({ floor_id: f.id, x: v.x, y: v.y }))),
            iterations: SIMULATION_ITERS,
        }).catch(() => new Map());
        for (const [k, count] of rawHeatmap) {
            const colonIdx = k.indexOf(':');
            if (colonIdx < 0)
                continue;
            const bucket = perFloor.get(k.slice(0, colonIdx));
            if (bucket)
                bucket.heatmap.set(k.slice(colonIdx + 1), count);
        }
        const heatmap = perFloor.get(this._activeFloorId)?.heatmap ?? new Map();
        return { heatmap, perFloor };
    }
    async _runSingleFloorAudit(costMatrix, coverageTiles) {
        const heatmap = await this._runWorker({
            cost_matrix: costMatrix,
            perimeter: this._config.perimeter,
            valuables: this._config.valuables,
            iterations: SIMULATION_ITERS,
        }).catch(() => new Map());
        const perFloor = new Map([[this._activeFloorId, { coverage_tiles: coverageTiles, heatmap }]]);
        return { heatmap, perFloor };
    }
    async _runAudit() {
        if (!this._hass || this._running)
            return;
        this._running = true;
        this.requestUpdate();
        try {
            this._syncSensorsToActiveFloor();
            const snapshots = takeSnapshot(this._hass, this._config.area_sensors, this._config.point_sensors);
            const { costMatrix, coverageTiles } = this._buildAuditBaseline(snapshots);
            const isMultiFloor = (this._config.floors?.length ?? 0) > 1;
            const { heatmap, perFloor } = isMultiFloor
                ? await this._runMultiFloorAudit(snapshots, coverageTiles)
                : await this._runSingleFloorAudit(costMatrix, coverageTiles);
            this._auditResult = {
                coverage_tiles: coverageTiles,
                heatmap,
                per_floor: perFloor,
                sensor_snapshots: snapshots,
                blind_spots: [],
                insights: generateInsights(coverageTiles, heatmap),
            };
        }
        finally {
            this._running = false;
            this._redraw();
            this.requestUpdate();
        }
    }
    /** Build directed StairConnection[] from all floors' stair_tiles. */
    _buildStairConnections(floors) {
        const conns = [];
        for (const floor of floors) {
            for (const s of floor.stair_tiles) {
                // Skip unconnected stairs (target not yet configured)
                if (s.target_floor_id === undefined
                    || s.target_tile_x === undefined
                    || s.target_tile_y === undefined)
                    continue;
                conns.push({
                    from_floor: floor.id,
                    from_x: s.tile_x,
                    from_y: s.tile_y,
                    to_floor: s.target_floor_id,
                    to_x: s.target_tile_x,
                    to_y: s.target_tile_y,
                    cost: s.traversal_cost ?? STAIR_COST,
                });
            }
        }
        return conns;
    }
    // Bug 5: stop button handler
    _stopAudit() {
        this._worker?.terminate();
        this._worker = null;
        this._running = false;
        this.requestUpdate();
    }
    _runWorker(req) {
        return new Promise((resolve, reject) => {
            try {
                const workerUrl = new URL('./workers/simulation.worker.js', import.meta.url);
                this._worker = new Worker(workerUrl, { type: 'module' });
                this._worker.onmessage = (e) => {
                    resolve(new Map(Object.entries(e.data.heatmap)));
                    this._worker?.terminate();
                    this._worker = null;
                };
                // Bug 3 fix: handle worker errors so the promise doesn't hang forever
                this._worker.onerror = () => {
                    this._worker?.terminate();
                    this._worker = null;
                    // Fall back to inline execution
                    Promise.resolve().then(function () { return dijkstra; }).then(({ monteCarloHeatmap }) => {
                        resolve(monteCarloHeatmap(req.cost_matrix, req.perimeter, req.valuables, req.iterations));
                    }).catch(reject);
                };
                this._worker.postMessage(req);
            }
            catch {
                // Worker constructor unavailable — run inline
                Promise.resolve().then(function () { return dijkstra; }).then(({ monteCarloHeatmap }) => {
                    resolve(monteCarloHeatmap(req.cost_matrix, req.perimeter, req.valuables, req.iterations));
                }).catch(reject);
            }
        });
    }
    _runMultiFloorWorker(req) {
        return new Promise((resolve, reject) => {
            try {
                const workerUrl = new URL('./workers/simulation.worker.js', import.meta.url);
                const worker = new Worker(workerUrl, { type: 'module' });
                worker.onmessage = (e) => {
                    resolve(new Map(Object.entries(e.data.heatmap)));
                    worker.terminate();
                };
                worker.onerror = () => {
                    worker.terminate();
                    Promise.resolve().then(function () { return dijkstra; }).then(({ multiFloorMonteCarloHeatmap }) => {
                        resolve(multiFloorMonteCarloHeatmap(req.floors, req.stair_connections, req.perimeter, req.valuables, req.iterations));
                    }).catch(reject);
                };
                worker.postMessage(req);
            }
            catch {
                Promise.resolve().then(function () { return dijkstra; }).then(({ multiFloorMonteCarloHeatmap }) => {
                    resolve(multiFloorMonteCarloHeatmap(req.floors, req.stair_connections, req.perimeter, req.valuables, req.iterations));
                }).catch(reject);
            }
        });
    }
    // ─── Config persistence ───────────────────────────────────────────────────
    _onConfigChanged(e) {
        const newConfig = e.detail.config;
        if (newConfig.floors && this._activeFloorId) {
            // Sync updated top-level sensor arrays back into the active floor
            const floors = newConfig.floors.map(f => {
                if (f.id !== this._activeFloorId)
                    return f;
                return {
                    ...f,
                    area_sensors: newConfig.area_sensors,
                    point_sensors: newConfig.point_sensors,
                    valuables: newConfig.valuables,
                    perimeter: newConfig.perimeter,
                };
            });
            this._config = { ...newConfig, floors };
        }
        else {
            this._config = newConfig;
        }
        this._rebuildGrid();
        this._redraw();
        this.dispatchEvent(new CustomEvent('config-changed', {
            bubbles: true,
            composed: true,
            detail: { config: this._config },
        }));
    }
    // ─── Setup panel handlers ─────────────────────────────────────────────────
    _onFloorNameChange(value) {
        const floor = this._activeFloor;
        if (!floor || !this._config.floors)
            return;
        const updatedFloor = { ...floor, name: value };
        const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
        this._config = { ...this._config, floors };
        this._emitConfigChanged();
        this.requestUpdate();
    }
    _onGridColsChange(value) {
        const cols = Math.max(1, Math.min(200, parseInt(value, 10) || 1));
        const floor = this._activeFloor;
        if (!floor || !this._config.floors)
            return;
        const updatedFloor = { ...floor, grid_cols: cols };
        const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
        this._config = { ...this._config, floors, grid_cols: cols };
        this._rebuildGrid();
        this._resizeCanvas();
        this._redraw();
        this._emitConfigChanged();
    }
    _onGridRowsChange(value) {
        const rows = Math.max(1, Math.min(200, parseInt(value, 10) || 1));
        const floor = this._activeFloor;
        if (!floor || !this._config.floors)
            return;
        const updatedFloor = { ...floor, grid_rows: rows };
        const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
        this._config = { ...this._config, floors, grid_rows: rows };
        this._rebuildGrid();
        this._resizeCanvas();
        this._redraw();
        this._emitConfigChanged();
    }
    /** Only allow http/https/absolute-path URLs to prevent javascript: URI injection. */
    _isValidFloorplanUrl(url) {
        return /^https?:\/\//i.test(url) || url.startsWith('/');
    }
    _onFloorplanUrlChange(value) {
        const floor = this._activeFloor;
        if (!floor || !this._config.floors)
            return;
        const raw = value.trim();
        if (raw && !this._isValidFloorplanUrl(raw))
            return;
        const url = raw || undefined;
        const updatedFloor = { ...floor, floorplan_url: url };
        const floors = this._config.floors.map(f => f.id === floor.id ? updatedFloor : f);
        this._config = { ...this._config, floors };
        if (url) {
            this._loadFloorplan(url);
        }
        else {
            this._floorplanImg = null;
            this._redraw();
        }
        this._emitConfigChanged();
    }
    _onModeChange(e) {
        this._mode = e.detail;
        this.requestUpdate();
    }
    _onBrushChange(e) {
        this._brush = e.detail;
    }
    _onGridToggle(e) {
        this._showGrid = e.detail;
        this._config = { ...this._config, show_grid: this._showGrid };
        this._redraw();
        this._emitConfigChanged();
    }
    render() {
        if (!this._config)
            return b `<ha-card>Loading…</ha-card>`;
        const showDisclaimer = !this._config.disclaimer_accepted;
        return b `
      <ha-card>
        <div class="card-header">Home Security Posture &amp; Auditing Tool</div>

        <hspat-toolbar
          .mode=${this._mode}
          .brush=${this._brush}
          .floors=${this._config.floors ?? []}
          .activeFloorId=${this._activeFloorId}
          .showGrid=${this._showGrid}
          .canUndo=${this._undoManager.canUndo}
          .canRedo=${this._undoManager.canRedo}
          @mode-change=${this._onModeChange}
          @brush-change=${this._onBrushChange}
          @floor-change=${(e) => this._switchFloor(e.detail)}
          @floor-add=${this._addFloor}
          @floor-delete=${(e) => this._deleteFloor(e.detail)}
          @grid-toggle=${this._onGridToggle}
          @undo-action=${this._undo}
          @redo-action=${this._redo}
        ></hspat-toolbar>

        <div class="content-row">
          <div class="canvas-wrapper">
            <canvas
              role="application"
              aria-label="Floor plan grid — use Draw Floor Plan mode to paint tiles"
              @pointerdown=${this._onPointerDown}
              @pointermove=${this._onPointerMove}
              @pointerup=${this._onPointerUp}
              @pointerleave=${this._onPointerLeave}
              @contextmenu=${this._onContextMenu}
            ></canvas>

            ${showDisclaimer ? b `
              <hspat-disclaimer-modal
                .config=${this._config}
                @config-changed=${this._onConfigChanged}
              ></hspat-disclaimer-modal>
            ` : ''}
          </div>
        </div>

        ${this._mode === 'hardware' || this._mode === 'audit' ? b `
          <div class="side-panel">
            ${this._mode === 'hardware' ? this._renderHardwarePanel() : ''}
            ${this._mode === 'audit' ? this._renderAuditPanel() : ''}
          </div>
        ` : ''}

        <!-- Status bar -->
        <div class="status-bar">${this._renderStatusBar()}</div>

        ${this._showStairModal ? b `
          <hspat-stair-modal
            .floors=${this._config.floors ?? []}
            .fromFloorId=${this._activeFloorId}
            .tileX=${this._pendingStairCoords.x}
            .tileY=${this._pendingStairCoords.y}
            @stair-configured=${this._onStairConfigured}
            @stair-cancelled=${this._onStairCancelled}
          ></hspat-stair-modal>
        ` : ''}

        ${this._mode === 'setup' ? this._renderSetupPanel() : ''}
      </ha-card>
    `;
    }
    _renderStatusBar() {
        const sensorCount = (this._config.area_sensors?.length ?? 0) + (this._config.point_sensors?.length ?? 0);
        if (this._mode === 'hardware') {
            const coords = this._hoverTile ? ` | Tile (${this._hoverTile.x}, ${this._hoverTile.y})` : '';
            return `Sensors: ${sensorCount}${coords} | Right-click sensor to delete`;
        }
        if (this._mode === 'paint') {
            const brushNames = {
                0: 'Open', 3: 'Wall', 2: 'Door', 1: 'Window', 4: 'Perimeter', 5: 'Valuable', 6: 'Stairs',
            };
            const brushName = brushNames[this._brush] ?? 'Unknown';
            const coords = this._hoverTile ? ` | Tile (${this._hoverTile.x}, ${this._hoverTile.y})` : '';
            return `Brush: ${brushName}${coords}`;
        }
        if (this._mode === 'audit') {
            return `Sensors: ${sensorCount}`;
        }
        return '';
    }
    _renderSetupPanel() {
        return b `
      <div class="setup-panel">
        <div class="setup-section">
          <h4>Floor settings</h4>
          <div class="setup-field">
            <label>Floor name</label>
            <input
              type="text"
              .value=${this._activeFloor?.name ?? ''}
              placeholder="e.g. Ground Floor, First Floor"
              @change=${(e) => this._onFloorNameChange(e.target.value)}
            />
          </div>
          <div class="setup-grid-row">
            <div class="setup-field">
              <label>Grid columns</label>
              <input type="number" min="1" max="200"
                .value=${String(this._activeFloor?.grid_cols ?? this._config.grid_cols)}
                @change=${(e) => this._onGridColsChange(e.target.value)}
              />
              <div class="hint">Number of horizontal tiles.</div>
            </div>
            <div class="setup-field">
              <label>Grid rows</label>
              <input type="number" min="1" max="200"
                .value=${String(this._activeFloor?.grid_rows ?? this._config.grid_rows)}
                @change=${(e) => this._onGridRowsChange(e.target.value)}
              />
              <div class="hint">Number of vertical tiles.</div>
            </div>
          </div>
        </div>
        <div class="setup-section">
          <h4>Background floorplan image</h4>
          <div class="setup-field">
            <label>Image URL</label>
            <input
              type="url"
              .value=${this._activeFloor?.floorplan_url ?? ''}
              placeholder="/local/floorplan/ground-floor.svg"
              @change=${(e) => this._onFloorplanUrlChange(e.target.value)}
            />
            <div class="hint">
              URL of an SVG or image file hosted in Home Assistant (e.g.
              <code>/local/floorplan/ground.svg</code>). Use this to show a realistic
              floor plan drawn in Inkscape or exported from Floorplanner as the background.
              The tile grid overlay will appear on top so you can mark walls, doors, sensors
              and other elements. Leave blank to use the plain tile grid only.
            </div>
          </div>
          ${this._activeFloor?.floorplan_url ? b `
            <img class="floorplan-preview"
              src=${this._activeFloor.floorplan_url}
              alt="Floorplan preview"
              @error=${(e) => { e.target.style.display = 'none'; }}
            />
          ` : ''}
        </div>
      </div>
    `;
    }
    _renderHardwarePanel() {
        return b `
      <div class="panel">
        ${this._placing ? b `
          <p style="margin:0 0 8px;padding:8px;background:var(--primary-color,#03a9f4);color:#fff;border-radius:4px;font-size:0.85rem;">
            Click anywhere on the map above to place the sensor, then it will snap to that tile.
            <button @click=${() => { this._placing = null; this._redraw(); }}
              style="margin-left:8px;background:none;border:1px solid #fff;color:#fff;border-radius:4px;padding:2px 8px;cursor:pointer;">
              Cancel
            </button>
          </p>
        ` : ''}
        <hspat-sensor-form
          .config=${this._config}
          @config-changed=${this._onConfigChanged}
          @place-sensor=${this._onPlaceSensor}
        ></hspat-sensor-form>
      </div>
    `;
    }
    _renderAuditPanel() {
        return b `
      <div class="panel">
        ${this._running ? b `
          <button
            @click=${this._stopAudit}
            style="padding:8px 16px;background:#f44336;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-bottom:12px;"
          >Stop</button>
          <span style="margin-left:8px;font-size:0.85rem;color:var(--secondary-text-color);">Running simulation…</span>
        ` : b `
          <button
            @click=${this._runAudit}
            style="padding:8px 16px;background:var(--primary-color,#03a9f4);color:#fff;border:none;border-radius:4px;cursor:pointer;margin-bottom:12px;"
          >Run Audit</button>
        `}
        <hspat-results-panel
          .result=${this._auditResult}
          .floors=${this._config.floors ?? []}
        ></hspat-results-panel>
      </div>
    `;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._resizeObserver?.disconnect();
        this._worker?.terminate();
    }
};
HspatCard.styles = i$3 `
    :host {
      display: block;
      position: relative;
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      min-width: 600px;
      max-width: 1200px;
    }
    @media (max-width: 600px) {
      :host {
        min-width: 100%;
      }
    }
    ha-card {
      overflow: hidden;
    }
    .card-header {
      padding: 12px 16px 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .canvas-wrapper {
      position: relative;
      width: 100%;
      touch-action: none;
    }
    canvas {
      display: block;
      width: 100%;
      touch-action: none;
      cursor: crosshair;
    }
    .panel {
      padding: 12px;
    }
    .setup-panel {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .setup-section {
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 12px;
    }
    .setup-section h4 {
      margin: 0 0 10px;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .setup-field {
      margin-bottom: 10px;
    }
    .setup-field:last-child {
      margin-bottom: 0;
    }
    .setup-field label {
      display: block;
      font-size: 0.82rem;
      color: var(--secondary-text-color, #666);
      margin-bottom: 3px;
    }
    .setup-field input {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 0.9rem;
    }
    .setup-field .hint {
      font-size: 0.75rem;
      color: var(--secondary-text-color, #888);
      margin-top: 3px;
    }
    .floorplan-preview {
      margin-top: 6px;
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
    }
    .status-bar {
      padding: 4px 10px;
      font-size: 0.75rem;
      color: var(--secondary-text-color, #888);
      background: var(--card-background-color, #fff);
      border-top: 1px solid var(--divider-color, #e0e0e0);
      min-height: 1.5em;
    }
    .setup-grid-row {
      display: flex;
      gap: 10px;
    }
    .setup-grid-row .setup-field {
      flex: 1;
    }
    .content-row {
      display: block;
    }
    .side-panel {
      width: 100%;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
  `;
__decorate([
    r()
], HspatCard.prototype, "_config", void 0);
__decorate([
    r()
], HspatCard.prototype, "_hass", void 0);
__decorate([
    r()
], HspatCard.prototype, "_mode", void 0);
__decorate([
    r()
], HspatCard.prototype, "_brush", void 0);
__decorate([
    r()
], HspatCard.prototype, "_auditResult", void 0);
__decorate([
    r()
], HspatCard.prototype, "_running", void 0);
__decorate([
    r()
], HspatCard.prototype, "_placing", void 0);
__decorate([
    r()
], HspatCard.prototype, "_activeFloorId", void 0);
__decorate([
    r()
], HspatCard.prototype, "_showGrid", void 0);
__decorate([
    r()
], HspatCard.prototype, "_showStairModal", void 0);
__decorate([
    r()
], HspatCard.prototype, "_pendingStairCoords", void 0);
__decorate([
    r()
], HspatCard.prototype, "_hoverTile", void 0);
HspatCard = __decorate([
    t('hspat-card')
], HspatCard);

/**
 * Weighted Dijkstra pathfinding on a 2-D cost matrix.
 *
 * Tiles with cost >= 9999 are treated as impassable walls.
 * Returns the full path (inclusive of spawn and target), or null if no path exists.
 *
 * @param noiseFactor - fractional ±noise added to each edge cost (0 = deterministic)
 */
function weightedDijkstra(matrix, from, to, noiseFactor = 0) {
    if (from.x === to.x && from.y === to.y)
        return [{ x: from.x, y: from.y }];
    const rows = matrix.length;
    const cols = matrix[0]?.length ?? 0;
    const key = (x, y) => `${x},${y}`;
    const WALL_COST = 9999;
    // dist[y][x] — shortest accumulated cost found so far
    const dist = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
    const prev = new Map();
    const queue = [];
    const enqueue = (cost, x, y) => {
        queue.push([cost, x, y]);
        queue.sort((a, b) => a[0] - b[0]);
    };
    dist[from.y][from.x] = 0;
    enqueue(0, from.x, from.y);
    const DIRS = [
        [0, -1], [0, 1], [-1, 0], [1, 0],
        [-1, -1], [1, -1], [-1, 1], [1, 1],
    ];
    while (queue.length > 0) {
        const [cost, cx, cy] = queue.shift();
        if (cx === to.x && cy === to.y) {
            // Reconstruct path
            const path = [];
            let cur = { x: cx, y: cy };
            while (cur !== undefined) {
                path.unshift(cur);
                cur = prev.get(key(cur.x, cur.y));
            }
            return path;
        }
        if (cost > dist[cy][cx])
            continue; // stale entry
        for (const [dx, dy] of DIRS) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows)
                continue;
            const tileCost = matrix[ny][nx];
            if (tileCost >= WALL_COST)
                continue; // impassable
            // Apply ±noise to the edge weight
            const noise = noiseFactor > 0
                ? 1 + (Math.random() * 2 - 1) * noiseFactor
                : 1;
            const newCost = cost + tileCost * noise;
            if (newCost < dist[ny][nx]) {
                dist[ny][nx] = newCost;
                prev.set(key(nx, ny), { x: cx, y: cy });
                enqueue(newCost, nx, ny);
            }
        }
    }
    return null; // no path found
}
// ─── Multi-floor pathfinding ──────────────────────────────────────────────────
/**
 * Dijkstra across multiple floors connected by stair edges.
 *
 * Each node is keyed as `"floorId:x,y"`.
 * Stair connections are treated as directed edges; add a reciprocal entry
 * in the caller for bi-directional travel.
 *
 * @param matrices   Map of floor_id → 2-D cost matrix (same semantics as weightedDijkstra)
 * @param stairs     Directed stair connections between floors
 * @param from       Starting FloorPoint
 * @param to         Target FloorPoint
 * @param noiseFactor Optional noise applied to edge weights (default 0 = deterministic)
 */
function multiFloorDijkstra(matrices, stairs, from, to, noiseFactor = 0) {
    if (from.floor_id === to.floor_id && from.x === to.x && from.y === to.y) {
        return [{ floor_id: from.floor_id, x: from.x, y: from.y }];
    }
    const WALL_COST = 9999;
    const key = (fp) => `${fp.floor_id}:${fp.x},${fp.y}`;
    const toKey = key(to);
    const dist = new Map();
    const prev = new Map();
    const queue = [];
    const enqueue = (cost, node) => {
        queue.push([cost, node]);
        queue.sort((a, b) => a[0] - b[0]);
    };
    const fromKey = key(from);
    dist.set(fromKey, 0);
    enqueue(0, from);
    const DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
    while (queue.length > 0) {
        const [cost, cur] = queue.shift();
        const ck = key(cur);
        if (ck === toKey) {
            // Reconstruct path
            const path = [];
            let node = cur;
            while (node !== undefined) {
                path.unshift(node);
                node = prev.get(key(node));
            }
            return path;
        }
        if (cost > (dist.get(ck) ?? Infinity))
            continue;
        const matrix = matrices[cur.floor_id];
        if (!matrix)
            continue;
        const rows = matrix.length;
        const cols = matrix[0]?.length ?? 0;
        // Intra-floor neighbours
        for (const [dx, dy] of DIRS) {
            const nx = cur.x + dx;
            const ny = cur.y + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows)
                continue;
            const tileCost = matrix[ny][nx];
            if (tileCost >= WALL_COST)
                continue;
            const noise = noiseFactor > 0 ? 1 + (Math.random() * 2 - 1) * noiseFactor : 1;
            const newCost = cost + tileCost * noise;
            const nb = { floor_id: cur.floor_id, x: nx, y: ny };
            const nk = key(nb);
            if (newCost < (dist.get(nk) ?? Infinity)) {
                dist.set(nk, newCost);
                prev.set(nk, cur);
                enqueue(newCost, nb);
            }
        }
        // Cross-floor stair edges originating from this tile
        for (const s of stairs) {
            if (s.from_floor !== cur.floor_id || s.from_x !== cur.x || s.from_y !== cur.y)
                continue;
            const noise = noiseFactor > 0 ? 1 + (Math.random() * 2 - 1) * noiseFactor : 1;
            const newCost = cost + s.cost * noise;
            const nb = { floor_id: s.to_floor, x: s.to_x, y: s.to_y };
            const nk = key(nb);
            if (newCost < (dist.get(nk) ?? Infinity)) {
                dist.set(nk, newCost);
                prev.set(nk, cur);
                enqueue(newCost, nb);
            }
        }
    }
    return null;
}
/**
 * Multi-floor Monte Carlo heatmap: samples random cross-floor pairs
 * and accumulates tile visit counts keyed as `"floorId:x,y"`.
 */
function multiFloorMonteCarloHeatmap(matrices, stairs, perimeter, valuables, iterations) {
    const heatmap = new Map();
    if (perimeter.length === 0 || valuables.length === 0)
        return heatmap;
    for (let i = 0; i < iterations; i++) {
        const spawn = perimeter[Math.floor(Math.random() * perimeter.length)];
        const target = valuables[Math.floor(Math.random() * valuables.length)];
        const path = multiFloorDijkstra(matrices, stairs, spawn, target, NOISE_FACTOR);
        if (path === null)
            continue;
        for (const node of path) {
            const k = `${node.floor_id}:${node.x},${node.y}`;
            heatmap.set(k, (heatmap.get(k) ?? 0) + 1);
        }
    }
    return heatmap;
}
/**
 * Run Monte Carlo simulation: sample random perimeter→valuable pairs,
 * run weighted Dijkstra with noise, accumulate tile visit counts.
 *
 * Returns a Map<"x,y", count>.
 */
function monteCarloHeatmap(matrix, perimeter, valuables, iterations) {
    const heatmap = new Map();
    if (perimeter.length === 0 || valuables.length === 0)
        return heatmap;
    for (let i = 0; i < iterations; i++) {
        const spawn = perimeter[Math.floor(Math.random() * perimeter.length)];
        const target = valuables[Math.floor(Math.random() * valuables.length)];
        const path = weightedDijkstra(matrix, spawn, target, NOISE_FACTOR);
        if (path === null)
            continue;
        for (const tile of path) {
            const k = `${tile.x},${tile.y}`;
            heatmap.set(k, (heatmap.get(k) ?? 0) + 1);
        }
    }
    return heatmap;
}

var dijkstra = /*#__PURE__*/Object.freeze({
    __proto__: null,
    monteCarloHeatmap: monteCarloHeatmap,
    multiFloorDijkstra: multiFloorDijkstra,
    multiFloorMonteCarloHeatmap: multiFloorMonteCarloHeatmap,
    weightedDijkstra: weightedDijkstra
});

export { HspatCard };
//# sourceMappingURL=hspat-card.js.map
