# Backend Configuration

Create a `.env` file in the backend directory with the following content:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/leave-management-system
JWT_SECRET=your_super_secret_jwt_key_here_please_change_in_production
NODE_ENV=development
```

## Important Notes:

1. **MongoDB**: Make sure MongoDB is running on your system
2. **JWT_SECRET**: Change this to a secure random string in production
3. **PORT**: Backend runs on port 5001, frontend on port 3000

## Quick Start:

1. Start MongoDB service
2. Run `npm run dev` in backend directory
3. Run `npm start` in frontend directory
4. Visit http://localhost:3000

## Default Admin Account:

You can register a new HR admin account by:

1. Going to http://localhost:3000/register
2. Setting role to "HR Admin"
3. Using the credentials to login at http://localhost:3000/admin/login
