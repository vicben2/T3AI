import { selectGrid, resetBoard } from "./script.js"


const trainingOptionsElem = document.getElementById("trainingOptions")
const trainingStartBtnElem = document.getElementById("trainingStartBtn")
const aiLogElem = document.getElementById("aiLog")


let noAI = false
document.getElementById("pva").addEventListener("click", function () {
    resetBoard()
    noAI = false
    trainingOptionsElem.style.visibility = "hidden"
    aiLogElem.innerHTML += `<li>Records O: ${Object.keys(playerOrecord).length}</li>`
    aiLogElem.innerHTML += `<li>Records X: ${Object.keys(playerXrecord).length}</li>`
})
document.getElementById("avp").addEventListener("click", function () {
    resetBoard()
    aiLogElem.innerHTML += `<li>Records O: ${Object.keys(playerOrecord).length}</li>`
    aiLogElem.innerHTML += `<li>Records X: ${Object.keys(playerXrecord).length}</li>`
    trainingOptionsElem.style.visibility = "hidden"
    noAI = false
    const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const rand = random(0, cells.length - 1)
    selectGrid(null, cells[rand])
})
document.getElementById("pvp").addEventListener("click", function () {
    resetBoard()
    noAI = true
    trainingOptionsElem.style.visibility = "hidden"
})


window.addEventListener("playerSelectedGrid", aiSelectGrid)


let playerXrecord = JSON.parse(localStorage.getItem("playerX")) || {}
let playerOrecord = JSON.parse(localStorage.getItem("playerO")) || {}


function aiSelectGrid(e) {
    if (noAI) {
        return
    }

    //get all available moves
    let cells = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const gameState = e.detail.gameState.map(num => num).join('')
    cells = cells.filter((cell) => {
        return gameState.includes(cell) === false
    })
    let origCells = [...cells]

    //get records
    const records = e.detail.youAre === "O" ? playerOrecord : playerXrecord || {}
    let rand
    let toSelect = null

    //select winning move
    for (let i = 0; i < cells.length; i++) {
        const num = cells[i]
        if (hasKey(records, gameState + num) && records[gameState + num] === 1) {
            toSelect = num
            aiLogElem.innerHTML += `<li>Found winning move: ${gameState + toSelect}</li>`
            selectGrid(null, toSelect)
            return
        }
    }

    //if no winning move found, randomize move while avoiding a losing losing move
    rand = random(0, cells.length - 1)
    toSelect = cells[rand]
    cells = cells.filter(num => num !== toSelect)
    while (hasKey(records, gameState + toSelect) && records[gameState + toSelect] === -1) {
        const prevSelect = gameState + toSelect
        rand = random(0, cells.length - 1)
        toSelect = cells[rand]
        cells = cells.filter(num => num !== toSelect)

        //edge case where ai runs out of moves to avoid
        if (cells.length <= 0) {
            const currentGameState = Array.from(gameState, Number)
            recordGame(currentGameState, e.detail.youAre === "O" ? "X" : "O", [[currentGameState[currentGameState.length - 1]]], true, true)
            rand = random(0, origCells.length - 1)
            toSelect = origCells[rand]
            aiLogElem.innerHTML += `<li>Deadend: ${gameState}. New: ${gameState + toSelect}</li>`
            break
        }
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
    //if (game.winner === "none") {
    //    return
    //}
    noAI = true

    if (game.winningGrids.length > 1 || game.winner === "none") {
        recordGame(game.gameState, game.winner, game.winningGrids, false, false)
    }
    else {
        recordGame(game.gameState, game.winner, game.winningGrids, true, false)
    }

    if (trainingMode) {
        resetBoard()

        iteration -= 1
        if (iteration <= -1) {
            trainingMode = false
            localStorage.setItem("playerO", JSON.stringify(playerOrecord))
            localStorage.setItem("playerX", JSON.stringify(playerXrecord))
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


function recordGame(gameState, winner, winningGrids, shouldMutate, deadEnd) {
    if (gameState <= 1) {
        return
    }

    const translations = [
        [6, 3, 0, 7, 4, 1, 8, 5, 2],
        [8, 7, 6, 5, 4, 3, 2, 1, 0],
        [2, 5, 8, 1, 4, 7, 0, 3, 6],
        [2, 1, 0, 5, 4, 3, 8, 7, 6],
        [8, 5, 2, 7, 4, 1, 6, 3, 0],
        [6, 7, 8, 3, 4, 5, 0, 1, 2],
        [0, 3, 6, 1, 4, 7, 2, 5, 8]
    ]

    //add translations
    let translatedStates = []
    translatedStates.push({
        state: gameState,
        wg: winningGrids
    })
    translations.forEach(translationArr => {
        let newEquivalent = []
        let newWgEquivalent = []
        gameState.forEach(num => {
            newEquivalent.push(translationArr.indexOf(num))
        })
        winningGrids.forEach(wg => {
            let equiv = []
            wg.forEach(num => {
                equiv.push(translationArr.indexOf(num))
            })
            newWgEquivalent.push(equiv)
        });
        translatedStates.push({
            state: newEquivalent,
            wg: newWgEquivalent
        })
    })

    //add permutations
    if (shouldMutate) {
        //initialize
        let toMutate = []
        translatedStates.forEach(s => {
            let iEven = []
            let iOdd = []
            const wg = s.wg[0] || []
            const state = s.state

            state.forEach((num, index) => {
                if (index % 2 === 0) {
                    if (wg == null || wg.includes(num) === false) {
                        iEven.push(num)
                    }
                }
                else {
                    if (wg == null || wg.includes(num) === false) {
                        iOdd.push(num)
                    }
                }
            })
            wg.forEach(g => {
                let pO = [...iEven]
                if (winner === "O") {
                    pO = [...pO, ...wg]
                }
                pO = pO.filter(num => num !== g)

                let pX = [...iOdd]
                if (winner === "X") {
                    pX = [...pX, ...wg]
                }
                pX = pX.filter(num => num !== g)

                toMutate.push({
                    playerO: permute(pO),
                    playerX: permute(pX),
                    last: g
                })
            })
        });

        let winRecords = []
        let loseRecords = []

        toMutate.forEach(a => {
            a.playerO.forEach((pOArr) => {
                a.playerX.forEach((pXArr) => {
                    let winEquiv = []
                    let loseEquiv = []
                    pOArr.forEach((numO, i) => {
                        if (winner === "O") {
                            if (i === pOArr.length - 1) {
                                winEquiv.push(numO)
                                loseEquiv.push(numO)
                                winEquiv.push(pXArr[i])
                                loseEquiv.push(pXArr[i])
                                winEquiv.push(a.last)
                            }
                            else {
                                winEquiv.push(numO)
                                loseEquiv.push(numO)
                                winEquiv.push(pXArr[i])
                                loseEquiv.push(pXArr[i])
                            }
                        }
                        else if (winner === "X") {
                            if (i === pOArr.length - 1) {
                                winEquiv.push(numO)
                                loseEquiv.push(numO)
                                winEquiv.push(a.last)
                            }
                            else {
                                winEquiv.push(numO)
                                loseEquiv.push(numO)
                                winEquiv.push(pXArr[i])
                                loseEquiv.push(pXArr[i])
                            }
                        }
                        else {
                            if (i === pOArr.length - 1) {
                                winEquiv.push(numO)
                                winEquiv.push(pXArr[i])
                                winEquiv.push(a.last)
                            }
                            else {
                                winEquiv.push(numO)
                                winEquiv.push(pXArr[i])
                            }
                        }
                    })
                    winRecords.push(winEquiv)
                    if (loseEquiv.length > 0) {
                        loseRecords.push(loseEquiv)
                    }
                })

            })
        })

        if (winner === "O") {
            winRecords.forEach(record => {
                playerOrecord[record.map(num => num).join('')] = 1
            })
            loseRecords.forEach(record => {
                const str = record.map(num => num).join('')
                if (deadEnd === false || (deadEnd && hasKey(playerXrecord, str) === false)) {
                    playerXrecord[str] = -1
                }
            })
        }
        else if (winner === "X") {
            winRecords.forEach(record => {
                playerXrecord[record.map(num => num).join('')] = 1
            })
            loseRecords.forEach(record => {
                const str = record.map(num => num).join('')
                if (deadEnd === false || (deadEnd && hasKey(playerOrecord, str) === false)) {
                    playerOrecord[str] = -1
                }
            })
        }
    }
    else {
        if (winner === "O") {
            translatedStates.forEach(a => {
                playerOrecord[a.state.map(num => num).join('')] = 1
                a.state.pop()
                playerXrecord[a.state.map(num => num).join('')] = -1
            })
        }
        else if (winner === "X") {
            translatedStates.forEach(a => {
                playerXrecord[a.state.map(num => num).join('')] = 1
                a.state.pop()
                playerOrecord[a.state.map(num => num).join('')] = -1
            })
        }
        else {
            //draw
            //provide escape route
            translatedStates.forEach(a => {
                let record = a.state
                while (record.length > 1) {
                    const str = record.map(num => num).join('')
                    if (record.length % 2 === 0) {
                        playerXrecord[str] = 0
                    }
                    else {
                        playerOrecord[str] = 0
                    }
                    record.pop()
                }
            })
        }
    }

    if (trainingMode === false) {
        localStorage.setItem("playerO", JSON.stringify(playerOrecord))
        localStorage.setItem("playerX", JSON.stringify(playerXrecord))

        aiLogElem.innerHTML += `<li>New total records O: ${Object.keys(playerOrecord).length}</li>`
        aiLogElem.innerHTML += `<li>New total records X: ${Object.keys(playerXrecord).length}</li>`
    }
}


function permute(nums) {
    const result = [];
    function backtrack(start) {
        if (start === nums.length) {
            result.push(nums.slice());
            return;
        }
        for (let i = start; i < nums.length; i++) {
            [nums[start], nums[i]] = [nums[i], nums[start]];
            backtrack(start + 1);
            [nums[start], nums[i]] = [nums[i], nums[start]];
        }
    }
    backtrack(0);
    return result;
}