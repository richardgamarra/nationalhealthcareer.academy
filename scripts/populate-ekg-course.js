/**
 * populate-ekg-course.js
 * Course 11: EKG (Electrocardiogram) Technician
 * 27 lessons: 15 text, 6 presentations, 6 quizzes
 * Quizzes inserted directly into quiz_questions table.
 */

const mysql = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const path = require('path');

const UPLOADS_DIR = '/var/www/nationalhealthcareer-com/public/uploads';
const COURSE_ID = 11;
const DB = { host: 'localhost', user: 'admin_nhca', password: '2u95#I7jm', database: 'nha_db' };

let _n = 0;
function slug(title) {
  _n++;
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150) + '-c11-' + _n;
}

// ─── PPTX GENERATOR ───────────────────────────────────────────────────────────
function makePptx(key) {
  const decks = {
    'cardiac-anatomy': {
      title: 'Cardiac Anatomy & Physiology',
      slides: [
        { heading: 'Cardiac Anatomy & Physiology', body: 'The heart is a muscular pump that circulates blood through the body. EKG technicians must understand cardiac anatomy to accurately perform and interpret electrocardiograms.' },
        { heading: 'Heart Chambers & Great Vessels', body: 'Four chambers:\n• Right Atrium — receives deoxygenated blood from the body\n• Right Ventricle — pumps to the lungs (pulmonary circuit)\n• Left Atrium — receives oxygenated blood from the lungs\n• Left Ventricle — pumps to the body (systemic circuit; thickest wall)\n\nGreat Vessels: Aorta, Pulmonary Artery, Pulmonary Veins, Vena Cavae' },
        { heading: 'The Cardiac Conduction System', body: 'Electrical signals trigger coordinated muscle contraction:\n\n1. SA Node (Sinoatrial) — the natural pacemaker; 60–100 bpm\n2. AV Node (Atrioventricular) — delays signal to allow atrial filling\n3. Bundle of His — conducts to ventricles\n4. Right & Left Bundle Branches\n5. Purkinje Fibers — distribute signal through ventricular walls' },
        { heading: 'Cardiac Action Potential', body: 'Depolarization: sodium/calcium rush into cell → muscle contracts\nRepolarization: potassium exits → muscle relaxes\n\nRefractory Periods:\n• Absolute Refractory Period: cannot re-stimulate (prevents tetany)\n• Relative Refractory Period: can stimulate with strong enough signal (danger zone — can trigger VF)\n\nOn EKG: depolarization = QRS complex; repolarization = T wave' },
        { heading: 'Key Takeaways', body: '✓ Blood flows: body → RA → RV → lungs → LA → LV → body\n✓ SA node is the primary pacemaker at 60–100 bpm\n✓ AV node delays conduction to allow ventricular filling\n✓ Depolarization causes contraction; repolarization causes relaxation\n✓ EKG records electrical activity — not mechanical pumping' },
      ]
    },
    'leads-placement': {
      title: 'Leads, Electrodes & Placement',
      slides: [
        { heading: 'The 12-Lead EKG', body: 'A standard 12-lead EKG uses 10 electrodes to record 12 different views of the heart\'s electrical activity. Each lead is like a "camera angle" showing the heart from a different direction.' },
        { heading: 'Limb Leads (Bipolar)', body: 'Three standard bipolar limb leads:\n• Lead I: Right arm (–) to Left arm (+)\n• Lead II: Right arm (–) to Left leg (+) — most common rhythm strip\n• Lead III: Left arm (–) to Left leg (+)\n\nElectrode placement:\n• RA: Right arm (or right shoulder)\n• LA: Left arm (or left shoulder)\n• RL: Right leg (ground)\n• LL: Left leg (or left lower abdomen)' },
        { heading: 'Augmented Leads (Unipolar)', body: 'Three augmented limb leads (aVR, aVL, aVF):\n• aVR: Augmented Vector Right — looks at the heart from right shoulder\n• aVL: Augmented Vector Left — looks from left shoulder\n• aVF: Augmented Vector Foot — looks from below (inferior wall)\n\nThese leads use the same 4 limb electrodes — no additional placement needed.' },
        { heading: 'Precordial (Chest) Leads V1–V6', body: 'Six chest leads provide anterior and lateral views:\n• V1: 4th intercostal space, right sternal border\n• V2: 4th intercostal space, left sternal border\n• V3: Between V2 and V4\n• V4: 5th intercostal space, midclavicular line\n• V5: Anterior axillary line (same level as V4)\n• V6: Midaxillary line (same level as V4 and V5)\n\nMemory: "4R, 4L, between, 5mid, ant-ax, mid-ax"' },
        { heading: 'Electrode Placement Tips', body: '✓ Clean and dry the skin before applying electrodes\n✓ Clip or shave excessive chest hair if needed\n✓ For obese or large-breasted patients: place V4–V6 under the breast on the chest wall\n✓ Ensure good contact — press firmly on all electrode tabs\n✓ Have patient lie still and breathe normally\n✓ Right leg (RL) is the ground electrode — always required but not a true "lead"' },
      ]
    },
    'rhythm-interpretation': {
      title: 'Rhythm Interpretation Fundamentals',
      slides: [
        { heading: 'Reading the EKG Strip', body: 'Standard EKG paper:\n• Small box = 1 mm = 0.04 seconds (horizontal) / 0.1 mV (vertical)\n• Large box = 5 mm = 0.2 seconds\n• Standard speed: 25 mm/sec\n• Standard gain: 10 mm/mV (1 mV = 10 mm deflection)\n\nHeart rate calculation:\n• Regular rhythm: 300 ÷ number of large boxes between R waves\n• Or: count R waves in a 6-second strip × 10' },
        { heading: 'Normal EKG Waveforms', body: 'P Wave: atrial depolarization (SA → AV node)\n• Normal: upright in II, <0.12 sec, <2.5 mm\n\nPR Interval: AV conduction time\n• Normal: 0.12–0.20 sec (3–5 small boxes)\n\nQRS Complex: ventricular depolarization\n• Normal: <0.12 sec (3 small boxes)\n\nST Segment: early ventricular repolarization\n• Normal: isoelectric (flat at baseline)\n\nT Wave: ventricular repolarization\n• Normal: upright in most leads, same direction as QRS' },
        { heading: 'The 8-Step Rhythm Analysis', body: '1. Rate — is it normal (60–100), tachy (>100), or brady (<60)?\n2. Rhythm — is it regular or irregular?\n3. P waves — present? One before each QRS? Upright in II?\n4. PR interval — normal (0.12–0.20 sec)?\n5. QRS duration — normal (<0.12 sec) or wide?\n6. ST segment — isoelectric, elevated, or depressed?\n7. T waves — normal morphology?\n8. Overall interpretation — name the rhythm' },
        { heading: 'Regularity Assessment', body: 'To assess regularity:\n• Mark the R-R intervals using calipers or paper\n• Compare all R-R intervals\n\nRegular: all R-R intervals equal (±1–2 small boxes)\nRegularly irregular: pattern of irregularity (e.g., every 3rd beat)\nIrregularly irregular: no pattern at all (classic for atrial fibrillation)\n\nRhythm regularity helps narrow the differential significantly.' },
        { heading: 'Key Intervals Reference', body: 'Normal Intervals:\n• PR: 0.12–0.20 sec\n• QRS: <0.12 sec\n• QT: <0.44 sec (rate-dependent; use QTc)\n• RR: varies with rate\n\nAbnormal findings:\n• Short PR (<0.12): WPW, junctional rhythm\n• Long PR (>0.20): 1st degree AV block\n• Wide QRS (>0.12): BBB, PVC, ventricular rhythm\n• Long QT: drug effect, electrolyte disorder (risk of Torsades)' },
      ]
    },
    'patient-prep': {
      title: 'Patient Prep & Artifact Reduction',
      slides: [
        { heading: 'Patient Preparation', body: 'A technically excellent EKG starts with proper patient preparation.\n\n• Explain the procedure: painless, no electricity goes into the patient\n• Have the patient lie supine, arms at sides, legs uncrossed\n• Remove or reposition clothing to expose chest, arms, and legs\n• Ask about lotions, oils, or powders on the skin (remove if present)\n• Keep the patient warm — shivering causes artifact' },
        { heading: 'Skin Preparation', body: 'Skin prep is the #1 factor in electrode contact quality:\n\n1. Clean the electrode sites with alcohol or abrasive prep pad\n2. Dry thoroughly — moisture under electrodes causes poor contact\n3. Clip or shave excessive hair (chest hair interferes with adhesion)\n4. For diaphoretic (sweaty) patients: dry aggressively and apply electrodes quickly\n5. For elderly/fragile skin: use gentle prep, press rather than rub\n\nGood contact = clean signal. Poor contact = artifact and repeat EKGs.' },
        { heading: 'Types of Artifact', body: 'Somatic (Muscle) Artifact:\n• Cause: patient movement, shivering, muscle tension\n• Appearance: irregular, high-frequency interference\n• Fix: have patient relax, warm the room, reposition\n\nAC (60-Cycle) Interference:\n• Cause: electrical equipment, poor grounding, loose electrode\n• Appearance: regular, fine baseline oscillation\n• Fix: check all connections, ensure RL ground electrode placed, move equipment\n\nWandering Baseline:\n• Cause: patient breathing deeply, loose electrode, poor contact\n• Appearance: baseline moves up and down\n• Fix: re-prep skin, reapply electrode, instruct patient to breathe normally' },
        { heading: 'Special Patient Populations', body: 'Amputees:\n• Place limb lead electrodes on the stump; document substitution\n\nLarge body habitus / obesity:\n• Limb leads: upper arms and thighs (not wrists/ankles if large)\n• Chest leads: find landmarks carefully; place V4–V6 under breast\n\nPediatric patients:\n• Use smaller electrodes; reduce gain if needed\n• Normal HR ranges differ from adults\n\nDextrocardia:\n• All leads appear reversed; P in aVR, QRS negative in I\n• If suspected: perform mirror image EKG (reverse arm leads, place V1–V6 on right)' },
        { heading: 'Documentation Requirements', body: 'Every EKG tracing must include:\n✓ Patient full name and date of birth\n✓ Date and time of acquisition\n✓ Performing technician\'s name/ID\n✓ Patient\'s clinical indication (reason for EKG)\n✓ Any technical issues or deviations noted\n✓ Patient position (standard supine; note any deviation)\n✓ Medications or symptoms that may affect interpretation\n\nNever alter an EKG tracing after printing. If repeat is needed, label clearly.' },
      ]
    },
    'st-changes': {
      title: 'ST Changes, Blocks & Hypertrophy',
      slides: [
        { heading: 'ST Segment Significance', body: 'The ST segment represents early ventricular repolarization. Changes from baseline indicate myocardial injury or ischemia.\n\nST Elevation (≥1 mm in limb leads, ≥2 mm in chest leads):\n• STEMI (ST-Elevation Myocardial Infarction) — emergency\n• Pericarditis (diffuse elevation, concave shape)\n• Benign early repolarization (common in young adults)\n\nST Depression (≥0.5–1 mm):\n• Subendocardial ischemia (NSTEMI, unstable angina)\n• Reciprocal change in STEMI\n• Digoxin effect (scooped appearance)' },
        { heading: 'Bundle Branch Blocks', body: 'When one bundle branch is blocked, the ventricle it serves depolarizes late via slower cell-to-cell conduction → wide QRS (≥0.12 sec)\n\nRight Bundle Branch Block (RBBB):\n• rSR\' pattern in V1 ("rabbit ears")\n• Wide, slurred S in I, aVL, V5, V6\n• Often normal variant\n\nLeft Bundle Branch Block (LBBB):\n• Broad R wave in I, aVL, V5, V6\n• QS or rS in V1\n• Always abnormal — investigate' },
        { heading: 'AV Blocks', body: '1st Degree AV Block:\n• PR interval >0.20 sec; all P waves conducted\n• Benign; no treatment needed\n\n2nd Degree AV Block — Mobitz Type I (Wenckebach):\n• PR gradually lengthens until a P wave is not conducted (dropped QRS)\n• Pattern repeats; usually benign\n\n2nd Degree AV Block — Mobitz Type II:\n• Constant PR interval with sudden dropped QRS (no warning)\n• High risk of progression to complete heart block — may need pacemaker\n\n3rd Degree (Complete) AV Block:\n• No relationship between P waves and QRS complexes\n• Life-threatening; requires pacemaker' },
        { heading: 'Ventricular Hypertrophy', body: 'Left Ventricular Hypertrophy (LVH):\n• Increased QRS voltage in chest leads\n• Sokolow-Lyon: S in V1 + R in V5 or V6 ≥35 mm\n• Associated with hypertension, aortic stenosis\n• ST depression and T-wave inversion in lateral leads\n\nRight Ventricular Hypertrophy (RVH):\n• Dominant R wave in V1\n• Right axis deviation\n• Associated with pulmonary hypertension, chronic lung disease' },
        { heading: 'Electrolyte Effects on EKG', body: 'Hyperkalemia (high K+):\n• Peaked, narrow, symmetric T waves (early)\n• Widened QRS, sine wave pattern (severe)\n• Can cause fatal arrhythmias\n\nHypokalemia (low K+):\n• Flattened T waves, prominent U waves\n• Prolonged QT, increased arrhythmia risk\n\nHypercalcemia (high Ca²+):\n• Shortened QT interval\n\nHypocalcemia (low Ca²+):\n• Prolonged QT interval (risk of Torsades de Pointes)' },
      ]
    },
    'exam-prep': {
      title: 'CET Exam Strategy',
      slides: [
        { heading: 'The NHA CET Exam', body: 'The Certified EKG Technician (CET) exam is administered by the National Healthcareer Association (NHA).\n\nExam format: 100 scored questions + 20 pretest items\nTime limit: 2 hours\nPassing score: 390/500 (scaled)\n\nContent domains:\n• Anatomy & Physiology: ~17%\n• EKG Acquisition: ~22%\n• Rhythm Recognition: ~33%\n• Clinical Application: ~28%' },
        { heading: 'High-Frequency Topics', body: '✓ Normal sinus rhythm criteria\n✓ All 12 lead placements (especially V1–V6 intercostal spaces)\n✓ Normal intervals: PR (0.12–0.20), QRS (<0.12), QT (<0.44)\n✓ AV block types: 1st, Wenckebach, Mobitz II, 3rd degree\n✓ Atrial fibrillation: irregularly irregular, no P waves\n✓ Ventricular fibrillation: chaotic, no organized waveforms\n✓ STEMI: ST elevation ≥1 mm limb / ≥2 mm chest leads\n✓ Artifact types and how to correct them' },
        { heading: 'Common Exam Traps', body: '• Confusing Mobitz I (Wenckebach — gradually lengthening PR) with Mobitz II (constant PR, sudden drop)\n• Forgetting that V1 is at the 4th ICS RIGHT sternal border (not left)\n• Misidentifying junctional rhythms (rate 40–60, P absent or inverted near QRS)\n• Confusing PJC (narrow) with PVC (wide, bizarre)\n• Missing that atrial fibrillation is "irregularly irregular" — not just "irregular"\n• Forgetting that a pacemaker spike before a QRS is normal pacemaker function' },
        { heading: 'Rhythm Recognition Strategy', body: 'For every rhythm strip, use the 8-step method:\n1. Rate\n2. Regular or irregular?\n3. P waves — present, one per QRS, upright in II?\n4. PR interval\n5. QRS width\n6. ST segment\n7. T waves\n8. Name the rhythm\n\nPractice this until it is automatic. Most exam questions test whether you can identify rhythms by applying this systematic approach.' },
        { heading: 'Final Study Checklist', body: '□ All 12 electrode/lead placements memorized\n□ Normal values: PR, QRS, QT intervals\n□ Sinus rhythms: NSR, sinus brady, sinus tachy, sinus arrhythmia\n□ Atrial rhythms: PAC, SVT, AFib, AFlutter\n□ Junctional rhythms\n□ AV blocks: 1st, 2nd (I and II), 3rd\n□ Ventricular rhythms: PVC, VT, VF, idioventricular\n□ Bundle branch blocks: RBBB vs. LBBB\n□ STEMI patterns and territories\n□ Artifact types and corrections\n□ EKG acquisition steps and patient prep' },
      ]
    },
  };

  const deck = decks[key];
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deck.title;

  const NAVY = '0f2b5b';
  const WHITE = 'FFFFFF';
  const LIGHT = 'dbeafe';

  deck.slides.forEach((s, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: i === 0 ? NAVY : 'F0F4FF' };
    if (i === 0) {
      slide.addText(deck.title, { x: 0.5, y: 1.2, w: 12, h: 1.2, fontSize: 36, bold: true, color: WHITE, align: 'center' });
      slide.addText(s.heading, { x: 0.5, y: 2.6, w: 12, h: 0.7, fontSize: 22, color: LIGHT, align: 'center' });
      slide.addText('National Healthcareer Academy', { x: 0.5, y: 5.8, w: 12, h: 0.4, fontSize: 13, color: LIGHT, align: 'center' });
    } else {
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.1, fill: { color: NAVY } });
      slide.addText(s.heading, { x: 0.4, y: 0.1, w: 12.5, h: 0.9, fontSize: 24, bold: true, color: WHITE });
      slide.addText(s.body, { x: 0.5, y: 1.3, w: 12.3, h: 4.8, fontSize: 16, color: '1e293b', valign: 'top', breakLine: true });
      slide.addText(`${i} / ${deck.slides.length - 1}`, { x: 12.5, y: 6.8, w: 0.8, h: 0.3, fontSize: 10, color: '94a3b8', align: 'right' });
    }
  });

  const filename = `${Date.now()}-ekg-${key}.pptx`;
  const filepath = path.join(UPLOADS_DIR, filename);
  pptx.writeFile({ fileName: filepath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

// ─── QUIZ DATA ─────────────────────────────────────────────────────────────────
const quizzes = {
  q1: [
    { q: 'The heart\'s natural pacemaker that initiates each heartbeat at 60–100 bpm is the:', options: ['AV node', 'Bundle of His', 'SA node', 'Purkinje fibers'], answer: 2, explanation: 'The sinoatrial (SA) node, located in the right atrium, is the heart\'s primary pacemaker. It spontaneously depolarizes 60–100 times per minute under normal conditions.' },
    { q: 'Which heart chamber has the thickest muscular wall and generates the most pressure?', options: ['Right atrium', 'Right ventricle', 'Left atrium', 'Left ventricle'], answer: 3, explanation: 'The left ventricle has the thickest wall because it pumps oxygenated blood against the high resistance of the systemic circulation (entire body). The right ventricle pumps only to the lower-resistance pulmonary circuit.' },
    { q: 'The role of the AV node in cardiac conduction is to:', options: ['Initiate the heartbeat', 'Delay the impulse to allow the ventricles to fill before contracting', 'Distribute the signal through the ventricular walls', 'Control the rate of the SA node'], answer: 1, explanation: 'The AV node delays the electrical impulse for approximately 0.12 seconds, giving the atria time to complete contraction and fill the ventricles before the ventricles contract.' },
    { q: 'On an EKG, ventricular depolarization (contraction) is represented by the:', options: ['P wave', 'PR interval', 'QRS complex', 'T wave'], answer: 2, explanation: 'The QRS complex represents the rapid depolarization of the ventricular myocardium, which triggers ventricular contraction. The P wave represents atrial depolarization, and the T wave represents ventricular repolarization.' },
    { q: 'During the absolute refractory period, the cardiac cell:', options: ['Can be stimulated by a stronger-than-normal impulse', 'Cannot be stimulated by any impulse regardless of strength', 'Is in the process of repolarizing', 'Is firing spontaneously'], answer: 1, explanation: 'During the absolute refractory period, the cardiac cell cannot respond to any stimulus regardless of its strength. This prevents tetanic (sustained) contraction and ensures the heart can refill between beats.' },
  ],
  q2: [
    { q: 'The V1 chest electrode is placed at:', options: ['4th intercostal space, left sternal border', '5th intercostal space, midclavicular line', '4th intercostal space, right sternal border', '2nd intercostal space, right sternal border'], answer: 2, explanation: 'V1 is placed at the 4th intercostal space along the RIGHT sternal border. V2 is at the 4th ICS LEFT sternal border. This is one of the most frequently tested placement facts.' },
    { q: 'How many electrodes are used to acquire a standard 12-lead EKG?', options: ['12', '10', '6', '4'], answer: 1, explanation: 'A 12-lead EKG uses 10 electrodes (4 limb electrodes + 6 chest electrodes) to generate 12 different leads/views of the heart\'s electrical activity.' },
    { q: 'The standard EKG paper speed is:', options: ['10 mm/sec', '25 mm/sec', '50 mm/sec', '100 mm/sec'], answer: 1, explanation: 'Standard EKG paper runs at 25 mm per second. At this speed, each small box equals 0.04 seconds and each large box equals 0.20 seconds horizontally.' },
    { q: 'On a standard EKG strip, a large box represents:', options: ['0.04 seconds', '0.10 seconds', '0.20 seconds', '0.40 seconds'], answer: 2, explanation: 'Each large box on standard EKG paper (25 mm/sec) represents 0.20 seconds (200 milliseconds) in the horizontal dimension and 0.5 mV in the vertical dimension.' },
    { q: 'The lead most commonly used as a continuous rhythm monitoring strip is:', options: ['Lead I', 'Lead II', 'aVR', 'V1'], answer: 1, explanation: 'Lead II is the most commonly used rhythm monitoring lead because the P wave is clearly upright and visible, and the QRS deflection is typically positive and easy to distinguish, making rhythm analysis straightforward.' },
  ],
  q3: [
    { q: 'A normal PR interval measures:', options: ['Less than 0.10 seconds', '0.12 to 0.20 seconds', '0.20 to 0.40 seconds', 'Greater than 0.20 seconds'], answer: 1, explanation: 'The normal PR interval is 0.12–0.20 seconds (3–5 small boxes on standard EKG paper). It represents AV conduction time — from atrial depolarization through the AV node to the start of ventricular depolarization.' },
    { q: 'Atrial fibrillation is characterized by:', options: ['Regular rhythm with a PR interval >0.20 seconds', 'Irregularly irregular rhythm with no identifiable P waves', 'Regular sawtooth flutter waves at 300 bpm', 'Wide QRS complexes with no P waves'], answer: 1, explanation: 'Atrial fibrillation produces chaotic, disorganized atrial activity (no distinct P waves, replaced by fibrillatory baseline), resulting in an irregularly irregular ventricular response. This is its hallmark finding.' },
    { q: 'A premature ventricular complex (PVC) on EKG appears as:', options: ['A narrow QRS complex preceded by an abnormal P wave', 'A wide, bizarre QRS complex without a preceding P wave', 'A dropped QRS complex after a normal P wave', 'A regular narrow complex at rate >150 bpm'], answer: 1, explanation: 'PVCs originate in the ventricular myocardium, producing a wide (≥0.12 sec), bizarrely shaped QRS complex not preceded by a P wave. They are usually followed by a compensatory pause.' },
    { q: 'In Mobitz Type I (Wenckebach) second-degree AV block, the identifying feature is:', options: ['A constant PR interval with occasional dropped QRS complexes', 'Progressively lengthening PR intervals until a QRS is dropped', 'Complete dissociation between P waves and QRS complexes', 'A short PR interval with a delta wave'], answer: 1, explanation: 'Wenckebach (Mobitz Type I) is characterized by progressive lengthening of the PR interval with each beat until one P wave is not conducted (QRS is dropped), then the cycle resets. This is the "group beating" pattern.' },
    { q: 'Which arrhythmia is described as an "irregularly irregular" rhythm with no visible P waves?', options: ['Atrial flutter', 'Atrial fibrillation', 'Ventricular tachycardia', 'Junctional tachycardia'], answer: 1, explanation: 'Atrial fibrillation is the classic "irregularly irregular" rhythm. The chaotic atrial activity produces no identifiable P waves (replaced by a wavy or flat baseline), and the ventricular response is totally irregular.' },
  ],
  q4: [
    { q: 'The most common cause of artifact on an EKG that appears as irregular, high-frequency interference is:', options: ['AC (60-cycle) interference', 'Somatic (muscle) artifact from patient movement or shivering', 'Wandering baseline from deep breathing', 'Electrode reversal'], answer: 1, explanation: 'Somatic artifact is caused by skeletal muscle activity — shivering, tremor, or patient movement. It produces irregular, chaotic noise on the tracing. Keeping the patient warm and relaxed prevents this.' },
    { q: 'When performing an EKG on a patient, the right leg (RL) electrode serves as:', options: ['The positive electrode for Lead I', 'A ground electrode to reduce electrical interference', 'The reference for augmented lead aVF', 'The negative electrode for Lead III'], answer: 1, explanation: 'The right leg (RL) electrode is the ground electrode. It does not contribute to any of the 12 leads but reduces electrical interference (noise) in the recording.' },
    { q: 'AC (60-cycle) interference on an EKG appears as:', options: ['Irregular, chaotic baseline disruption', 'Regular fine oscillation of the baseline at 60 cycles per second', 'Gradual drifting of the baseline up and down', 'Wide QRS complexes'], answer: 1, explanation: 'AC interference from nearby electrical equipment or poor electrode grounding produces a regular, fine baseline oscillation at 60 Hz. Checking connections and ensuring the ground electrode (RL) is properly placed usually resolves it.' },
    { q: 'For a patient with heavy chest hair that will prevent adequate electrode adhesion, the EKG technician should:', options: ['Apply electrodes directly over the hair and proceed', 'Skip the chest leads and perform a 6-lead EKG', 'Clip or shave the electrode sites before applying electrodes', 'Use extra electrode gel to compensate'], answer: 2, explanation: 'Chest hair prevents secure electrode-to-skin contact, causing artifact and poor signal quality. The technician should clip or shave the electrode sites, with patient consent, before electrode application.' },
    { q: 'Which of the following must be documented on every EKG tracing?', options: ['The patient\'s current medications only', 'Patient name, date of birth, date and time, and the technician\'s identification', 'Only the physician\'s name and the clinical indication', 'The patient\'s insurance information'], answer: 1, explanation: 'Every EKG tracing must be labeled with patient identification (name, DOB), date and time of acquisition, and the performing technician\'s identification. Clinical indication and technical notes should also be recorded.' },
  ],
  q5: [
    { q: 'ST segment elevation of ≥1 mm in two contiguous limb leads most likely indicates:', options: ['Normal early repolarization in a young athlete', 'ST-elevation myocardial infarction (STEMI) until proven otherwise', 'Left ventricular hypertrophy', 'Hyperkalemia'], answer: 1, explanation: 'ST elevation ≥1 mm in ≥2 contiguous limb leads (or ≥2 mm in chest leads) is a STEMI pattern until proven otherwise and requires immediate action. This is a cardiac emergency requiring rapid physician notification.' },
    { q: 'Right Bundle Branch Block (RBBB) on EKG is identified by:', options: ['Broad R wave in V1 with QS pattern in V5–V6', 'rSR\' ("rabbit ears") pattern in V1 and wide S wave in leads I, aVL, V5–V6', 'ST elevation in V1–V4', 'Shortened PR interval with a delta wave'], answer: 1, explanation: 'RBBB produces an rSR\' pattern in V1 (the "rabbit ears" or M-shape) because the right ventricle depolarizes late. Wide, slurred S waves appear in lateral leads (I, aVL, V5–V6). QRS duration is ≥0.12 sec.' },
    { q: 'Peaked, narrow, symmetric T waves on an EKG are most associated with:', options: ['Hypokalemia', 'Hyperkalemia', 'Hypocalcemia', 'Digoxin toxicity'], answer: 1, explanation: 'Hyperkalemia (elevated potassium) produces tall, narrow, peaked ("tent-shaped") T waves as an early finding. As potassium rises further, the PR interval lengthens, QRS widens, and ultimately a sine wave pattern develops — a life-threatening emergency.' },
    { q: 'In third-degree (complete) AV block, the relationship between P waves and QRS complexes is:', options: ['PR interval progressively lengthens', 'P waves and QRS complexes are completely dissociated — no relationship', 'Every other P wave is conducted', 'PR interval is constant but longer than normal'], answer: 1, explanation: 'In third-degree (complete) AV block, no atrial impulses reach the ventricles. The atria and ventricles beat independently — P waves and QRS complexes have no relationship (AV dissociation). This requires a pacemaker.' },
    { q: 'A prolonged QT interval on EKG is clinically significant because it:', options: ['Indicates atrial hypertrophy', 'Indicates the patient is in sinus bradycardia', 'Increases the risk of Torsades de Pointes, a dangerous ventricular arrhythmia', 'Is a normal finding in athletes'], answer: 2, explanation: 'A prolonged QT interval (>0.44 sec corrected for rate) indicates delayed ventricular repolarization. This creates a vulnerable period that can trigger Torsades de Pointes — a potentially fatal polymorphic ventricular tachycardia. Common causes: medications, hypokalemia, hypocalcemia, congenital long QT syndrome.' },
  ],
  final: [
    { q: 'The correct placement for the V4 chest electrode is:', options: ['4th intercostal space, right sternal border', '4th intercostal space, left sternal border', '5th intercostal space, midclavicular line', '5th intercostal space, anterior axillary line'], answer: 2, explanation: 'V4 is placed at the 5th intercostal space at the midclavicular line. V5 is at the anterior axillary line at the same level, and V6 is at the midaxillary line at the same level.' },
    { q: 'Normal sinus rhythm is defined as:', options: ['Rate 60–100 bpm, regular, P wave before every QRS, PR 0.12–0.20 sec, QRS <0.12 sec', 'Rate 60–100 bpm, regular, no P waves, wide QRS', 'Rate 40–60 bpm, regular, P wave before every QRS', 'Rate >100 bpm, irregularly irregular, no visible P waves'], answer: 0, explanation: 'Normal sinus rhythm requires: rate 60–100 bpm, regular rhythm, upright P wave before every QRS in lead II, normal PR interval (0.12–0.20 sec), and normal QRS duration (<0.12 sec).' },
    { q: 'When a patient is shivering during an EKG, the most likely artifact seen on the tracing is:', options: ['Wandering baseline', 'AC 60-cycle interference', 'Somatic (muscle) artifact', 'Electrode reversal pattern'], answer: 2, explanation: 'Shivering produces involuntary skeletal muscle contractions, generating somatic (muscle) artifact — irregular, high-frequency noise on the EKG tracing. Warming the patient and having them relax resolves this.' },
    { q: 'The P wave on an EKG represents:', options: ['Ventricular depolarization', 'Atrial repolarization', 'Atrial depolarization', 'Ventricular repolarization'], answer: 2, explanation: 'The P wave represents atrial depolarization — the spread of the electrical impulse from the SA node through both atria, triggering atrial contraction. Atrial repolarization is hidden within the QRS complex.' },
    { q: 'In second-degree AV block Mobitz Type II, the characteristic finding is:', options: ['PR interval gradually lengthens until a QRS is dropped', 'Constant PR interval followed by sudden, unexpected dropped QRS complexes', 'Complete AV dissociation with independent atrial and ventricular rates', 'Short PR interval with a slurred upstroke of the QRS (delta wave)'], answer: 1, explanation: 'Mobitz Type II has a constant PR interval (unlike Wenckebach) with sudden, unexpected non-conducted P waves (dropped QRS). It carries high risk of progressing to complete heart block and often requires pacemaker implantation.' },
    { q: 'Atrial flutter characteristically shows:', options: ['Irregularly irregular rhythm with no P waves', 'Sawtooth flutter waves at approximately 250–350 bpm with regular or regular-variable ventricular response', 'Wide QRS complexes at 150–200 bpm', 'Normal P waves with PR >0.20 sec'], answer: 1, explanation: 'Atrial flutter produces a characteristic sawtooth pattern of flutter waves at approximately 250–350 bpm (typically 300 bpm). The AV node blocks most impulses, typically conducting at 2:1, 3:1, or 4:1, producing a ventricular rate of 75–150 bpm.' },
    { q: 'The QRS complex width in a normal adult should be:', options: ['Less than 0.08 seconds', 'Less than 0.12 seconds', '0.12–0.20 seconds', 'Greater than 0.12 seconds'], answer: 1, explanation: 'Normal QRS duration is less than 0.12 seconds (less than 3 small boxes). A QRS ≥0.12 seconds is considered wide and indicates abnormal ventricular conduction (bundle branch block, ventricular rhythm, or aberrant conduction).' },
    { q: 'Which lead views the inferior wall of the left ventricle?', options: ['Leads I and aVL', 'Leads II, III, and aVF', 'Leads V1 through V4', 'Leads V4 through V6'], answer: 1, explanation: 'The inferior wall of the left ventricle is viewed by leads II, III, and aVF (the inferior leads). ST changes in these leads suggest inferior wall ischemia or infarction, typically from RCA (right coronary artery) occlusion.' },
    { q: 'A wandering baseline artifact is most likely caused by:', options: ['Nearby electrical equipment', 'Patient muscle movement or shivering', 'Loose electrode or deep patient breathing', 'Incorrect paper speed setting'], answer: 2, explanation: 'Wandering baseline (baseline drift) occurs when the baseline slowly moves up and down. Common causes include a loose or poorly adhered electrode, patient breathing deeply, or poor skin prep. Re-prepping the skin and firmly reapplying the electrode usually resolves it.' },
    { q: 'Ventricular fibrillation on EKG appears as:', options: ['Regular wide QRS complexes at 150–200 bpm', 'Chaotic, disorganized waveforms with no identifiable P, QRS, or T waves', 'Regular sawtooth waves at 300 bpm', 'Irregular narrow complexes with no P waves'], answer: 1, explanation: 'Ventricular fibrillation (VF) produces completely disorganized, chaotic electrical activity with no identifiable waveforms. There is no effective cardiac output — VF is immediately life-threatening and requires defibrillation.' },
    { q: 'The V1 electrode is placed at the:', options: ['2nd intercostal space, right sternal border', '4th intercostal space, right sternal border', '4th intercostal space, left sternal border', '5th intercostal space, midclavicular line'], answer: 1, explanation: 'V1 is placed at the 4th intercostal space at the RIGHT sternal border. V2 is directly across at the 4th ICS LEFT sternal border. This mirror placement makes V1 and V2 the closest leads to the septum.' },
    { q: 'A junctional rhythm has a rate of:', options: ['20–40 bpm', '40–60 bpm', '60–100 bpm', '100–150 bpm'], answer: 1, explanation: 'A junctional rhythm originates in the AV junction (AV node or Bundle of His) and fires at its intrinsic rate of 40–60 bpm. P waves are absent, inverted, or occur immediately before or after the QRS. QRS is typically narrow.' },
    { q: 'When performing an EKG, the patient should be positioned:', options: ['Sitting upright at 90 degrees', 'In the left lateral decubitus position', 'Supine with arms at the sides and legs uncrossed', 'Prone with arms extended above the head'], answer: 2, explanation: 'Standard EKG acquisition requires the patient to be supine (flat on their back) with arms relaxed at their sides and legs uncrossed. This minimizes skeletal muscle activity and ensures consistent electrode positioning.' },
    { q: 'Left ventricular hypertrophy (LVH) on EKG is suggested by:', options: ['rSR\' in V1 and wide S in lateral leads', 'Dominant R wave in V1 and right axis deviation', 'S wave in V1 + R wave in V5 or V6 ≥35 mm', 'Delta waves in multiple leads'], answer: 2, explanation: 'The Sokolow-Lyon criterion for LVH: the sum of the S wave depth in V1 plus the R wave height in V5 (or V6, whichever is taller) ≥35 mm. LVH reflects chronic pressure overload of the left ventricle, commonly from hypertension.' },
    { q: 'An idioventricular rhythm has a rate of:', options: ['60–100 bpm', '40–60 bpm', '20–40 bpm', '>100 bpm'], answer: 2, explanation: 'An idioventricular (or agonal) rhythm originates in the ventricular myocardium with a rate of 20–40 bpm — the ventricle\'s intrinsic escape rate. It produces wide, bizarre QRS complexes and indicates severe cardiac compromise.' },
    { q: 'In a patient with suspected dextrocardia, which EKG finding would you expect in Lead I?', options: ['Tall, positive QRS complex', 'Normal upright P wave and R wave', 'Negative deflection in all waveforms (global negativity)', 'ST elevation'], answer: 2, explanation: 'In dextrocardia (heart mirrored to the right), Lead I shows inversion of all waveforms — negative P wave, QRS, and T wave — because the heart\'s electrical vector points away from the left arm (Lead I\'s positive electrode).' },
    { q: 'Which finding on EKG is most consistent with hyperkalemia?', options: ['Prolonged QT interval', 'Peaked, narrow, symmetric T waves', 'Sawtooth flutter waves', 'Short PR interval with delta waves'], answer: 1, explanation: 'The earliest EKG sign of hyperkalemia is peaked, narrow, symmetric ("tent-shaped") T waves. As potassium rises further, the PR interval prolongs, the QRS widens, and ultimately a sine wave pattern develops — requiring emergency treatment.' },
    { q: 'The purpose of performing skin preparation before electrode application is to:', options: ['Prevent patient discomfort from the electrical current', 'Reduce skin impedance to improve electrode contact and signal quality', 'Protect the electrodes from moisture damage', 'Meet hospital infection control requirements only'], answer: 1, explanation: 'Skin preparation (cleaning, drying, and sometimes abrading the electrode sites) reduces the skin\'s electrical resistance (impedance), allowing the electrode to pick up the heart\'s weak electrical signal cleanly with minimal artifact.' },
    { q: 'A patient\'s EKG shows a regular rhythm at 42 bpm with wide QRS complexes and no visible P waves. This is most consistent with:', options: ['Sinus bradycardia', 'Junctional rhythm', 'Accelerated idioventricular rhythm', 'Idioventricular rhythm'], answer: 3, explanation: 'An idioventricular rhythm has a rate of 20–40 bpm with wide, bizarre QRS complexes and no P waves. At 42 bpm with wide QRS and no P waves, this fits the idioventricular pattern (rate slightly above typical range indicates an "accelerated" variant, but 42 bpm is at the border).' },
    { q: 'Which of the following correctly describes the 8-step EKG rhythm analysis sequence?', options: ['P wave → QRS → T wave → rate → rhythm → interpretation', 'Rate → Rhythm → P waves → PR interval → QRS → ST segment → T wave → Interpretation', 'Rate → PR interval → QRS → rhythm → P wave → interpretation', 'Rhythm → rate → QRS → P wave → ST → interpretation'], answer: 1, explanation: 'The standard 8-step approach: (1) Rate, (2) Rhythm, (3) P waves, (4) PR interval, (5) QRS duration, (6) ST segment, (7) T waves, (8) Overall interpretation. Following this sequence systematically prevents missing findings.' },
  ],
};

// ─── LESSON DATA ──────────────────────────────────────────────────────────────
const lessons = [

// ═══════════════════════════════════════════════════════════════
// SECTION 1: INTRODUCTION TO CARDIAC ANATOMY
// ═══════════════════════════════════════════════════════════════
{
  section: 'INTRODUCTION TO CARDIAC ANATOMY', sort: 1, type: 'text',
  title: 'Welcome to EKG Technician',
  content: `<h2>Welcome to EKG Technician</h2>
<p>The electrocardiogram (EKG or ECG) is one of the most important diagnostic tools in medicine. It is non-invasive, painless, inexpensive, and provides immediate information about the heart's electrical activity. As an EKG Technician, you will be the person who performs this critical test — and your skill and accuracy directly affect patient care.</p>
<h3>What EKG Technicians Do</h3>
<ul>
  <li>Prepare patients and explain the EKG procedure</li>
  <li>Apply electrodes correctly to acquire accurate 12-lead EKG tracings</li>
  <li>Identify and correct technical problems and artifact</li>
  <li>Operate and maintain EKG equipment</li>
  <li>Recognize life-threatening rhythms that require immediate escalation</li>
  <li>Document and transmit EKG results to the clinical team</li>
</ul>
<h3>Career Outlook</h3>
<p>EKG Technicians work in hospitals, cardiac catheterization labs, outpatient clinics, cardiologist offices, and urgent care centers. With experience, many advance to cardiovascular technologist roles or specialize in Holter monitoring, stress testing, or echocardiography.</p>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>📊 Career Data:</strong> Cardiovascular technologists and technicians earn a median salary of <strong>$61,900/year</strong> (BLS, 2023), with strong projected growth of <strong>10%</strong> through 2031 — faster than average. Entry-level EKG Technician positions start at $35,000–$48,000.
</div>
<h3>Your Certification: CET</h3>
<p>The <strong>Certified EKG Technician (CET)</strong> credential is issued by the National Healthcareer Association (NHA). It is the most widely recognized EKG certification for entry-level professionals and demonstrates competency in EKG acquisition and basic rhythm recognition to employers nationwide.</p>
<h3>Course Structure</h3>
<ol>
  <li>Introduction to Cardiac Anatomy</li>
  <li>The 12-Lead EKG</li>
  <li>EKG Interpretation Basics</li>
  <li>EKG Acquisition and Patient Care</li>
  <li>Clinical Conditions on EKG</li>
  <li>CET Exam Preparation and Final Assessment</li>
</ol>`
},
{
  section: 'INTRODUCTION TO CARDIAC ANATOMY', sort: 2, type: 'presentation',
  title: 'Cardiac Anatomy & Physiology',
  pptxKey: 'cardiac-anatomy',
},
{
  section: 'INTRODUCTION TO CARDIAC ANATOMY', sort: 3, type: 'text',
  title: "The Heart's Electrical System",
  content: `<h2>The Heart's Electrical System</h2>
<p>The heart has a specialized electrical conduction system that generates and transmits impulses to trigger coordinated, rhythmic contractions. Understanding this system is the foundation of EKG interpretation.</p>

<h3>The Conduction Pathway</h3>
<p>A normal heartbeat follows this pathway:</p>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:8px;margin:12px 0;">
  <p style="margin:0;font-size:15px;"><strong>SA Node → Atria → AV Node → Bundle of His → Right & Left Bundle Branches → Purkinje Fibers → Ventricular Myocardium</strong></p>
</div>

<h4>1. Sinoatrial (SA) Node</h4>
<p>Located in the upper right atrium near the superior vena cava. The dominant pacemaker of the heart. Fires automatically at <strong>60–100 bpm</strong> under normal conditions. Rate is influenced by the autonomic nervous system — the sympathetic system increases rate; the parasympathetic (vagal) system decreases it.</p>

<h4>2. Internodal Pathways</h4>
<p>Three pathways carry the impulse from the SA node through the right atrium and across to the left atrium (via Bachmann's bundle), depolarizing both atria simultaneously. This produces the P wave on the EKG.</p>

<h4>3. Atrioventricular (AV) Node</h4>
<p>Located at the junction of the atria and ventricles. It <strong>deliberately delays</strong> the impulse by approximately 0.10 seconds, allowing the atria to complete contraction and push blood into the ventricles before ventricular contraction begins. The AV node is the only electrical connection between the atria and ventricles in a normal heart.</p>
<p>Intrinsic pacemaker rate if SA node fails: <strong>40–60 bpm</strong> (junctional escape rhythm).</p>

<h4>4. Bundle of His</h4>
<p>A short, thick band of conduction tissue that receives the impulse from the AV node and conducts it rapidly to the bundle branches.</p>

<h4>5. Right and Left Bundle Branches</h4>
<p>The Bundle of His divides into two branches that travel down opposite sides of the interventricular septum. The <strong>left bundle branch</strong> further divides into anterior and posterior fascicles. Either branch can be blocked (bundle branch block), causing abnormal, wide QRS complexes.</p>

<h4>6. Purkinje Fibers</h4>
<p>An extensive network of fibers that distribute the electrical impulse rapidly throughout the ventricular walls, causing nearly simultaneous ventricular depolarization and contraction. Intrinsic rate if all above fail: <strong>20–40 bpm</strong> (idioventricular rhythm).</p>

<h3>Intrinsic Pacemaker Rates (Escape Rates)</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Location</th><th style="padding:8px;">Intrinsic Rate</th><th style="padding:8px;">Rhythm Name if Takes Over</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">SA Node</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">60–100 bpm</td><td style="padding:8px;border:1px solid #e2e8f0;">Normal Sinus Rhythm</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">AV Junction</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">40–60 bpm</td><td style="padding:8px;border:1px solid #e2e8f0;">Junctional Escape Rhythm</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Purkinje / Ventricles</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">20–40 bpm</td><td style="padding:8px;border:1px solid #e2e8f0;">Idioventricular Rhythm</td></tr>
</table>`
},
{
  section: 'INTRODUCTION TO CARDIAC ANATOMY', sort: 4, type: 'text',
  title: 'The Cardiac Cycle',
  content: `<h2>The Cardiac Cycle</h2>
<p>The cardiac cycle is the sequence of mechanical events — contraction and relaxation — that occur with each heartbeat. The EKG records the electrical events that trigger this mechanical cycle. Understanding the relationship between electrical and mechanical activity is fundamental to EKG interpretation.</p>

<h3>Phases of the Cardiac Cycle</h3>

<h4>Systole (Contraction)</h4>
<p>The phase during which the heart muscle contracts and pumps blood out. Triggered by depolarization.</p>
<ul>
  <li><strong>Atrial systole:</strong> The atria contract, completing ventricular filling (contributes ~20–30% of end-diastolic volume). Corresponds to late in the P wave / PR interval.</li>
  <li><strong>Ventricular systole:</strong> The ventricles contract, ejecting blood into the aorta and pulmonary artery. Corresponds to the QRS complex and most of the ST segment.</li>
</ul>

<h4>Diastole (Relaxation)</h4>
<p>The phase during which the heart muscle relaxes and fills with blood. Triggered by repolarization.</p>
<ul>
  <li><strong>Atrial diastole:</strong> Atria relax and begin to fill from the pulmonary veins (LA) and vena cavae (RA).</li>
  <li><strong>Ventricular diastole:</strong> Ventricles relax and fill with blood. Corresponds to the T wave through the end of the next P wave.</li>
</ul>

<h3>Electrical vs. Mechanical Events</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;text-align:left;">EKG Event</th><th style="padding:8px;text-align:left;">Electrical Event</th><th style="padding:8px;text-align:left;">Mechanical Event</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">P wave</td><td style="padding:8px;border:1px solid #e2e8f0;">Atrial depolarization</td><td style="padding:8px;border:1px solid #e2e8f0;">Atrial contraction</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">PR interval</td><td style="padding:8px;border:1px solid #e2e8f0;">AV node conduction delay</td><td style="padding:8px;border:1px solid #e2e8f0;">Ventricular filling completes</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">QRS complex</td><td style="padding:8px;border:1px solid #e2e8f0;">Ventricular depolarization</td><td style="padding:8px;border:1px solid #e2e8f0;">Ventricular contraction begins</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">ST segment</td><td style="padding:8px;border:1px solid #e2e8f0;">Early ventricular repolarization</td><td style="padding:8px;border:1px solid #e2e8f0;">Ventricular contraction continues</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">T wave</td><td style="padding:8px;border:1px solid #e2e8f0;">Ventricular repolarization</td><td style="padding:8px;border:1px solid #e2e8f0;">Ventricular relaxation</td></tr>
</table>

<h3>Heart Rate and the Cardiac Cycle</h3>
<p>At a normal resting rate of 75 bpm, each cardiac cycle takes approximately 0.8 seconds:</p>
<ul>
  <li>Systole: ~0.3 seconds</li>
  <li>Diastole: ~0.5 seconds</li>
</ul>
<p>At higher heart rates (tachycardia), diastole shortens more than systole. At very high rates (>150 bpm), diastole may be too short for adequate ventricular filling, reducing cardiac output — this is why sustained tachycardia causes hemodynamic compromise.</p>

<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Key Concept:</strong> The EKG records <em>electrical</em> activity, not mechanical pumping. A patient can have organized electrical activity on EKG but no mechanical cardiac output — this is called Pulseless Electrical Activity (PEA), a form of cardiac arrest. Always assess the patient clinically, not just the monitor.
</div>`
},
{ section: 'INTRODUCTION TO CARDIAC ANATOMY', sort: 5, type: 'quiz', title: 'Quiz 1: Cardiac Anatomy & Physiology', quizKey: 'q1' },

// ═══════════════════════════════════════════════════════════════
// SECTION 2: THE 12-LEAD EKG
// ═══════════════════════════════════════════════════════════════
{
  section: 'THE 12-LEAD EKG', sort: 6, type: 'text',
  title: 'Introduction to the 12-Lead EKG',
  content: `<h2>Introduction to the 12-Lead EKG</h2>
<p>The 12-lead EKG is the gold standard electrocardiographic study. By recording the heart's electrical activity from 12 different angles simultaneously, it provides a comprehensive three-dimensional picture of cardiac electrical function that a single-lead rhythm strip cannot offer.</p>

<h3>Why 12 Leads?</h3>
<p>Different areas of the heart can be affected by different conditions — a heart attack in the inferior wall, for example, will only show ST changes in the inferior leads (II, III, aVF). A single monitoring lead might be entirely normal even during an acute MI if the infarct is in a territory not well-viewed by that lead. The 12-lead EKG ensures all regions of the heart are evaluated.</p>

<h3>Anatomical Territories and Their Leads</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;text-align:left;">Cardiac Territory</th><th style="padding:8px;text-align:left;">Leads</th><th style="padding:8px;text-align:left;">Typical Artery</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Inferior wall</td><td style="padding:8px;border:1px solid #e2e8f0;">II, III, aVF</td><td style="padding:8px;border:1px solid #e2e8f0;">Right Coronary Artery (RCA)</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">Lateral wall</td><td style="padding:8px;border:1px solid #e2e8f0;">I, aVL, V5, V6</td><td style="padding:8px;border:1px solid #e2e8f0;">Left Circumflex (LCx)</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Anterior wall</td><td style="padding:8px;border:1px solid #e2e8f0;">V1–V4</td><td style="padding:8px;border:1px solid #e2e8f0;">Left Anterior Descending (LAD)</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">Septal</td><td style="padding:8px;border:1px solid #e2e8f0;">V1, V2</td><td style="padding:8px;border:1px solid #e2e8f0;">LAD septal branches</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Anterolateral</td><td style="padding:8px;border:1px solid #e2e8f0;">I, aVL, V1–V6</td><td style="padding:8px;border:1px solid #e2e8f0;">LAD / LCx</td></tr>
</table>

<h3>Standard EKG Paper</h3>
<p>EKG paper is a graph with two dimensions:</p>
<ul>
  <li><strong>Horizontal axis (time):</strong> At 25 mm/sec: 1 small box = 0.04 sec; 1 large box = 0.20 sec; 5 large boxes = 1.00 sec</li>
  <li><strong>Vertical axis (amplitude/voltage):</strong> Standard gain 10 mm/mV: 1 small box = 0.1 mV; 1 large box = 0.5 mV; 2 large boxes = 1 mV</li>
</ul>

<h3>The Standard EKG Report</h3>
<p>A properly printed 12-lead EKG displays:</p>
<ul>
  <li>Three simultaneous 2.5-second rhythm strips per row × 4 rows = all 12 leads</li>
  <li>A longer continuous rhythm strip (usually Lead II or V1) across the bottom</li>
  <li>Computer-generated measurements and interpretation (always verified by a physician)</li>
  <li>Patient demographics, date/time, and technical parameters</li>
</ul>`
},
{
  section: 'THE 12-LEAD EKG', sort: 7, type: 'presentation',
  title: 'Leads, Electrodes & Placement',
  pptxKey: 'leads-placement',
},
{
  section: 'THE 12-LEAD EKG', sort: 8, type: 'text',
  title: 'Reading the EKG Paper',
  content: `<h2>Reading the EKG Paper</h2>
<p>Before interpreting waveforms, you must be fluent in reading the EKG grid. Every measurement you make — rate, intervals, amplitude — depends on accurate grid reading.</p>

<h3>The EKG Grid</h3>
<p>Standard EKG paper consists of a grid of small and large boxes:</p>
<ul>
  <li><strong>Small box:</strong> 1 mm × 1 mm</li>
  <li><strong>Large box:</strong> 5 mm × 5 mm (made up of 25 small boxes)</li>
</ul>

<h4>Horizontal Axis (Time)</h4>
<p>At the standard paper speed of <strong>25 mm/sec</strong>:</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Grid</th><th style="padding:8px;">Distance</th><th style="padding:8px;">Time</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1 small box</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1 mm</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.04 seconds</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1 large box</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">5 mm</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.20 seconds</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">5 large boxes</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">25 mm</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1.00 second</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">30 large boxes</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">150 mm</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">6.0 seconds</td></tr>
</table>

<h4>Vertical Axis (Amplitude/Voltage)</h4>
<p>At standard gain of <strong>10 mm/mV</strong>:</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Grid</th><th style="padding:8px;">Voltage</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1 small box</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.1 mV</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1 large box</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0.5 mV</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">2 large boxes</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1.0 mV (1 millivolt)</td></tr>
</table>

<h3>Calculating Heart Rate</h3>
<h4>Method 1: 300 Rule (Regular Rhythms)</h4>
<p>Count the number of large boxes between two consecutive R waves. Divide 300 by that number.</p>
<ul>
  <li>1 large box apart → 300 bpm</li>
  <li>2 large boxes → 150 bpm</li>
  <li>3 large boxes → 100 bpm</li>
  <li>4 large boxes → 75 bpm</li>
  <li>5 large boxes → 60 bpm</li>
  <li>6 large boxes → 50 bpm</li>
</ul>
<p><em>Memory aid: 300-150-100-75-60-50</em></p>

<h4>Method 2: 6-Second Strip Count (Any Rhythm)</h4>
<p>Count the number of complete QRS complexes within a 6-second strip (30 large boxes), then multiply by 10. This method works for both regular and irregular rhythms.</p>

<h3>Calibration Mark</h3>
<p>Every EKG should have a calibration mark (standardization pulse) — a 10 mm tall, 0.2-second wide rectangular pulse — at the beginning of each lead or at the start of the tracing. If the calibration mark is not the correct size, measurements from that tracing are unreliable. Always check for proper calibration.</p>`
},
{
  section: 'THE 12-LEAD EKG', sort: 9, type: 'text',
  title: 'Normal Sinus Rhythm and Waveforms',
  content: `<h2>Normal Sinus Rhythm and EKG Waveforms</h2>
<p>Normal sinus rhythm (NSR) is the standard against which all other rhythms are compared. Every finding that deviates from NSR represents an abnormality that must be identified and described.</p>

<h3>Criteria for Normal Sinus Rhythm</h3>
<ol>
  <li><strong>Rate:</strong> 60–100 bpm</li>
  <li><strong>Rhythm:</strong> Regular (R-R intervals consistent, ±0.08 sec)</li>
  <li><strong>P waves:</strong> Present, one before each QRS, upright in Lead II, same morphology throughout</li>
  <li><strong>PR interval:</strong> 0.12–0.20 seconds (constant)</li>
  <li><strong>QRS duration:</strong> Less than 0.12 seconds (narrow)</li>
  <li><strong>ST segment:</strong> Isoelectric (at baseline)</li>
  <li><strong>T waves:</strong> Upright in most leads, same direction as QRS</li>
</ol>

<h3>Individual Waveform Analysis</h3>

<h4>P Wave</h4>
<ul>
  <li>Represents: atrial depolarization</li>
  <li>Normal: upright and rounded in Lead II; inverted in aVR; <0.12 sec wide; <2.5 mm tall</li>
  <li>Abnormal: absent (junctional/ventricular rhythm, AFib); inverted in II (retrograde); bifid or broad (left atrial enlargement, P mitrale); peaked (right atrial enlargement, P pulmonale)</li>
</ul>

<h4>PR Interval</h4>
<ul>
  <li>Measured from: beginning of P wave to beginning of QRS</li>
  <li>Normal: 0.12–0.20 sec (3–5 small boxes)</li>
  <li>Short PR (&lt;0.12 sec): WPW syndrome, junctional rhythm, LGL syndrome</li>
  <li>Long PR (&gt;0.20 sec): First-degree AV block</li>
</ul>

<h4>QRS Complex</h4>
<ul>
  <li>Represents: ventricular depolarization</li>
  <li>Components: Q wave (initial downward deflection, if present); R wave (upward deflection); S wave (downward deflection after R)</li>
  <li>Normal width: &lt;0.12 sec (less than 3 small boxes)</li>
  <li>Wide QRS (&ge;0.12 sec): bundle branch block, ventricular rhythm, hyperkalemia, toxicity</li>
</ul>

<h4>ST Segment</h4>
<ul>
  <li>Measured from: end of QRS (J point) to beginning of T wave</li>
  <li>Normal: isoelectric (flat at baseline, ±0.5–1 mm)</li>
  <li>ST elevation: injury/infarction, pericarditis, early repolarization</li>
  <li>ST depression: ischemia, digitalis effect, reciprocal changes</li>
</ul>

<h4>T Wave</h4>
<ul>
  <li>Represents: ventricular repolarization</li>
  <li>Normal: asymmetric, same direction as QRS, &lt;5 mm in limb leads, &lt;10 mm in chest leads</li>
  <li>Peaked T waves: hyperkalemia, early MI (hyperacute)</li>
  <li>Inverted T waves: ischemia, ventricular hypertrophy, CNS events, post-MI</li>
  <li>Flat T waves: hypokalemia, ischemia</li>
</ul>

<h4>QT Interval</h4>
<ul>
  <li>Measured from: beginning of QRS to end of T wave</li>
  <li>Normal: &lt;0.44 sec (rate-dependent; use QTc for corrected value)</li>
  <li>Prolonged QT: drugs (antiarrhythmics, antipsychotics, antibiotics), hypokalemia, hypocalcemia, hypothermia — risk of Torsades de Pointes</li>
</ul>`
},
{ section: 'THE 12-LEAD EKG', sort: 10, type: 'quiz', title: 'Quiz 2: The 12-Lead EKG', quizKey: 'q2' },

// ═══════════════════════════════════════════════════════════════
// SECTION 3: EKG INTERPRETATION BASICS
// ═══════════════════════════════════════════════════════════════
{
  section: 'EKG INTERPRETATION BASICS', sort: 11, type: 'text',
  title: 'Intervals, Segments, and Measurements',
  content: `<h2>Intervals, Segments, and Measurements</h2>
<p>Precise measurement of EKG intervals is one of the core technical skills of EKG interpretation. This lesson provides a reference for all key measurements and their clinical significance.</p>

<h3>Quick Reference: Normal Values</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:10px;text-align:left;">Measurement</th><th style="padding:10px;text-align:left;">Normal Range</th><th style="padding:10px;text-align:left;">Small Boxes</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">PR Interval</td><td style="padding:10px;border:1px solid #e2e8f0;">0.12–0.20 sec</td><td style="padding:10px;border:1px solid #e2e8f0;">3–5 boxes</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">QRS Duration</td><td style="padding:10px;border:1px solid #e2e8f0;">&lt;0.12 sec</td><td style="padding:10px;border:1px solid #e2e8f0;">&lt;3 boxes</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">QT Interval</td><td style="padding:10px;border:1px solid #e2e8f0;">&lt;0.44 sec (corrected)</td><td style="padding:10px;border:1px solid #e2e8f0;">&lt;11 boxes</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">P Wave Duration</td><td style="padding:10px;border:1px solid #e2e8f0;">&lt;0.12 sec</td><td style="padding:10px;border:1px solid #e2e8f0;">&lt;3 boxes</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">P Wave Amplitude</td><td style="padding:10px;border:1px solid #e2e8f0;">&lt;2.5 mm</td><td style="padding:10px;border:1px solid #e2e8f0;">&lt;2.5 small boxes</td></tr>
</table>

<h3>Abnormal Interval Interpretation</h3>

<h4>Short PR Interval (&lt;0.12 sec)</h4>
<ul>
  <li><strong>Wolff-Parkinson-White (WPW):</strong> Accessory pathway (Bundle of Kent) bypasses the AV node, preexciting the ventricles. Look for delta wave (slurred initial QRS upstroke) + short PR + wide QRS.</li>
  <li><strong>Lown-Ganong-Levine (LGL):</strong> Short PR without delta wave</li>
  <li><strong>Junctional rhythm:</strong> Impulse originates in AV junction, P waves absent or near QRS</li>
</ul>

<h4>Prolonged PR Interval (&gt;0.20 sec)</h4>
<ul>
  <li>First-degree AV block: slowed AV conduction; every P wave is conducted; benign; no treatment</li>
  <li>Causes: increased vagal tone, inferior MI, digoxin, calcium channel blockers, beta-blockers</li>
</ul>

<h4>Wide QRS (&ge;0.12 sec)</h4>
<ul>
  <li>Right or Left Bundle Branch Block</li>
  <li>Ventricular tachycardia or idioventricular rhythm</li>
  <li>Hyperkalemia (severe)</li>
  <li>Sodium channel blocker toxicity (tricyclics, class I antiarrhythmics)</li>
  <li>Wolff-Parkinson-White with accessory pathway conduction</li>
  <li>Pacemaker rhythm</li>
</ul>

<h4>Prolonged QT (&gt;0.44 sec corrected)</h4>
<p>The QT interval is rate-dependent and must be corrected using Bazett's formula: QTc = QT ÷ √(RR interval in seconds)</p>
<ul>
  <li>Medications: antiarrhythmics (amiodarone, sotalol), antipsychotics, certain antibiotics (azithromycin, fluoroquinolones)</li>
  <li>Electrolytes: hypokalemia, hypomagnesemia, hypocalcemia</li>
  <li>Congenital long QT syndrome</li>
  <li>Risk: Torsades de Pointes → ventricular fibrillation</li>
</ul>`
},
{
  section: 'EKG INTERPRETATION BASICS', sort: 12, type: 'presentation',
  title: 'Rhythm Interpretation Fundamentals',
  pptxKey: 'rhythm-interpretation',
},
{
  section: 'EKG INTERPRETATION BASICS', sort: 13, type: 'text',
  title: 'Common Arrhythmias Part 1 — Atrial and Junctional',
  content: `<h2>Common Arrhythmias Part 1 — Atrial and Junctional</h2>
<p>Arrhythmias arising from the atria or AV junction produce rhythms with narrow QRS complexes (unless aberrant conduction or pre-existing bundle branch block is present).</p>

<h3>Sinus Rhythms</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;text-align:left;">Rhythm</th><th style="padding:8px;text-align:left;">Rate</th><th style="padding:8px;text-align:left;">Key Features</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Normal Sinus Rhythm (NSR)</td><td style="padding:8px;border:1px solid #e2e8f0;">60–100</td><td style="padding:8px;border:1px solid #e2e8f0;">Regular, P before QRS, normal intervals</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Sinus Bradycardia</td><td style="padding:8px;border:1px solid #e2e8f0;">&lt;60</td><td style="padding:8px;border:1px solid #e2e8f0;">Same as NSR but slow; may be normal in athletes</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Sinus Tachycardia</td><td style="padding:8px;border:1px solid #e2e8f0;">&gt;100</td><td style="padding:8px;border:1px solid #e2e8f0;">Same as NSR but fast; treat the cause, not the rhythm</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Sinus Arrhythmia</td><td style="padding:8px;border:1px solid #e2e8f0;">60–100</td><td style="padding:8px;border:1px solid #e2e8f0;">Regular irregularity that varies with respiration; normal variant</td></tr>
</table>

<h3>Premature Atrial Complex (PAC)</h3>
<ul>
  <li>Early beat originating in the atria (not the SA node)</li>
  <li>EKG: early, narrow QRS; P wave present but different morphology from sinus P; usually followed by incomplete compensatory pause</li>
  <li>Clinical: usually benign; can trigger SVT or AFib in susceptible patients</li>
</ul>

<h3>Supraventricular Tachycardia (SVT / AVNRT)</h3>
<ul>
  <li>Rapid reentrant circuit in or near the AV node</li>
  <li>EKG: regular narrow-complex tachycardia at 150–250 bpm; P waves absent or hidden in QRS; abrupt onset and termination</li>
  <li>Clinical: palpitations, lightheadedness; responds to vagal maneuvers, adenosine</li>
</ul>

<h3>Atrial Flutter</h3>
<ul>
  <li>Rapid, organized atrial circuit firing at ~300 bpm</li>
  <li>EKG: sawtooth flutter waves (best seen in II, III, aVF, V1); AV node blocks most — typically 2:1, 3:1, or 4:1 conduction ratio; regular ventricular response at 75–150 bpm</li>
  <li>Ventricular rate = atrial rate ÷ conduction ratio (e.g., 300 ÷ 4 = 75 bpm)</li>
</ul>

<h3>Atrial Fibrillation (AFib)</h3>
<ul>
  <li>Most common sustained arrhythmia; chaotic atrial activity at 350–600 bpm</li>
  <li>EKG: <strong>irregularly irregular</strong> ventricular response; <strong>no distinct P waves</strong> (replaced by fibrillatory baseline — wavy or flat); narrow QRS (usually)</li>
  <li>Clinical: stroke risk (requires anticoagulation); rate control vs. rhythm control debate</li>
</ul>

<h3>Junctional Rhythms</h3>
<ul>
  <li>Originate in the AV junction; rate 40–60 bpm (escape) or 60–100 (accelerated junctional)</li>
  <li>EKG: narrow QRS; P waves absent, inverted (retrograde), or occur just before/after QRS</li>
  <li>Occurs when SA node fails or rate slows below junction's escape rate</li>
</ul>`
},
{
  section: 'EKG INTERPRETATION BASICS', sort: 14, type: 'text',
  title: 'Common Arrhythmias Part 2 — Ventricular',
  content: `<h2>Common Arrhythmias Part 2 — Ventricular</h2>
<p>Ventricular arrhythmias originate below the Bundle of His and produce characteristic wide, bizarre QRS complexes. They range from benign (isolated PVCs) to immediately life-threatening (ventricular fibrillation).</p>

<h3>Premature Ventricular Complex (PVC)</h3>
<ul>
  <li>Early beat originating in the ventricular myocardium</li>
  <li>EKG: wide (&ge;0.12 sec), bizarre QRS; no preceding P wave; T wave deflects opposite to QRS; usually followed by a full compensatory pause</li>
  <li>Patterns: unifocal (same morphology — one focus), multifocal (different morphologies — multiple foci); bigeminy (every other beat), trigeminy (every third)</li>
  <li>Clinical concern: frequent PVCs, R-on-T phenomenon (PVC falls on T wave of previous beat — can trigger VF), runs of PVCs</li>
</ul>

<h3>Ventricular Tachycardia (VT)</h3>
<ul>
  <li>Three or more consecutive PVCs at rate &gt;100 bpm</li>
  <li>EKG: wide, regular (usually), bizarre QRS complexes at 100–250 bpm; AV dissociation (P waves independent of QRS) is diagnostic</li>
  <li>Monomorphic VT: all QRS complexes same shape (one focus)</li>
  <li>Polymorphic VT: varying QRS shape — Torsades de Pointes if associated with long QT</li>
  <li>Clinical: may be pulseless (cardiac arrest) or with pulse (hemodynamically stable or unstable); always urgent</li>
</ul>

<h3>Ventricular Fibrillation (VF)</h3>
<ul>
  <li>Completely disorganized ventricular electrical activity — no effective contraction</li>
  <li>EKG: chaotic, irregular baseline with no identifiable P, QRS, or T waves; amplitude varies</li>
  <li>Clinical: cardiac arrest — no pulse, no cardiac output; requires immediate CPR and defibrillation</li>
  <li>The most common initial rhythm in sudden cardiac arrest</li>
</ul>

<h3>Idioventricular Rhythm</h3>
<ul>
  <li>Ventricular escape rhythm when higher pacemakers fail; rate 20–40 bpm</li>
  <li>EKG: wide, slow QRS; no P waves (or P waves unrelated to QRS)</li>
  <li>Accelerated idioventricular rhythm (AIVR): rate 40–100 bpm; often seen in reperfusion after MI</li>
  <li>Clinical: represents severe myocardial compromise; treat underlying cause</li>
</ul>

<h3>AV Blocks (Review)</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;text-align:left;">Block Type</th><th style="padding:8px;text-align:left;">PR Interval</th><th style="padding:8px;text-align:left;">QRS Dropped?</th><th style="padding:8px;text-align:left;">Urgency</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">1st Degree</td><td style="padding:8px;border:1px solid #e2e8f0;">&gt;0.20 sec, constant</td><td style="padding:8px;border:1px solid #e2e8f0;">No</td><td style="padding:8px;border:1px solid #e2e8f0;">Monitor</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">2nd Degree Mobitz I</td><td style="padding:8px;border:1px solid #e2e8f0;">Progressively lengthens</td><td style="padding:8px;border:1px solid #e2e8f0;">Yes (periodically)</td><td style="padding:8px;border:1px solid #e2e8f0;">Usually benign</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">2nd Degree Mobitz II</td><td style="padding:8px;border:1px solid #e2e8f0;">Constant</td><td style="padding:8px;border:1px solid #e2e8f0;">Yes (sudden)</td><td style="padding:8px;border:1px solid #e2e8f0;">High risk — pacemaker</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">3rd Degree (Complete)</td><td style="padding:8px;border:1px solid #e2e8f0;">No relationship</td><td style="padding:8px;border:1px solid #e2e8f0;">Complete AV dissociation</td><td style="padding:8px;border:1px solid #e2e8f0;">Emergency — pacemaker</td></tr>
</table>

<div style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Life-Threatening Rhythms Requiring Immediate Escalation:</strong> Ventricular fibrillation, pulseless ventricular tachycardia, third-degree AV block with hemodynamic instability, and asystole. The EKG technician's role is to recognize these patterns and notify the clinical team immediately.
</div>`
},
{ section: 'EKG INTERPRETATION BASICS', sort: 15, type: 'quiz', title: 'Quiz 3: EKG Interpretation', quizKey: 'q3' },

// ═══════════════════════════════════════════════════════════════
// SECTION 4: EKG ACQUISITION & PATIENT CARE
// ═══════════════════════════════════════════════════════════════
{
  section: 'EKG ACQUISITION & PATIENT CARE', sort: 16, type: 'text',
  title: 'Performing the 12-Lead EKG',
  content: `<h2>Performing the 12-Lead EKG</h2>
<p>Acquiring a technically excellent EKG is the core skill of the EKG Technician. A poorly performed EKG can lead to misdiagnosis, repeated studies, and delayed patient care.</p>

<h3>Equipment Needed</h3>
<ul>
  <li>12-lead EKG machine (cart-based or portable)</li>
  <li>10 disposable electrodes (pre-gelled, adhesive)</li>
  <li>Alcohol wipes or abrasive prep pads</li>
  <li>Disposable razor or hair clippers (if needed)</li>
  <li>Patient gown or sheet for privacy</li>
  <li>Warm blanket (to prevent shivering artifact)</li>
</ul>

<h3>Step-by-Step Procedure</h3>
<ol>
  <li><strong>Verify the order</strong> and confirm patient identity using two identifiers (name + DOB)</li>
  <li><strong>Explain the procedure</strong> to the patient: painless, no electricity goes into the body, takes about 5 minutes</li>
  <li><strong>Position the patient</strong> supine, arms at sides, legs uncrossed and not touching</li>
  <li><strong>Provide privacy</strong> — expose only the necessary areas; use a drape for the lower body</li>
  <li><strong>Prepare the skin</strong> at each electrode site: clean with alcohol, abrade if needed, dry thoroughly, clip hair if necessary</li>
  <li><strong>Apply limb electrodes:</strong> RA (right arm/shoulder), LA (left arm/shoulder), RL (right leg/lower abdomen — ground), LL (left leg/lower abdomen)</li>
  <li><strong>Apply chest electrodes</strong> V1–V6 in order (see placement in Section 2)</li>
  <li><strong>Connect the lead wires</strong> — color coded and labeled; match to corresponding electrode</li>
  <li><strong>Enter patient data</strong> into the machine: name, DOB, date/time, clinical indication</li>
  <li><strong>Instruct the patient:</strong> "Please lie still, relax your muscles, and breathe normally. Don't talk during the recording."</li>
  <li><strong>Acquire the tracing</strong> — check for artifact before finalizing</li>
  <li><strong>Review the printout</strong> — verify all 12 leads are present, baseline is stable, no significant artifact</li>
  <li><strong>Remove electrodes</strong> gently, clean any remaining gel from the skin</li>
  <li><strong>Assist the patient</strong> in redressing; ensure comfort and safety before leaving</li>
  <li><strong>Deliver/transmit the EKG</strong> to the ordering provider per facility protocol</li>
</ol>

<h3>Lead Wire Color Coding (AHA Standard)</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Lead</th><th style="padding:8px;">Color</th><th style="padding:8px;">Mnemonic</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">RA</td><td style="padding:8px;border:1px solid #e2e8f0;">White</td><td style="padding:8px;border:1px solid #e2e8f0;">White = clouds = right (snow to the right)</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">LA</td><td style="padding:8px;border:1px solid #e2e8f0;">Black</td><td style="padding:8px;border:1px solid #e2e8f0;">Black = smoke = left</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">RL</td><td style="padding:8px;border:1px solid #e2e8f0;">Green</td><td style="padding:8px;border:1px solid #e2e8f0;">Green = ground</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">LL</td><td style="padding:8px;border:1px solid #e2e8f0;">Red</td><td style="padding:8px;border:1px solid #e2e8f0;">Red = left leg</td></tr>
</table>`
},
{
  section: 'EKG ACQUISITION & PATIENT CARE', sort: 17, type: 'presentation',
  title: 'Patient Prep & Artifact Reduction',
  pptxKey: 'patient-prep',
},
{
  section: 'EKG ACQUISITION & PATIENT CARE', sort: 18, type: 'text',
  title: 'Troubleshooting and Special Populations',
  content: `<h2>Troubleshooting and Special Populations</h2>
<p>Real-world EKG acquisition rarely goes exactly as textbook. EKG technicians must be able to identify problems, troubleshoot systematically, and adapt technique for special patient populations.</p>

<h3>Systematic Troubleshooting</h3>
<p>When artifact or signal problems appear, follow this sequence:</p>
<ol>
  <li><strong>Identify the problem</strong> — which leads are affected? All leads (systemic problem) or specific leads (localized problem)?</li>
  <li><strong>Check the patient</strong> — is the patient moving, tense, shivering, or talking?</li>
  <li><strong>Check electrode contact</strong> — press all electrodes firmly; look for lifted edges or poor adhesion</li>
  <li><strong>Check lead wire connections</strong> — is every wire firmly snapped onto its electrode?</li>
  <li><strong>Check skin preparation</strong> — re-prep the skin if contact seems poor</li>
  <li><strong>Check for electrical interference</strong> — is there nearby equipment that can be turned off or moved?</li>
  <li><strong>Check the ground electrode (RL)</strong> — poor RL contact is a common cause of AC artifact</li>
</ol>

<h3>Electrode Lead Reversal</h3>
<p>Lead reversal is one of the most common technical errors and can mimic pathology:</p>
<ul>
  <li><strong>RA-LA reversal:</strong> Lead I shows inverted waveforms; aVR and aVL appear reversed; Lead II looks like Lead III</li>
  <li><strong>RA-LL reversal:</strong> Lead II becomes biphasic or flat; aVR shows a tall positive QRS</li>
  <li><strong>Any limb lead on wrong limb:</strong> Creates impossible or unusual axis findings</li>
  <li>If lead reversal is suspected: recheck all electrode placements and rewire before repeating</li>
</ul>

<h3>Special Patient Populations</h3>

<h4>Pediatric Patients</h4>
<ul>
  <li>Normal heart rates are higher in children (newborn: 100–170 bpm; toddler: 90–150; school age: 70–120)</li>
  <li>Use smaller pediatric electrodes for small chests</li>
  <li>QRS may be normally narrow; T waves may be inverted in right precordial leads (normal in young children)</li>
  <li>Minimize time with electrodes on to reduce distress</li>
</ul>

<h4>Pregnant Patients</h4>
<ul>
  <li>Heart rate increases 15–20 bpm during pregnancy (normal sinus tachycardia)</li>
  <li>Diaphragm elevation shifts the heart slightly left — may cause axis changes</li>
  <li>Position the patient in left lateral tilt if supine causes discomfort (aortocaval compression)</li>
</ul>

<h4>Patients with Pacemakers</h4>
<ul>
  <li>Pacemaker spikes: sharp vertical marks before the paced P wave (atrial pacing) or QRS (ventricular pacing)</li>
  <li>Paced QRS complexes are wide and may resemble LBBB</li>
  <li>Document pacemaker presence in the record; do not mistake pacing spikes for artifact</li>
  <li>Never place electrodes directly over the pacemaker generator</li>
</ul>

<h4>Post-Mastectomy Patients</h4>
<ul>
  <li>Anatomical landmarks may be altered; use anatomical reference points, not just visual estimation</li>
  <li>Electrode placement should still follow standard ICS landmarks on the chest wall</li>
  <li>Document any modifications to standard placement</li>
</ul>`
},
{
  section: 'EKG ACQUISITION & PATIENT CARE', sort: 19, type: 'text',
  title: 'Documentation and Reporting',
  content: `<h2>Documentation and Reporting</h2>
<p>An EKG tracing is a legal medical document. Proper documentation ensures patient safety, supports clinical decision-making, and protects the technician and facility from liability.</p>

<h3>Required Documentation on Every EKG</h3>
<ul>
  <li><strong>Patient full name</strong> and date of birth</li>
  <li><strong>Medical record number</strong> (if applicable)</li>
  <li><strong>Date and time</strong> of acquisition (not when it was read — when it was performed)</li>
  <li><strong>Technician identification</strong> (name, employee ID, or credential)</li>
  <li><strong>Clinical indication</strong> (reason for EKG — chest pain, shortness of breath, preoperative, etc.)</li>
  <li><strong>Technical notes:</strong> any deviation from standard technique, difficult placement, artifact that could not be eliminated, patient position if not standard supine</li>
  <li><strong>Medications</strong> if relevant (e.g., digoxin, antiarrhythmics that affect EKG)</li>
</ul>

<h3>EKG Transmission and Storage</h3>
<p>Modern EKG systems are integrated with the hospital Electronic Health Record (EHR):</p>
<ul>
  <li>EKGs are transmitted electronically and stored permanently in the patient's record</li>
  <li>Physicians can view EKGs from anywhere in the hospital or remotely</li>
  <li>Previous EKGs can be compared side-by-side to detect changes</li>
  <li>Alert systems can notify physicians immediately of critical findings</li>
  <li>Paper tracings should be stored securely if generated; never left unattended or misplaced</li>
</ul>

<h3>Critical Value Reporting</h3>
<p>EKG technicians are expected to recognize potentially life-threatening rhythms and escalate immediately — without waiting for a physician to read the EKG. Facility protocols define which findings are "critical values" requiring immediate notification. Common critical EKG findings include:</p>
<ul>
  <li>Ventricular fibrillation or pulseless ventricular tachycardia</li>
  <li>ST elevation consistent with acute STEMI</li>
  <li>Complete (third-degree) AV block</li>
  <li>Asystole</li>
  <li>Severe bradycardia (&lt;40 bpm) with symptoms</li>
  <li>Rapid ventricular response with hemodynamic compromise</li>
</ul>
<p>When you identify a potentially critical finding, immediately notify the nurse or physician and document the notification: time, who was notified, and their response.</p>

<h3>Holter Monitoring</h3>
<p>A Holter monitor is a portable EKG device worn by the patient for 24–48 hours (or longer) to capture intermittent arrhythmias not seen on a standard 12-lead. EKG technicians may be involved in:</p>
<ul>
  <li>Applying and removing the Holter monitor</li>
  <li>Instructing the patient to keep a symptom diary</li>
  <li>Downloading and preparing data for physician analysis</li>
</ul>`
},
{ section: 'EKG ACQUISITION & PATIENT CARE', sort: 20, type: 'quiz', title: 'Quiz 4: EKG Acquisition & Patient Care', quizKey: 'q4' },

// ═══════════════════════════════════════════════════════════════
// SECTION 5: CLINICAL CONDITIONS ON EKG
// ═══════════════════════════════════════════════════════════════
{
  section: 'CLINICAL CONDITIONS ON EKG', sort: 21, type: 'text',
  title: 'Myocardial Infarction on EKG',
  content: `<h2>Myocardial Infarction on EKG</h2>
<p>Myocardial infarction (MI) — commonly called a heart attack — occurs when a coronary artery is blocked, cutting off blood supply to heart muscle. The EKG is one of the first and most critical diagnostic tools in MI evaluation. Recognizing MI patterns and escalating immediately can save a patient's life.</p>

<h3>The EKG Sequence in Acute MI</h3>
<p>EKG changes evolve over time during an MI:</p>
<ol>
  <li><strong>Hyperacute phase (minutes):</strong> Tall, peaked T waves (hyperacute T waves) — often missed</li>
  <li><strong>Acute injury phase (minutes to hours):</strong> ST segment elevation — this is when the patient is in the catheterization lab window</li>
  <li><strong>Evolving phase (hours to days):</strong> ST elevation begins to resolve; Q waves develop; T waves invert</li>
  <li><strong>Established/old MI:</strong> Persistent Q waves; T waves may normalize; ST returns to baseline</li>
</ol>

<h3>ST-Elevation MI (STEMI)</h3>
<p>Criteria for STEMI: ST elevation ≥1 mm in ≥2 contiguous limb leads, or ≥2 mm in ≥2 contiguous chest leads.</p>
<p>STEMI is a medical emergency. Time is muscle — every minute of delay means more myocardium dies. The goal is reperfusion (PCI or thrombolytics) within 90 minutes of first medical contact.</p>

<h3>MI Localization by Lead</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;text-align:left;">Leads with ST Elevation</th><th style="padding:8px;text-align:left;">MI Location</th><th style="padding:8px;text-align:left;">Artery</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">II, III, aVF</td><td style="padding:8px;border:1px solid #e2e8f0;">Inferior wall</td><td style="padding:8px;border:1px solid #e2e8f0;">RCA</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">V1–V4</td><td style="padding:8px;border:1px solid #e2e8f0;">Anterior wall</td><td style="padding:8px;border:1px solid #e2e8f0;">LAD</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">I, aVL, V5–V6</td><td style="padding:8px;border:1px solid #e2e8f0;">Lateral wall</td><td style="padding:8px;border:1px solid #e2e8f0;">LCx</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">V1–V6, I, aVL</td><td style="padding:8px;border:1px solid #e2e8f0;">Anterolateral</td><td style="padding:8px;border:1px solid #e2e8f0;">LAD / LCx</td></tr>
</table>

<h3>Non-ST-Elevation MI (NSTEMI) and Unstable Angina</h3>
<ul>
  <li>ST depression ≥0.5 mm or T-wave inversion in ≥2 contiguous leads</li>
  <li>Indicates subendocardial ischemia — partial blockage or demand ischemia</li>
  <li>Distinguished from unstable angina by troponin elevation (NSTEMI) vs. no troponin rise (unstable angina)</li>
  <li>Also urgent — but less immediate than STEMI</li>
</ul>

<h3>Pathological Q Waves</h3>
<p>Pathological Q waves (≥0.04 sec wide, ≥25% of R wave height) indicate areas of dead myocardium (necrosis). They persist long after the acute MI and indicate prior infarction. Small Q waves in lateral leads (I, aVL, V5–V6) are normal — they represent septal depolarization.</p>

<div style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Your Role in STEMI:</strong> As an EKG technician, you may be the first person to see a STEMI pattern. Do not wait. Immediately notify the nurse or physician and hand them the tracing. Document the time of acquisition and the time of notification. Your rapid response directly affects the patient's survival.
</div>`
},
{
  section: 'CLINICAL CONDITIONS ON EKG', sort: 22, type: 'presentation',
  title: 'ST Changes, Blocks & Hypertrophy',
  pptxKey: 'st-changes',
},
{
  section: 'CLINICAL CONDITIONS ON EKG', sort: 23, type: 'text',
  title: 'Electrolyte Disturbances and Drug Effects on EKG',
  content: `<h2>Electrolyte Disturbances and Drug Effects on EKG</h2>
<p>The heart's electrical activity is highly sensitive to changes in serum electrolytes and certain medications. Recognizing these EKG patterns allows for early detection of potentially dangerous conditions.</p>

<h3>Potassium (K+) Disturbances</h3>

<h4>Hyperkalemia (High Potassium)</h4>
<p>EKG changes progress with rising potassium levels:</p>
<ol>
  <li><strong>Mild (5.5–6.5 mEq/L):</strong> Tall, narrow, peaked ("tent") T waves</li>
  <li><strong>Moderate (6.5–7.5 mEq/L):</strong> Widening QRS; prolonged PR; flat P waves</li>
  <li><strong>Severe (&gt;7.5 mEq/L):</strong> Sine wave pattern (P waves disappear, QRS and T merge); can cause VF or asystole</li>
</ol>
<p>Causes: renal failure, ACE inhibitors, potassium-sparing diuretics, acidosis, massive tissue destruction. Emergency — requires immediate treatment.</p>

<h4>Hypokalemia (Low Potassium)</h4>
<ul>
  <li>Flattened or inverted T waves</li>
  <li>Prominent U waves (positive deflection after T wave, best seen in V2–V3)</li>
  <li>Prolonged QT (actually QU) interval</li>
  <li>Increased arrhythmia risk: PVCs, VT, Torsades de Pointes</li>
  <li>Causes: diuretics (furosemide, thiazides), vomiting, diarrhea, poor oral intake</li>
</ul>

<h3>Calcium (Ca²+) Disturbances</h3>
<ul>
  <li><strong>Hypercalcemia:</strong> Shortened QT interval; may cause PR prolongation; bradycardia</li>
  <li><strong>Hypocalcemia:</strong> Prolonged QT interval (longest QT changes of any electrolyte); risk of Torsades de Pointes; no significant T-wave change</li>
</ul>

<h3>Drug Effects on EKG</h3>

<h4>Digoxin</h4>
<ul>
  <li>Therapeutic effect: scooped ("Salvador Dali moustache") ST depression in lateral leads; shortened QT; slowed AV conduction</li>
  <li>Toxicity: any arrhythmia, especially regularized AFib (suggesting AV block) or bidirectional VT</li>
  <li>Classic sign: "digitalis effect" — downsloping ST depression with a characteristic scooped appearance</li>
</ul>

<h4>Antiarrhythmic Drugs (Class IA, IC, III)</h4>
<ul>
  <li>QT prolongation (amiodarone, sotalol, quinidine, dofetilide) — risk of Torsades de Pointes</li>
  <li>QRS widening (flecainide, propafenone, procainamide) — sodium channel blockade</li>
</ul>

<h4>Tricyclic Antidepressants (Overdose)</h4>
<ul>
  <li>Wide QRS (&gt;0.10 sec) is a marker of toxicity and seizure/arrhythmia risk</li>
  <li>Prolonged QT; right axis deviation; tall R wave in aVR (&gt;3 mm)</li>
  <li>Sodium bicarbonate is the treatment — narrows QRS by increasing sodium influx</li>
</ul>`
},
{ section: 'CLINICAL CONDITIONS ON EKG', sort: 24, type: 'quiz', title: 'Quiz 5: Clinical Conditions on EKG', quizKey: 'q5' },

// ═══════════════════════════════════════════════════════════════
// SECTION 6: EXAM PREPARATION
// ═══════════════════════════════════════════════════════════════
{
  section: 'EXAM PREPARATION', sort: 25, type: 'text',
  title: 'Study Guide and Key Concepts Review',
  content: `<h2>Study Guide and Key Concepts Review</h2>
<p>Use this consolidated review guide in the days before your NHA CET exam. Focus extra time on any section where you feel less confident.</p>

<h3>Section 1: Cardiac Anatomy</h3>
<ul>
  <li>Blood flow: body → RA → RV → lungs → LA → LV → body</li>
  <li>Conduction: SA node → atria → AV node (delay) → Bundle of His → BBs → Purkinje → ventricles</li>
  <li>SA node: 60–100 bpm; AV junction: 40–60 bpm; Purkinje: 20–40 bpm</li>
  <li>Depolarization = contraction; Repolarization = relaxation</li>
  <li>EKG records electrical activity, not mechanical pumping</li>
</ul>

<h3>Section 2: The 12-Lead EKG</h3>
<ul>
  <li><strong>10 electrodes → 12 leads</strong> (4 limb + 6 chest)</li>
  <li>V1: 4th ICS, R sternal border | V2: 4th ICS, L sternal border | V3: between | V4: 5th ICS, MCL | V5: AAL | V6: MAL</li>
  <li>Paper speed: 25 mm/sec; 1 small box = 0.04 sec; 1 large box = 0.20 sec</li>
  <li>Rate (regular): 300 ÷ large boxes between R waves; or count QRS in 6-sec strip × 10</li>
  <li>Standard gain: 10 mm = 1 mV; calibration mark should be 10 mm tall</li>
</ul>

<h3>Section 3: Normal Values and Arrhythmias</h3>
<ul>
  <li>PR: 0.12–0.20 sec | QRS: &lt;0.12 sec | QT corrected: &lt;0.44 sec</li>
  <li>AFib: irregularly irregular, no P waves — most common sustained arrhythmia</li>
  <li>AFlutter: sawtooth waves ~300 bpm, regular conduction ratio</li>
  <li>PVC: wide, bizarre, no P wave, compensatory pause</li>
  <li>VT: ≥3 PVCs, rate &gt;100 bpm, AV dissociation</li>
  <li>VF: chaotic — no waveforms — cardiac arrest — defibrillate</li>
  <li>Wenckebach: lengthening PR → dropped QRS | Mobitz II: constant PR → sudden drop</li>
  <li>3rd degree AV block: complete AV dissociation — emergency</li>
</ul>

<h3>Section 4: EKG Acquisition</h3>
<ul>
  <li>Skin prep is the most important step for signal quality</li>
  <li>Patient position: supine, arms at sides, legs uncrossed</li>
  <li>Somatic artifact: patient movement/shivering → warm patient, ask to relax</li>
  <li>AC artifact: electrical interference → check all connections, especially RL ground</li>
  <li>Wandering baseline: loose electrode or deep breathing → re-prep, reapply</li>
  <li>Document: patient ID, date/time, technician, clinical indication, technical notes</li>
  <li>Escalate critical findings immediately — don't wait for the EKG to be read</li>
</ul>

<h3>Section 5: Clinical Conditions</h3>
<ul>
  <li>STEMI criteria: ST elevation ≥1 mm (limb) or ≥2 mm (chest) in ≥2 contiguous leads</li>
  <li>Inferior STEMI: II, III, aVF (RCA) | Anterior STEMI: V1–V4 (LAD) | Lateral: I, aVL, V5–V6 (LCx)</li>
  <li>Hyperkalemia: peaked T waves → widened QRS → sine wave</li>
  <li>Hypokalemia: flat T waves, U waves, prolonged QT</li>
  <li>RBBB: rSR\' in V1, wide S in I/aVL/V5-V6 | LBBB: broad R in I/aVL/V5-V6, QS in V1</li>
  <li>Long QT risk: Torsades de Pointes → VF</li>
  <li>Digoxin effect: scooped ST depression in lateral leads</li>
</ul>`
},
{
  section: 'EXAM PREPARATION', sort: 26, type: 'presentation',
  title: 'CET Exam Strategy',
  pptxKey: 'exam-prep',
},
{ section: 'EXAM PREPARATION', sort: 27, type: 'quiz', title: 'Final Assessment: CET Practice Exam', quizKey: 'final' },

]; // end lessons

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const conn = await mysql.createConnection(DB);

  const [existing] = await conn.execute('SELECT id FROM lessons WHERE course_id = ?', [COURSE_ID]);
  for (const row of existing) {
    await conn.execute('DELETE FROM quiz_questions WHERE lesson_id = ?', [row.id]);
  }
  await conn.execute('DELETE FROM lessons WHERE course_id = ?', [COURSE_ID]);
  console.log(`Cleared existing lessons for course ${COURSE_ID}`);

  for (const lesson of lessons) {
    let content = lesson.content || '';

    let filePath = null;
    if (lesson.type === 'presentation') {
      filePath = makePptx(lesson.pptxKey);
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
        const type = (q.options.length === 2 && q.options.every(o => /^(true|false)$/i.test(o)))
          ? 'true_false' : 'multiple_choice';
        await conn.execute(
          `INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [lessonId, type, q.q, JSON.stringify(q.options), q.options[q.answer], i]
        );
      }
      console.log(`    └─ ${qs.length} questions inserted`);
    }
  }

  await conn.end();
  console.log(`\nDone! Course ${COURSE_ID} populated with ${lessons.length} lessons.`);
}

main().catch(err => { console.error(err); process.exit(1); });
