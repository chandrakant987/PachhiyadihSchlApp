<template>
    <div class="delete-attendance">
      <h2>Delete Attendance</h2>
      <div class="form-group">
        <label for="classSelect">Select Class:</label>
        <select v-model="selectedClass" id="classSelect">
          <option value="">Select a class</option>
          <option v-for="classItem in classes" :key="classItem.classId" :value="classItem">
            {{ classItem.className }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="datePicker">Select Date:</label>
        <input type="date" id="datePicker" v-model="selectedDate" />
      </div>
      <div class="form-group toggle-group">
        <label>Deletion Method:</label>
        <div class="toggle-buttons">
          <button
            :class="{ active: deletionMethod === 'metadata' }"
            @click="deletionMethod = 'metadata'"
          >
            Use Metadata
          </button>
          <button
            :class="{ active: deletionMethod === 'constructed' }"
            @click="deletionMethod = 'constructed'"
          >
            Use Constructed IDs
          </button>
        </div>
        <p class="method-description">
          <strong>{{ deletionMethod === 'metadata' ? 'Metadata-Based Deletion' : 'Constructed IDs Deletion' }}</strong>:
          {{
            deletionMethod === 'metadata'
              ? 'Deletes attendance records using the AttendanceMetadata collection, ensuring all records for the class and date are removed, including those for students no longer in the class.'
              : 'Deletes attendance records by constructing IDs from the current class student list. Warning: This may miss records for students who were removed from the class.'
          }}
        </p>
      </div>
      <button :disabled="!selectedClass || !selectedDate" @click="deleteAttendance">
        Delete Attendance
      </button>
      <Snackbar
        :message="snackbarMessage"
        :visible="snackbarVisible"
        :type="snackbarType"
        @update:visible="snackbarVisible = $event"
      />
    </div>
  </template>
  
  <script>
  import { collection, getDocs, doc, getDoc, deleteDoc, getFirestore } from 'firebase/firestore';
  import Snackbar from './Snackbar.vue';
  console.log("DeleteAttendance")
  export default {
    name: 'DeleteAttendance',
    components: {
      Snackbar,
    },
    data() {
      return {
        db: getFirestore(),
        classes: [],
        selectedClass: null,
        selectedDate: '',
        deletionMethod: 'metadata', // Default to metadata-based
        snackbarMessage: '',
        snackbarVisible: false,
        snackbarType: 'success',
      };
    },
    async mounted() {
      await this.loadClasses();
    },
    methods: {
      async loadClasses() {
        try {
          const classesRef = collection(this.db, 'Classes');
          const snapshot = await getDocs(classesRef);
          this.classes = snapshot.docs.map(doc => ({
            classId: doc.id,
            className: doc.data().classId,
            studentsIds: doc.data().studentIds || [],
          }));
        } catch (error) {
          this.showSnackbar('Error loading classes: ' + error.message, 'error');
        }
      },
      async deleteAttendance() {
        if (!this.selectedClass || !this.selectedDate) {
          this.showSnackbar('Please select both class and date', 'error');
          return;
        }
  
        try {
          const date = new Date(this.selectedDate);
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          let studentIds = [];
          let usedFallback = false;
  
          if (this.deletionMethod === 'metadata') {
            // Metadata-based deletion
            const metadataDocId = `${this.selectedClass.className}_${formattedDate}`;
            const metadataRef = doc(this.db, 'AttendanceMetadata', metadataDocId);
            const metadataDoc = await getDoc(metadataRef);
  
            if (!metadataDoc.exists()) {
              this.showSnackbar('No AttendanceMetadata found for this class and date. Try Constructed IDs or populate metadata.', 'error');
              return;
            }
  
            studentIds = metadataDoc.data().studentIds || [];
          } else {
            // Constructed IDs deletion
            studentIds = this.selectedClass.studentsIds;
            usedFallback = true;
            if (studentIds.length === 0) {
              this.showSnackbar('No students found for this class', 'error');
              return;
            }
          }
  
          if (studentIds.length === 0) {
            this.showSnackbar('No students recorded for this class and date', 'error');
            return;
          }
  
          // Delete AttendanceRecords documents
          const deletePromises = studentIds.map(async (studentId) => {
            const docId = `${this.selectedClass.className}_${studentId}_${formattedDate}`;
            const docRef = doc(this.db, 'AttendanceRecords', docId);
            try {
              await deleteDoc(docRef);
            } catch (error) {
              if (error.code !== 'not-found') {
                throw error;
              }
            }
          });
  
          await Promise.all(deletePromises);
  
          // Delete the metadata document if using metadata-based deletion
          if (this.deletionMethod === 'metadata') {
            const metadataDocId = `${this.selectedClass.className}_${formattedDate}`;
            const metadataRef = doc(this.db, 'AttendanceMetadata', metadataDocId);
            await deleteDoc(metadataRef);
          }
  
          // Show success message with warning if constructed IDs were used
          let message = 'Attendance records deleted successfully';
          if (usedFallback) {
            message += '. Note: Some records may not have been deleted if students were removed from the class.';
          }
          this.showSnackbar(message, 'success');
          this.selectedClass = null;
          this.selectedDate = '';
          this.deletionMethod = 'metadata'; // Reset to default
        } catch (error) {
          this.showSnackbar('Error deleting attendance: ' + error.message, 'error');
        }
      },
      showSnackbar(message, type) {
        this.snackbarMessage = message;
        this.snackbarType = type;
        this.snackbarVisible = true;
      },
    },
  };
  </script>
  
  <style scoped>
  .delete-attendance {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  select,
  input[type="date"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .toggle-group {
    margin-bottom: 20px;
  }
  
  .toggle-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .toggle-buttons button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f8f8f8;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .toggle-buttons button.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  .method-description {
    font-size: 0.9em;
    color: #555;
    background-color: #f9f9f9;
    padding: 10px;
    border-radius: 4px;
    line-height: 1.5;
  }
  
  .method-description strong {
    color: #333;
  }
  
  button {
    background-color: #dc3545;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  </style>