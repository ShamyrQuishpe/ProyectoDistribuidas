import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const COLORS = {
  dark: "#1A1A19",
  accent: "#31511E",
  sand: "#859F3D",
  light: "#F6FCDF",
};

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/users/login`, form);
      navigate("/dashboard/products");
      if (res.data && res.data.nombre) {
      } else {
        setError(res.data.msg || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Credenciales incorrectas o error de servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: COLORS.light }}>
      <form onSubmit={handleSubmit} className="rounded shadow p-6 flex flex-col gap-4 max-w-md w-full" style={{ background: COLORS.sand }}>
        <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: COLORS.dark }}>Iniciar Sesión</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded"
          style={{ borderColor: COLORS.accent, color: COLORS.dark }}
          required
        />
        <div className="relative flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="border p-2 rounded w-full pr-10"
            style={{ borderColor: COLORS.accent, color: COLORS.dark }}
            required
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 text-xl text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              // Ojo tachado (ocultar)
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18M10.584 10.587A3 3 0 0012 15a3 3 0 002.828-4.001M6.53 6.53C4.61 7.98 3.26 10.01 3 12c.26 1.99 2.61 5.5 9 5.5 1.77 0 3.25-.22 4.47-.6m2.01-2.01c.66-.7 1.18-1.47 1.52-2.39-.26-1.99-2.61-5.5-9-5.5-.98 0-1.89.07-2.74.2"/></svg>
            ) : (
              // Ojo abierto (ver)
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 100-6 3 3 0 000 6z"/></svg>
            )}
          </button>
        </div>
        <button type="submit" className="py-2 rounded font-semibold" style={{ background: COLORS.accent, color: COLORS.light }} disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        {error && <div className="text-red-600 text-center">{error}</div>}
        {success && <div className="text-green-700 text-center">{success}</div>}
      </form>
    </div>
  );
}

export default LoginPage;
