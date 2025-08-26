# College Management System API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Super Admin Routes](#super-admin-routes)
3. [Admin Routes](#admin-routes)
4. [Student Routes](#student-routes)
5. [User Routes](#user-routes)
6. [Data Types and Enums](#data-types-and-enums)
7. [Error Responses](#error-responses)
8. [File Upload](#file-upload)
9. [Rate Limiting](#rate-limiting)
10. [Authentication Flow](#authentication-flow)
11. [Development Setup](#development-setup)
12. [Testing](#testing)

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

### JWT Token Authentication

Most endpoints require JWT authentication. Include the token in:

- **Headers**: `Authorization: Bearer <token>`
- **Cookies**: `access-token=<token>`

### Super Admin Authentication

Super admin endpoints require a special authentication header:

```
Authorization: <super_admin_token>
```

---

## Super Admin Routes

### 1. Super Admin Login

**POST** `/super-admin/login`

**Request Body:**

```json
{
  "username": "superadmin",
  "password": "superadmin123",
  "secretKey": "your_super_admin_secret_key"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Super Admin login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get All Admins

**GET** `/super-admin/admin`

**Headers:**

```
Authorization: <super_admin_token>
```

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `onlyActive` (boolean, optional): Filter by active status

**Example:**

```
GET /super-admin/admin?page=1&limit=5&onlyActive=true
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admins fetched successfully",
  "data": {
    "admins": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "secretId": "ADM001",
        "email": "john.doe@college.edu",
        "role": "ADMIN",
        "isActive": true,
        "adminAccess": ["STUDENT_ACCESS", "TEACHER_ACCESS"],
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "totalAdmins": 1
  }
}
```

### 3. Create Admin

**POST** `/super-admin/admin`

**Headers:**

```
Authorization: <super_admin_token>
```

**Request Body:**

```json
{
  "name": "Jane Smith",
  "secretId": "ADM002",
  "dateOfBirth": "1990-05-15",
  "gender": "FEMALE",
  "phoneNumber": "9876543210",
  "address": "123 College Street, City",
  "bloodGroup": "A+",
  "adminAccess": ["STUDENT_ACCESS", "SUBJECT_ACCESS", "RESULT_ACCESS"]
}
```

**Response:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "admin": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Jane Smith",
      "secretId": "ADM002",
      "email": null,
      "role": "ADMIN",
      "isActive": false,
      "adminAccess": ["STUDENT_ACCESS", "SUBJECT_ACCESS", "RESULT_ACCESS"],
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 4. Get Admin Details

**GET** `/super-admin/admin/:adminId`

**Headers:**

```
Authorization: <super_admin_token>
```

**Path Parameters:**

- `adminId` (string, required): Admin's MongoDB ObjectId

**Example:**

```
GET /super-admin/admin/64f8a1b2c3d4e5f6a7b8c9d1
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admin details fetched successfully",
  "data": {
    "admin": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Jane Smith",
      "secretId": "ADM002",
      "email": null,
      "role": "ADMIN",
      "isActive": false,
      "adminAccess": ["STUDENT_ACCESS", "SUBJECT_ACCESS", "RESULT_ACCESS"],
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 5. Update Admin

**PUT** `/super-admin/admin/:adminId`

**Headers:**

```
Authorization: <super_admin_token>
```

**Path Parameters:**

- `adminId` (string, required): Admin's MongoDB ObjectId

**Request Body:**

```json
{
  "name": "Jane Smith Updated",
  "adminAccess": ["STUDENT_ACCESS", "TEACHER_ACCESS", "SUBJECT_ACCESS"]
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "admin": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Jane Smith Updated",
      "adminAccess": ["STUDENT_ACCESS", "TEACHER_ACCESS", "SUBJECT_ACCESS"],
      "updatedAt": "2023-09-06T10:35:00.000Z"
    }
  }
}
```

### 6. Change Admin Activity Status

**PATCH** `/super-admin/admin/:adminId`

**Headers:**

```
Authorization: <super_admin_token>
```

**Path Parameters:**

- `adminId` (string, required): Admin's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admin activated successfully",
  "data": {
    "admin": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "isActive": true,
      "updatedAt": "2023-09-06T10:40:00.000Z"
    }
  }
}
```

### 7. Reset Admin Password

**PATCH** `/super-admin/admin/:adminId/reset-password`

**Headers:**

```
Authorization: <super_admin_token>
```

**Path Parameters:**

- `adminId` (string, required): Admin's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "admin": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "isFirstLogin": true,
      "updatedAt": "2023-09-06T10:45:00.000Z"
    }
  }
}
```

---

## Admin Routes

All admin routes require admin authentication and specific access permissions.

### Student Management

#### 1. Get All Students

**GET** `/admin-access/student`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `department` (string, required): Department enum (CSE, IT, LT)
- `batch` (string, required): Batch ID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Example:**

```
GET /admin-access/student?department=CSE&batch=64f8a1b2c3d4e5f6a7b8c9d2&page=1&limit=5
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Students fetched successfully",
  "data": {
    "students": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "Alice Johnson",
        "secretId": "STU001",
        "role": "STUDENT",
        "isActive": true,
        "studentAcademicDetails": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
          "department": "CSE",
          "batch": "64f8a1b2c3d4e5f6a7b8c9d2"
        }
      }
    ]
  }
}
```

#### 2. Create Student

**POST** `/admin-access/student`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "name": "Bob Wilson",
  "secretId": "STU002",
  "dateOfBirth": "2005-03-20",
  "gender": "MALE",
  "phoneNumber": "9876543211",
  "address": "456 Student Street, City",
  "bloodGroup": "B+",
  "batch": "64f8a1b2c3d4e5f6a7b8c9d2",
  "department": "CSE"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Bob Wilson",
      "secretId": "STU002",
      "role": "STUDENT",
      "isActive": false,
      "studentAcademicDetails": "64f8a1b2c3d4e5f6a7b8c9d6"
    }
  }
}
```

#### 3. Get Student Details

**GET** `/admin-access/student/:studentId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `studentId` (string, required): Student's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Student details fetched successfully",
  "data": {
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Bob Wilson",
      "secretId": "STU002",
      "role": "STUDENT",
      "studentAcademicDetails": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "department": "CSE",
        "batch": "64f8a1b2c3d4e5f6a7b8c9d2"
      }
    }
  }
}
```

#### 4. Update Student

**PUT** `/admin-access/student/:studentId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `studentId` (string, required): Student's MongoDB ObjectId

**Request Body:**

```json
{
  "name": "Bob Wilson Updated",
  "phoneNumber": "9876543212",
  "address": "789 New Address, City"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Bob Wilson Updated",
      "phoneNumber": "9876543212",
      "address": "789 New Address, City"
    }
  }
}
```

#### 5. Change Student Status

**PATCH** `/admin-access/student/:studentId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `studentId` (string, required): Student's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Student status changed successfully",
  "data": {
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "isActive": true
    }
  }
}
```

### Teacher Management

#### 1. Get All Teachers

**GET** `/admin-access/teacher`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `onlyActive` (boolean, optional): Filter by active status

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Teachers fetched successfully",
  "data": {
    "teachers": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Dr. Sarah Brown",
        "secretId": "TCH001",
        "email": "sarah.brown@college.edu",
        "role": "TEACHER",
        "isActive": true
      }
    ],
    "totalTeachers": 1
  }
}
```

#### 2. Create Teacher

**POST** `/admin-access/teacher`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "name": "Dr. Michael Chen",
  "secretId": "TCH002",
  "dateOfBirth": "1985-08-10",
  "gender": "MALE",
  "phoneNumber": "9876543213",
  "address": "321 Faculty Street, City",
  "bloodGroup": "O+",
  "email": "michael.chen@college.edu"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Teacher created successfully",
  "data": {
    "teacher": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "name": "Dr. Michael Chen",
      "secretId": "TCH002",
      "email": "michael.chen@college.edu",
      "role": "TEACHER",
      "isActive": false
    }
  }
}
```

#### 3. Get Teacher Details

**GET** `/admin-access/teacher/:teacherId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `teacherId` (string, required): Teacher's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Teacher details fetched successfully",
  "data": {
    "teacher": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "name": "Dr. Michael Chen",
      "secretId": "TCH002",
      "email": "michael.chen@college.edu",
      "role": "TEACHER",
      "isActive": true
    }
  }
}
```

#### 4. Update Teacher

**PUT** `/admin-access/teacher/:teacherId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `teacherId` (string, required): Teacher's MongoDB ObjectId

**Request Body:**

```json
{
  "name": "Dr. Michael Chen Updated",
  "phoneNumber": "9876543214",
  "address": "456 Updated Faculty Street, City"
}
```

#### 5. Change Teacher Status

**PATCH** `/admin-access/teacher/:teacherId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `teacherId` (string, required): Teacher's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Teacher status changed successfully",
  "data": {
    "teacher": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "isActive": false
    }
  }
}
```

### Subject Management

#### 1. Get All Subjects

**GET** `/admin-access/subject`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `department` (string, required): Department enum (CSE, IT, LT)
- `semester` (string, optional): Semester enum
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subjects fetched successfully",
  "data": {
    "subjects": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
        "subjectCode": "CS101",
        "subjectName": "Introduction to Computer Science",
        "department": "CSE",
        "semester": "FIRST",
        "subjectType": "THEORY",
        "credits": 3,
        "assignedTeacher": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown",
          "secretId": "TCH001"
        }
      }
    ],
    "totalSubjects": 1
  }
}
```

#### 2. Create Subject

**POST** `/admin-access/subject`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "subjectCode": "CS102",
  "subjectName": "Data Structures",
  "department": "CSE",
  "semester": "SECOND",
  "subjectType": "THEORY",
  "credits": 4,
  "assignedTeacher": "64f8a1b2c3d4e5f6a7b8c9d7"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Subject created successfully",
  "data": {
    "subject": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9da",
      "subjectCode": "CS102",
      "subjectName": "Data Structures",
      "department": "CSE",
      "semester": "SECOND",
      "subjectType": "THEORY",
      "credits": 4
    }
  }
}
```

#### 3. Get Subject Details

**GET** `/admin-access/subject/:subjectId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `subjectId` (string, required): Subject's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subject details fetched successfully",
  "data": {
    "subject": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9da",
      "subjectCode": "CS102",
      "subjectName": "Data Structures",
      "department": "CSE",
      "semester": "SECOND",
      "subjectType": "THEORY",
      "credits": 4,
      "assignedTeacher": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Dr. Sarah Brown",
        "secretId": "TCH001"
      }
    }
  }
}
```

#### 4. Update Subject

**PUT** `/admin-access/subject/:subjectId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `subjectId` (string, required): Subject's MongoDB ObjectId

**Request Body:**

```json
{
  "subjectName": "Advanced Data Structures",
  "credits": 5,
  "assignedTeacher": "64f8a1b2c3d4e5f6a7b8c9d8"
}
```

### Batch Management

#### 1. Get All Batches

**GET** `/admin-access/batch`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `department` (string, required): Department enum (CSE, IT, LT)
- `includeCompletedBatches` (boolean, required): Include completed batches
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Batches fetched successfully",
  "data": {
    "batches": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "CSE 2023",
        "startingYear": "2023-06-01T00:00:00.000Z",
        "currentSemester": "FIRST",
        "department": "CSE",
        "isCompleted": false,
        "isResultsPublished": false
      }
    ],
    "totalBatches": 1
  }
}
```

#### 2. Create Batch

**POST** `/admin-access/batch`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "name": "CSE 2024",
  "startingYear": "2024-06-01",
  "currentSemester": "FIRST"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Batch created successfully",
  "data": {}
}
```

#### 3. Get Batch Details

**GET** `/admin-access/batch/:batchId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `batchId` (string, required): Batch's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Batch details fetched successfully",
  "data": {
    "batch": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "CSE 2023",
      "startingYear": "2023-06-01T00:00:00.000Z",
      "currentSemester": "FIRST",
      "department": "CSE",
      "isCompleted": false,
      "isResultsPublished": false
    }
  }
}
```

#### 4. Update Batch

**PUT** `/admin-access/batch/:batchId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `batchId` (string, required): Batch's MongoDB ObjectId

**Request Body:**

```json
{
  "name": "CSE 2023 Updated",
  "currentSemester": "SECOND",
  "isResultsPublished": true
}
```

#### 5. Promote Batch

**PUT** `/admin-access/batch/promote/:batchId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `batchId` (string, required): Batch's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Batch promoted successfully",
  "data": {
    "batch": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "currentSemester": "SECOND"
    }
  }
}
```

#### 6. Complete Batch and Publish Results

**PUT** `/admin-access/batch/complete/:batchId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `batchId` (string, required): Batch's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Batch completed and results published successfully",
  "data": {
    "batch": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "isCompleted": true,
      "isResultsPublished": true
    }
  }
}
```

### Assignment Management

#### 1. Get All Assignments

**GET** `/admin-access/assignment`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `batch` (string, optional): Batch ID
- `subject` (string, optional): Subject ID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Assignments fetched successfully",
  "data": {
    "assignments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9db",
        "title": "Programming Assignment 1",
        "description": "Write a program to implement basic algorithms",
        "dueDate": "2023-09-15T23:59:59.000Z",
        "marks": 20,
        "isClosed": false,
        "batch": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "CSE 2023"
        },
        "subject": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
          "subjectName": "Introduction to Computer Science",
          "subjectCode": "CS101"
        },
        "givenBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown"
        }
      }
    ],
    "totalAssignments": 1
  }
}
```

#### 2. Create Assignment

**POST** `/admin-access/assignment`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "batch": "64f8a1b2c3d4e5f6a7b8c9d2",
  "subject": "64f8a1b2c3d4e5f6a7b8c9d9",
  "title": "Data Structures Assignment",
  "description": "Implement linked list and binary tree",
  "dueDate": "2023-09-20T23:59:59.000Z",
  "marks": 25
}
```

**Response:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Assignment created successfully",
  "data": {
    "assignment": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9dc",
      "title": "Data Structures Assignment",
      "description": "Implement linked list and binary tree",
      "dueDate": "2023-09-20T23:59:59.000Z",
      "marks": 25,
      "isClosed": false
    }
  }
}
```

#### 3. Get Assignment Details

**GET** `/admin-access/assignment/:assignmentId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `assignmentId` (string, required): Assignment's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Assignment details fetched successfully",
  "data": {
    "assignment": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9dc",
      "title": "Data Structures Assignment",
      "description": "Implement linked list and binary tree",
      "dueDate": "2023-09-20T23:59:59.000Z",
      "marks": 25,
      "isClosed": false,
      "batch": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "CSE 2023"
      },
      "subject": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
        "subjectName": "Introduction to Computer Science",
        "subjectCode": "CS101"
      }
    }
  }
}
```

#### 4. Update Assignment

**PUT** `/admin-access/assignment/:assignmentId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `assignmentId` (string, required): Assignment's MongoDB ObjectId

**Request Body:**

```json
{
  "title": "Updated Data Structures Assignment",
  "description": "Updated description for the assignment",
  "dueDate": "2023-09-25T23:59:59.000Z",
  "marks": 30,
  "isClosed": true
}
```

### Material Management

#### 1. Get All Materials

**GET** `/admin-access/material`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `batch` (string, optional): Batch ID
- `subject` (string, optional): Subject ID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Materials fetched successfully",
  "data": {
    "materials": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9dd",
        "title": "Lecture Notes - Week 1",
        "description": "Introduction to programming concepts",
        "materialUrl": {
          "public_id": "materials/lecture_notes_1",
          "url": "https://res.cloudinary.com/example/lecture_notes_1.pdf"
        },
        "batch": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "CSE 2023"
        },
        "subject": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
          "subjectName": "Introduction to Computer Science",
          "subjectCode": "CS101"
        }
      }
    ],
    "totalMaterials": 1
  }
}
```

#### 2. Create Material

**POST** `/admin-access/material`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "batch": "64f8a1b2c3d4e5f6a7b8c9d2",
  "subject": "64f8a1b2c3d4e5f6a7b8c9d9",
  "title": "Lab Manual",
  "description": "Practical exercises for programming",
  "materialUrl": {
    "public_id": "materials/lab_manual",
    "url": "https://res.cloudinary.com/example/lab_manual.pdf"
  }
}
```

#### 3. Get Material Details

**GET** `/admin-access/material/:materialId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `materialId` (string, required): Material's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Material details fetched successfully",
  "data": {
    "material": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9dd",
      "title": "Lecture Notes - Week 1",
      "description": "Introduction to programming concepts",
      "materialUrl": {
        "public_id": "materials/lecture_notes_1",
        "url": "https://res.cloudinary.com/example/lecture_notes_1.pdf"
      },
      "batch": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "CSE 2023"
      },
      "subject": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
        "subjectName": "Introduction to Computer Science",
        "subjectCode": "CS101"
      }
    }
  }
}
```

#### 4. Update Material

**PUT** `/admin-access/material/:materialId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `materialId` (string, required): Material's MongoDB ObjectId

**Request Body:**

```json
{
  "title": "Updated Lecture Notes - Week 1",
  "description": "Updated description for the material",
  "materialUrl": {
    "public_id": "materials/updated_lecture_notes_1",
    "url": "https://res.cloudinary.com/example/updated_lecture_notes_1.pdf"
  }
}
```

### Routine Management

#### 1. Get All Routines

**GET** `/admin-access/routine`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `batch` (string, optional): Batch ID
- `subject` (string, optional): Subject ID
- `day` (string, optional): Day enum (MONDAY, TUESDAY, etc.)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Routines fetched successfully",
  "data": {
    "routines": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9de",
        "day": "MONDAY",
        "shift": "FIRST",
        "semester": "FIRST",
        "batch": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "name": "CSE 2023"
        },
        "subject": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
          "subjectName": "Introduction to Computer Science",
          "subjectCode": "CS101"
        },
        "createdBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown"
        }
      }
    ],
    "totalRoutines": 1
  }
}
```

#### 2. Create Routine

**POST** `/admin-access/routine`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "batch": "64f8a1b2c3d4e5f6a7b8c9d2",
  "subject": "64f8a1b2c3d4e5f6a7b8c9d9",
  "day": "TUESDAY",
  "shift": "SECOND",
  "semester": "FIRST"
}
```

#### 3. Get Routine Details

**GET** `/admin-access/routine/:routineId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `routineId` (string, required): Routine's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Routine details fetched successfully",
  "data": {
    "routine": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9de",
      "day": "MONDAY",
      "shift": "FIRST",
      "semester": "FIRST",
      "batch": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "CSE 2023"
      },
      "subject": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
        "subjectName": "Introduction to Computer Science",
        "subjectCode": "CS101"
      },
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Dr. Sarah Brown"
      }
    }
  }
}
```

#### 4. Update Routine

**PUT** `/admin-access/routine/:routineId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `routineId` (string, required): Routine's MongoDB ObjectId

**Request Body:**

```json
{
  "day": "WEDNESDAY",
  "shift": "THIRD",
  "subject": "64f8a1b2c3d4e5f6a7b8c9da"
}
```

### Result Management

#### 1. Get All Results

**GET** `/admin-access/result`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `subject` (string, optional): Subject ID
- `student` (string, optional): Student ID
- `batch` (string, optional): Batch ID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Results fetched successfully",
  "data": {
    "results": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9df",
        "pointsAchived": 8,
        "subject": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
          "subjectName": "Introduction to Computer Science",
          "subjectCode": "CS101"
        },
        "student": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
          "name": "Bob Wilson",
          "secretId": "STU002"
        },
        "createdBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown"
        }
      }
    ],
    "totalResults": 1
  }
}
```

#### 2. Create Result

**POST** `/admin-access/result`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "subject": "64f8a1b2c3d4e5f6a7b8c9d9",
  "student": "64f8a1b2c3d4e5f6a7b8c9d5",
  "pointsAchived": 9
}
```

#### 3. Get Result Details

**GET** `/admin-access/result/:resultId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `resultId` (string, required): Result's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Result details fetched successfully",
  "data": {
    "result": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9df",
      "pointsAchived": 8,
      "subject": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
        "subjectName": "Introduction to Computer Science",
        "subjectCode": "CS101"
      },
      "student": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "name": "Bob Wilson",
        "secretId": "STU002"
      },
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Dr. Sarah Brown"
      }
    }
  }
}
```

#### 4. Update Result

**PUT** `/admin-access/result/:resultId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `resultId` (string, required): Result's MongoDB ObjectId

**Request Body:**

```json
{
  "pointsAchived": 9
}
```

### Notice Management

#### 1. Get All Notices

**GET** `/admin-access/notice`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `department` (string, optional): Department enum (CSE, IT, LT)
- `semester` (string, optional): Semester enum
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notices fetched successfully",
  "data": {
    "notices": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9e0",
        "title": "Exam Schedule Announcement",
        "description": "Mid-semester exams will be held from next week",
        "date": "2023-09-10T00:00:00.000Z",
        "department": "CSE",
        "semester": "FIRST",
        "attachments": [
          {
            "public_id": "notices/exam_schedule",
            "url": "https://res.cloudinary.com/example/exam_schedule.pdf"
          }
        ],
        "createdBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown"
        }
      }
    ],
    "totalNotices": 1
  }
}
```

#### 2. Create Notice

**POST** `/admin-access/notice`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "title": "Holiday Notice",
  "description": "College will be closed for Diwali holiday",
  "date": "2023-11-12",
  "department": "CSE",
  "semester": "FIRST",
  "attachments": [
    {
      "public_id": "notices/holiday_notice",
      "url": "https://res.cloudinary.com/example/holiday_notice.pdf"
    }
  ]
}
```

#### 3. Get Notice Details

**GET** `/admin-access/notice/:noticeId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `noticeId` (string, required): Notice's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notice details fetched successfully",
  "data": {
    "notice": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9e0",
      "title": "Exam Schedule Announcement",
      "description": "Mid-semester exams will be held from next week",
      "date": "2023-09-10T00:00:00.000Z",
      "department": "CSE",
      "semester": "FIRST",
      "attachments": [
        {
          "public_id": "notices/exam_schedule",
          "url": "https://res.cloudinary.com/example/exam_schedule.pdf"
        }
      ],
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Dr. Sarah Brown"
      }
    }
  }
}
```

#### 4. Update Notice

**PUT** `/admin-access/notice/:noticeId`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `noticeId` (string, required): Notice's MongoDB ObjectId

**Request Body:**

```json
{
  "title": "Updated Holiday Notice",
  "description": "Updated description for the holiday notice",
  "date": "2023-11-15",
  "attachments": [
    {
      "public_id": "notices/updated_holiday_notice",
      "url": "https://res.cloudinary.com/example/updated_holiday_notice.pdf"
    }
  ]
}
```

---

## Student Routes

All student routes require student authentication and are accessible to students and admins.

### 1. Get Student Academic Details

**GET** `/student/academic-details`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Academic details fetched successfully",
  "data": {
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "student": "64f8a1b2c3d4e5f6a7b8c9d5",
      "batch": "64f8a1b2c3d4e5f6a7b8c9d2",
      "department": "CSE",
      "status": "ACTIVE"
    }
  }
}
```

### 2. Get Student Batch Details

**GET** `/student/batch-details`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Batch details fetched successfully",
  "data": {
    "batch": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "CSE 2023",
      "startingYear": "2023-06-01T00:00:00.000Z",
      "currentSemester": "FIRST",
      "department": "CSE"
    }
  }
}
```

### 3. Get Materials

**GET** `/student/materials`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Query Parameters:**

- `batch` (string, required): Batch ID
- `subject` (string, required): Subject ID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Materials fetched successfully",
  "data": {
    "materials": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9dd",
        "title": "Lecture Notes - Week 1",
        "description": "Introduction to programming concepts",
        "materialUrl": {
          "public_id": "materials/lecture_notes_1",
          "url": "https://res.cloudinary.com/example/lecture_notes_1.pdf"
        }
      }
    ]
  }
}
```

### 4. Get Student Routine

**GET** `/student/routine`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Routine fetched successfully",
  "data": {
    "routine": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9de",
        "day": "MONDAY",
        "shift": "FIRST",
        "semester": "FIRST",
        "subject": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
          "subjectName": "Introduction to Computer Science",
          "subjectCode": "CS101"
        },
        "createdBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown",
          "secretId": "TCH001"
        }
      }
    ]
  }
}
```

### 5. Get Student Subjects

**GET** `/student/subjects`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subjects fetched successfully",
  "data": {
    "subjects": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
        "subjectCode": "CS101",
        "subjectName": "Introduction to Computer Science",
        "department": "CSE",
        "semester": "FIRST",
        "subjectType": "THEORY",
        "credits": 3,
        "assignedTeacher": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown",
          "secretId": "TCH001"
        }
      }
    ]
  }
}
```

### 6. Get Student Assignments

**GET** `/student/assignments`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Assignments fetched successfully",
  "data": {
    "assignments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9db",
        "title": "Programming Assignment 1",
        "description": "Write a program to implement basic algorithms",
        "dueDate": "2023-09-15T23:59:59.000Z",
        "marks": 20,
        "isClosed": false,
        "subject": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
          "subjectName": "Introduction to Computer Science",
          "subjectCode": "CS101"
        },
        "givenBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown",
          "secretId": "TCH001"
        }
      }
    ]
  }
}
```

### 7. Submit Assignment

**POST** `/student/assignments/submit`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Request Body:**

```json
{
  "assignmentId": "64f8a1b2c3d4e5f6a7b8c9db",
  "file": {
    "public_id": "assignments/submission_1",
    "url": "https://res.cloudinary.com/example/submission_1.pdf"
  }
}
```

**Response:**

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Assignment submitted successfully",
  "data": {
    "submission": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9e1",
      "assignment": "64f8a1b2c3d4e5f6a7b8c9db",
      "student": "64f8a1b2c3d4e5f6a7b8c9d5",
      "file": {
        "public_id": "assignments/submission_1",
        "url": "https://res.cloudinary.com/example/submission_1.pdf"
      },
      "read": false,
      "marksObtained": 0
    }
  }
}
```

### 8. Get Assignment Submission

**GET** `/student/assignments/:assignmentId/submission`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Path Parameters:**

- `assignmentId` (string, required): Assignment's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Submission fetched successfully",
  "data": {
    "submission": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9e1",
      "assignment": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9db",
        "title": "Programming Assignment 1",
        "description": "Write a program to implement basic algorithms",
        "dueDate": "2023-09-15T23:59:59.000Z",
        "marks": 20
      },
      "file": {
        "public_id": "assignments/submission_1",
        "url": "https://res.cloudinary.com/example/submission_1.pdf"
      },
      "read": false,
      "marksObtained": 0
    }
  }
}
```

### 9. Get Student Results

**GET** `/student/results`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Results fetched successfully",
  "data": {
    "results": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9df",
        "pointsAchived": 8,
        "subject": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
          "subjectName": "Introduction to Computer Science",
          "subjectCode": "CS101",
          "credits": 3
        },
        "createdBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown",
          "secretId": "TCH001"
        }
      }
    ]
  }
}
```

### 10. Get Subject Result

**GET** `/student/results/subject/:subjectId`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Path Parameters:**

- `subjectId` (string, required): Subject's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subject result fetched successfully",
  "data": {
    "result": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9df",
      "pointsAchived": 8,
      "subject": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
        "subjectName": "Introduction to Computer Science",
        "subjectCode": "CS101",
        "credits": 3
      },
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Dr. Sarah Brown",
        "secretId": "TCH001"
      }
    }
  }
}
```

### 11. Get Student Notices

**GET** `/student/notices`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notices fetched successfully",
  "data": {
    "notices": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9e0",
        "title": "Exam Schedule Announcement",
        "description": "Mid-semester exams will be held from next week",
        "date": "2023-09-10T00:00:00.000Z",
        "department": "CSE",
        "semester": "FIRST",
        "attachments": [
          {
            "public_id": "notices/exam_schedule",
            "url": "https://res.cloudinary.com/example/exam_schedule.pdf"
          }
        ],
        "createdBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
          "name": "Dr. Sarah Brown",
          "secretId": "TCH001"
        }
      }
    ]
  }
}
```

### 12. Get Notice Details

**GET** `/student/notices/:noticeId`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Path Parameters:**

- `noticeId` (string, required): Notice's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notice details fetched successfully",
  "data": {
    "notice": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9e0",
      "title": "Exam Schedule Announcement",
      "description": "Mid-semester exams will be held from next week",
      "date": "2023-09-10T00:00:00.000Z",
      "department": "CSE",
      "semester": "FIRST",
      "attachments": [
        {
          "public_id": "notices/exam_schedule",
          "url": "https://res.cloudinary.com/example/exam_schedule.pdf"
        }
      ],
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Dr. Sarah Brown",
        "secretId": "TCH001"
      }
    }
  }
}
```

### 13. Get Student Profile

**GET** `/student/profile`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Student profile fetched successfully",
  "data": {
    "student": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "student": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "name": "Bob Wilson",
        "secretId": "STU002",
        "email": "bob.wilson@college.edu",
        "phoneNumber": "9876543211",
        "address": "456 Student Street, City",
        "bloodGroup": "B+",
        "gender": "MALE",
        "dateOfBirth": "2005-03-20T00:00:00.000Z",
        "profileImage": {
          "public_id": "users/profile_image_2",
          "url": "https://res.cloudinary.com/example/profile_image_2.jpg"
        }
      },
      "batch": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "CSE 2023",
        "startingYear": "2023-06-01T00:00:00.000Z",
        "currentSemester": "FIRST"
      },
      "department": "CSE",
      "status": "ACTIVE"
    }
  }
}
```

### 14. Update Student Profile

**PUT** `/student/profile`

**Headers:**

```
Authorization: Bearer <student_token>
```

**Request Body:**

```json
{
  "name": "Bob Wilson Updated",
  "phoneNumber": "9876543212",
  "address": "789 New Address, City"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Bob Wilson Updated",
      "phoneNumber": "9876543212",
      "address": "789 New Address, City"
    }
  }
}
```

---

## User Routes

All user routes require user authentication.

**POST** `/user/login`

**Request Body:**

```json
{
  "secretId": "STU001",
  "password": "userpassword123"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Bob Wilson",
      "secretId": "STU001",
      "role": "STUDENT",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. User Logout

**POST** `/user/logout`

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged out successfully",
  "data": {}
}
```

### 3. Get User Profile

**GET** `/user/me`

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Bob Wilson",
      "secretId": "STU001",
      "role": "STUDENT",
      "isActive": true,
      "profileImage": {
        "public_id": "users/profile_image_1",
        "url": "https://res.cloudinary.com/example/profile_image_1.jpg"
      }
    }
  }
}
```

### 4. Update Profile Image

**PUT** `/user/update-profile-image`

**Headers:**

```
Authorization: Bearer <user_token>
```

**Request Body (multipart/form-data):**

- `profileImage` (file, required): Profile image file

**Response:**

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "profileImage": {
        "public_id": "users/new_profile_image",
        "url": "https://res.cloudinary.com/example/new_profile_image.jpg"
      }
    }
  }
}
```

---

## Data Types and Enums

### Gender

- `MALE`
- `FEMALE`
- `OTHER`

### UserRole

- `ADMIN`
- `TEACHER`
- `STUDENT`
- `ALUMNI`

### Department

- `CSE` (Computer Science Engineering)
- `IT` (Information Technology)
- `LT` (Language Training)

### Semester

- `FIRST`
- `SECOND`
- `THIRD`
- `FOURTH`
- `FIFTH`
- `SIXTH`
- `SEVENTH`
- `EIGHTH`

### BloodGroup

- `A+`
- `A-`
- `B+`
- `B-`
- `AB+`
- `AB-`
- `O+`
- `O-`

### SubjectTypes

- `THEORY`
- `LAB`
- `SEMINAR`

### Day

- `MONDAY`
- `TUESDAY`
- `WEDNESDAY`
- `THURSDAY`
- `FRIDAY`
- `SATURDAY`
- `SUNDAY`

### RoutineShift

- `FIRST`
- `SECOND`
- `THIRD`
- `FOURTH`

### AdminAccess

- `SUBJECT_ACCESS`
- `TEACHER_ACCESS`
- `STUDENT_ACCESS`
- `ROUTINE_ACCESS`
- `NOTICE_ACCESS`
- `RESULT_ACCESS`
- `ASSIGNMENT_MONITOR_ACCESS`
- `BATCH_ACCESS`

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "success": false,
  "message": "All Fields Are required",
  "errors": []
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "success": false,
  "message": "You are not authorized to access this",
  "errors": []
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "success": false,
  "message": "You are not authorized to access this",
  "errors": []
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "success": false,
  "message": "Student not found",
  "errors": []
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "success": false,
  "message": "Internal Server Error",
  "errors": []
}
```

---

## File Upload

For file uploads (materials, notices), use Cloudinary integration:

### File Upload Structure

```json
{
  "public_id": "folder/filename",
  "url": "https://res.cloudinary.com/cloud_name/folder/filename.ext"
}
```

### Supported File Types

- PDF documents
- Images (JPG, PNG, GIF)
- Documents (DOC, DOCX)
- Presentations (PPT, PPTX)

---

## Rate Limiting

- **Super Admin endpoints**: 100 requests per hour
- **Admin endpoints**: 1000 requests per hour
- **User endpoints**: 500 requests per hour

---

## Authentication Flow

1. **Super Admin Login**: Get super admin token
2. **Admin Login**: Use admin credentials to get JWT token
3. **User Login**: Use user credentials to get JWT token
4. **Token Refresh**: Use refresh token to get new access token

---

## Development Setup

1. **Install dependencies**:

   ```bash
   cd server
   pnpm install
   ```

2. **Set up environment variables**:

   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

3. **Start development server**:

   ```bash
   pnpm run dev
   ```

4. **Build for production**:
   ```bash
   pnpm run build
   pnpm start
   ```

---

## Summary

The College Management System provides a comprehensive API for managing academic operations:

### **Super Admin Features:**

- Manage system administrators
- Full system access control

### **Admin Features:**

- Student and teacher management
- Subject and batch administration
- Assignment and material management
- Routine and result management
- Notice creation and management

### **Student Features:**

- View academic details and batch information
- Access study materials and class routines
- View assigned subjects and teachers
- Submit assignments and track submissions
- View academic results and performance
- Receive department-specific notices
- Manage personal profile information

### **System Features:**

- Role-based authentication and authorization
- File upload support via Cloudinary
- Comprehensive data validation
- Error handling and response formatting
- Scalable MongoDB architecture

---

## Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints.

### Example curl commands:

```bash
# Super Admin Login
curl -X POST http://localhost:3000/api/v1/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123","secretKey":"your_secret"}'

# Get All Students (with admin token)
curl -X GET "http://localhost:3000/api/v1/admin-access/student?department=CSE&batch=64f8a1b2c3d4e5f6a7b8c9d2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
