<script setup>
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import ViewProject from "@/components/project/components/ViewProject.vue";
import EditProject from "@/components/project/components/EditProject.vue";
import { ref } from "vue";
import { FORM_MODE } from "@/enums/xp-enum";

const formMode = ref(FORM_MODE.View);
</script>

<template>
  <div class="xp-project-detail">
    <Accordion value="0">
      <AccordionPanel value="0">
        <AccordionHeader>
          <div class="xp-project-header">
            <div class="xp-project-info">
              <Avatar
                label="I"
                class="mr-2"
                style="background-color: #dee9fc; color: #1a2551"
                shape="circle"
              />
              <div class="xp-project-name-container">
                <div class="xp-project-name">IVAN</div>
                <div class="xp-project-role">Khối doanh nghiệp</div>
              </div>
            </div>
            <div class="xp-project-actions">
              <Button
                @click.stop=""
                @mousedown.stop=""
                size="small"
                icon="pi pi-refresh"
                variant="text"
                title="Tải lại"
              />
              <Button
                @click.stop=""
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
          <ViewProject v-if="formMode === FORM_MODE.View" />
          <EditProject v-if="formMode === FORM_MODE.Edit" />
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style lang="scss" scoped>
.xp-project-detail {
  width: 100%;
  box-shadow:
    rgba(67, 71, 85, 0.27) 0px 0px 0.25em,
    rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 2px;

  .xp-project-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
    .xp-project-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .xp-project-name-container {
        .xp-project-name {
          font-size: 14px;
          line-height: 18px;
          font-weight: 600;
          color: var(--color-text);
        }
        .xp-project-role {
          line-height: 14px;
          font-size: 11px;
          color: var(--color-text-secondary);
        }
      }
    }

    .xp-project-actions {
    }
  }
}
</style>
