# Shaheeda E-commerce Platform

A modern e-commerce platform built with React + Django REST Framework backend.

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
- **Django REST Framework** - Python API
- **MySQL 5.7+** - Database (via XAMPP)
- **JWT** - Authentication (SimpleJWT)

---

## 📁 Project Structure

```
├── src/                    # React frontend source
│   ├── components/         # UI components
│   ├── pages/              # Page components
│   ├── context/            # React context providers
│   ├── lib/                # Utilities and API client
│   └── hooks/              # Custom hooks
├── docs/                   # Documentation
│   └── DJANGO_BACKEND_GUIDE.md  # Complete Django setup guide
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

The app runs at `http://localhost:8080` with mock data.

### Full Stack (With Django Backend)

1. **Set up the Django API** - See [Django Backend Guide](./docs/DJANGO_BACKEND_GUIDE.md)

2. **Start Django server:**
   ```bash
   cd ecommerce_backend
   source venv/bin/activate  # Windows: venv\Scripts\activate
   python manage.py runserver
   ```

3. **Update `.env` file:**
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start frontend:**
   ```bash
   npm run dev
   ```

---

## 📖 Backend Setup Guide

### 👉 [Complete Django REST Framework Documentation](./docs/DJANGO_BACKEND_GUIDE.md)

Includes:
- **Prerequisites** - XAMPP/MySQL installation
- **Django Project Setup** - Step-by-step
- **Models & Serializers** - Complete code
- **Views & URLs** - All API endpoints
- **Authentication** - JWT with SimpleJWT
- **CORS Configuration** - For frontend connection
- **File Uploads** - Media handling
- **Testing** - API testing guide

---

## 🔧 Environment Variables

The `.env` file in project root:

```env
# Django API URL
VITE_API_URL=http://localhost:8000/api    # Local development
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

Deploy the Django API to any Python hosting:
- **PythonAnywhere** - Free tier available
- **Heroku** - Easy deployment
- **DigitalOcean/AWS** - Full control
- **cPanel** - If Python support available

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

- [Django Backend Guide](./docs/DJANGO_BACKEND_GUIDE.md) - Complete Django REST Framework setup
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
