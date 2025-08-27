import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Repuestos from './pages/Repuestos';
import Proveedores from './pages/Proveedores';
import Ventas from './pages/Ventas';
import Equivalencias from './pages/Equivalencias';
import Registros from './pages/Registros';
import Usuarios from './pages/Usuarios';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/repuestos" element={<Repuestos />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/equivalencias" element={<Equivalencias />} />
          <Route path="/registros" element={<Registros />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;