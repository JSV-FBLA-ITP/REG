import { GoogleGenAI } from "@google/genai";

/* --- 0. SETUP AI --- */
const API_KEY = "AIzaSyBjPG57WFi9iZU2lBPZj8uPLkym_hzG77s"; 
const genAI = new GoogleGenAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

/* --- NAVIGATION HELPERS --- */
const path = window.location.pathname;
const isIndex = path.includes('index.html') || path === '/' || path.endsWith('/');
const isCC = path.includes('cc.html');
const isGame = path.includes('game.html');

/* --- 1. INDEX.HTML LOGIC (Selection) --- */
if (isIndex) {
    window.addEventListener('load', () => {
        let selectedPetType = null;
        const startBtn = document.getElementById('start-game-btn');
        const petCards = document.querySelectorAll('.pet-card');

        petCards.forEach(card => {
            card.style.cursor = 'pointer';

            card.addEventListener('click', () => {
                const petName = card.getAttribute('data-pet');

                // Visual Reset
                petCards.forEach(c => {
                    c.classList.remove('selected');
                    c.style.border = "2px solid transparent";
                    c.style.backgroundColor = "white";
                    c.style.transform = "scale(1)";
                });

                // Apply Selection
                selectedPetType = petName;
                card.classList.add('selected');
                card.style.border = "4px solid #4CAF50";
                card.style.backgroundColor = "#f0fff0";
                card.style.transform = "scale(1.05)";
                card.style.borderRadius = "15px";

                // Unlock Button
                if (startBtn) {
                    startBtn.disabled = false;
                    startBtn.textContent = `Adopt ${selectedPetType}`;
                    startBtn.style.backgroundColor = "#4CAF50";
                    startBtn.style.opacity = "1";
                    startBtn.style.cursor = "pointer";
                }
            });
        });

        if (startBtn) {
            startBtn.onclick = () => {
                if (selectedPetType) {
                    localStorage.setItem('tempPetType', selectedPetType);
                    window.location.href = 'cc.html';
                }
            };
        }
    });
}

/* --- 2. CC.HTML LOGIC (Customization & AI) --- */
if (isCC) {
    window.addEventListener('load', () => {
        const petType = localStorage.getItem('tempPetType');
        const displayTitle = document.getElementById('selected-pet-display');
        const previewImg = document.getElementById('preview-image');
        const colorSelect = document.getElementById('pet-color');
        const loadingOverlay = document.getElementById('loading-overlay');
        const form = document.getElementById('customization-form');

        if (!petType) window.location.href = 'index.html';
        if (displayTitle) displayTitle.textContent = `You have chosen: ${petType}`;
        
        // Define Coat Options
        const coatOptions = {
            'Dog': ['Golden Fur', 'Black and White Spots', 'Husky-Grey', 'Pure White'],
            'Cat': ['Orange Tabby', 'Calico Patches', 'Sleek Black', 'Siamese Points'],
            'Hamster': ['Brown and White', 'Solid Grey', 'Panda Patches'],
            'Horse': ['Chestnut Brown', 'Appaloosa Spots', 'Midnight Black'],
            'Fish': ['Gold Scales', 'Neon Blue Stripes', 'Red & White Koi']
        };

        // Populate Dropdown
        if (colorSelect && coatOptions[petType]) {
            coatOptions[petType].forEach(coat => {
                const option = document.createElement('option');
                option.value = coat;
                option.textContent = coat;
                colorSelect.appendChild(option);
            });
        }

        // AI Generation Event
        colorSelect.addEventListener('change', async () => {
            const selectedCoat = colorSelect.value;
            if (loadingOverlay) loadingOverlay.style.display = "flex";
            previewImg.style.opacity = "0.3";

            const prompt = `A professional 3D digital render of a cute ${selectedCoat} ${petType}. Pixar style, solid light background, cinematic lighting.`;

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const imageData = response.candidates[0].content.parts[0].inlineData.data;
                previewImg.src = `data:image/png;base64,${imageData}`;
            } catch (err) {
                console.error("AI Error:", err);
                alert("AI failed to draw. Check your API key.");
            } finally {
                if (loadingOverlay) loadingOverlay.style.display = "none";
                previewImg.style.opacity = "1";
            }
        });

        // Form Submission
        form.onsubmit = (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('pet-name').value;
            
            if (!nameInput || colorSelect.value === "") {
                alert("Please name your pet and select a coat!");
                return;
            }

            const myPet = {
                type: petType,
                name: nameInput,
                color: colorSelect.value,
                personality: document.getElementById('pet-personality').value,
                aiImage: previewImg.src, 
                stats: { hunger: 100, happy: 100, energy: 100, money: 500 }
            };

            localStorage.setItem('myPetData', JSON.stringify(myPet));
            window.location.href = 'game.html';
        };
    });
}

/* --- 3. GAME.HTML LOGIC (The Simulation) --- */
if (isGame) {
    let petData = JSON.parse(localStorage.getItem('myPetData'));
    if (!petData) window.location.href = 'index.html';

    window.addEventListener('load', () => {
        document.getElementById('pet-name-display').textContent = petData.name;
        
        const avatarContainer = document.getElementById('pet-avatar');
        avatarContainer.innerHTML = `<img src="${petData.aiImage}" style="max-width: 100%; height: auto; border-radius: 15px; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">`;

        updateStatsUI();

        // Time Decay Loop
        setInterval(() => {
            let hDrop = petData.personality === 'lazy' ? 0.4 : 0.8;
            let pDrop = petData.personality === 'needy' ? 1.5 : 0.7;
            
            petData.stats.hunger = Math.max(0, petData.stats.hunger - hDrop);
            petData.stats.happy = Math.max(0, petData.stats.happy - pDrop);
            petData.stats.energy = Math.max(0, petData.stats.energy - 0.3);
            
            saveGame();
            updateStatsUI();
        }, 3000);
    });

    // Global Action Handlers
    window.handleAction = function(action) {
        if (action === 'feed' && petData.stats.money >= 10) {
            petData.stats.hunger = Math.min(100, petData.stats.hunger + 25);
            petData.stats.money -= 10;
        } else if (action === 'play' && petData.stats.energy >= 15) {
            petData.stats.happy = Math.min(100, petData.stats.happy + 20);
            petData.stats.energy -= 15;
        } else if (action === 'sleep') {
            petData.stats.energy = 100;
            petData.stats.hunger = Math.max(0, petData.stats.hunger - 10);
        } else if (action === 'clean') {
            petData.stats.happy = Math.min(100, petData.stats.happy + 10);
        }
        saveGame();
        updateStatsUI();
    };

    window.earnMoney = function() {
        if (petData.stats.energy >= 20) {
            petData.stats.money += 30;
            petData.stats.energy -= 20;
            saveGame();
            updateStatsUI();
        } else {
            alert("Your pet is too tired to work! Let them sleep.");
        }
    };

    function updateStatsUI() {
        document.getElementById('hunger-circle').style.setProperty('--percent', petData.stats.hunger);
        document.getElementById('hunger-val').textContent = Math.floor(petData.stats.hunger) + '%';
        
        document.getElementById('happy-circle').style.setProperty('--percent', petData.stats.happy);
        document.getElementById('happy-val').textContent = Math.floor(petData.stats.happy) + '%';
        
        document.getElementById('energy-circle').style.setProperty('--percent', petData.stats.energy);
        document.getElementById('energy-val').textContent = Math.floor(petData.stats.energy) + '%';
        
        document.getElementById('money-display').textContent = petData.stats.money;
    }

    function saveGame() {
        localStorage.setItem('myPetData', JSON.stringify(petData));
    }
}