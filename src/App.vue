<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import EmployeeTab from "@/components/employee/EmployeeTab.vue";
import ProjectTab from "@/components/project/ProjectTab.vue";
import DashboardTab from "@/components/dashboard/DashboardTab.vue";
import Setting from "@/components/setting/Setting.vue";
import { SelectButton } from "primevue";
import { ref } from "vue";
import Toast from "primevue/toast";

const currentTab = ref(1);
const options = [
  { label: "Nhân viên", value: 1 },
  { label: "Dự án", value: 2 },
  { label: "Tổng quan", value: 3 },
];
const showSetting = ref(false);
</script>

<template>
  <MainLayout @setting="showSetting = !showSetting">
    <div class="xp-main-content">
      <template v-if="showSetting">
        <Setting @back="showSetting = false" />
      </template>
      <template v-else>
        <div class="xp-header">
          <SelectButton
            v-model="currentTab"
            optionLabel="label"
            optionValue="value"
            :options="options"
            :allowEmpty="false"
            size="small"
            fluid
          />
        </div>

        <EmployeeTab v-if="currentTab === 1" />
        <ProjectTab v-if="currentTab === 2" />
        <DashboardTab v-if="currentTab === 3" />
      </template>

      <Toast />
    </div>
  </MainLayout>
</template>

<style lang="scss" scoped>
.xp-main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow-y: auto;
  background: #f9fbfc;

  .xp-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.1);
    // border-bottom: 1px solid #efefef;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }
}
</style>
