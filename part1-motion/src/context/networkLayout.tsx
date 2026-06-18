import { createContext, useContext } from 'react'

export interface NetworkLayoutState {
  layoutProgress: number
  isLogoLayout: boolean
}

const NetworkLayoutContext = createContext<NetworkLayoutState>({
  layoutProgress: 0,
  isLogoLayout: false,
})

export function useNetworkLayout() {
  return useContext(NetworkLayoutContext)
}

export const NetworkLayoutProvider = NetworkLayoutContext.Provider
