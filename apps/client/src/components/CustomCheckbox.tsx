import { useState } from "react";

export function CustomCheckbox({ defaultCheck, cb }) {
    const [checked, setChecked] = useState(defaultCheck)

    function handleClick(){
        setChecked(!checked)
        if(typeof cb == "function") cb(checked)
    }

    return (
    <div className="custom-checkbox" onClick={handleClick} defaultChecked={checked}>
        <i className="fa-solid fa-check"></i>
    </div>
    );
}
