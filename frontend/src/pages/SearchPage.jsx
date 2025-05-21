import { useState } from "react";
import Navbar from "../components/Navbar";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { ORIGINAL_IMG_BASE_URL } from "../utils/contants";
import { Link } from "react-router-dom";
import { useContentStore } from "../../store/content";

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState("movie");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const { setContentType } = useContentStore();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    tab === "movie" ? setContentType("movie") : setContentType("tv");
    setResults([]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`/api/v1/search/${activeTab}/${searchTerm}`);
      setResults(res.data.content);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error(
          "Nothing found, make sure you are searching under the right category"
        );
      } else {
        toast.error("An error occurred, please try again later");
      }
    }
  };

  // Filter results based on your logic
  let filteredResults = [];
  if (activeTab === "person") {
    filteredResults = results.filter((result) => {
      const hasProfile = !!result.profile_path;
      const knownForWithPoster = result.known_for?.find(
        (kf) => kf.poster_path
      );
      return hasProfile || knownForWithPoster;
    });
  } else {
    filteredResults = results.filter((result) => result.poster_path);
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center gap-3 mb-4">
          {["movie", "tv", "person"].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 rounded ${
                activeTab === tab ? "bg-red-600" : "bg-gray-800"
              } hover:bg-red-700`}
              onClick={() => handleTabClick(tab)}
            >
              {tab === "tv" ? "TV Shows" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2 items-stretch mb-8 max-w-2xl mx-auto"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={"Search for a " + activeTab}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
          <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded">
            <Search className="size-6" />
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredResults.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 mt-10">
              No results matched your search. Please try something else.
            </div>
          ) : (
            filteredResults.map((result) => {
              if (activeTab === "person") {
                const hasProfile = !!result.profile_path;
                const knownForWithPoster = result.known_for?.find(
                  (kf) => kf.poster_path
                );

                const imagePath = hasProfile
                  ? ORIGINAL_IMG_BASE_URL + result.profile_path
                  : ORIGINAL_IMG_BASE_URL + knownForWithPoster.poster_path;

                return (
                  <div
                    key={result.id}
                    className="bg-gray-800 p-4 rounded text-center"
                  >
                    <img
                      src={imagePath}
                      alt={result.name}
                      className="max-h-96 rounded mx-auto object-cover"
                    />
                    <h2 className="mt-2 text-xl font-bold">{result.name}</h2>
                  </div>
                );
              }

              return (
                <div key={result.id} className="bg-gray-800 p-4 rounded">
                  <Link
                    to={"/watch/" + result.id}
                    onClick={() => {
                      setContentType(activeTab);
                    }}
                  >
                    <img
                      src={ORIGINAL_IMG_BASE_URL + result.poster_path}
                      alt={result.title || result.name}
                      className="w-full h-auto rounded"
                    />
                    <h2 className="mt-2 text-xl font-bold">
                      {result.title || result.name}
                    </h2>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
