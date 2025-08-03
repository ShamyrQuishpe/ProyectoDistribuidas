import { Router } from 'express';
import { loginUsuario, registroUsuario, eliminarUsuario } from '../controllers/user_controller.js';

const router = Router();

// Ruta para login
router.post('/login', loginUsuario);

// Ruta para registro
router.post('/registro', registroUsuario);

// Ruta para eliminar usuario (se recibe el id como parámetro)
router.delete('/eliminar/:id', eliminarUsuario);

export default router;
