# GPT IQ Project Architecture

This document provides a comprehensive overview of the GPT IQ project architecture, describing the purpose and organization of each component, file, and directory in the codebase.

## Project Overview

GPT IQ is a modern web application built with Next.js 14, TypeScript, and Tailwind CSS. It features a responsive design with theme support (light/dark mode), robust internationalization capabilities (Arabic/English), and a customized component library based on shadcn/ui.

## Directory Structure

```bash
gpt-iq-6/
├── docs/                     # Project documentation
├── messages/                 # Internationalization message files
│   ├── ar.json               # Arabic translations
│   └── en.json               # English translations
├── public/                   # Static assets
├── src/                      # Source code
│   ├── app/                  # Next.js App Router pages
│   │   ├── [locale]/         # Internationalized routes
│   │   │   ├── layout.tsx    # i18n-aware layout with RTL support
│   │   │   ├── page.tsx      # i18n-aware homepage
│   │   │   └── home-client.tsx # Client component wrapper for i18n context
│   │   ├── layout.tsx        # Legacy root layout (non-i18n)
│   │   ├── page.tsx          # Legacy homepage (non-i18n)
│   │   └── globals.css       # Global CSS styles
│   ├── components/           # React components
│   │   ├── icons/            # Custom icon components
│   │   ├── layout/           # Layout components
│   │   ├── providers/        # Context providers
│   │   ├── theme/            # Theme-related components
│   │   └── ui/               # UI components (shadcn)
│   ├── i18n/                 # Internationalization configuration
│   │   ├── config.ts         # Language configuration
│   │   ├── navigation.ts     # i18n-aware navigation utilities
│   │   ├── request.ts        # Request handlers for i18n
│   │   └── routing.ts        # i18n routing configuration
│   └── lib/                  # Utility functions and helpers
└── [root files]              # Configuration files
```

## Key Components and Files

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata and dependencies |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.ts` | Tailwind CSS configuration including theme colors and extensions |
| `postcss.config.mjs` | PostCSS configuration for processing CSS |
| `next.config.mjs` | Next.js configuration |
| `components.json` | shadcn/ui component configuration |

### `/messages` Directory

Translation files for internationalization:

| File | Purpose |
|------|---------|
| `ar.json` | Arabic language translations organized by component namespace |
| `en.json` | English language translations organized by component namespace |

### `/docs` Directory

Documentation files for the project:

| File | Purpose |
|------|---------|
| `mobile-responsiveness-strategy.md` | Strategy for ensuring the application is fully responsive |
| `project-architecture.md` | This file - overview of project structure |

### `/public` Directory

Static assets served directly by the web server:

| Asset | Purpose |
|-------|---------|
| `logo-vertical-3.svg` | Primary logo for the application |
| `fonts/` | Custom font files (if applicable) |

### `/src` Directory

The main source code for the application, organized into subdirectories:

#### `/src/app` - Next.js App Router

| File/Directory | Purpose |
|----------------|---------|
| `[locale]/` | Directory for internationalized routes |
| `[locale]/layout.tsx` | i18n-aware layout with RTL support, font loading, and ClientProviders |
| `[locale]/page.tsx` | i18n-aware homepage that fetches translations and renders content |
| `[locale]/home-client.tsx` | Client component wrapper that provides i18n context |
| `layout.tsx` | Legacy root layout (non-i18n) with basic theme support |
| `page.tsx` | Legacy homepage (non-i18n) with minimal structure |
| `page.clean.tsx` | Template page for new content |
| `globals.css` | Global CSS including Tailwind imports and CSS variables |

#### `/src/components` - React Components

Organized into subdirectories by function:

##### `/src/components/icons`

| File | Purpose |
|------|---------|
| `circle-fading-plus.tsx` | Custom icon for the New Chat button |

##### `/src/components/layout`

| File | Purpose |
|------|---------|
| `navbar.tsx` | Primary navigation bar with logo, language selector, theme toggle, and authentication buttons |

##### `/src/components/providers`

| File | Purpose |
|------|---------|
| `client-providers.tsx` | Context provider for client components, especially for i18n features |

##### `/src/components/theme`

| File | Purpose |
|------|---------|
| `theme-provider.tsx` | Context provider for theme management using next-themes |
| `theme-toggle.tsx` | Toggle component for switching between light and dark modes |

##### `/src/components/ui`

Contains shadcn/ui components customized for the application:

| File | Purpose |
|------|---------|
| `button.tsx` | Button component with standardized sizing and variants |
| `container.tsx` | Responsive container with percentage-based width for consistent layouts |
| `dropdown-menu.tsx` | Dropdown menu component |
| `navigation-menu.tsx` | Navigation menu component |
| `toggle.tsx` | Toggle component for boolean options |
| `toggle-group.tsx` | Group of toggle components (used for theme switching) |

#### `/src/i18n` - Internationalization Configuration

| File | Purpose |
|------|---------|
| `config.ts` | Core configuration for next-intl with locale definitions and message loading |
| `navigation.ts` | Utilities for internationalized navigation and links |
| `request.ts` | Request handlers for internationalized routes |
| `routing.ts` | Configuration for internationalized routing patterns |

#### `/src/lib`

Utility functions and helpers:

| File | Purpose |
|------|---------|
| `utils.ts` | General utility functions, including Tailwind class merging utilities |

## Internationalization Architecture

The application implements a comprehensive internationalization system:

### Core Components

- **Locale Routing**: Uses Next.js dynamic route parameters `[locale]` to handle different languages
- **Default Locale**: Arabic (`ar`) is set as the default language
- **Translation Messages**: Stored in JSON files under the `/messages` directory
- **RTL Support**: Full right-to-left layout support for Arabic content
- **Font Handling**: Different fonts for Arabic (IBM Plex Sans Arabic) and English (IBM Plex Sans)

### Implementation Pattern

1. **Server Components**:
   - Load translations using `getTranslations` from next-intl
   - Pass only necessary translations to client components
   - Handle locale detection and validation

2. **Client Components**:
   - Use `NextIntlClientProvider` to provide translation context
   - Access translations via `useTranslations` hook
   - Implement fallback values for robustness

3. **Navigation**:
   - Custom `Link` component from `@/i18n/navigation` preserves the current locale
   - Conditionally uses regular Next.js `Link` when outside translation context

## Theme System

The application implements a custom theme system with the following key aspects:

- **Light and Dark Themes**: Fully supported with theme-aware components
- **Color Variables**: Implemented using CSS variables in HSL format
- **Management**: Powered by next-themes with system preference detection
- **Theme Toggle**: Custom component with localized labels

## Component Architecture

The application follows a clear separation of concerns:

### Server vs Client Components

- **Server Components**: Used for static content, translation loading, and initial rendering
- **Client Components**: Used for interactive elements, theme switching, and client-side navigation
- **Hybrid Approach**: `use client` directive marks client components, with server components handling data fetching

### Component Patterns

- **Resilient Design**: Components gracefully handle missing contexts (i18n, theme)
- **Conditional Rendering**: Components adapt based on available context and screen size
- **Composition**: Complex components built from simpler, reusable components

## Key Features

1. **Internationalization**: Comprehensive support for Arabic (RTL) and English (LTR) with appropriate font selection
2. **Language Switching**: Built-in language selector with country flags and localized language names
3. **Themable UI**: Complete light/dark theme support with smooth transitions
4. **Responsive Design**: Adapts to all device sizes from mobile to ultrawide displays
5. **Modern Navigation**: Professional navbar with dropdown menus, language selection, and theme controls
