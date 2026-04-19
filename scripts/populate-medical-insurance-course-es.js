/**
 * populate-medical-insurance-course-es.js
 * Creates the Spanish version of Course 10 — Seguro Médico y Reembolso (MIR)
 * Pairs with English course ID 10.
 * Run from /var/www/nationalhealthcareer-com/
 */

const mysql  = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const fs = require('fs');
const path = require('path');

const DB = { host:'localhost', user:'admin_nhca', password:'2u95#I7jm', database:'nha_db' };
const UPLOADS = '/var/www/nationalhealthcareer-com/public/uploads';
const EN_COURSE_ID = 10;
const SLUG_SUFFIX = '-c10es';

function slug(title) {
  return title.toLowerCase()
    .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
    .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + SLUG_SUFFIX;
}

function makePptx(key, title, subtitle, bullets) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '0f2b5b' };
  titleSlide.addText(title, { x:0.5, y:1.5, w:12, h:1.5, fontSize:36, bold:true, color:'FFFFFF', align:'center' });
  titleSlide.addText(subtitle, { x:0.5, y:3.2, w:12, h:0.8, fontSize:18, color:'93c5fd', align:'center' });
  titleSlide.addText('National Health Career Academy', { x:0.5, y:6.8, w:12, h:0.4, fontSize:12, color:'60a5fa', align:'center' });

  bullets.forEach((section) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };
    slide.addText(section.heading, { x:0.5, y:0.4, w:12, h:0.8, fontSize:24, bold:true, color:'0f2b5b' });
    slide.addShape(pptx.ShapeType.rect, { x:0.5, y:1.15, w:12, h:0.05, fill:{ color:'1d4ed8' } });
    section.points.forEach((pt, i) => {
      slide.addText('• ' + pt, { x:0.7, y:1.4+(i*0.55), w:11.6, h:0.5, fontSize:14, color:'1f2937' });
    });
  });

  const filename = `${Date.now()}-mir-es-${key}.pptx`;
  const fullPath = path.join(UPLOADS, filename);
  pptx.writeFile({ fileName: fullPath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

const lessons = [
  // SECTION 1 — INTRODUCCIÓN AL SEGURO MÉDICO
  { sort:1, section:'INTRODUCCIÓN AL SEGURO MÉDICO', type:'text', title:'Bienvenido a Seguro Médico y Reembolso',
    content:`<h2>Bienvenido al Curso MIR</h2>
<p>El seguro médico es el mecanismo financiero que permite a los individuos y familias pagar los costos de atención médica. En los Estados Unidos, el sistema de seguros es complejo e involucra pagadores privados, públicos y programas gubernamentales especializados.</p>
<h3>Importancia de los Especialistas en Seguros Médicos</h3>
<ul><li>Verifican la cobertura antes de brindar servicios para evitar pérdidas económicas</li>
<li>Procesan reclamaciones precisas para garantizar el reembolso adecuado</li>
<li>Manejan denegaciones y apelaciones para maximizar el cobro</li>
<li>Aseguran el cumplimiento de regulaciones federales y estatales</li>
<li>Coordinan beneficios cuando el paciente tiene múltiples seguros</li></ul>
<h3>Certificación MIR de NHA</h3>
<p>La certificación MIR (Especialista en Reembolso de Seguros Médicos) de la NHA valida la competencia en tipos de seguros, ciclo de ingresos, sistemas de reembolso y cumplimiento normativo. Este curso lo prepara completamente para el examen.</p>
<h3>Lo Que Aprenderá en Este Curso</h3>
<ul><li>Tipos de planes de seguro y sus características clave</li>
<li>Programas gubernamentales: Medicare, Medicaid, TRICARE, VA</li>
<li>El ciclo completo de ingresos desde el registro hasta el cobro</li>
<li>Sistemas de reembolso: DRG, APC, RVU, Fee-for-Service</li>
<li>Cumplimiento normativo, fraude y protecciones al paciente</li></ul>` },

  { sort:2, section:'INTRODUCCIÓN AL SEGURO MÉDICO', type:'presentation', title:'Fundamentos del Seguro Médico',
    pptxKey:'fundamentos', pptxTitle:'Fundamentos del Seguro Médico', pptxSub:'Tipos, historia y terminología clave',
    pptxBullets:[
      { heading:'Tipos de Seguros de Salud', points:['Privado/Comercial: empleador o individual (Blue Cross, Aetna, United)','Público: Medicare (federal, mayores 65+) y Medicaid (estatal/federal, bajos ingresos)','Autoseguro: empleadores grandes asumen el riesgo financiero directamente','COBRA: continuación temporal de seguro grupal tras pérdida de empleo'] },
      { heading:'Historia del Seguro de Salud en EE.UU.', points:['1929: Blue Cross nace en Dallas — primer plan hospitalario prepagado','1965: Medicare y Medicaid creados bajo la Ley de Seguridad Social','1973: Ley HMO impulsa planes de cuidado gestionado (managed care)','1996: HIPAA — portabilidad e interoperabilidad de seguros','2010: ACA (Obamacare) — expansión de cobertura y protecciones al consumidor'] },
      { heading:'Términos Clave del Seguro Médico', points:['Prima: pago mensual por tener cobertura de seguro','Deducible: monto que paga el paciente antes de que el seguro cubra','Copago: tarifa fija por cada visita o servicio (ej. $25/visita)','Coseguro: porcentaje compartido entre paciente y seguro (ej. 80/20)','Límite de desembolso (out-of-pocket max): máximo anual que paga el paciente'] },
    ]
  },

  { sort:3, section:'INTRODUCCIÓN AL SEGURO MÉDICO', type:'text', title:'Tipos de Planes de Seguro Médico',
    content:`<h2>Tipos de Planes de Seguro Médico en EE.UU.</h2>
<h3>HMO — Organización de Mantenimiento de Salud</h3>
<ul><li>Requiere médico de cabecera (PCP) que coordina toda la atención</li>
<li>Necesita referencias del PCP para ver especialistas</li>
<li>Solo cubre proveedores dentro de la red</li>
<li>Primas más bajas, menor flexibilidad</li></ul>
<h3>PPO — Organización de Proveedores Preferidos</h3>
<ul><li>No requiere PCP ni referencias para especialistas</li>
<li>Cubre proveedores en y fuera de red (mayor costo fuera de red)</li>
<li>Mayor flexibilidad, primas más altas</li></ul>
<h3>EPO — Organización de Proveedores Exclusivos</h3>
<ul><li>No requiere PCP ni referencias</li>
<li>Solo cubre proveedores en red (sin cobertura fuera de red excepto emergencias)</li>
<li>Primas intermedias</li></ul>
<h3>POS — Plan de Punto de Servicio</h3>
<ul><li>Híbrido de HMO y PPO</li>
<li>Requiere PCP; puede ver especialistas fuera de red con mayor costo</li></ul>
<h3>HDHP — Plan de Alto Deducible con HSA</h3>
<ul><li>Deducible alto (mínimo $1,600 individual / $3,200 familiar en 2024)</li>
<li>Compatible con Cuenta de Ahorro para Salud (HSA) con ventajas fiscales</li>
<li>Primas bajas, mayor responsabilidad financiera del paciente</li></ul>
<h3>Plan de Indemnización</h3>
<ul><li>El paciente paga el servicio y el seguro reembolsa un porcentaje</li>
<li>Máxima flexibilidad de proveedor</li>
<li>Primas más altas, trámites adicionales</li></ul>` },

  { sort:4, section:'INTRODUCCIÓN AL SEGURO MÉDICO', type:'text', title:'Medicare y Medicaid: Programas Gubernamentales',
    content:`<h2>Programas Gubernamentales de Salud</h2>
<h3>Medicare — Programa Federal</h3>
<ul><li><strong>Parte A (Hospitalaria):</strong> hospitalización, enfermería especializada (SNF), cuidado en hogar, hospicio. Sin prima para la mayoría.</li>
<li><strong>Parte B (Médica):</strong> servicios médicos ambulatorios, preventivos, equipos médicos. Prima mensual (~$174.70/mes en 2024).</li>
<li><strong>Parte C (Medicare Advantage):</strong> planes privados aprobados que combinan Partes A y B, frecuentemente incluyen Parte D.</li>
<li><strong>Parte D (Medicamentos):</strong> cobertura de medicamentos recetados a través de planes privados aprobados.</li></ul>
<h3>Medicaid — Programa Estatal/Federal</h3>
<ul><li>Co-administrado por el gobierno federal (CMS) y cada estado</li>
<li>Elegibilidad basada en ingresos; ACA expandió a 138% del nivel de pobreza federal</li>
<li>Cobertura varía por estado (beneficios mínimos federales obligatorios)</li>
<li>Sin prima para la mayoría de los beneficiarios; copagos muy bajos</li></ul>
<h3>Otros Programas Gubernamentales</h3>
<ul><li><strong>CHIP (Children's Health Insurance Program):</strong> niños sin seguro de familias con ingresos sobre el límite de Medicaid pero que no pueden pagar seguro privado</li>
<li><strong>TRICARE:</strong> seguro médico para militares activos, reservistas y sus familias</li>
<li><strong>VA (Department of Veterans Affairs):</strong> atención médica para veteranos elegibles en instalaciones del VA</li></ul>` },

  { sort:5, section:'INTRODUCCIÓN AL SEGURO MÉDICO', type:'quiz', title:'Quiz 1: Introducción al Seguro Médico',
    quizKey:'q1' },

  // SECTION 2 — PAGADORES Y COBERTURA
  { sort:6, section:'PAGADORES Y COBERTURA', type:'text', title:'Verificación de Elegibilidad y Autorización Previa',
    content:`<h2>Verificación de Elegibilidad y Autorización Previa</h2>
<h3>Proceso de Verificación de Elegibilidad</h3>
<ul><li>Verificar antes de cada visita: cobertura activa, deducible, copago, coseguro, límite de desembolso, beneficios restantes</li>
<li>Confirmar que el proveedor está en la red del plan del paciente</li>
<li>Identificar si se requiere autorización previa para el servicio planificado</li></ul>
<h3>Transacciones EDI para Elegibilidad</h3>
<ul><li><strong>EDI 270 (Consulta de Elegibilidad):</strong> el proveedor envía solicitud al pagador con datos del paciente</li>
<li><strong>EDI 271 (Respuesta de Elegibilidad):</strong> el pagador responde con información de cobertura</li>
<li>También disponible por portal web del pagador o línea IVR telefónica</li></ul>
<h3>Información Requerida para Verificación</h3>
<ul><li>Nombre completo del paciente, fecha de nacimiento, número de miembro</li>
<li>Nombre del pagador y número de grupo del plan</li>
<li>Servicio específico que se prestará y código de diagnóstico estimado</li>
<li>Fecha de servicio planificada</li></ul>
<h3>Autorización Previa (Prior Authorization)</h3>
<ul><li>Aprobación del pagador antes de que el proveedor realice el servicio</li>
<li>También llamada: pre-certificación, pre-autorización, revisión de utilización</li>
<li>Servicios que frecuentemente requieren autorización: cirugías electivas, hospitalizaciones, procedimientos especializados, medicamentos de especialidad, equipos médicos duraderos costosos</li></ul>
<h3>Certificación de Necesidad Médica</h3>
<ul><li>El pagador evalúa si el servicio es médicamente necesario según sus criterios clínicos</li>
<li>Los criterios comúnmente usados: InterQual, Milliman Care Guidelines</li>
<li>Si se deniega: el proveedor puede solicitar revisión por pares (peer-to-peer review)</li></ul>` },

  { sort:7, section:'PAGADORES Y COBERTURA', type:'presentation', title:'Pagadores y Verificación de Cobertura',
    pptxKey:'pagadores', pptxTitle:'Pagadores y Verificación de Cobertura', pptxSub:'COB, elegibilidad y programas gubernamentales',
    pptxBullets:[
      { heading:'Coordinación de Beneficios (COB)', points:['Primario vs. secundario: el plan primario paga primero hasta su límite','Birthday Rule: el plan del padre/madre que cumple años primero en el año es primario para los hijos','COB en divorcios: el plan del padre con custodia es primario; si no aplica, el del padre que cumple años primero','Subrogación: el asegurador recupera pagos de terceros responsables (ej. accidentes de auto)'] },
      { heading:'Proceso de Verificación de Elegibilidad', points:['Paso 1: Obtener tarjeta de seguro y foto de identificación del paciente','Paso 2: Llamar al pagador, usar portal web o enviar EDI 270','Paso 3: Confirmar: cobertura activa, deducible, copago, red, limitaciones','Paso 4: Verificar si se requiere autorización previa para el servicio','Paso 5: Documentar la verificación con fecha, nombre del representante y número de referencia'] },
      { heading:'Tipos de Pagadores Gubernamentales', points:['Medicare Parte A: hospitalización — sin prima, deducible por período de beneficio','Medicare Parte B: ambulatorio — prima mensual, deducible anual, 80/20 coseguro','Medicare Parte C: planes privados que reemplazan A+B, varían por plan','Medicare Parte D: medicamentos recetados — prima variable, formulario de medicamentos','Medicaid: cobertura variable por estado, copagos mínimos o nulos'] },
    ]
  },

  { sort:8, section:'PAGADORES Y COBERTURA', type:'text', title:'Coordinación de Beneficios y Planes Secundarios',
    content:`<h2>Coordinación de Beneficios (COB) y Planes Secundarios</h2>
<h3>Definición de COB</h3>
<p>La Coordinación de Beneficios es el proceso para determinar el orden de pago cuando un paciente tiene más de un plan de seguro, para evitar pagos duplicados y garantizar que el total pagado no supere el costo real del servicio.</p>
<h3>Orden de Pago</h3>
<ul><li>El plan <strong>primario</strong> paga primero según sus términos normales</li>
<li>El plan <strong>secundario</strong> puede cubrir el saldo restante hasta un monto razonable</li>
<li>El paciente no debe recibir más del 100% del costo del servicio</li></ul>
<h3>Birthday Rule (Regla de Cumpleaños)</h3>
<ul><li>Aplica cuando un hijo tiene cobertura de los planes de ambos padres</li>
<li>El plan del padre/madre cuyo cumpleaños cae primero en el año calendario es el primario</li>
<li>Si ambos padres cumplen años el mismo día, el plan que lleva más tiempo activo es primario</li></ul>
<h3>COB en Divorcios y Situaciones Especiales</h3>
<ul><li>Con decreto de divorcio que especifica responsabilidad: ese padre es primario</li>
<li>Sin decreto específico: el plan del padre con custodia es primario</li>
<li>Si el padre con custodia se volvió a casar: el plan del padrastro/madrastra es secundario</li></ul>
<h3>Medicare como Pagador Secundario (MSP)</h3>
<ul><li>Si el empleador tiene 20+ empleados y el paciente está activo, el seguro del empleador es primario</li>
<li>En accidentes de trabajo: seguro de compensación laboral es primario</li>
<li>En accidentes automovilísticos: seguro de auto es primario</li></ul>
<h3>Subrogación</h3>
<ul><li>Derecho del asegurador de recuperar pagos de terceros responsables</li>
<li>Ejemplo: si el seguro médico pagó por una lesión causada en accidente de auto, puede reclamar a la aseguradora del auto responsable</li></ul>` },

  { sort:9, section:'PAGADORES Y COBERTURA', type:'text', title:'COBRA y Portabilidad del Seguro',
    content:`<h2>COBRA y Portabilidad del Seguro de Salud</h2>
<h3>COBRA — Consolidated Omnibus Budget Reconciliation Act</h3>
<ul><li>Permite continuar la cobertura del seguro de salud grupal después de ciertos eventos (pérdida de empleo, reducción de horas, divorcio, etc.)</li>
<li><strong>Duración:</strong> hasta 18 meses por pérdida de empleo/reducción de horas; hasta 36 meses por eventos calificados como muerte, divorcio o pérdida de estado de dependiente</li>
<li><strong>Costo:</strong> el beneficiario paga el 102% de la prima total (parte del empleado + parte del empleador + 2% administrativo)</li>
<li><strong>Notificaciones:</strong> el empleador tiene 30 días para notificar al administrador del plan; el administrador tiene 14 días para notificar al beneficiario; el beneficiario tiene 60 días para elegir la cobertura</li></ul>
<h3>HIPAA Portabilidad</h3>
<ul><li>Limita las exclusiones por condiciones preexistentes al cambiar de un plan grupal a otro</li>
<li>Garantiza elegibilidad para nuevo seguro grupal sin períodos de espera excesivos</li>
<li>El "certificado de cobertura previa" documenta el período de cobertura anterior</li></ul>
<h3>Mercado de Seguros ACA (Health Insurance Marketplace)</h3>
<ul><li>Creado por la Ley de Cuidado Asequible para individuos y pequeñas empresas</li>
<li><strong>Período de inscripción abierta:</strong> noviembre 1 - enero 15 (fechas pueden variar por estado)</li>
<li><strong>Período especial de inscripción:</strong> disparado por eventos calificados (matrimonio, nacimiento, pérdida de cobertura)</li>
<li>Subsidios (créditos tributarios) disponibles para ingresos entre 100-400% del nivel de pobreza federal</li>
<li>Planes clasificados en niveles: Bronce, Plata, Oro, Platino (por porcentaje de costo que cubre el plan)</li></ul>` },

  { sort:10, section:'PAGADORES Y COBERTURA', type:'quiz', title:'Quiz 2: Pagadores y Cobertura',
    quizKey:'q2' },

  // SECTION 3 — CICLO DE INGRESOS Y RECLAMACIONES
  { sort:11, section:'CICLO DE INGRESOS Y RECLAMACIONES', type:'text', title:'El Proceso de Reclamaciones: Del Servicio al Pago',
    content:`<h2>El Proceso de Reclamaciones: Del Servicio al Pago</h2>
<p>El ciclo de ingresos es el proceso completo desde que el paciente agenda una cita hasta que el proveedor recibe el pago total por los servicios prestados. Un ciclo eficiente maximiza el cobro y minimiza el tiempo en cuentas por cobrar (AR).</p>
<h3>Los 10 Pasos del Ciclo de Ingresos</h3>
<ul><li><strong>1. Registro del paciente:</strong> captura de información demográfica y del seguro</li>
<li><strong>2. Verificación de elegibilidad:</strong> confirmar cobertura activa y beneficios antes del servicio</li>
<li><strong>3. Autorización previa:</strong> obtener aprobación del pagador para servicios que la requieren</li>
<li><strong>4. Documentación clínica:</strong> el proveedor documenta el encuentro en el expediente</li>
<li><strong>5. Codificación:</strong> asignación de códigos ICD-10-CM y CPT/HCPCS al servicio</li>
<li><strong>6. Envío de reclamación:</strong> transmisión electrónica (EDI 837P o 837I) o en papel</li>
<li><strong>7. Adjudicación:</strong> el pagador procesa la reclamación y determina el monto a pagar</li>
<li><strong>8. ERA/EOB:</strong> recepción del aviso de pago electrónico (ERA/835) o explicación de beneficios (EOB)</li>
<li><strong>9. Seguimiento de AR:</strong> monitoreo de reclamaciones pendientes y denegadas</li>
<li><strong>10. Cobro al paciente:</strong> facturación del saldo no cubierto al paciente</li></ul>` },

  { sort:12, section:'CICLO DE INGRESOS Y RECLAMACIONES', type:'presentation', title:'Envío y Procesamiento de Reclamaciones',
    pptxKey:'reclamaciones', pptxTitle:'Envío y Procesamiento de Reclamaciones', pptxSub:'Formularios, EDI y respuestas del pagador',
    pptxBullets:[
      { heading:'Formularios de Reclamación', points:['CMS-1500: para proveedores profesionales (médicos, clínicas, laboratorios)','UB-04 (CMS-1450): para hospitales, centros ambulatorios y hospicios','CMS-1500 clave: campo 21 (ICD-10), campo 24 (CPT/modificadores/dx), campo 33 (NPI proveedor)','UB-04 clave: campo FL 67 (diagnóstico principal), FL 42-49 (servicios y cargos)'] },
      { heading:'Transmisión Electrónica EDI', points:['837P: reclamación profesional electrónica (reemplaza CMS-1500)','837I: reclamación institucional electrónica (reemplaza UB-04)','270/271: consulta y respuesta de elegibilidad/beneficios','835: aviso de pago electrónico (ERA — Electronic Remittance Advice)','834: transmisión de inscripción/baja de beneficiarios'] },
      { heading:'Tipos de Respuesta del Pagador', points:['Aprobada (paid): procesada y pagada — publicar el pago y ajustar','Rechazada (rejected): error técnico — corregir y reenviar sin apelación','Denegada (denied): procesada pero no pagada — requiere apelación formal','Pago pendiente (pended): en revisión médica — hacer seguimiento activo'] },
    ]
  },

  { sort:13, section:'CICLO DE INGRESOS Y RECLAMACIONES', type:'text', title:'Gestión de Cuentas por Cobrar (AR)',
    content:`<h2>Gestión de Cuentas por Cobrar (AR Management)</h2>
<h3>El Aging Report</h3>
<p>El reporte de antigüedad de cuentas por cobrar organiza las reclamaciones pendientes por período de tiempo desde la fecha de servicio:</p>
<ul><li><strong>0-30 días:</strong> reclamaciones recientes, generalmente en proceso normal</li>
<li><strong>31-60 días:</strong> requieren revisión para detectar posibles problemas</li>
<li><strong>61-90 días:</strong> acción de seguimiento activo necesaria</li>
<li><strong>91-120 días:</strong> alto riesgo de no cobro; requiere intervención urgente</li>
<li><strong>120+ días:</strong> candidatas a write-off o agencia de cobro</li></ul>
<h3>Métricas Clave de AR</h3>
<ul><li><strong>Días en AR:</strong> promedio de días para cobrar una reclamación (meta: menos de 40 días)</li>
<li><strong>Tasa de cobro neto:</strong> porcentaje de lo cobrable que realmente se cobra (meta: mayor 95%)</li>
<li><strong>Tasa de denegación:</strong> porcentaje de reclamaciones denegadas (meta: menos de 5%)</li>
<li><strong>Tasa de rechazo inicial:</strong> reclamaciones devueltas sin procesar por error técnico</li></ul>
<h3>Estrategias para Reducir AR</h3>
<ul><li>Verificación de elegibilidad rigurosa antes de cada servicio</li>
<li>Codificación precisa y documentación clínica completa</li>
<li>Envío oportuno de reclamaciones (timely filing)</li>
<li>Seguimiento sistemático del aging report cada semana</li>
<li>Proceso claro de apelación para reclamaciones denegadas</li></ul>
<h3>Proceso de Apelación</h3>
<ul><li><strong>Nivel 1:</strong> apelación interna al pagador con documentación adicional</li>
<li><strong>Nivel 2:</strong> segunda apelación o revisión por pares (peer-to-peer)</li>
<li><strong>Nivel 3:</strong> apelación externa o revisión independiente</li>
<li><strong>Nivel 4:</strong> revisión por la junta estatal de seguros o litigio</li></ul>` },

  { sort:14, section:'CICLO DE INGRESOS Y RECLAMACIONES', type:'text', title:'Reclamaciones Rechazadas vs. Denegadas: Gestión y Apelaciones',
    content:`<h2>Gestión de Reclamaciones Rechazadas vs. Denegadas</h2>
<h3>Reclamaciones Rechazadas (Rejected)</h3>
<ul><li>La reclamación <strong>no fue procesada</strong> por el pagador debido a un error técnico o de datos</li>
<li>No hay adjudicación — el pagador no tomó una decisión de pago</li>
<li>Se puede corregir y reenviar sin necesidad de apelación formal</li></ul>
<h3>Razones Comunes de Rechazo</h3>
<ul><li>Número de miembro o ID de grupo incorrecto o faltante</li>
<li>Fecha de nacimiento del paciente no coincide con los registros del pagador</li>
<li>NPI del proveedor faltante, inválido o no inscrito con el pagador</li>
<li>Código de diagnóstico no relacionado o incompatible con el procedimiento</li>
<li>Errores de formato en la transmisión electrónica (EDI)</li></ul>
<h3>Reclamaciones Denegadas (Denied)</h3>
<ul><li>La reclamación <strong>fue procesada</strong> pero el pagador decidió no pagar</li>
<li>Hay adjudicación — se requiere proceso de apelación para revertir</li></ul>
<h3>Razones Comunes de Denegación</h3>
<ul><li>Servicio no cubierto por el plan del paciente</li>
<li>Servicio no es médicamente necesario según los criterios del pagador</li>
<li>Falta de autorización previa o autorización insuficiente</li>
<li>Período de presentación vencido (timely filing limit)</li>
<li>Reclamación duplicada — ya procesada previamente</li>
<li>Proveedor fuera de red — sin excepción aplicable</li></ul>
<h3>Timely Filing</h3>
<ul><li>Plazo del pagador para aceptar reclamaciones desde la fecha de servicio</li>
<li>Medicare: 12 meses desde la fecha de servicio</li>
<li>Pagadores comerciales: varía (90 días a 2 años, típicamente 90-180 días)</li>
<li>Vencimiento del timely filing = causa de denegación que generalmente no es apelable</li></ul>
<h3>Peer-to-Peer Review</h3>
<ul><li>El médico tratante habla directamente con el médico revisor del pagador</li>
<li>Efectivo para denegaciones por criterios de necesidad médica</li>
<li>Debe solicitarse dentro del plazo establecido por el pagador</li></ul>` },

  { sort:15, section:'CICLO DE INGRESOS Y RECLAMACIONES', type:'quiz', title:'Quiz 3: Ciclo de Ingresos y Reclamaciones',
    quizKey:'q3' },

  // SECTION 4 — SISTEMAS DE REEMBOLSO
  { sort:16, section:'SISTEMAS DE REEMBOLSO', type:'text', title:'Métodos de Reembolso en Medicare',
    content:`<h2>Métodos de Reembolso en Medicare</h2>
<h3>Fee-for-Service (FFS) — Pago por Servicio</h3>
<ul><li>Pago por cada servicio individual prestado</li>
<li>Base del sistema tradicional de Medicare</li>
<li>Los pagadores definen "tarifas aprobadas" o "montos permitidos"</li></ul>
<h3>MPFS — Medicare Physician Fee Schedule</h3>
<ul><li>Define la tarifa que Medicare paga por cada código CPT</li>
<li>Se calcula con base en Unidades de Valor Relativo (RVU):</li>
<li><strong>Trabajo RVU:</strong> tiempo, esfuerzo, habilidad y juicio clínico del médico</li>
<li><strong>Práctica RVU:</strong> gastos de overhead (renta, personal, suministros)</li>
<li><strong>Malpractice RVU:</strong> costo del seguro de responsabilidad profesional</li>
<li>Tarifa = (RVU trabajo × GPCI trabajo + RVU práctica × GPCI práctica + RVU malpractice × GPCI malpractice) × Factor de conversión</li>
<li><strong>GPCI:</strong> Geographic Practice Cost Index — ajusta por costo de vida local</li></ul>
<h3>Sistemas de Pago Prospectivo (PPS)</h3>
<ul><li><strong>DRG (Diagnosis-Related Groups):</strong> pago fijo por ingreso hospitalario basado en diagnóstico principal; hospitalario agudo</li>
<li><strong>APC (Ambulatory Payment Classifications):</strong> sistema similar a DRG para servicios ambulatorios hospitalarios</li>
<li><strong>PDPM (Patient Driven Payment Model):</strong> sistema de reembolso para enfermería especializada (SNF), basado en características del paciente</li>
<li><strong>HH PPS:</strong> pago por episodio de cuidado en hogar (home health)</li></ul>` },

  { sort:17, section:'SISTEMAS DE REEMBOLSO', type:'presentation', title:'Metodologías de Reembolso',
    pptxKey:'reembolso', pptxTitle:'Metodologías de Reembolso', pptxSub:'FFS, DRG, APC y pago por valor',
    pptxBullets:[
      { heading:'Fee-for-Service vs. Pago por Valor (FFS vs. VBP)', points:['FFS: pago por cada servicio individual — incentiva volumen, no calidad','VBP (Value-Based Purchasing): pago atado a calidad y resultados — incentiva eficiencia','Medicare MIPS: programa de incentivos que ajusta pagos FFS según calidad reportada','APMs: modelos de pago alternativos (ACO, bundled payments, PCMH)'] },
      { heading:'DRG — Grupos Relacionados por Diagnóstico', points:['Sistema de pago prospectivo para hospitales de cuidado agudo','Pago fijo determinado por el diagnóstico principal al alta (MS-DRG)','No importa cuánto cueste tratar al paciente — el hospital recibe el monto DRG','Incentiva eficiencia: hospitales ahorran si tratan al paciente por menos del DRG','Pérdida si el costo de tratamiento supera el monto DRG asignado'] },
      { heading:'APC — Clasificaciones de Pacientes Ambulatorios', points:['Sistema PPS para servicios ambulatorios hospitalarios (outpatient)','Funciona similar a DRG pero para servicios ambulatorios del hospital','Grupos de servicios clínicamente similares con costo parecido','Un encuentro puede generar múltiples APCs según los servicios prestados','Administrado por CMS; actualizado anualmente en el OPPS (Outpatient PPS)'] },
    ]
  },

  { sort:18, section:'SISTEMAS DE REEMBOLSO', type:'text', title:'Planes de Valor y Modelos de Pago Alternativos',
    content:`<h2>Planes de Valor y Modelos de Pago Alternativos (APMs)</h2>
<h3>Pago por Valor (Value-Based Purchasing, VBP)</h3>
<ul><li>Vincula el reembolso a la calidad de la atención y los resultados del paciente</li>
<li>Medicare aplica ajustes de pago (positivos o negativos) según métricas de calidad</li>
<li>Hospitales pueden recibir bonificaciones por alta calidad o penalizaciones por baja calidad</li></ul>
<h3>ACO — Organizaciones de Cuidado Responsable</h3>
<ul><li>Grupos de médicos, hospitales y otros proveedores que se coordinan para atender a una población de pacientes Medicare</li>
<li>Si reducen costos y mantienen calidad, comparten los ahorros con Medicare</li>
<li>Si los costos superan el umbral, pueden compartir las pérdidas (modelos de riesgo)</li></ul>
<h3>Bundled Payments (Pagos Empaquetados)</h3>
<ul><li>Un pago único cubre todos los servicios para un episodio completo de cuidado (ej. reemplazo de rodilla: cirugía + rehabilitación + seguimiento)</li>
<li>Los proveedores comparten el pago y la responsabilidad por calidad y costo</li>
<li>Incentiva coordinación y eficiencia entre proveedores</li></ul>
<h3>PCMH — Patient-Centered Medical Home</h3>
<ul><li>Modelo de atención donde el PCP coordina toda la atención del paciente</li>
<li>Énfasis en prevención, manejo de enfermedades crónicas y acceso</li>
<li>Pagadores ofrecen pagos adicionales por atributos del PCMH</li></ul>
<h3>MIPS y APMs en Medicare</h3>
<ul><li><strong>MIPS (Merit-based Incentive Payment System):</strong> ajusta pagos FFS según calidad, mejora, uso de EHR y costo</li>
<li><strong>APMs avanzados:</strong> modelos alternativos que eximen de MIPS a cambio de mayor riesgo y recompensa</li></ul>` },

  { sort:19, section:'SISTEMAS DE REEMBOLSO', type:'text', title:'Ajuste de Pago, Contratos y Fee Schedules',
    content:`<h2>Ajuste de Pago, Contratos y Fee Schedules</h2>
<h3>Tarifas Contratadas vs. Montos Permitidos</h3>
<ul><li><strong>Tarifa estándar (chargemaster):</strong> precio lista del hospital para cada servicio — generalmente más alto que lo que se cobra</li>
<li><strong>Monto contratado/permitido:</strong> tarifa negociada entre el proveedor y el pagador — lo que realmente se cobra</li>
<li><strong>Write-off (ajuste contractual):</strong> diferencia entre la tarifa estándar y el monto permitido — se escribe como ajuste, no como pérdida</li></ul>
<h3>Balance Billing</h3>
<ul><li>Cobrar al paciente la diferencia entre la tarifa del proveedor y el monto que paga el seguro</li>
<li><strong>Proveedor participante en Medicare:</strong> acepta la tarifa Medicare como pago completo — NO puede hacer balance billing</li>
<li><strong>Proveedor no participante en Medicare:</strong> puede cobrar hasta el 115% de la tarifa Medicare no participante al paciente</li>
<li><strong>Proveedor excluido (opt-out):</strong> establece contratos privados con pacientes Medicare fuera del sistema</li></ul>
<h3>Participation vs. Non-Participation en Medicare</h3>
<ul><li><strong>Participating (PAR):</strong> acepta asignación de Medicare siempre; tarifa 100% de MPFS; Medicare paga 80%, paciente 20%</li>
<li><strong>Non-Participating (Non-PAR):</strong> puede elegir servicio por servicio; tarifa 95% de MPFS; mayor costo para el paciente</li></ul>
<h3>Charge Master</h3>
<ul><li>Lista de precios estándar del hospital para todos los servicios y procedimientos</li>
<li>Punto de partida para la facturación; raramente es lo que se cobra realmente</li>
<li>Revisado y actualizado al menos anualmente</li></ul>
<h3>Contratos con Pagadores</h3>
<ul><li>Definen las tarifas contratadas, los términos de pago y las obligaciones mutuas</li>
<li>Los proveedores deben revisar y negociar contratos para maximizar el reembolso</li>
<li>La credencialización del proveedor es requisito previo para contratar con pagadores</li></ul>` },

  { sort:20, section:'SISTEMAS DE REEMBOLSO', type:'quiz', title:'Quiz 4: Sistemas de Reembolso',
    quizKey:'q4' },

  // SECTION 5 — CUMPLIMIENTO EN SEGUROS MÉDICOS
  { sort:21, section:'CUMPLIMIENTO EN SEGUROS MÉDICOS', type:'text', title:'Cumplimiento y Fraude en Seguros Médicos',
    content:`<h2>Cumplimiento y Fraude en Seguros Médicos</h2>
<h3>Fraude vs. Abuso</h3>
<ul><li><strong>Fraude:</strong> acto intencional de engaño para obtener beneficios no autorizados (ej. facturar servicios no prestados, falsificar diagnósticos para justificar servicios innecesarios)</li>
<li><strong>Abuso:</strong> prácticas que resultan en pagos incorrectos pero sin intención fraudulenta clara (ej. facturar sin justificación suficiente, cobrar tarifas inconsistentes)</li></ul>
<h3>Tipos Comunes de Fraude en Seguros</h3>
<ul><li>Facturar servicios no prestados</li>
<li>Upcoding: usar código de mayor nivel o complejidad del real</li>
<li>Unbundling: separar servicios que deben facturarse juntos</li>
<li>Phantom billing: facturar por pacientes que no existen</li>
<li>Identity theft: usar información de pacientes para facturar</li></ul>
<h3>Exclusiones de Medicare/Medicaid</h3>
<ul><li>OIG puede excluir a proveedores de participar en programas federales</li>
<li>Exclusiones obligatorias: condenas por fraude en programas de salud, abuso de pacientes</li>
<li>Exclusiones permisivas: por otras ofensas relacionadas con la práctica médica</li>
<li>Los proveedores excluidos NO pueden recibir reembolso federal, ni directa ni indirectamente</li></ul>
<h3>False Claims Act (Ley de Reclamaciones Falsas)</h3>
<ul><li>Ley federal que prohíbe presentar reclamaciones falsas o fraudulentas al gobierno</li>
<li>Sanciones: $13,946–$27,894 por reclamación falsa + 3 veces el monto defraudado</li>
<li><strong>Qui Tam (whistleblower):</strong> ciudadanos privados pueden demandar en nombre del gobierno y recibir 15-30% de la recuperación</li></ul>
<h3>Programa RAC (Recovery Audit Contractor)</h3>
<ul><li>Contratistas de Medicare que identifican pagos incorrectos (de más o de menos)</li>
<li>Reciben un porcentaje de los pagos recuperados</li>
<li>Pueden revisar reclamaciones hasta 3 años después del pago</li></ul>` },

  { sort:22, section:'CUMPLIMIENTO EN SEGUROS MÉDICOS', type:'presentation', title:'Cumplimiento en Seguros y Protección al Paciente',
    pptxKey:'cumplimiento', pptxTitle:'Cumplimiento en Seguros y Protección al Paciente', pptxSub:'ACA, No Surprises Act e integridad de Medicare',
    pptxBullets:[
      { heading:'Ley de Cuidado Asequible ACA — Protecciones al Consumidor', points:['No exclusión por condiciones preexistentes en mercado individual (desde 2014)','Cobertura obligatoria para dependientes hasta los 26 años en plan de padres','Eliminación de límites vitalicios y anuales para beneficios esenciales','Cobertura de servicios preventivos esenciales sin costo al paciente','Prohibición de cancelar cobertura por error de buena fe en solicitud'] },
      { heading:'No Surprises Act (Ley Sin Sorpresas, 2022)', points:['Protege a pacientes de facturas inesperadas de proveedores fuera de red en emergencias','En instalaciones en red: servicios de anestesia, radiología, hospitalistas fuera de red no pueden hacer balance billing sin consentimiento','Estimados de buena fe: proveedores deben dar estimado de costos antes de servicios programados','Arbitraje independiente para disputas entre proveedor y pagador sobre el monto correcto'] },
      { heading:'Programa de Integridad de Medicare', points:['ZPIC (Zone Program Integrity Contractor): investiga fraude activo y abuso','RAC (Recovery Audit Contractor): identifica pagos incorrectos retroactivamente','CERT (Comprehensive Error Rate Testing): mide tasa de error de pago de Medicare','MAC (Medicare Administrative Contractor): procesa reclamaciones y hace educación al proveedor'] },
    ]
  },

  { sort:23, section:'CUMPLIMIENTO EN SEGUROS MÉDICOS', type:'text', title:'Derechos del Paciente en el Sistema de Seguros',
    content:`<h2>Derechos del Paciente en el Sistema de Seguros de Salud</h2>
<h3>Derecho a Apelación</h3>
<ul><li>Todo paciente tiene derecho a apelar una decisión de denegación de cobertura o servicio</li>
<li>Los pagadores deben proporcionar instrucciones claras sobre el proceso de apelación</li>
<li>Niveles: apelación interna → revisión externa independiente (IRO)</li></ul>
<h3>Revisión Externa Independiente (IRO)</h3>
<ul><li>Revisión de denegaciones médicas por una organización independiente del pagador</li>
<li>Disponible tras agotar apelaciones internas</li>
<li>La decisión del IRO es generalmente vinculante para el pagador</li></ul>
<h3>Continuidad de Cuidado</h3>
<ul><li>Si el proveedor sale de la red, el paciente puede tener derecho a continuar con ese proveedor temporalmente</li>
<li>Especialmente importante para embarazos, tratamientos en curso y condiciones crónicas</li></ul>
<h3>Acceso a Directorio de Proveedores</h3>
<ul><li>Los pagadores deben mantener directorios de proveedores actualizados</li>
<li>La No Surprises Act reforzó los requisitos de precisión del directorio</li>
<li>Si el paciente recibe información incorrecta del directorio y ve a un proveedor fuera de red, el pagador puede deber protección</li></ul>
<h3>No Surprises Act — Protecciones Clave</h3>
<ul><li>Protección en emergencias: proveedores fuera de red en emergencias deben cobrar como proveedores en red</li>
<li>Estimados de buena fe: para servicios no urgentes programados, estimado de costo por adelantado</li>
<li>Proceso de resolución de disputas para pacientes que reciben facturas sorpresa</li></ul>
<h3>Medicaid Fair Hearings</h3>
<ul><li>Derecho a una audiencia imparcial ante un juez de audiencias si Medicaid niega, reduce o termina beneficios</li>
<li>El paciente puede continuar recibiendo servicios durante la apelación (si la solicitud se hace a tiempo)</li>
<li>Decisiones del juez son vinculantes para el programa Medicaid estatal</li></ul>` },

  { sort:24, section:'CUMPLIMIENTO EN SEGUROS MÉDICOS', type:'quiz', title:'Quiz 5: Cumplimiento en Seguros',
    quizKey:'q5' },

  // SECTION 6 — PREPARACIÓN PARA EL EXAMEN MIR
  { sort:25, section:'PREPARACIÓN PARA EL EXAMEN MIR', type:'text', title:'Guía de Estudio para el Examen MIR',
    content:`<h2>Guía de Estudio: Examen MIR de NHA</h2>
<h3>Estructura del Examen MIR</h3>
<ul><li>100 preguntas en total (con puntaje)</li>
<li>Tiempo: 2.5 horas</li>
<li>Formato: opción múltiple</li>
<li>Puntaje mínimo aprobatorio: 390/500</li></ul>
<h3>Dominios del Examen MIR</h3>
<ul><li><strong>Tipos y terminología de seguros (30%):</strong> HMO, PPO, EPO, POS, HDHP, Medicare partes, Medicaid, CHIP, TRICARE, COBRA, términos clave</li>
<li><strong>Ciclo de ingresos (28%):</strong> proceso de reclamaciones, verificación, autorización, codificación, envío, adjudicación, AR, apelaciones</li>
<li><strong>Reembolso y procesamiento (25%):</strong> DRG, APC, RVU, MPFS, VBP, contratos, chargemaster, balance billing</li>
<li><strong>Cumplimiento (17%):</strong> HIPAA, fraude, False Claims Act, ACA, No Surprises Act, RAC, derechos del paciente</li></ul>
<h3>Estrategias de Estudio</h3>
<ul><li>Memorice las diferencias entre HMO, PPO, EPO y POS</li>
<li>Comprenda las 4 partes de Medicare y lo que cubre cada una</li>
<li>Domine el proceso completo del ciclo de ingresos en 10 pasos</li>
<li>Distinga entre reclamación rechazada (error técnico) y denegada (decisión de pago)</li>
<li>Entienda la Birthday Rule para COB</li>
<li>Repase las transacciones EDI: 270/271, 837P/837I, 835</li></ul>
<h3>El Día del Examen</h3>
<ul><li>Llegue 30 minutos antes al centro de pruebas</li>
<li>Traiga identificación con foto vigente</li>
<li>Lea cada pregunta completamente antes de seleccionar su respuesta</li>
<li>Administre el tiempo: aproximadamente 1.5 minutos por pregunta</li></ul>` },

  { sort:26, section:'PREPARACIÓN PARA EL EXAMEN MIR', type:'presentation', title:'Estrategia para el Examen MIR',
    pptxKey:'exam-prep', pptxTitle:'Estrategia para el Examen MIR', pptxSub:'Dominios, conceptos clave y plan de estudio',
    pptxBullets:[
      { heading:'Dominios del Examen MIR por Peso', points:['Tipos de seguros y terminología 30% — mayor peso, estudiar primero','Ciclo de ingresos 28% — proceso de reclamaciones completo','Reembolso y procesamiento 25% — DRG, APC, RVU, contratos','Cumplimiento 17% — fraude, ACA, No Surprises Act, derechos'] },
      { heading:'Conceptos Más Evaluados', points:['COB y Birthday Rule — plan primario vs. secundario','Transacciones EDI: 270/271 (elegibilidad), 837P/I (reclamación), 835 (pago)','Medicare Partes A, B, C, D — cobertura y diferencias clave','DRG (hospitalario) vs. APC (ambulatorio hospitalario)','Timely filing — plazos y consecuencias de vencimiento'] },
      { heading:'Plan de Estudio 2 Semanas', points:['Semana 1, días 1-3: Tipos de planes + Medicare + Medicaid + COBRA','Semana 1, días 4-7: Verificación + COB + Autorización previa','Semana 2, días 1-3: Ciclo de ingresos + reclamaciones + AR','Semana 2, días 4-5: Reembolso DRG/APC/RVU + contratos','Semana 2, días 6-7: Cumplimiento + exámenes de práctica completos'] },
    ]
  },

  { sort:27, section:'PREPARACIÓN PARA EL EXAMEN MIR', type:'quiz', title:'Evaluación Final: Examen de Práctica MIR',
    quizKey:'final' },
];

const quizzes = {
  q1: [
    { q:'¿Cuál plan de seguro requiere que el paciente tenga un médico de cabecera (PCP) y obtenga referencias para ver especialistas?', options:['PPO','HMO','EPO','HDHP'], answer:1 },
    { q:'Medicare Parte B cubre principalmente:', options:['Hospitalización','Medicamentos recetados','Servicios médicos ambulatorios y preventivos','Atención en hogares de ancianos'], answer:2 },
    { q:'¿Qué término describe el monto anual que el paciente paga antes de que el seguro comience a cubrir los gastos?', options:['Copago','Prima','Deducible','Coseguro'], answer:2 },
    { q:'COBRA permite que un empleado mantenga su seguro de salud grupal después de perder el empleo por hasta:', options:['6 meses','12 meses','18 meses','36 meses dependiendo del motivo'], answer:3 },
    { q:'¿Cuál programa de salud federal cubre principalmente a personas de bajos ingresos y es co-administrado por estados?', options:['Medicare','TRICARE','Medicaid','CHIP'], answer:2 },
  ],
  q2: [
    { q:'La "regla de cumpleaños" (Birthday Rule) en coordinación de beneficios determina:', options:['Cuándo vence el seguro','Qué plan es primario cuando el hijo tiene cobertura de ambos padres (el padre que cumple años primero)','Cuándo el paciente puede cambiar de plan','La fecha de inicio de cobertura'], answer:1 },
    { q:'La transacción EDI 270/271 se utiliza para:', options:['Enviar reclamaciones electrónicas','Verificar elegibilidad y cobertura del beneficiario','Transmitir el pago electrónico al proveedor','Solicitar autorización previa'], answer:1 },
    { q:'¿Qué es la autorización previa en seguros médicos?', options:['Un descuento por pago anticipado','La aprobación del pagador antes de prestar un servicio','El formulario de consentimiento del paciente','Una auditoría retroactiva de reclamaciones'], answer:1 },
    { q:'¿Cuáles son las cuatro partes de Medicare?', options:['A, B, C, D','1, 2, 3, 4','I, II, III, IV','Alpha, Beta, Gamma, Delta'], answer:0 },
    { q:'¿Qué protección ofrece la Ley HIPAA de portabilidad?', options:['Garantiza el mismo costo del seguro siempre','Limita las exclusiones por condiciones preexistentes al cambiar de seguro grupal','Elimina todos los deducibles','Garantiza cobertura de medicamentos'], answer:1 },
  ],
  q3: [
    { q:'¿Cuál es la transacción EDI que envía una reclamación profesional electrónica?', options:['835','270','837P','834'], answer:2 },
    { q:'En gestión de AR, el "aging report" muestra:', options:['Los diagnósticos más frecuentes','Las reclamaciones pendientes organizadas por antigüedad de deuda','Los pagos recibidos del mes','Los proveedores más productivos'], answer:1 },
    { q:'¿Cuál es la diferencia entre una reclamación RECHAZADA y una DENEGADA?', options:['No hay diferencia','Rechazada: error técnico, se puede corregir y reenviar; Denegada: procesada pero no pagada, requiere apelación','Denegada es más fácil de corregir','Rechazada requiere siempre apelación formal'], answer:1 },
    { q:'El "timely filing" se refiere a:', options:['El plazo para pagar al proveedor','El plazo del pagador para presentar reclamaciones desde la fecha de servicio','La fecha límite para inscribirse en el seguro','El tiempo de procesamiento del ERA'], answer:1 },
    { q:'Un EOB (Explanation of Benefits) es enviado por:', options:['El hospital al médico','El médico al paciente','El pagador al proveedor/paciente para explicar el procesamiento de la reclamación','El gobierno al hospital'], answer:2 },
  ],
  q4: [
    { q:'Los RVU (Relative Value Units) en el Medicare Physician Fee Schedule tienen tres componentes:', options:['Procedimiento, diagnóstico y facturación','Trabajo médico, gastos de práctica y malpractice','Tiempo, complejidad e intensidad','Diagnóstico, tratamiento y seguimiento'], answer:1 },
    { q:'¿Qué sistema de pago prospectivo usa Medicare para hospitales basado en el diagnóstico principal?', options:['APC','MPFS','DRG','PDPM'], answer:2 },
    { q:'El "balance billing" en Medicare Asignado (Participating) significa que el proveedor:', options:['Puede cobrar cualquier monto al paciente','No puede cobrar al paciente más allá del monto asignado por Medicare','Solo cobra al seguro','Puede cobrar el 115% de la tarifa de Medicare'], answer:1 },
    { q:'Una ACO (Organización de Cuidado Responsable) es un modelo de:', options:['Seguro privado premium','Grupo de proveedores que asume responsabilidad por calidad y costo de atención','Hospital de especialidades','Plan de pago a plazos para pacientes'], answer:1 },
    { q:'¿Qué son los "bundled payments" (pagos empaquetados)?', options:['Pagos mensuales de seguros','Un pago único que cubre todos los servicios para un episodio de cuidado','Pagos combinados de Medicare y Medicaid','Descuentos por volumen a hospitales'], answer:1 },
  ],
  q5: [
    { q:'La Ley "No Surprises Act" protege a los pacientes de:', options:['Aumentos en las primas anuales','Facturas inesperadas de proveedores fuera de red en emergencias y servicios en instalaciones de red','Cambios en la política de deducibles','Negación de cobertura por condiciones preexistentes'], answer:1 },
    { q:'¿Qué es un "qui tam" lawsuit bajo la False Claims Act?', options:['Una demanda del gobierno contra un hospital','Una demanda presentada por un denunciante (whistleblower) en nombre del gobierno','Una auditoría rutinaria de Medicare','Una apelación de reclamación denegada'], answer:1 },
    { q:'La Ley de Cuidado Asequible (ACA) eliminó:', options:['Los deducibles en todos los planes','La exclusión por condiciones preexistentes en el mercado individual','Los copagos en servicios preventivos','Las primas para familias de bajos ingresos'], answer:1 },
    { q:'¿Qué auditor de Medicare identifica pagos incorrectos a través de revisión estadística de muestras?', options:['RAC','ZPIC','CERT','MAC'], answer:2 },
    { q:'En un "Medicaid Fair Hearing", el paciente tiene derecho a:', options:['Cambiar de médico inmediatamente','Apelar formalmente una decisión de Medicaid ante un juez de audiencias','Obtener cobertura automática de servicios denegados','Transferir beneficios a otro estado inmediatamente'], answer:1 },
  ],
  final: [
    { q:'¿Qué tipo de plan de seguro NO requiere referencias para visitar especialistas pero limita cobertura a proveedores en red?', options:['HMO','PPO','EPO','POS'], answer:2 },
    { q:'Medicare Parte D cubre:', options:['Hospitalización','Servicios médicos ambulatorios','Medicamentos recetados','Servicios de enfermería especializada'], answer:2 },
    { q:'La transacción EDI 835 representa:', options:['Una reclamación profesional','Una consulta de elegibilidad','Un aviso de pago electrónico (ERA)','Una solicitud de autorización previa'], answer:2 },
    { q:'¿Cuál es el período máximo de cobertura COBRA para la mayoría de los beneficiarios?', options:['6 meses','12 meses','18 meses','36 meses'], answer:2 },
    { q:'Los DRG (Grupos Relacionados por Diagnóstico) se usan para pagar:', options:['Médicos en consulta ambulatoria','Hospitales por ingresos hospitalarios','Laboratorios clínicos','Servicios de ambulancia'], answer:1 },
    { q:'La "Birthday Rule" determina el plan primario cuando:', options:['El paciente tiene dos seguros propios','El hijo tiene cobertura de ambos padres — el plan del padre que nació primero en el año es primario','El seguro vence y hay un período de gracia','Hay un cambio de empleo durante el año'], answer:1 },
    { q:'Un proveedor "participating" en Medicare asignado acepta:', options:['Cobrar cualquier tarifa al paciente','La tarifa aprobada de Medicare como pago completo, sin balance billing','Solo atender pacientes de Medicare Advantage','No cobrar copagos'], answer:1 },
    { q:'¿Cuál es el peso del dominio "Ciclo de Ingresos" en el examen MIR?', options:['17%','25%','28%','30%'], answer:2 },
    { q:'El APC (Ambulatory Payment Classification) se usa para reembolsar:', options:['Médicos individuales','Hospitales por ingresos','Servicios ambulatorios hospitalarios','Hogares de cuidado especializado'], answer:2 },
    { q:'La No Surprises Act requiere que los proveedores fuera de red en emergencias:', options:['Cobren su tarifa normal al paciente','Limiten el cargo al paciente al monto en red del plan','Obtengan consentimiento anticipado siempre','Rechacen pacientes fuera de red'], answer:1 },
    { q:'¿Qué es la subrogación en seguros médicos?', options:['Un tipo de reclamación','El derecho del asegurador a recuperar pagos de terceros responsables','Un plan de pago para el paciente','Un descuento por pago rápido'], answer:1 },
    { q:'CHIP (Children\'s Health Insurance Program) proporciona cobertura a:', options:['Adultos de bajos ingresos','Niños sin seguro de familias con ingresos demasiado altos para Medicaid pero que no pueden pagar seguro privado','Solo niños con discapacidades','Todos los niños independientemente del ingreso familiar'], answer:1 },
    { q:'En el contexto de AR management, una tasa de denegación ideal es:', options:['Menos del 5%','Entre 5-10%','Entre 10-15%','Menos del 20%'], answer:0 },
    { q:'¿Qué protección ACA garantiza cobertura para hijos en el plan de padres hasta cierta edad?', options:['21 años','24 años','26 años','28 años'], answer:2 },
    { q:'Un ACO (Accountable Care Organization) tiene como objetivo principal:', options:['Aumentar el número de procedimientos','Mejorar calidad y reducir costos siendo responsable por la atención de una población','Solo atender pacientes de Medicare','Reemplazar los seguros privados'], answer:1 },
    { q:'¿Qué hace un "charge master" en un hospital?', options:['Lista de precios estándar del hospital para todos los servicios y procedimientos','Un software de facturación','El registro del paciente','El directorio de proveedores en red'], answer:0 },
    { q:'La verificación de elegibilidad debe realizarse:', options:['Solo cuando el paciente no trae su tarjeta de seguro','Al menos antes de cada visita para confirmar cobertura activa','Solo una vez al año','Solo para pacientes nuevos'], answer:1 },
    { q:'¿Qué es un HSA (Health Savings Account)?', options:['Un plan de seguro de bajo costo','Una cuenta de ahorro con ventajas fiscales para gastos médicos, compatible con planes HDHP','Un beneficio solo para empleados federales','Un tipo de Medicare Advantage'], answer:1 },
    { q:'El proceso de "peer-to-peer review" en apelaciones de seguros involucra:', options:['Revisión por el departamento de cumplimiento','Una conversación directa entre el médico tratante y el médico revisor del pagador','Una auditoría aleatoria de reclamaciones','Una revisión por un panel de pacientes'], answer:1 },
    { q:'¿Cuántas preguntas con puntaje tiene el examen MIR de NHA?', options:['75','85','90','100'], answer:3 },
  ],
};

async function main() {
  const conn = await mysql.createConnection(DB);

  // Delete existing Spanish MIR course if re-running (idempotent)
  const [existing] = await conn.execute(
    `SELECT id FROM courses WHERE slug = 'seguro-medico-reembolso' LIMIT 1`
  );
  if (existing.length > 0) {
    const oldId = existing[0].id;
    const [oldLessons] = await conn.execute(`SELECT id FROM lessons WHERE course_id = ?`, [oldId]);
    for (const l of oldLessons) {
      await conn.execute(`DELETE FROM quiz_questions WHERE lesson_id = ?`, [l.id]);
    }
    await conn.execute(`DELETE FROM lessons WHERE course_id = ?`, [oldId]);
    await conn.execute(`DELETE FROM courses WHERE id = ?`, [oldId]);
    console.log(`Cleared existing Spanish MIR course (id=${oldId})`);
  }

  // Insert Spanish MIR course row
  const [courseResult] = await conn.execute(
    `INSERT INTO courses (title, slug, description, category, level, is_published, price, sort_order, lang, paired_course_id)
     VALUES (?, ?, ?, ?, ?, 1, 0.00, 10, 'es', ?)`,
    [
      'Seguro Médico y Reembolso (MIR)',
      'seguro-medico-reembolso',
      'Preparación completa para la certificación MIR: tipos de seguros, ciclo de ingresos, sistemas de reembolso y cumplimiento normativo.',
      'Medical Assistant',
      'beginner',
      EN_COURSE_ID,
    ]
  );
  const COURSE_ID = courseResult.insertId;
  console.log(`Created Spanish MIR course: id=${COURSE_ID}`);

  // Update English course to point back
  await conn.execute(`UPDATE courses SET paired_course_id = ? WHERE id = ?`, [COURSE_ID, EN_COURSE_ID]);
  console.log(`Linked English course ${EN_COURSE_ID} <-> Spanish course ${COURSE_ID}`);

  // Insert lessons
  for (const lesson of lessons) {
    let content = lesson.content || '';
    let filePath = null;

    if (lesson.type === 'presentation') {
      filePath = makePptx(lesson.pptxKey, lesson.pptxTitle, lesson.pptxSub, lesson.pptxBullets);
      content = '';
    } else if (lesson.type === 'quiz') {
      content = '';
    }

    const [result] = await conn.execute(
      `INSERT INTO lessons (course_id, title, type, content, file_path, sort_order, section_title, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [COURSE_ID, lesson.title, lesson.type, content, filePath, lesson.sort, lesson.section, slug(lesson.title)]
    );
    const lessonId = result.insertId;
    console.log(`  [${lesson.sort}] ${lesson.type}: ${lesson.title} (id=${lessonId})`);

    if (lesson.type === 'quiz') {
      const qs = quizzes[lesson.quizKey];
      for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        const type = (q.options.length === 2 && q.options.every(o => /^(true|false|verdadero|falso)$/i.test(o)))
          ? 'true_false' : 'multiple_choice';
        await conn.execute(
          `INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [lessonId, type, q.q, JSON.stringify(q.options), q.options[q.answer], i]
        );
      }
      console.log(`    -- ${qs.length} preguntas insertadas`);
    }
  }

  await conn.end();
  console.log(`\nCurso MIR en espanol completado -- ${lessons.length} lecciones.`);
}
main().catch(err => { console.error(err); process.exit(1); });
