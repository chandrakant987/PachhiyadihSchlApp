<template>
  <div class="upload-results">
    <h2>Upload Student Results (JSON)</h2>
    <h4>Select Class and Section for uploading the result</h4>

    <form class="form-section">
      <label>
        Class:
        <select v-model="selectedClass">
          <option value="Class_9">Class 9</option>
          <option value="Class_10">Class 10</option>
          <option value="Class_11">Class 11</option>
          <option value="Class_12">Class 12</option>
        </select>
      </label>

      <label>
        Section:
        <select v-model="selectedSection">
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </label>
    </form>

    <div class="upload-section">
      <input type="file" @change="handleFileUpload" accept=".json" />
      <button @click="uploadResults" :disabled="!jsonData">Upload</button>
    </div>

    <p v-if="uploadStatus" class="status-msg">{{ uploadStatus }}</p>
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
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upload-results h2 {
  margin-bottom: 10px;
  color: #333;
}

.upload-results h4 {
  margin-bottom: 20px;
  font-weight: 400;
  color: #666;
}

.form-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #444;
}

select {
  padding: 6px 10px;
  font-size: 14px;
  margin-top: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.upload-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: center;
}

input[type="file"] {
  font-size: 14px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status-msg {
  font-size: 14px;
  color: #555;
}
</style>