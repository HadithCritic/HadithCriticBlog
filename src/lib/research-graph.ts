import raw from '../data/research-graph.json';
import { indexGraph, authorLine as authorLineFor, layoutTimeline as layoutTimelineFor, type GraphData, type GraphIndex, type Work } from './research-graph-core';

export * from './research-graph-core';

/** The committed graph, validated once when the module loads. */
export const graph: GraphIndex = indexGraph(raw as unknown as GraphData);

export const authorLine = (work: Work, index: GraphIndex = graph) => authorLineFor(work, index);
export const layoutTimeline = (index: GraphIndex = graph) => layoutTimelineFor(index);
