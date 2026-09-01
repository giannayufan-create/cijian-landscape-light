async function renderSite() {
  const data = await getSiteContent();
  applyTheme(data.theme);

  setText('brandName', data.site.brandName);
  setText('brandSub', data.site.brandSub);
  setTextAll('brandNameAll', data.site.brandName);
  setText('madeInTaiwan', data.site.madeInTaiwan);
  setText('tagline', data.site.tagline);

  const hero = data.hero;
  setText('heroTag', hero.tag);
  setHTML('heroTitle', `${hero.title}<br><span>${hero.titleHighlight}</span>`);
  setText('heroDesc', hero.desc);
  setStyle('heroTag', 'color', hero.tagColor);
  setStyle('heroTitle', 'font-size', `${hero.titleSize}rem`);
  setStyle('heroDesc', 'font-size', `${hero.descSize}rem`);
  if (hero.image) setImage('heroImage', hero.image);

  const about = data.about;
  setText('aboutTag', about.tag);
  setText('aboutTitle', about.title);
  setText('aboutDesc', about.desc);
  setStyle('aboutTitle', 'font-size', `${about.titleSize}rem`);
  setStyle('aboutDesc', 'font-size', `${about.descSize}rem`);
  renderStats(about.stats);
  renderAboutFeatures(about.features);

  renderProducts(data.products);
  renderFeatures(data.features);
  renderComparison(data.comparison);
  renderApplications(data.applications);
  renderVideos(data.videos);
  renderGallery(data.gallery);
  renderContact(data.contact);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || '';
}

function setTextAll(cls, text) {
  document.querySelectorAll(`.${cls}`).forEach(el => { el.textContent = text || ''; });
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setStyle(id, prop, val) {
  const el = document.getElementById(id);
  if (el) el.style[prop] = val;
}

function setImage(id, src) {
  const el = document.getElementById(id);
  if (el && src) {
    el.src = src;
    el.style.display = 'block';
    const placeholder = el.nextElementSibling;
    if (placeholder?.classList.contains('img-placeholder')) placeholder.style.display = 'none';
  }
}

function renderStats(stats) {
  const container = document.getElementById('aboutStats');
  if (!container || !stats) return;
  container.innerHTML = stats.map(s => `
    <div class="stat">
      <span class="stat__number">${s.number}</span>
      <span class="stat__label">${s.label}</span>
    </div>
  `).join('');
}

function renderAboutFeatures(features) {
  const container = document.getElementById('aboutFeatures');
  if (!container || !features) return;
  container.innerHTML = features.map(f => `
    <li>
      <span class="feature__icon">◈</span>
      <div>
        <strong>${f.title}</strong>
        <p>${f.desc}</p>
      </div>
    </li>
  `).join('');
}

function renderProducts(products) {
  const container = document.getElementById('productsGrid');
  if (!container || !products) return;
  container.innerHTML = products.map((p, i) => `
    <article class="product-card reveal" id="product-${p.id}">
      <div class="product-card__badge">${p.badge || ''}</div>
      <div class="product-card__image">
        ${p.image
          ? `<img src="${p.image}" alt="${p.model}" loading="lazy">`
          : `<div class="product-card__placeholder"><span>${p.model}</span></div>`
        }
      </div>
      <div class="product-card__body">
        <span class="product-card__model">${p.model}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__desc">${p.desc}</p>
        <ul class="product-card__specs">
          ${p.specs.map(s => `<li>${s}</li>`).join('')}
        </ul>
        <a href="#contact" class="btn btn--primary btn--sm">詢價諮詢</a>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
  });
}

function renderFeatures(section) {
  if (!section) return;
  setText('featuresTag', section.tag);
  setText('featuresTitle', section.title);
  const container = document.getElementById('featuresGrid');
  if (!container) return;
  container.innerHTML = section.items.map(item => `
    <div class="feature-card reveal">
      <div class="feature-card__icon">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </div>
  `).join('');
}

function renderComparison(section) {
  if (!section) return;
  setText('comparisonTag', section.tag);
  setText('comparisonTitle', section.title);
  const img = document.getElementById('comparisonImage');
  if (img && section.image) img.src = section.image;

  const container = document.getElementById('comparisonTable');
  if (!container) return;
  container.innerHTML = `
    <div class="comparison__header">
      <span>比較項目</span>
      <span class="comparison__col--win">升降式景觀燈</span>
      <span>傳統固定式</span>
    </div>
    ${section.items.map(item => `
      <div class="comparison__row">
        <span class="comparison__aspect">${item.aspect}</span>
        <span class="comparison__col--win">${item.retractable}</span>
        <span class="comparison__col--lose">${item.traditional}</span>
      </div>
    `).join('')}
  `;
}

function renderApplications(section) {
  if (!section) return;
  setText('appsTag', section.tag);
  setText('appsTitle', section.title);
  const container = document.getElementById('appsGrid');
  if (!container) return;
  container.innerHTML = section.items.map(app => `
    <div class="app-tag reveal">${app}</div>
  `).join('');
}

function renderVideos(videos) {
  const container = document.getElementById('videosGrid');
  if (!container) return;

  const validVideos = (videos || []).filter(v => v.youtubeUrl);
  if (validVideos.length === 0) {
    container.innerHTML = `
      <div class="video-placeholder reveal">
        <div class="video-placeholder__icon">▶</div>
        <p>影片即將上線</p>
        <span>您可透過後台管理新增 YouTube 連結</span>
      </div>
    `;
    return;
  }

  container.innerHTML = validVideos.map(v => {
    const embed = youtubeEmbedUrl(v.youtubeUrl);
    return `
      <div class="video-card reveal">
        <div class="video-card__embed">
          <iframe src="${embed}" title="${v.title}" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>
        <h3>${v.title}</h3>
        ${v.description ? `<p>${v.description}</p>` : ''}
      </div>
    `;
  }).join('');
}

function renderGallery(gallery) {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  if (!gallery || gallery.length === 0) {
    container.innerHTML = `
      <div class="gallery-empty reveal">
        <p>案例照片即將更新</p>
        <span>可透過後台管理新增圖片</span>
      </div>
    `;
    return;
  }

  container.innerHTML = gallery.map((item, i) => `
    <div class="gallery__item reveal ${i === 0 ? 'gallery__item--large' : ''}">
      <img src="${item.image}" alt="${item.title || ''}" loading="lazy">
      ${item.title ? `<div class="gallery__overlay"><h3>${item.title}</h3>${item.subtitle ? `<p>${item.subtitle}</p>` : ''}</div>` : ''}
    </div>
  `).join('');
}

function renderContact(contact) {
  if (!contact) return;
  setText('contactPhone', contact.phone);
  setText('contactFax', contact.fax);
  setText('contactEmail', contact.email);
  setText('contactWebsite', contact.website);
  setText('contactAddress', contact.address);
  setText('contactHours', contact.hours);
}

function initReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const mo = new MutationObserver(() => {
    document.querySelectorAll('.reveal:not(.observed)').forEach(el => {
      el.classList.add('observed');
      observer.observe(el);
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  await renderSite();
  initReveal();
});
