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

    sessionStorage.setItem(type + "Names", json.toString())    
}

document.addEventListener('DOMContentLoaded', 
    async function () {
        if (!sessionStorage.getItem("shipNames") || !sessionStorage.getItem("weaponNames")) {
            document.querySelector('body').style.visibility = 'hidden'
            document.querySelector('#loader').style.visibility = 'visible'
    
            await fetchNames("ship")
            await fetchNames("weapon")

            document.querySelector('body').style.visibility = 'visible'
            document.querySelector('#loader').style.visibility = 'hidden'
        }

        root = ReactDOM.createRoot(document.getElementById('root'))
        root.render(<App/>)
    }
)