const dbName = "azurlanedb"
const dbVersion = 2

function GetURL(params) {
    let url = "https://azurlane.koumakan.jp/w/api.php?origin=*"
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
    return url
}

async function GetShipNames() {
    if (sessionStorage.getItem("shipNames")) {
        document.getElementById("generateRowButton").disabled = false
        return
    }

    const params = {
        action: "query",
        list: "categorymembers",
        cmtitle: "Category:Battleships",
        cmlimit: 500,
        format: "json"
    }

    const url = GetURL(params)
    const response = await fetch(url)
    const json = await response.json()
    const pages = json.query.categorymembers
    let shipNames = []

    for (const ship of pages) {
        let shipName = ship.title

        if (!shipName.includes("Category:")) shipNames.push(ship.title)
    }

    if (!shipNames) console.log("Ships could not be loaded.")

    sessionStorage.setItem("shipNames", shipNames)
    document.getElementById("generateRowButton").disabled = false
}

function UpdateShipReloadRarity(reload, rarity, elementID) {
    let shipReload = document.getElementById("shipReload" + elementID)
    shipReload.setAttribute("value", reload)
    
    let shipImageBackground = document.getElementById("shipImageBackground" + elementID)

    if (rarity == "Ultra Rare" || rarity == "Decisive") {shipImageBackground.setAttribute('class', 'ultra_rare')}
    else if (rarity == "Super Rare" || rarity == "Priority") {shipImageBackground.setAttribute('class', 'super_rare')}
    else if (rarity == "Elite") {shipImageBackground.setAttribute('class', 'elite')}
    else if (rarity == "Rare") {shipImageBackground.setAttribute('class', 'rare')}
    else {shipImageBackground.setAttribute('class', 'common')}    
}

function UpdateShip(shipName, elementID) {
    elementID = parseInt(elementID)
    const request = indexedDB.open(dbName, dbVersion)

    request.onerror = (event) => console.log(event)

    request.onupgradeneeded = (event) => {
        const db = event.target.result
        db.createObjectStore("ships", {keyPath: "shipName"})
        db.createObjectStore("weapons", {keyPath: "weaponName"})
    }

    request.onsuccess = (event) => {
        const db = event.target.result;
        let transaction = db.transaction("ships", "readwrite")
        let objectStore = transaction.objectStore("ships")
        const shipRequest = objectStore.get(shipName)

        shipRequest.onerror = (event) => console.log(event)

        shipRequest.onsuccess = async (event) => {
            let ship = event.target.result

            if (ship != undefined && ship.reload != undefined && ship.rarity != undefined) {
                UpdateShipReloadRarity(ship.reload, ship.rarity, elementID)
                UpdateShipImage(shipName, elementID)
                return
            }

            if (ship == undefined) ship = {shipName: shipName}

            const params = {
                page: shipName,
                action: "parse",
                prop: "wikitext",
                format: "json"
            }
    
            const url = GetURL(params)
            const response = await fetch(url)
            const json = await response.json()
            let page = json.parse.wikitext["*"]
            ship.reload = page.match(/Reload125 = ([0-9]+)/)[1]
            ship.rarity = page.match(/Rarity = ([A-Za-z ]+)/)[1]
            
            if (!ship.reload || !ship.rarity) console.log("Ship details could not be loaded.")

            transaction = db.transaction("ships", "readwrite")
            objectStore = transaction.objectStore("ships")
            const shipUpdateRequest = objectStore.put(ship)

            shipUpdateRequest.onerror = (event) => console.log(event)

            shipUpdateRequest.onsuccess = (event) => {
                console.log("Entry updated for " + shipName)
                UpdateShipReloadRarity(ship.reload, ship.rarity, elementID)
                UpdateShipImage(shipName, elementID)
            }
        }
    }
}

function UpdateShipImage(shipName, elementID) {
    elementID = parseInt(elementID)
    const request = indexedDB.open(dbName, dbVersion)

    request.onerror = (event) => console.log(event)

    request.onupgradeneeded = (event) => {
        const db = event.target.result
        db.createObjectStore("ships", {keyPath: "shipName"})
        db.createObjectStore("weapons", {keyPath: "weaponName"})
    }

    request.onsuccess = (event) => {
        const db = event.target.result;
        let transaction = db.transaction("ships", "readwrite")
        let objectStore = transaction.objectStore("ships")
        const shipRequest = objectStore.get(shipName)

        shipRequest.onerror = (event) => console.log(event)

        shipRequest.onsuccess = async (event) => {
            let ship = event.target.result

            if (ship != undefined && ship.shipyardImageURL != undefined) {
                let icon = document.getElementById("shipImage" + elementID)
                icon.setAttribute("src", ship.shipyardImageURL)
                return
            }

            if (ship == undefined) ship = {shipName: shipName}
            
            const params = {
                action: "query",
                format: "json",
                prop: "imageinfo",
                titles: shipName,
                generator: "images",
                iiprop: "url",
                gimlimit: 500
            }
            
            let url = GetURL(params)
            let response = await fetch(url)
            let json = await response.json()
            let images = json.query.pages

            for (const key in images) {
                let title = images[key].title
    
                if (title.includes(shipName + "ShipyardIcon.png")) {
                    let imageURL = images[key].imageinfo[0].url

                    let icon = document.getElementById("shipImage" + elementID)
                    icon.setAttribute("src", imageURL)

                    ship.shipyardImageURL = imageURL

                    transaction = db.transaction("ships", "readwrite")
                    objectStore = transaction.objectStore("ships")
                    const shipUpdateRequest = objectStore.put(ship)

                    shipUpdateRequest.onerror = (event) => console.log(event)

                    shipUpdateRequest.onsuccess = (event) => {
                        console.log("Entry updated for " + shipName)
                    }   
                    
                    return                        
                }
            }
            
            console.log("Ship Image could not be loaded!")
        }
    }
}

async function GetWeaponNames() {
    if (sessionStorage.getItem("weaponNames")) return

    var params = {
        action: "query",
        prop: "links",
        titles: "List of Battleship Guns",
        pllimit: 500,
        format: "json"
    }

    let url = GetURL(params)
    let response = await fetch(url)
    let json = await response.json()
    let weapons = json.query.pages[2004].links
    let weaponNames = []

    for (const weapon of weapons) {
        let weaponName = weapon.title

        if (weaponName.includes("Quadruple") || weaponName.includes("Triple") || weaponName.includes("Twin")) {
            weaponNames.push(weaponName)
        }
    }

    sessionStorage.setItem("weaponNames", weaponNames)
}

function UpdateWeaponReloadRarity(reload, rarity, elementID) {
    let weaponReload = document.getElementById("weaponReload" + elementID)
    weaponReload.setAttribute("value", reload)

    let weaponImageBackground = document.getElementById("weaponImageBackground" + elementID)

    if (rarity == "6") {weaponImageBackground.setAttribute('class', 'ultra_rare')}
    else if (rarity == "5") {weaponImageBackground.setAttribute('class', 'super_rare')}
    else if (rarity == "4") {weaponImageBackground.setAttribute('class', 'elite')}
    else if (rarity == "3") {weaponImageBackground.setAttribute('class', 'rare')}
    else {weaponImageBackground.setAttribute('class', 'common')}    
}

function UpdateWeapon(weaponName, elementID) {
    elementID = parseInt(elementID)
    const request = indexedDB.open(dbName, dbVersion)

    request.onerror = (event) => console.log(event)

    request.onupgradeneeded = (event) => {
        const db = event.target.result
        db.createObjectStore("ships", {keyPath: "shipName"})
        db.createObjectStore("weapons", {keyPath: "weaponName"})
    }

    request.onsuccess = (event) => {
        const db = event.target.result;
        let transaction = db.transaction("weapons", "readwrite")
        let objectStore = transaction.objectStore("weapons")
        const weaponRequest = objectStore.get(weaponName)

        weaponRequest.onerror = (event) => console.log(event)

        weaponRequest.onsuccess = async (event) => {
            let weapon = event.target.result

            if (weapon != undefined && weapon.reload != undefined && weapon.rarity != undefined) {
                UpdateWeaponReloadRarity(weapon.reload, weapon.rarity, elementID)
                UpdateWeaponImage(weaponName, elementID)
                return
            }

            if (weapon == undefined) weapon = {weaponName: weaponName}

            const params = {
                page: weaponName,
                action: "parse",
                prop: "wikitext",
                format: "json"
            }

            let url = GetURL(params)
            let response = await fetch(url)
            let json = await response.json()
            let page = json.parse.wikitext["*"]
            weapon.reload = page.match(/RoFMax = ([0-9.]+)/)[1]
            weapon.rarity = page.match(/Stars = ([0-9]+)/)[1]

            if (!weapon.reload || !weapon.rarity) console.log("Weapon details could not be loaded.")

            transaction = db.transaction("weapons", "readwrite")
            objectStore = transaction.objectStore("weapons")
            const weaponUpdateRequest = objectStore.put(weapon)

            weaponUpdateRequest.onerror = (event) => console.log(event)

            weaponUpdateRequest.onsuccess = (event) => {
                console.log("Entry updated for " + weaponName)
                UpdateWeaponReloadRarity(weapon.reload, weapon.rarity, elementID)
                UpdateWeaponImage(weaponName, elementID)
            }
        }
    }
}

function UpdateWeaponImage(weaponName, elementID) {
    elementID = parseInt(elementID)
    const request = indexedDB.open(dbName, dbVersion)

    request.onerror = (event) => console.log(event)

    request.onupgradeneeded = (event) => {
        const db = event.target.result
        db.createObjectStore("ships", {keyPath: "shipName"})
        db.createObjectStore("weapons", {keyPath: "weaponName"})
    }

    request.onsuccess = (event) => {
        const db = event.target.result;
        let transaction = db.transaction("weapons", "readwrite")
        let objectStore = transaction.objectStore("weapons")
        const weaponRequest = objectStore.get(weaponName)

        weaponRequest.onerror = (event) => console.log(event)

        weaponRequest.onsuccess = async (event) => {
            let weapon = event.target.result

            if (weapon != undefined && weapon.weaponImage != undefined) {
                let icon = document.getElementById("weaponImage" + elementID)
                icon.setAttribute("src", weapon.weaponImage)
                return                
            }

            if (weapon == undefined) weapon = {weaponName: weaponName}

            let params = {
                action: "query",
                format: "json",
                prop: "imageinfo",
                titles: weaponName,
                generator: "images",
                iiprop: "url",
                gimlimit: 500
            }

            url = GetURL(params)
            let response = await fetch(url)
            let json = await response.json()
            let images = json.query.pages

            for (const key in images) {
                let title = images[key].title

                if (title.match(/File:[0-9]+.png/)) {
                    weapon.weaponImage = images[key].imageinfo[0].url

                    let icon = document.getElementById("weaponImage" + elementID)
                    icon.setAttribute("src", weapon.weaponImage)

                    transaction = db.transaction("weapons", "readwrite")
                    objectStore = transaction.objectStore("weapons")
                    const weaponUpdateRequest = objectStore.put(weapon)

                    weaponUpdateRequest.onerror = (event) => console.log(event)
                    weaponUpdateRequest.onsuccess = (event) => {
                        console.log("Entry updated for " + weaponName)
                    }

                    return
                }
            }

            console.log("Weapon Image could not be loaded!")
        }
    }
}