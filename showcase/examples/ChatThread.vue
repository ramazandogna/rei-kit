<script setup lang="ts">
import { ChatMessage, ChatThread } from 'rei-kit'
</script>

<template>
  <ChatThread label="Conversation" busy class="h-64">
    <ChatMessage from="user" name="You">Hello</ChatMessage>
    <ChatMessage from="assistant" name="Rei">Hi! How can I help?</ChatMessage>
  </ChatThread>
</template>
