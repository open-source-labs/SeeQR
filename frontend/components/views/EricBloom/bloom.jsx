import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({ dbTables }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    drawGraph(dbTables);
  }, [dbTables]);

  const drawGraph = (dbTables) => {
    const svg = d3.select(svgRef.current);
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const graph = {
      nodes: [
        { name: "Alice" },
        { name: "Bob" },
        { name: "Chen" },
        { name: "Dawg" },
        { name: "Ethan" },
        { name: "George" },
        { name: "Frank" },
        { name: "Hanes" }
      ],
      links: [
        { source: "Alice", target: "Bob", color: "red" },
        { source: "Chen", target: "Bob", color: "blue" },
        // { source: "Dawg", target: "Chen" },
        // { source: "Hanes", target: "Frank" },
        // { source: "Hanes", target: "George" },
        // { source: "Dawg", target: "Ethan" }
      ]
    };
    // console.log("This is dbTables passed in from very front End: ", dbTables);
    // const graph = {};
    // const columnNames = Array.from(
    //   new Set(dbTables.flatMap((table) => table.columns))
    // );
    // console.log("This is columnNames: ", columnNames);
    // graph.nodes = columnNames.map((columnName, index) => ({
    //   id: columnName,
    //   index,
    // }));
    // console.log("This is nodes: ", graph.nodes);
    // graph.links = [];
    // dbTables.forEach((table, tableIndex) => {
    //   table.columns.forEach((column) => {
    //     const sourceIndex = columnNames.indexOf(column);
    //     table.columns.forEach((otherColumn) => {
    //       const targetIndex = columnNames.indexOf(otherColumn);
    //       if (targetIndex !== sourceIndex) {
    //         graph.links.push({
    //           source: sourceIndex,
    //           target: targetIndex,
    //           tableIndex,
    //         });
    //       }
    //     });
    //   });
    // });
    // console.log("This is links: ", graph.links);


    const simulation = d3
      .forceSimulation(graph.nodes)
      // .force('link', d3.forceLink(graph.links).id((d) => d.id.column_name))
      .force('link', d3.forceLink(graph.links).distance(10).strength(0.15).id((d) => d.name))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("x", d3.forceX().strength(0.05))
      .force("y", d3.forceY().strength(0.05))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', (d) => d.color);

    // const node = svg
    //   .append('g')
    //   .attr('class', 'nodes')
    //   .selectAll('circle')
    //   .data(graph.nodes)
    //   .enter()
    //   .append('circle')
    //   .attr('r', 10)
    //   .attr('fill', 'steelblue')
    //   .call(drag(simulation));

    // node.append('text').text((d) => d.name);
    const node = svg
    .append('g')
    .selectAll('g')
    .data(graph.nodes)
    .enter()
    .append('g')
    .call(drag(simulation));
  
    const circle = node
      .append('circle')
      .attr('r', 15)
      .attr('fill', 'steelblue');
    
    const text = node
      .append('text')
      .text((d) => d.name);
    
    node.append('title').text((d) => d.name);
  


   

    simulation.nodes(graph.nodes).on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    
      circle
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    
      text
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    });
  };

  const drag = (simulation) => {
    const dragstarted = (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };
  
    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };
  
    const dragended = (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };
  
    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };
  
  return (
    <>
      <svg ref={svgRef} width={800} height={600}>
        <g className="links" />
        <g className="nodes" />
      </svg>
      <h4>EricBloomTest import successfully</h4>
    </>
  );
};

export default ForceDirectedGraph;

