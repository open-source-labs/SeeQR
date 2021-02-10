import React from 'react'
import {DatabaseInfo} from '../../../types'

interface DatabaseDetailsProps {
  db: DatabaseInfo;
}

const DatabaseDetails = ({db}: DatabaseDetailsProps) => (
  <div>{`${db.db_name} = ${db.db_size}`}</div>
)

export default DatabaseDetails
