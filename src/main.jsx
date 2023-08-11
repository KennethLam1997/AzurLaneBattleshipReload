const HOST = import.meta.env.DEV ? import.meta.env.VITE_BASEURL : 'https://xanderking-azurlane.onrender.com'

import * as ReactDOM from 'react-dom/client';
import App from "./App";

async function fetchAll(type) {
    const response = await fetch(HOST + "/" + type + "/all")
    const json = await response.json()

    if (!json) throw new Error(type + " could not be loaded!")

    localStorage.setItem("all" + type, JSON.stringify(json))
    localStorage.setItem(type + "DateAccessed", JSON.stringify(Date.now()))     
}

async function fetchUpdate(types) {
    document.querySelector('body').style.visibility = 'hidden'
    document.querySelector('#loader').style.visibility = 'visible'

    for (const type of types) {
        const response = await fetch(HOST + "/dateModified/" + type)
        const json = await response.json()

        if (!json) throw new Error(type + " could not be loaded!")

        let dateAccessed = JSON.parse(localStorage.getItem(type + 'DateAccessed'))

        if (!localStorage.getItem("all" + type) || !dateAccessed || json.dateModified > dateAccessed) {
            await fetchAll(type)
            console.log("Updated to latest " + type + " info!")
        }
        else {
            console.log(type + " info is current!")
        }
    }

    document.querySelector('body').style.visibility = 'visible'
    document.querySelector('#loader').style.visibility = 'hidden'
}

document.addEventListener('DOMContentLoaded', 
    async function () {
        await fetchUpdate(["ship", "weapon"])
        
        root = ReactDOM.createRoot(document.getElementById('root'))
        root.render(<App/>)
    }
)