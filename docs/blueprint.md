# **App Name**: Dongre Football Premier League

## Core Features:

- Player Management: Create, read, update, and delete player information with details like name, team, category, preferred position, and stats. Accessible to admin users only.
- Team Management: Manage teams, including adding new teams with owners and logos, updating team information, and displaying team rosters. Accessible to admin users only.
- Match Management: Schedule matches, record scores, and update match status. Provides functionality for updating team statistics automatically after each match. Accessible to admin users only.
- Live Standings: Display real-time standings based on match results, updating automatically as scores are entered. Shows team rank, points, wins, losses, and goal difference. Public read-only for all users.
- Admin Authentication: Secure admin login using JWT-based authentication. Admin users can manage all aspects of the tournament, while public users have read-only access.
- Theme Switcher: Allows users to toggle between light and dark themes for optimal viewing experience.
- Season Management: Allows admin to change the football season using a tool, impacting labels on the Landing Page.

## Style Guidelines:

- Primary color: Deep Blue (#1A237E), reminiscent of a classic football aesthetic and team colors, suggesting loyalty and reliability. 
- Background color: Very Light Gray (#F5F5F5), provides a neutral, unobtrusive backdrop that supports readability and contrast, keeping the focus on the content and action.
- Accent color: Vibrant Orange (#FF5722), serves as a punchy, energetic call-to-action color that enhances UI elements and reinforces user interaction with a modern look.
- Body and headline font: 'Inter', a sans-serif font, known for its clean and versatile design, ensures excellent readability across all devices, supporting clear information architecture.
- Use simple, recognizable icons from Lucide to represent various functions and data points. Ensure icons are consistent in style and size.
- Implement a grid-based layout to organize content efficiently. Use white space to create clear visual separation between elements and improve overall user experience.
- Incorporate subtle transitions and animations to enhance user interactions, such as fading in new content or highlighting changes in standings. Avoid distracting or unnecessary animations.