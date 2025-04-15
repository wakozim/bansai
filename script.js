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
    ['roundel', 'baseDexterCanton', 'baseSinisterCanton', 'chiefDexterCanton', 'chiefSinisterCanton', 'perFess', ]
);
const PatternColor = createEnum(
    ['white', 'orange', 'purple', 'lightBlue', 'yellow']
);


let z_index = 1000;

class Banner {
    #reset() {
        this.patterns = [];
        this.color = undefined;
    }

    constructor(color) {
        this.#reset();
        this.color = color;;
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
            'style': `background-color: ${this.color}; z-index: ${z_index}; animation-delay: ${delay}s`,
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
       this.banner = new Banner(color);
    }

    asHtml() {
        const blocksColumn = Object.assign(document.createElement('div'), {
            'className': 'blocks-column',
            'id': this.id,
        });
        if (this.selected) blocksColumn.classList.toggle('selected');

        const stone = Object.assign(document.createElement('img'), {
            'src': './stone.png',
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
        this.z_index = 0;
        this.rows = 0;
        this.cols = 0;
        this.blocks = [];
        this.selectedBlock = null;
    }

    constructor(rows, cols) {
        this.#reset();

        this.z_index = 100_000;
        this.selectedBlock = 0;
        this.rows = rows;
        this.cols = cols;
        this.blocks = [];
        this.selectedBlock = null;

        for (let y = 0; y < this.rows; ++y) {
            const row = new Array();
            for (let x = 0; x < this.cols; ++x) {
                row.push(new Block(x, y, this.id++));
            }
            this.blocks.push(row);
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

                    this.selectedBlock = block;
                    this.update();

                    if (block.selected === false) return;

                    document.getElementById("add-banner").onclick = () => {
                        if (block.banner !== null) return;
                        block.banner = new Banner();
                        block.update();
                    };
                    document.getElementById("remove-banner").onclick = () => {
                        block.banner = null;
                        block.update();
                    };

                    for (name of PatternType.names) {
                        const button = document.getElementById(name);
                        if (button) {
                            const pattern = name;
                            button.onclick = () => {
                                if (block.banner === null) return;
                                block.banner.addPattern(PatternType[pattern], PatternColor.yellow);
                                this.update();
                            };
                        }
                    }
                });
                blocksRow.appendChild(blocksColumn);
            }
            board.push(blocksRow);
        }
        window.oncontextmenu = (e) => {
            e.preventDefault();
            this.selectedBlock = null;
            document.getElementById("add-banner").onclick = null;
            document.getElementById("remove-banner").onclick = null;
            this.update();
        };
        return board;
    }
}

const board = new Board(3, 3);

document.addEventListener("DOMContentLoaded", () => {
    const blocks = document.getElementById('blocks');
    board.blocksDiv = blocks;

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
    return;


    let blocks_row = Object.assign(document.createElement('div'), {
        'className': 'blocks-row',
    });

    let i = 0;
    addBanner(blocks_row, i++);
    addBanner(blocks_row, i++);
    addBanner(blocks_row, i++);

    blocks.appendChild(blocks_row);
    z_index--;

    blocks_row = Object.assign(document.createElement('div'), {
        'className': 'blocks-row',
    });

    addBanner(blocks_row, i++);
    addBanner(blocks_row, i++);
    addBanner(blocks_row, i++);

    blocks.appendChild(blocks_row);

    return;


    blocks.appendChild(blocks_row);
    z_index--;

    blocks_row = Object.assign(document.createElement('div'), {
        'className': 'blocks-row',
    });
    addBanner(blocks_row);
    addBanner(blocks_row);
    addBanner(blocks_row);

    blocks.appendChild(blocks_row);
});

function addBanner(blocks_row, i) {
    const banner = new Banner('#7a201b');
    banner.addPattern(PatternType.baseSinisterCanton, PatternColor.white);
    //banner.addPattern(PatternType.baseDexterCanton, PatternColor.white);
    banner.addPattern(PatternType.roundel, PatternColor.yellow);

    const blocks_column = Object.assign(document.createElement('div'), {
        'className': 'blocks-column',
    });
    blocks_row.appendChild(blocks_column);

    const stone = Object.assign(document.createElement('img'), {
        'src': './stone.png',
        'className': 'block',
    });
    blocks_column.appendChild(stone);

    blocks_column.appendChild(banner.asHtml(i/3, i%3));
}
