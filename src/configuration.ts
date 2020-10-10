import * as vscode from "vscode";
import { configKey } from "./constants";

export interface OBSSwitcherConfiguration {
	fileNames: string[];
	autoSwitchBack: boolean;
	sceneName: string;
	address: string;
	password: string;
	secure: boolean;
}

export class ConfigManager {
	public static instance = new ConfigManager();

	configuration: OBSSwitcherConfiguration;

	constructor() {
		this.configuration = this.loadConfig();
	}

	loadConfig() {
		const config = vscode.workspace.getConfiguration();
		const settings = config.get(configKey) as OBSSwitcherConfiguration;

		return settings;
	}

	reloadConfig() {
		this.configuration = this.loadConfig();
	}
}
