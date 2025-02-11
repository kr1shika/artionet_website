const Saveart = require("../model/save_arts");

const findAll = async (req, res) => {
    try {
        const savearts = await Saveart.find().populate(["art_id", "buyer_id"]);
        res.status(200).json(savearts);
    } catch (e) {
        res.json(e);
    }
}

const save = async (req, res) => {
    try {
        const { art_id, buyer_id } = req.body;
        if (!art_id || !buyer_id) {
            return res.status(400).json({ error: "art_id and buyer_id are required" });
        }

        // Check if the art is already liked by the user
        const existingSave = await Saveart.findOne({ art_id, buyer_id });

        if (existingSave) {
            // If already liked, return a response indicating so
            return res.status(400).json({ message: "Art already liked by this user" });
        }

        const savearts = new Saveart({
            art_id,
            buyer_id,
            status: "liked",
        });

        await savearts.save();
        res.status(201).json(savearts);
    } catch (e) {
        res.status(500).json({ error: "Failed to save art", details: e.message });
    }
};

const deleteSaveart = async (req, res) => {
    try {
        const { art_id, buyer_id } = req.body;
        if (!art_id || !buyer_id) {
            return res.status(400).json({ error: "art_id and buyer_id are required" });
        }

        const savedArt = await Saveart.findOne({ art_id, buyer_id });

        if (!savedArt) {
            return res.status(404).json({ message: "Saved art not found" });
        }

        await Saveart.deleteOne({ art_id, buyer_id });

        res.status(200).json({ message: "Saved art removed successfully" });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete saved art", details: e.message });
    }
};

const checkStatus = async (req, res) => {
    try {
        const { artId } = req.params;
        const { buyer_id } = req.query;

        if (!artId || !buyer_id) {
            return res.status(400).json({ error: "artId and buyer_id are required" });
        }

        const savedArt = await Saveart.findOne({ art_id: artId, buyer_id });

        // Return the like status
        const isLiked = !!savedArt && savedArt.status === "liked";
        return res.status(200).json({ isLiked });
    } catch (error) {
        res.status(500).json({ error: "Failed to check status", details: error.message });
    }
};

const findSavedArtsByUser = async (req, res) => {
    try {
        const { buyer_id } = req.params;

        if (!buyer_id) {
            return res.status(400).json({ error: "buyer_id is required" });
        }

        const savedArts = await Saveart.find({ buyer_id }).populate("art_id");

        if (!savedArts.length) {
            return res.status(404).json({ message: "No saved artworks found for this user" });
        }

        res.status(200).json(savedArts);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch saved artworks", details: e.message });
    }
};

const getSavedCount = async (req, res) => {
    try {
        const { art_id } = req.params;

        if (!art_id) {
            return res.status(400).json({ error: "art_id is required" });
        }

        // Count the number of saves for the given artwork
        const saveCount = await Saveart.countDocuments({ art_id });

        res.status(200).json({ art_id, saveCount });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch saved count", details: error.message });
    }
};

module.exports = {
    findAll,
    save,
    deleteSaveart,
    checkStatus,
    findSavedArtsByUser, getSavedCount
}
