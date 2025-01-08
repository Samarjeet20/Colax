import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Chat from './pages/chatbox/Chat';
import Signup from './pages/signup/Signup';
import Login from './pages/login/Login';
import Home from './pages/home/Home';

const AllRoutes = () => {
    return (
      <div> 
           <Routes>
            <Route
              path="/"
              element={
                <ProtectedPage>
                  <Home />
                </ProtectedPage>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedPage>
                  <Chat />
                </ProtectedPage>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedPage>
                  <Profile />
                </ProtectedPage>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedPage>
                  <SingleProduct />
                </ProtectedPage>
              }
            />
             <Route
              path="/admin"
              element={
                <ProtectedPage>
                  <Admin />
                </ProtectedPage>
              }
            />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route />
          </Routes>
      </div>
    )
  }
  
  export default AllRoutes