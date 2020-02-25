import firebase from "firebase";

const config = {
  apiKey: "AIzaSyAVieE9lVXFg4D-4HAOAPVU575ryesmnO8",
  authDomain: "nuxt-pictionary.firebaseapp.com",
  databaseURL: "https://nuxt-pictionary.firebaseio.com",
  projectId: "nuxt-pictionary",
  storageBucket: "nuxt-pictionary.appspot.com",
  messagingSenderId: "408141506218",
  appId: "1:408141506218:web:e198f03ea5602e7b7352d3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const db = firebase.database();

export { db };
