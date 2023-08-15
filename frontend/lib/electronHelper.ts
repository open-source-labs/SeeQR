import { ipcRenderer } from 'electron';

function invoke(event: string, payload): Promise<any> {
  return ipcRenderer.invoke(event, payload);
}

export default invoke;
