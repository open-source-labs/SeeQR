import React from 'react';

type TabProps = {
  onClickTabItem: any;
  currentSchema: string;
  label: string;
};

const Tab = ({ onClickTabItem, currentSchema, label } : TabProps) => {

  let className = 'tab-list-item';
  if (currentSchema === label) {
    className += ' tab-list-active';
  }

  return (
    // TODO: see if we can refactor to a button for accessibility reasons (or turn of eslint rule)
    <li className={className} onClick={() => onClickTabItem(label)}>
      {label}
    </li>
  );
};

export default Tab;
