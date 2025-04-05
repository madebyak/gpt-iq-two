# GPT IQ Project Architecture

This document provides a comprehensive overview of the GPT IQ project architecture, describing the purpose and organization of each component, file, and directory in the codebase.

## Project Overview

GPT IQ is a modern web application built with Next.js 14, TypeScript, and Tailwind CSS. It features a responsive design with theme support (light/dark mode), internationalization capabilities (English/Arabic), and a customized component library based on shadcn/ui.

## Directory Structure

```
gpt-iq-6/
├── docs/                     # Project documentation
├── public/                   # Static assets
├── src/                      # Source code
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   │   ├── icons/            # Custom icon components
│   │   ├── layout/           # Layout components
│   │   ├── theme/            # Theme-related components
│   │   └── ui/               # UI components (shadcn)
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
| `.gitignore` | Git ignore rules |
| `README.md` | Project documentation |

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
| `icon-loading.json` | Loading icon animation data |
| `fonts/` | Custom font files |
| `next.svg`, `vercel.svg` | Default Next.js/Vercel logos |

### `/src` Directory

The main source code for the application, organized into subdirectories:

#### `/src/app` - Next.js App Router

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout component with theme provider and font configuration |
| `page.tsx` | Homepage component |
| `globals.css` | Global CSS including Tailwind imports and CSS variables |
| `favicon.ico` | Site favicon |

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

##### `/src/components/theme`

| File | Purpose |
|------|---------|
| `theme-provider.tsx` | Context provider for theme management using next-themes |
| `theme-toggle.tsx` | Toggle component for switching between light and dark modes |
| `theme-demo.tsx` | Component for demonstrating theme colors and variables |

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

#### `/src/lib`

Utility functions and helpers:

| File | Purpose |
|------|---------|
| `utils.ts` | General utility functions, including Tailwind class merging utilities |

## Design System

The application implements a custom design system with the following key aspects:

### Theme System

- **Light and Dark Themes**: Fully supported with theme-aware components
- **Color Variables**: Implemented using CSS variables in HSL format
- **Management**: Powered by next-themes with system preference detection

### Component Standardization

- **Consistent Sizing**: Larger component sizes for better touch targets
- **Responsive Patterns**: Mobile-first approach with breakpoint-specific behavior
- **Visual Consistency**: Matching border styles, spacing, and typography across components

### Responsive Layout

- **Container Component**: Percentage-based width with maximum constraints
- **Adaptive Behavior**: Content reorganizes based on screen size
- **Mobile Optimizations**: Special handling for touch interfaces and smaller displays

## Implementation Patterns

### Next.js App Router

The application uses Next.js 14's App Router pattern with:

- Root layout for global configuration
- Page components for route-specific UI
- Server components where possible for improved performance

### Font Management

- Uses Next.js built-in font optimization with `next/font/google`
- IBM Plex Sans for English text
- CSS variables for consistent typography

### Styling Approach

- Tailwind CSS for utility-based styling
- CSS variables for theme values
- shadcn/ui components as the foundation for UI elements

## Key Features

1. **Internationalization**: Support for English and Arabic languages with appropriate flags
2. **Themable UI**: Complete light/dark theme support with smooth transitions
3. **Responsive Design**: Adapts to all device sizes from mobile to ultrawide displays
4. **Component Library**: Customized shadcn/ui components with consistent sizing and styling
5. **Modern Navigation**: Professional navbar with proper language selection and theme controls
