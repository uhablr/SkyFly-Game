let avion = document.getElementById("avion");
let msg = document.getElementById("msg");
let scene = document.querySelector(".scene");
let zone = scene.getBoundingClientRect();

let gravite = 0.25;
let forceSaut = -3.5;
let vitesseY = 0;
let etat = "attente";

function sauter() {
    if (etat === "joue") {
        vitesseY = forceSaut;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && etat !== "joue") {
        commencer();
    }
    if (e.key === "ArrowUp") {
        sauter();
    }
});

function commencer() {
    etat = "joue";
    msg.style.display = "none";
    avion.style.display = "block";
    avion.style.top = "45vh";
    vitesseY = 0;
    graviteMouvement();
}

function graviteMouvement() {
    if (etat !== "joue") return;

    vitesseY += gravite;
    let pos = avion.getBoundingClientRect().top + vitesseY;

    if (pos < 0) pos = 0;
    if (pos + avion.offsetHeight > zone.height) {
        etat = "fin";
        msg.style.display = "block";
        msg.innerHTML = "Game Over<br><small>Press Enter</small>";
        avion.style.display = "none";
        return;
    }

    avion.style.top = pos + "px";
    requestAnimationFrame(graviteMouvement);
}
