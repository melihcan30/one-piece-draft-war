import { karakterler, anaRenkler } from './karakterler.js';
import { runGauntletBattle, runMatchupBattle, runSynergyBattle } from './savasMotoru.js';
import { getAudioSettings, sesCal, sesDurdur, updateAudioSettings } from './sesMotoru.js';
import { triggerHakiLightning, triggerWinnerConfetti } from './efektler.js';
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
    
    // 🌟 ÇÖZÜM: Veri isim uyuşmazlığını engellemek için parametreleri çift varyasyonlu gönderiyoruz
    socket.emit('joinRoom', {
        room: currentRoomName,
        roomName: currentRoomName, 
        username: savedName,
        playerName: savedName, 
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

// 1. GÜNCELLEME: setupSocketListeners içine 'gameStarted' eventi eklendi ve 'autoPassed' güncellendi.
function setupSocketListeners() {
    socket.on('playerAssignment', data => {
        state.myPlayerNumber = data.player;
        console.log(`Rolun: ${data.color} - Oyuncu Numaran: ${state.myPlayerNumber}`);
        updateReadyDisplays();
        updateActionAvailability();
    });

    socket.on('startModeSelection', (data) => {
        const modal = document.getElementById('mode-selection-modal');
        if (modal) {
            modal.classList.remove('display-none');
            modal.classList.add('display-flex');
        }
        
        const textEl = document.getElementById('mode-selector-text');
        const btns = document.querySelectorAll('.mode-btn');
        const myId = state.myPlayerNumber; 

        btns.forEach(btn => {
            const modeName = btn.getAttribute('data-mode');
            const isPlayed = data.playedModes.includes(modeName);
        
            if (isPlayed) {
                btn.disabled = true;
                btn.setAttribute('disabled', 'true');
                btn.classList.add('disabled-mode'); // CSS'e kilitli olduğunu bildiriyoruz
            } else {
                btn.disabled = false;
                btn.removeAttribute('disabled');
                btn.classList.remove('disabled-mode');
            }
        });

        if (data.selector === myId) {
            if (textEl) textEl.textContent = "⚔️ Sıra Sende! Mürettebatın için bir Savaş Modu seç:";
            btns.forEach(btn => {
                btn.onclick = () => {
                    if (!btn.disabled) {
                        const selectedMode = btn.getAttribute('data-mode');
                        socket.emit('selectMode', selectedMode);
                    }
                };
            });
        } else {
            if (textEl) textEl.textContent = "🏴‍☠️ Rakibinin Savaş Modu seçmesi bekleniyor, hazırlıklı ol...";
            btns.forEach(btn => btn.onclick = null); 
        }
    });

    // 🌟 ÇÖZÜM 2: Savaş modunun değiştiğini main.js'e öğretiyoruz
    socket.on('modeSelected', (modeName) => {
        const modeDisplay = document.getElementById('active-mode-display');
        const modal = document.getElementById('mode-selection-modal');
        
        // 🚨 KRİTİK NOKTA: Savaş hesaplamalarında eski modun kullanılmaması için
        // istemcideki mevcut mod değişkenini burada GÜNCELLEMELİSİN.
        // Eğer değişkenin adı farklıysa (örneğin activeMode vb.) burayı ona göre değiştir:
        state.currentMode = modeName; 
        
        if (modeDisplay) modeDisplay.textContent = `AKTİF MOD: ${modeName.toUpperCase()}`;
        if (modal) {
            modal.classList.remove('display-flex');
            modal.classList.add('display-none');
        }
    });

    // 🌟 YENİ EKLENDİ: Oyun (veya 2. raunt) başladığında tetiklenir, çarkı yükler.
    socket.on('gameStarted', (data) => {
        gameStarted = true;
        if (state.myPlayerNumber === 1) {
            socket.emit('syncInitialCharacters', karakterler);
        }
        updateTurnDisplay();
        updateActionAvailability();
    });

    socket.on('timerStarted', (time) => {
        const timerEl = document.getElementById('draft-timer');
        if (timerEl) {
            timerEl.textContent = time;
            timerEl.classList.remove('warning');
        }
    });

    socket.on('timerUpdate', (time) => {
        const timerEl = document.getElementById('draft-timer');
        if (timerEl) {
            timerEl.textContent = time;
            if (time <= 5) timerEl.classList.add('warning'); 
        }
    });

    // 🌟 SUNUCUDAN GELEN DRAFT ESNASINDAKİ HAKİ SİNYALİNİ DİNLE
    socket.on('draftHakiClash', () => {
        triggerHakiLightning(); 
    });

    socket.on('autoPassed', (data) => {
        const characterModal = document.getElementById("character-modal");
        if (characterModal && !characterModal.classList.contains('display-none')) {
            characterModal.classList.replace('display-flex', 'display-none');
        }
        
        state.activePlayer = data.aktifOyuncu; 
        if (dom.turn) dom.turn.textContent = `Sıra: ${state.activePlayer}. Oyuncu`;
        if (dom.spinButton) dom.spinButton.disabled = state.activePlayer !== state.myPlayerNumber;
        updatePassDisplays(); // 🌟 ÇÖZÜM: Süre bitince pas hakkı göstergesi güncellensin!
    });

    socket.on('updateScores', (data) => {
        // Hem eski hem yeni id ihtimallerine karşı güvenli seçim
        const p1Score = document.getElementById('p1-match-score') || document.getElementById('p1-score');
        const p2Score = document.getElementById('p2-match-score') || document.getElementById('p2-score');
    
        if (p1Score) p1Score.textContent = data.matchScore.p1;
        if (p2Score) p2Score.textContent = data.matchScore.p2;
    
        updateRoundDots('p1-round-dots', data.roundScore.p1);
        updateRoundDots('p2-round-dots', data.roundScore.p2);
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
    // 🌟 ÇÖZÜM: playerAssignment tetiklenmeme ihtimaline karşı socket id üzerinden rol atamasını güvenceye alıyoruz
    if (!state.myPlayerNumber && data.players) {
        if (data.players.player1 === socket.id) state.myPlayerNumber = 1;
        else if (data.players.player2 === socket.id) state.myPlayerNumber = 2;
    }

    readyState = {
        1: Boolean(data.ready?.[1]),
        2: Boolean(data.ready?.[2])
    };

    setPlayerCard(1, data.p1Data);
    setPlayerCard(2, data.p2Data);
    updateReadyDisplays();

    // 🌟 ÇÖZÜM: Sunucudan gelen oyun verilerini (Tur, Pas hakkı, Takımlar) anlık senkronize ediyoruz
    if (data.gameState) {
        gameStarted = Boolean(data.gameState.oyunBasladi);
        state.activePlayer = data.gameState.aktifOyuncu || 1;
        state.passRights[1] = data.gameState.p1PasHakki ?? state.passRights[1];
        state.passRights[2] = data.gameState.p2PasHakki ?? state.passRights[2];
        
        if (data.gameState.aktifKarakterler) {
            state.activeCharacters = data.gameState.aktifKarakterler;
        }
        hydrateTeamsFromServer(data.gameState);
    }

    if (data.matchState) {
        if (data.matchState.status === 'DRAFTING') {
            gameStarted = true;
        }
        const p1Score = document.getElementById('p1-match-score') || document.getElementById('p1-score');
        const p2Score = document.getElementById('p2-match-score') || document.getElementById('p2-score');
        if (p1Score) p1Score.textContent = data.matchState.p1MatchScore;
        if (p2Score) p2Score.textContent = data.matchState.p2MatchScore;
    }
    
    updateRoundDots('p1-round-dots', data.matchState.p1RoundWins);
    updateRoundDots('p2-round-dots', data.matchState.p2RoundWins);
}

    updateTurnDisplay();
    updatePassDisplays();
    updateActionAvailability();

    if (!gameStarted && readyState[1] && readyState[2]) {
        setText(dom.result, "İki tayfa da hazır. Savaş modunun seçilmesi bekleniyor...");
        if (state.myPlayerNumber === 1) {
            socket.emit('syncInitialCharacters', karakterler);
        }
    }


function setPlayerCard(playerNumber, playerData) {
    // Sunucu taraflı name veya username parametrelerinin ikisini de kontrol altına alıyoruz
    const name = playerData?.username || playerData?.name || `Korsan ${playerNumber} Bekleniyor...`;
    setText(byId(`p${playerNumber}-name-display`), name);
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

    // Takımların doluluğuna bağlı olarak Savaş butonunu otomatik kontrol et
    finishDraftIfTeamsAreFull();
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
    return team.reduce((sum, char) => sum + (char ? char.guc : 0), 0);
}

function bindGameControls() {
    dom.spinButton?.addEventListener("click", requestSpin);
    dom.modalPassButton?.addEventListener("click", requestPass);
    dom.modalAcceptButton?.addEventListener("click", requestAccept);
    dom.startBattleButton?.addEventListener("click", requestBattleAction);
    dom.resetButton?.addEventListener("click", () => socket.emit('requestReset'));
    
    dom.readyButton?.addEventListener("click", () => {
        const myNum = state.myPlayerNumber;
        if (!myNum) return;
        const currentReadyState = !readyState[myNum];
        socket.emit('setReady', currentReadyState);
    });
}

function requestSpin() {
    if (!isMyTurn()) {
        alert("Sira sende degil Kaptan!");
        return;
    }
    setDisabled([dom.spinButton], true);
    socket.emit('requestSpin');
}

function runSpinAnimation(data) {
    setDisabled([dom.spinButton, dom.startBattleButton], true);
    sesCal('spin');
    document.querySelector(".wheel-pointer")?.classList.add("pointer-spinning");
    
    state.currentRotation = (state.currentRotation || 0) + 1800 + data.randomDegree;
    dom.canvas.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
    dom.canvas.style.transform = `rotate(${state.currentRotation}deg)`;
    
    setTimeout(() => {
        handleSpinFinished();
    }, 4000);
}

function handleSpinFinished() {
    sesDurdur('spin');
    document.querySelector(".wheel-pointer")?.classList.remove("pointer-spinning");
    sesCal('select');
    state.selectedCharacter = getWinningCharacter(state.activeCharacters, state.currentRotation);
    if (!state.selectedCharacter) return;
    
    setHtml(dom.result, `🎯 Savasci: <b>${state.selectedCharacter.isim}</b><br><span style="color:#f1c40f;">Odul: ${formatBeri(state.selectedCharacter.guc)}</span>`);
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

    state.passRights[state.activePlayer]--;
    updatePassDisplays();
    //hideFromFlex(dom.characterModal);
    socket.emit('requestPass');
}

// 3. GÜNCELLEME: Pas geçilince otomatik çark döner
function runPassAction() {
    hideFromFlex(dom.characterModal);
    state.selectedCharacter = null;
    if (dom.spinButton) dom.spinButton.disabled = !isMyTurn();
    updateActionAvailability();
    
    // 🌟 ÇÖZÜM: Eğer pas geçen ben isem, bekletmeden çarkı tekrar çevir (Eski haline döndü)
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
    socket.emit('requestAccept', { slotIndex, charId: state.selectedCharacter.id });
}

function runAcceptAction(data) {
    hideFromFlex(dom.characterModal);
    state.selectedCharacter = null;
    moveTurnToNextPlayer();
    updateActionAvailability();
}

function finishDraftIfTeamsAreFull() {
    const p1FullCount = state.teams[1].filter(char => char !== null).length;
    const p2FullCount = state.teams[2].filter(char => char !== null).length;

    if (p1FullCount === 5 && p2FullCount === 5) {
        setText(dom.turn, "Draft Tamamlandı! Savaş Başlıyor!");
        setDisabled([dom.spinButton], true); 
        
        if (state.myPlayerNumber === 1) {
            dom.startBattleButton.disabled = false;
            dom.startBattleButton.classList.remove('display-none');
        }
        
        state.activePlayer = 0;
        updateTurnAura();
        return true;
    }
    return false;
}

// 4. GÜNCELLEME: Karakter kabul edildiğinde sıra karşıya geçerse Pas hakkı UI da güncellensin
function moveTurnToNextPlayer() {
    state.activePlayer = state.activePlayer === 1 ? 2 : 1;
    updateTurnDisplay();
    updatePassDisplays(); // 🌟 ÇÖZÜM: Sıra geçtiği an jetonlar da yeni kişiye göre değişsin!
}

function isMyTurn() {
    return gameStarted && state.activePlayer === state.myPlayerNumber;
}

function updateTurnAura() {
    [1, 2].forEach(playerNumber => {
        const teamBox = dom.teamBoxes[playerNumber];
        if (teamBox) {
            teamBox.classList.toggle('active-turn-aura', gameStarted && state.activePlayer === playerNumber);
        }
    });
}

function updateTurnDisplay() {
    if (!gameStarted) {
        setText(dom.turn, "Savaşın başlaması için hazır olun!");
        updateTurnAura(); 
        return;
    }
    
    setText(dom.turn, `Sıra: ${state.activePlayer}. Oyuncu (${state.activePlayer === 1 ? 'Kırmızı' : 'Mavi'})`);
    updateTurnAura(); 
    
    if (state.activePlayer !== lastAnnouncedTurn) {
        lastAnnouncedTurn = state.activePlayer;
        triggerTurnToast();
    }
}

function triggerTurnToast() {
    if (!dom.turnToast) return;
    window.clearTimeout(turnToastTimer);
    setText(dom.turnToast, isMyTurn() ? "⚔️ SIRA SENDE KAPTAN! ⚔️" : "🏴‍☠️ RAKİBİN HAMLESİ BEKLENİYOR... 🏴‍☠️");
    dom.turnToast.classList.remove('show');
    void dom.turnToast.offsetWidth;
    dom.turnToast.classList.add('show');
    turnToastTimer = window.setTimeout(() => {
        dom.turnToast.classList.remove('show');
    }, 1800);
}

function updatePassDisplays() {
    const activePlayer = state.activePlayer || 1;
    const activePassCount = state.passRights[activePlayer];
    
    // Animasyon takibi için hafıza alanı oluşturuyoruz
    if (!state.lastRenderedPassCount) {
        state.lastRenderedPassCount = {};
    }
    const previousPassCount = state.lastRenderedPassCount[activePlayer] ?? activePassCount;
    
    renderRerollTokens(activePassCount, previousPassCount);
    
    // Bir sonraki tık durumu için mevcut hakkı hafızaya al
    state.lastRenderedPassCount[activePlayer] = activePassCount;
    
    setText(dom.rerollCount, `Pas Haklari - P1: ${state.passRights[1]} | P2: ${state.passRights[2]}`);
}

function renderRerollTokens(passCount, previousPassCount) {
    if (!dom.rerollTokens) return;
    
    // Eğer jetonlar DOM'da henüz yoksa altın sarısı daireleri oluştur
    if (dom.rerollTokens.children.length === 0) {
        dom.rerollTokens.innerHTML = '';
        for (let index = 0; index < 5; index++) {
            const token = document.createElement('span');
            token.className = 'token-dot'; // CSS ile tam uyumlu sınıf ismi
            dom.rerollTokens.appendChild(token);
        }
    }
    
    Array.from(dom.rerollTokens.children).forEach((token, index) => {
        const isActive = index < passCount;
        const wasSpentNow = index === passCount && previousPassCount > passCount;
        
        // Hakkı gitmişse .used sınıfı eklenir (CSS otomatik animasyonu oynatır)
        if (!isActive) {
            token.classList.add('used');
        } else {
            token.classList.remove('used');
        }
        
        // Eğer tam şu an harcandıysa animasyonun sıfırlanıp baştan oynamasını tetikle
        if (wasSpentNow) {
            void token.offsetWidth; 
        }
    });
}

function bindAudioMixer() {
    const settings = getAudioSettings();
    if (dom.masterVolume) dom.masterVolume.value = Math.round(settings.master * 100);
    if (dom.musicVolume) dom.musicVolume.value = Math.round(settings.music * 100);
    if (dom.effectsVolume) dom.effectsVolume.value = Math.round(settings.effects * 100);
    if (dom.muteAll) dom.muteAll.checked = settings.muted;

    [dom.masterVolume, dom.musicVolume, dom.effectsVolume, dom.muteAll].forEach(element => {
        element?.addEventListener('input', applyAudioSettingsFromDOM);
        element?.addEventListener('change', applyAudioSettingsFromDOM);
    });
}

function applyAudioSettingsFromDOM() {
    updateAudioSettings({
        master: Number(dom.masterVolume?.value ?? 85) / 100,
        music: Number(dom.musicVolume?.value ?? 50) / 100,
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
    stamp.className = 'floating-emoji'; // CSS'teki kocaman uçan emoji sınıfı
    stamp.textContent = data.stamp;
    
    // Emoji hangi oyuncudan geldiyse ekranın o tarafına konumlandırıyoruz
    if (data.player === 1) {
        stamp.style.left = '15%'; // Sol oyuncunun takımı üstünde
    } else {
        stamp.style.right = '15%'; // Sağ oyuncunun takımı üstünde
    }
    stamp.style.bottom = '25%'; // Ekranın alt-orta kısmından süzülmeye başlasın
    
    dom.stampStage.appendChild(stamp);
    setTimeout(() => stamp.remove(), 2500);
}

function updateReadyDisplays() {
    const myNum = state.myPlayerNumber;
    if (myNum) {
        setText(dom.readyButton, readyState[myNum] ? "HAZIRLIK İPTAL ❌" : "YOLCULUĞA HAZIRIM ⚔️");
        dom.readyButton.style.backgroundColor = readyState[myNum] ? "#c0392b" : "#27ae60";
    }
    
    if (dom.readyStatus[1]) dom.readyStatus[1].textContent = readyState[1] ? "HAZIR" : "BEKLENİYOR";
    if (dom.readyStatus[2]) dom.readyStatus[2].textContent = readyState[2] ? "HAZIR" : "BEKLENİYOR";

    // 🌟 ÇÖZÜM 3: Oyun (Draft) başlamışsa Hazır butonunu tamamen GİZLE, kafaları karıştırmasın!
    if (gameStarted) {
        dom.readyButton.classList.add('display-none');
    } else {
        dom.readyButton.classList.remove('display-none');
    }
}

function updateActionAvailability() {
    const myTurn = isMyTurn();
    setDisabled([dom.spinButton], !myTurn);
    if (dom.modalPassButton) dom.modalPassButton.disabled = !myTurn;
    if (dom.modalAcceptButton) dom.modalAcceptButton.disabled = !myTurn;
}

function requestBattleAction() {
    if (state.myPlayerNumber !== 1) return;
    
    // 🌟 ÇÖZÜM: dom.modeSelect yerine artık yeni state.currentMode'u kullanıyoruz!
    const battleMode = state.currentMode || "gauntlet"; 
    
    const tempResult = document.createElement("div");
    
    if (battleMode === "gauntlet") {
        runGauntletBattle(state.teams[1], state.teams[2], dom.turn, tempResult);
    } else if (battleMode === "matchup") {
        runMatchupBattle(state.teams[1], state.teams[2], dom.turn, tempResult);
    } else if (battleMode === "synergy") {
        runSynergyBattle(state.teams[1], state.teams[2], dom.turn, tempResult);
    }
    
    const finalHtml = tempResult.innerHTML;
    socket.emit('requestBattle', { html: finalHtml, kazanan: detectWinnerFromBattleHtml(finalHtml), senderId: socket.id });
}

function detectWinnerFromBattleHtml(html) {
    if (html.includes('data-winner="1"')) return 1;
    if (html.includes('data-winner="2"')) return 2;
    if (html.includes('data-winner="0"')) return 0;
    
    // Eğer diğer modlardan (Gauntlet vb.) eski tarz metin gelirse diye yedek (fallback)
    if (html.includes("1. Oyuncu Kazandı")) return 1;
    if (html.includes("2. Oyuncu Kazandı")) return 2;
    
    return 0;
}

function openBattlePopup(data) {
    setDisabled([dom.spinButton, dom.startBattleButton], true);
    clearBattleEffects();
    battlePopup = { lines: parseBattleLines(data.html), currentIndex: 0, winnerId: data.kazanan };
    createCombatPopup(() => socket.emit('requestNextLogStep'));
    renderNextBattleLine();
}

function renderNextBattleLine() {
    if (battlePopup.currentIndex < battlePopup.lines.length) {
        const line = battlePopup.lines[battlePopup.currentIndex];
        battlePopup.currentIndex++;
        
        // SADECE HAKİ KONTROLÜ: Tam o satır ekrana yazılırken haki varsa efekti patlat!
        if (line.includes('haki-clash')) {
            triggerHakiLightning();
        }
        
        appendBattleLine(line, battlePopup.currentIndex === battlePopup.lines.length);
        return;
    }
    
    document.getElementById('combat-popup-modal')?.remove();
    showVictoryEffects(battlePopup.winnerId); // Senin mevcut zafer efektin
    
    setText(dom.turn, "Karşılaşma sonuçlandı!");
    
    if (state.myPlayerNumber === 1) {
        setTimeout(() => {
            socket.emit('roundFinished', { kazananId: battlePopup.winnerId });
        }, 4000); 
    }
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
    gameStrated = false;
    updateReadyDisplays();
}

function renderWheel() {
    drawWheel({ canvas: dom.canvas, ctx, characters: state.activeCharacters, colors: anaRenkler });
}

function updateRoundDots(containerId, winCount) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const dots = container.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        // Eski 'won' sınıfı yerine CSS'e yön veren 'filled' sınıfını kullanıyoruz
        if (index < winCount) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

// 🌟 ÇÖZÜM 3: Maçın tamamen bittiğini duyuran yeni Event
    socket.on('matchFinished', (data) => {
        const winner = data.winnerId;
        
        // Ekrana büyük bir zafer uyarısı bas (kendi tasarımına göre bir modal da açtırabilirsin)
        alert(`🏆 BÜYÜK ZAFER! OYUNCU ${winner} TÜM OYUNU KAZANDI! 🏆`);
        
        // Oyun bittiği için kontrolleri kilitle
        gameStarted = false;
        if (dom.spinButton) dom.spinButton.disabled = true;
        if (dom.readyButton) dom.readyButton.classList.add('display-none');
    });