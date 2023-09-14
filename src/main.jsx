const HOST = import.meta.env.DEV ? import.meta.env.VITE_BASEURL : 'https://xanderking-azurlane.onrender.com'

import * as ReactDOM from 'react-dom/client';
import App from "./App";
import { Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const DATASOURCES = ["ship", "equipment"]

async function fetchUpdate(dataSource) {
    const response = await fetch(HOST + "/" + dataSource + "/all")
    const json = await response.json()

    if (!json) throw new Error(dataSource + " could not be loaded!")

    localStorage.setItem("all" + dataSource, JSON.stringify(json))
    localStorage.setItem(dataSource + "DateAccessed", JSON.stringify(Date.now()))         
}

function groupByType(dataSource) {
    let data = JSON.parse(localStorage.getItem('all' + dataSource))
    data = data.reduce((acc, val) => {
            acc[val.type] = acc[val.type] || []
            acc[val.type].push(val)
            return acc
        }, Object.create(null))
    
    return data
}

function Loader () {
    const [isLoading, setIsLoading] = useState(true)
    const [isFullUpdate, setIsFullUpdate] = useState(true)
    const [isRefreshRequired, setIsRefreshRequired] = useState(false)
    const [database, setDatabase] = useState({})

    useEffect(() => {
        async function fetchDateModified() {
            try {
                if (DATASOURCES.some(val => !localStorage.getItem("all" + val) || !localStorage.getItem(val + 'DateAccessed'))) {
                    for (const source of DATASOURCES) {
                        await fetchUpdate(source)
                        console.log("Updated to latest " + source + " info!")
                    }
                }
                else {
                    setIsFullUpdate(false)

                    for (const source of DATASOURCES) {
                        const response = await fetch(HOST + "/dateModified/" + source)
                        const json = await response.json()
                
                        if (!json) throw new Error(source + " could not be loaded!")
                        
                        const dateAccessed = JSON.parse(localStorage.getItem(source + 'DateAccessed'))

                        if (json.dateModified > dateAccessed) {
                            fetchUpdate(source)
                            console.log("Updated to latest " + source + " info!")
                            setIsRefreshRequired(true)
                        }
                        else {
                            console.log(source + " info is current!")
                        }
                    }
                }

                setIsLoading(false)
            }
            catch (error) {
                setIsFullUpdate(false)
                setIsLoading(false)
                console.log(new Error("Critical error! Cannot load web services or local storage."))
                console.log(error)
            }
        }

        fetchDateModified()
        setDatabase(DATASOURCES.reduce((acc, val) => {
            acc[val] = groupByType(val)
            return acc
        }, {}))
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
                <ToastContainer
                    className="p-3"
                    position="bottom-start"
                    style={{ zIndex: 1 }}
                >
                    {toast()}
                </ToastContainer>
            )
        }
    }

    return (
        <>
            {showLoadingToast()}
            <App database={database}/>
        </>
    )
}

document.addEventListener('DOMContentLoaded', 
    async () => {
        root = ReactDOM.createRoot(document.getElementById('root'))
        root.render(<Loader/>)
    }
)