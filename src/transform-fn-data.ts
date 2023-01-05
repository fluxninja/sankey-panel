// NOTE: implementation of toDataFrame: https://github.com/grafana/grafana/blob/main/packages/grafana-data/src/dataframe/processDataFrame.ts
import { toDataFrame, FieldType, ArrayVector, Field } from '@grafana/data';
import { logger } from 'fn-logger';

import { SankeyOptionsFn } from 'types-fn';

export function transformFnData(): Required<SankeyOptionsFn>['transformFn'] {
  return ({ series, ...other }) => {
    const transformedSeries = series.map((data) => {
      return toDataFrame({ ...data, fields: data.fields.map(mapField()) });
    });

    return {
      series: transformedSeries,
      ...other,
    };
  };
}

const SANKEY_FIELD_NAMES = ['source', 'target', 'value'];

// @ts-ignore
function mapField<P>() {
  return (field: Field<P>, _: number, __: Array<Field<P>>) => {
    const isSankeyField = SANKEY_FIELD_NAMES.includes(field.name);

    const isArrayVector = field.values instanceof ArrayVector || typeof field.values?.toArray === 'function';
    const isArray = Array.isArray(field.values);

    if (!isSankeyField || !field.values || (!isArray && !isArrayVector)) {
      return field;
    }

    const values = isArrayVector ? field.values.toArray() : isArray ? field.values : null;

    if (values === null) {
      logger.warn('[FN] Failed to transform sankey data.', 'Values are not an array.');

      return {
        ...field,
        values: new ArrayVector([]),
      };
    }

    const parsedValues = isSankeyField ? ((values as P[]).map(splitValue())[0] as unknown[]).map(mapToNumber()) : null;

    try {
      return {
        ...field,
        type: parsedValues?.every(isNumber()) ? FieldType.number : field.type,
        values: parsedValues ? new ArrayVector(JSON.parse(JSON.stringify(parsedValues))) : values,
      };
    } catch (err) {
      logger.warn('[FN] Failed to transform sankey data.', err instanceof Error ? err.message : String(err));

      return {
        ...field,
        type: field.type,
        values: new ArrayVector([]),
      };
    }
  };
}

// @ts-ignore
function mapToNumber<V = any>() {
  return (value: V, _: number, __: V[]) => (Number.isNaN(Number(value)) ? value : Number(value));
}

// @ts-ignore
function splitValue<V = any>() {
  return (value: V) => (typeof value === 'string' ? value.split('|') : value);
}

// @ts-ignore
function isNumber<V = any>() {
  return (value: V) => typeof value === 'number';
}
