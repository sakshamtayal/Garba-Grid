import connectDB from './db';
import { Event } from '@/models/Event';

interface SeedEvent {
  title: string;
  description: string;
  venue: string;
  date: Date;
  price: number;
  bookingLink: string;
  imageUrl: string;
  ticketPlatform: string;
  dateRange: string;
  isActive: boolean;
}

// All dates set to first day of the event at 7 PM IST (13:30 UTC)
const EVENTS: SeedEvent[] = [
  {
    title: 'Meri Dilli Dandiya Utsav',
    description:
      "Delhi's grandest Dandiya Utsav at the iconic Talkatora Stadium. Three nights of electrifying Garba, live music, and non-stop dandiya raas. Book now on District App or BookMyShow!",
    venue: 'Talkatora Stadium, New Delhi',
    date: new Date('2026-10-23T13:30:00.000Z'),
    price: 700,
    bookingLink:
      'https://www.district.in/events/meri-dilli-dandiya-utsav-oct23-2026-buy-tickets?srsltid=AU7gw4X5yS4oQzhvCFW5OYQxR4gN4nvVwbq3IWZkr5VM7nzX9y1N8_y6',
    imageUrl:
      'https://media.district.in/events/meri-dilli-dandiya-utsav-oct23-2026/cover.webp',
    ticketPlatform: 'District App / Book My Show',
    dateRange: '23-25 Oct',
    isActive: true,
  },
  {
    title: 'Shubharambh 2026',
    description:
      "Delhi's biggest disco-dandiya festival returns to Bharat Mandapam! Three nights of live DJ sets, dandiya raas, and a dazzling festival atmosphere.",
    venue: 'Bharat Mandapam, New Delhi',
    date: new Date('2026-10-16T13:30:00.000Z'),
    price: 800,
    bookingLink:
      'https://www.district.in/events/shubharambh-delhis-biggest-disco-dandiya-festival-buy-tickets?srsltid=AU7gw4Ugxy7JNuuakJpAl4rFnf84GsDOQ_3jmGSeLHz7JC8Sh6gMnVqJ',
    imageUrl:
      'https://media.district.in/events/shubharambh-2026/cover.webp',
    ticketPlatform: 'District App',
    dateRange: '16-18 Oct',
    isActive: true,
  },
  {
    title: 'Global Garba Festival',
    description:
      'Five nights of traditional Garba and Dandiya under the stars at the historic Purana Qila. Featuring top artists, live music, and an unforgettable festival vibe.',
    venue: 'Purana Qila, New Delhi',
    date: new Date('2026-10-15T13:30:00.000Z'),
    price: 999,
    bookingLink:
      'https://in.bookmyshow.com/activities/global-garba-festival-2026/ET00514280',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00514280.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '15-19 Oct',
    isActive: true,
  },
  {
    title: 'Pacific Dandiya Night',
    description:
      'Three nights of dandiya and garba at Pacific Mall, Tagore Garden. Perfect for college squads — come dressed in your best chaniya choli!',
    venue: 'Pacific Mall, Tagore Garden, Delhi',
    date: new Date('2026-10-16T13:30:00.000Z'),
    price: 799,
    bookingLink:
      'https://in.bookmyshow.com/activities/pacific-dandiya-nights-pacific-mall-tagore-garden/ET00515574',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00515574.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '16-18 Oct',
    isActive: true,
  },
  {
    title: 'Dandiya Night 3.0',
    description:
      "Eight nights of non-stop dandiya raas at the vibrant Dilli Haat, Janakpuri. One of Delhi's most loved community dandiya events!",
    venue: 'Dilli Haat, Janakpuri, New Delhi',
    date: new Date('2026-10-11T13:30:00.000Z'),
    price: 399,
    bookingLink:
      'https://in.bookmyshow.com/activities/dandiya-night/ET00512324',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00512324.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '11-18 Oct',
    isActive: true,
  },
  {
    title: 'Raksha Navratri, Dwarka',
    description:
      'Ten nights of Navratri celebrations at the DDA Dandiya Ground, Dwarka. A classic, community-driven Navratri festival beloved by Dwarka residents.',
    venue: 'DDA Dandiya Ground, Dwarka, New Delhi',
    date: new Date('2026-10-11T13:30:00.000Z'),
    price: 99,
    bookingLink:
      'https://in.bookmyshow.com/activities/raksha-navratri/ET00506598',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00506598.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '11-20 Oct',
    isActive: true,
  },
  {
    title: 'Great Indian Garba Fest',
    description:
      "The Great Indian Garba Fest 4.0 comes to WoW Noida! Three nights of spectacular garba, dandiya, and live performances — NCR's biggest cross-city festival.",
    venue: 'WoW Noida, Noida',
    date: new Date('2026-10-16T13:30:00.000Z'),
    price: 799,
    bookingLink:
      'https://www.district.in/events/the-great-indian-garba-fest-40-oct16-2026-buy-tickets?srsltid=AU7gw4W8GVR3xFo_JSqQgmVbtQFPJ5R1FI3-2ubTfiWvG6-0ocIR4CJk',
    imageUrl:
      'https://media.district.in/events/great-indian-garba-fest-2026/cover.webp',
    ticketPlatform: 'District App',
    dateRange: '16-18 Oct',
    isActive: true,
  },
  {
    title: 'Garba Ni Raat',
    description:
      'Garba Ni Raat 2.0 — a glamorous one-night Dandiya extravaganza at One 7 Sports Arena, Gurgaon. Dress to impress and dance till dawn!',
    venue: 'One 7 Sports, Gurgaon',
    date: new Date('2026-10-17T13:30:00.000Z'),
    price: 699,
    bookingLink:
      'https://in.bookmyshow.com/activities/garba-ni-raat-2-0-dandiya-event-2026/ET00514266',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00514266.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '17 Oct',
    isActive: true,
  },
  {
    title: 'Garba Glows',
    description:
      'Eight dazzling nights of Garba at Panache, Dwarka. Neon lights, live beats, and traditional raas — come glow with us!',
    venue: 'Panache, Dwarka, New Delhi',
    date: new Date('2026-10-11T13:30:00.000Z'),
    price: 599,
    bookingLink:
      'https://in.bookmyshow.com/activities/garba-glows-by-panache-dwarka/ET00514095',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00514095.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '11-18 Oct',
    isActive: true,
  },
  {
    title: 'Dandiya Dhamaal ft. Sapna Choudhary',
    description:
      'Dandiya Dhamaal 2026 featuring the iconic Sapna Choudhary live! A one-night spectacular at International Trade Expo grounds.',
    venue: 'International Trade Expo, New Delhi',
    date: new Date('2026-10-16T13:30:00.000Z'),
    price: 499,
    bookingLink:
      'https://in.bookmyshow.com/activities/dandiya-dhamaal-2026-ft-sapna-chaudhary/ET00502941',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00502941.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '16 Oct',
    isActive: true,
  },
  {
    title: 'Garba Verse 1.0',
    description:
      'Garba Verse 1.0 by Delta Events — two nights of immersive Garba and Dandiya at the iconic Dilli Haat, Pitampura. First edition, unforgettable memories!',
    venue: 'Dilli Haat, Pitampura, New Delhi',
    date: new Date('2026-10-17T13:30:00.000Z'),
    price: 499,
    bookingLink:
      'https://in.bookmyshow.com/activities/garbaverse-1-0-by-delta-event/ET00511694',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00511694.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '17-18 Oct',
    isActive: true,
  },
  {
    title: 'EOD Dandiya Night',
    description:
      'The longest-running Dandiya series in Delhi — 18 nights of Raas at E-O-D Adventure Park. Enjoy live music, bonfires, and Navratri vibes all month!',
    venue: 'E-O-D Adventure, New Delhi',
    date: new Date('2026-10-02T13:30:00.000Z'),
    price: 99,
    bookingLink:
      'https://www.district.in/events/eod-dandiya-night-oct2-2026-buy-tickets?srsltid=AU7gw4XYdDY5kWs4TN4dRyJ_e9zrCzp_OxGbCP6w8SM3YjS3Bj3F6Rh-',
    imageUrl:
      'https://media.district.in/events/eod-dandiya-night-2026/cover.webp',
    ticketPlatform: 'District App',
    dateRange: '2-20 Oct',
    isActive: true,
  },
  {
    title: 'Dandiya Raas',
    description:
      'Dandiya Raas Season 4 at the prestigious Gymkhana Club, Gurgaon. An elite, curated Dandiya evening with live orchestra and traditional ambiance.',
    venue: 'Gymkhana Club, Gurgaon',
    date: new Date('2026-10-17T13:30:00.000Z'),
    price: 799,
    bookingLink:
      'https://www.district.in/events/dandyia-raas-season-4-oct16-2026-buy-tickets?srsltid=AU7gw4UfB3Kv6GSl4LsyKhw8EI-YoN74-YhD-scbEyZt7cMOg6jj-Myx',
    imageUrl:
      'https://media.district.in/events/dandiya-raas-season-4/cover.webp',
    ticketPlatform: 'Book My Show',
    dateRange: '17 Oct',
    isActive: true,
  },
  {
    title: 'Raatri Raaga',
    description:
      'Raatri Raaga — The Raas Affair 2026. Three nights of divine Garba and Dandiya at the majestic JLN Stadium. An unmissable Delhi Navratri experience!',
    venue: 'JLN Stadium, New Delhi',
    date: new Date('2026-10-16T13:30:00.000Z'),
    price: 499,
    bookingLink:
      'https://www.district.in/events/raatri-raaga-the-raas-affair-2026-buy-tickets?srsltid=AU7gw4Wi8Z8K94fP0PpQKwtBLMRpLS_egCoCVN-RzXIb5t_ERSuaQBdb',
    imageUrl:
      'https://media.district.in/events/raatri-raaga-2026/cover.webp',
    ticketPlatform: 'District App',
    dateRange: '16-18 Oct',
    isActive: true,
  },
  {
    title: 'Garba Dazzle 3.0',
    description:
      "Garba Dazzle 3.0 at Omaxe, Chandni Chowk — where tradition meets spectacle! Two nights of dazzling Garba performances and dandiya at one of Delhi's most iconic venues.",
    venue: 'Omaxe, Chandni Chowk, New Delhi',
    date: new Date('2026-10-17T13:30:00.000Z'),
    price: 499,
    bookingLink:
      'https://in.bookmyshow.com/activities/garba-dazzle-3-0/ET00507147',
    imageUrl:
      'https://in.bmscdn.com/events/movies/banner/ET00507147.jpg',
    ticketPlatform: 'Book My Show',
    dateRange: '17-18 Oct',
    isActive: true,
  },
];

export async function seedEvents(): Promise<{ upserted: number }> {
  await connectDB();

  let upserted = 0;

  for (const ev of EVENTS) {
    await Event.findOneAndUpdate(
      { title: ev.title },   // match by title
      { $set: ev },          // always overwrite all fields (price, etc.)
      { upsert: true, new: true }
    );
    upserted++;
  }

  console.log(`Events upserted: ${upserted}`);
  return { upserted };
}
