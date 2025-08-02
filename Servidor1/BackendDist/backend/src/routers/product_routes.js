import { Router } from 'express';
import { agregarProducto, listarProductos, actualizarProducto, eliminarProducto, aumentarCantidad } from '../controllers/product_controller.js';

const router = Router();

// Ruta para agregar un producto
router.post('/agregar', agregarProducto);

// Ruta para listar todos los productos
router.get('/listar', listarProductos);

router.put('/actualizar/:codigoBarras', actualizarProducto);

router.post('/aumentar', aumentarCantidad)

// Ruta para eliminar producto por código de barras
router.delete('/eliminar/:codigoBarras', eliminarProducto);

export default router;
