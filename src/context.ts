import * as HRVError from "./error";
import { ApiVersion, ContextParams } from "./base_type";

interface ContextInterface extends ContextParams {
	/**
	 * Sets up the Haravan API Library to be able to integrate with Haravan and run authenticated commands.
	 *
	 * @param params Settings to update
	 */
	initialize(params: ContextParams): void;

	/**
	 * Throws error if context has not been initialized.
	 */
	throwIfUninitialized(): void | never;
}

const Context: ContextInterface = {
	CLIENT_ID: "",
	CLIENT_SECRET: "",
	API_VERSION: ApiVersion.Ver1,
	IS_PRIVATE_APP: false,

	initialize(params: ContextParams): void {
		// Make sure that the essential params actually have content in them
		const missing: string[] = [];
		if (!params.CLIENT_ID.length) {
			missing.push("CLIENT_ID");
		}
		if (!params.CLIENT_SECRET.length) {
			missing.push("CLIENT_SECRET");
		}

		if (missing.length) {
			throw new HRVError.HaravanError(`Cannot initialize Haravan API Library. Missing values for: ${missing.join(", ")}`);
		}

		this.CLIENT_ID = params.CLIENT_ID;
		this.CLIENT_SECRET = params.CLIENT_SECRET;
		this.API_VERSION = params.API_VERSION;
		this.IS_PRIVATE_APP = params.IS_PRIVATE_APP;
	},

	throwIfUninitialized(): void {
		if (!this.CLIENT_ID || this.CLIENT_ID.length === 0) {
			throw new HRVError.UninitializedContextError(
				"Context has not been properly initialized. Please call the .initialize() method to setup your app context object"
			);
		}
	},
};

export { Context, ContextInterface };
