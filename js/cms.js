const CMS_KEY = 'cijian_cms_content';
const CMS_SESSION = 'cijian_admin_session';

let defaultContent = null;

async function loadDefaultContent() {
  if (defaultContent) return defaultContent;
  try {
    const res = await fetch('data/default-content.json');
    defaultContent = await res.json();
  } catch {
    defaultContent = getEmbeddedDefault();
  }
  return defaultContent;
}

function getEmbeddedDefault() {
  return {
    password: 'cijian2026',
    theme: { accentColor: '#c9a227', accentLight: '#f0d78c', primaryGreen: '#1e4d35', bgColor: '#0a0f0d', bgAlt: '#111916', textColor: '#e8ebe9', textMuted: '#8a9a90' },
    site: { brandName: '賜建科技', brandSub: 'CIJIAN TECHNOLOGY', tagline: '升降景觀燈 · 台灣第一領導品牌', madeInTaiwan: '台灣設計 · 台灣生產 · 台灣製造' },
    hero: { tag: '昇華 Lux 可伸縮景觀燈系列', title: '一盞燈，點亮生活', titleHighlight: '現代美學 × 景觀升級', desc: '白天隱藏於地面，夜晚優雅升起。', titleSize: '4.5', descSize: '1.1', tagColor: '#c9a227', image: 'images/hero-product.png' },
    about: { tag: '關於賜建', title: '專業 LED 照明 · 台灣製造', desc: '賜建科技（Artled）2001 年於新北成立。', titleSize: '2.5', descSize: '1', stats: [{ number: '2001', label: '成立年份' }], features: [{ title: '台灣研發製造', desc: '全程在台灣完成' }] },
    products: [],
    features: { tag: '產品特色', title: '為什麼選擇升降景觀燈？', items: [] },
    comparison: { tag: '產品比較', title: '升降式 vs 傳統固定式', image: 'images/comparison.png', items: [] },
    applications: { tag: '適用場景', title: '多元空間，完美適配', items: [] },
    videos: [],
    gallery: [],
    contact: { person: '業務賴宥宏', phone: '0900-130-271', phoneRaw: '0900130271', email: 'ko520941@gmail.com', address: '桃園市龜山區萬壽路一段 611-7 號', hours: '週一至週五 09:00 – 18:00' }
  };
}

function getContent() {
  const stored = localStorage.getItem(CMS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

async function getSiteContent() {
  const isAdmin = window.location.pathname.includes('admin');

  // 官網優先讀伺服器 content.json，不被 localStorage 舊資料覆蓋
  if (!isAdmin) {
    try {
      const res = await fetch('data/content.json');
      if (res.ok) return await res.json();
    } catch { /* fallback below */ }
    return loadDefaultContent();
  }

  // 後台才使用 localStorage 暫存編輯內容
  const stored = getContent();
  if (stored) return stored;

  try {
    const res = await fetch('data/content.json');
    if (res.ok) return await res.json();
  } catch { /* fallback below */ }

  return loadDefaultContent();
}

function saveContent(data) {
  localStorage.setItem(CMS_KEY, JSON.stringify(data));
}

function resetContent() {
  localStorage.removeItem(CMS_KEY);
}

function isAdminLoggedIn() {
  return sessionStorage.getItem(CMS_SESSION) === 'true';
}

function adminLogin(password) {
  return getSiteContent().then(content => {
    if (password === content.password) {
      sessionStorage.setItem(CMS_SESSION, 'true');
      return true;
    }
    return false;
  });
}

function adminLogout() {
  sessionStorage.removeItem(CMS_SESSION);
}

function changePassword(oldPass, newPass) {
  return getSiteContent().then(content => {
    if (oldPass !== content.password) return false;
    content.password = newPass;
    saveContent(content);
    return true;
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function youtubeEmbedUrl(url) {
  if (!url) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return url.includes('embed') ? url : '';
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (!theme) return;
  root.style.setProperty('--color-accent', theme.accentColor || '#c9a227');
  root.style.setProperty('--color-accent-light', theme.accentLight || '#f0d78c');
  root.style.setProperty('--color-accent-glow', hexToRgba(theme.accentColor || '#c9a227', 0.25));
  root.style.setProperty('--color-green', theme.primaryGreen || '#1e4d35');
  root.style.setProperty('--color-bg', theme.bgColor || '#0a0f0d');
  root.style.setProperty('--color-bg-alt', theme.bgAlt || '#111916');
  root.style.setProperty('--color-text', theme.textColor || '#e8ebe9');
  root.style.setProperty('--color-text-muted', theme.textMuted || '#8a9a90');
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
