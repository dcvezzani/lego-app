<template>
  <div class="home">
    <h1>My Lego App</h1>
    <div class="search-container">
      <input type="text" placeholder="Search for LEGO sets..." />
      <button>Search</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.search-container {
  margin: 20px auto;
  max-width: 600px;
}

input {
  padding: 10px;
  width: 70%;
  margin-right: 10px;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3aa876;
}
</style>
