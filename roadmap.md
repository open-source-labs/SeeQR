# Improvements

## view previous versions roadmap commits for older improvement goals

### v11 roadmap for future iterators

- General

    - Small bugs need to be ironed out, will find through testing

    - Support for amazon aurora (beware of billing)

    - Fix importing MySQL databases (currently creating an extra hollow copy)

    - Update ui of the initial landing page of application with cloud database instructions aswell

    - fix outdated dependencies, currently packages must be force installed

    - continue working on state management (usereducer, usecontext, etc)

    - account for different constraint naming conventions (mostly mysql)

    - resolve issue of creating additional columns for each constraint (mostly mysql)

    - rewrite get columns query to only query relevant column names and constraints

    - queued backendObj changes are still there even when switching between different dbs in sidebar

    - use .pgpass file instead of pgpassword environment variable for security (for postgresql imports/duplicates)

    - currently postgres imports/duplicates only works for either windows or mac. main branch supports windows, devosx supports mac

    - work on explain function for mysql and sqlite, may have different metadata from existing postgres implementation

    - ability to create multiple sqlite databases

    - fix deleting sqlite databases (currently only works after initially opening SeeQR)
    
    - support for amazon aurora (beware of billing)

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

- 2D visualization: 

    - Fix react flow bugs (tables moving on save, weird auto zooming, etc), maybe rewrite layout save functionality


- 2D ER table functionality:

    - Fix bugs for MySQL and SQLite (they work differently from PostgreSQL which is the basis for all current ERtable funcitonality)

        - i.e. SQLite doesn't support changing column names/data types after building them, but the ERtable currently creates columns and then alters them on the backend

    - Redesign the ER table query strategy in order to make users able to run complicated queries with less overhead. (i.e. currently, if you add a table then delete it, and press save, instead of doing nothing, the backend will create and delete the table)

    - Fix the occasional bug with selecting

    - Add support for more column datatypes (according to the limitations of each database)
