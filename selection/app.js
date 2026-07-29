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
  adminSubmissionFilters: {
    dateFrom: "",
    dateTo: "",
  },
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
  brandEditingSku: "",
  productImageDrafts: new Map(),
  selectedDraggingId: "",
  adminSavingSku: "",
  productOverrides: new Map(),
  catalogSource: "cloud",
  creatorRequests: [],
  brandCreators: [],
  brandTasks: [],
  brandTaskProducts: [],
  brandTaskAssignments: [],
  brandTaskCreatorIds: new Set(),
  creatorTasks: [],
  activeTaskId: localStorage.getItem("inmanActiveTaskId") || "",
  taskFeatureReady: false,
  taskServiceError: "",
  currentSession: null,
  currentUser: null,
  currentRole: "guest",
  creatorProfile: null,
  authView: "creator",
  compassOverviewData: null,
  compassProductHeatData: null,
  compassCreatorDetailData: null,
  compassSelectedCreatorId: "",
  compassCreatorPage: 1,
  compassHistoryPage: 1,
  compassHeatOffset: 0,
  compassCategorySort: "rate",
  compassLoading: false,
  compassDetailLoading: false,
  compassRealtimeTimer: null,
  compassFilters: {
    creatorQuery: "",
    taskId: "",
    dateFrom: "",
    dateTo: "",
    category: "",
    confidence: "",
  },
  productDensity: localStorage.getItem("inmanProductDensity") === "compact" ? "compact" : "standard",
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
  standardDensityButton: document.getElementById("standardDensityButton"),
  compactDensityButton: document.getElementById("compactDensityButton"),
  categoryFilter: document.getElementById("categoryFilter"),
  levelFilter: document.getElementById("levelFilter"),
  priceFilter: document.getElementById("priceFilter"),
  seasonFilter: document.getElementById("seasonFilter"),
  stockFilter: document.getElementById("stockFilter"),
  searchInput: document.getElementById("searchInput"),
  statusStrip: document.getElementById("statusStrip"),
  creatorTaskPanel: document.getElementById("creatorTaskPanel"),
  creatorTaskHint: document.getElementById("creatorTaskHint"),
  creatorTaskSelect: document.getElementById("creatorTaskSelect"),
  creatorTaskMeta: document.getElementById("creatorTaskMeta"),
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
  taskDeadlineValue: document.getElementById("taskDeadlineValue"),
  submitStatus: document.getElementById("submitStatus"),
  adminSubmitted: document.getElementById("adminSubmitted"),
  adminProductCount: document.getElementById("adminProductCount"),
  adminSelected: document.getElementById("adminSelected"),
  adminHotCategory: document.getElementById("adminHotCategory"),
  pendingRequestCount: document.getElementById("pendingRequestCount"),
  creatorSummary: document.getElementById("creatorSummary"),
  creatorSummaryMeta: document.getElementById("creatorSummaryMeta"),
  adminSubmissionDateFrom: document.getElementById("adminSubmissionDateFrom"),
  adminSubmissionDateTo: document.getElementById("adminSubmissionDateTo"),
  adminSubmissionFilterReset: document.getElementById("adminSubmissionFilterReset"),
  creatorRequestSummary: document.getElementById("creatorRequestSummary"),
  accountRefreshButton: document.getElementById("accountRefreshButton"),
  accountActiveCreatorCount: document.getElementById("accountActiveCreatorCount"),
  accountActiveTaskCount: document.getElementById("accountActiveTaskCount"),
  accountTaskProductCount: document.getElementById("accountTaskProductCount"),
  accountScopeMeta: document.getElementById("accountScopeMeta"),
  creatorScopeSummary: document.getElementById("creatorScopeSummary"),
  adminLoginPanel: document.getElementById("adminLoginPanel"),
  adminDashboard: document.getElementById("adminDashboard"),
  adminEmailInput: document.getElementById("adminEmailInput"),
  adminPasswordInput: document.getElementById("adminPasswordInput"),
  adminLoginButton: document.getElementById("adminLoginButton"),
  adminLogoutButton: document.getElementById("adminLogoutButton"),
  adminRefreshButton: document.getElementById("adminRefreshButton"),
  adminExportButton: document.getElementById("adminExportButton"),
  compassRefreshButton: document.getElementById("compassRefreshButton"),
  compassCreatorQuery: document.getElementById("compassCreatorQuery"),
  compassTaskFilter: document.getElementById("compassTaskFilter"),
  compassDateFrom: document.getElementById("compassDateFrom"),
  compassDateTo: document.getElementById("compassDateTo"),
  compassCategoryFilter: document.getElementById("compassCategoryFilter"),
  compassConfidenceFilter: document.getElementById("compassConfidenceFilter"),
  compassApplyFilters: document.getElementById("compassApplyFilters"),
  compassOverview: document.getElementById("compassOverview"),
  compassCreatorDetail: document.getElementById("compassCreatorDetail"),
  compassProductHeat: document.getElementById("compassProductHeat"),
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
  brandNewProductsTemplateButton: document.getElementById("brandNewProductsTemplateButton"),
  brandCatalogMeta: document.getElementById("brandCatalogMeta"),
  brandTaskCount: document.getElementById("brandTaskCount"),
  brandTaskTitle: document.getElementById("brandTaskTitle"),
  brandTaskDueAt: document.getElementById("brandTaskDueAt"),
  brandTaskRecommendedCount: document.getElementById("brandTaskRecommendedCount"),
  brandTaskDescription: document.getElementById("brandTaskDescription"),
  brandTaskSelectionHint: document.getElementById("brandTaskSelectionHint"),
  brandTaskCreatorList: document.getElementById("brandTaskCreatorList"),
  brandCreateTaskButton: document.getElementById("brandCreateTaskButton"),
  brandTaskList: document.getElementById("brandTaskList"),
  brandImportFile: document.getElementById("brandImportFile"),
  brandImportButton: document.getElementById("brandImportButton"),
  brandImportTemplateButton: document.getElementById("brandImportTemplateButton"),
  brandProductSearch: document.getElementById("brandProductSearch"),
  brandProductEditor: document.getElementById("brandProductEditor"),
  brandEditDrawer: document.getElementById("brandEditDrawer"),
  brandEditDrawerContent: document.getElementById("brandEditDrawerContent")
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

function formatTaskDate(value) {
  if (!value) return "未设置截止时间";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "未设置截止时间"
    : date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
}

function activeCreatorTask() {
  return state.creatorTasks.find((task) => task.id === state.activeTaskId) || null;
}

function taskServiceMessage(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("active creator account required") || message.includes("creator account is not active")) {
    return "达人账号尚未审核通过，暂不能提交选款";
  }
  if (message.includes("selection task is unavailable")) {
    return "当前选款任务已截止、关闭或未分配，暂不能提交";
  }
  if (message.includes("outside the available task pool") || message.includes("unavailable products")) {
    return "部分已选商品已不在当前任务商品池内，请刷新后重新确认";
  }
  if (message.includes("task scoped submission is required")) {
    return "当前选款未绑定有效任务，请刷新页面后重新选择任务";
  }
  return "任务服务暂不可用，当前已选清单已保留，请刷新页面后重试";
}

function renderCreatorTaskStatus() {
  const task = activeCreatorTask();
  if (els.taskDeadlineValue) {
    if (state.currentRole === "creator" && !state.taskFeatureReady) {
      els.taskDeadlineValue.textContent = "任务服务异常";
    } else if (state.currentRole === "creator" && !task) {
      els.taskDeadlineValue.textContent = "等待任务分配";
    } else if (state.currentRole === "creator") {
      els.taskDeadlineValue.textContent = formatTaskDate(task.due_at);
    } else {
      els.taskDeadlineValue.textContent = "--";
    }
  }
  if (!els.submitStatus) return;
  if (state.currentRole === "creator" && !state.taskFeatureReady) {
    els.submitStatus.textContent = "暂不能提交";
  } else if (state.currentRole === "creator" && !task) {
    els.submitStatus.textContent = "暂无任务";
  } else {
    els.submitStatus.textContent = state.submitted || Boolean(task?.latest_submission_at) ? "已提交" : "选款中";
  }
}

function resetCreatorSelection() {
  state.selected.clear();
  state.featured.clear();
  state.intents.clear();
  state.remarks.clear();
  state.submitted = false;
}

function renderCreatorTaskPanel() {
  if (!els.creatorTaskPanel) return;
  const showPanel = state.currentRole === "creator" && state.view === "selection";
  els.creatorTaskPanel.classList.toggle("hidden", !showPanel);
  els.creatorTaskPanel.classList.toggle("task-service-error", showPanel && !state.taskFeatureReady);
  if (!showPanel) return;

  if (!state.taskFeatureReady) {
    els.creatorTaskHint.textContent = "当前任务服务未正常响应，已选商品和备注不会丢失。";
    els.creatorTaskSelect.innerHTML = `<option value="">暂不能读取任务</option>`;
    els.creatorTaskSelect.disabled = true;
    els.creatorTaskMeta.innerHTML = `<div class="empty">${escapeHtml(
      state.taskServiceError || "任务服务暂不可用，请刷新页面后重试。"
    )}</div>`;
    renderCreatorTaskStatus();
    return;
  }

  if (!state.creatorTasks.length) {
    els.creatorTaskHint.textContent = "当前没有可进行的选款任务，请联系品牌方分配。";
    els.creatorTaskSelect.innerHTML = `<option value="">暂无任务</option>`;
    els.creatorTaskSelect.disabled = true;
    els.creatorTaskMeta.innerHTML = `<div class="empty">任务分配后，这里只会显示该任务指定的商品池。</div>`;
    renderCreatorTaskStatus();
    return;
  }

  const task = activeCreatorTask() || state.creatorTasks[0];
  if (task.id !== state.activeTaskId) {
    state.activeTaskId = task.id;
    localStorage.setItem("inmanActiveTaskId", task.id);
  }
  els.creatorTaskHint.textContent = "商品池仅展示当前任务指定的可见商品。";
  els.creatorTaskSelect.disabled = false;
  els.creatorTaskSelect.innerHTML = state.creatorTasks
    .map(
      (item) =>
        `<option value="${escapeHtml(item.id)}" ${item.id === task.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`
    )
    .join("");
  els.creatorTaskMeta.innerHTML = `
    <span><b>${task.product_count || 0}</b> 款任务商品</span>
    <span><b>${task.recommended_count || "-"}</b> 建议选款数</span>
    <span>截止：<b>${formatTaskDate(task.due_at)}</b></span>
    <span>${task.latest_submission_at ? `最近提交：${formatTaskDate(task.latest_submission_at)}` : "尚未提交"}</span>
    ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ""}
  `;
  renderCreatorTaskStatus();
}

function taskStatusLabel(status) {
  return {
    active: "进行中",
    draft: "草稿",
    closed: "已关闭",
    archived: "已归档",
  }[status] || status;
}

function renderBrandTaskManager() {
  if (!els.brandTaskList || !els.brandTaskCreatorList) return;
  const activeCreators = state.brandCreators.filter((creator) => creator.status === "active");
  const selectedProductCount = [...state.brandSelectedSkus].filter((sku) => {
    const product = productPool.find((item) => item.sku === sku);
    return product && !product.hidden;
  }).length;
  const selectedCreatorCount = state.brandTaskCreatorIds.size;
  const activeTaskCount = state.brandTasks.filter((task) => task.status === "active").length;

  if (els.brandTaskCount) {
    els.brandTaskCount.textContent = `${activeTaskCount} 个进行中`;
  }
  if (els.brandTaskSelectionHint) {
    els.brandTaskSelectionHint.textContent = `已勾选 ${selectedProductCount} 款，已选择 ${selectedCreatorCount} 位达人`;
  }
  if (els.brandCreateTaskButton) {
    els.brandCreateTaskButton.disabled =
      !selectedProductCount || !selectedCreatorCount || Boolean(state.adminSavingSku);
  }

  els.brandTaskCreatorList.innerHTML = activeCreators.length
    ? activeCreators
        .map(
          (creator) => `
            <label class="task-creator-option">
              <input type="checkbox" data-task-creator="${escapeHtml(creator.user_id)}" ${
                state.brandTaskCreatorIds.has(creator.user_id) ? "checked" : ""
              } />
              <span>${escapeHtml(creator.creator_name)}</span>
              <small>${escapeHtml(creator.email)}</small>
            </label>
          `
        )
        .join("")
    : `<div class="empty">暂无已审核达人，请先在后台汇总完成账号审核。</div>`;

  const productsByTask = state.brandTaskProducts.reduce((map, item) => {
    map.set(item.task_id, (map.get(item.task_id) || 0) + 1);
    return map;
  }, new Map());
  const assignmentsByTask = state.brandTaskAssignments.reduce((map, item) => {
    map.set(item.task_id, (map.get(item.task_id) || 0) + 1);
    return map;
  }, new Map());
  const submissionsByTask = state.adminSubmissions.reduce((map, item) => {
    if (!item.task_id) return map;
    map.set(item.task_id, (map.get(item.task_id) || 0) + 1);
    return map;
  }, new Map());

  els.brandTaskList.innerHTML = state.brandTasks.length
    ? state.brandTasks
        .map(
          (task) => `
            <article class="task-list-item">
              <div>
                <strong>${escapeHtml(task.title)}</strong>
                <small>${task.description ? escapeHtml(task.description) : "未填写任务说明"}</small>
                <small>截止：${formatTaskDate(task.due_at)}</small>
              </div>
              <div class="task-list-stats">
                <span>${productsByTask.get(task.id) || 0} 款</span>
                <span>${assignmentsByTask.get(task.id) || 0} 位达人</span>
                <span>${submissionsByTask.get(task.id) || 0} 次提交</span>
              </div>
              <div class="task-list-actions">
                <span class="task-status status-${escapeHtml(task.status)}">${taskStatusLabel(task.status)}</span>
                <button class="ghost-button" data-action="task-status" data-id="${escapeHtml(task.id)}" data-status="${
                  task.status === "active" ? "closed" : "active"
                }" type="button">${task.status === "active" ? "关闭任务" : "重新开启"}</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<div class="empty">尚未创建选款任务。勾选货品、选择达人后即可创建。</div>`;

  renderAccountManagement();
}

function renderAccountManagement() {
  if (!els.creatorScopeSummary) return;

  const activeCreators = state.brandCreators.filter((creator) => creator.status === "active");
  const activeTasks = state.brandTasks.filter((task) => task.status === "active");
  const taskById = new Map(activeTasks.map((task) => [task.id, task]));
  const taskProductCount = state.brandTaskProducts.reduce((map, item) => {
    if (!taskById.has(item.task_id)) return map;
    map.set(item.task_id, (map.get(item.task_id) || 0) + 1);
    return map;
  }, new Map());
  const tasksByCreator = state.brandTaskAssignments.reduce((map, assignment) => {
    const task = taskById.get(assignment.task_id);
    if (!task) return map;
    const list = map.get(assignment.creator_user_id) || [];
    list.push(task);
    map.set(assignment.creator_user_id, list);
    return map;
  }, new Map());

  if (els.accountActiveCreatorCount) els.accountActiveCreatorCount.textContent = activeCreators.length;
  if (els.accountActiveTaskCount) els.accountActiveTaskCount.textContent = activeTasks.length;
  if (els.accountTaskProductCount) {
    els.accountTaskProductCount.textContent = [...taskProductCount.values()].reduce((sum, count) => sum + count, 0);
  }
  if (els.accountScopeMeta) els.accountScopeMeta.textContent = `${activeCreators.length} 位达人`;

  els.creatorScopeSummary.innerHTML = activeCreators.length
    ? activeCreators
        .map((creator) => {
          const creatorTasks = tasksByCreator.get(creator.user_id) || [];
          const visibleProductCount = creatorTasks.reduce(
            (sum, task) => sum + (taskProductCount.get(task.id) || 0),
            0
          );
          return `
            <article class="account-scope-row">
              <div class="account-creator-main">
                <strong>${escapeHtml(creator.creator_name)}</strong>
                <small>${escapeHtml(creator.email)}</small>
                <span class="request-status status-approved">已开通</span>
              </div>
              <div class="account-scope-main">
                <strong>${creatorTasks.length ? `已分配 ${creatorTasks.length} 个活动任务` : "当前未分配活动任务"}</strong>
                <small>${creatorTasks.length ? `任务内可见 ${visibleProductCount} 款商品` : "创建并分配任务后，达人即可看到对应商品池"}</small>
                ${creatorTasks.length
                  ? `<div class="account-task-tags">${creatorTasks
                      .map(
                        (task) =>
                          `<span>${escapeHtml(task.title)} · ${taskProductCount.get(task.id) || 0} 款 · 截止 ${escapeHtml(formatTaskDate(task.due_at))}</span>`
                      )
                      .join("")}</div>`
                  : ""}
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty">暂无已开通达人。审核新达人申请后，其任务与可见商品范围会显示在这里。</div>`;
}

async function loadBrandTaskData(options = {}) {
  if (!cloudEnabled || state.currentRole !== "brand") return false;
  const [tasksResult, productsResult, assignmentsResult, creatorsResult] = await Promise.all([
    cloud.from("selection_tasks").select("*").order("created_at", { ascending: false }).limit(200),
    cloud.from("selection_task_products").select("task_id, sku").limit(10000),
    cloud.from("selection_task_assignments").select("task_id, creator_user_id").limit(10000),
    cloud
      .from("creator_profiles")
      .select("user_id, creator_name, email, status")
      .order("creator_name", { ascending: true })
      .limit(500),
  ]);
  const error = tasksResult.error || productsResult.error || assignmentsResult.error || creatorsResult.error;
  if (error) {
    console.error(error);
    state.brandTasks = [];
    state.brandTaskProducts = [];
    state.brandTaskAssignments = [];
    state.brandCreators = [];
    if (!options.silent) showToast("选款任务尚未升级到云端");
    renderBrandTaskManager();
    return false;
  }
  state.brandTasks = tasksResult.data || [];
  state.brandTaskProducts = productsResult.data || [];
  state.brandTaskAssignments = assignmentsResult.data || [];
  state.brandCreators = creatorsResult.data || [];
  state.brandTaskCreatorIds = new Set(
    [...state.brandTaskCreatorIds].filter((id) => state.brandCreators.some((creator) => creator.user_id === id && creator.status === "active"))
  );
  renderBrandTaskManager();
  return true;
}

async function loadCreatorTasks(options = {}) {
  if (!cloudEnabled || state.currentRole !== "creator") return false;
  const { data, error } = await cloud.rpc("get_creator_selection_tasks");
  if (error) {
    console.error(error);
    state.taskFeatureReady = false;
    state.taskServiceError = taskServiceMessage(error);
    state.creatorTasks = [];
    state.activeTaskId = "";
    renderCreatorTaskPanel();
    if (!options.silent) showToast(state.taskServiceError);
    return false;
  }
  state.taskFeatureReady = true;
  state.taskServiceError = "";
  state.creatorTasks = data || [];
  if (!state.creatorTasks.some((task) => task.id === state.activeTaskId)) {
    state.activeTaskId = state.creatorTasks[0]?.id || "";
    if (state.activeTaskId) localStorage.setItem("inmanActiveTaskId", state.activeTaskId);
    else localStorage.removeItem("inmanActiveTaskId");
  }
  renderCreatorTaskPanel();
  return true;
}

async function createSelectionTask() {
  if (!cloudEnabled || state.currentRole !== "brand") return;
  const title = String(els.brandTaskTitle?.value || "").trim();
  const creatorIds = [...state.brandTaskCreatorIds];
  const skus = [...state.brandSelectedSkus].filter((sku) => {
    const product = productPool.find((item) => item.sku === sku);
    return product && !product.hidden;
  });
  const recommendedRaw = String(els.brandTaskRecommendedCount?.value || "").trim();
  const recommendedCount = recommendedRaw ? Number(recommendedRaw) : null;
  const dueInput = els.brandTaskDueAt?.value || "";
  const dueAt = dueInput ? new Date(dueInput).toISOString() : null;

  if (!title) {
    els.brandTaskTitle?.focus();
    showToast("请填写任务名称");
    return;
  }
  if (!skus.length) {
    showToast("请先在商品池勾选要外发的款式");
    return;
  }
  if (!creatorIds.length) {
    showToast("请至少选择一位已审核达人");
    return;
  }
  if (recommendedCount != null && (!Number.isInteger(recommendedCount) || recommendedCount < 1 || recommendedCount > 200)) {
    showToast("建议选款数请输入 1-200 的整数");
    return;
  }
  if (dueInput && Number.isNaN(new Date(dueInput).getTime())) {
    showToast("截止时间格式不正确");
    return;
  }

  state.adminSavingSku = "task";
  renderBrandTaskManager();
  const { error } = await cloud.rpc("create_selection_task", {
    p_title: title,
    p_description: String(els.brandTaskDescription?.value || "").trim(),
    p_due_at: dueAt,
    p_recommended_count: recommendedCount,
    p_creator_user_ids: creatorIds,
    p_skus: skus,
  });
  state.adminSavingSku = "";
  if (error) {
    console.error(error);
    showToast("任务创建失败，请确认云端任务迁移已执行");
    renderBrandTaskManager();
    return;
  }
  state.brandSelectedSkus.clear();
  state.brandTaskCreatorIds.clear();
  if (els.brandTaskTitle) els.brandTaskTitle.value = "";
  if (els.brandTaskDueAt) els.brandTaskDueAt.value = "";
  if (els.brandTaskRecommendedCount) els.brandTaskRecommendedCount.value = "";
  if (els.brandTaskDescription) els.brandTaskDescription.value = "";
  showToast(`已创建任务并分配给 ${creatorIds.length} 位达人`);
  await Promise.all([loadBrandTaskData({ silent: true }), loadAdminData()]);
  renderBrandProductEditor();
}

async function updateSelectionTaskStatus(taskId, status) {
  if (!cloudEnabled || state.currentRole !== "brand") return;
  const { error } = await cloud
    .from("selection_tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) {
    console.error(error);
    showToast("任务状态更新失败");
    return;
  }
  showToast(status === "closed" ? "任务已关闭，达人将无法继续访问该任务" : "任务已重新开启");
  await loadBrandTaskData({ silent: true });
}

function refreshProductViews() {
  applyProductOverrides();
  pruneHiddenSelections();
  initFilters();
  renderProducts();
  renderSelected();
  renderAdmin();
  renderBrandProductEditor();
  renderBrandTaskManager();
  renderCreatorTaskPanel();
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

// The catalog stores the override image as a data URL. Accept large source files,
// but optimize them before storing so the catalog stays responsive and reliable.
const IMAGE_SOURCE_PREFERRED_BYTES = 500 * 1024 * 1024;
const IMAGE_BROWSER_HARD_LIMIT_BYTES = 800 * 1024 * 1024;
const IMAGE_STORAGE_TARGET_BYTES = Math.floor(1.4 * 1024 * 1024);
const IMAGE_STANDARD_MAX_EDGE = 2600;
const IMAGE_LARGE_SOURCE_MAX_EDGE = 1800;
const IMAGE_MAX_CANVAS_PIXELS = 8_000_000;

function formatImageBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(value >= 100 ? 0 : 1)}MB`;
  if (value >= 1024) return `${Math.ceil(value / 1024)}KB`;
  return `${value}B`;
}

function getImageFileName(name, extension = "webp") {
  const baseName = String(name || "商品图片").replace(/\.[^.]+$/, "") || "商品图片";
  return `${baseName}.${extension}`;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image-decode-failed"));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("image-compress-failed"))), type, quality);
  });
}

function fitImageDimensions(width, height, maxEdge) {
  const pixelScale = Math.sqrt(IMAGE_MAX_CANVAS_PIXELS / Math.max(width * height, 1));
  const edgeScale = Math.min(maxEdge / Math.max(width, 1), maxEdge / Math.max(height, 1));
  const scale = Math.min(1, pixelScale, edgeScale);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function optimizeImageForStorage(file) {
  if (!file?.type?.startsWith("image/")) throw new Error("image-type-invalid");
  if (file.size > IMAGE_BROWSER_HARD_LIMIT_BYTES) throw new Error("image-source-too-large");
  if (file.size <= IMAGE_STORAGE_TARGET_BYTES) {
    return { file, compressed: false, sourceSize: file.size, outputSize: file.size };
  }

  const image = await loadImageFromFile(file);
  const maxEdge = file.size > IMAGE_SOURCE_PREFERRED_BYTES
    ? IMAGE_LARGE_SOURCE_MAX_EDGE
    : IMAGE_STANDARD_MAX_EDGE;
  let { width, height } = fitImageDimensions(image.naturalWidth || image.width, image.naturalHeight || image.height, maxEdge);
  let lastBlob = null;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("image-compress-failed");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const quality = Math.max(0.48, 0.88 - attempt * 0.06);
    lastBlob = await canvasToBlob(canvas, "image/webp", quality);
    if (lastBlob.size <= IMAGE_STORAGE_TARGET_BYTES) {
      return {
        file: new File([lastBlob], getImageFileName(file.name), { type: "image/webp" }),
        compressed: true,
        sourceSize: file.size,
        outputSize: lastBlob.size,
      };
    }

    const scale = Math.min(0.82, Math.max(0.45, Math.sqrt(IMAGE_STORAGE_TARGET_BYTES / lastBlob.size) * 0.92));
    // Never enlarge a small source image while trying to reduce its file size.
    const nextWidth = Math.max(1, Math.round(width * scale));
    const nextHeight = Math.max(1, Math.round(height * scale));
    if (nextWidth === width && nextHeight === height) break;
    width = nextWidth;
    height = nextHeight;
  }

  if (!lastBlob || lastBlob.size > IMAGE_STORAGE_TARGET_BYTES) throw new Error("image-compress-insufficient");
  return {
    file: new File([lastBlob], getImageFileName(file.name), { type: "image/webp" }),
    compressed: true,
    sourceSize: file.size,
    outputSize: lastBlob.size,
  };
}

function imageDraftHint(sku, hasOverrideImage) {
  const draft = state.productImageDrafts.get(sku);
  if (!draft) return hasOverrideImage ? "当前使用已上传图片" : "未上传新图则保留当前图片";
  const source = draft.source === "paste" ? "已粘贴图片" : "已选择图片";
  const size = formatImageBytes(draft.file.size);
  return draft.file.size > IMAGE_STORAGE_TARGET_BYTES
    ? `${source}（${size}），保存时自动压缩`
    : `${source}（${size}），保存时将直接使用`;
}

function updateImageDraftStatus(sku) {
  const status = document.querySelector(`[data-image-upload-status="${sku}"]`);
  const product = productPool.find((item) => item.sku === sku);
  if (!status || !product) return;
  status.textContent = imageDraftHint(sku, Boolean(state.productOverrides.get(sku)?.image_url));
}

function stageImageDraft(sku, file, source) {
  if (!file?.type?.startsWith("image/")) throw new Error("image-type-invalid");
  if (file.size > IMAGE_BROWSER_HARD_LIMIT_BYTES) throw new Error("image-source-too-large");
  state.productImageDrafts.set(sku, { file, source });
  updateImageDraftStatus(sku);
}

const BRAND_ADMIN_EMAILS = new Set([
  "yanjianxi02@gmail.com",
  "huangshaoqing@inman.cc",
]);

function isAdminEmail(email) {
  return BRAND_ADMIN_EMAILS.has(String(email || "").trim().toLowerCase());
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
  navButtonsFor("accounts").forEach((button) => button.classList.toggle("hidden", creatorOnly));
  navButtonsFor("brand").forEach((button) => button.classList.toggle("hidden", creatorOnly));
  navButtonsFor("compass").forEach((button) => button.classList.toggle("hidden", creatorOnly));
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
  els.productGrid.classList.toggle("compact-density", state.productDensity === "compact");
  els.standardDensityButton?.classList.toggle("active", state.productDensity === "standard");
  els.compactDensityButton?.classList.toggle("active", state.productDensity === "compact");
  els.standardDensityButton?.setAttribute("aria-pressed", String(state.productDensity === "standard"));
  els.compactDensityButton?.setAttribute("aria-pressed", String(state.productDensity === "compact"));
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

function setProductDensity(density) {
  const nextDensity = density === "compact" ? "compact" : "standard";
  if (state.productDensity === nextDensity) return;
  state.productDensity = nextDensity;
  localStorage.setItem("inmanProductDensity", nextDensity);
  if (nextDensity === "compact" && state.visibleLimit < 100) state.visibleLimit = 100;
  renderProducts();
}

function renderSelected() {
  const selectedProducts = [...state.selected.values()];
  els.selectedCount.textContent = selectedProducts.length;
  els.drawerCount.textContent = selectedProducts.length;
  renderCreatorTaskStatus();

  if (!selectedProducts.length) {
    els.selectedDrawer.innerHTML = `<div class="empty">还没有选择商品</div>`;
    els.selectedTable.innerHTML = `<div class="empty">还没有选择商品</div>`;
  } else {
    els.selectedDrawer.innerHTML = selectedProducts
      .map(
        (product) => `
          <div class="selected-item" data-selected-id="${product.id}" draggable="true">
            <span class="selected-drag-handle" title="拖拽调整选款顺序" aria-label="拖拽调整选款顺序"><i data-lucide="grip-vertical"></i></span>
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
          <div class="selected-row" data-selected-id="${product.id}" draggable="true">
            <span class="selected-drag-handle" title="拖拽调整选款顺序" aria-label="拖拽调整选款顺序"><i data-lucide="grip-vertical"></i></span>
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

  const dateFrom = state.adminSubmissionFilters.dateFrom
    ? new Date(`${state.adminSubmissionFilters.dateFrom}T00:00:00`)
    : null;
  const dateTo = state.adminSubmissionFilters.dateTo
    ? new Date(`${state.adminSubmissionFilters.dateTo}T23:59:59.999`)
    : null;
  const filteredSubmissions = state.adminSubmissions.filter((submission) => {
    const submittedAt = new Date(submission.submitted_at);
    return (!dateFrom || submittedAt >= dateFrom) && (!dateTo || submittedAt <= dateTo);
  });

  if (els.adminSubmissionDateFrom) els.adminSubmissionDateFrom.value = state.adminSubmissionFilters.dateFrom;
  if (els.adminSubmissionDateTo) els.adminSubmissionDateTo.value = state.adminSubmissionFilters.dateTo;
  if (els.creatorSummaryMeta) {
    const rangeText = [state.adminSubmissionFilters.dateFrom, state.adminSubmissionFilters.dateTo]
      .filter(Boolean)
      .join(" 至 ");
    els.creatorSummaryMeta.textContent = rangeText
      ? `${rangeText} · ${filteredSubmissions.length} 次提交`
      : `全部记录 · ${filteredSubmissions.length} 次提交`;
  }

  els.creatorSummary.innerHTML = filteredSubmissions.length
    ? filteredSubmissions
        .map(
          (submission) => `
            <div class="summary-row">
              <div>
                <strong>${escapeHtml(submission.creator_name)}</strong>
                <small>${new Date(submission.submitted_at).toLocaleString("zh-CN")}</small>
              </div>
              <div class="submission-row-actions">
                <strong>${submission.item_count} 款</strong>
                <button class="ghost-button compact-action" data-action="view-submission" data-id="${escapeHtml(submission.id)}" type="button">查看明细</button>
              </div>
            </div>
          `
        )
        .join("")
    : `<div class="empty">当前日期范围暂无达人提交记录</div>`;

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

  renderAccountManagement();
}

function openSubmissionDetail(submissionId) {
  const submission = state.adminSubmissions.find((item) => item.id === submissionId);
  if (!submission) {
    showToast("未找到该次提交");
    return;
  }

  const items = state.adminItems
    .filter((item) => item.submission_id === submission.id)
    .sort((a, b) => (a.selection_order || 0) - (b.selection_order || 0));

  els.detailContent.innerHTML = `
    <div class="submission-detail">
      <div class="detail-head">
        <div>
          <p class="eyebrow">达人提交明细</p>
          <h2>${escapeHtml(submission.creator_name)}</h2>
          <p>${new Date(submission.submitted_at).toLocaleString("zh-CN")} · 共 ${submission.item_count} 款</p>
        </div>
      </div>
      <div class="submission-detail-list">
        ${items.length
          ? items.map((item, index) => `
              <article class="submission-detail-item">
                <span class="submission-order">${item.selection_order || index + 1}</span>
                <div>
                  <strong>${escapeHtml(item.product_name || "商品")} ${escapeHtml(item.sku || "")}</strong>
                  <small>${escapeHtml(item.category || "未标注")} · ¥${normalizePriceValue(item.price) ?? "-"} · ${escapeHtml(item.style || "未标注")}</small>
                  ${item.is_featured ? `<span class="featured-label">重点款</span>` : ""}
                  ${item.intent ? `<span class="submission-intent">${escapeHtml(item.intent)}</span>` : ""}
                  ${item.remark ? `<p>${escapeHtml(item.remark)}</p>` : ""}
                </div>
              </article>
            `).join("")
          : `<div class="empty">该次提交暂无商品明细</div>`}
      </div>
    </div>
  `;
  els.modal.classList.remove("hidden");
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
  renderBrandTaskManager();
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

function closeBrandProductEditor() {
  state.brandEditingSku = "";
  if (!els.brandEditDrawer) return;
  els.brandEditDrawer.classList.add("hidden");
  els.brandEditDrawer.setAttribute("aria-hidden", "true");
}

function openBrandProductEditor(sku) {
  if (!productPool.some((product) => product.sku === sku)) return;
  state.brandEditingSku = sku;
  renderBrandProductEditDrawer();
}

function renderBrandProductEditDrawer() {
  if (!els.brandEditDrawer || !els.brandEditDrawerContent) return;
  const product = productPool.find((item) => item.sku === state.brandEditingSku);
  if (!product) {
    closeBrandProductEditor();
    return;
  }

  const override = state.productOverrides.get(product.sku) || {};
  const baseProduct = baseProductPool.find((item) => item.sku === product.sku) || product;
  const saving = state.adminSavingSku === product.sku;
  const hasOverrideImage = Boolean(override.image_url);
  const imageHint = imageDraftHint(product.sku, hasOverrideImage);
  const currentLevel = override.plan_level || product.level || "";
  const sortPriority = productSortPriority(product, override);

  els.brandEditDrawerContent.innerHTML = `
    <div class="brand-edit-product-summary">
      <div class="brand-edit-product-image">
        <img src="${product.img}" alt="${escapeHtml(product.name)}" />
        <button class="image-preview-button editor-preview-button" data-action="preview" data-id="${product.id}" type="button" aria-label="放大查看图片" title="查看图片">
          <i data-lucide="eye"></i>
        </button>
      </div>
      <div>
        <strong>${escapeHtml(product.name)} <span class="sku">${escapeHtml(product.sku)}</span></strong>
        <p>基准：${priceText(baseProduct)} · ${escapeHtml(baseProduct.style || "未标注风格")} · ${escapeHtml(baseProduct.level || "未标注等级")}</p>
        <div class="brand-edit-tags">
          <span class="visibility-pill ${product.hidden ? "hidden-product" : ""}">${visibilityText(product)}</span>
          ${sortPriority ? `<span class="priority-pill">前排 #${sortPriority}</span>` : ""}
        </div>
      </div>
    </div>
    <div class="brand-edit-fields">
      <label>
        <span>价格</span>
        <input data-override-sku="${product.sku}" data-override-field="price" value="${override.price ?? product.price ?? ""}" inputmode="decimal" />
      </label>
      <label>
        <span>现货库存</span>
        <input data-override-sku="${product.sku}" data-override-field="stock" value="${product.stock ?? ""}" inputmode="numeric" placeholder="例如 500" />
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
              const label = level || "未标注";
              return `<option value="${level}" ${currentLevel === level ? "selected" : ""}>${label}</option>`;
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
      <label class="brand-edit-image-field">
        <span>本地上传</span>
        <input data-override-sku="${product.sku}" data-override-field="image_file" type="file" accept="image/*" />
        <small class="field-hint" data-image-upload-status="${product.sku}">${imageHint}</small>
      </label>
      <div class="brand-image-paste-zone" data-action="focus-image-paste" data-id="${product.sku}" data-image-paste-zone="${product.sku}" tabindex="0" role="button" aria-label="粘贴图片">
        <i data-lucide="clipboard-paste"></i>
        <div>
          <strong>粘贴图片</strong>
          <small>点击后按 Ctrl+V，可直接粘贴截图或复制的图片</small>
        </div>
      </div>
      <p class="brand-image-policy">支持上传或粘贴图片。源图 500MB 以内可直接处理；超过时保存前会自动加强压缩。为保证云端稳定，超过 1.4MB 的图片都会压缩为展示版本。</p>
    </div>
    <footer class="brand-edit-footer">
      <button class="ghost-button" data-action="reset-override" data-id="${product.sku}" type="button" ${saving ? "disabled" : ""}>恢复BI原始值</button>
      <button class="primary-button" data-action="save-override" data-id="${product.sku}" type="button" ${saving ? "disabled" : ""}>
        <i data-lucide="save"></i><span>${saving ? "保存中" : "保存修改"}</span>
      </button>
    </footer>
  `;
  els.brandEditDrawer.classList.remove("hidden");
  els.brandEditDrawer.setAttribute("aria-hidden", "false");
  refreshIcons();
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
          const checked = state.brandSelectedSkus.has(product.sku);
          const sortPriority = productSortPriority(product, override);
          return `
            <article class="editor-row">
              <label class="editor-check">
                <input type="checkbox" data-brand-select="${product.sku}" ${checked ? "checked" : ""} />
              </label>
              <div class="editor-image">
                <img src="${product.img}" alt="${escapeHtml(product.name)}" />
                <button class="image-preview-button editor-preview-button" data-action="preview" data-id="${product.id}" type="button" aria-label="放大查看图片" title="查看图片">
                  <i data-lucide="eye"></i>
                </button>
              </div>
              <div class="editor-meta">
                <strong>${escapeHtml(product.name)} <span class="sku">${escapeHtml(product.sku)}</span></strong>
                <small>${escapeHtml(product.category || "未标注类目")} · ${escapeHtml(product.style || "未标注风格")}</small>
              </div>
              <div class="editor-stat">
                <span>价格</span>
                <strong>${priceText(product)}</strong>
              </div>
              <div class="editor-stat">
                <span>现货</span>
                <strong>${product.stock == null ? "待更新" : `${product.stock}`}</strong>
              </div>
              <div class="editor-stat editor-presale">
                <span>预售 / 产能</span>
                <strong>${escapeHtml(product.presale_stock || "未设置")}</strong>
              </div>
              <div class="editor-tags">
                <span class="editor-level level-${escapeHtml(product.level || "unmarked").toLowerCase()}">${escapeHtml(product.level || "未标注")}</span>
                <span class="visibility-pill ${product.hidden ? "hidden-product" : ""}">${visibilityText(product)}</span>
                ${sortPriority ? `<span class="priority-pill">前排 #${sortPriority}</span>` : ""}
              </div>
              <div class="editor-buttons">
                <button class="icon-button" data-action="edit-override" data-id="${product.sku}" type="button" aria-label="编辑商品" title="编辑商品">
                  <i data-lucide="pencil"></i>
                </button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty">没有匹配到商品</div>`;
  renderBrandBatchState(visibleSkus);
  renderBrandFrontQueue();
  renderBrandProductEditDrawer();
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

function compassArray(value) {
  return Array.isArray(value) ? value : [];
}

function compassNumber(value, digits = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toLocaleString("zh-CN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function compassRate(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return `${(number * 100).toFixed(number * 100 % 1 ? 1 : 0)}%`;
}

function compassDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function compassConfidenceClass(value) {
  return value === "稳定偏好" ? "stable" : value === "初步倾向" ? "initial" : "insufficient";
}

function compassDateParam(value) {
  return value ? `${value}T00:00:00+08:00` : null;
}

function compassMetric(label, value, hint = "") {
  return `
    <div class="compass-kpi">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
    </div>
  `;
}

function compassBarRows(items, options = {}) {
  const records = compassArray(items);
  if (!records.length) return `<div class="empty tiny">暂无可分析样本</div>`;
  const max = Math.max(...records.map((item) => Number(item.selection_rate) || 0), 0.01);
  return records
    .map((item) => {
      const rate = Number(item.selection_rate) || 0;
      const bar = Math.max(3, Math.round((rate / max) * 100));
      return `
        <div class="compass-bar-row">
          <div class="compass-bar-top">
            <strong>${escapeHtml(item.label || "未标注")}</strong>
            <span>${compassRate(item.selection_rate)} · ${compassNumber(item.selected_count)} / ${compassNumber(item.available_count)}</span>
          </div>
          <div class="compass-bar-track"><span style="width:${bar}%"></span></div>
          <div class="compass-bar-meta">
            <span>重点 ${compassNumber(item.featured_count)} · 重点率 ${compassRate(item.featured_rate)}</span>
            ${options.showOrder === false ? "" : `<span>平均顺位 ${compassNumber(item.average_selection_order, 1)} · 前三 ${compassNumber(item.top_three_count)}</span>`}
          </div>
        </div>
      `;
    })
    .join("");
}

function compassBreakdownCard(title, items, options = {}) {
  const records = options.categorySort
    ? [...compassArray(items)].sort((left, right) => {
        if (state.compassCategorySort === "count") {
          return (Number(right.selected_count) - Number(left.selected_count))
            || (Number(right.selection_rate) - Number(left.selection_rate))
            || String(left.label || "").localeCompare(String(right.label || ""), "zh-CN");
        }
        return (Number(right.selection_rate) - Number(left.selection_rate))
          || (Number(right.selected_count) - Number(left.selected_count))
          || String(left.label || "").localeCompare(String(right.label || ""), "zh-CN");
      })
    : items;
  const categorySortControl = options.categorySort
    ? `<div class="compass-sort-toggle" role="group" aria-label="品类偏好排序">
        <button type="button" class="${state.compassCategorySort === "rate" ? "active" : ""}" data-action="compass-category-sort" data-sort="rate">选择率</button>
        <button type="button" class="${state.compassCategorySort === "count" ? "active" : ""}" data-action="compass-category-sort" data-sort="count">选择数量</button>
      </div>`
    : "";
  return `
    <section class="compass-card compass-breakdown-card">
      <div class="compass-card-head">
        <div><h3>${escapeHtml(title)}</h3><span>可选 / 已选 / 选择率</span></div>
        ${categorySortControl}
      </div>
      <div class="compass-bar-list">${compassBarRows(records, options)}</div>
    </section>
  `;
}

function renderCompassFilters() {
  const data = state.compassOverviewData;
  if (!data || !els.compassTaskFilter || !els.compassCategoryFilter) return;
  const tasks = compassArray(data.filters?.tasks);
  const categories = compassArray(data.filters?.categories);
  els.compassTaskFilter.innerHTML = [
    `<option value="">全部任务</option>`,
    ...tasks.map((task) => `<option value="${escapeHtml(task.id)}">${escapeHtml(task.title)}</option>`),
  ].join("");
  els.compassCategoryFilter.innerHTML = [
    `<option value="">全部品类</option>`,
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`),
  ].join("");
  els.compassTaskFilter.value = state.compassFilters.taskId;
  els.compassCategoryFilter.value = state.compassFilters.category;
  els.compassCreatorQuery.value = state.compassFilters.creatorQuery;
  els.compassDateFrom.value = state.compassFilters.dateFrom;
  els.compassDateTo.value = state.compassFilters.dateTo;
  els.compassConfidenceFilter.value = state.compassFilters.confidence;
}

function renderCompassOverview() {
  if (!els.compassOverview) return;
  const data = state.compassOverviewData;
  if (!data) {
    els.compassOverview.innerHTML = `<div class="compass-card"><div class="empty">暂无分析数据。请确认“达人选品罗盘”分析迁移已执行，并使用品牌方账号刷新。</div></div>`;
    return;
  }
  const summary = data.summary || {};
  const creators = compassArray(data.creators);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(creators.length / pageSize));
  state.compassCreatorPage = Math.min(Math.max(state.compassCreatorPage, 1), pageCount);
  const start = (state.compassCreatorPage - 1) * pageSize;
  const pageCreators = creators.slice(start, start + pageSize);

  els.compassOverview.innerHTML = `
    <div class="compass-kpi-grid">
      ${compassMetric("已审核达人", compassNumber(summary.approved_creator_count))}
      ${compassMetric("已创建任务", compassNumber(summary.created_task_count))}
      ${compassMetric("已提交任务", compassNumber(summary.submitted_task_count))}
      ${compassMetric("有效选款明细", compassNumber(summary.valid_selection_item_count))}
      ${compassMetric("累计重点款", compassNumber(summary.featured_selection_count))}
      ${compassMetric("平均每次选款", compassNumber(summary.average_selection_count, 1))}
      ${compassMetric("数据不足达人", compassNumber(summary.data_insufficient_creator_count))}
      ${compassMetric("近30天有提交达人", compassNumber(summary.recent_submit_creator_count))}
    </div>
    <section class="compass-card compass-creator-card">
      <div class="compass-card-head">
        <div>
          <h3>达人选款画像</h3>
          <p>${escapeHtml(data.scope_note || "选择率仅按任务商品范围计算")}</p>
        </div>
        <span>${creators.length} 位达人</span>
      </div>
      <div class="compass-table-wrap">
        <table class="compass-table">
          <thead>
            <tr>
              <th>达人</th><th>任务</th><th>选款</th><th>重点</th><th>核心偏好</th><th>品牌推荐命中</th><th>置信度</th><th>最近提交</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${pageCreators.length ? pageCreators.map((creator) => `
              <tr>
                <td><strong>${escapeHtml(creator.creator_name || "未命名达人")}</strong></td>
                <td><b>${compassNumber(creator.submitted_task_count)}</b> / ${compassNumber(creator.assigned_task_count)}<small>完成 ${compassRate(creator.task_completion_rate)}</small></td>
                <td><b>${compassNumber(creator.selected_count)}</b><small>平均 ${compassNumber(creator.average_selection_count, 1)} / 次</small></td>
                <td><b>${compassNumber(creator.featured_count)}</b><small>${compassRate(creator.featured_rate)}</small></td>
                <td><span>${escapeHtml(creator.core_category || "未标注")}</span><small>${escapeHtml(creator.core_price_band || "-")} · ${escapeHtml(creator.core_style || "-")}</small></td>
                <td>${compassRate(creator.brand_recommendation_hit_rate)}</td>
                <td><span class="compass-confidence ${compassConfidenceClass(creator.data_confidence)}">${escapeHtml(creator.data_confidence || "数据不足")}</span></td>
                <td>${compassDateTime(creator.latest_submission_at)}</td>
                <td><button class="ghost-button compass-open-button" data-action="compass-open-creator" data-id="${escapeHtml(creator.creator_user_id)}" type="button">查看</button></td>
              </tr>
            `).join("") : `<tr><td colspan="9"><div class="empty tiny">当前筛选条件下暂无达人任务数据</div></td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="compass-pagination">
        <span>第 ${state.compassCreatorPage} / ${pageCount} 页</span>
        <button class="ghost-button" data-action="compass-creator-page" data-page="${state.compassCreatorPage - 1}" type="button" ${state.compassCreatorPage <= 1 ? "disabled" : ""}>上一页</button>
        <button class="ghost-button" data-action="compass-creator-page" data-page="${state.compassCreatorPage + 1}" type="button" ${state.compassCreatorPage >= pageCount ? "disabled" : ""}>下一页</button>
      </div>
    </section>
  `;
  renderCompassFilters();
  refreshIcons();
}

function renderCompassProductHeat() {
  if (!els.compassProductHeat) return;
  const data = state.compassProductHeatData;
  if (!data) {
    els.compassProductHeat.innerHTML = "";
    return;
  }
  const items = compassArray(data.items);
  const currentPage = Math.floor(state.compassHeatOffset / 50) + 1;
  const pageCount = Math.max(1, Math.ceil(Number(data.total_count || 0) / 50));
  els.compassProductHeat.innerHTML = `
    <section class="compass-card compass-heat-card">
      <div class="compass-card-head">
        <div>
          <h3>商品达人热度</h3>
          <p>基于已分配达人、已选、重点款与选款顺序；标签判断依据可展开查看。</p>
        </div>
        <span>${compassNumber(data.total_count)} 款</span>
      </div>
      <div class="compass-heat-list">
        ${items.length ? items.map((item) => {
          const labels = compassArray(item.labels);
          const remarks = compassArray(item.raw_remarks);
          return `
            <article class="compass-heat-row">
              <div class="compass-heat-product"><strong>${escapeHtml(item.product_name || "未命名商品")}</strong><span class="compass-heat-sku">${escapeHtml(item.sku || "-")}</span><small>${escapeHtml(item.category || "未标注")} · ${escapeHtml(item.style || "未标注")} · ${escapeHtml(item.plan_level || "未标注")}</small></div>
              <div><span>分配</span><strong>${compassNumber(item.assigned_creator_count)} 人</strong></div>
              <div><span>选择率</span><strong>${compassRate(item.selection_rate)}</strong><small>${compassNumber(item.selected_creator_count)} 人选择</small></div>
              <div><span>重点款率</span><strong>${compassRate(item.featured_rate)}</strong><small>前三 ${compassNumber(item.top_three_count)} 次 · 平均 ${compassNumber(item.average_selection_order, 1)} 顺位</small></div>
              <div class="compass-heat-tags">${labels.length ? labels.map((label) => `<span class="compass-heat-tag" title="${escapeHtml(label.reason || "")}">${escapeHtml(label.tag || "")}</span>`).join("") : `<span class="compass-muted">暂无标签</span>`}</div>
              <details class="compass-heat-detail"><summary>查看达人与备注</summary><p><b>已选：</b>${escapeHtml(compassArray(item.selected_creator_names).join("、") || "暂无")}</p><p><b>未选：</b>${escapeHtml(compassArray(item.not_selected_creator_names).join("、") || "暂无")}</p>${remarks.length ? `<div class="compass-raw-remarks">${remarks.map((remark) => `<div><b>${escapeHtml(remark.creator_name || "达人")}</b><span>${escapeHtml(compassDateTime(remark.submitted_at))}</span><p>${escapeHtml(remark.remark || "")}</p><small>${escapeHtml(compassArray(remark.labels).join("、") || "其他")}</small></div>`).join("")}</div>` : `<p class="compass-muted">暂无达人备注</p>`}</details>
            </article>
          `;
        }).join("") : `<div class="empty">尚无可计算商品热度的已提交任务。</div>`}
      </div>
      <div class="compass-pagination">
        <span>第 ${currentPage} / ${pageCount} 页</span>
        <button class="ghost-button" data-action="compass-heat-page" data-offset="${Math.max(state.compassHeatOffset - 50, 0)}" type="button" ${state.compassHeatOffset <= 0 ? "disabled" : ""}>上一页</button>
        <button class="ghost-button" data-action="compass-heat-page" data-offset="${state.compassHeatOffset + 50}" type="button" ${currentPage >= pageCount ? "disabled" : ""}>下一页</button>
      </div>
    </section>
  `;
}

function renderCompassCreatorDetail() {
  if (!els.compassCreatorDetail) return;
  const data = state.compassCreatorDetailData;
  if (!data) {
    els.compassCreatorDetail.classList.add("hidden");
    els.compassCreatorDetail.innerHTML = "";
    return;
  }
  const overview = data.overview || {};
  const breakdowns = data.breakdowns || {};
  const recommendation = data.brand_recommendation || {};
  const habits = data.selection_habits || {};
  const history = data.history || {};
  const cards = compassArray(data.experience_cards);
  const rawRemarks = compassArray(data.remarks?.raw);
  const remarkCategories = compassArray(data.remarks?.categories);
  const historyRecords = compassArray(history.records);
  const historyPage = Number(history.page || 1);
  const historyPages = Math.max(1, Math.ceil(Number(history.total_count || 0) / Number(history.page_size || 8)));
  const topTraits = habits.top_three_traits || {};
  const traitText = [
    compassArray(topTraits.categories).length ? `品类：${compassArray(topTraits.categories).join("、")}` : "",
    compassArray(topTraits.price_bands).length ? `价格带：${compassArray(topTraits.price_bands).join("、")}` : "",
    compassArray(topTraits.styles).length ? `风格线：${compassArray(topTraits.styles).join("、")}` : "",
  ].filter(Boolean).join("；") || "暂无前三顺位样本";
  const historical = data.historical_unscoped_distribution || {};

  els.compassCreatorDetail.classList.remove("hidden");
  els.compassCreatorDetail.innerHTML = `
    <section class="compass-detail-head">
      <div>
        <button class="text-button" data-action="compass-close-detail" type="button"><i data-lucide="arrow-left"></i><span>返回达人总览</span></button>
        <p class="eyebrow">达人选款详情</p>
        <h2>${escapeHtml(data.creator?.creator_name || "达人")}</h2>
        <p>${escapeHtml(data.disclaimer || "偏好强度不代表商品实际销售表现。")}</p>
      </div>
      <span class="compass-confidence ${compassConfidenceClass(overview.data_confidence)}">${escapeHtml(overview.data_confidence || "数据不足")}</span>
    </section>
    <div class="compass-kpi-grid compass-detail-kpis">
      ${compassMetric("分配任务", compassNumber(overview.assigned_task_count))}
      ${compassMetric("已提交任务", compassNumber(overview.submitted_task_count), `完成 ${compassRate(overview.task_completion_rate)}`)}
      ${compassMetric("累计选款", compassNumber(overview.selected_count), `平均 ${compassNumber(overview.average_selection_count, 1)} / 次`)}
      ${compassMetric("累计重点款", compassNumber(overview.featured_count), `占比 ${compassRate(overview.featured_rate)}`)}
      ${compassMetric("品牌推荐命中", compassRate(overview.brand_recommendation_hit_rate))}
      ${compassMetric("有效分析任务", compassNumber(overview.valid_analysis_task_count))}
      ${compassMetric("可选样本量", compassNumber(overview.available_sample_count))}
      ${compassMetric("最近提交", compassDateTime(overview.latest_submission_at))}
    </div>
    <div class="compass-breakdown-grid">
      ${compassBreakdownCard("品类偏好", breakdowns.category, { categorySort: true })}
      ${compassBreakdownCard("价格带偏好", breakdowns.price_band)}
      ${compassBreakdownCard("风格线偏好", breakdowns.style)}
      ${compassBreakdownCard("商品等级偏好", breakdowns.plan_level, { showOrder: false })}
      ${compassBreakdownCard("选款库存分布", breakdowns.stock_band, { showOrder: false })}
      <section class="compass-card compass-habit-card">
        <div class="compass-card-head"><h3>选款习惯</h3><span>任务内行为</span></div>
        <dl class="compass-definition-list">
          <div><dt>建议选款数达成率</dt><dd>${compassRate(overview.recommended_completion_rate)}</dd></div>
          <div><dt>平均偏好强度</dt><dd>${compassNumber(habits.average_preference_strength, 1)}</dd></div>
          ${overview.on_time_submission_rate == null ? "" : `<div><dt>设置截止时间任务的按时提交率</dt><dd>${compassRate(overview.on_time_submission_rate)}</dd></div>`}
          <div><dt>前三商品共同特征</dt><dd>${escapeHtml(traitText)}</dd></div>
        </dl>
      </section>
    </div>
    <section class="compass-card compass-alignment-card">
      <div class="compass-card-head"><div><h3>品牌推荐匹配</h3><p>重合度仅表示当前选款方向一致性，不代表销售结果。</p></div><span>${compassRate(recommendation.direction_overlap_rate)} 方向重合</span></div>
      <div class="compass-mini-grid">
        ${compassMetric("品牌推荐且已选", compassNumber(recommendation.brand_recommended_selected_count))}
        ${compassMetric("品牌推荐但未选", compassNumber(recommendation.brand_recommended_not_selected_count))}
        ${compassMetric("重点但非品牌前排", compassNumber(recommendation.featured_not_brand_recommended_count))}
        ${compassMetric("品牌前排可选款", compassNumber(recommendation.brand_recommended_available_count))}
      </div>
    </section>
    <section class="compass-card">
      <div class="compass-card-head"><div><h3>动态经验卡</h3><p>只基于任务范围和已提交选款生成；低样本会明确标记。</p></div></div>
      <div class="compass-experience-grid">${cards.length ? cards.map((card) => `
        <article class="compass-experience-card">
          <div><span class="compass-confidence ${compassConfidenceClass(card.data_confidence)}">${escapeHtml(card.data_confidence || "数据不足")}</span><h4>${escapeHtml(card.label || "未标注")} · ${escapeHtml(card.title || "经验")}</h4></div>
          <p>${escapeHtml(card.conclusion || "当前样本不足以形成结论。")}</p>
          <small>${compassDateTime(card.data_time_range_start)} 至 ${compassDateTime(card.data_time_range_end)} · ${compassNumber(card.support_task_count)} 个任务 · 可选 ${compassNumber(card.available_count)} · 已选 ${compassNumber(card.selected_count)} · 选择率 ${compassRate(card.selection_rate)} · 重点 ${compassNumber(card.featured_count)}</small>
        </article>
      `).join("") : `<div class="empty">暂无满足条件的经验卡，继续积累任务数据后会自动生成。</div>`}</div>
    </section>
    <section class="compass-card">
      <div class="compass-card-head"><div><h3>达人备注分析</h3><p>仅按关键词归类，原始备注保持原样。</p></div><span>${rawRemarks.length} 条原始备注</span></div>
      <div class="compass-remark-chips">${remarkCategories.length ? remarkCategories.map((item) => `<span>${escapeHtml(item.label)} ${compassNumber(item.count)}</span>`).join("") : `<span class="compass-muted">暂无备注</span>`}</div>
      <details class="compass-raw-details"><summary>查看原始备注</summary>${rawRemarks.length ? rawRemarks.map((remark) => `<article><div><b>${escapeHtml(remark.product_name || remark.sku || "商品")}</b><small>${compassDateTime(remark.submitted_at)} · ${escapeHtml(compassArray(remark.labels).join("、") || "其他")}</small></div><p>${escapeHtml(remark.remark || "")}</p></article>`).join("") : `<div class="empty tiny">暂无原始备注</div>`}</details>
    </section>
    <section class="compass-card compass-history-card">
      <div class="compass-card-head"><div><h3>历史任务记录</h3><p>只展示该达人分配到的任务；可展开查看选款顺序和备注。</p></div><span>${compassNumber(history.total_count)} 个任务</span></div>
      <div class="compass-history-list">${historyRecords.length ? historyRecords.map((record) => `
        <details class="compass-history-item">
          <summary><div><strong>${escapeHtml(record.title || "未命名任务")}</strong><small>${compassNumber(record.task_product_count)} 款任务商品 · 建议 ${compassNumber(record.recommended_count)} 款 · 实选 ${compassNumber(record.actual_selected_count)} 款 · 重点 ${compassNumber(record.featured_count)} 款</small></div><span>${record.submitted_at ? compassDateTime(record.submitted_at) : "尚未提交"}</span></summary>
          <div class="compass-history-expanded">
            <p>${escapeHtml(record.description || "无任务说明")}</p>
            <div class="compass-history-items">${compassArray(record.items).length ? compassArray(record.items).map((item) => `<article><span class="compass-rank">${compassNumber(item.selection_order)}</span><div><strong>${escapeHtml(item.product_name || "未命名商品")} ${escapeHtml(item.sku || "")}</strong><small>${escapeHtml(item.category || "未标注")} · ${escapeHtml(item.style || "未标注")} · ${escapeHtml(item.plan_level || "未标注")} · ￥${compassNumber(item.price, 1)}${item.is_featured ? " · 重点款" : ""}</small>${item.remark ? `<p>备注：${escapeHtml(item.remark)}</p>` : ""}</div><b>${compassNumber(item.preference_strength)} 分</b></article>`).join("") : `<div class="empty tiny">本次任务尚未提交选款</div>`}</div>
          </div>
        </details>
      `).join("") : `<div class="empty">当前筛选范围内暂无任务记录。</div>`}</div>
      <div class="compass-pagination"><span>第 ${historyPage} / ${historyPages} 页</span><button class="ghost-button" data-action="compass-history-page" data-page="${historyPage - 1}" type="button" ${historyPage <= 1 ? "disabled" : ""}>上一页</button><button class="ghost-button" data-action="compass-history-page" data-page="${historyPage + 1}" type="button" ${historyPage >= historyPages ? "disabled" : ""}>下一页</button></div>
    </section>
    ${Number(historical.selection_item_count || 0) ? `<section class="compass-unscoped-note"><strong>历史已选分布</strong><span>${escapeHtml(historical.note || "")}</span><div>${compassArray(historical.categories).map((item) => `<b>${escapeHtml(item.label || "未标注")} ${compassNumber(item.selected_count)} 款</b>`).join("")}</div></section>` : ""}
  `;
  refreshIcons();
}

async function loadCompassCreatorDetail(creatorUserId, page = 1) {
  if (!cloudEnabled || state.currentRole !== "brand" || !creatorUserId) return;
  state.compassDetailLoading = true;
  const { data, error } = await cloud.rpc("get_creator_selection_compass", {
    p_creator_user_id: creatorUserId,
    p_task_id: state.compassFilters.taskId || null,
    p_date_from: compassDateParam(state.compassFilters.dateFrom),
    p_date_to: compassDateParam(state.compassFilters.dateTo),
    p_history_page: page,
    p_history_page_size: 8,
  });
  state.compassDetailLoading = false;
  if (error) {
    console.error(error);
    showToast("达人详情加载失败");
    return;
  }
  state.compassSelectedCreatorId = creatorUserId;
  state.compassHistoryPage = page;
  state.compassCreatorDetailData = data || null;
  renderCompassCreatorDetail();
  els.compassCreatorDetail?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadCompassData(options = {}) {
  if (!cloudEnabled || state.currentRole !== "brand") return;
  if (state.compassLoading) return;
  state.compassLoading = true;
  if (els.compassRefreshButton) els.compassRefreshButton.disabled = true;
  const params = {
    p_creator_query: state.compassFilters.creatorQuery || null,
    p_task_id: state.compassFilters.taskId || null,
    p_date_from: compassDateParam(state.compassFilters.dateFrom),
    p_date_to: compassDateParam(state.compassFilters.dateTo),
    p_category: state.compassFilters.category || null,
    p_confidence: state.compassFilters.confidence || null,
  };
  const [{ data: overview, error: overviewError }, { data: heat, error: heatError }] = await Promise.all([
    cloud.rpc("get_selection_compass_overview", params),
    cloud.rpc("get_product_creator_heat", {
      p_date_from: params.p_date_from,
      p_date_to: params.p_date_to,
      p_category: params.p_category,
      p_limit: 50,
      p_offset: state.compassHeatOffset,
    }),
  ]);
  state.compassLoading = false;
  if (els.compassRefreshButton) els.compassRefreshButton.disabled = false;
  if (overviewError || heatError) {
    console.error(overviewError || heatError);
    state.compassOverviewData = null;
    state.compassProductHeatData = null;
    renderCompassOverview();
    renderCompassProductHeat();
    if (!options.silent) showToast("罗盘分析暂不可用，请确认云端迁移已执行");
    return;
  }
  state.compassOverviewData = overview || null;
  state.compassProductHeatData = heat || null;
  renderCompassOverview();
  renderCompassProductHeat();
  if (state.compassSelectedCreatorId) {
    await loadCompassCreatorDetail(state.compassSelectedCreatorId, state.compassHistoryPage);
  }
  renderAdmin();
}

function applyCompassFilters() {
  state.compassFilters.creatorQuery = els.compassCreatorQuery?.value.trim() || "";
  state.compassFilters.taskId = els.compassTaskFilter?.value || "";
  state.compassFilters.dateFrom = els.compassDateFrom?.value || "";
  state.compassFilters.dateTo = els.compassDateTo?.value || "";
  state.compassFilters.category = els.compassCategoryFilter?.value || "";
  state.compassFilters.confidence = els.compassConfidenceFilter?.value || "";
  state.compassCreatorPage = 1;
  state.compassHeatOffset = 0;
  state.compassSelectedCreatorId = "";
  state.compassCreatorDetailData = null;
  renderCompassCreatorDetail();
  loadCompassData();
}

function setView(view) {
  if (state.currentRole === "creator" && (view === "admin" || view === "accounts" || view === "brand" || view === "compass")) {
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
    els.statusStrip.classList.toggle("hidden", view === "accounts" || view === "brand" || view === "compass");
  }
  renderCreatorTaskPanel();
  if (view !== "selection") {
    document.querySelector(".content-grid").classList.add("hidden");
  } else {
    document.querySelector(".content-grid").classList.remove("hidden");
  }
  if (state.currentRole === "brand" && (view === "admin" || view === "accounts" || view === "brand" || view === "compass")) {
    syncAccessSession();
    if (view === "compass") loadCompassData({ silent: true });
  }
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

  if (!state.taskFeatureReady) {
    showToast(state.taskServiceError || "任务服务暂不可用，当前已选清单已保留，请刷新页面后重试");
    return;
  }

  const task = activeCreatorTask();
  if (!task) {
    showToast("当前没有可提交的选款任务，请联系品牌方分配或重新开启任务");
    return;
  }

  state.creatorName = creatorName;
  localStorage.setItem("inmanCreatorName", creatorName);
  state.submitting = true;
  document
    .querySelectorAll("#submitTopButton, #submitDrawerButton, #submitListButton")
    .forEach((button) => (button.disabled = true));
  showToast("正在提交选款...");

  // Legacy unscoped submission is intentionally disabled by the database migration.
  const { error } = await cloud.rpc("submit_task_selection", {
    p_task_id: task.id,
    p_items: selectionPayload(),
  });

  state.submitting = false;
  document
    .querySelectorAll("#submitTopButton, #submitDrawerButton, #submitListButton")
    .forEach((button) => (button.disabled = false));
  if (error) {
    console.error(error);
    showToast(taskServiceMessage(error));
    return;
  }

  state.submitted = true;
  renderSelected();
  await loadCreatorTasks({ silent: true });
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
    state.brandTasks = [];
    state.brandTaskProducts = [];
    state.brandTaskAssignments = [];
    state.brandCreators = [];
    state.creatorTasks = [];
    state.taskFeatureReady = false;
    state.taskServiceError = "";
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
    await Promise.all([
      loadAdminData(),
      loadProductOverrides({ silent: true }),
      loadBrandTaskData({ silent: true }),
      loadCompassData({ silent: true }),
    ]);
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
  await loadCreatorTasks({ silent: true });
  await loadProductCatalog({ silent: true });
  await loadProductOverrides({ silent: true });
  renderProducts();
  renderSelected();
  if (state.view === "admin" || state.view === "accounts" || state.view === "brand" || state.view === "compass") setView("selection");
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
  if (!isAdminEmail(email)) {
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
  state.brandTasks = [];
  state.brandTaskProducts = [];
  state.brandTaskAssignments = [];
  state.brandCreators = [];
  state.compassOverviewData = null;
  state.compassProductHeatData = null;
  state.compassCreatorDetailData = null;
  state.compassSelectedCreatorId = "";
  closeBrandProductEditor();
  state.brandTaskCreatorIds.clear();
  state.creatorTasks = [];
  state.taskFeatureReady = false;
  state.taskServiceError = "";
  state.activeTaskId = "";
  resetCreatorSelection();
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
  renderBrandTaskManager();
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
  if (state.currentRole === "creator" && (!state.taskFeatureReady || !state.activeTaskId)) {
    // Do not fall back to a global catalog. Keep selections in memory while the task service recovers.
    baseProductPool.splice(0, baseProductPool.length);
    productPool.splice(0, productPool.length);
    state.catalogSource = "cloud";
    initFilters();
    renderProducts();
    renderCatalogMeta();
    return;
  }
  const productRequest =
    state.currentRole === "creator"
      ? cloud.rpc("get_creator_task_products", { p_task_id: state.activeTaskId })
      : cloud
          .from("product_catalog")
          .select("*")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(5000);
  const { data, error } = await productRequest;
  if (error) {
    console.error(error);
    if (state.currentRole === "creator") {
      state.taskFeatureReady = false;
      state.taskServiceError = taskServiceMessage(error);
      state.creatorTasks = [];
      state.activeTaskId = "";
      baseProductPool.splice(0, baseProductPool.length);
      productPool.splice(0, productPool.length);
      state.catalogSource = "cloud";
      initFilters();
      renderProducts();
      renderCreatorTaskPanel();
    }
    if (!options.silent) {
      showToast(state.currentRole === "creator" ? state.taskServiceError : "云端新品池读取失败，将继续使用本地商品池");
    }
    renderCatalogMeta();
    return;
  }
  const rows = data || [];
  if (!rows.length) {
    state.catalogSource = "cloud";
    replaceBaseProductPool([], "cloud");
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

function refreshCompassFromRealtime() {
  if (state.currentRole !== "brand") return;
  window.clearTimeout(state.compassRealtimeTimer);
  state.compassRealtimeTimer = window.setTimeout(() => loadCompassData({ silent: true }), 450);
}

function subscribeAdminRealtime() {
  if (!cloudEnabled || state.adminChannel) return;
  state.adminChannel = cloud
    .channel("selection-admin")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "submissions" },
      () => {
        loadAdminData();
        refreshCompassFromRealtime();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "selection_items" },
      () => {
        loadAdminData();
        refreshCompassFromRealtime();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "product_overrides" },
      () => {
        loadProductOverrides({ silent: true });
        refreshCompassFromRealtime();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "product_catalog" },
      async () => {
        await loadProductCatalog({ silent: true });
        await loadProductOverrides({ silent: true });
        refreshCompassFromRealtime();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "creator_access_requests" },
      loadAdminData
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "selection_tasks" },
      () => {
        loadBrandTaskData({ silent: true });
        refreshCompassFromRealtime();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "selection_task_products" },
      refreshCompassFromRealtime
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "selection_task_assignments" },
      refreshCompassFromRealtime
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
  let imageCompressed = false;
  let imageOutputSize = null;
  const stagedImage = state.productImageDrafts.get(sku)?.file || draft.image_file;
  if (stagedImage) {
    const optimizedImage = await optimizeImageForStorage(stagedImage);
    state.productImageDrafts.set(sku, {
      file: optimizedImage.file,
      source: state.productImageDrafts.get(sku)?.source || "upload",
    });
    imageUrl = await readFileAsDataUrl(optimizedImage.file);
    imageCompressed = optimizedImage.compressed;
    imageOutputSize = optimizedImage.outputSize;
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
    image_compressed: imageCompressed,
    image_output_size: imageOutputSize,
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
    if (error.message === "image-source-too-large") {
      showToast("图片超过浏览器可安全处理的范围，请先压缩后再试");
      return;
    }
    if (error.message === "image-type-invalid") {
      showToast("请上传或粘贴图片文件");
      return;
    }
    if (/image-(decode|compress)/.test(error.message || "")) {
      showToast("图片自动压缩失败，请换用 JPG、PNG 或 WebP 后重试");
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
  const { image_compressed: imageCompressed, image_output_size: imageOutputSize, ...overrideDraft } = draft;
  const payload = {
    ...overrideDraft,
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
  state.productImageDrafts.delete(sku);
  const imageMessage = imageCompressed ? `图片已自动压缩为 ${formatImageBytes(imageOutputSize)} 并保存` : "商品配置已保存";
  showToast(priorityUnavailable ? "其他配置已保存，达人排序需先升级云端" : imageMessage);
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

const IMPORT_SCHEMAS = {
  catalog: {
    title: "新品导入模板",
    fileName: "新品导入模板",
    sheetName: "新品导入",
    fields: [
      { header: "款号", example: "F18628781", note: "必填；按款号新增或匹配已有商品。" },
      { header: "商品名称", example: "棉麻衬衣", note: "新增商品建议填写。" },
      { header: "品类", example: "衬衣", note: "用于商品分类与达人端筛选。" },
      { header: "季节", example: "秋", note: "仅填：春、夏、秋、冬。" },
      { header: "上新日期", example: "2026-07-20", note: "建议使用 YYYY-MM-DD。" },
      { header: "达播价", example: "139.9", note: "只保留一位小数。" },
      { header: "现货库存", example: "320", note: "只填整数。" },
      { header: "预售库存/产能", example: "15天不限量", note: "可填数量或产能说明。" },
      { header: "产品等级", example: "S", note: "仅填：S、A、B、C。" },
      { header: "风格线", example: "田园-复古", note: "用于达人端筛选。" },
      { header: "图片地址", example: "https://example.com/product.jpg", note: "可选；单款图片也可在商品池中上传或粘贴。" },
      { header: "达人端排序", example: "10", note: "正整数越小越靠前；留空或填“自动”表示自动排序。" },
    ],
  },
  overrides: {
    title: "商品批量修改模板",
    fileName: "商品批量修改模板",
    sheetName: "批量修改",
    fields: [
      { header: "款号", example: "F18628781", note: "必填；用于匹配当前商品池。" },
      { header: "达播价", example: "139.9", note: "留空不修改；只保留一位小数。" },
      { header: "产品等级", example: "S", note: "留空不修改；仅填：S、A、B、C。" },
      { header: "达人可见", example: "达人可见", note: "留空不修改；仅填：达人可见 或 达人不可见。" },
      { header: "风格线", example: "田园-复古", note: "留空不修改。" },
      { header: "达人端排序", example: "10", note: "留空不修改；正整数越小越靠前，填“自动”清除前排排序。" },
    ],
  },
};

function normalizeImportHeader(value) {
  return String(value || "").trim().replace(/\s+/g, "").toLowerCase();
}

function getImportSchema(schemaKey) {
  return IMPORT_SCHEMAS[schemaKey] || null;
}

function validateFixedImportHeaders(headers, schemaKey) {
  const schema = getImportSchema(schemaKey);
  if (!schema) throw new Error("import-schema-missing");
  const existingHeaders = new Set((headers || []).map(normalizeImportHeader).filter(Boolean));
  const missingHeaders = schema.fields
    .map((field) => field.header)
    .filter((header) => !existingHeaders.has(normalizeImportHeader(header)));
  if (!missingHeaders.length) return;
  const error = new Error("import-header-mismatch");
  error.missingHeaders = missingHeaders;
  throw error;
}

function downloadImportTemplate(schemaKey) {
  const schema = getImportSchema(schemaKey);
  if (!schema || !window.XLSX) {
    showToast("表格模板组件加载失败，请刷新后重试");
    return;
  }
  const headers = schema.fields.map((field) => field.header);
  const templateSheet = window.XLSX.utils.aoa_to_sheet([headers, headers.map(() => "")]);
  templateSheet["!cols"] = schema.fields.map((field) => ({
    wch: Math.max(field.header.length * 2 + 4, String(field.example).length + 4, 14),
  }));
  templateSheet["!autofilter"] = {
    ref: `A1:${window.XLSX.utils.encode_col(headers.length - 1)}2`,
  };
  const guideRows = [
    ["导入说明", schema.title],
    ["填写规则", "请从第二行开始填写；表头可调整顺序但不能改名或删除；其他额外列会被忽略。"],
    ["批量安全", schemaKey === "overrides" ? "空白单元格保持当前数据不变。" : "空白字段不会覆盖已有值；新款缺失字段会保持空白或默认值。"],
    [],
    ["固定表头", "填写示例", "字段说明"],
    ...schema.fields.map((field) => [field.header, field.example, field.note]),
  ];
  const guideSheet = window.XLSX.utils.aoa_to_sheet(guideRows);
  guideSheet["!cols"] = [{ wch: 18 }, { wch: 34 }, { wch: 52 }];
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, templateSheet, schema.sheetName);
  window.XLSX.utils.book_append_sheet(workbook, guideSheet, "填写说明");
  window.XLSX.writeFile(workbook, `${schema.fileName}.xlsx`);
  showToast(`已下载${schema.title}`);
}

function readImportTable(file) {
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
        const worksheet = workbook.Sheets[firstSheetName];
        const headerRow = window.XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          blankrows: false,
        })[0] || [];
        const rows = window.XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });
        resolve({ rows, headers: headerRow });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsArrayBuffer(file);
  });
}

function readImportRows(file) {
  return readImportTable(file).then(({ rows }) => rows);
}

function importErrorMessage(error, fallbackMessage) {
  if (error?.message === "xlsx-not-loaded") return "表格解析组件加载失败";
  if (error?.message === "import-header-mismatch") {
    return `表头不完整，缺少：${(error.missingHeaders || []).join("、")}。请下载模板后重试`;
  }
  return fallbackMessage;
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
    const { rows, headers } = await readImportTable(file);
    validateFixedImportHeaders(headers, "catalog");
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
    showToast(importErrorMessage(error, "新品表读取失败"));
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
    const { rows, headers } = await readImportTable(file);
    validateFixedImportHeaders(headers, "overrides");
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
    showToast(importErrorMessage(error, "表格读取失败"));
  } finally {
    els.brandImportButton.disabled = false;
  }
}

async function resetProductOverride(sku) {
  if (!cloudEnabled) {
    showToast("云端后台尚未完成配置");
    return;
  }
  state.productImageDrafts.delete(sku);
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
  if (action === "view-submission") openSubmissionDetail(id);
  if (action === "preview") openImagePreview(id);
  if (action === "remove") toggleProduct(id);
  if (action === "edit-override") openBrandProductEditor(id);
  if (action === "focus-image-paste") {
    const pasteZone = document.querySelector(`[data-image-paste-zone="${id}"]`);
    pasteZone?.focus();
    showToast("现在可按 Ctrl+V 粘贴图片");
  }
  if (action === "close-brand-editor") closeBrandProductEditor();
  if (action === "save-override") saveProductOverride(id);
  if (action === "reset-override") resetProductOverride(id);
  if (action === "front-remove") removeProductFromFront(id);
  if (action === "approve-request") approveCreatorRequest(id);
  if (action === "reject-request") rejectCreatorRequest(id);
  if (action === "compass-open-creator") loadCompassCreatorDetail(id, 1);
  if (action === "compass-close-detail") {
    state.compassSelectedCreatorId = "";
    state.compassCreatorDetailData = null;
    renderCompassCreatorDetail();
  }
  if (action === "compass-creator-page") {
    state.compassCreatorPage = Math.max(1, Number(actionButton.dataset.page) || 1);
    renderCompassOverview();
  }
  if (action === "compass-history-page" && state.compassSelectedCreatorId) {
    loadCompassCreatorDetail(state.compassSelectedCreatorId, Math.max(1, Number(actionButton.dataset.page) || 1));
  }
  if (action === "compass-heat-page") {
    state.compassHeatOffset = Math.max(0, Number(actionButton.dataset.offset) || 0);
    loadCompassData({ silent: true });
  }
  if (action === "compass-category-sort") {
    state.compassCategorySort = actionButton.dataset.sort === "count" ? "count" : "rate";
    renderCompassCreatorDetail();
  }
  if (action === "task-status") updateSelectionTaskStatus(id, actionButton.dataset.status);
  if (action === "density-standard") setProductDensity("standard");
  if (action === "density-compact") setProductDensity("compact");
  if (action === "load-more") {
    state.visibleLimit += 60;
    renderProducts();
  }
});

document.addEventListener("dragstart", (event) => {
  const frontItem = event.target.closest("[data-front-sku]");
  if (frontItem) {
    state.brandFrontDraggingSku = frontItem.dataset.frontSku;
    frontItem.classList.add("dragging");
    event.dataTransfer?.setData("text/plain", state.brandFrontDraggingSku);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    return;
  }
  const selectedItem = event.target.closest("[data-selected-id]");
  if (!selectedItem || !state.selected.has(selectedItem.dataset.selectedId)) return;
  state.selectedDraggingId = selectedItem.dataset.selectedId;
  selectedItem.classList.add("dragging");
  event.dataTransfer?.setData("text/plain", state.selectedDraggingId);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
});

document.addEventListener("dragover", (event) => {
  const frontItem = event.target.closest("[data-front-sku]");
  if (frontItem && state.brandFrontDraggingSku && frontItem.dataset.frontSku !== state.brandFrontDraggingSku) {
    event.preventDefault();
    frontItem.classList.add("drag-over");
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    return;
  }
  const selectedItem = event.target.closest("[data-selected-id]");
  if (!selectedItem || !state.selectedDraggingId || selectedItem.dataset.selectedId === state.selectedDraggingId) return;
  event.preventDefault();
  selectedItem.classList.add("drag-over");
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
});

document.addEventListener("dragleave", (event) => {
  event.target.closest("[data-front-sku]")?.classList.remove("drag-over");
  event.target.closest("[data-selected-id]")?.classList.remove("drag-over");
});

document.addEventListener("drop", async (event) => {
  const item = event.target.closest("[data-front-sku]");
  const draggingSku = state.brandFrontDraggingSku;
  if (item && draggingSku && item.dataset.frontSku !== draggingSku) {
    event.preventDefault();
    const queue = getBrandFrontQueue().map((product) => product.sku);
    const nextQueue = queue.filter((sku) => sku !== draggingSku);
    const targetIndex = nextQueue.indexOf(item.dataset.frontSku);
    nextQueue.splice(Math.max(targetIndex, 0), 0, draggingSku);
    state.brandFrontDraggingSku = "";
    await persistBrandFrontQueue(nextQueue, "前排推荐顺序已更新");
    return;
  }
  const selectedItem = event.target.closest("[data-selected-id]");
  const draggingId = state.selectedDraggingId;
  if (!selectedItem || !draggingId || selectedItem.dataset.selectedId === draggingId) return;
  event.preventDefault();
  const entries = [...state.selected.entries()].filter(([id]) => id !== draggingId);
  const targetIndex = entries.findIndex(([id]) => id === selectedItem.dataset.selectedId);
  const draggedProduct = state.selected.get(draggingId);
  if (!draggedProduct || targetIndex < 0) return;
  entries.splice(targetIndex, 0, [draggingId, draggedProduct]);
  state.selected = new Map(entries);
  state.selectedDraggingId = "";
  state.submitted = false;
  renderSelected();
  showToast("已调整已选商品顺序");
});

document.addEventListener("dragend", () => {
  state.brandFrontDraggingSku = "";
  state.selectedDraggingId = "";
  document.querySelectorAll(".front-queue-item").forEach((item) => {
    item.classList.remove("dragging", "drag-over");
  });
  document.querySelectorAll("[data-selected-id]").forEach((item) => {
    item.classList.remove("dragging", "drag-over");
  });
});

document.addEventListener("change", (event) => {
  const intentId = event.target.dataset.intent;
  const remarkId = event.target.dataset.remark;
  const brandSelectSku = event.target.dataset.brandSelect;
  const taskCreatorId = event.target.dataset.taskCreator;
  if (event.target.dataset.overrideField === "image_file") {
    try {
      stageImageDraft(event.target.dataset.overrideSku, event.target.files?.[0], "upload");
    } catch (error) {
      showToast(error.message === "image-source-too-large" ? "图片超过浏览器可安全处理的范围，请先压缩后再试" : "请上传图片文件");
    }
    return;
  }
  if (taskCreatorId) {
    if (event.target.checked) state.brandTaskCreatorIds.add(taskCreatorId);
    else state.brandTaskCreatorIds.delete(taskCreatorId);
    renderBrandTaskManager();
    return;
  }
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

document.addEventListener("paste", (event) => {
  const pasteZone = event.target.closest("[data-image-paste-zone]");
  if (!pasteZone) return;
  const imageItem = [...(event.clipboardData?.items || [])].find((item) => item.type?.startsWith("image/"));
  if (!imageItem) {
    showToast("剪贴板中没有可用图片");
    return;
  }
  const file = imageItem.getAsFile();
  if (!file) return;
  event.preventDefault();
  try {
    stageImageDraft(pasteZone.dataset.imagePasteZone, file, "paste");
    showToast("图片已粘贴，保存时将自动处理");
  } catch (error) {
    showToast(error.message === "image-source-too-large" ? "图片超过浏览器可安全处理的范围，请先压缩后再试" : "粘贴图片失败");
  }
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

if (els.creatorTaskSelect) {
  els.creatorTaskSelect.addEventListener("change", async (event) => {
    const nextTaskId = event.target.value;
    if (!nextTaskId || nextTaskId === state.activeTaskId) return;
    state.activeTaskId = nextTaskId;
    localStorage.setItem("inmanActiveTaskId", nextTaskId);
    resetCreatorSelection();
    renderCreatorTaskPanel();
    await loadProductCatalog();
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
els.accountRefreshButton?.addEventListener("click", async () => {
  await Promise.all([loadAdminData(), loadBrandTaskData({ silent: true })]);
});
els.compassRefreshButton?.addEventListener("click", () => loadCompassData());
els.compassApplyFilters?.addEventListener("click", applyCompassFilters);
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
if (els.brandImportTemplateButton) {
  els.brandImportTemplateButton.addEventListener("click", () => downloadImportTemplate("overrides"));
}
if (els.brandNewProductsButton) {
  els.brandNewProductsButton.addEventListener("click", importNewProducts);
}
if (els.brandNewProductsTemplateButton) {
  els.brandNewProductsTemplateButton.addEventListener("click", () => downloadImportTemplate("catalog"));
}
if (els.brandCreateTaskButton) {
  els.brandCreateTaskButton.addEventListener("click", createSelectionTask);
}
if (els.adminSubmissionDateFrom) {
  els.adminSubmissionDateFrom.addEventListener("change", (event) => {
    state.adminSubmissionFilters.dateFrom = event.target.value;
    renderAdmin();
  });
}
if (els.adminSubmissionDateTo) {
  els.adminSubmissionDateTo.addEventListener("change", (event) => {
    state.adminSubmissionFilters.dateTo = event.target.value;
    renderAdmin();
  });
}
if (els.adminSubmissionFilterReset) {
  els.adminSubmissionFilterReset.addEventListener("click", () => {
    state.adminSubmissionFilters.dateFrom = "";
    state.adminSubmissionFilters.dateTo = "";
    renderAdmin();
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
