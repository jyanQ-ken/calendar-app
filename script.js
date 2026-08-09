
const STORAGE_KEY = "calendarAppData";
const ARCHIVE_KEY = "completedTasksData";
const THEME_KEY = "themePreference";

// 保存データが何らかの理由で壊れていても、アプリ全体が止まらないようにするための安全な読み込み関数。
// 壊れていた場合はfallbackの値(空配列/空オブジェクト)を返す。
function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("保存データの読み込みに失敗しました。初期状態として扱います。", e);
    return fallback;
  }
}

[
  "moneyEntriesData", "moneyCategoriesData",
  "habitEntriesData", "habitNamesData",
  "healthEntriesData", "healthItemsData",
].forEach(key => localStorage.removeItem(key));

const themeToggleBtn = document.getElementById("themeToggle");

const ICON_SUN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/><line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>';
const ICON_PALETTE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="9.5" cy="7" r="1.2" fill="currentColor" stroke="none"/><circle cx="14" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="17" cy="10" r="1.2" fill="currentColor" stroke="none"/></svg>';
const ICON_MONO = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/></svg>';

function effectiveTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateThemeToggleLabel() {
  const isDark = effectiveTheme() === "dark";
  themeToggleBtn.innerHTML = isDark ? ICON_SUN : ICON_MOON;
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

const COLOR_THEME_KEY = "colorThemeMode";
const colorThemeToggleBtn = document.getElementById("colorThemeToggle");

function isColorTheme() {
  return localStorage.getItem(COLOR_THEME_KEY) === "color";
}

function updateColorThemeToggleLabel() {
  const isColor = isColorTheme();
  colorThemeToggleBtn.innerHTML = isColor ? ICON_MONO : ICON_PALETTE;
  colorThemeToggleBtn.classList.toggle("active", isColor);
  colorThemeToggleBtn.title = isColor ? "モノトーンに切り替え" : "カラーに切り替え";
}

function applyStoredColorTheme() {
  document.documentElement.setAttribute("data-color-theme", isColorTheme() ? "color" : "mono");
  updateColorThemeToggleLabel();
}

colorThemeToggleBtn.addEventListener("click", () => {
  if (isPracticalMode()) {
    // 実務向けモード中にパレットボタンを押したら、まずそれを解除するだけにする
    // (モノ/カラーの切り替え自体は次のクリックから)
    setPracticalMode(false);
    return;
  }
  localStorage.setItem(COLOR_THEME_KEY, isColorTheme() ? "mono" : "color");
  applyStoredColorTheme();
});

applyStoredColorTheme();

// 隠しコマンド的な「実務向け」配色: 月表示(例: 2026年 8月)をタップすると入り、
// モノ/カラーどちらとも混ざらない、視認性重視の固定配色になる(昼夜切り替えなし)。
// 解除は、もう一度月表示をタップするか、上のパレットボタンを押す。
const PRACTICAL_MODE_KEY = "practicalModeOn";

function isPracticalMode() {
  return localStorage.getItem(PRACTICAL_MODE_KEY) === "1";
}

function setPracticalMode(on) {
  localStorage.setItem(PRACTICAL_MODE_KEY, on ? "1" : "0");
  document.documentElement.classList.toggle("practical-mode", on);
  // 実務向け配色は固定色で昼夜切り替えの効果が出ないため、押しても色が変わらず
  // 誤解を招かないよう、有効な間は昼夜ボタン自体を押せなくする。
  themeToggleBtn.disabled = on;
}

setPracticalMode(isPracticalMode());

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
monthLabel.addEventListener("click", () => {
  setPracticalMode(!isPracticalMode());
});
const calendarGrid = document.getElementById("calendarGrid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const openMonthMemoBtn = document.getElementById("openMonthMemo");
const monthMemoOverlay = document.getElementById("monthMemoOverlay");
const monthMemoPanel = document.getElementById("monthMemoPanel");
const closeMonthMemoPanelBtn = document.getElementById("closeMonthMemoPanel");
const monthMemoText = document.getElementById("monthMemoText");
const copyMonthMemoBtn = document.getElementById("copyMonthMemoBtn");
const clearMonthMemoBtn = document.getElementById("clearMonthMemoBtn");

const FREE_MEMO_KEY = "freeMemoData";

monthMemoText.addEventListener("input", () => {
  localStorage.setItem(FREE_MEMO_KEY, monthMemoText.value);
});

openMonthMemoBtn.addEventListener("click", () => {
  monthMemoText.value = localStorage.getItem(FREE_MEMO_KEY) || "";
  monthMemoOverlay.classList.remove("hidden");
  monthMemoPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

function closeMonthMemoPanel() {
  monthMemoOverlay.classList.add("hidden");
  monthMemoPanel.classList.add("hidden");
  unlockBackgroundScroll();
}

closeMonthMemoPanelBtn.addEventListener("click", closeMonthMemoPanel);
monthMemoOverlay.addEventListener("click", closeMonthMemoPanel);

copyMonthMemoBtn.addEventListener("click", async () => {
  monthMemoText.select();
  try {
    await navigator.clipboard.writeText(monthMemoText.value);
  } catch (e) {
    document.execCommand("copy");
  }
  copyMonthMemoBtn.textContent = "コピーしました";
  setTimeout(() => { copyMonthMemoBtn.textContent = "コピーする"; }, 1200);
});

clearMonthMemoBtn.addEventListener("click", () => {
  if (monthMemoText.value === "") return;
  const ok = confirm("メモ帳の内容をすべて削除します。元に戻せませんが、よろしいですか?");
  if (!ok) return;
  monthMemoText.value = "";
  localStorage.setItem(FREE_MEMO_KEY, "");
});

const HABIT_LIST_KEY = "habitListData";
const HABIT_LOG_KEY = "habitLogData";

const openHabitBtn = document.getElementById("openHabit");
const habitOverlay = document.getElementById("habitOverlay");
const habitPanel = document.getElementById("habitPanel");
const closeHabitPanelBtn = document.getElementById("closeHabitPanel");
const habitPrevMonthBtn = document.getElementById("habitPrevMonth");
const habitNextMonthBtn = document.getElementById("habitNextMonth");
const habitMonthLabel = document.getElementById("habitMonthLabel");
const habitGrid = document.getElementById("habitGrid");
const habitNameInput = document.getElementById("habitNameInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitProgressWrap = document.getElementById("habitProgressWrap");
const habitProgressFill = document.getElementById("habitProgressFill");
const habitProgressText = document.getElementById("habitProgressText");

let habitViewYear;
let habitViewMonth; // 0-11

function loadHabitList() {
  const raw = localStorage.getItem(HABIT_LIST_KEY);
  const list = safeParse(raw, []);
  // 過去のバグでIDが重複していた場合に備えて、重複を自動で振り直す
  const seen = new Set();
  let fixed = false;
  list.forEach(h => {
    if (seen.has(h.id)) {
      h.id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      fixed = true;
    }
    seen.add(h.id);
  });
  if (fixed) saveHabitList(list);
  return list;
}
function saveHabitList(list) {
  localStorage.setItem(HABIT_LIST_KEY, JSON.stringify(list));
}
function loadHabitLog() {
  const raw = localStorage.getItem(HABIT_LOG_KEY);
  return safeParse(raw, {});
}
function saveHabitLog(log) {
  localStorage.setItem(HABIT_LOG_KEY, JSON.stringify(log));
}
function todayKey() {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}
function habitTotalCount(log, habitId) {
  // これまでにチェックが付いた日の合計数を数える(連続でなくてもOK)
  let count = 0;
  for (const key in log) {
    if (log[key] && log[key][habitId]) count++;
  }
  return count;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderHabitPanel() {
  const list = loadHabitList();
  const log = loadHabitLog();
  const today = todayKey();
  const now = new Date();
  const isCurrentMonth = habitViewYear === now.getFullYear() && habitViewMonth === now.getMonth();

  habitMonthLabel.textContent = `${habitViewYear}年${habitViewMonth + 1}月`;

  const daysInMonth = new Date(habitViewYear, habitViewMonth + 1, 0).getDate();
  const dayKeys = [];
  for (let d = 1; d <= daysInMonth; d++) dayKeys.push(dateKey(habitViewYear, habitViewMonth, d));

  if (list.length === 0) {
    habitGrid.innerHTML = "";
    habitProgressWrap.classList.add("hidden");
    return;
  }
  habitProgressWrap.classList.remove("hidden");

  const headRow = `<tr><th class="habit-grid-name-head"></th>${
    dayKeys.map(key => `<th class="habit-grid-day-head${key === today ? " is-today" : ""}">${Number(key.slice(-2))}</th>`).join("")
  }</tr>`;

  const bodyRows = list.map(h => {
    const total = habitTotalCount(log, h.id);
    const cells = dayKeys.map(key => {
      const done = !!(log[key] && log[key][h.id]);
      return `<td><button type="button" class="habit-cell${done ? " done" : ""}${key === today ? " is-today" : ""}" data-habit-check="${h.id}" data-day-key="${key}" aria-label="${escapeHtml(h.name)} ${key}"></button></td>`;
    }).join("");
    return `<tr>
      <th class="habit-grid-name-head">
        <span class="habit-name">${escapeHtml(h.name)}</span>
        ${total > 0 ? `<span class="habit-streak">✓ ${total}</span>` : ""}
        <button type="button" class="habit-delete-btn" data-habit-delete="${h.id}" aria-label="削除">×</button>
      </th>
      ${cells}
    </tr>`;
  }).join("");

  habitGrid.innerHTML = `<thead>${headRow}</thead><tbody>${bodyRows}</tbody>`;

  if (isCurrentMonth) {
    const todayLog = log[today] || {};
    const doneCount = list.filter(h => todayLog[h.id]).length;
    const total = list.length;
    const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
    habitProgressFill.style.width = `${pct}%`;
    habitProgressText.textContent = `今日: ${doneCount} / ${total} 達成`;
  } else {
    habitProgressFill.style.width = "0%";
    habitProgressText.textContent = "";
  }
}

openHabitBtn.addEventListener("click", () => {
  const now = new Date();
  habitViewYear = now.getFullYear();
  habitViewMonth = now.getMonth();
  renderHabitPanel();
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

habitPrevMonthBtn.addEventListener("click", () => {
  habitViewMonth--;
  if (habitViewMonth < 0) { habitViewMonth = 11; habitViewYear--; }
  renderHabitPanel();
});
habitNextMonthBtn.addEventListener("click", () => {
  habitViewMonth++;
  if (habitViewMonth > 11) { habitViewMonth = 0; habitViewYear++; }
  renderHabitPanel();
});

habitGrid.addEventListener("click", (e) => {
  const checkBtn = e.target.closest("[data-habit-check]");
  if (checkBtn) {
    const id = checkBtn.dataset.habitCheck;
    const key = checkBtn.dataset.dayKey;
    const log = loadHabitLog();
    log[key] = log[key] || {};
    log[key][id] = !log[key][id];
    saveHabitLog(log);
    if (log[key][id]) {
      checkBtn.classList.add("pop");
      setTimeout(() => checkBtn.classList.remove("pop"), 400);
    }
    renderHabitPanel();
    return;
  }
  const delBtn = e.target.closest("[data-habit-delete]");
  if (delBtn) {
    const id = delBtn.dataset.habitDelete;
    const list = loadHabitList();
    const target = list.find(h => h.id === id);
    const ok = confirm(`「${target ? target.name : "この習慣"}」を削除します。これまでの記録も含めて元に戻せませんが、よろしいですか?`);
    if (!ok) return;
    saveHabitList(list.filter(h => h.id !== id));
    renderHabitPanel();
  }
});

addHabitBtn.addEventListener("click", () => {
  const name = habitNameInput.value.trim();
  if (!name) return;
  const list = loadHabitList();
  list.push({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, name });
  saveHabitList(list);
  habitNameInput.value = "";
  renderHabitPanel();
});
habitNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addHabitBtn.click();
});

// 複数ジャンルのリスト(買い物リストなど)
const LIST_KEY = "checklistListsData";

const openListBtn = document.getElementById("openList");
const listOverlay = document.getElementById("listOverlay");
const listPanel = document.getElementById("listPanel");
const closeListPanelBtn = document.getElementById("closeListPanel");
const listTabs = document.getElementById("listTabs");
const listItemInput = document.getElementById("listItemInput");
const addListItemBtn = document.getElementById("addListItemBtn");
const listItemsEl = document.getElementById("listItemsEl");
const copyListBtn = document.getElementById("copyListBtn");
const deleteListBtn = document.getElementById("deleteListBtn");
const newListNameInput = document.getElementById("newListNameInput");
const addListBtn = document.getElementById("addListBtn");

let activeListId = null;

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadLists() {
  const raw = localStorage.getItem(LIST_KEY);
  return safeParse(raw, []);
}
function saveLists(lists) {
  localStorage.setItem(LIST_KEY, JSON.stringify(lists));
}

function renderListPanel() {
  const lists = loadLists();
  if (!lists.find(l => l.id === activeListId)) {
    activeListId = lists.length > 0 ? lists[0].id : null;
  }

  listTabs.innerHTML = "";
  lists.forEach(list => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "list-tab" + (list.id === activeListId ? " active" : "");
    btn.textContent = list.name;
    btn.addEventListener("click", () => {
      activeListId = list.id;
      renderListPanel();
    });
    listTabs.appendChild(btn);
  });

  const activeList = lists.find(l => l.id === activeListId);
  listItemInput.disabled = !activeList;
  addListItemBtn.disabled = !activeList;
  copyListBtn.classList.toggle("hidden", !activeList);
  deleteListBtn.classList.toggle("hidden", !activeList);

  listItemsEl.innerHTML = "";

  if (!activeList) {
    const li = document.createElement("li");
    li.textContent = lists.length === 0
      ? "まだリストがありません。下から新しいリストを作ってください"
      : "リストを選んでください";
    listItemsEl.appendChild(li);
    return;
  }

  if (activeList.items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "項目はまだありません";
    listItemsEl.appendChild(li);
    return;
  }

  activeList.items.forEach(item => {
    const li = document.createElement("li");
    if (item.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      const current = loadLists();
      const l = current.find(x => x.id === activeListId);
      const it = l && l.items.find(x => x.id === item.id);
      if (!it) return;
      it.done = checkbox.checked;
      saveLists(current);
      renderListPanel();
    });

    const span = document.createElement("span");
    span.textContent = item.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-task";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => {
      const current = loadLists();
      const l = current.find(x => x.id === activeListId);
      if (!l) return;
      l.items = l.items.filter(x => x.id !== item.id);
      saveLists(current);
      renderListPanel();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    listItemsEl.appendChild(li);
  });
}

addListItemBtn.addEventListener("click", () => {
  const text = listItemInput.value.trim();
  if (!text || !activeListId) return;
  const lists = loadLists();
  const l = lists.find(x => x.id === activeListId);
  if (!l) return;
  l.items.push({ id: makeId(), text, done: false });
  saveLists(lists);
  listItemInput.value = "";
  renderListPanel();
});
listItemInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addListItemBtn.click();
});

addListBtn.addEventListener("click", () => {
  const name = newListNameInput.value.trim();
  if (!name) return;
  const lists = loadLists();
  const newList = { id: makeId(), name, items: [] };
  lists.push(newList);
  saveLists(lists);
  activeListId = newList.id;
  newListNameInput.value = "";
  renderListPanel();
});
newListNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addListBtn.click();
});

copyListBtn.addEventListener("click", async () => {
  const lists = loadLists();
  const l = lists.find(x => x.id === activeListId);
  if (!l) return;
  const lines = [l.name, ...l.items.map(it => `${it.done ? "[x]" : "[ ]"} ${it.text}`)];
  const text = lines.join("\n");
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  copyListBtn.textContent = "コピーしました";
  setTimeout(() => { copyListBtn.textContent = "COPY"; }, 1200);
});

deleteListBtn.addEventListener("click", () => {
  const lists = loadLists();
  const l = lists.find(x => x.id === activeListId);
  if (!l) return;
  const ok = confirm(`「${l.name}」を削除します。中の項目も含めて元に戻せませんが、よろしいですか?`);
  if (!ok) return;
  saveLists(lists.filter(x => x.id !== activeListId));
  activeListId = null;
  renderListPanel();
});

openListBtn.addEventListener("click", () => {
  renderListPanel();
  listOverlay.classList.remove("hidden");
  listPanel.classList.remove("hidden");
  lockBackgroundScroll();
});

function closeListPanel() {
  listOverlay.classList.add("hidden");
  listPanel.classList.add("hidden");
  unlockBackgroundScroll();
}
closeListPanelBtn.addEventListener("click", closeListPanel);
listOverlay.addEventListener("click", closeListPanel);

const overlay = document.getElementById("overlay");
const panel = document.getElementById("panel");
const panelDate = document.getElementById("panelDate");
const closePanelBtn = document.getElementById("closePanel");
const holidayCheck = document.getElementById("holidayCheck");
const nationalCheck = document.getElementById("nationalCheck");
const markChecks = document.getElementById("markChecks");
const scheduleInput = document.getElementById("scheduleInput");
const scheduleTimeInput = document.getElementById("scheduleTimeInput");
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
let activeMode = null; // "holiday" | "star" | "heart" | "smile" | "delete" | null (null = オフ)

const deleteActionBar = document.getElementById("deleteActionBar");
const deleteSelectionCount = document.getElementById("deleteSelectionCount");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const cancelDeleteSelectionBtn = document.getElementById("cancelDeleteSelectionBtn");
const deleteSelection = new Set();

function updateDeleteActionBar() {
  if (activeMode === "delete") {
    deleteActionBar.classList.remove("hidden");
    deleteSelectionCount.textContent = `${deleteSelection.size}件選択中`;
    deleteSelectedBtn.disabled = deleteSelection.size === 0;
  } else {
    deleteActionBar.classList.add("hidden");
  }
}

function toggleDeleteSelection(key) {
  if (deleteSelection.has(key)) {
    deleteSelection.delete(key);
  } else {
    deleteSelection.add(key);
  }
  updateDeleteActionBar();
  updateDayCell(key);
}

deleteSelectedBtn.addEventListener("click", () => {
  if (deleteSelection.size === 0) return;
  const ok = confirm(`選択した${deleteSelection.size}件の日付の記録(印・予定・タスク・メモ)を完全に削除します。元に戻せませんが、よろしいですか?`);
  if (!ok) return;
  const data = loadData();
  deleteSelection.forEach(key => { delete data[key]; });
  saveData(data);
  deleteSelection.clear();
  setActiveMode("off");
  renderCalendar();
});

cancelDeleteSelectionBtn.addEventListener("click", () => {
  deleteSelection.clear();
  updateDeleteActionBar();
  renderCalendar();
});

const MARK_DEFS = [
  { key: "star", emoji: "☆︎", label: "☆︎" },
  { key: "heart", emoji: "♡︎", label: "♡︎" },
  { key: "circle", emoji: "○︎", label: "○︎" },
  { key: "triangle", emoji: "△︎", label: "△︎" },
  { key: "cross", emoji: "×︎", label: "×︎" },
];

const MODE_LABELS = { holiday: "休み", national: "祝日" };
MARK_DEFS.forEach(def => { MODE_LABELS[def.key] = def.label; });

markChecks.innerHTML = MARK_DEFS.map(def =>
  `<label><input type="checkbox" data-mark="${def.key}"> <span data-mark-key="${def.key}">${def.emoji}</span></label>`
).join("");

// 予定入力のクイック定型文(空の枠に「バイト」などを登録すると、そのままボタンの表示になる)
const SCHEDULE_QUICK_TEXT_KEY = "scheduleQuickTextData";
const SCHEDULE_QUICK_SLOT_COUNT = 3;
const scheduleQuickMarksEl = document.getElementById("scheduleQuickMarks");
const scheduleQuickEditBtn = document.getElementById("scheduleQuickEditBtn");
let scheduleQuickEditMode = false;

function loadScheduleQuickText() {
  const raw = localStorage.getItem(SCHEDULE_QUICK_TEXT_KEY);
  return safeParse(raw, {});
}
function saveScheduleQuickText(map) {
  localStorage.setItem(SCHEDULE_QUICK_TEXT_KEY, JSON.stringify(map));
}

function renderScheduleQuickMarks() {
  const map = loadScheduleQuickText();
  scheduleQuickMarksEl.innerHTML = "";
  for (let i = 0; i < SCHEDULE_QUICK_SLOT_COUNT; i++) {
    const slot = String(i);
    const existing = map[slot] || "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "schedule-quick-mark-btn" + (existing ? "" : " empty");
    btn.textContent = existing || "＋";
    btn.title = existing ? `予定欄に「${existing}」と入力` : "タップして、よく使う予定の文字を登録";
    btn.addEventListener("click", () => {
      const current = loadScheduleQuickText();
      const currentExisting = current[slot] || "";
      if (scheduleQuickEditMode || !currentExisting) {
        const next = prompt("よく使う予定の文字を登録してください(空にすると登録解除)", currentExisting);
        const trimmed = next === null ? null : next.trim();
        if (trimmed !== null) {
          if (trimmed === "") {
            delete current[slot];
          } else {
            current[slot] = trimmed;
          }
          saveScheduleQuickText(current);
        }
        scheduleQuickEditMode = false;
        scheduleQuickEditBtn.classList.remove("active");
        // 登録直後に予定欄へ自動でフォーカスすると、prompt()を閉じたEnterキーが
        // 漏れて予定が誤って追加されることがあるため、あえてフォーカスは移さない。
        if (trimmed) {
          scheduleInput.value = trimmed;
        }
        renderScheduleQuickMarks();
        return;
      }
      // 予定欄に文字を入れるところまで。時間を選んでからADDで確定してもらう。
      scheduleInput.value = currentExisting;
      scheduleInput.focus();
    });
    scheduleQuickMarksEl.appendChild(btn);
  }
}

scheduleQuickEditBtn.addEventListener("click", () => {
  scheduleQuickEditMode = !scheduleQuickEditMode;
  scheduleQuickEditBtn.classList.toggle("active", scheduleQuickEditMode);
});

renderScheduleQuickMarks();

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return safeParse(raw, {});
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

// 予定は文字列(旧形式)と{text, time}(新形式)が混在しうるので、常にこの形に揃えて扱う
function normalizeScheduleItem(item) {
  if (typeof item === "string") return { text: item, time: "" };
  return { text: item.text || "", time: item.time || "" };
}

// 時間ありの予定だけを時系列で並べ、時間なしの予定は先頭に元の順番のまま残す。
// 削除・完了などは元の配列のインデックスで行うため、{item, index}のペアで返す。
function sortScheduleEntries(schedule) {
  return schedule
    .map((raw, index) => ({ item: normalizeScheduleItem(raw), index }))
    .sort((a, b) => {
      if (!a.item.time && !b.item.time) return 0;
      if (!a.item.time) return -1;
      if (!b.item.time) return 1;
      return a.item.time < b.item.time ? -1 : a.item.time > b.item.time ? 1 : 0;
    });
}

function loadArchive() {
  const raw = localStorage.getItem(ARCHIVE_KEY);
  return safeParse(raw, []);
}

function saveArchive(list) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
}

function buildDayCell(key, day, dayData, todayKey) {
  const cell = document.createElement("div");
  cell.className = "day-cell"
    + (dayData.holiday ? " holiday" : "")
    + (dayData.national ? " national" : "")
    + (key === todayKey ? " today" : "");
  cell.dataset.key = key;

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

  const activeMarks = MARK_DEFS.filter(def => dayData.marks[def.key]);
  if (activeMarks.length > 0) {
    const markRow = document.createElement("div");
    markRow.className = "mark-row";
    activeMarks.forEach((def, index) => {
      const span = document.createElement("span");
      span.textContent = def.emoji;
      span.dataset.markKey = def.key;
      markRow.appendChild(span);
      if (index < activeMarks.length - 1) markRow.appendChild(document.createTextNode(" "));
    });
    cell.appendChild(markRow);
  }

  if (activeMode === "delete" && deleteSelection.has(key)) {
    cell.classList.add("selected-for-delete");
  }

  cell.addEventListener("click", () => {
    if (activeMode === "delete") {
      toggleDeleteSelection(key);
    } else if (activeMode) {
      applyModeToDay(key, activeMode);
    } else {
      openPanel(key);
    }
  });

  if (dayData.schedule && dayData.schedule.length > 0) {
    const scheduleEl = document.createElement("div");
    scheduleEl.className = "day-schedule";
    const first = normalizeScheduleItem(dayData.schedule[0]);
    const truncated = first.text.length > 8 ? first.text.slice(0, 8) + "…" : first.text;
    const prefix = first.time ? `${first.time} ` : "";
    const extra = dayData.schedule.length > 1 ? ` 他${dayData.schedule.length - 1}件` : "";
    scheduleEl.textContent = prefix + truncated + extra;
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

  return cell;
}

function todayKeyString() {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

function renderCalendar() {
  monthLabel.textContent = `${currentYear}年 ${currentMonth + 1}月`;
  calendarGrid.innerHTML = "";

  const data = loadData();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayKey = todayKeyString();

  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(currentYear, currentMonth, day);
    const dayData = getDayData(data, key);
    calendarGrid.appendChild(buildDayCell(key, day, dayData, todayKey));
  }
}

// 印つけモード・削除モードでの連続タップ用に、カレンダー全体を作り直さず
// タップされたそのマス1つだけを差し替える(全体再構築より軽く、反応が速い)
function updateDayCell(key) {
  const oldCell = calendarGrid.querySelector(`.day-cell[data-key="${key}"]`);
  if (!oldCell) {
    renderCalendar();
    return;
  }
  const day = Number(key.slice(-2));
  const data = loadData();
  const dayData = getDayData(data, key);
  const newCell = buildDayCell(key, day, dayData, todayKeyString());
  oldCell.replaceWith(newCell);
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
  updateDayCell(key);
}

function setActiveMode(mode) {
  if (activeMode !== "delete" || mode !== "delete") {
    deleteSelection.clear();
  }
  activeMode = (mode === "off") ? null : mode;
  modeButtons.forEach(btn => {
    const btnIsActive = activeMode === null ? btn.dataset.mode === "off" : btn.dataset.mode === activeMode;
    btn.classList.toggle("active", btnIsActive);
  });
  if (activeMode === "national") {
    modeHintLabel.textContent = "選択中: 祝日 ／ このアプリは祝日を自動判定しません。日本の暦を見ながら、祝日の日付を自分でタップして祝マークをつけてください";
    modeHint.classList.remove("hidden");
  } else if (activeMode === "delete") {
    modeHintLabel.textContent = "選択中: 削除 ／ 削除したい日付をタップして選び(複数選択可)、下の「選択した日を削除」ボタンを押してください";
    modeHint.classList.remove("hidden");
  } else if (activeMode) {
    modeHintLabel.textContent = `選択中: ${MODE_LABELS[activeMode]} ／ 日付をタップするとON/OFFが切り替わります`;
    modeHint.classList.remove("hidden");
  } else {
    modeHintLabel.textContent = "";
    modeHint.classList.add("hidden");
  }
  updateDeleteActionBar();
  if (currentYear !== undefined) renderCalendar();
}

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const clickedMode = btn.dataset.mode;
    // 選択中の印ボタンをもう一度押したら、OFFに戻す
    const isAlreadyActive = clickedMode !== "off" && activeMode === clickedMode;
    setActiveMode(isAlreadyActive ? "off" : clickedMode);
    closeMenuPanel();
  });
});

setActiveMode("off");

function openPanel(key) {
  selectedDateKey = key;
  const data = loadData();
  const dayData = getDayData(data, key);

  panelDate.textContent = key;
  // 確定せずに残っていた入力(未追加の予定・タスク)が別の日に紛れ込まないようクリアする。
  // 時間欄だけは、同じ時間を続けて別の日に入力しやすいようあえて残す。
  scheduleInput.value = "";
  taskInput.value = "";
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
  scheduleQuickEditMode = false;
  scheduleQuickEditBtn.classList.remove("active");
  renderCalendar();
}

function renderScheduleList(schedule) {
  scheduleList.innerHTML = "";
  sortScheduleEntries(schedule).forEach(({ item, index }) => {
    const li = document.createElement("li");

    if (item.time) {
      const timeSpan = document.createElement("span");
      timeSpan.className = "schedule-item-time";
      timeSpan.textContent = item.time;
      li.appendChild(timeSpan);
    }

    const span = document.createElement("span");
    span.textContent = item.text;

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

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = false;
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
    completedText = d.tasks[index].text;
    d.tasks.splice(index, 1);
  });
  const archive = loadArchive();
  archive.push({ text: completedText, date: selectedDateKey });
  saveArchive(archive);
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
  const time = scheduleTimeInput.value; // 未入力なら ""(時間なしの予定として扱う)
  const dayData = updateSelectedDay(d => {
    d.schedule.push({ text, time });
  });
  renderScheduleList(dayData.schedule);
  scheduleInput.value = "";
  scheduleTimeInput.value = "";
});

scheduleTimeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addScheduleBtn.click();
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

function appendScheduleItem(dayKey, item, index, todayKey) {
  const li = document.createElement("li");
  if (dayKey === todayKey) li.classList.add("today-item");
  if (dayKey < todayKey) li.classList.add("past-item");

  const dateSpan = document.createElement("span");
  dateSpan.className = "archive-item-date";
  dateSpan.textContent = item.time ? `${dayKey} ${item.time}` : dayKey;

  const textSpan = document.createElement("span");
  textSpan.textContent = item.text;

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
      return schedule.some(raw => normalizeScheduleItem(raw).text.includes(keyword));
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
    sortScheduleEntries(data[dayKey].schedule).forEach(({ item, index }) => {
      if (keyword && !item.text.includes(keyword)) return;
      hasUpcoming = true;
      appendScheduleItem(dayKey, item, index, todayKey);
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
      sortScheduleEntries(data[dayKey].schedule).forEach(({ item, index }) => {
        if (keyword && !item.text.includes(keyword)) return;
        hasPast = true;
        appendScheduleItem(dayKey, item, index, todayKey);
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
    const schedule = includeSchedule
      ? sortScheduleEntries(dayData.schedule || []).map(({ item }) => item.time ? `${item.time} ${item.text}` : item.text).join(" / ")
      : "";
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

const resetAllBtn = document.getElementById("resetAllBtn");

resetAllBtn.addEventListener("click", () => {
  const ok1 = confirm("休み・祝日・マーク・予定・タスク・メモ・メモ帳・リストなど、このアプリのデータをすべて削除して初期状態に戻します。元に戻せませんが、よろしいですか?");
  if (!ok1) return;
  const ok2 = confirm("本当によろしいですか?この操作は取り消せません。");
  if (!ok2) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ARCHIVE_KEY);
  localStorage.removeItem(FREE_MEMO_KEY);
  localStorage.removeItem(HABIT_LIST_KEY);
  localStorage.removeItem(HABIT_LOG_KEY);
  localStorage.removeItem(LIST_KEY);
  localStorage.removeItem(SCHEDULE_QUICK_TEXT_KEY);

  alert("すべてのデータを削除しました");
  location.reload();
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

function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  renderCalendar();
}

init();
