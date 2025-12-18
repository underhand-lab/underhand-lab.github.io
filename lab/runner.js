class Runner {
    constructor() {

    }

    setDiv(div, func) {

        this.input = {

            'twohome': div.getElementsByClassName(
                'input_ratio_twohome')[0],
            'twohomeout': div.getElementsByClassName(
                'input_ratio_twohomeout')[0],

            'onethree': div.getElementsByClassName(
                'input_ratio_onethree')[0],

            'sf': div.getElementsByClassName(
                'input_ratio_sf')[0],
            'sfx_out': div.getElementsByClassName(
                'input_ratio_sfx_out')[0],

            'dp2x': div.getElementsByClassName(
                'input_ratio_dp2x')[0],
            'dp1x': div.getElementsByClassName(
                'input_ratio_dp1x')[0],
        }

        this.derived = {
            'sfx_stay': div.getElementsByClassName(
                'input_ratio_sfx_stay')[0],
            'twothree': div.getElementsByClassName(
                'input_ratio_twothree')[0],
            'onetwo': div.getElementsByClassName(
                'input_ratio_onetwo')[0],
            'dp': div.getElementsByClassName('input_ratio_dp')[0],
        }

        for (let key in this.input) {
            (this.input[key]).addEventListener('change', () => {
                func();
            });
        }

    }

    func(input, value, target, list) {
        let ret = new Decimal(1);

        for (let v in list) {
            ret = ret.minus(value[list[v]]);
        }

        this.derived[target].innerHTML = ret;
        value[target] = ret;

        for (let x in list) {
            let t = new Decimal(1);
            for (let y in list) {
                if (x == y) continue;
                t = t.minus(value[list[y]]);
            }
            input[list[x]].max = t;
        }

    }

    getAbility() {

        const runner_ability = {};

        for (let key in this.input) {
            const value = new Decimal(Math.min(
                this.input[key].value, this.input[key].max));
            runner_ability[key] = value;
            this.input[key].value = value;
        }

        runner_ability['sfx_stay'] = new Decimal(1).minus(
            runner_ability['sf']).minus(runner_ability['sfx_out']);
            
        this.func(this.input, runner_ability, 'sfx_stay',
            ['sfx_out', 'sf']);
        this.func(this.input, runner_ability, 'twothree',
            ['twohomeout', 'twohome']);
        this.func(this.input, runner_ability, 'onetwo',
            ['onethree']);
        this.func(this.input, runner_ability, 'dp',
            ['dp2x', 'dp1x']);

        return runner_ability;
        
    }
}

export { Runner }