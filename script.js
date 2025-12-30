/* script.js */

/* --- HELPER: Navigation Check --- */
const path = window.location.pathname;
const isIndex = path.includes('index.html') || path === '/' || path.endsWith('/');
const isCC = path.includes('cc.html');
const isGame = path.includes('game.html');

/* --- 1. INDEX.HTML LOGIC (Selection) --- */
if (isIndex) {
    let selectedPetType = null;
    const startBtn = document.getElementById('start-game-btn');

    // Handle clicking a pet card
    document.querySelectorAll('[data-pet]').forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from others
            document.querySelectorAll('[data-pet]').forEach(c => {
                c.classList.remove('selected');
                c.classList.add('unselected'); // Fade out others
            });
            
            // Add to current
            card.classList.remove('unselected');
            card.classList.add('selected');
            selectedPetType = card.dataset.pet;
            
            // Enable button
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.textContent = `Adopt ${selectedPetType}`;
            }
        });
    });

    // Handle Start Button
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (selectedPetType) {
                localStorage.setItem('tempPetType', selectedPetType);
                window.location.href = 'cc.html';
            }
        });
    }
}

/* --- 2. CC.HTML LOGIC (Customization) --- */
if (isCC) {
    const petType = localStorage.getItem('tempPetType');
    const displayTitle = document.getElementById('selected-pet-display');
    const previewImg = document.getElementById('preview-image');
    const colorSelect = document.getElementById('pet-color');

    // Redirect if no pet selected
    if (!petType) {
        window.location.href = 'index.html';
    }

    // Update Text
    if (displayTitle) displayTitle.textContent = `You are adopting a ${petType}!`;
    
    // Image Map
    const imgMap = {
        'Dog': '../img/Dog-Pic.webp',
        'Cat': '../img/Cat-Pic.jpeg',
        'Hamster': '../img/hamster-pic.jpeg',
        'Horse': '../img/horse-pic.jpeg',
        'Fish': '../img/fish-pic.jpeg'
    };
    if (previewImg) previewImg.src = imgMap[petType] || '';

    // Populate Color Options based on Pet Type
    const colorOptions = {
        'Dog': ['Golden', 'Black', 'Spotted', 'White'],
        'Cat': ['Calico', 'Black', 'White', 'Orange'],
        'Hamster': ['Brown', 'White', 'Grey', 'Tan'],
        'Horse': ['Brown', 'Black', 'White', 'Chestnut'],
        'Fish': ['Gold', 'Blue', 'Red', 'Neon']
    };

    if (colorSelect && colorOptions[petType]) {
        colorOptions[petType].forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            colorSelect.appendChild(option);
        });
    }

    // Function called by the button in cc.html
    window.finalizePet = function() {
        const nameInput = document.getElementById('pet-name').value;
        const colorInput = document.getElementById('pet-color').value;
        const personalityInput = document.getElementById('pet-personality').value;

        if (!nameInput) {
            alert("Please give your pet a name!");
            return;
        }

        const myPet = {
            type: petType,
            name: nameInput,
            color: colorInput,
            personality: personalityInput,
            stats: {
                hunger: 100,
                happy: 100,
                energy: 100,
                money: 500
            }
        };

        localStorage.setItem('myPetData', JSON.stringify(myPet));
        window.location.href = 'game.html';
    };
}

/* --- 3. GAME.HTML LOGIC (The Game) --- */
if (isGame) {
    let petData = JSON.parse(localStorage.getItem('myPetData'));

    if (!petData) {
        window.location.href = 'index.html';
    }

    // Initialize UI
    document.getElementById('pet-name-display').textContent = petData.name;
    document.getElementById('money-display').textContent = petData.stats.money;
    
    // Set Avatar
    const imgMap = {
        'Dog': '../img/Dog-Pic.webp',
        'Cat': '../img/Cat-Pic.jpeg',
        'Hamster': '../img/hamster-pic.jpeg',
        'Horse': '../img/horse-pic.jpeg',
        'Fish': '../img/fish-pic.jpeg'
    };
    
    // Adjust logic if you want to change images based on color later
    const avatarContainer = document.getElementById('pet-avatar');
    avatarContainer.innerHTML = `<img src="${imgMap[petData.type]}" style="max-height: 250px; width: auto; border-radius: 10px;">`;

    // UI Update Function
    function updateStatsUI() {
        document.getElementById('hunger-circle').style.setProperty('--percent', petData.stats.hunger);
        document.getElementById('hunger-val').textContent = petData.stats.hunger + '%';

        document.getElementById('happy-circle').style.setProperty('--percent', petData.stats.happy);
        document.getElementById('happy-val').textContent = petData.stats.happy + '%';

        document.getElementById('energy-circle').style.setProperty('--percent', petData.stats.energy);
        document.getElementById('energy-val').textContent = petData.stats.energy + '%';

        document.getElementById('money-display').textContent = petData.stats.money;
    }

    // Button Handlers
    window.handleAction = function(action) {
        if (action === 'feed') {
            if (petData.stats.money >= 10) {
                petData.stats.hunger = Math.min(100, petData.stats.hunger + 20);
                petData.stats.money -= 10;
            } else {
                alert("Not enough money! Click 'Work' to earn more.");
            }
        }
        if (action === 'play') {
            if (petData.stats.energy >= 10) {
                petData.stats.happy = Math.min(100, petData.stats.happy + 15);
                petData.stats.energy = Math.max(0, petData.stats.energy - 10);
            } else {
                alert("Too tired to play! Try Sleeping.");
            }
        }
        if (action === 'sleep') {
            petData.stats.energy = 100;
        }
        if (action === 'clean') {
            petData.stats.happy = Math.min(100, petData.stats.happy + 5);
        }

        saveGame();
        updateStatsUI();
    };

    window.earnMoney = function() {
        if (petData.stats.energy >= 15) {
            petData.stats.money += 20;
            petData.stats.energy = Math.max(0, petData.stats.energy - 15); 
            saveGame();
            updateStatsUI();
        } else {
            alert("Too tired to work! Sleep first.");
        }
    };

    function saveGame() {
        localStorage.setItem('myPetData', JSON.stringify(petData));
    }

    // Game Loop (Time Decay)
    setInterval(() => {
        // Modifiers based on personality
        let hungerDrop = 1;
        let happyDrop = 1;
        
        if (petData.personality === 'lazy') hungerDrop = 0.5;
        if (petData.personality === 'needy') happyDrop = 2;

        petData.stats.hunger = Math.max(0, Math.floor(petData.stats.hunger - hungerDrop));
        petData.stats.happy = Math.max(0, Math.floor(petData.stats.happy - happyDrop));
        petData.stats.energy = Math.max(0, petData.stats.energy - 1);
        
        saveGame();
        updateStatsUI();
    }, 2000); // Ticks every 2 seconds

    // Initial load
    updateStatsUI();
}