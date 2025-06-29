// DOM Element References
const heightInput = document.getElementById('heightInMeters');
const widthInput = document.getElementById('widthInMeters');
const calculatedAreaInput = document.getElementById('calculatedArea');

const halfBrickWallBricksInput = document.getElementById('halfBrickWallBricks');
const fullBrickWallBricksInput = document.getElementById('fullBrickWallBricks');
const cavityWallBricksInput = document.getElementById('cavityWallBricks');

const mortarForBricksLitersInput = document.getElementById('mortarForBricksLiters');
const plasterLitersInput = document.getElementById('plasterLiters');
const jointingLitersInput = document.getElementById('jointingLiters');
const totalMortarLitersInput = document.getElementById('totalMortarLiters');
const wallTiesCountInput = document.getElementById('wallTiesCount');

const spillageButtons = document.querySelectorAll('.spillage-button');
const copyResultsButton = document.getElementById('copyResultsButton');
const saveCsvButton = document.getElementById('saveCsvButton');
const copyFeedbackSpan = document.getElementById('copyFeedback'); // Added for feedback

let currentSpillageFactor = 0;
let feedbackTimeout = null; // To manage the timeout for hiding feedback

function showCopyFeedback(message, success = true) {
    if (!copyFeedbackSpan) return;

    copyFeedbackSpan.textContent = message;
    copyFeedbackSpan.style.backgroundColor = success ? '#218838' : '#c82333'; // Green for success, Red for error
    copyFeedbackSpan.style.display = 'inline-block'; // Make it visible
    copyFeedbackSpan.classList.add('show');

    if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
    }

    feedbackTimeout = setTimeout(() => {
        copyFeedbackSpan.classList.remove('show');
        setTimeout(() => {
            copyFeedbackSpan.style.display = 'none';
        }, 500);
    }, 3000);
}

function calculateBrickworkMaterials() {
    const height = parseFloat(heightInput.value);
    const width = parseFloat(widthInput.value);

    if (isNaN(height) || isNaN(width) || height <= 0 || width <= 0) {
        calculatedAreaInput.value = '';
        halfBrickWallBricksInput.value = '';
        fullBrickWallBricksInput.value = '';
        cavityWallBricksInput.value = '';
        mortarForBricksLitersInput.value = '';
        plasterLitersInput.value = '';
        jointingLitersInput.value = '';
        totalMortarLitersInput.value = '';
        wallTiesCountInput.value = '';
        return;
    }

    const area = height * width;
    calculatedAreaInput.value = area.toFixed(2);

    const bricksPerM2_HalfWall = 65;
    const bricksPerM2_FullOrCavityWall = 130;

    const finalHalfBrickWallBricks = area * bricksPerM2_HalfWall * (1 + currentSpillageFactor);
    const finalFullBrickWallBricks = area * bricksPerM2_FullOrCavityWall * (1 + currentSpillageFactor);
    const finalCavityWallBricks = area * bricksPerM2_FullOrCavityWall * (1 + currentSpillageFactor);

    const calculatedMortarForBricks = finalHalfBrickWallBricks * 0.7;
    const calculatedPlaster = area * 17 * (1 + currentSpillageFactor);
    const calculatedJointing = area * 4 * (1 + currentSpillageFactor);

    const calculatedTotalMortar = calculatedMortarForBricks + calculatedPlaster + calculatedJointing;
    const calculatedWallTies = area * 4;

    halfBrickWallBricksInput.value = finalHalfBrickWallBricks.toFixed(0);
    fullBrickWallBricksInput.value = finalFullBrickWallBricks.toFixed(0);
    cavityWallBricksInput.value = finalCavityWallBricks.toFixed(0);
    mortarForBricksLitersInput.value = calculatedMortarForBricks.toFixed(1);
    plasterLitersInput.value = calculatedPlaster.toFixed(1);
    jointingLitersInput.value = calculatedJointing.toFixed(1);
    totalMortarLitersInput.value = calculatedTotalMortar.toFixed(1);
    wallTiesCountInput.value = calculatedWallTies.toFixed(0);
}

spillageButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentSpillageFactor = parseFloat(button.getAttribute('data-spillage'));
        spillageButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        calculateBrickworkMaterials();
    });
});

if (heightInput && widthInput) {
    heightInput.addEventListener('input', calculateBrickworkMaterials);
    widthInput.addEventListener('input', calculateBrickworkMaterials);
}

if (copyResultsButton) {
    copyResultsButton.addEventListener('click', () => {
        const resultsToCopy = [
            `Valgt Spildprocent for Sten: ${currentSpillageFactor * 100}%`,
            `Areal (m²): ${calculatedAreaInput.value || 'N/A'}`,
            `Antal sten til Halvstensmur: ${halfBrickWallBricksInput.value || 'N/A'}`,
            `Antal sten til Helstensmur: ${fullBrickWallBricksInput.value || 'N/A'}`,
            `Antal sten til Hulmur: ${cavityWallBricksInput.value || 'N/A'}`,
            `Mørtel til opmuring (liter): ${mortarForBricksLitersInput.value || 'N/A'}`,
            `Mørtel til grovpuds (liter, inkl. spild): ${plasterLitersInput.value || 'N/A'}`,
            `Mørtel til fugning (liter, inkl. spild): ${jointingLitersInput.value || 'N/A'}`,
            `Mørtelforbrug i alt (liter): ${totalMortarLitersInput.value || 'N/A'}`,
            `Antal Bindere: ${wallTiesCountInput.value || 'N/A'}`
        ];
        const textToCopy = resultsToCopy.join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyFeedback('Kopieret!');
        }).catch(err => {
            console.error('Fejl ved kopiering: ', err);
            showCopyFeedback('Kopiering fejlede!', false);
        });
    });
}

if (saveCsvButton) {
    saveCsvButton.addEventListener('click', () => {
        const headers = "Beskrivelse,Værdi\n";
        const rows = [
            `Valgt Spildprocent for Sten (%),${currentSpillageFactor * 100}`,
            `Areal (m²),${calculatedAreaInput.value || ''}`,
            `Antal sten til Halvstensmur,${halfBrickWallBricksInput.value || ''}`,
            `Antal sten til Helstensmur,${fullBrickWallBricksInput.value || ''}`,
            `Antal sten til Hulmur,${cavityWallBricksInput.value || ''}`,
            `Mørtel til opmuring (liter),${mortarForBricksLitersInput.value || ''}`,
            `Mørtel til grovpuds (liter inkl. spild),${plasterLitersInput.value || ''}`,
            `Mørtel til fugning (liter inkl. spild),${jointingLitersInput.value || ''}`,
            `Mørtelforbrug i alt (liter),${totalMortarLitersInput.value || ''}`,
            `Antal Bindere,${wallTiesCountInput.value || ''}`
        ];
        const csvContent = headers + rows.join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'sten_beregning_resultater.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}

function goHome() {
    window.location.href = "Hovedside.html";
}

const defaultSpillageButton = document.querySelector('.spillage-button[data-spillage="0.075"]') || spillageButtons[0];
if (defaultSpillageButton && !document.querySelector('.spillage-button.selected')) {
    // Check if currentSpillageFactor is still at its initial value (0) AND no button has 'selected' class
    // This ensures that if a value is cached by the browser and a button IS selected, we don't override it.
    // However, the currentSpillageFactor is set by *clicking* a button. If values are cached,
    // the inputs might fill but no spillage button would be 'selected' automatically.
    // So, it's generally safe to set a default selected button if none are.
    defaultSpillageButton.classList.add('selected');
    currentSpillageFactor = parseFloat(defaultSpillageButton.getAttribute('data-spillage'));
}
calculateBrickworkMaterials();
