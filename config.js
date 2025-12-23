// CONFIGURASI SISTEM PANEL HOST
// Semua data sensitif disimpan di sini

const CONFIG = {
    // API Credentials for Payment Gateway
    paymentGateway: {
        username: "skyzopedia", // Ganti dengan username orderkuota Anda
        token: "2088243:gGrny3pwsEWxulfLaakhiQDvMPhj7Ke", // Ganti dengan token orderkuota Anda
        baseUrl: "https://api.orderkuota.com" // Base URL API Payment
    },
    
    // Panel Pterodactyl Configuration
    panel: {
        domain: "https://romadzstore-real.privyxhost.my.id", // Ganti dengan domain panel Anda
        apiKey: "ptla_zTHDmaSL3VRfRt4b5e5fhZISy9bnd4OyFhWlRLgIIF0", // Ganti dengan API Key panel Anda
        nestId: 1, // Nest ID default
        eggId: 1, // Egg ID default
        locationId: 1, // Location ID default
        dockerImage: "ghcr.io/pterodactyl/yolks:nodejs_20" // Docker image default
    },
    
    // Package Configuration
    packages: [
        {
            name: "1GB",
            ram: 1000,
            cpu: 40,
            disk: 1000,
            price: 1000,
            description: "Paket cocok untuk bot kecil atau aplikasi ringan"
        },
        {
            name: "2GB",
            ram: 2000,
            cpu: 60,
            disk: 1000,
            price: 2000,
            description: "Paket standar untuk bot menengah"
        },
        {
            name: "3GB",
            ram: 3000,
            cpu: 80,
            disk: 2000,
            price: 3000,
            description: "Paket nyaman untuk bot dengan beban sedang"
        },
        {
            name: "4GB",
            ram: 4000,
            cpu: 100,
            disk: 3000,
            price: 4000,
            description: "Paket power untuk bot dengan banyak fitur"
        },
        {
            name: "5GB",
            ram: 5000,
            cpu: 120,
            disk: 4000,
            price: 5000,
            description: "Paket premium untuk bot dengan performa tinggi"
        },
        {
            name: "6GB",
            ram: 6000,
            cpu: 140,
            disk: 5000,
            price: 6000,
            description: "Paket enterprise untuk kebutuhan khusus"
        },
        {
            name: "7GB",
            ram: 7000,
            cpu: 160,
            disk: 6000,
            price: 7000,
            description: "Paket ultimate untuk aplikasi kompleks"
        },
        {
            name: "8GB",
            ram: 8000,
            cpu: 180,
            disk: 7000,
            price: 8000,
            description: "Paket maksimal untuk server kecil"
        },
        {
            name: "9GB",
            ram: 9000,
            cpu: 200,
            disk: 8000,
            price: 9000,
            description: "Paket heavy untuk aplikasi resource intensive"
        },
        {
            name: "10GB",
            ram: 10000,
            cpu: 220,
            disk: 9000,
            price: 10000,
            description: "Paket extreme untuk server dengan beban berat"
        },
        {
            name: "Unlimited",
            ram: 0, // 0 berarti unlimited
            cpu: 0, // 0 berarti unlimited
            disk: 0, // 0 berarti unlimited
            price: 11000,
            description: "Paket unlimited untuk kebutuhan tak terbatas"
        }
    ],
    
    // System Configuration
    system: {
        maxActiveTransactions: 1, // Maksimal transaksi aktif per user
        qrisExpiryMinutes: 5, // Waktu kedaluwarsa QRIS
        pollingInterval: 5000, // Interval polling pembayaran (ms)
        randomFeeMin: 110, // Biaya unik minimum
        randomFeeMax: 250 // Biaya unik maksimum
    },
    
    // Default User Configuration
    defaultUser: {
        first_name: "Panel",
        last_name: "User",
        language: "id"
    },
    
    // Server Configuration
    serverDefaults: {
        startup: "npm start",
        environment: {
            USER_UPLOAD: "0",
            AUTO_UPDATE: "1",
            NODE_ENV: "production"
        },
        feature_limits: {
            databases: 0,
            allocations: 1,
            backups: 0
        }
    }
};

// Export config untuk digunakan di script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
