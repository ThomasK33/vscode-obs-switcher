import { getPassword, setPassword, deletePassword, findPassword } from "keytar";
import { ConfigManager } from "./configuration";
import { extensionKey } from "../constants";
import { inject, injectable } from "inversify";

@injectable()
export class SecretsManager {
	constructor(@inject(ConfigManager) public configManager: ConfigManager) {}

	getPassword() {
		return getPassword(extensionKey, this.configManager.configuration.address);
	}

	setPassword(password: string) {
		return setPassword(
			extensionKey,
			this.configManager.configuration.address,
			password,
		);
	}

	deletePassword() {
		return deletePassword(
			extensionKey,
			this.configManager.configuration.address,
		);
	}

	findPassword() {
		return findPassword(extensionKey);
	}
}
