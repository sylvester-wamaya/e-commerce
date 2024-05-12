class WebhooksController < ApplicationController
    #skip_before_action :verify_authenticity_token 
    skip_forgery_protection

    def stripe
        stripe_secret_key = Rails.application.credentials.dig(:stripe, :secret_key)
        stripe.api_key = stripe_secret_key
        payload = request.body.read
        sig_header = request.env['HTTP_STRIPE_SIGNATURE']
        endpoint_secret = Rails.application.credentials.dig(:stripe, :webhook_secret)
        event = nil

        begin
            event = Stripe::Webhook.construct_event(
                payload, sig_header, endpoint_secret)
        rescue JSON::ParserError => e
            status 400
            return
        rescue Stripe::SignatureVerificationError => e
            # Invalid signature
            puts "Webhook Signature verification failed"
            status 400
            return
        end

        # Handle the event
        case event['type']
        when 'checkout.session.completed'
            session = event.data.object
            shipping_deatils = session["shipping_details"]
            if shipping_details
            address = "#{shipping_details['address']['line1']} #{shipping_details['address']['city']}, #{shipping_details['address']['state']} #{shipping_details['address']['postal_code']}, #{shipping_details['address']['country']}"
            else
                address = ""
            end
            order = Order.create!(address: address, customer_email: session["customer_details"]["email"], total: session["amount_total"], fulfilled: false)
            full_session = Stripe::Checkout::Session.retrieve({
                id: session["id"],
                expand: ['line_items']
            })
            line_items = full_session.line_items
            line_items.each do |item|
                product = Stripe::Product.retrieve(item["price"]["product"])
                product_id = product["metadata"]["product_id"].to_i
                OrderProduct.create!(order: order, product_id: product_id, quantity: item["quantity"], size: product["metadata"]["size"])
                ProductStock.find(product["metadata"]["product_stock_id"]).decrement!(:amount, item["quantity"])
            end
            handle_checkout_session(session)
        when 'payment_intent.succeeded'
            payment_intent = event.data.object
            handle_payment_intent_succeeded(payment_intent)
        when 'payment_intent.payment_failed'
            payment_intent = event.data.object
            handle_payment_intent_failed(payment_intent)
        when 'charge.succeeded'
            charge = event.data.object
            handle_charge_succeeded(charge)
        when 'charge.failed'
            charge = event.data.object
            handle_charge_failed(charge)
        else
            puts "Unhandled event type: #{event['type']}"
        end

        render json: { message: 'success' }
    end

    private

    def handle_checkout_session(session)

        puts "Checkout session completed"
        puts "Session: #{session}"
    end

    def handle_payment_intent_succeeded(payment_intent)
        puts "Payment intent succeeded"
        puts payment_intent
    end

    def handle_payment_intent_failed(payment_intent)
        puts "Payment intent failed"
        puts payment_intent
    end

    def handle_charge_succeeded(charge)
        puts "Charge succeeded"
        puts charge
    end

    def handle_charge_failed(charge)
        puts "Charge failed"
        puts charge
    end
end