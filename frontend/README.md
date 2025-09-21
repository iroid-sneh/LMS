# Leave Management System - React Website

A comprehensive leave management system built with React as a website (not React app) and Node.js backend.

## Features

### For Employees

-   ✅ User registration and login
-   ✅ Interactive dashboard with leave statistics
-   ✅ Apply for leave with detailed forms
-   ✅ View all leave requests and their status
-   ✅ Real-time status updates
-   ✅ Today's leave overview

### For HR Admins

-   ✅ Admin login at `/admin/login`
-   ✅ Comprehensive admin dashboard
-   ✅ Review and manage all leave requests
-   ✅ Approve/Reject leave applications with comments
-   ✅ View employee statistics
-   ✅ Today's leave management

## Project Structure

```
frontend/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── js/
│   └── app.js         # React application
├── server.js          # Frontend server
└── package.json       # Frontend dependencies

backend/
├── server.js          # Backend server
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Authentication middleware
└── package.json      # Backend dependencies
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create `.env` file with:

    ```
    MONGODB_URI=mongodb://localhost:27017/leave-management-system
    JWT_SECRET=your_jwt_secret_here
    PORT=5001
    ```

4. Start the backend server:
    ```bash
    npm run dev
    ```

### Frontend Setup

1. Navigate to frontend directory:

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

## Access Points

-   **Main Website**: http://localhost:3000
-   **Employee Login**: http://localhost:3000/login
-   **Employee Registration**: http://localhost:3000/register
-   **HR Admin Login**: http://localhost:3000/admin/login
-   **Backend API**: http://localhost:5001

## User Roles

### Employee

-   Register and login
-   Apply for leave requests
-   View personal leave history
-   Check dashboard statistics

### HR Admin

-   Login at `/admin/login`
-   Review all leave requests
-   Approve/Reject applications
-   Add comments and rejection reasons
-   View comprehensive statistics

## Technology Stack

### Frontend

-   React 18 (via CDN)
-   React Router DOM
-   Axios for API calls
-   Font Awesome icons
-   Custom CSS with modern design

### Backend

-   Node.js
-   Express.js
-   MongoDB with Mongoose
-   JWT Authentication
-   bcryptjs for password hashing

## API Endpoints

### Authentication

-   `POST /api/auth/register` - User registration
-   `POST /api/auth/login` - User login
-   `GET /api/auth/me` - Get current user

### Leave Management

-   `POST /api/leaves` - Apply for leave
-   `GET /api/leaves/my-leaves` - Get user's leaves
-   `GET /api/leaves/all` - Get all leaves (HR only)
-   `GET /api/leaves/today` - Get today's leaves
-   `PUT /api/leaves/:id/approve` - Approve leave (HR only)
-   `PUT /api/leaves/:id/reject` - Reject leave (HR only)

### User Management

-   `GET /api/users/stats` - Get user statistics
-   `GET /api/users/admin-stats` - Get admin statistics (HR only)
-   `GET /api/users/employees` - Get all employees (HR only)

## Deployment

### Frontend Deployment

The frontend is a static website that can be deployed to:

-   Netlify
-   Vercel
-   GitHub Pages
-   Any static hosting service

### Backend Deployment

The backend can be deployed to:

-   Heroku
-   Railway
-   DigitalOcean
-   AWS EC2

## Development

### Adding New Features

1. Update the React components in `js/app.js`
2. Add new API routes in the backend
3. Update the database models if needed
4. Test the integration

### Styling

All styles are in `styles.css`. The design is:

-   Responsive and mobile-friendly
-   Modern with gradients and shadows
-   Uses Font Awesome icons
-   Follows a consistent color scheme

## Security Features

-   JWT token authentication
-   Password hashing with bcrypt
-   Input validation and sanitization
-   Role-based access control
-   CORS protection

## Browser Support

-   Chrome (recommended)
-   Firefox
-   Safari
-   Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
