export class HaravanError extends Error {
	constructor(...args: any) {
		super(...args);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class UninitializedContextError extends HaravanError {}

export class MissingRequiredArgument extends HaravanError {}

export class HttpRequestError extends HaravanError {}

export class HttpMaxRetriesError extends HaravanError {}

export class InvalidRequestError extends HaravanError {}

interface HttpResponseData {
	code: number;
	statusText: string;
	body?: { [key: string]: unknown };
	headers?: { [key: string]: unknown };
}

interface HttpResponseErrorParams extends HttpResponseData {
	message: string;
}

export class HttpResponseError extends HaravanError {
	readonly response: HttpResponseData;

	public constructor({ code, message, statusText, body, headers }: HttpResponseErrorParams) {
		super(message);
		this.response = {
			code,
			statusText,
			body,
			headers,
		};
	}
}

export class HttpRetriableError extends HttpResponseError {}

export class HttpInternalError extends HttpRetriableError {}

interface HttpRateLimitErrorData extends HttpResponseData {
	retryAfter?: number;
}

interface HttpRateLimitErrorParams extends HttpRateLimitErrorData {
	message: string;
}

export class HttpRateLimitError extends HttpRetriableError {
	readonly response: HttpRateLimitErrorData;

	public constructor({ retryAfter, ...params }: HttpRateLimitErrorParams) {
		super(params);
		this.response.retryAfter = retryAfter;
	}
}
