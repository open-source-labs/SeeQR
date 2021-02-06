import React from 'react'

interface QueryLabelProps {
  label: string
}

const QueryLabel = ({label}: QueryLabelProps) => {
  return (
    <div>
      {label}
    </div>
  )
}

export default QueryLabel
