import { Component } from "react"

const DB_NAME = "azurlanedb"
const DB_VERSION = 2
const RARITY_MAP = { 
    '6': 'ultra_rare',
    '5': 'super_rare',
    '4': 'elite',
    '3': 'rare',
    '2': 'common'
}

class Ship {
    constructor(
        name = '', 
        rarity = '', 
        imgsrc = '', 
        reload125 = '', 
        statBonus = '', 
        oathed = ''
    ) {
        this.name = name
        this.rarity = rarity
        this.imgsrc = imgsrc
        this.reload125 = reload125
        this.statBonus = statBonus
        this.oathed = oathed
    }
}

class Weapon {
    constructor(
        name = '', 
        rarity = '', 
        imgsrc = '', 
        reload = ''
    ) {
        this.name = name
        this.rarity = rarity
        this.imgsrc = imgsrc
        this.reload = reload
    }
}


class ShipTableRow extends Component {
    constructor(props) {
        super(props)

        this.rowId = this.props.rowId

        this.state = {
            ship: new Ship(),
            weapon: new Weapon(),
            cooldown: ''
        }
    }

    updateShip(e) {
        const shipName = e.target.value
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        
        request.onerror = (event) => console.log(event)
    
        request.onupgradeneeded = (event) => {
            const db = event.target.result
            db.createObjectStore("ships", {keyPath: "shipName"})
            db.createObjectStore("weapons", {keyPath: "weaponName"})
        }

        request.onsuccess = function(event) {
            const db = event.target.result;
            let transaction = db.transaction("ships", "readwrite")
            let objectStore = transaction.objectStore("ships")
            const shipRequest = objectStore.get(shipName)
    
            shipRequest.onerror = (event) => console.log(event)
    
            shipRequest.onsuccess = async function(event) {
                let ship = event.target.result
    
                if (
                    ship != undefined && 
                    ship.reload != undefined && 
                    ship.rarity != undefined && 
                    ship.shipyardImageURL != undefined
                ) {
                    this.setState((state, props) => ({
                        ship: new Ship(
                            shipName, 
                            ship.rarity, 
                            ship.shipyardImageURL, 
                            ship.reload, 
                            state.ship.statBonus, 
                            state.ship.oathed
                        ),
                        cooldown: calculateCooldown(
                            state.weapon.reload, 
                            calculateOathBonus(ship.reload, state.ship.oathed), 
                            state.ship.statBonus
                        )
                    }), () => {this.props.handleCallBack(this.state)})
                    return
                }
    
                if (ship == undefined) ship = {shipName: shipName}
    
                const response = await fetch("/azurlane/" + shipName)
                const text = await response.text()
                const parser = new DOMParser()
                const doc = parser.parseFromString(text, "text/html")

                const shipgirlImage = doc.getElementsByClassName('shipgirl-image')[0]
                const rarity = shipgirlImage.className.match(/rarity-([0-9])/)[1]
                ship.rarity = RARITY_MAP[rarity]
                ship.shipyardImageURL = shipgirlImage.querySelector('img').src

                const shipstatsTable = doc.getElementsByClassName('ship-stats')[0]
                ship.reload = shipstatsTable.getElementsByTagName('tr')[1].getElementsByTagName('td')[6].innerHTML
                               
                transaction = db.transaction("ships", "readwrite")
                objectStore = transaction.objectStore("ships")
                const shipUpdateRequest = objectStore.put(ship)
    
                shipUpdateRequest.onerror = (event) => console.log(event)
    
                shipUpdateRequest.onsuccess = function(event) {
                    console.log("Entry updated for " + shipName)
                    this.setState((state, props) => ({
                        ship: new Ship(
                            shipName, 
                            ship.rarity, 
                            ship.shipyardImageURL, 
                            ship.reload, 
                            state.ship.statBonus, 
                            state.ship.oathed
                        ),
                        cooldown: calculateCooldown(
                            state.weapon.reload, 
                            calculateOathBonus(ship.reload, state.ship.oathed), 
                            state.ship.statBonus
                        )
                    }), () => {this.props.handleCallBack(this.state)})
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    generateShipImage() {
        return (
            <div className={this.state.ship.rarity}>
                <img
                    width={192}
                    height={256}
                    src={this.state.ship.imgsrc}
                >
                </img>
            </div>
        )
    }

    generateShipInfo() {
        const shipNames = sessionStorage.getItem("shipNames").split(",")
        let options = []

        shipNames.forEach(function(value) {
            options.push(<option key={value} value={value}>{value}</option>)
        })

        options.push(<option key="" value="" defaultValue={true} disabled hidden></option>)

        return (
            <>
            <label>
                <b>Name: </b>
                <select 
                    value={this.state.ship.name}
                    onChange={function(e) {this.updateShip(e)}.bind(this)}
                >
                    {options}
                </select>
            </label>
            <br></br>
            <label>
                <b>Reload: </b>
                <input
                    type="number"
                    defaultValue={this.state.ship.reload125}
                    onChange={function(e) {
                        this.setState((state, props) => ({
                            ship: new Ship(
                                state.ship.name,
                                state.ship.rarity,
                                state.ship.imgsrc,
                                e.target.value,
                                state.ship.statBonus,
                                state.ship.oathed
                            ),
                            cooldown: calculateCooldown(
                                state.weapon.reload, 
                                calculateOathBonus(e.target.value, state.ship.oathed), 
                                state.ship.statBonus
                            )
                        }), () => {this.props.handleCallBack(this.state)})
                    }.bind(this)}
                >
                </input>
            </label>
            <br></br>
            <label>
                <b>Stat Bonus (%): </b>
                <input
                    type="number"
                    onChange={function(e) {
                        this.setState((state, props) => ({
                            ship: new Ship(
                                state.ship.name,
                                state.ship.rarity,
                                state.ship.imgsrc,
                                state.ship.reload125,
                                e.target.value,
                                state.ship.oathed
                            ),
                            cooldown: calculateCooldown(
                                state.weapon.reload, 
                                calculateOathBonus(state.ship.reload125, state.ship.oathed), 
                                e.target.value
                            )
                        }), () => {this.props.handleCallBack(this.state)})
                    }.bind(this)}
                >
                </input>
            </label>
            <br></br>
            <label>
                <b>Oathed?: </b>
                <input
                    type="checkbox"
                    onClick={function (e) {
                        this.setState((state, props) => ({
                            ship: new Ship(
                                state.ship.name,
                                state.ship.rarity,
                                state.ship.imgsrc,
                                state.ship.reload125,
                                state.ship.statBonus,
                                e.target.checked
                            ),
                            cooldown: calculateCooldown(
                                state.weapon.reload, 
                                calculateOathBonus(state.ship.reload125, e.target.checked), 
                                state.ship.statBonus
                            )
                        }), () => {this.props.handleCallBack(this.state)})
                    }.bind(this)}
                >
                </input>
            </label>
            </>
        )
    }

    updateWeapon(e) {
        const weaponName = e.target.value
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        
        request.onerror = (event) => console.log(event)
    
        request.onupgradeneeded = (event) => {
            const db = event.target.result
            db.createObjectStore("ships", {keyPath: "shipName"})
            db.createObjectStore("weapons", {keyPath: "weaponName"})
        }

        request.onsuccess = function(event) {
            const db = event.target.result;
            let transaction = db.transaction("weapons", "readwrite")
            let objectStore = transaction.objectStore("weapons")
            const weaponRequest = objectStore.get(weaponName)

            weaponRequest.onerror = (event) => console.log(event)

            weaponRequest.onsuccess = async function (event) {
                let weapon = event.target.result

                if (
                    weapon != undefined && 
                    weapon.reload != undefined && 
                    weapon.rarity != undefined && 
                    weapon.weaponImageURL != undefined
                ) {
                    this.setState((state, props) => ({
                        weapon: new Weapon(
                            weaponName, 
                            weapon.rarity, 
                            weapon.weaponImageURL, 
                            weapon.reload
                        ),
                        cooldown: calculateCooldown(
                            weapon.reload, 
                            calculateOathBonus(state.ship.reload125, state.ship.oathed), 
                            state.ship.statBonus
                        )
                    }), () => {this.props.handleCallBack(this.state)})
                    return
                }

                if (weapon == undefined) weapon = {weaponName: weaponName}

                const response = await fetch("/azurlane/" + weaponName)
                const text = await response.text()
                const parser = new DOMParser()
                const doc = parser.parseFromString(text, "text/html")

                const weaponImage = doc.getElementsByClassName('eq-icon')[0]
                const rarity = weaponImage.className.match(/rarity-([0-9])/)[1]
                weapon.rarity = RARITY_MAP[rarity]
                weapon.weaponImageURL = weaponImage.querySelector('img').src

                const weaponStatsTable = doc.getElementsByClassName('eq-stats')[0]
                weapon.reload = weaponStatsTable.getElementsByTagName('tr')[5].getElementsByTagName('td')[0].innerHTML
                weapon.reload = weapon.reload.match(/([0-9.]*)s\s*per\s*volley/)[1]

                transaction = db.transaction("weapons", "readwrite")
                objectStore = transaction.objectStore("weapons")
                const weaponUpdateRequest = objectStore.put(weapon)

                weaponUpdateRequest.onerror = (event) => console.log(event)
                weaponUpdateRequest.onsuccess = function (event) {
                    console.log("Entry updated for " + weaponName)
                    this.setState((state, props) => ({
                        weapon: new Weapon(
                            weaponName, 
                            weapon.rarity, 
                            weapon.weaponImageURL, 
                            weapon.reload
                        ),
                        cooldown: calculateCooldown(
                            weapon.reload, 
                            calculateOathBonus(state.ship.reload125, state.ship.oathed), 
                            state.ship.statBonus
                        )
                    }), () => {this.props.handleCallBack(this.state)})
                }.bind(this)  
            }.bind(this)
        }.bind(this)
    }

    generateWeaponImage() {
        return (
            <div className={this.state.weapon.rarity}>
                <img
                    width={128}
                    height={128}
                    src={this.state.weapon.imgsrc}
                >
                </img>
            </div>
        )
    }

    generateWeaponInfo() {
        const weaponNames = sessionStorage.getItem("weaponNames").split(",")
        let options = []

        weaponNames.forEach(function(value) {
            options.push(<option key={value} value={value}>{value}</option>)
        })

        options.push(<option key="" defaultValue disabled hidden></option>)

        return (
            <>
            <label>
                <b>Name: </b>
                <select 
                    value={this.state.weapon.name} 
                    onChange={function(e) {this.updateWeapon(e)}.bind(this)}
                >
                    {options}
                </select>
            </label>
            <br></br>
            <label>
                <b>Reload: </b>
                <input
                    type='number'
                    defaultValue={this.state.weapon.reload}
                    onChange={function(e){
                        this.setState((state, props) => ({
                            weapon: new Weapon(
                                state.weapon.name, 
                                state.weapon.rarity, 
                                state.weapon.imgsrc, 
                                e.target.value
                                ),
                            cooldown: calculateCooldown(
                                e.target.value, 
                                calculateOathBonus(state.ship.reload125, state.ship.oathed), 
                                state.ship.statBonus)
                        }), () => {this.props.handleCallBack(this.state)})
                    }.bind(this)}
                >
                </input>
            </label>
            </>
        )
    }

    generateCooldown() {
        return this.state.cooldown
    }

    render() {
        return (
            <tr>
                <td>
                    {this.generateShipImage()}
                </td>
                <td>
                    {this.generateShipInfo()}
                </td>
                <td>
                    {this.generateWeaponImage()}
                </td>
                <td>
                    {this.generateWeaponInfo()}
                </td>
                <td>
                    {this.generateCooldown()}
                </td>
            </tr>
        )
    }
}

function calculateOathBonus(reload125, oathed) {
    if (oathed) return Math.ceil(reload125 / 1.06 * 1.12)
    else return reload125
}

function calculateCooldown(weaponReloadTime, shipReloadStat, shipStatBonus) {
    weaponReloadTime = parseFloat(weaponReloadTime) || 0
    shipReloadStat = parseFloat(shipReloadStat) || 0
    shipStatBonus = parseFloat(shipStatBonus) / 100 || 0
    const cooldown = String((weaponReloadTime * Math.sqrt(200 / (shipReloadStat * (1 + shipStatBonus) + 100))).toFixed(2))
    return cooldown
}

export default ShipTableRow