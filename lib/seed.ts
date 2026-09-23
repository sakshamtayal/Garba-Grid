import connectDB from './db';
import ChatRoom from '@/models/ChatRoom';
import { College, GenderFilter, ChatRoomType } from '@/types';

interface PrebuiltRoom {
  type: ChatRoomType;
  name: string;
  description: string;
  college?: College;
  genderFilter: GenderFilter;
}

const PREBUILT_ROOMS: PrebuiltRoom[] = [
  // ── College Channels ──────────────────────────────────────────────────────
  {
    type: 'college_channel',
    name: 'DTU General 🎓',
    description: 'Delhi Technological University — Garba & Dandiya planning hub',
    college: 'DTU',
    genderFilter: 'all',
  },
  {
    type: 'college_channel',
    name: 'NSUT General 🎓',
    description: 'Netaji Subhas University of Technology — festival coordination',
    college: 'NSUT',
    genderFilter: 'all',
  },
  {
    type: 'college_channel',
    name: 'IGDTUW General 🎓',
    description: 'Indira Gandhi Delhi Technical University for Women',
    college: 'IGDTUW',
    genderFilter: 'all',
  },
  {
    type: 'college_channel',
    name: 'IIIT Delhi General 🎓',
    description: 'IIIT Delhi — Navratri celebration squad',
    college: 'IIIT',
    genderFilter: 'all',
  },
  {
    type: 'college_channel',
    name: 'IIT Delhi General 🎓',
    description: 'IIT Delhi — Garba nights and beyond',
    college: 'IIT Delhi',
    genderFilter: 'all',
  },
  // ── General Festival ──────────────────────────────────────────────────────
  {
    type: 'general',
    name: 'Navratri 2026 🪔',
    description: 'The main festival channel — everyone welcome!',
    genderFilter: 'all',
  },
  // ── Gender-Specific ───────────────────────────────────────────────────────
  {
    type: 'gender_specific',
    name: 'Girls Corner 💃',
    description: 'A safe space for all the ladies of GarbaGrid',
    genderFilter: 'female',
  },
  {
    type: 'gender_specific',
    name: 'Boys Zone 🕺',
    description: 'The spot for all the guys of GarbaGrid',
    genderFilter: 'male',
  },
];

export async function seedChatRooms(): Promise<void> {
  await connectDB();

  const existing = await ChatRoom.find({ isPrebuilt: true }).select('name').lean();
  const existingNames = new Set(existing.map((r) => r.name));

  const toInsert = PREBUILT_ROOMS.filter((r) => !existingNames.has(r.name)).map((r) => ({
    ...r,
    isPrebuilt: true,
    members: [],
  }));

  if (toInsert.length > 0) {
    await ChatRoom.insertMany(toInsert);
    console.log(`✅ Seeded ${toInsert.length} pre-built chat rooms`);
  } else {
    console.log('ℹ️  Pre-built chat rooms already seeded');
  }
}
