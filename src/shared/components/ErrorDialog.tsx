// import { FC, useEffect, useRef } from "react"
// import { useNavigate } from "@tanstack/react-router"
// import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/shared/components/ui/alert-dialog"
// import { RedirectRule, useErrorStore } from "@/stores/errorStore"
// import { TriangleAlert, SearchX, ServerCrash, WifiOff, X } from "lucide-react"
// import { useTranslation } from "react-i18next"
// import { Button } from "@/shared/components/ui/button"
// // import { useAuthStore } from "@/stores/authStore"

// export const ErrorDialog: FC = () => {
//   const okButtonRef = useRef<HTMLButtonElement>(null)
//   const { error, clearError } = useErrorStore()
//   const { t } = useTranslation()
//   const navigate = useNavigate()
//   // const { logout } = useAuthStore()
//   const stepStatus = [405] // Steps requiring login redirection

//   useEffect(() => {
//     if (error && okButtonRef.current) {
//       okButtonRef.current.focus()
//     }
//   }, [error])

//   // Helper function to check if a status matches any rule
//   const findMatchingRedirectPath = (currentStatus: number, rules: RedirectRule | RedirectRule[]): string | null => {
//     const rulesArray = Array.isArray(rules) ? rules : [rules]

//     for (const rule of rulesArray) {
//       const statusArray = Array.isArray(rule.status) ? rule.status : [rule.status]
//       if (statusArray.includes(currentStatus)) {
//         return rule.path
//       }
//     }

//     return null
//   }

//   const handleClose = () => {
//     // Handle specifics mesages for 403 and 401 before redirection
//     if (error?.status === 403 && error?.response?.data?.error === "access-denied") {
//       // logout()
//       navigate({ to: "/auth/login" })
//     } else if (error?.status === 401 && error?.response?.data?.error !== "invalid-token") {
//       // logout()
//       navigate({ to: "/auth/login" })
//     }
//     // Redirection for others cases
//     else if (error?.status && error.redirectRules) {
//       const redirectPath = findMatchingRedirectPath(error.status, error.redirectRules)
//       if (redirectPath) {
//         navigate({ to: redirectPath })
//       }
//     }
//     // Handle step-based redirection (legacy support)
//     else if (error?.object?.step && stepStatus.includes(error.object.step)) {
//       navigate({ to: "/auth/login" })
//     }

//     clearError()
//   }

//   const handleKeyDown = (event: React.KeyboardEvent) => {
//     event.stopPropagation()
//     if (event.key === "Enter" || event.key === "Escape") {
//       handleClose()
//     }
//   }

//   if (!error) return null

//   const getErrorIcon = () => {
//     // Case network error/offline
//     if (!error.status || error.message?.includes("Network Error")) {
//       return {
//         icon: <WifiOff className="w-8" />,
//         color: "orange-500",
//         statusText: "???",
//         customMessage: t("sessions.network_error"),
//       }
//     }

//     const status = error.status
//     // Handle specifics mesages for 403 and 401
//     if (status === 403 && error.response?.data?.error === "access-denied") {
//       return {
//         icon: <TriangleAlert className="w-8" />,
//         color: "red-500",
//         statusText: status.toString(),
//         customMessage: t("sessions.access_denied"),
//       }
//     }

//     if (status === 401 && error.response?.data?.error !== "invalid-token") {
//       return {
//         icon: <TriangleAlert className="w-8" />,
//         color: "red-500",
//         statusText: status.toString(),
//         customMessage: t("sessions.session_expired"),
//       }
//     }

//     if ([500, 501, 502, 503, 504].includes(status))
//       return {
//         icon: <ServerCrash className="w-8" />,
//         color: "red-500",
//         statusText: status.toString(),
//       }
//     if (status === 404)
//       return {
//         icon: <SearchX className="w-8" />,
//         color: "yellow-500",
//         statusText: status.toString(),
//       }
//     return {
//       icon: <TriangleAlert className="w-8" />,
//       color: "yellow-500",
//       statusText: status.toString(),
//     }
//   }

//   const { icon, color, statusText, customMessage } = getErrorIcon()

//   return (
//     <AlertDialog defaultOpen={!!error} onOpenChange={handleClose}>
//       <AlertDialogContent style={{ zIndex: "1100" }} onKeyDown={handleKeyDown}>
//         <AlertDialogHeader>
//           <div className="w-auto">
//             <div className={`flex items-center gap-2 border rounded-sm w-20 text-${color} border-current px-1 py-[.1rem]`}>
//               {icon}
//               <AlertDialogTitle className="text-normal text-sm">{statusText}</AlertDialogTitle>
//             </div>
//           </div>
//           <div className={`borde-${color} border-b block`}></div>{" "}
//           <AlertDialogDescription className="break-all whitespace-pre-wrap">{(customMessage || error.message || "").toString()}</AlertDialogDescription>
//         </AlertDialogHeader>
//         {error?.message?.length > 200 && <div className={`borde-${color} border-b block my-2`}></div>}
//         <AlertDialogFooter>
//           <Button variant="destructive" onClick={handleClose} autoFocus>
//             <X className="h-4 w-4" />
//             {t("close")}
//           </Button>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   )
// }
