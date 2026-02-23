lucide.createIcons();

const header = document.querySelector('header');
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');
const body = document.body;

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    document.getElementById('scrollProgress').style.width = progress + '%';

    header.classList.toggle('scrolled', scrollTop > 50);
});

// Mobile Menu
function toggleMenu() {
    const isOpen = navLinks.classList.toggle('active');
    const iconName = isOpen ? 'x' : 'menu';
    menuToggle.innerHTML = `<i data-lucide="${iconName}"></i>`;
    lucide.createIcons();
    body.style.overflow = isOpen ? 'hidden' : 'auto';
}

menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
});

document.querySelectorAll('.links_header a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) toggleMenu();
    });
});

document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        toggleMenu();
    }
});

// Scroll-triggered animations with IntersectionObserver
const revealElements = document.querySelectorAll('.reveal, .anim');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            entry.target.style.transitionDelay = (delay * 0.15) + 's';
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Counter Animation for Stats
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target);
            animateCounter(entry.target, target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

function animateCounter(element, target) {
    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// PWA Install
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

let deferredPrompt = null;
const btnInstall = document.getElementById('btnInstall');
const downloadHint = document.getElementById('downloadHint');
const iosModal = document.getElementById('iosModal');
const iosModalClose = document.getElementById('iosModalClose');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    downloadHint.textContent = 'Clique para instalar agora';
});

btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            downloadHint.textContent = 'Aplicativo instalado!';
        }
        deferredPrompt = null;
    } else {
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

        if (isInStandalone) {
            downloadHint.textContent = 'Voce ja esta usando o app!';
        } else if (isIos) {
            iosModal.classList.add('active');
        } else {
            downloadHint.textContent = 'Use o menu do navegador > "Instalar app"';
        }
    }
});

iosModalClose.addEventListener('click', () => {
    iosModal.classList.remove('active');
});

iosModal.addEventListener('click', (e) => {
    if (e.target === iosModal) iosModal.classList.remove('active');
});

window.addEventListener('appinstalled', () => {
    downloadHint.textContent = 'Aplicativo instalado com sucesso!';
    deferredPrompt = null;
});

// Smooth hover tilt effect on portfolio items
document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});