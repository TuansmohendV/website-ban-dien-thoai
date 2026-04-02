export const createTimelineEntry = (status, label, message = '') => ({
  status,
  label,
  message,
  createdAt: new Date(),
});
