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

    async updateShip(e) {
        const shipName = e.target.value

        const response = await fetch("http://localhost:3000/ship/" + encodeURIComponent(shipName))
        const ship = await response.json()

        if (!ship) throw new Error("Failed to load ship information!")

        this.setState((state, props) => ({
            ship: new Ship(
                shipName, 
                ship.rarity, 
                ship.imgsrc, 
                ship.reload125, 
                state.ship.statBonus, 
                state.ship.oathed
            ),
            cooldown: calculateCooldown(
                state.weapon.reload, 
                calculateOathBonus(ship.reload125, state.ship.oathed), 
                state.ship.statBonus
            )
        }), () => {this.props.handleCallBack(this.state)})
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

    async updateWeapon(e) {
        const weaponName = e.target.value

        const response = await fetch("http://localhost:3000/weapon/" + encodeURIComponent(weaponName))
        const weapon = await response.json()

        if (!weapon) throw new Error("Failed to load weapon information!")

        this.setState((state, props) => ({
            weapon: new Weapon(
                weaponName, 
                weapon.rarity, 
                weapon.imgsrc, 
                weapon.reload
            ),
            cooldown: calculateCooldown(
                weapon.reload, 
                calculateOathBonus(state.ship.reload125, state.ship.oathed), 
                state.ship.statBonus
            )
        }), () => {this.props.handleCallBack(this.state)})        
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