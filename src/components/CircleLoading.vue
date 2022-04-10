<template>
  <div class="circle-loading">
    <div class="circle-loading__circle"></div>
  </div>
</template>
<script>
export default {};
</script>
<style lang="scss" scoped>
.circle-loading {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  &__circle {
    width: 70px;
    height: 70px;
    border: 5px solid rgb(209, 209, 209);
    border-top: 5px solid black;
    border-radius: 50%;
    animation: spin linear 3s infinite;
  }
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>