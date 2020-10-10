// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as minimatch from "minimatch";
import {
	commandPrefix,
	configKey,
	connectedStatusBarItemText,
	connectingStatusBarItemText,
	disconnectedStatusBarItemText,
	disconnectingStatusBarItemText,
} from "./constants";
import { ConfigManager } from "./configuration";
import { OBSManager } from "./obsmanager";

const obsManager = new OBSManager();

export function activate({ subscriptions }: vscode.ExtensionContext) {
	console.log("obs-switcher is active!");

	// Connect to OBS command
	let disposable = vscode.commands.registerCommand(
		`${commandPrefix}.connect`,
		async () => {
			try {
				await obsManager.connect();

				vscode.window.showInformationMessage("Connected to OBS");
			} catch (e) {
				vscode.window.showErrorMessage(`Could not connect to OBS: ${e}`);
			}
		},
	);
	subscriptions.push(disposable);

	// Disconnect from OBS command
	disposable = vscode.commands.registerCommand(
		`${commandPrefix}.disconnect`,
		async () => {
			try {
				await obsManager.disconnect();

				vscode.window.showInformationMessage("Disconnected from OBS");
			} catch (e) {
				vscode.window.showErrorMessage(`Could not disconnect from OBS: ${e}`);
			}
		},
	);
	subscriptions.push(disposable);

	// Toggle OBS connection
	disposable = vscode.commands.registerCommand(
		`${commandPrefix}.toggle`,
		() => {
			try {
				if (obsManager.connected) {
					statusBarItem.text = disconnectingStatusBarItemText;
					vscode.commands.executeCommand(`${commandPrefix}.disconnect`);
				} else {
					statusBarItem.text = connectingStatusBarItemText;
					vscode.commands.executeCommand(`${commandPrefix}.connect`);
				}
			} catch (e) {
				vscode.window.showErrorMessage(
					`Could not execute toggle command: Error: ${e}`,
				);
			}
		},
	);
	subscriptions.push(disposable);

	const statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100,
	);
	statusBarItem.command = `${commandPrefix}.toggle`;
	statusBarItem.text = obsManager.connected
		? connectedStatusBarItemText
		: disconnectedStatusBarItemText;
	subscriptions.push(statusBarItem);
	statusBarItem.show();

	// Subscribe to a opened connection to OBS
	obsManager.obs.on("ConnectionOpened", () => {
		statusBarItem.text = connectedStatusBarItemText;
	});
	// Subscribe to a closed connection to OBS
	obsManager.obs.on("ConnectionClosed", () => {
		statusBarItem.text = disconnectedStatusBarItemText;
	});

	// Listen to file change events
	subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(async (e) => {
			const fileName = e?.document.fileName;

			if (fileName) {
				// Determine wether currently open file is a secret file or not
				const showsSecretFile = ConfigManager.instance.configuration.fileNames.reduce<
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
					vscode.window.showErrorMessage(`${e}`);
				}
			}
		}),
	);

	// --- Configuration reload on settings.json change ---
	subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration(configKey)) {
				ConfigManager.instance.reloadConfig();
			}
		}),
	);
}

// this method is called when your extension is deactivated
export async function deactivate() {
	// Disconnect from OBS
	await obsManager.disconnect();
	// Remove all listeners attached to OBS
	obsManager.obs.removeAllListeners();
}
