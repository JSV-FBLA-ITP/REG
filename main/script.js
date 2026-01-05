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
        shop_multipliers: { hunger: 1.0, happy: 1.0, energy: 1.0, health: 1.0 },
        shop_upgrades: { hunger: 0, happy: 0, energy: 0, health: 0 },
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
    if (!petData.shop_multipliers) petData.shop_multipliers = { hunger: 1.0, happy: 1.0, energy: 1.0, health: 1.0 };
    if (!petData.shop_upgrades) petData.shop_upgrades = { hunger: 0, happy: 0, energy: 0, health: 0 };
    if (!petData.stats.health) petData.stats.health = 100;
    if (!petData.totalExpenses) petData.totalExpenses = 0;
    if (!petData.savingsGoal) petData.savingsGoal = 500;
    if (!petData.savingsCurrent) petData.savingsCurrent = 0;
    
    // Retrieve the Base64 image string from localStorage
    const imgURL = localStorage.getItem('petImage');

    if (imgURL) {
        document.getElementById('petImg').innerHTML = `
            <img src="${imgURL}" alt="Generated Pet" id="final-pet-image" style="max-width: 100%; border-radius: 15px;">
        `;
    }
    
    updateUI();
    updatePetEmotion();
    setInterval(() => {
        const mult = petData.personality === 'energetic' ? 5 : 3;
        petData.stats.hunger = Math.max(0, petData.stats.hunger - (mult * petData.shop_multipliers.hunger));
        petData.stats.happy = Math.max(0, petData.stats.happy - (5 * petData.shop_multipliers.happy));
        petData.stats.energy = Math.max(0, petData.stats.energy - (1 * petData.shop_multipliers.energy));
        // Health decreases if other stats are low
        if (petData.stats.hunger < 30 || petData.stats.happy < 30) {
            petData.stats.health = Math.max(0, petData.stats.health - (2 * petData.shop_multipliers.health));
        }
        save(); updateUI(); updatePetEmotion();
    }, 2000);
}

function updateUI() {
    if(!petData) return;
    document.getElementById('pet-name-display').textContent = petData.name;
    document.getElementById('money-display').textContent = petData.stats.money;
    
    ['hunger', 'happy', 'energy', 'health'].forEach(s => {
        const v = Math.round(petData.stats[s]);
        const barEl = document.getElementById(`${s}-bar`);
        const valEl = document.getElementById(`${s}-val`);
        
        if(barEl) {
            // Animate bar width change
            barEl.style.transition = 'width 0.5s ease, background-color 0.3s ease';
            barEl.style.width = v + '%';
            
            // Change color based on value
            if (v < 30) {
                barEl.style.backgroundColor = '#e74c3c'; // Red
            } else if (v < 50) {
                barEl.style.backgroundColor = '#f39c12'; // Orange
            } else if (v < 70) {
                barEl.style.backgroundColor = '#f1c40f'; // Yellow
            } else {
                barEl.style.backgroundColor = '#2ecc71'; // Green
            }
        }
        
        if(valEl) {
            valEl.textContent = v + '%';
        }

        const countEl = document.getElementById(`shop_count_${s}`);
        if(countEl) {
            const count = petData.shop_upgrades[s] || 0;
            const btn = countEl.parentElement.nextElementSibling;
            if (count >= 3) {
                countEl.textContent = "MAXED OUT";
                if(btn) btn.disabled = true;
            } else {
                countEl.textContent = `${3 - count} left`;
            }
        }
    });

    // Update expense summary
    const totalExpensesEl = document.getElementById('total-expenses');
    if (totalExpensesEl) {
        totalExpensesEl.textContent = petData.totalExpenses || 0;
    }

    // Update savings
    const savingsGoalEl = document.getElementById('savings-goal');
    const savingsCurrentEl = document.getElementById('savings-current');
    if (savingsGoalEl) savingsGoalEl.textContent = petData.savingsGoal || 500;
    if (savingsCurrentEl) {
        petData.savingsCurrent = Math.max(0, petData.stats.money - (petData.totalExpenses || 0));
        savingsCurrentEl.textContent = petData.savingsCurrent;
    }

    document.getElementById('expense-list').innerHTML = expenseLog.slice(-4).reverse()
        .map(e => `<li>${e.time}: ${e.item} (-$${e.cost})</li>`).join('');
}

function updatePetEmotion() {
    if(!petData) return;
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
    
    // Update pet display emoji with animation
    if (petDisplayEl) {
        petDisplayEl.style.animation = 'none';
        setTimeout(() => {
            petDisplayEl.style.animation = 'bounce 0.5s ease';
            petDisplayEl.textContent = petEmoji;
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

window.shop_toggleWindow = function() {
    const modal = document.getElementById('shop_powerup_modal');
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
};

window.shop_purchaseUpgrade = function(type) {
    if (!petData.shop_upgrades[type]) petData.shop_upgrades[type] = 0;
    if (petData.shop_upgrades[type] < 3 && petData.stats.money >= 300) {
        petData.stats.money -= 300;
        petData.shop_upgrades[type]++;
        if (!petData.shop_multipliers[type]) petData.shop_multipliers[type] = 1.0;
        petData.shop_multipliers[type] *= 0.9;
        addLog(`${type.toUpperCase()} Upgrade`, 300);
        const messages = ['Upgrade complete!', 'Nice upgrade!', 'Got it!', 'Upgraded!'];
        showActionFeedback('⚡ ' + messages[Math.floor(Math.random() * messages.length)], 'positive');
        save(); updateUI();
    } else { 
        const messages = ['Can\'t buy that', 'Not enough money', 'Too expensive', 'Can\'t afford it'];
        showActionFeedback('❌ ' + messages[Math.floor(Math.random() * messages.length)], 'negative');
    }
};

window.handleAction = function(action) {
    let feedback = '';
    let feedbackType = 'positive';
    
    if (action === 'feed' && petData.stats.money >= 25) {
        petData.stats.hunger = Math.min(100, petData.stats.hunger + 7);
        petData.stats.money -= 25;
        addLog("Pet Food", 25);
        const messages = ['Nom nom nom!', 'So tasty!', 'Yummy!', 'Mmm, good!'];
        feedback = '🍽️ ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'play' && petData.stats.energy >= 20) {
        petData.stats.happy = Math.min(100, petData.stats.happy + 5);
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
        petData.stats.health = Math.min(100, petData.stats.health + 5);
        petData.stats.happy = Math.min(100, petData.stats.happy + 3);
        petData.stats.money -= 15;
        addLog("Cleaning Supplies", 15);
        const messages = ['So fresh!', 'Feeling clean!', 'Much better', 'Ahh, nice!'];
        feedback = '✨ ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'healthCheck' && petData.stats.money >= 30) {
        petData.stats.health = Math.min(100, petData.stats.health + 10);
        petData.stats.money -= 30;
        addLog("Health Check", 30);
        const messages = ['All good!', 'Feeling great!', 'Healthy as can be!', 'Doing well!'];
        feedback = '💊 ' + messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(feedback, 'positive');
    } else if (action === 'vet' && petData.stats.money >= 100) {
        petData.stats.health = Math.min(100, petData.stats.health + 30);
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

window.openToyShop = function() {
    document.getElementById('toy_shop_modal').style.display = 'flex';
};

window.closeToyShop = function() {
    document.getElementById('toy_shop_modal').style.display = 'none';
};

window.buyToy = function(toyType, cost) {
    if (petData.stats.money >= cost) {
        petData.stats.money -= cost;
        let happinessBoost = 0;
        let itemName = '';
        let messages = [];
        
        if (toyType === 'ball') {
            happinessBoost = 5;
            itemName = 'Tennis Ball';
            messages = ['Bouncy!', 'Love this ball!', 'So fun!', 'My favorite!'];
        } else if (toyType === 'toy') {
            happinessBoost = 8;
            itemName = 'Stuffed Toy';
            messages = ['New friend!', 'So cuddly!', 'Love it!', 'Best toy ever!'];
        } else if (toyType === 'puzzle') {
            happinessBoost = 10;
            itemName = 'Puzzle Game';
            messages = ['This is awesome!', 'So cool!', 'Love puzzles!', 'Amazing!'];
        }
        
        petData.stats.happy = Math.min(100, petData.stats.happy + happinessBoost);
        addLog(itemName, cost);
        const msg = messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(`🎁 ${msg}`, 'positive');
        
        animatePet('jump');
        makePetSpeak('New toy!', 2000);
        
        save(); updateUI(); updatePetEmotion();
    } else {
        const messages = ['Too broke for that', 'Can\'t afford it', 'Need more cash', 'Not enough money'];
        showActionFeedback('❌ ' + messages[Math.floor(Math.random() * messages.length)], 'negative');
    }
};

window.openSupplyShop = function() {
    document.getElementById('supply_shop_modal').style.display = 'flex';
};

window.closeSupplyShop = function() {
    document.getElementById('supply_shop_modal').style.display = 'none';
};

window.buySupply = function(supplyType, cost) {
    if (petData.stats.money >= cost) {
        petData.stats.money -= cost;
        let itemName = '';
        let statBoost = {};
        let messages = [];
        
        if (supplyType === 'premiumFood') {
            statBoost = { hunger: 10 };
            itemName = 'Premium Food';
            messages = ['This is delicious!', 'So much better!', 'Yummy!', 'Tastes amazing!'];
        } else if (supplyType === 'grooming') {
            statBoost = { health: 10 };
            itemName = 'Grooming Kit';
            messages = ['Feeling fresh!', 'So clean!', 'Much better!', 'Nice and tidy!'];
        } else if (supplyType === 'bed') {
            statBoost = { energy: 15 };
            itemName = 'Comfy Bed';
            messages = ['So comfy!', 'Best sleep ever!', 'Love this bed!', 'So cozy!'];
        }
        
        Object.keys(statBoost).forEach(stat => {
            petData.stats[stat] = Math.min(100, petData.stats[stat] + statBoost[stat]);
        });
        
        addLog(itemName, cost);
        const msg = messages[Math.floor(Math.random() * messages.length)];
        showActionFeedback(msg, 'positive');
        
        animatePet('happy');
        makePetSpeak('Thanks!', 2000);
        
        save(); updateUI(); updatePetEmotion();
    } else {
        const messages = ['Too expensive', 'Can\'t buy that', 'Need more money', 'Broke'];
        showActionFeedback('❌ ' + messages[Math.floor(Math.random() * messages.length)], 'negative');
    }
};

function addLog(item, cost) {
    expenseLog.push({ item, cost, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    if (cost > 0) {
        petData.totalExpenses = (petData.totalExpenses || 0) + cost;
    }
    localStorage.setItem('expenseLog', JSON.stringify(expenseLog));
    save();
}
function save() { localStorage.setItem('myPetData', JSON.stringify(petData)); }