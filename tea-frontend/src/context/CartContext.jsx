import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getCart,
} from "../services/cartService";

const CartContext = createContext();

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
};

export const CartProvider = ({
  children,
}) => {

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [cart, setCart] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const fetchCart = async () => {

    try {

      const data =
        await getCart();

      setCart(data);

    } catch (error) {

      console.error(
        "Failed to fetch cart",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    if (authLoading) {
      return;
    }

    if (user) {

      fetchCart();

    } else {

      setCart(null);

      setLoading(false);

    }

  }, [user, authLoading]);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        loading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;