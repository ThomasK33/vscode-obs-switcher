import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import { disconnectCommandString } from "../constants";
import { OBSManager } from "../services/obsmanager";
import { VSCCommand } from "./command";
import { prettyError } from "../helper";

// Command used to disconnect from OBS
@injectable()
export class DisconnectCommand implements VSCCommand {
	command = disconnectCommandString;

	constructor(@inject(OBSManager) public obsManager: OBSManager) {}

	callback = async () => {
		try {
			await this.obsManager.disconnect();
		} catch (e) {
			vscode.window.showErrorMessage(
				`Could not disconnect from OBS: ${prettyError(e)}`,
			);
		}
	};
}
