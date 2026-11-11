/* ============================================================
   wear.TAM — Account Page Logic
============================================================ */

'use strict'

const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let currentUser = null

/* ─── INIT ────────────────────────────────────────────── */
async function initAccountPage() {
  const { data: { session } } = await db.auth.getSession()

  if (!session?.user) {
    // Not logged in — redirect to home
    window.location.href = 'index.html'
    return
  }

  currentUser = session.user
  showAccountContent()
  loadProfile()
  loadMeasurements()
  loadOrders()
  updateNavUser()
}

function showAccountContent() {
  document.getElementById('accountLoading')?.classList.add('hidden')
  document.getElementById('accountContent')?.classList.remove('hidden')

  const email = currentUser.email || ''
  document.getElementById('accountUserEmail').textContent = email

  // Handle auth state changes (e.g. logout from another tab)
  db.auth.onAuthStateChange((_event, session) => {
    if (!session) window.location.href = 'index.html'
  })
}

function updateNavUser() {
  const btn   = document.getElementById('authNavBtn')
  const label = document.getElementById('authNavLabel')
  if (!btn) return
  const name = currentUser.user_metadata?.full_name?.split(' ')[0] || 'Account'
  if (label) label.textContent = 'Hi, ' + name
  btn.setAttribute('data-state', 'signed-in')
  btn.classList.add('signed-in')
}

/* ─── TABS ────────────────────────────────────────────── */
function initTabs() {
  const navItems = document.querySelectorAll('.account-nav-item[data-tab]')
  const tabs     = document.querySelectorAll('.account-tab')

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'))
      tabs.forEach(t => t.classList.add('hidden'))

      item.classList.add('active')
      document.getElementById('tab' + capitalise(item.dataset.tab))?.classList.remove('hidden')
    })
  })
}

/* ─── PROFILE PHOTO ───────────────────────────────────── */
async function initAvatarUpload() {
  const input   = document.getElementById('avatarInput')
  const preview = document.getElementById('avatarPreview')
  const icon    = document.getElementById('avatarIcon')

  // Load existing avatar
  const avatarUrl = currentUser.user_metadata?.avatar_url
  if (avatarUrl) {
    preview.src = avatarUrl
    preview.style.display = 'block'
    if (icon) icon.style.display = 'none'
  }

  input?.addEventListener('change', async e => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB.')
      return
    }

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = ev => {
      preview.src = ev.target.result
      preview.style.display = 'block'
      if (icon) icon.style.display = 'none'
    }
    reader.readAsDataURL(file)

    // Upload to Supabase Storage
    try {
      const ext      = file.name.split('.').pop()
      const filePath = `avatars/${currentUser.id}.${ext}`

      const { error: uploadError } = await db.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = db.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      // Save URL to user metadata
      await db.auth.updateUser({ data: { avatar_url: publicUrl } })
      showToast('Profile photo updated ✓')
    } catch (err) {
      showToast('Could not upload photo. Please try again.')
    }
  })
}


async function loadProfile() {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single()

  const name = data?.full_name || currentUser.user_metadata?.full_name || ''

  document.getElementById('accountUserName').textContent = name || 'My Account'
  document.getElementById('profileFullName').value   = name
  document.getElementById('profileEmail').value      = currentUser.email || ''
  document.getElementById('profilePhone').value      = data?.phone || ''
  document.getElementById('profileAddress').value    = data?.delivery_address || ''
}

function initProfileForm() {
  const form = document.getElementById('profileForm')
  if (!form) return

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const btn = form.querySelector('button[type="submit"]')
    setLoading(btn, true)
    clearMsg('profileMsg')

    const fullName = document.getElementById('profileFullName').value.trim()
    const phone    = document.getElementById('profilePhone').value.trim()
    const address  = document.getElementById('profileAddress').value.trim()

    try {
      // Update Supabase Auth metadata
      await db.auth.updateUser({ data: { full_name: fullName } })

      // Upsert profile table
      const { error } = await db.from('profiles').upsert({
        id: currentUser.id,
        full_name: fullName,
        phone,
        delivery_address: address
      })

      if (error) throw error

      document.getElementById('accountUserName').textContent = fullName || 'My Account'
      showMsg('profileMsg', 'Profile updated successfully.', 'success')
    } catch (err) {
      showMsg('profileMsg', 'Could not save profile. Please try again.', 'error')
    } finally {
      setLoading(btn, false)
    }
  })
}

function initPasswordForm() {
  const form = document.getElementById('passwordForm')
  if (!form) return

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const btn      = form.querySelector('button[type="submit"]')
    const newPass  = document.getElementById('newPassword').value
    const confirm  = document.getElementById('confirmPassword').value

    if (!newPass) return

    if (newPass !== confirm) {
      showMsg('passwordMsg', 'Passwords do not match.', 'error')
      return
    }

    if (newPass.length < 6) {
      showMsg('passwordMsg', 'Password must be at least 6 characters.', 'error')
      return
    }

    setLoading(btn, true)
    clearMsg('passwordMsg')

    try {
      const { error } = await db.auth.updateUser({ password: newPass })
      if (error) throw error
      showMsg('passwordMsg', 'Password updated successfully.', 'success')
      form.reset()
    } catch (err) {
      showMsg('passwordMsg', 'Could not update password. Please try again.', 'error')
    } finally {
      setLoading(btn, false)
    }
  })
}

/* ─── MEASUREMENTS ────────────────────────────────────── */
async function loadMeasurements() {
  const { data, error } = await db
    .from('measurements')
    .select('*')
    .eq('user_id', currentUser.id)
    .single()

  if (error || !data) return

  const map = {
    aBust: 'bust', aWaist: 'waist', aHips: 'hips',
    aHeight: 'height', aShoulder: 'shoulder_width',
    aSleeve: 'sleeve_length', aThigh: 'thigh',
    aInseam: 'inseam', aBackLength: 'back_length', aNeck: 'neck'
  }

  Object.entries(map).forEach(([elId, field]) => {
    const el = document.getElementById(elId)
    if (el && data[field]) el.value = data[field]
  })
}

function initMeasurementsForm() {
  const form = document.getElementById('accountMeasurementsForm')
  if (!form) return

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const btn = form.querySelector('button[type="submit"]')
    setLoading(btn, true)
    clearMsg('measurementsMsg')

    const payload = {
      user_id:        currentUser.id,
      bust:           parseFloatOrNull('aBust'),
      waist:          parseFloatOrNull('aWaist'),
      hips:           parseFloatOrNull('aHips'),
      height:         parseFloatOrNull('aHeight'),
      shoulder_width: parseFloatOrNull('aShoulder'),
      sleeve_length:  parseFloatOrNull('aSleeve'),
      thigh:          parseFloatOrNull('aThigh'),
      inseam:         parseFloatOrNull('aInseam'),
      back_length:    parseFloatOrNull('aBackLength'),
      neck:           parseFloatOrNull('aNeck'),
      updated_at:     new Date().toISOString()
    }

    try {
      const { error } = await db
        .from('measurements')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error
      showMsg('measurementsMsg', 'Measurements saved successfully.', 'success')
    } catch (err) {
      showMsg('measurementsMsg', 'Could not save measurements. Please try again.', 'error')
    } finally {
      setLoading(btn, false)
    }
  })
}

/* ─── ORDERS ──────────────────────────────────────────── */
async function loadOrders() {
  const { data, error } = await db
    .from('orders')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })

  const list  = document.getElementById('ordersList')
  const empty = document.getElementById('ordersEmpty')

  if (error || !data || data.length === 0) {
    if (empty) empty.style.display = ''
    return
  }

  if (empty) empty.style.display = 'none'

  data.forEach(order => {
    const card = document.createElement('div')
    card.className = 'order-card'

    const items = Array.isArray(order.items)
      ? order.items.map(i => i.name).join(', ')
      : 'Order items'

    const date = new Date(order.created_at).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    const shortId = order.id.split('-')[0].toUpperCase()

    card.innerHTML = `
      <div class="order-card-header">
        <span class="order-id">Order #${escapeHtml(shortId)}</span>
        <span class="order-date">${escapeHtml(date)}</span>
        <span class="order-status ${escapeHtml(order.status)}">${escapeHtml(order.status)}</span>
      </div>
      <p class="order-items">${escapeHtml(items)}</p>
      <p class="order-total">Total: ₦${Number(order.total).toLocaleString('en-NG')}</p>
    `
    list.appendChild(card)
  })
}

/* ─── SIGN OUT ────────────────────────────────────────── */
function initSignOut() {
  document.getElementById('signOutBtn')?.addEventListener('click', async () => {
    await db.auth.signOut()
    window.location.href = 'index.html'
  })
}

/* ─── HAMBURGER (mobile nav) ──────────────────────────── */
function initMobileNav() {
  const hamburger  = document.getElementById('hamburger')
  const mobileMenu = document.getElementById('mobileMenu')

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.toggle('open')
    hamburger.classList.toggle('open', isOpen)
  })

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.remove('open')
      hamburger?.classList.remove('open')
    })
  })
}

/* ─── HELPERS ─────────────────────────────────────────── */
function showMsg(id, text, type) {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = text
  el.className = 'account-message ' + type
  el.classList.remove('hidden')
  setTimeout(() => el.classList.add('hidden'), 5000)
}

function clearMsg(id) {
  const el = document.getElementById(id)
  if (el) el.classList.add('hidden')
}

function setLoading(btn, loading) {
  if (!btn) return
  btn.disabled = loading
  btn.dataset.orig = btn.dataset.orig || btn.textContent
  btn.textContent = loading ? 'Saving...' : btn.dataset.orig
}

function parseFloatOrNull(id) {
  const val = document.getElementById(id)?.value
  return val ? parseFloat(val) : null
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(String(str)))
  return div.innerHTML
}

/* ─── TOAST ───────────────────────────────────────────── */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast')
  if (!toast) return
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(toast._t)
  toast._t = setTimeout(() => toast.classList.remove('show'), duration)
}

/* ─── BOOT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAccountPage().then(() => {
    initTabs()
    initAvatarUpload()
    initProfileForm()
    initPasswordForm()
    initMeasurementsForm()
    initSignOut()
    initMobileNav()
  })
})
