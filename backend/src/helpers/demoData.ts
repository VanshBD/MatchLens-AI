/**
 * Demo Data Seed — FIFA World Cup 2026
 * Creates realistic incidents, users, and data for screenshots
 * Run: npx tsx src/helpers/demoData.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { Incident } from '../models/Incident.model';
import { LostChild } from '../models/LostChild.model';
import { MedicalReport } from '../models/MedicalReport.model';
import { SecurityAlert } from '../models/SecurityAlert.model';
import { Notification } from '../models/Notification.model';
import { env } from '../config/env';

const STADIUM_SECTIONS = [
  'North Stand A',
  'North Stand B',
  'South Stand',
  'East Terrace',
  'West Terrace',
  'VIP Section',
  'Gate 3 Concourse',
  'Gate 7 Entry',
  'Food Court Level 2',
  'Main Concourse',
];
const GATES = ['Gate 1', 'Gate 3', 'Gate 5', 'Gate 7', 'Gate 9', 'Gate 11'];

const demoIncidents = [
  {
    type: 'lost_child',
    severity: 'high',
    status: 'in_progress',
    title: 'Lost Child – Miguel, Age 7 – South Stand',
    description:
      'Seven year old boy named Miguel, wearing a Brazil jersey (yellow/green), last seen near the South Stand hot dog stand at 19:45. Dark hair, approximately 4ft tall. Father is waiting at Information Point 3.',
    location: {
      section: 'South Stand',
      gate: 'Gate 5',
      description: 'Near south stand food vendors',
      latitude: 40.8138,
      longitude: -74.0748,
    },
    aiAnalysis: {
      summary:
        'High severity lost child case. Child was separated from guardian during peak crowd movement at halftime.',
      protocol: [
        'Deploy 4 volunteers in 50m search radius',
        'Notify all gate personnel with description',
        'Check nearby restrooms and food stands',
        'Review CCTV from Gate 5 area',
      ],
      nextActions: [
        'Broadcast multilingual announcement',
        'Assign security team to coordinate search',
        'Keep guardian calm at Information Point 3',
      ],
      nearbyResources: ['Information Point 3', 'Security Post 5B', 'Medical Station South'],
      generatedAt: new Date(),
    },
    tags: ['lost-child', 'urgent', 'halftime'],
  },
  {
    type: 'medical_emergency',
    severity: 'critical',
    status: 'in_progress',
    title: 'Cardiac Arrest – Section E Row 12',
    description:
      'Male fan approximately 60 years old collapsed in Section E Row 12. Unresponsive. CPR being administered by nearby nurse who identified herself. AED requested. Crowd being moved back.',
    location: {
      section: 'East Terrace',
      gate: 'Gate 7',
      description: 'Section E Row 12',
      latitude: 40.8141,
      longitude: -74.0742,
    },
    aiAnalysis: {
      summary:
        'Critical medical emergency requiring immediate paramedic response and AED deployment.',
      protocol: [
        'Continue CPR until paramedics arrive',
        'Deploy AED from Gate 7 cabinet',
        'Clear 3-metre radius',
        'Guide medical team from Gate 7',
      ],
      nextActions: [
        'Medical team ETA 2 minutes',
        'Ambulance on standby outside Gate 7',
        'Crowd diversion via Gate 9',
      ],
      nearbyResources: ['Medical Station East (120m)', 'AED Cabinet Gate 7', 'Ambulance Bay 2'],
      generatedAt: new Date(),
    },
    tags: ['cardiac', 'critical', 'aed'],
  },
  {
    type: 'crowd_issue',
    severity: 'high',
    status: 'open',
    title: 'Dangerous Crowd Density – Gate 3 Entry',
    description:
      'Gate 3 entry has reached critical density. Approximately 2,000 fans attempting to enter through 3 open lanes. Pushing reported. Risk of crush injury if not managed immediately.',
    location: {
      gate: 'Gate 3',
      description: 'Gate 3 main entry',
      latitude: 40.8131,
      longitude: -74.0751,
    },
    aiAnalysis: {
      summary:
        'Dangerous crowd buildup at Gate 3. Immediate volunteer deployment and gate management required.',
      protocol: [
        'Open additional 2 lanes at Gate 3',
        'Deploy 6 volunteers for queue management',
        'Redirect overflow to Gate 5',
        'Pause ticket scanning temporarily',
      ],
      nextActions: [
        'Announce Gate 5 as alternative',
        'Contact organizer for gate expansion approval',
        'Monitor density every 5 minutes',
      ],
      nearbyResources: ['Gate 5 (200m)', 'Volunteer Station A', 'Security Command'],
      generatedAt: new Date(),
    },
    tags: ['crowd', 'gate-3', 'density'],
  },
  {
    type: 'medical_emergency',
    severity: 'medium',
    status: 'resolved',
    title: 'Heat Exhaustion – VIP Terrace',
    description:
      'Female fan mid-40s showing signs of heat exhaustion. Pale, sweating profusely, dizzy. Moved to shaded area. Requesting medical assistance.',
    location: {
      section: 'VIP Section',
      description: 'VIP Terrace upper level',
      latitude: 40.8136,
      longitude: -74.0744,
    },
    aiAnalysis: {
      summary: 'Heat exhaustion case. Managed on-site with cooling measures. Patient stable.',
      protocol: [
        'Move to cool shaded area',
        'Provide cool water',
        'Monitor temperature',
        'Keep lying down with legs elevated',
      ],
      nextActions: ['Patient discharged after 30 min observation', 'Document for incident log'],
      nearbyResources: ['Medical Station VIP', 'First Aid Room 2'],
      generatedAt: new Date(),
    },
    tags: ['heat', 'vip', 'resolved'],
  },
  {
    type: 'security_threat',
    severity: 'medium',
    status: 'in_progress',
    title: 'Unauthorized Pitch Invasion Attempt – North Stand',
    description:
      'Group of 3 fans attempting to bypass security barriers near North Stand Row 1. Security personnel intercepted. Identity verification in progress.',
    location: {
      section: 'North Stand A',
      gate: 'Gate 1',
      description: 'North Stand barrier Row 1',
    },
    aiAnalysis: {
      summary:
        'Security breach attempt at North Stand. Contained by security. Standard protocol in effect.',
      protocol: [
        'Detain individuals for ID check',
        'Review access credentials',
        'Notify stadium commander',
        'Increase monitoring of North Stand',
      ],
      nextActions: ['Escort to security office', 'File incident report', 'Check for accomplices'],
      nearbyResources: ['Security Office North', 'CCTV Control Room'],
      generatedAt: new Date(),
    },
    tags: ['security', 'pitch-invasion', 'north-stand'],
  },
  {
    type: 'lost_child',
    severity: 'medium',
    status: 'resolved',
    title: 'Lost Child Found – Aisha, Age 5 – Gate 9',
    description:
      'Five year old girl named Aisha reunited with family after 12 minutes. Found near Gate 9 restrooms. Was wearing a France jersey. Family from Paris, guardian was frantic.',
    location: {
      gate: 'Gate 9',
      description: 'Gate 9 restroom area',
      latitude: 40.8129,
      longitude: -74.0738,
    },
    aiAnalysis: {
      summary: 'Resolved. Child found safe and reunited with guardian within 12 minutes of report.',
      protocol: ['RESOLVED - Child reunited safely'],
      nextActions: ['Complete incident report', 'Update guardian contact details'],
      nearbyResources: [],
      generatedAt: new Date(),
    },
    tags: ['lost-child', 'resolved', 'gate-9'],
  },
  {
    type: 'accessibility',
    severity: 'low',
    status: 'resolved',
    title: 'Wheelchair Assistance Required – Section D',
    description:
      'Elderly male wheelchair user requires assistance navigating from Section D to accessible restroom. Lift reported out of service. Alternative route needed.',
    location: { section: 'West Terrace', description: 'Section D wheelchair area' },
    aiAnalysis: {
      summary: 'Accessibility assistance provided. Alternative route via West Concourse used.',
      protocol: [
        'Guide via West Concourse accessible route',
        'Notify lift maintenance team',
        'Document route for future reference',
      ],
      nextActions: ['Escort completed successfully', 'Lift reported to maintenance'],
      nearbyResources: ['Accessible Restroom Block B', 'Volunteer Accessibility Team'],
      generatedAt: new Date(),
    },
    tags: ['accessibility', 'wheelchair', 'resolved'],
  },
  {
    type: 'crowd_issue',
    severity: 'medium',
    status: 'open',
    title: 'Crowd Surge at Main Concourse – Post Match',
    description:
      'Post-match exodus creating significant congestion at Main Concourse. Estimated 15,000 fans trying to exit simultaneously. Volunteer deployment needed at bottleneck points.',
    location: { description: 'Main Concourse all exits', latitude: 40.8135, longitude: -74.0745 },
    aiAnalysis: {
      summary: 'Post-match crowd surge. Controlled exit procedure initiated.',
      protocol: [
        'Open all available exits',
        'Deploy volunteers at 6 bottleneck points',
        'Stagger exits by section number',
        'Coordinate with transport outside',
      ],
      nextActions: [
        'Announce Section A/B exit via Gate 1-3',
        'Announce Section C/D exit via Gate 7-9',
        'Request additional police support outside',
      ],
      nearbyResources: ['All Gates', 'Transport Coordination Hub'],
      generatedAt: new Date(),
    },
    tags: ['crowd', 'post-match', 'exit'],
  },
  {
    type: 'general',
    severity: 'low',
    status: 'closed',
    title: 'Lost & Found – Phone and Wallet',
    description:
      'Samsung phone and brown leather wallet found on Section B Row 8 seat after half time. Contents: credit cards, Portuguese ID card, some cash. Handed to lost property office.',
    location: { section: 'North Stand B', description: 'Section B Row 8' },
    aiAnalysis: {
      summary: 'Items secured at lost property. Owner notification pending.',
      protocol: [
        'Log items at Lost Property Office',
        'Check ID for owner contact',
        'Retain for 72 hours',
      ],
      nextActions: ['Contact owner if ID found'],
      nearbyResources: ['Lost Property Office Gate 1'],
      generatedAt: new Date(),
    },
    tags: ['lost-property', 'closed'],
  },
  {
    type: 'medical_emergency',
    severity: 'low',
    status: 'resolved',
    title: 'Minor Laceration – Section F',
    description:
      'Child sustained minor cut on hand from broken plastic cup. Treated by first aider on scene. No further medical attention required.',
    location: { section: 'East Terrace', description: 'Section F Row 3' },
    aiAnalysis: {
      summary: 'Minor injury treated on-site. No escalation required.',
      protocol: ['Clean wound', 'Apply bandage', 'Monitor for 10 minutes'],
      nextActions: ['Incident logged', 'Parents informed'],
      nearbyResources: ['First Aid Kit on Volunteer'],
      generatedAt: new Date(),
    },
    tags: ['minor-injury', 'child', 'resolved'],
  },
];

const extraVolunteers = [
  {
    name: 'Carlos Mendez',
    email: 'carlos@matchlens.ai',
    password: 'Volunteer@1234',
    role: 'volunteer',
    phone: '+1-555-0101',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@matchlens.ai',
    password: 'Volunteer@1234',
    role: 'medical',
    phone: '+1-555-0102',
  },
  {
    name: "James O'Brien",
    email: 'james@matchlens.ai',
    password: 'Volunteer@1234',
    role: 'security',
    phone: '+1-555-0103',
  },
  {
    name: 'Fatima Al-Hassan',
    email: 'fatima@matchlens.ai',
    password: 'Volunteer@1234',
    role: 'volunteer',
    phone: '+44-555-0104',
  },
  {
    name: 'Yuki Tanaka',
    email: 'yuki@matchlens.ai',
    password: 'Volunteer@1234',
    role: 'volunteer',
    phone: '+81-555-0105',
  },
  {
    name: 'Maria Garcia',
    email: 'maria@matchlens.ai',
    password: 'Organizer@1234',
    role: 'organizer',
    phone: '+34-555-0106',
  },
  {
    name: 'Ahmed Khalil',
    email: 'ahmed@matchlens.ai',
    password: 'Volunteer@1234',
    role: 'security',
    phone: '+966-555-0107',
  },
  {
    name: 'Sophie Laurent',
    email: 'sophie@matchlens.ai',
    password: 'Medical@1234',
    role: 'medical',
    phone: '+33-555-0108',
  },
];

async function seedDemoData() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin user for references
    const adminUser = await User.findOne({ role: 'admin' });
    const volunteerUser = await User.findOne({ role: 'volunteer' });
    const securityUser = await User.findOne({ role: 'security' });
    const medicalUser = await User.findOne({ role: 'medical' });

    if (!adminUser || !volunteerUser) {
      console.error('❌ Run the main seed first: npm run seed');
      process.exit(1);
    }

    // Seed extra staff
    console.log('\n📋 Seeding extra staff users...');
    for (const u of extraVolunteers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`  ✓ ${u.name} (${u.role})`);
      } else {
        console.log(`  - Skipped: ${u.email}`);
      }
    }

    // Seed incidents
    console.log('\n🚨 Seeding demo incidents...');
    for (const inc of demoIncidents) {
      const reporter =
        inc.type === 'medical_emergency'
          ? medicalUser
          : inc.type === 'security_threat'
            ? securityUser || volunteerUser
            : volunteerUser;

      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      // Build a prefix for incidentId
      const prefix = inc.type.substring(0, 3).toUpperCase();
      const ts = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const incidentId = `${prefix}-${ts}-${rand}`;

      const created = await Incident.create({
        ...inc,
        incidentId,
        reportedBy: reporter!._id,
        isResolved: inc.status === 'resolved' || inc.status === 'closed',
        resolvedAt: inc.status === 'resolved' || inc.status === 'closed' ? new Date() : undefined,
        timeline: [
          {
            action: 'Incident reported',
            performedBy: reporter!._id,
            timestamp: createdAt,
          },
          ...(inc.status !== 'open'
            ? [
                {
                  action: `Status updated to ${inc.status}`,
                  performedBy: adminUser._id,
                  timestamp: new Date(createdAt.getTime() + 10 * 60000),
                },
              ]
            : []),
        ],
      });

      // Create lost child record
      if (inc.type === 'lost_child') {
        const childName = inc.title.includes('Miguel')
          ? 'Miguel'
          : inc.title.includes('Aisha')
            ? 'Aisha'
            : undefined;
        await LostChild.create({
          incidentRef: created._id,
          childName,
          childAge: inc.title.includes('Miguel') ? 7 : 5,
          childDescription: inc.description,
          lastSeenLocation: inc.location.description || inc.location.section || 'Stadium',
          guardianName: inc.title.includes('Miguel') ? 'Carlos Rodriguez' : 'Hassan Al-Fassi',
          guardianContact: '+1-555-' + Math.floor(1000 + Math.random() * 9000),
          status: inc.status === 'resolved' ? 'found' : 'searching',
          aiSearchProtocol: inc.aiAnalysis.protocol,
          reportedBy: volunteerUser._id,
          foundAt: inc.status === 'resolved' ? new Date() : undefined,
          createdAt,
        });
      }

      // Create medical report
      if (inc.type === 'medical_emergency') {
        const emergencyTypes = ['cardiac_arrest', 'heat_stroke', 'injury', 'seizure'];
        const idx = demoIncidents.filter((i) => i.type === 'medical_emergency').indexOf(inc);
        await MedicalReport.create({
          incidentRef: created._id,
          emergencyType: emergencyTypes[idx % emergencyTypes.length],
          patientDescription: inc.description,
          location: inc.location.description || inc.location.section || 'Stadium',
          section: inc.location.section,
          aiProtocol: inc.aiAnalysis.protocol,
          nearestMedicalStation: inc.aiAnalysis.nearbyResources[0] || 'Medical Station A',
          crowdDiversionPlan: 'Clear path via nearest concourse route',
          transportationRequired: inc.severity === 'critical',
          hospitalNotified: inc.severity === 'critical',
          reportedBy: medicalUser ? medicalUser._id : volunteerUser._id,
          createdAt,
        });
      }

      console.log(`  ✓ [${inc.severity.toUpperCase()}] ${inc.title.substring(0, 50)}`);
    }

    // Notifications
    console.log('\n🔔 Seeding notifications...');
    const notifUsers = await User.find({ role: { $in: ['admin', 'organizer', 'security'] } });
    const notifMessages = [
      {
        type: 'incident_created',
        title: '🚨 New Critical Incident',
        message: 'Cardiac arrest reported in Section E. Medical team dispatched.',
      },
      {
        type: 'incident_updated',
        title: '✅ Incident Resolved',
        message: 'Lost child Aisha reunited with family at Gate 9.',
      },
      {
        type: 'security_alert',
        title: '🛡️ Security Alert',
        message: 'Unauthorized access attempt at North Stand barrier.',
      },
      {
        type: 'crowd_alert',
        title: '👥 Crowd Warning',
        message: 'High density detected at Gate 3. Volunteer deployment activated.',
      },
      {
        type: 'medical_alert',
        title: '🏥 Medical Alert',
        message: 'Heat exhaustion case in VIP Terrace. First aider on scene.',
      },
      {
        type: 'system',
        title: '📋 Shift Briefing',
        message: 'Match day briefing at 16:00. All volunteers please report to Briefing Room B.',
      },
    ];

    for (const user of notifUsers.slice(0, 3)) {
      for (const msg of notifMessages.slice(0, 4)) {
        await Notification.create({
          recipient: user._id,
          type: msg.type,
          title: msg.title,
          message: msg.message,
          isRead: Math.random() > 0.5,
          createdAt: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000),
        });
      }
    }
    console.log('  ✓ Notifications created');

    console.log('\n✅ Demo data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  • ${demoIncidents.length} incidents (lost child, medical, crowd, security)`);
    console.log(`  • ${extraVolunteers.length} extra staff members`);
    console.log(`  • Notifications for admin/organizer/security`);
    console.log('\n🌐 Visit http://localhost:3000 to see the data');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Demo seed failed:', error);
    process.exit(1);
  }
}

seedDemoData();
