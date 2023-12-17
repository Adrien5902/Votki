import { request } from "../functions";
import { CustomCheckbox } from "./CustomCheckbox";

export function GameRules({ settings }) {
    return settings ? (
        <div>
            <h3>
                <i className="fa-solid fa-sliders"></i>
                <span> Réglages :</span>
            </h3>

            <div id="game-settings-rules">
                {Object.keys(settings).map((setting, index) => {
                    if (setting == "mode") {
                        return
                    }

                    let data = settings[setting]

                    return <GameRule
                        setting={setting}
                        data={data}
                        key={index}
                    />
                })}
            </div>
        </div>
    ) : <span className="tripledotloading">Chargement</span>;
}

function GameRule({ setting, data }) {
    return (
        <div data-setting={setting}>
            {
                data.type == "boolean" ?
                    <CustomCheckbox defaultCheck={data.value} cb={(state) => {
                        request("setGameSetting", null, setting, state);
                    }} /> : ""
            }

            <label>
                <i style={{ margin: "0.3em" }} className={`fa-solid fa-${data.icon}`}></i>
                <span>{data.name}</span>
            </label>
        </div>
    );
}