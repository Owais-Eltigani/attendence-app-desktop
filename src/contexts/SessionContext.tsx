import { createContext, useContext } from "react";
import { attendanceRecord } from "@/types";

// Create context with proper typing
export const SessionContext = createContext<attendanceRecord | null>(null);

// Custom hook to use the context (makes it easier to consume)
export const useSession = () => {
  const context = useContext(SessionContext);

  if (context === null) {
    throw new Error("useSession must be used within a SessionContext.Provider");
  }

  return context;
};
