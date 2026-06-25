// 1️⃣ ADIM: Import Satırları
import { karakterler, anaRenkler } from './karakterler.js';
import { runGauntletBattle, runMatchupBattle, runSynergyBattle } from './savasMotoru.js';
import { sesCal, sesDurdur } from './sesMotoru.js';
import { triggerHakiLightning, triggerWinnerConfetti } from './efektler.js';

// 2️⃣ ADIM: HTML DOM Elementleri
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin-btn");
const resultDisplay = document.getElementById("result-display");
const rerollCountDisplay = document.getElementById("reroll-count");

const turnDisplay = document.getElementById("turn-display");
const modeSelect = document.getElementById("mode-select");
const startBattleBtn = document.getElementById("start-battle-btn");
const resetBtn = document.getElementById("reset-btn");

// WANTED POSTER POP-UP ELEMENTLERİ
const characterModal = document.getElementById("character-modal");
const modalCharName = document.getElementById("modal-char-name");
const modalCharBounty = document.getElementById("modal-char-bounty");
const modalRoleSelect = document.getElementById("modal-role-select");
const modalAcceptBtn = document.getElementById("modal-accept-btn");
const modalPassBtn = document.getElementById("modal-pass-btn");

// LOBİ ELEMENTLERİ
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const roomInput = document.getElementById('room-input');

// 3️⃣ ADIM: Global Oyun Değişkenleri
let aktifKarakterler = [];
let currentRotation = 0;
let secilenKarakter = null;
let p1PasHakki = 5;
let p2PasHakki = 5;
let aktifOyuncu = 1;
let p1ToplamGuc = 0;
let p2ToplamGuc = 0;

let p1TakimKarakterleri = new Array(5).fill(null);
let p2TakimKarakterleri = new Array(5).fill(null);

let myPlayerNumber = null;
let socket; // Global soket referansı
let secilenAvatar = "🍖"; // Varsayılan avatar

// 🌟 CANLI SAVAŞ ANIMASYONU İÇİN ZAMANLAYICI REFERANSI
let combatInterval = null;

// Avatar seçme mekaniği tık dinleyicisi
document.querySelectorAll('.avatar-item').forEach(item => {
    item.addEventListener('click', (e) => {
        document.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        secilenAvatar = item.getAttribute('data-avatar');
    });
});

// 🌍 URL Kontrol ve Ekran Ayrıştırma Yönetimi
const urlParams = new URLSearchParams(window.location.search);
let roomName = urlParams.get('room');

if (!roomName) {
    // URL'de oda yoksa Lobi Ekranını Aktif Et
    if (lobbyScreen) lobbyScreen.classList.replace('display-none', 'display-block');
    if (gameScreen) gameScreen.classList.replace('display-block', 'display-none');

    // Yeni Oda Oluşturma Butonu Dinleyicisi
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            const usernameVal = document.getElementById('username-input').value.trim();
            sessionStorage.setItem('korsanAdi', usernameVal || 'Kaptan');
            sessionStorage.setItem('korsanAvatar', secilenAvatar);

            const randomRoom = "Room-" + Math.floor(1000 + Math.random() * 9000);
            urlParams.set('room', randomRoom);
            window.location.search = urlParams.toString();
        });
    }

    // Var Olan Odaya Katılma Dinleyicisi
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            const usernameVal = document.getElementById('username-input').value.trim();
            sessionStorage.setItem('korsanAdi', usernameVal || 'Kaptan');
            sessionStorage.setItem('korsanAvatar', secilenAvatar);

            const girilenOda = roomInput.value.trim();
            if (girilenOda) {
                urlParams.set('room', girilenOda);
                window.location.search = urlParams.toString();
            } else {
                alert("Lütfen geçerli bir oda kodu girin Kaptan!");
            }
        });
    }
} else {
    // Oda Kodu Varsa Oyunu Başlat
    if (lobbyScreen) lobbyScreen.classList.replace('display-block', 'display-none');
    if (gameScreen) gameScreen.classList.replace('display-none', 'display-block');

    const kayitliAd = sessionStorage.getItem('korsanAdi') || 'Kaptan';
    const kayitliAvatar = sessionStorage.getItem('korsanAvatar') || '🍖';

    const uInput = document.getElementById('username-input');
    if (uInput) uInput.value = kayitliAd;
    secilenAvatar = kayitliAvatar;

    // Arayüzdeki aktif bayrağı güncelle
    document.querySelectorAll('.avatar-item').forEach(item => {
        if (item.getAttribute('data-avatar') === secilenAvatar) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const roomCodeDisplay = document.getElementById('room-code-display');
    const copyBtn = document.getElementById('copy-btn');

    if (roomCodeDisplay) {
        roomCodeDisplay.innerText = roomName;
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(roomName)
                .then(() => {
                    copyBtn.innerText = 'Kopyalandı! ✓';
                    copyBtn.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        copyBtn.innerText = 'Kopyala';
                        copyBtn.style.backgroundColor = '#007bff';
                    }, 2000);
                })
                .catch(err => console.error('Kod kopyalanamadı: ', err));
        });
    }

    socket = io();

    socket.emit('joinRoom', {
        room: roomName,
        username: kayitliAd,
        avatar: secilenAvatar
    });
    console.log(`⚓ Bağlanılan Oda: ${roomName}`);

    setupSocketListeners();
}

// 5️⃣ ADIM: Soket İstasyon Dinleyicileri Fonksiyonu
function setupSocketListeners() {
    socket.on('playerAssignment', (data) => {
        myPlayerNumber = data.player;
        console.log(`Rolün: ${data.color} - Oyuncu Numaran: ${myPlayerNumber}`);
    });

    socket.on('roomStatus', (data) => {
        if (data.p1Data) {
            document.getElementById('p1-name-display').innerText = data.p1Data.username;
            document.getElementById('p1-avatar-display').innerText = data.p1Data.avatar;
        } else {
            document.getElementById('p1-name-display').innerText = "Korsan 1 Bekleniyor...";
            document.getElementById('p1-avatar-display').innerText = "🏴‍☠️";
        }

        if (data.p2Data) {
            document.getElementById('p2-name-display').innerText = data.p2Data.username;
            document.getElementById('p2-avatar-display').innerText = data.p2Data.avatar;
        } else {
            document.getElementById('p2-name-display').innerText = "Korsan 2 Bekleniyor...";
            document.getElementById('p2-avatar-display').innerText = "🏴‍☠️";
        }
    });

    socket.on('initGameState', (serverState) => {
        console.log("⚓ Sunucudan gelen oyun durumu alındı:", serverState);
        if (serverState.oyunBasladi && serverState.aktifKarakterler && serverState.aktifKarakterler.length > 0) {
            aktifKarakterler = serverState.aktifKarakterler;
        } else {
            aktifKarakterler = [...karakterler];
            socket.emit('syncInitialCharacters', karakterler);
        }

        aktifOyuncu = serverState.aktifOyuncu || 1;
        if (turnDisplay) turnDisplay.textContent = `Sıra: ${aktifOyuncu}. Oyuncu`;

        drawWheel();
    });

    socket.on('runSpinAnimation', (data) => {
        spinBtn.disabled = true;
        startBattleBtn.disabled = true;
        resultDisplay.textContent = "🔮 Çark dönüyor, kader belirleniyor...";
        sesCal('spin', true);

        const pointer = document.querySelector(".wheel-pointer");
        if (pointer) pointer.classList.add("pointer-spinning");

        const extraSpins = 1800;
        currentRotation += extraSpins + data.randomDegree;
        canvas.style.transform = `rotate(${currentRotation}deg)`;
    });

    socket.on('runPassAction', () => {
        if (aktifOyuncu === 1) p1PasHakki--;
        else p2PasHakki--;

        let currentPas = aktifOyuncu === 1 ? p1PasHakki : p2PasHakki;
        if (rerollCountDisplay) rerollCountDisplay.textContent = currentPas;

        const btnCount = document.getElementById("reroll-count-btn");
        if (btnCount) btnCount.textContent = currentPas;

        if (characterModal) characterModal.classList.replace('display-flex', 'display-none');
        spinBtn.disabled = false;

        if (aktifOyuncu === myPlayerNumber) {
            socket.emit('requestSpin');
        }
    });

    socket.on('runAcceptAction', (data) => {
        if (data.charId && secilenKarakter) {
            aktifKarakterler = aktifKarakterler.filter(c => c.id !== data.charId);
        }
        if (!secilenKarakter) return;

        const selectedSlotIndex = data.slotIndex;
        const teamId = aktifOyuncu === 1 ? "p1-team" : "p2-team";
        const teamBox = document.getElementById(teamId);
        const slots = teamBox.querySelectorAll('.slot');
        const bosSlot = slots[selectedSlotIndex];

        if (bosSlot && bosSlot.getAttribute("data-filled") === "false") {
            bosSlot.setAttribute("data-filled", "true");
            const nameSpan = bosSlot.querySelector(".char-name");
            const wantedText = bosSlot.querySelector(".wanted-text");

            if (wantedText) {
                wantedText.textContent = secilenKarakter.taraf === "denizci" ? "CROSS GUILD" : "WANTED";
            }

            nameSpan.innerHTML = `${secilenKarakter.isim}<br><span style="color: #f39c12; font-size:0.85em; font-weight: bold;">${formatBeri(secilenKarakter.guc)}</span>`;

            if (aktifOyuncu === 1) {
                p1TakimKarakterleri[selectedSlotIndex] = { id: secilenKarakter.id, isim: secilenKarakter.isim, guc: secilenKarakter.guc, seviye: secilenKarakter.seviye };
                p1ToplamGuc += secilenKarakter.guc;
                document.getElementById("p1-power").textContent = formatBeri(p1ToplamGuc);
            } else {
                p2TakimKarakterleri[selectedSlotIndex] = { id: secilenKarakter.id, isim: secilenKarakter.isim, guc: secilenKarakter.guc, seviye: secilenKarakter.seviye };
                p2ToplamGuc += secilenKarakter.guc;
                document.getElementById("p2-power").textContent = formatBeri(p2ToplamGuc);
            }

            const index = aktifKarakterler.findIndex(c => c.id === secilenKarakter.id);
            if (index > -1) {
                aktifKarakterler.splice(index, 1);
            }
            drawWheel();

            const seciliMod = modeSelect ? modeSelect.value : "gauntlet";
            let hakiMesaji = "";

            if (seciliMod === "matchup" && p1TakimKarakterleri[selectedSlotIndex] !== null && p2TakimKarakterleri[selectedSlotIndex] !== null) {
                let p1Char = p1TakimKarakterleri[selectedSlotIndex];
                let p2Char = p2TakimKarakterleri[selectedSlotIndex];

                if (p1Char.seviye > 0 && p2Char.seviye > 0) {
                    let gucFarki = Math.abs(p1Char.seviye - p2Char.seviye);

                    if (gucFarki >= 15) {
                        let nextSlotIndex = selectedSlotIndex + 1;
                        if (nextSlotIndex < 5) {
                            if (p1Char.seviye > p2Char.seviye) {
                                if (p2TakimKarakterleri[nextSlotIndex] !== null) p2ToplamGuc -= p2TakimKarakterleri[nextSlotIndex].guc;
                                p2TakimKarakterleri[nextSlotIndex] = { isim: "⚠️ Haki Şokuyla Bayıldı", guc: 0, seviye: 0 };
                                const targetSlot = document.getElementById("p2-team").querySelectorAll('.slot')[nextSlotIndex];
                                targetSlot.setAttribute("data-filled", "true");
                                targetSlot.querySelector(".char-name").textContent = "⚠️ BAYGIN (0)";
                                if (targetSlot.querySelector(".wanted-text")) targetSlot.querySelector(".wanted-text").textContent = "BAYILDI";
                                document.getElementById("p2-power").textContent = formatBeri(p2ToplamGuc);
                                hakiMesaji = `<br><span style='color:#ff9f43; font-weight:bold;'>👑 KRALIN HAKİSİ PATLADI! 2. Oyuncunun sıradaki savaşçısı bayıldı!</span>`;
                                triggerHakiLightning();
                            } else {
                                if (p1TakimKarakterleri[nextSlotIndex] !== null) p1ToplamGuc -= p1TakimKarakterleri[nextSlotIndex].guc;
                                p1TakimKarakterleri[nextSlotIndex] = { isim: "⚠️ Haki Şokuyla Bayıldı", guc: 0, seviye: 0 };
                                const targetSlot = document.getElementById("p1-team").querySelectorAll('.slot')[nextSlotIndex];
                                targetSlot.setAttribute("data-filled", "true");
                                targetSlot.querySelector(".char-name").textContent = "⚠️ BAYGIN (0)";
                                if (targetSlot.querySelector(".wanted-text")) targetSlot.querySelector(".wanted-text").textContent = "BAYILDI";
                                document.getElementById("p1-power").textContent = formatBeri(p1ToplamGuc);
                                hakiMesaji = `<br><span style='color:#ff9f43; font-weight:bold;'>👑 KRALIN HAKİSİ PATLADI! 1. Oyuncunun sıradaki savaşçısı bayıldı!</span>`;
                                triggerHakiLightning();
                            }
                        }
                    }
                }
            }

            if (characterModal) characterModal.classList.replace('display-flex', 'display-none');

            const toplamBosSlotSayisi = document.querySelectorAll('.slot[data-filled="false"]').length;
            if (toplamBosSlotSayisi === 0) {
                spinBtn.disabled = true;
                startBattleBtn.disabled = false;
                resultDisplay.innerHTML = "📋 Tüm tayfalar kuruldu! Savaş butonuna tıklayarak simülasyonu başlatabilirsiniz.";

                if (aktifOyuncu === myPlayerNumber) {
                    socket.emit('syncActivePlayer', { previousPlayer: aktifOyuncu, nextPlayer: 0 });
                }
                aktifOyuncu = 0;
                return;
            }

            let sonrakiOyuncu = aktifOyuncu === 1 ? 2 : 1;
            if (!hasAvailableSlot(sonrakiOyuncu)) {
                sonrakiOyuncu = aktifOyuncu;
            }

            const eskiOyuncu = aktifOyuncu;
            aktifOyuncu = sonrakiOyuncu;

            if (eskiOyuncu === myPlayerNumber) {
                socket.emit('syncActivePlayer', { previousPlayer: eskiOyuncu, nextPlayer: aktifOyuncu });
            }

            turnDisplay.textContent = `Sıra: ${aktifOyuncu}. Oyuncu`;

            const guncelPasHakki = aktifOyuncu === 1 ? p1PasHakki : p2PasHakki;
            if (rerollCountDisplay) rerollCountDisplay.textContent = guncelPasHakki;

            const btnCount = document.getElementById("reroll-count-btn");
            if (btnCount) btnCount.textContent = guncelPasHakki;

            spinBtn.disabled = false;
            startBattleBtn.disabled = false;
            resultDisplay.innerHTML = `Mürettebat Güncellendi! Sıra ${aktifOyuncu}. Oyuncuda!${hakiMesaji}`;
            secilenKarakter = null;
        }
    });

    // =========================================================================
    // 🗂️ SAVAŞ POP-UP VE SENKRONİZASYON DEĞİŞKENLERİ
    // =========================================================================
    let popUpSafeLines = [];
    let popUpCurrentIndex = 0;
    let popUpWinnerId = 0;

    // ⚔️ 1. ADIM: SAVAŞ RAPORU ALINDIĞINDA POP-UP AÇMA ISTASYONU
    socket.on('runBattleResult', (data) => {
        // Ana butonları kilitle
        if (spinBtn) spinBtn.disabled = true;
        if (startBattleBtn) startBattleBtn.disabled = true;

        // Eski savaş kalıntılarını temizle
        document.getElementById("p1-team").classList.remove("battle-winner", "battle-loser");
        document.getElementById("p2-team").classList.remove("battle-winner", "battle-loser");
        document.querySelectorAll(".victory-overlay, .slash-effect, .combat-popup-overlay").forEach(el => el.remove());

        // Pop-up ve Animasyon CSS Stillerini Enjekte Et
        if (!document.getElementById('combat-popup-styles')) {
            const style = document.createElement('style');
            style.id = 'combat-popup-styles';
            style.innerHTML = `
            .combat-popup-overlay {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(5px);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeInFx 0.3s ease forwards;
            }
            .combat-popup-box {
                background: #1a1a2e;
                border: 3px solid #e67e22;
                border-radius: 12px;
                width: 90%;
                max-width: 650px;
                height: 70vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 30px rgba(230, 126, 34, 0.5);
                overflow: hidden;
            }
            .combat-popup-header {
                background: #161625;
                padding: 15px;
                text-align: center;
                font-family: 'Permanent Marker', cursive, sans-serif;
                font-size: 1.4em;
                color: #e67e22;
                border-bottom: 2px solid #222;
            }
            .combat-popup-log-area {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                font-family: 'Poppins', sans-serif;
                font-size: 1.05em;
                color: #fff;
                scroll-behavior: smooth;
            }
            .combat-popup-footer {
                padding: 15px;
                background: #161625;
                border-top: 2px solid #222;
            }
            .combat-popup-btn {
                background: #e67e22;
                color: #fff;
                border: 2px solid #d35400;
                width: 100%;
                padding: 12px;
                font-size: 1.1em;
                font-weight: bold;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .combat-popup-btn:hover { background: #d35400; }
            
            .combat-log-line {
                opacity: 0;
                transform: translateY(10px);
                animation: logPopInFx 0.25s ease forwards;
                margin-bottom: 12px;
                line-height: 1.6;
            }
            @keyframes logPopInFx { to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeInFx { from { opacity: 0; } to { opacity: 1; } }

            /* ANA EKRAN ANIME FX POSTERLERİ */
            .battle-winner { position: relative; animation: winnerGlowFx 1.5s infinite alternate; z-index: 5; }
            @keyframes winnerGlowFx {
                from { box-shadow: 0 0 15px rgba(46, 204, 113, 0.4); }
                to { box-shadow: 0 0 30px rgba(46, 204, 113, 0.8); }
            }
            .victory-overlay {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%) rotate(-12deg);
                font-family: 'Permanent Marker', cursive, sans-serif;
                font-size: 5rem; color: #2ecc71; letter-spacing: 3px;
                text-shadow: 0 0 20px rgba(0,0,0,0.9), 0 0 5px #fff;
                z-index: 99; pointer-events: none;
                animation: popInFx 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes popInFx {
                0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1) rotate(-12deg); opacity: 1; }
            }
            .battle-loser { position: relative; filter: brightness(0.3) grayscale(0.7); transition: filter 0.6s ease; }
            .slash-effect { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100; overflow: hidden; }
            .slash-line {
                position: absolute; top: 50%; left: -10%; width: 120%; height: 12px;
                background: linear-gradient(90deg, transparent, #e74c3c, #fff, #e74c3c, transparent);
                transform: translateY(-50%) rotate(-30deg); box-shadow: 0 0 20px #e74c3c;
                animation: slashFx 0.25s ease-out forwards;
            }
            @keyframes slashFx { 0% { width: 0%; left: 50%; opacity: 0; } 100% { width: 120%; left: -10%; opacity: 1; } }
        `;
            document.head.appendChild(style);
        }

        // Gelen HTML verisini parse et ve diziyi hazırla
        let rawLines = data.html.split('<br>');
        popUpSafeLines = [];
        let currentBlock = "";

        for (let line of rawLines) {
            let trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.includes('<div') && !trimmed.includes('</div>')) {
                currentBlock = trimmed;
            } else if (currentBlock !== "") {
                currentBlock += "<br>" + trimmed;
                if (trimmed.includes('</div>')) {
                    popUpSafeLines.push(currentBlock);
                    currentBlock = "";
                }
            } else {
                popUpSafeLines.push(trimmed);
            }
        }
        if (currentBlock) popUpSafeLines.push(currentBlock);

        // Global durumları eşitle
        popUpCurrentIndex = 0;
        popUpWinnerId = data.kazanan;

        // POP-UP HTML YAPISINI DİNAMİK OLUŞTUR
        const overlay = document.createElement('div');
        overlay.className = 'combat-popup-overlay';
        overlay.id = 'combat-popup-modal';

        overlay.innerHTML = `
        <div class="combat-popup-box">
            <div class="combat-popup-header">⚔️ CANLI SAVAŞ GÜNLÜĞÜ ⚔️</div>
            <div class="combat-popup-log-area" id="combat-popup-log-target"></div>
            <div class="combat-popup-footer">
                <button class="combat-popup-btn" id="combat-popup-continue-btn">Savaşa Devam Et ➔</button>
            </div>
        </div>
    `;
        document.body.appendChild(overlay);

        // Butona tıklandığında bireysel ilerleme YAPMA, sunucuya soket fırlat!
        document.getElementById('combat-popup-continue-btn').addEventListener('click', () => {
            socket.emit('requestNextLogStep');
        });

        // Sorun 1 Çözümü: İlk rauntun/sinerjinin anında görünmesi için ilk adımı otomatik tetikliyoruz
        renderNextLogLineLocally();
    });

    // ⚔️ 2. ADIM: SOKETTEN GELEN ORTAK EMİRLE LOGU İLERLETME ISTASYONU
    socket.on('runNextLogStep', () => {
        renderNextLogLineLocally();
    });

    // Lokalde satır çizdiren ve pop-up'ı kapatıp poster efektlerini açan yardımcı fonksiyon
    function renderNextLogLineLocally() {
        const logTarget = document.getElementById('combat-popup-log-target');
        const modalEl = document.getElementById('combat-popup-modal');
        if (!logTarget) return;

        if (popUpCurrentIndex < popUpSafeLines.length) {
            const lineData = popUpSafeLines[popUpCurrentIndex];

            const logItem = document.createElement('div');
            logItem.className = 'combat-log-line';
            logItem.innerHTML = lineData;

            logTarget.appendChild(logItem);

            // Otomatik aşağı kaydırma
            const logArea = document.getElementById('combat-popup-log-target');
            logArea.scrollTop = logArea.scrollHeight;

            popUpCurrentIndex++;

            // Eğer son satıra ulaşıldıysa yazıyı değiştiriyoruz
            if (popUpCurrentIndex === popUpSafeLines.length) {
                const btn = document.getElementById('combat-popup-continue-btn');
                if (btn) btn.innerText = 'Savaşı Bitir ve Arenaya Dön 🏁';
            }
        } else {
            // Log bitti! Pop-up modalını kaldır
            if (modalEl) modalEl.remove();

            // 🎬 ANA EKRANDA POSTER EFEKTLERİNİ AKTİF ET
            const p1Team = document.getElementById("p1-team");
            const p2Team = document.getElementById("p2-team");

            if (popUpWinnerId === 1) {
                p1Team.classList.add("battle-winner");
                p2Team.classList.add("battle-loser");

                const vic = document.createElement('div');
                vic.className = 'victory-overlay';
                vic.innerText = 'VICTORY';
                p1Team.appendChild(vic);

                const slash = document.createElement('div');
                slash.className = 'slash-effect';
                slash.innerHTML = '<div class="slash-line"></div>';
                p2Team.appendChild(slash);
            } else if (popUpWinnerId === 2) {
                p2Team.classList.add("battle-winner");
                p1Team.classList.add("battle-loser");

                const vic = document.createElement('div');
                vic.className = 'victory-overlay';
                vic.innerText = 'VICTORY';
                p2Team.appendChild(vic);

                const slash = document.createElement('div');
                slash.className = 'slash-effect';
                slash.innerHTML = '<div class="slash-line"></div>';
                p1Team.appendChild(slash);
            }

            // Sıfırla butonunu göster
            if (resetBtn) {
                resetBtn.classList.remove('display-none');
                resetBtn.classList.add('display-inline-block');
            }
            if (turnDisplay) turnDisplay.textContent = "⚔️ Karşılaşma Sonuçlandı!";
        }
    }

    // ⚔️ 3. ADIM: SIFIRLAMA İSTASYONU (POSTERLERİ VE POP-UP'LARI TAMAMEN TEMİZLER)
    socket.on('runResetAction', () => {
        // Açık kalmış olabilecek pencereleri uçur
        document.querySelectorAll(".victory-overlay, .slash-effect, .combat-popup-overlay").forEach(el => el.remove());
        document.getElementById("p1-team").classList.remove("battle-winner", "battle-loser");
        document.getElementById("p2-team").classList.remove("battle-winner", "battle-loser");

        p1ToplamGuc = 0;
        p2ToplamGuc = 0;
        p1PasHakki = 5;
        p2PasHakki = 5;
        p1TakimKarakterleri = new Array(5).fill(null);
        p2TakimKarakterleri = new Array(5).fill(null);
        aktifKarakterler = [...karakterler];
        aktifOyuncu = 1;

        if (document.getElementById("p1-power")) document.getElementById("p1-power").textContent = "0";
        if (document.getElementById("p2-power")) document.getElementById("p2-power").textContent = "0";
        if (rerollCountDisplay) rerollCountDisplay.textContent = "5";

        const btnCount = document.getElementById("reroll-count-btn");
        if (btnCount) btnCount.textContent = "5";
        if (turnDisplay) turnDisplay.textContent = "Sıra: 1. Oyuncu";
        if (resultDisplay) resultDisplay.innerHTML = "Mürettebatlar karşı karşıya gelmek için emir bekliyor...";

        document.querySelectorAll('.slot').forEach(slot => {
            slot.setAttribute("data-filled", "false");
            slot.style.boxShadow = "none";
            const wantedText = slot.querySelector(".wanted-text");
            if (wantedText) wantedText.textContent = "WANTED";
            const nameSpan = slot.querySelector(".char-name");
            if (nameSpan) nameSpan.textContent = "BOŞ";
        });

        spinBtn.disabled = false;
        startBattleBtn.disabled = false;
        if (resetBtn) resetBtn.classList.replace('display-inline-block', 'display-none');

        drawWheel();
        console.log("🔄 Arena her iki oyuncu için de sıfırlandı!");
    });
}

function formatBeri(deger) {
    return new Intl.NumberFormat('tr-TR').format(deger) + " ฿";
}

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const numSlices = aktifKarakterler.length;
    if (numSlices === 0) return;

    const sliceAngle = (2 * Math.PI) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    for (let i = 0; i < numSlices; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.fillStyle = anaRenkler[i % anaRenkler.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(i * sliceAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#333";
        ctx.font = "bold 10px Arial";
        ctx.fillText(aktifKarakterler[i].isim, radius - 15, 4);
        ctx.restore();
    }
}

function updateModalRoleSelect() {
    modalRoleSelect.innerHTML = "";
    const teamId = aktifOyuncu === 1 ? "p1-team" : "p2-team";
    const teamBox = document.getElementById(teamId);
    const slots = teamBox.querySelectorAll('.slot');

    slots.forEach((slot, index) => {
        if (slot.getAttribute("data-filled") === "false") {
            const roleName = slot.querySelector(".role-badge").textContent.replace(":", "");
            const option = document.createElement("option");
            option.value = index;
            option.textContent = roleName;
            modalRoleSelect.appendChild(option);
        }
    });
}

function hasAvailableSlot(playerNum) {
    const teamId = playerNum === 1 ? "p1-team" : "p2-team";
    const teamBox = document.getElementById(teamId);
    if (!teamBox) return false;
    return teamBox.querySelectorAll('.slot[data-filled="false"]').length > 0;
}

if (spinBtn) {
    spinBtn.addEventListener("click", () => {
        if (aktifKarakterler.length === 0) {
            resultDisplay.textContent = "Çarkta seçilecek karakter kalmadı!";
            return;
        }
        if (aktifOyuncu !== myPlayerNumber) {
            alert("Sıra sende değil Kaptan! Rakibinin hamlesini bekle.");
            return;
        }
        socket.emit('requestSpin');
    });
}

if (canvas) {
    canvas.addEventListener("transitionend", () => {
        sesDurdur('spin');
        const pointer = document.querySelector(".wheel-pointer");
        if (pointer) pointer.classList.remove("pointer-spinning");
        sesCal('select');

        const actualRotation = currentRotation % 360;
        const numSlices = aktifKarakterler.length;
        const sliceDegree = 360 / numSlices;
        const winningIndex = Math.floor(((360 - actualRotation + 270) % 360) / sliceDegree);

        secilenKarakter = aktifKarakterler[winningIndex];
        resultDisplay.innerHTML = `🎯 Savaşçı: <b>${secilenKarakter.isim}</b> <br> <span style="color:#f1c40f;">Ödül: ${formatBeri(secilenKarakter.guc)}</span>`;

        updateModalRoleSelect();
        modalCharName.textContent = secilenKarakter.isim.toUpperCase();
        modalCharBounty.textContent = formatBeri(secilenKarakter.guc);
        if (characterModal) characterModal.classList.replace('display-none', 'display-flex');
    });
}

if (modalPassBtn) {
    modalPassBtn.addEventListener("click", () => {
        if (aktifOyuncu !== myPlayerNumber) {
            alert("Sıra sende değil Kaptan!");
            return;
        }
        let currentPas = aktifOyuncu === 1 ? p1PasHakki : p2PasHakki;
        if (currentPas > 0) {
            socket.emit('requestPass');
        } else {
            alert("Pas hakkınız kalmadı!");
        }
    });
}

if (modalAcceptBtn) {
    modalAcceptBtn.addEventListener("click", () => {
        if (aktifOyuncu !== myPlayerNumber) {
            alert("Sıra sende değil Kaptan!");
            return;
        }
        if (!secilenKarakter) return;

        const selectedSlotIndex = parseInt(modalRoleSelect.value);
        const teamId = aktifOyuncu === 1 ? "p1-team" : "p2-team";
        const teamBox = document.getElementById(teamId);
        const slots = teamBox.querySelectorAll('.slot');
        const bosSlot = slots[selectedSlotIndex];

        if (bosSlot && bosSlot.getAttribute("data-filled") === "false") {
            socket.emit('requestAccept', { slotIndex: selectedSlotIndex, charId: secilenKarakter.id });
        }
    });
}

if (startBattleBtn) {
    startBattleBtn.addEventListener("click", () => {
        const seciliMod = modeSelect ? modeSelect.value : "gauntlet";

        // 🌟 KRİTİK DEĞİŞİKLİK: Savaş sonuçlarını geçici bir sanal elemente hesaplatıp alıyoruz.
        // Böylece butona basan oyuncu da sonucu önceden pat diye görmeyecek, soketten gelen akışı bekleyecek!
        const tempDiv = document.createElement("div");

        if (seciliMod === "gauntlet") {
            runGauntletBattle(p1TakimKarakterleri, p2TakimKarakterleri, turnDisplay, tempDiv);
        } else if (seciliMod === "matchup") {
            runMatchupBattle(p1TakimKarakterleri, p2TakimKarakterleri, turnDisplay, tempDiv);
        } else if (seciliMod === "synergy") {
            runSynergyBattle(p1TakimKarakterleri, p2TakimKarakterleri, turnDisplay, tempDiv);
        }

        const finalHTML = tempDiv.innerHTML;
        let kazananId = 0;
        if (finalHTML.includes("1. Oyuncu") || finalHTML.includes("Sol Taraf")) kazananId = 1;
        else if (finalHTML.includes("2. Oyuncu") || finalHTML.includes("Sağ Taraf")) kazananId = 2;

        socket.emit('requestBattle', {
            html: finalHTML,
            kazanan: kazananId,
            senderId: socket.id
        });
    });
}

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        socket.emit('requestReset');
    });
}

// Kurallar Penceresi Kontrolleri
const rulesBtn = document.getElementById("rules-btn");
const rulesModal = document.getElementById("rules-modal");
const closeRulesBtn = document.getElementById("close-rules-btn");

if (rulesBtn && rulesModal && closeRulesBtn) {
    rulesBtn.addEventListener("click", () => {
        rulesModal.classList.replace('display-none', 'display-flex');
    });

    closeRulesBtn.addEventListener("click", () => {
        rulesModal.classList.replace('display-flex', 'display-none');
    });

    rulesModal.addEventListener("click", (e) => {
        if (e.target === rulesModal) {
            rulesModal.classList.replace('display-flex', 'display-none');
        }
    });
}