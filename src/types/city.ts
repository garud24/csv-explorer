// raw data comming out of papaparse
export type RawCityRow = {
    City: string;
    State: string;
    Population: string;
    "Median Age": string;
    "Male Population": string;
    "Female Population": string;
    "Total Veterans": string;
    "Foreign-born": string;
};

// cleaned data that we have cleaned from the above RawCityRow using normalize row function
export type CityRow = {
    city: string;
    state: string;
    population: number;
    medianAge: number;
    malePopulation: number;
    femalePopulation: number;
    totalVeterans: number;
    foreignBorn: number;
};

