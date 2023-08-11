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
        let allShips = JSON.parse(sessionStorage.getItem('allship'))
        const rarityMap = {
            null: 6,
            "common": 5,
            "rare": 4,
            "elite": 3,
            "super_rare": 2,
            "ultra_rare": 1
        }
        const sortFn = (a,b) => {
            let compareRarity = rarityMap[a.rarity] - rarityMap[b.rarity]
            let compareName = a.name.localeCompare(b.name)
            return compareRarity || compareName
        }

        allShips = allShips.sort(sortFn)
        let options = [<option key="" value="" defaultValue={true} disabled hidden></option>]

        allShips.forEach((ele) => {
            options.push(<option className={ele.rarity} key={ele.name} value={ele.name}>{ele.name}</option>)
        })

        return options
    }

    const renderTooltip = (
        <Popover id="popover-basic" style={{maxWidth: "100%"}}>
            <Popover.Header>Add ship?</Popover.Header>
            <Popover.Body >
                <select 
                    value={ship.name || ""}
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
                    src={new URL("/rarityStarIcon.png", import.meta.url).href} 
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
        <div className="centered-horizontal-ship-icon" style={{marginTop: "10px"}}>
            <OverlayTrigger trigger="click" rootClose placement="right" overlay={renderTooltip}>
                <div className={ship.rarity} style={{position: "relative"}}>
                    <div 
                        className="ship-icon"
                        style={{backgroundImage: "url(" + new URL(ship.imgsrc, import.meta.url).href + ")"}}
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
                                src={new URL('/BB.png', import.meta.url).href}
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
    const levelMap = [1, 100, 120, 125]
    const [level, setLevel] = useState(ship !== undefined ? levelMap.indexOf(ship.level) : 0)
    
    useEffect(() => {
        handleCallBack({
            "level": levelMap[level]
        })
    }, [level])

    return (
        <div className="box centered-horizontal" style={{top: "10px"}}>
            <h4 className="min-label">{ship.name}</h4>
            <div className="box-inner">
                <Form>
                    <Form.Group as={Row} className="box-sub-inner">
                        <Form.Label column style={{width: "100px", padding: "0px"}}>
                            <h5>Level {ship.level}</h5>
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
                                iconsrc={new URL('/Health_big.png', import.meta.url).href}
                                label="HP"
                                field={ship["level" + ship.level].health}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/armor_big.png', import.meta.url).href}
                                label={ship["level" + ship.level].armor}
                                field=""
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/Reload_big.png', import.meta.url).href}
                                label="RLD"
                                field={ship["level" + ship.level].reload}
                                field2={ship.bonusReload}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/Firepower_big.png', import.meta.url).href}
                                label="FP"
                                field={ship["level" + ship.level].firepower}
                                field2={ship.weapon["enhance" + ship.weapon.enhance].firepower}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/Torpedo_big.png', import.meta.url).href}
                                label="TRP"
                                field={ship["level" + ship.level].torpedo}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/Evasion_big.png', import.meta.url).href}
                                label="EVA"
                                field={ship["level" + ship.level].evasion}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/AntiAir_big.png', import.meta.url).href}
                                label="AA"
                                field={ship["level" + ship.level].antiair}
                                field2={ship.weapon["enhance" + ship.weapon.enhance].antiair}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/Aviation_big.png', import.meta.url).href}
                                label="AVI"
                                field={ship["level" + ship.level].aviation}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/Consumption_big.png', import.meta.url).href}
                                label="Cost"
                                field={ship["level" + ship.level].consumption}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col xs="auto">
                            <SingleStatBox 
                                iconsrc={new URL('/ASW_big.png', import.meta.url).href}
                                label="ASW"
                                field={ship["level" + ship.level].asw}
                            />
                        </Col>
                    </Form.Group>
                    <hr></hr>
                    <Form.Group as={Row}>
                        <Col xs="auto">
                            <SingleStatBox 
                                iconsrc={new URL('/Luck_big.png', import.meta.url).href}
                                label="LCK"
                                field={ship["level" + ship.level].luck}
                            />
                        </Col>
                    </Form.Group>
                </Form>
            </div>
        </div>
    );
}

export function BonusStatsBox({ ship, handleCallBack }) {
    return (
        <div className="box centered-horizontal" style={{top: "10px"}}>
            <h4>Bonus Stats</h4>
            <div className="box-inner">
                <Form>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatInputBox 
                                iconsrc={new URL('/Reload_big.png', import.meta.url).href}
                                label="RLD"
                                value={ship.bonusReload}
                                setValue={(e) => handleCallBack({"bonusReload": e.target.value})}
                            />
                        </Col>
                        <Col>
                            <SingleStatInputBox 
                                iconsrc={new URL('/Reload_big.png', import.meta.url).href}
                                label="RLD (%)"
                                value={ship.bonusPercentReload}
                                setValue={(e) => handleCallBack({"bonusPercentReload": e.target.value})}
                            />
                        </Col>
                        <Col>
                            <InputGroup className="box-sub-inner">
                                <InputGroup.Text className="stat-icon-wrapper">
                                    <img className="stat-icon" src={new URL('/Health_big.png', import.meta.url).href}></img>
                                </InputGroup.Text>
                                <Form.Label column style={{width: "150px", padding: "0px", margin:"0px"}}>
                                    <h5 style={{float: "left"}}>
                                        Oathed?
                                    </h5>
                                    <Form.Check 
                                        className="stat-input" 
                                        type="switch" 
                                        defaultChecked={ship.isOathed} 
                                        onChange={(e) => handleCallBack({"isOathed": e.target.checked})}>
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
        <div className="box centered-horizontal" style={{top: "283px"}}>
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
    const enhanceMap = [0, 10]
    const [enhance, setEnhance] = useState(ship.weapon !== undefined ? enhanceMap.indexOf(ship.weapon.enhance) : 0)

    useEffect(() => {
        handleCallBack({
            weapon: {
                ...ship.weapon,
                enhance: enhanceMap[enhance]
            }
        })
    }, [enhance])

    return (
        <div className="box centered-horizontal" style={{width: "600px", top: "30px"}}>
            <h4 className="min-label">{ship.weapon.name}</h4>
            <div className="box-inner">
                <Form>
                    <Form.Group as={Row} className="box-sub-inner">
                        <Form.Label column style={{width: "100px", padding: "0px"}}>
                            <h5>Enhance +{enhanceMap[enhance]}</h5>
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
                                iconsrc={new URL('/Firepower_big.png', import.meta.url).href}
                                label="FP"
                                field={ship.weapon["enhance" + enhanceMap[enhance]].firepower}
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                iconsrc={new URL('/AntiAir_big.png', import.meta.url).href}
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
                                field={ship.weapon["enhance" + enhanceMap[enhance]].rof}
                                suffix="s"
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
                                field={ship.weapon["enhance" + enhanceMap[enhance]].angle}
                                suffix="°"
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
                                field={ship.weapon["enhance" + enhanceMap[enhance]].volleyTime}
                                suffix="s"
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
                                field={ship.weapon["enhance" + enhanceMap[enhance]].light}
                                suffix="%"
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="MED Eff."
                                field={ship.weapon["enhance" + enhanceMap[enhance]].medium}
                                suffix="%"
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="HVY Eff."
                                field={ship.weapon["enhance" + enhanceMap[enhance]].heavy}
                                suffix="%"
                            />
                        </Col>
                    </Form.Group>                           
                </Form>
            </div>
        </div>
    )    
}

export function CalculationBox({ ship, handleCallBack }) {
    return (
        <div className="box centered-horizontal" style={{marginTop: "46px", width: "400px", top: "302px"}}>
            <h4>Calculations</h4>
            <div className="box-inner">
                <Form>
                    <Form.Group as={Row}>
                        <Col>
                            <SingleStatBox 
                                label="First Cooldown"
                                field="?"
                                suffix="s"
                            />
                        </Col>
                        <Col>
                            <SingleStatBox 
                                label="Cooldown"
                                field={ship.cooldown}
                                suffix="s"
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
        ship = {weapon: {imgsrc: new URL("/equipmentAddIcon.png", import.meta.url).href}} 
    }

    const generateOptions = () => {
        const allWeapons = JSON.parse(sessionStorage.getItem('allweapon'))
        const allWeaponTypes = ["HE", "AP", "Normal", "AP+", "AP^", "AP*", "SAP", "AP4", "APMKD", "Sanshikidan"]
        const rarityMap = {
            null: 6,
            "common": 5,
            "rare": 4,
            "elite": 3,
            "super_rare": 2,
            "ultra_rare": 1
        }
        const prefixMap = {"Twin": 4, "Triple": 3, "Quadruple": 2}
        const sortFn = (a, b) => {
            let compareRarity = rarityMap[a.rarity] - rarityMap[b.rarity]
            let comparePrefix = prefixMap[a.name.match(/(Twin|Triple|Quadruple)/)[0]] - prefixMap[b.name.match(/(Twin|Triple|Quadruple)/)[0]]
            let compareName = a.name.localeCompare(b.name)
            return compareRarity || comparePrefix || compareName
        }

        let options = [<option key="" value="" defaultValue={true} disabled hidden></option>]

        allWeaponTypes.forEach(type => {
            let suboptions = []
            const weaponsOfType = allWeapons.filter(val => val.enhance0.ammoType === type).sort(sortFn)
            weaponsOfType.forEach(val => suboptions.push(<option className={val.rarity} key={val.name} value={val.name}>{val.name}</option>))
            options.push(<optgroup key={type} label={"===== " + type + " Guns ====="}>{suboptions}</optgroup>)
        })

        return options
    }

    const tooltip = () => {
        if (disabled) return (
            <Popover id="popover-basic" style={{maxWidth: "100%"}}>
                <Popover.Header>Feature under development!</Popover.Header>
                <Popover.Body >
                    Check back for any updates.
                </Popover.Body>
            </Popover>            
        )

        return (
            <Popover id="popover-basic" style={{maxWidth: "100%"}}>
                <Popover.Header>Add equipment?</Popover.Header>
                <Popover.Body>
                    <select 
                        value={ship.weapon.name || ""}
                        onChange={(e) => updateWeapon(e.target.value)}
                    >
                        {generateOptions()}
                    </select>
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
                    src={new URL("/rarityStarIcon.png", import.meta.url).href} 
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

function SingleStatBox({ iconsrc, label, field, suffix, field2, suffix2 }) {
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
                <h5 className="bonus-stat-display" style={{float: "right", paddingRight: "5px"}}> +{field2}{suffix2}</h5> 
                <h5 style={{float: "right"}}>{field}{suffix}</h5>
                </>
            )
        }
        else if (field != undefined) {
            return (<h5 style={{float: "right", paddingRight: "5px"}}>{field}{suffix}</h5>)
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