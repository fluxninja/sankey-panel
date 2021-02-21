// @ts-nocheck
import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { PanelProps } from '@grafana/data';
import { SankeyOptions } from 'types';
import { Sankey } from 'Sankey'
import { packSiblings, svg } from 'd3';

interface Props extends PanelProps<SankeyOptions> {}

export const SankeyPanel: React.FC<Props> = ({ options, data, width, height }) => {
  // ------------------------    CHART CONSTANTS    -----------------------
  const CHART_REQUIRED_FIELDS = { source: 'source', target: 'target', value: 'value' };

  // ------------------------    ERROR MESSAGES    ------------------------
  const requiredFieldsMsg = `Required fields not present: ${Object.keys(CHART_REQUIRED_FIELDS).join(', ')}`;

  // -------------------------    REACT HOOKS    --------------------------
  const [ error, setError ] = useState({ isError: false, message: '', type: '' })
  const [ graph, setGraph ] = useState({ nodes: [], links: [] })

  useEffect(() => {
    console.log('data changed')
    setGraph(buildGraph())
  }, [data])

  // -------------------------  DATA ACQUISITION  -------------------------
  const buildGraph = () => {
    const frame = data.series[0];

    const sourceAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.source);
    const targetAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.target);
    const valueAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.value);

    // -----------------------      VALIDATIONS     -----------------------
    if (!(sourceAccesor && targetAccesor && valueAccesor)) {
      setError({ isError: true, message: requiredFieldsMsg, type: '' })
      return { nodes: [], links: []};
    }
    setError({})

    const sources = sourceAccesor.values.toArray();
    const targets = targetAccesor.values.toArray();
    const values = valueAccesor.values.toArray();
  
    const zip = d3.zip(sources, targets, values);
  
    const nodes = Array.from(new Set(sources.concat(targets))).map(node => ({ name: node }));
    const links = zip.map(d => ({ source: d[0], target: d[1], value: +d[2].toFixed(2) }));
    const graph = { nodes, links };

    return graph
  }

  // ------------------------------- CHART  ------------------------------
  const chart = svg => {
    console.log('enterchart')
    const sankey = new Sankey(svg)
      .width(width)
      .height(height)
      .align(options.align)
      .edgeColor(options.edgeColor)
      .colorScheme(options.colorScheme)
      .displayValues(options.displayValues)
      .highlightOnHover(options.highlightOnHover)
      .data(graph)

    sankey.render()
  };

  return (error.isError ?
    <p>
      {error.message}
    </p>
    :
    <svg
      viewBox={`0 0 ${width} ${height}`}
      ref={node => {
        d3.select(node)
          .selectAll('*')
          .remove();
        d3.select(node).call(chart);
      }}
    />
  );
};
