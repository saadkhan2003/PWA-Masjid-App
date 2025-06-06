# Mosque Committee Management PWA

A comprehensive Progressive Web App (PWA) for managing mosque committee members, payments, debts, and financial tracking. Built with Next.js 14, Supabase, and designed with Islamic aesthetics.

## Features

### ✅ **Core Features**
- **Member Management**: Add, edit, view, and manage committee members
- **Payment Tracking**: Record and track monthly dues and payments
- **Debt Management**: Monitor outstanding debts and overdue payments
- **Dashboard Analytics**: Real-time stats and financial overview
- **Islamic Design**: Beautiful UI with Islamic color scheme and patterns

### ✅ **PWA Features**
- **Offline Support**: Full offline functionality with IndexedDB storage
- **Mobile Installation**: Install as native app on mobile devices
- **Real-time Sync**: Background synchronization when online
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### ✅ **Technical Features**
- **Type Safety**: Full TypeScript implementation
- **State Management**: Zustand for lightweight state management
- **Database**: Supabase with PostgreSQL backend
- **Styling**: Tailwind CSS with custom Islamic theme
- **Performance**: Optimized builds and caching strategies

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mosque-committee-pwa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database:**
   
   Follow the detailed instructions in [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) to create tables and sample data.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   
   Navigate to `http://localhost:3000` in your browser.

## Project Structure

```
mosque-committee-pwa/
├── app/                          # Next.js 14 app directory
│   ├── dashboard/               # Dashboard page
│   ├── members/                 # Member management pages
│   │   ├── add/                # Add member form
│   │   └── [id]/               # Member details and edit
│   ├── payments/               # Payment management pages
│   ├── debts/                  # Debt management pages
│   ├── layout.tsx              # Root layout with PWA setup
│   └── page.tsx                # Home page
├── components/                  # Reusable UI components
│   ├── dashboard/              # Dashboard-specific components
│   ├── layout/                 # Layout components (nav, header)
│   ├── providers/              # Context providers
│   └── ui/                     # Base UI components
├── lib/                        # Utility libraries
│   ├── offline/                # Offline storage and sync
│   ├── stores/                 # Zustand state stores
│   ├── supabase/              # Database queries and client
│   └── utils/                  # Helper functions
├── public/                     # Static assets
│   ├── icons/                  # PWA icons
│   ├── screenshots/            # App screenshots
│   └── manifest.json           # PWA manifest
├── types/                      # TypeScript type definitions
└── DATABASE_SETUP.md          # Database setup guide
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checker

### Key Technologies

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **PWA**: next-pwa plugin
- **Offline Storage**: IndexedDB via Dexie.js
- **Icons**: Lucide React
- **TypeScript**: Full type safety

### Development Workflow

1. **Features**: Develop new features in feature branches
2. **Database Changes**: Update both schema and TypeScript types
3. **Offline Support**: Ensure all features work offline
4. **Testing**: Test on mobile devices and various screen sizes
5. **PWA Testing**: Test installation and offline functionality

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

### PWA Deployment Checklist

- ✅ HTTPS enabled (required for PWA)
- ✅ Service worker registered
- ✅ Web manifest valid
- ✅ Icons and screenshots included
- ✅ Offline functionality tested
- ✅ Mobile installation tested

## Usage Guide

### Dashboard
- View committee statistics and financial overview
- Quick access to recent payments and overdue debts
- Daily Islamic quotes for inspiration

### Member Management
- Add new committee members with contact information
- Edit member details and monthly dues
- Track member status (active/inactive)
- View member payment history and outstanding debts

### Payment Tracking
- Record monthly dues payments
- Track partial payments and payment history
- Generate receipt numbers
- Filter payments by month, year, or member

### Debt Management
- Monitor outstanding debts and overdue payments
- Set due dates and payment reminders
- Track debt status (pending/overdue/paid)
- Bulk operations for debt management

### Offline Usage
- All features work without internet connection
- Data syncs automatically when connection restored
- Visual indicators show online/offline status
- Queued operations processed when online

## Customization

### Islamic Theme
The app uses a custom Islamic color scheme:
- Primary: `#1E8A7A` (Islamic Green)
- Light: `#2DD4BF` (Islamic Green Light)
- Accent colors for different statuses

### Branding
Update the following files to customize branding:
- `public/manifest.json` - App name and description
- `public/icons/` - App icons
- `app/layout.tsx` - Page titles and metadata

### Features
- Add new pages in the `app/` directory
- Create reusable components in `components/`
- Add database queries in `lib/supabase/queries.ts`
- Extend TypeScript types in `types/app.ts`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## Security

- Row Level Security (RLS) enabled on all tables
- Input validation on both client and server
- Secure environment variable handling
- No sensitive data exposed to client

## Support

For support and questions:
1. Check the [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database issues
2. Review the Next.js and Supabase documentation
3. Create an issue in the repository

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**May this tool serve the Muslim community well and help in the efficient management of mosque committees. Barakallahu feekum!** 🕌
