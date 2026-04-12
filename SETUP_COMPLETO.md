# Ha'Lu'Um Accounting App - Setup Completo

## 🚀 Pasos para tener la app funcionando

### 1. PREPARAR GOOGLE SHEETS (5 minutos)

**En tu hoja de Google Sheets actual:**

Ve a la hoja y crea estas 3 pestañas (sheets):

#### Pestaña 1: "Ingresos"
| Fecha | Cliente | Tipo | Monto Bruto | Estado | Notas |
|-------|---------|------|-------------|--------|-------|
| 2025-01-15 | Casa García | Casa | 8000 | Pagado | Primera obra |

- **Fecha**: Formato YYYY-MM-DD
- **Tipo**: "Casa" o "Proyecto Mediano"
- **Estado**: "Pagado" o "Pendiente"

#### Pestaña 2: "Gastos"
| Fecha | Categoría | Monto | Quién | Descripción |
|-------|-----------|-------|-------|-------------|
| 2025-01-10 | Insumos | 3000 | Guillermo | Fibra de coco |

- **Categoría**: "Publicidad", "Insumos", o "Gasolina"
- **Quién**: "Guillermo" o "Bruno"

#### Pestaña 3: "Resumen"
Déjala vacía, la app la llena automático.

---

### 2. OBTENER CREDENCIALES DE GOOGLE (10 minutos)

#### A. Habilitar Google Sheets API:
1. Ve a https://console.cloud.google.com/
2. Crea un proyecto nuevo o usa uno existente
3. Busca "Google Sheets API" y haz clic en "Habilitar"
4. Busca "Google Drive API" y habilítala también

#### B. Crear clave de API:
1. En el menú izquierdo: **Credenciales**
2. Click: **+ Crear credenciales → Clave de API**
3. Copia la clave (algo como `AIzaSyD...`)
4. **GUÁRDALA** en un lugar seguro

#### C. Compartir la hoja:
1. En tu Google Sheet, click en **Compartir**
2. Agrega esta cuenta: `tu-proyecto@appspot.gserviceaccount.com`
3. Dale acceso de **Editor**

---

### 3. OBTENER CREDENCIALES DE CLAUDE (5 minutos)

1. Ve a https://console.anthropic.com/
2. En el menú izquierdo: **API Keys**
3. Click: **Create Key**
4. Copia la clave (algo como `sk-ant-v7_...`)
5. **GUÁRDALA** en un lugar seguro

---

### 4. DESPLEGAR EN VERCEL (10 minutos)

#### A. Preparar el código:
```bash
# En tu terminal, en la carpeta del proyecto
npm create vite@latest haluum-app -- --template react
cd haluum-app
npm install recharts lucide-react
```

#### B. Reemplazar archivos:
1. Copia el contenido de `haluum-accounting-app.jsx`
2. Pégalo en `src/App.jsx`

3. En `src/App.jsx`, reemplaza estas líneas:
```javascript
const API_KEY = 'AIzaSyDummyKey'; // → Aquí tu clave de Google
const CLAUDE_API_KEY = 'sk-ant-dummykey'; // → Aquí tu clave de Claude
const SHEET_ID = '1q46w9hn7M6aAOZCCmuTtdLXPMhTfeh1Z7VdPhWHT2lE'; // Ya está
```

#### C. Desplegar:
1. Haz push del código a GitHub (crea un repo)
2. Ve a https://vercel.com/
3. Click: **New Project**
4. Selecciona tu repo de GitHub
5. En **Environment Variables**, agrega:
   - `VITE_GOOGLE_API_KEY` = tu clave de Google
   - `VITE_CLAUDE_API_KEY` = tu clave de Claude

6. Click: **Deploy**
7. **Listo**: Tu app tendrá una URL como `https://haluum-app.vercel.app`

---

### 5. DAR ACCESO A BRUNO (2 minutos)

1. Comparte el link de Vercel con Bruno
2. Cuando entre, se pide que se identifique con su cuenta de Google
3. Ambos verán los datos en tiempo real

---

## 📋 RESUMEN DE LA APP

### Dashboard
- Ingresos totales, gastos, ganancia neta
- IVA a pagar para SAT
- Repartición automática entre Guillermo y Bruno

### Ingresos
- Formulario para agregar nuevos ingresos
- Historial de todos los proyectos

### Gastos
- Formulario por categoría (Publicidad, Insumos, Gasolina)
- Registra quién gastó (para auditoría interna)
- Historial completo

### Análisis
- Claude analiza automático los datos
- Detecta tendencias
- Sugiere acciones para alcanzar $50k/mes
- Alertas sobre IVA, rentabilidad, etc.

### Reportes
- Descarga PDF para SAT
- Resumen fiscal

---

## 🔄 SINCRONIZACIÓN

- Cada 30 segundos, la app se sincroniza con Google Sheets
- Si ambos están editando al mismo tiempo, detecta conflictos
- Los datos se guardan en **caché local** para no perder nada

---

## ⚠️ NOTAS IMPORTANTES

1. **Credenciales**: Nunca compartas tus claves de API con nadie
2. **IVA**: La app calcula 16% automático, pero verifica con tu contador
3. **Backup**: Google Sheets es tu backup, la app lee de ahí
4. **SAT**: Los reportes están listos para presentar ante el SAT

---

## 🆘 PROBLEMAS COMUNES

### "Error de sincronización"
- Verifica que compartiste la hoja con la cuenta de Google
- Recarga la página

### "No se ven los datos"
- Asegúrate que las pestañas estén nombradas exactamente así: "Ingresos", "Gastos", "Resumen"
- Verifica que la API key es correcta

### "Claude no analiza"
- Verifica que tu clave de Claude sea válida
- Asegúrate que tengas crédito en tu cuenta de Anthropic

---

## 📞 PRÓXIMOS PASOS

1. Crea las pestañas en Google Sheets
2. Obtén las claves de API
3. Desplega en Vercel
4. Comparte el link con Bruno
5. Empiezan a meter datos semanales

¡Listo para llevar Ha'Lu'Um a $50k/mes! 🚀
