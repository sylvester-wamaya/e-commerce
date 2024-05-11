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
  clear() {
    localStorage.removeItem('cart')
    window.location.reload()
    // this.element.innerHTML = ''
    // const totalEl = document.createElement('div')
    // totalEl.innerText = `Total: $0.00`
    // let totalContaner = document.getElementById('total')
    // totalContaner.appendChild(totalEl)
  }

  removeFromCart(event) {
    const cart = JSON.parse(localStorage.getItem('cart'))
    const id = event.target.value
    const index = cart.findIndex(item => item.id === id)
    cart.splice(index, 1)
    localStorage.setItem('cart', JSON.stringify(cart))
    window.location.reload()
  }
  checkout() { 
    console.log('Checking out')
    const cart = JSON.parse(localStorage.getItem('cart'))
    const payload = {
      authenticity_token: "",
      cart: cart
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]').content
    fetch('/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify(payload)
    }).then(response => {
      if(response.ok) {
        window.location.href = body.url
      }
      else {
        const errorEl = document.createElement('div')
        errorEl.innerText = `Error checking out. ${body.error}`
        let errorContainer = document.getElementById('errorContainer')
        errorContainer.appendChild(errorEl)
      }
    }).then(data => {
      console.log(data)
    })

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const stripe = Stripe('pk_test_51J4Kb4D4X1tY5RgX4f3V3V7fJ8V7d2Zr2Qv9z7Z8iW2zvFQ4V0m4yqYVwVv9cLm5KQF5qJ6g1uG4L2w2t0YQ1X8b00J8JwJZv5')
    stripe.redirectToCheckout({
      lineItems: cart.map(item => ({price: item.priceId, quantity: item.quantity})),
      mode: 'payment',
      successUrl: 'http://localhost:3000/',
      cancelUrl: 'http://localhost:3000/cart'
    })
  }
}



