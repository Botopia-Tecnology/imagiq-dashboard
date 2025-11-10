# Arquitectura Premium Simplificada ✅

## 📊 Estructura de Datos en Base de Datos

```typescript
{
  sku: string,                        // SKU único
  imagen_premium: string[],           // ✅ SOLO imágenes del CARRUSEL
  imagen_final_premium: string | null, // ✅ Imagen del DISPOSITIVO
  video_premium: string[]             // ✅ Videos del CARRUSEL
}
```

---

## 🎯 Reglas de Agrupamiento

| Campo | Alcance | Descripción |
|-------|---------|-------------|
| `imagen_premium` | **Todos los SKUs del mismo `codigoMarket`** | Imágenes del carrusel premium |
| `video_premium` | **Todos los SKUs del mismo `codigoMarket`** | Videos del carrusel premium |
| `imagen_final_premium` | **Todos los SKUs del mismo COLOR** (`hex`) | Imagen premium del dispositivo |

---

## ✅ Ventajas de la Nueva Arquitectura

### 1. **Separación Clara de Responsabilidades**
- `imagen_premium` → Solo carrusel (array simple)
- `imagen_final_premium` → Solo dispositivo (string | null)
- Ya no hay confusión sobre "cuál es la última imagen"

### 2. **Lógica Más Simple en Frontend**
```typescript
// ANTES (complicado):
const premiumImages = imagenPremium.slice(0, -1)  // Carrusel
const deviceImage = imagenPremium[imagenPremium.length - 1]  // Dispositivo

// AHORA (simple):
const premiumImages = imagen_premium  // Carrusel
const deviceImage = imagen_final_premium  // Dispositivo
```

### 3. **Operaciones Independientes**
- Puedes agregar/eliminar imágenes del carrusel sin afectar la imagen del dispositivo
- Puedes cambiar la imagen del dispositivo sin afectar el carrusel
- No hay marcadores especiales (`""`, `{}`, etc.)

### 4. **Validaciones Más Sencillas**
- `imagen_premium`: Solo valida que sean URLs válidas
- `imagen_final_premium`: Solo valida que sea URL válida o `null`
- No hay casos especiales ni lógica condicional compleja

---

## 🔄 Orden de Operaciones al Guardar

Cuando el usuario hace clic en "Guardar cambios":

```
1️⃣ CREAR/SUBIR (nuevos archivos)
   ├─ Subir videos de carrusel
   ├─ Subir imágenes de carrusel
   └─ Subir imagen del dispositivo

2️⃣ REORDENAR (actualizar orden)
   └─ Reordenar imágenes del carrusel

3️⃣ ELIMINAR (archivos marcados)
   ├─ Eliminar imagen del dispositivo
   ├─ Eliminar imágenes de carrusel
   └─ Eliminar videos de carrusel
```

**⚠️ Este orden es CRÍTICO:**
- Primero se crean todos los archivos nuevos
- Luego se reordena con todo lo nuevo ya creado
- Por último se eliminan las cosas marcadas

---

## 📝 Ejemplo Práctico

### Estado Inicial:
```json
{
  "imagen_premium": ["img1.jpg", "img2.jpg"],
  "imagen_final_premium": "device.jpg",
  "video_premium": ["video1.mp4"]
}
```

### Usuario hace cambios:
1. Agrega 2 imágenes al carrusel
2. Agrega 1 video al carrusel
3. Cambia la imagen del dispositivo
4. Elimina la primera imagen del carrusel
5. Reordena (pone img2 primero)

### Estado Final:
```json
{
  "imagen_premium": ["img2.jpg", "img3.jpg", "img4.jpg"],
  "imagen_final_premium": "device-new.jpg",
  "video_premium": ["video1.mp4", "video2.mp4"]
}
```

---

## 🔑 Puntos Clave para el Backend

1. ✅ **`imagen_premium`**: Array SOLO de imágenes del carrusel (sin marcadores)
2. ✅ **`imagen_final_premium`**: String de una sola imagen del dispositivo o `null`
3. ✅ **`video_premium`**: Array de videos del carrusel
4. ✅ **Carrusel**: Se aplica a TODOS los SKUs del mismo `codigoMarket`
5. ✅ **Dispositivo**: Se aplica a TODOS los SKUs del mismo COLOR
6. ✅ **Orden**: CREAR → REORDENAR → ELIMINAR
7. ✅ **Validaciones**: NO permitir `null`, `undefined` o strings vacíos en arrays

---

## 📂 Archivos Actualizados

1. **`BACKEND_PREMIUM_API_SPEC.md`**
   - Especificación completa de la API para el backend
   - Incluye todos los endpoints, validaciones y casos especiales

2. **`src/lib/api/multimedia-premium.ts`**
   - Funciones API actualizadas para la nueva arquitectura
   - Endpoints simplificados sin parámetros innecesarios

3. **`src/app/(dashboard)/productos/[id]/components/EditPremiumModal.tsx`**
   - Lógica de guardado actualizada (CREAR → REORDENAR → ELIMINAR)
   - Acumulación de cambios hasta hacer clic en "Guardar cambios"
   - Separación clara entre carrusel y dispositivo

4. **`src/lib/productMapper.ts`**
   - Mapeo actualizado para leer `imagen_premium` y `imagen_final_premium`
   - Compatibilidad con nombres snake_case y camelCase

---

## 🚀 Próximos Pasos

1. ✅ **Frontend**: Completo y funcionando
2. ⏳ **Backend**: Implementar según `BACKEND_PREMIUM_API_SPEC.md`
3. ⏳ **Pruebas**: Verificar todos los flujos (crear, reordenar, eliminar)

---

## 📞 Soporte

Si tienes dudas, revisa:
- `BACKEND_PREMIUM_API_SPEC.md` - Especificación completa de la API
- `ARQUITECTURA_PREMIUM_SIMPLIFICADA.md` - Este documento (resumen)

