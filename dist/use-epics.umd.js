!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports,require("react"),require("rxjs"),require("rxjs/operators"),require("immer")):"function"==typeof define&&define.amd?define(["exports","react","rxjs","rxjs/operators","immer"],r):r(e.useEpics={},e.react,e.rxjs,e.operators,e.immer)}(this,function(e,r,t,n,u){u=u&&u.hasOwnProperty("default")?u.default:u;var i=function(e){function r(r,n){var u=this;e.call(this,function(e){var r=u.__notifier.subscribe(e);return r&&!r.closed&&e.next(u.value),r}),this.value=n,this.__notifier=new t.Subject,this.__subscription=r.subscribe(function(e){e!==u.value&&(u.value=e,u.__notifier.next(e))})}return e&&(r.__proto__=e),(r.prototype=Object.create(e&&e.prototype)).constructor=r,r}(t.Observable);e.StateObservable=i,e.useEpics=function(e,o,c){void 0===c&&(c=[]);var f,s=r.useRef(null),a=r.useRef(null),p=r.useState(null),l=p[0],v=p[1],b=r.useMemo(function(){return u(function(r,t){return e(r)[t.type](t.payload)})},[e]),d=r.useReducer(b,o),h=d[0],y=d[1];r.useEffect(function(){s.current=new t.BehaviorSubject(o).pipe(n.observeOn(t.queueScheduler),n.distinctUntilChanged()),a.current=(new t.Subject).pipe(n.observeOn(t.queueScheduler));var e=new i(s.current,o),r=c.map(function(r){return r(a.current,e,f)}).map(function(e){return e.subscribe()});return function(){return r.forEach(function(e){return e.unsubscribe()})}},[]);var m=Object.keys(e(o));return f=r.useMemo(function(){return m.reduce(function(e,r){return e[r]=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return function(e){var t={type:r,payload:e};void 0!==b(h,t)&&y(t),v(t)}(e)},e},{})},[f,h,e,y,m]),r.useEffect(function(){l&&s.current&&a.current&&(s.current.next(h),a.current.next(l),v(null))},[l,s.current,a.current]),[h,f]},e.ofType=function(){for(var e=[],r=arguments.length;r--;)e[r]=arguments[r];return function(r){return r.pipe(n.filter(function(r){if(!r)return!1;var t=r.type,n=e.length;if(1===n)return t===e[0];for(var u=0;u<n;u++)if(t===e[u])return!0;return!1}))}}});
//# sourceMappingURL=use-epics.umd.js.map