import api from "../utils/axios";

export const checkout = async () => {
  const response = await api.post("/orders/checkout/");
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get("/orders/");
  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}/`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get("/admin/orders/");
  return response.data;
};

export const updateOrderStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/admin/orders/${id}/`,
    { status }
  );

  return response.data;
};