import { Content } from "./Content"
import Title from "./Title"

function App(){

    return (
        <>
            <Title/>
            <Content />
            <div id="error-popups"></div>
            <a id="github-link" href="https://github.com/Adrien5902/Votki" target="_blank">
                <i className="fa-brands fa-github"></i>
            </a>
        </>
    )
}

export default App