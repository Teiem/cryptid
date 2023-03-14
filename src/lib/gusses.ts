export default "";

const combinations = <T extends unknown>(arr: readonly T[]) => arr.flatMap((el, i) => arr.slice(i + 1).map(el2 => [el, el2]));

const terrains = [
    "green", "blue", "yellow", "grey", "purple"
] as const;

const animals = [
    "bear",
    "cougar",
];

export const shapes = [
    "triangle",
    "hexagon",
];

export const colors = [
    "green", "blue", "white", "black"
]

export type Rule = {
    data: string[];
    type: "animal" | "shape" | "color" | "terrain";
    dist: number;
}

export const guesses = (): Rule[] => [
    ...combinations(terrains).map(data => ({
        data,
        type: "terrain",
        dist: 0,
    })),
    ...terrains.map(data => ({
        data: [data],
        type: "terrain",
        dist: 1,
    })),
    {
        data: animals,
        type: "animal",
        dist: 1,
    },
    ...animals.map(data => ({
        data: [data],
        type: "animal",
        dist: 2,
    })),
    ...shapes.map(data => ({
        data: [data],
        type: "shape",
        dist: 2,
    })),
    ...colors.map(data => ({
        data: [data],
        type: "color",
        dist: 3,
    })),
] as Rule[];

export const indexToAnimal = [, "cougar", "bear"] as const;
export const indexToTerrain = ["blue", "green", "yellow", "grey", "purple"] as const;
