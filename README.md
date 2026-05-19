# 🚀 G-oally — Digitizing Accountability

<p align="center">
  <img width="160" src="public/favicon.svg" alt="Gioally Logo"/>
</p>

<h1 align="center">G-oally</h1>

<p align="center">
  A modern Goal Setting & Performance Tracking Platform built to simplify how employees, managers, and HR collaborate during performance cycles.
</p>

<p align="center">
  <a href="#-the-story-behind-g-oally">Story</a> •
  <a href="#-what-g-oally-solves">Features</a> •
  <a href="#-user-roles">Roles</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-run-locally">Setup</a>
</p>

---

## 🌍 The Story Behind G-oally

Every year in organizations, employees fill endless spreadsheets, managers chase approvals through emails, and HR teams manually track performance reviews.

**Goals get lost. Approvals get delayed. Nobody has visibility.**

Performance management becomes paperwork instead of progress.

That's where **G-oally** comes in.

> *"Most systems digitize spreadsheets. Gioally digitizes accountability."*

G-oally transforms fragmented goal management into a transparent and collaborative workflow where:

- **Employees** create and track goals
- **Managers** review and approve submissions
- **HR** gains organization-wide visibility
- **Every action** becomes measurable and auditable

---

## 💡 What G-oally Solves

✅ No more scattered spreadsheets  
✅ No more manual follow-ups  
✅ No more unclear approvals  
✅ No more disconnected KPI tracking

### G-oally creates:

- **Real-time visibility** into goal progress
- **Structured approval workflows** for managers
- **Secure role-based access** control
- **Centralized performance tracking** for HR

---

## 👥 User Roles

### 👨‍💼 Employee
- Create goals with thrust areas and weightage
- Submit goal sheets for approval
- Track approval status in real-time
- View performance cycles

### 👨‍💻 Manager
- Review team submissions
- Approve or return goals with feedback
- Monitor team progress
- Track goal health scores

### 🏢 Admin / HR
- Manage performance cycles
- Track organization-wide completion
- Push shared goals to teams
- Export reports and analytics

---

## ✨ Standout Features

### 🎯 Live Weightage Validation
Employees instantly know if their goal distribution is balanced (must total 100%).

### 🔒 Goal Locking System
Approved goals become locked to ensure accountability and prevent changes.

### 📊 Goal Health Score
Tracks submission quality and completion readiness with visual indicators.

### 🤖 AI Goal Suggestions
Smart KPI recommendations for employees based on role and department.

### 📈 Animated Progress Tracking
Beautiful progress bars and visual feedback for goal completion.

### 💡 Smart Validation
Real-time feedback on goal inputs with visual indicators.

### 📜 Audit Trail
Every action is logged for transparency and governance.

### 🎨 Premium UI/UX
- Glass-morphism card design
- Smooth animations and transitions
- Role-specific insight cards
- Activity timeline
- Empty state illustrations

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite + TailwindCSS |
| **Backend** | Supabase (Auth + Database + RLS) |
| **Database** | PostgreSQL |
| **Icons** | Lucide React |
| **Deployment** | Vercel (Frontend) + Supabase (Backend) |

---

## ⚡ Why G-oally Stands Out

Gioally is **not just a CRUD app**.

It is designed like a real enterprise workflow platform with:

- ✅ Role-based architecture
- ✅ Approval lifecycle management
- ✅ Audit logging
- ✅ Scalable cloud infrastructure
- ✅ Secure access control (Row Level Security)

All while maintaining:
- **Clean UI** — Modern, intuitive interface
- **Fast workflows** — Optimized performance
- **Zero-cost deployment** — Supabase free tier + Vercel

---

## 🚀 Run Locally

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/hasishinfant/G-oally..git
cd G-oally.
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the schema from `supabase/schema.sql`
4. (Optional) Run `supabase/fix-rls.sql` if you encounter permission issues

### 5. Start the development server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running!

### 6. Demo Login Credentials
```
Employee: alice@demo.com / Password123
Manager:  bob@demo.com / Password123
Admin:    carol@demo.com / Password123
```

---

## 📈 Real World Impact

G-oally helps organizations:

- ✅ Reduce manual HR operations
- ✅ Improve accountability
- ✅ Increase transparency
- ✅ Streamline review cycles
- ✅ Align employee goals with business objectives

---

## 🚀 Future Vision

G-oally can evolve into:

- 🤖 AI-powered performance analytics
- 📊 Predictive KPI systems
- 🔗 Enterprise HR integrations (SAP, Workday)
- ⚡ Automated escalation workflows
- 🧠 Organization-wide performance intelligence

---

## 🌐 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Backend & Database → Supabase
Already configured! Just ensure your `.env` points to your Supabase project.

---

## 📂 Project Structure

```
g-oally/
├── src/
│   ├── components/
│   │   ├── auth/          # Login components
│   │   ├── employee/      # Employee-specific features
│   │   ├── shared/        # Shared UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── lib/               # Supabase client
│   ├── pages/             # Dashboard pages
│   └── main.jsx           # App entry point
├── supabase/
│   ├── schema.sql         # Database schema
│   └── fix-rls.sql        # RLS policy fixes
├── public/                # Static assets
└── README.md
```

---

## 📌 Final Thought

> *"Organizations don't fail because goals are absent. They fail because accountability becomes invisible."*

**G-oally brings visibility, structure, and intelligence into organizational performance management.**

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

<p align="center">Made with ❤️ for better performance management</p>
