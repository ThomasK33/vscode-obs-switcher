export const prettyError = (e: Object | string) => {
	if (typeof e === "object") {
		return `Error: ${(e as any).message ?? ""} - ${JSON.stringify(e, null, 2)}`;
	} else {
		return e;
	}
};
