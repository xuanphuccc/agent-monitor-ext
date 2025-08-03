import axiosClient from "./axios-client";
const basePath = "/reports";

/**
 * Lấy báo cáo tình hình sử dụng AI theo dự án
 * @param {*} projectName - Tên dự án cần lấy báo cáo
 * @param {*} startDate - Ngày bắt đầu của khoảng thời gian báo cáo
 * @param {*} endDate - Ngày kết thúc của khoảng thời gian báo cáo
 * @returns {Promise<Object>} - Promise chứa dữ liệu báo cáo
 */
export const getAiAgentUsageByProject = async (projectName, startDate, endDate) => {
  try {
    const response = await axiosClient.get(
      `${basePath}/ai-agent/by-project/${projectName}/employees`,
      {
        params: { startDate, endDate },
      },
    );

    return response;
  } catch (error) {
    console.error("Error fetching AI agent usage by project:", error);
    throw error;
  }
};

/** * Lấy báo cáo tình hình sử dụng AI toàn công ty
 * @param {string} startDate - Ngày bắt đầu của khoảng thời gian báo cáo
 * @param {string} endDate - Ngày kết thúc của khoảng thời gian báo cáo
 * @returns {Promise<Object>} - Promise chứa dữ liệu báo cáo
 */
export const getOverallAiAgentUsage = async (startDate, endDate) => {
  try {
    const response = await axiosClient.get(`${basePath}/ai-agent/overall`, {
      params: { startDate, endDate },
    });

    return response;
  } catch (error) {
    console.error("Error fetching overall AI agent usage:", error);
    throw error;
  }
};
