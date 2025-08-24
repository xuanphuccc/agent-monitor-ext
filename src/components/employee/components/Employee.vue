<script setup>
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { useToast } from "primevue/usetoast";
import ViewEmployee from "@/components/employee/components/ViewEmployee.vue";
import EditEmployee from "@/components/employee/components/EditEmployee.vue";
import { ref, useTemplateRef } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";
import { getAvatarLetter, getFromStorage, saveToStorage } from "@/utils/common";

const toast = useToast();
const emit = defineEmits(["cancel", "delete", "save"]);
const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },

  expand: {
    type: Boolean,
    default: false,
  },
});

const scopedEmployee = ref(null);
const isExpand = ref(null);
const loading = ref(false);
const viewEmployeeRef = useTemplateRef("view-employee-ref");

/**
 * Hàm khởi tạo dữ liệu ban đầu
 */
const initData = async (initEmployee = true) => {
  try {
    if (!props.employee) {
      return;
    }

    if (initEmployee) {
      scopedEmployee.value = JSON.parse(JSON.stringify(props.employee));
      isExpand.value = props.expand || props.employee.formMode === FORM_MODE.Create ? "1" : null;
    }
  } catch (error) {
    console.error("Error initializing employee data:", error);
  }
};
initData();

/**
 * Hàm xử lý sự kiện khi nhấn Huỷ
 */
const onCancel = () => {
  scopedEmployee.value.formMode = FORM_MODE.View; // Chuyển về chế độ xem
  emit("cancel", props.employee.id);
};

/**
 * Hàm xử lý sự kiện khi nhấn nút "Xoá"
 */
const onDelete = async () => {
  const localEmployees = (await getFromStorage("employeeList")) || [];
  const updatedEmployees = localEmployees.filter((emp) => emp.id !== props.employee.id);
  await saveToStorage("employeeList", updatedEmployees);

  emit("delete", props.employee.id);

  toast.add({ severity: "success", summary: "Xoá dữ liệu thành công.", life: 3000 });
};

/**
 * Hàm xử lý sự kiện khi nhấn nút "Lưu"
 */
const onSave = async (employee) => {
  if (!employee) {
    return;
  }

  scopedEmployee.value = {
    ...employee,
    formMode: FORM_MODE.View,
  };

  await initData(false);

  // Gọi sự kiện save để thông báo cho cha biết
  emit("save", employee);
};

/**
 * Hàm xử lý sự kiện khi nhấn nút "Chỉnh sửa"
 */
const onEdit = () => {
  scopedEmployee.value.formMode = FORM_MODE.Edit; // Chuyển sang chế độ chỉnh sửa
  isExpand.value = "1"; // Mở rộng accordion
};

/**
 * Hàm nạp lại dữ liệu nhân viên
 */
const reloadData = () => {
  if (viewEmployeeRef.value && typeof viewEmployeeRef.value.initData === "function") {
    viewEmployeeRef.value.initData();
  }
};
</script>

<template>
  <div class="xp-employee-detail">
    <Accordion
      v-model:value="isExpand"
      :dt="{
        panel: { border: { width: '0px' } },
      }"
    >
      <AccordionPanel value="1">
        <AccordionHeader>
          <div class="xp-employee-header">
            <!-- Title khi thêm mới/chỉnh sửa -->
            <div
              v-if="
                scopedEmployee.formMode === FORM_MODE.Create ||
                scopedEmployee.formMode === FORM_MODE.Edit
              "
              class="xp-employee-header-title"
            >
              {{ scopedEmployee.formMode === FORM_MODE.Create ? "Thêm mới" : "Chỉnh sửa" }}
            </div>

            <!-- Hiển thị thông tin nhân viên khi ở chế độ xem -->
            <div v-if="scopedEmployee.formMode === FORM_MODE.View" class="xp-employee-info">
              <Skeleton v-if="loading" shape="circle" size="28px" class="mr-2" />
              <Avatar
                v-else
                :label="getAvatarLetter(scopedEmployee.employeeName)"
                class="mr-2"
                style="background-color: #dee9fc; color: #1a2551; flex-shrink: 0"
                shape="circle"
              />
              <div class="xp-employee-name-container">
                <Skeleton v-if="loading" width="120px" height="14px" />
                <div v-else class="xp-employee-name" :title="scopedEmployee.employeeName">
                  {{ scopedEmployee.employeeName }}
                </div>

                <Skeleton v-if="loading" width="100px" height="12px" style="margin-top: 6px" />
                <div v-else class="xp-employee-role" :title="scopedEmployee.employeeCode">
                  {{ scopedEmployee.employeeCode }}
                </div>
              </div>
            </div>

            <!-- Các nút hành động -->
            <div v-if="scopedEmployee.formMode === FORM_MODE.View" class="xp-employee-actions">
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
          <EditEmployee
            v-if="
              scopedEmployee.formMode === FORM_MODE.Edit ||
              scopedEmployee.formMode === FORM_MODE.Create
            "
            :initialValues="scopedEmployee"
            :formMode="scopedEmployee.formMode"
            @save="onSave"
            @delete="onDelete"
            @cancel="onCancel"
          />
          <ViewEmployee
            v-else
            ref="view-employee-ref"
            :employee="scopedEmployee"
            @loading="loading = $event"
          />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style lang="scss" scoped>
.xp-employee-detail {
  width: 100%;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 2px;

  .xp-employee-header {
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

    .xp-employee-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .xp-employee-name-container {
        max-width: 200px;
        .xp-employee-name {
          font-size: 14px;
          line-height: 18px;
          font-weight: 600;
          color: var(--color-text);

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .xp-employee-role {
          line-height: 14px;
          font-size: 11px;
          color: var(--color-text-secondary);

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

.xp-employee-detail + .xp-employee-detail {
  margin-top: 24px;
}
</style>
