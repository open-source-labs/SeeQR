import React, { useEffect, useState, useRef } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { IpcRendererEvent, ipcRenderer } from 'electron';
import * as d3 from 'd3';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

const ParanoidUniverse = ({ selectedDb, dbTables, dbType }) => {

 

  // Define the width and height of the universe container
  const maxContainerWidth = window.innerWidth * 0.9 - 275;
  const width = Math.min(window.innerWidth, maxContainerWidth);
  const maxContainerHeight = window.innerHeight - 60;
  const height = Math.min(window.innerHeight, maxContainerHeight);


  const [data, setData] = useState({ nodes: [], links: [] });
  const [camera, setCamera] = useState(null);

 




  const [showSprites, setShowSprites] = useState(true);
  console.log('Databases Type: ', dbType);
  console.log('-------------------------------------------------dbTables', dbTables);


  useEffect(() => {
    const nodes = [];
    const edges = [];




    if(dbType === 'mysql'){

      const databaseCache = {};
      for (let i = 0; i < dbTables.length; i++) {
        databaseCache[dbTables[i].table_name] = [];
        for (let j = 0; j < dbTables[i].columns.length; j++) {
          if (dbTables[i].columns[j].foreign_column === null) {
            databaseCache[dbTables[i].table_name].push(dbTables[i].columns[j]);
          }
       }
      }

      console.log('-------------------------------------------------databaseCache', databaseCache);

      Object.keys(databaseCache).forEach((prop) => {
        const sourceNode = { id: `table:${prop}`, name: `table:${prop}`, size: 12, type: 'table', group: `${prop}` };
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

      console.log('-------------------------------------------------databaseCacheAll', databaseCacheAll);

      Object.keys(databaseCacheAll).forEach((prop) => {
        const columns = databaseCacheAll[prop];
        console.log('-------------------------------------------------databaseCacheAll-Each-cloumns', columns);
        columns.forEach((column) => {
          console.log("+++++++++++++++table:${prop}-column:${column.column_name}", `table:${prop}-column:${column.column_name}`);
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

      console.log('-------------------------------------------------nodes', nodes);
      console.log('-------------------------------------------------edges', edges);
    }
    //If type of databases is PostgreSQL:
    else if(dbType === 'pg'){
      const databaseCache = {};
      for (let i = 0; i < dbTables.length; i++) {
        databaseCache[dbTables[i].table_name] = [];
        for (let j = 0; j < dbTables[i].columns.length; j++) {
          databaseCache[dbTables[i].table_name].push(dbTables[i].columns[j]);
       }
      }

      Object.keys(databaseCache).forEach((prop) => {
        const sourceNode = { id: `table:${prop}`, name: `table:${prop}`, size: 12, type: 'table', group: `${prop}` };
        nodes.push(sourceNode);

        const columns = databaseCache[prop];
        columns.forEach((column) => {

          const foundCurrColumn = nodes.find(
            (colEl) => colEl.id === `table:${prop}-column:${column.column_name}`
          );

          if(!foundCurrColumn){
            const targetNode = {
              id: `table:${prop}-column:${column.column_name}`,
              name: `table:${prop}-column:${column.column_name}`,
              size: 5,
              type: 'column',
              group: `${prop}`,
              columnName: `${column.column_name}`,
            };
            nodes.push(targetNode);
            edges.push({ source: sourceNode.id, target: targetNode.id });
          }
          if (column.foreign_table && column.foreign_column) {
            edges.push({ source: `table:${column.foreign_table}-column:${column.foreign_column}`, target: `table:${prop}-column:${column.column_name}` });
          }
        });
      });

    }
    


    setData({ nodes, links: edges });
  }, []);

  // ////////////////////////////////////////////////////////////////////////////////////////////////// //
  // Shout out to Gundam Seed Stargazer 
  // ParanoidUniverse Background Setting Up
  // ParanoidUniverse Container
  const graphRef = useRef();
  useEffect(() => {
    var positions = [];
    var colors = [];

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

    const arr = getRandomInSphere(3351);
    var x = arr[0];
    var y = arr[1];
    var z = arr[2];

    positions.push(x, y, z);
    colors.push(1, 1, 1);
    });

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));


    const starsMaterial = new THREE.PointsMaterial({ vertexColors: true });
    const starField = new THREE.Points(starsGeometry, starsMaterial);

    // //////////

    const graph = graphRef.current;
    if (graph) {
      setCamera(graph.camera());
      graph.scene().add(starField);
    }

    return () => {
      if (graph) {
        graph.scene().remove(starField);
      }
    };
  }, []);

  // ////////////////////////////////////////////////////////////////////////////////////////////////// //


  // const graph2 = graphRef.current;
  let table = null; // Variable to store the current table

  function runQueryBloom (node){ 
    // console.log('graphRef.currentgraphRef.currentgraphRef.currentgraphRef.currentgraphRef.current',graphRef);
    // graph2.scene().removeFromParent(); // Remove the table from the scene
    // table = null; // Reset the table variable
    table = new THREE.Object3D();
       

    if(node.type === 'table'){
      ipcRenderer
        .invoke(
          'run-query',
          {
            targetDb: selectedDb,
            sqlString: `select * from ${node.group}`,
            selectedDb: selectedDb,
            runQueryNumber: 1,
          },
          dbType
        )
        .then(({ db, sqlString, returnedRows, explainResults, error, 
          numberOfSample,
          totalSampleTime,
          minmumSampleTime,
          maximumSampleTime,
          averageSampleTime, }) => {
          if (error) {
            throw error;
          }

          let strrr = '';
          const maxLength = 200;

          returnedRows.forEach(obj => {
            const objectString = JSON.stringify(obj) + "\n";
            if (strrr.length + objectString.length > maxLength) {
              return; // Break out of the loop if the length exceeds the maximum
            }
            strrr += objectString;
          });

                   

          // Define properties of the table cells
          const cellWidth = 400;
          const cellHeight = 200;
      
          // Create the table structure
          const cellGeometry = new THREE.BoxGeometry(cellWidth, cellHeight, 10);
          const cellMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(50, 200, 123)', opacity: 0.3, transparent: true });
          const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
          // Calculate the position of each cell
          cellMesh.position.set(node.x, node.y + cellHeight/2, node.z);
      
          // Add the cell to the table object
          table.add(cellMesh);
      
          const fontLoader = new FontLoader();
          fontLoader.load(
            'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
              // Create a text mesh for the cell
              const textGeometry = new TextGeometry(strrr, {
                font: font,
                size: 4,
                height: 2,
              });
              const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
              const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      
              // Position the text on the cell
              const textOffsetX = -cellWidth / 2 + 10; // Adjust the offset as needed
              const textOffsetY = cellHeight / 2 - 12; // Adjust the offset as needed
              textMesh.position.set(node.x + textOffsetX, node.y + (cellHeight/2) + textOffsetY, node.z+5); // Set the z-position to ensure the text is visible
      
              // Add the text mesh to the table object
              table.add(textMesh);
      
              const graph = graphRef.current;
              


              // Calculate the table's position relative to the camera
              const tablePosition = table.position.clone();
              const cameraPosition = camera.position.clone();
              const lookAtVector = cameraPosition.sub(tablePosition).normalize();
          
              // Set the table's rotation to face the user/camera
              table.lookAt(lookAtVector);

                // graph2.scene().attach(table);
                node.__threeObj.add(table);

            }
          );
          

        })
        .then(()=>{
          console.log('yooooooooooooooooooooooo');
        })
    }
    ////
    if(node.type === 'column'){
      ipcRenderer
        .invoke(
          'run-query',
          {
            targetDb: selectedDb,
            sqlString: `select * from ${node.group}`,
            selectedDb: selectedDb,
            runQueryNumber: 1,
          },
          dbType
        )
        .then(({ db, sqlString, returnedRows, explainResults, error, 
          numberOfSample,
          totalSampleTime,
          minmumSampleTime,
          maximumSampleTime,
          averageSampleTime, }) => {
          if (error) {
            throw error;
          }
          
          let strrr = '';



          strrr += `${node.columnName}: ` + "\n";
          strrr += `---------------------------\n`;
          if(!returnedRows){
            strrr += "I am sorry,\nthe current column is undefined..."
          }
          else{
            for(let i = 0; i < 10; i++){
              strrr += `${returnedRows[i][node.columnName]}` + "\n";
            }
            strrr += '   .\n   .\n   .\n';
          }



                   

          // Define properties of the table cells
          const cellWidth = 200;
          const cellHeight = 100;
      
          // Create the table structure
          const cellGeometry = new THREE.BoxGeometry(cellWidth, cellHeight, 10);
          const cellMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(50, 200, 123)', opacity: 0.3, transparent: true });
          const cellMesh = new THREE.Mesh(cellGeometry, cellMaterial);
          // Calculate the position of each cell
          cellMesh.position.set(node.x, node.y + cellHeight/2, node.z);
      
          // Add the cell to the table object
          table.add(cellMesh);
      
          const fontLoader = new FontLoader();
          fontLoader.load(
            'https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
              // Create a text mesh for the cell
              const textGeometry = new TextGeometry(strrr, {
                font: font,
                size: 4,
                height: 2,
              });
              const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
              const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      
              // Position the text on the cell
              const textOffsetX = -cellWidth / 2 + 5; // Adjust the offset as needed
              const textOffsetY = cellHeight / 2 - 5 // Adjust the offset as needed
              textMesh.position.set(node.x + textOffsetX, node.y + (cellHeight/2) + textOffsetY, node.z+5); // Set the z-position to ensure the text is visible
      
              // Add the text mesh to the table object
              table.add(textMesh);
      
              const graph = graphRef.current;
              


              // Calculate the table's position relative to the camera
              const tablePosition = table.position.clone();
              const cameraPosition = camera.position.clone();
              const lookAtVector = cameraPosition.sub(tablePosition).normalize();
          
              // Set the table's rotation to face the user/camera
              table.lookAt(lookAtVector);

                // graph2.scene().attach(table);
                node.__threeObj.add(table);

            }
          );


          console.log('dbdbdbdbdbdbdbdbdbdbdbdbdbdb', db);
          // console.log('returnedRowsreturnedRowsreturnedRowsreturnedRows', returnedRows);
          console.log('yo obj: ', {
            db, sqlString, returnedRows, explainResults, 
          numberOfSample,
          totalSampleTime,
          minmumSampleTime,
          maximumSampleTime,
          averageSampleTime,
          })

        })
        .then(()=>{
          console.log('yooooooooooooooooooooooo');
        })
    }
  }

  return (
    <div>
      <button onClick={() => setShowSprites(!showSprites)}>
        {showSprites ? 'Hide Sprites' : 'Show Sprites'}
      </button>
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
        onNodeClick={(node) => runQueryBloom(node)}
      >
        <ambientLight color="#ffffff" intensity={1} />
        <directionalLight color="#ffffff" intensity={0.6} position={[-1, 1, 4]} />
      </ForceGraph3D>
    
    </div>
  );
};

export default ParanoidUniverse;
