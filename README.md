# Rift: Graph-Based Financial Crime Detection Engine

Rift is a high-performance, full-stack analytical engine designed to detect sophisticated financial crime patterns such as **Money Muling**, **Smurfing**, and **Shell Networks**. By leveraging graph-based algorithms and behavioral analysis, Rift identifies structural anomalies in transaction data that traditional rule-based systems often overlook.

Built for the **Rift Hackathon**.

---

## 🏗 System Overview

Rift transforms raw transaction data into a directed graph, enabling real-time detection of complex laundering topologies.

### Core Components
- **Backend**: Express.js server providing a robust API for graph processing, pattern detection, and data ingestion.
- **Frontend**: A premium React dashboard featuring interactive graph visualizations (Cytoscape.js), real-time analytics, and fraud summaries.

---

## 🧠 Key Detection Algorithms

Our engine utilizes specific graph traversal and state-processing techniques to identify malicious patterns:

| Pattern | Detection Logic | Complexity |
| :--- | :--- | :--- |
| **Cycle Detection** | Depth-Limited DFS (Max depth 5) to find money loops. | $O(V + E)$ |
| **Smurfing** | Sliding window analysis on fan-in/fan-out transaction sets. | $O(N \log N)$ |
| **Shell Networks** | Recursive DFS identifying layered chains with "quiet" bridges. | $O(V)$ |

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, Cytoscape.js, Axios
- **Backend**: Node.js, Express, CSV-Parser, Multer (for CSV ingestion)
- **Data**: In-memory optimized graph structures for sub-second analysis.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Rift
   ```

2. **Setup Backend**:
   ```bash
   cd money-muling-engine/backend
   npm install
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### Quick Start
Once both servers are running, navigate to `http://localhost:5173` in your browser. Upload one of the provided sample datasets to see the engine in action:
- `cycle.csv`: Demonstrates loop detection.
- `dataset2.csv`: Contains complex laundering patterns.

---

## 📂 Project Structure

```text
Rift/
├── money-muling-engine/     # Core application suite
│   ├── backend/             # Node.js API & Graph Engine
│   └── frontend/            # React analytical dashboard
├── cycle.csv                # Sample data for testing cycles
└── dataset2.csv             # Larger sample dataset
```

---

## ⚖️ Suspicion Scoring Methodology

Accounts are assigned a normalized suspicion score (0-100) based on weighted heuristics:
- **Cycle Participation**: +40
- **Shell Network Link**: +30
- **Smurfing Behavior**: +25
- **High Velocity (5+ tx/24h)**: +10
- **Short Lifetime (<3 days)**: +5
- **False Positive Mitigation**: -20 (Long-term consistent activity)

---

## 👥 Contributors
Developed for the Rift Hackathon.
