<template>
    <div class="upload-results">
      <h2>Upload Student Results (JSON)</h2>
      <h4>Select Class and Section for uploading the result</h4>
      <form>
        <label>Class:
          <select v-model="selectedClass">
            <option value="Class_9">Class 9</option>
            <option value="Class_10">Class 10</option>
            <option value="Class_11">Class 11</option>
            <option value="Class_12">Class 12</option>
          </select>
        </label>
        <label>Section:
          <select v-model="selectedSection">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="B">C</option>
          </select>
        </label>
      </form>

      <input type="file" @change="handleFileUpload" accept=".json" />
      <button @click="uploadResults" :disabled="!jsonData">Upload</button>
      <p v-if="uploadStatus">{{ uploadStatus }}</p>
    </div>
  </template>
  
  <script>
  import { getDatabase, ref, set } from "firebase/database";
  //import { initializeApp } from "firebase/app";
  import firebase from "../firebase/firebase"; // assumes you have your Firebase config here
  
  const {app} = firebase
  const db = getDatabase(app);
  
  export default {
    data() {
      return {
        jsonData: null,
        uploadStatus: "",
        selectedClass: "Class_9",
        selectedSection: "A"
      };
    },
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            this.jsonData = JSON.parse(e.target.result);
            this.uploadStatus = "File loaded successfully.";
          } catch (err) {
            this.uploadStatus = "Invalid JSON file.";
          }
        };
        reader.readAsText(file);
      },
      async uploadResults() {
        if (!this.jsonData) return;
  
        try { 
            for (let student of this.jsonData) {
                await new Promise(resolve => setTimeout(resolve, 100)); // Delay of 100ms
                set(ref(db, `results/${this.selectedClass}/${this.selectedSection}/${student.Roll_No}`), student)
                    .then(() => console.log(`Uploaded Roll No: ${student.Roll_No}`))
                    .catch(error => console.error("Error:", error));
  }
            /*
            for (const className in this.jsonData) {
                const classRef = ref(db, `results/Class_9/${this.jsonData[className].Roll_No}`);
                await set(classRef, this.jsonData[className]);
            }
            this.uploadStatus = "Results uploaded to Realtime Database.";
            */
        } catch (error) {
          console.error("Error uploading results:", error);
          this.uploadStatus = "Error uploading results.";
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .upload-results {
    border: 1px solid #ccc;
    padding: 20px;
    margin-top: 20px;
    background: #f9f9f9;
  }
  .upload-results input[type="file"] {
    margin-bottom: 10px;
  }
  .upload-results button {
    padding: 5px 10px;
    background: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }
  .upload-results p {
    margin-top: 10px;
  }
  </style>