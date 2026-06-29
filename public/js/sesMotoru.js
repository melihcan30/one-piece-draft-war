export const sesler = {
    spin: new Audio('sounds/wheel-spin.mp3'),
    select: new Audio('sounds/character-select.mp3'),
    haki: new Audio('sounds/haki-blast.mp3'),
    victory: new Audio('sounds/victory.mp3')
};

const STORAGE_KEY = 'onePieceDraftAudioSettings';
const defaultAudioSettings = {
    master: 0.8,
    music: 0.75,
    effects: 0.85,
    muted: false
};

const soundGroups = {
    spin: 'effects',
    select: 'effects',
    haki: 'effects',
    victory: 'music'
};

let audioSettings = loadAudioSettings();
applyAudioSettings();

export function getAudioSettings() {
    return { ...audioSettings };
}

export function updateAudioSettings(nextSettings) {
    audioSettings = {
        ...audioSettings,
        ...nextSettings
    };

    saveAudioSettings();
    applyAudioSettings();
    return getAudioSettings();
}

// Ses calma fonksiyonu (Ayni ses ust uste binerse sifirlayip bastan calar)
export function sesCal(sesAdi, loop = false) {
    const ses = sesler[sesAdi];
    if (!ses) return;

    applySingleAudioSettings(sesAdi, ses);
    ses.currentTime = 0;
    ses.loop = loop;

    // Tarayicilarin kullanici etkilesimi olmadan ses calma politikasini sessizce yakala.
    ses.play().catch(e => {
        console.log("Ses calma tarayici tarafindan engellendi (Butona basilinca duzelecek):", e);
    });
}

// Ses durdurma fonksiyonu
export function sesDurdur(sesAdi) {
    const ses = sesler[sesAdi];
    if (!ses) return;
    ses.pause();
    ses.currentTime = 0;
}

function loadAudioSettings() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return {
            ...defaultAudioSettings,
            ...savedSettings
        };
    } catch (error) {
        return { ...defaultAudioSettings };
    }
}

function saveAudioSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(audioSettings));
}

function applyAudioSettings() {
    Object.entries(sesler).forEach(([soundName, audio]) => {
        applySingleAudioSettings(soundName, audio);
    });
}

function applySingleAudioSettings(soundName, audio) {
    const group = soundGroups[soundName] || 'effects';
    const groupVolume = audioSettings[group] ?? 1;
    audio.volume = audioSettings.muted ? 0 : clampVolume(audioSettings.master * groupVolume);
    audio.muted = audioSettings.muted;
}

function clampVolume(value) {
    return Math.min(1, Math.max(0, Number(value) || 0));
}
