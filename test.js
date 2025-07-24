let array = [123,123]

console.log(typeof array)


// ===============================
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// // Fix __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // All routes: user, admin, campushub
// const routes = [
// //   '/landing',
// //   '/service',
// //   '/contact-us',
// //   '/pricing',
// //   '/login',
// //   '/signup',
// //   '/login-campushub',
// //   '/about',

//   // User routes
// //   "/user-dashboard",
// //   "/book-facility",
// //   "/book-locker",
// //   "/parking-lot",
// //   "/classroom-finder",
// //   "/class-schedule",
// //   "/result",
// //   "/attendance",
// //   "/bus-schedule",
// //   "/campus-ride",
// //   "/feedback",
// //   "/user-setting",
// //   "/user-profile",

//   // Admin routes
// //   "/admin-dashboard",
// //   "/student-management",
// //   "/facility-management",
// //   "/locker-management",
// //   "/parking-management",
// //   "/booking-management",
// //   "/feedback-management",
// //   "/announcement-management",
// //   "/admin-setting",
// //   "/admin-profile",

//   // CampusHub routes
//   "/campushub-dashboard",
//   "/subscription",
//   "/analytical-report",
//   "/client-management",
//   "/user-oversight",
//   "/campushub-setting",
//   "/campushub-profile",
// ];

// // Convert kebab-case to PascalCase
// function toCamelCase(str) {
//   return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
// }

// // Base directory
// const baseDir = path.join(__dirname, "pages");
// if (!fs.existsSync(baseDir)) {
//   fs.mkdirSync(baseDir);
// }

// // Generate folders and files
// routes.forEach((route) => {
//   const folderName = toCamelCase(route.replace("/", ""));
//   const folderPath = path.join(baseDir, folderName);
//   const jsxFile = `${folderName}.jsx`;
//   const scssFile = `${folderName}.scss`;

//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath);
//   }

//   fs.writeFileSync(
//     path.join(folderPath, jsxFile),
//     `import React from 'react';\nimport './${scssFile}';\n\nfunction ${folderName}() {\n  return <div className="${folderName}">${folderName} Page</div>;\n}\n\nexport default ${folderName};\n`
//   );

//   fs.writeFileSync(
//     path.join(folderPath, scssFile),
//     `.${folderName} {\n  // styles for ${folderName}\n}\n`
//   );

//   console.log(`✅ Created: ${folderName}/[${jsxFile}, ${scssFile}]`);
// });


// const utcNow = new Date();
// const [day, time] = utcToTimeString(utcNow);
// console.log("Malaysia time string:", day, time); // e.g., 5 "16:00"

// const utcFromString = timeStringToUTC([5, "16:00"]);
// console.log("UTC Date from string:", utcFromString);

// const malaysiaDate = utcToMalaysiaDate(utcNow);
// console.log("Malaysia Date:", malaysiaDate);

// const utcAgain = malaysiaToUTC(malaysiaDate);
// console.log("Converted back to UTC:", utcAgain);

