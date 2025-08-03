/**
 * Lấy giá trị từ localStorage
 * @param {string} key - Tên khóa để lấy giá trị
 * @returns {*} - Giá trị đã lưu trong localStorage, hoặc null nếu không có
 */
export const getLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

/**
 * Lưu giá trị vào localStorage
 * @param {string} key - Tên khóa để lưu giá trị
 * @param {*} value - Giá trị cần lưu
 */
export const setLocalStorage = (key, value) => {
  if (value === undefined || value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
