# Sistema de Memoria Permanente y Autoaprendizaje (AI_MEMORY)

Este documento actúa como la **Memoria a Largo Plazo** para la Inteligencia Artificial (Antigravity) que trabaja en este proyecto.
Su objetivo es **registrar errores pasados, particularidades del framework y decisiones arquitectónicas** para garantizar que un fallo no se cometa dos veces, reduciendo drásticamente el margen de error en futuras programaciones.

---

## 🛑 Reglas Críticas del Entorno (Turbopack + Next.js 16)

1. **Importación de Rutas en Archivos de Acciones (Server Actions)**
   - **Problema encontrado:** Turbopack falla y arroja error estático (`Export supabaseServer doesn't exist in target module`) si un archivo `use server` (como `catastro.ts`) intenta importar desde otro archivo de acciones (`documents.ts`) que tiene dependencias cruzadas.
   - **Solución Aprendida (Autoaprendizaje):** Nunca importar entre archivos de acciones (`actions/A.ts` llamando a `actions/B.ts`). En su lugar, si se requiere el cliente de Supabase con Service Role, importar *directamente* desde `@/lib/supabase-server` u origen raíz seguro.

2. **Error de Módulo no encontrado (`Module not found`) en alias `@`**
   - **Problema encontrado:** El compilador es muy estricto con el uso de los alias cuando se mezclan componentes en diferentes niveles.
   - **Solución Aprendida:** Asegurar que las importaciones a `@/components/...` o `@/lib/...` coinciden al milímetro con el sistema de archivos (mayúsculas y minúsculas importan en despliegue aunque estemos en Windows).

3. **Corrupción de caché en Turbopack / dependencias (`package.json is not parseable`)**
   - **Problema encontrado:** Turbopack se bloqueó debido a que el archivo `package.json` de un submódulo (`@supabase/functions-js`) apareció como inválido/corrupto (`EOF while parsing a value`).
   - **Solución Aprendida:** Cuando Turbopack o Next.js levantan errores de sintaxis en `node_modules` que no tienen sentido, la solución estándar es borrar el directorio `.next` y reiniciar el servidor de desarrollo en frío, ya que es un fallo conocido de caché y resolución de Turbopack.

---

## 🎨 UI/UX y CSS (Frontend)

1. **CSS Grid y Pestañas Condicionales en React**
   - **Problema encontrado:** Al aplicar un `display: grid; grid-template-columns: 2fr 1fr;` en el contenedor `.content` de una página, las pestañas que ocultaban la columna derecha se deformaban al comprimirse todo en la primera columna del Grid.
   - **Solución Aprendida:** En interfaces con "Tabs", la cuadrícula (Grid) no debe estar en el contenedor raíz que envuelve el renderizado condicional. La cuadrícula debe estar *exclusivamente* dentro del contenido específico de la pestaña que lo requiere. Las demás pestañas deben renderizarse en contenedores estándar de ancho completo (`100%`).

2. **Inputs React Controlados vs No Controlados**
   - **Problema encontrado:** Si un valor de Supabase es `undefined` o `null` (ej. Código Postal vacío) y se vincula a un input (`value={formData.codigo_postal}`), React alerta sobre un input no controlado, lo que puede romper el formulario al intentar editar.
   - **Solución Aprendida:** Siempre forzar la inicialización con un OR lógico: `value={formData.codigo_postal || ''}` o `|| 0` para números, en cualquier formulario del CRM.

3. **Modificaciones Manuales de AST/JSX (Syntax Errors `Expression expected`)**
   - **Problema encontrado:** Al usar herramientas de inyección de código o reescritura, se rompió la sintaxis JSX (dejando etiquetas `<button>` abiertas), provocando un fallo total de compilación.
   - **Solución Aprendida:** Siempre verificar el anidamiento de etiquetas JSX (`<div>`, `<button>`, `<>`) tras una inyección de código. Evitar sustituciones de bloque parciales si incluyen apertura pero no cierre de etiquetas React.

---

## 🗄️ Supabase y Base de Datos

1. **Bypass de Row Level Security (RLS) en Background Tasks**
   - **Problema encontrado:** Los llamados desde la API local o Server Actions que procesan IA o integraciones y no disponen de una sesión de usuario de navegador fallan silenciosamente.
   - **Solución Aprendida:** Utilizar la instancia `supabaseServer` del archivo `@/lib/supabase-server.ts` configurada con el `service_role_key` para todo el procesamiento en background (OCR, IA, integraciones con terceros) para saltar el RLS.

2. **Ausencia de Claves Foráneas Previstas**
   - **Problema encontrado:** La consulta `SELECT` sobre documentos fallaba por `column documents.property_id does not exist`.
   - **Solución Aprendida:** Antes de programar filtros en el Frontend o Backend por un ID foráneo, la IA debe *verificar explícitamente* el schema SQL o la tabla en BD para asegurar que la columna existe y ha sido migrada.

3. **Pérdida de Sesión y Excepciones "Unauthorized" en Storage / Auth**
   - **Problema encontrado:** Errores como `Error en login`, `Sesin invlida` y `Unauthorized` al intentar subir archivos.
   - **Solución Aprendida:** Las cookies de sesión y JWT en Next.js App Router (Client Components vs Server Components) pueden desincronizarse. Asegurar que las llamadas asíncronas en Cliente envían correctamente el Auth Header, o utilizar llamadas protegidas de servidor (Server Actions o API Routes seguras) en lugar de exponer lógica de RLS compleja directamente en cliente si este pierde sesión.

---

## 🤖 Protocolo de Autoaprendizaje Continuo

1. **Antes de empezar un nuevo módulo grande:** La IA tiene la orden de leer este archivo `AI_MEMORY.md` para refrescar sus restricciones.
2. **Tras solventar un error complejo (Debugging):** La IA debe abrir este documento y añadir la causa raíz y la prevención.
3. **Refactorizaciones:** Queda prohibido aplicar un patrón de diseño que contradiga una Solución Aprendida escrita en este documento.
