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
  creatorSummary: document.getElementById("creatorSummary"),
  adminLoginPanel: document.getElementById("adminLoginPanel"),
  adminDashboard: document.getElementById("adminDashboard"),
  adminEmailInput: document.getElementById("adminEmailInput"),
  adminPasswordInput: document.getElementById("adminPasswordInput"),
  adminLoginButton: document.getElementById("adminLoginButton"),
  adminLogoutButton: document.getElementById("adminLogoutButton"),
  adminRefreshButton: document.getElementById("adminRefreshButton"),
  adminExportButton: document.getElementById("adminExportButton")
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
  if (view === "admin") syncAdminSession();
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
  refreshIcons();
}

async function syncAdminSession() {
  if (!cloudEnabled) {
    setAdminLoggedIn(false);
    els.adminLoginPanel.innerHTML = `
      <div class="empty">云端数据库尚未配置，请联系网站管理员。</div>
    `;
    return;
  }
  const {
    data: { session },
  } = await cloud.auth.getSession();
  setAdminLoggedIn(Boolean(session));
  if (session) {
    await loadAdminData();
    subscribeAdminRealtime();
  }
}

async function loginAdmin() {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  const email = els.adminEmailInput.value.trim();
  if (!email) {
    showToast("请输入管理员邮箱");
    return;
  }
  const password = els.adminPasswordInput.value;
  if (!password) {
    showToast("请输入密码");
    return;
  }
  if (email.toLowerCase() !== "yanjianxi02@gmail.com") {
    showToast("该邮箱没有后台权限");
    return;
  }
  els.adminLoginButton.disabled = true;
  const { error } = await cloud.auth.signInWithPassword({ email, password });
  els.adminLoginButton.disabled = false;
  if (error) {
    showToast("邮箱或密码错误");
    return;
  }
  els.adminPasswordInput.value = "";
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
    .subscribe();
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
  if (action === "remove") toggleProduct(id);
  if (action === "load-more") {
    state.visibleLimit += 60;
    renderProducts();
  }
});

document.addEventListener("change", (event) => {
  const intentId = event.target.dataset.intent;
  const remarkId = event.target.dataset.remark;
  if (intentId) state.intents.set(intentId, event.target.value);
  if (remarkId) state.remarks.set(remarkId, event.target.value.trim());
  if (intentId || remarkId) state.submitted = false;
});

document.addEventListener("input", (event) => {
  const remarkId = event.target.dataset.remark;
  if (remarkId) {
    state.remarks.set(remarkId, event.target.value);
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

els.adminLoginButton.addEventListener("click", loginAdmin);
els.adminPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loginAdmin();
});
els.adminLogoutButton.addEventListener("click", logoutAdmin);
els.adminRefreshButton.addEventListener("click", loadAdminData);
els.adminExportButton.addEventListener("click", exportAdminCsv);

initFilters();
renderProducts();
renderSelected();
setView("selection");
refreshIcons();


