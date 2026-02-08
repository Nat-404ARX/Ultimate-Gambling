let results = [];
const statut = document.getElementById("statut");

let money = 5;

let isSpinning = false;

let spinsWithoutWin = 0;

let isLock = false;

let DEBUG_FORCE_SYMBOL = null;
let cheat = false;

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener("keydown", e => {
    if (e.key === "a") {
        if (cheat === false) {
            cheat = true;
            console.log("Cheat activer");
        } else {
            cheat = false;
            console.log("Cheat desactiver");
        }
    }
});

//changé les valeurs pour déclenché un symbole si la touche est pressé

if (cheat) {
    document.addEventListener("keydown", e => {
        if (e.key === "9") DEBUG_FORCE_SYMBOL = "bombe";
        if (e.key === "8") DEBUG_FORCE_SYMBOL = "crane";
        if (e.key === "7") DEBUG_FORCE_SYMBOL = "araigné";
        if (e.key === "6") DEBUG_FORCE_SYMBOL = "cerise";
        if (e.key === "5") DEBUG_FORCE_SYMBOL = "cadena";
        if (e.key === "4") DEBUG_FORCE_SYMBOL = "six";
        if (e.key === "3") DEBUG_FORCE_SYMBOL = "poisson";
        if (e.key === "2") DEBUG_FORCE_SYMBOL = "tv";
        if (e.key === "1") DEBUG_FORCE_SYMBOL = "seven";
        if (e.key === "0") DEBUG_FORCE_SYMBOL = null;
    });
}

function getSymbolIndexByName(name) {
    return symbols.findIndex(s => s.name === name);
}


function updateMoney(amount) {
    money += amount;
    document.getElementById("money").textContent = `💰 ${money}$`;
}


function spinReel(reel, duration, callback, forcedIndex = null) {
    let position = 0;

    const interval = setInterval(() => {
        position = (position + 1000) % (symbols.length * 100); //vitesse de tournage
        reel.style.transform = `translateY(-${position}px)`;
    }, 600);

    setTimeout(() => {
        clearInterval(interval);

        /*
        const finalIndex = forcedIndex !== null
            ? forcedIndex
            : getRandomSymbolIndex();
        */

        let finalIndex;
        if (DEBUG_FORCE_SYMBOL !== null) {
            finalIndex = getSymbolIndexByName(DEBUG_FORCE_SYMBOL);
        } else if (forcedIndex !== null) {
            finalIndex = forcedIndex;
        } else {
            finalIndex = getRandomSymbolIndex();
        }
        
        reel.style.transform = `translateY(-${finalIndex * 100}px)`;
        callback(finalIndex);
    }, duration);
}

function getRandomSymbolIndex() {
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;

    for (let i = 0; i < symbols.length; i++) {
        rand -= symbols[i].weight;
        if (rand <= 0) return i;
    }
}

function getGuaranteedSymbolIndex() {
    const commonSymbols = symbols.filter(s => s.weight >= 50); //poids maximals quand on garantie une victoire
    const chosen = commonSymbols[Math.floor(Math.random() * commonSymbols.length)];
    return symbols.indexOf(chosen);
}



function spinAll() {
    if (isSpinning) return;
        isSpinning = true;
        lever.style.backgroundColor = "var(--bg-element)"
    results = [];
    updateText("EN ATTENTE DU RESULTAT");
    playRandomSpinSound();

    const forceWin = (spinsWithoutWin >= randomInt(3,5)); //nombre de partie avant de forcer une win
    let forcedIndex = null;

    if (forceWin) {
        forcedIndex = getGuaranteedSymbolIndex();
    }

    reels.forEach((reel, index) => {
        setTimeout(() => {
            spinReel(reel, 2500 + index * 800, (result) => {  //temps de tournage
                results[index] = result;

                if (results.filter(r => r !== undefined).length === 3) {
                    checkWin();
                }
            },
            forceWin ? forcedIndex : null
        );
        }, index * 800); //dalai au démarage entre chaque slot
    });
}

function checkWin() {
    const [a, b, c] = results;
    const isWin = (a === b && b === c);
    if (isWin) {
        if (symbols[a].name === "seven") { //modifier le symbole de jackpot ici
            const gain = symbols[a].gain;
            updateText(`JACKPOT : +${gain}$`);
            updateMoney(gain);
            playSound("sound-jackpot");
            statut.classList.add("jackpot");
            setTimeout(() => {
                playSound("sound-jackpot-coin");
            }, 1800)

            setTimeout(() => {
                statut.classList.remove("jackpot");
            }, 2000);
        } else if (symbols[a].name === "diamant" || symbols[a].name === "pomme d'or" || symbols[a].name === "couronne" || symbols[a].name === "trèfle" || symbols[a].name === "lingot") {
            const gain = symbols[a].gain;
            updateText(`GAGNE : ${gain}$`);
            updateCommentaire(symbols[a].commentaire);
            updateMoney(gain);
            playSound("sound-win");
            setTimeout(() => {
                playSound("sound-win-lot-coin");
            }, 1600)
        } else if (symbols[a].name === "bombe" || symbols[a].name === "crane" || symbols[a].name === "tax" || symbols[a].name === "requin" || symbols[a].name === "araigné") {
            const gain = symbols[a].gain;
            updateText(`PERDU : ${gain}$`);
            updateCommentaire(symbols[a].commentaire);
            updateMoney(gain);
            playSound("sound-lose2");
        } else if (symbols[a].name === "poisson") {
            const gain = symbols[a].gain;
            updateText(`???`);
            updateCommentaire(symbols[a].commentaire);
            updateMoney(gain);
            document.getElementById("poisson").style.visibility = "visible";
            setTimeout(() => {
                document.getElementById("poisson").style.visibility = "collapse";
            },18000)
        } else if (symbols[a].name === "six") {
            money = 666;
            document.getElementById("money").textContent = `💰 ${money}$`;
            updateText(`666`);
            updateCommentaire(symbols[a].commentaire);
        } else if (symbols[a].name === "tv") {
            const gain = symbols[a].gain;
            updateText(`GAGNE`);
            updateCommentaire(symbols[a].commentaire);
            updateMoney(gain);
            document.getElementById("tv").style.visibility = "visible";
            playSound("its-tv-time");
            setTimeout(() => {
                document.getElementById("tv").style.visibility = "collapse";
            },32000)
        } else if (symbols[a].name === "cadena") {
            const gain = symbols[a].gain;
            updateText(`PERDU`);
            updateCommentaire(symbols[a].commentaire);
            updateMoney(gain);
            playSound("sound-lose2");
            isLock = true;
        } else if (symbols[a].name === "chapeau de magicien") {
            updateText(`PERDU`);
            playSound("sound-lose2");
            updateCommentaire(symbols[a].commentaire);
            document.getElementById("money").textContent = `💰 ????`;
        }
        
        else {
            const gain = symbols[a].gain;
            updateText(`GAGNE : ${gain}$`);
            updateCommentaire(symbols[a].commentaire);
            updateMoney(gain);
            playSound("sound-win");
            setTimeout(() => {
                playSound("sound-win-coin");
            }, 1600)
        }
    } else {
        updateText("PERDU");
        updateMoney(-1); // coût d'une partie
        playSound("sound-lose");
    }
    
    if (isWin) {
        spinsWithoutWin = 0;
    } else {
        spinsWithoutWin++;
    }

    setTimeout(() => {
        if (!isLock) {
            isSpinning = false;
            lever.style.backgroundColor = "var(--levier)"
            updateText("REJOUER ?");
            statut.classList.add("blink");
            verifMoney()
        } else {
            setTimeout(() => {
                isSpinning = false
                isLock = false
                lever.style.backgroundColor = "var(--levier)"
                updateText("REJOUER ?");
                statut.classList.add("blink");
                verifMoney()
            },60000)
        }
    }, 5000);

}

const lever = document.getElementById("lever");
const base = document.getElementById("lever_base");

const reels = [
    document.querySelector("#slot1 .reel"),
    document.querySelector("#slot2 .reel"),
    document.querySelector("#slot3 .reel")
];

const symbols = [
    { name: "cerise", gain: 1, weight: 100, commentaire: "Peut mieux faire !" },
    { name: "citron", gain: 3, weight: 90, commentaire: "Acide" },
    { name: "seven", gain: 10000, weight: 1, commentaire: "Le grand prix" },
    { name: "cloche", gain: 32, weight: 40, commentaire: "Ding Dong" },
    { name: "chef", gain: 66, weight: 20, commentaire: "Comme un chef" },
    { name: "fraise", gain: 5, weight: 80, commentaire: "Meh" },
    { name: "raisin", gain: 8, weight: 70, commentaire: "Juteux" },
    { name: "cadeau", gain: 250, weight: 18, commentaire: "Un cadeau tomber du ciel" },
    { name: "pomme", gain: 10, weight: 65, commentaire: "Délicieux" },
    { name: "papillion", gain: 50, weight: 45, commentaire: "Léger comme l'air" },
    { name: "trèfle", gain: 2000, weight: 3, commentaire: "Tellement chanceux" },
    { name: "crabe", gain: 75, weight: 30, commentaire: "ça pince !" },
    { name: "jeton", gain: 100, weight: 25, commentaire: "Qui pour un poker ?" },
    { name: "araigné", gain: -3, weight: 85, commentaire: "Aïe" },
    { name: "diamant", gain: 500, weight: 15, commentaire: "Un diamant étincelant !" },
    { name: "grenouille", gain: 125, weight: 20, commentaire: "Croa !" },
    { name: "orange", gain: 15, weight: 60, commentaire: "Plein de vitamine" },
    { name: "tacos", gain: 38, weight: 48, commentaire: "Repas copieux" },
    { name: "crane", gain: -100, weight: 15, commentaire: "Mauvais Choix" },
    { name: "pastèque", gain: 25, weight: 50, commentaire: "Yummy !" },
    { name: "requin", gain: -15, weight: 60, commentaire: "Moins 10 d'Aura" },
    { name: "couronne", gain: 1000, weight: 5, commentaire: "Votre Altesse, vous êtes royal !" },
    { name: "poisson", gain: 1, weight: 10, commentaire: "" },
    { name: "pomme d'or", gain: 750, weight: 60, commentaire: "Tout est meilleur en or" },
    { name: "six", gain: 666, weight: 12, commentaire: "Diabolique" },
    { name: "chapeau de magicien", gain: 0, weight: 52, commentaire: "Abracadabra" },
    { name: "bombe", gain: -9999999, weight: 3, commentaire: "Explose !" },
    { name: "tv", gain: 29, weight: 47, commentaire: "It's TV Time !" },
    { name: "cadena", gain: 0, weight: 52, commentaire: "Tu peux plus gambling, hein ?" },
    { name: "tax", gain: -50, weight: 40, commentaire: "Encore des taxs ??" },
    { name: "lingot", gain: 5000, weight: 2, commentaire: "J'suis riche" },
    { name: "trèfle", gain: randomInt(3,6), weight: 50, commentaire: "Carte de trèfle" },
    { name: "coeur", gain: randomInt(-1,7), weight: 50, commentaire: "Carte de coeur" },
    { name: "pic", gain: randomInt(-8,12), weight: 50, commentaire: "Carte de pic" },
    { name: "careau", gain: randomInt(1,9), weight: 50, commentaire: "Carte de careau" }
];


const SYMBOL_HEIGHT = 100;


const MAX_PULL = 150;
let isDragging = false;
updateText("JOUER");


console.log(slot1, slot2, slot3, lever, base, statut);

const spinSounds = [
    new Audio("./asset/audio/toune/slotmachine.mp3"),
    new Audio("./asset/audio/toune/electric-slot-machine.mp3"),
    new Audio("./asset/audio/toune/roulette-casino.mp3"),
    new Audio("./asset/audio/toune/slotmachine-jagerhuus.mp3"),
    new Audio("./asset/audio/toune/tourn-wheel.wav")
];


spinSounds.forEach(s => s.volume = 0.5);

function playRandomSpinSound() {
    const sound = spinSounds[Math.floor(Math.random() * spinSounds.length)];
    sound.currentTime = 0;
    sound.play();
}


function verifMoney() {
    if (money <= 0) {
        updateText("GAME OVER");
        isSpinning = true;
        lever.style.backgroundColor = "var(--bg-element)"
        money = 0;
        updateMoney(money);
        document.getElementById("slots").style.backgroundColor = "#a40202";
        bgMusic.pause()
        playSound("sound-game-over");
    }
}

function updateText(text) {
    statut.textContent = text;

    if (text === "JOUER" || text == "REJOUER ?") {
        statut.classList.add("blink");
    } else {
        statut.classList.remove("blink");
    }
}

function updateCommentaire(text) {
    document.getElementById("commentaire").textContent = text;

    setTimeout(() => {
        document.getElementById("commentaire").textContent = "";
    }, 5500)
}


lever.addEventListener("mousedown", () => {
    isDragging = true;
    console.log("Levier baisser")
});

document.addEventListener("mouseup", () => {
    console.log("Levier remonter")
    if (isDragging) {
        playSound("sound-insert-coin");
        setTimeout(() => {
            playSound("sound-lever-up");
            isDragging = false;
            base.style.transform = "scaleY(1)";
            console.log("Machine activer")
            lever.style.top = "0px";
            spinAll();
        }, 500);  
    }
});

document.addEventListener("mousemove", (e) => {
    if (isSpinning) return;
    if (!isDragging) return;

    const containerTop = lever.parentElement.getBoundingClientRect().top;
    let y = e.clientY - containerTop;

    y = Math.max(0, Math.min(150, y));
    lever.style.top = y + "px";

    const scale = 1 - (y / MAX_PULL);
    base.style.transform = `scaleY(${scale})`;
    updateText("LEVIER TIRER");
    playSound("sound-lever-down");
    verifMoney()
});

function playSound(id) {
    const sound = document.getElementById(id);
    sound.currentTime = 0;
    sound.play();
}


const bgMusic = document.getElementById("bg-music");
const clickSound = document.getElementById("sound-click")
bgMusic.volume = 0.25; 
clickSound.volume = 0.6;

let musicStarted = false;

document.addEventListener("click", () => {
    // musique
    if (!musicStarted) {
        bgMusic.play();
        musicStarted = true;
    }

    // son de clic
    clickSound.currentTime = 0;
    clickSound.play();
});

let muted = false;

function toggleMute() {
    muted = !muted;
    document.querySelectorAll("audio").forEach(a => a.muted = muted);
}

//idée mettre un symbole qui fait perdre instant le joueur