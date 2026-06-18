import { createContext, useContext } from 'react'
import type { ThemeMode } from '../utils/sceneTheme'
import { SCENE_COLORS, type SceneColors } from '../utils/sceneTheme'

interface ThemeContextValue {
  theme: ThemeMode
  colors: SceneColors
  isTouch: boolean
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  colors: SCENE_COLORS.light,
  isTouch: false,
})

export function useSceneTheme() {
  return useContext(ThemeContext)
}
