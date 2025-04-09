<script setup lang="ts">
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import { useClipboard, useDropZone, useFileDialog } from "@vueuse/core";
import { createWorker } from "tesseract.js";
import { ref, useTemplateRef } from "vue";

const toast = useToast();

const currentFile = ref<File | null>(null);

const extractedText = defineModel<string>("extractedText", {
  default: "",
});

const dropZoneRef = useTemplateRef<HTMLDivElement>("dropZoneRef");

const onDrop = (files: File[] | null, event: DragEvent) => {
  if (!files) {
    return;
  }

  currentFile.value = files[0];
  loadPreviewImage(currentFile.value);
};

const { open, onChange, reset } = useFileDialog({
  accept: "image/jpeg, image/png",
  directory: false,
  multiple: false,
  reset: true,
});

onChange(async (files) => {
  currentFile.value = files ? files[0] : null;

  currentFile.value && loadPreviewImage(currentFile.value);
});

const imageUrl = ref("");
const loadPreviewImage = (file: File) => {
  const reader = new FileReader();

  reader.addEventListener("load", (event: ProgressEvent<FileReader>) => {
    imageUrl.value = (event.target as FileReader).result as string;
  });
  reader.readAsDataURL(file);
};

const loading = ref(false);

const languages = ref([
  {
    label: "English",
    value: "eng",
  },
  {
    label: "Italian",
    value: "ita",
  },
  {
    label: "Spanish",
    value: "spa",
  },
  {
    label: "Russian",
    value: "rus",
  },
  {
    label: "فارسی",
    value: "fas",
  },
  {
    label: "العربیه",
    value: "ara",
  },
  {
    label: "Japanese",
    value: "jpn",
  },
  {
    label: "Chinese",
    value: "chi_tra",
  },
]);
const currentLanguage = ref("eng");

const uploadFile = async (file: File | null) => {
  if (!file) {
    toast.add({
      title: "Error",
      description: "Select The File First.",
      color: "error",
    });

    return;
  }

  loading.value = true;

  try {
    const worker = await createWorker(currentLanguage.value);
    const text = await worker.recognize(file);

    extractedText.value = text.data.text;
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Error on extracting text.",
      color: "error",
    });
  } finally {
    currentFile.value = null;
    loading.value = false;
  }
};

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  dataTypes: ["image/jpeg", "image/png"],
  multiple: false,
  preventDefaultForUnhandled: false,
});

const { copy, isSupported } = useClipboard({
  source: extractedText.value,
});

const copyExtractedText = (text: string) => {
  copy(text);
  toast.add({
    title: "Copied",
    description: "Text Copied to Clipboard.",
    color: "info",
  });
};
</script>

<template>
  <div class="w-full h-dvh flex justify-center items-center">
    <div class="w-[600px] m-auto">
      <UCard variant="soft">
        <template #header>
          <div class="flex gap-2 items-end">
            <h1 class="text-2xl font-bold">OCR APP</h1>
          </div>
          <span
            >Convert an image of text into a machine-readable text format</span
          >
        </template>

        <div class="flex flex-row gap-2 items-center">
          <USelect v-model="currentLanguage" :items="languages" class="w-48" />
          <UButton
            v-if="currentFile"
            @click="reset()"
            class="cursor-pointer font-bold"
            icon="i-lucide-trash-2"
            size="sm"
            color="error"
            variant="solid"
          />
        </div>
        <button
          ref="dropZoneRef"
          type="button"
          class="mt-4 flex flex-col gap-4 justify-center items-center relative w-full overflow-hidden h-[140px] bg-gray-200/5 rounded-md border-2 border-dashed border-gray-300/20 [&.dragover]:bg-gray-200/20 duration-100 cursor-pointer"
          :class="{ dragover: isOverDropZone, '!cursor-default': loading }"
          @click="() => open()"
          :disabled="loading"
        >
          <span :class="[currentFile ? 'text-white' : 'text-gray-200/30']">{{
            currentFile?.name || "SELECT OR DROP IMAGE"
          }}</span>
          <small v-if="currentFile">Click to change</small>
          <img
            v-if="currentFile"
            :src="imageUrl"
            class="w-full h-full text-white object-cover absolute start-0 top-0 opacity-10"
          />
        </button>
        <UButton
          class="mt-4 cursor-pointer font-bold"
          icon="i-lucide-newspaper"
          size="xl"
          color="primary"
          variant="solid"
          block
          type="button"
          @click="uploadFile(currentFile)"
          :loading="loading"
          >Convert</UButton
        >

        <UTextarea
          class="w-full mt-4"
          :rows="10"
          placeholder="Uploaded Image Text"
          v-model="extractedText"
        />
        <div class="flex flex-row gap-2 justify-end" v-if="extractedText">
          <UButton
            v-if="isSupported"
            class="mt-4 cursor-pointer font-bold"
            icon="i-lucide-copy"
            size="xl"
            color="primary"
            variant="solid"
            type="button"
            @click="copyExtractedText(extractedText)"
            >Copy</UButton
          >
          <UButton
            class="mt-4 cursor-pointer font-bold"
            icon="i-lucide-eraser"
            size="xl"
            color="error"
            variant="solid"
            type="button"
            @click="extractedText = ''"
            >Clear</UButton
          >
        </div>
        <template #footer>
          <div class="flex flex-row justify-end gap-4">
            <UButton
              icon="i-lucide-github"
              size="md"
              color="neutral"
              variant="link"
              to="https://github.com/alieypi/ocr-app"
              target="_blank"
            />
            <UButton
              icon="i-lucide-earth"
              size="md"
              color="neutral"
              variant="link"
              to="https://eypi.dev"
              target="_blank"
            />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
