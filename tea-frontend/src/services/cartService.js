import api from "../utils/axios";

export const getCart = async () => {
  const response = await api.get("/cart/");
  return response.data;
};

export const addToCart = async (
  teaId,
  quantity = 1
) => {
  return api.post(
    "/cart/add/",
    {
      tea_id: teaId,
      quantity,
    }
  );
};

export const updateCartItem = async (
  itemId,
  quantity
) => {
  return api.patch(
    `/cart/item/${itemId}/`,
    {
      quantity,
    }
  );
};

export const removeCartItem = async (
  itemId
) => {
  return api.delete(
    `/cart/item/${itemId}/delete/`
  );
};

export const clearCart = async () => {
  return api.delete(
    "/cart/clear/"
  );
};