export function User({ user }) {
    return (
        <div className="user" grade={user.grade} you={String(user.you)}>
            <div className="user-main">
                <img src={"assets/avatars/" + user.avatar} className="pdp" draggable="false" />
                <span className="username">{user.name}</span>
            </div>
            {user.grade ? <i className="fa-solid fa-crown user-grade"></i> : ""}
        </div>
    );
}
