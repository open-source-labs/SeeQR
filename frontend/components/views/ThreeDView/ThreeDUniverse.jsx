import React, { useEffect, useState, useRef } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { ipcRenderer } from 'electron';
import * as d3 from 'd3';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import ClickedNodeDetail from './detailOfClickedNode';

function ThreeDUniverse({ selectedDb, dbTables, dbType }) {
  // Define the width and height of the universe container
  const maxContainerWidth = window.innerWidth * 0.9 - 350;
  const width = Math.min(window.innerWidth, maxContainerWidth);
  const maxContainerHeight = window.innerHeight - 60;
  const height = Math.min(window.innerHeight, maxContainerHeight);

  // React hook for the nodes
  const [data, setData] = useState({ nodes: [], links: [] });
  // React hook for user's camera
  const [camera, setCamera] = useState(null);
  // React hook for showing/hiding the stars' theme background
  const [showStars, setShowStars] = useState(true);
  // React hook for showing/hiding the labeling of each star
  const [showSprites, setShowSprites] = useState(true);
  // For passing down to the ClickedNodeDetail table chart
  const [cachedReturnedRows, setCachedReturnedRows] = useState([]);
  // State variable to track the clicked node
  const [clickedNode, setClickedNode] = useState(null);
  // State variable to track which node has been selected
  const [selectedNode, setSelectedNode] = useState('');

  const divStyle = {
    position: 'absolute',
    top: '50px',
    left: '475px',
    'z-index': '9999',
    display: 'flex',
    gap: '1rem',
  };

  useEffect(() => {
    const nodes = [];
    const edges = [];

    // ///// ***** Distinguish between MySQL & PG DBs, due to differences in object structure (when obj is sent from backend to frontend) ***** ///// //
    // Handle the case when database is MySQL database
    if (dbType === 'mysql') {
      // First one collect the real column and table only, with considering the connection/ relationship between columns
      const databaseCache = {};
      for (let i = 0; i < dbTables.length; i++) {
        databaseCache[dbTables[i].table_name] = [];
        for (let j = 0; j < dbTables[i].columns.length; j++) {
          if (dbTables[i].columns[j].foreign_column === null) {
            databaseCache[dbTables[i].table_name].push(dbTables[i].columns[j]);
          }
        }
      }

      Object.keys(databaseCache).forEach((prop) => {
        const sourceNode = {
          id: `table:${prop}`,
          name: `table:${prop}`,
          size: 12,
          type: 'table',
          group: `${prop}`,
        };
        // Add the table to the nodes array in order to 3D visualize the table
        nodes.push(sourceNode);

        const columns = databaseCache[prop];
        columns.forEach((column) => {
          const targetNode = {
            id: `table:${prop}-column:${column.column_name}`,
            name: `table:${prop}-column:${column.column_name}`,
            size: 5,
            type: 'column',
            group: `${prop}`,
            columnName: `${column.column_name}`,
          };
          // Pushing each node to the nodes array
          nodes.push(targetNode);
          // Build the connection between the table and corresponding columns
          edges.push({ source: sourceNode.id, target: targetNode.id });
        });
      });
      // Second one: start to consider the connection/ relationship between columns
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
          // Verify if the current column already is in the nodes array; if not, current column may be system config/permission/built-in columns
          const foundCurrColumn = nodes.find(
            (colEl) =>
              colEl.id === `table:${prop}-column:${column.column_name}`,
          );
          // Check if the current column's foreign is in the nodes array when the current column's foreign_table and foreign_column is not null
          const foundForeignColumn = nodes.find(
            (colEl) =>
              colEl.id ===
              `table:${column.foreign_table}-column:${column.foreign_column}`,
          );
          // If current column and foreign column and foreign table all in the nodes array, than we can build the connection between the current column and foreign column
          if (foundCurrColumn && foundForeignColumn) {
            edges.push({
              source: foundForeignColumn.id,
              target: foundCurrColumn.id,
            });
          }
        });
      });
    }
    // Handle the case when database is other database, current verified databases is: PostgreSQL
    else {
      const databaseCache = {};
      for (let i = 0; i < dbTables.length; i++) {
        databaseCache[dbTables[i].table_name] = [];
        for (let j = 0; j < dbTables[i].columns.length; j++) {
          databaseCache[dbTables[i].table_name].push(dbTables[i].columns[j]);
        }
      }

      Object.keys(databaseCache).forEach((prop) => {
        const sourceNode = {
          id: `table:${prop}`,
          name: `table:${prop}`,
          size: 12,
          type: 'table',
          group: `${prop}`,
        };
        // add the table to the nodes array in order to 3D visualize the table
        nodes.push(sourceNode);

        const columns = databaseCache[prop];
        columns.forEach((column) => {
          const foundCurrColumn = nodes.find(
            (colEl) =>
              colEl.id === `table:${prop}-column:${column.column_name}`,
          );
          // Verify if the current column already is in the nodes array;
          if (!foundCurrColumn) {
            const targetNode = {
              id: `table:${prop}-column:${column.column_name}`,
              name: `table:${prop}-column:${column.column_name}`,
              size: 5,
              type: 'column',
              group: `${prop}`,
              columnName: `${column.column_name}`,
            };
            // If the current column is not in the nodes array, then we add the current column in to nodes array;
            nodes.push(targetNode);
            // Connect the current table and corresponding column
            edges.push({ source: sourceNode.id, target: targetNode.id });
          }
          // If the column has foreign, we build the connection directly
          if (column.foreign_table && column.foreign_column) {
            edges.push({
              source: `table:${column.foreign_table}-column:${column.foreign_column}`,
              target: `table:${prop}-column:${column.column_name}`,
            });
          }
        });
      });
    }

    setData({ nodes, links: edges });
  }, []);

  // Shout out to Gundam Seed Stargazer
  // ThreeDUniverse Background Setting Up
  // ThreeDUniverse Container
  const toggleStars = () => {
    setShowStars((prevState) => !prevState);
  };
  const graphRef = useRef();
  useEffect(() => {
    const positions = [];
    const colors = [];

    // Get the random coordinate at distance is radius
    function getRandomInSphere(radius) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      return [x, y, z];
    }

    const starsGeometry = new THREE.BufferGeometry();
    // Generate 7777 stars on at the distance of 3351
    d3.range(7777).map((d, i) => {
      // Generate random coordinate for each star
      const arr = getRandomInSphere(3351);
      const x = arr[0];
      const y = arr[1];
      const z = arr[2];
      // stars' coordinate
      positions.push(x, y, z);
      // stars' color
      colors.push(1, 1, 1);
    });

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    starsGeometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3),
    );

    const starsMaterial = new THREE.PointsMaterial({ vertexColors: true });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    // Condition to show stars or not show the stars
    starField.visible = showStars;
    const graph = graphRef.current;
    if (graph) {
      setCamera(graph.camera());
      // Saving the stars in to closure backpack of the graph.scene function
      graph.scene().add(starField);
    }

    return () => {
      if (graph) {
        graph.scene().remove(starField);
      }
    };
  }, [showStars]);

  // Variable to store the current table
  let table = null;

  function runQueryBloom(node) {
    table = new THREE.Object3D();

    if (node.type === 'table') {
      ipcRenderer
        .invoke(
          'run-query',
          {
            targetDb: selectedDb,
            // Run a single query to databases whenever user click the node
            sqlString: `select * from ${node.group}`,
            selectedDb,
            runQueryNumber: 1,
          },
          dbType,
        )
        .then(({ db, returnedRows }) => {
          // 3D preview greenboard design
          let strrr = '';
          let ct = 0;
          strrr += `columns: ` + '\n';
          strrr += `------------------------------------------------------------------------------\n`;
          if (returnedRows) {
            if (returnedRows.length === 0) {
              setClickedNode(null);
              strrr += 'This column is currently empty...';
            } else {
              setCachedReturnedRows(returnedRows);
              setClickedNode(true);
              setSelectedNode(node.group);
              // Only display the table's columns' name only
              for (const property in returnedRows[0]) {
                strrr += `${property}` + '\n';
                ct += 1;
              }
            }
          }

          // Define properties of the table cells
          const cellWidth = 170;
          const cellHeight = 45 + 6 * ct;
          // Create the table structure
          const cellGeometry = new THREE.BoxGeometry(cellWidth, cellHeight, 10);
          // Define the preview green board's color and transparency
          const cellMaterial = new THREE.MeshBasicMaterial({
            color: 'rgb(50, 200, 150)',
            opacity: 0.3,
            transparent: true,
          });
          const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
          // Calculate the position of each cell
          cellMesh.position.set(node.x, node.y + cellHeight / 2, node.z);

          // Add the cell to the table object
          table.add(cellMesh);

          const fontLoader = new FontLoader();
          fontLoader.load(
            'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
              // Create a text mesh for the cell
              const textGeometry = new TextGeometry(strrr, {
                font,
                size: 4,
                height: 2,
              });
              // Declaring a new text 3D object with Three.MeshBasicMaterial method
              const textMaterial = new THREE.MeshBasicMaterial({
                color: 'rgb(225, 255, 255)',
              });
              const textMesh = new THREE.Mesh(textGeometry, textMaterial);
              // Position the text on the cell
              const textOffsetX = -cellWidth / 2 + 10; // Adjust the offset as needed
              const textOffsetY = cellHeight / 2 - 12; // Adjust the offset as needed
              textMesh.position.set(
                node.x + textOffsetX,
                node.y + cellHeight / 2 + textOffsetY,
                node.z + 5,
              ); // Set the z-position to ensure the text is visible
              // Add the text mesh to the table object
              table.add(textMesh);
              // Calculate the preview table's position relative to the camera
              const cameraPosition = camera.getWorldPosition(
                new THREE.Vector3(),
              );
              // Set the table's rotation to face the user/camera
              table.lookAt(cameraPosition);
              // Adding/attaching the object to the clicked node's 3D object
              node.__threeObj.add(table);
            },
          );
        })
        .catch((err) => console.log(err));
    }

    if (node.type === 'column') {
      ipcRenderer
        .invoke(
          'run-query',
          {
            targetDb: selectedDb,
            // Run a single query to databases whenever user click the node
            sqlString: `select * from ${node.group}`,
            selectedDb,
            runQueryNumber: 1,
          },
          dbType,
        )
        .then(({ db, returnedRows }) => {
          // 3D preview greenboard design
          let strrr = '';
          let newlineCount = 0;
          strrr += `${node.columnName}: ` + '\n';
          strrr += `------------------------------------------------------------------------------\n`;
          if (returnedRows) {
            if (returnedRows.length === 0) {
              setClickedNode(null);
              strrr += 'This column is currently empty...';
            } else {
              setCachedReturnedRows(returnedRows);
              setClickedNode(true);
              setSelectedNode(node.columnName);
              // Only display the correspond column's contnet only
              for (let i = 0; i < returnedRows.length; i++) {
                strrr += `${returnedRows[i][node.columnName]}` + '\n';
                newlineCount += 1;
                // This is a restriction to preventing generate too many contents due to each character will be an individual object
                // And each object has multiple vertex that users' computer might be too laggy to perform camera control
                if (strrr.length > 250 || newlineCount > 25) {
                  // '...' represent a hint to tell user that current preview not able to load all the content of the column
                  strrr += '   .\n   .\n   .\n';
                  newlineCount += 3;
                  break;
                }
              }
            }
          }

          // Define properties of the table cells
          const cellWidth = 200;
          const cellHeight = 45 + 6 * newlineCount;
          // Create the table structure
          const cellGeometry = new THREE.BoxGeometry(cellWidth, cellHeight, 10);
          // Define the preview green board's color and transparency
          const cellMaterial = new THREE.MeshBasicMaterial({
            color: 'rgb(50, 200, 150)',
            opacity: 0.3,
            transparent: true,
          });
          const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
          // Calculate the position of each cell
          cellMesh.position.set(node.x, node.y + cellHeight / 2, node.z);

          // Add the cell to the table object
          table.add(cellMesh);

          const fontLoader = new FontLoader();
          fontLoader.load(
            'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
              // Create a text mesh for the cell
              const textGeometry = new TextGeometry(strrr, {
                font,
                size: 4,
                height: 2,
              });
              // Declairing a new text 3D object with Three.MeshBasicMaterial method
              const textMaterial = new THREE.MeshBasicMaterial({
                color: 'rgb(225, 255, 255)',
              });
              const textMesh = new THREE.Mesh(textGeometry, textMaterial);
              // Position the text on the cell
              const textOffsetX = -cellWidth / 2 + 5; // Adjust the offset as needed
              const textOffsetY = cellHeight / 2 - 5; // Adjust the offset as needed
              textMesh.position.set(
                node.x + textOffsetX,
                node.y + cellHeight / 2 + textOffsetY,
                node.z + 5,
              ); // Set the z-position to ensure the text is visible
              // Add the text mesh to the table object
              table.add(textMesh);
              // Calculate the preview table's position relative to the camera
              const cameraPosition = camera.getWorldPosition(
                new THREE.Vector3(),
              );
              // Set the table's rotation to face the user/camera
              table.lookAt(cameraPosition);
              // Adding/attaching the object to the clicked node's 3D object
              node.__threeObj.add(table);
            },
          );
        })
        .catch((err) => console.log(err));
    }
  }

  return (
    <>
      {/* A button to turn off/on functionality of nodes' labeling */}
      <div style={divStyle}>
        <button
          className="hide-3d-btn"
          onClick={() => setShowSprites(!showSprites)}
        >
          {showSprites ? 'Hide Node Labels' : 'Show Node Labels'}
        </button>
        {/* A button to turn off/on functionality of star's theme background; also clean the green board preview together */}
        <button className="hide-3d-btn" onClick={toggleStars}>
          {showStars ? 'Hide Stars' : 'Show Stars'}
        </button>
      </div>
      <ForceGraph3D
        ref={graphRef}
        graphData={data}
        width={width}
        height={height}
        nodeAutoColorBy="group"
        linkAutoColorBy="source"
        linkWidth={2}
        linkDirectionalArrowLength={0}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.005}
        nodeThreeObject={(node) => {
          const nodeSize = node.size || 1; // Default node size is each Node/ball's property node.size's correspoinding value
          const color = node.color || 'orange'; // Default node size is each Node/ball's property node.color's correspoinding value
          const geometry = new THREE.SphereGeometry(nodeSize, 32, 32); // The 2nd and 3rd parameters representing the number of horizontal and vertical resolution of each node/ball
          const material = new THREE.MeshPhongMaterial({ color }); // Color of each node/ball
          const nodeMesh = new THREE.Mesh(geometry, material);

          const sprite = new SpriteText(node.name);
          sprite.color = node.color; // labeling's font color
          sprite.textHeight = 2; // labeling's font size
          sprite.position.y = -nodeSize - 3; // The relative position of each labeling to each node
          sprite.visible = showSprites; // Set the visibility of the labeling based on showSprites state
          nodeMesh.add(sprite); // Adding/attaching the labeling to each node's object

          return nodeMesh;
        }}
        nodeLabel={(node) => node.name} // Labeling display each Node/ball's property node.name's correspoinding value
        nodeLabelColor="white" // Default labeling color is white
        onNodeClick={(node) => runQueryBloom(node)} // Click the node in order to display green board content preview
      >
        {/* The light and shadow to make the nodes/balls look 3D */}
        <ambientLight color="#ffffff" intensity={1} />
        <directionalLight
          color="#ffffff"
          intensity={0.6}
          position={[-1, 1, 4]}
        />
      </ForceGraph3D>
      {clickedNode && (
        <ClickedNodeDetail
          returnedRows={cachedReturnedRows}
          selectedNode={selectedNode}
        />
      )}
    </>
  );
}

export default ThreeDUniverse;
