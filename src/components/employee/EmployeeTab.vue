<script setup>
import Employee from "@/components/employee/components/Employee.vue";
import Button from "primevue/button";
</script>

<template>
  <div class="xp-employee-tab">
    <Employee />

    <div class="xp-employee-tab-actions">
      <Button size="small" label="Thêm mới" icon="pi pi-plus" />
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
