let rows = 1

function ReloadTime(reloadStat, statBonus, weaponReloadTime) {
    return (weaponReloadTime * Math.sqrt(200 / (reloadStat * (1 + statBonus) + 100))).toFixed(2)
}

function WeaponReloadTime(reloadStat, statBonus, reload) {
    return (reload / Math.sqrt(200 / (reloadStat * (1 + statBonus) + 100))).toFixed(2)
}

function OathBonus(elementID) {
    let i = parseInt(elementID)
    let oathBonus = document.getElementById("oathBonus" + i)
    let shipReload = document.getElementById("shipReload" + i)

    if (shipReload.value) {
        if (oathBonus.checked == true) {
            shipReload.value = (shipReload.value / 1.06 * 1.12).toFixed(2)
        }
        else {
            shipReload.value = (shipReload.value / 1.12 * 1.06).toFixed(2)
        }
    }
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

function GenerateShipImage(Row) {
    const Cell = document.createElement("td")
    let div = document.createElement("div")
    div.setAttribute("id", "shipImageBackground" + rows)
    let image = document.createElement("img")
    image.setAttribute("id", "shipImage" + rows)
    div.appendChild(image)
    Cell.appendChild(div)
    Row.appendChild(Cell)
}

function GenerateShipInfo(Row) {
    const Cell = document.createElement("td")
    Cell.setAttribute("style", "text-align:center")
    Cell.innerHTML += "<b>Name:</b> "

    let ship = document.createElement("select")
    ship.setAttribute("onchange", "UpdateShip(this.value, " + rows + ")")
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
    for (const name of sessionStorage.getItem("shipNames").split(",")) {
        option = document.createElement("option")
        option.setAttribute('value', name)

        optionText = document.createTextNode(name)
        option.appendChild(optionText)

        ship.appendChild(option)
    }

    Cell.appendChild(ship)
    Cell.innerHTML += "<br>"

    // Reload stat of specific ship.
    Cell.innerHTML += "<b>Reload: </b> "
    let shipReload = document.createElement("input")
    shipReload.setAttribute("id", "shipReload" + rows)
    Cell.appendChild(shipReload)
    Cell.innerHTML += "<br>"

    // Stat bonuses for ships.
    Cell.innerHTML += "<b>Stat bonus (%): </b>"
    let statBonus = document.createElement("input")
    statBonus.setAttribute("id", "statBonus" + rows)
    Cell.appendChild(statBonus)
    Cell.innerHTML += "<br>"

    // Oath bonuses for ships.
    Cell.innerHTML += "<b>Oathed?: </b>"
    let oathBonus = document.createElement("input")
    oathBonus.setAttribute("id", "oathBonus" + rows)
    oathBonus.setAttribute("type", "checkbox")
    oathBonus.setAttribute("onclick", "OathBonus(" + rows + ")")
    Cell.appendChild(oathBonus)

    Row.appendChild(Cell)
}

function GenerateWeaponImage(Row) {
    const Cell = document.createElement("td")
    let div = document.createElement("div")
    div.setAttribute("id", "weaponImageBackground" + rows)
    let image = document.createElement("img")
    image.setAttribute("id", "weaponImage" + rows)
    image.setAttribute("width", "128")
    image.setAttribute("height", "128")
    div.appendChild(image)
    Cell.appendChild(div)
    Row.appendChild(Cell)
}

function GenerateWeaponInfo(Row) {
    const Cell = document.createElement("td")
    Cell.setAttribute("style", "text-align:center")
    Cell.innerHTML += "<b>Name:</b> "

    let weapon = document.createElement("select")
    weapon.setAttribute("onchange", "UpdateWeapon(this.value, " + rows + ")")
    weapon.setAttribute("id", "weapon" + rows)

    // Create the default option in dropdown
    let option = document.createElement("option")
    option.setAttribute('value', '')
    option.setAttribute('selected', '')
    option.setAttribute('disabled', '')
    option.setAttribute('hidden', '')
    let optionText = document.createTextNode("Choose here")
    option.appendChild(optionText)
    weapon.appendChild(option)

    // Populate dropdown with weapon names
    for (const name of sessionStorage.getItem("weaponNames").split(",")) {
        option = document.createElement("option")
        option.setAttribute('value', name)

        optionText = document.createTextNode(name)
        option.appendChild(optionText)

        weapon.appendChild(option)
    }

    Cell.appendChild(weapon)
    Cell.innerHTML += "<br>"

    // Reload stat of specific weapon.
    Cell.innerHTML += "<b>Reload: </b>"
    let weaponReload = document.createElement("input")
    weaponReload.setAttribute("id", "weaponReload" + rows)
    Cell.appendChild(weaponReload)

    Row.appendChild(Cell)
}

function GenerateCooldown(Row) {
    // Expected battleship cooldown
    const Cell = document.createElement("td")
    let cooldown = document.createElement("div")
    cooldown.setAttribute("id", "cooldown" + rows)
    Cell.appendChild(cooldown)
    Row.appendChild(Cell)
}

function GenerateRow() {
    const ShipTable = document.getElementById("shipTable")
    const Row = document.createElement("tr")

    GenerateShipImage(Row)
    GenerateShipInfo(Row)
    GenerateWeaponImage(Row)
    GenerateWeaponInfo(Row)
    GenerateCooldown(Row)

    ShipTable.appendChild(Row)
    rows += 1
}