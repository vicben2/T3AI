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
    if(elem.innerText !== "" && elem.classList.contains("gridHov") === false) {
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

    elem.classList.remove("gridHov")
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