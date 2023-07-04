import React, { useState, useEffect } from 'react';
import { request } from '../functions';

export function ChooseName(props) {
    let {setUsername, setAvatar} = props,
        avatar,
        name

    const [avatarSource, setAvatarSource] = useState(avatar);

    if(!avatar){
        useEffect(() => {
            requestRandomAvatar();
            avatar = props.avatar ?? "",
            name = props.username ?? ""
        }, [])
    }

    function requestRandomAvatar() {
        request("getRandomAvatar", (avatar) => {
            let avatarSrc = "assets/avatars/" + avatar
            setAvatarSource(avatarSrc);
            setAvatar(avatarSrc)
        });
    }

    function handleReroll(rerollButton) {
        requestRandomAvatar();
        rerollButton.animate(
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
                <input value={name} type="text" placeholder="Nom..." id="username" onChange={(e)=>{setUsername(e.target.value)}} />
            </div>
        </div>
    );
}
