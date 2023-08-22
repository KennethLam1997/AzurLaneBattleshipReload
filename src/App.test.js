/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { SHIPTESTDATA, WEAPONTESTDATA } from '../__mocks__/testData'

beforeAll(() => {
    localStorage.setItem('allship', JSON.stringify(SHIPTESTDATA))
    localStorage.setItem('allweapon', JSON.stringify(WEAPONTESTDATA))
})

test('renders the landing page', () => {
    const { container } = render(<App/>)    
    expect(container.getElementsByClassName('main-container')).toBeDefined()
    expect(container.getElementsByClassName('tab-column').length).toBe(2)
    expect(container.getElementsByClassName('tab-content').length).toBe(2)
})