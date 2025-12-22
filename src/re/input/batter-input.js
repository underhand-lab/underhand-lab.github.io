import { downloadCSV, readCSV } from "/src/csv/download.js"

class BatterInput {
    constructor() {
        this.load = false;
        this.name = "Player";
    }

    setDiv(div, func) {

        this.input = {
            'bb': div.getElementsByClassName('input_cumulative_bb')[0],

            'so': div.getElementsByClassName('input_cumulative_so')[0],
            'gb': div.getElementsByClassName('input_cumulative_gb')[0],
            'fb': div.getElementsByClassName('input_cumulative_fb')[0],

            'dh': div.getElementsByClassName('input_cumulative_dh')[0],
            'th': div.getElementsByClassName('input_cumulative_th')[0],
            'hr': div.getElementsByClassName('input_cumulative_hr')[0],
            'sh': div.getElementsByClassName('input_cumulative_sh')[0],
        }

        this.derived = {
            'pa': div.getElementsByClassName('input_cumulative_pa')[0],
            'ab': div.getElementsByClassName('input_cumulative_ab')[0],
            'hit': div.getElementsByClassName('input_cumulative_hit')[0],
            'ob': div.getElementsByClassName('input_cumulative_ob')[0],
            'tb': div.getElementsByClassName('input_cumulative_tb')[0],
            'ba': div.getElementsByClassName('input_cumulative_ba')[0],
            'oba': div.getElementsByClassName('input_cumulative_oba')[0],
            'slg': div.getElementsByClassName('input_cumulative_slg')[0],
            'ops': div.getElementsByClassName('input_cumulative_ops')[0],
        }

        this.sf = div.getElementsByClassName(
            'input_cumulative_sf')[0];
        this.sac = div.getElementsByClassName(
            'input_cumulative_sac')[0];
        
        for (let key in this.input) {
            (this.input[key]).addEventListener('change', () => {
                if (this.load) return;
                func();
            });
        }
        
        this.sf.addEventListener('change', () => {
            if (this.load) return;
            func();
        });

        this.sac.addEventListener('change', () => {
            if (this.load) return;
            func();
        });

        this.nameInput = div.getElementsByClassName('player-name')[0];

        if (this.nameInput) {
            this.nameInput.addEventListener('change', () => {
                this.setName(this.nameInput.value);
                if (this.load) return;
                func();
            });
        }

        const saveBtn = div.getElementsByClassName('save-csv')[0];
        const readBtnFile = div.getElementsByClassName('read-csv-file')[0];
        const readBtn = div.getElementsByClassName('read-csv')[0];

        saveBtn.addEventListener('click', () => {
            downloadCSV([this.getAbilityRaw()], this.getName());
        });


        readBtn.addEventListener('click', () => {
            readBtnFile.click();
        })
        readBtnFile.addEventListener('change', () => {
            readBtnFile.files[0].text().then((csv)=> {
                this.readJson(readCSV(csv)[0]);
                readBtnFile.value = "";
                func();
            });
        });
        this.getAbility();
    }

    setName(name) {
        this.name = name;
    }

    getName() {
        return this.name
    }

    getAbilityRaw() {

        let batterAbilityRaw = {};
        batterAbilityRaw['name'] = this.getName();

        let pa = 0;

        for (let key in this.input) {
            batterAbilityRaw[key] = parseInt(
                this.input[key].value);
            pa += batterAbilityRaw[key];
        }

        batterAbilityRaw['pa'] = pa;
        batterAbilityRaw['sf'] = parseInt(this.sf.value);
        batterAbilityRaw['sac'] = parseInt(this.sac.value);

        return batterAbilityRaw;
        
    }

    readJson(json) {
        this.load = true;
        for (let key in json) {
            if (key in this.input) {
                this.input[key].value = json[key];
            }
        }
        this.sac.value = 'sac' in json ? json['sac'] : 0;
        this.sf.value = 'sf' in json ? json['sf'] : 0;
        if (this.nameInput) {
            this.name = json['name'];
            this.nameInput.value = json['name'];
            this.nameInput.dispatchEvent(new Event('change'));
        }
        else {
            this.name = json['name'];
        }
        this.getAbility();
        this.load = false;
    }

    getAbility() {

        const batterAbilityRaw = this.getAbilityRaw();

        const pa = new Decimal(batterAbilityRaw['pa']);

        const batter_ability = {
            'bb': new Decimal(batterAbilityRaw["bb"]).div(pa),

            'so': new Decimal(batterAbilityRaw["so"]).div(pa),
            'gb': new Decimal(batterAbilityRaw["gb"]).div(pa),
            'fb': new Decimal(batterAbilityRaw["fb"]).div(pa),

            'sh': new Decimal(batterAbilityRaw["sh"]).div(pa),
            'dh': new Decimal(batterAbilityRaw["dh"]).div(pa),
            'th': new Decimal(batterAbilityRaw["th"]).div(pa),
            'hr': new Decimal(batterAbilityRaw["hr"]).div(pa),
        }

        const hit = batterAbilityRaw["sh"]
            + batterAbilityRaw["dh"]
            + batterAbilityRaw["th"]
            + batterAbilityRaw["hr"];

        const ob = hit + batterAbilityRaw["bb"];

        const tb = batterAbilityRaw["sh"]
            + batterAbilityRaw["dh"] * 2
            + batterAbilityRaw["th"] * 3
            + batterAbilityRaw["hr"] * 4;

        this.sac.max = Math.min(batterAbilityRaw["gb"]);
        this.sf.max = Math.min(pa - ob, batterAbilityRaw["fb"]);

        this.sac.value = Math.min(this.sac.max, this.sac.value);
        this.sf.value = Math.min(this.sf.max, this.sf.value);

        const ab = pa - batterAbilityRaw["bb"]
            - parseInt(this.sac.value) - parseInt(this.sf.value);

        this.derived['pa'].innerHTML = pa;
        this.derived['ab'].innerHTML = ab;
        this.derived['hit'].innerHTML = hit;
        this.derived['ob'].innerHTML = ob;
        this.derived['tb'].innerHTML = tb;

        const oba = (ob / (pa - this.sac.value));
        const slg = (tb / ab);

        this.derived['ba'].innerHTML = (hit / ab).toFixed(3);
        this.derived['oba'].innerHTML = oba.toFixed(3);
        this.derived['slg'].innerHTML = slg.toFixed(3);
        this.derived['ops'].innerHTML =
            (oba + slg).toFixed(3);

        for (let key in batter_ability) {
            batter_ability[key] = parseFloat(batter_ability[key]);
        }
        return batter_ability;
        
    }
}

export { BatterInput }