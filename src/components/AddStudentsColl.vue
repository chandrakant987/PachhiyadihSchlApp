<template>
  <div class="container">
    <h2>Upload Student Data (CSV)</h2>
    <form @submit.prevent="uploadToFirestore">
      <div class="form-group">
        <label for="csvUpload">CSV File</label>
        <input
          id="csvUpload"
          type="file"
          @change="handleCSVUpload"
          accept=".csv"
          ref="fileInput"
          required
          aria-label="Upload student data CSV"
        />
      </div>

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

        <div v-if="isUploading" class="upload-status">
          <svg class="spinner" viewBox="0 0 24 24" fill="#1e3a8a">
            <path d="M12 4V2A10 10 0 0 0 2 12H4A8 8 0 0 1 12 4Z" />
          </svg>
          <p>Uploading {{ uploadProgress }} / {{ students.length }}...</p>
        </div>

        <div class="button-group">
          <button
            type="submit"
            class="upload-btn"
            :disabled="isUploading"
            aria-label="Upload to Firestore"
          >
            Upload to Firestore
          </button>
          <button
            type="button"
            class="clear-btn"
            @click="clearTable"
            :disabled="isUploading"
            aria-label="Clear table"
          >
            Clear Table
          </button>
          <button
            type="button"
            class="cancel-btn"
            @click="cancelUpload"
            :disabled="isUploading"
            aria-label="Cancel upload"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>

    <Snackbar :message="snackbarMsg" :visible="showSnackbar" :type="snackbarType" />
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
    width: 95%; /* Responsive width */
    max-width: 600px; /* Upper limit for larger screens */
    margin: 15px auto;
    padding: 15px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow-x: hidden; /* Prevent horizontal scrollbars */
  }
  
  h2 {
    text-align: center;
    color: #1e3a8a;
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 1.3rem;
    color: #1e3a8a;
    margin: 15px 0;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    color: #1e3a8a;
    font-weight: 500;
    margin-bottom: 5px;
  }
  
  input[type="file"] {
    width: 100%;
    padding: 8px;
    margin-top: 4px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    box-sizing: border-box;
    font-size: 0.9rem;
    color: #333;
  }
  
  input:focus {
    outline: none;
    border-color: #1e40af;
    box-shadow: 0 0 4px rgba(30, 64, 175, 0.3);
  }
  
  .preview {
    margin-top: 15px;
  }
  
  .table-wrapper {
    max-height: 300px; /* Reduced for compactness */
    overflow-y: auto;
    overflow-x: auto; /* Allow horizontal scroll on mobile if needed */
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    margin-top: 10px;
  }
  
  .preview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  
  .preview-table th,
  .preview-table td {
    border: 1px solid #e2e8f0;
    padding: 6px;
    text-align: left;
    white-space: nowrap; /* Prevent text wrapping */
    overflow: hidden;
    text-overflow: ellipsis; /* Truncate long text */
    max-width: 150px; /* Limit column width */
    min-width: 80px; /* Ensure readability */
  }
  
  .preview-table th {
    background: linear-gradient(to right, #1e3a8a, #1e40af);
    color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  .preview-table td {
    color: #333;
  }
  
  .button-group {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
    overflow: hidden; /* Prevent scrollbars from button scaling */
    padding: 5px; /* Extra padding for scaled buttons */
  }
  
  .upload-btn,
  .clear-btn,
  .cancel-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    will-change: transform; /* Optimize animation performance */
  }
  
  .upload-btn {
    background: linear-gradient(to right, #1e3a8a, #1e40af);
    color: #facc15;
  }
  
  .upload-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
  }
  
  .clear-btn {
    background: #64748b;
    color: #ffffff;
  }
  
  .clear-btn:hover {
    background: #475569;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(71, 85, 105, 0.3);
  }
  
  .cancel-btn {
    background: #e63946;
    color: #ffffff;
  }
  
  .cancel-btn:hover {
    background: #d00000;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(208, 0, 0, 0.3);
  }
  
  .upload-btn:disabled,
  .clear-btn:disabled,
  .cancel-btn:disabled {
    background: #64748b;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .upload-status {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 15px;
    justify-content: center;
    color: #1e3a8a;
    font-size: 0.9rem;
  }
  
  .spinner {
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  /* Mobile adjustments */
  @media (max-width: 768px) {
    .container {
      padding: 10px;
      width: 100%; /* Full width on small screens */
    }
  
    h2 {
      font-size: 1.3rem;
    }
  
    h3 {
      font-size: 1.1rem;
    }
  
    input[type="file"] {
      padding: 6px;
      font-size: 0.85rem;
    }
  
    .preview-table {
      font-size: 0.8rem;
    }
  
    .preview-table th,
    .preview-table td {
      padding: 4px;
      min-width: 60px; /* Smaller columns for mobile */
      max-width: 120px;
    }
  
    .button-group {
      flex-wrap: wrap; /* Allow buttons to wrap if needed */
    }
  
    .upload-btn,
    .clear-btn,
    .cancel-btn {
      padding: 8px 16px;
      font-size: 0.85rem;
    }
  }
  </style>