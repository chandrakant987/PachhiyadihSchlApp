<template>
    <div class="results-page">
  
      <!-- Back Button -->
      <div class="back-button">
        <router-link
          :to="{ name: 'StudentPage', query: { studentId: $route.query.studentId, className: $route.query.className } }"
          class="back-link"
        >
          Back to Dashboard
        </router-link>
      </div>

      <!-- Title -->
      <h1 class="section-title">View Results for {{ studentName }}</h1>
  
      <!-- Results Section -->
      <div class="results-section">
        <p class="section-description">Check your academic results and performance.</p>
        <router-link :to="{ name: 'ResultSearch', query: { studentId: studentId, className: className }}" class="results-button">Go to Results</router-link>
      </div>
    </div>
  </template>
  
  <script>
  import { getFirestore, doc, getDoc } from 'firebase/firestore';
  
  export default {
    name: 'StudentResults',
    data() {
      return {
        studentId: '',
        className: '',
        studentName: '',
      };
    },
    methods: {
      async fetchStudentDetails() {
        const db = getFirestore();
        const studentDoc = await getDoc(doc(db, 'Students', this.studentId));
        if (studentDoc.exists()) {
          this.studentName = studentDoc.data().name;
        }
      },
    },
    mounted() {
      this.studentId = this.$route.query.studentId || '';
      this.className = this.$route.query.className || '';
      if (this.studentId) {
        this.fetchStudentDetails();
      }
    },
  };
  </script>
  
  <style scoped>
  .results-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .back-button {
    margin-bottom: 1rem;
  }

  .back-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #6b7280;
    color: #fff;
    border-radius: 0.375rem;
    text-decoration: none;
  }
  
  .back-link:hover {
    background-color: #4b5563;
  }

  .section-title {
    font-size: 1.5rem; /* 24px */
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .results-section {
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
    padding: 1.5rem;
  }
  
  .section-description {
    color: #6b7280;
    margin-bottom: 1rem;
  }
  
  .results-button {
    display: inline-block;
    background-color: #8b5cf6; /* Purple */
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  
  .results-button:hover {
    background-color: #7c3aed;
  }
  </style>