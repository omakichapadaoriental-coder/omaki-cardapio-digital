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

  // --- CATEGORIES DEFINITION (Top of scope) ---
  const CATEGORY_MAP = [
    { id: 'cat-combos-promo', title: '🍱 Combos Promocionais', match: (cat, num, item) => cat.includes('Promocionais') || (num && num >= 177 && num <= 187) || (item && item.isNew) },
    { id: 'cat-combos-chef', title: '🍱 Combos do Chef', match: (cat, num) => num && num >= 173 && num <= 176 },
    { id: 'cat-especiais', title: '✨ Especiais do Chef', match: (cat, num) => cat.includes('Especiais') || (num && num >= 41 && num <= 51) },
    { id: 'cat-entradas', title: '🥢 Entradas & Harumakis', match: (cat, num) => cat.includes('Harumaki') || cat.includes('Entradas') || (num && num <= 11) },
    { id: 'cat-ceviches', title: '🐟 Ceviches & Tatakis', match: (cat, num) => cat.includes('Ceviche') || cat.includes('Tataki') || (num && num >= 12 && num <= 17) },
    { id: 'cat-carpaccios', title: '🐟 Carpaccios & Gunkans', match: (cat, num) => cat.includes('Carpaccio') || cat.includes('Gunkan') || (num && num >= 18 && num <= 32) },
    { id: 'cat-temakis', title: '🍣 Temakis', match: (cat, num) => cat.includes('Temaki') || (num && num >= 52 && num <= 60) },
    { id: 'cat-hots', title: '🔥 Hot Rolls & Big Hot', match: (cat, num) => cat.includes('Hot') || (num && num >= 61 && num <= 69) },
    { id: 'cat-sashimis', title: '🍣 Sashimis & Joys', match: (cat, num) => cat.includes('Sashimi') || cat.includes('Joy') || (num && num >= 70 && num <= 83) },
    { id: 'cat-rolls', title: '🍣 Uramakis, Hossomakis & Niguiris', match: (cat, num) => cat.includes('Uramaki') || cat.includes('Hossomaki') || cat.includes('Niguiri') || (num && num >= 84 && num <= 123) },
    { id: 'cat-pokes', title: '🥑 Pokes & Pratos Quentes', match: (cat, num) => cat.includes('Poke') || cat.includes('Yakisoba') || cat.includes('Teppan') || (num && num >= 124 && num <= 144) },
    { id: 'cat-bebidas', title: '🍻 Bebidas, Sucos & Sakês', match: (cat, num) => cat.includes('Bebidas') || cat.includes('Refrigerante') || cat.includes('Cerveja') || cat.includes('Sakê') || (num && num >= 145) }
  ];

  // --- STATE ---
  let cart = loadCart();
  let currentModalItem = null;
  let currentModalQty = 1;
  let selectedComplements = new Set();
  let deliveryType = 'delivery'; // 'delivery' | 'takeaway'
  let selectedNeighborhood = data.neighborhoods && data.neighborhoods.length > 0 ? data.neighborhoods[0] : { name: 'Centro', fee: 12.00 };

  // --- DOM ELEMENTS ---
  const categoriesNav = document.getElementById('categoriesNav');
  const menuContainer = document.getElementById('menuContainer');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

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

  // --- CATEGORIES INIT ---
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
  }

  // --- RENDER MENU ---
  function renderMenu(searchTerm = '') {
    if (!menuContainer) return;
    menuContainer.innerHTML = '';
    const term = searchTerm.trim().toLowerCase();

    CATEGORY_MAP.forEach(catDef => {
      const filteredItems = data.items.filter(item => {
        const matchesCategory = catDef.match(item.category, item.num, item);
        if (!matchesCategory) return false;

        if (!term) return true;

        const numStr = item.num ? String(item.num) : '';
        const codeStr = String(item.code || '');
        const nameStr = item.name.toLowerCase();
        const descStr = (item.description || '').toLowerCase();
        const isNewMatch = item.isNew && (term === 'novo' || term === 'novos');
        return numStr.includes(term) || codeStr.includes(term) || nameStr.includes(term) || descStr.includes(term) || isNewMatch;
      });

      if (filteredItems.length === 0) return;

      const section = document.createElement('section');
      section.className = 'menu-category-section';
      section.id = catDef.id;

      const header = document.createElement('div');
      header.className = 'category-section-header';
      header.innerHTML = `
        <h2 class="category-section-title">${catDef.title}</h2>
        <span class="category-item-count">${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'itens'}</span>
      `;
      section.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'products-grid';

      filteredItems.forEach(item => {
        const card = createProductCard(item);
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
          <p>Tente buscar por outro nome ou número do cardápio.</p>
        </div>
      `;
    }
  }

  // --- PRODUCT CARD COMPONENT ---
  function createProductCard(item) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.addEventListener('click', () => openItemModal(item));

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'product-card-img-wrapper';

    const tagBadge = item.num 
      ? `<span class="badge-item-num">#${String(item.num).padStart(3, '0')}</span>`
      : `<span class="badge-item-num" style="background:#8b1e3f; border-color:#e5c07b; color:#fff;">✨ NOVO</span>`;

    if (item.photo) {
      const img = document.createElement('img');
      img.className = 'product-card-img';
      img.src = item.photo;
      img.alt = item.name;
      img.loading = 'lazy';
      img.onerror = () => {
        imgWrapper.innerHTML = `
          <div class="product-card-no-img">🍣</div>
          <div class="product-card-badges">
            ${tagBadge}
            ${item.portion ? `<span class="badge-portion-pill">${item.portion}</span>` : ''}
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
      ${item.portion ? `<span class="badge-portion-pill">${item.portion}</span>` : ''}
    `;
    imgWrapper.appendChild(badges);

    const content = document.createElement('div');
    content.className = 'product-card-content';
    content.innerHTML = `
      <h3 class="product-card-title">${item.name}</h3>
      <p class="product-card-desc">${item.description || 'Preparado na hora com ingredientes frescos e selecionados.'}</p>
      <div class="product-card-footer">
        <span class="product-price">${formatMoney(item.price)}</span>
        <button type="button" class="product-add-btn">
          <span>+ Adicionar</span>
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

  // --- ITEM MODAL LOGIC ---
  function openItemModal(item) {
    if (!itemModal) return;
    currentModalItem = item;
    currentModalQty = 1;
    selectedComplements.clear();

    if (modalItemNum) modalItemNum.textContent = item.num ? `#${String(item.num).padStart(3, '0')}` : 'NOVO';
    if (modalItemPortion) modalItemPortion.textContent = item.portion || 'Porção';
    if (modalItemName) modalItemName.textContent = item.name;
    if (modalItemPrice) modalItemPrice.textContent = formatMoney(item.price);
    if (modalItemDesc) modalItemDesc.textContent = item.description || 'Preparado artesanalmente com rigor metrológico e insumos de altíssima qualidade.';
    if (modalItemNotes) modalItemNotes.value = '';
    if (modalQtyValue) modalQtyValue.textContent = '1';

    if (modalImgContainer) {
      if (item.photo) {
        if (modalItemImg) modalItemImg.src = item.photo;
        modalImgContainer.style.display = 'block';
      } else {
        modalImgContainer.style.display = 'none';
      }
    }

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

  function closeItemModal() {
    if (!itemModal) return;
    itemModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function updateModalTotal() {
    if (!currentModalItem || !modalAddTotalPrice) return;
    let singleTotal = currentModalItem.price;
    selectedComplements.forEach(id => {
      const cmp = data.complements.find(c => c.id === id);
      if (cmp) singleTotal += cmp.price;
    });
    const finalTotal = singleTotal * currentModalQty;
    modalAddTotalPrice.textContent = formatMoney(finalTotal);
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

  if (closeItemModalBtn) closeItemModalBtn.addEventListener('click', closeItemModal);
  if (itemModal) {
    itemModal.addEventListener('click', (e) => {
      if (e.target === itemModal) closeItemModal();
    });
  }

  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (!currentModalItem) return;

      const complementsArray = [];
      selectedComplements.forEach(id => {
        const found = data.complements.find(c => c.id === id);
        if (found) complementsArray.push(found);
      });

      const notes = modalItemNotes ? modalItemNotes.value.trim() : '';

      const existingIndex = cart.findIndex(c => {
        if (c.item.name !== currentModalItem.name) return false;
        if (c.notes !== notes) return false;
        const c1 = (c.complements || []).map(x => x.id).sort().join(',');
        const c2 = complementsArray.map(x => x.id).sort().join(',');
        return c1 === c2;
      });

      if (existingIndex > -1) {
        cart[existingIndex].qty += currentModalQty;
      } else {
        cart.push({
          id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          item: currentModalItem,
          qty: currentModalQty,
          complements: complementsArray,
          notes: notes
        });
      }

      saveCart();
      updateCartUI();
      closeItemModal();
      const tag = currentModalItem.num ? `#${String(currentModalItem.num).padStart(3, '0')}` : currentModalItem.name;
      showToast(`✓ ${tag} adicionado à sacola!`);
    });
  }

  // --- CART UI & UPDATES ---
  function updateCartUI() {
    const totalCount = cart.reduce((acc, curr) => acc + curr.qty, 0);
    const subtotal = calculateSubtotal();

    if (headerCartCount) headerCartCount.textContent = totalCount;
    if (floatingCartCount) floatingCartCount.textContent = totalCount;
    if (floatingCartSubtotal) floatingCartSubtotal.textContent = formatMoney(subtotal);
    if (drawerItemCount) drawerItemCount.textContent = `${totalCount} ${totalCount === 1 ? 'item' : 'itens'}`;

    if (floatingCartBar) {
      if (totalCount > 0) {
        floatingCartBar.style.display = 'block';
      } else {
        floatingCartBar.style.display = 'none';
      }
    }

    renderCartItems();
    updateTotals();
  }

  function calculateSubtotal() {
    return cart.reduce((acc, entry) => {
      let unitPrice = entry.item.price;
      (entry.complements || []).forEach(cmp => {
        unitPrice += cmp.price;
      });
      return acc + (unitPrice * entry.qty);
    }, 0);
  }

  function updateTotals() {
    const subtotal = calculateSubtotal();
    const fee = deliveryType === 'delivery' ? (selectedNeighborhood ? selectedNeighborhood.fee : 12.00) : 0.00;
    const grandTotal = subtotal + fee;

    if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);
    if (summaryDeliveryFee) summaryDeliveryFee.textContent = deliveryType === 'delivery' ? formatMoney(fee) : 'Grátis (Retirada)';
    if (summaryGrandTotal) summaryGrandTotal.textContent = formatMoney(grandTotal);
    if (footerBtnTotal) footerBtnTotal.textContent = formatMoney(grandTotal);

    if (deliveryFeeSummaryLine) {
      if (deliveryType === 'takeaway') {
        deliveryFeeSummaryLine.style.opacity = '0.6';
      } else {
        deliveryFeeSummaryLine.style.opacity = '1';
      }
    }
  }

  function renderCartItems() {
    if (!cartItemsList) return;
    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="empty-state" style="padding: 20px 0;">
          <div class="empty-state-icon" style="font-size:2rem;">🛒</div>
          <p>Sua sacola está vazia.</p>
        </div>
      `;
      return;
    }

    cart.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'cart-item-card';

      let unitPrice = entry.item.price;
      (entry.complements || []).forEach(c => unitPrice += c.price);
      const totalItemPrice = unitPrice * entry.qty;

      const complementsText = (entry.complements || []).map(c => `+ ${c.name} (${formatMoney(c.price)})`).join('<br>');
      const numTag = entry.item.num ? `#${String(entry.item.num).padStart(3, '0')}` : 'NOVO';

      card.innerHTML = `
        <div class="cart-item-main-row">
          <div class="cart-item-details">
            <span class="cart-item-num-tag">${numTag}</span>
            <strong class="cart-item-title">${entry.item.name}</strong>
          </div>
          <span class="cart-item-price-calc">${formatMoney(totalItemPrice)}</span>
        </div>
        ${complementsText ? `<div class="cart-item-complements">${complementsText}</div>` : ''}
        ${entry.notes ? `<div class="cart-item-obs">Obs: ${entry.notes}</div>` : ''}
        <div class="cart-item-actions-row">
          <div class="qty-control" style="transform: scale(0.85); transform-origin: left;">
            <button class="qty-btn btn-cart-minus">-</button>
            <span class="qty-value">${entry.qty}</span>
            <button class="qty-btn btn-cart-plus">+</button>
          </div>
          <button type="button" class="cart-item-remove-btn">Remover</button>
        </div>
      `;

      card.querySelector('.btn-cart-minus').addEventListener('click', () => {
        if (entry.qty > 1) {
          entry.qty--;
        } else {
          cart = cart.filter(c => c.id !== entry.id);
        }
        saveCart();
        updateCartUI();
      });

      card.querySelector('.btn-cart-plus').addEventListener('click', () => {
        entry.qty++;
        saveCart();
        updateCartUI();
      });

      card.querySelector('.cart-item-remove-btn').addEventListener('click', () => {
        cart = cart.filter(c => c.id !== entry.id);
        saveCart();
        updateCartUI();
      });

      cartItemsList.appendChild(card);
    });
  }

  // --- DRAWER ACTIONS ---
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

  // Delivery vs Takeaway toggles
  if (btnTypeDelivery) {
    btnTypeDelivery.addEventListener('click', () => {
      deliveryType = 'delivery';
      btnTypeDelivery.classList.add('active');
      if (btnTypeTakeaway) btnTypeTakeaway.classList.remove('active');
      if (deliveryFieldsGroup) deliveryFieldsGroup.style.display = 'flex';
      if (takeawayInfoGroup) takeawayInfoGroup.style.display = 'none';
      updateTotals();
    });
  }

  if (btnTypeTakeaway) {
    btnTypeTakeaway.addEventListener('click', () => {
      deliveryType = 'takeaway';
      btnTypeTakeaway.classList.add('active');
      if (btnTypeDelivery) btnTypeDelivery.classList.remove('active');
      if (deliveryFieldsGroup) deliveryFieldsGroup.style.display = 'none';
      if (takeawayInfoGroup) takeawayInfoGroup.style.display = 'block';
      updateTotals();
    });
  }

  // Payment radio change handler
  paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'Pix') {
        if (pixInfoBox) pixInfoBox.style.display = 'block';
        if (cashChangeBox) cashChangeBox.style.display = 'none';
      } else if (radio.value === 'Dinheiro') {
        if (pixInfoBox) pixInfoBox.style.display = 'none';
        if (cashChangeBox) cashChangeBox.style.display = 'block';
      } else {
        if (pixInfoBox) pixInfoBox.style.display = 'none';
        if (cashChangeBox) cashChangeBox.style.display = 'none';
      }
    });
  });

  // Copy Pix Button
  if (copyPixBtn) {
    copyPixBtn.addEventListener('click', () => {
      const rawKey = data.store.pixKeyRaw || '+55 62 9174-9928';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(rawKey).then(() => {
          showToast('✓ Chave Pix copiada com sucesso!');
        }).catch(() => {
          fallbackCopy(rawKey);
        });
      } else {
        fallbackCopy(rawKey);
      }
    });
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('✓ Chave Pix copiada com sucesso!');
    } catch (e) {
      prompt('Copie a chave Pix:', text);
    }
    document.body.removeChild(ta);
  }

  // --- WHATSAPP ORDER SUBMISSION ---
  if (sendWhatsAppOrderBtn) {
    sendWhatsAppOrderBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Sua sacola está vazia. Adicione itens antes de finalizar o pedido!');
        return;
      }

      const customerName = orderCustomerName ? orderCustomerName.value.trim() : '';
      const customerPhone = orderCustomerPhone ? orderCustomerPhone.value.trim() : '';

      if (!customerName) {
        alert('Por favor, informe seu nome completo para identificarmos o pedido.');
        if (orderCustomerName) orderCustomerName.focus();
        return;
      }

      if (!customerPhone) {
        alert('Por favor, informe seu número de WhatsApp/Telefone para contato.');
        if (orderCustomerPhone) orderCustomerPhone.focus();
        return;
      }

      let street = '';
      let complement = '';
      let neighborhoodName = '';
      let fee = 0;

      if (deliveryType === 'delivery') {
        street = orderStreet ? orderStreet.value.trim() : '';
        complement = orderComplement ? orderComplement.value.trim() : '';
        neighborhoodName = selectedNeighborhood ? selectedNeighborhood.name : 'Alto Paraíso';
        fee = selectedNeighborhood ? selectedNeighborhood.fee : 12.00;

        if (!street) {
          alert('Por favor, preencha o endereço completo (Rua, Quadra e Número) para entrega.');
          if (orderStreet) orderStreet.focus();
          return;
        }
      }

      let selectedPayment = 'Pix';
      paymentMethodRadios.forEach(r => {
        if (r.checked) selectedPayment = r.value;
      });

      let cashNote = '';
      if (selectedPayment === 'Dinheiro') {
        const val = cashChangeValue ? cashChangeValue.value.trim() : '';
        cashNote = val ? ` (Troco para: ${val})` : ' (Sem necessidade de troco)';
      }

      const hashis = orderHashis ? orderHashis.value : '1 par de hashi';
      const wasabiGari = orderWasabiGari ? orderWasabiGari.value : 'Enviar Wasabi e Gengibre';
      const generalNotes = orderGeneralNotes ? orderGeneralNotes.value.trim() : '';

      const subtotal = calculateSubtotal();
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
        const itemTag = entry.item.num ? `[#${String(entry.item.num).padStart(3, '0')}]` : '[NOVO]';
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
        msg += `   └ ℹ️ _Chave Pix: ${data.store.pixKey}_\n`;
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

      const storeWhatsApp = data.store.whatsapp || '556291749928';
      const waUrl = `https://wa.me/${storeWhatsApp}?text=${encodeURIComponent(msg)}`;

      window.open(waUrl, '_blank');
    });
  }

  // --- BOOTSTRAP INITIALIZATION (CALLED AFTER ALL FUNCTIONS DECLARED) ---
  initNeighborhoods();
  initCategories();
  renderMenu();
  updateCartUI();
});
