# NEXUS | Premium Digital Experience

A state-of-the-art React application built with a focus on luxury aesthetics, high-performance animations, and dynamic data visualization.

## Tech Stack
- **Core:** React 18 (via CDN)
- **Styling:** Tailwind CSS (Play CDN)
- **Animations:** AOS (Animate On Scroll) & Custom CSS Keyframes
- **Icons:** Lucide React
- **Typography:** Outfit (Google Fonts)

## Features
- **Luxury Dark Theme:** Deep black surfaces with neon cyan and purple accents.
- **Glassmorphism:** backdrop-blur cards with delicate bordering.
- **Dynamic Dashboard:** Automated intelligence feed integrating the provided API key.
- **Micro-interactions:** Gradient border glows on hover and fluid scroll transitions.
- **Adaptive Layout:** Fully responsive from mobile to ultra-wide displays.

## API Integration
The system is configured to use the key `zvs5oNys1zJjLJwhM7knAfPbdBKgsXyn`. It defaults to a News Intelligence stream. If the key is intended for a different service (e.g. Crypto/Weather), the `Dashboard` component's `fetchIntel` function can be easily mapped to the corresponding endpoint.

## How to View
Simply open `index.html` in any modern browser. No build step required as it uses Babel for real-time JSX transformation.
