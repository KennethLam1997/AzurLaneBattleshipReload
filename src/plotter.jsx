import React, { Component, createRef } from "react";
import * as d3 from "d3"
import { ROWLIMIT } from "./App"

class TimingGraph extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ylim: 150, // in seconds.
            barrageDuration: 5, // in seconds
            helena: false
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

            while (start <= this.state.ylim) {
                data.push({
                    name: name,
                    start: start,
                    end: end
                })

                start = end + cooldown
                end = start + this.state.barrageDuration
            }
        }

        // Specifically for self-reference issues in d3.
        // All class reference should use self instead.
        const self = this;

        const svg = d3.select(self.ref.current)
            .append("svg")
                .attr("width", self.fullWidth)
                .attr("height", self.fullHeight)
            .append("g")
                .attr(
                    "transform",
                    "translate(" + self.margin.left + "," + self.margin.top + ")"
                )
        
        const x = d3.scaleBand()
            .range([0, self.width])
            .domain(data.map(function(d) { return d.name }))
            .padding([0.2]);

        svg.append("g")
            .attr("transform", "translate(0, " + self.height + ")")
            .call(d3.axisBottom(x))

        const y = d3.scaleLinear()
            .domain([0, self.state.ylim])
            .range([self.height, 0]);
        
        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.name) })
            .attr("y", function(d) { return y(d.end) })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return y(d.start) - y(d.end) })
            .attr("fill", "green");
    }

    render() {
        return <div ref={this.ref}></div>
    }
}

export default TimingGraph