<template>
<div class="main">
  <h2>Add/Update Classes</h2>
  <label>
    Choose correct class and Section
    <select v-model="classSec">
      <option value="Class_9_A">9 A</option>
      <option value="Class_9_B">9 B</option>
      <option value="Class_10_A">10 A</option>
      <option value="Class_10_B">10 B</option>
      <option value="Class_11_A">11 A</option>
      <option value="Class_11_B">11 B</option>
      <option value="Class_12_A">12 A</option>
      <option value="Class_12_B">12 B</option>
    </select>
  </label>

  <label>
    Student Ids (From - To)
    <div class="inline">
      <input type="text" v-model="studentIdFrom" placeholder="From">
      <input type="text" v-model="studentIdTo" placeholder="To">
    </div>
  </label>

  <label>
    Teacher Id
    <input type="text" v-model="teacherId" placeholder="Teacher Id">
  </label>

  <label>
    Session Year
    <input type="text" v-model="sessionYear" placeholder="e.g. 2025-26">
  </label>

  <button @click="createClasses">Save and Create</button>
  <Snackbar :message="snackbarMsg" :visible="showSnackbar" :type="snackbarType" />

  <div class="summary">
    Selected Class: {{ classSec }} <br>
    Student IDs: {{ studentIdFrom }} to {{ studentIdTo }} <br>
    Teacher ID: {{ teacherId }} <br>
    Session Year: {{ sessionYear }}
  </div>
</div>
</template>

<script>

import { getFirestore, doc, setDoc } from "firebase/firestore";
import Snackbar from './Snackbar.vue';

export default {
  components: {
    Snackbar
  },
  data() {
    return {
      classSec: '',
      studentIdFrom: '',
      studentIdTo: '',
      teacherId: '',
      sessionYear: '',
      snackbarMsg: '',
      showSnackbar: false,
      snackbarType: 'error'  // Default type is 'error'
    };
  },
  methods: {
    async createClasses() {
      const db = getFirestore();
      const from = parseInt(this.studentIdFrom);
      const to = parseInt(this.studentIdTo);

      if (isNaN(from) || isNaN(to) || from > to) {
        this.snackbarType = 'error'; 
        this.showToast("Invalid Student ID range");
        return;
      }

      const studentIds = [];
      for (let i = from; i <= to; i++) {
        let stdId = "S0"+i
        studentIds.push(stdId);
      }

      try {
        await setDoc(doc(db, "Classes", this.classSec), {
          studentIds: studentIds,
          teacherId: this.teacherId,
          sessionYear: this.sessionYear
        });
        this.snackbarType = 'success';
        this.showToast("Class created/updated successfully!");
      } catch (error) {
        console.error("Error writing document: ", error);
        this.snackbarType = 'error';
        this.showToast("Failed to save class data.");
      }
    },

    showToast(msg) {
      this.snackbarMsg = msg;
      this.showSnackbar = true;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 3000); // hides after 3s
    }
  }
};
</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.main {
  max-width: 400px;
  margin: 20px auto;
  font-family: sans-serif;
  font-size: 14px;
}

label {
  display: block;
  margin-bottom: 15px;
}

select, input {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  box-sizing: border-box;
}

.inline {
  display: flex;
  gap: 10px;
}

.inline input {
  flex: 1;
}

button {
  padding: 8px 12px;
  margin-top: 10px;
  background: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background: #0056b3;
}

</style>