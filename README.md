# 🪅 GarbaGrid — Delhi-NCR College Festival & Squad Matchmaking

> **Engineered by Saksham Tayal**  
> Built for the Delhi-NCR college circuit (**DTU, NSUT, IGDTUW, IIIT Delhi, IIT Delhi**) during Navratri & Dandiya season.

---

## 🌟 Key Features & Architecture

### 1. 🪅 Midnight Dark-Mode & Festival Aesthetics
- **Color Palette:** Midnight Obsidian (`#0A0A16`), Royal Deep Blue (`#12122B`), Marigold Orange (`#FF8C00`), Rani Pink (`#E91E8C`), and Temple Gold (`#D4AF37`).
- **Interactive Branding:** Header displays **GarbaGrid** prominently with interactive **"by Saksham Tayal"** link that opens the Creator Profile modal where students can view details and send instant Dandiya requests.
- **Custom Animations:** Clicking dandiya stick loaders, diya pulsing flame, spring physics on cards, glassmorphic floating overlays, zero cumulative layout shift (CLS).

### 2. 🔐 Authentication & Student Profiles
- Secure credential authentication with password hashing (`bcryptjs`) and NextAuth session tokens.
- **Custom Profile Attributes:**
  - College selection (DTU, NSUT, IGDTUW, IIIT, IIT Delhi, Other)
  - **Dandiya Skill Level Tags:**
    - 🥁 *Professional / Will teach*
    - 🌀 *Chaos Merchant*
    - 👣 *Left/Right Foot Struggler*
  - Hobbies and interest tags (`#twirls`, `#chaniya_choli`, `#dj_nights`)
  - Instagram handle & bio
  - Client-side image compression (`browser-image-compression` <200KB)

### 3. 💃 Gated Match & Connect Flow ("Pass or Connect")
- Queue-based discover feed with prioritized same-college cards.
- **Mutual Connect Gates:** Messages are gated until both students connect mutually (triggering festive confetti match celebrations) or if direct DMs are enabled by user setting.

### 4. 💬 Real-Time Chat & Pre-Built Channels
- Powered by Pusher real-time WebSockets.
- **Pre-Built Channels:**
  - 🎓 DTU General
  - 🎓 NSUT General
  - 🎓 IGDTUW General
  - 🎓 IIIT Delhi General
  - 🎓 IIT Delhi General
  - 🪔 Navratri 2026 Festival Wide
  - 💃 Girls Corner
  - 🕺 Boys Zone
- Squad group chats and 1-on-1 direct messages.

### 5. 🎯 Events Hub & Live Attendance Radar
- Directory of Delhi Dandiya & Garba nights with venue, dates, pricing, and ticket booking links.
- **Live Attendance Radar:** Real-time college breakdown charts showing live student counts from DTU, NSUT, IGDTUW, IIIT, and IIT.
- Instant "I'm Attending" toggle with optimistic UI.

### 6. 🤝 Squad WhatsApp Invite Links
- Create squads and generate instant shareable WhatsApp links (`wa.me` integration) and 8-character invite codes.

### 7. 🎟️ Extra Tickets & Passes Board
- Buy, sell, or trade spare passes for sold-out Dandiya nights with direct WhatsApp contacts.

### 8. 🤫 Anonymous Confession Wall
- 100% anonymized campus wall for festival hype, outfit appreciation, and secret Dandiya shout-outs with college filters, likes, and report moderation.

### 9. 🛡️ Master Admin Panel
- Dedicated moderation dashboard (tied to Saksham Tayal's admin flag) for reviewing reported confessions, managing ticket listings, and overseeing platform statistics.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account (free cluster tier)
- Pusher account (free sandbox tier)
- Cloudinary account (free tier)

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-32-char-secret-key

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/garba-grid?retryWrites=true&w=majority

NEXT_PUBLIC_PUSHER_APP_KEY=your_key
PUSHER_APP_ID=your_id
PUSHER_APP_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=ap2

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_UPLOAD_PRESET=garba-grid-profiles
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ☁️ Zero-Cost Cloud Deployment (Vercel)
1. Push repository to GitHub.
2. Import repository on [Vercel](https://vercel.com).
3. Add environment variables from `.env.local`.
4. Deploy! Automatic SSL, edge CDN, and zero-cost serverless hosting.
