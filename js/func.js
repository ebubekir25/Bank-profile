/**
 * EduNomo - AI Eğitim Materyali Oluşturucu
 * Geliştirilmiş UX/UI, PDF Dışa Aktarma ve Hata Giderme ile JavaScript Fonksiyonları
 * Profesyonel Sürüm v2.3 (Ders Planı Oluşturma Desteği Eklendi)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================================================
    // DOM Elementleri ve Seçiciler
    // ============================================================================
    const SELECTORS = {
        form: '#material-form',
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
        contactForm: '#feedback-form',
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
    // ---!!! GÜVENLİK UYARISI !!!---
    // API Anahtarını doğrudan istemci tarafı koduna gömmek GÜVENLİ DEĞİLDİR.
    // İdeal olarak, bu anahtar sunucu tarafında tutulmalı ve istekler
    // bir backend proxy üzerinden yapılmalıdır. Bu kod sadece demo amaçlıdır.
    const API_KEY = 'AIzaSyDjJyH2Qdj17htK11Yaf49GC0Jvauc8A20'; // <- BURAYA KENDİ API ANAHTARINIZI YAPIŞTIRIN
    const API_MODEL = 'gemini-1.5-flash-latest'; // Daha hızlı model deneyebilirsiniz
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${API_KEY}`;

    // Sabitler ve Ayarlar
    const MIN_CONTENT_LENGTH_FOR_ALL = 15; // Filtreleme eşiği biraz daha düşürüldü
    const MAX_CHAR_COUNT = 500;
    const PRELOADER_DELAY = 500;
    const SCROLL_OFFSET = 80;
    const PDF_RENDER_DELAY = 1800; // PDF render için bekleme süresi (ms) - Biraz daha artırıldı
    const PDF_DEBUG_LOGGING = false;
    const DEFAULT_WEEKS_COUNT = 14; // Varsayılan izlence hafta sayısı
    const MIN_WEEKS_COUNT = 1;
    const MAX_WEEKS_COUNT = 24;
    const DEFAULT_LESSONS_PER_WEEK = 2; // Varsayılan haftalık ders sayısı
    const DEFAULT_MINUTES_PER_LESSON = 40; // Varsayılan ders süresi

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
     
    const loadingMessagesForAll = [ 
        "Vay! Tam set istedin! Kapsamlı bir paket hazırlıyorum... ☕", 
        "Harika seçim! Tüm eğitim araçlarını getiriyorum. Biraz sabır... 💪", 
        "Tüm materyaller için kollarımı sıvadım! Çok yakında hazır olacak... 🔥", 
        "Büyük bir istek! En iyi içeriği derliyorum... ⏳" 
    ];
     
    const loadingMessagesForSyllabus = [
        "İzlencenizi oluşturuyorum, sıkı tutunun çünkü haftalara bölmek beyin jimnastiği gibi! 🧠",
        "Bu konunun öğrenme hedeflerini belirlerken kendimi Einstein gibi hissettim... 🧪",
        "Ders planını haftalara yaymak çok zormuş, ama sizin için hallediyorum, merak etmeyin... 📚",
        "İzlence işine biraz da yaratıcılık katıyorum, biraz bekleyin lütfen! ✨",
        "Yükleniyor... Sizin için mükemmel bir müfredat tasarlıyorum. Sabırlı olun, 'müfredat' kelimesini doğru yazmak bile 5 saniyemi aldı! 😅",
        "Sizin için öğrencilerin çok sevebileceği (çok sıkıcı değil, söz!) aktiviteler planlıyorum... 👩‍🏫",
        "Bu harika bir izlence olacak - annem her zaman 'harika bir öğretim asistanı olacaksın' derdi! 🤖",
        "Bu kadar kaliteli bir izlence için biraz beklemeye değer, değil mi? 🕰️",
        "Akademik konularda en iyisini üretiyorum, ama şu ödevler kısmı biraz zor oldu... 📝",
        "Kafamda bir ışık yandı! Harika bir konu planlaması için ilham geldi... 💡"
    ];

    const loadingMessagesForMaterials = [
        "İzlence hazır! Şimdi sıra materyallerde... Sizce flash kartlar bu konuya uygun mu? Ben uygun buldum! 🗂️",
        "Her haftaya uygun materyalleri seçiyorum. Bazı haftalar daha çeşitli içeriklere ihtiyaç duyuyor... 📊",
        "Quiz soruları hazırlanıyor... Yanlış şıkları o kadar inandırıcı yaptım ki ben bile karıştırdım! 😆",
        "Anahtar kavramları belirlerken 'Bu gerçekten anahtar mı?' diye üç kez kontrol ediyorum! 🔑",
        "Bazı haftalar için özel materyaller hazırlıyorum. Her konu aynı şekilde öğretilmez! 👨‍🏫",
        "Flash kartlar, quizler, özetler... Elinizde mükemmel bir öğretim paketi olacak! 📦",
        "Her haftanın konusunu analiz edip en uygun materyal kombinasyonunu buluyorum... 🧩",
        "Hazırlık biraz uzun sürüyor ama sonuca değecek, söz veriyorum! ⏳",
        "Materyalleri üretirken beyin hücrelerim aşırı çalışmaktan ısınmaya başladı... 🔥",
        "Her konunun en iyi nasıl öğretileceğini düşünüyorum. Bazıları görsel materyaller gerektiriyor! 👁️"
    ];

    const loadingMessagesForLessonPlans = [
        "Ders planları oluşturuluyor... Her dersi dakika dakika planlıyorum! ⏱️",
        "Giriş, gelişme, sonuç... Pedagojik yaklaşımları harmanlıyorum! 📚",
        "Öğrenci merkezli aktiviteler tasarlıyorum. Sıkıcı dersler yok, söz! 🎯",
        "Her ders için özel öğretim yöntemleri belirliyorum... 👨‍🏫",
        "Ders planlarınız neredeyse hazır. Bu kadar detaylı plan görmediniz! 📋",
        "Aktiviteler, değerlendirmeler, ödevler... Her şey düşünülüyor! ✅",
        "Dersleri öğrenci seviyesine göre optimize ediyorum... 🔧",
        "Yaratıcı öğretim teknikleri ekliyorum. Öğrenciler bayılacak! 🎨",
        "Son rötuşlar... Ders planlarınız mükemmel olacak! ✨",
        "Birazdan elinizde profesyonel ders planları olacak! 🎓"
    ];

    const loadingMessagesForCompletion = [
        "Son rötuşları yapıyorum... Bu size bir şef d'oeuvre sunmak gibi! 👨‍🍳",
        "Neredeyse bitti! Materyalleri son kez gözden geçiriyorum... 🧐",
        "Tüm içeriği paketliyorum, birazdan muhteşem izlenceniz hazır olacak! 🎁",
        "Böyle bir öğretim planını öğrenciler çok sevecek, eminim! 🎓",
        "Sabırla bekleyin... Mükemmellik zaman alır! ⌛",
        "Son saniyeler... Bu izlence eğitim dünyasını sarsacak! 🌍",
        "Hazırlanıyor... Einstein bile bu izlenceyi kıskanırdı! 🧠",
        "İzlence neredeyse hazır ve gerçekten harika görünüyor! Birazdan göreceksiniz... ✨",
        "Eğitimciler dikkat! Yepyeni bir izlence geliyor... 🔔",
        "Bu kadar kapsamlı bir izlenceyi bu kadar hızlı hazırlayabildiğime ben bile şaşırdım! 🚀"
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
        console.log("EduNomo v2.3 Başlatıldı!");
    }

    function hidePreloader() { setTimeout(() => { DOMElements.preloader?.classList.add('hidden'); setTimeout(() => { if (DOMElements.preloader) DOMElements.preloader.style.display = 'none'; }, 500); }, PRELOADER_DELAY); }
    function initAOS() { if (typeof AOS !== 'undefined') AOS.init({ duration: 800, offset: 120, once: true, easing: 'ease-out-cubic' }); }
    function initThemeMode() { isDarkMode = localStorage.getItem('EduNomo-theme') === 'dark'; updateTheme(); }
    function checkApiKey() { if (API_KEY === 'BURAYA_KENDI_GOOGLE_GEMINI_API_ANAHTARINIZI_YAPISTIRIN' || !API_KEY || API_KEY.length < 30) { showNotification('API Anahtarı Eksik veya Geçersiz! Lütfen func.js dosyasını kontrol edin.', 'error', 6000); console.error("API Anahtarı func.js içinde ayarlanmamış veya geçersiz!"); setGenerateButtonState(false, true); } }

    function initEventListeners() {
        DOMElements.form?.addEventListener('submit', handleFormSubmit);
        DOMElements.themeToggle?.addEventListener('click', toggleTheme);
        DOMElements.mobileThemeToggle?.addEventListener('click', (e) => { e.preventDefault(); toggleTheme(); });
        DOMElements.backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', handleScroll);
        DOMElements.menuToggle?.addEventListener('click', toggleMobileMenu);
        document.addEventListener('click', closeMobileMenuOnClickOutside);
        DOMElements.allNavLinks?.forEach(link => link.addEventListener('click', handleNavLinkClick));
        DOMElements.allScrollAnchors?.forEach(anchor => anchor.addEventListener('click', handleAnchorScroll));
        DOMElements.topicInput?.addEventListener('input', updateCharacterCount);
        DOMElements.btnReset?.addEventListener('click', resetFormAndOutput);
        DOMElements.pdfDownloadButton?.addEventListener('click', showProVersionModal);
        DOMElements.btnCopyAll?.addEventListener('click', copyAllContent);
        DOMElements.btnHelpful?.addEventListener('click', handleFeedbackClick);
        DOMElements.btnNotHelpful?.addEventListener('click', handleFeedbackClick);
        DOMElements.contactForm?.addEventListener('submit', handleContactFormSubmit);
        document.querySelectorAll('.btn-share').forEach(btn => { btn.addEventListener('click', (e) => { const platform = e.currentTarget.getAttribute('aria-label'); showNotification(`${platform} için paylaşım özelliği Basic Plan için geçerlidir.`, 'info'); }); });
        DOMElements.resultDiv?.addEventListener('click', handleResultCardClicks); // Event Delegation
        DOMElements.syllabusResultDiv?.addEventListener('click', handleSyllabusCardClicks); // İzlence kartları için event delegation
        DOMElements.lessonPlanResultDiv?.addEventListener('click', handleLessonPlanCardClicks); // Ders planı kartları için event delegation
        
        // İzlence Checkbox Olayı
        DOMElements.syllabusOption?.addEventListener('change', handleSyllabusOptionChange);
        
        // İzlence Modal Olayları
        DOMElements.modalClose?.addEventListener('click', closeSyllabusModal);
        DOMElements.cancelSyllabus?.addEventListener('click', closeSyllabusModal);
        DOMElements.confirmSyllabus?.addEventListener('click', handleConfirmSyllabus);
        window.addEventListener('click', (e) => {
            if (e.target === DOMElements.syllabusModal) {
                closeSyllabusModal();
            }
            if (e.target === DOMElements.lessonPlanModal) {
                closeLessonPlanModal();
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
        DOMElements.lessonsIncrease?.addEventListener('click', () => updateLessonsCount(1));
        DOMElements.lessonsDecrease?.addEventListener('click', () => updateLessonsCount(-1));
        DOMElements.lessonsPerWeek?.addEventListener('input', handleLessonsCountInput);
        
        // Ders Süresi Kontrolleri
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

        if (!validateApiKey()) { isGenerating = false; setGenerateButtonState(false, true); return; }

        const topic = DOMElements.topicInput.value.trim();
        
        // İzlence modu kontrolü
        if (isSyllabusMode) {
            openSyllabusModal();
            return; // Modal onayı bekleyeceğiz, burada durdur
        }
        
        const selectedMaterialTypeKey = DOMElements.materialTypeSelect.value;
        const selectedMaterialOption = DOMElements.materialTypeSelect.options[DOMElements.materialTypeSelect.selectedIndex];
        const selectedMaterialTypeText = selectedMaterialOption.text.replace(/^[✨📄🗂️📊❓✍️✏️✅🔑🔗🔄👍👎🗺️🌍💡💼🔮🗣️🅰️]\s*/, '').trim();

        if (!validateFormInputs(topic, selectedMaterialTypeKey)) { isGenerating = false; setGenerateButtonState(false); return; }

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
    
    // İzlence Modal İşlemleri
    /**
     * İzlence modal onayını işler ve izlence oluşturma sürecini başlatır
     * 
     * @returns {Promise<void>}
     */
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
        
        // Süreç takibi için ilk animasyonu başlat
        loadingIntervals = startLoadingAnimation(false, true, 'syllabus');
        
        try {
            // İzlence oluşturma bilgilendirme mesajı
            showNotification(`${selectedWeeksCount} haftalık izlence oluşturuluyor... Bu biraz zaman alabilir.`, 'info', 4000);
            
            const syllabusPrompt = createSyllabusPrompt(topic, selectedWeeksCount);
            const apiResponse = await fetchAIResponse(syllabusPrompt, 'syllabus');
            
            // İzlenceyi işle ve materyalleri oluştur
            await processAndDisplaySyllabus(apiResponse, topic, selectedWeeksCount);
            
            // İşlem başarıyla tamamlandı
            showNotification('İzlence başarıyla oluşturuldu!', 'success');
            
            // Automatically open lesson plan modal after syllabus is created
            // Remove this line from here since it's now called from processAndDisplaySyllabus
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
    
    // "Atla" butonuna tıklandığında
    function handleSkipLessonPlan() {
        closeLessonPlanModal();
        
        // İzlencenin üstünde "Ders Planı Oluştur" butonu göster
        showCreateLessonPlanButton();
        
        showNotification('Ders planı oluşturma atlandı. İsterseniz daha sonra oluşturabilirsiniz.', 'info');
    }
    
    // İzlencenin üstünde ders planı oluştur butonu göster
    function showCreateLessonPlanButton() {
        if (!DOMElements.syllabusResultDiv) return;
        
        // Zaten varsa ekleme
        if (document.getElementById('create-lesson-plan-header')) return;
        
        const headerButton = document.createElement('div');
        headerButton.id = 'create-lesson-plan-header';
        headerButton.className = 'lesson-plan-header-button';
        headerButton.innerHTML = `
            <div class="lesson-plan-action-card">
                <div class="lesson-plan-action-content">
                    <h4><i class="fas fa-chalkboard-teacher"></i> Ders Planları</h4>
                    <p>İzlenceniz hazır! Şimdi her hafta için detaylı ders planları oluşturabilirsiniz.</p>
                </div>
                <button id="create-lesson-plans-btn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Ders Planlarını Oluştur
                </button>
            </div>
        `;
        
        // İzlencenin başına ekle
        DOMElements.syllabusResultDiv.insertBefore(headerButton, DOMElements.syllabusResultDiv.firstChild);
        
        // Event listener ekle
        const createBtn = document.getElementById('create-lesson-plans-btn');
        createBtn?.addEventListener('click', () => {
            openLessonPlanModal();
        });
    }
    
    // Ders planı görüntüleme modalını aç
    function openLessonPlanViewModal(weekIndex) {
        if (!DOMElements.lessonPlanViewModal || !currentLessonPlansData[weekIndex]) return;
        
        const weekData = currentLessonPlansData[weekIndex];
        
        // Modal başlığını güncelle
        if (DOMElements.lessonPlanViewTitle) {
            DOMElements.lessonPlanViewTitle.innerHTML = `<i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(weekData.weekTitle)} - Ders Planları`;
        }
        
        // Modal içeriğini oluştur
        let content = '';
        weekData.lessons.forEach((lesson, lessonIndex) => {
            content += createLessonPlanModalContent(lesson, lessonIndex);
        });
        
        if (DOMElements.lessonPlanViewContent) {
            DOMElements.lessonPlanViewContent.innerHTML = content;
        }
        
        // Modalı göster
        DOMElements.lessonPlanViewModal.classList.add('show');
    }
    
    // Ders planı modal içeriği oluştur
    function createLessonPlanModalContent(lesson, lessonIndex) {
        return `
            <div class="lesson-plan-modal-item">
                <div class="lesson-plan-modal-header">
                    <h4><i class="fas fa-chalkboard-teacher"></i> Ders ${lesson.lessonNumber}: ${escapeHtml(lesson.title || 'Ders Planı')}</h4>
                    <span class="lesson-plan-duration"><i class="fas fa-clock"></i> ${lesson.duration} dakika</span>
                </div>
                
                ${lesson.objectives && lesson.objectives.length > 0 ? `
                <div class="lesson-plan-modal-section">
                    <h5><i class="fas fa-bullseye"></i> Öğrenme Hedefleri</h5>
                    <ul>
                        ${lesson.objectives.map(obj => `<li>${escapeHtml(obj)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${lesson.introduction && lesson.introduction.activities.length > 0 ? `
                <div class="lesson-plan-modal-section">
                    <h5><i class="fas fa-door-open"></i> Giriş (${lesson.introduction.duration} dk)</h5>
                    <ul>
                        ${lesson.introduction.activities.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${lesson.development && lesson.development.activities.length > 0 ? `
                <div class="lesson-plan-modal-section">
                    <h5><i class="fas fa-chart-line"></i> Gelişme (${lesson.development.duration} dk)</h5>
                    <ul>
                        ${lesson.development.activities.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${lesson.conclusion && lesson.conclusion.activities.length > 0 ? `
                <div class="lesson-plan-modal-section">
                    <h5><i class="fas fa-flag-checkered"></i> Sonuç (${lesson.conclusion.duration} dk)</h5>
                    <ul>
                        ${lesson.conclusion.activities.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${lesson.homework && lesson.homework.length > 0 ? `
                <div class="lesson-plan-modal-section homework">
                    <h5><i class="fas fa-tasks"></i> Ödevler</h5>
                    <ul>
                        ${lesson.homework.map(hw => `<li>${escapeHtml(hw)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    // Ders planı görüntüleme modalını kapat
    function closeLessonPlanViewModal() {
        if (DOMElements.lessonPlanViewModal) {
            DOMElements.lessonPlanViewModal.classList.remove('show');
        }
    }
    
    // Ders planı içeriğini kopyala
    function copyLessonPlanContent() {
        if (!DOMElements.lessonPlanViewContent) return;
        
        // Modal içindeki metni düz metin olarak al
        const content = DOMElements.lessonPlanViewContent.innerText;
        copyToClipboard(content, DOMElements.lessonPlanCopyAll);
    }
    
    // Ders Planı Oluşturma İşlemi
    async function handleCreateLessonPlan() {
        console.log('Ders planı oluşturma işlemi başladı');
        
        // Modal'dan güncel değerleri al
        if (DOMElements.lessonsPerWeek) {
            selectedLessonsPerWeek = parseInt(DOMElements.lessonsPerWeek.value) || DEFAULT_LESSONS_PER_WEEK;
        }
        if (DOMElements.minutesPerLesson) {
            selectedMinutesPerLesson = parseInt(DOMElements.minutesPerLesson.value) || DEFAULT_MINUTES_PER_LESSON;
        }
        
        closeLessonPlanModal();
        
        if (!currentSyllabusData || currentSyllabusData.length === 0) {
            console.error('İzlence verisi bulunamadı!');
            showNotification('İzlence verisi bulunamadı!', 'error');
            return;
        }
        
        console.log('Seçilen ders sayısı:', selectedLessonsPerWeek);
        console.log('Seçilen ders süresi:', selectedMinutesPerLesson);
        
        // UI'ı ders planı oluşturma için hazırla
        prepareUIForLessonPlanGeneration();
        scrollToOutputArea();
        
        // Yükleme animasyonunu başlat
        loadingIntervals = startLoadingAnimation(false, true, 'lesson-plans');
        
        try {
            showNotification(`${selectedLessonsPerWeek} ders/hafta ve ${selectedMinutesPerLesson} dakika/ders olarak ders planları oluşturuluyor...`, 'info', 4000);
            
            // Her hafta için ders planları oluştur
            await generateLessonPlansForAllWeeks();
            
            showNotification('Ders planları başarıyla oluşturuldu!', 'success');
            
            // Ders planı oluştur butonunu gizle (varsa)
            const headerButton = document.getElementById('create-lesson-plan-header');
            if (headerButton) {
                headerButton.remove();
            }
            
            // İzlenceyi yeniden render et (ders planı butonları güncellensin)
            if (currentSyllabusData.length > 0) {
                renderSyllabusWeeks(currentSyllabusData);
            }
        } catch (error) {
            console.error('Ders Planı Oluşturma Hatası:', error);
            displayErrorCard("Ders Planı Hatası", `Ders planları oluşturulurken bir hata oluştu. Detay: ${error.message}`);
        } finally {
            stopLoadingAnimation(loadingIntervals);
            refreshAOS();
            resetUIAfterGeneration(true);
        }
    }
    
    // Ders Planı UI Hazırlığı
    function prepareUIForLessonPlanGeneration() {
        if (DOMElements.lessonPlanResultDiv) {
            DOMElements.lessonPlanResultDiv.innerHTML = '';
            DOMElements.lessonPlanResultDiv.style.display = 'block'; // 'flex' yerine 'block'
        }
        if (DOMElements.loadingDiv) DOMElements.loadingDiv.style.display = 'flex';
        if (DOMElements.outputTitleText) {
            DOMElements.outputTitleText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ders Planları Oluşturuluyor';
        }
        
        console.log('Ders planı UI hazırlandı');
    }
    
    // Tüm haftalar için ders planları oluştur
    async function generateLessonPlansForAllWeeks() {
        console.log('Ders planları oluşturma başladı...');
        console.log('İzlence verileri:', currentSyllabusData);
        
        currentLessonPlansData = [];
        const totalWeeks = currentSyllabusData.length;
        let processedWeeks = 0;
        
        for (let weekIndex = 0; weekIndex < currentSyllabusData.length; weekIndex++) {
            const week = currentSyllabusData[weekIndex];
            
            if (DOMElements.loadingMessage) {
                DOMElements.loadingMessage.textContent = `${week.title} için ders planları hazırlanıyor...`;
            }
            
            try {
                // Bu hafta için ders planı oluştur
                const lessonPlans = await generateLessonPlansForWeek(week, weekIndex);
                currentLessonPlansData.push({
                    weekTitle: week.title,
                    lessons: lessonPlans
                });
                
                // İstek sınırlaması için bekleme
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Hafta ${weekIndex + 1} için ders planı oluşturma hatası:`, error);
                currentLessonPlansData.push({
                    weekTitle: week.title,
                    lessons: []
                });
            }
            
            processedWeeks++;
            const progressPercentage = (processedWeeks / totalWeeks) * 100;
            if (DOMElements.progressBar) {
                DOMElements.progressBar.style.width = `${progressPercentage}%`;
            }
        }
        
        // Ders planlarını sadece veri olarak sakla, render etme
        console.log(`${currentLessonPlansData.length} hafta için ders planları oluşturuldu`);
        
        // Başlığı güncelle
        if (DOMElements.outputTitleText) {
            DOMElements.outputTitleText.innerHTML = '<i class="fas fa-check-circle"></i> Ders Planları Oluşturuldu';
        }
    }
    
    // Bir hafta için ders planları oluştur
    async function generateLessonPlansForWeek(week, weekIndex) {
        const lessonPlans = [];
        
        // Haftalık konuları ders sayısına böl
        const topicsPerLesson = Math.ceil(week.topics.length / selectedLessonsPerWeek);
        
        for (let lessonNum = 1; lessonNum <= selectedLessonsPerWeek; lessonNum++) {
            const startTopicIndex = (lessonNum - 1) * topicsPerLesson;
            const endTopicIndex = Math.min(lessonNum * topicsPerLesson, week.topics.length);
            const lessonTopics = week.topics.slice(startTopicIndex, endTopicIndex);
            
            if (lessonTopics.length === 0) continue;
            
            try {
                const lessonPlanPrompt = createLessonPlanPrompt(
                    week.title,
                    lessonNum,
                    lessonTopics,
                    selectedMinutesPerLesson,
                    currentTopic
                );
                
                const apiResponse = await fetchAIResponse(lessonPlanPrompt, 'lesson-plan');
                
                if (apiResponse.rawGeneratedText) {
                    const lessonPlan = parseLessonPlanResponse(apiResponse.rawGeneratedText, lessonNum);
                    lessonPlans.push(lessonPlan);
                }
            } catch (error) {
                console.error(`Ders planı oluşturma hatası:`, error);
                // Varsayılan ders planı ekle
                lessonPlans.push({
                    lessonNumber: lessonNum,
                    title: `${week.title} - Ders ${lessonNum}`,
                    objectives: ["Ders planı oluşturulamadı"],
                    duration: selectedMinutesPerLesson,
                    introduction: { activities: [], duration: 5 },
                    development: { activities: [], duration: 30 },
                    conclusion: { activities: [], duration: 5 },
                    homework: []
                });
            }
        }
        
        return lessonPlans;
    }
    
    // Hafta için ders planı var mı kontrol et
    function createLessonPlanPrompt(weekTitle, lessonNumber, topics, duration, mainTopic) {
        const topicsText = topics.map(t => `- ${t.title}: ${t.description || ''}`).join('\n');
        const objectivesText = topics.flatMap(t => t.objectives || []).join('\n- ');
        
        return `
"${mainTopic}" konusundaki "${weekTitle}" için ${lessonNumber}. ders planını oluştur.

Ders Bilgileri:
- Ders Süresi: ${duration} dakika
- İşlenecek Konular:
${topicsText}

Öğrenme Hedefleri:
- ${objectivesText}

Lütfen aşağıdaki formatta detaylı bir ders planı oluştur:

**DERS PLANI**

**Ders ${lessonNumber} Başlığı:** [Anlamlı bir ders başlığı]

**Süre:** ${duration} dakika

**Öğrenme Hedefleri:**
- [Bu ders sonunda öğrenciler ne öğrenecek? 3-4 hedef]

**GİRİŞ (${Math.round(duration * 0.15)} dakika):**
- [Derse giriş aktiviteleri, ısınma, dikkat çekme]
- [Ön bilgileri hatırlatma]
- [Motivasyon sağlama]

**GELİŞME (${Math.round(duration * 0.7)} dakika):**
- [Ana öğretim aktiviteleri]
- [Öğrenci merkezli etkinlikler]
- [Grup çalışmaları, tartışmalar]
- [Uygulamalı örnekler]
- [Değerlendirme aktiviteleri]

**SONUÇ (${Math.round(duration * 0.15)} dakika):**
- [Dersin özetlenmesi]
- [Öğrenilenlerin pekiştirilmesi]
- [Öğrenci geri bildirimleri]
- [Sonraki derse hazırlık]

**ÖDEVLER:**
- [Bu dersin konularını pekiştirecek ödevler]
- [Araştırma, uygulama veya proje ödevleri]

TALİMATLAR:
- Aktiviteler öğrenci merkezli ve etkileşimli olmalı
- Farklı öğrenme stillerine hitap etmeli
- Somut ve uygulanabilir olmalı
- Yaş grubuna uygun olmalı`;
    }
    
    // Ders planı yanıtını parse et
    function parseLessonPlanResponse(responseText, lessonNumber) {
        const plan = {
            lessonNumber: lessonNumber,
            title: '',
            objectives: [],
            duration: selectedMinutesPerLesson,
            introduction: { activities: [], duration: Math.round(selectedMinutesPerLesson * 0.15) },
            development: { activities: [], duration: Math.round(selectedMinutesPerLesson * 0.7) },
            conclusion: { activities: [], duration: Math.round(selectedMinutesPerLesson * 0.15) },
            homework: []
        };
        
        // Başlık
        const titleMatch = responseText.match(/\*\*Ders \d+ Başlığı:\*\*\s*(.+)/i);
        if (titleMatch) plan.title = titleMatch[1].trim();
        
        // Öğrenme hedefleri
        const objectivesMatch = responseText.match(/\*\*Öğrenme Hedefleri:\*\*\s*([\s\S]+?)(?=\*\*GİRİŞ)/i);
        if (objectivesMatch) {
            plan.objectives = objectivesMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim());
        }
        
        // Giriş aktiviteleri
        const introMatch = responseText.match(/\*\*GİRİŞ[^:]*:\*\*\s*([\s\S]+?)(?=\*\*GELİŞME)/i);
        if (introMatch) {
            plan.introduction.activities = introMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim());
        }
        
        // Gelişme aktiviteleri
        const devMatch = responseText.match(/\*\*GELİŞME[^:]*:\*\*\s*([\s\S]+?)(?=\*\*SONUÇ)/i);
        if (devMatch) {
            plan.development.activities = devMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim());
        }
        
        // Sonuç aktiviteleri
        const concMatch = responseText.match(/\*\*SONUÇ[^:]*:\*\*\s*([\s\S]+?)(?=\*\*ÖDEVLER)/i);
        if (concMatch) {
            plan.conclusion.activities = concMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim());
        }
        
        // Ödevler
        const homeworkMatch = responseText.match(/\*\*ÖDEVLER:\*\*\s*([\s\S]+?)$/i);
        if (homeworkMatch) {
            plan.homework = homeworkMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim());
        }
        
        return plan;
    }
    
    // Ders planlarını render et
    function renderLessonPlans() {
        if (!DOMElements.lessonPlanResultDiv || currentLessonPlansData.length === 0) return;
        
        DOMElements.lessonPlanResultDiv.innerHTML = '';
        
        currentLessonPlansData.forEach((weekData, weekIndex) => {
            const weekSection = document.createElement('div');
            weekSection.className = 'lesson-plan-week-section';
            weekSection.setAttribute('data-aos', 'fade-up');
            weekSection.setAttribute('data-aos-delay', (weekIndex * 50).toString());
            
            // Hafta başlığı
            const weekHeader = document.createElement('div');
            weekHeader.className = 'lesson-plan-week-header';
            weekHeader.innerHTML = `
                <h3><i class="${materialIcons["Hafta"]}"></i> ${escapeHtml(weekData.weekTitle)}</h3>
            `;
            weekSection.appendChild(weekHeader);
            
            // Bu haftanın ders planları
            const lessonsContainer = document.createElement('div');
            lessonsContainer.className = 'lesson-plans-container';
            
            weekData.lessons.forEach((lesson, lessonIndex) => {
                const lessonCard = createLessonPlanCard(lesson, weekIndex, lessonIndex);
                lessonsContainer.appendChild(lessonCard);
            });
            
            weekSection.appendChild(lessonsContainer);
            DOMElements.lessonPlanResultDiv.appendChild(weekSection);
        });
        
        // Ensure the container is visible
        DOMElements.lessonPlanResultDiv.style.display = 'block';
        
        console.log(`${currentLessonPlansData.length} hafta için ders planları render edildi`);
    }
    
    // Ders planı kartı oluştur
    function createLessonPlanCard(lesson, weekIndex, lessonIndex) {
        const card = document.createElement('div');
        card.className = 'lesson-plan-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', ((weekIndex * 100) + (lessonIndex * 50)).toString());
        
        // Kart başlığı
        const header = document.createElement('div');
        header.className = 'lesson-plan-header';
        header.innerHTML = `
            <div class="lesson-plan-title">
                <i class="${materialIcons["Ders Planı"]}"></i>
                <span>Ders ${lesson.lessonNumber}: ${escapeHtml(lesson.title || 'Ders Planı')}</span>
            </div>
            <div class="lesson-duration">
                <i class="fas fa-clock"></i> ${lesson.duration} dakika
            </div>
        `;
        
        // Kart içeriği
        const content = document.createElement('div');
        content.className = 'lesson-plan-content';
        
        // Öğrenme hedefleri
        if (lesson.objectives.length > 0) {
            const objectivesSection = document.createElement('div');
            objectivesSection.className = 'lesson-section';
            objectivesSection.innerHTML = `
                <h4><i class="${materialIcons["Öğrenme Hedefleri"]}"></i> Öğrenme Hedefleri</h4>
                <ul>
                    ${lesson.objectives.map(obj => `<li>${escapeHtml(obj)}</li>`).join('')}
                </ul>
            `;
            content.appendChild(objectivesSection);
        }
        
        // Giriş bölümü
        if (lesson.introduction.activities.length > 0) {
            const introSection = document.createElement('div');
            introSection.className = 'lesson-section';
            introSection.innerHTML = `
                <h4><i class="${materialIcons["Giriş"]}"></i> Giriş (${lesson.introduction.duration} dk)</h4>
                <ul>
                    ${lesson.introduction.activities.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
                </ul>
            `;
            content.appendChild(introSection);
        }
        
        // Gelişme bölümü
        if (lesson.development.activities.length > 0) {
            const devSection = document.createElement('div');
            devSection.className = 'lesson-section';
            devSection.innerHTML = `
                <h4><i class="${materialIcons["Gelişme"]}"></i> Gelişme (${lesson.development.duration} dk)</h4>
                <ul>
                    ${lesson.development.activities.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
                </ul>
            `;
            content.appendChild(devSection);
        }
        
        // Sonuç bölümü
        if (lesson.conclusion.activities.length > 0) {
            const concSection = document.createElement('div');
            concSection.className = 'lesson-section';
            concSection.innerHTML = `
                <h4><i class="${materialIcons["Sonuç"]}"></i> Sonuç (${lesson.conclusion.duration} dk)</h4>
                <ul>
                    ${lesson.conclusion.activities.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
                </ul>
            `;
            content.appendChild(concSection);
        }
        
        // Ödevler
        if (lesson.homework.length > 0) {
            const homeworkSection = document.createElement('div');
            homeworkSection.className = 'lesson-section homework-section';
            homeworkSection.innerHTML = `
                <h4><i class="${materialIcons["Ödev"]}"></i> Ödevler</h4>
                <ul>
                    ${lesson.homework.map(hw => `<li>${escapeHtml(hw)}</li>`).join('')}
                </ul>
            `;
            content.appendChild(homeworkSection);
        }
        
        // Aksiyon butonları
        const actions = document.createElement('div');
        actions.className = 'lesson-plan-actions';
        actions.innerHTML = `
            <button class="btn-card-action btn-copy-lesson" data-week="${weekIndex}" data-lesson="${lessonIndex}">
                <i class="fas fa-copy"></i> <span>Kopyala</span>
            </button>
        `;
        
        card.appendChild(header);
        card.appendChild(content);
        card.appendChild(actions);
        
        return card;
    }
    
    // Ders planı kartlarına tıklama olaylarını işle
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
    
    // Ders planını metin formatına dönüştür
    function formatLessonPlanAsText(lesson, weekTitle) {
        let text = `${weekTitle} - Ders ${lesson.lessonNumber}: ${lesson.title}\n`;
        text += `Süre: ${lesson.duration} dakika\n\n`;
        
        text += `Öğrenme Hedefleri:\n`;
        lesson.objectives.forEach(obj => text += `- ${obj}\n`);
        text += `\n`;
        
        text += `GİRİŞ (${lesson.introduction.duration} dk):\n`;
        lesson.introduction.activities.forEach(act => text += `- ${act}\n`);
        text += `\n`;
        
        text += `GELİŞME (${lesson.development.duration} dk):\n`;
        lesson.development.activities.forEach(act => text += `- ${act}\n`);
        text += `\n`;
        
        text += `SONUÇ (${lesson.conclusion.duration} dk):\n`;
        lesson.conclusion.activities.forEach(act => text += `- ${act}\n`);
        text += `\n`;
        
        text += `ÖDEVLER:\n`;
        lesson.homework.forEach(hw => text += `- ${hw}\n`);
        
        return text;
    }
    
    // Ders sayısı güncelleme
    function updateLessonsCount(change) {
        const input = DOMElements.lessonsPerWeek;
        if (!input) return;
        
        let value = parseInt(input.value, 10) || DEFAULT_LESSONS_PER_WEEK;
        value += change;
        
        // Sınırları kontrol et
        value = Math.max(1, Math.min(10, value));
        
        input.value = value;
        selectedLessonsPerWeek = value;
    }
    
    function handleLessonsCountInput(e) {
        let value = parseInt(e.target.value, 10) || DEFAULT_LESSONS_PER_WEEK;
        value = Math.max(1, Math.min(10, value));
        e.target.value = value;
        selectedLessonsPerWeek = value;
    }
    
    // Ders süresi güncelleme
    function updateMinutesCount(change) {
        const input = DOMElements.minutesPerLesson;
        if (!input) return;
        
        let value = parseInt(input.value, 10) || DEFAULT_MINUTES_PER_LESSON;
        value += change;
        
        // Sınırları kontrol et (15-180 dakika arası, 5'er 5'er)
        value = Math.max(15, Math.min(180, value));
        value = Math.round(value / 5) * 5; // 5'in katına yuvarla
        
        input.value = value;
        selectedMinutesPerLesson = value;
    }
    
    function handleMinutesCountInput(e) {
        let value = parseInt(e.target.value, 10) || DEFAULT_MINUTES_PER_LESSON;
        value = Math.max(15, Math.min(180, value));
        value = Math.round(value / 5) * 5;
        e.target.value = value;
        selectedMinutesPerLesson = value;
    }
    
    // Ders planı modalını aç/kapat
    function openLessonPlanModal() {
        if (DOMElements.lessonPlanModal) {
            DOMElements.lessonPlanModal.classList.add('show');
            console.log('Ders planı modalı açılıyor...');
            
            // Varsayılan değerleri ayarla
            if (DOMElements.lessonsPerWeek) {
                DOMElements.lessonsPerWeek.value = selectedLessonsPerWeek;
                console.log('Haftalık ders sayısı ayarlandı:', selectedLessonsPerWeek);
            }
            if (DOMElements.minutesPerLesson) {
                DOMElements.minutesPerLesson.value = selectedMinutesPerLesson;
                console.log('Ders süresi ayarlandı:', selectedMinutesPerLesson);
            }
            
            // Modal görünür olduğunda focus ver
            setTimeout(() => {
                if (DOMElements.lessonsPerWeek) {
                    DOMElements.lessonsPerWeek.focus();
                }
            }, 100);
        } else {
            console.error('Ders planı modalı bulunamadı!');
            console.log('Mevcut DOM elementleri:', Object.keys(DOMElements));
        }
    }
    
    function closeLessonPlanModal() {
        if (DOMElements.lessonPlanModal) {
            DOMElements.lessonPlanModal.classList.remove('show');
            console.log('Ders planı modalı kapatıldı');
        }
    }
    
    // İzlence checkboxı değiştiğinde
    function handleSyllabusOptionChange(e) {
        isSyllabusMode = e.target.checked;
        if (DOMElements.materialTypeContainer) {
            DOMElements.materialTypeContainer.style.display = isSyllabusMode ? 'none' : 'block';
        }
        
        // Material type'ın required özelliğini izlence modunda kaldır
        if (DOMElements.materialTypeSelect) {
            DOMElements.materialTypeSelect.required = !isSyllabusMode;
        }
        
        // Buton metnini güncelle
        if (DOMElements.btnGenerate) {
            DOMElements.btnGenerate.innerHTML = isSyllabusMode ? 
                '<i class="fas fa-calendar-alt"></i> <span>İzlence Oluştur</span>' : 
                '<i class="fas fa-wand-magic-sparkles"></i> <span>Materyali Oluştur</span>';
        }
    }
    
    // Hafta sayısı kontrolü
    function updateWeeksCount(change) {
        const input = DOMElements.weeksCount;
        const rangeInput = DOMElements.weeksRange;
        if (!input || !rangeInput) return;
        
        let value = parseInt(input.value, 10) || DEFAULT_WEEKS_COUNT;
        value += change;
        
        // Sınırları kontrol et
        value = Math.max(MIN_WEEKS_COUNT, Math.min(MAX_WEEKS_COUNT, value));
        
        input.value = value;
        rangeInput.value = value;
        selectedWeeksCount = value;
    }
    
    function handleWeeksCountInput(e) {
        let value = parseInt(e.target.value, 10) || DEFAULT_WEEKS_COUNT;
        value = Math.max(MIN_WEEKS_COUNT, Math.min(MAX_WEEKS_COUNT, value));
        e.target.value = value;
        if (DOMElements.weeksRange) DOMElements.weeksRange.value = value;
        selectedWeeksCount = value;
    }
    
    function handleWeeksRangeInput(e) {
        const value = parseInt(e.target.value, 10);
        if (DOMElements.weeksCount) DOMElements.weeksCount.value = value;
        selectedWeeksCount = value;
    }
    
    function openSyllabusModal() {
        if (DOMElements.syllabusModal) {
            DOMElements.syllabusModal.classList.add('show');
            // Varsayılan hafta sayısını ayarla
            if (DOMElements.weeksCount) DOMElements.weeksCount.value = selectedWeeksCount;
            if (DOMElements.weeksRange) DOMElements.weeksRange.value = selectedWeeksCount;
        }
        isGenerating = false;
        setGenerateButtonState(false);
    }
    
    function closeSyllabusModal() {
        if (DOMElements.syllabusModal) {
            DOMElements.syllabusModal.classList.remove('show');
        }
    }
    
    // Pro Sürüm Modalı
    function showProVersionModal() {
        if (DOMElements.proVersionModal) {
            DOMElements.proVersionModal.classList.add('active');
        }
    }
    
    function closeProVersionModal() {
        if (DOMElements.proVersionModal) {
            DOMElements.proVersionModal.classList.remove('active');
        }
    }
    
    // Hafta için ders planı var mı kontrol et
    function hasLessonPlanForWeek(weekIndex) {
        return currentLessonPlansData && 
               currentLessonPlansData[weekIndex] && 
               currentLessonPlansData[weekIndex].lessons && 
               currentLessonPlansData[weekIndex].lessons.length > 0;
    }
    
    // İzlence kartlarına tıklamayı işle
    function handleSyllabusCardClicks(event) {
        const target = event.target;
        
        // Materyal öğesine tıklandıysa en yakın öğeyi bul
        const materialItem = target.closest('.material-item');
        
        // Başlık başlığına tıklandıysa
        const header = target.closest('.syllabus-header');
        
        if (header) {
            // Hafta başlığına tıklandı - Aç/kapat işlemi
            const section = header.closest('.syllabus-section');
            if (section) {
                section.classList.toggle('active');
            }
        } else if (materialItem) {
            // Ders planı butonuna mı tıklandı?
            if (materialItem.classList.contains('lesson-plan-btn')) {
                if (!materialItem.classList.contains('disabled')) {
                    const weekIndex = parseInt(materialItem.dataset.week, 10);
                    if (!isNaN(weekIndex)) {
                        openLessonPlanViewModal(weekIndex);
                    }
                }
                return;
            }
            
            // Normal materyale tıklandı - İlgili materyali göster
            const weekIndex = parseInt(materialItem.dataset.week, 10);
            const topicIndex = parseInt(materialItem.dataset.topic, 10);
            const materialType = materialItem.dataset.material;
            
            if (!isNaN(weekIndex) && !isNaN(topicIndex) && materialType && currentSyllabusData.length > 0) {
                displayMaterialContent(weekIndex, topicIndex, materialType);
            }
        }
    }

    // Flash kart navigasyonu ve olayları
    function renderFlashcards(cards) {
        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return "<p>Flashcard verisi bulunamadı.</p>";
        }
        
        let html = `
            <div class="ultra-simple-title">
                <h3><i class="fas fa-layer-group"></i> Flash Kartlar (${cards.length} adet)</h3>
            </div>
            <div class="ultra-simple-cards">
        `;
        
        // Her kartı basit bir kutu olarak göster
        cards.forEach((card, index) => {
            html += `
                <div class="ultra-card">
                    <div class="ultra-card-number">${index + 1}</div>
                    <div class="ultra-card-content">
                        <div class="card-line"><strong>Anahtar Kelime:</strong> ${escapeHtml(card.term)}</div>
                        <div class="card-line"><strong>Anahtar Kelime Tanımı:</strong> ${formatSimpleDefinition(card.definition)}</div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        
        // Ultra basit stiller
        html += `
            <style>
                .ultra-simple-title {
                    margin-bottom: 20px;
                    text-align: center;
                }
                .ultra-simple-title h3 {
                    color: #00695c;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                .ultra-simple-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .ultra-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 15px;
                    background-color: #fff;
                    position: relative;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .ultra-card-number {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 30px;
                    height: 30px;
                    background-color: #00867d;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                }
                .ultra-card-content {
                    line-height: 1.6;
                }
                .card-line {
                    margin-bottom: 8px;
                }
                .card-line:last-child {
                    margin-bottom: 0;
                }
                .ultra-card-content strong {
                    color: #00695c;
                    font-weight: 600;
                }
                
                /* Dark mode */
                .dark-mode .ultra-card {
                    background-color: #333;
                    border-color: #555;
                }
                .dark-mode .ultra-card-content {
                    color: #e0e0e0;
                }
                .dark-mode .ultra-card-content strong {
                    color: #4db6ac;
                }
                .dark-mode .ultra-simple-title h3 {
                    color: #4db6ac;
                }
            </style>
        `;
        
        return html;
    }

    // Basit tanım formatlama fonksiyonu
    function formatSimpleDefinition(definition) {
        if (typeof definition !== 'string') {
            return definition;
        }
        
        // Basit satır sonu işleme
        return definition.replace(/\n/g, '<br>');
    }

    // Update the displayMaterialContent function to initialize modal flashcards
    async function displayMaterialContent(weekIndex, topicIndex, materialType) {
        if (!currentSyllabusData || !currentSyllabusData[weekIndex] || 
            !currentSyllabusData[weekIndex].topics || 
            !currentSyllabusData[weekIndex].topics[topicIndex]) {
            showNotification("Materyal bulunamadı", "warning");
            return;
        }
        
        const week = currentSyllabusData[weekIndex];
        const topic = week.topics[topicIndex];
        const materialData = topic.materials[materialType];
        
        if (!materialData) {
            showNotification("Bu materyal için içerik bulunmamaktadır", "warning");
            return;
        }
        
        // Materyal başlığını hazırla
        const materialTitle = getMaterialTypeName(materialType);
        const modalTitle = `${week.title}: ${topic.title} - ${materialTitle}`;
        
        let materialContent = "";
        
        // Materyal türüne göre uygun içerik oluştur
        if (materialType === 'flashcards') {
            if (Array.isArray(materialData)) {
                // Hazır nesne dizisi
                materialContent = renderFlashcards(materialData);
            } else {
                // Metin olarak gelen flashcard'lar için ayrıştırma
                const cards = parseFlashcardContent(materialData);
                materialContent = renderFlashcards(cards);
            }
        } else if (materialType === 'quiz') {
            if (Array.isArray(materialData)) {
                // Hazır soru dizisi
                materialContent = renderQuiz(materialData);
            } else {
                // Metin olarak gelen quiz için ayrıştırma
                const questions = parseQuizContent(materialData);
                materialContent = renderQuiz(questions);
            }
        } else if (materialType === 'key-concepts') {
            if (Array.isArray(materialData)) {
                // Hazır anahtar kavramlar dizisi
                materialContent = renderKeyConcepts(materialData);
            } else {
                // Metin olarak gelen anahtar kavramlar
                materialContent = formatAIResponseToHTML(materialData);
            }
        } else {
            // Diğer tüm metin içerikleri
            materialContent = formatAIResponseToHTML(materialData);
        }
        
        // İçeriği göster
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: modalTitle,
                html: `<div class="material-preview">${materialContent}</div>`,
                width: '800px',
                confirmButtonText: 'Kapat',
                confirmButtonColor: 'var(--color-primary)',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp animate__faster'
                },
                didOpen: () => {
                    // Initialize flashcard functionality if this is a flashcard modal
                    if (materialType === 'flashcards') {
                        initializeModalFlashcards();
                    }
                }
            });
        } else {
            alert(`${modalTitle}\n\n${materialData}`);
        }
    }

    function renderKeyConcepts(concepts) {
        if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
            return "<p>Anahtar kavram bulunamadı.</p>";
        }
        
        let html = '<div class="key-concepts-container">';
        
        concepts.forEach((concept) => {
            html += `
                <div class="key-concept-item">
                    <div class="key-concept-content">${escapeHtml(concept)}</div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Anahtar kavram stilleri
        html += `
            <style>
                .key-concepts-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    max-height: 60vh;
                    overflow-y: auto;
                    padding: 10px;
                }
                .key-concept-item {
                    display: flex;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 12px 16px;
                    background-color: #f9f9f9;
                    align-items: flex-start;
                }
                .key-concept-content {
                    flex: 1;
                    line-height: 1.5;
                }
                
                .dark-mode .key-concept-item {
                    background-color: #333;
                    border-color: #555;
                    color: #eee;
                }
            </style>
        `;
        
        return html;
    }

    function renderQuiz(questions) {
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return "<p>Quiz verisi bulunamadı.</p>";
        }
        
        let html = '<div class="quiz-container">';
        
        questions.forEach((question, index) => {
            html += `
                <div class="quiz-question">
                    <div class="quiz-question-text">${index + 1}. ${escapeHtml(question.question)}</div>
                    <div class="quiz-options">
            `;
            
            // Seçenekler
            if (Array.isArray(question.options)) {
                question.options.forEach((option, optIndex) => {
                    const isCorrect = optIndex === question.answer;
                    const optionClass = isCorrect ? 'quiz-option-correct' : '';
                    const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D...
                    
                    html += `
                        <div class="quiz-option ${optionClass}">
                            <span class="quiz-option-letter">${optionLetter}</span>
                            <span class="quiz-option-text">${escapeHtml(option)}</span>
                            ${isCorrect ? '<span class="quiz-option-check"><i class="fas fa-check"></i></span>' : ''}
                        </div>
                    `;
                });
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Quiz stilleri
        html += `
            <style>
                .quiz-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    max-height: 60vh;
                    overflow-y: auto;
                    padding: 10px;
                }
                .quiz-question {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 16px;
                    background-color: #f9f9f9;
                }
                .quiz-question-text {
                    font-size: 18px;
                    margin-bottom: 12px;
                    font-weight: 600;
                }
                .quiz-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .quiz-option {
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background-color: #fff;
                    transition: all 0.2s ease;
                }
                .quiz-option-correct {
                    background-color: rgba(67, 160, 71, 0.1);
                    border-color: #43a047;
                }
                .quiz-option-letter {
                    font-weight: bold;
                    margin-right: 10px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f0f0f0;
                    border-radius: 50%;
                }
                .quiz-option-correct .quiz-option-letter {
                    background-color: #43a047;
                    color: white;
                }
                .quiz-option-text {
                    flex: 1;
                }
                .quiz-option-check {
                    color: #43a047;
                    margin-left: 10px;
                }
                
                .dark-mode .quiz-question {
                    background-color: #333;
                    border-color: #555;
                }
                .dark-mode .quiz-option {
                    background-color: #444;
                    border-color: #555;
                    color: #eee;
                }
                .dark-mode .quiz-option-letter {
                    background-color: #555;
                    color: #eee;
                }
                .dark-mode .quiz-option-correct {
                    background-color: rgba(67, 160, 71, 0.2);
                    border-color: #43a047;
                }
            </style>
        `;
        
        return html;
    }
    
    // Düzeltilmiş initializeModalFlashcards fonksiyonu
    function initializeModalFlashcards() {
        // Get the cards data from the embedded JSON
        const dataScript = document.getElementById('flashcard-modal-data');
        if (!dataScript) return;
        
        try {
            const cards = JSON.parse(dataScript.textContent);
            let currentIndex = 0;
            
            // DOM elements
            const container = document.querySelector('.flashcards-modal-container');
            const cardElement = document.querySelector('.flashcard-item');
            const prevButton = document.querySelector('.js-prev-card-modal');
            const nextButton = document.querySelector('.js-next-card-modal');
            const currentSpan = document.querySelector('.js-current-card-modal');
            
            if (!container || !cardElement) return;
            
            // Kart tıklama olayı için doğrudan event delegation kullan
            // Bu, herhangi bir indeksteki kartların dönmesini sağlar
            container.addEventListener('click', function(event) {
                const clickedCard = event.target.closest('.flashcard-item');
                if (clickedCard) {
                    clickedCard.classList.toggle('flipped');
                }
            });
            
            // Navigation buttons
            if (prevButton && nextButton && cards.length > 1) {
                // Previous card
                prevButton.addEventListener('click', function() {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateCard();
                    }
                });
                
                // Next card
                nextButton.addEventListener('click', function() {
                    if (currentIndex < cards.length - 1) {
                        currentIndex++;
                        updateCard();
                    }
                });
            }
            
            // Update card content
            function updateCard() {
                // Update button states
                if (prevButton) prevButton.disabled = currentIndex === 0;
                if (nextButton) nextButton.disabled = currentIndex === cards.length - 1;
                if (currentSpan) currentSpan.textContent = (currentIndex + 1).toString();
                
                // Get current card data
                const card = cards[currentIndex];
                
                // Create new card HTML
                const cardHtml = `
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <div class="flashcard-term">${escapeHtml(card.term)}</div>
                            <div class="flashcard-hint">Çevirmek için tıklayın</div>
                        </div>
                        <div class="flashcard-back">
                            <div class="flashcard-definition">${formatAIResponseToHTML(card.definition)}</div>
                        </div>
                    </div>
                `;
                
                // Update card and reset flip state
                cardElement.innerHTML = cardHtml;
                cardElement.classList.remove('flipped');
                cardElement.setAttribute('data-index', currentIndex.toString());
                
                // Click olayını tekrar eklemeye gerek yok,
                // çünkü üstteki container üzerinde event delegation kullanıyoruz
            }
        } catch (error) {
            console.error('Flashcard data parsing error:', error);
        }
    }

    function initFlashcardEvents() {
        document.addEventListener('click', function(event) {
            // Ana ekrandaki flash kart tıklamaları
            const flashcardItem = event.target.closest('.flashcard-item');
            if (flashcardItem && !flashcardItem.closest('.material-preview')) {
                flashcardItem.classList.toggle('flipped');
                event.stopPropagation();
            }
            
            // Ana ekranda gezinme düğmelerini işle
            const prevButton = event.target.closest('.js-prev-card');
            if (prevButton) {
                const container = prevButton.closest('.flashcard-container');
                if (container) {
                    navigateFlashcard(container, 'prev');
                }
                event.stopPropagation();
            }
            
            const nextButton = event.target.closest('.js-next-card');
            if (nextButton) {
                const container = nextButton.closest('.flashcard-container');
                if (container) {
                    navigateFlashcard(container, 'next');
                }
                event.stopPropagation();
            }
        });
    }

    function toggleTheme() { isDarkMode = !isDarkMode; localStorage.setItem('EduNomo-theme', isDarkMode ? 'dark' : 'light'); updateTheme(); }
    function handleScroll() { const scrollY = window.scrollY; DOMElements.mainHeader?.classList.toggle('scrolled', scrollY > 50); DOMElements.backToTop?.classList.toggle('show', scrollY > 400); }
    function toggleMobileMenu() { DOMElements.body?.classList.toggle('menu-open'); }
    function closeMobileMenuOnClickOutside(e) { if (DOMElements.body?.classList.contains('menu-open') && !e.target.closest(SELECTORS.mainNav) && !e.target.closest(SELECTORS.menuToggle)) { DOMElements.body.classList.remove('menu-open'); } }
    function handleNavLinkClick(e) { DOMElements.allNavLinks?.forEach(l => l.classList.remove('active')); e.currentTarget.classList.add('active'); if (DOMElements.body?.classList.contains('menu-open')) { DOMElements.body.classList.remove('menu-open'); } }
    function handleAnchorScroll(e) { e.preventDefault(); const targetId = this.getAttribute('href'); const targetElement = document.querySelector(targetId); if (targetElement) { window.scrollTo({ top: targetElement.offsetTop - SCROLL_OFFSET, behavior: 'smooth' }); } }
    function updateCharacterCount() { if (!DOMElements.topicInput || !DOMElements.charCount) return; const count = DOMElements.topicInput.value.length; DOMElements.charCount.textContent = count; DOMElements.charCount.classList.toggle('limit-reached', count >= MAX_CHAR_COUNT); if (count > MAX_CHAR_COUNT) { DOMElements.topicInput.value = DOMElements.topicInput.value.substring(0, MAX_CHAR_COUNT); DOMElements.charCount.textContent = MAX_CHAR_COUNT; } }
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
            
            // Materyal seçeneğini tekrar göster
            if(DOMElements.materialTypeContainer) {
                DOMElements.materialTypeContainer.style.display = 'block';
            }
            // İzlence modunu resetle
            isSyllabusMode = false;
            if(DOMElements.syllabusOption) {
                DOMElements.syllabusOption.checked = false;
            }
            // Buton metnini varsayılana çevir
            if(DOMElements.btnGenerate) {
                DOMElements.btnGenerate.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> <span>Materyali Oluştur</span>';
            }
        }, 50);
    }
    
    function handleFeedbackClick(e) { const clickedButton = e.currentTarget; const isHelpful = clickedButton.id === 'btn-helpful'; const otherButton = isHelpful ? DOMElements.btnNotHelpful : DOMElements.btnHelpful; otherButton?.classList.remove('active'); clickedButton.classList.toggle('active'); if (clickedButton.classList.contains('active')) { showNotification('Geri bildiriminiz için teşekkürler!', 'success'); if (!isHelpful) { promptDetailedFeedback(); } } }
    function handleContactFormSubmit(e) { e.preventDefault(); const form = e.target; const name = form.querySelector('#name')?.value; const email = form.querySelector('#email')?.value; const message = form.querySelector('#message')?.value; if (!name || !email || !message) { showNotification('Lütfen tüm alanları doldurun.', 'warning'); return; } Swal.fire({ title: 'Mesajınız Gönderiliyor', html: 'Lütfen bekleyin...', timerProgressBar: true, didOpen: () => Swal.showLoading(), allowOutsideClick: false }); setTimeout(() => { Swal.fire({ title: 'Teşekkürler!', text: `${name}, mesajınız başarıyla alındı. En kısa sürede geri dönüş yapacağız.`, icon: 'success', confirmButtonText: 'Tamam', confirmButtonColor: 'var(--color-primary)' }); form.reset(); }, 1500); }

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
                    : cardContentElement.innerText; // Normal kartın görünen metnini al
                 // Ham veriyi kopyalamak daha iyi olabilir:
                 const cardIndex = Array.from(DOMElements.resultDiv.children).indexOf(copyButton.closest('.material-card'));
                 if (cardIndex > -1 && currentMaterialsData[cardIndex]) {
                     copyToClipboard(currentMaterialsData[cardIndex].content, copyButton); // Ham veriyi kopyala
                 } else {
                     copyToClipboard(contentToCopy, copyButton); // Fallback
                 }
            }
        } else if (flashcardItem) {
            // Flashcard'a tıklama
            flashcardItem.classList.toggle('flipped');
            event.stopPropagation();
        }
    }

    // ============================================================================
    // Yardımcı Fonksiyonlar (Helpers)
    // ============================================================================
    function updateTheme() { DOMElements.body?.classList.toggle('dark-mode', isDarkMode); if (DOMElements.mobileThemeToggle) { DOMElements.mobileThemeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Aydınlık Mod' : '<i class="fas fa-moon"></i> Karanlık Mod'; } }
    function showNotification(message, type = 'info', timer = 3000) { if(typeof Swal === 'undefined') { console.warn('SweetAlert not loaded, using alert'); alert(message); return; } const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: timer, timerProgressBar: true, didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }, customClass: { popup: `swal2-toast-${type}` } }); Toast.fire({ icon: type, title: message }); }
    function validateApiKey() { if (API_KEY === 'BURAYA_KENDI_GOOGLE_GEMINI_API_ANAHTARINIZI_YAPISTIRIN' || !API_KEY || API_KEY.length < 30) { if (!document.querySelector('.api-error-card')) { displayErrorCard("API Hatası", "API anahtarı yapılandırılmamış veya geçersiz. Lütfen `func.js` dosyasını kontrol edin.", 'error', 'fas fa-key', true); } return false; } return true; }
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
    
    function prepareUIForGeneration(topic, selectedMaterialTypeKey, selectedMaterialTypeText) { 
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
        currentTopic = topic; 
        if(DOMElements.outputArea) DOMElements.outputArea.style.display = 'block'; 
        if(DOMElements.outputHeader) DOMElements.outputHeader.style.display = 'flex'; 
        if(DOMElements.pdfDownloadArea) DOMElements.pdfDownloadArea.style.display = 'none'; 
        if(DOMElements.feedbackArea) DOMElements.feedbackArea.style.display = 'none'; 
        if(DOMElements.loadingDiv) DOMElements.loadingDiv.style.display = 'flex'; 
        const subtitleText = selectedMaterialTypeKey === 'all' ? `"${topic}" konusunda tüm materyaller` : `"${topic}" konusunda "${selectedMaterialTypeText}"`; 
        if(DOMElements.outputSubtitle) DOMElements.outputSubtitle.textContent = subtitleText; 
        if(DOMElements.outputTitleText) DOMElements.outputTitleText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Materyal Oluşturuluyor'; 
    }
    
    function prepareUIForSyllabusGeneration(topic, weeksCount) {
        if(DOMElements.resultDiv) DOMElements.resultDiv.innerHTML = ''; 
        if(DOMElements.syllabusResultDiv) {
            DOMElements.syllabusResultDiv.innerHTML = '';
            DOMElements.syllabusResultDiv.style.display = 'flex';
        }
        currentMaterialsData = []; 
        currentSyllabusData = [];
        currentLessonPlansData = [];
        currentTopic = topic; 
        if(DOMElements.outputArea) DOMElements.outputArea.style.display = 'block'; 
        if(DOMElements.outputHeader) DOMElements.outputHeader.style.display = 'flex'; 
        if(DOMElements.pdfDownloadArea) DOMElements.pdfDownloadArea.style.display = 'none'; 
        if(DOMElements.feedbackArea) DOMElements.feedbackArea.style.display = 'none'; 
        if(DOMElements.loadingDiv) DOMElements.loadingDiv.style.display = 'flex'; 
        const subtitleText = `"${topic}" konusunda ${weeksCount} haftalık izlence`;
        if(DOMElements.outputSubtitle) DOMElements.outputSubtitle.textContent = subtitleText;
        if(DOMElements.outputTitleText) DOMElements.outputTitleText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İzlence Oluşturuluyor';
    }
    
    function scrollToOutputArea() { setTimeout(() => { DOMElements.outputArea?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150); }
    
    function startLoadingAnimation(isAll = false, isSyllabus = false, state = 'syllabus') { 
        if(!DOMElements.progressBar) return {}; 
        
        // İşlem durumuna göre ilerleme hızını ayarla
        let progressIncrement = 1;
        let maxProgress = 98;
        
        // İzlence oluşturma sürecinde daha yavaş ilerleme
        if (state === 'syllabus') {
            progressIncrement = 0.8; // Daha yavaş ilerleme
            maxProgress = 40; // Maksimum %40'a kadar
        } 
        // Materyal oluşturma sürecinde orta ilerleme
        else if (state === 'materials') {
            progressIncrement = 1.2;
            maxProgress = 85; // %40'dan %85'e
        }
        // Ders planı oluşturma
        else if (state === 'lesson-plans') {
            progressIncrement = 1.5;
            maxProgress = 98; // %0'dan %98'e
        }
        // Tamamlama sürecinde hızlı ilerleme 
        else if (state === 'completion') {
            progressIncrement = 2;
            maxProgress = 98; // %85'den %98'e
        }
        
        // İlerleme çubuğunu sıfırla (eğer yeni başlıyorsa)
        if (state === 'syllabus' || state === 'lesson-plans') {
            DOMElements.progressBar.style.width = '0%'; 
        }
        
        let currentProgress = parseFloat(DOMElements.progressBar.style.width) || 0;
        
        const progressInterval = setInterval(() => { 
            // Sanki doğal ilerleme hissi vermek için rastgele artışlar
            currentProgress += (Math.random() * progressIncrement + 0.5); 
            
            // İlgili aşama için maksimum değeri aşmasın
            if (currentProgress > maxProgress) {
                currentProgress = maxProgress;
                clearInterval(progressInterval);
            }
            
            DOMElements.progressBar.style.width = `${currentProgress}%`; 
        }, 400); 
        
        // Uygun mesaj havuzunu seç
        let messagePool = loadingMessages; // Varsayılan mesajlar
        
        if (isSyllabus) {
            if (state === 'syllabus') {
                messagePool = loadingMessagesForSyllabus;
                
                // İzlence başlangıç mesajını güncelle
                if (DOMElements.outputTitleText) {
                    DOMElements.outputTitleText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İzlence Oluşturuluyor';
                }
            } 
            else if (state === 'materials') {
                messagePool = loadingMessagesForMaterials;
                
                // Materyal başlangıç mesajını güncelle  
                if (DOMElements.outputTitleText) {
                    DOMElements.outputTitleText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Haftalar İçin Materyaller Hazırlanıyor';
                }
            }
            else if (state === 'completion') {
                messagePool = loadingMessagesForCompletion;
                
                // Tamamlama başlangıç mesajını güncelle
                if (DOMElements.outputTitleText) {
                    DOMElements.outputTitleText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İzlence Son Rötuşlar';
                }
            }
        } else if (state === 'lesson-plans') {
            messagePool = loadingMessagesForLessonPlans;
            
            if (DOMElements.outputTitleText) {
                DOMElements.outputTitleText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ders Planları Hazırlanıyor';
            }
        } else if (isAll) {
            messagePool = loadingMessagesForAll;
        }
        
        const updateMessage = () => { 
            if (!isGenerating || !DOMElements.loadingMessage) return; 
            
            // Rastgele bir mesaj seç (önceki ile aynı olmasın)
            let randomIndex;
            let previousMessage = DOMElements.loadingMessage.textContent;
            
            do {
                randomIndex = Math.floor(Math.random() * messagePool.length);
            } while (messagePool[randomIndex] === previousMessage && messagePool.length > 1);
            
            // Yumuşak geçiş animasyonu
            DOMElements.loadingMessage.style.opacity = '0'; 
            setTimeout(() => { 
                DOMElements.loadingMessage.textContent = messagePool[randomIndex]; 
                DOMElements.loadingMessage.style.opacity = '1'; 
            }, 300); 
        }; 
        
        // İlk mesajı hemen göster
        updateMessage(); 
        
        // Mesajları periyodik olarak güncelle (daha sık - 3 saniyede bir)
        const messageInterval = setInterval(updateMessage, 3000); 
        
        // Asistanın yüz ifadesini değiştir
        if (state === 'syllabus' || state === 'lesson-plans') {
            animateAssistant('thinking'); 
        } else if (state === 'materials') {
            animateAssistant('working');
        } else {
            animateAssistant('happy');
        }
        
        return { progress: progressInterval, message: messageInterval }; 
    }
    
    async function determineSuitableMaterials(topicTitle, topicDescription, objectives) {
        // Varsayılan materyal türleri - her konu için en az bunlar olacak
        const defaultMaterials = ["summary", "key-concepts"];
        
        // Tüm materyal türleri
        const allMaterialTypes = [
            "summary",         // Özet
            "key-concepts",    // Anahtar Kavramlar
            "flashcards",      // Flash Kartlar
            "quiz",            // Çoktan Seçmeli Sorular
            "short-answer",    // Kısa Cevaplı Sorular
            "fill-blanks",     // Boşluk Doldurma
            "true-false",      // Doğru/Yanlış İfadeleri
            "cause-effect",    // Neden-Sonuç İlişkileri
            "compare",         // Karşılaştırma
            "pros-cons",       // Avantaj-Dezavantaj
            "concept-map",     // Kavram Haritası
            "real-world",      // Gerçek Hayat Örnekleri
            "metaphor",        // Metafor/Benzetme
            "case-study",      // Vaka Analizi
            "prediction",      // Tahmin Soruları
            "discussion"       // Tartışma Soruları
        ];
        
        try {
            // Konunun içeriğine göre uygun materyal tiplerini belirlemek için 
            // yapay zekadan analiz isteyelim
            const analysisPrompt = `
            Lütfen şu konu için en uygun öğretim materyallerini seç:
            
            Konu: "${topicTitle}"
            Açıklama: "${topicDescription}"
            Öğrenme Hedefleri: ${objectives.join(", ")}
            
            Aşağıdaki materyal tipleri mevcuttur. Konu içeriğine en uygun 4-7 tanesini seç:
            ${allMaterialTypes.map(type => "- " + getMaterialTypeName(type)).join("\n")}
            
            SADECE materyal tip kodlarını virgülle ayrılmış liste şeklinde döndür, başka açıklama yapma:
            Örnek yanıt: summary,key-concepts,flashcards,quiz
            `;
            
            // API'den analiz iste (kısa ve öz bir yanıt için)
            const analysisResponse = await fetchAIResponse(analysisPrompt, "analysis", true);
            
            if (analysisResponse && analysisResponse.rawGeneratedText) {
                // API yanıtını işle - sadece geçerli materyal tiplerini filtrele
                const suggestedMaterials = analysisResponse.rawGeneratedText
                    .toLowerCase()
                    .replace(/\s+/g, '')  // Boşlukları kaldır
                    .split(',')
                    .filter(type => allMaterialTypes.includes(type.trim()));
                    
                // Eğer uygun materyal bulunamadıysa veya çok az ise
                if (suggestedMaterials.length < 4) {
                    // Varsayılan materyalleri kullan ve biraz rastgele ekle
                    const additionalMaterials = ["flashcards", "quiz", "short-answer", "true-false"]
                        .filter(type => !suggestedMaterials.includes(type))
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 3);
                        
                    return [...new Set([...defaultMaterials, ...suggestedMaterials, ...additionalMaterials])];
                }
                
                // Varsayılan materyalleri ekleyip tekrarları kaldır
                return [...new Set([...defaultMaterials, ...suggestedMaterials])];
            }
        } catch (error) {
            console.error("Materyal analizi hatası:", error);
        }
        
        // Hata durumunda varsayılan bir seçim döndür - ama her konu için farklı olsun
        // Konu başlığına göre bazı rastgele materyaller ekleyelim (deterministik olsun)
        const titleHash = hashString(topicTitle);
        const randomMaterials = allMaterialTypes
            .filter(type => !defaultMaterials.includes(type))
            .sort(() => (titleHash % 100) / 100 - 0.5)
            .slice(0, 3 + (titleHash % 4)); // 3-6 arası rastgele materyal
        
        return [...defaultMaterials, "flashcards", "quiz", ...randomMaterials];
    }

    function hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit integer'a dönüştür
        }
        return Math.abs(hash);
    }

    function stopLoadingAnimation(intervals) { 
        if (intervals) { 
            clearInterval(intervals.progress); 
            clearInterval(intervals.message); 
        } 
        if (DOMElements.progressBar) { 
            DOMElements.progressBar.style.transition = 'width 0.3s ease'; 
            DOMElements.progressBar.style.width = '100%'; 
        } 
        setTimeout(() => { 
            if(DOMElements.loadingDiv) DOMElements.loadingDiv.style.display = 'none'; 
            if(DOMElements.progressBar) { 
                DOMElements.progressBar.style.transition = 'width 0.5s ease-out'; 
                DOMElements.progressBar.style.width = '0%'; 
            } 
        }, 300); 
    }
    
    function animateAssistant(mood) { 
        const targetImage = assistantExpressions[mood] || assistantExpressions.default; 
        if (DOMElements.loadingCharacter && DOMElements.loadingCharacter.src !== targetImage && typeof gsap !== 'undefined') { 
            gsap.to(DOMElements.loadingCharacter, { opacity: 0, scale: 0.9, duration: 0.2, ease: "power1.in", onComplete: () => { 
                DOMElements.loadingCharacter.src = targetImage; 
                gsap.to(DOMElements.loadingCharacter, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }); 
            } }); 
        } 
    }
    
    function resetUIAfterGeneration(showPdfAndFeedback) { 
        if(DOMElements.pdfDownloadArea) DOMElements.pdfDownloadArea.style.display = showPdfAndFeedback ? 'flex' : 'none'; 
        if(DOMElements.feedbackArea) DOMElements.feedbackArea.style.display = showPdfAndFeedback ? 'flex' : 'none'; 
    }
    
    function refreshAOS() { setTimeout(() => { if (typeof AOS !== 'undefined') AOS.refresh(); }, 100); }
    function escapeHtml(unsafe) { if (typeof unsafe !== 'string') return ''; return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
    function findIconForTitle(title) { const lowerTitle = title.toLowerCase(); for (const key in materialIcons) { const keywords = key.toLowerCase().split(/[\s(/]/).filter(Boolean); if (keywords.length > 0 && keywords.some(kw => lowerTitle.includes(kw) && kw.length > 2)) { return materialIcons[key]; } } return null; }
    function promptDetailedFeedback() { if(typeof Swal === 'undefined') return; Swal.fire({ title: 'Geri Bildiriminiz Önemli', text: 'Materyalin hangi yönlerden yetersiz kaldığını veya nasıl iyileştirilebileceğini paylaşır mısınız?', input: 'textarea', inputPlaceholder: 'Önerileriniz...', showCancelButton: true, confirmButtonText: 'Gönder <i class="fas fa-paper-plane"></i>', cancelButtonText: 'İptal', confirmButtonColor: 'var(--color-primary)', cancelButtonColor: 'var(--color-secondary)', showLoaderOnConfirm: true, customClass: { popup: 'feedback-swal' }, preConfirm: (feedback) => { console.log("Detaylı Geri Bildirim:", feedback); return new Promise(resolve => setTimeout(resolve, 1000)); } }).then((result) => { if (result.isConfirmed) { showNotification('Detaylı geri bildiriminiz için teşekkür ederiz!', 'success'); } else { DOMElements.btnNotHelpful?.classList.remove('active'); } }); }

    // Materyal türü ID'sinden görünür ad elde et
    function getMaterialTypeName(materialType) {
        const materialTypes = {
            'summary': 'Ünite Özeti',
            'flashcards': 'Flash Kartlar',
            "key-concepts": 'Anahtar Kavramlar',
            'powerpoint': 'PowerPoint İçeriği',
            'quiz': 'Çoktan Seçmeli Sorular',
            'short-answer': 'Kısa Cevaplı Sorular',
            'fill-blanks': 'Boşluk Doldurma',
            'true-false': 'Doğru/Yanlış İfadeleri',
            'cause-effect': 'Neden-Sonuç İlişkileri',
            'compare': 'Karşılaştırma Soruları',
            'pros-cons': 'Avantajlar ve Dezavantajlar',
            'concept-map': 'Kavram Haritası Öğeleri',
            'real-world': 'Gerçek Hayat Örnekleri',
            'metaphor': 'Metafor / Benzetme',
            'case-study': 'Mini Vaka Analizi',
            'prediction': 'Tahmin Soruları',
            'discussion': 'Tartışma Soruları',
            'acronym': 'Akronim Oluşturma',
            'objectives': 'Öğrenme Hedefleri',
            'assessment': 'Değerlendirme',
            'activities': 'Etkinlikler'
        };
        
        return materialTypes[materialType] || 'Materyal';
    }

    function processAndDisplayResults(apiResponse, topic, selectedMaterialTypeKey, selectedMaterialTypeText) {
        const { rawGeneratedText, finishReason, blockReason } = apiResponse;

        if(DOMElements.outputTitleText) DOMElements.outputTitleText.innerHTML = '<i class="fas fa-check-circle"></i> Oluşturulan Materyal';

        if (blockReason) {
            const message = `İstek güvenlik nedeniyle engellendi (${blockReason}). Lütfen farklı bir konu veya ifade deneyin.`;
            displayErrorCard("Güvenlik Engeli", message, 'error', 'fas fa-shield-alt');
            resetUIAfterGeneration(false);
            animateAssistant('surprised');
            return;
        }

        if (!rawGeneratedText || rawGeneratedText.trim().length === 0) {
             let errorMsg = 'API yanıtı boş veya geçersiz içerik döndürdü.';
             if(finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") { errorMsg += ` (Sebep: ${finishReason})`; }
             displayErrorCard("Boş Yanıt", errorMsg, 'error', 'fas fa-filter');
             resetUIAfterGeneration(false);
             animateAssistant('surprised');
             return;
        }

        console.log("Alınan Ham Metin (İlk 200 char):", rawGeneratedText.substring(0, 200) + "...");
        currentMaterialsData = [];
        let cardCount = 0;
        const cleanedText = rawGeneratedText.replace(/\s*return { progress: progressInterval, message: messageInterval };\s*}/g, ''); // Güvenlik için temizle

        if (selectedMaterialTypeKey === 'all') {
             const sections = cleanedText.split('---');
             sections.forEach((section) => {
                 const trimmedSection = section.trim();
                 if (!trimmedSection) return;
                 const headerMatch = trimmedSection.match(/^###\s*\d*\.?\s*(.*?)\s*###\s*\n?/);
                 let title = "Ek Bilgi";
                 let content = trimmedSection;
                 if (headerMatch && headerMatch[1]) { title = headerMatch[1].trim(); content = trimmedSection.substring(headerMatch[0].length).trim(); }
                 else { const lines = trimmedSection.split('\n'); const firstLine = lines[0].trim(); if (firstLine.length < 80 && !firstLine.startsWith('- ') && !firstLine.match(/^\d+\.\s/)) { title = firstLine; content = lines.slice(1).join('\n').trim(); } }
                 
                 // İçeriğin boş veya "içerik oluşturulamadı" içerip içermediğini kontrol et
                 if (content.length >= MIN_CONTENT_LENGTH_FOR_ALL && !content.includes("içerik oluşturulamadı")) {
                     const cardType = title.toLowerCase().includes('flash kart') ? 'flashcards' : 'default';
                     addResultCard(title, content, cardType);
                     cardCount++; 
                 } else {
                     console.log(`Bölüm "${title}" filtrelendi (içerik çok kısa veya boş).`);
                 }
             });
        } else {
             // Eğer içerik uygun ve "içerik oluşturulamadı" içermiyorsa göster
             if (cleanedText.length > 0 && !cleanedText.includes("içerik oluşturulamadı")) {
                 const cardType = selectedMaterialTypeKey === 'flashcards' ? 'flashcards' : 'default';
                 addResultCard(selectedMaterialTypeText, cleanedText, cardType);
                 cardCount++;
             } else {
                 displayInfoCard("Boş İçerik", "Bu konu için materyal oluşturulamadı. Lütfen başka bir materyal türü seçin veya farklı bir konu deneyin.", 'warning');
             }
        }

        if (cardCount === 0 && !(blockReason || (!rawGeneratedText || rawGeneratedText.trim().length === 0))) {
            displayInfoCard("Bilgi", "Yapay zeka bu konu için uygun içerik üretemedi veya üretilen içerik filtrelendi/çok kısaydı.", 'warning');
            resetUIAfterGeneration(false);
        } else if (cardCount > 0) {
            resetUIAfterGeneration(true);
            animateAssistant('happy');
            console.log(`${cardCount} materyal kartı başarıyla oluşturuldu.`);
        }

        if (finishReason === "MAX_TOKENS") { displayInfoCard("Uyarı", "İçerik, maksimum uzunluk sınırına ulaştığı için tam olmayabilir.", 'warning'); }
         if (finishReason === "SAFETY" && !blockReason) { displayInfoCard("Uyarı", "Bazı içerikler güvenlik filtreleri nedeniyle çıkarılmış olabilir.", 'warning'); }
    }
    
    /**
     * API'den gelen izlence verilerini işler ve ekrana render eder
     * 
     * @param {Object} apiResponse - API yanıtı
     * @param {String} topic - Ana konu
     * @param {Number} weeksCount - Hafta sayısı
     * @returns {Promise<void>}
     */
    async function processAndDisplaySyllabus(apiResponse, topic, weeksCount) {
        const { rawGeneratedText, finishReason, blockReason } = apiResponse;

        if(DOMElements.outputTitleText) DOMElements.outputTitleText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İzlence Oluşturuluyor';

        if (blockReason) {
            const message = `İstek güvenlik nedeniyle engellendi (${blockReason}). Lütfen farklı bir konu veya ifade deneyin.`;
            displayErrorCard("Güvenlik Engeli", message, 'error', 'fas fa-shield-alt');
            resetUIAfterGeneration(false);
            animateAssistant('surprised');
            return;
        }

        if (!rawGeneratedText || rawGeneratedText.trim().length === 0) {
             let errorMsg = 'API yanıtı boş veya geçersiz içerik döndürdü.';
             if(finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") { errorMsg += ` (Sebep: ${finishReason})`; }
             displayErrorCard("Boş Yanıt", errorMsg, 'error', 'fas fa-filter');
             resetUIAfterGeneration(false);
             animateAssistant('surprised');
             return;
        }
        
        console.log("İzlence Ham Metin (İlk 200 char):", rawGeneratedText.substring(0, 200) + "...");
        
        // Geliştirilmiş yardımcı fonksiyonu kullanarak JSON ayrıştırmasını dene
        const parseResult = cleanAndParseJSON(rawGeneratedText);
        
        if (parseResult.success) {
            const syllabusData = parseResult.data;
            
            if (!syllabusData || !Array.isArray(syllabusData.weeks) || syllabusData.weeks.length === 0) {
                displayErrorCard("JSON Format Hatası", "İzlence verileri doğru formatta değil (hafta listesi bulunamadı).", 'error');
                resetUIAfterGeneration(false);
                return;
            }
            
            // Hafta sayısını kontrol et - eksik haftaları doldur
            if (syllabusData.weeks.length < weeksCount) {
                // Eksik hafta sayısını hesapla
                const missingWeeks = weeksCount - syllabusData.weeks.length;
                console.log(`${missingWeeks} eksik hafta bulundu, doldurulacak.`);
                
                // Son mevcut haftayı al
                const lastWeek = syllabusData.weeks[syllabusData.weeks.length - 1];
                
                // Eksik haftaları ekle (son haftanın kopyası olarak)
                for (let i = 0; i < missingWeeks; i++) {
                    const newWeekNum = syllabusData.weeks.length + 1;
                    const newWeek = {
                        title: `Hafta ${newWeekNum}: Ek İçerik`,
                        topics: [{
                            title: "Ek Konu",
                            description: "Bu konu daha sonra güncellenecektir.",
                            objectives: ["İçerik güncelleme bekliyor"],
                            materials: {
                                summary: "Bu hafta için içerik henüz oluşturulmadı."
                            },
                            assignments: ["Önceki konuları tekrar edin"]
                        }]
                    };
                    syllabusData.weeks.push(newWeek);
                }
            }
            
            // Her haftanın geçerli bir dizi olup olmadığını kontrol et
            syllabusData.weeks.forEach((week, weekIndex) => {
                // Topics dizisi kontrolü
                if (!week.topics || !Array.isArray(week.topics) || week.topics.length === 0) {
                    week.topics = [{
                        title: "Otomatik Oluşturulan Konu",
                        description: "Bu konu otomatik olarak oluşturuldu.",
                        objectives: ["İçerik daha sonra eklenecek"],
                        materials: {
                            summary: "Otomatik oluşturulan içerik."
                        },
                        assignments: ["Ödev içeriği daha sonra eklenecek"]
                    }];
                }
                
                // Her konunun gerekli alanlarını kontrol et
                week.topics.forEach(topic => {
                    if (!topic.objectives || !Array.isArray(topic.objectives)) {
                        topic.objectives = ["Hedef bilgisi eksik"];
                    }
                    
                    if (!topic.materials) {
                        topic.materials = { summary: "Materyal bilgisi eksik" };
                    }
                    
                    if (!topic.assignments || !Array.isArray(topic.assignments)) {
                        topic.assignments = ["Ödev bilgisi eksik"];
                    }
                });
            });
            
            // Tüm haftalar için materyalleri oluştur
            try {
                // Bu işlem zaman alacağı için kullanıcıya bilgi ver
                if (DOMElements.loadingMessage) {
                    DOMElements.loadingMessage.textContent = "İzlence yapısı oluşturuldu, şimdi her hafta için materyaller hazırlanıyor...";
                }
                
                // Materyal oluşturma işlemini başlat
                await generateMaterialsForSyllabus(syllabusData, topic);
                console.log("İzlence materyalleri başarıyla oluşturuldu.");
                
                if (DOMElements.loadingMessage) {
                    DOMElements.loadingMessage.textContent = "İzlence ve tüm materyaller hazır!";
                }
            } catch (error) {
                console.error("Materyal oluşturma hatası:", error);
                displayInfoCard("Uyarı", "Bazı materyaller oluşturulurken hata oluştu. Eksik materyaller gösterildiğinde yeniden oluşturulacak.", 'warning');
            }
            
            // İzlence verilerini kaydet ve görüntüle
            currentSyllabusData = syllabusData.weeks;
            renderSyllabusWeeks(syllabusData.weeks);
            
            // UI'ı güncelle
            resetUIAfterGeneration(true);
            animateAssistant('happy');
            
            // Başlığı başarı mesajıyla güncelle
            if(DOMElements.outputTitleText) DOMElements.outputTitleText.innerHTML = '<i class="fas fa-check-circle"></i> İzlence Başarıyla Oluşturuldu';
            
            console.log(`${syllabusData.weeks.length} haftalık izlence başarıyla oluşturuldu.`);
            
            // Eğer varsayılan veri kullanıldıysa bildirim göster
            if (parseResult.isDefault) {
                displayInfoCard("Varsayılan İzlence", "JSON ayrıştırılamadığı için varsayılan bir izlence şablonu oluşturuldu.", 'warning');
            }
            
            // İzlence oluşturulduktan sonra ders planı modalını aç
            setTimeout(() => {
                openLessonPlanModal();
            }, 1000);
            
            return;
        } else {
            console.error("JSON Ayrıştırma Başarısız:", parseResult.error);
            displayErrorCard("JSON Hatası", "İzlence verileri ayrıştırılamadı. Lütfen tekrar deneyin.", 'error');
            resetUIAfterGeneration(false);
        }

        if (finishReason === "MAX_TOKENS") { 
            displayInfoCard("Uyarı", "İzlence içeriği, maksimum uzunluk sınırına ulaştığı için tam olmayabilir.", 'warning'); 
        }
        
        if (finishReason === "SAFETY" && !blockReason) { 
            displayInfoCard("Uyarı", "Bazı içerikler güvenlik filtreleri nedeniyle çıkarılmış olabilir.", 'warning'); 
        }
    }
    
    // İzlence haftalarını render et
    /**
     * İzlence haftalarını ekrana render eder
     * 
     * @param {Array} weeks - İzlence haftaları dizisi
     */
    function renderSyllabusWeeks(weeks) {
        if (!DOMElements.syllabusResultDiv) return;
        
        DOMElements.syllabusResultDiv.innerHTML = ''; // Önceki içeriği temizle
        
        weeks.forEach((week, weekIndex) => {
            const weekSection = document.createElement('div');
            weekSection.className = 'syllabus-section';
            weekSection.setAttribute('data-aos', 'fade-up');
            weekSection.setAttribute('data-aos-delay', (weekIndex * 50).toString());
            
            // Hafta başlığı
            const weekHeader = document.createElement('div');
            weekHeader.className = 'syllabus-header';
            weekHeader.innerHTML = `
                <div class="syllabus-header-title">
                    <i class="${materialIcons["Hafta"]}"></i> ${escapeHtml(week.title)}
                </div>
                <div class="syllabus-toggle">
                    <i class="fas fa-chevron-down"></i>
                </div>
            `;
            
            // Hafta içeriği
            const weekContent = document.createElement('div');
            weekContent.className = 'syllabus-content';
            
            const weekInner = document.createElement('div');
            weekInner.className = 'syllabus-inner';
            
            // Her konuyu ekle
            if (week.topics && Array.isArray(week.topics)) {
                week.topics.forEach((topic, topicIndex) => {
                    const topicDiv = document.createElement('div');
                    topicDiv.className = 'syllabus-topic';
                    
                    // Konu başlığı
                    topicDiv.innerHTML = `
                        <h4><i class="${materialIcons["Konu"]}"></i> ${escapeHtml(topic.title)}</h4>
                        <p class="syllabus-topic-description">${escapeHtml(topic.description || '')}</p>
                    `;
                    
                    // Öğrenme hedefleri
                    if (topic.objectives && topic.objectives.length > 0) {
                        const objectivesDiv = document.createElement('div');
                        objectivesDiv.innerHTML = `
                            <h5><i class="${materialIcons["Öğrenme Hedefleri"]}"></i> Öğrenme Hedefleri</h5>
                            <ul>
                                ${topic.objectives.map(objective => `<li>${escapeHtml(objective)}</li>`).join('')}
                            </ul>
                        `;
                        topicDiv.appendChild(objectivesDiv);
                    }
                    
                    // Konu materyalleri - Her biri tıklanabilir
                    if (topic.materials && Object.keys(topic.materials).length > 0) {
                        // Sadece içeriği olan ve "içerik oluşturulamadı" içermeyen materyalleri filtrele ve göster
                        const availableMaterials = Object.keys(topic.materials).filter(matType => 
                            hasMaterialContent(topic.materials, matType) && 
                            !containsEmptyContentMessage(topic.materials[matType])
                        );
                        
                        if (availableMaterials.length > 0) {
                            const materialsDiv = document.createElement('div');
                            materialsDiv.className = 'syllabus-materials';
                            
                            materialsDiv.innerHTML = `
                                <h5><i class="${materialIcons["Materyaller"]}"></i> Materyaller</h5>
                                <ul class="material-list">
                                    ${availableMaterials.map(matType => 
                                      `<li class="material-item" 
                                          data-week="${weekIndex}" 
                                          data-topic="${topicIndex}" 
                                          data-material="${matType}"
                                          role="button" 
                                          title="Tıklayarak görüntüle">
                                          <i class="${findIconForMaterialType(matType)}"></i> 
                                          ${getMaterialTypeName(matType)}
                                       </li>`
                                    ).join('')}
                                    ${hasLessonPlanForWeek(weekIndex) ? 
                                      `<li class="material-item lesson-plan-btn" 
                                          data-week="${weekIndex}" 
                                          role="button" 
                                          title="Ders planlarını görüntüle">
                                          <i class="fas fa-chalkboard-teacher"></i> 
                                          Ders Planları
                                       </li>` : 
                                      `<li class="material-item lesson-plan-btn disabled" 
                                          title="Ders planları henüz oluşturulmadı">
                                          <i class="fas fa-chalkboard-teacher"></i> 
                                          Ders Planları (Yok)
                                       </li>`
                                    }
                                </ul>
                            `;
                            
                            topicDiv.appendChild(materialsDiv);
                        }
                    } else {
                        // Materyal yoksa sadece ders planı butonunu göster
                        const materialsDiv = document.createElement('div');
                        materialsDiv.className = 'syllabus-materials';
                        
                        materialsDiv.innerHTML = `
                            <h5><i class="${materialIcons["Materyaller"]}"></i> Materyaller</h5>
                            <ul class="material-list">
                                ${hasLessonPlanForWeek(weekIndex) ? 
                                  `<li class="material-item lesson-plan-btn" 
                                      data-week="${weekIndex}" 
                                      role="button" 
                                      title="Ders planlarını görüntüle">
                                      <i class="fas fa-chalkboard-teacher"></i> 
                                      Ders Planları
                                   </li>` : 
                                  `<li class="material-item lesson-plan-btn disabled" 
                                      title="Ders planları henüz oluşturulmadı">
                                      <i class="fas fa-chalkboard-teacher"></i> 
                                      Ders Planları (Yok)
                                   </li>`
                                }
                            </ul>
                        `;
                        
                        topicDiv.appendChild(materialsDiv);
                    }
                    
                    // Haftalık Ödevler
                    if (topic.assignments && Array.isArray(topic.assignments) && topic.assignments.length > 0) {
                        const assignmentsDiv = document.createElement('div');
                        assignmentsDiv.className = 'syllabus-assignments';
                        
                        assignmentsDiv.innerHTML = `
                            <h5><i class="fas fa-tasks"></i> Haftalık Ödevler</h5>
                            <ul>
                                ${topic.assignments.map(assignment => `<li>${escapeHtml(assignment)}</li>`).join('')}
                            </ul>
                        `;
                        
                        topicDiv.appendChild(assignmentsDiv);
                    }
                    
                    weekInner.appendChild(topicDiv);
                });
            }
            
            weekContent.appendChild(weekInner);
            weekSection.appendChild(weekHeader);
            weekSection.appendChild(weekContent);
            
            DOMElements.syllabusResultDiv.appendChild(weekSection);
        });
        
        // İlk haftayı varsayılan olarak açık göster
        if (DOMElements.syllabusResultDiv.firstChild) {
            DOMElements.syllabusResultDiv.firstChild.classList.add('active');
        }
        
        DOMElements.syllabusResultDiv.style.display = 'flex';
        
        // Materyal öğelerine tıklamayı iyileştirmek için CSS ekle
        addMaterialItemStyles();
        
        // Tamamlama animasyonu
        const completionAnimation = () => {
            const sections = DOMElements.syllabusResultDiv.querySelectorAll('.syllabus-section');
            sections.forEach((section, index) => {
                setTimeout(() => {
                    section.style.opacity = '0.5';
                    setTimeout(() => {
                        section.style.opacity = '1';
                    }, 300);
                }, index * 150);
            });
        };
        
        // Hafif bir tamamlama animasyonu göster
        setTimeout(completionAnimation, 500);
    }

    // İçeriğin "içerik oluşturulamadı" veya benzeri bir mesaj içerip içermediğini kontrol et
    function containsEmptyContentMessage(content) {
        if (typeof content === 'string') {
            const lowerContent = content.toLowerCase();
            return lowerContent.includes("içerik oluşturulamadı") || 
                   lowerContent.includes("bu materyal için içerik bulunamadı") ||
                   lowerContent.includes("içerik bulunamadı") ||
                   lowerContent.includes("materyal oluşturulamadı");
        } else if (Array.isArray(content) && content.length === 0) {
            return true;
        }
        return false;
    }
        
    function addMaterialItemStyles() {
        // Eğer bu stil daha önce eklendiyse tekrar ekleme
        if (document.getElementById('material-items-style')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'material-items-style';
        styleElement.textContent = `
            .material-item {
                cursor: pointer;
                transition: all var(--transition-fast);
                border: 1px solid var(--color-gray-300);
            }
            
            .material-item:hover {
                background-color: var(--color-primary-light);
                color: var(--color-white);
                border-color: var(--color-primary);
                transform: translateY(-2px);
                box-shadow: var(--shadow-sm);
            }
            
            .dark-mode .material-item:hover {
                background-color: var(--color-primary);
                border-color: var(--color-primary-light);
            }
            
            .material-item:hover i {
                color: var(--color-white);
            }
        `;
        
        document.head.appendChild(styleElement);
    }

    // Materyal türü için ikon bul
    function findIconForMaterialType(materialType) {
        const iconMap = {
            'summary': materialIcons["Ünite Özeti"],
            'flashcards': materialIcons["Flash Kartlar"],
            'key-concepts': materialIcons["Anahtar Kavramlar Listesi"],
            'powerpoint': materialIcons["PowerPoint İçeriği"],
            'quiz': materialIcons["Çoktan Seçmeli"],
            'short-answer': materialIcons["Kısa Cevaplı Sorular"],
            'fill-blanks': materialIcons["Boşluk Doldurma Cümleleri"],
            'true-false': materialIcons["Doğru/Yanlış İfadeleri"],
            'cause-effect': materialIcons["Neden-Sonuç İlişkileri"],
            'compare': materialIcons["Karşılaştırma Soruları"],
            'pros-cons': materialIcons["Avantajlar ve Dezavantajlar"],
            'concept-map': materialIcons["Kavram Haritası Öğeleri"],
            'real-world': materialIcons["Gerçek Hayat Örnekleri / Analojiler"],
            'metaphor': materialIcons["Metafor / Benzetme Oluşturma"],
            'case-study': materialIcons["Mini Vaka Analizi / Senaryo"],
            'prediction': materialIcons["Tahmin Soruları"],
            'discussion': materialIcons["Tartışma Soruları"],
            'acronym': materialIcons["Akronim Oluşturma"],
            'objectives': materialIcons["Öğrenme Hedefleri"],
            'assessment': materialIcons["Değerlendirme"],
            'activities': "fas fa-clipboard-list"
        };
        
        return iconMap[materialType] || materialIcons["Diğer"];
    }

    function addResultCard(title, content, type = 'default', specificIcon = null) {
        let cardElement;
        let iconClass = specificIcon || findIconForTitle(title) || materialIcons["Diğer"];
        try {
            if (type === 'flashcards') { 
                iconClass = materialIcons["Flash Kartlar"]; 
                // Basitleştirilmiş Flash Kart işlemi
                const cards = parseFlashcardContent(content);
                if (cards.length > 0) {
                    cardElement = createFlashcardElement(title, content, iconClass);
                } else {
                    // Kart verisi yoksa standart kart oluştur
                    cardElement = createMaterialCard(title, content, iconClass);
                }
            }
            else { 
                cardElement = createMaterialCard(title, content, iconClass); 
            }
            
            if (cardElement && DOMElements.resultDiv) {
                 DOMElements.resultDiv.appendChild(cardElement);
                 // PDF için ham içeriği sakla (formatlama PDF oluştururken yapılacak)
                 currentMaterialsData.push({ title: title, content: content, type: type });
            }
        } catch (error) { 
            console.error(`'${title}' başlıklı kart oluşturulurken hata:`, error); 
            displayErrorCard(`Kart Hatası (${title})`, `Bu materyal görüntülenirken bir hata oluştu: ${error.message}`); 
        }
    }

    function createMaterialCard(title, content, iconClass) { 
        const card = document.createElement('div'); 
        card.className = 'material-card'; 
        card.setAttribute('data-aos', 'fade-up'); 
        const header = document.createElement('div'); 
        header.className = 'material-card-header'; 
        header.innerHTML = `<i class="${iconClass}"></i> ${escapeHtml(title)}`; 
        const contentDiv = document.createElement('div'); 
        contentDiv.className = 'material-card-content'; 
        contentDiv.innerHTML = formatAIResponseToHTML(content); 
        const actions = createCardActions(content); 
        card.appendChild(header); 
        card.appendChild(contentDiv); 
        card.appendChild(actions); 
        return card; 
    }

    /**
     * Flash kartları ayırarak veri yapısına dönüştürür
     * @param {string} content - Flash kart içeriği
     * @returns {Array} - {term, definition} nesnelerinden oluşan dizi
     */
    
    function parseFlashcardContent(content) {
        if (typeof content !== 'string') {
            return [{ term: "Veri Hatası", definition: "İçerik geçerli bir metin değil." }];
        }
        
        const cards = [];
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        let currentTerm = "";
        let currentDefinition = "";
        
        lines.forEach(line => {
            // Başlıca iki format kontrolü: "Terim: Tanım" veya "- Terim: Tanım"
            const cleanLine = line.replace(/^-\s+/, '').trim();
            const separatorIndex = cleanLine.indexOf(':');
            
            if (separatorIndex > 0) {
                // Önceki kartı ekle (eğer varsa)
                if (currentTerm && currentDefinition) {
                    cards.push({ 
                        term: currentTerm.replace(/\*\*/g, ''), 
                        definition: currentDefinition 
                    });
                }
                
                // Yeni kartı hazırla
                currentTerm = cleanLine.substring(0, separatorIndex).trim();
                currentDefinition = cleanLine.substring(separatorIndex + 1).trim();
            } else if (currentDefinition) {
                // Muhtemelen önceki tanımın devamı
                currentDefinition += "\n" + line.trim();
            }
        });
        
        // Son kartı ekle (eğer varsa)
        if (currentTerm && currentDefinition) {
            cards.push({ 
                term: currentTerm.replace(/\*\*/g, ''), 
                definition: currentDefinition 
            });
        }
        
        return cards.length > 0 ? cards : [
            { term: "Örnek Terim", definition: "Bu kart varsayılan olarak oluşturuldu." }
        ];
    }
    
    /**
     * Tek bir flash kart için HTML oluşturur
     * @param {Object} cardData - Kart verisi
     * @param {number} index - Kart indeksi
     * @returns {string} - HTML içeriği
     */
    function createFlashcardElement(title, content, iconClass) {
        // Flash kartları ayır
        const cardData = parseFlashcardContent(content);
        
        // Ana konteyner
        const container = document.createElement('div');
        container.className = 'material-card flashcard-container';
        container.setAttribute('data-aos', 'fade-up');
        
        // Kart başlığı
        const header = document.createElement('div');
        header.className = 'material-card-header';
        header.innerHTML = `<i class="${iconClass}"></i> Flash Kartlar (${cardData.length} adet)`;
        
        // Ultra basit flash kart içeriği
        let cardsHTML = '<div class="ultra-simple-cards">';
        
        cardData.forEach((card, index) => {
            cardsHTML += `
                <div class="ultra-card">
                    <div class="ultra-card-number">${index + 1}</div>
                    <div class="ultra-card-content">
                        <p><strong>Terim:</strong> ${escapeHtml(card.term)}</p>
                        <p><strong>Açıklama:</strong> ${formatSimpleDefinition(card.definition)}</p>
                    </div>
                </div>
            `;
        });
        
        cardsHTML += '</div>';
        
        // Action alanını ekle
        const actions = createCardActions(content);
        
        // CSS ekle
        const style = document.createElement('style');
        style.textContent = `
            .ultra-simple-cards {
                display: flex;
                flex-direction: column;
                gap: 20px;
                padding: 15px 0;
            }
            .ultra-card {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 15px;
                background-color: #fff;
                position: relative;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .ultra-card-number {
                position: absolute;
                top: -10px;
                left: -10px;
                width: 30px;
                height: 30px;
                background-color: #00867d;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
            }
            .ultra-card-content {
                line-height: 1.6;
            }
            .ultra-card-content p {
                margin-bottom: 8px;
            }
            .ultra-card-content p:last-child {
                margin-bottom: 0;
            }
            .ultra-card-content strong {
                color: #00695c;
                font-weight: 600;
            }
            
            /* Dark mode */
            .dark-mode .ultra-card {
                background-color: #333;
                border-color: #555;
            }
            .dark-mode .ultra-card-content {
                color: #e0e0e0;
            }
            .dark-mode .ultra-card-content strong {
                color: #4db6ac;
            }
        `;
        
        // Tüm elementleri konteyner'a ekle
        container.appendChild(header);
        
        const content_div = document.createElement('div');
        content_div.className = 'material-card-content';
        content_div.innerHTML = cardsHTML;
        container.appendChild(content_div);
        
        container.appendChild(style);
        container.appendChild(actions);
        
        // Oluşturulan DOM elementini döndür
        return container;
    }

    // ============================================================================
    // API ve Prompt Fonksiyonları
    // ============================================================================
    
    /**
     * Kullanıcı promptunu oluşturur
     */
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

    /**
     * İzlence promptunu oluşturur
     */
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

    /**
     * API'ye istek gönderir
     */
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

        const response = await fetch(API_URL, {
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

    /**
     * İzlence için materyal oluşturur
     */
    async function generateMaterialsForSyllabus(syllabusData, mainTopic) {
        // Loading state'i güncelle
        loadingIntervals = startLoadingAnimation(false, true, 'materials');
        
        for (let weekIndex = 0; weekIndex < syllabusData.weeks.length; weekIndex++) {
            const week = syllabusData.weeks[weekIndex];
            
            for (let topicIndex = 0; topicIndex < week.topics.length; topicIndex++) {
                const topic = week.topics[topicIndex];
                
                if (DOMElements.loadingMessage) {
                    DOMElements.loadingMessage.textContent = `${topic.title} için materyaller oluşturuluyor...`;
                }
                
                try {
                    // Bu konu için uygun materyal türlerini belirle
                    const suitableMaterials = await determineSuitableMaterials(
                        topic.title, 
                        topic.description, 
                        topic.objectives
                    );
                    
                    // Her materyal türü için içerik oluştur
                    for (const materialType of suitableMaterials) {
                        try {
                            const materialPrompt = createMaterialPrompt(topic.title, topic.description, materialType, mainTopic);
                            const materialResponse = await fetchAIResponse(materialPrompt, materialType);
                            
                            if (materialResponse.rawGeneratedText) {
                                // Materyal türüne göre içeriği işle
                                const processedContent = processMaterialContent(materialResponse.rawGeneratedText, materialType);
                                topic.materials[materialType] = processedContent;
                            }
                            
                            // API sınırlaması için kısa bekleme
                            await new Promise(resolve => setTimeout(resolve, 200));
                        } catch (error) {
                            console.error(`${materialType} materyali oluşturma hatası:`, error);
                            topic.materials[materialType] = "Bu materyal için içerik oluşturulamadı.";
                        }
                    }
                } catch (error) {
                    console.error(`Konu materyali oluşturma hatası:`, error);
                }
            }
            
            // İlerleme çubuğunu güncelle
            const progress = ((weekIndex + 1) / syllabusData.weeks.length) * 85;
            if (DOMElements.progressBar) {
                DOMElements.progressBar.style.width = `${progress}%`;
            }
        }
        
        // Completion state'e geç
        stopLoadingAnimation(loadingIntervals);
        loadingIntervals = startLoadingAnimation(false, true, 'completion');
        
        // Biraz bekle ve completion'ı bitir
        await new Promise(resolve => setTimeout(resolve, 1000));
        stopLoadingAnimation(loadingIntervals);
    }

    /**
     * Tek bir materyal için prompt oluşturur
     */
    function createMaterialPrompt(topicTitle, topicDescription, materialType, mainTopic) {
        const basePrompt = `"${mainTopic}" ana konusundaki "${topicTitle}" alt konusu için `;
        
        const materialPrompts = {
            'summary': `${basePrompt}kısa ve öz bir özet oluştur. ${topicDescription}`,
            'flashcards': `${basePrompt}5-6 flash kart oluştur. Format: **Terim:** Tanım`,
            'key-concepts': `${basePrompt}en önemli 5-7 anahtar kavramı listele.`,
            'quiz': `${basePrompt}4-5 çoktan seçmeli soru oluştur.`,
            'short-answer': `${basePrompt}3-4 kısa cevaplı soru oluştur.`,
            'true-false': `${basePrompt}5-6 doğru/yanlış ifadesi oluştur.`,
            'fill-blanks': `${basePrompt}4-5 boşluk doldurma cümlesi oluştur.`,
            'real-world': `${basePrompt}gerçek hayat örnekleri ver.`,
            'discussion': `${basePrompt}tartışma soruları oluştur.`
        };
        
        return materialPrompts[materialType] || materialPrompts['summary'];
    }

    /**
     * Materyal içeriğini işler
     */
    function processMaterialContent(content, materialType) {
        if (materialType === 'flashcards') {
            // Flash kartları parse et
            return parseFlashcardContent(content);
        } else if (materialType === 'quiz') {
            // Quiz sorularını parse et
            return parseQuizContent(content);
        } else if (materialType === 'key-concepts') {
            // Anahtar kavramları parse et
            return parseKeyConceptsContent(content);
        }
        
        return content; // Diğer türler için ham içeriği döndür
    }

    /**
     * Quiz içeriğini parse eder
     */
    function parseQuizContent(content) {
        const questions = [];
        const questionBlocks = content.split(/\d+\.\s+/).filter(block => block.trim());
        
        questionBlocks.forEach(block => {
            const lines = block.trim().split('\n').filter(line => line.trim());
            if (lines.length === 0) return;
            
            const questionText = lines[0].trim();
            const options = [];
            let correctAnswer = 0;
            
            lines.slice(1).forEach((line, index) => {
                if (line.match(/^[a-d]\)/i)) {
                    const optionText = line.replace(/^[a-d]\)\s*/i, '').trim();
                    options.push(optionText);
                    
                    // Doğru cevap işaretini kontrol et
                    if (line.includes('*') || line.includes('✓') || line.toLowerCase().includes('doğru')) {
                        correctAnswer = options.length - 1;
                    }
                }
            });
            
            if (questionText && options.length >= 3) {
                questions.push({
                    question: questionText,
                    options: options,
                    answer: correctAnswer
                });
            }
        });
        
        return questions;
    }

    /**
     * Anahtar kavramları parse eder
     */
    function parseKeyConceptsContent(content) {
        const concepts = [];
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
                const concept = line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim();
                if (concept) {
                    concepts.push(concept);
                }
            }
        });
        
        return concepts.length > 0 ? concepts : [content];
    }

    /**
     * JSON temizleme ve parse etme
     */
    function cleanAndParseJSON(rawText) {
        try {
            // İlk olarak düz JSON parse dene
            const parsed = JSON.parse(rawText);
            return { success: true, data: parsed, fixed: false, isDefault: false };
        } catch (error) {
            console.log("Düz JSON parse başarısız, temizleme deneniyor...");
        }
        
        try {
            // Markdown kod bloklarını kaldır
            let cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
            
            // Baş ve sondaki gereksiz karakterleri kaldır
            cleaned = cleaned.trim();
            
            // JSON'ın başını ve sonunu bul
            const jsonStart = cleaned.indexOf('{');
            const jsonEnd = cleaned.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
            }
            
            // Parse dene
            const parsed = JSON.parse(cleaned);
            return { success: true, data: parsed, fixed: true, isDefault: false };
        } catch (error) {
            console.error("JSON temizleme de başarısız:", error);
            
            // Varsayılan izlence yapısı döndür
            const defaultSyllabus = createDefaultSyllabus(currentTopic, selectedWeeksCount);
            return { success: true, data: defaultSyllabus, fixed: false, isDefault: true };
        }
    }

    /**
     * Varsayılan izlence oluşturur
     */
    function createDefaultSyllabus(topic, weeksCount) {
        const weeks = [];
        
        for (let i = 1; i <= weeksCount; i++) {
            weeks.push({
                title: `Hafta ${i}: ${topic} - Bölüm ${i}`,
                topics: [{
                    title: `${topic} Temel Konuları`,
                    description: `Bu hafta ${topic} konusunun temel prensiplerini öğreneceğiz.`,
                    objectives: [
                        `${topic} konusunun temel kavramlarını anlayabilme`,
                        "Konuyla ilgili örnekleri verebilme",
                        "Temel problemleri çözebilme"
                    ],
                    materials: {},
                    assignments: [
                        "Ders notlarını gözden geçirme",
                        "Konu ile ilgili araştırma yapma"
                    ]
                }]
            });
        }
        
        return { weeks: weeks };
    }

    // ============================================================================
    // Kart Aksiyon ve Yardımcı Fonksiyonlar
    // ============================================================================
    
    function createCardActions(content) {
        const actions = document.createElement('div');
        actions.className = 'material-card-actions';
        actions.innerHTML = `
            <button class="btn-card-action btn-copy-single">
                <i class="fas fa-copy"></i> <span>Kopyala</span>
            </button>
        `;
        return actions;
    }

    function copyToClipboard(text, button) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                updateCopyButtonState(button, true);
            }).catch(() => {
                fallbackCopyToClipboard(text, button);
            });
        } else {
            fallbackCopyToClipboard(text, button);
        }
    }

    function fallbackCopyToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            updateCopyButtonState(button, true);
        } catch (err) {
            console.error('Clipboard kopyalama hatası:', err);
            updateCopyButtonState(button, false);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    function updateCopyButtonState(button, success) {
        if (!button) return;
        
        const icon = button.querySelector('i');
        const span = button.querySelector('span');
        
        if (success) {
            icon.className = 'fas fa-check';
            span.textContent = 'Kopyalandı';
            button.style.color = 'var(--color-success)';
        } else {
            icon.className = 'fas fa-exclamation-triangle';
            span.textContent = 'Hata';
            button.style.color = 'var(--color-danger)';
        }
        
        setTimeout(() => {
            icon.className = 'fas fa-copy';
            span.textContent = 'Kopyala';
            button.style.color = '';
        }, 2000);
    }

    function copyAllContent() {
        let allContent = `${currentTopic} - EduNomo AI Tarafından Oluşturuldu\n`;
        allContent += "=".repeat(50) + "\n\n";
        
        if (currentMaterialsData.length > 0) {
            currentMaterialsData.forEach((material, index) => {
                allContent += `${index + 1}. ${material.title}\n`;
                allContent += "-".repeat(30) + "\n";
                allContent += `${material.content}\n\n`;
            });
        }
        
        if (currentSyllabusData.length > 0) {
            allContent += "İZLENCE\n";
            allContent += "=".repeat(20) + "\n\n";
            
            currentSyllabusData.forEach((week, weekIndex) => {
                allContent += `${week.title}\n`;
                allContent += "-".repeat(week.title.length) + "\n";
                
                week.topics.forEach(topic => {
                    allContent += `\nKonu: ${topic.title}\n`;
                    allContent += `Açıklama: ${topic.description}\n`;
                    allContent += `Hedefler: ${topic.objectives.join(', ')}\n`;
                    allContent += `Ödevler: ${topic.assignments.join(', ')}\n`;
                });
                
                allContent += "\n";
            });
        }
        
        copyToClipboard(allContent, DOMElements.btnCopyAll);
    }

    function formatAIResponseToHTML(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    function setGenerateButtonState(isLoading, isDisabled = false) {
        if (!DOMElements.btnGenerate) return;
        
        if (isLoading) {
            DOMElements.btnGenerate.disabled = true;
            DOMElements.btnGenerate.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Oluşturuluyor...</span>';
        } else if (isDisabled) {
            DOMElements.btnGenerate.disabled = true;
            DOMElements.btnGenerate.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>API Hatası</span>';
        } else {
            DOMElements.btnGenerate.disabled = false;
            const buttonText = isSyllabusMode ? 'İzlence Oluştur' : 'Materyali Oluştur';
            const buttonIcon = isSyllabusMode ? 'fas fa-calendar-alt' : 'fas fa-wand-magic-sparkles';
            DOMElements.btnGenerate.innerHTML = `<i class="${buttonIcon}"></i> <span>${buttonText}</span>`;
        }
    }

    function displayErrorCard(title, message, type = 'error', icon = 'fas fa-exclamation-triangle', isApiError = false) {
        const errorCard = createMaterialCard(title, message, icon);
        errorCard.classList.add(`${type}-message`);
        if (isApiError) errorCard.classList.add('api-error-card');
        
        if (DOMElements.resultDiv) {
            DOMElements.resultDiv.appendChild(errorCard);
        }
    }

    function displayInfoCard(title, message, type = 'info', icon = 'fas fa-info-circle') {
        displayErrorCard(title, message, type, icon);
    }

    function hasMaterialContent(materials, materialType) {
        const content = materials[materialType];
        if (!content) return false;
        
        if (typeof content === 'string') {
            return content.trim().length > 10;
        } else if (Array.isArray(content)) {
            return content.length > 0;
        } else if (typeof content === 'object') {
            return Object.keys(content).length > 0;
        }
        
        return false;
    }

    function navigateFlashcard(container, direction) {
        // Ana ekrandaki flash kart navigasyonu için placeholder
        console.log(`Navigating flashcard ${direction} in`, container);
    }

    // ============================================================================
    // Uygulama Başlatma
    // ============================================================================
    initializeApp();
});