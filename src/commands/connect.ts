import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import { connectCommandString } from "../constants";
import { OBSManager } from "../services/obsmanager";
import { VSCCommand } from "./command";
import { prettyError } from "../helper";

// Command used to connect to OBS
@injectable()
export class ConnectCommand implements VSCCommand {
	command = connectCommandString;

	constructor(@inject(OBSManager) public obsManager: OBSManager) {}

	callback = async () => {
		try {
			await this.obsManager.connect();

			vscode.window.showInformationMessage("Connected to OBS");
		} catch (e) {
			vscode.window.showErrorMessage(
				`Could not connect to OBS: ${prettyError(e)}`,
			);
		}
	};
}
