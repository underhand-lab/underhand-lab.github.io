class PopUp {

    constructor(target, openButton, closeButton) {
        this.target = target;

        openButton.addEventListener('click', () => {
            this.open();
        });

        closeButton.addEventListener('click', () => {
            this.close();
        });
        
    }

    open() {
        this.target.style.display = "block";
    }

    close() {
        this.target.style.display = "none";
    }

}

export { PopUp }