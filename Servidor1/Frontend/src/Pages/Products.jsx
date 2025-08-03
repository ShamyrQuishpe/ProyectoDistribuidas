
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductModal from "../Modals/ProductModal";

const COLORS = {
  dark: "#1A1A19",
  accent: "#31511E",
  sand: "#859F3D",
  light: "#F6FCDF",
};

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState("");


  // Listar productos
  const fetchProducts = () => {
    setLoading(true);
    axios.get(`/product/listar`)
      .then((res) => {
        setProducts(res.data.productos || []);
      })
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Abrir modal para agregar producto
  const openAddModal = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  // Abrir modal para editar producto
  const openEditModal = (product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalOpen(false);
    setEditProduct(null);
    setError("");
    setSuccess("");
  };

  // Agregar o modificar producto
  const handleModalSubmit = (form) => {
    setError("");
    setSuccess("");
    // Validación básica
    for (const key in form) {
      if (!form[key] || form[key].toString().trim() === "") {
        setError("Todos los campos son obligatorios");
        return;
      }
    }
    if (isNaN(Number(form.precio)) || Number(form.precio) <= 0) {
      setError("El precio debe ser un número positivo");
      return;
    }
    if (isNaN(Number(form.cantidad)) || Number(form.cantidad) < 0) {
      setError("La cantidad debe ser un número válido");
      return;
    }
    setLoading(true);
    if (editProduct && editProduct.codigoBarras) {
      // Modificar producto por código de barras
      axios.put(`/product/actualizar/${editProduct.codigoBarras}`, form)
        .then((res) => {
          if (res.data && res.data.msg && res.data.msg.includes("correctamente")) {
            setSuccess(res.data.msg);
            fetchProducts();
            closeModal();
          } else {
            setError(res.data.msg || "Error al modificar producto");
          }
        })
        .catch(() => setError("Error al modificar producto"))
        .finally(() => setLoading(false));
    } else {
      // Agregar producto
      axios.post(`/product/agregar`, form)
        .then((res) => {
          if (res.data && res.data.msg && res.data.msg.includes("correctamente")) {
            setSuccess(res.data.msg);
            fetchProducts();
            closeModal();
          } else {
            setError(res.data.msg || "Error al registrar producto");
          }
        })
        .catch((err) => {
          setError(err.response?.data?.msg || "Error al registrar producto");
        })
        .finally(() => setLoading(false));
    }
  };

  // Eliminar producto
  const handleDelete = (codigoBarras) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    axios.delete(`/product/eliminar/${codigoBarras}`)
      .then((res) => {
        setSuccess(res.data.msg || "Producto eliminado correctamente");
        fetchProducts();
      })
      .catch(() => setError("Error al eliminar producto"))
      .finally(() => setLoading(false));
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(prod =>
    prod.nombreProducto.toLowerCase().includes(search.toLowerCase()) ||
    prod.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    prod.codigoBarras.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-2 sm:p-6" style={{ background: COLORS.light }}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold" style={{ color: COLORS.accent }}>Stock de Productos</h2>
          <button
            className="text-white px-4 py-2 rounded font-semibold hover:bg-green-800 w-full sm:w-auto"
            style={{ background: COLORS.accent, color: COLORS.light }}
            onClick={openAddModal}
          >
            Agregar Producto
          </button>
        </div>
        {error && <div className="text-red-600 text-center mb-2">{error}</div>}
        {success && <div className="text-green-700 text-center mb-2">{success}</div>}
        <div className="overflow-x-auto">
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            <table className="min-w-full bg-white rounded shadow text-xs sm:text-base">
              <thead>
                <tr style={{ background: COLORS.sand }}>
                  <th className="py-2 px-2 sm:px-4">Código Producto</th>
                  <th className="py-2 px-2 sm:px-4">Nombre</th>
                  <th className="py-2 px-2 sm:px-4">Descripción</th>
                  <th className="py-2 px-2 sm:px-4">Precio</th>
                  <th className="py-2 px-2 sm:px-4">Stock</th>
                  <th className="py-2 px-2 sm:px-4">Estado</th>
                  <th className="py-2 px-2 sm:px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4">Cargando...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4">No hay productos</td></tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.codigoBarras} className="border-b">
                      <td className="py-2 px-2 sm:px-4">{prod.codigoBarras}</td>
                      <td className="py-2 px-2 sm:px-4">{prod.nombreProducto}</td>
                      <td className="py-2 px-2 sm:px-4">{prod.descripcion}</td>
                      <td className="py-2 px-2 sm:px-4">${prod.precio}</td>
                      <td className="py-2 px-2 sm:px-4">{prod.cantidad}</td>
                      <td className="py-2 px-2 sm:px-4">{prod.estado}</td>
                      <td className="py-2 px-2 sm:px-4 flex flex-col sm:flex-row gap-2">
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          onClick={() => openEditModal(prod)}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          onClick={() => handleDelete(prod.codigoBarras)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ProductModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialData={editProduct}
        onStockUpdated={() => {
          fetchProducts();
        }}
      />
    </div>
  );
}

export default ProductsPage;
