<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarRange, Plus, ReceiptText, Settings, UserStar } from 'lucide-vue-next'

import {
  BaseAvatar,
  BaseButton,
  BaseCard,
  BaseCombobox,
  BaseMenu,
  BaseSheet,
  BaseSlider,
  BaseSpinner,
  BaseSwitch,
  BaseTable,
  ErrorBoundary,
  FormField,
  PriceCard,
  SectionHeading,
  TabBar,
} from '../src/index'
import { AuthShell, FabButton, OfflineBanner } from '../src/app/index'
import {
  BaseAccordion,
  BaseBreadcrumb,
  BaseDisclosure,
  BaseModal,
  BasePagination,
  BaseTabs,
  BaseTooltip,
  NavLinks,
} from '../src/web/index'
import PropTable from './PropTable.vue'

/**
 * The half of the kit the first showcase never showed.
 *
 * Twenty-four components, and they were the twenty-four hardest to install
 * correctly — a dialog, a menu, a combobox, the phone shell. Somebody comparing
 * kits looks at the gallery and concludes the package is the part they can see,
 * which is how the newest consumer came to hand-write 737 class attributes
 * against a kit that already had most of what it needed.
 */
const reminder = ref(true)
const minutes = ref(45)
const country = ref<'tr' | 'jp' | 'de' | ''>('')
const modal = ref(false)
const alertModal = ref(false)
const sheet = ref(false)
const tab = ref<'overview' | 'history'>('overview')
const page = ref(7)
const menuOpen = ref(false)

const COUNTRIES = [
  { value: 'tr', label: 'Türkiye' },
  { value: 'jp', label: 'Japonya' },
  { value: 'de', label: 'Almanya' },
] as const

const TABS = [
  { key: 'overview', label: 'Özet' },
  { key: 'history', label: 'Geçmiş' },
] as const

const FAQ = [
  { key: 'cancel', title: 'İstediğim zaman iptal edebilir miyim?' },
  { key: 'refund', title: 'İade koşulları neler?' },
] as const

const NAV = [
  { key: 'courses', to: '/kurslar', label: 'Kurslar' },
  { key: 'blog', to: '/blog', label: 'Blog' },
  { key: 'pricing', to: '/fiyatlandirma', label: 'Fiyatlandırma' },
] as const

const BOTTOM = [
  { key: 'month', to: '/ay', label: 'Ay', icon: CalendarRange },
  { key: 'ledger', to: '/defter', label: 'Defter', icon: ReceiptText },
  { key: 'profile', to: '/profil', label: 'Profil', icon: UserStar },
] as const

const COLUMNS = [
  { key: 'name', label: 'Kalem' },
  { key: 'date', label: 'Tarih', nowrap: true },
  { key: 'amount', label: 'Tutar', align: 'end' },
] as const

const ROWS = [
  { name: 'Kahve', date: '12 Eyl', amount: '₺120' },
  { name: 'Kitap', date: '09 Eyl', amount: '₺430' },
  { name: 'Abonelik', date: '01 Eyl', amount: '₺89' },
]

const firstDisclosure = ref(false)

/** A component that throws, so the boundary has something to catch. */
const Boom = {
  setup() {
    throw new Error('demo')
  },
  render: () => null,
}
const boom = ref(false)

const sliderText = computed(() => `${minutes.value} dakika`)
</script>

<template>
  <div class="flex flex-col gap-14">
    <!-- ─────────────────────────── Form ─────────────────────────── -->
    <section>
      <SectionHeading tone="neutral" label="Form — devamı" />
      <p class="text-ink-soft mt-2 text-sm">
        Bir değeri alan kontroller. Anahtarın onay kutusundan farkı görsel değil: onay kutusu bir
        niyet beyan eder, anahtar taahhüdün kendisidir.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <BaseSwitch v-model="reminder" label="Günlük hatırlatma" hint="Her akşam 21.00'de" />
          <PropTable name="BaseSwitch" />
        </div>

        <div>
          <BaseSlider
            v-model="minutes"
            label="Oturum uzunluğu"
            :min="5"
            :max="90"
            :step="5"
            :format="() => sliderText"
            hint="Ok tuşlarıyla da değişir."
          />
          <PropTable name="BaseSlider" />
        </div>

        <div>
          <BaseCombobox
            v-model="country"
            label="Ülke"
            :options="COUNTRIES"
            placeholder="Yazarak ara"
            empty-label="Eşleşme yok"
          />
          <PropTable name="BaseCombobox" />
        </div>

        <div>
          <FormField label="Kendi kontrolün" hint="FormField etiketi ve bağlantıları verir.">
            <template #default="{ id, describedBy, invalid }">
              <input
                :id="id"
                :aria-describedby="describedBy"
                :aria-invalid="invalid"
                class="border-hair bg-surface text-ink rounded-card h-11 w-full border px-3 text-base"
              />
            </template>
          </FormField>
          <PropTable name="FormField" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Katmanlar ─────────────────────────── -->
    <section>
      <SectionHeading tone="neutral" label="Üst katman" />
      <p class="text-ink-soft mt-2 text-sm">
        Sayfanın üstüne çıkan şeyler. Sayfa alt kenardan gelir ve başparmağa aittir; kip hiçbir
        yerden gelir ve okuduğun şeyin ortasında belirir.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <div class="flex flex-wrap gap-3">
            <BaseButton @click="modal = true">Kip aç</BaseButton>
            <BaseButton variant="secondary" @click="alertModal = true">Uyarı kipi</BaseButton>
            <BaseButton variant="ghost" @click="sheet = true">Sayfa aç</BaseButton>
          </div>

          <BaseModal v-model="modal" title="Emin misin?" close-label="Kapat">
            Odak kipin içine girer, Tab dışarı çıkmaz, Escape kapatır ve arkadaki sayfa kaymaz.
            <template #actions>
              <BaseButton variant="ghost" @click="modal = false">Vazgeç</BaseButton>
              <BaseButton @click="modal = false">Tamam</BaseButton>
            </template>
          </BaseModal>

          <BaseModal
            v-model="alertModal"
            title="Bu yanıtlanmalı"
            close-label="Kapat"
            tone="alert"
            :dismissible="false"
          >
            <code class="text-xs">dismissible: false</code> — kapatma düğmesi yok, Escape çalışmaz.
            Cevaplanması gereken kararlar için.
            <template #actions>
              <BaseButton @click="alertModal = false">Anladım</BaseButton>
            </template>
          </BaseModal>

          <BaseSheet
            v-model="sheet"
            title="Sayfa"
            subtitle="Alt kenardan gelir"
            close-label="Kapat"
          >
            <p class="text-ink-soft text-sm">Telefonda başparmağın eriştiği yerden.</p>
          </BaseSheet>

          <PropTable name="BaseModal" />
          <PropTable name="BaseSheet" />
        </div>

        <div>
          <p class="text-ink-soft mb-3 text-xs">Menü — oklar gezinir, Escape kapatır, Tab çıkar.</p>
          <BaseMenu v-model="menuOpen" label="Hesap">
            <template #trigger><BaseAvatar label="Hesap" /></template>
            <a role="menuitem" href="#api-BaseMenu">Profil</a>
            <a role="menuitem" href="#api-BaseAvatar">Notlarım</a>
            <hr />
            <button type="button" role="menuitem">Çıkış yap</button>
          </BaseMenu>
          <PropTable name="BaseMenu" />
        </div>

        <div>
          <BaseTooltip label="Panoya kopyala">
            <template #default="{ describedBy }">
              <BaseButton variant="secondary" :aria-describedby="describedBy">
                <Settings class="size-4" />
              </BaseButton>
            </template>
          </BaseTooltip>
          <p class="text-ink-soft mt-2 text-xs">
            JavaScript'siz: <code>:hover</code> ve <code>:focus-within</code>. Sekme tuşuyla dene.
          </p>
          <PropTable name="BaseTooltip" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Gezinme ─────────────────────────── -->
    <section>
      <SectionHeading tone="neutral" label="Gezinme" />
      <p class="text-ink-soft mt-2 text-sm">
        Nerede olduğunu ve nereye gidebileceğini söyleyen parçalar.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <NavLinks :items="NAV" active="blog" label="Ana gezinme" />
          <PropTable name="NavLinks" />
        </div>

        <div>
          <BaseBreadcrumb
            :items="[
              { label: 'Kurslar', to: '/kurslar' },
              { label: 'N5', to: '/kurslar/n5' },
              { label: '3. Gün' },
            ]"
            label="Kırıntı yolu"
          />
          <PropTable name="BaseBreadcrumb" />
        </div>

        <div>
          <BaseTabs v-model="tab" :items="TABS" label="Bölümler">
            <template #default="{ item }">
              <p class="text-ink-soft text-sm">
                {{ item.key === 'overview' ? 'Özet paneli.' : 'Geçmiş paneli.' }}
                Oklarla geç, Home ve End uçlara gider.
              </p>
            </template>
          </BaseTabs>
          <PropTable name="BaseTabs" />
        </div>

        <div>
          <BasePagination
            :page="page"
            :pages="40"
            previous-label="Önceki"
            next-label="Sonraki"
            label="Sayfalar"
            @change="page = $event"
          />
          <PropTable name="BasePagination" />
        </div>

        <div class="relative h-24">
          <TabBar :items="BOTTOM" active="ledger" label="Alt çubuk" />
          <PropTable name="TabBar" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Açılır bölümler ─────────────────────────── -->
    <section>
      <SectionHeading tone="neutral" label="Açılır bölümler" />
      <p class="text-ink-soft mt-2 text-sm">
        Cevap kapalıyken de işaretlemede durur — tarayıcı görmese de tarayıcı botu görür.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <BaseAccordion :items="FAQ">
            <template #default="{ item }">
              {{
                item.key === 'cancel' ? 'İstediğin an, tek tıkla.' : 'On dört gün içinde koşulsuz.'
              }}
            </template>
          </BaseAccordion>
          <PropTable name="BaseAccordion" />
        </div>

        <div>
          <BaseDisclosure v-model="firstDisclosure" title="Tek satır — liste senin">
            Listenin sahibi uygulama olduğunda bunu kullan: satırlar kademeli geliyorsa, araya başka
            şey giriyorsa ya da akordeonun göremeyeceği bir kaynaktan geliyorsa.
          </BaseDisclosure>
          <PropTable name="BaseDisclosure" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Veri ─────────────────────────── -->
    <section>
      <SectionHeading tone="neutral" label="Veri" />
      <p class="text-ink-soft mt-2 text-sm">
        Tablonun kendi kaydırıcısı var ve o kaydırıcı klavyeyle erişilebilir — sürükleyerek ulaşılan
        bir bölge klavyenin hiç okuyamadığı bir bölgedir.
      </p>

      <BaseCard class="mt-5">
        <BaseTable :columns="COLUMNS" :rows="ROWS" caption="Eylül harcamaları" row-key="name" />
        <PropTable name="BaseTable" />
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Durum ─────────────────────────── -->
    <section>
      <SectionHeading tone="neutral" label="Durum" />
      <p class="text-ink-soft mt-2 text-sm">Bekleme, kimlik ve hata.</p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div>
          <div class="flex items-center gap-6">
            <BaseSpinner label="Kurslar yükleniyor" size="sm" />
            <BaseSpinner label="Kurslar yükleniyor" />
            <BaseSpinner label="Kurslar yükleniyor" size="lg" />
          </div>
          <PropTable name="BaseSpinner" />
        </div>

        <div>
          <div class="flex items-center gap-4">
            <BaseAvatar label="Hesabın" size="sm" />
            <BaseAvatar label="Hesabın" />
            <BaseAvatar name="Ramazan Doğan" fallback="initials" size="lg" />
          </div>
          <PropTable name="BaseAvatar" />
        </div>

        <div>
          <BaseButton variant="secondary" @click="boom = !boom">
            {{ boom ? 'Sınırı sıfırla' : 'Bir bileşeni patlat' }}
          </BaseButton>
          <div class="mt-3">
            <ErrorBoundary :key="String(boom)" title="Bu bölüm açılmadı" retry-label="Tekrar dene">
              <component :is="boom ? Boom : 'p'" class="text-ink-soft text-sm">
                Sağlam içerik.
              </component>
            </ErrorBoundary>
          </div>
          <PropTable name="ErrorBoundary" />
        </div>
      </BaseCard>
    </section>

    <!-- ─────────────────────────── Telefon kabuğu ─────────────────────────── -->
    <section>
      <SectionHeading tone="neutral" label="Telefon kabuğu" />
      <p class="text-ink-soft mt-2 text-sm">
        <code>rei-kit/app</code> — dördüncü bir telefon uygulamasının boş bir
        <code>src/</code> yerine başladığı yer.
      </p>

      <BaseCard class="mt-5 flex flex-col gap-6">
        <div class="relative h-40 overflow-hidden">
          <OfflineBanner label="Bağlantı yok" />
          <p class="text-ink-soft text-sm">
            Yukarıdaki bant yalnızca gerçekten çevrimdışıyken görünür — akışta değil, üstte durur ki
            her titremede sayfa yeniden dizilmesin.
          </p>
          <FabButton label="Yeni kayıt"><Plus /></FabButton>
          <PropTable name="OfflineBanner" />
        </div>

        <div>
          <div class="border-hair/70 rounded-card h-64 overflow-hidden border">
            <AuthShell>
              <template #brand>
                <p class="text-ink text-lg font-semibold">rei</p>
              </template>
              <p class="text-ink-soft text-center text-sm">Giriş ekranının oturduğu çerçeve.</p>
            </AuthShell>
          </div>
          <PropTable name="AuthShell" />
        </div>

        <div>
          <PriceCard
            title="Yıllık"
            price="₺1.200"
            period="/yıl"
            :features="['Tüm kurslar', 'Sınav hazırlığı', 'Taahhüt yok']"
            cta-label="Seç"
            badge="%30 ucuz"
          />
          <PropTable name="PriceCard" />
        </div>
      </BaseCard>
    </section>
  </div>
</template>
