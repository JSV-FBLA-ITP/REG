let selectedPetName = null;
        const messageBox = document.getElementById('selection-message').querySelector('p');
        const startGameBtn = document.getElementById('start-game-btn');

        /**
         * Handles the selection of a pet card.
         * @param {HTMLElement} selectedElement - The pet card element that was clicked.
         */
        function selectPet(selectedElement) {
            // Get all pet cards
            const petCards = document.querySelectorAll('.pet-card');
            
            // 1. Reset all cards: Remove both 'selected' and 'unselected' classes
            petCards.forEach(card => {
                card.classList.remove('selected');
                card.classList.remove('unselected');
            });

            // 2. add the 'selected' class to the clicked card
            selectedElement.classList.add('selected');

            // 3. Add the unselected class to all other cards to dim them
            petCards.forEach(card => {
                if (card !== selectedElement) {
                    card.classList.add('unselected');
                }
            });

            // 4. get the pet name
            selectedPetName = selectedElement.getAttribute('data-pet');
            
            // update the message box
            messageBox.innerHTML = `Great choice! You've selected the <strong>${selectedPetName}</strong>. Hit 'Start Game' below!`;
            messageBox.classList.add('text-indigo-600');
            messageBox.classList.remove('text-gray-600');
            
            // enable the Start Game button
            startGameBtn.disabled = false;
        }

        /**
         * simulates starting the game.
         */
        function startGame() {
            if (selectedPetName) {
                // In a real game, this would lead to the next screen or initialize game state
                messageBox.innerHTML = `Loading the adventure with your new <strong>${selectedPetName}</strong>... Have fun! 🎉`;
                startGameBtn.disabled = true; // disable button after click
            }
        }