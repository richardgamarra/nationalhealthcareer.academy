/**
 * populate-cbcs-course-es.js
 * Creates the Spanish version of Course 5 — Codificación y Facturación Médica (CBCS)
 * Pairs with English course ID 5.
 * Run from /var/www/nationalhealthcareer-com/
 */

const mysql  = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const fs = require('fs');
const path = require('path');

const DB = { host:'localhost', user:'admin_nhca', password:'2u95#I7jm', database:'nha_db' };
const UPLOADS = '/var/www/nationalhealthcareer-com/public/uploads';
const EN_COURSE_ID = 5;
const SLUG_SUFFIX = '-c5es';

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

  const filename = `${Date.now()}-cbcs-es-${key}.pptx`;
  const fullPath = path.join(UPLOADS, filename);
  pptx.writeFile({ fileName: fullPath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

const lessons = [
  // SECTION 1 — INTRODUCCIÓN A LA CODIFICACIÓN MÉDICA
  { sort:1, section:'INTRODUCCIÓN A LA CODIFICACIÓN MÉDICA', type:'text', title:'Bienvenido a Codificación y Facturación Médica',
    content:`<h2>Bienvenido al Curso CBCS</h2>
<p>La codificación médica es el proceso de traducir diagnósticos, procedimientos y servicios médicos en códigos alfanuméricos estandarizados. Estos códigos son la base del ciclo de facturación médica y permiten el reembolso de los servicios de salud.</p>
<h3>¿Por qué es importante la codificación médica?</h3>
<ul><li>Facilita el pago preciso de los servicios médicos</li>
<li>Garantiza el cumplimiento normativo</li>
<li>Apoya la investigación y estadísticas de salud</li>
<li>Reduce el fraude y el abuso en facturación</li></ul>
<h3>Sistemas de codificación principales</h3>
<ul><li><strong>ICD-10-CM:</strong> Clasificación Internacional de Enfermedades, 10ª Revisión, Modificación Clínica — para diagnósticos</li>
<li><strong>CPT (Terminología de Procedimientos Actuales):</strong> para procedimientos y servicios</li>
<li><strong>HCPCS Nivel II:</strong> para suministros, equipos y servicios no cubiertos por CPT</li></ul>
<h3>Certificación CBCS</h3>
<p>La certificación CBCS (Especialista en Codificación y Facturación) de la NHA valida su competencia en facturación médica, codificación y gestión del ciclo de ingresos. Este curso lo prepara completamente para el examen.</p>` },

  { sort:2, section:'INTRODUCCIÓN A LA CODIFICACIÓN MÉDICA', type:'presentation', title:'Introducción a la Codificación Médica',
    pptxKey:'intro', pptxTitle:'Introducción a la Codificación Médica', pptxSub:'Fundamentos del CBCS',
    pptxBullets:[
      { heading:'¿Qué es la Codificación Médica?', points:['Traducción de servicios médicos a códigos estandarizados','ICD-10-CM: diagnósticos y condiciones','CPT: procedimientos y servicios','HCPCS Nivel II: suministros y equipos'] },
      { heading:'El Ciclo de Facturación Médica', points:['1. Registro del paciente','2. Verificación de elegibilidad','3. Encuentro y documentación','4. Asignación de códigos','5. Envío de reclamaciones','6. Seguimiento y cobro'] },
      { heading:'Roles en el Equipo de Facturación', points:['Codificador médico','Especialista en facturación','Gerente de ciclo de ingresos','Coordinador de seguros'] },
    ]
  },

  { sort:3, section:'INTRODUCCIÓN A LA CODIFICACIÓN MÉDICA', type:'text', title:'El Sistema de Salud y el Reembolso',
    content:`<h2>El Sistema de Salud y el Reembolso</h2>
<p>Para codificar con precisión, es esencial comprender cómo funciona el sistema de salud estadounidense y cómo fluye el dinero entre proveedores y pagadores.</p>
<h3>Tipos de pagadores</h3>
<ul><li><strong>Medicare:</strong> programa federal para personas de 65 años o más y discapacitados</li>
<li><strong>Medicaid:</strong> programa estatal-federal para personas de bajos ingresos</li>
<li><strong>Seguros privados/comerciales:</strong> Blue Cross Blue Shield, Aetna, UnitedHealth, etc.</li>
<li><strong>Pago de bolsillo:</strong> pacientes sin seguro o con servicios no cubiertos</li></ul>
<h3>Tipos de planes de seguro</h3>
<ul><li><strong>HMO (Organización de Mantenimiento de Salud):</strong> requiere médico de cabecera y referencias</li>
<li><strong>PPO (Organización de Proveedores Preferidos):</strong> mayor flexibilidad, red más amplia</li>
<li><strong>EPO (Organización de Proveedores Exclusivos):</strong> solo proveedores en red, sin referencias</li>
<li><strong>HDHP (Plan de Alto Deducible):</strong> premios bajos, deducible alto, compatible con HSA</li></ul>
<h3>Términos financieros clave</h3>
<ul><li><strong>Prima:</strong> pago mensual por cobertura</li>
<li><strong>Deducible:</strong> monto que paga el paciente antes de que el seguro cubra</li>
<li><strong>Copago:</strong> tarifa fija por visita (p. ej., $25 por consulta)</li>
<li><strong>Coseguro:</strong> porcentaje compartido entre paciente y seguro (p. ej., 80/20)</li>
<li><strong>Límite de desembolso:</strong> máximo anual que paga el paciente</li></ul>` },

  { sort:4, section:'INTRODUCCIÓN A LA CODIFICACIÓN MÉDICA', type:'text', title:'Cumplimiento, Fraude y Abuso',
    content:`<h2>Cumplimiento, Fraude y Abuso en Facturación Médica</h2>
<p>El cumplimiento normativo es fundamental en la facturación médica. Las violaciones pueden resultar en sanciones civiles, penales y exclusión de programas de Medicare/Medicaid.</p>
<h3>Definiciones clave</h3>
<ul><li><strong>Fraude:</strong> acto intencional de engaño para obtener beneficios no autorizados (p. ej., facturar servicios no prestados)</li>
<li><strong>Abuso:</strong> prácticas inconsistentes con las normas de atención médica sólida o necesaria (p. ej., facturación excesiva)</li>
<li><strong>Upcoding:</strong> usar un código de mayor nivel de servicio del documentado</li>
<li><strong>Unbundling:</strong> facturar componentes de un procedimiento por separado en lugar del código integral</li></ul>
<h3>Leyes de cumplimiento principales</h3>
<ul><li><strong>Ley de Reclamaciones Falsas:</strong> prohíbe presentar reclamaciones fraudulentas al gobierno</li>
<li><strong>Ley Stark (Auto-referencia):</strong> prohíbe referencias médicas con interés financiero</li>
<li><strong>Ley Anti-soborno:</strong> prohíbe pagos a cambio de referencias de pacientes</li>
<li><strong>HIPAA:</strong> protege la privacidad de la información médica del paciente</li></ul>
<h3>Organismos reguladores</h3>
<ul><li>OIG (Oficina del Inspector General)</li>
<li>CMS (Centros de Servicios de Medicare y Medicaid)</li>
<li>DOJ (Departamento de Justicia)</li></ul>` },

  { sort:5, section:'INTRODUCCIÓN A LA CODIFICACIÓN MÉDICA', type:'quiz', title:'Quiz 1: Introducción a la Codificación',
    quizKey:'q1' },

  // SECTION 2 — CODIFICACIÓN ICD-10-CM
  { sort:6, section:'CODIFICACIÓN ICD-10-CM', type:'text', title:'Estructura y Formato del ICD-10-CM',
    content:`<h2>Estructura y Formato del ICD-10-CM</h2>
<p>El ICD-10-CM (Clasificación Internacional de Enfermedades, 10ª Revisión, Modificación Clínica) es el sistema estándar de codificación de diagnósticos en los EE.UU. desde octubre de 2015.</p>
<h3>Estructura del código ICD-10-CM</h3>
<ul><li><strong>Categoría:</strong> 3 caracteres (letra + 2 dígitos) — p. ej., J45 (Asma)</li>
<li><strong>Subcategoría:</strong> 4 caracteres — mayor especificidad</li>
<li><strong>Código completo:</strong> hasta 7 caracteres — máxima especificidad</li>
<li>El punto decimal separa los primeros 3 caracteres del resto</li></ul>
<h3>El Índice Alfabético y la Tabla Tabular</h3>
<ul><li><strong>Índice Alfabético:</strong> busque el término principal → anote el código sugerido</li>
<li><strong>Lista Tabular:</strong> verifique siempre el código en la lista tabular antes de asignar</li>
<li>Nunca codifique solo desde el índice alfabético</li></ul>
<h3>Convenciones del ICD-10-CM</h3>
<ul><li><strong>NOS (No Especificado de Otro Modo):</strong> información insuficiente para codificar más específico</li>
<li><strong>NEP (No Clasificado en Otro Lugar):</strong> no existe código más específico disponible</li>
<li><strong>Corchetes [ ]:</strong> sinónimos, términos alternativos o frases explicativas</li>
<li><strong>Paréntesis ( ):</strong> palabras suplementarias (modificadores no esenciales)</li>
<li><strong>Dos puntos : :</strong> el término está incompleto sin uno o más modificadores</li></ul>
<h3>Caracteres de 7ª posición</h3>
<ul><li>A — Encuentro inicial</li>
<li>D — Encuentro subsiguiente</li>
<li>S — Secuelas</li></ul>` },

  { sort:7, section:'CODIFICACIÓN ICD-10-CM', type:'presentation', title:'ICD-10-CM: Codificación de Diagnósticos',
    pptxKey:'icd10', pptxTitle:'ICD-10-CM: Codificación de Diagnósticos', pptxSub:'Estructura, convenciones y guías',
    pptxBullets:[
      { heading:'Estructura del Código ICD-10-CM', points:['3-7 caracteres alfanuméricos','Primer carácter siempre es letra','Segundo y tercer son numéricos','4-7 dan mayor especificidad clínica'] },
      { heading:'Pautas de Codificación Principales', points:['Principal diagnóstico: condición determinada al alta','Diagnósticos adicionales: condiciones que afectan el cuidado','Codifique al mayor nivel de especificidad','Siga siempre las pautas oficiales de codificación'] },
      { heading:'Categorías Comunes ICD-10-CM', points:['A00-B99: Enfermedades infecciosas','C00-D49: Neoplasias','E00-E89: Enfermedades endocrinas/metabólicas','I00-I99: Enfermedades del sistema circulatorio','J00-J99: Enfermedades del sistema respiratorio'] },
    ]
  },

  { sort:8, section:'CODIFICACIÓN ICD-10-CM', type:'text', title:'Pautas de Codificación de Diagnósticos',
    content:`<h2>Pautas Oficiales de Codificación ICD-10-CM</h2>
<h3>Selección del Diagnóstico Principal</h3>
<p>El diagnóstico principal es la condición establecida después del estudio como la que causó el ingreso hospitalario. Para visitas ambulatorias, es la condición que requirió la mayoría de los recursos.</p>
<h3>Condiciones crónicas vs. agudas</h3>
<ul><li>Las condiciones crónicas tratadas pueden codificarse junto con el diagnóstico principal</li>
<li>Si una condición aguda y crónica se codifican con el mismo código, use ese código</li>
<li>Cuando existen tanto una forma aguda como crónica, generalmente se prioriza el código agudo</li></ul>
<h3>Codificación de síntomas y signos</h3>
<ul><li>Los síntomas que forman parte integral de una enfermedad NO se codifican por separado</li>
<li>Los síntomas que NO son rutinarios SÍ se codifican por separado</li>
<li>Cuando el diagnóstico no está confirmado (ambulatorio), codifique el signo/síntoma, NO el diagnóstico presunto</li></ul>
<h3>Codificación de combinación</h3>
<ul><li>Algunos códigos ICD-10-CM identifican tanto la condición como la manifestación o causa</li>
<li>Ejemplo: E11.40 — Diabetes mellitus tipo 2 con neuropatía diabética, no especificada</li>
<li>Use el código de combinación cuando esté disponible; no use múltiples códigos</li></ul>
<h3>Lateralidad</h3>
<ul><li>Muchos códigos distinguen el lado del cuerpo: derecho, izquierdo, bilateral</li>
<li>Si la lateralidad no está documentada, use el código sin especificar</li></ul>` },

  { sort:9, section:'CODIFICACIÓN ICD-10-CM', type:'text', title:'Categorías Especiales ICD-10-CM',
    content:`<h2>Categorías Especiales de Codificación ICD-10-CM</h2>
<h3>Códigos Z (Factores que influyen en el estado de salud)</h3>
<ul><li><strong>Z00-Z13:</strong> Encuentros para exámenes y cribados</li>
<li><strong>Z20-Z29:</strong> Exposición a enfermedades y problemas relacionados</li>
<li><strong>Z30-Z39:</strong> Reproducción</li>
<li><strong>Z77-Z99:</strong> Historia personal y familiar, estado de salud</li></ul>
<h3>Códigos V, W, X, Y (Causas externas)</h3>
<ul><li>Documentan la causa externa de lesiones y condiciones</li>
<li>Nunca son el diagnóstico principal por sí solos</li>
<li>Se usan como códigos adicionales para especificar la causa de la lesión</li></ul>
<h3>Neoplasias</h3>
<ul><li>Tabla de neoplasias: organizada por sitio anatómico y comportamiento</li>
<li>Comportamientos: maligno primario, maligno secundario, in situ, benigno, incierto, no especificado</li>
<li>Para neoplasia activa: secuencia el código de la neoplasia primero</li>
<li>Para anemia debida a neoplasia: secuencia la neoplasia, luego D63.0</li></ul>
<h3>Diabetes mellitus</h3>
<ul><li>Tipo 1: E10.— (destrucción autoinmune de células beta)</li>
<li>Tipo 2: E11.— (resistencia a la insulina)</li>
<li>Secundaria: E08.—, E09.—, E13.—</li>
<li>Siempre codifique las manifestaciones/complicaciones específicas</li></ul>` },

  { sort:10, section:'CODIFICACIÓN ICD-10-CM', type:'quiz', title:'Quiz 2: Codificación ICD-10-CM',
    quizKey:'q2' },

  // SECTION 3 — CODIFICACIÓN CPT
  { sort:11, section:'CODIFICACIÓN CPT', type:'text', title:'Introducción al Sistema CPT',
    content:`<h2>Terminología de Procedimientos Actuales (CPT)</h2>
<p>El CPT (Current Procedural Terminology) es publicado por la AMA (Asociación Médica Americana) y es el estándar para reportar procedimientos y servicios médicos a los pagadores.</p>
<h3>Estructura del CPT</h3>
<ul><li><strong>Categoría I:</strong> códigos de 5 dígitos para procedimientos ampliamente realizados</li>
<li><strong>Categoría II:</strong> códigos de seguimiento de rendimiento (suplementarios, 4 dígitos + F)</li>
<li><strong>Categoría III:</strong> tecnologías emergentes (4 dígitos + T)</li></ul>
<h3>Secciones del CPT Categoría I</h3>
<ul><li><strong>99100-99499:</strong> Evaluación y Manejo (E&M)</li>
<li><strong>00100-01999:</strong> Anestesia</li>
<li><strong>10004-69990:</strong> Cirugía</li>
<li><strong>70010-79999:</strong> Radiología</li>
<li><strong>80047-89398:</strong> Patología y Laboratorio</li>
<li><strong>90281-99199:</strong> Medicina</li></ul>
<h3>Modificadores CPT</h3>
<ul><li>Códigos de 2 dígitos que alteran el significado del código pero no lo cambian</li>
<li><strong>-25:</strong> Servicio E&M significativo y separado el mismo día de un procedimiento</li>
<li><strong>-51:</strong> Procedimientos múltiples</li>
<li><strong>-59:</strong> Servicio/procedimiento distinto</li>
<li><strong>-GT:</strong> Servicio interactivo de video/telecomunicación</li></ul>` },

  { sort:12, section:'CODIFICACIÓN CPT', type:'presentation', title:'Codificación CPT en la Práctica',
    pptxKey:'cpt', pptxTitle:'Codificación CPT en la Práctica', pptxSub:'Procedimientos, E&M y modificadores',
    pptxBullets:[
      { heading:'Códigos de Evaluación y Manejo (E&M)', points:['Nivel determinado por complejidad médica','Tres componentes clave: historia, examen, toma de decisiones','Pacientes nuevos vs. establecidos — criterios diferentes','Códigos de oficina más comunes: 99202-99215'] },
      { heading:'Paquetes Globales de Cirugía', points:['Incluyen: procedimiento, cuidado preoperatorio (1 día), cuidado postoperatorio','Períodos globales: 0, 10 o 90 días','Modificador -54: solo procedimiento quirúrgico','Modificador -55: solo cuidado postoperatorio'] },
      { heading:'Modificadores Más Usados', points:['-25: E&M significativo + procedimiento mismo día','-51: Múltiples procedimientos','-59: Servicio distinto/independiente','-RT/-LT: Lado derecho/izquierdo'] },
    ]
  },

  { sort:13, section:'CODIFICACIÓN CPT', type:'text', title:'Códigos E&M y Toma de Decisiones Médicas',
    content:`<h2>Evaluación y Manejo (E&M): Selección de Nivel</h2>
<p>Los códigos E&M son los más utilizados en la práctica médica ambulatoria. La selección correcta depende de la complejidad médica de la decisión médica o del tiempo total.</p>
<h3>Método 1: Toma de Decisiones Médicas (MDM)</h3>
<ul><li><strong>Número y complejidad de problemas:</strong> mínimo, bajo, moderado, alto</li>
<li><strong>Cantidad y/o complejidad de datos:</strong> mínimo, limitado, moderado, extenso</li>
<li><strong>Riesgo de complicaciones:</strong> mínima, baja, moderada, alta</li></ul>
<h3>Niveles MDM</h3>
<ul><li><strong>Directo (99202/99212):</strong> 1 problema autolimitado, mínimo</li>
<li><strong>Bajo (99203/99213):</strong> 2+ problemas autolimitados o 1 condición crónica estable</li>
<li><strong>Moderado (99204/99214):</strong> 1+ condición crónica con exacerbación, nueva condición con incertidumbre</li>
<li><strong>Alto (99205/99215):</strong> 1+ condición crónica severa, o amenaza a la vida</li></ul>
<h3>Método 2: Tiempo Total</h3>
<ul><li>Tiempo cara a cara + preparación, revisión de resultados, coordinación de cuidado</li>
<li>Debe documentarse el tiempo total en la nota clínica</li>
<li>99202: 15-29 min | 99203: 30-44 min | 99204: 45-59 min | 99205: 60-74 min</li></ul>
<h3>Paciente nuevo vs. establecido</h3>
<ul><li>Nuevo: no ha recibido servicio profesional del médico/grupo en los últimos 3 años</li>
<li>Establecido: ha recibido servicio en los últimos 3 años</li></ul>` },

  { sort:14, section:'CODIFICACIÓN CPT', type:'text', title:'Codificación de Cirugía y Procedimientos Especiales',
    content:`<h2>Codificación de Procedimientos Quirúrgicos</h2>
<h3>Paquete Global de Cirugía</h3>
<p>El paquete global incluye todos los servicios normalmente asociados con un procedimiento quirúrgico:</p>
<ul><li>Evaluación preoperatoria (1 día antes para procedimientos de 90 días globales)</li>
<li>El procedimiento en sí</li>
<li>Cuidado postoperatorio durante el período global (0, 10 o 90 días)</li>
<li>Visitas de seguimiento sin complicaciones</li></ul>
<h3>Servicios NO incluidos en el paquete global</h3>
<ul><li>Diagnóstico de la condición inicial</li>
<li>Complicaciones que requieren hospitalización adicional</li>
<li>Servicios para condiciones no relacionadas</li>
<li>Procedimientos adicionales por nuevos problemas</li></ul>
<h3>Codificación de radiología</h3>
<ul><li>Muchos códigos de radiología tienen componente técnico y profesional</li>
<li><strong>Modificador -TC:</strong> solo componente técnico (equipo, técnico)</li>
<li><strong>Modificador -26:</strong> solo componente profesional (interpretación del médico)</li>
<li>Sin modificador: servicio completo (técnico + profesional)</li></ul>
<h3>HCPCS Nivel II</h3>
<ul><li>Códigos de 5 caracteres: letra + 4 dígitos (A0000–V9999)</li>
<li>Cubren: ambulancias, equipos médicos duraderos, suministros, inyectables</li>
<li>Ejemplo: A4570 — Férula; E0601 — Concentrador de oxígeno</li></ul>` },

  { sort:15, section:'CODIFICACIÓN CPT', type:'quiz', title:'Quiz 3: Codificación CPT',
    quizKey:'q3' },

  // SECTION 4 — FACTURACIÓN MÉDICA Y CICLO DE INGRESOS
  { sort:16, section:'FACTURACIÓN MÉDICA Y CICLO DE INGRESOS', type:'text', title:'El Proceso de Reclamaciones y la Forma CMS-1500',
    content:`<h2>Reclamaciones Médicas y la Forma CMS-1500</h2>
<p>La forma CMS-1500 es el formulario estándar de reclamación para proveedores no hospitalarios (médicos, clínicas, laboratorios). Los hospitales usan la forma UB-04.</p>
<h3>Campos clave del CMS-1500</h3>
<ul><li><strong>Cuadro 1:</strong> Tipo de seguro (Medicare, Medicaid, TRICARE, CHAMPVA, Seguro de grupo, FECA, Otro)</li>
<li><strong>Cuadro 21:</strong> Códigos ICD-10-CM de diagnóstico (hasta 12)</li>
<li><strong>Cuadro 24:</strong> Códigos de procedimiento CPT/HCPCS, modificadores, diagnósticos relacionados</li>
<li><strong>Cuadro 33:</strong> Información del proveedor facturador (NPI)</li></ul>
<h3>NPI — Identificador Nacional del Proveedor</h3>
<ul><li>Número único de 10 dígitos asignado a cada proveedor de salud</li>
<li><strong>NPI Tipo 1:</strong> proveedores individuales (médicos, enfermeras)</li>
<li><strong>NPI Tipo 2:</strong> organizaciones (hospitales, grupos médicos, clínicas)</li></ul>
<h3>Proceso de verificación de elegibilidad</h3>
<ul><li>Verificar siempre antes de la cita: cobertura activa, deducible, copago, autorización previa</li>
<li>Herramientas: portal del pagador, línea IVR, EDI 270/271 (consulta/respuesta de elegibilidad)</li></ul>
<h3>Reclamaciones electrónicas (EDI)</h3>
<ul><li>837P: reclamación profesional electrónica (reemplaza CMS-1500)</li>
<li>837I: reclamación institucional electrónica (reemplaza UB-04)</li>
<li>835: Aviso de Pago Electrónico (ERA)</li></ul>` },

  { sort:17, section:'FACTURACIÓN MÉDICA Y CICLO DE INGRESOS', type:'presentation', title:'Facturación Médica y Gestión del Ciclo de Ingresos',
    pptxKey:'billing', pptxTitle:'Facturación Médica y Ciclo de Ingresos', pptxSub:'Reclamaciones, reembolsos y seguimiento de cuentas',
    pptxBullets:[
      { heading:'Ciclo de Ingresos en 10 Pasos', points:['1. Programación y registro del paciente','2. Verificación de elegibilidad','3. Autorización previa','4. Documentación del encuentro','5. Asignación de códigos'] },
      { heading:'Ciclo de Ingresos (cont.)', points:['6. Carga de cargos (charge entry)','7. Envío de reclamación','8. Adjudicación del pagador','9. Seguimiento de cuentas pendientes (AR)','10. Cobros al paciente'] },
      { heading:'Gestión de Cuentas por Cobrar', points:['AR > 90 días requiere acción inmediata','Tasa de rechazo ideal: < 5%','Tasa de cobro neta objetivo: > 95%','Análisis de aging report semanal'] },
    ]
  },

  { sort:18, section:'FACTURACIÓN MÉDICA Y CICLO DE INGRESOS', type:'text', title:'Gestión de Rechazos y Apelaciones',
    content:`<h2>Gestión de Rechazos y Apelaciones de Reclamaciones</h2>
<h3>Tipos de respuesta del pagador</h3>
<ul><li><strong>Aprobada:</strong> reclamación pagada completa o parcialmente</li>
<li><strong>Rechazada:</strong> reclamación no procesada por error técnico (se puede corregir y reenviar)</li>
<li><strong>Denegada:</strong> reclamación procesada pero no pagada (requiere apelación)</li></ul>
<h3>Razones comunes de rechazo</h3>
<ul><li>Número de miembro/seguro incorrecto</li>
<li>Fecha de nacimiento del paciente no coincide</li>
<li>NPI del proveedor faltante o incorrecto</li>
<li>Código de diagnóstico no relacionado con el procedimiento</li>
<li>Servicio prestado fuera de la red</li></ul>
<h3>Razones comunes de denegación</h3>
<ul><li>Servicio no cubierto por el plan</li>
<li>Servicio no es médicamente necesario</li>
<li>Falta de autorización previa</li>
<li>Período de facturación vencido (timely filing)</li>
<li>Duplicado de reclamación</li></ul>
<h3>Proceso de apelación</h3>
<ul><li>Revise el EOB/ERA para identificar el código de denegación</li>
<li>Recopile documentación de soporte (notas clínicas, órdenes médicas)</li>
<li>Envíe carta de apelación formal dentro del plazo del pagador</li>
<li>Niveles de apelación: 1ª apelación → revisión médica → audiencia formal → revisión externa</li></ul>` },

  { sort:19, section:'FACTURACIÓN MÉDICA Y CICLO DE INGRESOS', type:'text', title:'Metodologías de Reembolso',
    content:`<h2>Metodologías de Reembolso en Medicare y Seguros</h2>
<h3>Schedule de Tarifas de Médicos de Medicare (MPFS)</h3>
<ul><li>Basado en el sistema de Unidades de Valor Relativo (RVU)</li>
<li><strong>Trabajo RVU:</strong> esfuerzo y juicio del médico</li>
<li><strong>Práctica RVU:</strong> gastos de overhead</li>
<li><strong>Malpractice RVU:</strong> costo del seguro de responsabilidad</li>
<li>Tarifa = (RVU trabajo + RVU práctica + RVU malpractice) × Factor de conversión × GPCI</li></ul>
<h3>DRG — Grupos Relacionados por Diagnóstico (hospitalario)</h3>
<ul><li>Sistema de pago prospectivo para hospitales</li>
<li>Pago fijo basado en la categoría de diagnóstico principal</li>
<li>No importa cuánto cueste realmente tratar al paciente</li></ul>
<h3>APC — Clasificaciones de Pacientes Ambulatorios</h3>
<ul><li>Sistema PPS para servicios ambulatorios hospitalarios</li>
<li>Similar a DRG pero para pacientes ambulatorios</li></ul>
<h3>Planes de Ventaja de Medicare (Parte C)</h3>
<ul><li>Administrados por aseguradoras privadas aprobadas</li>
<li>Deben cubrir todo lo de Medicare Partes A y B</li>
<li>Pueden tener redes de proveedores, copagos diferentes</li></ul>` },

  { sort:20, section:'FACTURACIÓN MÉDICA Y CICLO DE INGRESOS', type:'quiz', title:'Quiz 4: Facturación y Ciclo de Ingresos',
    quizKey:'q4' },

  // SECTION 5 — CUMPLIMIENTO Y ÉTICA
  { sort:21, section:'CUMPLIMIENTO Y ÉTICA', type:'text', title:'HIPAA y la Privacidad del Paciente en Facturación',
    content:`<h2>HIPAA y la Privacidad del Paciente en Facturación</h2>
<p>La Ley de Portabilidad y Responsabilidad del Seguro Médico (HIPAA) de 1996 establece estándares nacionales para proteger la información médica del paciente.</p>
<h3>Información de Salud Protegida (PHI)</h3>
<ul><li>Cualquier información que pueda identificar a un individuo vinculada a su salud</li>
<li>18 identificadores: nombre, dirección, fecha de nacimiento, SSN, número de cuenta, etc.</li>
<li>ePHI: PHI en formato electrónico — protegida por la Regla de Seguridad</li></ul>
<h3>Regla de Privacidad HIPAA</h3>
<ul><li>Limita el uso y divulgación de PHI</li>
<li>Usos permitidos sin autorización: tratamiento, pago, operaciones sanitarias (TPO)</li>
<li>Para facturación: se permite compartir PHI con pagadores para el reembolso</li>
<li>Pacientes tienen derecho a acceder, corregir y restringir el uso de su PHI</li></ul>
<h3>Regla de Seguridad HIPAA</h3>
<ul><li>Aplica solo a ePHI</li>
<li>Salvaguardas administrativas: políticas, capacitación del personal</li>
<li>Salvaguardas físicas: control de acceso a instalaciones</li>
<li>Salvaguardas técnicas: encriptación, contraseñas, registros de auditoría</li></ul>
<h3>Violaciones HIPAA y sanciones</h3>
<ul><li>Categoría 1 (desconocida): $100–$50,000 por violación</li>
<li>Categoría 2 (causa razonable): $1,000–$50,000</li>
<li>Categoría 3 (descuido intencional, corregida): $10,000–$50,000</li>
<li>Categoría 4 (descuido intencional, no corregida): $50,000 mínimo</li></ul>` },

  { sort:22, section:'CUMPLIMIENTO Y ÉTICA', type:'presentation', title:'Cumplimiento y Ética en Codificación',
    pptxKey:'compliance', pptxTitle:'Cumplimiento y Ética en Codificación Médica', pptxSub:'HIPAA, fraude y programas de cumplimiento',
    pptxBullets:[
      { heading:'Programa de Cumplimiento Efectivo', points:['Estándares escritos de conducta','Oficial de cumplimiento designado','Capacitación y educación regular','Línea de denuncia anónima','Respuesta a violaciones detectadas'] },
      { heading:'Prácticas de Codificación Prohibidas', points:['Upcoding: código de mayor complejidad del documentado','Unbundling: separar códigos de procedimiento incluidos','Facturar servicios no prestados','Documentación falsa o alterada'] },
      { heading:'Auditorías de Cumplimiento', points:['Auditorías prospectivas: antes del envío','Auditorías retrospectivas: después del pago','RAC: Contratistas de Auditoría de Recuperación','CERT: Prueba de Error de Reclamación Comprehensiva'] },
    ]
  },

  { sort:23, section:'CUMPLIMIENTO Y ÉTICA', type:'text', title:'Documentación Médica y su Impacto en la Codificación',
    content:`<h2>La Documentación Médica y su Impacto en la Codificación</h2>
<p>La documentación clínica es la base de toda codificación precisa. "Si no está documentado, no ocurrió" es el principio fundamental en registros médicos y facturación.</p>
<h3>Elementos de documentación clínica de calidad</h3>
<ul><li>Fecha y hora del servicio</li>
<li>Identificación del proveedor (firma, credenciales, NPI)</li>
<li>Motivo de consulta y síntomas del paciente</li>
<li>Historia médica relevante</li>
<li>Hallazgos del examen físico</li>
<li>Impresión diagnóstica o diagnóstico</li>
<li>Plan de tratamiento</li></ul>
<h3>Tipos de notas clínicas</h3>
<ul><li><strong>SOAP:</strong> Subjetivo, Objetivo, Evaluación, Plan</li>
<li><strong>SOAPIE:</strong> + Intervención y Evaluación del resultado</li>
<li><strong>DAP:</strong> Datos, Evaluación, Plan (salud mental)</li></ul>
<h3>Mejora de la documentación clínica (CDI)</h3>
<ul><li>El especialista CDI trabaja con médicos para aclarar documentación ambigua</li>
<li>Consultas de aclaración de documentación (sin sugerir un diagnóstico específico)</li>
<li>Objetivo: capturar la verdadera complejidad y severidad del paciente</li></ul>
<h3>Problemas documentales comunes</h3>
<ul><li>Diagnósticos no documentados en el código correcto</li>
<li>Uso de "posible", "probable" (no use para ambulatorio)</li>
<li>Falta de especificidad: "diabetes" vs. "DM tipo 2 con neuropatía periférica"</li>
<li>No documentar condiciones crónicas que se tratan</li></ul>` },

  { sort:24, section:'CUMPLIMIENTO Y ÉTICA', type:'quiz', title:'Quiz 5: Cumplimiento y Documentación',
    quizKey:'q5' },

  // SECTION 6 — PREPARACIÓN PARA EL EXAMEN CBCS
  { sort:25, section:'PREPARACIÓN PARA EL EXAMEN CBCS', type:'text', title:'Guía de Estudio y Repaso para el Examen CBCS',
    content:`<h2>Guía de Estudio: Examen CBCS de NHA</h2>
<h3>Estructura del examen CBCS</h3>
<ul><li>110 preguntas en total (90 con puntaje + 20 de pretest)</li>
<li>Tiempo: 3 horas</li>
<li>Formato: opción múltiple</li>
<li>Puntaje mínimo aprobatorio: 390/500</li></ul>
<h3>Dominios del examen CBCS</h3>
<ul><li><strong>Dominio 1 — Codificación (43%):</strong> ICD-10-CM, CPT, HCPCS Nivel II, modificadores</li>
<li><strong>Dominio 2 — Ciclo de ingresos (25%):</strong> registro, elegibilidad, reclamaciones, cobro</li>
<li><strong>Dominio 3 — Leyes y cumplimiento (18%):</strong> HIPAA, fraude, ética</li>
<li><strong>Dominio 4 — Pago y reembolso (14%):</strong> adjudicación, metodologías de pago, apelaciones</li></ul>
<h3>Estrategias de preparación</h3>
<ul><li>Practique la búsqueda en el Índice Alfabético → Lista Tabular del ICD-10-CM</li>
<li>Memorice los modificadores CPT más comunes (-25, -51, -59, -TC, -26)</li>
<li>Comprenda los períodos globales de cirugía (0, 10, 90 días)</li>
<li>Repase las reglas de selección del diagnóstico principal</li>
<li>Estudie las violaciones HIPAA y sus sanciones</li></ul>
<h3>El día del examen</h3>
<ul><li>Llegue 30 minutos antes al centro de pruebas</li>
<li>Traiga identificación con foto vigente</li>
<li>No se permiten libros de códigos (el examen proporciona tablas de referencia)</li>
<li>Lea cada pregunta completamente antes de elegir</li>
<li>Marque las preguntas difíciles y regrese a ellas</li></ul>` },

  { sort:26, section:'PREPARACIÓN PARA EL EXAMEN CBCS', type:'presentation', title:'Estrategia para el Examen CBCS',
    pptxKey:'exam-prep', pptxTitle:'Estrategia para el Examen CBCS', pptxSub:'Dominios, consejos y práctica',
    pptxBullets:[
      { heading:'Dominios del Examen CBCS por Peso', points:['Codificación 43% — área más importante','Ciclo de ingresos 25%','Leyes y cumplimiento 18%','Pago y reembolso 14%','Enfóquese en codificación primero'] },
      { heading:'Consejos de Codificación para el Examen', points:['Siempre verifique en la Lista Tabular','Codifique al mayor nivel de especificidad','Use modificadores correctamente','-25 y -59 son los más evaluados','Distinción ambulatorio vs. hospitalario es clave'] },
      { heading:'Plan de Estudio Final (2 semanas)', points:['Semana 1: Revisión ICD-10-CM + CPT + HCPCS','Semana 2: Ciclo de ingresos + cumplimiento + exámenes de práctica','Día previo: descanso + repaso rápido de áreas débiles','Día del examen: confianza y gestión del tiempo'] },
    ]
  },

  { sort:27, section:'PREPARACIÓN PARA EL EXAMEN CBCS', type:'quiz', title:'Evaluación Final: Examen de Práctica CBCS',
    quizKey:'final' },
];

const quizzes = {
  q1: [
    { q:'¿Cuál sistema de codificación se usa para reportar diagnósticos en los EE.UU.?', options:['CPT','ICD-10-CM','HCPCS Nivel II','DRG'], answer:1 },
    { q:'¿Qué es el "upcoding" en facturación médica?', options:['Corregir un código mal asignado','Facturar un nivel de servicio mayor al documentado','Usar modificadores adicionales','Combinar dos códigos en uno'], answer:1 },
    { q:'¿Cuál de los siguientes es un programa de seguro de salud federal para personas de 65 años o más?', options:['Medicaid','TRICARE','Medicare','CHIP'], answer:2 },
    { q:'El término "unbundling" en facturación médica significa:', options:['Enviar reclamaciones electrónicas','Facturar componentes separados de un procedimiento incluido','Agrupar reclamaciones similares','Usar un solo código para múltiples servicios'], answer:1 },
    { q:'¿Qué documento estándar usan los proveedores no hospitalarios para enviar reclamaciones a los pagadores?', options:['UB-04','CMS-1500','CMS-1450','EDI 835'], answer:1 },
  ],
  q2: [
    { q:'¿Cuántos caracteres puede tener un código ICD-10-CM como máximo?', options:['5','6','7','8'], answer:2 },
    { q:'En el ICD-10-CM, ¿qué indica el 7° carácter "A"?', options:['Secuelas','Encuentro subsiguiente','Encuentro inicial','Complicación'], answer:2 },
    { q:'¿Qué convención del ICD-10-CM se usa para palabras suplementarias que no afectan la asignación del código?', options:['Corchetes [ ]','Dos puntos :','Paréntesis ( )','Cursivas'], answer:2 },
    { q:'Para un paciente ambulatorio con diagnóstico "probable de neumonía", ¿qué se debe codificar?', options:['El diagnóstico de neumonía confirmada','El signo o síntoma que motivó la visita','Tanto neumonía como los síntomas','Neumonía con el modificador "probable"'], answer:1 },
    { q:'¿Cuál categoría del ICD-10-CM cubre las enfermedades del sistema circulatorio?', options:['A00-B99','J00-J99','I00-I99','K00-K95'], answer:2 },
  ],
  q3: [
    { q:'¿Qué modificador CPT se usa cuando se proporciona un servicio E&M significativo y separado el mismo día de un procedimiento menor?', options:['-51','-59','-25','-32'], answer:2 },
    { q:'Los códigos CPT Categoría II son:', options:['Códigos de procedimientos quirúrgicos complejos','Códigos de seguimiento de rendimiento (suplementarios)','Códigos para tecnologías emergentes','Códigos de anestesia'], answer:1 },
    { q:'¿Cuál es el período global de cirugía estándar para procedimientos mayores?', options:['0 días','10 días','90 días','30 días'], answer:2 },
    { q:'Para reportar solo el componente técnico de un servicio de radiología, se usa el modificador:', options:['-26','-TC','-52','-RT'], answer:1 },
    { q:'¿Qué rango de códigos CPT corresponde a Evaluación y Manejo (E&M)?', options:['10004-69990','70010-79999','99100-99499','80047-89398'], answer:2 },
  ],
  q4: [
    { q:'¿Qué transacción EDI representa la reclamación profesional electrónica?', options:['835','270','837P','834'], answer:2 },
    { q:'El sistema de pago DRG se usa para rembolsar:', options:['Servicios ambulatorios de médicos','Ingresos hospitalarios','Servicios de laboratorio independiente','Equipo médico durable'], answer:1 },
    { q:'¿Qué significa "timely filing" en el contexto de reclamaciones médicas?', options:['Enviar reclamaciones electrónicamente','El plazo del pagador para presentar reclamaciones','El tiempo para procesar pagos','La fecha de servicio del paciente'], answer:1 },
    { q:'Un EOB (Explanation of Benefits) lo emite:', options:['El hospital al paciente','El pagador al proveedor/paciente explicando el procesamiento','El médico a la clínica','El gobierno federal'], answer:1 },
    { q:'¿Qué son las RVU en el contexto del Medicare Physician Fee Schedule?', options:['Unidades de Valor Relativo — base del cálculo de tarifas Medicare','Registros de Visitas Únicas','Revisiones de Valor de Reembolso','Unidades de Verificación de Reclamaciones'], answer:0 },
  ],
  q5: [
    { q:'¿Cuál de los siguientes NO es un uso permitido de PHI sin autorización del paciente bajo HIPAA?', options:['Tratamiento del paciente','Operaciones sanitarias','Mercadotecnia comercial de terceros','Facturación y pago'], answer:2 },
    { q:'¿Cuántos identificadores reconoce HIPAA como información de salud protegida (PHI)?', options:['10','14','18','22'], answer:2 },
    { q:'El principio "si no está documentado, no ocurrió" aplica principalmente a:', options:['La selección de pagadores','La codificación y facturación médica','La programación de citas','El diseño de formularios'], answer:1 },
    { q:'Un especialista CDI (Mejora de Documentación Clínica) puede:', options:['Cambiar diagnósticos en la nota clínica','Solicitar aclaración al médico sobre documentación ambigua','Asignar códigos directamente sin revisar la nota','Aprobar reclamaciones de seguro'], answer:1 },
    { q:'¿Cuál es la sanción mínima por violación HIPAA de Categoría 4 (descuido intencional no corregido)?', options:['$100 por violación','$1,000 por violación','$10,000 por violación','$50,000 por violación'], answer:3 },
  ],
  final: [
    { q:'¿Qué sistema de codificación publicado por la AMA se usa para reportar procedimientos médicos?', options:['ICD-10-CM','SNOMED','CPT','LOINC'], answer:2 },
    { q:'¿Cuál es el formulario estándar de reclamación para médicos y clínicas?', options:['UB-04','CMS-1500','SF-1500','ADA 2019'], answer:1 },
    { q:'El modificador CPT -51 indica:', options:['Servicio E&M separado el mismo día','Múltiples procedimientos realizados el mismo día','Procedimiento bilateral','Servicio de telecomunicación'], answer:1 },
    { q:'En ICD-10-CM, ¿qué significa NOS?', options:['No Operado Satisfactoriamente','No Especificado de Otro Modo','No se Obtuvieron Síntomas','No se Observaron Signos'], answer:1 },
    { q:'¿Cuál es el período global para la mayoría de los procedimientos quirúrgicos mayores?', options:['0 días','10 días','30 días','90 días'], answer:3 },
    { q:'¿Qué pagador federal cubre a personas de bajos ingresos y es administrado conjuntamente por estados y el gobierno federal?', options:['Medicare Parte A','Medicare Parte B','Medicaid','TRICARE'], answer:2 },
    { q:'La Ley de Reclamaciones Falsas prohíbe:', options:['Usar el ICD-10-CM para diagnósticos','Presentar reclamaciones fraudulentas al gobierno','Obtener autorización previa','Usar modificadores en los códigos CPT'], answer:1 },
    { q:'¿Qué transacción EDI se usa para solicitar información de elegibilidad de un seguro?', options:['835','837P','270','834'], answer:2 },
    { q:'El método de selección de nivel E&M basado en tiempo requiere:', options:['Solo el tiempo cara a cara con el paciente','El tiempo total incluyendo preparación y coordinación','El tiempo de espera del paciente','El tiempo de facturación'], answer:1 },
    { q:'¿Qué modificador indica solo el componente profesional de un servicio de radiología?', options:['-TC','-26','-RT','-52'], answer:1 },
    { q:'Un código ICD-10-CM con el 7° carácter "S" indica:', options:['Sospecha de diagnóstico','Seguimiento subagudo','Secuelas de la condición','Solo síntomas'], answer:2 },
    { q:'¿Qué es el "paquete global de cirugía"?', options:['Una colección de códigos CPT para el mismo paciente','Los servicios incluidos en el pago de un procedimiento quirúrgico','Un plan de facturación mensual','Un módulo de software de facturación'], answer:1 },
    { q:'El NPI (Identificador Nacional del Proveedor) Tipo 2 se asigna a:', options:['Médicos individuales','Enfermeras practicantes','Organizaciones y grupos médicos','Estudiantes de medicina'], answer:2 },
    { q:'¿Cuál de las siguientes es una razón común de DENEGACIÓN (no rechazo) de una reclamación?', options:['Número de miembro incorrecto','Fecha de nacimiento no coincide','Servicio no cubierto por el plan','NPI del proveedor faltante'], answer:2 },
    { q:'Las auditorías RAC (Recovery Audit Contractors) tienen como objetivo:', options:['Capacitar a codificadores médicos','Identificar pagos incorrectos de Medicare y Medicaid','Certificar proveedores de salud','Revisar contratos con pagadores'], answer:1 },
    { q:'¿Qué es el "copago" en un plan de seguro médico?', options:['El porcentaje que paga el seguro después del deducible','La prima mensual del seguro','Una tarifa fija que paga el paciente por cada visita','El máximo anual de gastos del paciente'], answer:2 },
    { q:'¿Cuál es el porcentaje del examen CBCS dedicado a codificación (ICD-10-CM, CPT, HCPCS)?', options:['18%','25%','43%','57%'], answer:2 },
    { q:'Un paciente con diabetes tipo 2 que también tiene retinopatía diabética: ¿cómo se codifica?', options:['Solo la diabetes tipo 2','Solo la retinopatía','Con un código de combinación que incluye ambas condiciones','Con un código Z para condición crónica'], answer:2 },
    { q:'¿Qué término describe la práctica de facturar por separado procedimientos que deben facturarse juntos con un código integral?', options:['Upcoding','Unbundling','Double billing','Upcapture'], answer:1 },
    { q:'En el contexto E&M, un "paciente nuevo" es aquel que NO ha recibido servicios del proveedor/grupo en los últimos:', options:['1 año','2 años','3 años','5 años'], answer:2 },
  ],
};

async function main() {
  const conn = await mysql.createConnection(DB);

  // Delete existing Spanish CBCS course if re-running
  const [existing] = await conn.execute(
    `SELECT id FROM courses WHERE slug = 'codificacion-facturacion-medica' LIMIT 1`
  );
  if (existing.length > 0) {
    const oldId = existing[0].id;
    const [oldLessons] = await conn.execute(`SELECT id FROM lessons WHERE course_id = ?`, [oldId]);
    for (const l of oldLessons) {
      await conn.execute(`DELETE FROM quiz_questions WHERE lesson_id = ?`, [l.id]);
    }
    await conn.execute(`DELETE FROM lessons WHERE course_id = ?`, [oldId]);
    await conn.execute(`DELETE FROM courses WHERE id = ?`, [oldId]);
    console.log(`Cleared existing Spanish CBCS course (id=${oldId})`);
  }

  // Insert Spanish course row
  const [courseResult] = await conn.execute(
    `INSERT INTO courses (title, slug, description, category, level, is_published, price, sort_order, lang, paired_course_id)
     VALUES (?, ?, ?, ?, ?, 1, 0.00, 8, 'es', ?)`,
    [
      'Codificación y Facturación Médica (CBCS)',
      'codificacion-facturacion-medica',
      'Preparación completa para la certificación CBCS: ICD-10-CM, CPT, HCPCS, ciclo de ingresos y cumplimiento normativo.',
      'Medical Assistant',
      'beginner',
      EN_COURSE_ID,
    ]
  );
  const COURSE_ID = courseResult.insertId;
  console.log(`Created Spanish CBCS course: id=${COURSE_ID}`);

  // Update English course to point back
  await conn.execute(`UPDATE courses SET paired_course_id = ? WHERE id = ?`, [COURSE_ID, EN_COURSE_ID]);
  console.log(`Linked English course ${EN_COURSE_ID} ↔ Spanish course ${COURSE_ID}`);

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
    console.log(`  ✓ [${lesson.sort}] ${lesson.type}: ${lesson.title} (id=${lessonId})`);

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
      console.log(`    └─ ${qs.length} preguntas insertadas`);
    }
  }

  await conn.end();
  console.log(`\n✅ Curso CBCS en español completado — ${lessons.length} lecciones.`);
}

main().catch(err => { console.error(err); process.exit(1); });
