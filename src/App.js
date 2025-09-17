import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HireWizard from './components/HireWizard';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/hire" element={<HireWizard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/" element={<HireWizard />} />
      </Routes>
    </Router>
  );
}

export default App;