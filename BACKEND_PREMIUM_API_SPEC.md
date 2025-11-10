# Especificación API Backend - Contenido Premium

## 📋 ARQUITECTURA DE DATOS SIMPLIFICADA

### Campos en Base de Datos (`product_media`):

```typescript
{
  sku: string,                        // SKU único del producto
  imagen_premium: string[],           // ✅ SOLO imágenes del CARRUSEL (array simple)
  imagen_final_premium: string | null, // ✅ Imagen del DISPOSITIVO (un string o null)
  video_premium: string[]             // ✅ Videos del CARRUSEL (array simple)
}
```

### Reglas de Agrupamiento:

| Tipo de Contenido | Alcance | Descripción |
|-------------------|---------|-------------|
| **Carrusel (imágenes)** | `imagen_premium` | Todos los SKUs del mismo `codigoMarket` |
| **Carrusel (videos)** | `video_premium` | Todos los SKUs del mismo `codigoMarket` |
| **Dispositivo (imagen)** | `imagen_final_premium` | Todos los SKUs del mismo COLOR (mismo `hex`) |

---

## 🎯 ENDPOINTS REQUERIDOS

### 1. **PUT** `/api/multimedia/producto/carrusel/imagenes`

**Descripción**: Subir nuevas imágenes al carrusel premium

**Request Body** (FormData):
```
files: File[]                    // Archivos de imagen a subir
skus: string                     // JSON stringified: ["SKU1", "SKU2", ...]
```

**Lógica Backend**:
1. Recibir array de archivos de imagen
2. Subir cada archivo a Cloudinary
3. Obtener URLs de Cloudinary
4. Para cada SKU en el array:
   - Leer `imagen_premium` actual (array)
   - **AGREGAR** las nuevas URLs al array existente
   - Guardar array actualizado
5. Devolver array final con las nuevas URLs

**Respuesta**:
```json
{
  "success": true,
  "message": "Imágenes agregadas al carrusel exitosamente",
  "data": {
    "skusUpdated": ["SKU1", "SKU2", ...],
    "newUrls": ["https://cloudinary.com/image1.jpg", ...],
    "finalArray": ["existing1.jpg", "existing2.jpg", "new1.jpg", "new2.jpg"]
  }
}
```

**⚠️ IMPORTANTE**: 
- NO eliminar imágenes existentes
- SOLO agregar las nuevas al final del array
- El array `imagen_premium` contiene SOLO imágenes del carrusel (sin marcadores especiales)

---

### 2. **PUT** `/api/multimedia/producto/carrusel/videos`

**Descripción**: Subir nuevos videos al carrusel premium

**Request Body** (FormData):
```
files: File[]                    // Archivos de video a subir
skus: string                     // JSON stringified: ["SKU1", "SKU2", ...]
```

**Lógica Backend**:
1. Recibir array de archivos de video
2. Subir cada archivo a Cloudinary
3. Obtener URLs de Cloudinary
4. Para cada SKU en el array:
   - Leer `video_premium` actual (array)
   - **AGREGAR** las nuevas URLs al array existente
   - Guardar array actualizado
5. Devolver array final con las nuevas URLs

**Respuesta**:
```json
{
  "success": true,
  "message": "Videos agregados al carrusel exitosamente",
  "data": {
    "skusUpdated": ["SKU1", "SKU2", ...],
    "newUrls": ["https://cloudinary.com/video1.mp4", ...],
    "finalArray": ["existing1.mp4", "new1.mp4", "new2.mp4"]
  }
}
```

---

### 3. **PUT** `/api/multimedia/producto/imagen-dispositivo-color`

**Descripción**: Subir/actualizar imagen premium del dispositivo para un color específico

**Request Body** (FormData):
```
file: File                       // Archivo de imagen a subir (UNO solo)
skus: string                     // JSON stringified: ["SKU1", "SKU2", ...] (todos los SKUs del mismo color)
```

**Lógica Backend**:
1. Recibir UN archivo de imagen
2. Subir archivo a Cloudinary
3. Obtener URL de Cloudinary
4. Para cada SKU en el array:
   - **REEMPLAZAR** completamente el campo `imagen_final_premium` con la nueva URL
   - Si había una imagen anterior, eliminarla de Cloudinary
5. Devolver la nueva URL

**Respuesta**:
```json
{
  "success": true,
  "message": "Imagen del dispositivo actualizada exitosamente",
  "data": {
    "skusUpdated": ["SKU1", "SKU2", ...],
    "newUrl": "https://cloudinary.com/device-image.jpg",
    "oldUrl": "https://cloudinary.com/old-device-image.jpg" // si existía
  }
}
```

**⚠️ IMPORTANTE**: 
- Este endpoint REEMPLAZA la imagen del dispositivo, NO la agrega a un array
- `imagen_final_premium` es un STRING, no un array
- Eliminar la imagen anterior de Cloudinary si existía

---

### 4. **PUT** `/api/multimedia/producto/carrusel/reordenar`

**Descripción**: Actualizar el orden completo del array de imágenes del carrusel

**Request Body** (JSON):
```json
{
  "skus": ["SKU1", "SKU2", ...],
  "imagen_premium": ["url1.jpg", "url2.jpg", "url3.jpg"]
}
```

**Lógica Backend**:
1. Recibir array de SKUs y el nuevo array completo de imágenes
2. Validar que todas las URLs en `imagen_premium` sean válidas
3. Para cada SKU en el array:
   - **REEMPLAZAR** completamente el campo `imagen_premium` con el nuevo array
4. Devolver confirmación

**Respuesta**:
```json
{
  "success": true,
  "message": "Orden de imágenes actualizado exitosamente",
  "data": {
    "skusUpdated": ["SKU1", "SKU2", ...],
    "finalArray": ["url1.jpg", "url2.jpg", "url3.jpg"]
  }
}
```

**⚠️ IMPORTANTE**: 
- Este endpoint REEMPLAZA completamente el array `imagen_premium`
- NO afecta a `imagen_final_premium` (imagen del dispositivo)
- Validar que el array no contenga valores null o undefined

---

### 5. **DELETE** `/api/multimedia/producto/carrusel/imagen`

**Descripción**: Eliminar una imagen específica del carrusel

**Request Body** (JSON):
```json
{
  "skus": ["SKU1", "SKU2", ...],
  "imageUrl": "https://cloudinary.com/image-to-delete.jpg",
  "imagenPremium": ["url1.jpg", "url2.jpg"]  // Array sin la imagen eliminada
}
```

**Lógica Backend**:
1. Recibir array de SKUs, URL de la imagen a eliminar, y array actualizado
2. Eliminar la imagen de Cloudinary
3. Para cada SKU en el array:
   - **REEMPLAZAR** el campo `imagen_premium` con el nuevo array (sin la imagen eliminada)
4. Devolver confirmación

**Respuesta**:
```json
{
  "success": true,
  "message": "Imagen de carrusel eliminada exitosamente",
  "data": {
    "skusUpdated": ["SKU1", "SKU2", ...],
    "deletedUrl": "https://cloudinary.com/image-to-delete.jpg",
    "finalArray": ["url1.jpg", "url2.jpg"]
  }
}
```

**⚠️ IMPORTANTE**: 
- Eliminar la imagen de Cloudinary antes de actualizar la BD
- El array `imagenPremium` en el body ya viene SIN la imagen eliminada

---

### 6. **DELETE** `/api/multimedia/producto/carrusel/video`

**Descripción**: Eliminar un video específico del carrusel

**Request Body** (JSON):
```json
{
  "skus": ["SKU1", "SKU2", ...],
  "videoUrl": "https://cloudinary.com/video-to-delete.mp4"
}
```

**Lógica Backend**:
1. Recibir array de SKUs y URL del video a eliminar
2. Eliminar el video de Cloudinary
3. Para cada SKU en el array:
   - Leer `video_premium` actual
   - Eliminar `videoUrl` del array
   - Guardar array actualizado
4. Devolver confirmación

**Respuesta**:
```json
{
  "success": true,
  "message": "Video de carrusel eliminado exitosamente",
  "data": {
    "skusUpdated": ["SKU1", "SKU2", ...],
    "deletedUrl": "https://cloudinary.com/video-to-delete.mp4",
    "finalArray": ["video1.mp4", "video2.mp4"]
  }
}
```

---

### 7. **DELETE** `/api/multimedia/producto/imagen-dispositivo-color`

**Descripción**: Eliminar la imagen premium del dispositivo para un color específico

**Request Body** (JSON):
```json
{
  "skus": ["SKU1", "SKU2", ...],
  "clearAll": true  // Indicador para limpiar imagen_final_premium
}
```

**Lógica Backend**:
1. Recibir array de SKUs del mismo color
2. Para cada SKU en el array:
   - Leer `imagen_final_premium` actual
   - Si existe URL, eliminar imagen de Cloudinary
   - **ESTABLECER** `imagen_final_premium` en `null`
3. Devolver confirmación

**Respuesta**:
```json
{
  "success": true,
  "message": "Imagen del dispositivo eliminada exitosamente",
  "data": {
    "skusUpdated": ["SKU1", "SKU2", ...],
    "deletedUrl": "https://cloudinary.com/device-image.jpg"
  }
}
```

**⚠️ IMPORTANTE**: 
- Solo afecta a `imagen_final_premium` (lo establece en `null`)
- NO afecta a `imagen_premium` (imágenes del carrusel)
- Eliminar la imagen de Cloudinary antes de actualizar la BD

---

## 🔄 ORDEN DE OPERACIONES (Frontend)

Cuando el usuario hace clic en "Guardar cambios", el frontend ejecuta las operaciones en este orden:

```
1. CREAR/SUBIR (crear nuevos archivos)
   ├─ Subir videos de carrusel (PUT /carrusel/videos)
   ├─ Subir imágenes de carrusel (PUT /carrusel/imagenes)
   └─ Subir/actualizar imagen del dispositivo (PUT /imagen-dispositivo-color)

2. REORDENAR (actualizar orden)
   └─ Reordenar imágenes del carrusel (PUT /carrusel/reordenar)

3. ELIMINAR (eliminar archivos marcados)
   ├─ Eliminar imagen del dispositivo (DELETE /imagen-dispositivo-color)
   ├─ Eliminar imágenes de carrusel (DELETE /carrusel/imagen)
   └─ Eliminar videos de carrusel (DELETE /carrusel/video)
```

**⚠️ IMPORTANTE**: 
- Este orden es CRÍTICO para evitar conflictos
- Primero se crea todo lo nuevo
- Luego se reordena con todo lo nuevo ya creado
- Por último se eliminan las cosas marcadas

---

## ✅ VALIDACIONES BACKEND

### Para todos los endpoints:

1. **Validar SKUs**:
   - Verificar que todos los SKUs existan en la BD
   - Verificar que todos pertenezcan al mismo `codigoMarket` (para carrusel)
   - Verificar que todos tengan el mismo `hex` (para imagen del dispositivo)

2. **Validar archivos**:
   - Verificar tipo de archivo (image/* o video/*)
   - Verificar tamaño máximo (10MB para imágenes, 50MB para videos)
   - Verificar formato válido

3. **Validar arrays**:
   - NO permitir arrays con valores `null` o `undefined`
   - NO permitir strings vacíos `""` en los arrays
   - Validar que todas las URLs sean válidas

4. **Manejo de errores**:
   - Si falla la subida a Cloudinary, devolver error específico
   - Si falla la actualización de BD, hacer rollback de Cloudinary
   - Devolver mensajes de error claros y específicos

---

## 🚨 CASOS ESPECIALES A MANEJAR

### Caso 1: Array vacío después de eliminar todo el carrusel

**Request**:
```json
{
  "skus": ["SKU1", "SKU2"],
  "imagenPremium": []  // Array vacío
}
```

**Lógica Backend**:
- Permitir array vacío `[]`
- Establecer `imagen_premium` en `[]` para todos los SKUs

---

### Caso 2: Subir imagen del dispositivo sin tener carrusel

**Request**:
```
file: File
skus: ["SKU1", "SKU2"]
```

**Estado de BD ANTES**:
```json
{
  "imagen_premium": [],        // Sin carrusel
  "imagen_final_premium": null // Sin imagen del dispositivo
}
```

**Estado de BD DESPUÉS**:
```json
{
  "imagen_premium": [],                              // Sin cambios
  "imagen_final_premium": "cloudinary.com/device.jpg" // Nueva imagen
}
```

---

### Caso 3: Eliminar imagen del dispositivo manteniendo carrusel

**Request**:
```json
{
  "skus": ["SKU1", "SKU2"],
  "clearAll": true
}
```

**Estado de BD ANTES**:
```json
{
  "imagen_premium": ["img1.jpg", "img2.jpg"],      // Carrusel existente
  "imagen_final_premium": "device.jpg"             // Imagen del dispositivo
}
```

**Estado de BD DESPUÉS**:
```json
{
  "imagen_premium": ["img1.jpg", "img2.jpg"],      // Sin cambios
  "imagen_final_premium": null                      // Eliminada
}
```

---

## 📊 EJEMPLO COMPLETO DE FLUJO

### Estado Inicial:
```json
{
  "sku": "SM-F966BZKJCOO",
  "imagen_premium": ["img1.jpg", "img2.jpg"],
  "imagen_final_premium": "device-old.jpg",
  "video_premium": ["video1.mp4"]
}
```

### Operaciones del Usuario:
1. Agrega 2 nuevas imágenes al carrusel
2. Agrega 1 nuevo video al carrusel
3. Cambia la imagen del dispositivo
4. Elimina la primera imagen del carrusel
5. Reordena las imágenes (pone img2 primero)

### Orden de Ejecución:

#### PASO 1: CREAR/SUBIR
```bash
# 1.1. Subir videos
PUT /api/multimedia/producto/carrusel/videos
Body: { files: [video2.mp4], skus: ["SM-F966BZKJCOO", ...] }
Result: video_premium = ["video1.mp4", "video2.mp4"]

# 1.2. Subir imágenes del carrusel
PUT /api/multimedia/producto/carrusel/imagenes
Body: { files: [img3.jpg, img4.jpg], skus: ["SM-F966BZKJCOO", ...] }
Result: imagen_premium = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"]

# 1.3. Subir imagen del dispositivo
PUT /api/multimedia/producto/imagen-dispositivo-color
Body: { file: device-new.jpg, skus: ["SM-F966BZKJCOO", ...] }
Result: imagen_final_premium = "device-new.jpg"
```

#### PASO 2: REORDENAR
```bash
# 2.1. Reordenar imágenes (img2 primero)
PUT /api/multimedia/producto/carrusel/reordenar
Body: { 
  skus: ["SM-F966BZKJCOO", ...],
  imagen_premium: ["img2.jpg", "img1.jpg", "img3.jpg", "img4.jpg"]
}
Result: imagen_premium = ["img2.jpg", "img1.jpg", "img3.jpg", "img4.jpg"]
```

#### PASO 3: ELIMINAR
```bash
# 3.1. Eliminar primera imagen (img2)
DELETE /api/multimedia/producto/carrusel/imagen
Body: { 
  skus: ["SM-F966BZKJCOO", ...],
  imageUrl: "img2.jpg",
  imagenPremium: ["img1.jpg", "img3.jpg", "img4.jpg"]
}
Result: imagen_premium = ["img1.jpg", "img3.jpg", "img4.jpg"]
```

### Estado Final:
```json
{
  "sku": "SM-F966BZKJCOO",
  "imagen_premium": ["img1.jpg", "img3.jpg", "img4.jpg"],
  "imagen_final_premium": "device-new.jpg",
  "video_premium": ["video1.mp4", "video2.mp4"]
}
```

---

## 🔑 PUNTOS CLAVE PARA EL BACKEND

1. ✅ **`imagen_premium`**: Array SOLO de imágenes del carrusel (sin marcadores especiales)
2. ✅ **`imagen_final_premium`**: String de una sola imagen del dispositivo o `null`
3. ✅ **`video_premium`**: Array de videos del carrusel
4. ✅ **Carrusel (imágenes + videos)**: Se aplica a TODOS los SKUs del mismo `codigoMarket`
5. ✅ **Imagen del dispositivo**: Se aplica a TODOS los SKUs del mismo COLOR (mismo `hex`)
6. ✅ **Orden de operaciones**: CREAR -> REORDENAR -> ELIMINAR
7. ✅ **Validaciones**: NO permitir `null`, `undefined` o strings vacíos `""` en arrays
8. ✅ **Manejo de errores**: Devolver mensajes claros y hacer rollback si es necesario

---

## 📝 NOTAS FINALES

- El frontend envía arrays completos en cada operación de reordenar
- El frontend acumula cambios localmente y los envía todos al hacer clic en "Guardar cambios"
- El backend debe manejar operaciones atómicas para evitar estados inconsistentes
- Si una operación falla, el frontend mostrará un toast de warning pero continuará con las demás
- Al finalizar, el frontend recarga la página para mostrar los cambios más recientes

