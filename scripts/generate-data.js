const fs = require('fs');
const path = require('path');

// Check if running in Custom mode
const isCustom = process.argv.includes('--custom') || process.env.CUSTOM === 'true';

// If not Custom, randomly select an audio file from public/audios
let selectedAudioFile = null;
if (!isCustom) {
    const audiosDir = path.join(__dirname, '../public/audios');
    try {
        const audioFiles = fs.readdirSync(audiosDir).filter(file => 
            file.endsWith('.wav') || file.endsWith('.mp3') || file.endsWith('.m4a')
        );
        
        if (audioFiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * audioFiles.length);
            selectedAudioFile = audioFiles[randomIndex];
            console.log(`[Non-Custom Mode] Randomly selected audio file: ${selectedAudioFile}`);
        } else {
            console.log('[Non-Custom Mode] No audio files found in public/audios directory');
        }
    } catch (error) {
        console.error('[Non-Custom Mode] Error reading audios directory:', error.message);
    }
} else {
    console.log('[Custom Mode] Running in custom mode - skipping random audio selection');
}

// Helper to generate 24h timeframes
function generate24hTimeframes(spotId) {
    const timeframes = [];
    const statuses = ['Analyzed', 'Processing', 'Pending', 'Active'];
    const risks = ['Low', 'Medium', 'High', 'Safe', 'Unknown'];

    for (let i = 0; i < 24; i++) {
        const start = i.toString().padStart(2, '0');
        const end = ((i + 1) % 24).toString().padStart(2, '0');
        const status = i < 15 ? 'Analyzed' : (i < 18 ? 'Processing' : 'Pending'); // Historical vs Future
        const risk = status === 'Analyzed' ? risks[Math.floor(Math.random() * risks.length)] : 'Unknown';

        timeframes.push({
            id: `tf-${spotId}-${start}`,
            name: `${start}:00 - ${end}:00`,
            status: status,
            risk: risk
        });
    }
    return timeframes;
}

// Master Data Definitions
const masterData = {
    cities: [
        {
            id: 'delhi',
            name: 'Delhi',
            state: 'Delhi',
            description: 'National Capital Territory',
            sectors: ['airports', 'railways', 'metro', 'malls', 'hospitals']
        },
        {
            id: 'mumbai',
            name: 'Mumbai',
            state: 'Maharashtra',
            description: 'Financial Capital of India',
            sectors: ['airports', 'railways', 'metro', 'commercial', 'ports']
        },
        {
            id: 'pune',
            name: 'Pune',
            state: 'Maharashtra',
            description: 'Oxford of the East',
            sectors: ['it_parks', 'education', 'malls']
        },
        {
            id: 'nagpur',
            name: 'Nagpur',
            state: 'Maharashtra',
            description: 'Orange City',
            sectors: ['railways', 'logistics']
        },
        {
            id: 'bangalore',
            name: 'Bangalore',
            state: 'Karnataka',
            description: 'Silicon Valley of India',
            sectors: ['it_parks', 'metro', 'airports', 'startups']
        },
        {
            id: 'mysore',
            name: 'Mysore',
            state: 'Karnataka',
            description: 'Heritage City',
            sectors: ['tourism', 'railways']
        },
        {
            id: 'hyderabad',
            name: 'Hyderabad',
            state: 'Telangana',
            description: 'City of Pearls',
            sectors: ['biotech', 'airports', 'it_parks']
        },
        {
            id: 'chennai',
            name: 'Chennai',
            state: 'Tamil Nadu',
            description: 'Detroit of India',
            sectors: ['ports', 'automotive', 'airports']
        },
        {
            id: 'coimbatore',
            name: 'Coimbatore',
            state: 'Tamil Nadu',
            description: 'Manchester of South India',
            sectors: ['textiles', 'engineering']
        },
        {
            id: 'kolkata',
            name: 'Kolkata',
            state: 'West Bengal',
            description: 'City of Joy',
            sectors: ['metro', 'bridges', 'ports']
        },
        {
            id: 'ahmedabad',
            name: 'Ahmedabad',
            state: 'Gujarat',
            description: 'Manchester of the East',
            sectors: ['textiles', 'riverfront', 'airports']
        },
        {
            id: 'surat',
            name: 'Surat',
            state: 'Gujarat',
            description: 'Diamond City',
            sectors: ['diamond', 'textiles']
        },
        {
            id: 'jaipur',
            name: 'Jaipur',
            state: 'Rajasthan',
            description: 'Pink City',
            sectors: ['tourism', 'airports', 'heritage']
        },
        {
            id: 'lucknow',
            name: 'Lucknow',
            state: 'Uttar Pradesh',
            description: 'City of Nawabs',
            sectors: ['transport', 'heritage']
        },
        {
            id: 'noida',
            name: 'Noida',
            state: 'Uttar Pradesh',
            description: 'IT & Industrial Hub',
            sectors: ['it_parks', 'manufacturing']
        },
        {
            id: 'kochi',
            name: 'Kochi',
            state: 'Kerala',
            description: 'Queen of the Arabian Sea',
            sectors: ['ports', 'navy', 'it_parks']
        },
        {
            id: 'chandigarh',
            name: 'Chandigarh',
            state: 'Punjab/Haryana',
            description: 'The City Beautiful',
            sectors: ['urban_planning', 'transport']
        },
        {
            id: 'bhubaneswar',
            name: 'Bhubaneswar',
            state: 'Odisha',
            description: 'Temple City',
            sectors: ['smart_city', 'it_parks']
        },
        {
            id: 'patna',
            name: 'Patna',
            state: 'Bihar',
            description: 'Historical City',
            sectors: ['transport', 'education']
        },
        {
            id: 'guwahati',
            name: 'Guwahati',
            state: 'Assam',
            description: 'Gateway to Northeast',
            sectors: ['transport', 'river']
        }
    ]
};

// Sector Templates
const sectorTemplates = {
    airports: {
        title: "Airports",
        icon: "Plane",
        capacity: "High Volume",
        utilization: "85%",
        facilities: "Terminals & Runways",
        places: [
            { name: "Main Terminal", type: "Terminal" },
            { name: "Cargo Hub", type: "Logistics" }
        ]
    },
    railways: {
        title: "Railways",
        icon: "Train",
        capacity: "High Density",
        utilization: "95%",
        facilities: "Stations & Yards",
        places: [
            { name: "Central Station", type: "Junction" },
            { name: "City Station", type: "Terminal" }
        ]
    },
    metro: {
        title: "Metro Rail",
        icon: "Train",
        capacity: "Rapid Transit",
        utilization: "80%",
        facilities: "Lines & Stations",
        places: [
            { name: "City Centre Station", type: "Underground" },
            { name: "Interchange Hub", type: "Elevated" }
        ]
    },
    malls: {
        title: "Shopping Malls",
        icon: "ShoppingBag",
        capacity: "Commercial",
        utilization: "70%",
        facilities: "Retail Complexes",
        places: [
            { name: "City Mall", type: "Retail" },
            { name: "Central Plaza", type: "Mixed Use" }
        ]
    },
    hospitals: {
        title: "Healthcare",
        icon: "Stethoscope",
        capacity: "Critical Care",
        utilization: "90%",
        facilities: "Medical Centers",
        places: [
            { name: "General Hospital", type: "Public" },
            { name: "City Care Center", type: "Private" }
        ]
    },
    it_parks: {
        title: "IT Parks",
        icon: "Building2",
        capacity: "Corporate",
        utilization: "88%",
        facilities: "Tech Campuses",
        places: [
            { name: "Tech Zone A", type: "SEZ" },
            { name: "Cyber City", type: "Campus" }
        ]
    },
    ports: {
        title: "Seaports",
        icon: "Ship",
        capacity: "Heavy Cargo",
        utilization: "75%",
        facilities: "Docks & Terminals",
        places: [
            { name: "Container Terminal", type: "Export" },
            { name: "Oil Jetty", type: "Import" }
        ]
    },
    education: {
        title: "Education Hubs",
        icon: "Building2",
        capacity: "Student Zones",
        utilization: "100%",
        facilities: "Universities",
        places: [
            { name: "University Campus", type: "Academic" },
            { name: "Research Institue", type: "R&D" }
        ]
    },
    // Fallback or specific ones can be mapped to generic types
    default: {
        title: "Infrastructure",
        icon: "Building2",
        capacity: "General",
        utilization: "50%",
        facilities: "Public Utility",
        places: [
            { name: "Zone A", type: "General" }
        ]
    }
};

function generateData() {
    const finalData = { cities: [] };

    masterData.cities.forEach(cityDef => {
        const citySectors = cityDef.sectors.map(sectorKey => {
            const template = sectorTemplates[sectorKey] || sectorTemplates.default;
            // Customize template for the city
            return {
                id: `${cityDef.id}-${sectorKey}`,
                title: template.title,
                icon: template.icon,
                capacity: template.capacity,
                utilization: template.utilization,
                facilities: template.facilities,
                places: template.places.map((placeDef, pIdx) => {
                    const placeId = `${cityDef.id}-${sectorKey}-p${pIdx}`;
                    return {
                        id: placeId,
                        name: placeDef.name,
                        status: Math.random() > 0.1 ? 'Active' : 'Maintenance',
                        type: placeDef.type,
                        spots: [
                            { id: `${placeId}-s1`, name: "Main Entrance", status: "Active" },
                            { id: `${placeId}-s2`, name: "Security Gate", status: Math.random() > 0.2 ? "Active" : "Alert" },
                            { id: `${placeId}-s3`, name: "Service Area", status: "Active" }
                        ].map(spot => ({
                            ...spot,
                            timeframes: generate24hTimeframes(spot.id)
                        }))
                    };
                })
            };
        });

        finalData.cities.push({
            id: cityDef.id,
            name: cityDef.name,
            description: cityDef.description,
            sectors: citySectors
        });
    });

    fs.writeFileSync(path.join(__dirname, '../data.json'), JSON.stringify(finalData, null, 2));
    console.log('Data generated successfully for', finalData.cities.length, 'cities.');
}

generateData();
