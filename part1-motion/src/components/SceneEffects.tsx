import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useSceneTheme } from '../context/sceneTheme'

interface SceneEffectsProps {
  reducedMotion: boolean
}

export function SceneEffects({ reducedMotion }: SceneEffectsProps) {
  const { colors } = useSceneTheme()

  if (reducedMotion) return null

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={colors.bloomThreshold}
        luminanceSmoothing={0.82}
        intensity={colors.bloomIntensity}
        mipmapBlur
        radius={0.72}
      />
    </EffectComposer>
  )
}
