if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

const STORAGE_KEY = "calendarAppData";
const ARCHIVE_KEY = "completedTasksData";
const THEME_KEY = "themePreference";

const themeToggleBtn = document.getElementById("themeToggle");

function effectiveTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateThemeToggleLabel() {
  const isDark = effectiveTheme() === "dark";
  themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
  themeToggleBtn.title = isDark ? "ライトモードに切り替え" : "ダークモードに切り替え";
}

function applyStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") {
    document.documentElement.setAttribute("data-theme", stored);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  updateThemeToggleLabel();
}

themeToggleBtn.addEventListener("click", () => {
  const next = effectiveTheme() === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyStoredTheme();
});

applyStoredTheme();

let openPanelCount = 0;
function lockBackgroundScroll() {
  openPanelCount++;
  document.body.classList.add("panel-open");
}
function unlockBackgroundScroll() {
  openPanelCount = Math.max(0, openPanelCount - 1);
  if (openPanelCount === 0) {
    document.body.classList.remove("panel-open");
  }
}

let currentYear;
let currentMonth; // 0-11
let selectedDateKey = null;

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const overlay = document.getElementById("overlay");
const panel = document.getElementById("panel");
const panelDate = document.getElementById("panelDate");
const closePanelBtn = document.getElementById("closePanel");
const holidayCheck = document.getElementById("holidayCheck");
const nationalCheck = document.getElementById("nationalCheck");
const markChecks = document.getElementById("markChecks");
const scheduleInput = document.getElementById("scheduleInput");
const addScheduleBtn = document.getElementById("addSchedule");
const scheduleList = document.getElementById("scheduleList");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const diaryText = document.getElementById("diaryText");
const saveDiaryBtn = document.getElementById("saveDiary");

const openTaskArchiveBtn = document.getElementById("openTaskArchive");
const archiveOverlay = document.getElementById("archiveOverlay");
const archivePanel = document.getElementById("archivePanel");
const closeArchivePanelBtn = document.getElementById("closeArchivePanel");
const archiveList = document.getElementById("archiveList");

const openScheduleListBtn = document.getElementById("openScheduleList");
const scheduleListOverlay = document.getElementById("scheduleListOverlay");
const scheduleListPanel = document.getElementById("scheduleListPanel");
const closeScheduleListPanelBtn = document.getElementById("closeScheduleListPanel");
const scheduleListAll = document.getElementById("scheduleListAll");
const scheduleSearchInput = document.getElementById("scheduleSearchInput");

const openMarkListBtn = document.getElementById("openMarkList");
const markListOverlay = document.getElementById("markListOverlay");
const markListPanel = document.getElementById("markListPanel");
const closeMarkListPanelBtn = document.getElementById("closeMarkListPanel");
const markListSelect = document.getElementById("markListSelect");
const markListAll = document.getElementById("markListAll");

const openDiaryListBtn = document.getElementById("openDiaryList");
const diaryOverlay = document.getElementById("diaryOverlay");
const diaryPanel = document.getElementById("diaryPanel");
const closeDiaryPanelBtn = document.getElementById("closeDiaryPanel");
const diaryListEl = document.getElementById("diaryListEl");

const openExportBtn = document.getElementById("openExport");
const exportOverlay = document.getElementById("exportOverlay");
const exportPanel = document.getElementById("exportPanel");
const closeExportPanelBtn = document.getElementById("closeExportPanel");
const exportText = document.getElementById("exportText");
const copyExportBtn = document.getElementById("copyExportBtn");
const downloadExportBtn = document.getElementById("downloadExportBtn");
const bulkDeleteFrom = document.getElementById("bulkDeleteFrom");
const bulkDeleteTo = document.getElementById("bulkDeleteTo");
const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
const exportCheckSchedule = document.getElementById("exportCheckSchedule");
const exportCheckMemo = document.getElementById("exportCheckMemo");
const exportCheckTask = document.getElementById("exportCheckTask");

const openMoneyBtn = document.getElementById("openMoney");
const moneyOverlay = document.getElementById("moneyOverlay");
const moneyPanel = document.getElementById("moneyPanel");
const closeMoneyPanelBtn = document.getElementById("closeMoneyPanel");
const prevMoneyMonthBtn = document.getElementById("prevMoneyMonth");
const nextMoneyMonthBtn = document.getElementById("nextMoneyMonth");
const moneyMonthLabel = document.getElementById("moneyMonthLabel");
const moneySummary = document.getElementById("moneySummary");
const moneyCategoryEditor = document.getElementById("moneyCategoryEditor");
const moneyDateInput = document.getElementById("moneyDateInput");
const moneyAddEntryBtn = document.getElementById("moneyAddEntryBtn");
const moneyList = document.getElementById("moneyList");
const moneyBulkFrom = document.getElementById("moneyBulkFrom");
const moneyBulkTo = document.getElementById("moneyBulkTo");
const moneyBulkDeleteBtn = document.getElementById("moneyBulkDeleteBtn");

const moneyDayOverlay = document.getElementById("moneyDayOverlay");
const moneyDayPanel = document.getElementById("moneyDayPanel");
const closeMoneyDayPanelBtn = document.getElementById("closeMoneyDayPanel");
const moneyDayDate = document.getElementById("moneyDayDate");
const moneyDayFields = document.getElementById("moneyDayFields");
const saveMoneyDayBtn = document.getElementById("saveMoneyDayBtn");

const MONEY_KEY = "moneyEntriesData";
const MONEY_CATEGORIES_KEY = "moneyCategoriesData";
const DEFAULT_CATEGORIES = ["食費", "日用品", "交通費", "娯楽", "その他"];
let moneyYear;
let moneyMonth; // 0-11
let moneyEditingDateKey = null;

const openHabitBtn = document.getElementById("openHabit");
const habitOverlay = document.getElementById("habitOverlay");
const habitPanel = document.getElementById("habitPanel");
const closeHabitPanelBtn = document.getElementById("closeHabitPanel");
const prevHabitMonthBtn = document.getElementById("prevHabitMonth");
const nextHabitMonthBtn = document.getElementById("nextHabitMonth");
const habitMonthLabel = document.getElementById("habitMonthLabel");
const habitSummary = document.getElementById("habitSummary");
const habitCategoryEditor = document.getElementById("habitCategoryEditor");
const habitDateInput = document.getElementById("habitDateInput");
const habitAddEntryBtn = document.getElementById("habitAddEntryBtn");
const habitList = document.getElementById("habitList");
const habitBulkFrom = document.getElementById("habitBulkFrom");
const habitBulkTo = document.getElementById("habitBulkTo");
const habitBulkDeleteBtn = document.getElementById("habitBulkDeleteBtn");

const habitDayOverlay = document.getElementById("habitDayOverlay");
const habitDayPanel = document.getElementById("habitDayPanel");
const closeHabitDayPanelBtn = document.getElementById("closeHabitDayPanel");
const habitDayDate = document.getElementById("habitDayDate");
const habitDayFields = document.getElementById("habitDayFields");
const saveHabitDayBtn = document.getElementById("saveHabitDayBtn");

const HABIT_KEY = "habitEntriesData";
const HABIT_NAMES_KEY = "habitNamesData";
const DEFAULT_HABITS = ["運動", "読書", "早起き", "ストレッチ", "勉強"];
let habitYear;
let habitMonth; // 0-11
let habitEditingDateKey = null;

function closeMenuPanel() {
  // ハンバーガーメニューは廃止済み。各パネルを開く前の後始末として呼ばれるため関数だけ残している。
}

const openHelpBtn = document.getElementById("openHelp");
const helpOverlay = document.getElementById("helpOverlay");
const helpPanel = document.getElementById("helpPanel");
const closeHelpPanelBtn = document.getElementById("closeHelpPanel");

const modeButtons = document.querySelectorAll(".mode-btn");
const modeHintLabel = document.getElementById("modeHintLabel");
const modeHint = document.getElementById("modeHint");
let activeMode = null; // "holiday" | "star" | "heart" | "smile" | null (null = オフ)

const MARK_DEFS = [
  { key: "star", emoji: "⭐", label: "⭐" },
  { key: "heart", emoji: "💗", label: "💗" },
  { key: "smile", emoji: "😊", label: "😊" },
  { key: "beer", emoji: "🍺", label: "🍺 お酒" },
  { key: "coffee", emoji: "☕", label: "☕ カフェ" },
  { key: "lunch", emoji: "🍱", label: "🍱 ランチ" },
  { key: "work", emoji: "💼", label: "💼 仕事" },
  { key: "trip", emoji: "🚗", label: "🚗 おでかけ" },
  { key: "movie", emoji: "🎬", label: "🎬 映画" },
  { key: "shopping", emoji: "🛍️", label: "🛍️ 買い物" },
  { key: "sleep", emoji: "😴", label: "😴 早寝" },
  { key: "party", emoji: "🎉", label: "🎉 イベント" },
];

const MODE_LABELS = { holiday: "休み", national: "祝日" };
MARK_DEFS.forEach(def => { MODE_LABELS[def.key] = def.label; });

markChecks.innerHTML = MARK_DEFS.map(def =>
  `<label><input type="checkbox" data-mark="${def.key}"> ${def.emoji}</label>`
).join("");

const MARK_LIST_DEFS = [
  { key: "holiday", emoji: "休", label: "休み", field: "holiday" },
  { key: "national", emoji: "祝", label: "祝日", field: "national" },
  ...MARK_DEFS.map(def => ({ ...def, field: null })),
];

markListSelect.innerHTML = MARK_LIST_DEFS.map(def =>
  `<option value="${def.key}">${def.label}</option>`
).join("");

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function dateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function getDayData(data, key) {
  const raw = data[key] || {};
  const marks = {};
  MARK_DEFS.forEach(def => { marks[def.key] = !!(raw.marks && raw.marks[def.key]); });
  return {
    holiday: !!raw.holiday,
    national: !!raw.national,
    marks,
    schedule: raw.schedule || [],
    tasks: raw.tasks || [],
    memo: raw.memo !== undefined ? raw.memo : (raw.diary || ""),
  };
}

function loadArchive() {
  const raw = localStorage.getItem(ARCHIVE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveArchive(list) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
}

function renderCalendar() {
  monthLabel.textContent = `${currentYear}年 ${currentMonth + 1}月`;
  calendarGrid.innerHTML = "";

  const data = loadData();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayKey = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(currentYear, currentMonth, day);
    const dayData = getDayData(data, key);

    const cell = document.createElement("div");
    cell.className = "day-cell"
      + (dayData.holiday ? " holiday" : "")
      + (dayData.national ? " national" : "")
      + (key === todayKey ? " today" : "");

    const numberEl = document.createElement("div");
    numberEl.className = "day-number";
    numberEl.textContent = day;
    cell.appendChild(numberEl);

    if (dayData.holiday) {
      const holidayLabel = document.createElement("div");
      holidayLabel.className = "holiday-label";
      holidayLabel.textContent = "休み";
      cell.appendChild(holidayLabel);
    }

    if (dayData.national) {
      const nationalLabel = document.createElement("div");
      nationalLabel.className = "national-label";
      nationalLabel.textContent = "祝日";
      cell.appendChild(nationalLabel);
    }

    const markEmojis = MARK_DEFS.filter(def => dayData.marks[def.key]).map(def => def.emoji);
    if (markEmojis.length > 0) {
      const markRow = document.createElement("div");
      markRow.className = "mark-row";
      markRow.textContent = markEmojis.join(" ");
      cell.appendChild(markRow);
    }

    cell.addEventListener("click", () => {
      if (activeMode) {
        applyModeToDay(key, activeMode);
      } else {
        openPanel(key);
      }
    });

    if (dayData.schedule && dayData.schedule.length > 0) {
      const scheduleEl = document.createElement("div");
      scheduleEl.className = "day-schedule";
      const first = dayData.schedule[0];
      const truncated = first.length > 8 ? first.slice(0, 8) + "…" : first;
      const extra = dayData.schedule.length > 1 ? ` 他${dayData.schedule.length - 1}件` : "";
      scheduleEl.textContent = truncated + extra;
      cell.appendChild(scheduleEl);
    }

    const infoParts = [];
    if (dayData.tasks && dayData.tasks.length > 0) {
      infoParts.push(`タスク ${dayData.tasks.length}`);
    }
    if (dayData.memo && dayData.memo.trim() !== "") {
      infoParts.push("メモあり");
    }
    if (infoParts.length > 0) {
      const infoEl = document.createElement("div");
      infoEl.className = "day-info";
      infoEl.textContent = infoParts.join(" / ");
      cell.appendChild(infoEl);
    }

    calendarGrid.appendChild(cell);
  }
}

function applyModeToDay(key, mode) {
  const data = loadData();
  const dayData = getDayData(data, key);
  if (mode === "holiday") {
    dayData.holiday = !dayData.holiday;
  } else if (mode === "national") {
    dayData.national = !dayData.national;
  } else {
    dayData.marks[mode] = !dayData.marks[mode];
  }
  data[key] = dayData;
  saveData(data);
  renderCalendar();
}

function setActiveMode(mode) {
  activeMode = (mode === "off") ? null : mode;
  modeButtons.forEach(btn => {
    const btnIsActive = activeMode === null ? btn.dataset.mode === "off" : btn.dataset.mode === activeMode;
    btn.classList.toggle("active", btnIsActive);
  });
  if (activeMode === "national") {
    modeHintLabel.textContent = "選択中: 祝日 ／ このアプリは祝日を自動判定しません。日本の暦を見ながら、祝日の日付を自分でタップして赤字にしてください";
    modeHint.classList.remove("hidden");
  } else if (activeMode) {
    modeHintLabel.textContent = `選択中: ${MODE_LABELS[activeMode]} ／ 日付をタップするとON/OFFが切り替わります`;
    modeHint.classList.remove("hidden");
  } else {
    modeHintLabel.textContent = "";
    modeHint.classList.add("hidden");
  }
}

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setActiveMode(btn.dataset.mode);
    closeMenuPanel();
  });
});

setActiveMode("off");

function openPanel(key) {
  selectedDateKey = key;
  const data = loadData();
  const dayData = getDayData(data, key);

  panelDate.textContent = key;
  holidayCheck.checked = dayData.holiday;
  nationalCheck.checked = dayData.national;
  markChecks.querySelectorAll("input[data-mark]").forEach(input => {
    input.checked = dayData.marks[input.dataset.mark];
  });
  diaryText.value = dayData.memo || "";
  renderScheduleList(dayData.schedule);
  renderTaskList(dayData.tasks);

  overlay.classList.remove("hidden");
  panel.classList.remove("hidden");
  lockBackgroundScroll();
}

function closePanel() {
  overlay.classList.add("hidden");
  panel.classList.add("hidden");
  unlockBackgroundScroll();
  selectedDateKey = null;
  renderCalendar();
}

function renderScheduleList(schedule) {
  scheduleList.innerHTML = "";
  schedule.forEach((text, index) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-task";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => deleteSchedule(index));

    li.appendChild(span);
    li.appendChild(deleteBtn);
    scheduleList.appendChild(li);
  });
}

function deleteSchedule(index) {
  const dayData = updateSelectedDay(d => {
    d.schedule.splice(index, 1);
  });
  renderScheduleList(dayData.schedule);
}

function renderTaskList(tasks) {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    if (task.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(index));

    const span = document.createElement("span");
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-task";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => deleteTask(index));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function updateSelectedDay(mutator) {
  const data = loadData();
  const dayData = getDayData(data, selectedDateKey);
  mutator(dayData);
  data[selectedDateKey] = dayData;
  saveData(data);
  return dayData;
}

function toggleTask(index) {
  let completedText = null;
  const dayData = updateSelectedDay(d => {
    const task = d.tasks[index];
    if (!task.done) {
      completedText = task.text;
      d.tasks.splice(index, 1);
    } else {
      task.done = false;
    }
  });
  if (completedText !== null) {
    const archive = loadArchive();
    archive.push({ text: completedText, date: selectedDateKey });
    saveArchive(archive);
  }
  renderTaskList(dayData.tasks);
}

function deleteTask(index) {
  const dayData = updateSelectedDay(d => {
    d.tasks.splice(index, 1);
  });
  renderTaskList(dayData.tasks);
}

addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (text === "") return;
  const dayData = updateSelectedDay(d => {
    d.tasks.push({ text, done: false });
  });
  renderTaskList(dayData.tasks);
  taskInput.value = "";
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTaskBtn.click();
});

addScheduleBtn.addEventListener("click", () => {
  const text = scheduleInput.value.trim();
  if (text === "") return;
  const dayData = updateSelectedDay(d => {
    d.schedule.push(text);
  });
  renderScheduleList(dayData.schedule);
  scheduleInput.value = "";
});

scheduleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addScheduleBtn.click();
});

holidayCheck.addEventListener("change", () => {
  updateSelectedDay(d => {
    d.holiday = holidayCheck.checked;
  });
});

nationalCheck.addEventListener("change", () => {
  updateSelectedDay(d => {
    d.national = nationalCheck.checked;
  });
});

markChecks.addEventListener("change", (e) => {
  const input = e.target;
  if (!input.dataset.mark) return;
  updateSelectedDay(d => { d.marks[input.dataset.mark] = input.checked; });
});

saveDiaryBtn.addEventListener("click", () => {
  updateSelectedDay(d => {
    d.memo = diaryText.value;
  });
  saveDiaryBtn.textContent = "保存しました";
  setTimeout(() => { saveDiaryBtn.textContent = "メモを保存"; }, 1200);
});

closePanelBtn.addEventListener("click", closePanel);
overlay.addEventListener("click", closePanel);

function completeTaskFromList(dayKey, index) {
  const data = loadData();
  const dayData = getDayData(data, dayKey);
  const task = dayData.tasks[index];
  if (!task) return;
  dayData.tasks.splice(index, 1);
  data[dayKey] = dayData;
  saveData(data);

  const archive = loadArchive();
  archive.push({ text: task.text, date: dayKey });
  saveArchive(archive);

  renderArchiveList();
}

function deleteTaskFromList(dayKey, index) {
  const data = loadData();
  const dayData = getDayData(data, dayKey);
  dayData.tasks.splice(index, 1);
  data[dayKey] = dayData;
  saveData(data);
  renderArchiveList();
}

function renderArchiveList() {
  const data = loadData();
  const archive = loadArchive();
  archiveList.innerHTML = "";

  const pendingEntries = Object.keys(data)
    .filter(key => data[key].tasks && data[key].tasks.length > 0)
    .sort((a, b) => a.localeCompare(b));

  const pendingHeading = document.createElement("li");
  pendingHeading.className = "task-list-heading";
  pendingHeading.textContent = "未完了のタスク";
  archiveList.appendChild(pendingHeading);

  let hasPending = false;
  pendingEntries.forEach(dayKey => {
    data[dayKey].tasks.forEach((task, index) => {
      hasPending = true;
      const li = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = false;
      checkbox.addEventListener("change", () => completeTaskFromList(dayKey, index));

      const dateSpan = document.createElement("span");
      dateSpan.className = "archive-item-date";
      dateSpan.textContent = dayKey;

      const textSpan = document.createElement("span");
      textSpan.textContent = task.text;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-task";
      deleteBtn.textContent = "削除";
      deleteBtn.addEventListener("click", () => deleteTaskFromList(dayKey, index));

      li.appendChild(checkbox);
      li.appendChild(dateSpan);
      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      archiveList.appendChild(li);
    });
  });
  if (!hasPending) {
    const li = document.createElement("li");
    li.textContent = "未完了のタスクはありません";
    archiveList.appendChild(li);
  }

  const doneHeading = document.createElement("li");
  doneHeading.className = "task-list-heading";
  doneHeading.textContent = "完了済みのタスク";
  archiveList.appendChild(doneHeading);

  if (archive.length === 0) {
    const li = document.createElement("li");
    li.textContent = "完了したタスクはまだありません";
    archiveList.appendChild(li);
    return;
  }
  archive.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("done");

    const dateSpan = document.createElement("span");
    dateSpan.className = "archive-item-date";
    dateSpan.textContent = item.date;

    const textSpan = document.createElement("span");
    textSpan.textContent = item.text;

    const restoreBtn = document.createElement("button");
    restoreBtn.className = "delete-task";
    restoreBtn.textContent = "未完了に戻す";
    restoreBtn.addEventListener("click", () => {
      const current = loadArchive();
      current.splice(index, 1);
      saveArchive(current);

      const data = loadData();
      const dayData = getDayData(data, item.date);
      dayData.tasks.push({ text: item.text, done: false });
      data[item.date] = dayData;
      saveData(data);

      renderArchiveList();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-task";
    deleteBtn.textContent = "完全に削除";
    deleteBtn.addEventListener("click", () => {
      const current = loadArchive();
      current.splice(index, 1);
      saveArchive(current);
      renderArchiveList();
    });

    li.appendChild(dateSpan);
    li.appendChild(textSpan);
    li.appendChild(restoreBtn);
    li.appendChild(deleteBtn);
    archiveList.appendChild(li);
  });
}

openTaskArchiveBtn.addEventListener("click", () => {
  closeMenuPanel();
  renderArchiveList();
  archiveOverlay.classList.remove("hidden");
  archivePanel.classList.remove("hidden");
  lockBackgroundScroll();
});

function closeArchivePanel() {
  archiveOverlay.classList.add("hidden");
  archivePanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeArchivePanelBtn.addEventListener("click", closeArchivePanel);
archiveOverlay.addEventListener("click", closeArchivePanel);

function deleteScheduleFromList(dayKey, index) {
  const data = loadData();
  const dayData = getDayData(data, dayKey);
  dayData.schedule.splice(index, 1);
  data[dayKey] = dayData;
  saveData(data);
  renderScheduleListAll();
}

function appendScheduleItem(dayKey, text, index, todayKey) {
  const li = document.createElement("li");
  if (dayKey === todayKey) li.classList.add("today-item");

  const dateSpan = document.createElement("span");
  dateSpan.className = "archive-item-date";
  dateSpan.textContent = dayKey;

  const textSpan = document.createElement("span");
  textSpan.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-task";
  deleteBtn.textContent = "削除";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteScheduleFromList(dayKey, index);
  });

  li.appendChild(dateSpan);
  li.appendChild(textSpan);
  li.appendChild(deleteBtn);
  li.addEventListener("click", () => {
    closeScheduleListPanel();
    openPanel(dayKey);
  });
  scheduleListAll.appendChild(li);
}

function renderScheduleListAll() {
  const data = loadData();
  const todayKey = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const keyword = scheduleSearchInput.value.trim();

  const entries = Object.keys(data)
    .filter(key => {
      const schedule = data[key].schedule;
      if (!schedule || schedule.length === 0) return false;
      if (!keyword) return true;
      return schedule.some(text => text.includes(keyword));
    })
    .sort((a, b) => a.localeCompare(b));

  scheduleListAll.innerHTML = "";

  const upcomingHeading = document.createElement("li");
  upcomingHeading.className = "task-list-heading";
  upcomingHeading.textContent = "これからの予定";
  scheduleListAll.appendChild(upcomingHeading);

  let hasUpcoming = false;
  entries.forEach(dayKey => {
    if (dayKey < todayKey) return;
    data[dayKey].schedule.forEach((text, index) => {
      if (keyword && !text.includes(keyword)) return;
      hasUpcoming = true;
      appendScheduleItem(dayKey, text, index, todayKey);
    });
  });
  if (!hasUpcoming) {
    const li = document.createElement("li");
    li.textContent = "これからの予定はありません";
    scheduleListAll.appendChild(li);
  }

  const pastHeading = document.createElement("li");
  pastHeading.className = "task-list-heading";
  pastHeading.textContent = "過去の予定";
  scheduleListAll.appendChild(pastHeading);

  let hasPast = false;
  entries
    .filter(dayKey => dayKey < todayKey)
    .sort((a, b) => b.localeCompare(a))
    .forEach(dayKey => {
      data[dayKey].schedule.forEach((text, index) => {
        if (keyword && !text.includes(keyword)) return;
        hasPast = true;
        appendScheduleItem(dayKey, text, index, todayKey);
      });
    });
  if (!hasPast) {
    const li = document.createElement("li");
    li.textContent = "過去の予定はありません";
    scheduleListAll.appendChild(li);
  }
}

openScheduleListBtn.addEventListener("click", () => {
  closeMenuPanel();
  scheduleSearchInput.value = "";
  renderScheduleListAll();
  scheduleListOverlay.classList.remove("hidden");
  scheduleListPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

scheduleSearchInput.addEventListener("input", () => {
  renderScheduleListAll();
});

function closeScheduleListPanel() {
  scheduleListOverlay.classList.add("hidden");
  scheduleListPanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeScheduleListPanelBtn.addEventListener("click", closeScheduleListPanel);
scheduleListOverlay.addEventListener("click", closeScheduleListPanel);

function renderMarkList() {
  const markKey = markListSelect.value;
  const markDef = MARK_LIST_DEFS.find(d => d.key === markKey);
  const data = loadData();
  const todayKey = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const isOn = key => {
    const dayData = getDayData(data, key);
    return markDef.field ? dayData[markDef.field] : dayData.marks[markKey];
  };

  const entries = Object.keys(data)
    .filter(isOn)
    .sort((a, b) => a.localeCompare(b));

  markListAll.innerHTML = "";

  if (entries.length === 0) {
    const li = document.createElement("li");
    li.textContent = `${markDef.label} が付いている日はまだありません`;
    markListAll.appendChild(li);
    return;
  }

  entries.forEach(key => {
    const li = document.createElement("li");
    if (key === todayKey) li.classList.add("today-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.addEventListener("click", (e) => e.stopPropagation());
    checkbox.addEventListener("change", (e) => {
      const current = loadData();
      const dayData = getDayData(current, key);
      if (markDef.field) {
        dayData[markDef.field] = false;
      } else {
        dayData.marks[markKey] = false;
      }
      current[key] = dayData;
      saveData(current);
      renderMarkList();
      renderCalendar();
    });

    const dateSpan = document.createElement("span");
    dateSpan.className = "archive-item-date";
    dateSpan.textContent = key;

    const emojiSpan = document.createElement("span");
    emojiSpan.textContent = markDef.emoji;

    li.appendChild(checkbox);
    li.appendChild(dateSpan);
    li.appendChild(emojiSpan);
    li.addEventListener("click", () => {
      closeMarkListPanel();
      openPanel(key);
    });
    markListAll.appendChild(li);
  });
}

openMarkListBtn.addEventListener("click", () => {
  closeMenuPanel();
  renderMarkList();
  markListOverlay.classList.remove("hidden");
  markListPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

markListSelect.addEventListener("change", renderMarkList);

function closeMarkListPanel() {
  markListOverlay.classList.add("hidden");
  markListPanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeMarkListPanelBtn.addEventListener("click", closeMarkListPanel);
markListOverlay.addEventListener("click", closeMarkListPanel);

function renderDiaryList() {
  const data = loadData();
  const entries = Object.keys(data)
    .filter(key => data[key].memo && data[key].memo.trim() !== "")
    .sort((a, b) => b.localeCompare(a));

  diaryListEl.innerHTML = "";
  if (entries.length === 0) {
    const li = document.createElement("li");
    li.textContent = "メモはまだありません";
    diaryListEl.appendChild(li);
    return;
  }

  entries.forEach(key => {
    const li = document.createElement("li");
    li.className = "diary-item";

    const dateEl = document.createElement("div");
    dateEl.className = "archive-item-date";
    dateEl.textContent = key;

    const textEl = document.createElement("div");
    textEl.className = "diary-item-text";
    textEl.textContent = data[key].memo;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-task";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const current = loadData();
      if (current[key]) {
        current[key].memo = "";
        saveData(current);
      }
      renderDiaryList();
    });

    li.appendChild(dateEl);
    li.appendChild(textEl);
    li.appendChild(deleteBtn);
    li.addEventListener("click", () => {
      closeDiaryPanel();
      openPanel(key);
    });
    diaryListEl.appendChild(li);
  });
}

openDiaryListBtn.addEventListener("click", () => {
  closeMenuPanel();
  renderDiaryList();
  diaryOverlay.classList.remove("hidden");
  diaryPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

function closeDiaryPanel() {
  diaryOverlay.classList.add("hidden");
  diaryPanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeDiaryPanelBtn.addEventListener("click", closeDiaryPanel);
diaryOverlay.addEventListener("click", closeDiaryPanel);

prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function generateCsv(options) {
  const opts = options || {};
  const includeSchedule = opts.schedule !== false;
  const includeMemo = opts.memo !== false;
  const includeTask = opts.task !== false;

  const data = loadData();
  const archive = includeTask ? loadArchive() : [];

  const archiveByDate = {};
  archive.forEach(item => {
    if (!archiveByDate[item.date]) archiveByDate[item.date] = [];
    archiveByDate[item.date].push(item.text);
  });

  const allKeys = new Set([
    ...Object.keys(data),
    ...Object.keys(archiveByDate),
  ]);

  const header = ["日付"];
  if (includeSchedule) header.push("予定");
  if (includeMemo) header.push("メモ");
  if (includeTask) header.push("タスク(未完了)");
  if (includeTask) header.push("タスク(完了済み)");
  const rows = [header.join(",")];

  Array.from(allKeys).sort().forEach(key => {
    const dayData = getDayData(data, key);
    const schedule = includeSchedule ? (dayData.schedule || []).join(" / ") : "";
    const memo = includeMemo ? (dayData.memo || "") : "";

    const pendingTasks = includeTask ? (dayData.tasks || []).map(t => t.text).join(" / ") : "";
    const doneTasks = includeTask ? (archiveByDate[key] || []).join(" / ") : "";

    if (!schedule && !memo.trim() && !pendingTasks && !doneTasks) return;

    const row = [csvEscape(key)];
    if (includeSchedule) row.push(csvEscape(schedule));
    if (includeMemo) row.push(csvEscape(memo));
    if (includeTask) row.push(csvEscape(pendingTasks));
    if (includeTask) row.push(csvEscape(doneTasks));
    rows.push(row.join(","));
  });
  return rows.join("\n");
}

function currentExportOptions() {
  return {
    schedule: exportCheckSchedule.checked,
    memo: exportCheckMemo.checked,
    task: exportCheckTask.checked,
  };
}

function refreshExportText() {
  exportText.value = generateCsv(currentExportOptions());
}

[exportCheckSchedule, exportCheckMemo, exportCheckTask].forEach(cb => {
  cb.addEventListener("change", refreshExportText);
});

openExportBtn.addEventListener("click", () => {
  closeMenuPanel();
  refreshExportText();
  exportOverlay.classList.remove("hidden");
  exportPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

function closeExportPanel() {
  exportOverlay.classList.add("hidden");
  exportPanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeExportPanelBtn.addEventListener("click", closeExportPanel);
exportOverlay.addEventListener("click", closeExportPanel);

copyExportBtn.addEventListener("click", async () => {
  exportText.select();
  try {
    await navigator.clipboard.writeText(exportText.value);
  } catch (e) {
    document.execCommand("copy");
  }
  copyExportBtn.textContent = "コピーしました";
  setTimeout(() => { copyExportBtn.textContent = "コピーする"; }, 1200);
});

downloadExportBtn.addEventListener("click", () => {
  const bom = "﻿";
  const blob = new Blob([bom + exportText.value], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "calendar-data.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

bulkDeleteBtn.addEventListener("click", () => {
  const from = bulkDeleteFrom.value;
  const to = bulkDeleteTo.value;
  if (!from || !to) {
    alert("削除する期間の開始日と終了日を両方入力してください");
    return;
  }
  if (from > to) {
    alert("開始日は終了日より前の日付にしてください");
    return;
  }

  const data = loadData();
  const archive = loadArchive();

  const inRange = key => key >= from && key <= to;

  const scheduleMemoKeys = Object.keys(data).filter(key => {
    if (!inRange(key)) return false;
    const d = data[key];
    return (d.schedule && d.schedule.length > 0) || (d.memo && d.memo.trim() !== "");
  });
  const archiveEntries = archive.filter(item => inRange(item.date));

  const totalCount = scheduleMemoKeys.length + archiveEntries.length;

  if (totalCount === 0) {
    alert("指定した期間には削除できる記録がありませんでした");
    return;
  }

  const ok = confirm(`${from}〜${to}の予定・メモ・完了済みタスクの記録をまとめて削除します。元に戻せませんが、よろしいですか?`);
  if (!ok) return;

  scheduleMemoKeys.forEach(key => {
    data[key].schedule = [];
    data[key].memo = "";
  });
  saveData(data);

  saveArchive(archive.filter(item => !inRange(item.date)));

  bulkDeleteFrom.value = "";
  bulkDeleteTo.value = "";
  refreshExportText();
  renderCalendar();
  alert("削除しました");
});

openHelpBtn.addEventListener("click", () => {
  closeMenuPanel();
  helpOverlay.classList.remove("hidden");
  helpPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

function closeHelpPanel() {
  helpOverlay.classList.add("hidden");
  helpPanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeHelpPanelBtn.addEventListener("click", closeHelpPanel);
helpOverlay.addEventListener("click", closeHelpPanel);

function loadCategories() {
  const raw = localStorage.getItem(MONEY_CATEGORIES_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES.slice();
}

function saveCategories(categories) {
  localStorage.setItem(MONEY_CATEGORIES_KEY, JSON.stringify(categories));
}

function loadMoneyData() {
  const raw = localStorage.getItem(MONEY_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveMoneyData(data) {
  localStorage.setItem(MONEY_KEY, JSON.stringify(data));
}

function renderMoneyCategoryEditor() {
  const categories = loadCategories();
  moneyCategoryEditor.innerHTML = "";
  categories.forEach((name, index) => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = name;
    input.placeholder = `項目${index + 1}`;
    input.addEventListener("change", () => {
      const current = loadCategories();
      current[index] = input.value.trim();
      saveCategories(current);
      renderMoneyList();
    });
    moneyCategoryEditor.appendChild(input);
  });
}

function renderMoneySummary() {
  const categories = loadCategories();
  const data = loadMoneyData();
  const daysInMonth = new Date(moneyYear, moneyMonth + 1, 0).getDate();
  const totals = categories.map(() => 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(moneyYear, moneyMonth, day);
    const row = data[key];
    if (!row) continue;
    categories.forEach((_, index) => {
      totals[index] += Number(row[index]) || 0;
    });
  }

  moneySummary.innerHTML = "";
  let grandTotal = 0;
  categories.forEach((name, index) => {
    if (!name) return;
    grandTotal += totals[index];
    const row = document.createElement("div");
    row.className = "money-summary-row";
    row.innerHTML = `<span>${name}</span><span>${totals[index].toLocaleString()}円</span>`;
    moneySummary.appendChild(row);
  });
  const totalRow = document.createElement("div");
  totalRow.className = "money-summary-row total";
  totalRow.innerHTML = `<span>今月の合計</span><span>${grandTotal.toLocaleString()}円</span>`;
  moneySummary.appendChild(totalRow);
}

function renderMoneyList() {
  moneyMonthLabel.textContent = `${moneyYear}年 ${moneyMonth + 1}月`;
  const categories = loadCategories();
  const data = loadMoneyData();
  const daysInMonth = new Date(moneyYear, moneyMonth + 1, 0).getDate();

  moneyList.innerHTML = "";
  let hasEntry = false;

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(moneyYear, moneyMonth, day);
    const row = data[key];
    if (!row) continue;
    const dayTotal = row.reduce((sum, v) => sum + (Number(v) || 0), 0);
    if (dayTotal <= 0) continue;
    hasEntry = true;

    const li = document.createElement("li");
    li.className = "money-entry-row";
    const dateSpan = document.createElement("span");
    dateSpan.textContent = key;
    const amountSpan = document.createElement("span");
    amountSpan.className = "money-entry-amount";
    amountSpan.textContent = `${dayTotal.toLocaleString()}円`;
    li.appendChild(dateSpan);
    li.appendChild(amountSpan);
    li.addEventListener("click", () => openMoneyDayPanel(key));
    moneyList.appendChild(li);
  }

  if (!hasEntry) {
    const li = document.createElement("li");
    li.textContent = "この月の記録はまだありません";
    moneyList.appendChild(li);
  }

  renderMoneySummary();
}

function openMoneyDayPanel(key) {
  moneyEditingDateKey = key;
  const categories = loadCategories();
  const data = loadMoneyData();
  const row = data[key] || [];

  moneyDayDate.textContent = key;
  moneyDayFields.innerHTML = "";
  categories.forEach((name, index) => {
    const fieldRow = document.createElement("div");
    fieldRow.className = "day-field-row";
    const label = document.createElement("label");
    label.textContent = name || `項目${index + 1}`;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.dataset.index = index;
    input.value = row[index] ? row[index] : "";
    fieldRow.appendChild(label);
    fieldRow.appendChild(input);
    moneyDayFields.appendChild(fieldRow);
  });

  moneyDayOverlay.classList.remove("hidden");
  moneyDayPanel.classList.remove("hidden");
  lockBackgroundScroll();
}

function closeMoneyDayPanel() {
  moneyDayOverlay.classList.add("hidden");
  moneyDayPanel.classList.add("hidden");
  moneyEditingDateKey = null;
  unlockBackgroundScroll();
}

saveMoneyDayBtn.addEventListener("click", () => {
  if (!moneyEditingDateKey) return;
  const inputs = moneyDayFields.querySelectorAll("input[type=number]");
  const row = [];
  inputs.forEach(input => {
    row[Number(input.dataset.index)] = Number(input.value) > 0 ? Number(input.value) : 0;
  });
  const data = loadMoneyData();
  data[moneyEditingDateKey] = row;
  saveMoneyData(data);
  closeMoneyDayPanel();
  renderMoneyList();
});

closeMoneyDayPanelBtn.addEventListener("click", closeMoneyDayPanel);
moneyDayOverlay.addEventListener("click", closeMoneyDayPanel);

moneyAddEntryBtn.addEventListener("click", () => {
  if (!moneyDateInput.value) return;
  openMoneyDayPanel(moneyDateInput.value);
});

openMoneyBtn.addEventListener("click", () => {
  closeMenuPanel();
  moneyYear = currentYear;
  moneyMonth = currentMonth;
  renderMoneyCategoryEditor();
  renderMoneyList();
  moneyDateInput.value = dateKey(currentYear, currentMonth, new Date().getDate());
  moneyOverlay.classList.remove("hidden");
  moneyPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

function closeMoneyPanel() {
  moneyOverlay.classList.add("hidden");
  moneyPanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeMoneyPanelBtn.addEventListener("click", closeMoneyPanel);
moneyOverlay.addEventListener("click", closeMoneyPanel);

prevMoneyMonthBtn.addEventListener("click", () => {
  moneyMonth--;
  if (moneyMonth < 0) {
    moneyMonth = 11;
    moneyYear--;
  }
  renderMoneyList();
});

nextMoneyMonthBtn.addEventListener("click", () => {
  moneyMonth++;
  if (moneyMonth > 11) {
    moneyMonth = 0;
    moneyYear++;
  }
  renderMoneyList();
});

moneyBulkDeleteBtn.addEventListener("click", () => {
  const from = moneyBulkFrom.value;
  const to = moneyBulkTo.value;
  if (!from || !to) {
    alert("削除する期間の開始日と終了日を両方入力してください");
    return;
  }
  if (from > to) {
    alert("開始日は終了日より前の日付にしてください");
    return;
  }

  const moneyData = loadMoneyData();
  const targetKeys = Object.keys(moneyData).filter(key => key >= from && key <= to);

  if (targetKeys.length === 0) {
    alert("指定した期間にお金の記録はありませんでした");
    return;
  }

  const ok = confirm(`${from}〜${to}のお金の記録（対象${targetKeys.length}日分）を削除します。元に戻せませんが、よろしいですか?`);
  if (!ok) return;

  targetKeys.forEach(key => { delete moneyData[key]; });
  saveMoneyData(moneyData);
  moneyBulkFrom.value = "";
  moneyBulkTo.value = "";
  renderMoneyList();
  alert("削除しました");
});

function loadHabitNames() {
  const raw = localStorage.getItem(HABIT_NAMES_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_HABITS.slice();
}

function saveHabitNames(names) {
  localStorage.setItem(HABIT_NAMES_KEY, JSON.stringify(names));
}

function loadHabitData() {
  const raw = localStorage.getItem(HABIT_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveHabitData(data) {
  localStorage.setItem(HABIT_KEY, JSON.stringify(data));
}

function renderHabitCategoryEditor() {
  const names = loadHabitNames();
  habitCategoryEditor.innerHTML = "";
  names.forEach((name, index) => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = name;
    input.placeholder = `習慣${index + 1}`;
    input.addEventListener("change", () => {
      const current = loadHabitNames();
      current[index] = input.value.trim();
      saveHabitNames(current);
      renderHabitList();
    });
    habitCategoryEditor.appendChild(input);
  });
}

function renderHabitSummary() {
  const names = loadHabitNames();
  const data = loadHabitData();
  const daysInMonth = new Date(habitYear, habitMonth + 1, 0).getDate();
  const totals = names.map(() => 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(habitYear, habitMonth, day);
    const row = data[key];
    if (!row) continue;
    names.forEach((_, index) => {
      if (row[index]) totals[index]++;
    });
  }

  habitSummary.innerHTML = "";
  names.forEach((name, index) => {
    if (!name) return;
    const row = document.createElement("div");
    row.className = "money-summary-row";
    row.innerHTML = `<span>${name}</span><span>${totals[index]}回</span>`;
    habitSummary.appendChild(row);
  });
}

function renderHabitList() {
  habitMonthLabel.textContent = `${habitYear}年 ${habitMonth + 1}月`;
  const names = loadHabitNames();
  const data = loadHabitData();
  const daysInMonth = new Date(habitYear, habitMonth + 1, 0).getDate();

  habitList.innerHTML = "";
  let hasEntry = false;

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(habitYear, habitMonth, day);
    const row = data[key];
    if (!row) continue;
    const doneNames = names.filter((name, index) => row[index] && name);
    if (doneNames.length === 0) continue;
    hasEntry = true;

    const li = document.createElement("li");
    li.className = "money-entry-row";
    const dateSpan = document.createElement("span");
    dateSpan.textContent = key;
    const doneSpan = document.createElement("span");
    doneSpan.className = "money-entry-amount";
    doneSpan.textContent = doneNames.join(" / ");
    li.appendChild(dateSpan);
    li.appendChild(doneSpan);
    li.addEventListener("click", () => openHabitDayPanel(key));
    habitList.appendChild(li);
  }

  if (!hasEntry) {
    const li = document.createElement("li");
    li.textContent = "この月の記録はまだありません";
    habitList.appendChild(li);
  }

  renderHabitSummary();
}

function openHabitDayPanel(key) {
  habitEditingDateKey = key;
  const names = loadHabitNames();
  const data = loadHabitData();
  const row = data[key] || [];

  habitDayDate.textContent = key;
  habitDayFields.innerHTML = "";
  names.forEach((name, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "habit-toggle";
    btn.dataset.index = index;
    btn.dataset.done = row[index] ? "true" : "false";
    if (row[index]) btn.classList.add("done");
    btn.innerHTML = `<span>${name || `習慣${index + 1}`}</span><span class="habit-toggle-mark">${row[index] ? "達成 ✓" : "未達成"}</span>`;
    btn.addEventListener("click", () => {
      const isDone = btn.dataset.done === "true";
      btn.dataset.done = isDone ? "false" : "true";
      btn.classList.toggle("done", !isDone);
      btn.querySelector(".habit-toggle-mark").textContent = isDone ? "未達成" : "達成 ✓";
    });
    habitDayFields.appendChild(btn);
  });

  habitDayOverlay.classList.remove("hidden");
  habitDayPanel.classList.remove("hidden");
  lockBackgroundScroll();
}

function closeHabitDayPanel() {
  habitDayOverlay.classList.add("hidden");
  habitDayPanel.classList.add("hidden");
  habitEditingDateKey = null;
  unlockBackgroundScroll();
}

saveHabitDayBtn.addEventListener("click", () => {
  if (!habitEditingDateKey) return;
  const buttons = habitDayFields.querySelectorAll(".habit-toggle");
  const row = [];
  buttons.forEach(btn => {
    row[Number(btn.dataset.index)] = btn.dataset.done === "true";
  });
  const data = loadHabitData();
  data[habitEditingDateKey] = row;
  saveHabitData(data);
  closeHabitDayPanel();
  renderHabitList();
});

closeHabitDayPanelBtn.addEventListener("click", closeHabitDayPanel);
habitDayOverlay.addEventListener("click", closeHabitDayPanel);

habitAddEntryBtn.addEventListener("click", () => {
  if (!habitDateInput.value) return;
  openHabitDayPanel(habitDateInput.value);
});

openHabitBtn.addEventListener("click", () => {
  closeMenuPanel();
  habitYear = currentYear;
  habitMonth = currentMonth;
  renderHabitCategoryEditor();
  renderHabitList();
  habitDateInput.value = dateKey(currentYear, currentMonth, new Date().getDate());
  habitOverlay.classList.remove("hidden");
  habitPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

function closeHabitPanel() {
  habitOverlay.classList.add("hidden");
  habitPanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeHabitPanelBtn.addEventListener("click", closeHabitPanel);
habitOverlay.addEventListener("click", closeHabitPanel);

prevHabitMonthBtn.addEventListener("click", () => {
  habitMonth--;
  if (habitMonth < 0) {
    habitMonth = 11;
    habitYear--;
  }
  renderHabitList();
});

nextHabitMonthBtn.addEventListener("click", () => {
  habitMonth++;
  if (habitMonth > 11) {
    habitMonth = 0;
    habitYear++;
  }
  renderHabitList();
});

habitBulkDeleteBtn.addEventListener("click", () => {
  const from = habitBulkFrom.value;
  const to = habitBulkTo.value;
  if (!from || !to) {
    alert("削除する期間の開始日と終了日を両方入力してください");
    return;
  }
  if (from > to) {
    alert("開始日は終了日より前の日付にしてください");
    return;
  }

  const habitData = loadHabitData();
  const targetKeys = Object.keys(habitData).filter(key => key >= from && key <= to);

  if (targetKeys.length === 0) {
    alert("指定した期間に習慣の記録はありませんでした");
    return;
  }

  const ok = confirm(`${from}〜${to}の習慣の記録（対象${targetKeys.length}日分）を削除します。元に戻せませんが、よろしいですか?`);
  if (!ok) return;

  targetKeys.forEach(key => { delete habitData[key]; });
  saveHabitData(habitData);
  habitBulkFrom.value = "";
  habitBulkTo.value = "";
  renderHabitList();
  alert("削除しました");
});

function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  renderCalendar();
}

init();
