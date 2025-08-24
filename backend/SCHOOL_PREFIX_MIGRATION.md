# School Prefix Field Migration

## Overview
This document describes the addition of a `prefix` field to the School model and the migration process for existing schools.

## Changes Made

### 1. School Model Update (`backend/models/Billing/school.model.js`)
- Added `prefix` field to the school schema
- Field requirements:
  - Required field
  - Unique across all schools
  - Uppercase
  - Trimmed
  - Length: 2-10 characters
  - Only letters allowed

### 2. School Controller Update (`backend/controllers/Billing/school.controllers.js`)
- Added validation for the `prefix` field
- Updated `validateSchoolData` function to include prefix validation

### 3. Frontend Updates (`frontend/src/pages/commonPage/signup/SchoolSetup.jsx`)
- Added prefix input field to the school setup form
- Added validation for the prefix field
- Updated form submission to include prefix when creating schools

### 4. Initialization Script Updates (`backend/initAcademicDatabaseAPI.js`)
- Updated to include prefix when creating schools during initialization

## Migration Process

### For New Deployments
If you're setting up a new system, no migration is needed. The new field will be automatically included when schools are created.

### For Existing Deployments
If you have existing schools in your database, run the migration script:

```bash
cd backend
node migrateSchoolPrefix.js
```

The migration script will:
1. Find all schools without a prefix field
2. Generate a unique prefix based on the school name
3. Update each school with the new prefix field

## Usage

### Creating a New School
When creating a new school, the prefix field is now required:

```javascript
const schoolData = {
    userId: "user_id_here",
    name: "Asia Pacific University",
    prefix: "APU",  // Required field
    address: "Technology Park Malaysia",
    city: "Kuala Lumpur",
    country: "Malaysia",
    status: "Active"
};
```

### Frontend Form
The school setup form now includes a prefix field that:
- Accepts 2-10 characters
- Only allows letters
- Automatically converts to uppercase
- Validates uniqueness (handled by backend)

## Validation Rules

### Backend Validation
- Required field
- Length: 2-10 characters
- Only letters allowed
- Must be unique across all schools

### Frontend Validation
- Required field
- Length: 2-10 characters
- Only letters allowed
- Real-time validation feedback

## Examples of Valid Prefixes
- `APU` (Asia Pacific University)
- `BPU` (Borneo Pacific University)
- `UM` (University of Malaya)
- `USM` (Universiti Sains Malaysia)

## Notes
- The prefix field is used throughout the system for generating unique identifiers
- Vehicle plate numbers, user emails, and other identifiers use this prefix
- Existing schools will be automatically migrated with generated prefixes
- New schools must provide a unique prefix during creation

## Troubleshooting

### Migration Errors
If the migration fails:
1. Check MongoDB connection
2. Ensure you have write permissions
3. Check for any unique constraint violations

### Validation Errors
If you get validation errors:
1. Ensure prefix is 2-10 characters
2. Ensure prefix contains only letters
3. Ensure prefix is unique across all schools

### Frontend Issues
If the form doesn't work:
1. Check that all required fields are filled
2. Ensure prefix validation passes
3. Check browser console for errors
