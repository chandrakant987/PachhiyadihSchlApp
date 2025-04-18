// views/HomePage.vue
<template>
  <div>
    <div class="homepage">
      <!-- School Name -->
      <!-- <nav class="school-header">
        <h1>{{ schoolName }}</h1>
      </nav> -->

      <!-- School Image -->
      <section class="image-section">
        <img :src="schoolImages[0]" alt="School Image" class="school-image" />
      </section>
    </div>
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
    
    <div class="cards">
      <ResultCard />
    </div>

    <a href="/view-notifications" class="result-link">View All Notifications</a>
    
    <section class='contact'>
      <h2>Contact Us</h2>
      <p>Address: Vill- Pachhiyadih</p>
        <p>PO: Odhanpur, Dist: Nawada</p>
        <p>Bihar, 805123</p> 
      <p>Phone: 1234567890</p>
    </section>
  </div>
</template>

<script>
import Card from "../components/Card.vue";
import ResultCard from "../components/ResultCard.vue";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import schoolImage from "../store/School1.jpg";

export default {
  name: 'HomePage',

  components: {
    Card,
    ResultCard,
  },
  data() {
    return {
      schoolName: 'उत्क्रमित उच्च माध्यमिक विद्यालय, पछियाडीह',
      schoolImages: [schoolImage],
      newNotifications: [],
    };
  },
  
  methods: {
    checkResult() {
      this.result = `Result for Roll No: ${this.rollNumber}, Reg No: ${this.registrationNumber}`;
    },

    markNew(notifications) {
      const now = new Date();
      return notifications
        .map((notif, index) => {
          const notifDate = notif.timestamp?.toDate?.();
          const isRecent =
            notifDate &&
            (now - notifDate < 5 * 24 * 60 * 60 * 1000 || index < 3);
          return { ...notif, isNew: isRecent };
        })
        .filter((n) => n.isNew);
    },
    fetchNotifications() {
      const db = getFirestore();
      const q = query(
        collection(db, "Notifications"),
        orderBy("timestamp", "desc")
      );

      onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
/* For School Name and Image */
.homepage {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.school-header {
  background-color: #004080;
  color: #fff;
  width: 100%;
  text-align: center;
  padding: 1.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.school-header h1 {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  word-break: break-word;
}

.image-section {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 1000px;
  padding: 0 1rem;
}

.school-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .school-header h1 {
    font-size: 1.2rem;
  }

  .school-image {
    max-height: 300px;
  }
}

/*New Notification*/
.news {
  background-color: #f3f4f6;
  padding: 0.5rem;
  overflow: hidden;
  font-size: 1rem;
  color: #1f2937;
  font-weight: 500;
  position: relative;
}

.ticker-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.ticker {
  white-space: nowrap;
  display: inline-block;
  animation: scroll-left 20s linear infinite;
}

.ticker-content {
  display: inline-block;
  padding-left: 100%;
}

.ticker-content span {
  margin-right: 2rem;
  color: #e53e3e;
  font-weight: bold;
}

.ticker-placeholder {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

/* Animation */
@keyframes scroll-left {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
