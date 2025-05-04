import { selectGrid, resetBoard } from "./script.js"


export const playersElem = document.getElementById("players")
const trainingOptionsElem = document.getElementById("trainingOptions")
const trainingStartBtnElem = document.getElementById("trainingStartBtn")
const aiLogElem = document.getElementById("aiLog")


window.addEventListener("load", function () {
    playersElem.selectedIndex = 0
})


playersElem.addEventListener("change", function (e) {
    resetBoard()
    const selected = e.target.value
    if (selected === "aiVsAi") {
        trainingOptionsElem.style.visibility = "visible"
    }
    else if (selected === "aiVsPlayer") {
        const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        const rand = random(0, cells.length - 1)
        selectGrid(null, cells[rand])
    }
    else {
        trainingOptionsElem.style.visibility = "hidden"
    }
})


window.addEventListener("playerSelectedGrid", aiSelectGrid)


function aiSelectGrid(e) {
    let cells = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const gameState = e.detail.gameState.map(num => num).join('')
    const currentPlayer = "player" + e.detail.youAre
    cells = cells.filter((cell) => {
        return gameState.includes(cell) === false
    })

    const records = JSON.parse(localStorage.getItem(currentPlayer)) || {}
    let rand
    let toSelect

    //select winning move
    cells.forEach(num => {
        if(hasKey(records, gameState + num) && records[gameState + toSelect] === 1) {
            toSelect = num
            aiLogElem.innerHTML += `<li>Found winning move: ${gameState + toSelect}</li>`
            selectGrid(null, toSelect)
            return
        }
    })

    //randomize
    rand = random(0, cells.length - 1)
    toSelect = cells[rand]
    cells = cells.filter(num => num !== toSelect)

    //avoid losing move
    while(hasKey(records, gameState + toSelect) && records[gameState + toSelect] === -1) {
        const prevSelect = gameState + toSelect
        rand = random(0, cells.length - 1)
        toSelect = cells[rand]
        cells = cells.filter(num => num !== toSelect)
        aiLogElem.innerHTML += `<li>Avoided: ${prevSelect}. New: ${gameState + toSelect}</li>`
    }
    selectGrid(null, toSelect)
}


function hasKey(obj, key) {
    return obj.hasOwnProperty(key);
}


function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


window.addEventListener("gameOver", function (e) {
    const game = e.detail
    let playerO = JSON.parse(localStorage.getItem("playerO")) || {}
    let playerX = JSON.parse(localStorage.getItem("playerX")) || {}

    const allEquivalentStates = getEquivalentStates(game.gameState, 1)
    const allEquivalentStatesUnc = getEquivalentStates(game.gameState, 0)

    if (game.winner === "O") {
        for (let i = 0; i < allEquivalentStates.length; i++) {
            playerX[allEquivalentStates[i]] = -1
            playerO[allEquivalentStatesUnc[i]] = 1
        }
    }
    else if (game.winner === "X") {
        for (let i = 0; i < allEquivalentStates.length; i++) {
            playerO[allEquivalentStates[i]] = -1
            playerX[allEquivalentStatesUnc[i]] = 1
        }
    }
    else {
        for (let i = 0; i < allEquivalentStates.length; i++) {
            playerO[allEquivalentStates[i]] = 0
        }
        for (let i = 0; i < allEquivalentStates.length; i++) {
            playerX[allEquivalentStates[i]] = 0
        }
    }

    localStorage.setItem("playerO", JSON.stringify(playerO))
    localStorage.setItem("playerX", JSON.stringify(playerX))

    allEquivalentStates.forEach(state => {
        aiLogElem.innerHTML += `<li>Recorded state: ${state} - ${game.gameOverType}</li>`
    })

    if(trainingMode) {
        resetBoard()

        iteration -= 1
        if(iteration <= -1) {
            trainingMode = false
            return
        }

        const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        const rand = random(0, cells.length - 1)
        selectGrid(null, cells[rand])
    }
})


let trainingMode = false
let iteration = 0
trainingStartBtnElem.addEventListener("click", function () {
    trainingMode = true
    const iterationElem = document.getElementById("trainIterationInput")
    iteration = iterationElem.value
    trainingOptionsElem.style.visibility = "hidden"

    const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const rand = random(0, cells.length - 1)
    selectGrid(null, cells[rand])
})


window.addEventListener("aiSelectedGrid", function (e) {
    if(trainingMode === false) {
        return
    }
    aiSelectGrid(e)
})


function getEquivalentStates(gameState, cut) {
    const translations = [
        [6, 3, 0, 7, 4, 1, 8, 5, 2],
        [8, 7, 6, 5, 4, 3, 2, 1, 0],
        [2, 5, 8, 1, 4, 7, 0, 3, 6],
        [2, 1, 0, 5, 4, 3, 8, 7, 6],
        [8, 5, 2, 7, 4, 1, 6, 3, 0],
        [6, 7, 8, 3, 4, 5, 0, 1, 2],
        [0, 3, 6, 1, 4, 7, 2, 5, 8]
    ]

    let equivalentStates = []
    equivalentStates.push(gameState.map((num, index) => {
        if (index < gameState.length - cut) {
            return num
        }
    }).join(''))

    translations.forEach(translationArr => {
        let newEquivalent = []
        gameState.forEach(num => {
            newEquivalent.push(translationArr.indexOf(num))
        })
        equivalentStates.push(newEquivalent.map((num, index) => {
            if (index < gameState.length - cut) {
                return num
            }
        }).join(''))
    })

    return equivalentStates
}