<template>
  <div class="main">
    <h2>Add/Update Classes</h2>
    <form @submit.prevent="createClasses">
      <div class="form-group">
        <label for="classSec">Class and Section</label>
        <select id="classSec" v-model="classSec" required aria-label="Select class and section">
          <option value="" disabled>Select a class</option>
          <option value="Class_9_A">9 A</option>
          <option value="Class_9_B">9 B</option>
          <option value="Class_10_A">10 A</option>
          <option value="Class_10_B">10 B</option>
          <option value="Class_11_A">11 A</option>
          <option value="Class_11_B">11 B</option>
          <option value="Class_12_A">12 A</option>
          <option value="Class_12_B">12 B</option>
        </select>
      </div>

      <div class="form-group">
        <label>Student IDs (From - To)</label>
        <div class="inline">
          <input
            type="number"
            v-model="studentIdFrom"
            placeholder="From"
            required
            aria-label="Student ID start range"
          />
          <input
            type="number"
            v-model="studentIdTo"
            placeholder="To"
            required
            aria-label="Student ID end range"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="teacherId">Teacher ID</label>
        <input
          id="teacherId"
          type="text"
          v-model="teacherId"
          placeholder="e.g., T123"
          required
          aria-label="Teacher ID"
        />
      </div>

      <div class="form-group">
        <label for="sessionYear">Session Year</label>
        <input
          id="sessionYear"
          type="text"
          v-model="sessionYear"
          placeholder="e.g., 2025-26"
          required
          pattern="\d{4}-\d{2}"
          aria-label="Session year (YYYY-YY)"
        />
      </div>

      <div class="button-group">
        <button type="submit">Save and Create</button>
        <button type="button" @click="clearForm">Clear</button>
      </div>
    </form>

    <Snackbar :message="snackbarMsg" :visible="showSnackbar" :type="snackbarType" />
  </div>
</template>

<script>
import { getFirestore, doc, setDoc } from "firebase/firestore";
import Snackbar from "./Snackbar.vue";

export default {
  components: { Snackbar },
  data() {
    return {
      classSec: "",
      studentIdFrom: "",
      studentIdTo: "",
      teacherId: "",
      sessionYear: "",
      snackbarMsg: "",
      showSnackbar: false,
      snackbarType: "error",
    };
  },
  methods: {
    async createClasses() {
      // Validate inputs
      if (!this.classSec) {
        this.showToast("Please select a class.", "error");
        return;
      }
      const from = parseInt(this.studentIdFrom);
      const to = parseInt(this.studentIdTo);
      if (isNaN(from) || isNaN(to) || from > to) {
        this.showToast("Invalid Student ID range.", "error");
        return;
      }
      if (!this.teacherId.trim()) {
        this.showToast("Teacher ID is required.", "error");
        return;
      }
      if (!/^\d{4}-\d{2}$/.test(this.sessionYear)) {
        this.showToast("Session Year must be in YYYY-YY format (e.g., 2025-26).", "error");
        return;
      }

      // Generate student IDs
      const studentIds = Array.from(
        { length: to - from + 1 },
        (_, i) => `S0${from + i}`
      );

      try {
        const db = getFirestore();
        await setDoc(doc(db, "Classes", this.classSec), {
          studentIds,
          teacherId: this.teacherId.trim(),
          sessionYear: this.sessionYear,
          classId: this.classSec,
        });
        this.showToast("Class created/updated successfully!", "success");
        this.clearForm();
      } catch (error) {
        console.error("Firestore error:", error);
        this.showToast(`Failed to save class: ${error.message}`, "error");
      }
    },
    clearForm() {
      this.classSec = "";
      this.studentIdFrom = "";
      this.studentIdTo = "";
      this.teacherId = "";
      this.sessionYear = "";
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
.main {
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

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  color: #1e3a8a;
  font-weight: 500;
  margin-bottom: 5px;
}

select,
input {
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

.inline {
  display: flex;
  gap: 10px;
}

.inline input {
  flex: 1;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
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

button[type="button"] {
  background: #64748b;
  color: #ffffff;
}

button[type="button"]:hover {
  background: #475569;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .main {
    padding: 10px;
    width: 100%;
  }

  h2 {
    font-size: 1.3rem;
  }

  select,
  input {
    padding: 6px;
    font-size: 0.85rem;
  }

  button {
    padding: 8px 16px;
  }
}
</style>