const LEFT_BUTTON = 0
const RIGHT_BUTTON = 2

const flagsView = document.querySelector("#flags");
const field = document.querySelector("#field")
const gameModes = document.querySelector("#game-modes")
const resultMessage = document.querySelector("#result-message")
const restartButton = document.querySelector("#restart-button")
const resultContainer = document.querySelector("#result-container")

const viewModel = ViewModel();

let cellMatrix;

function start() {
    viewModel.setOnStateUpdateListener(onGameStateUpdate)

    gameModes.addEventListener("change", evt => {
        viewModel.setGameModeById(+evt.target.value)
    })

    restartButton.addEventListener("click", () => viewModel.restart())

    viewModel.setGameModeById(GameMode.MEDIUM.id)
}

function onGameStateUpdate(state) {
    updateField(state)
    updateGameModeSelector(state)
    updateFlagsView(state.flags)

    resultContainer.style.visibility = "hidden"

    if (isWin(state)) {
        onGameWon()
        return
    }

    if (isLose(state)) {
        let gameOverPoint = state.gameOverCellPoint

        onGameLost(gameOverPoint.x, gameOverPoint.y)
    }
}

function updateField(state) {
    cellMatrix = state.field.map((row, y) => {
        return row.map((content, x) => {
            let cell = createCell(x, y)

            updateCell(cell, content)

            return cell
        })
    })

    field.innerHTML = ""
    cellMatrix.forEach(it => field.appendChild(createRow(it)))
}

function createCell(x, y) {
    let cell = document.createElement("td")

    cell.classList.add("cell")

    cell.dataset.x = x
    cell.dataset.y = y

    cell.addEventListener("click", handleCellClick)
    cell.addEventListener("contextmenu", handleCellClick)

    return cell
}

function handleCellClick(event) {
    event.preventDefault()

    let cell = event.target

    let x = cell.dataset.x
    let y = cell.dataset.y

    if (event.button === LEFT_BUTTON) {
        viewModel.onCellLeftClick(x, y)
    } else if (event.button === RIGHT_BUTTON) {
        viewModel.onCellRightClick(x, y)
    }
}

function updateCell(cell, state) {
    if (state.flagged) {
        cell.classList.add("flagged")
    } else {
        cell.classList.remove("flagged")
    }

    if (!state.opened) {
        cell.classList.add("closed")
        return
    }

    cell.classList.remove("closed")

    if (isEmpty(state)) return

    if (isBomb(state)) {
        cell.classList.add("bomb")
        return
    }

    cell.style.color = chanceColorOf(state.value)
    cell.textContent = state.value
}

function createRow(columns) {
    let row = document.createElement("tr")
    row.classList.add("row")
    columns.forEach(it => row.appendChild(it))

    return row
}

function updateGameModeSelector(state) {
    gameModes.innerHTML = ""
    state.gameModes.forEach((gameMode, i) => {
        let option = document.createElement("option")

        option.value = gameMode.id
        option.textContent = gameMode.name

        gameModes.appendChild(option)
    })
    gameModes.value = state.selectedGameMode.id
}

function updateFlagsView(flags) {
    flagsView.textContent = `${flags} 🚩`
}

function onGameWon() {
    showMessage("Поздравляем! Вы выиграли! 🎉")
}

function onGameLost(triggerX, triggerY) {
    let triggeredCell = cellMatrix[triggerY][triggerX]
    triggeredCell.style.background = "red"

    showMessage("Вы проиграли :(")
}

function showMessage(msg) {
    resultContainer.style.visibility = "visible"
    resultMessage.textContent = msg
}

start()
