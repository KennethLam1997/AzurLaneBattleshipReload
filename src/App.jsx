import { Component } from 'react';
import ShipTableRow from "./shipTableRow.jsx"
import TimingGraph from './plotter.jsx';

export const ROWLIMIT = 3

export class App extends Component {
    constructor(props) {
        super(props)
        this.state = {}

        for (let i = 1; i <= ROWLIMIT; i++) {
            this.state["ship" + i] = {
                name: '',
                cooldown: 0
            }
        }
    }

    handleCallBack(i, state) {
        this.setState({
            ["ship" + i]: {
                name: state.ship.name,
                cooldown: parseFloat(state.cooldown)
            }
        })
    }

    render() {
        let rows = []
        let dynamicProps = {}
        
        for (let i = 1; i <= ROWLIMIT; i++) {
            rows.push(
                <ShipTableRow 
                    key={i} 
                    handleCallBack={function(state) {this.handleCallBack(i, state)}.bind(this)}
                />
            )

            dynamicProps["ship" + i] = this.state["ship" + i]
        }

        return (
            <>
            <table>
                <tbody>
                    <tr>
                        <th colSpan={2}>
                            Ship
                        </th>
                        <th colSpan={2}>
                            Weapon
                        </th>
                        <th>
                            Expected cooldown (s)
                        </th>
                    </tr>
                    {rows}                
                </tbody>
            </table>
            <TimingGraph {...dynamicProps}/>
            </>
        )
    }
}

