import React, { Dispatch, useEffect, useState,SetStateAction } from "react";
import { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

export type userType = {
  id: string;
  symbol: string;
};
export interface UsersContextValue {
  users: userType[] | null;
  setUsers: Dispatch<SetStateAction<userType[] | null>>;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export const useUsers = (): Socket | any => {
  return useContext(UsersContext)!; // Use non-null assertion after type check
};

export const UserProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [users, setUsers] = useState<userType[] | null>([]);

  return (
    <UsersContext.Provider value={{ users,setUsers }}>{children}</UsersContext.Provider>
  );
};
