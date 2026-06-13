// All aggregration logic
import type { ChartItem, CityRow } from "../types/city";
/* why it is important from types? your function take CityRow[] as input and return
ChartItem as output. TypeScript needs to know those shapes to chatch mistakes - if you pass
the wronf thing, it errors before you even run the app */

export function formatNumber(value: number): string {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toFixed(0);
}

/* The core aggregration function - the most important function in this file
Groups an array of city rows by a field, sums the values and returns a sorted 
CharItem array ready for any chart component

eg:
aggregrateBy(rows, "state","population")
--> [{name: "CA", value: 1250000}, {name: "TX", value: 100000}, ....]
*/

export function aggregateBy(
    rows: CityRow[],
    groupField: keyof CityRow, // the field to group by (e.g. "state")
    valueField: keyof CityRow // the field to group by (e.g. "population")
): ChartItem[] {
    const totals = new Map<string, number>(); // is like an object but with cleaner APIs for getting and setting by key

    rows.forEach((row) =>{
        const key = String(row[groupField] || "Unknown")
        const value = Number(row[valueField] || 0)
        totals.set(key, (totals.get(key) || 0) + value);
    });
    // Array.from(...) converts that into a real array so you can call .map() and .sort()
    return Array.from(totals.entries()) // .entries gives you an iterator of [key, value] pair
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => b.value - a.value);
}

/* specific aggregration functions - each calls aggregrateBy with fixed field.
This is the same pattern as getTopAgencies(), getTopVendors() in budget-detective */

export function getTopStates(rows: CityRow[], limit = 5): ChartItem[]{
    return aggregateBy(rows, "state", "population").slice(0, limit);
}

export function getTopStatesByVeterans(rows: CityRow[], limit = 5): ChartItem[]{
    return aggregateBy(rows, "state", "totalVeterans").slice(0, limit);
}

export function getPopulationBuckets(rows: CityRow[]): ChartItem[]{
    // Groups cities into size bucket and count how many cities fall in each.
    const buckets = new Map<string, number>([
        ["Mega (1M+)", 0],
        ["Large (500k - 1M)", 0],
        ["Medium (100K - 500K)", 0],
        ["Small (<100K)", 0],
    ]);

    rows.forEach((row) =>{
        if (row.population > 1_000_000_000) buckets.set("Mega (1M+)", (buckets.get("Mega (1M+)") || 0) + 1);
        else if (row.population > 5_00_000) buckets.set("Large (500k - 1M)", (buckets.get("Large (500k - 1M)") || 0) + 1);
        else if (row.population > 1_00_000) buckets.set("Medium (100K - 500K)", (buckets.get("Medium (100K - 500K)") || 0) + 1);
        else  buckets.set("Small (<100K)", (buckets.get("Small (<100K)") || 0) + 1);
    })

    return Array.from(buckets.entries())
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);
}

export function getTotalPopulation(rows: CityRow[]): number {
  return rows.reduce((sum, row) => sum + row.population, 0);
}

export function getAvgMedianAge(rows: CityRow[]): number {
  if (!rows.length) return 0;
  return rows.reduce((sum, row) => sum + row.medianAge, 0) / rows.length;
}

export function getMostVeteranState(rows: CityRow[]): ChartItem {
  const byState = aggregateBy(rows, "state", "totalVeterans");
  return byState[0] || { name: "N/A", value: 0 };
}

// This is part of Project 3
// The questionEngine needs them to answer "least populated state" and "biggest city" type


/* Returns state sorted by population ascending (smallest first), 
ignoring any zeros totals. Mirrors getLeastVendors() in budgetDetective */
export function getLeastStates(rows: CityRow[], limit = 5): ChartItem[]{
    return aggregateBy(rows, "state", "population")
        .filter((item) => item.value > 0)
        .sort((a,b) => a.value - b.value)
        .slice(0, limit);
}

/*returns the single city with the highest population.
Useful for "Which city is the biggest?" style questions*/
export function getMostPopulousCity(rows: CityRow[]): CityRow | undefined{
    return [...rows].sort((a,b) => b.population - a.population)[0];
}

/* returns the single city with the lowest population */
export function getLeastPopulousCity(rows: CityRow[]): CityRow | undefined {
    return [...rows].sort((a,b) => a.population - b.population)[0]
}




