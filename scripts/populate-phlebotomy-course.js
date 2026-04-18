/**
 * populate-phlebotomy-course.js
 * Course 12: Phlebotomy Technician (CPT Prep)
 * 27 lessons: 15 text, 6 presentations, 6 quizzes
 * Quizzes inserted directly into quiz_questions table.
 */

const mysql = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const path = require('path');

const UPLOADS_DIR = '/var/www/nationalhealthcareer-com/public/uploads';
const COURSE_ID = 12;
const DB = { host: 'localhost', user: 'admin_nhca', password: '2u95#I7jm', database: 'nha_db' };

let _n = 0;
function slug(title) {
  _n++;
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150) + '-c12-' + _n;
}

// ─── PPTX GENERATOR ───────────────────────────────────────────────────────────
function makePptx(key) {
  const decks = {
    'circulatory-system': {
      title: 'The Circulatory System & Blood',
      slides: [
        { heading: 'The Circulatory System & Blood', body: 'Phlebotomy — the collection of blood specimens — requires a thorough understanding of the cardiovascular system, blood composition, and vascular anatomy. This knowledge underpins every venipuncture decision.' },
        { heading: 'Blood Composition', body: 'Whole blood = Plasma (55%) + Formed Elements (45%)\n\nPlasma: water, proteins (albumin, fibrinogen, globulins), clotting factors, hormones, nutrients\n\nFormed Elements:\n• Erythrocytes (RBCs) — oxygen transport; 4.5–5.5 million/µL\n• Leukocytes (WBCs) — immune defense; 4,500–11,000/µL\n• Thrombocytes (Platelets) — hemostasis; 150,000–400,000/µL' },
        { heading: 'Blood Vessels', body: 'Arteries: carry oxygenated blood away from heart; thick, muscular walls; pulsatile\n\nCapillaries: site of gas and nutrient exchange; single cell layer\n\nVeins: carry deoxygenated blood toward heart; thinner walls; valves prevent backflow; larger lumen\n\nPhlebotomy targets veins — they are more accessible, less painful, and blood flows at lower pressure than arteries.' },
        { heading: 'The Antecubital Fossa', body: 'Primary site for venipuncture:\n\n• Median cubital vein — FIRST CHOICE: large, fixed, least painful\n• Cephalic vein — lateral (thumb side); good alternative\n• Basilic vein — medial (pinky side); used last; near brachial artery and median nerve; higher risk\n\nThe H-pattern or M-pattern of veins varies by patient. Always palpate before selecting.' },
        { heading: 'Key Takeaways', body: '✓ Blood is ~55% plasma and ~45% formed elements\n✓ Veins are the target for routine phlebotomy\n✓ Median cubital vein is the preferred site\n✓ Basilic vein is the highest-risk antecubital vein\n✓ Always palpate to locate and assess the vein before venipuncture\n✓ Arteries are not routine phlebotomy targets (ABGs require special training)' },
      ]
    },
    'equipment': {
      title: 'Phlebotomy Equipment & Tubes',
      slides: [
        { heading: 'Venipuncture Equipment', body: 'Standard phlebotomy tray contents:\n• Evacuated tube system: holder + double-ended needle\n• Winged infusion set ("butterfly") — for small or difficult veins\n• Syringes — for fragile veins; requires transfer to tubes\n• Tourniquets (single-use latex-free)\n• Alcohol prep pads (70% isopropyl)\n• Gauze pads\n• Bandages or tape\n• Sharps container (immediately accessible)\n• Gloves (PPE — always)' },
        { heading: 'Needle Gauge & Length', body: 'Gauge: the higher the number, the smaller the bore (diameter)\n\n• 21 gauge: standard for routine venipuncture (adults)\n• 22 gauge: acceptable for routine; slower flow\n• 23 gauge: butterfly/winged set for small veins or pediatrics\n• 25 gauge: very small veins, pediatrics, geriatrics\n\nLength: 1 inch standard for antecubital; 3/4 inch for butterfly\n\nRule: use the smallest gauge needle that allows adequate flow for the ordered tests.' },
        { heading: 'Evacuated Tube System', body: 'The Vacutainer® system uses pre-evacuated tubes to draw blood by vacuum.\n\nComponents:\n• Double-ended needle: patient end (longer) + tube end (shorter, rubber-sheathed)\n• Holder/adapter: holds needle and tube\n• Evacuated tubes: contain additives specific to test type\n\nAdvantages: closed system (reduces exposure risk), multiple tubes without needle change, standardized fill volumes' },
        { heading: 'Blood Collection Tubes by Color', body: 'Red/Gold (SST): Serum Separator — clot activator; for chemistry, serology\nLavender/Purple: EDTA — anticoagulant; CBC, blood bank\nLight Blue: Sodium citrate — coagulation studies (PT, aPTT); must fill to line\nGreen: Heparin — plasma chemistry (STAT metabolic panels)\nGray: Sodium fluoride/potassium oxalate — glucose, lactate; inhibits glycolysis\nRoyal Blue: Trace elements; toxicology\nYellow: SPS — blood cultures; ACD — blood bank' },
        { heading: 'Order of Draw', body: 'To prevent additive carryover between tubes:\n\n1. Blood cultures (Yellow/SPS)\n2. Coagulation tubes (Light Blue)\n3. Serum tubes (Red, Gold/SST)\n4. Heparin tubes (Green)\n5. EDTA tubes (Lavender/Purple)\n6. Glycolytic inhibitor (Gray)\n\nMnemonic: "Stop! Look! Red Trucks Go. Good Luck."\nOr: BC-BCT: Blood Cultures, Blue, Clot (Red/Gold), Heparin (Green), EDTA (Lavender), Glucose (Gray)' },
      ]
    },
    'venipuncture': {
      title: 'The Venipuncture Procedure',
      slides: [
        { heading: 'The Venipuncture Procedure', body: 'A systematic, step-by-step approach ensures patient safety, specimen integrity, and successful collection on the first attempt. Rushing or skipping steps causes errors that affect patient care.' },
        { heading: 'Pre-Collection Steps', body: '1. Review the requisition — verify patient, tests ordered, special requirements\n2. Gather all equipment before approaching the patient\n3. Wash hands / use hand sanitizer\n4. Identify the patient — two identifiers: name + DOB (or MRN)\n5. Explain the procedure — obtain verbal consent\n6. Ask about allergies (latex, antiseptics) and fasting status if required\n7. Put on gloves\n8. Position the patient — arm extended, supported, slightly downward' },
        { heading: 'Site Selection & Tourniquet', body: 'Apply tourniquet 3–4 inches above the intended venipuncture site.\n\n• Tourniquet should not remain on >1 minute (causes hemoconcentration and hemolysis)\n• Ask patient to close (not pump) their fist\n• Palpate the vein: feel for a soft, bouncy tube; trace its path\n• Select median cubital first\n• Clean site with alcohol in a circular outward motion; allow to dry completely (30–60 seconds)\n• Do NOT re-palpate after cleaning (contaminates site)' },
        { heading: 'Needle Insertion & Collection', body: '1. Anchor the vein — stretch skin taut below the site with non-dominant thumb\n2. Insert needle bevel up at 15–30° angle in direction of blood flow\n3. Advance smoothly until blood appears in the needle hub (flash)\n4. Push tube into holder until stopper meets needle; tube fills by vacuum\n5. Fill tubes in order of draw\n6. Gently invert each tube as removed (per additive requirement)\n7. Release tourniquet before removing needle (or when last tube begins to fill)' },
        { heading: 'Post-Collection Steps', body: '1. Remove last tube from holder\n2. Remove needle in one smooth motion; immediately activate safety device\n3. Apply gauze with pressure — do NOT bend the arm (causes hematoma)\n4. Discard needle immediately into sharps container\n5. Label tubes at bedside — patient name, DOB, date/time, collector ID, before leaving patient\n6. Check site — ensure bleeding has stopped; apply bandage\n7. Remove gloves; wash hands\n8. Transport specimens per protocol' },
      ]
    },
    'specimen-handling': {
      title: 'Specimen Handling & Processing',
      slides: [
        { heading: 'Specimen Handling & Processing', body: 'Collecting a perfect blood specimen means nothing if it is handled incorrectly afterward. Pre-analytical errors — most caused by improper handling — are the leading source of laboratory errors and account for up to 70% of all lab mistakes.' },
        { heading: 'Tube Inversion Requirements', body: 'Inversion mixes blood with the tube additive. Tubes must be inverted gently by complete 180° rotations (not shaken):\n\n• Blood culture bottles: 8–10 inversions\n• Coagulation (light blue): 3–4 inversions\n• Serum/SST (red/gold): 5 inversions\n• Heparin (green): 8–10 inversions\n• EDTA (lavender): 8–10 inversions\n• Fluoride/oxalate (gray): 8–10 inversions\n\nToo few inversions → clotting in anticoagulated tubes\nToo many or vigorous → hemolysis' },
        { heading: 'Transport Requirements', body: 'Temperature:\n• Most specimens: room temperature, transport within 30–60 min\n• Cold specimens: ammonia, lactic acid, ABGs — ice slurry\n• Warm specimens: cold agglutinins, cryoglobulins — body temperature (37°C)\n\nLight protection:\n• Bilirubin, beta-carotene, vitamin B12, folate — protect from light\n\nTime sensitivity:\n• Coagulation studies: centrifuge and test within 4 hours\n• Potassium: separate within 30–60 min (RBC lysis falsely elevates K+)\n• Blood cultures: incubate immediately' },
        { heading: 'Centrifugation', body: 'Serum and plasma specimens require centrifugation to separate cellular components from liquid.\n\nSerum (red/gold SST):\n• Allow to clot 30 minutes at room temperature\n• Centrifuge at specified RPM × 10 minutes\n• Serum = clear, amber liquid above the gel separator\n\nPlasma (heparin, EDTA):\n• Do NOT allow to clot\n• Centrifuge immediately after collection\n• Plasma = liquid above the cell layer (no gel separator in most tubes)\n\nHemolyzed specimens appear pink/red and may be rejected by the lab.' },
        { heading: 'Rejection Criteria', body: 'Specimens rejected by the lab — must be recollected:\n\n• Hemolysis — red/pink plasma (affects potassium, LDH, AST, etc.)\n• Clotted anticoagulated tube — fibrin strands visible\n• Incorrect tube — wrong additive for the test\n• Underfilled tube — especially light blue (incorrect citrate:blood ratio)\n• Mislabeled or unlabeled specimen\n• Expired tube\n• Wrong patient — ID error\n• Improper transport (wrong temperature, too long a delay)\n\nNever relabel or alter a specimen — recollect.' },
      ]
    },
    'special-collections': {
      title: 'Special Collection Procedures',
      slides: [
        { heading: 'Special Collection Procedures', body: 'Beyond routine venipuncture, phlebotomists perform a variety of specialized collections requiring additional training, technique, and attention to protocol.' },
        { heading: 'Capillary (Dermal) Puncture', body: 'Used when venipuncture is not practical:\n• Neonates and infants (small blood volume, small veins)\n• Adults with very poor venous access\n• Point-of-care testing (glucose, hemoglobin)\n\nSites:\n• Infants: lateral or medial plantar surface of the heel (NEVER posterior curve)\n• Adults/children: ring finger or middle finger, lateral aspect of the fingertip\n\nDevices: lancets (fixed depth, safety) — depth must not exceed 2 mm for heel sticks\n\nOrder of draw for capillary: EDTA first, then other additives, then serum' },
        { heading: 'Blood Cultures', body: 'Collected to detect bacteremia or septicemia.\n\n• Two sets from two separate sites (reduces contamination rate)\n• Inoculate anaerobic bottle first when using a butterfly\n• NEVER refrigerate blood culture bottles — transport immediately to lab for incubation\n• Strict aseptic technique:\n  - Clean site with chlorhexidine or alcohol + povidone-iodine\n  - Allow to dry completely\n  - Clean bottle tops with alcohol\n  - Never touch the cleaned site\n• Contamination rate should be <3%' },
        { heading: 'Arterial Blood Gas (ABG)', body: 'Arterial puncture to assess oxygenation, ventilation, and acid-base status.\n\nSites: radial artery (most common), brachial, femoral\n\nPre-procedure: Allen test to confirm collateral circulation before radial puncture\n\nProcedure: angle 45–60° for radial; blood is bright red and pulsatile\n\nPost-collection: apply firm pressure for 5 minutes (longer if anticoagulated)\n\nTransport: on ice slurry; analyze within 15–30 minutes\n\nNote: ABG collection is often beyond entry-level phlebotomy scope — know the basics for the exam.' },
        { heading: 'Glucose Tolerance Test (GTT)', body: 'Used to diagnose diabetes and gestational diabetes.\n\nProtocol:\n1. Fasting specimen (baseline glucose)\n2. Patient drinks glucose solution (75g or 100g depending on protocol)\n3. Timed collections at 1 hour, 2 hours, and sometimes 3 hours post-ingestion\n\nPhlebotomist responsibilities:\n• Verify fasting status (8–12 hours)\n• Document exact time of each draw\n• Patient must remain at rest — no eating, smoking, or strenuous activity during test\n• Label each tube with collection time\n• Notify lab of any collection timing deviations' },
        { heading: 'Therapeutic Drug Monitoring', body: 'Blood drawn to measure medication levels.\n\nPeak level: drawn at the time of maximum drug concentration (usually 30–60 min after IV dose, varies by drug)\n\nTrough level: drawn just before the next dose — at the drug\'s lowest concentration\n\nBoth timing and the exact draw time must be documented precisely on the label and requisition. Incorrect timing renders results uninterpretable.\n\nCommon drugs monitored: digoxin, vancomycin, gentamicin, phenytoin (Dilantin), lithium, cyclosporine, methotrexate' },
      ]
    },
    'exam-prep': {
      title: 'CPT Exam Strategy',
      slides: [
        { heading: 'The NHA CPT Exam', body: 'The Certified Phlebotomy Technician (CPT) exam is administered by the NHA.\n\nExam format: 100 scored questions + 20 pretest items\nTime limit: 2 hours\nPassing score: 390/500 (scaled)\n\nContent domains:\n• Safety and Compliance: ~17%\n• Patient Preparation: ~14%\n• Routine Blood Collection: ~38%\n• Special Collection: ~14%\n• Specimen Handling: ~17%' },
        { heading: 'High-Frequency Topics', body: '✓ Order of draw — must know cold\n✓ Tube colors and their additives/uses\n✓ Antecubital vein selection: median cubital (first) → cephalic → basilic (last)\n✓ Tourniquet time: ≤1 minute\n✓ Needle insertion angle: 15–30°\n✓ Inversion counts by tube type\n✓ Failure to fill light blue tube → reject\n✓ Heel stick: lateral/medial plantar surface ONLY; <2 mm depth\n✓ Blood culture: two sets, two sites, aseptic technique' },
        { heading: 'Common Exam Traps', body: '• Confusing serum (red/gold — clot forms) with plasma (lavender/green — anticoagulated)\n• Forgetting that EDTA is drawn FIRST in capillary collections (opposite of venipuncture order)\n• Mixing up needle gauge direction (higher gauge = smaller needle)\n• Thinking the tourniquet must be released before all blood is drawn (release before needle removal, or when last tube fills)\n• Forgetting that hemolysis falsely elevates potassium\n• Confusing peak vs. trough levels for drug monitoring' },
        { heading: 'Safety Rules to Memorize', body: '✓ Never recap needles two-handed (one-hand scoop only if necessary)\n✓ Discard sharps immediately into a puncture-resistant container\n✓ Gloves are required for every patient contact\n✓ Hand hygiene before and after every patient\n✓ Standard Precautions apply to ALL patients\n✓ Report needlestick injuries immediately\n✓ Never bend or break needles\n✓ Sharps container: ¾ full = replace (never overfill)\n✓ Biohazard bags for specimen transport' },
        { heading: 'Final Study Checklist', body: '□ Antecubital veins: median cubital → cephalic → basilic\n□ Order of draw (6 steps)\n□ Tube colors and additives (all 7+)\n□ Tube inversions by type\n□ Venipuncture procedure (15 steps)\n□ Needle angle: 15–30° bevel up\n□ Tourniquet: ≤1 minute; 3–4 inches above site\n□ Heel stick: lateral/medial only; <2 mm\n□ Blood cultures: 2 sets, 2 sites, chlorhexidine or iodine\n□ Capillary order of draw: EDTA first\n□ Hemolysis causes: vigorous mixing, too small a needle, prolonged tourniquet\n□ Rejection criteria: hemolysis, clot, underfill, mislabel' },
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

  const filename = `${Date.now()}-cpt-${key}.pptx`;
  const filepath = path.join(UPLOADS_DIR, filename);
  pptx.writeFile({ fileName: filepath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

// ─── QUIZ DATA ─────────────────────────────────────────────────────────────────
const quizzes = {
  q1: [
    { q: 'Which vein in the antecubital fossa is considered the FIRST choice for routine venipuncture?', options: ['Basilic vein', 'Cephalic vein', 'Median cubital vein', 'Brachial vein'], answer: 2, explanation: 'The median cubital vein is the preferred first-choice site for routine venipuncture because it is typically large, well-anchored, and least painful. The cephalic vein is the second choice; the basilic vein is used last due to proximity to the brachial artery and median nerve.' },
    { q: 'Blood plasma makes up approximately what percentage of whole blood?', options: ['25%', '45%', '55%', '75%'], answer: 2, explanation: 'Plasma constitutes approximately 55% of whole blood volume. The remaining 45% is formed elements (red blood cells, white blood cells, and platelets). This ratio is called the hematocrit when referring specifically to red blood cells.' },
    { q: 'Why are veins preferred over arteries for routine blood collection?', options: ['Veins contain more oxygen than arteries', 'Veins are more superficial, have thinner walls, and blood flows at lower pressure', 'Veins have stronger walls and are easier to puncture', 'Arterial blood is not needed for most laboratory tests'], answer: 1, explanation: 'Veins are preferred because they are more accessible (closer to the skin surface), have thinner, more pliable walls, contain blood at lower pressure, and are less painful to access than arteries.' },
    { q: 'The basilic vein is considered the highest-risk antecubital site because it:', options: ['Is too small for most needles', 'Is located near the brachial artery and median nerve', 'Collapses easily under tourniquet pressure', 'Contains valves that prevent blood draw'], answer: 1, explanation: 'The basilic vein runs close to the brachial artery and the median nerve on the medial aspect of the antecubital fossa. Inadvertent arterial puncture or nerve injury during basilic vein attempts can cause serious complications.' },
    { q: 'Which formed element of blood is primarily responsible for oxygen transport?', options: ['Leukocytes (WBCs)', 'Thrombocytes (platelets)', 'Plasma proteins', 'Erythrocytes (RBCs)'], answer: 3, explanation: 'Erythrocytes (red blood cells) contain hemoglobin, an iron-containing protein that binds oxygen in the lungs and releases it to tissues throughout the body. RBCs make up the majority of blood\'s formed elements.' },
  ],
  q2: [
    { q: 'What is the correct order of draw for venipuncture using evacuated tubes?', options: ['EDTA → Heparin → SST → Light Blue → Blood Cultures', 'Blood Cultures → Light Blue → Red/Gold SST → Green → Lavender → Gray', 'Light Blue → Blood Cultures → Green → Lavender → Gray → Red', 'Red → Lavender → Green → Light Blue → Gray → Blood Cultures'], answer: 1, explanation: 'The correct order of draw is: Blood Cultures → Light Blue (coagulation) → Red/Gold SST (serum) → Green (heparin) → Lavender/Purple (EDTA) → Gray (fluoride). This sequence prevents additive carryover between tubes.' },
    { q: 'A light blue top tube is used for coagulation studies. If this tube is not filled to the required level, the result will be:', options: ['Elevated clotting times due to excess citrate relative to blood', 'Unaffected — fill volume does not matter for coagulation tubes', 'Artificially shortened clotting times', 'The same as a fully filled tube'], answer: 0, explanation: 'The light blue tube contains sodium citrate in a precise 9:1 blood-to-citrate ratio. Underfilling the tube results in excess citrate relative to the blood volume, which falsely prolongs clotting times. The tube must be filled to the line.' },
    { q: 'The lavender (purple) top tube contains which additive?', options: ['Sodium citrate', 'Sodium fluoride', 'EDTA (ethylenediaminetetraacetic acid)', 'Lithium heparin'], answer: 2, explanation: 'The lavender (purple) top tube contains EDTA (ethylenediaminetetraacetic acid), a chelating agent that binds calcium to prevent clotting. It is used for CBC, blood bank, and hemoglobin A1c tests. The specimen yields whole blood or EDTA plasma.' },
    { q: 'A gray top tube is used for glucose and lactate testing. Its additive that prevents glycolysis is:', options: ['EDTA', 'Sodium heparin', 'Sodium fluoride', 'Thrombin'], answer: 2, explanation: 'Gray top tubes contain sodium fluoride (a glycolytic inhibitor) and potassium oxalate (an anticoagulant). Sodium fluoride preserves glucose by inhibiting glycolysis, preventing RBCs from consuming glucose during transport and storage.' },
    { q: 'Which needle gauge is standard for routine adult venipuncture?', options: ['18 gauge', '21 gauge', '25 gauge', '27 gauge'], answer: 1, explanation: 'A 21-gauge needle is the standard for routine adult venipuncture. It provides adequate blood flow for most tests without causing excessive trauma to the vein. Higher gauges (smaller needles) are used for small or fragile veins, while lower gauges are used for high-volume collections or blood donation.' },
  ],
  q3: [
    { q: 'How long should a tourniquet remain applied during venipuncture?', options: ['Up to 30 seconds', 'No longer than 1 minute', 'Up to 3 minutes', 'Until all tubes are collected'], answer: 1, explanation: 'A tourniquet should not remain in place for more than 1 minute. Prolonged tourniquet application causes hemoconcentration (fluid shifts out of vessels), falsely elevating results for proteins, enzymes, and cell counts, and may cause hemolysis.' },
    { q: 'Before inserting the needle, the venipuncture site should be cleaned with alcohol and then:', options: ['Immediately accessed while still wet for antiseptic effect', 'Allowed to dry completely (30–60 seconds) before puncture', 'Wiped dry immediately with sterile gauze', 'Re-palpated with a clean finger to confirm vein location'], answer: 1, explanation: 'The alcohol must be allowed to dry completely (30–60 seconds) before puncture. Wet alcohol on the skin is painful, dilutes the specimen, and may cause hemolysis. Once cleaned and dried, the site should NOT be re-palpated.' },
    { q: 'At what angle should the phlebotomy needle be inserted for routine antecubital venipuncture?', options: ['5–10 degrees', '15–30 degrees', '45–60 degrees', '90 degrees'], answer: 1, explanation: 'The needle should be inserted bevel-up at a 15–30 degree angle to the skin surface. Too shallow an angle risks missing the vein; too steep risks going through the vein (through-and-through puncture).' },
    { q: 'After the last tube is filled and removed, the phlebotomist should:', options: ['Apply pressure to the site before removing the needle', 'Remove the needle first, then immediately apply pressure', 'Release the tourniquet and remove the needle simultaneously', 'Cap the needle and place it on the tray before applying pressure'], answer: 1, explanation: 'After removing the last tube, release the tourniquet (if not already done), then remove the needle in one smooth motion while immediately applying pressure with gauze. This sequence prevents hematoma formation and minimizes patient discomfort.' },
    { q: 'Specimen tubes should be labeled:', options: ['Before the blood draw so they are ready to fill', 'In the laboratory upon receipt', 'At the patient\'s bedside immediately after collection, before leaving the patient', 'By the nurse after the phlebotomist departs'], answer: 2, explanation: 'Tubes must be labeled at the patient\'s bedside immediately after collection — before leaving the patient\'s presence. Pre-labeling risks mislabeling if the draw is unsuccessful or the patient is unavailable. Post-labeling increases error risk and is a serious patient safety violation.' },
  ],
  q4: [
    { q: 'Which of the following is the most common cause of pre-analytical laboratory errors?', options: ['Incorrect reagents in the analyzer', 'Improper specimen collection, handling, and transport', 'Calibration errors in laboratory instruments', 'Incorrect reference ranges being used'], answer: 1, explanation: 'Pre-analytical errors (those occurring before the specimen reaches the analyzer) account for up to 70% of all laboratory errors. Common pre-analytical errors include hemolysis, incorrect tube use, improper handling, mislabeling, and transportation errors.' },
    { q: 'A potassium result comes back critically elevated. The phlebotomist notes the specimen appears pink/red. This most likely indicates:', options: ['The patient truly has dangerously high potassium', 'Hemolysis — RBCs lysed, releasing intracellular potassium into the serum', 'Lipemia from a non-fasting patient', 'Contamination with IV fluid'], answer: 1, explanation: 'Hemolysis causes red blood cells to lyse and release their intracellular contents — including potassium — into the serum or plasma. This produces a falsely elevated potassium result. Pink/red plasma is the visual clue. The specimen must be recollected.' },
    { q: 'A serum separator tube (gold/red SST) requires which pre-centrifugation step?', options: ['Immediate centrifugation without any wait time', 'Incubation at 37°C for 60 minutes', 'Allowing the specimen to clot at room temperature for 30 minutes', 'Placing the specimen on ice immediately'], answer: 2, explanation: 'SST tubes contain a clot activator (silica particles) and a gel separator. The blood must be allowed to clot at room temperature for 30 minutes before centrifugation. Premature centrifugation results in fibrin strands in the serum, which can clog analyzers and affect results.' },
    { q: 'Bilirubin specimens must be:', options: ['Kept warm at body temperature during transport', 'Protected from light to prevent photodegradation', 'Centrifuged immediately without allowing any delay', 'Transported on ice to prevent breakdown'], answer: 1, explanation: 'Bilirubin is photosensitive and degrades rapidly when exposed to light. Bilirubin specimens must be wrapped in foil or placed in amber tubes/bags immediately after collection and transported to the lab quickly to prevent falsely low results.' },
    { q: 'If a light blue (sodium citrate) tube is the only tube ordered and is drawn first, what must the phlebotomist do?', options: ['Proceed normally — order of draw only applies when multiple tubes are collected', 'Draw a discard tube (plain red or another light blue tube) first to clear the needle dead space', 'Add EDTA to the tube after collection to prevent clotting', 'Reject the order and contact the physician'], answer: 1, explanation: 'When a coagulation tube (light blue) is the first or only tube collected, a discard tube should be drawn first to clear the needle dead space (which may contain tissue thromboplastin from the puncture), preventing artificial activation of the coagulation cascade in the specimen.' },
  ],
  q5: [
    { q: 'For a heel stick on a newborn, the correct puncture site is:', options: ['The posterior curve of the heel', 'The central plantar surface (arch)', 'The lateral or medial plantar surface of the heel', 'The big toe'], answer: 2, explanation: 'Newborn heel sticks must be performed on the lateral or medial plantar surface of the heel — never the posterior curve, where the distance between skin and bone is too small and the calcaneus (heel bone) could be struck, causing osteomyelitis.' },
    { q: 'When collecting blood cultures, to minimize contamination, the correct antiseptic approach is:', options: ['Alcohol alone for 30 seconds', 'Chlorhexidine gluconate or a two-step iodine/alcohol method, allowed to dry completely', 'Povidone-iodine applied and immediately wiped off', 'No antiseptic — the blood culture medium handles contamination'], answer: 1, explanation: 'Blood cultures require the most rigorous skin antisepsis. Chlorhexidine gluconate (preferred for adults) or a two-step method (povidone-iodine + alcohol) must be used and allowed to dry completely. The contamination rate benchmark is less than 3%.' },
    { q: 'In capillary (dermal) puncture, the order of fill for collection tubes is:', options: ['Same as venipuncture order of draw', 'EDTA (lavender) first, then other additive tubes, then serum', 'Serum first, then EDTA', 'Gray tube first, then all others'], answer: 1, explanation: 'Capillary order of draw differs from venipuncture. EDTA tubes are collected first in capillary specimens because platelets clump quickly at the puncture site, and EDTA helps preserve the cellular components needed for CBC. Serum/clot tubes are collected last.' },
    { q: 'A trough level for vancomycin should be drawn:', options: ['30–60 minutes after the infusion is complete', 'Just before the next scheduled dose', 'At any time during the dosing interval', '2 hours after the dose is administered'], answer: 1, explanation: 'A trough level is drawn just before the next scheduled dose, when the drug concentration is at its lowest point. This level is used to assess whether the drug concentration remains above the minimum effective level throughout the dosing interval.' },
    { q: 'During a glucose tolerance test, the patient should be instructed to:', options: ['Walk around to stimulate glucose metabolism', 'Eat a light snack between draws to prevent hypoglycemia', 'Remain seated or reclining; no eating, smoking, or strenuous activity during the test', 'Drink water freely to stay hydrated between draws'], answer: 2, explanation: 'During a GTT, the patient must remain at rest — no eating, drinking (except water), smoking, chewing gum, or strenuous physical activity. Any of these can alter glucose metabolism and invalidate the test results.' },
  ],
  final: [
    { q: 'The correct order of draw for evacuated tubes is:', options: ['Lavender → Green → Light Blue → Red → Gray', 'Blood Cultures → Light Blue → Red/Gold → Green → Lavender → Gray', 'Red → Blue → Green → Lavender → Gray → Blood Cultures', 'Green → Red → Light Blue → Lavender → Blood Cultures → Gray'], answer: 1, explanation: 'The standard order of draw is: Blood Cultures → Light Blue (coagulation) → Red/Gold SST (serum) → Green (heparin) → Lavender (EDTA) → Gray (fluoride). This prevents additive carryover that could interfere with test results.' },
    { q: 'Which antecubital vein is LEAST preferred for routine venipuncture?', options: ['Median cubital vein', 'Cephalic vein', 'Basilic vein', 'Accessory cephalic vein'], answer: 2, explanation: 'The basilic vein is the least preferred antecubital vein because it lies close to the brachial artery and median nerve, increasing the risk of serious complications from inadvertent arterial puncture or nerve injury.' },
    { q: 'A lavender top tube contains EDTA. EDTA prevents clotting by:', options: ['Inhibiting glycolysis to preserve glucose', 'Chelating (binding) calcium, which is essential for the clotting cascade', 'Coating red blood cells to prevent agglutination', 'Activating the clot retraction process'], answer: 1, explanation: 'EDTA is a chelating agent that binds free calcium ions in the blood. Calcium is an essential cofactor for multiple steps in the coagulation cascade, so its removal effectively prevents clot formation, preserving blood in its liquid, anticoagulated state.' },
    { q: 'Hemolysis in a blood specimen can be caused by all of the following EXCEPT:', options: ['Drawing through a hematoma', 'Using too small a needle (high gauge) with forceful suction', 'Gently inverting the tube the correct number of times', 'Prolonged tourniquet application causing hemoconcentration and fragility'], answer: 2, explanation: 'Gentle inversion is the correct technique and does NOT cause hemolysis. Hemolysis is caused by trauma to red blood cells: using too small a gauge with force, drawing through a hematoma, prolonged tourniquet, vigorous shaking, or using an expired tube.' },
    { q: 'Patient identification before phlebotomy requires:', options: ['Asking the patient "Are you John Smith?"', 'Checking only the room number and bed assignment', 'Using two unique identifiers: full name plus date of birth or medical record number', 'Visual recognition if the patient is a frequent visitor'], answer: 2, explanation: 'Two patient identifiers — full name plus date of birth or medical record number — must be used for every patient identification. Never ask a yes/no question like "Are you John Smith?" — confused or disoriented patients may say yes regardless.' },
    { q: 'The maximum recommended tourniquet application time before venipuncture is:', options: ['30 seconds', '1 minute', '2 minutes', '3 minutes'], answer: 1, explanation: 'Tourniquet application should not exceed 1 minute. Prolonged application causes hemoconcentration (proteins, cells, and some analytes become falsely elevated as fluid shifts out of vessels into surrounding tissue) and may cause hemolysis.' },
    { q: 'A discard tube is required when collecting which tube type as the first or only draw?', options: ['Red (plain serum)', 'Lavender (EDTA)', 'Light blue (sodium citrate)', 'Green (heparin)'], answer: 2, explanation: 'A discard tube (plain red or extra light blue) must precede a coagulation (light blue) tube when it is the first tube collected. The discard removes tissue thromboplastin from the needle dead space, which would otherwise activate clotting and falsely alter PT/aPTT results.' },
    { q: 'For a heel stick on a neonate, the puncture depth should not exceed:', options: ['1 mm', '2 mm', '4 mm', '6 mm'], answer: 1, explanation: 'Neonatal heel stick depth must not exceed 2 mm. In newborns, the distance between the plantar skin surface and the calcaneus (heel bone) is very small — puncturing too deeply risks hitting the bone, potentially causing calcaneous osteomyelitis.' },
    { q: 'Which specimen requires transport on ice slurry?', options: ['CBC (complete blood count)', 'Arterial blood gas (ABG)', 'Lipid panel', 'Thyroid stimulating hormone (TSH)'], answer: 1, explanation: 'Arterial blood gas specimens must be transported on ice slurry and analyzed within 15–30 minutes to prevent continued cellular metabolism from altering pH, pO2, and pCO2 values. ABG results are critically time- and temperature-sensitive.' },
    { q: 'The gold-top SST tube must be allowed to sit at room temperature before centrifugation to:', options: ['Allow the anticoagulant to activate', 'Allow complete clot formation (approximately 30 minutes)', 'Bring the specimen to body temperature for accurate results', 'Allow the EDTA to chelate calcium'], answer: 1, explanation: 'The SST (Serum Separator Tube) contains a clot activator. Blood must be allowed to clot completely at room temperature for approximately 30 minutes before centrifugation. Premature spinning produces fibrin strands in the serum, causing analyzer issues and inaccurate results.' },
    { q: 'Blood culture collections require two sets from two separate venipuncture sites. The primary reason for two sets is to:', options: ['Ensure enough volume for both aerobic and anaerobic testing', 'Reduce the false-positive contamination rate and improve sensitivity for true bacteremia', 'Allow comparison between left and right arm specimens', 'Comply with insurance billing requirements for blood cultures'], answer: 1, explanation: 'Two blood culture sets from two separate sites improve sensitivity for detecting true bacteremia (finding the organism if it\'s present) while also reducing false positives from skin contaminants. A single contaminant organism appearing in only one set is more likely a contaminant; in both sets, it is more likely a true pathogen.' },
    { q: 'In capillary collection, the order of draw differs from venipuncture. In capillary collection, which tube is collected FIRST?', options: ['Serum (red)', 'Sodium citrate (light blue)', 'EDTA (lavender)', 'Sodium fluoride (gray)'], answer: 2, explanation: 'In capillary (dermal) puncture, EDTA tubes are collected first because platelets rapidly accumulate at the puncture site and can cause clumping, affecting cell counts. Collecting EDTA first ensures an accurate CBC specimen before platelet clumping worsens.' },
    { q: 'A specimen rejected for "lipemia" will appear:', options: ['Pink or red (hemolyzed)', 'Yellow and turbid/milky white', 'Clear and colorless', 'Dark brown'], answer: 1, explanation: 'Lipemia refers to an abnormally high concentration of lipids (triglycerides) in the blood, producing a milky white or turbid appearance in the plasma or serum. It interferes with many photometric assays and is most common in non-fasting patients.' },
    { q: 'Standard Precautions require gloves during phlebotomy:', options: ['Only when the patient is known to have a bloodborne infection', 'Only when drawing from a difficult vein', 'For every patient, for every blood collection', 'Only in the hospital setting, not outpatient clinics'], answer: 2, explanation: 'Standard Precautions treat all patients as potentially infectious regardless of known diagnosis. Gloves must be worn for every patient during every blood collection. The phlebotomist should also change gloves between patients and perform hand hygiene.' },
    { q: 'A trough drug level is drawn to measure:', options: ['The peak concentration of a drug immediately after administration', 'The drug concentration at its lowest point, just before the next dose', 'The drug concentration 2 hours post-dose', 'The total drug concentration over the dosing interval'], answer: 1, explanation: 'A trough level measures the lowest concentration of a drug in the body, drawn just before the next scheduled dose. Trough levels ensure the drug concentration remains above the minimum effective level and below toxic levels throughout the dosing interval.' },
    { q: 'Which antiseptic is used for routine venipuncture site preparation?', options: ['Povidone-iodine (Betadine)', 'Chlorhexidine gluconate only', '70% isopropyl alcohol', 'Hydrogen peroxide'], answer: 2, explanation: '70% isopropyl alcohol is the standard antiseptic for routine venipuncture. Chlorhexidine or iodine-based antiseptics are reserved for blood cultures and arterial punctures, where a higher level of antisepsis is required.' },
    { q: 'A phlebotomist accidentally sustains a needlestick injury. The correct immediate response is to:', options: ['Report it to the supervisor at the end of the shift', 'Squeeze the wound to express blood, wash with soap and water, and report immediately per facility policy', 'Apply a bandage and continue working', 'Document the incident in the patient\'s medical record'], answer: 1, explanation: 'After a needlestick: immediately wash the wound with soap and water (do not squeeze — this does not reduce transmission risk; it may increase it), then report to the supervisor and employee health immediately per facility protocol. Source patient testing and post-exposure prophylaxis decisions must be made promptly.' },
    { q: 'What does hemoconcentration during phlebotomy mean, and what causes it?', options: ['Blood becomes too dilute from IV fluids; caused by drawing from an IV line', 'Blood analytes become falsely concentrated; caused by prolonged tourniquet application or patient pumping fist vigorously', 'Red blood cells burst, releasing intracellular contents; caused by a small gauge needle', 'Plasma proteins precipitate out of solution; caused by cold specimens'], answer: 1, explanation: 'Hemoconcentration occurs when a tourniquet is left on too long or the patient pumps their fist repeatedly, causing fluid to shift out of vessels into surrounding tissue. This concentrates blood components — proteins, RBCs, enzymes — falsely elevating their measured values.' },
    { q: 'Which of the following actions is NEVER acceptable when handling a contaminated needle?', options: ['Activating the built-in safety device immediately after withdrawal', 'Discarding the needle-holder assembly directly into a sharps container', 'Recapping the needle with two hands before disposal', 'Using a one-handed scoop technique if recapping is absolutely necessary'], answer: 2, explanation: 'Two-handed recapping of contaminated needles is NEVER acceptable — it is the leading cause of preventable needlestick injuries. OSHA requires immediate disposal into a puncture-resistant sharps container. The only permissible recapping technique is the one-handed scoop method, and only when necessary.' },
    { q: 'The phlebotomist notes a patient\'s arm has a bruise (hematoma) over the median cubital vein from a previous draw. The correct action is to:', options: ['Draw through the hematoma — the vein is already accessed', 'Select an alternative site away from the hematoma', 'Apply extra tourniquet pressure to stabilize the bruised area', 'Warm compress the hematoma for 2 minutes then draw from the center'], answer: 1, explanation: 'Drawing through a hematoma is contraindicated. Puncturing through bruised, damaged tissue causes patient pain, risks hemolysis of the collected specimen, and can introduce tissue fluid that dilutes and alters analytes. Always select an alternative site.' },
  ],
};

// ─── LESSON DATA ──────────────────────────────────────────────────────────────
const lessons = [

// ═══════════════════════════════════════════════════════════════
// SECTION 1: INTRODUCTION & CIRCULATORY SYSTEM
// ═══════════════════════════════════════════════════════════════
{
  section: 'INTRODUCTION TO PHLEBOTOMY', sort: 1, type: 'text',
  title: 'Welcome to Phlebotomy Technician',
  content: `<h2>Welcome to Phlebotomy Technician</h2>
<p>Phlebotomy — the practice of drawing blood for laboratory testing — is one of the most frequently performed clinical procedures in healthcare. Every day, billions of laboratory tests are processed worldwide, and nearly all begin with a blood draw performed by a phlebotomy technician. Your skill, precision, and professionalism directly affect patient diagnosis, treatment decisions, and outcomes.</p>
<h3>What Phlebotomy Technicians Do</h3>
<ul>
  <li>Perform venipuncture (from veins) and capillary (fingerstick/heelstick) blood collections</li>
  <li>Select appropriate equipment, tubes, and collection sites</li>
  <li>Handle, process, and transport specimens to the laboratory</li>
  <li>Perform point-of-care testing (glucose meters, hemoglobin analyzers)</li>
  <li>Collect blood cultures and assist with special procedures</li>
  <li>Maintain infection control and patient safety standards</li>
  <li>Communicate clearly with patients, nurses, and laboratory staff</li>
</ul>
<h3>Where Phlebotomists Work</h3>
<p>Hospitals (inpatient and outpatient), reference laboratories, physician offices, blood donation centers, long-term care facilities, home health agencies, and mobile collection services.</p>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>📊 Career Outlook:</strong> Phlebotomy technician positions are projected to grow <strong>10% through 2031</strong> (BLS). Median pay: <strong>$38,530/year</strong> nationally. With experience and additional certifications (medical assistant, clinical lab technician), earnings rise significantly.
</div>
<h3>Your Certification: CPT</h3>
<p>The <strong>Certified Phlebotomy Technician (CPT)</strong> credential is issued by the National Healthcareer Association (NHA). It is one of the most recognized phlebotomy certifications in the United States and is required or preferred by employers in most states.</p>
<h3>Course Structure</h3>
<ol>
  <li>Introduction to Phlebotomy and the Circulatory System</li>
  <li>Phlebotomy Equipment and Tubes</li>
  <li>The Venipuncture Procedure</li>
  <li>Specimen Handling and Processing</li>
  <li>Special Collection Procedures</li>
  <li>CPT Exam Preparation and Final Assessment</li>
</ol>`
},
{
  section: 'INTRODUCTION TO PHLEBOTOMY', sort: 2, type: 'presentation',
  title: 'The Circulatory System & Blood',
  pptxKey: 'circulatory-system',
},
{
  section: 'INTRODUCTION TO PHLEBOTOMY', sort: 3, type: 'text',
  title: 'Blood Composition and Functions',
  content: `<h2>Blood Composition and Functions</h2>
<p>Blood is the body's primary transport medium. A thorough understanding of blood's components and their functions is essential for understanding why different tests require different tubes, and how pre-analytical errors affect laboratory results.</p>

<h3>Whole Blood Components</h3>
<p>When a tube of blood is centrifuged, it separates into distinct layers:</p>
<ul>
  <li><strong>Plasma (55%):</strong> The liquid component — water (90%), proteins, clotting factors, hormones, electrolytes, waste products, and nutrients. Plasma is obtained from anticoagulated blood. <em>Serum</em> is plasma with the clotting factors removed (after a clot has formed).</li>
  <li><strong>Buffy coat (&lt;1%):</strong> A thin white layer between plasma and RBCs containing white blood cells and platelets.</li>
  <li><strong>Erythrocytes (45%):</strong> Red blood cells — the packed red layer at the bottom.</li>
</ul>

<h3>Formed Elements</h3>

<h4>Erythrocytes (Red Blood Cells — RBCs)</h4>
<ul>
  <li>Most abundant formed element: 4.5–5.5 million/µL</li>
  <li>Biconcave disc shape — maximizes surface area for gas exchange</li>
  <li>Contain hemoglobin — binds O₂ in the lungs, releases it in the tissues</li>
  <li>No nucleus in mature RBCs (allows more room for hemoglobin)</li>
  <li>Lifespan: ~120 days; produced in red bone marrow</li>
</ul>

<h4>Leukocytes (White Blood Cells — WBCs)</h4>
<ul>
  <li>Normal count: 4,500–11,000/µL</li>
  <li>Five types: neutrophils, lymphocytes, monocytes, eosinophils, basophils</li>
  <li>Primary role: immune defense against infection and foreign substances</li>
  <li>Elevated WBC (leukocytosis) = infection, inflammation, leukemia</li>
</ul>

<h4>Thrombocytes (Platelets)</h4>
<ul>
  <li>Normal count: 150,000–400,000/µL</li>
  <li>Fragments of megakaryocytes (large bone marrow cells)</li>
  <li>Role: primary hemostasis — clump together at sites of vascular injury to form a platelet plug</li>
  <li>Work with clotting factors (plasma proteins) to form a stable fibrin clot</li>
</ul>

<h3>Serum vs. Plasma</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:10px;">Characteristic</th><th style="padding:10px;">Serum</th><th style="padding:10px;">Plasma</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;">How obtained</td><td style="padding:10px;border:1px solid #e2e8f0;">After clot formation, centrifuge</td><td style="padding:10px;border:1px solid #e2e8f0;">Anticoagulated blood, centrifuge</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;">Contains clotting factors?</td><td style="padding:10px;border:1px solid #e2e8f0;">No — consumed in clot</td><td style="padding:10px;border:1px solid #e2e8f0;">Yes</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;">Tube type</td><td style="padding:10px;border:1px solid #e2e8f0;">Red, Gold (SST)</td><td style="padding:10px;border:1px solid #e2e8f0;">Lavender, Green, Light Blue, Gray</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;">Common uses</td><td style="padding:10px;border:1px solid #e2e8f0;">Chemistry, serology, immunology</td><td style="padding:10px;border:1px solid #e2e8f0;">CBC, coagulation, STAT chemistry</td></tr>
</table>`
},
{
  section: 'INTRODUCTION TO PHLEBOTOMY', sort: 4, type: 'text',
  title: 'Vascular Anatomy and Site Selection',
  content: `<h2>Vascular Anatomy and Site Selection</h2>
<p>Selecting the right venipuncture site is one of the most important decisions a phlebotomist makes on every draw. Poor site selection leads to failed attempts, hematomas, patient discomfort, and hemolyzed specimens.</p>

<h3>Veins vs. Arteries vs. Capillaries</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Feature</th><th style="padding:8px;">Arteries</th><th style="padding:8px;">Veins</th><th style="padding:8px;">Capillaries</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Direction of flow</td><td style="padding:8px;border:1px solid #e2e8f0;">Away from heart</td><td style="padding:8px;border:1px solid #e2e8f0;">Toward heart</td><td style="padding:8px;border:1px solid #e2e8f0;">Exchange sites</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">Wall thickness</td><td style="padding:8px;border:1px solid #e2e8f0;">Thick, muscular</td><td style="padding:8px;border:1px solid #e2e8f0;">Thin, pliable</td><td style="padding:8px;border:1px solid #e2e8f0;">One cell layer</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Pressure</td><td style="padding:8px;border:1px solid #e2e8f0;">High, pulsatile</td><td style="padding:8px;border:1px solid #e2e8f0;">Low</td><td style="padding:8px;border:1px solid #e2e8f0;">Very low</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">Valves</td><td style="padding:8px;border:1px solid #e2e8f0;">No</td><td style="padding:8px;border:1px solid #e2e8f0;">Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">No</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Routine phlebotomy</td><td style="padding:8px;border:1px solid #e2e8f0;">No (ABG only)</td><td style="padding:8px;border:1px solid #e2e8f0;">Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">Dermal puncture</td></tr>
</table>

<h3>Primary Venipuncture Sites — Antecubital Fossa</h3>
<p>The antecubital fossa (the bend of the elbow) is the first-choice area for venipuncture in most patients. Three main veins run through this area:</p>

<h4>1. Median Cubital Vein (First Choice)</h4>
<ul>
  <li>Connects the cephalic and basilic veins across the front of the elbow</li>
  <li>Large, well-anchored, and relatively fixed — does not roll</li>
  <li>Typically less painful due to fewer nearby nerve endings</li>
  <li>Easiest target for most patients</li>
</ul>

<h4>2. Cephalic Vein (Second Choice)</h4>
<ul>
  <li>Runs along the lateral (thumb) side of the forearm and antecubital area</li>
  <li>May be harder to palpate in some patients; tends to roll</li>
  <li>Good alternative when median cubital is unavailable</li>
</ul>

<h4>3. Basilic Vein (Third Choice — Use with Caution)</h4>
<ul>
  <li>Runs along the medial (pinky) side of the arm</li>
  <li>Lies close to the <strong>brachial artery</strong> and <strong>median nerve</strong></li>
  <li>Higher risk of complications — use only when other sites are unavailable</li>
  <li>Tends to roll during puncture</li>
</ul>

<h3>Alternative Sites</h3>
<ul>
  <li><strong>Forearm veins:</strong> Cephalic and basilic in the mid-forearm — smaller but accessible</li>
  <li><strong>Hand veins:</strong> Acceptable alternative; more painful; use butterfly needle; avoid if patient needs frequent draws</li>
  <li><strong>Ankle/foot veins:</strong> Requires physician order in most facilities; risk of thrombosis; avoid in diabetics</li>
  <li><strong>Never draw from:</strong> Same arm as IV infusion (dilutes specimen), mastectomy side (lymphedema risk), arm with arteriovenous (AV) fistula (reserved for dialysis), or from a hematoma</li>
</ul>`
},
{ section: 'INTRODUCTION TO PHLEBOTOMY', sort: 5, type: 'quiz', title: 'Quiz 1: Circulatory System & Anatomy', quizKey: 'q1' },

// ═══════════════════════════════════════════════════════════════
// SECTION 2: EQUIPMENT AND TUBES
// ═══════════════════════════════════════════════════════════════
{
  section: 'PHLEBOTOMY EQUIPMENT AND TUBES', sort: 6, type: 'text',
  title: 'Phlebotomy Equipment Overview',
  content: `<h2>Phlebotomy Equipment Overview</h2>
<p>Knowing your equipment thoroughly is essential before approaching any patient. Fumbling with equipment in front of a patient creates anxiety and increases the risk of errors. Assemble everything before you enter the room.</p>

<h3>Needles</h3>
<p>Phlebotomy needles are hollow, beveled, and single-use. Key specifications:</p>
<ul>
  <li><strong>Gauge:</strong> The needle's inner diameter. Higher gauge = smaller diameter. Common gauges:
    <ul>
      <li>21G — standard for routine adult venipuncture</li>
      <li>22G — acceptable for most adults; slightly slower flow</li>
      <li>23G — butterfly sets; small veins; elderly; pediatrics</li>
      <li>25G — very small veins; fingerstick lancets for capillary puncture</li>
    </ul>
  </li>
  <li><strong>Length:</strong> 1 inch standard; ¾ inch for butterfly/winged sets</li>
  <li><strong>Bevel:</strong> The slanted tip; always insert bevel-up to minimize trauma and maximize blood flow</li>
  <li><strong>Safety devices:</strong> All needles must have an integrated safety mechanism (OSHA Needlestick Safety Act, 2000)</li>
</ul>

<h3>Evacuated Tube System (ETS)</h3>
<p>The most common collection system for routine venipuncture:</p>
<ul>
  <li><strong>Double-ended needle:</strong> Patient end (sterile, long) + tube end (shorter, covered by rubber sleeve that reseals between tubes)</li>
  <li><strong>Holder/adapter:</strong> Plastic barrel that holds the needle and tube; disposable after each patient (do not reuse holders)</li>
  <li><strong>Evacuated tubes:</strong> Pre-vacuum glass or plastic tubes with color-coded stoppers indicating the additive</li>
</ul>

<h3>Winged Infusion Set (Butterfly)</h3>
<ul>
  <li>Short needle with flexible "wings" for gripping, attached to tubing and a luer adapter</li>
  <li>Used for small or difficult veins — hand veins, scalp veins in infants, elderly patients</li>
  <li>Requires a discard tube when used with coagulation studies (the tubing dead space fills with air before blood, which must be purged)</li>
  <li>Higher cost than straight needle; use when clinical need justifies it</li>
</ul>

<h3>Syringes</h3>
<ul>
  <li>Used for very fragile veins that would collapse under the vacuum of an evacuated tube</li>
  <li>Blood drawn manually into the syringe, then transferred to tubes using a transfer device (never push through the stopper — risk of hemolysis and needlestick)</li>
  <li>Transfer immediately after collection — blood begins to clot within minutes</li>
  <li>Follow order of draw when filling tubes from a syringe</li>
</ul>

<h3>Personal Protective Equipment (PPE)</h3>
<ul>
  <li><strong>Gloves:</strong> Required for every patient contact during phlebotomy — change between patients</li>
  <li><strong>Gown:</strong> Required if splashing is anticipated</li>
  <li><strong>Eye protection / face shield:</strong> Required when splash risk exists</li>
  <li><strong>Mask:</strong> Required per facility policy or when patient is on droplet/airborne precautions</li>
</ul>`
},
{
  section: 'PHLEBOTOMY EQUIPMENT AND TUBES', sort: 7, type: 'presentation',
  title: 'Phlebotomy Equipment & Tubes',
  pptxKey: 'equipment',
},
{
  section: 'PHLEBOTOMY EQUIPMENT AND TUBES', sort: 8, type: 'text',
  title: 'Blood Collection Tubes and Additives',
  content: `<h2>Blood Collection Tubes and Additives</h2>
<p>Each tube color indicates a specific additive that determines which laboratory tests can be performed on that specimen. Memorizing tube colors, additives, and their uses is one of the most important skills for the CPT exam and for daily practice.</p>

<h3>Complete Tube Reference</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Color</th><th style="padding:8px;text-align:left;">Additive</th><th style="padding:8px;text-align:left;">Specimen Type</th><th style="padding:8px;text-align:left;">Common Tests</th><th style="padding:8px;text-align:center;">Inversions</th></tr>
  <tr style="background:#fef2f2;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;text-align:center;">🔴 Red</td><td style="padding:8px;border:1px solid #e2e8f0;">None (plain)</td><td style="padding:8px;border:1px solid #e2e8f0;">Serum</td><td style="padding:8px;border:1px solid #e2e8f0;">Chemistry, serology, blood bank</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">0–5</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;text-align:center;">🟡 Gold/SST</td><td style="padding:8px;border:1px solid #e2e8f0;">Clot activator + gel separator</td><td style="padding:8px;border:1px solid #e2e8f0;">Serum</td><td style="padding:8px;border:1px solid #e2e8f0;">Chemistry, immunology, serology</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">5</td></tr>
  <tr style="background:#eff6ff;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;text-align:center;">🔵 Light Blue</td><td style="padding:8px;border:1px solid #e2e8f0;">Sodium citrate 3.2%</td><td style="padding:8px;border:1px solid #e2e8f0;">Plasma</td><td style="padding:8px;border:1px solid #e2e8f0;">PT/INR, aPTT, fibrinogen, D-dimer</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">3–4</td></tr>
  <tr style="background:#f0fdf4;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;text-align:center;">🟢 Green</td><td style="padding:8px;border:1px solid #e2e8f0;">Lithium heparin or Na heparin</td><td style="padding:8px;border:1px solid #e2e8f0;">Plasma</td><td style="padding:8px;border:1px solid #e2e8f0;">STAT chemistry, ammonia</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">8–10</td></tr>
  <tr style="background:#faf5ff;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;text-align:center;">🟣 Lavender</td><td style="padding:8px;border:1px solid #e2e8f0;">EDTA</td><td style="padding:8px;border:1px solid #e2e8f0;">Whole blood / EDTA plasma</td><td style="padding:8px;border:1px solid #e2e8f0;">CBC, blood bank, HbA1c, ESR</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">8–10</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;text-align:center;">⚫ Gray</td><td style="padding:8px;border:1px solid #e2e8f0;">Sodium fluoride + potassium oxalate</td><td style="padding:8px;border:1px solid #e2e8f0;">Plasma</td><td style="padding:8px;border:1px solid #e2e8f0;">Glucose, lactate, BAC</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">8–10</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;text-align:center;">🔵 Royal Blue</td><td style="padding:8px;border:1px solid #e2e8f0;">EDTA or plain (no metal)</td><td style="padding:8px;border:1px solid #e2e8f0;">Serum or plasma</td><td style="padding:8px;border:1px solid #e2e8f0;">Trace elements, toxicology, heavy metals</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">8–10</td></tr>
  <tr style="background:#fefce8;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;text-align:center;">🟡 Yellow</td><td style="padding:8px;border:1px solid #e2e8f0;">SPS (sodium polyanethol sulfonate)</td><td style="padding:8px;border:1px solid #e2e8f0;">Whole blood</td><td style="padding:8px;border:1px solid #e2e8f0;">Blood cultures</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">8–10</td></tr>
</table>

<h3>Order of Draw — Full Sequence</h3>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:8px;margin:12px 0;">
  <p style="margin:4px 0;"><strong>1.</strong> Blood cultures (Yellow — SPS)</p>
  <p style="margin:4px 0;"><strong>2.</strong> Coagulation tube (Light Blue — sodium citrate)</p>
  <p style="margin:4px 0;"><strong>3.</strong> Serum tubes (Red plain → Gold SST)</p>
  <p style="margin:4px 0;"><strong>4.</strong> Heparin tubes (Green)</p>
  <p style="margin:4px 0;"><strong>5.</strong> EDTA tubes (Lavender/Purple)</p>
  <p style="margin:4px 0;"><strong>6.</strong> Glycolytic inhibitor (Gray)</p>
  <p style="margin:6px 0 0;font-style:italic;color:#475569;">Mnemonic: "Boy, Let's See How Energetically Gus Goes" (Blood cultures, Light blue, Serum, Heparin, EDTA, Gray)</p>
</div>`
},
{
  section: 'PHLEBOTOMY EQUIPMENT AND TUBES', sort: 9, type: 'text',
  title: 'Infection Control and Safety',
  content: `<h2>Infection Control and Safety</h2>
<p>Phlebotomists work with blood — a potential source of bloodborne pathogens — every day. Rigorous infection control and safety practices protect both the patient and the healthcare worker.</p>

<h3>Standard Precautions</h3>
<p>Standard Precautions treat all patients as potentially infectious for bloodborne pathogens, regardless of their known diagnosis or health status. They apply to:</p>
<ul>
  <li>Blood</li>
  <li>All body fluids (except sweat)</li>
  <li>Non-intact skin</li>
  <li>Mucous membranes</li>
</ul>
<p>Standard Precautions replaced Universal Precautions as the primary infection control strategy and are required by OSHA for all healthcare workers.</p>

<h3>Hand Hygiene</h3>
<p>The single most effective infection control measure. Required:</p>
<ul>
  <li>Before and after every patient contact</li>
  <li>Before putting on gloves and after removing them</li>
  <li>After touching contaminated surfaces</li>
  <li>After removing PPE</li>
</ul>
<p>Method: soap and water for ≥20 seconds (required when hands are visibly soiled or when caring for patients with C. difficile); alcohol-based hand sanitizer is acceptable otherwise.</p>

<h3>Sharps Safety</h3>
<ul>
  <li><strong>Never recap needles two-handed</strong> — this is the most preventable cause of needlestick injuries</li>
  <li>Activate the needle safety device immediately upon withdrawal</li>
  <li>Dispose of contaminated needles immediately into a puncture-resistant, leak-proof sharps container</li>
  <li>Sharps containers must be within arm's reach during collection</li>
  <li>Replace containers when ¾ full — never overfill or force items in</li>
  <li>Never bend, break, or remove needles from syringes by hand</li>
</ul>

<h3>Post-Exposure Protocol</h3>
<p>If a needlestick or splash exposure occurs:</p>
<ol>
  <li>Immediately wash the wound with soap and water (needlestick) or flush mucous membranes with water (splash)</li>
  <li>Do NOT squeeze the wound — this does not reduce risk and may increase it</li>
  <li>Report immediately to supervisor and employee health</li>
  <li>Document the incident (source patient, time, circumstances)</li>
  <li>Follow facility protocol for source patient testing and post-exposure prophylaxis (PEP) evaluation</li>
</ol>

<h3>Transmission-Based Precautions</h3>
<p>In addition to Standard Precautions, some patients require additional protection:</p>
<ul>
  <li><strong>Contact Precautions:</strong> Gown + gloves (MRSA, C. diff, VRE)</li>
  <li><strong>Droplet Precautions:</strong> Surgical mask within 3–6 feet (influenza, pertussis)</li>
  <li><strong>Airborne Precautions:</strong> N95 respirator in negative pressure room (TB, measles, varicella)</li>
</ul>`
},
{ section: 'PHLEBOTOMY EQUIPMENT AND TUBES', sort: 10, type: 'quiz', title: 'Quiz 2: Equipment, Tubes & Order of Draw', quizKey: 'q2' },

// ═══════════════════════════════════════════════════════════════
// SECTION 3: THE VENIPUNCTURE PROCEDURE
// ═══════════════════════════════════════════════════════════════
{
  section: 'THE VENIPUNCTURE PROCEDURE', sort: 11, type: 'text',
  title: 'Pre-Collection Preparation and Patient Interaction',
  content: `<h2>Pre-Collection Preparation and Patient Interaction</h2>
<p>A successful blood draw starts long before the needle touches the skin. Pre-collection preparation — including reviewing the order, gathering equipment, identifying the patient, and communicating clearly — prevents errors and builds patient trust.</p>

<h3>Reviewing the Requisition</h3>
<p>Every blood draw must have a physician's order. Before approaching the patient, verify:</p>
<ul>
  <li>Patient's full name and date of birth</li>
  <li>Tests ordered and any special requirements (fasting, timed draw, special tube)</li>
  <li>Ordering physician's name</li>
  <li>Specimen type, tube requirements, and quantity needed</li>
  <li>Any clinical notes that affect collection (e.g., "draw from right arm only," dialysis patient)</li>
</ul>

<h3>Gathering Equipment</h3>
<p>Prepare everything before entering the patient's room:</p>
<ul>
  <li>Correct tubes in the right quantity</li>
  <li>Appropriate needle gauge and collection system</li>
  <li>Tourniquet (single-use or properly disinfected reusable)</li>
  <li>Alcohol prep pads</li>
  <li>Gauze and bandage</li>
  <li>Sharps container (nearby and accessible)</li>
  <li>Labels (pre-printed if available)</li>
  <li>Gloves</li>
</ul>

<h3>Patient Identification</h3>
<p>Patient misidentification is a serious medical error. Always use <strong>two independent identifiers</strong> before every blood draw:</p>
<ul>
  <li><strong>Full name</strong> (ask the patient to state their name — do not ask "Are you John Smith?")</li>
  <li><strong>Date of birth</strong> OR medical record number</li>
  <li>Compare stated identifiers to the wristband and/or requisition</li>
  <li>For unconscious patients: verify with wristband and ask a nurse to confirm</li>
</ul>

<h3>Patient Communication</h3>
<ul>
  <li>Introduce yourself and explain your role</li>
  <li>Explain the procedure: "I need to draw a blood sample. It will involve a small needle stick and take just a minute."</li>
  <li>Ask about allergies to latex, antiseptics, or tape</li>
  <li>Ask about previous difficult draws or fainting history (syncope)</li>
  <li>Ask about fasting if the ordered tests require it</li>
  <li>Ask the patient to lie down if they have a history of fainting (vasovagal response)</li>
</ul>

<h3>Special Patient Considerations</h3>
<ul>
  <li><strong>Do NOT draw from:</strong> Arm with IV infusion (dilutes specimen), mastectomy side, arm with AV fistula, from a hematoma, edematous areas</li>
  <li><strong>Fasting requirements:</strong> Glucose, lipid panels, and GTT typically require 8–12 hours fasting; note if the patient reports non-fasting status</li>
  <li><strong>Anxiety and syncope:</strong> Position the patient supine if they are prone to fainting; keep smelling salts (ammonia inhalants) available</li>
</ul>`
},
{
  section: 'THE VENIPUNCTURE PROCEDURE', sort: 12, type: 'presentation',
  title: 'The Venipuncture Procedure',
  pptxKey: 'venipuncture',
},
{
  section: 'THE VENIPUNCTURE PROCEDURE', sort: 13, type: 'text',
  title: 'Venipuncture Technique Step by Step',
  content: `<h2>Venipuncture Technique Step by Step</h2>
<p>Mastery of the venipuncture procedure requires both knowledge and hands-on practice. This lesson walks through every step in precise detail so you understand not just what to do, but why.</p>

<h3>Tourniquet Application</h3>
<ul>
  <li>Apply 3–4 inches (7–10 cm) above the intended puncture site</li>
  <li>Tight enough to engorge the vein but not restrict arterial flow (you should still feel a pulse)</li>
  <li>Do not exceed <strong>1 minute</strong> of tourniquet time</li>
  <li>Ask the patient to make a fist (close hand) — do NOT have them pump the fist vigorously (causes hemoconcentration and falsely elevates potassium)</li>
</ul>

<h3>Vein Palpation and Site Selection</h3>
<ul>
  <li>Palpate (feel) with your fingertip — veins feel soft and bouncy; tendons feel cord-like and do not bounce; arteries pulse</li>
  <li>Trace the vein's path to assess its direction and depth</li>
  <li>Select median cubital → cephalic → basilic (in that preference order)</li>
  <li>Anchor the vein with a finger to assess fixedness — avoid rolling veins when possible</li>
</ul>

<h3>Site Cleaning</h3>
<ul>
  <li>Clean the site with 70% isopropyl alcohol in a circular motion from center outward</li>
  <li>Allow to <strong>dry completely</strong> (30–60 seconds) — wet alcohol stings, dilutes specimen, causes hemolysis</li>
  <li>Do NOT fan or blow on the site to speed drying</li>
  <li>Do NOT re-palpate after cleaning — this contaminates the site</li>
</ul>

<h3>Needle Insertion</h3>
<ul>
  <li>Anchor the vein: use the non-dominant thumb to stretch the skin taut 1–2 inches below the site</li>
  <li>Hold the needle bevel-up at a <strong>15–30 degree angle</strong> aligned with the vein</li>
  <li>Insert the needle with a smooth, confident motion — hesitation increases patient discomfort</li>
  <li>Advance until you see a flash of blood in the hub (confirmation of vein entry)</li>
  <li>Do not move the needle once inside the vein</li>
</ul>

<h3>Blood Collection</h3>
<ul>
  <li>Push the first tube into the holder until the stopper engages the needle</li>
  <li>The tube fills automatically by vacuum — never force blood in</li>
  <li>Fill tubes completely (to the line on the label)</li>
  <li>As each tube fills, remove and immediately gently invert the required number of times</li>
  <li>Insert the next tube — the rubber sleeve on the tube-end needle reseals between tubes</li>
  <li>Release the tourniquet before removing the last tube, or when the last tube begins to fill</li>
</ul>

<h3>Completion</h3>
<ul>
  <li>Remove the last tube, release tourniquet (if not done), then remove the needle in one smooth motion</li>
  <li>Immediately apply gauze with pressure — ask the patient to maintain pressure (do NOT bend the arm)</li>
  <li>Activate the safety device immediately and discard the needle-holder assembly into the sharps container</li>
  <li>Label all tubes at the bedside before leaving the patient</li>
  <li>Check the site — ensure hemostasis before applying a bandage</li>
  <li>Remove gloves; wash hands; thank the patient</li>
</ul>`
},
{
  section: 'THE VENIPUNCTURE PROCEDURE', sort: 14, type: 'text',
  title: 'Complications and Troubleshooting',
  content: `<h2>Venipuncture Complications and Troubleshooting</h2>
<p>Even experienced phlebotomists encounter complications. Knowing how to recognize, manage, and prevent them is essential to patient safety and professional practice.</p>

<h3>Hematoma</h3>
<p><strong>What it is:</strong> Blood accumulating in the tissue around the puncture site, causing bruising and swelling.</p>
<p><strong>Causes:</strong> Needle went through the vein; inadequate pressure after the draw; bending the arm; tourniquet left on during tube removal; fragile veins.</p>
<p><strong>Management:</strong> Remove needle immediately, apply firm direct pressure for 3–5 minutes, elevate the arm. Do not rub — rubbing causes more bruising. Document and inform the nurse.</p>

<h3>Hemoconcentration</h3>
<p><strong>What it is:</strong> Falsely elevated results for proteins, enzymes, and cell counts caused by fluid shifting out of the vessel.</p>
<p><strong>Causes:</strong> Tourniquet left on &gt;1 minute, patient repeatedly pumping fist.</p>
<p><strong>Prevention:</strong> Limit tourniquet time; instruct the patient to close (not pump) the fist.</p>

<h3>Hemolysis</h3>
<p><strong>What it is:</strong> Red blood cells rupture, releasing intracellular contents (especially potassium) into the specimen, causing falsely elevated K+, LDH, and AST.</p>
<p><strong>Causes:</strong> Too small a needle with excessive suction, vigorous mixing/shaking, drawing through a hematoma, prolonged tourniquet, expired tubes, forceful syringe transfer.</p>
<p><strong>Visual sign:</strong> Pink or red plasma/serum instead of clear yellow.</p>

<h3>Petechiae</h3>
<p><strong>What it is:</strong> Small pinpoint red dots appearing on the skin distal to the tourniquet.</p>
<p><strong>Cause:</strong> Fragile capillaries rupturing under tourniquet pressure — common in patients on anticoagulants or with low platelets.</p>
<p><strong>Action:</strong> Release the tourniquet, proceed carefully; document finding.</p>

<h3>Syncope (Fainting)</h3>
<p><strong>What it is:</strong> Vasovagal response causing loss of consciousness — can occur during or after the draw.</p>
<p><strong>Prevention:</strong> Have at-risk patients lie down; explain the procedure calmly; work efficiently.</p>
<p><strong>Management:</strong> Stop the draw, remove the needle safely, lower the patient's head, apply cool cloth, call for help, do NOT leave the patient alone. Monitor vital signs. Document.</p>

<h3>Missed Vein / Difficult Draw</h3>
<ul>
  <li>Needle may need minor redirection (no more than 5–10° without withdrawing)</li>
  <li>If unsuccessful after two attempts: call for another phlebotomist per facility policy (most facilities limit to two attempts per phlebotomist)</li>
  <li>Never make more than two attempts without supervisor notification</li>
  <li>Consider a butterfly needle for difficult veins</li>
</ul>

<h3>Inadvertent Arterial Puncture</h3>
<p>Signs: bright red blood, pulsating flow, rapid tube fill. Action: remove needle immediately, apply firm pressure for at least 5 minutes (longer if anticoagulated), elevate the arm, monitor the site, notify the nurse and document the incident.</p>`
},
{ section: 'THE VENIPUNCTURE PROCEDURE', sort: 15, type: 'quiz', title: 'Quiz 3: Venipuncture Procedure', quizKey: 'q3' },

// ═══════════════════════════════════════════════════════════════
// SECTION 4: SPECIMEN HANDLING AND PROCESSING
// ═══════════════════════════════════════════════════════════════
{
  section: 'SPECIMEN HANDLING AND PROCESSING', sort: 16, type: 'text',
  title: 'Post-Collection Specimen Management',
  content: `<h2>Post-Collection Specimen Management</h2>
<p>A properly collected specimen can be ruined by improper post-collection handling. The phlebotomist's responsibility does not end when the needle is removed — it ends when the specimen is safely in the laboratory.</p>

<h3>Labeling</h3>
<p>Mislabeled specimens are a serious patient safety issue. Every tube must be labeled <strong>at the patient's bedside</strong>, immediately after collection:</p>
<ul>
  <li>Patient's full name</li>
  <li>Date of birth</li>
  <li>Date and time of collection</li>
  <li>Collector's identification (initials, ID number, or credential)</li>
  <li>Accession number (if pre-printed labels are not used)</li>
</ul>
<p><strong>Never:</strong> Pre-label tubes before the draw; label tubes away from the patient; relabel or alter specimen labels. When in doubt, recollect.</p>

<h3>Tube Inversion</h3>
<p>Tubes must be gently inverted immediately after collection to mix blood with additives:</p>
<ul>
  <li>Invert by rotating the tube 180° completely — not shaking, not half-turns</li>
  <li>Do not shake vigorously — causes hemolysis</li>
  <li>Blood culture bottles: 8–10 inversions</li>
  <li>Light blue (citrate): 3–4 inversions</li>
  <li>Red/Gold SST: 5 inversions</li>
  <li>Green (heparin): 8–10 inversions</li>
  <li>Lavender (EDTA): 8–10 inversions</li>
  <li>Gray (fluoride): 8–10 inversions</li>
</ul>

<h3>Transport</h3>
<p>Specimens must be transported promptly in approved biohazard containers:</p>
<ul>
  <li>All tubes in a sealed, leakproof biohazard bag</li>
  <li>Requisition outside the bag in a separate pouch</li>
  <li>Do not transport tubes loose or uncapped</li>
  <li>Pneumatic tube systems: ensure tubes are properly secured; fragile specimens (platelet function, cryoglobulins) cannot go through pneumatic systems</li>
  <li>Transport most routine specimens at room temperature within 30–60 minutes</li>
</ul>

<h3>Time-Sensitive Specimens</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;text-align:left;">Specimen</th><th style="padding:8px;text-align:left;">Requirement</th><th style="padding:8px;text-align:left;">Reason</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Arterial blood gas</td><td style="padding:8px;border:1px solid #e2e8f0;">Ice slurry; analyze ≤15–30 min</td><td style="padding:8px;border:1px solid #e2e8f0;">Cell metabolism alters pO2, pCO2, pH</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">Ammonia</td><td style="padding:8px;border:1px solid #e2e8f0;">Ice slurry; analyze ≤20 min</td><td style="padding:8px;border:1px solid #e2e8f0;">RBCs produce ammonia during storage</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Lactic acid</td><td style="padding:8px;border:1px solid #e2e8f0;">Ice slurry or gray tube; quick transport</td><td style="padding:8px;border:1px solid #e2e8f0;">Glycolysis continues, increasing lactate</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">Coagulation (light blue)</td><td style="padding:8px;border:1px solid #e2e8f0;">Centrifuge and test ≤4 hours</td><td style="padding:8px;border:1px solid #e2e8f0;">Clotting factors degrade</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Potassium</td><td style="padding:8px;border:1px solid #e2e8f0;">Separate within 30–60 min</td><td style="padding:8px;border:1px solid #e2e8f0;">RBC lysis falsely elevates K+</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">Bilirubin</td><td style="padding:8px;border:1px solid #e2e8f0;">Protect from light immediately</td><td style="padding:8px;border:1px solid #e2e8f0;">Photodegradation causes falsely low results</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Blood cultures</td><td style="padding:8px;border:1px solid #e2e8f0;">Incubate immediately; do NOT refrigerate</td><td style="padding:8px;border:1px solid #e2e8f0;">Organisms grow at body temperature; cold kills them</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;">Cold agglutinins</td><td style="padding:8px;border:1px solid #e2e8f0;">Keep at 37°C (body temp) until separation</td><td style="padding:8px;border:1px solid #e2e8f0;">Cold causes agglutination — falsely low RBC count</td></tr>
</table>`
},
{
  section: 'SPECIMEN HANDLING AND PROCESSING', sort: 17, type: 'presentation',
  title: 'Specimen Handling & Processing',
  pptxKey: 'specimen-handling',
},
{
  section: 'SPECIMEN HANDLING AND PROCESSING', sort: 18, type: 'text',
  title: 'Pre-Analytical Errors and Specimen Rejection',
  content: `<h2>Pre-Analytical Errors and Specimen Rejection</h2>
<p>Pre-analytical errors — those occurring before the specimen is analyzed — are the leading cause of laboratory errors, accounting for up to 70% of all mistakes. Phlebotomists are the first line of defense against these errors.</p>

<h3>Categories of Pre-Analytical Errors</h3>

<h4>Collection Errors</h4>
<ul>
  <li><strong>Wrong tube:</strong> Collecting in the wrong additive tube for the ordered test</li>
  <li><strong>Wrong order of draw:</strong> Additive carryover can affect coagulation studies or other tests</li>
  <li><strong>Underfilled tubes:</strong> Especially critical for light blue — alters citrate:blood ratio</li>
  <li><strong>Overfilled tubes:</strong> Insufficient anticoagulant for the volume of blood</li>
  <li><strong>Wrong patient:</strong> Identity verification failure — the most dangerous error</li>
  <li><strong>Wrong time:</strong> Timed draws (drug levels, glucose tolerance) must be collected at exact times</li>
</ul>

<h4>Handling Errors</h4>
<ul>
  <li><strong>Hemolysis:</strong> Vigorous shaking, excessive force with syringe, too-small needle</li>
  <li><strong>Clotted anticoagulated tube:</strong> Insufficient or delayed inversion</li>
  <li><strong>Lipemia:</strong> Patient was not fasting when required</li>
  <li><strong>Icteric (jaundiced) specimen:</strong> Patient condition — may interfere with photometric assays</li>
</ul>

<h4>Transport/Storage Errors</h4>
<ul>
  <li>Wrong temperature (too cold for blood cultures, not cold enough for ABGs)</li>
  <li>Exposure to light (bilirubin, folate, B12)</li>
  <li>Excessive delay before processing</li>
  <li>Improper centrifugation (speed, time, temperature)</li>
</ul>

<h3>Specimen Rejection Criteria</h3>
<p>The laboratory will reject and request recollection for:</p>
<ul>
  <li>Unlabeled or mislabeled specimens</li>
  <li>Hemolyzed specimens (when the test is affected by hemolysis)</li>
  <li>Clotted anticoagulated tubes</li>
  <li>Underfilled coagulation tubes</li>
  <li>Incorrect tube type for the ordered test</li>
  <li>Specimens collected too long ago (exceeded stability window)</li>
  <li>Broken or leaking tubes</li>
  <li>Specimens without proper documentation</li>
</ul>

<h3>Proper Response to Rejected Specimens</h3>
<ol>
  <li>Notify the ordering nurse or unit of the rejection and reason</li>
  <li>Return to collect a new specimen as soon as possible</li>
  <li>Document the rejection, recollection, and any delay</li>
  <li>Never relabel or alter the rejected specimen</li>
  <li>Analyze the cause — was this a systems issue or individual error? Report to quality improvement.</li>
</ol>`
},
{
  section: 'SPECIMEN HANDLING AND PROCESSING', sort: 19, type: 'text',
  title: 'Point-of-Care Testing',
  content: `<h2>Point-of-Care Testing (POCT)</h2>
<p>Point-of-care testing refers to diagnostic testing performed at or near the patient's location — at the bedside, in a clinic, or in the emergency department — rather than in the central laboratory. POCT delivers rapid results that enable faster clinical decisions.</p>

<h3>Common POCT Devices and Tests</h3>
<ul>
  <li><strong>Glucometer:</strong> Capillary or venous blood glucose — most common POCT test</li>
  <li><strong>Hemoglobin analyzer (HemoCue):</strong> Rapid hemoglobin measurement</li>
  <li><strong>INR/PT meter (CoaguChek):</strong> Anticoagulation monitoring at the bedside</li>
  <li><strong>Urine dipstick:</strong> Rapid urinalysis at the patient's side</li>
  <li><strong>Rapid strep test:</strong> Throat swab for Group A Streptococcus</li>
  <li><strong>Rapid flu test</strong></li>
  <li><strong>Blood gas analyzers (iSTAT, GEM Premier):</strong> STAT blood gases, electrolytes, lactate</li>
  <li><strong>Pregnancy test (hCG):</strong> Urine or serum</li>
</ul>

<h3>CLIA Regulation of POCT</h3>
<p>Under CLIA (Clinical Laboratory Improvement Amendments), POCT is classified by complexity:</p>
<ul>
  <li><strong>Waived tests:</strong> Simple, low-risk — glucometers, urine dipsticks, rapid strep. Minimal training required. Most bedside POCT falls here.</li>
  <li><strong>Moderate complexity:</strong> More stringent training, quality control, and documentation requirements</li>
  <li><strong>High complexity:</strong> Requires licensed laboratory professionals</li>
</ul>

<h3>Quality Control in POCT</h3>
<p>POCT devices require daily (or per manufacturer's schedule) quality control (QC) testing to verify accuracy:</p>
<ul>
  <li>Run at least two levels of control (high and low) per shift or per device standards</li>
  <li>Document QC results; do not use the device if QC fails</li>
  <li>Troubleshoot QC failures: check controls, check test strips/cartridges, check device calibration</li>
  <li>Report persistent failures to the lab supervisor or POCT coordinator</li>
</ul>

<h3>Phlebotomist's Role in POCT</h3>
<ul>
  <li>Collect the specimen correctly (capillary or venous per device requirements)</li>
  <li>Operate the device following the manufacturer's instructions exactly</li>
  <li>Perform and document QC as required</li>
  <li>Enter patient results into the EHR or report to the clinical team immediately for critical values</li>
  <li>Maintain device logs, reagent storage records, and maintenance documentation</li>
</ul>`
},
{ section: 'SPECIMEN HANDLING AND PROCESSING', sort: 20, type: 'quiz', title: 'Quiz 4: Specimen Handling & Processing', quizKey: 'q4' },

// ═══════════════════════════════════════════════════════════════
// SECTION 5: SPECIAL COLLECTION PROCEDURES
// ═══════════════════════════════════════════════════════════════
{
  section: 'SPECIAL COLLECTION PROCEDURES', sort: 21, type: 'text',
  title: 'Capillary and Dermal Puncture',
  content: `<h2>Capillary and Dermal Puncture</h2>
<p>Capillary (dermal) puncture collects blood from the capillary beds just beneath the skin surface. It is the preferred method when only small volumes of blood are needed, when venous access is poor, or when collecting from infants and neonates.</p>

<h3>Indications for Capillary Collection</h3>
<ul>
  <li>Newborns and infants (small blood volume; fragile, small veins)</li>
  <li>Adults with extremely poor venous access after multiple failed venipuncture attempts</li>
  <li>Point-of-care testing (glucometers, hemoglobin meters)</li>
  <li>Newborn screening (PKU, hypothyroidism, galactosemia, etc.)</li>
  <li>Patients who are excessively obese or burned over venous sites</li>
</ul>

<h3>Capillary Puncture Sites</h3>

<h4>Neonates and Infants (Heel Stick)</h4>
<ul>
  <li>Site: <strong>Lateral or medial plantar surface</strong> of the heel</li>
  <li><strong>Never</strong> use the posterior curve of the heel or the arch (calcaneus is too close; risk of osteomyelitis)</li>
  <li>Warm the heel for 3–5 minutes before puncture to increase blood flow</li>
  <li>Puncture depth: <strong>must not exceed 2 mm</strong></li>
  <li>Use an appropriate neonatal lancet device (fixed depth)</li>
</ul>

<h4>Adults and Children (Fingerstick)</h4>
<ul>
  <li>Site: <strong>Lateral or medial aspect of the fingertip</strong> (ring or middle finger preferred)</li>
  <li>Avoid: thumb (too thick), index finger (heavily used, more sensitive), little finger (thin tissue)</li>
  <li>Avoid the very tip of the finger (painful) and the very side (thin, near nail)</li>
  <li>Warm if circulation is poor</li>
</ul>

<h3>Capillary Collection Procedure</h3>
<ol>
  <li>Warm the site if needed (warm towel or commercial heel warmer for 3–5 min)</li>
  <li>Clean with 70% isopropyl alcohol; allow to dry completely</li>
  <li>Puncture with the lancet in one firm motion; wipe away the first drop (contains tissue fluid)</li>
  <li>Apply gentle intermittent pressure to encourage blood flow — do NOT squeeze or milk excessively (dilutes with tissue fluid)</li>
  <li>Collect in capillary tubes, microcollection tubes, or onto filter paper (newborn screening cards)</li>
  <li>Fill tubes in capillary order of draw: <strong>EDTA first → other additives → serum</strong></li>
  <li>Apply pressure and bandage upon completion</li>
  <li>Label specimens at the bedside</li>
</ol>

<h3>Capillary vs. Venous Specimen Differences</h3>
<ul>
  <li>Capillary blood is a mixture of arterial, venous, and capillary blood plus interstitial fluid</li>
  <li>Glucose is slightly higher in capillary samples than venous</li>
  <li>Hemoglobin/hematocrit results are comparable when collected properly</li>
  <li>Some tests (coagulation studies, blood cultures) cannot be collected by capillary puncture</li>
</ul>`
},
{
  section: 'SPECIAL COLLECTION PROCEDURES', sort: 22, type: 'presentation',
  title: 'Special Collection Procedures',
  pptxKey: 'special-collections',
},
{
  section: 'SPECIAL COLLECTION PROCEDURES', sort: 23, type: 'text',
  title: 'Blood Cultures, Drug Monitoring, and Timed Collections',
  content: `<h2>Blood Cultures, Drug Monitoring, and Timed Collections</h2>
<p>Several specialized collection procedures require specific techniques and timing protocols. Deviating from these protocols can render results uninterpretable or clinically misleading.</p>

<h3>Blood Cultures</h3>
<p>Blood cultures detect bacteria or fungi in the bloodstream (bacteremia/fungemia). They require the highest level of technique and aseptic practice in routine phlebotomy.</p>

<h4>Standard Protocol</h4>
<ul>
  <li>Collect <strong>two sets</strong> from <strong>two separate venipuncture sites</strong> (different arms) to help distinguish true bacteremia from skin contamination</li>
  <li>Each set: one aerobic bottle + one anaerobic bottle</li>
  <li>Volume: 8–10 mL per bottle in adults (fill to the line)</li>
  <li>Skin prep: chlorhexidine gluconate (preferred) or two-step iodine/alcohol — allow to dry completely</li>
  <li>Clean bottle tops with 70% alcohol — allow to dry</li>
  <li>When using a butterfly set: fill aerobic bottle first (air in tubing goes into aerobic first)</li>
  <li>When using a straight needle: fill anaerobic bottle first (reduces air exposure)</li>
  <li>Incubate immediately — <strong>never refrigerate blood culture bottles</strong></li>
  <li>Target contamination rate: &lt;3%</li>
</ul>

<h3>Therapeutic Drug Monitoring (TDM)</h3>
<p>Drug levels must be drawn at precise times relative to drug administration:</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Level Type</th><th style="padding:8px;text-align:left;">When Drawn</th><th style="padding:8px;text-align:left;">What It Measures</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Trough</td><td style="padding:8px;border:1px solid #e2e8f0;">Just before the next dose (lowest concentration)</td><td style="padding:8px;border:1px solid #e2e8f0;">Whether drug stays above minimum effective level</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Peak</td><td style="padding:8px;border:1px solid #e2e8f0;">After infusion complete (30–60 min post-IV dose)</td><td style="padding:8px;border:1px solid #e2e8f0;">Maximum concentration; toxicity monitoring</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Random</td><td style="padding:8px;border:1px solid #e2e8f0;">Any time (some drugs)</td><td style="padding:8px;border:1px solid #e2e8f0;">Steady-state levels</td></tr>
</table>
<p><strong>Documentation is critical:</strong> Record the exact draw time, the last dose time and route, on the label and requisition. Incorrect timing makes results uninterpretable.</p>
<p>Common monitored drugs: vancomycin (trough), gentamicin (peak and trough), digoxin (trough), phenytoin, lithium, cyclosporine, methotrexate.</p>

<h3>Fasting Specimens</h3>
<ul>
  <li>Many tests require 8–12 hours fasting: lipid panel, glucose, insulin, GTT</li>
  <li>Ask the patient to confirm fasting status and record the duration</li>
  <li>If not fasting when required: collect the specimen, document "non-fasting" on the tube and requisition, and notify the ordering provider</li>
  <li>Do not refuse to collect — the provider decides whether to use the result or reschedule</li>
</ul>

<h3>Glucose Tolerance Test (GTT)</h3>
<ul>
  <li>Verify 8–12 hour fast; collect fasting baseline glucose</li>
  <li>Patient drinks glucose load (75g for 2-hour OGTT; 100g for 3-hour gestational diabetes test)</li>
  <li>Collect at 1, 2 (and sometimes 3) hours after glucose ingestion</li>
  <li>Patient must remain at rest: no food, no tobacco, no strenuous activity, no leaving the area</li>
  <li>Label each tube with the exact collection time</li>
  <li>If patient vomits: stop test, notify provider, document</li>
</ul>`
},
{
  section: 'SPECIAL COLLECTION PROCEDURES', sort: 24, type: 'quiz', title: 'Quiz 5: Special Collection Procedures', quizKey: 'q5' },

// ═══════════════════════════════════════════════════════════════
// SECTION 6: EXAM PREPARATION
// ═══════════════════════════════════════════════════════════════
{
  section: 'EXAM PREPARATION', sort: 25, type: 'text',
  title: 'Study Guide and Key Concepts Review',
  content: `<h2>Study Guide and Key Concepts Review</h2>
<p>This is your comprehensive pre-exam review. Study each section until you can answer questions without hesitation.</p>

<h3>Section 1: Circulatory System & Anatomy</h3>
<ul>
  <li>Blood = 55% plasma + 45% formed elements; RBCs carry oxygen</li>
  <li>Antecubital vein preference: <strong>Median cubital → Cephalic → Basilic</strong></li>
  <li>Basilic is last choice: near brachial artery and median nerve</li>
  <li>Serum = clotted blood (no clotting factors); Plasma = anticoagulated blood (has clotting factors)</li>
  <li>Never draw from: IV arm, mastectomy side, AV fistula arm, hematoma site</li>
</ul>

<h3>Section 2: Tubes & Order of Draw</h3>
<ul>
  <li><strong>Order:</strong> Blood Cultures → Light Blue → Red/Gold → Green → Lavender → Gray</li>
  <li>Light Blue (citrate): PT/aPTT — must fill to the line; 3–4 inversions</li>
  <li>Lavender (EDTA): CBC, blood bank — 8–10 inversions</li>
  <li>Gray (fluoride): glucose, lactate — inhibits glycolysis</li>
  <li>Higher gauge number = smaller needle (21G standard adult; 23G butterfly)</li>
  <li>Discard tube needed before light blue when it is the only or first tube</li>
</ul>

<h3>Section 3: Venipuncture Procedure</h3>
<ul>
  <li>Two patient identifiers: name + DOB or MRN</li>
  <li>Tourniquet: 3–4 inches above site; ≤1 minute max</li>
  <li>Alcohol: let dry completely 30–60 sec; do not re-palpate</li>
  <li>Needle angle: <strong>15–30 degrees, bevel up</strong></li>
  <li>Label tubes at bedside immediately after collection — never pre-label or label elsewhere</li>
  <li>Apply pressure after draw; do NOT bend arm (causes hematoma)</li>
  <li>Sharps container: immediately after use; replace when ¾ full</li>
</ul>

<h3>Section 4: Specimen Handling</h3>
<ul>
  <li>Pre-analytical errors = up to 70% of all lab errors</li>
  <li>Hemolysis: pink/red plasma; falsely elevates K+, LDH, AST; causes: vigorous shaking, small needle, drawing through hematoma</li>
  <li>SST (gold): clot 30 min before centrifugation; clot activator + gel separator</li>
  <li>Bilirubin: protect from light; photodegrades quickly</li>
  <li>ABG: ice slurry; analyze within 15–30 min</li>
  <li>Blood cultures: incubate immediately; never refrigerate</li>
  <li>Potassium: separate from cells within 30–60 min to prevent false elevation</li>
</ul>

<h3>Section 5: Special Collections</h3>
<ul>
  <li>Heel stick site: <strong>lateral or medial plantar surface only</strong>; never posterior curve; depth ≤2 mm</li>
  <li>Capillary order of draw: <strong>EDTA first</strong> (opposite of venipuncture)</li>
  <li>Blood cultures: 2 sets, 2 sites; chlorhexidine or iodine; contamination rate &lt;3%</li>
  <li>Trough level: drawn just before the next dose (lowest concentration)</li>
  <li>Peak level: drawn after dose peaks (timing varies by drug and route)</li>
  <li>GTT: verify fast; patient remains at rest; label with exact times</li>
</ul>

<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Exam Strategy:</strong> The CPT exam emphasizes <em>order of draw</em>, <em>tube additives</em>, <em>venipuncture technique</em>, and <em>pre-analytical errors</em>. These four areas alone account for the majority of questions. Know them cold. For any question involving tube selection or order, think through your mnemonic before answering.
</div>`
},
{
  section: 'EXAM PREPARATION', sort: 26, type: 'presentation',
  title: 'CPT Exam Strategy',
  pptxKey: 'exam-prep',
},
{ section: 'EXAM PREPARATION', sort: 27, type: 'quiz', title: 'Final Assessment: CPT Practice Exam', quizKey: 'final' },

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

    if (lesson.type === 'presentation') {
      const filePath = makePptx(lesson.pptxKey);
      content = JSON.stringify({ file: filePath, title: lesson.title });
    } else if (lesson.type === 'quiz') {
      content = '';
    }

    const [result] = await conn.execute(
      `INSERT INTO lessons (course_id, title, type, content, sort_order, section_title, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [COURSE_ID, lesson.title, lesson.type, content, lesson.sort, lesson.section, slug(lesson.title)]
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
