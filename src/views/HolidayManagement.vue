<template>
    <div class="holiday-management container mx-auto p-4">
      <!-- Form for Adding/Editing Holidays -->
      <div class="form-section bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">{{ isEditing ? 'Edit Holiday' : 'Add Holiday' }}</h2>
        <form @submit.prevent="saveHoliday">
          <div class="mb-4">
            <label class="block text-gray-700">Start Date</label>
            <input
              v-model="form.startDate"
              type="date"
              class="w-full border rounded p-2"
              :min="`${form.year}-01-01`"
              :max="`${form.year}-12-31`"
            />
            <p v-if="errors.startDate" class="text-red-500 text-sm">{{ errors.startDate }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">End Date</label>
            <input
              v-model="form.endDate"
              type="date"
              class="w-full border rounded p-2"
              :min="`${form.year}-01-01`"
              :max="`${form.year}-12-31`"
            />
            <p v-if="errors.endDate" class="text-red-500 text-sm">{{ errors.endDate }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Description</label>
            <input
              v-model="form.description"
              type="text"
              class="w-full border rounded p-2"
              placeholder="e.g., Diwali, Summer Vacation"
            />
            <p v-if="errors.description" class="text-red-500 text-sm">{{ errors.description }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Calendar Year</label>
            <select v-model="form.year" class="w-full border rounded p-2">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="flex space-x-4">
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              :disabled="isLoading"
            >
              {{ isEditing ? 'Update' : 'Add' }} Holiday
            </button>
            <button
              v-if="isEditing"
              type="button"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
  
      <!-- Mark Sundays Button -->
      <div class="sundays-section bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-4">Mark Sundays</h2>
        <div class="flex items-center space-x-4">
          <select v-model="sundaysYear" class="border rounded p-2">
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            @click="markSundays"
            :disabled="isLoading"
          >
            Mark Sundays for {{ sundaysYear }}
          </button>
        </div>
      </div>
  
      <!-- Holiday List -->
      <div class="list-section bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Holidays</h2>
        <div class="mb-4">
          <label class="block text-gray-700">Filter by Year</label>
          <select v-model="filterYear" class="border rounded p-2">
            <option value="">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2">Date Range</th>
              <th class="border p-2">Description</th>
              <th class="border p-2">Year</th>
              <th class="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="holiday in filteredHolidays" :key="holiday.id">
              <td class="border p-2">
                {{ holiday.startDate }} {{ holiday.startDate !== holiday.endDate ? `to ${holiday.endDate}` : '' }}
              </td>
              <td class="border p-2">{{ holiday.description }}</td>
              <td class="border p-2">{{ holiday.year }}</td>
              <td class="border p-2">
                <button
                  class="text-blue-500 hover:underline mr-2"
                  @click="editHoliday(holiday)"
                >
                  Edit
                </button>
                <button
                  class="text-red-500 hover:underline"
                  @click="confirmDelete(holiday)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Confirmation Dialog -->
      <div
        v-if="showConfirmDialog"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div class="bg-white rounded-lg p-6">
          <h3 class="text-lg font-bold mb-4">{{ confirmDialog.title }}</h3>
          <p class="mb-4">{{ confirmDialog.message }}</p>
          <div class="flex space-x-4">
            <button
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              @click="confirmDialog.action"
            >
              Confirm
            </button>
            <button
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              @click="showConfirmDialog = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
  
      <!-- Toast Notification -->
      <div
        v-if="toastMessage"
        class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg"
      >
        {{ toastMessage }}
      </div>
    </div>
  </template>
  
  <script>
  import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getFirestore,
  } from 'firebase/firestore';
  import { formatInTimeZone, toDate } from 'date-fns-tz';
  import { isSunday } from 'date-fns';
  
  export default {
    name: 'HolidayManagement',
    data() {
      return {
        db: getFirestore(),
        // Form state
        form: {
          startDate: '',
          endDate: '',
          description: '',
          year: new Date().getFullYear().toString(),
        },
        isEditing: false,
        editingHolidayId: null,
        errors: {},
        isLoading: false,
        // Holidays list
        holidays: [],
        filterYear: '',
        sundaysYear: new Date().getFullYear().toString(),
        // Dialog and toast
        showConfirmDialog: false,
        confirmDialog: { title: '', message: '', action: null },
        toastMessage: '',
      };
    },
    computed: {
      // Available years (e.g., 2024–2026)
      availableYears() {
        const currentYear = new Date().getFullYear();
        return [currentYear - 1, currentYear, currentYear + 1].map(String);
      },
      // Filtered holidays based on year and exclude Sundays within holidays
      filteredHolidays() {
        let holidays = this.holidays;
        if (this.filterYear) {
          holidays = holidays.filter(h => h.year === this.filterYear);
        }
        // Filter out Sundays that fall within multi-day holidays
        return holidays.filter(h => {
          if (h.description !== 'Sunday') return true; // Include non-Sundays
          // Check if this Sunday falls within any multi-day holiday
          return !holidays.some(other => {
            if (other.description === 'Sunday') return false; // Skip other Sundays
            return h.startDate >= other.startDate && h.startDate <= other.endDate;
          });
        });
      },
    },
    mounted() {
      this.fetchHolidays();
    },
    methods: {
      // Fetch holidays from Firestore
      async fetchHolidays() {
        try {
          const q = query(collection(this.db, 'Holidays'), orderBy('startDate', 'asc'));
          const snapshot = await getDocs(q);
          this.holidays = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error) {
          this.showToast('Error fetching holidays: ' + error.message);
        }
      },
      // Validate form
      validateForm() {
        this.errors = {};
        const { startDate, endDate, description, year } = this.form;
        if (!startDate) {
          this.errors.startDate = 'Please select a start date';
        }
        if (!endDate) {
          this.errors.endDate = 'Please select an end date';
        }
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (start > end) {
            this.errors.endDate = 'End date must be on or after start date';
          } else if (
            start.getFullYear() !== parseInt(year) ||
            end.getFullYear() !== parseInt(year)
          ) {
            this.errors.startDate = 'Dates must be within the selected year';
          }
          // Check for overlaps with non-Sunday holidays
          const overlap = this.holidays.some(h => {
            if (this.isEditing && h.id === this.editingHolidayId) return false;
            if (h.description === 'Sunday') return false; // Skip Sundays
            return startDate <= h.endDate && endDate >= h.startDate;
          });
          if (overlap) {
            this.errors.startDate = 'Date range overlaps with an existing non-Sunday holiday';
          }
        }
        if (!description.trim()) {
          this.errors.description = 'Description is required';
        }
        return Object.keys(this.errors).length === 0;
      },
      // Save holiday (add or update)
      async saveHoliday() {
        if (!this.validateForm()) return;
        this.isLoading = true;
        try {
          const holidayData = {
            startDate: this.form.startDate,
            endDate: this.form.endDate,
            description: this.form.description.trim(),
            year: this.form.year,
          };
          if (this.isEditing) {
            await updateDoc(doc(this.db, 'Holidays', this.editingHolidayId), holidayData);
            this.showToast('Holiday updated successfully');
          } else {
            await addDoc(collection(this.db, 'Holidays'), holidayData);
            this.showToast('Holiday added successfully');
          }
          this.resetForm();
          await this.fetchHolidays();
        } catch (error) {
          this.showToast('Error saving holiday: ' + error.message);
        } finally {
          this.isLoading = false;
        }
      },
      // Edit holiday
      editHoliday(holiday) {
        this.isEditing = true;
        this.editingHolidayId = holiday.id;
        this.form.startDate = holiday.startDate;
        this.form.endDate = holiday.endDate;
        this.form.description = holiday.description;
        this.form.year = holiday.year;
      },
      // Cancel edit
      cancelEdit() {
        this.resetForm();
      },
      // Reset form
      resetForm() {
        this.form.startDate = '';
        this.form.endDate = '';
        this.form.description = '';
        this.form.year = new Date().getFullYear().toString();
        this.isEditing = false;
        this.editingHolidayId = null;
        this.errors = {};
      },
      // Confirm delete
      confirmDelete(holiday) {
        this.showConfirmDialog = true;
        this.confirmDialog = {
          title: 'Delete Holiday',
          message: `Are you sure you want to delete "${holiday.description}" (${holiday.startDate} to ${holiday.endDate})?`,
          action: () => this.deleteHoliday(holiday.id),
        };
      },
      // Delete holiday
      async deleteHoliday(id) {
        try {
          await deleteDoc(doc(this.db, 'Holidays', id));
          this.showToast('Holiday deleted successfully');
          await this.fetchHolidays();
        } catch (error) {
          this.showToast('Error deleting holiday: ' + error.message);
        } finally {
          this.showConfirmDialog = false;
        }
      },
      // Mark Sundays
      async markSundays() {
        const year = parseInt(this.sundaysYear);
        // Check if Sundays already exist
        const existingSundays = this.holidays.filter(
          h => h.year === this.sundaysYear && h.description === 'Sunday'
        );
        if (existingSundays.length > 0) {
          this.showConfirmDialog = true;
          this.confirmDialog = {
            title: 'Sundays Already Exist',
            message: `Sundays for ${year} are already generated. Regenerate and overwrite?`,
            action: () => this.generateSundays(year, true),
          };
          return;
        }
        this.generateSundays(year);
      },
      // Generate Sundays in IST
      async generateSundays(year, overwrite = false) {
        this.isLoading = true;
        try {
          // Delete existing Sundays if overwriting
          if (overwrite) {
            const sundaysQuery = query(
              collection(this.db, 'Holidays'),
              where('year', '==', year.toString()),
              where('description', '==', 'Sunday')
            );
            const snapshot = await getDocs(sundaysQuery);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
          }
  
          // Generate Sundays
          const sundays = [];
          const start = new Date(year, 0, 1);
          const end = new Date(year, 11, 31);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatInTimeZone(d, 'Asia/Kolkata', 'yyyy-MM-dd');
            // Convert date string to Date object in IST
            const dateInIST = toDate(dateStr, { timeZone: 'Asia/Kolkata' });
            const isSundayInIST = isSunday(dateInIST);
            console.log(`Checking ${dateStr}: ${isSundayInIST ? 'Sunday' : 'Not Sunday'} in IST`);
            if (isSundayInIST) {
              // Check if date is within a multi-day holiday
              const isWithinHoliday = this.holidays.some(h => {
                if (h.description === 'Sunday') return false;
                return dateStr >= h.startDate && dateStr <= h.endDate;
              });
              if (!isWithinHoliday) {
                sundays.push({
                  startDate: dateStr,
                  endDate: dateStr,
                  description: 'Sunday',
                  year: year.toString(),
                });
              }
            }
          }
  
          // Log generated Sundays
          console.log(`Generated ${sundays.length} Sundays for ${year}:`, sundays.map(s => s.startDate));
  
          // Batch write Sundays
          const batchPromises = sundays.map(sunday => addDoc(collection(this.db, 'Holidays'), sunday));
          await Promise.all(batchPromises);
          this.showToast(`Successfully generated ${sundays.length} Sundays for ${year}`);
          await this.fetchHolidays();
        } catch (error) {
          this.showToast('Error generating Sundays: ' + error.message);
        } finally {
          this.isLoading = false;
          this.showConfirmDialog = false;
        }
      },
      // Show toast
      showToast(message) {
        this.toastMessage = message;
        setTimeout(() => (this.toastMessage = ''), 3000);
      },
      // Calculate totalDays for attendance
      async calculateTotalDays(startDate, endDate) {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const years = [start.getFullYear(), end.getFullYear()]
            .filter((y, i, arr) => arr.indexOf(y) === i)
            .map(String);
  
          // Fetch holidays for relevant years
          const q = query(collection(this.db, 'Holidays'), where('year', 'in', years));
          const snapshot = await getDocs(q);
          const holidays = snapshot.docs.map(doc => doc.data());
  
          // Calculate total days
          let totalDays = 0;
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const isHoliday = holidays.some(h => dateStr >= h.startDate && dateStr <= h.endDate);
            if (!isHoliday) totalDays++;
          }
          return totalDays;
        } catch (error) {
          console.error('Error calculating totalDays:', error);
          return 0;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .holiday-management {
    max-width: 1200px;
  }
  
  .form-section,
  .sundays-section,
  .list-section {
    border: 1px solid #e5e7eb;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th,
  td {
    text-align: left;
  }
  
  @media (max-width: 640px) {
    table {
      display: block;
      overflow-x: auto;
    }
  }
  </style>