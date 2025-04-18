<template>
  <div class="container">
    <header>
      <label for="day">Day:</label>
      <select v-model="day" id="day">
        <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
      </select>
      <label for="month">Month:</label>
      <select v-model="month" id="month">
        <option v-for="(m, i) in months" :key="m" :value="i + 1">
          {{ m }}
        </option>
      </select>
      <label for="year">Year:</label>
      <select v-model="year" id="year">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <label for="class">Class:</label>
      <select v-model="classId" id="class">
        <option value="Class_9_A">Class 9A</option>
        <option value="Class_9_B">Class 9B</option>
      </select>
      
    </header>

    <div class="sticky-container">
      <div class="present-count">{{ presentCount }}</div>
      <div class="present-list">Present: {{ presentList }}</div>
    </div>
    
    <main id="attendance-grid">
      <div
        v-for="student in students"
        :key="student.studentId"
        class="card"
        :class="{ present: attendanceState[student.studentId]?.status === 'P' }"
        @click="toggleAttendance(student.studentId)"
      >
        {{ student.rollNumber }}
      </div>
    </main>

    <footer>
      <button @click="reset">Reset</button>
      <button @click="submit">Submit</button>
    </footer>

    <div class="toast" :class="{ show: showToast }">{{ toastMessage }}</div>
  </div>
</template>

<script>
import { getDatabase, ref as dbRef, get } from "firebase/database";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";

export default {
  name: "Attendance",
  data() {
    const today = new Date(); // April 10, 2025
    return {
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      classId: "Class_9_A",
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      years: Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i),
      students: Array.from({ length: 50 }, (_, i) => ({
        studentId: `S${String(i + 1).padStart(3, "0")}`,
        rollNumber: String(i + 1),
      })),
      attendanceState: {},
      showToast: false,
      toastMessage: "",
    };
  },
  computed: {
    presentCount() {
      return Object.values(this.attendanceState).filter((s) => s.status === "P")
        .length;
    },
    presentList() {
      return this.students
        .filter((s) => this.attendanceState[s.studentId]?.status === "P")
        .map((s) => s.rollNumber)
        .join(", ");
    },
    selectedDate() {
      return new Date(this.year, this.month - 1, this.day);
    },
  },
  methods: {
    async loadAttendance() {
      const db = getDatabase();
      const q = query(
        collection(db, "AttendanceRecords"),
        where("classId", "==", this.classId),
        where("date", "==", this.selectedDate.getTime() / 1000) // Convert to seconds
      );
      const snapshot = await getDocs(q);
      this.attendanceState = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        this.attendanceState[data.studentId] = {
          status: data.status,
          docId: doc.id,
        };
      });
    },
    toggleAttendance(studentId) {
      const currentState = this.attendanceState[studentId] || {
        status: "A",
        docId: null,
      };
      const newStatus = currentState.status === "P" ? "A" : "P";
      this.attendanceState[studentId] = {
        status: newStatus,
        docId: currentState.docId,
      };
      this.$forceUpdate(); // Trigger re-render
    },
    reset() {
      this.attendanceState = {};
    },
    async submit() {
      const batch = [];
      this.students.forEach((student) => {
        const state = this.attendanceState[student.studentId] || {
          status: "A",
          docId: null,
        };
        const docRef = state.docId
          ? doc(db, "AttendanceRecords", state.docId)
          : doc(collection(db, "AttendanceRecords"));
        batch.push(
          setDoc(
            docRef,
            {
              classId: this.classId,
              studentId: student.studentId,
              date: this.selectedDate.getTime() / 1000,
              status: state.status,
            },
            { merge: true }
          )
        );
      });

      try {
        await Promise.all(batch);
        this.showToastMessage("Attendance saved");
        await this.loadAttendance();
      } catch (e) {
        this.showToastMessage("Error saving attendance");
        console.error(e);
      }
    },
    showToastMessage(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => (this.showToast = false), 2000);
    },
  },
  watch: {
    classId: "loadAttendance",
    selectedDate: "loadAttendance",
  },
  mounted() {
    this.loadAttendance();
  },
};
//.present-count { position: fixed; top: 20px; right: 20px; width: 30px; height: 30px; background-color: #0f770f; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
</script>

<style scoped>
.container { max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; }
header { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 10px; }
header label { margin-right: 5px; }
header select { padding: 5px; }
.sticky-container {position: sticky; top: 0; display: flex; justify-items: stretch;}
.present-count {  width: 30px; height: 30px; background-color: #0f770f; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.present-list {  background-color: #E0E0E0; padding: 5px 10px; border-radius: 5px; margin-bottom: 10px; overflow-x: auto; white-space: nowrap; z-index: 1; }
main { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; max-height: 60vh; overflow-y: auto; overflow-x: hidden; width: 100%; box-sizing: border-box; }
.card { background-color: #D3D3D3; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; cursor: pointer; border-radius: 5px; transition: background-color 0.3s; }
.card.present { background-color: #00FF00; color: white; }
footer { margin-top: 20px; text-align: center; }
button { padding: 10px 20px; margin: 0 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer; }
button:hover { background-color: #0056b3; }
.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: #00FF00; color: white; padding: 10px 20px; border-radius: 5px; display: none; z-index: 10; }
.toast.show { display: block; }
@media (max-width: 400px) { .container { padding: 10px; } }
</style>
