<template>
  <div class="student-quiz">
    <!-- Back Button -->
    <div class="back-button">
      <router-link
        :to="{ name: 'StudentPage', query: { studentId: studentId, className: className } }"
        class="back-link"
      >
        Back to Dashboard
      </router-link>
    </div>

    <h1 class="section-title">Quiz Dashboard</h1>

    <!-- Student Info -->
    <div v-if="student" class="student-info">
      <p>Student: {{ student.name }} (Roll: {{ student.rollNumber }})</p>
    </div>
    <div v-else class="error-message">
      Student not found. Please return to the dashboard.
    </div>

    <!-- Placeholder Quiz Content -->
    <div v-if="student" class="quiz-content">
      <p>Quizzes for {{ student.name }} will be displayed here.</p>
      <!-- Future quiz sections (subjects, cards) to be added in new chat -->
    </div>
  </div>
</template>

<script>
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default {
  name: 'StudentQuiz',
  data() {
    return {
      studentId: '',
      className: '',
      student: null,
    };
  },
  methods: {
    async fetchStudent() {
      const db = getFirestore();
      const studentDoc = doc(db, 'Students', this.studentId);
      const docSnap = await getDoc(studentDoc);
      if (docSnap.exists()) {
        this.student = {
          studentId: docSnap.data().studentId,
          name: docSnap.data().name,
          rollNumber: docSnap.data().rollNumber,
        };
      } else {
        this.student = null;
      }
    },
  },
  mounted() {
    this.studentId = this.$route.query.studentId || '';
    this.className = this.$route.query.className || '';
    if (this.studentId && this.className) {
      // Verify LocalStorage consistency
      const storedStudent = JSON.parse(localStorage.getItem('selectedStudent') || '{}');
      if (storedStudent.studentId === this.studentId && storedStudent.className === this.className) {
        this.fetchStudent();
      } else {
        // Fallback to route params, update LocalStorage
        localStorage.setItem('selectedStudent', JSON.stringify({
          studentId: this.studentId,
          className: this.className,
        }));
        this.fetchStudent();
      }
    }
  },
};
</script>

<style scoped>
.student-quiz {
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
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.student-info {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.error-message {
  color: #ef4444;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.quiz-content {
  background-color: #f3f4f6;
  padding: 1.5rem;
  border-radius: 0.375rem;
}
</style>