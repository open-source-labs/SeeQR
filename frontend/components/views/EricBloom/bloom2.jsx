import React, { useEffect } from 'react';
import { ForceGraph3D } from 'react-force-graph';

const ParanoidUniverse = ({ dbTables }) => {
  console.log('----------------------------------dbTables', dbTables);

  useEffect(() => {
    const databaseCache = {};
    for (let i = 0; i < dbTables.length; i++) {
      databaseCache[dbTables[i].table_name] = [];
      for (let j = 0; j < dbTables[i].columns.length; j++) {
        if (dbTables[i].columns[j].foreign_column === null) {
          databaseCache[dbTables[i].table_name].push(dbTables[i].columns[j]);
        }
      }
    }

    console.log('------------------------databaseCache', databaseCache);
    const nodes = [];
    const edges = [];

    Object.keys(databaseCache).forEach((prop) => {
      const sourceNode = { id: prop, name: prop, size: 12, type: 'table' };
      nodes.push(sourceNode);

      const columns = databaseCache[prop];
      columns.forEach((column, index) => {
        const targetNode = {
          id: `${prop}-${column.column_name}`, // Unique identifier for the column
          name: column.column_name,
          size: 5,
          type: 'column',
        };
        nodes.push(targetNode);
        edges.push({ source: sourceNode.id, target: targetNode.id });
      });
    });
    // const databaseCache = {};
    // for (let i = 0; i < dbTables.length; i++) {
    //   databaseCache[dbTables[i].table_name] = [];
    //   for (let j = 0; j < dbTables[i].columns.length; j++) {
    //       databaseCache[dbTables[i].table_name].push(dbTables[i].columns[j]);
    //   }
    // }

    // console.log('------------------------databaseCache', databaseCache);
    // const nodes = [];
    // const edges = [];

    // Object.keys(databaseCache).forEach((prop) => {
    //   const sourceNode = { id: prop, name: prop, size: 12, type: 'table' };
    //   nodes.push(sourceNode);

    //   const columns = databaseCache[prop];
    //   columns.forEach((column, index) => {
    //     const found = nodes.find(
    //       (colEl) => colEl.id === `${prop}-${column.column_name}`
    //     );
    //     console.log('-------------------===============+++++++++++++++++++found', found);
    //     // const found2 = nodes.find(
    //     //   (colEl) => colEl.id === `${column.foreign_table}-${column.foreign_column}`
    //     // );
    //     // console.log('-------------------===============+++++++++++++++++++found2', found2);
    //     if(!found){
    //       const targetNode = {
    //         id: `${prop}-${column.column_name}`, // Unique identifier for the column
    //         name: column.column_name,
    //         size: 5,
    //         type: 'column',
    //       };
    //       nodes.push(targetNode);
    //       edges.push({ source: sourceNode.id, target: targetNode.id });
    //     }
        
    //   });
    // });


    console.log('--------nodesBeforeForeign: ', nodes);
    console.log('---------edgesBeforeForeign: ', edges);


    // Update the graphData object with the updated nodes and edges
    setData({ nodes, links: edges });
  }, []);

  const maxContainerWidth = window.innerWidth * 0.9 - 275;
  const width = Math.min(window.innerWidth, maxContainerWidth);
  const maxContainerHeight = window.innerHeight - 40;
  const height = Math.min(window.innerHeight, maxContainerHeight);

  const [data, setData] = React.useState({ nodes: [], links: [] });

  return (
    <ForceGraph3D
      graphData={data}
      width={width}
      height={height}
      nodeAutoColorBy="type" // Color nodes based on their 'type' property
      linkAutoColorBy="source"
      linkWidth={2}
      linkDirectionalArrowLength={0}
      linkDirectionalArrowRelPos={1}
      nodeThreeObject={(node) => {
        const nodeSize = node.size || 1; // Default size if not specified
        let color = 'blue'; // Default color
        if (node.type === 'table') {
          color = 'green'; // Table name color
        } else if (node.type === 'column') {
          color = 'orange'; // Column name color
        }
        const geometry = new THREE.SphereGeometry(nodeSize, 64, 64);
        const material = new THREE.MeshBasicMaterial({ color });
        return new THREE.Mesh(geometry, material);
      }}
      nodeLabel={(node) => node.name} // Show the node id as the label
      nodeLabelColor="white" // Set the label color to white
    />
  );
};

export default ParanoidUniverse;
