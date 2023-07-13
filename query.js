function GetURL(params) {
    let url = "https://azurlane.koumakan.jp/w/api.php?origin=*"
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
    return url
}

async function GetShipNames() {
    if (!sessionStorage.getItem("shipNames")) {
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

            if (!shipName.includes("Category:")) {
                shipNames.push(ship.title)
            }
        }

        if (!shipNames) {
            console.log("Ships could not be loaded.")
        }

        sessionStorage.setItem("shipNames", shipNames)
    }

    document.getElementById("generateRowButton").disabled = false
}

async function UpdateShip(shipName, elementID) {
    elementID = parseInt(elementID)

    if (!sessionStorage.getItem(shipName + "Reload125") || !sessionStorage.getItem(shipName + "Rarity")) {
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
        let reload = page.match(/Reload125 = ([0-9]+)/)[1]

        if (!reload) {
            console.log("Reload could not be loaded.")
        }

        sessionStorage.setItem(shipName + "Reload125", reload)

        let rarity = page.match(/Rarity = ([A-Za-z ]+)/)[1]

        if (!rarity) {
            console.log("Rarity could not be loaded.")
        }

        sessionStorage.setItem(shipName + "Rarity", rarity)
    }

    let shipReload = document.getElementById("shipReload" + elementID)
    shipReload.setAttribute("value", sessionStorage.getItem(shipName + "Reload125"))

    let shipImageBackground = document.getElementById("shipImageBackground" + elementID)
    let rarity = sessionStorage.getItem(shipName + "Rarity")

    if (rarity == "Ultra Rare" || rarity == "Decisive") {shipImageBackground.setAttribute('class', 'ultra_rare')}
    else if (rarity == "Super Rare" || rarity == "Priority") {shipImageBackground.setAttribute('class', 'super_rare')}
    else if (rarity == "Elite") {shipImageBackground.setAttribute('class', 'elite')}
    else if (rarity == "Rare") {shipImageBackground.setAttribute('class', 'rare')}
    else {shipImageBackground.setAttribute('class', 'common')}
}

async function UpdateShipImage(shipName, elementID) {
    elementID = parseInt(elementID)

    var params = {
        action: "query",
        format: "json",
        prop: "imageinfo",
        titles: shipName,
        generator: "images",
        iiprop: "url",
        gimlimit: 500
    }

    url = GetURL(params)

    fetch (url)
    .then(function(response) {
        return response.json()
    })
    .then(function(response) {
        let images = response.query.pages

        for (const key in images) {
            let title = images[key].title

            if (title.includes(shipName + "ShipyardIcon.png")) {
                let imageURL = images[key].imageinfo[0].url

                let icon = document.getElementById("shipImage" + elementID)
                icon.setAttribute("src", imageURL)
                break
            }
        }
    })
}

function GetWeaponNames() {
    var params = {
        action: "query",
        prop: "links",
        titles: "List of Battleship Guns",
        pllimit: 500,
        format: "json"
    }

    let url = GetURL(params)

    fetch (url)
    .then(function(response) {
        return response.json()
    })
    .then(function(response) {
        let weapons = response.query.pages[2004].links

        for (const weapon of weapons) {
            let weaponName = weapon.title

            if (weaponName.includes("Quadruple") || weaponName.includes("Triple") || weaponName.includes("Twin")) {
                weaponNames.push(weaponName)
            }
        }
    })
}

function UpdateWeapon(weaponName, elementID) {
    let i = parseInt(elementID)

    var params = {
        page: weaponName,
        action: "parse",
        prop: "wikitext",
        format: "json"
    }

    let url = GetURL(params)

    fetch (url)
    .then(function(response) {
        return response.json()
    })
    .then(function(response) {
        let page = response.parse.wikitext["*"]

        let reload = page.match(/RoFMax = ([0-9.]+)/)[1]
        let weaponReload = document.getElementById("weaponReload" + i)
        weaponReload.setAttribute("value", reload)

        let rarity = page.match(/Stars = ([0-9]+)/)[1]
        let weaponImageBackground = document.getElementById("weaponImageBackground" + i)

        if (rarity == "6") {weaponImageBackground.setAttribute('class', 'ultra_rare')}
        else if (rarity == "5") {weaponImageBackground.setAttribute('class', 'super_rare')}
        else if (rarity == "4") {weaponImageBackground.setAttribute('class', 'elite')}
        else if (rarity == "3") {weaponImageBackground.setAttribute('class', 'rare')}
        else {weaponImageBackground.setAttribute('class', 'common')}
    })

    var params = {
        action: "query",
        format: "json",
        prop: "imageinfo",
        titles: weaponName,
        generator: "images",
        iiprop: "url",
        gimlimit: 500
    }

    url = GetURL(params)

    fetch (url)
    .then(function(response) {
        return response.json()
    })
    .then(function(response) {
        let images = response.query.pages

        for (const key in images) {
            let title = images[key].title

            if (title.match(/File:[0-9]+.png/)) {
                let imageURL = images[key].imageinfo[0].url

                let icon = document.getElementById("weaponImage" + i)
                icon.setAttribute("src", imageURL)
                break
            }
        }
    })
}