import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import { setPasswordCommandString } from "../constants";
import { VSCCommand } from "./command";
import { SecretsManager } from "../services/secrets";
import { prettyError } from "../helper";

// Command used to set OBS Websocket password in keychain
@injectable()
export class SetPasswordCommand implements VSCCommand {
	command = setPasswordCommandString;

	constructor(
		@inject(SecretsManager) public secretsManager: SecretsManager,
	) { }

	callback = () => setPasswordDialog(this.secretsManager)
}

export async function setPasswordDialog(secrets:SecretsManager) {
	const password = await vscode.window.showInputBox({
		placeHolder: "Type the OBS Websocket password",
		password: true,
	});

	if (password === undefined) {
		return;
	}

	if (password) {
		secrets
			.setPassword(password)
			.then(() =>
				vscode.window.showInformationMessage(
					`Stored OBS Websocket password. You can now connect to OBS.`,
				),
			)
			.catch((e) =>
				vscode.window.showErrorMessage(
					`An error occurred while setting password: ${prettyError(e)}`,
				),
			);
	} else {
		vscode.window.showErrorMessage("You cannot use an empty password.");
	}
}