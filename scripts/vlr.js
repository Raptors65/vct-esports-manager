const temp1 = document.querySelector(".wf-table > tbody");
const players = [];

const agentConv = {
    brimstone: "Brimstone",
    viper: "Viper",
    omen: "Omen",
    killjoy: "Killjoy",
    cypher: "Cypher",
    sova: "Sova",
    sage: "Sage",
    phoenix: "Phoenix",
    jett: "Jett",
    reyna: "Reyna",
    raze: "Raze",
    breach: "Breach",
    skye: "Skye",
    yoru: "Yoru",
    astra: "Astra",
    kayo: "KAY/O",
    chamber: "Chamber",
    neon: "Neon",
    fade: "Fade",
    harbor: "Harbor",
    gekko: "Gekko",
    deadlock: "Deadlock",
    iso: "Iso",
    clove: "Clove",
    vyse: "Vyse"
};

let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});

for (const player of temp1.children) {
    const playerCols = Array.from(player.children);
    players.push({
        "username": player.querySelector(".text-of").innerText,
        "team": player.querySelector(".stats-player-country").innerText,
        "country": regionNames.of(player.querySelector("i").className.slice(-2).toUpperCase()),
        "agents": Array.from(player.querySelectorAll(".mod-agents > div > img")).map((img) => agentConv[img.src.split("/").slice(-1)[0].split(".")[0]]),
        "numRounds": parseInt(player.querySelector(".mod-rnd").innerText),
        "rating": parseFloat(playerCols[3].innerText),
        "acs": parseFloat(playerCols[4].innerText),
        "kd": parseFloat(playerCols[5].innerText),
        "kast": parseFloat(playerCols[6].innerText),
        "adr": parseFloat(playerCols[7].innerText),
        "kpr": parseFloat(playerCols[8].innerText),
        "apr": parseFloat(playerCols[9].innerText),
        "fkpr": parseFloat(playerCols[10].innerText),
        "fdpr": parseFloat(playerCols[11].innerText),
        "hs": parseInt(playerCols[12].innerText.slice(0, -1)),
        "cl": parseInt(playerCols[13].innerText.slice(0, -1))
    });
}