<template>
  <div class="attendance-dashboard">
    <h2>Attendance Dashboard</h2>
    <div v-if="holiday" class="holiday-notice">
      HOLIDAY: {{ holiday.description }}
    </div>
    <div class="filters">
      <select v-model="selectedYear" @change="debounceLoadData">
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
      <select v-model="selectedMonth" @change="debounceLoadData">
        <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
      </select>
      <select v-model="selectedDay" @change="debounceLoadData">
        <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
      </select>
      <select v-model="selectedClass" @change="debounceLoadData">
        <option value="">All Classes</option>
        <option v-for="classItem in classes" :key="classItem.classId" :value="classItem.classId">{{ classItem.classId }}</option>
      </select>
      <div v-if="activeTab === 'student'" class="student-filter">
        <input
          v-model="selectedStudentName"
          list="students"
          placeholder="Select Student"
          @change="updateSelectedStudent"
        />
        <datalist id="students">
          <option v-for="student in filteredStudents" :key="student.studentId" :value="student.name">
            {{ student.name }} ({{ student.studentId }})
          </option>
        </datalist>
        <select v-if="selectedStudent" v-model="studentQueryType" @change="debounceLoadData">
          <option value="day">Single Day</option>
          <option value="month">Single Month</option>
          <option value="span">Month Span</option>
        </select>
        <div v-if="studentQueryType === 'span'" class="month-range">
          <select v-model="startMonth" @change="debounceLoadData">
            <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
          </select>
          <select v-model="endMonth" @change="debounceLoadData">
            <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="tabs">
      <button :class="{ active: activeTab === 'absent' }" @click="activeTab = 'absent'; loadData()">Absent Students</button>
      <button :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'; loadData()">Monthly Report</button>
      <button :class="{ active: activeTab === 'quarterly' }" @click="activeTab = 'quarterly'; loadData()">Quarterly Report</button>
      <button :class="{ active: activeTab === 'low' }" @click="activeTab = 'low'; loadData()">Low Attendance</button>
      <button :class="{ active: activeTab === 'student' }" @click="activeTab = 'student'; loadData()">Student Attendance</button>
    </div>
    <div v-if="activeTab === 'absent'" class="table-container">
      <p v-if="isLoading">Loading...</p>
      <table v-else>
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Class</th>
            <th>Contact</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in absentRecords" :key="record.studentId">
            <td>{{ record.rollNumber }}</td>
            <td>{{ record.name }}</td>
            <td>{{ record.classId }}</td>
            <td>{{ record.parentContact || record.studentContact || 'N/A' }}</td>
            <td>
              <a v-if="record.parentContact || record.studentContact" :href="generateWhatsAppLink(record)" target="_blank">Message</a>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <button v-if="!isLoading" @click="exportToCSV('absent')">Export to CSV</button>
    </div>
    <div v-if="activeTab === 'monthly' || activeTab === 'quarterly'" class="table-container">
      <p v-if="isLoading">Loading...</p>
      <table v-else>
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Class</th>
            <th>Present Days</th>
            <th>Total Days</th>
            <th>Percentage</th>
            <th>Consecutive Absences</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in reportRecords" :key="record.studentId" :class="{ warning: record.percentage < 75 }">
            <td>{{ record.rollNumber }}</td>
            <td>{{ record.name }}</td>
            <td>{{ record.classId }}</td>
            <td>{{ record.presentDays }}</td>
            <td>{{ record.totalDays }}</td>
            <td>{{ record.percentage.toFixed(2) }}%</td>
            <td>{{ record.consecutiveAbsences > 2 ? record.consecutiveAbsences + ' days' : '-' }}</td>
          </tr>
        </tbody>
      </table>
      <button v-if="!isLoading" @click="exportToCSV(activeTab)">Export to CSV</button>
    </div>
    <div v-if="activeTab === 'low'" class="table-container">
      <p v-if="isLoading">Loading...</p>
      <table v-else>
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Class</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in lowAttendanceRecords" :key="record.studentId">
            <td>{{ record.rollNumber }}</td>
            <td>{{ record.name }}</td>
            <td>{{ record.classId }}</td>
            <td>{{ record.percentage.toFixed(2) }}%</td>
          </tr>
        </tbody>
      </table>
      <button v-if="!isLoading" @click="exportToCSV('low')">Export to CSV</button>
    </div>
    <div v-if="activeTab === 'student' && selectedStudent" class="table-container">
      <h3>Attendance for {{ selectedStudent.name }} ({{ selectedStudent.studentId }})</h3>
      <p v-if="isLoading">Loading...</p>
      <table v-else-if="studentQueryType === 'day' && studentAttendance.day">
        <thead>
          <tr>
            <th>Date</th>
            <th>Class</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ format(new Date(selectedYear, selectedMonth - 1, selectedDay), 'PPP') }}</td>
            <td>{{ studentAttendance.day.classId }}</td>
            <td :class="{ present: studentAttendance.day.isPresent, absent: !studentAttendance.day.isPresent }">
              {{ studentAttendance.day.isPresent ? 'Present' : 'Absent' }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="studentQueryType === 'day' && !studentAttendance.day && !isLoading">No attendance record for this day</p>
      <table v-else-if="studentQueryType === 'month' || studentQueryType === 'span'">
        <thead>
          <tr>
            <th>Date</th>
            <th>Class</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in studentAttendance.records" :key="record.id">
            <td>{{ format(new Date(record.year, record.month - 1, record.day), 'PPP') }}</td>
            <td>{{ record.classId }}</td>
            <td :class="{ present: record.isPresent, absent: !record.isPresent }">
              {{ record.isPresent ? 'Present' : 'Absent' }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="studentQueryType === 'month' || studentQueryType === 'span'" class="summary">
        <p>Present Days: {{ studentAttendance.summary.presentDays }}</p>
        <p>Total Days: {{ studentAttendance.summary.totalDays }}</p>
        <p>Attendance Percentage: {{ studentAttendance.summary.percentage.toFixed(2) }}%</p>
      </div>
      <button v-if="!isLoading && studentAttendance.records.length" @click="exportStudentAttendanceToCSV">Export to CSV</button>
    </div>
    <Snackbar
      :message="snackbar.message"
      :visible="snackbar.visible"
      :type="snackbar.type"
    />
  </div>
</template>

<script>

import { collection, query, where, getDocs, doc, getDoc, getFirestore } from 'firebase/firestore';
import { format } from 'date-fns';
import Snackbar from '../components/Snackbar.vue';

export default {
  name: 'AttendanceDashboard',
  components: {
    Snackbar,
  },
  data() {
    return {
      db: getFirestore(),
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      selectedDay: new Date().getDate(),
      selectedClass: '',
      activeTab: 'absent',
      years: [2024, 2025, 2026],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      days: Array.from({ length: 31 }, (_, i) => i + 1),
      classes: [],
      students: [],
      absentRecords: [],
      reportRecords: [],
      lowAttendanceRecords: [],
      selectedStudentName: '',
      selectedStudent: null,
      studentQueryType: 'day', // day, month, or span
      startMonth: 1,
      endMonth: 12,
      studentAttendance: {
        day: null,
        records: [],
        summary: { presentDays: 0, totalDays: 0, percentage: 0 },
      },
      cache: {},
      snackbar: {
        visible: false,
        message: '',
        type: 'error',
      },
      isLoading: false,
      debounceLoadData: null,
      holiday: null,
      holidaysCache: {}, // e.g., { '2025': [{ description, startDate, endDate }, ...] }
    };
  },
  computed: {
    filteredStudents() {
      if (!this.selectedClass) {
        return this.students;
      }
      const classData = this.classes.find(c => c.classId === this.selectedClass);
      if (!classData) {
        return [];
      }
      return this.students.filter(s => classData.studentIds.includes(s.studentId));
    },
    formattedDate() {
      return `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDay).padStart(2, '0')}`;
    },
  },
  mounted() {
    this.debounceLoadData = this.debounce(this.loadData, 300);
    this.loadClasses();
    this.loadStudents();
    this.loadData();
    this.loadHolidays();
  },
  methods: {
    format,
    debounce(fn, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    },
    showSnackbar(message, type = 'error') {
      this.snackbar = { visible: true, message, type };
      setTimeout(() => {
        this.snackbar.visible = false;
      }, 3000);
    },
    async loadHolidays() {
      try {
        this.holiday = null;
        const yearStr = String(this.selectedYear);
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
    async calculateTotalDays(startDate, endDate) {
      try {
        const cacheKey = `totalDays_${startDate}_${endDate}`;
        if (this.cache[cacheKey]) {
          return this.cache[cacheKey];
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const years = [start.getFullYear(), end.getFullYear()]
          .filter((y, i, arr) => arr.indexOf(y) === i)
          .map(String);

        const q = query(collection(this.db, 'Holidays'), where('year', 'in', years));
        const snapshot = await getDocs(q);
        const holidays = snapshot.docs.map(doc => doc.data());

        let totalDays = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const isHoliday = holidays.some(h => dateStr >= h.startDate && dateStr <= h.endDate);
          if (!isHoliday) totalDays++;
        }
        this.cache[cacheKey] = totalDays;
        return totalDays;
      } catch (error) {
        console.error('Error calculating totalDays:', error);
        this.showSnackbar('Failed to calculate working days');
        return 0;
      }
    },
    async loadClasses() {
      this.isLoading = true;
      try {
        const classesSnapshot = await getDocs(collection(this.db, 'Classes'));
        this.classes = classesSnapshot.docs.map(doc => doc.data());
      } catch (error) {
        this.showSnackbar('Failed to load classes');
        console.error('Error loading classes:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadStudents() {
      this.isLoading = true;
      try {
        const studentsSnapshot = await getDocs(collection(this.db, 'Students'));
        this.students = studentsSnapshot.docs
          .map(doc => doc.data())
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        this.showSnackbar('Failed to load students');
        console.error('Error loading students:', error);
      } finally {
        this.isLoading = false;
      }
    },
    updateSelectedStudent() {
      const student = this.students.find(
        s => s.name === this.selectedStudentName || `${s.name} (${s.studentId})` === this.selectedStudentName
      );
      if (student && this.filteredStudents.some(s => s.studentId === student.studentId)) {
        this.selectedStudent = student;
      } else {
        this.selectedStudent = null;
        this.selectedStudentName = '';
        if (student) {
          this.showSnackbar('Selected student is not in the current class');
        }
      }
      if (this.activeTab === 'student' && this.selectedStudent) {
        this.loadData();
      }
    },
    async loadData() {
      this.isLoading = true;
      try {
        if (this.activeTab === 'absent') {
          await this.loadAbsentStudents();
        } else if (this.activeTab === 'monthly') {
          await this.loadMonthlyReport();
        } else if (this.activeTab === 'quarterly') {
          await this.loadQuarterlyReport();
        } else if (this.activeTab === 'low') {
          await this.loadLowAttendance();
        } else if (this.activeTab === 'student' && this.selectedStudent) {
          await this.loadStudentAttendance();
        }
      } catch (error) {
        this.showSnackbar('Error loading data');
        console.error('Error in loadData:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadAbsentStudents() {
      const cacheKey = `absent_${this.selectedYear}_${this.selectedMonth}_${this.selectedDay}_${this.selectedClass}`;
      if (this.cache[cacheKey] && this.cache[cacheKey].length) {
        this.absentRecords = this.cache[cacheKey];
        return;
      }
      this.isLoading = true;
      try {
        const formattedMonth = String(this.selectedMonth).padStart(2, '0');
        const formattedDay = String(this.selectedDay).padStart(2, '0');
        let records = [];
        if (this.selectedClass) {
          const classData = this.classes.find(c => c.classId === this.selectedClass);
          if (!classData) {
            this.showSnackbar('Selected class not found');
            return;
          }
          const studentIds = classData.studentIds || [];
          const studentDocs = await Promise.all(
            studentIds.map(async studentId => {
              const docId = `${this.selectedClass}_${studentId}_${this.selectedYear}-${formattedMonth}-${formattedDay}`;
              const docRef = doc(this.db, 'AttendanceRecords', docId);
              const docSnap = await getDoc(docRef);
              return docSnap.exists() ? { ...docSnap.data(), id: docId } : null;
            })
          );
          records = studentDocs.filter(doc => doc && !doc.isPresent).map(doc => doc);
        } else {
          const q = query(
            collection(this.db, 'AttendanceRecords'),
            where('year', '==', this.selectedYear),
            where('month', '==', this.selectedMonth),
            where('day', '==', this.selectedDay),
            where('isPresent', '==', false)
          );
          const snapshot = await getDocs(q);
          records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        }
        const studentIds = [...new Set(records.map(r => r.studentId))];
        const students = await this.batchLoadStudents(studentIds);
        this.absentRecords = records
          .map(record => ({
            ...record,
            ...students[record.studentId],
            parentContact: students[record.studentId]?.contact?.parentContact,
            studentContact: students[record.studentId]?.contact?.studentContact
          }))
          .sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
        this.cache[cacheKey] = this.absentRecords;
        if (!this.absentRecords.length) {
          this.showSnackbar('No absent students found, Firts mark the Attendance for this date');
        }
      } catch (error) {
        this.showSnackbar('Failed to load absent students');
        console.error('Error loading absent students:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadMonthlyReport() {
      const cacheKey = `monthly_${this.selectedYear}_${this.selectedMonth}_${this.selectedClass}`;
      if (this.cache[cacheKey] && this.cache[cacheKey].length) {
        this.reportRecords = this.cache[cacheKey];
        return;
      }
      this.isLoading = true;
      try {
        const formattedMonth = String(this.selectedMonth).padStart(2, '0');
        const startDate = `${this.selectedYear}-${formattedMonth}-01`;
        const endDate = `${this.selectedYear}-${formattedMonth}-${new Date(this.selectedYear, this.selectedMonth, 0).getDate()}`;
        const totalDays = await this.calculateTotalDays(startDate, endDate);
        if (totalDays === 0) {
          this.showSnackbar('No working days in this month');
          this.reportRecords = [];
          return;
        }
        let records = [];
        if (this.selectedClass) {
          const classData = this.classes.find(c => c.classId === this.selectedClass);
          if (!classData) {
            this.showSnackbar('Selected class not found');
            return;
          }
          const q = query(
            collection(this.db, 'AttendanceRecords'),
            where('classId', '==', this.selectedClass),
            where('year', '==', this.selectedYear),
            where('month', '==', this.selectedMonth)
          );
          const snapshot = await getDocs(q);
          records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } else {
          const q = query(
            collection(this.db, 'AttendanceRecords'),
            where('year', '==', this.selectedYear),
            where('month', '==', this.selectedMonth)
          );
          const snapshot = await getDocs(q);
          records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        }
        const studentIds = [...new Set(records.map(r => r.studentId))];
        const students = await this.batchLoadStudents(studentIds);
        this.reportRecords = studentIds.map(studentId => {
          const studentRecords = records.filter(r => r.studentId === studentId);
          const presentDays = studentRecords.filter(r => r.isPresent).length;
          const consecutiveAbsences = this.calculateConsecutiveAbsences(studentRecords);
          return {
            studentId,
            ...students[studentId],
            presentDays,
            totalDays,
            percentage: (presentDays / totalDays) * 100,
            consecutiveAbsences,
          };
        }).sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
        this.cache[cacheKey] = this.reportRecords;
        if (!this.reportRecords.length) {
          this.showSnackbar('No attendance records for this month');
        }
      } catch (error) {
        this.showSnackbar('Failed to load monthly report');
        console.error('Error loading monthly report:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadQuarterlyReport() {
      const cacheKey = `quarterly_${this.selectedYear}_${this.selectedMonth}_${this.selectedClass}`;
      if (this.cache[cacheKey] && this.cache[cacheKey].length) {
        this.reportRecords = this.cache[cacheKey];
        return;
      }
      this.isLoading = true;
      try {
        const startMonth = Math.floor((this.selectedMonth - 1) / 3) * 3 + 1;
        const startDate = `${this.selectedYear}-${String(startMonth).padStart(2, '0')}-01`;
        const endMonth = startMonth + 2;
        const endDate = `${this.selectedYear}-${String(endMonth).padStart(2, '0')}-${new Date(this.selectedYear, endMonth, 0).getDate()}`;
        const totalDays = await this.calculateTotalDays(startDate, endDate);
        if (totalDays === 0) {
          this.showSnackbar('No working days in this quarter');
          this.reportRecords = [];
          return;
        }
        let records = [];
        if (this.selectedClass) {
          const q = query(
            collection(this.db, 'AttendanceRecords'),
            where('classId', '==', this.selectedClass),
            where('year', '==', this.selectedYear),
            where('month', '>=', startMonth),
            where('month', '<=', startMonth + 2)
          );
          const snapshot = await getDocs(q);
          records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          const classData = this.classes.find(c => c.classId === this.selectedClass);
          if (!classData) {
            this.showSnackbar('Selected class not found');
            return;
          }
        } else {
          const q = query(
            collection(this.db, 'AttendanceRecords'),
            where('year', '==', this.selectedYear),
            where('month', '>=', startMonth),
            where('month', '<=', startMonth + 2)
          );
          const snapshot = await getDocs(q);
          records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        }
        const studentIds = [...new Set(records.map(r => r.studentId))];
        const students = await this.batchLoadStudents(studentIds);
        this.reportRecords = studentIds.map(studentId => {
          const studentRecords = records.filter(r => r.studentId === studentId);
          const presentDays = studentRecords.filter(r => r.isPresent).length;
          const consecutiveAbsences = this.calculateConsecutiveAbsences(studentRecords);
          return {
            studentId,
            ...students[studentId],
            presentDays,
            totalDays,
            percentage: (presentDays / totalDays) * 100,
            consecutiveAbsences,
          };
        }).sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
        this.cache[cacheKey] = this.reportRecords;
        if (!this.reportRecords.length) {
          this.showSnackbar('No attendance records for this quarter');
        }
      } catch (error) {
        this.showSnackbar('Failed to load quarterly report');
        console.error('Error loading quarterly report:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadLowAttendance() {
      this.isLoading = true;
      try {
        await this.loadMonthlyReport();
        this.lowAttendanceRecords = this.reportRecords.filter(r => r.percentage < 75);
        if (!this.lowAttendanceRecords.length) {
          this.showSnackbar('No students with low attendance');
        }
      } catch (error) {
        this.showSnackbar('Failed to load low attendance report');
        console.error('Error loading low attendance:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadStudentAttendance() {
      if (!this.selectedStudent) {
        this.showSnackbar('Please select a student');
        return;
      }
      const cacheKey = `student_${this.selectedStudent.studentId}_${this.studentQueryType}_${this.selectedYear}_${this.selectedMonth}_${this.selectedDay}_${this.startMonth}_${this.endMonth}`;
      if (this.cache[cacheKey] && this.cache[cacheKey].records?.length) {
        this.studentAttendance = this.cache[cacheKey];
        return;
      }
      this.isLoading = true;
      try {
        this.studentAttendance = { day: null, records: [], summary: { presentDays: 0, totalDays: 0, percentage: 0 } };
        const formattedMonth = String(this.selectedMonth).padStart(2, '0');
        const formattedDay = String(this.selectedDay).padStart(2, '0');
        const classData = this.classes.find(c => c.studentIds.includes(this.selectedStudent.studentId));
        if (!classData) {
          this.showSnackbar('Student not found in any class');
          return;
        }
        const classId = classData.classId;
        if (this.studentQueryType === 'day') {
          console.log('Fetching single day for student:', this.selectedStudent.studentId, 'class:', classId, 'docId:', `${classId}_${this.selectedStudent.studentId}_${this.selectedYear}-${formattedMonth}-${formattedDay}`);
          const docId = `${classId}_${this.selectedStudent.studentId}_${this.selectedYear}-${formattedMonth}-${formattedDay}`;
          const docRef = doc(this.db, 'AttendanceRecords', docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            this.studentAttendance.day = { ...docSnap.data(), id: docId };
          } else {
            console.log('No record found for docId:', docId);
            this.showSnackbar('No attendance record for this day');
          }
        } else if (this.studentQueryType === 'month') {
          const startDate = `${this.selectedYear}-${formattedMonth}-01`;
          const endDate = `${this.selectedYear}-${formattedMonth}-${new Date(this.selectedYear, this.selectedMonth, 0).getDate()}`;
          const totalDays = await this.calculateTotalDays(startDate, endDate);
          if (totalDays === 0) {
            this.showSnackbar('No working days in this month');
            this.studentAttendance.records = [];
            return;
          }
          const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
          const records = await Promise.all(
            Array.from({ length: daysInMonth }, (_, i) => i + 1).map(async day => {
              const formattedDay = String(day).padStart(2, '0');
              const docId = `${classId}_${this.selectedStudent.studentId}_${this.selectedYear}-${formattedMonth}-${formattedDay}`;
              const docRef = doc(this.db, 'AttendanceRecords', docId);
              const docSnap = await getDoc(docRef);
              return docSnap.exists() ? { ...docSnap.data(), id: docId } : null;
            })
          );
          this.studentAttendance.records = records.filter(r => r);
          const presentDays = this.studentAttendance.records.filter(r => r.isPresent).length;
          this.studentAttendance.summary = {
            presentDays,
            totalDays,
            percentage: (presentDays / totalDays) * 100,
          };
          if (!this.studentAttendance.records.length) {
            this.showSnackbar('No attendance records for this month');
          }
        } else if (this.studentQueryType === 'span') {
          const startDate = `${this.selectedYear}-${String(this.startMonth).padStart(2, '0')}-01`;
          const endDate = `${this.selectedYear}-${String(this.endMonth).padStart(2, '0')}-${new Date(this.selectedYear, this.endMonth, 0).getDate()}`;
          const totalDays = await this.calculateTotalDays(startDate, endDate);
          if (totalDays === 0) {
            this.showSnackbar('No working days in this period');
            this.studentAttendance.records = [];
            return;
          }
          const months = Array.from(
            { length: this.endMonth - this.startMonth + 1 },
            (_, i) => this.startMonth + i
          );
          const records = await Promise.all(
            months.map(async month => {
              const formattedMonth = String(month).padStart(2, '0');
              const daysInMonth = new Date(this.selectedYear, month, 0).getDate();
              return Promise.all(
                Array.from({ length: daysInMonth }, (_, i) => i + 1).map(async day => {
                  const formattedDay = String(day).padStart(2, '0');
                  const docId = `${classId}_${this.selectedStudent.studentId}_${this.selectedYear}-${formattedMonth}-${formattedDay}`;
                  const docRef = doc(this.db, 'AttendanceRecords', docId);
                  const docSnap = await getDoc(docRef);
                  return docSnap.exists() ? { ...docSnap.data(), id: docId } : null;
                })
              );
            })
          );
          this.studentAttendance.records = records.flat().filter(r => r);
          const presentDays = this.studentAttendance.records.filter(r => r.isPresent).length;
          this.studentAttendance.summary = {
            presentDays,
            totalDays,
            percentage: (presentDays / totalDays) * 100,
          };
          if (!this.studentAttendance.records.length) {
            this.showSnackbar('No attendance records for this period');
          }
        }
        this.cache[cacheKey] = this.studentAttendance;
      } catch (error) {
        this.showSnackbar('Failed to load student attendance');
        console.error('Error loading student attendance:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async batchLoadStudents(studentIds) {
      const students = {};
      const chunkSize = 10;
      for (let i = 0; i < studentIds.length; i += chunkSize) {
        const chunk = studentIds.slice(i, i + chunkSize);
        const q = query(collection(this.db, 'Students'), where('studentId', 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          students[doc.data().studentId] = doc.data();
        });
      }
      return students;
    },
    calculateConsecutiveAbsences(records) {
      const sortedRecords = records.sort((a, b) => a.day - b.day);
      let maxConsecutive = 0;
      let currentConsecutive = 0;
      for (let i = 1; i < sortedRecords.length; i++) {
        if (!sortedRecords[i].isPresent && sortedRecords[i].day === sortedRecords[i - 1].day + 1) {
          currentConsecutive++;
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        } else {
          currentConsecutive = sortedRecords[i].isPresent ? 0 : 1;
        }
      }
      return maxConsecutive;
    },
    generateWhatsAppLink(record) {
      const date = format(new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay), 'PPP');
      const message = `उत्क्रमित उच्च माध्यमिक विद्यालय, पछियाडीह, नवादा\nनमस्ते,
आपको सूचित करना है कि ${record.name}, दिनांक ${date} को विद्यालय में अनुपस्थित हैं। कृपया अनुपस्थिति के कारण को विद्यालय कार्यालय में सूचित करें।
धन्यवाद,\nUUMV Pachhiyadih`;
      const contact = record.parentContact || record.studentContact;
      return `https://wa.me/${contact}?text=${encodeURIComponent(message)}`;
    },
    exportToCSV(type) {
      let headers, rows;
      if (type === 'absent') {
        headers = ['Roll', 'Name', 'Class', 'Contact'];
        rows = this.absentRecords.map(r => [
          r.rollNumber,
          r.name,
          r.classId,
          r.parentContact || r.studentContact || 'N/A',
        ]);
      } else if (type === 'monthly' || type === 'quarterly') {
        headers = ['Roll', 'Name', 'Class', 'Present Days', 'Total Days', 'Percentage', 'Consecutive Absences'];
        rows = this.reportRecords.map(r => [
          r.rollNumber,
          r.name,
          r.classId,
          r.presentDays,
          r.totalDays,
          r.percentage.toFixed(2),
          r.consecutiveAbsences > 2 ? r.consecutiveAbsences : '-',
        ]);
      } else if (type === 'low') {
        headers = ['Roll', 'Name', 'Class', 'Percentage'];
        rows = this.lowAttendanceRecords.map(r => [
          r.rollNumber,
          r.name,
          r.classId,
          r.percentage.toFixed(2),
        ]);
      }
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    exportStudentAttendanceToCSV() {
      let headers, rows;
      if (this.studentQueryType === 'day' && this.studentAttendance.day) {
        headers = ['Date', 'Class', 'Status'];
        rows = [[
          format(new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay), 'PPP'),
          this.studentAttendance.day.classId,
          this.studentAttendance.day.isPresent ? 'Present' : 'Absent',
        ]];
      } else {
        headers = ['Date', 'Class', 'Status'];
        rows = this.studentAttendance.records.map(r => [
          format(new Date(r.year, r.month - 1, r.day), 'PPP'),
          r.classId,
          r.isPresent ? 'Present' : 'Absent',
        ]);
        rows.push([
          'Summary',
          '',
          `Present: ${this.studentAttendance.summary.presentDays}, Total: ${this.studentAttendance.summary.totalDays}, Percentage: ${this.studentAttendance.summary.percentage.toFixed(2)}%`,
        ]);
      }
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_${this.selectedStudent.studentId}_attendance.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  },
  watch: {
    formattedDate: {
      handler() {
        this.loadHolidays();
      },
    },
  },
};
</script>

<style scoped>
.attendance-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.holiday-notice {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  text-align: center;
  border-radius: 4px;
  margin-bottom: 20px;
  font-weight: bold;
}
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filters select, .filters input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.student-filter {
  display: flex;
  gap: 10px;
  align-items: center;
}
.month-range {
  display: flex;
  gap: 10px;
}
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.tabs button {
  padding: 10px 20px;
  border: none;
  background: #1e4ed1;
  cursor: pointer;
  border-radius: 4px;
}
.tabs button.active {
  background: #3ce93c;
  color: white;
}
.table-container {
  max-height: 60vh;
  overflow-y: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}
th {
  background: #f0f0f0;
}
tr.warning {
  background: #ffcccc;
}
.present {
  color: #00FF00;
}
.absent {
  color: #D3D3D3;
}
a {
  color: #00FF00;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
button {
  margin-top: 10px;
  padding: 10px 20px;
  background: #00FF00;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.summary {
  margin-top: 10px;
}
@media (max-width: 600px) {
  .filters, .student-filter, .month-range {
    flex-direction: column;
  }
  .tabs {
    flex-direction: column;
  }
  table {
    font-size: 14px;
  }
}
</style>