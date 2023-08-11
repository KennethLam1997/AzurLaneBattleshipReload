import Form from 'react-bootstrap/Form';
import { InputGroup } from "react-bootstrap"

export function SingleStatBox({ iconsrc, label, field, suffix, field2, suffix2 }) {
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
                <h5 style={{float: "left"}}>{label}</h5>
                {displayFields()}
            </Form.Label>                            
        </InputGroup>
    )
}

export function SingleStatInputBox({ iconsrc, label, type, value, onChange }) {
    const displayIcon = () => {
        if (iconsrc) return (
            <InputGroup.Text className="stat-icon-wrapper">
                <img className="stat-icon" src={iconsrc}></img>
            </InputGroup.Text>
        )
    }

    return (
        <InputGroup className="box-sub-inner">
            {displayIcon()}
            <Form.Label column style={{width: "150px", padding: "0px", margin:"0px"}}>
                <h5 style={{float: "left"}}>{label}</h5>
                <Form.Control className="stat-input" type={type} defaultValue={value} onChange={onChange}>
                </Form.Control>
            </Form.Label>                
        </InputGroup>
    )
}