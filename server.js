const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// public klasöründeki statik dosyaları dışarıya açıyoruz
app.use(express.static(path.join(__dirname, 'public')));

// 🏴‍☠️ TÜM ODALARI VE ODALARA ÖZEL OYUN DURUMLARINI TUTACAK DEV HARİTA
const rooms = {};

io.on('connection', (socket) => {
    console.log(`🏴‍☠️ Bir korsan gemiye katıldı: ${socket.id}`);

    // 🚪 1. ADIM: OYUNCU ODAYA KATILDIĞINDA TETİKLENİR
    socket.on('joinRoom', (data) => {
        const roomName = data.room;
        socket.roomName = roomName; // 🌟 EN KRİTİK DÜZELTME: Sokete oda adını bağlıyoruz!

        // Oda yoksa oluştur ve tam oyun şablonunu hafızaya al
        if (!rooms[roomName]) {
            rooms[roomName] = {
                players: { player1: null, player2: null },
                p1Data: null,
                p2Data: null,
                aktifOyuncu: 1,
                gameState: {
                    aktifKarakterler: [],
                    p1Takim: Array(5).fill(null),
                    p2Takim: Array(5).fill(null),
                    p1PasHakki: 5,
                    p2PasHakki: 5,
                    p1ToplamGuc: 0,
                    p2ToplamGuc: 0,
                    aktifOyuncu: 1,
                    oyunBasladi: false
                }
            };
        }

        let assignedPlayer = null;
        let playerColor = "";

        // Boş slotlara oyuncuları yerleştir ve gelen kimlikleri kaydet
        if (!rooms[roomName].players.player1) {
            rooms[roomName].players.player1 = socket.id;
            rooms[roomName].p1Data = { username: data.username, avatar: data.avatar };
            socket.join(roomName);
            assignedPlayer = 1;
            playerColor = "Kırmızı";
        } else if (!rooms[roomName].players.player2) {
            rooms[roomName].players.player2 = socket.id;
            rooms[roomName].p2Data = { username: data.username, avatar: data.avatar };
            socket.join(roomName);
            assignedPlayer = 2;
            playerColor = "Mavi";
        } else {
            socket.emit('roomFull');
            return;
        }

        // 🌟 Oyuncunun kendisine hangi oyuncu (1 veya 2) olduğunu bildiriyoruz
        socket.emit('playerAssignment', { player: assignedPlayer, color: playerColor });

        // Odadaki herkese güncel oyuncu kimlik kartlarını fırlat
        io.to(roomName).emit('roomStatus', {
            p1Data: rooms[roomName].p1Data,
            p2Data: rooms[roomName].p2Data
        });

        // 🌟 Giriş yapan oyuncunun ekranına mevcut oyun durumunu üfle (Çarkın dolması için!)
        socket.emit('initGameState', rooms[roomName].gameState);
    });

    // 📦 Çark İlk Yüklendiğinde Karakter Havuzunu Oda Hafızasına Al
    socket.on('syncInitialCharacters', (charactersList) => {
        const room = rooms[socket.roomName];
        if (!room) return;

        if (room.gameState.aktifKarakterler.length === 0 && !room.gameState.oyunBasladi) {
            room.gameState.aktifKarakterler = charactersList;
            room.gameState.oyunBasladi = true;
            // Diğer oyunculara da güncel durumu fırlat
            io.to(socket.roomName).emit('initGameState', room.gameState);
        }
    });

    // 🔮 Çarkı Döndürme İsteği
    socket.on('requestSpin', () => {
        const room = rooms[socket.roomName];
        if (!room) return;

        const yetkiliSocketId = room.players[`player${room.aktifOyuncu}`];
        if (socket.id === yetkiliSocketId) {
            const randomDegree = Math.floor(Math.random() * 360);
            io.to(socket.roomName).emit('runSpinAnimation', { randomDegree: randomDegree });
        }
    });

    // 🎲 Pas Geçme İsteği
    socket.on('requestPass', () => {
        const room = rooms[socket.roomName];
        if (!room) return;

        if (socket.id === room.players[`player${room.aktifOyuncu}`]) {
            if (room.aktifOyuncu === 1) room.gameState.p1PasHakki--;
            else room.gameState.p2PasHakki--;

            io.to(socket.roomName).emit('runPassAction');
        }
    });

    // 🤝 Tayfaya Katma İsteği
    socket.on('requestAccept', (data) => {
        const room = rooms[socket.roomName];
        if (!room) return;

        if (socket.id === room.players[`player${room.aktifOyuncu}`]) {
            if (data.charId) {
                room.gameState.aktifKarakterler = room.gameState.aktifKarakterler.filter(c => c.id !== data.charId);
            }
            io.to(socket.roomName).emit('runAcceptAction', { slotIndex: data.slotIndex, charId: data.charId });
        }
    });

    // 🔄 Aktif Oyuncu Sırasını Odada Güncelleme
    socket.on('syncActivePlayer', (data) => {
        const room = rooms[socket.roomName];
        if (!room) return;

        if (socket.id === room.players[`player${data.previousPlayer}`]) {
            room.aktifOyuncu = data.nextPlayer;
            room.gameState.aktifOyuncu = data.nextPlayer;
            console.log(`🔄 [${socket.roomName}] Odasında Sıra Değişti: Artık P${room.aktifOyuncu}'de`);
        }
    });

    // Oyunculardan biri pop-up üzerindeki "Savaşa Devam Et" butonuna bastığında tetiklenir
    socket.on('requestNextLogStep', () => {
        // Hangi odada olunduğunu bulup odaya runNextLogStep emrini gönderiyoruz
        if (socket.roomName) {
            io.to(socket.roomName).emit('runNextLogStep');
        } else {
            // Eğer socket üzerinde roomName tutmuyorsan, odaları tarayan mevcut mantığına göre uyarlayabilirsin:
            const userRooms = Array.from(socket.rooms).filter(r => r !== socket.id);
            if (userRooms.length > 0) {
                io.to(userRooms[0]).emit('runNextLogStep');
            }
        }
    });

    // ⚔️ Savaş Başlatma ve Sonuç Dağıtma İsteği
    socket.on('requestBattle', (data) => {
        const room = rooms[socket.roomName];
        if (room) {
            io.to(socket.roomName).emit('runBattleResult', {
                html: data.html,
                kazanan: data.kazanan,
                senderId: data.senderId,
                players: room.players
            });
        }
    });

    // 🔄 Arenayı Sıfırlama (Reset) İsteği
    socket.on('requestReset', () => {
        const room = rooms[socket.roomName];
        if (!room) return;

        room.aktifOyuncu = 1;
        room.gameState = {
            aktifKarakterler: [],
            p1Takim: Array(5).fill(null),
            p2Takim: Array(5).fill(null),
            p1PasHakki: 5,
            p2PasHakki: 5,
            p1ToplamGuc: 0,
            p2ToplamGuc: 0,
            aktifOyuncu: 1,
            oyunBasladi: false
        };
        io.to(socket.roomName).emit('runResetAction');
    });

    // Oyuncu ayrıldığında koltuğunu boşalt
    socket.on('disconnect', () => {
        const roomName = socket.roomName; // 🌟 DÜZELTME: Tanımsız roomName yerine socket.roomName kullanıyoruz
        if (!roomName || !rooms[roomName]) return;

        console.log(`⚓ Korsan ayrıldı: ${socket.id} (Oda: ${roomName})`);

        if (rooms[roomName].players.player1 === socket.id) {
            rooms[roomName].players.player1 = null;
            rooms[roomName].p1Data = null;
        } else if (rooms[roomName].players.player2 === socket.id) {
            rooms[roomName].players.player2 = null;
            rooms[roomName].p2Data = null;
        }

        // Kalan oyuncuya güncel durumu bildir
        io.to(roomName).emit('roomStatus', {
            p1Data: rooms[roomName].p1Data,
            p2Data: rooms[roomName].p2Data
        });
    });
});

server.listen(PORT, () => {
    console.log(`⚓ Grand Line Arena hazır! http://localhost:${PORT} adresinden yelken açabilirsiniz.`);
});