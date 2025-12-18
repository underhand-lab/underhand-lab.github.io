class Batter {
    constructor() {

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

        this.sac = div.getElementsByClassName(
            'input_cumulative_sacrifice')[0];
        
        for (let key in this.input) {
            (this.input[key]).addEventListener('change', () => {
                func();
            });
        }
        
        this.sac.addEventListener('change', () => {
            func();
        });

    }

    getAbility() {

        const batter_ability_raw = {};
        let pa = 0;

        for (let key in this.input) {
            batter_ability_raw[key] = parseInt(
                this.input[key].value);
            pa += batter_ability_raw[key];
        }

        const batter_ability = {
            'bb': parseFloat(batter_ability_raw["bb"]) / pa,

            'so': parseFloat(batter_ability_raw["so"]) / pa,
            'gb': parseFloat(batter_ability_raw["gb"]) / pa,
            'fb': parseFloat(batter_ability_raw["fb"]) / pa,

            'sh': parseFloat(batter_ability_raw["sh"]) / pa,
            'dh': parseFloat(batter_ability_raw["dh"]) / pa,
            'th': parseFloat(batter_ability_raw["th"]) / pa,
            'hr': parseFloat(batter_ability_raw["hr"]) / pa,
        }

        const hit = batter_ability_raw["sh"]
            + batter_ability_raw["dh"]
            + batter_ability_raw["th"]
            + batter_ability_raw["hr"];

        const ob = hit + batter_ability_raw["bb"];

        const tb = batter_ability_raw["sh"]
            + batter_ability_raw["dh"] * 2
            + batter_ability_raw["th"] * 3
            + batter_ability_raw["hr"] * 4;

        this.sac.max = Math.min(pa - ob,
            batter_ability_raw["fb"]
            + batter_ability_raw["gb"]);

        this.sac.value = Math.min(this.sac.max, this.sac.value);

        const ab = pa - batter_ability_raw["bb"] - parseInt(this.sac.value);

        this.derived['pa'].innerHTML = pa;
        this.derived['ab'].innerHTML = ab;
        this.derived['hit'].innerHTML = hit;
        this.derived['ob'].innerHTML = ob;
        this.derived['tb'].innerHTML = tb;

        this.derived['ba'].innerHTML = (hit / ab).toFixed(3);
        this.derived['oba'].innerHTML = (ob / pa).toFixed(3);
        this.derived['slg'].innerHTML = (tb / ab).toFixed(3);
        this.derived['ops'].innerHTML =
            ((ob / pa) + (tb / ab)).toFixed(3);

        return batter_ability;
        
    }
}

export { Batter }