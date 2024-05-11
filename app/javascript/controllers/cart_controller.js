import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="cart"
export default class extends Controller {
  initialize() {
    console.log('Cart controller initialized')
    const cart = JSON.parse(localStorage.getItem('cart'))
    if (!cart) {
      return
    }
    let total = 0
    cart.forEach(item => {
      total += item.price * item.quantity
      const div = document.createElement('div')
      div.classList.add("mt-2")
      div.innerText = `Item: ${item.name} - $${item.price/100.0} - Size: ${item.size} - Quantity: ${item.quantity}`
      const deleteButton = document.createElement('button')
      deleteButton.innerText = "Remove"
      deleteButton.value = item.id
      deleteButton.classList.add("bg-gray-500", "text-white", "px-2", "py-1", "rounded", "ml-2")
      deleteButton.addEventListener('click', this.removeFromCart)
      div.appendChild(deleteButton)
      this.element.prepend(div)
    } )

    const totalEl = document.createElement('div')
    totalEl.innerText = `Total: $${total/100.0}`
    let totalContaner = document.getElementById('total')
    totalContaner.appendChild(totalEl)
  }
}
