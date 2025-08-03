import User from '../models/user.js'; // Importa el modelo de usuario

// Función para login de usuario
const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si todos los campos están presentes
    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    // Buscar el usuario por email
    const userBDD = await User.findOne({ where: { email } });

    if (!userBDD) {
      return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
    }

    // Verificar si la contraseña es correcta
    const verificarPassword = await userBDD.matchPassword(password);

    if (!verificarPassword) {
      return res.status(400).json({ msg: "Lo sentimos, la contraseña no es correcta" });
    }

    // Desestructuramos la información del usuario que necesitamos enviar
    const { nombre, telefono, id, email: userEmail } = userBDD;

    res.status(200).json({
      nombre,
      id,
      email: userEmail,
      telefono,
    });
    
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

// Función para registrar un nuevo usuario
const registroUsuario = async (req, res) => {
  const { cedula, email, nombre, telefono, password } = req.body;

  // Verificar si todos los campos están presentes
  if (Object.values(req.body).includes("")) {
    return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
  }

  try {
    // Verificar si el usuario ya existe por email
    const existeUsuario = await User.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({
        msg: "Lo sentimos, ese email ya está registrado"
      });
    }

    // Crear una nueva instancia de User y encriptar la contraseña
    const nuevoUser = await User.create({
      cedula,
      email,
      nombre,
      telefono,
      password: await new User().encrypPassword(password), // Encriptamos la contraseña
    });

    res.status(200).json({ msg: "Usuario registrado exitosamente" });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      msg: "Error al registrar el usuario", error: error.message
    });
  }
};


// Función para eliminar un usuario
const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar el usuario por ID
    const user = await User.findByPk(id); // Usamos `findByPk` ya que `id` es la clave primaria

    if (!user) {
      return res.status(404).json({
        msg: `No se encontró un usuario con el ID: ${id}`
      });
    }

    // Eliminar usuario
    await user.destroy(); // Usamos `destroy` de Sequelize

    return res.status(200).json({
      msg: "Usuario eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({
      msg: "Ocurrió un error al intentar eliminar el usuario"
    });
  }
};

export {
  loginUsuario,
  registroUsuario,
  eliminarUsuario,
};
