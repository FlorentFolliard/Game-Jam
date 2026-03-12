let gameStarted = false;
let health = 3;
let isInvincible = false; // Pour empêcher de perdre tous ses PV d'un coup
let gameOver = false;
let duckScrollX = 0;
let gameOverDuckFrames = [];
let gameOverDuckFrameIndex = 0;
let gameOverDuckAnimTimer = 0;
const mushroomStartX = 450;
const mushroomStartY = 300;
const mushroomSwarmOffsets = [
  [-300, -200],
  [0, 0],
  [300, -0]
];

function getMushroomSpawnCoords() {
  return mushroomSwarmOffsets.map(([dx, dy]) => [mushroomStartX + dx, mushroomStartY + dy]);
}

function preload() {
  loadLevel("room1"); 
  
  // DÉCOUPE DU DUCK
  loadImage('./assets/personnage/Canards/ducky_3_spritesheet.png', (sheet) => {
    let sw = 32; 
    let sh = 32; 
    let lineY = 32; 
    for (let i = 0; i < 6; i++) {
      player.sprites[i] = sheet.get(i * sw, lineY, sw, sh);
    }
  });

  loadImage('./assets/personnage/Canards/ducky_2_spritesheet.png', (sheet) => {
    let sw = 32;
    let sh = 32;
    let gameOverLineY = 96;

    for (let i = 0; i < 6; i++) {
      gameOverDuckFrames[i] = sheet.get(i * sw, gameOverLineY, sw, sh);
    }
  });

  player.attackSprite = loadImage(
    './assets/attack/pixil-frame-0.png',
    img => { player.attackSprite = img; },
    err => {
      console.warn("Pas de sprite d'attaque trouvé.");
      player.attackSprite = null;
    }
  );

  // Charger le son de quack via l'API HTML5 Audio (indépendant de p5.sound)
  try {
    player.quackSound = new Audio('./sound/Duck Quack - Sound Effect (HD).mp3');
    player.quackSound2 = new Audio('./sound/Saturated_quack.mp3');
    player.quackSound.volume = 0.75;
    player.quackSound.addEventListener('error', (e) => {
      console.warn('Impossible de charger le son de canard', e);
      player.quackSound = null;
    });
  } catch (e) {
    console.warn('Erreur création du son de canard:', e);
    player.quackSound = null;
  }
}

function setup() {
  const canvas = createCanvas(900, 600);
  canvas.parent('game-container');
  setupHomeScreen();
  noLoop();
}

function draw() {
  if (!gameStarted) return;

  background(currentBg);

  if (gameOver) {
    player.draw();
    mushroomEnemies.forEach((enemy) => enemy.draw());
    drawWalls();
    drawGameOverScreen();
    return;
  }
  
  // Faire clignoter le joueur s'il est invincible
  if (isInvincible && frameCount % 10 < 5) {
    // On ne dessine rien ou on change l'alpha pour l'effet de clignotement
  } else {
    player.draw();
  }
  
  player.update();
  
  for (let i = mushroomEnemies.length - 1; i >= 0; i--) {
    const enemy = mushroomEnemies[i];
    enemy.update();
    enemy.draw();

    // --- COLLISION ATTAQUE ---
    if (player.attackHitbox && rectCollide(
      player.attackHitbox.x, player.attackHitbox.y, player.attackHitbox.w, player.attackHitbox.h,
      enemy.x, enemy.y, enemy.w, enemy.h
    )) {
      console.log('Ennemi tué !');
      mushroomEnemies.splice(i, 1);
      continue;
    }

    // --- COLLISION : LE JOUEUR EST TOUCHÉ (Seulement si non invincible) ---
    if (enemy.collidesWith(player) && !isInvincible) {
      takeDamage();
      // continue (le joueur peut être touché par plusieurs en même temps, bonne gestion selon ton design)
    }
  }

  drawWalls();
  showCoords();
}

// --- GESTION DES DÉGÂTS AVEC RECUL ---
// --- GESTION DES DÉGÂTS (SANS RECUL + INVINCIBILITÉ ALLONGÉE) ---
function takeDamage() {
  if (isInvincible || gameOver) return; 

  health--;
  updateUI();

  // Joue le son de douleur
  if (player.quackSound2) player.quackSound2.play();

  // On active l'invincibilité
  isInvincible = true;

  // On passe à 2000ms (2 secondes)
  setTimeout(() => { 
    isInvincible = false; 
  }, 2000); 

  if (health <= 0) {
    handleGameOver();
  }
}

function handleGameOver() {
  gameOver = true;
  duckScrollX = -64;
  gameOverDuckFrameIndex = 0;
  gameOverDuckAnimTimer = 0;

  const screen = document.getElementById('game-over-screen');
  if (screen) {
    screen.classList.add('active');
    screen.setAttribute('aria-hidden', 'false');
  }
}

// Fonction pour recommencer (à appeler via le bouton du Game Over)
function restartGame() {
  health = 3;
  updateUI();
  player.x = 180;
  player.y = 330;
  spawnMushroomSwarm(getMushroomSpawnCoords());
  isInvincible = false;
  gameOver = false;
  duckScrollX = -64;
  gameOverDuckFrameIndex = 0;
  gameOverDuckAnimTimer = 0;
  
  const screen = document.getElementById('game-over-screen');
  if (screen) {
    screen.classList.remove('active');
    screen.setAttribute('aria-hidden', 'true');
  }
  
  gameStarted = true;
  loop();
}

function updateUI() {
  let hearts = document.querySelectorAll('.hp-point');
  hearts.forEach((heart, index) => {
    if (index < health) {
      heart.src = "assets/hp/hpP.png";
    } else {
      heart.src = "assets/hp/hpV.png";
    }
  });
}

function drawGameOverScreen() {
  noStroke();
  fill(0, 0, 0, 185);
  rect(0, 0, width, height);

  const duckImg = gameOverDuckFrames[gameOverDuckFrameIndex] || gameOverDuckFrames[0] || player.sprites[0];
  const duckSize = 56;
  const duckSpeed = 2.2;
  const duckY = height - duckSize - 24;

  gameOverDuckAnimTimer++;
  if (gameOverDuckAnimTimer >= 8) {
    gameOverDuckAnimTimer = 0;
    if (gameOverDuckFrames.length > 1) {
      gameOverDuckFrameIndex = (gameOverDuckFrameIndex + 1) % gameOverDuckFrames.length;
    }
  }

  duckScrollX += duckSpeed;
  if (duckScrollX > width + duckSize) {
    duckScrollX = -duckSize;
  }

  if (duckImg) {
    image(duckImg, duckScrollX, duckY, duckSize, duckSize);
  }

  textAlign(CENTER, CENTER);
  textSize(64);
  fill(20, 20, 20, 240);
  text('GAME OVER', width / 2 + 3, height / 2 + 3);
  fill(235, 238, 242);
  text('GAME OVER', width / 2, height / 2);
}

function showCoords() {
  fill(255, 0, 180, 100);
  noStroke();
  textSize(12);
  text(`X: ${floor(mouseX)} Y: ${floor(mouseY)}`, width - 100, height - 20);
}

function setupHomeScreen() {
  const playButton = document.getElementById('play-button');
  const playButtonImage = document.getElementById('play-button-image');
  if (!playButton || !playButtonImage) {
    gameStarted = true;
    loop();
    return;
  }
  playButton.addEventListener('mouseenter', () => { playButtonImage.src = 'assets/button/Play-Click.png'; });
  playButton.addEventListener('mouseleave', () => { playButtonImage.src = 'assets/button/Play-Idle.png'; });
  playButton.addEventListener('click', () => { startGame(); });
}

function startGame() {
  const homeScreen = document.getElementById('home-screen');
  const gameWrapper = document.getElementById('game-wrapper');
  if (homeScreen) homeScreen.style.display = 'none';
  if (gameWrapper) {
    gameWrapper.classList.add('active');
    gameWrapper.setAttribute('aria-hidden', 'false');
  }

  const screen = document.getElementById('game-over-screen');
  if (screen) {
    screen.classList.remove('active');
    screen.setAttribute('aria-hidden', 'true');
  }

  spawnMushroomSwarm(getMushroomSpawnCoords());
  gameOver = false;
  duckScrollX = -64;
  gameOverDuckFrameIndex = 0;
  gameOverDuckAnimTimer = 0;
  gameStarted = true;
  loop();
}

function keyPressed() {
  if (!gameStarted || gameOver) {
    return;
  }
  player.handleKey(key, keyCode);
}