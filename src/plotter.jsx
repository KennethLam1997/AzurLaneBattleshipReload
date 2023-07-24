import React, { Component, createRef } from "react";
import * as d3 from "d3"
import { ROWLIMIT } from "./App"

class TimingGraph extends Component {
    constructor(props) {
        super(props)

        this.state = {
            battleDuration: 150, // in seconds.
            barrageDuration: 5, // in seconds
            helena: false,
            helenaCooldown: 20, // in seconds
            helenaDuration: 10 // in seconds
        }
        
        this.fullWidth = 700
        this.fullHeight = 872
        this.margin = {top: 30, right: 30, bottom: 70, left: 60}
        this.width = this.fullWidth - this.margin.left - this.margin.right
        this.height = this.fullHeight - this.margin.top - this.margin.bottom

        this.ref = createRef()
    }

    componentDidMount() {
        this.drawGraph()
    }

    componentDidUpdate() {
        d3.select(this.ref.current).selectAll("*").remove()
        this.drawGraph()
    }

    drawGraph() {
        let data = []
        let start, end = 0

        for (let i = 1; i <= ROWLIMIT; i++) {
            const { name, cooldown } = this.props["ship" + i]

            if (name == '' || cooldown == 0) continue

            start = cooldown
            end = start + this.state.barrageDuration

            while (start <= this.state.battleDuration) {
                data.push({
                    name: name,
                    start: start,
                    end: end,
                    cooldown: cooldown,
                    index: Math.round(start / cooldown)
                })

                start += cooldown
                end = start + this.state.barrageDuration
            }
        }

        // Specifically for self-reference issues in d3.
        // All class reference should use self instead.
        const self = this;

        // Graphing Area
        const svg = d3.select(self.ref.current)
            .append("svg")
                .attr("width", self.fullWidth)
                .attr("height", self.fullHeight)
            .append("g")
                .attr(
                    "transform",
                    "translate(" + self.margin.left + "," + self.margin.top + ")"
                );

        // Title
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", self.width / 2)
            .attr("y", 0 - (self.margin.top / 2))
            .style("font-size", "20px")
            .text("Timing Graph");
        
        // X-Axis
        const x = d3.scaleBand()
            .range([0, self.width])
            .domain(data.map(function(d) { return d.name }))
            .padding([0.2]);

        svg.append("g")
            .attr("transform", "translate(0, " + self.height + ")")
            .call(d3.axisBottom(x));
        
        // X-Axis Label
        svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", self.width / 2)
                .attr("y", self.height + 50)
                .text("Ships");

        // Y-Axis
        const y = d3.scaleLinear()
            .domain([0, self.state.battleDuration])
            .range([self.height, 0]);
        
        svg.append("g")
            .call(d3.axisLeft(y));

        // Y-Axis Label
        svg.append("g")
            .attr("transform", "translate(-30, " + self.height / 2 + ")")
            .append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Time (s)");

        // Adding Helena
        if (self.state.helena) {
            let start = self.state.helenaCooldown
            let end = start + self.state.helenaDuration

            while (start <= self.state.battleDuration) {
                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", function(d) { 
                        if (end > self.state.battleDuration) return 0
                        return y(end) })
                    .attr("width", self.width)
                    .attr("height", function(d) { 
                        if (end > self.state.battleDuration) return y(start) - y(self.state.battleDuration)
                        return y(start) - y(end) })
                    .style("fill-opacity", 0.5)
                    .style("fill", "grey");

                start += self.state.helenaCooldown
                end = start + self.state.helenaDuration
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
                    if (d.end > self.state.battleDuration) return 0
                    return y(d.end)
                })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { 
                    if (d.end > self.state.battleDuration) return y(d.start) - y(self.state.battleDuration)
                    return y(d.start) - y(d.end) 
                })
                .attr("fill", "green");

        // Tooltips on mouseover
        const tooltip = d3.select(self.ref.current)
            .append("div")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px");

        const mouseover = function(event, data) {
            let { name, start, end, cooldown, index } = event.target.__data__
            let barrageOverlap = {}

            for (let i = 0; i < data.length; i++) {
                if (name != data[i].name) {
                    let overlap = 0

                    if (end >= data[i].end) {
                        let newEnd = Math.min(self.state.battleDuration, data[i].end)
                        overlap = Math.max(0, Math.min(newEnd - data[i].start, newEnd - start))
                    }
                    else {
                        let newEnd = Math.min(self.state.battleDuration, end)
                        overlap = Math.max(0, Math.min(newEnd - start, newEnd - data[i].start))
                    }

                    if (overlap > 0) {
                        barrageOverlap[data[i].name] = {
                            start: data[i].start,
                            end: data[i].end,
                            overlap: overlap.toFixed(2)
                        }
                    }
                }
            }

            start = start.toFixed(2)
            end = end.toFixed(2)

            let tooltipHTML = name + "'s #" + index + " barrage<br><br>" + start + "s → " + Math.min(end, self.state.battleDuration) + "s<br><br>"
            
            for (let i = 1; i <= ROWLIMIT; i++) {
                const { name: propName, cooldown: propCooldown } = this.props["ship" + i]

                if (propName == '' || propCooldown == 0) continue

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
        }.bind(self)

        d3.selectAll("#shipRect")
            .on("mouseover", function(event) { return mouseover(event, data) })
            .on("mousemove", function(event){ return tooltip.style("top", (event.pageY + 25)+"px").style("left",(event.pageX)+"px"); })
            .on("mouseout", function() {return tooltip.style("visibility", "hidden"); });
    }

    render() {
        return (
            <>
            <div ref={this.ref}></div>
            <div style={{flexDirection: "column"}}>
                <label>
                    <b>Battle duration (s): </b>
                    <input
                        type="number"
                        defaultValue={this.state.battleDuration}
                        onChange={function(e) {
                            this.setState({
                                battleDuration: parseFloat(e.target.value) || 0
                            })
                        }.bind(this)}
                    >
                    </input>
                </label>
                <br></br>
                <label>
                    <b>Barrage duration (s): </b>
                    <input
                        type="number"
                        defaultValue={this.state.barrageDuration}
                        onChange={function(e) {
                            this.setState({
                                barrageDuration: parseFloat(e.target.value) || 0
                            })
                        }.bind(this)}
                    >
                    </input>
                </label>
                <br></br>
                <label>
                    <b>Highlight Helena Buff?: </b>
                    <input
                        type="checkbox"
                        defaultChecked={this.state.helena}
                        onChange={function(e) {
                            this.setState({
                                helena: e.target.checked
                            })
                        }.bind(this)}
                    >
                    </input>
                </label>
                <br></br>
                <label>
                    <b>Helena Cooldown (s): </b>
                    <input
                        type="number"
                        defaultValue={this.state.helenaCooldown}
                        onChange={function(e) {
                            this.setState({
                                helenaCooldown: parseFloat(e.target.value) || 0
                            })
                        }.bind(this)}
                    >
                    </input>                    
                </label>
            </div>
            </>
        )
    }
}

export default TimingGraph