// Game settings
let gravite = 0.25;
let forceSaut = -3.5;  
let vitesse = 4.5;
let etat = "attente"; 
let score = 0;
let etoilesTotal = 0; 

// Elements
let avion = document.getElementById("avion");
let msg = document.getElementById("msg");
let scoreAff = document.getElementById("score");
let scene = document.querySelector(".scene");
let zone = scene.getBoundingClientRect();

// Sounds
let sonPoint = new Audio("assets/point.mp3");
let sonExplosion = new Audio("assets/explosion.mp3");

// Vertical speed indicator
let vitesseY = 0;
let intervalObstacle;
let etoileTimeout;

// Initial menu
if ('ontouchstart' in window) {
    msg.innerHTML = "Appuyez sur l'écran pour commencer<br><small>Touchez pour voler</small>";
} else {
    msg.innerHTML = "Press <b>Enter</b> to start<br><small>Space or ↑ to fly</small>";
}
msg.style.display = "block";
avion.style.display = "none";

// Flying function
function sauter() {
    if (etat === "joue") {
        vitesseY = forceSaut;
    }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
    // Start game only with Enter
    if (e.key === "Enter" && etat !== "joue") {
        commencer();
    }
    
    // Fly using Space or ArrowUp only when the game is running
    if (etat === "joue") {
        if (e.key === "ArrowUp" || e.key === " ") {
            e.preventDefault();
            sauter();
        }
    }
});

// Touch controls (for mobile devices)
document.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (etat === "joue") {
        sauter();
    } else {
        commencer(); // Start game by touch on mobile
    }
}, { passive: false });

function commencer() {
    // Clear the screen
    clearInterval(intervalObstacle);
    clearTimeout(etoileTimeout);
    document.querySelectorAll(".obstacle").forEach(o => o.remove());
    document.querySelectorAll(".etoile").forEach(e => e.remove());

    // Reset initial values
    vitesse = 4.5;        
    score = 0;
    etoilesTotal = 0;
    scoreAff.innerText = score;
    document.getElementById("nombreEtoiles").innerText = etoilesTotal;
    vitesseY = 0;

    // Obstacle timing
    intervalObstacle = setInterval(creerObstacle, 1300);

    // Game state
    etat = "joue";
    msg.style.display = "none";
    avion.style.display = "block";
    avion.style.top = "45vh";
    document.querySelector(".score").style.display = "block";

    // Start engine
    bouger();
    graviteMouvement();
    creerEtoile();
}

function creerEtoile() {
    if (etat !== "joue") return;

    let etoile = document.createElement("div");
    etoile.className = "etoile";

    let obstacles = document.querySelectorAll(".obstacle");
    let ouvertureTop = 0;
    let ouvertureBottom = zone.height;

    obstacles.forEach(obs => {
        let rect = obs.getBoundingClientRect();
        if (rect.top === 0) ouvertureTop = rect.bottom;
        if (rect.bottom === zone.height) ouvertureBottom = rect.top;
    });

    // Random vertical position between obstacles
    let posY = Math.floor(Math.random() * (ouvertureBottom - ouvertureTop - 40)) + ouvertureTop + 20;
    etoile.style.top = posY + "px";
    etoile.style.left = zone.width + "px";

    scene.appendChild(etoile);

    function bougerEtoile() {
        if (etat !== "joue" || !scene.contains(etoile)) return;

        let rect = etoile.getBoundingClientRect();
        let avionRect = avion.getBoundingClientRect();
        etoile.style.left = rect.left - vitesse + "px";

        // Star collision
        if (collision(avionRect, rect)) {
            etoilesTotal++;
            document.getElementById("nombreEtoiles").innerText = etoilesTotal;
            sonPoint.play();
            etoile.remove();
            return;
        }

        // Remove star if it leaves the screen
        if (rect.right < 0) etoile.remove();
        requestAnimationFrame(bougerEtoile);
    }

    requestAnimationFrame(bougerEtoile);
    etoileTimeout = setTimeout(creerEtoile, Math.random() * 1300 + 1500);
}

function bouger() {
    if (etat !== "joue") return;
    let obstacles = document.querySelectorAll(".obstacle");
    let avionRect = avion.getBoundingClientRect();

    obstacles.forEach(obs => {
        let rect = obs.getBoundingClientRect();
        obs.style.left = rect.left - vitesse + "px";

        // Obstacle collision
        if (collision(avionRect, rect)) {
            fin();
        }

        // Scoring
        if (rect.right < avionRect.left && obs.dataset.score) {
            score++;
            scoreAff.innerText = score;

            // Increase difficulty every 20 points
            if (score % 20 === 0 && score !== 0) {
                vitesse += 2.5;
                clearInterval(intervalObstacle);
                let temps = 2000 - Math.log(score + 1) * 600;
                if (temps < 800) temps = 800;
                intervalObstacle = setInterval(creerObstacle, temps);
            }
            obs.removeAttribute("data-score");
        }

        // Remove obstacle if it leaves the screen
        if (rect.right < 0) obs.remove();
    });

    requestAnimationFrame(bouger);
}

function graviteMouvement() {
    if (etat !== "joue") return;

    vitesseY += gravite;
    let pos = avion.getBoundingClientRect().top + vitesseY;

    // Top boundary
    if (pos < 0) pos = 0;

    // Bottom boundary
    if (pos + avion.getBoundingClientRect().height > zone.height) {
        pos = zone.height - avion.getBoundingClientRect().height;
        fin();
    }

    avion.style.top = pos + "px";
    requestAnimationFrame(graviteMouvement);
}

let couleursChoisies = ["#652a48ff", "#2e2650ff", "#7e4352ff", "#4e416d", "#9d2c5fff"]; 
let indexCouleur = 0;

function creerObstacle() {
    if (etat !== "joue") return;

    let largeurObstacle = 80;
    let ouverture = 180 + Math.random() * 40;
    let hauteur = Math.floor(Math.random() * 200) + 80;

    // Cycle through obstacle colors
    let couleurRandom = couleursChoisies[indexCouleur];
    indexCouleur++;
    if(indexCouleur >= couleursChoisies.length) indexCouleur = 0;

    let haut = document.createElement("div");
    haut.className = "obstacle";
    haut.style.height = hauteur + "px";
    haut.style.width = largeurObstacle + "px";
    haut.style.left = zone.width + "px";
    haut.style.top = "0px";
    haut.style.background = couleurRandom;
    haut.dataset.score = "1";

    let bas = document.createElement("div");
    bas.className = "obstacle";
    bas.style.height = (zone.height - hauteur - ouverture) + "px";
    bas.style.width = largeurObstacle + "px";
    bas.style.left = zone.width + "px";
    bas.style.bottom = "0";
    bas.style.background = couleurRandom;
    bas.dataset.score = "1";

    scene.appendChild(haut);
    scene.appendChild(bas);
}

// Collision detection
function collision(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function fin() {
    if (etat === "fin") return;
    etat = "fin";
    clearInterval(intervalObstacle);
    clearTimeout(etoileTimeout);

    sonExplosion.play();
    avion.style.display = "none";
    document.querySelector(".score").style.display = "none";

    // Game over message
    let restartMsg = ('ontouchstart' in window) ? "Touchez pour recommencer" : "Press <b>Enter</b> to restart";
    msg.innerHTML = "💥 Lost <br> Score : " + score + "<br> ⭐ : " + etoilesTotal + "<br><small>" + restartMsg + "</small>";
    msg.style.display = "block";
}

// Update calculations when screen size changes
window.addEventListener('resize', () => {
    zone = scene.getBoundingClientRect();
});
