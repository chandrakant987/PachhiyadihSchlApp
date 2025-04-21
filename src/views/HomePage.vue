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

    <!-- Result Section -->
    <section class="results">
      <ResultCard />
    </section>

        <!-- Contact Section -->
    <section class="bottom-container">
      <div class="bottom-section">
        <div class="box important-links">
          <h2>Important Links</h2>
          <ul>
            <li><a href="#">Admission Info</a></li>
            <li><a href="#">Holiday List</a></li>
            <li><a href="#">Faculty Directory</a></li>
            <li><a href="#">Student Portal</a></li>
            <li><a href="#">Scholarships</a></li>
          </ul>
        </div>
        <div class="box contact-us">
          <h2>Contact Us</h2>
          <p>Vill: Pachhiyadih</p>
          <p>PO: Odhanpur, Dist: Nawada</p>
          <p>Bihar, 805123</p>
          <p>Phone: 1234567890</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ResultCard from "../components/ResultCard.vue";
import schoolImage from "../store/School1.jpg";
import resultIcon from "../assets/icons/result.png";
import notificationIcon from "../assets/icons/notification.png";
import bsebIcon from "../assets/icons/bseb.png";
import udiseIcon from "../assets/icons/udise.png";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default {
  name: "HomePage",
  components: {
    ResultCard,
  },
  data() {
    return {
      schoolImages: [schoolImage],
      newNotifications: [],
      quickLinks: [
        { text: "Results", url: "/results", icon: resultIcon },
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

.bottom-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.bottom-section {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  background-color: #f9fafb;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex-wrap: nowrap;
}

.links-section,
.contact-section {
  flex: 1 1 50%;
}

.links-section ul {
  padding: 0;
  list-style-type: none;
}

.links-section li {
  margin-bottom: 0.5rem;
}

.links-section a {
  text-decoration: none;
  color: #2563eb;
}

.links-section a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .bottom-section {
    flex-direction: column;
  }

  .links-section,
  .contact-section {
    flex: unset;
    width: 100%;
  }
}


@keyframes scroll-left {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>