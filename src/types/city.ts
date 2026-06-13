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

// single data point for any chart - a name and a numeric value
// this is the exact same type used throughout budget-detective's insight engine.ts
// every chart in this project accepts ChartItems[]
export type ChartItem = {
    name: string;
    value: number;
};

/* why a shared type? --> every chart - bar, pie, sparkline - accepts the same shape
{name: string, value: number}, you write the type once, import it everywhere.
This is exactly what budget-detective's payment.ts does with its ChartItem type */

