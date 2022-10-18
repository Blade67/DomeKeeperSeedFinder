import fs from "fs";

const dirs = fs.readdirSync("./dome_keeper_seeds/snl/", "utf-8").filter((e) => !e.includes("."));
console.log(dirs);

let vectors = [];

for (let dir in dirs) {
    let decrypted;
    if (fs.existsSync("./dome_keeper_seeds/snl/" + dirs[dir] + "/savegame_0._decrypted.json")) {
        decrypted = JSON.parse(
            fs.readFileSync("./dome_keeper_seeds/snl/" + dirs[dir] + "/savegame_0._decrypted.json", "utf-8")
        );
    } else if (fs.existsSync("./dome_keeper_seeds/snl/" + dirs[dir] + "/savegame_0_decrypted.json")) {
        decrypted = JSON.parse(
            fs.readFileSync("./dome_keeper_seeds/snl/" + dirs[dir] + "/savegame_0_decrypted.json", "utf-8")
        );
    } else {
        continue;
    }
    const objectData = decrypted.Objects["100"];

    let props = {};
    for (let entry of objectData) {
        if (!entry.hasOwnProperty("meta.name")) continue;
        if (!entry.hasOwnProperty("coord")) continue;
        let [x, y] = entry.coord.replace("Vector2( ", "").replace(" )", "").split(", ");
        props[`${entry["meta.name"]}`] = {
            Vector: { x: Number(x), y: Number(y) },
        };
    }

    Object.keys(props).forEach((v, i) => {
        props[v]["score"] = Math.abs(props[v].Vector.x) / 2 + props[v].Vector.y;
    });

    let score = 999999;
    let distance = 0;
    if (props.hasOwnProperty("MushroomCave")) {
        score =
            props["RelicChamber"].score +
            props["MushroomCave"].score +
            Math.abs(props["RelicChamber"].Vector.x - props["MushroomCave"].Vector.x) / 2 +
            Math.abs(props["RelicChamber"].Vector.y - props["MushroomCave"].Vector.y);
        distance =
            Math.abs(props["RelicChamber"].Vector.x - props["MushroomCave"].Vector.x) / 2 +
            Math.abs(props["RelicChamber"].Vector.y - props["MushroomCave"].Vector.y);
    }

    vectors.push({
        ...props,
        seed: dirs[dir],
        score,
        distance,
    });
}

vectors.sort((a, b) => a.score - b.score);

fs.writeFileSync("vectors.json", JSON.stringify(vectors, null, 4));
