// URL base para las imágenes
const BASE_URL = 'https://247consultores.pe/angelly/PINKI/';

// Variables globales
let allImages = [];
let carouselTrack = null;
let currentIndex = 0;
let isAnimating = false;
let autoPlayInterval = null;

// Variables del sistema de cotizaciones
let quote = [];
let contactData = {};

// Elementos del DOM
const calculatorIcon = document.getElementById('calculatorIcon');
const calculatorCount = document.getElementById('calculatorCount');
const quoteModal = document.getElementById('quoteModal');
const quoteEmpty = document.getElementById('quoteEmpty');
const quoteModalFooter = document.getElementById('quoteModalFooter');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    console.log('=== SCRIPT VERSIÓN LIMPIA CARGADO ===');
    showLoading();
    
    // Inicializar elementos del DOM
    carouselTrack = document.getElementById('carouselTrack');
    
    // Simular carga inicial
    setTimeout(async () => {
        try {
        // Generar menú de productos
        generateProductsMenu();
        
        // Recopilar todas las imágenes
        await collectAllImages();
        
        // Cargar dinámicamente todas las carpetas y crear galerías
        await loadDynamicFolders();
        
        // Inicializar carrusel
        initializeCarousel();
        
        // Configurar navegación por categorías
        setupCategoryNavigation();
        
        // Configurar filtros
        setupFilters();
        
        // Función de prueba
        testButtons();
        
        // Inicializar sistema de cotizaciones
        initializeQuote();
        
        // Inicializar modal de imagen
        initializeImageModal();
        
        // Inicializar modales de contacto y vista previa
        initializeContactModals();
        
        hideLoading();
        
        console.log('=== INICIALIZACIÓN COMPLETADA ===');
        } catch (error) {
            console.error('Error en inicialización:', error);
            hideLoading();
        }
    }, 1000);
}

function setupEventListeners() {
    // Event listeners para el carrusel
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const reloadBtn = document.getElementById('carouselReload');
    
    if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));
    if (reloadBtn) reloadBtn.addEventListener('click', reloadCarousel);
    
    // Event listeners para el sistema de cotizaciones
    if (calculatorIcon) {
        calculatorIcon.addEventListener('click', openQuoteModal);
    }
    
    // Event listeners para modales
    const closeButtons = document.querySelectorAll('.quote-close, .image-modal-close, .contact-close, .preview-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.quote-modal, .image-modal, .contact-modal, .preview-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Cerrar modales al hacer click fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('quote-modal')) {
            closeQuoteModal();
        }
        if (e.target.classList.contains('image-modal')) {
            closeImageModal();
        }
        if (e.target.classList.contains('contact-modal')) {
            closeContactModal();
        }
        if (e.target.classList.contains('preview-modal')) {
            closePreviewModal();
        }
    });
}

// Funciones del carrusel
async function collectAllImages() {
    allImages = [];
    
    // Cargar dinámicamente las imágenes de PASARELLA
    await loadPasarelaImages();
    
    console.log('Total de imágenes de pasarela:', allImages.length);
    console.log('Imágenes de pasarela:', allImages.map(img => img.name));
    console.log('Rutas de imágenes:', allImages.map(img => img.path));
    
    // Mezclar imágenes aleatoriamente
    allImages = shuffleArray(allImages);
}

// Función para cargar dinámicamente las imágenes de PASARELLA
async function loadPasarelaImages() {
    console.log('🖼️ Cargando imágenes de PASARELLA desde JSON...');
    
    try {
        // Cargar desde el archivo JSON
        const jsonUrl = 'https://247consultores.pe/angelly/PINKI/images.json';
        console.log('📄 Cargando JSON desde:', jsonUrl);
        
        const response = await fetch(jsonUrl);
        console.log('📊 Respuesta del JSON:', response.status, response.statusText);
        
        if (response.ok) {
            const imagesData = await response.json();
            console.log('✅ JSON cargado exitosamente');
            
            if (imagesData.PASARELLA && imagesData.PASARELLA.length > 0) {
                console.log('🖼️ Imágenes de PASARELLA encontradas:', imagesData.PASARELLA.length);
                
                allImages = imagesData.PASARELLA.map(imageName => {
                    const path = `https://247consultores.pe/angelly/PINKI/PASARELLA/${imageName}`;
                    console.log('✅ Imagen cargada:', imageName, '->', path);
                    return {
                        name: imageName,
                        path: path,
                        category: 'PASARELLA',
                        subcategory: null
                    };
                });
                
                console.log('✅ Total de imágenes de pasarela cargadas:', allImages.length);
            } else {
                console.log('❌ No se encontraron imágenes de PASARELLA en el JSON');
                allImages = [];
            }
        } else {
            console.log('❌ Error cargando JSON:', response.status);
            allImages = [];
        }
    } catch (error) {
        console.log('❌ Error cargando PASARELLA desde JSON:', error);
        allImages = [];
    }
    
    console.log('🎯 Imágenes finales de pasarela:', allImages.length);
    initializeCarousel();
}

// Función para cargar dinámicamente todas las carpetas y crear galerías
async function loadDynamicFolders() {
    console.log('🔍 Cargando productos desde archivo JSON...');
    
    try {
        // Intentar cargar desde el archivo JSON
        const jsonUrl = 'https://247consultores.pe/angelly/PINKI/images.json';
        console.log('📄 Cargando desde:', jsonUrl);
        
        const response = await fetch(jsonUrl);
        console.log('📊 Respuesta del JSON:', response.status, response.statusText);
        
        if (response.ok) {
            const imagesData = await response.json();
            console.log('✅ JSON cargado exitosamente:', imagesData);
            console.log('📋 Carpetas disponibles:', Object.keys(imagesData));
            
            let galleriesCreated = 0;
            
            // Crear galerías para cada carpeta
            for (const [folderName, images] of Object.entries(imagesData)) {
                console.log(`🔍 Procesando carpeta: ${folderName}`);
                console.log(`📊 Imágenes en ${folderName}:`, images);
                
                if (folderName !== 'PASARELLA' && images && images.length > 0) {
                    console.log(`🔄 Verificando existencia de imágenes para ${folderName}...`);
                    
                    // Verificar que al menos una imagen existe
                    const testImageUrl = `https://247consultores.pe/angelly/PINKI/${folderName}/${images[0]}`;
                    console.log(`🔍 Probando imagen: ${testImageUrl}`);
                    
                    try {
                        const testResponse = await fetch(testImageUrl, { method: 'HEAD' });
                        console.log(`📊 Respuesta de prueba para ${folderName}:`, testResponse.status);
                        
                        if (testResponse.ok) {
                            console.log(`✅ Imágenes de ${folderName} existen, creando galería con ${images.length} imágenes`);
                            
                            const imageObjects = images.map(imageName => ({
                                name: imageName,
                                path: `https://247consultores.pe/angelly/PINKI/${folderName}/${imageName}`,
                                category: folderName,
                                subcategory: null
                            }));
                            
                            console.log(`🖼️ Objetos de imagen para ${folderName}:`, imageObjects);
                            
                            createGallerySection(folderName, imageObjects);
                            galleriesCreated++;
                            console.log(`✅ Galería creada para ${folderName}`);
                        } else {
                            console.log(`❌ Imágenes de ${folderName} no existen (${testResponse.status}), saltando...`);
                        }
                    } catch (error) {
                        console.log(`❌ Error verificando ${folderName}:`, error.message);
                        console.log(`⚠️ Saltando ${folderName}: error de verificación`);
                    }
                } else {
                    console.log(`⚠️ Saltando ${folderName}: ${folderName === 'PASARELLA' ? 'es PASARELLA' : 'sin imágenes o array vacío'}`);
                }
            }
            
            console.log(`✅ Total de galerías creadas: ${galleriesCreated}`);
            
            if (galleriesCreated === 0) {
                console.log('⚠️ No se encontraron carpetas con imágenes en el JSON.');
            }
        } else {
            console.log('❌ Error cargando JSON:', response.status);
            console.log('💡 Asegúrate de que el archivo images.json esté subido al servidor');
        }
    } catch (error) {
        console.log('❌ Error cargando desde JSON:', error);
        console.log('💡 Verifica que el archivo images.json esté en: https://247consultores.pe/angelly/PINKI/images.json');
    }
}

// Función para crear galería para una carpeta específica
async function createGalleryForFolder(folderName) {
    console.log(`📁 === INICIANDO CARPETA: ${folderName} ===`);
    
    const folderUrl = 'https://247consultores.pe/angelly/PINKI/' + folderName + '/';
    console.log('🔗 URL completa:', folderUrl);
    
    try {
        console.log('📡 Enviando petición...');
        const response = await fetch(folderUrl);
        console.log('📊 Respuesta del servidor:', response.status, response.statusText);
        
        if (response.ok) {
            console.log('✅ Respuesta exitosa, procesando HTML...');
            const html = await response.text();
            console.log('📄 Longitud del HTML:', html.length, 'caracteres');
            console.log('📄 Primeros 1000 caracteres:', html.substring(0, 1000));
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Buscar todos los enlaces
            const allLinks = doc.querySelectorAll('a[href]');
            console.log('🔗 Total de enlaces encontrados:', allLinks.length);
            
            // Mostrar todos los enlaces para debugging
            Array.from(allLinks).forEach((link, index) => {
                console.log(`🔗 Enlace ${index + 1}:`, link.textContent.trim(), '->', link.href);
            });
            
            // Buscar enlaces de imágenes
            const imageLinks = doc.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"], a[href$=".webp"]');
            console.log('🖼️ Enlaces de imagen encontrados:', imageLinks.length);
            
            // Mostrar todas las imágenes encontradas
            Array.from(imageLinks).forEach((link, index) => {
                console.log(`🖼️ Imagen ${index + 1}:`, link.textContent.trim(), '->', link.href);
            });
            
            const images = Array.from(imageLinks).map(link => {
                const name = link.textContent.trim();
                const path = folderUrl + name;
                console.log('✅ Imagen procesada:', name, '->', path);
                return {
                    name: name,
                    path: path,
                    category: folderName,
                    subcategory: null
                };
            });
            
            if (images.length > 0) {
                console.log(`🎯 Creando galería para ${folderName} con ${images.length} imágenes`);
                createGallerySection(folderName, images);
                console.log(`✅ Galería creada exitosamente para ${folderName}`);
                return true; // Éxito
            } else {
                console.log(`❌ No se encontraron imágenes en ${folderName}`);
                return false; // No hay imágenes
            }
        } else {
            console.log(`❌ Error del servidor para ${folderName}:`, response.status, response.statusText);
            return false; // Error de acceso
        }
    } catch (error) {
        console.log(`❌ Error de conexión para ${folderName}:`, error.message);
        return false; // Error de conexión
    }
}

// Función para crear la sección HTML de la galería
function createGallerySection(folderName, images) {
    console.log(`🏗️ Creando sección de galería para: ${folderName}`);
    console.log(`📊 Número de imágenes: ${images.length}`);
    
    const productsContainer = document.querySelector('.products-container');
    console.log('📦 Products container encontrado:', productsContainer);
    
    if (!productsContainer) {
        console.log('❌ No se encontró .products-container');
        return;
    }
    
    // Crear sección de galería
    const gallerySection = document.createElement('div');
    gallerySection.className = 'gallery-section';
    gallerySection.innerHTML = `
        <div class="section-title-bar">
            <h2>${folderName}</h2>
        </div>
        <div class="gallery-grid" id="gallery-${folderName.toLowerCase()}">
            ${images.map(image => `
                <div class="gallery-item" onclick="openImageModal('${image.path}', '${image.name}', '${image.category}', '')">
                    <img src="${image.path}" alt="${image.name}" loading="lazy">
                    <div class="gallery-item-info">
                        <h3>${image.name.replace(/\.(JPG|jpg|jpeg|png|gif|webp)$/i, '')}</h3>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    console.log('🎨 HTML de galería creado:', gallerySection.innerHTML.substring(0, 200) + '...');
    
    // Agregar al products container
    console.log('📍 Agregando galería al products container');
    productsContainer.appendChild(gallerySection);
    
    console.log(`✅ Galería ${folderName} agregada al DOM`);
    
    // Verificar que se agregó correctamente
    const addedSection = document.querySelector(`#gallery-${folderName.toLowerCase()}`);
    console.log(`🔍 Sección agregada verificada:`, addedSection ? 'SÍ' : 'NO');
    
    // Verificar que las imágenes se cargan
    setTimeout(() => {
        const images = addedSection?.querySelectorAll('img');
        console.log(`🖼️ Imágenes en ${folderName}:`, images?.length || 0);
        if (images) {
            images.forEach((img, index) => {
                console.log(`🖼️ Imagen ${index + 1}:`, img.src, img.complete ? '✅' : '⏳');
            });
        }
    }, 1000);
}

// Funciones del carrusel
function initializeCarousel() {
    if (!carouselTrack) {
        console.error('carouselTrack no encontrado');
        return;
    }
    
    console.log('Inicializando carrusel con', allImages.length, 'imágenes');
    
    // Generar HTML del carrusel
    const carouselHTML = allImages.map((image, index) => `
        <div class="carousel-item" onclick="openImageModal('${image.path}', '${image.name}', 'PASARELLA', '')">
            <img src="${image.path}" alt="${image.name}" onerror="console.log('Error cargando:', this.src)">
            <div class="carousel-item-info">
                <h3>${image.name.replace(/\.(JPG|jpg|jpeg|png|gif|webp)$/i, '')}</h3>
                    </div>
                </div>
    `).join('');
    
    carouselTrack.innerHTML = carouselHTML;
    console.log('Carrusel HTML generado');
    
    // Iniciar autoplay
    startAutoPlay();
}

function moveCarousel(direction) {
    if (isAnimating || allImages.length === 0) return;
    
    isAnimating = true;
    currentIndex += direction;
    
    if (currentIndex >= allImages.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = allImages.length - 1;
    }
    
    updateCarousel();
    isAnimating = false;
}

function updateCarousel() {
    if (!carouselTrack || allImages.length === 0) return;
    
    // Calcular el ancho de cada elemento incluyendo el gap
    const itemWidth = 350; // min-width del carousel-item
    const gap = 24; // 1.5rem = 24px
    const totalItemWidth = itemWidth + gap;
    
    // Mover solo la distancia necesaria para la siguiente imagen
    const translateX = -currentIndex * totalItemWidth;
    carouselTrack.style.transform = `translateX(${translateX}px)`;
}

function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    
    autoPlayInterval = setInterval(() => {
        moveCarousel(1);
    }, 3000);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

function reloadCarousel() {
    console.log('🔄 Recargando carrusel...');
    allImages = [];
    loadPasarelaImages();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Funciones del sistema de cotizaciones
function initializeQuote() {
    loadQuoteFromStorage();
    updateQuoteDisplay();
}

function addToQuote(imagePath, imageName, category, subcategory, quantityInput) {
    const quantity = quantityInput ? parseInt(quantityInput.value) || 50 : 50;
    
    const productName = subcategory ? `${category} - ${subcategory}` : category;
    
    const quoteItem = {
        id: Date.now(),
        name: productName,
        image: imagePath,
        category: category,
        subcategory: subcategory,
        quantity: quantity
    };
    
    quote.push(quoteItem);
    updateQuoteDisplay();
    saveQuoteToStorage();
    
    console.log('Producto agregado a cotización:', quoteItem);
}

function updateQuoteDisplay() {
    if (calculatorCount) {
        calculatorCount.textContent = quote.length;
    }
    
    if (quoteEmpty) {
        quoteEmpty.style.display = quote.length === 0 ? 'block' : 'none';
    }
    
    if (quoteModalFooter) {
        quoteModalFooter.style.display = quote.length === 0 ? 'none' : 'block';
    }
    
    renderQuoteItems();
}

function renderQuoteItems() {
    const quoteItems = document.getElementById('quoteItems');
    if (!quoteItems) return;
    
    if (quote.length === 0) {
        quoteItems.innerHTML = '<p>No hay productos en la cotización</p>';
        return;
    }
    
    quoteItems.innerHTML = quote.map(item => `
        <div class="quote-item">
            <img src="${item.image}" alt="${item.name}" class="quote-item-image">
            <div class="quote-item-details">
                <h4>${item.name}</h4>
                <p>Cantidad: ${item.quantity}</p>
            </div>
            <button onclick="removeFromQuote(${item.id})" class="quote-remove-btn">×</button>
        </div>
    `).join('');
}

function removeFromQuote(itemId) {
    quote = quote.filter(item => item.id !== itemId);
    updateQuoteDisplay();
    saveQuoteToStorage();
}

function saveQuoteToStorage() {
    localStorage.setItem('quote', JSON.stringify(quote));
}

function loadQuoteFromStorage() {
    const stored = localStorage.getItem('quote');
    if (stored) {
        quote = JSON.parse(stored);
    }
}

function openQuoteModal() {
    if (quoteModal) {
        quoteModal.style.display = 'flex';
    }
}

function closeQuoteModal() {
    if (quoteModal) {
        quoteModal.style.display = 'none';
    }
}

// Funciones del modal de imagen
function initializeImageModal() {
    // Ya está configurado en setupEventListeners
}

function openImageModal(imagePath, imageName, category, subcategory) {
    const imageModal = document.getElementById('imageModal');
    const imageModalTitle = document.getElementById('imageModalTitle');
    const imageModalImage = document.getElementById('imageModalImage');
    
    if (imageModal && imageModalTitle && imageModalImage) {
        imageModalTitle.textContent = imageName.replace(/\.(JPG|jpg|jpeg|png|gif|webp)$/i, '');
        imageModalImage.src = imagePath;
        imageModalImage.alt = imageName;
        imageModal.style.display = 'flex';
        
        showAddToQuoteSection(category, subcategory);
    }
}

function closeImageModal() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.style.display = 'none';
    }
}

function showAddToQuoteSection(category, subcategory) {
    const addToQuoteSection = document.getElementById('addToQuoteSection');
    if (addToQuoteSection) {
        addToQuoteSection.style.display = 'block';
        addToQuoteSection.innerHTML = `
            <div class="quantity-input-group">
                <label for="quantityInput" class="quantity-label">Cantidad:</label>
                <input type="number" id="quantityInput" class="quantity-input" value="50" min="1">
                            </div>
            <button class="add-to-quote-btn" onclick="addToQuoteFromModal('${category}', '${subcategory}')">
                Agregar a Cotización
            </button>
        `;
    }
}

function addToQuoteFromModal(category, subcategory) {
    const quantityInput = document.getElementById('quantityInput');
    const imageModalImage = document.getElementById('imageModalImage');
    
    if (imageModalImage && quantityInput) {
        addToQuote(imageModalImage.src, imageModalImage.alt, category, subcategory, quantityInput);
        closeImageModal();
    }
}

// Funciones de modales de contacto
function initializeContactModals() {
    // Ya está configurado en setupEventListeners
}

function openContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.style.display = 'flex';
    }
}

function closeContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.style.display = 'none';
        // Limpiar datos del formulario
        contactData = {};
    }
}

function closeContactModalKeepData() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.style.display = 'none';
        // NO limpiar contactData
    }
}

function handleContactFormSubmit() {
    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    contactData = { name, phone, email, message };
    
    closeContactModalKeepData();
    openPreviewModal();
}

function openPreviewModal() {
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        generatePreviewContent();
        previewModal.style.display = 'flex';
    }
}

function closePreviewModal() {
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        previewModal.style.display = 'none';
    }
}

function backToContactModal() {
    closePreviewModal();
    openContactModal();
}

function generatePreviewContent() {
    const contactInfo = document.getElementById('previewContactInfo');
    const productsList = document.getElementById('previewProducts');
    
    if (contactInfo) {
        contactInfo.innerHTML = `
            <h3>Información de Contacto</h3>
            <div class="contact-info-item">
                <i class="fas fa-user"></i>
                <span>${contactData.name || 'No especificado'}</span>
                            </div>
            <div class="contact-info-item">
                <i class="fas fa-phone"></i>
                <span>${contactData.phone || 'No especificado'}</span>
                        </div>
            <div class="contact-info-item">
                <i class="fas fa-envelope"></i>
                <span>${contactData.email || 'No especificado'}</span>
            </div>
            <div class="contact-info-item">
                <i class="fas fa-comment"></i>
                <span>${contactData.message || 'Sin mensaje'}</span>
        </div>
    `;
    }
    
    if (productsList) {
        productsList.innerHTML = quote.map(item => `
            <div class="preview-product-item">
                <div class="preview-product-thumbnail">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="preview-product-details">
                    <div class="preview-product-name">${item.name}</div>
                    <div class="preview-product-category">${item.category || 'Sin categoría'}</div>
                    <div class="preview-product-quantity">Cantidad: ${item.quantity}</div>
            </div>
        </div>
    `).join('');
    }
}

function sendQuote() {
    console.log('Enviando cotización...');
    alert('Función de envío en desarrollo');
}

// Funciones auxiliares
function generateProductsMenu() {
    console.log('generateProductsMenu() - función deshabilitada (menú de productos eliminado)');
}

function setupCategoryNavigation() {
    console.log('setupCategoryNavigation() - función deshabilitada');
}

function setupFilters() {
    console.log('setupFilters() - función deshabilitada');
}

function testButtons() {
    console.log('testButtons() - función deshabilitada');
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Función que faltaba
function updateQuoteItemQuantity(itemId, newQuantity) {
    const item = quote.find(item => item.id === itemId);
    if (item) {
        item.quantity = newQuantity;
        updateQuoteDisplay();
        saveQuoteToStorage();
    }
}

// Funciones globales para HTML
window.addToQuote = addToQuote;
window.updateQuoteItemQuantity = updateQuoteItemQuantity;
window.removeFromQuote = removeFromQuote;
window.showAddToQuoteSection = showAddToQuoteSection;
window.hideAddToQuoteSection = hideAddToQuoteSection;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.handleContactFormSubmit = handleContactFormSubmit;
window.openPreviewModal = openPreviewModal;
window.closePreviewModal = closePreviewModal;
window.backToContactModal = backToContactModal;
window.sendQuote = sendQuote;
window.clearQuote = () => {
    quote = [];
    updateQuoteDisplay();
    saveQuoteToStorage();
};
window.clearAllData = () => {
    quote = [];
    contactData = {};
    localStorage.clear();
    updateQuoteDisplay();
};
