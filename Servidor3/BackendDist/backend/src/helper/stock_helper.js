import Product from '../models/product.js';

// Puede recibir: controlarStock([{codigoBarras, cantidad}]) o controlarStock(codigoBarras, cantidad)
export const controlarStock = async (codigosBarras, cantidad = 1) => {
  if (Array.isArray(codigosBarras)) {
    // [{codigoBarras, cantidad}]
    for (const item of codigosBarras) {
      const { codigoBarras, cantidad: cant } = typeof item === 'object' ? item : { codigoBarras: item, cantidad: 1 };
      const producto = await Product.findOne({ where: { codigoBarras } });
      if (producto) {
        const nuevaCantidad = parseInt(producto.cantidad) - (cant || 1);
        await producto.update({
          cantidad: nuevaCantidad < 0 ? 0 : nuevaCantidad,
          estado: nuevaCantidad <= 0 ? 'Agotado' : 'Disponible'
        });
      }
    }
  } else {
    // controlarStock(codigoBarras, cantidad)
    const producto = await Product.findOne({ where: { codigoBarras: codigosBarras } });
    if (producto) {
      const nuevaCantidad = parseInt(producto.cantidad) - (cantidad || 1);
      await producto.update({
        cantidad: nuevaCantidad < 0 ? 0 : nuevaCantidad,
        estado: nuevaCantidad <= 0 ? 'Agotado' : 'Disponible'
      });
    }
  }
};
