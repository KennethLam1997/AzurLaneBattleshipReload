import React, { Component, createRef } from "react";
import * as d3 from "d3"
import { ROWLIMIT } from "./App"

class TimingGraph extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ylim: 150, // seconds.
            helena: false
        }

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
        console.log(this.props)

        let data = []

        for (let i = 1; i <= ROWLIMIT; i++) {
            if (this.props["ship" + i] != undefined && this.props["ship" + i].cooldown != '') {
                data.push(parseFloat(this.props["ship" + i].cooldown))
            }
        }

        const svg = d3.select(this.ref.current).append("svg").attr("width", 700).attr("height", 300)
        svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 70)
        .attr("y", 0)
        .attr("width", 65)
        .attr("height", (d, i) => d)
        .attr("fill", "green");
    }

    render() {
        return <div ref={this.ref}></div>
    }

    // removeGraph() {
    //     const graph = document.getElementById("timingGraph")

    //     while (graph.hasChildNodes()) {
    //         graph.removeChild(graph.lastChild)
    //     }
    // }

    // drawGraph(props) {
    //     const graph = document.getElementById("timingGraph")

    //     let data = [];

    //     for (let i = 1; i <= ROWLIMIT; i++) {
    //         if (this.props["ship" + i] != undefined) {
    //             data.push(this.props["ship" + i].ship.reload125)
    //         }
    //     }

    //     const svg = d3.select(graph).append("svg").attr("width", 700).attr("height", 300);

    //     svg.selectAll("rect")
    //     .data(data)
    //     .enter()
    //     .append("rect")
    //     .attr("x", (d, i) => i * 70)
    //     .attr("y", 0)
    //     .attr("width", 65)
    //     .attr("height", (d, i) => d)
    //     .attr("fill", "green");

    // }

    // static getDerivedStateFromProps(props, state) {
    //     this.removeGraph()
    //     this.drawGraph(props)
    // }

    // render() {
    //     return <div id="timingGraph"></div>
    // }
}

export default TimingGraph