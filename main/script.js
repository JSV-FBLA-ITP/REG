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
function _safeParse(key, fallback) {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch (e) {
        console.warn('Failed to parse localStorage key', key, e);
        return fallback;
    }
}

let petData = _safeParse('myPetData', null);
let expenseLog = _safeParse('expenseLog', []);

// Helper: temporarily disable clickable controls to prevent rapid spamming
function disableButtonsTemporarily(selector = '.modern-btn, .action-btn', ms = 500) {
    const els = document.querySelectorAll(selector);
    if (!els || els.length === 0) return;
    els.forEach(el => el.disabled = true);
    setTimeout(() => els.forEach(el => el.disabled = false), ms);
}

// Error overlay to surface runtime errors on the page (helps when console is inaccessible)
function showErrorOverlay(msg) {
    try {
        let ov = document.getElementById('__error_overlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = '__error_overlay';
            ov.style.position = 'fixed';
            ov.style.left = '10px';
            ov.style.top = '10px';
            ov.style.zIndex = '999999';
            ov.style.maxWidth = '80%';
            ov.style.background = 'rgba(200,40,40,0.95)';
            ov.style.color = '#fff';
            ov.style.padding = '12px';
            ov.style.borderRadius = '8px';
            ov.style.fontFamily = 'monospace';
            ov.style.fontSize = '13px';
            ov.style.boxShadow = '0 6px 30px rgba(0,0,0,0.5)';
            const close = document.createElement('button');
            close.textContent = '×';
            close.style.float = 'right';
            close.style.marginLeft = '8px';
            close.style.background = 'transparent';
            close.style.color = '#fff';
            close.style.border = 'none';
            close.style.fontSize = '18px';
            close.style.cursor = 'pointer';
            close.onclick = () => ov.remove();
            ov.appendChild(close);
            const content = document.createElement('div');
            content.id = '__error_overlay_msg';
            ov.appendChild(content);
            document.body && document.body.appendChild(ov);
        }
        const content = document.getElementById('__error_overlay_msg');
        if (content) content.textContent = msg;
    } catch (e) {
        // ignore
    }
}

window.addEventListener('error', function (ev) {
    try {
        const msg = `${ev.message} (${ev.filename}:${ev.lineno}:${ev.colno})`;
        showErrorOverlay(msg);
        console.error(ev.error || ev.message);
    } catch (e) {}
});

window.addEventListener('unhandledrejection', function (ev) {
    try {
        const reason = ev.reason && ev.reason.stack ? ev.reason.stack : String(ev.reason);
        showErrorOverlay('Unhandled Rejection: ' + reason);
        console.error('Unhandled Rejection', ev.reason);
    } catch (e) {}
});

// Diminishing returns: track recent clicks per stat and scale boosts
const __recentClicks = {};
function recordClickForStat(stat, windowMs = 6000) {
    __recentClicks[stat] = (__recentClicks[stat] || 0) + 1;
    setTimeout(() => {
        __recentClicks[stat] = Math.max(0, (__recentClicks[stat] || 0) - 1);
    }, windowMs);
}

function getDiminishedBoost(stat, baseBoost) {
    if (!petData || !petData.stats) return 0;
    const current = Math.max(0, Math.min(100, petData.stats[stat] || 0));
    const remainingRatio = Math.max(0, 100 - current) / 100; // 1 -> fully empty, 0 -> full
    const clicks = __recentClicks[stat] || 0;
    const clickPenalty = 1 / (1 + clicks * 0.6); // more recent clicks reduce the effect
    const raw = baseBoost * remainingRatio * clickPenalty;
    return Math.max(0, Math.round(raw));
}

// Prevent concurrent shop actions
// shop lock removed

// Custom fixed boost mapping for play (happy) and feed (hunger)
function computeRangeBoost(stat) {
    if (!petData || !petData.stats) return 0;
    const current = Math.max(0, Math.min(100, Math.round(petData.stats[stat] || 0)));
    // Ranges:
    // <50 => +5
    // 50-60 => +4
    // 61-80 => +3
    // 81-100 => +2
    if (current < 50) return 5;
    if (current <= 60) return 4;
    if (current <= 80) return 3;
    return 2;
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    if (document.getElementById('pet-selection-grid')) initSelection();
    // legacy shop cleanup removed
    if (window.location.pathname.includes('game.html')) initGame();
});

// legacy shop cleanup removed

/* --- SELECTION LOGIC --- */
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
    const nameInput = document.getElementById('pet-name').value;
    const name = nameInput ? nameInput.trim() : "";
    const type = localStorage.getItem('tempPetType');
    if (!/^[a-zA-Z\s]{2,12}$/.test(name)) {
        alert("Oops! Name needs to be 2-12 letters only.");
        return;
    }

    petData = {
        type, name, 
        stats: { hunger: 100, happy: 100, energy: 100, health: 100, money: 500 },
        // shop fields removed
        totalExpenses: 0,
        savingsGoal: 500,
        savingsCurrent: 0,
        lastInteraction: 0,
        interactionCount: 0
    };
    localStorage.setItem('myPetData', JSON.stringify(petData));
    localStorage.setItem('expenseLog', JSON.stringify([]));
    window.location.href = 'game.html';
};

/* --- GAME LOOP & SHOP LOGIC --- */
function initGame() {
    if (!petData) return;
    if (!petData.stats.health) petData.stats.health = 100;
    // shop fields removed
    if (!petData.totalExpenses) petData.totalExpenses = 0;
    if (!petData.savingsGoal) petData.savingsGoal = 500;
    if (!petData.savingsCurrent) petData.savingsCurrent = 0;
    
    // Retrieve the Base64 image string from localStorage
    const imgURL = localStorage.getItem('petImage');

    if (imgURL) {
        // Insert the generated image inside the existing interactive container
        // so we don't remove the `#pet-display` element (which has the click handler).
        const petDisplay = document.getElementById('pet-display');
        if (petDisplay) {
            petDisplay.innerHTML = `<img src="${imgURL}" alt="Generated Pet" id="final-pet-image" style="max-width: 100%; border-radius: 15px;">`;
        } else {
            const petImg = document.getElementById('petImg');
            if (petImg) {
                petImg.insertAdjacentHTML('beforeend', `<img src="${imgURL}" alt="Generated Pet" id="final-pet-image" style="max-width: 100%; border-radius: 15px;">`);
            }
        }
    }
    
    updateUI();
    updatePetEmotion();
    setInterval(() => {
        const mult = petData.personality === 'energetic' ? 5 : 3;
        petData.stats.hunger = Math.max(0, petData.stats.hunger - mult);
        petData.stats.happy = Math.max(0, petData.stats.happy - 5);
        petData.stats.energy = Math.max(0, petData.stats.energy - 1);
        // Health decreases if other stats are low
        if (petData.stats.hunger < 30 || petData.stats.happy < 30) {
            petData.stats.health = Math.max(0, petData.stats.health - 2);
        }
        save(); updateUI(); updatePetEmotion();
    }, 2000);
}

// shop UI removed

// shop buttons removed

function updateUI() {
    if (!petData) return;
    const petNameEl = document.getElementById('pet-name-display');
    if (petNameEl) petNameEl.textContent = petData.name || '';
    const moneyEl = document.getElementById('money-display');
    if (moneyEl) moneyEl.textContent = (petData.stats && petData.stats.money) ? petData.stats.money : 0;

    ['hunger', 'happy', 'energy', 'health'].forEach(s => {
        const v = Math.round((petData.stats && petData.stats[s]) || 0);
        const barEl = document.getElementById(`${s}-bar`);
        const valEl = document.getElementById(`${s}-val`);

        if (barEl) {
            barEl.style.transition = 'width 0.5s ease, background-color 0.3s ease';
            barEl.style.width = v + '%';
            if (v < 30) barEl.style.backgroundColor = '#e74c3c';
            else if (v < 50) barEl.style.backgroundColor = '#f39c12';
            else if (v < 70) barEl.style.backgroundColor = '#f1c40f';
            else barEl.style.backgroundColor = '#2ecc71';
        }

        if (valEl) valEl.textContent = v + '%';

            // shop UI removed
    });

    const totalExpensesEl = document.getElementById('total-expenses');
    if (totalExpensesEl) totalExpensesEl.textContent = petData.totalExpenses || 0;

    const savingsGoalEl = document.getElementById('savings-goal');
    const savingsCurrentEl = document.getElementById('savings-current');
    if (savingsGoalEl) savingsGoalEl.textContent = petData.savingsGoal || 500;
    if (savingsCurrentEl) {
        petData.savingsCurrent = Math.max(0, (petData.stats && petData.stats.money) ? petData.stats.money - (petData.totalExpenses || 0) : 0);
        savingsCurrentEl.textContent = petData.savingsCurrent;
    }

    const expenseListEl = document.getElementById('expense-list');
    if (expenseListEl) {
        expenseListEl.innerHTML = expenseLog.slice(-4).reverse()
            .map(e => `<li>${e.time}: ${e.item} (-$${e.cost})</li>`).join('');
    }
}

function updatePetEmotion() {
    if(!petData) return;
    const now = Date.now();
    const emotionEl = document.getElementById('emotion-text');
    const petDisplayEl = document.getElementById('pet-display');
    if(!emotionEl) return;

    const avg = (petData.stats.hunger + petData.stats.happy + petData.stats.health) / 3;
    let emotion, emoji, petEmoji;

    if (petData.stats.health < 30) {
        const options = ["Not feeling great", "Kinda sick", "Need help", "Feeling rough"];
        emotion = options[Math.floor(Math.random() * options.length)];
        emoji = "🤒";
        petEmoji = "🤒";
    } else if (avg < 30) {
        const options = ["Really sad", "Having a rough time", "Not doing well", "Feeling down"];
        emotion = options[Math.floor(Math.random() * options.length)];
        emoji = "😢";
        petEmoji = "😢";
    } else if (avg < 50) {
        const options = ["A bit sad", "Could be better", "Not great", "Meh"];
        emotion = options[Math.floor(Math.random() * options.length)];
        emoji = "😔";
        petEmoji = "😔";
    } else if (avg < 70) {
        const options = ["Doing okay", "Not bad", "Alright", "Hanging in there"];
        emotion = options[Math.floor(Math.random() * options.length)];
        emoji = "😐";
        petEmoji = "😐";
    } else if (petData.stats.energy > 80 && petData.stats.happy > 80) {
        const options = ["SO EXCITED!", "Full of energy!", "Ready for anything!", "Let's go!!"];
        emotion = options[Math.floor(Math.random() * options.length)];
        emoji = "⚡";
        petEmoji = "⚡😄";
    } else if (avg >= 80) {
        const options = ["Super happy!", "Feeling great!", "Life is good!", "Best day ever!"];
        emotion = options[Math.floor(Math.random() * options.length)];
        emoji = "😊";
        petEmoji = "😊";
    } else {
        const options = ["Pretty good", "Doing well", "Feeling nice", "Content"];
        emotion = options[Math.floor(Math.random() * options.length)];
        emoji = "🙂";
        petEmoji = "🙂";
    }

    emotionEl.textContent = `${emoji} ${emotion}`;
    
    // Update pet display emoji with animation — but don't overwrite a generated image.
    if (petDisplayEl) {
        petDisplayEl.style.animation = 'none';
        setTimeout(() => {
            petDisplayEl.style.animation = 'bounce 0.5s ease';
            // If a final pet image exists, keep it and avoid writing emoji text over it.
            if (!petDisplayEl.querySelector('#final-pet-image')) {
                petDisplayEl.textContent = petEmoji;
            } else {
                // Store the current emoji as a data attribute for accessibility or future use.
                petDisplayEl.setAttribute('data-emoji', petEmoji);
            }
        }, 10);
    }
    
    // Random idle speech
    if (Math.random() < 0.1 && now - (petData.lastSpeechTime || 0) > 10000) {
        const idleMessages = [
            'What should we do?',
            'I\'m here!',
            'Play with me!',
            'Hello!',
            'Look at me!'
        ];
        if (avg >= 70) {
            makePetSpeak(idleMessages[Math.floor(Math.random() * idleMessages.length)], 2500);
            petData.lastSpeechTime = now;
        }
    }
}

function showActionFeedback(message, type = 'positive') {
    const feedbackEl = document.getElementById('action-feedback');
    if (!feedbackEl) return;
    
    feedbackEl.textContent = message;
    feedbackEl.className = `action-feedback ${type}`;
    feedbackEl.style.opacity = '1';
    feedbackEl.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        feedbackEl.style.opacity = '0';
        feedbackEl.style.transform = 'translateY(-20px)';
    }, 2000);
}

function makePetSpeak(message, duration = 3000) {
    const speechEl = document.getElementById('pet-speech');
    if (!speechEl) return;
    
    speechEl.textContent = message;
    speechEl.style.opacity = '1';
    speechEl.style.transform = 'translateY(0) scale(1)';
    
    setTimeout(() => {
        speechEl.style.opacity = '0';
        speechEl.style.transform = 'translateY(-10px) scale(0.9)';
    }, duration);
}

function animatePet(animationType) {
    const petDisplay = document.getElementById('pet-display');
    if (!petDisplay) return;
    
    petDisplay.style.animation = 'none';
    setTimeout(() => {
        switch(animationType) {
            case 'bounce':
                petDisplay.style.animation = 'petBounce 0.6s ease';
                break;
            case 'wiggle':
                petDisplay.style.animation = 'petWiggle 0.5s ease';
                break;
            case 'jump':
                petDisplay.style.animation = 'petJump 0.4s ease';
                break;
            case 'spin':
                petDisplay.style.animation = 'petSpin 0.5s ease';
                break;
            case 'happy':
                petDisplay.style.animation = 'petHappy 0.8s ease';
                break;
            default:
                petDisplay.style.animation = 'petBounce 0.5s ease';
        }
    }, 10);
}

window.interactWithPet = function() {
    if (!petData) return;
    
    const now = Date.now();
    petData.lastInteraction = now;
    petData.interactionCount = (petData.interactionCount || 0) + 1;
    
    // Random reactions based on pet's mood
    const avg = (petData.stats.hunger + petData.stats.happy + petData.stats.health) / 3;
    const reactions = [];
    
    if (avg >= 80) {
        reactions.push(
            { msg: 'Hi there!', anim: 'jump' },
            { msg: 'You\'re the best!', anim: 'happy' },
            { msg: 'Love you!', anim: 'bounce' },
            { msg: 'This is fun!', anim: 'wiggle' },
            { msg: 'Yay!', anim: 'jump' }
        );
    } else if (avg >= 50) {
        reactions.push(
            { msg: 'Hey!', anim: 'bounce' },
            { msg: 'What\'s up?', anim: 'wiggle' },
            { msg: 'Nice to see you!', anim: 'bounce' },
            { msg: 'Hi!', anim: 'jump' }
        );
    } else {
        reactions.push(
            { msg: 'Not feeling great...', anim: 'wiggle' },
            { msg: 'Could use some help', anim: 'bounce' },
            { msg: 'Feeling down', anim: 'wiggle' },
            { msg: 'Need some care', anim: 'bounce' }
        );
    }
    
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    makePetSpeak(reaction.msg);
    animatePet(reaction.anim);
    
    // Small happiness boost from interaction
    petData.stats.happy = Math.min(100, petData.stats.happy + 1);
    save(); updateUI(); updatePetEmotion();
};

window.petHover = function() {
    const petDisplay = document.getElementById('pet-display');
    if (petDisplay) {
        petDisplay.style.cursor = 'pointer';
        petDisplay.style.transform = 'scale(1.1)';
    }
};

window.petLeave = function() {
    const petDisplay = document.getElementById('pet-display');
    if (petDisplay) {
        petDisplay.style.transform = 'scale(1)';
    }
};

// shop code removed

window.handleAction = function(action) {
    disableButtonsTemporarily();
    let feedback = '';
    let feedbackType = 'positive';
    
    if (action === 'feed' && petData.stats.money >= 25) {
        // Use custom fixed boost mapping for hunger
        const boost = computeRangeBoost('hunger');
        if (boost > 0) {
            petData.stats.hunger = Math.min(100, petData.stats.hunger + boost);
            recordClickForStat('hunger');
        }
        petData.stats.money -= 25;
        addLog("Pet Food", 25);
        const messages = ['Nom nom nom!', 'So tasty!', 'Yummy!', 'Mmm, good!'];
        feedback = '🍽️ ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'play' && petData.stats.energy >= 20) {
        // Use custom fixed boost mapping for happiness when playing
        const boost = computeRangeBoost('happy');
        if (boost > 0) {
            petData.stats.happy = Math.min(100, petData.stats.happy + boost);
            recordClickForStat('happy');
        }
        petData.stats.energy -= 20;
        petData.stats.money -= 10;
        addLog("Toys", 10);
        const messages = ['This is fun!', 'Wheee!', 'Love playing!', 'Best day ever!'];
        feedback = '🎮 ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'sleep') {
        petData.stats.energy = 100;
        addLog("Rest", 0);
        const messages = ['Zzz...', 'Feeling refreshed!', 'Much better now', 'Ready to go!'];
        feedback = '😴 ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'clean' && petData.stats.money >= 15) {
        const healthBoost = getDiminishedBoost('health', 5);
        const happyBoost = getDiminishedBoost('happy', 3);
        if (healthBoost > 0) petData.stats.health = Math.min(100, petData.stats.health + healthBoost);
        if (happyBoost > 0) petData.stats.happy = Math.min(100, petData.stats.happy + happyBoost);
        recordClickForStat('health');
        recordClickForStat('happy');
        petData.stats.money -= 15;
        addLog("Cleaning Supplies", 15);
        const messages = ['So fresh!', 'Feeling clean!', 'Much better', 'Ahh, nice!'];
        feedback = '✨ ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'healthCheck' && petData.stats.money >= 30) {
        const boost = getDiminishedBoost('health', 10);
        if (boost > 0) petData.stats.health = Math.min(100, petData.stats.health + boost);
        recordClickForStat('health');
        petData.stats.money -= 30;
        addLog("Health Check", 30);
        const messages = ['All good!', 'Feeling great!', 'Healthy as can be!', 'Doing well!'];
        feedback = '💊 ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'vet' && petData.stats.money >= 100) {
        const boost = getDiminishedBoost('health', 30);
        if (boost > 0) petData.stats.health = Math.min(100, petData.stats.health + boost);
        recordClickForStat('health');
        petData.stats.money -= 100;
        addLog("Vet Visit", 100);
        const messages = ['Doctor says I\'m great!', 'All fixed up!', 'Feeling amazing!', 'Back to 100%!'];
        feedback = '🏥 ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'feed' || action === 'clean' || action === 'healthCheck' || action === 'vet') {
        const messages = ['Oops, broke!', 'Need more cash', 'Can\'t afford that', 'Too expensive'];
        feedback = '❌ ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'negative');
        return;
    } else if (action === 'play') {
        const messages = ['Too sleepy...', 'Need a nap first', 'Maybe later?', 'I\'m exhausted'];
        feedback = '😴 ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'negative');
        return;
    }
    
    // Animate pet display based on action
    let animType = 'bounce';
    if (action === 'feed') animType = 'happy';
    else if (action === 'play') animType = 'jump';
    else if (action === 'sleep') animType = 'wiggle';
    else if (action === 'clean') animType = 'spin';
    
    animatePet(animType);
    
    save(); updateUI(); updatePetEmotion();
};

window.earnMoney = function() {
    disableButtonsTemporarily();
    if (petData.stats.energy >= 25) {
        petData.stats.money += 60;
        petData.stats.energy -= 25;
        addLog("Chores", -60); // Negative for income
        const messages = ['Got paid!', 'Made some cash!', 'Nice work!', 'Money earned!'];
        showActionFeedback('💰 ' + messages[Math.floor(Math.random() * messages.length)], 'positive');
        save(); updateUI(); updatePetEmotion();
    } else { 
        const messages = ['Too tired...', 'Need rest first', 'Exhausted', 'Can\'t do it'];
        showActionFeedback('😴 ' + messages[Math.floor(Math.random() * messages.length)], 'negative');
    }
};

// toy/supply shops removed (stubs deleted)

function addLog(item, cost) {
    expenseLog.push({ item, cost, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    const MAX_LOG = 200;
    if (expenseLog.length > MAX_LOG) expenseLog.splice(0, expenseLog.length - MAX_LOG);
    if (cost > 0 && petData) {
        petData.totalExpenses = (petData.totalExpenses || 0) + cost;
    }
    save();
}

// Debounced save to avoid blocking the UI with frequent synchronous localStorage writes
let __saveTimeout = null;
function save() {
    if (__saveTimeout) clearTimeout(__saveTimeout);
    __saveTimeout = setTimeout(() => {
        try {
            if (petData) localStorage.setItem('myPetData', JSON.stringify(petData));
            localStorage.setItem('expenseLog', JSON.stringify(expenseLog));
        } catch (e) {
            console.warn('Failed to save data to localStorage:', e);
        }
        __saveTimeout = null;
    }, 150);
}

// End of file