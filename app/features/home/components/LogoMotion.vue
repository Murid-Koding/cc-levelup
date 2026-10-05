<script setup lang="ts">
const isPlaying = ref(false)

const play = () => {
  isPlaying.value = false
  nextTick(() => {
    isPlaying.value = true
  })
}

onMounted(() => {
  play()
})
</script>

<template>
  <svg
    :class="['cc-logo', { play: isPlaying }]"
    viewBox="0 0 96 48"
    fill="currentColor"
    role="img"
    aria-label="CC Level Up!"
    @click="play"
  >
    <g class="cc-eyes">
      <path d="M36 48H12V36H36V48ZM12 36H0V12H12V36ZM36 12H12V0H36V12Z" />
      <path
        d="M78.24 48H54.24V36H78.24V48ZM54.24 36H42.24V12H54.24V36ZM78.24 12H54.24V0H78.24V12Z"
      />
      <g class="cc-d2"><rect class="cc-dot" width="12" height="12" rx="2" /></g>
      <g class="cc-d1"><rect class="cc-dot" width="12" height="12" rx="2" /></g>
    </g>
  </svg>
</template>

<style scoped>
.cc-logo {
  height: 1em;
  width: 2em;
  overflow: visible;
  color: inherit;
} /* ukuran ikut font-size induknya */
.cc-logo .cc-dot {
  transform-box: fill-box;
  transform-origin: center;
}
.cc-logo .cc-d1 {
  transform: translate(66px, 18px);
} /* posisi akhir = logo asli */
.cc-logo .cc-d2 {
  transform: translate(84px, 18px);
}
.cc-logo .cc-eyes {
  transform-origin: 48px 24px;
}

.cc-logo.play {
  animation: cc-appear 0.5s ease-out both;
}
.cc-logo.play .cc-eyes {
  animation:
    cc-blink 0.22s ease-in-out 1s,
    cc-blink 0.22s ease-in-out 1.45s;
}
.cc-logo.play .cc-d1 {
  animation: cc-d1 1.65s linear 2s both;
}
.cc-logo.play .cc-d2 {
  animation: cc-d2 1.65s linear 2s both;
}
.cc-logo.play .cc-d1 .cc-dot {
  animation: cc-pulse 0.6s ease-in-out 3.7s 3;
}
.cc-logo.play .cc-d2 .cc-dot {
  animation: cc-pulse 0.6s ease-in-out 3.85s 3;
}

@keyframes cc-appear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes cc-blink {
  50% {
    transform: scaleY(0.08);
  }
}
@keyframes cc-d1 {
  0% {
    transform: translate(18px, 18px);
    animation-timing-function: ease-out;
  }
  18.2% {
    transform: translate(22px, 18px);
  }
  57.6% {
    transform: translate(22px, 18px);
    animation-timing-function: cubic-bezier(0.5, 0, 0.2, 1);
  }
  100% {
    transform: translate(66px, 18px);
  }
}
@keyframes cc-d2 {
  0% {
    transform: translate(60px, 18px);
    animation-timing-function: ease-out;
  }
  18.2% {
    transform: translate(64px, 18px);
  }
  42.4% {
    transform: translate(64px, 18px);
    animation-timing-function: cubic-bezier(0.5, 0, 0.2, 1);
  }
  72.7% {
    transform: translate(84px, 18px);
  }
  100% {
    transform: translate(84px, 18px);
  }
}
@keyframes cc-pulse {
  50% {
    transform: scale(0.55);
  }
}
@media (prefers-reduced-motion: reduce) {
  .cc-logo.play,
  .cc-logo.play * {
    animation: none !important;
  }
}
</style>
