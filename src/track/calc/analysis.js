
import * as Calc from "./velocity.js"

class BallAnalysisTool {
    calc(data) {

        let tableData = {
            "속도(km/h)": [ null ],
            "각도(도)": [ null ]
        }

        for (let i = 1; i < data["rawImage"].length; i++) {
            tableData["속도(km/h)"].push(Calc.calcVelocity(
                data["ballData"][i - 1],
                data["ballData"][i],
                data["metaData"]["fps"], confInput.value));

            tableData["각도(도)"].push(Calc.calcAngle(
                data["ballData"][i - 1],
                data["ballData"][i], confInput.value));
        }
        
        return tableData

    }
}

export { BallAnalysisTool }