import * as vscode from "vscode";
import OBSWebSocket, { EventSubscription, OBSEventTypes, OBSRequestTypes, OBSResponseTypes } from 'obs-websocket-js';
import { ConfigManager } from "./configuration";
import { SecretsManager } from "./secrets";
import { inject, injectable } from "inversify";
import { UIManager } from "./ui";
import { EventEmitter } from "events";

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

		this.obs.on('CurrentProgramSceneChanged', (data) => {
			if (!this.showsSecretFile) {
				this.lastActiveScene = data.sceneName;
			}
		});

		this.obs.on('ConnectionOpened', () => {
			this.connected = true;
			this.connecting = false;

			uiManager.updateStatusBarItemText();
		});
		this.obs.on('ConnectionClosed', () => {
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
				await this.obs.call('SetCurrentProgramScene', {
					sceneName: sceneName
				});
			} catch (e) {
				vscode.window.showErrorMessage(
					`Could not SetCurrentScene: Error: ${JSON.stringify(e, null, 2)}`,
				);
			}
		} else {
			if (autoSwitchBack && !showsSecretFile && this.showsSecretFile) {
				await this.obs.call("SetCurrentProgramScene", {
					sceneName: this.lastActiveScene,
				});
			}
		}

		this.showsSecretFile = showsSecretFile;
	}

	async connect() {
		const {
			address,
			secure,
			sceneName,
			transition,
		} = this.configManager.configuration;
		const password = await this.secretsManager.getPassword();
		this.connecting = true;
		this.uiManager.updateStatusBarItemText();
		const connected = await this.obs.connect(`${secure ? 'wss' : 'ws'}://${address}`, password ?? undefined, {
			eventSubscriptions: EventSubscription.Scenes
		});

		const sceneList = await this.obs.call("GetSceneList");
		this.lastActiveScene = sceneList.currentProgramSceneName;

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

		await this.obs.call("SetSceneSceneTransitionOverride", {
			sceneName,
			transitionName: transition,
			transitionDuration: 0,
		});

		return connected;
	}

	async disconnect() {
		try {
			const { sceneName } = this.configManager.configuration;
			await this.obs.call('SetSceneSceneTransitionOverride', {
				sceneName
			});
		} catch (e) { }

		this.connecting = false;
		const disconnected = await this.obs.disconnect();

		return disconnected;
	}

	async resetScene() {
		return this.obs.call('SetCurrentProgramScene', {
			sceneName: this.lastActiveScene,
		});
	}
}
