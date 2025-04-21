function createEnum(keys) {
    const enumObj = {};
    keys.forEach((key, index) => {
        enumObj[key] = index;
        enumObj[index] = key;
    });
    enumObj.names = keys;
    return enumObj;
}

class Pattern {
    #reset() {
        this.type = 0;
        this.color = 0;
    }

    constructor(type, color) {
        this.#reset();

        this.type = type;
        this.color = color;
    }

    getCords() {
        const x = (this.type + 1) * -80;
        const y = this.color * -156;
        return {'x': x, 'y': y};
    }

    asHtml() {
        const cords = this.getCords();
        return Object.assign(document.createElement('div'), {
            'className': 'layer',
            'style': `background-position: ${cords.x}px ${cords.y}px`,
        });
    }
}

const PatternType = createEnum(
    ['roundel', 'baseDexterCanton', 'baseSinisterCanton', 'chiefDexterCanton', 'chiefSinisterCanton', 'perFess', 'base', 'chief', 'perPale', 'paleDexter', 'pale', 'paleSinister', 'fess', 'cross', 'bendSinister', 'bend', 'saltire', 'perBendSinister', 'perBend', 'invertedChevron', 'chevron', 'lozenge', 'chiefIndented', 'baseIndented', 'bordureIndented', 'bordure', 'paly', 'fieldMasoned', 'gradient', 'creeperCharge', 'skullCharge', 'flowerCharge', 'thing', 'perBendInverted', 'perBendSinisterInverted', 'baseGradient', 'perFessInverted', 'perPaleInverted', 'globe', 'snout']
);
const Color = createEnum(
    ['white', 'orange', 'magenta', 'lightBlue', 'yellow', 'lime', 'pink', 'gray', 'lightGray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black']
);

const BannerColor = {
    [Color.white]: 'rgb(189, 193, 193)',
    [Color.orange]: 'rgb(189, 97, 21)',
    [Color.magenta]: 'rgb(151, 58, 143)',
    [Color.lightBlue]: 'rgb(43, 136, 165)',
    [Color.yellow]: 'rgb(192, 163, 45)',
    [Color.lime]: 'rgb(97, 150, 21)',
    [Color.pink]: 'rgb(183, 105, 128)',
    [Color.gray]: 'rgb(53, 60, 62)',
    [Color.lightGray]: 'rgb(118, 118, 114)',
    [Color.cyan]: 'rgb(15, 118, 118)',
    [Color.purple]: 'rgb(104, 37, 139)',
    [Color.blue]: 'rgb(44, 50, 129)',
    [Color.brown]: 'rgb(99, 63, 37)',
    [Color.green]: 'rgb(71, 94, 15)',
    [Color.red]: 'rgb(133, 34, 28)',
    [Color.black]: 'rgb(21, 21, 23)',
};


class Banner {
    #reset() {
        this.patterns = [];
        this.color = undefined;
    }

    constructor(color) {
        this.#reset();
        this.color = color;
    }

    addPattern(type, color) {
        this.patterns.push(new Pattern(type, color));
    }

    getPattern(index) {
        return this.patterns[index];
    }

    setPattern(index, type, color) {
        this.patterns[index].type = type;
        this.patterns[index].color = color;
    }

    asHtml(x, y) {
        const delay = x*0.05 + y*0.07;

        const banner = Object.assign(document.createElement('div'), {
            'className': 'banner',
            'style': `background-color: ${this.color}; z-index: ${1000 - y}; animation-delay: ${delay}s`,
        });

        let parentElement = banner;
        for (let i = 0; i < this.patterns.length; ++i) {
            let pattern = this.patterns[i].asHtml();
            parentElement.appendChild(pattern);
            parentElement = pattern;
        }

        const banner_shadow = Object.assign(document.createElement('div'), {
            'className': 'banner-shadow',
        });
        parentElement.append(banner_shadow);
        return banner;
    }
}

class Block {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.banner = null;
        this.selected = false;
    }

    addBanner(color = undefined) {
        if (this.banner) return;
        this.banner = new Banner(color);
        this.update();
    }

    asHtml() {
        const blocksColumn = Object.assign(document.createElement('div'), {
            'className': 'blocks-column',
            'id': this.id,
        });
        if (this.selected) blocksColumn.classList.toggle('selected');

        const stone = Object.assign(document.createElement('img'), {
            'src': './static/images/stone.png',
            'className': 'block',
        });
        blocksColumn.appendChild(stone);

        if (this.banner !== null) blocksColumn.appendChild(this.banner.asHtml(this.x, this.y));
        return blocksColumn;
    }

    update() {
        const oldBlocksColumn = document.getElementById(this.id);
        const parentDiv = document.getElementById(this.id).parentElement;
        parentDiv.replaceChild(this.asHtml(), oldBlocksColumn);
    }
}


class Board {
    #reset() {
        this.id = 0;
        this.rows = 0;
        this.cols = 0;
        this.blocks = [];
        this.selectedBlock = null;
        this.selectedPattern = null;
        this.bannerPlacing = false;
        this.selectedColor = null;
    }

    constructor(rows, cols) {
        this.#reset(); 

        this.rows = rows;
        this.cols = cols;
    }

    start() {
        for (let y = 0; y < this.rows; ++y) {
            const row = new Array();
            for (let x = 0; x < this.cols; ++x) {
                row.push(new Block(x, y, this.id++));
            }
            this.blocks.push(row);
        }

        this.createPatternButtons();  
        this.createColorButtons();
    }

    createPatternButtons() {
        const patterns_buttons = document.getElementById("patterns");
        {
            const button = Object.assign(document.createElement('div'), {
                'id': 'bannerBase',
                'className': 'pattern-button',
                'onclick': () => {
                    if (this.selectedPattern) {
                        this.selectedPattern.classList.remove('select');
                        this.selectedPattern = null;
                    } 
                    this.bannerPlacing = !this.bannerPlacing;
                    button.classList.toggle('select'); 
                    this.selectedPattern = this.bannerPlacing ? button : null;
                },
            });
            const shadow = Object.assign(document.createElement('div'), {
                'className': 'pattern-shadow',
            });
            button.appendChild(shadow);
            patterns_buttons.appendChild(button);
        }

        for (let type of PatternType.names) {
            const button = Object.assign(document.createElement('div'), {
                'id': type,
                'className': 'pattern-button',
                'onclick': () => {
                    this.bannerPlacing = false;
                    if (this.selectedPattern == button) {
                        this.selectedPattern.classList.remove('select');
                        this.selectedPattern = null;
                    } else {
                        if (this.selectedPattern !== null) {
                            this.selectedPattern.classList.remove('select');
                        }
                        button.classList.add('select');
                        this.selectedPattern = button;
                    }
                },
            });
            const x = (PatternType[type] + 1) * -40;
            const y = Color.black * -78;
            const pattern = Object.assign(document.createElement('div'), {
                'className': 'pattern',
                'style': `background-position: ${x}px ${y}px`,
            });
            const shadow = Object.assign(document.createElement('div'), {
                'className': 'pattern-shadow',
            });
            pattern.appendChild(shadow);
            button.appendChild(pattern);
            patterns_buttons.appendChild(button);
        }
    }

    createColorButtons() {
        const colors_buttons = document.getElementById("colors");
        for (let color of Color.names) {
            const button = Object.assign(document.createElement('div'), {
                'id': color,
                'className': 'color-button',
                'onclick': () => {
                    if (this.selectedColor === button) return;
                    if (this.selectedColor !== null) {
                        this.selectedColor.classList.remove('select');
                        this.selectedColor = null;
                    }
                    this.selectedColor = button;
                    button.classList.add('select');

                    const patternButtons = document.getElementById("patterns");
                    for (let patternButton of patternButtons.children) {
                        if (patternButton.id == 'bannerBase') {
                            patternButton.style = `background-color: ${BannerColor[Color[color]]}`;
                            continue;
                        }
                        const pattern = patternButton.querySelector('.pattern');
                        const x = (PatternType[patternButton.id] + 1) * -40;
                        const y = Color[color] * -78;
                        pattern.style = `background-position: ${x}px ${y}px`
                    }
                },
            });
            const x = Color[color] * -32;
            const dye = Object.assign(document.createElement('img'), {
                'className': 'color',
                'src': './static/images/pixel.png',
                'width': 32,
                'height': 32,
                'style': `background-position: ${x}px 0px`,
                'className': 'tooltip',
            });
            button.appendChild(dye);
            colors_buttons.appendChild(button); 
        }
    }

    addRow() {
        const row = new Array(this.cols);
        for (let x = 0; x < this.cols; ++x) {
            row[x] = new Block(x, this.rows, this.id++);
        }
        this.rows += 1;
        this.blocks.push(row);

        this.update();
    }

    removeRow() {
        if (this.rows <= 1) return;

        this.rows -= 1;
        this.blocks.pop();

        this.update();
    }

    addColumn() {
        for (let y = 0; y < this.rows; ++y) {
            this.blocks[y].push(new Block(this.cols, y, this.id++));
        }
        this.cols += 1;

        this.update();
    }

    removeColumn() {
        if (this.cols <= 1) return;

        this.cols -= 1;
        for (let y = 0; y < this.rows; ++y) {
            this.blocks[y].pop();
        }

        this.update();
    }

    update() {
        this.blocksDiv.replaceChildren();
        this.asHtml().forEach((x) => {this.blocksDiv.appendChild(x)});
    }

    asHtml() {
        const board = [];
        for (let y = 0; y < this.rows; ++y) {
            let blocksRow = Object.assign(document.createElement('div'), {
                'className': 'blocks-row',
            });
            for (let x = 0; x < this.cols; ++x) {
                const block = this.blocks[y][x];
                block.selected = this.selectedBlock === block;
                let blocksColumn = block.asHtml();
                blocksColumn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (this.bannerPlacing) {
                        block.banner =  new Banner(BannerColor[Color[this.selectedColor.id]]);
                    }

                    if (this.selectedPattern !== null) {
                        block.banner.addPattern(PatternType[this.selectedPattern.id], Color[this.selectedColor.id]);
                    }
                    this.update();
                    return;

                    this.selectedBlock = block;

                    if (block.selected === false) return;

                    document.getElementById("add-banner").onclick = () => {
                        block.addBanner(BannerColor[Color.white])
                    };
                    document.getElementById("remove-banner").onclick = () => {
                        block.banner = null;
                        block.update();
                    };
                });
                blocksRow.appendChild(blocksColumn);
            }
            board.push(blocksRow);
        }
        window.oncontextmenu = (e) => {
            if (!this.selectedBlock) return;
            e.preventDefault();
            this.selectedBlock = null;
            document.getElementById("add-banner").onclick = null;
            document.getElementById("remove-banner").onclick = null;
            this.update();
        };
        return board;
    }
}

let board = null;
document.addEventListener("DOMContentLoaded", () => {
    board = new Board(3, 3);
    const blocks = document.getElementById('blocks');
    board.blocksDiv = blocks;
    board.start();

    if (!blocks) {
        throw new Error('Can\'t get element `blocks`. Try to reload the page!');
    }

    blocks.replaceChildren();

    document.getElementById("add-row").addEventListener("click", () => {
        board.addRow();
    });

    document.getElementById("remove-row").addEventListener("click", () => {
        board.removeRow();
    });

    document.getElementById("add-column").addEventListener("click", () => {
        board.addColumn();
    });

    document.getElementById("remove-column").addEventListener("click", () => {
        board.removeColumn();
    });

    board.update();
});
