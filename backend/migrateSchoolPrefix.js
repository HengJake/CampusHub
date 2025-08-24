// Migration script to add prefix field to existing schools
// Run this script after updating the school model to add the prefix field

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import School from './models/Billing/school.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campushub';

const migrateSchoolPrefix = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all schools without a prefix field
        const schoolsWithoutPrefix = await School.find({ prefix: { $exists: false } });
        console.log(`📊 Found ${schoolsWithoutPrefix.length} schools without prefix field`);

        if (schoolsWithoutPrefix.length === 0) {
            console.log('✅ All schools already have prefix field');
            return;
        }

        // Update each school to add a default prefix based on their name
        for (const school of schoolsWithoutPrefix) {
            // Generate a prefix from the school name (first 3-4 letters, uppercase)
            let prefix = school.name
                .replace(/[^a-zA-Z]/g, '') // Remove non-letters
                .substring(0, 4) // Take first 4 characters
                .toUpperCase(); // Convert to uppercase

            // Ensure prefix is at least 2 characters
            if (prefix.length < 2) {
                prefix = school.name.substring(0, 2).toUpperCase();
            }

            // Check if this prefix already exists
            let counter = 1;
            let finalPrefix = prefix;
            while (await School.findOne({ prefix: finalPrefix, _id: { $ne: school._id } })) {
                finalPrefix = `${prefix}${counter}`;
                counter++;
            }

            // Update the school with the new prefix
            await School.findByIdAndUpdate(school._id, { prefix: finalPrefix });
            console.log(`✅ Updated school "${school.name}" with prefix "${finalPrefix}"`);
        }

        console.log('🎉 Migration completed successfully!');
        console.log(`📊 Updated ${schoolsWithoutPrefix.length} schools`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the migration
migrateSchoolPrefix();
