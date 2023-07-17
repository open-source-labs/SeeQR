# Improvements

## view previous versions roadmap commits for older improvement goals

### v11 roadmap for future iterators

- General

    - Update ui of the initial landing page of application with cloud database instructions

    - continue working on state management (usereducer, usecontext, etc)

    - fix outdated dependencies, currently packages must be force installed


- Database management

    - currently postgres imports/duplicates only works for either windows or osx/linux. main branch supports windows, devosx supports mac/linux, resolve this asap to not have to keep up with two branches

        - perhaps use .pgpass file instead of pgpassword environment variable for security (for postgresql imports/duplicates)

        - found in backend/helperFunctions.ts

    - Fix importing MySQL databases (currently creating an extra hollow copy or not working at all)

    - add ability to have multiple sqlite databases

    - fix deleting sqlite databases (currently only works randomly, likely not closing connection before attempting unlink)
    
    - support for amazon aurora (beware of billing)


- Queries page

    - fix query execution plan table view, likely broke while updating frontend dependencies

    - add colors back to special words in query view

    - work on explain function for mysql and sqlite, may have different metadata from existing postgres implementation, display whatever you can get 


- 2D visualization / ER tables: 

    - Fix react flow bugs (tables moving on save, weird auto zooming, etc), maybe rewrite layout save functionality

    - Fix bugs for MySQL and SQLite (they work differently from PostgreSQL which is the basis for all current ERtable functionality)

        - i.e. SQLite doesn't support changing column names/data types after building them, but the ERtable currently creates columns and then alters them on the backend

    - Redesign the ER table query strategy in order to make users able to run queries with less overhead. (i.e. currently, if you add a table then delete it, and press save, instead of doing nothing, the backend will create and delete the table)

    - Fix the occasional bug with selecting

    - Add support for more column datatypes (according to the limitations of each database)

    - queued backendObj changes are still there even when switching between different dbs in sidebar

    - account for different constraint naming conventions (mostly mysql)

    - resolve issue of creating additional columns for each constraint (mostly mysql)

    - rds pg cloud queries seem to be creating the tables in more than just the selected database.

    - rds my sql cloud queries wont let you create multiple tables at once. as in you have to create one table, then make another query to make your second table.

    - when you create a new cloud pg database, it seems to have all the other databases tables aswell.
 

- 3D visualization: 

    - Change the way the 3D page is rendered, to allow switching directly between different databases through the sidebar (currently you need to leave the 3D page before switching to a new database).

    - Make the camera auto rotate when initially opening the 3D page

    - Better cache/memory management to speed up animations/rendering

    - Make the green table in the 3D view always face the user's camera

    - Implement ER table functions

    - Add VR functionality?
