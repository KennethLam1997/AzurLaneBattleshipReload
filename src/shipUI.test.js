/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react-test-renderer';
import userEvent from '@testing-library/user-event'
import { useState } from "react"
import { SHIPTESTDATA, WEAPONTESTDATA } from '../__mocks__/testData'
import { BonusStatsBox, ShipBox, StatsBox } from './shipUI';

const TEMPLATETAB = {
    imgsrc_chibi: new URL("/unknown_ship_icon.png", import.meta.url).href,
    level: 1,
    level1: {}, 
    level100: {}, 
    level120: {}, 
    level125: {}, 
    weapon: {
        imgsrc: new URL("/equipmentAddIcon.png", import.meta.url).href,
        enhance0: {}, 
        enhance10: {},
        enhance: 0
    }
}

beforeAll(() => {
    localStorage.setItem('allship', JSON.stringify(SHIPTESTDATA))
    localStorage.setItem('allweapon', JSON.stringify(WEAPONTESTDATA))
})

function ShipBoxWrapper({ shipInitial, spyFn }) {
    const [ship, useShip] = useState(shipInitial || [])

    const handleCallBack = (state) => {
        useShip(state)
        if (spyFn) spyFn(state)
    }

    return (<ShipBox
        ship={ship}
        handleCallBack={(state) => handleCallBack(state)}
    />)
}

describe('testing shipBox', () => {
    test('if render element', () => {
        const { container } = render(<ShipBoxWrapper/>)
        expect(container.querySelector('.centered-horizontal-ship-icon')).not.toBeNull()
        expect(container.querySelector('.centered-horizontal-ship-icon').firstChild).not.toHaveClass()
        expect(container.querySelector('.ship-icon')).not.toBeNull()
        expect(screen.queryByAltText("Ship rarity star icon")).toBeFalsy()
        expect(screen.queryByAltText("Ship type icon")).toBeTruthy()
        expect(container.querySelectorAll('.ship-icon-label')).toBeTruthy()
        expect(container.querySelectorAll('.ship-icon-label')).toHaveLength(2)
    })

    test('if popover appears on mouseclick', async () => {
        const { container } = render(<ShipBoxWrapper/>)
        const icon = container.querySelector('.centered-horizontal-ship-icon').firstChild
        let popover = screen.queryByTestId('popover-basic')
        expect(popover).toBeFalsy()

        await act(async () => userEvent.click(icon, {bubbles: true}))

        popover = screen.queryByTestId('popover-basic')
        expect(popover).toBeTruthy()
    })

    test('if popover disappears on mouseout', async () => {
        const { container } = render(<ShipBoxWrapper/>)
        const icon = container.querySelector('.centered-horizontal-ship-icon').firstChild
        await act(async () => userEvent.click(icon))

        let popover = screen.queryByTestId('popover-basic')
        expect(popover).toBeTruthy()

        await act(async () => userEvent.click(container))

        popover = screen.queryByTestId('popover-basic')
        expect(popover).toBeFalsy()
    })

    test('if popover elements are available', async () => {
        const { container } = render(<ShipBoxWrapper/>)
        const icon = container.querySelector('.centered-horizontal-ship-icon').firstChild    
        await act(async () => userEvent.click(icon))

        const popover = screen.getByTestId('popover-basic')
        expect(popover.childElementCount).toBe(3)

        const popoverClasses = Array.from(popover.childNodes).map(val => val.className)
        expect(popoverClasses).toStrictEqual(['popover-arrow', 'popover-header', 'popover-body'])
        expect(screen.queryByRole('combobox')).toBeTruthy()
    })

    test('if ship dropdowns are loaded', async () => {
        const { container } = render(<ShipBoxWrapper/>)
        const icon = container.querySelector('.centered-horizontal-ship-icon').firstChild    
        await act(async () => userEvent.click(icon))

        const combobox = screen.getByRole('combobox')
        expect(combobox).toHaveLength(4)
        expect(combobox).toHaveValue('')
        expect(combobox.firstChild).toHaveValue('')
        expect(combobox.firstChild).toHaveAttribute('disabled')
        expect(combobox.firstChild).toHaveAttribute('hidden')
        expect(screen.queryByRole('option', { name: /Akane Shinjo/i })).toBeTruthy()
        expect(screen.queryByRole('option', { name: /Izumo/i })).toBeTruthy()
        expect(screen.queryByRole('option', { name: /Andrea Doria/i })).toBeTruthy()
        expect(screen.queryByRole('option', { name: /Musashi/i })).toBeFalsy()
    })

    test('if ship dropdown classes are rarity', async () => {
        const { container } = render(<ShipBoxWrapper/>)
        const icon = container.querySelector('.centered-horizontal-ship-icon').firstChild    
        await act(async () => userEvent.click(icon))
        
        expect(screen.getByRole('option', { name: /Akane Shinjo/i })).toHaveClass('super_rare')
        expect(screen.getByRole('option', { name: /Izumo/i })).toHaveClass('super_rare')
        expect(screen.getByRole('option', { name: /Andrea Doria/i })).toHaveClass('elite')
    })

    test('if option selectable', async () => {
        const spyFn = jest.fn()
        const { container } = render(<ShipBoxWrapper spyFn={spyFn}/>)
        let icon = container.querySelector('.centered-horizontal-ship-icon').firstChild    
        await act(async () => userEvent.click(icon))
        await userEvent.selectOptions(
            screen.getByRole('combobox'),
            screen.getByRole('option', { name: /Akane Shinjo/i })
        )

        expect(spyFn).toHaveBeenCalledWith(SHIPTESTDATA[0])
        expect(screen.getByRole('option', { name: /Akane Shinjo/i }).selected).toBe(true)
        expect(screen.getByRole('combobox')).toHaveValue('Akane Shinjo')
        expect(icon).toHaveClass('super_rare')
        let shipIcon = icon.firstChild
        expect(shipIcon).toHaveClass('ship-icon')
        expect(shipIcon).toHaveStyle('background-image: url("https://azurlane.netojuu.com/images/4/4d/Akane_ShinjoShipyardIcon.png");')
        expect(screen.queryAllByAltText("Ship rarity star icon").length).toBe(5)
        expect(screen.queryAllByText(/Akane Shinjo/i).length).toBe(2)
        expect(screen.getByText('Lv.1'))

        await userEvent.selectOptions(
            screen.getByRole('combobox'),
            screen.getByRole('option', { name: /Andrea Doria/i })
        )

        expect(spyFn).toHaveBeenCalledWith(SHIPTESTDATA[2])
        expect(screen.getByRole('option', { name: /Andrea Doria/i }).selected).toBe(true)
        expect(screen.getByRole('combobox')).toHaveValue('Andrea Doria')
        expect(icon).toHaveClass('elite')
        expect(shipIcon).toHaveClass('ship-icon')
        expect(shipIcon).toHaveStyle('background-image: url("https://azurlane.netojuu.com/images/4/4a/Andrea_DoriaShipyardIcon.png");')
        expect(screen.queryAllByAltText("Ship rarity star icon").length).toBe(4)
        expect(screen.queryAllByText(/Andrea Doria/i).length).toBe(2)
        expect(screen.getByText('Lv.1'))
    })

    test('if level renderable from state', async () => {
        render(<ShipBox ship={{level: 120}}/>)
        expect(screen.getByText('Lv.120'))
    })
})

function StatsBoxWrapper({ shipInitial, spyFn }) {
    const [ship, useShip] = useState(shipInitial || [])

    const handleCallBack = (state) => {
        useShip({
            ...ship,
            ...state
        })
        if (spyFn) spyFn(state)
    } 

    return (<StatsBox
        ship={ship}
        handleCallBack={(state) => handleCallBack(state)}
    />)
}

describe('testing statsBox', () => {
    test('if render element', () => {
        const { container } = render(<StatsBoxWrapper shipInitial={TEMPLATETAB}/>)
        expect(container.querySelector('.box.centered-horizontal')).not.toBeNull()
        expect(container.querySelector('h4.min-label').innerHTML).toBe('')
        expect(container.querySelector('.box-inner')).not.toBeNull()
        expect(screen.getByRole('heading', { name: /Level 1/i })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "HP" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "RLD" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "FP" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "TRP" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "EVA" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "AA" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "AVI" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "Cost" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "ASW" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "LCK" })).not.toBeNull()
        expect(screen.getAllByRole('heading')).toHaveLength(14)
    })

    test('if change level text', () => {
        const spyFn = jest.fn()
        const { container } = render(<StatsBoxWrapper shipInitial={TEMPLATETAB} spyFn={spyFn}/>)
        const levelSlider = container.querySelector('input[type="range"]')
        expect(screen.queryByRole('heading', { name: "Level 1" })).not.toBeNull()

        fireEvent.change(levelSlider, { target: { value: 1 }})
        expect(screen.queryByRole('heading', { name: "Level 1" })).toBeNull()
        expect(screen.queryByRole('heading', { name: "Level 100" })).not.toBeNull()
        expect(spyFn).toHaveBeenCalledWith({level: 100})

        fireEvent.change(levelSlider, { target: { value: 2 }})
        expect(screen.queryByRole('heading', { name: "Level 100" })).toBeNull()
        expect(screen.queryByRole('heading', { name: "Level 120" })).not.toBeNull()
        expect(spyFn).toHaveBeenCalledWith({level: 120})

        fireEvent.change(levelSlider, { target: { value: 3 }})
        expect(screen.queryByRole('heading', { name: "Level 120" })).toBeNull()
        expect(screen.queryByRole('heading', { name: "Level 125" })).not.toBeNull()
        expect(spyFn).toHaveBeenCalledWith({level: 125})

        fireEvent.change(levelSlider, { target: { value: 0 }})
        expect(screen.queryByRole('heading', { name: "Level 125" })).toBeNull()
        expect(screen.queryByRole('heading', { name: "Level 1" })).not.toBeNull()
        expect(spyFn).toHaveBeenCalledWith({level: 1})
    })

    test('if renders ship data', () => {
        const akaneShinjo = SHIPTESTDATA[0]
        const { container } = render(<StatsBoxWrapper shipInitial={{...TEMPLATETAB, ...akaneShinjo}}/>)

        expect(container.querySelector('h4.min-label').innerHTML).toBe(akaneShinjo.name)
        expect(screen.getByRole('heading', { name: "HP" }).nextSibling).toHaveTextContent(akaneShinjo.level1.health)
        expect(screen.getByRole('heading', { name: "Heavy" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "RLD" }).nextSibling).toHaveTextContent(akaneShinjo.level1.reload)
        expect(screen.getByRole('heading', { name: "FP" }).nextSibling).toHaveTextContent(akaneShinjo.level1.firepower)
        expect(screen.getByRole('heading', { name: "TRP" }).nextSibling).toHaveTextContent(akaneShinjo.level1.torpedo)
        expect(screen.getByRole('heading', { name: "EVA" }).nextSibling).toHaveTextContent(akaneShinjo.level1.evasion)
        expect(screen.getByRole('heading', { name: "AA" }).nextSibling).toHaveTextContent(akaneShinjo.level1.antiair)
        expect(screen.getByRole('heading', { name: "AVI" }).nextSibling).toHaveTextContent(akaneShinjo.level1.aviation)
        expect(screen.getByRole('heading', { name: "Cost" }).nextSibling).toHaveTextContent(akaneShinjo.level1.consumption)
        expect(screen.getByRole('heading', { name: "ASW" }).nextSibling).toHaveTextContent(akaneShinjo.level1.asw)
        expect(screen.getByRole('heading', { name: "LCK" }).nextSibling).toHaveTextContent(akaneShinjo.level1.luck)
    })

    test('if renders ship data on level change', () => {
        const akaneShinjo = SHIPTESTDATA[0]
        const { container } = render(<StatsBoxWrapper shipInitial={{...TEMPLATETAB, ...akaneShinjo}}/>)

        const levelSlider = container.querySelector('input[type="range"]')
        fireEvent.change(levelSlider, { target: { value: 1 }})

        expect(container.querySelector('h4.min-label').innerHTML).toBe(akaneShinjo.name)
        expect(screen.getByRole('heading', { name: "HP" }).nextSibling).toHaveTextContent(akaneShinjo.level100.health)
        expect(screen.getByRole('heading', { name: "Heavy" })).not.toBeNull()
        expect(screen.getByRole('heading', { name: "RLD" }).nextSibling).toHaveTextContent(akaneShinjo.level100.reload)
        expect(screen.getByRole('heading', { name: "FP" }).nextSibling).toHaveTextContent(akaneShinjo.level100.firepower)
        expect(screen.getByRole('heading', { name: "TRP" }).nextSibling).toHaveTextContent(akaneShinjo.level100.torpedo)
        expect(screen.getByRole('heading', { name: "EVA" }).nextSibling).toHaveTextContent(akaneShinjo.level100.evasion)
        expect(screen.getByRole('heading', { name: "AA" }).nextSibling).toHaveTextContent(akaneShinjo.level100.antiair)
        expect(screen.getByRole('heading', { name: "AVI" }).nextSibling).toHaveTextContent(akaneShinjo.level100.aviation)
        expect(screen.getByRole('heading', { name: "Cost" }).nextSibling).toHaveTextContent(akaneShinjo.level100.consumption)
        expect(screen.getByRole('heading', { name: "ASW" }).nextSibling).toHaveTextContent(akaneShinjo.level100.asw)
        expect(screen.getByRole('heading', { name: "LCK" }).nextSibling).toHaveTextContent(akaneShinjo.level100.luck)
    })
})

function BonusStatsBoxWrapper({ shipInitial, spyFn }) {
    const [ship, useShip] = useState(shipInitial || [])

    const handleCallBack = (state) => {
        useShip({
            ...ship,
            ...state
        })
        if (spyFn) spyFn(state)
    } 

    return (<BonusStatsBox
        ship={ship}
        handleCallBack={(state) => handleCallBack(state)}
    />)
}

describe('testing bonusStatsBox', () => {
    test('if render element', () => {
        const { container } = render(<BonusStatsBoxWrapper shipInitial={TEMPLATETAB}/>)
        expect(container.querySelector('.box.centered-horizontal')).not.toBeNull() 
        expect(screen.getByRole('heading', { name: "Bonus Stats" })).not.toBeNull()

        const reload = screen.getByRole('heading', { name: "RLD" })
        expect(reload).not.toBeNull()  
        expect(reload.nextSibling).toBeEnabled()    
        expect(reload.nextSibling).toHaveValue('')  

        const reloadPercent = screen.getByRole('heading', { name: "RLD (%)" })
        expect(reloadPercent).not.toBeNull()   
        expect(reloadPercent.nextSibling).toBeEnabled()
        expect(reloadPercent.nextSibling).toHaveValue('') 

        const oathed = screen.getByRole('heading', { name: "Oathed?" })
        expect(oathed).not.toBeNull()  
        expect(container.querySelector('input[type="checkbox"]')).toBeEnabled()
        expect(container.querySelector('input[type="checkbox"]')).not.toBeChecked()
    })

    test('if inputs return', async () => {
        const spyFn = jest.fn()
        const { container } = render(<BonusStatsBoxWrapper shipInitial={TEMPLATETAB} spyFn={spyFn}/>)

        const reloadInput = screen.getByRole('heading', { name: "RLD" }).nextSibling
        await userEvent.type(reloadInput, '100')
        expect(reloadInput).toHaveValue('100')
        expect(spyFn).toHaveBeenLastCalledWith({bonusReload: "100"})

        const reloadPercentInput = screen.getByRole('heading', { name: "RLD (%)" }).nextSibling
        await userEvent.type(reloadPercentInput, '100')
        expect(reloadPercentInput).toHaveValue('100')
        expect(spyFn).toHaveBeenLastCalledWith({bonusPercentReload: "100"})

        const oathedInput = container.querySelector('input[type="checkbox"]')
        await userEvent.click(oathedInput)
        expect(oathedInput).toBeChecked()
        expect(spyFn).toHaveBeenLastCalledWith({isOathed: true})
        await userEvent.click(oathedInput)
        expect(oathedInput).not.toBeChecked()
        expect(spyFn).toHaveBeenLastCalledWith({isOathed: false})
    })
})