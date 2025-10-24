// src/lib/firebase.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCb-eLfhn1ca6qV3MK2kv-e5PHwny1DToY",
  authDomain: "studio-dev-manas.firebaseapp.com",
  projectId: "studio-dev-manas",
  storageBucket: "studio-dev-manas.firebasestorage.app",
  messagingSenderId: "227344252699",
  appId: "1:227344252699:web:bf3bd0ec6137786123ddbe"
};

const app = initializeApp(firebaseConfig);

export default app;
