import { createContext, useContext, useRef } from 'react'

interface GraphRotationContextValue {
  wasDragged: () => boolean
  isDragging: () => boolean
}

export const GraphRotationContext = createContext<GraphRotationContextValue>({
  wasDragged: () => false,
  isDragging: () => false,
})

export function useGraphRotation() {
  return useContext(GraphRotationContext)
}

export function useGraphRotationState() {
  const dragMoved = useRef(false)
  const dragging = useRef(false)

  return {
    dragMoved,
    dragging,
    api: {
      wasDragged: () => dragMoved.current,
      isDragging: () => dragging.current,
    },
  }
}
