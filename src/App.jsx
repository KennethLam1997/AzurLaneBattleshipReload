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
    statsByLevel: {
        1: {},
        100: {},
        120: {},
        125: {}
    },
    equipment: {
        1: {},
        2: {},
        3: {},
        4: {},
        5: {},
        Augment: {}
    },
    sumStats: {},
    bonusStats: {}
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

    function updateShip(i, state) {
        // Since callbacks don't use current state, use ref.
        const ship = {
            ...shipRef.current[i],
            ...state
        }

        updateCalculations(i, ship)
    }

    function updateEquipment(i, state) {
        // Since callbacks don't use current state, use ref.
        const ship = {
            ...shipRef.current[i],
            ...state,
            sumStats: {}
        }
        
        const statFields = [
            "health",
            "reload",
            "firepower",
            "torpedo",
            "evasion",
            "antiair",
            "aviation",
            "accuracy",
            "consumption",
            "asw",
            "luck"
        ]

        for (let [, equipment] of Object.entries(ship.equipment)) {
            if (!equipment.equipped) continue
            equipment = equipment.equipped.statsByLevel[equipment.enhance]

            for (let [stat, value] of Object.entries(equipment)) {
                if (statFields.includes(stat)) {
                    if (!ship.sumStats[stat]) ship.sumStats[stat] = 0

                    if (typeof(value) == "number" && !isNaN(value)) {
                        ship.sumStats[stat] += parseFloat(value)
                    }
                    else {
                        value = value.split("+").filter(ele => !isNaN(ele)).map(ele => parseFloat(ele))
                        ship.sumStats[stat] += value.reduce((a, b) => a + b, 0)
                    }
                }
            }
        }

        updateCalculations(i, ship)
    }

    function updateBonusStats(i, state) {
        // Since callbacks don't use current state, use ref.
        const ship = {
            ...shipRef.current[i],
            bonusStats: {
                ...shipRef.current[i].bonusStats,
                ...state
            }
        }

        updateCalculations(i, ship)
    }

    function updateCalculations(i, ship) {
        for (const [slot, equipment] of Object.entries(ship.equipment)) {
            if (!equipment.equipped) continue

            let reload = calculateOathBonus(ship.statsByLevel[ship.level].reload, ship.bonusStats.isOathed)
            reload += ship.sumStats.reload ? parseFloat(ship.sumStats.reload) : 0
            reload += ship.bonusStats.reload ? parseFloat(ship.bonusStats.reload) : 0

            if (equipment.equipped.type.includes("Gun")) {
                const cooldown = calculateGunCooldown(
                    equipment.equipped.statsByLevel[equipment.enhance].rof, 
                    reload, 
                    ship.bonusStats.reloadPercent
                )
                ship.equipment[slot].cooldown = cooldown   
            }
            else if (["Fighter", "Dive Bomber", "Torpedo Bomber"].includes(equipment.equipped.type)) {
                const cooldown = calculateAircraftCooldown(
                    equipment.equipped.statsByLevel[equipment.enhance].rof, 
                    reload, 
                    ship.bonusStats.reloadPercent
                )
                ship.equipment[slot].cooldown = cooldown   
            }
        }

        setShips(Object.assign([], shipRef.current, {[i]: {...ship}}))
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
                                handleCallBack={(state) => updateShip(idx, state)}
                            />
                            {/* <CalculationBox
                                ship={ele} 
                                handleCallBack={(state) => addShipStats(idx, state)}
                            /> */}
                        </div>
                        <div className="right-container">
                            <div className="tab-container-label">
                                <h2><center>Stats</center></h2>
                            </div>
                            <GearBox
                                ship={ele} 
                                database={database.equipment}
                                handleCallBack={(state) => updateEquipment(idx, state)}
                            />
                            <StatsBox 
                                ship={ele} 
                                handleCallBack={(state) => updateShip(idx, state)}
                            />
                            <BonusStatsBox 
                                ship={ele} 
                                handleCallBack={(state) => updateBonusStats(idx, state)}
                            />
                            {/*<GearStatsBox
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

function calculateOathBonus(stat, isOathed) {
    stat = parseFloat(stat) || 0
    isOathed = isOathed != undefined ? isOathed : false

    if (isOathed) {
        return Math.ceil(stat / 1.06 * 1.12)
    }
    else {
        return stat
    }
}

function calculateGunCooldown(weaponReloadTime, shipReloadStat, bonusPercentReload) {
    weaponReloadTime = parseFloat(weaponReloadTime) || 0
    shipReloadStat = parseFloat(shipReloadStat) || 0
    bonusPercentReload = parseFloat(bonusPercentReload) / 100 || 0

    // Rounding down in two decimal places.
    let cooldown = weaponReloadTime * Math.sqrt(200 / (shipReloadStat * (1 + bonusPercentReload) + 100))
    cooldown = Math.floor(cooldown * 100) / 100
    cooldown = cooldown.toFixed(2)
    return cooldown
}

function calculateAircraftCooldown(aircraftReloadTime, shipReloadStat, bonusPercentReload) {
    aircraftReloadTime = parseFloat(aircraftReloadTime) || 0
    shipReloadStat = parseFloat(shipReloadStat) || 0
    bonusPercentReload = parseFloat(bonusPercentReload) / 100 || 0

    let cooldown = aircraftReloadTime * Math.sqrt(200 / (shipReloadStat * (1 + bonusPercentReload) + 100))
    // Custom constant factor for aircraft
    cooldown += 0.223 * Math.log(shipReloadStat) - 1.3419
    cooldown = Math.floor(cooldown * 100) / 100
    cooldown = cooldown.toFixed(2)
    return cooldown
}