<template>
    <header class="navbar">
      <div class="navbar__container">
        <img :src="schooloLogo[0]" alt="School Logo" class="navbar__logo" />
        <h1 class="navbar__header">{{ schoolName }}</h1>
        <nav class="navbar__nav">
          <router-link to="/" class="navbar__link">Home</router-link>
          <router-link to="/admin" class="navbar__link">Admin</router-link>
        </nav>
        <button class="navbar__toggle" @click="toggleMenu">
          ☰
        </button>
      </div>
      <div v-if="menuOpen" class="navbar__mobile-menu">
        <router-link to="/" class="navbar__mobile-link" @click="toggleMenu">Home</router-link>
        <router-link to="/admin" class="navbar__mobile-link" @click="toggleMenu">Admin</router-link>
      </div>
    </header>
  </template>
  
  <script>
  import schlLogo from "../store/UHSPachhiyadihLogo.png"

  export default {
    data() {
      return {
        menuOpen: false,
        schoolName: 'उत्क्रमित उच्च माध्यमिक विद्यालय, पछियाडीह',
        schooloLogo: [schlLogo]
      };
    },
    methods: {
      toggleMenu() {
        this.menuOpen = !this.menuOpen;
      },
    },
  };
  </script>
  
  <style scoped>

  /* Base Styles */
  .navbar {
    background-color: #004080;
    color: white;
    padding: 0.5rem 1rem;
  }
  
  .navbar__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .navbar__logo {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    width:60px;
    height:60px;
  }

  .navbar__header {
    font-size: 3vw;
  }
  
  .navbar__nav {
    display: flex;
    gap: 1rem;
  }
  
  .navbar__link {
    color: white;
    text-decoration: none;
    font-weight: 500;
  }
  
  .navbar__link:hover {
    text-decoration: underline;
  }
  
  .navbar__toggle {
    display: none;
    font-size: 1.5rem;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
  }
  
  /* Mobile Menu */
  .navbar__mobile-menu {
    display: none;
    flex-direction: column;
    background-color: #003366;
    padding: 1rem;
  }
  
  .navbar__mobile-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 0;
    border-bottom: 1px solid #ccc;
  }
  
  .navbar__mobile-link:hover {
    text-decoration: underline;
  }
  
  /* Responsive */
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
  