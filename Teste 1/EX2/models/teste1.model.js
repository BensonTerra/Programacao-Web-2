let products = [
  {"id": 1, "name": "Coca-Cola", "price": 2.5, "stock": 5, "type": "drink"},
  {"id": 2, "name": "Pepsi", "price": 2, "stock": 3, "type": "drink"},
  {"id": 3, "name": "Kit Kat", "price": 3, "stock": 2, "type": "snack"}
  ]
  let purchases = [
  {"id": 1, "id_product": 2, "inserted_money": 2, "received_money": 0},
  {"id": 2, "id_product": 1, "inserted_money": 3, "received_money": 0.5},
  {"id": 3, "id_product": 1, "inserted_money": 5, "received_money": 2.5}
  ]
  //Data will go here
  module.exports = {
    products,purchases
  }; 