<template>
  <div class="add-notification">
    <h2>{{ isEditing ? "Edit Notification" : "Add Notification" }}</h2>
    <form @submit.prevent="submitNotification">
      <!-- Heading field (disabled until script update) -->
      <div class="form-group">
        <label for="notificationHeading">Notification Heading</label>
        <input
          id="notificationHeading"
          placeholder="e.g., Class 9 Mid Sem Exam TimeTable (coming soon)"
          maxlength="100"
          disabled
          aria-label="Notification heading (disabled)"
        />
      </div>
      <!-- Content field using newNotification -->
      <div class="form-group">
        <label for="notificationContent">Notification Content</label>
        <textarea
          id="notificationContent"
          v-model="newNotification"
          placeholder="Enter detailed message (max 500 characters)"
          rows="4"
          maxlength="500"
          required
          aria-label="Notification content"
        ></textarea>
        <p class="char-counter">{{ newNotification.length }}/500</p>
      </div>
      <!-- Image field (disabled until script update) -->
      <div class="form-group">
        <label for="notificationImage">Image (Optional)</label>
        <input
          id="notificationImage"
          type="file"
          accept="image/*"
          ref="imageInput"
          disabled
          aria-label="Upload notification image (disabled)"
        />
      </div>
      <div class="button-group">
        <button type="submit">
          {{ isEditing ? "Update" : "Submit" }}
        </button>
        <button type="button" @click="clearForm">Clear</button>
      </div>
    </form>

    <Snackbar :message="snackbarMsg" :visible="showSnackbar" :type="snackbarType" />

    <h3>All Notifications</h3>
    <div v-if="loading" class="loading">
      <svg class="spinner" viewBox="0 0 24 24" fill="#1e3a8a">
        <path d="M12 4V2A10 10 0 0 0 2 12H4A8 8 0 0 1 12 4Z" />
      </svg>
      Loading...
    </div>
    <ul v-else-if="notifications.length" class="notifications-list">
      <li v-for="notif in notifications" :key="notif.id">
        <!-- Use notif.message as heading, no popup until script update -->
        <span class="heading">{{ notif.message }}</span>
        <!-- Attachment icon placeholder (hidden, as no image support yet) -->
        <!-- <button
          v-if="notif.image"
          class="attachment"
          disabled
          aria-label="View notification image (coming soon)"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="#1e3a8a">
            <path
              d="M13 9H11V7H13V9ZM13 17H11V11H13V17ZM5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3ZM5 5V19H19V5H5Z"
            />
          </svg>
        </button> -->
        <div class="actions">
          <button @click="editNotification(notif)" aria-label="Edit notification">
            <svg class="icon" viewBox="0 0 24 24" fill="#1e3a8a">
              <path
                d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
              />
            </svg>
          </button>
          <button @click="deleteNotification(notif.id)" aria-label="Delete notification">
            <svg class="icon" viewBox="0 0 24 24" fill="#1e3a8a">
              <path
                d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
              />
            </svg>
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="no-notifications">No notifications available.</p>

    <!-- Notification Popup (commented out until script update) -->
    <!-- <div v-if="showNotificationPopup" class="modal-overlay">
      <div class="modal">
        <h3>{{ selectedNotification.heading }}</h3>
        <p class="modal-content">{{ selectedNotification.content }}</p>
        <img
          v-if="selectedNotification.image"
          :src="selectedNotification.image"
          alt="Notification image"
          class="modal-image"
        />
        <button @click="closeNotificationPopup" class="modal-close">Close</button>
      </div>
    </div> -->

    <!-- Image Popup (commented out until script update) -->
    <!-- <div v-if="showImagePopup" class="modal-overlay">
      <div class="modal image-modal">
        <img :src="selectedImage" alt="Notification image" class="modal-image" />
        <div class="image-actions">
          <a :href="selectedImage" download class="download-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="#facc15">
              <path
                d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z"
              />
            </svg>
            Download
          </a>
          <button @click="closeImagePopup" class="modal-close">Close</button>
        </div>
      </div>
    </div> -->
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
  limit,
} from "firebase/firestore";
import Snackbar from "./Snackbar.vue";

export default {
  name: "AddNotifications",
  components: { Snackbar },
  data() {
    return {
      newNotification: "",
      editingId: null,
      notifications: [],
      snackbarMsg: "",
      showSnackbar: false,
      snackbarType: "error",
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
      return date ? date.toLocaleString() : "Unknown date";
    },
    async submitNotification() {
      const message = this.newNotification.trim();
      if (!message) {
        this.showToast("Notification message cannot be empty.", "error");
        return;
      }

      try {
        const db = getFirestore();
        if (this.isEditing) {
          const docRef = doc(db, "Notifications", this.editingId);
          await updateDoc(docRef, { message });
          this.showToast("Notification updated successfully!", "success");
        } else {
          await addDoc(collection(db, "Notifications"), {
            message,
            timestamp: serverTimestamp(),
          });
          this.showToast("Notification added successfully!", "success");
        }
        this.clearForm();
      } catch (err) {
        console.error("Error saving notification:", err);
        this.showToast(`Error saving notification: ${err.message}`, "error");
      }
    },
    editNotification(notif) {
      this.newNotification = notif.message;
      this.editingId = notif.id;
    },
    async deleteNotification(id) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "Notifications", id));
        this.showToast("Notification deleted successfully!", "success");
      } catch (err) {
        console.error("Error deleting notification:", err);
        this.showToast(`Error deleting notification: ${err.message}`, "error");
      }
    },
    clearForm() {
      this.newNotification = "";
      this.editingId = null;
      this.showToast("Form cleared.", "info");
    },
    showToast(msg, type = "error") {
      this.snackbarMsg = msg;
      this.snackbarType = type;
      this.showSnackbar = true;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 3000);
    },
    listenForNotifications() {
      const db = getFirestore();
      const q = query(
        collection(db, "Notifications"),
        orderBy("timestamp", "desc"),
        limit(50) // Limit to 50 notifications
      );

      onSnapshot(q, (snapshot) => {
        this.notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.loading = false;
      }, (err) => {
        console.error("Error fetching notifications:", err);
        this.showToast(`Error loading notifications: ${err.message}`, "error");
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
  width: 95%;
  max-width: 600px;
  margin: 15px auto;
  padding: 15px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: hidden; /* Prevent horizontal scrollbars */
}

h2,
h3 {
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 20px;
}

h2 {
  font-size: 1.5rem;
}

h3 {
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  color: #1e3a8a;
  font-weight: 500;
  margin-bottom: 5px;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.9rem;
  color: #333;
}

textarea {
  resize: vertical;
  max-width: 100%;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 4px rgba(30, 64, 175, 0.3);
}

input:disabled,
textarea:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.char-counter {
  text-align: right;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 5px;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
  overflow: hidden; /* Prevent scrollbars from button scaling */
  padding: 5px; /* Extra padding for scaled buttons */
}

button {
  padding: 10px 20px;
  background: linear-gradient(to right, #1e3a8a, #1e40af);
  color: #facc15;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  will-change: transform; /* Optimize animation performance */
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

button[type="button"] {
  background: #64748b;
  color: #ffffff;
}

button[type="button"]:hover {
  background: #475569;
}

button:disabled {
  background: #64748b;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #1e3a8a;
  font-size: 1rem;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.notifications-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notifications-list li {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #333;
  align-items: center;
}

.heading {
  flex: 1;
  max-width: 100%;
  white-space: pre-wrap;
  color: #1e40af;
  text-decoration: none;
}

.heading:hover {
  text-decoration: underline;
}

.attachment {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.actions {
  display: flex;
  gap: 5px;
  overflow: hidden; /* Prevent scrollbars from button scaling */
}

.actions button {
  padding: 5px;
  background: none;
  border: none;
  cursor: pointer;
}

.icon {
  width: 20px;
  height: 20px;
}

.no-notifications {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

/* Modal Styles (kept for future use) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  position: relative;
}

.modal h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.modal-content {
  font-size: 0.9rem;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 15px;
}

.modal-image {
  max-width: 100%;
  max-height: 300px;
  display: block;
  margin: 0 auto 15px;
  border-radius: 4px;
}

.image-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.image-actions {
  display: flex;
  gap: 10px;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: linear-gradient(to right, #1e3a8a, #1e40af);
  color: #facc15;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
}

.download-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

.modal-close {
  padding: 8px 16px;
  background: #64748b;
  color: #ffffff;
  border-radius: 6px;
}

.modal-close:hover {
  background: #475569;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .add-notification {
    padding: 10px;
    width: 100%;
  }

  h2 {
    font-size: 1.3rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  input,
  textarea {
    padding: 6px;
    font-size: 0.85rem;
  }

  button {
    padding: 8px 16px;
  }

  .notifications-list li {
    flex-direction: column;
    padding: 8px;
    align-items: flex-start;
  }

  .attachment {
    order: 1;
  }

  .actions {
    order: 2;
  }

  .modal {
    padding: 15px;
    max-width: 95vw;
  }

  .modal h3 {
    font-size: 1.1rem;
  }

  .modal-content {
    font-size: 0.85rem;
  }

  .modal-image {
    max-height: 200px;
  }
}
</style>