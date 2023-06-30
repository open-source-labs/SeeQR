import React, { useEffect, useRef } from 'react';
import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';


const ParanoidUniverse = ({dbTables}) => {
    const maxContainerWidth = window.innerWidth * 0.9 - 275; 
    const width = Math.min(window.innerWidth, maxContainerWidth);
    const maxContainerHeight = window.innerHeight - 40;
    const height = Math.min(window.innerHeight, maxContainerHeight);

  useEffect(() => {

    console.log("--------dbTables: ", dbTables);

     ////////Destructure dbTables////////////
    const databaseCache = {};
    for(let i = 0; i < dbTables.length; i++){
        databaseCache[dbTables[i].table_name] = [];
        for(let j = 0; j < dbTables[i].columns.length; j++){
          if(dbTables[i].columns[j].foreign_column === null){
            databaseCache[dbTables[i].table_name].push(dbTables[i].columns[j].column_name);
          }
        };
    }
    //////////////////////////////////////////


    const nodes = [];
    const edges = [];
    
    // Create nodes and edges
    Object.keys(databaseCache).forEach((prop) => {
      const sourceNode = { id: prop };
      nodes.push(sourceNode);
    
      const targetIds = databaseCache[prop];
      targetIds.forEach((targetId) => {
        const targetNode = { id: targetId };
        nodes.push(targetNode);
        edges.push({ source: sourceNode, target: targetNode });
      });
    });
    
    console.log("--------nodes: ", nodes);
    data.nodes = nodes;
    console.log("---------edges: ", edges);
    data.links = edges;

      return () => {
        ///aaaa////
    };
  }, []);


 

    
      const data = {
        nodes: [
          { id: 'Node 1' },
          { id: 'Node 2' },
        ],
        links: [
          { source: 'Node 1', target: 'Node 2' },
        ],
      };


      return (
        <ForceGraph3D
          graphData={data}
          width={width}
          height={height}
          nodeAutoColorBy="id"
          linkAutoColorBy="source"
          linkWidth={2}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
        />
      );
};

export default ParanoidUniverse;
