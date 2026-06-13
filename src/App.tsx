import { useState, useEffect, useMemo } from "react";
import "./App.css";
import { loadCities } from "./services/csvLoader";
import type { CityRow } from "./types/city";
import {
  getTopStates,
  getTotalPopulation,
  getAvgMedianAge,
  getMostVeteranState,
  getPopulationBuckets,
  getTopStatesByVeterans,
  formatNumber,
  getMostPopulousCity,
  getLeastPopulousCity,
  getLeastStates,
} from "./services/insightEngine";
import { detectIntent } from "./services/questionEngine";
import QuestionBox from "./components/QuestionBox";
import AnswerCard, { type DynamicAnswer } from "./components/AnswerCard";

import StatCard from "./components/StatCard";
import MiniBarList from "./components/MiniBarList";
import MiniDonut from "./components/MiniDonut";
import TrendCard from "./components/TrendCard";

// these are the hooks of react:
// useState: stores a piece of data and re-renders the component when it changes
// useEffect: runs a side effect (like fetching data) after the component renders
// useMemo: computes a derived value and caches the reuslt - only recomputes when its input changes

type SortKey = keyof CityRow;
type SortDir = "asc" | "desc";

// keyof CityRow --> typescript utility type produces a nuion of all the key of CityRows

export default function APP() {
  const [rows, setRows] = useState<CityRow[]>([]); // you are calling useState with a generic type parameter CityRow[] and initial value of [](empty array). It returns 2 things the current value (rows) and a function to update it setRows(newValue), React re-renders components with new value
  const [loading, setLoading] = useState(true); // why loading is set to true --> the moment component mounts, it hasn't loaded data yet. Starting as true means your loading screen shows immedaitely, before first renders even completes
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("population");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  // null = no question has been asked yet, or the answer area is empty
  const [dynamicAnswer, setDynamicAnswer] = useState<DynamicAnswer | null>(
    null,
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const cities = await loadCities();
        setRows(cities);
      } catch (e) {
        setError("Could not load the dataset. Check your network connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // [] means run this once when the component first appears on screen, if you put [search] then it would re-runs search changes
  // fetchData defined inside useEffect inside of outside? because async functions can't pass directly inside useEffect(expects a normal function)
  // the pattern is define async function inside useEffect and call it immediately
  // remember we have passes resolve/ reject created a promise function inside loadCitites() in csvLoader.ts

  const displayRows = useMemo(() => {
    const filtered = rows.filter(
      (r) =>
        r.city.toLowerCase().includes(search.toLowerCase()) ||
        r.state.toLowerCase().includes(search.toLowerCase()),
    );

    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, sortKey, sortDir, search]);

  // why use useMemo and not directly displayRows, because displayrows would trigger and recalculates every single render
  // useMemo caches the reuslt and noly recomputes when rowws, sortKeys, sortDir or search changes

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc")); // This is a form of a state setter, instead of passing a new value directly, you pass a function that receives the current value of (d) and returns the next value
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  // const totalPop = useMemo(
  //   () => rows.reduce((sum, r) => sum + r.population, 0),
  //   [rows],
  // );
  const avgMedianAge = useMemo(
    () =>
      rows.length ? rows.reduce((s, r) => s + r.medianAge, 0) / rows.length : 0,
    [rows],
  );

  const totalPop = useMemo(() => getTotalPopulation(rows), [rows]);
  const avgAge = useMemo(() => getAvgMedianAge(rows), [rows]);
  const topVeteranState = useMemo(() => getMostVeteranState(rows), [rows]);
  const topStates = useMemo(() => getTopStates(rows, 6), [rows]);
  const veteransByState = useMemo(
    () => getTopStatesByVeterans(rows, 5),
    [rows],
  );
  const popBuckets = useMemo(() => getPopulationBuckets(rows), [rows]);

  if (loading) {
    return (
      <main className="center">
        <p>Loading dataset...</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="center">
        <p className="error">{error}</p>
      </main>
    );
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "population", label: "Population" },
    { key: "medianAge", label: "Median age" },
    { key: "malePopulation", label: "Male pop." },
    { key: "femalePopulation", label: "Female pop." },
    { key: "totalVeterans", label: "Veterans" },
    { key: "foreignBorn", label: "Foreign born" },
  ];

  // Called whenever the user submits a question (typed or clicked sample button).
  function handleQuestion(question: string) {
    const intent = detectIntent(question);

    if (intent === "total_population") {
      setDynamicAnswer({
        question,
        title: "What is the total population?",
        answer: `The combined population across all cities in this dataset is ${formatNumber(
          getTotalPopulation(rows),
        )}.`,
        explanation:
          "I added up the population field from every row in the dataset.",
      });
      return;
    }

    if (intent === "avg_median_age") {
      setDynamicAnswer({
        question,
        title: "What is the average median age?",
        answer: `The average median age across all cities is ${getAvgMedianAge(
          rows,
        ).toFixed(1)} years.`,
        explanation:
          "I added the median age of every city and divided by the number of cities.",
      });
      return;
    }

    if (intent === "city_count") {
      setDynamicAnswer({
        question,
        title: "How many cities are in the dataset?",
        answer: `There are ${rows.length.toLocaleString()} cities in this dataset.`,
        explanation:
          "I counted the number of rows after removing invalid entries.",
      });
      return;
    }

    if (intent === "top_population_state") {
      const top = getTopStates(rows, 1)[0];
      setDynamicAnswer({
        question,
        title: "Which state has the highest population?",
        answer: `${top?.name} has the highest total population: ${formatNumber(
          top?.value || 0,
        )}.`,
        explanation:
          "I grouped all cities by state, summed each state's city populations, and picked the highest total.",
      });
      return;
    }

    if (intent === "least_population_state") {
      const bottom = getLeastStates(rows, 1)[0];
      setDynamicAnswer({
        question,
        title: "Which state has the lowest population?",
        answer: `${
          bottom?.name
        } has the lowest total population among the states in this dataset: ${formatNumber(
          bottom?.value || 0,
        )}.`,
        explanation:
          "I grouped all cities by state, summed each state's city populations, removed zero totals, and picked the lowest.",
      });
      return;
    }

    if (intent === "top_veteran_state") {
      const top = getTopStatesByVeterans(rows, 1)[0];
      setDynamicAnswer({
        question,
        title: "Which state has the most veterans?",
        answer: `${
          top?.name
        } has the highest total veteran population: ${formatNumber(
          top?.value || 0,
        )}.`,
        explanation:
          "I grouped all cities by state, summed each state's veteran population, and picked the highest total.",
      });
      return;
    }

    if (intent === "biggest_city") {
      const city = getMostPopulousCity(rows);
      setDynamicAnswer({
        question,
        title: "Which city has the highest population?",
        answer: `${city?.city}, ${
          city?.state
        } is the most populous city with ${formatNumber(
          city?.population || 0,
        )} people.`,
        explanation:
          "I sorted every city by population, descending, and took the first row.",
      });
      return;
    }

    if (intent === "smallest_city") {
      const city = getLeastPopulousCity(rows);
      setDynamicAnswer({
        question,
        title: "Which city has the lowest population?",
        answer: `${city?.city}, ${
          city?.state
        } has the lowest population in this dataset, with ${formatNumber(
          city?.population || 0,
        )} people.`,
        explanation:
          "I sorted every city by population, ascending, and took the first row.",
      });
      return;
    }

    // intent === "unknown"
    setDynamicAnswer({
      question,
      title: "I'm not sure how to answer that yet",
      answer:
        "Try asking about state population, city population, veterans, median age, or the number of cities in the dataset.",
      explanation:
        "Your question didn't match any of the patterns this app currently understands.",
    });
  }

  return (
    <main>
      <header className="app-header">
        <h1>US Cities Explorer</h1>
        <p className="subtitle">
          {rows.length.toLocaleString()} cities · Total population{" "}
          {(totalPop / 1_000_000).toFixed(1)}M · Avg median age{" "}
          {avgMedianAge.toFixed(1)}
        </p>
      </header>

      <QuestionBox onAsk={handleQuestion} />
      <AnswerCard answer={dynamicAnswer} />

      {/* STAT CARDS ROW */}
      {rows.length > 0 && (
        <section className="dashboard">
          <div className="stat-cards-row">
            <StatCard
              icon="🏙️"
              title="Total cities"
              value={rows.length.toLocaleString()}
              subtitle="in dataset"
            />
            <StatCard
              icon="👥"
              title="Total population"
              value={formatNumber(totalPop)}
              subtitle="across all cities"
            />
            <StatCard
              icon="📅"
              title="Avg median age"
              value={avgAge.toFixed(1)}
              subtitle="years"
            />
            <StatCard
              icon="🎖️"
              title="Most veterans"
              value={topVeteranState.name}
              subtitle={`${formatNumber(topVeteranState.value)} total`}
            />
          </div>

          {/* CHARTS ROW */}
          <div className="charts-row">
            {/* Chart 1: horizontal bar list — top states by population */}
            <div className="chart-card">
              <h3 className="chart-title">Top States by Population</h3>
              <MiniBarList data={topStates} />
            </div>

            {/* Chart 2: donut — city size distribution */}
            <div className="chart-card">
              <h3 className="chart-title">Cities by Size</h3>
              <MiniDonut data={popBuckets} />
            </div>

            {/* Chart 3: area trend — top states by veterans */}
            <div className="chart-card">
              <h3 className="chart-title">Top States by Veterans</h3>
              <TrendCard
                title=""
                value=""
                subtitle=""
                data={veteransByState}
                color="#0D7377"
              />
            </div>
          </div>
        </section>
      )}

      <div className="controls">
        <input
          type="search"
          placeholder="Filter by city or state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <span className="row-count">{displayRows.length} rows shown</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={sortKey === col.key ? "sorted" : ""}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.slice(0, 200).map((row, i) => (
              <tr key={i}>
                <td>{row.city}</td>
                <td>{row.state}</td>
                <td className="num">{row.population.toLocaleString()}</td>
                <td className="num">{row.medianAge}</td>
                <td className="num">{row.malePopulation.toLocaleString()}</td>
                <td className="num">{row.femalePopulation.toLocaleString()}</td>
                <td className="num">{row.totalVeterans.toLocaleString()}</td>
                <td className="num">{row.foreignBorn.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
/*
Why key={col.key} and key={i} on list items? Whenever you use .map() to render a list in React, every element needs a unique key prop. React uses this to efficiently update only the items that changed, instead of re-rendering the whole list. The key must be unique among siblings — a column key or row index works here.
What is value={search} + onChange={(e) => setSearch(e.target.value)}? This is a controlled input — React owns the value. value={search} means the input always displays whatever is in the search state. onChange fires every time the user types, updating the state, which re-renders the input with the new value. This is how React keeps the UI and the data in sync.
What is {" "}? A way to insert a literal space in JSX. JSX collapses whitespace like HTML, so sometimes you need this to prevent words from running together.
 */
