<template>
  <div class="container">
    <div class="card">
      <a href="/result-search" class="result-link">View Detailed Results</a>
    </div>
  </div>
  <!-- <div class="container">
    <div class="card">
      <div class="card-inner" :class="{ flipped: isFlipped }">
        <div class="card-front">
          <h2 class="result-heading" @click="flipCard">Result</h2>
          <a href="/result-search" class="result-link">View Detailed Results</a>
        </div>
        <div class="card-back">
          <div class="content">
            <div class="summary-header">
              <span>Class</span>
              <span>T.S.</span>
              <span>P</span>
              <span>F</span>
              <span>H.S.N.</span>
              <span>S</span>
            </div>
            <div v-for="(classSummary, className) in summary" :key="className" class="summary-row">
              <span>{{ className }}</span>
              <span>{{ classSummary.totalStudents }}</span>
              <span>{{ classSummary.passed }}</span>
              <span>{{ classSummary.failed }}</span>
              <span>{{ classSummary.highestScorer.name }}</span>
              <span>{{ classSummary.highestScorer.score }}</span>
            </div>
            <a href="/result-search" class="result-link">View Detailed Results</a>
          </div>
        </div>
      </div>
    </div>
  </div> -->
</template>
  
<script>
  import { getDatabase, ref, get, onValue } from "firebase/database";
  
  export default {
    data() {
      return {
        isFlipped: false,
        classes: {}, // Stores fetched class data
        summary: {}
      };
    },

    //async created() {
      //await this.fetchSummary();
    //},

    methods: {
      flipCard() {
        this.isFlipped = !this.isFlipped;
      },

      async fetchSummary() {
        const db = getDatabase();
        const classesRef =  ref(db, "results");
        //console.log(snapshot)
        try {
          const snapshot = await get(classesRef);
          this.classes = snapshot.val() || {};
          //console.log(this.classes)
          this.computeSummary();
        } catch (error) {
          console.error("Error fetching classes:", error);
        }
      },

      computeSummary() {
        const summary = {};

        for (const className in this.classes) {
          console.log("ClassName", className);
          const sections = this.classes[className];
          let totalStudents = 0;
          let passed = 0;
          let failed = 0;
          let highestScorer = { name: "", score: 0 };

          // Iterate through sections
          for (const sectionName in sections) {
            const students = sections[sectionName];

            // Iterate through students
            for (const rollNo in students) {
              const student = students[rollNo];
              totalStudents++;
              if (student.Result == "PASS") { // Adjust pass threshold as needed
                passed++;
              } else {
                failed++;
              }
              if (parseInt(student.AGGREGATE) > highestScorer.score) {
                console.log("AGGREGATE",student)
                highestScorer = { name: student.STUDENT_NAME, score: student.AGGREGATE };
              }
            }
          }

          // Store summary for this class
          //object[key] = value.
          summary[className.replace("Class_", "")] = { // Strip "Class_" for display
            totalStudents,
            passed,
            failed,
            highestScorer
          };
          console.log("Summary",summary)
        }

        this.summary = summary;
        console.log(this.summary);
      }
    }
  };
</script>


<style scoped>
  .container {
    width: 100%;
    padding: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card {
    position: relative;
    /*width: 90%;
    max-width: 280px;
    height: 180px;
    perspective: 1000px;*/
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease-in-out;
    transform-style: preserve-3d;
  }

  .card-inner.flipped {
    transform: rotateY(180deg);
  }

  .card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .card-front {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-back {
    transform: rotateY(180deg);
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .result-heading {
    width: 60px;
    height: 60px;
    background-color: #6a4b8e;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 18px;
    cursor: pointer;
    transition: transform 0.3s ease-in-out;
  }

  .result-heading:hover {
    transform: scale(1.05);
  }

  .content {
    color: #111;
    text-align: center;
    font-size: 12px;
    width: 100%;
  }

  .summary-header, .summary-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 2fr 1fr; /* Adjusted for H.S.N. */
    gap: 5px;
    padding: 5px 0;
  }

  .summary-header {
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    margin-bottom: 5px;
  }

  .summary-row span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .result-link {
    display: inline-block;
    margin-top: 8px;
    color: #6a4b8e;
    text-decoration: none;
    font-weight: 600;
    font-size: 12px;
    transition: color 0.3s ease-in-out;
  }

  .result-link:hover {
    color: #43345d;
  }

  @media (min-width: 481px) {
    .container {
      padding: 20px;
      max-width: 400px;
    }
    .card {
      max-width: 300px;
      /*height: 220px;*/
    }
    .result-heading {
      width: 80px;
      height: 80px;
      font-size: 22px;
    }
    .content {
      font-size: 13px;
    }
    .result-link {
      font-size: 13px;
    }
    .card-back {
      padding: 15px;
    }
  }
</style>
