const levels = {
  room1: {
    imagePath: 'Asset/Map/map.png',
    // On définit les rectangles de collision UNIQUEMENT là où les pieds 
    // du personnage ne doivent pas passer.
    walls: [
      { x: 0, y: 0, w: 900, h: 64 },   //  Mur Nord
      { x: 515, y: 0, w: 62, h: 420 },  // mur milieu/haut 1
      { x: 516, y: 240, w: 190, h: 182 },    // mur milieu/haut 2
      { x:0, y:0, w:1, h:600}  //Mur invisible gauche
      // Un mur interne (ex: un comptoir ou muret)
    ]
  }
};

let currentWalls = [];
let currentBg;

function loadLevel(levelName) {
  const level = levels[levelName];
  // On charge l'image du décor
  currentBg = loadImage(level.imagePath);
  // On récupère les zones de collision
  currentWalls = level.walls;
}

function drawWalls() {
  // Debug : On dessine les zones de collision en rouge très transparent
  // pour vérifier qu'elles sont bien placées à la BASE des murs dessinés.
  noStroke();
  fill(255, 0, 0, 80); 
  for (let w of currentWalls) {
    rect(w.x, w.y, w.w, w.h);
  }
}