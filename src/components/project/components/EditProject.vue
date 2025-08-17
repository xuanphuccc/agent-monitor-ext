<script setup>
import { Form } from "@primevue/forms";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Message from "primevue/message";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";
import { getFromStorage, saveToStorage } from "@/utils/common";

const emit = defineEmits(["cancel", "delete", "save"]);
const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({}),
  },

  formMode: {
    type: String,
    default: FORM_MODE.Edit,
  },
});

const toast = useToast();
const initialValues = ref({
  projectName: "",
});

const resolver = ref(
  zodResolver(
    z.object({
      projectName: z.string().min(1, { message: "Tên dự án không được để trống." }),
    }),
  ),
);

// Khởi tạo giá trị ban đầu cho form
const initFormValues = () => {
  initialValues.value = {
    projectName: props.initialValues.projectName || "",
  };
};
initFormValues();

/**
 * Xử lý sự kiện khi form được submit
 * @param {Object} form - Dữ liệu của form
 */
const onFormSubmit = async (form) => {
  try {
    if (form.valid) {
      const formValues = {
        ...form.values,
        id: props.initialValues.id || null, // Giữ nguyên ID nếu có, hoặc tạo mới nếu không có
      };

      const localProjects = (await getFromStorage("projectList")) || [];
      const existingIndex = localProjects.findIndex((emp) => emp.id === formValues.id);
      if (existingIndex !== -1) {
        // Cập nhật dự án đã tồn tại
        localProjects[existingIndex] = formValues;
      } else {
        // Thêm mới dự án
        // TODO: check trùng projectName
        localProjects.push(formValues);
      }

      await saveToStorage("projectList", localProjects);
      emit("save", formValues);

      toast.add({ severity: "success", summary: "Lưu dữ liệu thành công.", life: 3000 });
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.add({
      severity: "error",
      summary: "Lưu dữ liệu thất bại.",
      life: 3000,
    });
  }
};
</script>

<template>
  <div class="xp-edit-project">
    <Form
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      :validateOnValueUpdate="true"
      :validateOnBlur="true"
      @submit="onFormSubmit"
      class="xp-edit-project-form"
    >
      <div class="xp-form-field">
        <label class="xp-form-label" for="project-project">Tên dự án</label>
        <InputText
          name="projectName"
          id="project-project"
          type="text"
          placeholder="Nhập tên dự án"
          fluid
          size="small"
        />
        <Message v-if="$form.projectName?.invalid" severity="error" size="small" variant="simple">{{
          $form.projectName.error?.message
        }}</Message>
      </div>

      <div class="xp-form-actions">
        <Button
          v-if="formMode !== FORM_MODE.Create"
          @click="$emit('delete')"
          label="Xoá"
          icon="pi pi-trash"
          severity="danger"
          size="small"
        />
        <Button
          @click="$emit('cancel')"
          label="Huỷ"
          icon="pi pi-times"
          severity="secondary"
          size="small"
        />
        <Button label="Lưu" icon="pi pi-save" type="submit" size="small" />
      </div>
    </Form>
  </div>
</template>

<style lang="scss" scoped>
.xp-edit-project {
  .xp-edit-project-form {
    display: flex;
    flex-direction: column;

    .xp-form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .xp-form-label {
        font-size: 12px;
      }
    }
    .xp-form-field + .xp-form-field {
      margin-top: 12px;
    }

    .xp-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }
  }
}
</style>
