let HOST = 'https://xanderking-azurlane.onrender.com'

if (import.meta.env.DEV) {
    HOST = import.meta.env.VITE_BASEURL
}

import * as ReactDOM from 'react-dom/client';
import { App } from "./App"

async function fetchShipNames() {
    if (sessionStorage.getItem("shipNames")) return

    const response = await fetch(HOST + "/ship")
    const json = await response.json()

    if (!json) throw new Error("Ships could not be loaded!")

    sessionStorage.setItem("shipNames", json.toString())
}

async function fetchWeaponNames() {
    if (sessionStorage.getItem("weaponNames")) return

    const response = await fetch(HOST + "/weapon")
    const json = await response.json()

    if (!json) throw new Error("Weapons could not be loaded!")

    sessionStorage.setItem("weaponNames", json.toString())    
}

document.addEventListener('DOMContentLoaded', 
    async function () {
        await fetchShipNames()
        await fetchWeaponNames()
        root = ReactDOM.createRoot(document.getElementById('root'))
        root.render(<App/>)
    }
)