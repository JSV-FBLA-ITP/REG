

let selectedPet = null;

function updateSelectionUI(selectedElem) {
	const messageEl = document.getElementById('selection-message');
	const startBtn = document.getElementById('start-game-btn');

	
	document.querySelectorAll('[data-pet]').forEach(card => {
		card.classList.toggle('selected', card === selectedElem);
	});

	if (!selectedElem) {
		if (messageEl) messageEl.innerHTML = `<p class="text-xl text-gray-600 font-semibold">Click a pet to see a preview of your choice!</p>`;
		if (startBtn) startBtn.disabled = true;
		return;
	}

	const petName = selectedElem.dataset.pet || '';
	const img = selectedElem.querySelector('img');
	const desc = selectedElem.querySelector('p') ? selectedElem.querySelector('p').textContent : '';

	if (messageEl) {
		messageEl.innerHTML = `
			<div class="preview">
				${img ? `<img src="${img.getAttribute('src')}" alt="${petName} preview" class="preview-img" style="max-width:120px;display:block;margin-bottom:8px;">` : ''}
				<div>
					<p class="text-xl text-gray-700 font-semibold">${petName}</p>
					<p class="text-sm text-gray-500">${desc}</p>
				</div>
			</div>
		`;
	}

	if (startBtn) startBtn.disabled = false;
}


function selectPet(el) {
	if (!el) return;
	selectedPet = el.dataset ? el.dataset.pet : null;
	updateSelectionUI(el);
}


function startGame() {
	if (!selectedPet) return;
	try {
		localStorage.setItem('selectedPet', selectedPet);
	} catch (e) {
	}
	window.location.href = 'game.html';
}

document.addEventListener('DOMContentLoaded', () => {
	// Attach click handlers to pet cards (in case inline handlers are not used)
	document.querySelectorAll('[data-pet]').forEach(card => {
		card.addEventListener('click', () => selectPet(card));
	});

	// Ensure start button is disabled initially
	const startBtn = document.getElementById('start-game-btn');
	if (startBtn) startBtn.disabled = true;
});
