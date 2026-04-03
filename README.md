# Purrito Project

A full-stack application for ordering food and managing restaurants, drivers, and local organizations. This README guides you to set up and run the project locally.

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
DB_host='localhost'
DB_USER='root'
DB_PASS=
DB_NAME='purrito'
EMAIL_USER=
EMAIL_PASS=
```

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

## Instructions for Test Data

Data for testing can be found in the file 2305051_2305053/Purrito/TestData.sql. Load it into your database:

```bash
2305051_2305053/Purrito/TestData.sql
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
