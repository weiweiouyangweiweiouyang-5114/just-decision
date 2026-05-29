const STORAGE_KEY = "dice-decision-records-v1";
const SETTINGS_KEY = "dice-decision-meanings-v1";
const defaultMeanings = {
  1: "选最简单的那个",
  2: "给自己两个选项",
  3: "听身体更轻的答案",
  4: "选长期更舒服的",
  5: "大胆一点",
  6: "就这样定",
};
const encouragements = [
  "你已经把纠结从脑子里拿出来了，这一步很厉害。",
  "不用一次想清人生，先完成这个小决定。",
  "答案不必完美，能往前走就很好。",
  "今天的你可以轻一点，不用把每个选择都背在身上。",
  "先照顾当下的自己，后面的路会慢慢展开。",
  "你不是拖延，你是在认真；现在可以温柔地收个尾。",
  "把选择交出去一点点，也是一种照顾自己。",
  "做完这个决定，就奖励自己一口顺畅的呼吸。",
];

const els = {
  settingsButton: document.querySelector("#settingsButton"),
  dice: document.querySelector("#dice"),
  decisionText: document.querySelector("#decisionText"),
  encouragementText: document.querySelector("#encouragementText"),
  openPromptButton: document.querySelector("#openPromptButton"),
  promptModal: document.querySelector("#promptModal"),
  closePromptButton: document.querySelector("#closePromptButton"),
  rollButton: document.querySelector("#rollButton"),
  questionInput: document.querySelector("#questionInput"),
  settingsModal: document.querySelector("#settingsModal"),
  closeSettingsButton: document.querySelector("#closeSettingsButton"),
  meaningGrid: document.querySelector("#meaningGrid"),
  saveSettingsButton: document.querySelector("#saveSettingsButton"),
  todayCount: document.querySelector("#todayCount"),
  todayList: document.querySelector("#todayList"),
  monthLabel: document.querySelector("#monthLabel"),
  prevMonthButton: document.querySelector("#prevMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  calendarGrid: document.querySelector("#calendarGrid"),
  heatmap: document.querySelector("#heatmap"),
};

let records = loadRecords();
let meanings = loadMeanings();
let visibleMonth = new Date();

function dateKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function loadRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.map((record, index) => ({
      ...record,
      id: record.id || `${record.createdAt || "record"}-${index}`,
    }));
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadMeanings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return { ...defaultMeanings, ...saved };
  } catch {
    return { ...defaultMeanings };
  }
}

function saveMeanings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(meanings));
}

function openPrompt() {
  els.promptModal.classList.add("is-open");
  els.promptModal.setAttribute("aria-hidden", "false");
  els.questionInput.value = "";
  els.questionInput.focus();
}

function closePrompt() {
  els.promptModal.classList.remove("is-open");
  els.promptModal.setAttribute("aria-hidden", "true");
}

function openSettings() {
  renderMeaningFields();
  els.settingsModal.classList.add("is-open");
  els.settingsModal.setAttribute("aria-hidden", "false");
  els.meaningGrid.querySelector("input")?.focus();
}

function closeSettings() {
  els.settingsModal.classList.remove("is-open");
  els.settingsModal.setAttribute("aria-hidden", "true");
}

function renderMeaningFields() {
  els.meaningGrid.innerHTML = [1, 2, 3, 4, 5, 6]
    .map(
      (value) => `
        <label class="meaning-field">
          <span>${value}</span>
          <input type="text" data-meaning="${value}" value="${escapeAttribute(meanings[value])}" maxlength="24" />
        </label>
      `,
    )
    .join("");
}

function saveMeaningFields() {
  els.meaningGrid.querySelectorAll("[data-meaning]").forEach((input) => {
    const value = input.dataset.meaning;
    meanings[value] = input.value.trim() || defaultMeanings[value];
  });
  saveMeanings();
  closeSettings();
  render();
}

function rollDice() {
  const question = els.questionInput.value.trim();
  if (!question) {
    els.questionInput.focus();
    return;
  }

  const value = Math.floor(Math.random() * 6) + 1;
  const createdAt = new Date().toISOString();
  const meaning = meanings[value];
  const encouragement = randomEncouragement();

  els.dice.classList.add("is-rolling");
  setTimeout(() => els.dice.classList.remove("is-rolling"), 280);
  els.dice.dataset.value = value;
  els.decisionText.textContent = `${value} 点：${meaning}`;
  els.encouragementText.textContent = encouragement;

  records.unshift({
    id: crypto.randomUUID(),
    question,
    value,
    meaning,
    encouragement,
    createdAt,
    date: dateKey(new Date()),
  });

  saveRecords();
  closePrompt();
  render();
}

function randomEncouragement() {
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

function getTodayRecords() {
  const today = dateKey(new Date());
  return records.filter((record) => record.date === today);
}

function groupByDate() {
  return records.reduce((groups, record) => {
    groups[record.date] ||= [];
    groups[record.date].push(record);
    return groups;
  }, {});
}

function renderToday() {
  const todayRecords = getTodayRecords();
  els.todayCount.textContent = `${todayRecords.length} 次`;

  if (todayRecords.length === 0) {
    els.todayList.innerHTML = `<div class="empty-state">今天还没摇过。等你开始纠结时，这里会接住它。</div>`;
    return;
  }

  els.todayList.innerHTML = todayRecords
    .map(
      (record) => `
        <article class="record-shell" data-record-id="${record.id}">
          <button class="delete-action" type="button" aria-label="删除这条记录">删除</button>
          <div class="record-card">
            <div><strong>${record.value}</strong><span>${formatTime(record.createdAt)}</span></div>
            <p>${escapeHtml(record.question)}</p>
            <small>${escapeHtml(record.meaning || meanings[record.value])}</small>
            <em>${escapeHtml(record.encouragement || "")}</em>
          </div>
        </article>
      `,
    )
    .join("");
  bindRecordGestures();
}

function renderCalendar() {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  const offset = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - offset);

  els.monthLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
  }).format(visibleMonth);

  const groups = groupByDate();
  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = dateKey(day);
    const dayRecords = groups[key] || [];
    const muted = day.getMonth() !== month ? " is-muted" : "";
    days.push(`
      <div class="calendar-day${muted}" title="${key}，${dayRecords.length} 次">
        <div class="calendar-date">${day.getDate()}</div>
        <div class="calendar-results">
          ${dayRecords.slice(0, 5).map((record) => `<span class="result-chip">${record.value}</span>`).join("")}
          ${dayRecords.length > 5 ? `<span class="result-chip">+${dayRecords.length - 5}</span>` : ""}
        </div>
      </div>
    `);
  }
  els.calendarGrid.innerHTML = days.join("");
}

function renderHeatmap() {
  const counts = records.reduce((acc, record) => {
    acc[record.date] = (acc[record.date] || 0) + 1;
    return acc;
  }, {});
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 83);

  const cells = [];
  for (let i = 0; i < 84; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = dateKey(day);
    const count = counts[key] || 0;
    cells.push(`<span class="heat-cell" data-level="${heatLevel(count)}" title="${key}，摇了 ${count} 次"></span>`);
  }
  els.heatmap.innerHTML = cells.join("");
}

function heatLevel(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function deleteRecord(recordId) {
  records = records.filter((record) => record.id !== recordId);
  saveRecords();
  render();
}

function bindRecordGestures() {
  els.todayList.querySelectorAll(".record-shell").forEach((shell) => {
    const card = shell.querySelector(".record-card");
    const deleteButton = shell.querySelector(".delete-action");
    let startX = 0;
    let currentX = 0;
    let pointerId = null;

    deleteButton.addEventListener("click", () => deleteRecord(shell.dataset.recordId));

    card.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      currentX = 0;
      pointerId = event.pointerId;
      card.setPointerCapture(pointerId);
      card.classList.add("is-dragging");
    });

    card.addEventListener("pointermove", (event) => {
      if (pointerId !== event.pointerId) return;
      currentX = Math.min(event.clientX - startX, 0);
      card.style.transform = `translateX(${Math.max(currentX, -96)}px)`;
    });

    card.addEventListener("pointerup", (event) => {
      if (pointerId !== event.pointerId) return;
      card.releasePointerCapture(pointerId);
      card.classList.remove("is-dragging");
      if (currentX < -92) {
        deleteRecord(shell.dataset.recordId);
        return;
      }
      card.style.transform = "";
      pointerId = null;
    });

    card.addEventListener("pointercancel", () => {
      card.classList.remove("is-dragging");
      card.style.transform = "";
      pointerId = null;
    });
  });
}

function render() {
  renderToday();
  renderCalendar();
  renderHeatmap();
}

els.openPromptButton.addEventListener("click", openPrompt);
els.settingsButton.addEventListener("click", openSettings);
els.closePromptButton.addEventListener("click", closePrompt);
els.closeSettingsButton.addEventListener("click", closeSettings);
els.rollButton.addEventListener("click", rollDice);
els.saveSettingsButton.addEventListener("click", saveMeaningFields);
els.prevMonthButton.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});
els.nextMonthButton.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});
els.promptModal.addEventListener("click", (event) => {
  if (event.target === els.promptModal) closePrompt();
});
els.settingsModal.addEventListener("click", (event) => {
  if (event.target === els.settingsModal) closeSettings();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePrompt();
    closeSettings();
  }
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && els.promptModal.classList.contains("is-open")) {
    rollDice();
  }
});

render();
