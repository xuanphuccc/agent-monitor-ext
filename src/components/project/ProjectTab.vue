<script setup>
import Project from "@/components/project/components/Project.vue";
import Button from "primevue/button";
import { ref } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";
import { getFromStorage } from "@/utils/common";
import { v4 as uuidv4 } from "uuid";

const projectList = ref([]);

/**
 * Hàm khởi tạo dữ liệu ban đầu
 */
const initData = async () => {
  try {
    const localProjects = (await getFromStorage("projectList")) || [];

    projectList.value = localProjects.map((project) => ({
      ...project,
      formMode: FORM_MODE.View, // Mặc định là chế độ xem
    }));
  } catch (error) {
    console.error("Lỗi khi khởi tạo dữ liệu dự án:", error);
  }
};
initData();

/**
 * Hàm xử lý sự kiện khi nhấn nút "Thêm mới"
 */
const onAddNewProject = () => {
  // Kiểm tra xem có dự án nào đang ở chế độ thêm mới hay không
  const existingNewProject = projectList.value.find((proj) => proj.formMode === FORM_MODE.Create);
  if (existingNewProject) {
    return; // Nếu có, không cho phép thêm mới
  }

  projectList.value.push({
    id: uuidv4(),
    divisionName: "",
    projectName: "",
    formMode: FORM_MODE.Create, // Chuyển sang chế độ thêm mới
  });
};

/**
 * Hàm xử lý sự kiện khi nhấn Huỷ
 * @param {string} projectId - ID của dự án cần huỷ
 */
const onCancel = (projectId) => {
  if (!projectId) {
    return;
  }

  const project = projectList.value.find((proj) => proj.id === projectId);
  if (!project) {
    return;
  }

  if (project.formMode === FORM_MODE.Create) {
    // Nếu là chế độ thêm mới, xoá dự án khỏi danh sách
    projectList.value = projectList.value.filter((proj) => proj.id !== projectId);
  } else {
    // Chuyển về chế độ xem
    project.formMode = FORM_MODE.View;
  }
};

/**
 * Hàm xử lý sự kiện khi nhấn nút "Xoá"
 * @param {string} projectId - ID của dự án cần xoá
 */
const onDelete = (projectId) => {
  if (!projectId) {
    return;
  }

  projectList.value = projectList.value.filter((proj) => proj.id !== projectId);
};
/**
 * Hàm xử lý sự kiện khi nhấn nút "Lưu"
 * @param {Object} project - Dữ liệu của dự án
 */
const onSave = (project) => {
  if (!project) {
    return;
  }

  const existingProjectIndex = projectList.value.findIndex((proj) => proj.id === project.id);
  if (existingProjectIndex !== -1) {
    // Cập nhật dự án đã tồn tại
    projectList.value[existingProjectIndex] = { ...project, formMode: FORM_MODE.View };
  }
};
</script>

<template>
  <div class="xp-project-tab">
    <Project
      v-for="(project, index) in projectList"
      :key="project.id"
      :project="project"
      :expand="index === 0"
      @delete="onDelete"
      @cancel="onCancel"
      @save="onSave"
    />

    <div class="xp-project-tab-actions">
      <Button @click="onAddNewProject" size="small" label="Thêm mới" icon="pi pi-plus" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-project-tab {
  width: 100%;
  padding: 0px 12px 12px;

  .xp-project-tab-actions {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}
</style>
