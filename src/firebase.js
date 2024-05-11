import { initializeApp } from "firebase/app" 
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyAydktqy5jRwph4qJkLAt1zjdyNc88d7WM",
    authDomain: "l4bc-adt-todoapp.firebaseapp.com",
    projectId: "l4bc-adt-todoapp",
    storageBucket: "l4bc-adt-todoapp.appspot.com",
    messagingSenderId: "562388999493",
    appId: "1:562388999493:web:906f37858797d927ef722c",
    measurementId: "G-K5H5DE5QS4"
  };


const app = initializeApp(firebaseConfig) 
const db = getFirestore(app) 
export const auth = getAuth(app)

export {db}