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
        gameOver = checkForWin()
    }
    
    if(gridsUsed === 9 || gameOver) {
        gameOver = true
        showReset()
    }
}


const oWinStatesRegex = [
    /OOO....../,
    /...OOO.../,
    /......OOO/,
    /O..O..O../,
    /.O..O..O./,
    /..O..O..O/,
    /O...O...O/,
    /..O.O.O../
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
function checkForWin() {
    let output = false
    if(firstPlay) {
        xWinStatesRegex.forEach((regex, index) => {
            if(regex.test(gridStr)) {
                switch(index) {
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
                console.log(regex)
                console.log(gridStr)
            }
        });
    }
    else {
        oWinStatesRegex.forEach((regex, index) => {
            if(regex.test(gridStr)) {
                switch(index) {
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
                console.log(regex)
                console.log(gridStr)
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