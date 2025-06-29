import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const DB_NAME = 'JoinDB';
const DB_VERSION = 1;

const STORES = {
    USERS: 'users',
    TASKS: 'tasks',
    CONTACTS: 'contacts'
};

/**
 * A wrapper class for managing IndexedDB and syncing with Firestore.
 */
class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    /**
     * Initializes the IndexedDB database and creates necessary object stores.
     * 
     * @returns {Promise<IDBDatabase>}
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => reject(event.target.error);
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(STORES.USERS)) {
                    db.createObjectStore(STORES.USERS, { keyPath: 'email' });
                }
                if (!db.objectStoreNames.contains(STORES.TASKS)) {
                    db.createObjectStore(STORES.TASKS, { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains(STORES.CONTACTS)) {
                    db.createObjectStore(STORES.CONTACTS, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    /**
     * Adds a new record to the specified store.
     * 
     * @param {string} storeName 
     * @param {Object} data 
     * @returns {Promise<number|string>}
     */
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retrieves a record by key from the specified store.
     * 
     * @param {string} storeName 
     * @param {string|number} key 
     * @returns {Promise<Object>}
     */
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Updates an existing record in the specified store.
     * 
     * @param {string} storeName 
     * @param {Object} data 
     * @returns {Promise<number|string>}
     */
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Deletes a record from the specified store.
     * 
     * @param {string} storeName 
     * @param {string|number} key 
     * @returns {Promise<void>}
     */
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Adds a user to both Firestore and IndexedDB.
     * 
     * @param {Object} userData 
     * @returns {Promise<number|string>}
     */
    async addUser(userData) {
        try {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userDocRef, userData);
            return this.add(STORES.USERS, userData);
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    /**
     * Retrieves a user by email from Firestore or falls back to IndexedDB.
     * 
     * @param {string} email 
     * @returns {Promise<Object|null>}
     */
    async getUser(email) {
        try {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                return userDoc.data();
            }

            return this.get(STORES.USERS, email);
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    /**
     * Updates user data in both Firestore and IndexedDB.
     * 
     * @param {Object} userData 
     * @returns {Promise<number|string>}
     */
    async updateUser(userData) {
        try {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            await setDoc(userDocRef, userData, { merge: true });
            return this.update(STORES.USERS, userData);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Adds a task to IndexedDB.
     * 
     * @param {Object} taskData 
     * @returns {Promise<number>}
     */
    async addTask(taskData) {
        return this.add(STORES.TASKS, taskData);
    }

    /**
     * Retrieves a task by ID from IndexedDB.
     * 
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async getTask(id) {
        return this.get(STORES.TASKS, id);
    }

    /**
     * Updates a task in IndexedDB.
     * 
     * @param {Object} taskData 
     * @returns {Promise<number>}
     */
    async updateTask(taskData) {
        return this.update(STORES.TASKS, taskData);
    }

    /**
     * Deletes a task by ID from IndexedDB.
     * 
     * @param {number} id 
     * @returns {Promise<void>}
     */
    async deleteTask(id) {
        return this.delete(STORES.TASKS, id);
    }

    /**
     * Adds a contact to IndexedDB.
     * 
     * @param {Object} contactData 
     * @returns {Promise<number>}
     */
    async addContact(contactData) {
        return this.add(STORES.CONTACTS, contactData);
    }

    /**
     * Retrieves a contact by ID from IndexedDB.
     * 
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async getContact(id) {
        return this.get(STORES.CONTACTS, id);
    }

    /**
     * Updates a contact in IndexedDB.
     * 
     * @param {Object} contactData 
     * @returns {Promise<number>}
     */
    async updateContact(contactData) {
        return this.update(STORES.CONTACTS, contactData);
    }

    /**
     * Deletes a contact by ID from IndexedDB.
     * 
     * @param {number} id 
     * @returns {Promise<void>}
     */
    async deleteContact(id) {
        return this.delete(STORES.CONTACTS, id);
    }
}

const database = new Database();
export default database;
