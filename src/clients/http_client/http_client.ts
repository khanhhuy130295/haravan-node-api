import fetch from "node-fetch";
import type { RequestInit, Response } from "node-fetch";
import { ParsedUrlQueryInput, encode } from "querystring";

import {
	GetRequestParams,
	DeleteRequestParams,
	PostRequestParams,
	PutRequestParams,
	RequestReturn,
	RequestParams,
	DataType,
} from "./http_client.type";
import { Method, Header, StatusCode } from "./http_client.enum";
import * as HRVError from "../../error";
import ProcessedQuery from "../../utils/processed-query";

export class HttpClient {
	static readonly RETRY_WAIT_TIME = 2000;

	public constructor(private domain: string) {
		this.domain = domain;
	}

	/**
	 * Performs a GET request on the given path.
	 */
	public async get(params: GetRequestParams): Promise<RequestReturn> {
		return this.request({ method: Method.Get, ...params });
	}

	/**
	 * Performs a POST request on the given path.
	 */
	public async post(params: PostRequestParams): Promise<RequestReturn> {
		return this.request({ method: Method.Post, ...params });
	}

	/**
	 * Performs a PUT request on the given path.
	 */
	public async put(params: PutRequestParams): Promise<RequestReturn> {
		return this.request({ method: Method.Put, ...params });
	}

	/**
	 * Performs a DELETE request on the given path.
	 */
	public async delete(params: DeleteRequestParams): Promise<RequestReturn> {
		return this.request({ method: Method.Delete, ...params });
	}

	protected async request(params: RequestParams): Promise<RequestReturn> {
		const maxTries = params.tries ? params.tries : 1;
		if (maxTries < 0) {
			throw new HRVError.HttpRequestError(`Number of tries must be >= 0, got ${maxTries}`);
		}

		let headers: typeof params.extraHeaders = {
			...params.extraHeaders,
		};

		let body = null;

		if (params.method === Method.Post || params.method === Method.Put) {
			const { type, data } = params as PostRequestParams;
			if (data) {
				switch (type) {
					case DataType.JSON:
						body = typeof data === "string" ? data : JSON.stringify(data);
						break;
					case DataType.URLEncoded:
						body = typeof data === "string" ? data : encode(data as ParsedUrlQueryInput);
						break;
				}
				headers = {
					...headers,
					"Content-Type": type,
					"Content-Length": Buffer.byteLength(body as string),
				};
			}
		}

		const url: string = `https://${this.domain}${this.getRequestPath(params.path)}${ProcessedQuery.stringify(params.query)}`;
		const options: RequestInit = {
			method: params.method.toString(),
			headers,
			body,
		} as RequestInit;

		let tries = 0;
		while (tries < maxTries) {
			try {
				return await this.doRequest(url, options);
			} catch (error) {
				tries++;
				if (error instanceof HRVError.HttpRateLimitError) {
					if (tries < maxTries) {
						let waitTime = HttpClient.RETRY_WAIT_TIME;
						if (error.response.retryAfter) {
							waitTime = error.response.retryAfter * 1000;
						}
						await this.sleep(waitTime);
						continue;
					}
				}

				if (maxTries > 1) {
					throw new HRVError.HttpMaxRetriesError(`Exceeded maximum retry count of ${maxTries}. Last message: ${error.message}`);
				}

				// We're not retrying or the error is not retriable, rethrow
				throw error;
			}
		}

		throw new HRVError.HaravanError(`Unexpected flow, reached maximum HTTP tries but did not throw an error`);
	}

	private async doRequest(url: string, options: RequestInit): Promise<RequestReturn> {
		try {
			const response: Response = await fetch(url, options);
			const body: any = await response.json().catch(() => {});
			if (response.ok) {
				return {
					body,
					headers: response.headers,
				};
			} else {
				// handle exception
				const errorMessages: string[] = [];
				if (body && body.errors) {
					errorMessages.push(JSON.stringify(body.errors, null, 2));
				}

				if (response.headers && response.headers.get(Header.XShopId)) {
					errorMessages.push(`If you report this error, please include this id: ${response.headers.get(Header.XShopId)}`);
				}
				const errorMessage = errorMessages.length ? `:\n${errorMessages.join("\n")}` : "";
				const headers = response.headers.raw();
				const code = response.status;
				const statusText = response.statusText;

				// rate limit
				if (response.status === StatusCode.TooManyRequests) {
					const retryAfter = response.headers.get(Header.RetryAfter);
					throw new HRVError.HttpRateLimitError({
						message: `Haravan API is rate limit requests ${errorMessage}`,
						code,
						statusText,
						body,
						headers,
						retryAfter: retryAfter ? parseFloat(retryAfter) : undefined,
					});
				}

				// internal error
				if (response.status >= StatusCode.InternalServerError) {
					throw new HRVError.HttpInternalError({
						message: `Haravan API internal error ${errorMessage}`,
						code,
						statusText,
						body,
						headers,
					});
				}

				// otherwise
				throw new HRVError.HttpResponseError({
					message: `Received an error response (${response.status} ${response.statusText}) from Haravan API ${errorMessage}`,
					code,
					statusText,
					body,
					headers,
				});
			}
		} catch (error) {
			if (error instanceof HRVError.HaravanError) {
				throw error;
			} else {
				throw new HRVError.HttpRequestError(`Failed to make Haravan HTTP request: ${error}`);
			}
		}
	}

	protected getRequestPath(path: string): string {
		return `/${path.replace(/^\//, "")}`;
	}

	private async sleep(waitTime: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, waitTime));
	}
}
