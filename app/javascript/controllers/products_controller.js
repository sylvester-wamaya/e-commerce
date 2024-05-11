import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="products"
export default class extends Controller {
  static values = {size: String, Product: Object}
  addToCart() {
    console.log("product: ", this.ProductValue)
  }
  selectSize(e) {
    this.sizeValue = e.target.value
      const selectedSizeEl = document.getElementById('selected-size')
      selectedSizeEl.innerText = `Selected Size: ${this.sizeValue}`
    
  };
}
