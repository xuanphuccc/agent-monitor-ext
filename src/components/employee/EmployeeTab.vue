<script setup>
import Employee from "@/components/employee/components/Employee.vue";
import Button from "primevue/button";
import { ref } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";
import { getLocalStorage } from "@/utils/common";
import { v4 as uuidv4 } from "uuid";

const employeeList = ref([]);

/**
 * Hàm khởi tạo dữ liệu ban đầu
 */
const initData = async () => {
  try {
    const localEmployees = getLocalStorage("employeeList") || [];

    employeeList.value = localEmployees.map((employee) => ({
      ...employee,
      formMode: FORM_MODE.View, // Mặc định là chế độ xem
    }));
  } catch (error) {
    console.error("Lỗi khi khởi tạo dữ liệu nhân viên:", error);
  }
};
initData();

/**
 * Hàm xử lý sự kiện khi nhấn nút "Thêm mới"
 */
const onAddNewEmployee = () => {
  // Thêm logic để mở form thêm mới nhân viên
  employeeList.value.push({
    id: uuidv4(),
    employeeCode: "",
    projectName: "",
    formMode: FORM_MODE.Create, // Chuyển sang chế độ thêm mới
  });
};

/**
 * Hàm xử lý sự kiện khi nhấn Huỷ
 * @param {string} employeeId - ID của nhân viên cần huỷ
 */
const onCancel = (employeeId) => {
  if (!employeeId) {
    return;
  }

  const employee = employeeList.value.find((emp) => emp.id === employeeId);
  if (!employee) {
    return;
  }

  if (employee.formMode === FORM_MODE.Create) {
    // Nếu là chế độ thêm mới, xoá nhân viên khỏi danh sách
    employeeList.value = employeeList.value.filter((emp) => emp.id !== employeeId);
  } else {
    // Chuyển về chế độ xem
    employee.formMode = FORM_MODE.View;
  }
};

/**
 * Hàm xử lý sự kiện khi nhấn nút "Xoá"
 * @param {string} employeeId - ID của nhân viên cần xoá
 */
const onDelete = (employeeId) => {
  if (!employeeId) {
    return;
  }

  employeeList.value = employeeList.value.filter((emp) => emp.id !== employeeId);
};
/**
 * Hàm xử lý sự kiện khi nhấn nút "Lưu"
 * @param {Object} employee - Dữ liệu của nhân viên
 */
const onSave = (employee) => {
  if (!employee) {
    return;
  }

  const existingEmployeeIndex = employeeList.value.findIndex((emp) => emp.id === employee.id);
  if (existingEmployeeIndex !== -1) {
    // Cập nhật nhân viên đã tồn tại
    employeeList.value[existingEmployeeIndex] = { ...employee, formMode: FORM_MODE.View };
  }
};
</script>

<template>
  <div class="xp-employee-tab">
    <Employee
      v-for="(employee, index) in employeeList"
      :key="employee.id"
      :employee="employee"
      :expand="index === 0"
      @delete="onDelete"
      @cancel="onCancel"
      @save="onSave"
    />

    <div class="xp-employee-tab-actions">
      <Button @click="onAddNewEmployee" size="small" label="Thêm mới" icon="pi pi-plus" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-employee-tab {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0px 12px;

  .xp-employee-tab-actions {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}
</style>
