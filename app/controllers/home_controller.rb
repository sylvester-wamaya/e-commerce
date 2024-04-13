class HomeController < ApplicationController

    def index
        @orders = Order.where(fulfilled: false).order(created_at: :desc).take(5)
        @quick_stats = {
            sales: Order.where(created: Time.now.midnight..Time.now.now).count,
            revenue: Order.where(created: Time.now.midnight..Time.now.now).sum(:total).round(2),
            avg_sale: Order.where(created: Time.now.midnight..Time.now.now).average(:total).round(2),
            per_sale: OrderProduct.joins(:order).where(orders: {created: Time.now.midnight..Time.now.now}).average(:quantity).round(2)
        }
        @orders_by_day = Order.where('created >= ?', Time.now. - 7.days).order(:created_at)
        @orders_by_day = @orders_by_day.group_by { |order| order.created_at.to_date }
        @revenue_by_day = @orders_by_day.map { |day, orders| [day.strftime('%A'), orders.sum(&:total)] }
        if @revenue_by_day.count < 7
           days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

           data_hash.default = @revenue_by_day.to_h
           current_day = Date.today.strftime('%A')
           current_day_index = days_of_week.index(current_day)
           next_day_index = (current_day_index + 1)%days_of_week.legth

           ordered_days_with_current_last = days_of_week[next_day_index..-1] + days_of_week[0..next_day_index]

           complete_ordered_array_with_current_last = ordered_days_with_current_last.map { |day| [day, data_hash.fetch[day,0]] }

           @revenue_by_day = complete_ordered_array_with_current_last


        end
    end
end
