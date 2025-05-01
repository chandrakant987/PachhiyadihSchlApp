<template>
  <div class="container">
    <div v-if="holiday" class="holiday-notice">
      HOLIDAY: {{ holiday.description }}
    </div>
    <header>
      <label for="class">Class:</label>
      <select v-model="classId" id="class">
        <option value="">Select a class</option>
        <option v-for="classItem in classes" :key="classItem.classId" :value="classItem.classId">
          {{ classItem.className }}
        </option>
      </select>
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

    <Snackbar
      :message="snackbar.message"
      :visible="snackbar.visible"
      :type="snackbar.type"
      @update:visible="snackbar.visible = $event"
    />
    
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
  writeBatch,
  getFirestore,
} from "firebase/firestore";
import Snackbar from '../components/Snackbar.vue';

export default {
  name: "Attendance",
  components: {
    Snackbar,
  },
  data() {
    const today = new Date();
    return {
      db: getFirestore(),
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      classes: [],
      classId: '',
      lastClassId: null,
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
      snackbar: {
        visible: false,
        message: '',
        type: 'error',
      },
      holiday: null,
      holidaysCache: {}, // e.g., { '2025': [{ description, startDate, endDate }, ...] }
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
    formattedDate() {
      return `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
    },
  },
  async mounted() {
    await this.loadClasses();
    await this.loadHolidays();
  },
  methods: {
    async loadAttendance() {
      try {
        if (!this.classId || this.students.length === 0) {
          this.attendanceState = {};
          return;
        }
        const studentIds = this.students.map((s) => s.studentId);
        const attendancePromises = studentIds.map(async (studentId) => {
          const docId = `${this.classId}_${studentId}_${this.formattedDate}`;
          const docRef = doc(this.db, 'AttendanceRecords', docId);
          const docSnap = await getDoc(docRef);
          return { studentId, docSnap };
        });
        const results = await Promise.all(attendancePromises);
        this.attendanceState = {};
        let hasRecords = false;
        results.forEach(({ studentId, docSnap }) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.attendanceState[studentId] = {
              status: data.status,
              docId: docSnap.id,
            };
            hasRecords = true;
          } else {
            this.attendanceState[studentId] = {
              status: 'A',
              docId: null,
            };
          }
        });
        if (!hasRecords) {
          const metadataDocId = `${this.classId}_${this.formattedDate}`;
          const metadataRef = doc(this.db, 'AttendanceMetadata', metadataDocId);
          const metadataDoc = await getDoc(metadataRef);
          if (!metadataDoc.exists()) {
            this.showSnackbar(
              'No attendance records found. Consider populating AttendanceMetadata for comprehensive management.',
              'warning'
            );
          }
        }
      } catch (error) {
        this.showSnackbar(`Error loading attendance: ${error.message}`, 'error');
      }
    },
    async loadClasses() {
      try {
        const classesRef = collection(this.db, 'Classes');
        const snapshot = await getDocs(classesRef);
        this.classes = snapshot.docs.map((doc) => ({
          classId: doc.id,
          className: doc.data().classId,
        }));
      } catch (error) {
        this.showSnackbar(`Error loading classes: ${error.message}`, 'error');
      }
    },
    async loadHolidays() {
      try {
        this.holiday = null;
        const yearStr = String(this.year);
        const selectedDateStr = this.formattedDate; // e.g., "2025-04-10"

        // Check cache first
        if (!this.holidaysCache[yearStr]) {
          const holidaysRef = collection(this.db, 'Holidays');
          const q = query(holidaysRef, where('year', '==', yearStr));
          const snapshot = await getDocs(q);
          this.holidaysCache[yearStr] = snapshot.docs.map((doc) => doc.data());
        }

        // Check holidays for the selected date
        const holidays = this.holidaysCache[yearStr] || [];
        holidays.forEach(({ startDate, endDate, description }) => {
          if (selectedDateStr >= startDate && selectedDateStr <= endDate) {
            this.holiday = { description };
          }
        });
      } catch (error) {
        this.showSnackbar(`Error loading holidays: ${error.message}`, 'error');
      }
    },
    async loadStudents() {
      if (this.classId === this.lastClassId && this.students.length > 0) {
        return;
      }
      try {
        const classDoc = await getDoc(doc(this.db, 'Classes', this.classId));
        if (!classDoc.exists()) {
          throw new Error('Class not found');
        }
        const studentIds = classDoc.data()?.studentIds || [];
        const chunks = studentIds.reduce((result, id, i) => {
          if (i % 10 === 0) result.push([]);
          result[result.length - 1].push(id);
          return result;
        }, []);
        const studentPromises = chunks.map((chunk) =>
          getDocs(query(collection(this.db, 'Students'), where('__name__', 'in', chunk)))
        );
        const snapshots = await Promise.all(studentPromises);
        this.students = snapshots
          .flatMap((snapshot) =>
            snapshot.docs.map((doc) => ({ studentId: doc.id, ...doc.data() }))
          )
          .sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
        this.lastClassId = this.classId;
      } catch (error) {
        this.showSnackbar(`Error loading students: ${error.message}`, 'error');
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
        if (!this.classId) {
          throw new Error('No class selected');
        }
        const batch = writeBatch(this.db);
        const studentIds = [];
        this.students.forEach((student) => {
          const state = this.attendanceState[student.studentId] || {
            status: 'A',
            docId: null,
          };
          const docId =
            state.docId ||
            `${this.classId}_${student.studentId}_${this.formattedDate}`;
          const docRef = doc(this.db, 'AttendanceRecords', docId);
          batch.set(
            docRef,
            {
              classId: this.classId,
              studentId: student.studentId,
              date: Math.floor(this.selectedDate.getTime() / 1000),
              year: this.year,
              month: this.month,
              day: this.day,
              status: state.status,
              isPresent: state.status === 'P',
            },
            { merge: true }
          );
          studentIds.push(student.studentId);
        });
        const metadataDocId = `${this.classId}_${this.formattedDate}`;
        const metadataRef = doc(this.db, 'AttendanceMetadata', metadataDocId);
        batch.set(metadataRef, { studentIds });
        await batch.commit();
        this.showSnackbar('Attendance saved successfully', 'success');
        await this.loadAttendance();
      } catch (error) {
        this.showSnackbar(`Error saving attendance: ${error.message}`, 'error');
      }
    },

    showSnackbar(message, type = 'error') {
      this.snackbar = { visible: true, message, type };
      setTimeout(() => {
        this.snackbar.visible = false;
      }, 3000);
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
        if (this.classId) {
          this.loadStudents();
          this.loadAttendance();
        } else {
          this.students = [];
          this.attendanceState = {};
        }
      },
      immediate: true,
    },
    selectedDate: {
      handler() {
        this.loadAttendance();
        this.loadHolidays();
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
.holiday-notice {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  text-align: center;
  border-radius: 4px;
  margin-bottom: 20px;
  font-weight: bold;
}
.sticky-container { position: sticky; top: 0; display: flex; justify-content: space-between; align-items: center; z-index: 1; }
.present-count { width: 30px; height: 30px; background-color: #0f770f; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px; margin-right: 5px; }
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
  .holiday-notice {
    font-size: 0.9em;
    padding: 8px;
  }
}
@media (max-width: 400px) {
  .container { padding: 10px; }
}
</style>