let trainer1List;
let trainer2List;
let pairsList;
let deadEncounterList;       //declares encounter and dead encounters globally for updating purposes

async function fetchEncounters(gameID)          //updates the encounters list for the specified game
{
    trainer1List = document.getElementById("trainer1List");             //initializes lists for display
    trainer2List = document.getElementById("trainer2List")
    deadEncounterList = document.getElementById("deadEncounterList");
    let trainer1Name;
    let trainer2Name;

    try 
    {
        const response = await fetch(`http://localhost:8000/encounters?game_id=${gameID}`,            //fetches encounters and pairs for specefied game
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            },
        });

        if(!response.ok)
        {
            throw new Error(`HTTP error! Status: ${response.status}`);              //error if it cannot fetch
        }

        const data = await response.json();
        console.log("Fetched Encounters:", data);

        try 
        {
            const response = await fetch(`http://localhost:8000/trainers?game_id=${gameID}`,            //fetches trainer names for specefied game
            {
                method: "GET",
                headers: 
                {
                    "Content-Type": "application/json"
                },
            });

            if(!response.ok)
            {
                throw new Error(`HTTP error! Status: ${response.status}`);              //error if it cannot fetch
            }

            const trainerData = await response.json();                  
            trainer1Name = trainerData.trainers.Trainer1;               //assigns values for trainer names
            trainer2Name = trainerData.trainers.Trainer2;

        } catch (error) 
        {
            console.error("Error fetching first pair's alive value:", error);                 //error if form submission occurs
            alert("Failed to fetch first pair's alive value. Please try again later.");
        }

        trainer1List.innerHTML = ""                        //clears lists before posting new encounters
        trainer2List.innerHTML = ""
        deadEncounterList.innerHTML = "";

        console.log(trainer1Name);
        console.log(trainer2Name);

        if (data.status === "success" && Array.isArray(data.encounters) && data.encounters.length > 0)          //if the data is correctly defined and contains encounters
        {
            data.encounters.forEach(encounter =>                    //formats and appends each encounter to the list
            {
                let encounterBox = document.createElement("div");
                encounterBox.className = "encounter-box";
                encounterBox.innerHTML = `
                    <h3>${encounter.Encounter}</h3>
                    <p><strong>Type:</strong> ${encounter.PrimaryType}</p>
                    <p><strong>Location:</strong> ${encounter.Location}</p>
                    <p><strong>Caught:</strong> ${encounter.Caught ? "Yes" : "No"}</p>
                    <p><strong>Alive:</strong> ${encounter.Alive ? "Yes" : "No"}</p>
                    <p><strong>Nickname:</strong> ${encounter.Nickname}</p>
                `;

                encounterBox.addEventListener("click", () => 
                {
                    alert(`You selected ${encounter.Encounter} from ${encounter.Location}`);                //interacts on click
                });
        
                console.log(encounter.TrainerInput)
                if (encounter.Alive) 
                {
                    if (encounter.TrainerInput == trainer1Name) 
                    {
                        trainer1List.appendChild(encounterBox);                        // adds to Trainer1 encounter list if alive
                    } 
                    else if (encounter.TrainerInput == trainer2Name) 
                    {
                        trainer2List.appendChild(encounterBox);                        // adds to Trainer2 encounter list if alive
                    }
                } 
                else 
                {
                    let deadEncounterBox = document.createElement("div");
                    deadEncounterBox.className = "dead-encounter-box";
                    deadEncounterBox.innerHTML = `
                        <h3>${encounter.Encounter}</h3>
                        <p><strong>Location:</strong> ${encounter.Location}</p>
                    `;
                    deadEncounterList.appendChild(encounterBox);                    // adds to dead encounters list if not 
                }
            });
        } 
        else 
        {
            trainer1List.innerHTML = "<li>No encounters found.</li>";
            trainer2List.innerHTML = "<li>No encounters found.</li>";
            deadEncounterList.innerHTML = "<li>No dead encounters listed.</li>"; 
        }
    } catch (error) 
    {
        console.error("Error fetching encounters:", error); 
        alert("Failed to fetch encounters. Please try again later.");               //error if encounters cannot be loaded
    }
}

async function fetchPairs(gameID) 
{
    let firstPairAlive;
    let firstPairName;                              //defines variables for later use
    let secondPairAlive; 
    let secondPairName;
    pairsList = document.getElementById("pairsList");               //links to the pairsList HTML

    try 
    {
        const response = await fetch(`http://localhost:8000/pairs?game_id=${gameID}`,            //fetches encounters and pairs for specefied game
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            },
        });

        if(!response.ok)
        {
            throw new Error(`HTTP error! Status: ${response.status}`);              //error if it cannot fetch
        }

        const data = await response.json();
        console.log("Fetched Pairs:", data);

        pairsList.innerHTML = ""            //clears lists before posting new encounters

        if (data.status === "success" && Array.isArray(data.pairs) && data.pairs.length > 0)            //if the data is correctly defined and contains encounters
        {
            for (const pair of data.pairs)          //runs for each pair in data
            {
                try 
                {
                    const response = await fetch(`http://localhost:8000/encounter/alive?encounter_id=${pair.FirstPair}`,            //fetches encounters and pairs for specefied game
                    {
                        method: "GET",
                        headers: 
                        {
                            "Content-Type": "application/json"
                        },
                    });
        
                    if(!response.ok)
                    {
                        throw new Error(`HTTP error! Status: ${response.status}`);              //error if it cannot fetch
                    }
        
                    const firstPairData = await response.json();
                    firstPairAlive = firstPairData.alive;                   //assigns values for first pair's name and alive status
                    firstPairName = firstPairData.encounter_name;
        
                } catch (error) 
                {
                    console.error("Error fetching first pair's alive value:", error);                 //error if form submission occurs
                    alert("Failed to fetch first pair's alive value. Please try again later.");
                }
                
                try 
                {
                    const response = await fetch(`http://localhost:8000/encounter/alive?encounter_id=${pair.SecondPair}`,            //fetches encounters and pairs for specefied game
                    {
                        method: "GET",
                        headers: 
                        {
                            "Content-Type": "application/json"
                        },
                    });
        
                    if(!response.ok)
                    {
                        throw new Error(`HTTP error! Status: ${response.status}`);              //error if it cannot fetch
                    }
        
                    const secondPairData = await response.json();           //assigns values for second pair's name and alive status
                    secondPairAlive = secondPairData.alive;
                    secondPairName = secondPairData.encounter_name;
        
                } catch (error) 
                {
                    console.error("Error fetching second pair's alive value:", error);                 //error if form submission occurs
                    alert("Failed to fetch second pair's alive value. Please try again later.");
                }
        
                let pairBox = document.createElement("div");
                pairBox.className = "pair-box";
                pairBox.innerHTML = `
                    <h3>${firstPairName} & ${secondPairName}</h3>
                    <p><strong>Rostered:</strong> ${pair.Rostered ? "Yes" : "No"}</p>
                `;

                // Add interactivity on click
                pairBox.addEventListener("click", () => {
                    alert(`Pair: ${firstPairName} & ${secondPairName}\nRostered: ${pair.Rostered ? "Yes" : "No"}\nStatus: ${firstPairAlive && secondPairAlive ? "Alive" : "Fainted"}`);
                });
        
                if (firstPairAlive == 1 && secondPairAlive == 1) 
                {
                    pairsList.appendChild(pairBox);  // Adds to pair list if both encounters are alive
                } 
            };
        } 
    } catch
    {
        console.error("Error updating pair list:", error);                 //error if form submission occurs
        alert("Failed to update pair list. Please try again later.");
    }
}

async function updateLists(gameID)  //refreshes lists after any updates to the database
{
    pairsList = document.getElementById("pairsList");       //initializes pairsList for clearing if the challenge is a nuzlocke

    if (!gameID) 
    {
        pairsList.innerHTML = "";
        return;
    }

    try 
    {
        const response = await fetch(`http://localhost:8000/game/challenge-type?game_id=${gameID}`,            //fetches encounters and pairs for specefied game
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            },
        });

        if(!response.ok)
        {
            throw new Error(`HTTP error! Status: ${response.status}`);              //error if it cannot fetch
        }

        const data = await response.json();
        let currentGameType = data.challenge_type               //grabs challenge type to determine if fetchPairs() is necessary to call

        await fetchEncounters(gameID);              //calls fetchEncounters to update the encounter and dead encounter lists

        pairsList.innerHTML = "";

        if (currentGameType && currentGameType.toLowerCase() == "soul link")            
        {
            await fetchPairs(gameID);               //calls fetchPairs to update the pairs list only if the challenge type is a soul link
        }   

    } catch (error) 
    {
        console.error("Error fetching ChallengeType for gameID:", error);                 //error if form submission occurs
        alert("Failed to fetch ChallengeType for gameID. Please try again later.");
    }
}



document.getElementById('CreateGame').addEventListener('submit', async (event) =>           //creates game and posts to database
{
    event.preventDefault();         //prevents frontend from running before backend is done

    const gameName = document.getElementById("GameName").value;
    const generation = document.getElementById("generation").value;
    const challengeType = document.querySelector('input[name="challengeType"]:checked').value;              //initializes variables from HTML user input
    const challengeNotes = document.getElementById("challengeNotes").value;
    const trainer1 = document.getElementById("trainer1").value;
    const trainer2 = document.getElementById("trainer2").value;

    const gameData =                   //creates a payload of the game data
    {
        game_name: gameName,
        generation: generation,
        challenge_type: challengeType,
        challenge_notes: challengeNotes,
        trainer1: trainer1,
        trainer2: trainer2
    };

    try     
    {
        const response = await fetch("http://localhost:8000/games", 
        {
            method: "POST",
            headers: 
            {
                "Content-Type": "application/json",                     //prepares post for game by JSON
            },
            body: JSON.stringify(gameData),
        });

        const result = await response.json();

        if (response.ok) 
        {
            alert(`Game created successfully with ID: ${result.game_id}`);          //posts if successful
            await fetchGames();         //refreshes game selection once a new game is created
        } 

        else 
        {
            console.error(result.message);                  //error if unsuccessful post
            alert(`Error: ${result.message}`);
        }

    } catch (error) 
    {
        console.error("Error submitting form:", error);                 //error if form submission occurs
        alert("Failed to create the game. Please try again later.");
    }
});



document.addEventListener("DOMContentLoaded", async() =>            //autofills encounter input and posts encounter to database
{
    
    const pokemonInput = document.getElementById("encounterInput");
    const pokemonList = document.getElementById("pokemonList");                 //initializes variables from HTML user input and pokemonList used for autofill
    const form = document.getElementById("CreateEncounter");
    
    let pokemonData = [];  
    
    try 
    {
        const response = await fetch("PokemonList.json");           //fetches pokemon data from JSON
        const data = await response.json();
    
        if (data && Array.isArray(data.pokemon))                //if data is successfully posted and if the data in the JSON is valid
        {
            pokemonData = data.pokemon;
        }
    
        pokemonData.forEach(pokemon =>                  //autofills pokemon data 
        {
            let option = document.createElement("option");
            option.value = pokemon.name;
            pokemonList.appendChild(option);
        });
    } catch (error) 
    {
        console.error("Error loading Pokémon data:", error);            //error if JSON data cannot be loaded
    }
    
    form.addEventListener('submit', async (event) => 
    {
        event.preventDefault();         //prevents frontend from running before backend is done
    
        const selectedPokemon = pokemonData.find(p => p.name.toLowerCase() === pokemonInput.value.toLowerCase());           //finds existing pokemon from JSON
    
        if (selectedPokemon) 
        {               
            const gameID = document.getElementById("GameID").value;
            let generation = null;
            try 
            {
                const response = await fetch(`http://localhost:8000/games/generation?game_id=${gameID}`,                    //gets and assigns generation from corresponding gameId
                {
                    method: "GET",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    }
                });

                const result = await response.json(); 
                generation = result.generation; 
            
            } catch (error) 
            {
                console.error("Error fetching generation:", error); 
                alert("Failed to retrieve generation. Please try again later.");
            }
            
            let typeTemp;
            if (generation == "I" || generation == "II" || generation == "III" || generation == "IV" || generation == "V" )
            {
                typeTemp = selectedPokemon["type pre-fairy"] || selectedPokemon.primary_type;        //assigns type pre fairy if it exists, if not uses primary type for game generations 1-5
            }
            else                                                        
            {
                typeTemp = selectedPokemon.primary_type;          //assigns primary type for game generations that are 6+
            }
            const primaryType = typeTemp;
        
            const caughtValue = document.querySelector('input[name="caughtInput"]:checked').value;

            const isCaught = (caughtValue === "1") ? 1 : 0;           //automatically creates the encounter as alive if it is caught
            const aliveValue = isCaught ? 1 : 0;
    
            const locationValue = document.getElementById("locationInput").value;
            const nicknameValue = document.getElementById("nicknameInput").value;
            const trainerValue = document.getElementById("trainerNameInput").value;

            const encounterData =                   //creates a payload of the encounter data
            {
                game_id: gameID,
                encounter: selectedPokemon.name,
                primary_type: primaryType,
                caught: caughtValue,
                alive: aliveValue,
                location: locationValue,
                nickname: nicknameValue,
                trainer_name: trainerValue
            };
                
            try     
            {
                const response = await fetch("http://localhost:8000/encounters", 
                {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json",                 //prepares post for encounter by JSON
                    },
                    body: JSON.stringify(encounterData),
                });

                const result = await response.json();

                if (response.ok) 
                {
                    alert(`Encounter created successfully with ID: ${result.encounter_id}`);         //posts if successful
                    await updateLists(gameID);
                } 

                else 
                {o
                    console.error(result.message);                          //error if unsuccessful post
                    alert(`Error: ${result.message}`);
                }
            } catch (error) 
            {
                console.error("Error submitting form:", error);                     //error if form submission occurs
                alert("Failed to create the encounter. Please try again later.");            
            }
        }
    
        if (!selectedPokemon) 
        {
            alert("Please select a Pokémon from the list!");            //resets input if the user input does not exist in the array
            pokemonInput.value = "";  
        }
    });
});



document.getElementById('CreatePair').addEventListener('submit', async (event) =>       //creates pair and posts to backend
{
    event.preventDefault();         //prevents frontend from running before backend is done

    const firstPair = document.getElementById("firstPair").value;                               //initializes variables from HTML user input
    const secondPair = document.getElementById("secondPair").value;
    const rosterValue = document.querySelector('input[name="rosterInput"]:checked').value;
    
    const gameData =                   //creates a payload of the game data
    {
        first_pair: firstPair,
        second_pair: secondPair,
        rostered: rosterValue
    };

    let firstPairGame = null;
    let secondPairGame = null;
    let firstPairType = null;
    let secondPairType = null;

    try 
    {
        const response = await fetch(`http://localhost:8000/encounters/game?encounter_id=${firstPair}`,                    //gets and assigns gameID from corresponding first pair
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json(); 
        firstPairGame = result.game_id; 
            
    } catch (error) 
    {
        console.error("Error fetching game ID for first pair:", error); 
        alert("Failed to retrieve game ID. Please try again later.");
    }

    try 
    {
        const response = await fetch(`http://localhost:8000/encounters/game?encounter_id=${secondPair}`,                    //gets and assigns gameID from corresponding second pair
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json(); 
        secondPairGame = result.game_id; 
            
    } catch (error) 
    {
        console.error("Error fetching game ID for second pair:", error); 
        alert("Failed to retrieve game ID. Please try again later.");
    } 

    try 
    {
        const response = await fetch(`http://localhost:8000/encounters/type?encounter_id=${firstPair}`,                    //gets and assigns primaryType from corresponding first pair
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json(); 
        firstPairType = result.primary_type; 
            
    } catch (error) 
    {
        console.error("Error fetching primary type for first pair:", error); 
        alert("Failed to retrieve primary type. Please try again later.");
    }

    try 
    {
        const response = await fetch(`http://localhost:8000/encounters/type?encounter_id=${secondPair}`,                    //gets and assigns primaryType from corresponding second pair
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json(); 
        secondPairType = result.primary_type; 
            
    } catch (error) 
    {
        console.error("Error fetching primary type for second pair:", error); 
        alert("Failed to retrieve primary type. Please try again later.");
    }
    
    if (firstPairGame == secondPairGame)         
    {
        if (firstPairType != secondPairType)
        {
            try     
            {
                const response = await fetch("http://localhost:8000/pairs", 
                {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json",                     //prepares post for game by JSON
                    },
                    body: JSON.stringify(gameData),
                });
            
                const result = await response.json();
            
                if (response.ok) 
                {
                    alert(`Pair created successfully with ID: ${result.pair_id}`);          //posts if successful
                    await updateLists(firstPairGame);
                } 
            
                else 
                {
                    console.error(result.message);                  //error if unsuccessful post
                    alert(`Error: ${result.message}`);
                }
            
            } catch (error) 
            {
                console.error("Error submitting form:", error);                 //error if form submission occurs
                alert("Failed to create the pair. Please try again later.");
            }
        }

        else
        {
            alert("Cannot create pair that has the same primary type")          //alerts if both pairs have the same type
        }
    }
    
    else
    {
        alert("Cannot create pair from different games")            //alerts if encounters exist in different games
    }
});



document.addEventListener("DOMContentLoaded", function ()               //displays encounters and pairs for selected game
{
    const gameSelect = document.getElementById("gameSelect");
    trainer1List = document.getElementById("trainer1List");             //initializes input from game select 
    trainer2List = document.getElementById("trainer2List");
    deadEncounterList = document.getElementById("deadEncounterList");                                                 

    gameSelect.selectedIndex = 0;               //sets selection to default

    async function fetchGames() 
    {
        try 
        {
            const response = await fetch("http://localhost:8000/games/list",            //fetches list of game names and their IDs
            {
                method: "GET",
                headers: 
                {
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();
            if (data.status === "success") 
            {
                gameSelect.innerHTML = '<option value="">Select a game</option>';       //if successful, clears previous options and appends all game values for selection
                data.games.forEach(game => 
                {
                    let option = document.createElement("option");
                    option.value = game.GameID;
                    option.textContent = game.GameName;
                    gameSelect.appendChild(option);
                });
            } 
            else 
            {
                console.error("Failed to fetch games:", data.message);          //error if pulled data is not successful
            }
        } catch (error) 
        {
            console.error("Error fetching games:", error);                  //error if fetch does not work
            alert("Failed to retrieve games. Please try again later.");
        }
    }

    
    gameSelect.addEventListener("change", function () 
    {
        if (this.value) 
        {
            updateLists(this.value);        //changes value for selected game
        }
        else 
        {
            trainer1List.innerHTML = ""; // Clear all lists if no game is selected
            trainer2List.innerHTML = "";
            pairsList.innerHTML = "";
            deadEncounterList.innerHTML = ""; 
        }
    });

    fetchGames();
});





document.getElementById("CreateGameButton").addEventListener("click", function ()           //toggles CreateGame area visibility
{
    const CreateGameForm = document.getElementById("CreateGameContainer");

    if (CreateGameForm.style.display === "none" || CreateGameForm.style.display === "") 
    {
        CreateGameForm.style.display = "block"; 
        this.textContent = "−"; 
    } 
    
    else 
    {
        CreateGameForm.style.display = "none"; 
        this.textContent = "+"; 
    }
});



document.addEventListener("DOMContentLoaded", function ()               // handles info button behavior for HTML
{
    const infoButton = document.getElementById("infoButton");
    const infoModal = document.getElementById("infoModal");
    const closeButton = document.querySelector(".close");

    // Ensure modal starts hidden
    infoModal.style.display = "none";

    // Open modal on button click
    infoButton.addEventListener("click", function () {
        infoModal.style.display = "flex";
    });

    // Close modal when close button is clicked
    closeButton.addEventListener("click", function () {
        infoModal.style.display = "none";
    });

    // Close modal when clicking outside the modal content
    window.addEventListener("click", function (event) {
        if (event.target === infoModal) {
            infoModal.style.display = "none";
        }
    });
});



document.getElementById("encountersButton").addEventListener("click", function ()       //handles encounter dropdown info behavior for HTML
{
    var dropdown = document.getElementById("encountersDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown when clicking outside
window.addEventListener("click", function (event) 
{
    if (!event.target.matches("#encountersButton")) 
    {
        document.getElementById("encountersDropdown").style.display = "none";
    }
});



document.addEventListener("DOMContentLoaded", function () {             //handles status button behavior for HTML
    const statusButton = document.getElementById("statusButton");
    const statusModal = document.getElementById("statusModal");
    const closeButton = document.querySelector("#statusModal .close");
    const changeStatusButton = document.getElementById("changeStatusButton");
    const statusText = document.getElementById("statusText");

    // Open status modal
    statusButton.addEventListener("click", function () 
    {
        statusModal.style.display = "flex";
    });

    statusModal.style.display = "none";

    // Show modal on button click
    statusButton.addEventListener("click", function () {
        statusModal.style.display = "flex";
    });

    // Close modal when clicking the close button
    closeButton.addEventListener("click", function () {
        statusModal.style.display = "none";
    });

    // Close modal if clicking outside of it
    window.addEventListener("click", function (event) {
        if (event.target === statusModal) {
            statusModal.style.display = "none";
        }
    });
});