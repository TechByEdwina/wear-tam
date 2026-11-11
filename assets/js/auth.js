/* ============================================================
   wear.TAM — Authentication (Supabase)
   Handles: signup, login, logout, session restore, nav update
============================================================ */

'use strict';

// Init Supabase client
const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/* ─── AUTH STATE ─────────────────────────────────────── */
let currentUser = null

async function initAuth() {
  // Restore existing session
  const { data: { session } } = await db.auth.getSession()
  if (session?.user) {
    currentUser = session.user
    onSignedIn(session.user)
  }

  // Listen for auth changes (login, logout, token refresh)
  db.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      currentUser = session.user
      onSignedIn(session.user)
    } else {
      currentUser = null
      onSignedOut()
    }
  })
}

/* ─── SIGN UP ─────────────────────────────────────────── */
async function signUp(fullName, email, password) {
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })

  if (error) throw error
  return data
}

/* ─── SIGN IN ─────────────────────────────────────────── */
async function signIn(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/* ─── SIGN OUT ────────────────────────────────────────── */
async function signOut() {
  const { error } = await db.auth.signOut()
  if (error) throw error
}

/* ─── PASSWORD RESET ──────────────────────────────────── */
async function sendPasswordReset(email) {
  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://weartam.netlify.app/account.html'
  })
  if (error) throw error
}

/* ─── UI CALLBACKS ────────────────────────────────────── */
function onSignedIn(user) {
  updateNavForUser(user)
  // Pre-fill measurements if modal is open
  loadUserMeasurements()
  // Welcome back toast — only on landing page, only once per session
  if (!sessionStorage.getItem('tam_welcomed') && window.location.pathname.includes('index')) {
    const name = user.user_metadata?.full_name?.split(' ')[0] || ''
    setTimeout(() => {
      showToast('Welcome back' + (name ? ', ' + name : '') + ' 👋')
      sessionStorage.setItem('tam_welcomed', '1')
    }, 1500)
  }
}

function onSignedOut() {
  updateNavForGuest()
  currentUser = null
}

/* ─── NAV UPDATE ──────────────────────────────────────── */
function updateNavForUser(user) {
  const authBtn   = document.getElementById('authNavBtn')
  const authLabel = document.getElementById('authNavLabel')
  if (!authBtn) return

  const name = user.user_metadata?.full_name?.split(' ')[0] || 'Account'
  if (authLabel) authLabel.textContent = 'Hi, ' + name
  authBtn.setAttribute('data-state', 'signed-in')
  authBtn.title = 'My Account'

  // Gold dot indicator
  authBtn.classList.add('signed-in')
}

function updateNavForGuest() {
  const authBtn   = document.getElementById('authNavBtn')
  const authLabel = document.getElementById('authNavLabel')
  if (!authBtn) return

  if (authLabel) authLabel.textContent = 'Log In'
  authBtn.setAttribute('data-state', 'signed-out')
  authBtn.title = 'Log In'
  authBtn.classList.remove('signed-in')
}

/* ─── MEASUREMENTS ────────────────────────────────────── */
async function loadUserMeasurements() {
  if (!currentUser) return

  const { data, error } = await db
    .from('measurements')
    .select('*')
    .eq('user_id', currentUser.id)
    .single()

  if (error || !data) return

  // Pre-fill measurement fields if they exist in the DOM
  const fields = {
    mBust: data.bust, mWaist: data.waist, mHips: data.hips,
    mHeight: data.height, mShoulder: data.shoulder_width,
    mSleeve: data.sleeve_length, mThigh: data.thigh,
    mInseam: data.inseam, mBackLength: data.back_length, mNeck: data.neck
  }

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id)
    if (el && value) el.value = value
  })
}

async function saveUserMeasurements(measurements) {
  if (!currentUser) return

  const { error } = await db
    .from('measurements')
    .upsert({
      user_id: currentUser.id,
      ...measurements,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (error) throw error
}

/* ─── AUTH MODAL ──────────────────────────────────────── */
function initAuthModal() {
  const overlay    = document.getElementById('authOverlay')
  const modal      = document.getElementById('authModal')
  const closeBtn   = document.getElementById('authModalClose')
  const authNavBtn = document.getElementById('authNavBtn')

  const panelLogin  = document.getElementById('authPanelLogin')
  const panelSignup = document.getElementById('authPanelSignup')
  const panelReset  = document.getElementById('authPanelReset')

  const switchToSignup = document.querySelectorAll('[data-switch="signup"]')
  const switchToLogin  = document.querySelectorAll('[data-switch="login"]')
  const switchToReset  = document.querySelectorAll('[data-switch="reset"]')

  const loginForm  = document.getElementById('loginForm')
  const signupForm = document.getElementById('signupForm')
  const resetForm  = document.getElementById('resetForm')

  function openModal(panel = 'login') {
    overlay?.classList.add('open')
    modal?.classList.add('open')
    document.body.classList.add('no-scroll')
    showPanel(panel)
  }

  function closeModal() {
    overlay?.classList.remove('open')
    modal?.classList.remove('open')
    document.body.classList.remove('no-scroll')
    clearForms()
  }

  function showPanel(name) {
    [panelLogin, panelSignup, panelReset,
     document.getElementById('authPanelConfirm')].forEach(p => p?.classList.add('hidden'))
    if (name === 'login')   panelLogin?.classList.remove('hidden')
    if (name === 'signup')  panelSignup?.classList.remove('hidden')
    if (name === 'reset')   panelReset?.classList.remove('hidden')
    if (name === 'confirm') document.getElementById('authPanelConfirm')?.classList.remove('hidden')
  }

  function clearForms() {
    loginForm?.reset()
    signupForm?.reset()
    resetForm?.reset()
    clearAuthError('loginError')
    clearAuthError('signupError')
    clearAuthError('resetMsg')
  }

  // Nav button: open modal or go to account
  // First-time visitors see Sign Up first, returning users see Log In
  authNavBtn?.addEventListener('click', () => {
    if (authNavBtn.dataset.state === 'signed-in') {
      window.location.href = 'account.html'
    } else {
      // If user has visited before (has localStorage flag), show login — otherwise signup
      const returning = localStorage.getItem('tam_returning')
      openModal(returning ? 'login' : 'signup')
    }
  })

  // Panel switches
  switchToSignup.forEach(el => el.addEventListener('click', () => showPanel('signup')))
  switchToLogin.forEach(el  => el.addEventListener('click', () => showPanel('login')))
  switchToReset.forEach(el  => el.addEventListener('click', () => showPanel('reset')))

  // Close
  closeBtn?.addEventListener('click', closeModal)
  overlay?.addEventListener('click', closeModal)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal()
  })

  // LOGIN FORM
  loginForm?.addEventListener('submit', async e => {
    e.preventDefault()
    const btn = loginForm.querySelector('button[type="submit"]')
    const email    = loginForm.querySelector('#loginEmail').value.trim()
    const password = loginForm.querySelector('#loginPassword').value

    setAuthLoading(btn, true)
    clearAuthError('loginError')

    try {
      await signIn(email, password)
      localStorage.setItem('tam_returning', '1')
      showToast('Welcome back to TAM!')
      closeModal()
    } catch (err) {
      showAuthError('loginError', friendlyError(err.message))
    } finally {
      setAuthLoading(btn, false)
    }
  })

  // SIGNUP FORM
  signupForm?.addEventListener('submit', async e => {
    e.preventDefault()
    const btn      = signupForm.querySelector('button[type="submit"]')
    const fullName = signupForm.querySelector('#signupName').value.trim()
    const email    = signupForm.querySelector('#signupEmail').value.trim()
    const password = signupForm.querySelector('#signupPassword').value
    const confirm  = signupForm.querySelector('#signupConfirm').value

    if (password !== confirm) {
      showAuthError('signupError', 'Passwords do not match.')
      return
    }

    if (password.length < 6) {
      showAuthError('signupError', 'Password must be at least 6 characters.')
      return
    }

    setAuthLoading(btn, true)
    clearAuthError('signupError')

    try {
      await signUp(fullName, email, password)
      // Show full confirmation panel instead of inline banner
      showPanel('confirm')
      signupForm.reset()
    } catch (err) {
      showAuthError('signupError', friendlyError(err.message))
    } finally {
      setAuthLoading(btn, false)
    }
  })

  // RESET FORM
  resetForm?.addEventListener('submit', async e => {
    e.preventDefault()
    const btn   = resetForm.querySelector('button[type="submit"]')
    const email = resetForm.querySelector('#resetEmail').value.trim()

    setAuthLoading(btn, true)
    clearAuthError('resetMsg')

    try {
      await sendPasswordReset(email)
      showAuthError('resetMsg', 'Reset link sent. Check your inbox.', 'success')
    } catch (err) {
      showAuthError('resetMsg', friendlyError(err.message))
    } finally {
      setAuthLoading(btn, false)
    }
  })

  // Resend confirmation email
  document.getElementById('resendConfirm')?.addEventListener('click', async () => {
    const email = document.getElementById('signupEmail')?.value?.trim()
    if (!email) {
      showAuthError('resendMsg', 'Please go back and enter your email first.', 'error')
      return
    }
    try {
      await db.auth.resend({ type: 'signup', email })
      showAuthError('resendMsg', 'Confirmation email resent. Check your inbox.', 'success')
    } catch (err) {
      showAuthError('resendMsg', 'Could not resend. Please try signing up again.', 'error')
    }
  })

  // Save measurements button in modal
  document.getElementById('saveMeasurementsBtn')?.addEventListener('click', async () => {
    if (!currentUser) {
      openModal('login')
      showToast('Log in to save your measurements.')
      return
    }

    const measurements = {
      bust:           parseFloat(document.getElementById('mBust')?.value) || null,
      waist:          parseFloat(document.getElementById('mWaist')?.value) || null,
      hips:           parseFloat(document.getElementById('mHips')?.value) || null,
      height:         parseFloat(document.getElementById('mHeight')?.value) || null,
      shoulder_width: parseFloat(document.getElementById('mShoulder')?.value) || null,
      sleeve_length:  parseFloat(document.getElementById('mSleeve')?.value) || null,
      thigh:          parseFloat(document.getElementById('mThigh')?.value) || null,
      inseam:         parseFloat(document.getElementById('mInseam')?.value) || null,
      back_length:    parseFloat(document.getElementById('mBackLength')?.value) || null,
      neck:           parseFloat(document.getElementById('mNeck')?.value) || null,
    }

    try {
      await saveUserMeasurements(measurements)
      showToast('Measurements saved to your account ✓')
    } catch (err) {
      showToast('Could not save measurements. Please try again.')
    }
  })
}

/* ─── HELPERS ─────────────────────────────────────────── */
function setAuthLoading(btn, loading) {
  if (!btn) return
  btn.disabled = loading
  btn.dataset.originalText = btn.dataset.originalText || btn.textContent
  btn.textContent = loading ? 'Please wait...' : btn.dataset.originalText
}

function showAuthError(id, msg, type = 'error') {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = msg
  el.className = 'auth-message ' + type
  el.style.display = 'block'
}

function clearAuthError(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = ''
  el.style.display = 'none'
}

function friendlyError(msg) {
  if (msg.includes('Invalid login'))      return 'Incorrect email or password.'
  if (msg.includes('already registered')) return 'An account with this email already exists.'
  if (msg.includes('Password should'))    return 'Password must be at least 6 characters.'
  if (msg.includes('Unable to validate')) return 'Please enter a valid email address.'
  return msg
}

/* ─── INIT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAuth()
  initAuthModal()
  initPasswordToggles()
})

/* ─── PASSWORD VISIBILITY TOGGLES ───────────────────────── */
function initPasswordToggles() {
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target)
      if (!input) return
      const isPassword = input.type === 'password'
      input.type = isPassword ? 'text' : 'password'
      btn.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
    })
  })
}
