let currentSlide = 0;
let slides = [];
let prevBtn, nextBtn, indicator;

document.addEventListener('DOMContentLoaded', () => {
    slides = document.querySelectorAll('.slide-container');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    indicator = document.getElementById('currentSlideNum');
    
    if (slides.length > 0) {
        updateSlideVisibility();
    }
});

function changeSlide(direction) {
    if (currentSlide + direction >= 0 && currentSlide + direction < slides.length) {
        slides[currentSlide].classList.remove('active');
        currentSlide += direction;
        slides[currentSlide].classList.add('active');
        updateSlideVisibility();
        
        // Custom logic for Slide 4 (Angle Wheel)
        if (currentSlide === 3) {
            setTimeout(positionAngles, 100);
        }
    }
}

function updateSlideVisibility() {
    indicator.innerText = currentSlide + 1;
    prevBtn.disabled = (currentSlide === 0);
    nextBtn.disabled = (currentSlide === slides.length - 1);
    
    // Update total slides count in UI if the element exists
    const totalIndicator = document.getElementById('totalSlidesNum');
    if (totalIndicator) {
        totalIndicator.innerText = slides.length;
    }
}

function revealSolution(btn) {
    btn.nextElementSibling.style.display = 'block';
    btn.style.display = 'none';
}

// SLIDE 6 LOGIC (Old Slide 5)
function revealSlide6Solution(btn) {
    document.getElementById('slide5-no').style.display = 'inline-block';
    document.getElementById('slide5-evaluation').style.display = 'block';
    document.getElementById('slide5-formula-area').style.display = 'block';
    btn.style.display = 'none';
}

// SLIDE 5: COMPOUND ANGLE BATTLE
let battleActive = false;
let battleTimer = 30;
let battleScores = [0, 0];
let battleBubbles = [[], []];
let battleInterval;
let battleAnimationId;
const BATTLE_GOALS = [
    { target: '105°', options: ['60°+45°', '45°+30°', '60°+30°', '90°+15°'] },
    { target: '75°', options: ['45°+30°', '60°+15°', '60°+45°', '90°-15°'] },
    { target: '15°', options: ['45°-30°', '60°-45°', '60°-30°', '30°-15°'] }
];
let playerTargets = [null, null];

function startBattle() {
    battleActive = true;
    battleTimer = 30;
    battleScores = [0, 0];
    document.getElementById('p1-score').innerText = '0';
    document.getElementById('p2-score').innerText = '0';
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('battle-container').style.display = 'flex';
    document.getElementById('battle-end').style.display = 'none';
    
    spawnBattleTarget(0);
    spawnBattleTarget(1);
    
    battleInterval = setInterval(() => {
        battleTimer--;
        document.getElementById('battle-timer').innerText = battleTimer;
        if (battleTimer <= 0) endBattle();
    }, 1000);
    
    battleLoop();
}

function spawnBattleTarget(pIdx) {
    const goal = BATTLE_GOALS[Math.floor(Math.random() * BATTLE_GOALS.length)];
    playerTargets[pIdx] = goal;
    document.getElementById(`p${pIdx+1}-target`).innerText = goal.target;
    
    // Clear old bubbles
    battleBubbles[pIdx].forEach(b => b.remove());
    battleBubbles[pIdx] = [];
    
    // Spawn new ones
    const area = document.getElementById(`p${pIdx+1}-bubbles`);
    goal.options.forEach(opt => {
        const b = document.createElement('div');
        b.className = 'battle-bubble';
        b.innerText = opt;
        
        // Random position
        b.style.left = (Math.random() * 70 + 5) + '%';
        b.style.top = (Math.random() * 70 + 10) + '%';
        
        // Random drift speed
        b.vx = (Math.random() - 0.5) * 2;
        b.vy = (Math.random() - 0.5) * 2;
        
        b.onclick = () => handleBubbleClick(pIdx, b);
        area.appendChild(b);
        battleBubbles[pIdx].push(b);
    });
}

// Helper to evaluate "60°+45°" or "90°-15°"
function evaluateExpression(expr) {
    // Remove ° and replace with standard operators
    const cleanExpr = expr.replace(/°/g, '');
    try {
        // Use Function instead of eval for a bit more safety
        return new Function(`return ${cleanExpr}`)();
    } catch (e) {
        return NaN;
    }
}

function handleBubbleClick(pIdx, bubble) {
    if (!battleActive) return;
    
    const targetVal = parseInt(playerTargets[pIdx].target);
    const bubbleVal = evaluateExpression(bubble.innerText);
    
    if (bubbleVal === targetVal) {
        battleScores[pIdx] += 10;
        spawnBattleTarget(pIdx);
    } else {
        battleScores[pIdx] = Math.max(0, battleScores[pIdx] - 5);
        bubble.style.background = '#fecaca';
        setTimeout(() => bubble.style.background = 'rgba(255, 255, 255, 0.9)', 300);
    }
    document.getElementById(`p${pIdx+1}-score`).innerText = battleScores[pIdx];
}

function battleLoop() {
    if (!battleActive) return;
    
    [0, 1].forEach(pIdx => {
        const area = document.getElementById(`p${pIdx+1}-bubbles`);
        battleBubbles[pIdx].forEach(b => {
            let left = parseFloat(b.style.left) + b.vx * 0.1;
            let top = parseFloat(b.style.top) + b.vy * 0.1;
            
            // Bounce
            if (left < 0 || left > 85) b.vx *= -1;
            if (top < 0 || top > 85) b.vy *= -1;
            
            b.style.left = left + '%';
            b.style.top = top + '%';
        });
    });
    
    battleAnimationId = requestAnimationFrame(battleLoop);
}

function endBattle() {
    battleActive = false;
    clearInterval(battleInterval);
    cancelAnimationFrame(battleAnimationId);
    
    const endScreen = document.getElementById('battle-end');
    const winnerText = document.getElementById('winner-text');
    const scoresText = document.getElementById('final-scores');
    
    endScreen.style.display = 'flex';
    if (battleScores[0] > battleScores[1]) {
        winnerText.innerText = '🦁 Player 1 Wins!';
        winnerText.style.color = '#2563eb';
    } else if (battleScores[1] > battleScores[0]) {
        winnerText.innerText = '🐯 Player 2 Wins!';
        winnerText.style.color = '#ef4444';
    } else {
        winnerText.innerText = 'It\'s a Tie!';
        winnerText.style.color = '#1e293b';
    }
    scoresText.innerText = `${battleScores[0]} - ${battleScores[1]}`;
}

function resetBattle() {
    document.getElementById('battle-end').style.display = 'none';
    document.getElementById('game-menu').style.display = 'flex';
    document.getElementById('battle-container').style.display = 'none';
}

// SLIDE 7 LOGIC (Step-by-Step sin 105)
let activeStep = 1;
function nextStep() {
    if (activeStep < 4) {
        activeStep++;
        document.getElementById(`step${activeStep}`).style.display = 'block';
    }
    if (activeStep === 4) document.getElementById('nextStepBtn').disabled = true;
}

function resetStepByStep() {
    activeStep = 1;
    for (let i = 2; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (step) step.style.display = 'none';
    }
    const nextBtn = document.getElementById('nextStepBtn');
    if (nextBtn) nextBtn.disabled = false;
}

// SLIDE 8 LOGIC (Reverse Identification)
let activeStepS8 = 1;
function nextStepS8() {
    if (activeStepS8 < 4) {
        activeStepS8++;
        const step = document.getElementById(`s8step${activeStepS8}`);
        if (step) step.style.display = 'block';
    }
    if (activeStepS8 === 4) {
        const btn = document.getElementById('s8nextStepBtn');
        if (btn) btn.disabled = true;
    }
}

function resetS8() {
    activeStepS8 = 1;
    for (let i = 2; i <= 4; i++) {
        const step = document.getElementById(`s8step${i}`);
        if (step) step.style.display = 'none';
    }
    const btn = document.getElementById('s8nextStepBtn');
    if (btn) btn.disabled = false;
}

// SLIDE 9 LOGIC (Quadrant Visualization)
let activePanelS9 = 1;
function nextGridPanelS9() {
    if (activePanelS9 < 3) {
        activePanelS9++;
        const panelId = activePanelS9 === 2 ? 's9panel2' : 's9panel3';
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.remove('panel-hidden');
    }
    if (activePanelS9 === 3) {
        const btn = document.getElementById('s9nextBtn');
        if (btn) btn.disabled = true;
    }
}

function resetGridS9() {
    activePanelS9 = 1;
    const p2 = document.getElementById('s9panel2');
    const p3 = document.getElementById('s9panel3');
    if (p2) p2.classList.add('panel-hidden');
    if (p3) p3.classList.add('panel-hidden');
    const btn = document.getElementById('s9nextBtn');
    if (btn) btn.disabled = false;
}

// SLIDE 10 LOGIC (Example 3.5 Solver)
let activeStepS10 = 1;
function nextStepS10() {
    if (activeStepS10 < 6) {
        activeStepS10++;
        const step = document.getElementById(`s10step${activeStepS10}`);
        if (step) step.style.display = 'block';
    }
    if (activeStepS10 === 6) {
        const btn = document.getElementById('s10nextStepBtn');
        if (btn) btn.disabled = true;
    }
}

function resetS10() {
    activeStepS10 = 1;
    for (let i = 2; i <= 6; i++) {
        const step = document.getElementById(`s10step${i}`);
        if (step) step.style.display = 'none';
    }
    const btn = document.getElementById('s10nextStepBtn');
    if (btn) btn.disabled = false;
}

// WHEEL LOGIC (SLIDE 4)
function positionAngles() {
    const items = document.querySelectorAll('.angle-item');
    const wheel = document.getElementById('angleWheel');
    if (!wheel) return;
    const radius = wheel.offsetWidth * 0.42;
    const centerX = wheel.offsetWidth / 2;
    const centerY = wheel.offsetHeight / 2;

    items.forEach(item => {
        const deg = parseInt(item.dataset.deg);
        const rad = deg * (Math.PI / 180);
        const x = centerX + radius * Math.cos(rad) - (item.offsetWidth / 2);
        const y = centerY - radius * Math.sin(rad) - (item.offsetHeight / 2);
        item.style.left = x + 'px';
        item.style.top = y + 'px';
    });
}

let selected = [];
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('angle-item')) {
        const item = e.target;
        const val = parseInt(item.dataset.deg);
        if (item.classList.contains('selected')) {
            item.classList.remove('selected');
            selected = selected.filter(s => s !== val);
        } else if (selected.length < 2) {
            item.classList.add('selected');
            selected.push(val);
        }
        updateSum();
    }
});

function updateSum() {
    const display = document.getElementById('sumDisplay');
    if (!display) return;
    const a = selected[0] !== undefined ? selected[0] + '°' : '?';
    const b = selected[1] !== undefined ? selected[1] + '°' : '?';
    display.innerText = `105° = ${a} + ${b}`;
    const feedback = document.getElementById('feedback');
    if (feedback) {
        if (selected.length === 2) {
            feedback.innerHTML = (selected[0] + selected[1] === 105) 
                ? '<span style="color:#10b981;">Correct!</span>' 
                : '<span style="color:#ef4444;">Try again.</span>';
        } else { 
            feedback.innerText = ''; 
        }
    }
}

function resetAngles() {
    selected = [];
    document.querySelectorAll('.angle-item').forEach(i => i.classList.remove('selected'));
    updateSum();
}

// GENERIC WORKSHEET STEP LOGIC
let wsSteps = {};

function nextWS(slideId, maxSteps) {
    if (!wsSteps[slideId]) wsSteps[slideId] = 1;
    if (wsSteps[slideId] < maxSteps) {
        wsSteps[slideId]++;
        const step = document.getElementById(`${slideId}step${wsSteps[slideId]}`);
        if (step) step.style.display = 'block';
    }
    if (wsSteps[slideId] === maxSteps) {
        const btn = document.getElementById(`${slideId}nextBtn`);
        if (btn) btn.disabled = true;
    }
}

function resetWS(slideId, maxSteps) {
    wsSteps[slideId] = 1;
    for (let i = 2; i <= maxSteps; i++) {
        const step = document.getElementById(`${slideId}step${i}`);
        if (step) step.style.display = 'none';
    }
    const btn = document.getElementById(`${slideId}nextBtn`);
    if (btn) btn.disabled = false;
}

window.onresize = positionAngles;
