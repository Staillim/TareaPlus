
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-5559425944-b977d",
  "appId": "1:425426356417:web:562027fef2e3cb9d272c40",
  "apiKey": "AIzaSyA3vEPmO4ajzXODVE9UONF54-8x55Pi-jQ",
  "authDomain": "studio-5559425944-b977d.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "425426356417"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, firestore, googleProvider };
