// HomeLedger data layer: the demo household's books, kept in localStorage.
//
// The Rivera household — Maya (teacher) and Daniel (electrician), two kids,
// living in a three-bedroom house in Maplewood. Every figure below is the
// seed data the site ships with, so every page shows real numbers from the
// first load. Edits are saved to localStorage under STORE_KEY and survive
// reloads; "Reset demo data" in the footer restores this seed.

const STORE_KEY = 'homeledger.v1';

// Category list: name, colour used by charts and badges, and the kind of
// spending it is, so the 50/30/20 planner can group it.
const CATEGORIES = [
  { name: 'Housing', color: '#1d4a38', kind: 'need' },
  { name: 'Groceries', color: '#2e7d5b', kind: 'need' },
  { name: 'Transport', color: '#4a90a4', kind: 'need' },
  { name: 'Utilities', color: '#7a9e7e', kind: 'need' },
  { name: 'Health', color: '#c96f4a', kind: 'need' },
  { name: 'Kids', color: '#d9a441', kind: 'need' },
  { name: 'Dining Out', color: '#e07856', kind: 'want' },
  { name: 'Fun', color: '#e8a33d', kind: 'want' },
  { name: 'Shopping', color: '#8a6fb8', kind: 'want' },
  { name: 'Subscriptions', color: '#5b7fa6', kind: 'want' },
  { name: 'Savings', color: '#1d4a38', kind: 'save' },
  { name: 'Other', color: '#9a938a', kind: 'want' },
];

function categoryColor(name) {
  const found = CATEGORIES.find((c) => c.name === name);
  return found ? found.color : '#9a938a';
}

function categoryKind(name) {
  const found = CATEGORIES.find((c) => c.name === name);
  return found ? found.kind : 'want';
}

// One transaction: [day, description, category, amount]. Income rows are
// kept in a separate list per month so the two never mix.
function tx(day, description, category, amount) {
  return { day, description, category, amount };
}

function seedHouseholdData() {
  return {
    version: 1,
    household: 'The Rivera Household',
    members: ['Maya Rivera', 'Daniel Rivera', 'Sofia (9)', 'Leo (6)'],
    home: 'Maplewood — 3-bed house, mortgage $1,850/mo',
    currency: 'USD',
    months: {
      '2026-09': {
        income: [
          tx(1, 'Maya — teaching salary', 'Income', 4600),
          tx(15, 'Daniel — electrician pay', 'Income', 2850),
          tx(20, 'Maya — weekend tutoring', 'Income', 380),
        ],
        expenses: [
          tx(1, 'Mortgage payment', 'Housing', 1850),
          tx(2, 'Weekly shop — Whole Foods', 'Groceries', 138.2),
          tx(3, 'Electric bill', 'Utilities', 141.5),
          tx(4, 'Water & sewer', 'Utilities', 61.4),
          tx(5, 'Gas fill-up', 'Transport', 46.8),
          tx(6, 'School lunches — Sofia & Leo', 'Kids', 120),
          tx(7, 'Netflix', 'Subscriptions', 15.49),
          tx(7, 'Spotify Family', 'Subscriptions', 16.99),
          tx(8, 'Gym — Maplewood Fitness', 'Health', 89),
          tx(9, 'Takeout — Thai Orchid', 'Dining Out', 44.6),
          tx(10, 'Costco run', 'Groceries', 176.4),
          tx(11, 'Internet — BrightNet', 'Utilities', 79.99),
          tx(12, 'Target — school supplies', 'Shopping', 82.3),
          tx(13, 'Car insurance', 'Transport', 142),
          tx(14, 'Dentist checkup — Leo', 'Health', 40),
          tx(15, 'Pizza night', 'Dining Out', 34.9),
          tx(16, 'Groceries — farmers market', 'Groceries', 64.5),
          tx(17, 'Phone bill — two lines', 'Utilities', 112),
          tx(18, 'Kids’ swimming lessons', 'Kids', 96),
          tx(19, 'Movie night — cinema', 'Fun', 41),
          tx(20, 'Pharmacy — allergy meds', 'Health', 28.4),
          tx(21, 'Gas fill-up', 'Transport', 43.5),
          tx(22, 'Weekly shop — Trader Joe’s', 'Groceries', 92.75),
          tx(23, 'Amazon — kitchen towels', 'Shopping', 38.2),
          tx(24, 'Coffee & pastries', 'Dining Out', 16.8),
          tx(25, 'Savings transfer', 'Savings', 1200),
          tx(26, 'Groceries — weekly shop', 'Groceries', 118.6),
          tx(27, 'Board games for family night', 'Fun', 34.99),
          tx(28, 'Haircuts — Maya & Leo', 'Other', 58),
        ],
      },
      '2026-10': {
        income: [
          tx(1, 'Maya — teaching salary', 'Income', 4600),
          tx(15, 'Daniel — electrician pay', 'Income', 2850),
          tx(22, 'Maya — weekend tutoring', 'Income', 410),
        ],
        expenses: [
          tx(1, 'Mortgage payment', 'Housing', 1850),
          tx(2, 'Weekly shop — Whole Foods', 'Groceries', 145.9),
          tx(3, 'Electric bill', 'Utilities', 132.8),
          tx(4, 'Water & sewer', 'Utilities', 63.1),
          tx(5, 'Gas fill-up', 'Transport', 49.6),
          tx(6, 'School lunches — Sofia & Leo', 'Kids', 120),
          tx(7, 'Netflix', 'Subscriptions', 15.49),
          tx(7, 'Spotify Family', 'Subscriptions', 16.99),
          tx(8, 'Gym — Maplewood Fitness', 'Health', 89),
          tx(9, 'Takeout — Thai Orchid', 'Dining Out', 47.2),
          tx(10, 'Costco run', 'Groceries', 192.5),
          tx(11, 'Internet — BrightNet', 'Utilities', 79.99),
          tx(12, 'Kids’ soccer fees', 'Kids', 85),
          tx(13, 'Car insurance', 'Transport', 142),
          tx(14, 'Pediatrician visit — Sofia', 'Health', 35),
          tx(15, 'Pizza night', 'Dining Out', 38.4),
          tx(16, 'Groceries — farmers market', 'Groceries', 71.2),
          tx(17, 'Phone bill — two lines', 'Utilities', 112),
          tx(18, 'Halloween costumes', 'Shopping', 64.5),
          tx(19, 'Cinema — family film', 'Fun', 36),
          tx(20, 'Pharmacy', 'Health', 22.15),
          tx(21, 'Gas fill-up', 'Transport', 44.9),
          tx(22, 'Weekly shop — Trader Joe’s', 'Groceries', 88.4),
          tx(23, 'Amazon — Leo’s birthday gift', 'Shopping', 52.75),
          tx(24, 'Coffee & pastries', 'Dining Out', 19.3),
          tx(25, 'Savings transfer', 'Savings', 1200),
          tx(26, 'Groceries — weekly shop', 'Groceries', 121.4),
          tx(27, 'Pumpkin patch outing', 'Fun', 48),
          tx(28, 'Haircuts — Daniel & Sofia', 'Other', 62),
          tx(29, 'Winter coats — kids', 'Shopping', 118.9),
        ],
      },
      '2026-11': {
        income: [
          tx(1, 'Maya — teaching salary', 'Income', 4600),
          tx(15, 'Daniel — electrician pay', 'Income', 2850),
          tx(20, 'Maya — weekend tutoring', 'Income', 395),
        ],
        expenses: [
          tx(1, 'Mortgage payment', 'Housing', 1850),
          tx(2, 'Weekly shop — Whole Foods', 'Groceries', 142.6),
          tx(3, 'Electric bill', 'Utilities', 128.75),
          tx(4, 'Water & sewer', 'Utilities', 64.2),
          tx(5, 'Gas fill-up', 'Transport', 48.3),
          tx(6, 'School lunches — Sofia & Leo', 'Kids', 120),
          tx(7, 'Netflix', 'Subscriptions', 15.49),
          tx(7, 'Spotify Family', 'Subscriptions', 16.99),
          tx(8, 'Gym — Maplewood Fitness', 'Health', 89),
          tx(9, 'Takeout — Thai Orchid', 'Dining Out', 42.8),
          tx(10, 'Costco run', 'Groceries', 188.3),
          tx(11, 'Internet — BrightNet', 'Utilities', 79.99),
          tx(12, 'Target — household run', 'Shopping', 76.45),
          tx(13, 'Car insurance', 'Transport', 142),
          tx(14, 'Dentist checkup — Maya', 'Health', 40),
          tx(15, 'Pizza night', 'Dining Out', 36.5),
          tx(16, 'Groceries — farmers market', 'Groceries', 58.9),
          tx(17, 'Phone bill — two lines', 'Utilities', 112),
          tx(18, 'Kids’ swimming lessons', 'Kids', 96),
          tx(19, 'Movie night — cinema', 'Fun', 38),
          tx(20, 'Pharmacy — vitamins', 'Health', 24.6),
          tx(21, 'Gas fill-up', 'Transport', 41.2),
          tx(22, 'Weekly shop — Trader Joe’s', 'Groceries', 86.4),
          tx(23, 'Amazon — holiday lights', 'Shopping', 63.2),
          tx(24, 'Coffee & pastries', 'Dining Out', 18.4),
          tx(25, 'Savings transfer', 'Savings', 1200),
          tx(26, 'Groceries — weekly shop', 'Groceries', 124.75),
        ],
      },
    },
    // Monthly budget targets per category. "Savings" is the transfer the
    // Riveras make to their savings account on the 25th of each month.
    budgets: {
      Housing: 1850,
      Groceries: 650,
      'Dining Out': 280,
      Transport: 320,
      Utilities: 400,
      Kids: 300,
      Health: 180,
      Fun: 200,
      Subscriptions: 95,
      Shopping: 250,
      Savings: 1200,
    },
    goals: [
      { id: 'g1', name: 'Emergency fund', target: 10000, saved: 6400, note: 'Six months of essentials, kept in a high-yield savings account.' },
      { id: 'g2', name: 'Family vacation — coast trip', target: 2400, saved: 1150, note: 'A week at the coast next summer: rental, fuel and food.' },
      { id: 'g3', name: 'New car down payment', target: 5000, saved: 2300, note: 'Replacing the 2016 sedan before next winter.' },
      { id: 'g4', name: 'Holiday gifts', target: 800, saved: 520, note: 'Gifts for family and the kids, bought through December.' },
    ],
  };
}

// --- Store: load, save, reset ---------------------------------------------

let store = null;

function loadStore() {
  if (store) return store;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && parsed.months) {
        store = parsed;
        return store;
      }
    }
  } catch (err) {
    // A damaged local copy falls back to the seed data below.
  }
  store = seedHouseholdData();
  saveStore();
  return store;
}

function saveStore() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (err) {
    // Private mode or a full quota: the page keeps working in memory.
  }
}

function resetStore() {
  store = seedHouseholdData();
  saveStore();
}

// --- Month helpers ---------------------------------------------------------

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return MONTH_NAMES[month - 1] + ' ' + year;
}

function monthKeys() {
  return Object.keys(loadStore().months).sort();
}

function monthTotals(key) {
  const data = loadStore();
  const month = data.months[key];
  if (!month) return { income: 0, spending: 0, saved: 0 };
  const income = month.income.reduce((sum, row) => sum + row.amount, 0);
  let spending = 0;
  let saved = 0;
  for (const row of month.expenses) {
    if (row.category === 'Savings') saved += row.amount;
    else spending += row.amount;
  }
  return { income, spending, saved };
}

function spendingByCategory(key) {
  const data = loadStore();
  const month = data.months[key];
  const totals = {};
  if (!month) return totals;
  for (const row of month.expenses) {
    if (row.category === 'Savings') continue;
    totals[row.category] = (totals[row.category] || 0) + row.amount;
  }
  return totals;
}

function allTransactions(key) {
  const data = loadStore();
  const month = data.months[key];
  if (!month) return [];
  const rows = [];
  for (const row of month.income) {
    rows.push({ ...row, type: 'income', id: 'in-' + key + '-' + row.day + '-' + row.description });
  }
  for (const row of month.expenses) {
    rows.push({ ...row, type: 'expense', id: 'ex-' + key + '-' + row.day + '-' + row.description });
  }
  rows.sort((a, b) => a.day - b.day);
  return rows;
}

// --- Editing ----------------------------------------------------------------

function nextId(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000);
}

function addTransaction(key, entry) {
  const data = loadStore();
  const month = data.months[key];
  if (!month) return false;
  const row = { day: entry.day, description: entry.description, category: entry.category, amount: entry.amount };
  if (entry.type === 'income') month.income.push(row);
  else month.expenses.push(row);
  saveStore();
  return true;
}

function removeTransaction(key, type, day, description) {
  const data = loadStore();
  const month = data.months[key];
  if (!month) return false;
  const list = type === 'income' ? month.income : month.expenses;
  const index = list.findIndex((row) => row.day === day && row.description === description);
  if (index === -1) return false;
  list.splice(index, 1);
  saveStore();
  return true;
}

function setBudget(category, amount) {
  const data = loadStore();
  data.budgets[category] = amount;
  saveStore();
}

function addToGoal(id, amount) {
  const data = loadStore();
  const goal = data.goals.find((g) => g.id === id);
  if (!goal) return false;
  goal.saved = Math.min(goal.target, Math.round((goal.saved + amount) * 100) / 100);
  saveStore();
  return true;
}

function addGoal(name, target, saved, note) {
  const data = loadStore();
  data.goals.push({ id: nextId('g'), name, target, saved: saved || 0, note: note || '' });
  saveStore();
}

function removeGoal(id) {
  const data = loadStore();
  const index = data.goals.findIndex((g) => g.id === id);
  if (index === -1) return false;
  data.goals.splice(index, 1);
  saveStore();
  return true;
}

// --- Formatting ---------------------------------------------------------------

function money(amount) {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function moneyShort(amount) {
  return '$' + Math.round(amount).toLocaleString('en-US');
}

function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
