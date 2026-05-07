import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAFhKSeBexJWds7lttU37r16MJrnqYhqXk',
  authDomain: 'poker-timer-marius.firebaseapp.com',
  databaseURL: 'https://poker-timer-marius-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'poker-timer-marius',
  storageBucket: 'poker-timer-marius.firebasestorage.app',
  messagingSenderId: '672723550368',
  appId: '1:672723550368:web:1b4914ec10862bd7e609c5',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseDatabase = getDatabase(firebaseApp);
