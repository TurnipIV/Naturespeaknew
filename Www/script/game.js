kaplay({
    width: 800,
    height: 600,
    background: [255, 255, 255],
});

layers([
    "bg",
    "game",
    "ui"
], "game");

loadSprite("MainText", "sprites/Text-NaturesPeak.png");
loadSprite("background", "sprites/Background-MainMenu.png");
loadSprite("playText", "sprites/Text-Play.png");
loadSprite("HTPText", "sprites/Text-HTP.png");
loadSprite("CreditsText", "sprites/Text-Credits.png");
loadSprite("MountainSnow", "sprites/Mountain-Snowcapped.png");
loadSprite("MountainPlain", "sprites/Mountain-Plain.png");
loadSprite("MountainFiji", "sprites/Mountain-Fiji.png");
loadSprite("Man1", "sprites/ManClimbing1.png");
loadSprite("Woman1", "sprites/WomanClimbing1.png");
loadSprite("ContinueText", "sprites/Text-Continue.png");
loadSprite("gamebackground", "sprites/Gamebackgrou.png");
loadSprite("greenhold", "sprites/GreenHold.png");
loadSprite("redhold", "sprites/RedHold.png");
loadSprite("yellowhold", "sprites/YellowHold.png");
loadSprite("stam_full", "sprites/Energy.png");
loadSprite("stam_empty", "sprites/zzz.png");

loadSprite("climb", "sprites/manspritesheet.png", {
    sliceX: 7,
    sliceY: 9,
    anims: {
        climb: { from: 0, to: 63, loop: false }
    }
});

let moves = 0;
let stamina = 12;
let startTime = Date.now();

scene("menu", () => {
    add([
        sprite("background"),
        pos(400, 300),
        anchor("center"),
        scale(0.4),
        layer("bg"),
    ]);
    
    add([
        sprite("MountainSnow"),
        pos(200, 11),
        scale(0.9),
        layer("bg"),
    ]);

    add([
        sprite("MountainPlain"),
        pos(450, 11),
        scale(0.9),
        layer("bg"),
    ]);

    add([
        sprite("MountainFiji"),
        pos(400, 64),
        anchor("center"),
        scale(0.9),
        layer("bg"),
    ]);

    add([
        rect(400, 80, { radius: 30 }),
        pos(400, 155),
        anchor("center"),
        color(255, 255, 255),
        area(),
    ]);
    
    add([
        sprite("MainText"),
        pos(400, 150),
        anchor("center"),
        scale(0.19),
    ]);

    const playButton = add([
        rect(200, 60, { radius: 30 }),
        pos(400, 250),
        anchor("center"),
        color(255, 255, 255),
        area(),
    ]);
    add([
        sprite("playText"),
        pos(400, 250),
        anchor("center"),
        scale(0.08),
    ]);

    playButton.onClick(() => {
        go("Character Select");
    });

    playButton.onHover(() => {
        playButton.color = rgb(240, 240, 240);
    });

    playButton.onHoverEnd(() => {
        playButton.color = rgb(255, 255, 255);
    });

    const htpButton = add([
        rect(200, 60, { radius: 30 }),
        pos(400, 350),
        anchor("center"),
        color(255, 255, 255),
        area(),
    ]);
    add([
        sprite("HTPText"),
        pos(400, 350),
        anchor("center"),
        scale(0.08),
    ]);

    htpButton.onClick(() => {
        go("howtoplay");
    });

    htpButton.onHover(() => {
        htpButton.color = rgb(240, 240, 240);
    });

    htpButton.onHoverEnd(() => {
        htpButton.color = rgb(255, 255, 255);
    });

    const creditsButton = add([
        rect(200, 60, { radius: 30 }),
        pos(400, 450),
        anchor("center"),
        color(255, 255, 255),
        area(),
    ]);
    add([
        sprite("CreditsText"),
        pos(400, 450),
        anchor("center"),
        scale(0.08),
    ]);

    creditsButton.onClick(() => {
        go("credits");
    });

    creditsButton.onHover(() => {
        creditsButton.color = rgb(240, 240, 240);
    });

    creditsButton.onHoverEnd(() => {
        creditsButton.color = rgb(255, 255, 255);
    });
});

scene("Character Select", () => {
    const WomanPlayer = add([
        sprite("Woman1"),
        pos(500, 150),
        scale(0.8),
        area(),
    ]);

    const ManPlayer = add([
        sprite("Man1"),
        pos(200, 150),
        scale(0.8),
        area(),
    ]);

    ManPlayer.onClick(() => {
        stamina = 12;
        updateStaminaUI(stamina);
        spawnedHolds.length = 0;
        go("game");
    });

    WomanPlayer.onClick(() => {
        stamina = 12;
        updateStaminaUI(stamina);
        spawnedHolds.length = 0;
        go("game");
    });

    onKeyPress("escape", () => {
        go("menu");
    });
});

scene("Map Select", () => {
    add([
        text("Map Selection Screen"),
        pos(400, 300),
        anchor("center"),
    ]);

    onKeyPress("escape", () => {
        go("menu");
    });
});

const screenWidth = 800;
const screenHeight = 600;

const easyZone = {
    xMin: 0,
    xMax: screenWidth,
    yMin: 400,
    yMax: 600,
};

const mediumZone = {
    xMin: 0,
    xMax: screenWidth,
    yMin: 200,
    yMax: 400,
};

const hardZone = {
    xMin: 0,
    xMax: screenWidth,
    yMin: 0,
    yMax: 200,
};

function randomPosIn(zone) {
    return vec2(
        rand(zone.xMin, zone.xMax),
        rand(zone.yMin, zone.yMax)
    );
}

const spawnedHolds = [];

function overlaps(posA, posB, radius = 40) {
    return posA.dist(posB) < radius * 2;
}

function randomNonOverlappingPos(zone, maxAttempts = 20) {
    for (let i = 0; i < maxAttempts; i++) {
        const p = randomPosIn(zone);

        let badSpot = false;

        for (const hold of spawnedHolds) {
            if (overlaps(p, hold.pos)) {
                badSpot = true;
                break;
            }
        }

        if (!badSpot) {
            return p;
        }
    }
    return randomPosIn(zone);
}

function spawnHoldsInZone(zone, spriteName) {
    const amount = randi(1, 3);

    for (let i = 0; i < amount; i++) {
        const p = randomNonOverlappingPos(zone);

        const hold = add([
            sprite(spriteName),
            pos(p),
            scale(0.25),
            rotate(45),
            anchor("center"),
            area(),
            layer("game"),
        ]);

        spawnedHolds.push(hold);

        hold.onClick(() => {
            moves++;

            const diff =
                spriteName === "greenhold" ? 1 :
                spriteName === "yellowhold" ? 2 :
                3;

            stamina -= diff;
            updateStaminaUI(stamina);

            if (stamina <= 0) {
                go("lose");
                return;
            }

            go("climbAnim", { next: "game" });
        });
    }
}

const MAX_STAMINA = 12;
let staminaSlots = [];

function createStaminaUI() {
    staminaSlots = [];

    for (let i = 0; i < MAX_STAMINA; i++) {
        const slot = add([
            sprite("stam_full"),
            pos(20 + i * 24, 20),
            scale(0.8),
            anchor("topleft"),
            fixed(),
            layer("ui"),
        ]);

        staminaSlots.push(slot);
    }
}

function updateStaminaUI(staminaValue) {
    for (let i = 0; i < MAX_STAMINA; i++) {
        if (staminaSlots[i]) {
            staminaSlots[i].sprite = i < staminaValue ? "stam_full" : "stam_empty";
        }
    }
}

scene("game", () => {
    spawnedHolds.length = 0;

    add([
        sprite("gamebackground"),
        pos(400, 300),
        anchor("center"),
        scale(0.8),
        layer("bg"),
    ]);

    spawnHoldsInZone(easyZone, "greenhold");
    spawnHoldsInZone(mediumZone, "yellowhold");
    spawnHoldsInZone(hardZone, "redhold");
});

scene("climbAnim", ({ next }) => {
    add([
        sprite("climb", { anim: "climb" }),
        pos(center()),
        anchor("center"),
        scale(1),
        layer("ui"),
    ]);

    wait(3, () => {
        go(next);
    });
});

scene("lose", () => {
    add([
        text("You ran out of stamina!"),
        pos(400, 300),
        anchor("center")
    ]);
});

scene("howtoplay", () => {
    add([
        text("How To Play instructions here"),
        pos(400, 300),
        anchor("center"),
    ]);
    
    onKeyPress("escape", () => {
        go("menu");
    });
});

scene("credits", () => {
    add([
        text("Credits go here"),
        pos(400, 300),
        anchor("center"),
    ]);
    
    onKeyPress("escape", () => {
        go("menu");
    });
});

createStaminaUI();
updateStaminaUI(stamina);

go("menu");

