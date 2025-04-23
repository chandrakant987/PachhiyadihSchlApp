<template>
  <div class="homepage">
    <!-- Hero Section -->
    <section class="hero">
      <img :src="schoolImages[0]" alt="School" class="hero-image" />
    </section>

    <!-- News Ticker -->
    <section class="news">
      <div class="ticker-wrapper" v-if="newNotifications.length">
        <div class="ticker">
          <div class="ticker-content">
            <span v-for="(notif, index) in newNotifications" :key="notif.id">
              {{ notif.message }}
              <span v-if="index < newNotifications.length - 1"> | </span>
            </span>
          </div>
        </div>
      </div>
      <div class="ticker-placeholder" v-else>
        Latest School News & Notifications...
      </div>
    </section>

    <!-- Quick Links -->
    <section class="quick-links">
      <div class="link-card" v-for="link in quickLinks" :key="link.text">
        <a :href="link.url" target="_blank">
          <img :src="link.icon" class="link-icon" alt="" />
          <p>{{ link.text }}</p>
        </a>
      </div>
    </section>

        <!-- Contact Section -->
    <!-- Footer Section -->
    <section class="footer">
      <div class="footer-container">
        <div class="footer-column">
          <h3>Important Links</h3>
          <ul>
            <li><a href="#">Admission Info</a></li>
            <li><a href="#">Holiday List</a></li>
            <li><a href="#">Faculty Directory</a></li>
            <li><a href="#">Student Portal</a></li>
            <li><a href="#">Scholarships</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>Contact Us</h3>
          <p>Vill: Pachhiyadih</p>
          <p>PO: Odhanpur, Dist: Nawada</p>
          <p>Bihar, 805123</p>
          <p>Phone: 1234567890</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 उ. उ. म. वि. पछियाडीह | Managed by School Admin</p>
      </div>
    </section>
  </div>
  <SignInOverlay v-if="showSignIn" @close="showSignIn = false" />
</template>

<script>
import schoolImage from "/PachhiyadihSchool.jpeg";
import resultIcon from "../assets/icons/result.png";
import notificationIcon from "../assets/icons/notification.png";
import bsebIcon from "../assets/icons/bseb.png";
import udiseIcon from "../assets/icons/udise.png";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import SignInOverlay from "../components/SignInOverlay.vue";

export default {
  name: "HomePage",
  components: { SignInOverlay },
  data() {
    return {
      showSignIn: false,
      schoolImages: [schoolImage],
      newNotifications: [],
      quickLinks: [
        { text: "Results", url: "/result-search", icon: resultIcon },
        { text: "Notifications", url: "/view-notifications", icon: notificationIcon },
        { text: "BSEB", url: "https://biharboardonline.bihar.gov.in/", icon: bsebIcon },
        { text: "UDISE+", url: "https://udiseplus.gov.in/", icon: udiseIcon },
      ],
    };
  },
  methods: {
    markNew(notifications) {
      const now = new Date();
      return notifications
        .map((notif, index) => {
          const notifDate = notif.timestamp?.toDate?.();
          const isRecent = notifDate && (now - notifDate < 5 * 24 * 60 * 60 * 1000 || index < 3);
          return { ...notif, isNew: isRecent };
        })
        .filter((n) => n.isNew);
    },
    fetchNotifications() {
      const db = getFirestore();
      const q = query(collection(db, "Notifications"), orderBy("timestamp", "desc"));
      onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        this.newNotifications = this.markNew(all);
      });
    },
  },
  mounted() {
    this.fetchNotifications();
  },
};
</script>

<style scoped>
body, html {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.homepage {
  background: linear-gradient(#f5f7fa, #e4ecf7);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', sans-serif;
}

.hero {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.news {
  background-color: #fff;
  width: 100%;
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: #1f2937;
}

.ticker-wrapper {
  overflow: hidden;
}

.ticker {
  white-space: nowrap;
  display: inline-block;
  animation: scroll-left 20s linear infinite;
}

.ticker-content span {
  margin-right: 2rem;
  color: #e53e3e;
}

.ticker-placeholder {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 2rem 1rem;
  width: 100%;
  max-width: 1000px;
}

.link-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 1rem;
  transition: 0.3s ease;
}

.link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.link-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 0.5rem;
}

.results {
  padding: 2rem 1rem;
  width: 100%;
  max-width: 1000px;
}

.footer {
  background-color: #1f2937;
  color: #ffffff;
  width: 100%;
  margin-top: 2rem;
}

.footer-container {
  max-width: 1000px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  gap: 1rem;
}

.footer-column {
  flex: 1 1 200px;
}

.footer-column p {
  margin: 0.1rem 0;
  line-height: 1.3;
}

.footer-column h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #facc15;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column ul li {
  margin-bottom: 0.5rem;
}

.footer-column a {
  color: #d1d5db;
  text-decoration: none;
}

.footer-column a:hover {
  text-decoration: underline;
}

.footer-bottom {
  background-color: #111827;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: #9ca3af;
}

/* Ensure no extra scroll */



@keyframes scroll-left {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.homepage {
  width: 100%;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

</style>