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
            const randomRoom = "Room-" + Math.floor(1000 + Math.random() * 9000);
            urlParams.set('room', randomRoom);
            window.location.search = urlParams.toString();
        });
    }

    // Var Olan Odaya Katılma Dinleyicisi
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
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

    // 🌟 Oda Kodunu Ekranda Gösterme ve Kopyalama Butonu Mantığı
    const roomCodeDisplay = document.getElementById('room-code-display');
    const copyBtn = document.getElementById('copy-btn');

    if (roomCodeDisplay) {
        roomCodeDisplay.innerText = roomName;
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(roomName)
                .then(() => {
                    copyBtn.innerText = 'Kopyandı! ✓';
                    copyBtn.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        copyBtn.innerText = 'Kopyala';
                        copyBtn.style.backgroundColor = '#007bff';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Kod kopyalanamadı: ', err);
                });
        });
    }

    // 🔌 SOKET BAĞLANTISINI ATEŞLE
    socket = io();

    // 🛠️ DÜZELTME 1: Önce dinleyicileri bağla ki localhost veriyi anında döndürdüğünde kaçırmayalım!
    setupSocketListeners();

    // 🛠️ DÜZELTME 2: Sunucudan yanıt gelene kadar çark boş kalmasın, yerel verilerle ilk çizimi yap
    aktifKarakterler = [...karakterler];
    drawWheel();

    // Odaya katılırken ismi ve avatarı paket yapıp şimdi güvenle gönderiyoruz
    const usernameInput = document.getElementById('username-input').value || 'Bilinmeyen Korsan';

    socket.emit('joinRoom', { 
        room: roomName, 
        username: usernameInput, 
        avatar: secilenAvatar 
    });
    console.log(`⚓ Bağlanılan Oda: ${roomName}`);
}



// 5️⃣ ADIM: Soket İstasyon Dinleyicileri Fonksiyonu
function setupSocketListeners() {
    socket.on('playerAssignment', (data) => {
        myPlayerNumber = data.player;
        console.log(`Rolün: ${data.color} - Oyuncu Numaran: ${myPlayerNumber}`);
    });

    socket.on('roomStatus', (data) => {
    // data.p1Data ve data.p2Data bilgilerini sunucudan alıp ekrana yazıyoruz
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

    // Ortak Dönme Emri Animasyonu
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

    // Pas Dinleyicisi
    socket.on('runPassAction', () => {
        if (aktifOyuncu === 1) p1PasHakki--;
        else p2PasHakki--;
        
        let currentPas = aktifOyuncu === 1 ? p1PasHakki : p2PasHakki;
        if (rerollCountDisplay) rerollCountDisplay.textContent = currentPas;
        
        const btnCount = document.getElementById("reroll-count-btn");
        if(btnCount) btnCount.textContent = currentPas;

        if (characterModal) characterModal.classList.replace('display-flex', 'display-none');
        spinBtn.disabled = false;

        if (aktifOyuncu === myPlayerNumber) {
            socket.emit('requestSpin');
        }
    });

    // Kabul Etme / Takıma Ekleme Dinleyicisi
    socket.on('runAcceptAction', (data) => {
        if(data.charId && secilenKarakter) {
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
            
            if(wantedText) {
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

            // Haki Mekaniği Kontrolü
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
            if(btnCount) btnCount.textContent = guncelPasHakki;

            spinBtn.disabled = false;
            startBattleBtn.disabled = false; 
            resultDisplay.innerHTML = `Mürettebat Güncellendi! Sıra ${aktifOyuncu}. Oyuncuda!${hakiMesaji}`;
            secilenKarakter = null;
        }
    });

    // 👑 Savaş Sonucu Senkronizasyonu (Nihai Sabit Ekran Tamiri)
    socket.on('runBattleResult', (data) => {
        // 1. Ekran metnini sadece basmayan taraf güncellesin
        if (data.senderId !== socket.id) {
            resultDisplay.innerHTML = data.html;
        }

        // 2. Konfeti Tetikleyicisi (Global Sabit Düzen)
        // Ekranlar aynalı olmadığı için; 1 kazandıysa herkesin ekranında SOLDA (1),
        // 2 kazandıysa herkesin ekranında SAĞDA (2) patlar!
        if (data.kazanan === 1 || data.kazanan === 2) {
            triggerWinnerConfetti(data.kazanan);
        }

        // 3. Butonları Kilitle ve Tekrar Oyna Butonunu Aç
        if (spinBtn) spinBtn.disabled = true;
        if (startBattleBtn) startBattleBtn.disabled = true;
        if (resetBtn) {
            resetBtn.classList.remove('display-none');
            resetBtn.classList.add('display-inline-block');
        }
    });

    // 🔄 TAMAMLANAN ARENA SIFIRLAMA (RESET) MANTIĞI
    socket.on('runResetAction', () => {
        p1ToplamGuc = 0;
        p2ToplamGuc = 0;
        p1PasHakki = 5;
        p2PasHakki = 5;
        p1TakimKarakterleri = new Array(5).fill(null);
        p2TakimKarakterleri = new Array(5).fill(null);
        aktifKarakterler = [...karakterler];
        aktifOyuncu = 1;

        if(document.getElementById("p1-power")) document.getElementById("p1-power").textContent = "0";
        if(document.getElementById("p2-power")) document.getElementById("p2-power").textContent = "0";
        if(rerollCountDisplay) rerollCountDisplay.textContent = "5";
        
        const btnCount = document.getElementById("reroll-count-btn");
        if(btnCount) btnCount.textContent = "5";
        if(turnDisplay) turnDisplay.textContent = "Sıra: 1. Oyuncu";
        if(resultDisplay) resultDisplay.innerHTML = "Mürettebatlar karşı karşıya gelmek için emir bekliyor...";

        // Tüm slotları sıfırla ve görsel tasarımlarını eski haline getir
        document.querySelectorAll('.slot').forEach(slot => {
            slot.setAttribute("data-filled", "false");
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

// Yardımcı Format Fonksiyonu
function formatBeri(deger) {
    return new Intl.NumberFormat('tr-TR').format(deger) + " ฿";
}

// Çark Çizim Fonksiyonu
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

// Pop-up Rol Seçimini Doldurma
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

// Çark Çevirme Buton Dinleyicisi
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

// Çark Dönme Animasyonu Bitiş Takibi
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

// Pas Geçme Butonu
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

// Tayfaya Katma Butonu
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

// Savaşı Başlatma Tetikleyicisi
if (startBattleBtn) {
    startBattleBtn.addEventListener("click", () => {
        const seciliMod = modeSelect ? modeSelect.value : "gauntlet";
        
        if (seciliMod === "gauntlet") {
            runGauntletBattle(p1TakimKarakterleri, p2TakimKarakterleri, turnDisplay, resultDisplay);
        } else if (seciliMod === "matchup") {
            runMatchupBattle(p1TakimKarakterleri, p2TakimKarakterleri, turnDisplay, resultDisplay);
        } else if (seciliMod === "synergy") {
            runSynergyBattle(p1TakimKarakterleri, p2TakimKarakterleri, turnDisplay, resultDisplay);
        }

        const finalHTML = resultDisplay.innerHTML;
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

// Reset Butonu Dinleyicisi
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

