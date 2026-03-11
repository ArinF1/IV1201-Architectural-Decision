# KTH IV1201 Recruitment Application

## Introduction
This is a robust and scalable web-based recruitment tool built for an amusement park to facilitate their seasonal hiring process. The system supports two primary user roles: Applicants, who register and submit competence profiles and availability, and Recruiters, who list and manage applications.

## Tech Stack
The application is built using a modern, decoupled stack to ensure scalability and ease of maintenance:

- **Frontend**: React (Client-Side Rendering) with Vite and Tailwind CSS.
- **Backend**: Node.js and Express.
- **Database**: PostgreSQL managed via the Sequelize ORM.
- **Security**: JWT-based authentication with hashed passwords stored in the database.

## Architecture
This project strictly follows the 4-Layer Architecture to ensure low coupling and high cohesion:

- **View Layer (Frontend)**: React components and client-side logic located in `frontend/src/`.
- **Controller Layer (API)**: Express routes and request handlers located in `backend/src/view/routes/` and `backend/src/controllers/`.
- **Model Layer (Business Logic)**: Domain logic, services, and DTOs located in `backend/src/model/`.
- **Integration Layer (Data Access)**: Sequelize models and repository patterns located in `backend/src/integration/`.

## Getting Started

### Prerequisites
- Node.js version >= 18.0.0.
- A running PostgreSQL instance.

### Installation
Install dependencies for both frontend and backend using the root helper scripts:

```bash
npm run install:backend
npm run install:frontend
```

### Running Locally
**Backend**: Start the development server with hot-reloading:

```bash
cd backend && npm run dev
```

**Frontend**: Start the Vite development server:

```bash
cd frontend && npm run dev
```

### Database Initialization using Docker
To start the database container and then initialize it with the existing schema and data, run the following commands from the root directory:

1. Start the database in detached mode:
   ```bash
   docker compose up -d
   ```
2. Feed the expected schema into the created container (ensure you are pointing to the sql file correctly):
   ```bash
   docker exec -i iv1201-architectural-decision-db-1 psql -U iv1201 -d iv1201db < backend/db/init/existing-database.sql
   ```
3. To access the interactive Postgres shell inside the container:
   ```bash
   docker exec -it iv1201-architectural-decision-db-1 psql -U iv1201 -d iv1201db
   ```

## Architectural Decision Log (ADL)
 A detailed log of all architectural decisions is maintained as an appendix to the final report. This log justifies choices such as using Client-Side Rendering (CSR) for better mobile-readiness and a RESTful API for decoupling.

## Deployment
The application is configured for deployment on cloud platforms we used - Heroku. The root `package.json` includes a `heroku-postbuild` script to automate the installation and build process for the cloud environment.

## Project Structure
IV1201-Architectural-Decision/
├── backend/                       # Express.js REST API
│   ├── db/
│   │   ├── migrate-hash-passwords.js  # Password migration script
│   │   └── init/                  # Database init scripts
│   ├── src/
│   │   ├── controllers/           # API handlers/Controllers
│   │   ├── errors/                # Custom error classes
│   │   ├── integration/
│   │   │   ├── persistence/       # Sequelize config and table models
│   │   │   └── repositories/      # Data access objects (DAOs)
│   │   ├── middleware/            # Application middlewares
│   │   ├── model/
│   │   │   ├── dto/               # Data transfer objects
│   │   │   └── service/           # Business logic/Services
│   │   ├── view/routes/           # API Routing Configuration
│   │   ├── app.js                 # App configuration
│   │   └── server.js              # Entry point
│   ├── jest.config.js
│   ├── .env.example               # Example variables
│   └── package.json
├── frontend/                      # React SPA
│   ├── public/                    # Static assets (manifest, service worker)
│   ├── src/
│   │   ├── components/            # UI components and Route Guards
│   │   ├── context/               # Global states (AuthContext)
│   │   ├── pages/                 # Full page components
│   │   ├── services/              # External API integrations
│   │   ├── i18n.js                # Translations
│   │   ├── index.css
│   │   ├── main.jsx               # React DOM entry
│   │   └── App.jsx                # Main Layout and Routes
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js             # Vite development tools
├── testing/                       # Automated tests
│   ├── applicationRepo.test.js    # Jest: repository layer tests
│   ├── applicationService.test.js # Jest: service layer tests
│   ├── errorHandler.test.js       # Jest: error handler tests
│   ├── test.js                    # Selenium cross-browser acceptance tests
│   ├── userController.test.js     # Jest: controller tests
│   └── package.json
├── docker-compose.yml             # Postgres Database Docker set up
├── Procfile                       # Heroku process definitions
├── package.json
└── README.md                      # Documentation
