import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Entrada from './components/Entrada';
import Status from './components/Status';
import CsvUpdate from './components/CsvUpdate';
import './style.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/entrada" element={<Entrada />} />
          <Route path="/status" element={<Status />} />
          {/* <Route path="/csv-update" element={<CsvUpdate />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

