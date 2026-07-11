/**
 * Wanchan Landing Page JavaScript
 * Handles smooth scrolling, theme toggling, and minor interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // Get saved theme or default to light
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('wanchan-theme') || 'light';
    } catch (e) {
        console.warn('localStorage neprieinamas');
    }
    setTheme(savedTheme, false);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Prevent clicking during transition
            if (document.body.classList.contains('theme-transitioning-out') || 
                document.body.classList.contains('theme-transitioning-in')) {
                return;
            }

            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // 1. Start out animation
            document.body.classList.add('theme-transitioning-out');
            
            // 2. Change the actual theme colors immediately so they transition smoothly while sliding out
            root.setAttribute('data-theme', newTheme);
            try {
                localStorage.setItem('wanchan-theme', newTheme);
            } catch (e) {
                console.warn('localStorage neprieinamas');
            }
            
            setTimeout(() => {
                // 3. Halfway through (when content is invisible/slid out), swap specific elements
                updateThemeElements(newTheme);
                
                // 4. Start in animation
                document.body.classList.remove('theme-transitioning-out');
                document.body.classList.add('theme-transitioning-in');
                
                setTimeout(() => {
                    // 5. Cleanup
                    document.body.classList.remove('theme-transitioning-in');
                }, 200);
            }, 400); // Wait for slide-out animation to finish (4s)
        });
    }

    function setTheme(theme, animate = true) {
        root.setAttribute('data-theme', theme);
        updateThemeElements(theme);
    }
    
    function updateThemeElements(theme) {
        // Sync popup mockups data-theme
        document.querySelectorAll('.popup-mockup-wrapper').forEach(el => {
            el.setAttribute('data-theme', theme);
        });

        // Update favicon
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            favicon.href = theme === 'dark'
                ? 'assets/brand/wanchan-dark.svg'
                : 'assets/brand/wanchan.svg';
        }
        
        // Update main logo
        const mainLogo = document.getElementById('main-logo');
        if (mainLogo) {
            mainLogo.src = theme === 'dark'
                ? 'assets/brand/wanchan-dark.svg'
                : 'assets/brand/wanchan.svg';
        }
    }

    // ===== MOBILE MENU =====
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('is-open');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('is-open');
            });
        });
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;
            
            try {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } catch (err) {
                console.warn('Neteisingas selektorius:', href);
            }
        });
    });

    // ===== SCROLL-BASED HEADER =====
    const header = document.querySelector('.site-header');
    if (header) {
        const checkScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        };
        
        window.addEventListener('scroll', checkScroll);
        checkScroll(); // Check on load
    }

    // ===== INTERSECTION OBSERVER =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });

    // ===== COPY TO CLIPBOARD =====
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return;
            
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            const originalText = btn.textContent;
            
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                console.error('Clipboard API neprieinama');
                btn.textContent = 'Klaida';
                setTimeout(() => btn.textContent = originalText, 2000);
                return;
            }

            // Copy text
            try {
                navigator.clipboard.writeText(targetEl.textContent).then(() => {
                    // Show success state
                    btn.textContent = 'Nukopijuota!';
                    btn.classList.add('success');
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.classList.remove('success');
                    }, 2000);
                }).catch(err => {
                    console.error('Kopijuoti nepavyko:', err);
                    btn.textContent = 'Klaida';
                    setTimeout(() => btn.textContent = originalText, 2000);
                });
            } catch (err) {
                console.error('Kopijuoti nepavyko (sinchroninė klaida):', err);
                btn.textContent = 'Klaida';
                setTimeout(() => btn.textContent = originalText, 2000);
            }
        });
    });
});
