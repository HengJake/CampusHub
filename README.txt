Postman - to test the API endpoints

npm i to install all the dependencies 

// install in main folder
npm install express mongoose dotenv nodemon

// install in frontend folder
npm create vite@latest .
npm i
npm install @chakra-ui/icons@2.2.4 @chakra-ui/react@2.10.9 @emotion/react@11.14.0 @emotion/styled@11.14.0 framer-motion@12.14.0 react@18.2.0 react-dom@18.2.0 react-icons@5.5.0 react-router-dom@7.6.1 zustand@5.0.5 

// when want to push to repo
 make sure to remove node and add installation code when deploying


@ deployment stage
npm list express path-to-regexp
npm install path-to-regexp@6.2.1
npm uninstall express path-to-regexp
npm install express@^4.18.2

IF still in dark mode
// import theme from "./theme.js";
// import { ColorModeScript } from "@chakra-ui/react";
// <ColorModeScript initialColorMode={theme.config.initialColorMode} />

Theme.js
import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light", // 👈 default to light mode
  useSystemColorMode: false, // 👈 disable system preference
};

const theme = extendTheme({ config });

export default theme;




//==========For schema structure=========
import mongoose from "mongoose";

const schoolAdminSchema = new mongoose.Schema(
  {
    _id: ObjectId,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    companyName: String,
    contactNumber: String,
    departments: [String],
    permissions: [String], // e.g. ["manageParking", "manageReports"]
  },
 {
    timestamps: true, // createAt , updatedAt
  }
);


export as first letter CAP and no S behind so : User, Lecturer, SchoolAdmin
