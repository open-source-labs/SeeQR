import React from 'react'

interface DatabaseDetailsProps {
  db: string;
}

const DatabaseDetails = ({db}: DatabaseDetailsProps) => (
  <div>{`${db} Details`}</div>
)

export default DatabaseDetails
