
import React, { useState, useEffect } from "react";
import {Link, Outlet} from 'react-router-dom';

const COLORS = {
  dark: "#1A1A19",      // fondo header/footer/sidebar
  accent: "#31511E",    // botones activos/acento
  sand: "#859F3D",      // detalles, bordes, títulos
  light: "#F6FCDF",     // fondo principal
};


function Dashboard() {
  const [view, setView] = useState("users");

  const [user, setUser] = useState({ nombre: "Administrador" });


  return (
    <div className="min-h-screen flex flex-col" style={{ background: COLORS.light }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 shadow"
        style={{ background: COLORS.dark }}
      >
        <h1 className="text-xl font-bold" style={{ color: COLORS.sand }}>Gestión de Inventario</h1>
        <div className="flex items-center gap-4">
          <span className="font-semibold" style={{ color: COLORS.sand }}>👤 {user.nombre}</span>
          <Link
            to="/"
            className="px-4 py-2 rounded font-semibold"
            style={{ background: COLORS.accent, color: COLORS.light }}
          >
            Cerrar sesión
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar navegación */}
        <aside
          className="w-full md:w-60 border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col flex-row md:items-stretch items-center md:gap-0 gap-2 px-2 md:px-0 py-2 md:py-6"
          style={{ background: COLORS.dark }}
        >
          <Link
            to="/dashboard/products"
            className={`w-full md:w-auto px-4 py-2 rounded font-semibold mb-2 md:mb-4 ${view === "products" ? "bg-[#31511E] text-white" : "bg-gray-100 text-white md:text-black"}`}
            style={view === "products" ? { background: COLORS.accent, color: COLORS.light } : { background: 'transparent', color: '#fff' }}
            onClick={() => setView("products")}
          >Productos</Link>
          <Link
            to="/dashboard/ventas"
            className={`w-full md:w-auto px-4 py-2 rounded font-semibold mb-2 md:mb-4 ${view === "ventas" ? "bg-[#31511E] text-white" : "bg-gray-100 text-white md:text-black"}`}
            style={view === "ventas" ? { background: COLORS.accent, color: COLORS.light } : { background: 'transparent', color: '#fff' }}
            onClick={() => setView("ventas")}
          >Ventas</Link>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6" style={{ background: COLORS.light }}>
          <Outlet context={{ view }} />
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 mt-auto" style={{ background: COLORS.dark, color: COLORS.sand }}>
        <span>© {new Date().getFullYear()} Inventario. Todos los derechos reservados.</span>
      </footer>
    </div>
  );
}

export default Dashboard;
