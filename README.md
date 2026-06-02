<div align="center">
  <h1>🩺 VaidyaAI</h1>
  <p><strong>An Intelligent Clinical Assistant & Dashboard for Indian OPDs</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-vaidya--ai--1.onrender.com-10B981?style=for-the-badge&logo=render)](https://vaidya-ai-1.onrender.com/)
  [![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
</div>

<br />

VaidyaAI is an advanced clinical assistant designed to streamline Outpatient Department (OPD) workflows for doctors. By passively listening to doctor-patient consultations, it automatically generates structured clinical notes, assesses risk, flags drug interactions, and creates structured insurance pre-authorization summaries.

## ✨ Features

- **🎙️ Ambient Audio Scribing**: Automatically transcribe doctor-patient conversations using Gemini.
- **📝 Automated SOAP Notes**: Extracts Subjective, Objective, Assessment, and Plan data seamlessly.
- **⚠️ Real-time Risk Stratification**: Assigns Red/Amber/Green risk scores to prioritize critical patients.
- **💊 Drug Interaction Checker**: Flags dangerous polypharmacy interactions (e.g., Aspirin + Ibuprofen).
- **🛡️ Insurance Pre-Authorization**: Automatically structures diagnosis codes (ICD-10), clinical rationale, and estimated costs into a TPA-ready summary.
- **📄 Instant PDF Export**: Download consultation records with a single click.
- **🤖 MCP-Powered Agent Search**: Query patient history across the MongoDB database using natural language (e.g., *"Show me all high-risk cardiology patients from this week"*).

## 🚀 Live Demo

**Check out the live application here:** [https://vaidya-ai-1.onrender.com/](https://vaidya-ai-1.onrender.com/)

*(Note: The initial load might take up to 60 seconds as the backend wakes up from sleep on the free tier.)*

## 🏗️ Architecture

VaidyaAI uses a modern, AI-first architecture:

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion for a sleek, responsive dashboard.
- **Backend**: Express.js + Node.js
- **Database**: MongoDB (Mongoose) for storing patient records and consultation history.
- **AI Core**: Google Gemini 2.0 Flash for audio transcription and clinical NLP.
- **Tooling**: Model Context Protocol (MCP) to allow Gemini to directly query the MongoDB database safely.

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/aashnav01/vaidya_ai.git
cd vaidya_ai
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create a .env file and add your keys
cp .env.example .env
# Edit .env with MONGODB_URI and GEMINI_API_KEY

npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# (Optional) Create .env to point to local backend if not using default port
echo "VITE_API_URL=http://localhost:5000" > .env

npm run dev
```

## 🛡️ Privacy & Security

VaidyaAI processes sensitive clinical data. In a production environment, this architecture is designed to support HIPAA/HIPAA-equivalent compliance by ensuring secure API transit and allowing for on-premise LLM alternatives if necessary.

---
*Built for the future of healthcare in India.* 🇮🇳
