import type React from "react"
declare module "react-beautiful-dnd" {
  export interface DraggableProvided {
    draggableProps: any
    dragHandleProps: any
    innerRef: (element?: HTMLElement | null) => void
  }

  export interface DroppableProvided {
    innerRef: (element?: HTMLElement | null) => void
    droppableProps: any
    placeholder?: React.ReactNode
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean
    isDropAnimating: boolean
    draggingOver?: string
    dropAnimation?: {
      duration: number
      curve: string
      moveTo: {
        x: number
        y: number
      }
    }
    combineWith?: string
    combineTargetFor?: string
    mode?: string
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean
    draggingOverWith?: string
    draggingFromThisWith?: string
  }

  export interface DroppableProps {
    droppableId: string
    type?: string
    direction?: "horizontal" | "vertical"
    isDropDisabled?: boolean
    isCombineEnabled?: boolean
    ignoreContainerClipping?: boolean
  }

  export interface DraggableProps {
    draggableId: string
    index: number
    isDragDisabled?: boolean
  }

  export interface DragDropContextProps {
    onDragEnd: (result: DropResult) => void
    onDragStart?: (initial: DragStart) => void
    onDragUpdate?: (update: DragUpdate) => void
  }

  export interface DragStart {
    draggableId: string
    type: string
    source: {
      droppableId: string
      index: number
    }
  }

  export interface DragUpdate extends DragStart {
    destination?: {
      droppableId: string
      index: number
    } | null
  }

  export interface DropResult extends DragStart {
    destination?: {
      droppableId: string
      index: number
    } | null
    reason: string
    combine?: {
      draggableId: string
      droppableId: string
    } | null
  }

  export const DragDropContext: React.ComponentType<DragDropContextProps>
  export const Droppable: React.ComponentType<
    DroppableProps & {
      children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactNode
    }
  >
  export const Draggable: React.ComponentType<
    DraggableProps & {
      children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactNode
    }
  >
}

