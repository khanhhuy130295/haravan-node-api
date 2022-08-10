import { RequestReturn, GetRequestParams } from "../http_client/http_client.type";

export interface PageInfo {
	limit: string;
	ids?: string;
	fields?: string;
}

export type RestRequestReturn = RequestReturn & {
	pageInfo?: PageInfo;
};
