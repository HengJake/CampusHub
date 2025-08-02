# Academic Database Initialization

This repository contains two scripts to initialize the Academic database with sample data in the correct order to maintain referential integrity.

## Scripts Available

### 1. Direct Database Injection (`initAcademicDatabase.js`)

- **Purpose**: Directly injects data into MongoDB
- **Use case**: Quick setup, bypasses API validation
- **Command**: `npm run init-academic`

### 2. API-Based Initialization (`initAcademicDatabaseAPI.js`) ⭐ **RECOMMENDED**

- **Purpose**: Calls API endpoints to create data
- **Use case**: Tests actual API functionality, validates controllers
- **Command**: `npm run init-academic-api`

## Prerequisites

1. Make sure MongoDB is running
2. Set up your `.env` file with `MONGODB_URI`
3. Install dependencies: `npm install`
4. **For API-based initialization**: Start the server with `npm run dev`

## Usage

### Method 1: Direct Database Injection

```bash
npm run init-academic
```

### Method 2: API-Based Initialization (Recommended)

```bash
# First, start the server
npm run dev

# In another terminal, run the API initialization
npm run init-academic-api
```

## What the scripts do

Both scripts create data in the following order to maintain dependencies:

1. **School** (Foundation)
2. **Users** (Admin, Lecturer, Student)
3. **Rooms** (Office, Classroom, Lab)
4. **Department** (Computer Science)
5. **Course** (Bachelor of Computer Science)
6. **Intake** (January 2024)
7. **Lecturer** (Dr. John Smith)
8. **Module** (Database Systems)
9. **Intake Course** (Links Intake + Course)
10. **Class Schedule** (Monday 9-12)
11. **Exam Schedule** (June 1st)
12. **Student** (Alice Johnson)
13. **Attendance** (Present on Feb 5th)
14. **Result** (Grade A)

## API-Based vs Direct Injection

| Feature            | API-Based                     | Direct Injection        |
| ------------------ | ----------------------------- | ----------------------- |
| **API Testing**    | ✅ Tests all endpoints        | ❌ Bypasses API         |
| **Validation**     | ✅ Uses controller validation | ❌ Skips validation     |
| **Error Handling** | ✅ Tests error responses      | ❌ No API error testing |
| **Speed**          | ⚠️ Slower (HTTP calls)        | ✅ Faster (direct DB)   |
| **Real-world**     | ✅ Simulates actual usage     | ❌ Development only     |

## Sample Data Created

### Users

- **Admin**: admin@apu.edu.my / password123
- **Lecturer**: john.smith@apu.edu.my / password123
- **Student**: alice.johnson@student.apu.edu.my / password123

### School

- **Name**: Asia Pacific University
- **Address**: Technology Park Malaysia, Bukit Jalil

### Course

- **Name**: Bachelor of Computer Science (Hons)
- **Code**: BCS
- **Duration**: 36 months

### Module

- **Name**: Database Systems
- **Code**: CS301
- **Credit Hours**: 3

## Database Schema Compliance

All data uses **camelCase** field names as per the model schemas:

- `departmentName` ✅
- `courseName` ✅
- `moduleName` ✅
- `intakeName` ✅
- `lecturerName` ✅

## Output

### Direct Injection

- ✅ Success messages for each entity created
- 📊 Summary of all created IDs
- ❌ Error messages if something fails

### API-Based

- ✅ Success messages for each API call
- 📊 Summary of all created IDs
- 💾 Saves IDs to `created_ids.json` file
- ❌ Detailed API error messages
- 🔗 Tests API connectivity first

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check your `MONGODB_URI` in `.env`

2. **API Connection Error** (API-based only)

   - Ensure server is running on `http://localhost:5000`
   - Check all routes are properly configured

3. **Validation Errors**

   - The scripts use camelCase field names
   - All required fields are included
   - References are properly linked

4. **Duplicate Key Errors**
   - Direct injection clears existing data first
   - API-based skips clearing (add DELETE endpoints if needed)

### API-Based Specific Issues

1. **Server Not Running**

   ```bash
   npm run dev
   ```

2. **Port Already in Use**

   - Change port in `.env` or kill existing process

3. **CORS Issues**
   - Ensure CORS is properly configured in server

## File Structure

```
backend/
├── initAcademicDatabase.js      # Direct DB injection
├── initAcademicDatabaseAPI.js   # API-based initialization
├── models/Academic/            # All Academic models
├── controllers/Academic/       # All Academic controllers
└── README_INIT.md             # This file
```

## Notes

- All passwords are hashed using bcrypt
- Dates are in proper ISO format
- ObjectIds are properly referenced
- Arrays and nested objects are correctly formatted
- All enum values match the model schemas
- API-based script saves created IDs to `created_ids.json` for reference
