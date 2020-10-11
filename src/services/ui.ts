import * as vscode from "vscode";
import { inject, injectable } from "inversify";
import {
	connectedStatusBarItemText,
	connectedStatusBarItemTooltip,
	connectingStatusBarItemText,
	disconnectedStatusBarItemText,
	disconnectedStatusBarItemTooltip,
	toggleCommandString,
} from "../constants";
import { OBSManager } from "./obsmanager";

@injectable()
export class UIManager {
	statusBarItem: vscode.StatusBarItem;

	obsManager?: OBSManager;

	constructor() {
		this.statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			100,
		);
		this.statusBarItem.command = toggleCommandString;
		this.updateStatusBarItemText();
		this.statusBarItem.show();
	}

	updateStatusBarItemText() {
		this.statusBarItem.text = this.obsManager?.connected
			? connectedStatusBarItemText
			: this.obsManager?.connecting
			? connectingStatusBarItemText
			: disconnectedStatusBarItemText;

		this.statusBarItem.tooltip = this.obsManager?.connected
			? connectedStatusBarItemTooltip
			: disconnectedStatusBarItemTooltip;
	}
}
