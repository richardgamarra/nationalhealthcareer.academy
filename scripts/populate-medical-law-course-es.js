/**
 * populate-medical-law-course-es.js
 * Creates the Spanish version of Course 9 — Ley y Ética Médica (MLE)
 * Pairs with English course ID 9.
 * Run from /var/www/nationalhealthcareer-com/
 */

const mysql  = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const fs = require('fs');
const path = require('path');

const DB = { host:'localhost', user:'admin_nhca', password:'2u95#I7jm', database:'nha_db' };
const UPLOADS = '/var/www/nationalhealthcareer-com/public/uploads';
const EN_COURSE_ID = 9;
const SLUG_SUFFIX = '-c9es';

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

  const filename = `${Date.now()}-mle-es-${key}.pptx`;
  const fullPath = path.join(UPLOADS, filename);
  pptx.writeFile({ fileName: fullPath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

const lessons = [
  // SECTION 1 — FUNDAMENTOS DEL DERECHO SANITARIO
  { sort:1, section:'FUNDAMENTOS DEL DERECHO SANITARIO', type:'text', title:'Bienvenido a Ley y Ética Médica',
    content:`<h2>Bienvenido al Curso MLE</h2>
<p>El derecho sanitario es el conjunto de normas jurídicas que regulan el sistema de atención médica, las relaciones entre proveedores y pacientes, y los derechos y obligaciones de todos los actores del sector salud.</p>
<h3>Fuentes del Derecho Sanitario</h3>
<ul><li><strong>Estatutos federales y estatales:</strong> leyes aprobadas por el Congreso o legislaturas estatales (p. ej., HIPAA, ACA)</li>
<li><strong>Reglamentos CMS:</strong> normas administrativas dictadas por agencias federales como los Centros de Medicare y Medicaid</li>
<li><strong>Derecho común (Common Law):</strong> precedentes judiciales que definen estándares de cuidado y responsabilidad</li>
<li><strong>Derecho constitucional:</strong> derechos fundamentales que protegen a pacientes y proveedores</li></ul>
<h3>Importancia del Cumplimiento Legal en la Atención Médica</h3>
<ul><li>Protege la seguridad y los derechos del paciente</li>
<li>Evita sanciones civiles, penales y administrativas</li>
<li>Garantiza la continuidad de la licencia profesional</li>
<li>Fomenta la confianza en el sistema de salud</li></ul>
<h3>Certificación MLE de NHA</h3>
<p>La certificación MLE (Especialista en Ley y Ética Médica) de la NHA valida el conocimiento en derecho sanitario, privacidad, ética médica, responsabilidad y cumplimiento regulatorio. Este curso lo prepara completamente para superar el examen de certificación.</p>` },

  { sort:2, section:'FUNDAMENTOS DEL DERECHO SANITARIO', type:'presentation', title:'Fundamentos del Derecho Sanitario',
    pptxKey:'fundamentos', pptxTitle:'Fundamentos del Derecho Sanitario', pptxSub:'Fuentes, relaciones y consentimiento',
    pptxBullets:[
      { heading:'Fuentes del Derecho Sanitario', points:['Estatutos federales: HIPAA, ACA, EMTALA, Ley Stark','Estatutos estatales: práctica médica, licencias, consentimiento','Reglamentos CMS: Medicare, Medicaid, condiciones de participación','Derecho común: negligencia, malpractice, precedentes judiciales'] },
      { heading:'Relación Médico-Paciente', points:['Creación: contrato implícito o expreso al aceptar al paciente','Obligaciones: confidencialidad, competencia, continuidad de cuidado','Terminación: aviso adecuado, no abandono, registros disponibles','Abandono: terminación abrupta sin cuidado alternativo = ilegal'] },
      { heading:'Consentimiento Informado', points:['Elementos: capacidad legal, información adecuada, voluntariedad','Excepciones: emergencias, paciente renuncia, privilegio terapéutico','Documentación: firma del paciente, testigo, registro en expediente','Menores: requiere consentimiento de tutor (salvo emancipados)'] },
    ]
  },

  { sort:3, section:'FUNDAMENTOS DEL DERECHO SANITARIO', type:'text', title:'Tipos de Derecho y Responsabilidad Legal',
    content:`<h2>Tipos de Derecho y Responsabilidad Legal en Salud</h2>
<h3>Derecho Civil vs. Derecho Penal</h3>
<ul><li><strong>Derecho civil:</strong> busca compensación económica para el perjudicado; estándar de prueba: preponderancia de evidencia</li>
<li><strong>Derecho penal:</strong> busca castigo (multas, cárcel); estándar de prueba: más allá de toda duda razonable</li>
<li>Un mismo acto puede dar lugar a responsabilidad civil Y penal simultáneamente</li></ul>
<h3>Negligencia Médica (Malpractice)</h3>
<p>La negligencia médica ocurre cuando un proveedor de salud no cumple con el estándar de cuidado aceptado, causando daño al paciente.</p>
<h3>Los 4 Elementos de la Negligencia</h3>
<ul><li><strong>Deber (Duty):</strong> existía una relación médico-paciente que creó obligación de cuidado</li>
<li><strong>Incumplimiento (Breach):</strong> el proveedor no cumplió con el estándar de cuidado</li>
<li><strong>Causalidad (Causation):</strong> el incumplimiento fue causa directa del daño (causa próxima)</li>
<li><strong>Daños (Damages):</strong> el paciente sufrió daño real (físico, económico, emocional)</li></ul>
<h3>Doctrinas Legales Importantes</h3>
<ul><li><strong>Res Ipsa Loquitur ("La cosa habla por sí misma"):</strong> la negligencia es tan evidente que no requiere prueba directa (p. ej., instrumentos quirúrgicos olvidados en el paciente)</li>
<li><strong>Respondeat Superior ("El superior responde"):</strong> el empleador es responsable por actos negligentes de sus empleados durante el trabajo</li>
<li><strong>Responsabilidad vicaria:</strong> un proveedor puede ser responsable por actos de otro que controla o supervisa</li></ul>` },

  { sort:4, section:'FUNDAMENTOS DEL DERECHO SANITARIO', type:'text', title:'Consentimiento Informado y Derechos del Paciente',
    content:`<h2>Consentimiento Informado y Derechos del Paciente</h2>
<h3>Tipos de Consentimiento</h3>
<ul><li><strong>Consentimiento expreso:</strong> verbal o escrito, explícito y claro</li>
<li><strong>Consentimiento implícito:</strong> se infiere de la conducta del paciente (p. ej., extender el brazo para una inyección)</li>
<li><strong>Consentimiento de emergencia:</strong> cuando el paciente no puede consentir y hay riesgo vital</li></ul>
<h3>Elementos del Consentimiento Válido</h3>
<ul><li>Capacidad legal del paciente para decidir</li>
<li>Información adecuada: diagnóstico, procedimiento, riesgos, beneficios y alternativas</li>
<li>Decisión voluntaria sin coacción ni presión</li>
<li>Documentación adecuada en el expediente clínico</li></ul>
<h3>Poblaciones Especiales</h3>
<ul><li><strong>Menores:</strong> requieren consentimiento de tutor o padre, salvo en servicios de salud reproductiva, emergencias o menores emancipados</li>
<li><strong>Menores emancipados:</strong> casados, militares o judicialmente emancipados — pueden consentir por sí mismos</li>
<li><strong>Testigos de Jehová:</strong> adultos competentes pueden rechazar transfusiones; dilema con menores</li></ul>
<h3>Directivas Anticipadas</h3>
<ul><li><strong>Testamento vital (Living Will):</strong> instrucciones escritas sobre preferencias de tratamiento cuando el paciente no puede comunicarse</li>
<li><strong>Poder notarial duradero para salud (DPAHC):</strong> designa a un agente para tomar decisiones médicas</li>
<li><strong>Orden DNR (Do Not Resuscitate):</strong> instrucción médica de no reanimar en caso de paro cardíaco o respiratorio</li>
<li>La Ley de Autodeterminación del Paciente (PSDA) requiere que instalaciones que reciben fondos federales informen a pacientes sobre directivas anticipadas</li></ul>` },

  { sort:5, section:'FUNDAMENTOS DEL DERECHO SANITARIO', type:'quiz', title:'Quiz 1: Fundamentos del Derecho Sanitario',
    quizKey:'q1' },

  // SECTION 2 — HIPAA Y PRIVACIDAD DEL PACIENTE
  { sort:6, section:'HIPAA Y PRIVACIDAD DEL PACIENTE', type:'text', title:'La Ley HIPAA: Privacidad y Seguridad',
    content:`<h2>HIPAA: Ley de Portabilidad y Responsabilidad del Seguro Médico</h2>
<p>HIPAA (Health Insurance Portability and Accountability Act, 1996) establece estándares nacionales para proteger la información médica del paciente y garantizar la portabilidad del seguro de salud.</p>
<h3>Regla de Privacidad HIPAA</h3>
<ul><li>Protege la <strong>PHI (Información de Salud Protegida)</strong> en cualquier forma: oral, escrita o electrónica</li>
<li>Define <strong>18 identificadores</strong> que hacen que la información sea PHI</li>
<li>Usos y divulgaciones permitidos sin autorización: <strong>TPO</strong> (Tratamiento, Pago, Operaciones sanitarias)</li></ul>
<h3>Derechos del Paciente bajo HIPAA</h3>
<ul><li>Acceder y obtener copia de su PHI</li>
<li>Solicitar corrección de información incorrecta</li>
<li>Solicitar restricciones en el uso de su PHI</li>
<li>Recibir un aviso de prácticas de privacidad</li>
<li>Presentar quejas ante el proveedor o el HHS OCR</li></ul>
<h3>Regla de Seguridad HIPAA (ePHI)</h3>
<ul><li>Aplica únicamente a <strong>ePHI</strong> (PHI en formato electrónico)</li>
<li><strong>Salvaguardas administrativas:</strong> políticas de seguridad, capacitación, oficial de privacidad</li>
<li><strong>Salvaguardas físicas:</strong> control de acceso a instalaciones, servidores protegidos</li>
<li><strong>Salvaguardas técnicas:</strong> encriptación, contraseñas, registros de auditoría de acceso</li></ul>` },

  { sort:7, section:'HIPAA Y PRIVACIDAD DEL PACIENTE', type:'presentation', title:'HIPAA y la Privacidad del Paciente',
    pptxKey:'hipaa', pptxTitle:'HIPAA y la Privacidad del Paciente', pptxSub:'PHI, incumplimientos y sanciones',
    pptxBullets:[
      { heading:'Los 18 Identificadores PHI', points:['Nombre, dirección, fechas (nacimiento, alta, muerte, etc.)','SSN, número de teléfono, fax, correo electrónico','Número de cuenta, número de beneficiario de seguro','Número de expediente, certificado o licencia, número de vehículo','URL web, dirección IP, identificadores biométricos, foto de cara completa'] },
      { heading:'Regla de Notificación de Incumplimiento HIPAA', points:['Notificación individual: sin demora injustificada, máximo 60 días','Notificación a medios: si afecta 500+ en un estado, simultánea con individual','Notificación al HHS: anual si < 500 personas; simultánea si 500+','Qué notificar: naturaleza, PHI involucrada, quién accedió, mitigación'] },
      { heading:'Sanciones HIPAA por Categoría', points:['Cat. 1 (desconocida): $100–$50,000 por violación','Cat. 2 (causa razonable): $1,000–$50,000','Cat. 3 (descuido intencional, corregida): $10,000–$50,000','Cat. 4 (descuido intencional, no corregida): $50,000 mínimo','Sanciones penales: hasta $250,000 y 10 años de prisión'] },
    ]
  },

  { sort:8, section:'HIPAA Y PRIVACIDAD DEL PACIENTE', type:'text', title:'Registros Médicos y Gestión de la Información',
    content:`<h2>Registros Médicos y Gestión de la Información de Salud</h2>
<h3>Propiedad de los Registros Médicos</h3>
<ul><li>El expediente físico o electrónico es propiedad del proveedor o instalación médica</li>
<li>El paciente tiene derecho a acceder y obtener copia de la información contenida</li>
<li>El proveedor puede cobrar una tarifa razonable por copias</li></ul>
<h3>Derechos de Acceso del Paciente</h3>
<ul><li>Derecho a inspeccionar y obtener copia de su PHI en el expediente clínico</li>
<li>El proveedor debe responder dentro de 30 días (extensión de 30 días adicionales posible)</li>
<li>Excepciones limitadas: notas psicoterapéuticas, información para litigio, seguridad institucional</li></ul>
<h3>Tiempo de Retención de Registros</h3>
<ul><li><strong>Adultos:</strong> mínimo 7 años desde la última visita (varía por estado)</li>
<li><strong>Menores:</strong> hasta la mayoría de edad (18 años) más 3 años, o mínimo 7 años</li>
<li><strong>HIPAA:</strong> requiere retención de políticas de privacidad por 6 años</li></ul>
<h3>Subpoenas y Órdenes Judiciales</h3>
<ul><li><strong>Subpoena de registros:</strong> orden legal para producir documentos — generalmente requiere notificación al paciente</li>
<li><strong>Orden judicial (court order):</strong> orden de un juez — debe cumplirse sin necesidad de autorización del paciente</li>
<li>Las solicitudes de terceros (abogados, empleadores) requieren autorización escrita del paciente</li></ul>
<h3>Corrección de Errores en Registros</h3>
<ul><li>Nunca borrar, tachar con corrector ni eliminar entradas</li>
<li>En papel: trazar una línea simple, iniciales, fecha y razón de la corrección</li>
<li>En electrónico: el sistema debe mantener el registro original con la corrección y auditoría</li></ul>` },

  { sort:9, section:'HIPAA Y PRIVACIDAD DEL PACIENTE', type:'text', title:'Tecnología y Privacidad en la Era Digital',
    content:`<h2>Tecnología y Privacidad en la Atención Médica Digital</h2>
<h3>Registros Médicos Electrónicos (EHR/EMR)</h3>
<ul><li><strong>EMR (Registro Médico Electrónico):</strong> versión digital del expediente de papel de una práctica específica</li>
<li><strong>EHR (Registro Electrónico de Salud):</strong> incluye información de múltiples proveedores y puede compartirse</li>
<li>La Ley HITECH (2009) incentivó la adopción de EHR mediante el programa Meaningful Use</li></ul>
<h3>Certificación Meaningful Use</h3>
<ul><li>Etapa 1: captura y compartición de datos básicos</li>
<li>Etapa 2: avance en los procesos clínicos</li>
<li>Etapa 3: mejora de resultados de salud</li>
<li>Los proveedores que no cumplen pueden recibir penalizaciones en pagos de Medicare</li></ul>
<h3>Intercambio de Información de Salud (HIE)</h3>
<ul><li>Permite compartir ePHI entre organizaciones de salud de forma segura</li>
<li>Tipos: dirigido (punto a punto), de consulta (pull), de consumidor (acceso del paciente)</li>
<li>Rige por las mismas protecciones HIPAA que cualquier ePHI</li></ul>
<h3>Seguridad Cibernética en Salud</h3>
<ul><li>Ransomware, phishing y violaciones de datos son amenazas crecientes</li>
<li>Los proveedores deben tener planes de contingencia y recuperación de desastres</li>
<li>Capacitación regular del personal sobre phishing y uso seguro de contraseñas</li></ul>
<h3>Teleterapia y Telemedicina</h3>
<ul><li>Las mismas reglas HIPAA aplican a consultas virtuales</li>
<li>Plataformas de video deben ser conformes con HIPAA (BAA requerido)</li>
<li>El consentimiento informado debe incluir la naturaleza y limitaciones del servicio virtual</li></ul>` },

  { sort:10, section:'HIPAA Y PRIVACIDAD DEL PACIENTE', type:'quiz', title:'Quiz 2: HIPAA y Privacidad del Paciente',
    quizKey:'q2' },

  // SECTION 3 — ÉTICA MÉDICA
  { sort:11, section:'ÉTICA MÉDICA', type:'text', title:'Principios de la Ética Médica',
    content:`<h2>Principios Fundamentales de la Ética Médica</h2>
<p>La ética médica es el conjunto de principios morales que guían la práctica profesional en salud. A diferencia del derecho, la ética se ocupa de lo que es correcto y no solo de lo que es legal.</p>
<h3>Los 4 Principios Bioéticos (Beauchamp y Childress)</h3>
<ul><li><strong>Autonomía:</strong> derecho del paciente a tomar decisiones sobre su propio cuerpo y tratamiento; requiere consentimiento informado real</li>
<li><strong>Beneficencia:</strong> obligación de actuar en el mejor interés del paciente; hacer el bien activamente</li>
<li><strong>No maleficencia:</strong> "primero no hacer daño" — evitar acciones que perjudiquen al paciente</li>
<li><strong>Justicia:</strong> distribución equitativa de recursos y tratamiento justo para todos los pacientes</li></ul>
<h3>Código de Ética de la AMA</h3>
<ul><li>Principios rectores para la práctica médica en EE.UU.</li>
<li>Incluye obligaciones hacia pacientes, colegas, profesión y sociedad</li>
<li>No tiene fuerza legal directa, pero orienta las juntas médicas estatales</li></ul>
<h3>Ética vs. Ley</h3>
<ul><li>Lo que es legal puede no ser ético, y viceversa</li>
<li>Ejemplo ético pero no legal: revelar diagnóstico terminal sin consentimiento del paciente</li>
<li>Ejemplo legal pero no ético: facturar el máximo permitido sin necesidad médica real</li></ul>
<h3>Dilemas Éticos Comunes</h3>
<ul><li>Inicio y fin de la vida (aborto, eutanasia, soporte vital)</li>
<li>Distribución de órganos y recursos escasos</li>
<li>Confidencialidad vs. seguridad pública</li>
<li>Conflictos entre autonomía del paciente y beneficencia médica</li></ul>
<h3>Comités de Ética Hospitalaria</h3>
<ul><li>Asesoran en casos con dilemas éticos complejos</li>
<li>Compuestos por médicos, enfermeras, trabajadores sociales, abogados, capellanes y representantes comunitarios</li>
<li>No toman decisiones vinculantes, pero brindan orientación estructurada</li></ul>` },

  { sort:12, section:'ÉTICA MÉDICA', type:'presentation', title:'Ética en la Atención Médica',
    pptxKey:'etica', pptxTitle:'Ética en la Atención Médica', pptxSub:'Principios, dilemas y toma de decisiones',
    pptxBullets:[
      { heading:'Los 4 Principios Bioéticos', points:['Autonomía: respetar el derecho del paciente a decidir sobre su propio cuidado','Beneficencia: actuar activamente en el mejor interés del paciente','No maleficencia: evitar causar daño — "primero no dañar"','Justicia: tratar a todos equitativamente y distribuir recursos de forma justa'] },
      { heading:'Dilemas Éticos Comunes', points:['Inicio de la vida: fertilización in vitro, selección genética, aborto','Fin de la vida: soporte vital, eutanasia, órdenes DNR, hospicio','Distribución de recursos: trasplante de órganos, cuidados intensivos','Investigación: ensayos clínicos, uso de placebo, poblaciones vulnerables'] },
      { heading:'Toma de Decisiones Éticas', points:['Paso 1: Identificar el problema ético y los valores en conflicto','Paso 2: Recopilar toda la información clínica y de contexto relevante','Paso 3: Identificar las opciones disponibles y sus consecuencias','Paso 4: Consultar al comité de ética si el dilema es complejo','Paso 5: Tomar la decisión y documentarla adecuadamente'] },
    ]
  },

  { sort:13, section:'ÉTICA MÉDICA', type:'text', title:'Ética al Final de la Vida',
    content:`<h2>Ética al Final de la Vida</h2>
<h3>Directivas Anticipadas</h3>
<ul><li>Documentos legales que expresan las preferencias del paciente cuando ya no puede comunicarse</li>
<li>La Ley de Autodeterminación del Paciente (PSDA, 1990) requiere que instalaciones con fondos federales informen a pacientes sobre sus derechos</li></ul>
<h3>Testamento Vital (Living Will)</h3>
<ul><li>Especifica qué tratamientos desea o rechaza el paciente en situaciones terminales</li>
<li>Ejemplos: rechazo de ventilación mecánica, hidratación artificial, reanimación cardiopulmonar</li>
<li>Válido en todos los estados, aunque los requisitos formales varían</li></ul>
<h3>Poder Notarial Duradero para Salud (DPAHC)</h3>
<ul><li>Designa a un agente para tomar decisiones médicas cuando el paciente es incapaz</li>
<li>"Duradero" significa que permanece válido incluso si el paciente queda incapacitado</li>
<li>El agente debe actuar conforme a los deseos conocidos del paciente</li></ul>
<h3>Órdenes DNR y DNI</h3>
<ul><li><strong>DNR (Do Not Resuscitate):</strong> no reanimar en caso de paro cardíaco</li>
<li><strong>DNI (Do Not Intubate):</strong> no intubar para soporte respiratorio</li>
<li>Deben estar claramente documentadas en el expediente y accesibles al equipo médico</li></ul>
<h3>Cuidados Paliativos vs. Hospicio</h3>
<ul><li><strong>Cuidados paliativos:</strong> alivio del dolor y síntomas; puede combinarse con tratamiento curativo en cualquier etapa</li>
<li><strong>Hospicio:</strong> cuidados de confort para pacientes con pronóstico de vida menor a 6 meses; renuncia a tratamiento curativo</li></ul>
<h3>Principio del Doble Efecto y Eutanasia</h3>
<ul><li><strong>Principio del doble efecto:</strong> una acción con un efecto bueno y uno malo puede ser ética si la intención es el bien (p. ej., morfina para aliviar dolor aunque acelere la muerte)</li>
<li><strong>Eutanasia activa:</strong> acto directo para causar la muerte — ilegal en casi todos los estados</li>
<li><strong>Muerte con dignidad (suicidio asistido médicamente):</strong> legal en Oregon, California, Washington y otros estados con requisitos estrictos</li></ul>` },

  { sort:14, section:'ÉTICA MÉDICA', type:'text', title:'Ética en la Investigación y Casos Especiales',
    content:`<h2>Ética en la Investigación Médica y Casos Especiales</h2>
<h3>Hitos Históricos de la Ética en Investigación</h3>
<ul><li><strong>Código de Nuremberg (1947):</strong> surgió tras los juicios de Nuremberg; establece que el consentimiento voluntario del sujeto humano es absolutamente esencial</li>
<li><strong>Declaración de Helsinki (1964, AMM):</strong> guía ética para investigación médica con seres humanos; prioriza el bienestar del participante sobre los intereses científicos</li>
<li><strong>Informe Belmont (1979):</strong> respuesta al escándalo Tuskegee; establece tres principios: respeto por las personas, beneficencia y justicia</li></ul>
<h3>IRB — Junta de Revisión Institucional</h3>
<ul><li>Comité que supervisa toda investigación con seres humanos en instituciones con fondos federales</li>
<li>Revisa protocolos para garantizar protección de participantes</li>
<li>Puede aprobar, modificar, suspender o terminar estudios</li>
<li>Requiere revisión continua durante el estudio</li></ul>
<h3>Consentimiento Informado en Investigación</h3>
<ul><li>Debe incluir: propósito, duración, procedimientos, riesgos, beneficios, alternativas y confidencialidad</li>
<li>Debe ser voluntario y sin coacción</li>
<li>Participantes pueden retirarse en cualquier momento sin penalización</li></ul>
<h3>Casos Éticos Especiales</h3>
<ul><li><strong>Reproducción asistida:</strong> dilemas sobre embriones congelados, maternidad subrogada, selección genética</li>
<li><strong>Trasplante de órganos:</strong> criterios de asignación (UNOS), definición de muerte cerebral, donación de vivos vs. fallecidos</li>
<li><strong>Genética:</strong> pruebas genéticas predictivas, privacidad genética (GINA), edición genética (CRISPR)</li></ul>` },

  { sort:15, section:'ÉTICA MÉDICA', type:'quiz', title:'Quiz 3: Ética Médica',
    quizKey:'q3' },

  // SECTION 4 — NEGLIGENCIA Y RESPONSABILIDAD MÉDICA
  { sort:16, section:'NEGLIGENCIA Y RESPONSABILIDAD MÉDICA', type:'text', title:'Malpractice Médico y Negligencia',
    content:`<h2>Malpractice Médico y Negligencia</h2>
<h3>Definición de Malpractice</h3>
<p>El malpractice médico es la forma más común de responsabilidad profesional en salud. Ocurre cuando un proveedor de salud no cumple con el estándar de cuidado aceptado para su especialidad y geografía, causando daño al paciente.</p>
<h3>Los 4 Elementos de la Negligencia</h3>
<ul><li><strong>Deber (Duty):</strong> existía relación médico-paciente que creó obligación legal de cuidar</li>
<li><strong>Incumplimiento (Breach):</strong> el proveedor actuó por debajo del estándar de cuidado</li>
<li><strong>Causalidad (Causation):</strong> el incumplimiento fue la causa próxima del daño sufrido</li>
<li><strong>Daños (Damages):</strong> el paciente sufrió daño real y demostrable</li></ul>
<h3>Tipos de Daños</h3>
<ul><li><strong>Daños compensatorios especiales:</strong> gastos médicos, pérdida de ingresos, gastos futuros</li>
<li><strong>Daños compensatorios generales:</strong> dolor y sufrimiento, angustia emocional, pérdida de disfrute de vida</li>
<li><strong>Daños punitivos:</strong> castigo por conducta especialmente reprensible o maliciosa; no compensan sino que disuaden</li></ul>
<h3>Statute of Limitations</h3>
<ul><li>Plazo legal para presentar una demanda de malpractice (varía por estado, típicamente 2-3 años)</li>
<li>La "discovery rule" puede extender el plazo si el daño no se descubrió inmediatamente</li>
<li>Para menores, generalmente comienza al cumplir 18 años</li></ul>
<h3>Tort Reform y Seguros de Responsabilidad</h3>
<ul><li>Tort reform: reformas legales para limitar demandas o montos de daños punitivos</li>
<li>Seguros de responsabilidad médica (malpractice insurance): protegen al proveedor ante reclamaciones</li>
<li>El NPDB (National Practitioner Data Bank) registra pagos por malpractice y acciones disciplinarias</li></ul>` },

  { sort:17, section:'NEGLIGENCIA Y RESPONSABILIDAD MÉDICA', type:'presentation', title:'Responsabilidad y Gestión de Riesgos',
    pptxKey:'responsabilidad', pptxTitle:'Responsabilidad y Gestión de Riesgos', pptxSub:'Tipos de responsabilidad, riesgos y documentación',
    pptxBullets:[
      { heading:'Tipos de Responsabilidad Médica', points:['Negligencia: incumplimiento del estándar de cuidado con daño','Asalto (assault): amenaza de contacto no deseado (sin tocarlo)','Batería (battery): contacto físico intencional sin consentimiento','Difamación (defamation): declaraciones falsas que dañan la reputación','Invasión de privacidad: divulgación no autorizada de PHI'] },
      { heading:'Gestión de Riesgos', points:['Identificación: reconocer eventos potencialmente dañinos o peligrosos','Análisis: evaluar probabilidad e impacto de cada riesgo identificado','Control: implementar medidas para eliminar o reducir los riesgos','Monitoreo: evaluar continuamente la efectividad de las medidas implementadas'] },
      { heading:'Documentación para Protección Legal', points:['Notas detalladas, objetivas y contemporáneas al servicio','Nunca borrar, alterar ni agregar notas retroactivas no identificadas','Documentar rechazos de tratamiento y educación al paciente','Registrar comunicaciones con el paciente y su familia','Documentar el razonamiento clínico detrás de las decisiones'] },
    ]
  },

  { sort:18, section:'NEGLIGENCIA Y RESPONSABILIDAD MÉDICA', type:'text', title:'Gestión de Riesgos y Seguros de Responsabilidad',
    content:`<h2>Gestión de Riesgos y Seguros de Responsabilidad Médica</h2>
<h3>Función del Gerente de Riesgos</h3>
<ul><li>Identificar, analizar y mitigar riesgos que puedan causar daño o responsabilidad legal</li>
<li>Desarrollar políticas y procedimientos de seguridad</li>
<li>Capacitar al personal en prácticas de reducción de riesgos</li>
<li>Coordinar investigaciones de incidentes y eventos adversos</li></ul>
<h3>Análisis Causa-Raíz (RCA)</h3>
<ul><li>Metodología para identificar las causas fundamentales de eventos adversos</li>
<li>No busca culpables sino fallas sistémicas que se pueden corregir</li>
<li>Resultado: plan de acción correctiva documentado</li></ul>
<h3>Eventos Centinela</h3>
<ul><li>Evento adverso grave, inesperado, que resulta en muerte, lesión grave o riesgo de ello</li>
<li>La Joint Commission requiere RCA para todos los eventos centinela</li>
<li>Ejemplos: cirugía en sitio equivocado, suicidio de paciente hospitalizado, instrumento quirúrgico olvidado</li></ul>
<h3>Reporte de Incidentes</h3>
<ul><li>Informe interno de cualquier evento adverso, cuasi-error o situación insegura</li>
<li>No forma parte del expediente clínico del paciente</li>
<li>Protegido de divulgación en la mayoría de los estados bajo privilegio de calidad</li></ul>
<h3>Tipos de Seguros de Responsabilidad</h3>
<ul><li><strong>Occurrence:</strong> cubre incidentes ocurridos durante la vigencia de la póliza, aunque la reclamación se presente después de que venza</li>
<li><strong>Claims-made:</strong> cubre reclamaciones presentadas mientras la póliza está vigente; requiere "tail coverage" al vencer</li>
<li><strong>Tail coverage:</strong> extiende la cobertura claims-made para reclamaciones futuras de incidentes pasados</li></ul>
<h3>NPDB — National Practitioner Data Bank</h3>
<ul><li>Base de datos federal de pagos por malpractice y acciones disciplinarias contra proveedores</li>
<li>Hospitales deben consultar el NPDB antes de otorgar privilegios médicos</li>
<li>Los proveedores deben ser reportados dentro de 30 días de un pago por malpractice</li></ul>` },

  { sort:19, section:'NEGLIGENCIA Y RESPONSABILIDAD MÉDICA', type:'text', title:'Resolución de Disputas y Litigio',
    content:`<h2>Resolución de Disputas Médicas y Proceso de Litigio</h2>
<h3>Métodos Alternativos de Resolución de Disputas</h3>
<ul><li><strong>Mediación:</strong> un mediador neutral facilita la negociación entre las partes; no vinculante</li>
<li><strong>Arbitraje:</strong> un árbitro neutral toma una decisión; puede ser vinculante o no vinculante</li>
<li>Ambos son más rápidos y económicos que el litigio formal</li></ul>
<h3>Proceso de Litigio por Malpractice</h3>
<ul><li>Notificación de intención de demanda (requerida en muchos estados)</li>
<li>Presentación de la demanda (complaint) y respuesta del demandado</li>
<li>Descubrimiento (discovery): intercambio de evidencia, deposiciones</li>
<li>Mociones previas al juicio y posible asentamiento</li>
<li>Juicio: prueba ante juez o jurado</li></ul>
<h3>El Perito Médico (Expert Witness)</h3>
<ul><li>Testifica sobre el estándar de cuidado aplicable al caso</li>
<li>Debe tener la misma especialidad o similar al demandado</li>
<li>Puede ser llamado por cualquiera de las partes</li></ul>
<h3>Asentamientos Fuera de Corte</h3>
<ul><li>La mayoría de los casos de malpractice se resuelven sin juicio</li>
<li>El asentamiento no implica admisión de culpabilidad</li>
<li>Cualquier pago por asentamiento debe reportarse al NPDB</li></ul>
<h3>Impacto en la Licencia Médica</h3>
<ul><li>Las juntas médicas estatales pueden investigar y sancionar a proveedores tras condenas o múltiples reclamaciones</li>
<li>Sanciones posibles: amonestación, restricción de licencia, suspensión, revocación</li>
<li>Las juntas consultan el NPDB al renovar privilegios o licencias</li></ul>` },

  { sort:20, section:'NEGLIGENCIA Y RESPONSABILIDAD MÉDICA', type:'quiz', title:'Quiz 4: Negligencia y Responsabilidad',
    quizKey:'q4' },

  // SECTION 5 — CUMPLIMIENTO REGULATORIO
  { sort:21, section:'CUMPLIMIENTO REGULATORIO', type:'text', title:'Regulaciones Federales y Estatales en Salud',
    content:`<h2>Regulaciones Federales y Estatales en el Sector Salud</h2>
<h3>CMS y Regulaciones de Medicare/Medicaid</h3>
<ul><li>CMS (Centros de Medicare y Medicaid) administra los programas Medicare, Medicaid y CHIP</li>
<li>Establece Condiciones de Participación (CoP) para hospitales, hospicios y hogares de cuidado</li>
<li>EMTALA: requiere evaluación y estabilización de emergencias sin importar capacidad de pago</li></ul>
<h3>OSHA para Proveedores de Salud</h3>
<ul><li>Bloodborne Pathogens Standard: protege a trabajadores de exposición a sangre y fluidos</li>
<li>Hazard Communication: requiere etiquetado de químicos peligrosos (SDS)</li>
<li>Respiratory Protection: protocolos para trabajadores expuestos a patógenos aéreos</li></ul>
<h3>CLIA — Clinical Laboratory Improvement Amendments</h3>
<ul><li>Regula todos los laboratorios clínicos que procesan muestras humanas</li>
<li>Tres niveles: pruebas waived, de complejidad moderada y de alta complejidad</li>
<li>Certificación requerida para operar; administrado por CMS en conjunto con FDA y CDC</li></ul>
<h3>DEA — Drug Enforcement Administration</h3>
<ul><li>Regula la prescripción y dispensación de medicamentos controlados (Schedule I-V)</li>
<li>Requiere número de registro DEA para prescribir sustancias controladas</li>
<li>Auditorías de registros de dispensación y recetas</li></ul>
<h3>FDA — Food and Drug Administration</h3>
<ul><li>Aprueba medicamentos, dispositivos médicos y biológicos</li>
<li>Regula el marketing y etiquetado de productos médicos</li>
<li>Sistema de reporte de eventos adversos (FAERS, MAUDE)</li></ul>
<h3>Acreditaciones</h3>
<ul><li><strong>Joint Commission (TJC):</strong> acreditación voluntaria más reconocida para hospitales y organizaciones de salud</li>
<li><strong>NCQA:</strong> acreditación para planes de salud y organizaciones de cuidado gestionado</li>
<li><strong>AAAHC:</strong> acreditación para centros ambulatorios y clínicas</li></ul>` },

  { sort:22, section:'CUMPLIMIENTO REGULATORIO', type:'presentation', title:'OSHA y Seguridad en el Lugar de Trabajo',
    pptxKey:'osha', pptxTitle:'OSHA y Seguridad en el Lugar de Trabajo', pptxSub:'Estándares, patógenos y derechos del empleado',
    pptxBullets:[
      { heading:'Estándares OSHA para Salud', points:['Bloodborne Pathogens Standard: patógenos en sangre y fluidos corporales','Hazard Communication Standard: etiquetado GHS y hojas SDS','Respiratory Protection: N95, mascarillas y procedimientos de ajuste','Emergency Action Plan: evacuación, rutas de salida, puntos de reunión'] },
      { heading:'Prevención de Exposición a Patógenos de Transmisión Sanguínea', points:['Precauciones universales: tratar toda sangre/fluido como infeccioso','EPP requerido: guantes, batas, mascarillas, protección ocular','Agujas de seguridad y contenedores rígidos para objetos punzantes','Protocolo post-exposición: reporte inmediato, evaluación médica, profilaxis'] },
      { heading:'Derechos del Empleado bajo OSHA', points:['Derecho a un lugar de trabajo seguro libre de peligros reconocidos','Derecho a recibir información sobre peligros y capacitación','Derecho a reportar condiciones inseguras sin represalias','Derecho a solicitar inspección de OSHA de forma confidencial'] },
    ]
  },

  { sort:23, section:'CUMPLIMIENTO REGULATORIO', type:'text', title:'Ley Stark y Ley Anti-Soborno',
    content:`<h2>Ley Stark y Ley Anti-Soborno (Anti-Kickback Statute)</h2>
<h3>Ley Stark (Physician Self-Referral Law)</h3>
<ul><li>Prohíbe a los médicos referir pacientes de Medicare/Medicaid a entidades en las que el médico (o familiar inmediato) tiene un interés financiero</li>
<li>Aplica a "servicios de salud designados" (DHS): laboratorios, radiología, fisioterapia, equipos médicos duraderos, entre otros</li>
<li>Es una ley de responsabilidad estricta: no requiere intención; la violación por sí misma es ilegal</li></ul>
<h3>Excepciones a la Ley Stark</h3>
<ul><li>Servicios médicos en consultorio (in-office ancillary services)</li>
<li>Arreglos de compensación de valor justo de mercado</li>
<li>Servicios de hospitales rurales</li>
<li>Excepciones de bona fide employment</li></ul>
<h3>Sanciones de la Ley Stark</h3>
<ul><li>Exclusión de Medicare/Medicaid</li>
<li>Reembolso de pagos recibidos</li>
<li>Sanciones civiles hasta $15,000 por servicio y $100,000 por acuerdo ilegal</li>
<li>Solo responsabilidad civil — no penal</li></ul>
<h3>Ley Anti-Soborno (Anti-Kickback Statute, AKS)</h3>
<ul><li>Prohíbe ofrecer, pagar, solicitar o recibir cualquier remuneración a cambio de referencias de pacientes de programas federales</li>
<li>A diferencia de Stark, requiere intención — es una ley de intención criminal</li>
<li>Aplica más ampliamente: no solo médicos, incluye hospitales, farmacéuticas, fabricantes</li></ul>
<h3>Safe Harbors de la Ley Anti-Soborno</h3>
<ul><li>Prácticas específicas de compensación que están exentas de la prohibición</li>
<li>Ejemplos: descuentos genuinos, arreglos de espacio/equipo a valor de mercado, relaciones de empleo bona fide</li>
<li>Sanciones: civiles Y penales — multas, exclusión y hasta 10 años de prisión</li></ul>` },

  { sort:24, section:'CUMPLIMIENTO REGULATORIO', type:'quiz', title:'Quiz 5: Cumplimiento Regulatorio',
    quizKey:'q5' },

  // SECTION 6 — PREPARACIÓN PARA EL EXAMEN MLE
  { sort:25, section:'PREPARACIÓN PARA EL EXAMEN MLE', type:'text', title:'Guía de Estudio para el Examen MLE',
    content:`<h2>Guía de Estudio: Examen MLE de NHA</h2>
<h3>Estructura del Examen MLE</h3>
<ul><li>100 preguntas en total (con puntaje)</li>
<li>Tiempo: 2.5 horas</li>
<li>Formato: opción múltiple</li>
<li>Puntaje mínimo aprobatorio: 390/500</li></ul>
<h3>Dominios del Examen MLE</h3>
<ul><li><strong>Derecho Sanitario (30%):</strong> fuentes del derecho, relación médico-paciente, consentimiento, directivas anticipadas, tipos de responsabilidad</li>
<li><strong>Ética Médica (25%):</strong> principios bioéticos, dilemas éticos, ética al final de la vida, ética en investigación</li>
<li><strong>Registros y Privacidad (20%):</strong> HIPAA, PHI, registros médicos, tecnología, privacidad</li>
<li><strong>Responsabilidad Médica (15%):</strong> malpractice, elementos de negligencia, gestión de riesgos, seguros, NPDB</li>
<li><strong>Regulaciones (10%):</strong> CMS, OSHA, CLIA, DEA, Ley Stark, Anti-Soborno, acreditaciones</li></ul>
<h3>Estrategias de Estudio</h3>
<ul><li>Memorice los 4 elementos de la negligencia: deber, incumplimiento, causalidad, daños</li>
<li>Comprenda la diferencia entre Ley Stark (civil) y Anti-Soborno (civil y penal)</li>
<li>Repase los 18 identificadores PHI y los 4 principios bioéticos</li>
<li>Estudie directivas anticipadas: testamento vital vs. poder notarial duradero</li>
<li>Practique preguntas de casos clínicos con dilemas éticos</li></ul>
<h3>El Día del Examen</h3>
<ul><li>Llegue 30 minutos antes al centro de pruebas</li>
<li>Traiga identificación con foto vigente</li>
<li>Lea cada pregunta completamente antes de elegir su respuesta</li>
<li>Marque las preguntas difíciles y regrese a ellas al final</li></ul>` },

  { sort:26, section:'PREPARACIÓN PARA EL EXAMEN MLE', type:'presentation', title:'Estrategia para el Examen MLE',
    pptxKey:'exam-prep', pptxTitle:'Estrategia para el Examen MLE', pptxSub:'Dominios, conceptos clave y plan de estudio',
    pptxBullets:[
      { heading:'Dominios del Examen MLE', points:['Derecho Sanitario 30% — mayor peso, enfoque principal','Ética Médica 25% — principios bioéticos y dilemas','Registros y Privacidad 20% — HIPAA y gestión de información','Responsabilidad Médica 15% — malpractice y gestión de riesgos','Regulaciones 10% — Stark, Anti-Soborno, OSHA, CLIA'] },
      { heading:'Conceptos Más Evaluados', points:['HIPAA: 18 PHI identificadores, regla de privacidad, sanciones por categoría','Consentimiento informado: elementos, excepciones, poblaciones especiales','Negligencia: los 4 elementos (deber, incumplimiento, causalidad, daños)','Ley Stark vs. Anti-Soborno: diferencias clave, safe harbors','Directivas anticipadas: living will, DPAHC, órdenes DNR'] },
      { heading:'Plan de Estudio Final (2 semanas)', points:['Semana 1, días 1-3: Derecho sanitario y consentimiento informado','Semana 1, días 4-7: HIPAA, privacidad y registros médicos','Semana 2, días 1-3: Ética médica y fin de vida','Semana 2, días 4-5: Negligencia, responsabilidad y gestión de riesgos','Semana 2, días 6-7: Regulaciones + exámenes de práctica completos'] },
    ]
  },

  { sort:27, section:'PREPARACIÓN PARA EL EXAMEN MLE', type:'quiz', title:'Evaluación Final: Examen de Práctica MLE',
    quizKey:'final' },
];

const quizzes = {
  q1: [
    { q:'¿Cuáles son los 4 elementos necesarios para probar negligencia médica?', options:['Deber, incumplimiento, causalidad y daños','Intención, acción, resultado y daño','Acto, omisión, perjuicio y pérdida','Dolo, culpa, nexo y pena'], answer:0 },
    { q:'¿Qué doctrina legal significa "la cosa habla por sí misma" y se aplica cuando la negligencia es evidente?', options:['Respondeat Superior','Res Ipsa Loquitur','Stare Decisis','Habeas Corpus'], answer:1 },
    { q:'¿Cuál es el elemento del consentimiento informado que requiere que el médico explique los riesgos del procedimiento?', options:['Capacidad legal','Voluntariedad','Divulgación de información','Forma escrita'], answer:2 },
    { q:'Las directivas anticipadas incluyen:', options:['Solo el testamento vital','Solo el poder notarial para salud','El testamento vital y el poder notarial duradero para salud','Solo las órdenes DNR'], answer:2 },
    { q:'¿Qué principio legal hace responsable al empleador por los actos negligentes de sus empleados durante el trabajo?', options:['Res Ipsa Loquitur','Respondeat Superior','Stare Decisis','Quid Pro Quo'], answer:1 },
  ],
  q2: [
    { q:'¿Cuántos identificadores reconoce HIPAA como PHI?', options:['10','14','18','22'], answer:2 },
    { q:'La Regla de Seguridad HIPAA aplica a:', options:['Toda información médica','Solo PHI en papel','Solo ePHI (PHI electrónica)','Información verbal solamente'], answer:2 },
    { q:'¿Por cuánto tiempo deben retenerse los registros médicos de adultos según las pautas federales?', options:['3 años','5 años','7 años','10 años'], answer:2 },
    { q:'¿Cuál de los siguientes es un uso PERMITIDO de PHI sin autorización del paciente bajo HIPAA?', options:['Mercadotecnia a terceros','Venta de datos a farmacéuticas','Tratamiento, pago y operaciones sanitarias (TPO)','Investigación sin supervisión IRB'], answer:2 },
    { q:'Una violación HIPAA de Categoría 4 (descuido intencional no corregido) tiene una sanción mínima de:', options:['$100','$1,000','$10,000','$50,000'], answer:3 },
  ],
  q3: [
    { q:'¿Cuál principio bioético se refiere a respetar el derecho del paciente a tomar sus propias decisiones?', options:['Beneficencia','Autonomía','No maleficencia','Justicia'], answer:1 },
    { q:'El principio de "no maleficencia" en la ética médica significa:', options:['Hacer el bien al paciente','Distribuir recursos equitativamente','No causar daño al paciente','Respetar la decisión del paciente'], answer:2 },
    { q:'¿Qué documento federal estableció los principios éticos para investigación con seres humanos?', options:['Código de Nuremberg','Informe Belmont','Declaración de Helsinki','Informe Tuskegee'], answer:1 },
    { q:'Los cuidados de hospicio se enfocan en:', options:['Curar la enfermedad terminal','Proporcionar comodidad y calidad de vida al final de la vida','Realizar todos los procedimientos posibles','Transferir al paciente a unidad de cuidados intensivos'], answer:1 },
    { q:'¿Qué organismo supervisa la investigación ética en instituciones que reciben fondos federales?', options:['FDA','CDC','IRB (Junta de Revisión Institucional)','AMA'], answer:2 },
  ],
  q4: [
    { q:'¿Qué tipo de daños en un caso de malpractice se otorgan para castigar al demandado por conducta especialmente reprensible?', options:['Daños compensatorios','Daños nominales','Daños punitivos','Daños especiales'], answer:2 },
    { q:'El NPDB (National Practitioner Data Bank) recopila información sobre:', options:['Todos los médicos que se gradúan','Pagos por malpractice y acciones disciplinarias contra proveedores','Tasas de mortalidad hospitalaria','Resultados de exámenes de certificación'], answer:1 },
    { q:'¿Cuál es la diferencia entre seguro de responsabilidad "occurrence" vs. "claims-made"?', options:['No hay diferencia práctica','Occurrence cubre incidentes durante la vigencia aunque la reclamación sea posterior; claims-made requiere que ambos ocurran durante la vigencia','Claims-made es siempre más caro','Occurrence solo cubre hospitales'], answer:1 },
    { q:'Una orden de subpoena para registros médicos:', options:['Puede ignorarse si el médico lo decide','Requiere la firma del paciente para cumplirse','Es una orden legal que debe cumplirse, generalmente con aviso al paciente','Solo aplica a casos criminales'], answer:2 },
    { q:'¿Qué es un "evento centinela" en gestión de riesgos hospitalarios?', options:['Un evento adverso grave que señala necesidad de investigación inmediata','Una auditoría rutinaria de calidad','Un reconocimiento positivo al personal','Un ejercicio de simulacro de emergencia'], answer:0 },
  ],
  q5: [
    { q:'¿Qué ley federal prohíbe la auto-referencia de médicos con interés financiero en la entidad a la que refieren?', options:['Ley Anti-Soborno','Ley HIPAA','Ley Stark','Ley EMTALA'], answer:2 },
    { q:'CLIA (Clinical Laboratory Improvement Amendments) regula:', options:['Los hospitales en general','Los laboratorios clínicos que procesan muestras humanas','Solo los laboratorios de investigación','Las farmacias y distribuidores de medicamentos'], answer:1 },
    { q:'¿Qué estándar OSHA requiere que los empleadores de salud protejan a los trabajadores de exposición a patógenos de transmisión sanguínea?', options:['Bloodborne Pathogens Standard','Hazard Communication Standard','Respiratory Protection Standard','Emergency Exit Standard'], answer:0 },
    { q:'La Joint Commission es:', options:['Una agencia gubernamental federal','Un organismo de acreditación voluntaria para hospitales y organizaciones de salud','El departamento de Medicare y Medicaid','Una asociación de médicos especialistas'], answer:1 },
    { q:'Los "safe harbors" de la Ley Anti-Soborno son:', options:['Violaciones menores que no se penalizan','Prácticas de compensación específicas que están exentas de la prohibición','Acuerdos con compañías de seguros','Contratos entre hospitales y médicos'], answer:1 },
  ],
  final: [
    { q:'¿Cuál es el primer elemento necesario para establecer negligencia médica?', options:['Daño económico','Deber de cuidado','Intención de dañar','Violación de privacidad'], answer:1 },
    { q:'¿Qué significa HIPAA?', options:['Health Insurance Portability and Accountability Act','Health Information Privacy and Access Act','Hospital Insurance Plan and Accounting Act','Health Integrated Payment and Administration Act'], answer:0 },
    { q:'El principio bioético de "justicia" en ética médica se refiere a:', options:['No causar daño','Hacer el bien','Distribución equitativa de recursos','Respetar la autonomía'], answer:2 },
    { q:'¿Qué es la Regla de Notificación de Incumplimiento HIPAA?', options:['Requisito de informar al paciente, medios y HHS sobre brechas de PHI que afecten a 500+ personas','Solo aplica a hospitales grandes','Solo requiere notificación interna','No aplica a brechas de menos de 1000 personas'], answer:0 },
    { q:'Res Ipsa Loquitur se aplica cuando:', options:['El paciente no puede probar negligencia','La negligencia es tan obvia que habla por sí misma','El médico admite el error','El caso va a arbitraje'], answer:1 },
    { q:'¿Cuál de los siguientes documentos dirige las preferencias de atención médica cuando el paciente no puede comunicarse?', options:['Directiva anticipada/testamento vital','Contrato de seguro médico','Historia clínica del paciente','Formulario de registro del hospital'], answer:0 },
    { q:'La Ley Stark prohíbe:', options:['Toda compensación entre médicos','Referencia de pacientes Medicare/Medicaid a entidades en las que el médico tiene interés financiero','Contratar médicos extranjeros','Cobrar copagos a pacientes de Medicare'], answer:1 },
    { q:'OSHA requiere que empleadores de salud ofrezcan la vacuna contra hepatitis B a empleados expuestos a:', options:['Agua contaminada','Aire viciado','Patógenos de transmisión sanguínea (sangre y fluidos corporales)','Radiación ionizante'], answer:2 },
    { q:'¿Cuál es la diferencia entre eutanasia activa y pasiva?', options:['No hay diferencia legal','Activa: acción directa para causar muerte; pasiva: retirar o no iniciar tratamiento','Activa es legal en todos los estados; pasiva no','Solo la pasiva involucra decisión del paciente'], answer:1 },
    { q:'El consentimiento informado requiere que el paciente tenga:', options:['Solo firma en el formulario','Capacidad legal, información adecuada y decisión voluntaria','Solo comprensión verbal del procedimiento','Solo ser mayor de 18 años'], answer:1 },
    { q:'¿Qué organismo federal regula los laboratorios clínicos a través de CLIA?', options:['FDA','OSHA','CMS (Centros de Medicare y Medicaid)','CDC'], answer:2 },
    { q:'Un "tail coverage" en seguros de responsabilidad médica:', options:['Es un seguro adicional que no tiene costo','Cubre reclamaciones presentadas después de que vence una póliza claims-made','Solo aplica a cirujanos','Es obligatorio en todos los estados'], answer:1 },
    { q:'El Informe Belmont estableció tres principios éticos para la investigación:', options:['Autonomía, beneficencia y justicia','Respeto por las personas, beneficencia y justicia','No maleficencia, autonomía y equidad','Confidencialidad, voluntariedad y compensación'], answer:1 },
    { q:'¿Cuál es el tiempo de retención estándar para registros médicos de adultos?', options:['3 años desde la última visita','5 años desde el cierre del caso','7 años desde la última visita','10 años siempre'], answer:2 },
    { q:'La responsabilidad vicaria (respondeat superior) significa que:', options:['El paciente es responsable de sus propias decisiones','El empleador es responsable por actos negligentes de sus empleados en el trabajo','El médico es responsable por actos de pacientes','Los hospitales no pueden ser demandados'], answer:1 },
    { q:'¿Qué es una orden DNR?', options:['Una orden de no resucitar al paciente','Una directiva de No Divulgar Registros','Un formulario de negativa de tratamiento general','Una orden de derivación a especialista'], answer:0 },
    { q:'Los "safe harbors" de la Ley Anti-Soborno permiten:', options:['Cualquier compensación entre médicos','Arreglos de compensación específicos que no constituyen soborno aunque involucren remisiones','Regalías de farmacéuticas a médicos','Pagos directos por referencias de pacientes'], answer:1 },
    { q:'¿Cuántas preguntas con puntaje tiene el examen MLE de NHA?', options:['75','90','100','110'], answer:2 },
    { q:'¿Cuál principio OSHA requiere que los empleadores proporcionen EPP (equipo de protección personal) sin costo al empleado?', options:['Hazard Communication','Bloodborne Pathogens Standard','Fire Safety','Emergency Action Plan'], answer:1 },
    { q:'La diferencia entre el derecho civil y el derecho penal en casos de malpractice es:', options:['No hay diferencia práctica','Civil busca compensación económica; penal busca castigo (multas o cárcel)','Civil es más severo que el penal','Solo el penal aplica a médicos'], answer:1 },
  ],
};

async function main() {
  const conn = await mysql.createConnection(DB);

  // Delete existing Spanish MLE course if re-running (idempotent)
  const [existing] = await conn.execute(
    `SELECT id FROM courses WHERE slug = 'ley-etica-medica' LIMIT 1`
  );
  if (existing.length > 0) {
    const oldId = existing[0].id;
    const [oldLessons] = await conn.execute(`SELECT id FROM lessons WHERE course_id = ?`, [oldId]);
    for (const l of oldLessons) {
      await conn.execute(`DELETE FROM quiz_questions WHERE lesson_id = ?`, [l.id]);
    }
    await conn.execute(`DELETE FROM lessons WHERE course_id = ?`, [oldId]);
    await conn.execute(`DELETE FROM courses WHERE id = ?`, [oldId]);
    console.log(`Cleared existing Spanish MLE course (id=${oldId})`);
  }

  // Insert Spanish MLE course row
  const [courseResult] = await conn.execute(
    `INSERT INTO courses (title, slug, description, category, level, is_published, price, sort_order, lang, paired_course_id)
     VALUES (?, ?, ?, ?, ?, 1, 0.00, 9, 'es', ?)`,
    [
      'Ley y Ética Médica (MLE)',
      'ley-etica-medica',
      'Preparación completa para la certificación MLE: derecho sanitario, HIPAA, ética médica, negligencia y cumplimiento regulatorio.',
      'Medical Assistant',
      'beginner',
      EN_COURSE_ID,
    ]
  );
  const COURSE_ID = courseResult.insertId;
  console.log(`Created Spanish MLE course: id=${COURSE_ID}`);

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
  console.log(`\nCurso MLE en espanol completado -- ${lessons.length} lecciones.`);
}
main().catch(err => { console.error(err); process.exit(1); });
