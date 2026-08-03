const STORAGE_KEY = "calendarAppData";
const ARCHIVE_KEY = "completedTasksData";

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
const markStar = document.getElementById("markStar");
const markHeart = document.getElementById("markHeart");
const markSmile = document.getElementById("markSmile");
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

const openDiaryListBtn = document.getElementById("openDiaryList");
const diaryOverlay = document.getElementById("diaryOverlay");
const diaryPanel = document.getElementById("diaryPanel");
const closeDiaryPanelBtn = document.getElementById("closeDiaryPanel");
const diaryListEl = document.getElementById("diaryListEl");

const openMoneyBtn = document.getElementById("openMoney");
const moneyOverlay = document.getElementById("moneyOverlay");
const moneyPanel = document.getElementById("moneyPanel");
const closeMoneyPanelBtn = document.getElementById("closeMoneyPanel");
const prevMoneyMonthBtn = document.getElementById("prevMoneyMonth");
const nextMoneyMonthBtn = document.getElementById("nextMoneyMonth");
const moneyMonthLabel = document.getElementById("moneyMonthLabel");
const moneyTable = document.getElementById("moneyTable");

const MONEY_KEY = "moneyEntriesData";
const MONEY_CATEGORIES_KEY = "moneyCategoriesData";
const DEFAULT_CATEGORIES = ["", "", "", "", ""];
let moneyYear;
let moneyMonth; // 0-11

const openHabitBtn = document.getElementById("openHabit");
const habitOverlay = document.getElementById("habitOverlay");
const habitPanel = document.getElementById("habitPanel");
const closeHabitPanelBtn = document.getElementById("closeHabitPanel");
const prevHabitMonthBtn = document.getElementById("prevHabitMonth");
const nextHabitMonthBtn = document.getElementById("nextHabitMonth");
const habitMonthLabel = document.getElementById("habitMonthLabel");
const habitTable = document.getElementById("habitTable");

const HABIT_KEY = "habitEntriesData";
const HABIT_NAMES_KEY = "habitNamesData";
const DEFAULT_HABITS = ["", "", "", "", ""];
let habitYear;
let habitMonth; // 0-11

const modeButtons = document.querySelectorAll(".mode-btn");
const modeHintLabel = document.getElementById("modeHintLabel");
let activeMode = null; // "holiday" | "star" | "heart" | "smile" | null (null = オフ)

const MODE_LABELS = { holiday: "休み", national: "祝日", star: "⭐", heart: "💗", smile: "😊" };

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
  return {
    holiday: !!raw.holiday,
    national: !!raw.national,
    marks: {
      star: !!(raw.marks && raw.marks.star),
      heart: !!(raw.marks && raw.marks.heart),
      smile: !!(raw.marks && raw.marks.smile),
    },
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

  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement("div");
    empty.className = "day-cell empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(currentYear, currentMonth, day);
    const dayData = getDayData(data, key);

    const cell = document.createElement("div");
    cell.className = "day-cell" + (dayData.holiday ? " holiday" : "") + (dayData.national ? " national" : "");

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

    const markEmojis = [];
    if (dayData.marks.star) markEmojis.push("⭐");
    if (dayData.marks.heart) markEmojis.push("💗");
    if (dayData.marks.smile) markEmojis.push("😊");
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

    const infoParts = [];
    if (dayData.schedule && dayData.schedule.length > 0) {
      infoParts.push(`予定 ${dayData.schedule.length}`);
    }
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
  } else if (activeMode) {
    modeHintLabel.textContent = `選択中: ${MODE_LABELS[activeMode]} ／ 日付をタップするとON/OFFが切り替わります`;
  } else {
    modeHintLabel.textContent = "日付をタップすると詳細(予定・タスク・メモ)を開けます";
  }
}

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => setActiveMode(btn.dataset.mode));
});

setActiveMode("off");

function openPanel(key) {
  selectedDateKey = key;
  const data = loadData();
  const dayData = getDayData(data, key);

  panelDate.textContent = key;
  holidayCheck.checked = dayData.holiday;
  nationalCheck.checked = dayData.national;
  markStar.checked = dayData.marks.star;
  markHeart.checked = dayData.marks.heart;
  markSmile.checked = dayData.marks.smile;
  diaryText.value = dayData.memo || "";
  renderScheduleList(dayData.schedule);
  renderTaskList(dayData.tasks);

  overlay.classList.remove("hidden");
  panel.classList.remove("hidden");
}

function closePanel() {
  overlay.classList.add("hidden");
  panel.classList.add("hidden");
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

markStar.addEventListener("change", () => {
  updateSelectedDay(d => { d.marks.star = markStar.checked; });
});
markHeart.addEventListener("change", () => {
  updateSelectedDay(d => { d.marks.heart = markHeart.checked; });
});
markSmile.addEventListener("change", () => {
  updateSelectedDay(d => { d.marks.smile = markSmile.checked; });
});

saveDiaryBtn.addEventListener("click", () => {
  updateSelectedDay(d => {
    d.memo = diaryText.value;
  });
  saveDiaryBtn.textContent = "保存しました";
  setTimeout(() => { saveDiaryBtn.textContent = "メモ・日記を保存"; }, 1200);
});

closePanelBtn.addEventListener("click", closePanel);
overlay.addEventListener("click", closePanel);

function renderArchiveList() {
  const archive = loadArchive();
  archiveList.innerHTML = "";
  if (archive.length === 0) {
    const li = document.createElement("li");
    li.textContent = "完了したタスクはまだありません";
    archiveList.appendChild(li);
    return;
  }
  archive.forEach((item, index) => {
    const li = document.createElement("li");

    const dateSpan = document.createElement("span");
    dateSpan.className = "archive-item-date";
    dateSpan.textContent = item.date;

    const textSpan = document.createElement("span");
    textSpan.textContent = item.text;

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
    li.appendChild(deleteBtn);
    archiveList.appendChild(li);
  });
}

openTaskArchiveBtn.addEventListener("click", () => {
  renderArchiveList();
  archiveOverlay.classList.remove("hidden");
  archivePanel.classList.remove("hidden");
});

function closeArchivePanel() {
  archiveOverlay.classList.add("hidden");
  archivePanel.classList.add("hidden");
}

closeArchivePanelBtn.addEventListener("click", closeArchivePanel);
archiveOverlay.addEventListener("click", closeArchivePanel);

function renderDiaryList() {
  const data = loadData();
  const entries = Object.keys(data)
    .filter(key => data[key].memo && data[key].memo.trim() !== "")
    .sort((a, b) => b.localeCompare(a));

  diaryListEl.innerHTML = "";
  if (entries.length === 0) {
    const li = document.createElement("li");
    li.textContent = "メモ・日記はまだありません";
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
  renderDiaryList();
  diaryOverlay.classList.remove("hidden");
  diaryPanel.classList.remove("hidden");
});

function closeDiaryPanel() {
  diaryOverlay.classList.add("hidden");
  diaryPanel.classList.add("hidden");
}

closeDiaryPanelBtn.addEventListener("click", closeDiaryPanel);
diaryOverlay.addEventListener("click", closeDiaryPanel);

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

function moneyDateKey(day) {
  return `${moneyYear}-${String(moneyMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function renderMoneyTable() {
  moneyMonthLabel.textContent = `${moneyYear}年 ${moneyMonth + 1}月`;
  const categories = loadCategories();
  const data = loadMoneyData();
  const daysInMonth = new Date(moneyYear, moneyMonth + 1, 0).getDate();

  moneyTable.innerHTML = "";

  const headRow = document.createElement("tr");
  const dateHeadTh = document.createElement("th");
  dateHeadTh.textContent = "日付";
  headRow.appendChild(dateHeadTh);
  categories.forEach((name, index) => {
    const th = document.createElement("th");
    const input = document.createElement("input");
    input.type = "text";
    input.value = name;
    input.placeholder = "項目名";
    input.className = "category-name-input";
    input.addEventListener("focus", () => { input.placeholder = ""; });
    input.addEventListener("blur", () => { input.placeholder = "項目名"; });
    input.addEventListener("change", () => {
      const current = loadCategories();
      current[index] = input.value.trim();
      saveCategories(current);
      renderMoneyTable();
    });
    th.appendChild(input);
    headRow.appendChild(th);
  });
  moneyTable.appendChild(headRow);

  const totals = categories.map(() => 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const key = moneyDateKey(day);
    const row = data[key] || [];
    const tr = document.createElement("tr");

    const dayTd = document.createElement("td");
    dayTd.textContent = day;
    tr.appendChild(dayTd);

    categories.forEach((_, index) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.className = "money-cell-input";
      const value = row[index];
      input.value = value ? value : "";
      if (value) totals[index] += value;

      input.addEventListener("change", () => {
        const current = loadMoneyData();
        const currentRow = current[key] || [];
        const amount = Number(input.value);
        currentRow[index] = amount > 0 ? amount : 0;
        current[key] = currentRow;
        saveMoneyData(current);
        renderMoneyTable();
      });

      td.appendChild(input);
      tr.appendChild(td);
    });

    moneyTable.appendChild(tr);
  }

  const totalRow = document.createElement("tr");
  totalRow.className = "money-total-row";
  const totalLabelTd = document.createElement("td");
  totalLabelTd.textContent = "合計";
  totalRow.appendChild(totalLabelTd);
  let grandTotal = 0;
  totals.forEach(t => {
    grandTotal += t;
    const td = document.createElement("td");
    td.textContent = t;
    totalRow.appendChild(td);
  });
  moneyTable.appendChild(totalRow);

  const grandRow = document.createElement("tr");
  grandRow.className = "money-total-row";
  const grandLabelTd = document.createElement("td");
  grandLabelTd.textContent = "総合計";
  grandRow.appendChild(grandLabelTd);
  const grandTd = document.createElement("td");
  grandTd.colSpan = categories.length;
  grandTd.textContent = `${grandTotal}円`;
  grandRow.appendChild(grandTd);
  moneyTable.appendChild(grandRow);
}

function openMoneyPanel() {
  moneyYear = currentYear;
  moneyMonth = currentMonth;
  renderMoneyTable();
  moneyOverlay.classList.remove("hidden");
  moneyPanel.classList.remove("hidden");
}

function closeMoneyPanel() {
  moneyOverlay.classList.add("hidden");
  moneyPanel.classList.add("hidden");
}

openMoneyBtn.addEventListener("click", openMoneyPanel);
closeMoneyPanelBtn.addEventListener("click", closeMoneyPanel);
moneyOverlay.addEventListener("click", closeMoneyPanel);

prevMoneyMonthBtn.addEventListener("click", () => {
  moneyMonth--;
  if (moneyMonth < 0) {
    moneyMonth = 11;
    moneyYear--;
  }
  renderMoneyTable();
});

nextMoneyMonthBtn.addEventListener("click", () => {
  moneyMonth++;
  if (moneyMonth > 11) {
    moneyMonth = 0;
    moneyYear++;
  }
  renderMoneyTable();
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

function habitDateKey(day) {
  return `${habitYear}-${String(habitMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function renderHabitTable() {
  habitMonthLabel.textContent = `${habitYear}年 ${habitMonth + 1}月`;
  const names = loadHabitNames();
  const data = loadHabitData();
  const daysInMonth = new Date(habitYear, habitMonth + 1, 0).getDate();

  habitTable.innerHTML = "";

  const headRow = document.createElement("tr");
  const dateHeadTh = document.createElement("th");
  dateHeadTh.textContent = "日付";
  headRow.appendChild(dateHeadTh);
  names.forEach((name, index) => {
    const th = document.createElement("th");
    const input = document.createElement("input");
    input.type = "text";
    input.value = name;
    input.placeholder = "項目名";
    input.className = "category-name-input";
    input.addEventListener("focus", () => { input.placeholder = ""; });
    input.addEventListener("blur", () => { input.placeholder = "項目名"; });
    input.addEventListener("change", () => {
      const current = loadHabitNames();
      current[index] = input.value.trim();
      saveHabitNames(current);
      renderHabitTable();
    });
    th.appendChild(input);
    headRow.appendChild(th);
  });
  habitTable.appendChild(headRow);

  const totals = names.map(() => 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const key = habitDateKey(day);
    const row = data[key] || [];
    const tr = document.createElement("tr");

    const dayTd = document.createElement("td");
    dayTd.textContent = day;
    tr.appendChild(dayTd);

    names.forEach((_, index) => {
      const td = document.createElement("td");
      const done = !!row[index];
      td.className = "habit-cell" + (done ? " habit-done" : "");
      td.textContent = done ? "✓" : "";
      if (done) totals[index]++;

      td.addEventListener("click", () => {
        const current = loadHabitData();
        const currentRow = current[key] || [];
        currentRow[index] = !currentRow[index];
        current[key] = currentRow;
        saveHabitData(current);
        renderHabitTable();
      });

      tr.appendChild(td);
    });

    habitTable.appendChild(tr);
  }

  const totalRow = document.createElement("tr");
  totalRow.className = "money-total-row";
  const totalLabelTd = document.createElement("td");
  totalLabelTd.textContent = "合計";
  totalRow.appendChild(totalLabelTd);
  totals.forEach(t => {
    const td = document.createElement("td");
    td.textContent = `${t}回`;
    totalRow.appendChild(td);
  });
  habitTable.appendChild(totalRow);
}

function openHabitPanel() {
  habitYear = currentYear;
  habitMonth = currentMonth;
  renderHabitTable();
  habitOverlay.classList.remove("hidden");
  habitPanel.classList.remove("hidden");
}

function closeHabitPanel() {
  habitOverlay.classList.add("hidden");
  habitPanel.classList.add("hidden");
}

openHabitBtn.addEventListener("click", openHabitPanel);
closeHabitPanelBtn.addEventListener("click", closeHabitPanel);
habitOverlay.addEventListener("click", closeHabitPanel);

prevHabitMonthBtn.addEventListener("click", () => {
  habitMonth--;
  if (habitMonth < 0) {
    habitMonth = 11;
    habitYear--;
  }
  renderHabitTable();
});

nextHabitMonthBtn.addEventListener("click", () => {
  habitMonth++;
  if (habitMonth > 11) {
    habitMonth = 0;
    habitYear++;
  }
  renderHabitTable();
});

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

function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  renderCalendar();
}

init();
