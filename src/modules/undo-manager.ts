const MAX_STACK_DEPTH = 50;

export interface GridSnapshot {
  grid_rle: string;
  perimeter: Array<{ x: number; y: number }>;
  valuables: Array<{ x: number; y: number }>;
}

/**
 * Simple undo/redo manager for grid snapshots.
 * Maintains two stacks (undo and redo) with a maximum depth of 50.
 * Pushing a new snapshot clears the redo stack.
 */
export class UndoManager {
  private _undoStack: GridSnapshot[] = [];
  private _redoStack: GridSnapshot[] = [];

  get canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  /** Push a snapshot before a grid-modifying action. Clears the redo stack. */
  push(snapshot: GridSnapshot): void {
    this._undoStack = [
      ...this._undoStack.slice(-MAX_STACK_DEPTH + 1),
      snapshot,
    ];
    this._redoStack = [];
  }

  /** Undo: pop from undo stack, push to redo stack, return the snapshot. */
  undo(currentSnapshot: GridSnapshot): GridSnapshot | null {
    if (this._undoStack.length === 0) return null;
    const prev = this._undoStack[this._undoStack.length - 1]!;
    this._undoStack = this._undoStack.slice(0, -1);
    this._redoStack = [...this._redoStack, currentSnapshot];
    return prev;
  }

  /** Redo: pop from redo stack, push to undo stack, return the snapshot. */
  redo(currentSnapshot: GridSnapshot): GridSnapshot | null {
    if (this._redoStack.length === 0) return null;
    const next = this._redoStack[this._redoStack.length - 1]!;
    this._redoStack = this._redoStack.slice(0, -1);
    this._undoStack = [...this._undoStack, currentSnapshot];
    return next;
  }

  /** Clear both stacks. */
  clear(): void {
    this._undoStack = [];
    this._redoStack = [];
  }
}
