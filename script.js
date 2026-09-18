let currentStep = 0; // FOI UTILIZADO IA.
const TOTAL_STEPS = 9;

const stepTitles = {
  1: { title: "Selecione todas as imagens com bicicletas" },
  2: { title: "Encontre a palavra 'BIKE' no caça-palavras" },
  3: { title: "Aponte em qual órbita a Terra orbita" },
  4: { title: "Derrote 10 IAs clicando nelas" },
  5: { title: "Atravesse o percurso sem colidir" },
  6: { title: "Vença o pato no cabo de guerra!" },
  7: { title: "Conecte o Pen Drive no lado correto" },
  8: { title: "Ache e puxe a ponta da fita adesiva!" },
  9: { title: "Ajuste a antena com Bombril até o sinal firmar!" }
};

// Mapeamento de blocos da bicicleta
const bikeIndices = [5, 6, 8, 9, 10, 11, 12, 13, 14, 15];

// Referência do listener global da caixa fujona
let runawayMoveHandler = null;

document.addEventListener('DOMContentLoaded', () => {
  initRunawayBox();
  initStep1();
});

/**
 * INICIALIZAÇÃO DA CAIXA FUJONA (CORRIGIDA)
 */
function initRunawayBox() {
  const runawayBox = document.getElementById('runawayBox');
  const checkbox = document.getElementById('captchaCheckbox');

  // Garante que se já existia um listener anterior ele seja removido
  if (runawayMoveHandler) {
    window.removeEventListener('mousemove', runawayMoveHandler);
  }

  // Reseta posição e estado inicial
  runawayBox.style.position = 'absolute';
  runawayBox.style.left = '0px';
  runawayBox.style.top = '16px';

  runawayMoveHandler = (e) => {
    // Só foge se estiver no estado inicial (Etapa 0)
    if (currentStep !== 0) return;

    const rect = runawayBox.getBoundingClientRect();
    const boxCenterX = rect.left + rect.width / 2;
    const boxCenterY = rect.top + rect.height / 2;

    // Distância entre o mouse e o centro do elemento
    const distX = e.clientX - boxCenterX;
    const distY = e.clientY - boxCenterY;
    const distance = Math.hypot(distX, distY);

    // Raio de detecção de aproximação (80px)
    if (distance < 80) {
      const parent = runawayBox.parentElement;
      const parentRect = parent.getBoundingClientRect();

      const maxLeft = parentRect.width - rect.width;
      const maxTop = parentRect.height - rect.height;

      // Direção contrária ao mouse
      let newLeft = (runawayBox.offsetLeft || 0) - (distX * 0.8);
      let newTop = (runawayBox.offsetTop || 0) - (distY * 0.8);

      // Limita aos limites do container
      newLeft = Math.max(0, Math.min(maxLeft, newLeft));
      newTop = Math.max(0, Math.min(maxTop, newTop));

      // Se estiver muito perto do canto, pula para uma posição aleatória
      if (Math.abs(newLeft - (runawayBox.offsetLeft || 0)) < 5 && Math.abs(newTop - (runawayBox.offsetTop || 0)) < 5) {
        newLeft = Math.random() * maxLeft;
        newTop = Math.random() * maxTop;
      }

      runawayBox.style.left = `${newLeft}px`;
      runawayBox.style.top = `${newTop}px`;
    }
  };

  window.addEventListener('mousemove', runawayMoveHandler);

  checkbox.onchange = (e) => {
    if (e.target.checked) {
      startGames();
    }
  };
}

function startGames() {
  currentStep = 1;

  // Remove listener global da caixa fujona ao entrar nos jogos
  if (runawayMoveHandler) {
    window.removeEventListener('mousemove', runawayMoveHandler);
  }

  document.getElementById('initialWidget').style.display = 'none';
  document.getElementById('instructionBar').style.display = 'block';
  document.getElementById('captchaViewport').style.display = 'block';
  document.getElementById('gameFooter').style.display = 'flex';

  document.getElementById('step1').classList.add('active');
}

/**
 * RESET GLOBAL DO CAPTCHA EM CASO DE ERRO
 */
function resetGameToStart(reasonMessage) {
  // Cleanups das etapas interativas
  cleanupTapeEvents();
  cleanupTvEvents();

  alert(reasonMessage + "\n\nVocê falhou! Tente marcar a caixa novamente...");

  const currentElem = document.getElementById(`step${currentStep}`);
  if (currentElem) currentElem.classList.remove('active');

  currentStep = 0;

  document.getElementById('instructionBar').style.display = 'none';
  document.getElementById('captchaViewport').style.display = 'none';
  document.getElementById('gameFooter').style.display = 'none';
  document.getElementById('initialWidget').style.display = 'block';

  const checkbox = document.getElementById('captchaCheckbox');
  checkbox.checked = false;

  // Re-inicializa a caixa fujona de forma limpa
  initRunawayBox();

  // Reseta seleção do Step 1
  document.querySelectorAll('#gridBikes .grid-cell').forEach(cell => {
    cell.classList.remove('selected');
  });
}

function advanceStep() {
  if (currentStep === 8) cleanupTapeEvents();
  if (currentStep === 9) cleanupTvEvents();

  const currentElem = document.getElementById(`step${currentStep}`);
  if (currentElem) currentElem.classList.remove('active');

  setTimeout(() => {
    if (currentStep < TOTAL_STEPS) {
      currentStep++;

      document.getElementById('captchaTitle').innerText = stepTitles[currentStep].title;

      const nextElem = document.getElementById(`step${currentStep}`);
      if (nextElem) nextElem.classList.add('active');

      const verifyBtn = document.getElementById('verifyBtn');
      verifyBtn.style.display = (currentStep >= 4) ? 'none' : 'block';

      initCurrentStepGame();
    } else {
      // Exibição da Tela de Agradecimento Final
      showThankYouScreen();
    }
  }, 350);
}

/**
 * TELA FINAL DE AGRADECIMENTO
 */
function showThankYouScreen() {
  document.getElementById('submitBtn').disabled = false;
  document.getElementById('instructionBar').style.display = 'none';
  document.getElementById('gameFooter').style.display = 'none';

  const viewport = document.getElementById('captchaViewport');
  viewport.style.display = 'block';
  viewport.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
      background: #f8fafc;
    ">
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 22px;">Obrigado pela atenção</h2>
      <p style="color: #64748b; font-size: 14px; margin: 0;">Você provou com sucesso ser humano superando todos os desafios!</p>
    </div>
  `;
}

// ETAPA 1: BICICLETAS
function initStep1() {
  const cells = document.querySelectorAll('#gridBikes .grid-cell');
  cells.forEach(cell => {
    const index = parseInt(cell.dataset.index);
    if (bikeIndices.includes(index)) cell.dataset.isBike = "true";
    cell.onclick = () => cell.classList.toggle('selected');
  });
}

function validateStep1() {
  const selectedCells = Array.from(document.querySelectorAll('#gridBikes .grid-cell.selected'));
  const selectedIndices = selectedCells.map(c => parseInt(c.dataset.index));

  const isCorrect = bikeIndices.length === selectedIndices.length &&
    bikeIndices.every(index => selectedIndices.includes(index));

  if (isCorrect) advanceStep();
  else resetGameToStart("Seleção incorreta de bicicletas!");
}

// GERENCIADOR DE ETAPAS
function initCurrentStepGame() {
  if (currentStep === 2) initWordSearch();
  if (currentStep === 3) initSolarSystem();
  if (currentStep === 4) initWhackAMole();
  if (currentStep === 5) initFlappyBird();
  if (currentStep === 6) initTugOfWar();
  if (currentStep === 7) initUsbGame();
  if (currentStep === 8) initTapeGame();
  if (currentStep === 9) initTvAntennaGame();
}

// ETAPA 2: CAÇA-PALAVRAS
function initWordSearch() {
  const wsGrid = document.getElementById('wordsearchGrid');
  wsGrid.innerHTML = "";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const targetRow = Math.floor(Math.random() * 10);
  const targetColStart = Math.floor(Math.random() * 7);

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement('div');
      cell.classList.add('ws-cell');

      if (r === targetRow && c >= targetColStart && c < targetColStart + 4) {
        const bikeStr = "BIKE";
        cell.innerText = bikeStr[c - targetColStart];
        cell.dataset.target = "true";
      } else {
        cell.innerText = letters[Math.floor(Math.random() * letters.length)];
      }

      cell.onclick = () => cell.classList.toggle('selected');
      wsGrid.appendChild(cell);
    }
  }
}

function validateStep2() {
  const selected = Array.from(document.querySelectorAll('.ws-cell.selected'));
  const isCorrect = selected.length === 4 && selected.every(c => c.dataset.target === "true");
  if (isCorrect) advanceStep();
  else resetGameToStart("Você errou a palavra 'BIKE'!");
}

// ETAPA 3: SISTEMA SOLAR
let selectedOrbit = null;
function initSolarSystem() {
  selectedOrbit = null;
  const rings = document.querySelectorAll('.orbit-ring');
  rings.forEach(ring => {
    ring.classList.remove('selected');
    ring.onclick = (e) => {
      e.stopPropagation();
      rings.forEach(r => r.classList.remove('selected'));
      e.target.classList.add('selected');
      selectedOrbit = parseInt(e.target.dataset.orbit);
    };
  });
}

function validateStep3() {
  if (selectedOrbit === 3) advanceStep();
  else resetGameToStart("Essa não é a órbita da Terra!");
}

// ETAPA 4: WHACK-A-MOLE (IA)
let moleScore = 0;
function initWhackAMole() {
  moleScore = 0;
  document.getElementById('moleScore').innerText = moleScore;
  const holes = document.querySelectorAll('.mole-hole');
  const aiLogos = ['🤖', '⚡', '🧠', '🌐'];

  const moleTimer = setInterval(() => {
    if (currentStep !== 4) { clearInterval(moleTimer); return; }
    holes.forEach(h => h.innerText = "");
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    randomHole.innerText = aiLogos[Math.floor(Math.random() * aiLogos.length)];
  }, 500);

  holes.forEach(hole => {
    hole.onclick = () => {
      if (hole.innerText !== "") {
        moleScore++;
        document.getElementById('moleScore').innerText = moleScore;
        hole.innerText = "";
        if (moleScore >= 10) advanceStep();
      }
    };
  });
}

// ETAPA 5: FLAPPY BIRD
function initFlappyBird() {
  const canvas = document.getElementById('flappyCanvas');
  const ctx = canvas.getContext('2d');

  let birdY = 100;
  let velocity = 0;
  const gravity = 0.22;
  const jumpStrength = -4.2;
  const pipeSpeed = 1.4;
  const pipeGap = 95;
  const pipeWidth = 38;
  
  let wingAngle = 0;
  let gameStarted = false;
  let gameRunning = true;
  let passedPipes = 0;
  const totalPipesTarget = 3;

  let pipe = { x: 300, topHeight: 50, gap: pipeGap };

  const clouds = [
    { x: 30, y: 30, scale: 0.8 },
    { x: 160, y: 20, scale: 1.1 },
    { x: 260, y: 45, scale: 0.7 }
  ];

  function flap() {
    if (!gameStarted) gameStarted = true;
    if (gameRunning) velocity = jumpStrength;
  }

  canvas.onclick = flap;
  window.onkeydown = (e) => {
    if (e.code === 'Space' && currentStep === 5) {
      e.preventDefault();
      flap();
    }
  };

  function drawBackground() {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#4facfe');
    skyGradient.addColorStop(0.85, '#00f2fe');
    skyGradient.addColorStop(1, '#e0f7fa');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    clouds.forEach(c => {
      c.x -= 0.3;
      if (c.x < -40) c.x = canvas.width + 20;

      ctx.beginPath();
      ctx.arc(c.x, c.y, 12 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 10 * c.scale, c.y - 5 * c.scale, 14 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 22 * c.scale, c.y, 12 * c.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, canvas.height - 15, canvas.width, 3);
  }

  function drawPipe(x, topHeight, gap) {
    const topGrad = ctx.createLinearGradient(x, 0, x + pipeWidth, 0);
    topGrad.addColorStop(0, '#73bf2e');
    topGrad.addColorStop(0.5, '#9ce659');
    topGrad.addColorStop(1, '#53a018');

    ctx.fillStyle = topGrad;
    ctx.fillRect(x, 0, pipeWidth, topHeight);
    ctx.strokeStyle = '#2d5a0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, 0, pipeWidth, topHeight);

    ctx.fillRect(x - 3, topHeight - 12, pipeWidth + 6, 12);
    ctx.strokeRect(x - 3, topHeight - 12, pipeWidth + 6, 12);

    const bottomY = topHeight + gap;
    const bottomHeight = canvas.height - bottomY - 15;

    ctx.fillRect(x, bottomY, pipeWidth, bottomHeight);
    ctx.strokeRect(x, bottomY, pipeWidth, bottomHeight);

    ctx.fillRect(x - 3, bottomY, pipeWidth + 6, 12);
    ctx.strokeRect(x - 3, bottomY, pipeWidth + 6, 12);
  }

  function drawBird(x, y) {
    ctx.save();
    ctx.translate(x, y);

    const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 6, velocity * 0.12));
    ctx.rotate(rotation);

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(5, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(6, -4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(8, -1);
    ctx.lineTo(16, 2);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    wingAngle += 0.2;
    const wingY = Math.sin(wingAngle) * 3;

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(-4, wingY, 6, 4, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawScore() {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 16px Roboto, sans-serif';
    ctx.textAlign = 'center';

    const text = `Canos: ${passedPipes}/${totalPipesTarget}`;
    ctx.strokeText(text, canvas.width / 2, 25);
    ctx.fillText(text, canvas.width / 2, 25);
  }

  function renderStartScreen() {
    drawBackground();
    drawBird(50, birdY);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 13px Roboto, sans-serif';
    ctx.textAlign = 'center';

    ctx.strokeText('Clique ou Pressione ESPAÇO', canvas.width / 2, 115);
    ctx.fillText('Clique ou Pressione ESPAÇO', canvas.width / 2, 115);
    ctx.strokeText('para voar!', canvas.width / 2, 135);
    ctx.fillText('para voar!', canvas.width / 2, 135);
  }

  function loop() {
    if (currentStep !== 5) return;

    if (!gameStarted) {
      renderStartScreen();
      requestAnimationFrame(loop);
      return;
    }

    if (!gameRunning) return;

    velocity += gravity;
    birdY += velocity;
    pipe.x -= pipeSpeed;

    if (pipe.x < -pipeWidth - 10) {
      passedPipes++;
      if (passedPipes >= totalPipesTarget) {
        gameRunning = false;
        advanceStep();
        return;
      }
      pipe.x = canvas.width + 10;
      pipe.topHeight = Math.floor(Math.random() * 65) + 25;
    }

    drawBackground();
    drawPipe(pipe.x, pipe.topHeight, pipe.gap);
    drawBird(50, birdY);
    drawScore();

    const birdRadius = 9;
    const hitPipeX = (pipe.x < 50 + birdRadius) && (pipe.x + pipeWidth > 50 - birdRadius);
    const hitPipeY = (birdY - birdRadius < pipe.topHeight) || (birdY + birdRadius > pipe.topHeight + pipe.gap);
    const hitFloorOrCeil = (birdY + birdRadius >= canvas.height - 15) || (birdY - birdRadius <= 0);

    if ((hitPipeX && hitPipeY) || hitFloorOrCeil) {
      gameRunning = false;
      resetGameToStart("Você colidiu no percurso!");
    } else {
      requestAnimationFrame(loop);
    }
  }

  requestAnimationFrame(loop);
}

// ETAPA 6: CABO DE GUERRA
function initTugOfWar() {
  let position = 50;
  const marker = document.getElementById('ropeMarker');
  const pullBtn = document.getElementById('pullBtn');
  marker.style.left = `${position}%`;

  const duckInterval = setInterval(() => {
    if (currentStep !== 6) { clearInterval(duckInterval); return; }
    position -= 3.2;
    marker.style.left = `${position}%`;

    if (position <= 10) {
      clearInterval(duckInterval);
      resetGameToStart("O pato venceu o cabo de guerra!");
    }
  }, 150);

  pullBtn.onclick = () => {
    position += 5.0;
    marker.style.left = `${position}%`;
    if (position >= 90) {
      clearInterval(duckInterval);
      advanceStep();
    }
  };
}

// ETAPA 7: PEN DRIVE USB
let usbAttempts = 0;
let isFlipped = false;

function initUsbGame() {
  usbAttempts = 0;
  isFlipped = false;
  
  const usbDrive = document.getElementById('usbDrive');
  const wrapper = document.getElementById('usbDriveWrapper');
  const status = document.getElementById('usbStatus');
  const flipBtn = document.getElementById('flipUsbBtn');
  const plugBtn = document.getElementById('plugUsbBtn');

  usbDrive.style.transform = 'scaleY(1)';
  wrapper.style.transform = 'translateY(0px)';
  status.innerText = "Lado atual: Cima (Tentativa 1)";

  flipBtn.onclick = () => {
    isFlipped = !isFlipped;
    usbDrive.style.transform = isFlipped ? 'scaleY(-1)' : 'scaleY(1)';
    status.innerText = `Lado atual: ${isFlipped ? 'Baixo' : 'Cima'} (Tentativa ${usbAttempts + 1})`;
  };

  plugBtn.onclick = () => {
    usbAttempts++;

    wrapper.style.transform = 'translateY(-35px)';

    setTimeout(() => {
      if (usbAttempts === 3 && !isFlipped) {
        status.innerText = "Encaixado com sucesso!";
        setTimeout(() => advanceStep(), 500);
      } else {
        wrapper.style.transform = 'translateY(0px)';
        
        if (usbAttempts === 1) {
          alert("Não encaixou! O lado parece estar errado. Vire o pen drive.");
        } else if (usbAttempts === 2) {
          alert("Ainda não encaixou?! Vire o pen drive novamente...");
        } else {
          resetGameToStart("Você forçou o USB e quebrou a porta!");
        }
        status.innerText = `Lado atual: ${isFlipped ? 'Baixo' : 'Cima'} (Tentativa ${usbAttempts + 1})`;
      }
    }, 400);
  };
}

// ETAPA 8: FITA ADESIVA DUREX
let tapeDragActive = false;
let tapeStartX = 0;
let tapeCurrentRotation = 0;
let onTapeMoveRef = null;
let onTapeUpRef = null;

function cleanupTapeEvents() {
  tapeDragActive = false;
  if (onTapeMoveRef) window.removeEventListener('pointermove', onTapeMoveRef);
  if (onTapeUpRef) window.removeEventListener('pointerup', onTapeUpRef);
  onTapeMoveRef = null;
  onTapeUpRef = null;
}

function initTapeGame() {
  cleanupTapeEvents();

  const roll = document.getElementById('tapeRoll');
  const tab = document.getElementById('tapeTab');
  const status = document.getElementById('tapeStatus');

  tapeCurrentRotation = 0;
  roll.style.transform = `rotate(0deg)`;
  tab.style.display = 'none';
  status.innerText = "Arraste para girar e encontre a ponta!";

  roll.onpointerdown = (e) => {
    if (currentStep !== 8) return;
    tapeDragActive = true;
    tapeStartX = e.clientX;

    onTapeMoveRef = (ev) => {
      if (!tapeDragActive || currentStep !== 8) return;
      const deltaX = ev.clientX - tapeStartX;
      tapeStartX = ev.clientX;
      tapeCurrentRotation += deltaX * 1.2;
      roll.style.transform = `rotate(${tapeCurrentRotation}deg)`;

      const normalizedAngle = Math.abs(tapeCurrentRotation % 360);
      if (normalizedAngle >= 140 && normalizedAngle <= 180) {
        tab.style.display = 'block';
        status.innerText = "A ponta apareceu! Clique na fita para descascar.";
      } else {
        tab.style.display = 'none';
        status.innerText = "Gire o rolo para achar a ponta...";
      }
    };

    onTapeUpRef = () => {
      tapeDragActive = false;
      if (onTapeMoveRef) window.removeEventListener('pointermove', onTapeMoveRef);
      if (onTapeUpRef) window.removeEventListener('pointerup', onTapeUpRef);
    };

    window.addEventListener('pointermove', onTapeMoveRef);
    window.addEventListener('pointerup', onTapeUpRef);
  };

  tab.onclick = (e) => {
    e.stopPropagation();
    cleanupTapeEvents();
    if (Math.random() < 0.45) {
      resetGameToStart("A fita rasgou no meio!");
    } else {
      status.innerText = "Conseguiu descascar sem rasgar!";
      setTimeout(() => advanceStep(), 500);
    }
  };
}

// ETAPA 9: TV COM BOMBRIL
let tvHolding = false;
let tvAngle = 0;
let tvHoldTime = 0;
let tvHoldInterval = null;
let onTvMoveRef = null;
let onTvUpRef = null;

function cleanupTvEvents() {
  tvHolding = false;
  if (tvHoldInterval) {
    clearInterval(tvHoldInterval);
    tvHoldInterval = null;
  }
  tvHoldTime = 0;

  if (onTvMoveRef) window.removeEventListener('pointermove', onTvMoveRef);
  if (onTvUpRef) window.removeEventListener('pointerup', onTvUpRef);
  onTvMoveRef = null;
  onTvUpRef = null;
}

function initTvAntennaGame() {
  cleanupTvEvents();

  const rod = document.getElementById('antennaRod');
  const tvStatic = document.getElementById('tvStatic');
  const tvContent = document.getElementById('tvContent');
  const status = document.getElementById('tvStatus');

  rod.style.transform = `rotate(0deg)`;
  tvStatic.style.opacity = '0.95';
  tvContent.style.display = 'none';
  status.innerText = "Segure e ajuste a antena na posição exata!";

  rod.onpointerdown = () => {
    if (currentStep !== 9) return;
    tvHolding = true;

    onTvMoveRef = (e) => {
      if (!tvHolding || currentStep !== 9) return;

      const rodRect = rod.getBoundingClientRect();
      const centerX = rodRect.left + rodRect.width / 2;
      const centerY = rodRect.bottom;

      const radians = Math.atan2(e.clientX - centerX, centerY - e.clientY);
      tvAngle = Math.max(-65, Math.min(65, radians * (180 / Math.PI)));

      rod.style.transform = `rotate(${tvAngle}deg)`;

      if (tvAngle >= 28 && tvAngle <= 38) {
        tvStatic.style.opacity = '0.05';
        tvContent.style.display = 'flex';
        status.innerText = "Segure firme na posição por 2 segundos!";

        if (!tvHoldInterval) {
          tvHoldInterval = setInterval(() => {
            tvHoldTime += 200;
            if (tvHoldTime >= 2000) {
              cleanupTvEvents();
              advanceStep();
            }
          }, 200);
        }
      } else {
        tvStatic.style.opacity = '0.95';
        tvContent.style.display = 'none';
        status.innerText = "Ajuste a antena na posição exata!";
        if (tvHoldInterval) {
          clearInterval(tvHoldInterval);
          tvHoldInterval = null;
        }
        tvHoldTime = 0;
      }
    };

    onTvUpRef = () => {
      if (currentStep !== 9) return;
      cleanupTvEvents();
      tvStatic.style.opacity = '0.95';
      tvContent.style.display = 'none';
      status.innerText = "Você soltou a antena e o sinal caiu!";
    };

    window.addEventListener('pointermove', onTvMoveRef);
    window.addEventListener('pointerup', onTvUpRef);
  };
}

// BOTAO DE VERIFICACAO (ETAPAS 1 A 3)
document.getElementById('verifyBtn').addEventListener('click', () => {
  if (currentStep === 1) validateStep1();
  else if (currentStep === 2) validateStep2();
  else if (currentStep === 3) validateStep3();
});

function finalizarLogin(e) {
  e.preventDefault();
  alert("Login realizado com sucesso!");
}