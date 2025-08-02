import Product from '../models/product.js';
import { controlarStock } from '../helper/stock_helper.js';

// Genera un código de barras válido con dígito de control
const generarCodigoBarras = () => {
    let codigo = "";
    for (let i = 0; i < 12; i++) {
        codigo += Math.floor(Math.random() * 10);
    }

    let suma = 0;
    for (let i = 0; i < 12; i++) {
        const num = parseInt(codigo[i]);
        suma += (i % 2 === 0) ? num : num * 3;
    }

    const digitoControl = (10 - (suma % 10)) % 10;
    return codigo + digitoControl;
};

// Genera un código de barras único
const generarCodigoBarrasUnico = async () => {
    let codigoBarras;
    let existe = true;

    while (existe) {
        codigoBarras = generarCodigoBarras();
        const productoExistente = await Product.findOne({ where: { codigoBarras } });
        if (!productoExistente) existe = false;
    }

    return codigoBarras;
};

const normalizarTexto = (texto) => {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

// Agregar un nuevo producto
const agregarProducto = async (req, res) => {
    const { descripcion, nombreProducto, cantidad, precio } = req.body;

    if (
        !descripcion?.trim() ||
        !nombreProducto?.trim() ||
        cantidad == null || !Number.isInteger(Number(cantidad)) || Number(cantidad) < 0 ||
        precio == null || isNaN(precio)
    ) {
        return res.status(400).json({ msg: "Debes llenar todos los campos correctamente" });
    }

    try {
        const nombreNormalizado = normalizarTexto(nombreProducto);

        const productoExistente = await Product.findOne({
            where: { nombreProducto: nombreNormalizado } // <- aquí el cambio
        });

        if (productoExistente) {
            return res.status(400).json({ msg: "Ya existe un producto con ese nombre. Evita duplicados." });
        }

        const codigoBarrasGenerado = await generarCodigoBarrasUnico();

        const nuevoProducto = await Product.create({
            codigoBarras: codigoBarrasGenerado,
            descripcion,
            nombreProducto: nombreNormalizado,
            cantidad: parseInt(cantidad),
            precio,
            estado: "Disponible"
        });

        res.status(200).json({
            msg: "Producto agregado correctamente",
            producto: nuevoProducto,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al agregar el producto" });
    }
};

// Listar todos los productos
const listarProductos = async (req, res) => {
    try {
        const productos = await Product.findAll();
        if (!productos.length) {
            return res.status(404).json({ msg: "No se encontraron productos" });
        }

        res.status(200).json({ productos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los productos" });
    }
};

// Actualizar un producto por código de barras
const actualizarProducto = async (req, res) => {
    const { codigoBarras } = req.params;
    const { descripcion, nombreProducto, cantidad, precio, estado } = req.body;

    // Validar campos opcionales
    if (
        cantidad != null && (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 0) ||
        precio != null && isNaN(precio)
    ) {
        return res.status(400).json({ msg: "Cantidad debe ser un número entero y precio un número válido" });
    }

    try {
        const producto = await Product.findOne({ where: { codigoBarras } });
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }

        await producto.update({
            descripcion: descripcion ?? producto.descripcion,
            nombreProducto: nombreProducto ?? producto.nombreProducto,
            cantidad: cantidad != null ? parseInt(cantidad) : producto.cantidad,
            precio: precio != null ? parseFloat(precio) : producto.precio,
            estado: estado ?? producto.estado
        });

        res.status(200).json({ msg: "Producto actualizado correctamente", producto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar el producto" });
    }
};

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
        res.status(500).json({ msg: "Error al eliminar el producto" });
    }
};

const aumentarCantidad = async (req, res) => {
    const { codigoBarras, cantidad } = req.body;

    // Validaciones básicas
    if (!codigoBarras || cantidad == null || !Number.isInteger(Number(cantidad)) || Number(cantidad) <= 0) {
        return res.status(400).json({ msg: "Debes ingresar un código de barras válido y una cantidad mayor a cero" });
    }

    try {
        // Buscar producto por código de barras (corregido)
        const producto = await Product.findOne({ where: { codigoBarras } });

        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado con ese código de barras" });
        }

        // Sumar la cantidad actual
        producto.cantidad = parseInt(producto.cantidad) + parseInt(cantidad);

        // Si estaba agotado, actualizar estado a disponible
        if (producto.estado === "Agotado" && producto.cantidad > 0) {
            producto.estado = "Disponible";
        }

        await producto.save();

        res.status(200).json({
            msg: "Cantidad actualizada correctamente",
            productoActualizado: producto
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar la cantidad del producto" });
    }
};

export {
    agregarProducto,
    listarProductos,
    actualizarProducto,
    eliminarProducto,
    aumentarCantidad
};
