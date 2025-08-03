import React, { useState } from "react";

const COLORS = {
  dark: "#1A1A19",      // fondo header/footer/sidebar
  accent: "#31511E",    // botones activos/acento
  sand: "#859F3D",      // detalles, bordes, títulos
  light: "#F6FCDF",     // fondo principal
};

const ProductModal = ({ isOpen, onClose, onSubmit, initialData, onStockUpdated }) => {
  const [form, setForm] = useState(
    initialData || {
      descripcion: "",
      nombreProducto: "",
      precio: "",
    }
  );

  React.useEffect(() => {
    setForm(
      initialData || {
        descripcion: "",
        nombreProducto: "",
        precio: "",
      }
    );
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [aumentar, setAumentar] = useState("");
  const [aumentarMsg, setAumentarMsg] = useState("");
  const [aumentarError, setAumentarError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Handler para aumentar stock
  const handleAumentar = async (e) => {
    e.preventDefault();
    setAumentarMsg("");
    setAumentarError("");
    if (!aumentar || isNaN(aumentar) || Number(aumentar) <= 0) {
      setAumentarError("Ingrese una cantidad válida");
      return;
    }
    try {
      const res = await fetch("/product/aumentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoBarras: initialData.codigoBarras, cantidad: Number(aumentar) })
      });
      const data = await res.json();
      if (res.ok) {
        setAumentarMsg("Stock aumentado correctamente");
        setAumentar("");
        if (typeof onStockUpdated === "function") onStockUpdated();
      } else {
        setAumentarError(data.msg || "Error al aumentar stock");
      }
    } catch {
      setAumentarError("Error de conexión");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-4 sm:p-6 rounded shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <input type="text" name="nombreProducto" placeholder="Nombre del producto" value={form.nombreProducto} onChange={handleChange} className="border p-2 rounded text-xs sm:text-base" required />
          <input type="text" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="border p-2 rounded text-xs sm:text-base" required />
          {/* Solo permitir editar cantidad al agregar, no al editar */}
          {!initialData ? (
            <input type="number" name="cantidad" placeholder="Cantidad" value={form.cantidad} onChange={handleChange} className="border p-2 rounded text-xs sm:text-base" required />
          ) : (
            <input type="number" name="cantidad" placeholder="Cantidad" value={form.cantidad} className="border p-2 rounded text-xs sm:text-base bg-gray-100 cursor-not-allowed" disabled />
          )}
          <input type="number" name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} className="border p-2 rounded text-xs sm:text-base" required />
          <button type="submit" className="py-2 rounded font-semibold text-white text-xs sm:text-base"
          style={{ background: COLORS.accent, color: COLORS.light }}>{initialData ? "Actualizar" : "Agregar"}</button>
        </form>
        {/* Opción para aumentar stock solo al editar */}
        {initialData && (
          <form onSubmit={handleAumentar} className="flex flex-col gap-2 mt-4">
            <label className="font-semibold text-xs sm:text-sm">Aumentar stock</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                className="border p-2 rounded text-xs sm:text-base flex-1"
                placeholder="Cantidad a aumentar"
                value={aumentar}
                onChange={e => setAumentar(e.target.value)}
              />
              <button type="submit" className="px-3 py-2 rounded font-semibold  text-white text-xs sm:text-base"
              style={{ background: COLORS.accent, color: COLORS.light }}>Aumentar</button>
            </div>
            {aumentarMsg && <div className="text-green-700 text-xs">{aumentarMsg}</div>}
            {aumentarError && <div className="text-red-600 text-xs">{aumentarError}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductModal;
