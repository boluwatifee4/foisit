<script setup lang="ts">
import { AssistantProvider } from '@foisit/vue-wrapper';
import Header from '../views/Header.vue';
import ControlPanel from '../views/ControlPanel.vue';

// Configuration for the assistant
const assistantConfig = {
  activationCommand: 'john',
  fallbackResponse: 'Sorry, I didn’t understand that.',
  commands: [
    { command: 'turn red', action: () => (document.body.style.backgroundColor = 'red') },
    { command: 'show alert', action: () => alert('Assistant executed the "show alert" command') },
    { command: 'remove background', action: () => (document.body.style.backgroundColor = 'transparent') },
  ],
};
</script>

<template>
  <!-- AssistantProvider wrapping the entire app -->
  <AssistantProvider :config="assistantConfig">
    <div class="app">
      <Header />
      <ControlPanel />
    </div>
  </AssistantProvider>
</template>

<style scoped lang="scss">
/* Basic styling */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.app {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}
</style>
