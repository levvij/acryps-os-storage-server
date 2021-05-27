export class Path {
	clean(path: string) {
		const components = path.split("/");

		return `/${components.filter(c => c).join("/")}${path.length > 1 && path.endsWith("/") ? "/" : ""}`;
	}

	resolve(path: string) {
		const components = this.clean(path).split("/");
		const resolved = [];

		for (let component in components) {
			if (component == "..") {
				resolved.pop();
			} else if (component == ".") {
				resolved.push(component);
			}
		}

		return resolved.join("/");
	}

	parent(path: string) {
		return this.resolve(`${path}/..`);
	}
}