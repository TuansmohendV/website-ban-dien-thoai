// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIByIWPERASt2f-zofymK0KoTn9ebQsLc",
  authDomain: "webmobile-8031a.firebaseapp.com",
  projectId: "webmobile-8031a",
  storageBucket: "webmobile-8031a.firebasestorage.app",
  messagingSenderId: "663029624825",
  appId: "1:663029624825:web:f5c78277abb55eb556d728",
  measurementId: "G-3C6NFY7VWF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
auth.languageCode = 'vi';

