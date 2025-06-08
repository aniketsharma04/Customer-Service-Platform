
# 🧠 TensorGo Customer Service Platform

A user-friendly customer support platform that enables users to log in via Google, submit categorized queries or feedback, and chat with support agents instantly through Intercom Messenger. This application ensures transparency, keeps track of past queries, and makes support interaction seamless and intuitive.

---

🙁Uable To Host : Tries to host on Render but due to deployment delays and caching issues on the Render platform, I was unable to host the website within the 24-hour assignment window.

---

## ✨ Features

- 🔐 Google OAuth Login for easy authentication
- 📝 Categorized Query/Feedback Submission
- 💬 Real-Time Chat Support with Intercom Messenger
- 🧾 View Previous Queries for transparency
- 🎯 User-specific Intercom conversations
- 🌐 Responsive UI built using Tailwind CSS

---

## 📦 Tech Stack

| Technology   | Usage                                  |
|--------------|-----------------------------------------|
| React.js     | Frontend Framework                      |
| Node.js      | Backend Runtime                         |
| Express.js   | Backend Server                          |
| MongoDB      | Database for storing user queries       |
| Passport.js  | OAuth with Google                       |
| Intercom     | Live chat and customer communication    |
| Tailwind CSS | Styling and responsiveness              |

---


## ⚙️ Getting Started

### 🛠 Backend Setup

1. Navigate to the backend folder:
   bash
   cd backend
 

2. Create a `.env` file with the following content:
   env
   PORT=8080
   MONGO_URI=mongodb://localhost:27017/tensorgo
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
   INTERCOM_ACCESS_TOKEN=your_intercom_access_token
   FRONTEND_URL=http://localhost:3000
   SESSION_SECRET=your_secret_key
 

3. Install dependencies and run the server:
   bash
   npm install
   node index.js
  

---

### 🌐 Frontend Setup

1. Navigate to the frontend folder:
   bash
   cd frontend
   

2. Create a `.env` file with the backend URL:
   env
   REACT_APP_BACKEND_URL=http://localhost:8080


3. Install dependencies and run the app:
   bash
   npm install
   npm start

---

## 🧪 Features Walkthrough

- Login via Google  
  The user is authenticated using Google OAuth and redirected to the dashboard.

- Submit Queries/Feedback  
  Users can submit categorized queries with a clear message.

- Messenger Integration  
  Intercom Messenger is available only on the dashboard. Past conversations and real-time replies are visible.

- History View  
  All previous queries by the user are listed with status and timestamps.

---

Make sure to:

- Set all environment variables in both frontend and backend
- Allow your production domain in Intercom app settings

---

## 🧑‍💻 Author

Aniket Sharma  
B.Tech ECE, IIIT Nagpur  
Contact: aniketsharma.ani04@gmail.com

---

## 📄 License

This project is open-sourced under the MIT License.
