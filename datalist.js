const template = document.createElement("template")
template.innerHTML = `
<style>
.datalist-container{
    width: 300px;
}

.datalist-input{
    width: 100%;
    height: 20px;
    border-radius: 4px;
    outline: 0;
}

.options-container{
    display: none;
    width: 100%;
    max-height: 200px;
    border: 1px solid black;
    overflow-y: scroll;
}

.options-container__datalist-option{
    margin: 0px;
    padding: 5px 5px;
    cursor: pointer;
}

.options-container__datalist-option:hover{
    background-color: aquamarine;
}
</style>
<div class="datalist-container">
<input class="datalist-input" type="text" placeholder="Search"/>
<div class="options-container"> </div>
</div>
`
class SearchDatalist extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.optionsContainer = this.shadowRoot.querySelector(".options-container")
        this.datalistInput = this.shadowRoot.querySelector(".datalist-input")
        this._options;
        this.filteredOptions;
        this._selectedOption;
    }

    get options() {
        return this._options;
    }

    set options(value) {
        this._options = value;
        this.handleOptions(value)
    }

    handleOptions(options) {
        this.filteredOptions = [...options];
        this.fillOptionsContainer();
    }

    openOptionsContainer = () => {
        this.optionsContainer.style.display = "block";
    }

    hideOptionsContainer(value) {
        if (value) {
            this.optionsContainer.style.display = "none";
        }
    }

    fillOptionsContainer() {
        this.filteredOptions = this.filterOptions(this.datalistInput.value)
        const options = this.filteredOptions.map((el, index) => {
            return `
            <p class="options-container__datalist-option" tabindex="${index}" id="${el.id}">${el.name}</p>
            `
        }).join("")
        this.optionsContainer.innerHTML = options
        this.optionsEventListenerHandler()
    }

    filterOptions(text) {
        return this.options.filter(el => el.name.toLowerCase().includes(text.toLowerCase()));
    }

    optionsEventListenerHandler() {
        const options = this.optionsContainer.querySelectorAll("p")
        options.forEach(el => {
            el.addEventListener('click', (event) => {
                this._selectedOption = this.options.filter(el => el.id == event.target.id)[0]
                this.datalistInput.value = this._selectedOption.name
                this.fillOptionsContainer()
                this.hideOptionsContainer(true)
                this.catchSelectedInfo(this._selectedOption)
                // return this._selectedOption
            })
        })
    }

    catchSelectedInfo(selectedOption) {
        const MessageEvent = new CustomEvent("clickedOption", selectedOption)
        this.dispatchEvent(MessageEvent)
    }

    async connectedCallback() {
        this.datalistInput.addEventListener('focus', this.openOptionsContainer)
        this.datalistInput.addEventListener('blur', (event) => {
            if (event.relatedTarget && event.relatedTarget.className.includes('datalist-option')) {
                this.hideOptionsContainer(false)
                return
            }
            this.hideOptionsContainer(true)
        })
        this.datalistInput.addEventListener("input", (event) => {
            this.fillOptionsContainer(event.target.value)
        })
    }

    disconnectedCallback() {
        this.datalistInput.removeEventListener('focus', this.openOptionsContainer)
    }

    static get observedAttributes() {
        return ["options"];
    }

    attributeChangedCallback(name, old, now) {
        if (name === "options") {
            this.getOptions(JSON.parse(now))
            this.fillOptionsContainer();
        }
    }
}

window.customElements.define("datalist-de-cbas", SearchDatalist)