const POPUP_STYLE_ID = 'combat-popup-styles';

export function injectCombatPopupStyles() {
    if (document.getElementById(POPUP_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = POPUP_STYLE_ID;
    style.innerHTML = `
        .combat-popup-overlay {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
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

        .battle-winner { position: relative; animation: winnerGlowFx 1.5s infinite alternate; z-index: 5; }
        @keyframes winnerGlowFx {
            from { box-shadow: 0 0 15px rgba(46, 204, 113, 0.4); }
            to { box-shadow: 0 0 30px rgba(46, 204, 113, 0.8); }
        }

        .victory-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-12deg);
            font-family: 'Permanent Marker', cursive, sans-serif;
            font-size: 5rem;
            color: #2ecc71;
            letter-spacing: 3px;
            text-shadow: 0 0 20px rgba(0,0,0,0.9), 0 0 5px #fff;
            z-index: 99;
            pointer-events: none;
            animation: popInFx 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes popInFx {
            0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1) rotate(-12deg); opacity: 1; }
        }

        .battle-loser { position: relative; filter: brightness(0.3) grayscale(0.7); transition: filter 0.6s ease; }
        .slash-effect { position: absolute; inset: 0; pointer-events: none; z-index: 100; overflow: hidden; }
        .slash-line {
            position: absolute;
            top: 50%;
            left: -10%;
            width: 120%;
            height: 12px;
            background: linear-gradient(90deg, transparent, #e74c3c, #fff, #e74c3c, transparent);
            transform: translateY(-50%) rotate(-30deg);
            box-shadow: 0 0 20px #e74c3c;
            animation: slashFx 0.25s ease-out forwards;
        }

        @keyframes slashFx {
            0% { width: 0%; left: 50%; opacity: 0; }
            100% { width: 120%; left: -10%; opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

export function parseBattleLines(html) {
    const safeLines = [];
    let currentBlock = "";

    html.split('<br>').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.includes('<div') && !trimmed.includes('</div>')) {
            currentBlock = trimmed;
            return;
        }

        if (currentBlock) {
            currentBlock += `<br>${trimmed}`;
            if (trimmed.includes('</div>')) {
                safeLines.push(currentBlock);
                currentBlock = "";
            }
            return;
        }

        safeLines.push(trimmed);
    });

    if (currentBlock) safeLines.push(currentBlock);
    return safeLines;
}

export function createCombatPopup(onContinue) {
    injectCombatPopupStyles();

    const overlay = document.createElement('div');
    overlay.className = 'combat-popup-overlay';
    overlay.id = 'combat-popup-modal';
    overlay.innerHTML = `
        <div class="combat-popup-box">
            <div class="combat-popup-header">CANLI SAVAS GUNLUGU</div>
            <div class="combat-popup-log-area" id="combat-popup-log-target"></div>
            <div class="combat-popup-footer">
                <button class="combat-popup-btn" id="combat-popup-continue-btn">Savasa Devam Et</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById('combat-popup-continue-btn').addEventListener('click', onContinue);
}

export function appendBattleLine(lineData, isLastLine) {
    const logTarget = document.getElementById('combat-popup-log-target');
    if (!logTarget) return;

    const logItem = document.createElement('div');
    logItem.className = 'combat-log-line';
    logItem.innerHTML = lineData;
    logTarget.appendChild(logItem);
    logTarget.scrollTop = logTarget.scrollHeight;

    if (isLastLine) {
        const button = document.getElementById('combat-popup-continue-btn');
        if (button) button.innerText = 'Savasi Bitir ve Arenaya Don';
    }
}

export function clearBattleEffects() {
    document.querySelectorAll(".victory-overlay, .slash-effect, .combat-popup-overlay").forEach(element => element.remove());
    document.getElementById("p1-team")?.classList.remove("battle-winner", "battle-loser");
    document.getElementById("p2-team")?.classList.remove("battle-winner", "battle-loser");
}

export function showVictoryEffects(winnerId) {
    const p1Team = document.getElementById("p1-team");
    const p2Team = document.getElementById("p2-team");

    if (winnerId === 1) {
        markWinnerAndLoser(p1Team, p2Team);
    } else if (winnerId === 2) {
        markWinnerAndLoser(p2Team, p1Team);
    }
}

function markWinnerAndLoser(winnerTeam, loserTeam) {
    if (!winnerTeam || !loserTeam) return;

    winnerTeam.classList.add("battle-winner");
    loserTeam.classList.add("battle-loser");

    const victoryOverlay = document.createElement('div');
    victoryOverlay.className = 'victory-overlay';
    victoryOverlay.innerText = 'VICTORY';
    winnerTeam.appendChild(victoryOverlay);

    const slash = document.createElement('div');
    slash.className = 'slash-effect';
    slash.innerHTML = '<div class="slash-line"></div>';
    loserTeam.appendChild(slash);
}

