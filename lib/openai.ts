import { prisma } from './db'
import type { Event } from '@/lib/types'

// Disable OpenAI integration
const useOpenAI = false;

// Categories for the intelligence updates
const categories = [
  'conflict', 
  'security', 
  'economy', 
  'diplomacy', 
  'humanitarian',
  'politics',
  'technology',
  'environment'
];

// Regions and their approximate coordinates
const regions = [
  { name: 'Eastern Europe', lat: 50.45, lng: 30.52 },
  { name: 'Middle East', lat: 31.77, lng: 35.21 },
  { name: 'East Asia', lat: 39.91, lng: 116.40 },
  { name: 'Southeast Asia', lat: 13.75, lng: 100.50 },
  { name: 'Africa', lat: -1.29, lng: 36.82 },
  { name: 'North America', lat: 38.90, lng: -77.03 },
  { name: 'South America', lat: -15.79, lng: -47.88 },
  { name: 'Western Europe', lat: 48.85, lng: 2.35 },
  { name: 'South Asia', lat: 28.61, lng: 77.21 },
  { name: 'Central Asia', lat: 43.22, lng: 76.85 },
];

// Source types
const sourceTypes = ['verified', 'osint', 'analysis', 'media'];

// Sources with their respective icons
const sources = [
  { name: 'Global Intelligence Network', type: 'verified', icon: 'government' },
  { name: 'OSINT Watch Telegram', type: 'osint', icon: 'telegram' },
  { name: 'Strategic Analysis Group', type: 'analysis', icon: 'satellite' },
  { name: 'Reuters', type: 'media', icon: 'news' },
  { name: 'Global Affairs Monitor', type: 'verified', icon: 'government' },
  { name: 'Diplomatic Observer', type: 'analysis', icon: 'news' },
  { name: 'Security Insights', type: 'osint', icon: 'satellite' },
  { name: 'Resource Monitor', type: 'verified', icon: 'satellite' },
];

// Analyst names and positions for reports
const analysts = [
  { name: 'Dr. Nadia Kazemi', position: 'Senior Iran Analyst' },
  { name: 'Michael Chen', position: 'Global Economics Analyst' },
  { name: 'Col. James Harrington (Ret.)', position: 'Defense Policy Advisor' },
  { name: 'Dr. Isabella Vega', position: 'Regional Political Analyst' },
  { name: 'Dr. Takashi Yamamoto', position: 'Technology Security Specialist' },
  { name: 'Sarah Reynolds', position: 'Climate Security Researcher' },
  { name: 'Dr. Emmanuel Okoro', position: 'Africa Policy Expert' },
  { name: 'Leila Ahmedova', position: 'Central Asia Specialist' },
  { name: 'Alexander Petrov', position: 'Eastern Europe Analyst' },
  { name: 'Dr. Maya Singh', position: 'South Asian Security Expert' },
];

// Random variation of coordinates to ensure dots aren't directly on top of each other
const getRandomCoords = (baseLat: number, baseLng: number) => {
  const latVariation = (Math.random() - 0.5) * 5;
  const lngVariation = (Math.random() - 0.5) * 5;
  
  return {
    lat: baseLat + latVariation,
    lng: baseLng + lngVariation
  };
};

// Generate random stock images for analysis reports
const getRandomStockImage = () => {
  const imageIds = [
    'photo-1575503802870-45de6a6217c8',
    'photo-1621155346337-1d19476ba7d6',
    'photo-1611273426858-450e7f08d386',
    'photo-1566859319348-56d4c3338e28',
    'photo-1620712943543-bcc4688e7485',
    'photo-1551636898-47668aa61de2',
    'photo-1526470608268-f674ce90ebd4',
    'photo-1512813389528-a682e55d4e48',
    'photo-1573164713988-8665fc963095',
    'photo-1535223289827-42f1e9919769',
  ];
  
  const randomId = imageIds[Math.floor(Math.random() * imageIds.length)];
  return `https://images.unsplash.com/${randomId}?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`;
};

// Generate random numbers for likes, comments, and read time
const getRandomEngagementStats = () => {
  return {
    likes: Math.floor(Math.random() * 500) + 50,
    comments: Math.floor(Math.random() * 100) + 10,
    readTime: Math.floor(Math.random() * 10) + 3,
  };
};

export async function generateIntelligenceUpdate(): Promise<Event> {
  try {
    // Get a random update from the database via API route
    const response = await fetch('/api/updates/random');
    if (!response.ok) {
      throw new Error('Failed to fetch random update');
    }
    const update = await response.json();
    
    // Set current timestamp to ensure it shows as "LIVE"
    update.timestamp = Date.now();
    
    return update;
  } catch (error) {
    console.error('Error generating intelligence update:', error);
    throw error;
  }
}

export const generateAnalysisReport = async () => {
  try {
    // Get a random update and convert it to an analysis report
    const update = await generateIntelligenceUpdate();
    if (!update) return null;

    return {
      id: Date.now(),
      title: `Analysis: ${update.title}`,
      category: update.category,
      author: "Intelligence Analysis Team",
      date: new Date().toISOString(),
      content: `Detailed analysis of the ${update.title} situation:\n\n${update.content}\n\nThis analysis is based on verified intelligence data and expert assessment.`,
      relatedUpdates: [update.id],
    };
  } catch (error) {
    console.error('Error generating analysis report:', error);
    return null;
  }
};

// Helper function to generate fallback analysis reports without OpenAI
const generateFallbackAnalysisReport = (
  category: string, 
  analyst: {name: string, position: string}
) => {
  const fallbackTitles = [
    `JCPOA 2.0: Iranian Nuclear Compliance Amid Regional Destabilization`,
    `Black Sea Naval Assets: Tactical Analysis of Russia's 5th Fleet Reconfiguration`,
    `Rare Earth Supply Chain Vulnerabilities: PRC Strategic Leverage 2025-2030`,
    `DPRK Hypersonic Program: Technical Assessment and Proliferation Vectors`,
    `West African Coup Corridor: Mapping Military Faction Networks and External Influence`
  ];
  
  const fallbackExcerpts = [
    `Technical analysis of satellite imagery from April 12 confirms deployment of specific tactical assets to contested sector.`,
    `Primary source intelligence indicates 68% probability of escalation within designated timeframe based on empirical indicators.`,
    `Field reporting confirms three-phase implementation of revised protocols, impacting strategic balance in corridor DZ-7.`,
    `OSINT-derived database tracking 147 incidents reveals systematic pattern with statistically significant correlation (p<0.01).`,
    `Cross-verified HUMINT from multiple asset classes confirms specific technology transfer through identified cutouts.`
  ];
  
  const randomTitle = fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)];
  const slug = randomTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
  // Create more detailed sample content for the fallback analysis report
  const detailedContent = `# ${randomTitle}

## Executive Summary

CLASSIFIED//NOFORN - This analysis provides tactical assessment of recent developments in the ${category} domain between March 15 - April 18, 2025. Primary indicators exceed WATCHCON thresholds established in DIRECTIVE 2023-47A. Technical analysis corroborates HUMINT reporting on specialized activity patterns, with high confidence attribution (87%) to ACTOR SIGMA-3.

## Key Findings

- **Technical Assessment**: IMINT from April 12 reveals deployment of specialized equipment at Grid Coordinates 37.42N, 45.09E, matching signatures observed during OPERATION SILENT HORIZON
- **Pattern Analysis**: Quantitative analysis of 147 incidents shows 43% increase in specific activity with p-value < 0.01 significance
- **Tactical Implications**: JIATF-East assessment indicates potential for Phase II escalation within 72-96 hour window
- **Strategic Context**: Activity correlates with known objectives outlined in ACTOR SIGMA-3's CONOP 7A documentation
- **Attribution Confidence**: Technical signatures match those observed in February 2024 incident (ref: INTEL-875-C)

## Strategic Assessment

Current activity patterns show deviation from established baselines by 2.7 standard deviations, triggering WATCHCON 2 protocols. Analysis of technical indicators suggests 76% probability of continuation along identified escalation ladder within designated timeframe. Monitoring of communication channels confirms operational preparation consistent with PHASE III protocols as outlined in CONPLAN 4102.

## Recommended Actions

1. Implement OPLAN 7B countermeasures in designated ROI
2. Increase ISR coverage of Grid Sectors 12-15 for minimum 96 hour window
3. Activate CENTCOM SIGINT platforms with specific collection requirements
4. Prepare contingency packages FOXTROT and ECHO for potential deployment
5. Brief principals on EXORD 225-23 implementation timeline

## Conclusion

Technical assessment confirms significant deviation from established patterns with high confidence in attribution and projected timeline. Recommend immediate implementation of enhanced monitoring protocols with escalation criteria as outlined in DIRECTIVE 2023-47A, Appendix C.

**Classification: CLASSIFIED//NOFORN**
**Sources: Multiple (IMINT, SIGINT, HUMINT - See Annex A)**
**Confidence: High (Technical Analysis), Medium-High (Timeline Projection)**`;

  // Create a fallback analysis report
  return {
    id: Date.now(),
    title: randomTitle,
    author: analyst.name,
    position: analyst.position,
    date: new Date().toISOString().split('T')[0],
    category,
    imageUrl: `https://source.unsplash.com/random/800x600/?${category}`,
    likes: Math.floor(Math.random() * 300) + 100,
    comments: Math.floor(Math.random() * 50) + 10,
    readTime: Math.floor(Math.random() * 10) + 5,
    slug: slug,
    excerpt: fallbackExcerpts[Math.floor(Math.random() * fallbackExcerpts.length)],
    content: detailedContent,
    commentsList: []
  };
}; 