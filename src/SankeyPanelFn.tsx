import React, { useMemo, FC } from 'react';
import { PanelProps } from '@grafana/data';
import { SankeyPanel } from 'SankeyPanel';
import { SankeyOptionsFn } from 'types-fn';
import { transformFnData } from 'transform-fn-data';

export interface SankeyPanelFnProps extends PanelProps<SankeyOptionsFn> {}

export const SankeyPanelFn: FC<SankeyPanelFnProps> = ({ data, ...props }) => {
  const transformFn = useMemo(transformFnData, []);

  const transformedData = useMemo(() => transformFn(data), [transformFn, data]);

  return <SankeyPanel {...{ ...props, data: transformedData }} />;
};
