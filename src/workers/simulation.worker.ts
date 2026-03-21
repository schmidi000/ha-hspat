import { monteCarloHeatmap, multiFloorMonteCarloHeatmap } from '../modules/dijkstra.js';
import type {
  WorkerRequest, WorkerResponse,
  MultiFloorWorkerRequest, MultiFloorWorkerResponse,
} from '../types.js';

type AnyRequest = WorkerRequest | MultiFloorWorkerRequest;

self.onmessage = (e: MessageEvent<AnyRequest>) => {
  if ('type' in e.data && e.data.type === 'multi_floor') {
    const req = e.data as MultiFloorWorkerRequest;
    const heatmap = multiFloorMonteCarloHeatmap(
      req.floors,
      req.stair_connections,
      req.perimeter,
      req.valuables,
      req.iterations,
    );
    const response: MultiFloorWorkerResponse = { heatmap: Object.fromEntries(heatmap) };
    (self as unknown as Worker).postMessage(response);
  } else {
    const req = e.data as WorkerRequest;
    const heatmap = monteCarloHeatmap(req.cost_matrix, req.perimeter, req.valuables, req.iterations);
    const response: WorkerResponse = { heatmap: Object.fromEntries(heatmap) };
    (self as unknown as Worker).postMessage(response);
  }
};
