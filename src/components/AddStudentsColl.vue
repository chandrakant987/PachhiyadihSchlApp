<template>
    <div class="container">
      <h2>Upload Student Data (CSV)</h2>
  
      <input type="file" @change="handleCSVUpload" accept=".csv" />
  
      <div v-if="students.length" class="preview">
        <h3>Preview ({{ students.length }} students)</h3>
        <div class="table-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Roll No</th>
                <th>Name</th>
                <th>Father Name</th>
                <th>DOB</th>
                <th>Class</th>
                <th>Active</th>
                <th>Student Contact</th>
                <th>Parent Contact</th>
                <th>Email</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in students" :key="index">
                <td>{{ student.studentId }}</td>
                <td>{{ student.rollNumber }}</td>
                <td>{{ student.name }}</td>
                <td>{{ student.fatherName }}</td>
                <td>{{ student.dob }}</td>
                <td>{{ student.classId }}</td>
                <td>{{ student.active ? 'Yes' : 'No' }}</td>
                <td>{{ student.contact.studentContact }}</td>
                <td>{{ student.contact.parentContact }}</td>
                <td>{{ student.contact.emailId }}</td>
                <td>{{ student.address }}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div class="upload-status" v-if="isUploading">
        <div class="spinner"></div>
        <p>Uploading {{ uploadProgress }} / {{ students.length }}...</p>
      </div>

      <div class="button-group">
        <button class="upload-btn" @click="uploadToFirestore" :disabled="isUploading">
          Upload to Firestore
        </button>
        <button class="clear-btn" @click="clearTable" :disabled="isUploading">
          Clear Table
        </button>
        <button class="cancel-btn" @click="cancelUpload" :disabled="isUploading">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
  
  <script>
  import Papa from 'papaparse';
  import { getFirestore, doc, setDoc } from 'firebase/firestore';
  
  export default {
    name: 'StudentCSVUploader',
    data() {
      return {
        students: [],
        isUploading: false,
        uploadProgress: 0,
      };
    },
    methods: {
      handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
  
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.students = results.data.map((row) => this.transformStudentData(row));
            alert('CSV parsed successfully!');
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            alert('Failed to parse CSV.');
          },
        });
      },
  
      transformStudentData(row) {
        row.active = row.active === 'true' || row.active === 'TRUE';
  
        const contact = {
            studentContact: row['contact.studentContact'] || '',
            parentContact: row['contact.parentContact'] || '',
            emailId: row['contact.emailId'] || '',
        };
  
        delete row['contact.studentContact'];
        delete row['contact.parentContact'];
        delete row['contact.emailId'];
  
        return {
          ...row,
          contact,
        };
      },
  
      async uploadToFirestore() {
        const db = getFirestore();
        this.isUploading = true;
        this.uploadProgress = 0;
  
        for (let i = 0; i < this.students.length; i++) {
            const student = this.students[i];
            const studentId = student.studentId;
            //const { studentId: _, ...data } = student;
  
          try {
            await setDoc(doc(db, 'Students', studentId), this.students[i]);
            this.uploadProgress = i + 1;
          } catch (error) {
            console.error(`Error uploading ${studentId}:`, error);
          }
        }
  
        alert('All students uploaded successfully!');
        this.isUploading = false;
        this.students = []; // Clear table after successful upload
      },

      clearTable() {
        if (confirm('Are you sure you want to clear the uploaded data?')) {
            this.students = [];
        }
      },

      cancelUpload() {
        if (confirm('Cancel upload and remove all data?')) {
            this.students = [];
            // You can also navigate to another page here if needed
        }
      },

    },
  };
  </script>
  
  <style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.preview {
  margin-top: 20px;
}

.table-wrapper {
  max-height: 400px;
  overflow: auto;
  border: 1px solid #ccc;
  margin-top: 10px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.preview-table th {
  background-color: #f0f0f0;
  position: sticky;
  top: 0;
}

.button-group {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.upload-btn,
.clear-btn,
.cancel-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.upload-btn {
  background-color: #2e7d32;
}

.upload-btn:hover {
  background-color: #1b5e20;
}

.clear-btn {
  background-color: #e53935;
}

.clear-btn:hover {
  background-color: #b71c1c;
}

.cancel-btn {
  background-color: #757575;
}

.cancel-btn:hover {
  background-color: #424242;
}

.upload-btn:disabled,
.clear-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.spinner {
  border: 4px solid #ccc;
  border-top: 4px solid #2e7d32;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>