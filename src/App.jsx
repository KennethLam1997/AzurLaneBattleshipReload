import { useEffect, useRef, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';

import ShipTableRow from "./shipTableRow.jsx"
import TimingGraph from './plotter.jsx';
import { ShipBox, StatsBox, BonusStatsBox, GearBox, GearStatsBox, CalculationBox } from "./shipUI.jsx";

let HOST = 'https://xanderking-azurlane.onrender.com'

if (import.meta.env.DEV) {
    HOST = import.meta.env.VITE_BASEURL
}

export const ROWLIMIT = 3

export default function App () {
    const [currentTab, setCurrentTab] = useState(JSON.parse(sessionStorage.getItem('currentTab')) || 0)
    const [shipIdx, setShipIdx] = useState(JSON.parse(sessionStorage.getItem('shipIdx')) || 1)
    const [ships, setShips] = useState(JSON.parse(sessionStorage.getItem('data')) || {
        "ship0": {
            imgsrc_chibi: new URL("/unknown_ship_icon.png", import.meta.url).href,
            level: 1,
            level1: {}, 
            level100: {}, 
            level120: {}, 
            level125: {}, 
            weapon: {
                imgsrc: new URL("/equipmentAddIcon.png", import.meta.url).href,
                enhance0: {}, 
                enhance10: {},
                enhance: 0
            }
        }
    })
    const shipRef = useRef()
    shipRef.current = ships
    
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

    useEffect(() => {
        sessionStorage.setItem('currentTab', JSON.stringify(currentTab))
        sessionStorage.setItem('shipIdx', JSON.stringify(shipIdx))
    }, [currentTab, shipIdx])

    useEffect(() => {
        sessionStorage.setItem('data', JSON.stringify(ships))
    }, [ships])

    function addShipStats (i, state) {
        // Since callbacks don't use current state, use ref.
        const ship = {
            ...shipRef.current["ship" + i],
            ...state
        }
        const shipLevel = ship["level" + ship.level]
        const shipWeapon = ship.weapon["enhance" + ship.weapon.enhance]

        const postOathReload = calculateOathBonus(shipLevel.reload, ship.bonusReload, ship.isOathed)
        let cooldown = calculateCooldown(shipWeapon.rof, postOathReload, ship.bonusPercentReload)
        cooldown = cooldown == 0 ? undefined : cooldown

        setShips({
            ...shipRef.current,
            ["ship" + i]: {
                // Update value instead of replacing.
                ...ship,
                cooldown: cooldown
            }
        })
    }

    function handleOnSelect(key) {
        if (key == -1) {
            addNewTab()
        }
        else {
            setCurrentTab(key)
        }
    }

    function addNewTab() {
        setShips({
            ...ships,
            ["ship" + shipIdx]: {
                imgsrc_chibi: new URL("/unknown_ship_icon.png", import.meta.url).href,
                level: 1,
                level1: {}, 
                level100: {}, 
                level120: {}, 
                level125: {}, 
                weapon: {
                    imgsrc: new URL("/equipmentAddIcon.png", import.meta.url).href,
                    enhance0: {}, 
                    enhance10: {},
                    enhance: 0
                }
            }
        })
        setCurrentTab(shipIdx)
        setShipIdx(shipIdx + 1)
    }
    
    function createTabs() {
        // const tabs = [...Array(shipIdx)].map((ele, idx) => {
        //     return (
        //         <Tab 
        //             key={idx}
        //             eventKey={"ship" + idx} 
        //             title={<span><img src={ships["ship" + idx].imgsrc_chibi} width={75} height={70}/></span>}
        //         >
        //             <div className="content-container">
        //                 <div className="left-container">
        //                     <ShipBox 
        //                         ship={ships["ship" + idx]} 
        //                         handleCallBack={(state) => addShipStats(idx, state)}
        //                     />
        //                     <GearBox
        //                         ship={ships["ship" + idx]} 
        //                         handleCallBack={(state) => addShipStats(idx, state)}
        //                     />
        //                     <CalculationBox
        //                         ship={ships["ship" + idx]} 
        //                         handleCallBack={(state) => addShipStats(idx, state)}
        //                     />
        //                 </div>
        //                 <div className="right-container">
        //                     <StatsBox 
        //                         ship={ships["ship" + idx]} 
        //                         handleCallBack={(state) => addShipStats(idx, state)}
        //                     />
        //                     <BonusStatsBox 
        //                         ship={ships["ship" + idx]} 
        //                         handleCallBack={(state) => addShipStats(idx, state)}
        //                     />
        //                     <GearStatsBox
        //                         ship={ships["ship" + idx]} 
        //                         handleCallBack={(state) => addShipStats(idx, state)}
        //                     />
        //                 </div>
        //             </div>
        //         </Tab>
        //     )
        // })

        const tabs = [...Array(shipIdx)].map((ele, idx) => {
            return (
                <Nav.Item key={idx} className="tab">
                    <Nav.Link key={idx} eventKey={idx} className="left-tabs tab">
                        <img src={ships["ship" + idx].imgsrc_chibi} width={75} height={70}/>
                    </Nav.Link>
                </Nav.Item>
            )
        })

        const tabContents = [...Array(shipIdx)].map((ele, idx) => {
            return (
                <Tab.Pane key={idx} eventKey={idx}>
                    <div className="content-container">
                        <div className="left-container">
                            <div className="tab-container-label">
                                <h2><center>Ship</center></h2>
                            </div>
                            <ShipBox 
                                ship={ships["ship" + idx]} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                            <GearBox
                                ship={ships["ship" + idx]} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                            <CalculationBox
                                ship={ships["ship" + idx]} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                        </div>
                        <div className="right-container">
                            <div className="tab-container-label">
                                <h2><center>Stats</center></h2>
                            </div>
                            <StatsBox 
                                ship={ships["ship" + idx]} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                            <BonusStatsBox 
                                ship={ships["ship" + idx]} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                            <GearStatsBox
                                ship={ships["ship" + idx]} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                        </div>
                    </div>                        
                </Tab.Pane>
            )
        })

        return (
            <div className="main-container centered-horizontal">
                <Tab.Container 
                    className="mb-3" 
                    onSelect={(key) => handleOnSelect(key)}
                    activeKey={currentTab}
                    transition={false}
                >
                    <Row>
                        <Col className="tab-column">
                            <Nav className="flex-column">
                                {tabs}
                                <Nav.Item key={-1} className="tab">
                                    <Nav.Link key={-1} eventKey={-1} className="left-tabs">
                                        <h6 style={{marginTop: "10px"}}>Add?</h6>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col className="tab-content">
                            <Tab.Content>
                                {tabContents}
                            </Tab.Content>
                        </Col>
                        <Col className="tab-column">
                            <Nav className="flex-column">
                                <Nav.Item key={0} className="tab">
                                    <Nav.Link key={0} eventKey={0} className="right-tabs tab">
                                        <img src={ships["ship0"].imgsrc_chibi} width={75} height={70}/>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        )

        // return (
        //     <div className="main-container">
        //         <Tabs
        //             defaultActiveKey="ship0"
        //             className="mb-3"
        //             onSelect={(key) => handleOnSelect(key)}
        //         >
        //             {tabs}
        //             <Tab
        //                 key={-1}
        //                 eventKey={-1} 
        //                 title={"Add a new tab?"}
        //             >
        //             </Tab>
        //         </Tabs>
        //     </div>            
        // )
    }

    return (
        <>
            {createTabs()}
        </>
    )
}

function calculateOathBonus(shipReload, bonusFlatReload, isOathed) {
    shipReload = parseFloat(shipReload) || 0
    bonusFlatReload = parseFloat(bonusFlatReload) || 0
    isOathed = isOathed != undefined ? isOathed : false
    const reload = shipReload + bonusFlatReload

    if (isOathed) return Math.ceil(reload / 1.06 * 1.12)
    return reload
}

function calculateCooldown(weaponReloadTime, shipReloadStat, bonusPercentStat) {
    weaponReloadTime = parseFloat(weaponReloadTime) || 0
    shipReloadStat = parseFloat(shipReloadStat) || 0
    bonusPercentStat = parseFloat(bonusPercentStat) / 100 || 0
    const cooldown = (weaponReloadTime * Math.sqrt(200 / (shipReloadStat * (1 + bonusPercentStat) + 100))).toFixed(2)
    return cooldown
}