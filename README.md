# Chen Pilot  
### AI Agent for Cross-Chain DeFi Operations

**Chen Pilot** is an intelligent AI agent that enables seamless interaction with multiple blockchain networks and DeFi protocols using natural language commands. It provides a unified interface for managing Bitcoin wallets, Stellar operations, cross-chain swaps, and DeFi lending and borrowing activities.

---

## 🚀 Features

- Natural language interaction with blockchain networks  
- Bitcoin wallet management  
- Stellar blockchain operations  
- Cross-chain asset swaps  
- DeFi lending and borrowing automation  
- Intelligent workflow planning and execution  
- Unified state management and structured feedback  

---

## 📋 Prerequisites

Ensure you have the following installed and configured:

- **Node.js** version 18 or higher  
- **PostgreSQL** database  
- Environment variables properly configured (see Configuration section)  

---

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd chenpilot-experimental
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials, API keys, and other required settings.

### 4. Set up the database

```bash
npm run migration:run
```

### 5. Start the development server

```bash
npm run dev
```

---

## 🧠 Workflow System

Chen Pilot uses an intelligent workflow system designed to handle complex DeFi operations efficiently:

1. **Parses Intent** – Understands user intent from natural language commands
2. **Plans Workflow** – Creates step-by-step execution plans
3. **Executes Tools** – Runs the appropriate tools in sequence
4. **Manages State** – Tracks operation status and results
5. **Provides Feedback** – Returns structured, user-friendly responses

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new feature branch
3. Make your changes
4. Add tests where applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🆘 Support

If you need help or have questions:

* Create an issue in the repository
* Check the API health endpoints
* Review application logs for error details


