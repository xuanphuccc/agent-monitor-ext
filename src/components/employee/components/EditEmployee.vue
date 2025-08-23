<script setup>
import AutoComplete from "primevue/autocomplete";
import Checkbox from "primevue/checkbox";
import CheckboxGroup from "primevue/checkboxgroup";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";
import { getFromStorage, saveToStorage } from "@/utils/common";
import { searchEmployees } from "@/services/stats-api";

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
const loading = ref(false);

const kpiTools = ref([]);
const filteredEmployees = ref([]);
const selectedEmployee = ref(null);
const employeeError = ref(null);
const employeeSearchValue = ref();
const searchEmployeeLoading = ref(false);

/**
 * Format label hiển thị cho AutoComplete
 * @param employee
 */
const employeeOptionLabel = (employee) => {
  return employee ? `${employee.EmployeeName} (${employee.EmployeeCode})` : "";
};

/**
 * Xử lý tìm kiếm nhân viên
 * @param event
 */
const handleSearchEmployee = async (event) => {
  try {
    if (event.query === employeeSearchValue.value) {
      filteredEmployees.value = [...filteredEmployees.value];
      return;
    }

    searchEmployeeLoading.value = true;
    employeeSearchValue.value = event.query;

    const response = await searchEmployees(event.query);

    if (response.data && response.data.success && response.data.data) {
      filteredEmployees.value = [...response.data.data];
    } else {
      filteredEmployees.value = [];
    }

    searchEmployeeLoading.value = false;
  } catch (error) {
    console.error("Error search employees:", error);
    toast.add({
      severity: "error",
      summary: "Có lỗi xảy ra khi tìm kiếm nhân viên.",
      life: 3000,
    });
    searchEmployeeLoading.value = false;
  }
};

/**
 * Khởi tạo giá trị ban đầu cho form
 */
const initFormValues = async () => {
  loading.value = true;
  // Load danh sách nhân viên
  await handleSearchEmployee({ query: "" });

  if (props.initialValues.employeeCode) {
    const foundEmployee = filteredEmployees.value.find(
      (emp) => emp.EmployeeCode === props.initialValues.employeeCode,
    );
    selectedEmployee.value = foundEmployee || null;
  } else {
    selectedEmployee.value = null;
  }

  kpiTools.value = props.initialValues.kpiTools || [];

  loading.value = false;
};
initFormValues();

/**
 * Validate nhân viên đã chọn
 */
const validateEmployee = () => {
  if (
    selectedEmployee.value &&
    selectedEmployee.value.EmployeeCode &&
    selectedEmployee.value.EmployeeName
  ) {
    employeeError.value = null;
    return true;
  }

  employeeError.value = "Nhân viên không được để trống.";
  return false;
};

/**
 * Xử lý sự kiện khi form được submit
 */
const onFormSubmit = async () => {
  try {
    if (validateEmployee()) {
      const formValues = {
        kpiTools: kpiTools.value || [],
        employeeCode: selectedEmployee.value?.EmployeeCode || null,
        employeeName: selectedEmployee.value?.EmployeeName || null,
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
    <div class="xp-edit-employee-form">
      <div class="xp-form-field">
        <label class="xp-form-label" for="employee-selected-employee">Nhân viên</label>
        <AutoComplete
          v-model="selectedEmployee"
          @change="validateEmployee"
          :optionLabel="employeeOptionLabel"
          :suggestions="filteredEmployees"
          @complete="handleSearchEmployee"
          :loading="searchEmployeeLoading"
          :invalid="!!employeeError"
          :disabled="loading"
          placeholder="Chọn nhân viên"
          dropdown
          forceSelection
          fluid
          size="small"
        />
        <Message v-if="employeeError" severity="error" size="small" variant="simple">{{
          employeeError
        }}</Message>
      </div>

      <div class="xp-form-field">
        <label class="xp-form-label"
          >Công cụ AI
          <span
            :title="`Lựa chọn công cụ để tính toán tổng số request có đạt mục tiêu không \nNếu không chọn sẽ tính theo mặc định`"
            class="pi pi-info-circle"
            style="font-size: 12px"
          ></span
        ></label>
        {{ kpiTools }}
        <CheckboxGroup v-model="kpiTools" class="xp-checkbox-group">
          <div class="xp-checkbox-item">
            <Checkbox inputId="cline" value="cline" size="small" :disabled="loading" />
            <label for="cline"> Cline </label>
          </div>
          <div class="xp-checkbox-item">
            <Checkbox inputId="cursor" value="cursor" size="small" :disabled="loading" />
            <label for="cursor"> Cursor </label>
          </div>
          <div class="xp-checkbox-item">
            <Checkbox inputId="oneai" value="oneai" size="small" :disabled="loading" />
            <label for="oneai"> OneAI </label>
          </div>
          <div class="xp-checkbox-item">
            <Checkbox inputId="aiagent" value="aiagent" size="small" :disabled="loading" />
            <label for="aiagent"> AI Agents </label>
          </div>
        </CheckboxGroup>
      </div>

      <div class="xp-form-actions">
        <div class="form-actions-left">
          <Button
            v-if="formMode !== FORM_MODE.Create"
            @click="$emit('delete')"
            :disabled="loading"
            label="Xoá"
            icon="pi pi-trash"
            severity="danger"
            variant="outlined"
            size="small"
          />
        </div>
        <div class="form-actions-right">
          <Button
            @click="$emit('cancel')"
            label="Huỷ"
            icon="pi pi-times"
            severity="secondary"
            size="small"
          />
          <Button
            @click="onFormSubmit"
            :disabled="loading"
            label="Lưu"
            icon="pi pi-save"
            type="submit"
            size="small"
          />
        </div>
      </div>
    </div>
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
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 24px;

      .form-actions-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .form-actions-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
}
</style>
