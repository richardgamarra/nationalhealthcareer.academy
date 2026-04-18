/**
 * populate-medical-insurance-course.js
 * Course 10: Medical Insurance and Reimbursement
 * 27 lessons: 15 text, 6 presentations, 6 quizzes
 * Quizzes inserted directly into quiz_questions table.
 */

const mysql = require('mysql2/promise');
const PptxGenJS = require('/root/node_modules/pptxgenjs');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = '/var/www/nationalhealthcareer-com/public/uploads';
const COURSE_ID = 10;
const DB = { host: 'localhost', user: 'admin_nhca', password: '2u95#I7jm', database: 'nha_db' };

let _n = 0;
function slug(title) {
  _n++;
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150) + '-c10-' + _n;
}

// ─── PPTX GENERATOR ───────────────────────────────────────────────────────────
function makePptx(key) {
  const decks = {
    'insurance-overview': {
      title: 'Health Insurance Overview',
      slides: [
        { heading: 'Health Insurance Overview', body: 'Health insurance is a contract between a policyholder and an insurer that covers the cost of medical care. Understanding how insurance works is fundamental to every healthcare administrative role.' },
        { heading: 'How Insurance Works', body: 'Key financial concepts:\n• Premium – monthly payment to maintain coverage\n• Deductible – amount paid before insurance kicks in\n• Copayment – fixed amount per visit/service\n• Coinsurance – percentage split after deductible\n• Out-of-Pocket Maximum – most the insured will pay in a year' },
        { heading: 'Types of Insurance Plans', body: 'Private Insurance:\n• Employer-sponsored group plans (most common)\n• Individual/marketplace plans (ACA)\n• COBRA continuation coverage\n\nGovernment Programs:\n• Medicare (65+ and disabled)\n• Medicaid (low-income)\n• CHIP (children)\n• TRICARE (military)\n• VA (veterans)' },
        { heading: 'The Insurance Card', body: 'Every insured patient carries an insurance card containing:\n• Member ID number\n• Group number\n• Plan name and type\n• Payer contact/claims address\n• Copay amounts\n• Effective date\n\nAlways verify and copy front and back at registration.' },
        { heading: 'Key Takeaways', body: '✓ Insurance spreads financial risk across a large group\n✓ Know the difference: premium, deductible, copay, coinsurance\n✓ Most Americans have employer-sponsored coverage\n✓ Government programs cover the elderly, disabled, and low-income\n✓ Always verify insurance eligibility before services are rendered' },
      ]
    },
    'medicare-medicaid': {
      title: 'Medicare & Medicaid Deep Dive',
      slides: [
        { heading: 'Medicare: The Basics', body: 'Federal health insurance program for:\n• Adults 65 and older\n• Individuals under 65 with qualifying disabilities\n• People with End-Stage Renal Disease (ESRD)\n\nAdministered by CMS. Funded by payroll taxes, premiums, and general revenue.' },
        { heading: 'Medicare Parts', body: 'Part A – Hospital Insurance (inpatient, SNF, hospice)\nPart B – Medical Insurance (outpatient, physician services, DME)\nPart C – Medicare Advantage (private plans covering A+B)\nPart D – Prescription Drug Coverage\n\nMost providers bill Part A and Part B directly to Medicare.' },
        { heading: 'Medicaid', body: 'Joint federal-state program for low-income individuals.\n\n• Eligibility varies by state\n• Covers children, pregnant women, disabled, elderly low-income\n• ACA expanded eligibility in most states to 138% FPL\n• Administered by states under federal guidelines\n• Reimbursement rates typically lower than Medicare or commercial insurance' },
        { heading: 'Medicare Billing Rules', body: 'Key compliance requirements:\n• Must use approved diagnosis codes (ICD-10-CM)\n• Must use approved procedure codes (CPT/HCPCS)\n• Use CMS-1500 for professional claims, UB-04 for institutional\n• Timely filing limits: 12 months from date of service (Medicare)\n• Medicare as Secondary Payer (MSP) rules apply' },
        { heading: 'Dual Eligibles', body: 'Patients enrolled in BOTH Medicare and Medicaid.\n\n• Medicare pays first (primary)\n• Medicaid pays second (secondary) — often covers cost-sharing\n• About 12 million Americans are dual-eligible\n• Require careful coordination of benefits\n• Billing errors with dual eligibles are a common audit target' },
      ]
    },
    'revenue-cycle': {
      title: 'Revenue Cycle Management',
      slides: [
        { heading: 'The Revenue Cycle', body: 'The revenue cycle encompasses all administrative and clinical functions that contribute to capturing, managing, and collecting patient service revenue.\n\nIt begins before the patient arrives and ends when the balance is paid in full.' },
        { heading: 'Revenue Cycle Steps', body: '1. Pre-registration & Scheduling\n2. Insurance Verification & Authorization\n3. Patient Registration & Check-In\n4. Charge Capture\n5. Claim Submission\n6. Payment Posting\n7. Denial Management\n8. Patient Collections\n9. Reporting & Analytics' },
        { heading: 'Prior Authorization', body: 'Many services require insurer approval before they are performed.\n\n• Elective surgeries, expensive imaging (MRI, CT)\n• Specialty referrals in HMO plans\n• Certain medications\n• Durable Medical Equipment (DME)\n\nWithout auth: claim denied. Providers must track auth numbers and expiration dates.' },
        { heading: 'Charge Capture', body: 'The process of recording all billable services rendered.\n\n• Physicians document services in the EHR\n• Coders assign ICD-10-CM and CPT codes\n• Charges entered into practice management system\n• Fee schedule determines charge amount\n• Charge master (CDM) lists all services and prices for hospitals' },
        { heading: 'Key Performance Indicators', body: 'Metrics that measure revenue cycle health:\n• Days in Accounts Receivable (A/R) — goal: <30-40 days\n• Clean Claim Rate — goal: >95%\n• Denial Rate — goal: <5%\n• First-Pass Resolution Rate\n• Net Collection Rate — goal: >95%\n• Bad Debt as % of Revenue' },
      ]
    },
    'claims': {
      title: 'Claims Submission & Processing',
      slides: [
        { heading: 'The CMS-1500 Form', body: 'Standard claim form for professional (physician/outpatient) services.\n\nKey fields:\n• Box 1: Insurance type\n• Box 11: Group number\n• Box 21: Diagnosis codes (up to 12 ICD-10-CM)\n• Box 24: Service line items (date, place, CPT, modifier, diagnosis pointer, charge)\n• Box 33: Billing provider NPI and address' },
        { heading: 'Electronic vs. Paper Claims', body: 'Electronic Data Interchange (EDI):\n• 837P: professional claims (replaces CMS-1500)\n• 837I: institutional claims (replaces UB-04)\n• 835: Electronic Remittance Advice (ERA)\n• 270/271: Eligibility inquiry/response\n• 276/277: Claim status inquiry/response\n\nElectronic submission: faster, fewer errors, required for most payers.' },
        { heading: 'Clean Claims', body: 'A clean claim contains all required information and no errors.\n\nCommon reasons for dirty claims:\n• Missing or invalid NPI\n• Incorrect or missing diagnosis codes\n• Procedure not covered by plan\n• Missing prior authorization number\n• Timely filing exceeded\n• Subscriber ID mismatch\n\nClean claim rate is a key revenue cycle metric.' },
        { heading: 'Claim Adjudication', body: 'The payer\'s process for evaluating and paying a claim:\n\n1. Eligibility check\n2. Benefits verification\n3. Medical necessity review\n4. Fee schedule application\n5. Coordination of benefits\n6. Payment calculation\n7. Remittance advice generation\n\nTypical turnaround: 14–30 days (electronic); longer for paper.' },
        { heading: 'Timely Filing', body: 'Every payer has a deadline for claim submission after the date of service.\n\n• Medicare: 12 months\n• Medicaid: varies by state (90 days to 1 year)\n• Commercial: varies (90 days to 1 year)\n\nMissing the timely filing deadline = claim denied and cannot be resubmitted. Track all claim submission dates.' },
      ]
    },
    'reimbursement': {
      title: 'Reimbursement Methodologies',
      slides: [
        { heading: 'How Providers Get Paid', body: 'Reimbursement is not the same as the billed charge. Payers use various methods to determine how much they will pay for a service.\n\nKey principle: the provider accepts the payer\'s allowed amount as payment in full (contracted rate) — the patient is only responsible for cost-sharing.' },
        { heading: 'Fee-for-Service (FFS)', body: 'Providers are paid for each service rendered.\n\n• Most common traditional model\n• Medicare Physician Fee Schedule (MPFS): based on RVUs (Relative Value Units)\n• RVU = Work RVU + Practice Expense RVU + Malpractice RVU\n• Geographic adjustments apply (GPCI)\n• Commercial payers often base rates on percentage of Medicare' },
        { heading: 'Prospective Payment Systems', body: 'Payment determined in advance based on patient category.\n\n• DRGs (Diagnosis-Related Groups): hospital inpatient Medicare\n• APCs (Ambulatory Payment Classifications): hospital outpatient\n• SNF Prospective Payment: skilled nursing facilities\n• Home Health Prospective Payment\n\nProviders profit if actual costs are below the payment rate; absorb losses if above.' },
        { heading: 'Managed Care Reimbursement', body: 'Capitation:\n• Provider paid a fixed monthly amount per enrolled patient\n• Provider bears financial risk for utilization\n• Common in HMO arrangements\n\nValue-Based Purchasing:\n• Payment tied to quality metrics and outcomes\n• Pay-for-Performance (P4P)\n• Bundled payments for episodes of care\n• ACO shared savings programs' },
        { heading: 'Coordination of Benefits (COB)', body: 'When a patient has multiple insurance plans:\n\n• Primary payer pays first according to benefits\n• Secondary payer pays remaining balance up to their coverage limits\n• Patient pays any remaining cost-sharing\n\nBirthday Rule: for children with two parents\' coverage, the plan of the parent whose birthday falls first in the calendar year is primary.' },
      ]
    },
    'exam-prep': {
      title: 'Exam Strategy: Medical Insurance & Reimbursement',
      slides: [
        { heading: 'What the Exam Tests', body: 'Insurance and reimbursement topics appear heavily on:\n• NHA CBCS (Certified Billing and Coding Specialist)\n• NHA CMAA (Certified Medical Administrative Assistant)\n• AAPC CPC and CPB exams\n\nFocus areas: payer types, claim forms, revenue cycle, COB, Medicare/Medicaid rules' },
        { heading: 'High-Frequency Topics', body: '✓ Medicare Parts A, B, C, D — what each covers\n✓ CMS-1500 key fields (21, 24, 33)\n✓ Timely filing limits by payer\n✓ Primary vs. secondary insurance (birthday rule)\n✓ Prior authorization requirements\n✓ Explanation of Benefits (EOB) / Remittance Advice\n✓ Denial codes and how to appeal' },
        { heading: 'Common Exam Traps', body: '• Confusing Medicare Part A (hospital) with Part B (outpatient/physician)\n• Mixing up allowed amount, billed amount, and paid amount\n• Forgetting that Medicaid is ALWAYS secondary to other insurance\n• Confusing EOB (to patient) with ERA/remittance advice (to provider)\n• Assuming denial = write-off (always check if appealable first)' },
        { heading: 'Study Strategy', body: '1. Memorize Medicare Parts and what each covers\n2. Know the CMS-1500 form fields that are most often tested\n3. Understand the revenue cycle as a sequence — know each step\n4. Master COB rules: primary/secondary, birthday rule, Medicaid last\n5. Know claim status terms: paid, denied, pending, rejected\n6. Understand the difference between a rejected and denied claim' },
        { heading: 'Final Checklist', body: '□ Insurance types: commercial, Medicare, Medicaid, TRICARE, Workers\' Comp\n□ Plan types: HMO, PPO, EPO, POS, HDHP\n□ Medicare Parts A, B, C, D\n□ Revenue cycle steps in order\n□ CMS-1500 key boxes\n□ EOB vs. remittance advice\n□ Timely filing rules\n□ Coordination of benefits / birthday rule\n□ Capitation vs. fee-for-service\n□ Prior authorization process' },
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

  const filename = `${Date.now()}-mir-${key}.pptx`;
  const filepath = path.join(UPLOADS_DIR, filename);
  pptx.writeFile({ fileName: filepath });
  console.log(`Generated: ${filename}`);
  return `/uploads/${filename}`;
}

// ─── QUIZ DATA ─────────────────────────────────────────────────────────────────
const quizzes = {
  q1: [
    { q: 'A patient pays $30 every time they visit their primary care physician, regardless of the total cost of the visit. This is called a:', options: ['Premium', 'Deductible', 'Copayment', 'Coinsurance'], answer: 2, explanation: 'A copayment (copay) is a fixed dollar amount the patient pays per visit or service. It does not vary with the total cost of the service.' },
    { q: 'Which government program provides health insurance primarily to adults aged 65 and older?', options: ['Medicaid', 'CHIP', 'Medicare', 'TRICARE'], answer: 2, explanation: 'Medicare is the federal health insurance program for adults 65 and older, as well as certain younger individuals with disabilities or End-Stage Renal Disease.' },
    { q: 'An insurance plan\'s "out-of-pocket maximum" refers to:', options: ['The monthly premium cost', 'The most the insured will pay in cost-sharing in a plan year', 'The amount the provider writes off', 'The annual deductible amount'], answer: 1, explanation: 'The out-of-pocket maximum caps the total amount an insured must pay for covered services in a plan year. After reaching it, the insurance pays 100% of covered costs.' },
    { q: 'When verifying insurance eligibility, what should always be collected from the patient?', options: ['Their Social Security number only', 'Both the front and back of the insurance card', 'A copy of their explanation of benefits', 'Their employer\'s tax ID number'], answer: 1, explanation: 'Both sides of the insurance card contain essential billing information: member ID, group number, payer contact, copay amounts, and claims address. Always copy front and back.' },
    { q: 'A patient has met their $1,500 deductible. Their plan pays 80% and the patient pays 20% of covered costs. This patient cost-sharing arrangement is called:', options: ['Capitation', 'Copayment', 'Coinsurance', 'Premium'], answer: 2, explanation: 'Coinsurance is the percentage split of costs between the payer and patient after the deductible is met. An 80/20 split means the payer covers 80% and the patient pays 20%.' },
  ],
  q2: [
    { q: 'Medicare Part B covers:', options: ['Inpatient hospital stays', 'Prescription drugs', 'Physician services and outpatient care', 'Skilled nursing facility care after hospitalization'], answer: 2, explanation: 'Medicare Part B covers outpatient services, physician visits, preventive services, and durable medical equipment (DME). Part A covers inpatient hospital and SNF care.' },
    { q: 'Medicaid eligibility is determined by:', options: ['Age alone', 'Federal law with no state variation', 'Income and other criteria, with significant variation by state', 'Employment status only'], answer: 2, explanation: 'Medicaid is a joint federal-state program. Each state sets its own eligibility rules within federal guidelines, resulting in significant variation in who qualifies and what benefits are provided.' },
    { q: 'A patient is enrolled in both Medicare and Medicaid (dual eligible). Which program pays first?', options: ['Medicaid always pays first', 'Medicare pays first; Medicaid may pay remaining cost-sharing', 'They pay equal shares simultaneously', 'Whichever the patient chooses'], answer: 1, explanation: 'For dual-eligible patients, Medicare is always primary. Medicaid acts as the payer of last resort, potentially covering deductibles, copays, and coinsurance that Medicare doesn\'t pay.' },
    { q: 'In an HMO plan, a patient generally must:', options: ['See any specialist without a referral', 'Obtain a referral from their primary care physician to see a specialist', 'Pay a higher premium but have lower out-of-pocket costs', 'Use any provider nationwide without network restrictions'], answer: 1, explanation: 'HMOs (Health Maintenance Organizations) typically require patients to select a primary care physician (PCP) who coordinates care and provides referrals to in-network specialists.' },
    { q: 'TRICARE is the health insurance program for:', options: ['Federal government civilian employees', 'Active duty military members, retirees, and their families', 'Low-income children only', 'Veterans with service-connected disabilities'], answer: 1, explanation: 'TRICARE provides health coverage to active duty service members, retirees, and their dependents. VA healthcare (a separate program) serves veterans with service-connected conditions.' },
  ],
  q3: [
    { q: 'The first step in the revenue cycle, before the patient arrives, is:', options: ['Charge capture', 'Claim submission', 'Pre-registration and insurance verification', 'Payment posting'], answer: 2, explanation: 'The revenue cycle begins before the patient\'s visit with pre-registration and insurance eligibility verification. Catching coverage issues before the visit prevents billing problems and denials.' },
    { q: 'Prior authorization is required when:', options: ['A patient wants to see their own PCP', 'Certain high-cost or elective services need insurer approval before being performed', 'A patient is paying cash for services', 'A provider submits a claim electronically'], answer: 1, explanation: 'Prior authorization (prior auth) is advance approval from the insurer before certain services are rendered. Without it, the claim is typically denied. Common for elective surgeries, advanced imaging, and specialty drugs.' },
    { q: 'The process of recording all billable services rendered during a patient encounter is called:', options: ['Charge capture', 'Claim adjudication', 'Remittance posting', 'Eligibility verification'], answer: 0, explanation: 'Charge capture is the process of documenting all billable services so they can be coded and billed. It links clinical documentation to the billing process.' },
    { q: 'A "clean claim rate" above 95% indicates:', options: ['The practice has a high denial rate', 'Most claims are submitted correctly and without errors on the first pass', 'The patient collection rate is excellent', 'The practice is over-coding'], answer: 1, explanation: 'Clean claim rate measures the percentage of claims accepted without errors on first submission. A high clean claim rate reduces denials and speeds up reimbursement.' },
    { q: 'Days in Accounts Receivable (A/R) measures:', options: ['How many days a patient waited to be seen', 'The average number of days it takes to collect payment after a service is billed', 'The total amount owed by all patients', 'How long a claim sits before submission'], answer: 1, explanation: 'Days in A/R is a key revenue cycle metric indicating how long it takes, on average, to collect payment. A lower number indicates a more efficient billing process. Target is generally under 30–40 days.' },
  ],
  q4: [
    { q: 'On the CMS-1500 claim form, diagnosis codes (ICD-10-CM) are entered in:', options: ['Box 11', 'Box 21', 'Box 24D', 'Box 33'], answer: 1, explanation: 'Box 21 of the CMS-1500 is where up to 12 ICD-10-CM diagnosis codes are listed. Box 24D contains the CPT procedure codes for each service line.' },
    { q: 'A claim that is "rejected" differs from a claim that is "denied" in that:', options: ['Rejected claims cannot be corrected and resubmitted', 'Rejected claims never entered the payer\'s system due to errors; denied claims were processed but not paid', 'Denied claims are always due to medical necessity issues', 'There is no difference between the two terms'], answer: 1, explanation: 'A rejected claim has errors that prevent it from entering the adjudication system (e.g., invalid NPI, missing field). It can be corrected and resubmitted. A denied claim was processed but not paid — it may be appealed.' },
    { q: 'Medicare\'s timely filing limit for claim submission after the date of service is:', options: ['90 days', '6 months', '12 months', '24 months'], answer: 2, explanation: 'Medicare requires claims to be submitted within 12 months (one calendar year) from the date of service. Missing this deadline results in a denial that cannot be appealed based on the timely filing exception.' },
    { q: 'An Explanation of Benefits (EOB) is sent to:', options: ['The provider, detailing what will be paid', 'The patient, explaining how their claim was processed', 'The state insurance commissioner', 'CMS for all Medicare claims'], answer: 1, explanation: 'The EOB is sent to the patient (or insured) explaining how their claim was processed, what the insurance paid, and what the patient owes. The provider receives a Remittance Advice (RA) or Electronic Remittance Advice (ERA).' },
    { q: 'When a claim is denied, the provider\'s first step should be to:', options: ['Write off the balance immediately', 'Bill the patient for the full amount', 'Review the denial reason code and determine if it is correctable or appealable', 'Resubmit the same claim without changes'], answer: 2, explanation: 'Denial management begins by reviewing the reason/remark codes on the remittance advice. The denial may be correctable (resubmit with fix) or appealable (file a formal appeal). Simply writing off or billing the patient without reviewing is incorrect.' },
  ],
  q5: [
    { q: 'In a fee-for-service (FFS) model, Medicare physician payments are based on:', options: ['A flat rate per patient per month', 'Relative Value Units (RVUs) multiplied by a conversion factor', 'The provider\'s billed charge', 'The hospital\'s Charge Description Master (CDM)'], answer: 1, explanation: 'Medicare\'s Physician Fee Schedule uses Relative Value Units (RVUs) — which measure work, practice expense, and malpractice components — multiplied by a national conversion factor and geographic adjustments (GPCI).' },
    { q: 'Diagnosis-Related Groups (DRGs) are used to reimburse:', options: ['Outpatient physician services', 'Medicare inpatient hospital stays', 'Home health visits', 'Skilled nursing facility care'], answer: 1, explanation: 'DRGs are the prospective payment system for Medicare inpatient hospital services. The hospital receives a predetermined payment based on the patient\'s diagnosis group, regardless of actual costs.' },
    { q: 'In a capitation arrangement, a provider receives:', options: ['Payment for each individual service rendered', 'A fixed monthly amount per enrolled patient regardless of services used', 'Payment only when quality benchmarks are met', 'Reimbursement based on the hospital\'s cost report'], answer: 1, explanation: 'Capitation is a payment model in which the provider receives a fixed per-member-per-month (PMPM) payment regardless of how many services the patient uses. The provider bears the financial risk of utilization.' },
    { q: 'The birthday rule in coordination of benefits applies when:', options: ['A patient turns 65 and becomes Medicare-eligible', 'A child is covered under both parents\' insurance plans', 'A patient has both Medicare Part A and Part B', 'A Medicaid patient also has a commercial plan'], answer: 1, explanation: 'The birthday rule determines which parent\'s plan is primary for a dependent child covered under both parents\' insurance. The plan of the parent whose birthday falls earlier in the calendar year is primary.' },
    { q: 'When a provider\'s contracted rate with a payer is $150 for a service and the provider billed $250, the patient\'s plan paid $120, and the patient owes a $30 copay. What is the contractual adjustment?', options: ['$100', '$120', '$30', '$250'], answer: 0, explanation: 'The contractual adjustment is the difference between the billed amount and the allowed amount: $250 – $150 = $100. The provider writes off this amount per their contract. The $150 allowed is split: $120 paid by insurance + $30 patient copay.' },
  ],
  final: [
    { q: 'A patient\'s insurance plan has a $2,000 deductible, 20% coinsurance, and a $6,000 out-of-pocket maximum. The patient has already met their deductible. A covered service costs $5,000. What does the patient owe?', options: ['$5,000', '$2,000', '$1,000', '$6,000'], answer: 2, explanation: 'After the deductible is met, the patient pays coinsurance. 20% of $5,000 = $1,000. This is within the out-of-pocket maximum, so the patient owes $1,000.' },
    { q: 'Which Medicare Part covers outpatient prescription drugs?', options: ['Part A', 'Part B', 'Part C', 'Part D'], answer: 3, explanation: 'Medicare Part D is the prescription drug benefit. Part A covers inpatient hospital care. Part B covers outpatient and physician services. Part C (Medicare Advantage) is a private plan alternative that combines A and B.' },
    { q: 'The electronic transaction used to submit a professional claim to a payer is:', options: ['837I', '835', '837P', '270'], answer: 2, explanation: '837P is the electronic professional claim transaction (equivalent to the CMS-1500 paper form). 837I is for institutional claims (UB-04). 835 is the electronic remittance advice. 270 is the eligibility inquiry.' },
    { q: 'Medicaid is best described as:', options: ['A federal-only program for the elderly', 'A joint federal-state program for low-income individuals', 'A private insurance program for government employees', 'A program exclusively for children under 18'], answer: 1, explanation: 'Medicaid is a joint federal-state program providing health coverage to low-income individuals, including children, pregnant women, elderly adults, and people with disabilities. States administer it under federal guidelines.' },
    { q: 'A provider submits a claim but it is returned before entering the payer\'s system due to a missing NPI. This is called a:', options: ['Denial', 'Rejection', 'Adjustment', 'Write-off'], answer: 1, explanation: 'A rejection occurs when a claim has errors that prevent it from being accepted into the payer\'s adjudication system. It is returned to the biller for correction and resubmission. A denial occurs after the claim has been processed.' },
    { q: 'The CMS-1500 form Box 21 is used to enter:', options: ['The billing provider\'s NPI', 'Procedure (CPT) codes', 'Diagnosis (ICD-10-CM) codes', 'The patient\'s date of birth'], answer: 2, explanation: 'Box 21 of the CMS-1500 contains the diagnosis codes (ICD-10-CM), up to 12. Box 24D contains the procedure codes. Box 33 contains the billing provider information including NPI.' },
    { q: 'In a PPO plan, a patient who sees an out-of-network provider will:', options: ['Have no coverage at all', 'Pay a higher cost-share than for in-network providers, but still receive some coverage', 'Require a referral from their PCP first', 'Receive the same benefits as in-network'], answer: 1, explanation: 'PPOs (Preferred Provider Organizations) allow out-of-network care but at higher cost-sharing (higher deductibles, coinsurance). HMOs typically provide no out-of-network coverage except emergencies.' },
    { q: 'Which of the following best describes "coordination of benefits"?', options: ['Negotiating lower rates with providers', 'The process of determining how two or more insurance plans share payment for a claim', 'Billing the patient for charges above the allowed amount', 'Adjusting a claim based on a fee schedule'], answer: 1, explanation: 'Coordination of benefits (COB) establishes which plan pays first (primary) and which pays second (secondary) when a patient has multiple insurance coverages, preventing overpayment.' },
    { q: 'A provider has a contract with an insurance company and sees an in-network patient. After the payer pays $180, the provider bills the patient $70 for a service with an allowed amount of $200. What should happen to the extra $70?', options: ['The provider keeps it as profit', 'The patient must pay it', 'The provider adjusts it off per the contract — balance billing is prohibited', 'The provider submits it to a secondary plan'], answer: 2, explanation: 'In-network providers agree to accept the payer\'s allowed amount as payment in full. Balance billing (billing the patient for the difference between billed and allowed amounts) is prohibited under most contracts. The $20 remaining ($200 – $180 paid) would be patient cost-sharing, not the extra $70.' },
    { q: 'The revenue cycle step that verifies a patient\'s insurance is active and the service is covered BEFORE the appointment is called:', options: ['Charge capture', 'Eligibility verification', 'Remittance posting', 'Denial management'], answer: 1, explanation: 'Eligibility verification (or benefits verification) is performed prior to the patient\'s visit to confirm active coverage, benefits, cost-sharing amounts, and any authorization requirements. It prevents billing surprises and denials.' },
    { q: 'Medicare timely filing requires claims to be submitted within:', options: ['90 days of the date of service', '6 months of the date of service', '12 months of the date of service', '24 months of the date of service'], answer: 2, explanation: 'Medicare requires claims to be filed within 12 months (one year) from the date of service. Missing this deadline results in a permanent denial — the provider cannot collect from Medicare or, in most cases, from the patient.' },
    { q: 'Under the birthday rule, a child is covered by both parents\' insurance. Parent A\'s birthday is March 15; Parent B\'s is July 22. Which plan is primary?', options: ['Parent B\'s plan — the later birthday is primary', 'Parent A\'s plan — the earlier birthday in the calendar year is primary', 'The plan with the higher premium is primary', 'The child\'s own plan if they have one'], answer: 1, explanation: 'The birthday rule states that the plan of the parent whose birthday falls earliest in the calendar year is primary for the dependent child. Parent A (March 15) has an earlier birthday than Parent B (July 22), so Parent A\'s plan is primary.' },
    { q: 'Which reimbursement model pays hospitals a fixed predetermined amount per inpatient admission based on the patient\'s diagnosis?', options: ['Fee-for-service', 'Capitation', 'DRG prospective payment', 'Per diem'], answer: 2, explanation: 'The DRG (Diagnosis-Related Group) prospective payment system pays hospitals a fixed amount per Medicare inpatient admission based on the principal diagnosis and other factors. The hospital profits if costs are below the DRG rate, absorbs losses if above.' },
    { q: 'A provider receives an Electronic Remittance Advice (ERA) showing a denial with reason code CO-4. This means:', options: ['The service is not covered by the plan', 'The claim was filed after the timely filing deadline', 'The procedure code is inconsistent with the modifier', 'The patient is not eligible on the date of service'], answer: 2, explanation: 'CO-4 (Claim Adjustment Reason Code 4) indicates "The service is inconsistent with the modifier." The provider should review the modifier usage and resubmit or appeal with documentation.' },
    { q: 'An allowed amount of $200, patient copay of $40, and insurance payment of $160 results in a contractual adjustment of:', options: ['$0', '$40', '$160', 'The difference between the billed amount and the $200 allowed amount'], answer: 3, explanation: 'The contractual adjustment is the difference between the provider\'s billed charge and the payer\'s allowed amount. If the provider billed $300 and the allowed is $200, the adjustment is $100. The $200 is then split: $160 paid by insurance + $40 patient copay.' },
    { q: 'Which type of plan requires patients to choose a primary care physician and get referrals to see specialists?', options: ['PPO', 'EPO', 'HMO', 'HDHP'], answer: 2, explanation: 'HMOs (Health Maintenance Organizations) require patients to select a PCP who coordinates care and provides referrals to in-network specialists. PPOs allow direct specialist access. EPOs don\'t require referrals but restrict to the network.' },
    { q: 'When a patient has Workers\' Compensation coverage for a work-related injury, Workers\' Comp is billed:', options: ['After Medicare pays', 'After the patient\'s private insurance pays', 'As the primary payer for the work-related condition', 'Only if the patient\'s other insurance denies the claim'], answer: 2, explanation: 'Workers\' Compensation is always primary for conditions arising from workplace injuries or illnesses. The patient\'s other insurance (including Medicare or Medicaid) should not be billed for work-related services — Workers\' Comp covers them.' },
    { q: 'A provider\'s clean claim rate drops to 82%. This most likely indicates:', options: ['Excellent billing performance', 'The practice is collecting payments too slowly', 'Systemic billing errors that need to be identified and corrected', 'The payer is processing claims correctly'], answer: 2, explanation: 'A clean claim rate of 82% means 18% of claims have errors on first submission. The industry benchmark is 95%+. A low rate increases denials, delays payment, and raises administrative costs. Root cause analysis and staff training are needed.' },
    { q: 'Which of the following is NOT a step in the revenue cycle?', options: ['Patient registration', 'Claim submission', 'Prescribing medications', 'Denial management'], answer: 2, explanation: 'Prescribing medications is a clinical function, not a revenue cycle step. The revenue cycle encompasses administrative and financial functions from pre-registration through final payment collection.' },
    { q: 'A patient\'s primary insurance pays $300 on a $500 claim. The secondary insurance receives the claim. The secondary payer will:', options: ['Pay the full $500 regardless of the primary payment', 'Potentially pay some or all of the remaining $200, depending on their benefits', 'Automatically deny the claim since another payer already paid', 'Always pay exactly 50% of the remaining balance'], answer: 1, explanation: 'The secondary payer reviews the claim along with the primary\'s payment and applies their own benefits. They may pay some or all of the remaining balance up to their allowed amount, but will not cause the total payments to exceed the billed amount.' },
  ],
};

// ─── LESSON DATA ──────────────────────────────────────────────────────────────
const lessons = [

// ═══════════════════════════════════════════════════════════════
// SECTION 1: INTRODUCTION TO HEALTH INSURANCE
// ═══════════════════════════════════════════════════════════════
{
  section: 'INTRODUCTION TO HEALTH INSURANCE', sort: 1, type: 'text',
  title: 'Welcome to Medical Insurance and Reimbursement',
  content: `<h2>Welcome to Medical Insurance and Reimbursement</h2>
<p>Health insurance is the financial backbone of the American healthcare system. Every clinical service delivered — from a routine blood pressure check to open-heart surgery — must be documented, coded, billed, and reimbursed. Without an efficient, compliant billing and reimbursement process, healthcare organizations cannot sustain operations.</p>
<h3>Why This Course Matters</h3>
<p>Medical insurance and reimbursement knowledge is required for virtually every administrative and clinical support role in healthcare. Billing errors cost the US healthcare system an estimated <strong>$935 billion annually</strong> — and skilled professionals who can navigate the system correctly are in constant demand.</p>
<h3>What You Will Learn</h3>
<ul>
  <li>How health insurance works: premiums, deductibles, copays, and coinsurance</li>
  <li>Major payer types: Medicare, Medicaid, commercial insurance, TRICARE, and Workers' Compensation</li>
  <li>Managed care plan structures: HMO, PPO, EPO, and POS</li>
  <li>The revenue cycle from patient registration through final payment</li>
  <li>Completing and submitting the CMS-1500 claim form</li>
  <li>Understanding remittance advice, denials, and appeals</li>
  <li>Reimbursement methodologies: fee-for-service, DRGs, capitation, and value-based models</li>
  <li>Coordination of benefits rules including the birthday rule</li>
</ul>
<h3>Career Relevance</h3>
<p>This content directly prepares you for the <strong>NHA CBCS</strong> (Certified Billing and Coding Specialist) and <strong>CMAA</strong> (Certified Medical Administrative Assistant) exams, as well as real-world billing and administrative roles across all healthcare settings.</p>
<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>📊 Industry Facts:</strong> According to the U.S. Bureau of Labor Statistics, medical records and billing positions are projected to grow <strong>17% through 2031</strong>. The median annual wage for billing and coding specialists is <strong>$46,660</strong> nationally.
</div>
<h3>Course Structure</h3>
<ol>
  <li>Introduction to Health Insurance</li>
  <li>Payers and Coverage</li>
  <li>The Revenue Cycle</li>
  <li>Claims Processing</li>
  <li>Reimbursement Systems</li>
  <li>Exam Preparation and Final Assessment</li>
</ol>`
},
{
  section: 'INTRODUCTION TO HEALTH INSURANCE', sort: 2, type: 'presentation',
  title: 'Health Insurance Overview',
  pptxKey: 'insurance-overview',
},
{
  section: 'INTRODUCTION TO HEALTH INSURANCE', sort: 3, type: 'text',
  title: 'Types of Health Insurance Plans',
  content: `<h2>Types of Health Insurance Plans</h2>
<p>Not all health insurance plans work the same way. Understanding the differences between plan types is essential for billing, patient counseling, and managing authorizations correctly.</p>

<h3>Managed Care Plan Types</h3>

<h4>Health Maintenance Organization (HMO)</h4>
<ul>
  <li>Patient must select a <strong>Primary Care Physician (PCP)</strong> who coordinates all care</li>
  <li>PCP referral required to see a specialist</li>
  <li>Coverage is <strong>in-network only</strong> (except emergencies)</li>
  <li>Lower premiums and out-of-pocket costs</li>
  <li>Less flexibility in provider choice</li>
</ul>

<h4>Preferred Provider Organization (PPO)</h4>
<ul>
  <li>No PCP required; patients can self-refer to any provider</li>
  <li>In-network providers cost less; out-of-network care is covered at higher cost-share</li>
  <li>Greater flexibility but higher premiums</li>
  <li>Most common plan type in employer-sponsored coverage</li>
</ul>

<h4>Exclusive Provider Organization (EPO)</h4>
<ul>
  <li>No referrals needed (like PPO)</li>
  <li>Coverage restricted to in-network only (like HMO)</li>
  <li>Lower premiums than PPO; less flexibility</li>
  <li>No out-of-network coverage except emergencies</li>
</ul>

<h4>Point of Service (POS)</h4>
<ul>
  <li>Hybrid of HMO and PPO</li>
  <li>Requires PCP and referrals (like HMO) for in-network services</li>
  <li>Allows out-of-network care at higher cost-share (like PPO)</li>
</ul>

<h4>High Deductible Health Plan (HDHP)</h4>
<ul>
  <li>Higher deductible than traditional plans (minimum $1,600 individual / $3,200 family in 2024)</li>
  <li>Lower premiums</li>
  <li>Eligible to pair with a <strong>Health Savings Account (HSA)</strong></li>
  <li>Patient pays full cost until deductible is met; then standard cost-sharing applies</li>
</ul>

<h3>Comparison Table</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;">
    <th style="padding:8px;text-align:left;">Feature</th>
    <th style="padding:8px;">HMO</th>
    <th style="padding:8px;">PPO</th>
    <th style="padding:8px;">EPO</th>
    <th style="padding:8px;">POS</th>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:8px;border:1px solid #e2e8f0;">PCP required</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Yes</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">No</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">No</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Yes</td>
  </tr>
  <tr>
    <td style="padding:8px;border:1px solid #e2e8f0;">Referrals needed</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Yes</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">No</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">No</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Yes (in-net)</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:8px;border:1px solid #e2e8f0;">Out-of-network covered</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">No*</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Yes</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">No*</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Yes</td>
  </tr>
  <tr>
    <td style="padding:8px;border:1px solid #e2e8f0;">Premium level</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Low</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">High</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Medium</td>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">Medium</td>
  </tr>
</table>
<p style="font-size:12px;color:#64748b;">*Except emergencies</p>`
},
{
  section: 'INTRODUCTION TO HEALTH INSURANCE', sort: 4, type: 'text',
  title: 'Insurance Terminology Essentials',
  content: `<h2>Insurance Terminology Essentials</h2>
<p>Mastery of insurance terminology is fundamental to working in any healthcare administrative role. These are the terms you will encounter daily in billing, registration, and patient financial counseling.</p>

<h3>Core Financial Terms</h3>

<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;">
    <th style="padding:10px;text-align:left;">Term</th>
    <th style="padding:10px;text-align:left;">Definition</th>
  </tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Premium</td><td style="padding:10px;border:1px solid #e2e8f0;">The monthly payment to maintain insurance coverage, regardless of whether services are used.</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Deductible</td><td style="padding:10px;border:1px solid #e2e8f0;">The amount the insured pays before insurance begins covering costs. Resets annually.</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Copayment</td><td style="padding:10px;border:1px solid #e2e8f0;">A fixed dollar amount paid per visit or service (e.g., $30 per PCP visit).</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Coinsurance</td><td style="padding:10px;border:1px solid #e2e8f0;">The percentage of covered costs paid by the patient after the deductible (e.g., 20% of the allowed amount).</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Out-of-Pocket Maximum</td><td style="padding:10px;border:1px solid #e2e8f0;">The most the insured pays for covered services in a plan year. After this is reached, the plan pays 100%.</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Allowed Amount</td><td style="padding:10px;border:1px solid #e2e8f0;">The maximum the payer will pay for a covered service. Providers contracted with the payer must accept this as payment in full.</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Contractual Adjustment</td><td style="padding:10px;border:1px solid #e2e8f0;">The difference between the billed charge and the allowed amount; written off by the contracted provider.</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Balance Billing</td><td style="padding:10px;border:1px solid #e2e8f0;">Billing the patient for the difference between billed and allowed amounts. Prohibited for in-network providers under most contracts.</td></tr>
</table>

<h3>Coverage and Claims Terms</h3>

<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;">
    <th style="padding:10px;text-align:left;">Term</th>
    <th style="padding:10px;text-align:left;">Definition</th>
  </tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Subscriber</td><td style="padding:10px;border:1px solid #e2e8f0;">The person who holds the insurance policy (the insured).</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Dependent</td><td style="padding:10px;border:1px solid #e2e8f0;">A family member covered under the subscriber's policy (spouse, children up to age 26 under ACA).</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Member ID / Subscriber ID</td><td style="padding:10px;border:1px solid #e2e8f0;">Unique identification number assigned to the insured by the payer.</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Group Number</td><td style="padding:10px;border:1px solid #e2e8f0;">Identifies the employer or group under which the policy was issued.</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">NPI</td><td style="padding:10px;border:1px solid #e2e8f0;">National Provider Identifier — the unique 10-digit number required on all HIPAA standard transactions for providers.</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">EOB</td><td style="padding:10px;border:1px solid #e2e8f0;">Explanation of Benefits — document sent to the patient explaining how their claim was processed.</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">ERA / Remittance Advice</td><td style="padding:10px;border:1px solid #e2e8f0;">Electronic Remittance Advice — payment explanation sent to the provider detailing what was paid or denied.</td></tr>
  <tr><td style="padding:10px;border:1px solid #e2e8f0;font-weight:bold;">Formulary</td><td style="padding:10px;border:1px solid #e2e8f0;">The list of prescription drugs covered under a health plan, organized into tiers by cost.</td></tr>
</table>`
},
{ section: 'INTRODUCTION TO HEALTH INSURANCE', sort: 5, type: 'quiz', title: 'Quiz 1: Health Insurance Fundamentals', quizKey: 'q1' },

// ═══════════════════════════════════════════════════════════════
// SECTION 2: PAYERS AND COVERAGE
// ═══════════════════════════════════════════════════════════════
{
  section: 'PAYERS AND COVERAGE', sort: 6, type: 'text',
  title: 'Government Programs: Medicare and Medicaid',
  content: `<h2>Government Programs: Medicare and Medicaid</h2>
<p>Medicare and Medicaid are the two largest health insurance programs in the United States, covering over 140 million Americans combined. Every healthcare professional must understand how these programs work, who they cover, and their basic billing rules.</p>

<h3>Medicare</h3>
<p>Medicare is a federal program administered by the Centers for Medicare & Medicaid Services (CMS). Eligibility:</p>
<ul>
  <li>U.S. citizens or permanent residents age <strong>65 and older</strong></li>
  <li>Individuals under 65 with <strong>qualifying disabilities</strong> (after 24-month waiting period)</li>
  <li>Any age with <strong>End-Stage Renal Disease (ESRD)</strong> or <strong>ALS</strong></li>
</ul>

<h4>Medicare Parts</h4>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;">
    <th style="padding:8px;">Part</th><th style="padding:8px;">Name</th><th style="padding:8px;text-align:left;">Covers</th>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">A</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Hospital Insurance</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Inpatient hospital, skilled nursing facility, hospice, some home health</td>
  </tr>
  <tr>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">B</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Medical Insurance</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Physician services, outpatient care, preventive services, DME</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">C</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Medicare Advantage</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Private plan alternative covering all of A + B; often includes D and extras</td>
  </tr>
  <tr>
    <td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">D</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Prescription Drug</td>
    <td style="padding:8px;border:1px solid #e2e8f0;">Outpatient prescription drugs through private plans</td>
  </tr>
</table>

<h3>Medicaid</h3>
<p>Medicaid is a <strong>joint federal-state program</strong> providing coverage to low-income individuals. Unlike Medicare (one federal program), each state runs its own Medicaid program within federal guidelines.</p>
<ul>
  <li>Eligibility based on income (generally up to 138% of Federal Poverty Level in expansion states)</li>
  <li>Covers: children, pregnant women, elderly low-income adults, disabled individuals</li>
  <li>ACA Medicaid expansion extended coverage to millions of low-income adults</li>
  <li>Benefits and reimbursement rates vary significantly by state</li>
  <li>Medicaid is always the <strong>payer of last resort</strong> — billed after all other insurance</li>
</ul>

<h3>CHIP</h3>
<p>The Children's Health Insurance Program provides low-cost coverage to children in families who earn too much for Medicaid but can't afford private insurance. Jointly funded by federal and state governments.</p>

<div style="background:#fff7ed;border-left:4px solid #ea580c;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Billing Note:</strong> Always check whether a Medicare patient has a Medicare Advantage (Part C) plan. If they do, you bill the private Medicare Advantage plan — NOT traditional Medicare. The MA plan may have different rules, network requirements, and reimbursement rates.
</div>`
},
{
  section: 'PAYERS AND COVERAGE', sort: 7, type: 'presentation',
  title: 'Medicare & Medicaid Deep Dive',
  pptxKey: 'medicare-medicaid',
},
{
  section: 'PAYERS AND COVERAGE', sort: 8, type: 'text',
  title: 'Managed Care: HMO, PPO, EPO, and POS Plans',
  content: `<h2>Managed Care: HMO, PPO, EPO, and POS Plans</h2>
<p>Managed care organizations (MCOs) are health plans that contract with providers to deliver care to their members. They use various mechanisms to manage costs and coordinate care. Understanding how each plan type works is essential for billing and patient guidance.</p>

<h3>Key Managed Care Concepts</h3>

<h4>Network Providers</h4>
<p>Managed care plans contract with specific providers (physicians, hospitals, labs) to form a network. In-network providers have agreed to accept the plan's negotiated rates. Out-of-network providers have not — and patients typically pay significantly more (or get no coverage at all) for out-of-network care.</p>

<h4>Gatekeeper Model (HMO)</h4>
<p>In HMO plans, the Primary Care Physician (PCP) acts as a "gatekeeper" who:</p>
<ul>
  <li>Provides routine and preventive care</li>
  <li>Coordinates specialist referrals</li>
  <li>Authorizes certain tests and procedures</li>
  <li>Manages the patient's overall healthcare</li>
</ul>

<h4>Prior Authorization in Managed Care</h4>
<p>Most managed care plans require prior authorization (prior auth or PA) for:</p>
<ul>
  <li>Non-emergency surgeries and procedures</li>
  <li>Advanced imaging (MRI, CT, PET)</li>
  <li>Specialty referrals (HMOs)</li>
  <li>High-cost medications</li>
  <li>Durable Medical Equipment (DME)</li>
  <li>Inpatient admissions (except emergencies)</li>
</ul>
<p>Failure to obtain required authorization is one of the leading causes of claim denials. Authorization numbers must be documented and included on claims.</p>

<h3>Point-of-Service Plans</h3>
<p>POS plans give patients more flexibility by allowing out-of-network use at a higher cost. Patients choose at each visit (point of service) whether to use in-network (lower cost, PCP referral required) or out-of-network (higher cost, no referral needed).</p>

<h3>Medicare Advantage (Part C) Plans</h3>
<p>Medicare Advantage plans are managed care plans approved by Medicare. They must cover all Medicare Part A and B services but may have different rules:</p>
<ul>
  <li>May require network-based care (HMO-style) or allow broader access (PPO-style)</li>
  <li>Often include additional benefits: dental, vision, hearing, fitness programs</li>
  <li>May require prior authorization for services not required by traditional Medicare</li>
  <li><strong>Billing goes to the MA plan, not to traditional Medicare</strong></li>
</ul>`
},
{
  section: 'PAYERS AND COVERAGE', sort: 9, type: 'text',
  title: "Workers' Compensation and Other Payers",
  content: `<h2>Workers' Compensation and Other Payers</h2>
<p>Beyond commercial insurance, Medicare, and Medicaid, several other payer types require specialized knowledge in healthcare billing.</p>

<h3>Workers' Compensation</h3>
<p>Workers' Compensation (WC) is a state-mandated insurance program that covers medical expenses and lost wages for employees injured on the job or who develop occupational illnesses.</p>
<ul>
  <li>Every state has its own WC laws and approved fee schedules</li>
  <li>Workers' Comp is always <strong>primary</strong> for work-related conditions</li>
  <li>Do NOT bill the patient's health insurance for work-related injuries</li>
  <li>Claims go to the employer's WC insurer, not to the patient's health plan</li>
  <li>Each claim requires a claim number assigned by the WC insurer</li>
  <li>Providers must use approved WC billing forms and follow state-specific rules</li>
</ul>
<p>Common WC covered conditions: back injuries, repetitive stress injuries, occupational lung disease, workplace accidents, needlestick injuries.</p>

<h3>TRICARE</h3>
<p>Federal health insurance program for active duty military, retirees, and their dependents. Multiple plan options (TRICARE Prime, Select, For Life). TRICARE For Life acts as secondary payer for Medicare-eligible military retirees.</p>

<h3>Veterans Administration (VA)</h3>
<p>The VA operates its own healthcare system for eligible veterans. Distinct from TRICARE:</p>
<ul>
  <li>VA care is provided at VA facilities</li>
  <li>Community Care programs allow VA-authorized care at non-VA providers</li>
  <li>Billing for VA Community Care goes through the VA's third-party administrator</li>
</ul>

<h3>CHAMPVA</h3>
<p>Civilian Health and Medical Program of the Department of Veterans Affairs — covers veterans' family members who are not eligible for TRICARE.</p>

<h3>Auto/Liability Insurance</h3>
<p>When injuries result from auto accidents or other liability situations:</p>
<ul>
  <li>Auto insurance (MedPay or PIP — Personal Injury Protection) may pay first</li>
  <li>Liability insurance (at-fault party's insurer) may be billed</li>
  <li>Always get accident date and insurance information at registration</li>
  <li>Liens may be placed on potential legal settlements</li>
</ul>

<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Key Rule for All Specialty Payers:</strong> Always identify all insurance coverage at registration, determine the correct order of billing, and obtain the appropriate claim numbers and authorization before submitting. Specialty payers have their own forms, rules, and deadlines that differ from standard commercial insurance.
</div>`
},
{ section: 'PAYERS AND COVERAGE', sort: 10, type: 'quiz', title: 'Quiz 2: Payers and Coverage', quizKey: 'q2' },

// ═══════════════════════════════════════════════════════════════
// SECTION 3: THE REVENUE CYCLE
// ═══════════════════════════════════════════════════════════════
{
  section: 'THE REVENUE CYCLE', sort: 11, type: 'text',
  title: 'Patient Registration and Eligibility Verification',
  content: `<h2>Patient Registration and Eligibility Verification</h2>
<p>The revenue cycle begins long before the patient sees the provider. A thorough registration and eligibility verification process is the single most effective way to prevent claim denials and billing surprises.</p>

<h3>Patient Registration</h3>
<p>Registration captures all information needed to identify the patient, establish financial responsibility, and bill correctly. Key data elements collected at registration:</p>
<ul>
  <li><strong>Demographics:</strong> Full legal name, date of birth, address, phone, email</li>
  <li><strong>Insurance information:</strong> Carrier name, member ID, group number, PCP (if HMO)</li>
  <li><strong>Photo ID verification:</strong> Government-issued ID to prevent identity fraud</li>
  <li><strong>Insurance card copy:</strong> Front and back — always</li>
  <li><strong>Secondary insurance:</strong> Any additional coverage</li>
  <li><strong>Guarantor information:</strong> The person financially responsible (may differ from patient)</li>
  <li><strong>Reason for visit:</strong> Drives authorization determination</li>
  <li><strong>Accident/Workers' Comp information:</strong> If applicable</li>
</ul>

<h3>Insurance Eligibility Verification</h3>
<p>Eligibility verification confirms that the patient's insurance is active and that the service is covered. It should be performed:</p>
<ul>
  <li><strong>Before every appointment</strong> — even for established patients (coverage changes)</li>
  <li>At least 24–48 hours before the scheduled visit (or in real time for urgent care/ED)</li>
  <li>Again at check-in if changes are suspected</li>
</ul>

<h4>What to Verify</h4>
<ul>
  <li>Plan is active and the patient is eligible on the date of service</li>
  <li>In-network status of the rendering provider</li>
  <li>Deductible amount and how much has been met year-to-date</li>
  <li>Copay and coinsurance amounts for the type of service</li>
  <li>Out-of-pocket maximum and amount met</li>
  <li>Whether a referral or prior authorization is required</li>
  <li>Covered benefits for the planned service</li>
</ul>

<h3>Electronic Eligibility Inquiry (270/271)</h3>
<p>The HIPAA 270 transaction is the electronic eligibility inquiry sent to the payer. The 271 is the payer's response. Most practice management systems automate this process and display results in real time.</p>

<h3>Advance Beneficiary Notice (ABN)</h3>
<p>For Medicare patients, if a provider believes Medicare is likely to deny a service as "not medically necessary" or "not covered," they must issue an ABN before the service is provided. The ABN:</p>
<ul>
  <li>Informs the patient that Medicare may not pay</li>
  <li>Gives the patient the option to proceed (and accept financial responsibility) or decline</li>
  <li>Must be signed by the patient before the service</li>
  <li>Without a signed ABN, the provider cannot bill the Medicare patient if the claim is denied</li>
</ul>`
},
{
  section: 'THE REVENUE CYCLE', sort: 12, type: 'presentation',
  title: 'Revenue Cycle Management',
  pptxKey: 'revenue-cycle',
},
{
  section: 'THE REVENUE CYCLE', sort: 13, type: 'text',
  title: 'Charge Capture and Fee Schedules',
  content: `<h2>Charge Capture and Fee Schedules</h2>
<p>Charge capture is the process of converting clinical services into billable charges. It is the bridge between clinical care and the billing office. Missed charges mean lost revenue; inflated charges create compliance risk.</p>

<h3>The Charge Capture Process</h3>
<ol>
  <li><strong>Service documentation:</strong> The physician documents the encounter in the EHR — diagnoses, procedures, and services provided</li>
  <li><strong>Code assignment:</strong> Medical coders review documentation and assign ICD-10-CM (diagnosis) and CPT/HCPCS (procedure) codes</li>
  <li><strong>Charge entry:</strong> Coded services are entered into the practice management or billing system</li>
  <li><strong>Charge review:</strong> Charges are audited for accuracy before claim submission</li>
  <li><strong>Claim generation:</strong> The system creates the claim based on entered charges</li>
</ol>

<h3>Fee Schedules</h3>
<p>A fee schedule is a list of services and the prices a provider or payer assigns to each. There are two important fee schedules in every billing encounter:</p>

<h4>Provider's Charge Master / Fee Schedule</h4>
<ul>
  <li>The prices the provider <em>bills</em> for each service</li>
  <li>Typically set well above expected reimbursement</li>
  <li>For hospitals: the Charge Description Master (CDM) lists all services and charge codes</li>
</ul>

<h4>Payer's Fee Schedule / Allowed Amount</h4>
<ul>
  <li>The maximum the payer will pay for each service (the allowed amount)</li>
  <li>Contracted providers accept this as payment in full</li>
  <li>Medicare's Physician Fee Schedule is based on RVUs (Relative Value Units)</li>
  <li>Commercial payers often base rates on a percentage of the Medicare fee schedule</li>
</ul>

<h3>Relative Value Units (RVUs)</h3>
<p>Medicare uses RVUs to determine physician payment. Each procedure has three RVU components:</p>
<ul>
  <li><strong>Work RVU:</strong> Physician time, skill, and effort</li>
  <li><strong>Practice Expense RVU:</strong> Overhead costs (staff, equipment, supplies)</li>
  <li><strong>Malpractice RVU:</strong> Liability insurance costs</li>
</ul>
<p>Total RVUs × Geographic Practice Cost Index (GPCI) × Conversion Factor = Medicare Allowed Amount</p>

<h3>Modifiers</h3>
<p>CPT modifiers are two-digit codes appended to procedure codes to provide additional information:</p>
<ul>
  <li><strong>-25:</strong> Significant, separate E/M service on the same day as a procedure</li>
  <li><strong>-59:</strong> Distinct procedural service (different session, site, or injury)</li>
  <li><strong>-LT / -RT:</strong> Left side / right side of the body</li>
  <li><strong>-TC / -26:</strong> Technical component / Professional component (for diagnostic tests)</li>
</ul>`
},
{
  section: 'THE REVENUE CYCLE', sort: 14, type: 'text',
  title: 'Superbills and Encounter Forms',
  content: `<h2>Superbills and Encounter Forms</h2>
<p>The superbill (also called an encounter form or charge ticket) is a preprinted or electronic form that captures the key billing information from a patient visit. It is one of the most important charge capture tools in outpatient settings.</p>

<h3>What the Superbill Contains</h3>
<ul>
  <li><strong>Patient demographics:</strong> Name, DOB, insurance information</li>
  <li><strong>Provider information:</strong> NPI, name, specialty</li>
  <li><strong>Date of service</strong></li>
  <li><strong>Diagnosis codes:</strong> Pre-printed ICD-10-CM codes for common diagnoses in the practice's specialty</li>
  <li><strong>Procedure codes:</strong> Pre-printed CPT codes for common services the practice provides</li>
  <li><strong>Place of service code</strong></li>
  <li><strong>Provider signature</strong></li>
  <li><strong>Return visit information</strong></li>
</ul>

<h3>How It Works in Practice</h3>
<ol>
  <li>Patient checks in; demographics and insurance pre-populated from the system</li>
  <li>Physician sees the patient and documents the encounter</li>
  <li>Physician circles or selects applicable diagnosis and procedure codes on the superbill</li>
  <li>Superbill is submitted to the billing department</li>
  <li>Biller reviews, enters charges, and generates the claim</li>
</ol>

<h3>Electronic Superbills (EHR Integration)</h3>
<p>In modern EHR systems, the superbill is embedded in the workflow. The physician selects diagnoses and procedures within the EHR, which automatically creates the charge in the practice management system. This reduces:</p>
<ul>
  <li>Transcription errors</li>
  <li>Lost paper superbills</li>
  <li>Delays in charge entry</li>
  <li>Coding discrepancies</li>
</ul>

<h3>Place of Service (POS) Codes</h3>
<p>The POS code on a claim indicates where the service was rendered. Medicare and other payers use POS codes to determine appropriate payment levels:</p>
<ul>
  <li><strong>POS 11:</strong> Office (physician's office)</li>
  <li><strong>POS 21:</strong> Inpatient hospital</li>
  <li><strong>POS 22:</strong> On-campus outpatient hospital</li>
  <li><strong>POS 23:</strong> Emergency room</li>
  <li><strong>POS 31:</strong> Skilled nursing facility</li>
  <li><strong>POS 12:</strong> Home</li>
  <li><strong>POS 02:</strong> Telehealth (patient in their home)</li>
</ul>
<p>Using the wrong POS code results in incorrect reimbursement and can trigger audits. Medicare pays differently for the same E/M service depending on whether it is billed as office (POS 11) vs. outpatient hospital (POS 22).</p>`
},
{ section: 'THE REVENUE CYCLE', sort: 15, type: 'quiz', title: 'Quiz 3: Revenue Cycle', quizKey: 'q3' },

// ═══════════════════════════════════════════════════════════════
// SECTION 4: CLAIMS PROCESSING
// ═══════════════════════════════════════════════════════════════
{
  section: 'CLAIMS PROCESSING', sort: 16, type: 'text',
  title: 'Completing the CMS-1500 Form',
  content: `<h2>Completing the CMS-1500 Form</h2>
<p>The CMS-1500 is the standard paper claim form used by non-institutional providers (physicians, nurse practitioners, therapists, and other outpatient/office-based providers) to bill Medicare, Medicaid, and most commercial payers. Its electronic equivalent is the 837P transaction.</p>

<h3>Key Sections of the CMS-1500</h3>

<h4>Patient and Insured Information (Boxes 1–13)</h4>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Box</th><th style="padding:8px;text-align:left;">Contents</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1</td><td style="padding:8px;border:1px solid #e2e8f0;">Insurance type (Medicare, Medicaid, TRICARE, CHAMPVA, Group, FECA, Other)</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">1a</td><td style="padding:8px;border:1px solid #e2e8f0;">Insured's ID number (Member ID)</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">2</td><td style="padding:8px;border:1px solid #e2e8f0;">Patient's name (Last, First, MI)</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">3</td><td style="padding:8px;border:1px solid #e2e8f0;">Patient's date of birth and sex</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">11</td><td style="padding:8px;border:1px solid #e2e8f0;">Insured's group/FECA number</td></tr>
</table>

<h4>Diagnosis and Service Information (Boxes 21–24)</h4>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Box</th><th style="padding:8px;text-align:left;">Contents</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">21</td><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Diagnosis codes (ICD-10-CM)</strong> — up to 12 diagnosis codes, labeled A through L</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">24A</td><td style="padding:8px;border:1px solid #e2e8f0;">Date(s) of service</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">24B</td><td style="padding:8px;border:1px solid #e2e8f0;">Place of Service (POS) code</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">24D</td><td style="padding:8px;border:1px solid #e2e8f0;"><strong>CPT/HCPCS procedure codes</strong> and modifiers</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">24E</td><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Diagnosis pointer</strong> — letter(s) from Box 21 linking service to diagnosis</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">24F</td><td style="padding:8px;border:1px solid #e2e8f0;">Charge amount for each service line</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">24J</td><td style="padding:8px;border:1px solid #e2e8f0;">Rendering provider's NPI</td></tr>
</table>

<h4>Provider Information (Boxes 31–33)</h4>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Box</th><th style="padding:8px;text-align:left;">Contents</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">31</td><td style="padding:8px;border:1px solid #e2e8f0;">Provider signature and date</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;">32</td><td style="padding:8px;border:1px solid #e2e8f0;">Service facility location (if different from billing address)</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;text-align:center;font-weight:bold;">33</td><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Billing provider name, address, phone, and NPI</strong></td></tr>
</table>

<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Exam Tip:</strong> The most tested CMS-1500 boxes are 21 (diagnosis codes), 24D (procedure codes), 24E (diagnosis pointer), and 33 (billing provider NPI). Know what goes in each.
</div>`
},
{
  section: 'CLAIMS PROCESSING', sort: 17, type: 'presentation',
  title: 'Claims Submission & Processing',
  pptxKey: 'claims',
},
{
  section: 'CLAIMS PROCESSING', sort: 18, type: 'text',
  title: 'Remittance Advice and Explanation of Benefits',
  content: `<h2>Remittance Advice and Explanation of Benefits</h2>
<p>After a payer processes a claim, they send two types of payment explanation documents: one to the provider and one to the patient. Understanding how to read these documents is essential for billing staff.</p>

<h3>Remittance Advice (RA) / Electronic Remittance Advice (ERA)</h3>
<p>The Remittance Advice is sent to the <strong>provider</strong> and details how each claim was processed. The electronic version (835 transaction) integrates directly with practice management systems for automated posting.</p>

<h4>Key Elements of the RA</h4>
<ul>
  <li><strong>Patient name and claim number</strong></li>
  <li><strong>Date of service</strong></li>
  <li><strong>Billed amount</strong> — what the provider charged</li>
  <li><strong>Allowed amount</strong> — what the payer determined as the maximum payable</li>
  <li><strong>Contractual adjustment</strong> — the write-off (billed minus allowed)</li>
  <li><strong>Paid amount</strong> — what the payer is paying</li>
  <li><strong>Patient responsibility</strong> — deductible, copay, coinsurance</li>
  <li><strong>Claim Adjustment Reason Codes (CARCs)</strong> — explain adjustments</li>
  <li><strong>Remittance Advice Remark Codes (RARCs)</strong> — additional explanations</li>
</ul>

<h3>Common CARC Codes</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:8px;">Code</th><th style="padding:8px;text-align:left;">Meaning</th></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">CO-4</td><td style="padding:8px;border:1px solid #e2e8f0;">Procedure code inconsistent with modifier</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">CO-11</td><td style="padding:8px;border:1px solid #e2e8f0;">Diagnosis inconsistent with procedure</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">CO-29</td><td style="padding:8px;border:1px solid #e2e8f0;">Time limit for filing has expired (timely filing)</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">CO-45</td><td style="padding:8px;border:1px solid #e2e8f0;">Contractual adjustment (not a denial — just the write-off)</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">PR-1</td><td style="padding:8px;border:1px solid #e2e8f0;">Patient deductible (patient responsibility)</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">PR-2</td><td style="padding:8px;border:1px solid #e2e8f0;">Patient coinsurance (patient responsibility)</td></tr>
  <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">PR-3</td><td style="padding:8px;border:1px solid #e2e8f0;">Patient copayment (patient responsibility)</td></tr>
</table>

<h3>Explanation of Benefits (EOB)</h3>
<p>The EOB is sent to the <strong>patient</strong> (or insured) and explains in consumer-friendly language how their claim was processed. It typically shows:</p>
<ul>
  <li>Provider name and date of service</li>
  <li>What was billed and what the plan paid</li>
  <li>What the patient owes (deductible, copay, coinsurance)</li>
  <li>A statement that it is NOT a bill (patients often confuse EOBs with bills)</li>
</ul>

<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Patient Communication Tip:</strong> Many patients call confused after receiving an EOB, thinking it is a bill. Always train front-desk staff to explain that the EOB is an explanation from the insurance company. The actual bill comes from the provider's billing office.
</div>`
},
{
  section: 'CLAIMS PROCESSING', sort: 19, type: 'text',
  title: 'Denials, Appeals, and Adjustments',
  content: `<h2>Denials, Appeals, and Adjustments</h2>
<p>Claim denials are a fact of life in healthcare billing. The difference between a high-performing billing office and a struggling one is often how efficiently they manage denials. Every denial should be reviewed, categorized, and acted upon.</p>

<h3>Rejected vs. Denied Claims</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;">
  <tr style="background:#1e3a8a;color:white;"><th style="padding:10px;">Rejected</th><th style="padding:10px;">Denied</th></tr>
  <tr style="background:#f8fafc;">
    <td style="padding:10px;border:1px solid #e2e8f0;">Never entered the payer's adjudication system</td>
    <td style="padding:10px;border:1px solid #e2e8f0;">Entered, adjudicated, and not paid</td>
  </tr>
  <tr>
    <td style="padding:10px;border:1px solid #e2e8f0;">Usually due to format/data errors (invalid NPI, missing fields)</td>
    <td style="padding:10px;border:1px solid #e2e8f0;">May be due to clinical, eligibility, or administrative reasons</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:10px;border:1px solid #e2e8f0;">Corrected and resubmitted as a new claim</td>
    <td style="padding:10px;border:1px solid #e2e8f0;">Appealed or corrected and resubmitted per payer rules</td>
  </tr>
</table>

<h3>Common Denial Reasons</h3>
<ul>
  <li><strong>Not medically necessary:</strong> Payer determined the service wasn't clinically justified — appeal with medical documentation</li>
  <li><strong>Not covered / excluded benefit:</strong> Service not in the patient's plan — may bill patient if informed in advance</li>
  <li><strong>Prior authorization required:</strong> Auth wasn't obtained — may be able to get retroactive auth; otherwise appeal</li>
  <li><strong>Patient not eligible:</strong> Coverage lapsed on DOS — verify eligibility; may need to bill patient</li>
  <li><strong>Duplicate claim:</strong> Same claim was already processed — verify original was paid or resolve</li>
  <li><strong>Timely filing exceeded:</strong> Very difficult to reverse; document submission proof</li>
  <li><strong>Coordination of benefits:</strong> Other insurance not billed first — bill in correct order</li>
</ul>

<h3>The Appeals Process</h3>
<ol>
  <li><strong>Review the denial reason code</strong> — understand exactly why it was denied</li>
  <li><strong>Gather supporting documentation</strong> — medical records, clinical notes, authorization numbers</li>
  <li><strong>Correct any errors</strong> — resubmit corrected claims within the payer's timely filing window</li>
  <li><strong>File a formal appeal</strong> — submit a written appeal letter with supporting documentation within the payer's appeal deadline (typically 30–180 days)</li>
  <li><strong>Track the appeal</strong> — document all correspondence, dates, and reference numbers</li>
  <li><strong>Escalate if needed</strong> — second-level appeal, external review, or state insurance commissioner complaint</li>
</ol>

<h3>Write-offs and Adjustments</h3>
<ul>
  <li><strong>Contractual adjustments:</strong> Required write-off per payer contract (not discretionary)</li>
  <li><strong>Bad debt:</strong> Uncollectible patient balances (must follow collection policy before writing off)</li>
  <li><strong>Charity care:</strong> Discounts or write-offs per the facility's financial assistance policy</li>
  <li><strong>Prompt pay discounts:</strong> Reduction offered for timely payment</li>
</ul>
<p>Write-offs require supervisor approval and proper documentation. Arbitrary write-offs without following policy can violate payer contracts and regulatory requirements.</p>`
},
{ section: 'CLAIMS PROCESSING', sort: 20, type: 'quiz', title: 'Quiz 4: Claims Processing', quizKey: 'q4' },

// ═══════════════════════════════════════════════════════════════
// SECTION 5: REIMBURSEMENT SYSTEMS
// ═══════════════════════════════════════════════════════════════
{
  section: 'REIMBURSEMENT SYSTEMS', sort: 21, type: 'text',
  title: 'How Providers Get Paid',
  content: `<h2>How Providers Get Paid</h2>
<p>Understanding how reimbursement works — from billed charge to actual payment — is fundamental to healthcare financial management. The path from service delivery to payment involves multiple steps, parties, and calculations.</p>

<h3>The Payment Calculation Sequence</h3>
<ol>
  <li><strong>Provider bills at charge amount</strong> (always higher than expected reimbursement)</li>
  <li><strong>Payer applies the allowed amount</strong> from their fee schedule</li>
  <li><strong>Contractual adjustment</strong> = billed amount – allowed amount (written off by provider)</li>
  <li><strong>Patient cost-sharing applied</strong> (deductible, copay, coinsurance)</li>
  <li><strong>Payer pays</strong> = allowed amount – patient cost-sharing</li>
  <li><strong>Provider bills patient</strong> for their cost-sharing portion</li>
</ol>

<h4>Example</h4>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:12px 0;">
  <p><strong>Service billed:</strong> $500</p>
  <p><strong>Payer's allowed amount:</strong> $300</p>
  <p><strong>Contractual adjustment:</strong> $500 – $300 = <strong>$200 (write-off)</strong></p>
  <p><strong>Patient's deductible:</strong> already met</p>
  <p><strong>Patient coinsurance:</strong> 20% of $300 = <strong>$60</strong></p>
  <p><strong>Insurance pays:</strong> 80% of $300 = <strong>$240</strong></p>
  <p><strong>Provider collects:</strong> $240 (insurance) + $60 (patient) = $300 total</p>
</div>

<h3>Participating vs. Non-Participating Providers</h3>
<ul>
  <li><strong>Participating (PAR):</strong> Contracted with the payer; accept the allowed amount as payment in full; cannot balance bill patients for the contractual difference</li>
  <li><strong>Non-participating (Non-PAR):</strong> Not contracted; may charge patients more (subject to state surprise billing laws); patients pay higher out-of-network rates</li>
  <li><strong>For Medicare:</strong> Non-PAR providers can still bill Medicare but receive 5% less than PAR providers and may charge patients up to 15% above the Medicare limiting charge</li>
</ul>

<h3>The No Surprises Act (2022)</h3>
<p>Federal law that protects patients from unexpected out-of-network bills in most situations:</p>
<ul>
  <li>Prohibits surprise billing for emergency services</li>
  <li>Prohibits out-of-network billing at in-network facilities without patient consent</li>
  <li>Requires good faith cost estimates for scheduled services</li>
  <li>Establishes an Independent Dispute Resolution (IDR) process for provider-payer disputes</li>
</ul>`
},
{
  section: 'REIMBURSEMENT SYSTEMS', sort: 22, type: 'presentation',
  title: 'Reimbursement Methodologies',
  pptxKey: 'reimbursement',
},
{
  section: 'REIMBURSEMENT SYSTEMS', sort: 23, type: 'text',
  title: 'Coordination of Benefits and Secondary Billing',
  content: `<h2>Coordination of Benefits and Secondary Billing</h2>
<p>When a patient has more than one insurance plan, Coordination of Benefits (COB) rules determine the order in which plans pay. Proper COB prevents overpayment and ensures providers receive accurate reimbursement.</p>

<h3>COB Order of Liability</h3>
<p>The primary payer pays first according to their benefits. The secondary payer then pays any remaining balance up to their allowed amount. The patient pays any remaining cost-sharing not covered by either plan.</p>

<h4>General COB Rules</h4>
<ul>
  <li><strong>Medicaid is always last</strong> — it is the payer of last resort. Bill all other coverage first.</li>
  <li><strong>Medicare as Secondary Payer (MSP):</strong> Medicare is secondary when the patient has employer group coverage through active employment (employer with 20+ employees), Workers' Comp, auto/liability insurance, or ESRD coverage in the first 30 months</li>
  <li><strong>Workers' Compensation:</strong> Always primary for work-related conditions</li>
  <li><strong>TRICARE For Life:</strong> Secondary to Medicare for Medicare-eligible military retirees</li>
</ul>

<h3>The Birthday Rule</h3>
<p>When a dependent child is covered by both parents' insurance plans, the birthday rule determines which plan is primary:</p>
<ul>
  <li>The plan of the parent whose <strong>birthday falls first in the calendar year</strong> (month and day, not year) is <strong>primary</strong></li>
  <li>The other parent's plan is secondary</li>
  <li>If both parents have the same birthday, the plan that covered the parent longer is primary</li>
  <li><strong>Exception:</strong> In cases of divorce or separation, a court order may specify which plan is primary</li>
</ul>

<h4>Birthday Rule Example</h4>
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:12px 0;">
  <p>Parent A birthday: <strong>April 3</strong> → Plan A</p>
  <p>Parent B birthday: <strong>November 18</strong> → Plan B</p>
  <p><strong>Result:</strong> Plan A is primary (April comes before November)</p>
</div>

<h3>Secondary Claim Billing</h3>
<p>When billing a secondary payer:</p>
<ol>
  <li>Wait for the primary payer's EOB/ERA to be received and payment posted</li>
  <li>Submit the secondary claim including the primary's payment information (allowed amount, paid amount, patient responsibility)</li>
  <li>The secondary payer applies their own benefits to the remaining balance</li>
  <li>The secondary will not pay more than their allowed amount, and total payments from all insurers cannot exceed the billed amount</li>
</ol>

<h3>Crossover Claims</h3>
<p>For dual-eligible patients (Medicare + Medicaid), Medicare often automatically forwards the claim to Medicaid after processing — this is called a crossover claim. Not all claims crossover automatically; billers must know which states/plans participate in the Medicare-Medicaid crossover program.</p>`
},
{ section: 'REIMBURSEMENT SYSTEMS', sort: 24, type: 'quiz', title: 'Quiz 5: Reimbursement Systems', quizKey: 'q5' },

// ═══════════════════════════════════════════════════════════════
// SECTION 6: EXAM PREPARATION
// ═══════════════════════════════════════════════════════════════
{
  section: 'EXAM PREPARATION', sort: 25, type: 'text',
  title: 'Study Guide and Key Concepts Review',
  content: `<h2>Study Guide and Key Concepts Review</h2>
<p>Use this guide as your final review before your certification exam. Each section's key points are summarized with the most exam-relevant details highlighted.</p>

<h3>Section 1: Health Insurance Basics</h3>
<ul>
  <li><strong>Premium</strong> = monthly cost; <strong>Deductible</strong> = pay before insurance starts; <strong>Copay</strong> = fixed per visit; <strong>Coinsurance</strong> = % split after deductible</li>
  <li>Out-of-pocket maximum caps annual patient spending on covered services</li>
  <li>Allowed amount = what the payer pays; contractual adjustment = write-off for contracted providers</li>
  <li>Balance billing prohibited for in-network (contracted) providers</li>
  <li>Always collect and copy both sides of the insurance card</li>
</ul>

<h3>Section 2: Payers</h3>
<ul>
  <li><strong>Medicare Part A:</strong> Inpatient hospital, SNF, hospice | <strong>Part B:</strong> Outpatient, physician | <strong>Part C:</strong> MA (private) | <strong>Part D:</strong> Drugs</li>
  <li>Medicare Advantage (Part C): bill the MA plan, not traditional Medicare</li>
  <li>Medicaid: joint federal-state; payer of last resort; varies by state</li>
  <li>Workers' Comp: always primary for work-related conditions; do not bill other insurance</li>
  <li>HMO: PCP + referrals + network-only | PPO: no referral + out-of-network allowed | EPO: no referral + network-only</li>
</ul>

<h3>Section 3: Revenue Cycle</h3>
<ul>
  <li>Revenue cycle begins at pre-registration and ends at final payment</li>
  <li>Verify eligibility before every appointment — even established patients</li>
  <li>Prior auth required for most elective surgeries, advanced imaging, specialty drugs</li>
  <li>Charge capture: documentation → coding → charge entry → review → claim</li>
  <li>Medicare ABN required when Medicare is likely to deny; must be signed before service</li>
  <li>Key metrics: Days in A/R (<40), Clean Claim Rate (>95%), Denial Rate (<5%)</li>
</ul>

<h3>Section 4: Claims</h3>
<ul>
  <li>CMS-1500 key boxes: <strong>21</strong> (ICD-10 dx codes), <strong>24D</strong> (CPT codes), <strong>24E</strong> (dx pointer), <strong>33</strong> (billing NPI)</li>
  <li>837P = electronic professional claim; 835 = electronic remittance advice</li>
  <li><strong>Rejected</strong> = never entered system (format error); <strong>Denied</strong> = processed but not paid</li>
  <li>Medicare timely filing: 12 months from date of service</li>
  <li>CO-45 = contractual adjustment (not a denial); PR-1 = patient deductible</li>
  <li>Appeal denials within payer's deadline with supporting documentation</li>
</ul>

<h3>Section 5: Reimbursement</h3>
<ul>
  <li>Fee-for-service: payment per service; Medicare uses RVUs × conversion factor</li>
  <li>DRGs: fixed payment per Medicare inpatient admission by diagnosis group</li>
  <li>Capitation: fixed monthly payment per enrolled patient (PMPM)</li>
  <li>COB: primary pays first; Medicaid always last; Workers' Comp always primary for work injuries</li>
  <li>Birthday rule: earlier birthday in calendar year = primary plan for children with two parents' coverage</li>
  <li>Medicare Secondary Payer (MSP): Medicare secondary when patient has active employer group coverage</li>
</ul>

<div style="background:#f0f7ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>Exam Strategy:</strong> For calculation questions, work through the math step by step: (1) identify billed amount, (2) apply allowed amount, (3) calculate contractual adjustment, (4) apply deductible, (5) apply coinsurance/copay, (6) insurance pays the rest. Practice this sequence until it's automatic.
</div>`
},
{
  section: 'EXAM PREPARATION', sort: 26, type: 'presentation',
  title: 'Exam Strategy: Medical Insurance & Reimbursement',
  pptxKey: 'exam-prep',
},
{ section: 'EXAM PREPARATION', sort: 27, type: 'quiz', title: 'Final Assessment: Medical Insurance and Reimbursement Exam', quizKey: 'final' },

]; // end lessons

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const conn = await mysql.createConnection(DB);

  // Clear existing content
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
      content = ''; // questions go in quiz_questions table
    }

    const [result] = await conn.execute(
      `INSERT INTO lessons (course_id, title, type, content, file_path, sort_order, section_title, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [COURSE_ID, lesson.title, lesson.type, content, filePath, lesson.sort, lesson.section, slug(lesson.title)]
    );
    const lessonId = result.insertId;
    console.log(`  ✓ [${lesson.sort}] ${lesson.type}: ${lesson.title} (id=${lessonId})`);

    // Insert quiz questions directly into quiz_questions table
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
