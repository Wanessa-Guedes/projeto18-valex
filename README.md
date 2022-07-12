<h1 align=center> API DOCUMENTATION </h1>

<p align="center">
  <a href="https://github.com/Wanessa-Guedes/projeto18-valex.git">
    <img src="https://notion-emojis.s3-us-west-2.amazonaws.com/prod/svg-twitter/1f355.svg" alt="readme-logo" width="80" height="80">
  </a>

  <h3 align="center">
    Projeto18-Valex
  </h3>
</p>

## Usage

```bash
$ git clone https://github.com/Wanessa-Guedes/projeto18-valex.git

$ cd $nome-repositorio

$ npm install

$ npm run dev
```

API:

```
- ROTA CARD

- POST /card (autenticada)
    - Rota para criar um novo cartão (Route to create a new card)
    - headers: {"x-api-key": "<CADASTRADO NO BANCO (REGISTERED IN THE BANK)>"}
    - body: {"employeeId": <número (number)>,
             "cardType": "groceries" | "restaurant" | "transport" | "education" | "health"}
    
- POST /activatecard
    - Rota para ativar cartão (Route to activate card)
    - headers: {}
    - body: {"cardId": <número (number)>,
             "securityCode": "<123>" (string.length(3)),
             "password": "<0123>" (string.length(4))}
    
- GET /cardbalance/:cardId
    - Rota para listar o saldo e as transações realizadas com o cartão (Route to list balance and transactions performed with the card)
    - headers: {}
    - body: {}
    
- PUT /card/block/:cardId
    - Rota para bloquear um cartão (Route to block a card)
    - headers: {}
    - body: {"password": "<0123>" (string.length(4))}
    
- PUT /card/unblock/:cardId
    - Rota para desbloquear um cartão (Route to unblock a card)
    - headers: {}
    - body: {"password": "<0123>" (string.length(4))}
    
- ROTA TRANSACTIONS

- POST /recharge (autenticada)
    - Rota para recarregar um cartão (Route to recharge a card)
    - headers: { "x-api-key": "<$CADASTRADO NO BANCO ($REGISTERED IN THE BANK)>" }
    - body: {"amount": <número (number)> (greater than 0),
             "cardId": <número (number)>,
             "employeeId": <número (number)>}
    
- POST /payments
    - Rota para registrar, contabilizar e autorizar compras (Route to register, account and authorize payments)
    - headers: {}
    - body: {"password": "<0123>" (string.length(4)),
             "businessId": <número (number)>,
             "amount": <número (number)> (greater than 0),
             "cardId": <número (number)>}
```
