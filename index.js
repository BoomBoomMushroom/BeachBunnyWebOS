let topBar = document.getElementById("topBar")


// the clock
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

// window elements
let blockAppClickAfterDrag = false
let allWindowElements = document.getElementsByClassName("window")
for(let i=0; i<allWindowElements.length; i++){
    makeElementDraggable( allWindowElements[i], false )
}
function makeElementDraggable(element, isApp){
    let initX = 0
    let initY = 0
    let currentX = 0
    let currentY = 0

    let initStyleTop = ""
    let initStyleLeft = ""

    let headerElements = element.getElementsByClassName("header")
    if(headerElements.length > 0){
        for(let i=0; i<headerElements.length; i++){
            headerElements[i].onmousedown = startDragging;
        }
    }
    else{
        console.log("normal ele")
        element.onmousedown = startDragging;
    }


    function startDragging(e){
        e.preventDefault()
        initStyleTop = element.style.top
        initStyleLeft = element.style.left

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
        
        if(isApp == false){ return }
        // didn't move
        if(initStyleTop == element.style.top && initStyleLeft == element.style.left){ return }

        blockAppClickAfterDrag = true
    }
}

// Close window buttons
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


// make apps selectable
let lastTappedElement = null
let selectedApp = null
let lastTapTime = 0
let largestZIndex = 1

let allApps = document.getElementsByClassName("app")
for(let i=0; i<allApps.length; i++){
    makeElementDraggable(allApps[i], true)
    allApps[i].addEventListener("click", ()=>{
        tapApp(allApps[i])
    })
}

let appFunctions = {
    "openPlaylistBB": openPlaylistBB,
    "openWebrings": openWebringsApp
}

function tapApp(element){
    if(blockAppClickAfterDrag == true){
        blockAppClickAfterDrag = false
        return
    }

    let now = new Date().getTime();
    let dt = now - lastTapTime

    if(element == selectedApp){
        selectElement(null)
    }
    else{
        selectElement(element)
    }

    if(element == lastTappedElement && dt <= 500){
        // todo: open the app
        selectElement(null)

        appFunctions[element.getAttribute("onOpenApp")]()
        //console.log("open app")
    }
    
    lastTapTime = now
    lastTappedElement = element
}
function selectElement(element){
    if(selectedApp != null){
        selectedApp.classList.remove("selectedApp")
    }
    if(element != null){
        element.classList.add("selectedApp")
    }
    selectedApp = element
}
function makeGreatestZIndex(element){
    element.style.zIndex = largestZIndex
    largestZIndex++;
    topBar.style.zIndex = largestZIndex
}


// open app functions
function openPlaylistBB(){
    let windowElement = document.getElementById("playlistBB_window")

    makeGreatestZIndex(windowElement) // move to the top
    revealElement(windowElement)
}

function openWebringsApp(){
    let windowElement = document.getElementById("webrings_window")
    makeGreatestZIndex(windowElement) // move to the top
    revealElement(windowElement)
}