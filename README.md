#  CPU Scheduling Simulator

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)


> A sleek, interactive browser-based simulator that runs and compares three classic CPU scheduling algorithms side-by-side in real time — **Round Robin (RR)**, **SJF Non-Preemptive**, and **SJF Preemptive (SRTF)** — complete with animated Gantt charts, per-process metrics, and an intelligent comparison summary.

---

##  Features

- **Three Algorithms, One Run** — Executes RR, SJF Non-Preemptive, and SRTF simultaneously and presents all results in parallel for direct comparison.
- **Interactive Process Builder** — Add custom processes with individual Arrival Time (AT) and Burst Time (BT) values, with full validation and duplicate-ID detection.
- **Configurable Time Quantum** — Adjust the Round Robin quantum on the fly before each simulation run.
- **Visual Gantt Charts** — Proportionally scaled execution timelines for each algorithm, color-coded per process with precise time markers.
- **Per-Process Metrics Table** — Side-by-side Waiting Time (WT), Turnaround Time (TAT), and Response Time (RT) for every process across all three algorithms, including averages.
- **Smart Comparison Summary** — Automatically identifies the winner for each metric category and generates a natural-language conclusion with a final recommendation.
- **Quick-Load Scenarios** — Four built-in test scenarios (Scenario A–D) for instant experimentation without manual data entry.
- **Keyboard Navigation** — Tab-free `Enter` key progression through input fields for fast process entry.
- **Zero Dependencies** — Pure vanilla HTML, CSS, and JavaScript; no frameworks, no build tools, no installation required.

---

##  Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure and UI layout |
| **CSS3** | Custom dark theme, animations, responsive grid |
| **Vanilla JavaScript (ES6+)** | Scheduling algorithm logic, DOM rendering |
| **JetBrains Mono** | Monospace font for code/terminal aesthetic |
| **Space Grotesk** | Primary sans-serif UI font |
| **Orbitron** | Display / header accent font |
| **Google Fonts CDN** | Remote font delivery |

---

##  Project Structure

```
simulator/
├── index.html        # App shell, layout, sidebar controls, and script/style links
├── simulator.css     # Full styling: dark theme variables, layout grid, Gantt chart,
│                     # metrics table, comparison cards, animations
└── simulator.js      # All application logic:
                      #   - Process management (add / remove / validate)
                      #   - RR, SJF Non-Preemptive, and SRTF algorithm implementations
                      #   - Gantt chart renderer
                      #   - Metrics table builder
                      #   - Comparison summary generator
                      #   - Built-in scenario loader
                      #   - Keyboard event handling
```

---

##  Installation

No installation or build step is required. The simulator runs entirely in the browser.

**Option 1 — Open directly:**

```bash
# Clone or download the repository
git clone https://github.com/your-username/cpu-scheduling-simulator.git

# Navigate into the project folder
cd cpu-scheduling-simulator/simulator

# Open in your default browser (macOS)
open index.html

# Open in your default browser (Linux)
xdg-open index.html

# Open in your default browser (Windows)
start index.html
```

**Option 2 — Serve locally (recommended for best font loading):**

```bash
# Using Python 3
cd simulator
python3 -m http.server 8080
# Then visit: http://localhost:8080
```

```bash
# Using Node.js (npx)
npx serve simulator
# Then visit the URL shown in your terminal
```

>  An active internet connection is required on first load for Google Fonts to render correctly. The simulator logic itself works fully offline.

---

##  Usage

### Basic Workflow

1. **Set the Time Quantum** — Enter a positive integer in the *Time Quantum (RR)* field in the sidebar (default: `2`).
2. **Add Processes** — Fill in a unique PID (e.g. `P1`), Arrival Time, and Burst Time, then click **＋ Add Process** or press `Enter`.
3. **Run the Simulation** — Click **▶ RUN SIMULATION** (requires at least 2 processes).
4. **Analyse Results** — Three sections appear on the right panel:
   -  **Gantt Charts** — Visual execution timelines for all three algorithms.
   -  **Per-Process Metrics** — WT, TAT, and RT for each process and algorithm.
   -  **Comparison Summary** — Metric winners, algorithm traits, and a final recommendation.
5. **Reset** — Click **↺ RESET ALL** to clear everything and start over.

### Quick-Load Scenarios

| Button | Description |
|---|---|
| **Scenario A** | Balanced general-purpose workload (5 processes, mixed burst times) |
| **Scenario B** | Short-job-heavy workload — highlights SJF advantage |
| **Scenario C** | Fairness test — one long job mixed with short arrivals |
| **Scenario D** | Long-job dominance — exposes starvation risk in SJF |

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` (in PID / AT field) | Move focus to the next input field |
| `Enter` (in BT field) | Submit and add the process |

---

##  Algorithms

###  Round Robin (RR)
Processes are served in FIFO order; each receives a fixed CPU slice equal to the **Time Quantum**. If a process does not finish within its quantum, it re-enters the back of the ready queue. Prevents starvation and ensures fair CPU sharing.

###  SJF Non-Preemptive
At each scheduling decision point, the process with the **shortest burst time** among all arrived processes is selected and runs to completion without interruption. Optimal for minimising average waiting time when all jobs arrive simultaneously, but risks starvation for long processes.

###  SJF Preemptive — SRTF (Shortest Remaining Time First)
The running process is preempted whenever a newly arrived process has a **shorter remaining burst time**. Theoretically optimal for minimising average waiting time and turnaround time, at the cost of frequent context switches.

---

##  Metrics Explained

| Metric | Formula | Meaning |
|---|---|---|
| **Waiting Time (WT)** | TAT − BT | Time spent in the ready queue |
| **Turnaround Time (TAT)** | Finish Time − Arrival Time | Total time from submission to completion |
| **Response Time (RT)** | First CPU Time − Arrival Time | Time until the process first gets the CPU |

---

##  Responsive Design

The simulator is designed for **desktop and large-tablet viewports**:

- Sticky header with clamp-based responsive typography scales gracefully from ~768 px upward.
- The sidebar/main split uses CSS Grid with a fixed `330px` sidebar and a fluid content pane.
- Gantt chart blocks use percentage-based widths and wrap cleanly within their container.
- Internal table scrolling (`overflow-x: auto`) ensures the metrics table remains accessible on narrower screens without breaking layout.

>  A fully mobile-optimised layout is planned for a future release (see [Future Improvements](#-future-improvements)).

---

##  Future Improvements

- [ ] **Mobile-First Responsive Layout** — Redesign the sidebar/main split for small screens.
- [ ] **Additional Algorithms** — FCFS, Priority Scheduling, Multilevel Queue, and Multilevel Feedback Queue.
- [ ] **Animated Step-Through Mode** — Replay the simulation step by step with timeline scrubbing.
- [ ] **Export / Share** — Download results as PNG, PDF, or a shareable URL with encoded process data.
- [ ] **Dark / Light Theme Toggle** — Optional light mode for accessibility.
- [ ] **Process Import** — Paste or upload a CSV of processes for bulk entry.
- [ ] **CPU Utilisation & Throughput Metrics** — Extend the comparison summary with additional OS metrics.
- [ ] **Starvation Detection** — Visually highlight processes at risk of indefinite starvation in SJF modes.
