<template>
    <div class="search-container">
      <h2>Search Result</h2>
      <form @submit.prevent="fetchResult">
        <label>Class:
          <select v-model="selectedClass">
            <option value="Class_9">Class 9</option>
            <option value="Class_10">Class 10</option>
          </select>
        </label>
        <label>Section:
          <select v-model="selectedSection">
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </label>
        <label>Roll Number:
          <input type="number" v-model="rollNumber" required />
        </label>
        <button type="submit">View Result</button>
      </form>

      <div class="header">
        <h2>Bihar School Examination Board</h2>
        <h3>RESULT</h3>
        <h4>ANNUAL EXAMINATION - 2025</h4>
      </div>
      
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading result...</p>
      </div>

      <div v-else-if="result">
        <button @click="shareResultOnWhatsApp" class="whatsapp-btn">
          Share via WhatsApp
        </button>
        <h3>Student Result</h3>
        <table>
          <thead><tr><td><b>Student Name</b></td><td>{{ result.STUDENT_NAME }}</td></tr></thead>
          <thead><tr><td><b>Father's Name</b></td><td>{{ result.FATHERS_NAME }}</td></tr></thead>
          <thead><tr><td><b>School Name</b></td><td>10360904602 - UUMV PACHHIYADIH</td></tr></thead>
          <thead><tr><td><b>Roll Number</b></td><td>{{ result.Roll_No }}</td></tr></thead>
          <thead><tr><td><b>Section</b></td><td>{{ result.Section }}</td></tr></thead>
        </table>
      
        <h3>Marks Details</h3>
        <table>
          <thead><tr>
              <th>Subject</th>
              <th>F. Marks</th>
              <th>P. Marks</th>
              <th>Theory + Practical</th>
              <th>Subject Total</th>
          </tr></thead>
          <tbody><tr :class="result.MIL >=30 ? 'ps' : 'fl'"><td><b>M.I.L. HINDI/URDU</b></td><td>100</td><td>30</td><td>{{ result.MIL }}</td><td><b>{{ result.MIL }}</b></td></tr></tbody>
          <tbody><tr :class="result.SIL >=30 ? 'ps' : 'fl'"><td><b>S.I.L. SANSKRIT/NLH</b></td><td>100</td><td>30</td><td>{{ result.SIL }}</td><td><b>{{ result.SIL }}</b></td></tr></tbody>
          <tbody><tr :class="result.MAT >=30 ? 'ps' : 'fl'"><td><b>MATHEMATICS</b></td><td>100</td><td>30</td><td>{{ result.MAT }}</td><td><b>{{ result.MAT }}</b></td></tr></tbody>
          <tbody><tr :class="result.SCI >=30 ? 'ps' : 'fl'"><td><b>SCIENCE</b></td><td>100</td><td>30</td><td>{{ result.SCI }}</td><td><b>{{ result.SCI }}</b></td></tr></tbody>
          <tbody><tr :class="result.SSC >=30 ? 'ps' : 'fl'"><td><b>SOCIAL SCIENCE</b></td><td>100</td><td>30</td><td>{{ result.SSC }}</td><td><b>{{ result.SSC }}</b></td></tr></tbody>
          <tbody><tr :class="result.ENG >=30 ? 'ps' : 'fl'"><td>ENGLISH</td><td>100</td><td>30</td><td>{{ result.ENG }}</td><td>{{ result.ENG }}</td></tr></tbody>
        </table>
      
        <h3>Final Result</h3>
        <table>
            <thead><tr :class="result.Result == 'PASS' ? 'ps' : 'fl'"><td><b>Result/Division</b></td><td>{{ result.Result  }}</td><td>Grade</td><td>{{ result.Grade }}</td></tr></thead>
            <tbody><tr><td><b>Total Marks</b></td><td>{{ result.AGGREGATE }}</td><td>Total Percentage</td><td>{{ result.Percentage }} %</td></tr></tbody>
            <tbody><tr><td><b>New Roll Number</b></td><td>{{ result.New_Roll_Number }}</td><td><b>New Section</b></td><td>{{ (result.New_Roll_Number)<=42 ? 'A':'B' }}</td></tr></tbody>
        </table>
        <button @click="downloadPDF">Download as PDF</button>
      </div>
    </div>
  </template>
  
  <script>
  import { getDatabase, ref as dbRef, get } from "firebase/database";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import { inject } from 'vue';
  
  export default {
    data() {
      return {
        selectedClass: "Class_9",
        selectedSection: "A",
        rollNumber: "",
        result: null,
        loading: false
      };
    },
    methods: {
      async fetchResult() {
        this.loading = true; // Start loading
        this.result = null;
        if (!this.rollNumber) return alert("Please enter a roll number");
        
        try {
          const db = getDatabase();
          const snapshot = await get(dbRef(db, `results/${this.selectedClass}/${this.selectedSection}/${this.rollNumber}`));
          if (snapshot.exists()) {
            this.result = snapshot.val();
            console.log(this.result);
          } else {
            alert("Result not found!");
          }
        } catch(error) {
          console.error("Error fetching result:", error);
        } finally {
          this.loading = false; // Stop loading
        }
      },

      //Whatspp -- start
      shareResultOnWhatsApp() {
        const phoneNumber = this.result?.Whatsapp || this.config.defaultWhatsapp; // get from result object
        const result = this.result;

        const message = encodeURIComponent(`
          Student Result: Class 9

          Name: ${result.STUDENT_NAME}
          Father's Name: ${result.FATHERS_NAME}
          Roll No: ${result.Roll_No}

          Marks:
          - Hindi: ${result.MIL}
          - Sanskrit: ${result.SIL}
          - Math: ${result.MAT}
          - Science: ${result.SCI}
          - Soc. Science: ${result.SSC}
          - English: ${result.ENG}

          Total Marks: ${result.AGGREGATE}
          Percentage: ${result.Percentage}%
          Result: ${result.Result} (${result.Grade})

          View mark sheet:
          https://your-website.com/results?roll=${result.Roll_No}`
        );

        if (!phoneNumber || phoneNumber.length < 10) {
          const whatsappURL1 = `https://wa.me/?text=${message}`;
          window.open(whatsappURL1, '_blank');
          //alert("Invalid or missing WhatsApp number.");
        }
        else {
          const whatsappURL2 = `https://wa.me/${phoneNumber}?text=${message}`;
          window.open(whatsappURL2, '_blank');
        }
      },
      //Whatsapp -- end

      downloadPDF() {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("Student Result", 80, 10);

        // Student Details
        doc.setFontSize(12);
        let y = 20;
        doc.text(`Student Name: ${this.result.STUDENT_NAME}`, 20, y);
        doc.text(`Father's Name: ${this.result.FATHERS_NAME}`, 20, y + 10);
        doc.text(`School Name: 10360904602 - UUMV PACHHIYADIH`, 20, y + 20);
        doc.text(`Roll Number: ${this.result.Roll_No}`, 20, y + 30);
        doc.text(`Section: ${this.result.Section}`, 20, y + 40);

        // Marks Table
        y += 50;
        const tableColumn = ["Subject", "F. Marks", "P. Marks", "Subject Total"];
        const tableRows = [
            ["M.I.L. HINDI/URDU", "100", "-", this.result.MIL],
            ["S.I.L. SANSKRIT/NLH", "100", "-", this.result.SIL],
            ["MATHEMATICS", "100", "-", this.result.MAT],
            ["SCIENCE", "100", "30", this.result.SCI],
            ["SOCIAL SCIENCE", "100", "30", this.result.SSC],
            ["ENGLISH", "100", "-", this.result.ENG]
        ];

        autoTable(doc, {
            startY: y,
            head: [tableColumn],
            body: tableRows,
            theme: "striped",
        });
      
        // Final Result Section
        y = doc.lastAutoTable.finalY + 10;
        doc.text("Final Result", 80, y);
      
        autoTable(doc, {
            startY: y + 10,
            body: [
                ["Result/Division", this.result.Result, "Grade", this.result.Grade],
                ["Total Marks", this.result.AGGREGATE, "Total Percentage", `${this.result.Percentage}%`],
                ["New Roll Number", this.result.New_Roll_Number, "New Section", this.result.New_Roll_Number <= 42 ? "A" : "B"]
            ],
            theme: "grid",
        });
      
        // Save as PDF
        doc.save(`${this.result.STUDENT_NAME}_Result.pdf`);
      }
    }
  };
  </script>
  
  <style scoped>
  .search-container {
    width: 60%;
    margin: auto;
    text-align: center;
  }
  form {
    margin: 20px 0;
  }

  input, select, button {
    margin: 5px;
    padding: 8px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  body {
      font-family: Arial, sans-serif;
      width: 100vw;
      margin: auto;
      border: 1px solid #ccc;
      padding: 20px;
  }

  .header {
      text-align: center;
      font-weight: bold;
  }

  th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: center;
  }

  th {
      background-color: #f4a42d;
      color: white;
  }
  .ps {
      background-color: lightgreen;
  }
  .fl {
      background-color: lightcoral;
  }
  .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 50px;
  }
  .spinner {
      border: 6px solid #f3f3f3;
      border-top: 6px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }
  .whatsapp-btn {
    margin-top: 20px;
    padding: 10px 16px;
    background-color: #25d366;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  }
  .whatsapp-btn:hover {
    background-color: #1da851;
  }
</style>