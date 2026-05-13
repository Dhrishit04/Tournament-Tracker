
<div align="center">
  <h1 style="color: #1A237E; font-family: 'Inter', sans-serif; font-size: 3em; font-weight: bold;">
    Tournament Tracker
  </h1>
  <p style="color: #1A237E; font-family: 'Inter', sans-serif; font-size: 1.2em;">
    A high-performance tournament management platform built with Next.js 15 and Firebase.
  </p>
  <p style="color: #FF5722; font-weight: bold; font-family: 'Inter', sans-serif;">
    Official Domain: <a href="https://dongrefootballpremierleague.online" style="color: #FF5722;">dongrefootballpremierleague.online</a>
  </p>
  <br>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15">
    <img src="https://img.shields.io/badge/Firebase-B22A0F?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini 2.5 Flash">
  </p>
</div>

<br>

<h2 style="color: #1A237E; border-bottom: 2px solid #FF5722; padding-bottom: 5px; font-family: 'Inter', sans-serif;">Technical Stack</h2>

<ul style="font-family: 'Inter', sans-serif; list-style-type: none; padding-left: 0;">
  <li style="margin-bottom: 10px;"><strong>Framework</strong>: Next.js 15 (App Router)</li>
  <li style="margin-bottom: 10px;"><strong>Database</strong>: Cloud Firestore (NoSQL)</li>
  <li style="margin-bottom: 10px;"><strong>Authentication</strong>: Hybrid (Firebase Auth for Root, Firestore Registry for Staff)</li>
  <li style="margin-bottom: 10px;"><strong>AI Integration</strong>: Genkit with Gemini 2.5 Flash</li>
  <li style="margin-bottom: 10px;"><strong>Styling</strong>: Tailwind CSS & ShadCN UI</li>
  <li style="margin-bottom: 10px;"><strong>Real-time</strong>: Firebase Client SDK</li>
</ul>

<h2 style="color: #1A237E; border-bottom: 2px solid #FF5722; padding-bottom: 5px; font-family: 'Inter', sans-serif;">Backend Architecture</h2>

<p style="font-family: 'Inter', sans-serif;">The application utilizes a serverless architecture where Firebase acts as the Backend-as-a-Service (BaaS).</p>
<ul style="font-family: 'Inter', sans-serif; list-style-type: '✔  '; padding-left: 20px;">
  <li style="margin-bottom: 10px; color: #1A237E;"><strong style="color: #1A237E;">Data Persistence</strong>: All league data is scoped by season and stored in Firestore.</li>
  <li style="margin-bottom: 10px; color: #1A237E;"><strong style="color: #1A237E;">Security</strong>: Granular access control is enforced via Firestore Security Rules.</li>
  <li style="margin-bottom: 10px; color: #1A237E;"><strong style="color: #1A237E;">Audit Engine</strong>: A built-in logging system tracks every administrative action for total accountability.</li>
</ul>


<h2 style="color: #1A237E; border-bottom: 2px solid #FF5722; padding-bottom: 5px; font-family: 'Inter', sans-serif;">Admin Panel</h2>

<h3>Command Center — Overview</h3>
<p>Central admin dashboard with quick stats, broadcast hub, AI season scout, and navigation to all admin modules.</p>
<img src="public/ReadMe/1 admin - overview.png" alt="Admin Overview" width="100%">

<br><br>

<h3>Athlete Roster</h3>
<p>Player registry with club assignments, draft classification, search, and inline CRUD actions.</p>
<img src="public/ReadMe/2 admin - players.png" alt="Admin Players" width="100%">

<br><br>

<h3>Club Operations</h3>
<p>Team management with group mode toggle, owner details, and deploy/edit/delete controls.</p>
<img src="public/ReadMe/3 admin - teams.png" alt="Admin Teams" width="100%">

<br><br>

<h3>Group Assignment</h3>
<p>Modal for assigning clubs into tournament groups (4 teams per group) with batch save.</p>
<img src="public/ReadMe/4 admin - teams (Assign groups).png" alt="Group Assignment" width="100%">

<br><br>

<h3>Group Mode Active</h3>
<p>Club registry view with group tags displayed after group mode is enabled.</p>
<img src="public/ReadMe/5 admin - teams (group mode active).png" alt="Group Mode Active" width="100%">

<br><br>

<h3>League Standings (Group Stage)</h3>
<p>Public standings page with split Group A/B tables showing live MP, W, D, L, GF, GA, GD, and PTS.</p>
<img src="public/ReadMe/6 standings page (grp mode active).png" alt="Standings Group Mode" width="100%">

<br><br>

<h3>Match Fixtures</h3>
<p>Fixture scheduler with stage filtering, visibility toggles, match timing config, and live scoreline tracking.</p>
<img src="public/ReadMe/7 admin - fixtures.png" alt="Admin Fixtures" width="100%">

<br><br>

<h3>System Configuration</h3>
<p>Settings hub — live footfall analytics, season lifecycle, bulk Excel ingestion, data migration, critical zones, and system status.</p>
<img src="public/ReadMe/8 admin - settings.png" alt="Admin Settings" width="100%">

<br><br>

<h3>About Us Management</h3>
<p>CMS for the public About page — manage team positions/roles and member profiles with social links.</p>
<img src="public/ReadMe/9 admin - about us.png" alt="Admin About Us" width="100%">

<br><br>

<h3>Admin Configuration</h3>
<p>Root authority management — system admin credentials, staff registration, and access elevation controls.</p>
<img src="public/ReadMe/10 admin - config.png" alt="Admin Config" width="100%">

<br><br>

<h3>System Terminal</h3>
<p>Audit log viewer styled as a terminal — tracks every admin action with timestamps, identity, and operation details.</p>
<img src="public/ReadMe/11 admin - logs.png" alt="System Logs" width="100%">

<br><br>

<h2 style="color: #1A237E; border-bottom: 2px solid #FF5722; padding-bottom: 5px; font-family: 'Inter', sans-serif;">Color Palette</h2>

<div style="display: flex; gap: 10px; font-family: 'Inter', sans-serif;">
  <div style="background-color: #1A237E; color: white; padding: 10px; border-radius: 5px;">Primary: #1A237E</div>
  <div style="background-color: #F5F5F5; color: black; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">Background: #F5F5F5</div>
  <div style="background-color: #FF5722; color: white; padding: 10px; border-radius: 5px;">Accent: #FF5722</div>
</div>
