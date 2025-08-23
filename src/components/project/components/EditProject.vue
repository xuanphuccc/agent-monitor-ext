<script setup>
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";
import { getFromStorage, saveToStorage, removeVietnameseMarks } from "@/utils/common";
import { getDivisionsReport, getProjectsReport } from "@/services/reports-api";

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

const divisions = ref([]);
const filteredDivisions = ref([]);
const selectedDivision = ref(null);
const divisionError = ref(null);

const projects = ref([]);
const filteredProjects = ref([]);
const selectedProject = ref(null);
const projectError = ref(null);
const projectsLoading = ref(false);

/**
 * Xử lý lấy tất cả các khối
 */
const getAllDivisions = async () => {
  try {
    const response = await getDivisionsReport();

    if (response.data && response.data.success && response.data.data) {
      divisions.value = response.data.data.data ? [...response.data.data.data] : [];
    } else {
      divisions.value = [];
    }
  } catch (error) {
    console.error("Error fetching divisions:", error);
    toast.add({
      severity: "error",
      summary: "Có lỗi xảy ra khi lấy dữ liệu các khối.",
      life: 3000,
    });
  }
};

/**
 * Xử lý tìm kiếm khối
 * @param event
 */
const handleSearchDivision = (event) => {
  if (!event.query) {
    filteredDivisions.value = [...divisions.value];
    return;
  }
  const searchQuery = removeVietnameseMarks(event.query).toLowerCase();
  filteredDivisions.value = divisions.value.filter((division) =>
    removeVietnameseMarks(division.divisionName).toLowerCase().includes(searchQuery),
  );
};

/**
 * Hàm xử lý lấy danh sách dự án
 * @param divisionName
 */
const handleGetProjects = async (divisionName) => {
  try {
    if (!divisionName) {
      return;
    }

    projectsLoading.value = true;

    const response = await getProjectsReport(divisionName);

    if (response.data && response.data.success && response.data.data) {
      projects.value = response.data.data.data ? [...response.data.data.data] : [];
    } else {
      projects.value = [];
    }

    projectsLoading.value = false;
  } catch (error) {
    console.error("Error fetching projects:", error);
    toast.add({
      severity: "error",
      summary: "Có lỗi xảy ra khi lấy dữ liệu các dự án.",
      life: 3000,
    });
    projectsLoading.value = false;
  }
};

/**
 * Xử lý tìm kiếm dự án
 * @param event
 */
const handleSearchProject = (event) => {
  if (!event.query) {
    filteredProjects.value = [...projects.value];
    return;
  }
  const searchQuery = removeVietnameseMarks(event.query).toLowerCase();
  filteredProjects.value = projects.value.filter((division) =>
    removeVietnameseMarks(division.projectName).toLowerCase().includes(searchQuery),
  );
};

// Khởi tạo giá trị ban đầu cho form
const initFormValues = async () => {
  loading.value = true;
  const tasks = [getAllDivisions()];
  if (props.initialValues.divisionName && props.initialValues.projectName) {
    tasks.push(handleGetProjects(props.initialValues.divisionName));
  }

  await Promise.all(tasks);

  // Tìm khối đã chọn
  if (props.initialValues.divisionName) {
    const searchQuery = removeVietnameseMarks(props.initialValues.divisionName).toLowerCase();
    const foundDivision = divisions.value.find((division) =>
      removeVietnameseMarks(division.divisionName).toLowerCase().includes(searchQuery),
    );
    selectedDivision.value = foundDivision || null;
  } else {
    selectedDivision.value = null;
  }

  // Tìm dự án đã chọn
  if (props.initialValues.projectName) {
    const searchQuery = removeVietnameseMarks(props.initialValues.projectName).toLowerCase();
    const foundProject = projects.value.find((project) =>
      removeVietnameseMarks(project.projectName).toLowerCase().includes(searchQuery),
    );
    selectedProject.value = foundProject || null;
  } else {
    selectedProject.value = null;
  }

  loading.value = false;
};
initFormValues();

/**
 * Validate khối đã chọn
 */
const validateDivision = () => {
  if (selectedDivision.value && selectedDivision.value.divisionName) {
    divisionError.value = "";
    return true;
  }

  divisionError.value = "Khối không được để trống.";
  return false;
};

/**
 * Validate dự án đã chọn
 */
const validateProject = () => {
  if (selectedProject.value && selectedProject.value.projectName) {
    projectError.value = "";
    return true;
  }

  projectError.value = "Dự án không được để trống.";
  return false;
};

/**
 * Xử lý khi thay đổi khối
 */
const handleDivisionChange = () => {
  validateDivision();

  // Xoá giá trị dự án
  selectedProject.value = null;
};

/**
 * Xử lý sự kiện khi form được submit
 */
const onFormSubmit = async () => {
  try {
    loading.value = true;

    const validateDivisionResult = validateDivision();
    const validateProjectResult = validateProject();
    if (validateDivisionResult && validateProjectResult) {
      const formValues = {
        divisionName: selectedDivision.value?.divisionName,
        projectName: selectedProject.value?.projectName,
        id: props.initialValues.id || null, // Giữ nguyên ID nếu có, hoặc tạo mới nếu không có
      };

      const localProjects = (await getFromStorage("projectList")) || [];
      const existingIndex = localProjects.findIndex((proj) => proj.id === formValues.id);
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
      loading.value = false;
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.add({
      severity: "error",
      summary: "Lưu dữ liệu thất bại.",
      life: 3000,
    });
    loading.value = false;
  }
};
</script>

<template>
  <div class="xp-edit-project">
    <div class="xp-edit-project-form">
      <div class="xp-form-field">
        <label class="xp-form-label" for="project-project">Khối</label>
        <AutoComplete
          v-model="selectedDivision"
          @change="handleDivisionChange"
          @option-select="handleGetProjects($event.value?.divisionName)"
          optionLabel="divisionName"
          :suggestions="filteredDivisions"
          @complete="handleSearchDivision"
          :invalid="!!divisionError"
          :disabled="loading"
          placeholder="Chọn khối"
          dropdown
          forceSelection
          fluid
          size="small"
        />
        <Message v-if="divisionError" severity="error" size="small" variant="simple">
          {{ divisionError }}
        </Message>
      </div>
      <div class="xp-form-field">
        <label class="xp-form-label" for="project-project">Dự án</label>
        <AutoComplete
          v-model="selectedProject"
          @change="validateProject"
          optionLabel="projectName"
          :suggestions="filteredProjects"
          @complete="handleSearchProject"
          :loading="projectsLoading"
          :invalid="!!projectError"
          :disabled="loading"
          placeholder="Chọn dự án"
          dropdown
          forceSelection
          fluid
          size="small"
        />
        <Message v-if="projectError" severity="error" size="small" variant="simple">
          {{ projectError }}
        </Message>
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
