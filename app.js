/* =============================================
   BUSCLOUD — APP.JS
   Full interactivity: booking, tracking,
   dashboard, QR, animations
============================================= */

// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    initAnimations();
  }, 1200);
});

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 30);
  updateActiveNavLink();
});

function updateActiveNavLink() {
  const sections = ['home','book','passes','track','dashboard'];
  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

// Mobile menu toggle
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});

// ===== SMOOTH SCROLL =====
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== QR CODE GENERATOR (pixel grid style) =====
function generateQR(containerId, cols = 10) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const total = cols * cols;
  // Create a pseudo-random but reproducible pattern
  const seed = containerId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const fixed = [0,1,2,3,4,5,6,7,8,9,10,19,20,29,30,39,40,49,50,59,60,69,70,79,80,89,90,91,92,93,94,95,96,97,98,99];
  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    const rand = Math.sin(seed * (i + 1)) > 0.1 || fixed.includes(i);
    if (rand) cell.style.background = 'var(--teal)';
    container.appendChild(cell);
  }
}

function generateSmallQR(containerId, cols = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const seed = containerId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 0; i < cols * cols; i++) {
    const cell = document.createElement('div');
    if (Math.sin(seed * (i + 1)) > 0) cell.style.background = 'var(--teal)';
    container.appendChild(cell);
  }
}

// ===== SEAT MAP =====
function generateSeatMap() {
  const map = document.getElementById('seatMap');
  if (!map) return;
  map.innerHTML = '';
  const bookedSeats = [3, 7, 12, 15, 18, 22, 27, 30];
  for (let i = 0; i < 40; i++) {
    const seat = document.createElement('div');
    seat.className = 'seat ' + (bookedSeats.includes(i) ? 'booked' : 'available');
    seat.title = `Seat ${i + 1}`;
    if (!bookedSeats.includes(i)) {
      seat.addEventListener('click', () => {
        seat.classList.toggle('selected');
        seat.classList.toggle('available', !seat.classList.contains('selected'));
      });
    }
    map.appendChild(seat);
  }
}

// ===== CHART BARS =====
function generateChart() {
  const bars = document.getElementById('chartBars');
  if (!bars) return;
  const rides = [4, 6, 3, 8, 5, 2, 7];
  const max = Math.max(...rides);
  bars.innerHTML = '';
  rides.forEach(r => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = (r / max * 100) + '%';
    bar.title = `${r} rides`;
    bars.appendChild(bar);
  });
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = target === 98 ? '%' : '+';
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString() + suffix;
      if (current >= target) clearInterval(timer);
    }, 25);
  });
}

function animateDashStats() {
  animateStat('ridesCount', 34, '', '');
  animateStat('spentCount', 2340, '₹', '');
  animateStat('savedCount', 460, '₹', '');
}
function animateStat(id, target, prefix, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (current >= target) clearInterval(timer);
  }, 30);
}

// ===== INIT ANIMATIONS =====
function initAnimations() {
  generateQR('heroQr', 10);
  generateSmallQR('dashQr1', 6);
  generateSmallQR('dashQr2', 6);
  generateSeatMap();
  generateChart();
  animateCounters();
  animateDashStats();
  setDefaultDates();
}

// ===== DEFAULT DATES =====
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = ['journeyDate', 'passStartDate'];
  dateInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });
  const timeEl = document.getElementById('journeyTime');
  if (timeEl) {
    const now = new Date();
    timeEl.value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  }
}

// ===== TABS =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tabId)?.classList.add('active');
  });
});

// ===== FARE CALCULATION =====
let passengerQty = 1;

function changeQty(delta) {
  passengerQty = Math.max(1, Math.min(10, passengerQty + delta));
  document.getElementById('passQty').textContent = passengerQty;
  updateFare();
}

function updateFare() {
  const baseFare = parseInt(document.getElementById('busClass')?.value || 40);
  const gst = Math.round(baseFare * 0.05);
  const total = (baseFare + gst) * passengerQty;
  setText('baseFare', '₹' + baseFare);
  setText('farePassengers', '× ' + passengerQty);
  setText('fareGst', '₹' + (gst * passengerQty));
  setText('fareTotal', '₹' + total);
}

function updatePassFare() {
  const prices = { day: 120, week: 650, month: 1800 };
  const selected = document.querySelector('input[name="passType"]:checked')?.value || 'day';
  setText('passFareTotal', '₹' + prices[selected].toLocaleString());
}

function updateGroupFare() {
  const size = parseInt(document.getElementById('groupSize')?.value || 10);
  document.getElementById('gSize').textContent = size;
  document.getElementById('groupTotal').textContent = '₹' + (size * 35).toLocaleString();
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ===== SWAP LOCATIONS =====
function swapLocations() {
  const from = document.getElementById('fromCity');
  const to = document.getElementById('toCity');
  if (from && to) {
    [from.value, to.value] = [to.value, from.value];
    updateFare();
    showToast('Locations swapped!', 'success');
  }
}

// ===== PAYMENT FLOW =====
let currentBookingType = '';

function proceedToPayment(type) {
  currentBookingType = type;
  const summaries = {
    single: buildSingleSummary(),
    pass: buildPassSummary(),
    group: buildGroupSummary()
  };
  document.getElementById('paymentSummary').innerHTML = summaries[type];
  document.getElementById('payBtn').textContent = '🔒 Pay ' + getTotal(type);
  showModal('paymentModal');
}

function buildSingleSummary() {
  const from = document.getElementById('fromCity')?.value || 'Select Origin';
  const to = document.getElementById('toCity')?.value || 'Select Destination';
  const total = document.getElementById('fareTotal')?.textContent || '₹42';
  return `<strong>${from} → ${to}</strong><br/><span style="color:var(--muted)">Date: ${document.getElementById('journeyDate')?.value} &nbsp;|&nbsp; ${passengerQty} passenger(s)</span><br/><strong style="color:var(--teal);font-size:1.1rem">${total}</strong>`;
}

function buildPassSummary() {
  const type = document.querySelector('input[name="passType"]:checked')?.value || 'day';
  const labels = { day: 'Day Pass', week: 'Weekly Pass', month: 'Monthly Pass' };
  const total = document.getElementById('passFareTotal')?.textContent || '₹120';
  return `<strong>${labels[type]}</strong><br/><span style="color:var(--muted)">All City Routes — Unlimited Rides</span><br/><strong style="color:var(--teal);font-size:1.1rem">${total}</strong>`;
}

function buildGroupSummary() {
  const size = document.getElementById('groupSize')?.value || 10;
  const total = document.getElementById('groupTotal')?.textContent || '₹350';
  return `<strong>Group Booking — ${size} persons</strong><br/><span style="color:var(--muted)">₹35/person group rate</span><br/><strong style="color:var(--teal);font-size:1.1rem">${total}</strong>`;
}

function getTotal(type) {
  const map = { single: 'fareTotal', pass: 'passFareTotal', group: 'groupTotal' };
  return document.getElementById(map[type])?.textContent || '₹0';
}

// ===== SELECT PAYMENT METHOD =====
function selectPM(btn) {
  document.querySelectorAll('.pm').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== FORMAT CARD =====
function formatCard(input) {
  let v = input.value.replace(/\D/g,'');
  v = v.match(/.{1,4}/g)?.join(' ') || v;
  input.value = v;
}

// ===== PROCESS PAYMENT =====
function processPayment() {
  const btn = document.getElementById('payBtn');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing…';
  btn.disabled = true;
  setTimeout(() => {
    hideModal('paymentModal');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-lock"></i> Pay Now';
    showTicket();
  }, 2200);
}

// ===== SHOW TICKET =====
function showTicket() {
  const pnr = 'BC-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
  document.getElementById('ticketBody').innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="color:var(--muted);font-size:0.82rem">PNR / Ticket ID</span>
      <strong style="color:var(--teal)">${pnr}</strong>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="color:var(--muted);font-size:0.82rem">Status</span>
      <span style="color:var(--green);font-weight:700">✓ Confirmed</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="color:var(--muted);font-size:0.82rem">Cloud Backup</span>
      <span style="color:var(--teal);font-weight:700">✓ Synced</span>
    </div>
    <div style="text-align:center;margin-top:12px">
      <div id="ticketQr" style="width:80px;height:80px;display:grid;grid-template-columns:repeat(8,1fr);gap:1.5px;margin:0 auto"></div>
      <small style="color:var(--muted);display:block;margin-top:6px">Scan to validate at gate</small>
    </div>
  `;
  showModal('ticketModal');
  setTimeout(() => {
    const qr = document.getElementById('ticketQr');
    if (qr) {
      for (let i = 0; i < 64; i++) {
        const c = document.createElement('div');
        if (Math.sin(pnr.charCodeAt(i % pnr.length) * (i+1)) > 0) c.style.background = 'var(--teal)';
        c.style.borderRadius = '1px';
        qr.appendChild(c);
      }
    }
  }, 100);
  addBookingHistory(pnr);
  showToast('🎉 Ticket issued & synced to cloud!', 'success');
}

function addBookingHistory(pnr) {
  const history = document.getElementById('bookingHistory');
  if (!history) return;
  const item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `
    <div class="hi-dot green" style="box-shadow:0 0 8px var(--green)"></div>
    <div><strong>New Booking — ${pnr}</strong><small>Just now — Confirmed</small></div>
    <span class="hi-badge">Active</span>
  `;
  history.prepend(item);
}

function downloadTicket() {
  showToast('📄 Ticket downloaded to your device!', 'success');
}
function shareTicket() {
  showToast('🔗 Ticket link copied to clipboard!', 'success');
}

// ===== SELECT PLAN =====
function selectPlan(name, price) {
  showToast(`✅ ${name} selected — ₹${price.toLocaleString()}`, 'success');
  setTimeout(() => scrollTo('book'), 600);
}

// ===== BUS TRACKING =====
function trackBus() {
  const id = document.getElementById('trackId')?.value;
  const result = document.getElementById('trackResult');
  if (!result) return;
  if (!id) { showToast('Please enter a ticket ID', 'error'); return; }
  result.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><i class="fa-solid fa-spinner fa-spin" style="color:var(--teal)"></i> Fetching live data…</div>`;
  result.classList.add('show');
  setTimeout(() => {
    const stops = ['Central Station', 'University Campus', 'Tech Park', 'Airport Terminal'];
    const current = stops[Math.floor(Math.random() * stops.length)];
    const eta = Math.floor(4 + Math.random() * 12);
    result.innerHTML = `
      <div style="margin-bottom:8px"><strong style="color:var(--teal)">Route 12 — ${document.getElementById('routeSelect')?.value.split('—')[0]}</strong></div>
      <div style="color:var(--muted);font-size:0.83rem;margin-bottom:4px">🚌 Bus currently at: <strong style="color:var(--text)">${current}</strong></div>
      <div style="color:var(--muted);font-size:0.83rem;margin-bottom:4px">⏱ ETA to your stop: <strong style="color:var(--amber)">${eta} min</strong></div>
      <div style="color:var(--muted);font-size:0.83rem;margin-bottom:4px">✅ Ticket: <strong style="color:var(--green)">${id} — Valid</strong></div>
      <div style="color:var(--muted);font-size:0.83rem">🛡 Tamper check: <strong style="color:var(--green)">Passed</strong></div>
    `;
    animateBus();
  }, 1800);
}

function animateBus() {
  const bus = document.getElementById('busIcon');
  if (!bus) return;
  bus.style.transition = 'left 5s linear';
  bus.style.left = '85%';
  setTimeout(() => {
    bus.style.transition = 'none';
    bus.style.left = '10%';
    setTimeout(() => {
      bus.style.transition = 'left 5s linear';
    }, 50);
  }, 5100);
}

// ===== MODALS =====
function showModal(id) { document.getElementById(id)?.classList.add('open'); }
function hideModal(id) { document.getElementById(id)?.classList.remove('open'); }
function closeModalOutside(e, id) {
  if (e.target.id === id) hideModal(id);
}
function switchModal(hideId, showId) {
  hideModal(hideId);
  setTimeout(() => showModal(showId), 200);
}

// ===== FAKE AUTH =====
function fakeLogin() {
  hideModal('loginModal');
  showToast('✅ Signed in successfully!', 'success');
}
function fakeRegister() {
  hideModal('registerModal');
  showToast('🎉 Account created! Welcome to BusCloud.', 'success');
}

// ===== TOAST =====
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

// ===== INTERSECTION OBSERVER for animations =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .plan-card, .dash-card').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// ===== INIT ON DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  updateFare();
  updatePassFare();
  updateGroupFare();
});
