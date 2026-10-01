// Mingkwan Smart Scale - service worker
// หน้าเว็บ: ลองโหลดจากเน็ตก่อน (ได้เวอร์ชันล่าสุดเสมอ) ถ้าออฟไลน์ค่อยใช้ที่แคช
// ไม่ยุ่งกับคำขอข้ามโดเมน (Supabase, CDN, ฟอนต์) และไม่แคช POST/websocket -> ข้อมูลบิลสดใหม่เสมอ
const V = 'mk-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png']).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;            // Supabase / CDN / fonts: ปล่อยผ่านตามปกติ
  e.respondWith(
    fetch(r, { cache: 'no-store' }).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});
