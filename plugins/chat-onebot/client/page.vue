<template>
  <div class="chat-onebot-container">
    <iframe :src="iframeUrl" class="chat-onebot-iframe" frameborder="0"
      allow="clipboard-read; clipboard-write"></iframe>
  </div>
</template>

<script setup lang="ts">
defineProps<{ iframeUrl: string }>()
</script>

<style scoped>
.chat-onebot-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.chat-onebot-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
