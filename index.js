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


function selectGrid(e, grid) {
    if(grid === null) {
        //player selection
        updateBoard(e.srcElement.id)
    }
    else {
        //ai selection
        updateBoard("g" + grid)
    }
}


let gridStr = "---------"
function updateBoard(grid) {
    if(gameOver) {
        return
    }

    const elem = document.getElementById(grid)
    if(elem.innerText !== "" && elem.classList.contains("gridHov") === false) {
        return
    }

    const gridNum = grid.match(/\d/)[0]
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

    elem.classList.remove("gridHov")
    if(gridsUsed >= 5) {
        gameOver = checkForWin(gridNum)
    }
    
    if(gridsUsed === 9 || gameOver) {
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
    let output = false
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
                    case 0: colorWinCells([0,1,2]); break
                    case 1: colorWinCells([3,4,5]); break
                    case 2: colorWinCells([6,7,8]); break
                    case 3: colorWinCells([0,3,6]); break
                    case 4: colorWinCells([1,4,7]); break
                    case 5: colorWinCells([2,5,8]); break
                    case 6: colorWinCells([0,4,8]); break
                    case 7: colorWinCells([2,4,6]); break
                    default: console.error("Something went wrong.")
                }
                output = true
            }
        });
    }
    else {
        toLoop.forEach((num) => {
            const regex = oWinStatesRegex[num]
            if(regex.test(gridStr)) {
                switch(num) {
                    case 0: colorWinCells([0,1,2]); break
                    case 1: colorWinCells([3,4,5]); break
                    case 2: colorWinCells([6,7,8]); break
                    case 3: colorWinCells([0,3,6]); break
                    case 4: colorWinCells([1,4,7]); break
                    case 5: colorWinCells([2,5,8]); break
                    case 6: colorWinCells([0,4,8]); break
                    case 7: colorWinCells([2,4,6]); break
                    default: console.error("Something went wrong.")
                }
                output = true
            }
        });
    }
    return output
}


function colorWinCells(arr) {
    arr.forEach(num => {
        const elem = document.getElementById("g" + num)
        elem.classList.add("gridWin")
    });
}


const resetButton = document.getElementById("resetButton")
resetButton.addEventListener("click", resetBoard)


function showReset() {
    resetButton.style.visibility = "visible"
}


function resetBoard() {
    gridsUsed = 0
    firstPlay = true
    gameOver = false
    gridStr = "---------"
    grids.forEach(grid => {
        grid.innerText = ""
        grid.classList.remove("gridHov", "gridWin")
    })
    resetButton.style.visibility = "hidden"
}