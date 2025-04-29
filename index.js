const grids = document.querySelectorAll(".grid")


grids.forEach(grid => {
    grid.addEventListener("click", (e) => selectGrid(e, null))
})


let firstPlay = true
let gridsUsed = 0


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


function updateBoard(grid) {
    const elem = document.getElementById(grid)
    if(elem.innerText !== "") {
        return
    }

    if(firstPlay) {
        elem.innerText = "O"
    }
    else {
        elem.innerText = "X"
    }
    firstPlay = !firstPlay
    gridsUsed += 1

    checkForWin()
    
    if(gridsUsed === 9) {
        showReset()
    }
}


function checkForWin() {
    
}


const resetButton = document.getElementById("resetButton")
resetButton.addEventListener("click", resetBoard)


function showReset() {
    resetButton.style.visibility = "visible"
}


function resetBoard() {
    gridsUsed = 0
    firstPlay = true
    grids.forEach(grid => {
        grid.innerText = ""
    })
    resetButton.style.visibility = "hidden"
}