/* ============================================================
   wear.TAM — Guest Checkout with Paystack
============================================================ */

'use strict'

const _db = (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

/* ─── STATE ───────────────────────────────────────────── */
let checkoutItems  = []
let checkoutSource = ''

/* ─── OPEN CHECKOUT FROM CART ─────────────────────────── */
function openCheckoutFromCart(e) {
  if (e) e.preventDefault()

  const cartItems = JSON.parse(localStorage.getItem('tam_cart') || '[]')
  if (!cartItems.length) {
    alert('Your bag is empty.')
    return
  }

  // Map cart items to checkout format
  checkoutItems = cartItems.map(item => ({
    name:     item.name || 'TAM Product',
    price:    item.price || '₦0',
    priceRaw: item.priceRaw || 0,
    size:     item.size || 'Not specified',
    qty:      item.qty || 1
  }))
  checkoutSource = 'cart'

  // Close cart drawer first
  document.getElementById('cartDrawer')?.classList.remove('open')
  document.getElementById('cartOverlay')?.classList.remove('open')
  document.body.classList.remove('no-scroll')

  // Small delay to let cart close before opening checkout
  setTimeout(() => { openCheckoutModal() }, 150)
}

/* ─── OPEN CHECKOUT FROM MODAL BUY NOW ────────────────── */
function openCheckoutFromModal(e) {
  if (e) e.preventDefault()

  const titleEl  = document.getElementById('modalTitle')
  const priceEl  = document.getElementById('modalPrice')
  const name     = titleEl?.textContent || 'TAM Product'
  const priceStr = priceEl?.textContent?.replace(/[₦,]/g, '') || '0'
  const price    = parseInt(priceStr, 10) || 0

  const activeSize = document.querySelector('.size-btn.active')?.textContent?.replace(/EU\s*\d+/, '').trim() || ''
  const activeMode = document.querySelector('.size-mode-btn.active')?.dataset?.mode || 'standard'
  let sizeLabel = activeSize

  if (activeMode === 'measurements') {
    const fields = {
      'Bust':   document.getElementById('mBust')?.value,
      'Waist':  document.getElementById('mWaist')?.value,
      'Hips':   document.getElementById('mHips')?.value,
      'Height': document.getElementById('mHeight')?.value,
    }
    const filled = Object.entries(fields).filter(([,v]) => v).map(([k,v]) => `${k}: ${v}`)
    sizeLabel = filled.length ? 'Custom (' + filled.join(', ') + ')' : 'Custom Measurements'
  }

  checkoutItems  = [{ name, price: '₦' + price.toLocaleString('en-NG'), priceRaw: price, size: sizeLabel, qty: 1 }]
  checkoutSource = 'modal'

  document.getElementById('modalOverlay')?.classList.remove('open')
  document.getElementById('productModal')?.classList.remove('open')
  document.body.classList.remove('no-scroll')

  setTimeout(() => { openCheckoutModal() }, 150)
}

/* ─── OPEN MODAL ──────────────────────────────────────── */
function openCheckoutModal() {
  document.getElementById('checkoutPanelForm')?.classList.remove('hidden')
  document.getElementById('checkoutPanelSuccess')?.classList.add('hidden')
  document.getElementById('checkoutError')?.classList.add('hidden')
  document.getElementById('checkoutForm')?.reset()
  renderCheckoutSummary()
  prefillFromUser()
  document.getElementById('checkoutOverlay')?.classList.add('open')
  document.getElementById('checkoutModal')?.classList.add('open')
  document.body.classList.add('no-scroll')
}

function closeCheckoutModal() {
  document.getElementById('checkoutOverlay')?.classList.remove('open')
  document.getElementById('checkoutModal')?.classList.remove('open')
  document.body.classList.remove('no-scroll')
}

/* ─── ORDER SUMMARY ───────────────────────────────────── */
function renderCheckoutSummary() {
  const el = document.getElementById('checkoutSummary')
  if (!el) return
  const total = checkoutItems.reduce((sum, i) => sum + (i.priceRaw * (i.qty || 1)), 0)
  el.innerHTML = `
    <div class="checkout-items-list">
      ${checkoutItems.map((item, index) => `
        <div class="checkout-item-row">
          <div class="checkout-item-info">
            <span class="checkout-item-name">${escapeHtml(item.name)}</span>
            <span class="checkout-item-size">Size: ${escapeHtml(item.size || 'N/A')}</span>
          </div>
          <div class="checkout-item-right">
            <div class="qty-control">
              <button type="button" class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
              <span class="qty-value" id="qty-${index}">${item.qty || 1}</span>
              <button type="button" class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
            </div>
            <span class="checkout-item-price">₦${((item.priceRaw * (item.qty || 1))).toLocaleString('en-NG')}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="checkout-total-row">
      <span>Total</span>
      <strong id="checkoutTotalDisplay">₦${total.toLocaleString('en-NG')}</strong>
    </div>
    ${total < 100000
      ? '<p class="checkout-delivery-note"><i class="fas fa-truck"></i> Delivery fee applies. Free delivery on orders above ₦100,000.</p>'
      : '<p class="checkout-delivery-note free"><i class="fas fa-truck"></i> Free delivery on this order!</p>'}
  `
}

/* ─── QUANTITY ────────────────────────────────────────── */
function changeQty(index, delta) {
  if (!checkoutItems[index]) return
  const newQty = Math.max(1, (checkoutItems[index].qty || 1) + delta)
  checkoutItems[index].qty = newQty
  const qtyEl = document.getElementById(`qty-${index}`)
  if (qtyEl) qtyEl.textContent = newQty
  const total = checkoutItems.reduce((sum, i) => sum + (i.priceRaw * (i.qty || 1)), 0)
  const totalEl = document.getElementById('checkoutTotalDisplay')
  if (totalEl) totalEl.textContent = '₦' + total.toLocaleString('en-NG')
  const deliveryEl = document.querySelector('.checkout-delivery-note')
  if (deliveryEl) {
    deliveryEl.className = total < 100000 ? 'checkout-delivery-note' : 'checkout-delivery-note free'
    deliveryEl.innerHTML = total < 100000
      ? '<i class="fas fa-truck"></i> Delivery fee applies. Free delivery on orders above ₦100,000.'
      : '<i class="fas fa-truck"></i> Free delivery on this order!'
  }
}

/* ─── PRE-FILL FROM USER ──────────────────────────────── */
async function prefillFromUser() {
  if (!_db) return
  try {
    const { data: { session } } = await _db.auth.getSession()
    if (!session?.user) return
    const { data } = await _db.from('profiles').select('full_name, phone, delivery_address').eq('id', session.user.id).single()
    if (data) {
      const names = (data.full_name || '').split(' ')
      if (names[0]) document.getElementById('coFirstName').value = names[0]
      if (names[1]) document.getElementById('coLastName').value = names.slice(1).join(' ')
      if (data.phone) document.getElementById('coPhone').value = data.phone
      if (data.delivery_address) document.getElementById('coAddress').value = data.delivery_address
    }
    if (session.user.email) document.getElementById('coEmail').value = session.user.email
  } catch (e) {}
}

/* ─── GET SIZE FROM CHECKOUT FORM ─────────────────────── */
function getCheckoutSize() {
  const activeMode = document.querySelector('[data-co-mode].active')?.dataset?.coMode || 'standard'
  if (activeMode === 'standard') {
    const btn = document.querySelector('.co-size-options .size-btn.active')
    const uk  = btn?.textContent?.replace(/EU\s*\d+/, '').trim() || ''
    const eu  = btn?.dataset?.eu || ''
    return uk ? `UK ${uk}${eu ? ' (EU ' + eu + ')' : ''}` : 'Not specified'
  } else {
    const bust   = document.getElementById('coMBust')?.value
    const waist  = document.getElementById('coMWaist')?.value
    const hips   = document.getElementById('coMHips')?.value
    const height = document.getElementById('coMHeight')?.value
    const parts  = []
    if (bust)   parts.push(`Bust: ${bust}"`)
    if (waist)  parts.push(`Waist: ${waist}"`)
    if (hips)   parts.push(`Hips: ${hips}"`)
    if (height) parts.push(`Height: ${height}`)
    return parts.length ? parts.join(', ') : 'Custom (not filled)'
  }
}

/* ─── INIT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCheckout()
  initCheckoutSizeToggle()
})

/* ─── CHECKOUT SIZE TOGGLE ────────────────────────────── */
function initCheckoutSizeToggle() {
  const modeBtns = document.querySelectorAll('[data-co-mode]')
  const panelStd = document.getElementById('coPanelStandard')
  const panelMes = document.getElementById('coPanelMeasurements')

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      if (btn.dataset.coMode === 'standard') {
        panelStd?.classList.remove('hidden')
        panelMes?.classList.add('hidden')
      } else {
        panelStd?.classList.add('hidden')
        panelMes?.classList.remove('hidden')
      }
    })
  })

  document.querySelectorAll('.co-size-options .size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.co-size-options .size-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    })
  })
}

/* ─── CHECKOUT FORM ───────────────────────────────────── */
function initCheckout() {
  const overlay     = document.getElementById('checkoutOverlay')
  const closeBtn    = document.getElementById('checkoutModalClose')
  const form        = document.getElementById('checkoutForm')
  const continueBtn = document.getElementById('successContinueBtn')

  overlay?.addEventListener('click', closeCheckoutModal)
  closeBtn?.addEventListener('click', closeCheckoutModal)

  continueBtn?.addEventListener('click', () => {
    closeCheckoutModal()
    if (checkoutSource === 'cart') {
      localStorage.removeItem('tam_cart')
      if (typeof cart !== 'undefined') { cart.items = []; cart.updateUI() }
    }
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('checkoutModal')?.classList.contains('open')) {
      closeCheckoutModal()
    }
  })

  // SYNCHRONOUS submit handler — required for Paystack popup to work
  form?.addEventListener('submit', e => {
    e.preventDefault()

    const btn       = form.querySelector('button[type="submit"]')
    const firstName = document.getElementById('coFirstName').value.trim()
    const lastName  = document.getElementById('coLastName').value.trim()
    const email     = document.getElementById('coEmail').value.trim()
    const phone     = document.getElementById('coPhone').value.trim()
    const address   = document.getElementById('coAddress').value.trim()
    const notes     = document.getElementById('coNotes').value.trim()

    // Validate
    if (!firstName || !email || !phone || !address) {
      showCheckoutError('Please fill in all required fields.')
      return
    }
    if (!email.includes('@')) {
      showCheckoutError('Please enter a valid email address.')
      return
    }

    const total = checkoutItems.reduce((sum, i) => sum + (i.priceRaw * (i.qty || 1)), 0)
    if (total <= 0) {
      showCheckoutError('Could not calculate order total. Please try again.')
      return
    }

    if (typeof PaystackPop === 'undefined') {
      showCheckoutError('Payment system failed to load. Please refresh the page and try again.')
      return
    }

    const sizeInfo = getCheckoutSize()
    const ref      = 'TAM-' + Date.now() + '-' + Math.floor(Math.random() * 1000)

    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening payment...'

    // Must be called synchronously from click/submit event
    const handler = PaystackPop.setup({
      key:      PAYSTACK_PUBLIC_KEY,
      email:    email,
      amount:   total * 100,
      currency: 'NGN',
      ref:      ref,
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name',    variable_name: 'customer_name',    value: firstName + ' ' + lastName },
          { display_name: 'Phone',            variable_name: 'phone',            value: phone },
          { display_name: 'Delivery Address', variable_name: 'delivery_address', value: address },
          { display_name: 'Size',             variable_name: 'size',             value: sizeInfo },
          { display_name: 'Order Items',      variable_name: 'order_items',      value: checkoutItems.map(i => `${i.name} x${i.qty||1}`).join(', ') },
          { display_name: 'Notes',            variable_name: 'notes',            value: notes || 'None' }
        ]
      },
      callback: function(response) {
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-lock"></i> Pay with Paystack'
        // Async work after payment — order save and email
        saveOrder({ customerName: firstName + ' ' + lastName, customerEmail: email, customerPhone: phone, deliveryAddress: address, notes, sizeInfo, items: checkoutItems, total, paymentRef: response.reference })
        sendOrderEmailNotification({ customerName: firstName + ' ' + lastName, customerEmail: email, customerPhone: phone, deliveryAddress: address, notes, sizeInfo, items: checkoutItems, total, paymentRef: response.reference })
        showSuccessPanel(response.reference)
      },
      onClose: function() {
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-lock"></i> Pay with Paystack'
      }
    })

    handler.openIframe()
  })
}

/* ─── EMAIL NOTIFICATION ──────────────────────────────── */
async function sendOrderEmailNotification({ customerName, customerEmail, customerPhone, deliveryAddress, notes, sizeInfo, items, total, paymentRef }) {
  const itemsList = items.map(i => `${i.name} x${i.qty||1} — ₦${(i.priceRaw*(i.qty||1)).toLocaleString('en-NG')}`).join('\n')
  const message = `NEW ORDER — wear.TAM\n\nPayment Ref: ${paymentRef}\nTotal: ₦${total.toLocaleString('en-NG')}\n\nCUSTOMER\nName: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\n\nDELIVERY ADDRESS\n${deliveryAddress}\n\nSIZE / MEASUREMENTS\n${sizeInfo}\n\nORDER ITEMS\n${itemsList}\n\nNOTES\n${notes || 'None'}`
  try {
    await fetch('https://formspree.io/f/xzerbdbl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: 'New Order from ' + customerName, email: customerEmail, message, _subject: '🛍️ New TAM Order — ' + paymentRef })
    })
  } catch (err) { console.error('Order email failed:', err) }
}

/* ─── SAVE TO SUPABASE ────────────────────────────────── */
async function saveOrder({ customerName, customerEmail, customerPhone, deliveryAddress, notes, sizeInfo, items, total, paymentRef }) {
  if (!_db) return
  try {
    const { data: { session } } = await _db.auth.getSession()
    await _db.from('orders').insert({
      user_id:          session?.user?.id || null,
      customer_name:    customerName,
      customer_email:   customerEmail,
      customer_phone:   customerPhone,
      delivery_address: deliveryAddress + (notes ? '\nNotes: ' + notes : '') + '\nSize: ' + sizeInfo,
      items:            items,
      total:            total,
      status:           'pending',
      payment_ref:      paymentRef
    })
  } catch (err) { console.error('Order save error:', err) }
}

/* ─── SUCCESS PANEL ───────────────────────────────────── */
function showSuccessPanel(ref) {
  document.getElementById('checkoutPanelForm')?.classList.add('hidden')
  document.getElementById('checkoutPanelSuccess')?.classList.remove('hidden')
  const refEl = document.getElementById('successOrderRef')
  if (refEl) refEl.innerHTML = `<span>Order ref:</span> <strong>${escapeHtml(ref)}</strong>`
  localStorage.removeItem('tam_cart')
  if (typeof cart !== 'undefined') { cart.items = []; cart.updateUI() }
}

/* ─── HELPERS ─────────────────────────────────────────── */
function showCheckoutError(msg) {
  const el = document.getElementById('checkoutError')
  if (!el) return
  el.textContent = msg
  el.classList.remove('hidden')
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(String(str || '')))
  return div.innerHTML
}
