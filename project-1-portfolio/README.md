# Keerthana - Personal Developer Portfolio
> **MCA Student & Aspiring Full Stack Developer** | Tamil Nadu, India

A modern, professional, and fully responsive personal portfolio website engineered for **Keerthana**, an MCA (Master of Computer Applications) postgraduate student and aspiring full stack developer. Built with clean, semantic **HTML5**, **Tailwind CSS + Custom CSS3** design tokens, and lightweight vanilla **ES6+ JavaScript**.

---

## 🚀 Website Highlights & Features

### 1. Theme & Design Aesthetics
- **Light Theme & Palette:** Pure crisp white background (`#ffffff`), slate surfaces (`#f8fafc`), royal blue (`#2563eb`), and deep purple (`#7c3aed`) gradient accents.
- **Micro-Interactions:** Smooth transitions, floating badge physics, active link ScrollSpy, elevation on scroll, and accessible contrast ratios.
- **Full Responsiveness:** Tailored layouts for mobile devices (with animated hamburger drawer menu), tablets, and high-resolution desktop screens.

### 2. Website Sections
1. **Home (Hero):**
   - Personal introduction: **Keerthana**, MCA Student | Aspiring Full Stack Developer.
   - Status badge: *"Available for Entry-Level & Full Stack Developer Roles"* with live pulsing green indicator.
   - Interactive profile card with high-definition developer vector illustration and floating badges (`MCA Candidate 🎓`, `Staff Automation: PHP & MySQL ⚡`, `BCA Completed`).
   - Call-to-action buttons: **"View Projects"**, **"Contact Me"**, and **"Resume"**.

2. **About Me:**
   - Detailed introduction covering an MCA student's passion for web development, database management systems, and object-oriented software engineering.
   - Candidate Overview card with degree statuses (MCA Pursuing, BCA Completed), location (Tamil Nadu, India), languages, and core focus areas.
   - 4 foundational pillars: Web Development, Database Management, Object-Oriented Logic, and Academic Excellence.

3. **Skills & Tech Stack:**
   - Covers all 6 required technologies: **HTML5**, **CSS3**, **JavaScript (ES6+)**, **PHP**, **MySQL**, and **Java**.
   - Interactive category filter tabs (**All**, **Frontend**, **Backend & DB**, **Core Programming**).
   - Visual progress bars, proficiency indicators, and practical application descriptions.

4. **Projects Showcase:**
   - **Flagship Project:** **Staff Automation System**
     - Developed with **PHP, MySQL, HTML5, CSS3, and JavaScript**.
     - Solves institutional administrative challenges: manages staff profiles, academic qualifications, professional experience history, publications & research activities, and automated report generation.
     - Interactive **"Inspect Detailed Architecture"** button that opens a comprehensive system architecture modal with database entity breakdown (`tbl_staff`, `tbl_qualifications`, `tbl_experience`, `tbl_publications`, `tbl_reports`).
     - Editable GitHub and Live Preview placeholder links.
   - **Secondary Academic Projects:**
     - *Modern Responsive Portfolio Website* (HTML5, CSS3/Tailwind, JavaScript)
     - *Student Database & Grading System* (Java GUI & MySQL JDBC)

5. **Education:**
   - Vertical milestone timeline highlighting:
     - **Master of Computer Applications (MCA)** - *Currently Pursuing*
     - **Bachelor of Computer Applications (BCA)** - *Completed*
   - Includes coursework focus (Advanced Database Systems, Web Technologies, Software Engineering, Object-Oriented Programming).

6. **Contact:**
   - Left Panel: Contact info cards with pre-configured active details:
     - **Email:** `gokulkeerthana230@gmail.com` (with a one-click "Copy Email" button)
     - **LinkedIn:** `linkedin.com/in/keerthana-ravikumar` (Keerthana Ravikumar)
     - **GitHub:** `github.com/gokulkeerthana230-rgb`
     - **Location:** Tamil Nadu, India
   - Right Panel: Interactive contact form with real-time field validation, loading states, in-form status alerts, and floating toast notifications.

7. **Footer:**
   - Navigation shortcuts, social media links, automated copyright year, and a floating **Back to Top** button.

---

## 📁 Project Directory Structure

```text
task-1-portfolio/
│
├── index.html                           # Main portfolio markup & semantic structure
├── vercel.json                          # Configuration for seamless zero-config deployment
├── README.md                            # Complete setup & customization documentation
│
├── css/
│   └── style.css                        # Design tokens, gradients, animations & custom styling
│
├── js/
│   └── main.js                          # Vanilla JS for navbar, scrollspy, modal, form & toast
│
└── assets/
    └── images/
        ├── favicon.svg                  # Custom gradient "K" favicon
        ├── profile-placeholder.svg       # Vector developer profile illustration
        ├── project-staff-automation.svg # Staff Automation System dashboard preview
        ├── project-ecommerce.svg        # Modern web design project preview
        └── project-student-mgmt.svg     # Student database application preview
```

---

## 🛠️ How to View & Run Locally

### Method 1: Direct File Opening (No Installation Needed)
Double-click `index.html` in your file manager or right-click `index.html` and select **Open with Google Chrome** (or Edge/Firefox/Safari).

### Method 2: VS Code Live Server
1. Open this folder in **VS Code**.
2. Right-click `index.html` and click **"Open with Live Server"**.

### Method 3: Local Python HTTP Server
Run the following in PowerShell or terminal within this directory:
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000` in your web browser.

---

## ✏️ How to Customize Personal Details (Two Flexible Methods)

### Method 1: Interactive Live Editing Directly in Your Browser (Recommended ✨)

The portfolio features a built-in **Live Edit Engine**:

1. **Activate Edit Mode:**
   - Click the **"Edit Mode"** button with the pencil icon in the navigation header (or the floating purple pill in the bottom-left corner).
2. **Direct In-Place Editing:**
   - Any text with a purple dashed outline is directly editable (`contenteditable`). Click anywhere — your name, role, bio, college name, project descriptions, or contact details — and type naturally.
3. **Structured Customizer Panel:**
   - Click **"Open Customizer"** in the bottom floating toolbar to open the full editor modal.
   - **General Tab:** Update full name, hero tagline, location, bio paragraph, and resume link.
   - **Skills Tab:** Adjust sliders (0–100%) for HTML5, CSS3, JavaScript, PHP, MySQL, and Java with live progress bar updates.
   - **Education Tab:** Fill in your specific college/university names, CGPA/percentage, and dates.
   - **Projects Tab:** Update descriptions, tech tags, and repository links.
   - **Contact Tab:** Set your real email address, LinkedIn profile URL, and GitHub handle.
4. **Auto-Save & Export:**
   - Edits are automatically saved to your browser's `localStorage` so changes persist across reloads.
   - Click **"Export HTML"** in the toolbar to download a complete, clean, ready-to-deploy `index.html` containing all your modifications baked directly into the markup!

---

### Method 2: Manual Code Customization

You can also edit the source code directly in any code editor (VS Code, Sublime, etc.):

1. **Email Address:**
   - Pre-configured to `gokulkeerthana230@gmail.com`.
   - Update in `index.html` or through the in-browser **Customizer Modal > Contact** tab.

2. **LinkedIn & GitHub Profiles:**
   - Pre-configured to `https://linkedin.com/in/keerthana-ravikumar` (Keerthana Ravikumar) and `https://github.com/gokulkeerthana230-rgb`.

3. **College / Institution Name:**
   - Under the `#education` section in `index.html`, replace `[Your College / University Name, Tamil Nadu, India]` with your institution's name.

4. **Profile Photo:**
   - Place your portrait image (e.g. `keerthana.jpg`) in `assets/images/`.
   - In `index.html`, update the `src` attribute on the profile image:
     ```html
     <img src="assets/images/keerthana.jpg" alt="Keerthana - Full Stack Developer" ... />
     ```

5. **Resume Link:**
   - Place your resume (e.g. `Keerthana_Resume.pdf`) in the root or `assets/` folder.
   - In `index.html`, update the `href` on the "Download Resume" button to point to `assets/Keerthana_Resume.pdf`.

---

## 🚀 Deployment Guide

### Deploying to GitHub Pages
1. Push this project to a new repository on GitHub (e.g. `keerthana-portfolio`).
2. Go to **Settings** > **Pages** in your GitHub repository.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
4. In 1–2 minutes, your portfolio will be live at `https://<your-username>.github.io/<repo-name>/`.

### Deploying to Vercel
1. Install Vercel CLI via `npm install -g vercel` or link your GitHub repository on [vercel.com](https://vercel.com).
2. The included [`vercel.json`](file:///c:/task-1-portfolio/vercel.json) automatically handles static routing with no additional configuration required:
   ```bash
   vercel deploy --prod
   ```
3. Your site will instantly be live on a fast global edge network with a free `*.vercel.app` domain.
