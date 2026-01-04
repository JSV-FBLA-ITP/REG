// imageGeneration.js
const HF_TOKEN = "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"; // Replace with your actual token

async function generatePetImage() {
    const promptInput = document.getElementById("ai-prompt");
    const resultDiv = document.getElementById("ai-result-display");
    const petType = localStorage.getItem('myPetType') || "Pet";
    
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
        alert("Please describe your pet first!");
        return;
    }

    // Combining user input with the selected pet type for better results
    const fullPrompt = `A high-quality, cute professional photo of a ${petType}, ${userPrompt}, cinematic lighting highly detailed`;

    // Show Loading State
    resultDiv.innerHTML = `
        <div class="loading-container">
            <p>✨ Magic in progress... Generating your ${petType}...</p>
            <div class="spinner"></div>
        </div>
    `;

    try {
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    inputs: fullPrompt,
                    parameters: {
                        negative_prompt: "deformed, blurry, bad anatomy, text, watermark, low quality",
                        num_inference_steps: 35
                    }
                }),
            }
        );

        if (!response.ok) throw new Error("AI is currently busy. Please try again in a moment.");

        const blob = await response.blob();
        const imgURL = URL.createObjectURL(blob);

        resultDiv.innerHTML = `
            <div class="generated-image-container">
                <img src="${imgURL}" alt="Generated Pet" id="final-pet-image">
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px;">AI Visualization Complete!</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: #e74c3c;">Error: ${error.message}</p>`;
    }
}