class PopUp {

    constructor(targetElement, openBtn) {
        this.target = targetElement;

        const closeBtn = targetElement.
            getElementsByClassName('close-btn')[0];

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.open();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }
        
    }

    open() {
        this.target.style.display = "block";
    }

    close() {
        this.target.style.display = "none";
    }
    addCloseEvent(event) {
        
        const closeBtn = this.target.
            getElementsByClassName('close-btn')[0];
        if (closeBtn) {
            closeBtn.addEventListener('click', event);
        }
    }


}

export { PopUp }