# Improvements

Front-End
- Dark scrollbar
- QueryResults: First and Last page navigation buttons
- Compare: allow comparison mode to switch between group (same label) and db (same db)

Back-End
- Number of dummy data records that can be generated is currently limited by the maximum size/length a string can be in js and the maximum number of characters allowed in a Postgres query. Improve dummy data generation process to avoid these limits.
