let topBarTimeElement = document.getElementById("topBarTime")
let topBarTimeInterval = null
function startPreciseClock() {
    const now = new Date();
    const delay = 1000 - now.getMilliseconds();
    let timeStr = now.toLocaleString('en-US', {hour12: false})
    timeStr = timeStr.replace(",", "")
    topBarTimeElement.innerText = timeStr

    topBarTimeInterval = setTimeout(startPreciseClock, delay)
}

startPreciseClock();

let allWindowElements = document.getElementsByClassName("window")
for(let i=0; i<allWindowElements.length; i++){
    makeElementDraggable( allWindowElements[i] )
}
function makeElementDraggable(element){
    let initX = 0
    let initY = 0
    let currentX = 0
    let currentY = 0

    let headerElements = element.getElementsByClassName("header")
    if(headerElements.length > 0){
        for(let i=0; i<headerElements.length; i++){
            console.log(headerElements[i])
            headerElements[i].onmousedown = startDragging;
        }
    }
    else{
        console.log("normal ele")
        element.onmousedown = startDragging;
    }


    function startDragging(e){
        e.preventDefault()
        initX = e.clientX;
        initY = e.clientY;
        document.onmouseup = stopDragging;
        document.onmousemove = dragElement;
    }

    function dragElement(e){
        e.preventDefault();
        currentX = initX - e.clientX;
        currentY = initY - e.clientY;
        initX = e.clientX;
        initY = e.clientY;
        element.style.top = (element.offsetTop - currentY) + "px";
        element.style.left = (element.offsetLeft - currentX) + "px";
    }

     function stopDragging() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


let allCloseWindowButtons = document.getElementsByClassName("closeWindow")
for(let i=0; i<allCloseWindowButtons.length; i++){
    allCloseWindowButtons[i].addEventListener("click", ()=>{
        let windowElement = allCloseWindowButtons[i].parentElement.parentElement
        hideElement(windowElement)
    })
}

function hideElement(element){
    element.classList.add("hidden")
}
function revealElement(element){
    element.classList.remove("hidden")
}
