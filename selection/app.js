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

const productPool = window.BI_PRODUCTS?.length ? window.BI_PRODUCTS : products;

const state = {
  selected: new Map(),
  featured: new Set(),
  view: "selection",
  submitted: false,
  creatorName: localStorage.getItem("inmanCreatorName") || "",
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
  creatorSummary: document.getElementById("creatorSummary")
};

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

function renderProducts() {
  const list = filteredProducts();
  const visibleList = list.slice(0, state.visibleLimit);
  els.resultCount.textContent = `${list.length} 款`;
  const cards = visibleList
    .map((product) => {
      const selected = state.selected.has(product.id);
      const featured = state.featured.has(product.id);
      return `
        <article class="product-card ${selected ? "selected" : ""} ${featured ? "featured" : ""}">
          <div class="image-wrap">
            <img src="${product.img}" alt="${product.name}" loading="lazy" />
            <div class="tag-row">
              <span class="tag">${product.tag}</span>
              ${product.level ? `<span class="level ${levelClass(product.level)}">${product.level}</span>` : ""}
            </div>
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
                <option>直播挂车</option>
                <option>试穿寄样</option>
                <option>短视频种草</option>
                <option ${state.featured.has(product.id) ? "selected" : ""}>重点推荐</option>
              </select>
            </label>
            <label>
              <span>备注</span>
              <input placeholder="颜色 / 尺码 / 搭配需求" data-remark="${product.id}" />
            </label>
            <button class="icon-button" data-action="remove" data-id="${product.id}" aria-label="移除">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        `
      )
      .join("");
  }

  renderAdmin();
  refreshIcons();
}

function renderAdmin() {
  const selectedProducts = [...state.selected.values()];
  const creatorName = state.creatorName || "未填写达人";
  els.adminProductCount.textContent = productPool.length;
  els.adminSubmitted.textContent = state.submitted ? "1" : "0";
  els.adminSelected.textContent = selectedProducts.length;

  const categoryCounts = selectedProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  const hotCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  els.adminHotCategory.textContent = hotCategory ? hotCategory[0] : "-";

  els.productSummary.innerHTML = selectedProducts.length
    ? selectedProducts
        .map(
          (product) => `
            <div class="summary-row">
              <div>
                <strong>${product.name} ${product.sku}${state.featured.has(product.id) ? ` <span class="featured-label">重点款</span>` : ""}</strong>
                <small>${product.category} · ${product.level ? `${product.level}级 · ` : ""}${product.date}</small>
              </div>
              <strong>1人选择</strong>
            </div>
          `
        )
        .join("")
    : `<div class="empty">暂无已选商品</div>`;

  els.creatorSummary.innerHTML = `
    <div class="summary-row">
      <div>
        <strong>${creatorName}</strong>
        <small>达人端提交 · 商务负责人：王宁 · ${state.submitted ? "已提交" : "选款中"}</small>
      </div>
      <strong>${selectedProducts.length} 款</strong>
    </div>
  `;
}

function toggleProduct(id) {
  const product = productPool.find((item) => item.id === id);
  if (!product) return;
  if (state.selected.has(id)) {
    state.selected.delete(id);
    state.featured.delete(id);
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
}

function submitSelection() {
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
  state.creatorName = creatorName;
  localStorage.setItem("inmanCreatorName", creatorName);
  state.submitted = true;
  renderSelected();
  showToast(`已提交 ${state.selected.size} 款，后台已生成汇总`);
  setView("admin");
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
  if (action === "remove") toggleProduct(id);
  if (action === "load-more") {
    state.visibleLimit += 60;
    renderProducts();
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

["exportButton", "adminExportButton"].forEach((id) => {
  document.getElementById(id).addEventListener("click", () => {
    showToast("演示版已生成导出动作，正式版输出 Excel");
  });
});

initFilters();
renderProducts();
renderSelected();
setView("selection");
refreshIcons();


