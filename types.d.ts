// @hello-pangea/dnd の型定義
declare module '@hello-pangea/dnd' {
  import * as React from 'react';
  
  // ドロップ結果の型
  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    destination?: {
      droppableId: string;
      index: number;
    };
    reason: 'DROP' | 'CANCEL';
  }
  
  // Droppable用の型
  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: {
      [key: string]: any;
    };
    placeholder?: React.ReactElement | null;
  }
  
  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith?: string;
    draggingFromThisWith?: string;
    isUsingPlaceholder: boolean;
  }
  
  // Draggable用の型
  export interface DraggableProvided {
    draggableProps: {
      [key: string]: any;
      style?: React.CSSProperties;
    };
    dragHandleProps: {
      [key: string]: any;
    } | null;
    innerRef: (element: HTMLElement | null) => void;
  }
  
  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    dropAnimation?: {
      duration: number;
      curve: string;
      moveTo: {
        x: number;
        y: number;
      };
    };
    draggingOver?: string;
    combineWith?: string;
    combineTargetFor?: string;
    mode?: 'FLUID' | 'SNAP';
  }
  
  export interface DraggableChildrenFn {
    (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric): React.ReactElement;
  }
  
  export interface DraggableRubric {
    draggableId: string;
    type: string;
    source: {
      index: number;
      droppableId: string;
    };
  }
  
  // コンポーネント
  export interface DroppableProps {
    droppableId: string;
    type?: string;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'horizontal' | 'vertical';
    ignoreContainerClipping?: boolean;
    renderClone?: DraggableChildrenFn;
    getContainerForClone?: () => HTMLElement;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
  }
  
  export class Droppable extends React.Component<DroppableProps> {}
  
  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: DraggableChildrenFn;
  }
  
  export class Draggable extends React.Component<DraggableProps> {}
  
  export interface DragDropContextProps {
    onDragStart?: (start: DragStart) => void;
    onDragUpdate?: (update: DragUpdate) => void;
    onDragEnd: (result: DropResult) => void;
    children: React.ReactNode;
    sensor?: Sensor;
    enableDefaultSensors?: boolean;
  }
  
  export interface DragStart {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    mode: 'FLUID' | 'SNAP';
  }
  
  export interface DragUpdate extends DragStart {
    destination?: {
      droppableId: string;
      index: number;
    };
    combine?: {
      draggableId: string;
      droppableId: string;
    };
  }
  
  export interface Sensor {
    // センサーインターフェース
  }
  
  export class DragDropContext extends React.Component<DragDropContextProps> {}
} 