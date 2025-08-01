import Vent from '../models/vent.js';
import Product from '../models/product.js';
import { controlarStock } from '../helper/stock_helper.js';

// Registrar una nueva venta
const registrarVenta = async (req, res) => {
  const {
    codigosBarras,
    tipoPago,
    numeroDocumento,
    descripcionDocumento,
    nombreCliente,
    cedulaCliente,
    observacion
  } = req.body;

  if (
    !Array.isArray(codigosBarras) || codigosBarras.length === 0 ||
    !tipoPago || !['efectivo', 'transferencia'].includes(tipoPago) ||
    !nombreCliente?.trim() ||
    !cedulaCliente?.trim() ||
    !observacion?.trim()
  ) {
    return res.status(400).json({ msg: "Datos incompletos o inválidos" });
  }

  if (tipoPago === 'transferencia') {
    if (!numeroDocumento?.trim() || !descripcionDocumento?.trim()) {
      return res.status(400).json({
        msg: "Debe ingresar número y descripción del documento para pagos por transferencia"
      });
    }
  }

  try {
    // ✅ Validar estado de disponibilidad antes de registrar la venta
    const productosNoDisponibles = [];

    for (const codigo of codigosBarras) {
      const producto = await Product.findOne({ where: { codigoBarras: codigo } });

      if (!producto || producto.estado === 'Agotado') {
        productosNoDisponibles.push(codigo);
      }
    }

    if (productosNoDisponibles.length > 0) {
      return res.status(400).json({
        msg: "No se puede completar la venta. Algunos productos están agotados.",
        codigosAgotados: productosNoDisponibles
      });
    }

    // ✅ Registrar la venta
    const venta = await Vent.create({
      codigosBarras,
      tipoPago,
      numeroDocumento: tipoPago === 'transferencia' ? numeroDocumento : null,
      descripcionDocumento: tipoPago === 'transferencia' ? descripcionDocumento : null,
      nombreCliente,
      cedulaCliente,
      observacion
    });

    // ✅ Descontar stock
    await controlarStock(codigosBarras);

    res.status(201).json({
      msg: "Venta registrada correctamente",
      venta
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
