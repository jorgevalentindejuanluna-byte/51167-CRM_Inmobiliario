# Product Requirements Document {PRD}
# CRM SaaS Real Estate integral para agencia inmobiliaria

## 1. Visión general

Desarrollar un CRM inmobiliario SaaS integral para agencias real estate, preparado desde el MVP como solución comercial completa, no como prototipo básico.

El sistema debe permitir operar una agencia inmobiliaria real con:

- Leads
- Clientes compradores
- Clientes vendedores
- Propietarios
- Inquilinos
- Inversores
- Propiedades
- Captaciones
- Visitas
- Ofertas
- Operaciones
- Documentación
- Firma digital
- Firma biométrica presencial
- Facturación
- Portales inmobiliarios
- IA predictiva
- App móvil nativa
- Arquitectura multiagencia SaaS

---

## 2. Objetivo del producto

Crear una plataforma centralizada para gestionar todo el ciclo inmobiliario:

- Captación de leads
- Calificación comercial
- Gestión de compradores
- Gestión de vendedores y propietarios
- Gestión de cartera inmobiliaria
- Matching cliente-inmueble
- Seguimiento de operaciones
- Gestión documental bidireccional
- Firma digital
- Firma biométrica presencial
- Facturación y control económico
- Publicación en portales
- Comunicación multicanal
- Reporting avanzado
- IA predictiva para mejorar conversión y productividad

---

## 3. Alcance del MVP

El MVP debe entenderse como una versión comercial completa, no como un prototipo básico.

La primera entrega debe permitir operar una agencia inmobiliaria real con leads, clientes, propiedades, operaciones, documentación, firma, facturación, portales, IA, app móvil y arquitectura SaaS multiagencia.

Incluye obligatoriamente:

- App móvil nativa para iOS y Android.
- Plataforma multiagencia SaaS completa.
- Gestión independiente por agencia.
- Panel de superadministrador SaaS.
- Planes de suscripción por agencia.
- Gestión de usuarios, roles y permisos por agencia.
- Gestión completa de leads.
- Gestión completa de compradores.
- Gestión completa de vendedores y propietarios.
- Gestión completa de inquilinos.
- Gestión completa de inversores.
- Gestión completa de propiedades.
- Pipeline Kanban por tipo de operación.
- Portal privado para compradores.
- Portal privado para vendedores y propietarios.
- Seguimiento en tiempo real de operaciones.
- Gestor documental bidireccional agencia-cliente.
- OCR documental avanzado.
- Validación automática de documentos.
- Firma digital con AutoFirma / Cliente @firma.
- Validación de firma con servicios compatibles tipo @firma / VALIDe.
- Firma biométrica presencial.
- Agenda de visitas.
- Tareas y próximas acciones.
- Automatizaciones comerciales.
- IA predictiva avanzada.
- Lead scoring inteligente.
- Matching avanzado cliente-inmueble.
- Predicción de probabilidad de cierre.
- Recomendación de precio.
- Detección de leads abandonados.
- Integración directa con portales inmobiliarios.
- Integración con Idealista.
- Integración con Fotocasa.
- Integración con Habitaclia.
- Integración con Pisos.com.
- Integración con portales adicionales mediante API, XML feed o importador compatible.
- Publicación automática de inmuebles.
- Sincronización de estados con portales.
- Captura automática de leads desde portales.
- Comunicación multicanal.
- WhatsApp Business API.
- Email integrado.
- SMS opcional.
- Dashboard comercial.
- Reporting avanzado.
- Facturación contable avanzada.
- Gestión de honorarios.
- Emisión de facturas.
- Control de cobros.
- Exportación contable.
- Auditoría completa.
- Cumplimiento RGPD.
- Logs de actividad.
- Backups automáticos.
- Despliegue cloud escalable.

No incluye en MVP:

- Personalizaciones a medida por agencia fuera del estándar SaaS.
- Marketplace público de integraciones externas.
- API pública para terceros.
- White label avanzado por agencia.
- Aplicación offline completa.
- Módulo fiscal internacional.
- Integración bancaria PSD2 avanzada.

---

## 4. Usuarios y roles

### 4.1 Usuarios internos

- Superadministrador SaaS
- Administrador de agencia
- Director comercial
- Agente inmobiliario
- Captador
- Coordinador administrativo
- Gestor documental
- Responsable contable
- Usuario solo lectura

### 4.2 Usuarios externos

- Comprador
- Vendedor
- Propietario
- Inquilino
- Inversor

### 4.3 Permisos principales

Superadministrador SaaS:

- Gestionar agencias.
- Gestionar planes.
- Gestionar límites de uso.
- Ver métricas globales.
- Gestionar facturación SaaS.
- Acceder a logs técnicos.

Administrador de agencia:

- Gestionar usuarios.
- Gestionar roles.
- Configurar agencia.
- Ver todas las operaciones.
- Ver todos los informes.

Director comercial:

- Supervisar agentes.
- Asignar leads.
- Controlar pipeline.
- Analizar rendimiento.
- Revisar operaciones.

Agente inmobiliario:

- Gestionar leads asignados.
- Gestionar clientes.
- Gestionar visitas.
- Gestionar ofertas.
- Comunicar con clientes.
- Subir documentación.

Captador:

- Gestionar propietarios.
- Gestionar valoraciones.
- Gestionar encargos.
- Captar inmuebles.

Coordinador administrativo:

- Revisar documentación.
- Preparar contratos.
- Controlar firmas.
- Gestionar expedientes.

Responsable contable:

- Emitir facturas.
- Controlar cobros.
- Gestionar honorarios.
- Exportar datos contables.

Cliente externo:

- Acceder solo a sus propios datos.
- Ver sus operaciones.
- Subir documentos.
- Firmar documentos.
- Consultar mensajes, visitas, ofertas y estados.

---

## 5. Modelo de datos

### 5.1 Agencia

- id
- nombre_comercial
- razón_social
- CIF
- dirección
- teléfono
- email
- dominio
- subdominio
- plan_saas
- estado_suscripción
- límites_usuarios
- límites_propiedades
- límites_documentos
- branding
- created_at
- updated_at

---

### 5.2 Usuario

- id
- agencia_id
- nombre
- apellidos
- email
- teléfono
- rol
- estado
- último_acceso
- autenticación_2FA
- created_at
- updated_at

---

### 5.3 Lead

- id
- agencia_id
- nombre
- apellidos
- teléfono
- email
- WhatsApp
- origen
- campaña
- canal
- portal_origen
- tipo_lead
- tipo_operacion
- zona_interes
- presupuesto_min
- presupuesto_max
- urgencia
- temperatura
- score
- estado
- agente_asignado
- próxima_accion
- fecha_proxima_accion
- consentimiento_rgpd
- notas
- created_at
- updated_at

Tipos de lead:

- Comprador
- Vendedor
- Propietario
- Inquilino
- Inversor

---

### 5.4 Cliente

- id
- agencia_id
- tipo_cliente
- nombre
- apellidos
- teléfono
- email
- documento_identidad
- dirección
- ciudad
- provincia
- código_postal
- preferencias
- presupuesto
- zonas_preferidas
- financiación_aprobada
- estado_cliente
- portal_activo
- último_acceso_portal
- historial_interacciones
- created_at
- updated_at

---

### 5.5 Propiedad

- id
- agencia_id
- referencia
- título
- tipo_inmueble
- operación
- estado
- dirección
- zona
- ciudad
- provincia
- código_postal
- precio
- precio_negociable
- superficie
- habitaciones
- baños
- planta
- ascensor
- garaje
- terraza
- piscina
- certificado_energético
- descripción
- propietario_id
- agente_responsable
- fotos
- documentos
- portales_publicados
- fecha_alta
- fecha_actualización
- created_at
- updated_at

Tipos de inmueble:

- Piso
- Casa
- Chalet
- Local
- Oficina
- Nave
- Terreno
- Garaje
- Obra nueva
- Edificio
- Activo de inversión

---

### 5.6 Operación

- id
- agencia_id
- tipo_operacion
- cliente_id
- comprador_id
- vendedor_id
- propietario_id
- propiedad_id
- agente_id
- estado
- precio_salida
- precio_oferta
- precio_cierre
- honorarios_agencia
- fecha_inicio
- fecha_reserva
- fecha_contrato
- fecha_firma
- fecha_cierre
- documentación
- firma_digital_estado
- firma_biométrica_estado
- estado_facturación
- notas
- created_at
- updated_at

Tipos de operación:

- Compra
- Venta
- Alquiler
- Captación
- Inversión
- Alquiler con opción a compra

---

### 5.7 Visita

- id
- agencia_id
- cliente_id
- propiedad_id
- agente_id
- fecha
- hora
- estado
- feedback_cliente
- feedback_agente
- nivel_interés
- próxima_accion
- notas

Estados:

- Programada
- Confirmada
- Realizada
- Cancelada
- No asistió
- Reprogramada

---

### 5.8 Oferta

- id
- agencia_id
- cliente_id
- propiedad_id
- operación_id
- agente_id
- importe_ofertado
- condiciones
- estado
- fecha
- documentos_asociados
- notas

Estados:

- Presentada
- En negociación
- Aceptada
- Rechazada
- Retirada
- Contraoferta

---

### 5.9 Documento

- id
- agencia_id
- operación_id
- cliente_id
- propiedad_id
- tipo_documento
- nombre_archivo
- ruta_segura
- versión
- estado
- visibilidad
- subido_por
- revisado_por
- fecha_subida
- fecha_revisión
- fecha_caducidad
- comentarios_cliente
- comentarios_internos
- hash_documento
- resultado_OCR
- validación_automática
- firmado
- firma_id
- created_at
- updated_at

---

### 5.10 Firma digital

- id
- agencia_id
- documento_id
- operación_id
- firmante_id
- tipo_firma
- proveedor_firma
- estado
- fecha_solicitud
- fecha_firma
- certificado_usado
- resultado_validación
- hash_previo
- hash_firmado
- archivo_firmado
- justificante_firma
- logs
- created_at
- updated_at

---

### 5.11 Firma biométrica presencial

- id
- agencia_id
- documento_id
- operación_id
- firmante_id
- dispositivo
- coordenadas_firma
- presión
- velocidad
- trazo
- imagen_firma
- consentimiento
- fecha_firma
- ubicación_opcional
- agente_presencial
- justificante
- estado
- created_at
- updated_at

---

### 5.12 Factura

- id
- agencia_id
- operación_id
- cliente_id
- número_factura
- concepto
- base_imponible
- IVA
- total
- estado
- fecha_emisión
- fecha_vencimiento
- fecha_cobro
- método_pago
- archivo_pdf
- exportada_contabilidad
- created_at
- updated_at

---

### 5.13 Tarea

- id
- agencia_id
- título
- descripción
- tipo
- prioridad
- fecha_vencimiento
- estado
- asignado_a
- relacionado_con
- entidad_id
- created_at
- updated_at

Tipos:

- Llamada
- WhatsApp
- Email
- Visita
- Documentación
- Firma
- Facturación
- Seguimiento
- Valoración
- Negociación

---

## 6. Flujo comprador

### 6.1 Captación

Entrada desde:

- Web
- Landing page
- Meta Ads
- Google Ads
- Idealista
- Fotocasa
- Habitaclia
- Pisos.com
- WhatsApp
- Llamada
- Referido
- Campaña interna

Acciones:

- Crear lead automáticamente.
- Registrar origen y campaña.
- Asignar agente.
- Crear primera tarea.
- Enviar mensaje inicial.
- Activar consentimiento RGPD.
- Activar portal comprador si procede.

---

### 6.2 Calificación

Registrar:

- Presupuesto.
- Zona deseada.
- Tipo de inmueble.
- Plazo de compra.
- Necesidad de financiación.
- Nivel de urgencia.
- Motivación.
- Requisitos especiales.

Estados:

- Nuevo
- Contactado
- Calificado
- No cualificado
- En búsqueda activa
- Perdido

---

### 6.3 Matching

El sistema debe sugerir inmuebles compatibles según:

- Zona.
- Precio.
- Tipo.
- Habitaciones.
- Superficie.
- Estado.
- Preferencias.
- Historial de visitas.
- Nivel de interés.
- Probabilidad de conversión IA.

Acciones:

- Enviar propiedades al comprador.
- Registrar propiedades enviadas.
- Registrar aperturas y respuestas.
- Crear tarea de seguimiento.
- Mostrar propiedades en portal comprador.

---

### 6.4 Visitas

Acciones:

- Programar visita.
- Confirmar asistencia.
- Enviar recordatorio.
- Registrar feedback.
- Actualizar nivel de interés.
- Proponer siguiente acción.

Estados:

- Visita pendiente
- Visita confirmada
- Visita realizada
- Segunda visita
- Descartado
- Interesado

---

### 6.5 Oferta

Acciones:

- Registrar oferta.
- Asociarla a propiedad.
- Notificar al vendedor.
- Gestionar negociación.
- Adjuntar documentación.
- Generar documento de oferta.
- Enviar a firma digital si procede.

Estados:

- Oferta presentada
- En negociación
- Oferta aceptada
- Oferta rechazada
- Contraoferta
- Reserva

---

### 6.6 Documentación comprador

El comprador podrá subir:

- DNI / NIE / pasaporte
- Justificante de financiación
- Certificado bancario
- Oferta firmada
- Contrato de arras
- Justificante de transferencia
- Documentación hipotecaria
- Escritura final

---

### 6.7 Firma y cierre

Acciones:

- Generar contrato.
- Enviar a firma digital.
- Firmar mediante AutoFirma / Cliente @firma.
- Firmar biométricamente si es presencial.
- Validar documento firmado.
- Guardar justificante.
- Generar factura si procede.
- Cerrar operación.

Estados finales:

- Reserva firmada
- Contrato firmado
- Escritura programada
- Facturado
- Cobrado
- Operación cerrada
- Operación cancelada

---

## 7. Flujo vendedor / propietario

### 7.1 Captación

Entrada desde:

- Web
- Campaña de valoración
- Referido
- Llamada
- WhatsApp
- Prospección
- Meta Ads
- Google Ads

Acciones:

- Crear lead propietario.
- Registrar inmueble preliminar.
- Asignar captador.
- Programar valoración.
- Crear tarea de seguimiento.
- Activar portal vendedor si procede.

---

### 7.2 Valoración

Registrar:

- Dirección.
- Tipo de inmueble.
- Estado.
- Superficie.
- Precio estimado.
- Precio deseado por propietario.
- Urgencia de venta.
- Situación jurídica.
- Ocupación.
- Cargas.
- Documentación disponible.
- Recomendación IA de precio.

Estados:

- Valoración pendiente
- Valoración realizada
- Propuesta enviada
- Encargo pendiente
- Encargo rechazado

---

### 7.3 Encargo

Acciones:

- Generar encargo de venta o alquiler.
- Definir honorarios.
- Definir exclusividad.
- Definir duración.
- Enviar a firma digital.
- Firmar presencialmente con firma biométrica si procede.
- Activar propiedad en cartera.

Estados:

- Encargo generado
- Pendiente de firma
- Firmado
- Vencido
- Cancelado

---

### 7.4 Comercialización

Acciones:

- Publicar inmueble.
- Sincronizar con portales.
- Registrar campañas.
- Medir interesados.
- Registrar visitas.
- Registrar feedback.
- Recomendar ajustes de precio mediante IA.

Estados:

- Publicado
- En promoción
- Con interesados
- Con visitas
- Con oferta
- En negociación

---

### 7.5 Oferta y negociación

Acciones:

- Registrar oferta recibida.
- Notificar al vendedor.
- Mostrar oferta en portal privado.
- Gestionar aceptación, rechazo o contraoferta.
- Documentar negociación.
- Enviar aceptación a firma si procede.

Estados:

- Oferta recibida
- Oferta en revisión
- Contraoferta
- Aceptada
- Rechazada

---

### 7.6 Contrato y cierre

Acciones:

- Preparar contrato de arras.
- Solicitar documentación pendiente.
- Enviar a firma digital.
- Registrar pagos.
- Emitir factura.
- Preparar escritura.
- Cerrar operación.

Estados finales:

- Reserva firmada
- Contrato firmado
- Firma notarial programada
- Facturado
- Cobrado
- Operación cerrada
- Inmueble retirado

---

## 8. Flujo alquiler

Estados:

- Nuevo interesado
- Contactado
- Documentación solicitada
- Documentación recibida
- Evaluación
- Visita
- Aprobado
- Contrato generado
- Contrato firmado
- Entrega de llaves
- Facturado
- Operación cerrada
- Rechazado

Documentación del inquilino:

- DNI / NIE
- Nóminas
- Contrato laboral
- Vida laboral
- Declaración de renta
- Aval
- Seguro de impago
- Justificante de fianza

Documentación del propietario:

- Escritura
- Nota simple
- Certificado energético
- Recibo IBI
- Datos bancarios
- Contrato de alquiler

---

## 9. Portal privado comprador

El comprador tendrá acceso a:

- Estado de su búsqueda.
- Propiedades propuestas.
- Propiedades visitadas.
- Próximas visitas.
- Ofertas realizadas.
- Estado de negociación.
- Documentación pendiente.
- Documentos firmados.
- Facturas relacionadas.
- Mensajes con la agencia.
- Notificaciones.
- Línea de tiempo de operación.

Acciones disponibles:

- Subir documentos.
- Descargar documentos.
- Confirmar visitas.
- Enviar mensajes.
- Consultar ofertas.
- Firmar documentos.
- Ver tareas pendientes.
- Consultar facturas.
- Consultar estado de operación.

---

## 10. Portal privado vendedor / propietario

El vendedor o propietario tendrá acceso a:

- Estado de su inmueble.
- Fecha de publicación.
- Portales donde está publicado.
- Número de interesados.
- Número de visitas.
- Feedback de visitas.
- Ofertas recibidas.
- Estado de negociación.
- Cambios de precio.
- Documentación pendiente.
- Encargo firmado.
- Reportes comerciales.
- Mensajes con la agencia.
- Documentos firmados.
- Facturas.
- Línea de tiempo de operación.

Acciones disponibles:

- Subir documentación.
- Descargar contratos.
- Firmar encargo.
- Firmar aceptación de oferta.
- Consultar evolución comercial.
- Responder mensajes.
- Validar información del inmueble.
- Consultar facturas.

---

## 11. Gestor documental bidireccional

El CRM debe incluir gestor documental avanzado con flujo:

- Agencia → cliente
- Cliente → agencia
- Agencia → cliente
- Cliente → agencia

Funcionalidades:

- Subida segura de documentos.
- Descarga segura.
- Versionado.
- OCR documental avanzado.
- Extracción automática de datos.
- Validación automática de documentos.
- Validación manual por agencia.
- Rechazo con motivo.
- Solicitud de corrección.
- Comentarios internos.
- Comentarios visibles para cliente.
- Estados documentales.
- Firma digital.
- Firma biométrica.
- Hash documental.
- Auditoría completa.
- Registro de accesos.
- Registro de descargas.
- Control de caducidad.
- Alertas de documentos pendientes.
- Clasificación por operación.
- Clasificación por cliente.
- Clasificación por propiedad.

Estados documentales:

- Pendiente
- Solicitado
- Subido por cliente
- Subido por agencia
- En revisión
- Aprobado
- Rechazado
- Necesita corrección
- Caducado
- Sustituido
- Firmado
- Archivado

---

## 12. OCR documental avanzado

El OCR debe permitir:

- Leer DNI / NIE / pasaporte.
- Leer escrituras.
- Leer nota simple.
- Leer recibos IBI.
- Leer nóminas.
- Leer contratos.
- Leer certificados energéticos.
- Extraer datos relevantes.
- Detectar documentos incompletos.
- Detectar caducidad.
- Comparar datos con ficha de cliente.
- Alertar discrepancias.
- Sugerir clasificación documental.

---

## 13. Sistema de firma digital

### 13.1 Objetivo

Permitir que contratos, encargos, ofertas, autorizaciones y documentos inmobiliarios puedan firmarse digitalmente desde el CRM.

La integración debe contemplar AutoFirma / Cliente @firma para usuarios con certificado digital válido.

AutoFirma no debe entenderse como API REST simple. Debe tratarse como integración con componente cliente compatible, invocable desde entorno web o flujo compatible, recibiendo después el documento firmado o el resultado de firma.

---

### 13.2 Documentos firmables

- Encargo de venta.
- Encargo de alquiler.
- Mandato de comercialización.
- Oferta de compra.
- Aceptación de oferta.
- Contrato de arras.
- Contrato de alquiler.
- Anexos contractuales.
- Autorizaciones.
- Acuses de recepción.
- Documentos internos de operación.
- Facturas aceptadas si procede.

---

### 13.3 Flujo de firma digital

Paso 1. Generación del documento:

- PDF generado desde plantilla.
- Identificador único.
- Hash previo.
- Datos de operación.
- Datos de firmantes.
- Condiciones económicas.
- Fecha y versión.

Paso 2. Solicitud de firma:

- Selección de firmantes.
- Orden de firma.
- Fecha límite.
- Canal de aviso.
- Mensaje personalizado.

Paso 3. Acceso del firmante:

- Entrada al portal privado.
- Revisión del documento.
- Descarga previa.
- Aceptación de condiciones.
- Inicio de firma.

Paso 4. Firma:

- Invocación de AutoFirma / Cliente @firma.
- Uso de certificado digital local.
- Firma del documento o hash.
- Devolución del documento firmado o resultado.

Paso 5. Validación:

- Verificación de identidad del firmante.
- Integridad del documento.
- Validez del certificado.
- Fecha de firma.
- Resultado técnico.
- Validación compatible con @firma / VALIDe cuando proceda.

Paso 6. Archivo:

- Documento original.
- Documento firmado.
- Hash original.
- Hash firmado.
- Certificado usado.
- Fecha y hora.
- IP.
- Usuario firmante.
- Resultado de validación.
- Justificante de firma.
- Log técnico.

---

### 13.4 Estados de firma digital

- Borrador
- Pendiente de envío
- Enviado a firma
- Pendiente de firmante
- Firmado parcialmente
- Firmado completamente
- Rechazado
- Cancelado
- Caducado
- Error técnico
- Validado
- Archivado

---

## 14. Firma biométrica presencial

El CRM debe permitir firma presencial en tablet o dispositivo móvil.

Funcionalidades:

- Firma sobre pantalla táctil.
- Captura de trazo biométrico.
- Captura de presión, velocidad y coordenadas cuando el dispositivo lo permita.
- Vinculación con documento PDF.
- Consentimiento previo.
- Identificación del agente presencial.
- Generación de justificante.
- Almacenamiento seguro.
- Auditoría completa.

Casos de uso:

- Encargo firmado en vivienda.
- Hoja de visita.
- Autorización de tratamiento de datos.
- Recibí documental.
- Aceptación de oferta.
- Entrega de llaves.
- Anexos contractuales.

---

## 15. Pipeline Kanban

### 15.1 Pipeline comprador

- Nuevo
- Contactado
- Calificado
- Propiedades enviadas
- Visita programada
- Visita realizada
- Oferta
- Reserva
- Contrato
- Facturación
- Cierre
- Perdido

---

### 15.2 Pipeline vendedor

- Nuevo propietario
- Contactado
- Valoración pendiente
- Valoración realizada
- Encargo propuesto
- Encargo firmado
- Propiedad publicada
- Oferta recibida
- Reserva
- Facturación
- Vendido / alquilado
- Perdido

---

### 15.3 Pipeline alquiler

- Nuevo interesado
- Contactado
- Documentación solicitada
- Documentación recibida
- Visita
- Evaluación
- Contrato
- Firma
- Entrega
- Facturación
- Cerrado
- Rechazado

---

## 16. Integración con portales inmobiliarios

El CRM debe integrarse directamente con:

- Idealista
- Fotocasa
- Habitaclia
- Pisos.com
- Otros portales mediante API, XML feed, CSV o conectores específicos

Funcionalidades:

- Publicación automática de inmuebles.
- Actualización de precio.
- Actualización de estado.
- Actualización de fotos.
- Retirada automática.
- Captura de leads.
- Identificación del portal de origen.
- Registro de campaña.
- Prevención de duplicados.
- Sincronización de disponibilidad.
- Estadísticas por portal.

---

## 17. Facturación contable avanzada

Funcionalidades:

- Emisión de facturas.
- Facturas de honorarios.
- Facturas recurrentes si procede.
- Facturas rectificativas.
- Control de cobros.
- Estados de pago.
- Exportación contable.
- Numeración por agencia.
- Series de facturación.
- IVA configurable.
- Retenciones si procede.
- PDF de factura.
- Vinculación con operación.
- Vinculación con cliente.
- Reporte de ingresos.
- Reporte de honorarios por agente.
- Liquidaciones internas.

Estados de factura:

- Borrador
- Emitida
- Enviada
- Vencida
- Cobrada
- Parcialmente cobrada
- Rectificada
- Cancelada

---

## 18. IA predictiva avanzada

Funciones mínimas:

- Lead scoring.
- Probabilidad de cierre.
- Probabilidad de visita.
- Probabilidad de abandono.
- Siguiente mejor acción.
- Matching avanzado cliente-inmueble.
- Recomendación de precio.
- Detección de leads duplicados.
- Detección de leads dormidos.
- Resumen automático de conversaciones.
- Redacción de mensajes.
- Redacción de descripciones de inmuebles.
- Análisis de rendimiento por agente.
- Predicción de tiempo de venta.
- Predicción de ajuste de precio.
- Priorización automática de tareas.

---

## 19. Automatizaciones

Automatizaciones obligatorias:

- Asignación automática de leads.
- Creación automática de tarea inicial.
- Aviso si un lead no se contacta.
- Recordatorio de próxima acción.
- Aviso de visita.
- Aviso de documentación pendiente.
- Aviso de documento rechazado.
- Aviso de firma pendiente.
- Aviso de firma completada.
- Aviso de factura pendiente.
- Aviso de factura vencida.
- Aviso de encargo próximo a vencer.
- Reactivación de leads antiguos.
- Notificación de bajada de precio.
- Notificación de oferta recibida.
- Notificación de cambio de estado.
- Secuencias de email y WhatsApp.
- Actualización automática de pipeline.

---

## 20. Comunicación multicanal

Canales:

- Email
- WhatsApp Business API
- Teléfono
- SMS opcional
- Portal cliente
- App móvil
- Formularios web
- Meta Ads
- Google Ads
- Portales inmobiliarios

Cada comunicación debe registrar:

- Fecha
- Hora
- Canal
- Usuario
- Cliente
- Operación
- Mensaje
- Resultado
- Próxima acción

---

## 21. App móvil nativa

Debe existir app móvil nativa para:

- iOS
- Android

Usuarios internos:

- Ver leads.
- Crear leads.
- Gestionar propiedades.
- Agendar visitas.
- Registrar feedback.
- Subir fotos.
- Escanear documentos.
- Firma biométrica presencial.
- Consultar tareas.
- Comunicarse con clientes.
- Recibir notificaciones push.

Usuarios externos:

- Ver operaciones.
- Ver documentos.
- Subir documentos.
- Firmar cuando el flujo lo permita.
- Confirmar visitas.
- Responder mensajes.
- Consultar ofertas.
- Recibir notificaciones push.

---

## 22. Dashboard y reporting

Métricas mínimas:

- Leads nuevos.
- Leads por canal.
- Leads por portal.
- Leads por agente.
- Tiempo medio de primera respuesta.
- Leads sin seguimiento.
- Visitas programadas.
- Visitas realizadas.
- Ofertas presentadas.
- Operaciones cerradas.
- Honorarios generados.
- Facturas emitidas.
- Facturas cobradas.
- Facturas vencidas.
- Propiedades activas.
- Propiedades vendidas.
- Propiedades alquiladas.
- Documentos pendientes.
- Firmas pendientes.
- Firmas completadas.
- Ratio de conversión.
- ROI por campaña.
- ROI por portal.
- Ranking de agentes.
- Productividad por agencia.
- Métricas SaaS por plan.

---

## 23. Seguridad y RGPD

Requisitos:

- Consentimiento expreso.
- Registro de consentimiento.
- Política de privacidad.
- Control de acceso por roles.
- Acceso exclusivo a datos propios para clientes.
- Cifrado de documentos.
- URLs privadas.
- Logs de acceso.
- Logs de descarga.
- Auditoría de cambios.
- Eliminación o anonimización.
- Exportación de datos.
- Backups automáticos.
- Protección CSRF.
- Validación servidor-cliente.
- Sesiones seguras.
- Autenticación multifactor.
- Separación entre agencias.
- Separación entre notas internas y visibles.
- Separación entre documentos internos y visibles.
- Registro de actividad crítica.
- Trazabilidad de firma.
- Trazabilidad de facturación.

---

## 24. Arquitectura técnica

### 24.1 Frontend web

- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod
- TanStack Table
- Zustand o Redux Toolkit

---

### 24.2 App móvil

- React Native o Flutter
- iOS
- Android
- Push notifications
- Cámara para documentos
- Subida de archivos
- Firma biométrica
- Acceso seguro

---

### 24.3 Backend

- PostgreSQL
- Supabase o backend propio
- API REST
- Webhooks
- Autenticación segura
- Row Level Security
- Storage privado
- Servicio OCR
- Servicio IA
- Servicio de generación PDF
- Servicio de firma digital
- Servicio de facturación
- Servicio de sincronización con portales

---

### 24.4 SaaS multiagencia

- Arquitectura multi-tenant.
- Aislamiento de datos por agencia.
- Subdominio por agencia.
- Planes de suscripción.
- Límites por plan.
- Panel de superadministrador.
- Monitorización.
- Escalabilidad horizontal.
- Backups por agencia.
- Logs por agencia.

---

## 25. Integraciones

Integraciones obligatorias en MVP:

- Idealista
- Fotocasa
- Habitaclia
- Pisos.com
- WhatsApp Business API
- Email SMTP / Gmail / Outlook
- Google Calendar
- AutoFirma / Cliente @firma
- Validación tipo @firma / VALIDe
- OCR documental
- Pasarela de pago si aplica a SaaS
- Sistema contable exportable

Integraciones futuras:

- Catastro
- Google Maps avanzado
- Telefonía VoIP
- Firma eIDAS externa
- Zapier
- Make
- API pública
- Marketplace de integraciones

---

## 26. UX

Principios:

- Interfaz limpia.
- Acciones en máximo 2 o 3 clics.
- Diseño responsive.
- App móvil operativa.
- Kanban visual.
- Fichas claras.
- Botones rápidos: llamar, WhatsApp, email, agendar, firmar, facturar.
- Estados visuales.
- Alertas prioritarias.
- Portal cliente simple.
- Gestor documental claro.
- Línea de tiempo comprensible.
- Panel SaaS separado del panel de agencia.

Pantallas internas:

- Dashboard
- Leads
- Clientes
- Propiedades
- Operaciones
- Kanban
- Agenda
- Documentos
- OCR
- Firmas
- Firma biométrica
- Facturación
- Tareas
- Reportes
- Configuración

Pantallas portal cliente:

- Inicio
- Mis operaciones
- Mis inmuebles
- Mis visitas
- Mis ofertas
- Mis documentos
- Firmas pendientes
- Facturas
- Mensajes
- Notificaciones
- Perfil

Pantallas SaaS:

- Agencias
- Planes
- Suscripciones
- Métricas de uso
- Facturación SaaS
- Logs técnicos
- Configuración global

---

## 27. Métricas de éxito

- Leads captados.
- Tiempo medio de respuesta.
- Leads contactados.
- Visitas agendadas.
- Visitas realizadas.
- Ofertas generadas.
- Operaciones cerradas.
- Honorarios generados.
- Facturas emitidas.
- Facturas cobradas.
- Productividad por agente.
- Conversión por canal.
- Conversión por portal.
- ROI por campaña.
- Documentos aprobados.
- Documentos rechazados.
- Firmas completadas.
- Tiempo medio hasta firma.
- Tiempo medio hasta cierre.
- Uso de app móvil.
- Uso de portal cliente.
- Agencias activas.
- Usuarios activos.
- Retención SaaS.
- Satisfacción del cliente.

---

## 28. Riesgos

- Exceso de complejidad en MVP.
- Coste alto de desarrollo inicial.
- Baja adopción por agentes.
- Duplicidad de datos.
- Mala calidad documental.
- Integración compleja con portales.
- Problemas de compatibilidad con AutoFirma.
- Dificultades técnicas en firma biométrica.
- Incumplimiento RGPD.
- Dependencia de APIs externas.
- Escalabilidad insuficiente si se diseña mal.
- Coste operativo elevado de IA y OCR.

---

## 29. Mitigaciones

- Definir MVP como versión comercial completa pero modular.
- Priorizar módulos críticos.
- Arquitectura SaaS desde el inicio.
- Diseño UX extremadamente simple.
- Detección de duplicados.
- Validación estricta de formularios.
- Estados documentales claros.
- Pruebas técnicas tempranas con AutoFirma.
- Alternativa de firma eIDAS si procede.
- Auditoría RGPD desde diseño.
- Logs completos de operaciones críticas.
- Monitorización de costes IA/OCR.
- Integraciones por conectores independientes.
- Despliegue cloud escalable.

---

## 30. Roadmap

### Fase 1. MVP comercial completo

- SaaS multiagencia.
- App móvil nativa.
- Leads.
- Clientes.
- Propiedades.
- Operaciones.
- Kanban.
- Tareas.
- Visitas.
- Portal comprador.
- Portal vendedor.
- Gestor documental.
- OCR avanzado.
- Firma digital.
- Firma biométrica.
- Facturación.
- Portales inmobiliarios.
- IA predictiva.
- Dashboard avanzado.

---

### Fase 2. Optimización comercial

- Automatizaciones avanzadas.
- IA más precisa.
- Scoring entrenado por datos reales.
- Reportes personalizados.
- Mejora de sincronización con portales.
- Mejoras en app móvil.
- Mejoras en experiencia de clientes externos.

---

### Fase 3. Escalado SaaS

- White label avanzado.
- Marketplace de integraciones.
- API pública.
- Módulo fiscal avanzado.
- Integración bancaria.
- App offline parcial.
- Internacionalización.

---

## 31. Conclusión

El CRM debe ser una plataforma SaaS inmobiliaria integral, no un simple gestor de leads.

Debe cubrir desde el primer MVP:

- Captación
- Calificación
- Matching
- Visitas
- Ofertas
- Negociación
- Documentación
- OCR
- Firma digital
- Firma biométrica presencial
- Facturación
- Portales inmobiliarios
- IA predictiva
- App móvil
- Portal cliente
- Multiagencia SaaS
- Reporting avanzado
- Cierre de operaciones

La primera versión debe ser comercialmente operativa para una agencia inmobiliaria real y preparada para escalar como producto SaaS profesional.