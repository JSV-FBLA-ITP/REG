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

/* --- CORE FUNCTIONS --- */
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
    const name = document.getElementById('pet-name').value.trim();
    const type = localStorage.getItem('tempPetType');
    if (!/^[a-zA-Z\s]{2,12}$/.test(name)) return alert("Name must be 2-12 letters.");

    petData = {
        type, name, personality: document.getElementById('pet-personality').value,
        stats: { hunger: 100, happy: 100, energy: 100, money: 500 }
    };
    localStorage.setItem('myPetData', JSON.stringify(petData));
    localStorage.setItem('expenseLog', JSON.stringify([]));
    window.location.href = 'game.html';
};

function initGame() {
    if (!petData) return window.location.href = '../../index.html';
    updateUI();
    setInterval(() => {
        const mult = petData.personality === 'energetic' ? 1.5 : 0.8;
        petData.stats.hunger = Math.max(0, petData.stats.hunger - mult);
        petData.stats.happy = Math.max(0, petData.stats.happy - 0.5);
        petData.stats.energy = Math.max(0, petData.stats.energy - 0.3);
        save(); updateUI();
    }, 2000);
}

function updateUI() {
    document.getElementById('pet-name-display').textContent = petData.name;
    document.getElementById('money-display').textContent = petData.stats.money;
    ['hunger', 'happy', 'energy'].forEach(s => {
        const v = Math.round(petData.stats[s]);
        const el = document.getElementById(`${s}-circle`);
        el.style.setProperty('--percent', v);
        document.getElementById(`${s}-val`).textContent = v + '%';
        el.style.filter = v < 25 ? 'hue-rotate(300deg) saturate(3)' : 'none';
    });
    document.getElementById('expense-list').innerHTML = expenseLog.slice(-4).reverse()
        .map(e => `<li>${e.time}: ${e.item} (-$${e.cost})</li>`).join('');
}

window.handleAction = function(action) {
    if (action === 'feed') {
        if (petData.stats.money >= 25) {
            petData.stats.hunger = Math.min(100, petData.stats.hunger + 30);
            petData.stats.money -= 25;
            addLog("Pet Food", 25);
        } else {
            alert("Not enough money for food!");
        }
    } else if (action === 'play') {
        if (petData.stats.energy >= 20) {
            petData.stats.happy = Math.min(100, petData.stats.happy + 25);
            petData.stats.energy -= 20;
            petData.stats.money -= 10;
            addLog("Toys/Activities", 10);
        } else {
            alert("Your pet is too tired to play!");
        }
    } else if (action === 'sleep') {
        // Logic: Sleep restores all energy but reduces hunger slightly (waking up hungry)
        if (petData.stats.energy < 100) {
            petData.stats.energy = 100;
            petData.stats.hunger = Math.max(0, petData.stats.hunger - 10);
            addLog("Rest & Recovery", 0);
            alert(`${petData.name} is fully rested!`);
        } else {
            alert(`${petData.name} isn't tired yet.`);
        }
    }
    save(); 
    updateUI();
};

window.earnMoney = function() {
    if (petData.stats.energy >= 25) {
        petData.stats.money += 60;
        petData.stats.energy -= 25;
        save(); updateUI();
    } else { alert("Pet is exhausted!"); }
};

function addLog(item, cost) {
    expenseLog.push({ item, cost, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    localStorage.setItem('expenseLog', JSON.stringify(expenseLog));
}
function save() { localStorage.setItem('myPetData', JSON.stringify(petData)); }