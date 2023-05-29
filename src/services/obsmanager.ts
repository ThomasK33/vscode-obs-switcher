import * as vscode from "vscode";
import OBSWebSocket, { EventSubscription } from "obs-websocket-js";
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
		@inject(UIManager) public uiManager: UIManager
	) {
		// Have to set this by hand here to avoid circular dependencies
		// Sort of a poor mans lazy dependency injection
		uiManager.obsManager = this;

		this.obs = new OBSWebSocket();

		this.obs.on("CurrentProgramSceneChanged", (data) => {
			if (!this.showsSecretFile) {
				this.lastActiveScene = data.sceneName;
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
					`Could not automatically connect to OBS: ${e}`
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
				await this.obs.call("SetCurrentProgramScene", {
					sceneName: sceneName,
				});
			} catch (e) {
				vscode.window.showErrorMessage(
					`Could not SetCurrentScene: Error: ${JSON.stringify(
						e,
						null,
						2
					)}`
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
		this.uiManager.updateStatusBarItemText();
	}

	async connect() {
		// ensure this variables are not modified on runtime
		const { address, secure, sceneName } = this.configManager.configuration;

		// transition fallback support
		let transition = this.configManager.configuration.transition;

		const password = await this.secretsManager.getPassword();
		this.connecting = true;
		this.uiManager.updateStatusBarItemText();
		const connected = await this.obs.connect(
			`${secure ? "wss" : "ws"}://${address}`,
			password ?? undefined,
			{
				eventSubscriptions: EventSubscription.Scenes,
			}
		);

		const sceneList = await this.obs.call("GetSceneList");
		this.lastActiveScene = sceneList.currentProgramSceneName;

		const settingsSceneInCollection = sceneList.scenes.reduce<boolean>(
			(acc, scene) => acc || scene.sceneName === sceneName,
			false
		);

		if (!settingsSceneInCollection) {
			await this.disconnect();
			throw new Error(
				`Could not find scene "${sceneName}" in current scene list. Currently available scenes are: ${sceneList.scenes
					.map((scene) => scene.sceneName)
					.join(", ")}`
			);
		}

		const transitions = await this.obs.call("GetSceneTransitionList");
		// transition names can change depending on the locale of OBS. In order to fallback to a potentially good cut transition in
		// OBS setups were the locale isn't English, we find a fallback cut transition of the same kind. we then update the transition to be the
		// newly found fallback transition and save the config.
		// this is only done with the Cut transition, as it is the default (and probably desired) cut transition, and we want users
		// using the extension to have a smooth first use experience. other transition setups to explicitly fail in order for the user
		// to review the settings.
		if (
			transition == "Cut" ||
			!transitions.transitions.find((t) => t.transitionName == transition)
		) {
			const cutFallback = transitions.transitions.find(
				(t) => t.transitionKind == "cut_transition"
			); // default to 'cut_transition' type
			if (!cutFallback) {
				throw new Error(
					`the transition '${transition}' was not found, and no transitions similar to 'cut' were found`
				);
			}
			vscode.window.showInformationMessage(
				`The transition '${transition}' was not found, falling back to '${cutFallback.transitionName} and saving new config`
			);
			transition = cutFallback.transitionName as string;
			this.configManager.setConfig(
				"transition",
				transition,
				vscode.ConfigurationTarget.Global
			);
		}

		await this.obs.call("SetSceneSceneTransitionOverride", {
			sceneName,
			transitionName: transition,
		});

		return connected;
	}

	async disconnect() {
		try {
			const { sceneName } = this.configManager.configuration;
			await this.obs.call("SetSceneSceneTransitionOverride", {
				sceneName,
			});
		} catch (e) {}

		this.connecting = false;
		const disconnected = await this.obs.disconnect();

		return disconnected;
	}

	async resetScene() {
		return this.obs.call("SetCurrentProgramScene", {
			sceneName: this.lastActiveScene,
		});
	}
}
