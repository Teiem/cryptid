export function offset_distance(a: {x: number, y: number}, b: {x: number, y: number}) {
    let x1 = a.x;
    let y1 = a.y;
    let x2 = b.x;
    let y2 = b.y;

    const ac = offset_to_cube(x1,y1);
    const bc = offset_to_cube(x2,y2);
    const f = cube_distance(ac, bc);

    return f;
}

function offset_to_cube(row: number , col: number) {
    const x = col - (row - (row % 2)) / 2;
    const z = row;
    const y = -x-z;
    const f = [x,z,y] as const;

    return f;
}

function cube_distance(p1: readonly [number, number, number], p2: readonly [number, number, number]) {
    const a = Math.abs( p1[0] - p2[0]);
    const b = Math.abs( p1[1] - p2[1]);
    const c = Math.abs( p1[2] - p2[2]);
    const f =  Math.max(a,b,c);

    return f;
}