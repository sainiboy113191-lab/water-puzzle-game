let currentLevel = 1;
let moves = 0;
let history = [];
let tubes = [];
let selectedTubeIndex = null;

// Total colors used in the game
const COLOR_PALETTE = ['#ff4b2b', '#00b4db', '#00f2fe', '#4facfe', '#ff0844', '#f12711', '#b224ef', '#f6d365'];

// 100 Levels ki Settings (Har level ke liye array of arrays)
const levelsData = generate100Levels();

// Generate dummy level data for 100 levels
function generate100Levels() {
    const levels = [];
    for (let l = 1; l <= 100; l++) {
        levels.push([
            [1, 2, 3, 4], // tube 0
            [2, 3, 4, 1], // tube 1
            [3, 4, 1, 2], // tube 2
            [4, 1, 2, 3], // tube 3
            [],           // Empty tube 4
            []            // Empty tube 5
        ]);
    }
    return levels;
}

function initGame() {
    if (localStorage.getItem('waterSortLevel')) {
        currentLevel = parseInt(localStorage.getItem('waterSortLevel'));
    }
    loadLevel(currentLevel);
}

function loadLevel(levelIndex) {
    const levelData = levelsData[levelIndex - 1];
    tubes = levelData.map(tube => [...tube]);
    history = [];
    moves = 0;
    selectedTubeIndex = null;
    document.getElementById('level-indicator').innerText = levelIndex;
    document.getElementById('move-counter').innerText = moves;
    renderTubes();
}

function renderTubes() {
    const container = document.getElementById('tubes-section');
    container.innerHTML = '';
    
    tubes.forEach((tube, index) => {
        const tubeEl = document.createElement('div');
        tubeEl.className = `tube ${selectedTubeIndex === index ? 'selected' : ''}`;
        tubeEl.onclick = () => handleTubeClick(index);

        tube.forEach(colorIdx => {
            const waterLayer = document.createElement('div');
            waterLayer.className = 'water-layer';
            waterLayer.style.backgroundColor = COLOR_PALETTE[colorIdx - 1];
            waterLayer.style.height = '25%'; // 4 units per tube
            tubeEl.appendChild(waterLayer);
        });

        container.appendChild(tubeEl);
    });
}

function handleTubeClick(index) {
    if (selectedTubeIndex === null) {
        if (tubes[index].length > 0) {
            selectedTubeIndex = index;
            renderTubes();
        }
    } else {
        if (selectedTubeIndex !== index) {
            pourWater(selectedTubeIndex, index);
        }
        selectedTubeIndex = null;
        renderTubes();
    }
}

function pourWater(fromIndex, toIndex) {
    const fromTube = tubes[fromIndex];
    const toTube = tubes[toIndex];

    // Pouring rules validation
    if (fromTube.length === 0) return;
    if (toTube.length >= 4) return; // Full tube

    const pourColor = fromTube[fromTube.length - 1];
    if (toTube.length > 0 && toTube[toTube.length - 1] !== pourColor) return;

    // Save state for undo
    history.push(JSON.parse(JSON.stringify(tubes)));

    // Transfer logic
    let count = 0;
    while (fromTube.length > 0 && fromTube[fromTube.length - 1] === pourColor && toTube.length < 4) {
        toTube.push(fromTube.pop());
        count++;
    }

    moves++;
    document.getElementById('move-counter').innerText = moves;
    renderTubes();
    checkWinCondition();
}

function undoMove() {
    if (history.length === 0) return;
    tubes = history.pop();
    moves--;
    document.getElementById('move-counter').innerText = moves;
    renderTubes();
}

function restartLevel() {
    loadLevel(currentLevel);
}

function nextLevel() {
    if (currentLevel < 100) {
        currentLevel++;
        localStorage.setItem('waterSortLevel', currentLevel);
        loadLevel(currentLevel);
    } else {
        alert("Congratulations! You have completed all 100 Levels!");
    }
}

function giveHint() {
    alert("Hint: Try to empty a full tube to distribute the colors correctly.");
}

function checkWinCondition() {
    let win = true;
    tubes.forEach(tube => {
        if (tube.length > 0 && tube.length < 4) {
            win = false;
        } else if (tube.length === 4) {
            const firstColor = tube[0];
            if (!tube.every(color => color === firstColor)) {
                win = false;
            }
        }
    });

    if (win) {
        setTimeout(() => {
            alert(`Level ${currentLevel} Completed! 🎉`);
            nextLevel();
        }, 300);
    } else {
        saveProgress();
    }
}

function saveProgress() {
    localStorage.setItem(`savedLevelData_${currentLevel}`, JSON.stringify(tubes));
    const status = document.getElementById('save-status');
    status.classList.add('visible');
    setTimeout(() => {
        status.classList.remove('visible');
    }, 1500);
}

window.onload = initGame;
