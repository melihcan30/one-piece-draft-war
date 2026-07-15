const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const TEAM_SIZE = 5;
const INITIAL_PASS_RIGHTS = 5;

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const rooms = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    console.log(`Korsan gemiye katildi: ${socket.id}`);

    socket.on('joinRoom', playerData => joinRoom(socket, playerData));
    socket.on('syncInitialCharacters', characters => syncInitialCharacters(socket, characters));

    // 🌟 ÇÖZÜM: Çark durduktan sonra gelen karakter verisini odaya güvenle işleyen yeni event dinleyicisi
    socket.on('syncSpunCharacters', characters => runIfAuthorized(socket, room => syncSpunCharacters(socket, room, characters)));

    socket.on('requestSpin', () => runIfAuthorized(socket, room => spinWheel(socket, room)));
    socket.on('requestPass', () => runIfAuthorized(socket, room => passTurn(socket, room)));
    socket.on('requestAccept', data => runIfAuthorized(socket, room => acceptCharacter(socket, room, data)));
    socket.on('setReady', isReady => setReady(socket, isReady));

    // 🏴‍☠️ SEÇİLEN MODU AL VE OYUNU BAŞLAT
    socket.on('selectMode', (modeName) => {
        const room = rooms[socket.roomName];
        if (!room) return;

        // 🌟 ÇÖZÜM: Yeni mod başladığı için oyuncu takımlarını, karakterleri ve pas haklarını SIFIRLA!
        room.gameState = createInitialGameState();
        room.activePlayer = 1;
        //room.ready = { 1: false, 2: false }; // Hazır durumlarını yeni evre için temizle

        room.matchState.currentMode = modeName;
        room.matchState.status = 'DRAFTING';
        room.gameState.oyunBasladi = true;

        if (!room.matchState.playedModes.includes(modeName)) {
            room.matchState.playedModes.push(modeName);
        }

        console.log(`⚓ Oda: ${socket.roomName} için Mod Seçildi: ${modeName}. Oyun ve draft akışı başlatılıyor.`);

        // 1. Modun seçildiğini duyur (Modal pencereleri kapanacak)
        io.to(socket.roomName).emit('modeSelected', modeName);

        // 🌟 ÇÖZÜM: Tüm odaya güncel verileri bas ki 2. Oyuncunun ekranı kitlenmesin, DRAFTING moduna geçsin!
        emitRoomStatus(socket.roomName);

        // 2. Orijinal başlangıç sinyalini tetikliyoruz (Çark ve butonlar aktifleşecek)
        io.to(socket.roomName).emit('gameStarted', {
            aktifOyuncu: room.gameState.aktifOyuncu,
            p1PasHakki: room.gameState.p1PasHakki,
            p2PasHakki: room.gameState.p2PasHakki
        });

        // 3. Geri Sayım Sayacını Başlat
        startDraftTimer(socket.roomName);
    });

    socket.on('sendStamp', stamp => sendStamp(socket, stamp));
    socket.on('syncActivePlayer', data => syncActivePlayer(socket, data));
    socket.on('requestNextLogStep', () => emitToSocketRoom(socket, 'runNextLogStep'));
    socket.on('requestBattle', data => requestBattle(socket, data));
    socket.on('requestReset', () => resetRoom(socket));
    socket.on('disconnect', () => leaveRoom(socket));

    socket.on('roundFinished', (data) => {
        const room = rooms[socket.roomName];
        if (!room || room.matchState.status !== 'DRAFTING') return;

        room.matchState.status = 'ROUND_RESULT';
        clearInterval(room.matchState.turnTimer);

        if (data.kazananId === 1) room.matchState.p1RoundWins++;
        if (data.kazananId === 2) room.matchState.p2RoundWins++;

        io.to(socket.roomName).emit('updateScores', {
            matchScore: { p1: room.matchState.p1MatchScore, p2: room.matchState.p2MatchScore },
            roundScore: { p1: room.matchState.p1RoundWins, p2: room.matchState.p2RoundWins }
        });

        if (room.matchState.p1RoundWins === 2 || room.matchState.p2RoundWins === 2) {
            handleModeEnd(socket.roomName, data.kazananId);
        } else {
            room.matchState.currentRound++;

            // Yeni raunt için draft alanını ve pas haklarını temizle
            room.gameState = createInitialGameState();
            room.activePlayer = 1;

            // 🌟 ÇÖZÜM: İkinci raunta geçerken oyuncuların "Hazır" durumlarını ve oda statüsünü sıfırlıyoruz!
            room.ready = { 1: false, 2: false };
            room.matchState.status = 'WAITING';

            io.to(socket.roomName).emit('runResetAction');
            emitRoomStatus(socket.roomName);
        }
    });

    // 🌟 ÇÖZÜM: Tüm maçı ve modları sıfırlayan yeni event
    socket.on('requestFullReset', () => {
        const roomName = socket.roomName;
        const room = rooms[roomName];
        if (!room) return;

        // Maç verilerini tamamen sıfırla (Skorlar ve oynanmış modlar silinir)
        room.matchState = {
            status: 'WAITING',
            p1MatchScore: 0,
            p2MatchScore: 0,
            currentMode: null,
            playedModes: [],
            currentRound: 1,
            p1RoundWins: 0,
            p2RoundWins: 0,
            modeSelector: 1,
            turnTimer: null,
            timeLeft: 60
        };

        // Takım ve draft verilerini sıfırla
        room.gameState = createInitialGameState();
        room.activePlayer = 1;
        room.ready = { 1: false, 2: false };

        io.to(roomName).emit('runFullReset');
        emitRoomStatus(roomName);
    });
});

function createInitialGameState() {
    return {
        aktifKarakterler: [],
        p1Takim: Array(TEAM_SIZE).fill(null),
        p2Takim: Array(TEAM_SIZE).fill(null),
        p1PasHakki: INITIAL_PASS_RIGHTS,
        p2PasHakki: INITIAL_PASS_RIGHTS,
        p1ToplamGuc: 0,
        p2ToplamGuc: 0,
        aktifOyuncu: 1,
        oyunBasladi: false
    };
}

function joinRoom(socket, playerData) {
    // 🌟 ÇÖZÜM 1: 'avatar' verisini ve isim varyasyonlarını güvenle parçalıyoruz
    const { roomName, playerName, username, avatar } = playerData;
    const finalName = username || playerName || "Kaptan";
    const finalAvatar = avatar || "🏴‍☠️";

    socket.roomName = roomName;
    socket.join(roomName);

    if (!rooms[roomName]) {
        rooms[roomName] = {
            players: { player1: null, player2: null },
            p1Data: null,
            p2Data: null,
            ready: { 1: false, 2: false },
            activePlayer: 1,
            gameState: createInitialGameState(),
            matchState: {
                status: 'WAITING',
                p1MatchScore: 0,
                p2MatchScore: 0,
                currentMode: null,
                playedModes: [],
                currentRound: 1,
                p1RoundWins: 0,
                p2RoundWins: 0,
                modeSelector: 1,
                turnTimer: null,
                timeLeft: 60
            }
        };
    }

    const room = rooms[roomName];
    if (!room.players.player1) {
        room.players.player1 = socket.id;
        // 🌟 Avatarı kaydediyoruz
        room.p1Data = { username: finalName, avatar: finalAvatar };
    } else if (!room.players.player2 && room.players.player1 !== socket.id) {
        room.players.player2 = socket.id;
        // 🌟 Avatarı kaydediyoruz
        room.p2Data = { username: finalName, avatar: finalAvatar };
    }

    emitRoomStatus(roomName);
}

// 1. GÜNCELLEME: Başlangıç senkronizasyonundaki log düzeltildi
function syncInitialCharacters(socket, characters) {
    const room = getSocketRoom(socket);
    if (!room) return;

    room.gameState.aktifKarakterler = Array.isArray(characters) ? characters : [characters];

    // 🌟 ÇÖZÜM: Tüm karakterleri yazdırmak yerine sadece sayısını yazdırıyoruz
    console.log(`⚓ [${socket.roomName}] ${room.gameState.aktifKarakterler.length} karakter havuza eklendi.`);

    io.to(socket.roomName).emit('initGameState', room.gameState);
    emitRoomStatus(socket.roomName);
}

// 2. GÜNCELLEME: Çark dönüşündeki log düzeltildi
function syncSpunCharacters(socket, room, characters) {
    room.gameState.aktifKarakterler = Array.isArray(characters) ? characters : [characters];

    // 🌟 ÇÖZÜM: Tüm karakterleri yazdırmak yerine sadece sayısını yazdırıyoruz
    console.log(`🎰 [${socket.roomName}] Çark sonucu ${room.gameState.aktifKarakterler.length} karakter gösteriliyor.`);

    io.to(socket.roomName).emit('charactersRevealed', room.gameState.aktifKarakterler);
    emitRoomStatus(socket.roomName);
}

// 🌟 ÇÖZÜM 1 & 3: Mod bitiş temizliği ve 2 kazananlı Genel Maç Bitiş kontrolü
function handleModeEnd(roomName, modeKazananId) {
    const room = rooms[roomName];
    if (!room) return;

    // Modu kazananın puanını artır
    if (modeKazananId === 1) room.matchState.p1MatchScore++;
    if (modeKazananId === 2) room.matchState.p2MatchScore++;

    // Rauntları sıfırla
    room.matchState.p1RoundWins = 0;
    room.matchState.p2RoundWins = 0;
    room.matchState.currentRound = 1;

    room.gameState = createInitialGameState();
    room.activePlayer = 1;
    room.ready = { 1: false, 2: false };

    console.log(`🏆 Mod Bitti! Yeni Maç Skorları -> P1: ${room.matchState.p1MatchScore} - P2: ${room.matchState.p2MatchScore}`);

    io.to(roomName).emit('updateScores', {
        matchScore: { p1: room.matchState.p1MatchScore, p2: room.matchState.p2MatchScore },
        roundScore: { p1: 0, p2: 0 }
    });

    // 🌟 ÇÖZÜM 1: Yeni moda geçmeden önce ekrandaki Victory/Çizik animasyonlarını temizle
    io.to(roomName).emit('runResetAction');

    // 🌟 ÇÖZÜM 3: MAÇ BİTTİ Mİ KONTROLÜ (Biri 2 mod kazandıysa oyunu bitir)
    if (room.matchState.p1MatchScore >= 2 || room.matchState.p2MatchScore >= 2) {
        room.matchState.status = 'FINISHED';
        const matchWinner = room.matchState.p1MatchScore >= 2 ? 1 : 2;

        console.log(`🎉 BÜYÜK FİNAL! OYUNCU ${matchWinner} KAZANDI!`);
        io.to(roomName).emit('matchFinished', { winnerId: matchWinner });

        emitRoomStatus(roomName);
        return; // İşlemi burada kes, 3. modu SEÇTİRME!
    }

    // Eğer maç bitmediyse (skor 1-0, 1-1 gibiyse) sıradaki moda geçiş yap
    room.matchState.modeSelector = room.matchState.modeSelector === 1 ? 2 : 1;
    room.matchState.status = 'MODE_SELECTION';

    io.to(roomName).emit('startModeSelection', {
        selector: room.matchState.modeSelector,
        playedModes: room.matchState.playedModes
    });

    emitRoomStatus(roomName);
}

function emitRoomStatus(roomName) {
    const room = rooms[roomName];
    if (!room) return;

    // 🚨 KRİTİK ÇÖZÜM: Sunucuyu çökerten turnTimer (setInterval) nesnesini
    // istemciye göndermeden önce ayıklayarak güvenli bir veri paketi oluşturuyoruz.
    const { turnTimer, ...safeMatchState } = room.matchState;

    io.to(roomName).emit('roomStatus', {
        players: room.players,
        p1Data: room.p1Data,
        p2Data: room.p2Data,
        ready: room.ready,
        gameState: room.gameState,
        matchState: safeMatchState // Güvenli versiyonu gönderiyoruz
    });
}

// 2. GÜNCELLEME: 2. Raund başlarken mod seçimini atla ve direkt çarkı aç
function setReady(socket, isReady) {
    const roomName = socket.roomName;
    const room = rooms[roomName];
    if (!room) return;

    if (room.players.player1 === socket.id) {
        room.ready[1] = isReady;
    } else if (room.players.player2 === socket.id) {
        room.ready[2] = isReady;
    }

    emitRoomStatus(roomName);

    // Herkes hazır olduğunda:
    if (room.ready[1] && room.ready[2]) {
        // Eğer 2. veya daha ileri bir raunttaysak, mod seçimini atla direkt oyunu başlat!
        if (room.matchState.currentRound > 1) {
            room.matchState.status = 'DRAFTING';
            room.gameState.oyunBasladi = true;

            io.to(roomName).emit('gameStarted', {
                aktifOyuncu: room.gameState.aktifOyuncu,
                p1PasHakki: room.gameState.p1PasHakki,
                p2PasHakki: room.gameState.p2PasHakki
            });
            startDraftTimer(roomName);
        } else {
            // Sadece 1. raunt ise Mod Seçim ekranını göster
            room.matchState.status = 'MODE_SELECTION';
            console.log(`⚓ Her iki korsan da hazır! Oda: ${roomName}. Mod seçimi ekranı gönderiliyor...`);

            io.to(roomName).emit('startModeSelection', {
                selector: room.matchState.modeSelector,
                playedModes: room.matchState.playedModes
            });
        }
    }
}

function acceptCharacter(socket, room, data) {
    const selectedCharacter = room.gameState.aktifKarakterler.find(character => character.id === data.charId);

    if (selectedCharacter) {
        room.gameState.aktifKarakterler = room.gameState.aktifKarakterler.filter(character => character.id !== data.charId);

        // 🌟 DEĞİŞİKLİK: Fonksiyondan Haki tetiklenip tetiklenmediği bilgisini alıyoruz
        const hakiOlduMu = updateServerTeamState(room, data.slotIndex, selectedCharacter);

        // Eğer Haki tetiklendiyse tüm odaya animasyon sinyali gönder
        if (hakiOlduMu) {
            io.to(socket.roomName).emit('draftHakiClash');
        }
    }

    // Sıra DEĞİŞTİRİLİYOR
    room.gameState.aktifOyuncu = room.gameState.aktifOyuncu === 1 ? 2 : 1;
    room.activePlayer = room.gameState.aktifOyuncu;

    io.to(socket.roomName).emit('runAcceptAction', {
        slotIndex: data.slotIndex,
        charId: data.charId
    });

    emitRoomStatus(socket.roomName);
    startDraftTimer(socket.roomName);
}

// 1. GÜNCELLEME: Pas geçince sıra değişmesin
function passTurn(socket, room) {
    const passKey = room.activePlayer === 1 ? 'p1PasHakki' : 'p2PasHakki';
    if (room.gameState[passKey] <= 0) return;

    // Sadece hakkı eksiltiyoruz, sırayı değiştiren (aktifOyuncu = 2) kısımları SİLDİK!
    room.gameState[passKey]--;

    io.to(socket.roomName).emit('runPassAction', {
        p1PasHakki: room.gameState.p1PasHakki,
        p2PasHakki: room.gameState.p2PasHakki
    });
    emitRoomStatus(socket.roomName);

    // Süreyi oyuncu için sıfırdan başlat
    startDraftTimer(socket.roomName);
}

function updateServerTeamState(room, slotIndex, character) {
    const teamKey = room.activePlayer === 1 ? 'p1Takim' : 'p2Takim';
    const powerKey = room.activePlayer === 1 ? 'p1ToplamGuc' : 'p2ToplamGuc';
    let hakiTetiklendi = false; // 🌟 Haki kontrol değişkeni

    if (slotIndex < 0 || slotIndex >= TEAM_SIZE || room.gameState[teamKey][slotIndex]) return false;

    room.gameState[teamKey][slotIndex] = {
        id: character.id,
        isim: character.isim,
        guc: character.guc,
        seviye: character.seviye,
        taraf: character.taraf,
        tayfa: character.tayfa || "Diğerleri",      // SİNERJİ İÇİN ŞART!
        etiketler: character.etiketler || [],      // SİNERJİ İÇİN ŞART!
        cinsiyet: character.cinsiyet || "erkek",    // SANJI İÇİN ŞART!
        pasif : character.pasif || null
    };

    // 🐉 DRAGON PASİFİ: Takıma katıldığında anında +1 Pas Hakkı verir
    if (character.isim === "Monkey D. Dragon") {
        const passKey = room.activePlayer === 1 ? 'p1PasHakki' : 'p2PasHakki';
        // Sınırı 5 olarak sabitliyoruz
        if (room.gameState[passKey] < 5) {
            room.gameState[passKey] += 1;
        }
    }

    room.gameState[powerKey] += character.guc;

    // ⚡ YENİ EKLENEN HAKİ MEKANİĞİ ⚡
    if (room.matchState.currentMode === 'matchup') {
        const p1 = room.gameState.p1Takim[slotIndex];
        const p2 = room.gameState.p2Takim[slotIndex];

        // İki tarafın da o slotu doluysa ve baygın değillerse (seviyeleri 0'dan büyükse)
        if (p1 && p2 && p1.seviye > 0 && p2.seviye > 0) {
            const fark = Math.abs(p1.seviye - p2.seviye);

            // 🌟 15 SEVİYE FARK KONTROLÜ
            if (fark > 15) {
                const nextIndex = slotIndex + 1;

                // Eğer bir alt slot varsa (destek rolü bayıltacak bir alt rol bulamaz)
                if (nextIndex < TEAM_SIZE) {
                    const kaybedenKey = p1.seviye > p2.seviye ? 'p2Takim' : 'p1Takim';

                    // Alt slotu tamamen iptal et, BAYGIN statüsüne sok
                    room.gameState[kaybedenKey][nextIndex] = {
                        id: 'baygin',
                        isim: 'BAYGIN',
                        guc: 0,
                        seviye: 0,
                        taraf: 'none'
                    };
                    hakiTetiklendi = true;
                }
            }
        }
    }

    return hakiTetiklendi;
}

function syncActivePlayer(socket, data) {
    const room = getSocketRoom(socket);
    if (!room) return;

    const previousPlayerId = room.players[`player${data.previousPlayer}`];
    if (socket.id !== previousPlayerId) return;

    room.activePlayer = data.nextPlayer;
    room.gameState.aktifOyuncu = data.nextPlayer;
    console.log(`[${socket.roomName}] Sira degisti: P${room.activePlayer}`);
    emitRoomStatus(socket.roomName);
}

// Yeni Olasılık Motorlu spinWheel
function spinWheel(socket, room) {
    const aktifKarakterler = room.gameState.aktifKarakterler;
    if (!aktifKarakterler || aktifKarakterler.length === 0) return;

    // 1. ZAR ATIMI: %100 üzerinden rastgele bir sayı çek
    const roll = Math.random() * 100;
    let secilenTier = "Common";

    // 2. ŞANS AĞIRLIKLARI (Belirttiğin oranlar)
    if (roll <= 5) {
        secilenTier = "Legendary"; // %5
    } else if (roll <= 20) {
        secilenTier = "Epic";      // %15 (5 + 15 = 20)
    } else if (roll <= 55) {
        secilenTier = "Rare";      // %35 (20 + 35 = 55)
    } else {
        secilenTier = "Common";    // %45 (Geri kalanlar)
    }

    // 3. Seçilen zorluktaki karakterlerden bir havuz oluştur
    let havuz = aktifKarakterler.filter(c => c.tier === secilenTier);

    // KORUMA: Eğer çarkta o Tier'dan karakter kalmadıysa, havuzu tekrar tüm karakterler yap
    if (havuz.length === 0) {
        havuz = aktifKarakterler;
    }

    // 4. Havuzun içinden KESİN KAZANACAK karakteri belirle
    const kazananKarakter = havuz[Math.floor(Math.random() * havuz.length)];

    // 5. Client'a rastgele derece değil, HEDEF KARAKTERİN ID'sini gönder
    io.to(socket.roomName).emit('runSpinAnimation', {
        targetId: kazananKarakter.id
    });
}

function sendStamp(socket, stamp) {
    const room = getSocketRoom(socket);
    const playerNumber = getSocketPlayerNumber(socket, room);
    if (!room || !playerNumber || typeof stamp !== 'string') return;

    const safeStamp = stamp.trim().slice(0, 8);
    if (!safeStamp) return;

    io.to(socket.roomName).emit('stampReceived', {
        player: playerNumber,
        stamp: safeStamp,
        id: `${socket.id}-${Date.now()}`
    });
}

function runIfAuthorized(socket, action) {
    const room = getSocketRoom(socket);
    if (!room || !isActivePlayer(socket, room)) return;

    action(room);
}

function requestBattle(socket, data) {
    const room = getSocketRoom(socket);
    if (!room) return;

    io.to(socket.roomName).emit('runBattleResult', {
        html: data.html,
        kazanan: data.kazanan,
        senderId: data.senderId,
        players: room.players
    });
}

function resetRoom(socket) {
    const room = getSocketRoom(socket);
    if (!room) return;

    room.activePlayer = 1;
    room.ready = { 1: false, 2: false };
    room.gameState = createInitialGameState();
    io.to(socket.roomName).emit('runResetAction');
    emitRoomStatus(socket.roomName);
}

function leaveRoom(socket) {
    const roomName = socket.roomName;
    const room = getSocketRoom(socket);
    if (!room) return;

    console.log(`Korsan ayrildi: ${socket.id} (Oda: ${roomName})`);

    if (room.players.player1 === socket.id) {
        room.players.player1 = null;
        room.p1Data = null;
        room.ready[1] = false;
    } else if (room.players.player2 === socket.id) {
        room.players.player2 = null;
        room.p2Data = null;
        room.ready[2] = false;
    }

    emitRoomStatus(roomName);
    deleteRoomIfEmpty(roomName);
}

function deleteRoomIfEmpty(roomName) {
    const room = rooms[roomName];
    if (!room) return;

    if (!room.players.player1 && !room.players.player2) {
        delete rooms[roomName];
    }
}

function emitToSocketRoom(socket, eventName, payload) {
    if (socket.roomName) {
        io.to(socket.roomName).emit(eventName, payload);
    }
}

function getSocketRoom(socket) {
    return socket.roomName ? rooms[socket.roomName] : null;
}

function isActivePlayer(socket, room) {
    return socket.id === room.players[`player${room.activePlayer}`];
}

function getSocketPlayerNumber(socket, room) {
    if (!room) return null;
    if (room.players.player1 === socket.id) return 1;
    if (room.players.player2 === socket.id) return 2;
    return null;
}

function startDraftTimer(roomName) {
    const room = rooms[roomName];
    if (!room) return;

    clearInterval(room.matchState.turnTimer);
    room.matchState.timeLeft = 60;

    io.to(roomName).emit('timerStarted', room.matchState.timeLeft);

    room.matchState.turnTimer = setInterval(() => {
        room.matchState.timeLeft--;
        io.to(roomName).emit('timerUpdate', room.matchState.timeLeft);

        if (room.matchState.timeLeft <= 0) {
            clearInterval(room.matchState.turnTimer);
            autoPassTurn(roomName);
        }
    }, 1000);
}

function autoPassTurn(roomName) {
    const room = rooms[roomName];
    if (!room) return;

    room.gameState.aktifOyuncu = room.gameState.aktifOyuncu === 1 ? 2 : 1;
    room.activePlayer = room.gameState.aktifOyuncu;
    io.to(roomName).emit('autoPassed', { aktifOyuncu: room.gameState.aktifOyuncu });
    emitRoomStatus(roomName);

    startDraftTimer(roomName);
}

server.listen(PORT, () => {
    console.log(`Grand Line Arena hazir: http://localhost:${PORT}`);
});