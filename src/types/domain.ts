export type Gender = "m" | "w" | "d";
export type ApiGender = "male" | "female" | "div";

// Helper function to convert API gender format to our internal format
export function convertApiGender(apiGender: ApiGender): Gender {
    switch (apiGender) {
        case "male":
            return "m";
        case "female":
            return "w";
        case "div":
            return "d";
        default:
            return "m" as Gender;
    }
}

export type Strain = {
    readonly id: string;
    readonly name: string;
    readonly imageDataUrl?: string;
    readonly currentStockG: number;
    readonly thc: number;
    readonly cbd: number;
    readonly info: readonly string[];
};

export type Disbursement = {
    readonly id: string;
    readonly strainId: string;
    readonly strainName: string;
    readonly time: string; // HH:MM
    readonly grams: number;
    readonly over21: boolean;
    readonly gender: Gender;
    readonly dateIso: string; // YYYY-MM-DD
};

// Legacy type for the old API statistics data format
export type ApiStatEntry = [
    milligrams: number,
    over21: boolean,
    gender: ApiGender,
    timestamp: number
];

// Legacy type for the old API statistics response
export type ApiStatisticsResponse = ApiStatEntry[];

// New API statistics response types based on the actual format
export type StatCount = {
    readonly mg: number;
    readonly count: number;
};

export type GenderStats = {
    readonly f: StatCount;
    readonly m: StatCount;
    readonly d: StatCount;
    readonly na: StatCount;
};

export type AgeStats = {
    readonly under21: StatCount;
    readonly over21: StatCount;
};

export type GenderAgeStats = {
    readonly f: AgeStats;
    readonly m: AgeStats;
    readonly d: AgeStats;
    readonly na: AgeStats;
};

export type ApiStatisticsBasicResponse = {
    readonly total: StatCount;
    readonly byGender: GenderStats;
    readonly byUnder21: {
        readonly "true": StatCount;
        readonly "false": StatCount;
    };
};

export type ApiStatisticsExtendedResponse = {
    readonly total: StatCount;
    readonly byGender: GenderStats;
    readonly byAge?: AgeStats;
    readonly byGenderAndAge?: GenderAgeStats;
    readonly byUnder21?: {
        readonly "true": StatCount;
        readonly "false": StatCount;
    };
};
