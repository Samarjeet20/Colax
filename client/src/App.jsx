import { Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/chatbox/Chat';
import Signup from './pages/signup/Signup';
import Login from './pages/login/Login';
import Home from './pages/home/Home';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/chat" element={<Chat/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
    </>
  )
}

export default App
