<script setup>
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useToast } from "primevue/usetoast";
import ViewProject from "@/components/project/components/ViewProject.vue";
import EditProject from "@/components/project/components/EditProject.vue";
import { ref, useTemplateRef } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";
import { getAvatarLetter, getFromStorage, saveToStorage } from "@/utils/common";

const toast = useToast();
const emit = defineEmits(["cancel", "delete", "save"]);
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },

  expand: {
    type: Boolean,
    default: false,
  },
});

const scopedProject = ref(null);
const isExpand = ref(null);
const loading = ref(false);
const viewProjectRef = useTemplateRef("view-project-ref");

/**
 * Hàm khởi tạo dữ liệu ban đầu
 */
const initData = async (initProject = true) => {
  try {
    if (!props.project) {
      return;
    }

    if (initProject) {
      scopedProject.value = JSON.parse(JSON.stringify(props.project));
      isExpand.value = props.expand || props.project.formMode === FORM_MODE.Create ? "1" : null;
    }
  } catch (error) {
    console.error("Error initializing project data:", error);
  }
};
initData();

/**
 * Hàm xử lý sự kiện khi nhấn Huỷ
 */
const onCancel = () => {
  scopedProject.value.formMode = FORM_MODE.View; // Chuyển về chế độ xem
  emit("cancel", props.project.id);
};

/**
 * Hàm xử lý sự kiện khi nhấn nút "Xoá"
 */
const onDelete = async () => {
  const localProjects = (await getFromStorage("projectList")) || [];
  const updatedProjects = localProjects.filter((proj) => proj.id !== props.project.id);
  await saveToStorage("projectList", updatedProjects);

  emit("delete", props.project.id);

  toast.add({ severity: "success", summary: "Xoá dữ liệu thành công.", life: 3000 });
};

/**
 * Hàm xử lý sự kiện khi nhấn nút "Lưu"
 */
const onSave = async (project) => {
  if (!project) {
    return;
  }

  scopedProject.value = {
    ...project,
    formMode: FORM_MODE.View,
  };

  await initData(false);

  // Gọi sự kiện save để thông báo cho cha biết
  emit("save", project);
};

/**
 * Hàm xử lý sự kiện khi nhấn nút "Chỉnh sửa"
 */
const onEdit = () => {
  scopedProject.value.formMode = FORM_MODE.Edit; // Chuyển sang chế độ chỉnh sửa
  isExpand.value = "1"; // Mở rộng accordion
};

/**
 * Hàm nạp lại dữ liệu nhân viên
 */
const reloadData = () => {
  if (viewProjectRef.value && typeof viewProjectRef.value.initData === "function") {
    viewProjectRef.value.initData();
  }
};
</script>

<template>
  <div class="xp-project-detail">
    <Accordion
      v-model:value="isExpand"
      :dt="{
        panel: { border: { width: '0px' } },
      }"
    >
      <AccordionPanel value="1">
        <AccordionHeader>
          <div class="xp-project-header">
            <!-- Title khi thêm mới/chỉnh sửa -->
            <div
              v-if="
                scopedProject.formMode === FORM_MODE.Create ||
                scopedProject.formMode === FORM_MODE.Edit
              "
              class="xp-employee-header-title"
            >
              {{ scopedProject.formMode === FORM_MODE.Create ? "Thêm mới" : "Chỉnh sửa" }}
            </div>

            <!-- Hiển thị thông tin dự án khi ở chế độ xem -->
            <div v-if="scopedProject.formMode === FORM_MODE.View" class="xp-project-info">
              <Skeleton v-if="loading" shape="circle" size="28px" class="mr-2" />
              <Avatar
                v-else
                :label="getAvatarLetter(scopedProject.projectName)"
                class="mr-2"
                style="background-color: #dee9fc; color: #1a2551; flex-shrink: 0"
                shape="circle"
              />
              <div class="xp-project-name-container">
                <Skeleton v-if="loading" width="120px" height="14px" />
                <div v-else class="xp-project-name" :title="scopedProject.projectName">
                  {{ scopedProject.projectName }}
                </div>

                <Skeleton v-if="loading" width="100px" height="12px" style="margin-top: 6px" />
                <div v-else class="xp-project-role" :title="scopedProject.divisionName">
                  {{ scopedProject.divisionName }}
                </div>
              </div>
            </div>

            <!-- Các nút hành động -->
            <div v-if="scopedProject.formMode === FORM_MODE.View" class="xp-project-actions">
              <Button
                @click.stop="reloadData"
                @mousedown.stop=""
                size="small"
                icon="pi pi-refresh"
                variant="text"
                title="Tải lại"
              />
              <Button
                @click.stop="onEdit"
                @mousedown.stop=""
                size="small"
                icon="pi pi-pencil"
                variant="text"
                title="Chỉnh sửa"
              />
            </div>
          </div>
        </AccordionHeader>
        <AccordionContent>
          <EditProject
            v-if="
              scopedProject.formMode === FORM_MODE.Edit ||
              scopedProject.formMode === FORM_MODE.Create
            "
            :initialValues="scopedProject"
            :formMode="scopedProject.formMode"
            @save="onSave"
            @delete="onDelete"
            @cancel="onCancel"
          />
          <ViewProject
            v-else
            ref="view-project-ref"
            :project="scopedProject"
            @loading="loading = $event"
          />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style lang="scss" scoped>
.xp-project-detail {
  width: 100%;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 2px;
  border: 1px solid var(--border-color-dark-only);

  .xp-project-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;

    .xp-employee-header-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }

    .xp-project-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .xp-project-name-container {
        max-width: 200px;
        .xp-project-name {
          max-width: 100%;
          font-size: 14px;
          line-height: 18px;
          font-weight: 600;
          color: var(--color-text);

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .xp-project-role {
          max-width: 100%;
          line-height: 14px;
          font-size: 11px;
          color: var(--text-secondary-color);

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .xp-project-actions {
    }
  }
}

.xp-project-detail + .xp-project-detail {
  margin-top: 24px;
}
</style>
