<script setup>
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import ViewEmployee from "@/components/employee/components/ViewEmployee.vue";
import EditEmployee from "@/components/employee/components/EditEmployee.vue";
import { ref } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";
import { getLocalStorage, setLocalStorage } from "@/utils/common";
import { useToast } from "primevue/usetoast";
import { getAiAgentUsageByProject } from "@/services/reports-api";

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
      isExpand.value = props.expand ? "1" : null;
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
const onDelete = () => {
  const localEmployees = getLocalStorage("employeeList") || [];
  const updatedEmployees = localEmployees.filter((emp) => emp.id !== props.employee.id);
  setLocalStorage("employeeList", updatedEmployees);

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
</script>

<template>
  <div class="xp-employee-detail">
    <Accordion v-model:value="isExpand">
      <AccordionPanel value="1">
        <AccordionHeader>
          <div class="xp-employee-header">
            <div class="xp-employee-info">
              <Avatar
                label="P"
                class="mr-2"
                style="background-color: #dee9fc; color: #1a2551"
                shape="circle"
              />
              <div class="xp-employee-name-container">
                <div class="xp-employee-name">Trần Xuân Phúc</div>
                <div class="xp-employee-role">Lập trình viên</div>
              </div>
            </div>
            <div class="xp-employee-actions">
              <Button
                @click.stop=""
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
                icon="pi pi-cog"
                variant="text"
                title="Cài đặt"
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
          <ViewEmployee v-else />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style lang="scss" scoped>
.xp-employee-detail {
  width: 100%;
  box-shadow:
    rgba(67, 71, 85, 0.27) 0px 0px 0.25em,
    rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 2px;

  .xp-employee-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
    .xp-employee-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .xp-employee-name-container {
        .xp-employee-name {
          font-size: 14px;
          line-height: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        .xp-employee-role {
          line-height: 14px;
          font-size: 11px;
          color: var(--color-text-secondary);
        }
      }
    }

    .xp-employee-actions {
    }
  }
}

.xp-employee-detail + .xp-employee-detail {
  margin-top: 24px;
}
</style>
