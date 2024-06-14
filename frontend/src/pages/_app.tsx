import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider, UserProfile } from "@clerk/nextjs";
import "./components/grid/grid.css";
import { SocketProvider } from "@/context/socket";
import { UserProvider } from "@/context/usersContext";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
        <SocketProvider>
        <UserProvider>
        <Component {...pageProps} />
        </UserProvider>
        </SocketProvider>
    </ClerkProvider>
  );
}
