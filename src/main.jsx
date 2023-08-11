let HOST = 'https://xanderking-azurlane.onrender.com'

if (import.meta.env.DEV) {
    HOST = import.meta.env.VITE_BASEURL
}

import * as ReactDOM from 'react-dom/client';
import App from "./App";

async function fetchNames(type) {
    const response = await fetch(HOST + "/" + type)
    const json = await response.json()

    if (!json) throw new Error(type + " could not be loaded!")

    sessionStorage.setItem(type + "Names", JSON.stringify(json))    
}

async function fetchAll(type) {
    const response = await fetch(HOST + "/" + type + "/all")
    const json = await response.json()

    if (!json) throw new Error(type + " could not be loaded!")

    sessionStorage.setItem("all" + type, JSON.stringify(json))       
}

document.addEventListener('DOMContentLoaded', 
    async function () {
        // let res = await fetch(HOST + "/weapon/all")
        // console.log(await res)

        if (!sessionStorage.getItem("allShip") || !sessionStorage.getItem("allWeapon")) {
            document.querySelector('body').style.visibility = 'hidden'
            document.querySelector('#loader').style.visibility = 'visible'
    
            await fetchAll("ship")
            await fetchAll("weapon")

            document.querySelector('body').style.visibility = 'visible'
            document.querySelector('#loader').style.visibility = 'hidden'
        }

        root = ReactDOM.createRoot(document.getElementById('root'))
        root.render(<App/>)
    }
)