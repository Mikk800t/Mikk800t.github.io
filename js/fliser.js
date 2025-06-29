// DOM Element References
const heightInput = document.getElementById('height');
const baseInput = document.getElementById('base'); // 'base' is used for width in this context
const tileSizeSelect = document.getElementById('tileSize');
const groutAmountSelect = document.getElementById('groutAmount');
const wastePercentageInput = document.getElementById('wastePercentage');

// Result fields
const calculatedAreaInput = document.getElementById('calculatedArea');
const totalTilesInput = document.getElementById('totalTiles');
const totalAdhesiveInput = document.getElementById('totalAdhesive');
const totalGroutInput = document.getElementById('totalGrout');

// Buttons & Feedback
const copyResultsButton = document.getElementById('copyResultsButton');
const saveCsvButton = document.getElementById('saveCsvButton');
const copyFeedbackSpan = document.getElementById('copyFeedback');

let feedbackTimeout = null; // To manage the timeout for hiding feedback

function showCopyFeedback(message, success = true) {
    if (!copyFeedbackSpan) return;

    copyFeedbackSpan.textContent = message;
    copyFeedbackSpan.style.backgroundColor = success ? '#218838' : '#c82333'; // Green for success, Red for error
    copyFeedbackSpan.style.display = 'inline-block'; // Make it visible
    copyFeedbackSpan.classList.add('show');

    // Clear previous timeout if any
    if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
    }

    // Hide the feedback after 3 seconds
    feedbackTimeout = setTimeout(() => {
        copyFeedbackSpan.classList.remove('show');
        // Wait for transition to finish before setting display to none
        setTimeout(() => {
            copyFeedbackSpan.style.display = 'none';
        }, 500); // Match transition duration
    }, 3000);
}

function calculateTileMaterials() {
    const height = parseFloat(heightInput.value);
    const width = parseFloat(baseInput.value);

    if (isNaN(height) || isNaN(width) || height <= 0 || width <= 0) {
        calculatedAreaInput.value = '';
        totalTilesInput.value = '';
        totalAdhesiveInput.value = '';
        totalGroutInput.value = '';
        return;
    }

    const area = height * width;
    calculatedAreaInput.value = area.toFixed(2);

    const tilesPerM2 = parseFloat(tileSizeSelect.value);
    const rawTiles = area * tilesPerM2;

    let adhesivePerM2 = 1.2;
    switch (tileSizeSelect.value) {
        case "25": case "14": adhesivePerM2 = 1.8; break;
        case "6":  case "5":  adhesivePerM2 = 2.5; break;
    }
    const rawAdhesive = area * adhesivePerM2;

    const groutAmountPerM2 = parseFloat(groutAmountSelect.value);
    const rawGrout = area * groutAmountPerM2;

    const userWastePercent = parseFloat(wastePercentageInput.value);
    const wasteMultiplier = 1 + (isNaN(userWastePercent) || userWastePercent < 0 ? 0 : userWastePercent / 100);

    totalTilesInput.value = (rawTiles * wasteMultiplier).toFixed(0);
    totalAdhesiveInput.value = (rawAdhesive * wasteMultiplier).toFixed(1);
    totalGroutInput.value = (rawGrout * wasteMultiplier).toFixed(1);
}

if (heightInput && baseInput && tileSizeSelect && groutAmountSelect && wastePercentageInput) {
    heightInput.addEventListener('input', calculateTileMaterials);
    baseInput.addEventListener('input', calculateTileMaterials);
    tileSizeSelect.addEventListener('change', calculateTileMaterials);
    groutAmountSelect.addEventListener('change', calculateTileMaterials);
    wastePercentageInput.addEventListener('input', calculateTileMaterials);
}

if (copyResultsButton) {
    copyResultsButton.addEventListener('click', function() {
        const areaVal = calculatedAreaInput.value || 'N/A';
        const tilesVal = totalTilesInput.value || 'N/A';
        const adhesiveVal = totalAdhesiveInput.value || 'N/A';
        const groutVal = totalGroutInput.value || 'N/A';
        const wasteVal = wastePercentageInput.value || '0';

        const resultsText = [
            `Areal (m²): ${areaVal}`,
            `Antal fliser (inkl. spild): ${tilesVal}`,
            `Fliselim (kg, inkl. spild): ${adhesiveVal}`,
            `Fugemasse (kg, inkl. spild): ${groutVal}`,
            `Spild (%): ${wasteVal}`
        ].join('\n');

        navigator.clipboard.writeText(resultsText).then(() => {
            showCopyFeedback('Kopieret!');
        }).catch(err => {
            console.error('Fejl ved kopiering: ', err);
            showCopyFeedback('Kopiering fejlede!', false);
        });
    });
}

if (saveCsvButton) {
    saveCsvButton.addEventListener('click', function() {
        const headers = "Beskrivelse,Værdi\n";
        const rows = [
            `Areal (m²),${calculatedAreaInput.value || ''}`,
            `Antal fliser (inkl. spild),${totalTilesInput.value || ''}`,
            `Fliselim (kg inkl. spild),${totalAdhesiveInput.value || ''}`,
            `Fugemasse (kg inkl. spild),${totalGroutInput.value || ''}`,
            `Spild (%),${wastePercentageInput.value || '0'}`
        ];
        const csvContent = headers + rows.join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'flise_beregning_resultater.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}

calculateTileMaterials();
