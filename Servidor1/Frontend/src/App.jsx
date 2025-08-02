
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from "./Layout/Dashboard.jsx";
import Login from "./Pages/Login.jsx";
import ProductsPage from './Pages/Products.jsx';
import VentasPage from './Pages/Ventas.jsx';


function App() {
  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} >
          <Route path="products" element={<ProductsPage />} />
          <Route path="ventas" element={<VentasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
