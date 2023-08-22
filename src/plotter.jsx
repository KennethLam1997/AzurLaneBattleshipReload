import { useState, useRef, createRef, useEffect } from "react"
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import * as d3 from "d3"

import { SingleStatInputBox, ColorInputBox, CheckBox } from "./inputBoxes";

const DEFAULTCOLOR = "#008000" // Default green for graph bars

export default function TimingGraph({ ships }) {
    const [shipSettings, setShipSettings] = useState({})
    const shipSettingsRef = useRef()
    shipSettingsRef.current = shipSettings

    const [battleDuration, setBattleDuration] = useState(150) // in seconds
    const [barrageDuration, setBarrageDuration] = useState(5) // in seconds
    const [helena, setHelena] = useState(false)
    const [helenaCooldown, setHelenaCooldown] = useState(20) // in seconds
    const [helenaDuration, setHelenaDuration] = useState(10) // in seconds

    const fullWidth = 800
    const fullHeight = 900
    const margin = {top: 30, right: 30, bottom: 60, left: 70}
    const width = fullWidth - margin.left - margin.right
    const height = fullHeight - margin.top - margin.bottom
    const ref = createRef()

    useEffect(() => {
        d3.select(ref.current).selectAll("*").remove()
        drawGraph() 
    })

    const drawGraph = () => {
        let data = []
        let start, end = 0

        for (let i = 0; i < ships.length; i++) {
            const name = ships[i].name
            const cooldown = parseFloat(ships[i].cooldown)

            if (name == '' || cooldown == 0 || (shipSettings[name] && shipSettings[name].enable === false)) continue

            start = cooldown
            end = start + barrageDuration

            while (start <= battleDuration) {
                data.push({
                    name: name,
                    start: start,
                    end: end,
                    cooldown: cooldown,
                    index: Math.round(start / cooldown)
                })

                start += cooldown
                end = start + barrageDuration
            }
        }

        // Graphing Area
        const svg = d3.select(ref.current)
            .append("svg")
                .attr("width", fullWidth)
                .attr("height", fullHeight)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Title
        // svg.append("text")
        //     .attr("text-anchor", "middle")
        //     .attr("x", width / 2)
        //     .attr("y", 0 - (margin.top / 2))
        //     .style("font-size", "20px")
        //     .text("Timing Graph");
        
        // X-Axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(function(d) { return d.name }))
            .padding([0.2]);

        svg.append("g")
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.axisBottom(x));
        
        // X-Axis Label
        svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + 50)
                .attr("class", "graph-label")
                .text("Ships");

        // Y-Axis
        const y = d3.scaleLinear()
            .domain([0, battleDuration])
            .range([height, 0]);
        
        svg.append("g")
            .call(d3.axisLeft(y));

        // Y-Axis Label
        svg.append("g")
            .attr("transform", "translate(-40, " + height / 2 + ")")
            .append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("class", "graph-label")
                .text("Battle Time (s)");

        // Adding Helena
        if (helena) {
            let start = helenaCooldown
            let end = start + helenaDuration

            while (start <= battleDuration) {
                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", function(d) { 
                        if (end > battleDuration) return 0
                        return y(end) })
                    .attr("width", width)
                    .attr("height", function(d) { 
                        if (end > battleDuration) return y(start) - y(battleDuration)
                        return y(start) - y(end) })
                    .style("fill-opacity", 0.5)
                    .style("fill", "white");

                start += helenaCooldown
                end = start + helenaDuration
            }
        }

        // Adding data
        svg.selectAll()
            .data(data)
            .enter()
            .append("rect")
                .attr("id", "shipRect")
                .attr("x", function(d) { return x(d.name) })
                .attr("y", function(d) { 
                    if (d.end > battleDuration) return 0
                    return y(d.end)
                })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { 
                    if (d.end > battleDuration) return y(d.start) - y(battleDuration)
                    return y(d.start) - y(d.end) 
                })
                .attr("fill", d => {
                    if (shipSettings[d.name] && shipSettings[d.name].color)
                        return shipSettings[d.name].color
                    else return DEFAULTCOLOR});

        // Tooltips on mouseover
        const tooltip = d3.select(ref.current)
            .append("div")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px");

        const mouseover = (event, data) => {
            let { name, start, end, cooldown, index } = event.target.__data__
            let barrageOverlap = {}

            for (let i = 0; i < data.length; i++) {
                if (name != data[i].name) {
                    let overlap = 0

                    if (end >= data[i].end) {
                        let newEnd = Math.min(battleDuration, data[i].end)
                        overlap = Math.max(0, Math.min(newEnd - data[i].start, newEnd - start))
                    }
                    else {
                        let newEnd = Math.min(battleDuration, end)
                        overlap = Math.max(0, Math.min(newEnd - start, newEnd - data[i].start))
                    }

                    if (overlap > 0) {
                        barrageOverlap[data[i].name] = {
                            overlap: overlap.toFixed(2)
                        }
                    }
                }
            }

            start = start.toFixed(2)
            end = end.toFixed(2)

            let tooltipHTML = name + "'s #" + index + " barrage<br><br>" + start + "s → " + Math.min(end, battleDuration) + "s<br><br>"
            
            for (let i = 0; i < ships.length; i++) {
                const propName = ships[i].name
                const propCooldown = parseFloat(ships[i].cooldown)

                if (propName == '' || propCooldown == 0 || (shipSettings[propName] && shipSettings[propName].enable === false)) continue

                if (name != propName) {
                    if (barrageOverlap[propName]) {
                        tooltipHTML += "<div style='color:green'>Overlapping " + propName + " for " + barrageOverlap[propName].overlap + "s!</div>"
                    }
                    else {
                        tooltipHTML += "<div style='color:red'>NOT Overlapping " + propName + "!</div>"
                    }
                }
            }

            tooltip.style("visibility", "visible")
                .html(tooltipHTML);
        }

        d3.selectAll("#shipRect")
            .on("mouseover", event => mouseover(event, data))
            .on("mousemove", event => {
                // Constrain tooltip to inside graphing area.
                let tooltipX = event.layerX + 25
                let tooltipY = event.layerY + 25
                const tooltipWidth = tooltip.node().getBoundingClientRect().width
                const tooltipHeight = tooltip.node().getBoundingClientRect().height

                if (event.layerX > (fullWidth / 2)) tooltipX -= tooltipWidth + 50
                if (event.layerY > (fullHeight / 2)) {tooltipY -= tooltipHeight + 50;}

                return tooltip.style("top", tooltipY + "px").style("left", tooltipX + "px")})
            .on("mouseout", () => tooltip.style("visibility", "hidden"));
    }

    const updateSettings = (name, state) => {
        const newSettings = {
            ...shipSettingsRef.current[name],
            ...state
        }

        setShipSettings(Object.assign({}, shipSettingsRef.current, {[name]: newSettings}))
    }

    const generateShipSettings = ships.map((ele, idx) => {
        return (
            <ShipSettings 
                    key={idx}
                    label={ele.name}
                    handleCallBack={(state) => updateSettings(ele.name, state)}
                />
        )
    })

    return (
        <>
        <div className="graph-container">
            <div className="tab-container-label">
                <h2><center>Graph</center></h2>
            </div>
            <div className="graph" ref={ref}></div>
        </div>
        <div className="graph-settings-container">
            <div className="tab-container-label">
                <h2><center>Config</center></h2>
            </div>
            <div className="box centered-horizontal" style={{width: "372px"}}>
                <h4>General</h4>
                <div className="box-inner">
                    <Form>
                        <Form.Group as={Row}>
                            <Col>
                                <SingleStatInputBox
                                    label="Battle Duration (s)"
                                    value={battleDuration}
                                    onChange={(e) => setBattleDuration(parseFloat(e.target.value) || 0)}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Col>
                                <SingleStatInputBox
                                    label="Barrage Duration (s)"
                                    value={barrageDuration}
                                    onChange={(e) => setBarrageDuration(parseFloat(e.target.value) || 0)}
                                />
                            </Col>
                        </Form.Group>
                    </Form>
                </div>
            </div>
                {generateShipSettings}
            <div className="box centered-horizontal" style={{width: "372px", top: "50px"}}>
                <h4>Buffs</h4>
                <div className="box-inner">
                    <Form>
                        <Form.Group as={Row}>
                            <Col>
                                <CheckBox
                                    label="Display Helena?"
                                    type="switch"
                                    value={helena}
                                    onChange={(e) => setHelena(e.target.checked)}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Col>
                                <SingleStatInputBox
                                    label="Helena Cooldown (s)"
                                    value={helenaCooldown}
                                    onChange={(e) => setHelenaCooldown(parseFloat(e.target.value) || 0)}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Col>
                                <SingleStatInputBox
                                    label="Helena Duration (s)"
                                    value={helenaDuration}
                                    onChange={(e) => setHelenaDuration(parseFloat(e.target.value) || 0)}
                                />
                            </Col>
                        </Form.Group>
                    </Form>
                </div>
            </div>            
        </div>
        </>
    )
}

// Enable, Color, Manual Override, Order?

function ShipSettings({ label, handleCallBack }) {
    const [isVisible, setVisible] = useState(false)
    const [settings, setSettings] = useState({
        enable: true,
        color: DEFAULTCOLOR
    })

    useEffect(() => {
        handleCallBack(settings)
    }, [settings])

    const content = () => {
        if (isVisible) 
            return (
                <div className="box-inner">
                    <Form>
                        <Form.Group as={Row}>
                            <Col>
                                <CheckBox
                                    label="Enable?"
                                    type="switch"
                                    value={settings.enable}
                                    onChange={(e) => setSettings({...settings, enable: e.target.checked})}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Col>
                                <ColorInputBox
                                    label="Color"
                                    color={settings.color}
                                    onChange={(color) => setSettings({...settings, color: color.hex})}
                                    width="200px"
                                />                            
                            </Col>
                        </Form.Group>
                    </Form>
                </div>
            )

        return null
    }

    return (
        <div 
            className={["box", "centered-horizontal", "ship-settings", isVisible ? "active" : ""].join(" ")} 
            style={{width: "372px", top: "25px"}}
        >
            <div
                className="ship-settings-label" 
                style={{color: settings.color}} 
                onClick={(e) => setVisible(!isVisible)}
            >
                {label}
            </div>
            {content()}
        </div>
    )    
}