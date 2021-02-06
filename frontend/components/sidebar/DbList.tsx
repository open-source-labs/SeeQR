import React from 'react';
import AddIcon from '@material-ui/icons/Add';
import AddNewDbModal from '../modal/addNewDbModal';

export interface DbListProps {
  open: boolean;
  onClose: () => void;
}

const DbList = () => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <AddIcon color="primary" fontSize="large" onClick={handleClickOpen} />
      <AddNewDbModal open={open} onClose={handleClose} />
    </div>
  );
};

export default DbList;
