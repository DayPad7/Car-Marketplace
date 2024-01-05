import {getFirestore} from 'firebase/firestore'
import { initializeApp } from "firebase/app";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5jg_cd0xu6l6YqxSkRgzJyyNv8NLP9RM",
  authDomain: "car-marketplace-project.firebaseapp.com",
  projectId: "car-marketplace-project",
  storageBucket: "car-marketplace-project.appspot.com",
  messagingSenderId: "419027441132",
  appId: "1:419027441132:web:308a0818c163ba49825cc9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)