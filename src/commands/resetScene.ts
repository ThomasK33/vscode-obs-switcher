import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import { resetSceneCommandString } from "../constants";
import { OBSManager } from "../services/obsmanager";
import { VSCCommand } from "./command";
import { prettyError } from "../helper";

@injectable()
export class ResetSceneCommand implements VSCCommand {
	command = resetSceneCommandString;

	constructor(@inject(OBSManager) public obsManager: OBSManager) {}

	callback = async () => {
		try {
			await this.obsManager.resetScene();
		} catch (e) {
			vscode.window.showErrorMessage(
				`Could not execute toggle command: ${prettyError(e)}`
			);
		}
	};
}
