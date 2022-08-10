import { Haravan } from "./src/index";
import _ from "lodash";

async function demoLib() {
	let token = "5FB61BF4484D6D3564D248C756E64AAE626C54E6216CA981813EA5537BA9E9D0";
	let domain = "apis.haravan.com";
	let client = new Haravan.Clients.Rest(domain, token);
	try {
		let a = await client.get({
			path: "products123",
		});
		let result = a.body as any;
		console.log(result.products.length);
	} catch (err) {
		console.log(err);
		if (err instanceof Error) {
		}
	}
}

demoLib();

// demo 429
// let arrays: Array<Promise<any>> = [];
//
// for (let i = 0; i < 60; i++) {
// 	let temp = client.get({
// 		path: "products",
// 		query: {
// 			fields: "id",
// 			limit: 1,
// 		},
// 		tries: 20,
// 	});
// 	arrays.push(temp);
// }
// let a = await Promise.all(arrays);
// console.log(a.length);
