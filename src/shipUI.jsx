import { useEffect, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { OverlayTrigger, Popover } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';

import { CheckBox, SingleStatBox, SingleStatInputBox } from "./inputBoxes";
import { sum } from "d3";

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

    const generateFields = () => {
        const statFields = [
            ["HP",  "health"],
            ["",    "armor"],
            ["RLD", "reload"],
            ["FP",  "firepower"],
            ["TRP", "torpedo"],
            ["EVA", "evasion"],
            ["AA",  "antiair"],
            ["AVI", "aviation"],
            ["Cost", "consumption"]
        ]
        let fields = []
        const sectionSize = 3
        let idx = 0

        while (idx < statFields.length) {
            fields.push(
                <Form.Group as={Row}>
                    {statFields.slice(idx, idx + sectionSize).map((ele) => 
                        <Col>
                            <SingleStatBox
                                iconsrc={new URL('/' + ele[1] + '.png', import.meta.url).href}
                                label={ele[0]}
                                field={ship["level" + ship.level][ele[1]]}
                                field2={ship.bonusStats[ele[1]]}
                            />                        
                        </Col>
                    )}
                </Form.Group>
            )

            idx += sectionSize
        }

        fields.push(
            <>
            <Form.Group as={Row}>
                <Col xs="auto">
                    <SingleStatBox
                        iconsrc={new URL('/asw.png', import.meta.url).href}
                        label="ASW"
                        field={ship["level" + ship.level]["asw"]}
                        field2={ship.bonusStats["asw"]}
                    />                        
                </Col>
            </Form.Group>
            <hr></hr>
            <Form.Group as={Row}>
                <Col xs="auto">
                    <SingleStatBox
                        iconsrc={new URL('/luck.png', import.meta.url).href}
                        label="LCK"
                        field={ship["level" + ship.level]["luck"]}
                        field2={ship.bonusStats["luck"]}
                    />                        
                </Col>
            </Form.Group>
            </>
        )

        return fields
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
                    {generateFields()}
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
        
        for (const i of [1, 2, 3, 4, 5, "Augment"]) {
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
                                        ...state
                                    }
                                }
                            })  
                        }}
                    />
                </Col>
            )
        }

        // equipmentBoxes.push(
        //     <Col key={"Augment"}>
        //         <EquipmentSelector 
        //             key={"Augment"} 
        //             database={database}
        //             disabled={ship.name ? false : true}
        //             equipment={ship.equipment["Augment"] ? ship.equipment["Augment"] : {}} 
        //             slot={"Augment"}
        //             handleCallBack={(state) => {
        //                 handleCallBack({
        //                     equipment: {
        //                         ...ship.equipment,
        //                         Augment: {...state}
        //                     }
        //                 })  
        //             }}
        //         />
        //     </Col>
        // )

        return equipmentBoxes
    }

    return (
        <div className="box centered-horizontal" style={{marginTop: "10px", marginBottom: "10px"}}>
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
        else if (slot == "Augment") {
            shipSlotFits = ["Augment Module"]
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

            value.forEach((equipmentItem, index) => {
                if (slot == "Augment" && !equipment.equippable.includes(equipmentItem.name)) return

                suboptions.push(<option 
                        className={equipmentItem.rarity.toLowerCase().replace(" ", "_")} 
                        key={index} 
                        value={equipmentItem._id}
                    >
                        {equipmentItem.name}
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
        if (!equipment.equipped) {
            if (slot != 6) return { backgroundImage: "url(" + new URL('/equipmentAddIcon.png', import.meta.url).href + ")" }
            else return { backgroundImage: "url(" + new URL('/augmentAddIcon.png', import.meta.url).href + ")" }
        }

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
        else if (equipment.enhance) return "+" + equipment.enhance
    }

    const generateModalStats = () => {
        if (!equipment.equipped) return

        const self = equipment.equipped["enhance" + equipment.enhance]

        const statStructure = new Map([
            ["DMG", self.damage],
            ["FR",  self.rof],
            ["HP",  self.health],
            ["FP",  self.firepower],
            ["AA",  self.antiair],
            ["TRP", self.torpedo],
            ["AVI", self.aviation],
            ["RLD", self.reload],
            ["EVA", self.evasion],
            ["ASW", self.asw],
            ["OXY", self.oxygen],
            ["LCK", self.luck],
            ["ACC", self.accuracy]
        ])

        if (equipment.equipped.type.includes("Gun")) {
            const subsection = [
                ["AmmoType",     self.ammoType],
                ["Light Mod.",   self.light],
                ["Med Mod.",     self.medium],
                ["Heavy Mod.",   self.heavy],
                ["Spread Range", self.spread],
                ["Volley",       self.volley],
                ["Volley Time",  self.volleyTime]
            ]

            for (const ele of subsection) {
                statStructure.set(ele[0], ele[1])
            }
        }
        else if (["Dive Bomber", "Fighter", "Seaplane", "Torpedo Bomber"].includes(equipment.equipped.type)) {
            const subsection = [
                ["Armaments", ""],
                ["Guns",        self.antiairGuns],
                ["Torpedoes",   self.torpedoes],
                ["Bombs",       self.bombs],
                ["Plane Speed", self.speed],
                ["Plane Health", self.planeHealth],
                ["Max Plane Eva.", self.dodgeLimit],
                ["Crash Damage", self.crashDamage]
            ]

            for (const ele of subsection) {
                statStructure.set(ele[0], ele[1])
            }
        }
        else {
            statStructure.set("SPD", self.speed)
        }

        statStructure.set("Gear Properties", "")
        statStructure.set("Range", self.range)
        statStructure.set("Faction", equipment.equipped.nation)

        if (equipment.equipped.notes) {
            statStructure.set("Notes", "")
            statStructure.set("", <div style={{marginLeft: "10px"}}>{equipment.equipped.notes}</div>)
        }

        let boxes = []

        for (let [key, value] of statStructure) {
            if (value == undefined) continue

            let leftMarginOffset = 10

            if (key == "FR") value += "s/wave"
            else if ([
                    "Light Mod.", 
                    "Med Mod.", 
                    "Heavy Mod.", 
                    "Spread Range", 
                    "Volley", 
                    "Volley Time", 
                    "Range", 
                    "Faction",
                    "Guns",
                    "Torpedoes",
                    "Bombs",
                    "Plane Speed",
                    "Plane Health",
                    "Max Plane Eva.",
                    "Crash Damage",
                    ""
                ].includes(key)) {
                leftMarginOffset = 30
            }

            boxes.push(
                <div className="equipment-modal-statbox" style={{marginLeft: leftMarginOffset + "px"}}>
                    <div style={{float: "left", paddingLeft: "10px"}}>
                        <h5>{key}</h5>
                    </div>
                    <div style={{float: "right", paddingRight: "10px"}}>
                        <h5 className="h5-yellow">{value}</h5>
                    </div>
                </div>                
            )
        }

        return boxes
    }

    const updateEquipment = async (id) => {
        const newEquipped = EQUIPMENT.find(val => val._id == id)
        if (!newEquipped) throw new Error("Weapon could not be loaded!")

        handleCallBack({
            ...equipment,
            equipped: {
                ...newEquipped
            }
        })
    }

    const updateEnhance = () => {
        handleCallBack({
            ...equipment,
            enhance: equipment.enhance == 0 ? 10 : 0
        })
    }
    
    // Damage, RoF, Stats, Ammo Props, Gear Props, Fits...

    return (
        <div className={[equipment.equipped ? equipment.equipped.rarity.toLowerCase().replace(" ", "_") : "", "equipment-box"].join(" ")}>
            <div 
                className="equipment-selection-button"
                style={generateImage()}
                onClick={() => setShowModal(true)}
            >
                <div className={"equipment-stars"} style={{top: "80%"}}>
                    {generateRarity(15, 15, 10)}
                </div>
                <div className="equipment-level-box">
                    {generateEnhance()}
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="equipment-modal">
                <div className="equipment-modal-content">
                    <center>
                        <h4 className="equipment-modal-header-text">{equipment.equipped ? equipment.equipped.name : ""}</h4>
                    </center>
                </div>
                <div 
                    className={[equipment.equipped ? equipment.equipped.rarity.toLowerCase().replace(" ", "_") : "", "equipment-modal-icon-container"].join(" ")}
                >
                    <div 
                        className={["equipment-modal-icon", "centered-both"].join(" ")}
                        style={generateImage()}>

                        <div className={"equipment-stars"} style={{top: "100%"}}>
                            {generateRarity(30, 30, 15)}
                        </div>
                    </div>
                </div>
                <div className="equipment-modal-content" style={{display: "flex", flexDirection: "column", overflowY: "auto"}}>
                    {generateModalStats()}
                </div>
                <div className="equipment-modal-button-div">
                    <button>
                        <h3>Unequip</h3>
                    </button>
                    <button>
                        <h3>Change</h3>
                    </button>
                    <button onClick={() => updateEnhance()}>
                        <h3>{equipment.enhance == 0 ? "Enhance +10" : "Unenhance"}</h3> 
                    </button>
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

