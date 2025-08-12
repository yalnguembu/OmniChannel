// import { Client } from "@/shared/api/core/types"
// import { RequestStatus } from "../../core/enum"
// import { isDateBefore } from "../utils/date"
// // import { OpenAPI, UserService } from "../../services/api/index.ts";
// import { authPersistence } from "./authPersistence"

// interface QueueItem<T> {
//   execute: () => Promise<T>
//   resolve: (value: T | PromiseLike<T>) => void
//   reject: (reason?: any) => void
// }

// interface TokenManagerProperties {
//   accessToken: string
//   refreshToken: string
//   accessTokenExpirationDate: string
//   refreshTokenExpirationDate: string
// }

// export class ApiRequestQueue {
//   private isRefreshing = false
//   private queue: QueueItem<unknown>[] = []
//   private api: Client
//   private refreshTokenPromise: Promise<RequestStatus> | null = null
//   private accessToken = ""
//   private refreshToken = ""
//   private accessTokenExpirationDate = ""

//   constructor(api: Client) {
//     this.api = api
//     this.initializeTokens()
//   }

//   private async initializeTokens() {
//     this.accessToken = authPersistence.getAuthToken()
//     this.refreshToken = authPersistence.getRefreshToken()
//     this.accessTokenExpirationDate = authPersistence.getAuthTokenExpirationDate()

//     if (this.accessToken) {
//       this.api.TOKEN = this.accessToken
//     }
//   }

//   async setTokens(data: TokenManagerProperties) {
//     this.accessToken = data.accessToken
//     this.refreshToken = data.refreshToken
//     this.accessTokenExpirationDate = data.accessTokenExpirationDate

//     authPersistence.storeAuthToken(data.accessToken)
//     authPersistence.storeAuthTokenExpirationDate(data.accessTokenExpirationDate)

//     authPersistence.storeRefreshToken(data.accessToken)
//     authPersistence.storeRefreshTokenExpirationDate(data.accessTokenExpirationDate)

//     this.api.TOKEN = data.accessToken
//   }

//   isTokenExpired(): boolean {
//     if (!this.accessToken || !this.accessTokenExpirationDate) {
//       return true
//     }

//     return isDateBefore(this.accessTokenExpirationDate, new Date().toISOString())
//   }

//   async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
//     if (this.isTokenExpired() && !this.isRefreshing) {
//       await this.refreshAccessToken()
//     }

//     if (!this.isRefreshing) {
//       try {
//         return await requestFn()
//       } catch (error) {
//         if (this.isTokenExpiredError(error as any)) {
//           return this.handleTokenRefresh(requestFn)
//         }
//         throw error
//       }
//     } else {
//       return this.enqueueRequest(requestFn)
//     }
//   }

//   private isTokenExpiredError(error: any): boolean {
//     return error?.status === 401 || error?.response?.status === 401
//   }

//   private async handleTokenRefresh<T>(requestFn: () => Promise<T>): Promise<T> {
//     if (!this.isRefreshing) {
//       this.isRefreshing = true
//       this.refreshTokenPromise = this.refreshAccessToken()
//     }

//     try {
//       const status = await this.refreshTokenPromise
//       if (status === RequestStatus.FAILED) {
//         throw new Error("Token refresh failed")
//       }
//       return await requestFn()
//     } catch (refreshError) {
//       this.processQueue(refreshError, true)
//       throw refreshError
//     }
//   }

//   private enqueueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
//     return new Promise<T>((resolve, reject) => {
//       this.queue.push({
//         execute: requestFn,
//         resolve: resolve as any,
//         reject,
//       })
//     })
//   }

//   async refreshAccessToken(): Promise<RequestStatus> {
//     if (!this.accessToken || !this.refreshToken) {
//       authPersistence.clearAuthData()
//       return RequestStatus.FAILED
//     }

//     try {
//       // const response = await UserService.refreshUserToken({
//       //   requestBody: {
//       //     token: this.accessToken,
//       //     refreshToken: this.refreshToken,
//       //   },
//       // })

//       // if (!response.data?.token) {
//       //   throw new Error("Invalid token response")
//       // }

//       // const token = response.data.token
//       // const tokenExpirationDate = response.data.tokenExpiresUtc ?? ""

//       // await this.setTokens({
//       //   accessToken: token,
//       //   refreshToken: this.refreshToken,
//       //   accessTokenExpirationDate: tokenExpirationDate,
//       // })

//       // this.processQueue(null)

//       return RequestStatus.SUCCESS
//     } catch (error) {
//       console.error("Error refreshing token:", error)
//       authPersistence.clearAuthData()
//       this.processQueue(error, true)
//       return RequestStatus.FAILED
//     } finally {
//       this.isRefreshing = false
//       this.refreshTokenPromise = null
//     }
//   }

//   private processQueue(error: unknown, isError = false): void {
//     this.queue.forEach((item) => {
//       if (isError) {
//         item.reject(error)
//       } else {
//         item.execute().then(item.resolve).catch(item.reject)
//       }
//     })

//     this.queue = []
//   }

//   async getValidToken(): Promise<string> {
//     if (this.accessToken && !this.isTokenExpired()) {
//       return this.accessToken
//     }

//     const status = await this.refreshAccessToken()
//     if (status === RequestStatus.SUCCESS) {
//       return this.accessToken
//     }

//     throw new Error("Failed to get valid token")
//   }
// }
