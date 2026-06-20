const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// public klasöründeki statik dosyaları (html, css, js) dışarıya açıyoruz
app.use(express.static(path.join(__dirname, 'public')));

// 🏴‍☠️ TÜM ODALARI VE ODALARA ÖZEL OYUN DURUMLARINI TUTACAK DEV HARİTA
const rooms = {};

io.on('connection', (socket) => {
    console.log(`🏴‍☠️ Bir korsan gemiye katıldı: ${socket.id}`);

    // 🚪 1. ADIM: OYUNCU ODAYA KATILDIĞINDA TETİKLENİR
    socket.on('joinRoom', ({ roomName }) => {
        socket.join(roomName);
        socket.roomName = roomName; // Soket kimliğine oda adını mühürlüyoruz

        // Eğer bu oda hafızada yoksa, o odaya özel bağımsız state mimarisini sıfırdan oluştur
        if (!rooms[roomName]) {
            rooms[roomName] = {
                aktifOyuncu: 1,
                players: { player1: null, player2: null },
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

        const room = rooms[roomName];

        // Boş rolleri odaya özel olarak belirle ve oyuncuya ata
        if (!room.players.player1) {
            room.players.player1 = socket.id;
            socket.emit('playerAssignment', { player: 1, color: '🔴 P1 (Sol)' });
        } else if (!room.players.player2) {
            room.players.player2 = socket.id;
            socket.emit('playerAssignment', { player: 2, color: '🔵 P2 (Sağ)' });
        } else {
            socket.emit('playerAssignment', { player: 0, color: '👁️ İzleyici' });
        }

        // 🔄 F5 Kurtarıcısı: Sadece odaya yeni bağlanan korsana o odanın güncel durumunu teslim et
        socket.emit('initGameState', room.gameState);

        // Toplam oyuncu durumunu SADECE O ODADAKİ herkese yayınla
        io.to(roomName).emit('roomStatus', {
            p1Connected: !!room.players.player1,
            p2Connected: !!room.players.player2
        });

        console.log(`⚓ Korsan ${socket.id}, [${roomName}] odasına giriş yaptı.`);
    });

    // 📦 Çark İlk Yüklendiğinde Karakter Havuzunu Oda Hafızasına Al
    socket.on('syncInitialCharacters', (charactersList) => {
        const room = rooms[socket.roomName];
        if (!room) return;

        if (room.gameState.aktifKarakterler.length === 0 && !room.gameState.oyunBasladi) {
            room.gameState.aktifKarakterler = charactersList;
            room.gameState.oyunBasladi = true;
        }
    });

    // 🔮 Çarkı Döndürme İsteği (Güvenlik Kontrollü)
    socket.on('requestSpin', () => {
        const room = rooms[socket.roomName];
        if (!room) return;

        // Güvenlik Kontrolü: İsteği atan kişi gerçekten bu odada sırası gelen oyuncu mu?
        const yetkiliSocketId = room.players[`player${room.aktifOyuncu}`];
        
        if (socket.id === yetkiliSocketId) {
            const randomDegree = Math.floor(Math.random() * 360);
            // Dereceyi sadece O ODADAKİ oyunculara gönderir
            io.to(socket.roomName).emit('runSpinAnimation', { randomDegree: randomDegree });
        }
    });

    // 🎲 Pas Geçme İsteği
    socket.on('requestPass', () => {
        const room = rooms[socket.roomName];
        if (!room) return;

        if (socket.id === room.players[`player${room.aktifOyuncu}`]) {
            // Oda hafızasındaki pas hakkını düşür
            if (room.aktifOyuncu === 1) room.gameState.p1PasHakki--;
            else room.gameState.p2PasHakki--;

            // Eylemi sadece o odadakilere fırlat
            io.to(socket.roomName).emit('runPassAction');
        }
    });

    // 🤝 Tayfaya Katma İsteği
    socket.on('requestAccept', (data) => {
        const room = rooms[socket.roomName];
        if (!room) return;

        if (socket.id === room.players[`player${room.aktifOyuncu}`]) {
            // Seçilen karakteri oda hafızasından sil (F5 koruması)
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
            room.gameState.aktifOyuncu = data.nextPlayer; // Oda hafızasındaki sırayı eşitle
            console.log(`🔄 [${socket.roomName}] Odasında Sıra Değişti: Artık P${room.aktifOyuncu}'de`);
        }
    });

    // ⚔️ Savaş Başlatma ve Sonuç Dağıtma İsteği
    socket.on('requestBattle', (data) => {
        // Gelen hazır savaş sonuçlarını sadece o odadaki herkese üfle
        const room = rooms[socket.roomName];
        if (room) {
        // Gelen verinin içine odadaki oyuncu koltuklarını da ekleyip herkese fırlatıyoruz
            io.to(socket.roomName).emit('runBattleResult', {
                html: data.html,
                kazanan: data.kazanan,
                senderId: data.senderId,
                players: room.players // 🌟 Eklenen satır: { player1: 'socket_id', player2: 'socket_id' }
            });
        }
    });

    // 🔄 Arenayı Sıfırlama (Reset) İsteği
    socket.on('requestReset', () => {
        const room = rooms[socket.roomName];
        if (!room) return;

        // Sadece o odanın durumunu fabrika ayarlarına döndür
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
        console.log(`⚓ Korsan ayrıldı: ${socket.id}`);
        const room = rooms[socket.roomName];
        
        if (room) {
            if (room.players.player1 === socket.id) room.players.player1 = null;
            if (room.players.player2 === socket.id) room.players.player2 = null;

            // Odadaki kalanlara yeni durumu bildir
            io.to(socket.roomName).emit('roomStatus', {
                p1Connected: !!room.players.player1,
                p2Connected: !!room.players.player2
            });

            // Bellek Optimizasyonu: Eğer odada kimse kalmadıysa odayı komple sil, sunucu şişmesin
            if (!room.players.player1 && !room.players.player2) {
                delete rooms[socket.roomName];
                console.log(`🗑️ [${socket.roomName}] odası tamamen boşaldığı için hafızadan silindi.`);
            }
        }
    });
});



server.listen(PORT, () => {
    console.log(`⚓ Grand Line Arena hazır! http://localhost:${PORT} adresinden yelken açabilirsiniz.`);
});