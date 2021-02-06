import React from 'react';
import { ThemeProvider, Dialog, DialogTitle, Typography } from '@material-ui/core/';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { ButtonDialog, theme } from '../../style-variables';

const { dialog } = require('electron').remote;

const { ipcRenderer } = window.require('electron');

type addNewDbModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddNewDbModal = ({ open, onClose }: addNewDbModalProps) => {
  const handleClose = () => {
    onClose();
  };

  const handleFileClick = () => {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Custom File Type', extensions: ['tar', 'sql'] }],
        message: 'Please upload .sql or .tar database file',
      })
      .then((result: object) => {
        const filePathArr = result['filePaths'];

        // send via channel to main process
        if (!result['canceled']) {
          ipcRenderer.send('upload-file', filePathArr);
          return handleClose();
        }
      })
      .catch((err: object) => {
        console.log(err);
      });
  };

  // listen for menu to invoke handleFileClick
  ipcRenderer.on('menu-upload-file', () => handleFileClick);

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Dialog fullWidth maxWidth="xs" onClose={handleClose} aria-labelledby="modal-title" open={open}>
          <DialogTitle id="alert-dialog-title">
            Import Existing Database
          </DialogTitle>
          <Typography paragraph align="center" id="alert-dialog-description">
            Please select a .sql or .tar file
          </Typography>
          <ButtonDialog
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleFileClick}
          >
            Import File
          </ButtonDialog>
          <ButtonDialog
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            Cancel
          </ButtonDialog>
        </Dialog>
      </ThemeProvider>
    </div>
  );
};

export default AddNewDbModal;