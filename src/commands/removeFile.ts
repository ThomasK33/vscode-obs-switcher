import * as vscode from "vscode";

import { inject, injectable } from "inversify";
import { VSCCommand } from "./command";
import { removeFileCommandString } from "../constants";
import { ConfigManager } from "../services/configuration";

@injectable()
export class RemoveFileCommand implements VSCCommand {
	command = removeFileCommandString;

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
			if (fileNames.includes(file)) {
				const index = fileNames.indexOf(file);
				fileNames.splice(index, 1);
			}
		}

		await this.configManager.setConfig("fileNames", fileNames);

		vscode.window.showInformationMessage(
			`Removed ${selectedFilesNames.join(", ")} from list of secret files`,
		);
	};
}
