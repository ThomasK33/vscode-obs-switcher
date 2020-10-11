import { injectable } from "inversify";
import * as vscode from "vscode";
import { extensionKey } from "../constants";

export interface OBSSwitcherConfiguration {
	fileNames: string[];
	autoSwitchBack: boolean;
	sceneName: string;
	address: string;
	secure: boolean;
	autoConnect: boolean;
}

@injectable()
export class ConfigManager {
	configuration: OBSSwitcherConfiguration;

	constructor() {
		this.configuration = this.loadConfig();
	}

	loadConfig(): OBSSwitcherConfiguration {
		const config = vscode.workspace.getConfiguration(extensionKey);

		return {
			address: config.get<string>("address", "localhost:4444"),
			autoSwitchBack: config.get<boolean>("autoSwitchBack", true),
			fileNames: config.get<string[]>("fileNames", ["*.env*"]),
			sceneName: config.get<string>("sceneName", ""),
			secure: config.get<boolean>("secure", false),
			autoConnect: config.get<boolean>("autoConnect", false),
		};
	}

	reloadConfig() {
		this.configuration = this.loadConfig();
	}

	setConfig(
		key: string,
		value: any,
		configurationTarget?: boolean | vscode.ConfigurationTarget | undefined,
		overrideInLanguage?: boolean | undefined,
	) {
		const config = vscode.workspace.getConfiguration(extensionKey);

		return config.update(key, value, configurationTarget, overrideInLanguage);
	}
}
