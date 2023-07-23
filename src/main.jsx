import * as ReactDOM from 'react-dom/client';
import { App } from "./App"

async function fetchShipNames() {
    if (sessionStorage.getItem("shipNames")) return

    console.log("Fetching ships...")

    const response = await fetch("/azurlane/Category:Battleships")
    const text = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, "text/html")
    const subcategory = doc.getElementById('mw-pages')
    const items = subcategory.querySelectorAll('a')
    const shipNames = Array.from(items).map(element => element.title)

    if (!shipNames) console.log("Ships could not be loaded.")

    sessionStorage.setItem("shipNames", shipNames)
    console.log(shipNames)
}

async function fetchWeaponNames() {
    if (sessionStorage.getItem("weaponNames")) return

    console.log("Fetching weapons...")

    const response = await fetch("/azurlane/List_of_Battleship_Guns")
    const text = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, "text/html")
    const table = doc.getElementsByClassName('eqlTable')[0]
    const items = table.querySelectorAll('a')
    const titles = Array.from(items).map(element => element.title)
    let weaponNames = new Set()

    for (const weaponName of titles) {
        if (weaponName.match(/(Quadruple|Triple|Twin).*/)) {
            weaponNames.add(weaponName)
        }
    }

    sessionStorage.setItem("weaponNames", Array.from(weaponNames))
}

document.addEventListener('DOMContentLoaded', 
    async function () {
        await fetchShipNames()
        await fetchWeaponNames()
        root = ReactDOM.createRoot(document.getElementById('root'))
        root.render(<App/>)
    }
)