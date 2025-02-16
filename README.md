# Browser Agent Scheduler

Schedule automated browser tasks with AI. A powerful tool that lets you automate web interactions using natural language.

## Features

- 🤖 Natural Language Task Creation
- 📅 Task Scheduling
- 🌐 Browser Automation
- 🌙 Dark/Light Mode Support
- 📱 Responsive Design
- 🔒 Secure API Key Management

## Local Setup

### Requirements

Python 3.8 or higher, uv package manager (`pip install uv`), Node.js 18 or higher, pnpm package manager, Git

### Installation Steps

1. Clone the Repository
```bash
git clone https://github.com/DamianCapdevila/agente.git
```

2. Start the Backend
```bash
cd agente/agente-back
# Install dependencies using uv
uv pip install -r pyproject.toml
# Run the Flask server
uv run agente.py
```
The backend will start on http://localhost:5000

3. Start the Frontend
```bash
cd agente/agente-front
pnpm install
pnpm dev
```
The frontend will start on http://localhost:3000

## Architecture

The project consists of two main components:

### Frontend
- Built with Next.js 15
- Uses shadcn/ui components
- Implements a responsive and accessible UI
- Features dark/light mode theming
- Stores API keys securely in the browser

### Backend
- Flask-based API
- Implements task scheduling with APScheduler
- Integrates with OpenAI's GPT-4 for task interpretation
- Provides browser automation capabilities using [browser-use](https://github.com/browser-use/browser-use)

## Need Help?

If you encounter any issues running the project, feel free to:
- Connect with me on [LinkedIn](https://linkedin.com/in/damiancapdevila)
- Email me at [contact@damiancapdevila.com](mailto:contact@damiancapdevila.com)

## License

[MIT License](LICENSE)

## Citations

This project uses the Browser Use library:

```bibtex
@software{browser_use2024,
  author = {Müller, Magnus and Žunič, Gregor},
  title = {Browser Use: Enable AI to control your browser},
  year = {2024},
  publisher = {GitHub},
  url = {https://github.com/browser-use/browser-use}
}
```

---
Made by [Damián Capdevila](https://linkedin.com/in/damiancapdevila)
