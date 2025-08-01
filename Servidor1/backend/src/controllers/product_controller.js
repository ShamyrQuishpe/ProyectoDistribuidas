import Product from '../models/product.js'

// Función para generar un código de barras único  PROBAR QUE NO SE DUPLIQUEN CODIGOS DE BARRA
const generarCodigoBarras = () => {
    let codigo = "";

    for (let i = 0; i < 12; i++) {
        codigo += Math.floor(Math.random() * 10);
    }

    let suma = 0;
    for (let i = 0; i < 12; i++) {
        let num = parseInt(codigo[i]);
        suma += (i % 2 === 0) ? num : num * 3;
    }
    let digitoControl = (10 - (suma % 10)) % 10;

    return codigo + digitoControl;
};

// Función para generar un código de barras único
const generarCodigoBarrasUnico = async () => {
    let codigoBarras;
    let existe = true;

    while (existe) {
        codigoBarras = generarCodigoBarras();
        const productoExistente = await Product.findOne({ where: { codigoBarras } });
        if (!productoExistente) {
            existe = false;
        }
    }

    return codigoBarras;
};

// Agregar un nuevo producto
const agregarProducto = async (req, res) => {
    const { codigoBarras, codigoSerial, ...otrosCampos } = req.body;

    if (Object.values(otrosCampos).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        // Verificar si el código de serie ya existe
        const productoExistente = await Product.findOne({ where: { codigoSerial } });
        if (productoExistente) {
            return res.status(400).json({ msg: "El código de serie ya está registrado para otro producto" });
        }

        // Generar código de barras único
        const codigoBarrasGenerado = await generarCodigoBarrasUnico();

        // Crear el nuevo producto
        const nuevoProducto = await Product.create({
            ...otrosCampos,
            codigoBarras: codigoBarrasGenerado,
            codigoSerial,
            responsableId: req.user.id,  // Aquí asumimos que 'id' es la clave primaria del usuario
            estado: "Disponible",
            locacion: req.user.area,
        });

        res.status(200).json({
            msg: "Producto agregado correctamente",
            producto: nuevoProducto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al agregar el producto" });
    }
};

// Listar todos los productos
const listarProductos = async (req, res) => {
    try {
        const productos = await Product.findAll();

        if (productos.length === 0) {
            return res.status(404).json({ msg: "No se encontraron productos" });
        }

        res.status(200).json({ productos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener los productos" });
    }
};

//ACTUALIZAR PRODUCTOS

// Eliminar un producto por código de barras
const eliminarProducto = async (req, res) => {
    const { codigoBarras } = req.params;

    try {
        const producto = await Product.findOne({ where: { codigoBarras } });

        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }

        await producto.destroy();

        res.status(200).json({ msg: "Producto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al eliminar el producto" });
    }
};

//VISUALIZACION DE STOCK EN TIEMPO REAL

//GESTION DE STOCK EN TIEMPO REAL

//GESTION DE VENTAS

export {
    agregarProducto,
    listarProductos,
    eliminarProducto
}
