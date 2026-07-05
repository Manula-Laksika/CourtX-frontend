# CourtX Frontend (`CourtX-front`)

This repository contains the frontend application for **CourtX**, developed using **React**, **Vite**, and **Tailwind CSS**. It delivers a modern, responsive, and user-friendly interface that communicates seamlessly with the backend while providing secure authentication, profile management, and an improved user experience.

---

# 🚀 Features

- Secure user authentication with login and registration
- Enhanced input validation for authentication forms
- User profile viewing and editing interface
- Responsive search interface with improved usability
- Standardized application typography using the **Inter** font family
- Improved frontend responsiveness and layout consistency
- Backend service integration for real-time communication

---

# 🛠️ Tech Stack

- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **CSS Processing:** PostCSS
- **Linting:** Oxlint
- **Package Manager:** npm

---

# 📁 Project Structure

```text
CourtX-front/
│
├── public/                    # Static assets
│
├── src/
│   ├── assets/                # Images, fonts, global styles
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Application pages
│   ├── routes/                # Routing configuration
│   └── utils/                 # Helper functions & API services
│
├── index.html                 # HTML entry point
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── vite.config.js             # Vite configuration
├── package.json               # Project dependencies
├── package-lock.json
└── README.md
```

---

# ⚡ Getting Started

## Prerequisites

Before running the project, make sure you have installed:

- Node.js (v18 or later recommended)
- npm

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Manula-Laksika/CourtX-front.git
```

Navigate into the project:

```bash
cd CourtX-front
```

Install dependencies:

```bash
npm install
```

---

## Run Development Server

Start the Vite development server:

```bash
npm run dev
```

Open the URL shown in the terminal (typically):

```
http://localhost:5173
```

---

## Linting

Run Oxlint for fast static analysis:

```bash
npx oxlint
```

---

## Production Build

Generate the optimized production build:

```bash
npm run build
```

The compiled files will be available in the `dist/` directory.

---

# 📋 Latest Pull Request

## Title

**feat: update ragService, implement auth security, and improve frontend UI typography**

---

## Overview

This update delivers significant improvements across both the frontend and backend integration. It strengthens authentication security, enhances the user interface, standardizes typography, updates application services, fixes runtime issues, and refreshes project configurations.

---

## Key Changes

### 🔒 Security & Authentication

- Implemented **bcrypt** authentication for secure password hashing.
- Enhanced login and registration validation.
- Improved authentication workflow and security mechanisms.

---

### 🎨 Frontend Improvements

- Standardized typography using the **Inter** font family.
- Developed user profile viewing and editing interfaces.
- Improved responsiveness of the search interface.
- Fixed UI layout issues and enhanced overall user experience.

---

### 🛠️ Backend Integration & Services

- Updated the `ragService` module.
- Fixed application `PARSE_ERROR`.
- Improved frontend-backend communication.
- Successfully synchronized development branches with remote changes.

---

### ⚙️ Configuration & Maintenance

Updated project configuration files including:

- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `.oxlintrc.json`

Also updated:

- `package.json`
- `package-lock.json`
- `.gitignore`
- `README.md`

---

# 📦 Project Highlights

- React + Vite architecture
- Tailwind CSS styling
- Secure authentication system
- Responsive UI
- Profile management
- Improved search experience
- Optimized project configuration
- Fast development with Hot Module Replacement (HMR)
- Static analysis using Oxlint
- Production-ready build pipeline
