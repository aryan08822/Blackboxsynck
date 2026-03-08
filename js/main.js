document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');

            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            }
        });
    }

    // --- Navbar Scroll Effect ---
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('bg-cyber-dark', 'shadow-[0_4px_30px_rgba(0,255,0,0.1)]');
            nav.classList.remove('bg-cyber-dark/80');
        } else {
            nav.classList.remove('bg-cyber-dark', 'shadow-[0_4px_30px_rgba(0,255,0,0.1)]');
            nav.classList.add('bg-cyber-dark/80');
        }
    });

    // --- Three.js Cyber Background ---
    const canvas = document.getElementById('cyber-bg');
    if (canvas) {
        initThreeJS(canvas);
    }

    // --- GSAP Animations ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Section animations
        gsap.from('.hero-text > *', {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            delay: 0.5
        });

        // Service Cards fade in up
        gsap.utils.toArray('.service-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: "power2.out"
            });
        });

        // Section Titles reveal
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%"
                },
                x: -50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        });

        // Stats Counter Animation
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            ScrollTrigger.create({
                trigger: counter,
                start: "top 80%",
                once: true,
                onEnter: () => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // ms
                    const step = target / (duration / 16); // 60fps
                    let current = 0;

                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCounter();
                }
            });
        });
    }

    // --- Terminal Typing Effect ---
    const terminalOutput = document.getElementById('terminal-output');
    if (terminalOutput) {
        runTerminalSequence(terminalOutput);
    }
});

// --- Three.js Background Implementation ---
function initThreeJS(canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        // Spread particles
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Green material
    const material = new THREE.PointsMaterial({
        size: 0.005,
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    camera.position.z = 3;

    // Mouse interactive rotation
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Slow rotation
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Subtle mouse interaction
        particlesMesh.rotation.y += mouseX * 0.5;
        particlesMesh.rotation.x += mouseY * 0.5;

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- Terminal Animation Sequence ---
async function runTerminalSequence(element) {
    const lines = [
        "> init connection...",
        "> established secure link [OK]",
        "> scanning target infra...",
        "  [=====               ] 25%",
        "  [==========          ] 50%",
        "  [===============     ] 75%",
        "  [====================] 100%",
        "> analyzing open ports...",
        "> checking for known CVEs...",
        "> WARN: 3 critical vulnerabilities found in logic layer",
        "> generating exploit payload...",
        "> deploying simulated attack...",
        "> SYSTEM COMPROMISED",
        "> ",
        "> generating remediation report...",
        "> System Secure... Waiting for new target_."
    ];

    element.innerHTML = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineElem = document.createElement('div');
        element.appendChild(lineElem);

        // Typing effect for each line
        await typeLine(line, lineElem);

        // Wait differently depending on the line
        if (line.includes('[===') || line.includes('target infra')) {
            await sleep(300);
        } else if (line.includes('COMPROMISED')) {
            lineElem.classList.add('text-red-500', 'font-bold', 'glitch');
            lineElem.setAttribute('data-text', line);
            await sleep(1000);
        } else if (line.trim() === '>') {
            await sleep(500);
        } else {
            await sleep(500 + Math.random() * 500);
        }
    }

    // Auto restart after a long pause
    setTimeout(() => runTerminalSequence(element), 10000);
}

function typeLine(text, element) {
    return new Promise(resolve => {
        let i = 0;
        element.innerHTML = '';

        const typeInterval = setInterval(() => {
            if (i < text.length) {
                // Formatting specific text colors
                if (text.includes('WARN')) {
                    element.innerHTML = text.substring(0, i + 1).replace('WARN', '<span class="text-yellow-500">WARN</span>');
                } else if (text.includes('[OK]')) {
                    element.innerHTML = text.substring(0, i + 1).replace('[OK]', '<span class="text-blue-500">[OK]</span>');
                } else {
                    element.innerHTML += text.charAt(i);
                }
                i++;
            } else {
                clearInterval(typeInterval);
                resolve();
            }
        }, 15 + Math.random() * 30); // Random typing speed
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
