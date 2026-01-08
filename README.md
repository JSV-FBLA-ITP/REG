# FBLA Virtual Pet Game - Introduction to Programming Entry

## Project Overview

This program is a comprehensive virtual pet simulation game designed to teach users about the financial responsibility of pet ownership. The game combines interactive pet care mechanics with financial tracking systems to create an educational and engaging experience.

**Competition:** FBLA Introduction to Programming  
**Version:** 1.0  
**Date:** 2025

---

## Table of Contents

1. [Features](#features)
2. [Setup Instructions](#setup-instructions)
3. [How to Use](#how-to-use)
4. [Program Structure](#program-structure)
5. [Technical Details](#technical-details)
6. [Libraries and External Resources](#libraries-and-external-resources)
7. [Attribution and Credits](#attribution-and-credits)
8. [Rubric Compliance](#rubric-compliance)

---

## Features

### Core Functionality

#### 1. Pet Customization
- **Name Selection:** Users can name their pet with validation (2-12 characters, letters and spaces only)
- **Pet Type Selection:** Choose from multiple pet types (Cat, Dog, Fish, Hamster, Horse)
- **AI Image Generation:** Optional AI-generated pet images using HuggingFace API

#### 2. Pet Care System
- **Feed:** Purchase food ($25) to increase hunger stat
- **Play:** Spend time playing ($10, requires 20 energy) to increase happiness
- **Sleep:** Free action to restore energy to 100%
- **Clean:** Purchase cleaning supplies ($15) to improve health and happiness
- **Health Check:** Medical checkup ($30) to boost health
- **Vet Visit:** Comprehensive care ($100) for significant health restoration

#### 3. Financial Responsibility Features
- **Expense Tracking:** Complete log of all purchases and transactions
- **Total Expenses:** Running total of all money spent on pet care
- **Savings Goals:** Track progress toward financial goals
- **Income System:** Earn money through chores (requires 25 energy, earns $60)

#### 4. Power-Up Shop
- **Stat Loss Reduction:** Purchase upgrades to reduce stat decay by 10% per upgrade
- **Maximum Upgrades:** 3 upgrades per stat (30% total reduction)
- **Cost:** $300 per upgrade
- **Available for:** Hunger, Happiness, Energy, and Health stats

#### 5. Interactive Pet System
- **Pet Reactions:** Dynamic emotional responses based on care level
- **Click Interactions:** Click/tap pet for playful reactions
- **Speech Bubbles:** Pet communicates through speech bubbles
- **Animations:** Various animations (bounce, wiggle, jump, spin, happy)
- **Mood System:** Pet's mood changes based on hunger, happiness, and health levels

#### 6. Game Over System
- **Health Monitoring:** Game ends when pet health reaches zero
- **Restart Option:** Clear all data and return to pet selection

#### 7. Theme System
- **Light/Dark Mode:** Toggle between themes
- **Persistent Preference:** Theme choice saved in localStorage

---

## Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge - latest versions)
- Internet connection (for Google Fonts and AI image generation)

### Installation

1. **Download/Clone the Project**
   ```bash
   # If using git
   git clone [repository-url]
   cd REG
   ```

2. **Open the Application**
   - Simply open `index.html` in your web browser
   - No server setup or installation required
   - All files are self-contained

3. **File Structure**
   ```
   REG/
   ├── index.html              # Main pet selection page
   ├── home.html               # Home screen
   ├── README.md               # This file
   └── main/
       ├── html/
       │   ├── customize.html  # Pet customization page
       │   ├── game.html       # Main game page
       │   └── credits.html    # Credits page
       ├── script.js           # Main game logic
       ├── styles.css          # Game page styles
       ├── modern-styles.css   # Modern UI styles
       ├── imageGeneration.js # AI image generation
       └── img/                # Pet type images
   ```

---

## How to Use

### Starting the Game

1. **Select a Pet Type**
   - On `index.html`, click on a pet type card (Cat, Dog, Fish, Hamster, or Horse)
   - The selected card will be highlighted
   - Click "Start" button to proceed

2. **Customize Your Pet**
   - Enter a pet name (2-12 characters, letters and spaces only)
   - Optionally generate an AI image by describing your pet
   - Click "Create Pet" to finalize

3. **Play the Game**
   - Monitor your pet's stats (Hunger, Happiness, Energy, Health)
   - Use action buttons to care for your pet
   - Earn money through chores
   - Purchase power-ups to reduce stat decay
   - Keep your pet healthy and happy!

### Understanding the Interface

- **Stat Bars:** Visual representation of pet's current status
  - Green (70-100%): Excellent
  - Yellow (50-69%): Good
  - Orange (30-49%): Low
  - Red (0-29%): Critical

- **Money Display:** Shows current available funds
- **Expense Log:** Last 4 transactions displayed
- **Pet Display:** Click to interact with your pet
- **Action Buttons:** Perform care actions
- **Power-Up Shop:** Access via "Open Power-Up Shop" button

### Game Mechanics

- **Stat Decay:** Stats decrease over time automatically
- **Diminishing Returns:** Repeated actions have reduced effectiveness
- **Energy Requirements:** Some actions require energy
- **Financial Limits:** Actions cost money - manage your budget wisely
- **Health System:** Low hunger or happiness causes health to decrease

---

## Program Structure

### Code Organization

The program is organized into **15 logical modules** in `script.js`:

1. **Theme Management:** Light/dark mode toggle and persistence
2. **Data Management & Persistence:** localStorage operations and data validation
3. **Input Validation:** Comprehensive validation for all user inputs
4. **UI Utility Functions:** Button disabling, error handling
5. **Stat Management & Boost Calculations:** Stat calculations and diminishing returns
6. **Pet Selection & Initialization:** Pet type selection and creation
7. **Game Loop & Stat Decay:** Main game loop and automatic stat changes
8. **UI Updates & Display:** Dynamic UI updates based on game state
9. **Visual Feedback & Animations:** Action feedback and pet animations
10. **Pet Interaction System:** Click interactions and pet reactions
11. **Pet Care Actions:** All care action handlers with validation
12. **Expense Tracking & Financial System:** Expense logging and financial calculations
13. **Power-Up Shop System:** Shop modal and upgrade purchases
14. **Game Over System:** Game over detection and restart functionality
15. **Initialization:** DOM ready handlers and page initialization

### Data Structures

#### Pet Data Object
```javascript
{
    type: string,              // Pet type (cat, dog, etc.)
    name: string,              // Pet name
    stats: {
        hunger: number,         // 0-100
        happy: number,          // 0-100
        energy: number,         // 0-100
        health: number,         // 0-100
        money: number           // Current funds
    },
    shop_multipliers: {        // Stat loss multipliers (0.7-1.0)
        hunger: number,
        happy: number,
        energy: number,
        health: number
    },
    shop_upgrades: {           // Upgrade counts (0-3)
        hunger: number,
        happy: number,
        energy: number,
        health: number
    },
    totalExpenses: number,     // Total money spent
    savingsGoal: number,       // Savings target
    savingsCurrent: number,     // Current savings
    lastInteraction: number,   // Timestamp
    interactionCount: number   // Total interactions
}
```

#### Expense Log Array
```javascript
[
    {
        item: string,          // Item description
        cost: number,          // Cost amount (negative for income)
        time: string           // Timestamp (HH:MM format)
    },
    ...
]
```

### Key Functions

- **`validatePetName(name)`:** Validates pet name with syntactical and semantic checks
- **`validatePurchase(cost, currentMoney)`:** Validates purchase affordability
- **`validateStatValue(statName, value)`:** Ensures stats stay within 0-100 range
- **`handleAction(action)`:** Processes all pet care actions with validation
- **`updateUI()`:** Updates all UI elements with current game state
- **`updatePetEmotion()`:** Calculates and displays pet's current emotion
- **`addLog(item, cost)`:** Adds expense entry with validation
- **`save()`:** Debounced localStorage save to prevent UI blocking

---

## Technical Details

### Technologies Used

- **HTML5:** Semantic markup and structure
- **CSS3:** Modern styling with variables, animations, and responsive design
- **JavaScript (ES6+):** Vanilla JavaScript, no frameworks
- **LocalStorage API:** Data persistence
- **Google Fonts API:** Bricolage Grotesque font family
- **HuggingFace API:** AI image generation (optional feature)

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Considerations

- **Debounced Saves:** localStorage writes are debounced to prevent UI blocking
- **Log Size Limits:** Expense log capped at 200 entries to prevent memory issues
- **Efficient DOM Updates:** Only updates changed elements
- **Animation Optimization:** CSS animations for smooth performance

### Input Validation

The program implements **comprehensive input validation** on both syntactical and semantic levels:

#### Syntactical Validation
- **Pet Name:** Regex pattern `/^[a-zA-Z\s]{2,12}$/` ensures proper format
- **Money Amounts:** Type checking and range validation
- **Stat Values:** Clamped to 0-100 range with type checking

#### Semantic Validation
- **Pet Name:** Length checks, word count limits, meaningful content
- **Purchases:** Affordability checks, sufficient funds validation
- **Actions:** Energy requirements, game state checks (game over prevention)

---

## Libraries and External Resources

### Google Fonts
- **Font:** Bricolage Grotesque
- **Weights Used:** 200, 300, 400, 500, 600, 700, 800
- **License:** Open Font License (OFL)
- **URL:** https://fonts.googleapis.com/css2?family=Bricolage+Grotesque
- **Usage:** Primary font family for all text elements

### HuggingFace API
- **Service:** HuggingFace Inference API
- **Model:** stabilityai/stable-diffusion-xl-base-1.0
- **Purpose:** Optional AI-generated pet images
- **License:** Model-specific license (check HuggingFace for details)
- **URL:** https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0
- **Usage:** Only used when user explicitly requests image generation

### No Other External Libraries
- This project uses **zero JavaScript frameworks or libraries**
- All functionality is implemented with vanilla JavaScript
- No jQuery, React, Vue, or other dependencies

---

## Attribution and Credits

### Code Attribution
- **Primary Developer:** FBLA Team
- **Development Date:** 2025
- **License:** Educational use for FBLA competition

### External Resources

1. **Google Fonts - Bricolage Grotesque**
   - Provider: Google LLC
   - License: Open Font License (OFL)
   - Attribution: Fonts are open source and free to use
   - Link: https://fonts.google.com/specimen/Bricolage+Grotesque

2. **HuggingFace Inference API**
   - Provider: HuggingFace, Inc.
   - Service: AI model hosting and inference
   - Model: Stable Diffusion XL Base 1.0 by Stability AI
   - Usage: Optional feature for pet image generation
   - Note: Requires API token (included in code for demonstration)

3. **Stable Diffusion XL Model**
   - Original Model: Stability AI
   - Hosted by: HuggingFace
   - Purpose: Text-to-image generation
   - License: Check HuggingFace model card for specific license terms

### Image Assets
- Pet type images (Cat-Pic.jpeg, Dog-Pic.webp, etc.) are included in the project
- Source: Project assets (origin not specified in original files)

### No Templates Used
- This project was built from scratch
- No code templates, boilerplates, or starter kits were used
- All HTML, CSS, and JavaScript written specifically for this project

---

## Rubric Compliance

### Code Quality & Structure ✅

- **Comments:** Comprehensive JSDoc-style comments throughout code
- **Naming Conventions:** Clear, descriptive function and variable names
- **Formatting:** Consistent indentation and code style
- **Modular Structure:** Code organized into 15 logical modules
- **Readability:** Well-organized functions with single responsibilities

### User Experience ✅

- **Intuitive Interface:** Clear visual indicators and button labels
- **Instructions:** Inline help text and clear action buttons
- **Navigation:** Consistent navigation between pages
- **No Spelling Errors:** All text reviewed and corrected
- **Interactive Help:** Tooltips and feedback messages throughout

### Input Validation ✅

- **Syntactical Validation:** Regex patterns, type checking, range validation
- **Semantic Validation:** Meaningful content checks, affordability validation
- **Edge Cases:** Handles empty inputs, invalid types, out-of-range values
- **User Feedback:** Clear error messages for invalid inputs

### Functionality ✅

- **Addresses Prompt:** Fully implements virtual pet with financial tracking
- **Customization:** Name and type selection with validation
- **Pet Care:** All required actions (feed, play, rest, clean, health check)
- **Financial System:** Expense tracking, savings goals, cost of care
- **Reactions:** Dynamic pet emotions based on care level
- **Reports:** Expense log and financial summaries

### Data & Logic ✅

- **Data Structures:** Appropriate use of objects and arrays
- **Variable Naming:** Clear, descriptive names
- **Data Types:** Correct types used throughout (numbers, strings, objects, arrays)
- **Scope:** Proper variable scoping (global, function-level)
- **Updates:** Data updates correctly when actions occur

### Documentation ✅

- **README File:** This comprehensive documentation
- **Source Code:** All code files included and commented
- **Libraries List:** Complete list of external resources
- **Attribution:** Proper credit for all external resources
- **Usage Instructions:** Clear setup and usage guide

---

## Additional Notes

### Educational Value

This program teaches:
- **Financial Responsibility:** Understanding costs of pet ownership
- **Time Management:** Balancing pet care needs
- **Decision Making:** Strategic choices about resource allocation
- **Budgeting:** Managing limited funds effectively

### Future Enhancements (Not Implemented)

Potential additions for future versions:
- Multiple pets
- Pet evolution/aging system
- Achievement system
- Social features
- Mobile app version

---

## Contact & Support

For questions about this project:
- Review the code comments in `script.js`
- Check the inline help text in the game interface
- Refer to this README for setup and usage instructions

---

**End of Documentation**
