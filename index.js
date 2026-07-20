let topBar = document.getElementById("topBar")


// the clock
let topBarTimeElement = document.getElementById("topBarTime")
let topBarTimeInterval = null
function startPreciseClock() {
    const now = new Date();
    const delay = 1000 - now.getMilliseconds();
    let timeStr = now.toLocaleString('se-SV', {hour12: false}) // Swedish time format :D
    timeStr = timeStr.replace(",", "") // only needed for en-US locale
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
        element.onmousedown = startDragging;
    }

    if(isApp == false){
        element.onmousedown = (e)=>{ makeGreatestZIndex(element); }
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

        let newY = element.offsetTop - currentY
        let newX = element.offsetLeft - currentX
        element.style.top = newY + "px";
        element.style.left = newX + "px";
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
    // I actually dont like how I can drag the apps, I just don't really like it
    //makeElementDraggable(allApps[i], true)
    allApps[i].addEventListener("click", ()=>{
        tapApp(allApps[i])
    })
}

let appFunctions = {
    "openPlaylistBB": openPlaylistBB,
    "openWebrings": openWebringsApp,
    "openAboutMe": openAboutMe,
    "openNetNeighbors": openNetNeighbors,
    "openGuestBook": openGuestBook,
    "openVisitorCount": openVisitorCount,
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
        now = 0 // prevent spam clicking from opening an app a bajillion times
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

    // i've decided i dont like this feature, bye bye ms feature!
    /*
    let appIconElement = document.getElementById("openPlaylistAppDiv").getElementsByTagName("img")[0]
    let newIcons = ["./wallpapers/emotionalCreature.jpg", "./wallpapers/honeymoon.jpg", "./wallpapers/promQueen.jpg", "./wallpapers/tunnelVision.jpg", "./wallpapers/yearOfTheOptimist.jpg", ]
    let i = Math.floor(Math.random() * newIcons.length)
    appIconElement.src = newIcons[i]
    */
}

function openWebringsApp(){
    let windowElement = document.getElementById("webrings_window")
    makeGreatestZIndex(windowElement) // move to the top
    revealElement(windowElement)
}

function openAboutMe(){
    let windowElement = document.getElementById("aboutMe_window")
    makeGreatestZIndex(windowElement) // move to the top
    revealElement(windowElement)
}

function openNetNeighbors(){
    let windowElement = document.getElementById("netNeighbors_window")
    makeGreatestZIndex(windowElement) // move to the top
    revealElement(windowElement) 
}

function openGuestBook(){
    let windowElement = document.getElementById("guestbook_window")
    makeGreatestZIndex(windowElement)
    revealElement(windowElement) 
}

function openVisitorCount(){
    let windowElement = document.getElementById("visitorCount_window")
    makeGreatestZIndex(windowElement)
    revealElement(windowElement) 
}

document.addEventListener("mousedown",(e)=>{
    if (event.target != document.body && event.target != document.documentElement) { return }

    selectElement(null)
})

// todo: add a loading screen
