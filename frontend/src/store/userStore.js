import { create } from "zustand";
import Cookies from "js-cookie";

const useUserStore = create((set) => ({
  user: null,

  // ✅ load user from cookie (when app starts)
  loadUserFromCookie: () => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        set({ user: parsedUser });
      } catch (err) {
        console.error("Failed to parse user cookie:", err);
        set({ user: null });
      }
    }
  },

  // ✅ update user and also update cookie
  setUser: (userData) => {
    Cookies.set("user", JSON.stringify(userData), { expires: 7 }); // keep 7 days
    set({ user: userData });
  },

  // ✅ logout: clear both store + cookie
  clearUser: () => {
    Cookies.remove("user");
    set({ user: null });
  },
}));

export default useUserStore;
