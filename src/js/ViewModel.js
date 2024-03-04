const ViewModel = function () {
    let gameState = null;
    let bombsFlagged = 0;

    let areBombsGenerated = false;

    let stateUpdateListener = null;

    const getWidth = () => gameState.selectedGameMode.width
    const getHeight = () => gameState.selectedGameMode.height
    const getBombs = () => gameState.selectedGameMode.bombs
    
    function arrayOfCellState(size) {
        return Array.from({length: size}, () => cellStateOf(0, false))
    }

    function generateField(width, height) {
        return Array.from({length: height}, () => arrayOfCellState(width))
    }

    function getCellStateAt(x, y) {
        return gameState.field[y][x]
    }

    function generateBombs(amount, pointsToExclude) {
        function increaseChanceAround(centerX, centerY) {
            for (let y = centerY - 1; y <= centerY + 1; y++) {
                for (let x = centerX - 1; x <= centerX + 1; x++) {
                    if (y === centerY && x === centerX) continue
                    if (x < 0 || x >= getWidth()) continue
                    if (y < 0 || y >= getHeight()) continue
                    if (isBomb(getCellStateAt(x, y))) continue

                    getCellStateAt(x, y).value++
                }
            }
        }

        uniqueArray(getWidth() * getHeight())
            .filter(it => !pointsToExclude.includes(it))
            .slice(0, amount)
            .forEach(packedPoint => {
                let point = destructPoint(getWidth(), packedPoint)

                let x = point.x
                let y = point.y

                setBomb(getCellStateAt(x, y))
                increaseChanceAround(x, y)
            })
    }

    function getPackedPointsAround(centerX, centerY) {
        let points = []

        for (let y = centerY - 1; y <= centerY + 1; y++) {
            for (let x = centerX - 1; x <= centerX + 1; x++) {
                if (x < 0 || x >= getWidth()) continue
                if (y < 0 || y >= getHeight()) continue

                points.push(packPoint(getWidth(), x, y))
            }
        }

        return points
    }

    function openCellsAround(centerX, centerY) {
        let center = pointOf(+centerX, +centerY)

        let stack = [center]
        let checked = new Set()

        while (stack.length > 0) {
            let point = stack.pop()

            let cellState = getCellStateAt(point.x, point.y)

            cellState.opened = true

            if (cellState.flagged) {
                gameState.flags++
            }

            if (!isEmpty(cellState)) {
                continue
            }

            for (let y = point.y - 1; y <= point.y + 1; y++) {
                for (let x = point.x - 1; x <= point.x + 1; x++) {
                    if (x === point.x && y === point.y) continue
                    if (y < 0 || y >= getHeight()) continue
                    if (x < 0 || x >= getWidth()) continue

                    if (checked.has(packPoint(getWidth(), x, y))) continue

                    if (isBomb(getCellStateAt(x, y))) continue

                    if (getCellStateAt(x, y).opened) continue

                    checked.add(packPoint(getWidth(), x, y))
                    stack.push(pointOf(x, y))
                }
            }
        }
    }

    function onGameOver(triggerX, triggerY) {
        gameState.gameOverCellPoint = pointOf(triggerX, triggerY)
        gameState.gameOver = true
        openBombs()
    }

    function openBombs() {
        gameState.field
            .flat()
            .forEach(cell => {
                if (!isBomb(cell)) return
                if (cell.flagged) return

                cell.opened = true
            })
    }

    function onCellLeftClick(x, y) {
        if (gameState.gameOver) return;

        if (!areBombsGenerated) {
            generateBombs(getBombs(), getPackedPointsAround(+x, +y))
            areBombsGenerated = true
        }

        let state = getCellStateAt(x, y)

        if (state.flagged || state.opened) return

        if (isBomb(state)) {
            onGameOver(x, y)
        } else {
            openCellsAround(x, y)
        }

        checkWin()
        fireGameStateUpdatedEvent()
    }

    function onCellRightClick(x, y) {
        if (gameState.gameOver) return;

        let state = getCellStateAt(x, y)

        if (state.opened) return

        if (state.flagged) {
            gameState.flags++

            if (isBomb(state)) bombsFlagged--
        } else {
            gameState.flags--

            if (isBomb(state)) bombsFlagged++
        }

        state.flagged = !state.flagged

        checkWin()
        fireGameStateUpdatedEvent()
    }

    function checkWin() {
        if (bombsFlagged === getBombs() && gameState.flags === 0 && areAllCellsOpened()) {
            onGameWin()
        }
    }

    function areAllCellsOpened() {
        let allCells = getWidth() * getHeight()
        let openableCells = allCells - getBombs()

        return getOpenedCells() === openableCells
    }

    function getOpenedCells() {
        return gameState.field
            .flat()
            .filter(it => it.opened)
            .length
    }

    function onGameWin() {
        gameState.gameOver = true
        gameState.win = true
    }

    function fireGameStateUpdatedEvent() {
        if (stateUpdateListener === null) return

        stateUpdateListener(gameState)
    }

    function setOnStateUpdateListener(listener) {
        stateUpdateListener = listener
    }

    function setGameMode(gameMode) {
        gameState = gameStateOf(gameMode)
        
        gameState.field = generateField(getWidth(), getHeight())
        gameState.gameModes = getAllGameModes()

        bombsFlagged = 0
        areBombsGenerated = false
        
        fireGameStateUpdatedEvent()
    }

    function setGameModeById(id) {
        setGameMode(findGameModeById(id))
    }

    function restart() {
        if (gameState == null) return

        setGameMode(gameState.selectedGameMode)
    }

    return {
        restart: restart,
        setGameModeById: setGameModeById,
        onCellLeftClick: onCellLeftClick,
        onCellRightClick: onCellRightClick,
        setOnStateUpdateListener: setOnStateUpdateListener,
    }
}