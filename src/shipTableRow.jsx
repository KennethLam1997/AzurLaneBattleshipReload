let HOST = 'https://xanderking-azurlane.onrender.com'

if (import.meta.env.DEV) {
    HOST = import.meta.env.VITE_BASEURL
}

import { useState } from "react"

function Image ({ imgsrc, rarity, width, height }) {
    return (
        <div className={rarity}>
            <img
                width={width}
                height={height}
                src={imgsrc}
            >
            </img>
        </div>     
    )
}

function Selector ({ label, value, setValue, data }) {
    let options = []

    data.forEach((ele) => {
        options.push(<option key={ele} value={ele}>{ele}</option>)
    })

    options.push(<option key="" value="" defaultValue={true} disabled hidden></option>)

    return (
        <label>
            <b>{label}: </b>
            <select 
                    value={value}
                    onChange={setValue}
                >
                    {options}
                </select>
        </label>
    )
}

function Input ({ label, value, setValue, type, disabled }) {
    return (
        <label>
            <b>{label}: </b>
            <input
                type={type}
                defaultValue={value}
                onChange={setValue}
                disabled={disabled}
            >
            </input>
        </label>
    )
}

function ShipTableRow ({ handleCallBack }) {
    const [ship, setShip] = useState({name: ''})
    const [disableShipInputs, setDisableShipInputs] = useState(true)
    const [weapon, setWeapon] = useState({name: ''})
    const [disableWeaponInputs, setDisableWeaponInputs] = useState(true)
    const [cooldown, setCooldown] = useState('')

    const shipNames = sessionStorage.getItem("shipNames").split(",")
    const weaponNames = sessionStorage.getItem("weaponNames").split(",")

    async function updateShip(prop, value) {
        let newShip = {...ship}
        newShip[prop] = value

        if (prop == "name") {
            const response = await fetch(HOST + "/ship/" + encodeURIComponent(value))
            newShip = await response.json()
    
            if (!newShip) throw new Error("Failed to load ship information!")

            setDisableShipInputs(false)
        }

        setShip(newShip)
        updateCooldown(newShip, weapon)
    }

    async function updateWeapon(prop, value) {
        let newWeapon = {...weapon}
        newWeapon[prop] = value

        if (prop == "name") {
            const response = await fetch(HOST + "/weapon/" + encodeURIComponent(value))
            newWeapon = await response.json()
    
            if (!newWeapon) throw new Error("Failed to load weapon information!")

            setDisableWeaponInputs(false)
        }

        setWeapon(newWeapon)
        updateCooldown(ship, newWeapon)
    }

    function updateCooldown(newShip, newWeapon) { 
        const oathedBonus = calculateOathBonus(newShip.reload125, newShip.isOathed)
        const newCooldown = calculateCooldown(newWeapon.reload, oathedBonus, newShip.statBonus)
        setCooldown(newCooldown)
        
        handleCallBack({
            ship: newShip, 
            weapon: newWeapon, 
            cooldown: newCooldown
        })
    }

    return (
        <tr>
            <td>
                <Image
                    imgsrc={ship.imgsrc}
                    rarity={ship.rarity}
                    width={192}
                    height={256}
                />
            </td>
            <td>
                <Selector
                    label="Name"
                    value={ship.name}
                    setValue={(e) => updateShip("name", e.target.value)}
                    data={shipNames}
                />
                <br></br>
                <Input
                    label="Reload"
                    value={ship.reload125}
                    setValue={(e) => updateShip("reload125", e.target.value)}
                    type="number"
                    disabled={disableShipInputs}
                />
                <br></br>
                <Input
                    label="Stat Bonus (%)"
                    value={ship.statBonus}
                    setValue={(e) => updateShip("statBonus", e.target.value)}
                    type="number"
                    disabled={disableShipInputs}
                />
                <br></br>
                <Input
                    label="Oathed?"
                    value={ship.oathed}
                    setValue={(e) => updateShip("isOathed", e.target.checked)}
                    type="checkbox"
                    disabled={disableShipInputs}
                />
            </td>
            <td>
                <Image
                        imgsrc={weapon.imgsrc}
                        rarity={weapon.rarity}
                        width={128}
                        height={128}
                />
            </td>
            <td>
                <Selector
                        label="Name"
                        value={weapon.name}
                        setValue={(e) => updateWeapon("name", e.target.value)}
                        data={weaponNames}
                />
                <br></br>
                <Input
                    label="Reload"
                    value={weapon.reload}
                    setValue={(e) => updateWeapon("reload", e.target.value)}
                    type="number"
                    disabled={disableWeaponInputs}
                />
            </td>
            <td>
                <div>
                    {cooldown}
                </div>
            </td>
        </tr>
    )
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