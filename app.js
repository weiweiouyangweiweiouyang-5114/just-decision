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
  historyButton: document.querySelector("#historyButton"),
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
  historyModal: document.querySelector("#historyModal"),
  closeHistoryButton: document.querySelector("#closeHistoryButton"),
  historyList: document.querySelector("#historyList"),
  historyEmpty: document.querySelector("#historyEmpty"),
  dayModal: document.querySelector("#dayModal"),
  closeDayButton: document.querySelector("#closeDayButton"),
  dayModalList: document.querySelector("#dayModalList"),
  dayModalTitle: document.querySelector("#dayModalTitle"),
  dayModalEmpty: document.querySelector("#dayModalEmpty"),
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
let selectedDate = null;

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

function activeRecords() {
  return records.filter(function (r) { return !r.deleted; });
}

function deletedRecords() {
  return records.filter(function (r) { return r.deleted; });
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

function openHistory() {
  renderHistory();
  els.historyModal.classList.add("is-open");
  els.historyModal.setAttribute("aria-hidden", "false");
}

function closeHistory() {
  els.historyModal.classList.remove("is-open");
  els.historyModal.setAttribute("aria-hidden", "true");
}

function openDayModal(dateStr) {
  var dayRecords = activeRecords().filter(function (r) { return r.date === dateStr; });
  els.dayModalTitle.textContent = dateStr;
  if (dayRecords.length === 0) {
    els.dayModalList.style.display = "none";
    els.dayModalEmpty.style.display = "block";
  } else {
    els.dayModalList.style.display = "";
    els.dayModalEmpty.style.display = "none";
    els.dayModalList.innerHTML = dayRecords
      .map(function (record) {
        return (
          '<article class="day-record-item">' +
          "<div class='day-record-head'>" +
          miniDiceHtml(record.value) +
          "<div><span>" +
          formatTime(record.createdAt) +
          "</span></div></div>" +
          "<p>" +
          escapeHtml(record.question) +
          "</p>" +
          "<small>" +
          escapeHtml(record.meaning || meanings[record.value]) +
          "</small>" +
          "<em>" +
          escapeHtml(record.encouragement || "") +
          "</em>" +
          "</article>"
        );
      })
      .join("");
  }
  els.dayModal.classList.add("is-open");
  els.dayModal.setAttribute("aria-hidden", "false");
}

function miniDiceHtml(value) {
  var dots = "";
  for (var i = 1; i <= 9; i++) dots += "<span></span>";
  return '<div class="mini-dice" data-value="' + value + '">' + dots + "</div>";
}

function closeDayModal() {
  els.dayModal.classList.remove("is-open");
  els.dayModal.setAttribute("aria-hidden", "true");
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
  var question = els.questionInput.value.trim();
  if (!question) {
    els.questionInput.focus();
    return;
  }

  var value = Math.floor(Math.random() * 6) + 1;
  var createdAt = new Date().toISOString();
  var meaning = meanings[value];
  var encouragement = randomEncouragement();

  closePrompt();
  els.decisionText.textContent = "";
  els.encouragementText.textContent = "";

  els.dice.classList.add("is-rolling");
  els.dice.dataset.value = Math.floor(Math.random() * 6) + 1;

  var tick = setInterval(function () {
    els.dice.dataset.value = Math.floor(Math.random() * 6) + 1;
  }, 120);

  setTimeout(function () {
    clearInterval(tick);
    els.dice.classList.remove("is-rolling");
    els.dice.dataset.value = value;
    els.decisionText.textContent = value + " 点：" + meaning;
    els.encouragementText.textContent = encouragement;

    records.unshift({
      id: crypto.randomUUID(),
      question: question,
      value: value,
      meaning: meaning,
      encouragement: encouragement,
      createdAt: createdAt,
      date: dateKey(new Date()),
      deleted: false,
    });

    saveRecords();
    render();
  }, 1500);
}

function randomEncouragement() {
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

function getTodayRecords() {
  const today = dateKey(new Date());
  return activeRecords().filter(function (record) { return record.date === today; });
}

function groupByDate() {
  return activeRecords().reduce(function (groups, record) {
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
    var cssClass = "calendar-day";
    if (day.getMonth() !== month) cssClass += " is-muted";
    if (key === selectedDate) cssClass += " is-selected";
    days.push(`
      <div class="${cssClass}" title="${key}，${dayRecords.length} 次" data-date="${key}">
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
  const counts = activeRecords().reduce(function (acc, record) {
    acc[record.date] = (acc[record.date] || 0) + 1;
    return acc;
  }, {});
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 83);

  var cells = [];
  var dates = [];
  for (var i = 83; i >= 0; i -= 1) {
    var day = new Date(start);
    day.setDate(start.getDate() + i);
    var key = dateKey(day);
    var count = counts[key] || 0;
    dates.push(key);
    cells.push('<span class="heat-cell" data-level="' + heatLevel(count) + '" data-date="' + key + '" title="' + key + '，摇了 ' + count + ' 次"></span>');
  }
  els.heatmap.innerHTML = cells.join("");

  els.heatmap.querySelectorAll(".heat-cell").forEach(function (cell, index) {
    cell.addEventListener("click", function () {
      var dateKey_1 = dates[index];
      selectedDate = dateKey_1;
      var parts = dateKey_1.split("-");
      visibleMonth = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      renderCalendar();
      document.querySelector(".calendar-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function heatLevel(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function renderHistory() {
  var list = deletedRecords();
  if (list.length === 0) {
    els.historyList.style.display = "none";
    els.historyEmpty.style.display = "block";
    return;
  }
  els.historyList.style.display = "";
  els.historyEmpty.style.display = "none";

  els.historyList.innerHTML = list
    .map(function (record) {
      return (
        '<article class="record-shell history-shell" data-record-id="' +
        record.id +
        '">' +
        '<button class="history-restore" type="button" aria-label="复原这条记录">复原</button>' +
        '<div class="record-card history-record-card">' +
        "<div><strong>" +
        record.value +
        "</strong><span>" +
        formatTime(record.createdAt) +
        "</span><span class='history-date'>" +
        record.date +
        "</span></div>" +
        "<p>" +
        escapeHtml(record.question) +
        "</p>" +
        "<small>" +
        escapeHtml(record.meaning || meanings[record.value]) +
        "</small>" +
        "</div>" +
        '<button class="history-delete" type="button" aria-label="永久删除这条记录">删除</button>' +
        "</article>"
      );
    })
    .join("");

  bindHistoryGestures();
}

function bindHistoryGestures() {
  els.historyList.querySelectorAll(".history-shell").forEach(function (shell) {
    var card = shell.querySelector(".history-record-card");
    var restoreBtn = shell.querySelector(".history-restore");
    var deleteBtn = shell.querySelector(".history-delete");
    var startX = 0;
    var currentX = 0;
    var pointerId = null;

    restoreBtn.addEventListener("click", function () {
      restoreRecord(shell.dataset.recordId);
    });
    deleteBtn.addEventListener("click", function () {
      permanentDeleteRecord(shell.dataset.recordId);
    });

    card.addEventListener("pointerdown", function (event) {
      startX = event.clientX;
      currentX = 0;
      pointerId = event.pointerId;
      card.setPointerCapture(pointerId);
      card.classList.add("is-dragging");
    });

    card.addEventListener("pointermove", function (event) {
      if (pointerId !== event.pointerId) return;
      currentX = event.clientX - startX;
      card.style.transform = "translateX(" + Math.max(-96, Math.min(96, currentX)) + "px)";
    });

    card.addEventListener("pointerup", function (event) {
      if (pointerId !== event.pointerId) return;
      card.releasePointerCapture(pointerId);
      if (currentX > 92) {
        restoreRecord(shell.dataset.recordId);
        return;
      }
      if (currentX < -92) {
        permanentDeleteRecord(shell.dataset.recordId);
        return;
      }
      card.classList.remove("is-dragging");
      card.style.transform = "";
      pointerId = null;
    });

    card.addEventListener("pointercancel", function () {
      card.classList.remove("is-dragging");
      card.style.transform = "";
      pointerId = null;
    });
  });
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
  var record = records.find(function (r) { return r.id === recordId; });
  if (record) {
    record.deleted = true;
    saveRecords();
    render();
  }
}

function permanentDeleteRecord(recordId) {
  records = records.filter(function (r) { return r.id !== recordId; });
  saveRecords();

  var shell = els.historyList.querySelector('.history-shell[data-record-id="' + recordId + '"]');
  if (shell) shell.remove();
  if (deletedRecords().length === 0) {
    els.historyList.style.display = "none";
    els.historyEmpty.style.display = "block";
  }
}

function restoreRecord(recordId) {
  var record = records.find(function (r) { return r.id === recordId; });
  if (!record) return;
  record.deleted = false;
  saveRecords();
  render();

  var shell = els.historyList.querySelector('.history-shell[data-record-id="' + recordId + '"]');
  if (shell) shell.remove();
  if (deletedRecords().length === 0) {
    els.historyList.style.display = "none";
    els.historyEmpty.style.display = "block";
  }
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
      if (currentX < -92) {
        deleteRecord(shell.dataset.recordId);
        return;
      }
      card.classList.remove("is-dragging");
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
els.historyButton.addEventListener("click", openHistory);
els.closePromptButton.addEventListener("click", closePrompt);
els.closeSettingsButton.addEventListener("click", closeSettings);
els.closeHistoryButton.addEventListener("click", closeHistory);
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
els.settingsModal.addEventListener("click", function (event) {
  if (event.target === els.settingsModal) closeSettings();
});
els.historyModal.addEventListener("click", function (event) {
  if (event.target === els.historyModal) closeHistory();
});
els.calendarGrid.addEventListener("click", function (event) {
  var day = event.target.closest(".calendar-day");
  if (!day) return;
  var date = day.getAttribute("data-date");
  if (date) openDayModal(date);
});
els.closeDayButton.addEventListener("click", closeDayModal);
els.dayModal.addEventListener("click", function (event) {
  if (event.target === els.dayModal) closeDayModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePrompt();
    closeSettings();
    closeHistory();
    closeDayModal();
  }
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && els.promptModal.classList.contains("is-open")) {
    rollDice();
  }
});

render();

(function () {
  var splash = document.getElementById("splash");
  if (!splash) return;
  var stage = document.getElementById("splashStage");
  var cube = document.getElementById("splashCube");
  var titleWrap = document.getElementById("splashTitleWrap");

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      stage.classList.add("is-fall");
      setTimeout(function () {
        stage.classList.add("is-settle");
      }, 850);

      setTimeout(function () {
        titleWrap.classList.add("is-show");

        var startTime = null;
        var duration = 3000;
        var startX = 15;
        var startY = 0;
        var startZ = 0;
        var totalY = 3600;

        function spin(ts) {
          if (!startTime) startTime = ts;
          var elapsed = ts - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var y = startY + totalY * progress;
          var x = startX + 40 * Math.sin(progress * Math.PI * 3);
          var z = startZ + progress * 450;
          cube.style.animation = "none";
          cube.style.transform = "rotateX(" + x + "deg) rotateY(" + y + "deg) rotateZ(" + z + "deg)";
          if (progress < 1) {
            requestAnimationFrame(spin);
          }
        }
        requestAnimationFrame(spin);
      }, 1400);

      setTimeout(function () {
        splash.classList.add("is-done");
      }, 4600);

      setTimeout(function () {
        splash.remove();
      }, 5200);
    });
  });
})();
