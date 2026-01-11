let avion = document.getElementById("avion");
let msg = document.getElementById("msg");
let scoreAff = document.getElementById("score");
let scene = document.querySelector(".scene");
let zone = scene.getBoundingClientRect();

let gravite = 0.25;
let forceSaut = -3.5;
let vitesseY = 0;
let vitesse = 4;
let score = 0;
let etat = "attente";
let intervalObstacle;

function sauter() {
    if (etat === "joue") vitesseY = forceSaut;
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && etat !== "joue") commencer();
    if (e.key === "ArrowUp") sauter();
});

function commencer() {
    document.querySelectorAll(".obstacle").forEach(o => o.remove());
    score = 0;
    scoreAff.innerText = score;

    etat = "joue";
    msg.style.display = "none";
    avion.style.display = "block";
    document.querySelector(".score").style.display = "block";

    intervalObstacle = setInterval(creerObstacle, 1500);
    graviteMouvement();
    bouger();
}

function creerObstacle() {
    let haut = document.createElement("div");
    haut.className = "obstacle";
    haut.style.height = "200px";
    haut.style.left = zone.width + "px";
    haut.style.top = "0";

    let bas = document.createElement("div");
    bas.className = "obstacle";
    bas.style.height = "200px";
    bas.style.left = zone.width + "px";
    bas.style.bottom = "0";

    scene.appendChild(haut);
    scene.appendChild(bas);
}

function bouger() {
    if (etat !== "joue") return;

    let obstacles = document.querySelectorAll(".obstacle");
    let avionRect = avion.getBoundingClientRect();

    obstacles.forEach(obs => {
        let rect = obs.getBoundingClientRect();
        obs.style.left = rect.left - vitesse + "px";

        if (collision(avionRect, rect)) fin();
        if (rect.right < 0) obs.remove();
    });

    requestAnimationFrame(bouger);
}

function graviteMouvement() {
    if (etat !== "joue") return;
    vitesseY += gravite;
    avion.style.top = avion.getBoundingClientRect().top + vitesseY + "px";
    requestAnimationFrame(graviteMouvement);
}

function collision(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function fin() {
    etat = "fin";
    clearInterval(intervalObstacle);
    msg.style.display = "block";
    msg.innerHTML = "Game Over<br><small>Press Enter</small>";
    avion.style.display = "none";
    document.querySelector(".score").style.display = "none";
}
