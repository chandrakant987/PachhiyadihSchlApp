<template>
    <div class="result-card" @mouseover="showSummary = true" @mouseleave="showSummary = false" @click="openResultPage">
      <h3>Results</h3>
      <div v-if="showSummary" class="summary">
        <p><b>Total Students:</b> {{ summary.total }}</p>
        <p><b>Passed:</b> {{ summary.passed }}</p>
        <p><b>Failed:</b> {{ summary.failed }}</p>
        <p><b>Highest Marks:</b> {{ summary.highest }}</p>
      </div>
      <a href="#" class="view-result">Click to View Result</a>
    </div>
  </template>
  
  <script>
  import { getDatabase, ref, get } from "firebase/database";
  
  export default {
    data() {
      return {
        summary: { total: 0, passed: 0, failed: 0, highest: 0 },
        showSummary: false
      };
    },
    async created() {
      await this.fetchSummary();
    },
    methods: {
      async fetchSummary() {
        const db = getDatabase();
        const snapshot = await get(ref(db, "results/Class_9"));
        //console.log(snapshot)
        if (snapshot.exists()) {
          const results = snapshot.val();
          let total = Object.keys(results).length;
          let passed = 0,
            failed = 0,
            highest = 0;
  
          Object.values(results).forEach(student => {
            if (student.Result == "PASS") passed++;
            else failed++;
            if (student.AGGREGATE > highest) highest = student.AGGREGATE;
          });
  
          this.summary = { total, passed, failed, highest };
        }
      },
      openResultPage() {
        window.open("/result-search", "_blank"); // Opens result search page in new tab
      }
    }
  };
  </script>
  
  <style>
  .result-card {
    border: 1px solid #ccc;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: 0.3s;
    position: relative;
    background: white;
  }
  
  .result-card:hover {
    background-color: #f9f9f9;
  }
  
  .summary {
    position: absolute;
    width: 100%;
    background: #f4a42d;
    color: white;
    padding: 10px;
    top: 100%;
    left: 0;
    text-align: left;
  }
  
  .view-result {
    display: block;
    margin-top: 10px;
    color: blue;
    text-decoration: underline;
  }
  </style>
  