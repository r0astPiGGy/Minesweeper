const BOMB = "bomb"

function cellStateOf(value) {
    return {
        value: value,
        opened: false,
        flagged: false
    }
}

function setBomb(cellState) {
    cellState.value = BOMB
}

function isBomb(cellState) {
    return cellState.value === BOMB
}

function isEmpty(cellState) {
    return cellState.value === 0
}

function gameStateOf(gameMode) {
    return {
        flags: gameMode.bombs,
        field: [[]],
        gameOverCellPoint: null,
        win: null,
        gameModes: [],
        selectedGameMode: gameMode
    }
}

function isWin(gameState) {
    return gameState.win !== null && gameState.win
}

function isLose(gameState) {
    return gameState.gameOverCellPoint !== null
}

let uniqueIdCounter = 0

function gameModeOf(name, width, height, bombs) {
    return {
        id: uniqueIdCounter++,
        name: name,
        width: width,
        height: height,
        bombs: bombs
    }
}

const GameMode = {
    EASY: gameModeOf("Простой", 16, 16, 25),
    MEDIUM: gameModeOf("Средний", 30, 20, 99),
    HARD: gameModeOf("Сложный", 40, 25, 199),
    IMPOSSIBLE: gameModeOf("Невозможный", 40, 25, 250),
}

function getAllGameModes() {
    return [ GameMode.EASY, GameMode.MEDIUM, GameMode.HARD, GameMode.IMPOSSIBLE ]
}

function findGameModeById(id) {
    return getAllGameModes().find(it => it.id === id)
}

const CHANCE_COLORS = [
    "#0f19a2",
    "#4d8d0f",
    "#880f0f",
    "#cb1212",
    "#81790c",
    "#275f9f",
    "#b70694",
    "#3b2a2a",
]

function chanceColorOf(chance) {
    return CHANCE_COLORS[chance - 1]
}