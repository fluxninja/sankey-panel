import { DataFrame, LoadingState, PanelData, TimeRange } from '@grafana/data';
import { SankeyOptions } from './types';

export type SankeyData = {
  series: DataFrame[];
  state: LoadingState;
  timeRange: TimeRange;
};

export interface SankeyOptionsFn extends SankeyOptions {
  transformFn?: (data: PanelData) => SankeyData;
}

export type FnData = DataFrame;
