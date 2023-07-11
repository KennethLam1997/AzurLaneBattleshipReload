let shipNames = []
let rows = 1

function ReloadTime(reloadStat, statBonus, weaponReloadTime) {
    return (weaponReloadTime * Math.sqrt(200 / (reloadStat * (1 + statBonus) + 100))).toFixed(2)
}

function WeaponReloadTime(reloadStat, statBonus, reload) {
    return (reload / Math.sqrt(200 / (reloadStat * (1 + statBonus) + 100))).toFixed(2)
}

function GetURL(params) {
    let url = "https://azurlane.koumakan.jp/w/api.php?origin=*"
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
    return url
}

function GetShipNames() {
    var params = {
        action: "query",
        list: "categorymembers",
        cmtitle: "Category:Battleships",
        cmlimit: 500,
        format: "json"
    }

    let url = GetURL(params)

    fetch (url)
    .then(function(response) {
        return response.json()
    })
    .then(function(response) {
        let pages = response.query.categorymembers

        for (const ship of pages) {
            let shipName = ship.title

            if (!shipName.includes("Category:")) {
                shipNames.push(ship.title)
            }
        }
    })
    .then(function(response) {
        document.getElementById("generateRowButton").disabled = false
    })
}

function UpdateShip(shipName, elementID) {
    let i = parseInt(elementID.match(/ship([0-9]+)/)[1])

    var params = {
        page: shipName,
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

        let reload = page.match(/Reload125 = ([0-9]+)/)[1]
        let shipReload = document.getElementById("shipReload" + i)
        shipReload.setAttribute("value", reload)

        let rarity = page.match(/Rarity = ([A-Za-z ]+)/)[1]
        let shipImageBackground = document.getElementById("shipImageBackground" + i)

        if (rarity == "Ultra Rare" || rarity == "Decisive") {shipImageBackground.setAttribute('class', 'ultra_rare')}
        else if (rarity == "Super Rare" || rarity == "Priority") {shipImageBackground.setAttribute('class', 'super_rare')}
        else if (rarity == "Elite") {shipImageBackground.setAttribute('class', 'elite')}
        else if (rarity == "Rare") {shipImageBackground.setAttribute('class', 'rare')}
        else {shipImageBackground.setAttribute('class', 'common')}
    })

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

                let icon = document.getElementById("shipImage" + i)
                icon.setAttribute("src", imageURL)
                break
            }
        }
    })
}

function Calculate() {
    let shipTable = document.getElementById("shipTable")

    for (let i = 1; shipTable.rows[i]; i++) {
        let shipReload = parseFloat(document.getElementById("shipReload" + i).value) || 0
        let statBonus = parseFloat(document.getElementById("statBonus" + i).value) / 100 || 0
        let weaponReload = parseFloat(document.getElementById("weaponReload" + i).value) || 0
        let cooldown = document.getElementById("cooldown" + i)

        cooldown.innerText = ReloadTime(shipReload, statBonus, weaponReload)
    }
}

function Optimize(currentRow) {
    let shipTable = document.getElementById("shipTable")
    const optimizeTarget = parseFloat(document.getElementById("cooldown" + currentRow).innerHTML)

    for (let i = 1; shipTable.rows[i]; i++) {
        if (i != currentRow) {
            let shipReload = parseFloat(document.getElementById("shipReload" + i).value) || 0
            let statBonus = parseFloat(document.getElementById("statBonus" + i).value) / 100 || 0
            let weaponReload = document.getElementById("weaponReload" + i)
            weaponReload.value = WeaponReloadTime(shipReload, statBonus, optimizeTarget)
        }
    }
}

function GenerateRow() {
    let shipTable = document.getElementById("shipTable")
    const row = document.createElement("tr")

    // Icon
    let cell = document.createElement("td")
    let div = document.createElement("div")
    div.setAttribute("id", "shipImageBackground" + rows)
    let image = document.createElement("img")
    image.setAttribute("id", "shipImage" + rows)
    div.appendChild(image)
    row.appendChild(div)

    // Ship name
    cell = document.createElement("td")
    let ship = document.createElement("select")
    ship.setAttribute("onchange", "UpdateShip(this.value, this.id)")
    ship.setAttribute("id", "ship" + rows)

    // Create the default option in dropdown
    let option = document.createElement("option")
    option.setAttribute('value', '')
    option.setAttribute('selected', '')
    option.setAttribute('disabled', '')
    option.setAttribute('hidden', '')
    let optionText = document.createTextNode("Choose here")
    option.appendChild(optionText)
    ship.appendChild(option)

    // Populate dropdown with ship names
    for (const name of shipNames) {
        option = document.createElement("option")
        option.setAttribute('value', name)

        optionText = document.createTextNode(name)
        option.appendChild(optionText)

        ship.appendChild(option)
    }

    cell.appendChild(ship)
    row.appendChild(cell)

    // Reload stat of specific ship.
    cell = document.createElement("td")
    let shipReload = document.createElement("input")
    shipReload.setAttribute("id", "shipReload" + rows)
    cell.appendChild(shipReload)
    row.appendChild(cell)

    // Stat bonuses for ships.
    cell = document.createElement("td")
    let statBonus = document.createElement("input")
    statBonus.setAttribute("id", "statBonus" + rows)
    cell.appendChild(statBonus)
    row.appendChild(cell)

    // Reload stat of specific weapon.
    cell = document.createElement("td")
    let weaponReload = document.createElement("input")
    weaponReload.setAttribute("id", "weaponReload" + rows)
    cell.appendChild(weaponReload)
    row.appendChild(cell)

    // Expected battleship cooldown
    cell = document.createElement("td")
    let cooldown = document.createElement("div")
    cooldown.setAttribute("id", "cooldown" + rows)
    cell.appendChild(cooldown)
    row.appendChild(cell)

    // Optimize weapon cooldowns to ship
    cell = document.createElement("td")
    let optimize = document.createElement("input")
    optimize.setAttribute("type", "button")
    optimize.setAttribute("onclick", "Optimize(" + rows + ")")
    optimize.setAttribute("value", "Optimize!")
    cell.appendChild(optimize)
    row.appendChild(cell)

    shipTable.appendChild(row)
    rows += 1
}

