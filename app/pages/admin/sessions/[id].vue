<script setup lang="ts">
import SessionForm from '~~/app/features/admin/sessions/components/SessionForm.vue'
import { useAdminSessionFormViewModel } from '~~/app/features/admin/sessions/viewmodels/useAdminSessionFormViewModel'

const route = useRoute()
const sessionId = Number(route.params.id)

const { form, speakers, categories, isSubmitting, errorMessage, validationErrors, submit } =
  useAdminSessionFormViewModel(sessionId)
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Edit Sesi</h1>
      <NuxtLink to="/admin/sessions" class="text-sm text-gray-600 hover:underline">
        &larr; Kembali ke daftar
      </NuxtLink>
    </div>

    <SessionForm
      v-model:form="form"
      :speakers="speakers"
      :categories="categories"
      :is-submitting="isSubmitting"
      :error-message="errorMessage"
      :validation-errors="validationErrors"
      submit-label="Perbarui Sesi"
      :is-edit="true"
      @submit="submit"
    />
  </div>
</template>
