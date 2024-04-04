import React, { useEffect, useState } from 'react';
import './LoginForm.css';
import person_icon from '../assets/person.png';
import password_icon from '../assets/password.png';
import forge from 'node-forge';
import { useNavigate } from 'react-router-dom';

function LoginForm(props) {
  const [action, setAction] = useState("Sign In");
  const [password, setPassword] = useState("");
  const [clientKeys, setClientKeys] = useState({});
  const [messageForUser, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState("SUCCESS");
  const navigate = useNavigate();

  useEffect(() => {
    async function generateKeyPair() {
      var rsa = forge.pki.rsa;
      var keyPair = rsa.generateKeyPair({bits: 2048});
      setClientKeys(keyPair);
      console.log(clientKeys);
    }
    generateKeyPair();
  }, []);

  function passwordChanged(event) {
    setPassword(event.target.value);
  }

  function onSubmitSendHandler(event) {
    event.preventDefault();

    // if (!login || !password) {
    //   return;
    // }

    fetch('http://localhost:8080/api/keys/rsa/getPublic').then(response => response.json()).then(keyDto => {
      const serverKey = keyDto.keyString;

      const encryptedLogin = encrypt(props.login, forge.pki.publicKeyFromPem(serverKey));
      const encryptedPassword = encrypt(password, forge.pki.publicKeyFromPem(serverKey));
      const request = {login: encryptedLogin, password: encryptedPassword, publicKey: forge.pki.publicKeyToPem(clientKeys.publicKey)};
      console.log(request);

      if (action==="Sign In") {
        fetch('http://localhost:8080/api/users/signin', {
          method: 'POST',
          body: JSON.stringify(request),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => response.json()).then(userDto => {
          if (!userDto.errors && userDto.accessToken) {
            const decryptedToken = decrypt(userDto.accessToken, clientKeys.privateKey);
            props.onTokenChange(decryptedToken);
            navigate("../welcome");
          } else {
            handleErrors(userDto.errors);
          }
        });
      } else if (action==="Sign Up") {
        fetch('http://localhost:8080/api/users/signup', {
          method: 'POST',
          body: JSON.stringify(request),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => response.json()).then(userDto => {
          if (!userDto.errors) {
            console.log("User created with login ", decrypt(userDto.login, clientKeys.privateKey));
            setMessageStatus('SUCCESS');
            setMessage("Account created successfully");
            setAction("Sign In");
          } else {
            handleErrors(userDto.errors);
          }
        });
      }
    });
  }

  function handleErrors(errors) {
    if (errors) {
      let decryptedError = decrypt(errors[0], clientKeys.privateKey);
      console.log(decryptedError);
      setMessageStatus('FAIL');
      setMessage(decryptedError);
    }
  }

  function encrypt(input, key) {
    const encryptedData = key.encrypt(input);
    return forge.util.encode64(encryptedData);
  }

  function decrypt(input, key) {
    const decryptedData = key.decrypt(forge.util.decode64(input));
    return decryptedData;
  }

  function onChangeActionHandler(event) {
    if (action==="Sign Up" && event.target.textContent==="Sign In") {
      setAction("Sign In");
      setMessage("");
    } else if (action==="Sign In" && event.target.textContent==="Sign Up") {
      setAction("Sign Up");
      setMessage("");
    }
  }

  return (
    <form className='container' onSubmit={onSubmitSendHandler}>
      <div className="submit-container">
        <div className={action==="Sign In"?"submit gray":"submit"} onClick={onChangeActionHandler}>Sign Up</div>
        <div className={action==="Sign Up"?"submit gray":"submit"} onClick={onChangeActionHandler}>Sign In</div>
      </div>
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <img src={person_icon} alt="" />
          <input type="text" placeholder='Login' onChange={props.onLoginChange} required />
        </div>
        <div className="input">
          <img src={password_icon} alt="" />
          <input type="password" placeholder='Password' onChange={passwordChanged} required />
        </div>
      </div>
      <div className={messageStatus==="FAIL"?"text info red":"text info green"}>{messageForUser}</div>
      {
        action==="Sign In" ? 
        (<input type="submit" value="Log in" className="submit send" />) : 
        (<input type="submit" value="Create account" className="submit send" />)
      }
    </form>
  )
}

export default LoginForm;