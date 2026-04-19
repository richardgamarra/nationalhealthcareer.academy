/**
 * populate-ekg-course-es.js
 * Creates the Spanish version of Course 11 — Técnico de EKG (Electrocardiograma)
 * Pairs with English course ID 11.
 * Run from /var/www/nationalhealthcareer-com/
 */

const mysql = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const path = require('path');

const DB = { host:'localhost', user:'admin_nhca', password:'2u95#I7jm', database:'nha_db' };
const UPLOADS = '/var/www/nationalhealthcareer-com/public/uploads';
const EN_COURSE_ID = 11;
const SLUG_SUFFIX = '-c11es';

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
  const filename = `${Date.now()}-ekg-es-${key}.pptx`;
  const fullPath = path.join(UPLOADS, filename);
  pptx.writeFile({ fileName: fullPath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

const lessons = [
  // SECTION 1 — ANATOMÍA CARDÍACA E INTRODUCCIÓN
  { sort:1, section:'ANATOMÍA CARDÍACA E INTRODUCCIÓN', type:'text', title:'Bienvenido al Curso de Técnico de EKG',
    content:`<h2>Bienvenido al Curso de Técnico de EKG</h2>
<p>El electrocardiograma (EKG o ECG) es una de las herramientas diagnósticas más utilizadas en la medicina moderna. Como técnico de EKG, usted desempeñará un papel fundamental en la detección y monitoreo de condiciones cardíacas.</p>
<h3>El EKG como herramienta diagnóstica</h3>
<ul><li>Registra la actividad eléctrica del corazón en tiempo real</li>
<li>Es no invasivo, rápido y de bajo costo</li>
<li>Permite detectar arritmias, infartos, hipertrofia y otras condiciones</li>
<li>Es esencial en urgencias, hospitalización y seguimiento ambulatorio</li></ul>
<h3>Papel del Técnico de EKG</h3>
<ul><li>Preparar al paciente para el procedimiento</li>
<li>Colocar los electrodos correctamente</li>
<li>Adquirir el EKG con técnica adecuada</li>
<li>Identificar artefactos y repetir si es necesario</li>
<li>Transmitir el EKG al médico para su interpretación</li>
<li>Notificar hallazgos urgentes al personal clínico responsable</li></ul>
<h3>Certificación CET de NHA</h3>
<p>La certificación CET (Técnico de Electrocardiograma Certificado) de la NHA valida sus competencias en adquisición e interpretación básica de EKGs. Este curso lo prepara completamente para el examen.</p>
<h3>Aplicaciones clínicas del EKG</h3>
<ul><li>Diagnóstico de infarto agudo de miocardio (IAM)</li>
<li>Detección y clasificación de arritmias cardíacas</li>
<li>Evaluación de efectos de medicamentos en el corazón</li>
<li>Monitoreo de pacientes durante cirugía y hospitalización</li>
<li>Pruebas de esfuerzo (ergometría) y Holter</li></ul>` },

  { sort:2, section:'ANATOMÍA CARDÍACA E INTRODUCCIÓN', type:'presentation', title:'Anatomía y Fisiología Cardíaca',
    pptxKey:'anatomy', pptxTitle:'Anatomía y Fisiología Cardíaca', pptxSub:'Fundamentos para el Técnico de EKG',
    pptxBullets:[
      { heading:'Estructura del Corazón', points:[
        '4 cámaras: aurícula derecha, aurícula izquierda, ventrículo derecho, ventrículo izquierdo',
        'Válvulas AV: mitral (bicúspide) y tricúspide — separan aurículas de ventrículos',
        'Válvulas semilunares: aórtica y pulmonar — separan ventrículos de grandes vasos',
        'Tabiques: interventricular e interauricular — separan los lados del corazón',
        'Capas: pericardio (saco protector), miocardio (músculo), endocardio (revestimiento interno)',
      ]},
      { heading:'Sistema de Conducción Eléctrica', points:[
        'Nodo SA (sinoauricular): marcapasos natural, genera el impulso a 60-100 lpm',
        'Nodo AV (auriculoventricular): retrasa el impulso 0.12-0.20 s para llenado ventricular',
        'Haz de His: conduce el impulso hacia los ventrículos',
        'Ramas derecha e izquierda: distribuyen el impulso a cada ventrículo',
        'Fibras de Purkinje: distribuyen el impulso por todo el miocardio ventricular',
      ]},
      { heading:'El Ciclo Cardíaco', points:[
        'Sístole auricular: contracción de aurículas, llena los ventrículos',
        'Sístole ventricular: contracción de ventrículos, expulsa la sangre',
        'Diástole: relajación de todas las cámaras, llenado pasivo',
        'Presiones: mayor en aorta (~120 mmHg sistólica), menor en aurícula derecha',
        'Sincronía mecánico-eléctrica: cada evento eléctrico produce un evento mecánico',
      ]},
    ]
  },

  { sort:3, section:'ANATOMÍA CARDÍACA E INTRODUCCIÓN', type:'text', title:'El Sistema de Conducción Eléctrica del Corazón',
    content:`<h2>El Sistema de Conducción Eléctrica del Corazón</h2>
<p>El corazón genera y conduce sus propios impulsos eléctricos gracias a un sistema especializado de células conductoras. Comprender este sistema es esencial para interpretar el EKG.</p>
<h3>Nodo Sinoauricular (SA)</h3>
<ul><li>Localizado en la aurícula derecha, cerca de la entrada de la vena cava superior</li>
<li>Es el marcapasos natural del corazón, genera 60-100 impulsos por minuto</li>
<li>Si falla, el nodo AV toma el control (40-60 lpm) o los ventrículos (20-40 lpm)</li></ul>
<h3>Nodo Auriculoventricular (AV)</h3>
<ul><li>Ubicado en la unión auriculoventricular, en la parte baja de la aurícula derecha</li>
<li>Produce un retraso fisiológico de 0.12-0.20 segundos (intervalo PR en el EKG)</li>
<li>Este retraso permite que las aurículas se contraigan y llenen los ventrículos antes de la sístole ventricular</li></ul>
<h3>Haz de His, Ramas y Fibras de Purkinje</h3>
<ul><li>Haz de His: único camino eléctrico entre aurículas y ventrículos</li>
<li>Rama derecha: conduce el impulso al ventrículo derecho</li>
<li>Rama izquierda: se divide en fascículo anterior y posterior hacia el ventrículo izquierdo</li>
<li>Fibras de Purkinje: red final que distribuye rápidamente el impulso por todo el miocardio ventricular</li></ul>
<h3>Importancia clínica</h3>
<ul><li>Las alteraciones en cualquier parte del sistema de conducción producen arritmias</li>
<li>Un bloqueo del nodo AV puede manifestarse como bloqueo AV de 1°, 2° o 3° grado</li>
<li>Un bloqueo de rama produce QRS ancho y morfología característica en el EKG</li></ul>` },

  { sort:4, section:'ANATOMÍA CARDÍACA E INTRODUCCIÓN', type:'text', title:'Bases Eléctricas del EKG',
    content:`<h2>Bases Eléctricas del EKG</h2>
<p>El EKG registra la actividad eléctrica del corazón desde la superficie corporal. Para interpretarlo, es fundamental comprender los conceptos de potencial de acción y la calibración del equipo.</p>
<h3>Potencial de Acción Cardíaco</h3>
<ul><li><strong>Despolarización:</strong> entrada de Na⁺ y Ca²⁺ a la célula → la célula se vuelve positiva → contracción</li>
<li><strong>Repolarización:</strong> salida de K⁺ → la célula recupera su carga negativa → relajación</li>
<li>Los iones principales involucrados son: Na⁺ (sodio), K⁺ (potasio) y Ca²⁺ (calcio)</li></ul>
<h3>Período Refractario</h3>
<ul><li><strong>Período refractario absoluto:</strong> la célula no puede despolarizarse de nuevo (coincide con el QRS y ST)</li>
<li><strong>Período refractario relativo:</strong> se necesita un estímulo muy fuerte para despolarizar (onda T)</li>
<li>Un estímulo en el período refractario relativo puede desencadenar fibrilación ventricular (fenómeno R sobre T)</li></ul>
<h3>El EKG como Registro Eléctrico</h3>
<ul><li>Los electrodos en la piel detectan diferencias de potencial eléctrico entre dos puntos</li>
<li>La actividad eléctrica se traza en papel milimetrado como ondas positivas (hacia arriba) y negativas (hacia abajo)</li>
<li>Cada onda representa un evento eléctrico específico del ciclo cardíaco</li></ul>
<h3>Calibración Estándar</h3>
<ul><li><strong>Velocidad del papel:</strong> 25 mm por segundo (estándar)</li>
<li><strong>Voltaje:</strong> 10 mm por mV (ganancia estándar)</li>
<li>1 cuadro pequeño = 0.04 s (horizontal) y 0.1 mV (vertical)</li>
<li>1 cuadro grande (5 cuadros pequeños) = 0.20 s (horizontal) y 0.5 mV (vertical)</li></ul>` },

  { sort:5, section:'ANATOMÍA CARDÍACA E INTRODUCCIÓN', type:'quiz', title:'Quiz 1: Anatomía Cardíaca',
    quizKey:'q1' },

  // SECTION 2 — EL EKG DE 12 DERIVACIONES
  { sort:6, section:'EL EKG DE 12 DERIVACIONES', type:'text', title:'Las 12 Derivaciones del EKG',
    content:`<h2>Las 12 Derivaciones del EKG</h2>
<p>El EKG estándar de 12 derivaciones proporciona 12 vistas distintas de la actividad eléctrica del corazón, desde diferentes ángulos, lo que permite localizar alteraciones con precisión.</p>
<h3>Derivaciones de Miembros (6 derivaciones)</h3>
<ul><li><strong>Bipolares (I, II, III):</strong> miden la diferencia de potencial entre dos electrodos de miembros
  <ul><li>Derivación I: brazo izquierdo (+) vs. brazo derecho (-)</li>
  <li>Derivación II: pierna izquierda (+) vs. brazo derecho (-)</li>
  <li>Derivación III: pierna izquierda (+) vs. brazo izquierdo (-)</li></ul></li>
<li><strong>Unipolares aumentadas (aVR, aVL, aVF):</strong> miden el potencial en un punto respecto a un punto de referencia central
  <ul><li>aVR: brazo derecho, aVL: brazo izquierdo, aVF: pie izquierdo</li></ul></li></ul>
<h3>Derivaciones Precordiales (V1-V6)</h3>
<ul><li>Unipolares, colocadas en el tórax anterior</li>
<li>V1: 4° espacio intercostal, borde paraesternal derecho</li>
<li>V2: 4° espacio intercostal, borde paraesternal izquierdo</li>
<li>V3: entre V2 y V4</li>
<li>V4: 5° espacio intercostal, línea medioclavicular izquierda</li>
<li>V5: 5° espacio intercostal, línea axilar anterior izquierda</li>
<li>V6: 5° espacio intercostal, línea axilar media izquierda</li></ul>
<h3>Ejes y Vectores</h3>
<ul><li>El eje eléctrico del QRS en el plano frontal se calcula con las derivaciones de miembros</li>
<li>Eje normal: entre -30° y +90°</li>
<li>Desviación axial izquierda: entre -30° y -90° (HVI, HBAI)</li>
<li>Desviación axial derecha: entre +90° y +180° (HVD, HBPI)</li></ul>` },

  { sort:7, section:'EL EKG DE 12 DERIVACIONES', type:'presentation', title:'EKG de 12 Derivaciones: Colocación y Lectura',
    pptxKey:'12lead', pptxTitle:'EKG de 12 Derivaciones: Colocación y Lectura', pptxSub:'Electrodos, papel e interpretación sistemática',
    pptxBullets:[
      { heading:'Colocación de Electrodos', points:[
        'RA (brazo derecho): cara interna del antebrazo derecho',
        'LA (brazo izquierdo): cara interna del antebrazo izquierdo',
        'RL (pierna derecha): cara interna de la pierna derecha (tierra)',
        'LL (pierna izquierda): cara interna de la pierna izquierda',
        'V1: 4° EIC borde paraesternal derecho | V2: 4° EIC borde paraesternal izquierdo',
        'V3: entre V2 y V4 | V4: 5° EIC línea medioclavicular izq.',
        'V5: 5° EIC línea axilar anterior izq. | V6: 5° EIC línea axilar media izq.',
      ]},
      { heading:'Lectura del Papel de EKG', points:[
        'Cuadrícula milimetrada: cuadros pequeños de 1 mm',
        '1 cuadro pequeño horizontal = 0.04 s (a 25 mm/s)',
        '1 cuadro pequeño vertical = 0.1 mV (a ganancia 10 mm/mV)',
        '1 cuadro grande (5 pequeños) = 0.20 s y 0.5 mV',
        'Calibración estándar: pulso de 10 mm de altura al inicio',
      ]},
      { heading:'Evaluación Sistemática del Ritmo', points:[
        'Paso 1: ¿El ritmo es regular o irregular?',
        'Paso 2: ¿Cuál es la frecuencia cardíaca? (300 ÷ número de cuadros grandes entre R-R)',
        'Paso 3: ¿Hay onda P antes de cada QRS? ¿Morfología normal?',
        'Paso 4: ¿Cuánto mide el intervalo PR? (normal 0.12-0.20 s)',
        'Paso 5: ¿Cuánto mide el QRS? (normal <0.12 s)',
        'Paso 6: ¿Cuánto mide el QT/QTc? ¿Hay cambios en ST y onda T?',
      ]},
    ]
  },

  { sort:8, section:'EL EKG DE 12 DERIVACIONES', type:'text', title:'Cómo Leer el Papel de EKG',
    content:`<h2>Cómo Leer el Papel de EKG</h2>
<p>El papel de EKG es una cuadrícula milimetrada que permite medir con precisión la duración y amplitud de todos los eventos eléctricos cardíacos.</p>
<h3>El Papel Milimetrado</h3>
<ul><li>Cuadros pequeños de 1 mm × 1 mm</li>
<li>Cuadros grandes de 5 mm × 5 mm (cada 5 cuadros pequeños)</li>
<li>A velocidad estándar (25 mm/s): 1 cuadro pequeño = 0.04 s; 1 cuadro grande = 0.20 s</li>
<li>A ganancia estándar (10 mm/mV): 1 cuadro pequeño = 0.1 mV; 1 cuadro grande = 0.5 mV</li></ul>
<h3>Las Ondas del EKG</h3>
<ul><li><strong>Onda P:</strong> despolarización auricular; duración normal <0.12 s, amplitud <2.5 mm</li>
<li><strong>Complejo QRS:</strong> despolarización ventricular; duración normal <0.12 s</li>
<li><strong>Onda T:</strong> repolarización ventricular; normalmente positiva en la mayoría de las derivaciones</li>
<li><strong>Onda U:</strong> repolarización de fibras de Purkinje; pequeña, positiva, a veces no visible</li></ul>
<h3>Los Intervalos y Segmentos</h3>
<ul><li><strong>Intervalo PR:</strong> inicio de P hasta inicio de QRS; normal 0.12-0.20 s</li>
<li><strong>Intervalo QRS:</strong> duración del complejo QRS; normal <0.12 s</li>
<li><strong>Segmento ST:</strong> entre el final del QRS y el inicio de T; normalmente isoeléctrico</li>
<li><strong>Intervalo QT:</strong> inicio de QRS hasta final de T; varía con la frecuencia; QTc normal <0.44 s hombres, <0.46 s mujeres</li></ul>
<h3>Medición de la Frecuencia Cardíaca</h3>
<ul><li>Método rápido: 300 ÷ número de cuadros grandes entre dos ondas R consecutivas</li>
<li>Método preciso (ritmo irregular): contar QRS en 6 segundos × 10</li></ul>` },

  { sort:9, section:'EL EKG DE 12 DERIVACIONES', type:'text', title:'Ritmo Sinusal Normal y Variantes',
    content:`<h2>Ritmo Sinusal Normal y Variantes</h2>
<p>El ritmo sinusal normal es el ritmo cardíaco generado por el nodo SA con todas las características de conducción intactas.</p>
<h3>Criterios del Ritmo Sinusal Normal</h3>
<ul><li>Frecuencia: 60-100 latidos por minuto</li>
<li>Onda P antes de cada complejo QRS, con morfología uniforme</li>
<li>Intervalo PR: 0.12-0.20 segundos (constante)</li>
<li>Complejo QRS: <0.12 segundos (estrecho)</li>
<li>Ritmo regular (intervalo RR constante, variación <0.04 s)</li></ul>
<h3>Variantes Sinusales</h3>
<ul><li><strong>Taquicardia sinusal:</strong> ritmo sinusal con frecuencia >100 lpm; causas: ejercicio, fiebre, ansiedad, hipovolemia, sepsis</li>
<li><strong>Bradicardia sinusal:</strong> ritmo sinusal con frecuencia <60 lpm; causas: atletas, hipotiroidismo, medicamentos (betabloqueantes), síndrome de nodo sinusal enfermo</li>
<li><strong>Arritmia sinusal:</strong> ritmo sinusal irregular relacionado con la respiración (normal en jóvenes); el intervalo RR varía >0.04 s entre latidos</li>
<li><strong>Marcapasos de escape:</strong> cuando el nodo SA falla, el nodo AV (40-60 lpm) o los ventrículos (20-40 lpm) toman el control</li></ul>` },

  { sort:10, section:'EL EKG DE 12 DERIVACIONES', type:'quiz', title:'Quiz 2: EKG de 12 Derivaciones',
    quizKey:'q2' },

  // SECTION 3 — INTERPRETACIÓN DE RITMOS
  { sort:11, section:'INTERPRETACIÓN DE RITMOS', type:'text', title:'Arritmias Supraventriculares',
    content:`<h2>Arritmias Supraventriculares</h2>
<p>Las arritmias supraventriculares se originan por encima del haz de His (en aurículas o nodo AV). En general producen QRS estrecho (<0.12 s), salvo que haya conducción aberrante.</p>
<h3>Fibrilación Auricular (FA)</h3>
<ul><li>La arritmia sostenida más frecuente</li>
<li>Múltiples circuitos de reentrada en las aurículas → actividad auricular caótica (350-600 lpm)</li>
<li>EKG: ausencia de ondas P definidas, ondas "f" irregulares de baja amplitud, intervalo RR completamente irregular</li>
<li>Riesgo principal: formación de trombos y accidente cerebrovascular</li></ul>
<h3>Flutter Auricular</h3>
<ul><li>Circuito de reentrada organizado en la aurícula derecha a 250-350 lpm</li>
<li>EKG: ondas F en "dientes de sierra" en derivaciones II, III y aVF; bloqueo AV típico 2:1, 3:1 o 4:1</li>
<li>Frecuencia ventricular: 75-175 lpm según el grado de bloqueo AV</li></ul>
<h3>Taquicardia Supraventricular Paroxística (TSVP)</h3>
<ul><li>Inicio y terminación bruscos</li>
<li>Frecuencia: 150-250 lpm, QRS estrecho, onda P oculta en QRS o al final</li>
<li>Mecanismo: reentrada en el nodo AV o por vía accesoria (Wolf-Parkinson-White)</li></ul>
<h3>Complejos Auriculares Prematuros (CAP)</h3>
<ul><li>Impulso prematuro originado en la aurícula fuera del nodo SA</li>
<li>EKG: onda P de morfología diferente, QRS estrecho (normal), pausa no compensatoria</li></ul>` },

  { sort:12, section:'INTERPRETACIÓN DE RITMOS', type:'presentation', title:'Interpretación de Arritmias',
    pptxKey:'arrhythmias', pptxTitle:'Interpretación de Arritmias', pptxSub:'Ventriculares, bloqueos de rama y bloqueos AV',
    pptxBullets:[
      { heading:'Arritmias Ventriculares', points:[
        'CVP: QRS ancho (>0.12s) y bizarro, sin onda P precedente, pausa compensatoria completa',
        'Taquicardia ventricular: ≥3 CVP consecutivos, frecuencia >100 lpm, QRS ancho',
        'Fibrilación ventricular: actividad eléctrica caótica sin QRS reconocibles — emergencia absoluta',
        'TV y FV requieren desfibrilación o cardioversión inmediata',
      ]},
      { heading:'Bloqueos de Rama', points:[
        'Bloqueo de rama derecha (BRDHH): rSR\' en V1 ("oreja de conejo"), S ancha y mellada en I y V6, QRS ≥0.12 s',
        'Bloqueo de rama izquierda (BRIHH): QS o rS en V1, R ancha monofásica en V6, QRS ≥0.12 s',
        'Ambos producen QRS ancho (≥0.12 s)',
        'El BRIHH nuevo en contexto de dolor torácico sugiere IAM anterior',
      ]},
      { heading:'Bloqueos AV', points:[
        '1° grado: PR >0.20 s, todos los QRS presentes — benigno',
        '2° grado Mobitz I (Wenckebach): PR se alarga progresivamente hasta que un QRS no aparece — ciclo repetitivo',
        '2° grado Mobitz II: PR fijo, QRS cae súbitamente sin previo aviso — más grave, puede progresar a 3°',
        '3° grado (completo): disociación AV completa, P y QRS sin relación — emergencia, requiere marcapasos',
      ]},
    ]
  },

  { sort:13, section:'INTERPRETACIÓN DE RITMOS', type:'text', title:'Arritmias Ventriculares y de Urgencia',
    content:`<h2>Arritmias Ventriculares y de Urgencia</h2>
<p>Las arritmias ventriculares pueden ser benignas (CVP aislados) o letales (TV/FV). El reconocimiento rápido es crítico para el manejo adecuado.</p>
<h3>Complejos Ventriculares Prematuros (CVP)</h3>
<ul><li>Impulso originado en el miocardio ventricular, fuera del sistema de conducción normal</li>
<li>EKG: QRS ancho (>0.12 s) y bizarro, sin onda P precedente, pausa compensatoria completa</li>
<li>Aislados: generalmente benignos; en bigeminia, trigeminia o bigeminismo: requieren evaluación</li>
<li>CVP multifocales o en salvas: mayor riesgo de TV</li></ul>
<h3>Taquicardia Ventricular (TV)</h3>
<ul><li>≥3 CVP consecutivos a frecuencia >100 lpm (típicamente 100-250 lpm)</li>
<li>EKG: QRS ancho y bizarro, ritmo regular o ligeramente irregular, onda P independiente (disociación AV)</li>
<li>TV sostenida (>30 s) puede causar compromiso hemodinámico y muerte</li>
<li>Tratamiento: cardioversión eléctrica si inestable, amiodarona si estable</li></ul>
<h3>Fibrilación Ventricular (FV)</h3>
<ul><li>Actividad eléctrica ventricular caótica, sin contracciones efectivas</li>
<li>EKG: ondas irregulares y caóticas, sin QRS reconocibles</li>
<li>Causa paro cardíaco inmediato: el paciente pierde el pulso y la conciencia</li>
<li>Tratamiento: desfibrilación eléctrica inmediata + RCP</li></ul>
<h3>Asistolia y AESP</h3>
<ul><li><strong>Asistolia:</strong> línea plana — ausencia total de actividad eléctrica</li>
<li><strong>AESP (Actividad Eléctrica Sin Pulso):</strong> actividad eléctrica organizada sin pulso palpable</li>
<li>Ambas requieren RCP y búsqueda de causas reversibles (las "H y T")</li></ul>` },

  { sort:14, section:'INTERPRETACIÓN DE RITMOS', type:'text', title:'Bloqueos de Conducción y Cambios del Segmento ST',
    content:`<h2>Bloqueos de Conducción y Cambios del Segmento ST</h2>
<h3>Bloqueos AV</h3>
<ul><li><strong>1° grado:</strong> PR >0.20 s, cada P conduce un QRS; asintomático, no requiere tratamiento</li>
<li><strong>2° grado Mobitz I (Wenckebach):</strong> PR se alarga progresivamente hasta que un QRS no aparece, luego el ciclo se reinicia</li>
<li><strong>2° grado Mobitz II:</strong> PR fijo, algunos QRS no aparecen sin previo aviso; riesgo de progresión a bloqueo completo</li>
<li><strong>3° grado (completo):</strong> disociación AV completa; P y QRS sin relación; el ventrículo latido por ritmo de escape; requiere marcapasos urgente</li></ul>
<h3>Bloqueos de Rama</h3>
<ul><li><strong>BRDHH:</strong> rSR' en V1, S ancha en I y V6, QRS ≥0.12 s</li>
<li><strong>BRIHH:</strong> QS en V1, R monofásica ancha en V6, QRS ≥0.12 s; nuevo BRIHH = equivalente a STEMI</li></ul>
<h3>Cambios del Segmento ST</h3>
<ul><li><strong>Elevación ST:</strong> IAM con elevación ST (STEMI), pericarditis, vasoespasmo</li>
<li><strong>Depresión ST:</strong> isquemia subendocárdica, efecto digitálico (cubeta), hipertrofia ventricular</li></ul>
<h3>Cambios en la Onda T</h3>
<ul><li><strong>Inversión de T:</strong> isquemia, sobrecarga ventricular, síndrome de Wellens</li>
<li><strong>T picuda (hiperaguda):</strong> fase muy temprana de STEMI, hiperpotasemia</li>
<li><strong>QT prolongado:</strong> riesgo de taquicardia ventricular polimórfica (torsades de pointes)</li></ul>` },

  { sort:15, section:'INTERPRETACIÓN DE RITMOS', type:'quiz', title:'Quiz 3: Interpretación de Ritmos',
    quizKey:'q3' },

  // SECTION 4 — ADQUISICIÓN DEL EKG Y CUIDADO DEL PACIENTE
  { sort:16, section:'ADQUISICIÓN DEL EKG Y CUIDADO DEL PACIENTE', type:'text', title:'Preparación del Paciente y Comunicación',
    content:`<h2>Preparación del Paciente y Comunicación</h2>
<p>Una buena preparación del paciente es fundamental para obtener un EKG de calidad libre de artefactos. La comunicación efectiva también reduce la ansiedad y mejora la cooperación.</p>
<h3>Saludo y Presentación</h3>
<ul><li>Presentarse con nombre y título al entrar a la habitación</li>
<li>Confirmar la identidad del paciente con al menos dos identificadores (nombre completo + fecha de nacimiento)</li>
<li>Explicar el procedimiento de forma clara y sencilla: "Voy a colocar unos sensores en su pecho y extremidades para registrar la actividad eléctrica de su corazón"</li></ul>
<h3>Preparación de la Piel</h3>
<ul><li>Rasurar el vello excesivo si es necesario para asegurar buen contacto del electrodo</li>
<li>Limpiar la piel con alcohol isopropílico para eliminar aceites y residuos</li>
<li>Secar completamente antes de colocar el electrodo</li>
<li>Si la piel está muy seca o callosa, frotar suavemente con gasa (abrasión suave) para mejorar el contacto</li></ul>
<h3>Posicionamiento del Paciente</h3>
<ul><li>Posición supina (decúbito dorsal) en camilla plana — estándar para el EKG de 12 derivaciones</li>
<li>Brazos a los costados, relajados</li>
<li>Garantizar privacidad y confort: cubrir al paciente adecuadamente</li></ul>
<h3>Manejo de Pacientes Ansiosos</h3>
<ul><li>Explicar que el procedimiento es completamente indoloro y no emite corriente eléctrica</li>
<li>Pedir al paciente que respire normal y permanezca inmóvil durante la adquisición</li>
<li>Hablar con voz calmada y tranquilizadora</li>
<li>La ansiedad y el temblor muscular son causas frecuentes de artefacto somático</li></ul>` },

  { sort:17, section:'ADQUISICIÓN DEL EKG Y CUIDADO DEL PACIENTE', type:'presentation', title:'Adquisición del EKG y Reducción de Artefactos',
    pptxKey:'acquisition', pptxTitle:'Adquisición del EKG y Reducción de Artefactos', pptxSub:'Causas, soluciones y procedimiento estándar',
    pptxBullets:[
      { heading:'Artefactos Comunes y Causas', points:[
        'Artefacto somático/muscular: tensión muscular, temblor del paciente (Parkinson, frío, ansiedad)',
        'Artefacto CA (60 Hz): interferencia eléctrica de equipos cercanos, cables sueltos o mal conectados',
        'Derivación errante (wandering baseline): movimiento respiratorio, electrodos mal fijados, gel insuficiente',
        'Artefacto de movimiento: paciente en movimiento durante la adquisición',
      ]},
      { heading:'Soluciones para Cada Artefacto', points:[
        'Artefacto muscular: pedir al paciente que se relaje, caliente la habitación, reposicionar extremidades',
        'Artefacto CA: alejar cables de equipos eléctricos, verificar todas las conexiones, usar filtro de 60 Hz',
        'Derivación errante: re-preparar la piel, asegurar electrodos firmemente, verificar cantidad de gel',
        'Artefacto de movimiento: esperar a que el paciente esté quieto, repetir adquisición',
      ]},
      { heading:'Procedimiento Estándar de Adquisición', points:[
        '1. Verificar que el electrocardiógrafo está calibrado y en buen estado',
        '2. Preparar la piel (limpiar, secar, rasurar si es necesario)',
        '3. Colocar los 10 electrodos (4 de miembros + 6 precordiales) en las posiciones correctas',
        '4. Conectar los cables al electrocardiógrafo y verificar buena señal',
        '5. Adquirir mínimo 10 segundos de registro continuo y verificar la calidad antes de retirar electrodos',
      ]},
    ]
  },

  { sort:18, section:'ADQUISICIÓN DEL EKG Y CUIDADO DEL PACIENTE', type:'text', title:'Mantenimiento del Equipo de EKG',
    content:`<h2>Mantenimiento del Equipo de EKG</h2>
<p>El mantenimiento adecuado del equipo garantiza la calidad y confiabilidad de los EKGs adquiridos, y prolonga la vida útil del electrocardiógrafo.</p>
<h3>Limpieza y Desinfección</h3>
<ul><li>Limpiar la superficie del electrocardiógrafo con paño húmedo y desinfectante de nivel bajo entre pacientes</li>
<li>Los cables y sondas deben limpiarse con alcohol isopropílico o desinfectante compatible con el fabricante</li>
<li>Nunca sumergir el equipo en líquido</li></ul>
<h3>Mantenimiento de Cables</h3>
<ul><li>Evitar nudos, dobleces severos y aplastamiento de los cables</li>
<li>Enrollar los cables sin forzarlos, siguiendo su curvatura natural</li>
<li>Inspeccionar regularmente en busca de cables pelados, rotos o con conexiones flojas</li>
<li>Un cable dañado puede causar artefactos o pérdida de derivaciones</li></ul>
<h3>Electrodos</h3>
<ul><li><strong>Desechables:</strong> uso único, retirar después de cada paciente, no reutilizar</li>
<li><strong>Reutilizables (de paletas/presión):</strong> limpiar con alcohol después de cada uso, revisar el gel</li>
<li>Verificar fecha de expiración de los electrodos desechables</li></ul>
<h3>Control de Calidad y Calibración</h3>
<ul><li>Verificar el pulso de calibración (10 mm de altura) al inicio de cada EKG</li>
<li>Controlar el nivel de la batería si el equipo es portátil</li>
<li>Verificar que el papel esté correctamente instalado y sea el adecuado para el equipo</li>
<li>Reportar inmediatamente cualquier equipo defectuoso al supervisor o departamento de bioingeniería</li></ul>` },

  { sort:19, section:'ADQUISICIÓN DEL EKG Y CUIDADO DEL PACIENTE', type:'text', title:'Documentación y Reporte del EKG',
    content:`<h2>Documentación y Reporte del EKG</h2>
<p>La documentación correcta del EKG es tan importante como la calidad técnica del registro. Errores de identificación pueden tener consecuencias clínicas graves.</p>
<h3>Identificación del Paciente</h3>
<ul><li>Nombre completo del paciente (tal como aparece en el expediente médico)</li>
<li>Fecha de nacimiento o número de identificación del paciente</li>
<li>Número de expediente o ID hospitalario</li>
<li>Verificar siempre con el paciente (o la pulsera de identificación) antes de tomar el EKG</li></ul>
<h3>Información del Registro</h3>
<ul><li>Fecha y hora exactas de adquisición del EKG</li>
<li>Indicación clínica (dolor torácico, disnea, síncope, control rutinario, etc.)</li>
<li>Nombre o iniciales del técnico que realizó el EKG</li>
<li>Cualquier condición especial (paciente agitado, artefacto inevitable, posición diferente)</li></ul>
<h3>Transmisión y Reporte</h3>
<ul><li>Transmitir el EKG al médico responsable de forma inmediata, especialmente si hay hallazgos urgentes</li>
<li>Notificar verbalmente al médico si se detectan patrones de alarma: STEMI, TV, FV, asistolia, bloqueo AV completo</li>
<li>La interpretación preliminar del EKG corresponde únicamente al médico — el técnico no diagnostica</li></ul>
<h3>Archivo y Retención</h3>
<ul><li>Los EKGs deben almacenarse en el expediente electrónico del paciente o en archivo físico seguro</li>
<li>Los períodos de retención varían según la institución y las regulaciones locales (típicamente 7-10 años)</li>
<li>La confidencialidad del EKG está protegida por HIPAA</li></ul>` },

  { sort:20, section:'ADQUISICIÓN DEL EKG Y CUIDADO DEL PACIENTE', type:'quiz', title:'Quiz 4: Adquisición y Cuidado del Paciente',
    quizKey:'q4' },

  // SECTION 5 — CONDICIONES CLÍNICAS Y EKG
  { sort:21, section:'CONDICIONES CLÍNICAS Y EKG', type:'text', title:'EKG en el Síndrome Coronario Agudo',
    content:`<h2>EKG en el Síndrome Coronario Agudo</h2>
<p>El síndrome coronario agudo (SCA) incluye la angina inestable, el NSTEMI y el STEMI. El EKG es la herramienta diagnóstica inicial más rápida y accesible.</p>
<h3>Angina Estable vs. Inestable</h3>
<ul><li><strong>Angina estable:</strong> dolor predecible con el esfuerzo, cede con reposo o nitratos; EKG en reposo puede ser normal</li>
<li><strong>Angina inestable:</strong> dolor en reposo o con mínimo esfuerzo; depresión ST o inversión de T en el EKG</li></ul>
<h3>IAM con Elevación ST (STEMI)</h3>
<ul><li>Oclusión completa de una arteria coronaria → necrosis transmural</li>
<li>Criterios: elevación del ST ≥1 mm en ≥2 derivaciones contiguas (≥2 mm en V1-V3)</li>
<li>Evolución típica: T hiperaguda → elevación ST → onda Q patológica → inversión de T → normalización ST</li>
<li>Requiere revascularización urgente (angioplastia o fibrinólisis)</li></ul>
<h3>IAM sin Elevación ST (NSTEMI)</h3>
<ul><li>Oclusión parcial o espasmo → isquemia subendocárdica</li>
<li>EKG: depresión ST, inversión de T, o EKG normal con troponinas elevadas</li></ul>
<h3>Localización del Infarto por Derivaciones</h3>
<ul><li><strong>Anterior:</strong> V1-V4 (arteria descendente anterior izquierda)</li>
<li><strong>Inferior:</strong> II, III, aVF (arteria coronaria derecha o circunfleja)</li>
<li><strong>Lateral:</strong> I, aVL, V5, V6 (arteria circunfleja)</li>
<li><strong>Posterior:</strong> depresión ST en V1-V3, onda R alta en V1 (imagen espejo)</li></ul>
<h3>Onda Q Patológica</h3>
<ul><li>Indica necrosis miocárdica establecida</li>
<li>Criterios: duración ≥0.04 s Y amplitud ≥25% de la onda R en la misma derivación</li></ul>` },

  { sort:22, section:'CONDICIONES CLÍNICAS Y EKG', type:'presentation', title:'Condiciones Cardíacas y sus Hallazgos en EKG',
    pptxKey:'conditions', pptxTitle:'Condiciones Cardíacas y sus Hallazgos en EKG', pptxSub:'Hipertrofia, pericarditis y toxicidad por digitálicos',
    pptxBullets:[
      { heading:'Hipertrofia Ventricular', points:[
        'HVI (hipertrofia ventrículo izquierdo): criterio de Sokolow-Lyon: S en V1 + R en V5 o V6 ≥35 mm',
        'HVI también: R en aVL >11 mm, cambios secundarios del ST-T en V5/V6',
        'HVD (hipertrofia ventrículo derecho): eje derecho ≥+90°, R alta en V1 (R>S), S profunda en V6',
        'Ambas hipertrofias producen cambios secundarios en el segmento ST y onda T',
      ]},
      { heading:'Pericarditis', points:[
        'Inflamación del pericardio — causa viral más frecuente en adultos jóvenes',
        'EKG: elevación ST cóncava (en "silla de montar") difusa en casi todas las derivaciones',
        'Depresión del segmento PR — hallazgo muy específico de pericarditis',
        'Sin onda Q patológica — diferencia clave con el IAM',
        'La elevación ST en pericarditis es difusa; en STEMI es focal y convexa',
      ]},
      { heading:'Intoxicación por Digitálicos', points:[
        '"Cubeta digitálica": depresión cóncava del ST en derivaciones con R alta — efecto (no toxicidad)',
        'Bradicardia sinusal y bloqueos AV de diverso grado',
        'Arritmias ventriculares: CVP frecuentes, TV bidireccional (característica)',
        'Fibrilación auricular con respuesta ventricular lenta',
        'Los niveles séricos elevados de digoxina confirman la toxicidad',
      ]},
    ]
  },

  { sort:23, section:'CONDICIONES CLÍNICAS Y EKG', type:'text', title:'EKG en Desequilibrios Electrolíticos y Medicamentos',
    content:`<h2>EKG en Desequilibrios Electrolíticos y Medicamentos</h2>
<p>Los desequilibrios electrolíticos producen cambios característicos en el EKG que pueden ser la primera señal de una condición potencialmente mortal.</p>
<h3>Hiperpotasemia (K⁺ elevado)</h3>
<ul><li>Leve (5.5-6.5 mEq/L): ondas T picudas y simétricas (en punta)</li>
<li>Moderada (6.5-7.5 mEq/L): ensanchamiento del QRS, onda P aplanada</li>
<li>Grave (>7.5 mEq/L): patrón sinusoidal, fibrilación ventricular</li></ul>
<h3>Hipopotasemia (K⁺ bajo)</h3>
<ul><li>Onda U prominente (mayor de 1 mm), depresión del ST, QT aparente prolongado</li>
<li>Riesgo de arritmias ventriculares (especialmente con digoxina)</li></ul>
<h3>Hipercalcemia (Ca²⁺ elevado)</h3>
<ul><li>QT corto (acortamiento del segmento ST)</li>
<li>Puede producir bloqueos de conducción y arritmias</li></ul>
<h3>Hipocalcemia (Ca²⁺ bajo)</h3>
<ul><li>QT prolongado por alargamiento del segmento ST</li>
<li>Riesgo de torsades de pointes</li></ul>
<h3>Efecto de Medicamentos</h3>
<ul><li><strong>Digoxina:</strong> cubeta digitálica (depresión cóncava ST), PR largo, bradicardia</li>
<li><strong>Antiarrítmicos clase Ia (quinidina, procainamida):</strong> QT prolongado, ensanchamiento QRS</li>
<li><strong>Antiarrítmicos clase III (amiodarona, sotalol):</strong> QT prolongado</li>
<li><strong>Betabloqueantes:</strong> bradicardia sinusal, PR largo</li></ul>` },

  { sort:24, section:'CONDICIONES CLÍNICAS Y EKG', type:'quiz', title:'Quiz 5: Condiciones Clínicas',
    quizKey:'q5' },

  // SECTION 6 — PREPARACIÓN PARA EL EXAMEN CET
  { sort:25, section:'PREPARACIÓN PARA EL EXAMEN CET', type:'text', title:'Guía de Estudio para el Examen CET',
    content:`<h2>Guía de Estudio para el Examen CET</h2>
<h3>Estructura del Examen CET</h3>
<ul><li>100 preguntas de opción múltiple</li>
<li>Tiempo: 2.5 horas</li>
<li>Puntaje mínimo aprobatorio: 390 de 500 puntos</li>
<li>Formato: presencial en centro de pruebas o en línea supervisado</li></ul>
<h3>Dominios del Examen CET</h3>
<ul><li><strong>Interpretación de EKG: 40%</strong> — reconocimiento de ritmos, arritmias, cambios ST/T</li>
<li><strong>Anatomía y fisiología cardíaca: 25%</strong> — sistema de conducción, ciclo cardíaco</li>
<li><strong>Procedimiento de adquisición: 20%</strong> — colocación de electrodos, artefactos, equipo</li>
<li><strong>Cuidado del paciente y seguridad: 15%</strong> — preparación, comunicación, documentación</li></ul>
<h3>Estrategias de Estudio</h3>
<ul><li>Practique reconocimiento de tiras de ritmo — la interpretación pesa el 40%</li>
<li>Memorice los criterios de ritmo sinusal normal y sus variantes</li>
<li>Domine las posiciones exactas de los 10 electrodos</li>
<li>Estudie los criterios de STEMI (elevación ST ≥1 mm en ≥2 derivaciones contiguas)</li>
<li>Conozca los tres tipos de artefactos y sus soluciones</li></ul>
<h3>El Día del Examen</h3>
<ul><li>Llegue 30 minutos antes</li>
<li>Lleve identificación con foto vigente</li>
<li>Lea cada pregunta completamente; elimine opciones incorrectas primero</li>
<li>No deje preguntas sin responder — no hay penalización por respuesta incorrecta</li></ul>` },

  { sort:26, section:'PREPARACIÓN PARA EL EXAMEN CET', type:'presentation', title:'Estrategia para el Examen CET',
    pptxKey:'exam-prep', pptxTitle:'Estrategia para el Examen CET', pptxSub:'Dominios, conceptos clave y plan de estudio',
    pptxBullets:[
      { heading:'Dominios del Examen CET', points:[
        'Interpretación de EKG: 40% — área más importante del examen',
        'Anatomía y fisiología cardíaca: 25%',
        'Procedimiento de adquisición: 20%',
        'Cuidado del paciente y seguridad: 15%',
        'Concéntrese en interpretación de ritmos y anatomía cardíaca (65% del examen)',
      ]},
      { heading:'Conceptos Más Evaluados', points:[
        'Ritmo sinusal normal vs. anormal (taquicardia, bradicardia, FA, flutter)',
        'Las 12 derivaciones: bipolares, unipolares y precordiales y su ubicación exacta',
        'Artefactos comunes: somático, CA (60 Hz) y derivación errante — causas y soluciones',
        'STEMI vs. NSTEMI: criterios diagnósticos y localización por derivaciones',
        'Bloqueos AV de 1°, 2° (Mobitz I y II) y 3° — diferencias clave',
      ]},
      { heading:'Plan de Estudio 2 Semanas', points:[
        'Días 1-3: Anatomía cardíaca, sistema de conducción, bases del EKG',
        'Días 4-6: Las 12 derivaciones, colocación de electrodos, lectura del papel',
        'Días 7-9: Arritmias supraventriculares y ventriculares, bloqueos',
        'Días 10-11: Adquisición, artefactos, cuidado del paciente, documentación',
        'Días 12-14: Condiciones clínicas, exámenes de práctica, repaso de áreas débiles',
      ]},
    ]
  },

  { sort:27, section:'PREPARACIÓN PARA EL EXAMEN CET', type:'quiz', title:'Evaluación Final: Examen de Práctica CET',
    quizKey:'final' },
];

const quizzes = {
  q1: [
    { q:'¿Cuál es el marcapasos natural del corazón?', options:['Nodo AV','Fibras de Purkinje','Nodo SA','Haz de His'], answer:2 },
    { q:'¿Cuántas cámaras tiene el corazón?', options:['2','4','6','3'], answer:1 },
    { q:'¿Cuál es la frecuencia cardíaca normal del nodo SA?', options:['40-60 lpm','60-100 lpm','100-150 lpm','20-40 lpm'], answer:1 },
    { q:'¿Qué estructura produce el retraso fisiológico entre la contracción auricular y ventricular?', options:['Nodo SA','Fibras de Purkinje','Haz de His','Nodo AV'], answer:3 },
    { q:'El potencial de acción cardíaco involucra principalmente los iones:', options:['Na⁺, K⁺ y Ca²⁺','Mg²⁺ y Cl⁻','H⁺ y HCO₃⁻','Solo Na⁺'], answer:0 },
  ],
  q2: [
    { q:'¿Cuántas derivaciones tiene un EKG estándar?', options:['6','8','12','16'], answer:2 },
    { q:'¿A qué velocidad estándar se registra el papel de EKG?', options:['10 mm/s','25 mm/s','50 mm/s','5 mm/s'], answer:1 },
    { q:'¿Cuál es la duración normal del intervalo PR?', options:['0.04-0.08 seg','0.08-0.12 seg','0.12-0.20 seg','0.20-0.28 seg'], answer:2 },
    { q:'El electrodo V1 se coloca en:', options:['4° espacio intercostal línea paraesternal derecha','5° espacio intercostal línea media clavicular izquierda','4° espacio intercostal línea paraesternal izquierda','2° espacio intercostal derecho'], answer:0 },
    { q:'Un QRS cuya duración es mayor de 0.12 segundos indica:', options:['Ritmo sinusal normal','Taquicardia sinusal','Conducción ventricular anormal o bloqueo de rama','Bloqueo AV de primer grado'], answer:2 },
  ],
  q3: [
    { q:'En la fibrilación auricular, ¿cuál es el hallazgo más característico?', options:['QRS ancho y bizarro','Ondas P ausentes e intervalo RR completamente irregular','PR prolongado','Ondas F en dientes de sierra'], answer:1 },
    { q:'¿Cuál arritmia requiere desfibrilación eléctrica inmediata?', options:['Taquicardia sinusal','Fibrilación auricular','Fibrilación ventricular','Bloqueo AV de primer grado'], answer:2 },
    { q:'En el bloqueo AV de 3er grado (completo), ¿qué ocurre?', options:['El PR se prolonga progresivamente','El PR es fijo y algunos QRS no aparecen','Hay disociación completa entre aurículas y ventrículos','Solo hay bradicardia sinusal'], answer:2 },
    { q:'¿Cuál es la característica del flutter auricular?', options:['RR irregular sin ondas P','Ondas F en "dientes de sierra" a 250-350 lpm con bloqueo AV','QRS ancho con morfología bizarra','PR progresivamente prolongado hasta que un QRS no aparece'], answer:1 },
    { q:'Un complejo ventricular prematuro (CVP) se caracteriza por:', options:['QRS estrecho precedido de onda P','QRS ancho (>0.12s) y bizarro sin onda P precedente','PR largo con QRS normal','Onda P invertida antes del QRS'], answer:1 },
  ],
  q4: [
    { q:'¿Cuál es la causa más común del artefacto muscular (somático) en un EKG?', options:['Cables sueltos','Interferencia eléctrica de 60 Hz','Tensión muscular o temblor del paciente','Mala calidad del papel'], answer:2 },
    { q:'El artefacto de "derivación errante" (wandering baseline) se debe principalmente a:', options:['Temblor del paciente','Movimiento respiratorio, electrodos mal fijados o gel insuficiente','Interferencia de equipos eléctricos cercanos','Velocidad incorrecta del papel'], answer:1 },
    { q:'¿En qué posición debe colocarse al paciente para un EKG estándar?', options:['Sentado a 45°','Decúbito supino (acostado boca arriba, plano)','Decúbito lateral izquierdo','De pie'], answer:1 },
    { q:'¿Por qué se prepara la piel antes de colocar los electrodos?', options:['Para que el paciente esté cómodo','Para reducir la impedancia y mejorar la conductividad del electrodo','Para prevenir infecciones','Para marcar los sitios de colocación'], answer:1 },
    { q:'¿Cuántos segundos mínimo debe durar la adquisición de un EKG de 12 derivaciones estándar?', options:['5 segundos','10 segundos','20 segundos','30 segundos'], answer:1 },
  ],
  q5: [
    { q:'¿Cuál es el criterio electrocardiográfico estándar para diagnosticar STEMI?', options:['Depresión ST ≥1mm en ≥2 derivaciones contiguas','Elevación ST ≥1mm en ≥2 derivaciones contiguas','Inversión de onda T en una derivación','QT prolongado >500ms'], answer:1 },
    { q:'Las ondas T picudas y simétricas en el EKG son características de:', options:['Hipopotasemia','Hiperpotasemia','Hipocalcemia','Intoxicación por digoxina'], answer:1 },
    { q:'¿Cuál hallazgo en el EKG distingue la pericarditis del IAM?', options:['Elevación ST en derivaciones contiguas','Onda Q patológica','Elevación ST cóncava difusa en casi todas las derivaciones y depresión del segmento PR','QRS ancho'], answer:2 },
    { q:'La "cubeta digitálica" en el EKG (depresión cóncava del ST) indica:', options:['IAM agudo','Hiperpotasemia','Efecto del digitálico (digoxina)','Bloqueo de rama'], answer:2 },
    { q:'¿Qué derivaciones del EKG evalúan la pared inferior del ventrículo izquierdo?', options:['V1-V4','I, aVL, V5, V6','II, III, aVF','aVR únicamente'], answer:2 },
  ],
  final: [
    { q:'¿Cuál estructura del sistema de conducción genera el ritmo cardíaco normal?', options:['Nodo AV','Haz de His','Nodo SA','Fibras de Purkinje'], answer:2 },
    { q:'El intervalo QRS normal dura menos de:', options:['0.08 segundos','0.12 segundos','0.20 segundos','0.04 segundos'], answer:1 },
    { q:'En el EKG, la onda P representa:', options:['Repolarización ventricular','Despolarización ventricular','Despolarización auricular','Repolarización auricular'], answer:2 },
    { q:'¿Cuántas derivaciones precordiales tiene el EKG de 12 derivaciones?', options:['4','6','8','3'], answer:1 },
    { q:'¿Cuál es la frecuencia en lpm de la taquicardia sinusal?', options:['40-60','60-100','>100','<60'], answer:2 },
    { q:'El artefacto de 60 Hz (CA) en el EKG se corrige:', options:['Relajando al paciente','Alejando cables de fuentes eléctricas y verificando conexiones','Acelerando el papel','Cambiando la ganancia'], answer:1 },
    { q:'¿Cuál arritmia se caracteriza por ondas "f" (fibrilación) irregulares y sin onda P definida?', options:['Flutter auricular','Taquicardia ventricular','Fibrilación auricular','Taquicardia supraventricular'], answer:2 },
    { q:'Un bloqueo AV de 2° grado Mobitz II se caracteriza por:', options:['PR que se alarga progresivamente hasta que un QRS no aparece','PR fijo con caída súbita de QRS sin alargamiento previo','Disociación completa entre P y QRS','Solo PR prolongado sin QRS faltantes'], answer:1 },
    { q:'El electrodo V4 se coloca en:', options:['4° espacio intercostal izquierdo','5° espacio intercostal en línea media clavicular izquierda','4° espacio intercostal derecho','3° espacio intercostal izquierdo'], answer:1 },
    { q:'¿Cuánto pesa el dominio de "Interpretación de EKG" en el examen CET?', options:['15%','25%','40%','50%'], answer:2 },
    { q:'La elevación del segmento ST en el STEMI indica:', options:['Isquemia sin daño','Lesión miocárdica aguda con corriente de lesión','Hipertrofia ventricular','Efecto de medicamentos'], answer:1 },
    { q:'¿Qué ión es el principal responsable de la despolarización rápida en las células miocárdicas?', options:['K⁺','Ca²⁺','Na⁺','Cl⁻'], answer:2 },
    { q:'El bloqueo de rama derecha (BRDHH) produce en V1:', options:['Complejo QS','Patrón rSR\' (oreja de conejo)','Onda R alta monofásica','Depresión ST profunda'], answer:1 },
    { q:'¿Qué información DEBE incluir el registro de EKG para identificación correcta del paciente?', options:['Solo el nombre','Nombre, fecha de nacimiento e ID del paciente','Solo el número de expediente','Solo la fecha del estudio'], answer:1 },
    { q:'La hipopotasemia (K⁺ bajo) produce en el EKG:', options:['Ondas T picudas','Ensanchamiento del QRS','Onda U prominente y QT prolongado','Elevación del segmento ST'], answer:2 },
    { q:'En el flutter auricular típico, la frecuencia de las ondas auriculares es aproximadamente:', options:['60-100 lpm','150-200 lpm','250-350 lpm','400-600 lpm'], answer:2 },
    { q:'¿Cuál es el voltaje de calibración estándar del EKG?', options:['5 mm/mV','10 mm/mV','20 mm/mV','1 mm/mV'], answer:1 },
    { q:'La taquicardia ventricular (TV) se diferencia de la TSV con aberrancia principalmente por:', options:['Frecuencia cardíaca','QRS ancho con morfología bizarra, disociación AV, captura y fusión','Solo la frecuencia','Presencia o ausencia de onda P'], answer:1 },
    { q:'¿Qué posición del electrodo corresponde a V6?', options:['4° espacio intercostal derecho','5° espacio intercostal línea media clavicular','5° espacio intercostal línea axilar anterior','5° espacio intercostal línea axilar media'], answer:3 },
    { q:'El papel del técnico de EKG incluye:', options:['Diagnosticar arritmias','Solo encender el electrocardiógrafo','Adquirir el EKG con técnica correcta y notificar hallazgos urgentes al personal clínico','Prescribir tratamiento basado en el EKG'], answer:2 },
  ],
};

async function main() {
  const conn = await mysql.createConnection(DB);

  // Idempotent: delete existing Spanish EKG course if re-running
  const [existing] = await conn.execute(
    `SELECT id FROM courses WHERE slug = 'tecnico-ekg-electrocardiograma' LIMIT 1`
  );
  if (existing.length > 0) {
    const oldId = existing[0].id;
    const [oldLessons] = await conn.execute(`SELECT id FROM lessons WHERE course_id = ?`, [oldId]);
    for (const l of oldLessons) {
      await conn.execute(`DELETE FROM quiz_questions WHERE lesson_id = ?`, [l.id]);
    }
    await conn.execute(`DELETE FROM lessons WHERE course_id = ?`, [oldId]);
    await conn.execute(`DELETE FROM courses WHERE id = ?`, [oldId]);
    console.log(`Cleared existing Spanish EKG course (id=${oldId})`);
  }

  // Insert Spanish course row
  const [courseResult] = await conn.execute(
    `INSERT INTO courses (title, slug, description, category, level, is_published, price, sort_order, lang, paired_course_id)
     VALUES (?, ?, ?, ?, ?, 1, 0.00, 11, 'es', ?)`,
    [
      'Técnico de EKG (Electrocardiograma)',
      'tecnico-ekg-electrocardiograma',
      'Preparación completa para la certificación CET: anatomía cardíaca, sistema de conducción, interpretación de ritmos, adquisición del EKG y condiciones clínicas.',
      'Medical Assistant',
      'beginner',
      EN_COURSE_ID,
    ]
  );
  const COURSE_ID = courseResult.insertId;
  console.log(`Created Spanish EKG course: id=${COURSE_ID}`);

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
  console.log(`\nCurso EKG en espanol completado -- ${lessons.length} lecciones.`);
}

main().catch(err => { console.error(err); process.exit(1); });
