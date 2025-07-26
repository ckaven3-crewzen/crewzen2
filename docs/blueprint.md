# **App Name**: OriginConfigurator

## Core Features:

- Origin Detection: Detect cross-origin requests from the Next.js server logs.
- Log Analysis: Use a tool to analyze the server logs for cross-origin request errors and identify the origin.
- Config Generation: Use a tool to generate the `allowedDevOrigins` configuration based on detected origins.
- Display Results: Display the detected origins and the generated configuration in a user-friendly format.
- Manual Override: Allow the user to manually add or remove origins from the `allowedDevOrigins` configuration.
- Config Writer: Write the updated `next.config.js` file, so that the Next.js server will apply the changes.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) for a focused and professional feel.
- Background color: Very light gray (#F5F5F5), close in hue to the primary color, for a clean workspace appearance.
- Accent color: Soft Lavender (#C5CAE9), analogous to Indigo, for interactive elements and highlights.
- Font: 'Inter', a grotesque-style sans-serif, for both headlines and body text.
- Use simple, clear icons to represent actions like adding or removing origins.
- Use a clean, structured layout to present the server logs and generated configuration side-by-side.
- Subtle transitions and feedback animations when adding or removing origins and writing to the configuration file.