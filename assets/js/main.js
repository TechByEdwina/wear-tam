/* ============================================================
   wear.TAM | Main JavaScript
   Pure Vanilla JS · No dependencies
============================================================ */

'use strict';

/* ─── LOADER ─────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('fade-out');
      document.body.style.overflow = '';
    }, 1200);
  });

  // Prevent scroll while loading
  document.body.style.overflow = 'hidden';
})();

/* ─── CUSTOM CURSOR ──────────────────────────────────── */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  // Only activate on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower via rAF
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effects
  const hoverTargets = 'a, button, .product-card, .social-tile, .lookbook-card, .filter-tab, .size-btn';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.add('is-hovering');
      follower.classList.add('is-hovering');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.remove('is-hovering');
      follower.classList.remove('is-hovering');
    }
  });
})();

/* ─── NAVIGATION ─────────────────────────────────────── */
(function initNav() {
  const nav        = document.getElementById('nav');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks= document.querySelectorAll('.mobile-link');

  if (!nav) return;

  // Scroll-aware nav
  function handleScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Close mobile menu on outside click
  document.addEventListener('click', e => {
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      if (!nav.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
    }
  });

  // Active link highlighting on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - (window.innerHeight / 3);
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
})();

/* ─── SCROLL REVEAL ──────────────────────────────────── */
(function initReveal() {
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
})();

/* ─── PRODUCT DATA ───────────────────────────────────── */
const products = {
  1: {
    id: 1,
    name: 'Becca Denim Set',
    price: '₦72,500',
    priceRaw: 72500,
    category: 'sets',
    description: 'From the Alpha Collection by wear.TAM. A denim piece that redefines casual. Structured, polished, effortlessly cool. The bestseller of the collection.',
    gradient: "url('assets/images/becca-main.PNG') center/cover no-repeat",
    gradientHover: "url('assets/images/becca-main.PNG') center/cover no-repeat",
    extraImages: [],
    paymentLink: '#'
  },
  2: {
    id: 2,
    name: 'The Cherry Dress',
    price: '₦38,000',
    priceRaw: 38000,
    category: 'dresses',
    description: 'From the Alpha Collection by wear.TAM. A red dress built for the woman who walks into a room and owns it instantly.',
    gradient: "url('assets/images/red-dress-full.PNG') center/cover no-repeat",
    gradientHover: "url('assets/images/red-dress-stylish.PNG') center/cover no-repeat",
    extraImages: [
      "url('assets/images/cherry-dress-thumbnail.jpg') center/cover no-repeat",
      "url('assets/images/cherry-dress-thumbnail02.jpg') center/cover no-repeat",
      "url('assets/images/cherry-dress-thumbnail03.jpg') center/cover no-repeat",
      "url('assets/images/cherry-dress-thumbnail04.jpg') center/cover no-repeat"
    ],
    paymentLink: '#'
  },
  3: {
    id: 3,
    name: 'Lily Set',
    price: '₦49,000',
    priceRaw: 49000,
    category: 'dresses',
    description: 'From the Alpha Collection by wear.TAM. A striking set designed to make you unforgettable. Available in black and purple. Crafted with precision and intention.',
    gradient: "url('assets/images/Lily-set-purple.jpg') center/cover no-repeat",
    gradientHover: "url('assets/images/Lily-set-purple-02.jpg') center/cover no-repeat",
    extraImages: [
      "url('assets/images/Lily-set-twomodel.jpg') center/cover no-repeat",
      "url('assets/images/lily-thumbnail.jpg') center/cover no-repeat",
      "url('assets/images/lily-thumbnail02.jpg') center/cover no-repeat",
      "url('assets/images/lily-thumbnail03.jpg') center/cover no-repeat",
      "url('assets/images/lily-thumbnail04.jpg') center/cover no-repeat"
    ],
    paymentLink: '#'
  },
  4: {
    id: 4,
    name: 'Kayla Suit Set - Skirt',
    price: '₦70,000',
    priceRaw: 70000,
    category: 'sets',
    description: 'From the Alpha Collection by wear.TAM. A pink skirt suit set that commands a room. Feminine, bold, and completely TAM.',
    gradient: "url('assets/images/kayla-suit-skirt-main.PNG') center/cover no-repeat",
    gradientHover: "url('assets/images/kayla-suit-skirt-main.PNG') center/cover no-repeat",
    extraImages: [],
    paymentLink: '#'
  },
  5: {
    id: 5,
    name: 'Kayla Suit Set - Pants',
    price: '₦69,000',
    priceRaw: 69000,
    category: 'sets',
    description: 'From the Alpha Collection by wear.TAM. The Kayla Suit Set in pants. A cream silhouette that moves with quiet confidence. Timeless from every angle.',
    gradient: "url('assets/images/kayla-suit-set-pants-main.PNG') center/cover no-repeat",
    gradientHover: "url('assets/images/Kayla-Suit-Set-Pants02.PNG') center/cover no-repeat",
    extraImages: [
      "url('assets/images/Kayla-Suit-Set-Pants.PNG') center/cover no-repeat",
      "url('assets/images/kayla-suit-pants-thumbnail.jpg') center/cover no-repeat",
      "url('assets/images/kayla-suit-pants-thumbnail02.jpg') center/cover no-repeat"
    ],
    paymentLink: '#'
  },
  6: {
    id: 6,
    name: 'Lily Set - Black',
    price: '₦49,000',
    priceRaw: 49000,
    category: 'dresses',
    description: 'From the Alpha Collection by wear.TAM. The Lily Set in classic black. The same elegant silhouette, in its most timeless form.',
    gradient: "url('assets/images/lily-set-black-main.jpeg') center/cover no-repeat",
    gradientHover: "url('assets/images/black-dress-style.PNG') center/cover no-repeat",
    extraImages: [
      "url('assets/images/Lily-set-twomodel.jpg') center/cover no-repeat",
      "url('assets/images/lily-set-black-thumbnail.jpg') center/cover no-repeat",
      "url('assets/images/lily-set-black-thumbnail02.jpg') center/cover no-repeat"
    ],
    paymentLink: '#'
  }
};

/* ─── CART STATE ─────────────────────────────────────── */
const cart = {
  items: [],

  add(productId, size) {
    const product = products[productId];
    if (!product) return;

    const existingIndex = this.items.findIndex(
      item => item.id === productId && item.size === size
    );

    if (existingIndex > -1) {
      this.items[existingIndex].qty += 1;
    } else {
      this.items.push({ ...product, size, qty: 1 });
    }

    this.save();
    this.updateUI();
    return product;
  },

  remove(productId, size) {
    this.items = this.items.filter(
      item => !(item.id === productId && item.size === size)
    );
    this.save();
    this.updateUI();
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.priceRaw * item.qty), 0);
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  save() {
    try {
      localStorage.setItem('tam_cart', JSON.stringify(this.items));
    } catch (e) { /* storage unavailable */ }
  },

  load() {
    try {
      const saved = localStorage.getItem('tam_cart');
      if (saved) this.items = JSON.parse(saved);
    } catch (e) { /* ignore */ }
    this.updateUI();
  },

  updateUI() {
    const count = this.getCount();

    // Nav badge
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = count;
      cartCount.classList.toggle('has-items', count > 0);
    }

    // Drawer count label
    const drawerCount = document.getElementById('cartDrawerCount');
    if (drawerCount) drawerCount.textContent = `(${count})`;

    // Cart items list
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    const cartFooter  = document.getElementById('cartFooter');
    const cartTotalEl = document.getElementById('cartTotal');

    if (cartItemsEl) {
      cartItemsEl.innerHTML = '';

      if (this.items.length === 0) {
        if (cartEmptyEl)  cartEmptyEl.style.display = '';
        if (cartFooter)   cartFooter.style.display  = 'none';
      } else {
        if (cartEmptyEl) cartEmptyEl.style.display = 'none';
        if (cartFooter)  cartFooter.style.display  = '';

        this.items.forEach(item => {
          const li = document.createElement('li');
          li.className = 'cart-item';
          li.innerHTML = `
            <div class="cart-item-img" style="background: ${item.gradient}"></div>
            <div class="cart-item-info">
              <p class="cart-item-name">${escapeHtml(item.name)}</p>
              <p class="cart-item-size">Size: ${escapeHtml(item.size)} · Qty: ${item.qty}</p>
              <p class="cart-item-price">${escapeHtml(item.price)}</p>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" data-size="${escapeHtml(item.size)}" aria-label="Remove ${escapeHtml(item.name)}">
              <i class="fas fa-xmark"></i>
            </button>
          `;
          cartItemsEl.appendChild(li);
        });
      }
    }

    // Total
    const total = this.getTotal();
    if (cartTotalEl) {
      cartTotalEl.textContent = '₦' + total.toLocaleString('en-NG');
    }

    // Checkout button, Paystack link (update with real link)
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.href = '#'; // Replace: 'https://paystack.com/pay/YOUR_LINK'
    }
  }
};

/* ─── CART DRAWER ─────────────────────────────────────── */
(function initCartDrawer() {
  const cartBtn     = document.getElementById('cartBtn');
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose   = document.getElementById('cartClose');
  const cartShopLink= document.getElementById('cartShopLink');
  const cartItemsEl = document.getElementById('cartItems');

  function openCart() {
    cartDrawer?.classList.add('open');
    cartOverlay?.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeCart() {
    cartDrawer?.classList.remove('open');
    cartOverlay?.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  cartShopLink?.addEventListener('click', closeCart);

  // Remove items from drawer
  cartItemsEl?.addEventListener('click', e => {
    const removeBtn = e.target.closest('.cart-item-remove');
    if (removeBtn) {
      const id   = parseInt(removeBtn.dataset.id, 10);
      const size = removeBtn.dataset.size;
      cart.remove(id, size);
      showToast('Item removed from bag.');
    }
  });
})();

/* ─── PRODUCT MODAL ──────────────────────────────────── */
(function initProductModal() {
  const overlay    = document.getElementById('modalOverlay');
  const modal      = document.getElementById('productModal');
  const closeBtn   = document.getElementById('modalClose');
  const mainImg    = document.getElementById('modalMainImg');
  const thumbsEl   = document.getElementById('modalThumbs');
  const titleEl    = document.getElementById('modalTitle');
  const priceEl    = document.getElementById('modalPrice');
  const descEl     = document.getElementById('modalDesc');
  const addBtn     = document.getElementById('modalAddBtn');
  const payBtn     = document.getElementById('modalPayBtn');
  const sizeOptions= document.getElementById('sizeOptions');

  let currentProductId = null;
  let selectedSize = '10';

  function openModal(productId) {
    const product = products[productId];
    if (!product) return;

    currentProductId = productId;
    selectedSize = 'M';

    // Helper — set main image from a background string like "url('...')"
    function setMainImage(bg) {
      if (!mainImg) return
      if (bg && bg.startsWith('url(')) {
        const src = bg.replace(/^url\(['"]?/, '').replace(/['"]?\).*$/, '')
        mainImg.innerHTML = `<img src="${src}" alt="${escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
        mainImg.style.background = ''
      } else {
        mainImg.innerHTML = ''
        mainImg.style.background = bg || ''
      }
    }

    // Populate thumbnails and auto-select first
    if (thumbsEl) {
      thumbsEl.innerHTML = ''
      const thumbImages = [product.gradient, product.gradientHover, ...(product.extraImages || [])]

      thumbImages.forEach((bg, i) => {
        const thumb = document.createElement('div')
        thumb.className = 'modal-thumb' + (i === 0 ? ' active' : '')
        thumb.style.background = bg
        thumb.setAttribute('data-index', i)
        thumb.setAttribute('aria-label', `Product image ${i + 1}`)
        thumbsEl.appendChild(thumb)

        thumb.addEventListener('click', () => {
          document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'))
          thumb.classList.add('active')
          setMainImage(bg)
        })
      })

      // Auto-load first image immediately
      setMainImage(thumbImages[0])
    }

    if (titleEl) titleEl.textContent = product.name;
    if (priceEl) priceEl.textContent = product.price;
    if (descEl)  descEl.textContent  = product.description;

    // Reset size selection
    if (sizeOptions) {
      document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === '10');
      });
    }

    // Payment link
    if (payBtn) payBtn.href = product.paymentLink || '#';

    overlay?.classList.add('open');
    modal?.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    overlay?.classList.remove('open');
    modal?.classList.remove('open');
    document.body.classList.remove('no-scroll');
    currentProductId = null;

    // Reset mode to standard
    document.querySelectorAll('.size-mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('modeStandard')?.classList.add('active');
    document.getElementById('panelStandard')?.classList.remove('hidden');
    document.getElementById('panelMeasurements')?.classList.add('hidden');
  }

  // Open modal from "View" buttons OR clicking the card itself
  document.addEventListener('click', e => {
    const viewBtn = e.target.closest('.product-view-btn')
    const card    = e.target.closest('.product-card')

    // Don't trigger modal if clicking Quick Add button
    if (e.target.closest('.quick-add')) return

    if (viewBtn) {
      openModal(parseInt(viewBtn.dataset.id, 10))
    } else if (card) {
      const id = card.querySelector('.product-view-btn')?.dataset.id
      if (id) openModal(parseInt(id, 10))
    }
  })

  // Quick add from product grid
  document.addEventListener('click', e => {
    const quickBtn = e.target.closest('.quick-add');
    if (quickBtn) {
      const id = parseInt(quickBtn.dataset.id, 10);
      cart.add(id, 'M');
      showToast(`${quickBtn.dataset.name} added to bag ✓`);
    }
  });

  // Size selection
  sizeOptions?.addEventListener('click', e => {
    const sizeBtn = e.target.closest('.size-btn');
    if (sizeBtn) {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      sizeBtn.classList.add('active');
      selectedSize = sizeBtn.textContent;
    }
  });

  // Add to bag from modal
  addBtn?.addEventListener('click', () => {
    if (currentProductId === null) return;

    // Check which mode is active
    const activeModeBtn = document.querySelector('.size-mode-btn.active');
    const mode = activeModeBtn ? activeModeBtn.dataset.mode : 'standard';

    let sizeLabel = selectedSize;

    if (mode === 'measurements') {
      // Collect filled-in measurements
      const fields = {
        'Bust':           document.getElementById('mBust')?.value,
        'Waist':          document.getElementById('mWaist')?.value,
        'Hips':           document.getElementById('mHips')?.value,
        'Height':         document.getElementById('mHeight')?.value,
        'Shoulder':       document.getElementById('mShoulder')?.value,
        'Sleeve':         document.getElementById('mSleeve')?.value,
        'Thigh':          document.getElementById('mThigh')?.value,
        'Inseam':         document.getElementById('mInseam')?.value,
        'Back Length':    document.getElementById('mBackLength')?.value,
        'Neck':           document.getElementById('mNeck')?.value,
      };

      const filled = Object.entries(fields)
        .filter(([, v]) => v && v.trim() !== '')
        .map(([k, v]) => `${k}: ${v}cm`);

      sizeLabel = filled.length > 0
        ? 'Custom (' + filled.join(', ') + ')'
        : 'Custom Measurements';
    }

    const product = cart.add(currentProductId, sizeLabel);
    if (product) {
      showToast(`${product.name} added to bag ✓`);
      closeModal();

      setTimeout(() => {
        document.getElementById('cartDrawer')?.classList.add('open');
        document.getElementById('cartOverlay')?.classList.add('open');
        document.body.classList.add('no-scroll');
      }, 400);
    }
  });

  // Close handlers
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) {
      closeModal();
    }
  });
})();

/* ─── SIZE MODE TOGGLE ───────────────────────────────── */
(function initSizeModeToggle() {
  const modeBtns      = document.querySelectorAll('.size-mode-btn');
  const panelStandard = document.getElementById('panelStandard');
  const panelMeasure  = document.getElementById('panelMeasurements');

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      if (mode === 'standard') {
        panelStandard?.classList.remove('hidden');
        panelMeasure?.classList.add('hidden');
      } else {
        panelStandard?.classList.add('hidden');
        panelMeasure?.classList.remove('hidden');
      }
    });
  });
})();


(function initFilterTabs() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.product-card[data-category]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          // Re-trigger reveal animation
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 50);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ─── LOOKBOOK DRAG SCROLL ──────────────────────────── */
(function initLookbookDrag() {
  const strip = document.querySelector('.lookbook-strip');
  if (!strip) return;

  let isDown   = false;
  let startX   = 0;
  let scrollLeft = 0;

  strip.addEventListener('mousedown', e => {
    isDown = true;
    strip.classList.add('is-dragging');
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  });

  strip.addEventListener('mouseleave', () => {
    isDown = false;
    strip.classList.remove('is-dragging');
  });

  strip.addEventListener('mouseup', () => {
    isDown = false;
    strip.classList.remove('is-dragging');
  });

  strip.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - strip.offsetLeft;
    const walk = (x - startX) * 1.5;
    strip.scrollLeft = scrollLeft - walk;
  });
})();

/* ─── NEWSLETTER FORM ─────────────────────────────────── */
(function initNewsletter() {
  const form = document.getElementById('newsletterForm')
  if (!form) return

  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzaeCWndVSE7CZY8uSZJq1lKxI80M8Iwe_jcMkSAzU3xw2JTgLw9l6f8lLErEQ75eEO/exec'

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const input = form.querySelector('input[type="email"]')
    const btn   = form.querySelector('button[type="submit"]')
    const email = input?.value?.trim()
    if (!email) return

    btn.disabled = true
    btn.textContent = 'Subscribing...'

    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${encodeURIComponent(email)}`
      })
      showToast('You\'re on the list. Welcome to TAM ✓')
      input.value = ''
      btn.textContent = 'Subscribed ✓'
      btn.style.background = '#2B2B2B'
      setTimeout(() => {
        btn.textContent = 'Subscribe'
        btn.style.background = ''
        btn.disabled = false
      }, 3000)
    } catch (err) {
      showToast('Something went wrong. Please try again.')
      btn.textContent = 'Subscribe'
      btn.disabled = false
    }
  })
})();

/* ─── CONTACT FORM ────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm')
  if (!form) return

  const FORMSPREE_URL = 'https://formspree.io/f/xzerbdbl'

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const btn = form.querySelector('button[type="submit"]')

    const firstName = form.querySelector('#firstName').value.trim()
    const lastName  = form.querySelector('#lastName').value.trim()
    const email     = form.querySelector('#email').value.trim()
    const message   = form.querySelector('#message').value.trim()

    if (!firstName || !email || !message) {
      showToast('Please fill in all required fields.')
      return
    }

    btn.disabled = true
    btn.textContent = 'Sending...'

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name:    `${firstName} ${lastName}`,
          email:   email,
          message: message
        })
      })

      if (res.ok) {
        btn.textContent = 'Message Sent ✓'
        btn.style.background = '#2B2B2B'
        showToast('Your message was sent. We\'ll be in touch soon.')
        form.reset()
        setTimeout(() => {
          btn.textContent = 'Send Message'
          btn.style.background = ''
          btn.disabled = false
        }, 3000)
      } else {
        throw new Error('Form submission failed')
      }
    } catch (err) {
      showToast('Could not send message. Please try again.')
      btn.textContent = 'Send Message'
      btn.disabled = false
    }
  })
})();

/* ─── BACK TO TOP ─────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height'), 10) || 72;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();

/* ─── PARALLAX HERO ──────────────────────────────────── */
(function initParallax() {
  // Parallax disabled — hero uses video background
})();

/* ─── LAZY LOAD HERO VIDEO ───────────────────────────── */
(function initLazyVideo() {
  const video = document.getElementById('heroVideo')
  if (!video) return

  window.addEventListener('load', () => {
    const source = video.querySelector('source[data-src]')
    if (source) {
      source.src = source.dataset.src
      video.load()
      video.play().catch(() => {})
    }
  })
})()

/* ─── TOAST HELPER ───────────────────────────────────── */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ─── SECURITY: HTML ESCAPE ──────────────────────────── */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

/* ─── INIT ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  cart.load();
});
