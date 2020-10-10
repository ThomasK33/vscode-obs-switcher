import * as vscode from "vscode";

import * as OBSWebSocket from "obs-websocket-js";
import { ConfigManager } from "./configuration";

export class OBSManager {
	obs: OBSWebSocket;
	connected = false;
	showsSecretFile = false;
	lastActiveScene = "";

	constructor() {
		this.obs = new OBSWebSocket();

		this.obs.on("SwitchScenes", (data) => {
			if (!this.showsSecretFile) {
				this.lastActiveScene = data["scene-name"];
			}
		});

		this.obs.on("ConnectionOpened", () => (this.connected = true));
		this.obs.on("ConnectionClosed", () => (this.connected = false));
	}

	async handleFileChange(showsSecretFile: boolean) {
		// If not connected to OBS do nothing
		if (!this.connected) {
			return;
		}

		// Get obs scene handling configs
		const { sceneName, autoSwitchBack } = ConfigManager.instance.configuration;

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
		const {
			address,
			password,
			secure,
			sceneName,
		} = ConfigManager.instance.configuration;
		const connected = await this.obs.connect({ address, password, secure });

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

		return connected;
	}

	async disconnect() {
		const disconnected = await this.obs.disconnect();

		return disconnected;
	}
}
