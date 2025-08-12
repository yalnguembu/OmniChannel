import React from "react"
import ReactDOM from "react-dom/client"
import { AppProvider } from "./providers/app-provider"
import "./index.css"
import "@fontsource/poppins"
import "@fontsource/poppins/500.css"
import "@fontsource/poppins/600.css"
import "@fontsource/poppins/700.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider />
  </React.StrictMode>,
)
