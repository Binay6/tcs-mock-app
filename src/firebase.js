import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBozhvKY9dN5ptY_uO-idMZI5T1bbNHmtY",
  authDomain: "tcs-nqt-mock-test.firebaseapp.com",
  projectId: "tcs-nqt-mock-test",
  storageBucket: "tcs-nqt-mock-test.firebasestorage.app",
  messagingSenderId: "406025433370",
  appId: "1:406025433370:web:51ba5a71bc480bfacf3ca3",
  measurementId: "G-7CXRQJYLZD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
