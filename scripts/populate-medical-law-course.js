const mysql = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = '/var/www/nationalhealthcareer-com/public/uploads';
const COURSE_ID = 9;
const DB = { host: 'localhost', user: 'admin_nhca', password: '2u95#I7jm', database: 'nha_db' };

let _n = 0;
function slug(title) {
  _n++;
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150) + '-c9-' + _n;
}

// ─── PPTX GENERATOR ───────────────────────────────────────────────────────────
function makePptx(key) {
  const decks = {
    'law-foundations': {
      title: 'Legal Foundations in Healthcare',
      slides: [
        { heading: 'Legal Foundations in Healthcare', body: 'Healthcare is one of the most heavily regulated industries in the United States. Understanding the law protects patients, providers, and the entire healthcare system.' },
        { heading: 'Sources of Healthcare Law', body: '• Constitutional Law – fundamental rights\n• Statutory Law – laws passed by legislatures\n• Administrative Law – regulations from agencies (CMS, FDA, OSHA)\n• Common Law – court decisions and precedents' },
        { heading: 'Civil vs. Criminal Law', body: 'Civil Law: disputes between individuals or organizations (malpractice suits, contract breaches)\n\nCriminal Law: offenses against the state (fraud, abuse, assault)\n\nHealthcare professionals can face both civil and criminal liability.' },
        { heading: 'The Court System', body: '• Federal Courts – federal law, interstate issues\n• State Courts – most malpractice and licensing cases\n• Appeals Courts – review lower court decisions\n• Supreme Court – final interpreter of the Constitution' },
        { heading: 'Key Takeaways', body: '✓ Law comes from multiple sources\n✓ Both civil and criminal law apply to healthcare\n✓ Administrative agencies create binding regulations\n✓ Every healthcare worker is subject to legal accountability' },
      ]
    },
    'hipaa-privacy': {
      title: 'HIPAA and Patient Privacy',
      slides: [
        { heading: 'HIPAA: The Privacy Rule', body: 'The Health Insurance Portability and Accountability Act (1996) established national standards for protecting patient health information (PHI). Violations can result in fines up to $1.9 million per violation category per year.' },
        { heading: 'Protected Health Information (PHI)', body: 'PHI includes any information that can identify a patient:\n• Names, addresses, dates\n• Phone numbers, email addresses\n• Social Security numbers\n• Medical record numbers\n• Photographs\n• Any unique identifiers' },
        { heading: 'Patient Rights Under HIPAA', body: '• Right to access their own records\n• Right to request amendments\n• Right to an accounting of disclosures\n• Right to request restrictions on use\n• Right to confidential communications\n• Right to file a complaint with HHS' },
        { heading: 'The HIPAA Security Rule', body: 'Applies to Electronic PHI (ePHI). Requires:\n• Administrative safeguards (training, policies)\n• Physical safeguards (locked records, screen privacy)\n• Technical safeguards (encryption, access controls, audit logs)' },
        { heading: 'HIPAA Breach Notification', body: 'Covered entities must notify:\n• Affected individuals within 60 days\n• HHS Secretary annually (or immediately if 500+)\n• Media outlets if 500+ residents in a state affected\n\nBusiness Associates must notify covered entities within 60 days.' },
      ]
    },
    'ethics': {
      title: 'Ethical Decision-Making in Healthcare',
      slides: [
        { heading: 'The Four Principles of Medical Ethics', body: '1. Autonomy – respect the patient\'s right to decide\n2. Beneficence – act in the patient\'s best interest\n3. Non-maleficence – "First, do no harm"\n4. Justice – fair distribution of healthcare resources' },
        { heading: 'Informed Consent', body: 'For consent to be valid, patients must be:\n• Competent to make decisions\n• Fully informed of risks, benefits, and alternatives\n• Free from coercion\n\nSigned forms document consent but are not consent itself — the conversation is.' },
        { heading: 'Ethical Dilemmas in Practice', body: 'Common dilemmas:\n• Confidentiality vs. duty to warn\n• Patient autonomy vs. family wishes\n• Resource allocation in emergencies\n• End-of-life decisions and advance directives\n• Cultural and religious conflicts with treatment' },
        { heading: 'Ethical Decision-Making Framework', body: '1. Identify the ethical problem\n2. Gather relevant facts\n3. Identify stakeholders\n4. Apply ethical principles\n5. Consider legal obligations\n6. Choose a course of action\n7. Evaluate the outcome' },
        { heading: 'Professional Ethics Codes', body: '• AMA Code of Medical Ethics (physicians)\n• ANA Code of Ethics (nursing)\n• AHIMA Standards of Ethical Coding\n• NHA Code of Ethics (certification holders)\n\nAll emphasize patient welfare, honesty, and professional integrity.' },
      ]
    },
    'liability': {
      title: 'Liability, Risk Management & Documentation',
      slides: [
        { heading: 'Medical Malpractice', body: 'Malpractice occurs when a healthcare provider\'s negligence causes patient harm.\n\nFour elements must be proven:\n1. Duty – provider-patient relationship existed\n2. Breach – standard of care was violated\n3. Causation – breach caused the injury\n4. Damages – measurable harm resulted' },
        { heading: 'Standard of Care', body: 'The level of care a reasonably competent healthcare professional in the same specialty would provide under similar circumstances.\n\nDetermined by:\n• Expert witness testimony\n• Clinical guidelines and protocols\n• Professional association standards' },
        { heading: 'Types of Torts', body: 'Intentional Torts:\n• Assault (threatening harm)\n• Battery (unlawful touching)\n• Invasion of privacy\n• Defamation\n\nUnintentional Torts:\n• Negligence (most common in healthcare)\n• Gross negligence' },
        { heading: 'Documentation as Legal Protection', body: '"If it wasn\'t documented, it wasn\'t done."\n\n• Accurate, timely, complete records are essential\n• Alterations are illegal — use addenda instead\n• Electronic Health Records (EHRs) create audit trails\n• Proper documentation reduces liability and supports billing' },
        { heading: 'Risk Management Strategies', body: '• Follow established protocols and procedures\n• Obtain informed consent before procedures\n• Communicate clearly with patients and families\n• Document all care and patient communications\n• Report incidents promptly using proper channels\n• Maintain professional liability insurance' },
      ]
    },
    'compliance': {
      title: 'OSHA, CLIA & Workplace Safety',
      slides: [
        { heading: 'OSHA in Healthcare', body: 'The Occupational Safety and Health Administration sets and enforces workplace safety standards.\n\nKey healthcare standards:\n• Bloodborne Pathogen Standard\n• Hazard Communication (HazCom)\n• Personal Protective Equipment (PPE)\n• Needlestick Safety and Prevention Act' },
        { heading: 'Bloodborne Pathogen Standard', body: 'Employers must provide:\n• Exposure Control Plan\n• Hepatitis B vaccination at no cost\n• PPE (gloves, gowns, masks, eye protection)\n• Post-exposure evaluation and follow-up\n• Training at hire and annually\n\nUniversal/Standard Precautions apply to ALL patients.' },
        { heading: 'CLIA: Clinical Laboratory Standards', body: 'Clinical Laboratory Improvement Amendments regulate laboratory testing.\n\nCLIA Categories:\n• Waived tests (simple, low risk – glucose meters)\n• Moderate complexity\n• High complexity\n\nAll labs must be certified. Certificate level determines oversight requirements.' },
        { heading: 'ADA and Healthcare', body: 'Americans with Disabilities Act prohibits discrimination:\n• In employment (Title I)\n• In public accommodations (Title III)\n\nHealthcare settings must:\n• Provide reasonable accommodations\n• Ensure physical accessibility\n• Offer effective communication (interpreters, aids)' },
        { heading: 'Federal Compliance Programs', body: 'Key agencies and laws:\n• CMS – Centers for Medicare & Medicaid Services\n• OIG – Office of Inspector General (fraud enforcement)\n• False Claims Act – prohibits fraudulent billing\n• Anti-Kickback Statute – prohibits payment for referrals\n• Stark Law – physician self-referral restrictions' },
      ]
    },
    'exam-prep': {
      title: 'Exam Strategy: Medical Law and Ethics',
      slides: [
        { heading: 'What the Exam Tests', body: 'Medical law and ethics questions appear in nearly every NHA certification exam.\n\nKey domains:\n• HIPAA and patient privacy\n• Informed consent\n• Scope of practice\n• Medical records law\n• Malpractice and liability\n• Professional ethics standards' },
        { heading: 'High-Frequency Topics', body: '✓ Elements of negligence (duty, breach, causation, damages)\n✓ HIPAA PHI and permissible disclosures\n✓ Advance directives (living will, healthcare proxy, DNR)\n✓ Mandatory reporting requirements\n✓ Scope of practice violations\n✓ Patient rights (autonomy, privacy, informed consent)' },
        { heading: 'Common Exam Traps', body: '• Confusing assault (threat) with battery (contact)\n• Mixing up HIPAA Privacy Rule vs. Security Rule\n• Forgetting that minors CAN consent to certain care (STIs, pregnancy, mental health — varies by state)\n• Assuming verbal consent is always insufficient (it\'s valid but harder to prove)\n• Confusing respondeat superior with corporate negligence' },
        { heading: 'Study Strategy', body: '1. Master the four ethics principles — every scenario maps to one\n2. Know HIPAA disclosures that don\'t require authorization (TPO, public health, law enforcement)\n3. Understand mandatory reporting: abuse, communicable diseases, gunshot wounds\n4. Memorize the four malpractice elements\n5. Review scope of practice for your specific credential' },
        { heading: 'Final Checklist', body: '□ HIPAA Privacy and Security Rules\n□ Patient rights (HIPAA + state law)\n□ Four bioethical principles\n□ Informed consent requirements\n□ Advance directives types\n□ Four malpractice elements\n□ OSHA bloodborne pathogen standard\n□ Mandatory reporting obligations\n□ Documentation standards\n□ Employment law basics' },
      ]
    },
  };

  const deck = decks[key];
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deck.title;

  const NAVY = '0f2b5b';
  const BLUE = '1d4ed8';
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

  const filename = `${Date.now()}-mle-${key}.pptx`;
  const filepath = path.join(UPLOADS_DIR, filename);
  pptx.writeFile({ fileName: filepath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

// ─── LESSON DATA ──────────────────────────────────────────────────────────────
const lessons = [

// ═══════════════════════════════════════════════════════════════
// SECTION 1: FOUNDATIONS OF HEALTHCARE LAW
// ═══════════════════════════════════════════════════════════════
{
  section: 'FOUNDATIONS OF HEALTHCARE LAW', sort: 1, type: 'text',
  title: 'Welcome to Medical Law and Ethics',
  content: `<h2>Welcome to Medical Law and Ethics</h2>
<p>Every healthcare professional — regardless of their role — operates within a complex web of laws, regulations, and ethical obligations. Understanding these rules is not optional. Violating them can result in patient harm, loss of licensure, civil lawsuits, and even criminal prosecution.</p>
<h3>Why This Course Matters</h3>
<p>Medical law governs what healthcare providers <em>must</em> do. Medical ethics guides what they <em>should</em> do. Together, they define the boundaries of professional conduct in healthcare and protect patients from harm and exploitation.</p>
<h3>What You Will Learn</h3>
<ul>
  <li>The sources and structure of healthcare law in the United States</li>
  <li>Patient rights, including HIPAA privacy protections and informed consent</li>
  <li>The four core principles of biomedical ethics</li>
  <li>How malpractice and negligence are defined and litigated</li>
  <li>Federal regulations: OSHA, CLIA, the False Claims Act, and more</li>
  <li>Professional ethical standards across healthcare roles</li>
</ul>
<h3>How This Applies to Your Career</h3>
<p>Whether you work as a medical assistant, phlebotomist, coder, or administrative professional, you will face situations that require legal and ethical judgment. This course gives you the knowledge to make the right call — and to protect yourself, your employer, and your patients.</p>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>📋 NHA Exam Relevance:</strong> Medical law and ethics content appears across all NHA certification exams — CCMA, CBCS, CPT, CET, and CMAA. Mastery of this material directly improves your exam performance.
</div>
<h3>Course Structure</h3>
<ol>
  <li>Foundations of Healthcare Law</li>
  <li>Patient Rights and HIPAA</li>
  <li>Medical Ethics</li>
  <li>Medical Liability and Negligence</li>
  <li>Regulatory Compliance</li>
  <li>Exam Preparation and Final Assessment</li>
</ol>`
},
{
  section: 'FOUNDATIONS OF HEALTHCARE LAW', sort: 2, type: 'presentation',
  title: 'Legal Foundations in Healthcare',
  pptxKey: 'law-foundations',
},
{
  section: 'FOUNDATIONS OF HEALTHCARE LAW', sort: 3, type: 'text',
  title: 'Sources of Healthcare Law',
  content: `<h2>Sources of Healthcare Law</h2>
<p>Healthcare law in the United States comes from multiple sources that interact and sometimes conflict with each other. Healthcare professionals must navigate all of them.</p>

<h3>1. Constitutional Law</h3>
<p>The U.S. Constitution is the supreme law of the land. Constitutional provisions relevant to healthcare include:</p>
<ul>
  <li><strong>Due Process (5th and 14th Amendments):</strong> Government cannot deprive individuals of life, liberty, or property without due process — including medical license revocations.</li>
  <li><strong>Equal Protection (14th Amendment):</strong> Prohibits discrimination in healthcare access by government entities.</li>
  <li><strong>Privacy rights:</strong> Though not explicitly stated, courts have recognized a constitutional right to privacy that underpins decisions about reproductive health, end-of-life care, and more.</li>
</ul>

<h3>2. Statutory Law</h3>
<p>Laws passed by Congress or state legislatures. Key examples:</p>
<ul>
  <li><strong>HIPAA (1996):</strong> Patient privacy and data security</li>
  <li><strong>ADA (1990):</strong> Disability rights in healthcare settings</li>
  <li><strong>EMTALA (1986):</strong> Emergency treatment obligations</li>
  <li><strong>False Claims Act:</strong> Prohibits fraudulent billing to federal programs</li>
  <li><strong>State Medical Practice Acts:</strong> Define licensure and scope of practice</li>
</ul>

<h3>3. Administrative (Regulatory) Law</h3>
<p>Federal and state agencies create regulations that have the force of law:</p>
<ul>
  <li><strong>CMS:</strong> Centers for Medicare & Medicaid Services — billing, coverage, and facility regulations</li>
  <li><strong>OSHA:</strong> Workplace safety standards</li>
  <li><strong>FDA:</strong> Drug and device approval and safety</li>
  <li><strong>State Health Departments:</strong> Licensing, inspections, public health reporting</li>
</ul>

<h3>4. Common Law</h3>
<p>Judge-made law developed through court decisions over time. Establishes precedents (prior rulings that guide future cases). Medical malpractice law is largely built on common law principles.</p>

<h3>5. Contractual Law</h3>
<p>Healthcare relationships often involve contracts:</p>
<ul>
  <li>Employment contracts between providers and hospitals</li>
  <li>Provider contracts with insurance companies</li>
  <li>Patient consent forms (which have contractual elements)</li>
</ul>

<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Key Principle:</strong> When federal and state laws conflict, federal law generally prevails (Supremacy Clause). However, states can provide <em>greater</em> protections than federal minimums — for example, stronger state privacy laws.
</div>`
},
{
  section: 'FOUNDATIONS OF HEALTHCARE LAW', sort: 4, type: 'text',
  title: 'The Legal System and Healthcare Providers',
  content: `<h2>The Legal System and Healthcare Providers</h2>
<p>Healthcare providers interact with the legal system in ways that differ from most professions. Understanding how courts, licensing boards, and regulatory bodies operate is essential for every healthcare worker.</p>

<h3>Licensure and Scope of Practice</h3>
<p>Each state defines the legal scope of practice for healthcare professionals through licensing laws. Scope of practice specifies:</p>
<ul>
  <li>What tasks a professional is legally permitted to perform</li>
  <li>What level of supervision is required</li>
  <li>What conditions must be met (education, certification, continuing education)</li>
</ul>
<p>Practicing outside your scope of practice is illegal and can result in license revocation, civil liability, and criminal charges. When in doubt, ask a supervisor.</p>

<h3>Civil vs. Criminal Liability</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;">
    <th style="padding:8px;text-align:left;">Aspect</th>
    <th style="padding:8px;text-align:left;">Civil Law</th>
    <th style="padding:8px;text-align:left;">Criminal Law</th>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:8px;border:1px solid #e2e8f0;">Parties</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Individual vs. individual/organization</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Government vs. individual</td>
  </tr>
  <tr>
    <td style="padding:8px;border:1px solid #e2e8f0;">Purpose</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Compensate the victim</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Punish the offender</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:8px;border:1px solid #e2e8f0;">Burden of proof</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Preponderance of evidence</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Beyond reasonable doubt</td>
  </tr>
  <tr>
    <td style="padding:8px;border:1px solid #e2e8f0;">Outcome</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Monetary damages</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Fines, imprisonment</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:8px;border:1px solid #e2e8f0;">Healthcare examples</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Malpractice, breach of contract</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Medicare fraud, assault, drug diversion</td>
  </tr>
</table>

<h3>Respondeat Superior</h3>
<p>Latin for "let the master answer." Under this doctrine, employers are legally responsible for the negligent acts of their employees performed within the scope of employment. This means:</p>
<ul>
  <li>If a medical assistant makes an error while following a physician's order, the physician and practice may share liability</li>
  <li>Employers have strong incentives to train staff and enforce safe practices</li>
  <li>Employees are <em>not</em> protected if they were acting outside their scope or contrary to policy</li>
</ul>

<h3>Mandatory Reporting Laws</h3>
<p>Healthcare workers are legally required to report certain conditions, regardless of patient confidentiality:</p>
<ul>
  <li>Suspected child, elder, or dependent adult abuse or neglect</li>
  <li>Communicable diseases (TB, STIs, foodborne illness)</li>
  <li>Gunshot wounds and certain injuries</li>
  <li>Deaths in certain circumstances (coroner notification)</li>
</ul>
<p>Failure to report when required is itself a legal violation. Good faith reporting is protected from liability even if the report proves unfounded.</p>`
},
{
  section: 'FOUNDATIONS OF HEALTHCARE LAW', sort: 5, type: 'quiz',
  title: 'Quiz 1: Healthcare Law Foundations',
  content: JSON.stringify([
    {
      q: 'Which amendment to the U.S. Constitution most directly protects patients\' right to privacy in medical decisions?',
      options: ['First Amendment', 'Fourth Amendment', '14th Amendment (Due Process)', 'Tenth Amendment'],
      answer: 2,
      explanation: 'The Supreme Court has grounded constitutional privacy rights — including those related to healthcare decisions — in the liberty clause of the 14th Amendment\'s Due Process clause.'
    },
    {
      q: 'A medical assistant performs a procedure that is within a registered nurse\'s scope of practice but outside the MA\'s. This is best described as:',
      options: ['Malpractice', 'Practicing outside scope of practice', 'Battery', 'Respondeat superior'],
      answer: 1,
      explanation: 'Performing tasks beyond your legally authorized scope of practice is a violation of state licensure law, regardless of whether harm occurs.'
    },
    {
      q: 'Under respondeat superior, who bears legal responsibility for an employee\'s negligent act committed within the scope of employment?',
      options: ['Only the employee', 'Only the patient', 'The employer', 'The state licensing board'],
      answer: 2,
      explanation: 'Respondeat superior makes employers vicariously liable for employees\' negligent acts performed within the scope of their employment duties.'
    },
    {
      q: 'Which type of law is primarily created by court decisions that set legal precedents?',
      options: ['Statutory law', 'Administrative law', 'Common law', 'Constitutional law'],
      answer: 2,
      explanation: 'Common law (also called case law or judge-made law) is developed through court decisions that establish precedents binding on lower courts.'
    },
    {
      q: 'A healthcare worker suspects a patient is being abused at home. Regarding mandatory reporting, the worker should:',
      options: ['Wait for the patient to confirm the abuse before reporting', 'Report only if they are certain abuse occurred', 'Report based on reasonable suspicion, even without confirmation', 'Keep the information confidential per HIPAA'],
      answer: 2,
      explanation: 'Mandatory reporting laws require reporting based on reasonable suspicion — not certainty. Good faith reports are protected from liability. HIPAA explicitly permits disclosures required by law.'
    },
  ])
},

// ═══════════════════════════════════════════════════════════════
// SECTION 2: PATIENT RIGHTS AND HIPAA
// ═══════════════════════════════════════════════════════════════
{
  section: 'PATIENT RIGHTS AND HIPAA', sort: 6, type: 'text',
  title: 'Patient Rights and Informed Consent',
  content: `<h2>Patient Rights and Informed Consent</h2>
<p>Patients in the United States have legally recognized rights that protect their dignity, autonomy, and safety. Healthcare workers must respect these rights as both a legal and ethical obligation.</p>

<h3>The Patient's Bill of Rights</h3>
<p>While there is no single federal Patient's Bill of Rights, patients in most healthcare settings have the right to:</p>
<ul>
  <li><strong>Receive care</strong> without discrimination based on race, color, national origin, disability, age, or sex</li>
  <li><strong>Be informed</strong> about their diagnosis, treatment options, risks, and prognosis in terms they can understand</li>
  <li><strong>Make decisions</strong> about their care, including the right to refuse treatment</li>
  <li><strong>Privacy and confidentiality</strong> of their medical information</li>
  <li><strong>Access their medical records</strong> and request corrections</li>
  <li><strong>Receive emergency care</strong> regardless of ability to pay (EMTALA)</li>
  <li><strong>File complaints</strong> without fear of retaliation</li>
</ul>

<h3>Informed Consent</h3>
<p>Informed consent is the process by which a patient voluntarily agrees to a medical procedure or treatment after receiving complete, understandable information. It is both a legal requirement and an ethical cornerstone.</p>

<h4>Elements of Valid Informed Consent</h4>
<ol>
  <li><strong>Disclosure:</strong> The provider explains the diagnosis, proposed treatment, expected benefits, material risks, and available alternatives</li>
  <li><strong>Comprehension:</strong> The patient understands the information (language interpreter or other aids provided if needed)</li>
  <li><strong>Voluntariness:</strong> The patient decides freely, without coercion or undue influence</li>
  <li><strong>Capacity:</strong> The patient is legally and cognitively competent to make the decision</li>
  <li><strong>Authorization:</strong> The patient gives explicit agreement (verbal or written)</li>
</ol>

<h4>Who Cannot Give Informed Consent</h4>
<ul>
  <li>Minors (in most cases — a parent or legal guardian must consent)</li>
  <li>Individuals who have been declared legally incompetent</li>
  <li>Individuals who are temporarily incapacitated (unconscious, severely intoxicated)</li>
</ul>

<h4>Exceptions to Informed Consent</h4>
<ul>
  <li><strong>Emergency exception:</strong> When immediate action is required to save life or prevent serious harm and the patient cannot consent</li>
  <li><strong>Therapeutic privilege:</strong> Rarely, if disclosure would cause significant harm (this exception is narrowly interpreted)</li>
  <li><strong>Waiver:</strong> Patient explicitly states they don't want information and delegates decisions</li>
</ul>

<h3>Minor Consent Laws</h3>
<p>Most states allow minors to consent to certain types of care without parental involvement, including:</p>
<ul>
  <li>Treatment for sexually transmitted infections (STIs)</li>
  <li>Contraception services</li>
  <li>Mental health and substance abuse treatment</li>
  <li>Pregnancy-related care</li>
</ul>
<p>Specific rules vary by state. Always consult your facility's policies.</p>

<div style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Important Distinction:</strong> A signed consent form is documentation that consent was obtained — it is <em>not</em> the consent itself. Consent is the informed conversation. If a patient signs a form without understanding it, valid consent has not occurred.
</div>`
},
{
  section: 'PATIENT RIGHTS AND HIPAA', sort: 7, type: 'presentation',
  title: 'HIPAA and Patient Privacy',
  pptxKey: 'hipaa-privacy',
},
{
  section: 'PATIENT RIGHTS AND HIPAA', sort: 8, type: 'text',
  title: 'Medical Records and Release of Information',
  content: `<h2>Medical Records and Release of Information</h2>
<p>Medical records are both a clinical tool and a legal document. They belong to the healthcare provider or facility, but patients have a legal right to access them. Managing records and information release correctly is one of the most critical compliance responsibilities in healthcare.</p>

<h3>Ownership of Medical Records</h3>
<ul>
  <li><strong>The physical record</strong> (paper or electronic) belongs to the healthcare provider/facility</li>
  <li><strong>The information</strong> in the record belongs to the patient</li>
  <li>Patients have the right to access, copy, and request amendments to their records</li>
  <li>Under HIPAA, providers must respond to patient access requests within <strong>30 days</strong></li>
</ul>

<h3>Authorization to Release Information</h3>
<p>A valid HIPAA-compliant authorization must include:</p>
<ul>
  <li>A description of the information to be disclosed</li>
  <li>The name of the person/organization receiving the information</li>
  <li>The purpose of the disclosure</li>
  <li>An expiration date or event</li>
  <li>The patient's signature and date</li>
  <li>A statement that the patient may revoke authorization</li>
</ul>

<h3>Permitted Disclosures WITHOUT Authorization</h3>
<p>HIPAA allows (and sometimes requires) disclosure without patient authorization in specific situations:</p>
<ul>
  <li><strong>Treatment, Payment, Operations (TPO):</strong> Sharing within the care team or for billing is permitted</li>
  <li><strong>Public health:</strong> Communicable disease reporting, vital statistics</li>
  <li><strong>Law enforcement:</strong> Court orders, subpoenas, certain investigations</li>
  <li><strong>Abuse/neglect reporting:</strong> Required by state law</li>
  <li><strong>Serious threat to health or safety:</strong> Disclosure to prevent imminent harm</li>
  <li><strong>Deceased individuals:</strong> For certain purposes, PHI of the deceased may be disclosed</li>
</ul>

<h3>Minimum Necessary Standard</h3>
<p>Even for permitted disclosures, covered entities must share only the <em>minimum amount of PHI necessary</em> to accomplish the purpose. You should not access a coworker's record out of curiosity, even though you have system access — that is a HIPAA violation.</p>

<h3>Medical Records Retention</h3>
<p>Retention requirements vary by state, but common standards:</p>
<ul>
  <li>Adult records: typically 7–10 years after last treatment</li>
  <li>Minor records: until the patient reaches age of majority plus the state's standard period</li>
  <li>HIPAA requires policies and documentation (not records themselves) be retained 6 years</li>
</ul>

<h3>Amendment Requests</h3>
<p>Patients may request amendments to their records. Providers may deny if the record was not created by the facility or is accurate and complete. If denied, the patient has the right to submit a written disagreement, which becomes part of the record.</p>`
},
{
  section: 'PATIENT RIGHTS AND HIPAA', sort: 9, type: 'text',
  title: 'Advance Directives and End-of-Life Decisions',
  content: `<h2>Advance Directives and End-of-Life Decisions</h2>
<p>Advance directives are legal documents that allow individuals to express their healthcare wishes in advance, in case they become unable to communicate those wishes. Every healthcare professional must understand these documents and respect them.</p>

<h3>Types of Advance Directives</h3>

<h4>Living Will</h4>
<p>A written statement specifying which treatments a person does or does not want if they become terminally ill or permanently unconscious. Common provisions include:</p>
<ul>
  <li>Whether to use mechanical ventilation</li>
  <li>Whether to receive artificial nutrition/hydration</li>
  <li>Preferences for pain management and comfort care</li>
  <li>Organ donation wishes</li>
</ul>

<h4>Healthcare Power of Attorney (Healthcare Proxy)</h4>
<p>A legal document that designates a specific person (the healthcare proxy or agent) to make medical decisions on behalf of the patient when they cannot. The agent should:</p>
<ul>
  <li>Know and respect the patient's values and wishes</li>
  <li>Communicate effectively with the medical team</li>
  <li>Be available in an emergency</li>
</ul>

<h4>Do Not Resuscitate (DNR) Order</h4>
<p>A physician's order (not just a patient directive) that instructs healthcare providers not to perform CPR if the patient's heart stops or breathing ceases. DNR orders must:</p>
<ul>
  <li>Be signed by the attending physician</li>
  <li>Be documented in the medical record</li>
  <li>Be honored by all providers across care settings (POLST/MOLST forms help with this)</li>
</ul>

<h4>POLST / MOLST</h4>
<p>Physician Orders for Life-Sustaining Treatment (POLST) or Medical Orders for Life-Sustaining Treatment (MOLST) translate patient wishes into actionable medical orders, especially useful for patients with serious illness or frailty. Unlike advance directives, these are physician-signed medical orders.</p>

<h3>Patient Self-Determination Act (1990)</h3>
<p>Federal law that requires healthcare facilities receiving Medicare/Medicaid to:</p>
<ul>
  <li>Inform patients of their right to make healthcare decisions</li>
  <li>Ask if patients have an advance directive</li>
  <li>Document advance directive status in the medical record</li>
  <li>Not discriminate based on whether a patient has an advance directive</li>
  <li>Educate staff and the community about advance directives</li>
</ul>

<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>💡 Your Role:</strong> As a healthcare professional, you are responsible for checking whether advance directives are on file and ensuring they are accessible to the care team. Never ignore or override a documented advance directive.
</div>

<h3>Competency vs. Capacity</h3>
<ul>
  <li><strong>Competency</strong> is a legal determination made by a court</li>
  <li><strong>Capacity</strong> is a clinical determination made by a physician — whether the patient can understand information and make a reasoned decision <em>at this moment</em></li>
  <li>A patient can have fluctuating capacity (e.g., in and out of confusion) and still be legally competent</li>
</ul>`
},
{
  section: 'PATIENT RIGHTS AND HIPAA', sort: 10, type: 'quiz',
  title: 'Quiz 2: Patient Rights & Privacy',
  content: JSON.stringify([
    {
      q: 'Under HIPAA, how long does a covered entity have to respond to a patient\'s request to access their medical records?',
      options: ['10 business days', '15 calendar days', '30 days (with a possible 30-day extension)', '60 days'],
      answer: 2,
      explanation: 'HIPAA requires covered entities to respond to access requests within 30 days. A one-time 30-day extension is allowed if the entity notifies the patient in writing.'
    },
    {
      q: 'A patient presents to the ER unconscious after a car accident. No family is reachable. Which exception to informed consent applies?',
      options: ['Therapeutic privilege', 'Waiver', 'Emergency exception', 'Minor consent exception'],
      answer: 2,
      explanation: 'The emergency exception allows treatment without consent when the patient is incapacitated, immediate action is needed, and there is no time to obtain consent from a surrogate.'
    },
    {
      q: 'A hospital may share a patient\'s PHI with another provider for treatment purposes:',
      options: ['Only with written patient authorization', 'Without authorization under the TPO exception', 'Only if the patient is unconscious', 'Never, under any circumstances'],
      answer: 1,
      explanation: 'HIPAA permits disclosure for Treatment, Payment, and Operations (TPO) without patient authorization. Sharing records with another provider involved in the patient\'s care is a classic TPO disclosure.'
    },
    {
      q: 'Which document designates a specific person to make medical decisions if the patient becomes incapacitated?',
      options: ['Living will', 'DNR order', 'Healthcare power of attorney', 'POLST form'],
      answer: 2,
      explanation: 'A healthcare power of attorney (or healthcare proxy) designates an agent to make medical decisions on the patient\'s behalf. A living will states the patient\'s own treatment preferences.'
    },
    {
      q: 'Under the Minimum Necessary Standard, when may a healthcare worker access a coworker\'s medical record?',
      options: ['When they are curious about the coworker\'s diagnosis', 'When the coworker is also a patient at the facility', 'Only when their job function requires it for treatment, payment, or operations', 'Anytime, since they have system access'],
      answer: 2,
      explanation: 'The Minimum Necessary Standard requires accessing only the PHI needed for the specific job function. Accessing records out of curiosity or personal interest — even with system access — is a HIPAA violation.'
    },
  ])
},

// ═══════════════════════════════════════════════════════════════
// SECTION 3: MEDICAL ETHICS
// ═══════════════════════════════════════════════════════════════
{
  section: 'MEDICAL ETHICS', sort: 11, type: 'text',
  title: 'Principles of Medical Ethics',
  content: `<h2>Principles of Medical Ethics</h2>
<p>Medical ethics is the branch of ethics applied to the practice of medicine and healthcare. It provides a framework for navigating difficult decisions where values, obligations, and interests conflict. While laws tell you what you <em>must</em> do, ethics guides what you <em>should</em> do.</p>

<h3>The Four Principles (Beauchamp and Childress)</h3>
<p>The dominant framework in contemporary biomedical ethics is built on four principles, each reflecting important values in healthcare:</p>

<h4>1. Autonomy</h4>
<p>Respect for the patient's right to make informed, voluntary decisions about their own healthcare. This includes:</p>
<ul>
  <li>Providing complete, accurate information in understandable terms</li>
  <li>Respecting decisions even when you disagree with them</li>
  <li>Not coercing or manipulating patients toward a preferred choice</li>
  <li>Recognizing that a competent adult can refuse any treatment, even life-saving treatment</li>
</ul>

<h4>2. Beneficence</h4>
<p>The obligation to act in the patient's best interest. Requires providers to:</p>
<ul>
  <li>Actively promote patient well-being</li>
  <li>Balance benefits against risks of treatment</li>
  <li>Stay current with evidence-based practices</li>
  <li>Advocate for patients within the healthcare system</li>
</ul>

<h4>3. Non-Maleficence</h4>
<p>"First, do no harm" (<em>primum non nocere</em>). Not all harm can be avoided in healthcare, but providers must:</p>
<ul>
  <li>Avoid unnecessary harm or risk</li>
  <li>Weigh the harm of treatment against the harm of non-treatment</li>
  <li>Use the least harmful approach that achieves the clinical goal</li>
</ul>

<h4>4. Justice</h4>
<p>Fair, equitable treatment and distribution of healthcare resources. Justice in healthcare requires:</p>
<ul>
  <li>Treating patients without discrimination</li>
  <li>Fair allocation of scarce resources (e.g., organ transplants, ICU beds)</li>
  <li>Advocating for equitable access to care</li>
  <li>Following fair procedures in billing and insurance</li>
</ul>

<h3>When Principles Conflict</h3>
<p>Real ethical dilemmas arise when principles pull in opposite directions. For example:</p>
<ul>
  <li><strong>Autonomy vs. Beneficence:</strong> A patient refuses a life-saving blood transfusion for religious reasons. Respecting autonomy means honoring the refusal; beneficence says transfuse. Autonomy wins for a competent adult.</li>
  <li><strong>Confidentiality vs. Justice/Non-maleficence:</strong> A patient with HIV refuses to tell their partner. Protecting confidentiality vs. preventing harm to a third party.</li>
  <li><strong>Justice vs. Beneficence:</strong> A hospital has one ICU bed and two critical patients. Who gets it?</li>
</ul>

<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Exam Tip:</strong> On NHA exams, ethical scenario questions typically involve applying one of these four principles. Identify which principle is at stake, then select the answer that best honors patient welfare and professional responsibility.
</div>`
},
{
  section: 'MEDICAL ETHICS', sort: 12, type: 'presentation',
  title: 'Ethical Decision-Making in Healthcare',
  pptxKey: 'ethics',
},
{
  section: 'MEDICAL ETHICS', sort: 13, type: 'text',
  title: 'Professional Ethics and Boundaries',
  content: `<h2>Professional Ethics and Boundaries</h2>
<p>Professional ethics goes beyond individual patient interactions to define the standards of conduct expected of all healthcare professionals in their roles. Maintaining clear professional boundaries protects patients and practitioners alike.</p>

<h3>Professional Boundaries</h3>
<p>Professional boundaries define the limits of the therapeutic relationship between a healthcare provider and a patient. They exist to protect the patient — who is often in a vulnerable position — from exploitation.</p>

<h4>Boundary Violations Include:</h4>
<ul>
  <li>Sexual contact or romantic relationships with patients</li>
  <li>Accepting significant gifts from patients</li>
  <li>Sharing personal information that benefits the provider, not the patient</li>
  <li>Providing care to family members or close friends (dual relationships)</li>
  <li>Accessing patient records out of personal curiosity</li>
  <li>Using patient information outside of the care relationship</li>
</ul>

<h3>Confidentiality</h3>
<p>The duty of confidentiality requires healthcare workers to protect patient information from unauthorized disclosure. It is foundational to the trust that makes therapeutic relationships possible.</p>
<p>Confidentiality may be overridden when:</p>
<ul>
  <li>The patient gives explicit consent to disclosure</li>
  <li>Disclosure is required by law (mandatory reporting)</li>
  <li>There is a serious, credible threat to an identifiable third party (duty to warn)</li>
</ul>

<h3>Duty to Warn (Tarasoff Principle)</h3>
<p>When a patient makes a specific, credible threat to harm an identifiable person, the healthcare provider has a legal and ethical duty to warn that person and notify law enforcement. This overrides the normal duty of confidentiality.</p>

<h3>Veracity (Truthfulness)</h3>
<p>Healthcare professionals have an ethical obligation to be honest with patients. This includes:</p>
<ul>
  <li>Disclosing diagnosis and prognosis truthfully</li>
  <li>Disclosing medical errors (most states require disclosure)</li>
  <li>Correcting misunderstandings patients may have</li>
  <li>Not providing false reassurance</li>
</ul>

<h3>Fidelity (Keeping Promises)</h3>
<p>Fidelity means keeping commitments made to patients and colleagues. In practice:</p>
<ul>
  <li>Following through on care plans</li>
  <li>Maintaining professional obligations</li>
  <li>Not abandoning patients without appropriate handoff</li>
</ul>

<h3>Social Media and Professional Ethics</h3>
<p>Social media creates significant ethical risks for healthcare workers:</p>
<ul>
  <li>Never post patient information, photos, or cases — even "anonymized" cases can be identifiable</li>
  <li>Do not accept friend requests from patients or discuss their care online</li>
  <li>Maintain professional behavior in all online spaces; employers <em>will</em> find it</li>
  <li>Remember: HIPAA applies to posts, texts, and photos, not just paper records</li>
</ul>`
},
{
  section: 'MEDICAL ETHICS', sort: 14, type: 'text',
  title: 'Ethical Issues in Modern Healthcare',
  content: `<h2>Ethical Issues in Modern Healthcare</h2>
<p>Healthcare in the 21st century presents ethical challenges that previous generations of providers never encountered. Advances in technology, changes in demographics, and evolving social values create complex dilemmas without easy answers.</p>

<h3>End-of-Life Ethics</h3>
<ul>
  <li><strong>Medical Aid in Dying (MAID):</strong> Legal in 10+ states; raises questions about the role of healthcare in hastening death and the duty of individual practitioners who object</li>
  <li><strong>Withdrawal of Life Support:</strong> Ethically permissible when consistent with patient/surrogate wishes and prognosis</li>
  <li><strong>Palliative Care vs. Curative Care:</strong> Balancing quality of life against disease treatment</li>
  <li><strong>Futile Treatment:</strong> Whether providers must offer treatments that are medically futile at patient/family request</li>
</ul>

<h3>Resource Allocation</h3>
<ul>
  <li><strong>Organ Transplantation:</strong> Allocation based on medical criteria (UNOS system) — justice requires fair, transparent processes</li>
  <li><strong>Scarce Resources in Emergencies:</strong> Crisis standards of care during pandemics or disasters require triage protocols that prioritize population benefit</li>
  <li><strong>Healthcare Access Disparities:</strong> Racial, economic, and geographic inequities in healthcare outcomes raise profound justice concerns</li>
</ul>

<h3>Technology and Ethics</h3>
<ul>
  <li><strong>Telemedicine:</strong> Increases access but raises concerns about quality of care, licensure across state lines, and privacy</li>
  <li><strong>Artificial Intelligence:</strong> AI diagnostic tools may be biased against underrepresented populations if trained on non-representative data</li>
  <li><strong>Genetic Testing:</strong> Who should have access to genetic information? Insurers? Employers? Family members?</li>
  <li><strong>Electronic Health Records:</strong> Balancing data sharing for coordinated care against privacy risks</li>
</ul>

<h3>Cultural Competence and Ethics</h3>
<p>Cultural beliefs profoundly affect how patients and families experience illness, make decisions, and respond to treatment. Ethical healthcare requires:</p>
<ul>
  <li>Acknowledging and respecting cultural differences without stereotyping</li>
  <li>Using qualified medical interpreters (not family members) for informed consent discussions</li>
  <li>Understanding that autonomy is expressed differently across cultures (some families make decisions collectively)</li>
  <li>Referring to colleagues or ethics consultants when cultural conflicts arise in care</li>
</ul>

<h3>Research Ethics</h3>
<p>The Belmont Report (1979) established the framework for ethical research involving humans:</p>
<ul>
  <li><strong>Respect for Persons:</strong> Voluntary informed consent; protection of vulnerable populations</li>
  <li><strong>Beneficence:</strong> Maximize benefits, minimize harms</li>
  <li><strong>Justice:</strong> Fair selection of research subjects; don't exploit vulnerable populations</li>
</ul>
<p>Institutional Review Boards (IRBs) oversee research protocols to ensure ethical compliance.</p>`
},
{
  section: 'MEDICAL ETHICS', sort: 15, type: 'quiz',
  title: 'Quiz 3: Medical Ethics',
  content: JSON.stringify([
    {
      q: 'A competent adult patient refuses a medically indicated blood transfusion for religious reasons. The ethical principle that supports honoring this refusal is:',
      options: ['Beneficence', 'Non-maleficence', 'Autonomy', 'Justice'],
      answer: 2,
      explanation: 'Autonomy — respect for the patient\'s right to make their own healthcare decisions — supports honoring a competent adult\'s informed refusal of treatment, even life-saving treatment.'
    },
    {
      q: 'The principle of non-maleficence is best summarized as:',
      options: ['"Act in the patient\'s best interest"', '"First, do no harm"', '"Treat patients fairly"', '"Respect patient decisions"'],
      answer: 1,
      explanation: 'Non-maleficence — derived from the Latin "primum non nocere" (first, do no harm) — obligates providers to avoid causing unnecessary harm or risk.'
    },
    {
      q: 'A patient tells their therapist they plan to kill a specific coworker. What is the therapist\'s ethical and legal obligation?',
      options: ['Maintain confidentiality — all therapy disclosures are protected', 'Warn the potential victim and notify law enforcement (duty to warn)', 'Refer the patient to a psychiatrist without taking further action', 'Document the threat in the record only'],
      answer: 1,
      explanation: 'Under the Tarasoff principle, a specific, credible threat to an identifiable person triggers a duty to warn that person and notify authorities. This overrides the duty of confidentiality.'
    },
    {
      q: 'Which of the following is a professional boundary violation?',
      options: ['Explaining a procedure using simple language', 'Accepting a small thank-you card from a patient', 'Entering into a romantic relationship with a current patient', 'Consulting with a colleague about a difficult case'],
      answer: 2,
      explanation: 'Romantic or sexual relationships with current patients are serious boundary violations in all healthcare professions, exposing the provider to disciplinary action, license revocation, and criminal charges.'
    },
    {
      q: 'The Belmont Report established ethical principles for human research subjects. Which principle ensures that benefits and burdens of research are distributed fairly?',
      options: ['Respect for Persons', 'Beneficence', 'Justice', 'Autonomy'],
      answer: 2,
      explanation: 'The principle of Justice in the Belmont Report requires fair selection of research subjects and equitable distribution of research benefits and burdens — historically, vulnerable populations were exploited in research.'
    },
  ])
},

// ═══════════════════════════════════════════════════════════════
// SECTION 4: MEDICAL LIABILITY AND NEGLIGENCE
// ═══════════════════════════════════════════════════════════════
{
  section: 'MEDICAL LIABILITY AND NEGLIGENCE', sort: 16, type: 'text',
  title: 'Medical Malpractice and Negligence',
  content: `<h2>Medical Malpractice and Negligence</h2>
<p>Medical malpractice is the leading source of civil litigation in healthcare. Understanding how negligence is defined and proven helps healthcare workers understand why standards, documentation, and communication matter so much.</p>

<h3>What Is Medical Negligence?</h3>
<p>Negligence is the failure to provide the standard of care that a reasonably competent healthcare professional in the same specialty would provide under similar circumstances. It is an <em>unintentional</em> act (or failure to act) — distinguishing it from intentional misconduct.</p>

<h3>The Four Elements of Malpractice</h3>
<p>To win a malpractice case, a plaintiff must prove all four elements:</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
  <p><strong>1. DUTY</strong> — A provider-patient relationship existed that created a legal duty of care. This relationship is established when a provider agrees to treat a patient, not merely by being in the same room.</p>
  <p><strong>2. BREACH</strong> — The provider deviated from the applicable standard of care. Standard of care is typically established through expert witness testimony from professionals in the same field and specialty.</p>
  <p><strong>3. CAUSATION</strong> — The breach directly caused the patient's injury. Two components: actual cause (the breach was the cause in fact) and proximate cause (the harm was a foreseeable result).</p>
  <p><strong>4. DAMAGES</strong> — The patient suffered actual, measurable harm: physical injury, emotional distress, lost wages, medical expenses. Without provable damages, there is no malpractice case even if the care was substandard.</p>
</div>

<h3>Types of Damages</h3>
<ul>
  <li><strong>Compensatory damages:</strong> Reimburse actual losses (medical bills, lost income, pain and suffering)</li>
  <li><strong>Punitive damages:</strong> Awarded in cases of gross negligence or intentional misconduct, intended to punish and deter</li>
  <li><strong>Nominal damages:</strong> Small symbolic awards when liability is proven but actual damages are minimal</li>
</ul>

<h3>Common Causes of Malpractice Claims</h3>
<ul>
  <li>Diagnostic errors (failure to diagnose or misdiagnosis)</li>
  <li>Medication errors (wrong drug, wrong dose, wrong patient)</li>
  <li>Surgical errors (wrong site, retained instruments)</li>
  <li>Failure to monitor patients adequately</li>
  <li>Falls and patient safety incidents</li>
  <li>Failure to obtain informed consent</li>
  <li>Premature discharge</li>
  <li>Communication failures between providers</li>
</ul>

<h3>Statute of Limitations</h3>
<p>Malpractice claims must be filed within a specific time period (statute of limitations) — typically 2–3 years from the date of injury or discovery of injury, though this varies by state. Claims filed after the statute expires are barred regardless of merit.</p>`
},
{
  section: 'MEDICAL LIABILITY AND NEGLIGENCE', sort: 17, type: 'presentation',
  title: 'Liability, Risk Management & Documentation',
  pptxKey: 'liability',
},
{
  section: 'MEDICAL LIABILITY AND NEGLIGENCE', sort: 18, type: 'text',
  title: 'Torts, Contracts, and Criminal Law in Healthcare',
  content: `<h2>Torts, Contracts, and Criminal Law in Healthcare</h2>
<p>Healthcare legal issues extend beyond malpractice. Understanding the full spectrum of legal exposure — torts, contracts, and criminal law — helps professionals recognize risk and behave accordingly.</p>

<h3>Intentional Torts in Healthcare</h3>
<p>Unlike negligence (unintentional), intentional torts involve deliberate acts that cause harm:</p>

<h4>Assault and Battery</h4>
<ul>
  <li><strong>Assault:</strong> Threatening a patient or creating apprehension of harmful contact (e.g., raising a syringe over a patient who is asking you to stop)</li>
  <li><strong>Battery:</strong> Unlawful, unconsented physical contact (e.g., performing a procedure after the patient revoked consent; performing a procedure on the wrong patient)</li>
  <li>Treatment without valid informed consent can constitute battery — this is why consent documentation is so critical</li>
</ul>

<h4>Invasion of Privacy</h4>
<ul>
  <li>Unauthorized disclosure of confidential medical information</li>
  <li>Allowing unauthorized persons to observe a procedure</li>
  <li>Taking photographs of a patient without consent</li>
</ul>

<h4>Defamation</h4>
<ul>
  <li><strong>Libel:</strong> Written false statements that damage reputation</li>
  <li><strong>Slander:</strong> Spoken false statements</li>
  <li>Can occur if a provider makes false statements about a patient in their records or to others</li>
</ul>

<h4>False Imprisonment</h4>
<ul>
  <li>Restraining a patient without legal justification</li>
  <li>Refusing to allow a competent patient to leave</li>
  <li>Improper use of physical or chemical restraints</li>
</ul>

<h3>Contract Law in Healthcare</h3>
<p>Healthcare relationships often involve contracts — formal agreements that create legal obligations.</p>
<ul>
  <li><strong>Employment contracts:</strong> Define scope of duties, non-compete clauses, termination rights</li>
  <li><strong>Provider-payer contracts:</strong> Insurance company agreements that define reimbursement and network obligations</li>
  <li><strong>Patient financial agreements:</strong> Define payment obligations</li>
</ul>
<p>Elements of a valid contract: offer, acceptance, consideration (exchange of value), legal purpose, and competent parties.</p>

<h3>Criminal Law in Healthcare</h3>
<p>Some healthcare violations rise to criminal conduct:</p>
<ul>
  <li><strong>Healthcare Fraud:</strong> Knowingly billing for services not rendered, upcoding, unbundling</li>
  <li><strong>Drug Diversion:</strong> Stealing controlled substances for personal use or sale</li>
  <li><strong>Abuse and Neglect:</strong> Intentional mistreatment of patients</li>
  <li><strong>Medicare/Medicaid Fraud:</strong> Federal crimes prosecuted by the Department of Justice</li>
</ul>
<p>Criminal prosecution can result in imprisonment, fines, exclusion from federal healthcare programs, and permanent license revocation.</p>`
},
{
  section: 'MEDICAL LIABILITY AND NEGLIGENCE', sort: 19, type: 'text',
  title: 'Risk Management and Quality Improvement',
  content: `<h2>Risk Management and Quality Improvement</h2>
<p>Risk management is the systematic process of identifying, assessing, and reducing legal and safety risks in healthcare settings. Quality improvement (QI) uses data-driven methods to continuously improve care processes and patient outcomes. Both work together to make healthcare safer and reduce liability.</p>

<h3>The Risk Management Process</h3>
<ol>
  <li><strong>Risk Identification:</strong> Finding potential sources of harm — incident reports, patient complaints, near misses, audits</li>
  <li><strong>Risk Analysis:</strong> Assessing the likelihood and severity of identified risks</li>
  <li><strong>Risk Control:</strong> Implementing strategies to eliminate or reduce risks</li>
  <li><strong>Risk Financing:</strong> Ensuring adequate professional liability insurance</li>
  <li><strong>Risk Evaluation:</strong> Monitoring the effectiveness of control measures</li>
</ol>

<h3>Incident Reports</h3>
<p>Incident reports (also called occurrence reports) document unexpected events that caused or could cause patient harm:</p>
<ul>
  <li>Must be completed promptly and accurately after any adverse event or near miss</li>
  <li>Are internal quality improvement documents — <em>not</em> part of the medical record</li>
  <li>Should describe facts objectively, not assign blame</li>
  <li>In most states, incident reports are protected from discovery in litigation</li>
</ul>

<h3>Root Cause Analysis (RCA)</h3>
<p>A structured investigation of a serious adverse event to identify the underlying system failures that allowed it to occur. RCA focuses on <em>systems</em>, not individuals, and results in process improvements.</p>

<h3>Documentation Best Practices</h3>
<ul>
  <li>Document in real time or as soon as possible after care is provided</li>
  <li>Be objective — record what you observed, not conclusions or opinions</li>
  <li>Use only approved abbreviations</li>
  <li>Never alter, erase, or "white out" entries — use addenda or corrections with date, time, and signature</li>
  <li>Document patient teaching, refusals, and communications with other providers</li>
  <li>In EHRs, remember that all edits are time-stamped and auditable</li>
</ul>

<h3>Quality Improvement Models</h3>
<ul>
  <li><strong>PDCA Cycle (Plan-Do-Check-Act):</strong> Iterative process for testing and implementing improvements</li>
  <li><strong>Six Sigma:</strong> Data-driven methodology to reduce variation and defects</li>
  <li><strong>Lean:</strong> Eliminate waste and streamline processes</li>
  <li><strong>Joint Commission Standards:</strong> Accreditation requirements that drive quality and safety</li>
</ul>

<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Remember:</strong> Good documentation is the most powerful legal protection available to healthcare workers. If it is documented clearly and accurately, it tells the story of the care provided. If it isn't, that story disappears — and in litigation, what isn't documented is presumed not to have happened.
</div>`
},
{
  section: 'MEDICAL LIABILITY AND NEGLIGENCE', sort: 20, type: 'quiz',
  title: 'Quiz 4: Liability and Risk Management',
  content: JSON.stringify([
    {
      q: 'Which of the four malpractice elements requires proving that the provider\'s conduct fell below the applicable standard of care?',
      options: ['Duty', 'Breach', 'Causation', 'Damages'],
      answer: 1,
      explanation: 'Breach is the element that addresses whether the provider deviated from the standard of care — what a reasonably competent professional in the same field would have done in similar circumstances.'
    },
    {
      q: 'A nurse performs a blood draw on the wrong patient. Which intentional tort has most clearly occurred?',
      options: ['Assault', 'Battery', 'Defamation', 'False imprisonment'],
      answer: 1,
      explanation: 'Battery is unlawful, unconsented physical contact. The correct patient did not consent to this procedure, making it battery — regardless of whether harm resulted.'
    },
    {
      q: 'An incident report should be filed in which part of the medical record?',
      options: ['Nursing notes section', 'Physician orders', 'It is NOT placed in the medical record', 'Quality management section of the chart'],
      answer: 2,
      explanation: 'Incident reports are internal quality improvement documents and should NOT be placed in the patient\'s medical record. Noting an incident occurred in the chart is appropriate; attaching the incident report is not.'
    },
    {
      q: 'Under respondeat superior, an employer is NOT liable for an employee\'s actions when the employee was:',
      options: ['Performing care within their job description', 'Following a physician\'s order', 'Acting entirely outside their scope of employment', 'Treating a patient during their normal shift'],
      answer: 2,
      explanation: 'Respondeat superior applies to acts within the scope of employment. If an employee acts entirely outside their employment duties (e.g., a personal errand during work hours), the employer typically is not vicariously liable.'
    },
    {
      q: 'Which documentation practice is CORRECT when a healthcare worker makes a charting error?',
      options: ['Use white-out or erase the entry', 'Draw a single line through the error, note "error," sign and date it', 'Tear out the page and rewrite it', 'Delete the entry from the EHR'],
      answer: 1,
      explanation: 'Errors in paper records should be corrected with a single line through the error, labeled "error," with the correcting party\'s initials, credentials, and date/time. In EHRs, corrections are made through addenda, and all edits are automatically time-stamped.'
    },
  ])
},

// ═══════════════════════════════════════════════════════════════
// SECTION 5: REGULATORY COMPLIANCE
// ═══════════════════════════════════════════════════════════════
{
  section: 'REGULATORY COMPLIANCE', sort: 21, type: 'text',
  title: 'Federal Healthcare Regulations',
  content: `<h2>Federal Healthcare Regulations</h2>
<p>The U.S. healthcare system is among the most heavily regulated industries in the world. Federal regulations establish minimum standards that all providers, facilities, and organizations must meet. Understanding these regulations protects patients and keeps healthcare workers compliant.</p>

<h3>Centers for Medicare & Medicaid Services (CMS)</h3>
<p>CMS administers Medicare, Medicaid, CHIP, and the Health Insurance Marketplace. It is the largest single payer in U.S. healthcare. Key CMS responsibilities:</p>
<ul>
  <li>Establishing Conditions of Participation (CoPs) for hospitals, nursing homes, home health agencies</li>
  <li>Setting coverage and reimbursement rules</li>
  <li>Overseeing quality reporting programs</li>
  <li>Enforcing anti-fraud provisions</li>
</ul>

<h3>The False Claims Act</h3>
<p>One of the federal government's most powerful anti-fraud tools. Prohibits:</p>
<ul>
  <li>Submitting false or fraudulent claims to federal programs</li>
  <li>Knowingly using false records to support a claim</li>
  <li>Conspiring to defraud the government</li>
</ul>
<p><strong>Qui tam provisions</strong> allow private citizens ("whistleblowers") to file lawsuits on behalf of the government and receive a portion of recovered funds. Penalties: $13,000–$27,000 per false claim, plus treble damages.</p>

<h3>Anti-Kickback Statute</h3>
<p>Makes it illegal to offer, pay, solicit, or receive anything of value to induce or reward referrals of federal healthcare program patients. Violations are criminal. Safe harbors exist for legitimate business arrangements that meet specific criteria.</p>

<h3>Stark Law (Physician Self-Referral Law)</h3>
<p>Prohibits physicians from referring patients for designated health services to entities with which they (or their family) have a financial relationship, unless an exception applies. Unlike the Anti-Kickback Statute, Stark Law is a strict liability statute — intent does not matter.</p>

<h3>EMTALA</h3>
<p>Emergency Medical Treatment and Labor Act requires hospitals with emergency departments that accept Medicare to:</p>
<ul>
  <li>Provide a medical screening examination to all patients requesting emergency care</li>
  <li>Stabilize patients with emergency medical conditions before transfer or discharge</li>
  <li>Not transfer patients who are not stabilized without their informed consent</li>
</ul>
<p>Violating EMTALA ("patient dumping") can result in civil monetary penalties and exclusion from Medicare.</p>

<h3>Office of Inspector General (OIG)</h3>
<p>The OIG investigates and prosecutes healthcare fraud and abuse. Key OIG tools:</p>
<ul>
  <li><strong>Corporate Integrity Agreements (CIAs):</strong> Settlement agreements requiring compliance programs</li>
  <li><strong>Exclusion List:</strong> OIG can exclude providers from participating in federal programs — effectively ending their healthcare career</li>
  <li><strong>Work Plan:</strong> Published annually; indicates current enforcement priorities</li>
</ul>`
},
{
  section: 'REGULATORY COMPLIANCE', sort: 22, type: 'presentation',
  title: 'OSHA, CLIA & Workplace Safety',
  pptxKey: 'compliance',
},
{
  section: 'REGULATORY COMPLIANCE', sort: 23, type: 'text',
  title: 'Employment Law and Healthcare Workers',
  content: `<h2>Employment Law and Healthcare Workers</h2>
<p>Healthcare workers are protected by federal and state employment laws that regulate the employment relationship from hiring through termination. Understanding these laws helps workers know their rights and obligations.</p>

<h3>Anti-Discrimination Laws</h3>
<p>Federal law prohibits employment discrimination based on:</p>
<ul>
  <li><strong>Title VII (Civil Rights Act, 1964):</strong> Race, color, religion, sex, national origin</li>
  <li><strong>Age Discrimination in Employment Act (ADEA):</strong> Protects workers 40 and older</li>
  <li><strong>Americans with Disabilities Act (ADA):</strong> Prohibits discrimination against qualified individuals with disabilities; requires reasonable accommodations</li>
  <li><strong>Pregnancy Discrimination Act:</strong> Pregnancy, childbirth, and related conditions</li>
  <li><strong>Equal Pay Act:</strong> Prohibits pay discrimination based on sex for substantially equal work</li>
</ul>

<h3>At-Will Employment</h3>
<p>Most U.S. states are "at-will" employment states — either party can end the employment relationship at any time, for any reason or no reason, with some exceptions:</p>
<ul>
  <li>Cannot terminate for a discriminatory reason (protected class)</li>
  <li>Cannot terminate in retaliation for protected activity (whistleblowing, filing a complaint)</li>
  <li>Cannot terminate in violation of an employment contract</li>
  <li>Cannot terminate in violation of public policy (e.g., for serving on jury duty)</li>
</ul>

<h3>Whistleblower Protections</h3>
<p>Healthcare workers who report violations of law are protected from retaliation under multiple federal and state laws:</p>
<ul>
  <li><strong>False Claims Act:</strong> Protects qui tam relators from retaliation</li>
  <li><strong>OSHA Whistleblower Protection Program:</strong> Covers reports of workplace safety violations</li>
  <li><strong>State laws:</strong> Many states have additional healthcare whistleblower protections</li>
</ul>
<p>If retaliation occurs, workers can file complaints with the relevant agency and seek reinstatement, back pay, and damages.</p>

<h3>FMLA — Family and Medical Leave Act</h3>
<p>Provides eligible employees up to 12 weeks of unpaid, job-protected leave per year for:</p>
<ul>
  <li>Birth, adoption, or foster placement of a child</li>
  <li>Serious health condition of the employee</li>
  <li>Care for a spouse, child, or parent with a serious health condition</li>
  <li>Qualifying military exigencies</li>
</ul>
<p>Applies to employers with 50+ employees. Employee must have worked 12 months and 1,250 hours.</p>

<h3>Workers' Compensation</h3>
<p>No-fault insurance that covers work-related injuries and illnesses:</p>
<ul>
  <li>Required in all states</li>
  <li>Covers medical expenses, lost wages, and rehabilitation</li>
  <li>Healthcare workers face elevated risks: needlestick injuries, back injuries, exposure to infectious diseases, workplace violence</li>
  <li>Post-exposure protocols must be followed immediately for bloodborne pathogen exposures</li>
</ul>`
},
{
  section: 'REGULATORY COMPLIANCE', sort: 24, type: 'quiz',
  title: 'Quiz 5: Regulatory Compliance',
  content: JSON.stringify([
    {
      q: 'The False Claims Act\'s "qui tam" provision allows:',
      options: ['Patients to sue providers directly for malpractice', 'Private citizens to file fraud lawsuits on behalf of the government and share in recovered funds', 'The OIG to exclude providers from Medicare without a hearing', 'CMS to audit hospital billing without prior notice'],
      answer: 1,
      explanation: 'Qui tam provisions allow private whistleblowers to file False Claims Act lawsuits on behalf of the government. If the case is successful, the relator receives 15–30% of recovered funds.'
    },
    {
      q: 'EMTALA requires hospitals to:',
      options: ['Provide free care to all uninsured patients', 'Stabilize emergency patients regardless of ability to pay before transfer or discharge', 'Accept all Medicare and Medicaid patients without a co-pay', 'Report all emergency visits to CMS within 24 hours'],
      answer: 1,
      explanation: 'EMTALA requires hospitals with emergency departments that accept Medicare to screen and stabilize patients with emergency conditions before transfer or discharge — regardless of insurance status or ability to pay.'
    },
    {
      q: 'Under OSHA\'s Bloodborne Pathogen Standard, employers are required to offer healthcare workers hepatitis B vaccination:',
      options: ['At the employee\'s expense after 90 days', 'At no cost to employees who have occupational exposure', 'Only after a documented needlestick injury', 'Only if requested by the employee in writing'],
      answer: 1,
      explanation: 'OSHA\'s Bloodborne Pathogen Standard requires employers to offer hepatitis B vaccination at no cost to all employees with occupational exposure to blood or other potentially infectious materials.'
    },
    {
      q: 'A healthcare worker reports Medicare billing fraud to the OIG and is subsequently terminated. This termination would likely violate:',
      options: ['HIPAA', 'EMTALA', 'Whistleblower protection laws', 'The Anti-Kickback Statute'],
      answer: 2,
      explanation: 'Whistleblower protection laws — including provisions in the False Claims Act and other statutes — protect healthcare workers from retaliation for reporting suspected fraud, waste, or abuse.'
    },
    {
      q: 'The Stark Law prohibits physicians from referring patients for designated health services to entities in which they have a financial interest UNLESS:',
      options: ['The referral is for emergency services', 'The physician obtains prior written consent from the patient', 'A specific statutory exception applies', 'The service is not covered by Medicare'],
      answer: 2,
      explanation: 'Stark Law is a strict liability statute — no intent is required for a violation. However, specific statutory exceptions apply (e.g., in-office ancillary services, employment arrangements that meet specific criteria).'
    },
  ])
},

// ═══════════════════════════════════════════════════════════════
// SECTION 6: EXAM PREPARATION
// ═══════════════════════════════════════════════════════════════
{
  section: 'EXAM PREPARATION', sort: 25, type: 'text',
  title: 'Study Guide and Key Concepts Review',
  content: `<h2>Study Guide and Key Concepts Review</h2>
<p>This study guide consolidates the most exam-relevant concepts from each section of the course. Use it as a reference for targeted review before your NHA certification exam.</p>

<h3>Section 1: Healthcare Law Foundations</h3>
<ul>
  <li>Law comes from constitutional, statutory, administrative, common, and contractual sources</li>
  <li>Federal law supersedes state law; states may provide stronger protections than federal minimums</li>
  <li>Scope of practice is defined by state law — always work within it</li>
  <li>Respondeat superior: employers are liable for employees' in-scope negligent acts</li>
  <li>Mandatory reporting overrides confidentiality (abuse, communicable diseases, gunshot wounds)</li>
</ul>

<h3>Section 2: Patient Rights and HIPAA</h3>
<ul>
  <li><strong>HIPAA Privacy Rule</strong> protects PHI; Security Rule protects ePHI</li>
  <li>PHI = any information that could identify a patient linked to health information</li>
  <li>TPO disclosures do not require patient authorization</li>
  <li>Minimum Necessary Standard: share only what is needed for the purpose</li>
  <li>Breach notification: individuals within 60 days; 500+ also requires media and immediate HHS notice</li>
  <li>Informed consent: competent, informed, voluntary; exceptions include emergencies</li>
  <li>Advance directives: living will (wishes), healthcare proxy (agent), DNR (physician order)</li>
  <li>Capacity (clinical) ≠ Competency (legal)</li>
</ul>

<h3>Section 3: Medical Ethics</h3>
<ul>
  <li>Four principles: Autonomy, Beneficence, Non-maleficence, Justice</li>
  <li>Competent adult refusal of treatment = autonomy wins</li>
  <li>Duty to warn (Tarasoff): specific, credible threat to identifiable person overrides confidentiality</li>
  <li>Professional boundaries: no romantic/sexual relationships with patients; no significant gifts</li>
  <li>Social media: HIPAA applies; never post patient information</li>
  <li>Veracity: disclose errors and diagnoses truthfully</li>
</ul>

<h3>Section 4: Liability and Negligence</h3>
<ul>
  <li>Malpractice elements: Duty → Breach → Causation → Damages (all four required)</li>
  <li>Standard of care: what a reasonable, competent professional in the same specialty would do</li>
  <li>Battery: unconsented physical contact (wrong patient, revoked consent)</li>
  <li>Assault: creating apprehension of harmful contact</li>
  <li>Documentation: "if it wasn't documented, it wasn't done"; never alter records</li>
  <li>Incident reports: internal QI documents; NOT part of the medical record</li>
</ul>

<h3>Section 5: Regulatory Compliance</h3>
<ul>
  <li>False Claims Act: prohibits fraudulent billing; qui tam whistleblower provisions</li>
  <li>Anti-Kickback Statute: prohibits paying for referrals</li>
  <li>Stark Law: prohibits self-referrals (strict liability — no intent required)</li>
  <li>EMTALA: screen and stabilize emergency patients regardless of insurance status</li>
  <li>OSHA Bloodborne Pathogen Standard: exposure control plan, free Hep B vaccine, PPE</li>
  <li>CLIA: regulates laboratory testing; certificate required based on complexity level</li>
  <li>OIG exclusion: excluded providers cannot bill federal programs — career-ending</li>
</ul>

<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Final Exam Tip:</strong> For scenario questions, follow this process: (1) Identify the legal or ethical issue presented, (2) Apply the relevant rule or principle, (3) Eliminate clearly wrong answers first, (4) Choose the option that best protects the patient while respecting legal requirements.
</div>`
},
{
  section: 'EXAM PREPARATION', sort: 26, type: 'presentation',
  title: 'Exam Strategy: Medical Law and Ethics',
  pptxKey: 'exam-prep',
},
{
  section: 'EXAM PREPARATION', sort: 27, type: 'quiz',
  title: 'Final Assessment: Medical Law and Ethics Exam',
  content: JSON.stringify([
    {
      q: 'Which law requires hospitals with emergency departments that accept Medicare to screen and stabilize all patients presenting with emergency conditions?',
      options: ['HIPAA', 'EMTALA', 'ADA', 'False Claims Act'],
      answer: 1,
      explanation: 'EMTALA (Emergency Medical Treatment and Labor Act) prohibits "patient dumping" and requires Medicare-participating hospitals to screen and stabilize emergency patients regardless of their ability to pay.'
    },
    {
      q: 'A medical assistant accidentally gives the wrong medication dose. All four elements of malpractice are proven. What element did the MA\'s act satisfy last?',
      options: ['Duty', 'Breach', 'Causation', 'Damages'],
      answer: 3,
      explanation: 'In this sequence: Duty (provider-patient relationship exists), Breach (wrong dose = deviation from standard), Causation (the wrong dose caused harm), Damages (the patient suffered measurable harm). Damages is typically the final element confirmed in analysis.'
    },
    {
      q: 'Under HIPAA, which of the following does NOT require patient authorization for disclosure?',
      options: ['Sharing records with the patient\'s employer', 'Disclosing PHI for treatment by another involved provider', 'Providing records to a life insurance company', 'Sharing information with a law firm not involved in care'],
      answer: 1,
      explanation: 'Disclosure for treatment — sharing information with another provider involved in the patient\'s care — falls under the TPO exception and does not require patient authorization.'
    },
    {
      q: 'A patient with capacity refuses life-saving surgery for religious reasons. The correct ethical and legal response is to:',
      options: ['Perform the surgery anyway — beneficence overrides autonomy', 'Obtain a court order to override the refusal', 'Honor the refusal, document it thoroughly, and ensure the patient is informed of consequences', 'Transfer the patient immediately without discussion'],
      answer: 2,
      explanation: 'A competent adult has the absolute legal and ethical right to refuse treatment, including life-saving treatment. The provider\'s obligation is to ensure the patient is fully informed, then honor the decision and document it carefully.'
    },
    {
      q: 'The Anti-Kickback Statute prohibits:',
      options: ['Physicians from self-referring patients to facilities they own', 'Offering or receiving anything of value to induce referrals to federal program patients', 'Billing Medicare for services not rendered', 'Emergency departments from turning away uninsured patients'],
      answer: 1,
      explanation: 'The Anti-Kickback Statute prohibits offering, paying, soliciting, or receiving remuneration to induce or reward referrals of items or services covered by federal healthcare programs. Stark Law covers physician self-referrals.'
    },
    {
      q: 'Which type of advance directive designates a person to make medical decisions on behalf of an incapacitated patient?',
      options: ['Living will', 'DNR order', 'POLST form', 'Healthcare power of attorney'],
      answer: 3,
      explanation: 'A healthcare power of attorney (also called healthcare proxy or durable power of attorney for healthcare) designates an agent to make medical decisions when the patient cannot. A living will states the patient\'s own treatment preferences.'
    },
    {
      q: 'A healthcare worker performs a venipuncture on a patient who verbally revoked consent immediately before the procedure. This constitutes:',
      options: ['Negligence', 'Battery', 'Assault', 'False imprisonment'],
      answer: 1,
      explanation: 'Battery is unlawful, unconsented physical contact. Proceeding with a procedure after consent has been revoked — regardless of whether harm results — constitutes battery.'
    },
    {
      q: 'Under the OSHA Bloodborne Pathogen Standard, after a needlestick injury, the employer is required to:',
      options: ['Terminate the employee pending investigation', 'Provide post-exposure evaluation and follow-up at no cost to the employee', 'File a police report within 24 hours', 'Require the employee to pay for testing until results are confirmed'],
      answer: 1,
      explanation: 'OSHA requires employers to provide confidential post-exposure evaluation and follow-up at no cost to the employee following an occupational exposure incident. This includes source testing (with consent) and employee testing.'
    },
    {
      q: 'Respondeat superior would NOT apply when:',
      options: ['An MA administers the wrong medication during a routine shift', 'A nurse causes harm while following a physician order', 'An employee assaults a patient while committing a personal crime unrelated to their duties', 'A phlebotomist makes a labeling error on a specimen'],
      answer: 2,
      explanation: 'Respondeat superior applies to acts within the scope of employment. An employee committing a personal crime entirely unrelated to their job duties is acting outside their scope of employment, so the employer is not vicariously liable.'
    },
    {
      q: 'The minimum necessary standard under HIPAA means:',
      options: ['Only the minimum number of staff may access any record', 'PHI disclosed must be limited to what is needed for the specific purpose', 'Patients must receive minimum information about their diagnosis', 'Providers may share only one piece of PHI per request'],
      answer: 1,
      explanation: 'The Minimum Necessary Standard requires that covered entities make reasonable efforts to limit PHI disclosure to only what is needed to accomplish the intended purpose — even for permitted disclosures.'
    },
    {
      q: 'Which of the following is a valid element of informed consent?',
      options: ['The patient signs the form before the provider explains the procedure', 'The provider explains risks and alternatives and the patient voluntarily agrees', 'A family member consents on behalf of a competent adult patient', 'Consent is implied because the patient entered the healthcare facility'],
      answer: 1,
      explanation: 'Valid informed consent requires disclosure (risks, benefits, alternatives), comprehension, voluntariness, and competence/capacity. The conversation — not just the signature — constitutes consent.'
    },
    {
      q: 'Stark Law differs from the Anti-Kickback Statute in that:',
      options: ['Stark Law requires criminal intent; Anti-Kickback does not', 'Stark Law is a strict liability civil statute; no intent is required to violate it', 'The Anti-Kickback Statute applies only to laboratory referrals', 'Stark Law covers all federal program referrals; Anti-Kickback covers only Medicare'],
      answer: 1,
      explanation: 'Stark Law is a strict liability statute — a violation occurs regardless of intent if a prohibited self-referral is made without an applicable exception. The Anti-Kickback Statute requires knowing and willful conduct.'
    },
    {
      q: 'Which ethical principle is primarily at stake when a provider allocates a scarce medical resource (such as an ICU bed) among multiple critical patients?',
      options: ['Autonomy', 'Non-maleficence', 'Beneficence', 'Justice'],
      answer: 3,
      explanation: 'Justice concerns fair, equitable distribution of healthcare resources. Resource allocation decisions — organ transplants, scarce medications, ICU beds — primarily engage the principle of justice.'
    },
    {
      q: 'A healthcare worker reports suspected Medicare fraud and is subsequently demoted. What law most directly protects them?',
      options: ['HIPAA', 'EMTALA', 'False Claims Act (qui tam whistleblower protections)', 'Stark Law'],
      answer: 2,
      explanation: 'The False Claims Act contains robust anti-retaliation provisions protecting employees who report or participate in investigations of federal healthcare fraud. Remedies include reinstatement, double back pay, and attorney fees.'
    },
    {
      q: 'A patient\'s advance directive states they do not want mechanical ventilation. The patient is now unconscious. The family demands the patient be put on a ventilator. The legally and ethically correct action is to:',
      options: ['Honor the family\'s wishes — next of kin have final authority', 'Honor the patient\'s advance directive — it reflects their informed, competent wishes', 'Place the patient on the ventilator temporarily while consulting legal counsel', 'Ask the family to provide written authorization before proceeding'],
      answer: 1,
      explanation: 'An advance directive reflects the patient\'s own autonomous decision made while competent. It takes precedence over family wishes. The patient\'s directive must be honored — family members do not override a patient\'s documented healthcare decisions.'
    },
    {
      q: 'A medical professional discloses a patient\'s HIV-positive status to the patient\'s employer without authorization. This is primarily a violation of:',
      options: ['The Anti-Kickback Statute', 'HIPAA and the duty of confidentiality', 'The False Claims Act', 'EMTALA'],
      answer: 1,
      explanation: 'Unauthorized disclosure of PHI — including HIV status — to an employer without patient authorization is a HIPAA Privacy Rule violation and a breach of the professional duty of confidentiality.'
    },
    {
      q: 'Documentation of a healthcare error should:',
      options: ['Be omitted to protect the provider from liability', 'Describe the facts objectively and include the response and follow-up care provided', 'Assign blame to the responsible party', 'Be placed in the incident report section of the medical record'],
      answer: 1,
      explanation: 'Errors should be documented factually, objectively, and completely — including the error, its discovery, the patient\'s condition, provider notification, and follow-up actions. Omission or falsification of records greatly increases liability.'
    },
    {
      q: 'Which federal agency is responsible for enforcing workplace safety standards including the Bloodborne Pathogen Standard?',
      options: ['CMS', 'FDA', 'OSHA', 'OIG'],
      answer: 2,
      explanation: 'OSHA (Occupational Safety and Health Administration) sets and enforces workplace safety standards, including the Bloodborne Pathogen Standard that protects healthcare workers from exposure to HIV, hepatitis B, and other pathogens.'
    },
    {
      q: 'Which of the following disclosures of PHI is permitted by HIPAA WITHOUT patient authorization?',
      options: ['Sharing records with the patient\'s attorney for a personal injury suit', 'Reporting a communicable disease to the state health department as required by law', 'Disclosing records to a family member who is not the healthcare proxy', 'Providing records to an employer for insurance verification'],
      answer: 1,
      explanation: 'HIPAA permits (and mandatory reporting laws require) disclosure of certain communicable disease information to public health authorities without patient authorization. This is a recognized exception to the privacy requirements.'
    },
    {
      q: 'A patient threatens to harm a specific named individual during a therapy session. Under the duty to warn (Tarasoff principle), the therapist should:',
      options: ['Maintain confidentiality — all therapy sessions are protected', 'Document the threat and revisit it at the next session', 'Warn the identified potential victim and notify law enforcement', 'Consult with a colleague before taking any action'],
      answer: 2,
      explanation: 'Tarasoff established the duty to warn: when a patient makes a specific, credible threat to harm an identifiable person, the provider must take reasonable steps to protect that person — including warning them and notifying law enforcement. Confidentiality yields to public safety.'
    },
  ])
},

]; // end lessons array

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const conn = await mysql.createConnection(DB);

  await conn.execute('DELETE FROM lessons WHERE course_id = ?', [COURSE_ID]);
  console.log(`Cleared existing lessons for course ${COURSE_ID}`);

  for (const lesson of lessons) {
    let content = lesson.content || '';

    let filePath = null;
    if (lesson.type === 'presentation') {
      filePath = makePptx(lesson.pptxKey);
      content = '';
    }

    const [result] = await conn.execute(
      `INSERT INTO lessons (course_id, title, type, content, file_path, sort_order, section_title, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [COURSE_ID, lesson.title, lesson.type, content, filePath, lesson.sort, lesson.section, slug(lesson.title)]
    );
    console.log(`  ✓ [${lesson.sort}] ${lesson.type}: ${lesson.title} (id=${result.insertId})`);
  }

  await conn.end();
  console.log(`\nDone! Course ${COURSE_ID} populated with ${lessons.length} lessons.`);
}

main().catch(err => { console.error(err); process.exit(1); });
