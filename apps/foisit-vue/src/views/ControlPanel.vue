<script setup lang="ts">
import { useAssistant } from '@foisit/vue-wrapper';
import { ref } from 'vue';

// Logs for assistant actions
const logs = ref<string[]>([]);

// Access the assistant service
const assistant = useAssistant();

// Helper to add logs
const addLog = (message: string) => {
  logs.value.unshift(message); // Add message to the log
};

// Dynamically add a new command
const addBlueCommand = () => {
  assistant.addCommand('turn blue', () => {
    document.body.style.backgroundColor = 'blue';
    addLog('Background turned blue.');
  });
  addLog('Command "turn blue" added.');
};

// Reactivate the assistant manually
const reactivateAssistant = () => {
  assistant.startListening();
  addLog('Assistant reactivated.');
};

// Clear all logs
const clearLogs = () => {
  logs.value = [];
  addLog('Logs cleared.');
};
</script>

<template>
  <main class="control-panel">
    <!-- Buttons for interacting with the assistant -->
    <div class="buttons">
      <button @click="addBlueCommand">Add "Turn Blue" Command</button>
      <button @click="reactivateAssistant">Reactivate Assistant</button>
      <button @click="clearLogs">Clear Logs</button>
    </div>

    <!-- Log display -->
    <section class="logs">
      <h2>Logs</h2>
      <ul>
        <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
      </ul>
      <p v-if="logs.length === 0">No logs available. Interact with the assistant!</p>
    </section>
  </main>
</template>

<style scoped lang="scss">
.control-panel {
  text-align: center;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  font-size: 14px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #3b7fd1;
}

.logs {
  text-align: left;
  margin-top: 20px;
}

.logs ul {
  list-style: none;
  padding: 0;
}

.logs li {
  background: #f4f4f4;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
}
</style>
