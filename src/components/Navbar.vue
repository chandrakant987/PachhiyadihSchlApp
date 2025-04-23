<template>
  <header class="navbar">
    <div class="navbar__container">
      <img :src="schooloLogo[0]" alt="School Logo" class="navbar__logo" />
      <h1 class="navbar__header">{{ schoolName }}</h1>
      
      <nav class="navbar__nav">
        <router-link to="/" class="navbar__link">Home</router-link>
        <router-link to="/holiday-list" class="navbar__link">Holiday List</router-link>
        <router-link to="/results" class="navbar__link">Results</router-link>

        <!-- Role-based links -->
        <router-link v-if="userRole === 'admin'" to="/admin" class="navbar__link">Admin</router-link>
        <router-link v-if="userRole === 'teacher'" to="/teacher" class="navbar__link">Teacher</router-link>
        <router-link v-if="userRole === 'student'" to="/student" class="navbar__link">Student</router-link>

        <!-- Auth buttons -->
        <button v-if="userRole" @click="logout" class="navbar__link btn-link">Logout</button>
        <button v-else @click="$emit('show-signin')" class="navbar__link btn-link">Sign In</button>
      </nav>

      <button class="navbar__toggle" @click="toggleMenu">☰</button>
    </div>

    <div v-if="menuOpen" class="navbar__mobile-menu">
      <router-link to="/" class="navbar__mobile-link" @click="toggleMenu">Home</router-link>
      <router-link to="/holiday-list" class="navbar__mobile-link" @click="toggleMenu">Holiday List</router-link>
      <router-link to="/results" class="navbar__mobile-link" @click="toggleMenu">Results</router-link>
      
      <router-link v-if="userRole === 'admin'" to="/admin" class="navbar__mobile-link" @click="toggleMenu">Admin</router-link>
      <router-link v-if="userRole === 'teacher'" to="/teacher" class="navbar__mobile-link" @click="toggleMenu">Teacher</router-link>
      <router-link v-if="userRole === 'student'" to="/student" class="navbar__mobile-link" @click="toggleMenu">Student</router-link>

      <button v-if="userRole" @click="logout" class="navbar__mobile-link btn-link">Logout</button>
      <button v-else @click="$emit('show-signin')" class="navbar__mobile-link btn-link">Sign In</button>
    </div>
  </header>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import schlLogo from "../store/UHSPachhiyadihLogo.png";

export default {
  data() {
    return {
      menuOpen: false,
      userRole: null,
      schoolName: 'उत्क्रमित उच्च माध्यमिक विद्यालय, पछियाडीह',
      schooloLogo: [schlLogo]
    };
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore();
        const docSnap = await getDoc(doc(db, "Users", user.uid));
        this.userRole = docSnap.exists() ? docSnap.data().role : null;
      } else {
        this.userRole = null;
      }
    });
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    async logout() {
      const auth = getAuth();
      await signOut(auth);
      this.userRole = null;
      this.$router.push("/");
    }
  }
};
</script>

<style scoped>
/* Keep your existing styles, just tweak as needed */
.navbar__link.btn-link {
  background: none;
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.navbar__link.btn-link:hover {
  text-decoration: underline;
}

.navbar {
  background-color: #1f2937;
  color: white;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.navbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.navbar__logo {
  width: 60px;
  height: 60px;
}

.navbar__header {
  font-size: 1.5rem;
  margin-left: 0.5rem;
  color: #facc15;
  flex-grow: 1;
}

.navbar__nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.navbar__link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.navbar__link:hover {
  color: #facc15;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: white;
}

.logout-btn:hover {
  color: #facc15;
}

.navbar__toggle {
  display: none;
  font-size: 1.5rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* Mobile Styles */
.navbar__mobile-menu {
  display: none;
  flex-direction: column;
  background-color: #111827;
  padding: 1rem;
}

.navbar__mobile-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0;
  border-bottom: 1px solid #4b5563;
}

.navbar__mobile-link:hover {
  color: #facc15;
}

@media (max-width: 768px) {
  .navbar__nav {
    display: none;
  }
  .navbar__toggle {
    display: block;
  }
  .navbar__mobile-menu {
    display: flex;
  }
}
</style>


<!-- 
<style scoped>
.navbar {
  background: linear-gradient(to right, #1e3a8a, #1e40af);
  color: #ffffff;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  object-fit: cover;
}

.school-name {
  font-size: 1.8rem;
  font-weight: 600;
  color: #facc15;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  transition: color 0.3s ease;
}

.link::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 0%;
  height: 2px;
  background-color: #facc15;
  transition: width 0.3s ease;
}

.link:hover {
  color: #facc15;
}

.link:hover::after {
  width: 100%;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.6rem;
  color: white;
  cursor: pointer;
}

/* Mobile */
.mobile-menu {
  background-color: #1e40af;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.75rem;
}

.mobile-link {
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  border-bottom: 1px solid #3b82f6;
  padding-bottom: 0.5rem;
}

.mobile-link:hover {
  color: #facc15;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .menu-toggle {
    display: block;
  }

  .school-name {
    font-size: 1rem;
  }

  .logo {
    width: 40px;
    height: 40px;
  }
}
</style> -->
