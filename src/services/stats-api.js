import axiosClient from "./axios-client";
const basePath = "/stats";

/**
 * Lấy lịch sử sử dụng AI hàng tháng của nhân viên
 * @param {*} month - Tháng cần lấy dữ liệu (1-12)
 * @param {*} year - Năm cần lấy dữ liệu
 * @param {*} employeeCode - Mã nhân viên cần lấy dữ liệu
 * @returns {Promise<Object>} - Promise chứa dữ liệu lịch sử sử dụng
 */
export const getMonthlyUsageHistory = async (month, year, employeeCode) => {
  try {
    const response = await axiosClient.get(`${basePath}/monthly-calendar`, {
      params: { month, year, employeeCode },
    });

    return response;
  } catch (error) {
    console.error("Error fetching monthly calendar:", error);
    throw error;
  }
};

/**
 * Tìm kiếm nhân viên
 * @param {*} search
 * @returns
 */
export const searchEmployees = async (search) => {
  try {
    const response = await axiosClient.get(`${basePath}/employees/search`, {
      params: { searchTerm: search },
    });

    return response;
  } catch (error) {
    console.error("Error search employees:", error);
    throw error;
  }
};
