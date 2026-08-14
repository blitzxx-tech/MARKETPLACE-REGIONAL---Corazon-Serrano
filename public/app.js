// Marketplace Regional - Sierra Gorda Queretana (Arte • Historia • Origen) Frontend Logic

let state = {
  productos: [],
  municipios: [],
  categorias: [],
  productores: [],
  filtroMunicipio: 'todos',
  filtroCategoria: 'todas',
  orden: 'defecto',
  busqueda: '',
  carrito: [],
  favoritos: [],
  usuario: null,
  idioma: 'es',
  costoEnvio: 0,
  pendingAddToCart: null
};

let map = null;

// Diccionario Multilingüe (ES / EN)
const translations = {
  es: {
    langBtn: 'EN',
    brandSub: 'ARTE • HISTORIA • ORIGEN',
    searchPlaceholder: 'Buscar artesanos, miel melipona, rebozos, cabañas...',
    heroBadge: 'Reserva de la Biosfera Querétaro',
    heroTitle: 'Del Corazón de la Sierra Gorda a tu Hogar',
    heroSubtitle: 'Arte • Historia • Origen. Conecta directamente con artesanos Pame, apicultores y productores locales sin intermediarios.',
    stat1Title: 'Comercio Justo',
    stat1Sub: '100% directo al artesano',
    stat2Title: '4 Municipios',
    stat2Sub: 'Mapeo geolocalizado',
    stat3Title: 'Pago Seguro',
    stat3Sub: 'Mercado Pago / Stripe',
    filterMuni: 'Filtrar por Municipio:',
    filterCat: 'Categorías:',
    catalogTitle: 'Catálogo de Productos y Experiencias',
    mapTitle: 'Mapa de Talleres y Productores',
    mapSub: 'Explora la ubicación real de los productores en Jalpan de Serra, Landa de Matamoros, Arroyo Seco y Pinal de Amoles.',
    cartHeader: 'Tu Carrito de Compras',
    trackingNav: 'Rastrear Pedido',
    wishlistNav: 'Favoritos'
  },
  en: {
    langBtn: 'ES',
    brandSub: 'ART • HISTORY • ORIGIN',
    searchPlaceholder: 'Search artisans, honey, textiles, cabins...',
    heroBadge: 'UNESCO Biosphere Reserve Querétaro',
    heroTitle: 'From the Heart of Sierra Gorda to Your Home',
    heroSubtitle: 'Art • History • Origin. Connecting directly with Pame artisans, apiculturists, and local producers across the 4 mountain municipalities.',
    stat1Title: 'Fair Trade',
    stat1Sub: '100% direct to artisan',
    stat2Title: '4 Municipalities',
    stat2Sub: 'Geo-located mapping',
    stat3Title: 'Secure Payment',
    stat3Sub: 'Mercado Pago / Stripe',
    filterMuni: 'Filter by Municipality:',
    filterCat: 'Categories:',
    catalogTitle: 'Product & Experience Catalog',
    mapTitle: 'Artisan Workshop Map',
    mapSub: 'Explore real locations of producers in Jalpan, Landa, Arroyo Seco, and Pinal de Amoles.',
    cultureBadge: 'Art • History • Origin',
    cultureTitle: 'Preserving Querétaro Cultural Heritage',
    cultureDesc: 'Every handcrafted pottery, honey jar, or embroidered textile tells the story of families protecting the forests of the Sierra Gorda.',
    cartHeader: 'Your Shopping Cart',
    trackingNav: 'Track Order',
    wishlistNav: 'Wishlist'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  loadUserSession();
  loadWishlistSession();
  renderUserHeader();
  renderHelpNavButton();
  setupEventListeners();
  
  try {
    await loadMetadata();
    await fetchProducts();
    initMap();
  } catch (err) {
    console.error("Error inicializando app:", err);
  }
}

function loadUserSession() {
  const savedUser = localStorage.getItem('sg_user');
  if (savedUser) {
    try {
      state.usuario = JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem('sg_user');
    }
  }
}

function loadWishlistSession() {
  const savedFavs = localStorage.getItem('sg_favs');
  if (savedFavs) {
    try {
      state.favoritos = JSON.parse(savedFavs);
    } catch (e) {
      state.favoritos = [];
    }
  }
  updateWishlistUI();
}

function saveWishlistSession() {
  localStorage.setItem('sg_favs', JSON.stringify(state.favoritos));
  updateWishlistUI();
}

function updateWishlistUI() {
  const countEl = document.getElementById('wishlistCount');
  if (countEl) countEl.innerText = state.favoritos.length;
}

function toggleFavorite(productId, event) {
  if (event) event.stopPropagation();
  const index = state.favoritos.indexOf(productId);
  if (index > -1) {
    state.favoritos.splice(index, 1);
    showToast('🤍 Removido de tu Lista de Favoritos.');
  } else {
    state.favoritos.push(productId);
    showToast('❤️ ¡Guardado en tu Lista de Favoritos!');
  }
  saveWishlistSession();
  renderProducts();
}

function openWishlistModal() {
  const body = document.getElementById('wishlistBody');
  if (!body) return;

  const favProducts = state.productos.filter(p => state.favoritos.includes(p.id));

  if (favProducts.length === 0) {
    body.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-muted);">
        <i class="fa-solid fa-heart-crack" style="font-size:3rem; margin-bottom:12px; color:#cbd5e1;"></i>
        <p>Aún no has guardado productos en tus favoritos.</p>
        <p style="font-size:0.8rem; margin-top:4px;">Haz clic en el icono de corazón ❤️ en cualquier artesanía para conservarla aquí.</p>
      </div>
    `;
  } else {
    let html = '<div class="product-grid">';
    favProducts.forEach(p => {
      html += `
        <div class="product-card">
          <div class="product-image-wrapper" onclick="openProductDetail(${p.id})">
            <img src="${p.imagen}" alt="${p.nombre}" class="product-image" onerror="this.src='/assets/artesania_pame_1786110469232.jpg'">
            <span class="product-badge-muni"><i class="fa-solid fa-location-dot"></i> ${p.municipio}</span>
          </div>
          <div class="product-content">
            <span class="product-artesano"><i class="fa-solid fa-hand-holding-heart"></i> ${p.artesano}</span>
            <h3 class="product-title" onclick="openProductDetail(${p.id})">${p.nombre}</h3>
            <div class="product-footer">
              <div class="product-price">$${p.precio.toLocaleString('es-MX')} <span>MXN</span></div>
              <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id}, 1); closeModal('wishlistModal');">
                <i class="fa-solid fa-plus"></i> Agregar
              </button>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    body.innerHTML = html;
  }

  openModal('wishlistModal');
}

// Renderizar el Botón de Ayuda del Header según los 3 Estados:
// 1. SIN SESIÓN: "¿Cómo Iniciar Sesión / Registrarse?"
// 2. COMPRADOR: "¿Cómo Comprar?"
// 3. VENDEDOR: "¿Cómo Vender?"
function renderHelpNavButton() {
  const btn = document.getElementById('btnOpenTutorial');
  const lbl = document.getElementById('lblHelpNav');
  if (!btn || !lbl) return;

  if (!state.usuario) {
    lbl.innerText = state.idioma === 'es' ? '¿Cómo Iniciar Sesión / Registrarse?' : 'How to Register / Login?';
    btn.title = 'Guía Fácil para Crear tu Cuenta e Iniciar Sesión';
  } else if (state.usuario.rol === 'vendedor') {
    lbl.innerText = state.idioma === 'es' ? '¿Cómo Vender?' : 'How to Sell?';
    btn.title = 'Guía Fácil de Venta para Artesanos';
  } else {
    lbl.innerText = state.idioma === 'es' ? '¿Cómo Comprar?' : 'How to Buy?';
    btn.title = 'Guía Fácil de Compra';
  }
}

// Abrir Modal de Tutorial Adaptado a los 3 Estados
function openRoleBasedTutorial() {
  const body = document.getElementById('tutorialModalBody');
  const title = document.getElementById('tutorialModalTitle');
  if (!body || !title) return;

  if (!state.usuario) {
    // ESTADO 1: SIN SESIÓN -> Guía de Iniciar Sesión / Registro
    title.innerHTML = `<i class="fa-solid fa-user-lock" style="color:var(--accent);"></i> Guía Fácil: ¿Cómo Iniciar Sesión o Registrarse?`;
    body.innerHTML = `
      <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:18px; text-align:center;">
        ¡Bienvenido a Sierra Gorda (Arte • Historia • Origen)! Crear tu cuenta o ingresar es un proceso muy fácil de 3 pasos.
      </p>

      <div class="tutorial-steps-grid">
        <div class="tutorial-card">
          <div class="tutorial-step-number">1</div>
          <i class="fa-solid fa-users tutorial-icon" style="color:var(--primary);"></i>
          <h4>1. Elige tu Tipo de Cuenta</h4>
          <p>Selecciona si deseas registrarte como <strong>Comprador/Turista</strong> para adquirir artesanías o como <strong>Vendedor/Artesano</strong> para registrar tu taller.</p>
        </div>

        <div class="tutorial-card">
          <div class="tutorial-step-number">2</div>
          <i class="fa-solid fa-id-card tutorial-icon" style="color:var(--accent);"></i>
          <h4>2. Ingresa Datos Básicos</h4>
          <p>Completa tu nombre y tu número de teléfono celular de 10 dígitos o correo electrónico.</p>
        </div>

        <div class="tutorial-card">
          <div class="tutorial-step-number">3</div>
          <i class="fa-solid fa-cart-shopping tutorial-icon" style="color:var(--primary-dark);"></i>
          <h4>3. ¡Listo para Navegar!</h4>
          <p>Una vez dentro, podrás guardar tus productos favoritos, agregar artesanías al carrito y comprar directamente.</p>
        </div>
      </div>

      <div style="text-align:center; margin-top:20px;">
        <button class="btn btn-primary" onclick="closeModal('tutorialModal'); resetAuthForms(); openModal('authModal');">
          <i class="fa-solid fa-right-to-bracket"></i> Abrir Ventana de Iniciar Sesión / Crear Cuenta Ahora
        </button>
      </div>
    `;
  } else if (state.usuario.rol === 'vendedor') {
    // ESTADO 2: VENDEDOR -> Guía de Cómo Vender
    title.innerHTML = `<i class="fa-solid fa-store" style="color:var(--accent);"></i> Guía Fácil: ¿Cómo Vender tus Artesanías?`;
    body.innerHTML = `
      <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:18px; text-align:center;">
        ¡Hola Don/Doña <strong>${state.usuario.nombre}</strong>! Esta guía está diseñada para que puedas vender tus productos de la Sierra Gorda de forma clara y sin complicaciones.
      </p>

      <div class="tutorial-steps-grid">
        <div class="tutorial-card">
          <div class="tutorial-step-number">1</div>
          <i class="fa-solid fa-plus-circle tutorial-icon" style="color:var(--primary);"></i>
          <h4>1. Publica tu Artesanía</h4>
          <p>Presiona el botón verde <strong>"Publicar"</strong> arriba en el menú. Ingresa el nombre de tu producto, precio, stock y la técnica manual de tu taller.</p>
        </div>

        <div class="tutorial-card">
          <div class="tutorial-step-number">2</div>
          <i class="fa-brands fa-whatsapp tutorial-icon" style="color:#25D366;"></i>
          <h4>2. Notificación por WhatsApp</h4>
          <p>Cada vez que un cliente te compre, te llegará un aviso automático por WhatsApp a tu celular (${state.usuario.telefono || 'registrado'}) con los datos del pedido.</p>
        </div>

        <div class="tutorial-card">
          <div class="tutorial-step-number">3</div>
          <i class="fa-solid fa-box-open tutorial-icon" style="color:var(--accent);"></i>
          <h4>3. Prepara tu Envío</h4>
          <p>Entra a <strong>"Mi Panel"</strong> en el encabezado para ver tus ventas recibidas y cambiar el estado del paquete a <em>"En Preparación"</em> o <em>"Enviado"</em>.</p>
        </div>

        <div class="tutorial-card">
          <div class="tutorial-step-number">4</div>
          <i class="fa-solid fa-building-columns tutorial-icon" style="color:var(--primary-dark);"></i>
          <h4>4. Recibe tu Dinero</h4>
          <p>El importe de tus ventas se deposita directo a tu CLABE <strong>(${state.usuario.clabe || 'Interbancaria'})</strong> sin comisiones de intermediarios.</p>
        </div>
      </div>
    `;
  } else {
    // ESTADO 3: COMPRADOR CON SESIÓN -> Guía de Cómo Comprar
    title.innerHTML = `<i class="fa-solid fa-compass" style="color:var(--accent);"></i> Guía Fácil: ¿Cómo Comprar Artesanías?`;
    body.innerHTML = `
      <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:18px; text-align:center;">
        ¡Hola <strong>${state.usuario.nombre}</strong>! Comprar artesanías y productos serranos es muy sencillo:
      </p>

      <div class="tutorial-steps-grid">
        <div class="tutorial-card">
          <div class="tutorial-step-number">1</div>
          <i class="fa-solid fa-eye tutorial-icon"></i>
          <h4>1. Explora Artesanías</h4>
          <p>Navega en el catálogo o filtra por tu municipio preferido (Jalpan, Landa, Arroyo Seco o Pinal).</p>
        </div>

        <div class="tutorial-card">
          <div class="tutorial-step-number">2</div>
          <i class="fa-solid fa-cart-plus tutorial-icon"></i>
          <h4>2. Selecciona Cantidad</h4>
          <p>Haz clic en cualquier pieza para ver las horas que tomó elaborarla a mano y elige cuántas unidades deseas.</p>
        </div>

        <div class="tutorial-card">
          <div class="tutorial-step-number">3</div>
          <i class="fa-solid fa-truck-fast tutorial-icon"></i>
          <h4>3. Selecciona Envío</h4>
          <p>Elige entre envío a domicilio por Paquetexpress/DHL o recolección gratuita directamente en el taller.</p>
        </div>

        <div class="tutorial-card">
          <div class="tutorial-step-number">4</div>
          <i class="fa-solid fa-receipt tutorial-icon"></i>
          <h4>4. Recibe Ticket & WhatsApp</h4>
          <p>Al confirmar tu pago, se genera tu ticket oficial con QR y le avisamos automáticamente por WhatsApp al artesano.</p>
        </div>
      </div>
    `;
  }

  openModal('tutorialModal');
}

function renderUserHeader() {
  const userArea = document.getElementById('userHeaderArea');
  if (!userArea) return;

  let html = '';

  if (state.usuario) {
    const isVendor = state.usuario.rol === 'vendedor';
    html = `
      <div class="user-profile-badge ${isVendor ? 'vendor-clickable-badge' : ''}" id="btnUserMenu" title="${isVendor ? 'Clic para abrir Mi Panel de Vendedor' : 'Perfil de ' + state.usuario.nombre}" style="${isVendor ? 'cursor:pointer;' : ''}">
        <div class="user-avatar">${state.usuario.nombre.charAt(0).toUpperCase()}</div>
        <div class="user-info-text">
          <span class="user-name-str">${state.usuario.nombre}</span>
          <span class="user-role-lbl"><i class="${isVendor ? 'fa-solid fa-store' : 'fa-solid fa-cart-shopping'}"></i> ${isVendor ? 'Vendedor (Mi Panel)' : 'Comprador'}</span>
        </div>
      </div>
      ${isVendor ? `
        <button class="btn btn-primary btn-sm" id="btnPublishProduct">
          <i class="fa-solid fa-plus-circle"></i> ${state.idioma === 'es' ? 'Publicar' : 'Publish'}
        </button>
      ` : ''}
      <button class="cart-btn" id="btnOpenCart" title="Ver Carrito">
        <i class="fa-solid fa-basket-shopping"></i>
        <span class="cart-count" id="cartCount">${state.carrito.reduce((acc, item) => acc + item.cantidad, 0)}</span>
      </button>
      <button class="btn btn-outline btn-sm" id="btnLogout" title="Cerrar Sesión">
        <i class="fa-solid fa-right-from-bracket"></i> ${state.idioma === 'es' ? 'Salir' : 'Exit'}
      </button>
    `;
  } else {
    html = `
      <button class="btn btn-primary btn-auth-highlight" id="btnOpenAuthModal">
        <i class="fa-solid fa-user-circle" style="font-size: 1.1rem;"></i>
        <span>${state.idioma === 'es' ? 'Iniciar Sesión / Registro' : 'Login / Register'}</span>
      </button>
      <button class="cart-btn" id="btnOpenCart" title="Ver Carrito">
        <i class="fa-solid fa-basket-shopping"></i>
        <span class="cart-count" id="cartCount">${state.carrito.reduce((acc, item) => acc + item.cantidad, 0)}</span>
      </button>
    `;
  }

  userArea.innerHTML = html;
  attachHeaderEvents();
  renderHelpNavButton();
}

function attachHeaderEvents() {
  const btnAuth = document.getElementById('btnOpenAuthModal');
  if (btnAuth) btnAuth.addEventListener('click', () => { resetAuthForms(); openModal('authModal'); });

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      state.usuario = null;
      state.carrito = [];
      localStorage.removeItem('sg_user');
      resetAuthForms();
      renderUserHeader();
      renderHelpNavButton();
      updateCartUI();
      showToast('👋 Sesión cerrada correctamente.');
    });
  }

  const btnUserMenu = document.getElementById('btnUserMenu');
  if (btnUserMenu && state.usuario && state.usuario.rol === 'vendedor') {
    btnUserMenu.addEventListener('click', openVendorDashboard);
  }

  const btnPublish = document.getElementById('btnPublishProduct');
  if (btnPublish) {
    btnPublish.addEventListener('click', () => {
      if (state.usuario && state.usuario.nombre_taller) {
        document.getElementById('prodArtesano').value = state.usuario.nombre;
        document.getElementById('prodMunicipio').value = state.usuario.municipio || 'Jalpan de Serra';
      }
      openModal('producerModal');
    });
  }

  const btnCart = document.getElementById('btnOpenCart');
  if (btnCart) btnCart.addEventListener('click', openCartDrawer);
}

function applyLanguage() {
  const t = translations[state.idioma];
  
  const lblLang = document.getElementById('lblLangText');
  if (lblLang) lblLang.innerText = t.langBtn;

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;

  const heroBadge = document.getElementById('heroBadge');
  if (heroBadge) heroBadge.innerHTML = `<i class="fa-solid fa-leaf"></i> ${t.heroBadge}`;

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) heroTitle.innerText = t.heroTitle;

  const heroSub = document.getElementById('heroSubtitle');
  if (heroSub) heroSub.innerText = t.heroSubtitle;

  const st1 = document.getElementById('stat1Title');
  if (st1) st1.innerText = t.stat1Title;
  const st1sub = document.getElementById('stat1Sub');
  if (st1sub) st1sub.innerText = t.stat1Sub;

  const st2 = document.getElementById('stat2Title');
  if (st2) st2.innerText = t.stat2Title;
  const st2sub = document.getElementById('stat2Sub');
  if (st2sub) st2sub.innerText = t.stat2Sub;

  const st3 = document.getElementById('stat3Title');
  if (st3) st3.innerText = t.stat3Title;
  const st3sub = document.getElementById('stat3Sub');
  if (st3sub) st3sub.innerText = t.stat3Sub;

  const lblFilterMuni = document.getElementById('lblFilterMuni');
  if (lblFilterMuni) lblFilterMuni.innerHTML = `<i class="fa-solid fa-map-pin"></i> ${t.filterMuni}`;

  const lblFilterCat = document.getElementById('lblFilterCat');
  if (lblFilterCat) lblFilterCat.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${t.filterCat}`;

  const lblCatTitle = document.getElementById('lblCatalogTitle');
  if (lblCatTitle) lblCatTitle.innerText = t.catalogTitle;

  const lblMapTitle = document.getElementById('lblMapTitle');
  if (lblMapTitle) lblMapTitle.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> ${t.mapTitle}`;

  const lblMapSub = document.getElementById('lblMapSub');
  if (lblMapSub) lblMapSub.innerText = t.mapSub;

  const lblTrack = document.getElementById('lblTrackingNav');
  if (lblTrack) lblTrack.innerText = t.trackingNav;

  const lblWish = document.getElementById('lblWishlistNav');
  if (lblWish) lblWish.innerText = t.wishlistNav;

  renderUserHeader();
  renderHelpNavButton();
}

function resetAuthForms() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.reset();

  const regForm = document.getElementById('registerForm');
  if (regForm) regForm.reset();

  const vendorBox = document.getElementById('vendorExtraFields');
  if (vendorBox) vendorBox.style.display = 'none';

  const compRadio = document.querySelector('input[name="regRol"][value="comprador"]');
  if (compRadio) compRadio.checked = true;

  const tabLogin = document.getElementById('tabLoginBtn');
  const tabReg = document.getElementById('tabRegisterBtn');
  const tabsHeader = document.getElementById('authTabsHeader');
  if (tabLogin && tabReg && loginForm && regForm) {
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    loginForm.classList.add('active');
    regForm.classList.remove('active');
    if (tabsHeader) tabsHeader.style.display = 'flex';
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  const content = modal.querySelector('.modal-content');
  if (content) content.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  const content = modal.querySelector('.modal-content');
  if (content) content.classList.remove('active');
}

function setupEventListeners() {
  const btnLang = document.getElementById('btnToggleLang');
  if (btnLang) {
    btnLang.addEventListener('click', () => {
      state.idioma = state.idioma === 'es' ? 'en' : 'es';
      applyLanguage();
      showToast(state.idioma === 'es' ? '🇲🇽 Idioma cambiado a Español' : '🇺🇸 Switched to English');
    });
  }

  // Tutorial / Guía Fácil de Uso (Adaptado a 3 Estados)
  const btnOpenTut = document.getElementById('btnOpenTutorial');
  if (btnOpenTut) btnOpenTut.addEventListener('click', openRoleBasedTutorial);

  const btnCloseTut = document.getElementById('btnCloseTutorialModal');
  if (btnCloseTut) btnCloseTut.addEventListener('click', () => closeModal('tutorialModal'));

  // Rastrear Pedido Nav
  const btnOpenTrack = document.getElementById('btnOpenTrackingModal');
  if (btnOpenTrack) btnOpenTrack.addEventListener('click', () => openModal('trackingModal'));

  const btnCloseTrack = document.getElementById('btnCloseTrackingModal');
  if (btnCloseTrack) btnCloseTrack.addEventListener('click', () => closeModal('trackingModal'));

  const btnTrackSubmit = document.getElementById('btnTrackSubmit');
  if (btnTrackSubmit) btnTrackSubmit.addEventListener('click', handleTrackSubmit);

  // Favoritos Nav
  const btnWish = document.getElementById('btnOpenWishlist');
  if (btnWish) btnWish.addEventListener('click', openWishlistModal);

  const btnCloseWish = document.getElementById('btnCloseWishlistModal');
  if (btnCloseWish) btnCloseWish.addEventListener('click', () => closeModal('wishlistModal'));

  // Garantía Nav
  const btnGuarantee = document.getElementById('btnOpenGuarantee');
  if (btnGuarantee) btnGuarantee.addEventListener('click', () => openModal('tradeGuaranteeModal'));

  const btnCloseGuarantee = document.getElementById('btnCloseGuaranteeModal');
  if (btnCloseGuarantee) btnCloseGuarantee.addEventListener('click', () => closeModal('tradeGuaranteeModal'));

  const btnCloseReceipt = document.getElementById('btnCloseReceiptModal');
  if (btnCloseReceipt) btnCloseReceipt.addEventListener('click', () => closeModal('receiptModal'));

  // Ordenamiento por Precio & Rating
  const sortSelect = document.getElementById('sortProducts');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.orden = e.target.value;
      fetchProducts();
    });
  }

  // Buscador
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.busqueda = e.target.value;
      fetchProducts();
    });
  }

  const btnCloseCart = document.getElementById('btnCloseCart');
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);
  
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  const btnCloseAuth = document.getElementById('btnCloseAuthModal');
  if (btnCloseAuth) btnCloseAuth.addEventListener('click', () => closeModal('authModal'));

  const btnCloseDetail = document.getElementById('btnCloseProductDetail');
  if (btnCloseDetail) btnCloseDetail.addEventListener('click', () => closeModal('productDetailModal'));

  const btnCloseDash = document.getElementById('btnCloseVendorDash');
  if (btnCloseDash) btnCloseDash.addEventListener('click', () => closeModal('vendorDashboardModal'));

  // Auth Tabs
  const tabLogin = document.getElementById('tabLoginBtn');
  const tabReg = document.getElementById('tabRegisterBtn');
  const formLogin = document.getElementById('loginForm');
  const formReg = document.getElementById('registerForm');
  const tabsHeader = document.getElementById('authTabsHeader');

  if (tabLogin && tabReg && formLogin && formReg) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabReg.classList.remove('active');
      formLogin.classList.add('active');
      formReg.classList.remove('active');
      if (tabsHeader) tabsHeader.style.display = 'flex';
    });

    tabReg.addEventListener('click', () => {
      tabReg.classList.add('active');
      tabLogin.classList.remove('active');
      formReg.classList.add('active');
      formLogin.classList.remove('active');
      if (tabsHeader) tabsHeader.style.display = 'flex';
    });
  }

  const roleRadios = document.querySelectorAll('input[name="regRol"]');
  roleRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const vendorBox = document.getElementById('vendorExtraFields');
      if (vendorBox) vendorBox.style.display = e.target.value === 'vendedor' ? 'block' : 'none';
    });
  });

  if (formLogin) formLogin.addEventListener('submit', handleLoginSubmit);
  if (formReg) formReg.addEventListener('submit', handleRegisterSubmit);

  const shipSelect = document.getElementById('custShippingMethod');
  if (shipSelect) {
    shipSelect.addEventListener('change', (e) => {
      const opt = e.target.options[e.target.selectedIndex];
      state.costoEnvio = parseFloat(opt.dataset.cost) || 0;
      updateCartUI();
    });
  }

  const btnCheckout = document.getElementById('btnCheckout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (state.carrito.length === 0) {
        showToast('⚠️ Tu carrito está vacío.');
        return;
      }
      if (!state.usuario) {
        showToast('🔑 Inicia sesión para completar tu compra.');
        openModal('authModal');
        return;
      }
      closeCartDrawer();
      document.getElementById('custName').value = state.usuario.nombre;
      document.getElementById('custEmail').value = state.usuario.email;
      document.getElementById('custPhone').value = state.usuario.telefono || '';
      openModal('checkoutModal');
    });
  }

  const btnCloseCheckout = document.getElementById('btnCloseCheckoutModal');
  if (btnCloseCheckout) btnCloseCheckout.addEventListener('click', () => closeModal('checkoutModal'));

  const btnCloseProducer = document.getElementById('btnCloseProducerModal');
  if (btnCloseProducer) btnCloseProducer.addEventListener('click', () => closeModal('producerModal'));

  const producerForm = document.getElementById('producerForm');
  if (producerForm) producerForm.addEventListener('submit', handleAddProduct);

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);
}

// Handler Rastreo de Pedido por Clave
async function handleTrackSubmit() {
  const code = (document.getElementById('trackInputCode').value || '').toUpperCase().trim();
  if (!code) {
    showToast('⚠️ Ingresa una clave de pedido válida (ej. ORD-749102).');
    return;
  }

  try {
    const res = await fetch(`/api/pedidos/rastreo/${code}`);
    const data = await res.json();
    const area = document.getElementById('trackingResultArea');
    if (!area) return;

    if (!data.success) {
      area.style.display = 'block';
      area.innerHTML = `<div style="background:#fee2e2; border:1px solid #fca5a5; padding:12px; border-radius:8px; color:#991b1b; font-size:0.85rem;">❌ ${data.error}</div>`;
      return;
    }

    const p = data.pedido;
    const isStep1 = true;
    const isStep2 = p.estado === 'En Preparación en Taller' || p.estado === 'Enviado / En Tránsito' || p.estado === 'Entregado con Éxito';
    const isStep3 = p.estado === 'Enviado / En Tránsito' || p.estado === 'Entregado con Éxito';
    const isStep4 = p.estado === 'Entregado con Éxito';

    area.style.display = 'block';
    area.innerHTML = `
      <div style="background:var(--bg-main); border:1px solid var(--border); padding:16px; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:12px;">
          <strong style="color:var(--primary-dark); font-size:1.05rem;">Ticket Clave: #${p.id}</strong>
          <span class="chip" style="font-size:0.75rem;">${p.metodo_envio}</span>
        </div>

        <p style="font-size:0.82rem; margin-bottom:4px;"><strong>Cliente:</strong> ${p.cliente}</p>
        <p style="font-size:0.82rem; margin-bottom:12px;"><strong>Monto Total:</strong> $${p.total.toLocaleString('es-MX')} MXN</p>

        <h5 style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">Línea de Tiempo del Envió:</h5>
        <div class="tracking-timeline">
          <div class="timeline-step ${isStep1 ? 'completed' : ''}">
            <strong>1. Pedido Confirmado & Pagado</strong>
            <span>Orden recepcionada exitosamente.</span>
          </div>
          <div class="timeline-step ${isStep2 ? 'completed' : (p.estado === 'Pendiente de Envío' ? 'active' : '')}">
            <strong>2. En Preparación en Taller</strong>
            <span>El artesano está empacando tus piezas con materiales de protección.</span>
          </div>
          <div class="timeline-step ${isStep3 ? 'completed' : ''}">
            <strong>3. En Tránsito (Transporte Rural / DHL)</strong>
            <span>Paquete recolectado y viajando hacia tu destino.</span>
          </div>
          <div class="timeline-step ${isStep4 ? 'completed' : ''}">
            <strong>4. Entregado con Éxito</strong>
            <span>¡Disfruta tu artesanía 100% de la Sierra Gorda!</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    showToast('❌ Error consultando el estado del pedido.');
  }
}

// Abrir Ficha de Detalle de Producto
async function openProductDetail(productId) {
  try {
    const res = await fetch(`/api/productos/${productId}`);
    const prod = await res.json();
    if (!prod) return;

    const body = document.getElementById('productDetailBody');
    document.getElementById('detailProductTitle').innerText = prod.nombre;

    let resenasHtml = '';
    if (prod.resenas && prod.resenas.length > 0) {
      prod.resenas.forEach(r => {
        const stars = '★'.repeat(r.estrellas) + '☆'.repeat(5 - r.estrellas);
        resenasHtml += `
          <div class="review-card">
            <div style="display:flex; justify-content:space-between;">
              <strong>${r.cliente} <span style="font-size:0.72rem; color:#10b981; margin-left:6px;">✓ Compra Verificada</span></strong>
              <span class="review-stars">${stars}</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">"${r.comentario}"</p>
          </div>
        `;
      });
    } else {
      resenasHtml = `<p style="font-size:0.82rem; color:var(--text-muted);">Aún no hay reseñas para este producto. ¡Sé el primero en comprar y opinar!</p>`;
    }

    body.innerHTML = `
      <div class="product-detail-grid">
        <div>
          <img src="${prod.imagen}" class="detail-img" alt="${prod.nombre}" onerror="this.src='/assets/artesania_pame_1786110469232.jpg'">
          
          <div class="cultural-badge-box">
            <h5><i class="fa-solid fa-certificate"></i> Credenciales de Identidad Cultural</h5>
            <p style="font-size:0.78rem; color:var(--text-main); margin-bottom:4px;"><strong>⏳ Tiempo de Elaboración:</strong> ${prod.tiempo_elaboracion || 'Tradicional hecho a mano'}</p>
            <p style="font-size:0.78rem; color:var(--text-main); margin-bottom:4px;"><strong>🌿 Materiales Nativos:</strong> ${prod.materiales || 'Recursos de la Sierra Gorda'}</p>
            <p style="font-size:0.78rem; color:var(--text-main);"><strong>🛠️ Técnica Ancestral:</strong> ${prod.tecnica || 'Preservada por generaciones'}</p>
          </div>
        </div>

        <div>
          <span style="color:var(--accent); font-size:0.8rem; font-weight:700;"><i class="fa-solid fa-user"></i> Artesano: ${prod.artesano}</span>
          <h2 style="font-size:1.4rem; color:var(--primary-dark); margin:6px 0;">${prod.nombre}</h2>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;"><i class="fa-solid fa-location-dot"></i> ${prod.municipio} (${prod.comunidad || 'Cabecera'})</p>

          <div style="font-size:1.6rem; font-weight:800; color:var(--primary-dark); margin-bottom:12px;">
            $${prod.precio.toLocaleString('es-MX')} <span style="font-size:0.8rem; color:var(--text-muted);">MXN</span>
          </div>

          <p style="font-size:0.88rem; color:var(--text-main); margin-bottom:16px;">${prod.descripcion}</p>

          <div style="margin-bottom:16px;">
            <label style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:6px;">Cantidad a comprar:</label>
            <div class="quantity-control-detail">
              <button class="qty-btn" onclick="changeDetailQty(-1)">-</button>
              <input type="number" id="detailProductQty" value="1" min="1" max="${prod.stock || 10}" readonly style="width:50px; text-align:center; font-weight:800; border:1px solid var(--border); border-radius:6px; padding:4px;">
              <button class="qty-btn" onclick="changeDetailQty(1)">+</button>
              <span style="font-size:0.75rem; color:var(--text-muted); margin-left:8px;">(${prod.stock || 10} disponibles)</span>
            </div>
          </div>

          <button class="btn btn-primary btn-block" onclick="addCustomQuantityToCart(${prod.id});">
            <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito
          </button>

          <hr style="margin:20px 0; border:none; border-top:1px solid var(--border);">

          <h4><i class="fa-solid fa-comments"></i> Reseñas de Compradores (${prod.calificacion || 5.0} ★)</h4>
          <div style="margin-top:10px;">
            ${resenasHtml}
          </div>

          <div style="margin-top:16px; background:#f8fafc; padding:10px; border-radius:8px; border:1px solid var(--border);">
            <h5 style="font-size:0.82rem; margin-bottom:6px;">Escribir Reseña</h5>
            <input type="text" id="revClientName" placeholder="Tu nombre" style="margin-bottom:6px;">
            <select id="revStars" style="margin-bottom:6px;">
              <option value="5">★★★★★ (5 Estrellas - Excelente)</option>
              <option value="4">★★★★☆ (4 Estrellas - Muy Bueno)</option>
            </select>
            <textarea id="revComment" rows="2" placeholder="Tu opinión sobre la artesanía..."></textarea>
            <button class="btn btn-sm btn-outline" style="margin-top:6px;" onclick="submitReview(${prod.id})">Enviar Reseña</button>
          </div>
        </div>
      </div>
    `;

    openModal('productDetailModal');
  } catch (err) {
    console.error("Error abriendo detalle:", err);
  }
}

function changeDetailQty(delta) {
  const qtyInput = document.getElementById('detailProductQty');
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value) || 1;
  const max = parseInt(qtyInput.getAttribute('max')) || 20;
  val = Math.max(1, Math.min(max, val + delta));
  qtyInput.value = val;
}

function addCustomQuantityToCart(productId) {
  const qtyInput = document.getElementById('detailProductQty');
  const cantidad = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
  addToCart(productId, cantidad);
}

// Enviar Reseña
async function submitReview(productId) {
  const cliente = document.getElementById('revClientName').value || 'Comprador Verificado';
  const estrellas = document.getElementById('revStars').value;
  const comentario = document.getElementById('revComment').value;

  if (!comentario) {
    showToast('⚠️ Escribe un breve comentario para enviar tu reseña.');
    return;
  }

  try {
    const res = await fetch(`/api/productos/${productId}/resenas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente, estrellas, comentario })
    });
    const data = await res.json();
    if (data.success) {
      showToast('⭐ ¡Gracias por tu reseña! Ha sido publicada.');
      openProductDetail(productId);
      fetchProducts();
    }
  } catch (err) {
    showToast('❌ Error enviando reseña.');
  }
}

// Abrir Panel de Vendedor
async function openVendorDashboard() {
  if (!state.usuario || state.usuario.rol !== 'vendedor') return;

  try {
    const res = await fetch(`/api/vendedor/dashboard?usuario_id=${state.usuario.id}`);
    const data = await res.json();
    if (!data.success) {
      showToast(`❌ ${data.error}`);
      return;
    }

    const body = document.getElementById('vendorDashBody');
    const v = data.vendedor;

    let ordersHtml = '';
    if (data.pedidos && data.pedidos.length > 0) {
      data.pedidos.forEach(p => {
        ordersHtml += `
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:10px 8px; font-weight:700;">#${p.id}</td>
            <td style="padding:10px 8px;">${p.cliente}<br/><small style="color:var(--text-muted);">${p.email}</small></td>
            <td style="padding:10px 8px;">$${p.total} MXN</td>
            <td style="padding:10px 8px;"><span class="chip" style="font-size:0.75rem;">${p.metodo_envio}</span></td>
            <td style="padding:10px 8px;">
              <select onchange="updateOrderStatus('${p.id}', this.value)" style="padding:4px 8px; font-size:0.78rem; font-weight:700; border-radius:6px;">
                <option value="Pendiente de Envío" ${p.estado === 'Pendiente de Envío' ? 'selected' : ''}>⏳ Pendiente de Envío</option>
                <option value="En Preparación en Taller" ${p.estado === 'En Preparación en Taller' ? 'selected' : ''}>🛠️ En Preparación en Taller</option>
                <option value="Enviado / En Tránsito" ${p.estado === 'Enviado / En Tránsito' ? 'selected' : ''}>🚚 Enviado / En Tránsito</option>
                <option value="Entregado con Éxito" ${p.estado === 'Entregado con Éxito' ? 'selected' : ''}>✅ Entregado con Éxito</option>
              </select>
            </td>
          </tr>
        `;
      });
    } else {
      ordersHtml = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No has recibido pedidos aún. ¡Tus ventas aparecerán aquí automáticamente!</td></tr>`;
    }

    body.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:14px; margin-bottom:20px;">
        <div style="background-color:var(--primary-light); border:1px solid #bbf7d0; border-radius:12px; padding:14px;">
          <span style="font-size:0.78rem; font-weight:700; color:var(--primary-dark);"><i class="fa-solid fa-wallet"></i> Saldo para Depósito:</span>
          <h3 style="font-size:1.5rem; color:var(--primary-dark); margin-top:4px;">$${v.saldo_acumulado.toLocaleString('es-MX')} MXN</h3>
          <p style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">🔒 CLABE: <strong>${v.clabe}</strong> (${v.titular_cuenta})</p>
        </div>

        <div style="background-color:var(--accent-light); border:1px solid #fde68a; border-radius:12px; padding:14px;">
          <span style="font-size:0.78rem; font-weight:700; color:#92400e;"><i class="fa-solid fa-truck-ramp-box"></i> Mis Ventas Recibidas:</span>
          <h3 style="font-size:1.5rem; color:#92400e; margin-top:4px;">${v.total_ventas} Pedidos</h3>
          <p style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">📲 Notificaciones enviadas por WhatsApp</p>
        </div>

        <div style="background-color:#e0f2fe; border:1px solid #bae6fd; border-radius:12px; padding:14px;">
          <span style="font-size:0.78rem; font-weight:700; color:#0369a1;"><i class="fa-solid fa-bag-shopping"></i> Comprar a Otros Artesanos:</span>
          <div style="margin-top:6px;">
            <button class="btn btn-sm btn-primary" style="width:100%; font-size:0.75rem;" onclick="closeModal('vendorDashboardModal'); openCartDrawer();">
              <i class="fa-solid fa-cart-shopping"></i> Ver mi Carrito (${state.carrito.reduce((acc, i) => acc + i.cantidad, 0)})
            </button>
          </div>
          <p style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">Fomenta la economía circular de la Sierra</p>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="margin:0;"><i class="fa-solid fa-list-check"></i> Gestión de Ventas de Clientes</h4>
        <button class="btn btn-sm btn-outline" onclick="closeModal('vendorDashboardModal'); window.scrollTo({top: 800, behavior: 'smooth'});">
          <i class="fa-solid fa-store"></i> Explorar Catálogo y Comprar
        </button>
      </div>

      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
          <thead>
            <tr style="background:#f1f5f9; text-align:left;">
              <th style="padding:8px;">ID Pedido</th>
              <th style="padding:8px;">Cliente</th>
              <th style="padding:8px;">Monto</th>
              <th style="padding:8px;">Envío</th>
              <th style="padding:8px;">Actualizar Estado</th>
            </tr>
          </thead>
          <tbody>
            ${ordersHtml}
          </tbody>
        </table>
      </div>
    `;

    openModal('vendorDashboardModal');
  } catch (err) {
    showToast('❌ Error cargando panel de vendedor.');
  }
}

async function updateOrderStatus(pedidoId, nuevoEstado) {
  try {
    const res = await fetch('/api/vendedor/pedidos/estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedido_id: pedidoId, nuevo_estado: nuevoEstado })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`✅ ${data.message}`);
    }
  } catch (err) {
    showToast('❌ Error actualizando estado.');
  }
}

// Handlers de Auth
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      state.usuario = data.user;
      localStorage.setItem('sg_user', JSON.stringify(data.user));
      closeModal('authModal');
      renderUserHeader();
      renderHelpNavButton();
      resetAuthForms();
      showToast(`✨ ¡Bienvenido de nuevo, ${data.user.nombre}!`);

      if (state.pendingAddToCart) {
        const { productId, cantidad } = state.pendingAddToCart;
        state.pendingAddToCart = null;
        addToCart(productId, cantidad);
      }
    } else {
      showToast(`❌ ${data.error || 'Error al iniciar sesión'}`);
    }
  } catch (err) {
    showToast('❌ Error al conectar con el servidor.');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const nombre = document.getElementById('regNombre').value;
  const email = document.getElementById('regEmail').value;
  const telefono = document.getElementById('regTelefono').value;
  const password = document.getElementById('regPassword').value;
  const rol = document.querySelector('input[name="regRol"]:checked').value;
  
  const nombre_taller = document.getElementById('regTaller').value;
  const categoria_principal = document.getElementById('regCategoriaPrincipal').value;
  const municipio = document.getElementById('regMunicipio').value;
  const comunidad = document.getElementById('regComunidad').value;
  const direccion_recoleccion = document.getElementById('regDireccion').value;
  const titular_cuenta = document.getElementById('regTitularCuenta').value;
  const clabe = document.getElementById('regClabe').value;
  const historia = document.getElementById('regHistoria').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nombre, email, telefono, password, rol, 
        municipio, comunidad, nombre_taller, categoria_principal,
        direccion_recoleccion, clabe, titular_cuenta, historia 
      })
    });
    const data = await res.json();
    if (data.success) {
      state.usuario = data.user;
      localStorage.setItem('sg_user', JSON.stringify(data.user));
      closeModal('authModal');
      renderUserHeader();
      renderHelpNavButton();
      resetAuthForms();
      showToast(`🎉 ¡Registro exitoso como ${data.user.rol === 'vendedor' ? 'Vendedor Artesanal' : 'Comprador'}!`);
      if (data.user.rol === 'vendedor') {
        loadMetadata();
      }

      if (state.pendingAddToCart) {
        const { productId, cantidad } = state.pendingAddToCart;
        state.pendingAddToCart = null;
        addToCart(productId, cantidad);
      }
    } else {
      showToast(`❌ ${data.error || 'Error al registrar usuario'}`);
    }
  } catch (err) {
    showToast('❌ Error al conectar con el servidor.');
  }
}

// Cargar Municipios y Categorías
async function loadMetadata() {
  try {
    const [resMuni, resCat, resProd] = await Promise.all([
      fetch('/api/municipios'),
      fetch('/api/categorias'),
      fetch('/api/productores')
    ]);

    state.municipios = await resMuni.json();
    state.categorias = await resCat.json();
    state.productores = await resProd.json();

    renderMunicipiosChips();
    renderCategoriasChips();
    if (map) updateMapMarkers();
  } catch (err) {
    console.error("Error cargando metadatos:", err);
  }
}

function renderMunicipiosChips() {
  const container = document.getElementById('municipiosFilter');
  if (!container) return;

  let html = `<button class="chip active" data-municipio="todos">Todos los Municipios</button>`;
  
  state.municipios.forEach(m => {
    html += `<button class="chip" data-municipio="${m.nombre}">${m.nombre}</button>`;
  });

  container.innerHTML = html;

  container.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      state.filtroMunicipio = btn.dataset.municipio;
      fetchProducts();
    });
  });
}

function renderCategoriasChips() {
  const container = document.getElementById('categoriasFilter');
  if (!container) return;

  let html = `<button class="chip active" data-categoria="todas">Todas las Categorías</button>`;

  state.categorias.forEach(c => {
    html += `<button class="chip" data-categoria="${c.id}">${c.icono} ${c.nombre}</button>`;
  });

  container.innerHTML = html;

  container.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      state.filtroCategoria = btn.dataset.categoria;
      fetchProducts();
    });
  });
}

// Obtener Productos con Soporte de Ordenamiento
async function fetchProducts() {
  try {
    let url = `/api/productos?municipio=${encodeURIComponent(state.filtroMunicipio)}&categoria=${encodeURIComponent(state.filtroCategoria)}&busqueda=${encodeURIComponent(state.busqueda)}&orden=${encodeURIComponent(state.orden)}`;
    const res = await fetch(url);
    state.productos = await res.json();
    renderProducts();
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('resultsCount');

  if (countEl) countEl.innerText = `${state.productos.length} productos encontrados`;

  if (!grid) return;

  if (state.productos.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fa-solid fa-store-slash" style="font-size: 3rem; margin-bottom: 12px;"></i>
        <p>No se encontraron productos con los filtros seleccionados.</p>
      </div>
    `;
    return;
  }

  let html = '';
  state.productos.forEach(p => {
    const isFav = state.favoritos.includes(p.id);
    html += `
      <div class="product-card">
        <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite(${p.id}, event)" title="${isFav ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}">
          <i class="fa-solid fa-heart"></i>
        </button>

        <div class="product-image-wrapper" onclick="openProductDetail(${p.id})">
          <img src="${p.imagen}" alt="${p.nombre}" class="product-image" onerror="this.src='/assets/artesania_pame_1786110469232.jpg'">
          <span class="product-badge-muni"><i class="fa-solid fa-location-dot"></i> ${p.municipio}</span>
        </div>
        <div class="product-content">
          <span class="product-artesano"><i class="fa-solid fa-hand-holding-heart"></i> ${p.artesano}</span>
          <h3 class="product-title" onclick="openProductDetail(${p.id})">${p.nombre}</h3>
          <p class="product-desc">${p.descripcion}</p>
          <div class="product-footer">
            <div class="product-price">$${p.precio.toLocaleString('es-MX')} <span>MXN</span></div>
            <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id}, 1)">
              <i class="fa-solid fa-plus"></i> Agregar
            </button>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

// Carrito de Compras
function addToCart(productId, cantidadAAgregar = 1) {
  if (!state.usuario) {
    state.pendingAddToCart = { productId, cantidad: cantidadAAgregar };
    showToast('🔑 Por favor inicia sesión o regístrate para agregar productos a tu carrito.');
    openModal('authModal');
    return;
  }

  const prod = state.productos.find(p => p.id === productId);
  if (!prod) return;

  const itemIndex = state.carrito.findIndex(item => item.id === productId);
  if (itemIndex > -1) {
    state.carrito[itemIndex].cantidad += cantidadAAgregar;
  } else {
    state.carrito.push({ ...prod, cantidad: cantidadAAgregar });
  }

  updateCartUI();
  showToast(`🛒 ${cantidadAAgregar} x "${prod.nombre}" en tu carrito.`);
}

function updateCartItemQty(productId, delta) {
  if (!state.usuario) {
    showToast('🔑 Inicia sesión para gestionar tu carrito.');
    openModal('authModal');
    return;
  }

  const itemIndex = state.carrito.findIndex(item => item.id === productId);
  if (itemIndex === -1) return;

  state.carrito[itemIndex].cantidad += delta;

  if (state.carrito[itemIndex].cantidad <= 0) {
    state.carrito.splice(itemIndex, 1);
  }

  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const totalCount = state.carrito.reduce((acc, item) => acc + item.cantidad, 0);
  if (countEl) countEl.innerText = totalCount;

  const container = document.getElementById('cartItemsContainer');
  let html = '';
  let subtotal = 0;

  state.carrito.forEach(item => {
    subtotal += item.precio * item.cantidad;
    html += `
      <div class="cart-item">
        <img src="${item.imagen}" class="cart-item-img" alt="${item.nombre}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.nombre}</div>
          <div class="cart-item-price">$${item.precio} MXN c/u</div>
          
          <div class="cart-item-qty-row">
            <button class="cart-qty-btn" onclick="updateCartItemQty(${item.id}, -1)">-</button>
            <span class="cart-qty-val">${item.cantidad}</span>
            <button class="cart-qty-btn" onclick="updateCartItemQty(${item.id}, 1)">+</button>
            <span style="font-weight:700; font-size:0.85rem; color:var(--primary-dark); margin-left:auto;">$${(item.precio * item.cantidad).toLocaleString('es-MX')}</span>
          </div>
        </div>
        <button class="btn-close" onclick="removeFromCart(${item.id})" title="Eliminar">&times;</button>
      </div>
    `;
  });

  if (container) {
    container.innerHTML = html || '<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Tu carrito está vacío.</p>';
  }

  const finalTotal = subtotal + state.costoEnvio;

  const subEl = document.getElementById('cartSubtotal');
  const shipEl = document.getElementById('cartShippingCost');
  const totEl = document.getElementById('cartTotal');

  const mSubEl = document.getElementById('modalSubtotalPay');
  const mShipEl = document.getElementById('modalShippingPay');
  const mTotEl = document.getElementById('modalTotalPay');

  if (subEl) subEl.innerText = `$${subtotal.toLocaleString('es-MX')} MXN`;
  if (shipEl) shipEl.innerText = state.costoEnvio === 0 ? 'GRATIS' : `$${state.costoEnvio} MXN`;
  if (totEl) totEl.innerText = `$${finalTotal.toLocaleString('es-MX')} MXN`;

  if (mSubEl) mSubEl.innerText = `$${subtotal.toLocaleString('es-MX')} MXN`;
  if (mShipEl) mShipEl.innerText = state.costoEnvio === 0 ? 'GRATIS' : `$${state.costoEnvio} MXN`;
  if (mTotEl) mTotEl.innerText = `$${finalTotal.toLocaleString('es-MX')} MXN`;
}

function togglePaymentExtraFields(val) {
  const cardBox = document.getElementById('cardSavedBox');
  const speiBox = document.getElementById('speiInfoBox');

  if (val.includes('Transferencia') || val.includes('OXXO')) {
    if (cardBox) cardBox.style.display = 'none';
    if (speiBox) speiBox.style.display = val.includes('Transferencia') ? 'block' : 'none';
  } else {
    if (cardBox) cardBox.style.display = 'block';
    if (speiBox) speiBox.style.display = 'none';
  }
}

function openCartDrawer() {
  if (!state.usuario) {
    showToast('🔑 Inicia sesión para ver y agregar productos a tu carrito.');
    openModal('authModal');
    return;
  }
  document.getElementById('cartDrawer').classList.add('active');
  document.getElementById('cartDrawerOverlay').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('active');
  document.getElementById('cartDrawerOverlay').classList.remove('active');
}

// Checkout Submit
async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('custName').value;
  const email = document.getElementById('custEmail').value;
  const phone = document.getElementById('custPhone').value;
  const payment = document.getElementById('custPayment').value;
  const shipMethod = document.getElementById('custShippingMethod').value;
  
  const subtotal = state.carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);

  try {
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente: name,
        email: email,
        telefono: phone,
        items: state.carrito,
        subtotal: subtotal,
        costo_envio: state.costoEnvio,
        metodo_envio: shipMethod,
        metodo_pago: payment
      })
    });

    const data = await res.json();
    if (data.success) {
      closeModal('checkoutModal');
      const completedOrder = data.pedido;
      state.carrito = [];
      updateCartUI();

      renderReceiptModal(completedOrder);
      showToast(`🎉 ¡Pago Exitoso! Pedido #${completedOrder.id} confirmado. Se generó tu ticket oficial.`);
    }
  } catch (err) {
    showToast('❌ Error procesando el pago.');
  }
}

// Generador e Impresor de Ticket Oficial
function renderReceiptModal(order) {
  const body = document.getElementById('receiptBody');
  if (!body) return;

  let itemsRowsHtml = '';
  order.items.forEach(item => {
    itemsRowsHtml += `
      <tr>
        <td><strong>${item.nombre}</strong><br/><small style="color:var(--text-muted);">Artesano: ${item.artesano}</small></td>
        <td style="text-align:center;">${item.cantidad}</td>
        <td style="text-align:right;">$${item.precio} MXN</td>
        <td style="text-align:right;">$${(item.precio * item.cantidad).toLocaleString('es-MX')} MXN</td>
      </tr>
    `;
  });

  const formattedDate = new Date(order.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  body.innerHTML = `
    <div class="receipt-box">
      <div class="receipt-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="/assets/logo.jpg" style="height:48px; width:auto; border-radius:6px; object-fit:contain;">
          <div>
            <h2 style="color:var(--primary-dark); font-size:1.2rem; margin:0;">Corazón Serrano</h2>
            <p style="font-size:0.7rem; color:var(--accent); font-weight:800; margin:0;">ARTE • HISTORIA • ORIGEN</p>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.1rem; font-weight:800; color:var(--primary-dark);">#${order.id}</div>
          <p style="font-size:0.75rem; color:var(--text-muted);">${formattedDate}</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; font-size:0.82rem;">
        <div>
          <strong>👤 Datos del Comprador:</strong><br/>
          <span>${order.cliente}</span><br/>
          <span>${order.email} | Cel: ${order.telefono}</span>
        </div>
        <div>
          <strong>🚚 Método de Envío & Pago:</strong><br/>
          <span>${order.metodo_envio}</span><br/>
          <span style="color:#10b981; font-weight:700;">Pago: ${order.metodo_pago} (Aprobado)</span>
        </div>
      </div>

      <table class="receipt-table">
        <thead>
          <tr style="background:#f8fafc;">
            <th>Producto / Artesanía</th>
            <th style="text-align:center;">Cant.</th>
            <th style="text-align:right;">Precio U.</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>

      <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px; text-align:right; font-size:0.88rem;">
        <div>Subtotal: <strong>$${order.subtotal.toLocaleString('es-MX')} MXN</strong></div>
        <div>Costo de Envío: <strong>${order.costo_envio === 0 ? 'GRATIS' : '$' + order.costo_envio + ' MXN'}</strong></div>
        <div style="font-size:1.2rem; font-weight:800; color:var(--primary-dark); margin-top:6px;">Total Pagado: $${order.total.toLocaleString('es-MX')} MXN</div>
      </div>

      <div style="margin-top:20px; background:var(--bg-main); border:1px solid var(--border); padding:12px; border-radius:8px; display:flex; align-items:center; justify-content:space-between;">
        <div style="font-size:0.75rem; color:var(--text-muted);">
          🔒 Este ticket avala el pago 100% directo a los talleres de Jalpan, Landa, Arroyo Seco o Pinal.<br/>
          Conserva esta clave <strong>#${order.id}</strong> para consultar el rastreo de tu envío en cualquier momento.
        </div>
        <div style="background:white; border:1px solid var(--border); padding:6px; border-radius:6px; text-align:center;">
          <i class="fa-solid fa-qrcode" style="font-size:2.2rem; color:var(--primary-dark);"></i>
          <span style="display:block; font-size:0.65rem; color:var(--text-muted);">VALIDADO</span>
        </div>
      </div>
    </div>
  `;

  openModal('receiptModal');
}

// Alta de Producto
async function handleAddProduct(e) {
  e.preventDefault();
  const payload = {
    nombre: document.getElementById('prodNombre').value,
    municipio: document.getElementById('prodMunicipio').value,
    comunidad: document.getElementById('prodComunidad').value,
    categoria: document.getElementById('prodCategoria').value,
    precio: document.getElementById('prodPrecio').value,
    stock: document.getElementById('prodStock').value,
    artesano: document.getElementById('prodArtesano').value,
    tiempo_elaboracion: document.getElementById('prodTiempoElab').value,
    materiales: document.getElementById('prodMateriales').value,
    descripcion: document.getElementById('prodDescripcion').value,
    imagen: '/assets/artesania_pame_1786110469232.jpg'
  };

  try {
    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('producerModal');
      document.getElementById('producerForm').reset();
      showToast('✅ Producto publicado exitosamente en el Marketplace.');
      fetchProducts();
    }
  } catch (err) {
    showToast('❌ Error al registrar producto.');
  }
}

// Inicializar Mapa
function initMap() {
  if (typeof L === 'undefined') return;

  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  map = L.map('map').setView([21.2000, -99.5000], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors | Sierra Gorda Queretana'
  }).addTo(map);

  updateMapMarkers();
}

function updateMapMarkers() {
  if (!map) return;
  state.productores.forEach(prod => {
    const marker = L.marker([prod.lat, prod.lng]).addTo(map);
    marker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="color: #166534; font-size: 1rem;">${prod.nombre_taller}</strong><br/>
        <small style="color: #d97706; font-weight: bold;"><i class="fa-solid fa-user"></i> ${prod.artesano}</small><br/>
        <small style="color: #64748b;"><i class="fa-solid fa-location-dot"></i> ${prod.municipio} (${prod.comunidad || 'Cabecera'})</small>
        <p style="font-size: 0.82rem; margin-top: 6px;">${prod.historia}</p>
      </div>
    `);
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
