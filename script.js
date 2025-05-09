const grids = document.querySelectorAll(".grid")
grids.forEach(grid => {
    grid.addEventListener("click", (e) => selectGrid(e, null))
    grid.addEventListener("mouseenter", function(e) {
        const cGrid = e.target.id
        const elem = document.getElementById(cGrid)
        if(elem.innerText !== "") {
            return
        }
        
        if(firstPlay) {
            elem.innerText = "O"
        }
        else {
            elem.innerText = "X"
        }

        elem.classList.add("gridHov")
    })
    grid.addEventListener("mouseleave", function(e) {
        const cGrid = e.target.id
        const elem = document.getElementById(cGrid)
        if(elem.classList.contains("gridHov")) {
            elem.innerText = ""
            elem.classList.remove("gridHov")
        }
    })
})


let firstPlay = true
let gridsUsed = 0
let gameOver = false


export function selectGrid(e, grid) {
    if(grid === null) {
        //player selection
        if(gameOver || window.getComputedStyle(resetButton).visibility === "visible") {
            return
        }
        const elem = document.getElementById(e.srcElement.id)
        if(elem.innerText !== "" && elem.classList.contains("gridHov") === false) {
            return
        }

        updateBoard(e.srcElement.id)
        const event = new CustomEvent("playerSelectedGrid", {
            detail: {
                gameState: gameState,
                youAre: firstPlay ? "O" : "X"
            }
        })
        window.dispatchEvent(event)
    }
    else {
        //ai selection
        updateBoard("g" + grid)
    }
}


let gridStr = "---------"
let gameState = []
function updateBoard(grid) {
    if(gameOver) {
        return
    }

    const elem = document.getElementById(grid)
    if(elem.innerText !== "" && elem.classList.contains("gridHov") === false) {
        return
    }

    const gridNum = grid.match(/\d/)[0]
    gameState.push(parseInt(gridNum))
    const regex = new RegExp(`(?<=.{${gridNum}}).`)

    if(firstPlay) {
        elem.innerText = "O"
        gridStr = gridStr.replace(regex, "O")
    }
    else {
        elem.innerText = "X"
        gridStr = gridStr.replace(regex, "X")
    }
    firstPlay = !firstPlay
    gridsUsed += 1

    let win
    elem.classList.remove("gridHov")
    if(gridsUsed >= 5) {
        win = checkForWin(gridNum)
        gameOver = win.isOver
    }
    
    if(gridsUsed === 9 || gameOver) {
        const event = new CustomEvent("gameOver", {
            detail: {
                winner: gameOver === false ? "none" : firstPlay ? "X" : "O",
                gameState: gameState,
                winningGrids: win.winningGrids
            }
        })
        window.dispatchEvent(event)
        gameOver = true
        showReset()
    }
}


const oWinStatesRegex = [
    /OOO....../, //0
    /...OOO.../, //1
    /......OOO/, //2
    /O..O..O../, //3
    /.O..O..O./, //4
    /..O..O..O/, //5
    /O...O...O/, //6
    /..O.O.O../ //7
]
const xWinStatesRegex = [
    /XXX....../,
    /...XXX.../,
    /......XXX/,
    /X..X..X../,
    /.X..X..X./,
    /..X..X..X/,
    /X...X...X/,
    /..X.X.X../
]
function checkForWin(gridNum) {
    let output = { isOver: false, winningGrids: [] }
    let toLoop

    switch(parseInt(gridNum)) {
        case 0: toLoop = [0,3,6]; break
        case 1: toLoop = [0,4]; break
        case 2: toLoop = [0,5,7]; break
        case 3: toLoop = [1,3]; break
        case 4: toLoop = [1,4,6,7]; break
        case 5: toLoop = [1,5]; break
        case 6: toLoop = [2,3,7]; break
        case 7: toLoop = [2,4]; break
        case 8: toLoop = [2,5,6]; break
        default: console.error("Something went wrong: gridnum")
    }

    if(firstPlay) {
        toLoop.forEach((num) => {
            const regex = xWinStatesRegex[num]
            if(regex.test(gridStr)) {
                switch(num) {
                    case 0: output.winningGrids.push([0,1,2]); colorWinCells([0,1,2]); break
                    case 1: output.winningGrids.push([3,4,5]); colorWinCells([3,4,5]); break
                    case 2: output.winningGrids.push([6,7,8]); colorWinCells([6,7,8]); break
                    case 3: output.winningGrids.push([0,3,6]); colorWinCells([0,3,6]); break
                    case 4: output.winningGrids.push([1,4,7]); colorWinCells([1,4,7]); break
                    case 5: output.winningGrids.push([2,5,8]); colorWinCells([2,5,8]); break
                    case 6: output.winningGrids.push([0,4,8]); colorWinCells([0,4,8]); break
                    case 7: output.winningGrids.push([2,4,6]); colorWinCells([2,4,6]); break
                    default: console.error("Something went wrong.")
                }
                output.isOver = true
            }
        });
    }
    else {
        toLoop.forEach((num) => {
            const regex = oWinStatesRegex[num]
            if(regex.test(gridStr)) {
                switch(num) {
                    case 0: output.winningGrids.push([0,1,2]); colorWinCells([0,1,2]); break
                    case 1: output.winningGrids.push([3,4,5]); colorWinCells([3,4,5]); break
                    case 2: output.winningGrids.push([6,7,8]); colorWinCells([6,7,8]); break
                    case 3: output.winningGrids.push([0,3,6]); colorWinCells([0,3,6]); break
                    case 4: output.winningGrids.push([1,4,7]); colorWinCells([1,4,7]); break
                    case 5: output.winningGrids.push([2,5,8]); colorWinCells([2,5,8]); break
                    case 6: output.winningGrids.push([0,4,8]); colorWinCells([0,4,8]); break
                    case 7: output.winningGrids.push([2,4,6]); colorWinCells([2,4,6]); break
                    default: console.error("Something went wrong.")
                }
                output.isOver = true
            }
        });
    }
    if(output.winningGrids.length === 0) {
        output.winningGrids.push([parseInt(gridNum)])
    }
    return output
}


function colorWinCells(arr) {
    arr.forEach(num => {
        const elem = document.getElementById("g" + num)
        elem.classList.add("gridWin")
    });
}


function showReset() {
    resetButton.style.visibility = "visible"
}


const aiLogElem = document.getElementById("aiLog")
export function resetBoard() {
    gridsUsed = 0
    firstPlay = true
    gameOver = false
    gridStr = "---------"
    gameState = []
    grids.forEach(grid => {
        grid.innerText = ""
        grid.classList.remove("gridHov", "gridWin")
    })
    aiLogElem.innerHTML = ""
    resetButton.style.visibility = "hidden"
}