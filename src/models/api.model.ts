export interface MergedRespone {
	characterName: string;
	homePlanet: string;
	similarTo: string;
	comparison: {
		orbitalPeriod: {
			fictitious: string;
			real: string;
		};
	};
	timestamp: string;
}

export interface StoreResponse {
	message: string;
	itemId: string;
}

export interface HistoryResponse {
	items: {
		createdAt: string;
		data: MergedRespone;
	}[];
	lastKey: string | null;
}
