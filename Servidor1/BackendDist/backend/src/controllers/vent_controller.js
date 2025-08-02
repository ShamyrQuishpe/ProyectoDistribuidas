import Vent from '../models/vent.js';
import Product from '../models/product.js';
import { controlarStock } from '../helper/stock_helper.js';

// Registrar una nueva venta
const registrarVenta = async (req, res) => {

  // Ahora se espera un array de objetos: [{ codigoBarras, cantidad }]
  const {
    productos,
    tipoPago,
    numeroDocumento,
    descripcionDocumento,
    nombreCliente,
    cedulaCliente,
    observacion
  } = req.body;

  if (
    !Array.isArray(productos) || productos.length === 0 ||
    !tipoPago || !['efectivo', 'transferencia'].includes(tipoPago) ||
    !nombreCliente?.trim() ||
    !cedulaCliente?.trim() ||
    !observacion?.trim()
  ) {
    return res.status(400).json({ msg: "Datos incompletos o inválidos" });
  }

  // Validar estructura de productos: cada uno debe tener codigoBarras y cantidad > 0
  for (const p of productos) {
    if (!p.codigoBarras || typeof p.cantidad !== 'number' || p.cantidad <= 0) {
      return res.status(400).json({ msg: "Cada producto debe tener un código de barras y una cantidad válida (>0)" });
    }
  }

  if (tipoPago === 'transferencia') {
    if (!numeroDocumento?.trim() || !descripcionDocumento?.trim()) {
      return res.status(400).json({
        msg: "Debe ingresar número y descripción del documento para pagos por transferencia"
      });
    }
  }

  try {
    // Validar disponibilidad y stock suficiente
    const productosNoDisponibles = [];
    const productosSinStock = [];

    for (const { codigoBarras, cantidad } of productos) {
      const producto = await Product.findOne({ where: { codigoBarras } });
      if (!producto || producto.estado === 'Agotado') {
        productosNoDisponibles.push(codigoBarras);
      } else if (producto.cantidad < cantidad) {
        productosSinStock.push({ codigoBarras, disponible: producto.cantidad });
      }
    }

    if (productosNoDisponibles.length > 0) {
      return res.status(400).json({
        msg: "No se puede completar la venta. Algunos productos están agotados.",
        codigosAgotados: productosNoDisponibles
      });
    }
    if (productosSinStock.length > 0) {
      return res.status(400).json({
        msg: "No hay suficiente stock para algunos productos.",
        productosSinStock
      });
    }

    // Calcular el total de la venta
    let total = 0;
    const productosConPrecio = [];
    for (const { codigoBarras, cantidad } of productos) {
      const producto = await Product.findOne({ where: { codigoBarras } });
      if (producto) {
        const subtotal = producto.precio * cantidad;
        total += subtotal;
        productosConPrecio.push({
          codigoBarras,
          cantidad,
          precio: producto.precio,
          subtotal
        });
      }
    }

    // Registrar la venta (guardamos el array de productos con precio como JSON)
    const venta = await Vent.create({
      productos: JSON.stringify(productosConPrecio),
      total,
      tipoPago,
      numeroDocumento: tipoPago === 'transferencia' ? numeroDocumento : null,
      descripcionDocumento: tipoPago === 'transferencia' ? descripcionDocumento : null,
      nombreCliente,
      cedulaCliente,
      observacion
    });

    // Descontar stock según cantidad de cada producto
    for (const { codigoBarras, cantidad } of productos) {
      await controlarStock(codigoBarras, cantidad);
    }

    res.status(201).json({
      msg: "Venta registrada correctamente",
      venta: {
        ...venta.toJSON(),
        productos: productosConPrecio,
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al registrar la venta" });
  }
};

// Listar todas las ventas
const listarVentas = async (req, res) => {
  try {
    const ventas = await Vent.findAll({ order: [['fechaVenta', 'DESC']] });

    if (!ventas.length) {
      return res.status(404).json({ msg: "No se encontraron ventas registradas" });
    }

    res.status(200).json({ ventas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener las ventas" });
  }
};

// Obtener una venta por ID
const obtenerVentaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const venta = await Vent.findByPk(id);

    if (!venta) {
      return res.status(404).json({ msg: "Venta no encontrada" });
    }

    res.status(200).json({ venta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener la venta" });
  }
};

// Actualizar solo observación y/o datos de transferencia
const actualizarVenta = async (req, res) => {
  const { id } = req.params;
  const { observacion, numeroDocumento, descripcionDocumento } = req.body;

  try {
    const venta = await Vent.findByPk(id);
    if (!venta) {
      return res.status(404).json({ msg: "Venta no encontrada" });
    }

    // Solo actualizamos si los campos fueron enviados
    const camposActualizados = {};
    if (observacion !== undefined) camposActualizados.observacion = observacion;
    if (numeroDocumento !== undefined) camposActualizados.numeroDocumento = numeroDocumento;
    if (descripcionDocumento !== undefined) camposActualizados.descripcionDocumento = descripcionDocumento;

    await venta.update(camposActualizados);

    res.status(200).json({ msg: "Venta actualizada correctamente", venta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar la venta" });
  }
};

// Eliminar una venta por ID
const eliminarVenta = async (req, res) => {
  const { id } = req.params;

  try {
    const venta = await Vent.findByPk(id);

    if (!venta) {
      return res.status(404).json({ msg: "Venta no encontrada" });
    }

    await venta.destroy();
    res.status(200).json({ msg: "Venta eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar la venta" });
  }
};

export {
  registrarVenta,
  listarVentas,
  obtenerVentaPorId,
  actualizarVenta,
  eliminarVenta
};
