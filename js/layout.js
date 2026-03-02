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

// Carousel
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselDotsContainer = document.getElementById('carouselDots');

if (carouselTrack) {
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    function getCardsPerView() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 900) return 2;
        return 3;
    }

    function getTotalSlides() {
        const cards = carouselTrack.children.length;
        const perView = getCardsPerView();
        return Math.max(1, cards - perView + 1);
    }

    function getSlideWidth() {
        const card = carouselTrack.children[0];
        if (!card) return 0;
        return card.offsetWidth + 20; // card width + gap
    }

    function updateCarousel(animate = true) {
        if (!animate) carouselTrack.classList.add('dragging');
        else carouselTrack.classList.remove('dragging');

        const offset = -currentIndex * getSlideWidth();
        currentTranslate = offset;
        prevTranslate = offset;
        carouselTrack.style.transform = `translateX(${offset}px)`;
        updateDots();
    }

    function createDots() {
        carouselDotsContainer.innerHTML = '';
        const total = getTotalSlides();
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            carouselDotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = carouselDotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    carouselPrev.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    carouselNext.addEventListener('click', () => {
        if (currentIndex < getTotalSlides() - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Drag / Touch support
    function dragStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        carouselTrack.classList.add('dragging');
    }

    function dragMove(e) {
        if (!isDragging) return;
        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        carouselTrack.classList.remove('dragging');

        const movedBy = currentTranslate - prevTranslate;
        const threshold = getSlideWidth() / 4;

        if (movedBy < -threshold && currentIndex < getTotalSlides() - 1) {
            currentIndex++;
        } else if (movedBy > threshold && currentIndex > 0) {
            currentIndex--;
        }

        updateCarousel();
    }

    // Mouse events
    carouselTrack.addEventListener('mousedown', dragStart);
    carouselTrack.addEventListener('mousemove', dragMove);
    carouselTrack.addEventListener('mouseup', dragEnd);
    carouselTrack.addEventListener('mouseleave', () => {
        if (isDragging) dragEnd();
    });

    // Touch events
    carouselTrack.addEventListener('touchstart', dragStart, { passive: true });
    carouselTrack.addEventListener('touchmove', dragMove, { passive: true });
    carouselTrack.addEventListener('touchend', dragEnd);

    // Prevent link/image drag
    carouselTrack.addEventListener('dragstart', (e) => e.preventDefault());

    // Init & resize
    createDots();
    window.addEventListener('resize', () => {
        const total = getTotalSlides();
        if (currentIndex >= total) currentIndex = total - 1;
        createDots();
        updateCarousel(false);
    });
}

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