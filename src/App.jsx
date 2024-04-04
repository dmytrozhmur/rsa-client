import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import "@fortawesome/fontawesome-free/css/all.min.css"
import './App.css'
import LoginForm from './components/LoginForm'
import { RouterProvider, BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './components/WelcomePage'
import { useState } from 'react'

function App() {
  const [login, setLogin] = useState('');
  const [accessToken, setAccessToken] = useState('');

  function loginChangeHandler(event) {
    setLogin(event.target.value);
  } 

  function tokenChangeHandler(value) {
    setAccessToken(value);
  } 

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginForm onLoginChange={loginChangeHandler} login={login} onTokenChange={tokenChangeHandler} />} />
        <Route path='/welcome' element={<WelcomePage username={login} token={accessToken} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
