<template>
    <div class="attendance-page">

      <!-- Back Button -->
      <div class="back-button">
        <router-link
          :to="{ name: 'StudentPage', query: { studentId: $route.query.studentId, className: $route.query.className } }"
          class="back-link"
        >
          Back to Dashboard
        </router-link>
      </div>

      <!-- Title -->
      <h1 class="section-title">Attendance Records for {{ studentName }}</h1>
  
      <!-- Month/Year Selection -->
      <div class="date-selection">
        <select v-model="selectedMonth" class="date-dropdown">
          <option value="" disabled>Select Month</option>
          <option v-for="month in months" :key="month.value" :value="month.value">{{ month.name }}</option>
        </select>
        <select v-model="selectedYear" class="date-dropdown">
          <option value="" disabled>Select Year</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
        <button @click="fetchAttendance" :disabled="!selectedMonth || !selectedYear" class="show-button">Show</button>
      </div>
  
      <!-- Summary Row -->
      <div v-if="attendanceData.length > 0" class="summary-row">
        <div class="summary-item">
          <span class="summary-label">Total Working Days:</span>
          <span class="summary-value">{{ summary.workingDays }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Holidays:</span>
          <span class="summary-value">{{ summary.holidays }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Present:</span>
          <span class="summary-value">{{ summary.present }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Absent:</span>
          <span class="summary-value">{{ summary.absent }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Not Marked:</span>
          <span class="summary-value">{{ summary.notMarked }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label"> % (P/(TWD-NM)):</span>
          <span class="summary-value">{{ summary.percentage }}%</span>
        </div>
      </div>
  
      <!-- Attendance Table -->
      <div v-if="attendanceData.length > 0" class="table-container">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in attendanceData" :key="record.date" :class="{
              'holiday-row': record.status === 'Holiday',
              'not-marked-row': record.status === 'Not Marked'
            }">
              <td>{{ record.date }}</td>
              <td>{{ record.day }}</td>
              <td :class="{
                'status-present': record.status === 'Present',
                'status-absent': record.status === 'Absent',
                'status-holiday': record.status === 'Holiday',
                'status-not-marked': record.status === 'Not Marked'
              }">
                {{ record.status }}
              </td>
              <td>{{ record.description || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- No Data Message -->
      <div v-if="noData" class="no-data-message">
        No attendance records or holidays found for the selected month.
      </div>
    </div>
  </template>
  
  <script>
  import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
  
  export default {
    name: 'StudentAttendance',
    data() {
      return {
        studentId: '',
        className: '',
        studentName: '',
        selectedMonth: String(new Date().getMonth() + 1).padStart(2, '0'), // Current month (e.g., "04")
        selectedYear: new Date().getFullYear().toString(), // Current year (e.g., "2025")
        attendanceData: [],
        noData: false,
        holidays: [],
        summary: {
          workingDays: 0,
          holidays: 0,
          present: 0,
          absent: 0,
          notMarked: 0,
          percentage: '0.00',
        },
        months: [
          { name: 'January', value: '01' },
          { name: 'February', value: '02' },
          { name: 'March', value: '03' },
          { name: 'April', value: '04' },
          { name: 'May', value: '05' },
          { name: 'June', value: '06' },
          { name: 'July', value: '07' },
          { name: 'August', value: '08' },
          { name: 'September', value: '09' },
          { name: 'October', value: '10' },
          { name: 'November', value: '11' },
          { name: 'December', value: '12' },
        ],
        years: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
      };
    },
    methods: {
      async fetchStudentDetails() {
        const db = getFirestore();
        const studentDoc = await getDoc(doc(db, 'Students', this.studentId));
        if (studentDoc.exists()) {
          this.studentName = studentDoc.data().name;
        }
      },
      async fetchHolidays() {
        const db = getFirestore();
        const monthStart = `${this.selectedYear}-${this.selectedMonth}-01`;
        const monthEnd = `${this.selectedYear}-${this.selectedMonth}-${new Date(this.selectedYear, parseInt(this.selectedMonth), 0).getDate()}`;
        const holidayQuery = query(
          collection(db, 'Holidays'),
          where('year', '==', this.selectedYear.toString()),
          where('endDate', '>=', monthStart),
          where('startDate', '<=', monthEnd)
        );
        const holidaySnapshot = await getDocs(holidayQuery);
        this.holidays = holidaySnapshot.docs.map(doc => ({
          startDate: doc.data().startDate,
          endDate: doc.data().endDate,
          description: doc.data().description,
        }));
      },
      async fetchAttendance() {
        this.attendanceData = [];
        this.noData = false;
        this.holidays = [];
        this.summary = {
          workingDays: 0,
          holidays: 0,
          present: 0,
          absent: 0,
          notMarked: 0,
          percentage: '0.00',
        };
  
        if (!this.studentId || !this.selectedMonth || !this.selectedYear) return;
  
        const db = getFirestore();
        const today = new Date();
        const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
        // Fetch holidays
        await this.fetchHolidays();
  
        // Fetch attendance records
        const startId = `${this.className}_${this.studentId}_${this.selectedYear}-${this.selectedMonth}-01`;
        const endId = `${this.className}_${this.studentId}_${this.selectedYear}-${this.selectedMonth}-31`;
        const attendanceQuery = query(
          collection(db, 'AttendanceRecords'),
          where('__name__', '>=', startId),
          where('__name__', '<=', endId)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
  
        // Map attendance records to a dictionary
        const attendanceMap = {};
        attendanceSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const date = doc.id.split('_')[4]; // YYYY-MM-DD
          attendanceMap[date] = data.isPresent ? 'Present' : 'Absent';
        });
  
        // Generate all days in the month
        const daysInMonth = new Date(this.selectedYear, parseInt(this.selectedMonth), 0).getDate();
        const records = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const date = `${this.selectedYear}-${this.selectedMonth}-${String(day).padStart(2, '0')}`;
          if (date > currentDate) continue; // Skip future dates
  
          let status = 'Not Marked';
          let description = '';
          const holiday = this.holidays.find(h => {
            const start = new Date(h.startDate);
            const end = new Date(h.endDate);
            const current = new Date(date);
            return current >= start && current <= end;
          });
  
          if (holiday) {
            status = 'Holiday';
            description = holiday.description;
          } else if (date in attendanceMap) {
            status = attendanceMap[date];
          }
  
          records.push({
            date,
            day: new Date(date).toLocaleString('en-US', { weekday: 'long' }),
            status,
            description,
          });
        }
  
        // Sort by date and compute summary
        this.attendanceData = records.sort((a, b) => a.date.localeCompare(b.date));
        if (this.attendanceData.length === 0) {
          this.noData = true;
          return;
        }
  
        // Compute summary
        this.summary.holidays = this.attendanceData.filter(r => r.status === 'Holiday').length;
        this.summary.present = this.attendanceData.filter(r => r.status === 'Present').length;
        this.summary.absent = this.attendanceData.filter(r => r.status === 'Absent').length;
        this.summary.notMarked = this.attendanceData.filter(r => r.status === 'Not Marked').length;
        this.summary.workingDays = this.attendanceData.length - this.summary.holidays;
        this.summary.percentage = this.summary.workingDays > 0
          ? ((this.summary.present / (this.summary.workingDays-this.summary.notMarked)) * 100).toFixed(2)
          : '0.00';
      },
      isHoliday(date) {
        return this.holidays.some(holiday => {
          const start = new Date(holiday.startDate);
          const end = new Date(holiday.endDate);
          const current = new Date(date);
          return current >= start && current <= end;
        });
      },
    },
    mounted() {
      this.studentId = this.$route.query.studentId || '';
      this.className = this.$route.query.className || '';
      if (this.studentId) {
        this.fetchStudentDetails();
      }
    },
  };
  </script>
  
  <style scoped>
  .attendance-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .back-button {
    margin-bottom: 1rem;
  }

  .back-link {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #6b7280;
    color: #fff;
    border-radius: 0.375rem;
    text-decoration: none;
  }
  
  .back-link:hover {
    background-color: #4b5563;
  }
  
  .section-title {
    font-size: 1.5rem; /* 24px */
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .date-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (min-width: 768px) {
    .date-selection {
      flex-direction: row;
    }
  }
  
  .date-dropdown {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
  }
  
  .show-button {
    background-color: #3b82f6;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .show-button:hover {
    background-color: #2563eb;
  }
  
  .show-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  
  .summary-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f3f4f6;
    border-radius: 0.375rem;
  }
  
  .summary-item {
    flex: 1 1 150px;
    display: flex;
    flex-direction: column;
  }
  
  .summary-label {
    font-size: 0.875rem; /* 14px */
    color: #6b7280;
  }
  
  .summary-value {
    font-size: 1rem; /* 16px */
    font-weight: 600;
    color: #1f2937;
  }
  
  .table-container {
    overflow-x: auto;
    max-height: 400px; /* Scrollable table */
  }
  
  .attendance-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .attendance-table th {
    background-color: #f3f4f6;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .attendance-table th,
  .attendance-table td {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    text-align: left;
  }
  
  .holiday-row {
    background-color: #fef9c3; /* Light yellow for holidays */
  }
  
  .not-marked-row {
    background-color: #e0f2fe; /* Light blue for not marked */
  }
  
  .status-present {
    color: #10b981; /* Green */
  }
  
  .status-absent {
    color: #ef4444; /* Red */
  }
  
  .status-holiday {
    color: #d97706; /* Amber */
  }
  
  .status-not-marked {
    color: #6b7280; /* Gray */
  }
  
  .no-data-message {
    color: #6b7280;
    margin-top: 1rem;
  }
  </style>