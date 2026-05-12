const STORAGE_KEYS = {
  favorites: 'nutri.favorites',
  favoritesChecked: 'nutri.favoritesChecked',
  language: 'nutri.language',
  updateLastCheck: 'nutri.updateLastCheck'
};

const DEFAULT_LANGUAGE = 'en';
const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const SUPPORTED_LANGUAGES = ['en', 'de', 'es', 'it', 'fr', 'el', 'hu', 'nl', 'nb', 'bg', 'pl', 'pt', 'ro', 'cs', 'ru', 'tr', 'sv', 'sr'];
const HIDDEN_NUTRIENTS = new Set([
  'Vitamin A, IU',
  'Vitamin D (D2 + D3), International Units',
  'Vitamin E, added',
  'Vitamin B-12, added',
  'Folic acid',
  'Folate, food',
  'Folate, DFE',
  'Retinol',
  'SFA 4:0',
  'SFA 6:0',
  'SFA 8:0',
  'SFA 10:0',
  'SFA 12:0',
  'SFA 14:0',
  'SFA 16:0',
  'SFA 18:0',
  'MUFA 12:0',
  'MUFA 14:1',
  'MUFA 16:1',
  'MUFA 18:1',
  'MUFA 20:1',
  'PUFA 18:2',
  'PUFA 18:4',
  'PUFA 20:4',
  'PUFA 22:5 n-3 (DPA)',
  'PUFA 22:6 n-3 (DHA)'
]);

const state = {
  foods: [],
  filteredFoods: [],
  selectedFood: null,
  selectedNutrient: null,
  viewMode: 'foods',
  sortBy: 'name',
  descending: false,
  searchTerm: '',
  favorites: [],
  favoritesChecked: [],
  shoppingVisible: false,
  language: DEFAULT_LANGUAGE,
  uiTranslations: {},
  nutrientDefinitions: [],
  foodTranslations: [],
  history: [],
  historyIndex: -1,
  restoringHistory: false,
  updateInfo: null,
  updateActionMode: 'download'
};

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resultsBody = document.getElementById('resultsBody');
const statusText = document.getElementById('statusText');
const searchSuggestions = document.getElementById('searchSuggestions');
const unitText = document.getElementById('unitText');
const thName = document.getElementById('thName');
const thCategory = document.getElementById('thCategory');
const thValue = document.getElementById('thValue');
const menuBtn = document.getElementById('menuBtn');
const menuModal = document.getElementById('menuModal');
const menuBackdrop = document.getElementById('menuBackdrop');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const menuTitle = document.getElementById('menuTitle');
const menuPanel = document.getElementById('menuPanel');
const languageMenuItem = document.getElementById('languageMenuItem');
const languageMenuItemLabel = document.getElementById('languageMenuItemLabel');
const languageOptionEn = document.getElementById('languageOptionEn');
const languageOptionDe = document.getElementById('languageOptionDe');
const languageOptionEs = document.getElementById('languageOptionEs');
const languageOptionIt = document.getElementById('languageOptionIt');
const languageOptionFr = document.getElementById('languageOptionFr');
const languageOptionEl = document.getElementById('languageOptionEl');
const languageOptionHu = document.getElementById('languageOptionHu');
const languageOptionNl = document.getElementById('languageOptionNl');
const languageOptionNb = document.getElementById('languageOptionNb');
const languageOptionBg = document.getElementById('languageOptionBg');
const languageOptionTr = document.getElementById('languageOptionTr');
const languageOptionRu = document.getElementById('languageOptionRu');
const languageOptionPt = document.getElementById('languageOptionPt');
const languageOptionPl = document.getElementById('languageOptionPl');
const languageOptionRo = document.getElementById('languageOptionRo');
const languageOptionCs = document.getElementById('languageOptionCs');
const languageOptionSv = document.getElementById('languageOptionSv');
const languageOptionSr = document.getElementById('languageOptionSr');
const languageModal = document.getElementById('languageModal');
const languageBackdrop = document.getElementById('languageBackdrop');
const closeLanguageBtn = document.getElementById('closeLanguageBtn');
const languageTitle = document.getElementById('languageTitle');
const shoppingMenuItem = document.getElementById('shoppingMenuItem');
const shoppingMenuItemLabel = document.getElementById('shoppingMenuItemLabel');
const donateMenuItem = document.getElementById('donateMenuItem');
const donateMenuItemLabel = document.getElementById('donateMenuItemLabel');
const infoMenuItem = document.getElementById('infoMenuItem');
const infoMenuItemLabel = document.getElementById('infoMenuItemLabel');
const updateMenuItem = document.getElementById('updateMenuItem');
const updateMenuItemLabel = document.getElementById('updateMenuItemLabel');
const shoppingModal = document.getElementById('shoppingModal');
const shoppingBackdrop = document.getElementById('shoppingBackdrop');
const shoppingListEl = document.getElementById('shoppingList');
const shoppingEmpty = document.getElementById('shoppingEmpty');
const closeShoppingBtn = document.getElementById('closeShoppingBtn');
const shoppingTitle = document.getElementById('shoppingTitle');
const donateModal = document.getElementById('donateModal');
const donateBackdrop = document.getElementById('donateBackdrop');
const closeDonateBtn = document.getElementById('closeDonateBtn');
const donateTitle = document.getElementById('donateTitle');
const donateAddress = document.getElementById('donateAddress');
const infoModal = document.getElementById('infoModal');
const infoBackdrop = document.getElementById('infoBackdrop');
const closeInfoBtn = document.getElementById('closeInfoBtn');
const infoTitle = document.getElementById('infoTitle');
const infoDescription = document.getElementById('infoDescription');
const infoZapstoreBtn = document.getElementById('infoZapstoreBtn');
const infoVersionLine = document.getElementById('infoVersionLine');
const infoGithubLink = document.getElementById('infoGithubLink');
const updateModal = document.getElementById('updateModal');
const updateBackdrop = document.getElementById('updateBackdrop');
const closeUpdateBtn = document.getElementById('closeUpdateBtn');
const updateTitle = document.getElementById('updateTitle');
const updateStatusText = document.getElementById('updateStatusText');
const updateChoices = document.getElementById('updateChoices');
const updateChoiceLabel = document.getElementById('updateChoiceLabel');
const updateZapstoreBtn = document.getElementById('updateZapstoreBtn');
const updateActionBtn = document.getElementById('updateActionBtn');
const updateActionLabel = document.getElementById('updateActionLabel');
const updateDebugText = document.getElementById('updateDebugText');

function getTranslationTable() {
  return state.uiTranslations || {};
}

function t(key, ...args) {
  const table = getTranslationTable();
  const value = table[key];
  if (typeof value === 'function') return value(...args);
  if (key === 'statusEntries') return `${args[0]} ${table.statusEntriesLabel || 'entries'}`;
  return value ?? key;
}

function getFoodTranslationMap() {
  return Object.fromEntries(state.foodTranslations.map(item => [item.key, item]));
}

function getFoodTranslationEntry(name) {
  return getFoodTranslationMap()[name] || null;
}

function getFoodLabel(name) {
  const entry = getFoodTranslationEntry(name);
  return entry?.label || name;
}

function getFoodSearchTexts(food) {
  const entry = getFoodTranslationEntry(food.display_name);
  return [entry?.label || food.display_name, ...(entry?.aliases || [])];
}

function getNutrientMap() {
  return Object.fromEntries(state.nutrientDefinitions.map(item => [item.key, item]));
}

function getNutrientLabel(rawName) {
  const map = getNutrientMap();
  return map[rawName]?.label || rawName;
}

async function loadJson(path) {
  if (location.protocol === 'file:') {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', path, true);
      request.onreadystatechange = () => {
        if (request.readyState !== 4) return;
        if (request.status === 0 || (request.status >= 200 && request.status < 300)) {
          try {
            resolve(JSON.parse(request.responseText));
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Error loading: ${path}`));
        }
      };
      request.onerror = () => reject(new Error(`Error loading: ${path}`));
      request.send();
    });
  }

  const response = await fetch(path);
  if (!response.ok) throw new Error(`Error loading: ${path}`);
  return response.json();
}

async function loadI18n() {
  state.uiTranslations = await loadJson(`i18n/ui.${state.language}.json`);
  state.nutrientDefinitions = await loadJson(`i18n/usad_nutrients.${state.language}.json`);
  state.foodTranslations = await loadJson(`i18n/foods.${state.language}.json`);
}

async function loadFoodsIndex() {
  state.foods = await loadJson('usad_all.json');
  state.filteredFoods = state.foods;
}

function normalizeUnit(unit) {
  if (unit === 'ug') return 'µg';
  if (unit === 'iu') return 'IU';
  return unit;
}

function getDisplayValueAndUnit(value, unit) {
  const normalized = normalizeUnit(unit);
  if (normalized === 'mg' && value >= 1000) return { value: value / 1000, unit: 'g' };
  if (normalized === 'mg' && value > 0 && value < 1) return { value: value * 1000, unit: 'µg' };
  if (normalized === 'µg' && value >= 1000) return { value: value / 1000, unit: 'mg' };
  if (normalized === 'g' && value > 0 && value < 1) return { value: value * 1000, unit: 'mg' };
  return { value, unit: normalized };
}

function getSortValue(value, unit = '') {
  const numericValue = Number(value) || 0;
  const normalized = normalizeUnit(unit);
  if (normalized === 'g') return numericValue * 1000000;
  if (normalized === 'mg') return numericValue * 1000;
  if (normalized === 'µg') return numericValue;
  return numericValue;
}

function formatValue(value, unit = '') {
  const numericValue = Number(value) || 0;
  const rounded = Number(numericValue.toFixed(1));
  return state.language === 'de'
    ? rounded.toFixed(1).replace('.', ',')
    : rounded.toFixed(1);
}

function formatCategory(kind) {
  if (kind === 'animal') {
    return `<span class="category-icon animal" title="${escapeHtml(t('animalTitle'))}">🥩</span>`;
  }
  return `<span class="category-icon plant" title="${escapeHtml(t('plantTitle'))}">🥬</span>`;
}

function loadStoredShoppingState() {
  try {
    const storedList = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]');
    const storedChecked = JSON.parse(localStorage.getItem(STORAGE_KEYS.favoritesChecked) || '[]');
    const storedLanguage = localStorage.getItem(STORAGE_KEYS.language);
    if (Array.isArray(storedList)) {
      state.favorites = storedList.map(item => typeof item === 'string' ? { type: 'food', value: item } : item).filter(Boolean);
    }
    if (Array.isArray(storedChecked)) {
      state.favoritesChecked = storedChecked.map(item => item && item.includes(':') ? item : makeFavoriteId('food', item)).filter(Boolean);
    }
    if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) state.language = storedLanguage;
  } catch (error) {
    console.warn('Could not load shopping state', error);
  }
}

function persistShoppingState() {
  try {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
    localStorage.setItem(STORAGE_KEYS.favoritesChecked, JSON.stringify(state.favoritesChecked));
    localStorage.setItem(STORAGE_KEYS.language, state.language);
  } catch (error) {
    console.warn('Could not save shopping state', error);
  }
}

function makeFavoriteId(type, value) {
  return `${type}:${value}`;
}

function openExternalLink(url) {
  if (window.NutriUpdateBridge?.openExternalUrl) {
    window.NutriUpdateBridge.openExternalUrl(url);
  } else {
    window.open(url, '_blank');
  }
}

function getCurrentVersionCode() {
  return Number(window.__NUTRI_VERSION_CODE__ || 0);
}

function getLastUpdateCheck() {
  return Number(localStorage.getItem(STORAGE_KEYS.updateLastCheck) || '0');
}

function setLastUpdateCheck(timestamp) {
  localStorage.setItem(STORAGE_KEYS.updateLastCheck, String(timestamp));
}

function parseVersionCodeFromTag(tagName) {
  const cleaned = String(tagName || '').trim().replace(/^v/i, '');
  const match = cleaned.match(/^(\d+)\.(\d+)$/);
  if (!match) return null;
  return Number(match[1]) * 100 + Number(match[2]);
}

let updateCheckResolver = null;
let updateCheckSilent = false;

async function checkForUpdates({ silent = false } = {}) {
  updateCheckSilent = silent;
  if (!silent) {
    state.updateActionMode = 'download';
    updateStatusText.textContent = t('updateChecking');
    updateChoices.classList.add('hidden-control');
    updateZapstoreBtn.classList.remove('hidden-control');
    updateChoiceLabel.textContent = t('updateChoiceLabel');
    updateActionLabel.textContent = t('updateDownload');
    updateActionBtn.classList.add('download-badge');
    updateActionBtn.classList.remove('donate-address');
    updateDebugText.classList.add('hidden-control');
  }
  if (!window.NutriUpdateBridge || typeof window.NutriUpdateBridge.checkForUpdates !== 'function') {
    if (!silent) {
      updateStatusText.textContent = t('updateError');
    }
    return;
  }
  return new Promise(resolve => {
    updateCheckResolver = resolve;
    window.NutriUpdateBridge.checkForUpdates();
  });
}

window.onNativeUpdateResult = function (result) {
  const tagName = String(result?.tagName || '');
  const version = tagName.replace(/^v/i, '');
  const versionCode = parseVersionCodeFromTag(tagName);
  const url = String(result?.apkUrl || '');
  const installedVersionCode = getCurrentVersionCode();
  state.updateInfo = { version, versionCode, url };
  setLastUpdateCheck(Date.now());
  if (!updateCheckSilent) {
    updateDebugText.classList.add('hidden-control');
    state.updateActionMode = 'download';
    updateActionLabel.textContent = t('updateDownload');
    updateChoiceLabel.textContent = t('updateChoiceLabel');
    updateActionBtn.classList.add('download-badge');
    updateActionBtn.classList.remove('donate-address');
    updateChoices.classList.add('hidden-control');
    updateZapstoreBtn.classList.remove('hidden-control');
    if (!version || !versionCode || !url) {
      updateStatusText.textContent = t('updateError');
    } else if (versionCode > installedVersionCode) {
      updateStatusText.textContent = `${t('updateAvailable')} ${version}`;
      updateChoices.classList.remove('hidden-control');
    } else {
      updateStatusText.innerHTML = `${escapeHtml(t('updateCurrent'))}<br>Nutri ${escapeHtml(version)}`;
    }
  }
  if (updateCheckResolver) { updateCheckResolver(); updateCheckResolver = null; }
};

window.onNativeUpdateError = function (error) {
  if (!updateCheckSilent) {
    updateStatusText.textContent = t('updateError');
    updateDebugText.classList.add('hidden-control');
    updateChoices.classList.add('hidden-control');
  }
  if (updateCheckResolver) { updateCheckResolver(); updateCheckResolver = null; }
};


window.onNativeNetworkStatus = function (status) {
  if (!status || status.available) return;
  updateModal.classList.remove('hidden-control');
  updateStatusText.textContent = 'Please allow network access for Nutri.';
  state.updateActionMode = 'settings';
  updateActionLabel.textContent = 'Open settings';
  updateActionBtn.classList.remove('download-badge');
  updateActionBtn.classList.add('donate-address');
  updateChoices.classList.remove('hidden-control');
  updateChoiceLabel.textContent = '';
  updateZapstoreBtn.classList.add('hidden-control');
  updateDebugText.classList.add('hidden-control');
};

async function maybeCheckForUpdates() {
  if (Date.now() - getLastUpdateCheck() < UPDATE_CHECK_INTERVAL_MS) return;
  await checkForUpdates({ silent: true });
}

function isFavorite(type, value) {
  return state.favorites.some(item => item && item.type === type && item.value === value);
}

function toggleFavorite(type, value) {
  const id = makeFavoriteId(type, value);
  if (isFavorite(type, value)) {
    state.favorites = state.favorites.filter(item => !(item && item.type === type && item.value === value));
    state.favoritesChecked = state.favoritesChecked.filter(item => item !== id);
  } else {
    state.favorites = [...state.favorites, { type, value }];
  }
  persistShoppingState();
}

function removeFavorite(type, value) {
  const id = makeFavoriteId(type, value);
  state.favorites = state.favorites.filter(item => !(item && item.type === type && item.value === value));
  state.favoritesChecked = state.favoritesChecked.filter(item => item !== id);
  persistShoppingState();
  render();
}

function toggleFavoriteChecked(type, value) {
  const id = makeFavoriteId(type, value);
  if (state.favoritesChecked.includes(id)) {
    state.favoritesChecked = state.favoritesChecked.filter(item => item !== id);
  } else {
    state.favoritesChecked = [...state.favoritesChecked, id];
  }
  persistShoppingState();
  render();
}

function renderShoppingList() {
  shoppingModal.classList.toggle('hidden-control', !state.shoppingVisible);
  shoppingListEl.innerHTML = '';
  shoppingEmpty.classList.toggle('hidden-control', state.favorites.length > 0);

  for (const item of state.favorites) {
    const row = document.createElement('div');
    row.className = 'shopping-item';
    const favoriteId = makeFavoriteId(item.type, item.value);
    if (state.favoritesChecked.includes(favoriteId)) row.classList.add('checked');

    const left = document.createElement('div');
    left.className = 'shopping-item-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.favoritesChecked.includes(favoriteId);
    checkbox.addEventListener('change', () => toggleFavoriteChecked(item.type, item.value));

    const name = document.createElement('button');
    name.type = 'button';
    name.className = 'shopping-name';
    name.textContent = item.type === 'nutrient' ? getNutrientLabel(item.value) : getFoodLabel(item.value);
    name.addEventListener('click', async () => {
      state.shoppingVisible = false;
      renderShoppingList();
      if (item.type === 'nutrient') {
        await openNutrient(item.value);
      } else {
        const food = state.foods.find(entry => entry.display_name === item.value);
        if (food) await openFood(food);
      }
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'shopping-remove-btn';
    removeBtn.textContent = '−';
    removeBtn.setAttribute('aria-label', t('removeFromShoppingShort'));
    removeBtn.addEventListener('click', () => removeFavorite(item.type, item.value));

    left.appendChild(checkbox);
    left.appendChild(name);
    row.appendChild(left);
    row.appendChild(removeBtn);
    shoppingListEl.appendChild(row);
  }
}

function closeMenu() {
  menuModal.classList.add('hidden-control');
  menuBtn.setAttribute('aria-expanded', 'false');
}

function applyTranslations() {
  document.documentElement.lang = state.language;
  menuBtn.setAttribute('aria-label', t('menuOpen'));
  menuTitle.textContent = t('menuOpen');
  languageMenuItemLabel.textContent = t('menuLanguage');
  shoppingMenuItemLabel.textContent = t('menuShopping');
  donateMenuItemLabel.textContent = t('menuDonate');
  infoMenuItemLabel.textContent = t('menuInfo');
  updateMenuItemLabel.textContent = t('menuUpdate');
  searchInput.placeholder = t('searchPlaceholder');
  clearSearchBtn.setAttribute('aria-label', t('clearSearch'));
  shoppingTitle.textContent = t('shoppingTitle');
  languageTitle.textContent = t('menuLanguage');
  donateTitle.textContent = t('donateTitle');
  donateAddress.innerHTML = `<span class="donate-label">${escapeHtml(t('donateAddressLabel'))}</span> <span class="donate-handle">nutriapp@coinos.io</span>`;
  infoTitle.textContent = t('infoTitle');
  updateTitle.textContent = t('updateTitle');
  updateChoiceLabel.textContent = t('updateChoiceLabel');
  updateActionLabel.textContent = t('updateDownload');
  infoDescription.textContent = t('infoDescription');
  infoVersionLine.textContent = `${t('infoVersion')} 1.825`;
  infoGithubLink.textContent = t('infoGithubRepository');
  shoppingEmpty.textContent = t('shoppingEmpty');

  applyTableHeader();
  unitText.textContent = t('unitPer100g');

  const buttons = {
    en: languageOptionEn,
    fr: languageOptionFr,
    de: languageOptionDe,
    el: languageOptionEl,
    es: languageOptionEs,
    it: languageOptionIt,
    hu: languageOptionHu,
    nl: languageOptionNl,
    nb: languageOptionNb,
    bg: languageOptionBg,
    pl: languageOptionPl,
    pt: languageOptionPt,
    ro: languageOptionRo,
    cs: languageOptionCs,
    ru: languageOptionRu,
    tr: languageOptionTr,
    sv: languageOptionSv,
    sr: languageOptionSr
  };
  for (const code of SUPPORTED_LANGUAGES) {
    const button = buttons[code];
    if (!button) continue;
    const label = button.getAttribute('data-label') || button.textContent.trim();
    button.setAttribute('data-label', label);
    button.innerHTML = state.language === code ? `<span class="language-check">✓</span><span>${escapeHtml(label)}</span>` : `<span class="language-check"></span><span>${escapeHtml(label)}</span>`;
  }
}

function isDetailView() {
  return state.viewMode === 'food-detail' || state.viewMode === 'nutrient-detail';
}

function applyTableHeader() {
  thName.replaceChildren();

  const nameHeaderContent = document.createElement('div');
  nameHeaderContent.className = 'name-header-content';

  const nameHeaderLabel = document.createElement('span');
  nameHeaderLabel.textContent = state.viewMode === 'food-detail' ? t('tableNutrient') : t('tableName');
  nameHeaderContent.appendChild(nameHeaderLabel);

  if (state.viewMode === 'foods') {
    const favoriteIcon = document.createElement('img');
    favoriteIcon.className = 'name-header-favorite-icon';
    favoriteIcon.src = 'img/menu_favorites.svg';
    favoriteIcon.alt = '';
    favoriteIcon.setAttribute('aria-hidden', 'true');
    nameHeaderContent.appendChild(favoriteIcon);
  }

  thName.appendChild(nameHeaderContent);
  thCategory.textContent = t('tableCategory');
  thValue.textContent = t('tableValue');
  thValue.colSpan = 2;
}

function getSnapshot() {
  return {
    selectedFood: state.selectedFood?.display_name || null,
    selectedNutrient: state.selectedNutrient,
    viewMode: state.viewMode,
    sortBy: state.sortBy,
    descending: state.descending,
    searchTerm: state.searchTerm,
    language: state.language
  };
}

function snapshotsEqual(a, b) {
  return a.selectedFood === b.selectedFood
    && a.selectedNutrient === b.selectedNutrient
    && a.viewMode === b.viewMode
    && a.sortBy === b.sortBy
    && a.descending === b.descending
    && a.searchTerm === b.searchTerm
    && a.language === b.language;
}

function syncBrowserHistory(snapshot, replace = false) {
  const payload = { ...snapshot };
  if (replace) history.replaceState(payload, '');
  else history.pushState(payload, '');
}

function pushHistory() {
  if (state.restoringHistory) return;
  const snapshot = getSnapshot();
  const current = state.history[state.historyIndex];
  if (current && snapshotsEqual(current, snapshot)) return;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshot);
  state.historyIndex = state.history.length - 1;
  syncBrowserHistory(snapshot, false);
}

async function applySnapshot(snapshot, { fromPopState = false } = {}) {
  state.restoringHistory = true;
  state.sortBy = snapshot.sortBy || 'name';
  state.descending = !!snapshot.descending;
  state.searchTerm = snapshot.searchTerm || '';
  state.language = snapshot.language || DEFAULT_LANGUAGE;
  await loadI18n();

  state.selectedFood = snapshot.selectedFood
    ? state.foods.find(food => food.display_name === snapshot.selectedFood) || null
    : null;
  state.selectedNutrient = snapshot.selectedNutrient || null;
  state.viewMode = snapshot.viewMode || 'foods';

  if (state.selectedFood) searchInput.value = getFoodLabel(state.selectedFood.display_name);
  else if (state.selectedNutrient) searchInput.value = getNutrientLabel(state.selectedNutrient);
  else searchInput.value = state.searchTerm;

  applyTranslations();
  await render();
  if (!fromPopState) syncBrowserHistory(getSnapshot(), true);
  state.restoringHistory = false;
}

function closeSuggestions() {
  searchSuggestions.innerHTML = '';
  searchSuggestions.classList.add('hidden-control');
}

function updateSuggestions() {
  const term = searchInput.value.trim().toLowerCase();
  searchSuggestions.innerHTML = '';
  if (!term) {
    closeSuggestions();
    return;
  }

  const matches = resolveSearchMatches(term);

  const foodItems = matches.foods
    .map(food => ({ type: 'food', label: getFoodLabel(food.display_name), value: food }));

  const nutrientItems = matches.nutrients
    .map(item => ({ type: 'nutrient', label: item.label, value: item.key }));

  const items = [...foodItems, ...nutrientItems];
  if (!items.length) {
    closeSuggestions();
    return;
  }

  for (const item of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-suggestion-item';
    button.textContent = item.label;
    button.addEventListener('click', async () => {
      if (item.type === 'food') {
        await openFood(item.value);
      } else {
        await openNutrient(item.value);
      }
      closeSuggestions();
    });
    searchSuggestions.appendChild(button);
  }

  searchSuggestions.classList.remove('hidden-control');
}

function filterFoods() {
  state.filteredFoods = state.foods;
}

async function openFood(food) {
  state.selectedFood = food;
  state.selectedNutrient = null;
  state.viewMode = 'food-detail';
  state.searchTerm = getFoodLabel(food.display_name);
  searchInput.value = state.searchTerm;
  applyTranslations();
  await render();
  pushHistory();
}

async function openNutrient(nutrientKey) {
  state.selectedNutrient = nutrientKey;
  state.selectedFood = null;
  state.viewMode = 'nutrient-detail';
  state.searchTerm = getNutrientLabel(nutrientKey);
  searchInput.value = state.searchTerm;
  applyTranslations();
  await render();
  pushHistory();
}

function shouldHideNutrient(name) {
  if (HIDDEN_NUTRIENTS.has(name)) return true;
  if (/^(SFA|MUFA|PUFA|TFA)\b/.test(name) || /\b\d{1,2}:\d\b/.test(name)) return true;
  if (/^Fatty acids, total trans-(monoenoic|polyenoic)$/.test(name)) return true;
  if (/^Tocopherol, /.test(name) || /^Tocotrienol, /.test(name)) return true;
  if (/^Vitamin K \(Dihydrophylloquinone\)$/.test(name)) return true;
  return false;
}

function getFoodRows(foodData) {
  return Object.entries(foodData.data || {})
    .filter(([name, entry]) => !shouldHideNutrient(name) && Number(entry?.value || 0) > 0)
    .map(([name, entry]) => ({
      name,
      unit: normalizeUnit(entry.unit || ''),
      value: Number(entry.value || 0)
    }));
}

function getNutrientFoodRows(nutrientKey) {
  return state.foods
    .filter(food => food.data && food.data[nutrientKey] && Number(food.data[nutrientKey].value || 0) > 0)
    .map(food => ({
      food,
      unit: normalizeUnit(food.data[nutrientKey].unit || ''),
      value: Number(food.data[nutrientKey].value || 0),
      baseValue: (() => {
        const unit = normalizeUnit(food.data[nutrientKey].unit || '');
        const factor = { 'µg': 0.000001, 'mg': 0.001, 'g': 1, 'kg': 1000, 'kcal': 1, 'IU': 1 };
        return Number(food.data[nutrientKey].value || 0) * (factor[unit] || 1);
      })()
    }));
}

function createNameCell({ label, onClick, favoriteItem = null, showPlaceholder = false }) {
  const nameCell = document.createElement('td');
  const nameContent = document.createElement('div');
  nameContent.className = 'name-content';

  const nameButton = document.createElement('button');
  nameButton.type = 'button';
  nameButton.className = 'name-button';
  nameButton.textContent = label;
  nameButton.addEventListener('click', onClick);

  nameContent.appendChild(nameButton);

  if (favoriteItem) {
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'add-button';
    addButton.textContent = isFavorite(favoriteItem.type, favoriteItem.value) ? '−' : '+';
    addButton.setAttribute('aria-label', isFavorite(favoriteItem.type, favoriteItem.value) ? t('removeFromShopping') : t('addToShopping'));
    addButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      toggleFavorite(favoriteItem.type, favoriteItem.value);
      state.shoppingVisible = true;
      await render();
    });
    nameContent.appendChild(addButton);
  } else if (showPlaceholder) {
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'add-button add-button-placeholder';
    addButton.textContent = '+';
    addButton.tabIndex = -1;
    addButton.disabled = true;
    addButton.setAttribute('aria-hidden', 'true');
    nameContent.appendChild(addButton);
  }

  nameCell.appendChild(nameContent);
  return nameCell;
}

function createCategoryCell(kind) {
  const categoryCell = document.createElement('td');
  categoryCell.innerHTML = formatCategory(kind);
  return categoryCell;
}

function createValueCell(value) {
  const valueCell = document.createElement('td');
  valueCell.textContent = value;
  return valueCell;
}

function createUnitCell(unit) {
  const unitCell = document.createElement('td');
  unitCell.textContent = unit;
  return unitCell;
}

function textMatchesSearch(text, term) {
  const normalizedText = String(text || '').toLowerCase();
  if (!normalizedText || !term) return false;
  if (normalizedText.includes(term)) return true;
  return normalizedText
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .some(word => word.startsWith(term));
}

function resolveSearchMatches(term) {
  const normalizedTerm = String(term || '').trim().toLowerCase();
  if (!normalizedTerm) return { foods: [], nutrients: [] };

  const foods = state.foods.filter(food =>
    getFoodSearchTexts(food).some(text => textMatchesSearch(text, normalizedTerm))
  );

  const nutrients = state.nutrientDefinitions.filter(item => {
    if (shouldHideNutrient(item.key)) return false;
    const label = String(item.label || '');
    const key = String(item.key || '');
    return textMatchesSearch(label, normalizedTerm) || textMatchesSearch(key, normalizedTerm);
  });

  return { foods, nutrients };
}

function appendStandardRow({ label, onClick, kind, value, unit, favoriteItem = null, showPlaceholder = false }) {
  const tr = document.createElement('tr');
  tr.appendChild(createNameCell({ label, onClick, favoriteItem, showPlaceholder }));
  tr.appendChild(createCategoryCell(kind));
  tr.appendChild(createValueCell(value));
  tr.appendChild(createUnitCell(unit));
  resultsBody.appendChild(tr);
}

async function render() {
  document.body.classList.toggle('detail-view', isDetailView());
  applyTableHeader();
  resultsBody.innerHTML = '';
  renderShoppingList();
  unitText.textContent = t('unitPer100g');

  if (state.viewMode === 'food-detail' && state.selectedFood) {
    const rows = getFoodRows(state.selectedFood);
    rows.sort((a, b) => {
      if (state.sortBy === 'value') {
        return state.descending
          ? getSortValue(b.value, b.unit) - getSortValue(a.value, a.unit)
          : getSortValue(a.value, a.unit) - getSortValue(b.value, b.unit);
      }
      const av = String(a[state.sortBy] || '').toLowerCase();
      const bv = String(b[state.sortBy] || '').toLowerCase();
      if (av < bv) return state.descending ? 1 : -1;
      if (av > bv) return state.descending ? -1 : 1;
      return 0;
    });

    for (const row of rows) {
      const display = getDisplayValueAndUnit(row.value, row.unit);
      appendStandardRow({
        label: getNutrientLabel(row.name),
        onClick: () => openNutrient(row.name),
        kind: state.selectedFood.kind,
        value: formatValue(display.value, display.unit),
        unit: display.unit || '',
        favoriteItem: { type: 'nutrient', value: row.name }
      });
    }

    statusText.textContent = t('statusEntries', rows.length);
    return;
  }

  if (state.viewMode === 'nutrient-detail' && state.selectedNutrient) {
    const rows = getNutrientFoodRows(state.selectedNutrient);
    rows.sort((a, b) => {
      if (state.sortBy === 'value') {
        return state.descending ? b.baseValue - a.baseValue : a.baseValue - b.baseValue;
      }
      if (state.sortBy === 'category') {
        const av = String(a.food.kind || '').toLowerCase();
        const bv = String(b.food.kind || '').toLowerCase();
        if (av < bv) return state.descending ? 1 : -1;
        if (av > bv) return state.descending ? -1 : 1;
        return 0;
      }
      const av = getFoodLabel(a.food.display_name).toLowerCase();
      const bv = getFoodLabel(b.food.display_name).toLowerCase();
      if (av < bv) return state.descending ? 1 : -1;
      if (av > bv) return state.descending ? -1 : 1;
      return 0;
    });

    for (const row of rows) {
      const display = getDisplayValueAndUnit(row.value, row.unit);
      appendStandardRow({
        label: getFoodLabel(row.food.display_name),
        onClick: () => openFood(row.food),
        kind: row.food.kind,
        value: formatValue(display.value, display.unit),
        unit: display.unit || '',
        favoriteItem: { type: 'food', value: row.food.display_name }
      });
    }

    statusText.textContent = t('statusEntries', rows.length);
    return;
  }

  filterFoods();
  const rows = [...state.filteredFoods];
  rows.sort((a, b) => {
    if (state.sortBy === 'value') {
      const av = Number(a.data?.Energy?.value || 0);
      const bv = Number(b.data?.Energy?.value || 0);
      return state.descending ? bv - av : av - bv;
    }
    const av = state.sortBy === 'category' ? String(a.kind || '').toLowerCase() : getFoodLabel(a.display_name).toLowerCase();
    const bv = state.sortBy === 'category' ? String(b.kind || '').toLowerCase() : getFoodLabel(b.display_name).toLowerCase();
    if (av < bv) return state.descending ? 1 : -1;
    if (av > bv) return state.descending ? -1 : 1;
    return 0;
  });

  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="empty" colspan="4">${escapeHtml(t('noEntries'))}</td>`;
    resultsBody.appendChild(tr);
  } else {
    for (const row of rows) {
      const energyEntry = row.data?.Energy;
      let value = '';
      let unit = '';
      if (energyEntry) {
        const display = getDisplayValueAndUnit(Number(energyEntry.value || 0), energyEntry.unit || 'kcal');
        value = formatValue(display.value, display.unit);
        unit = display.unit || '';
      }

      appendStandardRow({
        label: getFoodLabel(row.display_name),
        onClick: () => openFood(row),
        kind: row.kind,
        value,
        unit,
        favoriteItem: { type: 'food', value: row.display_name }
      });
    }
  }

  statusText.textContent = t('statusEntries', rows.length);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setupControls() {
  searchInput.addEventListener('input', () => {
    state.searchTerm = searchInput.value.trim();
    updateSuggestions();
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => closeSuggestions(), 150);
  });

  clearSearchBtn.addEventListener('click', async () => {
    state.searchTerm = '';
    state.selectedFood = null;
    state.selectedNutrient = null;
    state.viewMode = 'foods';
    searchInput.value = '';
    closeSuggestions();
    applyTranslations();
    await render();
    pushHistory();
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => closeSuggestions(), 150);
  });

  const toggleSort = (column) => {
    if (state.sortBy === column) state.descending = !state.descending;
    else {
      state.sortBy = column;
      state.descending = column === 'value';
    }
    render();
  };

  thName.addEventListener('click', () => toggleSort('name'));
  thCategory.addEventListener('click', () => toggleSort('category'));
  thValue.addEventListener('click', () => toggleSort('value'));

  window.addEventListener('popstate', async (event) => {
    const snapshot = event.state;
    if (!snapshot) return;
    const index = state.history.findIndex(item => snapshotsEqual(item, snapshot));
    if (index >= 0) state.historyIndex = index;
    await applySnapshot(snapshot, { fromPopState: true });
  });
}

function setupMenu() {
  menuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const willShow = menuModal.classList.contains('hidden-control');
    menuModal.classList.toggle('hidden-control');
    menuBtn.setAttribute('aria-expanded', String(willShow));
  });

  languageMenuItem.addEventListener('click', () => {
    languageModal.classList.remove('hidden-control');
    closeMenu();
  });

  const selectLanguage = async (language) => {
    state.language = language;
    persistShoppingState();
    await loadI18n();
    applyTranslations();
    if (state.selectedFood) {
      searchInput.value = getFoodLabel(state.selectedFood.display_name);
    } else if (state.selectedNutrient) {
      searchInput.value = getNutrientLabel(state.selectedNutrient);
    }
    await render();
    languageModal.classList.add('hidden-control');
    closeMenu();
  };

  languageOptionEn.addEventListener('click', async () => selectLanguage('en'));
  languageOptionDe.addEventListener('click', async () => selectLanguage('de'));
  languageOptionEs.addEventListener('click', async () => selectLanguage('es'));
  languageOptionIt.addEventListener('click', async () => selectLanguage('it'));
  languageOptionFr.addEventListener('click', async () => selectLanguage('fr'));
  languageOptionEl.addEventListener('click', async () => selectLanguage('el'));
  languageOptionHu.addEventListener('click', async () => selectLanguage('hu'));
  languageOptionNl.addEventListener('click', async () => selectLanguage('nl'));
  languageOptionNb.addEventListener('click', async () => selectLanguage('nb'));
  languageOptionBg.addEventListener('click', async () => selectLanguage('bg'));
  languageOptionTr.addEventListener('click', async () => selectLanguage('tr'));
  languageOptionRu.addEventListener('click', async () => selectLanguage('ru'));
  languageOptionPt.addEventListener('click', async () => selectLanguage('pt'));
  languageOptionPl.addEventListener('click', async () => selectLanguage('pl'));
  languageOptionRo.addEventListener('click', async () => selectLanguage('ro'));
  languageOptionCs.addEventListener('click', async () => selectLanguage('cs'));
  languageOptionSv.addEventListener('click', async () => selectLanguage('sv'));
  languageOptionSr.addEventListener('click', async () => selectLanguage('sr'));
  closeMenuBtn.addEventListener('click', closeMenu);
  menuBackdrop.addEventListener('click', closeMenu);
  closeLanguageBtn.addEventListener('click', () => languageModal.classList.add('hidden-control'));
  languageBackdrop.addEventListener('click', () => languageModal.classList.add('hidden-control'));

  shoppingMenuItem.addEventListener('click', () => {
    state.shoppingVisible = true;
    renderShoppingList();
    closeMenu();
  });

  donateMenuItem.addEventListener('click', () => {
    donateModal.classList.remove('hidden-control');
    closeMenu();
  });

  infoMenuItem.addEventListener('click', () => {
    infoModal.classList.remove('hidden-control');
    closeMenu();
  });

  infoZapstoreBtn.addEventListener('click', () => openExternalLink('https://zapstore.dev/apps/com.zwegen.nutri'));
  updateZapstoreBtn.addEventListener('click', () => openExternalLink('https://zapstore.dev/apps/com.zwegen.nutri'));
  infoGithubLink.addEventListener('click', () => openExternalLink('https://github.com/zwegen/nutri-releases'));

  updateMenuItem.addEventListener('click', async () => {
    updateModal.classList.remove('hidden-control');
    closeMenu();
    await checkForUpdates();
  });

  closeDonateBtn.addEventListener('click', () => donateModal.classList.add('hidden-control'));
  donateBackdrop.addEventListener('click', () => donateModal.classList.add('hidden-control'));
  closeInfoBtn.addEventListener('click', () => infoModal.classList.add('hidden-control'));
  infoBackdrop.addEventListener('click', () => infoModal.classList.add('hidden-control'));
  closeUpdateBtn.addEventListener('click', () => updateModal.classList.add('hidden-control'));
  updateBackdrop.addEventListener('click', () => updateModal.classList.add('hidden-control'));
  updateActionBtn.addEventListener('click', () => {
    if (state.updateActionMode === 'settings') {
      window.NutriUpdateBridge?.openAppSettings?.();
      return;
    }
    const url = state.updateInfo?.url;
    if (!url) return;
    if (window.NutriUpdateBridge?.openExternalUrl) {
      window.NutriUpdateBridge.openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  });
  donateAddress.addEventListener('click', async () => {
    const value = 'nutriapp@coinos.io';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement('input');
        input.value = value;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      donateAddress.textContent = t('donateCopied');
      setTimeout(() => { donateAddress.innerHTML = `<span class="donate-label">${escapeHtml(t('donateAddressLabel'))}</span> <span class="donate-handle">nutriapp@coinos.io</span>`; }, 1200);
    } catch (error) {
      console.warn('Could not copy donate address', error);
    }
  });

  closeShoppingBtn.addEventListener('click', () => {
    state.shoppingVisible = false;
    renderShoppingList();
  });

  shoppingBackdrop.addEventListener('click', () => {
    state.shoppingVisible = false;
    renderShoppingList();
  });

}

async function init() {
  loadStoredShoppingState();
  await loadI18n();
  await loadFoodsIndex();
  applyTranslations();
  setupControls();
  setupMenu();
  await render();
  await maybeCheckForUpdates();
  const initialSnapshot = getSnapshot();
  state.history = [initialSnapshot];
  state.historyIndex = 0;
  syncBrowserHistory(initialSnapshot, true);
}

init().catch(error => {
  console.error(error);
  statusText.textContent = t('statusLoadError');
});
