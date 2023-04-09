import * as vscode from "vscode";
import { injectable } from "inversify";
import {
	connectedStatusBarItemText,
	connectedStatusBarItemTooltip,
	connectingStatusBarItemText,
	disconnectedStatusBarItemText,
	disconnectedStatusBarItemTooltip,
	hiddenStatusBarItemText,
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
		if(this.obsManager?.connected){
			if(this.obsManager.showsSecretFile){
				this.statusBarItem.text = hiddenStatusBarItemText
			} else {
				this.statusBarItem.text = connectedStatusBarItemText
			}
		} else if (this.obsManager?.connecting){
			this.statusBarItem.text = connectingStatusBarItemText
		} else {
			this.statusBarItem.text = disconnectedStatusBarItemText
		}

		this.statusBarItem.tooltip = this.obsManager?.connected
			? connectedStatusBarItemTooltip
			: disconnectedStatusBarItemTooltip;
	}
}
