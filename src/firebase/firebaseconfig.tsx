// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCFvX0sMysDnyx0yaxBg_xsK19K3_mqIe4",
    authDomain: "pharma-card.firebaseapp.com",
    projectId: "pharma-card",
    storageBucket: "pharma-card.firebasestorage.app",
    messagingSenderId: "316402198527",
    appId: "1:316402198527:web:3622f7517996a6c637a9ca",
    measurementId: "G-Y6KB2N27R3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
