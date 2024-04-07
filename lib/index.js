import fs from "node:fs/promises";
import path from "node:path";
import anymatch from "anymatch";
import jscc from "jscc";


function jsccPlugin(options = {}) {
	
	const {
		filter = /\.(j|t)sx?$/,
		ignore,
		...jsccOptions
	} = options;
	
	const matcher = ignore && anymatch(ignore);
	
	return {
		name: "jscc",
		setup(build) {
			build.onLoad({ filter }, async ({ path: filePath }) => {
				if (!matcher?.(filePath)) {
					const source = await fs.readFile(filePath, "utf8");
					const loader = path.extname(filePath).slice(1);
					
					try {
						const { code, map } = jscc(source, null, jsccOptions);
						
						return {
							contents: map ? `${code}//# sourceMappingURL=${map.toUrl()}` : code,
							loader
						};
					} catch (error) {
						return { errors: [ { text: error.message } ] };
					}
				}
				
				return {
					contents: await fs.readFile(filePath, "utf8")
				};
			});
			
		}
	};
}


export { jsccPlugin as jscc };
