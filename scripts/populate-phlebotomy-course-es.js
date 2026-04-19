/**
 * populate-phlebotomy-course-es.js
 * Creates the Spanish version of Course 12 — Técnico en Flebotomía (CPT)
 * Pairs with English course ID 12.
 * Run from /var/www/nationalhealthcareer-com/
 */

const mysql = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const path = require('path');

const DB = { host:'localhost', user:'admin_nhca', password:'2u95#I7jm', database:'nha_db' };
const UPLOADS = '/var/www/nationalhealthcareer-com/public/uploads';
const EN_COURSE_ID = 12;
const SLUG_SUFFIX = '-c12es';

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
  const filename = `${Date.now()}-cpt-es-${key}.pptx`;
  const fullPath = path.join(UPLOADS, filename);
  pptx.writeFile({ fileName: fullPath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

const lessons = [
  // SECTION 1 — INTRODUCCIÓN A LA FLEBOTOMÍA
  { sort:1, section:'INTRODUCCIÓN A LA FLEBOTOMÍA', type:'text', title:'Bienvenido al Curso de Técnico en Flebotomía',
    content:`<h2>Bienvenido al Curso de Técnico en Flebotomía</h2>
<p>La flebotomía es el proceso de extracción de sangre con fines diagnósticos o terapéuticos. Es una de las habilidades clínicas más demandadas en el sector salud.</p>
<h3>Rol del Flebotomista</h3>
<ul><li>Realizar venopunciones y punciones capilares de manera segura y eficiente</li>
<li>Identificar correctamente al paciente y verificar la orden médica</li>
<li>Seleccionar el equipo y los tubos adecuados para cada prueba</li>
<li>Etiquetar, manejar y transportar las muestras correctamente</li>
<li>Mantener un entorno seguro para el paciente y para sí mismo</li></ul>
<h3>Entornos de Trabajo</h3>
<ul><li><strong>Hospitales:</strong> urgencias, pisos de hospitalización, UCI — diversidad de pacientes y urgencia</li>
<li><strong>Laboratorios clínicos:</strong> de referencia o independientes — alto volumen, rutina</li>
<li><strong>Clínicas y consultorios:</strong> pacientes ambulatorios — relación continua con el paciente</li>
<li><strong>Unidades móviles:</strong> centros de donación de sangre, domicilios, asilos — flexibilidad</li></ul>
<h3>Certificación CPT de NHA</h3>
<p>La certificación CPT (Técnico en Flebotomía Certificado) de la NHA valida sus competencias en extracción de sangre, manejo de muestras y seguridad del paciente. Este curso lo prepara completamente para el examen.</p>
<h3>Importancia de la Flebotomía en el Diagnóstico</h3>
<ul><li>El 70-80% de las decisiones clínicas se basan en resultados de laboratorio</li>
<li>Una muestra de mala calidad puede llevar a diagnósticos incorrectos y tratamientos inadecuados</li>
<li>La técnica correcta del flebotomista es fundamental para la calidad de los resultados</li></ul>` },

  { sort:2, section:'INTRODUCCIÓN A LA FLEBOTOMÍA', type:'presentation', title:'El Sistema Circulatorio y la Sangre',
    pptxKey:'circulatory', pptxTitle:'El Sistema Circulatorio y la Sangre', pptxSub:'Fundamentos para el Técnico en Flebotomía',
    pptxBullets:[
      { heading:'Componentes de la Sangre', points:[
        'Plasma (55%): agua, proteínas (albúmina, globulinas, fibrinógeno), factores de coagulación, electrolitos, hormonas, nutrientes',
        'Eritrocitos (glóbulos rojos): transportan O₂ mediante hemoglobina y retiran CO₂ de los tejidos',
        'Leucocitos (glóbulos blancos, 5 tipos): defensa inmune — neutrófilos, eosinófilos, basófilos, monocitos, linfocitos',
        'Plaquetas (trombocitos): intervienen en la hemostasia y formación del coágulo; 150,000-400,000/µL',
        'Hematocrito: porcentaje de eritrocitos en la sangre total (normal: 38-52%)',
      ]},
      { heading:'Tipos de Vasos Sanguíneos', points:[
        'Arterias: transportan sangre oxigenada desde el corazón, paredes gruesas y musculosas, alta presión',
        'Venas: transportan sangre desoxigenada hacia el corazón, paredes más delgadas, poseen válvulas venosas',
        'Capilares: vasos microscópicos donde ocurre el intercambio de O₂, CO₂ y nutrientes',
        'NOTA: en flebotomía se extraen muestras venosas (no arteriales) en la mayoría de los casos',
      ]},
      { heading:'Selección del Sitio de Venopunción', points:[
        'Primera opción: vena mediana cubital — más grande, fija, menos dolorosa, fácilmente palpable',
        'Segunda opción: vena cefálica — más lateral, a veces más difícil de fijar',
        'Tercera opción: vena basílica — medial, cerca del nervio mediano y arteria braquial (mayor riesgo)',
        'Alternativas: dorso de la mano, antebrazo — calibre menor, más sensibles al dolor',
        'Evitar: brazo con IV en curso, mastectomía ipsilateral, fístula AV, hematoma activo',
      ]},
    ]
  },

  { sort:3, section:'INTRODUCCIÓN A LA FLEBOTOMÍA', type:'text', title:'Composición de la Sangre y Funciones',
    content:`<h2>Composición de la Sangre y Funciones</h2>
<p>La sangre es un tejido conectivo líquido que constituye aproximadamente el 7-8% del peso corporal total. Comprender sus componentes es fundamental para entender por qué cada tubo de recolección tiene aditivos específicos.</p>
<h3>Plasma</h3>
<ul><li>Constituye el 55% del volumen sanguíneo total</li>
<li>Componentes: agua (92%), proteínas (albúmina, globulinas, fibrinógeno, factores de coagulación), glucosa, electrolitos (Na⁺, K⁺, Ca²⁺, Cl⁻), hormonas, enzimas, metabolitos</li>
<li>El suero es plasma sin fibrinógeno ni factores de coagulación (obtenido tras la coagulación)</li></ul>
<h3>Eritrocitos (Glóbulos Rojos)</h3>
<ul><li>Transportan oxígeno (O₂) unido a la hemoglobina y dióxido de carbono (CO₂) de regreso a los pulmones</li>
<li>Vida útil: aproximadamente 120 días</li>
<li>No tienen núcleo en los humanos adultos</li>
<li>Valores normales de hemoglobina: 12-16 g/dL (mujeres), 13.5-17.5 g/dL (hombres)</li></ul>
<h3>Leucocitos (Glóbulos Blancos)</h3>
<ul><li>5 tipos con funciones específicas en la inmunidad:
  <ul><li><strong>Neutrófilos (60-70%):</strong> primera línea de defensa contra bacterias</li>
  <li><strong>Linfocitos (20-30%):</strong> inmunidad específica (T y B)</li>
  <li><strong>Monocitos (3-8%):</strong> fagocitosis, se convierten en macrófagos</li>
  <li><strong>Eosinófilos (1-4%):</strong> respuesta alérgica y parasitaria</li>
  <li><strong>Basófilos (<1%):</strong> liberan histamina en respuestas alérgicas</li></ul></li></ul>
<h3>Plaquetas</h3>
<ul><li>Fragmentos celulares que intervienen en la hemostasia (detención del sangrado)</li>
<li>Valor normal: 150,000-400,000 por microlitro</li>
<li>Trombocitopenia (<150,000): riesgo de sangrado; trombocitosis (>400,000): riesgo de trombosis</li></ul>` },

  { sort:4, section:'INTRODUCCIÓN A LA FLEBOTOMÍA', type:'text', title:'Anatomía Vascular y Selección del Sitio',
    content:`<h2>Anatomía Vascular y Selección del Sitio de Venopunción</h2>
<h3>La Fosa Antecubital</h3>
<ul><li>Es el sitio preferido para la venopunción estándar — contiene las tres venas principales</li>
<li><strong>Vena mediana cubital (1ª elección):</strong> cruza la fosa antecubital, grande, fija, bien visible, mínimo dolor</li>
<li><strong>Vena cefálica (2ª elección):</strong> borde lateral del antebrazo y fosa antecubital, puede ser difícil de fijar</li>
<li><strong>Vena basílica (3ª elección):</strong> borde medial, cuidado — cercana al nervio mediano y la arteria braquial, mayor riesgo de complicaciones</li></ul>
<h3>Anatomía de la Vena</h3>
<ul><li><strong>Túnica íntima:</strong> capa interna — endotelio que está en contacto con la sangre</li>
<li><strong>Túnica media:</strong> capa muscular y elástica — permite la vasoconstricción/vasodilatación</li>
<li><strong>Túnica adventicia:</strong> capa externa de tejido conectivo — sostén estructural</li>
<li>Las venas tienen válvulas unidireccionales que previenen el reflujo de sangre</li></ul>
<h3>Sitios Alternativos</h3>
<ul><li>Venas del dorso de la mano: cuando la fosa antecubital no es accesible</li>
<li>Venas del antebrazo: útiles en algunos pacientes</li>
<li>Venas del pie/tobillo: generalmente requieren orden médica específica</li></ul>
<h3>Contraindicaciones del Sitio</h3>
<ul><li>Brazo con infusión IV en curso (resultados alterados — colectar en brazo opuesto)</li>
<li>Mastectomía ipsilateral (riesgo de linfedema)</li>
<li>Fístula AV para diálisis (nunca usar)</li>
<li>Hematoma, cicatriz, flebitis, quemaduras en el sitio</li>
<li>Edema severo</li></ul>` },

  { sort:5, section:'INTRODUCCIÓN A LA FLEBOTOMÍA', type:'quiz', title:'Quiz 1: Sistema Circulatorio y Anatomía',
    quizKey:'q1' },

  // SECTION 2 — EQUIPO Y TUBOS DE FLEBOTOMÍA
  { sort:6, section:'EQUIPO Y TUBOS DE FLEBOTOMÍA', type:'text', title:'Equipo de Flebotomía: Descripción General',
    content:`<h2>Equipo de Flebotomía: Descripción General</h2>
<p>Conocer el equipo de flebotomía es esencial para seleccionar el material correcto para cada situación clínica.</p>
<h3>Agujas</h3>
<ul><li><strong>Calibre 21G:</strong> estándar para venopunción en adultos — balance entre flujo y trauma vascular</li>
<li><strong>Calibre 23G:</strong> pediátrico o venas pequeñas/frágiles — menor trauma, menor flujo</li>
<li><strong>Calibre 18G o 20G:</strong> donación de sangre o cuando se requiere flujo rápido</li>
<li>Longitud estándar: 1 a 1.5 pulgadas para venopunción</li>
<li>A mayor número de calibre, menor el diámetro de la aguja</li></ul>
<h3>Sistemas de Recolección</h3>
<ul><li><strong>Adaptadores/Holders (Vacutainer):</strong> sostienen la aguja y el tubo; sistema de vacío</li>
<li><strong>Jeringas:</strong> útiles cuando el vacío del sistema Vacutainer es excesivo para venas frágiles</li>
<li><strong>Mariposas (Butterfly 23G):</strong> para venas difíciles, pediátricos, punciones en dorso de mano; el tubo de purga ("tubo desperdicio") es necesario para pruebas de coagulación</li>
<li><strong>Lancetas:</strong> punción capilar — adultos (2.4 mm) y neonatos (1.0 mm)</li></ul>
<h3>Materiales de Apoyo</h3>
<ul><li>Torniquete de látex o libre de látex (preguntar siempre por alergias)</li>
<li>Alcohol isopropílico 70% — antisepsia del sitio</li>
<li>Gasas estériles 2x2 — presión post-punción</li>
<li>Vendajes adhesivos o micropore — cubierta final</li>
<li>Guantes (siempre), etiquetas de muestra, bolígrafo</li>
<li>Contenedor para objetos punzocortantes (sharps)</li></ul>` },

  { sort:7, section:'EQUIPO Y TUBOS DE FLEBOTOMÍA', type:'presentation', title:'Equipo y Tubos de Recolección',
    pptxKey:'tubes', pptxTitle:'Equipo y Tubos de Recolección', pptxSub:'Colores, aditivos, orden de extracción y seguridad',
    pptxBullets:[
      { heading:'Tubos Vacutainer por Color y Aditivo', points:[
        'Amarillo/Dorado (SST): gel separador + activador de coágulo → química, serología, tipaje',
        'Rojo: sin aditivo → suero para serología (coagulación completa antes de centrifugar)',
        'Verde: heparina de litio o sodio → química urgente (plasma inmediato, sin esperar coágulo)',
        'Lavanda/Morado (EDTA): anticoagulante quelante → hemograma completo (CBC), grupos sanguíneos',
        'Azul claro: citrato de sodio 9:1 (sangre:citrato) → coagulación (PT/INR, aPTT, fibrinógeno)',
        'Gris: fluoruro de sodio + oxalato → glucosa, lactato (inhibe glucólisis)',
      ]},
      { heading:'Orden de Extracción (CLRGLG)', points:[
        '1. Cultivos de sangre (frascos aeróbico y anaeróbico)',
        '2. Azul claro (citrato) — sin contaminación con aditivos',
        '3. Rojo o Dorado/SST (sin aditivo o gel)',
        '4. Verde (heparina)',
        '5. Lavanda/Morado (EDTA)',
        '6. Gris (fluoruro)',
      ]},
      { heading:'Control de Infecciones y EPP', points:[
        'Precauciones estándar: tratar TODA la sangre como potencialmente infecciosa',
        'Guantes: ponerse antes de tocar al paciente, quitarse y desechar entre pacientes',
        'Nunca reencapuchar agujas con dos manos — usar técnica de una mano o dispositivo de seguridad',
        'Desechar agujas y objetos punzocortantes directamente en contenedor rígido aprobado',
        'Lavado de manos: 5 momentos OMS — antes y después de cada extracción',
      ]},
    ]
  },

  { sort:8, section:'EQUIPO Y TUBOS DE FLEBOTOMÍA', type:'text', title:'Tubos de Recolección y Aditivos',
    content:`<h2>Tubos de Recolección y Aditivos</h2>
<p>Cada tubo de recolección contiene un aditivo específico diseñado para preservar o procesar la muestra según las pruebas solicitadas. Es fundamental conocer cada uno.</p>
<h3>Tapón Amarillo/Dorado — SST (Tubo Separador de Suero)</h3>
<ul><li>Aditivo: gel separador inerte + activador de coagulación (sílice o trombina)</li>
<li>Permite: coagulación de la sangre → centrifugación → gel separa suero del coágulo</li>
<li>Usos: química clínica, serología, tiroides, metabolismo</li>
<li>Inversiones: 5 veces</li></ul>
<h3>Tapón Rojo — Sin Aditivo</h3>
<ul><li>No contiene aditivos: la sangre coagula naturalmente</li>
<li>Usos: serología, compatibilidad sanguínea, algunas pruebas de química</li>
<li>Inversiones: ninguna (o mínima para mezclar)</li></ul>
<h3>Tapón Azul Claro — Citrato de Sodio</h3>
<ul><li>Aditivo: citrato de sodio 3.2% — anticoagulante que quela el calcio</li>
<li>Relación sangre:citrato 9:1 — CRÍTICO: el tubo debe llenarse al nivel de la línea</li>
<li>Usos: PT/INR, aPTT, fibrinógeno, dímero D, tiempo de trombina</li>
<li>Inversiones: 3-4 veces</li></ul>
<h3>Tapón Verde — Heparina</h3>
<ul><li>Aditivo: heparina de litio o de sodio — anticoagulante que inhibe la trombina</li>
<li>Proporciona plasma inmediato (sin necesidad de esperar coagulación)</li>
<li>Usos: química urgente (gases, electrolitos, enzimas)</li>
<li>Inversiones: 8-10 veces</li></ul>
<h3>Tapón Lavanda/Morado — EDTA</h3>
<ul><li>Aditivo: EDTA (ácido etilendiaminotetraacético) — quelante del calcio</li>
<li>Preserva la morfología celular</li>
<li>Usos: hemograma (CBC), recuento diferencial, hemoglobina A1c, grupo y Rh</li>
<li>Inversiones: 8-10 veces; mezclar bien para evitar coágulos</li></ul>
<h3>Tapón Gris — Fluoruro/Oxalato</h3>
<ul><li>Aditivo: fluoruro de sodio (inhibe glucólisis) + oxalato de potasio (anticoagulante)</li>
<li>Conserva el nivel de glucosa al inhibir la enzima enolasa</li>
<li>Usos: glucosa en ayunas, glucosa posprandial, lactato, tolerancia a glucosa (GTT)</li>
<li>Inversiones: 8-10 veces</li></ul>` },

  { sort:9, section:'EQUIPO Y TUBOS DE FLEBOTOMÍA', type:'text', title:'Control de Infecciones y Seguridad en Flebotomía',
    content:`<h2>Control de Infecciones y Seguridad en Flebotomía</h2>
<p>La seguridad del paciente y del flebotomista es la prioridad máxima en cada extracción. Las precauciones estándar deben aplicarse en cada procedimiento sin excepción.</p>
<h3>Precauciones Estándar</h3>
<ul><li>Tratar TODA la sangre y fluidos corporales como potencialmente infecciosos</li>
<li>Aplicar sin excepción, independientemente del diagnóstico del paciente</li>
<li>Incluyen: higiene de manos, uso de EPP, manejo seguro de objetos cortopunzantes, eliminación correcta de residuos</li></ul>
<h3>EPP (Equipo de Protección Personal)</h3>
<ul><li><strong>Guantes:</strong> obligatorios para toda extracción de sangre; reemplazar entre pacientes</li>
<li><strong>Mascarilla/respirador:</strong> cuando hay riesgo de aerosoles o el paciente tiene enfermedad respiratoria</li>
<li><strong>Bata/delantal:</strong> si hay riesgo de salpicaduras</li>
<li>Preguntar al paciente sobre alergia al látex antes de usar guantes de látex</li></ul>
<h3>Higiene de Manos — 5 Momentos OMS</h3>
<ul><li>Antes de tocar al paciente</li>
<li>Antes de realizar una tarea aséptica (inserción de aguja)</li>
<li>Después del riesgo de exposición a fluidos corporales</li>
<li>Después de tocar al paciente</li>
<li>Después de tocar el entorno del paciente</li></ul>
<h3>Manejo de Objetos Punzocortantes</h3>
<ul><li>NUNCA reencapuchar una aguja usada con dos manos — técnica de una mano o dispositivo de seguridad</li>
<li>Activar el mecanismo de seguridad de la aguja inmediatamente al retirarla del paciente</li>
<li>Desechar directamente en contenedor rígido aprobado para punzocortantes (sharps)</li>
<li>Llenar el contenedor solo al 3/4 de su capacidad antes de reemplazarlo</li></ul>
<h3>Protocolo Post-Exposición</h3>
<ul><li>Si hay pinchazo accidental: lavar con agua y jabón inmediatamente, notificar al supervisor</li>
<li>Completar informe de accidente y acudir a salud ocupacional dentro de las primeras horas</li>
<li>Vacuna contra hepatitis B: se recomienda para todo el personal de salud</li></ul>` },

  { sort:10, section:'EQUIPO Y TUBOS DE FLEBOTOMÍA', type:'quiz', title:'Quiz 2: Equipo, Tubos y Orden de Extracción',
    quizKey:'q2' },

  // SECTION 3 — EL PROCEDIMIENTO DE VENOPUNCIÓN
  { sort:11, section:'EL PROCEDIMIENTO DE VENOPUNCIÓN', type:'text', title:'Preparación Pre-Colección e Interacción con el Paciente',
    content:`<h2>Preparación Pre-Colección e Interacción con el Paciente</h2>
<p>La fase pre-analítica (antes de la extracción) es la etapa donde ocurre la mayoría de los errores en flebotomía. Una preparación cuidadosa reduce los errores y garantiza la calidad de la muestra.</p>
<h3>Identificación del Paciente — Dos Identificadores Mínimos</h3>
<ul><li>Pedir al paciente que diga su nombre completo (no preguntar "¿es usted el señor X?")</li>
<li>Verificar fecha de nacimiento o número de identificación</li>
<li>Comparar con la pulsera de identificación y la etiqueta del tubo/orden</li>
<li>En pacientes inconscientes: verificar con pulsera y dos trabajadores de salud</li>
<li>NUNCA asumir la identidad sin verificar — el error de identificación es la causa más grave en flebotomía</li></ul>
<h3>Verificación de la Orden Médica</h3>
<ul><li>Confirmar el nombre del paciente, fecha, pruebas solicitadas y médico responsable</li>
<li>Verificar si requiere preparación especial: ayuno (cuántas horas), suspensión de medicamentos</li>
<li>Aclarar cualquier duda antes de proceder</li></ul>
<h3>Verificación del Ayuno</h3>
<ul><li>Glucosa en ayunas, perfil lipídico, GTT requieren ayuno de 8-12 horas</li>
<li>Si el paciente no está en ayunas cuando se requiere: notificar al médico y documentar</li></ul>
<h3>Posicionamiento del Paciente</h3>
<ul><li>Preferiblemente sentado en silla de flebotomía con apoyabrazos, o acostado en cama</li>
<li>Nunca realizar la extracción con el paciente de pie — riesgo de síncope vasovagal</li>
<li>Explicar el procedimiento claramente para obtener cooperación y reducir ansiedad</li></ul>` },

  { sort:12, section:'EL PROCEDIMIENTO DE VENOPUNCIÓN', type:'presentation', title:'El Procedimiento de Venopunción Paso a Paso',
    pptxKey:'venipuncture', pptxTitle:'El Procedimiento de Venopunción Paso a Paso', pptxSub:'Técnica correcta y puntos críticos',
    pptxBullets:[
      { heading:'Pasos 1-5: Preparación', points:[
        '1. Verificar la identidad del paciente con dos identificadores (nombre + fecha de nacimiento)',
        '2. Reunir el equipo necesario: agujas, adaptador, tubos en orden correcto, torniquete, alcohol, gasas',
        '3. Lavarse las manos y ponerse los guantes antes de tocar al paciente',
        '4. Aplicar el torniquete 3-4 pulgadas por encima del sitio elegido',
        '5. Palpar y seleccionar la mejor vena (mediana cubital > cefálica > basílica)',
      ]},
      { heading:'Pasos 6-10: Extracción', points:[
        '6. Limpiar el sitio con alcohol isopropílico 70% en movimiento circular; dejar secar 30 segundos',
        '7. Insertar la aguja con el bisel hacia arriba en ángulo de 15-30°, con movimiento suave y firme',
        '8. Confirmar flujo sanguíneo (destello en la cámara de la mariposa o inicio de llenado del tubo)',
        '9. Llenar los tubos en el orden correcto (CLRGLG), mezclando cada uno antes de continuar',
        '10. Liberar el torniquete antes de retirar la aguja; presionar con gasa inmediatamente',
      ]},
      { heading:'Puntos Críticos de la Técnica', points:[
        'NO exceder 1 minuto con el torniquete — altera K⁺, proteínas y otros analitos (hemoconcentración)',
        'Liberar el torniquete ANTES de retirar la aguja — previene hematoma y equimosis',
        'Presionar firmemente sin doblar el brazo — el codo doblado comprime la vena y forma hematoma',
        'Invertir los tubos inmediatamente y con suavidad — mezcla el aditivo sin hemolizar',
        'Etiquetar los tubos al lado del paciente, no en otro lugar',
      ]},
    ]
  },

  { sort:13, section:'EL PROCEDIMIENTO DE VENOPUNCIÓN', type:'text', title:'Técnica de Venopunción Paso a Paso',
    content:`<h2>Técnica de Venopunción Paso a Paso</h2>
<h3>Identificación y Preparación</h3>
<ul><li>Verificar la identidad con dos identificadores: nombre completo + fecha de nacimiento</li>
<li>Revisar la orden médica y reunir el equipo necesario</li>
<li>Lavarse las manos y colocarse los guantes</li></ul>
<h3>Aplicación del Torniquete y Selección de la Vena</h3>
<ul><li>Aplicar el torniquete 3-4 pulgadas por encima del sitio de venopunción</li>
<li>Pedir al paciente que abra y cierre el puño (no bombear repetidamente — altera K⁺)</li>
<li>Palpar la vena con el dedo índice para evaluar tamaño, profundidad y firmeza</li>
<li>Tiempo máximo con torniquete: 1 minuto</li></ul>
<h3>Antisepsia y Punción</h3>
<ul><li>Limpiar el sitio con alcohol isopropílico 70% en movimiento circular de adentro hacia afuera</li>
<li>Dejar secar completamente (30 segundos) — NO soplar ni abanicarlo</li>
<li>No tocar el sitio limpio después de la desinfección</li>
<li>Insertar la aguja con el bisel hacia arriba en ángulo de 15-30°, jalando la piel levemente hacia abajo</li></ul>
<h3>Llenado, Retiro y Post-Punción</h3>
<ul><li>Confirmar flujo sanguíneo, llenar los tubos en el orden correcto</li>
<li>Liberar el torniquete antes de retirar la aguja</li>
<li>Retirar la aguja con movimiento suave y directo, activar el mecanismo de seguridad</li>
<li>Presionar el sitio con gasa — brazo extendido, NO doblado</li>
<li>Invertir cada tubo según las inversiones requeridas</li>
<li>Etiquetar los tubos al lado del paciente inmediatamente: nombre, fecha de nacimiento, fecha/hora, iniciales del flebotomista</li></ul>` },

  { sort:14, section:'EL PROCEDIMIENTO DE VENOPUNCIÓN', type:'text', title:'Complicaciones y Resolución de Problemas en Venopunción',
    content:`<h2>Complicaciones y Resolución de Problemas en Venopunción</h2>
<h3>Hematoma</h3>
<ul><li><strong>Causa:</strong> presión insuficiente post-punción, torniquete no liberado antes de retirar la aguja, aguja que traversa la vena</li>
<li><strong>Prevención:</strong> liberar torniquete antes de retirar aguja, presionar firmemente 3-5 minutos, no doblar el brazo</li></ul>
<h3>Petequias</h3>
<ul><li>Pequeñas manchas rojizas por fragilidad capilar o torniquete aplicado demasiado tiempo</li>
<li>Indicador de posible trombocitopenia o coagulopatía</li></ul>
<h3>Hemólisis de la Muestra</h3>
<ul><li><strong>Causas:</strong> aguja de calibre demasiado pequeño (23G+), mezcla vigorosa de los tubos, extracción muy lenta, demora excesiva en procesamiento, jeringa con émbolo jalado muy fuerte</li>
<li><strong>Consecuencias:</strong> K⁺ falsamente elevado, LDH elevada — muestra rechazada</li></ul>
<h3>Colapso de Vena</h3>
<ul><li>Succión excesiva con jeringa o vena muy delgada/frágil</li>
<li>Solución: usar aguja de menor calibre, mariposa o sistema de jeringa con presión controlada</li></ul>
<h3>Síncope Vasovagal</h3>
<ul><li>Desmayo por respuesta vagal: palidez, sudoración, náusea, pérdida de conciencia</li>
<li>Factores: ansiedad, dolor, ayuno prolongado, ambiente caliente</li>
<li>Prevención: posición reclinada o supina, conversación tranquilizadora</li>
<li>Manejo: retirar la aguja, hacer que el paciente baje la cabeza o se acueste, aplicar compresa fría</li></ul>
<h3>Criterios de Rechazo de Muestra</h3>
<ul><li>Identificación incorrecta o incompleta en el tubo</li>
<li>Tubo equivocado para la prueba solicitada</li>
<li>Hemólisis severa, lipemia excesiva, ictericia extrema</li>
<li>Muestra insuficiente (volumen menor al mínimo requerido)</li>
<li>Sin fecha y hora de colección</li>
<li>Coágulos visibles en tubo EDTA</li></ul>` },

  { sort:15, section:'EL PROCEDIMIENTO DE VENOPUNCIÓN', type:'quiz', title:'Quiz 3: Procedimiento de Venopunción',
    quizKey:'q3' },

  // SECTION 4 — MANEJO Y PROCESAMIENTO DE MUESTRAS
  { sort:16, section:'MANEJO Y PROCESAMIENTO DE MUESTRAS', type:'text', title:'Manejo Post-Colección de Muestras',
    content:`<h2>Manejo Post-Colección de Muestras</h2>
<p>La fase post-analítica comienza inmediatamente al finalizar la extracción. Un manejo incorrecto puede invalidar una muestra perfectamente obtenida.</p>
<h3>Etiquetado Inmediato</h3>
<ul><li>Etiquetar al lado del paciente — NUNCA llevar los tubos sin etiquetar al laboratorio</li>
<li>Información mínima en la etiqueta: nombre completo del paciente, fecha de nacimiento (o ID), fecha y hora de colección, iniciales del flebotomista</li>
<li>Verificar que la información del tubo coincide con la orden médica y la identificación del paciente</li></ul>
<h3>Inversiones Requeridas por Tubo</h3>
<ul><li>Azul claro (citrato): 3-4 inversiones suaves</li>
<li>Rojo (sin aditivo): mínimas o ninguna</li>
<li>Dorado/SST: 5 inversiones</li>
<li>Verde (heparina): 8-10 inversiones</li>
<li>Lavanda (EDTA): 8-10 inversiones — crítico para evitar coágulos</li>
<li>Gris (fluoruro): 8-10 inversiones</li></ul>
<h3>Temperatura y Tiempo de Transporte</h3>
<ul><li>La mayoría de las muestras se transportan a temperatura ambiente</li>
<li>Muestras que requieren frío: gases arteriales (en hielo), algunas pruebas especiales</li>
<li>Muestras que requieren temperatura corporal: plaquetas, factor V</li></ul>
<h3>Tiempo Máximo Antes de Centrifugar</h3>
<ul><li>SST: debe centrifugarse dentro de los primeros 30 minutos después de completada la coagulación (30-60 min totales)</li>
<li>Heparina: centrifugar inmediatamente (plasma disponible de inmediato)</li>
<li>EDTA: no se centrifuga para CBC; para plasma, centrifugar según instrucciones</li></ul>
<h3>Protección de la Luz</h3>
<ul><li>Bilirrubina, porfirina, vitamina B12, beta-caroteno: envolver en papel aluminio o usar tubos ámbar</li>
<li>La luz degrada estos analitos sensibles y produce resultados falsamente bajos</li></ul>` },

  { sort:17, section:'MANEJO Y PROCESAMIENTO DE MUESTRAS', type:'presentation', title:'Manejo y Procesamiento de Muestras',
    pptxKey:'processing', pptxTitle:'Manejo y Procesamiento de Muestras', pptxSub:'Errores pre-analíticos, centrifugación y criterios de rechazo',
    pptxBullets:[
      { heading:'Errores Pre-Analíticos Más Comunes', points:[
        'Muestra hemolizada: K⁺ falsamente elevado, LDH elevada, resultados de enzimas alterados',
        'Causas de hemólisis: aguja pequeña, mezcla vigorosa, jeringa con vacío excesivo, tubo frío',
        'Muestra lipémica: plasma lechoso por triglicéridos altos — interfiere con espectrofotometría',
        'Muestra ictérica: bilirrubina elevada interfiere con pruebas coloridas y espectrofotométricas',
        'Muestra coagulada (EDTA): invalida el hemograma — no inversiones suficientes',
      ]},
      { heading:'Centrifugación', points:[
        'SST/Dorado: esperar 30 min para coagulación completa → centrifugar 10 min a 2000-3000 rpm',
        'El gel separador forma una barrera entre el suero y el coágulo tras la centrifugación',
        'Suero vs. plasma: el suero NO tiene fibrinógeno; el plasma SÍ (obtenido con anticoagulante)',
        'Verificar siempre que el coágulo esté completo antes de centrifugar el SST',
        'Centrifugación incorrecta (muy rápida o muy lenta) puede hemolizar o no separar bien',
      ]},
      { heading:'Criterios de Rechazo de Muestra', points:[
        'Identificación incorrecta o faltante en el tubo',
        'Tubo equivocado para la prueba (ej. glucosa en tubo rojo)',
        'Hemólisis severa o coágulo en tubo EDTA',
        'Muestra insuficiente (volumen <80% del requerido)',
        'Sin fecha u hora de colección',
        'Muestra lipémica severa o ictérica (según la prueba)',
      ]},
    ]
  },

  { sort:18, section:'MANEJO Y PROCESAMIENTO DE MUESTRAS', type:'text', title:'Errores Pre-Analíticos y Rechazo de Muestras',
    content:`<h2>Errores Pre-Analíticos y Rechazo de Muestras</h2>
<p>Los errores pre-analíticos representan la mayoría de los errores en laboratorio clínico y ocurren antes o durante la extracción de la muestra.</p>
<h3>Error de Identificación del Paciente</h3>
<ul><li>La causa más importante y peligrosa de error en flebotomía</li>
<li>Puede resultar en transfusión incorrecta, tratamiento erróneo o daño grave al paciente</li>
<li>Prevención: siempre usar dos identificadores antes de cada extracción</li></ul>
<h3>Muestra Hemolizada</h3>
<ul><li>Ruptura de eritrocitos → liberación del contenido intracelular al plasma/suero</li>
<li>Efectos: K⁺ falsamente elevado (causa más frecuente de hiperpotasemia espuria), LDH elevada, AST elevada, fosfato elevado</li>
<li>Causas: aguja de calibre demasiado pequeño, mezcla vigorosa, jeringa con émbolo jalado bruscamente, muestra fría, demora en procesamiento</li></ul>
<h3>Muestra Lipémica</h3>
<ul><li>Plasma turbio por triglicéridos elevados (paciente no estaba en ayunas o hipertrigliceridemia)</li>
<li>Interfiere con métodos espectrofotométricos: proteínas, colesterol, bilirrubina, muchos otros</li></ul>
<h3>Muestra Ictérica</h3>
<ul><li>Plasma/suero amarillo intenso por bilirrubina elevada</li>
<li>Interfiere con pruebas que usan detección de color</li></ul>
<h3>Coágulos en Tubo EDTA</h3>
<ul><li>Invalida el hemograma completo (CBC)</li>
<li>Causa: mezcla insuficiente del tubo o demora en mezclar tras la colección</li></ul>
<h3>Dilución con IV</h3>
<ul><li>Muestra diluida si se colecta del brazo con infusión IV en curso</li>
<li>Solución: siempre colectar del brazo opuesto a la infusión IV</li></ul>` },

  { sort:19, section:'MANEJO Y PROCESAMIENTO DE MUESTRAS', type:'text', title:'Pruebas en el Punto de Atención (POCT)',
    content:`<h2>Pruebas en el Punto de Atención (POCT)</h2>
<p>Las pruebas POCT (Point-of-Care Testing) se realizan al lado del paciente con resultados inmediatos, sin necesidad de enviar la muestra al laboratorio central.</p>
<h3>Glucómetro</h3>
<ul><li>Mide la glucosa en sangre capilar con una pequeña gota de sangre (1-5 µL)</li>
<li>Resultado disponible en 5-10 segundos</li>
<li>Control de calidad diario obligatorio: solución de control alta y baja antes de usar con pacientes</li>
<li>Documentar los resultados de control y los valores del paciente en el registro</li></ul>
<h3>Coagulación Bedside (INR/PT)</h3>
<ul><li>Monitores portátiles para control de warfarina en clínicas de anticoagulación</li>
<li>Sangre capilar o venosa según el dispositivo</li></ul>
<h3>Troponinas Rápidas</h3>
<ul><li>Detección de troponina cardíaca en urgencias para diagnóstico de IAM</li>
<li>Resultado en 15-20 minutos con sangre entera o suero</li></ul>
<h3>Hemoglobina y Hematocrito Portátil</h3>
<ul><li>Analizadores portátiles para detección de anemia o evaluación pre-donación</li></ul>
<h3>Pruebas CLIA Waived</h3>
<ul><li>Clasificación de la FDA: pruebas de menor complejidad que pueden realizarse con mínima supervisión</li>
<li>Incluyen: glucosa capilar, pruebas de embarazo, estreptococo rápido, influenza rápida</li>
<li>Requieren certificado CLIA waived de la institución</li></ul>
<h3>Mantenimiento y Documentación</h3>
<ul><li>Limpiar los dispositivos según las instrucciones del fabricante</li>
<li>Registrar todos los controles de calidad y resultados de pacientes</li>
<li>Los glucómetros deben calibrarse con cada nuevo lote de tiras reactivas</li></ul>` },

  { sort:20, section:'MANEJO Y PROCESAMIENTO DE MUESTRAS', type:'quiz', title:'Quiz 4: Manejo y Procesamiento de Muestras',
    quizKey:'q4' },

  // SECTION 5 — RECOLECCIONES ESPECIALES
  { sort:21, section:'RECOLECCIONES ESPECIALES', type:'text', title:'Punción Capilar y Procedimientos Dérmicos',
    content:`<h2>Punción Capilar y Procedimientos Dérmicos</h2>
<p>La punción capilar (punción dérmica) se utiliza cuando la venopunción convencional no es posible o apropiada.</p>
<h3>Indicaciones para Punción Capilar</h3>
<ul><li>Neonatos e infantes — venas demasiado pequeñas para venopunción</li>
<li>Pacientes con quemaduras severas en ambos brazos</li>
<li>Pacientes en quimioterapia con venas muy frágiles</li>
<li>Pacientes geriátricos con venas muy delgadas o en pacientes obesos</li>
<li>Monitoreo frecuente de glucosa (minimiza el trauma acumulado)</li></ul>
<h3>Sitios en Adultos</h3>
<ul><li>Cara lateral del dedo medio o anular de la mano no dominante</li>
<li>Alternar dedos para evitar callosidades</li>
<li>Evitar el dedo pulgar (pulsación arterial) y el meñique (delgado)</li>
<li>No usar el lóbulo de la oreja — sitio obsoleto y no recomendado</li></ul>
<h3>Talón en Neonatos</h3>
<ul><li>Cara plantar medial o lateral del talón — sitios seguros</li>
<li>NUNCA la curva posterior del talón (arco plantar) — riesgo de lesionar el hueso calcáneo y vasos</li>
<li>NUNCA el área central plantar — vasos y nervios importantes</li>
<li>Profundidad de lanceta: adultos 2.4 mm; neonatos 1.0 mm (máximo)</li></ul>
<h3>Técnica de Punción Capilar</h3>
<ul><li>Calentar el sitio 3-5 minutos (aumenta el flujo capilar)</li>
<li>Limpiar con alcohol y dejar secar</li>
<li>Puncionar perpendicularmente a las huellas dactilares</li>
<li>Descartar la primera gota (contaminada con líquido tisular intersticial)</li>
<li>Recolectar sin presionar excesivamente (la presión diluye con líquido tisular)</li></ul>
<h3>Orden de Llenado Capilar</h3>
<ul><li>1. Gases (si aplica)</li>
<li>2. EDTA</li>
<li>3. Otros aditivos</li>
<li>4. Suero (sin aditivo)</li></ul>` },

  { sort:22, section:'RECOLECCIONES ESPECIALES', type:'presentation', title:'Procedimientos Especiales de Recolección',
    pptxKey:'special', pptxTitle:'Procedimientos Especiales de Recolección', pptxSub:'Hemocultivos, niveles de medicamentos y GTT',
    pptxBullets:[
      { heading:'Hemocultivos', points:[
        'Mínimo dos sets: un frasco aeróbico y uno anaeróbico por set',
        'Limpiar el sitio con clorhexidina al 2% o betadine (yodo) — dejar secar completamente',
        'Limpiar también los tapones de los frascos con alcohol isopropílico 70%',
        'NO contaminar: no tocar el sitio limpio, cambiar la aguja entre sets si se toma de un solo sitio',
        'Volumen crítico: 8-10 mL por frasco en adultos (insuficiente volumen = falsos negativos)',
        'Inocular primero el frasco aeróbico (o según protocolo institucional)',
      ]},
      { heading:'Niveles de Medicamentos (Pico y Valle)', points:[
        'Nivel pico (peak): máxima concentración del medicamento — 30 min después de completar infusión IV',
        'Nivel valle (trough): concentración mínima — justo antes de la siguiente dosis programada',
        'Documentar la hora EXACTA de colección y la hora de la última dosis — es crítico',
        'Medicamentos comunes monitoreados: vancomicina, tobramicina, gentamicina, digoxina, fenitoína',
        'Error en el tiempo de colección invalida el resultado y puede causar dosificación incorrecta',
      ]},
      { heading:'Curva de Tolerancia a la Glucosa (GTT)', points:[
        'Indicación: diagnóstico de diabetes gestacional y tolerancia alterada a la glucosa',
        'Preparación: ayuno de 8-12 horas; no fumar, no ejercitarse, no comer durante la prueba',
        'Protocolo estándar (75g): glucosa basal en ayuno → administrar 75g de glucosa → muestras a 1h y 2h',
        'Protocolo gestacional (100g): glucosa basal → 100g → muestras a 1h, 2h y 3h',
        'El paciente debe permanecer en reposo sentado durante todas las horas de la prueba',
      ]},
    ]
  },

  { sort:23, section:'RECOLECCIONES ESPECIALES', type:'text', title:'Hemocultivos, Monitoreo de Medicamentos y Colecciones Cronometradas',
    content:`<h2>Hemocultivos, Monitoreo de Medicamentos y Colecciones Cronometradas</h2>
<h3>Hemocultivos</h3>
<ul><li>Indicación: sospecha de bacteriemia o fungemia (fiebre alta, escalofríos, leucocitosis)</li>
<li>Asepsia estricta del sitio con clorhexidina 2% o yodo-povidona — dejar secar completamente</li>
<li>Recolectar de dos sitios venosos distintos si es posible (mayor sensibilidad)</li>
<li>Volumen: 8-10 mL por frasco en adultos, 1-3 mL en neonatos</li>
<li>Inocular los frascos inmediatamente e incubar a 37°C en el laboratorio</li></ul>
<h3>Pico y Valle de Antibióticos</h3>
<ul><li><strong>Tobramicina/Gentamicina — Valle:</strong> justo antes de la siguiente dosis (30 min antes)</li>
<li><strong>Tobramicina/Gentamicina — Pico:</strong> 30-60 min después de completar la infusión IV</li>
<li><strong>Vancomicina — Valle:</strong> justo antes de la siguiente dosis (30 min antes)</li>
<li><strong>Vancomicina — Pico:</strong> 1-2 horas después de completar la infusión IV</li>
<li>Documentar hora exacta de colección y hora de la última/próxima dosis</li></ul>
<h3>Prueba de Tolerancia a la Glucosa (GTT)</h3>
<ul><li>Preparación: ayuno 8-12 horas; dieta normal los 3 días previos (no restricción de carbohidratos)</li>
<li>Protocolo: glucosa basal → administrar la carga de glucosa → muestras a las 1h, 2h, y 3h si aplica</li>
<li>El paciente no puede comer, beber (excepto agua), fumar, ni ejercitarse durante la prueba</li>
<li>Recolectar en tubo gris (fluoruro) para conservar la glucosa</li></ul>
<h3>Colección de Orina de 24 Horas</h3>
<ul><li>Instrucciones al paciente: desechar la primera orina de la mañana (inicio del cronómetro), recolectar TODA la orina durante 24 horas exactas, refrigerar el contenedor durante la colección</li>
<li>Usos: creatinina en orina 24h, proteínas urinarias, catecolaminas, metales pesados</li></ul>` },

  { sort:24, section:'RECOLECCIONES ESPECIALES', type:'quiz', title:'Quiz 5: Procedimientos Especiales',
    quizKey:'q5' },

  // SECTION 6 — PREPARACIÓN PARA EL EXAMEN CPT
  { sort:25, section:'PREPARACIÓN PARA EL EXAMEN CPT', type:'text', title:'Guía de Estudio para el Examen CPT',
    content:`<h2>Guía de Estudio para el Examen CPT</h2>
<h3>Estructura del Examen CPT</h3>
<ul><li>100 preguntas de opción múltiple</li>
<li>Tiempo: 2.5 horas</li>
<li>Puntaje mínimo aprobatorio: 390 de 500 puntos</li>
<li>Formato: presencial en centro de pruebas o en línea supervisado</li></ul>
<h3>Dominios del Examen CPT</h3>
<ul><li><strong>Procedimiento de venopunción: 35%</strong> — técnica, orden de tubos, complicaciones</li>
<li><strong>Manejo de muestras: 20%</strong> — etiquetado, transporte, centrifugación, rechazo</li>
<li><strong>Anatomía y fisiología: 20%</strong> — sistema circulatorio, componentes sanguíneos, sitios</li>
<li><strong>Cuidado del paciente y seguridad: 15%</strong> — identificación, EPP, control de infecciones</li>
<li><strong>Procedimientos especiales: 10%</strong> — capilar, hemocultivos, GTT, pico/valle</li></ul>
<h3>Estrategias de Estudio</h3>
<ul><li>Memorice el orden de extracción (CLRGLG) y el aditivo de cada tubo por color</li>
<li>Domine la técnica completa de venopunción paso a paso</li>
<li>Estudie las causas y consecuencias de la hemólisis</li>
<li>Conozca los sitios correctos e incorrectos para la punción de talón neonatal</li>
<li>Practique la identificación de errores pre-analíticos comunes</li></ul>
<h3>El Día del Examen</h3>
<ul><li>Llegue 30 minutos antes</li>
<li>Lleve identificación con foto vigente</li>
<li>Lea cada pregunta completamente; elimine opciones incorrectas primero</li>
<li>No deje preguntas sin responder — no hay penalización</li></ul>` },

  { sort:26, section:'PREPARACIÓN PARA EL EXAMEN CPT', type:'presentation', title:'Estrategia para el Examen CPT',
    pptxKey:'exam-prep', pptxTitle:'Estrategia para el Examen CPT', pptxSub:'Dominios, conceptos clave y plan de estudio',
    pptxBullets:[
      { heading:'Dominios del Examen CPT', points:[
        'Procedimiento de venopunción: 35% — área más importante del examen',
        'Manejo de muestras: 20%',
        'Anatomía y fisiología: 20%',
        'Cuidado del paciente y seguridad: 15%',
        'Procedimientos especiales: 10%',
      ]},
      { heading:'Conceptos Más Evaluados', points:[
        'Orden de extracción correcto (CLRGLG) y por qué es importante',
        'Colores de tubos, aditivos y pruebas asociadas — memorizar completamente',
        'Dos identificadores para la identificación del paciente — nombre + fecha de nacimiento',
        'Manejo del hematoma: liberar torniquete antes de retirar aguja, presionar sin doblar',
        'Punción de talón en neonatos: cara plantar medial/lateral — NUNCA el arco posterior',
      ]},
      { heading:'Plan de Estudio Final', points:[
        'Días 1-3: Sistema circulatorio, anatomía vascular, componentes de la sangre',
        'Días 4-6: Tubos por color/aditivo/prueba, orden de extracción, equipo',
        'Días 7-9: Técnica de venopunción paso a paso, complicaciones, control de infecciones',
        'Días 10-11: Manejo de muestras, errores pre-analíticos, criterios de rechazo',
        'Días 12-14: Procedimientos especiales, exámenes de práctica, repaso de áreas débiles',
      ]},
    ]
  },

  { sort:27, section:'PREPARACIÓN PARA EL EXAMEN CPT', type:'quiz', title:'Evaluación Final: Examen de Práctica CPT',
    quizKey:'final' },
];

const quizzes = {
  q1: [
    { q:'¿Cuál es la primera vena de elección en la fosa antecubital para venopunción?', options:['Cefálica','Basílica','Mediana cubital','Mediana basílica'], answer:2 },
    { q:'¿Qué porcentaje del volumen sanguíneo total representa el plasma?', options:['45%','55%','65%','35%'], answer:1 },
    { q:'¿Cuál es el recuento normal de plaquetas en un adulto sano?', options:['50,000-100,000/µL','150,000-400,000/µL','400,000-600,000/µL','100,000-150,000/µL'], answer:1 },
    { q:'¿Por qué se prefiere la vena basílica como ÚLTIMA opción en la fosa antecubital?', options:['Es la más pequeña','Está muy profunda','Se encuentra cerca del nervio mediano y la arteria braquial','Es la más visible'], answer:2 },
    { q:'¿Cuál es la función principal de los eritrocitos?', options:['Coagulación','Defensa inmune','Transporte de oxígeno y dióxido de carbono','Producción de anticuerpos'], answer:2 },
  ],
  q2: [
    { q:'¿Qué color de tapón se usa para pruebas de coagulación (PT/aPTT) y contiene citrato de sodio?', options:['Lavanda','Verde','Azul claro','Gris'], answer:2 },
    { q:'¿Cuál es el orden de extracción correcto?', options:['Azul→Dorado→Lavanda→Verde→Gris','Cultivos→Azul→Rojo/Dorado→Verde→Lavanda→Gris','Lavanda→Verde→Azul→Gris','Rojo→Lavanda→Verde→Azul'], answer:1 },
    { q:'El tubo de tapón GRIS contiene fluoruro de sodio que:', options:['Activa la coagulación','Previene la glucólisis para conservar la glucosa en la muestra','Anticoagula con EDTA','Separa el suero mediante gel'], answer:1 },
    { q:'¿Cuántos grados de ángulo se recomienda para insertar la aguja durante la venopunción estándar?', options:['5-10°','15-30°','45-60°','90°'], answer:1 },
    { q:'La calibre de aguja MÁS COMÚN para venopunción estándar en adultos es:', options:['18G','21G','25G','23G'], answer:1 },
  ],
  q3: [
    { q:'¿Cuánto tiempo máximo debe mantenerse el torniquete durante la venopunción?', options:['30 segundos','1 minuto','2 minutos','5 minutos'], answer:1 },
    { q:'¿Cuándo se debe liberar el torniquete durante la venopunción?', options:['Después de insertar la aguja','Cuando el primer tubo está casi lleno','Antes de retirar la aguja, una vez que el último tubo está llenando','Al retirar la aguja'], answer:2 },
    { q:'¿Qué causa principal produce un hematoma durante o después de la venopunción?', options:['Usar agujas de calibre incorrecto','Presión insuficiente sobre el sitio o no liberar el torniquete antes de retirar la aguja','Limpiar con alcohol','Invertir los tubos muy suavemente'], answer:1 },
    { q:'¿Por qué se descarta la primera gota de sangre en la punción capilar?', options:['Porque contiene más leucocitos','Porque puede estar contaminada con líquido tisular intersticial','Porque tiene menos plaquetas','Porque tiene mayor concentración de glucosa'], answer:1 },
    { q:'¿Cuántos identificadores del paciente deben verificarse antes de realizar la extracción?', options:['1','2','3','4'], answer:1 },
  ],
  q4: [
    { q:'¿Cuál es el error pre-analítico más común y peligroso en flebotomía?', options:['Hemólisis','Error de identificación del paciente','Muestra insuficiente','Coagulación del tubo EDTA'], answer:1 },
    { q:'La hemólisis de la muestra puede causar resultados falsamente ELEVADOS en:', options:['Glucosa','Sodio','Potasio (K⁺) y LDH','Cloro'], answer:2 },
    { q:'¿Cuánto tiempo máximo debe esperar un tubo SST antes de ser centrifugado?', options:['5 minutos','30 minutos','60 minutos','2 horas'], answer:1 },
    { q:'¿Por qué las muestras de bilirrubina y porfirina deben protegerse de la luz?', options:['Para mantenerlas frías','La luz degrada estos analitos sensibles y afecta los resultados','Para prevenir la evaporación','Para evitar contaminación bacteriana'], answer:1 },
    { q:'Una muestra se rechaza por "muestra insuficiente" cuando:', options:['El paciente se movió durante la extracción','El volumen de sangre en el tubo es menor al mínimo requerido para la prueba','El paciente no estaba en ayunas','El tubo se mezcló demasiado'], answer:1 },
  ],
  q5: [
    { q:'¿En qué sitio del talón NO debe realizarse la punción en neonatos?', options:['Cara plantar medial','Cara plantar lateral','La curva posterior del talón (arco)','Zona central plantar'], answer:2 },
    { q:'Una muestra de "valle" (trough) para monitoreo de vancomicina debe obtenerse:', options:['30 minutos después de la infusión','Inmediatamente durante la infusión','Justo antes de la siguiente dosis programada','2 horas después de la dosis'], answer:2 },
    { q:'Para un hemocultivo correcto, ¿cuál es la preparación esencial del sitio?', options:['Solo alcohol isopropílico','Clorhexidina o solución de yodo, dejando secar completamente para asepsia estricta','Solo agua estéril','Alcohol y luego agua'], answer:1 },
    { q:'En la Prueba de Tolerancia a la Glucosa (GTT), ¿qué debe evitar el paciente durante el período de prueba?', options:['Beber agua','Comer, beber (excepto agua), fumar o ejercitarse durante las horas de prueba','Tomar sus medicamentos habituales','Hablar con el técnico'], answer:1 },
    { q:'¿Cuál es la profundidad máxima recomendada para la lanceta en la punción de talón neonatal?', options:['0.5 mm','1.0 mm','2.4 mm','3.0 mm'], answer:1 },
  ],
  final: [
    { q:'¿Cuál es la primera vena de elección para venopunción en la fosa antecubital?', options:['Cefálica','Basílica','Mediana cubital','Mediana basílica'], answer:2 },
    { q:'¿Qué color de tapón contiene EDTA y se usa para hemograma completo (CBC)?', options:['Verde','Gris','Lavanda/Morado','Azul claro'], answer:2 },
    { q:'El orden de extracción correcto después de los hemocultivos comienza con:', options:['Lavanda','Azul claro (citrato)','Verde','Rojo'], answer:1 },
    { q:'¿Cuánto tiempo máximo debe mantenerse el torniquete?', options:['30 segundos','1 minuto','3 minutos','5 minutos'], answer:1 },
    { q:'La hemólisis en una muestra de sangre puede causar falsas elevaciones de:', options:['Glucosa y sodio','Potasio (K⁺) y LDH','Calcio y fósforo','Colesterol y triglicéridos'], answer:1 },
    { q:'¿Cuál es la indicación PRINCIPAL para realizar punción capilar en lugar de venopunción?', options:['El paciente tiene miedo a las agujas','Neonatos y pacientes con venas inaccesibles','El técnico prefiere el procedimiento capilar','La prueba lo requiere siempre'], answer:1 },
    { q:'El tubo de tapón azul claro tiene una relación sangre:citrato de:', options:['1:1','5:1','9:1','3:1'], answer:2 },
    { q:'¿Cuál es el peso del dominio "Procedimiento de Venopunción" en el examen CPT?', options:['20%','25%','35%','45%'], answer:2 },
    { q:'Una muestra de "pico" (peak) para antibióticos se obtiene:', options:['Justo antes de la siguiente dosis','30 minutos después de completar la infusión IV','Durante la infusión','2 horas antes de la dosis'], answer:1 },
    { q:'La primera gota de sangre en la punción capilar se descarta porque:', options:['Es demasiado poca cantidad','Puede estar contaminada con líquido tisular y no ser representativa','Tiene mayor concentración de hemoglobina','No sirve para ninguna prueba'], answer:1 },
    { q:'¿Cuántos sets de hemocultivos se recomienda obtener como mínimo?', options:['1','2','3','4'], answer:1 },
    { q:'Para proteger las muestras sensibles a la luz (bilirrubina) se debe:', options:['Refrigerarlas inmediatamente','Envolverlas en papel aluminio o usar tubos ámbar','Procesarlas en menos de 10 minutos','Centrifugarlas antes de transportarlas'], answer:1 },
    { q:'¿En qué sitio del dedo se realiza la punción capilar en adultos?', options:['Pulgar','Dedo índice','Cara lateral del dedo medio o anular','Punta del dedo'], answer:2 },
    { q:'El calibre de aguja 21G es:', options:['Más grueso que el 23G','Más delgado que el 23G','Igual al 23G','Solo para uso pediátrico'], answer:0 },
    { q:'¿Cuál es la función del fluoruro de sodio en el tubo gris?', options:['Activa la coagulación','Previene la glucólisis, conservando el nivel de glucosa','Anticoagula la muestra','Separa el suero del coágulo'], answer:1 },
    { q:'Antes de insertar la aguja para venopunción, el alcohol del sitio debe:', options:['Limpiarse con gasa seca','Dejarse secar completamente (30 segundos)','Soplarse para secar más rápido','Cubrirse con un parche'], answer:1 },
    { q:'¿Cuáles son los dos identificadores mínimos requeridos para identificar al paciente antes de la extracción?', options:['Nombre y número de cuarto','Nombre completo y fecha de nacimiento (o ID)','Solo nombre','Nombre y tipo de prueba'], answer:1 },
    { q:'La punción del talón neonatal NUNCA debe realizarse en:', options:['La cara plantar medial','La cara plantar lateral','El arco posterior del talón','La zona central del talón'], answer:2 },
    { q:'¿Qué prueba CLIA waived puede realizarse en el punto de atención con sangre capilar?', options:['Cultivo bacteriano','Glucosa en sangre con glucómetro','Hemocultivo','Coagulación completa'], answer:1 },
    { q:'Para la Curva de Tolerancia a la Glucosa (GTT), el paciente debe estar en ayunas durante:', options:['2-4 horas','4-6 horas','8-12 horas','24 horas'], answer:2 },
  ],
};

async function main() {
  const conn = await mysql.createConnection(DB);

  // Idempotent: delete existing Spanish Phlebotomy course if re-running
  const [existing] = await conn.execute(
    `SELECT id FROM courses WHERE slug = 'tecnico-flebotomia' LIMIT 1`
  );
  if (existing.length > 0) {
    const oldId = existing[0].id;
    const [oldLessons] = await conn.execute(`SELECT id FROM lessons WHERE course_id = ?`, [oldId]);
    for (const l of oldLessons) {
      await conn.execute(`DELETE FROM quiz_questions WHERE lesson_id = ?`, [l.id]);
    }
    await conn.execute(`DELETE FROM lessons WHERE course_id = ?`, [oldId]);
    await conn.execute(`DELETE FROM courses WHERE id = ?`, [oldId]);
    console.log(`Cleared existing Spanish Phlebotomy course (id=${oldId})`);
  }

  // Insert Spanish course row
  const [courseResult] = await conn.execute(
    `INSERT INTO courses (title, slug, description, category, level, is_published, price, sort_order, lang, paired_course_id)
     VALUES (?, ?, ?, ?, ?, 1, 0.00, 12, 'es', ?)`,
    [
      'Técnico en Flebotomía (CPT)',
      'tecnico-flebotomia',
      'Preparación completa para la certificación CPT: anatomía vascular, equipo y tubos, técnica de venopunción, manejo de muestras y procedimientos especiales.',
      'Medical Assistant',
      'beginner',
      EN_COURSE_ID,
    ]
  );
  const COURSE_ID = courseResult.insertId;
  console.log(`Created Spanish Phlebotomy course: id=${COURSE_ID}`);

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
  console.log(`\nCurso de Flebotomia en espanol completado -- ${lessons.length} lecciones.`);
}

main().catch(err => { console.error(err); process.exit(1); });
