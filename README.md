<p align="center">
<img src="./frontend/assets/images/logo_readme.png" height=300/>
</p>

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/oslabs-beta/SeeQR)
![Release: 1.0](https://img.shields.io/badge/Release-1.0-red)
![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)
![Contributions Welcome](https://img.shields.io/badge/Contributions-welcome-blue.svg)
[![Github stars](https://img.shields.io/github/stars/oslabs-beta/SeeQR?style=social)](https://github.com/oslabs-beta/SeeQR)

Landing Page Link
LinkedIn Link
Medium Article Link
Twitter Link

# About

A database analytic tool that compares the efficiency of different schemas and queries on a granular level to make better informed architectural decisions regarding SQL databases at various scales.

# Table of Contents

- About
- Beta Phase
- Getting Started
- Built With
- Interface & Features
  - Schema upload methods
  - Query input
  - Data
  - History
  - Results
  - Compare
  - Dummy data generation
  - Visualized Analytics
- Application Architecture and Logic
- Core Team
- Contribution and Configuration

# Beta Phase

SeeQR is still in BETA. Additional features, extensions, and improvements will continue to be introduced. If you encounter any issues with the application, please report them in the issues tab or submit a PR. Thank you for your interest!

# Getting Started

1. Go to [SeeQR Website](https://www.theseeqr.io) and download Electron app.
2. Download, install, and run docker desktop.
3. Launch SeeQR.
4. Enjoy optimizing your schemas!

Built With *Have built in links the pages
Electron		https://www.electronjs.org/docs
React			https://reactjs.org/
React-Hooks		https://reactjs.org/docs/hooks-intro.html
Typescript		https://www.typescriptlang.org/
Docker			https://www.docker.com/get-started
Docker-Compose 	https://docs.docker.com/compose/
PostgreSQL		*link
Chart.js		https://github.com/chartjs
Faker.js		https://github.com/Marak/faker.js
CodeMirror		https://codemirror.net/

Interface & Features [Pictures and Gifs everywhere in this section]
Schema upload methods
Upon application launch, upload .sql or .tar file when prompted by splash page, or hit cancel.
The uploaded .sql or .tar file becomes the active database.
To input new schemas, toggle the “Input Schema” button. Upload a .sql or .tar file or directly input schema code. Remember to provide the schema with a unique label, as it will be assigned to the name property of the newly spun up database connected to the schema.
Query input
The center panel is where the query input text field is located, utilizing CodeMirror for SQL styling.
Provide a unique and concise label for the query as its shorthand identifier in later comparisons against other queries.
Toggle the submit button in the bottom left to send the query to the selected database.
Data
The data table displays data returned by the inputted query.
History
The history table shows the latest queries the user submitted irrespective of the database.
The history table also displays the total rows returned by the query and the total query execution time.
Results
The results table displays the scan type, runtime, and the amount of loops the query had to perform in addition to the analytics data available on the history table.
The results table is schema-specific, showing only query results from the active schema.
Compare Results
The comparison table is flexible to the user’s preferences.
The user selects which queries they want to compare side by side from the ‘Add Query Data’ drop down.
They can add and remove queries as they see fit
Dummy data generation
TBD
Visualized Analytics
TBD



Application Architecture and Logic
(use diagrams to illustrate)
Containerization
SeeQR streamlines the process of instantiating postgres databases by leveraging Docker to containerize an image of postgres. This means instances of databases are automatically created every time new schema data is uploaded or inputted via the SeeQR GUI. Electron communicates with the instantiated database’s URI’s by taking advantage of the ‘pg’ npm package. 
Cross-schema Comparisons
One of the key features of SeeQR is to compare the efficiency of executing user-inputted queries against different schemas. This allows customization of table scale, relationship, type, and the queries themselves within the context of each schema. This flexibility affords the user granular adjustments for testing every desired scenario. Please refer to “Interface & Functionality” for more details on execution.
Database:Schema 1:1 Architecture
While it is feasible for a database to house multiple schemas, SeeQR’s default architecture for database:schema relations is 1:1. For every schema inputted, a new database is generated to hold that schema. This architecture serves the application’s central purpose: testing — by enabling the capacity to individually scale data connected to each schema, generating analytics at any user-specified conditions.
Session-based Result Caching
The outcome results from each query, both retrieved data and analytics, are stored in the application’s state, which can be viewed and compared in table and visualizer formats. Note that these results’ persistence is session-based and will be cleared upon quitting the application.


Testing [Post Launch]


Core Team
Catherine Chiu @github @linkedIn
Serena Kuo @github @linkedIn
Frank Norton @github @linkedIn
Mercer Stronk @github @linkedIn
Muhammad Trad @github @linkedIn


Contribution and Configuration

SeeQR welcomes contribution and iteration. 

To get started on contributing to this project: 
Download and Install Docker Desktop (attach link)
Fork or clone this repo
Npm install
Run npm install for application-specific dependencies
Run global install for: cross-env, webpack, webpack-dev-server, electron, typescript
Enable sass compiling to css directory 
To run application during development 
npm run dev to launch Electron application window and webpack-dev-server.
npm run resetContainer to reset the container and clear pre-existing SeeQR databases. If error “can’t find postgres-1” is encountered, it is simply an indication that the container is already pruned.

Link to install video post launch :)

