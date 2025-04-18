<template>
    <div class="add-notification">
      <h2>{{ isEditing ? "Edit Notification" : "Add Notification" }}</h2>
      <textarea v-model="newNotification" placeholder="Enter notification..." rows="4" cols="50"></textarea>
      <div>
        <button @click="submitNotification">
          {{ isEditing ? "Update" : "Submit" }}
        </button>
        <button @click="confirmClear">Clear</button>
      </div>
      <p v-if="successMsg" class="success">{{ successMsg }}</p>
  
      <h3>All Notifications</h3>
      <ul v-if="!loading">
        <li v-for="notif in notifications" :key="notif.id">
          {{ notif.message }} — {{ formatDate(notif.timestamp) }}
          <button @click="editNotification(notif)">Edit</button>
          <button @click="deleteNotification(notif.id)">Delete</button>
        </li>
      </ul>
      <p v-else>Loading...</p>
    </div>
  </template>
  
  <script>
  import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    query,
    serverTimestamp,
  } from "firebase/firestore";
  //import { db } from "@/firebase";
  
  export default {
    name: "AddNotification",
    data() {
      return {
        newNotification: "",
        editingId: null,
        notifications: [],
        successMsg: "",
        loading: true,
      };
    },
    computed: {
      isEditing() {
        return !!this.editingId;
      },
    },
    methods: {
      formatDate(timestamp) {
        const date = timestamp?.toDate?.();
        return date ? date.toLocaleString() : "";
      },
      async submitNotification() {
        if (!this.newNotification.trim()) return;
  
        const confirmed = confirm(
          this.isEditing ? "Update this notification?" : "Add this notification?"
        );
        if (!confirmed) return;
  
        try {
          const db = getFirestore();
          if (this.isEditing) {
            const docRef = doc(db, "Notifications", this.editingId);
            await updateDoc(docRef, {
              message: this.newNotification.trim(),
            });
            this.successMsg = "Notification updated!";
          } else {
            await addDoc(collection(db, "Notifications"), {
              message: this.newNotification.trim(),
              timestamp: serverTimestamp(),
            });
            this.successMsg = "Notification added!";
          }
          this.clearInput();
        } catch (err) {
          console.error("Error saving notification:", err);
        }
      },
      editNotification(notif) {
        this.newNotification = notif.message;
        this.editingId = notif.id;
      },
      async deleteNotification(id) {
        const confirmed = confirm("Are you sure you want to delete this?");
        if (!confirmed) return;
  
        try {
          const db = getFirestore();
          await deleteDoc(doc(db, "Notifications", id));
          this.successMsg = "Notification deleted!";
        } catch (err) {
          console.error("Error deleting notification:", err);
        }
      },
      confirmClear() {
        if (confirm("Clear the input?")) {
          this.clearInput();
        }
      },
      clearInput() {
        this.newNotification = "";
        this.editingId = null;
      },
      listenForNotifications() {
        const db = getFirestore();
        const q = query(
          collection(db, "Notifications"),
          orderBy("timestamp", "desc")
        );
  
        onSnapshot(q, (snapshot) => {
          this.notifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          this.loading = false;
        });
      },
    },
    mounted() {
      this.listenForNotifications();
    },
  };
  </script>
  
  <style scoped>
  .add-notification {
    max-width: 500px;
    margin: 40px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fafafa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .success {
    color: green;
    margin-top: 10px;
  }
  </style>
  