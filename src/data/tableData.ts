export interface Response {
	results: ResponseResults[]
	info: ResponseInfo
}

export interface ResponseInfo {
	seed: string
	results: number
	page: number
	version: string
}

export interface ResponseResults {
	gender: string
	name: {
		title: string
		first: string
		last: string
	}
	location: {
		street: {
			number: number
			name: string
		}
		city: string
		state: string
		country: string
		postcode: number
		coordinates: {
			latitude: string
			longitude: string
		}
	}
	email: string,
	login: {
		uuid: string,
		username: string
		password: string
		salt: string
		md5: string
		sha1: string
	}
	dob: {
		date: string
		age: number
	}
	phone: string
	cell: string
	id: {
		name: string
		value: string
	}
	picture: {
		large: string
		medium: string
		thumbnail: string
	}
	nat: string
}

export async function getData<T>(url: string): Promise<T> {
	try {
		const response = await fetch(url);
		return await response.json();
	} catch (e: any) {
		console.log(e);
		throw new Error(e);
	}
}