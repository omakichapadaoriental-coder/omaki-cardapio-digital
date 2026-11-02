/**

 * OMAKI SUSHI — CARDÁPIO DIGITAL & CHECKOUT WHATSAPP

 * Engine interativa para visualização, personalização e pedidos direto no WhatsApp.

 */



document.addEventListener('DOMContentLoaded', () => {

  const data = window.OMAKI_DATA || (typeof CARDAPIO_DATA !== "undefined" ? CARDAPIO_DATA : null);

  if (!data) {

    console.error('Dados do cardápio não encontrados!');

    return;

  }



  // --- CATEGORIES DEFINITION ---

  const CATEGORY_MAP = [

    { id: 'cat-combos-promo', title: '🍱 Combos Promocionais', match: d => d.category.includes('Promocionais') || d.isNew || (d.num && d.num >= 177 && d.num <= 187) },

    { id: 'cat-combos-chef', title: '🍱 Combos do Chef', match: d => d.category.includes('Combos do Chef') || (d.num && d.num >= 57 && d.num <= 60) },

    { id: 'cat-especiais', title: '✨ Especiais do Chef', match: d => d.category.includes('Especiais') || (d.num && d.num >= 41 && d.num <= 47) },

    { id: 'cat-entradas', title: '🥢 Entradas & Harumakis', match: d => d.category.includes('Harumaki') || d.category.includes('Entradas') || d.id === 'harumaki_group' || d.id === 'kobachi_group' || (d.num && d.num <= 6) },

    { id: 'cat-ceviches', title: '🐟 Ceviches & Tatakis', match: d => d.category.includes('Ceviche') || d.category.includes('Tataki') || d.category.includes('Camarão Imperial') },

    { id: 'cat-carpaccios', title: '🐟 Carpaccios & Gunkans', match: d => d.category.includes('Carpaccio') || d.category.includes('Oishi') || d.category.includes('Gunkan') || d.category.includes('Vegano') },

    { id: 'cat-temakis', title: '🍣 Temakis', match: d => d.category.includes('Temaki') },

    { id: 'cat-hots', title: '🔥 Hot Rolls & Big Hot', match: d => d.category.includes('Hot') },

    { id: 'cat-sashimis', title: '🍣 Sashimis & Joys', match: d => d.category.includes('Sashimi') || d.category.includes('Joy') },

    { id: 'cat-rolls', title: '🍣 Uramakis, Hossomakis & Niguiris', match: d => d.category.includes('Uramaki') || d.category.includes('Hossomaki') || d.category.includes('Niguiri') },

    { id: 'cat-pokes', title: '🥑 Pokes & Pratos Quentes', match: d => d.category.includes('Poke') || d.category.includes('Teppan') || d.category.includes('Yakisoba') || d.category.includes('Adicionais') },

    { id: 'cat-bebidas', title: '🍻 Bebidas, Sucos & Sakês', match: d => d.category.includes('Bebidas') || d.category.includes('Sucos') || d.category.includes('Sakê') || d.category.includes('Refrigerante') || d.category.includes('Cerveja') }

  ];



  // --- STATE ---

  let cart = loadCart();

  let currentActiveCategory = 'all'; // 'all' or specific category id

  let currentModalDish = null;

  let currentSelectedOption = null;

  let currentModalQty = 1;

  let selectedComplements = {};
  let selectedComboDrinks = {};
  let currentActiveDrinkTab = 'sakes';

  let selectedSpecialOptions = {

    temakiFried: false,

    temakiNoRice: false,

    pokeToppings: [],

    pokeSauce: '',

    pokeDoubleProtein: false

  };

  let deliveryType = 'delivery'; // 'delivery' | 'takeaway'

  let selectedNeighborhood = { name: 'Alto Paraíso', fee: 0 };
  let capturedCoordinates = null;
  let adminState = {
    deliveryActive: true,
    manualDeliveryOverride: null,
    deliveryClosedReason: '',
    soldOutIds: []
  };



  // --- DOM ELEMENTS ---

  const categoriesNav = document.getElementById('categoriesNav');

  const menuContainer = document.getElementById('menuContainer');

  const searchInput = document.getElementById('searchInput');

  const clearSearchBtn = document.getElementById('clearSearchBtn');

  const navScrollLeft = document.getElementById('navScrollLeft');

  const navScrollRight = document.getElementById('navScrollRight');



  // Floating Cart & Header Badges

  const floatingCartBar = document.getElementById('floatingCartBar');

  const floatingCartCount = document.getElementById('floatingCartCount');

  const floatingCartSubtotal = document.getElementById('floatingCartSubtotal');

  const headerCartCount = document.getElementById('headerCartCount');

  const openCartHeaderBtn = document.getElementById('openCartHeaderBtn');

  const openCartBarBtn = document.getElementById('openCartBarBtn');



  // Item Modal

  const itemModal = document.getElementById('itemModal');

  const closeItemModalBtn = document.getElementById('closeItemModalBtn');
  const backItemModalBtn = document.getElementById('backItemModalBtn');
  const backCartDrawerBtn = document.getElementById('backCartDrawerBtn');

  const modalItemImg = document.getElementById('modalItemImg');

  const modalImgContainer = document.getElementById('modalImgContainer');

  const modalItemNum = document.getElementById('modalItemNum');

  const modalItemPortion = document.getElementById('modalItemPortion');

  const modalItemName = document.getElementById('modalItemName');

  const modalItemPrice = document.getElementById('modalItemPrice');

  const modalItemDesc = document.getElementById('modalItemDesc');

  const modalOptionsSection = document.getElementById('modalOptionsSection');

  const modalOptionsList = document.getElementById('modalOptionsList');

  const modalSpecialSection = document.getElementById('modalSpecialSection');

  const modalSpecialContent = document.getElementById('modalSpecialContent');

  const modalComplementsList = document.getElementById('modalComplementsList');

  const modalItemNotes = document.getElementById('modalItemNotes');

  const modalQtyMinus = document.getElementById('modalQtyMinus');

  const modalQtyPlus = document.getElementById('modalQtyPlus');

  const modalQtyValue = document.getElementById('modalQtyValue');

  const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

  const modalAddTotalPrice = document.getElementById('modalAddTotalPrice');



  // Checkout Drawer

  const cartDrawer = document.getElementById('cartDrawer');

  const closeCartDrawerBtn = document.getElementById('closeCartDrawerBtn');

  const drawerItemCount = document.getElementById('drawerItemCount');

  const cartItemsList = document.getElementById('cartItemsList');

  const btnTypeDelivery = document.getElementById('btnTypeDelivery');

  const btnTypeTakeaway = document.getElementById('btnTypeTakeaway');

  const deliveryFieldsGroup = document.getElementById('deliveryFieldsGroup');

  const takeawayInfoGroup = document.getElementById('takeawayInfoGroup');

  const orderNeighborhood = document.getElementById('orderNeighborhood');

  const orderStreet = document.getElementById('orderStreet');

  const orderComplement = document.getElementById('orderComplement');

  const orderHashis = document.getElementById('orderHashis');

  const orderWasabiGari = document.getElementById('orderWasabiGari');

  const paymentMethodRadios = document.getElementsByName('paymentMethod');

  const pixInfoBox = document.getElementById('pixInfoBox');

  const cashChangeBox = document.getElementById('cashChangeBox');

  const cashChangeValue = document.getElementById('cashChangeValue');

  const copyPixBtn = document.getElementById('copyPixBtn');

  const orderCustomerName = document.getElementById('orderCustomerName');

  const orderCustomerPhone = document.getElementById('orderCustomerPhone');

  const orderGeneralNotes = document.getElementById('orderGeneralNotes');

  const summarySubtotal = document.getElementById('summarySubtotal');

  const summaryDeliveryFee = document.getElementById('summaryDeliveryFee');

  const summaryGrandTotal = document.getElementById('summaryGrandTotal');

  const deliveryFeeSummaryLine = document.getElementById('deliveryFeeSummaryLine');

  const footerBtnTotal = document.getElementById('footerBtnTotal');

  const sendWhatsAppOrderBtn = document.getElementById('sendWhatsAppOrderBtn');

  const toastMessage = document.getElementById('toastMessage');



  // Custom Alert Modal

  const customAlertOverlay = document.getElementById('customAlertOverlay');

  const customAlertTitle = document.getElementById('customAlertTitle');

  const customAlertMessage = document.getElementById('customAlertMessage');

  const customAlertBtn = document.getElementById('customAlertBtn');



  // --- STORAGE HELPERS ---

  function loadCart() {

    try {

      const saved = localStorage.getItem('omaki_cart');

      return saved ? JSON.parse(saved) : [];

    } catch (e) {

      return [];

    }

  }



  function saveCart() {

    try {

      localStorage.setItem('omaki_cart', JSON.stringify(cart));

    } catch (e) {}

  }



  // --- FORMATTERS ---

  function formatMoney(val) {

    return 'R$ ' + Number(val).toFixed(2).replace('.', ',');

  }



  function showToast(msg) {

    if (!toastMessage) return;

    toastMessage.textContent = msg;

    toastMessage.classList.add('show');

    setTimeout(() => {

      toastMessage.classList.remove('show');

    }, 2800);

  }



  // --- CUSTOM ELEGANT ALERT (REPLACES BROWSER ALERT - ZERO NATIVE ALERT) ---

  function showCustomAlert(title, message, inputToFocus = null) {

    let overlay = document.getElementById('customAlertOverlay');

    if (!overlay) {

      overlay = document.createElement('div');

      overlay.id = 'customAlertOverlay';

      overlay.className = 'custom-alert-overlay';

      overlay.innerHTML = `

        <div class="custom-alert-card">

          <div class="custom-alert-header">

            <div class="custom-alert-icon-badge">\u26A0\uFE0F</div>

            <h3 class="custom-alert-title" id="customAlertTitle">Atenção</h3>

          </div>

          <p class="custom-alert-message" id="customAlertMessage"></p>

          <div class="custom-alert-footer">

            <button type="button" class="custom-alert-btn" id="customAlertBtn">Entendido</button>

          </div>

        </div>

      `;

      document.body.appendChild(overlay);

    }



    const titleEl = document.getElementById('customAlertTitle');

    const msgEl = document.getElementById('customAlertMessage');

    const btnEl = document.getElementById('customAlertBtn');



    if (titleEl) titleEl.textContent = title || 'Atenção';

    if (msgEl) msgEl.textContent = message || '';

    overlay.style.display = 'flex';



    if (inputToFocus) {

      inputToFocus.classList.add('input-error');

      try {

        inputToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {

          try { inputToFocus.focus(); } catch (err) {}

        }, 250);

      } catch (e) {}

    }



    const closeHandler = () => {

      overlay.style.display = 'none';

      if (inputToFocus) {

        setTimeout(() => inputToFocus.classList.remove('input-error'), 1800);

        try { inputToFocus.focus(); } catch (e) {}

      }

      if (btnEl) btnEl.removeEventListener('click', closeHandler);

      overlay.removeEventListener('click', overlayHandler);

    };



    const overlayHandler = (e) => {

      if (e.target === overlay) closeHandler();

    };



    if (btnEl) btnEl.addEventListener('click', closeHandler);

    overlay.addEventListener('click', overlayHandler);

  }



  // --- NEIGHBORHOODS INIT ---

  function initNeighborhoods() {

    if (!orderNeighborhood || !data.neighborhoods) return;

    orderNeighborhood.innerHTML = '';

    data.neighborhoods.forEach((n, idx) => {

      const opt = document.createElement('option');

      opt.value = idx;

      opt.textContent = `${n.name} (Taxa: ${formatMoney(n.fee)})`;

      orderNeighborhood.appendChild(opt);

    });

    selectedNeighborhood = data.neighborhoods[0];



    orderNeighborhood.addEventListener('change', (e) => {

      selectedNeighborhood = data.neighborhoods[parseInt(e.target.value, 10)];

      updateTotals();

    });

  }



  // --- CATEGORIES NAVIGATION INIT (EXCLUSIVE SINGLE-CATEGORY VIEW) ---

  function initCategories() {

    if (!categoriesNav) return;

    categoriesNav.innerHTML = '';



    // "Todos" pill

    const allBtn = document.createElement('button');

    allBtn.className = 'category-tab-btn active';

    allBtn.textContent = '🌟 Todos os Pratos';

    allBtn.addEventListener('click', () => {

      document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));

      allBtn.classList.add('active');

      currentActiveCategory = 'all';

      renderMenu(searchInput ? searchInput.value : '', 'all');

      window.scrollTo({ top: 0, behavior: 'smooth' });

    });

    categoriesNav.appendChild(allBtn);



    CATEGORY_MAP.forEach(c => {

      const btn = document.createElement('button');

      btn.className = 'category-tab-btn';

      btn.textContent = c.title;

      btn.addEventListener('click', () => {

        document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        currentActiveCategory = c.id;

        // Filter view to show ONLY the selected category

        renderMenu(searchInput ? searchInput.value : '', c.id);

        window.scrollTo({ top: 0, behavior: 'smooth' });

      });

      categoriesNav.appendChild(btn);

    });



    // Arrow Buttons for Desktop Navigation

    if (navScrollLeft) {

      navScrollLeft.addEventListener('click', () => {

        categoriesNav.scrollBy({ left: -260, behavior: 'smooth' });

      });

    }



    if (navScrollRight) {

      navScrollRight.addEventListener('click', () => {

        categoriesNav.scrollBy({ left: 260, behavior: 'smooth' });

      });

    }



    // Mouse wheel horizontal scroll on Desktop

    categoriesNav.addEventListener('wheel', (e) => {

      if (e.deltaY !== 0) {

        e.preventDefault();

        categoriesNav.scrollLeft += e.deltaY * 1.2;

      }

    }, { passive: false });



    // Click and Drag for Desktop

    let isDown = false;

    let startX = 0;

    let scrollLeftPos = 0;



    categoriesNav.addEventListener('mousedown', (e) => {

      isDown = true;

      startX = e.pageX - categoriesNav.offsetLeft;

      scrollLeftPos = categoriesNav.scrollLeft;

    });



    categoriesNav.addEventListener('mouseleave', () => { isDown = false; });

    categoriesNav.addEventListener('mouseup', () => { isDown = false; });

    categoriesNav.addEventListener('mousemove', (e) => {

      if (!isDown) return;

      e.preventDefault();

      const x = e.pageX - categoriesNav.offsetLeft;

      const walk = (x - startX) * 1.5;

      categoriesNav.scrollLeft = scrollLeftPos - walk;

    });

  }



  // --- RENDER MENU (WITH PRICE ANCHORING & EXCLUSIVE CATEGORY FILTER) ---

  function renderMenu(searchTerm = '', categoryFilter = currentActiveCategory) {

    if (!menuContainer) return;

    menuContainer.innerHTML = '';

    const term = searchTerm.trim().toLowerCase();

    const dishesList = data.dishes || [];



    // Filter categories to show ONLY the selected one (or all if 'all')

    const targetCategories = (categoryFilter && categoryFilter !== 'all')

      ? CATEGORY_MAP.filter(c => c.id === categoryFilter)

      : CATEGORY_MAP;



    targetCategories.forEach(catDef => {

      let filteredDishes = dishesList.filter(dish => {

        const matchesCategory = catDef.match(dish);

        if (!matchesCategory) return false;



        if (!term) return true;



        // Search in dish properties

        const numStr = dish.num ? String(dish.num) : '';

        const codeStr = String(dish.code || '');

        const titleStr = (dish.title || dish.name || '').toLowerCase();

        const descStr = (dish.description || '').toLowerCase();

        const catStr = (dish.category || '').toLowerCase();

        const isNewMatch = dish.isNew && (term === 'novo' || term === 'novos' || term === 'promo');



        if (numStr.includes(term) || codeStr.includes(term) || titleStr.includes(term) || descStr.includes(term) || catStr.includes(term) || isNewMatch) {

          return true;

        }



        // Search inside options of grouped dishes

        if (dish.isGrouped && dish.options && dish.options.length > 0) {

          return dish.options.some(opt => {

            const optNum = opt.num ? String(opt.num) : '';

            const optCode = String(opt.code || '');

            const optName = (opt.name || '').toLowerCase();

            const optDesc = (opt.description || '').toLowerCase();

            return optNum.includes(term) || optCode.includes(term) || optName.includes(term) || optDesc.includes(term);

          });

        }



        return false;

      });



      if (filteredDishes.length === 0) return;



      // PRICE ANCHORING: Sort dishes from HIGHEST to LOWEST price in every category!

      filteredDishes.sort((a, b) => {

        const priceA = a.maxPrice || a.price || 0;

        const priceB = b.maxPrice || b.price || 0;

        return priceB - priceA;

      });



      const section = document.createElement('section');

      section.className = 'menu-category-section';

      section.id = catDef.id;



      const catHeader = document.createElement('div');

      catHeader.className = 'category-section-header';

      catHeader.innerHTML = `

        <h2 class="category-section-title">${catDef.title}</h2>

        <span class="category-section-count">${filteredDishes.length} ${filteredDishes.length === 1 ? 'item' : 'itens'}</span>

      `;

      section.appendChild(catHeader);



      const grid = document.createElement('div');

      grid.className = 'products-grid';



      filteredDishes.forEach(dish => {

        // If searched, check if an option matched specifically

        let matchedOptionCode = null;

        if (term && dish.isGrouped && dish.options) {

          const matchOpt = dish.options.find(opt => {

            const optNum = opt.num ? String(opt.num) : '';

            const optCode = String(opt.code || '');

            const optName = (opt.name || '').toLowerCase();

            return optNum.includes(term) || optCode.includes(term) || optName.includes(term);

          });

          if (matchOpt) matchedOptionCode = matchOpt.code || matchOpt.num;

        }



        const card = createProductCard(dish, matchedOptionCode);

        grid.appendChild(card);

      });



      section.appendChild(grid);

      menuContainer.appendChild(section);

    });



    if (menuContainer.children.length === 0) {

      menuContainer.innerHTML = `

        <div class="empty-state">

          <div class="empty-state-icon">🔍</div>

          <h3>Nenhum prato encontrado para "${searchTerm}"</h3>

          <p>Tente buscar pelo nome, número ou ingrediente do prato.</p>

        </div>

      `;

    }

  }



  // --- PRODUCT CARD COMPONENT ---

  function createProductCard(dish, matchedOptionCode = null) {

    const card = document.createElement('div');

    card.className = 'product-card';

    card.addEventListener('click', () => openItemModal(dish, matchedOptionCode));



    const imgWrapper = document.createElement('div');

    imgWrapper.className = 'product-card-img-wrapper';



    // Badge logic:

    // For single item with num and individual photo: show #005, #177, etc.

    // For combos: piece count is already prominent in title, do not show redundant portion badge

    // For grouped item: show portion (e.g. 200g, 2 un) or options count

    let tagBadge = '';

    if (dish.num) {

      tagBadge = `<span class="badge-item-num">#${String(dish.num).padStart(3, '0')}</span>`;

    } else if (dish.isNew) {

      tagBadge = `<span class="badge-item-num" style="background:#8b1e3f; border-color:#e5c07b; color:#fff;">✨ NOVO</span>`;

    }



    const isCombo = dish.category.toLowerCase().includes('combo') || (dish.num && dish.num >= 57 && dish.num <= 60) || (dish.num && dish.num >= 177 && dish.num <= 187) || dish.isNew;

    const portionBadge = (!isCombo && dish.portion) ? `<span class="badge-portion-pill">${dish.portion}</span>` : '';



    const photoSrc = dish.photo || dish.image;

    if (photoSrc) {

      const img = document.createElement('img');

      img.className = 'product-card-img';

      img.src = photoSrc;

      img.alt = dish.title || dish.name;

      img.loading = 'lazy';

      img.onerror = () => {

        imgWrapper.innerHTML = `

          <div class="product-card-no-img">🍣</div>

          <div class="product-card-badges">

            ${tagBadge}

            ${portionBadge}

          </div>

        `;

      };

      imgWrapper.appendChild(img);

    } else {

      const noImg = document.createElement('div');

      noImg.className = 'product-card-no-img';

      noImg.textContent = '🍣';

      imgWrapper.appendChild(noImg);

    }



    const isSoldOut = (adminState.soldOutIds || []).includes(dish.id);
    if (isSoldOut) {
      card.classList.add('is-sold-out');
    }

    const soldOutBadge = isSoldOut ? `<span class="sold-out-badge">Esgotado Hoje</span>` : '';

    const badges = document.createElement('div');

    badges.className = 'product-card-badges';

    badges.innerHTML = `

      ${tagBadge}

      ${portionBadge}

      ${soldOutBadge}

    `;

    imgWrapper.appendChild(badges);



    const content = document.createElement('div');

    content.className = 'product-card-content';

    const displayPrice = dish.priceLabel || formatMoney(dish.price);



    content.innerHTML = `

      <h3 class="product-card-title">${dish.title || dish.name}</h3>

      <p class="product-card-desc">${dish.description || 'Preparado na hora com ingredientes frescos e selecionados.'}</p>

      <div class="product-card-footer">

        <span class="product-price">${displayPrice}</span>

        <button type="button" class="product-add-btn ${isSoldOut ? 'btn-sold-out' : ''}" ${isSoldOut ? 'disabled' : ''}>

          <span>${isSoldOut ? 'Esgotado' : (dish.isGrouped ? 'Ver Opções' : '+ Adicionar')}</span>

        </button>

      </div>

    `;



    card.appendChild(imgWrapper);

    card.appendChild(content);

    return card;

  }



  // --- SEARCH EVENTS ---

  if (searchInput) {

    searchInput.addEventListener('input', (e) => {

      const val = e.target.value;

      if (clearSearchBtn) clearSearchBtn.style.display = val ? 'block' : 'none';

      renderMenu(val, currentActiveCategory);

    });

  }



  if (clearSearchBtn) {

    clearSearchBtn.addEventListener('click', () => {

      if (searchInput) searchInput.value = '';

      clearSearchBtn.style.display = 'none';

      renderMenu('', currentActiveCategory);

    });

  }



  // --- ITEM MODAL LOGIC (GROUPED DISHES & COMPLEMENTS) ---

  function openItemModal(dish, preselectedOptionCode = null) {

    if (!itemModal) return;

    currentModalDish = dish;

    currentModalQty = 1;

    selectedComplements = {};

    selectedSpecialOptions = {

      temakiFried: false,

      temakiNoRice: false,

      pokeToppings: [],

      pokeSauce: '',

      pokeDoubleProtein: false

    };



    const isCombo = dish.category.toLowerCase().includes('combo') || (dish.num && dish.num >= 57 && dish.num <= 60) || (dish.num && dish.num >= 177 && dish.num <= 187) || dish.isNew;



    // Set Image

    const photoSrc = dish.photo || dish.image;

    if (modalImgContainer) {

      if (photoSrc) {

        if (modalItemImg) modalItemImg.src = photoSrc;

        modalImgContainer.style.display = 'flex';

      } else {

        modalImgContainer.style.display = 'none';

      }

    }



    if (modalItemPortion) {

      if (!isCombo && dish.portion) {

        modalItemPortion.textContent = dish.portion;

        modalItemPortion.style.display = 'inline-block';

      } else {

        modalItemPortion.style.display = 'none';

      }

    }



    if (modalItemName) modalItemName.textContent = dish.title || dish.name;

    if (modalItemDesc) modalItemDesc.textContent = dish.description || 'Preparado artesanalmente com rigor metrológico e insumos de altíssima qualidade.';

    if (modalItemNotes) modalItemNotes.value = '';

    if (modalQtyValue) modalQtyValue.textContent = '1';



    // Handle Grouped Dishes with Options (e.g. Tatakis, Ceviches, Harumakis, Cervejas)

    if (dish.isGrouped && dish.options && dish.options.length > 0) {

      modalOptionsSection.style.display = 'block';



      // Pick default option

      if (preselectedOptionCode) {

        currentSelectedOption = dish.options.find(o => String(o.code) === String(preselectedOptionCode) || String(o.num) === String(preselectedOptionCode)) || dish.options[0];

      } else {

        currentSelectedOption = dish.options[0];

      }



      renderOptionsList(dish.options);

      updateModalHeaderWithOption(currentSelectedOption);

    } else {

      currentSelectedOption = null;

      modalOptionsSection.style.display = 'none';

      if (modalItemPrice) modalItemPrice.textContent = formatMoney(dish.price);

      if (modalItemNum) {

        modalItemNum.textContent = dish.num ? `#${String(dish.num).padStart(3, '0')}` : '✨ PROMO';

        modalItemNum.style.background = dish.num ? 'rgba(7, 10, 17, 0.9)' : '#8b1e3f';

        modalItemNum.style.borderColor = 'var(--accent-gold)';

        modalItemNum.style.color = dish.num ? 'var(--accent-gold)' : '#fff';

      }

    }



    // Handle Special Customization (Temakis & Pokes)

    renderSpecialCustomizations(dish);



    // Complements List (Hide for beverages, and provide quantity stepper)

    const modalComplementsSection = document.getElementById('modalComplementsSection');

    const isBeverage = dish.category.includes('Bebida') || dish.category.includes('Cerveja') || dish.category.includes('Refrigerante') || dish.category.includes('Suco') || dish.category.includes('Sakê') || dish.id === 'sucos_group' || dish.id === 'cervejas_group' || dish.id === 'refrigerantes_group' || dish.id === 'sake_group';



    const dishCompIds = dish.complements || [];

    const availableComps = (data.complements || []).filter(c => dishCompIds.includes(c.id));



    if (isBeverage || availableComps.length === 0 || dish.id === 'molhos_group' || (dish.category && dish.category.includes('Adicionais'))) {

      if (modalComplementsSection) modalComplementsSection.style.display = 'none';

      if (modalComplementsList) modalComplementsList.innerHTML = '';

    } else {

      if (modalComplementsSection) modalComplementsSection.style.display = 'block';

      if (modalComplementsList) {

        modalComplementsList.innerHTML = '';

        availableComps.forEach(cmp => {

          const row = document.createElement('div');

          row.className = 'complement-item';

          row.id = `comp-row-${cmp.id}`;

          row.innerHTML = `

            <div class="complement-left">

              <span class="complement-name">${cmp.name}</span>

              <span class="complement-price">+ ${formatMoney(cmp.price)}</span>

            </div>

            <div class="complement-stepper">

              <button type="button" class="comp-stepper-btn comp-btn-minus" data-id="${cmp.id}" aria-label="Diminuir">−</button>

              <span class="comp-qty-value" id="comp-qty-${cmp.id}">0</span>

              <button type="button" class="comp-stepper-btn comp-btn-plus" data-id="${cmp.id}" aria-label="Aumentar">+</button>

            </div>

          `;



          const minusBtn = row.querySelector('.comp-btn-minus');

          const plusBtn = row.querySelector('.comp-btn-plus');

          const qtySpan = row.querySelector('.comp-qty-value');



          row.addEventListener('click', (e) => {

            if (e.target.closest('.comp-stepper-btn')) return;

            let current = selectedComplements[cmp.id] || 0;

            if (current === 0) {

              current = 1;

              selectedComplements[cmp.id] = current;

              row.classList.add('selected');

              qtySpan.textContent = current;

              updateModalTotal();

            }

          });



          minusBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            let current = selectedComplements[cmp.id] || 0;

            if (current > 0) {

              current--;

              if (current === 0) {

                delete selectedComplements[cmp.id];

                row.classList.remove('selected');

              } else {

                selectedComplements[cmp.id] = current;

              }

              qtySpan.textContent = current;

              updateModalTotal();

            }

          });



          plusBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            let current = selectedComplements[cmp.id] || 0;

            current++;

            selectedComplements[cmp.id] = current;

            row.classList.add('selected');

            qtySpan.textContent = current;

            updateModalTotal();

          });



          modalComplementsList.appendChild(row);

        });

      }

    }



    // Render Combo Drinks Section (Adicional de Bebidas para Combos)
    renderComboDrinksSection(dish);

    updateModalTotal();

    itemModal.style.display = 'flex';

    document.body.style.overflow = 'hidden';

  }



  // Render Options without raw numbers in visible string (clean user-facing names)

  
  // --- COMBO DRINKS UPSELL SYSTEM (BEBIDAS ESTRATÉGICAS NOS COMBOS) ---
  function isComboDish(dish) {
    if (!dish) return false;
    const cat = (dish.category || '').toLowerCase();
    const name = (dish.name || '').toLowerCase();
    const id = (dish.id || '').toLowerCase();
    return cat.includes('combo') || id.includes('combo') || name.includes('combo') || name.includes('camarão imperial - 25');
  }

  function renderComboDrinksSection(dish) {
    const modalComboDrinksSection = document.getElementById('modalComboDrinksSection');
    const comboDrinksTabs = document.getElementById('comboDrinksTabs');
    const modalComboDrinksList = document.getElementById('modalComboDrinksList');

    if (!modalComboDrinksSection || !comboDrinksTabs || !modalComboDrinksList) return;

    if (!isComboDish(dish) || !data.comboBeverages || data.comboBeverages.length === 0) {
      modalComboDrinksSection.style.display = 'none';
      selectedComboDrinks = {};
      return;
    }

    modalComboDrinksSection.style.display = 'block';

    function updateTabsUI() {
      comboDrinksTabs.innerHTML = '';
      data.comboBeverages.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `combo-drink-tab-btn ${cat.id === currentActiveDrinkTab ? 'active' : ''}`;
        
        let catCount = 0;
        (cat.items || []).forEach(item => {
          if (selectedComboDrinks[item.id] && selectedComboDrinks[item.id].qty > 0) {
            catCount += selectedComboDrinks[item.id].qty;
          }
        });

        const badgeHtml = catCount > 0 ? `<span class="combo-tab-badge">${catCount}</span>` : '';
        btn.innerHTML = `<span>${cat.icon}</span> <span>${cat.shortName}</span> ${badgeHtml}`;

        btn.addEventListener('click', () => {
          currentActiveDrinkTab = cat.id;
          updateTabsUI();
          renderDrinkItems();
        });

        comboDrinksTabs.appendChild(btn);
      });
    }

    function renderDrinkItems() {
      modalComboDrinksList.innerHTML = '';
      const currentCat = data.comboBeverages.find(c => c.id === currentActiveDrinkTab) || data.comboBeverages[0];
      if (!currentCat || !currentCat.items) return;

      currentCat.items.forEach(drink => {
        const currentQty = (selectedComboDrinks[drink.id] && selectedComboDrinks[drink.id].qty) || 0;
        const row = document.createElement('div');
        row.className = `combo-drink-item ${currentQty > 0 ? 'selected' : ''}`;
        row.id = `drink-row-${drink.id}`;

        row.innerHTML = `
          <div class="combo-drink-info">
            <span class="combo-drink-title">${currentCat.icon} ${drink.name}</span>
            <span class="combo-drink-price">+ ${formatMoney(drink.price)}</span>
          </div>
          <div class="combo-drink-stepper">
            <button type="button" class="combo-drink-btn drink-btn-minus" data-id="${drink.id}" aria-label="Diminuir">−</button>
            <span class="combo-drink-qty" id="drink-qty-${drink.id}">${currentQty}</span>
            <button type="button" class="combo-drink-btn drink-btn-plus" data-id="${drink.id}" aria-label="Aumentar">+</button>
          </div>
        `;

        const minusBtn = row.querySelector('.drink-btn-minus');
        const plusBtn = row.querySelector('.drink-btn-plus');
        const qtySpan = row.querySelector('.combo-drink-qty');

        row.addEventListener('click', (e) => {
          if (e.target.closest('.combo-drink-btn')) return;
          let qty = (selectedComboDrinks[drink.id] && selectedComboDrinks[drink.id].qty) || 0;
          if (qty === 0) {
            qty = 1;
            selectedComboDrinks[drink.id] = {
              id: drink.id,
              num: drink.num,
              name: drink.name,
              price: drink.price,
              icon: currentCat.icon,
              qty: qty
            };
            row.classList.add('selected');
            qtySpan.textContent = qty;
            updateTabsUI();
            updateModalTotal();
          }
        });

        minusBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          let qty = (selectedComboDrinks[drink.id] && selectedComboDrinks[drink.id].qty) || 0;
          if (qty > 0) {
            qty--;
            if (qty === 0) {
              delete selectedComboDrinks[drink.id];
              row.classList.remove('selected');
            } else {
              selectedComboDrinks[drink.id].qty = qty;
            }
            qtySpan.textContent = qty;
            updateTabsUI();
            updateModalTotal();
          }
        });

        plusBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          let qty = (selectedComboDrinks[drink.id] && selectedComboDrinks[drink.id].qty) || 0;
          qty++;
          selectedComboDrinks[drink.id] = {
            id: drink.id,
            num: drink.num,
            name: drink.name,
            price: drink.price,
            icon: currentCat.icon,
            qty: qty
          };
          row.classList.add('selected');
          qtySpan.textContent = qty;
          updateTabsUI();
          updateModalTotal();
        });

        modalComboDrinksList.appendChild(row);
      });
    }

    updateTabsUI();
    renderDrinkItems();
  }


  function renderOptionsList(options) {

    if (!modalOptionsList) return;

    modalOptionsList.innerHTML = '';



    options.forEach(opt => {

      const isSelected = currentSelectedOption && (String(opt.code) === String(currentSelectedOption.code) || opt.num === currentSelectedOption.num);

      const row = document.createElement('label');

      row.className = `option-item ${isSelected ? 'selected' : ''}`;

      row.innerHTML = `

        <div class="option-left">

          <input type="radio" name="modalDishOptionRadio" value="${opt.code || opt.num}" ${isSelected ? 'checked' : ''} style="display:none;">
          <span class="option-radio-custom" aria-hidden="true"></span>

          <div class="option-details">

            <span class="option-name">${opt.name}</span>

            ${opt.description && opt.description !== opt.name ? `<p class="option-desc">${opt.description}</p>` : ''}

          </div>

        </div>

        <span class="option-price">${formatMoney(opt.price)}</span>

      `;



      row.querySelector('input').addEventListener('change', () => {

        currentSelectedOption = opt;

        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));

        row.classList.add('selected');

        updateModalHeaderWithOption(opt);

        updateModalTotal();

      });



      modalOptionsList.appendChild(row);

    });

  }



    function updateModalHeaderWithOption(opt) {
    if (!opt) return;
    if (modalItemPrice) modalItemPrice.textContent = formatMoney(opt.price);
    if (modalItemNum) {
      modalItemNum.textContent = opt.num ? `#${String(opt.num).padStart(3, '0')}` : '✨ PROMO';
      modalItemNum.style.background = 'rgba(7, 10, 17, 0.9)';
      modalItemNum.style.borderColor = 'var(--accent-gold)';
      modalItemNum.style.color = 'var(--accent-gold)';
    }
    if (modalItemPortion) {
      const portionText = opt.portion || (currentModalDish ? currentModalDish.portion : '');
      if (portionText) {
        modalItemPortion.textContent = portionText;
        modalItemPortion.style.display = 'inline-block';
      } else {
        modalItemPortion.style.display = 'none';
      }
    }
  }

  function renderSpecialCustomizations(dish) {
    if (!modalSpecialSection || !modalSpecialContent) return;

    const isTemaki = (dish.category && dish.category.includes('Temaki')) || dish.id === 'temaki_group' || dish.id === 'cat-temakis';
    const isPoke = dish.isPoke || dish.id === 'poke_group';

    if (!isTemaki && !isPoke) {
      modalSpecialSection.style.display = 'none';
      modalSpecialContent.innerHTML = '';
      selectedSpecialOptions = {
        temakiFried: false,
        temakiNoRice: false,
        pokeDoubleProtein: false,
        pokeProteinQty: 0,
        pokeSauces: {},
        pokeToppings: {}
      };
      return;
    }

    modalSpecialSection.style.display = 'block';

    if (isTemaki) {
      modalSpecialContent.innerHTML = `
        <div class="special-custom-group">
          <div class="special-group-header">
            <h4>Preparo do Temaki</h4>
            <span class="optional-tag">Opcional</span>
          </div>
          <p class="section-hint">Personalize a textura e o acabamento do seu Temaki:</p>
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
            <label class="poke-extra-protein-card" id="cardTemakiFried">
              <div class="protein-left">
                <input type="checkbox" id="checkTemakiFried">
                <span class="poke-chip-indicator"></span>
                <div class="protein-info">
                  <span class="protein-title">Empanar Temaki</span>
                  <span class="protein-sub">Frito na hora, quente e super crocante</span>
                </div>
              </div>
              <span class="protein-price">+ ${formatMoney(9.00)}</span>
            </label>
            <label class="poke-extra-protein-card" id="cardTemakiNoRice">
              <div class="protein-left">
                <input type="checkbox" id="checkTemakiNoRice">
                <span class="poke-chip-indicator"></span>
                <div class="protein-info">
                  <span class="protein-title">Substituir arroz por salmão</span>
                  <span class="protein-sub">Sem arroz (100% recheio nobre de salmão)</span>
                </div>
              </div>
              <span class="protein-price">+ ${formatMoney(16.00)}</span>
            </label>
          </div>
        </div>
      `;

      const friedCb = document.getElementById('checkTemakiFried');
      const noRiceCb = document.getElementById('checkTemakiNoRice');

      if (friedCb) {
        friedCb.addEventListener('change', () => {
          selectedSpecialOptions.temakiFried = friedCb.checked;
          const card = document.getElementById('cardTemakiFried');
          if (card) card.classList.toggle('selected', friedCb.checked);
          updateModalTotal();
        });
      }
      if (noRiceCb) {
        noRiceCb.addEventListener('change', () => {
          selectedSpecialOptions.temakiNoRice = noRiceCb.checked;
          const card = document.getElementById('cardTemakiNoRice');
          if (card) card.classList.toggle('selected', noRiceCb.checked);
          updateModalTotal();
        });
      }

    } else if (isPoke) {
      const toppings = dish.pokeToppings || [
        'Cebolinha', 'Manga', 'Pepino fatiado', 'Tomate cereja', 'Avocado',
        'Cebola roxa', 'Kani', 'Crispy de alho-poró', 'Crispy de couve',
        'Crispy de Batata', 'Gergelim', 'Gengibre', 'Cenoura', 'Alga',
        'Crispy de Harumaki'
      ];
      const sauces = [
        'Molho especial trufado',
        'Molho especial do Chef',
        'Molho Tataki',
        'Molho cítrico',
        'Philadelphia'
      ];

      // Initialize Poke state with support for quantities & repeated items
      selectedSpecialOptions.pokeToppings = {};
      selectedSpecialOptions.pokeSauces = {}; // Inicia vazio para escolha obrigatoria do cliente
      selectedSpecialOptions.pokeProteinQty = 0;

      let pokeHtml = `
        <div class="special-custom-group" id="pokeToppingsSection">
          <div class="special-group-header">
            <div class="special-title-wrap">
              <h4>Acompanhamentos</h4>
              <span class="special-tag-required">Obrigatório</span>
            </div>
            <span class="special-badge-counter required" id="pokeToppingsCounter">0 de 6</span>
          </div>
          <p class="section-hint">Escolha 6 acompanhamentos inclusos (obrigatório; você pode repetir opções; adicionais por +R$ 8,00 cada além do 6º):</p>
          <div class="poke-chips-grid">
      `;

      toppings.forEach(top => {
        pokeHtml += `
          <div class="poke-chip" data-top="${top}">
            <span class="poke-chip-label">${top}</span>
            <div class="poke-chip-stepper" style="display:none;">
              <button type="button" class="poke-chip-step-btn btn-top-minus" aria-label="Diminuir">-</button>
              <span class="poke-chip-qty">0x</span>
              <button type="button" class="poke-chip-step-btn btn-top-plus" aria-label="Aumentar">+</button>
            </div>
            <button type="button" class="poke-chip-add-btn btn-top-add" aria-label="Adicionar">+</button>
          </div>
        `;
      });

      pokeHtml += `
          </div>
        </div>

        <div class="special-custom-group" id="pokeSaucesSection">
          <div class="special-group-header">
            <div class="special-title-wrap">
              <h4>Molho do Chef</h4>
              <span class="special-tag-required">Obrigatório</span>
            </div>
            <span class="special-badge-counter required" id="pokeSaucesCounter">0 de 1</span>
          </div>
          <p class="section-hint">Escolha 1 molho incluso (obrigatório; você pode adicionar mais por +R$ 9,00 cada além do 1º):</p>
          <div class="poke-chips-grid">
      `;

      sauces.forEach((sc) => {
        pokeHtml += `
          <div class="poke-chip" data-sauce="${sc}">
            <span class="poke-chip-label">${sc}</span>
            <div class="poke-chip-stepper" style="display:none;">
              <button type="button" class="poke-chip-step-btn btn-sauce-minus" aria-label="Diminuir">-</button>
              <span class="poke-chip-qty">0x</span>
              <button type="button" class="poke-chip-step-btn btn-sauce-plus" aria-label="Aumentar">+</button>
            </div>
            <button type="button" class="poke-chip-add-btn btn-sauce-add" style="display:flex;" aria-label="Adicionar">+</button>
          </div>
        `;
      });

      pokeHtml += `
          </div>
        </div>

        <div class="special-custom-group">
          <div class="special-group-header">
            <h4>Proteína Extra</h4>
            <span class="optional-tag">Opcional</span>
          </div>
          <div class="poke-extra-protein-card" id="cardPokeDoubleProtein">
            <div class="protein-left">
              <div class="protein-info">
                <span class="protein-title">Doses Extras de Proteína (+80g cada)</span>
                <span class="protein-sub">Aumente ou duplique o peixe nobre fresco (+R$ 25,00 cada 80g)</span>
              </div>
            </div>
            <div class="protein-stepper-wrapper">
              <div class="poke-chip-stepper">
                <button type="button" class="poke-chip-step-btn" id="btnPokeProtMinus" aria-label="Diminuir">-</button>
                <span class="poke-chip-qty" id="valPokeProtQty">0</span>
                <button type="button" class="poke-chip-step-btn" id="btnPokeProtPlus" aria-label="Aumentar">+</button>
              </div>
              <span class="protein-price" id="lblPokeProtPrice">+ R$ 0,00</span>
            </div>
          </div>
        </div>
      `;

      modalSpecialContent.innerHTML = pokeHtml;

      // Event handlers for Topping Steppers
      const topCounterEl = document.getElementById('pokeToppingsCounter');
      function updateToppingsUI() {
        const total = Object.values(selectedSpecialOptions.pokeToppings).reduce((a, b) => a + b, 0);
        if (topCounterEl) {
          if (total === 0) {
            topCounterEl.className = 'special-badge-counter required';
            topCounterEl.textContent = '0 de 6';
          } else if (total < 6) {
            topCounterEl.className = 'special-badge-counter required';
            topCounterEl.textContent = `${total} de 6`;
          } else if (total === 6) {
            topCounterEl.className = 'special-badge-counter ready';
            topCounterEl.textContent = '✓ 6 de 6';
          } else {
            const extras = total - 6;
            topCounterEl.className = 'special-badge-counter ready';
            topCounterEl.textContent = `${total} (+${extras} extra)`;
          }
        }
        updateModalTotal();
      }

      modalSpecialContent.querySelectorAll('.poke-chip[data-top]').forEach(chip => {
        const topName = chip.getAttribute('data-top');
        const stepper = chip.querySelector('.poke-chip-stepper');
        const addBtn = chip.querySelector('.btn-top-add');
        const qtySpan = chip.querySelector('.poke-chip-qty');
        const btnMinus = chip.querySelector('.btn-top-minus');
        const btnPlus = chip.querySelector('.btn-top-plus');

        function setQty(q) {
          if (q > 0) {
            selectedSpecialOptions.pokeToppings[topName] = q;
            chip.classList.add('selected');
            stepper.style.display = 'flex';
            addBtn.style.display = 'none';
            qtySpan.textContent = `${q}x`;
          } else {
            delete selectedSpecialOptions.pokeToppings[topName];
            chip.classList.remove('selected');
            stepper.style.display = 'none';
            addBtn.style.display = 'flex';
            qtySpan.textContent = '0x';
          }
          updateToppingsUI();
        }

        chip.addEventListener('click', (e) => {
          if (e.target.closest('.poke-chip-step-btn')) return;
          const cur = selectedSpecialOptions.pokeToppings[topName] || 0;
          if (cur === 0) setQty(1);
        });

        btnPlus.addEventListener('click', (e) => {
          e.stopPropagation();
          const cur = selectedSpecialOptions.pokeToppings[topName] || 0;
          setQty(cur + 1);
        });

        btnMinus.addEventListener('click', (e) => {
          e.stopPropagation();
          const cur = selectedSpecialOptions.pokeToppings[topName] || 0;
          setQty(Math.max(0, cur - 1));
        });
      });

      // Event handlers for Sauce Steppers
      const sauceCounterEl = document.getElementById('pokeSaucesCounter');
      function updateSaucesUI() {
        const total = Object.values(selectedSpecialOptions.pokeSauces).reduce((a, b) => a + b, 0);
        if (sauceCounterEl) {
          if (total === 0) {
            sauceCounterEl.className = 'special-badge-counter required';
            sauceCounterEl.textContent = '0 de 1';
          } else if (total === 1) {
            sauceCounterEl.className = 'special-badge-counter ready';
            sauceCounterEl.textContent = '✓ 1 incluso';
          } else {
            const extras = total - 1;
            sauceCounterEl.className = 'special-badge-counter ready';
            sauceCounterEl.textContent = `${total} (+${extras} extra)`;
          }
        }
        updateModalTotal();
      }

      modalSpecialContent.querySelectorAll('.poke-chip[data-sauce]').forEach(chip => {
        const sName = chip.getAttribute('data-sauce');
        const stepper = chip.querySelector('.poke-chip-stepper');
        const addBtn = chip.querySelector('.btn-sauce-add');
        const qtySpan = chip.querySelector('.poke-chip-qty');
        const btnMinus = chip.querySelector('.btn-sauce-minus');
        const btnPlus = chip.querySelector('.btn-sauce-plus');

        function setSauceQty(q) {
          const totalOther = Object.entries(selectedSpecialOptions.pokeSauces)
            .filter(([k]) => k !== sName)
            .reduce((sum, [_, val]) => sum + val, 0);

// Permite 0 para exibir o alerta obrigatorio caso desselecionado

          if (q > 0) {
            selectedSpecialOptions.pokeSauces[sName] = q;
            chip.classList.add('selected');
            stepper.style.display = 'flex';
            addBtn.style.display = 'none';
            qtySpan.textContent = `${q}x`;
          } else {
            delete selectedSpecialOptions.pokeSauces[sName];
            chip.classList.remove('selected');
            stepper.style.display = 'none';
            addBtn.style.display = 'flex';
            qtySpan.textContent = '0x';
          }
          updateSaucesUI();
        }

        chip.addEventListener('click', (e) => {
          if (e.target.closest('.poke-chip-step-btn')) return;
          const cur = selectedSpecialOptions.pokeSauces[sName] || 0;
          if (cur === 0) {
            const curTotal = Object.values(selectedSpecialOptions.pokeSauces).reduce((a, b) => a + b, 0);
            if (curTotal === 1) {
              // Troca com 1 clique: desseleciona o outro molho e seleciona o novo
              modalSpecialContent.querySelectorAll('.poke-chip[data-sauce]').forEach(c => {
                c.classList.remove('selected');
                const st = c.querySelector('.poke-chip-stepper');
                const ab = c.querySelector('.btn-sauce-add');
                const qs = c.querySelector('.poke-chip-qty');
                if (st) st.style.display = 'none';
                if (ab) ab.style.display = 'flex';
                if (qs) qs.textContent = '0x';
              });
              selectedSpecialOptions.pokeSauces = {};
            }
            setSauceQty(1);
          }
        });

        btnPlus.addEventListener('click', (e) => {
          e.stopPropagation();
          const cur = selectedSpecialOptions.pokeSauces[sName] || 0;
          setSauceQty(cur + 1);
        });

        btnMinus.addEventListener('click', (e) => {
          e.stopPropagation();
          const cur = selectedSpecialOptions.pokeSauces[sName] || 0;
          setSauceQty(Math.max(0, cur - 1));
        });
      });

      // Event handlers for Extra Protein Stepper
      const cardProt = document.getElementById('cardPokeDoubleProtein');
      const valProtQty = document.getElementById('valPokeProtQty');
      const lblProtPrice = document.getElementById('lblPokeProtPrice');
      const btnProtMinus = document.getElementById('btnPokeProtMinus');
      const btnProtPlus = document.getElementById('btnPokeProtPlus');

      function setProteinQty(q) {
        selectedSpecialOptions.pokeProteinQty = q;
        if (valProtQty) valProtQty.textContent = q;
        if (lblProtPrice) lblProtPrice.textContent = q > 0 ? `+ ${formatMoney(q * 25.00)}` : '+ R$ 0,00';
        if (cardProt) cardProt.classList.toggle('selected', q > 0);
        updateModalTotal();
      }

      if (btnProtPlus) {
        btnProtPlus.addEventListener('click', () => {
          setProteinQty((selectedSpecialOptions.pokeProteinQty || 0) + 1);
        });
      }
      if (btnProtMinus) {
        btnProtMinus.addEventListener('click', () => {
          setProteinQty(Math.max(0, (selectedSpecialOptions.pokeProteinQty || 0) - 1));
        });
      }
    }
  }

  function updateModalTotal() {
    if (!currentModalDish) return;
    let basePrice = currentModalDish.isGrouped && currentSelectedOption ? currentSelectedOption.price : currentModalDish.price;

    // Special options extras
    if (selectedSpecialOptions.temakiFried) basePrice += 9.00;
    if (selectedSpecialOptions.temakiNoRice) basePrice += 16.00;

    // Poke extras
    if (selectedSpecialOptions.pokeProteinQty > 0) {
      basePrice += selectedSpecialOptions.pokeProteinQty * 25.00;
    }

    if (selectedSpecialOptions.pokeToppings) {
      const totalTops = Object.values(selectedSpecialOptions.pokeToppings).reduce((a, b) => a + b, 0);
      if (totalTops > 6) {
        basePrice += (totalTops - 6) * 8.00;
      }
    }

    if (selectedSpecialOptions.pokeSauces) {
      const totalSauces = Object.values(selectedSpecialOptions.pokeSauces).reduce((a, b) => a + b, 0);
      if (totalSauces > 1) {
        basePrice += (totalSauces - 1) * 9.00;
      }
    }

    // Complements total
    let compTotal = 0;
    Object.keys(selectedComplements).forEach(cmpId => {
      const qty = selectedComplements[cmpId] || 0;
      if (qty > 0) {
        const cmp = data.complements.find(c => c.id === cmpId);
        if (cmp) compTotal += cmp.price * qty;
      }
    });

    // Combo drinks total
    let comboDrinksTotal = 0;
    Object.keys(selectedComboDrinks).forEach(dId => {
      const d = selectedComboDrinks[dId];
      if (d && d.qty > 0) {
        comboDrinksTotal += d.price * d.qty;
      }
    });

    const singleTotal = basePrice + compTotal + comboDrinksTotal;
    const finalTotal = singleTotal * currentModalQty;

    if (modalAddTotalPrice) modalAddTotalPrice.textContent = formatMoney(finalTotal);
  }

  function closeItemModal(fromPopState = false) {
    if (!itemModal) return;
    itemModal.style.display = 'none';
    document.body.style.overflow = '';
    if (!fromPopState && history.state && history.state.omakiView === 'item-modal') {
      try { history.back(); } catch (e) {}
    }
  }

  if (closeItemModalBtn) closeItemModalBtn.addEventListener('click', () => closeItemModal());
  if (backItemModalBtn) backItemModalBtn.addEventListener('click', () => closeItemModal());
  if (itemModal) {
    itemModal.addEventListener('click', (e) => {
      if (e.target === itemModal) closeItemModal();
    });
  }

  if (modalQtyMinus) {
    modalQtyMinus.addEventListener('click', () => {
      if (currentModalQty > 1) {
        currentModalQty--;
        if (modalQtyValue) modalQtyValue.textContent = currentModalQty;
        updateModalTotal();
      }
    });
  }

  if (modalQtyPlus) {
    modalQtyPlus.addEventListener('click', () => {
      currentModalQty++;
      if (modalQtyValue) modalQtyValue.textContent = currentModalQty;
      updateModalTotal();
    });
  }

  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (!currentModalDish) return;

      // Validação Estrita para Poke (Obrigatório 6 acompanhamentos e 1 molho)
      const isPokeDish = currentModalDish.isPoke ||
                         currentModalDish.id === 'poke_group' ||
                         (currentModalDish.category && currentModalDish.category.toLowerCase().includes('poke')) ||
                         (currentModalDish.name && currentModalDish.name.toLowerCase().includes('poke'));

      if (isPokeDish) {
        const totalToppings = Object.values(selectedSpecialOptions.pokeToppings || {}).reduce((a, b) => a + b, 0);
        if (totalToppings < 6) {
          const missing = 6 - totalToppings;
          showCustomAlert(
            'Acompanhamentos Obrigatórios',
            `O seu Poke inclui 6 acompanhamentos obrigatórios.\n\nAtualmente você escolheu ${totalToppings} de 6.\nPor favor, adicione mais ${missing} acompanhamento${missing > 1 ? 's' : ''} antes de adicionar à sacola.`
          );
          const topSec = document.getElementById('pokeToppingsSection');
          if (topSec) {
            topSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
            topSec.classList.add('section-attention');
            setTimeout(() => topSec.classList.remove('section-attention'), 1500);
          }
          return;
        }

        const totalSauces = Object.values(selectedSpecialOptions.pokeSauces || {}).reduce((a, b) => a + b, 0);
        if (totalSauces < 1) {
          showCustomAlert(
            'Molho Obrigatório',
            'Por favor, escolha pelo menos 1 molho incluso para o seu Poke antes de adicionar à sacola.'
          );
          const sauceSec = document.getElementById('pokeSaucesSection');
          if (sauceSec) {
            sauceSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
            sauceSec.classList.add('section-attention');
            setTimeout(() => sauceSec.classList.remove('section-attention'), 1500);
          }
          return;
        }
      }

      let canonicalItem = {};
      if (currentModalDish.isGrouped) {
        if (!currentSelectedOption) {
          showCustomAlert('Opção Obrigatória', 'Por favor, selecione qual corte ou sabor você deseja antes de adicionar.');
          return;
        }
        canonicalItem = {
          id: currentSelectedOption.id || `dish_${currentSelectedOption.code || currentSelectedOption.num}`,
          num: currentSelectedOption.num || currentModalDish.num,
          name: `${currentModalDish.name} • ${currentSelectedOption.name}`,
          price: currentSelectedOption.price,
          category: currentModalDish.category,
          image: currentModalDish.image
        };
      } else {
        canonicalItem = {
          id: currentModalDish.id,
          num: currentModalDish.num,
          name: currentModalDish.name,
          price: currentModalDish.price,
          category: currentModalDish.category,
          image: currentModalDish.image
        };
      }

      // Collect selected complements with quantities
      const complements = [];
      Object.keys(selectedComplements).forEach(cmpId => {
        const qty = selectedComplements[cmpId] || 0;
        if (qty > 0) {
          const cmp = data.complements.find(c => c.id === cmpId);
          if (cmp) {
            complements.push({
              id: cmp.id,
              num: cmp.num,
              name: cmp.name,
              price: cmp.price,
              qty: qty
            });
          }
        }
      });

      // Collect selected combo drinks with quantities (PROPERLY DEFINED IN THIS SCOPE!)
      const drinks = [];
      Object.keys(selectedComboDrinks).forEach(dId => {
        const d = selectedComboDrinks[dId];
        if (d && d.qty > 0) {
          drinks.push({
            id: d.id,
            num: d.num,
            name: d.name,
            price: d.price,
            qty: d.qty
          });
        }
      });

      // Special notes summary & extra pricing
      const specialNotes = [];
      let extraPrice = 0;

      if (selectedSpecialOptions.temakiFried) {
        extraPrice += 9.00;
        specialNotes.push('Empanar Temaki (+R$ 9,00)');
      }
      if (selectedSpecialOptions.temakiNoRice) {
        extraPrice += 16.00;
        specialNotes.push('Substituir arroz por salmão (+R$ 16,00)');
      }

      // Poke extra protein
      if (selectedSpecialOptions.pokeProteinQty > 0) {
        const pQty = selectedSpecialOptions.pokeProteinQty;
        extraPrice += pQty * 25.00;
        specialNotes.push(`Proteína Extra: ${pQty}x (+${pQty * 80}g: +${formatMoney(pQty * 25.00)})`);
      }

      // Poke sauces with quantities
      if (selectedSpecialOptions.pokeSauces) {
        const sEntries = Object.entries(selectedSpecialOptions.pokeSauces).filter(([_, q]) => q > 0);
        const totalSauces = sEntries.reduce((sum, [_, q]) => sum + q, 0);
        if (totalSauces > 0) {
          const extraS = Math.max(0, totalSauces - 1);
          if (extraS > 0) extraPrice += extraS * 9.00;
          const sauceTxt = sEntries.map(([name, q]) => q > 1 ? `${q}x ${name}` : name).join(', ');
          specialNotes.push(`Molhos: ${sauceTxt}${extraS > 0 ? ` (+${extraS} extra: +${formatMoney(extraS * 9.00)})` : ''}`);
        }
      }

      // Poke toppings with quantities
      if (selectedSpecialOptions.pokeToppings) {
        const tEntries = Object.entries(selectedSpecialOptions.pokeToppings).filter(([_, q]) => q > 0);
        const totalTops = tEntries.reduce((sum, [_, q]) => sum + q, 0);
        if (totalTops > 0) {
          const extraT = Math.max(0, totalTops - 6);
          if (extraT > 0) extraPrice += extraT * 8.00;
          const topTxt = tEntries.map(([name, q]) => q > 1 ? `${q}x ${name}` : name).join(', ');
          specialNotes.push(`Acomp: ${topTxt}${extraT > 0 ? ` (+${extraT} extra: +${formatMoney(extraT * 8.00)})` : ''}`);
        }
      }

      const userNotes = modalItemNotes ? modalItemNotes.value.trim() : '';
      const fullNotes = [...specialNotes, userNotes].filter(Boolean).join(' | ');

      // Base price of item includes extra special options
      canonicalItem.price = canonicalItem.price + extraPrice;

      const entry = {
        id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        item: canonicalItem,
        qty: currentModalQty,
        complements: complements,
        drinks: drinks,
        notes: fullNotes
      };

      cart.push(entry);
      saveCart(cart);
      updateCartUI();
      closeItemModal();

      showToast(`🛒 ${canonicalItem.name} adicionado à sacola!`);
    });
  }

  // --- RENDER CART ITEMS IN DRAWER (LUXURY CARDS WITH FULL STYLING) ---

  function renderCartItems() {

    if (!cartItemsList) return;

    cartItemsList.innerHTML = '';



    if (cart.length === 0) {

      cartItemsList.innerHTML = `

        <div class="cart-empty-message">

          <div class="empty-icon">🍣</div>

          <h4>Sua sacola está vazia</h4>

          <p>Adicione pratos deliciosos do nosso cardápio para fazer o pedido.</p>

        </div>

      `;

      return;

    }



    cart.forEach((entry, index) => {

      const card = document.createElement('div');

      card.className = 'cart-item-card';



      const tagHtml = entry.item.num 

        ? `<span class="cart-item-badge-code">#${String(entry.item.num).padStart(3, '0')}</span>`

        : `<span class="cart-item-badge-code" style="background:#8b1e3f; color:#fff;">NOVO</span>`;



      let unitPrice = entry.item.price;

      let compHtml = '';

      if (entry.complements && entry.complements.length > 0) {

        compHtml += '<div class="cart-complements-box">';

        entry.complements.forEach(c => {

          const compQty = c.qty || 1;

          const compTotal = c.price * compQty;

          unitPrice += compTotal;

          compHtml += `

            <div class="cart-complement-line">

              <span>➕ ${compQty > 1 ? `<b>${compQty}x</b> ` : ''}${c.name}</span>

              <span class="cart-complement-price">+ ${formatMoney(compTotal)}</span>

            </div>

          `;

        });

        compHtml += '</div>';

      }



      let drinksHtml = '';
      if (entry.drinks && entry.drinks.length > 0) {
        drinksHtml += '<div class="cart-drinks-box">';
        entry.drinks.forEach(d => {
          const dQty = d.qty || 1;
          const dTotal = d.price * dQty;
          unitPrice += dTotal;
          drinksHtml += `
            <div class="cart-drink-line">
              <span>${d.icon || '🥤'} ${dQty > 1 ? `<b>${dQty}x</b> ` : ''}${d.name}</span>
              <span class="cart-drink-price">+ ${formatMoney(dTotal)}</span>
            </div>
          `;
        });
        drinksHtml += '</div>';
      }

      let notesHtml = '';
      if (entry.notes) {

        notesHtml = `<div class="cart-item-notes-box">📝 ${entry.notes}</div>`;

      }



      const rowTotal = unitPrice * entry.qty;



      card.innerHTML = `

        <div class="cart-item-top">

          <div class="cart-item-title-group">

            <h4 class="cart-item-heading">${tagHtml} <span>${entry.item.name}</span></h4>

            ${compHtml}
            ${drinksHtml}
            ${notesHtml}

          </div>

          <button type="button" class="cart-item-delete-btn" title="Remover item" data-index="${index}">🗑️</button>

        </div>

        <div class="cart-item-bottom">

          <div class="cart-qty-pill">

            <button type="button" class="cart-qty-pill-btn cart-minus" data-index="${index}">−</button>

            <span class="cart-qty-pill-val">${entry.qty}</span>

            <button type="button" class="cart-qty-pill-btn cart-plus" data-index="${index}">+</button>

          </div>

          <span class="cart-item-subtotal-price">${formatMoney(rowTotal)}</span>

        </div>

      `;



      card.querySelector('.cart-item-delete-btn').addEventListener('click', () => {

        cart.splice(index, 1);

        saveCart();

        updateCartUI();

        renderCartItems();

      });



      card.querySelector('.cart-minus').addEventListener('click', () => {

        if (entry.qty > 1) {

          entry.qty--;

        } else {

          cart.splice(index, 1);

        }

        saveCart();

        updateCartUI();

        renderCartItems();

      });



      card.querySelector('.cart-plus').addEventListener('click', () => {

        entry.qty++;

        saveCart();

        updateCartUI();

        renderCartItems();

      });



      cartItemsList.appendChild(card);

    });

  }



  // Update Cart Totals & UI Badges

  function updateTotals() {

    let subtotal = 0;

    cart.forEach(entry => {

      let unit = entry.item.price;

      (entry.complements || []).forEach(c => unit += c.price * (c.qty || 1));

      subtotal += unit * entry.qty;

    });



    const isDelivery = deliveryType === 'delivery';

    if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);

    if (summaryDeliveryFee) {
      if (isDelivery) {
        summaryDeliveryFee.innerHTML = '<span class="delivery-fee-badge">A combinar (~R$ 12 a R$ 15)</span>';
      } else {
        summaryDeliveryFee.innerHTML = '<span style="color:#4ade80; font-weight:600;">Grátis (Retirada)</span>';
      }
    }

    if (summaryGrandTotal) {
      if (isDelivery) {
        summaryGrandTotal.innerHTML = `${formatMoney(subtotal)} <small style="font-size:0.72rem; color:#94a3b8; font-weight:normal;">+ taxa</small>`;
      } else {
        summaryGrandTotal.textContent = formatMoney(subtotal);
      }
    }

    if (footerBtnTotal) {
      if (isDelivery) {
        footerBtnTotal.innerHTML = `${formatMoney(subtotal)} <small style="font-size:0.75rem; font-weight:normal; opacity:0.8;">+ taxa</small>`;
      } else {
        footerBtnTotal.textContent = formatMoney(subtotal);
      }
    }

    if (floatingCartSubtotal) floatingCartSubtotal.textContent = formatMoney(subtotal);

  }



  function updateCartUI() {

    const totalCount = cart.reduce((sum, entry) => sum + entry.qty, 0);



    if (headerCartCount) headerCartCount.textContent = totalCount;

    if (floatingCartCount) floatingCartCount.textContent = totalCount;

    if (drawerItemCount) drawerItemCount.textContent = `(${totalCount})`;



    if (floatingCartBar) {

      floatingCartBar.style.display = totalCount > 0 ? 'block' : 'none';

    }



    updateTotals();

  }


  // --- CHECKOUT DRAWER & CART MANAGEMENT ---
  function openCartDrawer() {
    if (!cartDrawer) return;
    checkDeliveryAvailability();
    renderCartItems();
    updateTotals();
    cartDrawer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    try {
      history.pushState({ omakiView: 'cart-drawer' }, '');
    } catch (e) {}
  }

  function closeCartDrawer(fromPopState = false) {
    if (!cartDrawer) return;
    cartDrawer.style.display = 'none';
    document.body.style.overflow = '';
    if (!fromPopState && history.state && history.state.omakiView === 'cart-drawer') {
      try { history.back(); } catch (e) {}
    }
  }

  if (openCartHeaderBtn) openCartHeaderBtn.addEventListener('click', openCartDrawer);
  if (openCartBarBtn) openCartBarBtn.addEventListener('click', openCartDrawer);
  document.querySelectorAll('.cart-bar-action-btn').forEach(btn => btn.addEventListener('click', openCartDrawer));
  if (closeCartDrawerBtn) closeCartDrawerBtn.addEventListener('click', () => closeCartDrawer());
  if (backCartDrawerBtn) backCartDrawerBtn.addEventListener('click', () => closeCartDrawer());

  // Gestural / Native Back Navigation (PopState)
  window.addEventListener('popstate', (e) => {
    if (itemModal && itemModal.style.display === 'flex') {
      closeItemModal(true);
    } else if (cartDrawer && (cartDrawer.style.display === 'flex' || cartDrawer.style.display === 'block')) {
      closeCartDrawer(true);
    }
  });
  if (cartDrawer) {
    cartDrawer.addEventListener('click', (e) => {
      if (e.target === cartDrawer) closeCartDrawer();
    });
  }

  // Delivery vs Takeaway Switcher
  if (btnTypeDelivery) {
    btnTypeDelivery.addEventListener('click', () => {
      if (btnTypeDelivery.classList.contains('btn-delivery-disabled')) {
        showCustomAlert('Entregas Encerradas', 'As entregas por motoboy estão indisponíveis no momento. Por favor, selecione Retirada no Balcão.');
        return;
      }
      deliveryType = 'delivery';
      btnTypeDelivery.classList.add('active');
      btnTypeTakeaway.classList.remove('active');
      if (deliveryFieldsGroup) deliveryFieldsGroup.style.display = 'block';
      if (takeawayInfoGroup) takeawayInfoGroup.style.display = 'none';
      if (deliveryFeeSummaryLine) deliveryFeeSummaryLine.style.display = 'flex';
      updateTotals();
    });
  }

  if (btnTypeTakeaway) {
    btnTypeTakeaway.addEventListener('click', () => {
      deliveryType = 'takeaway';
      btnTypeTakeaway.classList.add('active');
      btnTypeDelivery.classList.remove('active');
      if (deliveryFieldsGroup) deliveryFieldsGroup.style.display = 'none';
      if (takeawayInfoGroup) takeawayInfoGroup.style.display = 'block';
      if (deliveryFeeSummaryLine) deliveryFeeSummaryLine.style.display = 'none';
      updateTotals();
    });
  }

  // Payment method switcher (com suporte a pagamento dividido em 2 formas)

  // Split Payment Elements
  const splitPaymentBox = document.getElementById('splitPaymentBox');
  const splitOrderTotalDisplay = document.getElementById('splitOrderTotalDisplay');
  const splitMethod1 = document.getElementById('splitMethod1');
  const splitValue1 = document.getElementById('splitValue1');
  const splitMethod2 = document.getElementById('splitMethod2');
  const splitValue2 = document.getElementById('splitValue2');
  const splitCashChangeBox = document.getElementById('splitCashChangeBox');
  const splitCashChangeValue = document.getElementById('splitCashChangeValue');
  const splitBalanceBar = document.getElementById('splitBalanceBar');
  const splitBalanceText = document.getElementById('splitBalanceText');

  function getCartGrandTotal() {
    let sub = 0;
    cart.forEach(entry => {
      let unit = entry.item.price;
      (entry.complements || []).forEach(c => unit += c.price * (c.qty || 1));
      (entry.drinks || []).forEach(d => unit += d.price * (d.qty || 1));
      sub += unit * entry.qty;
    });
    return sub; // Taxa de entrega é combinada com o entregador, o restaurante cobra subtotal dos itens
  }

  function updateSplitBalance() {
    const total = getCartGrandTotal();
    if (splitOrderTotalDisplay) splitOrderTotalDisplay.textContent = `Total: ${formatMoney(total)}`;
    
    const v1 = parseFloat(splitValue1 ? splitValue1.value : 0) || 0;
    const v2 = parseFloat(splitValue2 ? splitValue2.value : 0) || 0;
    const sum = v1 + v2;
    const diff = Math.abs(sum - total);

    if (splitBalanceBar && splitBalanceText) {
      if (diff <= 0.05) {
        splitBalanceBar.className = 'split-balance-bar matched';
        splitBalanceText.textContent = `✓ Total distribuído: ${formatMoney(sum)} de ${formatMoney(total)} (Perfeito)`;
      } else if (sum < total) {
        splitBalanceBar.className = 'split-balance-bar unmatched';
        splitBalanceText.textContent = `⚠️ Falta distribuir: ${formatMoney(total - sum)} (Distribuído: ${formatMoney(sum)} / ${formatMoney(total)})`;
      } else {
        splitBalanceBar.className = 'split-balance-bar unmatched';
        splitBalanceText.textContent = `⚠️ Valor excede o total em: ${formatMoney(sum - total)} (Distribuído: ${formatMoney(sum)} / ${formatMoney(total)})`;
      }
    }

    // Toggle pix box helper and cash change box based on selected split methods
    const m1 = splitMethod1 ? splitMethod1.value : '';
    const m2 = splitMethod2 ? splitMethod2.value : '';
    const hasPix = m1 === 'Pix' || m2 === 'Pix';
    const hasCash = m1 === 'Dinheiro' || m2 === 'Dinheiro';

    if (pixInfoBox) pixInfoBox.style.display = hasPix ? 'block' : 'none';
    if (splitCashChangeBox) splitCashChangeBox.style.display = hasCash ? 'block' : 'none';
  }

  if (splitValue1) {
    splitValue1.addEventListener('input', () => {
      const total = getCartGrandTotal();
      const v1 = parseFloat(splitValue1.value) || 0;
      if (splitValue2 && v1 <= total) {
        splitValue2.value = (Math.max(0, total - v1)).toFixed(2);
      }
      updateSplitBalance();
    });
  }

  if (splitValue2) {
    splitValue2.addEventListener('input', () => {
      const total = getCartGrandTotal();
      const v2 = parseFloat(splitValue2.value) || 0;
      if (splitValue1 && v2 <= total) {
        splitValue1.value = (Math.max(0, total - v2)).toFixed(2);
      }
      updateSplitBalance();
    });
  }

  if (splitMethod1) splitMethod1.addEventListener('change', updateSplitBalance);
  if (splitMethod2) splitMethod2.addEventListener('change', updateSplitBalance);

  // Wire High-Contrast Visual Split Chips
  const chips1 = document.querySelectorAll('#splitChips1 .split-pill-btn');
  chips1.forEach(btn => {
    btn.addEventListener('click', () => {
      chips1.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (splitMethod1) {
        splitMethod1.value = btn.dataset.method;
        updateSplitBalance();
      }
    });
  });

  const chips2 = document.querySelectorAll('#splitChips2 .split-pill-btn');
  chips2.forEach(btn => {
    btn.addEventListener('click', () => {
      chips2.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (splitMethod2) {
        splitMethod2.value = btn.dataset.method;
        updateSplitBalance();
      }
    });
  });

  const btnSplitHalf = document.getElementById('btnSplitHalf');
  if (btnSplitHalf) {
    btnSplitHalf.addEventListener('click', () => {
      const total = getCartGrandTotal();
      const half1 = (Math.floor((total / 2) * 100) / 100).toFixed(2);
      const half2 = (total - parseFloat(half1)).toFixed(2);
      if (splitValue1) splitValue1.value = half1;
      if (splitValue2) splitValue2.value = half2;
      updateSplitBalance();
    });
  }

  if (paymentMethodRadios) {
    paymentMethodRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const val = radio.value;
        if (val === 'Dividido') {
          if (splitPaymentBox) splitPaymentBox.style.display = 'block';
          if (cashChangeBox) cashChangeBox.style.display = 'none';
          const total = getCartGrandTotal();
          if (splitValue1 && (!splitValue1.value || parseFloat(splitValue1.value) === 0)) {
            const half = (total / 2).toFixed(2);
            splitValue1.value = half;
            if (splitValue2) splitValue2.value = (total - parseFloat(half)).toFixed(2);
          }
          updateSplitBalance();
        } else {
          if (splitPaymentBox) splitPaymentBox.style.display = 'none';
          if (splitCashChangeBox) splitCashChangeBox.style.display = 'none';
          if (pixInfoBox) pixInfoBox.style.display = val === 'Pix' ? 'block' : 'none';
          if (cashChangeBox) cashChangeBox.style.display = val === 'Dinheiro' ? 'block' : 'none';
        }
      });
    });
  }

  // Copy Pix Key
  if (copyPixBtn) {
    copyPixBtn.addEventListener('click', () => {
      const pixKey = data.store.pixKeyRaw || data.store.pixKey || '+55 62 99174-9928';
      navigator.clipboard.writeText(pixKey).then(() => {
        showToast('✓ Chave Pix copiada com sucesso!');
      }).catch(() => {
        showCustomAlert('Chave Pix', `Copie a chave Pix da Omaki Sushi:\n${pixKey}`);
      });
    });
  }






  // --- SEND ORDER VIA WHATSAPP (CANONICAL CODES PRESERVED & BULLETPROOF EMOJIS) ---

  const WA_ICONS = {

    sushi: '\u{1F363}',

    client: '\u{1F464}',

    phone: '\u{1F4F1}',

    moto: '\u{1F6F5}',

    pin: '\u{1F4CD}',

    map: '\u{1F5FA}\uFE0F',

    neighborhood: '\u{1F3D8}\uFE0F',

    ref: '\u{1F3E2}',

    cart: '\u{1F6D2}',

    plus: '\u2795',

    notes: '\u{1F4DD}',

    hashis: '\u{1F962}',

    wasabi: '\u{1F33F}',

    card: '\u{1F4B3}',

    pix: '\u2139\uFE0F',

    box: '\u{1F4E6}',

    takeaway: '\u{1F6CD}\uFE0F',

    money: '\u{1F4B0}'

  };



  if (sendWhatsAppOrderBtn) {

    sendWhatsAppOrderBtn.addEventListener('click', () => {

      if (cart.length === 0) {

        showCustomAlert('Sacola Vazia', 'Sua sacola está vazia. Adicione pratos deliciosos antes de enviar o pedido!');

        return;

      }



      const customerName = orderCustomerName ? orderCustomerName.value.trim() : '';

      if (!customerName || customerName.length < 2) {

        showCustomAlert('Nome Obrigatório', 'Por favor, informe seu nome para identificarmos seu pedido na comanda.', orderCustomerName);

        return;

      }



      const customerPhone = orderCustomerPhone ? orderCustomerPhone.value.trim() : '';

      const phoneDigits = customerPhone.replace(/\D/g, '');

      if (!customerPhone || phoneDigits.length < 10) {

        showCustomAlert('WhatsApp Incompleto', 'Por favor, informe seu número de WhatsApp com DDD (ex: 62 99999-9999) para confirmarmos o pedido.', orderCustomerPhone);

        return;

      }



      let fullAddress = '';
      let complement = '';

      if (deliveryType === 'delivery') {
        const orderStreet = document.getElementById('orderStreet');
        const orderNumber = document.getElementById('orderNumber');
        const orderNeighborhood = document.getElementById('orderNeighborhood');
        const orderComplement = document.getElementById('orderComplement');

        const street = orderStreet ? orderStreet.value.trim() : '';
        const number = orderNumber ? orderNumber.value.trim() : '';
        const neighborhood = orderNeighborhood ? orderNeighborhood.value.trim() : '';
        complement = orderComplement ? orderComplement.value.trim() : '';

        if (!street || street.length < 3) {
          showCustomAlert('Rua / Pousada Obrigatória', 'Por favor, informe a rua, avenida ou o nome da pousada/chalé para entrega.', orderStreet);
          return;
        }

        if (!number) {
          showCustomAlert('Número / Quadra Obrigatório', 'Por favor, informe o número da residência ou a Quadra e Lote (ex: Qd. 02, Lt. 04 ou Nº 145).', orderNumber);
          return;
        }

        const addressBase = [street, number].filter(Boolean).join(', ');
        fullAddress = neighborhood ? `${addressBase} — ${neighborhood}` : addressBase;
      }



      const hashis = orderHashis ? orderHashis.value : '1 par';

      const wasabiGari = orderWasabiGari ? orderWasabiGari.value : 'Sim (Ambos)';



      let selectedPayment = 'Pix';

      if (paymentMethodRadios) {

        paymentMethodRadios.forEach(r => {

          if (r.checked) selectedPayment = r.value;

        });

      }

      let splitVal1 = 0;
      let splitVal2 = 0;
      let splitM1 = 'Pix';
      let splitM2 = 'Cartão de Crédito';
      let splitCashNote = '';

      if (selectedPayment === 'Dividido') {
        splitVal1 = parseFloat(splitValue1 ? splitValue1.value : 0) || 0;
        splitVal2 = parseFloat(splitValue2 ? splitValue2.value : 0) || 0;
        splitM1 = splitMethod1 ? splitMethod1.value : 'Pix';
        splitM2 = splitMethod2 ? splitMethod2.value : 'Cartão de Crédito';

        if (splitVal1 <= 0 || splitVal2 <= 0) {
          showCustomAlert('Valores Obrigatórios', 'Por favor, preencha os valores para as duas formas de pagamento divididas.', splitValue1);
          return;
        }

        const sumSplit = splitVal1 + splitVal2;
        if (Math.abs(sumSplit - grandTotal) > 0.05) {
          showCustomAlert('Ajuste os Valores', `A soma das duas formas de pagamento (${formatMoney(sumSplit)}) deve ser exatamente igual ao total do pedido (${formatMoney(grandTotal)}).`, splitValue1);
          return;
        }

        if (splitM1 === 'Dinheiro' || splitM2 === 'Dinheiro') {
          const changeVal = splitCashChangeValue ? splitCashChangeValue.value.trim() : '';
          if (changeVal) {
            splitCashNote = ` (Troco para: ${changeVal})`;
          } else {
            splitCashNote = ' (Não precisa de troco)';
          }
        }
      }

      let cashNote = '';

      if (selectedPayment === 'Dinheiro') {

        const changeVal = cashChangeValue ? cashChangeValue.value.trim() : '';

        if (changeVal) {

          cashNote = ` (Troco para: ${changeVal})`;

        } else {

          cashNote = ' (Não precisa de troco)';

        }

      }



      const generalNotes = orderGeneralNotes ? orderGeneralNotes.value.trim() : '';



      // Calculate final prices

      let subtotal = 0;

      cart.forEach(entry => {

        let unit = entry.item.price;

        (entry.complements || []).forEach(c => unit += c.price * (c.qty || 1));

        (entry.drinks || []).forEach(d => unit += d.price * (d.qty || 1));

        subtotal += unit * entry.qty;

      });



      const grandTotal = subtotal;



      // Build formatted WhatsApp Message with canonical tags [#007]

      let msg = `${WA_ICONS.sushi} *NOVO PEDIDO — OMAKI SUSHI*\n`;

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      msg += `${WA_ICONS.client} *Cliente:* ${customerName}\n`;

      msg += `${WA_ICONS.phone} *WhatsApp:* ${customerPhone}\n`;



      if (deliveryType === 'delivery') {
        msg += `${WA_ICONS.moto} *Modalidade:* Entrega (Delivery)\n`;
        msg += `${WA_ICONS.pin} *Endereço:* ${fullAddress}\n`;
        if (complement) msg += `${WA_ICONS.ref} *Ponto de Ref / Pousada:* ${complement}\n`;

        if (capturedCoordinates && capturedCoordinates.lat && capturedCoordinates.lng) {
          msg += `🗺️ *Localização no Google Maps:*\n`;
          msg += `   ├ 📍 *Ponto Exato:* https://maps.google.com/?q=${capturedCoordinates.lat},${capturedCoordinates.lng}\n`;
          msg += `   └ 🛵 *Rota do Motoboy:* https://www.google.com/maps/dir/?api=1&destination=${capturedCoordinates.lat},${capturedCoordinates.lng}\n`;
          msg += `💡 _Dica: Se preferir, compartilhe sua localização atual aqui no WhatsApp (📎 > Localização)._` + '\n';
        } else {
          msg += `💡 *Dica de Entrega:* Se estiver em pousada ou chalé, compartilhe sua localização atual aqui no WhatsApp (clique no 📎 e escolha "Localização") para o motoboy chegar sem erro.\n`;
        }
      } else {

        msg += `${WA_ICONS.takeaway} *Modalidade:* Retirada no Balcão\n`;

        msg += `${WA_ICONS.pin} *Local de Retirada:* Av. Ary Valadão Filho, Qd. 02, Lt. 04 — Centro, Alto Paraíso / GO\n`;

        msg += `${WA_ICONS.map} *Google Maps:* https://maps.google.com/?q=Omaki+Sushi+Alto+Paraiso+de+Goias\n`;

      }



      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      msg += `${WA_ICONS.cart} *ITENS DO PEDIDO:*\n\n`;



      cart.forEach(entry => {

        const itemTag = entry.item.num ? `[#${String(entry.item.num).padStart(3, '0')}] ` : '';

        let itemPriceUnit = entry.item.price;

        (entry.complements || []).forEach(c => itemPriceUnit += c.price * (c.qty || 1));

        (entry.drinks || []).forEach(d => itemPriceUnit += d.price * (d.qty || 1));

        const totalLine = itemPriceUnit * entry.qty;



        msg += `• *${entry.qty}x ${itemTag}${entry.item.name}* — ${formatMoney(totalLine)}\n`;



        if (entry.complements && entry.complements.length > 0) {

          entry.complements.forEach(c => {

            const cQty = c.qty || 1;

            const linePrice = c.price * cQty;

            const prefix = cQty > 1 ? `${cQty}x ` : '';

            msg += `   └ ${WA_ICONS.plus} _${prefix}${c.name}_ (+${formatMoney(linePrice)})\n`;

          });

        }



        if (entry.drinks && entry.drinks.length > 0) {
          entry.drinks.forEach(d => {
            const dQty = d.qty || 1;
            const linePrice = d.price * dQty;
            const prefix = dQty > 1 ? `${dQty}x ` : '';
            const dCode = d.num ? `[#${String(d.num).padStart(3, '0')}] ` : '';
            msg += `   └ ${d.icon || '🥤'} _${prefix}${dCode}${d.name}_ (+${formatMoney(linePrice)})\n`;
          });
        }

        if (entry.notes) {

          msg += `   └ ${WA_ICONS.notes} _Obs: ${entry.notes}_\n`;

        }

        msg += `\n`;

      });



      // Descartáveis & Sachês
      const hQty = parseInt(document.getElementById('orderHashis')?.value || '0', 10);
      const nQty = parseInt(document.getElementById('orderNapkins')?.value || '0', 10);
      const sQty = parseInt(document.getElementById('orderShoyu')?.value || '0', 10);
      const tQty = parseInt(document.getElementById('orderTare')?.value || '0', 10);
      const wQty = parseInt(document.getElementById('orderWasabi')?.value || '0', 10);

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🥢 *DESCARTÁVEIS & SACHÊS:*\n`;
      msg += `• Hashis: ${hQty > 0 ? `${hQty} ${hQty === 1 ? 'par' : 'pares'}` : 'Não preciso'}\n`;
      msg += `• Guardanapos: ${nQty > 0 ? `${nQty} un` : 'Não preciso'}\n`;
      msg += `• Sachê de Shoyu: ${sQty > 0 ? `${sQty} un` : 'Não quero'}\n`;
      msg += `• Sachê de Tarê: ${tQty > 0 ? `${tQty} un` : 'Não quero'}\n`;
      msg += `• Sachê de Wasabi: ${wQty > 0 ? `${wQty} un` : 'Não quero'}\n`;

      if (selectedPayment === 'Dividido') {
        msg += `${WA_ICONS.card} *Pagamento:* Dividido em 2 formas:\n`;
        msg += `   ├ 1ª: ${splitM1} — ${formatMoney(splitVal1)}\n`;
        msg += `   └ 2ª: ${splitM2} — ${formatMoney(splitVal2)}${splitCashNote}\n`;
        if (splitM1 === 'Pix' || splitM2 === 'Pix') {
          msg += `   └ ${WA_ICONS.pix} _Chave Pix: ${data.store.pixKey || '+55 62 99174-9928'}_\n`;
        }
      } else {
        msg += `${WA_ICONS.card} *Pagamento:* ${selectedPayment}${cashNote}\n`;

        if (selectedPayment === 'Pix') {

          msg += `   └ ${WA_ICONS.pix} _Chave Pix: ${data.store.pixKey || '+55 62 99174-9928'}_\n`;

        }
      }



      if (generalNotes) {

        msg += `${WA_ICONS.notes} *Obs Geral:* ${generalNotes}\n`;

      }



      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `💰 *RESUMO DO PEDIDO:*\n`;
      msg += `• *Subtotal dos Itens:* ${formatMoney(subtotal)}\n`;

      if (deliveryType === 'delivery') {
        msg += `• *Taxa de Entrega:* A combinar (Média: R$ 12 a R$ 15)\n`;
        msg += `👉 *Total a Pagar:* ${formatMoney(subtotal)} + taxa de entrega\n`;
      } else {
        msg += `• *Taxa de Entrega:* Grátis (Retirada no Balcão)\n`;
        msg += `👉 *Total a Pagar:* ${formatMoney(grandTotal)}\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      const storeWhatsApp = data.store.whatsapp || '5562991749928';

      const waUrl = `https://api.whatsapp.com/send?phone=${storeWhatsApp}&text=${encodeURIComponent(msg)}`;



      window.open(waUrl, '_blank');

    });

  }




  // --- GESTÃO OPERACIONAL, HORÁRIOS & CORTE 22:30 ---

  async function loadOperationalStatus() {
    try {
      const res = await fetch('/api/status?t=' + Date.now());
      if (res.ok) {
        adminState = await res.json();
        localStorage.setItem('omaki_admin_state', JSON.stringify(adminState));
      } else {
        const local = localStorage.getItem('omaki_admin_state');
        if (local) adminState = JSON.parse(local);
      }
    } catch (e) {
      try {
        const local = localStorage.getItem('omaki_admin_state');
        if (local) adminState = JSON.parse(local);
      } catch (err) {}
    }
    checkDeliveryAvailability();
    renderMenu('', currentActiveCategory);
  }

  function checkDeliveryAvailability() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const curMins = hours * 60 + minutes;
    const startMins = 18 * 60 + 20; // 18:20
    const cutoffMins = 22 * 60 + 30; // 22:30

    let isDeliveryAllowed = true;
    let reasonText = '';

    if (adminState.manualDeliveryOverride === false) {
      isDeliveryAllowed = false;
      reasonText = adminState.deliveryClosedReason || 'Pausado temporariamente pela equipe';
    } else if (adminState.manualDeliveryOverride === true) {
      isDeliveryAllowed = true;
    } else {
      // Regra padrão de horário (18:20 às 22:30)
      if (curMins >= cutoffMins) {
        isDeliveryAllowed = false;
        reasonText = 'Entregas por motoboy encerradas às 22:30';
      } else if (curMins < startMins) {
        isDeliveryAllowed = false;
        reasonText = 'Entregas iniciam após as 18:20';
      }
    }

    // Atualiza o selo do cabeçalho
    const headerStatusBadge = document.getElementById('headerStatusBadge');
    const headerStatusText = document.getElementById('headerStatusText');

    if (headerStatusBadge && headerStatusText) {
      if (isDeliveryAllowed) {
        headerStatusBadge.className = 'status-badge';
        headerStatusBadge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        headerStatusBadge.style.background = 'rgba(34, 197, 94, 0.12)';
        headerStatusBadge.style.color = '#4ade80';
        headerStatusText.innerHTML = '<span class="status-label">Aberto</span><span class="status-suffix"> para Pedidos</span>';
      } else {
        headerStatusBadge.className = 'status-badge';
        headerStatusBadge.style.borderColor = 'rgba(245, 158, 11, 0.35)';
        headerStatusBadge.style.background = 'rgba(245, 158, 11, 0.12)';
        headerStatusBadge.style.color = '#fbbf24';
        headerStatusText.innerHTML = '<span class="status-label">Só Retirada</span><span class="status-suffix"> no Balcão</span>';
      }
    }

    // Atualiza botões no drawer
    let cutoffBanner = document.getElementById('deliveryCutoffBanner');
    if (!cutoffBanner && btnTypeDelivery && btnTypeDelivery.parentNode) {
      cutoffBanner = document.createElement('div');
      cutoffBanner.id = 'deliveryCutoffBanner';
      cutoffBanner.className = 'delivery-cutoff-banner';
      btnTypeDelivery.parentNode.parentNode.insertBefore(cutoffBanner, btnTypeDelivery.parentNode);
    }

    if (!isDeliveryAllowed) {
      if (cutoffBanner) {
        cutoffBanner.style.display = 'block';
        cutoffBanner.innerHTML = `⚠️ <strong>Aviso:</strong> ${reasonText}. Pedidos disponíveis exclusivamente para <strong>Retirada no Balcão</strong>.`;
      }
      if (btnTypeDelivery) {
        btnTypeDelivery.classList.add('btn-delivery-disabled');
        btnTypeDelivery.style.opacity = '0.5';
        btnTypeDelivery.style.cursor = 'not-allowed';
      }
      if (deliveryType === 'delivery') {
        deliveryType = 'takeaway';
        if (btnTypeTakeaway) btnTypeTakeaway.classList.add('active');
        if (btnTypeDelivery) btnTypeDelivery.classList.remove('active');
        if (deliveryFieldsGroup) deliveryFieldsGroup.style.display = 'none';
        if (takeawayInfoGroup) takeawayInfoGroup.style.display = 'block';
        updateTotals();
      }
    } else {
      if (cutoffBanner) cutoffBanner.style.display = 'none';
      if (btnTypeDelivery) {
        btnTypeDelivery.classList.remove('btn-delivery-disabled');
        btnTypeDelivery.style.opacity = '1';
        btnTypeDelivery.style.cursor = 'pointer';
      }
    }
  }

  // --- BOOTSTRAP INITIALIZATION ---

  initGeolocation();
  initDisposables();
  initCategories();

  renderMenu('', 'all');

  updateCartUI();

  loadOperationalStatus();

  // Periodic check every 60 seconds
  setInterval(loadOperationalStatus, 60000);

});


  // --- DESCARTÁVEIS & SACHÊS STEPPERS ---
  function initDisposables() {
    const limits = {
      dispHashis: { max: 4, zeroTxt: 'Não preciso', unit: 'par', unitPlural: 'pares', inputId: 'orderHashis' },
      dispNapkins: { max: 4, zeroTxt: 'Não preciso', unit: 'un', unitPlural: 'un', inputId: 'orderNapkins' },
      dispShoyu: { max: 8, zeroTxt: 'Não quero', unit: 'un', unitPlural: 'un', inputId: 'orderShoyu' },
      dispTare: { max: 8, zeroTxt: 'Não quero', unit: 'un', unitPlural: 'un', inputId: 'orderTare' },
      dispWasabi: { max: 8, zeroTxt: 'Não quero', unit: 'un', unitPlural: 'un', inputId: 'orderWasabi' }
    };

    document.querySelectorAll('.disp-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const action = btn.dataset.action;
        const config = limits[target];
        if (!config) return;

        const input = document.getElementById(config.inputId);
        const display = document.getElementById(target + 'Display');
        const itemWrap = btn.closest('.disposable-item');
        if (!input || !display) return;

        let cur = parseInt(input.value, 10) || 0;
        if (action === 'inc' && cur < config.max) {
          cur++;
        } else if (action === 'dec' && cur > 0) {
          cur--;
        }

        input.value = cur;
        if (cur === 0) {
          display.textContent = config.zeroTxt;
          if (itemWrap) itemWrap.classList.remove('has-qty');
        } else {
          const u = cur === 1 ? config.unit : config.unitPlural;
          display.textContent = `${cur} ${u}`;
          if (itemWrap) itemWrap.classList.add('has-qty');
        }
      });
    });
  }

  // --- GEOLOCALIZAÇÃO GPS DO CLIENTE ---
  function initGeolocation() {
    const btnGetLocation = document.getElementById('btnGetLocation');
    const gpsStatusBadge = document.getElementById('gpsStatusBadge');
    const gpsStatusText = document.getElementById('gpsStatusText');
    const gpsMapsLink = document.getElementById('gpsMapsLink');
    const gpsCoordHint = document.getElementById('gpsCoordHint');
    const orderStreet = document.getElementById('orderStreet');
    const orderNumber = document.getElementById('orderNumber');
    const orderNeighborhood = document.getElementById('orderNeighborhood');

    if (!btnGetLocation) return;

    btnGetLocation.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showCustomAlert('Navegador Incompatível', 'Seu aparelho ou navegador não suporta geolocalização. Por favor, digite o endereço manualmente.', orderStreet);
        return;
      }

      btnGetLocation.classList.add('loading');
      btnGetLocation.innerHTML = '<span class="gps-icon spinner">📡</span> Conectando aos satélites GPS...';

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          capturedCoordinates = { lat, lng };

          btnGetLocation.classList.remove('loading');
          btnGetLocation.classList.add('success');
          btnGetLocation.innerHTML = '<span class="gps-icon">✓</span> Localização GPS Capturada!';

          const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
          if (gpsStatusBadge && gpsMapsLink) {
            gpsStatusBadge.style.display = 'flex';
            gpsMapsLink.href = mapsUrl;
          }
          if (gpsCoordHint) {
            gpsCoordHint.style.display = 'block';
          }

          // Busca reversa detalhada via Nominatim OpenStreetMap
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&namedetails=1`, {
              headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'OmakiSushiApp/1.0' }
            });
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};

              // 1. Rua / Avenida / Pousada
              const detectedStreet = addr.road || addr.pedestrian || addr.footway || addr.avenue || addr.street || addr.amenity || '';
              if (detectedStreet && orderStreet && !orderStreet.value.trim()) {
                orderStreet.value = detectedStreet;
              }

              // 2. Bairro / Setor
              const detectedNeighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || addr.city_district || addr.hamlet || '';
              if (detectedNeighborhood && orderNeighborhood && !orderNeighborhood.value.trim()) {
                orderNeighborhood.value = detectedNeighborhood;
              }

              // 3. Número (se existir na base)
              if (addr.house_number && orderNumber && !orderNumber.value.trim()) {
                orderNumber.value = addr.house_number;
              }
            }
          } catch (e) {
            // Continua normalmente com as coordenadas salvas
          }

          // Se a Quadra/Lote/Número estiver vazia, posiciona o foco para o cliente preencher em 1 segundo
          if (orderNumber && !orderNumber.value.trim()) {
            setTimeout(() => {
              orderNumber.focus();
            }, 300);
          }
        },
        (error) => {
          btnGetLocation.classList.remove('loading');
          btnGetLocation.innerHTML = '<span class="gps-icon">📍</span> Usar minha localização atual (GPS)';

          let msg = 'Não foi possível capturar sua posição GPS. Por favor, digite seu endereço ou nome da pousada.';
          if (error.code === 1) { // PERMISSION_DENIED
            msg = 'A permissão de localização foi negada no navegador. Para enviar o link GPS ao motoboy, permita o acesso à localização nas configurações do site ou digite o endereço manualmente.';
          } else if (error.code === 3) { // TIMEOUT
            msg = 'O sinal do GPS demorou a responder. Você pode tentar novamente ou digitar o endereço manualmente.';
          }

          showCustomAlert('Localização GPS', msg, orderStreet);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  }
