// Service Worker untuk Server Monitor PWA
const CACHE_NAME = 'server-monitor-v1.0.0';
const STATIC_CACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation complete');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests and server monitoring requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Skip server monitoring API calls
    if (url.pathname.includes('tassby.kozow.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', request.url);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network', request.url);
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        // Cache the response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', error);
                        
                        // Return offline page or cached version
                        if (request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for server status updates (optional)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'server-status-sync') {
        event.waitUntil(
            // Notify main app to check server status
            self.clients.matchAll()
                .then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'BACKGROUND_SYNC',
                            action: 'CHECK_SERVER_STATUS'
                        });
                    });
                })
        );
    }
});

// Push notification handler (optional for future use)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'Server status update',
        icon: './icon-192x192.png',
        badge: './badge-72x72.png',
        tag: 'server-status',
        renotify: true,
        requireInteraction: false,
        actions: [
            {
                action: 'check',
                title: 'Check Status',
                icon: './check-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: './dismiss-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Server Monitor', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event.action);
    
    event.notification.close();
    
    if (event.action === 'check') {
        // Open app and check server status
        event.waitUntil(
            self.clients.matchAll({ type: 'window' })
                .then((clients) => {
                    // Focus existing window if available
                    for (const client of clients) {
                        if (client.url.includes(location.origin) && 'focus' in client) {
                            client.postMessage({
                                type: 'NOTIFICATION_ACTION',
                                action: 'CHECK_SERVER_STATUS'
                            });
                            return client.focus();
                        }
                    }
                    
                    // Open new window if no existing window
                    if (self.clients.openWindow) {
                        return self.clients.openWindow('./');
                    }
                })
        );
    }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    const { type, action } = event.data;
    
    if (type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (type === 'CACHE_UPDATE') {
        // Update cache with new resources
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => {
                    return cache.addAll(STATIC_CACHE_URLS);
                })
        );
    }
});

// Error handler
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled rejection', event.reason);
    event.preventDefault();
});

