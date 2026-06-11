const { SearchServiceClient } = require('@google-cloud/discoveryengine').v1;

// Initialize the Discovery Engine Client
let client = null;
try {
  // It will automatically look for GOOGLE_APPLICATION_CREDENTIALS or use ADC.
  client = new SearchServiceClient();
} catch (e) {
  console.warn('⚠️ Google Cloud Agent Builder client could not be initialized:', e.message);
}

/**
 * Searches Google Cloud Agent Builder for clinical guidelines and protocols.
 * Includes a robust fallback mechanism if credentials or environment variables are missing.
 */
async function searchClinicalGuidelines(query) {
  if (!client) {
    console.log('⚠️ Agent Builder client not initialized, returning fallback guidelines');
    return getFallbackGuidelines(query);
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.PROJECT_ID;
  const dataStoreId = process.env.AGENT_BUILDER_DATA_STORE_ID;
  
  if (!projectId || !dataStoreId) {
    console.log('⚠️ PROJECT_ID or AGENT_BUILDER_DATA_STORE_ID not set, using fallback guidelines.');
    return getFallbackGuidelines(query);
  }

  // Format: projects/{project}/locations/{location}/collections/{collection}/dataStores/{data_store}/servingConfigs/{serving_config}
  const location = process.env.AGENT_BUILDER_LOCATION || 'global';
  const name = `projects/${projectId}/locations/${location}/collections/default_collection/dataStores/${dataStoreId}/servingConfigs/default_search`;

  try {
    console.log(`🔍 Querying Google Cloud Agent Builder for: "${query}"`);
    const request = {
      servingConfig: name,
      query: query,
    };
    
    const [response] = await client.search(request);
    
    if (response.results && response.results.length > 0) {
      return response.results.map(res => {
        const doc = res.document;
        // Parse document structure (adjust as per your Agent Builder schema)
        const structData = doc.derivedStructData || doc.structData || {};
        return {
          title: structData.title || doc.name || 'Clinical Document',
          snippet: structData.snippet || 'Relevant clinical information found.',
          link: structData.link || ''
        };
      });
    }
  } catch (error) {
    console.error('❌ Google Cloud Agent Builder search error:', error.message);
  }

  return getFallbackGuidelines(query);
}

// Fallback logic so the app continues to function smoothly without Google Cloud credentials
function getFallbackGuidelines(query) {
  const q = query.toLowerCase();
  
  if (q.includes('dengue')) {
    return [
      {
        title: "National Guidelines for Clinical Management of Dengue Fever",
        snippet: "For Dengue Fever, maintain oral hydration. Monitor hematocrit levels daily. Avoid NSAIDs (like Ibuprofen, Aspirin) due to platelet dysfunction and bleeding risk; use Paracetamol for fever control.",
        link: "https://nvbdcp.gov.in/index4.php?lang=1&level=0&linkid=427&lid=3697"
      },
      {
        title: "WHO Dengue Guidelines for Diagnosis, Treatment, Prevention and Control",
        snippet: "Categorize patients into Groups A, B, and C. Group A (sent home): check CBC daily. Group B (referred for in-hospital care): watch for warning signs like persistent vomiting, mucosal bleed, fluid accumulation.",
        link: "https://www.who.int/publications/i/item/9789241547871"
      }
    ];
  } else if (q.includes('hypertension') || q.includes('bp') || q.includes('blood pressure')) {
    return [
      {
        title: "Indian Guidelines on Hypertension (I.G.H. IV) - 2019",
        snippet: "Initiate monotherapy with ACE inhibitors, ARBs, CCBs, or thiazide-like diuretics. For patients with diabetes or CKD, ARBs or ACEIs are preferred first-line agents to protect renal function.",
        link: "https://www.japi.org/article/indian-guidelines-on-hypertension-iv"
      }
    ];
  } else if (q.includes('copd') || q.includes('shortness of breath') || q.includes('asthma')) {
    return [
      {
        title: "GOLD Guidelines for COPD Diagnosis and Management",
        snippet: "Use inhaled bronchodilators (LABA/LAMA) as first-line maintenance therapy. For acute exacerbations, system corticosteroids (e.g. prednisolone 40mg daily for 5 days) and antibiotics if sputum is purulent.",
        link: "https://goldcopd.org/2024-gold-report/"
      }
    ];
  } else if (q.includes('chest pain') || q.includes('angina') || q.includes('cardiac')) {
    return [
      {
        title: "AHA/ACC Guideline for the Evaluation and Diagnosis of Chest Pain",
        snippet: "Perform early ECG and Troponin testing. Assess risk using TIMI or HEART score. Do not prescribe NSAIDs for suspected acute coronary syndrome.",
        link: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001029"
      }
    ];
  }
  
  // Generic fallback for any other medical query
  return [
    {
      title: "Standard Treatment Guidelines for Primary Care",
      snippet: `Clinical assessment guidelines for "${query}". Ensure history of allergies is taken. Do not prescribe antibiotics unless bacterial infection is suspected. Verify contraindications and pediatric dosing.`,
      link: "https://nhsrcindia.org/standard-treatment-guidelines"
    }
  ];
}

module.exports = { searchClinicalGuidelines };
