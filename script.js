function createEnum(keys) {
    const enumObj = {};
    keys.forEach((key, index) => {
        enumObj[key] = index;
        enumObj[index] = key;
    });
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

const PatternType = createEnum(['roundel', 'baseDexterCanton', 'baseSinisterCanton', 'chiefDexterCanton', 'chiefSinisterCanton', 'perFess', ]);
const PatternColor = createEnum(['white', 'orange', 'purple', 'lightBlue', 'yellow']);


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

    asHtml() {
        const banner = Object.assign(document.createElement('div'), {
            'className': 'banner',
            'style': `background-color: ${this.color}; z-index: ${z_index}`,
        });
        
        let parentElement = banner;
        for (let i = 0; i < this.patterns.length; ++i) {
            let temp = this.patterns[i].asHtml();
            parentElement.appendChild(temp);
            parentElement = temp;
        }

        const banner_shadow = Object.assign(document.createElement('div'), {
            'className': 'banner-shadow',
        });
        parentElement.append(banner_shadow);
        return banner;
    }
}

class Board {
    #reset() {
        this.z_index = 0;
        this.rows = 0;
        this.cols = 0;
        this.blocks = [];
        this.selectedBlock = null;
    }

    constructor(rows, cols) {
        this.#reset();

        this.rows = 3;
        this.cols = 3;
        this.blocks = [];
        this.selectedBlock = 0;
    }
}


document.addEventListener("DOMContentLoaded", () => { 
    const blocks = document.getElementById('blocks');
    
    if (!blocks) {
        throw new Error('Can\'t get element `blocks`. Try to reload the page!');
    }

    blocks.replaceChildren();;

    
    let blocks_row = Object.assign(document.createElement('div'), {
        'className': 'blocks-row',
    });
    
    addBanner(blocks_row);
    addBanner(blocks_row);
    addBanner(blocks_row);

    blocks.appendChild(blocks_row);
    z_index--;
    
    blocks_row = Object.assign(document.createElement('div'), {
        'className': 'blocks-row',
    });
    
    addBanner(blocks_row);
    addBanner(blocks_row);
    addBanner(blocks_row);

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

function addBanner(blocks_row) {
    const banner = new Banner('rgb(255, 0, 0)');
    //banner.addPattern(PatternType.baseSinisterCanton, PatternColor.white);
    //banner.addPattern(PatternType.baseDexterCanton, PatternColor.white);
    //banner.addPattern(PatternType.roundel, PatternColor.yellow);
    
    const blocks_column = Object.assign(document.createElement('div'), {
        'className': 'blocks-column',
    });
    blocks_row.appendChild(blocks_column);

    const stone = Object.assign(document.createElement('img'), {
        'src': './stone.png',
        'className': 'block',
    });
    blocks_column.appendChild(stone);

    
    blocks_column.appendChild(banner.asHtml());    
}
