import { useEffect, useRef, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import Tab from 'react-bootstrap/Tab';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';

import TimingGraph from './plotter.jsx';
import { ShipBox, StatsBox, BonusStatsBox, GearBox, GearStatsBox, CalculationBox } from "./shipUI.jsx";

const TEMPLATETAB = {
    imgsrc_chibi: new URL("/unknown_ship_icon.png", import.meta.url).href,
    level: 1,
    level1: {}, 
    level100: {}, 
    level120: {}, 
    level125: {}, 
    equipment: {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {},
        Augment: {}
    }
    // weapon: {
    //     imgsrc: new URL("/equipmentAddIcon.png", import.meta.url).href,
    //     enhance0: {}, 
    //     enhance10: {},
    //     enhance: 0
    // }
}

export default function App ({ database }) {
    const [ships, setShips] = useState(JSON.parse(localStorage.getItem('data')) || [TEMPLATETAB])
    const [currentTab, setCurrentTab] = useState(JSON.parse(localStorage.getItem('currentTab')) || 0)
    const shipRef = useRef()
    shipRef.current = ships

    useEffect(() => {
        localStorage.setItem('currentTab', JSON.stringify(currentTab))
    }, [currentTab])

    useEffect(() => {
        localStorage.setItem('data', JSON.stringify(ships))
    }, [ships])

    function addShipStats (i, state) {
        // Since callbacks don't use current state, use ref.
        const ship = {
            ...shipRef.current[i],
            ...state
        }
        // const shipLevel = ship["level" + ship.level]
        // const shipWeapon = ship.weapon["enhance" + ship.weapon.enhance]
        // const postOathReload = calculateOathBonus(shipLevel.reload, ship.bonusReload, ship.isOathed)
        let cooldown = 0
        //let cooldown = calculateCooldown(shipWeapon.rof, postOathReload, ship.bonusPercentReload)
        cooldown = cooldown == 0 ? undefined : cooldown

        setShips(Object.assign([], shipRef.current, {[i]: {...ship, cooldown: cooldown}}))
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
        setShips(Object.assign([], ships, {[ships.length]: TEMPLATETAB}))
        setCurrentTab(ships.length)
    }

    function closeTab(key) {
        if (key >= 0) {
            setShips(ships.toSpliced(key, 1))
            
            if (currentTab == key) {
                setCurrentTab(currentTab - 1)
            }
        }
    }
    
    function createTabs() {
        const tabs = ships.map((ele, idx) => {
            return (
                <Nav.Item key={idx} className="tab">
                    <Nav.Link key={idx} eventKey={idx} className="left-tabs tab">
                        <img src={ele.imgsrc_chibi} width={75} height={70}/>
                    </Nav.Link>
                </Nav.Item>
            )
        })

        const tabContents = ships.map((ele, idx) => {
            return (
                <Tab.Pane key={idx} eventKey={idx}>
                    <div className="content-container">
                        <div className="left-container">
                            <div className="tab-container-label">
                                <h2><center>Ship</center></h2>
                            </div>
                            <ShipBox 
                                ship={ele} 
                                database={database.ship}
                                activeShips={ships.map(val => val.name)}
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                            <GearBox
                                ship={ele} 
                                database={database.equipment}
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                            <CalculationBox
                                ship={ele} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                        </div>
                        <div className="right-container">
                            <div className="tab-container-label">
                                <h2><center>Stats</center></h2>
                            </div>
                            {/* <StatsBox 
                                ship={ele} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                            <BonusStatsBox 
                                ship={ele} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            />
                            <GearStatsBox
                                ship={ele} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            /> */}
                        </div>
                        <div className="tab-container-close" onClick={() => closeTab(idx)}>
                            <h1><div className="centered-both">×</div></h1>
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
                                <Tab.Pane key={-2} eventKey={-2}>
                                    <div className="content-container">
                                        <TimingGraph ships={ships}/>
                                    </div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                        <Col className="tab-column">
                            <Nav className="flex-column">
                                <Nav.Item key={-2} className="tab">
                                    <Nav.Link key={-2} eventKey={-2} className="right-tabs tab">
                                        <h6 style={{marginTop: "10px"}}>Graph?</h6>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        )
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