<script setup>
import Project from "@/components/project/components/Project.vue";
import Button from "primevue/button";
</script>

<template>
  <div class="xp-project-tab">
    <Project />

    <div class="xp-project-tab-actions">
      <Button size="small" label="Thêm mới" icon="pi pi-plus" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xp-project-tab {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0px 12px;

  .xp-project-tab-actions {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}
</style>
