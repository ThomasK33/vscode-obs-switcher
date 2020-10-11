import "reflect-metadata";
import { Container } from "inversify";

import { ConnectCommand } from "./commands/connect";
import { DisconnectCommand } from "./commands/disconnect";
import { DeletePasswordCommand } from "./commands/deletePassword";
import { SetPasswordCommand } from "./commands/setPassword";
import { ToggleCommand } from "./commands/toggle";
import { UIManager } from "./services/ui";
import { ConfigManager } from "./services/configuration";
import { OBSManager } from "./services/obsmanager";
import { AddFileCommand } from "./commands/addFile";
import { RemoveFileCommand } from "./commands/removeFile";

const container = new Container({ autoBindInjectable: true });

container.bind(UIManager).toSelf().inSingletonScope();
container.bind(ConfigManager).toSelf().inSingletonScope();
container.bind(OBSManager).toSelf().inSingletonScope();

// --- Commands ---

container.bind("command").to(ConnectCommand);
container.bind("command").to(DeletePasswordCommand);
container.bind("command").to(DisconnectCommand);
container.bind("command").to(SetPasswordCommand);
container.bind("command").to(ToggleCommand);
container.bind("command").to(AddFileCommand);
container.bind("command").to(RemoveFileCommand);

export { container };
