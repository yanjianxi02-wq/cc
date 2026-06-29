const CREATOR_URL = "../outputs/qly_creators/latest_creator_pool.json";
const PRODUCT_URL = "../outputs/bestseller_db/latest_bestseller_db.json";
const CREATOR_HOT_PRODUCTS_URL = "../outputs/qly_creators/latest_creator_hot_products.json";
const PRODUCT_PAGE_SIZE = 30;

const state = {
  creators: [],
  products: [],
  creatorHotProducts: [],
  creatorHotProductsByCreator: {},
  productPage: 1,
  productQuery: "",
  category: "",
};

const $ = (selector) => document.querySelector(selector);
const formatMoney = (value) =>
  new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 }).format(value || 0);
const formatCompact = (value) => {
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 1 : 2)}w`;
  return new Intl.NumberFormat("zh-CN").format(value || 0);
};
const formatInteger = (value) => new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(Number(value) || 0);
const formatHotProductAmount = (value) => {
  const number = Number(value) || 0;
  return `${formatInteger(number / 10000)}万元`;
};
const formatHotProductVolume = (value) => formatInteger(value);
const parseMetric = (value) => {
  const text = String(value || "").replace(/[^\d.]/g, "");
  const number = Number(text || 0);
  return String(value).includes("w") ? number * 10000 : number;
};
const safeImage = (url) => url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='220'%3E%3Crect width='100%25' height='100%25' fill='%23e7f5f3'/%3E%3Ctext x='50%25' y='50%25' fill='%23167d7a' text-anchor='middle' dominant-baseline='middle' font-size='20'%3Einman%C2%B0%3C/text%3E%3C/svg%3E";
const formatCreatorMoney = (creator) => creator.biMetricsStatus === "ready" ? formatMoney(creator.salesAmount) : "待同步";
const formatCreatorVolume = (creator) => creator.biMetricsStatus === "ready" ? formatCompact(creator.salesVolume) : "待同步";
const formatCreatorProducts = (creator) => creator.biMetricsStatus === "ready" ? creator.brandProductCount : "待同步";

async function loadData() {
  const [creators, products, creatorHotProducts] = await Promise.all([
    fetch(CREATOR_URL, { cache: "no-store" }).then((res) => res.json()),
    fetch(PRODUCT_URL, { cache: "no-store" }).then((res) => res.json()),
    fetch(CREATOR_HOT_PRODUCTS_URL, { cache: "no-store" }).then((res) => res.json()),
  ]);
  state.creators = creators.records;
  state.products = products.products;
  state.creatorHotProducts = creatorHotProducts.records || [];
  state.creatorHotProductsByCreator = creatorHotProducts.byCreator || {};
  $("#data-time").textContent = `商品库更新于 ${new Date(products.generatedAt).toLocaleString("zh-CN", { hour12: false })}`;
  renderAll();
}

function renderAll() {
  renderMetrics();
  renderCreatorBars();
  renderCategories();
  renderProductStrip();
  renderCreatorTable();
  renderCreatorHotProducts();
  renderProductTable();
  renderMatchCreatorOptions();
  lucide.createIcons();
}

function renderCreatorHotProducts() {
  const records = state.creatorHotProducts;
  $("#creator-hot-products").innerHTML = records.length ? records.slice(0, 50).map((product) => `
    <article class="creator-hot-card">
      <img src="${safeImage(product.image)}" alt="${product.productName || product.productId || "达人爆款"}" loading="lazy" />
      <div class="creator-hot-body">
        <span class="creator-hot-rank">#${product.rank}</span>
        <strong>${product.productName || product.productId || "未命名商品"}</strong>
        <small>${product.category || "女装"} · ${product.creatorName || "达人商品"}</small>
        <div><b>${formatHotProductAmount(product.salesAmount)}</b><span>销量 ${formatHotProductVolume(product.salesVolume)}</span></div>
      </div>
    </article>`).join("") : `<div class="empty-state hot-products-empty"><i data-lucide="clock-3"></i><strong>达人近 14 天女装爆款待同步</strong><span>将从千里眼抓取达人近14天销售 TOP50：服饰内衣 → 女装 → 全部。</span></div>`;
  lucide.createIcons();
}

function renderMetrics() {
  const readyCreators = state.creators.filter((creator) => creator.biMetricsStatus === "ready");
  const creatorSales = readyCreators.reduce((sum, creator) => sum + parseMetric(creator.salesAmount), 0);
  const shortages = state.products.slice(0, 100).filter((product) => product.canSellStock < 100 || product.outOfStock > 100).length;
  $("#metric-creators").textContent = state.creators.length;
  $("#metric-products").textContent = new Intl.NumberFormat("zh-CN").format(state.products.length);
  $("#metric-creator-sales").textContent = readyCreators.length ? `${(creatorSales / 10000).toFixed(1)}w` : "待同步";
  $("#metric-shortage").textContent = shortages;
}

function renderCreatorBars() {
  const creators = state.creators.slice(0, 8);
  const max = Math.max(...creators.map((creator) => parseMetric(creator.salesAmount)), 1);
  $("#creator-bars").innerHTML = creators.map((creator) => `
    <div class="bar-row">
      <span class="bar-name" title="${creator.name}">${creator.name}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(parseMetric(creator.salesAmount) / max) * 100}%"></div></div>
      <span class="bar-value">${formatCreatorMoney(creator)}</span>
    </div>`).join("");
}

function categoryData() {
  const categories = new Map();
  for (const product of state.products.slice(0, 100)) {
    categories.set(product.productCategory || "其他", (categories.get(product.productCategory || "其他") || 0) + 1);
  }
  return Array.from(categories.entries()).sort((a, b) => b[1] - a[1]).slice(0, 7);
}

function renderCategories() {
  const categories = categoryData();
  const max = Math.max(...categories.map(([, count]) => count), 1);
  $("#category-list").innerHTML = categories.map(([name, count]) => `
    <div class="category-row">
      <span>${name}</span>
      <div class="category-track"><div class="category-fill" style="width:${(count / max) * 100}%"></div></div>
      <span class="category-count">${count} 款</span>
    </div>`).join("");

  const allCategories = [...new Set(state.products.map((product) => product.productCategory).filter(Boolean))].sort();
  $("#category-filter").innerHTML = `<option value="">全部品类</option>${allCategories.map((category) => `<option>${category}</option>`).join("")}`;
}

function productCard(product) {
  return `<article class="product-card">
    <img src="${safeImage(product.image)}" alt="${product.productSn}" loading="lazy" />
    <div class="product-card-body">
      <strong>#${product.rank} ${product.productSn}</strong>
      <span>${formatMoney(product.salesAmount)}</span>
      <small>${product.productCategory || "未分类"} · ${product.productLabels.join(" / ") || "未标记"}</small>
    </div>
  </article>`;
}

function renderProductStrip() {
  $("#overview-products").innerHTML = state.products.slice(0, 5).map(productCard).join("");
}

function renderCreatorTable() {
  const query = $("#creator-search").value.trim().toLowerCase();
  const creators = state.creators.filter((creator) => `${creator.name}${creator.douyinId}`.toLowerCase().includes(query));
  $("#creator-table").innerHTML = creators.map((creator) => `
    <tr>
      <td><span class="rank ${creator.rank <= 3 ? "top" : ""}">${creator.rank}</span></td>
      <td><div class="creator-cell"><img class="creator-avatar" src="${safeImage(creator.avatar)}" alt="${creator.name}" loading="lazy" /><div><span class="creator-name">${creator.name}</span><span class="creator-id">抖音号：${creator.douyinId}</span><span class="creator-source">${creator.biMetricsStatus === "ready" ? "BI 近30天" : "BI 指标待同步"}</span></div></div></td>
      <td>${creator.followers}</td><td><strong>${formatCreatorMoney(creator)}</strong></td><td>${formatCreatorVolume(creator)}</td>
      <td>${formatCreatorProducts(creator)}</td><td>${creator.brandAveragePrice}</td><td>${creator.liveCount}</td>
      <td><div class="creator-actions"><button class="text-button" data-hot-creator="${creator.rank}">TOP50 产品</button><button class="text-button" data-creator="${creator.rank}">画像 <i data-lucide="arrow-right"></i></button></div></td>
    </tr>`).join("");
  document.querySelectorAll("[data-creator]").forEach((button) => {
    button.addEventListener("click", () => showCreator(Number(button.dataset.creator)));
  });
  document.querySelectorAll("[data-hot-creator]").forEach((button) => {
    button.addEventListener("click", () => showCreatorHotProducts(Number(button.dataset.hotCreator)));
  });
  lucide.createIcons();
}

function showCreatorHotProducts(rank) {
  const creator = state.creators.find((item) => item.rank === rank);
  if (!creator) return;
  const products = state.creatorHotProductsByCreator[creator.douyinId] || [];
  $("#creator-hot-dialog-name").textContent = `${creator.name} · 近 14 天女装 TOP50 产品`;
  $("#creator-hot-dialog-content").innerHTML = products.length ? `
    <div class="creator-hot-products dialog-hot-products">
      ${products.slice(0, 50).map((product) => `
        <article class="creator-hot-card">
          <img src="${safeImage(product.image)}" alt="${product.productName || product.productId || "达人爆款"}" loading="lazy" />
          <div class="creator-hot-body">
            <span class="creator-hot-rank">#${product.rank}</span>
            <strong>${product.productName || product.productId || "未命名商品"}</strong>
            <small>${product.category || "女装"}</small>
            <div><b>${formatHotProductAmount(product.salesAmount)}</b><span>销量 ${formatHotProductVolume(product.salesVolume)}</span></div>
          </div>
        </article>`).join("")}
    </div>` : `<div class="empty-state"><i data-lucide="clock-3"></i><strong>${creator.name} 的 TOP50 产品待同步</strong><span>将从千里眼抓取该达人近14天女装商品 TOP50。</span></div>`;
  $("#creator-hot-dialog").showModal();
  lucide.createIcons();
}

function filteredProducts() {
  const query = state.productQuery.toLowerCase();
  return state.products.filter((product) =>
    (!state.category || product.productCategory === state.category)
    && `${product.productSn}${product.productCategory}${product.productLabels.join("")}`.toLowerCase().includes(query));
}

function renderProductTable() {
  const products = filteredProducts();
  const pages = Math.max(1, Math.ceil(products.length / PRODUCT_PAGE_SIZE));
  state.productPage = Math.min(Math.max(1, state.productPage), pages);
  const start = (state.productPage - 1) * PRODUCT_PAGE_SIZE;
  $("#product-table").innerHTML = products.slice(start, start + PRODUCT_PAGE_SIZE).map((product) => `
    <tr>
      <td><span class="rank ${product.rank <= 3 ? "top" : ""}">${product.rank}</span></td>
      <td><img class="table-image" src="${safeImage(product.image)}" alt="${product.productSn}" loading="lazy" /></td>
      <td><strong>${product.productSn}</strong></td><td>${product.productCategory || "-"}</td>
      <td>${product.productLabels.map((tag) => `<span class="tag">${tag}</span>`).join("") || "-"}</td>
      <td><strong>${formatMoney(product.salesAmount)}</strong></td><td>${formatCompact(product.salesVolume)}</td>
      <td>${formatCompact(product.canSellStock)}</td><td><button class="shortage-button ${product.outOfStock > 100 ? "alert" : ""}" data-shortage-product="${product.productSn}">${formatCompact(product.outOfStock)} <i data-lucide="chevron-right"></i></button></td>
      <td>${product.businessLines.map((line) => `<span class="muted">${line}</span>`).join("")}</td>
    </tr>`).join("");
  $("#product-page").textContent = `第 ${state.productPage} / ${pages} 页`;
  $("#prev-products").disabled = state.productPage <= 1;
  $("#next-products").disabled = state.productPage >= pages;
  document.querySelectorAll("[data-shortage-product]").forEach((button) => {
    button.addEventListener("click", () => showShortageDetails(button.dataset.shortageProduct));
  });
  lucide.createIcons();
}

function showShortageDetails(productSn) {
  const product = state.products.find((item) => item.productSn === productSn);
  if (!product) return;
  const details = Array.isArray(product.shortageDetails) ? product.shortageDetails : [];
  $("#shortage-dialog-name").textContent = `${product.productSn} 缺货明细`;
  $("#shortage-dialog-content").innerHTML = details.length ? `
    <table class="shortage-table">
      <thead><tr><th>分类</th><th>颜色</th><th>尺码</th><th>缺货数</th><th>缺货天数</th></tr></thead>
      <tbody>${details.map((item) => `<tr><td>${item.category || "-"}</td><td>${item.color || "-"}</td><td>${item.size || "-"}</td><td><strong>${formatCompact(item.outOfStock)}</strong></td><td>${item.shortageDays ? `${item.shortageDays} 天` : "-"}</td></tr>`).join("")}</tbody>
    </table>` : `<div class="empty-state"><i data-lucide="clock-3"></i><strong>SKU 缺货明细待同步</strong><span>工作日 9:30 将从 BI 回货统计抓取分类、颜色、尺码、缺货数量和缺货天数。</span></div>`;
  $("#shortage-dialog").showModal();
  lucide.createIcons();
}

function showCreator(rank) {
  const creator = state.creators.find((item) => item.rank === rank);
  if (!creator) return;
  $("#dialog-name").textContent = creator.name;
  $("#dialog-content").innerHTML = `
    <div class="dialog-creator"><img class="creator-avatar large" src="${safeImage(creator.avatar)}" alt="${creator.name}" /><div><strong>${creator.name}</strong><span class="creator-id">抖音号：${creator.douyinId}</span></div></div>
    <div class="dialog-metrics">
      <div class="dialog-metric"><span>近 30 天销售额</span><strong>${formatCreatorMoney(creator)}</strong></div>
      <div class="dialog-metric"><span>合作商品数</span><strong>${formatCreatorProducts(creator)}</strong></div>
      <div class="dialog-metric"><span>平均客单价</span><strong>${creator.brandAveragePrice}</strong></div>
      <div class="dialog-metric"><span>粉丝数</span><strong>${creator.followers}</strong></div>
      <div class="dialog-metric"><span>直播场次</span><strong>${creator.liveCount}</strong></div>
      <div class="dialog-metric"><span>带货口碑</span><strong>${creator.reputation}</strong></div>
    </div>
    <p class="dialog-summary">${creatorSummary(creator)}</p>
    <button class="text-button" data-match-rank="${creator.rank}">为该达人推荐款式 <i data-lucide="arrow-right"></i></button>`;
  $("#creator-dialog").showModal();
  $("[data-match-rank]").addEventListener("click", () => {
    $("#creator-dialog").close();
    showView("match");
    $("#match-creator").value = String(creator.rank);
    renderMatches();
  });
  lucide.createIcons();
}

function creatorSummary(creator) {
  if (creator.biMetricsStatus !== "ready") return "该达人的 BI 店群商品分析数据正在同步。完成后将按近 30 天成交金额、成交件数和去重款号数更新画像与推荐结果。";
  const sales = parseMetric(creator.salesAmount);
  const focus = creator.brandProductCount <= 3 ? "合作款式较集中，适合用少量核心款测试爆发力" : "已有较宽的合作款式覆盖，可继续分析高贡献品类";
  const scale = sales >= 100000 ? "销售贡献突出，建议列入重点维护名单" : sales >= 30000 ? "已有稳定贡献，适合增加匹配款测试" : "当前贡献仍有提升空间，可优先控制试款数量";
  return `${scale}。${focus}。当前平均客单价为 ${creator.brandAveragePrice}，后续将结合单场直播明细补充更加细致的爆款模式判断。`;
}

function renderMatchCreatorOptions() {
  $("#match-creator").innerHTML = state.creators.map((creator) => `<option value="${creator.rank}">#${creator.rank} ${creator.name}</option>`).join("");
  renderMatches();
}

function matchScore(creator, product) {
  const creatorPrice = parseMetric(creator.brandAveragePrice);
  const priceGap = Math.abs(product.avgUnitPrice - creatorPrice);
  const priceScore = Math.max(0, 35 - priceGap / 5);
  const salesScore = Math.min(45, Math.log10(product.salesAmount + 1) * 10);
  const stockScore = product.canSellStock > 300 ? 15 : product.canSellStock > 80 ? 9 : 1;
  const riskPenalty = product.outOfStock > 300 ? 10 : product.isBreak ? 5 : 0;
  return Math.round(priceScore + salesScore + stockScore - riskPenalty);
}

function matchReason(creator, product) {
  const priceGap = Math.abs(product.avgUnitPrice - parseMetric(creator.brandAveragePrice));
  if (priceGap <= 30 && product.canSellStock > 300) return "价格带贴近，库存充足";
  if (product.salesAmount >= state.products[9].salesAmount) return "内部高销售款，适合优先测试";
  if (product.productLabels.includes("爆款")) return "BI 已标记爆款，可复用成熟表现";
  return "款式表现稳定，适合补充测试";
}

function recentPopularProductSet(creator) {
  const productSns = Array.isArray(creator.recentProductSns) ? creator.recentProductSns : [];
  return new Set(productSns.filter(Boolean).map((value) => String(value).trim().toLowerCase()));
}

function renderMatches() {
  const creator = state.creators.find((item) => item.rank === Number($("#match-creator").value)) || state.creators[0];
  if (!creator) return;
  const recentPopularProducts = recentPopularProductSet(creator);
  const candidateProducts = state.products.slice(0, 240);
  const excludedCount = candidateProducts.filter((product) => recentPopularProducts.has(String(product.productSn).trim().toLowerCase())).length;
  const products = state.products
    .slice(0, 240)
    .filter((product) => !recentPopularProducts.has(String(product.productSn).trim().toLowerCase()))
    .map((product) => ({ ...product, score: matchScore(creator, product) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 9);

  $("#match-profile").innerHTML = `
    <p class="eyebrow">当前达人</p><div class="dialog-creator"><img class="creator-avatar large" src="${safeImage(creator.avatar)}" alt="${creator.name}" /><div><h2>${creator.name}</h2><span class="muted">抖音号：${creator.douyinId}</span></div></div>
    <dl>
      <div><dt>销售额</dt><dd>${formatCreatorMoney(creator)}</dd></div><div><dt>粉丝数</dt><dd>${creator.followers}</dd></div>
      <div><dt>客单价</dt><dd>${creator.brandAveragePrice}</dd></div><div><dt>商品数</dt><dd>${formatCreatorProducts(creator)}</dd></div>
      <div><dt>直播数</dt><dd>${creator.liveCount}</dd></div><div><dt>销量</dt><dd>${formatCreatorVolume(creator)}</dd></div>
    </dl><p class="profile-note">${creatorSummary(creator)}</p>
    <p class="match-filter-note">已自动剔除该达人近 30 天带货销量超过 50 件的款式：${excludedCount} 款</p>`;
  $("#match-products").innerHTML = products.map((product) => `
    <article class="match-card">
      <img src="${safeImage(product.image)}" alt="${product.productSn}" loading="lazy" />
      <div><strong>${product.productSn}</strong><span class="score">匹配评分 ${product.score}</span>
      <small>${product.productCategory} · ${formatMoney(product.salesAmount)}</small>
      <small>${matchReason(creator, product)}</small></div>
    </article>`).join("");
}

const titles = { overview: "经营概览", creators: "达人画像", products: "爆款数据库", match: "智能匹配" };
function showView(view) {
  document.querySelectorAll(".view").forEach((node) => node.classList.toggle("active", node.id === `view-${view}`));
  document.querySelectorAll(".nav-item").forEach((node) => node.classList.toggle("active", node.dataset.view === view));
  $("#page-title").textContent = titles[view];
}

document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
document.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.jump)));
$("#creator-search").addEventListener("input", renderCreatorTable);
$("#product-search").addEventListener("input", (event) => { state.productQuery = event.target.value.trim(); state.productPage = 1; renderProductTable(); });
$("#category-filter").addEventListener("change", (event) => { state.category = event.target.value; state.productPage = 1; renderProductTable(); });
$("#prev-products").addEventListener("click", () => { state.productPage -= 1; renderProductTable(); });
$("#next-products").addEventListener("click", () => { state.productPage += 1; renderProductTable(); });
$("#match-creator").addEventListener("change", renderMatches);
$("#close-dialog").addEventListener("click", () => $("#creator-dialog").close());
$("#close-shortage-dialog").addEventListener("click", () => $("#shortage-dialog").close());
$("#close-creator-hot-dialog").addEventListener("click", () => $("#creator-hot-dialog").close());
$("#refresh-button").addEventListener("click", loadData);

loadData().catch((error) => {
  console.error(error);
  $("#data-time").textContent = "数据读取失败，请确认本地服务已启动";
});
