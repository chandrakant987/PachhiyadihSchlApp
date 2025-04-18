<template>
  <div class="container">
    <header>
      <label for="day">Day:</label>
      <select v-model="day" id="day">
        <option v-for="d in daysInMonth" :key="d" :value="d">{{ d }}</option>
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
        <option value="Class_9_A">Class 9 A</option>
        <option value="Class_9_B">Class 9 B</option>
        <option value="Class_10_A">Class 10 A</option>
        <option value="Class_10_B">Class 10 B</option>
        <option value="Class_11_A">Class 11 A</option>
        <option value="Class_11_B">Class 11 B</option>
        <option value="Class_12_A">Class 12 A</option>
        <option value="Class_12_B">Class 12 B</option>
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
        :data-id="student.studentId"
        @click="toggleAttendance(student.studentId)"
        @mouseenter="handleMouseEnter(student, $event)"
        @mouseleave="clearTooltip"
        @touchstart="handleTouchStart(student, $event)"
        @touchend="clearTooltip"
      >
        {{ student.rollNumber }}
      </div>

      <!-- Tooltip floating above or below -->
      <div
        v-if="tooltip.visible"
        class="tooltip"
        :class="{ bottom: tooltip.position === 'bottom' }"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      >
        <div class="tooltip-line"><strong>Name:</strong> {{ tooltip.data.name }}</div>
        <div class="tooltip-line"><strong>Father:</strong> {{ tooltip.data.fatherName }}</div>
        <div class="tooltip-line"><strong>Contact:</strong> {{ tooltip.data.contact }}</div>
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
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  getFirestore,
} from "firebase/firestore";

export default {
  name: "Attendance",
  data() {
    const today = new Date();
    return {
      db: getFirestore(),
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      classId: "Class_10_A",
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
      students: [],
      attendanceState: {},
      showToast: false,
      toastMessage: "",
      tooltip: {
        visible: false,
        data: {
          name: "",
          fatherName: "",
          contact: ""
        },
        position: "top",
        x: 0,
        y: 0,
        delayTimeout: null,
        hideTimeout: null,
      },
    };
  },
  computed: {
    presentCount() {
      return Object.values(this.attendanceState).filter((s) => s.status === "P").length;
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
    daysInMonth() {
      return new Date(this.year, this.month, 0).getDate();
    },
  },
  methods: {
    async loadAttendance() {
      try {
        const q = query(
          collection(this.db, "AttendanceRecords"),
          where("classId", "==", this.classId),
          where("year", "==", this.year),
          where("month", "==", this.month),
          where("day", "==", this.day)
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
      } catch (e) {
        this.showToastMessage("Error loading attendance");
        console.error(e);
      }
    },
    async loadStudents() {
      try {
        const classDoc = await getDoc(doc(this.db, "Classes", this.classId));
        const studentIds = classDoc.data()?.studentIds || [];
        const chunks = studentIds.reduce((result, id, i) => {
          if (i % 10 === 0) result.push([]);
          result[result.length - 1].push(id);
          return result;
        }, []);
        const studentPromises = chunks.map(chunk =>
          getDocs(query(collection(this.db, "Students"), where("__name__", "in", chunk)))
        );
        const snapshots = await Promise.all(studentPromises);
        this.students = snapshots
          .flatMap(snapshot =>
            snapshot.docs.map(doc => ({ studentId: doc.id, ...doc.data() }))
          )
          .sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
      } catch (e) {
        this.showToastMessage("Error loading students");
        console.error(e);
      }
    },
    toggleAttendance(studentId) {
      const currentState = this.attendanceState[studentId] || {
        status: "A",
        docId: null,
      };
      const newStatus = currentState.status === "P" ? "A" : "P";
      this.attendanceState = {
        ...this.attendanceState,
        [studentId]: { status: newStatus, docId: currentState.docId },
      };
    },
    reset() {
      this.attendanceState = {};
    },
    async submit() {
      try {
        const batch = [];
        this.students.forEach((student) => {
          const state = this.attendanceState[student.studentId] || {
            status: "A",
            docId: null,
          };
          const docId = state.docId || 
            `${this.classId}_${student.studentId}_${this.year}-${String(this.month).padStart(2, "0")}-${String(this.day).padStart(2, "0")}`;
          const docRef = doc(this.db, "AttendanceRecords", docId);
          batch.push(
            setDoc(
              docRef,
              {
                classId: this.classId,
                studentId: student.studentId,
                date: this.selectedDate.getTime() / 1000,
                year: this.year,
                month: this.month,
                day: this.day,
                status: state.status,
                isPresent: state.status === "P",
              },
              { merge: true }
            )
          );
        });
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
    handleMouseEnter(student, event) {
      clearTimeout(this.tooltip.delayTimeout);
      this.tooltip.delayTimeout = setTimeout(() => {
        this.showTooltip(student, event);
      }, 500);
    },
    handleTouchStart(student, event) {
      clearTimeout(this.tooltip.delayTimeout);
      this.tooltip.delayTimeout = setTimeout(() => {
        this.showTooltip(student, event);
      }, 500);
    },
    clearTooltip() {
      clearTimeout(this.tooltip.delayTimeout);
      clearTimeout(this.tooltip.hideTimeout);
      this.tooltip.visible = false;
    },
    showTooltip(student, event) {
      this.tooltip.data = {
        name: student.name || "N/A",
        fatherName: student.fatherName || "N/A",
        contact: student.contact?.parentContact || student.contact?.studentContact || "N/A",
      };
      const card = event.target;
      const rect = card.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      this.tooltip.position = rect.top - 50 < 0 ? "bottom" : "top";
      this.tooltip.x = rect.left + rect.width / 2;
      this.tooltip.y = this.tooltip.position === "bottom" ? rect.bottom + 10 : rect.top - 50;
      this.tooltip.visible = true;
      this.tooltip.hideTimeout = setTimeout(() => (this.tooltip.visible = false), 3000);
    },
  },
  watch: {
    classId: {
      handler() {
        this.loadStudents();
        this.loadAttendance();
      },
      immediate: true,
    },
    selectedDate: {
      handler() {
        this.loadAttendance();
        const maxDays = this.daysInMonth;
        if (this.day > maxDays) this.day = maxDays;
      },
    },
  },
};
</script>

<style scoped>
.container { max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; }
header { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 10px; }
header label { margin-right: 5px; }
header select { padding: 5px; }
.sticky-container { position: sticky; top: 0; display: flex; justify-content: space-between; align-items: center; z-index: 1; }
.present-count { width: 30px; height: 30px; background-color: #0f770f; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.present-list { background-color: #E0E0E0; padding: 5px 10px; border-radius: 5px; margin-bottom: 10px; overflow-x: auto; white-space: nowrap; flex-grow: 1; margin-right: 10px; }
main { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; max-height: 60vh; overflow-y: auto; overflow-x: hidden; width: 100%; box-sizing: border-box; }
.card { width: 60px; height: 60px; background-color: #D3D3D3; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; cursor: pointer; border-radius: 5px; transition: background-color 0.3s; }
.card.present { background-color: #00FF00; color: white; }
footer { margin-top: 20px; text-align: center; }
button { padding: 10px 20px; margin: 0 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer; }
button:hover { background-color: #0056b3; }
.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: #00FF00; color: white; padding: 10px 20px; border-radius: 5px; display: none; z-index: 10; }
.toast.show { display: block; }
.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 8px 10px;
  border-radius: 5px;
  font-size: 12px;
  line-height: 1.4;
  max-width: 220px;
  z-index: 1000;
  pointer-events: none;
  transform: translate(-50%, -100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s ease-in-out;
}
.tooltip.bottom {
  transform: translate(-50%, 0);
}
.tooltip-line {
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tooltip-line:last-child {
  margin-bottom: 0;
}
@media (max-width: 600px) {
  .card { width: 60px; height: 60px; }
  .tooltip { font-size: 10px; padding: 6px 8px; max-width: 180px; }
  .tooltip-line { margin-bottom: 3px; }
}
@media (max-width: 400px) {
  .container { padding: 10px; }
}
</style>