import { describe, it, expect, beforeEach } from 'vitest';
import { UndoManager } from './undo-manager.js';
import type { GridSnapshot } from './undo-manager.js';

function snap(rle: string): GridSnapshot {
  return { grid_rle: rle, perimeter: [], valuables: [] };
}

describe('UndoManager', () => {
  let mgr: UndoManager;

  beforeEach(() => {
    mgr = new UndoManager();
  });

  it('starts with canUndo and canRedo false', () => {
    expect(mgr.canUndo).toBe(false);
    expect(mgr.canRedo).toBe(false);
  });

  it('canUndo becomes true after a push', () => {
    mgr.push(snap('a'));
    expect(mgr.canUndo).toBe(true);
  });

  it('undo returns null when stack is empty', () => {
    expect(mgr.undo(snap('current'))).toBeNull();
  });

  it('redo returns null when stack is empty', () => {
    expect(mgr.redo(snap('current'))).toBeNull();
  });

  it('push/undo cycle returns the pushed snapshot', () => {
    const before = snap('before');
    const current = snap('current');
    mgr.push(before);
    const result = mgr.undo(current);
    expect(result).toEqual(before);
  });

  it('undo moves current to redo stack so redo can recover it', () => {
    const before = snap('before');
    const current = snap('current');
    mgr.push(before);
    mgr.undo(current);
    expect(mgr.canRedo).toBe(true);
    const redone = mgr.redo(before);
    expect(redone).toEqual(current);
  });

  it('push clears the redo stack', () => {
    mgr.push(snap('a'));
    mgr.undo(snap('current'));
    expect(mgr.canRedo).toBe(true);
    mgr.push(snap('new'));
    expect(mgr.canRedo).toBe(false);
  });

  it('clear empties both stacks', () => {
    mgr.push(snap('a'));
    mgr.push(snap('b'));
    mgr.undo(snap('c'));
    mgr.clear();
    expect(mgr.canUndo).toBe(false);
    expect(mgr.canRedo).toBe(false);
  });

  it('respects max stack depth of 50', () => {
    for (let i = 0; i < 60; i++) {
      mgr.push(snap(`state-${i}`));
    }
    // Should only keep last 50
    let count = 0;
    while (mgr.canUndo) {
      mgr.undo(snap('x'));
      count++;
    }
    expect(count).toBe(50);
  });

  it('multiple undo/redo cycles work correctly', () => {
    const s1 = snap('s1');
    const s2 = snap('s2');
    const s3 = snap('s3');
    mgr.push(s1);
    mgr.push(s2);
    // undo twice
    const r1 = mgr.undo(s3);
    expect(r1).toEqual(s2);
    const r2 = mgr.undo(s2);
    expect(r2).toEqual(s1);
    expect(mgr.canUndo).toBe(false);
    // redo once
    const r3 = mgr.redo(s1);
    expect(r3).toEqual(s2);
  });

  it('canUndo is false after undoing all entries', () => {
    mgr.push(snap('only'));
    mgr.undo(snap('current'));
    expect(mgr.canUndo).toBe(false);
  });
});
