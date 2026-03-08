import { auth, db, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from './firebase-config.js';

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const authControls = document.getElementById('auth-controls');

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const showAddBlogBtn = document.getElementById('show-add-blog-btn');
const blogFormSection = document.getElementById('blog-form-section');
const cancelBlogBtn = document.getElementById('cancel-blog-btn');
const blogForm = document.getElementById('blog-form');
const formTitle = document.getElementById('form-title');
const blogSubmitBtn = document.getElementById('blog-submit-btn');
const adminBlogsList = document.getElementById('admin-blogs-list');

let isDevModeUnauthenticated = false;
// If firebase config is default "YOUR_API_KEY", we allow bypass for mockup UI demonstration purposes

// Checking Firebase Init
if (auth && auth.app && auth.app.options && auth.app.options.apiKey === "YOUR_API_KEY") {
    console.warn("Using placeholder Firebase Config. Enabling Dev/Mock bypass mode.");
    isDevModeUnauthenticated = true;
} else if (!auth || !auth.app) {
    // Failsafe if auth config is broken
    isDevModeUnauthenticated = true;
}

// --- Authentication State Observer ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in.
        showDashboard();
        loadAdminBlogs();
    } else {
        // No user is signed in.
        if (!isDevModeUnauthenticated) {
            showLogin();
        }
    }
});

// --- Login Logic ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btnContent = document.querySelector('#login-submit .btn-content');

    btnContent.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';

    // Hardcoded dev credentials check (bypassing Firebase completely)
    if (email === "admin@blackboxsynck.com" && password === "Aryanbhai888@#@") {
        setTimeout(() => {
            showDashboard();
            loadAdminBlogsMock();
            btnContent.innerHTML = 'Authenticate';
        }, 1000);
        return;
    } else if (isDevModeUnauthenticated) {
        // If in dev mode but bad password
        setTimeout(() => {
            loginError.innerHTML = '> Access Denied: Invalid Credentials';
            loginError.classList.remove('hidden');
            btnContent.innerHTML = 'Authenticate';
        }, 500);
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // State observer will handle UI switch
        btnContent.innerHTML = 'Authenticate';
        loginError.classList.add('hidden');
    } catch (error) {
        console.error("Login failed", error);
        loginError.classList.remove('hidden');
        btnContent.innerHTML = 'Authenticate';

        // Show specific error messages if needed
        if (error.code === 'auth/invalid-credential') {
            loginError.innerHTML = '> Access Denied: Invalid Credentials';
        } else {
            loginError.innerHTML = '> Error: ' + error.message;
        }
    }
});

// --- Logout Logic ---
logoutBtn.addEventListener('click', () => {
    if (isDevModeUnauthenticated) {
        showLogin();
        return;
    }

    signOut(auth).then(() => {
        // Sign-out successful. UI handled by observer.
    }).catch((error) => {
        console.error("Logout error", error);
    });
});


// --- UI Toggle Functions ---
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

// --- Blog Form UI Toggles ---
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

// --- Blog CRUD Logic ---

// Create / Update
blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isDevModeUnauthenticated) {
        alert("Mock Mode: Changes will not be saved. Please configure Firebase.");
        blogFormSection.classList.add('hidden');
        return;
    }

    const id = document.getElementById('blog-id').value;
    const title = document.getElementById('blog-title').value;
    const author = document.getElementById('blog-author').value;
    const image = document.getElementById('blog-image').value;
    const content = document.getElementById('blog-content').value;

    const btnContent = blogSubmitBtn.querySelector('.btn-content');
    btnContent.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';

    const blogData = {
        title,
        author,
        image,
        content,
        // If it's a new post, add date. Otherwise, keep existing date logic handled below.
    };

    try {
        if (id) {
            // Update
            const blogRef = doc(db, 'blogs', id);
            await updateDoc(blogRef, blogData);
        } else {
            // Create
            blogData.date = new Date().toISOString(); // Set publish date
            await addDoc(collection(db, 'blogs'), blogData);
        }

        blogFormSection.classList.add('hidden');
        blogForm.reset();
        await loadAdminBlogs();

    } catch (error) {
        console.error("Error saving document: ", error);
        alert("Error saving: " + error.message);
    } finally {
        btnContent.innerHTML = 'Publish Protocol <i class="fa-solid fa-satellite-dish ml-2"></i>';
    }
});

// Read
async function loadAdminBlogs() {
    try {
        const blogsRef = collection(db, 'blogs');
        const q = query(blogsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        displayBlogList(querySnapshot);
    } catch (error) {
        console.error("Error loading list:", error);
        adminBlogsList.innerHTML = `
            <div class="text-red-500 bg-red-500/10 p-4 border border-red-500/30 font-mono">
                > ERROR: Failed to retrieve data. Check Firebase configuration and rules.
            </div>
        `;
    }
}

// Global functions for inline HTML event handlers (Edit/Delete)
window.editBlog = async function (id) {
    if (isDevModeUnauthenticated) return alert("Mock mode active");

    // In a real app we'd fetch the specific doc to reliably get current data, 
    // or pass data directly, but we'll fetch from DB for safety
    try {
        // Quick way: fetch the list again and filter, or just get the doc
        const blogsRef = collection(db, 'blogs');
        const querySnapshot = await getDocs(query(blogsRef)); // Simplified for standard fetch
        let blogData = null;

        querySnapshot.forEach(doc => {
            if (doc.id === id) blogData = doc.data();
        });

        if (blogData) {
            document.getElementById('blog-id').value = id;
            document.getElementById('blog-title').value = blogData.title;
            document.getElementById('blog-author').value = blogData.author;
            document.getElementById('blog-image').value = blogData.image;
            document.getElementById('blog-content').value = blogData.content;

            formTitle.innerText = 'Modify Protocol Specs';
            blogSubmitBtn.querySelector('.btn-content').innerHTML = 'Update Data <i class="fa-solid fa-upload ml-2"></i>';
            blogFormSection.classList.remove('hidden');
            blogFormSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (e) {
        console.error("Error editing", e);
    }
}

window.deleteBlog = async function (id) {
    if (isDevModeUnauthenticated) return alert("Mock mode active");

    if (confirm("CRITICAL WARNING: Are you sure you want to permanently delete this protocol record?")) {
        try {
            await deleteDoc(doc(db, 'blogs', id));
            await loadAdminBlogs();
        } catch (e) {
            console.error("Delete error", e);
            alert("Delete failed: " + e.message);
        }
    }
}

function displayBlogList(querySnapshot) {
    if (querySnapshot.empty) {
        adminBlogsList.innerHTML = '<div class="text-cyber-gray font-mono">> No protocols found in database.</div>';
        return;
    }

    let html = '';
    querySnapshot.forEach((doc) => {
        const blog = doc.data();
        const date = new Date(blog.date).toLocaleDateString();

        html += `
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-cyber-neon/20 bg-cyber-light/20 hover:bg-cyber-light/40 transition-colors gap-4">
                <div class="flex-grow">
                    <h4 class="text-white font-orbitron font-bold">${blog.title}</h4>
                    <div class="text-xs text-cyber-gray font-mono mt-1 flex gap-4">
                        <span><i class="fa-regular fa-clock mr-1"></i> ${date}</span>
                        <span><i class="fa-solid fa-user-astronaut mr-1"></i> ${blog.author}</span>
                    </div>
                </div>
                <div class="flex gap-2 shrink-0">
                    <button onclick="editBlog('${doc.id}')" class="w-8 h-8 flex items-center justify-center rounded border border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-black transition-colors" title="Edit">
                        <i class="fa-solid fa-pen text-sm"></i>
                    </button>
                    <button onclick="deleteBlog('${doc.id}')" class="w-8 h-8 flex items-center justify-center rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                        <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        `;
    });

    adminBlogsList.innerHTML = html;
}

// Mock Data for UI demonstration before Firebase Auth is configured
function loadAdminBlogsMock() {
    const mockHtml = `
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-cyber-neon/20 bg-cyber-light/20 hover:bg-cyber-light/40 transition-colors gap-4">
                <div class="flex-grow">
                    <h4 class="text-white font-orbitron font-bold">[MOCK] Zero-Day Vulnerability in Popular API Gateway</h4>
                    <div class="text-xs text-cyber-gray font-mono mt-1 flex gap-4">
                        <span><i class="fa-regular fa-clock mr-1"></i> ${new Date().toLocaleDateString()}</span>
                        <span><i class="fa-solid fa-user-astronaut mr-1"></i> Admin_Root</span>
                    </div>
                </div>
                <div class="flex gap-2 shrink-0">
                    <button onclick="alert('Demo Mode: Edit Disabled')} " class="w-8 h-8 flex items-center justify-center rounded border border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-black transition-colors" title="Edit">
                        <i class="fa-solid fa-pen text-sm"></i>
                    </button>
                    <button onclick="alert('Demo Mode: Delete Disabled')} " class="w-8 h-8 flex items-center justify-center rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                        <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
    `;
    adminBlogsList.innerHTML = mockHtml;
}
