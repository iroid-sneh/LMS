# Leave Management System - Complete MERN Stack

A comprehensive leave management system built with React website frontend and Node.js/Express backend with MongoDB. This is a complete solution for office employees to manage leave requests with HR admin approval workflow.

## Features

### Employee Features

-   **User Registration & Login**: Employees can register and login to the system
-   **Apply for Leave**: Submit leave requests with detailed information
-   **View Leave History**: See all past and current leave applications
-   **Dashboard**: View personal statistics and today's office leave status
-   **Profile Management**: View personal information and employment details

### HR Admin Features

-   **Admin Login**: HR personnel can login with admin privileges
-   **Manage Leave Requests**: View all employee leave requests
-   **Approve/Reject Leaves**: Approve or reject leave requests with comments
-   **Employee Overview**: See all employees and their leave statistics
-   **Today's Leave Status**: View which employees are on leave today

### System Features

-   **Real-time Status Updates**: Leave status changes are reflected immediately
-   **Responsive Design**: Works on desktop and mobile devices
-   **Secure Authentication**: JWT-based authentication system
-   **Data Validation**: Comprehensive form validation on both frontend and backend
-   **Clean UI**: Simple, professional design without unnecessary complexity

## Tech Stack

### Backend

-   **Node.js** - Runtime environment
-   **Express.js** - Web framework
-   **MongoDB** - Database
-   **Mongoose** - ODM for MongoDB
-   **JWT** - Authentication
-   **bcryptjs** - Password hashing
-   **CORS** - Cross-origin resource sharing

### Frontend

-   **React 18** - Frontend framework (via CDN)
-   **React Router DOM** - Client-side routing
-   **Axios** - HTTP client for API calls
-   **Font Awesome** - Icons
-   **Custom CSS3** - Modern responsive styling
-   **Express** - Static file serving

## Installation & Setup

### Prerequisites

-   Node.js (v14 or higher)
-   MongoDB (local or cloud instance)
-   npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd "MERN LMS/backend"
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup (React Website)

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend server:

```bash
npm start
```

The React website will run on `http://localhost:3000`

**Note**: This is a React website (not React app) that can be deployed as a static site to any hosting service.

## Usage

### For Employees

1. **Register**: Create an account with your employee details
2. **Login**: Access your dashboard
3. **Apply Leave**: Click "Apply for Leave" to submit a new request
4. **View Status**: Check "My Leaves" to see the status of your applications
5. **Dashboard**: View your leave statistics and see who's on leave today

### For HR Admins

1. **Register as HR**: Create an account with role set to "HR Admin"
2. **Login**: Access the admin dashboard
3. **Review Requests**: See all pending leave requests
4. **Approve/Reject**: Click approve or reject with optional comments
5. **Monitor**: View overall statistics and today's leave status

## API Endpoints

### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - Login user
-   `GET /api/auth/me` - Get current user

### Leaves

-   `POST /api/leaves` - Apply for leave
-   `GET /api/leaves/my-leaves` - Get user's leaves
-   `GET /api/leaves/all` - Get all leaves (HR only)
-   `GET /api/leaves/today` - Get today's leaves
-   `PUT /api/leaves/:id/approve` - Approve leave (HR only)
-   `PUT /api/leaves/:id/reject` - Reject leave (HR only)

### Users

-   `GET /api/users/employees` - Get all employees (HR only)
-   `GET /api/users/stats` - Get user statistics
-   `GET /api/users/admin-stats` - Get admin statistics (HR only)

## Database Schema

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (employee/hr),
  department: String,
  position: String,
  employeeId: String (unique),
  phone: String,
  joiningDate: Date
}
```

### Leave Model

```javascript
{
  employee: ObjectId (ref: User),
  leaveType: String (sick/vacation/personal/emergency/other),
  startDate: Date,
  endDate: Date,
  duration: Number,
  durationUnit: String (hours/days),
  reason: String,
  status: String (pending/approved/rejected),
  adminComment: String,
  rejectedReason: String,
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  appliedAt: Date
}
```

## Project Structure

```
MERN LMS/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Leave.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leaves.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # All CSS styles
│   ├── js/
│   │   └── app.js         # React application
│   ├── server.js          # Frontend server
│   ├── package.json       # Frontend dependencies
│   └── README.md          # Frontend documentation
└── README.md
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/leave-management-system
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

## Security Features

-   Password hashing with bcryptjs
-   JWT token-based authentication
-   Protected routes for admin functions
-   Input validation and sanitization
-   CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.
