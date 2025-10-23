# Value Aim Backend API

Backend server for Value Aim Integration Application with MySQL database using Sequelize ORM.

## Features

- User Authentication (Email/Password & OAuth)
- Company Details Management
- Service Details Management
- User Profile Management
- JWT-based Authorization
- MySQL Database with Sequelize ORM

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Set up MySQL database:
   - Install MySQL Server
   - Create database: `CREATE DATABASE value_aim_db;`
   - See [MYSQL_SETUP_GUIDE.md](../MYSQL_SETUP_GUIDE.md) for detailed instructions

5. Update `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=value_aim_db

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d
```

6. Make sure MySQL is running:
```bash
# For macOS with Homebrew
brew services start mysql

# For Linux
sudo systemctl start mysql

# For Windows
net start MySQL80
```

7. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000` and automatically create database tables.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/onboarding` - Update onboarding status (Protected)

### Company

- `POST /api/company` - Create/Update company details (Protected)
- `GET /api/company` - Get company details (Protected)
- `DELETE /api/company` - Delete company details (Protected)

### Services

- `POST /api/service` - Create service (Protected)
- `GET /api/service` - Get all services (Protected)
- `GET /api/service/:id` - Get single service (Protected)
- `PUT /api/service/:id` - Update service (Protected)
- `DELETE /api/service/:id` - Delete service (Protected)
- `POST /api/service/bulk` - Bulk create/update services (Protected)

### User

- `GET /api/user/profile` - Get user profile (Protected)
- `PUT /api/user/profile` - Update user profile (Protected)
- `PUT /api/user/password` - Change password (Protected)
- `PUT /api/user/plan` - Update user plan (Protected)

## Project Structure

```
backend/
├── config/           # Configuration files
│   └── db.js        # Database connection
├── controllers/     # Request handlers
│   ├── authController.js
│   ├── companyController.js
│   ├── serviceController.js
│   └── userController.js
├── middleware/      # Custom middleware
│   └── auth.js      # Authentication middleware
├── models/          # Database models
│   ├── User.js
│   ├── Company.js
│   └── Service.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── companyRoutes.js
│   ├── serviceRoutes.js
│   └── userRoutes.js
├── .env.example     # Environment variables template
├── .gitignore       # Git ignore rules
├── package.json     # Dependencies
├── README.md        # Documentation
└── server.js        # Entry point
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Success Responses

All successful responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

## Development

Run in development mode with auto-restart:
```bash
npm run dev
```

Run in production mode:
```bash
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MYSQL_HOST | MySQL host | localhost |
| MYSQL_PORT | MySQL port | 3306 |
| MYSQL_USER | MySQL username | root |
| MYSQL_PASSWORD | MySQL password | - |
| MYSQL_DATABASE | MySQL database name | value_aim_db |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## Database Schema

The application uses MySQL with the following tables:

### Users Table
- User authentication and profile information
- OAuth provider details (Google, Microsoft, Apple)
- Onboarding status tracking

### Companies Table
- Company profile and business details
- Industry and location information
- Website and employee count

### Services Table
- Service configuration and preferences
- Target markets and segments
- JSON fields for flexible data storage

## OAuth Integration

The backend supports OAuth authentication with:
- **Google** - Full profile data with picture
- **Microsoft** - Profile data via Microsoft Graph API  
- **Apple** - Profile data with privacy features

All OAuth providers work with the username prompt feature for consistent user experience.

# value_aim_backend
