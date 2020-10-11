export const prettyError = (e: Object | string) => {
	if (typeof e === "object") {
		return "Error: " + JSON.stringify(e, null, 2);
	} else {
		return e;
	}
};
