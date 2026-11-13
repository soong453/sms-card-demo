const templates = {
  oppo: { name: "OPPO 短信卡片", previewClass: "template-oppo" },
  vivo: { name: "vivo 短信卡片", previewClass: "template-vivo" },
  honor: { name: "荣耀 短信卡片", previewClass: "template-honor" }
};

const configs = {
  oppo: {
    template: "oppo",
    configName: "移动充值成功后欠费提醒",
    merchantName: "中国移动",
    channelNo: "10691117",
    smsCategory: "充值成功",
    sourceIconColor: "#2d7df0",
    cardTitle: "话费充值成功后仍欠费，请及时补缴",
    originText: "查看原文",
    buttonText: "📱中国移动",
    buttonLink: "app://recharge?scene=mobile_arrears",
    menus: ["📱中国移动", "特惠流量"],
    kv: [
      { key: "充值金额", value: "50.00元", highlight: false },
      { key: "充值时间", value: "2025年05月03日17时56分", highlight: false },
      { key: "充值渠道", value: "统一支付充值服务", highlight: false },
      { key: "当前余额", value: "-160.51元", highlight: false },
      { key: "提示", value: "为避免影响您上网功能的正常使用,请进行关开机或关开飞行模式操作", highlight: false }
    ]
  },
  vivo: {
    template: "vivo",
    configName: "vivo 流量超套提醒卡片",
    merchantName: "中国移动",
    channelNo: "10086096670",
    smsCategory: "流量超套提醒",
    sourceIconColor: "#2d7df0",
    cardTitle: "",
    originText: "显示原文",
    buttonText: "🔥20元20G",
    buttonLink: "app://data?scene=overage",
    cardActions: ["🔥20元20G", "🎁领45G流量", "🎁10元15G"],
    menus: [],
    kv: [
      { key: "通知", value: "产生套外费用，及时充流量", highlight: false },
      { key: "套餐外流量费用已达", value: "10.00元", highlight: false },
      { key: "资费标准", value: "超出后按 0.29元/MB计费，继续使用流量将持续计费", highlight: false },
      { key: "手机号码", value: "135****1234", highlight: false },
      { key: "截至时间", value: "8月4日16时12分", highlight: false }
    ]
  },
  honor: {
    template: "honor",
    configName: "荣耀充值提醒卡片",
    merchantName: "中国移动",
    channelNo: "100862213",
    smsCategory: "AI豆到期提醒",
    sourceIconColor: "#2d7df0",
    cardTitle: "AI豆即将到期，请尽快使用",
    originText: "显示原文",
    buttonText: "立即兑换",
    buttonLink: "https://example.com/checkin",
    menus: ["查询充值", "话费账单"],
    kv: [
      { key: "即将到期", value: "200AI豆", highlight: false },
      { key: "到期时间", value: "2025年11月11日", highlight: true },
      { key: "手机号码", value: "133****0000", highlight: false },
      { key: "说明", value: "到期AI豆将自动清零，请尽快使用", highlight: false }
    ]
  }
};
let currentConfigKey = "oppo";

const pages = {
  list: document.getElementById("list"),
  editor: document.getElementById("editor"),
  check: document.getElementById("check")
};

const editorTitle = document.getElementById("editorTitle");
const templateName = document.getElementById("templateName");
const factoryTemplateName = document.getElementById("factoryTemplateName");
const phonePreview = document.getElementById("phonePreview");
const kvList = document.getElementById("kvList");
const kvPreview = document.getElementById("kvPreview");
const rawSmsPreview = document.getElementById("rawSmsPreview");
const rawOriginalModeToggle = document.getElementById("rawOriginalModeToggle");
const vivoTipEditor = document.getElementById("vivoTipEditor");
const vivoTipToggle = document.getElementById("vivoTipToggle");
const vivoTipTextField = document.getElementById("vivoTipTextField");
const vivoTipInput = document.getElementById("vivoTipInput");
const vivoTipPreview = document.getElementById("vivoTipPreview");
const vivoActionEditor = document.getElementById("vivoActionEditor");
const vivoActionList = document.getElementById("vivoActionList");
const addVivoActionBtn = document.getElementById("addVivoActionBtn");
const cardActionRow = document.getElementById("cardActionRow");
const MAX_VIVO_EXTRA_ACTIONS = 2;
const saveImageBtn = document.getElementById("saveImageBtn");
const menuEditor = document.getElementById("menuEditor");
const menuList = document.getElementById("menuList");
const honorMenuPreview = document.getElementById("honorMenuPreview");
const composeInput = document.querySelector(".compose-input");
const chatTime = document.querySelector(".chat-time");
const smsTemplateInput = document.getElementById("smsTemplateInput");
const aiEndpointInput = document.getElementById("aiEndpointInput");
const aiUpstreamInput = document.getElementById("aiUpstreamInput");
const aiNetworkProxyInput = document.getElementById("aiNetworkProxyInput");
const aiModelInput = document.getElementById("aiModelInput");
const aiKeyInput = document.getElementById("aiKeyInput");
// Keep the prototype aligned with the platform's current 6.1 model.
const DEFAULT_AI_MODEL = "gpt-6.1-sol";
const sourceIconColorOptions = document.getElementById("sourceIconColorOptions");
const sourceIconColorField = document.getElementById("sourceIconColorField");
const kvStyleLabel = document.getElementById("kvStyleLabel");
const emojiPicker = document.getElementById("emojiPicker");
const configTableBody = document.getElementById("configTableBody");
const configSearchInput = document.getElementById("configSearchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const templateFilter = document.getElementById("templateFilter");
const statusFilter = document.getElementById("statusFilter");
const prevConfigBtn = document.getElementById("prevConfigBtn");
const nextConfigBtn = document.getElementById("nextConfigBtn");
const unsavedIndicator = document.getElementById("unsavedIndicator");
const draftStorageKey = "sms-card-config-drafts";
const batchConfigOrder = [];
let isEditorDirty = false;
const mobileDefaultMenus = ["商户资讯", "中国移动"];
const mobileDefaultMenuIds = new Set(
  Array.from({ length: 20 }, (_, index) => `mobile-${String(index + 1).padStart(3, "0")}`)
);
const zhaoshangVivoButtons = {
  "batch-001": "🔥微信付领饭票",
  "batch-002": "🍔招行领肯德基",
  "batch-003": "☕微信付领咖啡",
  "batch-004": "🍔招行领肯德基",
  "batch-005": "🍚扫码付领饭票",
  "batch-006": "🚗招行领打车券",
  "batch-007": "💰消费领出游补",
  "batch-008": "🆕支付领新客礼",
  "batch-009": "💳还款领好礼",
  "batch-010": "🔥扫码付领福利",
  "batch-011": "👉APP测分期",
  "batch-012": "🍚APP领饭票",
  "batch-013": "🥚APP砸金蛋",
  "batch-014": "🎁基金领好品",
  "batch-015": "🏨工资领酒店补",
  "batch-016": "💳还款领好礼",
  "batch-017": "🧋信用卡领奈雪",
  "batch-018": "🎁招行领新客礼",
  "batch-019": "👉招行领利率券",
  "batch-020": "🆕入账领新客礼"
};
const zhaoshangButtonMigrationKey = "sms-card-zhaoshang-vivo-7char-buttons-20260910";
const zhaoshangOppoIconColor = "#f6b51e";
const zhaoshangOppoIntentTitles = {
  "zhaoshang-oppo-002": "消费提醒💰尾号9996消费107.65人民币",
  "zhaoshang-oppo-004": "消费提醒💰尾号****消费6.9人民币",
  "zhaoshang-oppo-007": "消费提醒💰尾号3416消费1765.00人民币",
  "zhaoshang-oppo-008": "账户发生扣款，金额为人民币3099.00",
  "zhaoshang-oppo-009": "信用卡本期账单未结清，请按时还款",
  "zhaoshang-oppo-010": "账户发生扣款，金额为人民币400.00",
  "zhaoshang-oppo-015": "工资已入账，请查收",
  "zhaoshang-oppo-017": "消费提醒💰尾号4797消费988.00人民币",
  "zhaoshang-oppo-018": "银行快捷支付功能已开通，请知晓",
  "zhaoshang-oppo-020": "账户发生资金变动，请留意"
};
const zhaoshangOppoIntentTitleMigrationKey = "sms-card-zhaoshang-oppo-titles-20260903";
const zhaoshangOppoEmptyMenusMigrationKey = "sms-card-zhaoshang-oppo-empty-menus-20260903";
const zhaoshangOppoCompactIntentUpdates = {
  "zhaoshang-oppo-001": {
    cardTitle: "账户支付50.00元",
    buttonText: "☕支付成功，领咖啡餐饮优惠"
  },
  "zhaoshang-oppo-003": {
    cardTitle: "账户支付5114.00元",
    buttonText: "☕支付成功，领咖啡餐饮优惠"
  },
  "zhaoshang-oppo-005": {
    cardTitle: "账户支付12.00元",
    buttonText: "🍚扫码支付成功，领饭票新户福利"
  },
  "zhaoshang-oppo-006": {
    cardTitle: "账户扣款人民币3000.00元",
    buttonText: "🚗银联扣款成功，领打车券包"
  },
  "zhaoshang-oppo-011": {
    cardTitle: "预约分期推荐",
    buttonText: "💳分期推荐，测资格领权益"
  },
  "zhaoshang-oppo-012": {
    cardTitle: "账户扣款人民币2658.47元",
    buttonText: "🍚美团支付成功，领饭票新户福利"
  },
  "zhaoshang-oppo-013": {
    cardTitle: "账户支付5300.00元",
    buttonText: "🥚支付宝支付成功，砸金蛋赢好礼"
  },
  "zhaoshang-oppo-014": {
    cardTitle: "储蓄卡支付人民币1.00元",
    buttonText: "🎁基金支付成功，周二领好品福利"
  },
  "zhaoshang-oppo-016": {
    cardTitle: "账户信用卡还款人民币963.75元",
    buttonText: "💳还款成功，还款达标领好礼"
  },
  "zhaoshang-oppo-019": {
    cardTitle: "闪电贷利率券发放",
    buttonText: "👉利率券已发放，去招行APP查收"
  }
};
const zhaoshangOppoCompactIntentMigrationKey = "sms-card-zhaoshang-oppo-compact-intents-20260903";
const zhaoshangOppoButtonTextUpdates = {
  "zhaoshang-oppo-002": "🍔消费成功，领肯德基特惠",
  "zhaoshang-oppo-004": "🍔信用卡消费，领肯德基特惠",
  "zhaoshang-oppo-007": "💰信用卡消费，领888元出游补贴",
  "zhaoshang-oppo-008": "🆕支付宝支付成功，领App新客礼",
  "zhaoshang-oppo-009": "💳账单已出，达标还款领好礼",
  "zhaoshang-oppo-010": "☕扫码支付成功，领咖啡餐饮优惠",
  "zhaoshang-oppo-015": "💰工资入账，领888元出游补贴",
  "zhaoshang-oppo-017": "🧋信用卡消费，领奈雪美味福利",
  "zhaoshang-oppo-018": "🎁抖音支付已开通，领App新客礼",
  "zhaoshang-oppo-020": "🆕入账成功，领App新客礼"
};
const zhaoshangOppoButtonTextMigrationKey = "sms-card-zhaoshang-oppo-button-texts-20260903";

function isZhaoshangOppoConfig(config = {}) {
  return /^zhaoshang-oppo-(00[1-9]|01\d|020)$/.test(config.id || "");
}

function applyBatchDefaults(config = {}) {
  let normalized = config;
  if (isZhaoshangOppoConfig(normalized) && normalized.sourceIconColor !== zhaoshangOppoIconColor) {
    normalized = { ...normalized, sourceIconColor: zhaoshangOppoIconColor };
  }
  const shouldUseMobileMenus = mobileDefaultMenuIds.has(config.id) && config.template === "vivo";
  if (shouldUseMobileMenus && (!Array.isArray(config.menus) || config.menus.length === 0)) {
    return { ...normalized, menus: [...mobileDefaultMenus] };
  }
  return normalized;
}

function getSourceIconColor() {
  return document.querySelector('input[name="sourceIconColor"]:checked')?.value || "#2d7df0";
}

function setSourceIconColor(color = "#2d7df0") {
  const normalized = color || "#2d7df0";
  const input = document.querySelector(`input[name="sourceIconColor"][value="${normalized}"]`);
  if (input) input.checked = true;
  phonePreview.style.setProperty("--source-icon-color", normalized);
}

function updateEditorTemplateUi(templateKey) {
  vivoTipEditor.hidden = templateKey !== "vivo";
  vivoActionEditor.hidden = templateKey !== "vivo";
  if (sourceIconColorField) {
    sourceIconColorField.hidden = templateKey === "vivo";
  }
  if (kvStyleLabel) {
    kvStyleLabel.textContent = templateKey === "vivo" ? "蓝色链接" : "绿色下划线";
  }
  const cardTitleField = document.querySelector('textarea[data-preview="cardTitle"]')?.closest("label");
  if (cardTitleField) {
    cardTitleField.hidden = templateKey === "vivo";
  }
}

function showPage(name) {
  Object.values(pages).forEach(page => page.classList.remove("active"));
  pages[name].classList.add("active");
}

function setPreviewText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value || "";
}

function getDefaultOriginText(templateKey) {
  return templateKey === "oppo" ? "查看原文" : "显示原文";
}

function normalizeOriginText(templateKey, text) {
  if (templateKey === "vivo" && (!text || text === "查看原文")) return "显示原文";
  return text || getDefaultOriginText(templateKey);
}

function getConfigButtonText(config) {
  if (config.buttonText) return config.buttonText;
  if (Array.isArray(config.cardActions)) return config.cardActions[0] || "";
  if (typeof config.cardActions === "string") return config.cardActions;
  return "";
}

function getDisplayText(text, maxChars = 16) {
  const chars = Array.from(String(text || ""));
  if (chars.length <= maxChars) return chars.join("");
  return `${chars.slice(0, Math.max(0, maxChars - 1)).join("")}…`;
}

function getTitleDisplayText(text) {
  return String(text || "").trim();
}

function setField(selector, value) {
  const field = document.querySelector(selector);
  if (field) field.value = value || "";
}

function getTemplateLabel(templateKey) {
  if (templateKey === "honor") return "荣耀";
  if (templateKey === "vivo") return "vivo";
  return "OPPO";
}

function getCurrentTemplateKey() {
  return configs[currentConfigKey]?.template || currentConfigKey || "oppo";
}

function getConfigInputValue(selector) {
  return document.querySelector(selector)?.value.trim() || "";
}

function getStoredDrafts() {
  try {
    const drafts = JSON.parse(localStorage.getItem(draftStorageKey) || "[]");
    return Array.isArray(drafts) ? drafts : [];
  } catch {
    return [];
  }
}

function setEditorDirty(isDirty) {
  isEditorDirty = Boolean(isDirty);
  if (unsavedIndicator) unsavedIndicator.hidden = !isEditorDirty;
}

function markEditorDirty() {
  setEditorDirty(true);
}

function resolveUnsavedEditorChanges() {
  if (!isEditorDirty || !pages.editor.classList.contains("active")) return true;
  if (confirm("当前有未保存修改，是否先保存草稿？\n\n确定：保存并继续\n取消：放弃修改并离开")) {
    saveCurrentDraft();
  } else {
    setEditorDirty(false);
  }
  return true;
}
function setStoredDrafts(drafts) {
  localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
  syncDraftsToDisk(drafts);
}

function migrateZhaoshangVivoButtonsOnce() {
  if (localStorage.getItem(zhaoshangButtonMigrationKey) === "1") return;

  const drafts = getStoredDrafts();
  let changed = false;
  const migrated = drafts.map(draft => {
    const buttonText = zhaoshangVivoButtons[draft.id];
    if (!buttonText || draft.buttonText === buttonText) return draft;
    changed = true;
    return {
      ...draft,
      buttonText,
      cardActions: draft.template === "vivo" ? buttonText : draft.cardActions
    };
  });

  if (changed) setStoredDrafts(migrated);
  localStorage.setItem(zhaoshangButtonMigrationKey, "1");
}

function migrateZhaoshangOppoIntentTitlesOnce() {
  if (localStorage.getItem(zhaoshangOppoIntentTitleMigrationKey) === "1") return;

  const drafts = getStoredDrafts();
  let changed = false;
  const migrated = drafts.map(draft => {
    const cardTitle = zhaoshangOppoIntentTitles[draft.id];
    if (!cardTitle || draft.cardTitle === cardTitle) return draft;
    changed = true;
    return {
      ...draft,
      cardTitle
    };
  });

  if (changed) setStoredDrafts(migrated);
  localStorage.setItem(zhaoshangOppoIntentTitleMigrationKey, "1");
}

function migrateZhaoshangOppoMenusEmptyOnce() {
  if (localStorage.getItem(zhaoshangOppoEmptyMenusMigrationKey) === "1") return;

  const drafts = getStoredDrafts();
  let changed = false;
  const migrated = drafts.map(draft => {
    if (!isZhaoshangOppoConfig(draft) || !Array.isArray(draft.menus) || draft.menus.length === 0) return draft;
    changed = true;
    return {
      ...draft,
      menus: []
    };
  });

  if (changed) setStoredDrafts(migrated);
  localStorage.setItem(zhaoshangOppoEmptyMenusMigrationKey, "1");
}

function migrateZhaoshangOppoCompactIntentUpdatesOnce() {
  if (localStorage.getItem(zhaoshangOppoCompactIntentMigrationKey) === "1") return;

  const drafts = getStoredDrafts();
  let changed = false;
  const migrated = drafts.map(draft => {
    const update = zhaoshangOppoCompactIntentUpdates[draft.id];
    if (!update) return draft;
    changed = true;
    return {
      ...draft,
      cardTitle: update.cardTitle,
      buttonText: update.buttonText,
      cardActions: Array.isArray(draft.cardActions)
        ? [update.buttonText]
        : typeof draft.cardActions === "string"
          ? update.buttonText
          : draft.cardActions
    };
  });

  if (changed) setStoredDrafts(migrated);
  localStorage.setItem(zhaoshangOppoCompactIntentMigrationKey, "1");
}

function migrateZhaoshangOppoButtonTextsOnce() {
  if (localStorage.getItem(zhaoshangOppoButtonTextMigrationKey) === "1") return;

  const drafts = getStoredDrafts();
  let changed = false;
  const migrated = drafts.map(draft => {
    const buttonText = zhaoshangOppoButtonTextUpdates[draft.id];
    if (!buttonText) return draft;
    changed = true;
    return {
      ...draft,
      buttonText,
      cardActions: Array.isArray(draft.cardActions)
        ? [buttonText]
        : typeof draft.cardActions === "string"
          ? buttonText
          : draft.cardActions
    };
  });

  if (changed) setStoredDrafts(migrated);
  localStorage.setItem(zhaoshangOppoButtonTextMigrationKey, "1");
}

function syncDraftsToDisk(drafts) {
  if (!Array.isArray(drafts) || !window.fetch) return;
  fetch("/api/sync-drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drafts })
  }).catch(() => {});
}

function collectCurrentConfig(options = {}) {
  const template = getCurrentTemplateKey();
  const shouldCreateNew = options.asNew || ["oppo", "vivo", "honor"].includes(currentConfigKey);
  return {
    id: shouldCreateNew ? `draft-${Date.now()}` : currentConfigKey,
    template,
    configName: getConfigInputValue("#configNameInput"),
    merchantName: getConfigInputValue('[data-preview="merchantName"]'),
    channelNo: getConfigInputValue('[data-preview="channelNo"]'),
    smsCategory: getConfigInputValue('[data-preview="smsCategory"]'),
    sourceIconColor: getSourceIconColor(),
    cardTitle: getConfigInputValue('[data-preview="cardTitle"]'),
    originText: normalizeOriginText(template, document.getElementById("originText")?.textContent),
    buttonText: getConfigInputValue('[data-preview="buttonText"]'),
    buttonLink: getConfigInputValue("#buttonLinkInput"),
    smsOriginal: smsTemplateInput.value.trim(),
    rawOriginalMode: Boolean(rawOriginalModeToggle?.checked),
    ...(template === "vivo" ? { vivoTipEnabled: vivoTipToggle.checked, vivoTipText: vivoTipInput.value.trim() } : {}),
    cardActions: template === "vivo" ? getVivoPrimaryAction() : undefined,
    vivoExtraActions: template === "vivo" ? getVivoExtraActions() : undefined,
    menus: getMenuTexts(),
    kv: getKvRows().map(row => ({
      key: row.querySelector(".kv-key").value.trim(),
      value: row.querySelector(".kv-value").value.trim(),
      highlight: row.querySelector(".kv-highlight")?.checked || false
    })).filter(item => item.key || item.value),
    updatedAt: new Date().toISOString()
  };
}

function saveCurrentDraft(options = {}) {
  const draft = collectCurrentConfig(options);
  const drafts = getStoredDrafts();
  const index = drafts.findIndex(item => item.id === draft.id);
  if (index >= 0) {
    drafts[index] = draft;
  } else {
    drafts.unshift(draft);
  }
  configs[draft.id] = draft;
  currentConfigKey = draft.id;
  setStoredDrafts(drafts);
  setEditorDirty(false);
  renderConfigList();
  return draft;
}

function getListCardTitle(config) {
  if (config.template === "vivo" && Array.isArray(config.kv) && config.kv[0]?.value) {
    return config.kv[0].value;
  }
  return config.cardTitle || "";
}

function createConfigRow(configKey, config) {
  const displayConfig = resolveConfig(config);
  const row = document.createElement("tr");
  const cells = [
    displayConfig.configName,
    getTemplateLabel(displayConfig.template),
    displayConfig.merchantName,
    displayConfig.channelNo,
    displayConfig.smsCategory,
    displayConfig.smsOriginal,
    getListCardTitle(displayConfig)
  ];

  cells.forEach((text, index) => {
    const cell = document.createElement("td");
    cell.textContent = text || "";
    if (index === 5) {
      cell.title = displayConfig.smsOriginal || "";
    }
    row.append(cell);
  });

  const statusCell = document.createElement("td");
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = "草稿";
  statusCell.append(tag);
  row.append(statusCell);

  const actionCell = document.createElement("td");
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "link editBtn";
  editButton.dataset.config = configKey;
  editButton.textContent = "编辑";
  actionCell.append(editButton);
  if (configKey.startsWith("draft-")) {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "link deleteBtn";
    deleteButton.dataset.config = configKey;
    deleteButton.textContent = "删除";
    actionCell.append(document.createTextNode(" / "), deleteButton);
  }
  row.append(actionCell);
  return row;
}

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function getConfigSearchText(configKey, config) {
  const displayConfig = resolveConfig(config);
  const kvText = Array.isArray(displayConfig.kv)
    ? displayConfig.kv.map(item => `${item.key || ""} ${item.value || ""}`).join(" ")
    : "";
  return normalizeSearchText([
    configKey,
    displayConfig.configName,
    getTemplateLabel(displayConfig.template),
    displayConfig.merchantName,
    displayConfig.channelNo,
    displayConfig.smsCategory,
    displayConfig.smsOriginal,
    getListCardTitle(displayConfig),
    displayConfig.buttonText,
    kvText
  ].join(" "));
}

function getConfigStatus(config) {
  return config.status || "draft";
}

function matchesConfigFilters(configKey, config) {
  const query = normalizeSearchText(configSearchInput?.value);
  const selectedTemplate = templateFilter?.value || "all";
  const selectedStatus = statusFilter?.value || "all";
  const displayConfig = resolveConfig(config);

  if (query && !getConfigSearchText(configKey, displayConfig).includes(query)) return false;
  if (selectedTemplate !== "all" && displayConfig.template !== selectedTemplate) return false;
  if (selectedStatus !== "all" && getConfigStatus(displayConfig) !== selectedStatus) return false;
  return true;
}

function appendEmptyConfigRow() {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 9;
  cell.className = "empty-row";
  cell.textContent = "没有匹配的配置";
  row.append(cell);
  configTableBody.append(row);
}

function renderConfigList() {
  if (!configTableBody) return;
  configTableBody.innerHTML = "";
  const storedDrafts = getStoredDrafts();
  let draftsChanged = false;
  const normalizedDrafts = storedDrafts.map(draft => {
    const normalized = applyBatchDefaults(draft);
    if (normalized !== draft) draftsChanged = true;
    configs[normalized.id] = normalized;
    return normalized;
  });
  if (draftsChanged) setStoredDrafts(normalizedDrafts);
  else syncDraftsToDisk(normalizedDrafts);
  const baseKeys = ["oppo", "vivo", "honor", ...batchConfigOrder];
  let renderedCount = 0;
  baseKeys.forEach(key => {
    configs[key] = applyBatchDefaults(configs[key]);
    if (!matchesConfigFilters(key, configs[key])) return;
    configTableBody.append(createConfigRow(key, configs[key]));
    renderedCount += 1;
  });
  normalizedDrafts.filter(draft => !baseKeys.includes(draft.id)).forEach(draft => {
    if (!matchesConfigFilters(draft.id, draft)) return;
    configTableBody.append(createConfigRow(draft.id, draft));
    renderedCount += 1;
  });
  if (!renderedCount) appendEmptyConfigRow();
}

function getEditorNavKeys() {
  const storedDrafts = getStoredDrafts().map(draft => {
    const normalized = applyBatchDefaults(draft);
    configs[normalized.id] = normalized;
    return normalized;
  });
  const baseKeys = ["oppo", "vivo", "honor", ...batchConfigOrder];
  const draftKeys = storedDrafts
    .map(draft => draft.id)
    .filter(id => id && !baseKeys.includes(id));
  return [...baseKeys, ...draftKeys].filter(key => configs[key]);
}

function updateEditorNavButtons() {
  if (!prevConfigBtn || !nextConfigBtn) return;
  const keys = getEditorNavKeys();
  const index = keys.indexOf(currentConfigKey);
  prevConfigBtn.disabled = index <= 0;
  nextConfigBtn.disabled = index === -1 || index >= keys.length - 1;
}

function navigateConfig(step) {
  const keys = getEditorNavKeys();
  const index = keys.indexOf(currentConfigKey);
  const nextKey = keys[index + step];
  if (!nextKey) return;
  if (!resolveUnsavedEditorChanges()) return;
  loadConfig(nextKey);
  showPage("editor");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindLivePreview() {
  document.querySelectorAll("[data-preview]").forEach(input => {
    const sync = () => {
      let value = input.value.trim();
      if (input.dataset.preview === "cardTitle" && getCurrentTemplateKey() === "oppo") value = getTitleDisplayText(value);
      setPreviewText(input.dataset.preview, value);
      if (input.dataset.preview === "cardTitle") renderKvPreview();
      if (input.dataset.preview === "buttonText") renderVivoCardActions();
      markEditorDirty();
    };
    input.addEventListener("input", sync);
  });
}

function createKvRow(key = "", value = "", highlight = false, options = {}) {
  const row = document.createElement("div");
  row.className = "kv-edit-row";
  if (options.primary) row.classList.add("vivo-head-row");

  const dragHandle = document.createElement("span");
  dragHandle.className = "kv-drag-handle";
  dragHandle.draggable = true;
  dragHandle.title = "拖拽排序";
  dragHandle.textContent = "☰";

  const keyInput = document.createElement("input");
  keyInput.className = "kv-key";
  keyInput.value = key;

  const valueInput = document.createElement(value.length > 24 ? "textarea" : "input");
  valueInput.className = "kv-value";
  valueInput.value = value;

  const styleToggle = document.createElement("label");
  styleToggle.className = "kv-style-toggle";
  const highlightInput = document.createElement("input");
  highlightInput.className = "kv-highlight";
  highlightInput.type = "checkbox";
  highlightInput.checked = highlight;
  styleToggle.append(highlightInput, document.createTextNode(" 启用"));

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "danger remove-kv";
  removeButton.textContent = "删除";

  row.append(dragHandle, keyInput, valueInput, styleToggle, removeButton);
  return row;
}

function getKvRows() {
  return Array.from(kvList.querySelectorAll(".kv-edit-row"));
}

const vivoKeyMeasureCanvas = document.createElement("canvas");
const EXPORT_SCALE = 2;

function getVivoKvKeyWidth(rows = getKvRows()) {
  if (getCurrentTemplateKey() !== "vivo") return 124;
  return 106;

  const texts = rows
    .map(row => row.querySelector(".kv-key")?.value.trim() || "")
    .filter(Boolean);
  const sourceTexts = texts.length ? texts : ["֪ͨ"];
  const ctx = vivoKeyMeasureCanvas.getContext("2d");
  ctx.font = "13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";

  const maxTextWidth = sourceTexts.reduce((max, text) => Math.max(max, getTextWidth(ctx, text)), 0);
  return Math.min(170, Math.max(92, Math.ceil(maxTextWidth + 24)));
}

function updateVivoKvLayout() {
  if (getCurrentTemplateKey() !== "vivo") {
    kvList.style.removeProperty("--vivo-kv-key-width");
    phonePreview.style.removeProperty("--vivo-kv-key-width");
    return;
  }

  const keyWidth = getVivoKvKeyWidth();
  kvList.style.setProperty("--vivo-kv-key-width", `${keyWidth}px`);
  phonePreview.style.setProperty("--vivo-kv-key-width", `${keyWidth}px`);
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".kv-edit-row:not(.dragging)")];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function syncVivoKvPrimaryRow() {
  if (currentConfigKey !== "vivo") return;
  getKvRows().forEach((row, index) => {
    row.classList.toggle("vivo-head-row", index === 0);
  });
}

function getKvEditorData() {
  return getKvRows().map(row => ({
    key: row.querySelector(".kv-key")?.value.trim() || "",
    value: row.querySelector(".kv-value")?.value.trim() || "",
    highlight: row.querySelector(".kv-highlight")?.checked || false
  }));
}

function getOppoFirstKvTitleIndex(rows) {
  return rows.findIndex(row => row.key || row.value);
}

function shouldUseOppoFirstKvTitle(rows = getKvEditorData()) {
  return getCurrentTemplateKey() === "oppo" &&
    !getConfigInputValue('[data-preview="cardTitle"]') &&
    getOppoFirstKvTitleIndex(rows) >= 0;
}

function updateOppoTitleMode(rows) {
  const titleNode = document.getElementById("cardTitle");
  if (!titleNode) return;

  let titleKeyNode = document.getElementById("oppoTitleKey");
  if (!titleKeyNode) {
    titleKeyNode = document.createElement("div");
    titleKeyNode.id = "oppoTitleKey";
    titleKeyNode.className = "oppo-title-key";
    titleNode.parentNode.insertBefore(titleKeyNode, titleNode);
  }

  const useFirstKvTitle = shouldUseOppoFirstKvTitle(rows);
  phonePreview.classList.toggle("oppo-no-intent-title", useFirstKvTitle);
  titleNode.classList.toggle("oppo-kv-title", useFirstKvTitle);

  if (!useFirstKvTitle) {
    titleKeyNode.hidden = true;
    titleKeyNode.textContent = "";
    if (getCurrentTemplateKey() === "oppo") {
      titleNode.textContent = getTitleDisplayText(getConfigInputValue('[data-preview="cardTitle"]'));
    }
    return;
  }

  const firstRow = rows[getOppoFirstKvTitleIndex(rows)] || {};
  titleKeyNode.hidden = false;
  titleKeyNode.textContent = firstRow.key || "";
  titleNode.textContent = firstRow.value || "";
}

function getVivoTipText() {
  return getCurrentTemplateKey() === "vivo" && vivoTipToggle.checked ? vivoTipInput.value.trim() : "";
}

function renderVivoTipPreview() {
  const tip = getVivoTipText();
  vivoTipTextField.hidden = !vivoTipToggle.checked;
  vivoTipPreview.hidden = !tip;
  vivoTipPreview.textContent = tip;
  vivoTipPreview.title = tip;
}

function isVivoRawOriginalMode() {
  return getCurrentTemplateKey() === "vivo" && Boolean(configs[currentConfigKey]?.rawOriginalMode);
}

function renderRawSmsPreview() {
  if (!rawSmsPreview) return;
  const rawMode = isVivoRawOriginalMode();
  const text = smsTemplateInput?.value.trim() || "";
  rawSmsPreview.replaceChildren();
  rawSmsPreview.hidden = !rawMode;
  kvPreview.hidden = rawMode;
  phonePreview.classList.toggle("vivo-raw-original", rawMode);
  if (!rawMode || !text) return;

  const urlPattern = /(?:https?:\/\/|(?:p|acs)\.fcbox\.com\/)[^\s，。；;！？!、)）]+/gi;
  let cursor = 0;
  text.replace(urlPattern, (match, offset) => {
    if (offset > cursor) rawSmsPreview.append(document.createTextNode(text.slice(cursor, offset)));
    const link = document.createElement("a");
    link.href = /^https?:\/\//i.test(match) ? match : `https://${match}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = match;
    rawSmsPreview.append(link);
    cursor = offset + match.length;
    return match;
  });
  if (cursor < text.length) rawSmsPreview.append(document.createTextNode(text.slice(cursor)));
}

function renderKvPreview() {
  syncVivoKvPrimaryRow();
  updateVivoKvLayout();
  kvPreview.innerHTML = "";
  renderRawSmsPreview();

  let visibleIndex = 0;
  const rows = getKvEditorData();
  const useOppoFirstKvTitle = shouldUseOppoFirstKvTitle(rows);
  const oppoTitleIndex = useOppoFirstKvTitle ? getOppoFirstKvTitleIndex(rows) : -1;
  updateOppoTitleMode(rows);

  rows.forEach((row, index) => {
    const key = row.key;
    const value = row.value;
    const highlighted = row.highlight;
    if (index === oppoTitleIndex) return;
    if (!key && !value) return;

    const previewRow = document.createElement("div");
    previewRow.className = "info-row";
    if (getCurrentTemplateKey() === "vivo" && visibleIndex === 0) previewRow.classList.add("vivo-head-row");
    const isHonorLongTip = currentConfigKey === "honor" && key === "提示" && value.length >= 10;
    if (isHonorLongTip) {
      previewRow.classList.add("honor-full-row");
    }

    const keyNode = document.createElement("span");
    keyNode.textContent = key || "字段名";
    if (getCurrentTemplateKey() === "vivo") {
      keyNode.textContent = "";
      getWrappedLinesByCount(key || "字段名", 8).forEach((line, lineIndex) => {
        if (lineIndex > 0) keyNode.append(document.createElement("br"));
        keyNode.append(document.createTextNode(line));
      });
    }

    const valueNode = document.createElement("b");
    valueNode.textContent = value || "字段值";
    if (highlighted) valueNode.classList.add("green", "underlined");

    previewRow.append(keyNode, valueNode);
    kvPreview.append(previewRow);
    visibleIndex += 1;
  });
}

function bindKvEditor() {
  let draggingRow = null;

  kvList.addEventListener("dragstart", event => {
    const handle = event.target.closest(".kv-drag-handle");
    if (!handle) return;
    draggingRow = handle.closest(".kv-edit-row");
    if (!draggingRow) return;
    draggingRow.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "");
  });

  kvList.addEventListener("dragover", event => {
    if (!draggingRow) return;
    event.preventDefault();
    const afterElement = getDragAfterElement(kvList, event.clientY);
    if (!afterElement) {
      kvList.append(draggingRow);
    } else if (afterElement !== draggingRow) {
      kvList.insertBefore(draggingRow, afterElement);
    }
    renderKvPreview();
  });

  kvList.addEventListener("dragend", () => {
    if (draggingRow) draggingRow.classList.remove("dragging");
    draggingRow = null;
    markEditorDirty();
    renderKvPreview();
  });

  kvList.addEventListener("input", event => {
    if (event.target.matches(".kv-key, .kv-value")) {
      renderKvPreview();
      markEditorDirty();
    }
  });

  kvList.addEventListener("change", event => {
    if (event.target.matches(".kv-highlight")) {
      renderKvPreview();
      markEditorDirty();
    }
  });

  kvList.addEventListener("click", event => {
    if (!event.target.matches(".remove-kv")) return;

    const rows = getKvRows();
    if (rows.length <= 1) {
      rows[0].querySelector(".kv-key").value = "";
      rows[0].querySelector(".kv-value").value = "";
      rows[0].querySelector(".kv-highlight").checked = false;
    } else {
      event.target.closest(".kv-edit-row").remove();
    }
    renderKvPreview();
    markEditorDirty();
  });

  document.getElementById("addKvBtn").addEventListener("click", () => {
    kvList.append(createKvRow("新增字段", "字段值", false));
    renderKvPreview();
    markEditorDirty();
  });
}

function bindDraftDirtyTracking() {
  ["#configNameInput", "#buttonLinkInput", "#smsTemplateInput"].forEach(selector => {
    document.querySelector(selector)?.addEventListener("input", markEditorDirty);
  });
}

function createMenuRow(text = "") {
  const row = document.createElement("div");
  row.className = "menu-edit-row";

  const textInput = document.createElement("input");
  textInput.className = "menu-text";
  textInput.value = text;
  textInput.maxLength = 12;
  textInput.placeholder = "输入菜单文案";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "danger remove-menu";
  removeButton.textContent = "删除";

  row.append(textInput, removeButton);
  return row;
}

function getMenuRows() {
  return Array.from(menuList.querySelectorAll(".menu-edit-row"));
}

function getMenuTexts() {
  return getMenuRows()
    .map(row => row.querySelector(".menu-text").value.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function getVivoPrimaryAction() {
  return getConfigInputValue('[data-preview="buttonText"]');
}

function getVivoExtraActions() {
  return Array.from(vivoActionList.children).slice(0, MAX_VIVO_EXTRA_ACTIONS).map(row => ({
    text: row.querySelector(".vivo-action-text").value.trim(),
    link: row.querySelector(".vivo-action-link").value.trim()
  }));
}

function getVivoCardActions() {
  return [getVivoPrimaryAction(), ...getVivoExtraActions().map(action => action.text)]
    .map(text => getDisplayText(text, 16));
}

function updateVivoActionEditor() {
  addVivoActionBtn.disabled = vivoActionList.children.length >= MAX_VIVO_EXTRA_ACTIONS;
  Array.from(vivoActionList.children).forEach((row, index) => {
    row.querySelector(".vivo-action-label").textContent = `按钮 ${index + 2} 文案`;
    row.querySelector("button").setAttribute("aria-label", `删除按钮 ${index + 2}`);
  });
}

function addVivoAction(action = {}) {
  if (vivoActionList.children.length >= MAX_VIVO_EXTRA_ACTIONS) return null;
  const row = document.createElement("div");
  row.className = "vivo-action-fields";
  row.innerHTML = '<label><span class="vivo-action-label"></span><input class="vivo-action-text" type="text"></label><label>按钮链接<input class="vivo-action-link" type="text"></label><button type="button">删除</button>';
  const input = row.querySelector(".vivo-action-text");
  input.value = action.text || "";
  row.querySelector(".vivo-action-link").value = action.link || "";
  row.addEventListener("input", () => {
    renderVivoCardActions();
    markEditorDirty();
  });
  row.querySelector("button").addEventListener("click", () => {
    row.remove();
    updateVivoActionEditor();
    renderVivoCardActions();
    markEditorDirty();
  });
  vivoActionList.append(row);
  updateVivoActionEditor();
  return input;
}

addVivoActionBtn.addEventListener("click", () => {
  const input = addVivoAction();
  if (!input) return;
  input.focus();
  renderVivoCardActions();
  markEditorDirty();
});

function renderVivoCardActions() {
  const button = document.getElementById("buttonText");
  if (!button) return;
  cardActionRow.replaceChildren(button);
  if (getCurrentTemplateKey() !== "vivo") {
    button.textContent = getDisplayText(getConfigInputValue('[data-preview="buttonText"]'));
    return;
  }

  getVivoCardActions().forEach((text, index) => {
    const actionButton = index === 0 ? button : document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "card-button";
    const label = document.createElement("span");
    label.textContent = text;
    actionButton.replaceChildren(label);
    actionButton.title = text;
    if (index > 0) cardActionRow.append(actionButton);
  });
}

function renderBottomMenuPreview() {
  const menuTexts = getMenuTexts();
  const templateKey = getCurrentTemplateKey();
  const isHonor = templateKey === "honor";
  const isOppo = templateKey === "oppo";
  const isVivo = templateKey === "vivo";
  const hasMenu = (isHonor || isOppo || isVivo) && menuTexts.length > 0;
  phonePreview.classList.toggle("honor-has-menu", isHonor && hasMenu);
  phonePreview.classList.toggle("oppo-has-menu", isOppo && hasMenu);
  phonePreview.classList.toggle("vivo-has-menu", isVivo && hasMenu);
  honorMenuPreview.className = isVivo ? "vivo-bottom-actions" : isHonor ? "honor-bottom-actions" : "oppo-bottom-actions";
  if (isVivo) {
    const vivoActions = [menuTexts[0] || "🔥抢30GB", menuTexts[1] || "🔥22元45G", menuTexts[2] || document.querySelector('[data-preview="buttonText"]')?.value.trim() || "👉去充值"];
    phonePreview.style.setProperty("--vivo-action-1", `"${vivoActions[0].replace(/"/g, '\\"')}"`);
    phonePreview.style.setProperty("--vivo-action-2", `"${vivoActions[1].replace(/"/g, '\\"')}"`);
    phonePreview.style.setProperty("--vivo-action-3", `"${vivoActions[2].replace(/"/g, '\\"')}"`);
  }
  honorMenuPreview.innerHTML = "";
  honorMenuPreview.dataset.count = String(menuTexts.length);

  if (!hasMenu) return;

  const keyboard = document.createElement("span");
  keyboard.className = isVivo ? "vivo-keyboard" : isHonor ? "honor-keyboard" : "oppo-keyboard";
    keyboard.textContent = "▦";
  honorMenuPreview.append(keyboard);

  menuTexts.forEach(text => {
    const item = document.createElement("span");
    item.textContent = text;
    honorMenuPreview.append(item);
  });
}

function bindMenuEditor() {
  menuList.addEventListener("input", event => {
    if (event.target.matches(".menu-text")) {
      renderBottomMenuPreview();
      markEditorDirty();
    }
  });

  menuList.addEventListener("click", event => {
    if (!event.target.matches(".remove-menu")) return;
    event.target.closest(".menu-edit-row").remove();
    renderBottomMenuPreview();
    markEditorDirty();
  });

  document.getElementById("addMenuBtn").addEventListener("click", () => {
    if (getMenuRows().length >= 3) {
      alert("当前模板最多配置 3 个菜单。");
      return;
    }
    menuList.append(createMenuRow(""));
    renderBottomMenuPreview();
    markEditorDirty();
    menuList.querySelector(".menu-edit-row:last-child .menu-text")?.focus();
  });
}

function bindSourceIconColor() {
  sourceIconColorOptions.addEventListener("change", event => {
    if (event.target.matches('input[name="sourceIconColor"]')) {
      setSourceIconColor(event.target.value);
      markEditorDirty();
    }
  });
}

function bindEmojiPicker() {
  if (!emojiPicker) return;
  emojiPicker.addEventListener("mousedown", event => {
    if (event.target.closest("[data-emoji]")) event.preventDefault();
  });
  emojiPicker.addEventListener("click", event => {
    const button = event.target.closest("[data-emoji]");
    if (!button) return;
    const emoji = button.dataset.emoji || "";
    const input = document.querySelector('[data-preview="buttonText"]');
    if (!input || !emoji) return;

    const hasCursor = document.activeElement === input;
    const start = hasCursor ? input.selectionStart ?? 0 : 0;
    const end = hasCursor ? input.selectionEnd ?? start : 0;
    input.value = `${input.value.slice(0, start)}${emoji}${input.value.slice(end)}`;
    const cursor = start + emoji.length;
    input.focus();
    input.setSelectionRange(cursor, cursor);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function normalizeSmsText(text) {
  return String(text || "").replace(/\s+/g, " ").replace(/[，,]\s*/g, "，").trim();
}

function pickFirstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function inferSmsCategory(text, title = "") {
  const source = `${title} ${text}`;
  if (/账单|应付|扣款|缴费|消费|余额/.test(source)) return "账单提醒";
  if (/退订|关闭|取消|违约金/.test(source)) return "业务关闭提醒";
  if (/流量/.test(source)) return "流量提醒";
  if (/话费|欠费|充值|余额/.test(source)) return "余额提醒";
  if (/快递|包裹|取件/.test(source)) return "取件提醒";
  return "通知提醒";
}

function inferChannelNo(merchantName, text = "") {
  const source = `${merchantName} ${text}`;
  const official = lookupOfficialChannelNo(source);
  if (official) return official;
  if (/电信/.test(source)) return "10000";
  if (/移动|10086/.test(source)) return "10086";
  if (/联通|10010/.test(source)) return "10010";
  if (/电力|国家电网|95598/.test(source)) return "95598";
  if (/丰巢|95333/.test(source)) return "95333";
  if (/邮政|EMS|11183/.test(source)) return "11183";
  const shortCode = String(text || "").match(/\b(9[0-9]{4}|1[0-9]{4,10})\b/);
  return shortCode?.[1] || "";
}

function lookupOfficialChannelNo(source = "") {
  const text = String(source || "");
  const merchantMap = [
    [/中国电信|电信|天翼/i, "10000"],
    [/中国移动|移动|移动通信|移动客服/i, "10086"],
    [/中国联通|联通|沃/i, "10010"],
    [/中国建设银行|建设银行|建行/i, "95533"],
    [/中国工商银行|工商银行|工行/i, "95588"],
    [/中国农业银行|农业银行|农行/i, "95599"],
    [/中国银行|中行/i, "95566"],
    [/招商银行|招行/i, "95555"],
    [/交通银行|交行/i, "95559"],
    [/中信银行/i, "95558"],
    [/平安银行/i, "95511"],
    [/民生银行/i, "95568"],
    [/光大银行/i, "95595"],
    [/华夏银行/i, "95577"],
    [/浦发银行|浦东发展银行/i, "95528"],
    [/兴业银行/i, "95561"],
    [/广发银行/i, "4008308003"],
    [/邮储|邮政储蓄|中国邮政/i, "95580"],
    [/国家电网|电力|电费/i, "95598"],
    [/丰巢/i, "95333"],
    [/EMS|邮政速递/i, "11183"]
  ];

  for (const [pattern, channelNo] of merchantMap) {
    if (pattern.test(text)) return channelNo;
  }
  return "";
}

function inferCardTitle(text) {
  const withoutMerchant = text.replace(/^【[^】]+】/, "").trim();
  const firstSentence = withoutMerchant.split(/[。！？;，,]/)[0]?.trim() || withoutMerchant;
  return firstSentence.slice(0, 28);
}

function inferButtonAction(text, category) {
  const source = `${category} ${text}`;
  const link = pickFirstMatch(text, [/(https?:\/\/[^\s，。；;]+)/]);
  if (/欠费|缴费|缴款|话费/.test(source)) return { buttonText: "🔥去APP缴费享优惠", buttonLink: link || "app://recharge?scene=arrears" };
  if (/账单|余额|消费/.test(source)) return { buttonText: "👉查看账单明细", buttonLink: link || "app://bill?scene=monthly" };
  if (/流量/.test(source)) return { buttonText: "🔥领流量包更省", buttonLink: link || "app://data?scene=package" };
  if (/充值|充流量|套餐/.test(source)) return { buttonText: "⚡领券充值更省钱", buttonLink: link || "app://recharge?scene=coupon" };
  if (/快递|取件|包裹/.test(source)) return { buttonText: "👉去APP取件", buttonLink: link || "app://pickup?scene=parcel" };
  return { buttonText: "👉去APP查看详情", buttonLink: link || "app://message?scene=detail" };
}

function addParsedKv(rows, usedKeys, key, value, highlight = false) {
  const cleaned = String(value || "").replace(/[。！？;,.，、?\s]+$/g, "").trim();
  if (!cleaned || usedKeys.has(key)) return;
  usedKeys.add(key);
  rows.push({ key, value: cleaned, highlight });
}

function parseSmsTemplate(text) {
  const normalized = normalizeSmsText(text);
  const merchant = pickFirstMatch(normalized, [/^【([^】]+)】/, /(?:商户|运营商|公司)[:：]?([^，。；;\s]+)/]);
  const title = inferCardTitle(normalized);
  const category = inferSmsCategory(normalized, title);
  const action = inferButtonAction(normalized, category);
  const rows = [];
  const usedKeys = new Set();

  [
    ["手机号", /(?:手机号|手机号码|当前号码|本机号码)[:：]?([0-9*]{7,})/],
    ["当前号码", /(?:当前号码)[:：]?([0-9*]{7,})/],
    ["账单时间", /(?:账单时间|日期|账单日期)[:：]?([0-9年月日\-\/时分~至:：]+[0-9分]?)/],
    ["业务", /(?:业务|产品|套餐|服务)[:：]?([^，。；;]+)/],
    ["状态", /(?:状态|结果)[:：]?([^，。；;]+)/],
    ["违约金", /(?:违约金)[:：]?([0-9.]+元)/],
    ["扣除费用", /(?:扣除费用|本期费用|实际应收)[:：]?([0-9.]+元)/],
    ["当前余额", /(?:当前余额|余额|可用余额)[:：]?([0-9.\-]+元)/],
    ["咨询电话", /(?:咨询电话|联系电话|客服电话|客服号码)[:：]?([0-9-]{7,})/],
    ["截至时间", /(?:截至时间|截止时间|到期时间)[:：]?([0-9年月日时分\-\/:：]+)/]
  ].forEach(([key, pattern]) => {
    const value = pickFirstMatch(normalized, [pattern]);
    addParsedKv(rows, usedKeys, key, value, /号码|电话|时间/.test(key));
  });

  const phone = pickFirstMatch(normalized, [/([1][0-9*]{6,10}[0-9])/, /([0-9]{3,4}\*{3,5}[0-9]{3,4})/]);
  addParsedKv(rows, usedKeys, "手机号", phone, true);

  const tel = pickFirstMatch(normalized, [/(400[0-9-]{6,})/, /(95[0-9]{3,})/]);
  addParsedKv(rows, usedKeys, "咨询电话", tel, true);

  if (rows.length === 0) addParsedKv(rows, usedKeys, "提示", normalized.replace(/^【[^】]+】/, ""), false);

  return {
    merchantName: merchant || document.getElementById("merchantName").textContent || "",
    channelNo: inferChannelNo(merchant, normalized) || document.getElementById("channelNo").textContent || "",
    smsCategory: category,
    cardTitle: title,
    buttonText: action.buttonText,
    buttonLink: action.buttonLink,
    kv: rows.slice(0, 8)
  };
}

function extractJsonFromText(text) {
  const cleaned = String(text || "").replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("AI 返回内容不是有效 JSON。");
  }
}

function normalizeAiParsedResult(result, fallbackText) {
  const fallback = parseSmsTemplate(fallbackText);
  const kv = Array.isArray(result.kv) ? result.kv : [];
  const rawButtonText = String(result.buttonText || fallback.buttonText || "").trim();
  const merchantName = String(result.merchantName || fallback.merchantName || "").trim();
  const channelNo = String(
    result.channelNo ||
    lookupOfficialChannelNo(`${merchantName} ${fallbackText}`) ||
    fallback.channelNo ||
    inferChannelNo(merchantName, fallbackText)
  ).trim();
  return {
    merchantName,
    channelNo,
    smsCategory: String(result.smsCategory || fallback.smsCategory || "").trim(),
    cardTitle: String(result.cardTitle || fallback.cardTitle || "").trim(),
    buttonText: /^[🔥⚡👉🎁📱]/.test(rawButtonText) ? rawButtonText : `🔥${rawButtonText || "去APP享福利"}`,
    buttonLink: String(result.buttonLink || fallback.buttonLink || "").trim(),
    kv: kv.map(item => ({
      key: String(item.key || "").trim(),
      value: String(item.value || "").trim(),
      highlight: Boolean(item.highlight)
    })).filter(item => item.key && item.value).slice(0, 8)
  };
}

function resolveConfig(config = {}) {
  const parsed = config.smsOriginal ? parseSmsTemplate(config.smsOriginal) : {};
  const rawOriginalMode = Boolean(config.rawOriginalMode);
  return {
    ...parsed,
    ...config,
    merchantName: config.merchantName || parsed.merchantName || "",
    channelNo: config.channelNo || parsed.channelNo || "",
    smsCategory: config.smsCategory || parsed.smsCategory || "",
    cardTitle: config.cardTitle ?? parsed.cardTitle ?? "",
    buttonText: config.buttonText || parsed.buttonText || "",
    buttonLink: config.buttonLink || parsed.buttonLink || "",
    kv: rawOriginalMode ? (Array.isArray(config.kv) ? config.kv : []) : (Array.isArray(config.kv) && config.kv.length ? config.kv : parsed.kv || []),
    menus: Array.isArray(config.menus) ? config.menus : [],
    rawOriginalMode,
    smsOriginal: config.smsOriginal || "",
    template: config.template || "vivo"
  };
}

function hydrateBatchConfigs() {
  const seeds = Array.isArray(window.smsBatchSeeds) ? window.smsBatchSeeds : [];
  seeds.forEach(seed => {
    if (!seed?.id) return;
    configs[seed.id] = resolveConfig({
      id: seed.id,
      template: seed.template || "vivo",
      configName: seed.configName || seed.id,
      merchantName: seed.merchantName || "",
      channelNo: seed.channelNo || "",
      smsCategory: seed.smsCategory || "",
      cardTitle: seed.cardTitle ?? "",
      originText: seed.originText || "",
      buttonText: seed.buttonText || "",
      buttonLink: seed.buttonLink || "",
      cardActions: seed.cardActions || "",
      smsOriginal: seed.smsOriginal || "",
      rawOriginalMode: Boolean(seed.rawOriginalMode),
      kv: Array.isArray(seed.kv) ? seed.kv : [],
      sourceIconColor: seed.sourceIconColor || "#2d7df0",
      menus: Array.isArray(seed.menus) ? seed.menus : []
    });
    configs[seed.id] = applyBatchDefaults(configs[seed.id]);
    batchConfigOrder.push(seed.id);
  });
}

async function parseSmsTemplateWithAi(text) {
  const endpoint = aiEndpointInput.value.trim();
  const upstream = aiUpstreamInput.value.trim();
  const networkProxy = aiNetworkProxyInput.value.trim();
  const model = aiModelInput.value.trim();
  const apiKey = normalizeApiKey(aiKeyInput.value);
  if (!endpoint || !upstream || !model) throw new Error("请填写本机代理、上游接口和模型名称。");
  assertAsciiHeaderValue("API Key", apiKey);
  assertAsciiHeaderValue("上游接口", upstream);
  assertAsciiHeaderValue("网络代理", networkProxy);

  const systemPrompt = [
    "你是短信卡片配置标注助手，只返回 JSON，不要解释。",
    "JSON 字段：merchantName, channelNo, smsCategory, cardTitle, buttonText, buttonLink, kv。",
    "channelNo 要填对应商户官方号码，优先根据短信签名中的商户判断：中国电信=10000，中国移动=10086，中国联通=10010，建设银行=95533，工商银行=95588，农业银行=95599，中国银行=95566，招商银行=95555，交通银行=95559，中信银行=95558，平安银行=95511，民生银行=95568，光大银行=95595，华夏银行=95577，浦发银行=95528，兴业银行=95561，广发银行=4008308003，国家电网/电力=95598，丰巢=95333，EMS=11183。",
    "cardTitle 要表达短信意图，突出用户收益或风险，建议 12-22 个中文字符。",
    "buttonText 必须以一个 emoji 开头，例如 🔥 ⚡ 👉 🎁，突出 APP 卖点活动，最长 16 字。",
    "buttonLink 优先使用短信中的链接；没有链接则生成 app://action?scene=xxx。",
    "kv 提取 3-8 个关键字段；手机号、电话、时间、日期、链接等 highlight=true。"
  ].join("\n");
  const request = requestModel => fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: "Bearer " + apiKey } : {}),
      "X-AI-Upstream": upstream,
      "X-Network-Proxy": networkProxy
    },
    body: JSON.stringify({
      model: requestModel,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ]
    })
  });

  let response = await request(model);
  let errorText = "";
  if (!response.ok) {
    errorText = await response.text();
    const modelUnavailable = response.status === 404 && /model_not_found|not available for this group/i.test(errorText);
    if (modelUnavailable && model !== DEFAULT_AI_MODEL) {
      response = await request(DEFAULT_AI_MODEL);
      if (response.ok) {
        aiModelInput.value = DEFAULT_AI_MODEL;
      } else {
        errorText = await response.text();
      }
    }
  }

  if (!response.ok) {
    const modelHint = /model_not_found|not available for this group/i.test(errorText)
      ? "当前模型“" + model + "”不可用，请在上游接口开通模型，或改用 " + DEFAULT_AI_MODEL + "。"
      : "";
    throw new Error("AI 接口请求失败：" + response.status + " " + modelHint + "\n" + errorText.slice(0, 180));
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI 接口没有返回可用内容。");
  return normalizeAiParsedResult(extractJsonFromText(content), text);
}
function applyParsedSms(parsed) {
  if (configs[currentConfigKey]) configs[currentConfigKey].rawOriginalMode = false;
  if (rawOriginalModeToggle) rawOriginalModeToggle.checked = false;
  setField('[data-preview="merchantName"]', parsed.merchantName);
  setField('[data-preview="channelNo"]', parsed.channelNo);
  setField('[data-preview="smsCategory"]', parsed.smsCategory);
  setField('[data-preview="cardTitle"]', parsed.cardTitle);
  if (parsed.buttonText) setField('[data-preview="buttonText"]', parsed.buttonText);
  if (parsed.buttonLink) setField("#buttonLinkInput", parsed.buttonLink);

  setPreviewText("merchantName", parsed.merchantName);
  setPreviewText("channelNo", parsed.channelNo);
  setPreviewText("smsCategory", parsed.smsCategory);
  setPreviewText("cardTitle", currentConfigKey === "oppo" ? getTitleDisplayText(parsed.cardTitle) : parsed.cardTitle);
  renderVivoCardActions();

  const configNameInput = document.getElementById("configNameInput");
  if (configNameInput) configNameInput.value = `${parsed.merchantName}${parsed.smsCategory}`;

  kvList.innerHTML = "";
  parsed.kv.forEach((item, index) => {
    kvList.append(createKvRow(item.key, item.value, item.highlight, { primary: currentConfigKey === "vivo" && index === 0 }));
  });
  renderKvPreview();
  markEditorDirty();
}

function bindSmsParser() {
  smsTemplateInput.addEventListener("input", () => {
    renderRawSmsPreview();
    markEditorDirty();
  });

  document.getElementById("parseSmsBtn").addEventListener("click", () => {
    const text = smsTemplateInput.value.trim();
    if (!text) {
      alert("请先粘贴短信模板。");
      return;
    }
    applyParsedSms(parseSmsTemplate(text));
  });

  document.getElementById("aiParseSmsBtn").addEventListener("click", async event => {
    const button = event.currentTarget;
    const text = smsTemplateInput.value.trim();
    if (!text) {
      alert("请先粘贴短信模板。");
      return;
    }

    button.disabled = true;
    button.textContent = "AI标注中...";
    try {
      applyParsedSms(await parseSmsTemplateWithAi(text));
    } catch (error) {
      console.error(error);
      alert(`${error.message}\n\n已保留本地规则标注按钮，你也可以先用“自动标注并生成”兜底。`);
    } finally {
      button.disabled = false;
      button.textContent = "AI自动标注";
    }
  });

  document.getElementById("clearSmsBtn").addEventListener("click", () => {
    smsTemplateInput.value = "";
    renderRawSmsPreview();
    markEditorDirty();
    smsTemplateInput.focus();
  });
}

function handleVivoTipEdit() {
  renderVivoTipPreview();
  markEditorDirty();
}

vivoTipToggle.addEventListener("change", handleVivoTipEdit);
vivoTipInput.addEventListener("input", handleVivoTipEdit);

rawOriginalModeToggle?.addEventListener("change", event => {
  if (configs[currentConfigKey]) {
    configs[currentConfigKey].rawOriginalMode = Boolean(event.target.checked);
  }
  renderKvPreview();
  markEditorDirty();
});

function applyTemplate(templateKey) {
  const template = templates[templateKey] || templates.oppo;
  phonePreview.className = `phone-frame ${template.previewClass}`;
  templateName.textContent = template.name;
  factoryTemplateName.value = template.name;
  composeInput.textContent = templateKey === "honor" ? "短信/彩信" : "短信";
  const composeSend = document.querySelector(".compose-send");
  if (composeSend) composeSend.textContent = templateKey === "vivo" ? "发送" : "➤";
  if (chatTime) chatTime.textContent = templateKey === "vivo" ? "短信\n14:13" : "15:51";
  updateEditorTemplateUi(templateKey);
}

function loadConfig(configKey) {
  const config = applyBatchDefaults(resolveConfig(configs[configKey] || configs.oppo));
  configs[configKey] = config;
  currentConfigKey = configKey;
  applyTemplate(config.template);
  const buttonText = getConfigButtonText(config);
  const originText = normalizeOriginText(config.template, config.originText);

  editorTitle.textContent = `编辑短信卡片配置 - ${templates[config.template].name} - ${config.configName || configKey}`;
  setField("#configNameInput", config.configName);
  setField('[data-preview="merchantName"]', config.merchantName);
  setField('[data-preview="channelNo"]', config.channelNo);
  setField('[data-preview="smsCategory"]', config.smsCategory);
  setField('[data-preview="cardTitle"]', config.cardTitle);
  setField('[data-preview="buttonText"]', buttonText);
  setField("#buttonLinkInput", config.buttonLink);
  vivoActionList.replaceChildren();
  if (config.template === "vivo" && Array.isArray(config.vivoExtraActions)) {
    config.vivoExtraActions.slice(0, MAX_VIVO_EXTRA_ACTIONS).forEach(action => addVivoAction(action));
  }
  updateVivoActionEditor();
  smsTemplateInput.value = config.smsOriginal || "";
  if (rawOriginalModeToggle) rawOriginalModeToggle.checked = Boolean(config.rawOriginalMode);
  vivoTipToggle.checked = Boolean(config.vivoTipEnabled);
  vivoTipInput.value = config.vivoTipText || "";
  renderVivoTipPreview();
  setSourceIconColor(config.sourceIconColor || "#2d7df0");

  setPreviewText("merchantName", config.merchantName);
  setPreviewText("channelNo", config.channelNo);
  setPreviewText("smsCategory", config.smsCategory);
  setPreviewText("cardTitle", config.template === "oppo" ? getTitleDisplayText(config.cardTitle) : "");
  setPreviewText("originText", originText);
  setPreviewText("buttonText", getDisplayText(buttonText));
  renderVivoCardActions();

  kvList.innerHTML = "";
  config.kv.forEach((item, index) => {
    kvList.append(createKvRow(item.key, item.value, item.highlight, { primary: config.template === "vivo" && index === 0 }));
  });

  menuEditor.hidden = !["oppo", "honor", "vivo"].includes(config.template);
  menuList.innerHTML = "";
  (config.menus || []).slice(0, 3).forEach(text => {
    menuList.append(createMenuRow(text));
  });

  renderKvPreview();
  renderBottomMenuPreview();
  updateEditorNavButtons();
  setEditorDirty(false);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, width, height, radius, color) {
  drawRoundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = color;
  ctx.fill();
}

const phoneIconPath = new Path2D("M737.17551 923.167347c-40.228571 0-86.204082-7.314286-134.269388-22.465306-114.938776-36.04898-228.310204-110.759184-318.693877-210.546939-135.836735-149.942857-201.142857-299.363265-188.081633-432.587755 3.657143-32.914286 14.628571-74.710204 64.261225-108.669388 38.138776-30.302041 81.502041-48.587755 115.461224-47.542857 35.526531 0.522449 48.065306 13.061224 84.636735 66.873469C416.391837 245.55102 420.571429 284.212245 418.481633 306.155102c-3.657143 36.571429-24.032653 52.244898-41.795919 66.35102-4.702041 3.657143-8.881633 6.791837-12.538775 10.44898-21.942857 28.212245-49.110204 66.873469 66.35102 185.991837 98.742857 94.563265 151.510204 106.057143 173.97551 104.489796 17.240816-1.044898 24.555102-10.44898 27.167347-13.583674l0.522449-0.522449c36.571429-51.722449 49.110204-64.261224 84.114286-69.485714 34.481633-5.22449 51.722449 5.22449 124.342857 51.2 65.828571 41.273469 96.130612 68.963265 88.816327 111.804082-2.089796 47.542857-38.138776 111.804082-79.412245 140.538775-28.212245 19.853061-66.873469 29.779592-112.84898 29.779592zM273.240816 142.628571c-18.808163 0-52.244898 9.926531-88.293877 39.183674l-1.044898 1.044898c-33.436735 22.465306-42.840816 48.065306-46.497959 78.889796-11.493878 120.685714 49.632653 259.134694 177.632653 400.195918 138.971429 153.077551 311.379592 219.428571 423.183673 219.428572 37.093878 0 67.395918-7.314286 87.771429-21.420409 33.436735-23.510204 60.604082-78.367347 61.648979-109.191836l0.522449-3.134694c2.089796-12.016327 4.179592-24.032653-70.008163-70.530612-71.053061-44.930612-78.367347-48.065306-95.608163-45.453062-17.763265 2.612245-21.420408 3.134694-56.42449 52.767347l-1.044898 1.044898c-17.763265 22.465306-40.75102 28.734694-56.946939 30.302041-52.767347 4.179592-122.253061-35.004082-206.367347-115.983673l-0.522449-0.522449c-132.179592-135.836735-104.489796-196.440816-68.963265-242.416327l2.612245-2.612245c5.746939-5.22449 10.971429-9.926531 16.718367-14.106122 16.195918-13.061224 24.032653-19.853061 26.122449-37.616327 2.089796-24.032653-15.15102-61.126531-50.677551-110.236735l-0.522449-0.522448c-32.914286-48.587755-36.04898-48.587755-51.2-48.587756-1.044898-0.522449-1.567347-0.522449-2.089796-0.522449z");

function drawPhoneHandsetIcon(ctx, x, y, size = 24, color = "#333333") {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 1024, size / 1024);
  ctx.fillStyle = color;
  ctx.fill(phoneIconPath);
  ctx.restore();
}

function drawBackChevron(ctx, x, y, size = 18, color = "#111") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.65, y);
  ctx.lineTo(x, y + size * 0.5);
  ctx.lineTo(x + size * 0.65, y + size);
  ctx.stroke();
  ctx.restore();
}

function drawMoreDots(ctx, x, y, color = "#111") {
  ctx.save();
  ctx.fillStyle = color;
  [0, 8, 16].forEach(offset => {
    ctx.beginPath();
    ctx.arc(x, y + offset, 1.7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawKeyboardIcon(ctx, x, y, width = 18, height = 14, color = "#111") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.3;
  drawRoundRect(ctx, x, y, width, height, 2);
  ctx.stroke();
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      ctx.fillRect(x + 3 + col * 3.4, y + 3.5 + row * 3.4, 1.3, 1.3);
    }
  }
  ctx.fillRect(x + 5, y + height - 3.3, width - 10, 1.2);
  ctx.restore();
}

function getTextWidth(ctx, text) {
  return ctx.measureText(text).width;
}

function normalizeApiKey(value) {
  return String(value || "").trim().replace(/^Bearer\s+/i, "").trim();
}

function assertAsciiHeaderValue(label, value) {
  if (!value) return;
  if (!/^[\x20-\x7E]+$/.test(value)) {
    throw new Error(`${label} 含有中文、全角空格、换行或不可见字符，请重新粘贴纯英文/数字格式的值。`);
  }
}

function fillTextWithLetterSpacing(ctx, text, x, y, letterSpacing = 0) {
  let currentX = x;
  Array.from(String(text || "")).forEach(char => {
    ctx.fillText(char, currentX, y);
    currentX += getTextWidth(ctx, char) + letterSpacing;
  });
}

function getTextWidthWithLetterSpacing(ctx, text, letterSpacing = 0) {
  const chars = Array.from(String(text || ""));
  if (!chars.length) return 0;
  return chars.reduce((width, char) => width + getTextWidth(ctx, char), 0) + (chars.length - 1) * letterSpacing;
}

function isAsciiWordChar(char) {
  return /[A-Za-z0-9._:/?=&%#*+-]/.test(char);
}

function tokenizeWrapText(text) {
  const chars = Array.from(String(text || ""));
  const tokens = [];
  let buffer = "";

  const flush = () => {
    if (buffer) tokens.push(buffer);
    buffer = "";
  };

  chars.forEach(char => {
    if (isAsciiWordChar(char)) {
      buffer += char;
      return;
    }
    if (buffer && /[\u4e00-\u9fff]/.test(char) && /[\d.]+$/.test(buffer) && /[人民币元年月日时分秒号]/.test(char)) {
      buffer += char;
      return;
    }
    flush();
    tokens.push(char);
  });
  flush();
  return tokens;
}

function getWrappedLines(ctx, text, maxWidth, maxLines = Infinity, options = {}) {
  const letterSpacing = options.letterSpacing || 0;
  const measure = value => getTextWidthWithLetterSpacing(ctx, value, letterSpacing);
  const lines = [];
  const paragraphs = String(text || "").split(/\r?\n/);

  for (const paragraph of paragraphs) {
    let current = "";
    const tokens = tokenizeWrapText(paragraph);

    for (const token of tokens) {
      const next = current + token;
      if (current && measure(next) > maxWidth) {
        lines.push(current);
        current = token;
        if (lines.length >= maxLines) return lines;
      } else {
        current = next;
      }
    }

    if (current && lines.length < maxLines) lines.push(current);
    if (lines.length >= maxLines) return lines;
  }

  return lines;
}

function getRichWrappedLines(ctx, text, maxWidth) {
  const linkPattern = /(?:https?:\/\/|(?:p|acs)\.fcbox\.com\/)[^\s，。；;！？!、)）]+/gi;
  const parts = [];
  let cursor = 0;
  String(text || "").replace(linkPattern, (match, offset) => {
    if (offset > cursor) parts.push({ text: String(text).slice(cursor, offset), color: "#1b1f25" });
    parts.push({ text: match, color: "#1683d8" });
    cursor = offset + match.length;
    return match;
  });
  if (cursor < String(text || "").length) {
    parts.push({ text: String(text).slice(cursor), color: "#1b1f25" });
  }

  const lines = [[]];
  let lineWidth = 0;
  const pushRun = (char, color) => {
    const line = lines[lines.length - 1];
    const previous = line[line.length - 1];
    if (previous && previous.color === color) previous.text += char;
    else line.push({ text: char, color });
  };

  parts.forEach(part => {
    Array.from(part.text).forEach(char => {
      if (char === "\n") {
        lines.push([]);
        lineWidth = 0;
        return;
      }
      const charWidth = getTextWidth(ctx, char);
      if (lineWidth > 0 && lineWidth + charWidth > maxWidth) {
        lines.push([]);
        lineWidth = 0;
      }
      pushRun(char, part.color);
      lineWidth += charWidth;
    });
  });
  return lines.length ? lines : [[]];
}

function drawRichWrappedText(ctx, text, x, y, maxWidth, lineHeight, font) {
  ctx.font = font;
  const lines = getRichWrappedLines(ctx, text, maxWidth);
  lines.forEach((runs, lineIndex) => {
    let currentX = x;
    runs.forEach(run => {
      ctx.fillStyle = run.color;
      ctx.fillText(run.text, currentX, y + lineIndex * lineHeight);
      currentX += getTextWidth(ctx, run.text);
    });
  });
  return lines.length;
}

function getWrappedLinesByCount(text, maxChars, maxLines = Infinity) {
  const source = Array.from(String(text || ""));
  const lines = [];
  for (let index = 0; index < source.length && lines.length < maxLines; index += maxChars) {
    lines.push(source.slice(index, index + maxChars).join(""));
  }
  return lines.length ? lines : [""];
}

function renderOppoPreviewToCanvas() {
  const scale = EXPORT_SCALE;
  const width = 390;
  const height = 858;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(scale, scale);
  ctx.textBaseline = "top";
  ctx.fillStyle = "#eef0f3";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#111";
  ctx.font = "700 17px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillText("16:01", 24, 12);
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("⌁ WiFi ▣ 46", 288, 14);

  drawBackChevron(ctx, 18, 47, 18);
  ctx.font = "600 19px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillStyle = "#2f3338";
  ctx.fillText(document.getElementById("merchantName").textContent || "", 62, 48);
  ctx.font = "14px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillStyle = "#70757d";
  ctx.fillText(document.getElementById("channelNo").textContent || "", 62, 73);
  drawPhoneHandsetIcon(ctx, 292, 47, 25);
  drawMoreDots(ctx, 361, 48);

  ctx.fillStyle = "#70757d";
  ctx.font = "14px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("15:51", width / 2, 109);
  ctx.textAlign = "left";

  const cardX = 15;
  const cardY = 136;
  const cardW = 360;
  const pad = 20;
  const editorRows = getKvEditorData().filter(row => row.key || row.value);
  const useFirstKvTitle = shouldUseOppoFirstKvTitle(editorRows);
  const firstKvTitleIndex = useFirstKvTitle ? getOppoFirstKvTitleIndex(editorRows) : -1;
  const firstKvTitleRow = firstKvTitleIndex >= 0 ? editorRows[firstKvTitleIndex] : null;
  const kvRows = editorRows.filter((row, index) => index !== firstKvTitleIndex);

  const titleKeyText = useFirstKvTitle ? firstKvTitleRow?.key || "" : "";
  const titleText = useFirstKvTitle ? firstKvTitleRow?.value || "" : document.getElementById("cardTitle").textContent || "";
  ctx.font = "800 23px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  const titleLines = getWrappedLines(ctx, titleText, cardW - pad * 2, Infinity, { letterSpacing: 1 }).filter(Boolean);
  const titleLineHeight = 30.5;
  const titleKeyLines = titleKeyText ? getWrappedLinesByCount(titleKeyText, 6) : [];
  const titleKeyHeight = titleKeyLines.length ? titleKeyLines.length * 21 + 6 : 0;

  let measuredY = cardY + pad + 45 + titleKeyHeight + titleLines.length * titleLineHeight + 23;
  ctx.font = "500 16px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  const kvLayouts = kvRows.map(row => {
    const keyLines = getWrappedLinesByCount(row.key, 6);
    const valueLines = getWrappedLines(ctx, row.value, cardW - pad * 2 - 99);
    const height = Math.max(keyLines.length * 23, valueLines.length * 23, 23);
    measuredY += height + 14;
    return { ...row, keyLines, valueLines, height };
  });

  const buttonY = measuredY + 6;
  const cardH = Math.max(244, buttonY + 40 + 17 - cardY);
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 16, "#fff");

  let y = cardY + pad;
  ctx.fillStyle = getSourceIconColor();
  ctx.beginPath();
  ctx.arc(cardX + pad + 11, y + 11, 11, 0, Math.PI * 2);
  ctx.fill();
  fillRoundRect(ctx, cardX + pad + 7, y + 7, 9, 9, 2, "#fff");

  ctx.fillStyle = "#17191c";
  ctx.font = "15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillText(document.getElementById("smsCategory").textContent || "", cardX + pad + 32, y + 4);
  y += 45;

  if (titleKeyLines.length) {
    ctx.fillStyle = "#7b7f86";
    ctx.font = "15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    titleKeyLines.forEach((line, index) => {
      ctx.fillText(line, cardX + pad, y + index * 21);
    });
    y += titleKeyLines.length * 21 + 6;
  }

  ctx.fillStyle = "#17191c";
  ctx.font = "800 23px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  titleLines.forEach((line, index) => {
    fillTextWithLetterSpacing(ctx, line, cardX + pad, y + index * titleLineHeight, 1);
  });
  y += titleLines.length * titleLineHeight + 23;

  kvLayouts.forEach(row => {
    ctx.fillStyle = "#7b7f86";
    ctx.font = "15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    row.keyLines.forEach((line, index) => {
      ctx.fillText(line, cardX + pad, y + index * 23);
    });

    ctx.fillStyle = row.highlight ? "#1e9b3b" : "#17191c";
    ctx.font = "500 16px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    const valueX = cardX + pad + 99;
    row.valueLines.forEach((line, index) => {
      ctx.fillText(line, valueX, y + index * 23);
    });
    if (row.highlight) {
      ctx.strokeStyle = "#1e9b3b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(valueX, y + 21);
      ctx.lineTo(valueX + Math.min(getTextWidth(ctx, row.value), cardW - pad * 2 - 99), y + 21);
      ctx.stroke();
    }
    y += row.height + 14;
  });

  const buttonText = getDisplayText(document.querySelector('[data-preview="buttonText"]')?.value || document.getElementById("buttonText").textContent || "");
  const drawButtonY = y + 6;
  fillRoundRect(ctx, cardX + pad, drawButtonY, cardW - pad * 2, 40, 20, "#00c624");
  ctx.fillStyle = "#fff";
  ctx.font = "700 15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(buttonText, cardX + cardW / 2, drawButtonY + 21);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillStyle = "#1d9f3a";
  ctx.font = "400 14px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillText("查看原文", 42, cardY + cardH + 16);

  const menuTexts = getMenuTexts();
  if (menuTexts.length > 0) {
    drawOppoMenuBar(ctx, width, height, menuTexts);
  } else {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, height - 80, width, 80);
    ctx.strokeStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.moveTo(0, height - 80);
    ctx.lineTo(width, height - 80);
    ctx.stroke();

    const composeY = height - 59;
    const composeGap = 8;
    const circleSize = 38;
    const inputW = 262;
    const composeW = circleSize + composeGap + inputW + composeGap + circleSize;
    const composeX = (width - composeW) / 2;
    const plusX = composeX;
    const inputX = plusX + circleSize + composeGap;
    const sendX = inputX + inputW + composeGap;
    fillRoundRect(ctx, plusX, composeY, circleSize, circleSize, 19, "#e7e7e7");
    fillRoundRect(ctx, inputX, composeY, inputW, 38, 19, "#e4e4e4");
    fillRoundRect(ctx, sendX, composeY, circleSize, circleSize, 19, "#e7e7e7");
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#7d7f83";
    ctx.font = "24px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("+", plusX + circleSize / 2, composeY + circleSize / 2 + 1);
    ctx.fillStyle = "#8b8d91";
    ctx.font = "18px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("短信", inputX + 16, composeY + 19);
    ctx.fillStyle = "#a3a5a8";
    ctx.beginPath();
    ctx.moveTo(sendX + 14, composeY + 12);
    ctx.lineTo(sendX + 27, composeY + 19);
    ctx.lineTo(sendX + 14, composeY + 26);
    ctx.closePath();
    ctx.fill();
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  return canvas;
}

function drawChinaMobileLogo(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  fillRoundRect(ctx, 0, 0, size, size, size / 2, "#fff");
  ctx.lineCap = "round";
  ctx.lineWidth = size * 0.12;
  ctx.strokeStyle = "#1b96d4";
  ctx.beginPath();
  ctx.moveTo(size * 0.22, size * 0.55);
  ctx.bezierCurveTo(size * 0.38, size * 0.32, size * 0.56, size * 0.22, size * 0.78, size * 0.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.22, size * 0.45);
  ctx.bezierCurveTo(size * 0.38, size * 0.68, size * 0.56, size * 0.78, size * 0.78, size * 0.68);
  ctx.stroke();
  ctx.strokeStyle = "#8bc540";
  ctx.beginPath();
  ctx.moveTo(size * 0.26, size * 0.50);
  ctx.bezierCurveTo(size * 0.42, size * 0.38, size * 0.58, size * 0.38, size * 0.74, size * 0.50);
  ctx.stroke();
  ctx.restore();
}

function drawOppoMenuBar(ctx, width, height, menuTexts) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, height - 74, width, 74);
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(0, height - 74);
  ctx.lineTo(width, height - 74);
  ctx.stroke();

  const keyboardW = 54;
  const itemW = (width - keyboardW) / menuTexts.length;
  const yTop = height - 56;
  const yBottom = height - 22;

  drawKeyboardIcon(ctx, 18, height - 45, 18, 14, "#17191c");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = "#c9ccd2";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(keyboardW, yTop);
  ctx.lineTo(keyboardW, yBottom);
  menuTexts.slice(0, -1).forEach((_, index) => {
    const x = keyboardW + itemW * (index + 1);
    ctx.moveTo(x, yTop);
    ctx.lineTo(x, yBottom);
  });
  ctx.stroke();

  ctx.fillStyle = "#202328";
  ctx.font = "600 14px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  menuTexts.forEach((text, index) => {
    ctx.fillText(text, keyboardW + itemW * index + itemW / 2, height - 38);
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

function drawHonorComposeBar(ctx, width, height) {
  fillRoundRect(ctx, 0, height - 66, width, 66, 16, "#fff");
  const y = height - 48;
  const plusX = 23;
  const inputX = 65;
  const inputW = 206;
  const emojiX = 282;
  const sendX = 324;

  fillRoundRect(ctx, plusX, y, 34, 34, 17, "#f0f1f3");
  fillRoundRect(ctx, inputX, y, inputW, 34, 17, "#ececec");
  fillRoundRect(ctx, emojiX, y, 34, 34, 17, "#f0f1f3");
  fillRoundRect(ctx, sendX, y, 34, 34, 17, "#f0f1f3");

  ctx.fillStyle = "#85888d";
  ctx.font = "24px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("+", plusX + 17, y + 16);
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText("?", emojiX + 17, y + 17);
  ctx.fillText("?", sendX + 17, y + 17);
  ctx.textAlign = "left";
  ctx.font = "15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillText("短信/彩信", inputX + 14, y + 17);
  ctx.textBaseline = "top";
}

function drawHonorMenuBar(ctx, width, height, menuTexts) {
  fillRoundRect(ctx, 0, height - 66, width, 66, 16, "#fff");
  const yTop = height - 52;
  const yBottom = height - 18;
  const keyboardW = 54;
  const itemW = (width - keyboardW) / menuTexts.length;

  ctx.fillStyle = "#111";
  ctx.font = "19px Arial, sans-serif";
  ctx.fillText("?", 27, height - 38);

  ctx.strokeStyle = "#c9ccd2";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(keyboardW, yTop);
  ctx.lineTo(keyboardW, yBottom);
  menuTexts.slice(0, -1).forEach((_, index) => {
    const x = keyboardW + itemW * (index + 1);
    ctx.moveTo(x, yTop);
    ctx.lineTo(x, yBottom);
  });
  ctx.stroke();

  ctx.fillStyle = "#2f76f6";
  ctx.font = "700 16px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  menuTexts.forEach((text, index) => {
    ctx.fillText(text, keyboardW + itemW * index + itemW / 2, height - 34);
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

function drawVivoMenuBar(ctx, width, height, menuTexts) {
  fillRoundRect(ctx, 0, height - 66, width, 66, 16, "#fff");
  const yTop = height - 52;
  const yBottom = height - 18;
  const keyboardW = 54;
  const itemW = (width - keyboardW) / menuTexts.length;

  drawKeyboardIcon(ctx, 18, height - 47, 17, 13);

  ctx.strokeStyle = "#d7d7d7";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(keyboardW, yTop);
  ctx.lineTo(keyboardW, yBottom);
  menuTexts.slice(0, -1).forEach((_, index) => {
    const x = keyboardW + itemW * (index + 1);
    ctx.moveTo(x, yTop);
    ctx.lineTo(x, yBottom);
  });
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.font = "400 13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  menuTexts.forEach((text, index) => {
    ctx.fillText(text, keyboardW + itemW * index + itemW / 2, height - 34);
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

function drawVivoComposeBar(ctx, width, height) {
  const barY = height - 66;
  const centerY = barY + 33;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, barY, width, 66);
  ctx.strokeStyle = "#efefef";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(width, barY);
  ctx.stroke();

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  const plusX = 32;
  const plusY = centerY;
  ctx.beginPath();
  ctx.moveTo(plusX - 9, plusY);
  ctx.lineTo(plusX + 9, plusY);
  ctx.moveTo(plusX, plusY - 9);
  ctx.lineTo(plusX, plusY + 9);
  ctx.stroke();

  const inputX = 78;
  const inputY = centerY - 19;
  const inputW = 230;
  const inputH = 38;
  fillRoundRect(ctx, inputX, inputY, inputW, inputH, 9, "#f7f7f7");
  ctx.strokeStyle = "#e7e7e7";
  drawRoundRect(ctx, inputX, inputY, inputW, inputH, 9);
  ctx.stroke();

  ctx.fillStyle = "#c5c5c5";
  ctx.font = "400 17px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("短信/彩信", inputX + 14, centerY + 1);

  ctx.fillStyle = "#bdddfb";
  ctx.font = "500 17px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("发送", width - 20, centerY + 1);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

function renderHonorPreviewToCanvas() {
  const scale = EXPORT_SCALE;
  const width = 390;
  const height = 858;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(scale, scale);
  ctx.textBaseline = "top";
  ctx.fillStyle = "#f2f3f7";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#111";
  ctx.font = "600 15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillText("16:01", 30, 10);
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("⌁ WiFi ▣ 46", 300, 12);

  ctx.font = "28px Arial, sans-serif";
  ctx.fillText("?", 18, 48);
  drawChinaMobileLogo(ctx, 58, 48, 36);
  ctx.font = "700 18px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillStyle = "#111";
  ctx.fillText(document.getElementById("merchantName").textContent || "", 104, 48);
  ctx.font = "13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillStyle = "#8b8d92";
  ctx.fillText(document.getElementById("channelNo").textContent || "", 104, 70);
  ctx.font = "19px Arial, sans-serif";
  ctx.fillStyle = "#111";
  drawPhoneHandsetIcon(ctx, 318, 48, 23);
  ctx.fillText("?", 342, 50);

  ctx.fillStyle = "#70757d";
  ctx.font = "13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("短信/彩信", width / 2, 112);
  ctx.fillText("15:51", width / 2, 131);
  ctx.textAlign = "left";

  const cardX = 25;
  const cardY = 160;
  const cardW = 340;
  const pad = 18;
  const gradient = ctx.createLinearGradient(0, cardY, 0, cardY + 260);
  gradient.addColorStop(0, "rgba(214,232,255,0.98)");
  gradient.addColorStop(0.42, "rgba(238,246,255,0.86)");
  gradient.addColorStop(1, "rgba(255,255,255,0.98)");

  const kvRows = Array.from(kvPreview.querySelectorAll(".info-row")).map(row => ({
    key: row.querySelector("span")?.textContent || "",
    value: row.querySelector("b")?.textContent || "",
    highlight: row.querySelector("b")?.classList.contains("green"),
    full: row.classList.contains("honor-full-row")
  }));

  let measuredY = cardY + pad + 40 + 16;
  ctx.font = "15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  const kvLayouts = kvRows.map(row => {
    const maxW = row.full ? cardW - pad * 2 : cardW - pad * 2 - 112;
    const valueLines = getWrappedLines(ctx, row.value, maxW);
    const rowHeight = row.full ? Math.max(21, valueLines.length * 21) : Math.max(21, valueLines.length * 21);
    measuredY += (row.full ? 18 : 10) + rowHeight;
    return { ...row, valueLines, height: rowHeight };
  });

  const buttonY = measuredY + 10;
  const cardH = Math.max(300, buttonY + 40 + 18 - cardY);
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 18, gradient);
  ctx.strokeStyle = "#d8e2ef";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.stroke();

  let y = cardY + pad;
  ctx.fillStyle = "#111";
  ctx.font = "700 16px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillText(document.getElementById("smsCategory").textContent || "", cardX + pad, y);
  y += 40;




  kvLayouts.forEach(row => {
    if (row.full) {
      y += 8;
      ctx.fillStyle = "#62666d";
      ctx.font = "15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
      row.valueLines.forEach((line, index) => {
        ctx.fillText(line, cardX + pad, y + index * 21);
      });
      y += row.height + 10;
      return;
    }

    ctx.fillStyle = "#666a70";
    ctx.font = "15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    ctx.fillText(row.key, cardX + pad, y);

    const valueX = cardX + pad + 112;
    ctx.fillStyle = row.highlight ? "#2f76f6" : "#202328";
    ctx.font = "15px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    row.valueLines.forEach((line, index) => {
      ctx.fillText(line, valueX, y + index * 21);
    });
    if (row.highlight) {
      ctx.strokeStyle = "#2f76f6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(valueX, y + 19);
      ctx.lineTo(valueX + Math.min(getTextWidth(ctx, row.value), cardW - pad * 2 - 112), y + 19);
      ctx.stroke();
    }
    y += row.height + 10;
  });

  const buttonText = getDisplayText(document.querySelector('[data-preview="buttonText"]')?.value || document.getElementById("buttonText").textContent || "");
  fillRoundRect(ctx, cardX + pad, y + 10, cardW - pad * 2, 40, 20, "#2f76f6");
  ctx.fillStyle = "#fff";
  ctx.font = "700 17px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(buttonText, cardX + cardW / 2, y + 30);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.font = "14px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillStyle = "#666a70";
  ctx.fillText("3分钟前", 26, cardY + cardH + 12);
  ctx.fillStyle = "#2f76f6";
  ctx.fillText(document.getElementById("originText").textContent || "显示原文", 82, cardY + cardH + 12);

  const menuTexts = getMenuTexts();
  if (menuTexts.length > 0) {
    drawHonorMenuBar(ctx, width, height, menuTexts);
  } else {
    drawHonorComposeBar(ctx, width, height);
  }

  return canvas;
}

function fitVivoLine(ctx, text, maxWidth) {
  if (getTextWidth(ctx, text) > maxWidth) {
    const chars = Array.from(text);
    while (chars.length && getTextWidth(ctx, chars.join("") + "\u2026") > maxWidth) chars.pop();
    return chars.join("") + "\u2026";
  }
  return text;
}

function drawVivoTip(ctx, tip, x, y, maxWidth) {
  if (!tip) return;
  ctx.font = "13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillStyle = "#2f76f6";
  ctx.fillText(fitVivoLine(ctx, tip, maxWidth), x, y);
}

function drawVivoCardActions(ctx, x, y, width) {
  const actions = getVivoCardActions();
  const gap = 12;
  const buttonWidth = (width - gap * (actions.length - 1)) / actions.length;
  ctx.save();
  ctx.font = "600 14px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  actions.forEach((text, index) => {
    const buttonX = x + index * (buttonWidth + gap);
    fillRoundRect(ctx, buttonX, y, buttonWidth, 42, 18, "#edf5ff");
    ctx.fillStyle = "#2f76f6";
    ctx.fillText(fitVivoLine(ctx, text, buttonWidth - 12), buttonX + buttonWidth / 2, y + 21);
  });
  ctx.restore();
}

function renderVivoPreviewToCanvas() {
  const scale = EXPORT_SCALE;
  const width = 390;
  const height = 858;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(scale, scale);
  ctx.textBaseline = "top";
  ctx.fillStyle = "#f6f6f6";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#111";
  ctx.font = "600 14px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillText("14:19", 26, 10);
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("WiFi 100%", 290, 12);

  drawBackChevron(ctx, 24, 49, 18);
  ctx.font = "400 18px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillStyle = "#111";
  ctx.fillText(document.getElementById("merchantName").textContent || "", 76, 44);
  ctx.font = "13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillStyle = "#9b9b9b";
  ctx.fillText(document.getElementById("channelNo").textContent || "", 76, 70);

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.strokeRect(318, 48, 20, 20);
  ctx.beginPath();
  ctx.moveTo(323, 58);
  ctx.lineTo(327, 62);
  ctx.lineTo(335, 53);
  ctx.stroke();
  drawMoreDots(ctx, 356, 50);

  ctx.fillStyle = "#b3b3b3";
  ctx.font = "12px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("短信", width / 2, 122);
  ctx.fillText("14:13", width / 2, 143);
  ctx.textAlign = "left";

  const cardX = 18;
  const cardY = 194;
  const cardW = 354;
  const pad = 18;
  const rawMode = isVivoRawOriginalMode();
  const tip = getVivoTipText();
  const tipSpace = tip ? 30 : 0;
  if (!rawMode) {
    const originText = document.getElementById("originText").textContent || "显示原文";
    ctx.fillStyle = "#1f67e0";
    ctx.font = "400 11px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(originText, 362, 164);
    ctx.textAlign = "left";
  }
  if (rawMode) {
    const rawText = smsTemplateInput?.value.trim() || "";
    const rawFont = "16px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    const rawLineHeight = 25;
    ctx.font = rawFont;
    const rawLines = getRichWrappedLines(ctx, rawText, cardW - pad * 2);
    const contentStartY = cardY + pad;
    const actionY = contentStartY + rawLines.length * rawLineHeight + 12 + tipSpace;
    const cardH = Math.max(150, actionY + 42 + 16 - cardY);

    fillRoundRect(ctx, cardX, cardY, cardW, cardH, 18, "#fff");
    ctx.strokeStyle = "#ececec";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 18);
    ctx.stroke();

    drawRichWrappedText(ctx, rawText, cardX + pad, contentStartY, cardW - pad * 2, rawLineHeight, rawFont);
    drawVivoTip(ctx, tip, cardX + pad, actionY - tipSpace, cardW - pad * 2);

    drawVivoCardActions(ctx, cardX + pad, actionY, cardW - pad * 2);

    const menuTexts = getMenuTexts();
    if (menuTexts.length > 0) drawVivoMenuBar(ctx, width, height, menuTexts);
    else drawVivoComposeBar(ctx, width, height);
    return canvas;
  }
  const colGap = 10;
  const kvRows = Array.from(kvPreview.querySelectorAll(".info-row")).map(row => ({
    key: row.querySelector("span")?.textContent || "",
    value: row.querySelector("b")?.textContent || "",
    highlight: row.querySelector("b")?.classList.contains("green")
  }));
  const labelW = getVivoKvKeyWidth();
  const valueW = cardW - pad * 2 - labelW - colGap;
  const contentStartY = cardY + pad + 46;
  let measuredY = contentStartY;
  const kvLayouts = kvRows.map((row, rowIndex) => {
    const isPrimary = rowIndex === 0;
    const rowFont = isPrimary
      ? "600 17px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif"
      : "600 13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    ctx.font = "13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    const keyLines = getWrappedLinesByCount(row.key, 8);
    const keyLineHeight = 18;
    const keyHeight = Math.max(keyLineHeight, keyLines.length * keyLineHeight);
    ctx.font = rowFont;
    const wrapW = isPrimary ? Math.max(84, valueW - 8) : valueW;
    const valueLines = getWrappedLines(ctx, row.value, wrapW);
    const lineHeight = isPrimary ? 24 : 21;
    const valueHeight = Math.max(lineHeight, valueLines.length * lineHeight);
    const rowHeight = Math.max(keyHeight, valueHeight);
    measuredY += rowHeight + 8;
    return { ...row, keyLines, keyLineHeight, valueLines, height: rowHeight, lineHeight, isPrimary };
  });

  const buttonY = measuredY + 20 + tipSpace;
  const cardH = Math.max(218, buttonY + 42 + 18 - cardY);
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 18, "#fff");
  ctx.strokeStyle = "#ececec";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.stroke();

  let y = cardY + pad;
  ctx.fillStyle = "#111";
  ctx.font = "400 13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
  ctx.fillText(document.getElementById("smsCategory").textContent || "", cardX + pad, y);
  y = contentStartY;

  kvLayouts.forEach((row, rowIndex) => {
    ctx.fillStyle = "#8d8d8d";
    ctx.font = "13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    row.keyLines.forEach((line, lineIndex) => {
      ctx.fillText(line, cardX + pad, y + lineIndex * row.keyLineHeight);
    });

    const valueX = cardX + pad + labelW + colGap;
    ctx.fillStyle = row.highlight ? "#2f76f6" : "#1b1f25";
    ctx.font = rowIndex === 0
      ? "600 17px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif"
      : "600 13px 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif";
    row.valueLines.forEach((line, lineIndex) => {
      ctx.fillText(line, valueX, y + lineIndex * row.lineHeight);
    });
    y += row.height + 8;
  });

  const actionY = y + 8 + tipSpace;
  drawVivoTip(ctx, tip, cardX + pad, actionY - tipSpace, cardW - pad * 2);
  drawVivoCardActions(ctx, cardX + pad, actionY, cardW - pad * 2);

  const menuTexts = getMenuTexts();
  if (menuTexts.length > 0) {
    drawVivoMenuBar(ctx, width, height, menuTexts);
  } else {
    drawVivoComposeBar(ctx, width, height);
  }

  return canvas;
}

async function savePreviewAsPng() {
  saveImageBtn.disabled = true;
  saveImageBtn.textContent = "保存中...";

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const templateKey = getCurrentTemplateKey();
    const canvas = templateKey === "honor" ? renderHonorPreviewToCanvas() : templateKey === "vivo" ? renderVivoPreviewToCanvas() : renderOppoPreviewToCanvas();
    canvas.toBlob(blob => {
      if (!blob) {
        alert("保存图片失败，请稍后重试。");
        return;
      }
      downloadBlob(blob, `sms-card-preview-sharp-${Date.now()}.png`);
    }, "image/png");
  } catch (error) {
    console.error(error);
    alert("保存图片失败，请稍后重试。");
  } finally {
    saveImageBtn.disabled = false;
    saveImageBtn.textContent = "保存图片";
  }
}

document.getElementById("createBtn").addEventListener("click", () => {
  if (!resolveUnsavedEditorChanges()) return;
  loadConfig("oppo");
  showPage("editor");
});

configTableBody.addEventListener("click", event => {
  const deleteButton = event.target.closest(".deleteBtn");
  if (deleteButton) {
    const configKey = deleteButton.dataset.config;
    if (!confirm("确认删除这个草稿？删除后不可恢复。")) return;
    setStoredDrafts(getStoredDrafts().filter(item => item.id !== configKey));
    delete configs[configKey];
    if (currentConfigKey === configKey) currentConfigKey = "oppo";
    renderConfigList();
    return;
  }

  const button = event.target.closest(".editBtn");
  if (!button) return;
  if (!resolveUnsavedEditorChanges()) return;
  loadConfig(button.dataset.config);
  showPage("editor");
});

document.getElementById("checkBtn").addEventListener("click", () => showPage("check"));
document.getElementById("backEdit").addEventListener("click", () => showPage("editor"));
document.getElementById("backListBtn").addEventListener("click", () => {
  if (!resolveUnsavedEditorChanges()) return;
  showPage("list");
});
prevConfigBtn?.addEventListener("click", () => navigateConfig(-1));
nextConfigBtn?.addEventListener("click", () => navigateConfig(1));
configSearchInput?.addEventListener("input", renderConfigList);
clearSearchBtn?.addEventListener("click", () => {
  if (configSearchInput) configSearchInput.value = "";
  if (templateFilter) templateFilter.value = "all";
  if (statusFilter) statusFilter.value = "all";
  renderConfigList();
  configSearchInput?.focus();
});
templateFilter?.addEventListener("change", renderConfigList);
statusFilter?.addEventListener("change", renderConfigList);
document.getElementById("saveBtn").addEventListener("click", () => {
  const draft = saveCurrentDraft();
  loadConfig(draft.id);
  alert("草稿已保存。");
  showPage("editor");
});
document.getElementById("saveAsBtn").addEventListener("click", () => {
  const draft = saveCurrentDraft({ asNew: true });
  loadConfig(draft.id);
  alert("已另存为新草稿，原草稿保持不变。");
  showPage("editor");
});
saveImageBtn.addEventListener("click", savePreviewAsPng);
window.addEventListener("beforeunload", event => {
  if (!isEditorDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

hydrateBatchConfigs();
migrateZhaoshangVivoButtonsOnce();
migrateZhaoshangOppoIntentTitlesOnce();
migrateZhaoshangOppoMenusEmptyOnce();
migrateZhaoshangOppoCompactIntentUpdatesOnce();
migrateZhaoshangOppoButtonTextsOnce();
renderConfigList();
bindLivePreview();
bindDraftDirtyTracking();
bindKvEditor();
bindMenuEditor();
bindSourceIconColor();
bindEmojiPicker();
bindSmsParser();
loadConfig(currentConfigKey);












