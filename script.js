// script.js

const KEYS = {
  PROFILE: 'fit_profile',
  BURNED:  'cal_burned',
  GAINED:  'cal_gained',
  HISTORY: 'workout_history'
};

const DIET_PLANS = {
  "Lose Weight": {
    target: 1700,
    vegetarian: [
      {name: "Moong Dal (1 bowl)", cal: 180},
      {name: "Paneer Tikka (100g)", cal: 250},
      {name: "Sprouts Chaat", cal: 120},
      {name: "Ragi Dosa (1)", cal: 200},
      {name: "Veg Salad + Yogurt", cal: 150},
      {name: "Cucumber Raita", cal: 100}
    ],
    nonveg: [
      {name: "Grilled Chicken (150g)", cal: 250},
      {name: "Fish Fry (low oil)", cal: 220},
      {name: "Egg Bhurji (2 eggs)", cal: 180},
      {name: "Tandoori Prawns", cal: 200},
      {name: "Chicken Soup", cal: 150}
    ],
    keto: [
      {name: "Avocado + Boiled Eggs (2)", cal: 300},
      {name: "Paneer in Butter (limited)", cal: 350},
      {name: "Cheese & Nuts (30g)", cal: 250},
      {name: "Coconut Chutney Omelette", cal: 280},
      {name: "Bulletproof Coffee", cal: 200}
    ]
  },
  "Gain Weight": {
    target: 3000,
    vegetarian: [
      {name: "Banana Shake + Almonds", cal: 500},
      {name: "Ghee Rice (1 bowl)", cal: 450},
      {name: "Paneer Paratha (1)", cal: 550},
      {name: "Curd Rice + Pickle", cal: 400},
      {name: "Dry Fruit Halwa (small)", cal: 450}
    ],
    nonveg: [
      {name: "Chicken Biryani (medium)", cal: 550},
      {name: "Mutton Curry + Rice", cal: 600},
      {name: "Egg Fried Rice", cal: 450},
      {name: "Butter Chicken (150g)", cal: 500}
    ],
    keto: [
      {name: "Keto Fat Bombs (3)", cal: 400},
      {name: "Almond Butter + Cream", cal: 450},
      {name: "Salmon / Mackerel + Avocado", cal: 500},
      {name: "Heavy Cream Coffee", cal: 350},
      {name: "Macadamia Nuts (50g)", cal: 400}
    ]
  },
  "Maintain Weight": {
    target: 2400,
    vegetarian: [
      {name: "Idli + Sambar", cal: 280},
      {name: "Paneer Bhurji", cal: 300},
      {name: "Mixed Veg Curry + Roti", cal: 350},
      {name: "Curd Rice", cal: 250},
      {name: "Fruit Bowl + Nuts", cal: 220}
    ],
    nonveg: [
      {name: "Chicken Stew", cal: 300},
      {name: "Fish Curry + Rice", cal: 400},
      {name: "Egg Curry", cal: 280},
      {name: "Grilled Meat", cal: 320}
    ],
    keto: [
      {name: "Eggs + Avocado", cal: 320},
      {name: "Paneer Stir-Fry", cal: 340},
      {name: "Coconut Oil Coffee", cal: 250},
      {name: "Cheese Omelette", cal: 300}
    ]
  }
};

// ── Helpers ────────────────────────────────────────────────
function getStored(key, defaultVal = 0) {
  const val = localStorage.getItem(key);
  return val !== null ? parseInt(val) : defaultVal;
}

function setStored(key, value) {
  localStorage.setItem(key, value);
}

function getHistory() {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

// ── BMI & Category ─────────────────────────────────────────
function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return { text: "Underweight", color: "#ffa500" };
  if (bmi < 25)  return { text: "Normal",      color: "#4caf50" };
  if (bmi < 30)  return { text: "Overweight",  color: "#ff9800" };
  return                { text: "Obese",       color: "#f44336" };
}

// ── BMR (Revised Harris-Benedict) & TDEE ───────────────────
function calculateBMR(profile) {
  const { age, gender, weight, height } = profile;
  if (!age || !weight || !height || !gender) return null;

  let bmr;
  if (gender === "Male") {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247  * weight) + (3.098  * height) - (4.330  * age);
  }
  return Math.round(bmr);
}

function calculateTDEE(bmr) {
  return bmr ? Math.round(bmr * 1.55) : null; // 1.55 = moderately active
}

// ── Profile Save ───────────────────────────────────────────
function saveProfile() {
  const profile = {
    age:    parseInt(document.getElementById("age")?.value)    || null,
    gender: document.getElementById("gender")?.value || "Male",
    height: parseInt(document.getElementById("height")?.value) || null,
    weight: parseInt(document.getElementById("weight")?.value) || null,
    goal:   document.getElementById("goal")?.value   || "Maintain Weight"
  };

  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));

  const bmiResultEl = document.getElementById("bmiResult");
  if (profile.height && profile.weight) {
    const bmi = calculateBMI(profile.weight, profile.height);
    const cat = getBMICategory(bmi);

    if (bmiResultEl) {
      bmiResultEl.innerHTML = `
        Your BMI: <strong>${bmi}</strong><br>
        <span style="color:${cat.color}">${cat.text}</span>
      `;

      const bmr  = calculateBMR(profile);
      const tdee = calculateTDEE(bmr);
      if (bmr && tdee) {
        bmiResultEl.innerHTML += `<br>Est. Daily Needs: ~${tdee} kcal (moderate activity)`;
      }
    }
  } else if (bmiResultEl) {
    bmiResultEl.innerHTML = "";
  }

  window.location.href = "diet-preference.html";
}

// ── Diet Preference ────────────────────────────────────────
function saveDietPrefAndGo() {
  const pref = document.getElementById("dietPref")?.value;
  if (!pref) {
    alert("Please choose a diet preference");
    return;
  }
  localStorage.setItem("diet_preference", pref);
  window.location.href = "diet.html";
}

// ── Calories ───────────────────────────────────────────────
function addBurn(cal, activity = "Workout") {
  let total = getStored(KEYS.BURNED);
  total += Number(cal);
  setStored(KEYS.BURNED, total);

  const entry = {
    id: Date.now(),
    date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    activity,
    calories: Number(cal)
  };

  const history = getHistory();
  history.push(entry);
  if (history.length > 300) history.shift();
  saveHistory(history);

  updateDashboard();
  const histList = document.getElementById("history-list");
  if (histList) renderHistory(histList);
}

function addGain(cal) {
  let total = getStored(KEYS.GAINED);
  total += Number(cal);
  setStored(KEYS.GAINED, total);
  updateDashboard();

  const gainedEl = document.getElementById("gained");
  if (gainedEl) gainedEl.innerText = total;
}

// ── Dashboard Update ───────────────────────────────────────
function updateDashboard() {
  const els = {
    burned:   document.getElementById("burned"),
    gained:   document.getElementById("gained"),
    bmi:      document.getElementById("bmi"),
    bmiCat:   document.getElementById("bmiCategory"),
    bmr:      document.getElementById("bmr"),
    tdee:     document.getElementById("tdee"),
    burnBar:  document.getElementById("burnBar"),
    gainBar:  document.getElementById("gainBar")
  };

  if (!els.burned) return;

  const burned = getStored(KEYS.BURNED);
  const gained = getStored(KEYS.GAINED);

  els.burned.innerText = burned;
  els.gained.innerText = gained;

  const burnPct = Math.min((burned / 2500) * 100, 150);
  const gainPct = Math.min((gained  / 2500) * 100, 150);

  if (els.burnBar) els.burnBar.style.width = burnPct + "%";
  if (els.gainBar) els.gainBar.style.width = gainPct + "%";

  const profileRaw = localStorage.getItem(KEYS.PROFILE);
  if (profileRaw) {
    try {
      const p = JSON.parse(profileRaw);
      if (p.height && p.weight) {
        const bmi = calculateBMI(p.weight, p.height);
        const cat = getBMICategory(bmi);

        if (els.bmi)    els.bmi.innerText = bmi;
        if (els.bmiCat) {
          els.bmiCat.innerText = cat.text;
          els.bmiCat.style.color = cat.color;
        }

        const bmrVal  = calculateBMR(p);
        const tdeeVal = calculateTDEE(bmrVal);

        if (els.bmr)  els.bmr.innerText  = bmrVal  ? `${bmrVal} kcal` : "—";
        if (els.tdee) els.tdee.innerText = tdeeVal ? `(~${tdeeVal} kcal daily)` : "(add profile info)";
      }
    } catch {}
  }
}

// ── History ────────────────────────────────────────────────
function renderHistory(container) {
  if (!container) return;
  container.innerHTML = "";

  const history = getHistory();
  if (history.length === 0) {
    container.innerHTML = '<p style="color:#aaa; text-align:center; padding:40px 0;">No workouts recorded yet.</p>';
    return;
  }

  history.slice().reverse().forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="history-date">${item.date}</div>
      <div class="history-activity">${item.activity}</div>
      <div class="history-calories">−${item.calories} cal</div>
    `;
    container.appendChild(div);
  });
}

function clearHistory() {
  if (!confirm("Clear ALL workout history? This cannot be undone.")) return;
  localStorage.removeItem(KEYS.HISTORY);
  const list = document.getElementById("history-list");
  if (list) renderHistory(list);
}

// ── Diet Page ──────────────────────────────────────────────
function loadDietPage() {
  const els = {
    gained:     document.getElementById("gained"),
    target:     document.getElementById("targetCal"),
    info:       document.getElementById("dietInfo"),
    buttons:    document.getElementById("foodButtons")
  };

  if (!els.gained) return;

  let goal = "Maintain Weight";
  const profileRaw = localStorage.getItem(KEYS.PROFILE);
  if (profileRaw) {
    try {
      goal = JSON.parse(profileRaw).goal;
    } catch {}
  }

  const pref = localStorage.getItem("diet_preference") || "vegetarian";
  const plan = DIET_PLANS[goal] || DIET_PLANS["Maintain Weight"];
  const foods = plan[pref] || plan["vegetarian"];

  if (els.target) els.target.innerText = plan.target;
  if (els.info) {
    els.info.innerHTML = `Goal: <strong>${goal}</strong> | Style: <strong>${pref.charAt(0).toUpperCase() + pref.slice(1)}</strong><br>Daily Target ≈ ${plan.target} kcal`;
  }

  els.buttons.innerHTML = "";
  foods.forEach(food => {
    const btn = document.createElement("button");
    btn.innerText = `${food.name} (${food.cal} cal)`;
    btn.onclick = () => addGain(food.cal);
    els.buttons.appendChild(btn);
  });

  if (els.gained) els.gained.innerText = getStored(KEYS.GAINED);
}

// ── Login (demo) ───────────────────────────────────────────
function login() {
  const username = document.getElementById("username")?.value.trim();
  if (username) {
    localStorage.setItem("current_user", username);
    window.location.href = "dashboard.html";
  } else {
    alert("Please enter a username");
  }
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();

  const historyContainer = document.getElementById("history-list");
  if (historyContainer) renderHistory(historyContainer);

  if (document.getElementById("foodButtons")) {
    loadDietPage();
  }
});