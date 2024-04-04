import React from "react";
import './WelcomePage.css';

function WelcomePage(props) {
    const username = props.username;
    const token = props.token;
    console.log(props);
    
    return (
        <div className="greeting">
            <p className="paragraph">Hello, {username}!</p>
            <p className="paragraph">Here is your access token:</p>
            <textarea readOnly value={token} className="token" />
        </div>
    );
}

export default WelcomePage;