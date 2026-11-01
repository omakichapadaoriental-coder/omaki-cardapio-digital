/**
 * OMAKI SUSHI — CARDÁPIO DIGITAL & CHECKOUT WHATSAPP
 * Engine interativa para visualização, personalização e pedidos direto no WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.OMAKI_DATA;
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

  // --- CUSTOM ELEGANT ALERT (REPLACES BROWSER ALERT) ---
  function showCustomAlert(title, message, inputToFocus = null) {
    if (!customAlertOverlay) {
      alert(message);
      return;
    }
    if (customAlertTitle) customAlertTitle.textContent = title || 'Atenção';
    if (customAlertMessage) customAlertMessage.textContent = message;
    customAlertOverlay.style.display = 'flex';

    if (inputToFocus) {
      inputToFocus.classList.add('input-error');
      inputToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        try { inputToFocus.focus(); } catch (err) {}
      }, 200);
    }

    const closeHandler = () => {
      customAlertOverlay.style.display = 'none';
      if (inputToFocus) {
        setTimeout(() => inputToFocus.classList.remove('input-error'), 1800);
      }
      customAlertBtn.removeEventListener('click', closeHandler);
      customAlertOverlay.removeEventListener('click', overlayHandler);
    };

    const overlayHandler = (e) => {
      if (e.target === customAlertOverlay) closeHandler();
    };

    if (customAlertBtn) customAlertBtn.addEventListener('click', closeHandler);
    customAlertOverlay.addEventListener('click', overlayHandler);
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

  // --- CATEGORIES NAVIGATION INIT ---
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
      renderMenu();
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
        const targetSec = document.getElementById(c.id);
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

  // --- RENDER MENU ---
  function renderMenu(searchTerm = '') {
    if (!menuContainer) return;
    menuContainer.innerHTML = '';
    const term = searchTerm.trim().toLowerCase();
    const dishesList = data.dishes || [];

    CATEGORY_MAP.forEach(catDef => {
      const filteredDishes = dishesList.filter(dish => {
        const matchesCategory = catDef.match(dish);
        if (!matchesCategory) return false;

        if (!term) return true;

        // Search in single dish properties
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
    // For single item with num: #005
    // For grouped item: show # of options or category badge
    // For combos: pieces are in title, do not show redundant portion badge
    let tagBadge = '';
    if (dish.num) {
      tagBadge = `<span class="badge-item-num">#${String(dish.num).padStart(3, '0')}</span>`;
    } else if (dish.isNew) {
      tagBadge = `<span class="badge-item-num" style="background:#8b1e3f; border-color:#e5c07b; color:#fff;">✨ NOVO</span>`;
    } else if (dish.isGrouped && dish.options) {
      tagBadge = `<span class="badge-item-num" style="background:rgba(7,10,17,0.85); color:var(--accent-gold);">${dish.options.length} OPÇÕES</span>`;
    }

    // Portion badge: ONLY for non-combos (since combos already have piece count in the name)
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
      renderMenu(val);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderMenu();
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

    // Set Image (full picture displayed via object-fit contain)
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
            <span class="option-name">
              ${opt.num ? `<span class="option-code">#${String(opt.num).padStart(3, '0')}</span>` : ''}
              ${opt.name}
            </span>
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
      const toppings = dish.pokeToppings || ['Cebolinha', 'Manga', 'Pepino fatiado', 'Tomate cereja', 'Avocado', 'Crispy de couve', 'Crispy de Batata', 'Gergelim', 'Gengibre', 'Cenoura', 'Alga', 'Crispy de Harumaki'];
      const sauces = dish.pokeSauces || ['Molho especial trufado', 'Molho especial do Chef', 'Molho Tataki', 'Molho Tarê', 'Shoyu Tradicional'];

      let pokeHtml = `
        <div class="special-custom-group">
          <div class="special-group-header">
            <h4>Acompanhamentos</h4>
            <span class="special-badge-counter" id="pokeToppingsCounter">0 de 6 selecionados</span>
          </div>
          <p class="section-hint">Selecione até 6 acompanhamentos inclusos para seu Poke:</p>
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
            <span class="required-tag" style="background:#8b1e3f; color:#fff; font-size:0.68rem; padding:2px 8px; border-radius:4px; font-weight:700;">1 incluso</span>
          </div>
          <p class="section-hint">Escolha o molho artesanal de finalização:</p>
          <div class="poke-chips-grid">
      `;
      sauces.forEach((sc, idx) => {
        pokeHtml += `
          <label class="poke-chip radio-chip ${idx === 0 ? 'selected' : ''}">
            <input type="radio" name="pokeSauce" value="${sc}" ${idx === 0 ? 'checked' : ''}>
            <span class="poke-chip-indicator radio"></span>
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
      selectedSpecialOptions.pokeSauce = sauces[0];
      selectedSpecialOptions.pokeToppings = [];

      // Topping limit logic (max 6) with luxury counter & highlights
      const topInputs = modalSpecialContent.querySelectorAll('input[name="pokeTop"]');
      const counterEl = document.getElementById('pokeToppingsCounter');

      topInputs.forEach(inp => {
        inp.addEventListener('change', () => {
          const parentLabel = inp.closest('.poke-chip');
          const checked = Array.from(topInputs).filter(i => i.checked);
          if (checked.length > 6) {
            inp.checked = false;
            if (parentLabel) parentLabel.classList.remove('selected');
            showCustomAlert('Limite Atingido', 'Você pode selecionar no máximo 6 acompanhamentos inclusos para o seu Poke.');
            return;
          }

          if (parentLabel) parentLabel.classList.toggle('selected', inp.checked);
          selectedSpecialOptions.pokeToppings = checked.map(i => i.value);

          if (counterEl) {
            counterEl.textContent = `${checked.length} de 6 selecionados`;
            counterEl.classList.toggle('full', checked.length === 6);
          }
        });
      });

      // Sauce selection logic
      const sauceInputs = modalSpecialContent.querySelectorAll('input[name="pokeSauce"]');
      sauceInputs.forEach(inp => {
        inp.addEventListener('change', () => {
          modalSpecialContent.querySelectorAll('.radio-chip').forEach(el => el.classList.remove('selected'));
          const parentLabel = inp.closest('.radio-chip');
          if (parentLabel) parentLabel.classList.add('selected');
          if (inp.checked) selectedSpecialOptions.pokeSauce = inp.value;
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
          num: currentSelectedOption.num,
          code: currentSelectedOption.code,
          name: `${currentModalDish.title} — ${currentSelectedOption.name}`,
          category: currentModalDish.category,
          price: currentSelectedOption.price,
          portion: currentSelectedOption.portion || currentModalDish.portion,
          photo: currentModalDish.photo || currentModalDish.image,
          description: currentSelectedOption.description
        };
      } else {
        canonicalItem = currentModalDish.rawItem || {
          num: currentModalDish.num,
          code: currentModalDish.code,
          name: currentModalDish.title || currentModalDish.name,
          category: currentModalDish.category,
          price: currentModalDish.price,
          portion: currentModalDish.portion,
          photo: currentModalDish.photo || currentModalDish.image,
          description: currentModalDish.description,
          isNew: currentModalDish.isNew
        };
      }

      const complementsList = [];
      selectedComplements.forEach(cmpId => {
        const c = data.complements.find(item => item.id === cmpId);
        if (c) complementsList.push(c);
      });

      // Special notes summary
      const specialNotes = [];
      if (selectedSpecialOptions.temakiFried) specialNotes.push('Empanar Temaki (+R$ 9,00)');
      if (selectedSpecialOptions.temakiNoRice) specialNotes.push('Substituir arroz por salmão (+R$ 16,00)');
      if (selectedSpecialOptions.pokeDoubleProtein) specialNotes.push('Dobrar Proteína (+R$ 25,00)');
      if (selectedSpecialOptions.pokeSauce) specialNotes.push(`Molho: ${selectedSpecialOptions.pokeSauce}`);
      if (selectedSpecialOptions.pokeToppings && selectedSpecialOptions.pokeToppings.length > 0) {
        specialNotes.push(`Acomp: ${selectedSpecialOptions.pokeToppings.join(', ')}`);
      }

      let extraPrice = 0;
      if (selectedSpecialOptions.temakiFried) extraPrice += 9.00;
      if (selectedSpecialOptions.temakiNoRice) extraPrice += 16.00;
      if (selectedSpecialOptions.pokeDoubleProtein) extraPrice += 25.00;

      const userNotes = modalItemNotes ? modalItemNotes.value.trim() : '';
      const fullNotes = [...specialNotes, userNotes].filter(Boolean).join(' | ');

      const entry = {
        id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        item: {
          ...canonicalItem,
          price: canonicalItem.price + extraPrice
        },
        qty: currentModalQty,
        complements: complementsList,
        notes: fullNotes
      };

      cart.push(entry);
      saveCart();
      updateCartUI();
      closeItemModal();
      showToast(`🍣 "${canonicalItem.name}" adicionado à sacola!`);
    });
  }

  // --- CHECKOUT DRAWER & CART MANAGEMENT ---
  function openCartDrawer() {
    if (!cartDrawer) return;
    renderCartItems();
    updateTotals();
    cartDrawer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (openCartHeaderBtn) openCartHeaderBtn.addEventListener('click', openCartDrawer);
  if (openCartBarBtn) openCartBarBtn.addEventListener('click', openCartDrawer);
  if (closeCartDrawerBtn) closeCartDrawerBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawer) {
    cartDrawer.addEventListener('click', (e) => {
      if (e.target === cartDrawer) closeCartDrawer();
    });
  }

  // Delivery vs Takeaway Switcher
  if (btnTypeDelivery) {
    btnTypeDelivery.addEventListener('click', () => {
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

  // Payment method switcher
  if (paymentMethodRadios) {
    paymentMethodRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const val = radio.value;
        if (pixInfoBox) pixInfoBox.style.display = val === 'Pix' ? 'block' : 'none';
        if (cashChangeBox) cashChangeBox.style.display = val === 'Dinheiro' ? 'block' : 'none';
      });
    });
  }

  // Copy Pix Key
  if (copyPixBtn) {
    copyPixBtn.addEventListener('click', () => {
      const pixKey = data.store.pixKeyRaw || data.store.pixKey || '+55 62 99174-9928';
      navigator.clipboard.writeText(pixKey).then(() => {
        showToast('🔑 Chave Pix copiada com sucesso!');
      }).catch(() => {
        showCustomAlert('Chave Pix', `Copie a chave Pix da Omaki Sushi:\n${pixKey}`);
      });
    });
  }

  // Render Cart Items in Drawer
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
      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row';

      const itemTag = entry.item.num 
        ? `<span class="cart-item-tag">#${String(entry.item.num).padStart(3, '0')}</span>` 
        : `<span class="cart-item-tag" style="background:#8b1e3f; color:#fff;">NOVO</span>`;

      let unitPrice = entry.item.price;
      let compHtml = '';
      if (entry.complements && entry.complements.length > 0) {
        compHtml += '<div class="cart-item-complements">';
        entry.complements.forEach(c => {
          unitPrice += c.price;
          compHtml += `<span>+ ${c.name} (${formatMoney(c.price)})</span>`;
        });
        compHtml += '</div>';
      }

      let notesHtml = '';
      if (entry.notes) {
        notesHtml = `<div class="cart-item-notes">📝 ${entry.notes}</div>`;
      }

      const rowTotal = unitPrice * entry.qty;

      itemRow.innerHTML = `
        <div class="cart-item-header">
          <div class="cart-item-title-col">
            <h4 class="cart-item-name">${itemTag} ${entry.item.name}</h4>
            ${compHtml}
            ${notesHtml}
          </div>
          <button class="cart-item-remove-btn" title="Remover item" data-index="${index}">✕</button>
        </div>
        <div class="cart-item-footer">
          <div class="cart-qty-controls">
            <button class="cart-qty-btn cart-minus" data-index="${index}">−</button>
            <span class="cart-qty-val">${entry.qty}</span>
            <button class="cart-qty-btn cart-plus" data-index="${index}">+</button>
          </div>
          <div class="cart-item-price-col">
            <span class="cart-item-total">${formatMoney(rowTotal)}</span>
          </div>
        </div>
      `;

      // Event Listeners for quantity and removal
      itemRow.querySelector('.cart-item-remove-btn').addEventListener('click', () => {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
        renderCartItems();
      });

      itemRow.querySelector('.cart-minus').addEventListener('click', () => {
        if (entry.qty > 1) {
          entry.qty--;
        } else {
          cart.splice(index, 1);
        }
        saveCart();
        updateCartUI();
        renderCartItems();
      });

      itemRow.querySelector('.cart-plus').addEventListener('click', () => {
        entry.qty++;
        saveCart();
        updateCartUI();
        renderCartItems();
      });

      cartItemsList.appendChild(itemRow);
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

  // --- SEND ORDER VIA WHATSAPP ---
  if (sendWhatsAppOrderBtn) {
    sendWhatsAppOrderBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showCustomAlert('Sacola Vazia', 'Sua sacola está vazia. Adicione itens antes de finalizar o pedido!');
        return;
      }

      const customerName = orderCustomerName ? orderCustomerName.value.trim() : '';
      if (!customerName) {
        showCustomAlert('Nome Obrigatório', 'Por favor, informe seu nome completo para identificarmos o pedido.', orderCustomerName);
        return;
      }

      const customerPhone = orderCustomerPhone ? orderCustomerPhone.value.trim() : '';
      if (!customerPhone) {
        showCustomAlert('WhatsApp Obrigatório', 'Por favor, informe seu número de WhatsApp/Telefone para contato e confirmação.', orderCustomerPhone);
        return;
      }

      let street = '';
      let neighborhoodName = '';
      let complement = '';

      if (deliveryType === 'delivery') {
        street = orderStreet ? orderStreet.value.trim() : '';
        neighborhoodName = selectedNeighborhood ? selectedNeighborhood.name : 'Centro';
        complement = orderComplement ? orderComplement.value.trim() : '';

        if (!street) {
          showCustomAlert('Endereço Obrigatório', 'Por favor, preencha a rua, quadra e número da residência ou pousada para entrega.', orderStreet);
          return;
        }
      }

      const hashis = orderHashis ? orderHashis.value : 'Não precisa';
      const wasabiGari = orderWasabiGari ? orderWasabiGari.value : 'Sim, ambos';

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

      // Build formatted WhatsApp Message
      let msg = `🍣 *NOVO PEDIDO — OMAKI SUSHI*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `👤 *Cliente:* ${customerName}\n`;
      msg += `📱 *WhatsApp:* ${customerPhone}\n`;
      msg += `🛵 *Modalidade:* ${deliveryType === 'delivery' ? 'Entrega (Delivery)' : 'Retirada no Balcão'}\n`;

      if (deliveryType === 'delivery') {
        msg += `📍 *Endereço:* ${street}\n`;
        msg += `🏘️ *Bairro:* ${neighborhoodName}\n`;
        if (complement) msg += `🏢 *Ponto de Ref:* ${complement}\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🛒 *ITENS DO PEDIDO:*\n\n`;

      cart.forEach(entry => {
        const itemTag = entry.item.num ? `[#${String(entry.item.num).padStart(3, '0')}]` : '[PROMO]';
        let itemPriceUnit = entry.item.price;
        (entry.complements || []).forEach(c => itemPriceUnit += c.price);
        const totalLine = itemPriceUnit * entry.qty;

        msg += `• *${entry.qty}x ${itemTag} ${entry.item.name}* — ${formatMoney(totalLine)}\n`;

        if (entry.complements && entry.complements.length > 0) {
          entry.complements.forEach(c => {
            msg += `   └ ➕ _${c.name}_ (+${formatMoney(c.price)})\n`;
          });
        }

        if (entry.notes) {
          msg += `   └ 📝 _Obs: ${entry.notes}_\n`;
        }
        msg += `\n`;
      });

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🥢 *Hashis:* ${hashis}\n`;
      msg += `🌿 *Wasabi/Gengibre:* ${wasabiGari}\n`;
      msg += `💳 *Pagamento:* ${selectedPayment}${cashNote}\n`;
      if (selectedPayment === 'Pix') {
        msg += `   └ ℹ️ _Chave Pix: ${data.store.pixKey || '+55 62 99174-9928'}_\n`;
      }

      if (generalNotes) {
        msg += `📝 *Obs Geral:* ${generalNotes}\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📦 *Subtotal dos Itens:* ${formatMoney(subtotal)}\n`;
      if (deliveryType === 'delivery') {
        msg += `🛵 *Taxa de Entrega:* ${formatMoney(fee)}\n`;
      } else {
        msg += `🛍️ *Taxa de Entrega:* Grátis (Retirada)\n`;
      }
      msg += `💰 *TOTAL DO PEDIDO:* ${formatMoney(grandTotal)}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `_Pedido gerado via Cardápio Digital Omaki Sushi_`;

      const storeWhatsApp = data.store.whatsapp || '5562991749928';
      const waUrl = `https://wa.me/${storeWhatsApp}?text=${encodeURIComponent(msg)}`;

      window.open(waUrl, '_blank');
    });
  }

  // --- BOOTSTRAP INITIALIZATION ---
  initNeighborhoods();
  initCategories();
  renderMenu();
  updateCartUI();
});
