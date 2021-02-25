# Improvements

Front-End

- Dark scrollbar
- QueryResults: First and Last page navigation buttons
- Compare: allow comparison mode to switch between group (same label) and db (same db)

Back-End

- Number of dummy data records that can be generated is currently limited by the maximum size/length a string can be in js and the maximum number of characters allowed in a Postgres query. Improve dummy data generation process to avoid these limits.

Features

- Save and  import "sessions" - query lists and their results
- connect to any URI
- Display Indexes available for each table
- Highlight and display data types on Query Results table
- Export Query Results/Explain data to plain text files

Improvements

- Deprecate the use of psql, pg_dump and pg_restore in favor of using only pg. This would remove the psql local dependency for users
- Auto-update electron app
- Display Query Execution time in TopSummary even if there are no Rows (ie Insert and Delete operations)