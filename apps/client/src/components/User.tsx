import { UserResolvable } from "votki-shared-types/src/user";

interface Props {
    user: UserResolvable
}

export function User({ user }: Props) {
    return (
        <div className="user" data-grade={user.grade} data-you={String(user.you)}>
            <div className="user-main">
                <img src={"assets/avatars/" + user.avatar} className="pdp" draggable="false" />
                <span className="username">{user.name}</span>
            </div>
            {user.grade ? <i className="fa-solid fa-crown user-grade"></i> : ""}
        </div>
    );
}
