# FatigueGuard AI 🛡️🧠

FatigueGuard AI is a dual-database workplace analytics platform designed to monitor cognitive fatigue in real-time. By analyzing behavioral patterns (typing rhythm and mouse precision), the system provides data-driven health insights to prevent burnout and improve employee well-being.

## 🚀 Features

- **Real-time Analytics:** Visualizes fatigue trends using Recharts.
- **Dual-Database Architecture:** - **MySQL:** Secure user authentication and account management.
  - **MongoDB:** High-performance storage for time-series AI fatigue reports.
- **Smart Alerts:** Dynamic system recommendations based on AI-detected fatigue scores.
- **Secure Auth:** JWT-based authentication with persistent user sessions and password recovery via Resend.
- **Responsive Dashboard:** A modern, professional UI built with React and Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide React (Icons), Recharts (Data Viz).
- **Backend:** Node.js, Express.js.
- **Databases:** MySQL (Relational), MongoDB (NoSQL).
- **Security:** Bcrypt (Hashing), JWT (Tokens).
- **Email:** Resend API.

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (Optional, for manual data entry)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/fatigue-guard.git](https://github.com/YOUR_USERNAME/fatigue-guard.git)
cd fatigue-guard
2. Backend SetupNavigate to the backend folder:Bashcd backend
Install dependencies:Bashnpm install
Create a .env file and add your credentials:Code snippetPORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=fatigue_guard_db
JWT_SECRET=your_secret_key
RESEND_API_KEY=your_resend_key
Start the server:Bashnode server.js
3. Frontend SetupOpen a new terminal and navigate to the frontend folder:Bashcd frontend
Install dependencies:Bashnpm install
Start the React development server:Bashnpm run dev
📊 Database SchemaMySQL (Users Table)FieldTypeDescriptionidINT (PK)Auto-incrementing User IDusernameVARCHARUser's display nameemailVARCHARUnique work emailpassword_hashTEXTBcrypt hashed passwordMongoDB (AI Reports Collection)JSON{
  "userId": 1,
  "fatigueLevel": "Severe",
  "fatigueScore": 88,
  "recommendation": "High fatigue detected. Please rest now.",
  "createdAt": "ISODate"
}
📸 Screenshots(Tip: Add your dashboard screenshot here to make your GitHub profile look amazing!)🛡️ LicenseDistributed under the MIT License.
---

### How to add this to your GitHub:
1. Create a new file in your project named `README.md`.
2. Paste the code above.
3. Replace `YOUR_USERNAME` with your actual GitHub username.
4. **Commit and Push:**
   ```bash
   git add README.md
   git commit -m "docs: add project documentation"
   git push