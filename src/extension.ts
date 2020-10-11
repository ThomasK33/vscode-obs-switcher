// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as minimatch from "minimatch";
import { extensionKey } from "./constants";
import { ConfigManager } from "./services/configuration";
import { OBSManager } from "./services/obsmanager";
import { container } from "./inversify.config";
import { VSCCommand } from "./commands/command";
import { UIManager } from "./services/ui";
import { prettyError } from "./helper";

export function activate({ subscriptions }: vscode.ExtensionContext) {
	console.log("obs-switcher is active!");

	const obsManager = container.get(OBSManager);
	const configManager = container.get(ConfigManager);

	container
		.getAll<VSCCommand>("command")
		.forEach(({ command, callback, thisArg }) => {
			subscriptions.push(
				vscode.commands.registerCommand(command, callback, thisArg),
			);
		});

	const { statusBarItem } = container.get(UIManager);
	subscriptions.push(statusBarItem);

	// Listen to file change events
	subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(async (e) => {
			const fileName = e?.document.fileName;

			if (fileName) {
				// Determine wether currently open file is a secret file or not
				const showsSecretFile = configManager.configuration.fileNames.reduce<
					boolean
				>(
					(acc, secretFileName) =>
						acc ||
						minimatch(fileName, secretFileName, {
							dot: true,
							nocase: true,
							matchBase: true,
						}),
					false,
				);

				try {
					// Handle shown file
					obsManager.handleFileChange(showsSecretFile);
				} catch (e) {
					vscode.window.showErrorMessage(`${prettyError(e)}`);
				}
			}
		}),
	);

	// --- Configuration reload on settings.json change ---
	subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration(extensionKey)) {
				configManager.reloadConfig();
			}
		}),
	);
}

// this method is called when your extension is deactivated
export async function deactivate() {
	const obsManager = container.get(OBSManager);

	// Disconnect from OBS
	await obsManager.disconnect();
	// Remove all listeners attached to OBS
	obsManager.obs.removeAllListeners();
}
