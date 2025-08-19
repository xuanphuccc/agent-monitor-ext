<script setup>
import { Form } from "@primevue/forms";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import CheckboxGroup from "primevue/checkboxgroup";
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
  employeeCode: "",
  kpiTools: [],
});

const resolver = ref(
  zodResolver(
    z.object({
      employeeCode: z.string().min(1, { message: "Mã nhân viên không được để trống." }),
      kpiTools: z.array(z.string()),
    }),
  ),
);

// Khởi tạo giá trị ban đầu cho form
const initFormValues = () => {
  initialValues.value = {
    employeeCode: props.initialValues.employeeCode || "",
    kpiTools: props.initialValues.kpiTools || [],
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

      const localEmployees = (await getFromStorage("employeeList")) || [];
      const existingIndex = localEmployees.findIndex((emp) => emp.id === formValues.id);
      if (existingIndex !== -1) {
        // Cập nhật nhân viên đã tồn tại
        localEmployees[existingIndex] = formValues;
      } else {
        // Thêm mới nhân viên
        // TODO: check trùng employeeCode
        localEmployees.push(formValues);
      }

      await saveToStorage("employeeList", localEmployees);
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
  <div class="xp-edit-employee">
    <Form
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      :validateOnValueUpdate="true"
      :validateOnBlur="true"
      @submit="onFormSubmit"
      class="xp-edit-employee-form"
    >
      <div class="xp-form-field">
        <label class="xp-form-label" for="employee-employeeCode">Mã nhân viên</label>
        <InputText
          name="employeeCode"
          id="employee-employeeCode"
          type="text"
          placeholder="Nhập mã nhân viên VD: B06-0008"
          fluid
          size="small"
          :autofocus="true"
        />
        <Message
          v-if="$form.employeeCode?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $form.employeeCode.error?.message }}</Message
        >
      </div>

      <div class="xp-form-field">
        <label class="xp-form-label"
          >Công cụ tính KPI
          <span
            :title="`Lựa chọn công cụ để tính toán tổng số requests có đạt KPI không \nNếu không chọn sẽ tính theo mặc định`"
            class="pi pi-info-circle"
            style="font-size: 12px"
          ></span
        ></label>
        <CheckboxGroup name="kpiTools" class="xp-checkbox-group">
          <div class="xp-checkbox-item">
            <Checkbox inputId="cline" value="cline" size="small" />
            <label for="cline"> Cline </label>
          </div>
          <div class="xp-checkbox-item">
            <Checkbox inputId="cursor" value="cursor" size="small" />
            <label for="cursor"> Cursor </label>
          </div>
          <div class="xp-checkbox-item">
            <Checkbox inputId="oneai" value="oneai" size="small" />
            <label for="oneai"> OneAI </label>
          </div>
          <div class="xp-checkbox-item">
            <Checkbox inputId="aiagent" value="aiagent" size="small" />
            <label for="aiagent"> AI Agents </label>
          </div>
        </CheckboxGroup>
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
.xp-edit-employee {
  .xp-edit-employee-form {
    display: flex;
    flex-direction: column;

    .xp-form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .xp-form-label {
        display: flex;
        align-items: center;
        font-size: 12px;
        column-gap: 8px;
      }

      .xp-checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .xp-checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;

          label {
            font-size: 12px;
          }
        }
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
