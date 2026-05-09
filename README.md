# ⚡ RECON-X — Universal Data Reconciliation Tool

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-19-61DAFB)
![SQLite](https://img.shields.io/badge/database-SQLite-003B57)

RECON-X is a full-stack universal data reconciliation tool that lets you upload any two Excel files — regardless of structure — and instantly compare them row by row across multiple sheets. It detects value mismatches, missing records, and generates a detailed export report, all in a clean dark UI.

---

## 🖥️ Screenshots

> Upload Dashboard → Results Page → Job History

---

## ✨ Features

- 📂 **Universal Excel Support** — Works with any `.xlsx` or `.xls` file, any number of columns, any number of sheets
- 🔑 **User-Defined Key Column** — You choose which column to use for row matching
- 🔍 **Multi-Sheet Comparison** — Compares data across all sheets in both files simultaneously
- ⚡ **Three Types of Discrepancies Detected:**
  - `MISMATCH` — Same row key, different column values
  - `MISSING IN A` — Row exists in File B but not File A
  - `MISSING IN B` — Row exists in File A but not File B
- 📊 **Stats Dashboard** — Total rows, matched rows, mismatches, missing records, match percentage
- 🔎 **Filter & Search** — Filter results by type, sheet, or search by row key
- 📄 **Paginated Results** — Handles thousands of rows cleanly
- 💾 **Job History** — Every reconciliation is saved with a unique Job ID for future reference
- 📥 **Excel Export** — Download a full report with Summary, All Results, Mismatches, and Missing Records sheets
- 🎨 **Themeable UI** — Built with DaisyUI, swap themes in one line of config

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| better-sqlite3 | Lightweight file-based database |
| multer | Excel file upload handling |
| xlsx | Excel file parsing and export |
| uuid | Unique Job ID generation |
| dotenv | Environment variable management |
| ES Modules | Modern JavaScript imports |

### Frontend
| Package | Purpose |
|---|---|
| React 19 + Vite | Frontend framework and build tool |
| React Router v7 | Client-side routing |
| Axios | HTTP requests to backend |
| DaisyUI v4 + Tailwind CSS v3 | UI components and styling |
| Lucide React | Icons |
| react-hot-toast | Toast notifications |

---

## 📁 Project Structure

```
RECON-X/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # SQLite initialization
│   │   ├── controllers/
│   │   │   ├── upload.controller.js  # File parsing + comparison logic
│   │   │   └── job.controller.js     # Job CRUD + export
│   │   ├── routes/
│   │   │   ├── upload.routes.js
│   │   │   └── job.routes.js
│   │   └── server.js
│   ├── uploads/                   # Uploaded files (gitignored)
│   ├── recon-x.db                 # SQLite database (gitignored)
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── lib/
    │   │   └── axios.js           # Axios instance
    │   ├── pages/
    │   │   ├── UploadPage.jsx     # Upload + config screen
    │   │   ├── ResultsPage.jsx    # Results + export screen
    │   │   └── HistoryPage.jsx    # Job history screen
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/RECON-X.git
cd RECON-X
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
PORT=5000
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open the app
```
http://localhost:5173
```

---

## 📡 API Reference

### POST `/api/upload`
Upload two Excel files and run reconciliation.

**Body:** `multipart/form-data`
| Field | Type | Description |
|---|---|---|
| file1 | File | First Excel file |
| file2 | File | Second Excel file |
| keyColumn | String | Column name to match rows by |

**Response:**
```json
{
  "message": "Reconciliation complete",
  "jobId": "uuid",
  "stats": {
    "totalRows": 10,
    "matchedRows": 7,
    "mismatchedRows": 2,
    "missingInFile1": 0,
    "missingInFile2": 1
  }
}
```

---

### GET `/api/jobs`
Returns all past reconciliation jobs.

---

### GET `/api/jobs/:jobId`
Returns details of a single job.

---

### GET `/api/jobs/:jobId/results`
Returns paginated results for a job.

**Query Params:**
| Param | Default | Description |
|---|---|---|
| page | 1 | Page number |
| limit | 50 | Results per page |
| type | — | Filter: `mismatch`, `missing_in_file1`, `missing_in_file2` |
| sheet | — | Filter by sheet name |

---

### GET `/api/jobs/:jobId/export`
Downloads a `.xlsx` report file with 4 sheets: Summary, All Results, Mismatches, Missing Records.

---

### DELETE `/api/jobs/:jobId`
Deletes a job and all its results.

---

## 🎨 Changing the Theme

Open `frontend/tailwind.config.js` and change the theme:

```javascript
daisyui: {
  themes: ["luxury"], // try: dark, night, dracula, cyberpunk, forest, black
},
```

---

## 📌 Roadmap

- [ ] PDF export support
- [ ] Progress bar for large file processing
- [ ] Column-level mismatch summary chart
- [ ] Drag and drop file upload
- [ ] Multi-user support

---

## 👤 Author

**Shakeeb** — [GitHub](https://github.com/YOUR_USERNAME)

---

## 📄 License

This project is licensed under the MIT License.
