import { useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { InputGroup, OverlayTrigger, Popover } from "react-bootstrap";

let HOST = 'https://xanderking-azurlane.onrender.com'

if (import.meta.env.DEV) {
    HOST = import.meta.env.VITE_BASEURL
}

const EQUIPMENTLIMIT = 5


export function ShipBox({ ship, handleCallBack }) {
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
                                height: "27px"
                            }}
                        >
                            <img 
                                src="./src/assets/BB.png"
                                height="27px"
                            ></img>
                            <div 
                                className="ship-icon-label" 
                                style={{
                                    justifyContent: "right", 
                                    paddingRight: "5px"
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

export function StatsBox({ ship, handleCallBack }) {
    const [level, setLevel] = useState(0)
    const levelMap = [1, 100, 120, 125]

    useEffect(() => {
        handleCallBack({
            "level": levelMap[level]
        })
    }, [level])

    // For pesky undefined ship state errors.
    if (ship == undefined) { 
        ship = {level1: {}, level100: {}, level120: {}, level125: {}} 
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
                    <hr></hr>
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

export function BonusStatsBox({ handleCallBack }) {
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

export function GearBox({ ship, handleCallBack }) {
    const generateSelectors = () => {
        let equipmentBoxes = []

        equipmentBoxes.push(
            <Col key={0}>
                <EquipmentSelector key={0} ship={ship} handleCallBack={handleCallBack}/>
            </Col>
        )
        
        // Other features in dev, disable elements.
        for (let i = 1; i < EQUIPMENTLIMIT; i++) {
            equipmentBoxes.push(
                <Col key={i}>
                    <EquipmentSelector key={i} disabled={true} handleCallBack={handleCallBack}/>
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

export function GearStatsBox({ ship, handleCallBack }) {
    const [enhance, setEnhance] = useState(0)
    const enhanceMap = [0, 10]

    // For pesky undefined ship state errors.
    if (ship == undefined) { 
        ship = {weapon: {enhance0: {}, enhance10: {}}} 
    }

    useEffect(() => {
        handleCallBack({
            weapon: {
                ...ship.weapon,
                enhance: enhanceMap[enhance]
            }
        })
    }, [enhance])

    return (
        <div className="box centered-horizontal" style={{width: "600px"}}>
            <h4>Stats</h4>
            <div className="box-inner">
                <Form>
                    <Form.Group as={Row} className="box-sub-inner">
                        <Form.Label column style={{width: "100px", padding: "0px"}}>
                            <h4>
                                Enhance: {enhanceMap[enhance]}
                            </h4>
                        </Form.Label>
                        <Col>
                            <Form.Range 
                                min={0} 
                                value={enhance} 
                                max={1} 
                                step={1} 
                                onChange={(e) => setEnhance(e.target.value)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Firepower_big.png"
                                label="FP"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].firepower}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc="./src/assets/Antiair_big.png"
                                label="AA"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].antiair}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="Damage"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].damage}
                            />
                        </Col>
                    </Form.Group>  
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                label="Rate of Fire"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].rof + "s"}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="Spread"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].spread}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="Angle"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].angle + "°"}
                            />
                        </Col>
                    </Form.Group>         
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                label="Range"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].range}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="Volley"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].volley}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="Volley Time"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].volleyTime + "s"}
                            />
                        </Col>
                    </Form.Group>   
                    <hr></hr>
                    <Form.Group as={Row}>
                        <Col xs="4">
                            <SingleStatBox 
                                label="Type"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].ammoType}
                            />
                        </Col>
                    </Form.Group>  
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                label="LT Eff."
                                field={ship.weapon["enhance" + enhanceMap[enhance]].light + "%"}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="MED Eff."
                                field={ship.weapon["enhance" + enhanceMap[enhance]].medium + "%"}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="HVY Eff."
                                field={ship.weapon["enhance" + enhanceMap[enhance]].heavy + "%"}
                            />
                        </Col>
                    </Form.Group>                           
                </Form>
            </div>
        </div>
    )    
}

function EquipmentSelector({ ship, handleCallBack, disabled=false }) {
    // For pesky undefined ship state errors.
    if (ship == undefined) { 
        ship = {weapon: {imgsrc: './src/assets/equipmentAddIcon.png'}} 
    }

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
                        value={ship.weapon.name}
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
        })[ship.weapon.rarity]
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

    const generateEnhance = () => {
        if (ship.weapon.enhance) return "+" + ship.weapon.enhance
    }

    const updateWeapon = async (value) => {
        const response = await fetch(HOST + "/weapon/" + encodeURIComponent(value))
        const newWeapon = await response.json()

        if (!newWeapon) throw new Error("Weapon could not be loaded!")

        handleCallBack({
            weapon: {
                ...ship.weapon,
                ...newWeapon
            }
        })
    }

    return (
        <>
            <div className={ship.weapon.rarity + " equipment-box"} >
                <OverlayTrigger trigger="click" rootClose placement="right" overlay={tooltip()}>
                    <div 
                        className="equipment-selection-button"
                        style={{backgroundImage: "url(" + ship.weapon.imgsrc + ")"}}
                    >
                        <div className="equipment-rarity-box">
                            {generateRarity()}
                        </div>
                        <div className="equipment-level-box">
                            {generateEnhance()}
                        </div>
                    </div>
                </OverlayTrigger>
            </div>
        </>
    )
}

function SingleStatBox({ iconsrc, label, field, field2 }) {
    const displayIcon = () => {
        if (iconsrc) return (
            <InputGroup.Text className="stat-icon-wrapper">
                <img className="stat-icon" src={iconsrc}></img>
            </InputGroup.Text>
        )
    }

    const displayFields = () => {
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
            {displayIcon()}
            <Form.Label column style={{width: "150px", padding: "0px", margin:"0px"}}>
                <h5 style={{float: "left"}}>
                    {label}
                </h5>
                {displayFields()}
            </Form.Label>                            
        </InputGroup>
    )
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