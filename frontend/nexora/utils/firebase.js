import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "nexora-e5ee9.firebaseapp.com",
  projectId: "nexora-e5ee9",
  storageBucket: "nexora-e5ee9.firebasestorage.app",
  messagingSenderId: "312078452987",
  appId: "1:312078452987:web:b3a3429ce261eead3bc85e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();