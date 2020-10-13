import * as vscode from "vscode";

import * as OBSWebSocket from "obs-websocket-js";
import { ConfigManager } from "./configuration";
import { SecretsManager } from "./secrets";
import { inject, injectable } from "inversify";
import { UIManager } from "./ui";

@injectable()
export class OBSManager {
	obs: OBSWebSocket;
	connected = false;
	connecting = false;
	showsSecretFile = false;
	lastActiveScene = "";

	constructor(
		@inject(ConfigManager) public configManager: ConfigManager,
		@inject(SecretsManager) public secretsManager: SecretsManager,
		@inject(UIManager) public uiManager: UIManager,
	) {
		// Have to set this by hand here to avoid circular dependencies
		// Sort of a poor mans lazy dependency injection
		uiManager.obsManager = this;

		this.obs = new OBSWebSocket();

		this.obs.on("SwitchScenes", (data) => {
			if (!this.showsSecretFile) {
				this.lastActiveScene = data["scene-name"];
			}
		});

		this.obs.on("ConnectionOpened", () => {
			this.connected = true;
			this.connecting = false;

			uiManager.updateStatusBarItemText();
		});
		this.obs.on("ConnectionClosed", () => {
			this.connected = false;
			this.connecting = false;

			uiManager.updateStatusBarItemText();
		});

		if (this.configManager.configuration.autoConnect) {
			try {
				this.connect();
			} catch (e) {
				vscode.window.showErrorMessage(
					`Could not automatically connect to OBS: ${e}`,
				);
			}
		}
	}

	async handleFileChange(showsSecretFile: boolean) {
		// If not connected to OBS do nothing
		if (!this.connected) {
			return;
		}

		// Get obs scene handling configs
		const { sceneName, autoSwitchBack } = this.configManager.configuration;

		if (showsSecretFile) {
			try {
				await this.obs.send("SetCurrentScene", {
					"scene-name": sceneName,
				});
			} catch (e) {
				vscode.window.showErrorMessage(
					`Could not SetCurrentScene: Error: ${JSON.stringify(e, null, 2)}`,
				);
			}
		} else {
			if (autoSwitchBack && !showsSecretFile && this.showsSecretFile) {
				await this.obs.send("SetCurrentScene", {
					"scene-name": this.lastActiveScene,
				});
			}
		}

		this.showsSecretFile = showsSecretFile;
	}

	async connect() {
		const { address, secure, sceneName } = this.configManager.configuration;
		const password = await this.secretsManager.getPassword();
		this.connecting = true;
		this.uiManager.updateStatusBarItemText();
		const connected = await this.obs.connect({
			address,
			password: password ?? undefined,
			secure,
		});

		const sceneList = await this.obs.send("GetSceneList");
		this.lastActiveScene = sceneList["current-scene"];

		const settingsSceneInCollection = sceneList.scenes.reduce<boolean>(
			(acc, scene) => acc || scene.name === sceneName,
			false,
		);

		if (!settingsSceneInCollection) {
			await this.disconnect();
			throw new Error(
				`Could not find scene "${sceneName}" in current scene list. Currently available scenes are: ${sceneList.scenes
					.map((scene) => scene.name)
					.join(", ")}`,
			);
		}

		await this.obs.send("SetSceneTransitionOverride", {
			sceneName,
			transitionName: "Cut",
			transitionDuration: 0,
		});

		return connected;
	}

	async disconnect() {
		try {
			const { sceneName } = this.configManager.configuration;
			await this.obs.send("RemoveSceneTransitionOverride", { sceneName });
		} catch (e) {}

		this.connecting = false;
		const disconnected = await this.obs.disconnect();

		return disconnected;
	}

	async resetScene() {
		return this.obs.send("SetCurrentScene", {
			"scene-name": this.lastActiveScene,
		});
	}
}
