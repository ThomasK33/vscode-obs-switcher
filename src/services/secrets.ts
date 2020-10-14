import { keychain } from "../keychain";
import { ConfigManager } from "./configuration";
import { extensionKey } from "../constants";
import { inject, injectable } from "inversify";

@injectable()
export class SecretsManager {
	constructor(@inject(ConfigManager) public configManager: ConfigManager) {}

	async getPassword() {
		return keychain?.getPassword(
			extensionKey,
			this.configManager.configuration.address,
		);
	}

	async setPassword(password: string) {
		return keychain?.setPassword(
			extensionKey,
			this.configManager.configuration.address,
			password,
		);
	}

	async deletePassword() {
		return keychain?.deletePassword(
			extensionKey,
			this.configManager.configuration.address,
		);
	}

	async findPassword() {
		return keychain?.findPassword(extensionKey);
	}
}
