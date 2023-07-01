import React, { useEffect, useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

const ParanoidUniverse = ({ dbTables }) => {
  const [showSprites, setShowSprites] = useState(true);

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

    const nodes = [];
    const edges = [];

    Object.keys(databaseCache).forEach((prop) => {
      const sourceNode = { id: `table:${prop}`, name: `table:${prop}`, size: 12, type: 'table' };
      nodes.push(sourceNode);

      const columns = databaseCache[prop];
      columns.forEach((column) => {
        const targetNode = {
          id: `table:${prop}-column:${column.column_name}`,
          name: `table:${prop}-column:${column.column_name}`,
          size: 5,
          type: 'column',
          group: `table:${prop}`,
        };
        nodes.push(targetNode);
        edges.push({ source: sourceNode.id, target: targetNode.id });
      });
    });

    const databaseCacheAll = {};
    for (let i = 0; i < dbTables.length; i++) {
      databaseCacheAll[dbTables[i].table_name] = [];
      for (let j = 0; j < dbTables[i].columns.length; j++) {
        databaseCacheAll[dbTables[i].table_name].push(dbTables[i].columns[j]);
      }
    }

    Object.keys(databaseCacheAll).forEach((prop) => {
      const columns = databaseCacheAll[prop];
      columns.forEach((column) => {
        const foundCurrColumn = nodes.find(
          (colEl) => colEl.id === `table:${prop}-column:${column.column_name}`
        );
        const foundForeignColumn = nodes.find(
          (colEl) => colEl.id === `table:${column.foreign_table}-column:${column.foreign_column}`
        );
        if (foundCurrColumn && foundForeignColumn) {
          edges.push({ source: foundForeignColumn.id, target: foundCurrColumn.id });
        }
      });
    });

    setData({ nodes, links: edges });
  }, []);

  const maxContainerWidth = window.innerWidth * 0.9 - 275;
  const width = Math.min(window.innerWidth, maxContainerWidth);
  const maxContainerHeight = window.innerHeight - 40;
  const height = Math.min(window.innerHeight, maxContainerHeight);

  const [data, setData] = useState({ nodes: [], links: [] });

  return (
    <div>
      <button onClick={() => setShowSprites(!showSprites)}>
        {showSprites ? 'Hide Sprites' : 'Show Sprites'}
      </button>
      <ForceGraph3D
        graphData={data}
        width={width}
        height={height}
        nodeAutoColorBy="group"
        linkAutoColorBy="source"
        linkWidth={2}
        linkDirectionalArrowLength={0}
        linkDirectionalArrowRelPos={1}
        nodeThreeObject={(node) => {
          const nodeSize = node.size || 1;
          const color = node.color || 'blue';
          const geometry = new THREE.SphereGeometry(nodeSize, 32, 32);
          const material = new THREE.MeshPhongMaterial({ color });
          const nodeMesh = new THREE.Mesh(geometry, material);

          const sprite = new SpriteText(node.name);
          sprite.color = node.color;
          sprite.textHeight = 2;
          sprite.position.y = -nodeSize - 3;
          sprite.visible = showSprites; // Set the visibility of the sprite based on showSprites state
          nodeMesh.add(sprite);

          return nodeMesh;
        }}
        nodeLabel={(node) => node.name}
        nodeLabelColor="white"
        onNodeClick={(node) => console.log(node)}
      >
        <ambientLight color="#ffffff" intensity={1} />
        <directionalLight color="#ffffff" intensity={0.6} position={[-1, 1, 4]} />
      </ForceGraph3D>
    </div>
  );
};

export default ParanoidUniverse;
