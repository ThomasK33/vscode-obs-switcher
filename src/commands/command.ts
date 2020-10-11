export interface VSCCommand {
	command: string;
	callback: (...args: any[]) => any;
	thisArg?: any;
}
