<template>
  <div class="student-page">
    <h1 class="section-title">Student Dashboard</h1>

    <!-- Student Selection Dropdown -->
    <div v-if="!selectedStudentId" class="student-selection">
      <select v-model="selectedStudent" @change="selectStudent" class="student-dropdown">
        <option :value="null" disabled>Select Student</option>
        <option v-for="student in students" :key="student.studentId" :value="student">
          {{ student.name }} (Roll: {{ student.rollNumber }})
        </option>
      </select>
    </div>

    <!-- Access Code Modal -->
    <div v-if="showAccessCodeModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Enter Access Code</h2>
        <input
          v-model="accessCodeInput"
          type="text"
          maxlength="4"
          placeholder="Enter 4-digit code"
          class="access-code-input"
          @keyup.enter="verifyAccessCode"
        />
        <p v-if="accessCodeError" class="error-message">{{ accessCodeError }}</p>
        <div class="modal-buttons">
          <button @click="verifyAccessCode" class="submit-button">Submit</button>
          <button @click="cancelAccessCode" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>

    <!-- No Access Code Message -->
    <div v-if="noAccessCode" class="no-access-message">
      Contact school Admin to setup your access code.
    </div>

    <!-- Cards for Navigation -->
    <div v-if="selectedStudentId && !showAccessCodeModal && !noAccessCode" class="cards-container">
      <div class="card">
        <h2 class="card-title">View Attendance</h2>
        <p class="card-description">Check your attendance records by date.</p>
        <router-link :to="{ name: 'StudentAttendance', query: { studentId: selectedStudentId, className: className }}" class="card-button">View</router-link>
      </div>
      
      <!-- Quiz Card -->
      <div class="card">
        <h2 class="card-title">Take Quiz</h2>
        <p class="card-description">Participate in quizzes assigned to your class.</p>
        <router-link :to="{ name: 'StudentQuiz', query: { studentId: selectedStudentId, className: className }}" class="card-button quiz-button">Start Quiz</router-link>
      </div>

       <!-- Results Card -->
       <div class="card">
        <h2 class="card-title">View Results</h2>
        <p class="card-description">Check your academic results and performance.</p>
        <router-link :to="{ name: 'StudentResults', query: { studentId: selectedStudentId, className: className }}" class="card-button results-button">View Results</router-link>
      </div>

    </div>
  </div>
</template>

<script>
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  name: 'StudentPage',
  data() {
    return {
      className: '',
      students: [],
      selectedStudent: null,
      selectedStudentId: '',
      showAccessCodeModal: false,
      accessCodeInput: '',
      accessCodeError: '',
      noAccessCode: false,
    };
  },
  methods: {
    async fetchStudents() {
      const db = getFirestore();
      const studentsQuery = query(
        collection(db, 'Students'),
        where('classId', '==', this.className)
      );
      const snapshot = await getDocs(studentsQuery);
      this.students = snapshot.docs.map(doc => ({
        studentId: doc.data().studentId,
        name: doc.data().name,
        rollNumber: doc.data().rollNumber,
        accessCode: doc.data().accessCode, // Optional field
      }));
    },
    selectStudent() {
      if (!this.selectedStudent) return;

      // Store selection in localStorage
      const studentData = {
        studentId: this.selectedStudent.studentId,
        className: this.className,
      };
      localStorage.setItem('selectedStudent', JSON.stringify(studentData));

      // Check accessCode
      if (typeof this.selectedStudent.accessCode === 'string' && this.selectedStudent.accessCode.length === 4) {
        // Check if already verified
        const verifiedData = JSON.parse(localStorage.getItem('accessCodeVerified') || '{}');
        if (verifiedData.studentId === this.selectedStudent.studentId && verifiedData.isAccessCodeVerified) {
          this.selectedStudentId = this.selectedStudent.studentId;
          this.showAccessCodeModal = false;
          this.noAccessCode = false;
        } else {
          this.showAccessCodeModal = true;
          this.noAccessCode = false;
          this.accessCodeInput = '';
          this.accessCodeError = '';
        }
      } else {
        this.noAccessCode = true;
        this.showAccessCodeModal = false;
        this.selectedStudentId = '';
      }
    },
    verifyAccessCode() {
      if (this.accessCodeInput === this.selectedStudent.accessCode) {
        // Verification successful
        this.selectedStudentId = this.selectedStudent.studentId;
        this.showAccessCodeModal = false;
        this.noAccessCode = false;
        localStorage.setItem(
          'accessCodeVerified',
          JSON.stringify({ studentId: this.selectedStudentId, isAccessCodeVerified: true })
        );
        this.accessCodeInput = '';
        this.accessCodeError = '';
      } else {
        this.accessCodeError = 'Invalid access code. Please try again.';
        this.accessCodeInput = '';
      }
    },
    cancelAccessCode() {
      this.showAccessCodeModal = false;
      this.noAccessCode = false;
      this.selectedStudent = null;
      this.selectedStudentId = '';
      this.accessCodeInput = '';
      this.accessCodeError = '';
      localStorage.removeItem('selectedStudent');
    },
    trySelectStudentFromParams() {
      // Try route query first (from Back button)
      const queryStudentId = this.$route.query.studentId;
      if (queryStudentId) {
        const student = this.students.find(s => s.studentId === queryStudentId);
        if (student && this.className === this.$route.query.className) {
          this.selectedStudent = student;
          this.selectStudent();
          return true;
        }
      }
      // Fallback to localStorage
      const storedStudent = JSON.parse(localStorage.getItem('selectedStudent') || '{}');
      if (storedStudent.studentId && storedStudent.className === this.className) {
        const student = this.students.find(s => s.studentId === storedStudent.studentId);
        if (student) {
          this.selectedStudent = student;
          this.selectStudent();
          return true;
        }
      }
      return false;
    },
  },
  watch: {
    students: {
      handler() {
        if (this.students.length > 0) {
          this.trySelectStudentFromParams();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    // [CHANGED] Fetch className from Firebase Auth and classMapping
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const classMapping = {
        'classninea': 'Class_9_A',
        'classnineb': 'Class_9_B',
        'classtena': 'Class_10_A', // Example: Adjust based on your UIDs
        'classtenb': 'Class_10_B',
        'classelevena' : 'Class_11_A',
        'classelevenb' : 'Class_11_B',
        'classtwelvea' : 'Class_12_A',
        'classtwelveb' : 'Class_12_B',
        // Add other mappings as needed
      };
      this.className = classMapping[user.email.split('@')[0]] || this.$route.query.className || 'Unknown Class';
    } else {
      this.className = this.$route.query.className || 'Unknown Class';
    }

    if (this.className && this.className !== 'Unknown Class') {
      this.fetchStudents();
    } else {
      console.error('Class name not found. Please sign in again.');
      // Optionally redirect to sign-in
      // this.$router.push('/');
    }

  },
};
</script>

<style scoped>
.student-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.student-selection {
  margin-bottom: 1.5rem;
}

.student-dropdown {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 1.5rem;
  border-radius: 0.375rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.access-code-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin: 1rem 0;
  width: 100%;
  font-size: 1rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.submit-button {
  background-color: #3b82f6;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #2563eb;
}

.cancel-button {
  background-color: #6b7280;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #4b5563;
}

.no-access-message {
  color: #d97706;
  font-size: 1rem;
  margin-top: 1rem;
  text-align: center;
}

.cards-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .cards-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}

.card-title {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #6b7280;
  margin-bottom: 1rem;
}

.card-button {
  display: inline-block;
  background-color: #3b82f6; /* Blue */
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: background-color 0.2s;
}

.card-button:hover {
  background-color: #2563eb;
}

.quiz-button {
  background-color: #10b981; /* Green */
}

.quiz-button:hover {
  background-color: #059669;
}

.results-button {
  background-color: #8b5cf6; /* Purple */
}

.results-button:hover {
  background-color: #7c3aed;
}
</style>