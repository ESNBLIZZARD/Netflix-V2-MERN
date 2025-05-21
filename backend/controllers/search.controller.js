import { User } from "../models/user.model.js";
import { fetchFromTMDB } from "../services/tmdb.service.js";

export async function searchMovie(req, res) {
    const { query } = req.params;
    try {
        const response = await fetchFromTMDB(
        `https://api.themoviedb.org/3/search/movie?query=${query}&language=en-US&page=1`
        );
        if (response.results.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "No results found" });
        }
    
        await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: {
            searchHistory: {
                id: response.results[0].id,
                image: response.results[0].poster_path,
                title: response.results[0].title,
                searchType: "movie",
                createdAt: new Date()
            },
            },
        },
        );
    
        res.status(200).json({ success: true, content: response.results });
    } catch (error) {
        console.log("Error in searchMovie controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function searchTv(req, res) {
    const { query } = req.params;
    try {
        const response = await fetchFromTMDB(
        `https://api.themoviedb.org/3/search/tv?query=${query}&language=en-US&page=1`
        );
        if (response.results.length === 0) {
        return res.status(404).json({ success: false, message: "No results found" });
        }
    
        await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: {
            searchHistory: {
                id: response.results[0].id,
                image: response.results[0].poster_path,
                title: response.results[0].name,
                searchType: "tv",
                createdAt: new Date()
            },
            },
        },
        );
    
        res.status(200).json({ success: true, content: response.results });
    } catch (error) {
        console.log("Error in searchTv controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function searchPerson(req, res) {
  const { query } = req.params;
  try {
    const response = await fetchFromTMDB(
      `https://api.themoviedb.org/3/search/person?query=${query}&language=en-US&page=1`
    );
    if (response.results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No results found" });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          searchHistory: {
            id: response.results[0].id,
            image: response.results[0].poster_path,
            title: response.results[0].title,
            searchType: "Movie",
            createdAt: new Date()
          },
        },
      },
    );

    res.status(200).json({ success: true, content: response.results });
  } catch (error) {
    console.log("Error in searchPerson controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getSearchHistory(req, res) {
    try {
        res.status(200).json({ success: true, content: req.user.searchHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function removeFromSearchHistory(req, res) {
    let { id } = req.params;
    id = parseInt(id); // Convert id to an integer(req.params returns string)
   try {
    await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            searchHistory: { id: id },
        },
    });
    res.status(200).json({ success: true, message: "Search history Deleted" });
   } catch (error) {
    console.log("Error in removeFromSearchHistory controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
   }
}
