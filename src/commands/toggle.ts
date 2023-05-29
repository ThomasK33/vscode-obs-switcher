import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import {
	connectCommandString,
	disconnectCommandString,
	toggleCommandString,
} from "../constants";
import { OBSManager } from "../services/obsmanager";
import { VSCCommand } from "./command";
import { UIManager } from "../services/ui";
import { prettyError } from "../helper";

// Command used to toggle the connection on / off to OBS
@injectable()
export class ToggleCommand implements VSCCommand {
	command = toggleCommandString;

	constructor(
		@inject(OBSManager) public obsManager: OBSManager,
		@inject(UIManager) public uiManager: UIManager
	) {}

	callback = () => {
		try {
			if (this.obsManager.connected) {
				vscode.commands.executeCommand(disconnectCommandString);
			} else {
				vscode.commands.executeCommand(connectCommandString);
			}
		} catch (e) {
			vscode.window.showErrorMessage(
				`Could not execute toggle command: ${prettyError(e)}`
			);
		}
	};
}
