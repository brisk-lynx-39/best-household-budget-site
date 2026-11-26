// HomeLedger app: renders every page from the store in data.js and wires
// up every control. No network calls anywhere — all state lives in
// localStorage, all figures come from the household's own books.
//
// Each page's <body> carries data-page="dashboard|transactions|budget|
// planner|goals|reports" and app.js runs the matching renderer on load.

const MONTH_KEY = 'homeledger.month';

function currentMonth() {
  const saved = localStorage.getItem(MONTH_KEY);
  const keys = monthKeys();
  if (saved && keys.includes(saved)) return saved;
  return keys[keys.length - 1];
}

function setCurrentMonth(key) {
  localStorage.setItem(MONTH_KEY, key);
}

function shiftMonth(key, delta) {
  const keys = monthKeys();
  const index = keys.indexOf(key);
  const next = keys[index + delta];
  return next || key;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showNotice(message, isError) {
  const box = document.querySelector('.js-notice');
  if (!box) return;
  box.textContent = message;
  box.classList.toggle('error', Boolean(isError));
  box.hidden = false;
  box.scrollIntoView({ block: 'nearest' });
}

// --- Shared chrome: nav state, month switcher, reset ------------------------

function initChrome(page) {
  document.querySelectorAll('.main-nav a').forEach((link) => {
    if (link.dataset.page === page) link.classList.add('active');
  });
  const key = currentMonth();
  const label = document.querySelector('.js-month-label');
  if (label) label.textContent = monthLabel(key);
  const prev = document.querySelector('.js-month-prev');
  const next = document.querySelector('.js-month-next');
  const keys = monthKeys();
  if (prev) {
    prev.disabled = keys.indexOf(key) === 0;
    prev.addEventListener('click', () => {
      setCurrentMonth(shiftMonth(currentMonth(), -1));
      location.reload();
    });
  }
  if (next) {
    next.disabled = keys.indexOf(key) === keys.length - 1;
    next.addEventListener('click', () => {
      setCurrentMonth(shiftMonth(currentMonth(), 1));
      location.reload();
    });
  }
  document.querySelectorAll('.js-reset').forEach((button) => {
    button.addEventListener('click', () => {
      if (window.confirm('Restore the Rivera household’s original demo data? Your edits will be lost.')) {
        resetStore();
        location.reload();
      }
    });
  });
}

function categoryOptions(selected) {
  return CATEGORIES.filter((c) => c.name !== 'Savings')
    .map((c) => '<option value="' + c.name + '"' + (c.name === selected ? ' selected' : '') + '>' + c.name + '</option>')
    .join('');
}

function transactionRowHTML(row) {
  const amount = row.type === 'income'
    ? '<span class="pos">+' + money(row.amount) + '</span>'
    : '<span class="neg">−' + money(row.amount) + '</span>';
  return (
    '<tr><td>' + row.day + '</td>' +
    '<td>' + escapeHtml(row.description) + '</td>' +
    '<td><span class="cat-dot" style="background:' + categoryColor(row.category) + '"></span>' +
    escapeHtml(row.category) + '</td>' +
    '<td class="num">' + amount + '</td></tr>'
  );
}

// --- Dashboard ---------------------------------------------------------------

function renderDashboard() {
  const key = currentMonth();
  const data = loadStore();
  const totals = monthTotals(key);
  const left = totals.income - totals.spending - totals.saved;

  document.querySelector('.js-stat-income').textContent = money(totals.income);
  document.querySelector('.js-stat-spending').textContent = money(totals.spending);
  document.querySelector('.js-stat-saved').textContent = money(totals.saved);
  document.querySelector('.js-stat-left').textContent = money(left);
  const leftSub = document.querySelector('.js-stat-left-sub');
  if (leftSub) {
    leftSub.innerHTML = left >= 0
      ? 'That is <b>' + percent(left, totals.income) + '% of income</b> still unspent.'
      : 'Over by <b>' + money(-left) + '</b> — spending passed income.';
  }
  document.querySelector('.js-stat-saved-sub').textContent =
    percent(totals.saved, totals.income) + '% of income moved to savings.';

  // Donut: spending by category, biggest first.
  const byCat = spendingByCategory(key);
  const slices = Object.keys(byCat)
    .map((name) => ({ label: name, value: byCat[name], color: categoryColor(name) }))
    .sort((a, b) => b.value - a.value);
  drawDonut(
    document.querySelector('.js-donut'),
    slices,
    'Spent in ' + monthLabel(key).split(' ')[0],
    moneyShort(totals.spending),
  );
  const legend = document.querySelector('.js-legend');
  if (legend) {
    legend.innerHTML = slices.map((s) =>
      '<li><span><span class="cat-dot" style="background:' + s.color + '"></span>' +
      escapeHtml(s.label) + '</span><span class="amount">' + money(s.value) +
      ' · ' + percent(s.value, totals.spending) + '%</span></li>',
    ).join('');
  }

  // Budget progress: the five categories closest to (or over) their limit.
  const spent = byCat;
  const rows = Object.keys(data.budgets)
    .filter((name) => name !== 'Savings')
    .map((name) => ({ name, used: spent[name] || 0, limit: data.budgets[name] }))
    .sort((a, b) => b.used / b.limit - a.used / a.limit)
    .slice(0, 5);
  const budgetList = document.querySelector('.js-budget-list');
  if (budgetList) {
    budgetList.innerHTML = rows.map((row) => {
      const over = row.used > row.limit;
      return '<div class="budget-row"><div class="budget-top"><span class="name">' +
        escapeHtml(row.name) + '</span><span class="figures"><b>' + money(row.used) +
        '</b> of ' + money(row.limit) + (over ? ' · <span class="over-amount">' + money(row.used - row.limit) + ' over</span>' : '') +
        '</span></div>' + progressBarHTML(row.used, row.limit, categoryColor(row.name)) +
        '<div class="budget-meta"><span>' + percent(row.used, row.limit) + '% used</span><span>' +
        (over ? 'Over budget' : money(row.limit - row.used) + ' left') + '</span></div></div>';
    }).join('');
  }

  // Recent transactions: the eight latest by day.
  const recent = allTransactions(key).slice(-8).reverse();
  const recentBody = document.querySelector('.js-recent');
  if (recentBody) recentBody.innerHTML = recent.map(transactionRowHTML).join('');

  // Savings goals snapshot.
  const goalsBox = document.querySelector('.js-goals-snapshot');
  if (goalsBox) {
    goalsBox.innerHTML = data.goals.slice(0, 3).map((goal) =>
      '<div class="budget-row"><div class="budget-top"><span class="name">' +
      escapeHtml(goal.name) + '</span><span class="figures"><b>' + money(goal.saved) +
      '</b> of ' + money(goal.target) + '</span></div>' +
      progressBarHTML(goal.saved, goal.target, '#e8a33d') +
      '<div class="budget-meta"><span>' + percent(goal.saved, goal.target) +
      '% saved</span><span>' + money(goal.target - goal.saved) + ' to go</span></div></div>',
    ).join('');
  }

  // Quick add: a small expense straight from the dashboard.
  const form = document.querySelector('.js-quick-add');
  if (form) {
    const dateInput = form.querySelector('[name="date"]');
    dateInput.value = key + '-26';
    dateInput.min = key + '-01';
    dateInput.max = key + '-28';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = new FormData(form);
      const date = String(fields.get('date') || '');
      const day = Number(date.split('-')[2] || 26);
      const description = String(fields.get('description') || '').trim();
      const amount = Number(fields.get('amount'));
      const category = String(fields.get('category') || 'Other');
      if (!description || !(amount > 0)) {
        showNotice('Add a short description and an amount above $0.', true);
        return;
      }
      const monthKey = date.slice(0, 7);
      if (!loadStore().months[monthKey]) loadStore().months[monthKey] = { income: [], expenses: [] };
      addTransaction(monthKey, { day, description, category, amount, type: 'expense' });
      setCurrentMonth(monthKey);
      location.reload();
    });
  }
}

// --- Transactions ------------------------------------------------------------

function renderTransactions() {
  const key = currentMonth();
  const data = loadStore();
  const totals = monthTotals(key);
  const summary = document.querySelector('.js-tx-summary');
  if (summary) {
    summary.innerHTML = 'In ' + money(totals.income) + ' · out ' + money(totals.spending) +
      ' · saved ' + money(totals.saved) + ' · ' + allTransactions(key).length + ' entries.';
  }

  const form = document.querySelector('.js-tx-form');
  const tableBody = document.querySelector('.js-tx-table');
  const filter = document.querySelector('.js-tx-filter');
  const search = document.querySelector('.js-tx-search');
  let editing = null; // {type, day, description} of the row being edited

  function drawTable() {
    const wanted = filter ? filter.value : 'all';
    const needle = search ? search.value.trim().toLowerCase() : '';
    const rows = allTransactions(key).filter((row) => {
      if (wanted !== 'all' && row.category !== wanted) return false;
      if (needle && !row.description.toLowerCase().includes(needle)) return false;
      return true;
    });
    tableBody.innerHTML = rows.length
      ? rows.map((row) =>
        transactionRowHTML(row).replace('</tr>', '') +
        '<td class="num"><button type="button" class="btn ghost small js-edit" data-type="' + row.type +
        '" data-day="' + row.day + '" data-desc="' + escapeHtml(row.description) + '">Edit</button> ' +
        '<button type="button" class="btn danger small js-del" data-type="' + row.type +
        '" data-day="' + row.day + '" data-desc="' + escapeHtml(row.description) + '">Delete</button></td></tr>',
      ).join('')
      : '<tr><td colspan="5">Nothing matches — try a different category or search.</td></tr>';
    tableBody.querySelectorAll('.js-del').forEach((button) => {
      button.addEventListener('click', () => {
        if (window.confirm('Delete “' + button.dataset.desc + '”?')) {
          removeTransaction(key, button.dataset.type, Number(button.dataset.day), button.dataset.desc);
          location.reload();
        }
      });
    });
    tableBody.querySelectorAll('.js-edit').forEach((button) => {
      button.addEventListener('click', () => {
        const rows = allTransactions(key);
        const row = rows.find((r) => r.type === button.dataset.type &&
          r.day === Number(button.dataset.day) && r.description === button.dataset.desc);
        if (!row) return;
        editing = { type: row.type, day: row.day, description: row.description };
        form.querySelector('[name="date"]').value = key + '-' + String(row.day).padStart(2, '0');
        form.querySelector('[name="description"]').value = row.description;
        form.querySelector('[name="category"]').value = row.category;
        form.querySelector('[name="amount"]').value = row.amount;
        form.querySelector('[name="type"]').value = row.type;
        form.querySelector('.js-submit-label').textContent = 'Save changes';
        form.querySelector('.js-cancel-edit').hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showNotice('Editing “' + row.description + '” — change the fields and press Save changes.');
      });
    });
  }

  if (filter) {
    filter.innerHTML = '<option value="all">All categories</option>' +
      CATEGORIES.filter((c) => c.name !== 'Savings').map((c) => '<option>' + c.name + '</option>').join('') +
      '<option>Savings</option>';
    filter.addEventListener('change', drawTable);
  }
  if (search) search.addEventListener('input', drawTable);

  if (form) {
    form.querySelector('[name="category"]').innerHTML = categoryOptions('Groceries') +
      '<option value="Savings">Savings</option><option value="Income">Income</option>';
    const dateInput = form.querySelector('[name="date"]');
    dateInput.value = key + '-26';
    dateInput.min = key + '-01';
    dateInput.max = key + '-28';
    form.querySelector('.js-cancel-edit').addEventListener('click', () => {
      editing = null;
      form.reset();
      dateInput.value = key + '-26';
      form.querySelector('.js-submit-label').textContent = 'Add transaction';
      form.querySelector('.js-cancel-edit').hidden = true;
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = new FormData(form);
      const date = String(fields.get('date') || '');
      const day = Number(date.split('-')[2] || 26);
      const description = String(fields.get('description') || '').trim();
      const amount = Number(fields.get('amount'));
      const type = String(fields.get('type') || 'expense');
      let category = String(fields.get('category') || 'Other');
      if (type === 'income') category = 'Income';
      if (!description || !(amount > 0)) {
        showNotice('Add a short description and an amount above $0.', true);
        return;
      }
      if (editing) removeTransaction(key, editing.type, editing.day, editing.description);
      addTransaction(key, { day, description, category, amount, type });
      location.reload();
    });
  }

  const exportButton = document.querySelector('.js-export');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      const lines = [['Day', 'Description', 'Category', 'Type', 'Amount (USD)']];
      for (const row of allTransactions(key)) {
        lines.push([row.day, '"' + row.description.replace(/"/g, '""') + '"', row.category, row.type, row.amount.toFixed(2)]);
      }
      const blob = new Blob([lines.map((line) => line.join(',')).join('\n')], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'homeledger-' + key + '.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  drawTable();
}

// --- Budget ------------------------------------------------------------------

function renderBudget() {
  const key = currentMonth();
  const data = loadStore();
  const spent = spendingByCategory(key);
  const totals = monthTotals(key);
  const budgetTotal = Object.values(data.budgets).reduce((sum, value) => sum + value, 0);
  const head = document.querySelector('.js-budget-head');
  if (head) {
    head.innerHTML = 'Budgeted ' + money(budgetTotal) + ' of ' + money(totals.income) +
      ' income (' + percent(budgetTotal, totals.income) + '%). ' +
      'Spent so far in ' + monthLabel(key) + ': ' + money(totals.spending + totals.saved) + '.';
  }

  const list = document.querySelector('.js-budget-rows');
  function drawRows() {
    list.innerHTML = Object.keys(data.budgets).map((name) => {
      const limit = data.budgets[name];
      const used = name === 'Savings' ? totals.saved : (spent[name] || 0);
      const over = used > limit;
      return '<div class="budget-row" data-cat="' + escapeHtml(name) + '">' +
        '<div class="budget-top"><span class="name"><span class="cat-dot" style="background:' +
        categoryColor(name) + '"></span>' + escapeHtml(name) + '</span>' +
        '<span class="figures"><b>' + money(used) + '</b> of ' + money(limit) +
        (over ? ' · <span class="over-amount">' + money(used - limit) + ' over</span>' : '') +
        '</span></div>' + progressBarHTML(used, limit, categoryColor(name)) +
        '<div class="budget-meta"><span>' + percent(used, limit) + '% used · ' +
        (over ? 'over budget' : money(limit - used) + ' left') + '</span>' +
        '<button type="button" class="link-btn js-edit-budget" data-cat="' + escapeHtml(name) +
        '" data-limit="' + limit + '">Edit budget</button></div></div>';
    }).join('');
    list.querySelectorAll('.js-edit-budget').forEach((button) => {
      button.addEventListener('click', () => {
        const row = button.closest('.budget-row');
        const cat = button.dataset.cat;
        const current = Number(button.dataset.limit);
        row.querySelector('.budget-meta').innerHTML =
          '<span><label style="display:inline">New monthly budget $</label> ' +
          '<input type="number" min="0" step="5" value="' + current +
          '" style="width:110px;display:inline-block" class="js-budget-input" aria-label="New budget for ' +
          escapeHtml(cat) + '"></span>' +
          '<span><button type="button" class="btn small js-save-budget">Save</button> ' +
          '<button type="button" class="btn ghost small js-cancel-budget">Cancel</button></span>';
        row.querySelector('.js-save-budget').addEventListener('click', () => {
          const value = Number(row.querySelector('.js-budget-input').value);
          if (!(value >= 0)) { showNotice('Enter a budget of $0 or more.', true); return; }
          setBudget(cat, Math.round(value));
          location.reload();
        });
        row.querySelector('.js-cancel-budget').addEventListener('click', drawRows);
      });
    });
  }
  drawRows();

  const resetButton = document.querySelector('.js-reset-budgets');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (window.confirm('Reset every category budget to the Riveras’ suggested amounts?')) {
        const fresh = seedHouseholdData();
        loadStore().budgets = fresh.budgets;
        saveStore();
        location.reload();
      }
    });
  }
}

// --- 50/30/20 planner ---------------------------------------------------------

function renderPlanner() {
  const key = currentMonth();
  const totals = monthTotals(key);
  const byCat = spendingByCategory(key);
  const incomeInput = document.querySelector('.js-plan-income');
  const needsSlider = document.querySelector('.js-needs-slider');
  const wantsSlider = document.querySelector('.js-wants-slider');
  const summary = document.querySelector('.js-plan-summary');

  incomeInput.value = totals.income;

  function groupActual(kind) {
    let sum = 0;
    for (const name of Object.keys(byCat)) {
      if (categoryKind(name) === kind) sum += byCat[name];
    }
    return sum;
  }

  function drawPlan() {
    const income = Number(incomeInput.value) || 0;
    let needsPct = Number(needsSlider.value);
    let wantsPct = Number(wantsSlider.value);
    if (needsPct + wantsPct > 100) {
      wantsPct = 100 - needsPct;
      wantsSlider.value = wantsPct;
    }
    const savePct = 100 - needsPct - wantsPct;
    document.querySelector('.js-needs-out').textContent = needsPct + '% · ' + money(income * needsPct / 100);
    document.querySelector('.js-wants-out').textContent = wantsPct + '% · ' + money(income * wantsPct / 100);
    document.querySelector('.js-save-out').textContent = savePct + '% · ' + money(income * savePct / 100);

    const actualNeeds = groupActual('need');
    const actualWants = groupActual('want');
    const actualSaved = Math.max(0, totals.income - actualNeeds - actualWants);
    const targetNeeds = income * needsPct / 100;
    const targetWants = income * wantsPct / 100;
    const targetSaved = income * savePct / 100;

    function compareRow(label, target, actual) {
      const diff = actual - target;
      const note = diff > 0
        ? '<span class="over-amount">' + money(diff) + ' over target</span>'
        : money(-diff) + ' under target';
      return '<tr><td>' + label + '</td><td class="num">' + money(target) + '</td>' +
        '<td class="num">' + money(actual) + '</td><td class="num">' + note + '</td></tr>';
    }
    document.querySelector('.js-plan-compare').innerHTML =
      compareRow('Needs', targetNeeds, actualNeeds) +
      compareRow('Wants', targetWants, actualWants) +
      compareRow('Savings', targetSaved, actualSaved);

    const bar = document.querySelector('.js-plan-split');
    bar.innerHTML =
      '<div style="width:' + needsPct + '%;background:#1d4a38"></div>' +
      '<div style="width:' + wantsPct + '%;background:#e8a33d"></div>' +
      '<div style="width:' + savePct + '%;background:#2e7d5b"></div>';
    summary.textContent = 'On ' + money(income) + ' a month, that means ' + money(targetNeeds) +
      ' for needs, ' + money(targetWants) + ' for wants and ' + money(targetSaved) +
      ' for savings — checked against what the Riveras actually spent in ' + monthLabel(key) + '.';
  }

  incomeInput.addEventListener('input', drawPlan);
  needsSlider.addEventListener('input', drawPlan);
  wantsSlider.addEventListener('input', drawPlan);

  const apply = document.querySelector('.js-plan-apply');
  if (apply) {
    apply.addEventListener('click', () => {
      const income = Number(incomeInput.value) || 0;
      const needsPct = Number(needsSlider.value);
      const wantsPct = Number(wantsSlider.value);
      const savePct = 100 - needsPct - wantsPct;
      const data = loadStore();
      const groups = { need: [], want: [], save: [] };
      for (const name of Object.keys(data.budgets)) groups[categoryKind(name)].push(name);
      const targets = {
        need: income * needsPct / 100,
        want: income * wantsPct / 100,
        save: income * savePct / 100,
      };
      for (const kind of ['need', 'want', 'save']) {
        const names = groups[kind];
        const currentTotal = names.reduce((sum, name) => sum + data.budgets[name], 0);
        if (!currentTotal) continue;
        const factor = targets[kind] / currentTotal;
        for (const name of names) data.budgets[name] = Math.max(0, Math.round(data.budgets[name] * factor));
      }
      saveStore();
      showNotice('Budgets updated to match your plan — see the Budget page for the new amounts per category.');
    });
  }

  drawPlan();
}

// --- Savings goals ------------------------------------------------------------

function renderGoals() {
  const data = loadStore();
  const totalSaved = data.goals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalTarget = data.goals.reduce((sum, goal) => sum + goal.target, 0);
  const head = document.querySelector('.js-goals-head');
  if (head) {
    head.textContent = 'Saved ' + money(totalSaved) + ' of ' + money(totalTarget) +
      ' across ' + data.goals.length + ' goals (' + percent(totalSaved, totalTarget) + '%).';
  }

  const grid = document.querySelector('.js-goal-grid');
  function drawGoals() {
    const goals = loadStore().goals;
    grid.innerHTML = goals.map((goal) =>
      '<article class="goal-card"><h3>' + escapeHtml(goal.name) + '</h3>' +
      '<p class="goal-note">' + escapeHtml(goal.note || '') + '</p>' +
      progressBarHTML(goal.saved, goal.target, '#e8a33d') +
      '<div class="goal-figures"><span><b>' + money(goal.saved) + '</b> saved</span>' +
      '<span>of ' + money(goal.target) + ' · ' + percent(goal.saved, goal.target) + '%</span></div>' +
      '<div class="goal-figures"><span>' + money(goal.target - goal.saved) + ' to go</span>' +
      '<span>' + (goal.saved >= goal.target ? 'Goal reached!' : '') + '</span></div>' +
      '<form class="js-contribute" data-id="' + goal.id + '">' +
      '<div class="form-row"><div><label for="add-' + goal.id + '">Add to this goal ($)</label>' +
      '<input id="add-' + goal.id + '" name="amount" type="number" min="1" step="1" placeholder="100" required></div>' +
      '<div style="flex:0 0 auto;align-self:end"><button class="btn small" type="submit">Add money</button></div></div></form>' +
      '<p style="margin:12px 0 0"><button type="button" class="link-btn js-del-goal" data-id="' +
      goal.id + '" data-name="' + escapeHtml(goal.name) + '">Remove this goal</button></p></article>',
    ).join('');
    grid.querySelectorAll('.js-contribute').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = Number(new FormData(form).get('amount'));
        if (!(amount > 0)) { showNotice('Enter an amount above $0.', true); return; }
        addToGoal(form.dataset.id, amount);
        showNotice(money(amount) + ' added. Nice progress.');
        drawGoals();
      });
    });
    grid.querySelectorAll('.js-del-goal').forEach((button) => {
      button.addEventListener('click', () => {
        if (window.confirm('Remove the goal “' + button.dataset.name + '”?')) {
          removeGoal(button.dataset.id);
          location.reload();
        }
      });
    });
  }
  drawGoals();

  const form = document.querySelector('.js-new-goal');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = new FormData(form);
      const name = String(fields.get('name') || '').trim();
      const target = Number(fields.get('target'));
      const saved = Number(fields.get('saved') || 0);
      const note = String(fields.get('note') || '').trim();
      if (!name || !(target > 0)) {
        showNotice('Give the goal a name and a target above $0.', true);
        return;
      }
      addGoal(name, Math.round(target), Math.max(0, Math.round(saved)), note);
      location.reload();
    });
  }
}

// --- Reports -------------------------------------------------------------------

function renderReports() {
  const key = currentMonth();
  const keys = monthKeys();
  const data = loadStore();

  drawBars(
    document.querySelector('.js-trend'),
    keys.map((monthKey) => ({
      label: monthLabel(monthKey).split(' ')[0].slice(0, 3),
      value: monthTotals(monthKey).spending,
      color: monthKey === key ? '#1d4a38' : '#7a9e7e',
    })),
    { height: 240 },
  );

  const byCat = spendingByCategory(key);
  const rows = Object.keys(byCat)
    .map((name) => ({ name, value: byCat[name] }))
    .sort((a, b) => b.value - a.value);
  const totals = monthTotals(key);
  const catList = document.querySelector('.js-cat-breakdown');
  if (catList) {
    catList.innerHTML = rows.map((row) =>
      '<div class="budget-row"><div class="budget-top"><span class="name">' +
      escapeHtml(row.name) + '</span><span class="figures"><b>' + money(row.value) +
      '</b> · ' + percent(row.value, totals.spending) + '% of spending</span></div>' +
      progressBarHTML(row.value, totals.spending, categoryColor(row.name)) + '</div>',
    ).join('');
  }

  // Biggest single expenses this month.
  const biggest = allTransactions(key)
    .filter((row) => row.type === 'expense' && row.category !== 'Savings')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const bigBody = document.querySelector('.js-biggest');
  if (bigBody) bigBody.innerHTML = biggest.map(transactionRowHTML).join('');

  // Insights, computed from the books, not written by hand.
  const insights = [];
  const top = rows[0];
  if (top) {
    insights.push('The biggest slice of ' + monthLabel(key) + ' was ' + top.name + ' at ' +
      money(top.value) + ' (' + percent(top.value, totals.spending) + '% of spending).');
  }
  const dining = byCat['Dining Out'] || 0;
  const diningAvg = keys.reduce((sum, monthKey) => sum + (spendingByCategory(monthKey)['Dining Out'] || 0), 0) / keys.length;
  if (diningAvg > 0) {
    const diff = Math.round(((dining - diningAvg) / diningAvg) * 100);
    insights.push(diff >= 0
      ? 'Dining Out ran ' + diff + '% above its 3-month average (' + money(diningAvg) + ').'
      : 'Dining Out ran ' + (-diff) + '% below its 3-month average (' + money(diningAvg) + ') — a good month for cooking at home.');
  }
  const saveRate = percent(totals.income - totals.spending, totals.income);
  insights.push('The household kept ' + saveRate + '% of its income in ' + monthLabel(key) +
    ' (' + money(totals.income - totals.spending) + ' of ' + money(totals.income) +
    '), against the 20% the 50/30/20 rule aims for.');
  const over = Object.keys(data.budgets)
    .filter((name) => name !== 'Savings' && (byCat[name] || 0) > data.budgets[name]);
  insights.push(over.length
    ? 'Over budget this month: ' + over.join(', ') + '. The Budget page shows how far over each one went.'
    : 'No category went over budget in ' + monthLabel(key) + ' — every limit held.');
  const prevKey = keys[keys.indexOf(key) - 1];
  if (prevKey) {
    const prev = monthTotals(prevKey);
    const change = totals.spending - prev.spending;
    insights.push('Spending moved ' + (change >= 0 ? 'up ' : 'down ') + money(Math.abs(change)) +
      ' from ' + monthLabel(prevKey) + ' (' + money(prev.spending) + ').');
  }
  const insightList = document.querySelector('.js-insights');
  if (insightList) insightList.innerHTML = insights.map((text) => '<li>' + escapeHtml(text) + '</li>').join('');
}

// --- Boot ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || 'dashboard';
  initChrome(page);
  if (page === 'dashboard') renderDashboard();
  else if (page === 'transactions') renderTransactions();
  else if (page === 'budget') renderBudget();
  else if (page === 'planner') renderPlanner();
  else if (page === 'goals') renderGoals();
  else if (page === 'reports') renderReports();
});
