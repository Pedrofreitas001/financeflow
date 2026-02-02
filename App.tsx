import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './landing/pages/Home';
import Login from './landing/pages/Login';
import DashboardApp from './DashboardApp';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<DashboardApp />} />
            </Routes>
        </Router>
    );
};

export default App;
