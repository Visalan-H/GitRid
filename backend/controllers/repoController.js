const { fetchAllRepos } = require("../services/github");

exports.getAllRepos = async (req, res) => {
  try {
    const user = req.user;
    const repos = await fetchAllRepos(user.accessToken);
    
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
