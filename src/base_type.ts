export interface ContextParams {
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	IS_PRIVATE_APP?: boolean;
	API_VERSION: ApiVersion;
}

export enum ApiVersion {
	Ver1 = "",
	Ver2 = "v2",
}

export const LATEST_API_VERSION = ApiVersion.Ver2;

export enum HaravanHeader {
	Topic = "X-Haravan-Topic",
	OrgID = "X-Haravan-Org-Id",
	Hmac = "X-Haravan-Hmacsha256",
	WH_Challenge = "hub.challenge",
	WH_Mode = "hub.mode",
	WH_VerifyToken = "hub.verify_token",
}
