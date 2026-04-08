/**
 * script.js — Mangalam HDPE Pipes (Figma-matched implementation)
 * Handles: Sticky Header, Image Carousel, Zoom Lens, Cart System,
 *          FAQ Accordion, Process Tabs, Scroll Arrows, Download triggers,
 *          Contact Form, Catalogue Form.
 */
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. STICKY HEADER (scroll-direction aware)
    // ==========================================
    const stickyHeader = document.getElementById('sticky-header');
    const mainHeader = document.getElementById('main-header');

    if (stickyHeader && mainHeader) {
        let lastScrollY = 0;
        let ticking = false;

        const getFoldThreshold = () => mainHeader.offsetTop + mainHeader.offsetHeight;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const foldThreshold = getFoldThreshold();
                    const scrollingDown = currentScrollY > lastScrollY;

                    if (currentScrollY > foldThreshold && scrollingDown) {
                        stickyHeader.classList.add('is-visible');
                        stickyHeader.setAttribute('aria-hidden', 'false');
                    } else if (!scrollingDown || currentScrollY <= foldThreshold) {
                        stickyHeader.classList.remove('is-visible');
                        stickyHeader.setAttribute('aria-hidden', 'true');
                    }

                    lastScrollY = currentScrollY;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }


    // ==========================================
    // 2. IMAGE CAROUSEL (thumbnails + arrows)
    // ==========================================
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-image');
    const carouselPrev = document.getElementById('carousel-prev');
    const carouselNext = document.getElementById('carousel-next');

    let activeIndex = 0;
    const totalImages = thumbnails.length;
    let currentFullSrc = thumbnails[0]?.dataset.full || mainImage?.src;

    function goToImage(index) {
        if (index < 0) index = totalImages - 1;
        if (index >= totalImages) index = 0;
        activeIndex = index;

        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnails[activeIndex].classList.add('active');

        currentFullSrc = thumbnails[activeIndex].dataset.full;
        mainImage.src = currentFullSrc;

        const zoomLens = document.getElementById('zoom-lens');
        if (zoomLens) {
            zoomLens.style.backgroundImage = `url(${currentFullSrc})`;
        }
    }

    thumbnails.forEach((thumb, idx) => {
        thumb.addEventListener('click', () => goToImage(idx));
    });

    carouselPrev?.addEventListener('click', () => goToImage(activeIndex - 1));
    carouselNext?.addEventListener('click', () => goToImage(activeIndex + 1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToImage(activeIndex - 1);
        if (e.key === 'ArrowRight') goToImage(activeIndex + 1);
    });


    // ==========================================
    // 3. CIRCULAR MAGNIFYING LENS
    // ==========================================
    const galleryStage = document.getElementById('gallery-stage');
    const zoomLens = document.getElementById('zoom-lens');
    const ZOOM_FACTOR = 2.5;

    if (galleryStage && zoomLens) {
        zoomLens.style.backgroundImage = `url(${currentFullSrc})`;

        galleryStage.addEventListener('mouseenter', () => {
            zoomLens.style.backgroundImage = `url(${currentFullSrc})`;
            zoomLens.classList.add('is-active');
        });

        galleryStage.addEventListener('mouseleave', () => {
            zoomLens.classList.remove('is-active');
        });

        galleryStage.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const stageRect = galleryStage.getBoundingClientRect();
                const cursorX = e.clientX - stageRect.left;
                const cursorY = e.clientY - stageRect.top;
                const lensSize = 180;
                const lensRadius = lensSize / 2;

                zoomLens.style.transform =
                    `translate3d(${cursorX - lensRadius}px, ${cursorY - lensRadius}px, 0)`;
                zoomLens.style.backgroundSize =
                    `${stageRect.width * ZOOM_FACTOR}px ${stageRect.height * ZOOM_FACTOR}px`;

                const bgX = -(cursorX * ZOOM_FACTOR - lensRadius);
                const bgY = -(cursorY * ZOOM_FACTOR - lensRadius);
                zoomLens.style.backgroundPosition = `${bgX}px ${bgY}px`;
            });
        });
    }


    // ==========================================
    // 4. CART SYSTEM
    // ==========================================
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBody = document.getElementById('cart-body');
    const cartFooter = document.getElementById('cart-footer');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    let cart = [];

    function openCart() {
        cartDrawer?.classList.add('is-open');
        cartOverlay?.classList.add('is-open');
    }
    function closeCart() {
        cartDrawer?.classList.remove('is-open');
        cartOverlay?.classList.remove('is-open');
    }

    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);

    function renderCart() {
        if (!cartBody) return;
        if (cart.length === 0) {
            cartBody.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
        if (cartTotalPrice) cartTotalPrice.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
        if (cartFooter) cartFooter.style.display = 'block';

        cartBody.innerHTML = cart.map((item, idx) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item__img">
                <div class="cart-item__details">
                    <div class="cart-item__name">${item.name}</div>
                    <div class="cart-item__price">₹${item.price.toLocaleString('en-IN')}</div>
                    <div class="cart-item__qty">
                        <button data-action="dec" data-idx="${idx}">−</button>
                        <span>${item.qty}</span>
                        <button data-action="inc" data-idx="${idx}">+</button>
                    </div>
                </div>
                <button class="cart-item__remove" data-action="remove" data-idx="${idx}">Remove</button>
            </div>
        `).join('');

        cartBody.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const action = btn.dataset.action;
                if (action === 'inc') cart[idx].qty++;
                else if (action === 'dec') { cart[idx].qty--; if (cart[idx].qty <= 0) cart.splice(idx, 1); }
                else if (action === 'remove') cart.splice(idx, 1);
                renderCart();
            });
        });
    }

    addToCartBtn?.addEventListener('click', () => {
        const existing = cart.find(i => i.name === 'HDPE Pipe Coil');
        if (existing) { existing.qty++; }
        else {
            cart.push({
                name: 'HDPE Pipe Coil',
                price: 480000,
                qty: 1,
                image: currentFullSrc
            });
        }
        renderCart();
        openCart();
    });


    // ==========================================
    // 5. FAQ ACCORDION
    // ==========================================
    document.querySelectorAll('.faq-item__question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const wasOpen = item.classList.contains('is-open');

            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));

            // Toggle clicked
            if (!wasOpen) item.classList.add('is-open');
        });
    });


    // ==========================================
    // 6. MANUFACTURING PROCESS TABS
    // ==========================================
    const processData = [
        { title: 'High-Grade Raw Material Selection', desc: 'Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.', features: ['PE100 grade material', 'Optimal molecular weight distribution'], image: 'https://picsum.photos/seed/process1/500/350' },
        { title: 'Precision Extrusion Process', desc: 'Our advanced extruders melt and shape HDPE resin through precision-engineered dies to create uniform pipe profiles.', features: ['Temperature controlled zones', 'Consistent output rate'], image: 'https://picsum.photos/seed/process2/500/350' },
        { title: 'Controlled Cooling System', desc: 'Water spray and immersion tanks gradually cool pipes to prevent stress cracking and ensure uniform crystallization.', features: ['Multi-stage cooling tanks', 'Precision temperature control'], image: 'https://picsum.photos/seed/process3/500/350' },
        { title: 'Vacuum Sizing Technology', desc: 'Vacuum sizing ensures exact outer diameter and roundness of every pipe produced on our manufacturing lines.', features: ['Precise diameter control', 'Perfect roundness guarantee'], image: 'https://picsum.photos/seed/process4/500/350' },
        { title: 'In-Line Quality Control', desc: 'Ultrasonic wall thickness measurement and hydrostatic pressure tests at every stage of production.', features: ['100% inspection rate', 'Automated defect detection'], image: 'https://picsum.photos/seed/process5/500/350' },
        { title: 'Laser Marking System', desc: 'Permanent laser marking provides complete traceability including production date, material grade, and batch numbers.', features: ['Permanent identification', 'Full batch traceability'], image: 'https://picsum.photos/seed/process6/500/350' },
        { title: 'Automated Cutting', desc: 'Precision saw cutting systems produce clean, burr-free pipe ends for optimal joint preparation.', features: ['Clean cut surfaces', 'Custom length capability'], image: 'https://picsum.photos/seed/process7/500/350' },
        { title: 'Secure Packaging', desc: 'Protection wrapping, strapping, and palletizing ensure pipes arrive at your site in perfect condition.', features: ['Damage-proof packaging', 'Efficient load planning'], image: 'https://picsum.photos/seed/process8/500/350' }
    ];

    const processTabs = document.querySelectorAll('.process-tab');
    const processTitle = document.getElementById('process-title');
    const processDesc = document.getElementById('process-desc');
    const processFeatures = document.getElementById('process-features');
    const processImage = document.getElementById('process-image');

    function setProcessStep(stepIdx) {
        const data = processData[stepIdx];
        if (!data) return;

        processTabs.forEach(tab => tab.classList.remove('is-active'));
        processTabs[stepIdx]?.classList.add('is-active');

        if (processTitle) processTitle.textContent = data.title;
        if (processDesc) processDesc.textContent = data.desc;
        if (processFeatures) {
            processFeatures.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
        }
        if (processImage) processImage.src = data.image;
    }

    processTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setProcessStep(parseInt(tab.dataset.step));
        });
    });

    document.getElementById('process-prev')?.addEventListener('click', () => {
        const currentActive = document.querySelector('.process-tab.is-active');
        const currentStep = parseInt(currentActive?.dataset.step || 0);
        setProcessStep(Math.max(0, currentStep - 1));
    });


    // ==========================================
    // 7. APPLICATIONS SCROLL ARROWS
    // ==========================================
    const appScroll = document.getElementById('applications-scroll');
    document.getElementById('app-prev')?.addEventListener('click', () => {
        appScroll?.scrollBy({ left: -300, behavior: 'smooth' });
    });
    document.getElementById('app-next')?.addEventListener('click', () => {
        appScroll?.scrollBy({ left: 300, behavior: 'smooth' });
    });


    // ==========================================
    // 8. DOWNLOAD TRIGGERS
    // ==========================================
    function triggerDownload(filename, content) {
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    }

    // Resource downloads
    document.querySelectorAll('[data-download]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const type = link.dataset.download;
            const downloadMap = {
                'installation-manual': { name: 'HDPE_Installation_Manual.pdf', content: 'HDPE Pipe Installation Manual\n\n1. Site Preparation\n2. Pipe Handling\n3. Fusion Welding Procedure\n4. Testing & Commissioning\n5. Safety Guidelines' },
                'maintenance-handbook': { name: 'Maintenance_Handbook.pdf', content: 'Maintenance & Inspection Handbook\n\n1. Routine Inspection Schedule\n2. Leak Detection Methods\n3. Repair Procedures\n4. Performance Monitoring' },
                'engineering-specs': { name: 'Engineering_Specifications.pdf', content: 'Engineering Specifications Sheet\n\nMaterial: PE100 HDPE\nDensity: 0.95-0.96 g/cm³\nMFR: 0.2-0.5 g/10min\nYield Stress: >23 MPa' }
            };
            const file = downloadMap[type];
            if (file) triggerDownload(file.name, file.content);
        });
    });

    // Technical datasheet download
    document.getElementById('download-datasheet-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        triggerDownload('HDPE_Technical_Datasheet.pdf',
            'Mangalam HDPE Pipes — Full Technical Datasheet\n\nPipe Diameter Range: 20mm to 1600mm\nPressure Ratings: PN 2.5 to PN 16\nOperating Temp: -40°C to +60°C\nService Life: 50+ Years\nCertifications: IS 5946, ISO 4437, ASTM F2619S'
        );
    });


    // ==========================================
    // 9. CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        formSuccess?.classList.add('is-visible');
        setTimeout(() => formSuccess?.classList.remove('is-visible'), 4000);
    });


    // ==========================================
    // 10. CATALOGUE FORM
    // ==========================================
    const catalogueForm = document.getElementById('catalogue-form');

    catalogueForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = catalogueForm.querySelector('input');
        if (emailInput) {
            alert(`Catalogue will be sent to: ${emailInput.value}`);
            emailInput.value = '';
        }
    });

});
