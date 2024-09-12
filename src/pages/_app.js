import { useEffect, useState } from "react";
import App from "next/app";
import { Poppins } from "next/font/google";
import "../styles/globals.css";
import Head from "next/head";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import SocketContextProvider from "@/context/SocketProvider";

if (typeof window !== "undefined") {
  window.deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.deferredInstallPrompt = e;
  });
}
const poppins = Poppins({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

// Create a theme instance
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "black",
          color: "white",
          "&:hover": {
            backgroundColor: "#333", // A slightly lighter black for hover state
          },
        },
      },
    },
  },
});

// Custom hook for service worker registration
function useServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/service-worker.js").then(
          function (registration) {
            console.log(
              "Service Worker registration successful with scope: ",
              registration.scope
            );
          },
          function (err) {
            console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);
}

function MyApp({ Component, pageProps, whatsappNumber }) {
  // Use the custom hook
  useServiceWorker();

  // State to store the WhatsApp number
  const [whatsapp, setWhatsapp] = useState(whatsappNumber);

  // Effect to update WhatsApp number if it changes
  useEffect(() => {
    setWhatsapp(whatsappNumber);
  }, [whatsappNumber]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Aone Ludo</title>
        <meta name="description" content="Most trusted ludo platform" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/icons/mask-icon.svg" color="#FFFFFF" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link rel="apple-touch-icon" sizes="300x300" href="/logo_ludo.webp" />

        <link rel="manifest" href="/manifest.json" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Aone Ludo" />
        <meta property="og:description" content="Most trusted ludo platform" />
        <meta property="og:site_name" content="Aone Ludo" />
        <meta property="og:url" content="https://aoneludo.com/" />
      </Head>
      <main className={poppins.className}>
        <SocketContextProvider>
          <Component {...pageProps} />
        </SocketContextProvider>
        <a href={`https://wa.me/+91${whatsapp}`}>
          <img
            src="/whatsapp_icon.svg"
            width={50}
            height={50}
            alt="wp_icon"
            style={{
              position: "fixed",
              bottom: "40px",
              right: "20px",
              zIndex: "999999",
            }}
          />
        </a>
      </main>
    </ThemeProvider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);

  // Fetch WhatsApp number
  const res = await fetch(
    `https://admin.aoneludo.com/panel/get-admin-details/5/`
  );

  const data = await res.json();

  return {
    ...appProps,
    whatsappNumber: data.whatsapp_number,
  };
};

export default MyApp;
