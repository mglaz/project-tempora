// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Optional - comment out for now

// Your web app's Firebase configuration
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

// Initialize Firestore
export const db = getFirestore(app);

// Optional: Initialize Analytics (can add later)
// const analytics = getAnalytics(app);