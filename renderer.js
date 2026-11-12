// Sidebar active pill switching
const navButtons = document.querySelectorAll('.nav-item');

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    navButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Format local Turkish date in header
const headerDateEl = document.getElementById('headerDate');
if (headerDateEl) {
  const formatted = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());
  const parts = formatted.split(' ');
  // Normalize "12 Kasım Perşembe" -> "Perşembe, 12 Kasım"
  if (parts.length >= 3) {
    const weekday = parts.pop();
    headerDateEl.textContent = `${weekday}, ${parts.join(' ')}`;
  } else {
    headerDateEl.textContent = formatted;
  }
}

// Search bar keyboard shortcut (Ctrl+K / Cmd+K) + Search Popover
const searchInput = document.getElementById('searchInput');
const searchPopover = document.getElementById('searchPopover');
const searchSuggestView = document.getElementById('searchSuggestView');
const searchAnswerView = document.getElementById('searchAnswerView');
const answerText = document.getElementById('answerText');
const answerRows = document.getElementById('answerRows');
const answerCtaBtn = document.getElementById('answerCtaBtn');

const SEARCH_ANSWERS = {
  blocked: {
    text: 'Şu anda iki konu bekliyor. Birini hemen ilerletebilirim.',
    rows: [
      { label: 'Tedarikçi sözleşmesi', tag: '• Engellendi', cls: 'tag-review' },
      { label: 'Yeni işe alım teklifi', tag: '• Onay gerekiyor', cls: 'tag-approval' }
    ],
    cta: 'Hukuk Asistanına Sor'
  },
  yesterday: {
    text: 'Dün iki kurumsal anlaşma kapandı ve haftalık hedef %108’e ulaştı.',
    rows: [
      { label: 'Kurumsal satış kapanışı', tag: '• Tamamlandı', cls: 'tag-done' },
      { label: 'Kuzey Rüzgarı taslağı', tag: '• İncelemede', cls: 'tag-working' }
    ],
    cta: 'Günlük Raporu Aç'
  },
  cash: {
    text: 'Gelecek ay tahmini nakit akışı +$42.500 net pozitif ve pist 14 ay seviyesinde.',
    rows: [
      { label: 'Beklenen tahsilatlar', tag: '• +$84.000', cls: 'tag-done' },
      { label: 'Sabit gider çıkışı', tag: '• -$41.500', cls: 'tag-review' }
    ],
    cta: 'Finans Asistanını Aç'
  }
};

function openSearchPopover(showSuggest = true) {
  if (!searchPopover) return;
  searchPopover.hidden = false;
  if (showSuggest && searchSuggestView && searchAnswerView) {
    searchSuggestView.hidden = false;
    searchAnswerView.hidden = true;
  }
}

function closeSearchPopover() {
  if (!searchPopover) return;
  searchPopover.hidden = true;
}

function showSearchAnswer(key, customQuery = '') {
  const data = SEARCH_ANSWERS[key] || {
    text: `"${customQuery}" hakkında tüm metrikler normal aralıkta; 3 bekleyen onay mevcut.`,
    rows: [
      { label: '4. Çeyrek pazarlama bütçesi', tag: '• Onay bekliyor', cls: 'tag-approval' }
    ],
    cta: 'Onayları İncele'
  };

  if (answerText) answerText.textContent = data.text;
  if (answerRows) {
    answerRows.innerHTML = data.rows
      .map(
        (r) =>
          `<div class="answer-row-pill"><span>${r.label}</span><span class="status-tag ${r.cls}">${r.tag}</span></div>`
      )
      .join('');
  }
  if (answerCtaBtn) answerCtaBtn.textContent = data.cta;
  if (searchSuggestView) searchSuggestView.hidden = true;
  if (searchAnswerView) searchAnswerView.hidden = false;
  openSearchPopover(false);
}

searchInput?.addEventListener('focus', () => openSearchPopover(true));
searchInput?.addEventListener('click', () => openSearchPopover(true));

searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && searchInput.value.trim()) {
    e.preventDefault();
    const q = searchInput.value.trim();
    const low = q.toLowerCase();
    if (low.includes('engel') || low.includes('block')) {
      showSearchAnswer('blocked');
    } else if (low.includes('dün') || low.includes('yesterday')) {
      showSearchAnswer('yesterday');
    } else if (low.includes('nakit') || low.includes('cash')) {
      showSearchAnswer('cash');
    } else {
      showSearchAnswer('custom', q);
    }
  }
});

document.querySelectorAll('.search-suggest-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const label = btn.querySelector('span:last-child')?.textContent || '';
    if (searchInput) searchInput.value = label;
    showSearchAnswer(btn.dataset.query);
  });
});

answerCtaBtn?.addEventListener('click', () => {
  closeSearchPopover();
  openReviewDrawer();
});

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchInput?.focus();
    searchInput?.select();
    openSearchPopover(true);
  } else if (e.key === 'Escape') {
    closeSearchPopover();
    closeReviewDrawer();
    searchInput?.blur();
  }
});

// Notification popover toggle
const notifBtn = document.getElementById('notifBtn');
const notifPopover = document.getElementById('notifPopover');
const notifDot = document.getElementById('notifDot');
const markReadBtn = document.getElementById('markReadBtn');

notifBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = !notifPopover.hidden;
  notifPopover.hidden = isOpen;
  notifBtn.setAttribute('aria-expanded', String(!isOpen));
});

markReadBtn?.addEventListener('click', () => {
  notifDot?.classList.add('hidden');
  notifPopover.hidden = true;
  notifBtn?.setAttribute('aria-expanded', 'false');
});

document.addEventListener('click', (e) => {
  if (notifPopover && !notifPopover.hidden && !e.target.closest('.notif-wrap')) {
    notifPopover.hidden = true;
    notifBtn?.setAttribute('aria-expanded', 'false');
  }
  if (searchPopover && !searchPopover.hidden && !e.target.closest('.search-wrap')) {
    closeSearchPopover();
  }
});

// Window controls
document.getElementById('btnMin')?.addEventListener('click', () => {
  window.dashboardAPI?.minimize();
});

document.getElementById('btnMax')?.addEventListener('click', () => {
  window.dashboardAPI?.toggleMaximize();
});

document.getElementById('btnClose')?.addEventListener('click', () => {
  window.dashboardAPI?.close();
});

// Atlas Brief Card interactions
const DEFAULT_BRIEF =
  'Bugün ilgilenmen gereken üç konu var. Gece iki anlaşma kapandı ve 4. çeyrek pazarlama bütçesi onayını bekliyor.';

const BRIEF_PROMPTS = {
  blocked:
    'Şu anda 4. çeyrek pazarlama bütçesi ($12.400) ve yeni ofis tedarikçi seçimi kararını bekliyor; diğer tüm akışlar ilerliyor.',
  yesterday:
    'Dün iki kurumsal satış anlaşması imzalandı, Kuzey Rüzgarı ortaklık taslağı tamamlandı ve haftalık gelir hedefinin %108’ine ulaşıldı.',
  weekly:
    'Haftalık performans +%14 büyüme ile planın önünde; işletme sağlığı 82 puanda ve nakit pisti 14 ay seviyesinde sağlıklı görünüyor.'
};

const briefBody = document.getElementById('briefBody');
const briefChips = document.querySelectorAll('.brief-chip');
const talkAtlasBtn = document.getElementById('talkAtlasBtn');
const talkAtlasLabel = document.getElementById('talkAtlasLabel');
const readFullBriefBtn = document.getElementById('readFullBriefBtn');

let activePromptKey = null;

function setBriefText(text) {
  if (!briefBody) return;
  briefBody.style.opacity = '0.35';
  setTimeout(() => {
    briefBody.textContent = text;
    briefBody.style.opacity = '1';
  }, 120);
}

briefChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const key = chip.dataset.prompt;
    if (activePromptKey === key) {
      activePromptKey = null;
      chip.classList.remove('active');
      setBriefText(DEFAULT_BRIEF);
      return;
    }

    activePromptKey = key;
    briefChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    setBriefText(BRIEF_PROMPTS[key] || DEFAULT_BRIEF);
  });
});

talkAtlasBtn?.addEventListener('click', () => {
  const listening = talkAtlasBtn.classList.toggle('listening');
  if (talkAtlasLabel) {
    talkAtlasLabel.textContent = listening ? 'Dinleniyor...' : 'Atlas ile konuş';
  }
});

readFullBriefBtn?.addEventListener('click', () => {
  activePromptKey = null;
  briefChips.forEach((c) => c.classList.remove('active'));
  setBriefText(
    'Tam sabah özeti: Gece kapanan 2 anlaşma toplam 48.000 $ ARR ekledi. Finans Asistanı 4. çeyrek pazarlama bütçesi için onayını bekliyor; öğleden sonra 13:30’da Tasarım İncelemesi toplantın var.'
  );
});

// =========================================
// NEEDS YOUR APPROVAL CARD INTERACTIONS
// =========================================
const approvals = [
  {
    title: '4. Çeyrek pazarlama bütçesi',
    meta: '$12.400 · Finans Asistanı · son 12:00',
    insight: 'Geçen çeyrekten %18 düşük · %94 emin',
    amount: '$12.400',
    delta: '%18 daha az',
    spendNote: '%28 harcandı · $18.500 bütçe',
    confidence: '%94 emin',
    reasons: [
      'Geçen çeyrek harcamasına göre %18 daha düşük',
      'Mart ayında onaylanan yıllık planla uyumlu',
      '3 kampanya hazır bekliyor, onay sonrası yayında'
    ],
    breakdown: [
      { label: 'Ücretli reklamlar', amount: '$6.200', pct: 50, color: '#6366f1' },
      { label: 'İçerik', amount: '$3.800', pct: 31, color: '#22c55e' },
      { label: 'Etkinlikler', amount: '$2.400', pct: 19, color: '#f59e0b' }
    ],
    fileName: '4c-pazarlama-butcesi.pdf',
    fileMeta: '2 sayfa'
  },
  {
    title: 'Tedarikçi sözleşmesi',
    meta: '$4.800 / ay · Hukuk Asistanı · son 15:00',
    insight: 'Standart SLA şartlarıyla %97 uyumlu',
    amount: '$4.800',
    delta: 'Yıllık %9 indirim',
    spendNote: '12 aylık sabit kur · $57.600/yıl',
    confidence: '%97 uyumlu',
    reasons: [
      'Standart gizlilik ve SLA maddeleri eksiksiz',
      'Erken ödeme indirimiyle yıllık $5.200 tasarruf',
      'Hukuk Asistanı kırmızı bayrak tespit etmedi'
    ],
    breakdown: [
      { label: 'Altyapı & Bulut', amount: '$3.100', pct: 65, color: '#6366f1' },
      { label: 'Destek SLA', amount: '$1.700', pct: 35, color: '#22c55e' }
    ],
    fileName: 'tedarikci-sozlesmesi-v3.pdf',
    fileMeta: '6 sayfa'
  },
  {
    title: 'Yeni işe alım teklifi',
    meta: 'Kıdemli Ürün Tasarımcısı · İK Asistanı · bugün',
    insight: 'Bütçe aralığı içinde · %92 onay önerisi',
    amount: '$145.000',
    delta: 'Bütçe içi',
    spendNote: 'Yıllık paket · Başlangıç: Pazartesi',
    confidence: '%92 öneri',
    reasons: [
      'Mühendislik ve Tasarım bant genişliği hedefleriyle uyumlu',
      'Teknik mülakattan 4.8 / 5 ekip puanı aldı',
      'Teklif onaylanırsa Pazartesi işe başlıyor'
    ],
    breakdown: [
      { label: 'Baz ücret', amount: '$128.000', pct: 88, color: '#6366f1' },
      { label: 'Performans payı', amount: '$17.000', pct: 12, color: '#f59e0b' }
    ],
    fileName: 'teklif-mektubu-tasarim.pdf',
    fileMeta: '3 sayfa'
  }
];

let approvalIndex = 0;
let lastApproved = null;
let toastTimer = null;

const approvalCountEl = document.getElementById('approvalCount');
const approvalTitleEl = document.getElementById('approvalTitle');
const approvalMetaEl = document.getElementById('approvalMeta');
const approvalInsightEl = document.getElementById('approvalInsight');
const approvalMoreEl = document.getElementById('approvalMore');
const approveBtn = document.getElementById('approveBtn');
const reviewBtn = document.getElementById('reviewBtn');
const nextApprovalBtn = document.getElementById('nextApprovalBtn');

const drawerBackdrop = document.getElementById('drawerBackdrop');
const reviewDrawer = document.getElementById('reviewDrawer');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const drawerStatusBadge = document.getElementById('drawerStatusBadge');
const drawerTitle = document.getElementById('drawerTitle');
const drawerMeta = document.getElementById('drawerMeta');
const drawerAmount = document.getElementById('drawerAmount');
const drawerDeltaPill = document.getElementById('drawerDeltaPill');
const drawerSpendNote = document.getElementById('drawerSpendNote');
const drawerConfidence = document.getElementById('drawerConfidence');
const drawerReasons = document.getElementById('drawerReasons');
const drawerStackedBar = document.getElementById('drawerStackedBar');
const drawerBreakdown = document.getElementById('drawerBreakdown');
const drawerFileName = document.getElementById('drawerFileName');
const drawerFileMeta = document.getElementById('drawerFileMeta');
const drawerApproveBtn = document.getElementById('drawerApproveBtn');
const drawerRejectBtn = document.getElementById('drawerRejectBtn');

const approvalToast = document.getElementById('approvalToast');
const toastMessage = document.getElementById('toastMessage');
const toastUndoBtn = document.getElementById('toastUndoBtn');

function renderApproval() {
  if (approvals.length === 0) {
    if (approvalCountEl) approvalCountEl.textContent = '0';
    if (approvalTitleEl) approvalTitleEl.textContent = 'Tüm onaylar tamamlandı';
    if (approvalMetaEl) approvalMetaEl.textContent = 'Bekleyen talep kalmadı';
    if (approvalInsightEl) approvalInsightEl.textContent = 'Atlas tüm işleri takipte tutuyor';
    if (approvalMoreEl) approvalMoreEl.textContent = 'Bekleyen başka onay yok';
    return;
  }

  const current = approvals[approvalIndex % approvals.length];
  const others = approvals
    .filter((_, idx) => idx !== approvalIndex % approvals.length)
    .map((item) => item.title);

  if (approvalCountEl) approvalCountEl.textContent = String(approvals.length);
  if (approvalTitleEl) approvalTitleEl.textContent = current.title;
  if (approvalMetaEl) approvalMetaEl.textContent = current.meta;
  if (approvalInsightEl) approvalInsightEl.textContent = current.insight;
  if (approvalMoreEl) {
    approvalMoreEl.textContent =
      others.length > 0 ? `+${others.length} diğer · ${others.join(', ')}` : 'Son bekleyen talep';
  }
}

function showToast(text) {
  if (!approvalToast || !toastMessage) return;
  toastMessage.textContent = text;
  approvalToast.hidden = false;
  requestAnimationFrame(() => approvalToast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    approvalToast.classList.remove('show');
    setTimeout(() => {
      approvalToast.hidden = true;
    }, 220);
  }, 4500);
}

function openReviewDrawer() {
  if (approvals.length === 0 || !reviewDrawer || !drawerBackdrop) return;
  const idx = approvalIndex % approvals.length;
  const item = approvals[idx];

  if (drawerStatusBadge) {
    drawerStatusBadge.innerHTML = `<i></i>Onay bekliyor · ${idx + 1} / ${approvals.length}`;
  }
  if (drawerTitle) drawerTitle.textContent = item.title;
  if (drawerMeta) drawerMeta.textContent = item.meta;
  if (drawerAmount) drawerAmount.textContent = item.amount;
  if (drawerDeltaPill) drawerDeltaPill.textContent = item.delta;
  if (drawerSpendNote) drawerSpendNote.textContent = item.spendNote;
  if (drawerConfidence) drawerConfidence.textContent = item.confidence;
  if (drawerFileName) drawerFileName.textContent = item.fileName;
  if (drawerFileMeta) drawerFileMeta.textContent = item.fileMeta;
  if (drawerApproveBtn) drawerApproveBtn.textContent = `Onayla ${item.amount}`;

  if (drawerReasons) {
    drawerReasons.innerHTML = item.reasons.map((r) => `<li>${r}</li>`).join('');
  }
  if (drawerStackedBar) {
    drawerStackedBar.innerHTML = item.breakdown
      .map((b) => `<span style="width:${b.pct}%;background:${b.color}"></span>`)
      .join('');
  }
  if (drawerBreakdown) {
    drawerBreakdown.innerHTML = item.breakdown
      .map(
        (b) =>
          `<div class="breakdown-row"><span class="breakdown-label"><i style="background:${b.color}"></i>${b.label}</span><strong>${b.amount}</strong></div>`
      )
      .join('');
  }

  drawerBackdrop.hidden = false;
  reviewDrawer.hidden = false;
  requestAnimationFrame(() => {
    drawerBackdrop.classList.add('open');
    reviewDrawer.classList.add('open');
  });
}

function closeReviewDrawer() {
  if (!reviewDrawer || !drawerBackdrop || reviewDrawer.hidden) return;
  drawerBackdrop.classList.remove('open');
  reviewDrawer.classList.remove('open');
  setTimeout(() => {
    drawerBackdrop.hidden = true;
    reviewDrawer.hidden = true;
  }, 260);
}

function approveCurrentItem() {
  if (approvals.length === 0) return;
  const idx = approvalIndex % approvals.length;
  const removed = approvals.splice(idx, 1)[0];
  lastApproved = { item: removed, index: idx };
  if (approvalIndex >= approvals.length) approvalIndex = 0;
  renderApproval();
  closeReviewDrawer();
  showToast(`Onaylandı · ${removed.amount}`);
}

nextApprovalBtn?.addEventListener('click', () => {
  if (approvals.length > 1) {
    approvalIndex = (approvalIndex + 1) % approvals.length;
    renderApproval();
  }
});

approveBtn?.addEventListener('click', approveCurrentItem);
drawerApproveBtn?.addEventListener('click', approveCurrentItem);
reviewBtn?.addEventListener('click', openReviewDrawer);
document.getElementById('viewAllApprovals')?.addEventListener('click', openReviewDrawer);
closeDrawerBtn?.addEventListener('click', closeReviewDrawer);
drawerBackdrop?.addEventListener('click', closeReviewDrawer);
drawerRejectBtn?.addEventListener('click', closeReviewDrawer);

toastUndoBtn?.addEventListener('click', () => {
  if (!lastApproved) return;
  approvals.splice(lastApproved.index, 0, lastApproved.item);
  approvalIndex = lastApproved.index;
  lastApproved = null;
  renderApproval();
  approvalToast.classList.remove('show');
  setTimeout(() => {
    approvalToast.hidden = true;
  }, 200);
});

renderApproval();

// =========================================
// DOT-MATRIX PIXEL NUMBERS & SPARKLINE TICKS
// =========================================
const DIGIT_MAP = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['01110', '10001', '00001', '00110', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110']
};

function renderDotMatrix(containerId, valueStr) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  for (const ch of String(valueStr)) {
    const pattern = DIGIT_MAP[ch] || DIGIT_MAP['0'];
    const digitEl = document.createElement('div');
    digitEl.className = 'dot-digit';

    for (const row of pattern) {
      for (const cell of row) {
        const dot = document.createElement('span');
        dot.className = cell === '1' ? 'dot-cell on' : 'dot-cell';
        digitEl.appendChild(dot);
      }
    }
    container.appendChild(digitEl);
  }
}

function renderTickRuler(containerId, heights) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  heights.forEach((h, i) => {
    const tick = document.createElement('span');
    tick.className = i % 5 === 0 || h >= 14 ? 'kpi-tick tall' : 'kpi-tick';
    tick.style.height = `${h}px`;
    container.appendChild(tick);
  });
}

renderDotMatrix('healthDotMatrix', '74');
renderDotMatrix('runwayDotMatrix', '12');

setTimeout(() => {
  renderDotMatrix('healthDotMatrix', '78');
  renderDotMatrix('runwayDotMatrix', '13');
}, 180);

setTimeout(() => {
  renderDotMatrix('healthDotMatrix', '82');
  renderDotMatrix('runwayDotMatrix', '14');
}, 380);

renderTickRuler(
  'healthTicks',
  [8, 6, 12, 7, 9, 16, 8, 6, 11, 7, 15, 9, 7, 13, 8, 18, 10, 7, 12, 8, 16, 9, 7, 11, 8, 14, 7, 9, 12, 8, 15, 9]
);
renderTickRuler(
  'runwayTicks',
  [7, 9, 6, 14, 8, 10, 7, 12, 8, 6, 16, 9, 7, 11, 15, 8, 7, 13, 9, 6, 17, 10, 8, 12, 7, 14, 9, 6, 11, 8, 13, 9]
);

// =========================================
// TODAY'S PRIORITIES INTERACTIONS
// =========================================
const priorityRows = document.querySelectorAll('.priority-row');
const prioritiesSummary = document.getElementById('prioritiesSummary');

function updatePrioritiesSummary() {
  const total = priorityRows.length;
  const doneCount = document.querySelectorAll('.priority-row.done').length;
  if (prioritiesSummary) {
    prioritiesSummary.textContent = `${doneCount} / ${total} tamamlandı · Atlas seçti`;
  }
}

priorityRows.forEach((row) => {
  const checkBtn = row.querySelector('.priority-check');
  const actionBtn = row.querySelector('.row-action-btn');
  const titleText = row.querySelector('.priority-copy strong')?.textContent || 'Görev';

  checkBtn?.addEventListener('click', () => {
    row.classList.toggle('done');
    updatePrioritiesSummary();
  });

  actionBtn?.addEventListener('click', () => {
    setBriefText(`${titleText} açıldı — Atlas gerekli belgeleri ve önerilen aksiyonları hazırladı.`);
  });
});

document.querySelectorAll('.agent-card').forEach((card) => {
  card.addEventListener('click', () => {
    const name = card.querySelector('.agent-meta strong')?.textContent || 'Asistan';
    const status = card.querySelector('.agent-meta span')?.textContent || '';
    setBriefText(`${name} Asistanı durumu: ${status}.`);
  });
});
