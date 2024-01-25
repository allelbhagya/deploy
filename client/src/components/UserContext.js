import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  // Retrieve user info from localStorage on initial load
  const storedUserInfo = localStorage.getItem("userInfo");
  const [userInfo, setUserInfo] = useState(
    storedUserInfo ? JSON.parse(storedUserInfo) : null
  );

  // Update localStorage whenever user info changes
  useEffect(() => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }, [userInfo]);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}
