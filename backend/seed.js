require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('./src/models/Patient');
const Consultation = require('./src/models/Consultation');
const { embedText, initGemini } = require('./src/services/gemini');

const DUMMY_PATIENTS = [
  { patientId: 'PID-101', name: 'Aarav Sharma', age: 45, gender: 'M', conditions: ['Hypertension', 'Type 2 Diabetes'], riskLevel: 'amber', diagnosis: 'Uncontrolled BP' },
  { patientId: 'PID-102', name: 'Priya Patel', age: 32, gender: 'F', conditions: ['No significant past history'], riskLevel: 'red', diagnosis: 'Dengue Fever' },
  { patientId: 'PID-103', name: 'Rohan Gupta', age: 58, gender: 'M', conditions: ['COPD', 'Smoker'], riskLevel: 'red', diagnosis: 'Acute Exacerbation of COPD' },
  { patientId: 'PID-104', name: 'Ananya Desai', age: 28, gender: 'F', conditions: ['PCOS'], riskLevel: 'green', diagnosis: 'Irregular periods' },
  { patientId: 'PID-105', name: 'Vikram Singh', age: 62, gender: 'M', conditions: ['Ischemic Heart Disease'], riskLevel: 'red', diagnosis: 'Atypical chest pain' },
  { patientId: 'PID-106', name: 'Neha Verma', age: 41, gender: 'F', conditions: ['Asthma'], riskLevel: 'amber', diagnosis: 'Mild wheezing' },
  { patientId: 'PID-107', name: 'Rajesh Kumar', age: 55, gender: 'M', conditions: ['Osteoarthritis'], riskLevel: 'green', diagnosis: 'Knee joint pain' },
  { patientId: 'PID-108', name: 'Sneha Reddy', age: 36, gender: 'F', conditions: ['Migraine'], riskLevel: 'amber', diagnosis: 'Severe unilateral headache' },
  { patientId: 'PID-109', name: 'Amit Jain', age: 50, gender: 'M', conditions: ['Hyperlipidemia'], riskLevel: 'amber', diagnosis: 'High cholesterol' },
  { patientId: 'PID-110', name: 'Kavita Iyer', age: 48, gender: 'F', conditions: ['Rheumatoid Arthritis'], riskLevel: 'amber', diagnosis: 'Joint stiffness' },
  { patientId: 'PID-111', name: 'Sanjay Bose', age: 65, gender: 'M', conditions: ['BPH'], riskLevel: 'green', diagnosis: 'Frequent urination' },
  { patientId: 'PID-112', name: 'Pooja Menon', age: 29, gender: 'F', conditions: ['Anemia'], riskLevel: 'amber', diagnosis: 'Fatigue and pallor' },
  { patientId: 'PID-113', name: 'Manish Tiwari', age: 53, gender: 'M', conditions: ['GERD'], riskLevel: 'green', diagnosis: 'Acid reflux' },
  { patientId: 'PID-114', name: 'Sunita Das', age: 60, gender: 'F', conditions: ['Osteoporosis'], riskLevel: 'amber', diagnosis: 'Back pain' },
  { patientId: 'PID-115', name: 'Rahul Joshi', age: 35, gender: 'M', conditions: ['Anxiety Disorder'], riskLevel: 'green', diagnosis: 'Palpitations' },
  { patientId: 'PID-116', name: 'Kiran Nair', age: 42, gender: 'F', conditions: ['Type 2 Diabetes'], riskLevel: 'red', diagnosis: 'Diabetic foot ulcer' },
  { patientId: 'PID-117', name: 'Deepak Chawla', age: 59, gender: 'M', conditions: ['Chronic Kidney Disease'], riskLevel: 'red', diagnosis: 'Elevated creatinine' },
  { patientId: 'PID-118', name: 'Meera Rajput', age: 31, gender: 'F', conditions: ['Endometriosis'], riskLevel: 'amber', diagnosis: 'Pelvic pain' },
  { patientId: 'PID-119', name: 'Alok Mishra', age: 47, gender: 'M', conditions: ['Fatty Liver'], riskLevel: 'green', diagnosis: 'Elevated liver enzymes' },
  { patientId: 'PID-120', name: 'Divya Kapoor', age: 54, gender: 'F', conditions: ['Hypertension'], riskLevel: 'amber', diagnosis: 'Headache and dizziness' },
];

const clinicalNotes = {
  'Uncontrolled BP': { s: 'Patient reports persistent morning headaches and dizziness for 3 days. Denies chest pain or shortness of breath.', o: 'BP: 165/95 mmHg. HR: 82 bpm. Rest of the systemic examination is unremarkable.', a: 'Uncontrolled Essential Hypertension, likely due to medication non-compliance.', p: 'Increase Amlodipine to 10mg OD. Review after 1 week.' },
  'Dengue Fever': { s: 'Patient complains of high-grade fever with chills, severe retro-orbital pain, and body ache for 4 days. Mild nausea present.', o: 'Temp: 102.5°F. BP: 100/65 mmHg. Petechiae noted on lower limbs. Tourniquet test positive.', a: 'Acute Febrile Illness - Suspected Dengue Fever with warning signs.', p: 'Admit for observation. Start IV fluids. Send blood for CBC, Dengue NS1 & IgM. Avoid NSAIDs.' },
  'Acute Exacerbation of COPD': { s: 'Patient presents with worsening shortness of breath and increased purulent sputum production over the last 48 hours.', o: 'SpO2: 88% on room air. RR: 24/min. Bilateral expiratory wheezes and crepitations heard.', a: 'Acute exacerbation of COPD, likely triggered by a lower respiratory tract infection.', p: 'Start nebulized salbutamol/ipratropium. Prescribe oral corticosteroids (Prednisolone 40mg) and broad-spectrum antibiotics. Follow up in 3 days.' },
  'Irregular periods': { s: 'Patient complains of irregular menstrual cycles (35-45 days) and recent weight gain. Noticeable increase in facial hair.', o: 'BMI: 28 kg/m². Mild hirsutism noted on chin and jawline. BP: 110/70 mmHg.', a: 'Polycystic Ovary Syndrome (PCOS) presenting with oligomenorrhea and hyperandrogenism.', p: 'Advised weight reduction and dietary changes. Start Metformin 500mg OD. Schedule pelvic ultrasound.' },
  'Atypical chest pain': { s: 'Patient describes a dull ache in the left side of the chest that comes and goes, occasionally radiating to the left shoulder.', o: 'BP: 130/80 mmHg. HR: 76 bpm. ECG shows no acute ischemic changes. Normal heart sounds.', a: 'Atypical chest pain, low suspicion for acute coronary syndrome but history of IHD warrants caution.', p: 'Optimize current anti-anginal medications. Schedule a stress test. Prescribe sublingual Nitroglycerin PRN.' },
  'Mild wheezing': { s: 'Patient reports a dry cough and mild wheezing, particularly at night and after exertion. Worsened over the last week.', o: 'SpO2: 97%. Mild end-expiratory wheeze auscultated bilaterally. No use of accessory muscles.', a: 'Mild exacerbation of Asthma, possibly allergic trigger.', p: 'Step up inhaled corticosteroid dose. Continue SOS Salbutamol inhaler. Review inhalation technique.' },
  'Knee joint pain': { s: 'Patient complains of bilateral knee pain, worse in the morning and after walking. Difficulty climbing stairs.', o: 'Crepitus present in both knees. Mild swelling on the right knee. Restricted range of motion due to pain.', a: 'Bilateral knee Osteoarthritis with acute flare.', p: 'Prescribe short course of NSAIDs. Recommend physiotherapy for quadriceps strengthening. Avoid prolonged standing.' },
  'Severe unilateral headache': { s: 'Patient reports a throbbing headache on the right side, accompanied by nausea and photophobia, lasting for 12 hours.', o: 'Vitals stable. Neurological examination is completely normal. No papilledema.', a: 'Acute migraine attack without aura.', p: 'Prescribe Sumatriptan 50mg STAT. Advise rest in a dark, quiet room. Maintain a headache diary.' },
  'High cholesterol': { s: 'Patient is asymptomatic. Found to have elevated cholesterol on a routine health check-up.', o: 'BMI: 26 kg/m². BP: 120/80 mmHg. No xanthelasma or tendinous xanthomas.', a: 'Primary Hyperlipidemia.', p: 'Start Atorvastatin 20mg HS. Advise low-saturated fat diet and regular aerobic exercise. Repeat lipid profile in 3 months.' },
  'Joint stiffness': { s: 'Patient complains of pain and stiffness in the small joints of both hands, lasting for more than an hour in the morning.', o: 'Synovial thickening and tenderness in bilateral MCP and PIP joints. Grip strength reduced.', a: 'Active Rheumatoid Arthritis.', p: 'Prescribe oral Methotrexate 15mg weekly with Folic acid. Bridge with short course of low-dose steroids.' },
  'Frequent urination': { s: 'Patient reports increased frequency of urination, nocturia (x4), and a feeling of incomplete bladder emptying.', o: 'Abdomen is soft, non-tender. Digital rectal exam (DRE) reveals a smooth, symmetrically enlarged prostate.', a: 'Benign Prostatic Hyperplasia (BPH) with lower urinary tract symptoms (LUTS).', p: 'Start Tamsulosin 0.4mg HS. Advise decreasing evening fluid intake. Check PSA levels.' },
  'Fatigue and pallor': { s: 'Patient complains of progressive fatigue, weakness, and occasional dizziness upon standing for the past 2 months.', o: 'Marked conjunctival and palmar pallor. Tachycardia (HR 100 bpm). Systolic flow murmur heard.', a: 'Severe Anemia, likely iron deficiency etiology given age and gender.', p: 'Prescribe oral ferrous sulfate. Send blood for CBC, Ferritin, and peripheral smear. Diet counseling.' },
  'Acid reflux': { s: 'Patient reports a burning sensation in the chest and sour belching, especially after heavy, spicy meals.', o: 'Vitals stable. Epigastric tenderness present on deep palpation. No guarding.', a: 'Gastroesophageal Reflux Disease (GERD).', p: 'Start Pantoprazole 40mg OD before breakfast for 4 weeks. Advise elevating head of bed and avoiding late meals.' },
  'Back pain': { s: 'Patient complains of a dull, aching pain in the lower back for 3 weeks. No radiation of pain to the legs. No bowel/bladder issues.', o: 'Tenderness over the lower lumbar spine. Straight Leg Raise (SLR) test negative bilaterally.', a: 'Mechanical low back pain, likely related to underlying Osteoporosis.', p: 'Prescribe Calcium/Vitamin D supplements. Recommend back strengthening exercises. Prescribe Paracetamol for pain.' },
  'Palpitations': { s: 'Patient reports sudden episodes of racing heart, sweating, and a feeling of impending doom, often triggered by work stress.', o: 'HR: 95 bpm, regular rhythm. BP: 115/75 mmHg. ECG is normal sinus rhythm.', a: 'Panic attacks/Anxiety disorder. No evidence of arrhythmias.', p: 'Reassurance provided. Prescribe short course of Propranolol 10mg PRN for palpitations. Refer for CBT.' },
  'Diabetic foot ulcer': { s: 'Patient reports a non-healing, painless ulcer on the sole of the right foot for 2 weeks. Noticed a foul smell today.', o: '2x2 cm ulcer on the plantar aspect of the right 1st metatarsal head. Slough present. Diminished pedal pulses. Loss of protective sensation.', a: 'Infected Diabetic Foot Ulcer (Wagner Grade 2) due to poorly controlled diabetes.', p: 'Urgent surgical debridement required. Start empiric oral antibiotics (Amoxicillin-Clavulanate). Strict off-loading.' },
  'Elevated creatinine': { s: 'Patient is generally asymptomatic but reports occasional swelling in the ankles towards the evening.', o: 'BP: 150/90 mmHg. Mild bilateral pitting pedal edema. Chest clear.', a: 'Progression of Chronic Kidney Disease (CKD), uncontrolled hypertension.', p: 'Adjust anti-hypertensives. Strict low-salt and low-protein diet. Repeat Renal Function Test (RFT) in 1 week.' },
  'Pelvic pain': { s: 'Patient complains of severe, cyclic pelvic pain that starts 2 days before menstruation and lasts throughout. OTC painkillers ineffective.', o: 'Abdomen is soft. Deep pelvic tenderness present on bimanual examination. No masses felt.', a: 'Suspected Endometriosis causing secondary dysmenorrhea.', p: 'Start continuous oral contraceptive pills (OCPs). Refer to Gynecology for further evaluation and ultrasound.' },
  'Elevated liver enzymes': { s: 'Patient is asymptomatic. Mild elevation in SGOT/SGPT noted on executive health screening.', o: 'BMI: 29 kg/m². Liver span is 14 cm (mild hepatomegaly). No signs of chronic liver disease (no spider angioma, no ascites).', a: 'Non-Alcoholic Fatty Liver Disease (NAFLD).', p: 'Advise strict diet control, weight loss, and exercise. Avoid hepatotoxic medications. Repeat LFTs in 3 months.' },
  'Headache and dizziness': { s: 'Patient reports occasional headaches localized to the occipital region and feeling lightheaded when standing up quickly.', o: 'BP: 145/90 mmHg standing, 150/95 mmHg sitting. No focal neurological deficits.', a: 'Sub-optimally controlled Hypertension with orthostatic symptoms.', p: 'Advise gradual position changes. Review medication compliance. Consider adjusting timing of anti-hypertensive doses.' }
};

const generateConsultation = (patient) => {
  const isHighRisk = patient.riskLevel === 'red';
  
  // Provide realistic notes or fallback if diagnosis not matched exactly
  const note = clinicalNotes[patient.diagnosis] || {
      s: `Patient reports symptoms related to ${patient.diagnosis}.`,
      o: `Vitals stable. Examination consistent with ${patient.conditions[0] || 'history'}.`,
      a: `Assessment: ${patient.diagnosis} secondary to ${patient.conditions[0] || 'underlying factors'}.`,
      p: `Advised lifestyle modifications and prescribed standard therapy. ⚠️ Doctor must review before prescribing.`
  };

  return {
    patientId: patient.patientId,
    patientName: patient.name,
    transcript: `Patient ${patient.name} presented with ${patient.diagnosis}. Past medical history includes ${patient.conditions.join(', ')}.`,
    soap: note,
    riskScore: isHighRisk ? 85 : patient.riskLevel === 'amber' ? 55 : 20,
    drugInteractions: isHighRisk ? [{ drugs: ["Aspirin", "Ibuprofen"], severity: "High", effect: "Increased risk of bleeding" }] : [],
    insuranceSummary: {
      icd10Code: isHighRisk ? "I20.9" : "J02.9",
      diagnosisDescription: patient.diagnosis,
      onsetDate: "2 days ago",
      isEmergency: isHighRisk,
      preExistingConditions: patient.conditions,
      proposedProcedures: isHighRisk ? ["ECG", "Troponin"] : [],
      estimatedCost: {
        consultation: 500,
        investigations: isHighRisk ? 2500 : 0,
        medicines: 800,
        total: isHighRisk ? 3800 : 1300
      },
      preAuthRequired: isHighRisk,
      tpaReadyNotes: `Patient presented with symptoms of ${patient.diagnosis}. Risk level is ${patient.riskLevel}.`
    },
  };
};

async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in the environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    initGemini(); // For generating embeddings

    // Insert Patients if they don't exist
    for (const p of DUMMY_PATIENTS) {
      const existing = await Patient.findOne({ patientId: p.patientId });
      if (!existing) {
        await Patient.create({
          ...p,
          lastVisit: new Date().toLocaleDateString('en-IN')
        });
        console.log(`Added patient: ${p.name}`);

        // Generate a matching consultation
        const consultationData = generateConsultation(p);
        
        // Generate vector embedding for the assessment
        let embedding = [];
        try {
          embedding = await embedText(consultationData.soap.a);
        } catch(e) {
          console.warn('Could not generate embedding for seed data');
        }
        
        await Consultation.create({
          ...consultationData,
          noteEmbedding: embedding || []
        });
        console.log(`Added consultation for: ${p.name}`);
      } else {
        console.log(`Skipping ${p.name} (already exists)`);
      }
    }

    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
