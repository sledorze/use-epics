import{useMemo as r,useReducer as n,useEffect as t,useRef as e,useState as u}from"react";import{BehaviorSubject as o,Subject as i,queueScheduler as c,Observable as f}from"rxjs";import{observeOn as a,distinctUntilChanged as p,filter as s}from"rxjs/operators";import l from"immer";var v=function(r){function n(n,t){var e=this;r.call(this,function(r){var n=e.__notifier.subscribe(r);return n&&!n.closed&&r.next(e.value),n}),this.value=t,this.__notifier=new i,this.__subscription=n.subscribe(function(r){r!==e.value&&(e.value=r,e.__notifier.next(r))})}return r&&(n.__proto__=r),(n.prototype=Object.create(r&&r.prototype)).constructor=n,n}(f);function m(f,s,m){void 0===m&&(m=[]);var _,b=e(null),h=e(null),y=u(null),x=y[0],d=y[1],j=r(function(){return l(function(r,n){return f(r)[n.type](n.payload)})},[f]),w=n(j,s),g=w[0],O=w[1];t(function(){b.current=new o(s).pipe(a(c),p()),h.current=(new i).pipe(a(c));var r=new v(b.current,s),n=m.map(function(n){return n(h.current,r,_)}).map(function(r){return r.subscribe()});return function(){return n.forEach(function(r){return r.unsubscribe()})}},[]);var k=Object.keys(f(s));return _=r(function(){return k.reduce(function(r,n){return r[n]=function(){for(var r=[],t=arguments.length;t--;)r[t]=arguments[t];return function(r){var t={type:n,payload:r};void 0!==j(g,t)&&O(t),d(t)}(r)},r},{})},[_,g,f,O,k]),t(function(){x&&b.current&&h.current&&(b.current.next(g),h.current.next(x),d(null))},[x,b.current,h.current]),[g,_]}var _=function(){for(var r=[],n=arguments.length;n--;)r[n]=arguments[n];return function(n){return n.pipe(s(function(n){if(!n)return!1;var t=n.type,e=r.length;if(1===e)return t===r[0];for(var u=0;u<e;u++)if(t===r[u])return!0;return!1}))}};export{v as StateObservable,m as useEpics,_ as ofType};
//# sourceMappingURL=use-epics.m.js.map
