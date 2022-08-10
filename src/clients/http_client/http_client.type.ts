import { Method } from "./http_client.enum";
import { Headers } from "node-fetch";

export interface HeaderParams {
	[key: string]: string | number;
}

export enum DataType {
	JSON = "application/json",
	URLEncoded = "application/x-www-form-urlencoded",
}

export type QueryParams = string | number | string[] | number[] | { [key: string]: QueryParams };

export interface GetRequestParams {
	path: string;
	type?: DataType;
	data?: { [key: string]: unknown } | string;
	query?: { [key: string]: QueryParams };
	extraHeaders?: HeaderParams;
	tries?: number;
}

export type PostRequestParams = GetRequestParams & {
	type: DataType;
	data: { [key: string]: unknown } | string;
};

export type PutRequestParams = PostRequestParams;

export type DeleteRequestParams = GetRequestParams;

export type RequestParams = (GetRequestParams | PostRequestParams) & {
	method: Method;
};

export interface RequestReturn {
	body: unknown;
	headers: Headers;
}
