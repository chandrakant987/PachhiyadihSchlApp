// views/HomePage.vue
<template>
  <div>
    <nav>
      <h1>{{ schoolName }}</h1>
    </nav>
    <section class='news'>
      <marquee>Latest School News & Notifications...</marquee>
    </section>
    <section>
      <div class='image-section'>
        <img v-for="(image, index) in schoolImages" :key="index" :src="image" alt="School Image" />
      </div>
    </section>
    <div class="cards">
      <Card title="E-Shikshakosh" link="/eshikshakosh" />
      <Card title="UDISE" link="https://udiseplus.gov.in/#/en/home" />
      <Card title="Image Gallery" link="/gallery" />
      <ResultCard />
    </div>
    
    <!--
    <section class='result'>
      <h2>Check Result</h2>
      <form @submit.prevent="checkResult">
        <select v-model="rollNumber">
          <option value="">Select Roll Number</option>
          <option v-for="num in 100" :key="num" :value="num">{{ num }}</option>
        </select>
        <input type="text" v-model="registrationNumber" placeholder="Enter Registration Number" />
        <button type="submit">View Result</button>
      </form>
      <div v-if="result">{{ result }}</div>
    </section>
    -->
    <section class='contact'>
      <h2>Contact Us</h2>
      <p>Address: XYZ, Bihar</p>
      <p>Phone: 1234567890</p>
    </section>
  </div>
</template>

<script>
import Card from "../components/Card.vue";
import ResultCard from "../components/ResultCard.vue";


export default {
  components: {
    Card,
    ResultCard
  },
  data() {
    return {
      schoolName: 'उत्क्रमित उच्च माध्यमिक विद्यालय, पछियाडीह',
      schoolImages: ['src\\store\\School1.jpg'],
      rollNumber: '',
      registrationNumber: '',
      result: ''
    };
  },
  methods: {
    checkResult() {
      this.result = `Result for Roll No: ${this.rollNumber}, Reg No: ${this.registrationNumber}`;
    }
  }
};
</script>

<style scoped>
h1 {
  font-size: xxx-large;
}

.image-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 5px;
}
.image-section img {
  width: 98vw;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}
.cards {
  display: flex;
  justify-content: center;
  gap: 25px;
  padding: 20px;
}
.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}
.card:hover {
  transform: scale(1.50);
}
.news {
  padding-top: 5px;
  color: blue;
}
</style>