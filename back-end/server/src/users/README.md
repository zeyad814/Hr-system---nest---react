# Users API Documentation

## Overview
This module provides comprehensive user management functionality for the HR system, including CRUD operations, search, filtering, pagination, and user statistics.

## Endpoints

### 1. Create User
**POST** `/api/users`
- **Description**: Create a new user
- **Roles**: ADMIN, HR
- **Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "ADMIN | HR | MANAGER | EMPLOYEE | APPLICANT",
  "department": "string (optional)",
  "position": "string (optional)"
}
```

### 2. Get All Users
**GET** `/api/users`
- **Description**: Get paginated list of users with optional filtering
- **Roles**: ADMIN, HR
- **Query Parameters**:
  - `search`: Search in name, email, department, position
  - `role`: Filter by user role
  - `status`: Filter by user status (ACTIVE, INACTIVE, SUSPENDED)
  - `department`: Filter by department
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sortBy`: Sort field (default: createdAt)
  - `sortOrder`: Sort order (asc, desc - default: desc)

### 3. Get User Statistics
**GET** `/api/users/stats`
- **Description**: Get comprehensive user statistics
- **Roles**: ADMIN, HR
- **Response**:
```json
{
  "totalUsers": "number",
  "activeUsers": "number",
  "inactiveUsers": "number",
  "suspendedUsers": "number",
  "usersByRole": {
    "ADMIN": "number",
    "HR": "number",
    "MANAGER": "number",
    "EMPLOYEE": "number",
    "APPLICANT": "number"
  },
  "usersByDepartment": [
    {
      "department": "string",
      "count": "number"
    }
  ],
  "recentUsers": "UserResponseDto[]"
}
```

### 4. Get Departments
**GET** `/api/users/departments`
- **Description**: Get list of all departments
- **Roles**: ADMIN, HR
- **Response**: `string[]`

### 5. Get User by ID
**GET** `/api/users/:id`
- **Description**: Get specific user by ID
- **Roles**: ADMIN, HR
- **Response**: `UserResponseDto`

### 6. Update User
**PATCH** `/api/users/:id`
- **Description**: Update user information
- **Roles**: ADMIN, HR
- **Body**:
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "password": "string (optional)",
  "role": "UserRole (optional)",
  "department": "string (optional)",
  "position": "string (optional)",
  "status": "UserStatus (optional)"
}
```

### 7. Update User Status
**PATCH** `/api/users/:id/status`
- **Description**: Update user status (activate/deactivate/suspend)
- **Roles**: ADMIN, HR
- **Body**:
```json
{
  "status": "ACTIVE | INACTIVE | SUSPENDED"
}
```

### 8. Delete User
**DELETE** `/api/users/:id`
- **Description**: Delete user (soft delete)
- **Roles**: ADMIN only
- **Response**:
```json
{
  "message": "تم حذف المستخدم بنجاح"
}
```

## Data Models

### UserRole Enum
- `ADMIN`: System administrator
- `HR`: Human resources staff
- `MANAGER`: Department manager
- `EMPLOYEE`: Regular employee
- `APPLICANT`: Job applicant

### UserStatus Enum
- `ACTIVE`: User is active and can access the system
- `INACTIVE`: User is inactive but not suspended
- `SUSPENDED`: User is suspended and cannot access the system

### UserResponseDto
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "UserRole",
  "status": "UserStatus",
  "department": "string | null",
  "position": "string | null",
  "createdAt": "DateTime",
  "updatedAt": "DateTime",
  "lastLoginAt": "DateTime | null"
}
```

## Security
- All endpoints require JWT authentication
- Role-based access control is implemented
- Password hashing using bcrypt
- Email uniqueness validation
- Input validation using class-validator

## Error Handling
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Server error

## Usage Examples
See `test-users-api.http` file for complete API testing examples.