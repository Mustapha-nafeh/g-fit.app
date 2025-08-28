import React, { createContext, useContext, useState } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [member, setMember] = useState(null);

  return (
    <GlobalContext.Provider
      value={{
        member,
        setMember,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
