// Podrška za starije preglednike
if (!('IntersectionObserver' in window)) {
    // Polyfill za IntersectionObserver
    document.querySelectorAll('.fade-in').forEach(element => {
        element.classList.add('visible');
    });
    
    document.querySelectorAll('.stat-number').forEach(element => {
        const target = parseInt(element.getAttribute('data-target'));
        const suffix = element.getAttribute('data-suffix') || '';
        element.textContent = target + suffix;
    });
} else {
    document.addEventListener('DOMContentLoaded', function() {
        let lastScrollPos = window.pageYOffset;
        const SCROLL_OFFSET = 150;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const currentScrollPos = window.pageYOffset;
                const scrollingDown = currentScrollPos > lastScrollPos;
                lastScrollPos = currentScrollPos;

                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('stat-number')) {
                        const target = parseInt(entry.target.getAttribute('data-target'));
                        animateNumber(entry.target, target);
                    }
                    
                    if (scrollingDown) {
                        entry.target.style.transform = 'translateY(20px)';
                    } else {
                        entry.target.style.transform = 'translateY(-20px)';
                    }
                    requestAnimationFrame(() => {
                        entry.target.classList.add('visible');
                    });
                } else {
                    entry.target.classList.remove('visible');
                    if (!entry.target.matches('header')) {
                        if (scrollingDown) {
                            entry.target.style.transform = 'translateY(-20px)';
                        } else {
                            entry.target.style.transform = 'translateY(20px)';
                        }
                        // Reset brojača kad element nije vidljiv
                        if (entry.target.classList.contains('stat-number')) {
                            entry.target.textContent = '0';
                        }
                    }
                }
            });
        }, {
            rootMargin: '-30px 0px -30px 0px'
        });

        // Header inicijalizacija
        const header = document.querySelector('header');
        header.classList.add('visible');

        // Promatraj sve sekcije, brojače i header
        document.querySelectorAll('section, .stat-number, header, #kontakt h2:last-of-type, .contact-form-container').forEach(element => {
            element.classList.add('fade-in');
            observer.observe(element);
        });

        document.querySelectorAll('nav a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const section = document.querySelector(this.getAttribute('href'));
                const headerOffset = SCROLL_OFFSET;
                
                window.requestAnimationFrame(() => {
                    const elementPosition = section.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                });
            });
        });

        function updateActiveNav() {
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('nav a');
            const slider = document.querySelector('.sliding-selector');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - SCROLL_OFFSET;
                const sectionBottom = sectionTop + section.offsetHeight;
                const scrollPosition = window.scrollY;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    const currentId = section.getAttribute('id');
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${currentId}`) {
                            slider.style.width = link.offsetWidth + 'px';
                            slider.style.left = link.offsetLeft + 'px';
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', debounce(updateActiveNav));
        
        const initialLink = document.querySelector('nav a');
        const slider = document.querySelector('.sliding-selector');
        slider.style.width = initialLink.offsetWidth + 'px';
        slider.style.left = initialLink.offsetLeft + 'px';
        initialLink.classList.add('active');

        function validateEmailInput(input) {
            input.setCustomValidity('');
        }

        function validateEmailBlur(input) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            
            if(input.value.trim() === '') {
                input.setCustomValidity('');
                return;
            }
            
            if(!emailRegex.test(input.value.trim())) {
                input.setCustomValidity('Molimo unesite ispravnu e-mail adresu.');
                input.reportValidity();
            } else {
                input.setCustomValidity('');
            }
        }

        const form = document.querySelector('form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const imeInput = document.getElementById('ime');
            const emailInput = document.getElementById('email');
            const predmetInput = document.getElementById('predmet');
            const porukaInput = document.getElementById('poruka');
            
            [imeInput, emailInput, predmetInput, porukaInput].forEach(input => {
                input.setCustomValidity('');
            });
            
            let hasErrors = false;
            
            if (!imeInput.value.trim()) {
                imeInput.setCustomValidity('Molimo unesite ime i prezime.');
                hasErrors = true;
            }
            
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailInput.value.trim()) {
                emailInput.setCustomValidity('Molimo unesite e-mail adresu.');
                hasErrors = true;
            } else if (!emailRegex.test(emailInput.value.trim())) {
                emailInput.setCustomValidity('Molimo unesite ispravnu e-mail adresu.');
                hasErrors = true;
            }
            
            if (!predmetInput.value.trim()) {
                predmetInput.setCustomValidity('Molimo unesite predmet poruke.');
                hasErrors = true;
            }
            
            if (!porukaInput.value.trim()) {
                porukaInput.setCustomValidity('Molimo unesite tekst poruke.');
                hasErrors = true;
            }
            
            if (hasErrors) {
                form.reportValidity();
                return;
            }

            const button = this.querySelector('input[type="submit"]');
            const originalText = button.value;
            button.value = 'Poruka poslana!';
            button.disabled = true;
            
            setTimeout(() => {
                button.value = originalText;
                button.disabled = false;
                this.reset();
            }, 2000);
        });

        const textarea = document.querySelector('textarea');
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });

        function debounce(func, wait = 10) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        // Optimizacija animacije brojeva
        function animateNumber(element, final) {
            let start = 0;
            const duration = 2000;
            const stepTime = Math.min(20, duration / 100); // Optimizirani korak
            const steps = duration / stepTime;
            const increment = final / steps;
            const suffix = element.getAttribute('data-suffix') || '';
            
            // Korištenje requestAnimationFrame umjesto setInterval za bolje performanse
            let lastTime = null;
            
            const step = (timestamp) => {
                if (!lastTime) lastTime = timestamp;
                const deltaTime = timestamp - lastTime;
                
                if (deltaTime >= stepTime) {
                    lastTime = timestamp;
                    start += increment;
                    element.textContent = Math.floor(start) + suffix;
                    
                    if (start < final) {
                        requestAnimationFrame(step);
                    } else {
                        element.textContent = final + suffix;
                    }
                } else {
                    requestAnimationFrame(step);
                }
            };
            
            requestAnimationFrame(step);
        }
    });
}

// Uklanjamo duplicirani kod za tamnu temu
class ThemeTransition {
    constructor() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.mask = document.querySelector('.theme-mask');
        this.isAnimating = false;
        this.isDark = false;
        
        this.init();
    }
    
    init() {
        document.body.classList.remove('dark-mode');
        
        this.themeToggle.addEventListener('click', (e) => {
            if (this.isAnimating) return;
            
            const rect = this.themeToggle.getBoundingClientRect();
            const x = rect.left + rect.width/2;
            const y = rect.top + rect.height/2;
            
            this.animate(x, y);
        });
    }

    animate(x, y) {
        this.isAnimating = true;
        
        this.mask.style.willChange = 'opacity';
        document.body.style.willChange = 'background-color';
        
        // Dodajemo klasu koja će spriječiti tranziciju teksta
        document.body.classList.add('theme-switching');
        
        document.body.style.transition = 'none';
        
        document.documentElement.style.setProperty('--transition-x', `${x}px`);
        document.documentElement.style.setProperty('--transition-y', `${y}px`);
        document.documentElement.style.setProperty('--is-transitioning', '1');
        
        const duration = window.innerWidth <= 768 ? 500 : 700;
        
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        ) * 1.0;
        
        let startTime = null;
        
        const animateFrame = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            
            if (progress < 1) {
                const currentRadius = endRadius * progress;
                const eased = this.easeInOutQuad(progress);
                
                document.documentElement.style.setProperty(
                    '--transition-radius',
                    `${currentRadius}px`
                );
                document.documentElement.style.setProperty(
                    '--is-transitioning',
                    eased.toString()
                );
                
                // Postepeno mijenjaj scrollbar boje tijekom animacije
                this.updateScrollbarColors(eased);
                
                requestAnimationFrame(animateFrame);
            } else {
                this.finishAnimation(endRadius);
            }
        };
        
        requestAnimationFrame(animateFrame);
    }

    finishAnimation(endRadius) {
        document.documentElement.style.setProperty(
            '--transition-radius',
            `${endRadius}px`
        );
        
        this.isDark = !this.isDark;
        document.body.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('dark-mode'); // Dodati ovu liniju
        
        requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--is-transitioning', '0');
            document.documentElement.style.setProperty('--transition-radius', '0px');
            
            document.body.style.transition = 'color 0.3s ease-out, background-color 0.3s ease-out';
            
            // Uklanjamo klasu nakon animacije
            setTimeout(() => {
                document.body.classList.remove('theme-switching');
            }, 50);
            
            this.mask.style.willChange = 'auto';
            this.isAnimating = false;
        });
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    // Dodavanje metode za direktno mijenjanje teme bez animacije
    toggleTheme() {
        this.isDark = !this.isDark;
        document.body.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('dark-mode'); // Dodati ovu liniju
    }

    // Dodavanje nove metode za ažuriranje scrollbar boja
    updateScrollbarColors(progress) {
        // Svjetla tema
        const lightTrack = '#fff';
        const lightThumb = '#ccc';
        
        // Tamna tema
        const darkTrack = '#222';
        const darkThumb = '#444';
        
        // Izračunaj trenutne boje temeljene na napretku
        const currentTrack = this.isDark 
            ? this.interpolateColor(darkTrack, lightTrack, progress)
            : this.interpolateColor(lightTrack, darkTrack, progress);
            
        const currentThumb = this.isDark
            ? this.interpolateColor(darkThumb, lightThumb, progress)
            : this.interpolateColor(lightThumb, darkThumb, progress);
        
        // Postaviti CSS varijable
        document.documentElement.style.setProperty('--scrollbar-track', currentTrack);
        document.documentElement.style.setProperty('--scrollbar-thumb', currentThumb);
    }

    // Pomoćna funkcija za interpolaciju boja
    interpolateColor(color1, color2, factor) {
        if (color1.startsWith('#') && color2.startsWith('#')) {
            // HEX format
            const hex = (color) => {
                return parseInt(color.substring(1), 16);
            };
            
            const r1 = (hex(color1) >> 16) & 0xff;
            const g1 = (hex(color1) >> 8) & 0xff;
            const b1 = hex(color1) & 0xff;
            
            const r2 = (hex(color2) >> 16) & 0xff;
            const g2 = (hex(color2) >> 8) & 0xff;
            const b2 = hex(color2) & 0xff;
            
            const r = Math.round(r1 + factor * (r2 - r1));
            const g = Math.round(g1 + factor * (g2 - g1));
            const b = Math.round(b1 + factor * (b2 - b1));
            
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        }
        
        return factor < 0.5 ? color1 : color2; // Fallback
    }
}

// Inicijaliziramo samo jednom
document.addEventListener('DOMContentLoaded', () => {
    new ThemeTransition();
});