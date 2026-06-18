import { Html } from '@react-three/drei'
import { useSceneTheme } from '../context/sceneTheme'
import { useNetwork } from './NetworkScene'
import type { GraphNode } from '../utils/networkGraph'
import { interpolateNodeSize } from '../utils/networkGraph'
import styles from './NodeLabel.module.css'

interface NodeLabelProps {
  node: GraphNode
}

export function NodeLabel({ node }: NodeLabelProps) {
  const { hoveredId, activeId, touchedId, layoutProgress } = useNetwork()
  const { colors } = useSceneTheme()

  const isHub = node.role === 'hub'
  const nodeSize = interpolateNodeSize(node, layoutProgress)
  const isVisible =
    isHub || (node.label && (hoveredId === node.id || activeId === node.id || touchedId === node.id))

  if (!isVisible) return null

  return (
    <Html
      center
      transform={false}
      position={[0, isHub ? nodeSize * 2.6 : nodeSize * 2.1, 0]}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[40, 0]}
    >
      <div
        className={`${styles.label} ${isHub ? styles.labelHub : ''}`}
        style={{
          background: colors.labelBg,
          color: colors.labelText,
          borderColor: colors.labelBorder,
        }}
      >
        <span className={styles.labelCity}>{node.label}</span>
        {isHub && <span className={styles.labelSub}>2027 Conference</span>}
      </div>
    </Html>
  )
}
