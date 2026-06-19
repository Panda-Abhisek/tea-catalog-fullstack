import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import api from "../utils/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};

const decodeToken = (token) => {
  try {
    const base64Url =
      token.split(".")[1];

    const base64 =
      base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const jsonPayload =
      decodeURIComponent(
        atob(base64)
          .split("")
          .map(
            (c) =>
              "%" +
              (
                "00" +
                c.charCodeAt(0).toString(16)
              ).slice(-2)
          )
          .join("")
      );

    return JSON.parse(
      jsonPayload
    );
  } catch {
    return null;
  }
};

export const AuthProvider = ({
  children,
}) => {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const storedUser =
      localStorage.getItem(
        "user"
      );

    if (
      token &&
      storedUser
    ) {

      setUser(
        JSON.parse(
          storedUser
        )
      );

    } else {

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem(
        "user"
      );

    }

    setLoading(false);

  }, []);

  const login = async (
    username,
    password
  ) => {

    const response =
      await api.post(
        "/login/",
        {
          username,
          password,
        }
      );

    const {
      access,
      refresh,
      user: backendUser,
    } = response.data;

    localStorage.setItem(
      "access_token",
      access
    );

    localStorage.setItem(
      "refresh_token",
      refresh
    );

    if (backendUser) {

      localStorage.setItem(
        "user",
        JSON.stringify(
          backendUser
        )
      );

      setUser(
        backendUser
      );

    } else {

      const decoded =
        decodeToken(access);

      const fallbackUser = {
        id:
          decoded?.user_id ||
          decoded?.id,
        username:
          decoded?.username ||
          decoded?.name,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(
          fallbackUser
        )
      );

      setUser(
        fallbackUser
      );
    }

    return response.data;
  };

  const register = async (
    username,
    password1,
    password2
  ) => {

    const response =
      await api.post(
        "/register/",
        {
          username,
          password1,
          password2,
        }
      );

    if (
      response.data.access &&
      response.data.refresh
    ) {

      localStorage.setItem(
        "access_token",
        response.data.access
      );

      localStorage.setItem(
        "refresh_token",
        response.data.refresh
      );

      const decoded =
        decodeToken(
          response.data.access
        );

      const userData = {
        id:
          decoded?.user_id ||
          decoded?.id,
        username:
          decoded?.username ||
          decoded?.name,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(
          userData
        )
      );

      setUser(
        userData
      );
    }

    return response.data;
  };

  const logout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;