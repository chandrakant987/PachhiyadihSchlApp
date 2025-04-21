// views/AdminPage.vue
<template>
  <div>
    <h1>Admin Dashboard</h1>
    <section class="admin-controls">
      <button @click="manageStudents">Manage Students</button>
      <button @click="manageTeachers">Manage Teachers</button>
      <button @click="updateNews">Update News</button>
    </section>
<br>
    <a href="/mark-attendance" class="result-link">Mark-Attendances</a>
<br>
    <a href="/attendace-dashboard" class="result-link">Attendance Dashboard</a>
<br>
    <a href="/holiday-management" class="result-link">Manage Holidays</a>
    
    <!-- Upload Results Section -->
    <UploadResults />
    
    <!-- Add/Update Class and Section -->
    <UpdateClassesColl />

    <AddNotifications />

    <AddStudentsColl />
  </div>
</template>

<script>
import UploadResults from "../components/UploadResults.vue";
import UpdateClassesColl from "../components/UpdateClassesColl.vue"
import AddNotifications from "../components/AddNotifications.vue"
import AddStudentsColl from "../components/AddStudentsColl.vue";

export default {
  components: { UploadResults, UpdateClassesColl, AddNotifications, AddStudentsColl },
  methods: {
    manageStudents() { alert("Navigating to student management"); },
    manageTeachers() { alert("Navigating to teacher management"); },
    updateNews() { alert("Navigating to news update section"); }
  }
};
</script>


<style scoped>
.admin {
  text-align: center;
  padding: 20px;
}
.admin-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}
.admin-controls button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.admin-controls button:hover {
  background: #0056b3;
}
</style>

