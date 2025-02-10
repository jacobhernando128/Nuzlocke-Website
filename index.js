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



app.get("/games", (req, res, next) => {                 //gets data for all created games
    let strCommand = "SELECT * FROM tblGames"; 

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            ConNuzlocke.query(strCommand, function (err, result) {  
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: "error", message: err });
                } else {
                    res.status(200).json({ status: "success", games: result }); 
                }
            });
        }
    });
});



app.get("/encounters", (req, res, next) => {            //gets data for all posted encounters for specific game
    let strGameID = req.query.game_id;
    let strCommand = "SELECT * FROM tblEncounters WHERE GameID = ?";

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            ConNuzlocke.query(strCommand, [strGameID], function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: "error", message: err });
                } else {
                    res.status(200).json({ status: "success", game_id: result });
                }
            });
        }
    });
});



app.get("/pairs", (req, res, next) => {                 //gets data for all posted pairs
    let strGameID = req.query.game_id;
    let strCommand = "SELECT tblPairs.PairID, tblPairs.FirstPair, tblPairs.SecondPair, tblPairs.Rostered, e1.GameID AS FirstGameID, e2.GameID AS SecondGameID FROM tblPairs JOIN tblEncounters e1 ON tblPairs.FirstPair = e1.EncounterID JOIN tblEncounters e2 ON tblPairs.SecondPair = e2.EncounterID WHERE e1.GameID = ? OR e2.GameID = ?"; 

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            ConNuzlocke.query(strCommand, [strGameID, strGameID] , function (err, result) {  
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: "error", message: err });
                } else {
                    res.status(200).json({ status: "success", pairs: result }); 
                }
            });
        }
    });
});



app.post("/games", (req, res, next) => {            //posts new game data to tblGames
    let strGameName = req.body.game_name;
    let strGeneration = req.body.generation;
    let strChallengeType = req.body.challenge_type;
    let strChallengeNotes = req.body.challenge_notes;
    
    let strCommand = "INSERT INTO tblGames (GameName, Generation, ChallengeType, ChallengeNotes) VALUES (?, ?, ?, ?)";

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            ConNuzlocke.query(
                strCommand,
                [strGameName, strGeneration, strChallengeType, strChallengeNotes], 
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ status: "error", message: err });
                    } else {
                        res.status(201).json({ status: "success", game_id: result.insertId, message: "Game added successfully" });
                    }
                }
            );
        }
    });
});



app.post("/encounters", (req, res, next) => {           //posts new encounter data to tblEncounters
    let strGameID = req.body.game_id;
    let strEncounter = req.body.encounter;
    let strPrimaryType = req.body.primary_type;
    let strCaught = req.body.caught;
    let strAlive = req.body.alive;
    let strLocation = req.body.location;

    let strCommand = "INSERT INTO tblEncounters (GameID, Encounter, PrimaryType, Caught, Alive, Location) VALUES (?, ?, ?, ?, ?, ?)";

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            ConNuzlocke.query(
                strCommand,
                [strGameID, strEncounter, strPrimaryType, strCaught, strAlive, strLocation],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ status: "error", message: err });
                    } else {
                        res.status(201).json({
                            status: "success", encounter_id: result.insertId, message: "Encounter added successfully" });
                    }
                }
            );
        }
    });
});



app.post("/pairs", (req, res, next) => {                //posts new pair data to tblPairs
    let strFirstPair = req.body.first_pair;
    let strSecondPair = req.body.second_pair;
    let strRostered = req.body.rostered;

    let strCommand = "INSERT INTO tblPairs (FirstPair, SecondPair, Rostered) VALUES (?, ?, ?)";

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            ConNuzlocke.query(
                strCommand,
                [strFirstPair, strSecondPair, strRostered],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ status: "error", message: err });
                    } else {
                        res.status(201).json({
                            status: "success", pair_id: result.insertId, message: "Pair added successfully" });
                    }
                }
            );
        }
    });
});



app.delete("/games", (req, res, next) => {              //deletes game data from tblGames
    let strGameID = req.query.game_id; 
    let strCommand = "DELETE FROM tblGames WHERE GameID = ?"; 

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err); 
            res.status(500).json({ status: "error", message: err }); 
        } else {
            ConNuzlocke.query(strCommand, [strGameID], function (err, result) {
                if (err) {
                    console.log(err); 
                    res.status(500).json({ status: "error", message: err }); 
                } else {
                    if (result.affectedRows > 0) {
                        res.status(200).json({
                            status: "success", game_id: strGameID, message: "Game deleted successfully" });
                    } else {
                        res.status(404).json({
                            status: "error", message: err });
                    }
                }
            });
        }
    });
});



app.delete("/pairs", (req, res, next) => {              // deletes selected pair from tblPairs
    let strPairID = req.query.pair_id; 
    let strCommand = "DELETE FROM tblPairs WHERE PairID = ?"; 

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err); 
            res.status(500).json({ status: "error", message: err }); 
        } else {
            ConNuzlocke.query(strCommand, [strPairID], function (err, result) {
                if (err) {
                    console.log(err); 
                    res.status(500).json({ status: "error", message: err }); 
                } else {
                    if (result.affectedRows > 0) {
                        res.status(200).json({
                            status: "success", pair_id: strPairID, message: "Pair deleted successfully" });
                    } else {
                        res.status(404).json({
                            status: "error", message: err });
                    }
                }
            });
        }
    });
});



app.delete("/pairs", (req, res, next) => {              // deletes selected pair from tblPairs
    let strPairID = req.query.pair_id; 
    let strCommand = "DELETE FROM tblPairs WHERE PairID = ?"; 

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err); 
            res.status(500).json({ status: "error", message: err }); 
        } else {
            ConNuzlocke.query(strCommand, [strPairID], function (err, result) {
                if (err) {
                    console.log(err); 
                    res.status(500).json({ status: "error", message: err }); 
                } else {
                    if (result.affectedRows > 0) {
                        res.status(200).json({
                            status: "success", pair_id: strPairID, message: "Pair deleted successfully" });
                    } else {
                        res.status(404).json({
                            status: "error", message: err });
                    }
                }
            });
        }
    });
});



app.delete("/encounters", (req, res, next) => { // Deletes selected encounter from tblEncounters
    let strEncounterID = req.query.encounter_id; 
    let strCommand = "DELETE FROM tblEncounters WHERE EncounterID = ?"; 

    if (!strEncounterID) {
        return res.status(400).json({ status: "error", message: "encounter_id is required" });
    }

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err); 
            res.status(500).json({ status: "error", message: err }); 
        } else {
            ConNuzlocke.query(strCommand, [strEncounterID], function (err, result) {
                if (err) {
                    console.log(err); // Log query error
                    res.status(500).json({ status: "error", message: err }); 
                } else {
                    if (result.affectedRows > 0) {
                        res.status(200).json({ 
                            status: "success", encounter_id: strEncounterID, message: "Encounter deleted successfully" });
                    } else {
                        res.status(404).json({
                            status: "error",
                            message: `Encounter deleted successfully`,
                        });
                    }
                }
            });
        }
    });
});



app.get("/games/generation", (req, res, next) => {                    //gets generation for specified gameID
    let strGameID = req.query.game_id;
    
    let strCommand = "SELECT Generation FROM tblGames WHERE GameID = ?";

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            connection.query(strCommand, [strGameID], function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: "error", message: err });
                } else {
                    if (result.length > 0) {
                        res.status(200).json({ 
                            status: "success", generation: result[0].Generation });
                    } else {
                        res.status(404).json({ status: "error", message: "Game not found" });
                    }
                }
            });
        }
    });
});



app.get("/encounters/game", (req, res, next) => {               //gets gameID for specified encounter
    let strEncounterID = req.query.encounter_id;  

    let strCommand = "SELECT GameID FROM tblEncounters WHERE EncounterID = ?";

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            connection.query(strCommand, [strEncounterID], function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: "error", message: err });
                } else {
                    if (result.length > 0) {
                        res.status(200).json({ 
                        status: "success", game_id: result[0].GameID });
                    } else {
                        res.status(404).json({ status: "error", message: "Encounter not found while trying to find gameID" });
                    }
                }
            });
        }
    });
});



app.get("/encounters/type", (req, res, next) => {               //gets primaryType for specified encounter
    let strEncounterID = req.query.encounter_id;  
    
    let strCommand = "SELECT PrimaryType FROM tblEncounters WHERE EncounterID = ?";

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            connection.query(strCommand, [strEncounterID], function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: "error", message: err });
                } else {
                    if (result.length > 0) {
                        res.status(200).json({ 
                            status: "success", primary_type: result[0].PrimaryType });
                    } else {
                        res.status(404).json({ status: "error", message: "Encounter not found while trying to find primaryType" });
                    }
                }
            });
        }
    });
});



app.get("/games/list", (req, res, next) => {                        //gets all game names 
    let strCommand = "SELECT GameID, GameName FROM tblGames";

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            connection.query(strCommand, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: "error", message: err });
                } else {
                    if (result.length > 0) {
                        res.status(200).json({ 
                            status: "success", games: result });
                    } else {
                        res.status(404).json({ status: "error", message: "No games found" });
                    }
                }
            });
        }
    });
});



app.get("/games/encounters", (req, res, next) => {              
    let strGameID = req.query.game_id;  
    
    let strCommand = `SELECT e.Encounter, e.PrimaryType AS Type, e.Caught, e.Alive, e.Location, COALESCE(pe.Encounter, 'None') AS PairedEncounter, g.ChallengeType AS GameType FROM tblEncounters e JOIN tblGames g ON e.GameID = g.GameID LEFT JOIN tblPairs p ON e.EncounterID = p.FirstPair LEFT JOIN tblEncounters pe ON p.SecondPair = pe.EncounterID WHERE e.GameID = ?;`;

    ConNuzlocke.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err });
        } else {
            connection.query(strCommand, [strGameID], function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(500).json({ status: "error", message: err });
                } else {
                    if (result.length > 0) {
                        res.status(200).json({ 
                            status: "success",
                            game_type: result[0].GameType,  
                            encounters: result 
                        });
                    } else {
                        res.status(404).json({ status: "error", message: "No encounters found for this game" });
                    }
                }
            });
        }
    });
});


app.listen(HTTP_PORT, () => {
    console.log(`Server is running on port ${HTTP_PORT}`);
});