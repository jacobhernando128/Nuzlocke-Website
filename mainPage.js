document.getElementById("CreateGameButton").addEventListener("click", function () 
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

document.getElementById('CreateGame').addEventListener('submit', async (event) => 
{
    event.preventDefault();         //prevents frontend from running before backend is done

    const gameName = document.getElementById("GameName").value;
    const generation = document.getElementById("generation").value;
    const challengeType = document.querySelector('input[name="challengeType"]:checked').value;              //initializes variables from HTML user input
    const challengeNotes = document.getElementById("challengeNotes").value;

    const gameData =                   //creates a payload of the game data
    {
        game_name: gameName,
        generation: generation,
        challenge_type: challengeType,
        challenge_notes: challengeNotes,
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



document.addEventListener("DOMContentLoaded", async() =>
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

            const encounterData =                   //creates a payload of the encounter data
            {
                game_id: gameID,
                encounter: selectedPokemon.name,
                primary_type: primaryType,
                caught: caughtValue,
                alive: aliveValue,
                location: locationValue
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
                } 

                else 
                {
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



document.getElementById('CreatePair').addEventListener('submit', async (event) => 
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
    
    console.log(firstPairType);
    console.log(secondPairType);                //tester functions
    console.log(firstPairGame);
    console.log(secondPairGame);

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
    const encounterList = document.getElementById("encounterList");             //initializes input from game select and the encounter display
    let abortController = new AbortController(); 
    let latestRequestID = 0;                                                    //deals with different requests to display game data

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

    async function fetchEncounters(gameID) 
    {
        latestRequestID++;  // Increment request counter
        const requestID = latestRequestID; // Store unique ID for this request

        if (abortController) 
        {
            abortController.abort();            //aborts previous request
        }

        await new Promise(resolve => setTimeout(resolve, 50));  // Small delay to stabilize UI updates
        abortController = new AbortController();                // Create a new abort controller AFTER aborting the previous one
        const { signal } = abortController; 

        try 
        {
            const response = await fetch(`http://localhost:8000/games/encounters?game_id=${gameID}`,            //fetches encounters and pairs for specefied game
            {
                method: "GET",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                signal 
            });

            if (!response.ok) 
            {
                throw new Error(`HTTP error! Status: ${response.status}`);              //error if it cannot fetch
            }

            const data = await response.json();

            if (requestID !== latestRequestID)              // ensures current request is still the latest one before updating the UI
            {
                console.log("Outdated request ignored:", requestID);
                return; 
            }

            encounterList.innerHTML = ""; // Clear previous results

            if (data.status === "success") 
            {
                const encounterMap = new Map();
    
                data.encounters.forEach(encounter =>            //maps encounters if data is successfully pulled
                {
                    encounterMap.set(encounter.Encounter, 
                    {
                        name: encounter.Encounter,
                        type: encounter.Type,
                        pairedWith: encounter.PairedEncounter || null           //if pair doesn't exist, set null
                    });
                });
    
                encounterMap.forEach(encounter => 
                {
                    if (encounter.pairedWith && encounterMap.has(encounter.pairedWith))             //ensures pairs are properly assigned
                    {
                        encounterMap.get(encounter.pairedWith).pairedWith = encounter.name; 
                    }
                });
    
                encounterMap.forEach(encounter =>               //appends all encounters and their pairs for specefied game
                {
                    let listItem = document.createElement("li");
                    listItem.textContent = `Encounter: ${encounter.name} (Type: ${encounter.type}) - Paired with: ${encounter.pairedWith || "None"}`;
                    encounterList.appendChild(listItem);
                });
            } 
            else  
            {
                console.log("No encounters found for this game.");
                encounterList.innerHTML = "<li>No encounters found.</li>";      //displays message if no encounters are found
            }
        } catch (error) 
        {
            if (error.name === "AbortError") 
            {
                console.log("Previous request was aborted due to a new selection.");            //error for request handling
                return; 
            } 

            console.error("Error fetching encounters:", error);
            encounterList.innerHTML = "<li>Failed to load encounters. Try again.</li>";         //error for encounters not loading
        }
    }

    gameSelect.addEventListener("change", function () 
    {
        if (this.value) 
        {
            fetchEncounters(this.value);        //changes value for selected game
        }
        else 
        {
            encounterList.innerHTML = ""; // Clear the list if no game is selected
        }
    });

    fetchGames();
});
