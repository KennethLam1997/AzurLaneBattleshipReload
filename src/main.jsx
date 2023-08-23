const HOST = import.meta.env.DEV ? import.meta.env.VITE_BASEURL : 'https://xanderking-azurlane.onrender.com'

import * as ReactDOM from 'react-dom/client';
import App from "./App";
import { Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const DATATYPES = ["ship", "weapon"]

async function fetchUpdate(type) {
    const response = await fetch(HOST + "/" + type + "/all")
    const json = await response.json()

    if (!json) throw new Error(type + " could not be loaded!")

    localStorage.setItem("all" + type, JSON.stringify(json))
    localStorage.setItem(type + "DateAccessed", JSON.stringify(Date.now()))         
}

function Loader () {
    const [isLoading, setIsLoading] = useState(true)
    const [isFullUpdate, setIsFullUpdate] = useState(true)
    const [isRefreshRequired, setIsRefreshRequired] = useState(false)

    useEffect(() => {
        async function fetchDateModified() {
            try {
                if (DATATYPES.some(val => !localStorage.getItem("all" + val) || !localStorage.getItem(val + 'DateAccessed'))) {
                    for (const type of DATATYPES) {
                        await fetchUpdate(type)
                        console.log("Updated to latest " + type + " info!")
                    }

                    setIsLoading(false)
                }
                else {
                    setIsFullUpdate(false)

                    for (const type of DATATYPES) {
                        const response = await fetch(HOST + "/dateModified/" + type)
                        const json = await response.json()
                
                        if (!json) throw new Error(type + " could not be loaded!")
                        
                        const dateAccessed = JSON.parse(localStorage.getItem(type + 'DateAccessed'))

                        if (json.dateModified > dateAccessed) {
                            fetchUpdate(type)
                            console.log("Updated to latest " + type + " info!")
                            setIsRefreshRequired(true)
                        }
                        else {
                            console.log(type + " info is current!")
                        }
                    }

                    setIsLoading(false)
                }
            }
            catch (error) {
                setIsFullUpdate(false)
                setIsLoading(false)
                console.log(new Error("Critical error! Cannot load web services or local storage."))
                console.log(error)
            }
        }

        fetchDateModified()
    }, [])

    if (isFullUpdate && isLoading) {
        return (
            <div className="centered-both">
                <img src={new URL("/new_jersey_meme.jpg", import.meta.url).href} width="222" height="192" className="displayed"/>
                <br></br>
                <h1 
                    style={{
                        textAlign: 'center',
                        textShadow: '-1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000, 1px 1px 1px #000'
                    }}
                >
                    Loading database. Please wait... <Spinner animation='border'/>
                </h1>
            </div>
        )
    }

    const toast = () => {
        if (isLoading) {
            return (
                <Toast>
                    <Toast.Header closeButton={false}>
                        <strong><Spinner animation='border' size='sm'/> Update</strong>
                    </Toast.Header>
                    <Toast.Body>Checking if updates are required...</Toast.Body>
                </Toast>
            )
        }
        else if (isRefreshRequired) {
            return (
                <Toast>
                    <Toast.Header closeButton={false}>
                        <strong>Success!</strong>
                    </Toast.Header>
                    <Toast.Body>Update complete! Refresh to apply changes!</Toast.Body>
                </Toast>
            )
        }
    }

    const showLoadingToast = () => {
        if (isLoading || isRefreshRequired) {
            return (
                <div className='bg-dark'>
                    <ToastContainer
                        className="p-3"
                        position="bottom-start"
                        style={{ zIndex: 1 }}
                    >
                        {toast()}
                    </ToastContainer>
                </div> 
            )
        }
    }

    return (
        <>
            {showLoadingToast()}
            <App/>
        </>
    )
}

document.addEventListener('DOMContentLoaded', 
    async () => {
        root = ReactDOM.createRoot(document.getElementById('root'))
        root.render(<Loader/>)
    }
)