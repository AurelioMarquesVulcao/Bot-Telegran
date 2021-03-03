# Impacta_Bot

### Cadastro de comandos

Use a url abaixo:
##### ***http://172.16.16.38:3305/variaveis.sistema***

```json
[{"text":"comando a ser aceito pelo Telegram",
"respose": "texto que será encaminhado junto a resposta de sua rota de consumo",
"rota":"url de consumo",
"method": "metodo da requisição, "GET", "POST", ou qualquer outro metodo.",
"data":"data a ser encaminhado na requisição",
"headers":"header a ser encaminhado na requisição",
"help":"Ao digitar help ou /help o Telegram vai listar todos os comandos que tenham esse parametro"
}]
```

exemplo de uso:

```json
[
  {
    "text": "/cpu_38",
    "response": "O consumo de recursos da CPU do Servidor 38 é :",
    "rota": "http://172.16.16.38:3338/cpu",
    "method": "GET",
    "help": "/cpu_38 -> Informa os dados de cpu do servidor 38"
  }
]
```

ou:

```json
[
  {
    "text": "/cpu_38",
    "response": "O consumo de recursos da CPU do Servidor 38 é :",
    "rota": "http://172.16.16.38:3338/cpu",
    "method": "GET",
    "help": "/cpu_38 -> Informa os dados de cpu do servidor 38"
  },
  {
    "text": "!statusApiBigData",
    "response": "healthcheck",
    "rota": "http://172.16.16.3:8083/houseKeeping/healthcheck/",
    "method": "GET",
    "data": {"servico":"teste"},
    "headers": {"chave":"123456"},
    "help": "!statusApiBigData -> informa status"
  }
]
```
