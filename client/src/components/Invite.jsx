import { CopyInviteButton } from "./CopyInviteButton.jsx";

export function Invite({ inviteLink }) {
    return (
        <div>
            <h3><i className="fa-solid fa-envelope"></i> Inviter des amis :</h3>
            <div id="invite-link">
                <span className="tridotoverflow">
                    {inviteLink}
                </span>
                <CopyInviteButton invite={inviteLink} />
            </div>
        </div>
    );
}
