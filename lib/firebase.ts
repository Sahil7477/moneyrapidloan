

import { initializeApp } from "firebase/app";

import { getAuth,type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvBNp9DN5hjNy8-s_9PukMxqc9-yqpnW0",
  authDomain: "moneyrapidloan.firebaseapp.com",
  projectId: "moneyrapidloan",
  storageBucket: "moneyrapidloan.firebasestorage.app",
  messagingSenderId: "254830559249",
  appId: "1:254830559249:web:c2fd8c0f12aeafea55b1b0",
  measurementId: "G-YSHSE8KY1M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);