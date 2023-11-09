import { useState } from "react";

export function CopyInviteButton({ invite }) {
    const [active, setActive] = useState(false);

    function copyLinkHandler() {
        navigator.clipboard.writeText(invite);
        setActive(true);

        setTimeout(() => {
            setActive(false);
        }, 1000);
    }

    return (
        <button id="copy-invite-link" style={{
            background: active ? "var(--accent)" : ""
        }} onClick={copyLinkHandler}>
            {active ?
                <>
                    <i className="fa-solid fa-check"></i>
                    <span> Copié</span>
                </>
                :
                <>
                    <i className="fa-solid fa-clipboard"></i>
                    <span> Copier</span>
                </>}
        </button>
    );
}
