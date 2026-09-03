import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Edge } from 'reactflow';

import { mergeSemanticEdgeColors } from './reactflow-edge-colors.ts';

describe('mergeSemanticEdgeColors', () => {
  it('updates only matched color fields without restoring deleted edges', () => {
    const data = { permission: 'read', nested: { retained: true } };
    const matchedEdge = {
      id: 'matched',
      source: 'source',
      target: 'target',
      selected: true,
      animated: true,
      data,
      style: {
        stroke: '#111111',
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 2px currentColor)',
      },
      labelStyle: {
        fill: '#222222',
        fontWeight: 600,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#333333',
        width: 24,
        height: 16,
      },
    } as Edge;
    const unmatchedEdge = {
      id: 'unmatched',
      source: 'other-source',
      target: 'other-target',
      selected: false,
      data: { retained: true },
      style: { stroke: '#444444', strokeDasharray: '2 2' },
    } as Edge;
    const semanticEdges = [
      {
        id: 'matched',
        source: 'replacement-source',
        target: 'replacement-target',
        selected: false,
        data: { replacement: true },
        style: { stroke: '#aaaaaa', strokeWidth: 99 },
        labelStyle: { fill: '#bbbbbb', fontWeight: 100 },
        markerEnd: {
          type: 'arrow',
          color: '#cccccc',
          width: 2,
          height: 2,
        },
      },
      {
        id: 'deleted',
        source: 'deleted-source',
        target: 'deleted-target',
        style: { stroke: '#dddddd' },
      },
    ] as Edge[];

    const result = mergeSemanticEdgeColors(
      [matchedEdge, unmatchedEdge],
      semanticEdges
    );
    const updatedEdge = result[0];

    assert.deepEqual(
      result.map(edge => edge.id),
      ['matched', 'unmatched']
    );
    assert.equal(updatedEdge.source, 'source');
    assert.equal(updatedEdge.target, 'target');
    assert.equal(updatedEdge.selected, true);
    assert.equal(updatedEdge.animated, true);
    assert.equal(updatedEdge.data, data);
    assert.deepEqual(updatedEdge.style, {
      stroke: '#aaaaaa',
      strokeWidth: 3,
      filter: 'drop-shadow(0 0 2px currentColor)',
    });
    assert.deepEqual(updatedEdge.labelStyle, {
      fill: '#bbbbbb',
      fontWeight: 600,
    });
    assert.deepEqual(updatedEdge.markerEnd, {
      type: 'arrowclosed',
      color: '#cccccc',
      width: 24,
      height: 16,
    });
    assert.equal(result[1], unmatchedEdge);
  });

  it('does not add a marker or unset colors missing from semantic edges', () => {
    const withoutMarker = {
      id: 'without-marker',
      source: 'a',
      target: 'b',
      style: { stroke: '#111111' },
    } as Edge;
    const withMarker = {
      id: 'with-marker',
      source: 'b',
      target: 'c',
      markerEnd: { type: 'arrowclosed', color: '#222222' },
    } as Edge;

    const result = mergeSemanticEdgeColors(
      [withoutMarker, withMarker],
      [
        {
          id: 'without-marker',
          source: 'a',
          target: 'b',
          markerEnd: { type: 'arrowclosed', color: '#aaaaaa' },
        },
        {
          id: 'with-marker',
          source: 'b',
          target: 'c',
          markerEnd: { type: 'arrowclosed' },
        },
      ] as Edge[]
    );

    assert.equal(result[0].markerEnd, undefined);
    assert.deepEqual(result[1].markerEnd, {
      type: 'arrowclosed',
      color: '#222222',
    });
  });
});
