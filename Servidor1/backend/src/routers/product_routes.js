import { Router } from 'express';
import { agregarProducto, listarProductos, eliminarProducto } from '../controllers/product_controller.js';

const router = Router();

// Ruta para agregar un producto
router.post('/agregar', agregarProducto);

// Ruta para listar todos los productos
router.get('/listar', listarProductos);

// Ruta para eliminar producto por código de barras
router.delete('/eliminar/:codigoBarras', eliminarProducto);

export default router;
