export const extensionKey = "obsSwitcher";

// export const connectedStatusBarItemText = `$(lock) Disconnect from OBS`;
export const hiddenStatusBarItemText = `$(eye-closed) OBS`;
export const connectedStatusBarItemText = `$(eye) OBS`;
export const disconnectedStatusBarItemText = `$(debug-start) OBS`;

export const connectedStatusBarItemTooltip = "Disconnect from OBS";
export const disconnectedStatusBarItemTooltip = "Connect to OBS";

export const connectingStatusBarItemText = `$(loading~spin) OBS`;

// --- Commands ---

export const toggleCommandString = `${extensionKey}.toggle`;
export const connectCommandString = `${extensionKey}.connect`;
export const disconnectCommandString = `${extensionKey}.disconnect`;
export const setPasswordCommandString = `${extensionKey}.setPassword`;
export const deletePasswordCommandString = `${extensionKey}.deletePassword`;
export const addFileCommandString = `${extensionKey}.addFile`;
export const removeFileCommandString = `${extensionKey}.removeFile`;
export const resetSceneCommandString = `${extensionKey}.resetScene`;
