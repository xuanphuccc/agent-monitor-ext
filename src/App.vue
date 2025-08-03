<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import EmployeeTab from "@/components/employee/EmployeeTab.vue";
import ProjectTab from "@/components/project/ProjectTab.vue";
import DashboardTab from "@/components/dashboard/DashboardTab.vue";
import { SelectButton } from "primevue";
import { ref } from "vue";
import Toast from "primevue/toast";

const currentTab = ref(1);
const options = [
  { label: "Nhân viên", value: 1 },
  { label: "Dự án", value: 2 },
  { label: "Tổng quan", value: 3 },
];
</script>

<template>
  <MainLayout>
    <div class="xp-main-content">
      <div class="xp-header">
        <SelectButton
          v-model="currentTab"
          optionLabel="label"
          optionValue="value"
          :options="options"
          size="small"
        />
      </div>

      <EmployeeTab v-if="currentTab === 1" />
      <ProjectTab v-if="currentTab === 2" />
      <DashboardTab v-if="currentTab === 3" />

      <Toast />
    </div>
  </MainLayout>
</template>

<style lang="scss" scoped>
.xp-main-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  .xp-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px 12px;
  }
}
</style>
