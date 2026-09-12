<script setup lang="ts">
import { computed, ref } from 'vue'

import ApiReference from './ApiReference.vue'
import GalleryExtra from './GalleryExtra.vue'
import SideNav from './SideNav.vue'

import {
  BaseAlert,
  BaseBadge,
  BaseButton,
  BaseInput,
  BaseCard,
  BaseCheckbox,
  BaseRadioGroup,
  BaseSelect,
  BaseTextarea,
  EmptyState,
  GoogleButton,
  PageContainer,
  ProgressBar,
  SectionHeading,
  SegmentedControl,
  SettingsGroup,
  SettingsRow,
  SkeletonList,
  StatCard,
  ToastHost,
  ToneDot,
  VERSION,
  applyTheme,
  useToast,
} from '../src/index'

/**
 * What is in the kit, on one page.
 *
 * This exists because of a complaint that turned out to be measurable: the
 * kit's newest consumer used twelve of its symbols and hand-wrote 737 class
 * attributes, while the two it was extracted from used thirty-odd each. Part
 * of that was a real gap — no desktop parts — and part of it was simpler than
 * that. There was no way to see what the kit contained. Finding out meant
 * reading `public-api.spec.ts`, so in practice nobody did, and every app
 * reached for Tailwind first.
 *
 * A component nobody can see is a component nobody uses. This page is the
 * cheapest fix for that, and it doubles as a check on the install
 * instructions: it wires the kit exactly the way the README tells a consumer
 * to, so a broken setup shows up here before it ships.
 *
 * Grouped by what a thing is for rather than alphabetically — somebody arrives
 * here needing "a way to show a warning", not needing the letter A.
 */
const theme = ref<'light' | 'dark'>('light')

function setTheme(next: string) {
  theme.value = next as 'light' | 'dark'
  applyTheme(theme.value)
}

const copied = ref(false)

/** The one thing a visitor is here to take away. */
async function copyInstall() {
  try {
    await navigator.clipboard.writeText('pnpm add rei-kit')
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    // Clipboard refused -- an insecure origin, or a browser asking first. The
    // command is on screen either way, which is why this is not an error.
  }
}

const progress = ref(7)
const email = ref('')
const segment = ref('all')
const currency = ref('')
const note = ref('')
const themeChoice = ref('system')
const remember = ref(false)
const toast = useToast()

const TONES = ['info', 'success', 'warning', 'danger'] as const
const BADGES = ['neutral', 'primary', 'success', 'warning', 'danger'] as const

const percent = computed(() => Math.round((progress.value / 28) * 100))
</script>

<template>
  <div class="bg-canvas text-ink min-h-dvh pb-24">
    <header class="border-hair bg-surface/80 sticky top-0 z-10 border-b backdrop-blur">
      <PageContainer class="flex items-center justify-between gap-4 py-4">
        <a href="#top" class="flex items-baseline gap-2 whitespace-nowrap">
          <span class="text-ink text-sm font-semibold tracking-tight">rei-kit</span>
          <span class="text-ink-soft text-xs tabular-nums">v{{ VERSION }}</span>
        </a>

        <div class="ml-auto hidden items-center gap-4 text-xs sm:flex">
          <a
            class="text-ink-soft hover:text-ink transition-colors"
            href="https://www.npmjs.com/package/rei-kit"
            target="_blank"
            rel="noopener"
            >npm</a
          >
          <a
            class="text-ink-soft hover:text-ink transition-colors"
            href="https://github.com/ramazandogna/rei-kit"
            target="_blank"
            rel="noopener"
            >GitHub</a
          >
        </div>

        <div class="w-44 shrink-0 sm:w-56">
          <SegmentedControl
            :options="[
              { value: 'light', label: 'Gündüz' },
              { value: 'dark', label: 'Gece' },
            ]"
            :model-value="theme"
            @update:model-value="setTheme"
          />
        </div>
      </PageContainer>

      <ToastHost close-label="Kapat" />
    </header>

    <PageContainer as="main" id="top" class="py-12">
      <div class="max-w-[60ch]">
        <h1 class="text-ink text-4xl font-semibold tracking-tight">rei-kit</h1>
        <p class="text-ink-soft mt-4 text-lg leading-relaxed">
          Vue 3 ve Tailwind 4 için bileşen kiti. <strong class="text-ink">53 bileşen</strong>, beş
          giriş noktası, ve on bir değeri yeniden tanımlayarak marka değiştiren bir tema.
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="border-hair bg-surface text-ink rounded-card hover:border-primary/60 flex items-center gap-3 border px-4 py-2.5 font-mono text-sm transition-colors"
            @click="copyInstall"
          >
            <span class="text-ink-soft select-none">$</span>
            pnpm add rei-kit
            <span class="text-ink-soft ml-2 text-xs select-none">{{ copied ? '✓' : '⧉' }}</span>
          </button>

          <a
            class="text-ink-soft hover:text-ink text-sm underline-offset-4 hover:underline"
            href="https://github.com/ramazandogna/rei-kit#readme"
            target="_blank"
            rel="noopener"
            >Kurulum ve tema →</a
          >
        </div>

        <p class="text-ink-soft mt-8 text-sm leading-relaxed">
          Aşağısı kitin tamamı: her bileşen canlı, her prop kaynaktan üretilmiş bir tabloda. Sayfa
          kiti README’deki satırlarla bağlıyor, yani kurulum talimatı bozulursa ilk burada belli
          olur. Aradığını soldaki menüden ara.
        </p>
      </div>

      <div class="mt-12 flex items-start gap-10 lg:gap-14">
        <SideNav />

        <div class="min-w-0 flex-1">
          <!-- Every section says what the thing is for. A gallery of components
           with their names under them tells you what exists; it does not tell
           you which one to reach for. -->
          <section id="aksiyon" class="mt-14">
            <SectionHeading tone="neutral" label="Aksiyon" />
            <p class="text-ink-soft mt-2 text-sm">Bir şeyi başlatan ya da onaylayan kontroller.</p>

            <BaseCard class="mt-5">
              <div class="flex flex-wrap items-center gap-3">
                <BaseButton>Birincil</BaseButton>
                <BaseButton variant="secondary">İkincil</BaseButton>
                <BaseButton variant="ghost">Hayalet</BaseButton>
                <BaseButton disabled>Kapalı</BaseButton>
              </div>

              <div class="mt-5 max-w-xs">
                <GoogleButton label="Google ile devam et" />
              </div>
            </BaseCard>
          </section>

          <section id="yuzey" class="mt-14">
            <SectionHeading tone="neutral" label="Yüzey" />
            <p class="text-ink-soft mt-2 text-sm">
              İçeriği tutan kutular. <code class="text-xs">BaseCard</code> başlık ve altlık yuvası
              alır; <code class="text-xs">interactive</code> yalnızca tıklanabilir olduğunda
              verilir.
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-3">
              <BaseCard>Sade bir kart.</BaseCard>

              <BaseCard>
                <template #head><span class="text-sm font-semibold">Başlıklı</span></template>
                Gövde metni.
                <template #foot><span class="text-ink-soft text-xs">Altlık</span></template>
              </BaseCard>

              <BaseCard as="a" href="#" interactive
                >Tıklanabilir kart — üstüne gelince kalkıyor.</BaseCard
              >
            </div>
          </section>

          <section id="geri-bildirim" class="mt-14">
            <SectionHeading tone="neutral" label="Durum ve geri bildirim" />
            <p class="text-ink-soft mt-2 text-sm">
              <code class="text-xs">BaseAlert</code> okunması gereken bir mesaj;
              <code class="text-xs">BaseBadge</code> duran bir etiket, asla bir kontrol değil.
            </p>

            <div class="mt-5 grid gap-3">
              <BaseAlert
                v-for="tone in TONES"
                :key="tone"
                :tone="tone"
                :assertive="tone === 'danger'"
              >
                <template #mark>!</template>
                <template #title>{{ tone }}</template>
                Rol adı taşır, renk adı değil — tema değiştiğinde bu kutu da değişir.
              </BaseAlert>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-2">
              <BaseBadge v-for="tone in BADGES" :key="tone" :tone="tone">{{ tone }}</BaseBadge>
            </div>
          </section>

          <section id="ilerleme" class="mt-14">
            <SectionHeading tone="neutral" label="İlerleme" />
            <p class="text-ink-soft mt-2 text-sm">
              Değer kırpılır: 101 de, eksi de, sıfıra bölünme de bandın dışına taşmaz.
            </p>

            <BaseCard class="mt-5">
              <div class="flex items-baseline justify-between">
                <span class="text-sm">{{ progress }} / 28 gün</span>
                <span class="text-ink-soft text-sm tabular-nums">%{{ percent }}</span>
              </div>
              <ProgressBar :value="progress" :max="28" label="Kurs ilerlemesi" class="mt-3" />

              <input
                v-model.number="progress"
                type="range"
                min="0"
                max="28"
                class="mt-4 w-full"
                aria-label="İlerlemeyi değiştir"
              />
            </BaseCard>

            <div class="mt-4 flex gap-3">
              <StatCard value="28" label="Gün" />
              <StatCard value="113" label="Kanji" trend="up" />
              <StatCard value="690" label="Kelime" trend="flat" />
            </div>
          </section>

          <section id="bildirim" class="mt-14">
            <SectionHeading tone="neutral" label="Bildirim" />

            <p class="text-ink-soft mt-2 max-w-prose text-sm leading-relaxed">
              Üç uygulamanın hiçbirinde yoktu — karar verilmediği için değil, uzanacak bir şey
              olmadığı için. Kaydetme, silme, dışa aktarma hepsi sessizce bitiyordu.
            </p>

            <div class="mt-5 flex flex-wrap gap-2">
              <BaseButton size="sm" variant="secondary" @click="toast.info('Dışa aktarılıyor…')">
                Bilgi
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.success('Kaydedildi')">
                Başarı
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.warning('Bağlantı zayıf')">
                Uyarı
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="toast.danger('Kaydedilemedi')">
                Hata
              </BaseButton>
            </div>
          </section>

          <section id="form" class="mt-14">
            <SectionHeading tone="neutral" label="Form" />

            <BaseCard class="mt-5 max-w-md">
              <BaseInput
                v-model="email"
                label="E-posta"
                type="email"
                placeholder="ornek@site.com"
              />
              <BaseInput
                class="mt-4"
                label="Şifre"
                type="password"
                error="En az 10 karakter olmalı."
              />

              <BaseSelect
                v-model="currency"
                class="mt-4"
                label="Para birimi"
                placeholder="Seçin"
                hint="Rapordaki her tutar bununla gösterilir."
                :options="[
                  { value: 'TRY', label: 'Türk lirası' },
                  { value: 'JPY', label: 'Japon yeni' },
                  { value: 'EUR', label: 'Euro' },
                ]"
              />

              <BaseTextarea v-model="note" class="mt-4" label="Not" :rows="3" />

              <BaseRadioGroup
                v-model="themeChoice"
                class="mt-5"
                legend="Tema"
                :options="[
                  { value: 'system', label: 'Sistem' },
                  { value: 'light', label: 'Açık' },
                  { value: 'dark', label: 'Koyu' },
                ]"
              />

              <BaseCheckbox v-model="remember" class="mt-5" label="Beni hatırla" />

              <SegmentedControl
                class="mt-5"
                :options="[
                  { value: 'all', label: 'Hepsi' },
                  { value: 'free', label: 'Ücretsiz' },
                  { value: 'paid', label: 'Ücretli' },
                ]"
                :model-value="segment"
                @update:model-value="(value: string) => (segment = value)"
              />
            </BaseCard>
          </section>

          <section id="ayarlar" class="mt-14">
            <SectionHeading tone="neutral" label="Ayarlar" />

            <SettingsGroup class="mt-5" title="Genel">
              <SettingsRow label="Tema"><ToneDot fill="bg-primary" /></SettingsRow>
              <SettingsRow label="Dil" hint="Arayüz dili">Türkçe</SettingsRow>
            </SettingsGroup>
          </section>

          <section id="bosluk" class="mt-14">
            <SectionHeading tone="neutral" label="Boşluk ve bekleme" />
            <p class="text-ink-soft mt-2 text-sm">
              Yükleniyor durumunun yüksekliği bir CSS uzunluğudur — sınıf değil. Bu ayrım bir kez
              karıştı ve uygulamadaki her iskelet sıfır yükseklikte çizildi.
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <BaseCard><SkeletonList :rows="4" row-height="1.5rem" /></BaseCard>
              <BaseCard>
                <EmptyState
                  title="Henüz not yok"
                  description="Zorlandığın kelimeler burada birikir."
                />
              </BaseCard>
            </div>
          </section>

          <section id="olcu" class="mt-14">
            <SectionHeading tone="neutral" label="Ölçü" />
            <p class="text-ink-soft mt-2 text-sm">
              <code class="text-xs">PageContainer</code> iki genişlik verir: sayfa için
              <code class="text-xs">wide</code>, düzyazı için <code class="text-xs">reading</code>.
              Bu sayfanın kendisi de onun içinde.
            </p>

            <BaseCard class="mt-5">
              <PageContainer width="reading" class="!px-0">
                <p class="text-ink-soft text-sm leading-relaxed">
                  Bu paragraf okuma ölçüsünde: yaklaşık 68 karakter. Daha uzun bir satırda göz,
                  satır sonundan bir sonraki satırın başına dönerken yerini kaybeder — bu yüzden
                  sayfa genişliği ile metin genişliği aynı şey değildir.
                </p>
              </PageContainer>
            </BaseCard>
          </section>

          <GalleryExtra class="mt-14" />

          <section id="api" class="mt-20">
            <SectionHeading tone="neutral" label="Bütün props" />
            <p class="text-ink-soft mt-2 max-w-[60ch] text-sm leading-relaxed">
              Paketin gönderdiği her bileşen, aldığı her prop. Kaynaktan üretiliyor — elle tutulan
              bir prop tablosu ikinci sürümde yanlıştır, ve yanlış olması hiç olmamasından kötüdür
              çünkü okuyan ona güvenir.
            </p>

            <ApiReference class="mt-6" />
          </section>
        </div>
      </div>
    </PageContainer>
  </div>
</template>
