<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
body {
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 16px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-fadeinup {
  animation: fadeInUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: opacity, transform;
}

.animate-delay-100 {
  animation-delay: 100ms;
}

.animate-delay-200 {
  animation-delay: 200ms;
}

.animate-delay-300 {
  animation-delay: 300ms;
}
</style>
