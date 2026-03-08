import { db, collection, getDocs, query, orderBy } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayBlogs();
});

async function fetchAndDisplayBlogs() {
    const container = document.getElementById('blogs-container');
    const loading = document.getElementById('loading-spinner');
    const errorMsg = document.getElementById('error-message');

    try {
        const blogsRef = collection(db, 'blogs');
        // Order by date descending
        const q = query(blogsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        loading.classList.add('hidden');
        container.classList.remove('hidden');

        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 border border-cyber-neon/20 bg-cyber-dark/40">
                    <i class="fa-solid fa-database text-4xl text-cyber-gray mb-4"></i>
                    <h3 class="text-xl font-orbitron text-white mb-2">No Intel Found</h3>
                    <p class="text-cyber-gray font-mono text-sm">> Database is currently empty.</p>
                </div>
            `;
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            const blog = doc.data();
            const date = new Date(blog.date).toLocaleDateString();

            // Format content preview (first 100 characters)
            const previewText = blog.content.length > 120 ? blog.content.substring(0, 120) + '...' : blog.content;

            html += `
                <article class="service-card border border-cyber-neon/20 bg-cyber-dark/80 backdrop-blur-md overflow-hidden flex flex-col h-full group">
                    <div class="h-48 overflow-hidden relative">
                        <div class="absolute inset-0 bg-cyber-neon/10 group-hover:bg-transparent transition-colors z-10"></div>
                        <img src="${blog.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop'}" alt="${blog.title}" class="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700">
                        <div class="absolute bottom-0 left-0 bg-cyber-black/80 px-3 py-1 text-xs text-cyber-neon font-mono z-20 border-t border-r border-cyber-neon/30">
                            > ${date}
                        </div>
                    </div>
                    
                    <div class="p-6 flex flex-col flex-grow relative">
                        <!-- Cyber Decorative Corner -->
                        <div class="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyber-neon mt-4 mr-4"></div>
                        
                        <div class="text-xs text-cyber-gray mb-2 font-mono"><i class="fa-solid fa-user-astronaut mr-1"></i> ${blog.author || 'Admin'}</div>
                        <h2 class="text-xl font-orbitron font-bold text-white mb-4 group-hover:text-cyber-neon transition-colors line-clamp-2">${blog.title}</h2>
                        
                        <p class="text-cyber-gray text-sm mb-6 flex-grow font-mono leading-relaxed line-clamp-3">
                            ${previewText}
                        </p>
                        
                        <button class="flex items-center gap-2 text-cyber-neon font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all mt-auto" onclick="alert('Full post view functionality not implemented in mockup. Data successfully retrieved from Firebase!')">
                            Access File <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </article>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error("Error fetching blogs:", error);
        loading.classList.add('hidden');
        errorMsg.classList.remove('hidden');
        document.getElementById('blogs-container').classList.add('hidden');
    }
}
