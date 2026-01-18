# Shaheeda E-commerce Platform

A modern e-commerce platform built with React + PHP backend.

## 🚀 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Query** - Data fetching
- **React Router** - Navigation

### Backend
- **PHP 7.4+** - Server-side API
- **MySQL 5.7+** - Database
- **JWT** - Authentication

---

## 📁 Project Structure

```
├── src/                    # React frontend source
│   ├── components/         # UI components
│   ├── pages/              # Page components
│   ├── context/            # React context providers
│   ├── lib/                # Utilities and API
│   └── hooks/              # Custom hooks
├── php-api/                # PHP backend API
│   ├── config/             # Database, JWT, CORS config
│   ├── endpoints/          # API endpoints
│   ├── database/           # SQL schema
│   └── helpers/            # Response helpers
└── public/                 # Static assets
```

---

## 🛠️ Quick Start

### Frontend Only (Mock Data)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` with mock data.

### Full Stack (With PHP Backend)

1. **Set up the PHP API** - See [PHP API Setup Guide](./php-api/README.md)
2. **Update environment variable:**
   ```env
   VITE_API_URL=http://localhost/api
   ```
3. **Start frontend:**
   ```bash
   npm run dev
   ```

---

## 📖 Backend Setup Guides

### 👉 [Complete PHP API Documentation](./php-api/README.md)

Includes:
- **Local Development** (XAMPP) - Step-by-step setup
- **Production Deployment** (cPanel) - Complete guide
- **API Reference** - All endpoints documented
- **Security Best Practices**
- **Troubleshooting Guide**

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# API URL (change based on environment)
VITE_API_URL=http://localhost/api          # Local development
# VITE_API_URL=https://yourdomain.com/api  # Production
```

---

## 🌐 Deployment Options

### Frontend Deployment

**Option 1: Lovable (Recommended)**
1. Open your [Lovable Project](https://lovable.dev)
2. Click **Share → Publish**

**Option 2: Static Hosting**
```bash
npm run build
# Upload 'dist' folder to any static host
```

### Backend Deployment

Deploy the PHP API to any PHP hosting:
- **cPanel** - See [PHP API README](./php-api/README.md#cpanel-production-deployment)
- **Any PHP Host** - Upload `php-api` folder, configure database

---

## 🔑 Default Admin Credentials

After setting up the database:

- **Email:** `admin@shaheeda.com`
- **Password:** `Admin123!`

⚠️ **Change these immediately in production!**

---

## 📱 Features

- 🛒 Full shopping cart functionality
- 👤 User authentication (register, login, profile)
- 📦 Order management
- ❤️ Wishlist
- 🔍 Product search and filtering
- 📊 Admin dashboard
- 📱 Responsive design
- 🌙 Dark/Light mode

---

## 📚 Additional Documentation

- [Django Backend Guide](./docs/DJANGO_BACKEND_GUIDE.md) - Alternative Python backend
- [Lovable Docs](https://docs.lovable.dev) - Platform documentation

---

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - Feel free to use and modify for your projects.
