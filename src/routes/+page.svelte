<script lang="ts">
    import { colors, guesses, indexToAnimal, indexToTerrain, shapes, type Rule } from "$lib/gusses";
    import { map_arrays } from "$lib/2";
	import { browser } from "$app/environment";
	import { offset_distance } from "$lib/helper";

    let maps = [{
            map: 1,
            rotated: false,
        },
        {
            map: 2,
            rotated: false,
        },
        {
            map: 3,
            rotated: false,
        },
        {
            map: 4,
            rotated: false,
        },
        {
            map: 5,
            rotated: false,
        },
        {
            map: 6,
            rotated: false,
        },
    ];

    let _mapsData: number[][][];

    const helper = (x: number, y: number) => {
        const width1 = 2;

        const width2 = 6;
        const height2 = 3;

        const index1 = Math.floor(y / height2) * width1 + Math.floor(x / width2);
        const subArr = _mapsData[index1];

        const index2 = Math.floor(y % height2) * width2 + Math.floor(x % width2);
        return {
            type: indexToTerrain[subArr[index2][0]],
            animal: indexToAnimal[subArr[index2][1]],
        };
    };

    let mapsData: {
        type: "blue" | "green" | "yellow" | "grey" | "purple";
        animal: "cougar" | "bear" | undefined;
    }[][];
    // console.log(mapsData);

    type Building = {
        color: string;
        type: string;
        pos: Pos
    }

    let buildings: Building[] = [];

    // const width = 100 / 2;
    // const height = 85 / 2;
    const width = 48;
    const height = 41;
    const gap = 5;
    const scale = 0.75;

    const allRules = guesses();

    let players: boolean[][];
    const setPlayers = (count: number) => {
        players = Array(count).fill(0).map(player => Array(allRules.length).fill(true) as boolean[]);
    };
    // players[0] = players[0].filter(r => r.type === "shape" && r.data[0] === "hexagon")
    // console.log(players);

    interface HexagonField {
  x: number;
  y: number;
}

    let allFields: {
        x: number;
        y: number;
        type: "blue" | "green" | "yellow" | "grey" | "purple";
        animal: "cougar" | "bear" | undefined;
    }[];
    // console.log("allFields", allFields);
    const XYToPx = ({ x, y} : { x: number, y: number }) => ({
        x: x * (width + gap) * scale + width/2 - 25/2 - 8,
        y: y * (height + gap) + height/2 + 15/2 - (x % 2 ? 0 : height / 2) - 8,
    })

    let blockers: {
        x: number;
        y: number;
        color: string;
    }[] = [];
    type Pos = {
        x: number;
        y: number;
    }
    const NOT = (arr: {x: number, y: number}[]) => allFields.filter(({ x, y }) => arr.every(a => a.x !== x || a.y !== y));

    const readableRule = (rule: Rule) => rule.dist ? `within ${rule.dist} ${rule.type === "animal" ? "of an" : "of a"} ${rule.data.join(" or ")}` : rule.data.join(" or ");
    console.log(guesses().map(readableRule).map((el, i) => i + " - " + el).join("\n"));
    const getPossibleFields = (rules: Rule[]) => {

        const options: Pos[] = [];

        // console.log(rules.map(readableRule).map((el, i) => i + 1 + " - " + el).join("\n"));
        rules.forEach(rule => {
            if (rule.type === "shape") {
                const shape = rule.data[0];
                const dist = rule.dist;
                const fields = allFields.filter(({ x, y, type, animal }) => buildings.some(b => b.type === shape && offset_distance({ x: b.pos.x, y: b.pos.y }, { x, y }) <= dist));
                options.push(...fields);

            } else if (rule.type === "color") {
                const color = rule.data[0];
                const dist = rule.dist;
                const fields = allFields.filter(({ x, y, type, animal }) => buildings.some(b => b.color === color && offset_distance({ x: b.pos.x, y: b.pos.y }, { x, y }) <= dist));
                options.push(...fields);

            } else if (rule.type === "terrain") {
                const terrain = rule.data;
                const dist = rule.dist;
                const fields = allFields.filter(({ x, y, type }) => allFields.filter(field => offset_distance(field, { x, y }) <= dist).some(field => terrain.includes(field.type)));
                options.push(...fields);

            } else if (rule.type === "animal") {
                const animal = rule.data;
                const dist = rule.dist;
                const fields = allFields.filter(({ x, y, type }) => allFields.filter(field => offset_distance(field, { x, y }) <= dist).some(field => animal.includes(field.animal) ));
                options.push(...fields);
            }
        })

        // blockers.push(...NOT(options).map(field => {
        //             const { x, y } = XYToPx(field);
        //             return {
        //                 x,
        //                 y,
        //                 color: "red",
        //             }
        //         }));
        // TODO

        return options;
    };


    const ruleToBitFlag = (rules: Rule[]) => {
        return rules.map(rule => {
            const possibleFields = getPossibleFields([rule]);
            return allFields.map(field => possibleFields.some(f => f.x === field.x && f.y === field.y));
        });
    };

    let bitFlags: boolean[][];

    const createBitFlag = <T extends true | false>(value: T): T[] => Array(12 * 9).fill(value);

    const _findPossibleSolutions = (bitFlags: (boolean[] | undefined)[][], players: number, initial: boolean[] = createBitFlag(true), path: number[] = []): {
        path: number[];
        result: boolean[];
    }[] => {
        if (players === 0) return [{
            path,
            result: initial,
        }];

        const lastRuleIndex = path.at(-1) ?? -1;

        // console.log(bitFlags, players);

        return bitFlags[players - 1].flatMap((bitFlag, ruleIndex) => {
            if (!bitFlag) return [];
            // console.log(bitFlag);
            // if (ruleIndex <= lastRuleIndex) return [];
            if (path.includes(ruleIndex)) return [];

            const newBitFlag = initial.map((value, j) => value && bitFlag[j]);
            if (newBitFlag.every(v => v === false)) return [];

            return _findPossibleSolutions(bitFlags, players - 1, newBitFlag, [...path, ruleIndex]);
        });
    };

    const findPossibleSolutions = (bitFlags: (boolean[] | undefined)[][], players: number) => {
        return _findPossibleSolutions(bitFlags, players).filter(({ result }) => result.reduce((a, b) => +a + +b, 0) === 1);
    };

    // const unique = (arr: unknown[][]) => arr.;

    const renderPlayerOptions = () => {
        const playersBitFlags = players.map((rulesStatus) => rulesStatus.map((status, i) => status ? bitFlags[i] : undefined));
        // console.log("playersBitFlags", playersBitFlags);
        const possibleSolutions = findPossibleSolutions(playersBitFlags, players.length);
        // console.log("possibleSolutions", possibleSolutions);

        const possibleRulesForPlayers = players.map((rulesStatus, i) => {
            return [...new Set(possibleSolutions.map(({ path }) => path.at(-(i + 1)) as number))].sort((a, b) => a - b);
        });

        possibleRulesForPlayers.forEach((rules, playerI) => {
            players[playerI] = players[playerI].map((_status, ruleI) => rules.includes(ruleI));
        });

        // console.log("possibleRulesForPlayers", possibleRulesForPlayers);

        blockers = [];
        NOT([...new Set(possibleSolutions.flatMap(({ result }) => result.findIndex(Boolean)))].sort((a, b) => a - b).map(index => allFields[index])).forEach(field => {
            blockers.push({
                ...XYToPx(field),
                color: "red",
            })
        })
    };

    // const possibleSolutions = findPossibleSolutions(bitFlags, 4);
    // console.log(possibleSolutions);
    // console.log("possible Rules", [...new Set(possibleSolutions.flatMap(({ path }) => path))].sort((a, b) => a - b));
    // console.log("possible Fields", [...new Set(possibleSolutions.flatMap(({ result }) => result.findIndex(Boolean)))].sort((a, b) => a - b));

    // console.log("possible possibleSolutions with my rule", possibleSolutions.filter(({ path }) => path.includes(19)));
    // console.log("possible Rules", [...new Set(possibleSolutions.filter(({ path }) => path.includes(19)).flatMap(({ path }) => path))].sort((a, b) => a - b));
    // console.log("possible Fields", [...new Set(possibleSolutions.filter(({ path }) => path.includes(19)).flatMap(({ result }) => result.findIndex(Boolean)))].sort((a, b) => a - b));

    // NOT([...new Set(possibleSolutions.filter(({ path }) => path.includes(19)).flatMap(({ result }) => result.findIndex(Boolean)))].sort((a, b) => a - b).map(index => allFields[index])).forEach(field => {
    //     blockers.push({
    //         ...XYToPx(field),
    //         color: "red",
    //     })
    // })

    $: players && mapsData && renderPlayerOptions();

    if (browser) window.players = players;


    const fieldIsNot = ({ x, y }: Pos, player: number) => {
        players[player] = players[player].map((status, i) => [status, allRules[i]] as const).map(([status, rule]) => status && getPossibleFields([rule]).every(f => !(f.x === x && f.y === y)))
        console.log(players[player]);
    };

    const fieldIs = ({ x, y }: Pos, player: number) => {
        players[player] = players[player].map((status, i) => [status, allRules[i]] as const).map(([status, rule]) => status && getPossibleFields([rule]).some(f => f.x === x && f.y === y))
        console.log(players[player]);
    };

    console.log("fieldIsNot");
    // fieldIsNot({
    //    x: 7,
    //    y: 2,
    // }, 0)

    // fieldIs({
    //    x: 11,
    //    y: 4,
    // }, 0)

    let onFieldClickFunction: ((field: Pos) => void) | undefined;

    const fieldClicked = (field: Pos) => {
        if (state === "buildings") buildings = buildings.filter(({ pos }) => !(pos.x === field.x && pos.y === field.y));
        console.log(field);
        onFieldClickFunction?.(field);
        onFieldClickFunction = undefined;
    };

    let state: "map" | "buildings" | "players" | "game" = "map";

    if (browser) window.maps = () => maps;
    if (browser) window.mapsData = () => mapsData;

    let selectedIndex: number | undefined;
    let selectingOwnField: number | undefined = undefined;

    const openPlayers: boolean[] = [];

    let selectedBuilding: {
        color: string;
        type: string;
    } | undefined;

    let playerCount = 4;
</script>

{#if state === "map"}
    <button on:click={() => {
        state = "buildings";
        _mapsData = maps.map(({ map, rotated }) => map_arrays[(map - 1) + (rotated ? 6 : 0)]);
        mapsData = Array(9).fill(0).map((_, y) => Array(12).fill(0).map((_, x) => helper(x, y)));
        allFields = mapsData.map((row, y) => row.map((fields, x) => ({ ...fields, x, y }))).flat();
        bitFlags = ruleToBitFlag(guesses());
        localStorage.setItem("maps", JSON.stringify(maps));
    }}>Next: Buildings</button>
    <button on:click={() => {
        const _maps = localStorage.getItem("maps");
        if (_maps) {
            maps = JSON.parse(_maps);
        }
    }}>Load Last</button>
{:else if state === "buildings"}
    <button on:click={() => {
        localStorage.setItem("buildings", JSON.stringify(buildings));
        state = "players"
    }}>Next: Players</button>
    <button on:click={() => {
        const _buildings = localStorage.getItem("buildings");
        if (_buildings) {
            buildings = JSON.parse(_buildings);
        }
    }}>Load Last</button>
{:else if state === "players"}
    <button on:click={() => {
        setPlayers(playerCount);
        console.log("players", players);
        state = "game"
    }}>Next: Play</button>

    <span>Players: </span>
    <button on:click={() => playerCount--}>-</button>
    <span>{playerCount}</span>
    <button on:click={() => playerCount++}>+</button>
{/if}
<main>
    <div class="maps">
        {#each maps as { map, rotated }, i}
            {@const mapNumber = (map - 1) + (rotated ? 6 : 0)}
            <img src="map/{mapNumber}.png" alt="{mapNumber} " title="{mapNumber} " on:dblclick={() => {
                if (state !== "map") return;
                // maps[i].rotated = !maps[i].rotated;
                rotated = !rotated;
                console.log(rotated, maps[i].rotated);
            }}
            class:selected={i === selectedIndex}
            on:dragstart={e => {
                e.dataTransfer?.setData("text/plain", i.toString());
            }}
            draggable="true"
            on:drop={e => {
                const index = parseInt(e.dataTransfer?.getData("text/plain") || "");
                if (index !== undefined) {
                    const temp = maps[i];
                    maps[i] = maps[index];
                    maps[index] = temp;
                    selectedIndex = undefined;
                }
            }}
            on:dragover|preventDefault={e => {
                selectedIndex = i;
            }}
            >

        {/each}
    </div>

    {#if state === "game"}
    <div class="blockers">
        {#each blockers as { x, y, color }}
            <div class="blocker" style="--x:{x}px;--y:{y}px;">
                <svg height="40" width="40" viewBox="0 0 100 100">
                    <polygon
                        points="50 3,100 28,100 75, 50 100,3 75,3 25"
                        stroke="black"
                        fill="{color}"
                        stroke-width="3"
                    />
                </svg>
            </div>
        {/each}
    </div>
    {/if}

    {#if state !== "map"}
        <div class="buildings">
            {#each buildings as { color, type, pos }}
                {@const x = pos.x * (width + gap) * scale + width/2 - 25/2}
                {@const y = pos.y * (height + gap) + height/2 + 15/2 - (pos.x % 2 ? 0 : height / 2)}

                <div class="building" style="--x:{x}px;--y:{y}px;">
                {#if type === "triangle"}
                    <svg height="25" width="25" viewBox="0 0 100 100">
                        <polygon
                            points="50 15, 100 100, 0 100"
                            stroke="black"
                            fill="{color}"
                            stroke-width="3"
                        />
                    </svg>
                {:else}
                    <svg height="25" width="25" viewBox="0 0 100 100">
                        <polygon
                            points="50 3,100 28,100 75, 50 100,3 75,3 25"
                            stroke="black"
                            fill="{color}"
                            stroke-width="3"
                        />
                    </svg>
                {/if}
                </div>
            {/each}
        </div>
    {/if}


    {#if state !== "map"}
        <div class="clickers">
            {#each allFields as field}
            {@const { x, y } = XYToPx(field)}
            <div class="clicker" style="--x:{x}px;--y:{y}px;">
                <svg height="40" width="40" viewBox="0 0 100 100" on:click={() => fieldClicked(field)}>
                    <polygon
                        points="50 3,100 28,100 75, 50 100,3 75,3 25"
                        stroke="black"
                        fill="yellow"
                        stroke-width="3"
                    />
                </svg>
            </div>
            {/each}
        </div>
    {/if}

</main>

{#if state === "buildings"}
    <div class="buildingSelector">
        {#each shapes as type}
            {#each colors as color}
                <!-- {shape}-{color} -->
                <div
                class:selected={selectedBuilding?.type === type && selectedBuilding?.color === color}
                on:click={() => {
                    selectedBuilding = {
                        color,
                        type,
                    }
                    onFieldClickFunction = (pos) => {
                        selectedBuilding = undefined;

                        console.log("building", type, color, pos);
                        buildings.push({
                            color,
                            type,
                            pos,
                        });
                        buildings = buildings;
                        console.log(buildings);
                    };
                }}>
                    {#if type === "triangle"}
                        <svg height="25" width="25" viewBox="0 0 100 100">
                            <polygon
                                points="50 15, 100 100, 0 100"
                                stroke="black"
                                fill="{color}"
                                stroke-width="3"
                            />
                        </svg>
                    {:else}
                        <svg height="25" width="25" viewBox="0 0 100 100">
                            <polygon
                                points="50 3,100 28,100 75, 50 100,3 75,3 25"
                                stroke="black"
                                fill="{color}"
                                stroke-width="3"
                            />
                        </svg>
                    {/if}
                </div>
            {/each}
        {/each}
    </div>
{/if}

{#if state === "game"}
    <div class="players">
        {#each players as rules, i}
        <details bind:open={openPlayers[i]}>
            <summary>
                <h1>player {i}
                    <button on:click={() => {
                        console.log("is");
                        onFieldClickFunction = (field) => fieldIs(field, i);
                    }}>IS</button>
                    <button on:click={() => {
                        console.log("is not");
                        onFieldClickFunction = (field) => fieldIsNot(field, i);
                    }}>IS NOT</button>
                    <button on:click={() => {
                        openPlayers[i] = true;
                        selectingOwnField = i;
                        setTimeout(() => {
                            window.addEventListener("click", () => {
                            selectingOwnField = undefined;
                        }, { once: true });
                        }, 0);
                    }}>select</button>
                </h1>
            </summary>

            {#each rules as isPossible, ruleI}
                {#if selectingOwnField === i}
                    <button on:click={() => {
                        rules = rules.map((_, j) => j === ruleI ? true : false);
                        selectingOwnField = undefined;
                    }}>Select</button>
                {/if}
                <label><input type="checkbox" name="" id="" bind:checked={isPossible}> {ruleI} - {readableRule(allRules[ruleI])}</label> <br>
            {/each}
        </details>
        {/each}
    </div>
{/if}


<style>

    main {
        position: relative;
        size: 60px;
        height: 480px;
    }

    .maps {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(3, 1fr);
        width: min-content;
        height: min-content;
        position: absolute;
    }

    .buildings {
        position: absolute;
    }

    .building {
        position: absolute;
        transform: translate(var(--x), var(--y));
    }

    /* every second img */
    img:nth-child(2n) {
        transform: translateX(-13px);
    }

    img:nth-child(3),
    img:nth-child(4) {
        margin-top: -22.5px;
    }

    img:nth-child(5),
    img:nth-child(6) {
        margin-top: -45px;
    }

    .blocker {
        position: absolute;
        transform-origin: center center;
        transform: translate(var(--x), var(--y)) rotate(25deg);
    }

    .clicker {
        position: absolute;
        transform-origin: center center;
        transform: translate(var(--x), var(--y)) rotate(25deg);
        opacity: 0
    }

    .selected {
        outline: 3px dashed red;
        z-index: 1;
    }

    h1 {
        display: inline;
    }

    .buildingSelector {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(2, 1fr);
        width: min-content;
        gap: 0.5em;
    }
</style>