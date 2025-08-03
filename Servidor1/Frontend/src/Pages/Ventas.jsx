import React, { useState, useEffect } from "react";
import axios from "axios";

const COLORS = {
  dark: "#1A1A19",
  accent: "#31511E",
  sand: "#859F3D",
  light: "#F6FCDF",
};

function VentasPage() {
  const [productos, setProductos] = useState([]);
  const [selected, setSelected] = useState([]); // [{codigoBarras, cantidad}]
  const [tipoPago, setTipoPago] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [descripcionDocumento, setDescripcionDocumento] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [cedulaCliente, setCedulaCliente] = useState("");
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(null);

  // Calcular total estimado en tiempo real
  const totalEstimado = selected.reduce((acc, item) => {
    const prod = productos.find(p => p.codigoBarras === item.codigoBarras);
    if (!prod) return acc;
    const precio = Number(prod.precio) || 0;
    const cantidad = Number(item.cantidad) || 0;
    return acc + precio * cantidad;
  }, 0);

  useEffect(() => {
    axios.get("/product/listar")
      .then(res => setProductos(res.data.productos || []))
      .catch(() => setProductos([]));
  }, []);

  // Selección de productos con cantidad
  const handleSelect = (codigo) => {
    setSelected(prev => {
      const found = prev.find(p => p.codigoBarras === codigo);
      if (found) {
        // Si ya está, quitar
        return prev.filter(p => p.codigoBarras !== codigo);
      } else {
        // Agregar con cantidad 1 por defecto
        return [...prev, { codigoBarras: codigo, cantidad: 1 }];
      }
    });
  };

  const handleCantidadChange = (codigo, cantidad) => {
    setSelected(prev => prev.map(p =>
      p.codigoBarras === codigo ? { ...p, cantidad: cantidad } : p
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selected.length) {
      setError("Seleccione al menos un producto");
      return;
    }
    if (!tipoPago) {
      setError("Seleccione el tipo de pago");
      return;
    }
    if (!nombreCliente.trim() || !cedulaCliente.trim() || !observacion.trim()) {
      setError("Complete todos los campos obligatorios");
      return;
    }
    // Validar cédula: exactamente 10 dígitos
    if (!/^\d{10}$/.test(cedulaCliente.trim())) {
      setError("La cédula debe tener exactamente 10 dígitos");
      return;
    }
    // Validar cantidades
    for (const p of selected) {
      if (!p.cantidad || isNaN(p.cantidad) || Number(p.cantidad) <= 0) {
        setError("Ingrese una cantidad válida para cada producto seleccionado");
        return;
      }
    }
    if (tipoPago === "transferencia" && (!numeroDocumento.trim() || !descripcionDocumento.trim())) {
      setError("Ingrese número y descripción del documento para transferencia");
      return;
    }
    setLoading(true);
    axios.post("/vent/registrarVenta", {
      productos: selected.map(p => ({ codigoBarras: p.codigoBarras, cantidad: Number(p.cantidad) })),
      tipoPago,
      numeroDocumento: tipoPago === "transferencia" ? numeroDocumento : undefined,
      descripcionDocumento: tipoPago === "transferencia" ? descripcionDocumento : undefined,
      nombreCliente,
      cedulaCliente,
      observacion
    })
      .then(res => {
        setSuccess(res.data.msg || "Venta registrada correctamente");
        setTotal(res.data.venta?.total ?? null);
        setSelected([]);
        setTipoPago("");
        setNumeroDocumento("");
        setDescripcionDocumento("");
        setNombreCliente("");
        setCedulaCliente("");
        setObservacion("");
      })
      .catch(err => {
        setError(err.response?.data?.msg || "Error al registrar la venta");
        setTotal(null);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-2 sm:p-6" style={{ background: COLORS.light }}>
      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center tracking-tight" style={{ color: COLORS.accent }}>Registrar Venta</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6" style={{ background: COLORS.sand }}>
          {/* Productos disponibles */}
          <div>
            <label className="font-semibold text-base" style={{ color: COLORS.dark }}>Selecciona los productos e  ingresa los datos del cliente</label>
            {/* Buscador */}
            <div className="mb-2 flex justify-end">
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full sm:w-72 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Buscar producto, descripción o código..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ color: COLORS.dark }}
              />
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {productos.filter(prod =>
                prod.nombreProducto.toLowerCase().includes(search.toLowerCase()) ||
                prod.descripcion.toLowerCase().includes(search.toLowerCase()) ||
                prod.codigoBarras.toLowerCase().includes(search.toLowerCase())
              ).map(prod => {
                const selectedItem = selected.find(p => p.codigoBarras === prod.codigoBarras);
                return (
                  <div key={prod.codigoBarras} className={`flex flex-col gap-1 p-3 rounded-lg border transition-all duration-200 ${selectedItem ? 'border-green-700 bg-green-50 shadow' : 'border-gray-200 bg-white'}`}> 
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!selectedItem}
                        onChange={() => handleSelect(prod.codigoBarras)}
                        className="accent-green-700 w-4 h-4"
                      />
                      <span className="font-semibold text-sm" style={{ color: COLORS.accent }}>{prod.nombreProducto}</span>
                    </div>
                    <span className="text-xs text-gray-700">{prod.descripcion}</span>
                    <span className="text-xs text-gray-500">Stock: {prod.cantidad}</span>
                    {selectedItem && (
                      <input
                        type="number"
                        min="1"
                        max={prod.cantidad}
                        className="border border-green-700 p-1 rounded w-24 text-xs focus:outline-none focus:ring-2 focus:ring-green-700"
                        placeholder="Cantidad"
                        value={selectedItem.cantidad}
                        onChange={e => handleCantidadChange(prod.codigoBarras, e.target.value)}
                        style={{ background: COLORS.light, color: COLORS.dark }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Datos del cliente */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" className="border p-3 rounded flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent" style={{ borderColor: COLORS.accent, color: COLORS.dark }} placeholder="Nombre del cliente" value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} required />
            <input type="text" className="border p-3 rounded flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent" style={{ borderColor: COLORS.accent, color: COLORS.dark }} placeholder="Cédula del cliente" value={cedulaCliente} onChange={e => setCedulaCliente(e.target.value)} required />
          </div>
          <textarea className="border p-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent" style={{ borderColor: COLORS.accent, color: COLORS.dark }} placeholder="Observación (detalle de la venta)" value={observacion} onChange={e => setObservacion(e.target.value)} required />
          {/* Tipo de pago y datos de transferencia */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="border p-3 rounded flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent" style={{ borderColor: COLORS.accent, color: COLORS.dark }} value={tipoPago} onChange={e => setTipoPago(e.target.value)} required>
              <option value="">Tipo de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
            {tipoPago === "transferencia" && (
              <>
                <input type="text" className="border p-3 rounded flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent" style={{ borderColor: COLORS.accent, color: COLORS.dark }} placeholder="Número de documento" value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} required={tipoPago === "transferencia"} />
                <input type="text" className="border p-3 rounded flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent" style={{ borderColor: COLORS.accent, color: COLORS.dark }} placeholder="Descripción del documento" value={descripcionDocumento} onChange={e => setDescripcionDocumento(e.target.value)} required={tipoPago === "transferencia"} />
              </>
            )}
          </div>
          {/* Mensajes de error y éxito */}
          {error && <div className="text-red-600 text-center font-semibold text-sm">{error}</div>}
          {success && <div className="text-green-700 text-center font-semibold text-sm">{success}</div>}
          {/* Total estimado en tiempo real */}
          {selected.length > 0 && (
            <div className="text-right font-bold text-base mt-2" style={{ color: COLORS.accent }}>
              Total: $ {totalEstimado.toFixed(2)}
            </div>
          )}
          {total !== null && (
            <div className="text-center font-bold text-lg" style={{ color: COLORS.accent }}>
              Total de la venta: $ {Number(total).toFixed(2)}
            </div>
          )}
          <button type="submit" className="py-3 rounded font-bold text-base shadow-md transition-all duration-200 hover:scale-105" style={{ background: COLORS.accent, color: COLORS.light }} disabled={loading}>
            {loading ? <span className="animate-pulse">Registrando...</span> : <span>Registrar Venta</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VentasPage;
