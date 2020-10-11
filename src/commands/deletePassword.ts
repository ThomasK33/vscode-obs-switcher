import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import { deletePasswordCommandString } from "../constants";
import { OBSManager } from "../services/obsmanager";
import { VSCCommand } from "./command";
import { SecretsManager } from "../services/secrets";
import { ConfigManager } from "../services/configuration";

// Command used to delete OBS Websocket password from keychain
@injectable()
export class DeletePasswordCommand implements VSCCommand {
	command = deletePasswordCommandString;

	constructor(
		@inject(OBSManager) public obsManager: OBSManager,
		@inject(SecretsManager) public secretsManager: SecretsManager,
		@inject(ConfigManager) public configManager: ConfigManager,
	) {}

	callback = async () => {
		const result = this.secretsManager.deletePassword();

		if (result) {
			vscode.window.showInformationMessage(
				`Successfully deleted password for address: ${this.configManager.configuration.address}`,
			);
		} else {
			vscode.window.showErrorMessage(
				`Could not delete password for address: ${this.configManager.configuration.address}`,
			);
		}
	};
}
