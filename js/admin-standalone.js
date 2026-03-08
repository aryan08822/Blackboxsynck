// ========================================================
// BlackBox Synck — Standalone Admin Panel Script
// Works WITHOUT Firebase (local file:// compatible)
// ========================================================

const ADMIN_EMAIL    = "admin@blackboxsynck.com";
const ADMIN_PASSWORD = "Aryanbhai888@#@";

// DOM Elements
const loginSection     = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const authControls     = document.getElementById('auth-controls');
const loginForm        = document.getElementById('login-form');
const loginError       = document.getElementById('login-error');
const logoutBtn        = document.getElementById('logout-btn');
const showAddBlogBtn   = document.getElementById('show-add-blog-btn');
const blogFormSection  = document.getElementById('blog-form-section');
const cancelBlogBtn    = document.getElementById('cancel-blog-btn');
const blogForm         = document.getElementById('blog-form');
const formTitle        = document.getElementById('form-title');
const blogSubmitBtn    = document.getElementById('blog-submit-btn');
const adminBlogsList   = document.getElementById('admin-blogs-list');

// --- Session state using sessionStorage ---
function isLoggedIn() {
    return sessionStorage.getItem('bbs_admin_auth') === 'true';
}

// On page load: check if already authenticated
window.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        showDashboard();
        loadAdminBlogsMock();
    } else {
        showLogin();
    }
});

// --- Login Logic ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btnContent = document.querySelector('#login-submit .btn-content');

    btnContent.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
    loginError.classList.add('hidden');

    setTimeout(() => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('bbs_admin_auth', 'true');
            showDashboard();
            loadAdminBlogsMock();
            btnContent.innerHTML = 'Authenticate';
        } else {
            loginError.innerHTML = '> Access Denied: Invalid Credentials';
            loginError.classList.remove('hidden');
            btnContent.innerHTML = 'Authenticate';
        }
    }, 800);
});

// --- Logout Logic ---
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('bbs_admin_auth');
    showLogin();
});

// --- UI Functions ---
function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    authControls.classList.remove('hidden');
}

function showLogin() {
    dashboardSection.classList.add('hidden');
    authControls.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
    loginError.classList.add('hidden');
}

// --- Blog Form Toggles ---
showAddBlogBtn.addEventListener('click', () => {
    blogForm.reset();
    document.getElementById('blog-id').value = '';
    formTitle.innerText = 'Initialize New Protocol';
    blogSubmitBtn.querySelector('.btn-content').innerHTML = 'Publish Protocol <i class="fa-solid fa-satellite-dish ml-2"></i>';
    blogFormSection.classList.remove('hidden');
    blogFormSection.scrollIntoView({ behavior: 'smooth' });
});

cancelBlogBtn.addEventListener('click', () => {
    blogFormSection.classList.add('hidden');
    blogForm.reset();
});

blogForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Note: Firebase is not yet connected. Configure firebase-config.js to enable live blog publishing.");
    blogFormSection.classList.add('hidden');
});

// --- Mock Blog List ---
function loadAdminBlogsMock() {
    adminBlogsList.innerHTML = `
        <div class="text-yellow-400 bg-yellow-400/10 p-3 border border-yellow-400/30 font-mono text-xs mb-4">
            > OFFLINE MODE: Firebase not configured. Blog data is not live.
        </div>
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-cyber-neon/20 bg-cyber-light/20 gap-4">
            <div class="flex-grow">
                <h4 class="text-white font-orbitron font-bold">[MOCK] Zero-Day Vulnerability in Popular API Gateway</h4>
                <div class="text-xs text-cyber-gray font-mono mt-1 flex gap-4">
                    <span><i class="fa-regular fa-clock mr-1"></i> ${new Date().toLocaleDateString()}</span>
                    <span><i class="fa-solid fa-user-astronaut mr-1"></i> Admin_Root</span>
                </div>
            </div>
            <div class="flex gap-2 shrink-0">
                <button onclick="alert('Firebase needed to edit')" class="w-8 h-8 flex items-center justify-center rounded border border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-black transition-colors" title="Edit">
                    <i class="fa-solid fa-pen text-sm"></i>
                </button>
                <button onclick="alert('Firebase needed to delete')" class="w-8 h-8 flex items-center justify-center rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                    <i class="fa-solid fa-trash text-sm"></i>
                </button>
            </div>
        </div>
    `;
}
