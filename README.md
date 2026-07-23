# Share Viral Task (Mobile App)

This folder contains the Expo React Native application for the Share Viral Task project.

## Structure

- Mobile app built with **Expo SDK**, **React Native 0.81.5**, and **React 19.1.0**
- File-based routing via `expo-router` under `app/`
- TypeScript support configured via `tsconfig.json`
- Core app code lives in `app/`, with assets under `assets/`, styling in `styles/`, and theme tokens in `constants/theme.ts`
- Reusable contexts live in `contexts/`

## Environment Variables

This project does not ship a committed `.env` file.

> **Note:** There is no separate backend or Docker-specific environment setup in this repository.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Use the available npm scripts for platform-specific workflows:

```bash
npm run android   # open on Android emulator / device
npm run ios       # open on iOS simulator / device
npm run web       # open in browser
npm run lint      # run ESLint
```

## Development Notes

- The app entrypoint is managed by Expo Router in `app/_layout.tsx`
- Use the Expo DevTools UI or terminal prompts to open on Android, iOS, web, or Expo Go
- Modify the `app/` directory to update screens and routes
- Global theme values (colors, spacing, typography) are centralised in `constants/theme.ts`; import from there rather than hardcoding values in component files
- Shared state and side-effect logic are housed in `contexts/`; add new providers there and wrap the relevant layout segment in `app/_layout.tsx`

Model real loading, empty, error, and authenticated states through component props or controlled fixtures. Pin responsive stories with the appropriate viewport; the Expo web preview also exposes light and dark canvas modes.

Components, screens, and contexts must never contain secrets or call production services directly with hardcoded credentials. Add a deterministic local mock before wiring a component to a live endpoint; unexpected live requests during development are a signal, not a fallback.

## Useful Links

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router docs](https://expo.dev/router)
- [React Native docs](https://reactnative.dev/)
