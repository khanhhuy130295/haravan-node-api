// https://huafu.github.io/ts-jest/user/config/#the-3-presets
import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
	verbose: true,
	testMatch: ["<rootDir>/**/*.test.ts"],
	moduleNameMapper: {
		"^@Root/(.*)$": "<rootDir>/$1",
		"^@Client/(.*)$": "<rootDir>/clients/$1",
		"^@Helper/(.*)$": "<rootDir>/utils/$1",
	},
	transform: {
		"^.+.(ts|tsx|js)$": "ts-jest",
	},
	testTimeout: 5 * 60 * 1000,
};
export default config;
