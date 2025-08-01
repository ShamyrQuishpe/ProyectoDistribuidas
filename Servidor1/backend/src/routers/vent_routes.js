import express from 'express';
import {
  registrarVenta,
  listarVentas,
  obtenerVentaPorId,
  actualizarVenta,
  eliminarVenta
} from '../controllers/vent_controller.js';

const router = express.Router();

// Registrar una nueva venta
router.post('/registrarVenta', registrarVenta);

// Listar todas las ventas
router.get('/listarVenta', listarVentas);

// Obtener una venta por su ID
router.get('/listarVenta/:id', obtenerVentaPorId);

// Actualizar observación, número y descripción de documento
router.put('/actualizarVenta/:id', actualizarVenta);

// Eliminar una venta por su ID
router.delete('/eliminarVenta/:id', eliminarVenta);

export default router;
