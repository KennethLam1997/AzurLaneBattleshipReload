import { useEffect, useRef, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { InputGroup, OverlayTrigger, Popover } from "react-bootstrap";

import ShipTableRow from "./shipTableRow.jsx"
import TimingGraph from './plotter.jsx';

let HOST = 'https://xanderking-azurlane.onrender.com'

if (import.meta.env.DEV) {
    HOST = import.meta.env.VITE_BASEURL
}

export const ROWLIMIT = 3
const EQUIPMENTLIMIT = 5

function GearBox() {
    const generateSelectors = () => {
        let equipmentBoxes = []

        equipmentBoxes.push(
            <Col key={0}>
                <EquipmentSelector key={0}/>
            </Col>
        )
        
        // Other features in dev, disable elements.
        for (let i = 1; i < EQUIPMENTLIMIT; i++) {
            equipmentBoxes.push(
                <Col key={i}>
                    <EquipmentSelector key={i} disabled={true}/>
                </Col>
            )
        }

        return equipmentBoxes
    }

    return (
        <div className="box centered-horizontal">
            <h4>Gear</h4>
            <div className="box-inner">
                <Form>
                    <Row>
                        {generateSelectors()}
                    </Row>
                </Form>
            </div>
        </div>
    );
}

function EquipmentSelector({ disabled=false }) {
    const [weapon, setWeapon] = useState({imgsrc: './src/assets/equipmentAddIcon.png'})

    const generateOptions = () => {
        const data = sessionStorage.getItem('weaponNames').split(",")
        let options = []

        data.forEach((ele) => {
            options.push(<option key={ele} value={ele}>{ele}</option>)
        })

        options.push(<option key="" value="" defaultValue={true} disabled hidden></option>)

        return options
    }

    const tooltip = () => {
        if (disabled) return (
            <Popover id="popover-basic" style={{maxWidth: "100%"}}>
                <Popover.Header as="h3">Feature under development!</Popover.Header>
                <Popover.Body >
                    Check back for any updates.
                </Popover.Body>
            </Popover>            
        )

        return (
            <Popover id="popover-basic" style={{maxWidth: "100%"}}>
                <Popover.Header as="h3">Add equipment?</Popover.Header>
                <Popover.Body>
                    <select 
                        value={weapon.name}
                        onChange={(e) => updateWeapon(e.target.value)}
                    >
                        {generateOptions()}
                    </select>
                    <div>

                    </div>
                </Popover.Body>
            </Popover>            
        )
    }

    const generateRarity = () => {
        const stars = ({
            "common": 2,
            "rare": 3,
            "elite": 4,
            "super_rare": 5,
            "ultra_rare": 6
        })[weapon.rarity]
        let starIcons = []

        for (let i = 0; i < stars; i++) {
            starIcons.push(
                <img 
                    key={i}
                    src={'./src/assets/rarityStarIcon.png'} 
                    width="15px" 
                    height="15px"
                    style={{
                        position: "absolute",
                        left: i * 10 + "px",
                        zIndex: i
                    }}
                >
                </img>
            )
        }

        return starIcons
    }

    const generateLevel = () => {
        if (weapon.level) return "+" + weapon.level
    }

    const updateWeapon = async (value) => {
        const response = await fetch(HOST + "/weapon/" + encodeURIComponent(value))
        const newWeapon = await response.json()
        setWeapon({
            ...newWeapon,
            level: 10
        })
    }

    return (
        <>
            <div className={weapon.rarity + " equipment-box"} >
                <OverlayTrigger trigger="click" rootClose placement="right" overlay={tooltip()}>
                    <div 
                        className="equipment-selection-button"
                        style={{backgroundImage: "url(" + weapon.imgsrc + ")"}}
                    >
                        <div className="equipment-rarity-box">
                            {generateRarity()}
                        </div>
                        <div className="equipment-level-box">
                            {generateLevel()}
                        </div>
                    </div>
                </OverlayTrigger>
            </div>
        </>
    )
}

function StatsBox({ ship, handleCallBack }) {
    const [level, setLevel] = useState(0)
    const levelMap = [1, 100, 120, 125]

    useEffect(() => {
        handleCallBack({
            "level": levelMap[level]
        })
    }, [level])

    // For pesky undefined ship state errors.
    if (ship == undefined) { 
        ship = {level1: {}} 
    }

    return (
        <div className="box centered-horizontal">
            <h4>Stats</h4>
            <div className="box-inner">
                <Form>
                    <Form.Group as={Row} className="box-sub-inner">
                        <Form.Label column style={{width: "100px", padding: "0px"}}>
                            <h4>
                                Level: {levelMap[level]}
                            </h4>
                        </Form.Label>
                        <Col>
                            <Form.Range 
                                min={0} 
                                value={level} 
                                max={3} 
                                step={1} 
                                onChange={(e) => setLevel(e.target.value)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Health_big.png"
                                label="HP"
                                field={ship["level" + levelMap[level]].health}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/armor_big.png"
                                label={ship["level" + levelMap[level]].armor}
                                field=""
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Reload_big.png"
                                label="RLD"
                                field={ship["level" + levelMap[level]].reload}
                                field2={ship.bonusReload}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Firepower_big.png"
                                label="FP"
                                field={ship["level" + levelMap[level]].firepower}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Torpedo_big.png"
                                label="TRP"
                                field={ship["level" + levelMap[level]].torpedo}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Evasion_big.png"
                                label="EVA"
                                field={ship["level" + levelMap[level]].evasion}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Antiair_big.png"
                                label="AA"
                                field={ship["level" + levelMap[level]].antiair}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Aviation_big.png"
                                label="AVI"
                                field={ship["level" + levelMap[level]].aviation}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Consumption_big.png"
                                label="Cost"
                                field={ship["level" + levelMap[level]].consumption}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col xs="auto">
                            <SingleStatBox 
                                iconsrc="./src/assets/ASW_big.png"
                                label="ASW"
                                field={ship["level" + levelMap[level]].asw}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col xs="auto">
                            <SingleStatBox 
                                iconsrc="./src/assets/Luck_big.png"
                                label="LCK"
                                field={ship["level" + levelMap[level]].luck}
                            />
                        </Col>
                    </Form.Group>
                </Form>
            </div>
        </div>
    );
}

function SingleStatBox({ iconsrc, label, field, field2 }) {
    const display = () => {
        if (field2) {
            return (
                <>
                <h5 className="bonus-stat-display" style={{float: "right", paddingRight: "5px"}}> +{field2}</h5> 
                <h5 style={{float: "right"}}>{field}</h5>
                </>
            )
        }
        else {
            return (<h5 style={{float: "right", paddingRight: "5px"}}>{field}</h5>)
        }
    }

    return (
        <InputGroup className="box-sub-inner">
            <InputGroup.Text className="stat-icon-wrapper">
                <img className="stat-icon" src={iconsrc}></img>
            </InputGroup.Text>
            <Form.Label column style={{width: "150px", padding: "0px", margin:"0px"}}>
                <h5 style={{float: "left"}}>
                    {label}
                </h5>
                {display()}
            </Form.Label>                            
        </InputGroup>
    )
}

function BonusStatsBox({ handleCallBack }) {
    const [bonusReload, setBonusReload] = useState(0)
    const [bonusPercentReload, setBonusPercentReload] = useState(0)
    const [isOathed, setOathed] = useState(false)

    useEffect(() => {
        handleCallBack({
            "bonusReload": bonusReload,
            "bonusPercentReload": bonusPercentReload,
            "isOathed": isOathed
        })
    }, [bonusReload, bonusPercentReload, isOathed])

    return (
        <div className="box centered-horizontal">
            <h4>Bonus Stats</h4>
            <div className="box-inner">
                <Form>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatInputBox 
                                iconsrc="./src/assets/Reload_big.png"
                                label="RLD"
                                value={bonusReload}
                                setValue={(e) => setBonusReload(e.target.value)}
                            />
                        </Col>
                        <Col>
                            <SingleStatInputBox 
                                iconsrc="./src/assets/Reload_big.png"
                                label="RLD (%)"
                                value={bonusPercentReload}
                                setValue={(e) => setBonusPercentReload(e.target.value)}
                            />
                        </Col>
                        <Col>
                            <InputGroup className="box-sub-inner">
                                <InputGroup.Text className="stat-icon-wrapper">
                                    <img className="stat-icon" src="./src/assets/Health_big.png"></img>
                                </InputGroup.Text>
                                <Form.Label column style={{width: "150px", padding: "0px", margin:"0px"}}>
                                    <h5 style={{float: "left"}}>
                                        Oathed?
                                    </h5>
                                    <Form.Check 
                                        className="stat-input" 
                                        type="switch" 
                                        defaultValue={isOathed} 
                                        onChange={(e) => setOathed(e.target.checked)}>
                                    </Form.Check>
                                </Form.Label>                
                            </InputGroup>
                        </Col>
                    </Form.Group>
                </Form>
            </div>
        </div>
    );
}

function SingleStatInputBox({ iconsrc, label, value, setValue }) {
    return (
        <InputGroup className="box-sub-inner">
            <InputGroup.Text className="stat-icon-wrapper">
                <img className="stat-icon" src={iconsrc}></img>
            </InputGroup.Text>
            <Form.Label column style={{width: "150px", padding: "0px", margin:"0px"}}>
                <h5 style={{float: "left"}}>
                    {label}
                </h5>

                <Form.Control className="stat-input" defaultValue={value} onChange={setValue}>
                </Form.Control>
            </Form.Label>                
        </InputGroup>
    )
}

function ShipBox({ ship, handleCallBack }) {
    const generateOptions = () => {
        const data = sessionStorage.getItem('shipNames').split(",")
        let options = []

        data.forEach((ele) => {
            options.push(<option key={ele} value={ele}>{ele}</option>)
        })
    
        options.push(<option key="" value="" defaultValue={true} disabled hidden></option>)

        return options
    }

    const renderTooltip = (
        <Popover id="popover-basic" style={{maxWidth: "100%"}}>
            <Popover.Header as="h3">Add ship?</Popover.Header>
            <Popover.Body >
                <select 
                    value={ship.name}
                    onChange={(e) => updateShip(e.target.value)}
                >
                    {generateOptions()}
                </select>
            </Popover.Body>
        </Popover>        
    )

    const updateShip = async (name) => {
        const response = await fetch(HOST + "/ship/" + encodeURIComponent(name))
        const newShip = await response.json()

        if (!newShip) throw new Error("Failed to load ship information!")

        handleCallBack(newShip)
    }

    const generateRarity = () => {
        const stars = ({
            "common": 2,
            "rare": 3,
            "elite": 4,
            "super_rare": 5,
            "ultra_rare": 6
        })[ship.rarity]
        let starIcons = []

        for (let i = 0; i < stars; i++) {
            starIcons.push(
                <img 
                    key={i}
                    src={'./src/assets/rarityStarIcon.png'} 
                    width="30px" 
                    height="30px"
                    style={{
                        position: "absolute",
                        // Annoying formula centering for stars.
                        left: (i * 20 + ((6 - stars) * 10 + 30)) + "px",
                        zIndex: i
                    }}
                >
                </img>
            )
        }

        return starIcons
    }

    const generateLevel = () => {
        if (ship.level) return "Lv." + ship.level
        else if (ship.name) return "Lv.1"
        else return ""
    }

    return (
        <div className="centered-both">
            <OverlayTrigger trigger="click" rootClose placement="right" overlay={renderTooltip}>
                <div className={ship.rarity} style={{position: "relative"}}>
                    <div 
                        className="ship-icon"
                        style={{backgroundImage: "url(" + ship.imgsrc + ")"}}
                    >
                        <div className="ship-rarity-box">
                            {generateRarity()}
                        </div>
                        <div className="ship-icon-label-box">
                            <div className="ship-icon-label">
                                {ship.name}
                            </div>
                        </div>
                        <div className="ship-icon-label-box" 
                            style={{
                                top: "5px",
                                height: "32px"
                            }}
                        >
                            <img src="./src/assets/BB.png"></img>
                            <div 
                                className="ship-icon-label" 
                                style={{
                                    justifyContent: "right", 
                                    paddingRight: "20px",
                                    transform: "scale(1.2, 1.4)"
                                }}
                            >
                                {generateLevel()}
                            </div>
                        </div>
                    </div>
                </div>
            </OverlayTrigger>
        </div>
    )
}

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
        newShip["ship" + (shipIdx)] = {level1: {}}

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
                                <GearBox/>
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

