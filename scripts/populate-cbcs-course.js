const mysql = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = '/var/www/nationalhealthcareer-com/public/uploads';
const COURSE_ID = 5;
const DB = { host: 'localhost', user: 'admin_nhca', password: '2u95#I7jm', database: 'nha_db' };

let _n = 0;
function slug(title) {
  _n++;
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150) + '-c5-' + _n;
}

// ─── LESSON DATA ──────────────────────────────────────────────────────────────
const lessons = [

// SECTION 1: INTRODUCTION TO MEDICAL CODING
{
  section: 'INTRODUCTION TO MEDICAL CODING', sort: 1, type: 'text',
  title: 'Welcome to Medical Coding & Billing',
  content: `<h2>Welcome to Medical Coding &amp; Billing</h2>
<p>Medical coding and billing is one of the fastest-growing careers in healthcare. As a Medical Coder and Biller, you translate clinical documentation — physician notes, lab results, diagnoses, and procedures — into standardized codes used by insurance companies, government payers, and healthcare systems to process claims and reimburse providers.</p>
<h3>Why This Career Matters</h3>
<p>Every time a patient visits a doctor, every diagnosis, every test, every procedure must be converted into precise numeric and alphanumeric codes. Without accurate coding, hospitals and clinics cannot be paid for the services they provide. Coding errors cost the US healthcare system billions of dollars annually — and career-ready coders who do it right are always in demand.</p>
<h3>What You Will Learn</h3>
<ul>
  <li>The three major code sets: <strong>ICD-10-CM</strong>, <strong>CPT</strong>, and <strong>HCPCS Level II</strong></li>
  <li>How to read and apply Official Guidelines for Coding and Reporting</li>
  <li>The complete medical billing revenue cycle</li>
  <li>Medicare, Medicaid, and private insurance billing rules</li>
  <li>HIPAA compliance and coding ethics</li>
  <li>How to prepare for and pass the <strong>NHA CBCS exam</strong></li>
</ul>
<h3>Your Credential: CBCS</h3>
<p>The <strong>Certified Billing and Coding Specialist (CBCS)</strong> credential is issued by the National Healthcareer Association (NHA). It is nationally recognized and accepted by employers across the United States in physician offices, hospitals, outpatient clinics, and insurance companies.</p>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>💡 Career Outlook:</strong> According to the U.S. Bureau of Labor Statistics, medical records and health information jobs are projected to grow <strong>13% through 2031</strong> — much faster than the national average. Median pay: <strong>$46,660/year</strong>.
</div>
<h3>Course Structure</h3>
<ol>
  <li>Introduction to Medical Coding</li>
  <li>Diagnostic Coding — ICD-10-CM</li>
  <li>Procedural Coding — CPT</li>
  <li>The Medical Billing Process</li>
  <li>Compliance &amp; Ethics</li>
  <li>CBCS Exam Preparation &amp; Final Assessment</li>
</ol>`
},

{ section: 'INTRODUCTION TO MEDICAL CODING', sort: 2, type: 'presentation', title: 'Introduction to Medical Coding', pptxKey: 'intro' },

{
  section: 'INTRODUCTION TO MEDICAL CODING', sort: 3, type: 'text',
  title: 'ICD-10-CM, CPT, and HCPCS Code Structures',
  content: `<h2>ICD-10-CM, CPT, and HCPCS: The Three Code Sets</h2>
<p>Medical coders work with three primary coding systems. Understanding the structure of each is the foundation of the CBCS exam and your daily work.</p>
<h3>1. ICD-10-CM</h3>
<p><strong>Purpose:</strong> Describes <em>why</em> a patient was seen — diagnoses, signs, symptoms, and reasons for the encounter.</p>
<p><strong>Published by:</strong> CDC and CMS. <strong>Format:</strong> 3–7 alphanumeric characters (first character always a letter).</p>
<div style="background:#f8fafc;padding:12px 16px;border-radius:8px;font-family:monospace;margin:12px 0;">
  <strong>Example:</strong> J45.20 — Mild intermittent asthma, uncomplicated<br>
  J = Respiratory | 45 = Asthma | .20 = Mild intermittent, uncomplicated
</div>
<h3>2. CPT — Current Procedural Terminology</h3>
<p><strong>Purpose:</strong> Describes <em>what was done</em> — procedures, services, and treatments performed. <strong>Published by:</strong> American Medical Association (AMA), updated annually.</p>
<p><strong>Format:</strong> 5-digit numeric codes. Six sections: E/M · Anesthesia · Surgery · Radiology · Pathology/Lab · Medicine</p>
<div style="background:#f8fafc;padding:12px 16px;border-radius:8px;font-family:monospace;margin:12px 0;">
  <strong>Example:</strong> 99213 — Office visit, established patient, low complexity<br>
  <strong>Example:</strong> 93000 — Routine ECG with interpretation and report
</div>
<h3>3. HCPCS Level II</h3>
<p><strong>Purpose:</strong> Items and services not in CPT — durable medical equipment (DME), ambulance, drugs, supplies. <strong>Published by:</strong> CMS, updated quarterly.</p>
<p><strong>Format:</strong> One letter (A–V) + four digits.</p>
<div style="background:#f8fafc;padding:12px 16px;border-radius:8px;font-family:monospace;margin:12px 0;">
  <strong>Example:</strong> A6216 — Gauze, non-impregnated, sterile, wound care<br>
  <strong>Example:</strong> J0696 — Injection, ceftriaxone sodium, per 250mg
</div>
<div style="background:#ecfdf5;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>✓ Key Rule:</strong> Always code to the highest level of specificity supported by documentation. Never use an incomplete code when a more specific one exists.
</div>`
},

{
  section: 'INTRODUCTION TO MEDICAL CODING', sort: 4, type: 'text',
  title: 'Medical Coding Documentation and Guidelines',
  content: `<h2>Medical Coding Documentation and Official Guidelines</h2>
<p>Accurate coding starts with accurate documentation. Coders rely entirely on what is written in the medical record — you cannot code what is not documented.</p>
<h3>Sources of Documentation</h3>
<ul>
  <li>Physician progress notes and H&amp;P (history and physical)</li>
  <li>Operative reports — detailed surgical procedure notes</li>
  <li>Discharge summaries — inpatient stay summaries</li>
  <li>Radiology, pathology, and laboratory reports</li>
  <li>Orders, prescriptions, and nursing notes</li>
</ul>
<h3>Official Guidelines — Key Principles</h3>
<ol>
  <li><strong>Code the reason for the encounter</strong> — not chronic conditions unless they affect the visit</li>
  <li><strong>Combination codes</strong> — use when a single code captures both a condition and its complication</li>
  <li><strong>Sequencing</strong> — principal diagnosis (inpatient) or first-listed (outpatient) goes first</li>
  <li><strong>Signs and symptoms</strong> — code them when no definitive diagnosis is established</li>
  <li><strong>Outpatient rule:</strong> Do NOT code "probable," "suspected," or "rule out" diagnoses — code the sign or symptom</li>
</ol>
<h3>Outpatient vs. Inpatient Key Difference</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
  <thead><tr style="background:#0f2b5b;color:white;"><th style="padding:8px;">Rule</th><th style="padding:8px;">Outpatient</th><th style="padding:8px;">Inpatient</th></tr></thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Uncertain diagnoses</td><td style="padding:8px;border:1px solid #e2e8f0;">Code sign/symptom</td><td style="padding:8px;border:1px solid #e2e8f0;">Code as if confirmed</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;">Chronic conditions</td><td style="padding:8px;border:1px solid #e2e8f0;">Only if affecting care</td><td style="padding:8px;border:1px solid #e2e8f0;">All that affect care</td></tr>
  </tbody>
</table>
<h3>The Coding Process — Step by Step</h3>
<ol>
  <li>Read the entire documentation</li>
  <li>Identify diagnoses and procedures</li>
  <li>Look up the main term in the Alphabetic Index</li>
  <li>Verify the code in the Tabular List</li>
  <li>Read all instructional notes</li>
  <li>Assign the most specific code</li>
  <li>Sequence codes correctly</li>
</ol>
<div style="background:#fef9c3;border-left:4px solid #ca8a04;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Never code directly from the Alphabetic Index.</strong> Always verify in the Tabular List — the Index does not include all instructional notes or required additional characters.
</div>`
},

{
  section: 'INTRODUCTION TO MEDICAL CODING', sort: 5, type: 'quiz',
  title: 'Quiz 1: Coding Fundamentals',
  content: JSON.stringify([
    { q: "Which code set is used to report the reason a patient was seen (diagnoses and conditions)?", options: ["CPT", "HCPCS Level II", "ICD-10-CM", "APC"], answer: 2, explanation: "ICD-10-CM (International Classification of Diseases, 10th Revision, Clinical Modification) is used for diagnoses — the 'why' of the encounter." },
    { q: "What is the format of an ICD-10-CM code?", options: ["5 numeric digits", "3–7 alphanumeric characters", "1 letter followed by 4 digits", "4 digits followed by a letter"], answer: 1, explanation: "ICD-10-CM codes are 3–7 alphanumeric characters. The first character is always a letter, followed by two digits, then additional characters for specificity." },
    { q: "CPT codes are published and maintained by:", options: ["CMS (Centers for Medicare & Medicaid Services)", "CDC (Centers for Disease Control)", "AMA (American Medical Association)", "NHA (National Healthcareer Association)"], answer: 2, explanation: "CPT (Current Procedural Terminology) codes are owned and published annually by the American Medical Association (AMA)." },
    { q: "In outpatient coding, when a physician documents 'possible pneumonia,' you should code:", options: ["Pneumonia (confirmed)", "The sign or symptom that prompted the visit", "Uncertain diagnosis using a qualifier", "Nothing — wait for lab results"], answer: 1, explanation: "In outpatient settings, uncertain diagnoses ('probable,' 'possible,' 'rule out') are NOT coded. Code the sign or symptom instead." },
    { q: "HCPCS Level II codes are used primarily for:", options: ["Physician office visits and E/M services", "Surgical procedures performed in hospitals", "Durable medical equipment, drugs, and supplies not in CPT", "Diagnosis classification for insurance statistics"], answer: 2, explanation: "HCPCS Level II codes cover items and services not in CPT — including DME, ambulance, drugs billed separately, orthotics, prosthetics, and medical supplies." }
  ])
},

// SECTION 2: DIAGNOSTIC CODING — ICD-10-CM
{
  section: 'DIAGNOSTIC CODING — ICD-10-CM', sort: 6, type: 'text',
  title: 'ICD-10-CM Guidelines and Conventions',
  content: `<h2>ICD-10-CM Guidelines and Conventions</h2>
<p>The ICD-10-CM code book has two main components: the <strong>Alphabetic Index</strong> and the <strong>Tabular List</strong>. Every coding decision flows through both.</p>
<h3>The Alphabetic Index</h3>
<ul>
  <li>Look up the <strong>condition</strong>, not the body part (e.g., "fracture," not "arm")</li>
  <li>Subterms indent under the main term to show specificity</li>
  <li>Cross-references: <em>see</em> directs to another term; <em>see also</em> suggests alternatives</li>
  <li><strong>Never assign a code from the Index alone</strong> — always verify in the Tabular List</li>
</ul>
<h3>Tabular List Conventions</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
  <thead><tr style="background:#0f2b5b;color:white;"><th style="padding:8px;">Convention</th><th style="padding:8px;">Meaning</th></tr></thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Includes</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Conditions classified to this code/category</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Excludes1</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Mutually exclusive — NEVER use together</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Excludes2</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Can code separately when both conditions exist</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Use additional code</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">A secondary code is required</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Code first</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Sequence after the underlying condition</td></tr>
  </tbody>
</table>
<h3>The 7th Character</h3>
<ul>
  <li><strong>A</strong> — Initial encounter (active treatment)</li>
  <li><strong>D</strong> — Subsequent encounter (routine healing, aftercare)</li>
  <li><strong>S</strong> — Sequela (late effects after the acute phase)</li>
</ul>
<h3>Placeholder "X"</h3>
<p>The letter <strong>X</strong> is used as a placeholder when a code requires a 6th or 7th character but preceding positions are unused.</p>
<div style="background:#fef9c3;border-left:4px solid #ca8a04;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Common Exam Mistake:</strong> Forgetting placeholder X — T36.0 needs X before 7th character: T36.0<strong>X</strong>1A, not T36.01A.
</div>`
},

{ section: 'DIAGNOSTIC CODING — ICD-10-CM', sort: 7, type: 'presentation', title: 'ICD-10-CM Deep Dive', pptxKey: 'icd10' },

{
  section: 'DIAGNOSTIC CODING — ICD-10-CM', sort: 8, type: 'text',
  title: 'Coding Diseases and Conditions',
  content: `<h2>Coding Diseases and Conditions — Applying ICD-10-CM</h2>
<h3>Diabetes Mellitus Coding</h3>
<p>Diabetes coding is highly specific — combination codes capture the type of diabetes and its complication together when possible.</p>
<ul>
  <li><strong>E10.–</strong> Type 1 diabetes mellitus</li>
  <li><strong>E11.–</strong> Type 2 diabetes mellitus</li>
  <li><strong>E11.65</strong> Type 2 diabetes with hyperglycemia</li>
  <li><strong>E11.40</strong> Type 2 diabetes with diabetic neuropathy, unspecified</li>
</ul>
<p>If a patient uses insulin, add <strong>Z79.4</strong> (long-term use of insulin). If on oral hypoglycemics, add <strong>Z79.84</strong>.</p>
<h3>Hypertension and Heart Disease</h3>
<p>ICD-10-CM presumes a causal relationship between hypertension and heart failure or CKD — no physician statement of causality is needed.</p>
<ul>
  <li><strong>I11.–</strong> Hypertensive heart disease</li>
  <li><strong>I13.–</strong> Hypertensive heart and chronic kidney disease</li>
</ul>
<h3>Neoplasm Coding</h3>
<p>Use the Neoplasm Table in the Alphabetic Index. Primary malignancy is coded first; metastatic (secondary) sites are coded additionally.</p>
<h3>Z Codes</h3>
<p>Z codes report reasons for encounters other than illness or injury: preventive care, screenings, follow-up, vaccination, family history.</p>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Examples:</strong><br>
  Z23 — Encounter for immunization<br>
  Z12.31 — Screening mammogram for breast malignant neoplasm<br>
  Z79.4 — Long-term (current) use of insulin
</div>`
},

{
  section: 'DIAGNOSTIC CODING — ICD-10-CM', sort: 9, type: 'text',
  title: 'Coding Injuries and External Causes',
  content: `<h2>Coding Injuries and External Causes</h2>
<p>Chapter 19 (S00–T88) covers injuries, poisonings, and consequences of external causes. Chapter 20 (V00–Y99) covers external causes of morbidity.</p>
<h3>Injury Coding — Four Required Specifics</h3>
<ol>
  <li><strong>Type of injury</strong> (fracture, laceration, contusion, burn, dislocation)</li>
  <li><strong>Anatomic site</strong> (tibia, radius, femur, scalp)</li>
  <li><strong>Laterality</strong> (right, left, bilateral)</li>
  <li><strong>Encounter type</strong> (7th character: A = initial, D = subsequent, S = sequela)</li>
</ol>
<div style="background:#f8fafc;padding:12px 16px;border-radius:8px;font-family:monospace;margin:12px 0;">
  S52.201A — Unspecified fracture of shaft of right ulna, initial encounter for closed fracture
</div>
<h3>Poisoning vs. Adverse Effect vs. Underdosing</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
  <thead><tr style="background:#0f2b5b;color:white;"><th style="padding:8px;">Category</th><th style="padding:8px;">Definition</th><th style="padding:8px;">Sequence</th></tr></thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Poisoning</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Wrong drug, wrong dose, or recreational use</td><td style="padding:8px;border:1px solid #e2e8f0;">Poisoning code first, then manifestation</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Adverse effect</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Correct drug, correctly given, unintended reaction</td><td style="padding:8px;border:1px solid #e2e8f0;">Manifestation first, adverse effect code additional</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Underdosing</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Taking less than prescribed</td><td style="padding:8px;border:1px solid #e2e8f0;">Condition first, underdosing code additional</td></tr>
  </tbody>
</table>
<h3>External Cause Codes (V00–Y99)</h3>
<p>These secondary codes explain <em>how</em> the injury occurred, <em>where</em>, and the patient's <em>activity</em>. They are never sequenced as the primary diagnosis.</p>`
},

{
  section: 'DIAGNOSTIC CODING — ICD-10-CM', sort: 10, type: 'quiz',
  title: 'Quiz 2: ICD-10-CM Coding',
  content: JSON.stringify([
    { q: "A patient is seen for Type 2 diabetes with diabetic chronic kidney disease, Stage 3. Which sequencing rule applies?", options: ["Code CKD first, then the diabetes code", "Code the diabetes combination code first (E11.–), then the CKD stage code", "Code them in any order", "Only code the CKD since it is more severe"], answer: 1, explanation: "The diabetes code (E11.22) is sequenced first as the causal condition. The CKD stage code (N18.3) is added additionally per ICD-10-CM guidelines." },
    { q: "An Excludes1 note means:", options: ["The excluded condition can still be coded separately if the patient has both", "The two codes can never be reported together", "The excluded code should be reported additionally", "The condition is included in the code"], answer: 1, explanation: "Excludes1 indicates mutually exclusive conditions — they cannot be reported together. Excludes2 allows separate coding when both conditions coexist." },
    { q: "A patient treated for a broken wrist in the ER is returning for a cast change. What 7th character applies?", options: ["A — Initial encounter", "D — Subsequent encounter", "S — Sequela", "No 7th character needed"], answer: 1, explanation: "The 7th character D (subsequent encounter) is used for visits after the active treatment phase — routine healing, cast changes, and follow-up." },
    { q: "A patient accidentally takes too much of their own prescribed blood pressure medication. This is coded as:", options: ["Adverse effect", "Poisoning — accidental", "Underdosing", "Toxic effect"], answer: 1, explanation: "Taking more than the prescribed dose, even accidentally, is coded as poisoning — accidental (unintentional)." },
    { q: "In outpatient coding, a physician documents 'chest pain, rule out myocardial infarction.' What should be coded?", options: ["Myocardial infarction (as if confirmed)", "Chest pain (the presenting sign/symptom)", "Both chest pain and possible MI", "No code — wait until confirmed"], answer: 1, explanation: "In outpatient settings, uncertain diagnoses ('rule out,' 'possible') are NOT coded. Code the sign or symptom — chest pain." }
  ])
},

// SECTION 3: PROCEDURAL CODING — CPT
{
  section: 'PROCEDURAL CODING — CPT', sort: 11, type: 'text',
  title: 'Introduction to CPT Codes',
  content: `<h2>Introduction to CPT Codes</h2>
<p>Current Procedural Terminology (CPT) codes report medical, surgical, and diagnostic services. They are the primary mechanism through which providers communicate with insurers about what services were rendered.</p>
<h3>CPT Categories</h3>
<ul>
  <li><strong>Category I (00100–99499):</strong> Standard, widely-performed procedures — 95% of coding</li>
  <li><strong>Category II (0001F–9007F):</strong> Performance measurement tracking — optional, not billable alone</li>
  <li><strong>Category III (0019T–0781T):</strong> Emerging technologies — use over unlisted codes when available</li>
</ul>
<h3>The Six Sections of CPT Category I</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
  <thead><tr style="background:#0f2b5b;color:white;"><th style="padding:8px;">Section</th><th style="padding:8px;">Range</th><th style="padding:8px;">Content</th></tr></thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Evaluation &amp; Management</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">99202–99499</td><td style="padding:8px;border:1px solid #e2e8f0;">Office visits, hospital, nursing facility, home visits</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Anesthesia</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">00100–01999</td><td style="padding:8px;border:1px solid #e2e8f0;">Anesthesia services by body region</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Surgery</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">10004–69990</td><td style="padding:8px;border:1px solid #e2e8f0;">Surgical procedures by body system</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Radiology</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">70010–79999</td><td style="padding:8px;border:1px solid #e2e8f0;">Imaging, nuclear medicine, radiation oncology</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Pathology &amp; Laboratory</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">80047–89398</td><td style="padding:8px;border:1px solid #e2e8f0;">Lab panels, urinalysis, surgical pathology</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Medicine</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">90281–99199</td><td style="padding:8px;border:1px solid #e2e8f0;">Immunization, psychiatry, cardiology, PT</td></tr>
  </tbody>
</table>
<h3>CPT Modifiers</h3>
<ul>
  <li><strong>-25:</strong> Significant, separately identifiable E/M same day as a procedure</li>
  <li><strong>-51:</strong> Multiple procedures at the same session</li>
  <li><strong>-59:</strong> Distinct procedural service (override bundling)</li>
  <li><strong>-LT / -RT:</strong> Left side / Right side</li>
  <li><strong>-50:</strong> Bilateral procedure</li>
  <li><strong>-TC / -26:</strong> Technical / Professional component</li>
</ul>`
},

{ section: 'PROCEDURAL CODING — CPT', sort: 12, type: 'presentation', title: 'CPT Coding in Practice', pptxKey: 'cpt' },

{
  section: 'PROCEDURAL CODING — CPT', sort: 13, type: 'text',
  title: 'Evaluation & Management (E/M) Coding',
  content: `<h2>Evaluation &amp; Management (E/M) Coding</h2>
<p>E/M codes are the most frequently reported CPT codes. The 2021 AMA guidelines significantly changed how office/outpatient codes are selected.</p>
<h3>2021 Guidelines — Office/Outpatient Visits</h3>
<p>Since January 1, 2021, codes 99202–99215 are selected based on <strong>one</strong> of two factors:</p>
<ol>
  <li><strong>Medical Decision Making (MDM)</strong> — complexity of problems, data reviewed, risk</li>
  <li><strong>Total Time</strong> — total time on the date of the encounter (on or off face-to-face)</li>
</ol>
<p><em>History and physical exam no longer determine the code level for office visits.</em></p>
<h3>New vs. Established Patient</h3>
<ul>
  <li><strong>New:</strong> No professional services from physician (or same specialty group) in past <strong>3 years</strong></li>
  <li><strong>Established:</strong> Received services within past 3 years</li>
</ul>
<h3>E/M Code Reference</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;">
  <thead><tr style="background:#0f2b5b;color:white;"><th style="padding:8px;">Code</th><th style="padding:8px;">Patient</th><th style="padding:8px;">MDM</th><th style="padding:8px;">Time</th></tr></thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">99202</td><td style="padding:8px;border:1px solid #e2e8f0;">New</td><td style="padding:8px;border:1px solid #e2e8f0;">Straightforward</td><td style="padding:8px;border:1px solid #e2e8f0;">15–29 min</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;">99203</td><td style="padding:8px;border:1px solid #e2e8f0;">New</td><td style="padding:8px;border:1px solid #e2e8f0;">Low</td><td style="padding:8px;border:1px solid #e2e8f0;">30–44 min</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">99204</td><td style="padding:8px;border:1px solid #e2e8f0;">New</td><td style="padding:8px;border:1px solid #e2e8f0;">Moderate</td><td style="padding:8px;border:1px solid #e2e8f0;">45–59 min</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;">99205</td><td style="padding:8px;border:1px solid #e2e8f0;">New</td><td style="padding:8px;border:1px solid #e2e8f0;">High</td><td style="padding:8px;border:1px solid #e2e8f0;">60–74 min</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">99212</td><td style="padding:8px;border:1px solid #e2e8f0;">Established</td><td style="padding:8px;border:1px solid #e2e8f0;">Straightforward</td><td style="padding:8px;border:1px solid #e2e8f0;">10–19 min</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;">99213</td><td style="padding:8px;border:1px solid #e2e8f0;">Established</td><td style="padding:8px;border:1px solid #e2e8f0;">Low</td><td style="padding:8px;border:1px solid #e2e8f0;">20–29 min</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">99214</td><td style="padding:8px;border:1px solid #e2e8f0;">Established</td><td style="padding:8px;border:1px solid #e2e8f0;">Moderate</td><td style="padding:8px;border:1px solid #e2e8f0;">30–39 min</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;">99215</td><td style="padding:8px;border:1px solid #e2e8f0;">Established</td><td style="padding:8px;border:1px solid #e2e8f0;">High</td><td style="padding:8px;border:1px solid #e2e8f0;">40–54 min</td></tr>
  </tbody>
</table>`
},

{
  section: 'PROCEDURAL CODING — CPT', sort: 14, type: 'text',
  title: 'Surgical, Radiology, Lab & Medicine Codes',
  content: `<h2>Surgical, Radiology, Lab &amp; Medicine Codes</h2>
<h3>Surgery Section (10004–69990)</h3>
<ul>
  <li><strong>Global surgical package:</strong> Includes preop (day before), procedure, and standard postop (90 days major / 10 days minor)</li>
  <li><strong>Separate procedure:</strong> Typically bundled; billed alone only when it is the only service rendered</li>
  <li><strong>Add-on codes (✦):</strong> Always reported with a primary code; never subject to multiple procedure reduction</li>
</ul>
<h3>Radiology Section (70010–79999)</h3>
<ul>
  <li><strong>-TC (Technical Component):</strong> Equipment, supplies, technician — billed by hospital/imaging center</li>
  <li><strong>-26 (Professional Component):</strong> Physician interpretation and report — billed by radiologist</li>
  <li><strong>Global (no modifier):</strong> Both TC and PC billed by the same provider</li>
</ul>
<h3>Pathology &amp; Laboratory (80047–89398)</h3>
<p>Lab panels group related tests. Use the panel code if ALL tests in the panel are performed. If only some are done, code each test individually.</p>
<div style="background:#f8fafc;padding:12px 16px;border-radius:8px;font-family:monospace;margin:12px 0;">
  80053 — Comprehensive metabolic panel (14 tests bundled)<br>
  85025 — CBC with differential
</div>
<h3>Medicine Section (90281–99199)</h3>
<ul>
  <li><strong>Vaccines:</strong> Two codes — the vaccine product (90xxx) + immunization administration (90460 or 90471)</li>
  <li>90460 = administration with physician counseling, patients ≤18 years</li>
  <li>90471 = administration, no physician counseling or patient ≥19 years</li>
</ul>
<div style="background:#ecfdf5;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>✓ Scenario:</strong> A 5-year-old gets influenza vaccine (90686) with nurse administration (90471) — bill both. If a physician counsels the child and family, use 90460 for administration instead.
</div>`
},

{
  section: 'PROCEDURAL CODING — CPT', sort: 15, type: 'quiz',
  title: 'Quiz 3: CPT Coding',
  content: JSON.stringify([
    { q: "A physician sees an established patient for 25 minutes with low complexity MDM. Which CPT code?", options: ["99212", "99213", "99214", "99203"], answer: 1, explanation: "99213 is for established patient office visits with low complexity MDM or 20–29 minutes of total time." },
    { q: "Which modifier indicates that a procedure was performed on the left side?", options: ["-50", "-51", "-LT", "-RT"], answer: 2, explanation: "Modifier -LT indicates the left side; -RT the right side. -50 is for bilateral procedures." },
    { q: "A radiologist interprets an X-ray taken at a hospital that owns the equipment. What modifier does the radiologist use?", options: ["-TC", "-26", "-59", "No modifier"], answer: 1, explanation: "Modifier -26 (Professional Component) is used when the radiologist provides only the interpretation and report." },
    { q: "Which is TRUE about CPT add-on codes?", options: ["They can be billed as standalone codes", "They are always reported with a primary code and are not subject to multiple procedure reduction", "They require modifier -51", "They are used only for E/M services"], answer: 1, explanation: "Add-on codes must always be reported with a primary code and are never subject to multiple procedure reduction; modifier -51 is not used with them." },
    { q: "A 5-year-old receives a vaccine. The physician personally counsels the family. What administration code?", options: ["90471", "90460", "90472", "99211"], answer: 1, explanation: "CPT 90460 is the administration code when a physician or QHP personally counsels patients through 18 years of age." }
  ])
},

// SECTION 4: THE MEDICAL BILLING PROCESS
{
  section: 'THE MEDICAL BILLING PROCESS', sort: 16, type: 'text',
  title: 'The Revenue Cycle',
  content: `<h2>The Medical Billing Revenue Cycle</h2>
<p>The revenue cycle is the complete financial process from the moment a patient schedules an appointment to the moment final payment is collected.</p>
<h3>The 10 Steps of the Revenue Cycle</h3>
<ol>
  <li><strong>Patient pre-registration</strong> — collect demographic and insurance information</li>
  <li><strong>Insurance eligibility verification</strong> — confirm coverage is active and benefits apply</li>
  <li><strong>Patient check-in</strong> — verify information, collect copayments</li>
  <li><strong>Medical coding</strong> — assign ICD-10-CM, CPT, and HCPCS codes</li>
  <li><strong>Charge capture</strong> — enter all billable services into the billing system</li>
  <li><strong>Claim submission</strong> — electronic claims (837P/837I) sent via clearinghouse</li>
  <li><strong>Claim adjudication</strong> — payer processes the claim (pays, denies, or partially pays)</li>
  <li><strong>Remittance Advice (EOB/ERA)</strong> — payer returns explanation of benefits</li>
  <li><strong>Patient statement</strong> — patient billed for remaining balance</li>
  <li><strong>Collections</strong> — follow up on unpaid accounts</li>
</ol>
<h3>Key Insurance Terms</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
  <thead><tr style="background:#0f2b5b;color:white;"><th style="padding:8px;">Term</th><th style="padding:8px;">Definition</th></tr></thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Premium</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Monthly payment to maintain coverage</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Deductible</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Amount patient pays before insurance activates</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Copayment</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Fixed amount per visit (e.g., $25)</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Coinsurance</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Shared % after deductible (e.g., 80/20)</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Prior authorization</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Advance approval for certain services</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>COB</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Coordination of Benefits — determines which insurer pays first</td></tr>
  </tbody>
</table>
<h3>Timely Filing Limits</h3>
<ul>
  <li><strong>Medicare:</strong> 1 year from date of service</li>
  <li><strong>Medicaid:</strong> Varies by state (90 days to 1 year)</li>
  <li><strong>Commercial:</strong> 90–180 days (per provider contract)</li>
</ul>`
},

{ section: 'THE MEDICAL BILLING PROCESS', sort: 17, type: 'presentation', title: 'Medical Billing & Revenue Cycle', pptxKey: 'billing' },

{
  section: 'THE MEDICAL BILLING PROCESS', sort: 18, type: 'text',
  title: 'Insurance Claims Processing',
  content: `<h2>Insurance Claims Processing</h2>
<h3>The CMS-1500 Form — Key Boxes</h3>
<ul>
  <li><strong>Box 1:</strong> Type of insurance (Medicare, Medicaid, commercial)</li>
  <li><strong>Box 21:</strong> ICD-10-CM diagnosis codes (up to 12)</li>
  <li><strong>Box 24D:</strong> CPT/HCPCS procedure codes (up to 6 line items)</li>
  <li><strong>Box 24E:</strong> Diagnosis pointer (links procedure to diagnosis)</li>
  <li><strong>Box 33:</strong> Billing provider NPI and address</li>
</ul>
<h3>Electronic Claims — 837 Transactions</h3>
<ul>
  <li><strong>837P (Professional):</strong> Physician offices, outpatient services</li>
  <li><strong>837I (Institutional):</strong> Hospitals, SNFs, home health</li>
</ul>
<p>Claims travel through a <strong>clearinghouse</strong> that scrubs them for errors before forwarding to the payer.</p>
<h3>Claim Adjudication Steps</h3>
<ol>
  <li>Eligibility check — is the patient covered on date of service?</li>
  <li>Medical necessity review — does the diagnosis support the procedure?</li>
  <li>Benefit determination — is this service covered?</li>
  <li>Payment calculation — apply deductible, coinsurance, allowed amount</li>
</ol>
<h3>Common Denial Reason Codes</h3>
<ul>
  <li><strong>CO-11:</strong> Diagnosis inconsistent with procedure</li>
  <li><strong>CO-97:</strong> Payment included in global service (bundling)</li>
  <li><strong>PR-1:</strong> Deductible applied — patient responsibility</li>
  <li><strong>PR-2:</strong> Coinsurance — patient responsibility</li>
  <li><strong>CO-167:</strong> Diagnosis not covered</li>
</ul>`
},

{
  section: 'THE MEDICAL BILLING PROCESS', sort: 19, type: 'text',
  title: 'Medicare, Medicaid & Managing Denials',
  content: `<h2>Medicare, Medicaid &amp; Managing Denials</h2>
<h3>Medicare Parts</h3>
<ul>
  <li><strong>Part A:</strong> Hospital inpatient, SNF, hospice, home health</li>
  <li><strong>Part B:</strong> Physician services, outpatient, DME, preventive care</li>
  <li><strong>Part C (Medicare Advantage):</strong> Private plans providing Part A+B benefits</li>
  <li><strong>Part D:</strong> Prescription drug coverage</li>
</ul>
<p><strong>Medicare fee schedule:</strong> Based on Relative Value Units (RVUs) × Geographic Adjustment Factor × Conversion Factor.</p>
<p><strong>Participating (PAR) providers</strong> accept assignment on all Medicare claims. <strong>Non-PAR</strong> providers may charge up to 115% of the fee schedule.</p>
<h3>Medicaid</h3>
<p>Joint federal-state program for low-income individuals. Each state runs its own program. Reimbursement rates are typically lower than Medicare. <strong>Dual eligibles</strong> (Medicare + Medicaid): Medicare is always primary.</p>
<h3>Managing Denials — Appeals Process</h3>
<ol>
  <li>Review the denial reason code and remark code</li>
  <li>Determine if it's a coding error or a legitimate dispute</li>
  <li>Correct and resubmit if the error is on your side (corrected claim)</li>
  <li>File a formal appeal if you disagree with the payer</li>
</ol>
<h3>Medicare Appeals — 5 Levels</h3>
<ol>
  <li>Redetermination by the MAC — 120 days to file</li>
  <li>Reconsideration by a Qualified Independent Contractor (QIC)</li>
  <li>Administrative Law Judge (ALJ) hearing</li>
  <li>Medicare Appeals Council Review</li>
  <li>Federal District Court Review</li>
</ol>
<div style="background:#fef9c3;border-left:4px solid #ca8a04;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Key:</strong> A corrected claim replaces the original with corrected information. An appeal is filed when the claim was correct but improperly denied.
</div>`
},

{
  section: 'THE MEDICAL BILLING PROCESS', sort: 20, type: 'quiz',
  title: 'Quiz 4: Medical Billing',
  content: JSON.stringify([
    { q: "Which CMS-1500 form box contains ICD-10-CM diagnosis codes?", options: ["Box 11", "Box 21", "Box 24D", "Box 33"], answer: 1, explanation: "Box 21 on CMS-1500 holds up to 12 ICD-10-CM diagnosis codes. Box 24D is for CPT/HCPCS procedure codes." },
    { q: "A Medicare claim denial shows reason code PR-1. This means:", options: ["Provider is not enrolled in Medicare", "Service is not covered", "Patient's deductible was applied — patient is responsible", "Claim was filed after timely filing limit"], answer: 2, explanation: "PR-1 indicates the patient's deductible was applied. PR codes indicate Patient Responsibility." },
    { q: "What is the timely filing deadline for Medicare claims?", options: ["90 days", "6 months", "1 year", "2 years"], answer: 2, explanation: "Medicare requires claims to be filed within 1 year (12 months) from the date of service." },
    { q: "A patient is 65+ with Medicare and employer Blue Cross. Which payer is primary?", options: ["Blue Cross — commercial always pays first", "Medicare — government always pays first", "Whichever has the lower deductible", "Depends on employer size — if 20+ employees, Blue Cross is primary"], answer: 3, explanation: "For patients 65+ with Medicare and employer insurance: if the employer has 20+ employees, the employer's plan is primary; Medicare is secondary." },
    { q: "The first step in the Medicare appeals process is:", options: ["Filing with OIG", "Requesting a redetermination from the MAC within 120 days", "Requesting an ALJ hearing", "Submitting a corrected claim"], answer: 1, explanation: "Level 1 of Medicare appeals is a Redetermination by the MAC within 120 days of the initial determination." }
  ])
},

// SECTION 5: COMPLIANCE & ETHICS
{
  section: 'COMPLIANCE & ETHICS', sort: 21, type: 'text',
  title: 'HIPAA Compliance in Medical Coding',
  content: `<h2>HIPAA Compliance in Medical Coding &amp; Billing</h2>
<p>The Health Insurance Portability and Accountability Act (HIPAA) of 1996 is the cornerstone of healthcare privacy and security law. Medical coders and billers handle Protected Health Information (PHI) every day.</p>
<h3>What Is PHI?</h3>
<p>Any individually identifiable health information transmitted or maintained in any form — electronic, paper, or verbal — by a covered entity. This includes name, address, DOB, SSN, medical record numbers, diagnoses, procedures, and test results.</p>
<h3>The Three HIPAA Rules</h3>
<ol>
  <li><strong>Privacy Rule:</strong> Governs use and disclosure of PHI. Patients have rights to access records, request amendments, and receive accounting of disclosures.</li>
  <li><strong>Security Rule:</strong> Requires administrative, physical, and technical safeguards to protect ePHI.</li>
  <li><strong>Breach Notification Rule:</strong> Notify affected individuals within 60 days of discovering a breach. Breaches of 500+ in a state require media notification and HHS reporting.</li>
</ol>
<h3>Minimum Necessary Standard</h3>
<p>Covered entities must limit PHI use and disclosure to the <strong>minimum necessary</strong> to accomplish the purpose. Coders should access only the records needed for their specific work.</p>
<h3>Business Associate Agreements (BAA)</h3>
<p>When PHI is shared with a vendor (billing company, coding service, clearinghouse), a signed BAA is required. It defines permissible PHI uses and security obligations.</p>
<div style="background:#fef9c3;border-left:4px solid #ca8a04;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ HIPAA Penalties:</strong><br>
  Unknowing violation: $100–$50,000 per violation<br>
  Willful neglect (corrected): $10,000–$50,000<br>
  Willful neglect (not corrected): $50,000/violation (max $1.9M/year)<br>
  Criminal: up to 10 years imprisonment
</div>`
},

{ section: 'COMPLIANCE & ETHICS', sort: 22, type: 'presentation', title: 'Compliance & Ethics in Medical Coding', pptxKey: 'compliance' },

{
  section: 'COMPLIANCE & ETHICS', sort: 23, type: 'text',
  title: 'Fraud, Abuse & Coding Ethics',
  content: `<h2>Fraud, Abuse &amp; Coding Ethics</h2>
<h3>Fraud vs. Abuse</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
  <thead><tr style="background:#0f2b5b;color:white;"><th style="padding:8px;">Concept</th><th style="padding:8px;">Definition</th><th style="padding:8px;">Intent</th></tr></thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Fraud</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Intentional deception for financial gain</td><td style="padding:8px;border:1px solid #e2e8f0;">Intentional</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Abuse</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">Improper practices that increase costs</td><td style="padding:8px;border:1px solid #e2e8f0;">May be unintentional</td></tr>
  </tbody>
</table>
<h3>Common Fraud Schemes</h3>
<ul>
  <li><strong>Upcoding:</strong> Billing a higher-level code than documented</li>
  <li><strong>Unbundling:</strong> Billing components separately that belong as one comprehensive code</li>
  <li><strong>Phantom billing:</strong> Charging for services never provided</li>
  <li><strong>Double billing:</strong> Billing the same service twice</li>
  <li><strong>Kickbacks:</strong> Paying or receiving value for referrals</li>
</ul>
<h3>Key Laws</h3>
<ul>
  <li><strong>False Claims Act (FCA):</strong> Civil penalties $13K–$26K per false claim + treble damages. Qui tam whistleblowers receive 15–30% of government recovery.</li>
  <li><strong>Anti-Kickback Statute (AKS):</strong> Criminal penalties for referral payments.</li>
  <li><strong>Stark Law:</strong> Prohibits physician self-referrals to entities with a financial relationship.</li>
</ul>
<h3>Coder's Ethical Responsibility</h3>
<ul>
  <li>Code only what is documented — never infer diagnoses</li>
  <li>Do not change codes to get a claim paid when documentation does not support it</li>
  <li>Report concerns through proper compliance channels</li>
  <li>Maintain patient confidentiality at all times</li>
</ul>
<div style="background:#ecfdf5;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>✓ Bottom Line:</strong> If a physician asks you to change a code to something not supported by documentation — refuse. This is a legal and ethical requirement, not a judgment call.
</div>`
},

{
  section: 'COMPLIANCE & ETHICS', sort: 24, type: 'quiz',
  title: 'Quiz 5: Compliance & Ethics',
  content: JSON.stringify([
    { q: "A biller submits a 99215 when documentation only supports 99213. This is:", options: ["Unbundling", "Upcoding", "Phantom billing", "COB error"], answer: 1, explanation: "Upcoding means billing a higher-level code than documentation supports, receiving higher payment than warranted. This is healthcare fraud." },
    { q: "HIPAA's Minimum Necessary Standard requires:", options: ["All employees have full record access for efficiency", "PHI is shared only with patients upon request", "PHI use is limited to what is necessary for the purpose", "Patients consent to all coding activities"], answer: 2, explanation: "The Minimum Necessary Standard limits PHI use, disclosure, and requests to the minimum needed to accomplish the intended purpose." },
    { q: "A physician receives $200 gift cards for every Medicare referral to a home health agency. This violates:", options: ["HIPAA Privacy Rule", "False Claims Act only", "Anti-Kickback Statute", "Stark Law only"], answer: 2, explanation: "The Anti-Kickback Statute prohibits receiving anything of value in exchange for referrals to entities providing federally covered services." },
    { q: "A breach affects 650 patients in Texas. What notifications are required?", options: ["Notify 650 patients within 60 days only", "Notify patients within 60 days, notify HHS, and provide Texas media notice", "Notify HHS only", "No notification if encryption was used"], answer: 1, explanation: "Breaches affecting 500+ in a state require: patient notification within 60 days, HHS notification, and prominent media notice in the affected state." },
    { q: "Which law allows a private citizen to sue on behalf of the government against a fraudulent provider and receive a portion of the recovery?", options: ["Anti-Kickback Statute", "Stark Law", "False Claims Act — qui tam provision", "HIPAA Security Rule"], answer: 2, explanation: "The FCA's qui tam provision allows whistleblowers (relators) to file suits on the government's behalf and receive 15–30% of the recovery if successful." }
  ])
},

// SECTION 6: CBCS EXAM PREPARATION
{
  section: 'CBCS EXAM PREPARATION', sort: 25, type: 'text',
  title: 'CBCS Exam Overview & Blueprint',
  content: `<h2>CBCS Exam Overview &amp; Blueprint</h2>
<h3>Exam Format</h3>
<ul>
  <li><strong>Questions:</strong> 100 scored + up to 20 pretest (not scored)</li>
  <li><strong>Time:</strong> 3 hours</li>
  <li><strong>Format:</strong> Multiple choice, computer-based</li>
  <li><strong>Passing score:</strong> 390 out of 500 (scaled)</li>
  <li><strong>Renewal:</strong> Every 2 years — 10 CE credits required</li>
</ul>
<h3>CBCS Exam Content Domains</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
  <thead><tr style="background:#0f2b5b;color:white;"><th style="padding:8px;">Domain</th><th style="padding:8px;">% of Exam</th></tr></thead>
  <tbody>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Medical Terminology</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">17%</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Anatomy &amp; Physiology</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">17%</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>ICD-10-CM Coding</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">22%</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>CPT / HCPCS Coding</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">22%</td></tr>
    <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Medical Billing</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">17%</td></tr>
    <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Compliance</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">5%</td></tr>
  </tbody>
</table>
<h3>Exam Day Tips</h3>
<ul>
  <li>Read every question completely before looking at answers</li>
  <li>Eliminate obviously wrong answers first</li>
  <li>Trust the official guidelines — not what "sounds right"</li>
  <li>Budget ~1.5 minutes per question (100 questions / 3 hours)</li>
  <li>Flag difficult questions and return to them</li>
</ul>
<p>You are almost ready. Complete the final 20-question practice exam in the next lesson. A score of 80%+ indicates strong CBCS exam readiness.</p>`
},

{ section: 'CBCS EXAM PREPARATION', sort: 26, type: 'presentation', title: 'CBCS Exam Strategy', pptxKey: 'cbcs-prep' },

{
  section: 'CBCS EXAM PREPARATION', sort: 27, type: 'quiz',
  title: 'Final Assessment: CBCS Practice Exam',
  content: JSON.stringify([
    { q: "The medical term suffix '-itis' means:", options: ["Surgical removal", "Inflammation", "Disease of", "Tumor"], answer: 1, explanation: "-itis means inflammation. Example: appendicitis (inflammation of the appendix)." },
    { q: "The cardiovascular system consists of:", options: ["Heart, lungs, and diaphragm", "Heart, blood vessels, and blood", "Heart, kidneys, and liver", "Arteries and veins only"], answer: 1, explanation: "The cardiovascular system includes the heart, blood vessels (arteries, veins, capillaries), and blood." },
    { q: "An Excludes1 note means:", options: ["The condition is included in this code", "Excluded conditions may be coded separately if both exist", "Two codes represent mutually exclusive conditions — cannot be reported together", "An additional code is required"], answer: 2, explanation: "Excludes1 = mutually exclusive conditions that can never be coded together for the same patient." },
    { q: "A Type 2 diabetic uses insulin. What additional code is required?", options: ["Z79.4 — Long-term use of insulin", "E11.649 — Type 2 DM with hypoglycemia", "Z96.41 — Insulin pump status", "No additional code needed"], answer: 0, explanation: "ICD-10-CM guidelines require adding Z79.4 (Long-term use of insulin) when a Type 2 diabetic uses insulin." },
    { q: "ICD-10-CM Chapter 5 (F01–F99) contains codes for:", options: ["Respiratory diseases", "Mental, behavioral, and neurodevelopmental disorders", "Injuries and trauma", "Neoplasms"], answer: 1, explanation: "Chapter 5 (F01–F99) covers Mental, Behavioral, and Neurodevelopmental Disorders including depression, anxiety, schizophrenia, and substance use." },
    { q: "Under 2021 E/M guidelines, CPT 99213 for an established patient requires:", options: ["Detailed history and expanded physical", "Low complexity MDM or 20–29 minutes of total time", "Moderate complexity MDM or 30–39 minutes", "Straightforward MDM or 10–19 minutes"], answer: 1, explanation: "99213 (established patient) requires low complexity MDM or 20–29 minutes of total time on the date of service." },
    { q: "Modifier -25 indicates:", options: ["A bilateral procedure", "A significant, separately identifiable E/M on the same day as a procedure", "A reduced service", "A distinct procedural service"], answer: 1, explanation: "Modifier -25 allows billing a significant, separately identifiable E/M service performed by the same physician on the same day as a procedure." },
    { q: "CPT code range for Evaluation & Management:", options: ["10004–69990", "70010–79999", "90281–99199", "99202–99499"], answer: 3, explanation: "E/M codes run from 99202–99499, covering office visits, hospital care, emergency department, and other management services." },
    { q: "A radiologist reads a hospital X-ray but does not own the equipment. What modifier?", options: ["-TC", "-26", "-59", "-52"], answer: 1, explanation: "Modifier -26 (Professional Component) is used when the physician provides only interpretation and report, not the technical service." },
    { q: "HCPCS Level II codes are primarily maintained by:", options: ["AMA", "CMS", "CDC", "WHO"], answer: 1, explanation: "HCPCS Level II codes are maintained by CMS (Centers for Medicare & Medicaid Services), updated quarterly." },
    { q: "The 837P electronic transaction is used for:", options: ["Institutional hospital claims", "Professional physician and outpatient claims", "Pharmacy claims", "Eligibility verification"], answer: 1, explanation: "837P (Professional) is the electronic claim transaction for physician and outpatient professional services." },
    { q: "A Medicare patient with 20% coinsurance has met their deductible. Allowed amount is $100. Patient owes:", options: ["$0", "$20", "$80", "$100"], answer: 1, explanation: "Medicare Part B pays 80% after deductible. Patient coinsurance = 20% × $100 = $20." },
    { q: "Correct sequencing for injury coding:", options: ["External cause code first, then injury code", "Injury code first, then external cause code additionally", "Symptom code first", "Physician determines sequencing"], answer: 1, explanation: "Injury codes (Chapter 19) are sequenced first. External cause codes (Chapter 20) are always secondary — never the principal/first-listed diagnosis." },
    { q: "The False Claims Act qui tam provision allows:", options: ["Medicare to audit without notice", "Private individuals to sue on behalf of the government and share the recovery", "Providers to dispute Medicare denials in federal court", "OIG to exclude providers"], answer: 1, explanation: "Qui tam allows whistleblowers to file FCA lawsuits on behalf of the government. If successful, relators receive 15–30% of the recovery." },
    { q: "A patient has hypertension and congestive heart failure. Per ICD-10-CM guidelines:", options: ["Code separately — I10 and I50.9", "A causal relationship is assumed — use I11.0 (hypertensive heart disease with HF)", "Only code the more severe condition (CHF)", "Query the physician about causality"], answer: 1, explanation: "ICD-10-CM assumes causality between hypertension and heart failure — use I11.0 without requiring the physician to document 'due to.'" },
    { q: "Medicare Part B covers:", options: ["Hospital inpatient stays", "Physician services, outpatient, DME, preventive", "Medicare Advantage plans", "Prescription drugs"], answer: 1, explanation: "Part B covers physician services, outpatient hospital, DME, and preventive services. Part A covers inpatient hospital and SNF." },
    { q: "Billing components of a procedure separately when they should be one comprehensive code is:", options: ["Upcoding", "Unbundling", "Phantom billing", "Double billing"], answer: 1, explanation: "Unbundling = reporting multiple codes for components that belong as one comprehensive code. NCCI edits detect and prevent this." },
    { q: "A patient takes too much of their own prescribed medication accidentally. ICD-10-CM classifies this as:", options: ["Adverse effect", "Poisoning — accidental (unintentional)", "Underdosing", "Therapeutic misadventure"], answer: 1, explanation: "Taking too much of a prescribed drug, even accidentally, is poisoning — accidental (unintentional). Adverse effect = correct drug, correctly given, unintended reaction." },
    { q: "HIPAA breach notification must be sent to affected individuals within:", options: ["30 days", "45 days", "60 days", "90 days"], answer: 2, explanation: "HIPAA requires notification to individuals within 60 days of discovering a breach of unsecured PHI." },
    { q: "A new patient is seen for 48 minutes with moderate complexity MDM. Which E/M code?", options: ["99203", "99204", "99213", "99214"], answer: 1, explanation: "99204 = new patient, moderate complexity MDM or 45–59 minutes of total time." }
  ])
}
];

// ─── PPTX SLIDE DATA ──────────────────────────────────────────────────────────
const pptxSlides = {
  intro: [
    { type:'title', title:'Medical Coding & Billing', subtitle:'CBCS Certification Preparation — NHA Academy' },
    { type:'content', title:'What is Medical Coding?', bullets:['Translates clinical documentation into standardized codes','ICD-10-CM: diagnoses — the WHY of the encounter','CPT: procedures — the WHAT was done','HCPCS Level II: DME, drugs, and supplies not in CPT','Enables insurance reimbursement across all US healthcare settings'] },
    { type:'content', title:'The Three Code Sets', bullets:['ICD-10-CM — 3–7 alphanumeric characters, published by CDC/CMS','CPT — 5-digit numeric codes (00100–99499), published by AMA','HCPCS Level II — 1 letter + 4 digits (A0000–V9999), published by CMS','Each code set serves a distinct and specific purpose','Coding accuracy directly determines healthcare revenue'] },
    { type:'content', title:'Your Credential: NHA CBCS', bullets:['100 scored questions + up to 20 pretest items','3-hour exam, computer-based at PSI centers or remote proctored','Domains: Terminology (17%), A&P (17%), ICD-10 (22%), CPT (22%), Billing (17%), Compliance (5%)','Passing score: 390 out of 500 (scaled)','Renew every 2 years — 10 continuing education credits required'] },
    { type:'content', title:'The Coding Process', bullets:['Step 1: Read the entire clinical documentation','Step 2: Identify all diagnoses and procedures','Step 3: Look up main term in Alphabetic Index','Step 4: Verify code in the Tabular List — READ all instructional notes','Step 5: Assign most specific code, apply modifiers, sequence correctly'] },
  ],
  icd10: [
    { type:'title', title:'ICD-10-CM Diagnostic Coding', subtitle:'Mastering the Official Guidelines — CBCS Domain 3' },
    { type:'content', title:'ICD-10-CM Code Structure', bullets:['3–7 alphanumeric characters','First character: always a letter (A–Z)','Characters 2–3: two digits','Characters 4–7: additional specificity after the decimal','Always code to the highest specificity supported by documentation'] },
    { type:'content', title:'Tabular List Conventions', bullets:['Includes — conditions/terms classified to this code','Excludes1 — mutually exclusive, NEVER use together','Excludes2 — can code separately if both conditions exist simultaneously','Use additional code — secondary code is required','Code first — sequence after the underlying causal condition','Code also — additional code may be needed, sequence not specified'] },
    { type:'content', title:'The 7th Character & Placeholder X', bullets:['A — Initial encounter (active treatment phase)','D — Subsequent encounter (routine healing, cast change, aftercare)','S — Sequela (late effects after the acute phase ends)','Required for injuries, fractures, burns, poisonings','Placeholder X fills unused 5th/6th positions before the 7th character','Example: T36.0X1A — penicillin poisoning, accidental, initial encounter'] },
    { type:'content', title:'Key Outpatient vs. Inpatient Rules', bullets:['Outpatient: NEVER code "probable," "suspected," or "rule out" — code signs/symptoms','Inpatient: CODE uncertain diagnoses as if confirmed after workup','Combination codes: use when one code captures condition + complication','Z codes: preventive care, screenings, vaccinations, family history','Hypertension + heart failure: ICD-10 assumes causality (I11.0) — no "due to" needed'] },
  ],
  cpt: [
    { type:'title', title:'CPT Procedural Coding', subtitle:'Current Procedural Terminology — CBCS Domain 4' },
    { type:'content', title:'CPT Code Book — Three Categories', bullets:['Category I (00100–99499): Standard, widely-performed procedures','Category II (0001F–9007F): Performance measurement — optional, not billable alone','Category III (0019T–0781T): Emerging technologies — use over unlisted codes','Six Category I sections: E/M · Anesthesia · Surgery · Radiology · Lab · Medicine','Annual updates by the AMA — effective January 1 each year'] },
    { type:'content', title:'2021 E/M Guidelines — Office Visits', bullets:['Select code by MDM complexity OR total time on date of encounter','New patient: no professional services from same physician/specialty in 3 years','99202=New/Straight(15-29min) | 99203=New/Low(30-44min) | 99204=New/Mod(45-59min)','99212=Est/Straight(10-19min) | 99213=Est/Low(20-29min) | 99214=Est/Mod(30-39min)','History and physical examination NO LONGER determine code selection'] },
    { type:'content', title:'Critical CPT Modifiers', bullets:['-25: Significant E/M same day as procedure (bill both)','-26: Professional component (physician interpretation only)','-TC: Technical component (equipment and technician only)','-50: Bilateral procedure performed at same session','-59 / XE / XP / XS / XU: Distinct procedural service (unbundling override)','-LT / -RT: Left side / Right side laterality'] },
    { type:'content', title:'Surgery Global Package & Special Rules', bullets:['Major surgery: 90-day global period includes preop + procedure + postop','Minor surgery: 10-day global period','E/M on day of minor procedure: add modifier -25 to bill E/M separately','Add-on codes (✦): always with primary code, never modifier -51','Lab panels: use panel code if ALL tests performed; else code individually','Vaccines: bill product code (90xxx) + administration code (90460 or 90471)'] },
  ],
  billing: [
    { type:'title', title:'Medical Billing & Revenue Cycle', subtitle:'From Scheduling to Payment — CBCS Domain 5' },
    { type:'content', title:'The 10-Step Revenue Cycle', bullets:['1. Patient pre-registration — demographics & insurance','2. Eligibility verification — confirm coverage is active','3. Check-in — verify info, collect copay/balance','4. Medical coding — ICD-10-CM, CPT, HCPCS','5. Charge capture — all billable services entered','6. Claim submission — 837P/837I via clearinghouse','7. Payer adjudication — pay, deny, or partial pay','8. Remittance Advice (EOB/ERA) — explanation of payment','9. Patient statement — bill remaining balance','10. Collections — follow up unpaid accounts'] },
    { type:'content', title:'Key Insurance Concepts', bullets:['Premium: monthly payment to maintain coverage','Deductible: patient pays first before insurance activates','Copayment: fixed amount per visit (e.g., $25 per office visit)','Coinsurance: percentage shared after deductible (e.g., 80/20)','Out-of-pocket maximum: patient\'s annual spending ceiling','Prior authorization: advance approval for certain services or medications','COB: Coordination of Benefits — determines payer order for dual-coverage patients'] },
    { type:'content', title:'Medicare Parts A, B, C & D', bullets:['Part A: Hospital inpatient, SNF, hospice, some home health — funded by payroll taxes','Part B: Physician services, outpatient, DME, preventive — monthly premium (~$185/mo)','Part C (Advantage): Private plans providing A+B benefits, often with added coverage','Part D: Prescription drug coverage through private plans','Dual eligibles (Medicare + Medicaid): Medicare is ALWAYS primary payer','Timely filing limit: 1 year from date of service for Medicare claims'] },
    { type:'content', title:'Denial Management & Appeals', bullets:['CO codes: Contractual Obligation — provider write-off (not billable to patient)','PR codes: Patient Responsibility — bill the patient','CO-11: Diagnosis inconsistent with procedure | CO-97: Service bundled','PR-1: Deductible applied | PR-2: Coinsurance | CO-167: Diagnosis not covered','Level 1 Medicare Appeal: Redetermination by MAC — file within 120 days','Corrected claim (replaces original) vs. appeal (disputes denial)'] },
  ],
  compliance: [
    { type:'title', title:'Compliance & Ethics in Coding', subtitle:'HIPAA, Fraud Prevention & Professional Standards — CBCS Domain 6' },
    { type:'content', title:'HIPAA — Three Rules', bullets:['Privacy Rule: governs use and disclosure of PHI — patients have access rights','Security Rule: administrative, physical, and technical safeguards for ePHI','Breach Notification: notify individuals within 60 days of discovering a breach','500+ affected in a state: also notify HHS and prominent media outlets','Minimum Necessary Standard: limit PHI access to what is needed for the task'] },
    { type:'content', title:'PHI & HIPAA Penalties', bullets:['PHI = any individually identifiable health information in any form','ePHI = electronic PHI subject to Security Rule safeguards','Business Associate Agreement (BAA) required when sharing PHI with vendors','Unknowing violation: $100–$50,000 per violation','Willful neglect, not corrected: $50,000/violation, max $1.9M/year','Criminal: up to 10 years imprisonment for intentional violations'] },
    { type:'content', title:'Healthcare Fraud & Abuse', bullets:['Fraud: intentional deception — upcoding, phantom billing, kickbacks, double billing','Abuse: improper practices increasing costs — may be unintentional','Upcoding: billing higher level than documentation supports','Unbundling: separating services that should be one comprehensive code','Anti-Kickback Statute: criminal penalties for referral payments','Stark Law: prohibits physician self-referrals with financial relationships'] },
    { type:'content', title:'False Claims Act & Coder Ethics', bullets:['FCA: civil penalties $13K–$26K per false claim + treble damages','Qui tam: whistleblowers file on government\'s behalf, receive 15–30% of recovery','OIG Exclusion: banned from Medicare/Medicaid participation','Code ONLY what is documented — never assume or infer diagnoses','Do not change codes to get a claim paid without supporting documentation','Report compliance concerns — never accept payment contingent on claim outcome'] },
  ],
  'cbcs-prep': [
    { type:'title', title:'CBCS Exam Preparation', subtitle:'Final Review — Strategies for Exam Day Success' },
    { type:'content', title:'CBCS Exam Blueprint', bullets:['Medical Terminology: 17% (~17 questions)','Anatomy & Physiology: 17% (~17 questions)','ICD-10-CM Coding: 22% (~22 questions)','CPT / HCPCS Coding: 22% (~22 questions)','Medical Billing: 17% (~17 questions)','Compliance & Ethics: 5% (~5 questions)','Total: 100 scored questions in 3 hours'] },
    { type:'content', title:'High-Yield Topics by Domain', bullets:['ICD-10-CM: Excludes1 vs. Excludes2, 7th character, outpatient vs. inpatient rules, Z codes','CPT: 2021 E/M guidelines, new vs. established, key modifiers (-25, -26, -TC, -50, -59)','Billing: Medicare Parts A/B/C/D, CMS-1500 key boxes, timely filing limits, COB','Compliance: HIPAA breach 60-day rule, FCA qui tam, AKS vs. Stark Law','Always: code to highest specificity, never code outpatient uncertain diagnoses'] },
    { type:'content', title:'Exam Day Strategy', bullets:['Read every answer option before selecting — all four choices matter','Eliminate clearly wrong answers — often two can be ruled out quickly','Coding questions: trust official guidelines, not common sense alone','Budget 1.5 minutes per question (100 questions / 180 minutes)','Flag uncertain questions and return — do not leave any blank','For remote exam: test equipment 24 hours ahead, have valid photo ID ready'] },
    { type:'content', title:'You Are Ready — Next Steps', bullets:['Complete the 20-question Final Assessment in the next lesson','Target 80%+ before scheduling your CBCS exam','Review any weak domain using this course','Schedule exam at a PSI testing center or request remote proctoring','Credential valid 2 years — 10 CE credits needed for renewal','Average starting salary for CBCS-certified coders: $38,000–$50,000/year'] },
  ]
};

// ─── PPTX BUILDER ─────────────────────────────────────────────────────────────
const BLUE='1e3a5f', LBLUE='2563eb', WHITE='ffffff', ACCENT='0ea5e9';

function makePptx(key) {
  const slides = pptxSlides[key];
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  slides.forEach(slide => {
    const s = pptx.addSlide();
    if (slide.type === 'title') {
      s.addShape(pptx.ShapeType.rect, { x:0,y:0,w:'100%',h:'100%',fill:{color:BLUE} });
      s.addShape(pptx.ShapeType.rect, { x:0,y:'75%',w:'100%',h:'25%',fill:{color:LBLUE} });
      s.addText(slide.title,    { x:0.5,y:1.2,w:8.5,h:1.5,fontSize:38,bold:true,color:WHITE,fontFace:'Calibri' });
      s.addText(slide.subtitle||'', { x:0.5,y:2.9,w:8.5,h:0.6,fontSize:16,color:'93c5fd',fontFace:'Calibri',italic:true });
      s.addText('NHA Academy | CBCS Certification Prep', { x:0.5,y:4.7,w:8.5,h:0.4,fontSize:12,color:'bfdbfe',fontFace:'Calibri' });
    } else {
      s.addShape(pptx.ShapeType.rect, { x:0,y:0,w:'100%',h:1.0,fill:{color:BLUE} });
      s.addShape(pptx.ShapeType.rect, { x:0,y:1.0,w:0.08,h:'100%',fill:{color:LBLUE} });
      s.addText(slide.title, { x:0.25,y:0.15,w:9.0,h:0.7,fontSize:22,bold:true,color:WHITE,fontFace:'Calibri' });
      (slide.bullets||[]).forEach((b,i) => {
        s.addShape(pptx.ShapeType.rect, { x:0.4,y:1.15+i*0.52,w:0.1,h:0.1,fill:{color:ACCENT},line:{color:ACCENT} });
        s.addText(b, { x:0.62,y:1.08+i*0.52,w:8.8,h:0.48,fontSize:13,color:'1e293b',fontFace:'Calibri' });
      });
    }
  });
  return pptx;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const db = await mysql.createPool(DB);

  await db.execute('DELETE FROM lessons WHERE course_id = ?', [COURSE_ID]);
  console.log('Cleared existing lessons for course', COURSE_ID);

  for (const lesson of lessons) {
    if (lesson.type === 'presentation') {
      const ts = Date.now();
      const fname = `${ts}-cbcs-${lesson.pptxKey}.pptx`;
      const fpath = path.join(UPLOADS_DIR, fname);
      await makePptx(lesson.pptxKey).writeFile({ fileName: fpath });
      console.log('Generated:', fname);
      const [r] = await db.execute(
        'INSERT INTO lessons (course_id,section_title,title,slug,type,sort_order,file_path,content) VALUES (?,?,?,?,?,?,?,?)',
        [COURSE_ID, lesson.section, lesson.title, slug(lesson.title), 'presentation', lesson.sort, '/uploads/'+fname, null]
      );
      console.log(`  ✓ [${lesson.sort}] presentation: ${lesson.title} (id=${r.insertId})`);
    } else {
      const [r] = await db.execute(
        'INSERT INTO lessons (course_id,section_title,title,slug,type,sort_order,content) VALUES (?,?,?,?,?,?,?)',
        [COURSE_ID, lesson.section, lesson.title, slug(lesson.title), lesson.type, lesson.sort, lesson.content]
      );
      console.log(`  ✓ [${lesson.sort}] ${lesson.type}: ${lesson.title} (id=${r.insertId})`);
    }
  }

  console.log(`\nDone! Course ${COURSE_ID} populated with ${lessons.length} lessons.`);
  await db.end();
}

main().catch(e => { console.error(e); process.exit(1); });
