const express = require('express');
const cors = require('cors')
const mysql = require('mysql')
 
const HTTP_PORT = 8000

const app = express();

app.use(cors());
app.use(express.json());
 
const ConNuzlocke = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Mickey2023!",
    database:"nuzlockedatabase"
})

app.get("/games", (req, res, next) => { //Gets data for all created games
    let strCommand = "SELECT * FROM tblGames"; 

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" }); 
                }

                res.status(200).json({ status: "success", games: result });
            });
        }
    });
});



app.get("/encounters", (req, res, next) => // Retrieves all encounters for a specific game based on game_id
{ 
    let strGameID = req.query.game_id;
    let strCommand = "SELECT * FROM tblEncounters WHERE GameID = ?";

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strGameID], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                res.status(200).json({ status: "success", encounters: result });
            });
        }
    });
});




app.get("/pairs", (req, res, next) => // Retrieves all pairs associated with a specific game
{ 
    let strGameID = req.query.game_id;
    let strCommand = 
        "SELECT tblPairs.PairID, tblPairs.FirstPair, tblPairs.SecondPair, tblPairs.Rostered, " +
        "e1.GameID AS FirstGameID, e2.GameID AS SecondGameID " +
        "FROM tblPairs " +
        "JOIN tblEncounters e1 ON tblPairs.FirstPair = e1.EncounterID " +
        "JOIN tblEncounters e2 ON tblPairs.SecondPair = e2.EncounterID " +
        "WHERE e1.GameID = ? OR e2.GameID = ?"; 

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strGameID, strGameID], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                res.status(200).json({ status: "success", pairs: result });
            });
        }
    });
});



app.post("/games", (req, res, next) => // Posts new game data to tblGames  
{   
    let strGameName = req.body.game_name;
    let strGeneration = req.body.generation;
    let strChallengeType = req.body.challenge_type;
    let strChallengeNotes = req.body.challenge_notes;
    
    let strCommand = 
        "INSERT INTO tblGames (GameName, Generation, ChallengeType, ChallengeNotes) " + 
        "VALUES (?, ?, ?, ?)";

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strGameName, strGeneration, strChallengeType, strChallengeNotes], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                res.status(201).json({ 
                    status: "success", 
                    game_id: result.insertId, 
                    message: "Game added successfully" 
                });
            });
        }
    });
});



app.post("/encounters", (req, res, next) => // Posts new encounter data to tblEncounters  
{   
    let strGameID = req.body.game_id;
    let strEncounter = req.body.encounter;
    let strPrimaryType = req.body.primary_type;
    let strCaught = req.body.caught;
    let strAlive = req.body.alive;
    let strLocation = req.body.location;

    let strCommand = 
        "INSERT INTO tblEncounters (GameID, Encounter, PrimaryType, Caught, Alive, Location) " + 
        "VALUES (?, ?, ?, ?, ?, ?)";

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strGameID, strEncounter, strPrimaryType, strCaught, strAlive, strLocation], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                res.status(201).json({ 
                    status: "success", 
                    encounter_id: result.insertId, 
                    message: "Encounter added successfully" 
                });
            });
        }
    });
});



app.post("/pairs", (req, res, next) => // Posts new pair data to tblPairs  
{   
    let strFirstPair = req.body.first_pair;
    let strSecondPair = req.body.second_pair;
    let strRostered = req.body.rostered;

    let strCommand = 
        "INSERT INTO tblPairs (FirstPair, SecondPair, Rostered) " + 
        "VALUES (?, ?, ?)";

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strFirstPair, strSecondPair, strRostered], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                res.status(201).json({ 
                    status: "success", 
                    pair_id: result.insertId, 
                    message: "Pair added successfully" 
                });
            });
        }
    });
});



app.delete("/games", (req, res, next) => // Deletes game data from tblGames  
{   
    let strGameID = req.query.game_id; 
    let strCommand = "DELETE FROM tblGames WHERE GameID = ?"; 

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err); 
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strGameID], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                if (result.affectedRows > 0) 
                {
                    return res.status(200).json({
                        status: "success", game_id: strGameID, message: "Game deleted successfully" 
                    });
                } 
                else 
                {
                    return res.status(404).json({
                        status: "error", message: "Game not found or already deleted" 
                    });
                }
            });
        }
    });
});



app.delete("/encounters", (req, res, next) => // Deletes selected encounter from tblEncounters  
{   
    let strEncounterID = req.query.encounter_id; 
    let strCommand = "DELETE FROM tblEncounters WHERE EncounterID = ?"; 

    if (!strEncounterID) 
    {
        return res.status(400).json({ status: "error", message: "encounter_id is required" });
    }

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err); 
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strEncounterID], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                if (result.affectedRows > 0) 
                {
                    return res.status(200).json({
                        status: "success", encounter_id: strEncounterID, message: "Encounter deleted successfully" 
                    });
                } 
                else 
                {
                    return res.status(404).json({
                        status: "error", message: "Encounter not found or already deleted" 
                    });
                }
            });
        }
    });
});



app.delete("/pairs", (req, res, next) => // Deletes selected pair from tblPairs  
{   
    let strPairID = req.query.pair_id; 
    let strCommand = "DELETE FROM tblPairs WHERE PairID = ?"; 

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.log(err); 
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strPairID], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                if (result.affectedRows > 0) 
                {
                    return res.status(200).json({
                        status: "success", pair_id: strPairID, message: "Pair deleted successfully" 
                    });
                } 
                else 
                {
                    return res.status(404).json({
                        status: "error", message: "Pair not found or already deleted" 
                    });
                }
            });
        }
    });
});



app.get("/games/generation", (req, res, next) => // Gets generation for specified gameID  
{    
    let strGameID = req.query.game_id; 
    let strCommand = "SELECT Generation FROM tblGames WHERE GameID = ?";

    if (!strGameID) 
    {
        return res.status(400).json({ status: "error", message: "game_id is required" });
    }

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.error("Database Connection Error:", err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strGameID], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                if (result.length > 0) 
                {
                    return res.status(200).json({ 
                        status: "success", generation: result[0].Generation 
                    });
                } 
                else 
                {
                    return res.status(404).json({ status: "error", message: "Game not found" });
                }
            });
        }
    });
});



app.get("/encounters/game", (req, res, next) => // Gets gameID for specified encounter  
{    
    let strEncounterID = req.query.encounter_id;  
    let strCommand = "SELECT GameID FROM tblEncounters WHERE EncounterID = ?";

    if (!strEncounterID) 
    {
        return res.status(400).json({ status: "error", message: "encounter_id is required" });
    }

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.error("Database Connection Error:", err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strEncounterID], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                if (result.length > 0) 
                {
                    return res.status(200).json({ 
                        status: "success", game_id: result[0].GameID 
                    });
                } 
                else 
                {
                    return res.status(404).json({ 
                        status: "error", message: "Encounter not found while trying to find gameID" 
                    });
                }
            });
        }
    });
});



app.get("/encounters/type", (req, res, next) => // Gets primaryType for specified encounter  
{    
    let strEncounterID = req.query.encounter_id;  
    let strCommand = "SELECT PrimaryType FROM tblEncounters WHERE EncounterID = ?";

    if (!strEncounterID) 
    {
        return res.status(400).json({ status: "error", message: "encounter_id is required" });
    }

    ConNuzlocke.getConnection(function (err, connection) 
    {
        if (err) 
        {
            console.error("Database Connection Error:", err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 
        else 
        {
            connection.query(strCommand, [strEncounterID], (err, result) => 
            {  
                connection.release();

                if (err) 
                {
                    console.error("Query Error:", err);
                    return res.status(500).json({ status: "error", message: "Query execution failed" });
                }

                if (result.length > 0) 
                {
                    return res.status(200).json({ 
                        status: "success", primary_type: result[0].PrimaryType 
                    });
                } 
                else 
                {
                    return res.status(404).json({ 
                        status: "error", message: "Encounter not found while trying to find primaryType" 
                    });
                }
            });
        }
    });
});



app.get("/games/list", (req, res, next) => // Gets all game names  
{                        
    let strCommand = "SELECT GameID, GameName FROM tblGames";

    ConNuzlocke.getConnection((err, connection) => 
    {
        if (err) 
        {
            console.error("Database Connection Error:", err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        } 

        connection.query(strCommand, (err, result) => 
        {   
            connection.release(); 

            if (err) 
            {
                console.error("Query Error:", err);
                return res.status(500).json({ status: "error", message: "Query execution failed" });
            }

            if (result.length > 0) 
            {
                return res.status(200).json({ 
                    status: "success", games: result 
                });
            } 
            else 
            {
                return res.status(404).json({ status: "error", message: "No games found" });
            }
        });
    });
});



app.get("/encounter/alive", (req, res, next) => // Gets alive status and name for a specific encounter  
{  
    let encounterID = req.query.encounter_id;

    if (!encounterID) {
        return res.status(400).json({ status: "error", message: "encounter_id is required" });
    }

    let strCommand = "SELECT Encounter, Alive FROM tblEncounters WHERE EncounterID = ?";

    ConNuzlocke.getConnection((err, connection) => 
    {
        if (err) 
        {
            console.error("Database Connection Error:", err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }

        connection.query(strCommand, [encounterID], (err, result) => 
        {
            connection.release(); // Release connection after query execution

            if (err) 
            {
                console.error("Query Error:", err);
                return res.status(500).json({ status: "error", message: "Query execution failed" });
            }

            if (result.length > 0) 
            {
                return res.status(200).json({ 
                    status: "success", 
                    encounter_id: encounterID, 
                    encounter_name: result[0].Encounter, 
                    alive: result[0].Alive 
                });
            } 
            else 
            {
                return res.status(404).json({ status: "error", message: "Encounter not found" });
            }
        });
    });
});



app.get("/game/challenge-type", (req, res, next) => {  
    // Gets ChallengeType for a specific game
    let gameID = req.query.game_id;

    if (!gameID) {
        return res.status(400).json({ status: "error", message: "game_id is required" });
    }

    let strCommand = "SELECT ChallengeType FROM tblGames WHERE GameID = ?";

    ConNuzlocke.getConnection((err, connection) => {
        if (err) {
            console.error("Database Connection Error:", err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }

        connection.query(strCommand, [gameID], (err, result) => {
            connection.release(); // Ensure connection is released after the query

            if (err) {
                console.error("Query Error:", err);
                return res.status(500).json({ status: "error", message: "Query execution failed" });
            }

            if (result.length > 0) {
                return res.status(200).json({ 
                    status: "success", 
                    game_id: gameID, 
                    challenge_type: result[0].ChallengeType 
                });
            } else {
                return res.status(404).json({ status: "error", message: "Game not found" });
            }
        });
    });
});



app.put("/games/update-trainer1", (req, res, next) => // updates Trainer1 name from specified GameID
{
    const { gameID, trainer1 } = req.body; 

    if (!gameID || !trainer1) 
    {
        return res.status(400).json({ status: "error", message: "Missing gameID or trainer2" });
    }

    let strCommand = "UPDATE tblGames SET Trainer1 = ? WHERE GameID = ?";

    ConNuzlocke.getConnection((err, connection) => 
    {
        if (err) 
        {
            console.error("Database Connection Error:", err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }

        connection.query(strCommand, [trainer1, gameID], (err, result) => 
        {
            connection.release(); 

            if (err) 
            {
                console.error("Query Error:", err);
                return res.status(500).json({ status: "error", message: "Query execution failed" });
            }

            if (result.affectedRows > 0) 
            {
                return res.status(200).json({ 
                    status: "success", message: `Trainer1 updated for GameID ${gameID}` 
                });
            } 
            else 
            {
                return res.status(404).json({ status: "error", message: "Game not found or no changes made" });
            }
        });
    });
});



app.put("/games/update-trainer2", (req, res, next) => // updates Trainer2 name from specified GameID
{
    const { gameID, trainer2 } = req.body; 

    if (!gameID || !trainer2) 
    {
        return res.status(400).json({ status: "error", message: "Missing gameID or trainer2" });
    }

    let strCommand = "UPDATE tblGames SET Trainer2 = ? WHERE GameID = ?";

    ConNuzlocke.getConnection((err, connection) => 
    {
        if (err) 
        {
            console.error("Database Connection Error:", err);
            return res.status(500).json({ status: "error", message: "Database connection failed" });
        }

        connection.query(strCommand, [trainer2, gameID], (err, result) => 
        {
            connection.release(); 

            if (err) 
            {
                console.error("Query Error:", err);
                return res.status(500).json({ status: "error", message: "Query execution failed" });
            }

            if (result.affectedRows > 0) 
            {
                return res.status(200).json({ 
                    status: "success", message: `Trainer2 updated for GameID ${gameID}` 
                });
            } 
            else 
            {
                return res.status(404).json({ status: "error", message: "Game not found or no changes made" });
            }
        });
    });
});



app.listen(HTTP_PORT, () => {
    console.log(`Server is running on port ${HTTP_PORT}`);
});