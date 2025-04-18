<template>
    <div class="notifications-container">
      <h2 class="page-title">Notifications</h2>
  
      <div v-if="loading" class="loading">Loading notifications...</div>
  
      <ul v-else class="notifications-list">
        <li
          v-for="notif in notifications"
          :key="notif.id"
          class="notification-card"
        >
          <div class="notification-content">
            <p class="message">{{ notif.message }}</p>
            <div class="meta">
              <span class="timestamp">{{ formatDate(notif.timestamp) }}</span>
              <span v-if="notif.isNew" class="new-badge">NEW</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";
  
  export default {
    name: "Notifications",
    data() {
      return {
        notifications: [],
        loading: true,
      };
    },
    methods: {
      formatDate(timestamp) {
        const date = timestamp?.toDate?.();
        return date
          ? new Intl.DateTimeFormat("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(date)
          : "";
      },
      markNew(notifications) {
        const now = new Date();
        return notifications.map((notif, index) => {
          const notifDate = notif.timestamp?.toDate?.();
          const isRecent =
            notifDate &&
            (now - notifDate < 5 * 24 * 60 * 60 * 1000 || index < 3);
          return { ...notif, isNew: isRecent };
        });
      },
    },
    mounted() {
      const db = getFirestore()
      const q = query(
        collection(db, "Notifications"),
        orderBy("timestamp", "desc")
      );
  
      onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.notifications = this.markNew(notifs);
        this.loading = false;
      });
    },
  };
  </script>
  
  <style scoped>
  .notifications-container {
    max-width: 90%;
    margin: 2rem auto;
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    font-weight: bold;
    text-align: center;
    color: #2c3e50;
  }
  
  .loading {
    text-align: center;
    font-size: 1.1rem;
    color: #666;
  }
  
  .notifications-list {
    list-style: none;
    padding: 0;
  }
  
  .notification-card {
    background: #f8f9fa;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    margin-bottom: 1rem;
    padding: 1rem 1.2rem;
    transition: background 0.2s ease;
  }
  
  .notification-card:hover {
    background: #eef2f7;
  }
  
  .notification-content {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    align-items: flex-start;
  }
  
  .message {
    font-size: 1.1rem;
    font-weight: 500;
    color: #333;
    margin: 5px;
  }
  
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: #777;
  }
  
  .new-badge {
    background-color: #e53e3e;
    color: #fff;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 999px;
    font-weight: bold;
    margin-left:0.5rem;
  }
  </style>
  