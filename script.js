const STORAGE_KEY = "calendarAppData";
const ARCHIVE_KEY = "completedTasksData";

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
  lockBackgroundScroll();
});

function closeArchivePanel() {
  archiveOverlay.classList.add("hidden");
  archivePanel.classList.add("hidden");
  unlockBackgroundScroll();
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

function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  renderCalendar();
}

init();
