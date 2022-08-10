import { decode } from "querystring";

import { Context } from "../../context";
import { Header } from "../http_client/http_client.enum";
import * as HRVError from "../../error";
import { HttpClient } from "../http_client/http_client";
import { RequestParams, GetRequestParams, RequestReturn } from "../http_client/http_client.type";
import { PageInfo, RestRequestReturn } from "./rest.type";

class RestClient extends HttpClient {
	private static LINK_HEADER_REGEXP = /<([^<]+)>; rel="([^"]+)"/;
	private static DEFAULT_LIMIT = "50";

	public constructor(domain: string, readonly accessToken: string) {
		super(domain);

		if (!Context.IS_PRIVATE_APP && !accessToken) {
			throw new HRVError.MissingRequiredArgument("Missing access token when creating REST client");
		}
	}

	protected async request(params: RequestParams): Promise<RestRequestReturn> {
		params.extraHeaders = {
			[Header.Authorization]: Context.IS_PRIVATE_APP ? Context.CLIENT_SECRET : `Bearer ${this.accessToken as string}`,
			...params.extraHeaders,
		};

		const ret = (await super.request(params)) as RestRequestReturn;
		// note addition page info

		return ret;
	}

	protected getRequestPath(path: string): string {
		const cleanPath = super.getRequestPath(path).replace("/", "");
		return `/com/${Context.API_VERSION}${cleanPath.replace(/\.json$/, "")}.json`;
	}

	private buildRequestParams(newPageUrl: string): GetRequestParams {
		const pattern = `^/com/[^/]+/(.*).json$`;
		const url = new URL(newPageUrl);
		const path = url.pathname.replace(new RegExp(pattern), "$1");
		const query = decode(url.search.replace(/^\?(.*)/, "$1")) as {
			[key: string]: string | number;
		};
		return {
			path,
			query,
		};
	}
}

export { RestClient };
