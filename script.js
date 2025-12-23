// Main Application Script
document.addEventListener('DOMContentLoaded', function() {
    // State management
    const AppState = {
        currentStep: 1,
        username: '',
        email: '',
        selectedPackage: null,
        transactionId: null,
        paymentAmount: 0,
        paymentUniqueFee: 0,
        qrisExpiry: null,
        pollingInterval: null,
        transactionStatus: 'pending',
        panelCredentials: null
    };

    // DOM Elements
    const stepContents = document.querySelectorAll('.step-content');
    const steps = document.querySelectorAll('.step');
    
    // Input elements
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    
    // Buttons
    const nextToPackagesBtn = document.getElementById('next-to-packages');
    const backToUsernameBtn = document.getElementById('back-to-username');
    const nextToPaymentBtn = document.getElementById('next-to-payment');
    const backToPackagesBtn = document.getElementById('back-to-packages');
    const cancelPaymentBtn = document.getElementById('cancel-payment');
    const newTransactionBtn = document.getElementById('new-transaction');
    const saveDetailsBtn = document.getElementById('save-details');
    const retryTransactionBtn = document.getElementById('retry-transaction');
    const backToStartBtn = document.getElementById('back-to-start');
    
    // Display elements
    const packageContainer = document.getElementById('package-container');
    const selectedPackageInfo = document.getElementById('selected-package-info');
    const paymentUsername = document.getElementById('payment-username');
    const paymentPackage = document.getElementById('payment-package');
    const packagePrice = document.getElementById('package-price');
    const uniqueFee = document.getElementById('unique-fee');
    const totalAmount = document.getElementById('total-amount');
    const qrisPlaceholder = document.getElementById('qris-placeholder');
    const qrisImage = document.getElementById('qris-image');
    const countdownTimer = document.getElementById('countdown-timer');
    const paymentStatus = document.getElementById('payment-status');
    
    // Result elements
    const resultUsername = document.getElementById('result-username');
    const resultPassword = document.getElementById('result-password');
    const resultServerId = document.getElementById('result-server-id');
    const resultSpecs = document.getElementById('result-specs');
    const panelDomain = document.getElementById('panel-domain');
    const panelUrl = document.getElementById('panel-url');
    
    // Loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');
    const loadingDetail = document.getElementById('loading-detail');
    
    // Toast notification
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Initialize application
    initApp();

    // Function: Initialize application
    function initApp() {
        loadPackages();
        setupEventListeners();
        validateUsername();
    }

    // Function: Load packages from config
    function loadPackages() {
        packageContainer.innerHTML = '';
        
        CONFIG.packages.forEach(pkg => {
            const packageCard = document.createElement('div');
            packageCard.className = `package-card ${pkg.name.toLowerCase() === 'unlimited' ? 'unlimited' : ''}`;
            packageCard.dataset.package = pkg.name;
            
            const isUnlimited = pkg.name.toLowerCase() === 'unlimited';
            
            packageCard.innerHTML = `
                <div class="package-header">
                    <div class="package-ram">${pkg.name}</div>
                    <div class="package-price">Rp ${formatNumber(pkg.price)}</div>
                </div>
                <div class="package-specs">
                    <div class="spec-item">
                        <span class="spec-label">RAM:</span>
                        <span class="spec-value">${isUnlimited ? 'Unlimited' : formatNumber(pkg.ram) + ' MB'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">CPU:</span>
                        <span class="spec-value">${isUnlimited ? 'Unlimited' : pkg.cpu + '%'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Disk:</span>
                        <span class="spec-value">${isUnlimited ? 'Unlimited' : formatNumber(pkg.disk) + ' MB'}</span>
                    </div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 15px;">${pkg.description}</p>
                <button class="package-select-btn" onclick="selectPackage('${pkg.name}')">
                    Pilih Paket
                </button>
            `;
            
            packageContainer.appendChild(packageCard);
        });
    }

    // Function: Setup event listeners
    function setupEventListeners() {
        // Navigation buttons
        nextToPackagesBtn.addEventListener('click', () => {
            if (validateUsername()) {
                AppState.username = usernameInput.value.trim();
                AppState.email = emailInput.value.trim();
                showStep(2);
            }
        });
        
        backToUsernameBtn.addEventListener('click', () => showStep(1));
        
        nextToPaymentBtn.addEventListener('click', () => {
            if (AppState.selectedPackage) {
                showStep(3);
                startPaymentProcess();
            }
        });
        
        backToPackagesBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin membatalkan pembayaran?')) {
                cancelPayment();
                showStep(2);
            }
        });
        
        cancelPaymentBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin membatalkan transaksi?')) {
                cancelPayment();
                showStep(2);
            }
        });
        
        newTransactionBtn.addEventListener('click', () => {
            resetAppState();
            showStep(1);
        });
        
        saveDetailsBtn.addEventListener('click', savePanelDetails);
        retryTransactionBtn.addEventListener('click', () => showStep(1));
        backToStartBtn.addEventListener('click', () => showStep(1));
        
        // Username validation on input
        usernameInput.addEventListener('input', validateUsername);
        
        // Copy buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.copy-btn')) {
                const button = e.target.closest('.copy-btn');
                const targetId = button.dataset.target;
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    copyToClipboard(targetElement.textContent);
                    showToast('Berhasil disalin ke clipboard!', 'success');
                }
            }
        });
    }

    // Function: Validate username
    function validateUsername() {
        const username = usernameInput.value.trim();
        const regex = /^[a-zA-Z0-9_]+$/;
        
        if (!username) {
            showError(usernameInput, 'Username wajib diisi');
            nextToPackagesBtn.disabled = true;
            return false;
        }
        
        if (username.length < 3) {
            showError(usernameInput, 'Username minimal 3 karakter');
            nextToPackagesBtn.disabled = true;
            return false;
        }
        
        if (username.length > 20) {
            showError(usernameInput, 'Username maksimal 20 karakter');
            nextToPackagesBtn.disabled = true;
            return false;
        }
        
        if (!regex.test(username)) {
            showError(usernameInput, 'Hanya boleh huruf, angka, dan underscore');
            nextToPackagesBtn.disabled = true;
            return false;
        }
        
        clearError(usernameInput);
        nextToPackagesBtn.disabled = false;
        return true;
    }

    // Function: Select package
    window.selectPackage = function(packageName) {
        // Remove selected class from all packages
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selected class to clicked package
        const selectedCard = document.querySelector(`.package-card[data-package="${packageName}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Find package in config
        const pkg = CONFIG.packages.find(p => p.name === packageName);
        if (pkg) {
            AppState.selectedPackage = pkg;
            
            // Update selected package info
            const isUnlimited = pkg.name.toLowerCase() === 'unlimited';
            selectedPackageInfo.innerHTML = `
                <h3><i class="fas fa-check-circle"></i> Paket Dipilih: ${pkg.name}</h3>
                <div class="package-specs">
                    <div class="spec-item">
                        <span class="spec-label">RAM:</span>
                        <span class="spec-value">${isUnlimited ? 'Unlimited' : formatNumber(pkg.ram) + ' MB'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">CPU:</span>
                        <span class="spec-value">${isUnlimited ? 'Unlimited' : pkg.cpu + '%'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Disk:</span>
                        <span class="spec-value">${isUnlimited ? 'Unlimited' : formatNumber(pkg.disk) + ' MB'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Harga:</span>
                        <span class="spec-value">Rp ${formatNumber(pkg.price)}</span>
                    </div>
                </div>
                <p>${pkg.description}</p>
            `;
            
            selectedPackageInfo.style.display = 'block';
            nextToPaymentBtn.disabled = false;
        }
    };

    // Function: Start payment process
    async function startPaymentProcess() {
        showLoading('Membuat transaksi pembayaran...', 'Harap tunggu');
        
        // Update payment info display
        paymentUsername.textContent = AppState.username;
        paymentPackage.textContent = AppState.selectedPackage.name;
        packagePrice.textContent = `Rp ${formatNumber(AppState.selectedPackage.price)}`;
        
        // Generate random unique fee
        const randomFee = generateRandomFee();
        AppState.paymentUniqueFee = randomFee;
        uniqueFee.textContent = `Rp ${formatNumber(randomFee)}`;
        
        // Calculate total amount
        AppState.paymentAmount = AppState.selectedPackage.price + randomFee;
        totalAmount.textContent = `Rp ${formatNumber(AppState.paymentAmount)}`;
        
        try {
            // Generate QRIS (simulasi)
            await simulateGenerateQRIS();
            
            // Set expiry time
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + CONFIG.system.qrisExpiryMinutes);
            AppState.qrisExpiry = expiryTime;
            
            // Start countdown
            startCountdown();
            
            // Start payment polling
            startPaymentPolling();
            
            hideLoading();
        } catch (error) {
            hideLoading();
            showErrorState('Gagal membuat transaksi', error.message);
        }
    }

    // Function: Simulate QRIS generation
    async function simulateGenerateQRIS() {
        // In production, this would call the actual payment API
        // For demo purposes, we simulate with a delay
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate a dummy QR code (in production, this would be real QR from API)
                const dummyQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PanelHost-${Date.now()}-${AppState.paymentAmount}`;
                
                qrisPlaceholder.classList.add('hidden');
                qrisImage.src = dummyQRUrl;
                qrisImage.classList.remove('hidden');
                
                // Simulate generating transaction ID
                AppState.transactionId = 'TX' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
                
                resolve();
            }, 1500);
        });
    }

    // Function: Start countdown timer
    function startCountdown() {
        const expiryTime = AppState.qrisExpiry.getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = expiryTime - now;
            
            if (distance < 0) {
                countdownTimer.textContent = '00:00';
                handlePaymentExpired();
                return;
            }
            
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdownTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update countdown color when less than 1 minute
            if (distance < 60000) {
                countdownTimer.style.color = 'var(--danger-color)';
            }
        }
        
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
        
        // Store interval ID to clear later
        AppState.countdownInterval = countdownInterval;
    }

    // Function: Start payment polling
    function startPaymentPolling() {
        // In production, this would poll the payment API
        // For demo, we simulate payment detection
        
        AppState.pollingInterval = setInterval(async () => {
            try {
                // Simulate API call to check payment
                const isPaid = await simulateCheckPayment();
                
                if (isPaid) {
                    clearInterval(AppState.pollingInterval);
                    clearInterval(AppState.countdownInterval);
                    handlePaymentSuccess();
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, CONFIG.system.pollingInterval);
    }

    // Function: Simulate payment check
    async function simulateCheckPayment() {
        // In production, this would call the actual payment verification API
        // For demo, we randomly determine success after some time
        // or simulate success with a button in UI (not shown in actual implementation)
        
        return new Promise((resolve) => {
            // Simulate random success for demo (5% chance each poll)
            const isSuccess = Math.random() < 0.05;
            
            // For testing: uncomment next line and add a button to trigger success
            // resolve(false); // Normal polling
            
            setTimeout(() => {
                resolve(isSuccess);
            }, 500);
        });
    }

    // Function: Handle payment success
    async function handlePaymentSuccess() {
        showLoading('Pembayaran berhasil!', 'Membuat panel Anda...');
        
        paymentStatus.innerHTML = `
            <div class="status-success">
                <i class="fas fa-check-circle"></i>
                <h3>Pembayaran Diterima!</h3>
                <p>Panel Anda sedang dibuat, harap tunggu...</p>
            </div>
        `;
        
        try {
            // Create panel user
            const userCreated = await simulateCreatePanelUser();
            if (!userCreated) throw new Error('Gagal membuat user panel');
            
            // Create server
            const serverCreated = await simulateCreateServer();
            if (!serverCreated) throw new Error('Gagal membuat server');
            
            // Store credentials
            AppState.panelCredentials = {
                username: AppState.username,
                password: generateRandomPassword(),
                serverId: 'SRV' + Date.now().toString().substr(-8),
                specs: `${AppState.selectedPackage.name} - ${AppState.selectedPackage.ram}MB RAM, ${AppState.selectedPackage.cpu}% CPU`
            };
            
            // Update result display
            updateResultDisplay();
            
            hideLoading();
            showStep(4);
            
        } catch (error) {
            hideLoading();
            showErrorState('Gagal membuat panel', error.message);
        }
    }

    // Function: Simulate creating panel user
    async function simulateCreatePanelUser() {
        // In production, this would call Pterodactyl API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 2000);
        });
    }

    // Function: Simulate creating server
    async function simulateCreateServer() {
        // In production, this would call Pterodactyl API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 3000);
        });
    }

    // Function: Handle payment expired
    function handlePaymentExpired() {
        if (AppState.pollingInterval) {
            clearInterval(AppState.pollingInterval);
        }
        
        if (AppState.countdownInterval) {
            clearInterval(AppState.countdownInterval);
        }
        
        showErrorState('Pembayaran Kedaluwarsa', 'Waktu pembayaran telah habis. Silakan coba lagi.');
    }

    // Function: Cancel payment
    function cancelPayment() {
        if (AppState.pollingInterval) {
            clearInterval(AppState.pollingInterval);
        }
        
        if (AppState.countdownInterval) {
            clearInterval(AppState.countdownInterval);
        }
        
        // Reset payment UI
        qrisPlaceholder.classList.remove('hidden');
        qrisImage.classList.add('hidden');
        countdownTimer.textContent = '05:00';
        countdownTimer.style.color = '';
        
        paymentStatus.innerHTML = `
            <div class="status-pending">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Menunggu pembayaran...</p>
            </div>
        `;
        
        AppState.transactionId = null;
        AppState.paymentAmount = 0;
        AppState.paymentUniqueFee = 0;
        AppState.qrisExpiry = null;
    }

    // Function: Update result display
    function updateResultDisplay() {
        if (!AppState.panelCredentials) return;
        
        resultUsername.textContent = AppState.panelCredentials.username;
        resultPassword.textContent = AppState.panelCredentials.password;
        resultServerId.textContent = AppState.panelCredentials.serverId;
        resultSpecs.textContent = AppState.panelCredentials.specs;
        
        panelDomain.textContent = CONFIG.panel.domain;
        panelUrl.href = CONFIG.panel.domain;
    }

    // Function: Save panel details
    function savePanelDetails() {
        if (!AppState.panelCredentials) return;
        
        const details = `
Panel Host - Detail Akun
=======================

Username: ${AppState.panelCredentials.username}
Password: ${AppState.panelCredentials.password}
Server ID: ${AppState.panelCredentials.serverId}
Spesifikasi: ${AppState.panelCredentials.specs}
Domain Panel: ${CONFIG.panel.domain}

Tanggal Pembuatan: ${new Date().toLocaleString('id-ID')}
Transaksi ID: ${AppState.transactionId}

Catatan:
- Simpan informasi ini di tempat yang aman
- Password hanya ditampilkan sekali
- Hubungi support jika ada masalah
        `;
        
        const blob = new Blob([details], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `panel-details-${AppState.panelCredentials.username}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Detail panel berhasil disimpan!', 'success');
    }

    // Function: Show step
    function showStep(stepNumber) {
        // Update current step
        AppState.currentStep = stepNumber;
        
        // Update step indicators
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            
            step.classList.remove('active', 'completed');
            
            if (stepNum === stepNumber) {
                step.classList.add('active');
            } else if (stepNum < stepNumber) {
                step.classList.add('completed');
            }
        });
        
        // Show corresponding content
        stepContents.forEach(content => {
            content.classList.remove('active');
            
            const contentId = content.id;
            const contentStep = contentId.split('-')[1];
            
            if (parseInt(contentStep) === stepNumber) {
                content.classList.add('active');
            }
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Function: Reset app state
    function resetAppState() {
        // Reset inputs
        usernameInput.value = '';
        emailInput.value = '';
        
        // Reset package selection
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        selectedPackageInfo.style.display = 'none';
        nextToPaymentBtn.disabled = true;
        
        // Reset payment
        cancelPayment();
        
        // Reset state
        AppState.username = '';
        AppState.email = '';
        AppState.selectedPackage = null;
        AppState.transactionId = null;
        AppState.paymentAmount = 0;
        AppState.paymentUniqueFee = 0;
        AppState.qrisExpiry = null;
        AppState.pollingInterval = null;
        AppState.transactionStatus = 'pending';
        AppState.panelCredentials = null;
        
        // Reset form validation
        clearError(usernameInput);
        nextToPackagesBtn.disabled = true;
    }

    // Function: Show error state
    function showErrorState(title, description) {
        document.getElementById('error-title').textContent = title;
        document.getElementById('error-description').textContent = description;
        showStep('error');
    }

    // Function: Show loading overlay
    function showLoading(message, detail) {
        loadingMessage.textContent = message;
        loadingDetail.textContent = detail;
        loadingOverlay.classList.remove('hidden');
    }

    // Function: Hide loading overlay
    function hideLoading() {
        loadingOverlay.classList.add('hidden');
    }

    // Function: Show toast notification
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        
        // Set toast type
        toast.className = 'toast';
        toast.classList.add(type);
        
        // Show toast
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    // Function: Show error on input
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.color = 'var(--danger-color)';
        errorElement.style.fontSize = '0.85rem';
        errorElement.style.marginTop = '5px';
        
        input.style.borderColor = 'var(--danger-color)';
    }

    // Function: Clear error from input
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        input.style.borderColor = '';
    }

    // Utility Functions
    function generateRandomFee() {
        const min = CONFIG.system.randomFeeMin;
        const max = CONFIG.system.randomFeeMax;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateRandomPassword(length = 12) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return password;
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    // For testing: Add a button to simulate successful payment
    // This would be removed in production
    const testPaymentBtn = document.createElement('button');
    testPaymentBtn.textContent = 'Simulate Payment';
    testPaymentBtn.style.position = 'fixed';
    testPaymentBtn.style.bottom = '10px';
    testPaymentBtn.style.left = '10px';
    testPaymentBtn.style.zIndex = '9999';
    testPaymentBtn.style.padding = '10px';
    testPaymentBtn.style.backgroundColor = 'var(--success-color)';
    testPaymentBtn.style.color = 'white';
    testPaymentBtn.style.border = 'none';
    testPaymentBtn.style.borderRadius = '5px';
    testPaymentBtn.style.cursor = 'pointer';
    testPaymentBtn.addEventListener('click', () => {
        if (AppState.pollingInterval) {
            // Simulate immediate payment success
            clearInterval(AppState.pollingInterval);
            clearInterval(AppState.countdownInterval);
            handlePaymentSuccess();
        }
    });
    document.body.appendChild(testPaymentBtn);
});