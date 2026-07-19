/**
 * Database seed script for demo/development
 * Run: npx tsx src/helpers/seed.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { KnowledgeBase } from '../models/KnowledgeBase.model';
import { env } from '../config/env';

const demoUsers = [
  { name: 'Admin User',    email: 'admin@matchlens.ai',     password: 'Admin@1234',     role: 'admin' },
  { name: 'Jane Organizer', email: 'organizer@matchlens.ai', password: 'Organizer@1234', role: 'organizer' },
  { name: 'Sam Security',  email: 'security@matchlens.ai',  password: 'Security@1234',  role: 'security' },
  { name: 'Dr. Medina',    email: 'medical@matchlens.ai',   password: 'Medical@1234',   role: 'medical' },
  { name: 'Val Volunteer', email: 'volunteer@matchlens.ai', password: 'Volunteer@1234', role: 'volunteer' },
];

const knowledgeDocs = [
  {
    title: 'Lost Child SOP',
    category: 'stadium_sop',
    tags: ['lost child', 'child', 'search', 'protocol'],
    content: `
LOST CHILD STANDARD OPERATING PROCEDURE

1. IMMEDIATE RESPONSE (0-5 minutes)
- Volunteer stays with distressed guardian
- Contact Security Control Room immediately (ext. 101)
- Do NOT announce over PA until Security confirms

2. INFORMATION GATHERING
- Child name, age, physical description, clothing
- Last known location and time
- Guardian contact information
- Any medical conditions

3. SEARCH PROTOCOL
- Assign 4 volunteers to search quadrant around last seen location
- Check all restrooms, food stands, medical points nearby
- Review CCTV with security team

4. REUNIFICATION
- Bring child to Child Safety Point (Gate 3, Section A)
- Never leave child alone — two-adult rule applies
- Document everything for incident report

5. ESCALATION
- If not found within 15 minutes: escalate to Stadium Commander
- If not found within 30 minutes: notify local police
`.trim(),
  },
  {
    title: 'Medical Emergency Procedures',
    category: 'emergency_procedure',
    tags: ['medical', 'emergency', 'first aid', 'cardiac', 'CPR'],
    content: `
MEDICAL EMERGENCY STANDARD PROCEDURES

CARDIAC ARREST:
1. Call for help immediately — shout and dial 999 / ext. 102
2. Begin CPR: 30 compressions, 2 breaths
3. Use nearest AED (marked on stadium map)
4. Clear 3-metre radius around patient

SEIZURE:
1. DO NOT restrain patient
2. Move obstacles away
3. Time the seizure
4. Recovery position after convulsions stop
5. Medical team ETA: 3-5 minutes

HEAT STROKE:
1. Move to shade/cool area immediately
2. Apply cold packs to neck, armpits, groin
3. Provide cool water if conscious
4. Do not leave patient alone

MEDICAL STATIONS:
- Gate 1 (North) — primary medical centre
- Gate 3 (South) — first aid point
- Section D concourse — mobile unit
- VIP area — dedicated medical team

Emergency: ext. 102 | External: 999 | Stadium Medical: +1-800-FIFA-MED
`.trim(),
  },
  {
    title: 'Crowd Management Guidelines',
    category: 'stadium_sop',
    tags: ['crowd', 'management', 'congestion', 'flow', 'gates'],
    content: `
CROWD MANAGEMENT GUIDELINES — FIFA WORLD CUP 2026

CAPACITY THRESHOLDS:
- Green (Normal): < 70% capacity
- Amber (Monitor): 70-85% capacity
- Red (Restrict): > 85% capacity
- Critical (Emergency): Queue at gates

GATE MANAGEMENT:
- Always keep 2 emergency exit routes clear
- Rotate gate assignments every 30 minutes during peak
- Use alternate routes: North Concourse → Gates 7-9
- East-West bridges open only when South concourse > 75%

VOLUNTEER DEPLOYMENT:
- 1 volunteer per 200 fans in normal conditions
- 1 volunteer per 100 fans in amber conditions
- Request additional staff via Organizer Radio Channel 3

COMMUNICATION:
- All crowd alerts via Stadium Radio Channel 1
- Urgent messages: use red emergency button on radio
`.trim(),
  },
  {
    title: 'Accessibility Guide',
    category: 'accessibility_guide',
    tags: ['wheelchair', 'accessibility', 'disabled', 'elderly', 'assistance'],
    content: `
ACCESSIBILITY GUIDE — FIFA WORLD CUP 2026 STADIUM

WHEELCHAIR USERS:
- Dedicated entrances: Gates 1, 4, 7 (level access)
- Wheelchair viewing platforms: Sections A1, B3, C2, D4
- Accessible restrooms: Near each gate and viewing platform
- Companion seats available at no extra cost

ELDERLY VISITORS:
- Priority queues at all gates
- Mobility scooter hire: Gate 1 Information Desk
- Rest areas: Every 200 metres on main concourse

VISUALLY IMPAIRED:
- Guide dogs welcome in all areas
- Audio guides available at Gate 1 Information Desk
- Tactile pathways from gates to stands

HEARING IMPAIRED:
- BSL interpreters available at Information Desks
- Induction loops in hospitality areas
- Vibrating seat cushions for match feedback

FAMILIES WITH CHILDREN:
- Family sections: Stands E and F
- Baby changing: Near Gates 2, 5, 8
- Kids play area: South concourse Level 2

EMERGENCY EVACUATION:
- Dedicated accessible evacuation routes
- EVAC chairs at all stairwells
- Volunteer escort available on request
`.trim(),
  },
  {
    title: 'FIFA World Cup 2026 Volunteer Handbook',
    category: 'volunteer_handbook',
    tags: ['volunteer', 'handbook', 'rules', 'conduct', 'uniform'],
    content: `
VOLUNTEER HANDBOOK — FIFA WORLD CUP 2026

CODE OF CONDUCT:
- Treat all fans with respect regardless of nationality, background, or team supported
- Maintain professional appearance — uniform must be worn at all times
- No photography of restricted areas
- Report any suspicious activity immediately via radio or app

SHIFT MANAGEMENT:
- Report to briefing room 90 minutes before match kick-off
- Sign in using QR code on MatchLens AI app
- Breaks: 20-minute break every 3 hours — coordinate with team lead
- End of shift: complete incident log, return equipment

EMERGENCY PROTOCOLS:
- Red alert (security): Stay at post, await instructions
- Amber alert (medical): Clear path for medical team
- Green alert (information): Continue normal duties
- Evacuation: Guide fans to nearest exit, do not use elevators

RADIO USAGE:
- Channel 1: Security
- Channel 2: Medical
- Channel 3: Operations / Organizer
- Channel 4: Volunteer coordination

REPORTING:
- All incidents must be logged in MatchLens AI within 30 minutes
- Escalate to team lead if unsure of correct action
`.trim(),
  },
];

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed users
    console.log('Seeding demo users...');
    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        console.log(`  ✓ Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`  - Skipped existing user: ${userData.email}`);
      }
    }

    // Seed knowledge base
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('\nSeeding knowledge base...');
      for (const doc of knowledgeDocs) {
        const existing = await KnowledgeBase.findOne({ title: doc.title });
        if (!existing) {
          await KnowledgeBase.create({ ...doc, createdBy: adminUser._id });
          console.log(`  ✓ Created KB article: ${doc.title}`);
        } else {
          console.log(`  - Skipped existing KB: ${doc.title}`);
        }
      }
    }

    console.log('\n✅ Seed complete!');
    console.log('\nDemo login credentials:');
    demoUsers.forEach((u) => {
      console.log(`  ${u.role.padEnd(12)} | ${u.email.padEnd(28)} | ${u.password}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
