const TEAM_SIZE = 5;
const DEFAULT_PASS_COUNT = 5;

export function createInitialGameState(characters) {
    return {
        activeCharacters: [...characters],
        currentRotation: 0,
        selectedCharacter: null,
        activePlayer: 1,
        passRights: {
            1: DEFAULT_PASS_COUNT,
            2: DEFAULT_PASS_COUNT
        },
        totalPower: {
            1: 0,
            2: 0
        },
        teams: {
            1: Array(TEAM_SIZE).fill(null),
            2: Array(TEAM_SIZE).fill(null)
        },
        myPlayerNumber: null
    };
}

export function resetGameState(state, characters) {
    state.activeCharacters = [...characters];
    state.currentRotation = 0;
    state.selectedCharacter = null;
    state.activePlayer = 1;
    state.passRights = { 1: DEFAULT_PASS_COUNT, 2: DEFAULT_PASS_COUNT };
    state.totalPower = { 1: 0, 2: 0 };
    state.teams = {
        1: Array(TEAM_SIZE).fill(null),
        2: Array(TEAM_SIZE).fill(null)
    };
}

export function toTeamCharacter(character) {
    return {
        id: character.id,
        isim: character.isim,
        guc: character.guc,
        seviye: character.seviye
    };
}

export function removeCharacterById(characters, characterId) {
    return characters.filter(character => character.id !== characterId);
}

export { TEAM_SIZE, DEFAULT_PASS_COUNT };

