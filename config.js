// ============================================
// KONFIGURASI SAPURA CLOUD
// ============================================

// MODE SISTEM: 'demo' atau 'production'
const SYSTEM_MODE = 'production'; // Ubah ke 'production' untuk pakai API asli

// ============================================
// 1. KONFIGURASI API PEMBAYARAN (OrderKuota)
// ============================================
const PAYMENT_CONFIG = {
    // Mode DEMO (simulasi tanpa API asli)
    demo: {
        simulateDelay: 1500, // Delay simulasi dalam ms
        successRate: 0.3,    // Persentase sukses (0-1)
        mockQRIS: true       // Gunakan QRIS mock
    },
    
    // Mode PRODUCTION (API asli)
    production: {
        baseUrl: "https://api-simplebot.vercel.app/orderkuota",
        endpoints: {
            createPayment: "/createpayment",
            checkMutation: "/mutasiqr"
        },
        credentials: {
            apiKey: "skyy",       // GANTI DENGAN API KEY ANDA
            username: "skyzopedia", // GANTI DENGAN USERNAME ANDA
            token: "2088243:gGrny3pwsEWxulfLaakhiQDvMPhj7Ke"        // GANTI DENGAN TOKEN ANDA
        }
    }
};

// ============================================
// 2. KONFIGURASI PANEL PTERODACTYL
// ============================================
const PANEL_CONFIG = {
    // Mode DEMO
    demo: {
        simulateDelay: 2000,
        mockData: true
    },
    
    // Mode PRODUCTION
    production: {
        domain: "https://romadzstore-real.privyxhost.my.id", // GANTI DENGAN DOMAIN PANEL ANDA
        apiKey: "ptla_zTHDmaSL3VRfRt4b5e5fhZISy9bnd4OyFhWlRLgIIF0", // GANTI DENGAN API KEY ANDA
        endpoints: {
            createUser: "/api/application/users",
            createServer: "/api/application/servers",
            getEgg: "/api/application/nests/{nest}/eggs/{egg}"
        },
        defaults: {
            nestId: 15,        // Nest ID default
            eggId: 5,         // Egg ID default
            locationId: 1,    // Location ID default
            dockerImage: "ghcr.io/parkervcp/yolks:nodejs_20",
            limits: {
                swap: 0,
                io: 500,
                databases: 5,
                backups: 5,
                allocations: 5
            },
            environment: {
                INST: "npm",
                USER_UPLOAD: "0",
                AUTO_UPDATE: "0",
                CMD_RUN: "npm start"
            }
        }
    }
};

// ============================================
// 3. DAFTAR PAKET PANEL (SESUAI BOT WHATSAPP)
// ============================================
const PACKAGES = {
    "unlimited": {
        id: "unlimited",
        name: "Unlimited",
        ram: 0,
        disk: 0,
        cpu: 0,
        price: 11000,
        description: "RAM ∞ || CPU ∞ || DISK ∞",
        display: "∞"
    },
    "1gb": {
        id: "1gb",
        name: "1GB",
        ram: 1000,
        disk: 1000,
        cpu: 40,
        price: 1000,
        description: "RAM 1GB || CPU 40% || DISK 1GB",
        display: "1GB"
    },
    "2gb": {
        id: "2gb",
        name: "2GB",
        ram: 2000,
        disk: 1000,
        cpu: 60,
        price: 2000,
        description: "RAM 2GB || CPU 60% || DISK 1GB",
        display: "2GB"
    },
    "3gb": {
        id: "3gb",
        name: "3GB",
        ram: 3000,
        disk: 2000,
        cpu: 80,
        price: 3000,
        description: "RAM 3GB || CPU 80% || DISK 2GB",
        display: "3GB"
    },
    "4gb": {
        id: "4gb",
        name: "4GB",
        ram: 4000,
        disk: 2000,
        cpu: 100,
        price: 4000,
        description: "RAM 4GB || CPU 100% || DISK 2GB",
        display: "4GB"
    },
    "5gb": {
        id: "5gb",
        name: "5GB",
        ram: 5000,
        disk: 3000,
        cpu: 120,
        price: 5000,
        description: "RAM 5GB || CPU 120% || DISK 3GB",
        display: "5GB"
    },
    "6gb": {
        id: "6gb",
        name: "6GB",
        ram: 6000,
        disk: 3000,
        cpu: 140,
        price: 6000,
        description: "RAM 6GB || CPU 140% || DISK 3GB",
        display: "6GB"
    },
    "7gb": {
        id: "7gb",
        name: "7GB",
        ram: 7000,
        disk: 4000,
        cpu: 160,
        price: 7000,
        description: "RAM 7GB || CPU 160% || DISK 4GB",
        display: "7GB"
    },
    "8gb": {
        id: "8gb",
        name: "8GB",
        ram: 8000,
        disk: 4000,
        cpu: 180,
        price: 8000,
        description: "RAM 8GB || CPU 180% || DISK 4GB",
        display: "8GB"
    },
    "9gb": {
        id: "9gb",
        name: "9GB",
        ram: 9000,
        disk: 5000,
        cpu: 200,
        price: 9000,
        description: "RAM 9GB || CPU 200% || DISK 5GB",
        display: "9GB"
    },
    "10gb": {
        id: "10gb",
        name: "10GB",
        ram: 10000,
        disk: 5000,
        cpu: 220,
        price: 10000,
        description: "RAM 10GB || CPU 220% || DISK 5GB",
        display: "10GB"
    }
};

// ============================================
// 4. KONFIGURASI SISTEM
// ============================================
const SYSTEM_CONFIG = {
    // Umum
    appName: "Sapura Cloud",
    version: "1.0.0",
    
    // Pembayaran
    payment: {
        expiryMinutes: 5,      // QRIS expired dalam menit
        pollingInterval: 5000, // Cek pembayaran setiap ms
        uniqueFee: {
            min: 110,
            max: 250
        }
    },
    
    // User & Transaksi
    user: {
        maxActiveTransactions: 1,
        passwordSuffix: "12*_", // Suffix untuk password
        emailDomain: "@rmddz.com"
    },
    
    // Storage
    storage: {
        historyKey: "sapuracloud_transactions",
        settingsKey: "sapuracloud_settings"
    },
    
    // Default Messages
    messages: {
        success: "✅ Operasi berhasil",
        error: "❌ Terjadi kesalahan",
        waiting: "⏳ Sedang memproses...",
        expired: "⏰ Waktu habis",
        cancelled: "❌ Dibatalkan"
    }
};

// ============================================
// 5. FUNGSI UTILITAS
// ============================================

// Format angka ke Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format angka biasa
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Generate angka random
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate ID transaksi
function generateTransactionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `TX${timestamp}${random}`.toUpperCase();
}

// Generate ID server
function generateServerId() {
    return `SRV${Date.now().toString().substr(-8)}`;
}

// Generate password
function generatePassword(username) {
    return username + SYSTEM_CONFIG.user.passwordSuffix;
}

// Format tanggal Indonesia
function formatDate(date = new Date()) {
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Kapitalisasi huruf pertama
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Validasi username
function validateUsername(username) {
    if (!username) return { valid: false, error: "Username wajib diisi" };
    if (username.length < 3) return { valid: false, error: "Minimal 3 karakter" };
    if (username.length > 20) return { valid: false, error: "Maksimal 20 karakter" };
    if (!/^[a-z0-9_]+$/i.test(username)) return { valid: false, error: "Hanya huruf, angka, underscore" };
    if (username.includes(' ')) return { valid: false, error: "Tidak boleh ada spasi" };
    return { valid: true, error: null };
}

// Simpan ke localStorage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Gagal menyimpan ke storage:', error);
        return false;
    }
}

// Baca dari localStorage
function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Gagal membaca dari storage:', error);
        return null;
    }
}

// ============================================
// 6. EKSPOR KONFIGURASI
// ============================================
const CONFIG = {
    mode: SYSTEM_MODE,
    payment: PAYMENT_CONFIG,
    panel: PANEL_CONFIG,
    packages: PACKAGES,
    system: SYSTEM_CONFIG,
    
    // Fungsi utilitas
    utils: {
        formatRupiah,
        formatNumber,
        randomBetween,
        generateTransactionId,
        generateServerId,
        generatePassword,
        formatDate,
        capitalize,
        validateUsername,
        saveToStorage,
        loadFromStorage
    }
};

// Untuk Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Untuk browser
window.CONFIG = CONFIG;