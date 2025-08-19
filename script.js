// Konfigurasi server
const SERVER_CONFIG = {
    name: 'Laragon Server',
    url: 'http://tassby.kozow.com:8074/',
    checkInterval: 30000, // 30 detik
    timeout: 10000 // 10 detik timeout
};

// State aplikasi
let isOnline = navigator.onLine;
let serverStatus = 'checking';
let checkInterval;
let lastCheckTime = null;
let responseTime = null;

// DOM Elements
const elements = {
    connectionStatus: document.getElementById('connectionStatus'),
    serverName: document.getElementById('serverName'),
    serverUrl: document.getElementById('serverUrl'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusIcon: document.getElementById('statusIcon'),
    statusLabel: document.getElementById('statusLabel'),
    lastCheck: document.getElementById('lastCheck'),
    responseTime: document.getElementById('responseTime'),
    refreshBtn: document.getElementById('refreshBtn'),
    offlineNotification: document.getElementById('offlineNotification')
};

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    registerServiceWorker();
    startServerMonitoring();
});

// Inisialisasi aplikasi
function initializeApp() {
    // Set informasi server
    elements.serverName.textContent = SERVER_CONFIG.name;
    elements.serverUrl.textContent = SERVER_CONFIG.url;
    
    // Update status koneksi awal
    updateConnectionStatus();
    
    // Cek status server pertama kali
    checkServerStatus();
}

// Setup event listeners
function setupEventListeners() {
    // Event listener untuk status online/offline
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Event listener untuk refresh button
    elements.refreshBtn.addEventListener('click', checkServerStatus);
    
    // Event listener untuk visibility change (ketika tab aktif/tidak aktif)
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Handle ketika kembali online
function handleOnline() {
    isOnline = true;
    updateConnectionStatus();
    hideOfflineNotification();
    checkServerStatus();
    startServerMonitoring();
}

// Handle ketika offline
function handleOffline() {
    isOnline = false;
    updateConnectionStatus();
    showOfflineNotification();
    stopServerMonitoring();
    updateServerStatus('offline', 'Tidak ada koneksi internet');
}

// Handle visibility change
function handleVisibilityChange() {
    if (document.hidden) {
        // Tab tidak aktif, kurangi frekuensi pengecekan
        stopServerMonitoring();
    } else {
        // Tab aktif kembali, mulai monitoring normal
        if (isOnline) {
            checkServerStatus();
            startServerMonitoring();
        }
    }
}

// Update status koneksi
function updateConnectionStatus() {
    const statusDot = elements.connectionStatus.querySelector('.status-dot');
    const statusText = elements.connectionStatus.querySelector('.status-text');
    
    if (isOnline) {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'Terhubung ke internet';
    } else {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'Tidak ada koneksi internet';
    }
}

// Cek status server
async function checkServerStatus() {
    if (!isOnline) {
        updateServerStatus('offline', 'Tidak ada koneksi internet');
        return;
    }
    
    // Set status checking
    updateServerStatus('checking', 'Memeriksa...');
    
    const startTime = Date.now();
    
    try {
        // Gunakan fetch dengan timeout dan mode no-cors untuk menghindari CORS
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SERVER_CONFIG.timeout);
        
        const response = await fetch("/api/proxy", {
            method: 'GET',
            cache: 'no-cache'
        });
        
        const data = await response.json();

        if (data.success) {
            updateServerStatus('online', 'Server Aktif');
            responseTime = data.responseTime;
        } else {
            updateServerStatus('offline', 'Server Tidak Aktif: ' + data.error);
            responseTime = data.responseTime;
        }
        
        updateLastCheck();
        updateResponseTime();
        
    } catch (error) {
        const endTime = Date.now();
        responseTime = endTime - startTime;
        
        // Cek jenis error
        if (error.name === 'AbortError') {
            updateServerStatus('offline', 'Timeout - Server tidak merespons');
        } else if (error.message.includes('Failed to fetch')) {
            updateServerStatus('offline', 'Server Tidak Aktif');
        } else {
            updateServerStatus('offline', 'Error: ' + error.message);
        }
        
        updateLastCheck();
        updateResponseTime();
    }
}

// Update status server di UI
function updateServerStatus(status, message) {
    serverStatus = status;
    
    // Update class indicator
    elements.statusIndicator.className = `status-indicator ${status}`;
    
    // Update icon
    let iconContent = '';
    switch (status) {
        case 'online':
            iconContent = '✅';
            break;
        case 'offline':
            iconContent = '❌';
            break;
        case 'checking':
            iconContent = '<div class="loading-spinner"></div>';
            break;
    }
    
    elements.statusIcon.innerHTML = iconContent;
    elements.statusLabel.textContent = message;
}

// Update waktu pengecekan terakhir
function updateLastCheck() {
    lastCheckTime = new Date();
    elements.lastCheck.textContent = lastCheckTime.toLocaleTimeString('id-ID');
}

// Update response time
function updateResponseTime() {
    if (responseTime !== null) {
        elements.responseTime.textContent = `${responseTime}ms`;
    } else {
        elements.responseTime.textContent = '-';
    }
}

// Mulai monitoring server
function startServerMonitoring() {
    stopServerMonitoring(); // Stop existing interval
    
    checkInterval = setInterval(() => {
        if (isOnline && !document.hidden) {
            checkServerStatus();
        }
    }, SERVER_CONFIG.checkInterval);
}

// Stop monitoring server
function stopServerMonitoring() {
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
}

// Show offline notification
function showOfflineNotification() {
    elements.offlineNotification.classList.add('show');
}

// Hide offline notification
function hideOfflineNotification() {
    elements.offlineNotification.classList.remove('show');
}

// Register Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('Service Worker registered successfully:', registration);
            
            // Listen untuk update service worker
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Ada update baru, bisa tampilkan notifikasi untuk reload
                        console.log('New version available! Please refresh the page.');
                    }
                });
            });
            
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
}

// Install PWA prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Optionally, show install button
    showInstallButton();
});

function showInstallButton() {
    // Bisa tambahkan button install PWA di sini jika diperlukan
    console.log('PWA can be installed');
}

// Handle app installed
window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
    deferredPrompt = null;
});

// Utility functions
function formatTime(date) {
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatDate(date) {
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Export functions untuk debugging (opsional)
window.serverMonitor = {
    checkServerStatus,
    startServerMonitoring,
    stopServerMonitoring,
    getStatus: () => ({
        isOnline,
        serverStatus,
        lastCheckTime,
        responseTime
    })
};

