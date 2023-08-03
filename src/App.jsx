import { useRef, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
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

        for (let i = 0; i < EQUIPMENTLIMIT; i++) {
            equipmentBoxes.push(
                <Col key={i}>
                    <EquipmentSelector key={i}/>
                </Col>
            )
        }

        return equipmentBoxes
    }

    return (
        <div className="box"
        >
            <h4>Gear</h4>
            <div className="box-inner"
            >
                <Form>
                    <Row>
                        {generateSelectors()}
                    </Row>
                </Form>
            </div>
        </div>
    );
}

function EquipmentSelector() {
    const [imgsrc, setImgsrc] = useState('./src/assets/equipmentAddIcon.png')
    const [weaponRarity, setWeaponRarity] = useState('')

    const generateOptions = () => {
        const data = sessionStorage.getItem('weaponNames').split(",")
        let options = []

        data.forEach((ele) => {
            options.push(<option key={ele} value={ele}>{ele}</option>)
        })

        options.push(<option key="" value="" defaultValue={true} disabled hidden></option>)

        return options
    }

    const renderTooltip = (
        <Popover id="popover-basic" style={{maxWidth: "100%"}}>
            <Popover.Header as="h3">Add equipment?</Popover.Header>
            <Popover.Body >
                <select onChange={(e) => updateWeapon(e.target.value)}>
                    {generateOptions()}
                </select>
            </Popover.Body>
        </Popover>
    )

    const generateRarity = () => {
        const stars = ({
            "common": 2,
            "rare": 3,
            "elite": 4,
            "super_rare": 5,
            "ultra_rare": 6
        })[weaponRarity]
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

    const updateWeapon = async (value) => {
        const response = await fetch(HOST + "/weapon/" + encodeURIComponent(value))
        const weapon = await response.json()
        setImgsrc(weapon.imgsrc)
        setWeaponRarity(weapon.rarity)
    }

    return (
        <>
            <div className={weaponRarity + " equipment-box"} >
                <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={renderTooltip}>
                    <div 
                        className="equipment-selection-button"
                        style={{backgroundImage: "url(" + imgsrc + ")"}}
                    >
                        <div className="equipment-rarity-box">
                            {generateRarity()}
                        </div>
                    </div>
                </OverlayTrigger>
            </div>
        </>
    )
}

function StatsBox({ ship }) {
    const [level, setLevel] = useState(0)
    const levelMap = [1, 100, 120, 125]

    // For pesky undefined ship state errors.
    if (ship == undefined) { 
        ship = {level1: {}} 
    }

    return (
        <div className="box"
        >
            <h4>Stats</h4>
            <div className="box-inner"
            >
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

function SingleStatBox({ iconsrc, label, field }) {
    return (
        <InputGroup className="box-sub-inner">
            <InputGroup.Text className="stat-icon-wrapper">
                <img className="stat-icon" src={iconsrc}></img>
            </InputGroup.Text>
            <Form.Label column style={{width: "150px", padding: "0px", margin:"0px"}}>
                <h5 style={{float: "left"}}>
                    {label}
                </h5>
                <h5 style={{float: "right", paddingRight: "5px"}}>
                    {field}
                </h5>
            </Form.Label>                            
        </InputGroup>
    )
}

function ShipBox({ handleCallBack }) {
    const [ship, setShip] = useState({name: "???"})

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
                <select onChange={(e) => updateShip(e.target.value)}>
                    {generateOptions()}
                </select>
            </Popover.Body>
        </Popover>        
    )

    const updateShip = async (name) => {
        const response = await fetch(HOST + "/ship/" + encodeURIComponent(name))
        const newShip = await response.json()

        if (!newShip) throw new Error("Failed to load ship information!")

        setShip(newShip)
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
                        left: i * 20 + "px",
                        zIndex: i
                    }}
                >
                </img>
            )
        }

        return starIcons
    }

    return (
        <div className="box"
        >
            <h4>{ship.name}</h4>
            <div className="box-inner"
            >
                <Form>
                    <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={renderTooltip}>
                        <div className={ship.rarity} style={{position: "relative"}}>
                            <div 
                                className="ship-icon"
                                style={{backgroundImage: "url(" + ship.imgsrc + ")"}}
                            >
                                <div className="ship-rarity-box">
                                    {generateRarity()}
                                </div>
                            </div>
                        </div>
                    </OverlayTrigger>
                </Form>
            </div>
        </div>
    )
}

export default function App () {
    const [shipIdx, setShipIdx] = useState(0)
    const [ship, setShip] = useState({ currentTab: null })
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

    function handleCallBack (i, state) {
        // Since callbacks don't use current state, use ref.
        setShip({
            ...shipRef.current,
            ["ship" + i]: state
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
            name: '', 
            cooldown: 0, 
            imgsrc: './src/assets/unknown_ship_icon.png',
            level1: {}
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
                    <GearBox/>
                    <StatsBox ship={ship["ship" + idx]}/>
                    <ShipBox handleCallBack={(state) => handleCallBack(idx, state)}/>
                </Tab>
            )
        })

        return (
            <div style={{ display: 'block', width: 700, padding: 30 }}>
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

