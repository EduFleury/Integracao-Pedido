angular
  .module('app', ['snk'])
  .controller('AppController', ['$q', '$timeout', '$element', 'Criteria', 'ObjectUtils', 'AngularUtil', 'KeyboardManager', 'MessageUtils', 'StringUtils', 'DateUtils', 'GridConfig', '$scope', 'AvisosUtils', 'SanPopup', 'ServiceProxy', 'SkApplicationInstance'
    , function($q, $timeout, $element, Criteria, ObjectUtils, AngularUtil, KeyboardManager, MessageUtils, StringUtils, DateUtils, GridConfig, $scope, AvisosUtils, SanPopup, ServiceProxy, SkApplicationInstance){
       
      var self = this;

      //Variáveis privadas
      var _codUsuLogado = UID;
      self.resourceID = "net.vtecno.integracao.vtec.eduardo";
      self.dsEdu;
 
      //Interceptors
      ObjectUtils.implements(self, IDynaformInterceptor);
      ObjectUtils.implements(self, IDatagridInterceptor);
      ObjectUtils.implements(self, IFilterPanelInterceptor);
      ObjectUtils.implements(self, IFormInterceptor);


      //Funcções
      self.onDynaformLoaded = onDynaformLoaded;
      self.abrirCentralProdutos = abrirCentralProdutos;
      self.executarBtnAcao = executarBtnAcao;
      self.AbrirPopup = AbrirPopup;
      self.GerarPedido = GerarPedido;


      init();

      function init() {

        console.log("Tela Sendo Executada, pela Funcao init()");
        
      }    

      function abrirCentralProdutos() {

        var linhasSelecionadas = self.dsEdu.getSelectedRecordsAsObjects(['CODPROD'], true);
  
        if (linhasSelecionadas.length == 0) {
          MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, "Não foram encontradas linhas Selecionadas para Executar o Processo de Desembramento de Quantidades");
              
        } else if (linhasSelecionadas.length > 1) {
          MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, "Selecionar apenas 1 registro para realizar o Processo de Busca pelo Produto");
  
        }else {
  
          linhasSelecionadas.forEach(function(row) {
  
            var pk = { CODPROD: row.CODPROD };   
            SkApplicationInstance.openApp("br.com.sankhya.core.cad.produtos", pk);
  
          });
          
        }
      }

      function onDynaformLoaded(dynaform, dataset) {

          console.log(dynaform);
          console.log(dataset);
          console.log("Executando função onDynaformLoaded");
          

          if (dataset.getEntityName() == 'AD_TCABVTEC') {
              self.dsEdu = dataset;
              self.dsEdu.initAndRefresh();

          }
      }

      function executarBtnAcao(){

        var linhasSelecionadas = self.dsEdu.getSelectedRecordsAsObjects(['NUMREG', 'CODPROD', 'QTDPROD'], true);
           
        let rowsRequest = [];

        if (linhasSelecionadas.length == 0) {
            MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, "Não foram encontradas linhas Selecionadas para Executar a Ação");
            return;
        } else {

            linhasSelecionadas.forEach(function(row) {

              rowsRequest.push({
                'field': [
                  {'fieldName': 'NUMREG', '\$': row.NUMREG},
                  {'fieldName': 'CODPROD', '\$': row.CODPROD},
                  {'fieldName': 'QTDPROD', '\$': row.QTDPROD}
                ]
              });
            
            });

            MessageUtils.simpleConfirm('Foram Selecionadas [' + linhasSelecionadas.length + '] propostas para serem aprovadas.\nDeseja continuar?').then(function(){
            
                let mRequestBody = {
                    "javaCall": {
                        "actionID": "107",
                        "refreshType": "ALL",
                        "rows": {
                            "row": rowsRequest 
                        }
                    }
                };
              
                console.log(mRequestBody);
                
                ServiceProxy.callService('mge@ActionButtonsSP.executeJava', mRequestBody)
                    .then(function(result){
                        
                        console.log("resultado do mge@ActionButtonsSP.executeJava");
                        //MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, "Executado com Sucesso");
                        self.dsEdu.refreshCurrentRow();

                    });
                

                //Refresh da Tela. 
                console.log("Após a Chamada de  mge@ActionButtonsSP.executeJava");
                self.dsEdu.refreshCurrentRow();
                

            }, function(reason){
                
                if (reason === 'no') {
                    //clicou no botão 'Não'
                }

                self.dsEdu.refreshCurrentRow();

            });

        }

      }

      function GerarPedido(){
        var linhasSelecionadas = self.dsEdu.getSelectedRecordsAsObjects();
        let rowsRequest = [];

        if (linhasSelecionadas.length == 0) {
            MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, "Não foram encontradas linhas Selecionadas para Executar a Ação");
            return;
        } else {

            linhasSelecionadas.forEach(function(row) {

              rowsRequest.push({
                'field': [
                  {'fieldName': 'NUMREG', '\$': row.NUMREG},
                ]
              });
            
            });

            MessageUtils.simpleConfirm('Foram Selecionadas [' + linhasSelecionadas.length + '] propostas para serem aprovadas.\nDeseja continuar?').then(function(){
            
                let mRequestBody = {
                    "javaCall": {
                        "actionID": "28",
                        "refreshType": "ALL",
                        "rows": {
                            "row": rowsRequest 
                        }
                    }
                };
              
                console.log(mRequestBody);
                
                ServiceProxy.callService('mge@ActionButtonsSP.executeJava', mRequestBody)
                    .then(function(result){
                        
                        console.log("resultado do mge@ActionButtonsSP.executeJava");
                        //MessageUtils.showInfo(MessageUtils.TITLE_INFORMATION, "Executado com Sucesso");
                        self.dsEdu.refreshCurrentRow();

                    });
                

                //Refresh da Tela. 
                console.log("Após a Chamada de  mge@ActionButtonsSP.executeJava");
                self.dsEdu.refreshCurrentRow();
                

            }, function(reason){
                
                if (reason === 'no') {
                    //clicou no botão 'Não'
                }

                self.dsEdu.refreshCurrentRow();

            });

        }
      }

      function AbrirPopup(){
        let popupInstance = SanPopup.open({
          title: 'Vincular Séries',
          templateUrl: ''+BASE_FOLDER+'popup/serieProduto.tpl.html',
          controller: 'SerieProdutoController',
          controllerAs: 'ctrl',
          size: 'lg',
          //height: '100',
          type: 'primary',
          enableBtnOk: true,
          okBtnLabel: 'Fechar',
          okBtnClass: 'btn-primary',
          showBtnCancel: false,
          //cancelBtnLabel: 'Fechar',
          resolve: {
              data: {
                  dsTGFEDUPOP: self.dsEdu
              }
          }
        });

        popupInstance.result.then(function (result) {
          //Refresh
          self.dsEdu.refreshCurrentRow();
        });

        console.log("Self DsEdu: ", self.dsEdu)
      }

  }]);