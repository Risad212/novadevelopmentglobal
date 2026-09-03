document.addEventListener("DOMContentLoaded", function () {
  const counters = document.querySelectorAll(".stat-value");

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((c) => io.observe(c));
});

/* =========================================================
   Portfolio Filter — Isotope simple fade + vanilla fallback
   ---------------------------------------------------------
   - Uses jQuery + Isotope (fitRows, opacity only) when available
     for smooth reflow without shake. Falls back to vanilla
     fade + stagger when Isotope not loaded.
   - Works with: #portfolioGrid > .portfolio-card[data-category]
     Buttons: .portfolio-filter-btn[data-filter="all|land|..."]
     Search: #portfolioSearch  Empty: #portfolioEmpty
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  // ----- Elements -----
  var grid      = document.getElementById('portfolioGrid');
  var btns      = document.querySelectorAll('.portfolio-filter-btn');
  var search    = document.getElementById('portfolioSearch');
  var emptyEl   = document.getElementById('portfolioEmpty');
  var resetBtn  = document.getElementById('portfolioReset');
  if (!grid || !btns.length) return; // not on portfolio page

  // ----- Isotope path (preferred — smooth, no shake) -----
  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.isotope) {
    var $       = window.jQuery;
    var $grid   = $(grid);
    var activeFilter = '*';   // '*' = all, '.land' etc. — matches .portfolio-card.land class
    var qsRegex = null;       // search regex, null = no search

    // Force block for Isotope (grid uses display:grid by default)
    grid.style.display = 'block';

    // Init Isotope — fitRows keeps rows, opacity only (no scale) = no shake
    $grid.isotope({
      itemSelector: '.portfolio-card',
      layoutMode: 'fitRows',
      percentPosition: true,
      transitionDuration: '0.45s',
      hiddenStyle: { opacity: 0 },
      visibleStyle: { opacity: 1 }
    });

    // Relayout after images load (prevents stacking)
    $grid.find('img').on('load', function () { $grid.isotope('layout'); });
    setTimeout(function () { $grid.isotope('layout'); }, 300);

    // Apply combined category + search filter
    function isoFilter() {
      $grid.isotope({
        filter: function () {
          var $this = $(this);
          var matchCat = (activeFilter === '*') || $this.is(activeFilter);
          var title = ($this.attr('data-title') || $this.text() || '').toLowerCase();
          var matchSearch = !qsRegex || title.match(qsRegex);
          return matchCat && matchSearch;
        }
      });
      var visible = $grid.data('isotope').filteredItems.length;
      if (emptyEl) emptyEl.classList.toggle('show', visible === 0);
    }

    // Category buttons
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // update active UI
        btns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        var f = btn.getAttribute('data-filter');
        activeFilter = (f === 'all' || !f) ? '*' : '.' + f;
        isoFilter();
      });
    });

    // Search input (live)
    if (search) {
      search.addEventListener('input', function () {
        qsRegex = search.value ? new RegExp(search.value, 'gi') : null;
        isoFilter();
      });
    }

    // Reset button (empty state)
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        activeFilter = '*';
        qsRegex = null;
        if (search) search.value = '';
        btns.forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
        });
        isoFilter();
      });
    }

    isoFilter();
    return; // skip vanilla fallback
  }

  // ----- Vanilla fallback (no jQuery) — fade + stagger -----
  var cards = Array.from(grid.querySelectorAll('.portfolio-card'));
  var activeFilter = 'all';

  function applyFilter() {
    var q = search ? search.value.trim().toLowerCase() : '';
    var toShow = [];
    var toHide = [];

    // Split cards by filter + search
    cards.forEach(function (card) {
      var cat   = (card.getAttribute('data-category') || '').toLowerCase();
      var title = (card.getAttribute('data-title') || card.textContent || '').toLowerCase();
      var show  = (activeFilter === 'all' || cat === activeFilter) && (!q || title.indexOf(q) !== -1);
      if (show) toShow.push(card);
      else      toHide.push(card);
    });

    // Hide: fade out (is-hiding) then display:none (is-hidden)
    toHide.forEach(function (c) {
      if (c.classList.contains('is-hidden')) return;
      c.classList.add('is-hiding');
      setTimeout(function () { c.classList.add('is-hidden'); }, 380);
    });

    // Show: remove display:none, stagger fade in
    toShow.forEach(function (c, i) {
      if (!c.classList.contains('is-hidden') && !c.classList.contains('is-hiding')) return;
      c.classList.remove('is-hidden');
      c.style.animationDelay = (i * 45) + 'ms';
      void c.offsetWidth; // force reflow for transition
      c.classList.remove('is-hiding');
    });
    setTimeout(function () {
      toShow.forEach(function (c) { c.style.animationDelay = ''; });
    }, 600);

    // Empty state
    if (emptyEl) {
      var vis = toShow.length;
      if (vis === 0) setTimeout(function () { emptyEl.classList.add('show'); }, 400);
      else emptyEl.classList.remove('show');
    }
  }

  // Bind buttons / search / reset
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });
  if (search) search.addEventListener('input', applyFilter);
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      activeFilter = 'all';
      if (search) search.value = '';
      btns.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
      });
      applyFilter();
    });
  }

  applyFilter();
});
/* Dropdown hover — desktop only, reuse instance */
document.addEventListener('DOMContentLoaded', function(){
  if (!window.bootstrap || !window.bootstrap.Dropdown) return;
  document.querySelectorAll('.dropdown').forEach(function(container){
    var toggle = container.querySelector('[data-bs-toggle="dropdown"]');
    if (!toggle) return;
    var dd = bootstrap.Dropdown.getOrCreateInstance(toggle);
    container.addEventListener('mouseenter', function(){ if (window.innerWidth > 1199) dd.show(); });
    container.addEventListener('mouseleave', function(){ if (window.innerWidth > 1199) dd.hide(); });
  });
});



/* =============================================
      Mission vission
  ====================================== */
document.addEventListener('DOMContentLoaded', function () {
  var tabs = document.querySelectorAll('.nova-vm-tab');
  var panels = document.querySelectorAll('.nova-vm-panel');
  if (!tabs.length) return;
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + target);
      if (panel) panel.classList.add('active');
    });
  });
});

/* =============================================
      Chat and social media
  ====================================== */
  const chatWindow = document.getElementById('chatWindow');
  const chatBody = document.getElementById('chatBody');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');
 
  function toggleChat(){
    chatWindow.classList.toggle('open');
  }
  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
 
  const dummyReplies = [
    "Got it, thanks!",
    "Sure, let me check that.",
    "This is just a demo reply 🙂",
    "Noted — anything else?",
    "Okay!"
  ];
 
  function addMessage(text, who){
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
 
  function sendMessage(){
    const text = msgInput.value.trim();
    if(!text) return;
    addMessage(text, 'user');
    msgInput.value = '';
    setTimeout(() => {
      const reply = dummyReplies[Math.floor(Math.random()*dummyReplies.length)];
      addMessage(reply, 'bot');
    }, 500);
  }
 
  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', e => {
    if(e.key === 'Enter') sendMessage();
  });
