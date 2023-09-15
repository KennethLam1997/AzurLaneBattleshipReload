import { useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { OverlayTrigger, Popover } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';

import { CheckBox, SingleStatBox, SingleStatInputBox } from "./inputBoxes";

const SHIPS = JSON.parse(localStorage.getItem('allship'))
const EQUIPMENT = JSON.parse(localStorage.getItem('allequipment'))

export function ShipBox({ ship, database, activeShips, handleCallBack }) {
    const generateOptions = () => {
        let database = SHIPS
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

        database = database.sort(sortFn)
        database = database.filter(val => !activeShips.includes(val.name))

        let options = [<option key="" value="" defaultValue={true} disabled hidden></option>]

        database.forEach((ele) => {
            options.push(<option className={ele.rarity} key={ele.name} value={ele.name}>{ele.name}</option>)
        })

        return options
    }

    const renderTooltip = (
        <Popover id="popover-basic" data-testid="popover-basic" style={{maxWidth: "100%"}}>
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
        const newShip = SHIPS.find(val => val.name == name)
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
                    alt="Ship rarity star icon"
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

    const generateIcon = () => {
        if (ship.imgsrc) return {backgroundImage: "url(" + new URL(ship.imgsrc, import.meta.url).href + ")"}
    }

    return (
        <div className="centered-horizontal-ship-icon" style={{marginTop: "10px"}}>
            <OverlayTrigger trigger="click" rootClose placement="right" overlay={renderTooltip}>
                <div className={ship.rarity} style={{position: "relative"}}>
                    <div 
                        className="ship-icon"
                        style={generateIcon()}
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
                                alt="Ship type icon"
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
            level: levelMap[level]
        })
    }, [level])

    function equipmentStatAccumulator() {

    }

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
                                onChange={(e) => handleCallBack({bonusReload: e.target.value})}
                            />
                        </Col>
                        <Col>
                            <SingleStatInputBox 
                                iconsrc={new URL('/Reload_big.png', import.meta.url).href}
                                label="RLD (%)"
                                value={ship.bonusPercentReload}
                                onChange={(e) => handleCallBack({bonusPercentReload: e.target.value})}
                            />
                        </Col>
                        <Col>
                            <CheckBox
                                iconsrc={new URL('/Health_big.png', import.meta.url).href}
                                label="Oathed?"
                                type="switch"
                                value={ship.isOathed}
                                onChange={(e) => handleCallBack({isOathed: e.target.checked})}
                            />
                        </Col>
                    </Form.Group>
                </Form>
            </div>
        </div>
    );
}

export function GearBox({ ship, database, handleCallBack }) {
    const equipmentLimit = 5

    const generateSelectors = () => {
        let equipmentBoxes = []

        // equipmentBoxes.push(
        //     <Col key={0}>
        //         <EquipmentSelector key={0} ship={ship} handleCallBack={handleCallBack}/>
        //     </Col>
        // )
        
        for (let i = 1; i <= equipmentLimit; i++) {
            equipmentBoxes.push(
                <Col key={i}>
                    <EquipmentSelector 
                        key={i} 
                        database={database}
                        disabled={ship.name ? false : true}
                        equipment={ship.equipment[i] ? ship.equipment[i] : {}} 
                        slot={i}
                        handleCallBack={(state) => {
                            handleCallBack({
                                equipment: {
                                    ...ship.equipment,
                                    [i]: {
                                        ...ship.equipment[i],
                                        equipped: {...state}
                                    }
                                }
                            })  
                        }}
                    />
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

function EquipmentSelector({ equipment, slot, database, handleCallBack, disabled=false }) {
    const [showModal, setShowModal] = useState(false)

    const generateOptions = () => {
        function parseShipEquippableFits(fits) {
            if (fits == "Anti-Air Guns") {
                return "AA Gun"
            }
            else {
                fits = fits.replace(" Main", "")
                fits = fits.endsWith("s") ? fits.slice(0, -1) : fits
                return fits
            }
        }

        let shipSlotFits

        if ([1,2,3].includes(slot)) {
            shipSlotFits = equipment.equippable.map(ele => parseShipEquippableFits(ele))
        }
        else if ([4,5].includes(slot)) {
            shipSlotFits = ["Auxiliary"]
        }
        
        let equipmentList = Object.fromEntries(Object.entries(database).filter(([key]) => shipSlotFits.includes(key)))
        const rarityMap = {
            null: 6,
            "Common": 5,
            "Rare": 4,
            "Elite": 3,
            "Super Rare": 2,
            "Ultra Rare": 1
        }
        const sortFn = (a, b) => {
            let compareRarity = rarityMap[a.rarity] - rarityMap[b.rarity]
            let compareName = a.name.localeCompare(b.name)
            return compareRarity || compareName
        }

        let options = [<option key="" value="" defaultValue={true} disabled hidden></option>]

        for (let [key, value] of Object.entries(equipmentList)) {
            let suboptions = []
            value = value.sort(sortFn)

            value.forEach((equipment, index) => {
                suboptions.push(<option 
                        className={equipment.rarity.toLowerCase().replace(" ", "_")} 
                        key={index} 
                        value={equipment._id}
                    >
                        {equipment.name}
                    </option>
                )
            })

            options.push(<optgroup key={key} label={"===== " + key + " ====="}>{suboptions}</optgroup>)
        }

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
                        value={equipment.equipped ? equipment.equipped.name : ""}
                        onChange={(e) => updateEquipment(e.target.value)}
                    >
                        {generateOptions()}
                    </select>
                </Popover.Body>
            </Popover>            
        )
    }

    const generateImage = () => {
        if (!equipment.equipped) return {}
        return { backgroundImage: "url(" + equipment.equipped.imgsrc + ")" }
    }

    const generateRarity = (width, height, leftOffsetSpacing) => {
        if (!equipment.equipped) return

        const stars = ({
            "Common": 2,
            "Rare": 3,
            "Elite": 4,
            "Super Rare": 5,
            "Ultra Rare": 6
        })[equipment.equipped.rarity]

        let starIcons = []
        let centerStarOffset = 0

        if (stars % 2 != 0) { 
            starIcons.push(
                <img 
                    key={0}
                    src={new URL("/rarityStarIcon.png", import.meta.url).href} 
                    width={width}
                    height={height}
                    style={{
                        position: "absolute",
                        left: -Math.floor(width / 2) + "px",
                        zIndex: 10
                    }}
                />              
            )
        }
        else {
            centerStarOffset = leftOffsetSpacing / 2
        }

        for (let i = 1; i < Math.floor(stars / 2) + 1; i++) {
            starIcons.push(                
                <img 
                    key={-i}
                    src={new URL("/rarityStarIcon.png", import.meta.url).href} 
                    width={width + "px"}
                    height={height + "px"}
                    style={{
                        position: "absolute",
                        left: -i * leftOffsetSpacing + centerStarOffset - Math.floor(width / 2) + "px",
                        zIndex: 10 - i
                    }}
                />,
                <img 
                    key={i}
                    src={new URL("/rarityStarIcon.png", import.meta.url).href} 
                    width={width + "px"}
                    height={height + "px"}
                    style={{
                        position: "absolute",
                        left: i * leftOffsetSpacing - centerStarOffset - Math.floor(width / 2) + "px",
                        zIndex: 10 + i
                    }}
                />
            )
        }

        return starIcons
    }

    const generateEnhance = () => {
        if (!equipment.equipped) return
        else if (equipment.equipped.enhance) return "+" + equipment.equipped.enhance
    }

    const updateEquipment = async (id) => {
        const newEquipped = EQUIPMENT.find(val => val._id == id)
        if (!newEquipped) throw new Error("Weapon could not be loaded!")

        handleCallBack(newEquipped)
    }

    const handleShowModal = () => setShowModal(true)
    const handleCloseModal = () => setShowModal(false)

    return (
        <div className={[equipment.equipped ? equipment.equipped.rarity.toLowerCase().replace(" ", "_") : "", "equipment-box"].join(" ")}>
            <div 
                className="equipment-selection-button"
                style={generateImage()}
                onClick={handleShowModal}
            >
                <div className={"equipment-stars"}>
                    {generateRarity(15, 15, 10)}
                </div>
                <div className="equipment-level-box">
                    {generateEnhance()}
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <div className="equipment-modal-header">
                    <center>
                        <h4 className="equipment-modal-header-text">{equipment.equipped.name}</h4>
                    </center>
                </div>
                <div 
                    className={[equipment.equipped ? equipment.equipped.rarity.toLowerCase().replace(" ", "_") : "", "equipment-modal-icon-container"].join(" ")}
                >
                    <div 
                        className={["equipment-modal-icon", "centered-both"].join(" ")}
                        style={generateImage()}>
                    </div>
                    <div className={"equipment-stars"}>
                        {generateRarity(30, 30, 20)}
                    </div>
                </div>
            </Modal>
        </div>        
    )

    return (
        <div className={[equipment.equipped ? equipment.equipped.rarity.toLowerCase().replace(" ", "_") : "", "equipment-box"].join(" ")}>
            <OverlayTrigger trigger="click" rootClose placement="right" overlay={tooltip()}>
                <div 
                    className="equipment-selection-button"
                    style={generateImage()}
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
    )
}

