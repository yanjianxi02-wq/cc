const products = [];

// Public creator sessions must obtain products through the guarded RPC.
const baseProductPool = products.map((product) => ({
  ...product,
  price: normalizePriceValue(product.price),
  stock: normalizeStock(product.stock),
}));
const productPool = baseProductPool.map((product) => ({ ...product }));
const cloudConfig = window.SUPABASE_CONFIG || {};
const cloudEnabled = Boolean(
  cloudConfig.url &&
    cloudConfig.anonKey &&
    window.supabase?.createClient
);
const cloud = cloudEnabled
  ? window.supabase.createClient(cloudConfig.url, cloudConfig.anonKey)
  : null;

const state = {
  selected: new Map(),
  featured: new Set(),
  intents: new Map(),
  remarks: new Map(),
  view: "selection",
  submitted: false,
  submitting: false,
  creatorName: localStorage.getItem("inmanCreatorName") || "",
  adminSubmissions: [],
  adminItems: [],
  adminChannel: null,
  brandProductSearch: "",
  brandFilters: {
    category: "全部",
    level: "全部",
    price: "全部",
    season: "全部",
    stock: "全部",
    visibility: "全部",
    query: "",
  },
  brandSelectedSkus: new Set(),
  brandFrontPreviewVisible: false,
  brandFrontDraggingSku: "",
  adminSavingSku: "",
  productOverrides: new Map(),
  catalogSource: "cloud",
  productSummaryCollapsed: false,
  creatorRequests: [],
  currentSession: null,
  currentUser: null,
  currentRole: "guest",
  creatorProfile: null,
  authView: "creator",
  visibleLimit: 60,
  filters: {
    category: "全部",
    level: "全部",
    price: "全部",
    season: "全部",
    stock: "全部",
    query: ""
  }
};

const els = {
  authShell: document.getElementById("authShell"),
  appShell: document.getElementById("appShell"),
  creatorAuthTab: document.getElementById("creatorAuthTab"),
  brandAuthTab: document.getElementById("brandAuthTab"),
  creatorAuthPanel: document.getElementById("creatorAuthPanel"),
  brandAuthPanel: document.getElementById("brandAuthPanel"),
  creatorLoginEmailInput: document.getElementById("creatorLoginEmailInput"),
  creatorLoginPasswordInput: document.getElementById("creatorLoginPasswordInput"),
  creatorLoginButton: document.getElementById("creatorLoginButton"),
  creatorRequestNameInput: document.getElementById("creatorRequestNameInput"),
  creatorRequestEmailInput: document.getElementById("creatorRequestEmailInput"),
  creatorRequestPasswordInput: document.getElementById("creatorRequestPasswordInput"),
  creatorRequestButton: document.getElementById("creatorRequestButton"),
  portalBrandEmailInput: document.getElementById("portalBrandEmailInput"),
  portalBrandPasswordInput: document.getElementById("portalBrandPasswordInput"),
  portalBrandLoginButton: document.getElementById("portalBrandLoginButton"),
  productGrid: document.getElementById("productGrid"),
  selectedCount: document.getElementById("selectedCount"),
  drawerCount: document.getElementById("drawerCount"),
  selectedDrawer: document.getElementById("selectedDrawer"),
  selectedTable: document.getElementById("selectedTable"),
  quickAnalysis: document.getElementById("quickAnalysis"),
  fullAnalysis: document.getElementById("fullAnalysis"),
  resultCount: document.getElementById("resultCount"),
  categoryFilter: document.getElementById("categoryFilter"),
  levelFilter: document.getElementById("levelFilter"),
  priceFilter: document.getElementById("priceFilter"),
  seasonFilter: document.getElementById("seasonFilter"),
  stockFilter: document.getElementById("stockFilter"),
  searchInput: document.getElementById("searchInput"),
  statusStrip: document.getElementById("statusStrip"),
  brandFiltersPanel: document.getElementById("brandFiltersPanel"),
  brandCategoryFilter: document.getElementById("brandCategoryFilter"),
  brandLevelFilter: document.getElementById("brandLevelFilter"),
  brandPriceFilter: document.getElementById("brandPriceFilter"),
  brandSeasonFilter: document.getElementById("brandSeasonFilter"),
  brandStockFilter: document.getElementById("brandStockFilter"),
  brandVisibilityFilter: document.getElementById("brandVisibilityFilter"),
  creatorNameInput: document.getElementById("creatorNameInput"),
  toast: document.getElementById("toast"),
  userPill: document.getElementById("userPill"),
  userDisplayName: document.getElementById("userDisplayName"),
  userDisplayRole: document.getElementById("userDisplayRole"),
  globalLogoutButton: document.getElementById("globalLogoutButton"),
  modal: document.getElementById("detailModal"),
  detailContent: document.getElementById("detailContent"),
  submitStatus: document.getElementById("submitStatus"),
  adminSubmitted: document.getElementById("adminSubmitted"),
  adminProductCount: document.getElementById("adminProductCount"),
  adminSelected: document.getElementById("adminSelected"),
  adminHotCategory: document.getElementById("adminHotCategory"),
  pendingRequestCount: document.getElementById("pendingRequestCount"),
  productSummary: document.getElementById("productSummary"),
  creatorSummary: document.getElementById("creatorSummary"),
  creatorRequestSummary: document.getElementById("creatorRequestSummary"),
  adminLoginPanel: document.getElementById("adminLoginPanel"),
  adminDashboard: document.getElementById("adminDashboard"),
  adminEmailInput: document.getElementById("adminEmailInput"),
  adminPasswordInput: document.getElementById("adminPasswordInput"),
  adminLoginButton: document.getElementById("adminLoginButton"),
  adminLogoutButton: document.getElementById("adminLogoutButton"),
  adminRefreshButton: document.getElementById("adminRefreshButton"),
  adminExportButton: document.getElementById("adminExportButton"),
  productSummaryCard: document.getElementById("productSummaryCard"),
  productSummaryPanel: document.getElementById("productSummaryPanel"),
  productSummaryToggle: document.getElementById("productSummaryToggle"),
  brandLoginPanel: document.getElementById("brandLoginPanel"),
  brandDashboard: document.getElementById("brandDashboard"),
  brandEmailInput: document.getElementById("brandEmailInput"),
  brandPasswordInput: document.getElementById("brandPasswordInput"),
  brandLoginButton: document.getElementById("brandLoginButton"),
  brandLogoutButton: document.getElementById("brandLogoutButton"),
  brandRefreshButton: document.getElementById("brandRefreshButton"),
  brandSelectAll: document.getElementById("brandSelectAll"),
  brandBatchSelectedCount: document.getElementById("brandBatchSelectedCount"),
  brandBatchVisibility: document.getElementById("brandBatchVisibility"),
  brandBatchApplyButton: document.getElementById("brandBatchApplyButton"),
  brandAddToFrontButton: document.getElementById("brandAddToFrontButton"),
  brandFrontQueueSummary: document.getElementById("brandFrontQueueSummary"),
  brandFrontQueue: document.getElementById("brandFrontQueue"),
  brandFrontPreview: document.getElementById("brandFrontPreview"),
  brandFrontPreviewButton: document.getElementById("brandFrontPreviewButton"),
  brandFrontExportButton: document.getElementById("brandFrontExportButton"),
  brandFrontClearButton: document.getElementById("brandFrontClearButton"),
  brandNewProductsFile: document.getElementById("brandNewProductsFile"),
  brandNewProductsButton: document.getElementById("brandNewProductsButton"),
  brandCatalogMeta: document.getElementById("brandCatalogMeta"),
  brandImportFile: document.getElementById("brandImportFile"),
  brandImportButton: document.getElementById("brandImportButton"),
  brandProductSearch: document.getElementById("brandProductSearch"),
  brandProductEditor: document.getElementById("brandProductEditor")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniqueValues(key) {
  return [...new Set(productPool.map((product) => product[key]).filter(Boolean))];
}

function initFilters() {
  const categories = uniqueValues("category").sort((a, b) => a.localeCompare(b, "zh-CN"));
  if (els.categoryFilter) {
    els.categoryFilter.innerHTML = "";
    els.categoryFilter.append(new Option("全部品类", "全部"));
  }
  if (els.brandCategoryFilter) {
    els.brandCategoryFilter.innerHTML = "";
    els.brandCategoryFilter.append(new Option("全部类目", "全部"));
  }
  categories.forEach((category) => {
    els.categoryFilter.append(new Option(category, category));
    els.brandCategoryFilter?.append(new Option(category, category));
  });
  if (!categories.includes(state.filters.category)) state.filters.category = "全部";
  if (!categories.includes(state.brandFilters.category)) state.brandFilters.category = "全部";
  if (els.categoryFilter) els.categoryFilter.value = state.filters.category;
  if (els.brandCategoryFilter) els.brandCategoryFilter.value = state.brandFilters.category;
}

function renderCatalogMeta() {
  if (!els.brandCatalogMeta) return;
  const visibleCount = productPool.filter((product) => !product.hidden).length;
  const hiddenCount = productPool.length - visibleCount;
  const sourceText = state.catalogSource === "cloud" ? "云端商品池" : "本地BI商品池";
  els.brandCatalogMeta.textContent = `当前${sourceText} ${productPool.length} 款，达人可见 ${visibleCount} 款${hiddenCount ? `，不可见 ${hiddenCount} 款` : ""}`;
}

function refreshProductViews() {
  applyProductOverrides();
  pruneHiddenSelections();
  initFilters();
  renderProducts();
  renderSelected();
  renderAdmin();
  renderBrandProductEditor();
  renderCatalogMeta();
}

function replaceBaseProductPool(nextProducts, source = "cloud") {
  baseProductPool.splice(
    0,
    baseProductPool.length,
    ...nextProducts.map((product) => ({
      ...product,
      price: normalizePriceValue(product.price),
      stock: normalizeStock(product.stock),
    }))
  );
  state.catalogSource = source;
  state.brandSelectedSkus.clear();
  refreshProductViews();
}

function matchesPrice(product, range) {
  if (range === "全部") return true;
  const price = normalizePriceValue(product.price);
  if (price == null) return false;
  if (range === "1-50") return price >= 1 && price < 50;
  if (range === "50-100") return price >= 50 && price < 100;
  if (range === "100-300") return price >= 100 && price < 300;
  if (range === "300-500") return price >= 300 && price < 500;
  if (range === "500-1000") return price >= 500 && price <= 1000;
  return price > 1000;
}

function normalizeSeason(value) {
  const text = String(value || "").trim();
  if (!text) return "秋";
  if (text.includes("春")) return "春";
  if (text.includes("夏")) return "夏";
  if (text.includes("秋")) return "秋";
  if (text.includes("冬")) return "冬";
  return text;
}

function normalizeStock(value) {
  if (value == null || value === "") return null;
  const stock = Number(String(value).replace(/[,\s件]/g, ""));
  return Number.isFinite(stock) ? Math.trunc(stock) : null;
}

function normalizePresaleStock(value) {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, 100);
}

function stockDisplay(value) {
  const stock = normalizeStock(value);
  return stock == null ? "暂未配置" : `${new Intl.NumberFormat("zh-CN").format(stock)} 件`;
}

function presaleStockDisplay(value) {
  return normalizePresaleStock(value) || "暂未配置";
}

function normalizeCreatorSortPriority(value) {
  if (value == null || value === "") return null;
  const priority = Number(String(value).trim());
  return Number.isInteger(priority) && priority > 0 && priority <= 9999 ? priority : null;
}

function productSortPriority(product, override = state.productOverrides.get(product.sku)) {
  return state.productOverrides.has(product.sku)
    ? normalizeCreatorSortPriority(override?.creator_sort_priority)
    : normalizeCreatorSortPriority(product.creator_sort_priority);
}

function compareCreatorProductOrder(a, b) {
  const priorityA = normalizeCreatorSortPriority(a.creator_sort_priority) ?? Number.MAX_SAFE_INTEGER;
  const priorityB = normalizeCreatorSortPriority(b.creator_sort_priority) ?? Number.MAX_SAFE_INTEGER;
  const byPriority = priorityA - priorityB;
  if (byPriority !== 0) return byPriority;
  const stockA = normalizeStock(a.stock) ?? -1;
  const stockB = normalizeStock(b.stock) ?? -1;
  const byStock = stockB - stockA;
  if (byStock !== 0) return byStock;
  return new Date(b.date || 0) - new Date(a.date || 0);
}

function getBrandFrontQueue() {
  return productPool
    .filter((product) => !product.hidden && normalizeCreatorSortPriority(product.creator_sort_priority))
    .sort(compareCreatorProductOrder);
}

function getProductsWithManualPriority() {
  return productPool
    .filter((product) => normalizeCreatorSortPriority(product.creator_sort_priority))
    .sort(compareCreatorProductOrder);
}

function getCreatorDisplayOrder() {
  return productPool.filter((product) => !product.hidden).sort(compareCreatorProductOrder);
}

function matchesSeason(product, season) {
  if (season === "全部") return true;
  return normalizeSeason(product.season) === season;
}

function matchesStock(product, range) {
  if (range === "全部") return true;
  const stock = normalizeStock(product.stock);
  if (stock == null) return false;
  if (range === "0-100") return stock < 100;
  if (range === "100-500") return stock >= 100 && stock <= 500;
  return stock > 500;
}

function filteredProducts() {
  const query = state.filters.query.trim().toLowerCase();
  return productPool
    .filter((product) => {
      if (product.hidden) return false;
      const categoryMatch = state.filters.category === "全部" || product.category === state.filters.category;
      const levelMatch = state.filters.level === "全部" || product.level === state.filters.level;
      const queryMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.style.toLowerCase().includes(query);
      return (
        categoryMatch &&
        levelMatch &&
        matchesPrice(product, state.filters.price) &&
        matchesSeason(product, state.filters.season) &&
        matchesStock(product, state.filters.stock) &&
        queryMatch
      );
    })
    .sort(compareCreatorProductOrder);
}

function levelClass(level) {
  return level.toLowerCase();
}

function priceText(product) {
  const price = normalizePriceValue(product.price);
  return price == null ? "价格待确认" : `￥${price}`;
}

function syncRemarkFields(id, value, source) {
  document.querySelectorAll(`[data-remark="${id}"]`).forEach((field) => {
    if (field === source) return;
    field.value = value;
  });
}

function applyProductOverrides() {
  productPool.splice(
    0,
    productPool.length,
    ...baseProductPool.map((product) => {
      const override = state.productOverrides.get(product.sku) || {};
      return {
        ...product,
        price: normalizePriceValue(override.price ?? product.price),
        stock: normalizeStock(product.stock),
        img: override.image_url || product.img,
        level: override.plan_level || product.level,
        style: override.style || product.style,
        creator_sort_priority: productSortPriority(product, override),
        hidden: Boolean(override.is_hidden),
      };
    })
  );
}

function pruneHiddenSelections() {
  const availableIds = new Set(productPool.filter((product) => !product.hidden).map((product) => product.id));
  [...state.selected.keys()].forEach((id) => {
    if (!availableIds.has(id)) {
      state.selected.delete(id);
      state.featured.delete(id);
      state.intents.delete(id);
      state.remarks.delete(id);
    }
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsDataURL(file);
  });
}

function isAdminEmail(email) {
  return String(email || "").toLowerCase() === "yanjianxi02@gmail.com";
}

function setAuthView(view) {
  state.authView = view;
  els.creatorAuthTab.classList.toggle("active", view === "creator");
  els.brandAuthTab.classList.toggle("active", view === "brand");
  els.creatorAuthPanel.classList.toggle("hidden", view !== "creator");
  els.brandAuthPanel.classList.toggle("hidden", view !== "brand");
}

function navButtonsFor(view) {
  return document.querySelectorAll(`.nav-item[data-view="${view}"]`);
}

function setRoleUi(role) {
  state.currentRole = role;
  const creatorOnly = role === "creator";
  navButtonsFor("admin").forEach((button) => button.classList.toggle("hidden", creatorOnly));
  navButtonsFor("brand").forEach((button) => button.classList.toggle("hidden", creatorOnly));
  els.userPill.classList.toggle("hidden", role === "guest");
  if (role === "creator") {
    els.creatorNameInput.readOnly = true;
    els.creatorNameInput.value = state.creatorProfile?.creator_name || "";
  } else {
    els.creatorNameInput.readOnly = false;
    els.creatorNameInput.value = state.creatorName;
  }
}

function setAppVisibility(loggedIn) {
  els.authShell.classList.toggle("hidden", loggedIn);
  els.appShell.classList.toggle("hidden", !loggedIn);
}

function priceBand(product) {
  const price = normalizePriceValue(product.price);
  if (price == null) return "待确认";
  if (price < 150) return "149以下";
  if (price < 200) return "150-199";
  if (price < 250) return "200-249";
  if (price < 300) return "250-299";
  return "300以上";
}

function countBy(list, keyGetter) {
  return list.reduce((acc, item) => {
    const key = keyGetter(item) || "未标注";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sortedEntries(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"));
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function averagePrice(list) {
  const prices = list
    .map((product) => normalizePriceValue(product.price))
    .filter((price) => price != null);
  if (!prices.length) return "-";
  return `￥${Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)}`;
}

function chartBars(entries, total, limit = 5) {
  if (!entries.length) return `<div class="empty tiny">暂无数据</div>`;
  return entries
    .slice(0, limit)
    .map(([label, value]) => {
      const share = percent(value, total);
      return `
        <div class="chart-row">
          <div class="chart-row-top">
            <span>${escapeHtml(label)}</span>
            <strong>${share}%</strong>
          </div>
          <div class="bar-track"><span style="width:${share}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function donutStyle(entries, total) {
  if (!total || !entries.length) return "background:#eef2f0";
  const colors = ["#0c7c59", "#276ef1", "#c34a36", "#a17124", "#7a64d8", "#5e7785"];
  let start = 0;
  const slices = entries.slice(0, 6).map(([_, value], index) => {
    const end = start + (value / total) * 360;
    const slice = `${colors[index % colors.length]} ${start}deg ${end}deg`;
    start = end;
    return slice;
  });
  return `background:conic-gradient(${slices.join(",")})`;
}

function suggestionTags(selectedProducts, analytics) {
  if (!selectedProducts.length) return ["先选择商品"];
  const selectedCategories = new Set(selectedProducts.map((product) => product.category));
  const poolTopCategories = sortedEntries(countBy(productPool, (product) => product.category)).slice(0, 8);
  const missing = poolTopCategories
    .filter(([category]) => !selectedCategories.has(category))
    .slice(0, 3)
    .map(([category]) => `补充${category}`);
  const tags = [...missing];

  const topCategory = analytics.categoryEntries[0];
  if (topCategory && selectedProducts.length >= 3 && percent(topCategory[1], selectedProducts.length) >= 60) {
    tags.push(`${topCategory[0]}偏集中`);
  }
  if (!selectedProducts.some((product) => product.price != null && product.price >= 250)) tags.push("补充高价带");
  if (!selectedProducts.some((product) => product.price != null && product.price < 150)) tags.push("补充入门价");
  if (!analytics.featuredCount) tags.push("标记重点款");
  return [...new Set(tags)].slice(0, 5);
}

function selectionAnalytics(selectedProducts) {
  const total = selectedProducts.length;
  const priceEntries = sortedEntries(countBy(selectedProducts, priceBand));
  const categoryEntries = sortedEntries(countBy(selectedProducts, (product) => product.category));
  const styleEntries = sortedEntries(countBy(selectedProducts, (product) => product.style));
  const levelEntries = sortedEntries(countBy(selectedProducts, (product) => product.level || "未标注"));
  const featuredCount = selectedProducts.filter((product) => state.featured.has(product.id)).length;
  const topPrice = priceEntries[0]?.[0] || "-";
  const topCategory = categoryEntries[0]?.[0] || "-";
  const topStyle = styleEntries[0]?.[0] || "-";
  const healthScore = Math.min(
    100,
    Math.round(
      (Math.min(categoryEntries.length, 4) / 4) * 35 +
        (Math.min(priceEntries.filter(([label]) => label !== "待确认").length, 3) / 3) * 30 +
        (Math.min(styleEntries.length, 4) / 4) * 25 +
        (featuredCount ? 10 : 0)
    )
  );

  const analytics = {
    total,
    priceEntries,
    categoryEntries,
    styleEntries,
    levelEntries,
    featuredCount,
    topPrice,
    topCategory,
    topStyle,
    avgPrice: averagePrice(selectedProducts),
    healthScore
  };
  analytics.suggestions = suggestionTags(selectedProducts, analytics);
  return analytics;
}

function renderAnalysis() {
  const selectedProducts = [...state.selected.values()];
  const analytics = selectionAnalytics(selectedProducts);

  if (!selectedProducts.length) {
    const emptyAnalysis = `<div class="empty">选择商品后自动生成选款分析</div>`;
    els.quickAnalysis.innerHTML = emptyAnalysis;
    els.fullAnalysis.innerHTML = emptyAnalysis;
    return;
  }

  els.quickAnalysis.innerHTML = `
    <div class="analysis-head">
      <div>
        <h3>实时小分析</h3>
        <p>${analytics.topCategory} · ${analytics.topPrice}</p>
      </div>
      <strong>${analytics.healthScore}</strong>
    </div>
    <div class="mini-kpis">
      <div><span>重点</span><b>${analytics.featuredCount}</b></div>
      <div><span>均价</span><b>${analytics.avgPrice}</b></div>
    </div>
    <div class="mini-chart">
      ${chartBars(analytics.categoryEntries, analytics.total, 3)}
    </div>
    <div class="suggestion-tags">
      ${analytics.suggestions.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;

  els.fullAnalysis.innerHTML = `
    <div class="analysis-head full">
      <div>
        <h2>智能选款分析</h2>
        <p>提交前检查价格、品类、风格和重点款结构</p>
      </div>
      <div class="health-score">
        <span>健康度</span>
        <strong>${analytics.healthScore}</strong>
      </div>
    </div>
    <div class="analysis-kpis">
      <div><span>已选</span><strong>${analytics.total}款</strong></div>
      <div><span>重点款</span><strong>${analytics.featuredCount}款</strong></div>
      <div><span>平均价</span><strong>${analytics.avgPrice}</strong></div>
      <div><span>主风格</span><strong>${escapeHtml(analytics.topStyle)}</strong></div>
    </div>
    <div class="analysis-grid">
      <div class="analysis-card donut-card">
        <div>
          <h3>价格带占比</h3>
          <p>${escapeHtml(analytics.topPrice)}</p>
        </div>
        <div class="donut" style="${donutStyle(analytics.priceEntries, analytics.total)}"><span>${analytics.total}</span></div>
        <div class="chart-list">${chartBars(analytics.priceEntries, analytics.total, 5)}</div>
      </div>
      <div class="analysis-card">
        <h3>品类占比</h3>
        <div class="chart-list">${chartBars(analytics.categoryEntries, analytics.total, 6)}</div>
      </div>
      <div class="analysis-card">
        <h3>风格占比</h3>
        <div class="chart-list">${chartBars(analytics.styleEntries, analytics.total, 6)}</div>
      </div>
      <div class="analysis-card">
        <h3>品牌计划等级</h3>
        <div class="level-stack">
          ${analytics.levelEntries
            .map(
              ([level, value]) => `
                <div>
                  <span class="level ${levelClass(level === "未标注" ? "" : level)}">${escapeHtml(level)}</span>
                  <strong>${value}款</strong>
                  <small>${percent(value, analytics.total)}%</small>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="analysis-card suggestion-card">
        <h3>建议补充</h3>
        <div class="suggestion-tags large">
          ${analytics.suggestions.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderProducts() {
  const list = filteredProducts();
  const visibleList = list.slice(0, state.visibleLimit);
  els.resultCount.textContent = `${list.length} 款`;
  const cards = visibleList
    .map((product) => {
      const selected = state.selected.has(product.id);
      const featured = state.featured.has(product.id);
      const remark = state.remarks.get(product.id) || "";
      return `
        <article class="product-card ${selected ? "selected" : ""} ${featured ? "featured" : ""}">
          <div class="image-wrap">
            <img src="${product.img}" alt="${product.name}" loading="lazy" />
            <div class="tag-row">
              <span class="tag">${product.tag}</span>
              ${product.level ? `<span class="level ${levelClass(product.level)}">${product.level}</span>` : ""}
            </div>
            <button class="image-preview-button" data-action="preview" data-id="${product.id}" aria-label="放大查看图片">
              <i data-lucide="eye"></i>
            </button>
            <span class="selected-badge">${featured ? "重点款" : "已选"}</span>
          </div>
          <div class="product-body">
            <div class="product-title">
              <h3>${product.name}</h3>
              <span class="sku">${product.sku}</span>
            </div>
            <p class="product-meta">风格线：${product.style}</p>
            <div class="price-line">
              <span class="price">${priceText(product)}</span>
              <span class="date">${product.date}</span>
            </div>
            <div class="card-actions">
              <button class="mini-button select" data-action="toggle" data-id="${product.id}" title="${selected ? "取消选款" : "选择商品"}" aria-label="${selected ? "取消选款" : "选择商品"}">
                <i data-lucide="${selected ? "check" : "plus"}"></i>
                <span>${selected ? "取消" : "选款"}</span>
              </button>
              <button class="mini-button feature ${featured ? "active" : ""}" data-action="feature" data-id="${product.id}" title="设为重点款" aria-label="设为重点款">
                <i data-lucide="star"></i>
                <span>重点款</span>
              </button>
              <button class="mini-button" data-action="detail" data-id="${product.id}" title="查看详情" aria-label="查看详情">
                <i data-lucide="panel-right-open"></i>
                <span>详情</span>
              </button>
            </div>
            ${
              selected
                ? `
                  <label class="card-remark">
                    <span>达人备注</span>
                    <textarea
                      rows="2"
                      placeholder=""
                      data-remark="${product.id}"
                    >${escapeHtml(remark)}</textarea>
                  </label>
                `
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
  const loadMore =
    visibleList.length < list.length
      ? `<button class="load-more-button" data-action="load-more">
          <span>继续加载</span>
          <small>已显示 ${visibleList.length} / ${list.length} 款</small>
        </button>`
      : "";
  els.productGrid.innerHTML = cards + loadMore;
  refreshIcons();
}

function renderSelected() {
  const selectedProducts = [...state.selected.values()];
  els.selectedCount.textContent = selectedProducts.length;
  els.drawerCount.textContent = selectedProducts.length;
  els.submitStatus.textContent = state.submitted ? "已提交" : "选款中";

  if (!selectedProducts.length) {
    els.selectedDrawer.innerHTML = `<div class="empty">还没有选择商品</div>`;
    els.selectedTable.innerHTML = `<div class="empty">还没有选择商品</div>`;
  } else {
    els.selectedDrawer.innerHTML = selectedProducts
      .map(
        (product) => `
          <div class="selected-item">
            <img src="${product.img}" alt="${product.name}" />
            <div>
              <strong>${product.name}${state.featured.has(product.id) ? ` <span class="featured-label">重点款</span>` : ""}</strong>
              <small>${product.sku} · ${priceText(product)}</small>
            </div>
            <button class="icon-button" data-action="remove" data-id="${product.id}" aria-label="移除">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        `
      )
      .join("");

    els.selectedTable.innerHTML = selectedProducts
      .map(
        (product) => `
          <div class="selected-row">
            <img src="${product.img}" alt="${product.name}" />
            <div>
              <strong>${product.name} <span class="sku">${product.sku}</span>${state.featured.has(product.id) ? ` <span class="featured-label">重点款</span>` : ""}</strong>
              <p class="product-meta">${product.category} · ${product.style}</p>
              <span class="price">${priceText(product)}</span>
            </div>
            <label>
              <span>意向类型</span>
              <select data-intent="${product.id}">
                ${["直播挂车", "试穿寄样", "短视频种草", "重点推荐"]
                  .map((intent) => {
                    const currentIntent =
                      state.intents.get(product.id) ||
                      (state.featured.has(product.id) ? "重点推荐" : "直播挂车");
                    return `<option ${currentIntent === intent ? "selected" : ""}>${intent}</option>`;
                  })
                  .join("")}
              </select>
            </label>
            <label>
              <span>备注</span>
              <input
                placeholder="颜色 / 尺码 / 搭配需求"
                data-remark="${product.id}"
                value="${escapeHtml(state.remarks.get(product.id) || "")}"
              />
            </label>
            <button class="icon-button" data-action="remove" data-id="${product.id}" aria-label="移除">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        `
      )
      .join("");
  }

  renderAnalysis();
  renderAdmin();
  refreshIcons();
}

function renderAdmin() {
  els.adminProductCount.textContent = productPool.length;
  els.adminSubmitted.textContent = state.adminSubmissions.length;
  els.adminSelected.textContent = state.adminItems.length;
  const pendingRequests = state.creatorRequests.filter((item) => item.status === "pending");
  els.pendingRequestCount.textContent = `${pendingRequests.length} 待审核`;

  const categoryCounts = state.adminItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const hotCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  els.adminHotCategory.textContent = hotCategory ? hotCategory[0] : "-";

  const productCounts = state.adminItems.reduce((acc, item) => {
    if (!acc[item.sku]) {
      acc[item.sku] = {
        ...item,
        count: 0,
        featuredCount: 0,
      };
    }
    acc[item.sku].count += 1;
    if (item.is_featured) acc[item.sku].featuredCount += 1;
    return acc;
  }, {});

  const rankedProducts = Object.values(productCounts).sort(
    (a, b) => b.featuredCount - a.featuredCount || b.count - a.count
  );

  els.productSummary.innerHTML = rankedProducts.length
    ? rankedProducts
        .slice(0, 100)
        .map(
          (item) => `
            <div class="summary-row">
              <div>
                <strong>${escapeHtml(item.product_name)} ${escapeHtml(item.sku)}
                  ${item.featuredCount ? `<span class="featured-label">${item.featuredCount}人重点</span>` : ""}
                </strong>
                <small>${escapeHtml(item.category)} · ${escapeHtml(item.plan_level || "未标注")}级</small>
              </div>
              <strong>${item.count}人选择</strong>
            </div>
          `
        )
        .join("")
    : `<div class="empty">暂无云端选款记录</div>`;

  els.creatorSummary.innerHTML = state.adminSubmissions.length
    ? state.adminSubmissions
        .map(
          (submission) => `
            <div class="summary-row">
              <div>
                <strong>${escapeHtml(submission.creator_name)}</strong>
                <small>${new Date(submission.submitted_at).toLocaleString("zh-CN")}</small>
              </div>
              <strong>${submission.item_count} 款</strong>
            </div>
          `
        )
        .join("")
    : `<div class="empty">暂无达人提交记录</div>`;

  els.creatorRequestSummary.innerHTML = state.creatorRequests.length
    ? state.creatorRequests
        .map(
          (request) => `
            <div class="summary-row request-row">
              <div>
                <strong>${escapeHtml(request.creator_name)}</strong>
                <small>${escapeHtml(request.email)} · ${new Date(request.requested_at).toLocaleString("zh-CN")}</small>
                ${request.review_note ? `<small>${escapeHtml(request.review_note)}</small>` : ""}
              </div>
              <div class="request-actions">
                <span class="request-status status-${request.status}">${request.status === "pending" ? "待审核" : request.status === "approved" ? "已开通" : "已驳回"}</span>
                ${request.status === "pending"
                  ? `
                    <button class="ghost-button" data-action="reject-request" data-id="${request.id}">驳回</button>
                    <button class="primary-button" data-action="approve-request" data-id="${request.id}">确认开通</button>
                  `
                  : ""}
              </div>
            </div>
          `
        )
        .join("")
    : `<div class="empty">暂无达人开户申请</div>`;

  renderProductSummaryCollapse();
}

function renderProductSummaryCollapse() {
  if (!els.productSummaryPanel || !els.productSummaryToggle || !els.productSummaryCard) return;
  els.productSummaryPanel.classList.toggle("hidden", state.productSummaryCollapsed);
  els.productSummaryCard.classList.toggle("collapsed-card", state.productSummaryCollapsed);
  const label = els.productSummaryToggle.querySelector("span");
  if (label) label.textContent = "商品热度汇总";
  const icon = els.productSummaryToggle.querySelector("i");
  if (icon) icon.setAttribute("data-lucide", state.productSummaryCollapsed ? "chevron-down" : "chevron-up");
  refreshIcons();
}

function visibilityText(product) {
  return product.hidden ? "达人不可见" : "达人可见";
}

function renderBrandBatchState(visibleSkus = []) {
  if (!visibleSkus.length) {
    visibleSkus = [...document.querySelectorAll("[data-brand-select]")].map(
      (checkbox) => checkbox.dataset.brandSelect
    );
  }
  if (els.brandBatchSelectedCount) {
    els.brandBatchSelectedCount.textContent = `已选 ${state.brandSelectedSkus.size} 款`;
  }
  if (els.brandBatchApplyButton) {
    els.brandBatchApplyButton.disabled = !state.brandSelectedSkus.size || Boolean(state.adminSavingSku);
  }
  if (els.brandAddToFrontButton) {
    els.brandAddToFrontButton.disabled = !state.brandSelectedSkus.size || Boolean(state.adminSavingSku);
  }
  if (els.brandSelectAll) {
    const selectable = visibleSkus.length ? visibleSkus : [];
    const selectedInView = selectable.filter((sku) => state.brandSelectedSkus.has(sku)).length;
    els.brandSelectAll.checked = Boolean(selectable.length && selectedInView === selectable.length);
    els.brandSelectAll.indeterminate = Boolean(selectedInView && selectedInView < selectable.length);
  }
}

function renderBrandFrontQueue() {
  if (!els.brandFrontQueue || !els.brandFrontQueueSummary || !els.brandFrontPreview) return;
  const queue = getBrandFrontQueue();
  els.brandFrontQueueSummary.innerHTML = `
    <strong>${queue.length} 款</strong>
    <span>已进入达人端前排推荐</span>
  `;
  els.brandFrontQueue.innerHTML = queue.length
    ? queue
        .map(
          (product, index) => `
            <article class="front-queue-item" data-front-sku="${escapeHtml(product.sku)}" draggable="true">
              <span class="front-drag-handle" aria-hidden="true"><i data-lucide="grip-vertical"></i></span>
              <strong class="front-rank">#${index + 1}</strong>
              <img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" />
              <div class="front-queue-meta">
                <strong>${escapeHtml(product.name)}</strong>
                <span>${escapeHtml(product.sku)} · ${escapeHtml(product.level || "未标注")}</span>
              </div>
              <button class="icon-button front-remove-button" data-action="front-remove" data-id="${escapeHtml(product.sku)}" type="button" aria-label="移出前排">
                <i data-lucide="x"></i>
              </button>
            </article>
          `
        )
        .join("")
    : `<div class="front-queue-empty">暂未设置前排推荐，达人端将按库存和上新日期自动排序。</div>`;

  const preview = getCreatorDisplayOrder().slice(0, 20);
  els.brandFrontPreview.classList.toggle("hidden", !state.brandFrontPreviewVisible);
  els.brandFrontPreview.innerHTML = preview
    .map(
      (product, index) => `
        <article class="front-preview-card">
          <strong>#${index + 1}</strong>
          <img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" />
          <span>${escapeHtml(product.name)}</span>
          <small>${escapeHtml(product.sku)}</small>
        </article>
      `
    )
    .join("");

  if (els.brandFrontPreviewButton) {
    const label = els.brandFrontPreviewButton.querySelector("span");
    if (label) label.textContent = state.brandFrontPreviewVisible ? "收起达人端预览" : "预览达人端前20";
  }
}

function renderBrandProductEditor() {
  if (!els.brandProductEditor) return;
  const query = state.brandFilters.query.trim().toLowerCase();
  const list = productPool
    .filter((product) => {
      const categoryMatch =
        state.brandFilters.category === "全部" || product.category === state.brandFilters.category;
      const levelMatch =
        state.brandFilters.level === "全部" || product.level === state.brandFilters.level;
      const visibilityMatch =
        state.brandFilters.visibility === "全部" ||
        (state.brandFilters.visibility === "visible" && !product.hidden) ||
        (state.brandFilters.visibility === "hidden" && product.hidden);
      const seasonMatch = matchesSeason(product, state.brandFilters.season);
      const stockMatch = matchesStock(product, state.brandFilters.stock);
      const queryMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.style.toLowerCase().includes(query);
      return (
        categoryMatch &&
        levelMatch &&
        visibilityMatch &&
        matchesPrice(product, state.brandFilters.price) &&
        seasonMatch &&
        stockMatch &&
        queryMatch
      );
    })
    .slice(0, 40);

  const visibleSkus = list.map((product) => product.sku);
  els.brandProductEditor.innerHTML = list.length
    ? list
        .map((product) => {
          const override = state.productOverrides.get(product.sku) || {};
          const baseProduct = baseProductPool.find((item) => item.sku === product.sku) || product;
          const saving = state.adminSavingSku === product.sku;
          const hasOverrideImage = Boolean(override.image_url);
          const checked = state.brandSelectedSkus.has(product.sku);
          const sortPriority = productSortPriority(product, override);
          return `
            <div class="editor-row">
              <label class="editor-check">
                <input type="checkbox" data-brand-select="${product.sku}" ${checked ? "checked" : ""} />
              </label>
              <div class="editor-image">
                <img src="${product.img}" alt="${product.name}" />
                <button class="image-preview-button editor-preview-button" data-action="preview" data-id="${product.id}" aria-label="放大查看图片">
                  <i data-lucide="eye"></i>
                </button>
              </div>
              <div class="editor-meta">
                <strong>${product.name} <span class="sku">${product.sku}</span></strong>
                <small>基准：${priceText(baseProduct)} · ${escapeHtml(baseProduct.style)} · ${escapeHtml(baseProduct.level || "未标注")}</small>
                <span class="visibility-pill ${product.hidden ? "hidden-product" : ""}">${visibilityText(product)}</span>
                ${sortPriority ? `<span class="priority-pill">前排 #${sortPriority}</span>` : ""}
              </div>
              <label>
                <span>价格</span>
                <input data-override-sku="${product.sku}" data-override-field="price" value="${override.price ?? product.price ?? ""}" inputmode="decimal" />
              </label>
              <label>
                <span>现货库存</span>
                <input data-override-sku="${product.sku}" data-override-field="stock" value="${product.stock ?? ""}" inputmode="numeric" placeholder="例如 500" />
              </label>
              <label>
                <span>本地图片</span>
                <input data-override-sku="${product.sku}" data-override-field="image_file" type="file" accept="image/*" />
                <small class="field-hint">${hasOverrideImage ? "当前使用已上传图片" : "未上传新图则保留当前图片"}</small>
              </label>
              <label>
                <span>预售库存 / 产能</span>
                <input data-override-sku="${product.sku}" data-override-field="presale_stock" value="${escapeHtml(product.presale_stock || "")}" placeholder="例如 15天不限量" />
              </label>
              <label>
                <span>产品等级</span>
                <select data-override-sku="${product.sku}" data-override-field="plan_level">
                  ${["", "S", "A", "B", "C"]
                    .map((level) => {
                      const current = override.plan_level || product.level || "";
                      const label = level || "未标注";
                      return `<option value="${level}" ${current === level ? "selected" : ""}>${label}</option>`;
                    })
                    .join("")}
                </select>
              </label>
              <label>
                <span>达人可见</span>
                <select data-override-sku="${product.sku}" data-override-field="is_hidden">
                  <option value="false" ${!product.hidden ? "selected" : ""}>达人可见</option>
                  <option value="true" ${product.hidden ? "selected" : ""}>达人不可见</option>
                </select>
              </label>
              <label>
                <span>风格线</span>
                <input data-override-sku="${product.sku}" data-override-field="style" value="${escapeHtml(override.style || product.style || "")}" />
              </label>
              <div class="editor-buttons">
                <button class="ghost-button" data-action="reset-override" data-id="${product.sku}">恢复</button>
                <button class="primary-button" data-action="save-override" data-id="${product.sku}" ${saving ? "disabled" : ""}>${saving ? "保存中" : "保存"}</button>
              </div>
            </div>
          `;
        })
        .join("")
    : `<div class="empty">没有匹配到商品</div>`;
  renderBrandBatchState(visibleSkus);
  renderBrandFrontQueue();
  refreshIcons();
}

function toggleProduct(id) {
  const product = productPool.find((item) => item.id === id);
  if (!product) return;
  if (state.selected.has(id)) {
    state.selected.delete(id);
    state.featured.delete(id);
    state.intents.delete(id);
    state.remarks.delete(id);
    showToast("已取消选款");
  } else {
    state.selected.set(id, product);
    showToast("已加入已选清单");
  }
  state.submitted = false;
  renderProducts();
  renderSelected();
}

function toggleFeatured(id) {
  const product = productPool.find((item) => item.id === id);
  if (!product) return;
  if (state.featured.has(id)) {
    state.featured.delete(id);
    showToast("已取消重点款标记");
  } else {
    state.selected.set(id, product);
    state.featured.add(id);
    showToast("已标记为重点款");
  }
  state.submitted = false;
  renderProducts();
  renderSelected();
}

function openDetail(id) {
  const product = productPool.find((item) => item.id === id);
  if (!product) return;
  const selected = state.selected.has(id);
  els.detailContent.innerHTML = `
    <div class="detail-layout">
      <img src="${product.img}" alt="${product.name}" />
      <div class="detail-info">
        <div>
          <p class="eyebrow">${product.category} · ${product.date}</p>
          <h2>${product.name} <span class="sku">${product.sku}</span></h2>
        </div>
        <div class="info-grid">
          <div><span class="field-label">品类</span><strong>${product.category}</strong></div>
          <div><span class="field-label">价格</span><strong>${priceText(product)}</strong></div>
          <div><span class="field-label">风格线</span><strong>${product.style}</strong></div>
          <div><span class="field-label">商品等级</span><strong>${product.level || "未标注"}</strong></div>
          <div><span class="field-label">现货库存</span><strong>${stockDisplay(product.stock)}</strong></div>
          <div><span class="field-label">预售库存 / 产能</span><strong>${escapeHtml(presaleStockDisplay(product.presale_stock))}</strong></div>
        </div>
        <div>
          <span class="field-label">商品卖点</span>
          <ul class="selling-points">
            ${product.points.map((point) => `<li>${point}</li>`).join("")}
          </ul>
        </div>
        <button class="primary-button" data-action="toggle" data-id="${product.id}">
          <i data-lucide="${selected ? "check" : "plus"}"></i>
          <span>${selected ? "取消选款" : "加入选款"}</span>
        </button>
      </div>
    </div>
  `;
  els.modal.classList.remove("hidden");
  refreshIcons();
}

function openImagePreview(id) {
  const product = productPool.find((item) => item.id === id);
  if (!product) return;
  els.detailContent.innerHTML = `
    <div class="image-preview-layout">
      <div class="image-preview-head">
        <div>
          <h2>${product.name}</h2>
          <p>${product.sku}</p>
        </div>
      </div>
      <div class="image-preview-frame">
        <img src="${product.img}" alt="${product.name}" />
      </div>
    </div>
  `;
  els.modal.classList.remove("hidden");
  refreshIcons();
}

function setView(view) {
  if (state.currentRole === "creator" && (view === "admin" || view === "brand")) {
    view = "selection";
  }
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.viewPanel !== view);
  });
  if (els.statusStrip) {
    els.statusStrip.classList.toggle("hidden", view === "brand");
  }
  if (view !== "selection") {
    document.querySelector(".content-grid").classList.add("hidden");
  } else {
    document.querySelector(".content-grid").classList.remove("hidden");
  }
  if (state.currentRole === "brand" && (view === "admin" || view === "brand")) syncAccessSession();
}

function selectionPayload() {
  return [...state.selected.values()].map((product) => ({
    sku: product.sku,
    is_featured: state.featured.has(product.id),
    intent:
      state.intents.get(product.id) ||
      (state.featured.has(product.id) ? "重点推荐" : "直播挂车"),
    remark: state.remarks.get(product.id) || "",
  }));
}

async function submitSelection() {
  if (state.currentRole !== "creator" || !state.creatorProfile) {
    showToast("请使用已审核的达人账号登录后提交");
    return;
  }
  const creatorName = String(state.creatorProfile.creator_name || "").trim();
  if (!creatorName) {
    els.creatorNameInput.focus();
    showToast("请先填写达人名称");
    return;
  }
  if (!state.selected.size) {
    showToast("请先选择商品");
    return;
  }
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  if (state.submitting) return;

  state.creatorName = creatorName;
  localStorage.setItem("inmanCreatorName", creatorName);
  state.submitting = true;
  document
    .querySelectorAll("#submitTopButton, #submitDrawerButton, #submitListButton")
    .forEach((button) => (button.disabled = true));
  showToast("正在提交选款...");

  const { error } = await cloud.rpc("submit_selection", {
    p_items: selectionPayload(),
  });

  state.submitting = false;
  document
    .querySelectorAll("#submitTopButton, #submitDrawerButton, #submitListButton")
    .forEach((button) => (button.disabled = false));
  if (error) {
    console.error(error);
    showToast("提交失败，请稍后重试");
    return;
  }

  state.submitted = true;
  renderSelected();
  showToast(`已成功提交 ${state.selected.size} 款`);
}

function setAdminLoggedIn(loggedIn) {
  els.adminLoginPanel.classList.toggle("hidden", loggedIn);
  els.adminDashboard.classList.toggle("hidden", !loggedIn);
  els.adminLogoutButton.classList.toggle("hidden", !loggedIn);
  els.adminRefreshButton.classList.toggle("hidden", !loggedIn);
  els.adminExportButton.classList.toggle("hidden", !loggedIn);
  els.brandLoginPanel.classList.toggle("hidden", loggedIn);
  els.brandDashboard.classList.toggle("hidden", !loggedIn);
  els.brandLogoutButton.classList.toggle("hidden", !loggedIn);
  els.brandRefreshButton.classList.toggle("hidden", !loggedIn);
  refreshIcons();
}

async function syncAccessSession() {
  if (!cloudEnabled) {
    setAdminLoggedIn(false);
    setAppVisibility(false);
    els.adminLoginPanel.innerHTML = `
      <div class="empty">云端数据库尚未配置，请联系网站管理员。</div>
    `;
    els.brandLoginPanel.innerHTML = `
      <div class="empty">云端数据库尚未配置，请联系网站管理员。</div>
    `;
    return;
  }
  const {
    data: { session },
  } = await cloud.auth.getSession();
  state.currentSession = session;
  state.currentUser = session?.user || null;

  if (!session) {
    if (state.adminChannel) {
      await cloud.removeChannel(state.adminChannel);
      state.adminChannel = null;
    }
    state.creatorProfile = null;
    state.creatorRequests = [];
    setRoleUi("guest");
    setAppVisibility(false);
    setAdminLoggedIn(false);
    return;
  }

  if (isAdminEmail(session.user.email)) {
    state.creatorProfile = null;
    setRoleUi("brand");
    els.userDisplayName.textContent = "品牌方";
    els.userDisplayRole.textContent = "后台管理";
    setAppVisibility(true);
    setAdminLoggedIn(true);
    await loadProductCatalog({ silent: true });
    await Promise.all([loadAdminData(), loadProductOverrides({ silent: true })]);
    subscribeAdminRealtime();
    renderBrandProductEditor();
    return;
  }

  const { data: profile, error } = await cloud
    .from("creator_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !profile) {
    if (state.adminChannel) {
      await cloud.removeChannel(state.adminChannel);
      state.adminChannel = null;
    }
    await cloud.auth.signOut();
    showToast("账号尚未开通，请联系品牌方审核");
    state.creatorProfile = null;
    setRoleUi("guest");
    setAppVisibility(false);
    setAdminLoggedIn(false);
    return;
  }

  state.creatorProfile = profile;
  state.creatorName = profile.creator_name;
  localStorage.setItem("inmanCreatorName", state.creatorName);
  setRoleUi("creator");
  els.userDisplayName.textContent = profile.creator_name;
  els.userDisplayRole.textContent = "达人账号";
  setAppVisibility(true);
  setAdminLoggedIn(false);
  await loadProductCatalog({ silent: true });
  await loadProductOverrides({ silent: true });
  renderProducts();
  renderSelected();
  if (state.view === "admin" || state.view === "brand") setView("selection");
}

async function loginAdmin(source = "admin") {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  const emailInput =
    source === "brand"
      ? els.brandEmailInput
      : source === "portal-brand"
        ? els.portalBrandEmailInput
        : els.adminEmailInput;
  const passwordInput =
    source === "brand"
      ? els.brandPasswordInput
      : source === "portal-brand"
        ? els.portalBrandPasswordInput
        : els.adminPasswordInput;
  const loginButton =
    source === "brand"
      ? els.brandLoginButton
      : source === "portal-brand"
        ? els.portalBrandLoginButton
        : els.adminLoginButton;
  const email = emailInput.value.trim();
  if (!email) {
    showToast("请输入管理员邮箱");
    return;
  }
  const password = passwordInput.value;
  if (!password) {
    showToast("请输入密码");
    return;
  }
  if (email.toLowerCase() !== "yanjianxi02@gmail.com") {
    showToast("该邮箱没有后台权限");
    return;
  }
  loginButton.disabled = true;
  const { error } = await cloud.auth.signInWithPassword({ email, password });
  loginButton.disabled = false;
  if (error) {
    showToast("邮箱或密码错误");
    return;
  }
  passwordInput.value = "";
  showToast("登录成功");
  await syncAccessSession();
  setView(source === "portal-brand" ? "admin" : state.view);
}

async function loginCreator() {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  const email = els.creatorLoginEmailInput.value.trim();
  const password = els.creatorLoginPasswordInput.value;
  if (!email) {
    showToast("请输入登录邮箱");
    return;
  }
  if (!password) {
    showToast("请输入登录密码");
    return;
  }
  els.creatorLoginButton.disabled = true;
  const { error } = await cloud.auth.signInWithPassword({ email, password });
  els.creatorLoginButton.disabled = false;
  if (error) {
    showToast("账号未开通或密码错误");
    return;
  }
  els.creatorLoginPasswordInput.value = "";
  await syncAccessSession();
  showToast("欢迎进入选款网站");
  setView("selection");
}

async function requestCreatorAccess() {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  const creatorName = els.creatorRequestNameInput.value.trim();
  const email = els.creatorRequestEmailInput.value.trim();
  const password = els.creatorRequestPasswordInput.value;
  if (!creatorName) {
    showToast("请输入达人名称");
    return;
  }
  if (!email) {
    showToast("请输入注册邮箱");
    return;
  }
  if (password.length < 8) {
    showToast("密码至少8位");
    return;
  }
  els.creatorRequestButton.disabled = true;
  const { error } = await cloud.rpc("request_creator_access", {
    p_creator_name: creatorName,
    p_email: email,
    p_password: password,
  });
  els.creatorRequestButton.disabled = false;
  if (error) {
    console.error(error);
    const message =
      error.message === "account already exists"
        ? "该邮箱已开通过账号"
        : error.message === "request already pending"
          ? "该邮箱已提交申请，请等待审核"
          : "提交申请失败";
    showToast(message);
    return;
  }
  els.creatorRequestNameInput.value = "";
  els.creatorRequestEmailInput.value = "";
  els.creatorRequestPasswordInput.value = "";
  showToast("申请已提交，请等待品牌方审核");
}

async function logoutCurrentUser() {
  if (state.adminChannel) {
    await cloud.removeChannel(state.adminChannel);
    state.adminChannel = null;
  }
  await cloud.auth.signOut();
  state.adminSubmissions = [];
  state.adminItems = [];
  state.creatorRequests = [];
  setAdminLoggedIn(false);
  setRoleUi("guest");
  setAppVisibility(false);
  renderAdmin();
  renderBrandProductEditor();
}

async function loadAdminData() {
  if (!cloudEnabled) return;
  const [
    { data: submissions, error: submissionsError },
    { data: items, error: itemsError },
    { data: requests, error: requestsError },
  ] =
    await Promise.all([
      cloud
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(1000),
      cloud.from("selection_items").select("*").limit(10000),
      cloud
        .from("creator_access_requests")
        .select("*")
        .order("requested_at", { ascending: false })
        .limit(200),
    ]);

  if (submissionsError || itemsError || requestsError) {
    console.error(submissionsError || itemsError || requestsError);
    showToast("后台数据读取失败");
    return;
  }
  state.adminSubmissions = submissions || [];
  state.adminItems = items || [];
  state.creatorRequests = requests || [];
  renderAdmin();
}

function normalizeCatalogDate(value) {
  if (value == null || value === "") return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  }
  const text = String(value).trim();
  const normalized = text.replace(/[./]/g, "-");
  const matched = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!matched) return text;
  const [, year, month, day] = matched;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizePriceValue(value) {
  if (value == null || value === "") return null;
  const price = Number(String(value).replace(/[￥,\s]/g, ""));
  if (!Number.isFinite(price)) return null;
  return Math.trunc(price * 10 + Number.EPSILON) / 10;
}

function productFromCatalogRow(row) {
  const sku = String(row.sku || "").trim();
  const existing = productPool.find((product) => product.sku === sku) || baseProductPool.find((product) => product.sku === sku);
  const style = String(row.style || existing?.style || "").trim();
  const category = String(row.category || existing?.category || "未分类").trim();
  const points = Array.isArray(row.points) && row.points.length
    ? row.points
    : [
        "来自 BI 商品上新",
        "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部",
        style ? `风格线：${style}` : `类目：${category}`,
      ];
  return {
    id: String(row.id || sku).trim(),
    sku,
    name: String(row.product_name || existing?.name || category || sku).trim(),
    category,
    date: normalizeCatalogDate(row.onsale_date || existing?.date),
    style,
    price: normalizePriceValue(row.price ?? existing?.price),
    level: parseImportLevel(row.plan_level || existing?.level) || String(row.plan_level || existing?.level || "").trim(),
    season: normalizeSeason(row.season || existing?.season),
    stock: normalizeStock(row.stock ?? existing?.stock),
    presale_stock: normalizePresaleStock(row.presale_stock ?? existing?.presale_stock),
    creator_sort_priority: normalizeCreatorSortPriority(row.creator_sort_priority),
    tag: String(row.tag || existing?.tag || "BI商品上新").trim(),
    img: String(row.image_url || existing?.img || `./assets/bi-current/${sku}.png`).trim(),
    points,
  };
}

async function loadProductCatalog(options = {}) {
  if (!cloudEnabled) {
    renderCatalogMeta();
    return;
  }
  const productRequest =
    state.currentRole === "creator"
      ? cloud.rpc("get_creator_visible_products")
      : cloud
          .from("product_catalog")
          .select("*")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(5000);
  const { data, error } = await productRequest;
  if (error) {
    console.error(error);
    if (!options.silent) showToast("云端新品池读取失败，将继续使用本地商品池");
    renderCatalogMeta();
    return;
  }
  const rows = data || [];
  if (!rows.length) {
    state.catalogSource = "cloud";
    refreshProductViews();
    return;
  }
  const products = rows.map(productFromCatalogRow).filter((product) => product.sku);
  if (!products.length) {
    renderCatalogMeta();
    return;
  }
  replaceBaseProductPool(products, "cloud");
}

async function loadProductOverrides(options = {}) {
  if (!cloudEnabled) {
    applyProductOverrides();
    pruneHiddenSelections();
    renderProducts();
    renderSelected();
    return;
  }
  if (state.currentRole === "creator") {
    // Creator-facing catalog rows are already resolved by the server RPC.
    state.productOverrides = new Map();
    applyProductOverrides();
    pruneHiddenSelections();
    renderProducts();
    renderSelected();
    renderCatalogMeta();
    return;
  }
  const { data, error } = await cloud.from("product_overrides").select("*").limit(5000);
  if (error) {
    console.error(error);
    if (!options.silent) showToast("商品池配置读取失败");
    return;
  }
  state.productOverrides = new Map(
    (data || []).map((item) => [
      item.sku,
      {
        price: normalizePriceValue(item.price),
        image_url: item.image_url || "",
        plan_level: item.plan_level || "",
        style: item.style || "",
        creator_sort_priority: normalizeCreatorSortPriority(item.creator_sort_priority),
        is_hidden: Boolean(item.is_hidden),
      },
    ])
  );
  applyProductOverrides();
  pruneHiddenSelections();
  renderProducts();
  renderSelected();
  renderBrandProductEditor();
  renderCatalogMeta();
}

function subscribeAdminRealtime() {
  if (!cloudEnabled || state.adminChannel) return;
  state.adminChannel = cloud
    .channel("selection-admin")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "submissions" },
      loadAdminData
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "selection_items" },
      loadAdminData
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "product_overrides" },
      () => loadProductOverrides({ silent: true })
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "product_catalog" },
      async () => {
        await loadProductCatalog({ silent: true });
        await loadProductOverrides({ silent: true });
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "creator_access_requests" },
      loadAdminData
    )
    .subscribe();
}

async function approveCreatorRequest(id) {
  if (!cloudEnabled) return;
  const { error } = await cloud.rpc("approve_creator_access", {
    p_request_id: id,
    p_review_note: "品牌方审核通过",
  });
  if (error) {
    console.error(error);
    showToast("开通失败");
    return;
  }
  showToast("达人账号已开通");
  await loadAdminData();
}

async function rejectCreatorRequest(id) {
  if (!cloudEnabled) return;
  const { error } = await cloud.rpc("reject_creator_access", {
    p_request_id: id,
    p_review_note: "品牌方暂未通过",
  });
  if (error) {
    console.error(error);
    showToast("驳回失败");
    return;
  }
  showToast("已驳回该申请");
  await loadAdminData();
}

async function collectOverrideDraft(sku) {
  const fields = [...document.querySelectorAll(`[data-override-sku="${sku}"]`)];
  const draft = {};
  fields.forEach((field) => {
    if (field.dataset.overrideField === "image_file") {
      draft.image_file = field.files?.[0] || null;
      return;
    }
    draft[field.dataset.overrideField] = field.value.trim();
  });
  let imageUrl = null;
  if (draft.image_file) {
    if (draft.image_file.size > 1.5 * 1024 * 1024) {
      throw new Error("image-too-large");
    }
    imageUrl = await readFileAsDataUrl(draft.image_file);
  } else {
    imageUrl = state.productOverrides.get(sku)?.image_url || null;
  }
  const product = productPool.find((item) => item.sku === sku);
  return {
    sku,
    price: draft.price === "" ? null : normalizePriceValue(draft.price) ?? NaN,
    image_url: imageUrl,
    plan_level: draft.plan_level || null,
    style: draft.style || null,
    stock: draft.stock === "" ? null : normalizeStock(draft.stock) ?? NaN,
    presale_stock: normalizePresaleStock(draft.presale_stock),
    creator_sort_priority:
      draft.is_hidden === "true" ? null : product ? productSortPriority(product) : null,
    is_hidden: draft.is_hidden === "true",
  };
}

function isPriorityColumnError(error) {
  return /creator_sort_priority/i.test(
    `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`
  );
}

function isPresaleStockColumnError(error) {
  return /presale_stock/i.test(`${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`);
}

async function updateCatalogInventory(sku, draft, userEmail) {
  const { data, error } = await cloud
    .from("product_catalog")
    .update({
      stock: draft.stock,
      presale_stock: draft.presale_stock || null,
      updated_by: userEmail || "",
      updated_at: new Date().toISOString(),
    })
    .eq("sku", sku)
    .select("sku")
    .maybeSingle();
  if (error) return { error, presaleUnavailable: isPresaleStockColumnError(error) };
  if (!data) return { error: new Error("catalog-product-missing"), presaleUnavailable: false };
  return { error: null, presaleUnavailable: false };
}

async function upsertProductOverrides(payload) {
  const result = await cloud.from("product_overrides").upsert(payload);
  if (!result.error || !isPriorityColumnError(result.error)) {
    return { error: result.error, priorityUnavailable: false };
  }
  const fallbackPayload = payload.map(({ creator_sort_priority, ...item }) => item);
  const fallback = await cloud.from("product_overrides").upsert(fallbackPayload);
  return { error: fallback.error, priorityUnavailable: !fallback.error };
}

async function upsertProductCatalog(payload) {
  const result = await cloud.from("product_catalog").upsert(payload);
  if (!result.error || !isPriorityColumnError(result.error)) {
    return { error: result.error, priorityUnavailable: false };
  }
  const fallbackPayload = payload.map(({ creator_sort_priority, ...item }) => item);
  const fallback = await cloud.from("product_catalog").upsert(fallbackPayload);
  return { error: fallback.error, priorityUnavailable: !fallback.error };
}

async function saveProductOverride(sku) {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  let draft;
  try {
    draft = await collectOverrideDraft(sku);
  } catch (error) {
    if (error.message === "image-too-large") {
      showToast("图片请控制在1.5MB以内");
      return;
    }
    showToast("图片读取失败");
    return;
  }
  if (Number.isNaN(draft.price)) {
    showToast("价格格式不正确");
    return;
  }
  if (Number.isNaN(draft.stock)) {
    showToast("现货库存请输入数字");
    return;
  }
  state.adminSavingSku = sku;
  renderBrandProductEditor();
  const {
    data: { user },
  } = await cloud.auth.getUser();
  const inventoryResult = await updateCatalogInventory(sku, draft, user?.email || "");
  if (inventoryResult.error) {
    state.adminSavingSku = "";
    console.error(inventoryResult.error);
    showToast(inventoryResult.presaleUnavailable ? "请先升级云端库存字段" : "库存保存失败");
    renderBrandProductEditor();
    return;
  }
  const payload = {
    ...draft,
    updated_by: user?.email || "",
    updated_at: new Date().toISOString(),
  };
  const { error, priorityUnavailable } = await upsertProductOverrides(payload);
  state.adminSavingSku = "";
  if (error) {
    console.error(error);
    showToast("保存失败");
    renderBrandProductEditor();
    return;
  }
  showToast(priorityUnavailable ? "其他配置已保存，达人排序需先升级云端" : "商品配置已保存");
  await loadProductCatalog({ silent: true });
  await loadProductOverrides({ silent: true });
  renderAdmin();
  renderBrandProductEditor();
}

async function applyBatchVisibility() {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  const skus = [...state.brandSelectedSkus];
  if (!skus.length) {
    showToast("请先勾选商品");
    return;
  }
  const isHidden = els.brandBatchVisibility?.value === "hidden";
  state.adminSavingSku = "batch";
  renderBrandProductEditor();
  const {
    data: { user },
  } = await cloud.auth.getUser();
  const payload = skus.map((sku) => {
    const override = state.productOverrides.get(sku) || {};
    return {
      sku,
      price: override.price ?? null,
      image_url: override.image_url || null,
      plan_level: override.plan_level || null,
      style: override.style || null,
      creator_sort_priority: isHidden
        ? null
        : productSortPriority(productPool.find((product) => product.sku === sku) || { sku }, override),
      is_hidden: isHidden,
      updated_by: user?.email || "",
      updated_at: new Date().toISOString(),
    };
  });
  const { error, priorityUnavailable } = await upsertProductOverrides(payload);
  state.adminSavingSku = "";
  if (error) {
    console.error(error);
    showToast("批量设置失败");
    renderBrandProductEditor();
    return;
  }
  state.brandSelectedSkus.clear();
  showToast(
    priorityUnavailable
      ? "可见性已更新，达人排序需先升级云端"
      : isHidden
        ? "已设为达人不可见"
        : "已设为达人可见"
  );
  await loadProductOverrides({ silent: true });
  renderAdmin();
  renderBrandProductEditor();
}

async function persistBrandFrontQueue(nextSkus, successMessage = "前排推荐已更新") {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return false;
  }

  const productBySku = new Map(productPool.map((product) => [product.sku, product]));
  const nextQueue = [...new Set(nextSkus)].filter((sku) => {
    const product = productBySku.get(sku);
    return product && !product.hidden;
  });
  const currentQueue = getProductsWithManualPriority().map((product) => product.sku);
  const affectedSkus = [...new Set([...currentQueue, ...nextQueue])];
  if (!affectedSkus.length) {
    renderBrandFrontQueue();
    return true;
  }

  state.adminSavingSku = "front-queue";
  renderBrandProductEditor();
  const {
    data: { user },
  } = await cloud.auth.getUser();
  const priorityBySku = new Map(nextQueue.map((sku, index) => [sku, index + 1]));
  const payload = affectedSkus.map((sku) => {
    const override = state.productOverrides.get(sku) || {};
    return {
      sku,
      price: override.price ?? null,
      image_url: override.image_url || null,
      plan_level: override.plan_level || null,
      style: override.style || null,
      is_hidden: Boolean(override.is_hidden),
      creator_sort_priority: priorityBySku.get(sku) || null,
      updated_by: user?.email || "",
      updated_at: new Date().toISOString(),
    };
  });
  const { error, priorityUnavailable } = await upsertProductOverrides(payload);
  state.adminSavingSku = "";
  if (error) {
    console.error(error);
    showToast("前排推荐保存失败");
    renderBrandProductEditor();
    return false;
  }
  if (priorityUnavailable) {
    showToast("请先升级云端数据库后再设置达人端前排推荐");
    renderBrandProductEditor();
    return false;
  }

  await loadProductOverrides({ silent: true });
  renderAdmin();
  renderBrandProductEditor();
  showToast(successMessage);
  return true;
}

async function addSelectedProductsToFront() {
  const selected = state.brandSelectedSkus;
  if (!selected.size) {
    showToast("请先在下方勾选商品");
    return;
  }
  const visibleOrder = [...document.querySelectorAll("[data-brand-select]")]
    .map((checkbox) => checkbox.dataset.brandSelect)
    .filter((sku) => selected.has(sku));
  const remainder = [...selected].filter((sku) => !visibleOrder.includes(sku));
  const candidateSkus = [...visibleOrder, ...remainder];
  const currentSkus = getBrandFrontQueue().map((product) => product.sku);
  const allowedSkus = candidateSkus.filter((sku) => {
    const product = productPool.find((item) => item.sku === sku);
    return product && !product.hidden && !currentSkus.includes(sku);
  });
  if (!allowedSkus.length) {
    showToast("所选商品已在前排或当前不可见");
    return;
  }
  const saved = await persistBrandFrontQueue(
    [...currentSkus, ...allowedSkus],
    `已加入 ${allowedSkus.length} 款前排推荐`
  );
  if (saved) state.brandSelectedSkus.clear();
}

async function removeProductFromFront(sku) {
  const nextQueue = getBrandFrontQueue()
    .map((product) => product.sku)
    .filter((itemSku) => itemSku !== sku);
  await persistBrandFrontQueue(nextQueue, "已移出前排推荐，将按自动规则补位");
}

async function clearBrandFrontQueue() {
  const currentQueue = getProductsWithManualPriority();
  if (!currentQueue.length) {
    showToast("当前没有前排推荐商品");
    return;
  }
  if (!window.confirm(`确定将 ${currentQueue.length} 款商品全部恢复为自动排序吗？`)) return;
  await persistBrandFrontQueue([], "前排推荐已清空，达人端已恢复自动排序");
}

function toggleBrandFrontPreview() {
  state.brandFrontPreviewVisible = !state.brandFrontPreviewVisible;
  renderBrandFrontQueue();
  refreshIcons();
}

function exportBrandFrontQueue() {
  const orderedProducts = getCreatorDisplayOrder();
  if (!orderedProducts.length) {
    showToast("当前没有可导出的达人可见商品");
    return;
  }
  const rows = [
    ["达人端当前排名", "排序方式", "款号", "品名", "类目", "等级", "现货库存", "价格", "达人可见"],
    ...orderedProducts.map((product, index) => [
      index + 1,
      normalizeCreatorSortPriority(product.creator_sort_priority)
        ? `前排 #${product.creator_sort_priority}`
        : "自动补位",
      product.sku,
      product.name,
      product.category,
      product.level || "未标注",
      normalizeStock(product.stock) ?? "",
      normalizePriceValue(product.price) ?? "",
      product.hidden ? "否" : "是",
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `达人端当前完整顺序-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeImportKey(key) {
  return String(key || "").trim().replace(/\s+/g, "").toLowerCase();
}

function pickImportValue(row, keys) {
  for (const key of Object.keys(row)) {
    if (keys.includes(normalizeImportKey(key))) {
      const value = row[key];
      if (value !== null && value !== undefined && String(value).trim() !== "") return value;
    }
  }
  return "";
}

function parseImportVisibility(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return null;
  if (text.includes("不可") || text.includes("隐藏") || text === "hidden" || text === "hide" || text === "0" || text === "false" || text === "no") {
    return true;
  }
  if (text.includes("可见") || text.includes("显示") || text === "visible" || text === "show" || text === "1" || text === "true" || text === "yes") {
    return false;
  }
  return null;
}

function parseImportLevel(value) {
  const level = String(value || "").trim().toUpperCase().replace("级", "");
  return ["S", "A", "B", "C"].includes(level) ? level : null;
}

function parseImportSortPriority(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text || ["自动", "清空", "clear", "auto", "none"].includes(text)) return null;
  return normalizeCreatorSortPriority(text) ?? NaN;
}

function readImportRows(file) {
  return new Promise((resolve, reject) => {
    if (!window.XLSX) {
      reject(new Error("xlsx-not-loaded"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = window.XLSX.read(reader.result, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
          defval: "",
        });
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsArrayBuffer(file);
  });
}

function buildImportPayload(rows, userEmail) {
  const payload = [];
  const missingSkus = [];
  const invalidPrioritySkus = [];
  const seen = new Set();
  rows.forEach((row) => {
    const sku = String(
      pickImportValue(row, ["款号", "货号", "sku", "商品款号", "商品编码", "编码"])
    ).trim();
    if (!sku || seen.has(sku)) return;
    seen.add(sku);
    const product = productPool.find((item) => item.sku === sku);
    if (!product) {
      missingSkus.push(sku);
      return;
    }
    const override = state.productOverrides.get(sku) || {};
    const priceRaw = pickImportValue(row, ["价格", "达播价", "售价", "price"]);
    const price = priceRaw === "" ? normalizePriceValue(override.price) : normalizePriceValue(priceRaw);
    if (priceRaw !== "" && price == null) return;
    const level = parseImportLevel(
      pickImportValue(row, ["产品等级", "等级", "品牌计划等级", "planlevel", "level"])
    );
    const visibility = parseImportVisibility(
      pickImportValue(row, ["达人可见", "是否可见", "可见", "状态", "visibility"])
    );
    const style = String(pickImportValue(row, ["风格线", "风格", "style"])).trim();
    const imageUrl = String(pickImportValue(row, ["图片链接", "图片", "image", "imageurl"])).trim();
    const priorityRaw = pickImportValue(row, ["达人端排序", "达人排序", "排序优先级", "优先级", "creator_sort_priority"]);
    const creatorSortPriority =
      priorityRaw === ""
        ? productSortPriority(product, override)
        : parseImportSortPriority(priorityRaw);
    if (Number.isNaN(creatorSortPriority)) {
      invalidPrioritySkus.push(sku);
      return;
    }

    payload.push({
      sku,
      price,
      image_url: imageUrl || override.image_url || null,
      plan_level: level ?? override.plan_level ?? null,
      style: style || override.style || null,
      creator_sort_priority: creatorSortPriority,
      is_hidden: visibility ?? Boolean(override.is_hidden),
      updated_by: userEmail || "",
      updated_at: new Date().toISOString(),
    });
  });
  return { payload, missingSkus, invalidPrioritySkus };
}

function buildCatalogImportPayload(rows, userEmail) {
  const payload = [];
  const skipped = [];
  const seen = new Set();
  rows.forEach((row, index) => {
    const sku = String(
      pickImportValue(row, ["款号", "货号", "sku", "商品款号", "商品编码", "编码", "款式编码"])
    ).trim();
    if (!sku) {
      skipped.push(index + 2);
      return;
    }
    if (seen.has(sku)) return;
    seen.add(sku);
    const existing = productPool.find((item) => item.sku === sku) || baseProductPool.find((item) => item.sku === sku);
    const category = String(
      pickImportValue(row, ["品类", "类目", "所属类目", "商品品类", "category"]) ||
        existing?.category ||
        "未分类"
    ).trim();
    const productName = String(
      pickImportValue(row, ["品名", "商品名称", "名称", "商品名", "name", "productname"]) ||
        existing?.name ||
        category ||
        sku
    ).trim();
    const style = String(
      pickImportValue(row, ["风格线", "风格", "style"]) || existing?.style || ""
    ).trim();
    const priceRaw = pickImportValue(row, ["达播价", "价格", "售价", "price"]);
    const importedPrice = normalizePriceValue(priceRaw);
    const level =
      parseImportLevel(
        pickImportValue(row, ["产品等级", "等级", "品牌计划等级", "planlevel", "level"])
      ) ||
      existing?.level ||
      "";
    const imageUrl = String(
      pickImportValue(row, ["图片链接", "主图", "图片", "image", "imageurl", "img"]) ||
        existing?.img ||
        ""
    ).trim();
    const onsaleDate = normalizeCatalogDate(
      pickImportValue(row, ["上新日期", "日期", "波段日期", "上市日期", "date", "onsaledate"]) ||
        existing?.date ||
        ""
    );
    const season = normalizeSeason(
      pickImportValue(row, ["季节", "季", "season"]) || existing?.season
    );
    const stockRaw = pickImportValue(row, ["库存", "可用库存", "现货库存", "stock", "inventory"]);
    const stock = normalizeStock(stockRaw === "" ? existing?.stock : stockRaw);
    const presaleRaw = pickImportValue(row, [
      "预售库存",
      "预售库存/产能",
      "预售产能",
      "预售",
      "产能",
      "presale_stock",
      "presale",
    ]);
    const presaleStock =
      presaleRaw === "" ? normalizePresaleStock(existing?.presale_stock) : normalizePresaleStock(presaleRaw);
    const tag = String(pickImportValue(row, ["标签", "tag"]) || existing?.tag || "BI商品上新").trim();
    const priorityRaw = pickImportValue(row, ["达人端排序", "达人排序", "排序优先级", "优先级", "creator_sort_priority"]);
    const creatorSortPriority =
      priorityRaw === ""
        ? normalizeCreatorSortPriority(existing?.creator_sort_priority)
        : parseImportSortPriority(priorityRaw);
    payload.push({
      sku,
      id: sku,
      product_name: productName,
      category,
      onsale_date: onsaleDate || null,
      style: style || null,
      price: importedPrice ?? existing?.price ?? null,
      image_url: imageUrl || null,
      plan_level: level || null,
      season,
      stock,
      presale_stock: presaleStock || null,
      creator_sort_priority: Number.isNaN(creatorSortPriority) ? null : creatorSortPriority,
      tag,
      points: [
        "来自 BI 商品上新",
        "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部",
        style ? `风格线：${style}` : `类目：${category}`,
      ],
      source: "BI 商品上新",
      is_active: true,
      updated_by: userEmail || "",
      updated_at: new Date().toISOString(),
    });
  });
  return { payload, skipped };
}

async function importNewProducts() {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  const file = els.brandNewProductsFile?.files?.[0];
  if (!file) {
    showToast("请先选择新品表");
    return;
  }
  els.brandNewProductsButton.disabled = true;
  showToast("正在更新新品池...");
  try {
    const rows = await readImportRows(file);
    const {
      data: { user },
    } = await cloud.auth.getUser();
    const { payload, skipped } = buildCatalogImportPayload(rows, user?.email || "");
    if (!payload.length) {
      showToast("表格里没有可更新的款号");
      return;
    }
    const { error, priorityUnavailable } = await upsertProductCatalog(payload);
    if (error) {
      console.error(error);
      showToast("新品更新失败，请先确认云端商品池表已创建");
      return;
    }
    els.brandNewProductsFile.value = "";
    showToast(`已更新新品 ${payload.length} 款${skipped.length ? `，${skipped.length} 行缺少款号` : ""}${priorityUnavailable ? "，达人排序列待升级云端后生效" : ""}`);
    await loadProductCatalog({ silent: true });
    await loadProductOverrides({ silent: true });
    renderAdmin();
    renderBrandProductEditor();
  } catch (error) {
    console.error(error);
    showToast(error.message === "xlsx-not-loaded" ? "表格解析组件加载失败" : "新品表读取失败");
  } finally {
    els.brandNewProductsButton.disabled = false;
  }
}

async function importProductOverrides() {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  const file = els.brandImportFile?.files?.[0];
  if (!file) {
    showToast("请先选择表格");
    return;
  }
  els.brandImportButton.disabled = true;
  showToast("正在读取表格...");
  try {
    const rows = await readImportRows(file);
    const {
      data: { user },
    } = await cloud.auth.getUser();
    const { payload, missingSkus, invalidPrioritySkus } = buildImportPayload(rows, user?.email || "");
    if (!payload.length) {
      showToast("表格里没有匹配到可修改款号");
      return;
    }
    const { error, priorityUnavailable } = await upsertProductOverrides(payload);
    if (error) {
      console.error(error);
      showToast("导入保存失败");
      return;
    }
    els.brandImportFile.value = "";
    showToast(`已导入修改 ${payload.length} 款${missingSkus.length ? `，${missingSkus.length} 款未匹配` : ""}${invalidPrioritySkus.length ? `，${invalidPrioritySkus.length} 款排序无效` : ""}${priorityUnavailable ? "，达人排序列待升级云端后生效" : ""}`);
    await loadProductOverrides({ silent: true });
    renderAdmin();
    renderBrandProductEditor();
  } catch (error) {
    console.error(error);
    showToast(error.message === "xlsx-not-loaded" ? "表格解析组件加载失败" : "表格读取失败");
  } finally {
    els.brandImportButton.disabled = false;
  }
}

async function resetProductOverride(sku) {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  state.adminSavingSku = sku;
  renderBrandProductEditor();
  const { error } = await cloud.from("product_overrides").delete().eq("sku", sku);
  state.adminSavingSku = "";
  if (error) {
    console.error(error);
    showToast("恢复失败");
    renderBrandProductEditor();
    return;
  }
  showToast("已恢复为BI原始商品卡");
  await loadProductOverrides({ silent: true });
  renderAdmin();
  renderBrandProductEditor();
}

function exportAdminCsv() {
  if (!state.adminItems.length) {
    showToast("暂无可导出的记录");
    return;
  }
  const submissionById = new Map(
    state.adminSubmissions.map((submission) => [submission.id, submission])
  );
  const rows = [
    ["达人", "提交时间", "款号", "品名", "品类", "等级", "达播价", "重点款", "意向类型", "备注"],
    ...state.adminItems.map((item) => {
      const submission = submissionById.get(item.submission_id) || {};
      return [
        submission.creator_name || "",
        submission.submitted_at || "",
        item.sku,
        item.product_name,
        item.category,
        item.plan_level,
        item.price ?? "",
        item.is_featured ? "是" : "否",
        item.intent,
        item.remark,
      ];
    }),
  ];
  const csv = rows
    .map((row) =>
      row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")
    )
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `达人选款汇总-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.add("hidden"), 1800);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const { action, id } = actionButton.dataset;
  if (action === "toggle") toggleProduct(id);
  if (action === "feature") toggleFeatured(id);
  if (action === "detail") openDetail(id);
  if (action === "preview") openImagePreview(id);
  if (action === "remove") toggleProduct(id);
  if (action === "save-override") saveProductOverride(id);
  if (action === "reset-override") resetProductOverride(id);
  if (action === "front-remove") removeProductFromFront(id);
  if (action === "approve-request") approveCreatorRequest(id);
  if (action === "reject-request") rejectCreatorRequest(id);
  if (action === "load-more") {
    state.visibleLimit += 60;
    renderProducts();
  }
});

document.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-front-sku]");
  if (!item) return;
  state.brandFrontDraggingSku = item.dataset.frontSku;
  item.classList.add("dragging");
  event.dataTransfer?.setData("text/plain", state.brandFrontDraggingSku);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
});

document.addEventListener("dragover", (event) => {
  const item = event.target.closest("[data-front-sku]");
  if (!item || !state.brandFrontDraggingSku || item.dataset.frontSku === state.brandFrontDraggingSku) return;
  event.preventDefault();
  item.classList.add("drag-over");
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
});

document.addEventListener("dragleave", (event) => {
  const item = event.target.closest("[data-front-sku]");
  item?.classList.remove("drag-over");
});

document.addEventListener("drop", async (event) => {
  const item = event.target.closest("[data-front-sku]");
  const draggingSku = state.brandFrontDraggingSku;
  if (!item || !draggingSku || item.dataset.frontSku === draggingSku) return;
  event.preventDefault();
  const queue = getBrandFrontQueue().map((product) => product.sku);
  const nextQueue = queue.filter((sku) => sku !== draggingSku);
  const targetIndex = nextQueue.indexOf(item.dataset.frontSku);
  nextQueue.splice(Math.max(targetIndex, 0), 0, draggingSku);
  state.brandFrontDraggingSku = "";
  await persistBrandFrontQueue(nextQueue, "前排推荐顺序已更新");
});

document.addEventListener("dragend", () => {
  state.brandFrontDraggingSku = "";
  document.querySelectorAll(".front-queue-item").forEach((item) => {
    item.classList.remove("dragging", "drag-over");
  });
});

document.addEventListener("change", (event) => {
  const intentId = event.target.dataset.intent;
  const remarkId = event.target.dataset.remark;
  const brandSelectSku = event.target.dataset.brandSelect;
  if (brandSelectSku) {
    if (event.target.checked) {
      state.brandSelectedSkus.add(brandSelectSku);
    } else {
      state.brandSelectedSkus.delete(brandSelectSku);
    }
    renderBrandBatchState();
    return;
  }
  if (intentId) state.intents.set(intentId, event.target.value);
  if (remarkId) {
    const nextValue = event.target.value.trim();
    state.remarks.set(remarkId, nextValue);
    syncRemarkFields(remarkId, nextValue, event.target);
  }
  if (intentId || remarkId) state.submitted = false;
});

document.addEventListener("input", (event) => {
  const remarkId = event.target.dataset.remark;
  if (remarkId) {
    state.remarks.set(remarkId, event.target.value);
    syncRemarkFields(remarkId, event.target.value, event.target);
    state.submitted = false;
  }
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

els.creatorAuthTab.addEventListener("click", () => setAuthView("creator"));
els.brandAuthTab.addEventListener("click", () => setAuthView("brand"));
els.creatorLoginButton.addEventListener("click", loginCreator);
els.creatorLoginPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loginCreator();
});
els.creatorRequestButton.addEventListener("click", requestCreatorAccess);
els.creatorRequestPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") requestCreatorAccess();
});
els.portalBrandLoginButton.addEventListener("click", () => loginAdmin("portal-brand"));
els.portalBrandPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loginAdmin("portal-brand");
});

els.categoryFilter.addEventListener("change", (event) => {
  state.filters.category = event.target.value;
  state.visibleLimit = 60;
  renderProducts();
});

els.levelFilter.addEventListener("change", (event) => {
  state.filters.level = event.target.value;
  state.visibleLimit = 60;
  renderProducts();
});

els.priceFilter.addEventListener("change", (event) => {
  state.filters.price = event.target.value;
  state.visibleLimit = 60;
  renderProducts();
});

if (els.seasonFilter) {
  els.seasonFilter.addEventListener("change", (event) => {
    state.filters.season = event.target.value;
    state.visibleLimit = 60;
    renderProducts();
  });
}

if (els.stockFilter) {
  els.stockFilter.addEventListener("change", (event) => {
    state.filters.stock = event.target.value;
    state.visibleLimit = 60;
    renderProducts();
  });
}

els.searchInput.addEventListener("input", (event) => {
  state.filters.query = event.target.value;
  state.visibleLimit = 60;
  renderProducts();
});

els.creatorNameInput.value = state.creatorName;
els.creatorNameInput.addEventListener("input", (event) => {
  state.creatorName = event.target.value.trim();
  state.submitted = false;
  localStorage.setItem("inmanCreatorName", state.creatorName);
  renderSelected();
});

document.getElementById("closeModal").addEventListener("click", () => {
  els.modal.classList.add("hidden");
});

els.modal.addEventListener("click", (event) => {
  if (event.target === els.modal) els.modal.classList.add("hidden");
});

["submitTopButton", "submitDrawerButton", "submitListButton"].forEach((id) => {
  document.getElementById(id).addEventListener("click", submitSelection);
});

document.getElementById("exportButton").addEventListener("click", () => {
  showToast("请在后台汇总中导出全部提交明细");
});

els.adminLoginButton.addEventListener("click", () => loginAdmin("admin"));
els.adminPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loginAdmin("admin");
});
els.brandLoginButton.addEventListener("click", () => loginAdmin("brand"));
els.brandPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loginAdmin("brand");
});
els.adminLogoutButton.addEventListener("click", logoutCurrentUser);
els.brandLogoutButton.addEventListener("click", logoutCurrentUser);
els.globalLogoutButton.addEventListener("click", logoutCurrentUser);
els.adminRefreshButton.addEventListener("click", loadAdminData);
els.brandRefreshButton.addEventListener("click", async () => {
  await loadProductCatalog();
  await loadProductOverrides();
});
els.adminExportButton.addEventListener("click", exportAdminCsv);
if (els.brandCategoryFilter) {
  els.brandCategoryFilter.addEventListener("change", (event) => {
    state.brandFilters.category = event.target.value;
    renderBrandProductEditor();
  });
}
if (els.brandLevelFilter) {
  els.brandLevelFilter.addEventListener("change", (event) => {
    state.brandFilters.level = event.target.value;
    renderBrandProductEditor();
  });
}
if (els.brandPriceFilter) {
  els.brandPriceFilter.addEventListener("change", (event) => {
    state.brandFilters.price = event.target.value;
    renderBrandProductEditor();
  });
}
if (els.brandSeasonFilter) {
  els.brandSeasonFilter.addEventListener("change", (event) => {
    state.brandFilters.season = event.target.value;
    renderBrandProductEditor();
  });
}
if (els.brandStockFilter) {
  els.brandStockFilter.addEventListener("change", (event) => {
    state.brandFilters.stock = event.target.value;
    renderBrandProductEditor();
  });
}
if (els.brandVisibilityFilter) {
  els.brandVisibilityFilter.addEventListener("change", (event) => {
    state.brandFilters.visibility = event.target.value;
    renderBrandProductEditor();
  });
}
if (els.brandProductSearch) {
  els.brandProductSearch.addEventListener("input", (event) => {
    state.brandProductSearch = event.target.value;
    state.brandFilters.query = event.target.value;
    renderBrandProductEditor();
  });
}
if (els.brandSelectAll) {
  els.brandSelectAll.addEventListener("change", (event) => {
    document.querySelectorAll("[data-brand-select]").forEach((checkbox) => {
      checkbox.checked = event.target.checked;
      if (event.target.checked) {
        state.brandSelectedSkus.add(checkbox.dataset.brandSelect);
      } else {
        state.brandSelectedSkus.delete(checkbox.dataset.brandSelect);
      }
    });
    renderBrandBatchState();
  });
}
if (els.brandBatchApplyButton) {
  els.brandBatchApplyButton.addEventListener("click", applyBatchVisibility);
}
if (els.brandAddToFrontButton) {
  els.brandAddToFrontButton.addEventListener("click", addSelectedProductsToFront);
}
if (els.brandFrontPreviewButton) {
  els.brandFrontPreviewButton.addEventListener("click", toggleBrandFrontPreview);
}
if (els.brandFrontExportButton) {
  els.brandFrontExportButton.addEventListener("click", exportBrandFrontQueue);
}
if (els.brandFrontClearButton) {
  els.brandFrontClearButton.addEventListener("click", clearBrandFrontQueue);
}
if (els.brandImportButton) {
  els.brandImportButton.addEventListener("click", importProductOverrides);
}
if (els.brandNewProductsButton) {
  els.brandNewProductsButton.addEventListener("click", importNewProducts);
}
if (els.productSummaryToggle) {
  els.productSummaryToggle.addEventListener("click", () => {
    state.productSummaryCollapsed = !state.productSummaryCollapsed;
    renderProductSummaryCollapse();
  });
}

initFilters();
renderProducts();
renderSelected();
renderCatalogMeta();
setAuthView("creator");
setView("selection");
if (cloudEnabled) {
  cloud.auth.onAuthStateChange(() => {
    syncAccessSession();
  });
}
syncAccessSession();
refreshIcons();
