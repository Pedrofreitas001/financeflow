import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Home from './landing/pages/Home';
import Login from './landing/pages/Login';
import DataPreparation from './landing/pages/DataPreparation';
import GoogleSheetsAuth from './landing/pages/GoogleSheetsAuth';
import DashboardApp from './DashboardApp';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/preparar-dados" element={<DataPreparation />} />
          <Route path="/auth/callback" element={<GoogleSheetsAuth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
