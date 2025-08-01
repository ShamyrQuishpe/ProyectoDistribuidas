import Product from '../models/product.js';

export const controlarStock = async (codigosBarras = []) => {
  for (const codigo of codigosBarras) {
    const producto = await Product.findOne({ where: { codigoBarras: codigo } });
    if (producto) {
      const nuevaCantidad = parseInt(producto.cantidad) - 1;
      await producto.update({
        cantidad: nuevaCantidad < 0 ? 0 : nuevaCantidad,
        estado: nuevaCantidad <= 0 ? 'Agotado' : 'Disponible'
      });
    }
  }
};
