const HF_TOKEN = "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"; 

async function generatePetImage() {
    const promptInput = document.getElementById("ai-prompt");
    const resultDiv = document.getElementById("ai-result-display");
    const petType = localStorage.getItem('tempPetType') || "Pet";
    
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
        alert("Please describe your pet first!");
        return;
    }

    const fullPrompt = `A high-quality, cute professional photo of a single ${petType}, ${userPrompt}, cinematic lighting highly detailed,`;

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
        
        // Convert the image to a Base64 string so it survives page navigation
        const reader = new FileReader();
        reader.readAsDataURL(blob); 
        
        reader.onloadend = function() {
            const base64data = reader.result;
            
            // Save the raw data string to localStorage
            localStorage.setItem('petImage', base64data);

            resultDiv.innerHTML = `
                <div class="generated-image-container">
                    <img src="${base64data}" alt="Generated Pet" id="final-pet-image">
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px;">AI Visualization Complete!</p>
                </div>
            `;
        };

    } catch (error) {
        resultDiv.innerHTML = `<p style="color: #e74c3c;">Error: ${error.message}</p>`;
    }
}