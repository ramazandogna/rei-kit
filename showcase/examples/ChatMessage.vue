<script setup lang="ts">
import { ChatMessage } from 'rei-kit'
</script>

<template>
  <div class="grid gap-3">
    <ChatMessage from="system">Today</ChatMessage>
    <ChatMessage from="user" name="You" time="2026-01-01T10:00:00Z"
      >What changed in 5.0?</ChatMessage
    >
    <ChatMessage from="assistant" name="Rei" streaming>Four new materials, and</ChatMessage>
  </div>
</template>
