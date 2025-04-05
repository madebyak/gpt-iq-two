# GPT IQ - Professional Web Application

A modern web application built with Next.js, TypeScript, and Tailwind CSS featuring responsive design and theme support.

## Features

- **Modern Design System** - Professional UI with light and dark theme support
- **Responsive Layout** - Optimized for all devices from mobile to ultrawide displays
- **Internationalization** - Support for English and Arabic languages
- **Customized Components** - Larger touch targets and consistent sizing across UI elements

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- Lucide React Icons
- next-themes

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

- `/src/components/ui` - Base UI components
- `/src/components/layout` - Layout components like Navbar
- `/src/components/theme` - Theme-related components
- `/src/components/icons` - Custom icon components
- `/docs` - Project documentation

## Responsive Design

This project implements a mobile-first approach with a custom Container component that provides consistent layout across all screen sizes. For more information, see the [mobile-responsiveness-strategy.md](./docs/mobile-responsiveness-strategy.md) document.
