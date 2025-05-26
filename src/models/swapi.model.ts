export interface SwapiSupport {
	contact: string;
	donate: string;
	partnerDiscounts: {
		saberMasters: {
			link: string;
			details: string;
		};
		heartMath: {
			link: string;
			details: string;
		};
	};
}

export interface SwapiSocial {
	discord: string;
	reddit: string;
	github: string;
}

export interface SwapiResponse<T> {
	message: string;
	result: T;
	apiVersion: string;
	timestamp: string;
	support: SwapiSupport;
	social: SwapiSocial;
}

export interface SwapiPlanet {
	properties: {
		created: string;
		edited: string;
		climate: string;
		surface_water: string;
		name: string;
		diameter: string;
		rotation_period: string;
		terrain: string;
		gravity: string;
		orbital_period: string | 'unknown';
		population: string;
		url: string;
	};
	_id: string;
	description: string;
	uid: string;
	__v: number;
}

export interface SwapiPeople {
	properties: {
		created: string;
		edited: string;
		name: string;
		gender: string;
		skin_color: string;
		hair_color: string;
		height: string;
		eye_color: string;
		mass: string;
		homeworld: string;
		birth_year: string;
		url: string;
	};
	_id: string;
	description: string;
	uid: string;
	__v: number;
}
