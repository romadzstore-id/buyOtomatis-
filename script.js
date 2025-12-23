// Configuration (ini akan dipisah di server untuk produksi)
const CONFIG = {
  qrisApiEndpoint: 'https://api.yourdomain.com/qris/generate',
  // Harga produk
  products: {
    'Panel RAM 2GB': 15000,
    'Panel RAM 4GB': 25000,
    'Panel RAM 8GB': 45000,
    'Reseller Starter': 150000,
    'Reseller Professional': 500000,
    'Reseller Enterprise': 1000000
  }
};

// DOM Elements
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

// Theme Management
function initTheme() {
  const themeToggle = $('#themeToggle');
  const sunIcon = $('#sunIcon');
  const moonIcon = $('#moonIcon');
  
  // Check saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  
  // Update icons
  if (savedTheme === 'dark') {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
  
  // Toggle theme
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  });
}

// Toast Notification System
class Toast {
  static show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 animate-slideIn">
        <span class="toast-icon">${this.getIcon(type)}</span>
        <span class="flex-1">${message}</span>
        <button class="toast-close text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          ✕
        </button>
      </div>
    `;
    
    const container = $('#toastContainer') || this.createContainer();
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => this.remove(toast), duration);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => this.remove(toast));
    
    return toast;
  }
  
  static createContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed bottom-6 right-6 z-50 space-y-2 w-80';
    document.body.appendChild(container);
    return container;
  }
  
  static remove(toast) {
    toast.classList.add('animate-slideOut');
    setTimeout(() => toast.remove(), 300);
  }
  
  static getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || '📢';
  }
}

// Payment System
class PaymentSystem {
  constructor() {
    this.currentOrder = null;
    this.init();
  }
  
  init() {
    // Product buttons
    $$('[data-product]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const product = e.target.dataset.product;
        const price = parseInt(e.target.dataset.price);
        this.selectProduct(product, price);
      });
    });
    
    // Reseller button
    $('#resellerBtn').addEventListener('click', () => {
      this.selectProduct('Reseller Starter', 150000);
    });
    
    // Payment buttons
    $('#copyPaymentBtn')?.addEventListener('click', this.copyPaymentString.bind(this));
    $('#cancelBtn')?.addEventListener('click', this.cancelPayment.bind(this));
    
    // Set current year
    $('#currentYear').textContent = new Date().getFullYear();
  }
  
  selectProduct(product, price) {
    this.currentOrder = {
      product,
      price,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    this.showPaymentUI();
    this.generateQRCode();
    
    Toast.show(`"${product}" ditambahkan ke pembayaran`, 'success');
    
    // Scroll to payment section
    $('#payment').scrollIntoView({ behavior: 'smooth' });
  }
  
  showPaymentUI() {
    $('#paymentEmpty').style.display = 'none';
    $('#paymentContainer').style.display = 'block';
    
    // Update order details
    const orderDetails = $('#orderDetails');
    orderDetails.innerHTML = `
      <div class="flex justify-between">
        <span>Produk</span>
        <span class="font-medium">${this.currentOrder.product}</span>
      </div>
      <div class="flex justify-between">
        <span>Harga</span>
        <span>Rp ${this.currentOrder.price.toLocaleString()}</span>
      </div>
      <div class="flex justify-between">
        <span>Durasi</span>
        <span>30 Hari</span>
      </div>
    `;
    
    $('#totalAmount').textContent = `Rp ${this.currentOrder.price.toLocaleString()}`;
  }
  
  async generateQRCode() {
    const qrDiv = $('#qrcode');
    
    // Show loading
    qrDiv.innerHTML = `
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-3"></div>
        <p class="text-sm text-gray-500">Membuat QR Code...</p>
      </div>
    `;
    
    try {
      // In production, ini akan diisi dengan API call ke server Anda
      // const response = await fetch(CONFIG.qrisApiEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: this.currentOrder.price,
      //     orderId: `ORDER-${Date.now()}`,
      //     product: this.currentOrder.product
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate dummy QR (in production, use real QR from API)
      qrDiv.innerHTML = `
        <div class="text-center">
          <div class="w-64 h-64 bg-gray-100 dark:bg-gray-900 flex items-center justify-center rounded-lg">
            <div class="text-center">
              <div class="text-6xl mb-2">📱</div>
              <p class="text-sm text-gray-500 font-mono">QRIS_DUMMY_${this.currentOrder.price}</p>
              <p class="text-xs text-gray-400 mt-2">(Simulasi pembayaran)</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Scan dengan aplikasi bank atau e-wallet
          </p>
        </div>
      `;
      
      Toast.show('QR Code berhasil dibuat', 'success');
      
    } catch (error) {
      qrDiv.innerHTML = `
        <div class="text-center text-red-500">
          <div class="text-4xl mb-2">❌</div>
          <p class="text-sm">Gagal membuat QR Code</p>
          <button class="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">
            Coba Lagi
          </button>
        </div>
      `;
      
      Toast.show('Gagal membuat QR Code', 'error');
    }
  }
  
  copyPaymentString() {
    const paymentString = `QRIS_HIRROFFICIAL_${this.currentOrder.product.replace(/\s/g, '_')}_${this.currentOrder.price}`;
    
    navigator.clipboard.writeText(paymentString).then(() => {
      Toast.show('Payment string disalin ke clipboard', 'success');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = paymentString;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      Toast.show('Payment string disalin', 'success');
    });
  }
  
  cancelPayment() {
    if (confirm('Batalkan pembayaran ini?')) {
      this.currentOrder = null;
      $('#paymentContainer').style.display = 'none';
      $('#paymentEmpty').style.display = 'block';
      $('#paymentStatus').innerHTML = `
        <span class="w-2 h-2 bg-yellow-500 rounded-full inline-block mr-2 animate-pulse"></span>
        Menunggu Pembayaran
      `;
      Toast.show('Pembayaran dibatalkan', 'info');
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  window.paymentSystem = new PaymentSystem();
  
  // Add CSS animations for toasts
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .animate-slideIn { animation: slideIn 0.3s ease-out; }
    .animate-slideOut { animation: slideOut 0.3s ease-in forwards; }
    
    /* Smooth scrolling */
    html { scroll-behavior: smooth; }
    
    /* Button hover effects */
    button, a { transition: all 0.3s ease; }
    
    /* Glass morphism effects */
    .glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  `;
  document.head.appendChild(style);
});

// Export for module usage
export { CONFIG, PaymentSystem, Toast };