import Papa from "papaparse";
import type { RawCityRow, CityRow } from "../types/city";


// function to convert string to a number for number fields
// return 0 if the value if empty, null or not a valid number
function toNumber(value: string | undefined): number{
    if (!value) return 0;
    return Number(value.replace(/,/g,"").trim()) || 0; // "/,/g is the regex that means every comma in the string"
}

// transform RawCityRow into a clean CityRow
export function normalizeRow(raw: RawCityRow): CityRow{
    return {
        city: raw.City?.trim() || "unknown city",
        state: raw.State?.trim() || "unknown state",
        population: toNumber(raw.Population),
        medianAge: toNumber(raw["Median Age"]),
        malePopulation: toNumber(raw["Male Population"]),
        femalePopulation: toNumber(raw["Female Population"]),
        totalVeterans: toNumber(raw["Total Veterans"]),
        foreignBorn: toNumber(raw["Foreign-born"]),
    };
}

const CSV_URL = "public/data/us_cities.csv";
// we use promise as a wrapper around a value that doesn't exist yet
// in this case Promise<CityRow[]> means that eventually we will get an array of CityRow as the response
export async function loadCities(): Promise<CityRow[]>{
    const response = await fetch(CSV_URL);
    if (!response.ok){
        throw new Error (`failed to fetch csv: ${response.status}`)
    }

    const csvText = await response.text();
    //resolve and reject: when you create a new Promise, you get these 2 function.
    // resolve(value) when you have the result - the promise delivers it to whoever awaited it
    // reject(error) when something goes wrong - the promise throws the error up to whoever is awaited
    return new Promise((resolve, reject) => {
        Papa.parse<RawCityRow>(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const rows = result.data
                .map(normalizeRow)
                .filter((row)=>row.population > 0);
                resolve(rows);
            },
            error: (err: Error) => reject(err),
        });
    });
}