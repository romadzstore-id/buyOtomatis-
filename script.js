// ============================================
// SCRIPT UTAMA SAPURA CLOUD
// ============================================

// State Management
const AppState = {
    // Data transaksi
    transaction: null,
    credentials: null,
    
    // Status
    isLoading: false,
    currentStep: 1,
    currentPage: 'home',
    
    // Intervals
    paymentPolling: null,
    countdownInterval: null,
    
    // Settings
    settings: {
        mode: CONFIG.mode,
        autoPolling: true
    }
};

// Transaction Manager
const TransactionManager = {
    // Load all transactions
    getAll() {
        return CONFIG.utils.loadFromStorage(CONFIG.system.storage.historyKey) || [];
    },
    
    // Save all transactions
    saveAll(transactions) {
        return CONFIG.utils.saveToStorage(CONFIG.system.storage.historyKey, transactions);
    },
    
    // Add new transaction
    add(transaction) {
        const transactions = this.getAll();
        transactions.unshift(transaction);
        this.saveAll(transactions);
        return transaction;
    },
    
    // Update transaction
    update(id, updates) {
        const transactions = this.getAll();
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveAll(transactions);
            return transactions[index];
        }
        return null;
    },
    
    // Get transaction by ID
    getById(id) {
        const transactions = this.getAll();
        return transactions.find(t => t.id === id) || null;
    },
    
    // Get user transactions
    getUserTransactions(username) {
        const transactions = this.getAll();
        return transactions.filter(t => t.username === username);
    },
    
    // Get active transactions
    getActiveTransactions() {
        const transactions = this.getAll();
        return transactions.filter(t => t.status === 'pending');
    },
    
    // Check if user has active transaction
    hasActiveTransaction(username) {
        const userTransactions = this.getUserTransactions(username);
        return userTransactions.some(t => t.status === 'pending');
    }
};

// DOM Elements
const DOM = {
    // Steps
    steps: document.querySelectorAll('.step'),
    stepContents: document.querySelectorAll('.step-content'),
    
    // Inputs
    usernameInput: document.getElementById('username'),
    usernameError: document.getElementById('username-error'),
    
    // Buttons
    nextToPackagesBtn: document.getElementById('next-to-packages'),
    backToUsernameBtn: document.getElementById('back-to-username'),
    nextToPaymentBtn: document.getElementById('next-to-payment'),
    backToPackagesBtn: document.getElementById('back-to-packages'),
    cancelPaymentBtn: document.getElementById('cancel-payment'),
    newTransactionBtn: document.getElementById('new-transaction'),
    saveDetailsBtn: document.getElementById('save-details'),
    retryTransactionBtn: document.getElementById('retry-transaction'),
    backToStartBtn: document.getElementById('back-to-start'),
    toggleModeBtn: document.getElementById('toggle-mode'),
    
    // Navigation
    navHome: document.getElementById('nav-home'),
    navHistory: document.getElementById('nav-history'),
    navSupport: document.getElementById('nav-support'),
    
    // Package selection
    packageContainer: document.getElementById('package-container'),
    selectedPackageInfo: document.getElementById('selected-package-info'),
    
    // Payment
    paymentId: document.getElementById('payment-id'),
    paymentUsername: document.getElementById('payment-username'),
    paymentPackage: document.getElementById('payment-package'),
    packagePrice: document.getElementById('package-price'),
    uniqueFee: document.getElementById('unique-fee'),
    totalAmount: document.getElementById('total-amount'),
    paymentExpired: document.getElementById('payment-expired'),
    qrisPlaceholder: document.getElementById('qris-placeholder'),
    qrisImageContainer: document.getElementById('qris-image-container'),
    qrisImage: document.getElementById('qris-image'),
    qrisAmount: document.getElementById('qris-amount'),
    countdownTimer: document.getElementById('countdown-timer'),
    paymentStatus: document.getElementById('payment-status'),
    paymentAmountDisplay: document.getElementById('payment-amount-display'),
    
    // Results
    resultTransactionId: document.getElementById('result-transaction-id'),
    resultPaymentAmount: document.getElementById('result-payment-amount'),
    resultServerId: document.getElementById('result-server-id'),
    resultUsername: document.getElementById('result-username'),
    resultPassword: document.getElementById('result-password'),
    resultActivationDate: document.getElementById('result-activation-date'),
    resultRam: document.getElementById('result-ram'),
    resultDisk: document.getElementById('result-disk'),
    resultCpu: document.getElementById('result-cpu'),
    resultDomain: document.getElementById('result-domain'),
    panelUrl: document.getElementById('panel-url'),
    
    // History
    historyPage: document.getElementById('page-history'),
    historyList: document.getElementById('history-list'),
    historyDetail: document.getElementById('history-detail'),
    historySearch: document.getElementById('history-search'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    
    // Loading & Toast
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingMessage: document.getElementById('loading-message'),
    loadingDetail: document.getElementById('loading-detail'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    modeIndicator: document.getElementById('mode-indicator')
};

// Initialize Application
function initApp() {
    console.log('🚀 Sapura Cloud v' + CONFIG.system.version);
    console.log('⚙️  Mode:', CONFIG.mode);
    
    // Load settings
    loadSettings();
    
    // Setup UI
    setupPackages();
    setupEventListeners();
    
    // Check for active transactions
    checkActiveTransactions();
    
    // Update mode indicator
    updateModeIndicator();
}

// Load settings from localStorage
function loadSettings() {
    const saved = CONFIG.utils.loadFromStorage(CONFIG.system.storage.settingsKey);
    if (saved) {
        AppState.settings = { ...AppState.settings, ...saved };
    }
}

// Save settings to localStorage
function saveSettings() {
    CONFIG.utils.saveToStorage(CONFIG.system.storage.settingsKey, AppState.settings);
}

// Setup package cards
function setupPackages() {
    DOM.packageContainer.innerHTML = '';
    
    const packageOrder = ['unlimited', '1gb', '2gb', '3gb', '4gb', '5gb', '6gb', '7gb', '8gb', '9gb', '10gb'];
    
    packageOrder.forEach(pkgKey => {
        const pkg = CONFIG.packages[pkgKey];
        if (!pkg) return;
        
        const card = document.createElement('div');
        card.className = `package-card ${pkgKey === 'unlimited' ? 'unlimited' : ''}`;
        card.dataset.package = pkgKey;
        
        card.innerHTML = `
            <div class="package-header">
                <div class="package-ram">${pkg.display}</div>
                <div class="package-price">${CONFIG.utils.formatRupiah(pkg.price)}</div>
            </div>
            <div class="package-specs">
                <div class="spec-item">
                    <span class="spec-label">RAM:</span>
                    <span class="spec-value">${pkg.ram === 0 ? '∞' : pkg.name}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">CPU:</span>
                    <span class="spec-value">${pkg.cpu === 0 ? '∞' : pkg.cpu + '%'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">DISK:</span>
                    <span class="spec-value">${pkg.disk === 0 ? '∞' : pkg.disk/1000 + 'GB'}</span>
                </div>
            </div>
            <p style="color: var(--dark-muted); font-size: 0.9rem; margin: 15px 0;">${pkg.description}</p>
            <button class="package-select-btn" onclick="selectPackage('${pkgKey}')">
                Pilih Paket
            </button>
        `;
        
        DOM.packageContainer.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Username validation
    DOM.usernameInput.addEventListener('input', validateUsernameInput);
    
    // Navigation buttons
    DOM.nextToPackagesBtn.addEventListener('click', goToPackages);
    DOM.backToUsernameBtn.addEventListener('click', () => showStep(1));
    DOM.nextToPaymentBtn.addEventListener('click', startPayment);
    DOM.backToPackagesBtn.addEventListener('click', () => {
        if (confirm('Batalkan pembayaran dan ganti paket?')) {
            cancelPayment(false);
            showStep(2);
        }
    });
    DOM.cancelPaymentBtn.addEventListener('click', () => {
        if (confirm('Batalkan transaksi ini?')) {
            cancelPayment(true);
            showStep(1);
        }
    });
    
    // Results buttons
    DOM.newTransactionBtn.addEventListener('click', startNewTransaction);
    DOM.saveDetailsBtn.addEventListener('click', savePanelDetails);
    DOM.retryTransactionBtn.addEventListener('click', () => showStep(1));
    DOM.backToStartBtn.addEventListener('click', () => showStep(1));
    
    // Navigation
    DOM.navHome.addEventListener('click', (e) => {
        e.preventDefault();
        showHome();
    });
    
    DOM.navHistory.addEventListener('click', (e) => {
        e.preventDefault();
        showHistory();
    });
    
    DOM.navSupport.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Hubungi admin untuk support', 'info');
    });
    
    // Mode toggle
    DOM.toggleModeBtn.addEventListener('click', toggleMode);
    
    // History search
    DOM.historySearch.addEventListener('input', () => loadHistory());
    
    // History filters
    DOM.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadHistory();
        });
    });
    
    // Copy buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.copy-btn')) {
            const btn = e.target.closest('.copy-btn');
            const targetId = btn.dataset.target;
            const element = document.getElementById(targetId);
            if (element) {
                copyToClipboard(element.textContent);
                showToast('Berhasil disalin!', 'success');
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (AppState.credentials) savePanelDetails();
        }
    });
}

// Validate username input
function validateUsernameInput() {
    const username = DOM.usernameInput.value.trim();
    const validation = CONFIG.utils.validateUsername(username);
    
    DOM.usernameError.textContent = validation.error || '';
    DOM.usernameError.style.display = validation.error ? 'block' : 'none';
    
    if (validation.error) {
        DOM.nextToPackagesBtn.disabled = true;
        return false;
    }
    
    // Check for active transactions
    if (TransactionManager.hasActiveTransaction(username)) {
        DOM.usernameError.textContent = 'Username ini memiliki transaksi aktif!';
        DOM.usernameError.style.display = 'block';
        DOM.nextToPackagesBtn.disabled = true;
        return false;
    }
    
    DOM.nextToPackagesBtn.disabled = false;
    return true;
}

// Select package
window.selectPackage = function(pkgKey) {
    // Update UI
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.package-card[data-package="${pkgKey}"]`);
    if (selectedCard) selectedCard.classList.add('selected');
    
    // Store selection
    AppState.selectedPackage = CONFIG.packages[pkgKey];
    AppState.selectedPackageKey = pkgKey;
    
    // Show package info
    DOM.selectedPackageInfo.innerHTML = `
        <h3><i class="fas fa-check-circle"></i> Paket Dipilih</h3>
        <div class="package-specs">
            <div class="spec-item">
                <span class="spec-label">Paket:</span>
                <span class="spec-value">${AppState.selectedPackage.name}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Harga:</span>
                <span class="spec-value">${CONFIG.utils.formatRupiah(AppState.selectedPackage.price)}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Spesifikasi:</span>
                <span class="spec-value">${AppState.selectedPackage.description}</span>
            </div>
        </div>
        <p style="margin-top: 10px; color: var(--dark-muted);">
            Klik "Bayar Sekarang" untuk melanjutkan
        </p>
    `;
    
    DOM.selectedPackageInfo.style.display = 'block';
    DOM.nextToPaymentBtn.disabled = false;
};

// Go to packages step
function goToPackages() {
    if (validateUsernameInput()) {
        AppState.username = DOM.usernameInput.value.trim();
        showStep(2);
    }
}

// Start payment process
async function startPayment() {
    if (!AppState.selectedPackage) {
        showToast('Pilih paket terlebih dahulu', 'error');
        return;
    }
    
    showLoading('Membuat transaksi pembayaran...');
    
    try {
        // Create transaction
        const transaction = await createTransaction();
        AppState.transaction = transaction;
        
        // Show payment step
        showStep(3);
        updatePaymentUI(transaction);
        
        // Generate QRIS
        await generateQRIS(transaction);
        
        // Start polling
        startPaymentPolling(transaction.id);
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showToast('Gagal membuat transaksi: ' + error.message, 'error');
    }
}

// Create transaction
async function createTransaction() {
    const username = AppState.username;
    const pkg = AppState.selectedPackage;
    
    // Calculate amounts
    const uniqueFee = CONFIG.utils.randomBetween(
        CONFIG.system.payment.uniqueFee.min,
        CONFIG.system.payment.uniqueFee.max
    );
    
    const totalAmount = pkg.price + uniqueFee;
    
    // Create transaction object
    const transaction = {
        id: CONFIG.utils.generateTransactionId(),
        username: username,
        package: pkg.id,
        packageName: pkg.name,
        packagePrice: pkg.price,
        uniqueFee: uniqueFee,
        totalAmount: totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (CONFIG.system.payment.expiryMinutes * 60000)).toISOString(),
        qrisUrl: null,
        qrisImage: null
    };
    
    // Save to history
    TransactionManager.add(transaction);
    
    return transaction;
}

// Update payment UI
function updatePaymentUI(transaction) {
    DOM.paymentId.textContent = transaction.id;
    DOM.paymentUsername.textContent = transaction.username;
    DOM.paymentPackage.textContent = transaction.packageName;
    DOM.packagePrice.textContent = CONFIG.utils.formatRupiah(transaction.packagePrice);
    DOM.uniqueFee.textContent = CONFIG.utils.formatRupiah(transaction.uniqueFee);
    DOM.totalAmount.textContent = CONFIG.utils.formatRupiah(transaction.totalAmount);
    DOM.qrisAmount.textContent = CONFIG.utils.formatNumber(transaction.totalAmount);
    DOM.paymentAmountDisplay.textContent = CONFIG.utils.formatRupiah(transaction.totalAmount);
    
    // Start countdown
    startCountdown(new Date(transaction.expiresAt));
}

// Generate QRIS
async function generateQRIS(transaction) {
    if (CONFIG.mode === 'demo') {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, CONFIG.payment.demo.simulateDelay));
        
        // Generate mock QRIS
        const mockQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=SAPURA-${transaction.id}-${transaction.totalAmount}&margin=10`;
        
        transaction.qrisUrl = mockQRUrl;
        TransactionManager.update(transaction.id, { qrisUrl: mockQRUrl });
        
    } else {
        // Production: Call real API
        try {
            const params = new URLSearchParams({
                apikey: CONFIG.payment.production.credentials.apiKey,
                amount: transaction.totalAmount,
                username: CONFIG.payment.production.credentials.username,
                token: CONFIG.payment.production.credentials.token
            });
            
            const url = `${CONFIG.payment.production.baseUrl}${CONFIG.payment.production.endpoints.createPayment}?${params}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                transaction.qrisUrl = data.result.imageqris.url;
                TransactionManager.update(transaction.id, { qrisUrl: transaction.qrisUrl });
            } else {
                throw new Error(data.message || 'Gagal membuat QRIS');
            }
        } catch (error) {
            console.error('QRIS Error:', error);
            // Fallback to mock
            const mockQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=SAPURA-${transaction.id}-${transaction.totalAmount}`;
            transaction.qrisUrl = mockQRUrl;
        }
    }
    
    // Display QRIS
    DOM.qrisImage.src = transaction.qrisUrl;
    DOM.qrisPlaceholder.classList.add('hidden');
    DOM.qrisImageContainer.classList.remove('hidden');
}

// Start countdown
function startCountdown(expiryTime) {
    // Clear existing
    if (AppState.countdownInterval) {
        clearInterval(AppState.countdownInterval);
    }
    
    function update() {
        const now = new Date();
        const diff = expiryTime - now;
        
        if (diff <= 0) {
            DOM.countdownTimer.textContent = '00:00';
            handlePaymentExpired();
            return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        DOM.countdownTimer.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Warning color
        if (diff < 60000) {
            DOM.countdownTimer.style.color = 'var(--danger)';
        }
    }
    
    update();
    AppState.countdownInterval = setInterval(update, 1000);
}

// Start payment polling
function startPaymentPolling(transactionId) {
    // Clear existing
    if (AppState.paymentPolling) {
        clearInterval(AppState.paymentPolling);
    }
    
    AppState.paymentPolling = setInterval(async () => {
        const paid = await checkPaymentStatus(transactionId);
        
        if (paid) {
            clearInterval(AppState.paymentPolling);
            clearInterval(AppState.countdownInterval);
            await handlePaymentSuccess(transactionId);
        }
    }, CONFIG.system.payment.pollingInterval);
}

// Check payment status
async function checkPaymentStatus(transactionId) {
    const transaction = TransactionManager.getById(transactionId);
    if (!transaction) return false;
    
    if (CONFIG.mode === 'demo') {
        // Simulate payment check
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Random success (30% chance each poll)
        return Math.random() < CONFIG.payment.demo.successRate;
    } else {
        // Production: Check real API
        try {
            const params = new URLSearchParams({
                apikey: CONFIG.payment.production.credentials.apiKey,
                username: CONFIG.payment.production.credentials.username,
                token: CONFIG.payment.production.credentials.token
            });
            
            const url = `${CONFIG.payment.production.baseUrl}${CONFIG.payment.production.endpoints.checkMutation}?${params}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success && data.result) {
                // Check if payment matches
                const paymentFound = data.result.find(p => 
                    parseInt(p.kredit.replace(/\D/g, '')) === transaction.totalAmount
                );
                return !!paymentFound;
            }
            return false;
        } catch (error) {
            console.error('Payment check error:', error);
            return false;
        }
    }
}

// Handle payment success
async function handlePaymentSuccess(transactionId) {
    showLoading('Pembayaran berhasil!', 'Membuat panel...');
    
    // Update transaction
    TransactionManager.update(transactionId, {
        status: 'paid',
        paidAt: new Date().toISOString()
    });
    
    // Update UI
    DOM.paymentStatus.innerHTML = `
        <div class="status-success">
            <i class="fas fa-check-circle"></i>
            <h3>Pembayaran Diterima!</h3>
            <p>Panel sedang dibuat...</p>
        </div>
    `;
    
    try {
        // Create panel
        await createPanel(transactionId);
        
        hideLoading();
        showStep(4);
        
    } catch (error) {
        hideLoading();
        TransactionManager.update(transactionId, {
            status: 'failed',
            error: error.message
        });
        showError('Gagal membuat panel', error.message);
    }
}

// Create panel (user + server)
async function createPanel(transactionId) {
    const transaction = TransactionManager.getById(transactionId);
    if (!transaction) throw new Error('Transaksi tidak ditemukan');
    
    const pkg = CONFIG.packages[transaction.package];
    
    if (CONFIG.mode === 'demo') {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, CONFIG.panel.demo.simulateDelay));
        
        // Mock credentials
        AppState.credentials = {
            serverId: CONFIG.utils.generateServerId(),
            username: transaction.username,
            password: CONFIG.utils.generatePassword(transaction.username),
            specs: `${pkg.name} - ${pkg.ram}MB RAM, ${pkg.cpu}% CPU`,
            ram: pkg.ram === 0 ? 'Unlimited' : pkg.ram >= 1000 ? (pkg.ram/1000) + 'GB' : pkg.ram + 'MB',
            disk: pkg.disk === 0 ? 'Unlimited' : pkg.disk >= 1000 ? (pkg.disk/1000) + 'GB' : pkg.disk + 'MB',
            cpu: pkg.cpu === 0 ? 'Unlimited' : pkg.cpu + '%',
            activationDate: CONFIG.utils.formatDate()
        };
        
    } else {
        // Production: Call Pterodactyl API
        try {
            // 1. Create user
            const user = await createPanelUser(transaction);
            
            // 2. Create server
            const server = await createPanelServer(transaction, user);
            
            AppState.credentials = {
                serverId: server.id,
                username: user.username,
                password: user.password,
                specs: `${pkg.name} - ${pkg.ram}MB RAM, ${pkg.cpu}% CPU`,
                ram: pkg.ram === 0 ? 'Unlimited' : pkg.ram >= 1000 ? (pkg.ram/1000) + 'GB' : pkg.ram + 'MB',
                disk: pkg.disk === 0 ? 'Unlimited' : pkg.disk >= 1000 ? (pkg.disk/1000) + 'GB' : pkg.disk + 'MB',
                cpu: pkg.cpu === 0 ? 'Unlimited' : pkg.cpu + '%',
                activationDate: CONFIG.utils.formatDate()
            };
            
        } catch (error) {
            throw error;
        }
    }
    
    // Update transaction
    TransactionManager.update(transactionId, {
        status: 'success',
        completedAt: new Date().toISOString(),
        credentials: AppState.credentials
    });
    
    // Update result UI
    updateResultUI();
}

// Create panel user (production only)
async function createPanelUser(transaction) {
    const email = transaction.username + CONFIG.system.user.emailDomain;
    const password = CONFIG.utils.generatePassword(transaction.username);
    
    const response = await fetch(`${CONFIG.panel.production.domain}${CONFIG.panel.production.endpoints.createUser}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.panel.production.apiKey}`
        },
        body: JSON.stringify({
            email: email,
            username: transaction.username,
            first_name: CONFIG.utils.capitalize(transaction.username) + ' Server',
            last_name: 'User',
            language: 'en',
            password: password
        })
    });
    
    const data = await response.json();
    
    if (data.errors) {
        throw new Error(data.errors[0].detail || 'Gagal membuat user');
    }
    
    return {
        id: data.attributes.id,
        username: data.attributes.username,
        password: password
    };
}

// Create panel server (production only)
async function createPanelServer(transaction, user) {
    const pkg = CONFIG.packages[transaction.package];
    
    // Get egg data
    const eggUrl = `${CONFIG.panel.production.domain}${CONFIG.panel.production.endpoints.getEgg}`
        .replace('{nest}', CONFIG.panel.production.defaults.nestId)
        .replace('{egg}', CONFIG.panel.production.defaults.eggId);
    
    const eggResponse = await fetch(eggUrl, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${CONFIG.panel.production.apiKey}`
        }
    });
    
    const eggData = await eggResponse.json();
    const startup = eggData.attributes.startup;
    
    // Create server
    const serverResponse = await fetch(`${CONFIG.panel.production.domain}${CONFIG.panel.production.endpoints.createServer}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.panel.production.apiKey}`
        },
        body: JSON.stringify({
            name: `${CONFIG.utils.capitalize(transaction.username)} Server`,
            description: `Panel created at ${new Date().toLocaleString('id-ID')}`,
            user: user.id,
            egg: CONFIG.panel.production.defaults.eggId,
            docker_image: CONFIG.panel.production.defaults.dockerImage,
            startup: startup,
            environment: CONFIG.panel.production.defaults.environment,
            limits: {
                memory: pkg.ram,
                swap: CONFIG.panel.production.defaults.limits.swap,
                disk: pkg.disk,
                io: CONFIG.panel.production.defaults.limits.io,
                cpu: pkg.cpu
            },
            feature_limits: {
                databases: CONFIG.panel.production.defaults.limits.databases,
                backups: CONFIG.panel.production.defaults.limits.backups,
                allocations: CONFIG.panel.production.defaults.limits.allocations
            },
            deploy: {
                locations: [CONFIG.panel.production.defaults.locationId],
                dedicated_ip: false,
                port_range: []
            }
        })
    });
    
    const serverData = await serverResponse.json();
    
    if (serverData.errors) {
        throw new Error(serverData.errors[0].detail || 'Gagal membuat server');
    }
    
    return {
        id: serverData.attributes.id
    };
}

// Update result UI
function updateResultUI() {
    if (!AppState.credentials || !AppState.transaction) return;
    
    const creds = AppState.credentials;
    const trans = AppState.transaction;
    
    DOM.resultTransactionId.textContent = trans.id;
    DOM.resultPaymentAmount.textContent = CONFIG.utils.formatRupiah(trans.totalAmount);
    DOM.resultServerId.textContent = creds.serverId;
    DOM.resultUsername.textContent = creds.username;
    DOM.resultPassword.textContent = creds.password;
    DOM.resultActivationDate.textContent = creds.activationDate;
    DOM.resultRam.textContent = creds.ram;
    DOM.resultDisk.textContent = creds.disk;
    DOM.resultCpu.textContent = creds.cpu;
    DOM.resultDomain.textContent = CONFIG.mode === 'demo' ? 'panel.sapuracloud.demo' : CONFIG.panel.production.domain;
    DOM.panelUrl.href = CONFIG.mode === 'demo' ? '#' : CONFIG.panel.production.domain;
}

// Handle payment expired
function handlePaymentExpired() {
    if (AppState.transaction) {
        TransactionManager.update(AppState.transaction.id, {
            status: 'expired',
            expiredAt: new Date().toISOString()
        });
    }
    
    clearIntervals();
    showError('Pembayaran Expired', 'QRIS telah kedaluwarsa. Silakan buat transaksi baru.');
}

// Cancel payment
function cancelPayment(keepInHistory = true) {
    clearIntervals();
    
    if (AppState.transaction) {
        if (keepInHistory) {
            TransactionManager.update(AppState.transaction.id, {
                status: 'cancelled',
                cancelledAt: new Date().toISOString()
            });
        } else {
            // Remove from history
            const transactions = TransactionManager.getAll();
            const filtered = transactions.filter(t => t.id !== AppState.transaction.id);
            TransactionManager.saveAll(filtered);
        }
    }
    
    // Reset payment UI
    DOM.qrisPlaceholder.classList.remove('hidden');
    DOM.qrisImageContainer.classList.add('hidden');
    DOM.countdownTimer.textContent = '05:00';
    DOM.countdownTimer.style.color = '';
    
    DOM.paymentStatus.innerHTML = `
        <div class="status-pending">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Menunggu pembayaran...</p>
            <small>Mengecek pembayaran otomatis</small>
        </div>
    `;
    
    // Reset state
    AppState.transaction = null;
}

// Clear intervals
function clearIntervals() {
    if (AppState.paymentPolling) {
        clearInterval(AppState.paymentPolling);
        AppState.paymentPolling = null;
    }
    
    if (AppState.countdownInterval) {
        clearInterval(AppState.countdownInterval);
        AppState.countdownInterval = null;
    }
}

// Check for active transactions
function checkActiveTransactions() {
    const active = TransactionManager.getActiveTransactions();
    
    if (active.length > 0) {
        const lastActive = active[0];
        
        // Check if expired
        const expiry = new Date(lastActive.expiresAt);
        if (expiry < new Date()) {
            TransactionManager.update(lastActive.id, { status: 'expired' });
            return;
        }
        
        // Ask user to continue
        if (confirm(`Anda memiliki transaksi aktif (${lastActive.id}). Lanjutkan?`)) {
            continueTransaction(lastActive);
        }
    }
}

// Continue existing transaction
function continueTransaction(transaction) {
    AppState.username = transaction.username;
    AppState.selectedPackage = CONFIG.packages[transaction.package];
    AppState.selectedPackageKey = transaction.package;
    AppState.transaction = transaction;
    
    // Fill username
    DOM.usernameInput.value = transaction.username;
    
    // Go to payment step
    showStep(3);
    updatePaymentUI(transaction);
    
    // Load QRIS if exists
    if (transaction.qrisUrl) {
        DOM.qrisImage.src = transaction.qrisUrl;
        DOM.qrisPlaceholder.classList.add('hidden');
        DOM.qrisImageContainer.classList.remove('hidden');
    }
    
    // Start polling
    startPaymentPolling(transaction.id);
}

// Start new transaction
function startNewTransaction() {
    resetAppState();
    showStep(1);
}

// Save panel details
function savePanelDetails() {
    if (!AppState.credentials || !AppState.transaction) {
        showToast('Tidak ada data untuk disimpan', 'error');
        return;
    }
    
    const creds = AppState.credentials;
    const trans = AppState.transaction;
    
    const content = `
SAPURA CLOUD - DETAIL PANEL
===========================

ID Transaksi: ${trans.id}
Tanggal: ${new Date().toLocaleString('id-ID')}
Total Bayar: ${CONFIG.utils.formatRupiah(trans.totalAmount)}

=== CREDENTIALS PANEL ===
Server ID: ${creds.serverId}
Username: ${creds.username}
Password: ${creds.password}
Domain: ${CONFIG.mode === 'demo' ? 'panel.sapuracloud.demo' : CONFIG.panel.production.domain}

=== SPESIFIKASI ===
RAM: ${creds.ram}
DISK: ${creds.disk}
CPU: ${creds.cpu}

=== KETENTUAN ===
- Masa aktif 30 hari
- Garansi 15 hari (1x replace)
- Simpan data dengan aman
- Wajib bukti untuk klaim

Simpan data ini dengan aman!
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sapuracloud-${creds.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Detail berhasil disimpan!', 'success');
}

// Show step
function showStep(stepNumber) {
    AppState.currentStep = stepNumber;
    
    // Update step indicators
    DOM.steps.forEach(step => {
        const num = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (num === stepNumber) {
            step.classList.add('active');
        } else if (num < stepNumber) {
            step.classList.add('completed');
        }
    });
    
    // Show step content
    DOM.stepContents.forEach(content => {
        content.classList.remove('active');
        const id = content.id;
        const step = id.split('-')[1];
        
        if (parseInt(step) === stepNumber) {
            content.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show home
function showHome() {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    showStep(AppState.currentStep);
}

// Show history
function showHistory() {
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
    });
    DOM.historyPage.classList.add('active');
    loadHistory();
}

// Load history
function loadHistory() {
    const transactions = TransactionManager.getAll();
    const search = DOM.historySearch.value.toLowerCase();
    const filter = document.querySelector('.filter-btn.active').dataset.filter;
    
    // Filter
    let filtered = transactions;
    
    if (search) {
        filtered = filtered.filter(t => 
            t.id.toLowerCase().includes(search) ||
            t.username.toLowerCase().includes(search) ||
            t.packageName.toLowerCase().includes(search)
        );
    }
    
    if (filter !== 'all') {
        filtered = filtered.filter(t => t.status === filter);
    }
    
    // Display
    if (filtered.length === 0) {
        DOM.historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <h3>Tidak ada transaksi</h3>
                <p>${search ? 'Coba kata kunci lain' : 'Mulai beli panel untuk melihat history'}</p>
            </div>
        `;
        DOM.historyDetail.innerHTML = '';
        return;
    }
    
    DOM.historyList.innerHTML = filtered.map(trans => `
        <div class="history-item ${trans.status}" data-id="${trans.id}">
            <div class="history-item-header">
                <div class="history-id">${trans.id}</div>
                <div class="history-status ${trans.status}">
                    <i class="fas ${getStatusIcon(trans.status)}"></i>
                    ${getStatusText(trans.status)}
                </div>
            </div>
            <div class="history-item-body">
                <div class="history-info">
                    <div class="info-row">
                        <span class="info-label">Username:</span>
                        <span class="info-value">${trans.username}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Paket:</span>
                        <span class="info-value">${trans.packageName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Total:</span>
                        <span class="info-value">${CONFIG.utils.formatRupiah(trans.totalAmount)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tanggal:</span>
                        <span class="info-value">${new Date(trans.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                </div>
                <div class="history-actions">
                    ${trans.status === 'pending' ? `
                        <button class="btn-small btn-primary" onclick="continueHistoryTransaction('${trans.id}')">
                            <i class="fas fa-play"></i> Lanjutkan
                        </button>
                    ` : ''}
                    ${trans.status === 'success' ? `
                        <button class="btn-small btn-success" onclick="viewHistoryDetails('${trans.id}')">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Continue history transaction
window.continueHistoryTransaction = function(id) {
    const transaction = TransactionManager.getById(id);
    if (transaction) {
        continueTransaction(transaction);
        showHome();
    }
};

// View history details
window.viewHistoryDetails = function(id) {
    const transaction = TransactionManager.getById(id);
    if (!transaction) return;
    
    let html = `
        <div class="transaction-detail">
            <h3><i class="fas fa-info-circle"></i> Detail Transaksi</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">${transaction.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Username:</span>
                    <span class="detail-value">${transaction.username}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Paket:</span>
                    <span class="detail-value">${transaction.packageName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value">${CONFIG.utils.formatRupiah(transaction.totalAmount)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value ${transaction.status}">
                        <i class="fas ${getStatusIcon(transaction.status)}"></i>
                        ${getStatusText(transaction.status)}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Dibuat:</span>
                    <span class="detail-value">${new Date(transaction.createdAt).toLocaleString('id-ID')}</span>
                </div>
    `;
    
    if (transaction.paidAt) {
        html += `
                <div class="detail-item">
                    <span class="detail-label">Dibayar:</span>
                    <span class="detail-value">${new Date(transaction.paidAt).toLocaleString('id-ID')}</span>
                </div>
        `;
    }
    
    if (transaction.completedAt) {
        html += `
                <div class="detail-item">
                    <span class="detail-label">Selesai:</span>
                    <span class="detail-value">${new Date(transaction.completedAt).toLocaleString('id-ID')}</span>
                </div>
        `;
    }
    
    if (transaction.credentials) {
        html += `
            </div>
            <div class="panel-credentials" style="margin-top: 20px;">
                <h4><i class="fas fa-server"></i> Credentials Panel</h4>
                <div class="credentials-grid">
                    <div class="credential-item">
                        <span class="cred-label">Server ID:</span>
                        <span class="cred-value">${transaction.credentials.serverId}</span>
                    </div>
                    <div class="credential-item">
                        <span class="cred-label">Username:</span>
                        <span class="cred-value">${transaction.credentials.username}</span>
                    </div>
                    <div class="credential-item">
                        <span class="cred-label">Password:</span>
                        <span class="cred-value">${transaction.credentials.password}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    DOM.historyDetail.innerHTML = html;
};

// Get status icon
function getStatusIcon(status) {
    const icons = {
        pending: 'fa-clock',
        paid: 'fa-check-circle',
        success: 'fa-check-circle',
        expired: 'fa-exclamation-circle',
        cancelled: 'fa-times-circle',
        failed: 'fa-exclamation-triangle'
    };
    return icons[status] || 'fa-question-circle';
}

// Get status text
function getStatusText(status) {
    const texts = {
        pending: 'Menunggu Bayar',
        paid: 'Sudah Bayar',
        success: 'Sukses',
        expired: 'Expired',
        cancelled: 'Dibatalkan',
        failed: 'Gagal'
    };
    return texts[status] || 'Unknown';
}

// Toggle mode
function toggleMode() {
    const newMode = CONFIG.mode === 'demo' ? 'production' : 'demo';
    
    if (newMode === 'production') {
        if (!confirm('Switch ke mode PRODUCTION?\n\nPastikan API key sudah diisi di config.js!')) {
            return;
        }
    }
    
    // Reload page with new mode
    localStorage.setItem('sapuracloud_mode', newMode);
    location.reload();
}

// Update mode indicator
function updateModeIndicator() {
    if (DOM.modeIndicator) {
        DOM.modeIndicator.textContent = CONFIG.mode.toUpperCase();
        DOM.modeIndicator.style.background = CONFIG.mode === 'demo' ? 'var(--warning)' : 'var(--success)';
    }
    
    if (DOM.toggleModeBtn) {
        const span = DOM.toggleModeBtn.querySelector('span');
        if (span) {
            span.textContent = `Mode: ${CONFIG.mode.toUpperCase()}`;
        }
    }
}

// Show loading
function showLoading(message = 'Memproses...', detail = 'Harap tunggu') {
    AppState.isLoading = true;
    DOM.loadingMessage.textContent = message;
    DOM.loadingDetail.textContent = detail;
    DOM.loadingOverlay.classList.remove('hidden');
}

// Hide loading
function hideLoading() {
    AppState.isLoading = false;
    DOM.loadingOverlay.classList.add('hidden');
}

// Show toast
function showToast(message, type = 'success') {
    DOM.toastMessage.textContent = message;
    DOM.toast.className = `toast ${type}`;
    
    // Show
    setTimeout(() => {
        DOM.toast.classList.remove('hidden');
        setTimeout(() => DOM.toast.classList.add('show'), 10);
    }, 10);
    
    // Hide after 3s
    setTimeout(() => {
        DOM.toast.classList.remove('show');
        setTimeout(() => DOM.toast.classList.add('hidden'), 300);
    }, 3000);
}

// Show error
function showError(title, message) {
    document.getElementById('error-title').textContent = title;
    document.getElementById('error-description').textContent = message;
    showStep('error');
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied:', text);
    }).catch(err => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

// Reset app state
function resetAppState() {
    // Clear intervals
    clearIntervals();
    
    // Reset inputs
    DOM.usernameInput.value = '';
    DOM.usernameError.textContent = '';
    DOM.usernameError.style.display = 'none';
    DOM.nextToPackagesBtn.disabled = true;
    
    // Reset package selection
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('selected');
    });
    DOM.selectedPackageInfo.style.display = 'none';
    DOM.nextToPaymentBtn.disabled = true;
    
    // Reset payment UI
    DOM.qrisPlaceholder.classList.remove('hidden');
    DOM.qrisImageContainer.classList.add('hidden');
    DOM.countdownTimer.textContent = '05:00';
    DOM.countdownTimer.style.color = '';
    
    // Reset state
    AppState.username = '';
    AppState.selectedPackage = null;
    AppState.selectedPackageKey = null;
    AppState.transaction = null;
    AppState.credentials = null;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Check for mode in URL or localStorage
const urlParams = new URLSearchParams(window.location.search);
const urlMode = urlParams.get('mode');
const savedMode = localStorage.getItem('sapuracloud_mode');

if (urlMode === 'production' || savedMode === 'production') {
    // Force production mode
    CONFIG.mode = 'production';
    localStorage.setItem('sapuracloud_mode', 'production');
} else if (urlMode === 'demo' || savedMode === 'demo') {
    CONFIG.mode = 'demo';
    localStorage.setItem('sapuracloud_mode', 'demo');
}

// Expose some functions globally for debugging
window.sapuraDebug = {
    getState: () => AppState,
    getTransactions: () => TransactionManager.getAll(),
    clearHistory: () => {
        if (confirm('Hapus semua history?')) {
            TransactionManager.saveAll([]);
            showToast('History dihapus', 'success');
            if (AppState.currentPage === 'history') loadHistory();
        }
    },
    simulatePayment: () => {
        if (AppState.transaction && AppState.transaction.status === 'pending') {
            handlePaymentSuccess(AppState.transaction.id);
            showToast('Pembayaran disimulasikan', 'info');
        } else {
            showToast('Tidak ada transaksi pending', 'error');
        }
    }
};