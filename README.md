# Purrito - A Food Ordering and Donation Platform

## Project Repositories
- **Backend Hub**: [Purrito-backend](https://github.com/helloaiki/Purrito-backend) (Current)
- **Frontend Hub**: [Purrito-frontend](https://github.com/helloaiki/Purrito-frontend)

## Project Structure

```text
Purrito-backend/
├── src/
│   ├── middleware/          # Express middlewares (auth, etc.)
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic and external services
│   ├── socket/              # WebSocket logic (chat, etc.)
│   ├── utils/               # Utilities (Cloudinary, admin creation)
│   ├── db.js                # Database connection and pool setup
│   └── server.js            # Main entry point and server configuration
├── Purrito_Schema.sql       # Database schema
├── TestData.sql             # SQL script for test data
├── tableInstances.sql       # Core data instances SQL
├── .env                     # Environment variables configuration
└── package.json             # Project dependencies and scripts
```

It is a full-stack application for ordering food and managing restaurants, drivers, and local organizations. This README guides you to set up and run the project locally.

---

## Prerequisites

1. Download Redis-x64-5.0.14.1.zip from GitHub via the link https://github.com/tporadowski/redis/releases
2. After extracting folder to any location, navigate to that location via command prompt and run the command redis-server.exe. Step 2 should guarantee that the Redis server is running

```bash
redis-server.exe
```

3. For backend and frontend folders, the environment variables should be set up.
   * Some variables are already provided as they are being hosted on outer sites

### Environment Variables

#### Backend .env file

```bash
MYSECRETKEY=
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=
ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
DB_PORT=3306
DB_HOST='localhost'
DB_USER='root'
DB_PASSWORD=
DB_NAME='purrito'
EMAIL_USER=
EMAIL_PASS=
```

* To generate email app password, first you have to turn on 2-step verification in your gmail account. Then going to the following link you can generate an app password:

```bash
https://myaccount.google.com/apppasswords
```

Then add the email address and generated app password in the EMAIL_USER and EMAIL_PASS field of the .env file respectively.

#### Frontend .env file

```bash
VITE_API_URL=http://localhost:5003
VITE_WS_URL=ws://localhost:8008
```

4. The required node modules should be downloaded

```bash
npm install
```

5. The backend folder can be started via the command npm run dev

```bash
npm run dev
```

6. After starting the backend server, frontend can be run via the command npm run dev

```bash
npm run dev
```

7. Open the browser at:

```bash
http://localhost:5173/
```

**Important:** Make sure the Redis is running before starting the backend server.

Following these steps can start the website on **localhost**.

---

## Instructions for the Types of Accounts

1. **Customer**
   - Need to use a real mail account which needs to be verified via the mail that will be sent to that account
2. **Restaurant**
   - Can use a dummy account but the admin needs to verify the restaurant before it can access the site
3. **Driver**
   - Can use a dummy account but admin needs to verify the driver before it can access the site
4. **Local organization**
   - Can use a dummy account but admin needs to verify the driver before it can access the site
5.Admin
   - Need to use the admin credentials to login which is added in the .env file of the backend folder

---

## Database Setup & Initialization

To initialize the database with all necessary tables and seed data (users, restaurants, drivers, etc.), follow these steps:

1. Create a MySQL database named `purrito`.
2. Import the following SQL script to set up the core data instances:

```bash
Purrito-backend/tableInstances.sql
```

## Instructions for Test Data

For additional test scenarios, you can load the specific test data script:

```bash
Purrito-backend/TestData.sql
```

This data ensures:
 - 1 customer
 - 1 restaurant 
 - 1 driver 
 - 1 local organization

---

## Login Details

| Account Type       | Email                                 |  Password   |
| ------------------ | ------------------------------------- | :---------: |
| User               | [abc@gmail.com](mailto:abc@gmail.com) |  12345678   |
| Restaurant         | [wb@gmail.com](mailto:wb@gmail.com)   |  12345678   |
| Driver             | [jr@gmail.com](mailto:jr@gmail.com)   |  12345678   |
| Local Organization | [def@gmail.com](mailto:def@gmail.com) |  12345678   |
| Admin              | [admin@gmail.com](mailto:admin@gmail.com) |  admin123   |

---

## Notes
   - Start Redis before running the backend
   - Backend must run before frontend
   - Admin must verify restaurant, driver and organization accounts
   - Customers must verify their email before login
