let trainer1List, trainer2List ,pairsList, deadEncounterList, encountersDropdown;       //declares encounters, dead encounters,pairs, and any updated game info globally for updating purposes


let trainer1Name, trainer2Name;
let statusButton, statusModal, closeModal, statusText, form;                   //decalres variables for status button functionality
let currentGameID;


async function fetchEncounters(gameID)          //updates the encounters list for the specified game
{
    trainer1List = document.getElementById("trainer1List");             //initializes lists for display
    trainer2List = document.getElementById("trainer2List")
    deadEncounterList = document.getElementById("deadEncounterList");
    encountersDropdown = document.getElementById("encountersDropdown");           //references the dropdown container
    encountersDropdown.innerHTML = "";                                            //clears encounter list 

    try 
    {
        const response = await fetch(`http://localhost:8000/encounters?game_id=${gameID}`,            //fetches encounters and pairs for specified game
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
            const response = await fetch(`http://localhost:8000/trainers?game_id=${gameID}`,            //fetches trainer names for specified game
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

            document.querySelector("#trainer1Table h2").textContent = `${trainer1Name}'s Encounters`;
            document.querySelector("#trainer2Table h2").textContent = `${trainer2Name}'s Encounters`;

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
                    let deadEncounterBox = document.createElement("div");           //formatting for dead encounter boxes
                    deadEncounterBox.className = "dead-encounter-box";
                    deadEncounterBox.innerHTML = `
                        <h3>${encounter.Encounter}</h3>
                        <p><strong>Location:</strong> ${encounter.Location}</p>
                    `;
                    deadEncounterList.appendChild(encounterBox);                    // adds to dead encounters list if not 
                }

                let encounterItem = document.createElement("p");
                encounterItem.textContent = encounter.Encounter;            //creates element that stores the encounter name
                encounterItem.className = "dropdown-item";

                encountersDropdown.appendChild(encounterItem);              //calls encountersDropdown to append to encounters dropdown 
            });
        } 
    
        function createAddEncounterButton(listElement, trainerName)                  //creates a create feature for encounters for both trainer lists
        {
            let addEncounterBox = document.createElement("div");
            addEncounterBox.className = "encounter-box add-encounter";   
            addEncounterBox.setAttribute("data-trainer", trainerName);           
            addEncounterBox.innerHTML = `<h3>+</h3>`; 

            addEncounterBox.addEventListener("click", (event) => 
            {
                document.getElementById("CreateEncounterContainer").style.display = "flex";         //updates trainerValue depending on which encounter box is clicked

                const trainerValue = event.currentTarget.getAttribute("data-trainer");
                document.getElementById("trainerNameInput").value = trainerValue;   
            });

            listElement.appendChild(addEncounterBox);               //appends the create encounter box
        }
        createAddEncounterButton(trainer1List, trainer1Name);
        createAddEncounterButton(trainer2List, trainer2Name);                 //appends add encounter box to each list    
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

    const rosteredPairsList = document.getElementById("rosteredPairsList");
    const unrosteredPairsList = document.getElementById("unrosteredPairsList");             //defines lists for managing encounters

    try 
    {
        const response = await fetch(`http://localhost:8000/pairs?game_id=${gameID}`,            //fetches encounters and pairs for specified game
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
        rosteredPairsList.innerHTML = "";
        unrosteredPairsList.innerHTML = "";

        if (data.status === "success" && Array.isArray(data.pairs) && data.pairs.length > 0)            //if the data is correctly defined and contains encounters
        {
            for (const pair of data.pairs)          //runs for each pair in data
            {
                try 
                {
                    const response = await fetch(`http://localhost:8000/encounter/alive?encounter_id=${pair.FirstPair}`,            //fetches encounters and pairs for specified game
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
                    const response = await fetch(`http://localhost:8000/encounter/alive?encounter_id=${pair.SecondPair}`,            //fetches encounters and pairs for specified game
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
        
                let pairBox = document.createElement("div");                //code for front page pair box formatting
                pairBox.className = "pair-box";
                pairBox.innerHTML = `<h3>${firstPairName} & ${secondPairName}</h3>`;

                pairBox.addEventListener("click", () => 
                {
                    alert(`Pair: ${firstPairName} & ${secondPairName}\nRostered: ${pair.Rostered ? "Yes" : "No"}\nStatus: ${firstPairAlive && secondPairAlive ? "Alive" : "Fainted"}`);
                });
        
                if (firstPairAlive == 1 && secondPairAlive == 1)                //only appends encounters to lists if both encounters are alive        
                {
                    let newPairBox = document.createElement("div");                //code for manage menu pair box formatting
                    newPairBox.className = "pair-box";
                    newPairBox.innerHTML = `
                    <h3>${firstPairName} & ${secondPairName}</h3>
                    <p><strong>Rostered:</strong> ${pair.Rostered ? "Yes" : "No"}</p>
                `;
                    if (pair.Rostered)
                    {
                        pairsList.appendChild(pairBox);                     //adds rostered encounter to front page pairs list as well as rostered list in manage menu
                        rosteredPairsList.appendChild(newPairBox);
                    }
                    else
                    {
                        unrosteredPairsList.appendChild(newPairBox);        //adds unrosted encounter to the manage menu
                    }
                } 
            };
        } 

        function createAddPairButton(listElement) 
        {
            let addPairBox = document.createElement("div");             //formats pair boxes
            addPairBox.className = "pair-box add-pair";   
            addPairBox.innerHTML = `<h3>+</h3>`; 
        
            addPairBox.addEventListener("click", () => 
            {
                document.getElementById("CreatePairContainer").style.display = "flex";     //shows the create pair modal
                
                updatePairEncounters();
            });
        
            listElement.appendChild(addPairBox);                //appends create pair button to pairsList
        }

        createAddPairButton(pairsList);                 //calls createAddPairButton to append creation box to list
    } catch
    {
        console.error("Error updating pair list:", error);                 //error if form submission occurs
        alert("Failed to update pair list. Please try again later.");
    }
}

async function updateLists(gameID)  //refreshes lists after any updates to the database
{
    pairsList = document.getElementById("pairsList");       //defines pairsList for clearing if the challenge is a nuzlocke
    currentGameID = gameID;

    fetchGameStatus(gameID);                               //updates status button logic for specified game

    if (!gameID) 
    {
        pairsList.innerHTML = "";
        return;
    }

    try 
    {
        const response = await fetch(`http://localhost:8000/game/challenge-type?game_id=${gameID}`,            //fetches encounters and pairs for specified game
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
            const gameID = currentGameID
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
                trainer_input: trainerValue
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

async function updatePairEncounters()
{
    const encountersT1 = document.getElementById("firstPair");
    const encountersT2 = document.getElementById("secondPair");

    let encountersList = [];                    
    let pairedEncountersList = [];          //initializes array for pair and encounter logic
    
    try 
    {
        const response = await fetch(`http://localhost:8000/encounters?game_id=${currentGameID}`,                 //fetches encounters for specified gameID      
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json(); 
        encountersList = data.encounters;               //stores fetched data into encounters
            
    } catch (error) 
    {
        console.error("Error fetching encounters:", error); 
        alert("Failed to retrieve encounters. Please try again later.");
    }

    try 
    {
        const response = await fetch(`http://localhost:8000/pairs?game_id=${currentGameID}`,                    //fetches pairs for specified gameID 
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json(); 
        pairedEncountersList = data.pairs;          //stores fetched data into pairedEncounters
            
    } catch (error) 
    {
        console.error("Error fetching encounters:", error); 
        alert("Failed to retrieve encounters. Please try again later.");
    }

    encountersT1.innerHTML = '<option value="" disabled selected>Select an Encounter</option>';             //clears list before updating
    encountersT2.innerHTML = '<option value="" disabled selected>Select an Encounter</option>';

    encountersList.forEach(pokemon =>                  //autofills pokemon data 
    {
        if((!pairedEncountersList.some(pair => Number(pair.FirstPair) === pokemon.EncounterID || Number(pair.SecondPair) === pokemon.EncounterID)) && pokemon.Alive)
        {
            let option = document.createElement("option");
            option.value = pokemon.EncounterID;                 //stores EncounterID as the value
            option.textContent = pokemon.Encounter;             //displays the encounters name as an option

            console.log("TrainerInput:", pokemon.TrainerInput, "| Trainer1:", trainer1Name, "| Trainer2:", trainer2Name);
            console.log(pokemon);

            if(pokemon.TrainerInput?.trim().toLowerCase() === trainer1Name?.trim().toLowerCase())
            {
                encountersT1.appendChild(option);
            }
            else if(pokemon.TrainerInput?.trim().toLowerCase() === trainer2Name?.trim().toLowerCase())
            {
                encountersT2.appendChild(option);
            }
        }
    });
}

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
        firstPairGame = result.game_id;                 //assigns gameID to the first pair
            
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
        secondPairGame = result.game_id;                        //assigns gameID to the second pair
            
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
        firstPairType = result.primary_type;                //assigns type to the first pair
            
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
        secondPairType = result.primary_type;               //assigns type to the second pair
            
    } catch (error) 
    {
        console.error("Error fetching primary type for second pair:", error); 
        alert("Failed to retrieve primary type. Please try again later.");
    }
    
    if (firstPairGame == secondPairGame)                //validates that both encounters exist in the same game
    {
        if (firstPairType != secondPairType)            //validates that both encounters are not the same type
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
    statusText = document.getElementById("statusText");                 //defines statusText to reset the status if no game is selected                                              

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
            encountersDropdown.innerHTML = "<p>Select game for encounters</p>";

            document.querySelector("#trainer1Table h2").textContent = `Trainer 1's Encounters`;
            document.querySelector("#trainer2Table h2").textContent = `Trainer 2's Encounters`;

            currentGameID = null;              //if no game is selected, sets currentGameID to nothing
        }
    });

    fetchGames();
});



async function fetchGameStatus(gameID)                  //fetches and displays current game status
{
    const changeStatusButton = document.getElementById("changeStatusButton");
    const statusText = document.getElementById("statusText");

    if (!gameID) 
    {
        statusText.textContent = "Please select a game";
        changeStatusButton.style.display = "none";      //hide change button if no game is selected
        return;
    }

    try 
    {
        const response = await fetch(`http://localhost:8000/game/status?game_id=${gameID}`,                 //fetches game status for specific gameID
        {
            method: "GET",
            headers: 
            {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) 
        {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success" && data.game_status) 
        {
            statusText.textContent = data.game_status;
            changeStatusButton.style.display = "block";                 //shows the button if a game is selected
        } 
        else 
        {
            statusText.textContent = "Status unavailable";              //shows an error if data is incorrectly fetched and stored
            changeStatusButton.style.display = "none";
        }
    } catch (error) 
    {
        console.error("Error fetching game status:", error);
        statusText.textContent = "Error fetching status";
    }
}



document.addEventListener("DOMContentLoaded", () =>             //handles status button behavior for HTML
{             
    const statusButton = document.getElementById("statusButton");
    const statusModal = document.getElementById("statusModal");                 //initializes modal variables
    const closeButton = document.querySelector("#statusModal .close"); 
    const statusText = document.getElementById("statusText");
    const form = document.getElementById("statusForm");

    async function changeGameStatus(event) 
    {
        event.preventDefault();                 //prevents frontend from running before backend is done

        const selectedStatus = document.querySelector('input[name="gameStatus"]:checked');              //read selected status from radio input

        try 
        {
            const response = await fetch(`http://localhost:8000/games/update-status`,           //updates game status for specified gameID
            {
                method: "PUT", 
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                {
                    game_id: currentGameID,
                    status: selectedStatus.value                    //gets the value from the selected radio input
                })
            });

            if (!response.ok) 
            {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === "success") 
            {
                statusText.textContent = selectedStatus.value;              //updates displayed status if update is a success
            } 
            else 
            {
                alert("Failed to update status.");          //error if update fails
            }
        } 
        catch (error) 
        {
            console.error("Error updating game status:", error);
            alert("Error updating game status.");
        }
    }

    statusButton.addEventListener("click", () =>    
    {
        if (!currentGameID) 
        {
            alert("Please select a game first.");               //alerts user to select a game before checking/altering status
            return;
        }

        statusModal.style.display = "flex";                     //shows status modal on click
        fetchGameStatus(currentGameID);                         //fetches game status when modal is opened
    });

    closeButton.addEventListener("click", () =>                 //closes modal when X is clicked          
    {
        statusModal.style.display = "none";
    });

    window.addEventListener("click", (event) =>                 //closes modal if area around modal is clicked
    {
        if (event.target === statusModal) 
        {
            statusModal.style.display = "none";
        }
    });

    form.addEventListener("submit", changeGameStatus);          //game status is updated once form is submitted
});



document.addEventListener("DOMContentLoaded", function ()               //handles create game button functionality
{
    const createGameModal = document.getElementById("CreateGameContainer");             //initializes modal varaibles
    const createGameButton = document.getElementById("CreateGameButton"); 
    const closeGameModal = document.querySelector("#CreateGameContainer .close"); 
    const cancelCreateGame = document.getElementById("cancelCreateGame");

    function toggleCreateGameModal()                        //toggles modal visibility
    {
        if (createGameModal.style.display === "none" || createGameModal.style.display === "") 
        {
            createGameModal.style.display = "flex";                                     //if modal is closed, open modal and deals with button display
            createGameButton.textContent = "−";  // Change button to "−"            
        } 
        
        else 
        {   
            closeCreateGameModal();             //if modal is open, call function to close modal
        }
    }

    function closeCreateGameModal() 
    {
        createGameModal.style.display = "none";                         //function that deals with close modal functionality and button display
        createGameButton.textContent = "+"; 
    }

    createGameButton.addEventListener("click", toggleCreateGameModal);          //when create game button is clicked, call function to toggle modal visibility

    closeGameModal.addEventListener("click", closeCreateGameModal);             //closes modal if X is clicked
    cancelCreateGame.addEventListener("click", closeCreateGameModal);           //closes modal if "cancel" is clicked

    createGameModal.addEventListener("click", (event) =>                        //closes modal if area outside of modal is clicked
    {
        if (event.target === createGameModal) 
        {
            closeCreateGameModal();
        }
    });
});



document.addEventListener("DOMContentLoaded", function ()           // handles encounter modal functionality
{
    const createEncounterModal = document.getElementById("CreateEncounterContainer");
    const createEncounterButton = document.getElementById("createEncounterButton");                 //initializes modal varaibles
    const closeEncounterModal = document.querySelector("#CreateEncounterContainer .close"); 
    const cancelCreateEncounter = document.getElementById("cancelCreateEncounter");

    function closeCreateEncounterModal() 
    {
        createEncounterModal.style.display = "none";                //closes modal when called
    }

    createEncounterButton.addEventListener("click", () => 
    {
        createEncounterModal.style.display = "flex";                //when create encounter button is clicked, open modal
    });

    closeEncounterModal.addEventListener("click", closeCreateEncounterModal);               //closes modal if X is clicked
    cancelCreateEncounter.addEventListener("click", closeCreateEncounterModal);             //closes modal if "cancel" is clicked

    createEncounterModal.addEventListener("click", (event) =>                               //closes modal if area outside of modal is clicked
    {
        if (event.target === createEncounterModal) 
        {
            closeCreateEncounterModal();
        }
    });
});



document.addEventListener("DOMContentLoaded", function ()                  //handles pair modal functionality
{
    const createPairModal = document.getElementById("CreatePairContainer");
    const createPairButton = document.getElementById("createPairButton");               //initializes modal varaibles
    const closePairModal = document.querySelector("#CreatePairContainer .close"); 
    const cancelCreatePair = document.getElementById("cancelCreatePair");

    function closeCreatePairModal() 
    {
        createPairModal.style.display = "none";             //closes modal when called
    }

    createPairButton.addEventListener("click", () => 
    {
        createPairModal.style.display = "flex";             //when create pair button is clicked, open modal 
    });

    closePairModal.addEventListener("click", closeCreatePairModal);             //closes modal if X is clicked
    cancelCreatePair.addEventListener("click", closeCreatePairModal);           //closes modal if "cancel" is clicked

    createPairModal.addEventListener("click", (event) =>                        //closes modal if area around modal is clicked
    {
        if (event.target === createPairModal) 
        {
            closeCreatePairModal();
        }
    });
});



document.addEventListener("DOMContentLoaded", function ()           //handles pair management menu button functionality
{
    const pairManagementModal = document.getElementById("pairManagementModal");
    const managePairButton = document.getElementById("managePairButton"); 
    const closePairModal = document.getElementById("closePairModal"); 

    function closePairManagementModal() 
    {
        pairManagementModal.style.display = "none"; 
    }

    managePairButton.addEventListener("click", () => 
    {
        pairManagementModal.style.display = "flex";             //when manage pairs button is clicked, open modal
    });

    closePairModal.addEventListener("click", closePairManagementModal);             //close modal if X is clicked

    pairManagementModal.addEventListener("click", (event) => 
    {
        if (event.target === pairManagementModal) {
            closePairManagementModal();                             //closes modal if area around modal is clicked
        }
    });
});

document.addEventListener("DOMContentLoaded", function ()       //handles info modal functionality
{
    const infoModal = document.getElementById("infoModal");
    const infoButton = document.getElementById("infoButton");               //initializes modal variables
    const closeInfoButton = document.querySelector("#infoModal .close");

    function closeInfoModal() 
    {
        infoModal.style.display = "none";               //close modal when called
    }

    infoButton.addEventListener("click", () => infoModal.style.display = "flex");           //when info button is clicked, open modal

    closeInfoButton.addEventListener("click", closeInfoModal);          //closes modal when X is clicked

    infoModal.addEventListener("click", (event) =>                      //closes modal if area around modal is clicked
    {
        if (event.target === infoModal) closeInfoModal();
    });
});



document.getElementById("encountersButton").addEventListener("click", function ()       //handles encounter dropdown info behavior for HTML
{
    var dropdown = document.getElementById("encountersDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

window.addEventListener("click", function (event)                   //closes modal if area around modal is clicked
{
    if (!event.target.matches("#encountersButton")) 
    {
        document.getElementById("encountersDropdown").style.display = "none";
    }
});
