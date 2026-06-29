import { karakterler, anaRenkler } from './karakterler.js';
import { runGauntletBattle, runMatchupBattle, runSynergyBattle } from './savasMotoru.js';
import { getAudioSettings, sesCal, sesDurdur, updateAudioSettings } from './sesMotoru.js';
import { triggerHakiLightning } from './efektler.js';
import { drawWheel, getWinningCharacter } from './cark.js';
import { byId, all, hideFromBlock, hideFromFlex, setDisabled, setHtml, setText, showAsBlock, showAsFlex } from './domYardimcilari.js';
import { formatBeri } from './format.js';
import { createInitialGameState, removeCharacterById, resetGameState, TEAM_SIZE, toTeamCharacter } from './oyunDurumu.js';
import {
    applyKnockedOutSlot,
    countEmptySlots,
    fillTeamSlot,
    hasAvailableSlot,
    resetTeamSlots,
    updatePowerDisplay,
    updateRoleOptions
} from './takimArayuzu.js';
import {
    appendBattleLine,
    clearBattleEffects,
    createCombatPopup,
    parseBattleLines,
    showVictoryEffects
} from './savasPopup.js';

const dom = {
    canvas: byId("wheelCanvas"),
    spinButton: byId("spin-btn"),
    result: byId("result-display"),
    rerollCount: byId("reroll-count"),
    rerollButtonCount: byId("reroll-count-btn"),
    rerollTokens: byId("reroll-tokens"),
    turn: byId("turn-display"),
    modeSelect: byId("mode-select"),
    startBattleButton: byId("start-battle-btn"),
    resetButton: byId("reset-btn"),
    characterModal: byId("character-modal"),
    modalCharacterName: byId("modal-char-name"),
    modalCharacterBounty: byId("modal-char-bounty"),
    modalRoleSelect: byId("modal-role-select"),
    modalAcceptButton: byId("modal-accept-btn"),
    modalPassButton: byId("modal-pass-btn"),
    lobbyScreen: byId('lobby-screen'),
    gameScreen: byId('game-screen'),
    createRoomButton: byId('create-room-btn'),
    joinRoomButton: byId('join-room-btn'),
    roomInput: byId('room-input'),
    usernameInput: byId('username-input'),
    roomCode: byId('room-code-display'),
    copyRoomButton: byId('copy-btn'),
    rulesButtons: [byId("rules-btn"), byId("lobby-rules-btn")].filter(Boolean),
    rulesModal: byId("rules-modal"),
    closeRulesButton: byId("close-rules-btn"),
    readyButton: byId("ready-btn"),
    readyStatus: {
        1: byId("p1-ready-status"),
        2: byId("p2-ready-status")
    },
    teamBoxes: {
        1: byId("p1-team"),
        2: byId("p2-team")
    },
    turnToast: byId("turn-toast"),
    settingsToggle: byId("settings-toggle"),
    settingsPanel: byId("settings-panel"),
    masterVolume: byId("master-volume"),
    musicVolume: byId("music-volume"),
    effectsVolume: byId("effects-volume"),
    muteAll: byId("mute-all"),
    stampPanel: byId("stamp-panel"),
    stampStage: byId("stamp-stage")
};

const ctx = dom.canvas.getContext("2d");
const state = createInitialGameState(karakterler);
const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');

let socket = null;
let selectedAvatar = sessionStorage.getItem('korsanAvatar') || "🍖";
let readyState = { 1: false, 2: false };
let gameStarted = false;
let lastAnnouncedTurn = null;
let turnToastTimer = null;
let lastStampSentAt = 0;
let battlePopup = {
    lines: [],
    currentIndex: 0,
    winnerId: 0
};

bindAvatarSelection();
bindRulesModal();
bindAudioMixer();
renderStampPanel();

if (roomName) {
    startGameRoom(roomName);
} else {
    showLobby();
}

function bindAvatarSelection() {
    all('.avatar-item').forEach(item => {
        item.addEventListener('click', () => {
            all('.avatar-item').forEach(avatar => avatar.classList.remove('active'));
            item.classList.add('active');
            selectedAvatar = item.dataset.avatar;
        });
    });
}

function bindRulesModal() {
    if (!dom.rulesModal || !dom.closeRulesButton) return;

    dom.rulesButtons.forEach(button => {
        button.addEventListener("click", () => showAsFlex(dom.rulesModal));
    });

    dom.closeRulesButton.addEventListener("click", () => hideFromFlex(dom.rulesModal));
    dom.rulesModal.addEventListener("click", event => {
        if (event.target === dom.rulesModal) hideFromFlex(dom.rulesModal);
    });
}

function showLobby() {
    showAsBlock(dom.lobbyScreen);
    hideFromBlock(dom.gameScreen);

    dom.createRoomButton?.addEventListener('click', () => {
        savePlayerIdentity();
        urlParams.set('room', `Room-${Math.floor(1000 + Math.random() * 9000)}`);
        window.location.search = urlParams.toString();
    });

    dom.joinRoomButton?.addEventListener('click', () => {
        savePlayerIdentity();

        const requestedRoom = dom.roomInput.value.trim();
        if (!requestedRoom) {
            alert("Lutfen gecerli bir oda kodu girin Kaptan!");
            return;
        }

        urlParams.set('room', requestedRoom);
        window.location.search = urlParams.toString();
    });
}

function savePlayerIdentity() {
    const username = dom.usernameInput?.value.trim() || 'Kaptan';
    sessionStorage.setItem('korsanAdi', username);
    sessionStorage.setItem('korsanAvatar', selectedAvatar);
}

function startGameRoom(currentRoomName) {
    hideFromBlock(dom.lobbyScreen);
    showAsBlock(dom.gameScreen);

    const savedName = sessionStorage.getItem('korsanAdi') || 'Kaptan';
    selectedAvatar = sessionStorage.getItem('korsanAvatar') || selectedAvatar;

    setText(dom.roomCode, currentRoomName);
    if (dom.usernameInput) dom.usernameInput.value = savedName;
    markSelectedAvatar();
    bindRoomCopyButton(currentRoomName);

    socket = io();
    socket.emit('joinRoom', {
        room: currentRoomName,
        username: savedName,
        avatar: selectedAvatar
    });

    setupSocketListeners();
    bindGameControls();
}

function markSelectedAvatar() {
    all('.avatar-item').forEach(item => {
        item.classList.toggle('active', item.dataset.avatar === selectedAvatar);
    });
}

function bindRoomCopyButton(currentRoomName) {
    dom.copyRoomButton?.addEventListener('click', () => {
        navigator.clipboard.writeText(currentRoomName)
            .then(() => temporarilyMarkCopied())
            .catch(error => console.error('Kod kopyalanamadi:', error));
    });
}

function temporarilyMarkCopied() {
    setText(dom.copyRoomButton, 'Kopyalandi!');
    dom.copyRoomButton.style.backgroundColor = '#28a745';

    setTimeout(() => {
        setText(dom.copyRoomButton, 'Kopyala');
        dom.copyRoomButton.style.backgroundColor = '#007bff';
    }, 2000);
}

function setupSocketListeners() {
    socket.on('playerAssignment', data => {
        state.myPlayerNumber = data.player;
        console.log(`Rolun: ${data.color} - Oyuncu Numaran: ${state.myPlayerNumber}`);
        updateReadyDisplays();
        updateActionAvailability();
    });

    socket.on('roomStatus', updateRoomStatus);
    socket.on('initGameState', applyInitialServerState);
    socket.on('runSpinAnimation', runSpinAnimation);
    socket.on('runPassAction', runPassAction);
    socket.on('runAcceptAction', runAcceptAction);
    socket.on('runBattleResult', openBattlePopup);
    socket.on('runNextLogStep', renderNextBattleLine);
    socket.on('runResetAction', resetArena);
    socket.on('stampReceived', showStamp);
}

function updateRoomStatus(data) {
    readyState = {
        1: Boolean(data.ready?.[1]),
        2: Boolean(data.ready?.[2])
    };

    setPlayerCard(1, data.p1Data);
    setPlayerCard(2, data.p2Data);
    updateReadyDisplays();

    if (!gameStarted && readyState[1] && readyState[2]) {
        setText(dom.result, "Iki tayfa da hazir. Draft basliyor...");
        socket.emit('syncInitialCharacters', karakterler);
    }
}

function setPlayerCard(playerNumber, playerData) {
    setText(byId(`p${playerNumber}-name-display`), playerData?.username || `Korsan ${playerNumber} Bekleniyor...`);
    setText(byId(`p${playerNumber}-avatar-display`), playerData?.avatar || "🏴‍☠️");
}

function applyInitialServerState(serverState) {
    gameStarted = Boolean(serverState.oyunBasladi);

    if (serverState.oyunBasladi && serverState.aktifKarakterler?.length > 0) {
        state.activeCharacters = serverState.aktifKarakterler;
    } else {
        state.activeCharacters = [...karakterler];
        if (readyState[1] && readyState[2]) {
            socket.emit('syncInitialCharacters', karakterler);
        }
    }

    state.activePlayer = serverState.aktifOyuncu || 1;
    state.passRights[1] = serverState.p1PasHakki ?? state.passRights[1];
    state.passRights[2] = serverState.p2PasHakki ?? state.passRights[2];

    hydrateTeamsFromServer(serverState);
    updateTurnDisplay();
    updatePassDisplays();
    updateReadyDisplays();
    updateActionAvailability();
    renderWheel();
}

function hydrateTeamsFromServer(serverState) {
    const p1Team = serverState.p1Takim ?? state.teams[1];
    const p2Team = serverState.p2Takim ?? state.teams[2];

    state.teams[1] = [...p1Team];
    state.teams[2] = [...p2Team];
    state.totalPower[1] = serverState.p1ToplamGuc ?? calculateTeamPower(p1Team);
    state.totalPower[2] = serverState.p2ToplamGuc ?? calculateTeamPower(p2Team);

    resetTeamSlots();
    renderServerTeam(1, p1Team);
    renderServerTeam(2, p2Team);
    updatePowerDisplay(1, state.totalPower[1]);
    updatePowerDisplay(2, state.totalPower[2]);
}

function renderServerTeam(playerNumber, team) {
    team.forEach((character, slotIndex) => {
        if (!character) return;

        if (character.guc === 0 || character.seviye === 0) {
            applyKnockedOutSlot(playerNumber, slotIndex);
            return;
        }

        fillTeamSlot(playerNumber, slotIndex, character);
    });
}

function calculateTeamPower(team) {
    return team.reduce((total, character) => total + (character?.guc ?? 0), 0);
}

function bindGameControls() {
    dom.spinButton?.addEventListener("click", requestSpin);
    dom.canvas?.addEventListener("transitionend", handleSpinFinished);
    dom.modalPassButton?.addEventListener("click", requestPass);
    dom.modalAcceptButton?.addEventListener("click", requestAccept);
    dom.startBattleButton?.addEventListener("click", requestBattle);
    dom.resetButton?.addEventListener("click", () => socket.emit('requestReset'));
    dom.readyButton?.addEventListener("click", toggleReady);
}

function requestSpin() {
    if (!gameStarted) {
        alert("Draft baslamadan once iki oyuncu da Ready olmali.");
        return;
    }

    if (state.activeCharacters.length === 0) {
        setText(dom.result, "Carkta secilecek karakter kalmadi!");
        return;
    }

    if (!isMyTurn()) {
        alert("Sira sende degil Kaptan! Rakibinin hamlesini bekle.");
        return;
    }

    socket.emit('requestSpin');
}

function runSpinAnimation(data) {
    setDisabled([dom.spinButton, dom.startBattleButton], true);
    setText(dom.result, "Cark donuyor, kader belirleniyor...");
    sesCal('spin', true);

    document.querySelector(".wheel-pointer")?.classList.add("pointer-spinning");

    state.currentRotation += 1800 + data.randomDegree;
    dom.canvas.style.transform = `rotate(${state.currentRotation}deg)`;
}

function handleSpinFinished() {
    sesDurdur('spin');
    document.querySelector(".wheel-pointer")?.classList.remove("pointer-spinning");
    sesCal('select');

    state.selectedCharacter = getWinningCharacter(state.activeCharacters, state.currentRotation);
    if (!state.selectedCharacter) return;

    setHtml(
        dom.result,
        `🎯 Savasci: <b>${state.selectedCharacter.isim}</b><br><span style="color:#f1c40f;">Odul: ${formatBeri(state.selectedCharacter.guc)}</span>`
    );

    updateRoleOptions(dom.modalRoleSelect, state.activePlayer);
    setText(dom.modalCharacterName, state.selectedCharacter.isim.toUpperCase());
    setText(dom.modalCharacterBounty, formatBeri(state.selectedCharacter.guc));
    showAsFlex(dom.characterModal);
}

function requestPass() {
    if (!isMyTurn()) {
        alert("Sira sende degil Kaptan!");
        return;
    }

    if (state.passRights[state.activePlayer] <= 0) {
        alert("Pas hakkiniz kalmadi!");
        return;
    }

    socket.emit('requestPass');
}

function runPassAction() {
    const previousPassCount = state.passRights[state.activePlayer];
    state.passRights[state.activePlayer]--;
    updatePassDisplays(previousPassCount);
    hideFromFlex(dom.characterModal);
    dom.spinButton.disabled = false;
    updateActionAvailability();

    if (isMyTurn()) {
        socket.emit('requestSpin');
    }
}

function requestAccept() {
    if (!isMyTurn()) {
        alert("Sira sende degil Kaptan!");
        return;
    }

    if (!state.selectedCharacter) return;

    const slotIndex = Number.parseInt(dom.modalRoleSelect.value, 10);
    socket.emit('requestAccept', {
        slotIndex,
        charId: state.selectedCharacter.id
    });
}

function runAcceptAction(data) {
    if (!state.selectedCharacter) return;

    const slotFilled = fillTeamSlot(state.activePlayer, data.slotIndex, state.selectedCharacter);
    if (!slotFilled) return;

    state.activeCharacters = removeCharacterById(state.activeCharacters, data.charId);
    state.teams[state.activePlayer][data.slotIndex] = toTeamCharacter(state.selectedCharacter);
    state.totalPower[state.activePlayer] += state.selectedCharacter.guc;
    updatePowerDisplay(state.activePlayer, state.totalPower[state.activePlayer]);
    renderWheel();

    const hakiMessage = applyHakiShockIfNeeded(data.slotIndex);
    hideFromFlex(dom.characterModal);

    if (finishDraftIfTeamsAreFull()) return;

    moveTurnToNextPlayer();
    setDisabled([dom.spinButton], false);
    updateActionAvailability();
    setHtml(dom.result, `Murettebat guncellendi! Sira ${state.activePlayer}. oyuncuda!${hakiMessage}`);
    state.selectedCharacter = null;
}

function applyHakiShockIfNeeded(slotIndex) {
    if (dom.modeSelect?.value !== "matchup") return "";

    const p1Character = state.teams[1][slotIndex];
    const p2Character = state.teams[2][slotIndex];
    if (!p1Character || !p2Character || p1Character.seviye <= 0 || p2Character.seviye <= 0) return "";

    const powerGap = Math.abs(p1Character.seviye - p2Character.seviye);
    const nextSlotIndex = slotIndex + 1;
    if (powerGap < 15 || nextSlotIndex >= TEAM_SIZE) return "";

    const stunnedPlayer = p1Character.seviye > p2Character.seviye ? 2 : 1;
    knockOutNextCharacter(stunnedPlayer, nextSlotIndex);
    triggerHakiLightning();

    return `<br><span style='color:#ff9f43; font-weight:bold;'>KRALIN HAKISI PATLADI! ${stunnedPlayer}. oyuncunun siradaki savascisi bayildi!</span>`;
}

function knockOutNextCharacter(playerNumber, slotIndex) {
    const currentCharacter = state.teams[playerNumber][slotIndex];
    if (currentCharacter) {
        state.totalPower[playerNumber] -= currentCharacter.guc;
    }

    state.teams[playerNumber][slotIndex] = {
        isim: "Haki Sokuyla Bayildi",
        guc: 0,
        seviye: 0
    };

    applyKnockedOutSlot(playerNumber, slotIndex);
    updatePowerDisplay(playerNumber, state.totalPower[playerNumber]);
}

function finishDraftIfTeamsAreFull() {
    if (countEmptySlots() > 0) return false;

    setDisabled([dom.spinButton], true);
    dom.startBattleButton.disabled = false;
    setHtml(dom.result, "Tum tayfalar kuruldu! Savas butonuna tiklayarak simulasyonu baslatabilirsiniz.");

    if (isMyTurn()) {
        socket.emit('syncActivePlayer', { previousPlayer: state.activePlayer, nextPlayer: 0 });
    }

    state.activePlayer = 0;
    updateTurnAura();
    return true;
}

function moveTurnToNextPlayer() {
    const previousPlayer = state.activePlayer;
    let nextPlayer = previousPlayer === 1 ? 2 : 1;

    if (!hasAvailableSlot(nextPlayer)) {
        nextPlayer = previousPlayer;
    }

    state.activePlayer = nextPlayer;

    if (previousPlayer === state.myPlayerNumber) {
        socket.emit('syncActivePlayer', { previousPlayer, nextPlayer });
    }

    updateTurnDisplay();
    updatePassDisplays();
}

function requestBattle() {
    if (!gameStarted || countEmptySlots() > 0) {
        alert("Savas icin iki tayfanin da tamamlanmasi gerekiyor.");
        return;
    }

    const battleMode = dom.modeSelect?.value || "gauntlet";
    const tempResult = document.createElement("div");

    if (battleMode === "gauntlet") {
        runGauntletBattle(state.teams[1], state.teams[2], dom.turn, tempResult);
    } else if (battleMode === "matchup") {
        runMatchupBattle(state.teams[1], state.teams[2], dom.turn, tempResult);
    } else if (battleMode === "synergy") {
        runSynergyBattle(state.teams[1], state.teams[2], dom.turn, tempResult);
    }

    const finalHtml = tempResult.innerHTML;
    socket.emit('requestBattle', {
        html: finalHtml,
        kazanan: detectWinnerFromBattleHtml(finalHtml),
        senderId: socket.id
    });
}

function detectWinnerFromBattleHtml(html) {
    if (html.includes("1. Oyuncu") || html.includes("Sol Taraf")) return 1;
    if (html.includes("2. Oyuncu") || html.includes("Sag Taraf") || html.includes("SaÄŸ Taraf")) return 2;
    return 0;
}

function openBattlePopup(data) {
    setDisabled([dom.spinButton, dom.startBattleButton], true);
    clearBattleEffects();

    battlePopup = {
        lines: parseBattleLines(data.html),
        currentIndex: 0,
        winnerId: data.kazanan
    };

    createCombatPopup(() => socket.emit('requestNextLogStep'));
    renderNextBattleLine();
}

function renderNextBattleLine() {
    if (battlePopup.currentIndex < battlePopup.lines.length) {
        const line = battlePopup.lines[battlePopup.currentIndex];
        battlePopup.currentIndex++;
        appendBattleLine(line, battlePopup.currentIndex === battlePopup.lines.length);
        return;
    }

    document.getElementById('combat-popup-modal')?.remove();
    showVictoryEffects(battlePopup.winnerId);
    dom.resetButton?.classList.remove('display-none');
    dom.resetButton?.classList.add('display-inline-block');
    setText(dom.turn, "Karsilasma sonuclandi!");
}

function resetArena() {
    clearBattleEffects();
    resetGameState(state, karakterler);
    gameStarted = false;
    readyState = { 1: false, 2: false };
    lastAnnouncedTurn = null;
    resetTeamSlots();

    updatePowerDisplay(1, 0);
    updatePowerDisplay(2, 0);
    updatePassDisplays();
    updateTurnDisplay();
    updateReadyDisplays();
    setHtml(dom.result, "Murettebatlar karsi karsiya gelmek icin emir bekliyor...");

    updateActionAvailability();
    dom.resetButton?.classList.replace('display-inline-block', 'display-none');
    renderWheel();
}

function renderWheel() {
    drawWheel({
        canvas: dom.canvas,
        ctx,
        characters: state.activeCharacters,
        colors: anaRenkler
    });
}

function updateTurnDisplay() {
    setText(dom.turn, `Sira: ${state.activePlayer}. Oyuncu`);
    updateTurnAura();

    if (gameStarted && state.activePlayer === state.myPlayerNumber && lastAnnouncedTurn !== state.activePlayer) {
        showTurnToast();
    }

    lastAnnouncedTurn = state.activePlayer;
}

function updatePassDisplays(previousPassCount = null) {
    const passCount = state.passRights[state.activePlayer] ?? 0;
    setText(dom.rerollCount, passCount);
    setText(dom.rerollButtonCount, passCount);
    renderRerollTokens(passCount, previousPassCount);
}

function isMyTurn() {
    return state.activePlayer === state.myPlayerNumber;
}

function toggleReady() {
    if (!socket || !state.myPlayerNumber || gameStarted) return;
    socket.emit('setReady', !readyState[state.myPlayerNumber]);
}

function updateReadyDisplays() {
    [1, 2].forEach(playerNumber => {
        const status = dom.readyStatus[playerNumber];
        if (!status) return;

        status.textContent = readyState[playerNumber] ? "Ready" : "Not Ready";
        status.classList.toggle('is-ready', readyState[playerNumber]);
    });

    if (dom.readyButton) {
        const myReady = Boolean(readyState[state.myPlayerNumber]);
        dom.readyButton.textContent = gameStarted ? "Draft Started" : (myReady ? "Cancel Ready" : "Ready");
        dom.readyButton.classList.toggle('is-ready', myReady);
        dom.readyButton.disabled = gameStarted || !state.myPlayerNumber;
    }

    if (!gameStarted) {
        setDisabled([dom.spinButton, dom.startBattleButton], true);
    }
}

function updateActionAvailability() {
    if (!gameStarted) {
        setDisabled([dom.spinButton, dom.startBattleButton], true);
        return;
    }

    dom.spinButton.disabled = !isMyTurn() || state.activePlayer === 0;
    dom.startBattleButton.disabled = countEmptySlots() > 0;
}

function updateTurnAura() {
    [1, 2].forEach(playerNumber => {
        dom.teamBoxes[playerNumber]?.classList.toggle(
            'active-turn-aura',
            gameStarted && state.activePlayer === playerNumber
        );
    });
}

function showTurnToast() {
    if (!dom.turnToast) return;

    window.clearTimeout(turnToastTimer);
    dom.turnToast.classList.remove('show');
    void dom.turnToast.offsetWidth;
    dom.turnToast.classList.add('show');

    turnToastTimer = window.setTimeout(() => {
        dom.turnToast.classList.remove('show');
    }, 1800);
}

function renderRerollTokens(passCount, previousPassCount) {
    if (!dom.rerollTokens) return;

    if (dom.rerollTokens.children.length === 0) {
        for (let index = 0; index < 5; index++) {
            const token = document.createElement('span');
            token.className = 'reroll-token';
            token.textContent = '฿';
            dom.rerollTokens.appendChild(token);
        }
    }

    Array.from(dom.rerollTokens.children).forEach((token, index) => {
        const isActive = index < passCount;
        const wasSpentNow = previousPassCount !== null && index === passCount && previousPassCount > passCount;

        token.classList.toggle('spent', !isActive);
        token.classList.remove('burst');

        if (wasSpentNow) {
            void token.offsetWidth;
            token.classList.add('burst');
        }
    });
}

function bindAudioMixer() {
    const settings = getAudioSettings();

    if (dom.masterVolume) dom.masterVolume.value = Math.round(settings.master * 100);
    if (dom.musicVolume) dom.musicVolume.value = Math.round(settings.music * 100);
    if (dom.effectsVolume) dom.effectsVolume.value = Math.round(settings.effects * 100);
    if (dom.muteAll) dom.muteAll.checked = settings.muted;

    dom.settingsToggle?.addEventListener('click', event => {
        event.stopPropagation();
        dom.settingsPanel?.classList.toggle('display-none');
    });

    document.addEventListener('click', event => {
        if (!dom.settingsPanel || dom.settingsPanel.classList.contains('display-none')) return;
        if (dom.settingsPanel.contains(event.target) || dom.settingsToggle?.contains(event.target)) return;
        dom.settingsPanel.classList.add('display-none');
    });

    [dom.masterVolume, dom.musicVolume, dom.effectsVolume].filter(Boolean).forEach(input => {
        input.addEventListener('input', updateMixerFromInputs);
    });

    dom.muteAll?.addEventListener('change', updateMixerFromInputs);
}

function updateMixerFromInputs() {
    updateAudioSettings({
        master: Number(dom.masterVolume?.value ?? 80) / 100,
        music: Number(dom.musicVolume?.value ?? 75) / 100,
        effects: Number(dom.effectsVolume?.value ?? 85) / 100,
        muted: Boolean(dom.muteAll?.checked)
    });
}

function renderStampPanel() {
    if (!dom.stampPanel) return;

    const stamps = ['😀', '😂', '😭', '😎', '❤️', '👍', '👎', '🏴‍☠️', '⚓', '☠️', '⚔️', '🔥', '🍖', '👒'];
    dom.stampPanel.innerHTML = '';

    stamps.forEach(stamp => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'stamp-btn';
        button.textContent = stamp;
        button.setAttribute('aria-label', `Stamp ${stamp}`);
        button.addEventListener('click', () => sendStamp(stamp));
        dom.stampPanel.appendChild(button);
    });
}

function sendStamp(stamp) {
    const now = Date.now();
    if (!socket || now - lastStampSentAt < 1200) return;

    lastStampSentAt = now;
    socket.emit('sendStamp', stamp);
}

function showStamp(data) {
    if (!dom.stampStage || !data?.stamp) return;

    const stamp = document.createElement('div');
    stamp.className = `floating-stamp player-${data.player === 2 ? 2 : 1}`;
    stamp.textContent = data.stamp;
    dom.stampStage.appendChild(stamp);

    window.setTimeout(() => stamp.remove(), 2800);
}
