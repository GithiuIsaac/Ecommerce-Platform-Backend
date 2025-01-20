export const responseReturn = (res, status_code, data) => {
  return res.status(status_code).json(data);
};
