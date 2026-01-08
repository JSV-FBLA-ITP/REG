// Background Images API Integration
// Uses curated pet-themed images from Unsplash

// Curated list of high-quality pet-themed images from Unsplash
const PET_IMAGES = [
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1920&q=80&fit=crop', // Cute golden retriever
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1920&q=80&fit=crop', // Happy puppy
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1920&q=80&fit=crop', // Pet care scene
    'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=1920&q=80&fit=crop', // Dog in park
    'https://images.unsplash.com/photo-1517849845537-4d58cb78c7b9?w=1920&q=80&fit=crop', // Cute dog portrait
    'https://images.unsplash.com/photo-1534361960057-19889dbdf1bb?w=1920&q=80&fit=crop', // Puppy playing
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80&fit=crop', // Dog with toys
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1920&q=80&fit=crop', // Pet companionship
];

let currentImageIndex = 0;

/**
 * Loads a background image from the curated list
 * Preloads the image to ensure smooth transition
 */
function loadBackgroundImage() {
    // Select a random image from the list
    const randomIndex = Math.floor(Math.random() * PET_IMAGES.length);
    const imageUrl = PET_IMAGES[randomIndex];
    
    // Preload the image
    const img = new Image();
    
    img.onload = function() {
        // Update the background image via style tag
        let styleTag = document.getElementById('dynamic-bg-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-bg-style';
            document.head.appendChild(styleTag);
        }
        
        styleTag.textContent = `
            body::after {
                background-image: url(${imageUrl});
                opacity: 0.2;
            }
        `;
    };
    
    img.onerror = function() {
        // If image fails to load, try the next one
        currentImageIndex = (currentImageIndex + 1) % PET_IMAGES.length;
        const fallbackUrl = PET_IMAGES[currentImageIndex];
        const fallbackImg = new Image();
        fallbackImg.onload = function() {
            let styleTag = document.getElementById('dynamic-bg-style');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'dynamic-bg-style';
                document.head.appendChild(styleTag);
            }
            styleTag.textContent = `
                body::after {
                    background-image: url(${fallbackUrl});
                    opacity: 0.2;
                }
            `;
        };
        fallbackImg.src = fallbackUrl;
    };
    
    img.src = imageUrl;
}

// Initialize background image when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBackgroundImage);
} else {
    loadBackgroundImage();
}

// Change background image every 10 minutes for variety (optional)
setInterval(loadBackgroundImage, 10 * 60 * 1000);
