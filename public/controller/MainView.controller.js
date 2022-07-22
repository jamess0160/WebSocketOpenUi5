sap.ui.define([
    "./BaseController",
    "sap/ui/layout/form/SimpleForm"
],
    function (Controller, SimpleForm) {
        "use strict";

        var mensagemEnviada = false

        return Controller.extend("teste.socket.controller.MainView", {

            onInit: function () {
                this.setModel(new sap.ui.model.json.JSONModel(), "mensagens")
                this.setModel(new sap.ui.model.json.JSONModel(), "usuarios")
                this.setModel(new sap.ui.model.json.JSONModel(), "usuarioLogado")

                const socket = io();
                socket.on('connect', () => {
                    console.log("conectado como:", socket.id)
                    this.getModel("usuarioLogado").setData({ id: socket.id }, true)
                    this.pegarNome()
                })

                socket.on('attMensagem', (mensagens) => {
                    this.attMensagens(mensagens)
                })

                socket.on("nomes", (payload) => {
                    this.getModel("usuarios").setData(payload)
                })
                this.socket = socket
            },

            pegarNome: function () {
                let dialog = new sap.m.Dialog({
                    title: "Atenção",
                    content: new SimpleForm({
                        content: [
                            new sap.m.Label({ text: "Insira o Nome" }),
                            new sap.m.Input(this.getView().createId("nome"))
                        ]
                    }),
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Default,
                        text: "Enviar",
                        press: () => {
                            dialog.close()
                            let nome = this.byId("nome").getValue()
                            this.getModel("usuarioLogado").setData({ nome }, true)
                            this.socket.emit("attName", { nome })
                        }
                    })
                })
                dialog.open()
            },

            enviarMensagem: function (event) {
                let msg = event.getParameter("value")
                if (!msg) return

                let hora = new Date().toLocaleString('pt-br')
                let usuarioLogado = this.getModel("usuarioLogado").getData()
                this.socket.emit("msg", { hora, msg, nome: usuarioLogado.nome })
                event.getSource().setValue("")
                mensagemEnviada = true
            },

            attMensagens: function (mensagens) {
                this.getModel("mensagens").setData(mensagens)
                let remetente = this.getModel("usuarioLogado").getData().id
                this.byId("mensagens").getItems().forEach(item => {
                    let data = item.data("data")
                    if (data.origem_id == remetente) {
                        item.addStyleClass("remetente")
                    }
                })
                if (!mensagemEnviada) {
                    let notificacao = new Audio('../sons/notificacao.mp3')
                    notificacao.play()
                } else {
                    mensagemEnviada = false
                }
            }
        });
    });
