<template>
  <div class="upload-results">
    <h2>Upload Student Results (JSON)</h2>
    <form @submit.prevent="uploadResults" class="form-section">
      <div class="form-group">
        <label for="classSelect">Class</label>
        <select id="classSelect" v-model="selectedClass" required aria-label="Select class">
          <option value="" disabled>Select a class</option>
          <option value="Class_9">Class 9</option>
          <option value="Class_10">Class 10</option>
          <option value="Class_11">Class 11</option>
          <option value="Class_12">Class 12</option>
        </select>
      </div>

      <div class="form-group">
        <label for="sectionSelect">Section</label>
        <select id="sectionSelect" v-model="selectedSection" required aria-label="Select section">
          <option value="" disabled>Select a section</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      <div class="form-group">
        <label for="fileUpload">JSON File</label>
        <input
          id="fileUpload"
          type="file"
          @change="handleFileUpload"
          accept=".json"
          ref="fileInput"
          required
          aria-label="Upload JSON results file"
        />
      </div>

      <div class="button-group">
        <button type="submit" :disabled="!jsonData">Upload</button>
        <button type="button" @click="clearForm">Clear</button>
      </div>
    </form>

    <Snackbar :message="snackbarMsg" :visible="showSnackbar" :type="snackbarType" />
  </div>
</template>

<script>
import { getDatabase, ref, set } from "firebase/database";
import firebase from "../firebase/firebase";
import Snackbar from "./Snackbar.vue";

const { app } = firebase;
const db = getDatabase(app);

export default {
  components: { Snackbar },
  data() {
    return {
      jsonData: null,
      selectedClass: "",
      selectedSection: "",
      snackbarMsg: "",
      showSnackbar: false,
      snackbarType: "error",
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          // Validate JSON structure
          if (!Array.isArray(data) || !data.every((item) => item.Roll_No)) {
            throw new Error("JSON must be an array with Roll_No for each student.");
          }
          this.jsonData = data;
          this.showToast("File loaded successfully.", "success");
        } catch (err) {
          this.jsonData = null;
          this.showToast(`Invalid JSON file: ${err.message}`, "error");
        }
      };
      reader.readAsText(file);
    },
    async uploadResults() {
      if (!this.jsonData) {
        this.showToast("Please upload a valid JSON file.", "error");
        return;
      }
      if (!this.selectedClass || !this.selectedSection) {
        this.showToast("Please select both class and section.", "error");
        return;
      }

      try {
        // Batch uploads for performance
        const updates = {};
        for (const student of this.jsonData) {
          const path = `results/${this.selectedClass}/${this.selectedSection}/${student.Roll_No}`;
          updates[path] = student;
        }

        // Use a single write for all updates
        for (const [path, value] of Object.entries(updates)) {
          await set(ref(db, path), value);
          console.log(`Uploaded Roll No: ${path.split("/").pop()}`);
        }

        this.showToast("Results uploaded successfully!", "success");
        this.clearForm();
      } catch (error) {
        console.error("Error uploading results:", error);
        this.showToast(`Error uploading results: ${error.message}`, "error");
      }
    },
    clearForm() {
      this.jsonData = null;
      this.selectedClass = "";
      this.selectedSection = "";
      this.$refs.fileInput.value = ""; // Clear file input
      this.showToast("Form cleared.", "info");
    },
    showToast(msg, type = "error") {
      this.snackbarMsg = msg;
      this.snackbarType = type;
      this.showSnackbar = true;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 3000);
    },
  },
};
</script>

<style scoped>
.upload-results {
  width: 95%;
  max-width: 600px;
  margin: 15px auto;
  padding: 15px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: hidden; /* Prevent horizontal scrollbars */
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #1e3a8a;
  font-size: 1.5rem;
}

.form-section {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: space-between;
}

.form-group {
  flex: 1;
  min-width: 150px;
}

label {
  display: block;
  color: #1e3a8a;
  font-weight: 500;
  margin-bottom: 5px;
}

select,
input[type="file"] {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.9rem;
  color: #333;
}

select:focus,
input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 4px rgba(30, 64, 175, 0.3);
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
  overflow: hidden; /* Prevent scrollbars from button scaling */
  padding: 5px; /* Extra padding for scaled buttons */
}

button {
  padding: 10px 20px;
  background: linear-gradient(to right, #1e3a8a, #1e40af);
  color: #facc15;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  will-change: transform; /* Optimize animation performance */
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

button:disabled {
  background: #64748b;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

button[type="button"] {
  background: #64748b;
  color: #ffffff;
}

button[type="button"]:hover {
  background: #475569;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .upload-results {
    padding: 10px;
    width: 100%;
  }

  h2 {
    font-size: 1.3rem;
  }

  .form-group {
    min-width: 100%;
  }

  select,
  input[type="file"] {
    padding: 6px;
    font-size: 0.85rem;
  }

  button {
    padding: 8px 16px;
  }
}
</style>