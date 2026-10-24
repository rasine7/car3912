const V='car-v3';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='share').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method==='POST'&&u.origin===location.origin&&u.pathname.endsWith('/share')){
    e.respondWith((async()=>{
      try{
        const fd=await e.request.formData(); const c=await caches.open('share');
        const f=fd.get('image');
        if(f&&f.size){await c.put('img',new Response(f,{headers:{'Content-Type':f.type||'image/png'}}))}else{await c.delete('img')}
        const txt=[fd.get('title'),fd.get('text'),fd.get('url')].filter(Boolean).join('\n');
        await c.put('txt',new Response(txt));
      }catch(err){}
      return Response.redirect(new URL('./?shared=1',self.registration.scope).href,303);
    })());
    return;
  }
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)));
});
