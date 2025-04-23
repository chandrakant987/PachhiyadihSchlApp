<template>
  <div class="admin">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <h1>Admin Dashboard</h1>
      </div>
      <p class="subtitle">Manage school operations efficiently</p>
    </header>

    <!-- Mobile Tab Bar -->
    <nav class="tab-bar" v-if="isMobile">
      <button
        class="tab"
        :class="{ active: selectedComponent === 'UploadResults' }"
        @click="selectComponent('UploadResults')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="#facc15">
          <path d="M12 2L12 12L18 12L16 14L12 10L8 14L6 12L12 12L12 2M4 6H20V18H4V6Z"/>
        </svg>
        Results
      </button>
      <button
        class="tab"
        :class="{ active: selectedComponent === 'UpdateClassesColl' }"
        @click="selectComponent('UpdateClassesColl')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="#facc15">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M10 17L6 13L7.4 11.6L10 14.2L16.6 7.6L18 9L10 17Z"/>
        </svg>
        Classes
      </button>
      <button
        class="tab"
        :class="{ active: selectedComponent === 'AddNotifications' }"
        @click="selectComponent('AddNotifications')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="#facc15">
          <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22M18 16V11C18 7.9 16.4 5.4 13.7 4.4C13.4 3.6 12.7 3 12 3C11.3 3 10.6 3.6 10.3 4.4C7.6 5.4 6 7.9 6 11V16L4 18V19H20V18L18 16Z"/>
        </svg>
        Notifications
      </button>
      <button
        class="tab"
        :class="{ active: selectedComponent === 'AddStudentsColl' }"
        @click="selectComponent('AddStudentsColl')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="#facc15">
          <path d="M16 11C17.7 11 19 9.7 19 8C19 6.3 17.7 5 16 5C14.3 5 13 6.3 13 8C13 9.7 14.3 11 16 11M8 11C9.7 11 11 9.7 11 8C11 6.3 9.7 5 8 5C6.3 5 5 6.3 5 8C5 9.7 6.3 11 8 11M8 13C5.3 13 0 14.3 0 17V19H16V17C16 14.3 10.7 13 8 13M16 13C15.1 13 14.2 13.1 13.3 13.3C14.5 14.2 16 15.5 16 17V19H24V17C24 14.3 18.7 13 16 13Z"/>
        </svg>
        Students
      </button>
    </nav>

    <!-- Main Layout -->
    <div class="dashboard-layout">
      <!-- Sidebar (Desktop Only) -->
      <aside class="sidebar" v-if="!isMobile">
        <h2>Management Tools</h2>
        <div class="sidebar-cards">
          <div
            class="sidebar-card"
            :class="{ active: selectedComponent === 'UploadResults' }"
            @click="selectComponent('UploadResults')"
          >
            <svg class="card-icon" viewBox="0 0 24 24" fill="#1e3a8a">
              <path d="M12 2L12 12L18 12L16 14L12 10L8 14L6 12L12 12L12 2M4 6H20V18H4V6Z"/>
            </svg>
            <span>Upload Results</span>
          </div>
          <div
            class="sidebar-card"
            :class="{ active: selectedComponent === 'UpdateClassesColl' }"
            @click="selectComponent('UpdateClassesColl')"
          >
            <svg class="card-icon" viewBox="0 0 24 24" fill="#1e3a8a">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M10 17L6 13L7.4 11.6L10 14.2L16.6 7.6L18 9L10 17Z"/>
            </svg>
            <span>Manage Classes & Sections</span>
          </div>
          <div
            class="sidebar-card"
            :class="{ active: selectedComponent === 'AddNotifications' }"
            @click="selectComponent('AddNotifications')"
          >
            <svg class="card-icon" viewBox="0 0 24 24" fill="#1e3a8a">
              <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22M18 16V11C18 7.9 16.4 5.4 13.7 4.4C13.4 3.6 12.7 3 12 3C11.3 3 10.6 3.6 10.3 4.4C7.6 5.4 6 7.9 6 11V16L4 18V19H20V18L18 16Z"/>
            </svg>
            <span>Add Notifications</span>
          </div>
          <div
            class="sidebar-card"
            :class="{ active: selectedComponent === 'AddStudentsColl' }"
            @click="selectComponent('AddStudentsColl')"
          >
            <svg class="card-icon" viewBox="0 0 24 24" fill="#1e3a8a">
              <path d="M16 11C17.7 11 19 9.7 19 8C19 6.3 17.7 5 16 5C14.3 5 13 6.3 13 8C13 9.7 14.3 11 16 11M8 11C9.7 11 11 9.7 11 8C11 6.3 9.7 5 8 5C6.3 5 5 6.3 5 8C5 9.7 6.3 11 8 11M8 13C5.3 13 0 14.3 0 17V19H16V17C16 14.3 10.7 13 8 13M16 13C15.1 13 14.2 13.1 13.3 13.3C14.5 14.2 16 15.5 16 17V19H24V17C24 14.3 18.7 13 16 13Z"/>
            </svg>
            <span>Add Students</span>
          </div>
        </div>
      </aside>

      <!-- Content Area -->
      <main class="content-area" :class="{ 'full-width': isMobile }">
        <transition name="fade" mode="out-in">
          <component :is="selectedComponent" />
        </transition>
      </main>
    </div>

    <!-- Quick Links -->
    <section class="quick-links">
      <h2>Quick Links</h2>
      <div class="links-grid">
        <a href="/mark-attendance" class="link-card">
          <svg class="link-icon" viewBox="0 0 24 24" fill="#facc15">
            <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z"/>
          </svg>
          <span>Mark Attendance</span>
        </a>
        <a href="/attendance-dashboard" class="link-card">
          <svg class="link-icon" viewBox="0 0 24 24" fill="#facc15">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M10 17L6 13L7.4 11.6L10 14.2L16.6 7.6L18 9L10 17Z"/>
          </svg>
          <span>Attendance Dashboard</span>
        </a>
        <a href="/holiday-management" class="link-card">
          <svg class="link-icon" viewBox="0 0 24 24" fill="#facc15">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M17 12H12V17H10V12H5V10H10V5H12V10H17V12Z"/>
          </svg>
          <span>Manage Holidays</span>
        </a>
      </div>
    </section>
  </div>
</template>

<script>
import UploadResults from "../components/UploadResults.vue";
import UpdateClassesColl from "../components/UpdateClassesColl.vue";
import AddNotifications from "../components/AddNotifications.vue";
import AddStudentsColl from "../components/AddStudentsColl.vue";

export default {
  components: { UploadResults, UpdateClassesColl, AddNotifications, AddStudentsColl },
  data() {
    return {
      selectedComponent: "UploadResults", // Default component
      isMobile: false, // Mobile state
    };
  },
  methods: {
    selectComponent(component) {
      this.selectedComponent = component;
      console.log("Selected component:", component); // Debug log
    },
    updateMobileState() {
      this.isMobile = window.matchMedia("(max-width: 768px)").matches;
      console.log("isMobile updated:", this.isMobile); // Debug log
    },
    manageStudents() {
      alert("Navigating to student management");
    },
    manageTeachers() {
      alert("Navigating to teacher management");
    },
    updateNews() {
      alert("Navigating to news update section");
    },
  },
  mounted() {
    // Initial check
    this.updateMobileState();
    console.log("Mounted, isMobile:", this.isMobile); // Debug log
    // Update on resize with debounce
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.updateMobileState();
      }, 100);
    });
  },
};
</script>

<style scoped>
.admin {
  padding: 10px; /* Reduced padding for mobile */
  background: #f7fafc;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

/* Header */
.admin-header {
  text-align: center;
  margin-bottom: 15px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header h1 {
  font-size: 1.8rem;
  color: #1e3a8a;
  margin: 0;
}

.subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 5px;
}

/* Mobile Tab Bar */
.tab-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  gap: 8px;
}

.tab {
  flex: 1;
  min-width: 80px;
  max-width: calc(50% - 8px);
  padding: 10px;
  font-size: 0.85rem;
  color: #1e3a8a;
  background: #f8fafc;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 48px;
  border-radius: 6px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.tab.active {
  background: linear-gradient(to right, #1e3a8a, #1e40af);
  color: #facc15;
}

.tab:hover {
  background: #e6f0ff;
  transform: scale(1.05);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

/* Sidebar (Desktop) */
.sidebar {
  width: 35%;
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar h2 {
  font-size: 1.4rem;
  color: #1e3a8a;
  margin-bottom: 15px;
}

.sidebar-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-card {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e3a8a;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background 0.2s ease, transform 0.2s ease;
  min-height: 48px;
}

.sidebar-card:hover {
  background: #e6f0ff;
  transform: translateY(-2px);
}

.sidebar-card.active {
  background: linear-gradient(to right, #1e3a8a, #1e40af);
  color: #facc15;
}

.card-icon {
  width: 20px;
  height: 20px;
}

/* Content Area */
.content-area {
  width: 65%;
  background: #ffffff;
  padding: 10px; /* Reduced padding for mobile */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  overflow-x: hidden;
}

.content-area.full-width {
  width: calc(100% - 20px); /* Account for .admin padding */
}

/* Ensure component content fits */
.content-area > * {
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
}

/* Transition Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Quick Links */
.quick-links {
  margin-bottom: 30px;
}

.quick-links h2 {
  font-size: 1.5rem;
  color: #1e3a8a;
  text-align: center;
  margin-bottom: 15px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.link-card {
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  text-decoration: none;
  color: #1e3a8a;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 100px;
}

.link-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.link-icon {
  width: 24px;
  height: 24px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .admin {
    padding: 10px;
  }

  .admin-header h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .dashboard-layout {
    flex-direction: column;
  }

  .content-area {
    padding: 10px;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }

  .link-card {
    padding: 12px;
    min-height: 80px;
  }
}

/* Desktop Styles */
@media (min-width: 769px) {
  .tab-bar {
    display: none;
  }
}
</style>

<!-- Global styles for component children -->
<style>
.content-area * {
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.content-area table,
.content-area img,
.content-area div,
.content-area input,
.content-area textarea {
  max-width: 100% !important;
  width: auto !important;
  overflow-x: auto;
}
</style>