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
      `${basePath}/ai-agent/by-project/${encodeURIComponent(projectName)}/employees`,
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

/**
 * Lấy báo cáo sử dụng chung của các khối
 * @param {*} startDate
 * @param {*} endDate
 * @returns
 */
export const getDivisionsReport = async (startDate, endDate) => {
  try {
    const selectedMonth = new Date();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(23, 59, 59, 999);

    startDate =
      startDate ??
      `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}T00:00:00`;
    endDate =
      endDate ??
      `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}T23:59:59`;

    const response = await axiosClient.get(`${basePath}/ai-agent/by-division`, {
      params: { startDate, endDate },
    });

    return response;
  } catch (error) {
    console.error("Error fetching divisions report:", error);
    throw error;
  }
};

/**
 * Lấy báo cáo sử dụng chung của các dự án
 * @param {*} startDate
 * @param {*} endDate
 * @returns
 */
export const getProjectsReport = async (divisionName, startDate, endDate) => {
  try {
    const selectedMonth = new Date();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(23, 59, 59, 999);

    startDate =
      startDate ??
      `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}T00:00:00`;
    endDate =
      endDate ??
      `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}T23:59:59`;

    const response = await axiosClient.get(
      `${basePath}/ai-agent/by-division/${encodeURIComponent(divisionName)}/projects`,
      {
        params: { startDate, endDate },
      },
    );

    return response;
  } catch (error) {
    console.error("Error fetching project report:", error);
    throw error;
  }
};
