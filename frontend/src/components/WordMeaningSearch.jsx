import React, { useState } from "react";

export default function WordMeaningPanel() {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMeaning = async (w) => {
    if (!w) return;
    setLoading(true);
    setError("");
    setDefinition(null);
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`
      );
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("No definition found.");
      const def = data[0]?.meanings?.[0]?.definitions?.[0]?.definition;
      setDefinition(def || "Meaning not available.");
    } catch (err) {
        console.log(`Exception while doing something: ${err}`);
        setError("Could not fetch meaning. Try another word.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMeaning(word.trim().toLowerCase());
  };

  return (
    <div className="w-80 min-w-[18rem] p-4 border-l border-gray-300 bg-gray-50 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Word Meaning Lookup
      </h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter a word"
          className="flex-1 p-2 border rounded-md"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-sm text-gray-600">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {definition && !error && (
        <div className="bg-white border rounded-md p-3 text-sm text-gray-800 shadow-sm">
          {definition}
        </div>
      )}
    </div>
  );
}
