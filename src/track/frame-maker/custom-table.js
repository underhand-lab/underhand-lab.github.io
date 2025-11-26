import { TableVisualizer } from "/src/visualizer/table.js"

class CustomTableFrameMaker {
    
    constructor(instance) {
        this.tableVisualizer = new TableVisualizer(instance);
        this.tableVisualizer.setDefault();
        this.analysisTool = null;
    }

    changeAnalysisTool(analysisTool) {
        this.analysisTool = analysisTool;
        this.setData(this.data);
    }

    setConf(conf) {
        
    }

    setData(data) {
        
        if (data == null) return;
        
        this.data = data;
        let tableData = null;

        if (this.analysisTool == null) tableData = data;
        else tableData = this.analysisTool.calc(data);

        this.tableVisualizer.setData(tableData);

    }

    drawImageAt(idx) {
        this.tableVisualizer.drawImageAt(idx);
    }

}

export { CustomTableFrameMaker }