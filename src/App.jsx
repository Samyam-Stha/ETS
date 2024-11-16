// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login/Login.jsx'
import Home from './Home/Home.jsx';

function App() {
    return (
      
        // <Router>
        //     <Routes>
        //         <Route path="/" element={<Login />} />
        //         <Route path="/Signup" element={<SignUp />} />
        //     </Routes>
        // </Router>
        // <Home/>
         <Router>
                <Routes>
                    {/* This route is for home component 
          with exact path "/", in component props 
          we passes the imported component*/}
                    <Route
                        exact
                        path="/"
                        element={<Login />}
                    />

                    {/* This route is for about component 
          with exact path "/about", in component 
          props we passes the imported component*/}
                    <Route
                        path="/Home"
                        element={<Home />}
                    />
                </Routes>
            </Router>
      
    );
}

export default App;
