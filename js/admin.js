let content = null;

const TAB_TITLES = {
  theme: '主題配色',
  hero: '首頁主視覺',
  about: '關於我們',
  products: '產品管理',
  features: '產品特色',
  comparison: '產品比較',
  videos: '影片管理',
  gallery: '案例圖片',
  contact: '聯絡資訊',
  settings: '帳號設定'
};

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function syncColorPair(colorId, textId) {
  const colorEl = document.getElementById(colorId);
  const textEl = document.getElementById(textId);
  if (!colorEl || !textEl) return;
  colorEl.addEventListener('input', () => { textEl.value = colorEl.value; });
  textEl.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(textEl.value)) colorEl.value = textEl.value;
  });
}

async function init() {
  if (isAdminLoggedIn()) {
    showPanel();
  }

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const pass = document.getElementById('password').value;
    const ok = await adminLogin(pass);
    if (ok) {
      showPanel();
    } else {
      showToast('密碼錯誤');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    adminLogout();
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
  });

  document.querySelectorAll('.sidebar__btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('saveBtn').addEventListener('click', saveAll);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
  document.getElementById('exportBtn').addEventListener('click', exportForDeploy);
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importFromFile);

  document.getElementById('changePasswordBtn').addEventListener('click', handlePasswordChange);

  document.getElementById('addStatBtn').addEventListener('click', () => addStat());
  document.getElementById('addFeatureBtn').addEventListener('click', () => addAboutFeature());
  document.getElementById('addFeatureItemBtn').addEventListener('click', () => addFeatureItem());
  document.getElementById('addComparisonBtn').addEventListener('click', () => addComparisonItem());
  document.getElementById('addVideoBtn').addEventListener('click', () => addVideo());
  document.getElementById('addGalleryBtn').addEventListener('click', () => addGalleryItem());

  setupImageUpload('heroImageFile', 'heroImagePreview', val => { content.hero.image = val; });
  setupImageUpload('comparisonImageFile', 'comparisonImagePreview', val => { content.comparison.image = val; });

  ['themeAccent', 'themeAccentLight', 'themeGreen', 'themeBg', 'themeBgAlt', 'themeText'].forEach(id => {
    syncColorPair(id, id + 'Text');
  });
}

async function showPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'flex';
  content = await getSiteContent();
  populateAll();
}

function switchTab(tab) {
  document.querySelectorAll('.sidebar__btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
  document.getElementById('tabTitle').textContent = TAB_TITLES[tab] || tab;
}

function populateAll() {
  const t = content.theme;
  setVal('themeAccent', t.accentColor);
  setVal('themeAccentText', t.accentColor);
  setVal('themeAccentLight', t.accentLight);
  setVal('themeAccentLightText', t.accentLight);
  setVal('themeGreen', t.primaryGreen);
  setVal('themeGreenText', t.primaryGreen);
  setVal('themeBg', t.bgColor);
  setVal('themeBgText', t.bgColor);
  setVal('themeBgAlt', t.bgAlt);
  setVal('themeBgAltText', t.bgAlt);
  setVal('themeText', t.textColor);
  setVal('themeTextText', t.textColor);

  const h = content.hero;
  setVal('heroTag', h.tag);
  setVal('heroTitle', h.title);
  setVal('heroTitleHighlight', h.titleHighlight);
  setVal('heroDesc', h.desc);
  setVal('heroTitleSize', h.titleSize);
  setVal('heroDescSize', h.descSize);
  setVal('heroTagColor', h.tagColor);
  setPreview('heroImagePreview', h.image);

  const a = content.about;
  setVal('aboutTag', a.tag);
  setVal('aboutTitle', a.title);
  setVal('aboutDesc', a.desc);
  setVal('aboutTitleSize', a.titleSize);
  setVal('aboutDescSize', a.descSize);
  renderStatsEditor(a.stats);
  renderAboutFeaturesEditor(a.features);

  renderProductsEditor(content.products);

  setVal('featuresTag', content.features.tag);
  setVal('featuresTitle', content.features.title);
  renderFeaturesItemsEditor(content.features.items);

  setVal('comparisonTag', content.comparison.tag);
  setVal('comparisonTitle', content.comparison.title);
  setPreview('comparisonImagePreview', content.comparison.image);
  renderComparisonEditor(content.comparison.items);

  renderVideosEditor(content.videos);
  renderGalleryEditor(content.gallery);

  const c = content.contact;
  setVal('contactPerson', c.person);
  setVal('contactPhone', c.phone);
  setVal('contactPhoneRaw', c.phoneRaw);
  setVal('contactEmail', c.email);
  setVal('contactAddress', c.address);
  setVal('contactHours', c.hours);

  setVal('siteBrandName', content.site.brandName);
  setVal('siteBrandSub', content.site.brandSub);
  setVal('siteTagline', content.site.tagline);
  setVal('siteMadeInTaiwan', content.site.madeInTaiwan);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? '';
}

function setPreview(id, src) {
  const el = document.getElementById(id);
  if (el && src) { el.src = src; el.style.display = 'block'; }
}

function collectAll() {
  content.theme = {
    accentColor: getVal('themeAccent'),
    accentLight: getVal('themeAccentLight'),
    primaryGreen: getVal('themeGreen'),
    bgColor: getVal('themeBg'),
    bgAlt: getVal('themeBgAlt'),
    textColor: getVal('themeText'),
    textMuted: content.theme.textMuted
  };

  content.hero.tag = getVal('heroTag');
  content.hero.title = getVal('heroTitle');
  content.hero.titleHighlight = getVal('heroTitleHighlight');
  content.hero.desc = getVal('heroDesc');
  content.hero.titleSize = getVal('heroTitleSize');
  content.hero.descSize = getVal('heroDescSize');
  content.hero.tagColor = getVal('heroTagColor');

  content.about.tag = getVal('aboutTag');
  content.about.title = getVal('aboutTitle');
  content.about.desc = getVal('aboutDesc');
  content.about.titleSize = getVal('aboutTitleSize');
  content.about.descSize = getVal('aboutDescSize');
  content.about.stats = collectStats();
  content.about.features = collectAboutFeatures();

  content.features.tag = getVal('featuresTag');
  content.features.title = getVal('featuresTitle');
  content.features.items = collectFeatureItems();

  content.comparison.tag = getVal('comparisonTag');
  content.comparison.title = getVal('comparisonTitle');
  content.comparison.items = collectComparisonItems();

  content.contact = {
    person: getVal('contactPerson'),
    phone: getVal('contactPhone'),
    phoneRaw: getVal('contactPhoneRaw'),
    email: getVal('contactEmail'),
    address: getVal('contactAddress'),
    hours: getVal('contactHours')
  };

  content.site.brandName = getVal('siteBrandName');
  content.site.brandSub = getVal('siteBrandSub');
  content.site.tagline = getVal('siteTagline');
  content.site.madeInTaiwan = getVal('siteMadeInTaiwan');

  return content;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function saveAll() {
  collectAll();
  saveContent(content);
  showToast('✓ 已儲存！重新整理網站即可看到變更');
}

async function resetAll() {
  if (!confirm('確定要重置為預設內容嗎？所有自訂內容將被清除。')) return;
  resetContent();
  content = await loadDefaultContent();
  populateAll();
  showToast('已重置為預設內容');
}

function exportForDeploy() {
  collectAll();
  content.products = collectProducts();
  content.videos = collectVideos();
  content.gallery = collectGallery();

  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'content.json';
  a.click();
  URL.revokeObjectURL(url);

  showToast('已匯出 content.json — 請放到 data/ 資料夾並推送到 GitHub');
}

function importFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      content = JSON.parse(ev.target.result);
      saveContent(content);
      populateAll();
      showToast('匯入成功！');
    } catch {
      showToast('JSON 格式錯誤');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

async function handlePasswordChange() {
  const oldP = document.getElementById('oldPassword').value;
  const newP = document.getElementById('newPassword').value;
  const confirmP = document.getElementById('confirmPassword').value;
  if (!oldP || !newP) { showToast('請填寫密碼'); return; }
  if (newP !== confirmP) { showToast('新密碼不一致'); return; }
  const ok = await changePassword(oldP, newP);
  if (ok) {
    showToast('密碼已修改');
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  } else {
    showToast('目前密碼錯誤');
  }
}

function setupImageUpload(fileId, previewId, callback) {
  document.getElementById(fileId).addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('圖片請小於 2MB');
      return;
    }
    const base64 = await fileToBase64(file);
    document.getElementById(previewId).src = base64;
    callback(base64);
    showToast('圖片已上傳，請記得儲存');
  });
}

/* ===== Stats Editor ===== */
function renderStatsEditor(stats) {
  const container = document.getElementById('aboutStatsEditor');
  container.innerHTML = (stats || []).map((s, i) => `
    <div class="editor-item" data-index="${i}">
      <div class="form-row">
        <div class="form-group"><label>數字</label><input type="text" class="stat-number" value="${s.number}"></div>
        <div class="form-group"><label>說明</label><input type="text" class="stat-label" value="${s.label}"></div>
        <button type="button" class="btn-remove" onclick="removeStat(${i})">刪除</button>
      </div>
    </div>
  `).join('');
}

function collectStats() {
  return [...document.querySelectorAll('#aboutStatsEditor .editor-item')].map(el => ({
    number: el.querySelector('.stat-number').value,
    label: el.querySelector('.stat-label').value
  }));
}

function addStat() {
  content.about.stats = content.about.stats || [];
  content.about.stats.push({ number: '', label: '' });
  renderStatsEditor(content.about.stats);
}

function removeStat(i) {
  content.about.stats.splice(i, 1);
  renderStatsEditor(content.about.stats);
}

/* ===== About Features Editor ===== */
function renderAboutFeaturesEditor(features) {
  const container = document.getElementById('aboutFeaturesEditor');
  container.innerHTML = (features || []).map((f, i) => `
    <div class="editor-item" data-index="${i}">
      <div class="form-group"><label>標題</label><input type="text" class="af-title" value="${f.title}"></div>
      <div class="form-group"><label>說明</label><input type="text" class="af-desc" value="${f.desc}"></div>
      <button type="button" class="btn-remove" onclick="removeAboutFeature(${i})">刪除</button>
    </div>
  `).join('');
}

function collectAboutFeatures() {
  return [...document.querySelectorAll('#aboutFeaturesEditor .editor-item')].map(el => ({
    title: el.querySelector('.af-title').value,
    desc: el.querySelector('.af-desc').value
  }));
}

function addAboutFeature() {
  content.about.features.push({ title: '', desc: '' });
  renderAboutFeaturesEditor(content.about.features);
}

function removeAboutFeature(i) {
  content.about.features.splice(i, 1);
  renderAboutFeaturesEditor(content.about.features);
}

/* ===== Products Editor ===== */
function renderProductsEditor(products) {
  const container = document.getElementById('productsEditor');
  container.innerHTML = (products || []).map((p, i) => `
    <div class="product-editor-card" data-index="${i}">
      <h4>${p.model} — ${p.name}</h4>
      <div class="form-row">
        <div class="form-group"><label>型號</label><input type="text" class="p-model" value="${p.model}"></div>
        <div class="form-group"><label>名稱</label><input type="text" class="p-name" value="${p.name}"></div>
        <div class="form-group"><label>標籤</label><input type="text" class="p-badge" value="${p.badge || ''}"></div>
      </div>
      <div class="form-group"><label>描述</label><textarea class="p-desc" rows="2">${p.desc}</textarea></div>
      <div class="form-group">
        <label>規格標籤</label>
        <div class="specs-editor" id="specs-${i}">
          ${(p.specs || []).map((s, si) => `<span class="spec-tag">${s}<button type="button" onclick="removeSpec(${i},${si})">×</button></span>`).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input type="text" class="spec-input" id="specInput-${i}" placeholder="新增規格..." style="flex:1">
          <button type="button" class="btn btn--outline btn--sm" onclick="addSpec(${i})">新增</button>
        </div>
      </div>
      <div class="form-group">
        <label>產品圖片</label>
        <div class="image-upload">
          <img class="image-preview p-preview" src="${p.image || ''}" alt="">
          <input type="file" class="p-file" accept="image/*" data-index="${i}">
          <button type="button" class="btn btn--outline btn--sm" onclick="this.previousElementSibling.click()">上傳圖片</button>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.p-file').forEach(input => {
    input.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { showToast('圖片請小於 2MB'); return; }
      const base64 = await fileToBase64(file);
      const idx = parseInt(e.target.dataset.index);
      content.products[idx].image = base64;
      e.target.previousElementSibling.previousElementSibling.src = base64;
      showToast('圖片已上傳，請記得儲存');
    });
  });
}

function collectProducts() {
  return [...document.querySelectorAll('#productsEditor .product-editor-card')].map((el, i) => ({
    ...content.products[i],
    model: el.querySelector('.p-model').value,
    name: el.querySelector('.p-name').value,
    badge: el.querySelector('.p-badge').value,
    desc: el.querySelector('.p-desc').value
  }));
}

function addSpec(pi) {
  const input = document.getElementById(`specInput-${pi}`);
  if (!input.value.trim()) return;
  content.products[pi].specs = content.products[pi].specs || [];
  content.products[pi].specs.push(input.value.trim());
  input.value = '';
  renderProductsEditor(content.products);
}

function removeSpec(pi, si) {
  content.products[pi].specs.splice(si, 1);
  renderProductsEditor(content.products);
}

/* ===== Features Items Editor ===== */
function renderFeaturesItemsEditor(items) {
  const container = document.getElementById('featuresItemsEditor');
  container.innerHTML = (items || []).map((item, i) => `
    <div class="editor-item">
      <div class="form-row">
        <div class="form-group"><label>圖示</label><input type="text" class="fi-icon" value="${item.icon}" style="width:60px"></div>
        <div class="form-group"><label>標題</label><input type="text" class="fi-title" value="${item.title}"></div>
        <div class="form-group"><label>說明</label><input type="text" class="fi-desc" value="${item.desc}"></div>
        <button type="button" class="btn-remove" onclick="removeFeatureItem(${i})">刪除</button>
      </div>
    </div>
  `).join('');
}

function collectFeatureItems() {
  return [...document.querySelectorAll('#featuresItemsEditor .editor-item')].map(el => ({
    icon: el.querySelector('.fi-icon').value,
    title: el.querySelector('.fi-title').value,
    desc: el.querySelector('.fi-desc').value
  }));
}

function addFeatureItem() {
  content.features.items.push({ icon: '★', title: '', desc: '' });
  renderFeaturesItemsEditor(content.features.items);
}

function removeFeatureItem(i) {
  content.features.items.splice(i, 1);
  renderFeaturesItemsEditor(content.features.items);
}

/* ===== Comparison Editor ===== */
function renderComparisonEditor(items) {
  const container = document.getElementById('comparisonItemsEditor');
  container.innerHTML = (items || []).map((item, i) => `
    <div class="editor-item">
      <div class="form-group"><label>比較面向</label><input type="text" class="ci-aspect" value="${item.aspect}"></div>
      <div class="form-group"><label>升降式優勢</label><input type="text" class="ci-ret" value="${item.retractable}"></div>
      <div class="form-group"><label>傳統式劣勢</label><input type="text" class="ci-tra" value="${item.traditional}"></div>
      <button type="button" class="btn-remove" onclick="removeComparisonItem(${i})">刪除</button>
    </div>
  `).join('');
}

function collectComparisonItems() {
  return [...document.querySelectorAll('#comparisonItemsEditor .editor-item')].map(el => ({
    aspect: el.querySelector('.ci-aspect').value,
    retractable: el.querySelector('.ci-ret').value,
    traditional: el.querySelector('.ci-tra').value
  }));
}

function addComparisonItem() {
  content.comparison.items.push({ aspect: '', retractable: '', traditional: '' });
  renderComparisonEditor(content.comparison.items);
}

function removeComparisonItem(i) {
  content.comparison.items.splice(i, 1);
  renderComparisonEditor(content.comparison.items);
}

/* ===== Videos Editor ===== */
function renderVideosEditor(videos) {
  const container = document.getElementById('videosEditor');
  container.innerHTML = (videos || []).map((v, i) => `
    <div class="editor-item">
      <div class="form-group"><label>影片標題</label><input type="text" class="v-title" value="${v.title}"></div>
      <div class="form-group"><label>YouTube 連結</label><input type="url" class="v-url" value="${v.youtubeUrl}" placeholder="https://www.youtube.com/watch?v=..."></div>
      <div class="form-group"><label>說明</label><input type="text" class="v-desc" value="${v.description || ''}"></div>
      <button type="button" class="btn-remove" onclick="removeVideo(${i})">刪除</button>
    </div>
  `).join('');
}

function collectVideos() {
  return [...document.querySelectorAll('#videosEditor .editor-item')].map(el => ({
    id: 'v' + Date.now(),
    title: el.querySelector('.v-title').value,
    youtubeUrl: el.querySelector('.v-url').value,
    description: el.querySelector('.v-desc').value
  }));
}

function addVideo() {
  content.videos.push({ id: 'v' + Date.now(), title: '', youtubeUrl: '', description: '' });
  renderVideosEditor(content.videos);
}

function removeVideo(i) {
  content.videos.splice(i, 1);
  renderVideosEditor(content.videos);
}

/* ===== Gallery Editor ===== */
function renderGalleryEditor(gallery) {
  const container = document.getElementById('galleryEditor');
  container.innerHTML = (gallery || []).map((item, i) => `
    <div class="gallery-editor-item" data-index="${i}">
      <img src="${item.image}" alt="">
      <div class="gallery-editor-body">
        <input type="text" class="g-title" value="${item.title || ''}" placeholder="標題">
        <input type="text" class="g-subtitle" value="${item.subtitle || ''}" placeholder="副標題">
        <input type="file" class="g-file" accept="image/*" data-index="${i}" style="display:none">
        <div style="display:flex;gap:6px;margin-top:6px">
          <button type="button" class="btn btn--outline btn--sm" onclick="this.previousElementSibling.click()">換圖</button>
          <button type="button" class="btn-remove" onclick="removeGalleryItem(${i})">刪除</button>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.g-file').forEach(input => {
    input.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { showToast('圖片請小於 2MB'); return; }
      const base64 = await fileToBase64(file);
      const idx = parseInt(e.target.dataset.index);
      content.gallery[idx].image = base64;
      renderGalleryEditor(content.gallery);
      showToast('圖片已更新，請記得儲存');
    });
  });
}

function collectGallery() {
  return [...document.querySelectorAll('#galleryEditor .gallery-editor-item')].map((el, i) => ({
    image: content.gallery[i].image,
    title: el.querySelector('.g-title').value,
    subtitle: el.querySelector('.g-subtitle').value
  }));
}

async function addGalleryItem() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('圖片請小於 2MB'); return; }
    const base64 = await fileToBase64(file);
    content.gallery = content.gallery || [];
    content.gallery.push({ image: base64, title: '', subtitle: '' });
    renderGalleryEditor(content.gallery);
    showToast('圖片已新增，請記得儲存');
  };
  input.click();
}

function removeGalleryItem(i) {
  content.gallery.splice(i, 1);
  renderGalleryEditor(content.gallery);
}

const _saveAll = saveAll;
saveAll = function() {
  content.products = collectProducts();
  content.videos = collectVideos();
  content.gallery = collectGallery();
  _saveAll();
};

document.addEventListener('DOMContentLoaded', init);
