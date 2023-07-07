# Improvements

## view previous versions roadmap commits for older improvement goals

### v11 roadmap for future iterators

use .pgpass file instead of pgpassword environment variable for security

swap between 3d views seamlessly

work on explain function for mysql and sqlite, may have different metadata from existing postgres implementation

ability to create multiple sqlite databases

ability to load multiple sqlite databases

ertable functionality in 3d

vr

- 3D visualization: 

    - Change the way the 3D page is rendered, to allow switching directly between different databases through the sidebar (currently you need to leave the 3D page before switching to a new database).

    - Make the camera auto rotate when initially opening the 3D page

    - Better cache/memory management to speed up animations/rendering

    - Make the green table in the 3D view always face the user's camera

    - Implement ER table functions

    - Add VR functionality?

- 2D visualization: 

    - Fix react flow bugs (tables moving on save, weird auto zooming, etc)

- 2D ER table functionality:

    - Fix the bug for the MySQL database.

    - Redesign the ER table query strategy in order to make users able to run complicated queries with less overhead. (i.e. currently, if you add a table then delete it, and press save, instead of doing nothing, the backend will create and delete the table)

    - Fix the occasional bug with selecting

    - Add support for more column types (according to the limitations of each database)

- Small bugs need to be ironed out, will find through testing

- Support for amazon aurora (beware of billing)

- When creating new MySQL databases, state seems to be creating phantom copies of databases.

- rds pg cloud queries seem to be creating the tables in more than just the selected database.

- rds my sql cloud queries wont let you create multiple tables at once. as in you have to create one table, then make another query to make your second table.

- Update ui of the initial landing page of application with cloud database instructions aswell