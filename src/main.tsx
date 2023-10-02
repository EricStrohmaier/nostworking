import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import Profile from "./pages/profile";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { RelayPoolProvider } from "./utils/nostr/use-relays-pool.tsx";
import { NostrConnectionProvider } from "./utils/nostr/use-nostr-connection.tsx";
import React from "react";
import About from "./pages/About.tsx";

// Define your routes
const router = createBrowserRouter([
  {
    // errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "profile/:id",
        element: <Profile />,
      },
      {
        path: "profile/edit",
        element: <Profile />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RelayPoolProvider>
      <NostrConnectionProvider>
        <RouterProvider router={router} />
      </NostrConnectionProvider>
    </RelayPoolProvider>
  </React.StrictMode>
);
