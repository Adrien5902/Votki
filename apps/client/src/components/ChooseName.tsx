import React, { useState } from 'react';
import { request } from '../functions';

interface Props {
    setUsername: React.Dispatch<React.SetStateAction<string>>,
    setAvatar: React.Dispatch<React.SetStateAction<string>>,
    avatar: string,
    name: string
}

export function ChooseName({ setUsername, setAvatar, avatar, name }: Props) {
    const [avatarSource, setAvatarSource] = useState(avatar);

    function requestRandomAvatar() {
        request("getRandomAvatar", (avatar) => {
            let avatarSrc = "assets/avatars/" + avatar
            setAvatarSource(avatarSrc);
            setAvatar(avatarSrc)
        });
    }

    function handleReroll(rerollButton: EventTarget) {
        requestRandomAvatar();
        (rerollButton as HTMLElement).animate(
            [
                {
                    transform: "rotate(0deg)"
                },
                {
                    transform: "rotate(-360deg)"
                }
            ],
            { duration: 150 }
        );
    }

    return (
        <div id="choose-name" className="box">
            <div style={{ position: "relative" }}>
                <img
                    alt="avatar"
                    style={{ height: "10em" }}
                    id="avatar"
                    src={avatarSource}
                    className="pdp"
                    draggable="false"
                />

                <i
                    onClick={(e) => {
                        handleReroll(e.target);
                    }}
                    id="reroll-avatar"
                    className="fa-solid fa-arrow-rotate-left"
                ></i>
            </div>
            <div>
                <label htmlFor="username">
                    <i className="fa-solid fa-address-card"></i>
                </label>
                <input value={name} type="text" placeholder="Nom..." id="username" onChange={(e) => { setUsername(e.target.value) }} />
            </div>
        </div>
    );
}
