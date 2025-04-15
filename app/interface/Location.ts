// app/types/Location.ts
export interface Province {
    code: number;
    name: string;
}

export interface District {
    code: number;
    name: string;
}

export interface ProvinceResponse {
    code: number;
    name: string;
    districts?: District[];
}