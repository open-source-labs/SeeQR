# Improvements

## view previous versions roadmap commits for older improvement goals

### v11 roadmap for future iterators


- 3D visualization: 

    - Update the timing of initialization of 3D rendering.

    - Adding the auto-rotate functionality with the newest updated camera position.

    - Adding the auto tumble functionality with the newest updated camera position.

    - Adding the functionality of cache/memory management for preventing slowing down the app.

    - Redesign the position of the preview green board in order to let the green board will follow the user’s camera position and ‘look at’ angel, also do not lose the drag and drop functionality.

    - Implement the ER table function on the 3D preview green board.

    - Adding VR functionality.

    - Whenever the user clicks the node/ball, the detail database chart is right below the 3D rendering area the user has to keep scrolling up and down. Try to figure out if there is any possibility to get rid of this awkward operation style in order to level up the users' experience.

- 2D visualization: 

    - Modify the way it connects the source node and target node of MySQL database due to the current method it connects all of the attributes without any filter.

    - Redesign the side of cable generation, too many 'folding' cables currently.

- 2D ER table functionality:

    - Fix the bug for the MySQL database.

    - Overwrite/Redesign the total of the ER table query strategy in order to make users able to run complicated queries on ER table.

    - Fix the “select” functionality there are some unknown reasons causing the “database is not selected.

    - Fix the automatic ‘re-focus’ issues that drop down the users' experience a lot.

    - Redesign the ER table interaction logic in order to level up the users' experience.

    - Increase the database type for ER table.

- Small bugs need to be ironed out, will find through testing

- Support for amazon aurora (beware of billing)

- When creating new MySQL databases, state seems to be creating phantom copies of databases.

- rds pg cloud queries seem to be creating the tables in more than just the selected database.

- rds my sql cloud queries wont let you create multiple tables at once. as in you have to create one table, then make another query to make your second table.

- Update ui of the initial landing page of application with cloud database instructions aswell