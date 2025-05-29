import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your routes list
const routes = [
  { path: '/', component: 'LandingHome' },
  { path: '/signup', component: 'SignUp' },
  { path: '/login', component: 'Login' },
  { path: '/2fa', component: 'TwoFAPage' },
  { path: '/dashboard', component: 'Dashboard' },
  { path: '/timetable', component: 'Timetable' },
  { path: '/results', component: 'Results' },
  { path: '/overall-performance', component: 'OverallPerformance' },
  { path: '/sign-attendance', component: 'SignAttendance' },
  { path: '/profile', component: 'Profile' },
  { path: '/edit-profile', component: 'EditProfile' },
  { path: '/settings', component: 'Settings' },
  { path: '/class-finder', component: 'ClassFinder' },
  { path: '/bookings', component: 'BookingsDashboard' },
  { path: '/transport', component: 'Transport' },
  { path: '/transport-booking', component: 'TransportBooking' },
  { path: '/transport-booking-details', component: 'TransportBookingDetails' },
  { path: '/parking-map', component: 'MapParkingLot' },
  { path: '/parking-reservation', component: 'ParkingReservation' },
  { path: '/parking-payment', component: 'ParkingPayment' },
  { path: '/gym-locker-booking', component: 'GymLockerBooking' },
  { path: '/locker-payment', component: 'LockerPayment' },
  { path: '/locker-details', component: 'LockerDetails' },
  { path: '/court-booking', component: 'CourtBooking' },
  { path: '/court-payment', component: 'CourtPayment' },
  { path: '/court-payment-details', component: 'CourtPaymentDetails' },
];

// Base directory for userSide folder
const baseDir = path.join(__dirname, 'userSide');

// Helper to convert route path to folder name
function folderName(routePath, componentName) {
  if (routePath === '/') return componentName.toLowerCase();
  return routePath.replace(/^\//, '').toLowerCase();
}

// Create folders and files
routes.forEach(({ path: routePath, component }) => {
  const folder = folderName(routePath, component);
  const folderPath = path.join(baseDir, folder);

  // Create folder if not exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Created folder: ${folderPath}`);
  }

  // Create JS file with simple React component template
  const jsFilePath = path.join(folderPath, `${folder}.js`);
  if (!fs.existsSync(jsFilePath)) {
    const jsContent = `// ${component} component\n\nfunction ${component}() {\n  return (\n    <div className="${folder}">\n      <h1>${component}</h1>\n    </div>\n  );\n}\n\nexport default ${component};\n`;
    fs.writeFileSync(jsFilePath, jsContent);
    console.log(`Created JS file: ${jsFilePath}`);
  }

  // Create SCSS file with placeholder styles
  const scssFilePath = path.join(folderPath, `${folder}.scss`);
  if (!fs.existsSync(scssFilePath)) {
    const scssContent = `/* Styles for ${component} */\n\n.${folder} {\n  /* Add styles here */\n}\n`;
    fs.writeFileSync(scssFilePath, scssContent);
    console.log(`Created SCSS file: ${scssFilePath}`);
  }
});

console.log('Folder and files creation completed!');
