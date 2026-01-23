<script setup lang="ts">
import { useAssistant } from '@foisit/vue-wrapper';

const props = defineProps<{
  label: string;
  variant?: 'primary' | 'secondary';
}>();

const assistant = useAssistant();

// Register a demo 'escalate' handler and cleanup on unmount
onMounted(() => {
  const handler = async (params?: { incidentId?: number }) => {
    await new Promise((r) => setTimeout(r, 500));
    return `Escalation created for incident ${params?.incidentId ?? 'unknown'}.`;
  };
  assistant.registerCommandHandler('escalate', handler);
});

onBeforeUnmount(() => {
  assistant.unregisterCommandHandler('escalate');
});

const handleClick = () => {
  assistant.toggle();
};

// Programmatic run helper exposed in this demo component
const runEscalate = () => {
  assistant.runCommand({ commandId: 'escalate', params: { incidentId: 456 }, openOverlay: true, showInvocation: true });
};
</script>

<template>
  <button
    class="demo-btn"
    :class="{ secondary: variant === 'secondary' }"
    @click="handleClick"
  >
    {{ label }}
  </button>
  <button class="demo-btn secondary" @click="runEscalate" style="margin-left:8px;">
    Escalate Demo
  </button>
</template>
