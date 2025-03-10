// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALkLgfa9BZd66PaLe6v9VSU4UWBa6LajU",
  authDomain: "iot-greenhouse-ed10b.firebaseapp.com",
  databaseURL: "https://iot-greenhouse-ed10b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iot-greenhouse-ed10b",
  storageBucket: "iot-greenhouse-ed10b.firebasestorage.app",
  messagingSenderId: "851128992719",
  appId: "1:851128992719:web:21453a96a07a26244708ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);