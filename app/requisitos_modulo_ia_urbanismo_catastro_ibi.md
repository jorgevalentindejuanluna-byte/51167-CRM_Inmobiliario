# Documento de requisitos para Antigravity

## Módulo IA Urbanística, Fiscal y Catastral para CRM Inmobiliario

---

## 1. Objetivo del módulo

Añadir al CRM inmobiliario un módulo de consulta con inteligencia artificial que permita analizar automáticamente información pública relacionada con cada inmueble:

- Normativa urbanística del municipio.
- Coste estimado del Impuesto sobre Bienes Inmuebles {IBI}.
- Consultas a bases de datos públicas catastrales en España.
- Generación de informes interpretables para uso interno, comercial y documental.

El módulo deberá estar disponible en:

- Menú principal del CRM.
- Ficha individual de cada inmueble.

---

## 2. Nombre del módulo

### Nombre técnico sugerido

`ModuloAIUrbanismoCatastroIBI`

### Nombre visible sugerido

`Asistente IA Urbanístico, Fiscal y Catastral`

---

## 3. Alcance funcional

El módulo debe permitir al usuario consultar, desde el CRM, información urbanística, fiscal y catastral asociada a un inmueble.

Debe funcionar de dos formas:

1. Consulta general desde el menú principal.
2. Consulta contextual desde la ficha de cada inmueble.

---

## 4. Acceso desde menú principal

Crear una nueva sección en el menú principal del CRM:

```text
Asistente IA Urbanístico, Fiscal y Catastral
```

### Funciones disponibles

- Buscar inmueble por referencia catastral.
- Buscar inmueble por dirección.
- Buscar por provincia, municipio, vía, número, planta y puerta.
- Buscar por polígono y parcela.
- Consultar normativa urbanística municipal.
- Consultar información fiscal sobre IBI.
- Consultar datos públicos del Catastro.
- Generar informe completo.
- Guardar consulta en historial.
- Exportar informe a PDF.
- Asociar la consulta a un inmueble existente del CRM.

---

## 5. Acceso desde ficha de inmueble

En la ficha individual de cada inmueble añadir una nueva pestaña o bloque:

```text
Análisis IA Urbanístico, Fiscal y Catastral
```

### Funciones disponibles

- Autocompletar la consulta con los datos del inmueble.
- Consultar Catastro por referencia catastral.
- Consultar Catastro por dirección.
- Consultar normativa urbanística del municipio.
- Consultar ordenanza fiscal del IBI.
- Estimar coste del IBI si existe valor catastral disponible.
- Generar resumen ejecutivo.
- Generar informe técnico.
- Guardar resultado dentro de la ficha.
- Mostrar fecha de última consulta.
- Actualizar consulta.
- Exportar informe en PDF.
- Copiar resumen para cliente.
- Copiar resumen para uso interno.

---

## 6. Datos necesarios en la ficha del inmueble

El CRM debe disponer, como mínimo, de estos campos para que el módulo funcione correctamente.

| Campo | Obligatorio | Uso |
|---|---:|---|
| Provincia | Sí | Consulta Catastro y normativa |
| Municipio | Sí | Consulta municipal |
| Dirección completa | Sí | Búsqueda catastral |
| Tipo de vía | Recomendado | Precisión en Catastro |
| Nombre de vía | Sí | Precisión en Catastro |
| Número | Sí | Precisión en Catastro |
| Bloque | Opcional | Precisión del inmueble |
| Escalera | Opcional | Precisión del inmueble |
| Planta | Opcional | Precisión del inmueble |
| Puerta | Opcional | Precisión del inmueble |
| Código postal | Recomendado | Validación territorial |
| Referencia catastral | Muy recomendado | Consulta directa |
| Tipo de inmueble | Sí | IBI y análisis |
| Uso del inmueble | Recomendado | Residencial, local, garaje, suelo, rústico |
| Valor catastral | Solo si lo aporta el usuario | Estimación IBI |
| Superficie construida | Recomendado | Informe |
| Superficie de parcela | Opcional | Rústicos, solares, unifamiliares |
| Año de construcción | Opcional | Informe catastral |
| Coordenadas | Opcional | Mapas y visores |

---

## 7. Fuentes de datos

### 7.1 Catastro

Integrar los servicios web libres de la Sede Electrónica del Catastro.

El sistema deberá permitir consultar datos catastrales no protegidos mediante:

- Referencia catastral.
- Dirección.
- Provincia.
- Municipio.
- Vía.
- Número.
- Polígono y parcela.

### Datos catastrales esperados

- Referencia catastral.
- Localización.
- Clase del inmueble.
- Uso principal.
- Superficie construida.
- Año de construcción.
- Parcela.
- Cartografía o enlace al visor catastral.
- Datos no protegidos disponibles.

### Restricción

No consultar, almacenar ni mostrar datos protegidos del Catastro, salvo que el sistema implemente autorización oficial suficiente.

Datos protegidos a evitar:

- Titularidad.
- DNI/NIF del titular.
- Domicilio fiscal del titular.
- Valor catastral si no ha sido aportado por usuario autorizado.

---

## 8. Consulta urbanística IA

El sistema debe permitir realizar consultas sobre la normativa urbanística aplicable al municipio del inmueble.

### Preguntas que debe responder

- Qué normativa urbanística aplica al inmueble.
- Qué planeamiento urbanístico está vigente en el municipio.
- Si existe PGOU, POM, normas subsidiarias u ordenanzas urbanísticas.
- Qué fuentes oficiales se han localizado.
- Qué limitaciones urbanísticas pueden ser relevantes.
- Qué documentos debería revisar un técnico.
- Si la información localizada es completa o parcial.

### Fuentes urbanísticas prioritarias

- Ayuntamiento.
- Sede electrónica municipal.
- Portal urbanístico municipal.
- Boletín oficial provincial.
- Boletín oficial autonómico.
- Visores urbanísticos oficiales.
- Documentos PDF oficiales.
- Ordenanzas municipales.

### Resultado esperado

El resultado debe incluir:

- Resumen ejecutivo.
- Normativa localizada.
- Fuente oficial.
- Fecha de consulta.
- Nivel de confianza.
- Limitaciones detectadas.
- Advertencia legal.
- Recomendación de validación técnica.

---

## 9. Consulta IBI

El sistema debe permitir consultar información fiscal relativa al Impuesto sobre Bienes Inmuebles del municipio.

### Funciones

- Localizar la ordenanza fiscal del IBI.
- Detectar el ejercicio fiscal vigente.
- Extraer tipo impositivo urbano.
- Extraer tipo impositivo rústico.
- Extraer tipo impositivo de bienes de características especiales, si existe.
- Detectar bonificaciones publicadas.
- Detectar recargos publicados.
- Calcular estimación de IBI si existe valor catastral disponible.

### Fórmula base

```text
IBI estimado = valor catastral x tipo impositivo municipal
```

### Regla crítica

El sistema no debe inventar el valor catastral.

Si no existe valor catastral disponible en el CRM o aportado por el usuario, el sistema debe indicar:

```text
No es posible calcular el IBI estimado porque no consta valor catastral disponible.
```

---

## 10. Funcionalidades IA

La IA deberá actuar como asistente técnico especializado en:

- Análisis inmobiliario.
- Urbanismo municipal.
- Catastro.
- Fiscalidad local.
- Interpretación documental.
- Generación de informes.

### Reglas de comportamiento de la IA

- No inventar normativa.
- No inventar tipos de IBI.
- No inventar valores catastrales.
- No afirmar que una normativa está vigente si no se puede verificar.
- Citar siempre las fuentes usadas.
- Informar cuando el resultado sea parcial.
- Mostrar nivel de confianza.
- Recomendar revisión profesional cuando proceda.
- Diferenciar entre dato oficial, inferencia y advertencia.

---

## 11. Prompt base interno para IA

```text
Actúa como asistente técnico especializado en análisis inmobiliario, urbanismo municipal, Catastro e impuestos locales en España.

Analiza únicamente la información aportada por fuentes oficiales, datos públicos o datos internos del CRM.

No inventes normativa, valores catastrales, tipos de IBI, clasificaciones urbanísticas ni conclusiones jurídicas.

Cuando una información no esté disponible, indícalo expresamente.

Devuelve siempre la respuesta en formato estructurado con:

- resumen ejecutivo
- datos encontrados
- fuentes consultadas
- limitaciones
- nivel de confianza
- recomendación profesional

No sustituyes el criterio de un arquitecto, técnico municipal, abogado urbanista ni asesor fiscal.
```

---

## 12. Arquitectura técnica propuesta

### Componentes principales

- Frontend del CRM.
- Backend API.
- Servicio de integración con Catastro.
- Servicio de búsqueda documental municipal.
- Servicio de análisis IA.
- Base de datos del CRM.
- Sistema de caché.
- Generador PDF.
- Sistema de logs.
- Sistema de auditoría de consultas.

---

## 13. Flujo desde ficha de inmueble

1. Usuario abre la ficha del inmueble.
2. Accede a la pestaña de análisis IA.
3. Pulsa el botón `Consultar`.
4. Backend valida datos mínimos.
5. Sistema consulta Catastro.
6. Sistema identifica municipio y provincia.
7. Sistema busca normativa urbanística oficial.
8. Sistema busca ordenanza fiscal IBI.
9. IA analiza las fuentes localizadas.
10. Sistema devuelve informe estructurado.
11. Usuario puede guardar, copiar o exportar.

---

## 14. Flujo desde menú principal

1. Usuario accede al módulo desde el menú principal.
2. Introduce referencia catastral o dirección.
3. Sistema busca el inmueble.
4. Usuario selecciona el resultado correcto.
5. Sistema genera análisis urbanístico, fiscal y catastral.
6. Usuario puede guardar la consulta.
7. Usuario puede vincular la consulta a una ficha existente.
8. Usuario puede exportar el informe.

---

## 15. Modelo de base de datos sugerido

### Tabla: `ai_property_queries`

| Campo | Tipo |
|---|---|
| id | UUID |
| property_id | UUID nullable |
| user_id | UUID |
| query_type | enum |
| province | varchar |
| municipality | varchar |
| address | text |
| cadastral_reference | varchar |
| input_payload | json |
| result_payload | json |
| sources | json |
| confidence_score | decimal |
| status | enum |
| created_at | datetime |
| updated_at | datetime |

### Valores sugeridos para `query_type`

```text
urbanismo
ibi
catastro
completo
```

### Valores sugeridos para `status`

```text
pending
completed
partial
failed
review_required
```

---

### Tabla: `cadastral_cache`

| Campo | Tipo |
|---|---|
| id | UUID |
| cadastral_reference | varchar |
| province | varchar |
| municipality | varchar |
| raw_response | json/text |
| normalized_data | json |
| source_url | text |
| fetched_at | datetime |
| expires_at | datetime |

---

### Tabla: `municipal_regulation_cache`

| Campo | Tipo |
|---|---|
| id | UUID |
| municipality | varchar |
| province | varchar |
| regulation_type | varchar |
| title | text |
| source_url | text |
| extracted_text | longtext |
| summary | longtext |
| valid_from | date nullable |
| fetched_at | datetime |
| confidence_score | decimal |

---

### Tabla: `ibi_tax_cache`

| Campo | Tipo |
|---|---|
| id | UUID |
| municipality | varchar |
| province | varchar |
| fiscal_year | year |
| urban_rate | decimal nullable |
| rustic_rate | decimal nullable |
| bice_rate | decimal nullable |
| bonuses | json |
| source_url | text |
| extracted_text | longtext |
| fetched_at | datetime |
| confidence_score | decimal |

---

## 16. Pantallas necesarias

## 16.1 Pantalla principal del módulo

Ruta sugerida:

```text
/crm/ai-urbanismo-catastro
```

### Elementos

- Buscador por referencia catastral.
- Buscador por dirección.
- Selector de provincia.
- Selector de municipio.
- Selector de tipo de consulta.
- Botón de consultar.
- Tabla de resultados.
- Historial de consultas.
- Filtros por municipio.
- Filtros por fecha.
- Filtros por usuario.
- Filtros por tipo de consulta.

### Tipos de consulta

```text
Catastro
Urbanismo
IBI
Informe completo
```

---

## 16.2 Pestaña dentro de ficha de inmueble

Ruta sugerida:

```text
/crm/properties/{property_id}/ai-analysis
```

### Bloques visibles

- Estado de datos mínimos.
- Datos catastrales.
- Normativa urbanística.
- Información IBI.
- Estimación económica.
- Fuentes consultadas.
- Riesgos o advertencias.
- Historial de consultas.
- Acciones disponibles.

### Botones

- Consultar IA.
- Actualizar consulta.
- Guardar en ficha.
- Exportar PDF.
- Copiar resumen para cliente.
- Copiar resumen interno.
- Ver fuentes.

---

## 17. Formato del informe generado

El informe debe incluir:

1. Datos identificativos del inmueble.
2. Datos catastrales no protegidos.
3. Normativa urbanística localizada.
4. Información fiscal del IBI.
5. Estimación económica, si procede.
6. Fuentes oficiales consultadas.
7. Fecha y hora de generación.
8. Nivel de confianza.
9. Limitaciones.
10. Advertencia legal.
11. Recomendaciones.

---

## 18. Estructura del resultado IA

El backend debe devolver un objeto estructurado similar a este:

```json
{
  "summary": "Resumen ejecutivo del análisis.",
  "cadastral_data": {
    "reference": "",
    "location": "",
    "use": "",
    "surface": "",
    "construction_year": ""
  },
  "urban_regulation": {
    "status": "found",
    "title": "",
    "source_url": "",
    "summary": "",
    "limitations": ""
  },
  "ibi": {
    "status": "estimated",
    "fiscal_year": "",
    "urban_rate": null,
    "rustic_rate": null,
    "cadastral_value_used": null,
    "estimated_amount": null,
    "source_url": ""
  },
  "sources": [],
  "confidence_score": 0.0,
  "legal_warning": "",
  "recommendations": []
}
```

---

## 19. Estados del sistema

| Estado | Descripción |
|---|---|
| Sin datos suficientes | Faltan municipio, dirección o referencia catastral |
| Consultando | Proceso en curso |
| Resultado completo | Catastro, urbanismo e IBI disponibles |
| Resultado parcial | Alguna fuente no encontrada |
| Revisión recomendada | Baja confianza o fuente ambigua |
| Error | Fallo técnico o fuente no disponible |

---

## 20. Sistema de caché

Para evitar consultas repetidas y mejorar rendimiento, implementar caché para:

- Datos catastrales.
- Ordenanzas fiscales.
- Normativa urbanística.
- Resultados IA.

### Reglas sugeridas

| Tipo de dato | Duración caché sugerida |
|---|---:|
| Datos catastrales | 30 días |
| Ordenanza IBI | Hasta cambio de ejercicio fiscal |
| Normativa urbanística | 90 días |
| Informe IA | Permanente hasta nueva actualización |

---

## 21. Seguridad y cumplimiento

### Reglas obligatorias

- No mostrar datos protegidos del Catastro sin autorización.
- No almacenar titularidades catastrales no autorizadas.
- No almacenar DNI/NIF de titulares.
- No inventar normativa urbanística.
- No inventar tipos fiscales.
- No inventar valores catastrales.
- Guardar siempre fuente y fecha de consulta.
- Registrar qué usuario realizó cada consulta.
- Permitir eliminación de consultas según política RGPD.
- Evitar decisiones automatizadas con efectos jurídicos sin revisión humana.

---

## 22. Advertencia legal obligatoria

Todo informe generado debe incluir este texto:

```text
Este informe ha sido generado mediante inteligencia artificial a partir de fuentes públicas y datos disponibles en el CRM. Su contenido tiene carácter meramente informativo y no sustituye la consulta directa al Ayuntamiento, al Catastro, a un arquitecto, técnico urbanista, abogado o asesor fiscal. La información urbanística, fiscal y catastral debe verificarse siempre en la administración competente antes de tomar decisiones jurídicas, económicas o comerciales.
```

---

## 23. Logs y auditoría

El sistema debe registrar:

- Usuario que realiza la consulta.
- Fecha y hora.
- Inmueble consultado.
- Parámetros usados.
- Fuentes consultadas.
- Resultado obtenido.
- Errores producidos.
- Si se exportó PDF.
- Si se guardó en la ficha.
- Versión del prompt IA utilizado.

---

## 24. Exportación PDF

El informe PDF debe contener:

- Logo del CRM o empresa.
- Datos del inmueble.
- Resumen ejecutivo.
- Datos catastrales.
- Normativa urbanística.
- Información IBI.
- Fuentes consultadas.
- Fecha de emisión.
- Advertencia legal.
- Firma o sello interno opcional.

---

## 25. Permisos de usuario

Crear permisos específicos:

| Permiso | Descripción |
|---|---|
| ai_module_view | Ver módulo IA |
| ai_module_query | Realizar consultas |
| ai_module_export | Exportar informes |
| ai_module_save | Guardar informes en ficha |
| ai_module_delete | Eliminar consultas |
| ai_module_admin | Administrar configuración |

---

## 26. Configuración administrativa

Crear pantalla de configuración para:

- Activar o desactivar módulo.
- Configurar proveedor IA.
- Configurar API keys.
- Configurar límites de consultas.
- Configurar caché.
- Configurar plantillas de informe.
- Configurar advertencia legal.
- Definir municipios prioritarios.
- Activar modo revisión manual.

---

## 27. Integraciones técnicas

### Catastro

Implementar cliente para:

- Consulta por referencia catastral.
- Consulta por dirección.
- Consulta por polígono/parcela.
- Conversión XML a JSON.
- Normalización de respuesta.
- Control de errores.
- Control de datos protegidos.
- Caché por referencia catastral.

### Normativa municipal

Implementar una de estas opciones:

#### Opción A: búsqueda web controlada

- Buscar únicamente en fuentes oficiales.
- Priorizar ayuntamientos y boletines.
- Descargar PDF o HTML.
- Extraer texto.
- Guardar fuente.
- Analizar con IA.

#### Opción B: base documental propia

- Subir documentos oficiales.
- Indexar normativa.
- Consultar con RAG.
- Mantener versión de cada documento.
- Asociar normativa a municipios.

### Recomendación

Usar:

- Opción B para municipios frecuentes.
- Opción A como apoyo para municipios no cargados.

---

## 28. Criterios de aceptación

El módulo se considerará correcto cuando:

- Se pueda acceder desde menú principal.
- Se pueda acceder desde ficha de inmueble.
- Permita consultar por referencia catastral.
- Permita consultar por dirección.
- Devuelva datos catastrales no protegidos.
- Localice normativa urbanística municipal cuando exista fuente oficial accesible.
- Localice ordenanza fiscal IBI cuando exista fuente pública.
- Calcule IBI solo si dispone de valor catastral válido.
- Genere informe exportable.
- Guarde historial de consultas.
- Cite fuentes.
- Muestre advertencias legales.
- Controle errores.
- Gestione resultados incompletos.
- No muestre ni almacene datos protegidos sin autorización.
- Permita guardar el resultado en la ficha del inmueble.

---

## 29. Prioridad de desarrollo

| Fase | Funcionalidad | Prioridad |
|---|---|---:|
| 1 | Pestaña IA en ficha de inmueble | Alta |
| 1 | Consulta Catastro por referencia catastral | Alta |
| 1 | Consulta Catastro por dirección | Alta |
| 1 | Informe básico catastral | Alta |
| 2 | Consulta IBI municipal | Alta |
| 2 | Estimación IBI | Alta |
| 3 | Consulta normativa urbanística | Alta |
| 3 | Informe urbanístico IA | Alta |
| 4 | Módulo general desde menú principal | Media |
| 4 | Historial global de consultas | Media |
| 5 | Exportación PDF | Media |
| 5 | RAG documental por municipios frecuentes | Alta para producción |

---

## 30. Entregable esperado para Antigravity

Desarrollar un módulo integrado en el CRM inmobiliario con:

- Backend seguro.
- Frontend responsive.
- Integración con Catastro.
- Búsqueda de normativa municipal.
- Búsqueda de ordenanzas IBI.
- Motor IA con análisis documental.
- Base de datos para historial.
- Base de datos para caché.
- Exportación PDF.
- Sistema de advertencias.
- Trazabilidad completa.
- Gestión de permisos.
- Integración en menú principal.
- Integración en ficha de inmueble.

---

## 31. Instrucción final para Antigravity

Desarrolla el módulo `ModuloAIUrbanismoCatastroIBI` dentro del CRM inmobiliario existente.

El módulo debe permitir consultar, analizar y guardar información urbanística, fiscal y catastral de inmuebles en España usando fuentes públicas oficiales y asistencia de inteligencia artificial.

Debe estar disponible tanto desde el menú principal como desde la ficha individual de cada inmueble.

La prioridad inicial es implementar la consulta catastral y la generación de informe básico. Después se añadirá IBI, normativa urbanística, exportación PDF y RAG documental.
