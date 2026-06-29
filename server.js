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
    socket.on('requestSpin', () => runIfAuthorized(socket, room => spinWheel(socket, room)));
    socket.on('requestPass', () => runIfAuthorized(socket, room => passTurn(socket, room)));
    socket.on('requestAccept', data => runIfAuthorized(socket, room => acceptCharacter(socket, room, data)));
    socket.on('setReady', isReady => setReady(socket, isReady));
    socket.on('sendStamp', stamp => sendStamp(socket, stamp));
    socket.on('syncActivePlayer', data => syncActivePlayer(socket, data));
    socket.on('requestNextLogStep', () => emitToSocketRoom(socket, 'runNextLogStep'));
    socket.on('requestBattle', data => requestBattle(socket, data));
    socket.on('requestReset', () => resetRoom(socket));
    socket.on('disconnect', () => leaveRoom(socket));
});

function joinRoom(socket, playerData) {
    const roomName = playerData.room;
    socket.roomName = roomName;

    const room = getOrCreateRoom(roomName);
    const assignment = assignPlayer(room, socket.id, playerData);

    if (!assignment) {
        socket.emit('roomFull');
        return;
    }

    socket.join(roomName);
    socket.emit('playerAssignment', assignment);
    emitRoomStatus(roomName);
    socket.emit('initGameState', room.gameState);
}

function getOrCreateRoom(roomName) {
    if (!rooms[roomName]) {
        rooms[roomName] = {
            players: { player1: null, player2: null },
            p1Data: null,
            p2Data: null,
            ready: { 1: false, 2: false },
            activePlayer: 1,
            gameState: createInitialGameState()
        };
    }

    return rooms[roomName];
}

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

function assignPlayer(room, socketId, playerData) {
    if (!room.players.player1) {
        room.players.player1 = socketId;
        room.p1Data = createPlayerIdentity(playerData);
        return { player: 1, color: 'Kirmizi' };
    }

    if (!room.players.player2) {
        room.players.player2 = socketId;
        room.p2Data = createPlayerIdentity(playerData);
        return { player: 2, color: 'Mavi' };
    }

    return null;
}

function createPlayerIdentity(playerData) {
    return {
        username: playerData.username,
        avatar: playerData.avatar
    };
}

function emitRoomStatus(roomName) {
    const room = rooms[roomName];
    if (!room) return;

    io.to(roomName).emit('roomStatus', {
        p1Data: room.p1Data,
        p2Data: room.p2Data,
        ready: room.ready
    });
}

function setReady(socket, isReady) {
    const room = getSocketRoom(socket);
    const playerNumber = getSocketPlayerNumber(socket, room);
    if (!room || !playerNumber || room.gameState.oyunBasladi) return;

    room.ready[playerNumber] = Boolean(isReady);
    emitRoomStatus(socket.roomName);
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

function syncInitialCharacters(socket, characters) {
    const room = getSocketRoom(socket);
    if (!room) return;

    if (room.gameState.aktifKarakterler.length > 0 || room.gameState.oyunBasladi) return;
    if (!room.ready[1] || !room.ready[2] || !room.players.player1 || !room.players.player2) return;

    room.gameState.aktifKarakterler = characters;
    room.gameState.oyunBasladi = true;
    io.to(socket.roomName).emit('initGameState', room.gameState);
}

function runIfAuthorized(socket, action) {
    const room = getSocketRoom(socket);
    if (!room || !isActivePlayer(socket, room)) return;

    action(room);
}

function spinWheel(socket) {
    io.to(socket.roomName).emit('runSpinAnimation', {
        randomDegree: Math.floor(Math.random() * 360)
    });
}

function passTurn(socket, room) {
    const passKey = room.activePlayer === 1 ? 'p1PasHakki' : 'p2PasHakki';
    if (room.gameState[passKey] <= 0) return;

    room.gameState[passKey]--;
    io.to(socket.roomName).emit('runPassAction');
}

function acceptCharacter(socket, room, data) {
    const selectedCharacter = room.gameState.aktifKarakterler.find(character => character.id === data.charId);

    if (selectedCharacter) {
        room.gameState.aktifKarakterler = room.gameState.aktifKarakterler.filter(character => character.id !== data.charId);
        updateServerTeamState(room, data.slotIndex, selectedCharacter);
    }

    io.to(socket.roomName).emit('runAcceptAction', {
        slotIndex: data.slotIndex,
        charId: data.charId
    });
}

function updateServerTeamState(room, slotIndex, character) {
    const teamKey = room.activePlayer === 1 ? 'p1Takim' : 'p2Takim';
    const powerKey = room.activePlayer === 1 ? 'p1ToplamGuc' : 'p2ToplamGuc';

    if (slotIndex < 0 || slotIndex >= TEAM_SIZE || room.gameState[teamKey][slotIndex]) return;

    room.gameState[teamKey][slotIndex] = {
        id: character.id,
        isim: character.isim,
        guc: character.guc,
        seviye: character.seviye,
        taraf: character.taraf
    };
    room.gameState[powerKey] += character.guc;
}

function syncActivePlayer(socket, data) {
    const room = getSocketRoom(socket);
    if (!room) return;

    const previousPlayerId = room.players[`player${data.previousPlayer}`];
    if (socket.id !== previousPlayerId) return;

    room.activePlayer = data.nextPlayer;
    room.gameState.aktifOyuncu = data.nextPlayer;
    console.log(`[${socket.roomName}] Sira degisti: P${room.activePlayer}`);
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

server.listen(PORT, () => {
    console.log(`Grand Line Arena hazir: http://localhost:${PORT}`);
});
