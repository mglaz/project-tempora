// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiu3frZplHeyt83Qlge-VIs92iA7G4Bfo",
  authDomain: "project-tempora.firebaseapp.com",
  projectId: "project-tempora",
  storageBucket: "project-tempora.firebasestorage.app",
  messagingSenderId: "457754110836",
  appId: "1:457754110836:web:537594a2204399a8be5a21",
  measurementId: "G-8KRS46K550"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);