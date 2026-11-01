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
  let selectedComplements = new Set();
  let selectedSpecialOptions = {
    temakiFried: false,
    temakiNoRice: false,
    pokeToppings: [],
    pokeSauce: '',
    pokeDoubleProtein: false
  };
  let deliveryType = 'delivery'; // 'delivery' | 'takeaway'
  let selectedNeighborhood = data.neighborhoods && data.neighborhoods.length > 0 ? data.neighborhoods[0] : { name: 'Centro', fee: 12.00 };

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

    const badges = document.createElement('div');
    badges.className = 'product-card-badges';
    badges.innerHTML = `
      ${tagBadge}
      ${portionBadge}
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
        <button type="button" class="product-add-btn">
          <span>${dish.isGrouped ? 'Ver Opções' : '+ Adicionar'}</span>
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
    selectedComplements.clear();
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

    // Complements List
    if (modalComplementsList) {
      modalComplementsList.innerHTML = '';
      data.complements.forEach(cmp => {
        const row = document.createElement('label');
        row.className = 'complement-item';
        row.innerHTML = `
          <div class="complement-left">
            <input type="checkbox" value="${cmp.id}">
            <span class="complement-name">${cmp.name}</span>
          </div>
          <span class="complement-price">+ ${formatMoney(cmp.price)}</span>
        `;

        const cb = row.querySelector('input');
        cb.addEventListener('change', () => {
          if (cb.checked) {
            selectedComplements.add(cmp.id);
            row.classList.add('selected');
          } else {
            selectedComplements.delete(cmp.id);
            row.classList.remove('selected');
          }
          updateModalTotal();
        });

        modalComplementsList.appendChild(row);
      });
    }

    updateModalTotal();
    itemModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // Render Options without raw numbers in visible string (clean user-facing names)
  function renderOptionsList(options) {
    if (!modalOptionsList) return;
    modalOptionsList.innerHTML = '';

    options.forEach(opt => {
      const isSelected = currentSelectedOption && (String(opt.code) === String(currentSelectedOption.code) || opt.num === currentSelectedOption.num);
      const row = document.createElement('label');
      row.className = `option-item ${isSelected ? 'selected' : ''}`;
      row.innerHTML = `
        <div class="option-left">
          <input type="radio" name="modalDishOptionRadio" value="${opt.code || opt.num}" ${isSelected ? 'checked' : ''}>
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
  }

  function renderSpecialCustomizations(dish) {
    if (!modalSpecialSection || !modalSpecialContent) return;
    const isTemaki = dish.id === 'temaki_group' || dish.category === 'Temakis';
    const isPoke = dish.isPoke || dish.id === 'poke_group';

    if (!isTemaki && !isPoke) {
      modalSpecialSection.style.display = 'none';
      modalSpecialContent.innerHTML = '';
      return;
    }

    modalSpecialSection.style.display = 'block';
    modalSpecialContent.innerHTML = '';

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

      let pokeHtml = `
        <div class="special-custom-group">
          <div class="special-group-header">
            <h4>Acompanhamentos</h4>
            <span class="special-badge-counter" id="pokeToppingsCounter">0 de 6 inclusos</span>
          </div>
          <p class="section-hint">Escolha até 6 inclusos (adicional por +R$ 8,00 cada além do 6º):</p>
          <div class="poke-chips-grid">
      `;
      toppings.forEach(top => {
        pokeHtml += `
          <label class="poke-chip">
            <input type="checkbox" name="pokeTop" value="${top}">
            <span class="poke-chip-indicator"></span>
            <span class="poke-chip-label">${top}</span>
          </label>
        `;
      });
      pokeHtml += `
          </div>
        </div>

        <div class="special-custom-group">
          <div class="special-group-header">
            <h4>Molho do Chef</h4>
            <span class="special-badge-counter" id="pokeSaucesCounter">1 incluso</span>
          </div>
          <p class="section-hint">Escolha 1 molho incluso (adicional por +R$ 9,00 cada além do 1º):</p>
          <div class="poke-chips-grid">
      `;
      sauces.forEach((sc, idx) => {
        pokeHtml += `
          <label class="poke-chip ${idx === 0 ? 'selected' : ''}">
            <input type="checkbox" name="pokeSauce" value="${sc}" ${idx === 0 ? 'checked' : ''}>
            <span class="poke-chip-indicator"></span>
            <span class="poke-chip-label">${sc}</span>
          </label>
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
          <label class="poke-extra-protein-card" id="cardPokeDoubleProtein">
            <div class="protein-left">
              <input type="checkbox" id="checkPokeDoubleProtein">
              <span class="poke-chip-indicator"></span>
              <div class="protein-info">
                <span class="protein-title">Dobrar Proteína</span>
                <span class="protein-sub">+80g de peixe nobre fresco</span>
              </div>
            </div>
            <span class="protein-price">+ ${formatMoney(25.00)}</span>
          </label>
        </div>
      `;

      modalSpecialContent.innerHTML = pokeHtml;
      selectedSpecialOptions.pokeSauces = [sauces[0]];
      selectedSpecialOptions.pokeToppings = [];

      // Topping limit logic (up to 6 included, +R$ 8 each extra)
      const topInputs = modalSpecialContent.querySelectorAll('input[name="pokeTop"]');
      const topCounterEl = document.getElementById('pokeToppingsCounter');

      topInputs.forEach(inp => {
        inp.addEventListener('change', () => {
          const parentLabel = inp.closest('.poke-chip');
          const checked = Array.from(topInputs).filter(i => i.checked);
          if (parentLabel) parentLabel.classList.toggle('selected', inp.checked);
          selectedSpecialOptions.pokeToppings = checked.map(i => i.value);

          if (topCounterEl) {
            if (checked.length <= 6) {
              topCounterEl.textContent = `${checked.length} de 6 inclusos`;
              topCounterEl.classList.toggle('full', checked.length === 6);
            } else {
              const extras = checked.length - 6;
              topCounterEl.textContent = `${checked.length} selec. (+${extras} extra: +${formatMoney(extras * 8.00)})`;
              topCounterEl.classList.add('full');
            }
          }
          updateModalTotal();
        });
      });

      // Sauce selection logic (1 included, +R$ 9 each extra)
      const sauceInputs = modalSpecialContent.querySelectorAll('input[name="pokeSauce"]');
      const sauceCounterEl = document.getElementById('pokeSaucesCounter');

      sauceInputs.forEach(inp => {
        inp.addEventListener('change', () => {
          const checked = Array.from(sauceInputs).filter(i => i.checked);
          if (checked.length === 0) {
            // Must have at least 1 sauce selected
            inp.checked = true;
            return;
          }
          const parentLabel = inp.closest('.poke-chip');
          if (parentLabel) parentLabel.classList.toggle('selected', inp.checked);
          selectedSpecialOptions.pokeSauces = checked.map(i => i.value);

          if (sauceCounterEl) {
            if (checked.length === 1) {
              sauceCounterEl.textContent = '1 incluso';
              sauceCounterEl.classList.remove('full');
            } else {
              const extras = checked.length - 1;
              sauceCounterEl.textContent = `${checked.length} molhos (+${extras} extra: +${formatMoney(extras * 9.00)})`;
              sauceCounterEl.classList.add('full');
            }
          }
          updateModalTotal();
        });
      });

      // Double protein logic
      const doubleProt = document.getElementById('checkPokeDoubleProtein');
      const cardProt = document.getElementById('cardPokeDoubleProtein');
      if (doubleProt) {
        doubleProt.addEventListener('change', () => {
          selectedSpecialOptions.pokeDoubleProtein = doubleProt.checked;
          if (cardProt) cardProt.classList.toggle('selected', doubleProt.checked);
          updateModalTotal();
        });
      }
    }
  }

  function updateModalTotal() {
    if (!currentModalDish) return;
    let basePrice = currentModalDish.isGrouped && currentSelectedOption ? currentSelectedOption.price : currentModalDish.price;

    // Special options
    if (selectedSpecialOptions.temakiFried) basePrice += 9.00;
    if (selectedSpecialOptions.temakiNoRice) basePrice += 16.00;
    if (selectedSpecialOptions.pokeDoubleProtein) basePrice += 25.00;

    // Poke extra toppings beyond 6 (+R$ 8,00 each)
    if (selectedSpecialOptions.pokeToppings && selectedSpecialOptions.pokeToppings.length > 6) {
      basePrice += (selectedSpecialOptions.pokeToppings.length - 6) * 8.00;
    }

    // Poke extra sauces beyond 1 (+R$ 9,00 each)
    if (selectedSpecialOptions.pokeSauces && selectedSpecialOptions.pokeSauces.length > 1) {
      basePrice += (selectedSpecialOptions.pokeSauces.length - 1) * 9.00;
    }

    // Complements
    let compTotal = 0;
    selectedComplements.forEach(cmpId => {
      const cmp = data.complements.find(c => c.id === cmpId);
      if (cmp) compTotal += cmp.price;
    });

    const singleTotal = basePrice + compTotal;
    const finalTotal = singleTotal * currentModalQty;

    if (modalAddTotalPrice) modalAddTotalPrice.textContent = formatMoney(finalTotal);
  }

  function closeItemModal() {
    if (!itemModal) return;
    itemModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (closeItemModalBtn) closeItemModalBtn.addEventListener('click', closeItemModal);
  if (itemModal) {
    itemModal.addEventListener('click', (e) => {
      if (e.target === itemModal) closeItemModal();
    });
  }

  // Modal Quantity Handlers
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

  // Add To Cart Action
  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (!currentModalDish) return;

      let canonicalItem = {};
      if (currentModalDish.isGrouped) {
        if (!currentSelectedOption) {
          showCustomAlert('Opção Obrigatória', 'Por favor, selecione qual corte ou sabor você deseja antes de adicionar.');
          return;
        }
        canonicalItem = {
          id: currentSelectedOption.id,
          num: currentSelectedOption.num || currentModalDish.num,
          name: `${currentModalDish.name} — ${currentSelectedOption.name}`,
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

      // Collect selected complements
      const complements = [];
      selectedComplements.forEach(cmpId => {
        const cmp = data.complements.find(c => c.id === cmpId);
        if (cmp) {
          complements.push({ id: cmp.id, name: cmp.name, price: cmp.price });
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
      if (selectedSpecialOptions.pokeDoubleProtein) {
        extraPrice += 25.00;
        specialNotes.push('Dobrar Proteína (+80g peixe nobre: +R$ 25,00)');
      }

      if (selectedSpecialOptions.pokeSauces && selectedSpecialOptions.pokeSauces.length > 0) {
        const extraSauces = Math.max(0, selectedSpecialOptions.pokeSauces.length - 1);
        if (extraSauces > 0) extraPrice += extraSauces * 9.00;
        const extraSaucesTxt = extraSauces > 0 ? ` (+${extraSauces} extra: +${formatMoney(extraSauces * 9.00)})` : '';
        specialNotes.push(`Molhos: ${selectedSpecialOptions.pokeSauces.join(', ')}${extraSaucesTxt}`);
      }

      if (selectedSpecialOptions.pokeToppings && selectedSpecialOptions.pokeToppings.length > 0) {
        const extraTops = Math.max(0, selectedSpecialOptions.pokeToppings.length - 6);
        if (extraTops > 0) extraPrice += extraTops * 8.00;
        const extraTopsTxt = extraTops > 0 ? ` (+${extraTops} extra: +${formatMoney(extraTops * 8.00)})` : '';
        specialNotes.push(`Acomp: ${selectedSpecialOptions.pokeToppings.join(', ')}${extraTopsTxt}`);
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
        notes: fullNotes
      };

      cart.push(entry);
      saveCart(cart);
      updateCartUI();
      closeItemModal();

      showToast(`🍣 ${canonicalItem.name} adicionado à sacola!`);
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
          unitPrice += c.price;
          compHtml += `
            <div class="cart-complement-line">
              <span>➕ ${c.name}</span>
              <span class="cart-complement-price">+ ${formatMoney(c.price)}</span>
            </div>
          `;
        });
        compHtml += '</div>';
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
      (entry.complements || []).forEach(c => unit += c.price);
      subtotal += unit * entry.qty;
    });

    const fee = deliveryType === 'delivery' ? (selectedNeighborhood ? selectedNeighborhood.fee : 12.00) : 0.00;
    const grandTotal = subtotal + fee;

    if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);
    if (summaryDeliveryFee) summaryDeliveryFee.textContent = formatMoney(fee);
    if (summaryGrandTotal) summaryGrandTotal.textContent = formatMoney(grandTotal);
    if (footerBtnTotal) footerBtnTotal.textContent = formatMoney(grandTotal);
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

      let street = '';
      let neighborhoodName = '';
      let complement = '';

      if (deliveryType === 'delivery') {
        street = orderStreet ? orderStreet.value.trim() : '';
        neighborhoodName = selectedNeighborhood ? selectedNeighborhood.name : 'Centro';
        complement = orderComplement ? orderComplement.value.trim() : '';

        if (!street || street.length < 4) {
          showCustomAlert('Endereço Obrigatório', 'Por favor, informe a rua, quadra e número da sua residência ou pousada para entrega.', orderStreet);
          return;
        }
      }

      const hashis = orderHashis ? orderHashis.value : '1 par';
      const wasabiGari = orderWasabiGari ? orderWasabiGari.value : 'Sim (Ambos)';

      let selectedPayment = 'Pix';
      if (paymentMethodRadios) {
        paymentMethodRadios.forEach(r => {
          if (r.checked) selectedPayment = r.value;
        });
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
        (entry.complements || []).forEach(c => unit += c.price);
        subtotal += unit * entry.qty;
      });

      const fee = deliveryType === 'delivery' ? (selectedNeighborhood ? selectedNeighborhood.fee : 12.00) : 0.00;
      const grandTotal = subtotal + fee;

      // Build formatted WhatsApp Message with canonical tags [#007]
      let msg = `${WA_ICONS.sushi} *NOVO PEDIDO — OMAKI SUSHI*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `${WA_ICONS.client} *Cliente:* ${customerName}\n`;
      msg += `${WA_ICONS.phone} *WhatsApp:* ${customerPhone}\n`;

      if (deliveryType === 'delivery') {
        msg += `${WA_ICONS.moto} *Modalidade:* Entrega (Delivery)\n`;
        msg += `${WA_ICONS.pin} *Endereço:* ${street}\n`;
        msg += `${WA_ICONS.neighborhood} *Bairro:* ${neighborhoodName}\n`;
        if (complement) msg += `${WA_ICONS.ref} *Ponto de Ref:* ${complement}\n`;
      } else {
        msg += `${WA_ICONS.takeaway} *Modalidade:* Retirada no Balcão\n`;
        msg += `${WA_ICONS.pin} *Local de Retirada:* Av. Ary Valadão Filho, Qd. 02, Lt. 04 — Centro, Alto Paraíso / GO\n`;
        msg += `${WA_ICONS.map} *Google Maps:* https://maps.google.com/?q=Omaki+Sushi+Alto+Paraiso+de+Goias\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `${WA_ICONS.cart} *ITENS DO PEDIDO:*\n\n`;

      cart.forEach(entry => {
        const itemTag = entry.item.num ? `[#${String(entry.item.num).padStart(3, '0')}]` : '[PROMO]';
        let itemPriceUnit = entry.item.price;
        (entry.complements || []).forEach(c => itemPriceUnit += c.price);
        const totalLine = itemPriceUnit * entry.qty;

        msg += `• *${entry.qty}x ${itemTag} ${entry.item.name}* — ${formatMoney(totalLine)}\n`;

        if (entry.complements && entry.complements.length > 0) {
          entry.complements.forEach(c => {
            msg += `   └ ${WA_ICONS.plus} _${c.name}_ (+${formatMoney(c.price)})\n`;
          });
        }

        if (entry.notes) {
          msg += `   └ ${WA_ICONS.notes} _Obs: ${entry.notes}_\n`;
        }
        msg += `\n`;
      });

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `${WA_ICONS.hashis} *Hashis:* ${hashis}\n`;
      msg += `${WA_ICONS.wasabi} *Wasabi & Gengibre:* ${wasabiGari}\n`;
      msg += `${WA_ICONS.card} *Pagamento:* ${selectedPayment}${cashNote}\n`;
      if (selectedPayment === 'Pix') {
        msg += `   └ ${WA_ICONS.pix} _Chave Pix: ${data.store.pixKey || '+55 62 99174-9928'}_\n`;
      }

      if (generalNotes) {
        msg += `${WA_ICONS.notes} *Obs Geral:* ${generalNotes}\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `${WA_ICONS.box} *Subtotal dos Itens:* ${formatMoney(subtotal)}
`;
      if (deliveryType === 'delivery') {
        msg += `${WA_ICONS.moto} *Taxa de Entrega:* ${formatMoney(fee)}\n`;
      } else {
        msg += `${WA_ICONS.takeaway} *Taxa de Entrega:* Grátis (Retirada no Balcão)\n`;
      }
      msg += `${WA_ICONS.money} *TOTAL DO PEDIDO:* ${formatMoney(grandTotal)}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      const storeWhatsApp = data.store.whatsapp || '5562991749928';
      const waUrl = `https://api.whatsapp.com/send?phone=${storeWhatsApp}&text=${encodeURIComponent(msg)}`;

      window.open(waUrl, '_blank');
    });
  }

  // --- BOOTSTRAP INITIALIZATION ---
  initNeighborhoods();
  initCategories();
  renderMenu('', 'all');
  updateCartUI();
});
