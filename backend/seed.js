require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('./src/models/Patient');
const Consultation = require('./src/models/Consultation');
const { embedText, initGemini } = require('./src/services/gemini');

const DUMMY_PATIENTS = [
  { patientId: 'PID-101', name: 'Aarav Sharma', age: 45, gender: 'M', conditions: ['Hypertension', 'Type 2 Diabetes'], riskLevel: 'amber', diagnosis: 'Uncontrolled BP' },
  { patientId: 'PID-102', name: 'Priya Patel', age: 32, gender: 'F', conditions: ['Hypothyroidism'], riskLevel: 'green', diagnosis: 'Routine checkup' },
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

const generateConsultation = (patient) => {
  const isHighRisk = patient.riskLevel === 'red';
  return {
    patientId: patient.patientId,
    patientName: patient.name,
    transcript: `Patient ${patient.name} presented with ${patient.diagnosis}. Past medical history includes ${patient.conditions.join(', ')}.`,
    soap: {
      s: `Patient reports symptoms related to ${patient.diagnosis}.`,
      o: `Vitals stable. Examination consistent with ${patient.conditions[0] || 'history'}.`,
      a: `Assessment: ${patient.diagnosis} secondary to ${patient.conditions[0] || 'underlying factors'}.`,
      p: `Advised lifestyle modifications and prescribed standard therapy. ⚠️ Doctor must review before prescribing.`
    },
    riskScore: isHighRisk ? 85 : patient.riskLevel === 'amber' ? 55 : 20,
    drugInteractions: [],
    janAushadhi: [{ branded: 'Standard Brand', generic: 'Standard Generic', savings: 50 }],
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
