module.exports = {
  // This query lists each table that has a foreign key, the name of the table that key points to, and the name of the column at which the foreign key constraint resides
  getForeignKeys: `select kcu.table_name as foreign_table,
          rel_kcu.table_name as primary_table,
          kcu.column_name as fk_column
    from information_schema.table_constraints tco
    join information_schema.key_column_usage kcu
              on tco.constraint_name = kcu.constraint_name
    join information_schema.referential_constraints rco
              on tco.constraint_name = rco.constraint_name
    join information_schema.key_column_usage rel_kcu
              on rco.unique_constraint_name = rel_kcu.constraint_name
    where tco.constraint_type = 'FOREIGN KEY'
    order by kcu.table_schema,
            kcu.table_name,
            kcu.ordinal_position;`,

  // This query lists each table and the column name at which there is a primary key
  getPrimaryKeys: `select kcu.table_name as table_name,
      kcu.column_name as pk_column
    from information_schema.key_column_usage as kcu
    join information_schema.table_constraints as tco
      on tco.constraint_name = kcu.constraint_name
    where tco.constraint_type = 'PRIMARY KEY'
    order by kcu.table_name;`,
};
