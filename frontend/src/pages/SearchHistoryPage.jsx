import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { SMALL_IMG_BASE_URL } from "../utils/contants";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";

function formatDate(dateString) {
  // Create a Date object from the input date string
  const date = new Date(dateString);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Extract the month, day, and year from the Date object
  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  // Return the formatted date string
  return `${month} ${day}, ${year}`;
}

const SearchHistoryPage = () => {
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const getSearchHistory = async () => {
      try {
        const response = await fetch("/api/v1/search/history");
        //   if (!response.ok) {
        //     throw new Error("Failed to fetch search history");
        //   }
        const data = await response.json();
        setSearchHistory(data?.content || []);
      } catch (error) {
        console.error("Error fetching search history:", error);
        setSearchHistory([]);
      }
    };

    getSearchHistory();
  }, []);

  const handleDelete = async (entry) => {
    try {
      await axios.delete(`/api/v1/search/history/${entry.id}`);
      setSearchHistory(searchHistory.filter((item) => item.id !== entry.id));
    } catch (error) {
      toast.error("Failed to delete search item", error);
    }
  };

  if (searchHistory?.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Search History</h1>
          <div className="flex justify-center items-center h-96">
            <p className="text-xl">No search history found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search History</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3  gap-4">
          {searchHistory
            .filter((entry) => entry.title)
            .map((entry, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg flex items-start"
              >
                {entry.image ? (
                  <img
                    src={SMALL_IMG_BASE_URL + entry.image}
                    alt="History image"
                    className="size-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="size-16 rounded-full mr-4" />
                )}
                <div className="flex flex-col">
                  <span className="text-white text-lg">{entry.title}</span>
                  <span className="text-gray-400 text-sm">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
                <span
                  className={`py-1 px-3 min-w-20 text-center rounded-full text-sm  ml-auto ${
                    entry.searchType === "movie"
                      ? "bg-red-600"
                      : entry.searchType === "tv"
                      ? "bg-blue-600"
                      : "bg-green-600"
                  }`}
                >
                  {entry.searchType[0].toUpperCase() +
                    entry.searchType.slice(1)}
                </span>
                <Trash
                  className="size-6 ml-4 cursor-pointer hover:fill-red-600 hover:text-red-600 shrink-0" 
                  onClick={() => handleDelete(entry)}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SearchHistoryPage;
