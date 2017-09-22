import firebase from 'firebase'

//Fill in your own config settings from firebase and change
//the filename to firebase.js
export const config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};
firebase.initializeApp(config);