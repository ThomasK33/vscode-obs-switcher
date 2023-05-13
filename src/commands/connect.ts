import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import { connectCommandString } from "../constants";
import { OBSManager } from "../services/obsmanager";
import { VSCCommand } from "./command";
import { prettyError } from "../helper";
import { SecretsManager } from "../services/secrets";
import { setPasswordDialog } from "./setPassword";

// Command used to connect to OBS
@injectable()
export class ConnectCommand implements VSCCommand {
	command = connectCommandString;

	constructor(
		@inject(OBSManager) public obsManager: OBSManager,
		@inject(SecretsManager) public secretsManager: SecretsManager
	) {}

	callback = async () => {
		try {
			await this.obsManager.connect();
		} catch (e: any) {
			try {
				// handle common errors
				if (e.code == 4009) {
					await setPasswordDialog(this.secretsManager);
				} else {
					throw e;
				}
				await this.obsManager.connect();
			} catch (error: any) {
				let msg = prettyError(error) as string;
				if (error.code == -1) {
					msg =
						"Enable the websocket feature by going into OBS 'tools' → 'obs-websocket settings'. If you don't see this option, make sure you are running OBS v28 or newer, or install the obs-websocket extension";
				}
				vscode.window.showErrorMessage(
					`Could not connect to OBS: ${msg}`
				);
			}
		}
	};
}
