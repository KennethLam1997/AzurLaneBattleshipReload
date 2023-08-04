import { useRef, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import ShipTableRow from "./shipTableRow.jsx"
import TimingGraph from './plotter.jsx';
import { ShipBox, StatsBox, BonusStatsBox, GearBox, GearStatsBox } from "./shipUI.jsx";

let HOST = 'https://xanderking-azurlane.onrender.com'

if (import.meta.env.DEV) {
    HOST = import.meta.env.VITE_BASEURL
}

export const ROWLIMIT = 3

export default function App () {
    const [shipIdx, setShipIdx] = useState(0)
    const [ship, setShip] = useState({})
    const shipRef = useRef()
    shipRef.current = ship
    
    // let rows = []
    // let dynamicProps = {}
    
    // for (let i = 1; i <= ROWLIMIT; i++) {
    //     rows.push(
    //         <ShipTableRow 
    //             key={i} 
    //             handleCallBack={(state) => handleCallBack(state)}
    //         />
    //     )

    //     dynamicProps["ship" + i] = this.state["ship" + i]
    // }

    function addShipStats (i, state) {
        // Since callbacks don't use current state, use ref.
        setShip({
            ...shipRef.current,
            ["ship" + i]: {
                // Update value instead of replacing.
                ...shipRef.current["ship" + i],
                ...state
            }
        })
    }

    function handleOnSelect(key) {
        if (key == -1) {
            addNewTab()
        }
    }

    function addNewTab() {
        let newShip = {...ship}
        newShip["ship" + (shipIdx)] = {
            level1: {}, 
            level100: {}, 
            level120: {}, 
            level125: {}, 
            weapon: {
                imgsrc: './src/assets/equipmentAddIcon.png',
                enhance0: {}, 
                enhance10: {}
            }
        } 

        setShip(newShip)
        setShipIdx(shipIdx + 1)
    }
    
    function createTabs() {
        const tabs = [...Array(shipIdx)].map((ele, idx) => {
            return (
                <Tab 
                    key={idx}
                    eventKey={"ship" + idx} 
                    title={<span><img src={ship["ship" + idx].imgsrc_chibi} width={75} height={70}/></span>}
                >
                    <div className="main-container">
                        <div className="content-container">
                            <div className="left-container" style={{height: "450px"}}>
                                <ShipBox 
                                    ship={ship["ship" + idx]} 
                                    handleCallBack={(state) => addShipStats(idx, state)}
                                />
                            </div>
                            <div className="right-container">
                                <StatsBox 
                                    ship={ship["ship" + idx]} 
                                    handleCallBack={(state) => addShipStats(idx, state)}
                                />
                                <BonusStatsBox handleCallBack={(state) => addShipStats(idx, state)}/>
                            </div>
                        </div>

                        <div className="content-container">
                            <div className="left-container">
                                <GearBox
                                    ship={ship["ship" + idx]} 
                                    handleCallBack={(state) => addShipStats(idx, state)}
                                />
                            </div>
                            <div className="right-container">
                                <GearStatsBox
                                    ship={ship["ship" + idx]} 
                                    handleCallBack={(state) => addShipStats(idx, state)}
                                />
                            </div>
                        </div>
                    </div>
                </Tab>
            )
        })

        return (
            <div className="main-container">
                <Tabs
                    defaultActiveKey="ship0"
                    className="mb-3"
                    onSelect={(key) => handleOnSelect(key)}
                >
                    {tabs}
                    <Tab
                        key={-1}
                        eventKey={-1} 
                        title={"Add a new tab?"}
                    >
                    </Tab>
                </Tabs>
            </div>            
        )
    }

    return (
        <>
            {createTabs()}
        </>
    )
}