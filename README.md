# SafeDrop - Secure File Sharing Application

SafeDrop is a secure file sharing web application built with React.js and Node.js that enables users to upload, share, and manage files with advanced security features and real-time file tracking.

👉 [Click to watch demo video](https://drive.google.com/file/d/1Kl7j9m4vgL4PrADAZv96VflKsa6qx3Sp/view?usp=sharing)

## Key Features

- **User Authentication**
  - Secure signup and login system
  - JWT-based authentication
  - Protected routes and authorized access

- **File Management**
  - Drag and drop file upload
  - Password protection for sensitive files
  - File expiry settings
  - Download tracking and statistics
  - Secure file sharing via unique links
  - File status tracking (active/inactive)

- **Dashboard Features**
  - Comprehensive file overview
  - Download count tracking
  - File protection status indicators
  - File expiry information
  - Quick action buttons (download, share, delete)
  - Real-time status updates

- **User Profile**
  - Profile image management
  - User information updates
  - Activity statistics
  - Real-time data synchronization

## Prerequisites

- Node.js (v14 or higher)
- MySQL 8.4 or higher
- Web browser (Chrome, Firefox, Edge recommended)

## Setup Instructions

### 1. Database Setup

The application includes automatic database creation:
1. Ensure MySQL is running on your system
2. The database will be created automatically on first run
3. Default database name is 'safedrop'

### 2. Environment Configuration

Create a `.env` file in the server directory with the following variables:

```env
PORT=6600
DB_NAME=safedrop
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:6600
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d
```

### 3. Installation

#### Server Setup:
```bash
cd server
npm install
```

#### Client Setup:
```bash
cd client
npm install
```

### 4. Running the Application

#### Development Mode:

Server:
```bash
cd server
npm start
```

Client:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:6600

## Usage Guide

### User Authentication
1. Create a new account via the signup page
2. Login with your credentials
3. Your session will remain active for 7 days

### File Management
1. Upload files via drag & drop or file selector
2. Optional: Set password protection for sensitive files
3. Optional: Configure file expiry time
4. Share files using the generated unique links
5. Monitor file status and download counts in the dashboard

### Profile Management
1. Access profile settings from the dashboard
2. Update profile information and image
3. View your upload and download statistics
4. All changes sync automatically without requiring re-login

## Troubleshooting

### Common Issues and Solutions

1. **Database Connection Issues**
   - Verify MySQL is running
   - Check database credentials in .env file
   - Ensure the database exists and has correct permissions

2. **File Upload Problems**
   - Verify the uploads directory exists in server/uploads
   - Check directory permissions
   - Ensure file size is within limits

3. **Authentication Issues**
   - Clear browser cache and cookies
   - Check if JWT token is present
   - Verify server is running and accessible

4. **Profile Update Issues**
   - Ensure image file format is supported (JPG, PNG)
   - Check network connectivity
   - Verify file size limits

## Technology Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- Axios for API requests

### Backend
- Node.js
- Express.js
- MySQL with Sequelize ORM
- JWT for authentication
- Multer for file handling

## Security Features

- JWT-based authentication
- Password hashing
- Protected file routes
- Secure file sharing links
- File access control
- Session management

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
