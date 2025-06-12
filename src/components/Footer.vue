<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <div class="columns">
        <div class="column">
          <h4 class="title is-6">My Lego App</h4>
          <p class="subtitle is-7">Organize and manage your LEGO collection</p>
        </div>
        <div class="column">
          <h4 class="title is-6">Quick Links</h4>
          <ul>
            <li>
              <router-link to="/">Home</router-link>
            </li>
            <li>
              <router-link to="/sets">My Sets</router-link>
            </li>
            <li>
              <router-link to="/search">Search</router-link>
            </li>
          </ul>
        </div>
        <div class="column">
          <h4 class="title is-6">Resources</h4>
          <ul>
            <li>
              <a href="https://rebrickable.com/" target="_blank" rel="noopener"> Rebrickable </a>
            </li>
            <li>
              <a href="https://www.lego.com/" target="_blank" rel="noopener"> LEGO Official </a>
            </li>
          </ul>
        </div>
      </div>
      <p class="mt-4">
        <small>
          Made with <span class="icon has-text-danger"><i class="fas fa-heart"></i></span> for LEGO
          fans
        </small>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  padding: 2rem 1.5rem;
  margin-top: 2rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: #4a4a4a;
}

a:hover {
  color: #3273dc;
}
</style>
