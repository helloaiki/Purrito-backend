The steps for setup/run:
1.Download Redis-x64-5.0.14.1.zip from GitHub via the link https://github.com/tporadowski/redis/releases
2.After extracting folder to any location, navigate to that location via command prompt and run the command redis-server.exe. Step 2 should guarantee that the Redis server is running
3.For backend and frontend folders, the environment variables should be set up.
--Some variables are already provided as they are being hosted on outer sites

--FOR BACKEND : 
MYSECRETKEY="This is a secret key"
PORT=5003
MYPASSWORD=
CLOUDINARY_CLOUD_NAME=dxcjk9qhl
CLOUDINARY_API_KEY=283198248637169
CLOUDINARY_API_SECRET=RvJACbyuAnjDIYrgjPxhCiSVy5M
DB_host='localhost'
DB_USER='root'
DB_PASS=
DB_NAME='purrito'
EMAIL_USER='purrito.food@gmail.com'
EMAIL_PASS='yvergqexrlbvjcdf'

--FOR FRONTEND
VITE_API_URL=http://localhost:5003
VITE_WS_URL=ws://localhost:8008


4. The required node modules should be downloaded
5. The backend folder can be started via the command npm run dev
6. After starting the backend server, frontend can be run via the command npm run dev

-----
Following these steps can start the website on localhost

-----
INSTRUCTIONS FOR THE TYPES OF ACCOUNTS
-----
1. Customer
--Need to use a real mail account which needs to be verified via the mail that will be sent to that account
2. Restaurant
--Can use a dummy account but the admin needs to verify the restaurant before it can access the site
3. Driver
--Can use a dummy account but admin needs to verify the driver before it can access the site
4.Local organization
--Can use a dummy account but admin needs to verify the driver before it can access the site
5.Admin
--Write something here


-----
INSTRUCTIONS FOR TEST DATA
-----
Data for testing can be found in the file 2305051_2305053/Purrito/TestData.sql 
This data ensures:
-1 customer
-1 restaurant 
-1 driver 
-1 local organization

-----
LOGIN DETAILS
-----
1.Restaurant:
Email:wb@gmail.com
Password:12345678
2.Driver:
Email:jr@gmail.com
Password:12345678