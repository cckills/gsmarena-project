// ✅ تحديث تلقائي للكاش في كل نشر جديد (حسب التاريخ والوقت)
const CACHE_VERSION = new Date().toISOString().replace(/[:.]/g, '-');
const CACHE_NAME = `gsmarena-cache-${CACHE_VERSION}`;

// 🗂️ الملفات الأساسية التي سيتم تخزينها
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 🧱 تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  console.log('📦 تثبيت Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ تم تخزين الملفات الأساسية في الكاش');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting(); // لجعل التحديث يفعّل فورًا
});

// 🔄 تفعيل Service Worker وحذف الإصدارات القديمة من الكاش
self.addEventListener('activate', event => {
  console.log('🚀 تفعيل Service Worker...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ حذف الكاش القديم:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // لجعل التحديث يعمل مباشرة دون إعادة تحميل
});

// 🌐 اعتراض الطلبات (fetch) وتقديم الكاش أولاً ثم الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // لو وجد في الكاش → استخدمه
        if (response) return response;

        // وإلا، اجلبه من الإنترنت وخزّنه في الكاش للمرة القادمة
        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return networkResponse;
          })
          .catch(() => caches.match('/index.html')); // في حالة انقطاع الإنترنت
      })
  );
});

console.log(`🧠 Service Worker جاهز - الإصدار: ${CACHE_NAME}`);

