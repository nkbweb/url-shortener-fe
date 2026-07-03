<div align="center">
  <h1>🔗 URL Shortener — Frontend</h1>
  <p>
    <strong>A modern, responsive dashboard for managing short URLs — built with Next.js 16, React 19 &amp; Tailwind CSS 4</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-000000?logo=next.js" alt="Next.js 16"/>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19"/>
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4"/>
    <img src="https://img.shields.io/badge/shadcn/ui-latest-000000?logo=shadcnui" alt="shadcn/ui"/>
  </p>
</div>

---

## ✨ Features

- **URL Shortening** — Create shortened links with a single click
- **Click Analytics** — Visualize click counts, referrers, and traffic over time
- **Authentication** — Login, register, and secure password-reset flow
- **User Dashboard** — Manage all your links in one place
- **QR Codes** — Generate QR codes for every short link
- **Dark / Light Mode** — Seamless theme switching via `next-themes`
- **Responsive Design** — Works beautifully on desktop, tablet & mobile
- **Form Validation** — Client-side validation with React Hook Form + Zod
- **Toast Notifications** — Real-time feedback with `react-hot-toast`

---

## 🧱 Tech Stack

| Layer            | Technology                                                                  |
| ---------------- | --------------------------------------------------------------------------- |
| **Framework**    | Next.js 16 (App Router)                                                     |
| **UI Library**   | React 19                                                                    |
| **Styling**      | Tailwind CSS 4 + `tailwind-merge` + `clsx` + `tw-animate-css`               |
| **Components**   | shadcn/ui (Radix UI primitives)                                             |
| **Animation**    | Framer Motion                                                               |
| **Forms**        | React Hook Form + Zod                                                       |
| **State**        | Zustand                                                                     |
| **HTTP**         | Axios                                                                       |
| **Icons**        | Lucide React                                                                |
| **Theming**      | next-themes                                                                 |
| **QR Code**      | `qrcode`                                                                    |
| **Toasts**       | react-hot-toast                                                             |
| **Language**     | TypeScript                                                                  |

---

## 📁 Project Structure

```
app/
├── (auth)/                 # Auth group routes
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── forgot-password/    # Forgot password page
│   ├── reset-password/     # Password reset page
│   └── layout.tsx          # Auth layout wrapper
├── (dashboard)/            # Dashboard group routes
│   ├── dashboard/          # Main dashboard (link list)
│   ├── analytics/          # Click analytics page
│   ├── settings/           # User settings page
│   └── layout.tsx          # Dashboard layout (sidebar, nav)
├── api/                    # Next.js API route handlers (if any)
├── globals.css             # Global styles & Tailwind directives
├── layout.tsx              # Root layout (providers, fonts)
└── page.tsx                # Landing / redirect page

components/
├── auth/                   # Auth form components
├── layout/                 # Navbar, sidebar, footer
├── ui/                     # shadcn/ui primitives (button, input, card, etc.)
└── urls/                   # URL list, card, create-form, QR code

lib/                        # Utility functions & Axios instance
hooks/                      # Custom React hooks
providers/                  # Theme provider, query provider, etc.
middleware.ts               # Next.js middleware (auth redirects)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm / pnpm / yarn
- [URL Shortener API](https://github.com/<your-org>/url-shortener) running locally

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/url-shortener-fe.git
cd url-shortener-fe
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

| Variable              | Description                        | Default                    |
| --------------------- | ---------------------------------- | -------------------------- |
| `API_BASE_URL`        | Backend API base URL (server-side) | `http://localhost:3000`    |
| `AUTH_COOKIE_NAME`    | Access-token cookie name           | `access_token`             |
| `REFRESH_COOKIE_NAME` | Refresh-token cookie name          | `refresh_token`            |
| `NODE_ENV`            | Environment                        | `development`              |

### 3. Start Development

```bash
npm run dev
```

Open **http://localhost:3001** in your browser.

> Make sure the backend API is running on `http://localhost:3000`.

---

## 🧪 Build for Production

```bash
npm run build
npm start
```

---

## 🧹 Lint

```bash
npm run lint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT © [Nishchay Bhardwaj]
