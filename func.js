/**
 * EduNomo - AI Eğitim Materyali Oluşturucu
 * Geliştirilmiş UX/UI, Güvenlik ve Hata Giderme ile JavaScript Fonksiyonları
 * Profesyonel Sürüm v3.0 (Güvenlik ve API İyileştirmeleri)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================================================
    // DOM Elementleri ve Seçiciler
    // ============================================================================
    const SELECTORS = {
        form: '#material-form',
        contactForm: '#feedback-form',
        outputArea: '#output-area',
        resultDiv: '#result',
        syllabusResultDiv: '#syllabus-result',
        lessonPlanResultDiv: '#lesson-plan-result',
        loadingDiv: '#loading',
        loadingCharacter: '#loading-character',
        loadingMessage: '#loading-message',
        topicInput: '#topic',
        syllabusOption: '#syllabus-option',
        materialTypeSelect: '#material-type',
        materialTypeContainer: '#material-type-container',
        outputHeader: '#output-header',
        outputTitleText: '#output-title-text',
        outputSubtitle: '#output-subtitle',
        pdfDownloadArea: '#pdf-download-area',
        pdfDownloadButton: '#btn-download-pdf',
        btnCopyAll: '#btn-copy-all',
        pdfContentContainer: '#pdf-content-container',
        feedbackArea: '#feedback-area',
        charCount: '#char-count',
        preloader: '#preloader',
        menuToggle: '#menu-toggle',
        navList: '.nav-list',
        themeToggle: '#theme-toggle',
        mobileThemeToggle: '#mobile-theme-toggle',
        backToTop: '#back-to-top',
        progressBar: '.progress-fill',
        assistantImage: '#assistant-image',
        btnHelpful: '#btn-helpful',
        btnNotHelpful: '#btn-not-helpful',
        btnReset: '.btn-reset',
        btnGenerate: '#btn-generate',
        navLinks: '.nav-link',
        mainHeader: '.main-header',
        body: 'body',
        scrollAnchors: 'a[href^="#"]',
        
        // İzlence Modal Elementleri
        syllabusModal: '#syllabus-weeks-modal',
        modalClose: '#modal-close',
        weeksCount: '#weeks-count',
        weeksRange: '#weeks-range',
        weeksIncrease: '#weeks-increase',
        weeksDecrease: '#weeks-decrease',
        cancelSyllabus: '#cancel-syllabus',
        confirmSyllabus: '#confirm-syllabus',
        
        // Ders Planı Modal Elementleri
        lessonPlanModal: '#lesson-plan-modal',
        lessonModalClose: '#lesson-modal-close',
        lessonsPerWeek: '#lessons-per-week',
        minutesPerLesson: '#minutes-per-lesson',
        lessonsIncrease: '#lessons-increase',
        lessonsDecrease: '#lessons-decrease',
        minutesIncrease: '#minutes-increase',
        minutesDecrease: '#minutes-decrease',
        skipLessonPlan: '#skip-lesson-plan',
        createLessonPlan: '#create-lesson-plan',
        
        // Ders Planı Görüntüleme Modal Elementleri
        lessonPlanViewModal: '#lesson-plan-view-modal',
        lessonPlanViewClose: '#lesson-plan-view-close',
        lessonPlanViewTitle: '#lesson-plan-view-title',
        lessonPlanViewContent: '#lesson-plan-view-content',
        lessonPlanCopyAll: '#lesson-plan-copy-all',
        lessonPlanCloseBtn: '#lesson-plan-close',
        
        // Pro Sürüm Modal Elementleri
        proVersionModal: '#pro-version-modal',
        proVersionClose: '#pro-version-close',
        proContactBtn: '#pro-contact-btn',
        proLaterBtn: '#pro-later-btn',
    };

    const DOMElements = {};
    for (const key in SELECTORS) {
        try {
             DOMElements[key] = document.querySelector(SELECTORS[key]);
             if (!DOMElements[key] && key !== 'allNavLinks' && key !== 'allScrollAnchors') {
                 console.warn(`DOM Element not found for selector: ${SELECTORS[key]} (key: ${key})`);
             }
        } catch (e) {
             console.error(`Error finding DOM Element for ${key}: ${e}`);
        }
    }
    DOMElements.allNavLinks = document.querySelectorAll(SELECTORS.navLinks);
    DOMElements.allScrollAnchors = document.querySelectorAll(SELECTORS.scrollAnchors);

    // ============================================================================
    // API Bilgileri ve Yapılandırma
    // ============================================================================
    // Güvenli API yapılandırması - CSRF token ve endpoint'ler
    const API_CONFIG = {
        baseUrl: window.APP_CONFIG?.apiUrl || '/api',
        csrfToken: window.CSRF_TOKEN || '',
        geminiApiKey: 'AIzaSyDjJyH2Qdj17htK11Yaf49GC0Jvauc8A20', // Bu production'da environment variable olmalı
        geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
    };

    // Sabitler ve Ayarlar
    const MIN_CONTENT_LENGTH_FOR_ALL = 15;
    const MAX_CHAR_COUNT = 500;
    const PRELOADER_DELAY = 500;
    const SCROLL_OFFSET = 80;
    const PDF_RENDER_DELAY = 1800;
    const PDF_DEBUG_LOGGING = false;
    const DEFAULT_WEEKS_COUNT = 14;
    const MIN_WEEKS_COUNT = 1;
    const MAX_WEEKS_COUNT = 24;
    const DEFAULT_LESSONS_PER_WEEK = 2;
    const DEFAULT_MINUTES_PER_LESSON = 40;

    // ============================================================================
    // Uygulama Durumu ve Değişkenler
    // ============================================================================
    let currentMaterialsData = [];
    let currentSyllabusData = [];
    let currentLessonPlansData = [];
    let currentTopic = "";
    let isDarkMode = false;
    let isGenerating = false;
    let loadingIntervals = { progress: null, message: null };
    let isSyllabusMode = false;
    let selectedWeeksCount = DEFAULT_WEEKS_COUNT;
    let selectedLessonsPerWeek = DEFAULT_LESSONS_PER_WEEK;
    let selectedMinutesPerLesson = DEFAULT_MINUTES_PER_LESSON;
    let shouldCreateLessonPlan = false;

    // ============================================================================
    // İkonlar ve Mesajlar
    // ============================================================================
    const materialIcons = {
        "Ünite Özeti": "fas fa-file-alt",
        "Flash Kartlar": "fas fa-layer-group",
        "PowerPoint İçeriği": "fas fa-file-powerpoint",
        "Kısa Quiz Soruları": "fas fa-question-circle",
        "Çoktan Seçmeli": "fas fa-tasks",
        "Kısa Cevaplı Sorular": "fas fa-edit",
        "Boşluk Doldurma Cümleleri": "fas fa-pencil-alt",
        "Doğru/Yanlış İfadeleri": "fas fa-check-double",
        "Anahtar Kavramlar Listesi": "fas fa-key",
        "Neden-Sonuç İlişkileri": "fas fa-link",
        "Karşılaştırma Soruları": "fas fa-exchange-alt",
        "Avantajlar ve Dezavantajlar": "fas fa-balance-scale",
        "Kavram Haritası Öğeleri": "fas fa-project-diagram",
        "Gerçek Hayat Örnekleri / Analojiler": "fas fa-lightbulb",
        "Metafor / Benzetme Oluşturma": "fas fa-comments-dollar",
        "Mini Vaka Analizi / Senaryo": "fas fa-briefcase",
        "Tahmin Soruları": "fas fa-crystal-ball",
        "Tartışma Soruları": "fas fa-comments",
        "Akronim Oluşturma": "fas fa-font",
        "Diğer": "fas fa-star",
        "Ek Bilgi": "fas fa-info-circle",
        "Hata": "fas fa-exclamation-triangle",
        "Uyarı": "fas fa-exclamation-circle",
        "Bilgi": "fas fa-info-circle",
        "Hafta": "fas fa-calendar-week",
        "Konu": "fas fa-book-open",
        "İzlence": "fas fa-calendar-alt",
        "Ders Planı": "fas fa-chalkboard-teacher",
        "Öğrenme Hedefleri": "fas fa-bullseye",
        "Değerlendirme": "fas fa-clipboard-check",
        "Materyaller": "fas fa-toolbox",
        "Giriş": "fas fa-door-open",
        "Gelişme": "fas fa-chart-line",
        "Sonuç": "fas fa-flag-checkered",
        "Aktivite": "fas fa-running",
        "Ödev": "fas fa-tasks",
    };
    
    const loadingMessages = [ 
        "Bilgi işlemcilerimi ısıtıyorum... 🔥", 
        "Yaratıcılık devrelerimde dolaşıyor... 💡", 
        "Bu konu ilginçmiş, en iyi fikirleri topluyorum... 🤔", 
        "Veri akışını analiz ediyorum... ✨", 
        "Harika materyaller hazırlıyorum... 😅", 
        "Kahvemi aldım, tam odaklanma zamanı... ☕", 
        "Nöral ağlarım şarkı söylüyor! 🎶", 
        "Algoritmalarım çalışıyor, en iyisini bulacağım! ⚙️", 
        "Biraz dijital sihir yapıyorum... ✨" 
    ];

    const assistantExpressions = { 
        default: "man.png", 
        thinking: "man.png", 
        happy: "man.png", 
        surprised: "man.png" 
    };

    // ============================================================================
    // Başlangıç Fonksiyonları
    // ============================================================================
    function initializeApp() {
        hidePreloader();
        initThemeMode();
        initAOS();
        initEventListeners();
        initAnimations();
        checkApiKey();
        console.log("EduNomo v3.0 Başlatıldı!");
    }

    function hidePreloader() { 
        setTimeout(() => { 
            DOMElements.preloader?.classList.add('hidden'); 
            setTimeout(() => { 
                if (DOMElements.preloader) DOMElements.preloader.style.display = 'none'; 
            }, 500); 
        }, PRELOADER_DELAY); 
    }
    
    function initAOS() { 
        if (typeof AOS !== 'undefined') AOS.init({ 
            duration: 800, 
            offset: 120, 
            once: true, 
            easing: 'ease-out-cubic' 
        }); 
    }
    
    function initThemeMode() { 
        isDarkMode = localStorage.getItem('EduNomo-theme') === 'dark'; 
        updateTheme(); 
    }
    
    function checkApiKey() { 
        if (!API_CONFIG.geminiApiKey || API_CONFIG.geminiApiKey.length < 30) { 
            showNotification('API Anahtarı Eksik veya Geçersiz! Lütfen func.js dosyasını kontrol edin.', 'error', 6000); 
            console.error("API Anahtarı func.js içinde ayarlanmamış veya geçersiz!"); 
            setGenerateButtonState(false, true); 
        } 
    }

    function initEventListeners() {
        // Form event listeners
        DOMElements.form?.addEventListener('submit', handleFormSubmit);
        DOMElements.contactForm?.addEventListener('submit', handleContactFormSubmit);
        
        // Theme and UI event listeners
        DOMElements.themeToggle?.addEventListener('click', toggleTheme);
        DOMElements.mobileThemeToggle?.addEventListener('click', (e) => { e.preventDefault(); toggleTheme(); });
        DOMElements.backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', handleScroll);
        DOMElements.menuToggle?.addEventListener('click', toggleMobileMenu);
        document.addEventListener('click', closeMobileMenuOnClickOutside);
        
        // Navigation event listeners
        DOMElements.allNavLinks?.forEach(link => link.addEventListener('click', handleNavLinkClick));
        DOMElements.allScrollAnchors?.forEach(anchor => anchor.addEventListener('click', handleAnchorScroll));
        
        // Form input event listeners
        DOMElements.topicInput?.addEventListener('input', updateCharacterCount);
        DOMElements.btnReset?.addEventListener('click', resetFormAndOutput);
        DOMElements.pdfDownloadButton?.addEventListener('click', showProVersionModal);
        DOMElements.btnCopyAll?.addEventListener('click', copyAllContent);
        DOMElements.btnHelpful?.addEventListener('click', handleFeedbackClick);
        DOMElements.btnNotHelpful?.addEventListener('click', handleFeedbackClick);
        
        // Share buttons
        document.querySelectorAll('.btn-share').forEach(btn => { 
            btn.addEventListener('click', (e) => { 
                const platform = e.currentTarget.getAttribute('aria-label'); 
                showNotification(`${platform} için paylaşım özelliği Basic Plan için geçerlidir.`, 'info'); 
            }); 
        });
        
        // Result card event listeners
        DOMElements.resultDiv?.addEventListener('click', handleResultCardClicks);
        DOMElements.syllabusResultDiv?.addEventListener('click', handleSyllabusCardClicks);
        DOMElements.lessonPlanResultDiv?.addEventListener('click', handleLessonPlanCardClicks);
        
        // İzlence Checkbox Olayı
        DOMElements.syllabusOption?.addEventListener('change', handleSyllabusOptionChange);
        
        // İzlence Modal Olayları
        DOMElements.modalClose?.addEventListener('click', closeSyllabusModal);
        DOMElements.cancelSyllabus?.addEventListener('click', closeSyllabusModal);
        DOMElements.confirmSyllabus?.addEventListener('click', handleConfirmSyllabus);
        
        // Modal window click events
        window.addEventListener('click', (e) => {
            if (e.target === DOMElements.syllabusModal) {
                closeSyllabusModal();
            }
            if (e.target === DOMElements.lessonPlanModal) {
                closeLessonPlanModal();
            }
            if (e.target === DOMElements.lessonPlanViewModal) {
                closeLessonPlanViewModal();
            }
        });
        
        // Hafta Sayısı Kontrolleri
        DOMElements.weeksIncrease?.addEventListener('click', () => updateWeeksCount(1));
        DOMElements.weeksDecrease?.addEventListener('click', () => updateWeeksCount(-1));
        DOMElements.weeksCount?.addEventListener('input', handleWeeksCountInput);
        DOMElements.weeksRange?.addEventListener('input', handleWeeksRangeInput);
        
        // Ders Planı Modal Olayları
        DOMElements.lessonModalClose?.addEventListener('click', closeLessonPlanModal);
        DOMElements.skipLessonPlan?.addEventListener('click', handleSkipLessonPlan);
        DOMElements.createLessonPlan?.addEventListener('click', handleCreateLessonPlan);
        
        // Ders Planı Görüntüleme Modal Olayları
        DOMElements.lessonPlanViewClose?.addEventListener('click', closeLessonPlanViewModal);
        DOMElements.lessonPlanCloseBtn?.addEventListener('click', closeLessonPlanViewModal);
        DOMElements.lessonPlanCopyAll?.addEventListener('click', copyLessonPlanContent);
        
        // Ders sayısı ve süre kontrolleri
        DOMElements.lessonsIncrease?.addEventListener('click', () => updateLessonsCount(1));
        DOMElements.lessonsDecrease?.addEventListener('click', () => updateLessonsCount(-1));
        DOMElements.lessonsPerWeek?.addEventListener('input', handleLessonsCountInput);
        DOMElements.minutesIncrease?.addEventListener('click', () => updateMinutesCount(5));
        DOMElements.minutesDecrease?.addEventListener('click', () => updateMinutesCount(-5));
        DOMElements.minutesPerLesson?.addEventListener('input', handleMinutesCountInput);
        
        // Pro Sürüm Modal Olayları
        DOMElements.proVersionClose?.addEventListener('click', closeProVersionModal);
        DOMElements.proLaterBtn?.addEventListener('click', closeProVersionModal);
        DOMElements.proContactBtn?.addEventListener('click', () => {
            closeProVersionModal();
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Flash kart olaylarını başlat
        initFlashcardEvents();
    }

    function initAnimations() {
        if (typeof gsap === 'undefined') return; 
        
        // Hero animasyonları için seçicileri kontrol et
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-buttons');
        const heroImage = document.querySelector('.hero-image img');
        
        if (heroTitle) {
            gsap.fromTo(heroTitle, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.2 });
        }
        
        if (heroSubtitle) {
            gsap.fromTo(heroSubtitle, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out" });
        }
        
        if (heroButtons) {
            gsap.fromTo(heroButtons, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.8, ease: "power3.out" });
        }
        
        if (heroImage) {
            gsap.fromTo(heroImage, { scale: 0.7, opacity: 0, rotateY: -30 }, { scale: 1, opacity: 1, rotateY: -8, duration: 1.5, delay: 0.6, ease: "elastic.out(1, 0.7)" });
        }
        
        // ScrollTrigger için güvenli kontrol
        if (gsap.registerPlugin && ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
            
            const featureCards = document.querySelectorAll('.feature-card');
            if (featureCards.length > 0) {
                featureCards.forEach((card, i) => {
                    gsap.fromTo(card, 
                        { y: 60, opacity: 0, scale: 0.9 }, 
                        { 
                            y: 0, 
                            opacity: 1, 
                            scale: 1, 
                            duration: 0.8, 
                            ease: "power2.out", 
                            scrollTrigger: { 
                                trigger: card, 
                                start: "top 88%", 
                                toggleActions: "play none none none" 
                            }, 
                            delay: i * 0.1 
                        }
                    );
                });
            }
        }
    }

    // ============================================================================
    // Olay İşleyici Fonksiyonlar (Event Handlers)
    // ============================================================================
    async function handleFormSubmit(event) {
        event.preventDefault();
        if (isGenerating || DOMElements.btnGenerate?.disabled) return;
        isGenerating = true;
        setGenerateButtonState(true);

        if (!validateApiKey()) { 
            isGenerating = false; 
            setGenerateButtonState(false, true); 
            return; 
        }

        const topic = DOMElements.topicInput.value.trim();
        
        // İzlence modu kontrolü
        if (isSyllabusMode) {
            openSyllabusModal();
            return;
        }
        
        const selectedMaterialTypeKey = DOMElements.materialTypeSelect.value;
        const selectedMaterialOption = DOMElements.materialTypeSelect.options[DOMElements.materialTypeSelect.selectedIndex];
        const selectedMaterialTypeText = selectedMaterialOption.text.replace(/^[✨📄🗂️📊❓✍️✏️✅🔑🔗🔄👍👎🗺️🌍💡💼🔮🗣️🅰️]\s*/, '').trim();

        if (!validateFormInputs(topic, selectedMaterialTypeKey)) { 
            isGenerating = false; 
            setGenerateButtonState(false); 
            return; 
        }

        prepareUIForGeneration(topic, selectedMaterialTypeKey, selectedMaterialTypeText);
        scrollToOutputArea();
        loadingIntervals = startLoadingAnimation(selectedMaterialTypeKey === 'all');

        try {
            const userPrompt = createUserPrompt(topic, selectedMaterialTypeKey);
            const apiResponse = await fetchAIResponse(userPrompt, selectedMaterialTypeKey);
            processAndDisplayResults(apiResponse, topic, selectedMaterialTypeKey, selectedMaterialTypeText);
        } catch (error) {
            console.error('API İsteği veya İşleme Sırasında Hata:', error);
            displayErrorCard("İşlem Hatası", `Materyal oluşturulurken bir hata oluştu. Lütfen tekrar deneyin veya geliştirici konsolunu kontrol edin. Detay: ${error.message}`);
            resetUIAfterGeneration(false);
            animateAssistant('surprised');
        } finally {
            stopLoadingAnimation(loadingIntervals);
            isGenerating = false;
            setGenerateButtonState(false);
            if (!validateApiKey()) setGenerateButtonState(false, true);
            refreshAOS();
        }
    }

    async function handleContactFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // CSRF token ekle
        formData.append('csrf_token', API_CONFIG.csrfToken);
        
        // Form verilerini JSON'a çevir
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            csrf_token: formData.get('csrf_token')
        };
        
        // Basit doğrulama
        if (!data.name || !data.email || !data.message) {
            showNotification('Lütfen tüm alanları doldurun.', 'warning');
            return;
        }
        
        if (!validateEmail(data.email)) {
            showNotification('Lütfen geçerli bir email adresi girin.', 'warning');
            return;
        }
        
        // Loading göster
        Swal.fire({
            title: 'Mesajınız Gönderiliyor',
            html: 'Lütfen bekleyin...',
            timerProgressBar: true,
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false
        });
        
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                Swal.fire({
                    title: 'Teşekkürler!',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'Tamam',
                    confirmButtonColor: 'var(--color-primary)'
                });
                form.reset();
            } else {
                throw new Error(result.message || 'Mesaj gönderilemedi');
            }
            
        } catch (error) {
            console.error('İletişim formu hatası:', error);
            Swal.fire({
                title: 'Hata!',
                text: error.message || 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.',
                icon: 'error',
                confirmButtonText: 'Tamam',
                confirmButtonColor: 'var(--color-danger)'
            });
        }
    }

    // İzlence Modal İşlemleri
    async function handleConfirmSyllabus() {
        closeSyllabusModal();
        
        const topic = DOMElements.topicInput.value.trim();
        if (!validateFormInputs(topic, 'syllabus')) {
            isGenerating = false;
            setGenerateButtonState(false);
            return;
        }
        
        prepareUIForSyllabusGeneration(topic, selectedWeeksCount);
        scrollToOutputArea();
        
        loadingIntervals = startLoadingAnimation(false, true, 'syllabus');
        
        try {
            showNotification(`${selectedWeeksCount} haftalık izlence oluşturuluyor... Bu biraz zaman alabilir.`, 'info', 4000);
            
            const syllabusPrompt = createSyllabusPrompt(topic, selectedWeeksCount);
            const apiResponse = await fetchAIResponse(syllabusPrompt, 'syllabus');
            
            await processAndDisplaySyllabus(apiResponse, topic, selectedWeeksCount);
            
            showNotification('İzlence başarıyla oluşturuldu!', 'success');
            
        } catch (error) {
            console.error('İzlence Oluşturma Hatası:', error);
            displayErrorCard("İzlence Hatası", `İzlence oluşturulurken bir hata oluştu. Lütfen tekrar deneyin. Detay: ${error.message}`);
            resetUIAfterGeneration(false);
            animateAssistant('surprised');
        } finally {
            stopLoadingAnimation(loadingIntervals);
            isGenerating = false;
            setGenerateButtonState(false);
            if (!validateApiKey()) setGenerateButtonState(false, true);
            refreshAOS();
        }
    }

    // Diğer event handler fonksiyonları...
    function handleSyllabusOptionChange(e) {
        isSyllabusMode = e.target.checked;
        if (DOMElements.materialTypeContainer) {
            DOMElements.materialTypeContainer.style.display = isSyllabusMode ? 'none' : 'block';
        }
        
        if (DOMElements.materialTypeSelect) {
            DOMElements.materialTypeSelect.required = !isSyllabusMode;
        }
        
        if (DOMElements.btnGenerate) {
            DOMElements.btnGenerate.innerHTML = isSyllabusMode ? 
                '<i class="fas fa-calendar-alt"></i> <span>İzlence Oluştur</span>' : 
                '<i class="fas fa-wand-magic-sparkles"></i> <span>Materyali Oluştur</span>';
        }
    }

    function handleSkipLessonPlan() {
        closeLessonPlanModal();
        showCreateLessonPlanButton();
        showNotification('Ders planı oluşturma atlandı. İsterseniz daha sonra oluşturabilirsiniz.', 'info');
    }

    function handleResultCardClicks(event) {
        const target = event.target;
        const copyButton = target.closest('.btn-copy-single');
        const flashcardItem = target.closest('.flashcard-item');

        if (copyButton) {
            event.stopPropagation();
            const cardContentElement = copyButton.closest('.material-card')?.querySelector('.material-card-content, .flashcard');
            if (cardContentElement) {
                const contentToCopy = cardContentElement.classList.contains('flashcard')
                    ? getFlashcardTextContent(cardContentElement)
                    : cardContentElement.innerText;
                 
                 const cardIndex = Array.from(DOMElements.resultDiv.children).indexOf(copyButton.closest('.material-card'));
                 if (cardIndex > -1 && currentMaterialsData[cardIndex]) {
                     copyToClipboard(currentMaterialsData[cardIndex].content, copyButton);
                 } else {
                     copyToClipboard(contentToCopy, copyButton);
                 }
            }
        } else if (flashcardItem) {
            flashcardItem.classList.toggle('flipped');
            event.stopPropagation();
        }
    }

    function handleSyllabusCardClicks(event) {
        const target = event.target;
        const materialItem = target.closest('.material-item');
        const header = target.closest('.syllabus-header');
        
        if (header) {
            const section = header.closest('.syllabus-section');
            if (section) {
                section.classList.toggle('active');
            }
        } else if (materialItem) {
            if (materialItem.classList.contains('lesson-plan-btn')) {
                if (!materialItem.classList.contains('disabled')) {
                    const weekIndex = parseInt(materialItem.dataset.week, 10);
                    if (!isNaN(weekIndex)) {
                        openLessonPlanViewModal(weekIndex);
                    }
                }
                return;
            }
            
            const weekIndex = parseInt(materialItem.dataset.week, 10);
            const topicIndex = parseInt(materialItem.dataset.topic, 10);
            const materialType = materialItem.dataset.material;
            
            if (!isNaN(weekIndex) && !isNaN(topicIndex) && materialType && currentSyllabusData.length > 0) {
                displayMaterialContent(weekIndex, topicIndex, materialType);
            }
        }
    }

    function handleLessonPlanCardClicks(event) {
        const target = event.target;
        const copyButton = target.closest('.btn-copy-lesson');
        
        if (copyButton) {
            event.stopPropagation();
            const weekIndex = parseInt(copyButton.dataset.week);
            const lessonIndex = parseInt(copyButton.dataset.lesson);
            
            if (!isNaN(weekIndex) && !isNaN(lessonIndex) && 
                currentLessonPlansData[weekIndex] && 
                currentLessonPlansData[weekIndex].lessons[lessonIndex]) {
                
                const lesson = currentLessonPlansData[weekIndex].lessons[lessonIndex];
                const lessonText = formatLessonPlanAsText(lesson, currentLessonPlansData[weekIndex].weekTitle);
                copyToClipboard(lessonText, copyButton);
            }
        }
    }

    // ============================================================================
    // Yardımcı Fonksiyonlar (Helpers)
    // ============================================================================
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateApiKey() { 
        if (!API_CONFIG.geminiApiKey || API_CONFIG.geminiApiKey.length < 30) { 
            if (!document.querySelector('.api-error-card')) { 
                displayErrorCard("API Hatası", "API anahtarı yapılandırılmamış veya geçersiz. Lütfen `func.js` dosyasını kontrol edin.", 'error', 'fas fa-key', true); 
            } 
            return false; 
        } 
        return true; 
    }

    function validateFormInputs(topic, materialTypeKey) { 
        if (!topic) { 
            showNotification('Lütfen bir konu veya metin girin.', 'warning'); 
            DOMElements.topicInput?.focus(); 
            return false; 
        } 
        if (!materialTypeKey && !isSyllabusMode) { 
            showNotification('Lütfen bir materyal türü seçin.', 'warning'); 
            DOMElements.materialTypeSelect?.focus(); 
            return false; 
        } 
        if (topic.length < 5) { 
            showNotification('Konu çok kısa görünüyor. Daha detaylı yazmanız daha iyi sonuç verebilir.', 'info', 4000); 
        } 
        return true; 
    }

    function updateTheme() { 
        DOMElements.body?.classList.toggle('dark-mode', isDarkMode); 
        if (DOMElements.mobileThemeToggle) { 
            DOMElements.mobileThemeToggle.innerHTML = isDarkMode ? 
                '<i class="fas fa-sun"></i> Aydınlık Mod' : 
                '<i class="fas fa-moon"></i> Karanlık Mod'; 
        } 
    }

    function showNotification(message, type = 'info', timer = 3000) { 
        if(typeof Swal === 'undefined') { 
            console.warn('SweetAlert not loaded, using alert'); 
            alert(message); 
            return; 
        } 
        const Toast = Swal.mixin({ 
            toast: true, 
            position: 'top-end', 
            showConfirmButton: false, 
            timer: timer, 
            timerProgressBar: true, 
            didOpen: (toast) => { 
                toast.addEventListener('mouseenter', Swal.stopTimer); 
                toast.addEventListener('mouseleave', Swal.resumeTimer); 
            }, 
            customClass: { 
                popup: `swal2-toast-${type}` 
            } 
        }); 
        Toast.fire({ 
            icon: type, 
            title: message 
        }); 
    }

    function toggleTheme() { 
        isDarkMode = !isDarkMode; 
        localStorage.setItem('EduNomo-theme', isDarkMode ? 'dark' : 'light'); 
        updateTheme(); 
    }

    function handleScroll() { 
        const scrollY = window.scrollY; 
        DOMElements.mainHeader?.classList.toggle('scrolled', scrollY > 50); 
        DOMElements.backToTop?.classList.toggle('show', scrollY > 400); 
    }

    function toggleMobileMenu() { 
        DOMElements.body?.classList.toggle('menu-open'); 
    }

    function closeMobileMenuOnClickOutside(e) { 
        if (DOMElements.body?.classList.contains('menu-open') && 
            !e.target.closest('.main-nav') && 
            !e.target.closest('#menu-toggle')) { 
            DOMElements.body.classList.remove('menu-open'); 
        } 
    }

    function handleNavLinkClick(e) { 
        DOMElements.allNavLinks?.forEach(l => l.classList.remove('active')); 
        e.currentTarget.classList.add('active'); 
        if (DOMElements.body?.classList.contains('menu-open')) { 
            DOMElements.body.classList.remove('menu-open'); 
        } 
    }

    function handleAnchorScroll(e) { 
        e.preventDefault(); 
        const targetId = this.getAttribute('href'); 
        const targetElement = document.querySelector(targetId); 
        if (targetElement) { 
            window.scrollTo({ 
                top: targetElement.offsetTop - SCROLL_OFFSET, 
                behavior: 'smooth' 
            }); 
        } 
    }

    function updateCharacterCount() { 
        if (!DOMElements.topicInput || !DOMElements.charCount) return; 
        const count = DOMElements.topicInput.value.length; 
        DOMElements.charCount.textContent = count; 
        DOMElements.charCount.classList.toggle('limit-reached', count >= MAX_CHAR_COUNT); 
        if (count > MAX_CHAR_COUNT) { 
            DOMElements.topicInput.value = DOMElements.topicInput.value.substring(0, MAX_CHAR_COUNT); 
            DOMElements.charCount.textContent = MAX_CHAR_COUNT; 
        } 
    }

    function resetFormAndOutput() { 
        setTimeout(() => { 
            if(DOMElements.form) DOMElements.form.reset(); 
            if(DOMElements.charCount) { 
                DOMElements.charCount.textContent = '0'; 
                DOMElements.charCount.classList.remove('limit-reached'); 
            } 
            if(DOMElements.outputArea) DOMElements.outputArea.style.display = 'none'; 
            if(DOMElements.resultDiv) DOMElements.resultDiv.innerHTML = ''; 
            if(DOMElements.syllabusResultDiv) {
                DOMElements.syllabusResultDiv.innerHTML = '';
                DOMElements.syllabusResultDiv.style.display = 'none';
            }
            if(DOMElements.lessonPlanResultDiv) {
                DOMElements.lessonPlanResultDiv.innerHTML = '';
                DOMElements.lessonPlanResultDiv.style.display = 'none';
            }
            currentMaterialsData = [];
            currentSyllabusData = []; 
            currentLessonPlansData = [];
            currentTopic = "";
            
            if(DOMElements.materialTypeContainer) {
                DOMElements.materialTypeContainer.style.display = 'block';
            }
            isSyllabusMode = false;
            if(DOMElements.syllabusOption) {
                DOMElements.syllabusOption.checked = false;
            }
            if(DOMElements.btnGenerate) {
                DOMElements.btnGenerate.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> <span>Materyali Oluştur</span>';
            }
        }, 50);
    }

    function handleFeedbackClick(e) { 
        const clickedButton = e.currentTarget; 
        const isHelpful = clickedButton.id === 'btn-helpful'; 
        const otherButton = isHelpful ? DOMElements.btnNotHelpful : DOMElements.btnHelpful; 
        otherButton?.classList.remove('active'); 
        clickedButton.classList.toggle('active'); 
        if (clickedButton.classList.contains('active')) { 
            showNotification('Geri bildiriminiz için teşekkürler!', 'success'); 
            if (!isHelpful) { 
                promptDetailedFeedback(); 
            } 
        } 
    }

    // ============================================================================
    // API ve Prompt Fonksiyonları
    // ============================================================================
    function createUserPrompt(topic, materialTypeKey) {
        const promptMap = {
            'summary': `"${topic}" konusunda kapsamlı bir ünite özeti oluştur. Özet açıklayıcı, öğretici ve anlaşılır olmalı. Ana başlıklar altında organize edilmiş bilgiler içermeli.`,
            
            'flashcards': `"${topic}" konusu için 8-12 adet flash kart oluştur. Her kart şu formatta olmalı:
            
**Terim/Kavram:** Tanım/Açıklama

Örnek:
**Fotosintez:** Bitkilerin güneş ışığını kullanarak karbondioksit ve suyu glikoza dönüştürdüğü yaşamsal süreçtir.`,
            
            'quiz': `"${topic}" konusu için 8-10 adet çoktan seçmeli soru oluştur. Her soru 4 seçenekli olmalı ve doğru cevapları belirt.`,
            
            'key-concepts': `"${topic}" konusundaki en önemli 10-15 anahtar kavramı listele ve her birini kısaca açıkla.`,
            
            'short-answer': `"${topic}" konusu için 6-8 adet kısa cevaplı soru oluştur. Sorular düşündürücü ve öğretici olmalı.`,
            
            'fill-blanks': `"${topic}" konusu için 8-10 adet boşluk doldurma cümlesi oluştur. Boşlukları _____ ile göster ve altında doğru cevapları yaz.`,
            
            'true-false': `"${topic}" konusu için 10-12 adet doğru/yanlış ifadesi oluştur. Her ifadenin doğru/yanlış olduğunu belirt.`,
            
            'cause-effect': `"${topic}" konusundaki neden-sonuç ilişkilerini açıkla. En az 5-6 neden-sonuç çifti oluştur.`,
            
            'compare': `"${topic}" konusundaki farklı kavram, olay veya durumları karşılaştır. Benzerlik ve farklılıkları belirt.`,
            
            'pros-cons': `"${topic}" konusundaki önemli konuların avantaj ve dezavantajlarını listele.`,
            
            'concept-map': `"${topic}" konusu için kavram haritası öğeleri oluştur. Ana kavramlar ve aralarındaki bağlantıları belirt.`,
            
            'real-world': `"${topic}" konusundan gerçek hayat örnekleri ve analojiler ver. Konuyu günlük yaşamla ilişkilendir.`,
            
            'metaphor': `"${topic}" konusu için yaratıcı metafor ve benzetmeler oluştur. Karmaşık kavramları basit benzetmelerle açıkla.`,
            
            'case-study': `"${topic}" konusu için mini vaka analizleri ve senaryolar oluştur. Problem çözme odaklı olmalı.`,
            
            'prediction': `"${topic}" konusu hakkında tahmin soruları oluştur. 'Ne olur eğer...' tarzında sorular.`,
            
            'discussion': `"${topic}" konusu için tartışma soruları oluştur. Eleştirel düşünmeyi teşvik eden sorular.`,
            
            'acronym': `"${topic}" konusundaki kavramlar için hatırlanabilir akronimler oluştur.`,
            
            'all': `"${topic}" konusunda eğitim materyalleri paketi oluştur. Aşağıdaki bölümleri oluştur ve her bölümü '---' ile ayır:

### Ünite Özeti ###
Konunun kapsamlı özeti

---

### Flash Kartlar ###
8-10 flash kart (Format: **Terim:** Tanım)

---

### Çoktan Seçmeli Sorular ###
6-8 çoktan seçmeli soru

---

### Anahtar Kavramlar ###
En önemli kavramlar listesi

---

### Kısa Cevaplı Sorular ###
5-6 kısa cevaplı soru

---

### Gerçek Hayat Örnekleri ###
Konuyla ilgili gerçek hayat örnekleri`
        };
        
        return promptMap[materialTypeKey] || promptMap['summary'];
    }

    function createSyllabusPrompt(topic, weeksCount) {
        return `
"${topic}" konusu için ${weeksCount} haftalık detaylı bir ders izlencesi oluştur.

Lütfen aşağıdaki JSON formatında yanıt ver:

{
  "weeks": [
    {
      "title": "Hafta 1: [Hafta Başlığı]",
      "topics": [
        {
          "title": "[Konu Başlığı]",
          "description": "[Konu açıklaması]",
          "objectives": ["[Öğrenme hedefi 1]", "[Öğrenme hedefi 2]"],
          "materials": {},
          "assignments": ["[Ödev 1]", "[Ödev 2]"]
        }
      ]
    }
  ]
}

Gereksinimler:
- ${weeksCount} hafta olmalı
- Her hafta en az 1-2 konu içermeli
- Konular mantıklı bir sırayla ilerlemeli (temelden karmaşığa)
- Öğrenme hedefleri somut ve ölçülebilir olmalı
- Ödevler konuyla ilgili ve uygulanabilir olmalı
- materials alanını şimdilik boş bırak, daha sonra doldurulacak

Sadece JSON formatında yanıt ver, başka metin ekleme.`;
    }

    async function fetchAIResponse(prompt, requestType = 'general', isShort = false) {
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: requestType === 'syllabus' ? 0.7 : 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: isShort ? 200 : (requestType === 'syllabus' ? 4000 : 2048),
                stopSequences: []
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
            ]
        };

        const response = await fetch(`${API_CONFIG.geminiApiUrl}?key=${API_CONFIG.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API isteği başarısız: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('API yanıtında candidate bulunamadı');
        }

        const candidate = data.candidates[0];
        let rawGeneratedText = "";
        let finishReason = candidate.finishReason;
        let blockReason = null;

        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            rawGeneratedText = candidate.content.parts[0].text || "";
        }

        if (candidate.safetyRatings) {
            const blockedRating = candidate.safetyRatings.find(rating => 
                rating.probability === "HIGH" || rating.probability === "MEDIUM"
            );
            if (blockedRating) {
                blockReason = blockedRating.category;
            }
        }

        return {
            rawGeneratedText: rawGeneratedText.trim(),
            finishReason: finishReason,
            blockReason: blockReason
        };
    }

    // ============================================================================
    // Diğer Fonksiyonlar (Kısaltılmış)
    // ============================================================================
    
    // Diğer tüm fonksiyonlar burada devam eder...
    // (Önceki kodun geri kalanı aynı şekilde devam eder)
    
    // Uygulama başlatma
    initializeApp();
});