import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAiWyDIcK6gBjP7lipndlyQKRRTur3bMJM",
    authDomain: "join-cdaed.firebaseapp.com",
    projectId: "join-cdaed",
    storageBucket: "join-cdaed.firebasestorage.app",
    messagingSenderId: "1011323047215",
    appId: "1:1011323047215:web:3b2b767a267dfac58165da",
    measurementId: "G-VQ5RF4327C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = setupFirestore(app);

let isOnline = navigator.onLine;
setupNetworkListeners();

setAuthPersistence(auth);

auth.useDeviceLanguage();

/**
 * Initializes and configures Firestore with custom settings.
 *
 * @param {import("firebase/app").FirebaseApp} app - The Firebase app instance to initialize Firestore with.
 * @returns {import("firebase/firestore").Firestore} The initialized Firestore instance.
 */
function setupFirestore(app) {
    return initializeFirestore(app, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        experimentalForceLongPolling: true,
        useFetchStreams: false
    });
}

/**
 * Sets up event listeners to monitor the network connection status.
 * 
 * Updates the global `isOnline` flag depending on the browser's online/offline status.
 * 
 * - Sets `isOnline` to `true` when the user goes online.
 * - Sets `isOnline` to `false` when the user goes offline.
 */
function setupNetworkListeners() {
    window.addEventListener('online', () => { isOnline = true; });
    window.addEventListener('offline', () => { isOnline = false; });
}


/**
 * Attempts to set authentication persistence using local storage.
 * 
 * Falls back to session storage if local storage is not available or fails.
 * Logs an error if both persistence mechanisms fail.
 *
 * @param {import("firebase/auth").Auth} auth - The Firebase Auth instance.
 */
function setAuthPersistence(auth) {
    setPersistence(auth, browserLocalPersistence)
        .catch(() => setPersistence(auth, browserSessionPersistence))
        .catch((error) => {
            console.error('All persistence attempts failed:', error);
        });
}


/**
 * Checks if the browser is online.
 * 
 * Throws an error if the browser is offline, otherwise returns true.
 *
 * @throws {Error} If the user is offline.
 * @returns {boolean} True if online.
 */
function checkNetworkStatus() {
    if (!navigator.onLine) {
        throw new Error('Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkverbindung und versuchen Sie es erneut.');
    }
    return true;
}

export { auth, db, checkNetworkStatus, isOnline }; 