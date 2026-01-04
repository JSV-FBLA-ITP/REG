/* --- THEME SYSTEM --- */
function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeBtn(saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
    updateThemeBtn(target);
}

function updateThemeBtn(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
}

/* --- DATA STATE --- */
let petData = JSON.parse(localStorage.getItem('myPetData')) || null;
let expenseLog = JSON.parse(localStorage.getItem('expenseLog')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    if (document.getElementById('pet-selection-grid')) initSelection();
    if (window.location.pathname.includes('game.html')) initGame();
});

/* --- ORIGINAL SELECTION LOGIC --- */
function initSelection() {
    const cards = document.querySelectorAll('.pet-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            localStorage.setItem('tempPetType', card.dataset.pet);
            document.getElementById('start-btn').disabled = false;
        });
    });
}

window.finalizePet = function() {
    const nameInput = document.getElementById('pet-name');
    const name = nameInput ? nameInput.value.trim() : "";
    const type = localStorage.getItem('tempPetType');
    if (!/^[a-zA-Z\s]{2,12}$/.test(name)) return alert("Name must be 2-12 letters.");

    petData = {
        type, name, personality: document.getElementById('pet-personality').value,
        stats: { hunger: 100, happy: 100, energy: 100, money: 500 },
        shop_multipliers: { hunger: 1.0, happy: 1.0, energy: 1.0 },
        shop_upgrades: { hunger: 0, happy: 0, energy: 0 }
    };
    localStorage.setItem('myPetData', JSON.stringify(petData));
    localStorage.setItem('expenseLog', JSON.stringify([]));
    window.location.href = 'game.html';
};

/* --- GAME LOOP & SHOP LOGIC --- */
function initGame() {
    if (!petData) return;
    if (!petData.shop_multipliers) petData.shop_multipliers = { hunger: 1.0, happy: 1.0, energy: 1.0 };
    if (!petData.shop_upgrades) petData.shop_upgrades = { hunger: 0, happy: 0, energy: 0 };

    updateUI();
    setInterval(() => {
        const mult = petData.personality === 'energetic' ? 5 : 3;
        petData.stats.hunger = Math.max(0, petData.stats.hunger - (mult * petData.shop_multipliers.hunger));
        petData.stats.happy = Math.max(0, petData.stats.happy - (5 * petData.shop_multipliers.happy));
        petData.stats.energy = Math.max(0, petData.stats.energy - (1 * petData.shop_multipliers.energy));
        save(); updateUI();
    }, 2000);
}

function updateUI() {
    if(!petData) return;
    document.getElementById('pet-name-display').textContent = petData.name;
    document.getElementById('money-display').textContent = petData.stats.money;

    ['hunger', 'happy', 'energy'].forEach(s => {
        const v = Math.round(petData.stats[s]);
        const el = document.getElementById(`${s}-circle`);
        if(el) {
            el.style.setProperty('--percent', v);
            document.getElementById(`${s}-val`).textContent = v + '%';
        }

        // Shop UI Updates for all 3 powerups
        const countEl = document.getElementById(`shop_count_${s}`);
        if(countEl) {
            const count = petData.shop_upgrades[s];
            const btn = countEl.parentElement.nextElementSibling;
            if (count >= 3) {
                countEl.textContent = "MAXED OUT";
                if(btn) btn.disabled = true;
            } else {
                countEl.textContent = `${3 - count} left`;
            }
        }
    });

    document.getElementById('expense-list').innerHTML = expenseLog.slice(-4).reverse()
        .map(e => `<li>${e.time}: ${e.item} (-$${e.cost})</li>`).join('');
}

window.shop_toggleWindow = function() {
    const modal = document.getElementById('shop_powerup_modal');
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
};

window.shop_purchaseUpgrade = function(type) {
    if (petData.shop_upgrades[type] < 3 && petData.stats.money >= 300) {
        petData.stats.money -= 300;
        petData.shop_upgrades[type]++;
        petData.shop_multipliers[type] *= 0.9;
        addLog(`${type.toUpperCase()} Upgrade`, 300);
        save(); updateUI();
    } else { alert("Cannot purchase upgrade."); }
};

window.handleAction = function(action) {
    if (action === 'feed' && petData.stats.money >= 25) {
        petData.stats.hunger = Math.min(100, petData.stats.hunger + 7);
        petData.stats.money -= 25;
        addLog("Pet Food", 25);
    } else if (action === 'play' && petData.stats.energy >= 20) {
        petData.stats.happy = Math.min(100, petData.stats.happy + 5);
        petData.stats.energy -= 20;
        petData.stats.money -= 10;
        addLog("Toys", 10);
    } else if (action === 'sleep') {
        petData.stats.energy = 100;
        addLog("Rest", 0);
    }
    save(); updateUI();
};

window.earnMoney = function() {
    if (petData.stats.energy >= 25) {
        petData.stats.money += 60;
        petData.stats.energy -= 25;
        save(); updateUI();
    } else { alert("Too tired!"); }
};

function addLog(item, cost) {
    expenseLog.push({ item, cost, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    localStorage.setItem('expenseLog', JSON.stringify(expenseLog));
}
function save() { localStorage.setItem('myPetData', JSON.stringify(petData)); }