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

/* =============================================
      Project Filter
  ====================================== */
// Wait for DOM ready
document.addEventListener('DOMContentLoaded', function () {
  // Check if jQuery is available
  if (window.jQuery) {
    var $grid = $('.portfolio-filter #portfolioGrid');
    var $filter = $('.portfolio-filter .np-filter');

    // Only initialize if both elements exist
    if ($grid.length && $filter.length) {
      $grid.isotope({
        itemSelector: '.np-card',
        layoutMode: 'fitRows',
        transitionDuration: '0.4s',
        hiddenStyle: {
          opacity: 0,
          transform: 'scale(0.8)'
        },
        visibleStyle: {
          opacity: 1,
          transform: 'scale(1)'
        }
      });

      $filter.on('click', '.np-filter-btn', function () {
        var filterValue = $(this).attr('data-filter');
        $grid.isotope({ filter: filterValue });
        $filter.find('.np-filter-btn').removeClass('np-active');
        $(this).addClass('np-active');
      });
    }
  } else {
    console.warn('jQuery not loaded – portfolio filter skipped.');
  }
});

document.querySelectorAll('.dropdown').forEach(function (el) {
  el.addEventListener('mouseenter', function () {
    new bootstrap.Dropdown(el).show();
  });
  el.addEventListener('mouseleave', function () {
    new bootstrap.Dropdown(el).hide();
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
