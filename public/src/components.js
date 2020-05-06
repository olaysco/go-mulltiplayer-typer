class ProgressRing extends HTMLElement {
  constructor() {
    super();
    const stroke = this.getAttribute("stroke");
    const radius = this.getAttribute("radius");
    const progress = this.getAttribute("progress");
    const svgstyle = this.getAttribute("progress-style");
    this._max = parseInt(this.getAttribute("max"));
    const normalizeRadius = radius - stroke * 2;
    this._circumference = normalizeRadius * 2 * Math.PI;
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <svg
      height="${radius * 2}"
      width="${radius * 2}"
      >
        <circle
            stroke="red"
            stroke-dasharray="${this._circumference} ${this._circumference}"
            stroke-width="${stroke}"
            fill="transparent"
            r="${normalizeRadius}"
            cx="${radius}"
            cy="${radius}"
            style="stroke-dashoffset:${this._circumference}"
            />
            <text x="${(radius * 2) / 2}" y="${(radius * 2) / 2}" 
                dominant-baseline="middle" text-anchor="middle">
                ${0}
            </text>
        </svg>
        <style>
            circle {
                transition: stroke-dashoffset 0.35s;
                transform: rotate(-90deg);
                transform-origin: 50% 50%
            }
            text{
                font-size:${radius / 24}rem;
                fill: white
            }
            ${svgstyle}
        </style>
        `;
    this.setProgress(progress);
  }

  setProgress(percent) {
    const value = this._max - (percent / 100) * this._max;
    const offset = this._circumference - (percent / 100) * this._circumference;
    const circle = this._root.querySelector("circle");
    this._root.querySelector("text").innerHTML = value;
    circle.style.strokeDashoffset = offset;
  }

  static get observedAttributes() {
    return ["progress"];
  }

  attributeChangedCallback(name, oldvalue, newValue) {
    if (name == "progress") {
      this.setProgress(newValue);
    }
  }
}

window.customElements.define("progress-ring", ProgressRing);
