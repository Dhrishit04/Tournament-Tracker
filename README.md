
<div align="center">
  <h1>⚽ Tournament Tracker</h1>
  <a href="https://dongrefootballpremierleague.online">
    <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&pause=1500&color=FF5722&center=true&vCenter=true&width=800&height=50&lines=A+production-grade+tournament+management+platform;Battle-tested+with+200%2B+concurrent+users!;Real-time+Firebase+Sync+%26+Live+Scores;Built+with+Next.js+15+%26+React+19;AI-Powered+Scout+Reports+with+Gemini" alt="Dynamic Typing Effect" />
  </a>
  <br>
  <p>
    <a href="https://dongrefootballpremierleague.online"><img src="https://img.shields.io/badge/🌐_Live_Site-dongrefootballpremierleague.online-7C3AED?style=for-the-badge" alt="Live Site"></a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Firebase-11-DD2C00?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini 2.5 Flash">
  </p>
</div>

<br>

## Overview

Tournament Tracker is a full-stack web application purpose-built for the **Dongre Football Premier League (DFPL)**  a community football tournament. It provides both a public-facing website for live match tracking and a comprehensive admin command center for tournament management.

### What it does

- **Public Site** - Real-time league standings, live match scores, player statistics, team profiles, knockout brackets, and a dynamic homepage with broadcast announcements.
- **Admin Panel** - A complete back-office with player/team/fixture CRUD, live match event tracking (goals, assists, cards), group stage management, season lifecycle controls, bulk data import, and an AI-powered scout report.
- **Multi-Season Architecture** - All data is scoped per season. Admins can create new seasons, migrate rosters from past seasons, or import bulk data via Excel.

<br>

## Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR, routing, server actions |
| **Language** | TypeScript 5 | End-to-end type safety |
| **UI Library** | React 19 | Component architecture |
| **Styling** | Tailwind CSS + ShadCN/UI + Framer Motion | Design system, animations |
| **Database** | Cloud Firestore (NoSQL) | Real-time document store |
| **Auth** | Firebase Auth + Firestore Registry | Hybrid RBAC (System Admin + Staff) |
| **Storage** | Firebase Cloud Storage | Image uploads (avatars, logos, management photos) |
| **AI** | Genkit + Gemini 2.5 Flash | AI Season Scout report generation |
| **Hosting** | Firebase App Hosting | Production deployment with custom domain |
| **Smooth Scroll** | Lenis | Premium scrolling experience |
| **Data Import** | SheetJS (xlsx) | Bulk Excel ingestion (.xlsx) |
| **Charts** | Recharts | Data visualisation |

<br>

## Architecture

### Serverless BaaS Model

The entire backend runs on Firebase. There are no custom API routes or server infrastructure to maintain.

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Next.js)                    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Season   │  │  Data    │  │  Auth    │  │  About  │  │
│  │ Context  │  │  Context │  │  Context │  │ Context │  │
│  └────┬─────┘  └─── ─┬────┘  └─── ─┬────┘  └──────┬──┘  │
│       │              │             │              │     │
│       └──────────────┴─────────────┴──────────────┘     │
│                          │                              │
│               ┌──────────┴──────────┐                   │
│               │  Firebase SDK Layer │                   │
│               │  (Real-time hooks)  │                   │
│               └──────────┬──────────┘                   │
└──────────────────────────┼──────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴──────┐ ┌───┴─────┐ ┌────┴──────┐
        │ Firestore  │ │  Auth   │ │  Storage  │
        │            │ │         │ │           │
        │ /seasons   │ │  Root   │ │  Avatars  │
        │ /config    │ │  Admin  │ │  Logos    │
        │ /admins    │ │         │ │  Photos   │
        │ /logs      │ │         │ │           │
        │ /analytics │ │         │ │           │
        └────────────┘ └─────────┘ └───────────┘
```

### Firestore Data Schema

```
firestore/
├── config/
│   └── app                    # SeasonConfig (current season, announcements, management images)
├── seasons/
│   └── {seasonId}/
│       ├── teams/{teamId}     # Team profile + cumulative stats
│       ├── players/{playerId} # Player profile + performance stats
│       └── matches/{matchId}  # Fixture data + embedded match events[]
├── admins/{adminId}           # Staff registry (email, hashed password, access level)
├── logs/{logId}               # Audit trail (timestamp, admin, action, details)
└── analytics/
    ├── footfall_all_time      # Master visitor counter
    └── daily_{YYYY-MM-DD}     # Per-day unique visitor counts
```

### Real-Time Data Flow

All data subscriptions use Firestore `onSnapshot` listeners wrapped in custom React hooks (`useCollection`, `useDoc`). When any admin updates a match score, every connected client - spectators, other admins, the public standings page - reflects the change instantly without polling.

### Authentication & Access Control

The system uses a **hybrid auth model** with a 3-tier admin hierarchy:

| Role | Auth Method | Capabilities |
|---|---|---|
| **System Admin** | Firebase Auth (email/password) | Full unrestricted access - credential management, season deletion, staff registration, access elevation, system configuration, logs, and all CRUD operations |
| **Elevated Admin** | Firestore registry (`/admins`, `canAccessSettings: true`) | CRUD on players, teams, and matches **plus** access to the Settings page (season switching, bulk ingestion, data migration, critical zones) |
| **Regular Admin** | Firestore registry (`/admins`) | CRUD on players, teams, and matches only. No access to settings, config, or staff management |
| **Public User** | Unauthenticated | Read-only access to public pages. Footfall tracking via localStorage |

Access control is enforced at **three levels**:
1. **Firestore Security Rules** - Database-level read/write restrictions per collection
2. **Client-side guards** - React context checks (`isAdmin`, `isSystemAdmin`, `canAccessSettings`)
3. **Audit logging** - Every admin action is written to `/logs` with timestamp, identity, and operation details

<br>

## Key Features

### Public Pages
- 📊 **Standings** - Auto-calculated league table with group stage support (Group A/B split)
- ⚽ **Matches** - Live match center with real-time score updates and detailed match timeline
- 👥 **Teams & Players** - Club profiles, player cards, and performance statistics
- 🏆 **Brackets** - Knockout stage visualisation (Semi-Finals, Finals)
- 📈 **Stats** - Top scorers, assist leaders, and disciplinary records
- 📢 **Broadcast Ticker** - Global announcements displayed across all pages
- 👤 **About** - Dynamic team page with positions, member profiles, and social links

### Admin Command Center
- 🎯 **Overview Dashboard** - Quick stats, broadcast hub, and AI Season Scout
- 🤖 **AI Scout** - Gemini-powered tournament analysis with top team/player insights
- 👟 **Player Management** - Full CRUD with draft classification, club assignment, and avatar upload
- 🏟️ **Team Management** - Deploy clubs, assign groups, enable/disable group mode
- 📅 **Fixture Engine** - Schedule matches, track live events (goals, assists, cards), stage filtering
- ⚙️ **System Configuration** - Season switching, bulk Excel import, cross-season data migration
- 📊 **Footfall Analytics** - Live visitor tracking with time-range filtering (7D/15D/30D/60D/All Time)
- 🔐 **Admin Config** - Staff registration, access elevation, system admin credential management
- 📋 **System Logs** - Terminal-style audit viewer with export and purge capabilities
- ℹ️ **About CMS** - Manage public About page positions and team members

### Match Event System
The match event system handles atomic stat computation using Firestore `writeBatch`. When a goal is recorded:
1. Match score increments
2. Player goal tally increments
3. Team total goals increment
4. Opponent goals-against increments
5. If an assist is selected, the assister's stats update in the same batch
6. On second yellow card, a red card is auto-issued

All operations are **reversible** - deleting an event reverts every stat change atomically.

<br>

## Admin Panel Screenshots

<div style="overflow-x: auto; white-space: nowrap; padding: 16px 0;">
<table>
  <tr>
    <td align="center" width="600">
      <img src="public/ReadMe/1 admin - overview.png" width="580" alt="Command Center"><br>
      <strong>Command Center</strong><br>
      <sub>Central dashboard with quick stats, broadcast hub, AI season scout, and module navigation.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/2 admin - players.png" width="580" alt="Athlete Roster"><br>
      <strong>Athlete Roster</strong><br>
      <sub>Player registry with club assignments, draft classification, search, and inline CRUD actions.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/3 admin - teams.png" width="580" alt="Club Operations"><br>
      <strong>Club Operations</strong><br>
      <sub>Team management with group mode toggle, owner details, and deploy/edit/delete controls.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/4 admin - teams (Assign groups).png" width="580" alt="Group Assignment"><br>
      <strong>Group Assignment</strong><br>
      <sub>Assign clubs into tournament groups (4 teams per group) with batch save.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/5 admin - teams (group mode active).png" width="580" alt="Group Mode Active"><br>
      <strong>Group Mode Active</strong><br>
      <sub>Club registry displaying group tags (A/B) after group mode is enabled.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/6 standings page (grp mode active).png" width="580" alt="Standings - Groups"><br>
      <strong>League Standings</strong><br>
      <sub>Public standings with split Group A/B tables - MP, W, D, L, GF, GA, GD, PTS.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/7 admin - fixtures.png" width="580" alt="Match Fixtures"><br>
      <strong>Match Fixtures</strong><br>
      <sub>Fixture scheduler with stage filtering, visibility toggles, and live scoreline tracking.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/8 admin - settings.png" width="580" alt="System Configuration"><br>
      <strong>System Configuration</strong><br>
      <sub>Footfall analytics, season lifecycle, bulk Excel ingestion, data migration, and critical zones.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/9 admin - about us.png" width="580" alt="About Us Management"><br>
      <strong>About Us CMS</strong><br>
      <sub>Manage public About page - team positions, member profiles, and social links.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/10 admin - config.png" width="580" alt="Admin Configuration"><br>
      <strong>Admin Configuration</strong><br>
      <sub>Root authority management - system admin credentials, staff registration, access elevation.</sub>
    </td>
    <td align="center" width="600">
      <img src="public/ReadMe/11 admin - logs.png" width="580" alt="System Terminal"><br>
      <strong>System Terminal</strong><br>
      <sub>Audit log viewer - every admin action tracked with timestamps, identity, and operations.</sub>
    </td>
  </tr>
</table>
</div>

<br>

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Public homepage
│   ├── standings/              # League standings
│   ├── matches/                # Match center
│   ├── teams/                  # Team profiles
│   ├── players/                # Player cards
│   ├── stats/                  # Performance statistics
│   ├── brackets/               # Knockout bracket
│   ├── about/                  # About page
│   ├── admin/                  # Admin panel (7 sub-routes)
│   └── admin-auth/             # Admin login
├── components/
│   ├── ui/                     # ShadCN/UI primitives
│   ├── layout/                 # Header, Footer, SessionGuard, FootfallTracker
│   ├── admin/                  # Admin sidebar, access control
│   ├── providers/              # Auth, Theme, SmoothScrolling
│   ├── matches/                # Match details dialog
│   └── players/                # Athlete card dialog
├── contexts/                   # React context providers
│   ├── season-context.tsx      # Season switching, config, announcements
│   ├── data-context.tsx        # All CRUD operations + stat computation
│   ├── auth-context.tsx        # Auth types
│   └── about-context.tsx       # About page CMS
├── firebase/                   # Firebase SDK integration
│   ├── firestore/              # useCollection, useDoc hooks
│   ├── auth/                   # useUser hook
│   ├── provider.tsx            # Firebase context provider
│   └── storage.ts              # Image upload utilities
├── hooks/                      # Custom React hooks
├── ai/                         # Genkit AI flows
│   └── flows/season-scout-flow.ts
├── lib/                        # Utilities (cn, getImageUrl)
└── types/                      # TypeScript interfaces
```

<br>

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore, Auth, and Storage enabled

### Setup

```bash
# Clone
git clone https://github.com/YourUsername/Tournament-Tracker.git
cd Tournament-Tracker

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in your Firebase config values

# Run development server
npm run dev
```

The app runs at `http://localhost:9002`.


## License

This project is proprietary to the Dongre Football Premier League.

<div align="center">
  <br>
  <p><strong>© 2026 Dongre Football Premier League. All Rights Reserved.</strong></p>
</div>
