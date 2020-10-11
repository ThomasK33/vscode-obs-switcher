import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import { VSCCommand } from "./command";
import { addFileCommandString } from "../constants";
import { ConfigManager } from "../services/configuration";

@injectable()
export class AddFileCommand implements VSCCommand {
	command = addFileCommandString;

	constructor(@inject(ConfigManager) public configManager: ConfigManager) {}

	callback = async (file: vscode.Uri, selectedFiles?: vscode.Uri[]) => {
		if (!selectedFiles || selectedFiles.length === 0) {
			selectedFiles = [file];
		}

		const selectedFilesNames = selectedFiles.map((selectedFile) =>
			selectedFile.path.replace(/^.*[\\\/]/, ""),
		);

		const { fileNames } = this.configManager.configuration;

		for (const file of selectedFilesNames) {
			if (!fileNames.includes(file)) {
				fileNames.push(file);
			}
		}

		await this.configManager.setConfig("fileNames", fileNames);

		vscode.window.showInformationMessage(
			`Added ${selectedFilesNames.join(", ")} to list of secret files`,
		);
	};
}
