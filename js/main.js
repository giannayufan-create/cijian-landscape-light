const header = document.getElementById('header');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
  header.classList.toggle('header--scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
});

navMenu.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// 表單送出成功提示（FormSubmit 導回網站時顯示）
if (new URLSearchParams(window.location.search).get('sent') === '1') {
  const form = document.getElementById('contactForm');
  if (form) {
    const notice = document.createElement('p');
    notice.className = 'contact__success';
    notice.textContent = '✓ 諮詢已送出！我們將盡快與您聯繫。';
    form.prepend(notice);
    history.replaceState(null, '', window.location.pathname + '#contact');
  }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
