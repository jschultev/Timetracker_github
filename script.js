//Seiten bei Entries
  let currentPage = 1;
  const entriesPerPage = 30;

  function renderPaginationControls(totalEntries) {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const paginationContainer = document.getElementById('paginationControls');
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  paginationContainer.innerHTML = `
  <div class="pagination-wrapper">
    <div class="pagination-jump">
      Gehe zu Seite: 
      <input type="number" id="pageJumpInput" min="1" max="${totalPages}" placeholder="#" 
             onkeydown="if(event.key==='Enter'){jumpToPage(${totalPages});}" 
             onblur="jumpToPage(${totalPages})"/>
    </div>

    <div class="pagination-buttons">
      <button class="pagination-btn" onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>
        &laquo; Erste
      </button>
      <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        &lsaquo; Vorherige
      </button>

      <span class="pagination-info">Seite ${currentPage} von ${totalPages}</span>

      <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        Nächste &rsaquo;
      </button>
      <button class="pagination-btn" onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
        Letzte &raquo;
      </button>
    </div>
  </div>
`;

}

function jumpToPage(totalPages) {
  const input = document.getElementById('pageJumpInput');
  let pageNum = parseInt(input.value, 10);

  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
    currentPage = pageNum;
    updateEntries();
  } else {
    input.value = '';  // Reset bei ungültiger Eingabe
  }
}


function changePage(pageNum) {
  currentPage = pageNum;
  updateEntries();
}


  function customConfirm(message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  const text = document.getElementById('confirmText');
  const cancelBtn = document.getElementById('confirmCancel');
  const okBtn = document.getElementById('confirmOK');

  text.textContent = message;
  modal.style.display = 'flex';

  cancelBtn.onclick = () => {
    closeConfirmModal(); // ✅ benutzt die zentrale Cleanup-Logik
  };

  okBtn.onclick = () => {
    closeConfirmModal(); // ✅ Modal sauber schließen
    onConfirm();         // ✅ Aktion ausführen
  };

  setupClickOutsideClose('confirmModal', '#confirmModal > div', closeConfirmModal);
}



  function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  modal.style.display = 'none';

  const cancelBtn = document.getElementById('confirmCancel');
  const okBtn = document.getElementById('confirmOK');

  cancelBtn.onclick = null;
  okBtn.onclick = null;

  if (outsideClickHandlers['confirmModal']) {
    document.removeEventListener('click', outsideClickHandlers['confirmModal']);
    outsideClickHandlers['confirmModal'] = null;
  }
  justClosedModal = true;
setTimeout(() => { justClosedModal = false; }, 50);

}



function showMessage(text, type = 'info') {
  const box = document.getElementById('messageBox');
  box.innerHTML = text;

  const colors = {
    success: '#4CAF50',  // grün
    error: '#f44336',    // rot
    warning: '#ff9800',  // orange
    info: '#333'         // grau
  };

  box.style.background = colors[type] || colors.info;

  box.style.display = 'block';
  box.style.opacity = '0';
  box.style.transform = 'translate(-50%, -50%) scale(0.9)';

  // Animation rein (opacity + pop)
  setTimeout(() => {
    box.style.opacity = '1';
    box.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);

  // Nach 2 Sekunden ausblenden
  setTimeout(() => {
    box.style.opacity = '0';
    box.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => {
      box.style.display = 'none';
    }, 300);
  }, 2000);
}


window.data = [];

window.categories = {
  "Fluid Dynamics": "#1F77B4",    // kühles Blau – technisch & dynamisch
  "SML": "#D62728",               // kräftiges Rot – signalstark und präsent
  "Quantum Mechanics": "#9467BD",// violett – ein bisschen mystisch, passend zum Thema
  "WuF": "#2CA02C",               // sattes Grün – frisch & verständlich
  "Thermo II": "#FF7F0E",         // warmes Orange – energiegeladen
  "Thermo III": "#8C564B"         // erdiges Braun – tiefer, ernster Stoff
};

  let lastManualDate = null;

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

  function switchSection(id) {
    // Merke Datum, wenn wir "Manuelle Eingabe" verlassen
    const wasManual = document.getElementById('manual').classList.contains('active');
    if (wasManual) {
      const current = document.getElementById('dateInput')?.value;
      if (current) lastManualDate = current;
    }

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#tabs button').forEach(b => b.classList.remove('active-tab'));
    document.getElementById(id).classList.add('active');
    document.getElementById(`tab-${id}`).classList.add('active-tab');

    if (id === 'manual') {
      document.getElementById('dateInput').value = lastManualDate || formatDate(new Date());
    }

    if (id === 'entries') updateEntries();
    if (id === 'overview') renderOverview();
  }

  document.addEventListener('DOMContentLoaded', () => {
    populateAllCategorySelects();
    populateOverviewCategoryFilter();

    document.getElementById('dateInput').value = formatDate(new Date());

    document.getElementById('manualForm').addEventListener('submit', e => {
      e.preventDefault();
      if (!auth.currentUser) {
        showMessage("Nicht eingeloggt – Eintrag wird nicht gespeichert.", "warning");
        return; // ⛔ Bricht die gesamte Funktion ab
      }
      const date = document.getElementById('dateInput').value;
      const startTime = document.getElementById('startTimeInput').value;
      const endTime = document.getElementById('endTimeInput').value;
      const start = new Date(`${date}T${startTime}`);
let end = new Date(`${date}T${endTime}`);
let crossedMidnight = false;

if (end <= start) {
  end.setDate(end.getDate() + 1);
  crossedMidnight = true;
}

const category = window.selectedCategory;
if (!category) {
  showMessage("Bitte eine Kategorie auswählen.", "warning");
  return;
}
const color = categories[category];
const description = document.getElementById('descriptionInput').value;

if (crossedMidnight) {
  // Teilt bei Mitternacht
  const midnight = new Date(start);
  midnight.setHours(24, 0, 0, 0); // erzeugt 00:00 des nächsten Tages

  const duration1 = (midnight - start) / (1000 * 60 * 60);
  const duration2 = (end - midnight) / (1000 * 60 * 60);

  const nextDate = formatDate(new Date(start.getTime() + 24 * 60 * 60 * 1000)); // sicher korrektes Datum
  const endTimeFormatted = end.toTimeString().slice(0, 5);

  // Teil 1: am ursprünglichen Tag (z. B. 22:00 – 00:00)
  data.push({
    date,
    startTime,
    endTime: '00:00',
    duration: duration1,
    category,
    color,
    description
  });

  // Teil 2: am nächsten Tag (z. B. 00:00 – 02:00)
  data.push({
    date: nextDate,
    startTime: '00:00',
    endTime: endTimeFormatted,
    duration: duration2,
    category,
    color,
    description
  });
} else {
  const duration = (end - start) / (1000 * 60 * 60);
  data.push({ date, startTime, endTime, duration, category, color, description });
}

if (auth.currentUser) saveEntries(auth.currentUser.uid);

document.getElementById('descriptionInput').value = '';
document.getElementById('startTimeInput').value = '';
document.getElementById('endTimeInput').value = '';
document.getElementById('durationInput').value = '';

showMessage("Eintrag gespeichert.", "success");
updateCategoryOptions();



    });
    updateOverviewDateInput();
    updateEntryDateInput();
    document.getElementById('startTimeInput').addEventListener('input', () => {
      updateDurationAndEndTime('end');
    });
    document.getElementById('endTimeInput').addEventListener('input', () => {
      updateDurationAndEndTime('end');
    });
    document.getElementById('durationInput').addEventListener('input', () => {
      updateDurationAndEndTime('duration');
    });
    setOverviewFilter('week');

    document.getElementById('editStart').addEventListener('input', () => {
      updateEditDurationAndEndTime('end');
    });
    document.getElementById('editEnd').addEventListener('input', () => {
      updateEditDurationAndEndTime('end');
    });
    document.getElementById('editDuration').addEventListener('input', () => {
      updateEditDurationAndEndTime('duration');
    });
  });

  function updateCategoryOptions() {
  const category = window.currentEntryCategory || 'Alle';

  sel.innerHTML = '<option value="Alle">Alle</option>';

  Object.entries(window.categories || {}).forEach(([cat, color]) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    opt.style.color = color;
    sel.appendChild(opt);
  });

  // 🆕 Auch für Übersicht befüllen
  populateOverviewCategoryFilter();
}


//alles ab hier zu "Dauer"
  function timeToDecimal(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m / 60);
}

function decimalToTime(dec) {
  const totalMinutes = Math.round(dec * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function updateDurationAndEndTime(source = '') {
  const startStr = document.getElementById('startTimeInput').value;
  const endStr = document.getElementById('endTimeInput').value;
  const durationField = document.getElementById('durationInput');

  if (!startStr) return;

  const start = timeToDecimal(startStr);

  if (source === 'end' && endStr) {
    const end = timeToDecimal(endStr);
    let diff = end - start;
    if (diff < 0) diff += 24;
    durationField.value = decimalToTime(diff);
  }

  if (source === 'duration' && durationField.value) {
    const duration = timeToDecimal(durationField.value);
    const endDecimal = (start + duration) % 24;
    document.getElementById('endTimeInput').value = decimalToTime(endDecimal);
  }
}

let stopwatchInterval = null;
  let stopwatchStart = null;
  let editingIndex = null;

  function updateEntryDateInput() {
  const type = document.getElementById('entryDateFilterType').value;
  const container = document.getElementById('entryDateInputContainer');
  const today = new Date();

  let inputField = '';

if (type === 'day') {
  const t = formatDate(today);
  inputField = `<input type="date" id="entryDateSingle" value="${t}" onchange="updateEntries()">`;
} else if (type === 'week') {
  const w = getISOWeek(today);
  const wval = `${today.getFullYear()}-W${String(w).padStart(2,'0')}`;
  inputField = `<input type="week" id="entryDateSingle" value="${wval}" onchange="updateEntries()">`;
} else if (type === 'month') {
  const m = today.toISOString().slice(0, 7);
  inputField = `<input type="month" id="entryDateSingle" value="${m}" onchange="updateEntries()">`;
} else if (type === 'year') {
  const y = today.getFullYear();
  inputField = `<input type="number" id="entryDateSingle" value="${y}" min="2000" max="2100" onchange="updateEntries()">`;
}

if (type === 'none') {
  container.innerHTML = '';
} else {
  container.innerHTML = `<div class="date-range-inline"><label>Zeitraum: ${inputField}</label></div>`;
}

  updateEntries(); // direkt aktualisieren
}
  
  function toggleStopwatch() {
    if (!auth.currentUser) {
    showMessage("Nicht eingeloggt – du kannst die Stoppuhr nicht starten.", "warning");
    return;
    }
    const btn = document.getElementById('stopwatchButton');
    if (stopwatchInterval) {
      //Überprüfe ob Kategorie Ausgewählt bevor man stoppt
      const category = window.selectedStopwatchCategory;
      if (!category) {
        showMessage("Bitte eine Kategorie auswählen.", "warning");
        return;
      }
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
      const end = new Date();
      let duration = (end - stopwatchStart) / 1000 / 60 / 60;
        if (duration < 1 / 60) {
          duration = 1 / 60; // mindestens 1 Minute
        }
      const startTime = stopwatchStart.toTimeString().substring(0,5);
      const endTime = end.toTimeString().substring(0,5);
      const date = formatDate(stopwatchStart);
      const color = categories[category];
      const description = document.getElementById('stopwatchDescription').value;
  
      /*Stoppuhr danach überprüfen*/
      /*if (!auth.currentUser) {
        showMessage("Nicht eingeloggt – Eintrag wird nicht gespeichert.");
        btn.textContent = 'Start';
        document.getElementById('stopwatchDisplay').textContent = '00:00:00';
        document.getElementById('stopwatchDescription').value = '';

        stopwatchInterval && clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchStart = null;
        return; // ⛔ Funktion beenden!
      }
      */
      data.push({ date, startTime, endTime, duration, category, color, description });
      saveEntries(auth.currentUser.uid);
  
      btn.textContent = 'Start';
      document.getElementById('stopwatchDisplay').textContent = '00:00:00';
      document.getElementById('stopwatchDescription').value = '';
      renderOverview();
      updateEntries();
      showMessage("Stoppuhr-Eintrag gespeichert.", "success");
    } else {
      stopwatchStart = new Date();
      btn.textContent = 'Stop';
      stopwatchInterval = setInterval(() => {
        const diff = new Date(new Date() - stopwatchStart);
        const h = String(diff.getUTCHours()).padStart(2, '0');
        const m = String(diff.getUTCMinutes()).padStart(2, '0');
        const s = String(diff.getUTCSeconds()).padStart(2, '0');
        document.getElementById('stopwatchDisplay').textContent = `${h}:${m}:${s}`;
      }, 1000);
    }
  }

  function formatDisplayDate(dateStr) {
  if (!dateStr || !dateStr.includes("-")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}
  
  function updateEntries() {
    if (!window.data) {
  console.warn("updateEntries(): window.data fehlt – wird initialisiert.");
  window.data = [];
}

    const category = window.currentEntryCategory || 'Alle';
    const container = document.getElementById('entriesList');
    let filtered = [...data];

    filtered.sort((a, b) => {
  if (!a.date || !b.date) return 0;
  if (a.date !== b.date) {
    return b.date.localeCompare(a.date);
  }
  if (!a.startTime || !b.startTime) return 0;
  return b.startTime.localeCompare(a.startTime);
});
  
    if (category !== 'Alle') {
      filtered = filtered.filter(e => e.category === category);
    }

    const type = document.getElementById('entryDateFilterType').value;
    const dateInput = document.getElementById('entryDateSingle');

if (type !== 'none' && dateInput) {
  const val = dateInput.value;

  if (type === 'day') {
    filtered = filtered.filter(e => e.date === val);
  } else if (type === 'week') {
    const [year, week] = val.split('-W');
    const start = getISOWeekStart(parseInt(week), parseInt(year));
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    filtered = filtered.filter(e => {
      const entryDate = new Date(e.date + "T00:00:00");
      return entryDate >= start && entryDate < end;
    });
  } else if (type === 'month') {
    filtered = filtered.filter(e => e.date.startsWith(val));
  } else if (type === 'year') {
    filtered = filtered.filter(e => e.date.startsWith(val));
  }
}

  // Pagination Berechnung
  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  currentPage = Math.min(currentPage, totalPages) || 1;
  const paginatedEntries = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

    if (paginatedEntries.length === 0) {
      container.innerHTML = '<p>Keine Einträge gefunden.</p>';
      document.getElementById('paginationControls').innerHTML = '';
      return;
    }
  
    let html = '<table><thead><tr><th>Datum</th><th>Start</th><th>Ende</th><th>Kategorie</th><th>Beschreibung</th><th>Aktion</th></tr></thead><tbody>';

paginatedEntries.forEach((e, idx) => {
  const originalIndex = data.indexOf(e);
  html += `<tr>
    <td>${formatDisplayDate(e.date)}</td>
    <td>${e.startTime}</td>
    <td>${e.endTime}</td>
    <td style="color:${categories[e.category]}">${e.category}</td>
    <td>${e.description || ''}</td>
    <td>
      <div class="entry-actions">
        <button onclick="openEditModal(${originalIndex})" class="entry-btn">🖊️ Bearbeiten</button>
        <button onclick="deleteEntry(${originalIndex})" class="entry-btn">🗑️ Löschen</button>
      </div>
    </td>
  </tr>`;
});

html += '</tbody></table>';

container.innerHTML = html;

renderPaginationControls(totalEntries);
}
  
  let currentEditOriginalCategory = null; // ganz oben global

function openEditModal(index) {
  editingIndex = index;
  const e = data[index];

  currentEditOriginalCategory = e.category; // ✅ merken!
  window.selectedEditCategory = e.category;

  document.getElementById('editDate').value = e.date;
  document.getElementById('editStart').value = e.startTime;
  document.getElementById('editEnd').value = e.endTime;
  document.getElementById('editDescription').value = e.description || '';
  document.getElementById('editCategorySelected').textContent = e.category;
  document.getElementById('editCategorySelected').style.color = categories[e.category];
  document.getElementById('editModal').style.display = 'block';
  setupClickOutsideClose('editModal', '#editModal', closeEditModal);

}

  
function closeEditModal() {
  editingIndex = null;
  window.selectedEditCategory = currentEditOriginalCategory;
  currentEditOriginalCategory = null;
  document.getElementById('editModal').style.display = 'none';

  if (outsideClickHandlers['editModal']) {
    document.removeEventListener('click', outsideClickHandlers['editModal']);
    outsideClickHandlers['editModal'] = null;
  }
}


  
  function saveEdit() {
    const date = document.getElementById('editDate').value;
    const start = document.getElementById('editStart').value;
    const end = document.getElementById('editEnd').value;
    const category = window.selectedEditCategory;
    if (!category) {
  showMessage("Bitte eine Kategorie auswählen.", "warning");
  return;
}
    const color = categories[category];
    const desc = document.getElementById('editDescription').value;
  
    const startDate = new Date(`${date}T${start}`);
    let endDate = new Date(`${date}T${end}`);
    if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);
    const duration = (endDate - startDate) / 1000 / 60 / 60;
  
    data[editingIndex] = { date, startTime: start, endTime: end, duration, category, color, description: desc };
    if (auth.currentUser) {
      saveEntries(auth.currentUser.uid);
    } else {
      showMessage("Nicht eingeloggt – Änderungen werden nicht gespeichert.", "warning");
    }
    closeEditModal();
    updateEntries();
    renderOverview();
    showMessage("Eintrag bearbeitet", "warning");
  }
  
  function deleteEntry(index) {
  customConfirm("Eintrag wirklich löschen?", () => {
    data.splice(index, 1);

    if (auth.currentUser) {
      saveEntries(auth.currentUser.uid);
    } else {
      showMessage("Nicht eingeloggt – Änderungen werden nicht gespeichert.", "warning");
    }

    closeEditModal();
    updateEntries();
    renderOverview();
    showMessage("Eintrag gelöscht", "warning");
  });
}

// Gibt den Montag der ISO-Woche zurück
function getISOWeekStart(week, year) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const daysToMonday = jan4.getUTCDay() === 0 ? 6 : jan4.getUTCDay() - 1;
  const firstMonday = new Date(jan4);
  firstMonday.setUTCDate(jan4.getUTCDate() - daysToMonday);
  
  const monday = new Date(firstMonday);
  monday.setUTCDate(firstMonday.getUTCDate() + (week - 1) * 7);
  monday.setUTCHours(0, 0, 0, 0);
  
  return monday;
}


    
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
    
function updateOverviewDateInput() {
  const filter = window.currentOverviewFilter || 'week';
  const input = document.getElementById('overviewDate');
  const weekNav = document.getElementById('weekNav');
  const today = new Date();

  input.style.display = 'inline-block';
  weekNav.style.display = (filter === 'week') ? 'block' : 'none';

  if (filter === 'day') {
    input.type = 'date';
    input.value = formatDate(today);
  } else if (filter === 'week') {
    input.type = 'week';

    // Korrekte UTC-basierte Wochenberechnung
    const baseDate = new Date();
    baseDate.setUTCDate(baseDate.getUTCDate() + currentWeekOffset * 7);

    const weekNumber = getISOWeek(baseDate);
    const year = baseDate.getUTCFullYear();
    input.value = `${year}-W${String(weekNumber).padStart(2, '0')}`;

    const monday = getISOWeekStart(weekNumber, year); // Korrekt UTC-Montag
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6); // Exakt UTC-Sonntag

    const mondayStr = formatDisplayDate(formatDate(monday));
    const sundayStr = formatDisplayDate(formatDate(sunday));

    weekNav.innerHTML = `
      <button onclick="changeWeek(-1)">&#8592;</button>
      <span>Woche vom ${mondayStr} bis ${sundayStr}</span>
      <button onclick="changeWeek(1)">&#8594;</button>
    `;
  } else if (filter === 'month') {
    input.type = 'month';
    input.value = today.toISOString().slice(0, 7);
  } else if (filter === 'year') {
    input.type = 'number';
    input.min = 2000;
    input.max = 2100;
    input.value = today.getUTCFullYear();
  }
}




    
function renderOverview() {
  const filter = window.currentOverviewFilter || 'week';
  const input = document.getElementById('overviewDate');
  if (!input || !input.value) return;

  // 🧹 Chart-Container löschen, damit kein altes Balkendiagramm bei Monat bleibt
const oldBarContainer = document.getElementById('overviewBarChartContainer');
if (oldBarContainer) oldBarContainer.remove();

  let filtered = [];

  if (filter === 'day') {
    filtered = data.filter(e => e.date === input.value);
  } else if (filter === 'week') {
    const [yearStr, weekStr] = input.value.split('-W');
    const start = getISOWeekStart(parseInt(weekStr), parseInt(yearStr));
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    filtered = data.filter(e => {
        const [y, m, d] = e.date.split('-').map(Number);
        const entryDate = new Date(Date.UTC(y, m - 1, d));
      return entryDate >= start && entryDate < end;
    });
  } else if (filter === 'month') {
    filtered = data.filter(e => e.date.startsWith(input.value));
  } else if (filter === 'year') {
    filtered = data.filter(e => e.date.startsWith(input.value));
  } else {
    filtered = [...data];
  }

  if (window.currentOverviewCategory && window.currentOverviewCategory !== 'Alle') {
  filtered = filtered.filter(e => e.category === window.currentOverviewCategory);
}


  const ctx = document.getElementById('overviewChart').getContext('2d');
  if (window.overviewChartInstance) window.overviewChartInstance.destroy();

  const summary = {};
  for (let entry of filtered) {
    if (!summary[entry.category]) summary[entry.category] = { duration: 0, color: categories[entry.category] || "#999" };
    summary[entry.category].duration += entry.duration;
  }

  const tableLabels = Object.keys(summary);
  let totalDuration = 0;
  let tableRows = '';

  tableLabels.forEach(label => {
    const duration = summary[label].duration;
    totalDuration += duration;
    const h = Math.floor(duration);
    const m = Math.round((duration - h) * 60);
    tableRows += `<tr><td style="color: ${summary[label].color}">${label}</td><td>${h}h ${m}min</td></tr>`;
  });

  const totalH = Math.floor(totalDuration);
  const totalM = Math.round((totalDuration - totalH) * 60);

  const summaryTableHTML = `
    <table>
      <thead><tr><th>Kategorie</th><th>Zeit</th></tr></thead>
      <tbody>
        <tr><td><strong>Gesamt</strong></td><td><strong>${totalH}h ${totalM}min</strong></td></tr>
        ${tableRows}
      </tbody>
    </table>
  `;
  const summaryDiv = document.getElementById('overviewSummaryTable');
  if (summaryDiv) summaryDiv.innerHTML = summaryTableHTML;

  // Doughnut-Chart
  const labels = Object.keys(summary);
  const durations = labels.map(k => summary[k].duration);
  const colors = labels.map(k => summary[k].color);

  window.overviewChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: durations,
        backgroundColor: colors,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Zeitaufteilung' },
        tooltip: {
          callbacks: {
            label: ctx => {
              const d = ctx.parsed;
              const h = Math.floor(d);
              const m = Math.round((d - h) * 60);
              return `${ctx.label}: ${h}h ${m}min`;
            }
          }
        }
      }
    }
  });

  // NEU: Bar Chart (außer bei Monat)
  if (filter !== 'month') {
    renderOverviewBarChart(filtered, filter);
  }

  // Timeline-Tabelle
  const timelineDiv = document.getElementById('overviewTimelineTable');
  let timelineHTML = '';

  const formatTime = (dec) => {
    const h = Math.floor(dec);
    const m = Math.round((dec - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const groupAndFormat = (grouped) => {
    return Object.entries(grouped)
      .map(([cat, dur]) => `<span style="color:${summary[cat]?.color || '#000'}">${cat}: ${formatTime(dur)}</span>`)
      .join(' | ');
  };

  if (filter === 'day') {
    const intervals = Array.from({ length: 12 }, (_, i) => ({
      start: i * 2,
      label: `${String(i * 2).padStart(2, '0')}:00 – ${String(i * 2 + 2).padStart(2, '0')}:00`
    }));

    timelineHTML += '<table><thead><tr><th class="zeitraum">Zeitraum</th><th>Details</th></tr></thead><tbody>';
    intervals.forEach(interval => {
      const grouped = {};
      filtered.forEach(e => {
        
  const start = new Date(`${e.date}T${e.startTime}`);
  const end = new Date(`${e.date}T${e.endTime}`);
// ➕ Falls der Eintrag über Mitternacht geht → nächsten Tag hinzufügen
if (end <= start) {
  end.setDate(end.getDate() + 1);
}
  const intervalStart = new Date(start);
  intervalStart.setHours(interval.start, 0, 0, 0);
  const intervalEnd = new Date(intervalStart);
  intervalEnd.setHours(interval.start + 2, 0, 0, 0);

  const overlapStart = start > intervalStart ? start : intervalStart;
  const overlapEnd = end < intervalEnd ? end : intervalEnd;

  if (overlapStart < overlapEnd) {
    const overlapHours = (overlapEnd - overlapStart) / (1000 * 60 * 60);
    grouped[e.category] = (grouped[e.category] || 0) + overlapHours;
  }
});



      timelineHTML += `<tr><td>${interval.label}</td><td>${Object.keys(grouped).length ? groupAndFormat(grouped) : 'Keine Einträge'}</td></tr>`;
    });
    timelineHTML += '</tbody></table>';

  } else if (filter === 'week') {
    const days = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
    const [yearStr, weekStr] = input.value.split('-W');
    const start = getISOWeekStart(parseInt(weekStr), parseInt(yearStr));

    timelineHTML += '<table><thead><tr><th class="wochentag">Wochentag</th><th class="datum">Datum</th><th>Details</th></tr></thead><tbody>';
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = formatDate(d);
      const dayName = days[d.getDay()];
      const dateStr = formatDisplayDate(iso);
      const grouped = {};
      filtered.forEach(e => {
        if (e.date === iso) {
          grouped[e.category] = (grouped[e.category] || 0) + e.duration;
        }
      });
      timelineHTML += `<tr>
        <td class="wochentag">${dayName}</td>
        <td class="datum">${dateStr}</td>
        <td>${Object.keys(grouped).length ? groupAndFormat(grouped) : 'Keine Einträge'}</td>
      </tr>`;
    }
    timelineHTML += '</tbody></table>';

  } else if (filter === 'year') {
    const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    const yearVal = input.value;

    timelineHTML += '<table><thead><tr><th class="zeitraum">Monat</th><th>Details</th></tr></thead><tbody>';
    for (let m = 0; m < 12; m++) {
      const monthStr = `${yearVal}-${String(m + 1).padStart(2, '0')}`;
      const label = months[m];
      const grouped = {};
      filtered.forEach(e => {
        if (e.date.startsWith(monthStr)) {
          grouped[e.category] = (grouped[e.category] || 0) + e.duration;
        }
      });
      timelineHTML += `<tr><td>${label}</td><td>${Object.keys(grouped).length ? groupAndFormat(grouped) : 'Keine Einträge'}</td></tr>`;
    }
    timelineHTML += '</tbody></table>';
  }

  timelineDiv.innerHTML = timelineHTML;
}


    function renderOverviewBarChart(filtered, filter) {
  const containerId = 'overviewBarChartContainer';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style = 'height: 400px; max-width: 900px; margin: 2em auto;';
    const timelineDiv = document.getElementById('overviewTimelineTable');
overview.insertBefore(container, timelineDiv);
  }
  container.innerHTML = '<canvas id="overviewBarChart"></canvas>';
  const ctx = document.getElementById('overviewBarChart').getContext('2d');

  if (window.overviewBarChartInstance) {
    window.overviewBarChartInstance.destroy();
  }

  const categorySet = new Set(filtered.map(e => e.category));
const categoryList = Array.from(categorySet);

const categoryColors = window.categories || {}; // ← hier holst du die Farbtabelle

let labels = [];
let datasets = categoryList.map(cat => ({
  label: cat,
  data: [],
  backgroundColor: categoryColors[cat] || '#888'
}));


  if (filter === 'day') {
    for (let i = 0; i < 24; i += 2) {
      labels.push(`${String(i).padStart(2, '0')}-${String(i + 2).padStart(2, '0')}`);
    }
    datasets.forEach(ds => ds.data = new Array(labels.length).fill(0));
    filtered.forEach(e => {
      const start = timeToDecimal(e.startTime);
      const end = timeToDecimal(e.endTime);
      let s = start;
      let eDec = end < start ? end + 24 : end;
      for (let i = 0; i < labels.length; i++) {
        const blockStart = i * 2;
        const blockEnd = blockStart + 2;
        const overlap = Math.max(0, Math.min(eDec, blockEnd) - Math.max(s, blockStart));
        if (overlap > 0) {
          const ds = datasets.find(d => d.label === e.category);
          ds.data[i] += overlap;
        }
      }
    });

} else if (filter === 'week') {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const [year, week] = document.getElementById('overviewDate').value.split('-W').map(Number);
const weekStart = getISOWeekStart(week, year);

// Labels setzen
labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
datasets.forEach(ds => ds.data = new Array(7).fill(0));

// Zuordnung pro Tag (Differenz in Tagen zur Woche)
filtered.forEach(e => {
    const entryDateStr = e.date;
const entryDateParts = entryDateStr.split('-').map(Number);
const entryDateObj = new Date(entryDateParts[0], entryDateParts[1] - 1, entryDateParts[2]);
// Setze Uhrzeit explizit auf Mitternacht (lokal)
entryDateObj.setHours(0, 0, 0, 0);

const weekStartCopy = new Date(weekStart); // sicherstellen, dass wir nichts verändern
weekStartCopy.setHours(0, 0, 0, 0);

entryDateObj.setHours(0, 0, 0, 0);
weekStart.setHours(0, 0, 0, 0);

for (let i = 0; i < 7; i++) {
  const day = new Date(weekStart);
  day.setDate(weekStart.getDate() + i);
  day.setHours(0, 0, 0, 0);

  if (entryDateObj.getTime() === day.getTime()) {
    const ds = datasets.find(d => d.label === e.category);
    ds.data[i] += e.duration;
  }
}
});

}
 else if (filter === 'year') {
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    labels = months;
    datasets.forEach(ds => ds.data = new Array(12).fill(0));
    filtered.forEach(e => {
      const d = new Date(e.date);
      const m = d.getMonth();
      const ds = datasets.find(d => d.label === e.category);
      ds.data[m] += e.duration;
    });
  }

  window.overviewBarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            callback: value => {
              const h = Math.floor(value);
              const m = Math.round((value - h) * 60);
              return `${h}h ${m}min`;
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false // ← einfach & sicher
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const d = ctx.parsed.y;
              const h = Math.floor(d);
              const m = Math.round((d - h) * 60);
              return `${ctx.dataset.label}: ${h}h ${m}min`;
            }
          }
        },
        title: {
          display: true,
          text: 'Zeitverteilung (Balkendiagramm)'
        }
      }
    }
  });
}


    
    let currentWeekOffset = 0;

function setOverviewFilter(type) {
  window.currentOverviewFilter = type;
  currentWeekOffset = 0; // Reset wenn Filter geändert wird

  document.querySelectorAll('#overviewTabs button').forEach(btn => {
    btn.classList.remove('active-overview');
  });
  document.getElementById(`btn-filter-${type}`).classList.add('active-overview');

  updateOverviewDateInput();
  renderOverview();
}

function updateOverviewCategory() {
  const sel = document.getElementById('overviewCategoryFilter');
  window.currentOverviewCategory = sel.value;
  renderOverview(); // ⬅️ neu rendern!
}

function populateOverviewCategoryFilter() {
  const sel = document.getElementById('overviewCategoryFilter');
  if (!sel) return;

  sel.innerHTML = '<option value="Alle">Alle</option>';

  // Hole aus window.categories dynamisch
  if (window.categories) {
    Object.entries(window.categories).forEach(([cat, color]) => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      opt.style.color = color;
      sel.appendChild(opt);
    });
  }
}



function changeWeek(offset) {
  currentWeekOffset += offset;

  const input = document.getElementById('overviewDate');
  const current = new Date();
  current.setDate(current.getDate() + currentWeekOffset * 7);

  const week = getISOWeek(current);
  const year = current.getFullYear();
  input.value = `${year}-W${String(week).padStart(2, '0')}`;

  updateOverviewDateInput();
  renderOverview();
}

function updateEditDurationAndEndTime(source = '') {
  const startStr = document.getElementById('editStart').value;
  const endStr = document.getElementById('editEnd').value;
  const durationField = document.getElementById('editDuration');

  if (!startStr) return;

  const start = timeToDecimal(startStr);

  if (source === 'end' && endStr) {
    const end = timeToDecimal(endStr);
    let diff = end - start;
    if (diff < 0) diff += 24;
    durationField.value = decimalToTime(diff);
  }

  if (source === 'duration' && durationField.value) {
    const duration = timeToDecimal(durationField.value);
    const endDecimal = (start + duration) % 24;
    document.getElementById('editEnd').value = decimalToTime(endDecimal);
  }
}



const originalOpenEditModal = openEditModal;
openEditModal = function(index) {
  originalOpenEditModal(index);
  const e = data[index];
  document.getElementById('editDuration').value = decimalToTime(e.duration);
};

const originalSaveEdit = saveEdit;
saveEdit = function() {
  const durationInput = document.getElementById('editDuration').value;
  if (durationInput) {
    const duration = timeToDecimal(durationInput);
    if (duration > 0) {
      const start = document.getElementById('editStart').value;
      const date = document.getElementById('editDate').value;
      const endDecimal = (timeToDecimal(start) + duration) % 24;
      document.getElementById('editEnd').value = decimalToTime(endDecimal);
    }
  }
  originalSaveEdit();
};

function toggleLoginModal() {
  const modal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const loggedInInfo = document.getElementById('loggedInInfo');
  const userEmail = document.getElementById('userEmail');

  if (modal.style.display === 'block') {
    modal.style.display = 'none';

    // 🧼 Entferne Click-Outside-Listener hier!
    if (outsideClickHandlers['loginModal']) {
      document.removeEventListener('click', outsideClickHandlers['loginModal']);
      outsideClickHandlers['loginModal'] = null;
    }

    return;
  }

  modal.style.display = 'block';

  if (auth.currentUser) {
    loginForm.style.display = 'none';
    loggedInInfo.style.display = 'block';
    userEmail.innerHTML = `Eingeloggt als:<br><br><strong>${auth.currentUser.email}</strong>`;
  } else {
    loginForm.style.display = 'block';
    loggedInInfo.style.display = 'none';
    userEmail.textContent = '';
  }

  // ✅ Nur beim Öffnen registrieren
  setupClickOutsideClose('loginModal', '#loginContent', toggleLoginModal);
}


function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePasswordBtn");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    toggleBtn.textContent = "Show";
  }
}


/*Kategorien Funktionen*/

document.getElementById('openCategoryModal').addEventListener('click', () => {
  document.getElementById('categorySearch').value = '';
  renderCategoryList();
  document.getElementById('categoryModal').style.display = 'flex';
  setupClickOutsideClose('categoryModal', '#categoryModal > div', closeCategoryModal);
});




function closeCategoryModal() {
  document.getElementById('categoryModal').style.display = 'none';
  if (outsideClickHandlers['categoryModal']) {
    document.removeEventListener('click', outsideClickHandlers['categoryModal']);
    outsideClickHandlers['categoryModal'] = null;
  }
}


function openNewCategoryModal() {
  if (!auth.currentUser) {
    showMessage("Nicht eingeloggt – Kategorie wird nicht gespeichert.", "warning");
    return;
  }

  document.getElementById('newCategoryModal').style.display = 'flex';
  setupClickOutsideClose('newCategoryModal', '#newCategoryModal > div', closeNewCategoryModal);
}




function closeNewCategoryModal() {
  document.getElementById('newCategoryModal').style.display = 'none';
  document.getElementById('newCategoryName').value = '';
  document.getElementById('newCategoryHex').value = '#888888';
  document.getElementById('newCategoryColor').value = '#888888';

  if (outsideClickHandlers['newCategoryModal']) {
    document.removeEventListener('click', outsideClickHandlers['newCategoryModal']);
    outsideClickHandlers['newCategoryModal'] = null;
  }

  justClosedModal = true;
  setTimeout(() => { justClosedModal = false; }, 50);
}





function syncColorInputsFromPicker() {
  const picker = document.getElementById('newCategoryColor');
  const hex = document.getElementById('newCategoryHex');
  hex.value = picker.value;
}

function syncColorInputsFromHex() {
  const picker = document.getElementById('newCategoryColor');
  const hex = document.getElementById('newCategoryHex');

  let val = hex.value.trim();
  if (!val.startsWith('#')) val = '#' + val;
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    picker.value = val;
    hex.value = val;
  }
}

document.getElementById('newCategoryColor').addEventListener('input', syncColorInputsFromPicker);
document.getElementById('newCategoryHex').addEventListener('input', syncColorInputsFromHex);


function renderCategoryList(search = '') {
  const list = document.getElementById('categoryList');
  list.innerHTML = '';

  const categories = window.categories || {};

  for (const [name, color] of Object.entries(categories)) {
    if (search && !name.toLowerCase().startsWith(search)) continue;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color: ${color}; font-weight: 500;">${name}</td>
      <td><code>${color}</code></td>
      <td class="entry-actions">
        <button class="entry-btn" onclick="editCategory('${name}')">✏️</button>
        <button class="entry-btn" onclick="window.deleteCategory('${name}')">🗑️</button>
      </td>
    `;
    list.appendChild(tr);
  }
}

document.getElementById('categorySearch').addEventListener('input', function (e) {
  const searchValue = e.target.value.toLowerCase();
  renderCategoryList(searchValue);
});



function addCategoryFromModal() {
  if (!auth.currentUser) {
        showMessage("Nicht eingeloggt – Kategorie wird nicht gespeichert.", "warning");
        return; // ⛔ Bricht die gesamte Funktion ab
      }
  const name = document.getElementById('newCategoryName').value.trim();
  const color = document.getElementById('newCategoryColor').value;

  if (!name || !color) return showMessage("Name und Farbe angeben", "warning");
  if (window.categories[name]) return showMessage("Kategorie existiert bereits", "error");

  window.addCategory(name, color);
  closeNewCategoryModal();
  renderCategoryList();
}

let currentCategoryEditing = null;

function editCategory(oldName) {
  if (!auth.currentUser) {
    showMessage("Nicht eingeloggt – Kann nicht bearbeitet werden.", "warning");
    return;
  }
  const color = window.categories[oldName];
  currentCategoryEditing = oldName;

  document.getElementById('editCategoryName').value = oldName;
  document.getElementById('editCategoryColor').value = color;
  document.getElementById('editCategoryHex').value = color;

  document.getElementById('editCategoryModal').style.display = 'flex';
  setupClickOutsideClose('editCategoryModal', '#editCategoryModal > div', closeEditCategoryModal);
}

let justClosedModal = false;

function closeEditCategoryModal() {
  currentCategoryEditing = null;
  document.getElementById('editCategoryModal').style.display = 'none';

  if (outsideClickHandlers['editCategoryModal']) {
    document.removeEventListener('click', outsideClickHandlers['editCategoryModal']);
    outsideClickHandlers['editCategoryModal'] = null;
  }

  // Schutz gegen false-positive Outside-Klicks
  justClosedModal = true;
  setTimeout(() => { justClosedModal = false; }, 50);
}




function saveEditedCategory() {
  const newName = document.getElementById('editCategoryName').value.trim();
  const newColor = document.getElementById('editCategoryColor').value;

  if (!currentCategoryEditing || !newName || !newColor) return;

  if (newName !== currentCategoryEditing && window.categories[newName]) {
    showMessage("Kategorie mit diesem Namen existiert bereits.", "error");
    return;
  }

  // Einträge aktualisieren, falls Name geändert wurde
  window.data = window.data.map(e =>
    e.category === currentCategoryEditing
      ? { ...e, category: newName }
      : e
  );

  // Kategorie aktualisieren
  delete window.categories[currentCategoryEditing];
  window.categories[newName] = newColor;

  if (auth.currentUser) {
    saveEntries(auth.currentUser.uid);
    saveCategories(auth.currentUser.uid)
  }

  currentCategoryEditing = null;
  renderCategoryList();
  populateAllCategorySelects();
  updateEntries();
  renderOverview();
  closeEditCategoryModal();
  showMessage("Kategorie aktualisiert.", "success");
}

// Farbfelder synchronisieren (wiederverwendbar!)
document.getElementById('editCategoryColor').addEventListener('input', () => {
  document.getElementById('editCategoryHex').value = document.getElementById('editCategoryColor').value;
});

document.getElementById('editCategoryHex').addEventListener('input', () => {
  const hex = document.getElementById('editCategoryHex');
  let val = hex.value.trim();
  if (!val.startsWith('#')) val = '#' + val;
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    document.getElementById('editCategoryColor').value = val;
    hex.value = val;
  }
});

let editModalOutsideClickHandler = null;


const outsideClickHandlers = {}; // speichert Handler pro Modal

function isVisible(id) {
  const el = document.getElementById(id);
  return el && el.style.display !== 'none';
}

function setupClickOutsideClose(modalId, contentSelector, closeFunction) {
  setTimeout(() => {
    const handler = function(event) {
      if (justClosedModal) return;
      const modal = document.getElementById(modalId);
      const content = document.querySelector(contentSelector);

      // ➕ Sonderfall nur für categoryModal
      if (modalId === 'categoryModal') {
        if (
          modal &&
          modal.style.display !== 'none' &&
          !content.contains(event.target) &&
          !isVisible('editCategoryModal') &&
          !isVisible('newCategoryModal') &&
          !isVisible('confirmModal') // ⬅️ neuer Check!
        ) {
          closeFunction();
          document.removeEventListener('click', outsideClickHandlers[modalId]);
          outsideClickHandlers[modalId] = null;
        }
      }
       else {
        // Normalfall: alle anderen Modale (new/edit) schließen sich wie gewohnt
        if (
          modal &&
          modal.style.display !== 'none' &&
          !content.contains(event.target)
        ) {
          closeFunction();
          document.removeEventListener('click', outsideClickHandlers[modalId]);
          outsideClickHandlers[modalId] = null;
        }
      }
    };

    if (outsideClickHandlers[modalId]) {
      document.removeEventListener('click', outsideClickHandlers[modalId]);
    }

    outsideClickHandlers[modalId] = handler;
    document.addEventListener('click', handler);
  }, 10);
}
