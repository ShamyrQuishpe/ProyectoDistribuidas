# Imagen base oficial de Node.js
FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código fuente al contenedor
COPY . .

EXPOSE 3000

# Iniciar la app en modo desarrollo (Vite dev server)
CMD ["npm", "run", "dev", "--", "--host"]
