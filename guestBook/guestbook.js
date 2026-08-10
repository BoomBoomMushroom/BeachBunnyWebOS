let guestbookApiURL = "https://guestbook.sabrina.hackclub.app" // todo: replace w/ the server address
const guestbookFormEle = document.getElementById("guestbookSubmit")
const guestbookEntriesEle = document.getElementById("guestbookEntries")
let maxMessageToLoad = 50

//guestbookApiURL = "http://127.0.0.1:5000/" // for testing the guestbook before pushing to prod
updateGuestBookPostURL()


function updateGuestBookPostURL(){
    guestbookFormEle.action = guestbookApiURL + "/guestbookSubmit"
    getEntries()
}

function getEntries(){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function(){
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
            updateEntries(xmlHttp.responseText)
        }
    }
    xmlHttp.open("GET", guestbookApiURL + "/getGuestbook")
    xmlHttp.send(null)
}

function updateEntries(data){
    // remove all children
    while(guestbookEntriesEle.firstChild){ guestbookEntriesEle.removeChild(guestbookEntriesEle.lastChild) }

    data = JSON.parse(data)
    let endIndex = Math.min(data.length, maxMessageToLoad) // all the data, but we cap it at 50
    for(let i=0; i<endIndex; i++){
        let msgData = data[i]

        let entryElement = document.createElement("div")
        entryElement.classList.add("guestbookEntry")

        let titleElement = document.createElement("p")
        let isHref = "href=\""+ msgData.website +"\""
        if(msgData.website.length == 0){ isHref = "" }
        let timeStr = new Date(msgData.postEpoch * 1000).toLocaleString('se-SV', {hour12: false})
        titleElement.innerHTML = `<a ${isHref}>${msgData.name}</a> - ${timeStr}`

        let msgElement = document.createElement("p")
        msgElement.innerText = msgData.message

        guestbookEntriesEle.appendChild(entryElement)
        entryElement.append(titleElement)
        entryElement.append(msgElement)
    }
}