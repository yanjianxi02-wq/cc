const products = [
  { id: "18637076", name: "裤子", sku: "18637076", category: "裤子", date: "2026-05-27", style: "田园-度假", price: 254, level: "B", tag: "BI商品上新", img: "./assets/bi-current/18637076.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-度假"] },
  { id: "18618053", name: "衬衣", sku: "18618053", category: "衬衣", date: "2026-06-10", style: "简约通勤", price: null, level: "A", tag: "BI商品上新", img: "./assets/bi-current/18618053.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：简约通勤"] },
  { id: "18637089", name: "T恤", sku: "18637089", category: "T恤", date: "2026-06-17", style: "田园-复古", price: null, level: "A", tag: "BI商品上新", img: "./assets/bi-current/18637089.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-复古"] },
  { id: "18637024", name: "T恤", sku: "18637024", category: "T恤", date: "2026-06-24", style: "田园-复古", price: null, level: "B", tag: "BI商品上新", img: "./assets/bi-current/18637024.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-复古"] },
  { id: "18637124", name: "衬衣", sku: "18637124", category: "衬衣", date: "2026-06-25", style: "田园-休闲", price: 194, level: "A", tag: "BI商品上新", img: "./assets/bi-current/18637124.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-休闲"] },
  { id: "18637276", name: "牛仔裤", sku: "18637276", category: "牛仔裤", date: "2026-06-26", style: "田园-复古", price: 279, level: "B", tag: "BI商品上新", img: "./assets/bi-current/18637276.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-复古"] },
  { id: "W18637366", name: "衬衣", sku: "W18637366", category: "衬衣", date: "2026-07-01", style: "田园-复古", price: null, level: "B", tag: "BI商品上新", img: "./assets/bi-current/W18637366.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-复古"] },
  { id: "18637012", name: "(仿)毛衣", sku: "18637012", category: "针织", date: "2026-07-01", style: "文艺知性通勤", price: null, level: "A", tag: "BI商品上新", img: "./assets/bi-current/18637012.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：文艺知性通勤"] },
  { id: "18637150", name: "衬衣", sku: "18637150", category: "衬衣", date: "2026-07-02", style: "田园-法式", price: 254, level: "A", tag: "BI商品上新", img: "./assets/bi-current/18637150.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-法式"] },
  { id: "F18518425H1", name: "衬衣", sku: "F18518425H1", category: "衬衣", date: "2026-07-08", style: "田园-法式", price: null, level: "B", tag: "BI商品上新", img: "./assets/bi-current/F18518425H1.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-法式"] },
  { id: "F18618721", name: "裤子", sku: "F18618721", category: "裤子", date: "2026-07-08", style: "田园-清新", price: null, level: "C", tag: "BI商品上新", img: "./assets/bi-current/F18618721.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-清新"] },
  { id: "18637020", name: "(仿)毛衣", sku: "18637020", category: "针织", date: "2026-07-09", style: "田园-休闲", price: null, level: "B", tag: "BI商品上新", img: "./assets/bi-current/18637020.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-休闲"] },
  { id: "18538120", name: "衬衣", sku: "18538120", category: "衬衣", date: "2026-07-15", style: "田园-度假", price: 254, level: "C", tag: "BI商品上新", img: "./assets/bi-current/18538120.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-度假"] },
  { id: "18637053", name: "衬衣", sku: "18637053", category: "衬衣", date: "2026-07-15", style: "田园-复古", price: 219, level: "A", tag: "BI商品上新", img: "./assets/bi-current/18637053.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-复古"] },
  { id: "W18637066", name: "羊毛衫", sku: "W18637066", category: "针织", date: "2026-07-16", style: "田园-复古", price: 254, level: "A", tag: "BI商品上新", img: "./assets/bi-current/W18637066.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-复古"] },
  { id: "18637236", name: "外套 上衣", sku: "18637236", category: "外套", date: "2026-07-22", style: "田园-复古", price: null, level: "B", tag: "BI商品上新", img: "./assets/bi-current/18637236.png", points: ["来自 BI 商品上新", "筛选口径：茵曼服装 / 2026 / 秋季 / 线上 / 类目全部", "风格线：田园-复古"] }
];

const baseProductPool = (window.BI_PRODUCTS?.length ? window.BI_PRODUCTS : products).map((product) => ({
  ...product,
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
  adminSavingSku: "",
  productOverrides: new Map(),
  productSummaryCollapsed: false,
  visibleLimit: 60,
  filters: {
    category: "全部",
    level: "全部",
    price: "全部",
    query: ""
  }
};

const els = {
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
  searchInput: document.getElementById("searchInput"),
  creatorNameInput: document.getElementById("creatorNameInput"),
  toast: document.getElementById("toast"),
  modal: document.getElementById("detailModal"),
  detailContent: document.getElementById("detailContent"),
  submitStatus: document.getElementById("submitStatus"),
  adminSubmitted: document.getElementById("adminSubmitted"),
  adminProductCount: document.getElementById("adminProductCount"),
  adminSelected: document.getElementById("adminSelected"),
  adminHotCategory: document.getElementById("adminHotCategory"),
  productSummary: document.getElementById("productSummary"),
  creatorSummary: document.getElementById("creatorSummary"),
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
  return [...new Set(productPool.map((product) => product[key]))];
}

function initFilters() {
  uniqueValues("category").forEach((category) => {
    els.categoryFilter.append(new Option(category, category));
  });
}

function matchesPrice(product) {
  if (product.price == null) return true;
  const price = product.price;
  const range = state.filters.price;
  if (range === "全部") return true;
  if (range === "0-199") return price < 200;
  if (range === "200-299") return price >= 200 && price <= 299;
  if (range === "300-399") return price >= 300 && price <= 399;
  return price >= 400;
}

function filteredProducts() {
  const query = state.filters.query.trim().toLowerCase();
  const levelOrder = { S: 0, A: 1, B: 2, C: 3, "": 9 };
  return productPool
    .filter((product) => {
      const categoryMatch = state.filters.category === "全部" || product.category === state.filters.category;
      const levelMatch = state.filters.level === "全部" || product.level === state.filters.level;
      const queryMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.style.toLowerCase().includes(query);
      return categoryMatch && levelMatch && matchesPrice(product) && queryMatch;
    })
    .sort((a, b) => {
      const byLevel = levelOrder[a.level] - levelOrder[b.level];
      if (byLevel !== 0) return byLevel;
      return new Date(a.date) - new Date(b.date);
    });
}

function levelClass(level) {
  return level.toLowerCase();
}

function priceText(product) {
  return product.price == null ? "价格待确认" : `￥${product.price}`;
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
        price: override.price ?? product.price,
        img: override.image_url || product.img,
        level: override.plan_level || product.level,
        style: override.style || product.style,
      };
    })
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsDataURL(file);
  });
}

function priceBand(product) {
  if (product.price == null) return "待确认";
  if (product.price < 150) return "149以下";
  if (product.price < 200) return "150-199";
  if (product.price < 250) return "200-249";
  if (product.price < 300) return "250-299";
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
  const prices = list.map((product) => product.price).filter((price) => Number.isFinite(price));
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
              <button class="mini-button select" data-action="toggle" data-id="${product.id}">
                <i data-lucide="${selected ? "check" : "plus"}"></i>
                <span>${selected ? "取消" : "选款"}</span>
              </button>
              <button class="mini-button feature ${featured ? "active" : ""}" data-action="feature" data-id="${product.id}">
                <i data-lucide="star"></i>
                <span>重点款</span>
              </button>
              <button class="mini-button" data-action="detail" data-id="${product.id}">
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

function renderBrandProductEditor() {
  if (!els.brandProductEditor) return;
  const query = state.brandProductSearch.trim().toLowerCase();
  const list = productPool
    .filter((product) => {
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.style.toLowerCase().includes(query)
      );
    })
    .slice(0, 40);

  els.brandProductEditor.innerHTML = list.length
    ? list
        .map((product) => {
          const override = state.productOverrides.get(product.sku) || {};
          const baseProduct = baseProductPool.find((item) => item.sku === product.sku) || product;
          const saving = state.adminSavingSku === product.sku;
          const hasOverrideImage = Boolean(override.image_url);
          return `
            <div class="editor-row">
              <div class="editor-image">
                <img src="${product.img}" alt="${product.name}" />
                <button class="image-preview-button editor-preview-button" data-action="preview" data-id="${product.id}" aria-label="放大查看图片">
                  <i data-lucide="eye"></i>
                </button>
              </div>
              <div class="editor-meta">
                <strong>${product.name} <span class="sku">${product.sku}</span></strong>
                <small>基准：${priceText(baseProduct)} · ${escapeHtml(baseProduct.style)} · ${escapeHtml(baseProduct.level || "未标注")}</small>
              </div>
              <label>
                <span>价格</span>
                <input data-override-sku="${product.sku}" data-override-field="price" value="${override.price ?? product.price ?? ""}" inputmode="decimal" />
              </label>
              <label>
                <span>本地图片</span>
                <input data-override-sku="${product.sku}" data-override-field="image_file" type="file" accept="image/*" />
                <small class="field-hint">${hasOverrideImage ? "当前使用已上传图片" : "未上传新图则保留当前图片"}</small>
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
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.viewPanel !== view);
  });
  if (view !== "selection") {
    document.querySelector(".content-grid").classList.add("hidden");
  } else {
    document.querySelector(".content-grid").classList.remove("hidden");
  }
  if (view === "admin" || view === "brand") syncAdminSession();
}

function selectionPayload() {
  return [...state.selected.values()].map((product) => ({
    sku: product.sku,
    product_name: product.name,
    category: product.category,
    style: product.style,
    plan_level: product.level || "",
    price: product.price,
    image_url: product.img,
    is_featured: state.featured.has(product.id),
    intent:
      state.intents.get(product.id) ||
      (state.featured.has(product.id) ? "重点推荐" : "直播挂车"),
    remark: state.remarks.get(product.id) || "",
  }));
}

async function submitSelection() {
  const creatorName = els.creatorNameInput.value.trim();
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
    p_creator_name: creatorName,
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

async function syncAdminSession() {
  if (!cloudEnabled) {
    setAdminLoggedIn(false);
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
  setAdminLoggedIn(Boolean(session));
  if (session) {
    await Promise.all([loadAdminData(), loadProductOverrides({ silent: true })]);
    subscribeAdminRealtime();
    renderBrandProductEditor();
  }
}

async function loginAdmin(source = "admin") {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  const emailInput = source === "brand" ? els.brandEmailInput : els.adminEmailInput;
  const passwordInput = source === "brand" ? els.brandPasswordInput : els.adminPasswordInput;
  const loginButton = source === "brand" ? els.brandLoginButton : els.adminLoginButton;
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
  await syncAdminSession();
}

async function logoutAdmin() {
  if (state.adminChannel) {
    await cloud.removeChannel(state.adminChannel);
    state.adminChannel = null;
  }
  await cloud.auth.signOut();
  state.adminSubmissions = [];
  state.adminItems = [];
  setAdminLoggedIn(false);
  renderAdmin();
  renderBrandProductEditor();
}

async function loadAdminData() {
  if (!cloudEnabled) return;
  const [{ data: submissions, error: submissionsError }, { data: items, error: itemsError }] =
    await Promise.all([
      cloud
        .from("submissions")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(1000),
      cloud.from("selection_items").select("*").limit(10000),
    ]);

  if (submissionsError || itemsError) {
    console.error(submissionsError || itemsError);
    showToast("后台数据读取失败");
    return;
  }
  state.adminSubmissions = submissions || [];
  state.adminItems = items || [];
  renderAdmin();
}

async function loadProductOverrides(options = {}) {
  if (!cloudEnabled) {
    applyProductOverrides();
    renderProducts();
    renderSelected();
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
        price: item.price == null ? null : Number(item.price),
        image_url: item.image_url || "",
        plan_level: item.plan_level || "",
        style: item.style || "",
      },
    ])
  );
  applyProductOverrides();
  renderProducts();
  renderSelected();
  renderBrandProductEditor();
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
    .subscribe();
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
  return {
    sku,
    price:
      draft.price === ""
        ? null
        : Number.isFinite(Number(draft.price))
          ? Number(draft.price)
          : NaN,
    image_url: imageUrl,
    plan_level: draft.plan_level || null,
    style: draft.style || null,
  };
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
  state.adminSavingSku = sku;
  renderBrandProductEditor();
  const {
    data: { user },
  } = await cloud.auth.getUser();
  const payload = {
    ...draft,
    updated_by: user?.email || "",
    updated_at: new Date().toISOString(),
  };
  const { error } = await cloud.from("product_overrides").upsert(payload);
  state.adminSavingSku = "";
  if (error) {
    console.error(error);
    showToast("保存失败");
    renderBrandProductEditor();
    return;
  }
  showToast("商品配置已保存");
  await loadProductOverrides({ silent: true });
  renderAdmin();
  renderBrandProductEditor();
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
  if (action === "load-more") {
    state.visibleLimit += 60;
    renderProducts();
  }
});

document.addEventListener("change", (event) => {
  const intentId = event.target.dataset.intent;
  const remarkId = event.target.dataset.remark;
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
els.adminLogoutButton.addEventListener("click", logoutAdmin);
els.brandLogoutButton.addEventListener("click", logoutAdmin);
els.adminRefreshButton.addEventListener("click", loadAdminData);
els.brandRefreshButton.addEventListener("click", () => loadProductOverrides());
els.adminExportButton.addEventListener("click", exportAdminCsv);
if (els.brandProductSearch) {
  els.brandProductSearch.addEventListener("input", (event) => {
    state.brandProductSearch = event.target.value;
    renderBrandProductEditor();
  });
}
if (els.productSummaryToggle) {
  els.productSummaryToggle.addEventListener("click", () => {
    state.productSummaryCollapsed = !state.productSummaryCollapsed;
    renderProductSummaryCollapse();
  });
}

initFilters();
loadProductOverrides({ silent: true });
renderProducts();
renderSelected();
setView("selection");
refreshIcons();


