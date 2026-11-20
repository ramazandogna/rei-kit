<script setup lang="ts">
import { ref } from 'vue'
import { PricingCard } from 'rei-kit'

const period = ref<'monthly' | 'yearly'>('monthly')
const plans = [
  {
    id: 'free',
    name: 'Free',
    lead: 'For trying it out',
    monthly: 0,
    yearly: 0,
    features: ['1 project', 'Community support'],
    cta: { label: 'Start free' },
  },
  {
    id: 'pro',
    name: 'Pro',
    lead: 'For teams',
    monthly: 12,
    yearly: 115,
    featured: true,
    features: ['Unlimited projects', 'Priority support', 'Custom palettes'],
    cta: { label: 'Go Pro' },
  },
  {
    id: 'team',
    name: 'Team',
    monthly: 29,
    yearly: 279,
    features: ['Everything in Pro', 'SSO'],
    cta: { label: 'Contact sales', href: '#contact' },
  },
]
</script>

<template>
  <div style="width: min(60rem, 100%)">
    <PricingCard v-model:period="period" label="Pricing" save-label="Save 20%" :plans="plans" />
  </div>
</template>
